// Clay Data Webhook handler
// Processes enriched data from Clay tables → upserts into clay_signals + accounts
// Returns SFDC-ready payloads so Clay can push directly to Salesforce
import { createClient } from '@supabase/supabase-js';
import { routeSignal } from './lead-router.js';
import { employeeCountToRange, normalizeAtsForSfdc } from './salesforce-sync.js';
import { logSfdcAction } from './sfdc_logger.js';
import { enrichDomainWithMoltSets } from './server/lib/moltsetsClient.js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// ── Field mapping: Clay column names → our Supabase columns ──
// Clay sends data with whatever column names Daniel configures.
// This map normalizes the most common variations.
const FIELD_MAP = {
  // Domain
  domain: 'company_domain',
  company_domain: 'company_domain',
  website: 'company_domain',
  company_website: 'company_domain',

  // Company
  company_name: 'company_name',
  company: 'company_name',
  name: 'company_name',

  // Employee count
  employee_count: 'employee_count',
  employees: 'employee_count',
  headcount: 'employee_count',
  company_headcount: 'employee_count',
  number_of_employees: 'employee_count',

  // Industry
  industry: 'industry',
  company_industry: 'industry',

  // Location
  hq_city: 'city',
  city: 'city',
  company_city: 'city',
  headquarters_city: 'city',
  hq_state: 'state',
  state: 'state',
  company_state: 'state',
  headquarters_state: 'state',
  hq_country: 'billing_country',
  country: 'billing_country',
  location: 'company_location',
  company_location: 'company_location',

  // ATS
  current_ats: 'current_ats',
  ats: 'current_ats',
  ats_provider: 'current_ats',

  // LinkedIn
  linkedin_url: 'linkedin_company_url',
  linkedin_company_url: 'linkedin_company_url',
  company_linkedin: 'linkedin_company_url',
  company_linkedin_url: 'linkedin_company_url',

  // Revenue
  revenue: 'revenue',
  annual_revenue: 'revenue',
  company_revenue: 'revenue',

  // Contact fields - VP/Director TA
  vp_ta_name: 'full_name',
  vp_ta_full_name: 'full_name',
  contact_name: 'full_name',
  full_name: 'full_name',
  first_name: 'first_name',
  last_name: 'last_name',
  vp_ta_email: 'email',
  contact_email: 'email',
  email: 'email',
  vp_ta_title: 'job_title',
  job_title: 'job_title',
  title: 'job_title',
  vp_ta_linkedin: 'linkedin_url',
  contact_linkedin: 'linkedin_url',
  linkedin: 'linkedin_url',
  vp_ta_phone: 'phone',
  contact_phone: 'phone',
  phone: 'phone',

  // Segmentation
  rippling_segment: 'audience_source',
  audience_source: 'audience_source',
  icp_tier: 'icp_tier',
  cadence_tag: 'cadence_tag',

  // Jobs
  active_jobs_count: 'open_roles',
  open_roles: 'open_roles',
  open_roles_count: 'open_roles',

  // SFDC reverse sync fields (Daniel's ownership pull)
  sf_account_owner: 'sf_account_owner',
  owner_id: 'sf_account_owner',
  ownerid: 'sf_account_owner',
  account_owner: 'sf_account_owner',
  sf_account_id: 'sf_account_id',
  account_id: 'sf_account_id',
  lifecycle_stage: 'lifecycle_stage',
  lifecycle_stage__c: 'lifecycle_stage',

  // Contact reverse sync fields
  sf_contact_id: 'sf_contact_id',
  contact_id: 'sf_contact_id',
  contact_owner: 'contact_owner',
  contact_owner_id: 'contact_owner',

  // UTM attribution fields
  utm_source: 'utm_source',
  utm_campaign: 'utm_campaign',
  utm_medium: 'utm_medium',
  utm_content: 'utm_content',
};

/**
 * Normalize a Clay row into our field names.
 * Handles case-insensitive matching and common variations.
 */
function normalizeRow(raw) {
  const normalized = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value === null || value === undefined || value === '') continue;
    const lowerKey = key.toLowerCase().replace(/\s+/g, '_');
    const mapped = FIELD_MAP[lowerKey];
    if (mapped) {
      normalized[mapped] = value;
    } else {
      // Keep unmapped fields in a metadata bucket
      if (!normalized._extra) normalized._extra = {};
      normalized._extra[key] = value;
    }
  }
  return normalized;
}

/**
 * Extract domain from various fields.
 */
function extractDomain(row) {
  let domain = row.company_domain || '';
  if (!domain && row.email) {
    domain = row.email.split('@')[1] || '';
  }
  // Clean domain
  domain = domain.toLowerCase().trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '');
  return domain || null;
}

