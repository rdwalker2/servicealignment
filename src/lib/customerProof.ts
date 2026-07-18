// ═══════════════════════════════════════════════════════════════════
// customerProof.ts — Dynamic social proof scoring from customer universe
// Ranks real TT customers by relevance to the current deal context
// ═══════════════════════════════════════════════════════════════════

import { supabase } from './supabase';
import type { Customer } from '../data/customerTypes';
import type { DiscoverySession } from './discoveryDatabase';

// ── Types ──

export interface SocialProofCandidate {
  customer: Customer;
  score: number;
  matchReasons: string[];
}

// ── Industry similarity map ──
// Maps session.industry (lowercase, kebab-case) to customerUniverse.industry (Title Case)
const INDUSTRY_MAP: Record<string, string[]> = {
  'insurance':             ['Insurance', 'Financial Services', 'Banking'],
  'financial-services':    ['Financial Services', 'Banking', 'Insurance', 'Accounting'],
  'healthcare':            ['Hospital and Health Care', 'Health, Wellness and Fitness', 'Biotechnology', 'Pharmaceuticals', 'Medical Devices'],
  'hospitality':           ['Hospitality', 'Leisure, Travel and Tourism', 'Restaurants'],
  'food-beverage':         ['Food and Beverages', 'Food Production', 'Restaurants'],
  'retail':                ['Retail', 'Apparel and Fashion', 'Consumer Goods', 'Sporting Goods'],
  'construction':          ['Construction', 'Building Materials', 'Civil Engineering', 'Architecture and Planning'],
  'technology':            ['Information Technology and Services', 'Computer Software', 'Internet', 'Telecommunications'],
  'professional-services': ['Management Consulting', 'Accounting', 'Legal Services', 'Business Services', 'Human Resources'],
  'nonprofit':             ['Non-profit Organization Management', 'Education', 'Civic and Social Organization'],
  'manufacturing':         ['Manufacturing', 'Mechanical/Industrial Engineering', 'Electrical/Electronic Manufacturing', 'Machinery'],
  'automotive':            ['Automotive', 'Transportation/Trucking/Railroad'],
  'staffing':              ['Staffing and Recruiting', 'Recruitment Firm', 'Human Resources'],
  'education':             ['Education', 'Higher Education', 'E-Learning'],
  'energy-maritime':       ['Oil and Energy', 'Renewables and Environment', 'Maritime'],
  'media':                 ['Media Production', 'Entertainment', 'Online Media', 'Marketing and Advertising'],
  'real-estate':           ['Real Estate', 'Commercial Real Estate'],
};

// Reverse lookup: customer industry → session industries it's adjacent to
const ADJACENT_INDUSTRIES: Record<string, string[]> = {
  'Insurance': ['financial-services'],
  'Financial Services': ['insurance'],
  'Banking': ['insurance', 'financial-services'],
  'Accounting': ['financial-services', 'professional-services'],
  'Hospital and Health Care': ['healthcare'],
  'Health, Wellness and Fitness': ['healthcare'],
  'Hospitality': ['food-beverage'],
  'Restaurants': ['hospitality', 'food-beverage'],
  'Food and Beverages': ['hospitality'],
  'Retail': ['automotive'],
  'Staffing and Recruiting': ['professional-services'],
  'Recruitment Firm': ['professional-services', 'staffing'],
  'Human Resources': ['professional-services', 'staffing'],
  'Management Consulting': ['financial-services'],
  'Information Technology and Services': ['professional-services'],
  'Computer Software': ['technology'],
};

// Healthy phases worth showing
const HEALTHY_PHASES = new Set(['Success', 'Adoption', 'Onboarding', 'Redoption']);

// Session region → customer region map
const REGION_MAP: Record<string, string[]> = {
  'us': ['North America'],
  'na': ['North America'],
  'north-america': ['North America'],
  'uk': ['UK & Ireland'],
  'europe': ['Nordics', 'DACH', 'Western Europe', 'Southern Europe', 'Eastern Europe', 'UK & Ireland'],
  'apac': ['APAC'],
};

// ── Main scoring function ──

