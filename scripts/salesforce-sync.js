// ============================================================
// salesforce-sync.js — Bi-directional Salesforce ↔ Supabase Sync
// Pulls account ownership from SFDC, pushes GTM signal data back.
// All operations are audit-logged to sf_sync_log.
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { getConnection } from './salesforce-auth.js';

// ── Supabase Client ──
const SUPABASE_URL = 'https://tqmpaaxocpwmziivxkym.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxbXBhYXhvY3B3bXppaXZ4a3ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTE5MzgxNCwiZXhwIjoyMDk2NzY5ODE0fQ.TUwDSbyhI6FMhO6XMq_pgAOQCn_zHxHHrCh6i1C2dkE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const LOG_PREFIX = '[SF Sync]';

// ── Helpers ──

/**
 * Extract a clean root domain from a URL or domain string.
 * "https://www.acme.com/careers" → "acme.com"
 * @param {string|null} url - Raw URL or domain
 * @returns {string|null} Cleaned domain or null
 */
function extractDomain(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    let cleaned = url.trim().toLowerCase();
    // Add protocol if missing so URL constructor can parse it
    if (!/^https?:\/\//i.test(cleaned)) {
      cleaned = `https://${cleaned}`;
    }
    const hostname = new URL(cleaned).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    // Fallback: simple regex strip
    return url
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/.*$/, '')
      .toLowerCase()
      .trim() || null;
  }
}

// ── Audit Logging ──

/**
 * Insert an entry into the sf_sync_log table for audit tracking.
 *
 * @param {'inbound'|'outbound'} direction - Sync direction
 * @param {string} operation - Operation name (e.g. 'pull_ownership', 'push_signal')
 * @param {string|null} sfdcObject - Salesforce object type ('Account', 'Contact', etc.)
 * @param {string|null} sfdcId - Salesforce record ID
 * @param {string|null} domain - Company domain from Supabase
 * @param {string|null} email - Contact email from Supabase
 * @param {'success'|'error'|'skipped'} status - Outcome status
 * @param {string|null} errorMessage - Error details if status is 'error'
 * @param {object|null} payload - Optional JSON payload for debugging
 * @returns {Promise<void>}
 */
export async function logSync(
  direction,
  operation,
  sfdcObject,
  sfdcId,
  domain,
  email,
  status,
  errorMessage = null,
  payload = null,
) {
  try {
    const { error } = await supabase.from('sf_sync_log').insert({
      direction,
      operation,
      sfdc_object: sfdcObject,
      sfdc_id: sfdcId,
      supabase_domain: domain,
      supabase_email: email,
      status,
      error_message: errorMessage,
      payload,
    });
    if (error) {
      console.error(`${LOG_PREFIX} Failed to write sync log:`, error.message);
    }
  } catch (err) {
    // Never let logging failures break the sync pipeline
    console.error(`${LOG_PREFIX} Sync log exception:`, err.message);
  }
}

// ── 1. Pull Account Ownership ──

/**
 * Query all Salesforce Accounts and match them to Supabase clay_signals
 * by domain. Updates ownership fields and sync status on matched rows.
 *
 * @returns {Promise<{matched: number, unmatched: number, errors: number}>}
 */
