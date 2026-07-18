// ════════════════════════════════════════════════════════════
// Lead Routing & Distribution Engine
// ════════════════════════════════════════════════════════════
//
// Routing priority:
//   1. SFDC Account Owner (sticky) — if domain exists in SFDC with an owner
//   2. Territory match — if account has geography, match to territory rep pool
//   3. Round-robin — fair distribution across available reps
//
// Assignment methods logged:
//   'sfdc_owner'   — Routed to existing Salesforce account owner
//   'sticky'       — Domain was previously assigned, keeping same rep
//   'territory'    — Matched geography to rep territory, then round-robin within pool
//   'round_robin'  — Pure round-robin across all available reps
//   'manual'       — Admin reassignment via API
// ════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

let supabase = null;
try {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (url && key) {
    supabase = createClient(url, key);
    console.log('[Router] Supabase connected');
  } else {
    console.log('[Router] Supabase not configured — routing will not function');
  }
} catch (err) {
  console.log('[Router] Supabase init skipped:', err.message);
}

// ── Main Routing Entry Point ──
// Call this after inserting a signal or account to assign it to a rep.
export async function routeSignal({ domain, companyName, signalId, triggeredBy = 'flywheel' }) {
  if (!supabase || !domain) return { assigned: false, reason: 'missing_domain_or_supabase' };

  try {
    // Step 1: Check if this domain already has a rep assigned (sticky routing)
    const { data: account } = await supabase
      .from('accounts')
      .select('domain, company_name, assigned_rep_id, sf_account_owner, sf_account_id, city, state, billing_country')
      .eq('domain', domain)
      .single();

    // Step 1: Check SFDC account owner (source of truth — if Gordon reassigns in SFDC, we respect it)
    if (account?.sf_account_owner) {
      const ownerVal = account.sf_account_owner;
      const { data: sfdcRep } = await supabase
        .from('rep_roster')
        .select('rep_id, full_name, sf_user_id, is_active, is_available')
        .or(`sf_user_id.eq.${ownerVal},full_name.ilike.%${ownerVal}%,email.ilike.%${ownerVal}%`)
        .single();

      // SFDC owner match only requires is_active (not is_available)
      // All US reps are in the roster for owner matching,
      // but only pilot reps (is_available=true) get round-robin assignments
      if (sfdcRep?.is_active) {
        await assignToRep(domain, companyName || account.company_name, sfdcRep.rep_id, {
          method: 'sfdc_owner',
          reason: `SFDC Account Owner match (${ownerVal})`,
          signalId,
          triggeredBy,
          previousRepId: account.assigned_rep_id,
        });
        console.log(`[Router] SFDC Owner: ${domain} → ${sfdcRep.full_name}`);
        return { assigned: true, repId: sfdcRep.rep_id, repName: sfdcRep.full_name, sfUserId: sfdcRep.sf_user_id, method: 'sfdc_owner' };
      }
    }

    // Step 2: Sticky — if we've assigned this account before, keep it with the same rep
    if (account?.assigned_rep_id) {
      const { data: rep } = await supabase
        .from('rep_roster')
        .select('rep_id, full_name, sf_user_id, is_active, is_available')
        .eq('rep_id', account.assigned_rep_id)
        .single();

      if (rep?.is_active && rep?.is_available) {
        console.log(`[Router] Sticky: ${domain} → ${rep.full_name} (already assigned)`);
        return { assigned: true, repId: rep.rep_id, repName: rep.full_name, sfUserId: rep.sf_user_id, method: 'sticky' };
      }
      console.log(`[Router] Sticky rep ${account.assigned_rep_id} unavailable, reassigning ${domain}`);
    }

    // Step 3: Round-robin across all available reps (pilot reps only)
    const rep = await roundRobin();
    if (rep) {
      await assignToRep(domain, companyName || account?.company_name, rep.rep_id, {
        method: 'round_robin',
        reason: 'Net-new account, round-robin assignment',
        signalId,
        triggeredBy,
        previousRepId: account?.assigned_rep_id,
      });
      console.log(`[Router] Round-robin: ${domain} → ${rep.full_name}`);
      return { assigned: true, repId: rep.rep_id, repName: rep.full_name, sfUserId: rep.sf_user_id, method: 'round_robin' };
    }

    console.log(`[Router] ⚠️ No available reps for ${domain}`);
    return { assigned: false, reason: 'no_available_reps' };

  } catch (err) {
    console.error(`[Router] Error routing ${domain}:`, err.message);
    return { assigned: false, reason: err.message };
  }
}

// ── Round-Robin (all available reps) ──
async function roundRobin() {
  return roundRobinInTerritory(null, null);
}

// ── Round-Robin within a territory pool ──
async function roundRobinInTerritory(state, country) {
  if (!supabase) return null;

  // Get available reps, optionally filtered by territory
  let query = supabase
    .from('rep_roster')
    .select('rep_id, full_name, sf_user_id, weight, territory')
    .eq('is_active', true)
    .eq('is_available', true)
    .order('rep_id');

  // If we have territory data on reps, try to match
  // For now, fall through to all reps if no territory match
  const { data: reps } = await query;
  if (!reps || reps.length === 0) return null;

  // If territory field exists on reps, try to narrow the pool
  if (state) {
    const territoryReps = reps.filter(r => r.territory && matchesTerritory(state, r.territory));
    if (territoryReps.length > 0) {
      return pickNextRep(territoryReps);
    }
  }

  // Fall back to full pool
  return pickNextRep(reps);
}

