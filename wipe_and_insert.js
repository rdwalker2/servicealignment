import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import crypto from 'crypto';
import Papa from 'papaparse';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const ownerMap = {
  'Jack Luther': 'rep-jl',
  'Moe Aqel': 'rep-ma',
  'Tyler Hanson': 'rep-th',
  'Katy Shelman': 'rep-ks',
  'Brian McGarry': 'exec-bm',
  'Ryan Walker': 'admin-ryan',
  'Daniel Mathisen': 'exec-dm',
  'Gordon French': 'exec-gf',
  'Jesper Åström': 'exec-ja'
};

async function main() {
  const csvPath = '/Users/ryan.walker/Desktop/report1783474441133.csv';
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  const parseResult = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
  const csvDeals = parseResult.data;
  console.log("Found " + csvDeals.length + " deals in CSV using PapaParse.");

  // Delete ALL deals in DB first
  const { data: dbSessions } = await supabase.from('discovery_sessions').select('id');
  console.log(`Found ${dbSessions.length} total deals in DB to delete.`);
  
  for(let i = 0; i < dbSessions.length; i += 50) {
    const batch = dbSessions.slice(i, i + 50).map(s => s.id);
    await supabase.from('discovery_sessions').delete().in('id', batch);
  }
  console.log("Deleted all deals.");

  const upserts = [];

  csvDeals.forEach(csvDeal => {
    const oppName = csvDeal['Opportunity Name'];
    const companyName = csvDeal['Account Name'];
    const ownerName = csvDeal['Opportunity Owner'];
    const stage = csvDeal['Stage'];
    const amount = parseFloat(csvDeal['Amount']) || 0;
    const forecastCategory = csvDeal['Forecast Category'];
    const mostRecentUpdate = csvDeal['Most Recent Update'];
    const compellingEvent = csvDeal['Compelling Event'];
    
    const sfOppId = csvDeal['Opportunity ID'] || csvDeal['Opportunity Id'];
    const sfAccountId = csvDeal['Account ID'];
    const nextSteps = csvDeal['Next Steps'] || '';

    // USE THE EXACT STAGE KEYS THE PIPELINE BOARD EXPECTS!
    // Board keys: qualifying, investigating, evaluating, negotiating, contracting, signing, closed_won, closed_lost
    let mappedStage = (stage || '').toLowerCase().replace(/ /g, '_');
    // These already match: qualifying, investigating, evaluating, negotiating, contracting, signing
    // Just need to handle closed_won and closed_lost (already handled by replace above)

    const repId = ownerMap[ownerName] || 'unassigned';
    
    const newId = crypto.randomUUID();
    const newData = {
      id: newId,
      rep_id: repId,
      company_name: companyName,
      opportunity_name: oppName,
      deal_stage: mappedStage,
      deal_value: amount,
      forecast_category: forecastCategory?.toLowerCase() || 'pipeline',
      most_recent_update: mostRecentUpdate || '',
      compelling_event: compellingEvent || '',
      sf_opportunity_id: sfOppId,
      company_id: sfAccountId,
      next_action: nextSteps,
      selected_pains: [],
      roi_inputs: {
        hiringManagers: 5, totalHires: 20, agencyHires: 5, timeToHire: 45
      },
      roi_total: 0,
      blueprint_approved: false,
      alignment_checks: { urgent_priority: false, resources_insufficient: false, problems_solutions: false, roi_sufficient: false, right_solution: false },
      mutual_commitments: { executive_sponsor: false, dedicated_admin: false, training_completion: false },
      bap_answers: {},
      bap_notes: {}
    };

    upserts.push({
      id: newId,
      rep_id: repId,
      data: newData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  });

  // Print stage distribution for verification
  const stageCounts = {};
  upserts.forEach(u => {
    const s = u.data.deal_stage;
    stageCounts[s] = (stageCounts[s] || 0) + 1;
  });
  console.log('Stage distribution:', stageCounts);

  console.log(`Executing ${upserts.length} inserts to Supabase...`);
  
  for (let i = 0; i < upserts.length; i += 50) {
    const batch = upserts.slice(i, i + 50);
    await supabase.from('discovery_sessions').upsert(batch);
    console.log(`Inserted batch ${i} to ${i + batch.length}`);
  }

  console.log('✅ Sync complete.');
}

main();
