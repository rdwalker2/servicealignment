import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import crypto from 'crypto';

dotenv.config({ path: resolve(process.cwd(), '.env') });

// FIX: Use service role key to bypass RLS for data sync!
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result.map(val => val.replace(/^"|"$/g, ''));
}

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
  if (!fs.existsSync(csvPath)) {
    console.error(`Error: CSV file not found at ${csvPath}`);
    return;
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim().length > 0);
  const headers = parseCSVLine(lines[0]);

  const csvDeals = lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const deal = {};
    headers.forEach((header, idx) => {
      deal[header] = values[idx];
    });
    return deal;
  });

  console.log("Found " + csvDeals.length + " deals in CSV.");

  const { data: dbSessions, error } = await supabase.from('discovery_sessions').select('*');
  if (error) {
    console.error('Error fetching from Supabase:', error.message);
    return;
  }
  
  // Delete all db sessions that are NOT in the CSV (by Account Name & Opportunity Name)
  const validKeys = new Set(csvDeals.map(d => `${d['Account Name']}-${d['Opportunity Name']}`.toLowerCase()));
  
  const toDelete = dbSessions.filter(s => {
    if (s.id === 'demo-deal-1') return false; // don't delete demo deal
    const key = `${s.data.company_name}-${s.data.opportunity_name}`.toLowerCase();
    return !validKeys.has(key);
  });
  
  if (toDelete.length > 0) {
    console.log(`Deleting ${toDelete.length} invalid/old deals...`);
    // Delete in batches of 50
    for(let i=0; i<toDelete.length; i+=50) {
        const batch = toDelete.slice(i, i+50).map(s => s.id);
        await supabase.from('discovery_sessions').delete().in('id', batch);
    }
  }

  const dbByCompanyName = {};
  dbSessions.forEach(session => {
    const deal = session.data;
    if (deal.company_name) {
      dbByCompanyName[`${deal.company_name}-${deal.opportunity_name}`.toLowerCase()] = session;
    }
  });

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
    
    // Salesforce IDs from the new CSV
    const sfOppId = csvDeal['Opportunity ID'] || csvDeal['Opportunity Id'];
    const sfAccountId = csvDeal['Account ID'];
    const nextSteps = csvDeal['Next Steps'] || '';

    let mappedStage = (stage || '').toLowerCase().replace(/ /g, '_');
    if (mappedStage === 'qualifying') mappedStage = 'discovery';
    else if (mappedStage === 'investigating') mappedStage = 'diagnosis';
    else if (mappedStage === 'evaluating') mappedStage = 'demonstrate';
    else if (mappedStage === 'negotiating' || mappedStage === 'contracting' || mappedStage === 'signing') mappedStage = 'decision';
    else if (mappedStage === 'closed won') mappedStage = 'closed_won';
    else if (mappedStage === 'closed lost') mappedStage = 'closed_lost';

    const repId = ownerMap[ownerName] || 'unassigned';
    const key = `${companyName}-${oppName}`.toLowerCase();
    const dbSession = dbByCompanyName[key];

    if (!dbSession) {
      // 1. Missing Deal -> Insert
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
    } else {
      // 2. Existing Deal -> Update
      const dbDeal = dbSession.data;
      
      const updatedData = {
        ...dbDeal,
        deal_stage: mappedStage,
        deal_value: amount,
        opportunity_name: oppName,
        forecast_category: forecastCategory?.toLowerCase() || dbDeal.forecast_category || 'pipeline',
        sf_opportunity_id: sfOppId || dbDeal.sf_opportunity_id,
        company_id: sfAccountId || dbDeal.company_id,
        most_recent_update: mostRecentUpdate || dbDeal.most_recent_update,
        next_action: nextSteps || dbDeal.next_action,
      };

      upserts.push({
        id: dbSession.id,
        rep_id: dbSession.rep_id || repId,
        data: updatedData,
        created_at: dbSession.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  });

  if (upserts.length === 0) {
    console.log('No updates needed. Everything is in sync.');
    return;
  }

  console.log(`Executing ${upserts.length} upserts to Supabase...`);
  
  // Bulk Upsert in batches of 50
  for (let i = 0; i < upserts.length; i += 50) {
    const batch = upserts.slice(i, i + 50);
    const { error: upsertError } = await supabase.from('discovery_sessions').upsert(batch);
    if (upsertError) {
      console.error(`Error in batch ${i}:`, upsertError.message);
    } else {
      console.log(`Successfully upserted batch ${i} to ${i + batch.length}`);
    }
  }

  console.log('✅ Sync complete.');
}

main();
