// ─── K12 District Data ──────────────────────────────────────────────────────
// Source: /data/k12_master.json (NCES 2024-25 Master Dataset)
// ~9,451 school districts loaded at runtime

// ─── Contact ────────────────────────────────────────────────────────────────

export interface K12Contact {
  name: string;
  title: string;
  email?: string;
  email_inferred?: boolean;
  phone?: string;
  phone_is_main?: boolean;
  mobile?: string;
  linkedin_url?: string;
  role: 'decision_maker' | 'champion' | 'gatekeeper' | 'contact';
  manually_added?: boolean;
}

// ─── District ───────────────────────────────────────────────────────────────

export interface K12District {
  // Identity
  nces_id: string;
  name: string;
  entity_type?: string; // 'district' | 'county_office' | 'service_agency' etc.

  // Location
  state: string;
  city: string;
  county: string;
  locale: string;        // full NCES locale string
  locale_type: string;   // 'City' | 'Suburb' | 'Town' | 'Rural'
  lat?: number;
  lon?: number;

  // Tech stack
  current_ats: string;
  website_platform: string;  // CMS
  hr_sis_platform: string;
  tech_ecosystem: string;    // 'Google Workspace' | 'Microsoft 365' | etc.

  // Online presence
  website: string;
  careers_url: string;
  phone?: string;
  phone_formatted?: string;
  linkedin_url?: string;

  // Staff metrics
  total_staff_2025: number;
  total_staff_2024: number;
  staff_trend_pct: number;
  classified_staff?: number;
  classified_ratio?: number;
  fte_teachers_2025?: number;

  // Student metrics
  students_2025: number;
  students_2024: number;
  enrollment_trend_pct: number;
  total_schools: number;
  pupil_teacher_ratio?: number;

  // Financials
  total_revenue_per_pupil: number;
  total_revenue?: number;
  total_expenditures?: number;
  total_salary_spend?: number;
  salary_pct_of_total?: number;
  local_revenue_pct?: number;
  state_revenue_pct?: number;
  federal_revenue_pct?: number;

  // Prospecting
  target_persona: string;     // e.g. "Director of HR / Superintendent"
  is_customer: boolean;
  uses_apptegy: boolean;
  near_customer: boolean;
  nearest_customer_dist?: number;
  nearest_customer_name?: string;
  active_jobs_count?: number;
  active_jobs_url?: string;

  // Contacts
  contacts: K12Contact[];

  // ── Computed (enriched after load) ──
  priority_score: number;
  icp_label: string;    // 'A' | 'B' | 'C' | 'D'
  icp_score: number;    // 4 | 3 | 2 | 1
  location: string;     // "{city}, {state}"
}

// ─── Provider Classification ─────────────────────────────────────────────────────

export const LEGACY_ATS = new Set([
  'Frontline/AppliTrack', 'TalentEd/PowerSchool', 'SchoolSpring',
  'OLAS', 'RecruitFront', 'RedRover',
]);

export const JOBBOARD_ATS = new Set([
  'EdJoin (Job Board)', 'EdJoin + NEOGOV', 'EdJoin', 'EDJOIN', 'Nimble',
]);

export const MODERN_ATS = new Set([
  'Greenhouse', 'Lever', 'Workday', 'SmartRecruiters', 'JazzHR',
  'BambooHR', 'Breezy HR', 'iCIMS', 'Jobvite', 'NEOGOV',
  'ADP/Workforce Now', 'Paycom', 'UltiPro/UKG', 'ApplicantPro', 'Hireology',
]);

export const NO_ATS_VALUES = new Set([
  'Unknown', 'Not Scanned', 'No Provider Detected', '',
]);

export type AtsCategory = 'none' | 'paper' | 'jobboard' | 'legacy' | 'modern' | 'servicealignment' | 'unknown';

export function classifyAts(ats: string): AtsCategory {
  if (ats === 'Service Alignment') return 'servicealignment';
  if (ats === 'Paper/Manual') return 'paper';
  if (JOBBOARD_ATS.has(ats)) return 'jobboard';
  if (NO_ATS_VALUES.has(ats)) return 'none';
  if (LEGACY_ATS.has(ats)) return 'legacy';
  if (MODERN_ATS.has(ats)) return 'modern';
  return 'unknown';
}

// ─── Priority Scoring ───────────────────────────────────────────────────────