export async function pullAccountOwnership() {
  console.log(`${LOG_PREFIX} Starting account ownership pull…`);
  const stats = { matched: 0, unmatched: 0, errors: 0 };

  let conn;
  try {
    conn = await getConnection();
  } catch (err) {
    console.error(`${LOG_PREFIX} ❌ Cannot connect to Salesforce:`, err.message);
    await logSync('inbound', 'pull_ownership', 'Account', null, null, null, 'error', err.message);
    throw err;
  }

  // Fetch all Accounts with ownership info
  let accounts;
  try {
    const result = await conn.query(
      `SELECT Id, Name, OwnerId, Owner.Name, Website, Industry, Type
       FROM Account
       WHERE Website != null`,
    );
    accounts = result.records || [];
    console.log(`${LOG_PREFIX} Fetched ${accounts.length} Salesforce Accounts with websites`);
  } catch (err) {
    console.error(`${LOG_PREFIX} ❌ SOQL query failed:`, err.message);
    await logSync('inbound', 'pull_ownership', 'Account', null, null, null, 'error', err.message);
    throw err;
  }

  // Process in batches of 50 to avoid overwhelming Supabase
  const BATCH_SIZE = 50;

  for (let i = 0; i < accounts.length; i += BATCH_SIZE) {
    const batch = accounts.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(async (acct) => {
      const domain = extractDomain(acct.Website);
      if (!domain) {
        stats.unmatched++;
        return;
      }

      try {
        // Find matching clay_signals rows by domain
        const { data: signals, error: findError } = await supabase
          .from('clay_signals')
          .select('id')
          .eq('company_domain', domain);

        if (findError) {
          console.error(`${LOG_PREFIX} Lookup error for ${domain}:`, findError.message);
          stats.errors++;
          await logSync('inbound', 'pull_ownership', 'Account', acct.Id, domain, null, 'error', findError.message);
          return;
        }

        if (!signals || signals.length === 0) {
          stats.unmatched++;
          return;
        }

        // Update all matching signal rows with SFDC ownership
        const { error: updateError } = await supabase
          .from('clay_signals')
          .update({
            salesforce_account_id: acct.Id,
            salesforce_owner_id: acct.OwnerId,
            sf_sync_status: 'synced',
            sf_last_synced_at: new Date().toISOString(),
          })
          .eq('company_domain', domain);

        if (updateError) {
          console.error(`${LOG_PREFIX} Update error for ${domain}:`, updateError.message);
          stats.errors++;
          await logSync('inbound', 'pull_ownership', 'Account', acct.Id, domain, null, 'error', updateError.message);
          return;
        }

        stats.matched++;
        await logSync('inbound', 'pull_ownership', 'Account', acct.Id, domain, null, 'success', null, {
          owner_name: acct.Owner?.Name,
          industry: acct.Industry,
          type: acct.Type,
          signals_updated: signals.length,
        });
      } catch (err) {
        console.error(`${LOG_PREFIX} Error processing ${domain}:`, err.message);
        stats.errors++;
        await logSync('inbound', 'pull_ownership', 'Account', acct.Id, domain, null, 'error', err.message);
      }
    });

    await Promise.all(batchPromises);
  }

  console.log(
    `${LOG_PREFIX} Ownership pull complete → ${stats.matched} matched, ${stats.unmatched} unmatched, ${stats.errors} errors`,
  );
  return stats;
}

// ── 2. Push Signal Activity ──

/**
 * Aggregate GTM signal data from Supabase for a given company domain
 * and push it to the matching Salesforce Account as custom fields.
 *
 * @param {string} domain - Company domain to push signals for
 * @returns {Promise<{success: boolean, accountId: string|null}>}
 */
