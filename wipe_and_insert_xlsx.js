import { createRequire } from 'module';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import crypto from 'crypto';

const require = createRequire(import.meta.url);
const xlsx = require('xlsx');

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
  const xlsxPath = '/Users/ryan.walker/Downloads/Team Walker Pipeline-2026-07-08-12-12-17.xlsx';
  const workbook = xlsx.readFile(xlsxPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const xlsxDeals = xlsx.utils.sheet_to_json(sheet);
  
  console.log("Found " + xlsxDeals.length + " deals in XLSX.");

  // Delete ALL deals in DB first
  const { data: dbSessions } = await supabase.from('discovery_sessions').select('id');
  console.log(`Found ${dbSessions.length} total deals in DB to delete.`);
  
  for(let i = 0; i < dbSessions.length; i += 50) {
    const batch = dbSessions.slice(i, i + 50).map(s => s.id);
    await supabase.from('discovery_sessions').delete().in('id', batch);
  }
  console.log("Deleted all deals.");

  const upserts = [];

  xlsxDeals.forEach(deal => {
    const oppName = deal['Opportunity Name'];
    const companyName = deal['Account Name'];
    const ownerName = deal['Opportunity Owner'];
    const stage = deal['Stage'];
    const amount = parseFloat(deal['Amount']) || 0;
    const forecastCategory = deal['Forecast Category'];
    const mostRecentUpdate = deal['Most Recent Update'];
    const compellingEvent = deal['Compelling Event'];
    
    const sfOppId = deal['Opportunity ID'] || deal['Opportunity Id'];
    const sfAccountId = deal['Account ID'];
    const nextSteps = deal['Next Steps'] || '';

    // MEDDPICC
    const metrics = deal['Metrics'] || '';
    const economicBuyer = deal['Economic Buyer'] || '';
    const decisionCriteria = deal['Decision Criteria'] || '';
    const decisionProcess = deal['Decision Process'] || '';
    const paperProcess = deal['Paper Process'] || '';
    const identifyPain = deal['Identify Pain'] || '';
    const champion = deal['Champion'] || '';
    const competition = deal['Competition'] || '';

    // Board keys: qualifying, investigating, evaluating, negotiating, contracting, signing, closed_won, closed_lost
    let mappedStage = (stage || '').toLowerCase().replace(/ /g, '_');

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
      
      // MEDDPICC mapping
      success_metrics_text: metrics,
      economic_buyer_access: economicBuyer,
      decision_criteria: decisionCriteria,
      decision_process: decisionProcess,
      paper_process: paperProcess,
      pain_narrative: identifyPain,
      champion_name: champion,
      competitive_situation: competition,

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

  // Update static seed file for anon loading
  const fs = require('fs');
  const sessions = upserts.map(u => u.data);
  fs.writeFileSync('public/pipeline_seed.json', JSON.stringify(sessions));

  console.log('✅ Sync complete.');
}

main();
