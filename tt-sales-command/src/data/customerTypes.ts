// ═══════════════════════════════════════════════════════════════════
// Customer Types & UI Config
// Extracted from customerUniverse.ts — contains NO customer data
// ═══════════════════════════════════════════════════════════════════

export type Phase = 'Success' | 'Adoption' | 'Onboarding' | 'Passive' | 'Redoption' | 'Preboarding' | 'Lost' | 'On hold' | 'Offboarding' | 'Unknown';
export type Segment = 'Small' | 'Medium' | 'Enterprise' | 'Unknown';
export type EmployeeRange = '1-25' | '26-100' | '101-250' | '251-500' | '501-1000' | '1001-2000' | '2001-5000' | '5000+' | 'Unknown';
export type Region = 'Nordics' | 'UK & Ireland' | 'DACH' | 'Western Europe' | 'Southern Europe' | 'Eastern Europe' | 'North America' | 'LATAM' | 'APAC' | 'MEA' | 'Other';

export type NpsClassification = 'Promoter' | 'Passive' | 'Detractor' | null;

export interface Customer {
  id: string;
  accountName: string;
  website: string | null;
  careerSite: string;
  phase: Phase;
  lastActive: string | null;
  linkedinUrl: string | null;
  segment: Segment;
  employeeRange: EmployeeRange;
  previousAts: string | null;
  billingCountry: string;
  billingState: string | null;
  region: Region;
  countryFlag: string;
  industry: string | null;
  wonOpportunities: number;
  npsScore: number | null;
  npsClassification: NpsClassification;
  npsAvgScore: number | null;
  npsResponses: number;
}

// ── Customer Stats type (returned from DB aggregation) ──
export interface CustomerStats {
  total: number;
  enterprise: number;
  medium: number;
  small: number;
  countries: number;
  industries: number;
  withPreviousAts: number;
  successPhase: number;
  withNpsData: number;
  npsPromoters: number;
  npsPassives: number;
  npsDetractors: number;
}

// ── Filter options type (returned from DB distinct queries) ──
export interface FilterOptions {
  regions: string[];
  industries: string[];
  previousAts: string[];
  countries: string[];
  phases: string[];
  segments: string[];
  employeeRanges: string[];
}

// ── Phase colors ──
export const PHASE_CONFIG: Record<Phase, { label: string; color: string; bg: string; ring: string }> = {
  Success: { label: 'Success', color: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-200/60' },
  Adoption: { label: 'Adoption', color: 'text-blue-700', bg: 'bg-blue-50', ring: 'ring-blue-200/60' },
  Onboarding: { label: 'Onboarding', color: 'text-violet-700', bg: 'bg-violet-50', ring: 'ring-violet-200/60' },
  Passive: { label: 'Passive', color: 'text-stone-500', bg: 'bg-stone-50', ring: 'ring-stone-200/60' },
  Redoption: { label: 'Re-adoption', color: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-200/60' },
  Preboarding: { label: 'Preboarding', color: 'text-sky-700', bg: 'bg-sky-50', ring: 'ring-sky-200/60' },
  Lost: { label: 'Lost', color: 'text-red-700', bg: 'bg-red-50', ring: 'ring-red-200/60' },
  'On hold': { label: 'On Hold', color: 'text-orange-700', bg: 'bg-orange-50', ring: 'ring-orange-200/60' },
  Offboarding: { label: 'Offboarding', color: 'text-rose-700', bg: 'bg-rose-50', ring: 'ring-rose-200/60' },
  Unknown: { label: 'Unknown', color: 'text-stone-400', bg: 'bg-stone-50', ring: 'ring-stone-200/60' },
};

// ── Segment colors ──
export const SEGMENT_CONFIG: Record<Segment, { label: string; color: string; bg: string; ring: string }> = {
  Enterprise: { label: 'Enterprise', color: 'text-stone-900', bg: 'bg-stone-900', ring: 'ring-stone-300' },
  Medium: { label: 'Medium', color: 'text-blue-700', bg: 'bg-blue-100', ring: 'ring-blue-200/60' },
  Small: { label: 'Small', color: 'text-stone-600', bg: 'bg-stone-100', ring: 'ring-stone-200/60' },
  Unknown: { label: 'Unknown', color: 'text-stone-400', bg: 'bg-stone-50', ring: 'ring-stone-200/60' },
};

// ── NPS colors ──
export const NPS_CONFIG: Record<string, { label: string; color: string; bg: string; ring: string; icon: string }> = {
  Promoter: { label: 'Promoter', color: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-200/60', icon: '😊' },
  Passive: { label: 'Passive', color: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-200/60', icon: '😐' },
  Detractor: { label: 'Detractor', color: 'text-red-700', bg: 'bg-red-50', ring: 'ring-red-200/60', icon: '😞' },
};
