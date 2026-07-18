import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SALESLOFT_API_KEY = process.env.SALESLOFT_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SALESLOFT_API_KEY) throw new Error('Missing SALESLOFT_API_KEY');
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) throw new Error('Missing Supabase credentials');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const SALESLOFT_BASE = 'https://api.salesloft.com/v2';

function cleanDomain(domain) {
  if (!domain) return null;
  let d = domain.replace(/^https?:\/\//i, '');
  d = d.split('?')[0].split('/')[0];
  return d.toLowerCase().trim();
}

async function slFetch(endpoint) {
  const url = `${SALESLOFT_BASE}${endpoint}`;
  let attempts = 0;
  while(attempts < 3) {
    const resp = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${SALESLOFT_API_KEY}`,
        'Accept': 'application/json'
      }
    });
    
    if (resp.status === 429) {
      console.log('[Pipeline Sync] Rate limited. Waiting 2 seconds...');
      await new Promise(r => setTimeout(r, 2000));
      attempts++;
      continue;
    }
    
    if (!resp.ok) throw new Error(`Salesloft API Error: ${resp.status} ${resp.statusText}`);
    return resp.json();
  }
  throw new Error(`Salesloft API Error: Rate limit exceeded after 3 retries.`);
}

async function syncSalesloftPipeline() {
  console.log('[Pipeline Sync] Starting Perfect Pipeline Sync...');
  
  try {
    // 1. Fetch Rep Roster
    const { data: roster, error: rosterErr } = await supabase.from('rep_roster').select('rep_id, full_name');
    if (rosterErr) throw rosterErr;
    
    const repMap = {};
    for (const rep of roster) {
      if (rep.full_name) repMap[rep.full_name.toLowerCase()] = rep.rep_id;
    }
    
    // 2. Track all currently OPEN deal rooms in Supabase
    // So we can archive any that disappear from the active pipeline
    const { data: existingDeals, error: existingErr } = await supabase
      .from('discovery_sessions')
      .select('id, data, rep_id')
      .not('data->>status', 'eq', 'closed');
      
    if (existingErr) throw existingErr;
    const activeDbDealIds = new Set(existingDeals.map(d => d.id));
    
    // 3. Fetch ALL Open Opportunities from Salesloft
    let opps = [];
    let page = 1;
    let hasMore = true;
    
    console.log('[Pipeline Sync] Fetching all open opportunities...');
    while (hasMore) {
      const data = await slFetch(`/opportunities?per_page=100&page=${page}`);
      const openOpps = data.data.filter(o => !o.is_closed);
      opps = opps.concat(openOpps);
      
      // Safety limit to 10 pages (~1000 opps)
      if (data.metadata.paging.next_page && page < 10) {
        page++;
      } else {
        hasMore = false;
      }
    }
    
    console.log(`[Pipeline Sync] Found ${opps.length} open opportunities globally.`);
    
    // 4. Fetch Domain Mapping (first 5 pages of accounts ~500 accounts)
    console.log(`[Pipeline Sync] Building domain map...`);
    const accountMap = {}; // crm_id -> domain
    let accPage = 1;
    let accHasMore = true;
    while(accHasMore) {
      const data = await slFetch(`/accounts?per_page=100&page=${accPage}`);
      for (const acc of data.data) {
        if (acc.crm_id) accountMap[acc.crm_id] = cleanDomain(acc.domain);
      }
      if (data.metadata.paging.next_page && accPage < 5) accPage++;
      else accHasMore = false;
    }
    
    // 5. Process & Upsert
    let upsertCount = 0;
    let archiveCount = 0;
    let contactSyncCount = 0;
    
    for (const opp of opps) {
      const ownerName = opp.owner_crm_name ? opp.owner_crm_name.toLowerCase() : null;
      const repId = ownerName ? repMap[ownerName] : null;
      
      // Skip opportunities for reps not on our roster
      if (!repId) continue;
      
      const slId = `sl_${opp.id}`;
      // Remove from active list because we found it still open!
      activeDbDealIds.delete(slId);
      
      const domain = opp.account_crm_id ? accountMap[opp.account_crm_id] : null;
      
      let status = 'evaluating';
      if (opp.stage_name === 'Contracting' || opp.stage_name === 'Negotiating') status = 'negotiating';
      
      // --- Fetch Contacts ---
      let stakeholders = [];
      if (opp.account && opp.account.id) {
         try {
             // Fetch people associated with this account
             const peopleData = await slFetch(`/people?account_id%5Bin%5D=${opp.account.id}&per_page=100`);
             stakeholders = peopleData.data.map(p => ({
                 name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
                 email: p.email_address,
                 title: p.title || 'Unknown',
                 role: 'Evaluating' // Default mapped role
             })).filter(p => p.email);
             if (stakeholders.length > 0) contactSyncCount++;
         } catch (e) {
             console.log(`[Pipeline Sync] Warning: could not fetch people for account ${opp.account.id}`);
         }
      }
      
      // --- Upsert Logic ---
      const payload = {
        id: slId,
        rep_id: repId, // Automatically updates if reassigned!
        data: {
          id: slId,
          rep_id: repId,
          status: status,
          deal_stage: opp.stage_name || 'Evaluating',
          deal_value: opp.amount ? parseFloat(opp.amount) : 0,
          company_name: opp.account_name || opp.name,
          company_domain: domain || null,
          company_id: opp.account_crm_id || null,
          opportunity_name: opp.name,
          meddpicc: {},
          bap_answers: {},
          stakeholders: stakeholders // Pre-populate contacts!
        }
      };
      
      const existing = existingDeals.find(d => d.id === slId);
      
      if (!existing) {
        // Insert
        const { error } = await supabase.from('discovery_sessions').insert(payload);
        if (!error) upsertCount++;
      } else {
        // Update (preserves intel)
        // If the rep_id changed, we update the root column too!
        const updatedData = {
           ...existing.data,
           rep_id: repId,
           status: payload.data.status,
           deal_stage: payload.data.deal_stage,
           deal_value: payload.data.deal_value,
           company_name: payload.data.company_name,
           company_domain: payload.data.company_domain,
           opportunity_name: payload.data.opportunity_name
        };
        
        // Merge stakeholders if they exist, to not overwrite notes/roles
        if (existing.data.stakeholders) {
           const existingEmails = new Set(existing.data.stakeholders.map(s => s.email));
           const newStakeholders = stakeholders.filter(s => !existingEmails.has(s.email));
           updatedData.stakeholders = [...existing.data.stakeholders, ...newStakeholders];
        } else {
           updatedData.stakeholders = stakeholders;
        }

        const { error } = await supabase.from('discovery_sessions')
          .update({ rep_id: repId, data: updatedData })
          .eq('id', slId);
          
        if (!error) upsertCount++;
      }
    }
    
    // 6. Archive closed deals
    // Any ID remaining in activeDbDealIds was NOT in the open opportunities list
    // This means it was Closed (Won or Lost) or Deleted.
    for (const archiveId of activeDbDealIds) {
      // Find its current data
      const existing = existingDeals.find(d => d.id === archiveId);
      if (existing) {
        const updatedData = { ...existing.data, status: 'closed' };
        await supabase.from('discovery_sessions').update({ data: updatedData }).eq('id', archiveId);
        archiveCount++;
      }
    }
    
    console.log(`[Pipeline Sync] Perfect Sync Complete!`);
    console.log(`[Pipeline Sync] Upserted/Updated: ${upsertCount} opportunities`);
    console.log(`[Pipeline Sync] Pre-populated contacts for: ${contactSyncCount} opportunities`);
    console.log(`[Pipeline Sync] Archived/Closed: ${archiveCount} stale opportunities`);
    
  } catch (error) {
    console.error('[Pipeline Sync] Fatal Error:', error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  syncSalesloftPipeline();
}

export { syncSalesloftPipeline };
