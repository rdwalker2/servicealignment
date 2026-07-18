import { createRequire } from 'module';
import fs from 'fs';
import crypto from 'crypto';

const require = createRequire(import.meta.url);
const xlsx = require('xlsx');

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

const workbook = xlsx.readFile('/Users/ryan.walker/Desktop/Team Walker Pipeline-2026-07-08-12-12-17.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const activeDeals = xlsx.utils.sheet_to_json(sheet);

const seedPath = '/Users/ryan.walker/Desktop/teamtailor/public/pipeline_seed.json';
let existingSeed = [];
if (fs.existsSync(seedPath)) {
  existingSeed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
}

// Keep only closed won/lost from existing seed
const closedDeals = existingSeed.filter(s => 
  s.deal_stage === 'closed_won' || s.deal_stage === 'closed_lost'
);

const newActiveDeals = activeDeals.map(csvDeal => {
  const oppName = csvDeal['Opportunity Name'];
  const companyName = csvDeal['Account Name'];
  const ownerName = csvDeal['Opportunity Owner'];
  const stage = csvDeal['Stage'];
  const amount = parseFloat(csvDeal['Amount']) || 0;
  const forecastCategory = csvDeal['Forecast Category'];
  const mostRecentUpdate = csvDeal['Most Recent Update'];
  const compellingEvent = csvDeal['Compelling Event'];

  let mappedStage = stage.toLowerCase().replace(/ /g, '_');
  if (mappedStage === 'qualifying') mappedStage = 'discovery';
  else if (mappedStage === 'investigating') mappedStage = 'diagnosis';
  else if (mappedStage === 'evaluating') mappedStage = 'demonstrate';
  else if (mappedStage === 'negotiating' || mappedStage === 'contracting' || mappedStage === 'signing') mappedStage = 'decision';

  const repId = ownerMap[ownerName] || 'unassigned';
  const key = companyName.toLowerCase().trim();

  // Look for existing deal in seed to preserve BAP answers/notes
  const existing = existingSeed.find(s => 
    s.company_name.toLowerCase().trim() === key
  );

  if (existing) {
    existing.rep_id = repId;
    existing.deal_stage = mappedStage;
    existing.deal_value = amount;
    existing.opportunity_name = oppName;
    existing.forecast_category = forecastCategory?.toLowerCase() || existing.forecast_category || 'pipeline';
    existing.most_recent_update = mostRecentUpdate || existing.most_recent_update || '';
    existing.compelling_event = compellingEvent || existing.compelling_event || '';
    return existing;
  } else {
    const newId = crypto.randomUUID();
    return {
      id: newId,
      rep_id: repId,
      company_name: companyName,
      opportunity_name: oppName,
      deal_stage: mappedStage,
      deal_value: amount,
      forecast_category: forecastCategory?.toLowerCase() || 'pipeline',
      most_recent_update: mostRecentUpdate || '',
      compelling_event: compellingEvent || '',
      selected_pains: [],
      roi_inputs: {
        hiringManagers: 5, totalHires: 20, agencyHires: 5, timeToHire: 45
      },
      roi_total: 0,
      blueprint_approved: false,
      alignment_checks: { urgent_priority: false, resources_insufficient: false, problems_solutions: false, roi_sufficient: false, right_solution: false },
      mutual_commitments: { executive_sponsor: false, dedicated_admin: false, training_completion: false },
      bap_answers: {},
      bap_notes: {},
      success_metrics_text: '',
      pain_narrative: '',
      champion_name: '',
      champion_validation_notes: '',
      competitive_situation: '',
      economic_buyer_access: '',
      decision_criteria: '',
      decision_process: '',
      paper_process: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
});

const merged = [...closedDeals, ...newActiveDeals];

fs.writeFileSync(seedPath, JSON.stringify(merged, null, 2));
console.log(`Successfully wrote ${merged.length} total deals to pipeline_seed.json (${newActiveDeals.length} active, ${closedDeals.length} closed).`);