export function computePriority(d: K12District): number {
  let score = 0;
  const ats = d.current_ats || '';

  // Customer = max priority
  if (d.is_customer) return 100;

  // Provider scoring — Paper/Manual is the HOTTEST lead
  if (ats === 'Paper/Manual') score += 30;
  else if (NO_ATS_VALUES.has(ats) || JOBBOARD_ATS.has(ats)) score += 25;
  else if (LEGACY_ATS.has(ats)) score += 15;

  // Staff growth
  const sg = d.staff_trend_pct || 0;
  if (sg > 5) score += 20;
  else if (sg > 0) score += 10;

  // Locale
  const loc = d.locale_type || '';
  if (loc === 'Suburb') score += 10;
  else if (loc === 'City') score += 5;

  // Revenue per pupil
  const rev = d.total_revenue_per_pupil || 0;
  if (rev > 30000) score += 15;
  else if (rev > 20000) score += 10;

  // Staff size (ICP sweet spot)
  const staff = d.total_staff_2025 || 0;
  if (staff >= 100 && staff <= 500) score += 15;
  else if (staff > 500 && staff <= 1500) score += 10;

  // Near customer bonus
  if (d.near_customer) score += 10;

  // Apptegy user bonus (modern brand, no Provider)
  if (d.uses_apptegy) score += 8;

  // Has website
  if (d.website) score += 2;

  return score;
}

// ─── ICP Fit Scoring ────────────────────────────────────────────────────────

export function computeICP(d: K12District): { label: string; score: number } {
  const staff = d.total_staff_2025 || 0;
  const loc = d.locale_type || '';
  const isSuburbOrCity = loc === 'Suburb' || loc === 'City';

  if (staff >= 100 && staff <= 1500 && isSuburbOrCity) return { label: 'A', score: 4 };
  if (staff >= 100 && staff <= 1500) return { label: 'B', score: 3 };
  if (staff > 1500 && staff <= 5000 && isSuburbOrCity) return { label: 'B', score: 3 };
  if (staff >= 50 && staff < 100) return { label: 'C', score: 2 };
  if (staff > 5000) return { label: 'C', score: 2 };
  return { label: 'D', score: 1 };
}

// ─── Data Loading ───────────────────────────────────────────────────────────

export async function loadK12Data(): Promise<K12District[]> {
  const resp = await fetch('/data/k12_master.json');
  const raw: K12District[] = await resp.json();

  // Enrich each record
  raw.forEach(d => {
    d.priority_score = computePriority(d);
    const icp = computeICP(d);
    d.icp_label = icp.label;
    d.icp_score = icp.score;
    if (!d.current_ats) d.current_ats = 'Not Scanned';
    if (!d.locale_type) d.locale_type = 'Unknown';
    d.location = (d.city || '') + ', ' + (d.state || '');
  });

  // Filter to districts only
  return raw.filter(d => !d.entity_type || d.entity_type === 'district');
}

// ─── Contact Overrides (localStorage) ───────────────────────────────────────

const OVERRIDES_KEY = 'k12_contact_overrides';

export function loadContactOverrides(): Record<string, K12Contact[]> {
  try { return JSON.parse(localStorage.getItem(OVERRIDES_KEY) || '{}'); } catch { return {}; }
}

export function saveContactOverrides(overrides: Record<string, K12Contact[]>) {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
}

export function getContacts(d: K12District): K12Contact[] {
  const overrides = loadContactOverrides();
  return overrides[d.nces_id] || d.contacts || [];
}

export function saveContactsForDistrict(ncesId: string, contacts: K12Contact[]) {
  const overrides = loadContactOverrides();
  overrides[ncesId] = contacts;
  saveContactOverrides(overrides);
}

export function deleteContactOverride(ncesId: string) {
  const overrides = loadContactOverrides();
  delete overrides[ncesId];
  saveContactOverrides(overrides);
}

// ─── CSV Export Helpers ─────────────────────────────────────────────────────

