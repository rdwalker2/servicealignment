/**
 * Lead Router — Fair round-robin assignment engine
 * 
 * Assignment Priority Waterfall:
 *   1. Sticky ownership — account already has a rep → keep them
 *   2. SFDC owner match — Salesforce Account owner maps to our roster → use them
 *   3. Round-robin — distribute to next available rep
 * 
 * @module lead-router
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tqmpaaxocpwmziivxkym.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxbXBhYXhvY3B3bXppaXZ4a3ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTE5MzgxNCwiZXhwIjoyMDk2NzY5ODE0fQ.TUwDSbyhI6FMhO6XMq_pgAOQCn_zHxHHrCh6i1C2dkE';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Main entry point. Assigns a rep to a domain using the priority waterfall.
 * @param {string} domain - Company domain (e.g., 'acme.com')
 * @param {object} signal - Signal context (full_name, email, company_name, signal_source, etc.)
 * @param {object} [options] - Options
 * @param {string} [options.triggeredBy] - What triggered this: 'flywheel', 'clay_webhook', 'admin', 'sfdc_sync'
 * @returns {Promise<{repId: string, method: string, isNew: boolean}>}
 */
export async function assignAccount(domain, signal = {}, options = {}) {
  const triggeredBy = options.triggeredBy || 'system';

  if (!domain) {
    console.warn('[Router] No domain provided, skipping assignment');
    return { repId: null, method: 'skipped', isNew: false };
  }

  // ── Step 1: Sticky ownership ──
  // If any signal for this domain already has an assigned rep, keep them
  const { data: existing } = await supabase
    .from('clay_signals')
    .select('assigned_rep_id')
    .eq('company_domain', domain)
    .not('assigned_rep_id', 'is', null)
    .not('assigned_rep_id', 'eq', '')
    .limit(1)
    .single();

  if (existing?.assigned_rep_id) {
    console.log(`[Router] Sticky: ${domain} → ${existing.assigned_rep_id}`);
    await logAssignment(domain, signal.company_name, existing.assigned_rep_id, null, 'sticky', 'Existing account ownership', signal.id, triggeredBy);
    return { repId: existing.assigned_rep_id, method: 'sticky', isNew: false };
  }

  // ── Step 2: SFDC owner match ──
  // Check if Salesforce has an Account with an Owner that maps to our roster
  const { data: sfdcMatch } = await supabase
    .from('clay_signals')
    .select('salesforce_owner_id, sf_account_owner')
    .eq('company_domain', domain)
    .not('salesforce_owner_id', 'is', null)
    .limit(1)
    .single();

  if (sfdcMatch?.salesforce_owner_id) {
    const { data: rosterMatch } = await supabase
      .from('rep_roster')
      .select('rep_id')
      .eq('sf_user_id', sfdcMatch.salesforce_owner_id)
      .eq('is_active', true)
      .single();

    if (rosterMatch?.rep_id) {
      console.log(`[Router] SFDC Owner: ${domain} → ${rosterMatch.rep_id} (SFDC: ${sfdcMatch.sf_account_owner})`);
      await logAssignment(domain, signal.company_name, rosterMatch.rep_id, null, 'sfdc_owner', `Matched SFDC owner: ${sfdcMatch.sf_account_owner}`, signal.id, triggeredBy);
      return { repId: rosterMatch.rep_id, method: 'sfdc_owner', isNew: false };
    }
  }

  // ── Step 3: Round-robin ──
  const repId = await getNextRep();
  if (!repId) {
    console.error('[Router] No available reps for round-robin!');
    return { repId: null, method: 'no_reps_available', isNew: true };
  }

  console.log(`[Router] Round-robin: ${domain} → ${repId}`);
  await logAssignment(domain, signal.company_name, repId, null, 'round_robin', `New account from ${signal.signal_source || 'unknown'}`, signal.id, triggeredBy);
  return { repId, method: 'round_robin', isNew: true };
}

/**
 * Gets the next rep in the round-robin rotation.
 * Skips inactive, unavailable, and ramping reps.
 * Supports weighted distribution via weight multiplier.
 * @returns {Promise<string|null>} The rep_id of the next rep, or null if none available
 */
