// Export Rippling audience accounts as CSV with Salesforce field mappings
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const supabase = createClient(
  'https://tqmpaaxocpwmziivxkym.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxbXBhYXhvY3B3bXppaXZ4a3ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTE5MzgxNCwiZXhwIjoyMDk2NzY5ODE0fQ.TUwDSbyhI6FMhO6XMq_pgAOQCn_zHxHHrCh6i1C2dkE'
);

// Employee count to SFDC range
function employeeCountToRange(count) {
  if (!count || count <= 0) return '';
  if (count <= 25) return '1-25';
  if (count <= 100) return '26-100';
  if (count <= 250) return '101-250';
  if (count <= 500) return '251-500';
  if (count <= 1000) return '501-1000';
  if (count <= 2000) return '1001-2000';
  if (count <= 5000) return '2001-5000';
  return '5000+';
}

async function main() {
  console.log('Fetching Rippling accounts from Supabase...');
  
  // Supabase limits to 1000 per query — paginate
  let allData = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('audience_source', 'rippling')
      .order('employee_count', { ascending: false, nullsFirst: false })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
    allData = allData.concat(data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  const data = allData;
  console.log(`Found ${data.length} Rippling accounts`);

  // SFDC field headers (Gordon's mapping)
  const headers = [
    'Name',                          // company_name
    'Email_Domain_Name__c',          // domain
    'Website',                       // domain as URL
    'Amount_of_Employees__c',        // employee range bucket
    'Employee_Count_Exact',          // our integer (not in SFDC but useful)
    'Industry',                      // industry
    'BillingCity',                   // city
    'BillingState',                  // state
    'BillingCountry',               // billing_country
    'Current_ATS_Provider__c',       // current_ats
    'Current_HR_Provider__c',        // current_hr_provider
    'Company_LinkedIn__c',           // linkedin_company_url
    'Lifecycle_Stage__c',            // lifecycle_stage or default
    'AccountSource',                 // sf_account_source or 'Clay'
    'Reassignment_Id__c',            // assigned_rep_id
    // Extra fields from our system
    'Audience_Source',               // audience_source (our internal tracking)
    'Tier',                          // tier
    'Is_Existing_Customer',          // is_existing_customer
    'Score',                         // signal score if available
    'Created_At',                    // created_at
  ];

  // Build CSV rows
  const rows = data.map(a => [
    escapeCsv(a.company_name || ''),
    escapeCsv(a.domain || ''),
    escapeCsv(a.domain ? `https://${a.domain}` : ''),
    escapeCsv(a.employee_range || employeeCountToRange(a.employee_count)),
    a.employee_count || '',
    escapeCsv(a.industry || ''),
    escapeCsv(a.city || a.hq_city || (a.location ? a.location.split(',')[0]?.trim() : '') || ''),
    escapeCsv(a.state || a.hq_state || (a.location ? a.location.split(',')[1]?.trim() : '') || ''),
    escapeCsv(a.billing_country || ''),
    escapeCsv(a.current_ats || ''),
    escapeCsv(a.current_hr_provider || ''),
    escapeCsv(a.linkedin_company_url || ''),
    escapeCsv(a.lifecycle_stage || (a.is_existing_customer ? 'Customer' : 'Prospect')),
    escapeCsv(a.sf_account_source || 'Clay'),
    escapeCsv(a.assigned_rep_id || ''),
    escapeCsv(a.audience_source || ''),
    escapeCsv(a.tier || ''),
    a.is_existing_customer ? 'TRUE' : 'FALSE',
    '',  // score placeholder
    a.created_at || '',
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  
  const outputPath = '/Users/ryan.walker/Desktop/Rippling_Audience_SFDC_Mapped.csv';
  writeFileSync(outputPath, csv);
  console.log(`\n✅ Saved ${data.length} accounts to: ${outputPath}`);
  
  // Summary stats
  const atsDistribution = {};
  const sizeDistribution = {};
  data.forEach(a => {
    const ats = a.current_ats || 'Unknown';
    atsDistribution[ats] = (atsDistribution[ats] || 0) + 1;
    const range = a.employee_range || employeeCountToRange(a.employee_count) || 'Unknown';
    sizeDistribution[range] = (sizeDistribution[range] || 0) + 1;
  });
  
  console.log('\nATS Distribution (top 10):');
  Object.entries(atsDistribution).sort((a, b) => b[1] - a[1]).slice(0, 10)
    .forEach(([ats, ct]) => console.log(`  ${ats}: ${ct}`));
  
  console.log('\nSize Distribution:');
  Object.entries(sizeDistribution).sort((a, b) => b[1] - a[1])
    .forEach(([range, ct]) => console.log(`  ${range}: ${ct}`));
}

function escapeCsv(val) {
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

main().catch(console.error);
