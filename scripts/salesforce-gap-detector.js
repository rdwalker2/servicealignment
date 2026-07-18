// ============================================================
// salesforce-gap-detector.js — Salesforce Gap Detection & Resolution
// Detects signals in Supabase that are missing corresponding
// Salesforce records (Account, Contact, Lead) and creates them.
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { getConnection } from './salesforce-auth.js';
import { logSync } from './salesforce-sync.js';

// ── Supabase client ──
const SUPABASE_URL = 'https://tqmpaaxocpwmziivxkym.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxbXBhYXhvY3B3bXppaXZ4a3ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTE5MzgxNCwiZXhwIjoyMDk2NzY5ODE0fQ.TUwDSbyhI6FMhO6XMq_pgAOQCn_zHxHHrCh6i1C2dkE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/** Log prefix for all console output from this module. */
const PREFIX = '[SF Gap]';

// ── Helpers ──────────────────────────────────────────────────

/**
 * Extract a bare domain from an email address.
 * Returns null for free-mail providers or invalid emails.
 * @param {string} email
 * @returns {string|null}
 */
function domainFromEmail(email) {
  if (!email || typeof email !== 'string') return null;
  const parts = email.split('@');
  if (parts.length !== 2) return null;
  const domain = parts[1].toLowerCase().trim();
  // Skip free-mail domains — they don't map to company accounts
  const freeMail = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'mail.com'];
  if (freeMail.includes(domain)) return null;
  return domain;
}

/**
 * Split a full name into { FirstName, LastName }.
 * Handles single-word names and trims whitespace.
 * @param {string} fullName
 * @returns {{ FirstName: string, LastName: string }}
 */
function splitName(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return { FirstName: 'Unknown', LastName: 'Unknown' };
  }
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { FirstName: parts[0], LastName: '(none)' };
  }
  return {
    FirstName: parts[0],
    LastName: parts.slice(1).join(' '),
  };
}

/**
 * Pause execution for a given number of milliseconds.
 * Used for rate-limiting between Salesforce API batches.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Update a clay_signals row in Supabase by email + domain composite key.
 * @param {string} email
 * @param {string} domain
 * @param {Record<string, unknown>} updates
 */
async function updateSignalRecord(email, domain, updates) {
  let query = supabase.from('clay_signals').update(updates);
  if (email) query = query.eq('email', email);
  if (domain) query = query.eq('company_domain', domain);
  const { error } = await query;
  if (error) {
    console.error(`${PREFIX} Supabase update failed for ${email || domain}:`, error.message);
  }
}

// ── Core Functions ───────────────────────────────────────────

/**
 * Detect whether a signal already has matching Salesforce records and
 * create any that are missing (Account → Contact, or net-new Lead).
 *
 * Flow:
 *   1. Check Supabase for a cached `salesforce_account_id` on this domain.
 *   2. If no Account ID → search Salesforce by website domain.
 *      - Found → cache the Account ID, then check for Contact.
 *      - Not found → create a new Lead (net-new company).
 *   3. If Account exists → check for Contact by email.
 *      - Found → cache the Contact ID.
 *      - Not found → create a new Contact on the Account.
 *
 * @param {object} signal - Signal data with at minimum email + company info.
 * @param {string}  signal.full_name
 * @param {string}  signal.email
 * @param {string}  signal.company_name
 * @param {string}  signal.company_domain
 * @param {string}  [signal.job_title]
 * @param {string}  [signal.signal_name]
 * @param {string}  [signal.signal_source]
 * @param {number}  [signal.signal_score]
 * @param {string}  [signal.icp_tier]
 * @returns {Promise<{action: string, sfdcId: string|null, sfdcAccountId: string|null}>}
 */