export async function getNextRep() {
  // Get all active, available reps sorted by rep_id for deterministic order
  const { data: reps, error: repsError } = await supabase
    .from('rep_roster')
    .select('rep_id, weight, ramping_until')
    .eq('is_active', true)
    .eq('is_available', true)
    .order('rep_id', { ascending: true });

  if (repsError || !reps || reps.length === 0) {
    console.error('[Router] No active reps found:', repsError?.message);
    return null;
  }

  // Filter out reps who are still ramping (optional — they get reduced weight instead)
  const now = new Date();
  const eligibleReps = reps.filter(r => {
    if (r.ramping_until && new Date(r.ramping_until) > now) {
      // Ramping rep — still eligible but at reduced weight (handled by expansion)
      return true;
    }
    return true;
  });

  if (eligibleReps.length === 0) {
    console.error('[Router] All reps are ramping or unavailable');
    return null;
  }

  // Build weighted rep list — each rep appears `weight` times
  // e.g., weight=2 means they get 2x the assignments
  const weightedList = [];
  for (const rep of eligibleReps) {
    const effectiveWeight = (rep.ramping_until && new Date(rep.ramping_until) > now)
      ? Math.max(1, Math.floor(rep.weight / 2))  // Ramping reps get half weight
      : rep.weight;
    for (let i = 0; i < effectiveWeight; i++) {
      weightedList.push(rep.rep_id);
    }
  }

  if (weightedList.length === 0) {
    return null;
  }

  // Get current pointer
  const { data: state } = await supabase
    .from('round_robin_state')
    .select('*')
    .eq('id', 1)
    .single();

  const currentIndex = state?.current_index || 0;
  const safeIndex = currentIndex % weightedList.length;
  const selectedRep = weightedList[safeIndex];

  // Advance pointer
  const nextIndex = (safeIndex + 1) % weightedList.length;
  await supabase
    .from('round_robin_state')
    .update({
      current_index: nextIndex,
      last_assigned_rep_id: selectedRep,
      last_assigned_at: new Date().toISOString(),
      total_assignments: (state?.total_assignments || 0) + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', 1);

  return selectedRep;
}

/**
 * Reassigns an account from one rep to another.
 * Updates all signals for this domain and optionally syncs to Salesforce.
 * @param {string} domain - Company domain
 * @param {string} toRepId - New rep ID
 * @param {string} [reason] - Reason for reassignment
 * @param {string} [adminId] - ID of the admin performing the reassignment
 * @returns {Promise<{success: boolean, updated: number}>}
 */
export async function reassignAccount(domain, toRepId, reason = 'Manual reassignment', adminId = 'admin') {
  // Get current rep
  const { data: current } = await supabase
    .from('clay_signals')
    .select('assigned_rep_id')
    .eq('company_domain', domain)
    .not('assigned_rep_id', 'is', null)
    .limit(1)
    .single();

  const fromRepId = current?.assigned_rep_id || null;

  if (fromRepId === toRepId) {
    console.log(`[Router] Reassign skipped: ${domain} already assigned to ${toRepId}`);
    return { success: true, updated: 0 };
  }

  // Update all signals for this domain
  const { data: updated, error } = await supabase
    .from('clay_signals')
    .update({
      assigned_rep_id: toRepId,
      assignment_method: 'manual'
    })
    .eq('company_domain', domain)
    .select('id');

  if (error) {
    console.error(`[Router] Reassign error for ${domain}:`, error.message);
    return { success: false, updated: 0 };
  }

  const count = updated?.length || 0;
  console.log(`[Router] Reassigned: ${domain} ${fromRepId} → ${toRepId} (${count} signals updated)`);

  // Log the reassignment
  await logAssignment(domain, null, toRepId, fromRepId, 'manual', reason, null, adminId);

  // Sync to Salesforce if connected
  try {
    const { isConnected } = await import('./salesforce-auth.js');
    const connected = await isConnected().catch(() => false);
    if (connected) {
      const { data: repRow } = await supabase
        .from('rep_roster')
        .select('sf_user_id')
        .eq('rep_id', toRepId)
        .single();

      if (repRow?.sf_user_id) {
        const { data: sfdcAccount } = await supabase
          .from('clay_signals')
          .select('salesforce_account_id')
          .eq('company_domain', domain)
          .not('salesforce_account_id', 'is', null)
          .limit(1)
          .single();

        if (sfdcAccount?.salesforce_account_id) {
          const { getConnection } = await import('./salesforce-auth.js');
          const conn = await getConnection();
          await conn.sobject('Account').update({
            Id: sfdcAccount.salesforce_account_id,
            OwnerId: repRow.sf_user_id
          });
          console.log(`[Router] SFDC OwnerId updated for ${domain}`);
        }
      }
    }
  } catch (err) {
    console.warn(`[Router] SFDC sync skipped for reassignment:`, err.message);
  }

  return { success: true, updated: count };
}

/**
 * Returns distribution stats for all reps — account counts, signal counts, last assigned.
 * @returns {Promise<Array<{repId, fullName, accountCount, signalCount, lastAssigned, isActive, isAvailable}>>}
 */
export async function getDistributionStats() {
  // Get roster
  const { data: roster } = await supabase
    .from('rep_roster')
    .select('*')
    .order('rep_id');

  if (!roster) return [];

  // Get account counts per rep
  const { data: signals } = await supabase
    .from('clay_signals')
    .select('assigned_rep_id, company_domain')
    .not('assigned_rep_id', 'is', null);

  // Aggregate
  const repStats = new Map();
  for (const rep of roster) {
    repStats.set(rep.rep_id, {
      repId: rep.rep_id,
      fullName: rep.full_name,
      email: rep.email,
      isActive: rep.is_active,
      isAvailable: rep.is_available,
      unavailableReason: rep.unavailable_reason,
      weight: rep.weight,
      rampingUntil: rep.ramping_until,
      sfUserId: rep.sf_user_id,
      accountCount: 0,
      signalCount: 0,
      lastAssigned: null
    });
  }

  if (signals) {
    const domainsByRep = new Map();
    for (const sig of signals) {
      const repId = sig.assigned_rep_id;
      if (!repStats.has(repId)) continue;

      const stats = repStats.get(repId);
      stats.signalCount++;

      if (!domainsByRep.has(repId)) domainsByRep.set(repId, new Set());
      domainsByRep.get(repId).add(sig.company_domain);
    }

    for (const [repId, domains] of domainsByRep) {
      if (repStats.has(repId)) {
        repStats.get(repId).accountCount = domains.size;
      }
    }
  }

  // Get last assigned timestamps from assignment_log
  for (const rep of roster) {
    const { data: lastLog } = await supabase
      .from('assignment_log')
      .select('created_at')
      .eq('rep_id', rep.rep_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lastLog && repStats.has(rep.rep_id)) {
      repStats.get(rep.rep_id).lastAssigned = lastLog.created_at;
    }
  }

  return Array.from(repStats.values());
}

/**
 * Sets rep availability (for OOO handling).
 * @param {string} repId - Rep ID
 * @param {boolean} available - Is the rep available?
 * @param {string} [reason] - Reason (e.g., 'PTO', 'Sick')
 */
export async function setRepAvailability(repId, available, reason = null) {
  const { error } = await supabase
    .from('rep_roster')
    .update({
      is_available: available,
      unavailable_reason: available ? null : reason,
      updated_at: new Date().toISOString()
    })
    .eq('rep_id', repId);

  if (error) {
    console.error(`[Router] Failed to update availability for ${repId}:`, error.message);
    return { success: false };
  }

  console.log(`[Router] ${repId} availability: ${available ? 'AVAILABLE' : `UNAVAILABLE (${reason})`}`);
  return { success: true };
}

/**
 * Gets the rep roster with current status.
 * @returns {Promise<Array>}
 */
export async function getRoster() {
  const { data, error } = await supabase
    .from('rep_roster')
    .select('*')
    .order('rep_id');

  if (error) {
    console.error('[Router] Failed to get roster:', error.message);
    return [];
  }
  return data || [];
}

/**
 * Updates a rep's configuration (weight, active status, SFDC user ID, etc.)
 * @param {string} repId
 * @param {object} updates
 */
export async function updateRep(repId, updates) {
  const allowed = ['is_active', 'is_available', 'unavailable_reason', 'weight', 'ramping_until', 'sf_user_id'];
  const filtered = {};
  for (const key of allowed) {
    if (key in updates) filtered[key] = updates[key];
  }
  filtered.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('rep_roster')
    .update(filtered)
    .eq('rep_id', repId);

  if (error) {
    console.error(`[Router] Failed to update ${repId}:`, error.message);
    return { success: false, error: error.message };
  }

  console.log(`[Router] Updated ${repId}:`, filtered);
  return { success: true };
}

/**
 * Gets the assignment audit log.
 * @param {object} [options]
 * @param {number} [options.limit=50]
 * @param {string} [options.domain]
 * @param {string} [options.repId]
 * @returns {Promise<Array>}
 */
export async function getAssignmentLog(options = {}) {
  let query = supabase
    .from('assignment_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(options.limit || 50);

  if (options.domain) query = query.eq('domain', options.domain);
  if (options.repId) query = query.eq('rep_id', options.repId);

  const { data, error } = await query;
  if (error) {
    console.error('[Router] Failed to get assignment log:', error.message);
    return [];
  }
  return data || [];
}

// ── Internal helpers ──

/**
 * Logs an assignment to the audit table.
 */
async function logAssignment(domain, companyName, repId, previousRepId, method, reason, signalId, triggeredBy) {
  const { error } = await supabase
    .from('assignment_log')
    .insert({
      domain,
      company_name: companyName,
      rep_id: repId,
      previous_rep_id: previousRepId,
      method,
      reason,
      signal_id: signalId,
      triggered_by: triggeredBy
    });

  if (error) {
    console.warn('[Router] Failed to log assignment:', error.message);
  }
}