/**
 * Compute size segment from employee count.
 */
function sizeSegment(count) {
  if (!count || count <= 0) return null;
  if (count <= 250) return 'SMB';
  if (count <= 500) return 'Mid-Market';
  return 'Enterprise';
}

/**
 * Process a single enriched row from Clay.
 * Upserts into both clay_signals (contact-level) and accounts (company-level).
 * Returns normalized data so the response can build SFDC-ready payloads.
 */
async function processRow(row) {
  const n = normalizeRow(row);
  const domain = extractDomain(n);

  if (!domain) {
    return { status: 'skipped', reason: 'no_domain' };
  }

  const empCount = parseInt(n.employee_count) || 0;
  const results = { domain, normalized: n, actions: [] };

  // ── 1. Upsert into accounts table (company-level) ──
  const accountUpdate = { domain };
  if (n.company_name) accountUpdate.company_name = n.company_name;
  if (empCount > 0) {
    accountUpdate.employee_count = empCount;
    accountUpdate.size_segment = sizeSegment(empCount);
  }
  if (n.industry) accountUpdate.industry = n.industry;
  if (n.current_ats) accountUpdate.current_ats = n.current_ats;
  if (n.city) accountUpdate.city = n.city;
  if (n.state) accountUpdate.state = n.state;
  if (n.company_location) accountUpdate.location = n.company_location;
  if (n.linkedin_company_url) accountUpdate.linkedin_company_url = n.linkedin_company_url;
  if (n.open_roles) accountUpdate.open_roles_count = parseInt(n.open_roles) || 0;
  if (n.audience_source) accountUpdate.audience_source = n.audience_source;
  if (n.icp_tier) accountUpdate.icp_fit = n.icp_tier;
  if (n.billing_country) accountUpdate.billing_country = n.billing_country;
  accountUpdate.website = `https://${domain}`;

  // Reverse sync fields (from Daniel's SFDC ownership pull)
  if (n.sf_account_owner) accountUpdate.sf_account_owner = n.sf_account_owner;
  if (n.sf_account_id) accountUpdate.sf_account_id = n.sf_account_id;
  if (n.lifecycle_stage) {
    accountUpdate.lifecycle_stage = n.lifecycle_stage;
    // Derive is_existing_customer from lifecycle stage
    const stage = n.lifecycle_stage.toLowerCase();
    if (stage === 'customer') {
      accountUpdate.is_existing_customer = true;
    } else if (stage === 'churned' || stage === 'prospect') {
      accountUpdate.is_existing_customer = false;
    }
  }

  // Detect reverse-sync-only payloads (ownership/lifecycle without enrichment data).
  // These must use UPDATE (not UPSERT) because UPSERT would try to insert a new row
  // and fail on NOT NULL constraints (company_name is required for new accounts).
  const isReverseSync = (n.sf_account_owner || n.sf_account_id || n.lifecycle_stage) && !n.company_name;

  if (isReverseSync) {
    // Pure reverse sync — only update existing accounts by domain
    const syncFields = {};
    if (n.sf_account_owner) syncFields.sf_account_owner = n.sf_account_owner;
    if (n.sf_account_id) syncFields.sf_account_id = n.sf_account_id;
    if (n.lifecycle_stage) {
      syncFields.lifecycle_stage = n.lifecycle_stage;
      const stage = n.lifecycle_stage.toLowerCase();
      if (stage === 'customer') {
        syncFields.is_existing_customer = true;
      } else if (stage === 'churned' || stage === 'prospect') {
        syncFields.is_existing_customer = false;
      }
    }

    const { error: syncErr } = await supabase
      .from('accounts')
      .update(syncFields)
      .eq('domain', domain);

    if (syncErr) {
      console.error(`[Clay] account reverse-sync error for ${domain}:`, syncErr.message);
    } else {
      results.actions.push('account_upserted');
    }
  } else {
    // Full enrichment — upsert (creates new accounts or updates existing)
    const { error: acctErr } = await supabase
      .from('accounts')
      .upsert(accountUpdate, { onConflict: 'domain', ignoreDuplicates: false });

    if (acctErr) {
      console.error(`[Clay] accounts upsert error for ${domain}:`, acctErr.message);
    } else {
      results.actions.push('account_upserted');
      // Fire async MoltSets enrichment to expand the buying committee
      const companyName = n.company_name || domain;
      enrichDomainWithMoltSets(domain, companyName).catch(err => console.error(err));
    }
  }

  // ── 2. Insert into clay_signals (contact-level, if we have contact data) ──
  const hasContact = n.email || n.full_name || (n.first_name && n.last_name);

  if (hasContact) {
    const fullName = n.full_name || [n.first_name, n.last_name].filter(Boolean).join(' ') || 'Unknown';
    const email = n.email || `careers@${domain}`;

    // Dedup check
    const { data: existing } = await supabase
      .from('clay_signals')
      .select('id, signal_score')
      .eq('email', email)
      .eq('company_domain', domain)
      .maybeSingle();

    if (existing) {
      // Update existing signal with new data
      const updateFields = {};
      if (n.job_title) updateFields.job_title = n.job_title;
      if (n.linkedin_url) updateFields.linkedin_url = n.linkedin_url;
      if (n.phone) updateFields.phone = n.phone;
      if (empCount > 0) updateFields.employee_count = empCount;
      if (n.industry) updateFields.industry = n.industry;
      if (n.current_ats) updateFields.current_ats = n.current_ats;
      // Always update SFDC IDs when available (keeps references current)
      if (n.sf_contact_id) updateFields.salesforce_contact_id = n.sf_contact_id;
      if (n.sf_account_id) updateFields.salesforce_account_id = n.sf_account_id;
      if (n.contact_owner) updateFields.salesforce_owner_id = n.contact_owner;
      // UTM attribution
      if (n.utm_source) updateFields.utm_source = n.utm_source;
      if (n.utm_campaign) updateFields.utm_campaign = n.utm_campaign;
      if (n.utm_medium) updateFields.utm_medium = n.utm_medium;
      if (n.utm_content) updateFields.utm_content = n.utm_content;
      // Bump score
      updateFields.signal_score = Math.min(100, (existing.signal_score || 50) + 10);

      const { error: updErr } = await supabase
        .from('clay_signals')
        .update(updateFields)
        .eq('id', existing.id);

      if (updErr) {
        console.error(`[Clay] signal update error for ${email}:`, updErr.message);
      } else {
        results.actions.push('signal_updated');
      }
    } else {
      // Insert new signal
      const signalRecord = {
        full_name: fullName,
        email: email,
        job_title: n.job_title || null,
        linkedin_url: n.linkedin_url || null,
        phone: n.phone || null,
        company_name: n.company_name || domain,
        company_domain: domain,
        company_location: n.company_location || [n.city, n.state].filter(Boolean).join(', ') || null,
        employee_count: empCount || null,
        current_ats: n.current_ats || null,
        industry: n.industry || null,
        signal_name: 'Clay Enrichment',
        signal_source: 'clay',
        signal_score: 70,
        signal_description: `Enriched via Clay. ${n.job_title ? `Title: ${n.job_title}.` : ''} ${n.current_ats ? `ATS: ${n.current_ats}.` : ''}`.trim(),
        icp_tier: n.icp_tier || 'warm',
        audience_source: n.audience_source || null,
        open_roles: parseInt(n.open_roles) || null,
        // SFDC IDs for dedup and audit
        salesforce_contact_id: n.sf_contact_id || null,
        salesforce_account_id: n.sf_account_id || null,
        salesforce_owner_id: n.contact_owner || null,
        hq_country: n.billing_country || null,
        // UTM attribution
        utm_source: n.utm_source || null,
        utm_campaign: n.utm_campaign || null,
        utm_medium: n.utm_medium || null,
        utm_content: n.utm_content || null,
      };

      const { error: insErr } = await supabase
        .from('clay_signals')
        .insert(signalRecord);

      if (insErr) {
        console.error(`[Clay] signal insert error for ${email}:`, insErr.message);
      } else {
        results.actions.push('signal_inserted');
      }
    }
  }

  return results;
}

