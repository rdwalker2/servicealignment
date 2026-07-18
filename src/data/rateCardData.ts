// ============================================================
// Current Rate Cards — US (from Notion internal rate card)
// Source: USD 14c885a70ca180ecb634ccb8f7b52846.md
// Two verticals: Non-Staffing (standard) and Staffing (Recruitment Firms)
// USD only — North America pricing
// NOTE: US 3.0 (FY26 Q2 NAMER Excel) has higher prices — expected next year
// ============================================================

export type VerticalType = 'non-staffing' | 'staffing';

export interface RateCardTier {
  label: string;       // Display label: "1-5", "6-25", etc.
  minSize: number;     // Min employees (inclusive)
  maxSize: number;     // Max employees (inclusive, Infinity for open-ended)
  price: number;       // Annual price in USD (0 = proposal/custom required)
}

export interface PricingAddOnTemplate {
  id: string;
  name: string;
  defaultPrice: number;
  description: string;
}

// ── US Non-Staffing Rate Card (from "US 3.0" sheet) ──

export const NON_STAFFING_TIERS: RateCardTier[] = [
  { label: '1-5',          minSize: 1,     maxSize: 5,     price: 1250 },
  { label: '6-25',         minSize: 6,     maxSize: 25,    price: 3025 },
  { label: '26-50',        minSize: 26,    maxSize: 50,    price: 4125 },
  { label: '51-75',        minSize: 51,    maxSize: 75,    price: 6000 },
  { label: '76-100',       minSize: 76,    maxSize: 100,   price: 8000 },
  { label: '101-150',      minSize: 101,   maxSize: 150,   price: 9000 },
  { label: '151-250',      minSize: 151,   maxSize: 250,   price: 10500 },
  { label: '251-400',      minSize: 251,   maxSize: 400,   price: 12000 },
  { label: '401-600',      minSize: 401,   maxSize: 600,   price: 13000 },
  { label: '601-800',      minSize: 601,   maxSize: 800,   price: 15000 },
  { label: '801-1,000',    minSize: 801,   maxSize: 1000,  price: 19000 },
  { label: '1,001-1,500',  minSize: 1001,  maxSize: 1500,  price: 23000 },
  { label: '1,501-2,000',  minSize: 1501,  maxSize: 2000,  price: 28000 },
  { label: '2,001-3,000',  minSize: 2001,  maxSize: 3000,  price: 33000 },
  { label: '3,001-4,000',  minSize: 3001,  maxSize: 4000,  price: 40000 },
  { label: '4,001-5,000',  minSize: 4001,  maxSize: 5000,  price: 50000 },
  { label: '5,000+',       minSize: 5001,  maxSize: Infinity, price: 0 }, // POA / Custom Proposal
];

// ── US Staffing Rate Card ──

export const STAFFING_TIERS: RateCardTier[] = [
  { label: '1-2',    minSize: 1,   maxSize: 2,   price: 2800 },
  { label: '3-5',    minSize: 3,   maxSize: 5,   price: 3200 },
  { label: '6-10',   minSize: 6,   maxSize: 10,  price: 3600 },
  { label: '11-15',  minSize: 11,  maxSize: 15,  price: 4100 },
  { label: '16-20',  minSize: 16,  maxSize: 20,  price: 4600 },
  { label: '21-25',  minSize: 21,  maxSize: 25,  price: 5100 },
  { label: '26-30',  minSize: 26,  maxSize: 30,  price: 5600 },
  { label: '31-40',  minSize: 31,  maxSize: 40,  price: 6100 },
  { label: '41-50',  minSize: 41,  maxSize: 50,  price: 6600 },
  { label: '51-75',  minSize: 51,  maxSize: 75,  price: 7100 },
  { label: '76-100', minSize: 76,  maxSize: 100, price: 7500 },
  { label: '101+',   minSize: 101, maxSize: Infinity, price: 0 }, // Proposal
];