export async function detectAndResolve(signal) {
  const domain = signal.company_domain || domainFromEmail(signal.email);

  // Guard: must have a usable domain
  if (!domain) {
    console.warn(`${PREFIX} Skipping signal — no valid domain. email=${signal.email}`);
    return { action: 'skipped', sfdcId: null, sfdcAccountId: null };
  }

  try {
    // ── Step 1: Check Supabase cache for existing Account ID ──
    const { data: cached } = await supabase
      .from('clay_signals')
      .select('salesforce_account_id, salesforce_contact_id, is_customer, sf_sync_status')
      .eq('company_domain', domain)
      .not('salesforce_account_id', 'is', null)
      .limit(1)
      .maybeSingle();

    // Skip existing customers — don't overwrite CRM ownership
    if (cached?.is_customer) {
      console.log(`${PREFIX} Skipping existing customer: ${domain}`);
      await updateSignalRecord(signal.email, domain, { sf_sync_status: 'skipped' });
      return { action: 'skipped', sfdcId: null, sfdcAccountId: cached.salesforce_account_id };
    }

    let accountId = cached?.salesforce_account_id || null;
    let contactId = cached?.salesforce_contact_id || null;

    // If we already have both IDs cached, nothing to do
    if (accountId && contactId) {
      console.log(`${PREFIX} Already linked: Account=${accountId} Contact=${contactId} (${domain})`);
      return { action: 'existing', sfdcId: contactId, sfdcAccountId: accountId };
    }

    const conn = await getConnection();

    // ── Step 2: No Account ID → search Salesforce ──
    if (!accountId) {
      const soql = `SELECT Id, Name, OwnerId, Owner.Name FROM Account WHERE Website LIKE '%${domain}%'`;
      console.log(`${PREFIX} SOQL search: ${soql}`);

      const result = await conn.query(soql);

      if (result.totalSize > 0) {
        // Account exists in Salesforce — cache it
        const account = result.records[0];
        accountId = account.Id;
        console.log(`${PREFIX} Found Account: ${account.Name} (${accountId}), Owner: ${account.Owner?.Name || 'unassigned'}`);

        await updateSignalRecord(signal.email, domain, { salesforce_account_id: accountId });

        // Fall through to Step 3 (Contact check)
      } else {
        // Net-new company — create a Lead
        console.log(`${PREFIX} No Account found for ${domain} — creating Lead`);
        const leadId = await createLead(signal);
        return { action: 'created_lead', sfdcId: leadId, sfdcAccountId: null };
      }
    } else {
      console.log(`${PREFIX} Cached Account ID: ${accountId} for ${domain}`);
    }

    // ── Step 3: Account exists — check for Contact ──
    if (!signal.email) {
      console.log(`${PREFIX} No email on signal — cannot check for Contact on Account ${accountId}`);
      return { action: 'linked_account', sfdcId: null, sfdcAccountId: accountId };
    }

    const contactSoql = `SELECT Id FROM Contact WHERE Email = '${signal.email}' AND AccountId = '${accountId}'`;
    console.log(`${PREFIX} Contact search: ${contactSoql}`);
    const contactResult = await conn.query(contactSoql);

    if (contactResult.totalSize > 0) {
      contactId = contactResult.records[0].Id;
      console.log(`${PREFIX} Found existing Contact: ${contactId}`);

      await updateSignalRecord(signal.email, domain, {
        salesforce_contact_id: contactId,
        sf_sync_status: 'linked',
      });

      return { action: 'linked_contact', sfdcId: contactId, sfdcAccountId: accountId };
    }

    // Contact doesn't exist — create one
    console.log(`${PREFIX} No Contact found for ${signal.email} on Account ${accountId} — creating`);
    contactId = await createContact(signal, accountId);
    return { action: 'created_contact', sfdcId: contactId, sfdcAccountId: accountId };
  } catch (err) {
    console.error(`${PREFIX} detectAndResolve error for ${signal.email || domain}:`, err.message);

    await updateSignalRecord(signal.email, domain, {
      sf_sync_status: 'error',
      sf_sync_error: err.message?.slice(0, 500),
    }).catch(() => {}); // don't throw on cleanup

    return { action: 'error', sfdcId: null, sfdcAccountId: null };
  }
}