function csvEscape(v: unknown): string {
  if (v == null || v === '') return '""';
  return '"' + String(v).replace(/"/g, '""') + '"';
}

function downloadCSV(filename: string, headers: string[], rows: unknown[][]) {
  const csv = [headers.map(csvEscape), ...rows.map(r => r.map(csvEscape))].map(r => (r as string[]).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function splitName(fullName: string): { first: string; last: string } {
  if (!fullName?.trim()) return { first: '', last: '' };
  let name = fullName.trim();
  const prefixes = ['Dr.', 'Dr', 'Mr.', 'Mr', 'Mrs.', 'Mrs', 'Ms.', 'Ms', 'Rev.', 'Rev', 'Prof.', 'Prof'];
  for (const p of prefixes) {
    if (name.toLowerCase().startsWith(p.toLowerCase() + ' ')) {
      name = name.slice(p.length).trim();
    }
  }
  const suffixes = ['Jr.', 'Jr', 'Sr.', 'Sr', 'III', 'II', 'IV', 'Ed.D.', 'Ed.D', 'Ph.D.', 'Ph.D', 'M.Ed.', 'M.Ed', 'MBA', 'Esq.', 'Esq'];
  for (const s of suffixes) {
    if (name.endsWith(' ' + s) || name.endsWith(', ' + s)) {
      name = name.replace(new RegExp('[, ]*' + s.replace('.', '\\.') + '$'), '').trim();
    }
  }
  const parts = name.split(/\s+/);
  if (parts.length === 0) return { first: '', last: '' };
  if (parts.length === 1) return { first: parts[0], last: parts[0] };
  return { first: parts[0], last: parts[parts.length - 1] };
}

export function exportAccountsCSV(districts: K12District[]) {
  const date = new Date().toISOString().slice(0, 10);
  const headers = [
    'NCES_ID', 'Account_Name', 'Website', 'Phone', 'City', 'State',
    'Industry', 'Employees', 'Type', 'Locale_Type',
    'Current_ATS', 'Website_CMS', 'HR_SIS_Platform',
    'Student_Count', 'Revenue_Per_Pupil', 'Staff_Growth_Pct',
    'Priority_Score', 'ICP_Fit', 'Near_Customer', 'Nearest_Customer',
  ];
  const rows = districts.map(d => [
    d.nces_id, titleCase(d.name), d.website || '', d.phone_formatted || '',
    d.city ? titleCase(d.city) : '', d.state || '', 'Primary/Secondary Education',
    d.total_staff_2025 ? Math.round(d.total_staff_2025) : '',
    d.is_customer ? 'Customer' : 'Prospect', d.locale_type || '',
    d.current_ats || '', d.website_platform || '', d.hr_sis_platform || '',
    d.students_2025 || '', d.total_revenue_per_pupil ? Math.round(d.total_revenue_per_pupil) : '',
    d.staff_trend_pct != null ? d.staff_trend_pct.toFixed(1) : '',
    d.priority_score || '', d.icp_label || '',
    d.near_customer ? 'Yes' : 'No', d.nearest_customer_name || '',
  ]);
  downloadCSV(`k12_accounts_${date}.csv`, headers, rows);
}

export function exportContactsCSV(districts: K12District[]) {
  const date = new Date().toISOString().slice(0, 10);
  const headers = [
    'Account_NCES_ID', 'Account_Name', 'First_Name', 'Last_Name',
    'Title', 'Email', 'Email_Verified', 'Phone', 'Phone_Is_Main_Line',
    'Mobile', 'LinkedIn_URL', 'Contact_Role',
  ];
  const rows: unknown[][] = [];
  districts.forEach(d => {
    const contacts = getContacts(d);
    contacts.forEach(c => {
      if (!c.name?.trim()) return;
      const { first, last } = splitName(c.name);
      rows.push([
        d.nces_id, titleCase(d.name), first, last,
        c.title || '', c.email || '',
        c.email_inferred ? 'Inferred' : (c.email ? 'Yes' : 'No'),
        c.phone || '', c.phone_is_main ? 'Yes' : 'No',
        c.mobile || '', c.linkedin_url || '', c.role || '',
      ]);
    });
  });
  downloadCSV(`k12_contacts_${date}.csv`, headers, rows);
}

export function generateSalesBrief(d: K12District): string {
  const phone = d.phone_formatted || 'N/A';
  const atsVal = (d.current_ats && d.current_ats !== 'Not Scanned' && d.current_ats !== '') ? d.current_ats : 'No Provider';
  const cms = d.website_platform || 'Unknown';
  const tech = d.tech_ecosystem || 'Unknown';
  const contactLines = getContacts(d).map(c =>
    `  • ${c.name} — ${c.title} (${c.role})${c.email ? ' | ' + c.email : ''}`
  ).join('\n');
  const city = d.city ? titleCase(d.city) : '';
  const loc = city ? `${city}, ${d.state}` : d.state;

  let brief = `🏫 ${d.name}\n📍 ${loc} · ${d.locale_type || ''} · ${d.total_schools || '?'} schools\n📞 ${phone}\n`;
  brief += `\n--- QUICK STATS ---\nStaff: ${d.total_staff_2025?.toLocaleString() || '?'} (${d.staff_trend_pct != null ? (d.staff_trend_pct > 0 ? '+' : '') + d.staff_trend_pct.toFixed(1) + '%' : '?'} trend)\n`;
  brief += `Students: ${d.students_2025?.toLocaleString() || '?'}\nRev/Pupil: $${d.total_revenue_per_pupil ? Math.round(d.total_revenue_per_pupil).toLocaleString() : '?'}\n`;
  brief += `\n--- TECH STACK ---\nATS: ${atsVal}\nWebsite CMS: ${cms}\nEmail: ${tech}\n`;
  if (contactLines) brief += `\n--- CONTACTS ---\n${contactLines}\n`;
  brief += `\n--- WHO TO CALL ---\n${d.target_persona || 'Director of HR'}\n`;
  if (d.near_customer) {
    const custShort = (d.nearest_customer_name || '').replace(/ (UNIFIED|ELEMENTARY|SCHOOL DISTRICT|UNION FREE|PUBLIC SCHOOLS|DISTRICT)/gi, '').trim();
    brief += `\n🎯 REFERENCE: ${custShort} (${Math.round(d.nearest_customer_dist!)}mi away)\n`;
  }
  if (d.active_jobs_count) brief += `\n🔥 ${d.active_jobs_count} ACTIVE JOB POSTINGS\n`;
  return brief;
}