// ── Pick next rep from pool using round-robin state ──
async function pickNextRep(reps) {
  if (!supabase || reps.length === 0) return null;

  // Get current round-robin position
  const { data: state } = await supabase
    .from('round_robin_state')
    .select('current_index, total_assignments')
    .eq('id', 1)
    .single();

  const currentIndex = state?.current_index || 0;
  const nextIndex = currentIndex % reps.length;
  const selectedRep = reps[nextIndex];

  // Advance the pointer
  await supabase
    .from('round_robin_state')
    .update({
      current_index: (nextIndex + 1) % reps.length,
      last_assigned_rep_id: selectedRep.rep_id,
      last_assigned_at: new Date().toISOString(),
      total_assignments: (state?.total_assignments || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);

  return selectedRep;
}

// ── Territory matching (simple — can be expanded) ──
function matchesTerritory(state, territory) {
  if (!territory) return false;
  const t = territory.toLowerCase();
  const s = state?.toLowerCase() || '';

  // Simple East/West split — customize based on team structure
  const eastStates = ['ny', 'nj', 'ct', 'ma', 'pa', 'md', 'va', 'dc', 'nc', 'sc', 'ga', 'fl', 'oh', 'mi', 'il', 'in', 'wi', 'mn', 'tn', 'al', 'ky', 'wv', 'me', 'nh', 'vt', 'ri', 'de'];
  const westStates = ['ca', 'wa', 'or', 'az', 'nv', 'co', 'ut', 'tx', 'nm', 'id', 'mt', 'wy', 'nd', 'sd', 'ne', 'ks', 'ok', 'ar', 'la', 'mo', 'ia', 'hi', 'ak'];

  if (t === 'east' && eastStates.includes(s)) return true;
  if (t === 'west' && westStates.includes(s)) return true;
  if (t === 'all') return true;

  return false;
}

// ── Assign a rep and log the assignment ──
async function assignToRep(domain, companyName, repId, { method, reason, signalId, triggeredBy, previousRepId }) {
  if (!supabase) return;

  // Update the account record
  await supabase
    .from('accounts')
    .update({
      assigned_rep_id: repId,
      updated_at: new Date().toISOString(),
    })
    .eq('domain', domain);

  // Log the assignment
  await supabase
    .from('assignment_log')
    .insert({
      domain,
      company_name: companyName || domain,
      rep_id: repId,
      previous_rep_id: previousRepId || null,
      method,
      reason,
      signal_id: signalId || null,
      triggered_by: triggeredBy,
    });
}

// ── Manual Reassignment (admin API) ──
export async function reassignAccount(domain, toRepId, reason) {
  if (!supabase) return { ok: false, error: 'Supabase not configured' };

  // Get current assignment
  const { data: account } = await supabase
    .from('accounts')
    .select('assigned_rep_id, company_name')
    .eq('domain', domain)
    .single();

  const previousRepId = account?.assigned_rep_id;

  await assignToRep(domain, account?.company_name, toRepId, {
    method: 'manual',
    reason: reason || 'Admin reassignment',
    triggeredBy: 'admin',
    previousRepId,
  });

  console.log(`[Router] Manual reassign: ${domain} ${previousRepId} → ${toRepId}`);
  return { ok: true, domain, toRepId, previousRepId };
}

// ── Rep Availability ──
export async function setRepAvailability(repId, available, reason) {
  if (!supabase) return { ok: false, error: 'Supabase not configured' };

  await supabase
    .from('rep_roster')
    .update({
      is_available: available,
      unavailable_reason: available ? null : (reason || 'Unavailable'),
      updated_at: new Date().toISOString(),
    })
    .eq('rep_id', repId);

  console.log(`[Router] Availability: ${repId} → ${available ? 'AVAILABLE' : `UNAVAILABLE (${reason})`}`);
  return { ok: true, repId, available };
}

// ── Distribution Stats ──
export async function getDistributionStats() {
  if (!supabase) return { total: 0, byRep: {}, recentAssignments: [] };

  // Count assignments per rep (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: logs } = await supabase
    .from('assignment_log')
    .select('rep_id, method, created_at')
    .gte('created_at', thirtyDaysAgo);

  const byRep = {};
  const byMethod = {};
  for (const log of (logs || [])) {
    byRep[log.rep_id] = (byRep[log.rep_id] || 0) + 1;
    byMethod[log.method] = (byMethod[log.method] || 0) + 1;
  }

  // Get round-robin state
  const { data: rrState } = await supabase
    .from('round_robin_state')
    .select('*')
    .eq('id', 1)
    .single();

  return {
    total: logs?.length || 0,
    byRep,
    byMethod,
    roundRobinState: rrState,
  };
}

// ── Roster ──
export async function getRoster() {
  if (!supabase) return [];
  const { data } = await supabase
    .from('rep_roster')
    .select('*')
    .order('rep_id');
  return data || [];
}

export async function updateRep(repId, updates) {
  if (!supabase) return { ok: false };
  const { error } = await supabase
    .from('rep_roster')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('rep_id', repId);
  return { ok: !error, repId, error: error?.message };
}

// ── Assignment Log ──
export async function getAssignmentLog({ limit = 50, domain, repId } = {}) {
  if (!supabase) return [];
  let query = supabase
    .from('assignment_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (domain) query = query.eq('domain', domain);
  if (repId) query = query.eq('rep_id', repId);

  const { data } = await query;
  return data || [];
}