export async function pushSignalActivity(domain) {
  console.log(`${LOG_PREFIX} Pushing signal activity for: ${domain}`);

  try {
    // Fetch all signals for this domain
    const { data: signals, error: fetchError } = await supabase
      .from('clay_signals')
      .select('signal_score, signal_name, detected_at, icp_tier, page_visited, current_ats, salesforce_account_id')
      .eq('company_domain', domain);

    if (fetchError) {
      console.error(`${LOG_PREFIX} ❌ Fetch error for ${domain}:`, fetchError.message);
      await logSync('outbound', 'push_signal', 'Account', null, domain, null, 'error', fetchError.message);
      return { success: false, accountId: null };
    }

    if (!signals || signals.length === 0) {
      console.log(`${LOG_PREFIX} No signals found for ${domain}, skipping`);
      await logSync('outbound', 'push_signal', 'Account', null, domain, null, 'skipped', 'No signals found');
      return { success: false, accountId: null };
    }

    // Find the Salesforce Account ID (use the first non-null one)
    const accountId = signals.find((s) => s.salesforce_account_id)?.salesforce_account_id;
    if (!accountId) {
      console.log(`${LOG_PREFIX} No Salesforce Account ID for ${domain}, skipping`);
      await logSync('outbound', 'push_signal', 'Account', null, domain, null, 'skipped', 'No salesforce_account_id');
      return { success: false, accountId: null };
    }

    // Aggregate signal data
    const totalScore = signals.reduce((sum, s) => sum + (s.signal_score || 0), 0);
    const signalCount = signals.length;
    const latestSignalDate = signals
      .map((s) => s.detected_at)
      .filter(Boolean)
      .sort()
      .pop() || null;
    const icpTier = signals.find((s) => s.icp_tier)?.icp_tier || 'unknown';
    const webVisitCount = signals.filter((s) => s.page_visited).length;
    const currentAts = signals.find((s) => s.current_ats)?.current_ats || null;

    // Push to Salesforce
    const conn = await getConnection();
    const updatePayload = {
      GTM_Signal_Score__c: totalScore,
      GTM_ICP_Tier__c: icpTier,
      GTM_Last_Signal_Date__c: latestSignalDate,
      GTM_Signal_Count__c: signalCount,
      GTM_Current_ATS__c: currentAts,
      GTM_Web_Visit_Count__c: webVisitCount,
    };

    const result = await conn.sobject('Account').update({
      Id: accountId,
      ...updatePayload,
    });

    if (!result.success) {
      const errMsg = (result.errors || []).map((e) => e.message).join('; ') || 'Unknown SFDC error';
      console.error(`${LOG_PREFIX} ❌ SFDC update failed for ${domain}:`, errMsg);
      await logSync('outbound', 'push_signal', 'Account', accountId, domain, null, 'error', errMsg, updatePayload);
      return { success: false, accountId };
    }

    console.log(`${LOG_PREFIX} ✅ Pushed signals for ${domain} → Account ${accountId}`);
    await logSync('outbound', 'push_signal', 'Account', accountId, domain, null, 'success', null, updatePayload);
    return { success: true, accountId };
  } catch (err) {
    console.error(`${LOG_PREFIX} ❌ Push signal error for ${domain}:`, err.message);
    await logSync('outbound', 'push_signal', 'Account', null, domain, null, 'error', err.message);
    return { success: false, accountId: null };
  }
}

// ── 3. Push Contact Activity ──

/**
 * Retrieve contact-level signal data from Supabase for a given email
 * and push it to the matching Salesforce Contact as custom fields.
 *
 * @param {string} email - Contact email to push data for
 * @returns {Promise<{success: boolean, contactId: string|null}>}
 */
export async function pushContactActivity(email) {
  console.log(`${LOG_PREFIX} Pushing contact activity for: ${email}`);

  try {
    // Fetch contact signals
    const { data: signals, error: fetchError } = await supabase
      .from('clay_signals')
      .select('signal_score, page_visited, detected_at, salesforce_contact_id')
      .eq('email', email);

    if (fetchError) {
      console.error(`${LOG_PREFIX} ❌ Fetch error for ${email}:`, fetchError.message);
      await logSync('outbound', 'push_contact', 'Contact', null, null, email, 'error', fetchError.message);
      return { success: false, contactId: null };
    }

    if (!signals || signals.length === 0) {
      console.log(`${LOG_PREFIX} No signals found for ${email}, skipping`);
      await logSync('outbound', 'push_contact', 'Contact', null, null, email, 'skipped', 'No signals found');
      return { success: false, contactId: null };
    }

    // Find the Salesforce Contact ID
    const contactId = signals.find((s) => s.salesforce_contact_id)?.salesforce_contact_id;
    if (!contactId) {
      console.log(`${LOG_PREFIX} No Salesforce Contact ID for ${email}, skipping`);
      await logSync('outbound', 'push_contact', 'Contact', null, null, email, 'skipped', 'No salesforce_contact_id');
      return { success: false, contactId: null };
    }

    // Aggregate contact-level data
    const contactScore = signals.reduce((sum, s) => sum + (s.signal_score || 0), 0);
    const webVisits = signals.filter((s) => s.page_visited).length;
    const lastPageVisited = signals
      .filter((s) => s.page_visited)
      .sort((a, b) => (b.detected_at || '').localeCompare(a.detected_at || ''))
      .map((s) => s.page_visited)[0] || null;

    // Push to Salesforce
    const conn = await getConnection();
    const updatePayload = {
      GTM_Contact_Score__c: contactScore,
      GTM_Last_Page_Visited__c: lastPageVisited,
      GTM_Web_Visits__c: webVisits,
    };

    const result = await conn.sobject('Contact').update({
      Id: contactId,
      ...updatePayload,
    });

    if (!result.success) {
      const errMsg = (result.errors || []).map((e) => e.message).join('; ') || 'Unknown SFDC error';
      console.error(`${LOG_PREFIX} ❌ SFDC contact update failed for ${email}:`, errMsg);
      await logSync('outbound', 'push_contact', 'Contact', contactId, null, email, 'error', errMsg, updatePayload);
      return { success: false, contactId };
    }

    console.log(`${LOG_PREFIX} ✅ Pushed contact data for ${email} → Contact ${contactId}`);
    await logSync('outbound', 'push_contact', 'Contact', contactId, null, email, 'success', null, updatePayload);
    return { success: true, contactId };
  } catch (err) {
    console.error(`${LOG_PREFIX} ❌ Push contact error for ${email}:`, err.message);
    await logSync('outbound', 'push_contact', 'Contact', null, null, email, 'error', err.message);
    return { success: false, contactId: null };
  }
}