// ── All tiers by vertical ──

export const TIERS: Record<VerticalType, RateCardTier[]> = {
  'non-staffing': NON_STAFFING_TIERS,
  'staffing': STAFFING_TIERS,
};

// ── Common Add-On Templates ──

export const ADD_ON_TEMPLATES: PricingAddOnTemplate[] = [
  { id: 'audit-log',          name: 'Audit Log (>30 days)',         defaultPrice: 720,   description: '30 days included free; extended history $60/mo' },
  { id: 'bi-connection',      name: 'BI System Connection',         defaultPrice: 1700,  description: 'Connect to external BI/analytics platforms' },
  { id: 'custom-data-import', name: 'Custom Data Import',           defaultPrice: 1000,  description: 'One-time custom migration from legacy Provider' },
  { id: 'enterprise-calendar',name: 'Enterprise Calendar',          defaultPrice: 1400,  description: 'Advanced calendar integrations (Exchange, Google Workspace)' },
  { id: 'job-offer-approval', name: 'Job Offer Approval',           defaultPrice: 1400,  description: 'Structured offer approval workflows' },
  { id: 'requisition-flow',   name: 'Requisition Flow',             defaultPrice: 1400,  description: 'Headcount requisition & approval management' },
  { id: 'onboarding',         name: 'Onboarding',                   defaultPrice: 2500,  description: 'Pre-boarding & onboarding workflows (e-signing included)' },
  { id: 'custom-onboarding',  name: 'Custom Onboarding (Enterprise)', defaultPrice: 5500, description: 'Tailored implementation — enterprise only, $5,500 minimum' },
  { id: 'sms-1000',           name: 'SMS — 1,000 Messages',         defaultPrice: 100,   description: 'Two-way candidate SMS messaging' },
  { id: 'sms-2500',           name: 'SMS — 2,500 Messages',         defaultPrice: 200,   description: '10% volume discount on SMS messaging' },
  { id: 'sms-10000',          name: 'SMS — 10,000 Messages',        defaultPrice: 600,   description: '25% volume discount on SMS messaging' },
  { id: 'enhanced-sla',       name: 'Enhanced SLA',                 defaultPrice: 800,   description: 'Priority support with dedicated SLA terms' },
  { id: 'single-tenant',      name: 'Single Tenant Hosting',        defaultPrice: 12300, description: 'Dedicated single-tenant infrastructure' },
  { id: 'language-page',      name: 'Language Page',                defaultPrice: 0,     description: 'Additional career site language — POA (proposal)' },
  { id: 'custom-integration', name: 'Custom Integration',           defaultPrice: 0,     description: 'Bespoke API integrations — POA (proposal)' },
];

// ── Lookup Utilities ──

/** Look up the rate card tier for a given employee count */
export function findTier(vertical: VerticalType, employeeCount: number): RateCardTier | null {
  const tiers = TIERS[vertical];
  if (!tiers) return null;
  return tiers.find(t => employeeCount >= t.minSize && employeeCount <= t.maxSize) ?? null;
}

/** Look up the price for a given employee count. Returns 0 for custom/proposal tiers. */
export function lookupPrice(vertical: VerticalType, employeeCount: number): number {
  const tier = findTier(vertical, employeeCount);
  return tier?.price ?? 0;
}

/** Check if a tier requires a custom proposal (price === 0) */
export function isProposalTier(vertical: VerticalType, employeeCount: number): boolean {
  const tier = findTier(vertical, employeeCount);
  return tier ? tier.price === 0 : true;
}

/** Get all tiers for display in a dropdown */
export function getTierOptions(vertical: VerticalType): { label: string; value: number; price: number }[] {
  const tiers = TIERS[vertical] ?? [];
  return tiers.map(t => ({
    label: t.label,
    value: t.minSize,
    price: t.price,
  }));
}

/** Format a price as USD */
export function formatPrice(price: number): string {
  return `$${price.toLocaleString()}`;
}
