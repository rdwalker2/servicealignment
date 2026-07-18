// ============================================================
// roomOptions.ts — Shared option constants used across
// ControlDrawer and RepCommandCenter
// ============================================================

export const ATS_OPTIONS = [
  'None', 'Greenhouse', 'Ashby', 'BambooHR', 'BreezyHR', 'Lever', 'Workday', 'iCIMS',
  'SmartRecruiters', 'SuccessFactors', 'Workable', 'JazzHR', 'Paycor', 'Paycom', 'Paylocity',
  'Rippling', 'UKG', 'ADP', 'Dayforce', 'other',
];

export const HRIS_OPTIONS = [
  'None', 'ADP', 'BambooHR', 'Dayforce', 'Gusto', 'HiBob', 'Namely',
  'NetSuite', 'Paycom', 'Paylocity', 'Paycor', 'Rippling', 'SAP SuccessFactors',
  'UKG', 'Workday', 'other',
];

export const INDUSTRY_OPTIONS = [
  'none', 'Technology', 'Healthcare', 'Financial Services', 'Retail',
  'Manufacturing', 'Hospitality', 'Education', 'Professional Services',
  'Media & Entertainment', 'Non-Profit', 'Government', 'Other',
];

export const SIZE_OPTIONS = [
  'none', '1-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+',
];

// Full labels — used in ControlDrawer
export const PERSONA_OPTIONS = [
  { id: 'vp-ta', label: 'VP of Talent Acquisition' },
  { id: 'dir-eb', label: 'Dir. Employer Brand' },
  { id: 'chro', label: 'CHRO / CPO' },
  { id: 'ceo', label: 'CEO / President' },
  { id: 'cfo', label: 'CFO / Finance' },
  { id: 'hiring-manager', label: 'Hiring Manager' },
  { id: 'recruiter', label: 'Recruiter' },
];

// Compact labels — used in RepCommandCenter
export const PERSONA_OPTIONS_COMPACT = [
  { id: 'vp-ta', label: 'VP of TA' },
  { id: 'dir-eb', label: 'Dir. EB' },
  { id: 'chro', label: 'CHRO / CPO' },
  { id: 'ceo', label: 'CEO' },
  { id: 'cfo', label: 'CFO' },
  { id: 'hiring-manager', label: 'Hiring Mgr' },
  { id: 'recruiter', label: 'Recruiter' },
];

// Full labels — used in ControlDrawer
export const USE_CASE_OPTIONS = [
  { id: 'none', label: 'Not specified' },
  { id: 'replacing-ats', label: 'Replacing current ATS' },
  { id: 'first-ats', label: 'First ATS purchase' },
  { id: 'adding-brand', label: 'Adding employer brand' },
  { id: 'consolidating', label: 'Consolidating tools' },
  { id: 'scaling', label: 'Scaling hiring' },
];

// Compact labels — used in RepCommandCenter
export const USE_CASE_OPTIONS_COMPACT = [
  { id: 'none', label: 'Not set' },
  { id: 'replacing-ats', label: 'Replacing ATS' },
  { id: 'first-ats', label: 'First ATS' },
  { id: 'adding-brand', label: 'Adding EB' },
  { id: 'consolidating', label: 'Consolidating' },
  { id: 'scaling', label: 'Scaling' },
];