export async function scoreCustomers(session: DiscoverySession): Promise<SocialProofCandidate[]> {
  const industry = session.industry || '';
  const targetIndustries = INDUSTRY_MAP[industry] || [];
  const currentAts = (session.current_ats || '').toLowerCase();
  const companySize = session.company_size || '';
  const region = session.pricing_region || '';
  const targetRegions = REGION_MAP[region] || [];

  // Fetch healthy, industry-tagged customers from Supabase
  const healthyPhases = [...HEALTHY_PHASES];
  const { data: rows, error } = await supabase
    .from('customers')
    .select('*')
    .not('industry', 'is', null)
    .in('phase', healthyPhases)
    .gt('account_name', '  ');

  if (error || !rows) {
    console.error('scoreCustomers: failed to fetch customers', error);
    return [];
  }

  // Map rows to Customer type
  const pool: Customer[] = rows.map((r: any) => ({
    id: r.id,
    accountName: r.account_name,
    website: r.website,
    careerSite: r.career_site,
    phase: r.phase,
    lastActive: r.last_active,
    linkedinUrl: r.linkedin_url,
    segment: r.segment,
    employeeRange: r.employee_range,
    previousAts: r.previous_ats,
    billingCountry: r.billing_country,
    billingState: r.billing_state,
    region: r.region,
    countryFlag: r.country_flag,
    industry: r.industry,
    wonOpportunities: r.won_opportunities,
    npsScore: r.nps_score,
    npsClassification: r.nps_classification,
    npsAvgScore: r.nps_avg_score,
    npsResponses: r.nps_responses,
  }));

  const scored: SocialProofCandidate[] = [];

  for (const customer of pool) {
    let score = 0;
    const reasons: string[] = [];
    const custIndustry = customer.industry || '';

    // ── Industry match (strongest signal) ──
    if (targetIndustries.includes(custIndustry)) {
      // Exact industry match (e.g., Insurance → Insurance)
      if (custIndustry.toLowerCase() === industry.toLowerCase() ||
          (INDUSTRY_MAP[industry]?.[0] === custIndustry)) {
        score += 20;
        reasons.push(`Same industry: ${custIndustry}`);
      } else {
        score += 10;
        reasons.push(`Adjacent industry: ${custIndustry}`);
      }
    } else if (ADJACENT_INDUSTRIES[custIndustry]?.includes(industry)) {
      score += 6;
      reasons.push(`Related industry: ${custIndustry}`);
    } else {
      // Not relevant — skip unless other signals are very strong
      continue;
    }

    // ── Region match ──
    if (targetRegions.length > 0 && targetRegions.includes(customer.region)) {
      score += 6;
      reasons.push(`Same region: ${customer.region}`);
    }

    // ── Size match ──
    const sizeScore = scoreSizeMatch(companySize, customer.segment, customer.employeeRange);
    if (sizeScore > 0) {
      score += sizeScore;
      reasons.push(`Similar size: ${customer.segment} (${customer.employeeRange})`);
    }

    // ── Previous Provider match ──
    if (currentAts && customer.previousAts) {
      const prevAts = customer.previousAts.toLowerCase();
      if (prevAts === currentAts || prevAts.includes(currentAts) || currentAts.includes(prevAts)) {
        score += 12;
        reasons.push(`Switched from ${customer.previousAts}`);
      }
    }

    // ── Phase bonus ──
    if (customer.phase === 'Success') {
      score += 4;
      reasons.push('Success phase');
    }

    // ── NPS bonus ──
    if (customer.npsScore !== null && customer.npsScore >= 9) {
      score += 8;
      reasons.push(`NPS ${customer.npsScore} (Promoter)`);
    } else if (customer.npsScore !== null && customer.npsScore >= 7) {
      score += 3;
      reasons.push(`NPS ${customer.npsScore}`);
    }

    // ── Career site bonus (custom domain = mature customer) ──
    if (customer.careerSite && !customer.careerSite.includes('.servicealignment.com')) {
      score += 3;
      reasons.push('Custom career site');
    }

    // ── LinkedIn presence ──
    if (customer.linkedinUrl) {
      score += 1;
    }

    scored.push({ customer, score, reasons });
  }

  // Sort by score descending, then by name for stability
  scored.sort((a, b) => b.score - a.score || a.customer.accountName.localeCompare(b.customer.accountName));

  return scored;
}

function scoreSizeMatch(sessionSize: string, segment: string, empRange: string): number {
  // Map session company_size to rough tiers
  const sizeMap: Record<string, string[]> = {
    '1-50':    ['Small'],
    '51-200':  ['Small', 'Medium'],
    '201-500': ['Medium'],
    '501-2000':['Medium', 'Enterprise'],
    '2001+':   ['Enterprise'],
  };
  const targetSegments = sizeMap[sessionSize] || [];
  if (targetSegments.includes(segment)) return 5;
  return 0;
}

// ── Convenience: get top N candidates ──

export async function getTopSocialProof(session: DiscoverySession, count: number = 20): Promise<SocialProofCandidate[]> {
  const all = await scoreCustomers(session);
  return all.slice(0, count);
}

// ── Industry count for dynamic headline ──

export async function getIndustryCustomerCount(industry: string): Promise<number> {
  const targetIndustries = INDUSTRY_MAP[industry] || [];
  if (targetIndustries.length === 0) return 0;

  const healthyPhases = [...HEALTHY_PHASES];
  const { count, error } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .in('industry', targetIndustries)
    .in('phase', healthyPhases);

  if (error) {
    console.error('getIndustryCustomerCount error:', error);
    return 0;
  }
  return count ?? 0;
}

// ── Get display label for industry ──

export function getIndustryLabel(industry: string): string {
  const labels: Record<string, string> = {
    'insurance': 'insurance',
    'financial-services': 'financial services',
    'healthcare': 'healthcare',
    'hospitality': 'hospitality',
    'food-beverage': 'food & beverage',
    'retail': 'retail',
    'construction': 'construction',
    'technology': 'technology',
    'professional-services': 'professional services',
    'nonprofit': 'nonprofit',
    'manufacturing': 'manufacturing',
    'automotive': 'automotive',
    'staffing': 'staffing & recruiting',
    'education': 'education',
    'energy-maritime': 'energy',
    'media': 'media',
    'real-estate': 'real estate',
  };
  return labels[industry] || industry;
}