/**
 * Main webhook handler.
 * Accepts a single record or an array of records from Clay.
 */
export async function handleClayWebhook(body, headers) {
  const startTime = Date.now();

  // Clay can send a single object or an array
  let rows = Array.isArray(body) ? body : (body.records || body.data || body.rows || [body]);
  // Filter out empty rows
  rows = rows.filter(r => r && typeof r === 'object' && Object.keys(r).length > 0);

  if (rows.length === 0) {
    console.log('[Clay] ⚠️ Empty payload received');
    return { status: 200, body: { ok: true, message: 'No records to process', processed: 0 } };
  }

  console.log(`[Clay] Processing ${rows.length} record(s)...`);

  const results = { processed: 0, skipped: 0, accounts_upserted: 0, signals_inserted: 0, signals_updated: 0, errors: [] };

  const routingResults = [];
  const sfdcRecords = [];

  for (const row of rows) {
    try {
      const result = await processRow(row);
      if (result.status === 'skipped') {
        results.skipped++;
      } else {
        results.processed++;
        if (result.actions?.includes('account_upserted')) results.accounts_upserted++;
        if (result.actions?.includes('signal_inserted')) results.signals_inserted++;
        if (result.actions?.includes('signal_updated')) results.signals_updated++;

        // Route signal to a rep if an account was touched
        let routing = { assigned: false };
        if (result.domain && (result.actions?.includes('account_upserted') || result.actions?.includes('signal_inserted'))) {
          try {
            routing = await routeSignal({
              domain: result.domain,
              triggeredBy: 'clay_webhook',
            });
            if (routing.assigned) routingResults.push({ domain: result.domain, assigned_rep_id: routing.repId, rep_name: routing.repName, sf_user_id: routing.sfUserId || null, sf_account_id: routing.sfAccountId || null, method: routing.method });
          } catch (routeErr) {
            // Don't fail the webhook if routing fails
            console.error(`[Clay] Routing error for ${result.domain}:`, routeErr.message);
          }
        }

        // ── Build SFDC-ready payload using exact Salesforce API field names ──
        // Daniel's Clay workflow can pass these straight to SFDC with zero translation.
        const n = result.normalized || {};
        const empCount = parseInt(n.employee_count) || 0;
        const fullName = n.full_name || [n.first_name, n.last_name].filter(Boolean).join(' ') || null;
        const nameParts = fullName ? fullName.split(' ') : [];

        const sfdcRecord = {
          // ── Account fields (exact SFDC API names) ──
          sfdc_account: {
            Id: routing.sfAccountId || null,
            Name: n.company_name || result.domain,
            Email_Domain_Name__c: result.domain,
            Website: `https://${result.domain}`,
            Amount_of_Employees__c: employeeCountToRange(empCount),
            Industry: n.industry || null,
            BillingCity: n.city || null,
            BillingState: n.state || null,
            BillingCountry: n.billing_country || 'United States',
            Current_ATS_Provider__c: n.current_ats ? normalizeAtsForSfdc(n.current_ats) : null,
            Company_LinkedIn__c: n.linkedin_company_url || null,
            Lifecycle_Stage__c: 'Prospect',
            AccountSource: 'Clay',
            // OwnerId — use sf_user_id if available, otherwise assigned_rep_id for manual mapping
            OwnerId: routing.sfUserId || null,
            Reassignment_Id__c: routing.repId || null,
          },
          // ── Contact fields (exact SFDC API names) ──
          sfdc_contact: n.email ? {
            FirstName: nameParts.slice(0, -1).join(' ') || nameParts[0] || null,
            LastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : (nameParts[0] || 'Unknown'),
            Email: n.email,
            Title: n.job_title || null,
            MobilePhone: n.phone || null,
            LinkedIn_URL__c: n.linkedin_url || null,
            MailingCountry: n.billing_country || 'United States',
            LeadSource: 'Outbound',
            // OwnerId inherits from Account in SFDC, but set explicitly for safety
            OwnerId: routing.sfUserId || null,
          } : null,
          // ── Routing metadata ──
          routing: {
            assigned_rep_id: routing.repId || null,
            rep_name: routing.repName || null,
            sf_user_id: routing.sfUserId || null,
            method: routing.method || null,
          },
        };

        // ── Admin Dashboard: SFDC Dry Run Logging ──
        if (!routing.sfAccountId) {
          // If we didn't find an exact Account ID during routing, it's ambiguous or new
          await logSfdcAction(
            'HALTED',
            result.domain,
            null,
            `No exact Account ID matched for domain ${result.domain}. Halted to prevent duplicate creation.`,
            sfdcRecord
          );
        } else {
          // We have an ID, we "would have" updated it safely
          await logSfdcAction(
            'DRY_RUN',
            result.domain,
            routing.sfAccountId,
            `Would have safely updated Account ${routing.sfAccountId} and inserted Contact.`,
            sfdcRecord
          );
        }

        sfdcRecords.push(sfdcRecord);
      }
    } catch (err) {
      console.error('[Clay] Row processing error:', err.message);
      results.errors.push(err.message);
    }
  }

  const duration = Date.now() - startTime;
  console.log(`[Clay] ✅ Done in ${duration}ms: ${results.processed} processed, ${results.skipped} skipped, ${results.signals_inserted} signals created, ${results.accounts_upserted} accounts updated`);

  // Log to audit trail
  try {
    await supabase.from('audit_log').insert({
      action: 'clay_sync',
      details: JSON.stringify({
        records_received: rows.length,
        ...results,
        duration_ms: duration,
      }),
    });
  } catch (e) {
    // audit_log may not exist — that's fine
  }

  return {
    status: 200,
    body: {
      ok: true,
      message: `Processed ${results.processed} records`,
      ...results,
      routing: routingResults,
      sfdc_records: sfdcRecords,
      duration_ms: duration,
    },
  };
}