// ── 4. Full Sync Orchestrator ──

/**
 * Run a complete bi-directional sync:
 *   1. Pull account ownership from Salesforce → Supabase
 *   2. Push signal activity for all synced accounts back → Salesforce
 *
 * @returns {Promise<{pullStats: object, pushResults: {total: number, success: number, errors: number}}>}
 */
export async function runFullSync() {
  const startTime = Date.now();
  console.log(`${LOG_PREFIX} ═══════════════════════════════════════`);
  console.log(`${LOG_PREFIX} Starting full bi-directional sync…`);
  console.log(`${LOG_PREFIX} ═══════════════════════════════════════`);

  // Step 1: Pull account ownership
  console.log(`${LOG_PREFIX} Step 1/2 — Pulling account ownership from Salesforce…`);
  const pullStats = await pullAccountOwnership();

  // Step 2: Push signal activity for all enriched/synced accounts
  console.log(`${LOG_PREFIX} Step 2/2 — Pushing signal activity to Salesforce…`);
  const pushResults = { total: 0, success: 0, errors: 0 };

  // Get all unique domains that have a salesforce_account_id
  const { data: syncedDomains, error: domainError } = await supabase
    .from('clay_signals')
    .select('company_domain')
    .not('salesforce_account_id', 'is', null)
    .not('company_domain', 'is', null);

  if (domainError) {
    console.error(`${LOG_PREFIX} ❌ Failed to fetch synced domains:`, domainError.message);
    await logSync('outbound', 'full_sync', null, null, null, null, 'error', domainError.message);
  } else {
    // Deduplicate domains
    const uniqueDomains = [...new Set((syncedDomains || []).map((r) => r.company_domain))];
    pushResults.total = uniqueDomains.length;
    console.log(`${LOG_PREFIX} Found ${uniqueDomains.length} unique domains to push`);

    // Process domains in batches to avoid rate limits
    const PUSH_BATCH_SIZE = 10;
    for (let i = 0; i < uniqueDomains.length; i += PUSH_BATCH_SIZE) {
      const batch = uniqueDomains.slice(i, i + PUSH_BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((domain) => pushSignalActivity(domain)),
      );

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.success) {
          pushResults.success++;
        } else {
          pushResults.errors++;
        }
      }
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`${LOG_PREFIX} ═══════════════════════════════════════`);
  console.log(`${LOG_PREFIX} Full sync complete in ${elapsed}s`);
  console.log(`${LOG_PREFIX}   Pull: ${pullStats.matched} matched, ${pullStats.unmatched} unmatched, ${pullStats.errors} errors`);
  console.log(`${LOG_PREFIX}   Push: ${pushResults.success}/${pushResults.total} succeeded, ${pushResults.errors} errors`);
  console.log(`${LOG_PREFIX} ═══════════════════════════════════════`);

  await logSync('outbound', 'full_sync', null, null, null, null, 'success', null, {
    pull: pullStats,
    push: pushResults,
    elapsed_seconds: parseFloat(elapsed),
  });

  return { pullStats, pushResults };
}