/**
 * Create a Lead in Salesforce for a net-new company signal.
 *
 * Maps signal fields to Salesforce Lead fields, including custom
 * GTM fields for signal scoring and ICP tier.
 *
 * @param {object} signal - Signal data (see detectAndResolve for shape).
 * @returns {Promise<string>} The newly-created Lead ID.
 * @throws {Error} If the Salesforce API call fails.
 */
export async function createLead(signal) {
  const conn = await getConnection();
  const { FirstName, LastName } = splitName(signal.full_name);

  const leadData = {
    FirstName,
    LastName,
    Email: signal.email,
    Title: signal.job_title || '',
    Company: signal.company_name || signal.company_domain || 'Unknown',
    Website: signal.company_domain || '',
    LeadSource: 'RB2B Intent Signal',
    Description: [
      `Signal: ${signal.signal_name || 'N/A'}`,
      `Source: ${signal.signal_source || 'N/A'}`,
      `Score: ${signal.signal_score ?? 'N/A'}`,
      `ICP Tier: ${signal.icp_tier || 'N/A'}`,
      `Detected: ${new Date().toISOString()}`,
    ].join('\n'),
    GTM_Signal_Score__c: signal.signal_score ?? null,
    GTM_ICP_Tier__c: signal.icp_tier || null,
    GTM_Signal_Source__c: 'GTM Workspace',
  };

  console.log(`${PREFIX} Creating Lead: ${FirstName} ${LastName} @ ${leadData.Company}`);

  const result = await conn.sobject('Lead').create(leadData);

  if (!result.success) {
    const errMsg = result.errors?.map((e) => e.message).join('; ') || 'Unknown Salesforce error';
    throw new Error(`Lead creation failed: ${errMsg}`);
  }

  const leadId = result.id;
  console.log(`${PREFIX} Lead created: ${leadId}`);

  // Update Supabase with the result
  const domain = signal.company_domain || domainFromEmail(signal.email);
  await updateSignalRecord(signal.email, domain, {
    salesforce_lead_id: leadId,
    sf_sync_status: 'created',
    sf_synced_at: new Date().toISOString(),
  });

  // Log to sf_sync_log
  await logSync({
    object_type: 'Lead',
    object_id: leadId,
    action: 'created',
    signal_email: signal.email,
    signal_domain: domain,
    details: `Lead created for ${signal.full_name} at ${signal.company_name || domain}`,
  });

  return leadId;
}

/**
 * Create a Contact in Salesforce linked to an existing Account.
 *
 * Used when we find an Account but the specific person doesn't
 * have a Contact record yet.
 *
 * @param {object} signal  - Signal data (see detectAndResolve for shape).
 * @param {string} accountId - Salesforce Account ID to link the Contact to.
 * @returns {Promise<string>} The newly-created Contact ID.
 * @throws {Error} If the Salesforce API call fails.
 */
export async function createContact(signal, accountId) {
  const conn = await getConnection();
  const { FirstName, LastName } = splitName(signal.full_name);

  const contactData = {
    FirstName,
    LastName,
    Email: signal.email,
    Title: signal.job_title || '',
    AccountId: accountId,
    LeadSource: 'RB2B Intent Signal',
    GTM_Contact_Score__c: signal.signal_score ?? null,
  };

  console.log(`${PREFIX} Creating Contact: ${FirstName} ${LastName} on Account ${accountId}`);

  const result = await conn.sobject('Contact').create(contactData);

  if (!result.success) {
    const errMsg = result.errors?.map((e) => e.message).join('; ') || 'Unknown Salesforce error';
    throw new Error(`Contact creation failed: ${errMsg}`);
  }

  const contactId = result.id;
  console.log(`${PREFIX} Contact created: ${contactId}`);

  // Update Supabase with the result
  const domain = signal.company_domain || domainFromEmail(signal.email);
  await updateSignalRecord(signal.email, domain, {
    salesforce_contact_id: contactId,
    salesforce_account_id: accountId,
    sf_sync_status: 'created',
    sf_synced_at: new Date().toISOString(),
  });

  // Log to sf_sync_log
  await logSync({
    object_type: 'Contact',
    object_id: contactId,
    action: 'created',
    signal_email: signal.email,
    signal_domain: domain,
    details: `Contact created for ${signal.full_name} on Account ${accountId}`,
  });

  return contactId;
}

