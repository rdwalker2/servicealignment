// ════════════════════════════════════════════════════════════
// Salesforce Data Sync — Field Mapping from Gordon (July 2026)
// ════════════════════════════════════════════════════════════
//
// SFDC Field → Supabase Column mapping:
//
//   Name                              → company_name
//   Email_Domain_Name__c              → domain (PK)
//   Website                           → domain (stripped)
//   Amount_of_Employees__c            → employee_count
//   LinkedIn Employee Range           → company_size_linkedin
//   Industry                          → industry (needs picklist alignment)
//   BillingCity                       → city
//   BillingCountry                    → billing_country
//   Current_ATS_Provider__c           → current_ats (needs picklist alignment)
//   Current_HR_Provider__c            → current_hr_provider
//   Company_LinkedIn__c               → linkedin_company_url
//   Lifecycle_Stage__c                → lifecycle_stage (needs picklist alignment)
//   AccountSource                     → audience_source (needs picklist alignment)
//   Reassignment_Id__c               → assigned_rep_id
//   Salesforce_Administration_Notes__c → sf_admin_notes
//
// ⚠️  PENDING: SFDC Connected App credentials from Gordon
// ════════════════════════════════════════════════════════════

// ── Value Conversion Functions ──
// SFDC uses picklist ranges for employees, simple lifecycle stages, etc.
// These functions translate between our Supabase integers/strings and SFDC picklist values.

// Convert our integer employee_count → SFDC picklist range
export function employeeCountToRange(count) {
  if (!count || count <= 0) return '--None--';
  if (count <= 25) return '1-25';
  if (count <= 100) return '26-100';
  if (count <= 250) return '101-250';
  if (count <= 500) return '251-500';
  if (count <= 1000) return '501-1000';
  if (count <= 2000) return '1001-2000';
  if (count <= 5000) return '2001-5000';
  return '5000+';
}

// Convert SFDC picklist range → our integer (midpoint for filtering/sorting)
export function rangeToEmployeeCount(range) {
  const map = {
    '1-25': 13, '26-100': 63, '101-250': 175,
    '251-500': 375, '501-1000': 750, '1001-2000': 1500,
    '2001-5000': 3500, '5000+': 7500,
  };
  return map[range] || null;
}

// Map our dispositions → SFDC Lifecycle_Stage__c
// SFDC only has 4 stages: --None--, Prospect, Customer, Churned
export function dispositionToLifecycleStage(disposition) {
  const map = {
    'new': 'Prospect', 'working': 'Prospect',
    'engaged': 'Prospect', 'meeting_set': 'Prospect',
    'nurture': 'Prospect', 'not_now': 'Prospect',
    'disqualified': '--None--',
  };
  return map[disposition] || 'Prospect';
}

// Map SFDC Lifecycle_Stage__c → our system
export function lifecycleStageToFlags(stage) {
  switch (stage) {
    case 'Customer': return { is_existing_customer: true, lifecycle_stage: 'Customer' };
    case 'Churned': return { is_existing_customer: false, lifecycle_stage: 'Churned' };
    case 'Prospect': return { is_existing_customer: false, lifecycle_stage: 'Prospect' };
    default: return { is_existing_customer: false, lifecycle_stage: null };
  }
}

// Normalize our ATS values → SFDC picklist values
export function normalizeAtsForSfdc(ats) {
  const fixes = {
    'None Detected': 'No ATS',
    'none': 'No ATS',
    'N/A': 'No ATS',
    'none detected': 'No ATS',
  };
  return fixes[ats] || ats;
}

// Map a Salesforce Account record → Supabase accounts row
function sfAccountToSupabase(sfRecord) {
  const domain = sfRecord.Email_Domain_Name__c || extractDomain(sfRecord.Website);
  if (!domain) return null;

  const lifecycleFlags = lifecycleStageToFlags(sfRecord.Lifecycle_Stage__c);
  const empCount = sfRecord.Amount_of_Employees__c
    ? rangeToEmployeeCount(sfRecord.Amount_of_Employees__c)
    : null;

  return {
    domain,
    company_name: sfRecord.Name || null,
    employee_count: empCount,
    employee_range: sfRecord.Amount_of_Employees__c || null,
    company_size_linkedin: sfRecord['LinkedIn Employee Range'] || null,
    industry: sfRecord.Industry || null,
    city: sfRecord.BillingCity || null,
    billing_country: sfRecord.BillingCountry || null,
    current_ats: sfRecord.Current_ATS_Provider__c || null,
    current_hr_provider: sfRecord.Current_HR_Provider__c || null,
    linkedin_company_url: sfRecord.Company_LinkedIn__c || null,
    lifecycle_stage: sfRecord.Lifecycle_Stage__c || null,
    is_existing_customer: lifecycleFlags.is_existing_customer,
    sf_account_source: sfRecord.AccountSource || null,
    assigned_rep_id: sfRecord.Reassignment_Id__c || null,
    sf_admin_notes: sfRecord.Salesforce_Administration_Notes__c || null,
    sf_account_id: sfRecord.Id || null,
    // New fields from screenshots
    account_tier: sfRecord.Account_Tier__c || null,
    ats_renewal_date: sfRecord.Current_ATS_Renewal_Date__c || null,
    previous_ats: sfRecord.Previous_ATS_Provider__c || null,
    previous_hr_provider: sfRecord.Previous_HR_Provider__c || null,
    account_research_insights: sfRecord.Account_Research_Insights__c || null,
  };
}

// Map a Supabase accounts row → Salesforce Account fields for write-back
function supabaseToSfAccount(row) {
  return {
    Name: row.company_name,
    Email_Domain_Name__c: row.domain,
    Website: row.domain ? `https://${row.domain}` : null,
    Amount_of_Employees__c: row.employee_range || employeeCountToRange(row.employee_count),
    Industry: row.industry,
    BillingCity: row.city,
    BillingCountry: row.billing_country,
    Current_ATS_Provider__c: normalizeAtsForSfdc(row.current_ats),
    Current_HR_Provider__c: row.current_hr_provider,
    Company_LinkedIn__c: row.linkedin_company_url,
    Lifecycle_Stage__c: row.lifecycle_stage || 'Prospect',
    AccountSource: row.sf_account_source || 'Clay',
    Reassignment_Id__c: row.assigned_rep_id,
  };
}

// Extract domain from URL
function extractDomain(url) {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// ── Exports (stubs until SFDC credentials are available) ──

export async function runFullSync() {
  console.log('[SF Sync] Full sync requested — field mapping ready, awaiting SFDC credentials from Gordon');
  return { synced: 0, message: 'Field mapping configured. Awaiting SFDC Connected App credentials.' };
}

export async function pullAccountOwnership() {
  console.log('[SF Sync] Pull ownership requested — SOQL ready:');
  console.log('[SF Sync]   SELECT Id, Name, Email_Domain_Name__c, Reassignment_Id__c, Lifecycle_Stage__c FROM Account');
  return { pulled: 0, message: 'Account ownership pull ready. Awaiting SFDC credentials.' };
}

export async function pushSignalActivity(domain) {
  console.log('[SF Sync] Push signals for:', domain);
  return { pushed: 0, domain, message: 'Signal push ready. Awaiting SFDC credentials.' };
}

// Export mapping functions for use by other modules
export { sfAccountToSupabase, supabaseToSfAccount, extractDomain };
