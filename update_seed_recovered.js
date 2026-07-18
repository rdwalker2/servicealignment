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

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') { inQuotes = !inQuotes; }
    else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else { current += char; }
  }
  result.push(current.trim());
  return result.map(val => val.replace(/^"|"$/g, ''));
}

function mapStage(stage) {
  return (stage || '').toLowerCase().replace(/ /g, '_');
}

// 1. Load Closed Deals from CSV
const csvPath = '/Users/ryan.walker/Desktop/report1783474441133.csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim().length > 0);
const headers = parseCSVLine(lines[0]);
const allCsvDeals = lines.slice(1).map(line => {
  const values = parseCSVLine(line);
  const deal = {};
  headers.forEach((header, idx) => { deal[header] = values[idx]; });
  return deal;
});

const closedCsvDeals = allCsvDeals.filter(d => {
  const s = mapStage(d['Stage'] || '');
  return s === 'closed_won' || s === 'closed_lost';
});

const closedDealsJSON = closedCsvDeals.map(csvDeal => {
  const newId = crypto.randomUUID();
  const ownerName = csvDeal['Opportunity Owner'];
  const repId = ownerMap[ownerName] || 'unassigned';
  const amount = parseFloat(csvDeal['Amount']) || 0;
  
  return {
    id: newId,
    rep_id: repId,
    company_name: csvDeal['Account Name'],
    opportunity_name: csvDeal['Opportunity Name'],
    deal_stage: mapStage(csvDeal['Stage'] || ''),
    deal_value: amount,
    forecast_category: (csvDeal['Forecast Category'] || 'omitted').toLowerCase(),
    most_recent_update: csvDeal['Most Recent Update'] || '',
    compelling_event: csvDeal['Compelling Event'] || '',
    selected_pains: [],
    roi_inputs: { hiringManagers: 5, totalHires: 20, agencyHires: 5, timeToHire: 45 },
    roi_total: 0,
    blueprint_approved: false,
    alignment_checks: { urgent_priority: false, resources_insufficient: false, problems_solutions: false, roi_sufficient: false, right_solution: false },
    mutual_commitments: { executive_sponsor: false, dedicated_admin: false, training_completion: false },
    bap_answers: {},
    bap_notes: {},
    success_metrics_text: csvDeal['Metrics'] || '',
    pain_narrative: csvDeal['Identify Pain'] || '',
    champion_name: csvDeal['Champion'] || '',
    champion_validation_notes: '',
    competitive_situation: csvDeal['Competition'] || '',
    economic_buyer_access: csvDeal['Economic Buyer'] || '',
    decision_criteria: csvDeal['Decision Criteria'] || '',
    decision_process: csvDeal['Decision Process'] || '',
    paper_process: csvDeal['Paper Process'] || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
});

// 2. Load Active Deals from XLSX
const workbook = xlsx.readFile('/Users/ryan.walker/Desktop/Team Walker Pipeline-2026-07-08-12-12-17.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const activeDeals = xlsx.utils.sheet_to_json(sheet);

const newActiveDeals = activeDeals.map(csvDeal => {
  const oppName = csvDeal['Opportunity Name'];
  const companyName = csvDeal['Account Name'];
  const ownerName = csvDeal['Opportunity Owner'];
  const stage = csvDeal['Stage'];
  const amount = parseFloat(csvDeal['Amount']) || 0;
  const forecastCategory = csvDeal['Forecast Category'];
  const mostRecentUpdate = csvDeal['Most Recent Update'];
  
  const mappedStage = mapStage(stage || '');
  const repId = ownerMap[ownerName] || 'unassigned';
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
    compelling_event: csvDeal['Compelling Event'] || '',
    selected_pains: [],
    roi_inputs: { hiringManagers: 5, totalHires: 20, agencyHires: 5, timeToHire: 45 },
    roi_total: 0,
    blueprint_approved: false,
    alignment_checks: { urgent_priority: false, resources_insufficient: false, problems_solutions: false, roi_sufficient: false, right_solution: false },
    mutual_commitments: { executive_sponsor: false, dedicated_admin: false, training_completion: false },
    bap_answers: {},
    bap_notes: {},
    success_metrics_text: csvDeal['Metrics'] || '',
    pain_narrative: csvDeal['Identify Pain'] || '',
    champion_name: csvDeal['Champion'] || '',
    champion_validation_notes: '',
    competitive_situation: csvDeal['Competition'] || '',
    economic_buyer_access: csvDeal['Economic Buyer'] || '',
    decision_criteria: csvDeal['Decision Criteria'] || '',
    decision_process: csvDeal['Decision Process'] || '',
    paper_process: csvDeal['Paper Process'] || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
});

const merged = [...closedDealsJSON, ...newActiveDeals];

const seedPath = '/Users/ryan.walker/Desktop/teamtailor/public/pipeline_seed.json';
fs.writeFileSync(seedPath, JSON.stringify(merged, null, 2));
console.log(`Successfully wrote ${merged.length} total deals to pipeline_seed.json (${newActiveDeals.length} active, ${closedDealsJSON.length} closed).`);

