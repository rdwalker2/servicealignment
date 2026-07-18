import xlsx from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

async function compare() {
  const filePath = '/Users/ryan.walker/Desktop/Team Walker Pipeline-2026-07-08-17-51-55.xlsx';
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
  
  // Find the row with "Opportunity Name"
  let headerRowIndex = 0;
  for (let i = 0; i < rawData.length; i++) {
    if (rawData[i].includes('Opportunity Name') || rawData[i].includes('Name')) {
      headerRowIndex = i;
      break;
    }
  }
  
  const sfData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { range: headerRowIndex });
  
  console.log(`\n--- SALESFORCE EXPORT ---`);
  const sfOpps = sfData.map(row => row['Opportunity Name'] || row['Name']).filter(Boolean);
  console.log(`Found ${sfOpps.length} active opportunities in Salesforce Export.`);
  
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  
  const { data: dbData, error } = await supabase.from('discovery_sessions').select('data');
  if (error) {
    console.error('DB Error:', error);
    return;
  }
  
  const slOpps = dbData.map(d => d.data.opportunity_name || d.data.company_name).filter(Boolean);
  
  console.log(`\n--- SALESLOFT -> SUPABASE SYNC ---`);
  console.log(`Found ${slOpps.length} opportunities currently mapped in Supabase.\n`);
  
  // Find discrepancies
  const missingInSL = sfOpps.filter(opp => !slOpps.some(s => s && s.toLowerCase() === opp.toLowerCase()));
  const extraInSL = slOpps.filter(opp => !sfOpps.some(s => s && s.toLowerCase() === opp.toLowerCase()));
  
  console.log(`Opportunities in Salesforce Export but NOT in Supabase: ${missingInSL.length}`);
  if (missingInSL.length > 0) {
    missingInSL.slice(0, 10).forEach(o => console.log(`  - ${o}`));
    if (missingInSL.length > 10) console.log(`  ... and ${missingInSL.length - 10} more`);
  }
  
  console.log(`\nOpportunities in Supabase but NOT in Salesforce Export: ${extraInSL.length}`);
  if (extraInSL.length > 0) {
    extraInSL.slice(0, 10).forEach(o => console.log(`  - ${o}`));
    if (extraInSL.length > 10) console.log(`  ... and ${extraInSL.length - 10} more`);
  }
  
  if (missingInSL.length === 0 && extraInSL.length === 0) {
    console.log('\n✅ PERFECT MATCH! The Salesloft API sync exactly mirrors your Salesforce export.');
  }
}

compare();