/**
 * Batch-scan all unsynced signals in Supabase and resolve their
 * Salesforce gaps. Processes unique domains to avoid duplicate
 * Account lookups, with rate-limiting (batches of 10, 1s delays).
 *
 * @param {object} [options={}]
 * @param {boolean} [options.dryRun=false] - If true, log actions without making changes.
 * @param {number}  [options.limit]        - Max number of signals to process.
 * @returns {Promise<{total: number, created_leads: number, created_contacts: number, linked: number, errors: number}>}
 */
export async function scanAllGaps(options = {}) {
  const { dryRun = false, limit } = options;

  console.log(`${PREFIX} Starting gap scan... dryRun=${dryRun}, limit=${limit ?? 'none'}`);

  // Query all unsynced records
  let query = supabase
    .from('clay_signals')
    .select('id, email, full_name, company_name, company_domain, job_title, signal_name, signal_source, signal_score, icp_tier, salesforce_account_id, sf_sync_status')
    .or('salesforce_account_id.is.null,sf_sync_status.eq.pending')
    .order('created_at', { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data: signals, error } = await query;

  if (error) {
    console.error(`${PREFIX} Failed to query clay_signals:`, error.message);
    return { total: 0, created_leads: 0, created_contacts: 0, linked: 0, errors: 1 };
  }

  if (!signals || signals.length === 0) {
    console.log(`${PREFIX} No unsynced signals found.`);
    return { total: 0, created_leads: 0, created_contacts: 0, linked: 0, errors: 0 };
  }

  console.log(`${PREFIX} Found ${signals.length} unsynced signal(s)`);

  // Deduplicate by domain — process each domain once, then its contacts
  const domainMap = new Map();
  for (const sig of signals) {
    const domain = sig.company_domain || domainFromEmail(sig.email);
    if (!domain) continue;
    if (!domainMap.has(domain)) {
      domainMap.set(domain, []);
    }
    domainMap.get(domain).push(sig);
  }

  const summary = { total: signals.length, created_leads: 0, created_contacts: 0, linked: 0, errors: 0 };
  const domainEntries = [...domainMap.entries()];
  const BATCH_SIZE = 10;

  for (let i = 0; i < domainEntries.length; i += BATCH_SIZE) {
    const batch = domainEntries.slice(i, i + BATCH_SIZE);

    for (const [domain, domainSignals] of batch) {
      // Process each signal for this domain
      for (const sig of domainSignals) {
        try {
          if (dryRun) {
            console.log(`${PREFIX} [DRY RUN] Would process: ${sig.email || 'no-email'} @ ${domain}`);
            continue;
          }

          const result = await detectAndResolve(sig);

          switch (result.action) {
            case 'created_lead':
              summary.created_leads++;
              break;
            case 'created_contact':
              summary.created_contacts++;
              break;
            case 'linked_account':
            case 'linked_contact':
            case 'existing':
              summary.linked++;
              break;
            case 'error':
              summary.errors++;
              break;
            // 'skipped' — no counter needed
          }
        } catch (err) {
          console.error(`${PREFIX} Error processing ${sig.email || domain}:`, err.message);
          summary.errors++;
        }
      }
    }

    // Rate-limit: pause between batches (skip after last batch)
    if (i + BATCH_SIZE < domainEntries.length) {
      console.log(`${PREFIX} Batch ${Math.floor(i / BATCH_SIZE) + 1} complete — pausing 1s for rate limit...`);
      await sleep(1000);
    }
  }

  console.log(`${PREFIX} Gap scan complete:`, JSON.stringify(summary));
  return summary;
}
