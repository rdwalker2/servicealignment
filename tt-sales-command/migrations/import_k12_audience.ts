// ── K-12 Audience Import Script ──
// Reads k12_master.json and imports districts into audience_seeds
// with universal fields + K-12 metadata JSON

import fs from 'fs';

interface K12District {
  name: string;
  state: string;
  city: string;
  website: string;
  phone: string;
  phone_formatted: string;
  email_domain: string;
  students_2025: number;
  enrollment_trend_pct: number;
  total_staff_2025: number;
  staff_trend_pct: number;
  total_salary_spend: number;
  salary_pct_of_total: number;
  classified_staff: number;
  classified_ratio: number;
  total_schools: number;
  pupil_teacher_ratio: number;
  locale_type: string;
  near_customer: boolean;
  nearest_customer_name: string | null;
  current_ats: string;
  target_persona: string;
  hr_sis_platform: string;
  uses_apptegy: boolean;
  total_revenue: number;
  is_customer: boolean;
  priority_score: number;
  icp_label: string;
  contacts: any[];
  address: string;
  zip: string;
  county: string;
  total_expenditures: number;
  total_expenditures_per_pupil: number;
  total_revenue_per_pupil: number;
  salary_expenditures: number;
  local_revenue_pct: number;
  state_revenue_pct: number;
  federal_revenue_pct: number;
  instruction_exp_per_pupil: number;
}

const raw = fs.readFileSync('public/data/k12_master.json', 'utf-8');
const districts: K12District[] = JSON.parse(raw);

// Filter out existing customers
const prospects = districts.filter(d => !d.is_customer);

console.log(`Total districts: ${districts.length}`);
console.log(`Non-customers: ${prospects.length}`);

// Map to audience_seeds rows
const seeds = prospects.map(d => {
  const domain = (d.email_domain || d.website || '')
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    .toLowerCase();

  return {
    // Universal fields
    company_name: d.name,
    company_domain: domain || `${d.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.k12`,
    company_location: `${d.city}, ${d.state}`,
    employee_count: Math.round(d.total_staff_2025 || 0),
    current_ats: d.current_ats || '',
    industry: 'K-12 Education',
    audience_source: 'k12',
    market: 'us',
    status: 'pending',
    created_by: 'system',
    annual_revenue: d.total_revenue || null,
    headcount_growth_pct: d.staff_trend_pct || null,
    website: d.website || null,
    phone: d.phone_formatted || d.phone || null,
    email_domain: d.email_domain || null,
    state: d.state || null,
    // Vertical-specific metadata
    metadata: {
      students_2025: d.students_2025,
      enrollment_trend_pct: d.enrollment_trend_pct,
      total_salary_spend: d.total_salary_spend,
      salary_pct_of_total: d.salary_pct_of_total,
      classified_staff: d.classified_staff,
      classified_ratio: d.classified_ratio,
      total_schools: d.total_schools,
      pupil_teacher_ratio: d.pupil_teacher_ratio,
      locale_type: d.locale_type,
      near_customer: d.near_customer,
      nearest_customer_name: d.nearest_customer_name,
      target_persona: d.target_persona,
      hr_sis_platform: d.hr_sis_platform,
      uses_apptegy: d.uses_apptegy,
      total_expenditures: d.total_expenditures,
      total_revenue_per_pupil: d.total_revenue_per_pupil,
      county: d.county,
      zip: d.zip,
      address: d.address,
      contacts_count: d.contacts?.length || 0,
      legacy_priority_score: d.priority_score,
      legacy_icp_label: d.icp_label,
    },
  };
});

// Output as JSON for curl import (batched)
const BATCH_SIZE = 500;
const batches = [];
for (let i = 0; i < seeds.length; i += BATCH_SIZE) {
  batches.push(seeds.slice(i, i + BATCH_SIZE));
}

console.log(`Generated ${seeds.length} seed rows in ${batches.length} batches of ${BATCH_SIZE}`);

// Write batches to temp files
for (let i = 0; i < batches.length; i++) {
  const filename = `k12_batch_${i}.json`;
  fs.writeFileSync(filename, JSON.stringify(batches[i]));
  console.log(`Wrote ${filename} (${batches[i].length} rows)`);
}

console.log('\nRun the following to import:');
console.log('for f in k12_batch_*.json; do');
console.log('  curl -s -X POST "https://tqmpaaxocpwmziivxkym.supabase.co/rest/v1/audience_seeds" \\');
console.log('    -H "apikey: $SERVICE_KEY" \\');
console.log('    -H "Authorization: Bearer $SERVICE_KEY" \\');
console.log('    -H "Content-Type: application/json" \\');
console.log('    -H "Prefer: return=minimal" \\');
console.log('    -d @"$f"');
console.log('  echo "Imported $f"');
console.log('done');
