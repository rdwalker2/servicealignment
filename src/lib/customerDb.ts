import { supabase } from './supabase';

function getCustomersQuery() {
  const wsId = typeof window !== 'undefined' ? localStorage.getItem('scc_workspace_id') : null;
  const q = getCustomersQuery();
  // For customers, allow null workspace_id (global seed data) or specific workspace
  return wsId ? q.or(`workspace_id.eq.${wsId},workspace_id.is.null`) : q.is('workspace_id', null);
}

import type { Customer, CustomerStats, FilterOptions } from '../data/customerTypes';

// ═══════════════════════════════════════════════════════════════════
// Snake_case → camelCase mapping
// ═══════════════════════════════════════════════════════════════════

interface CustomerRow {
  id: string;
  account_name: string;
  website: string | null;
  career_site: string;
  phase: string;
  last_active: string | null;
  linkedin_url: string | null;
  segment: string;
  employee_range: string;
  previous_ats: string | null;
  billing_country: string;
  billing_state: string | null;
  region: string;
  country_flag: string;
  industry: string | null;
  won_opportunities: number;
  nps_score: number | null;
  nps_classification: string | null;
  nps_avg_score: number | null;
  nps_responses: number;
}

function rowToCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    accountName: row.account_name,
    website: row.website,
    careerSite: row.career_site,
    phase: row.phase as Customer['phase'],
    lastActive: row.last_active,
    linkedinUrl: row.linkedin_url,
    segment: row.segment as Customer['segment'],
    employeeRange: row.employee_range as Customer['employeeRange'],
    previousAts: row.previous_ats,
    billingCountry: row.billing_country,
    billingState: row.billing_state,
    region: row.region as Customer['region'],
    countryFlag: row.country_flag,
    industry: row.industry,
    wonOpportunities: row.won_opportunities,
    npsScore: row.nps_score,
    npsClassification: row.nps_classification as Customer['npsClassification'],
    npsAvgScore: row.nps_avg_score,
    npsResponses: row.nps_responses,
  };
}

// Map camelCase sort fields to snake_case DB columns
const SORT_FIELD_MAP: Record<string, string> = {
  accountName: 'account_name',
  segment: 'segment',
  employeeRange: 'employee_range',
  phase: 'phase',
  billingCountry: 'billing_country',
  lastActive: 'last_active',
  wonOpportunities: 'won_opportunities',
  industry: 'industry',
  npsScore: 'nps_score',
};

// ═══════════════════════════════════════════════════════════════════
// Fetch customers with server-side filtering and pagination
// ═══════════════════════════════════════════════════════════════════

export async function fetchCustomers(options: {
  search?: string;
  phase?: string[];
  segment?: string[];
  region?: string[];
  industry?: string[];
  previousAts?: string[];
  npsClassification?: string[];
  employeeRange?: string[];
  billingCountry?: string[];
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
} = {}): Promise<{ data: Customer[]; count: number }> {
  const {
    search,
    phase,
    segment,
    region,
    industry,
    previousAts,
    npsClassification,
    employeeRange,
    billingCountry,
    page = 1,
    pageSize = 50,
    sortBy = 'account_name',
    sortDir = 'asc',
  } = options;

  // Build query with count
  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' });

  // ── Text search (ilike on multiple columns) ──
  if (search && search.trim()) {
    const q = `%${search.trim()}%`;
    query = query.or(
      `account_name.ilike.${q},industry.ilike.${q},billing_country.ilike.${q},previous_ats.ilike.${q},website.ilike.${q},career_site.ilike.${q}`
    );
  }

  // ── Exact-match filters ──
  if (phase && phase.length > 0) {
    query = query.in('phase', phase);
  }

  if (segment && segment.length > 0) {
    query = query.in('segment', segment);
  }

  if (region && region.length > 0) {
    query = query.in('region', region);
  }

  if (industry && industry.length > 0) {
    query = query.in('industry', industry);
  }

  if (employeeRange && employeeRange.length > 0) {
    query = query.in('employee_range', employeeRange);
  }

  if (billingCountry && billingCountry.length > 0) {
    query = query.in('billing_country', billingCountry);
  }

  // ── Previous Provider filter (supports special '__has_ats__' value) ──
  if (previousAts && previousAts.length > 0) {
    if (previousAts.includes('__has_ats__')) {
      query = query.not('previous_ats', 'is', null);
    } else {
      query = query.in('previous_ats', previousAts);
    }
  }

  // ── NPS classification filter (supports special '__has_nps__' value) ──
  if (npsClassification && npsClassification.length > 0) {
    if (npsClassification.includes('__has_nps__')) {
      query = query.not('nps_score', 'is', null);
    } else {
      query = query.in('nps_classification', npsClassification);
    }
  }

  // ── Sorting ──
  const dbSortColumn = SORT_FIELD_MAP[sortBy] || sortBy;
  query = query.order(dbSortColumn, {
    ascending: sortDir === 'asc',
    nullsFirst: false,
  });

  // ── Pagination ──
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('fetchCustomers error:', error);
    throw error;
  }

  return {
    data: (data as CustomerRow[]).map(rowToCustomer),
    count: count ?? 0,
  };
}

// ═══════════════════════════════════════════════════════════════════
// Fetch aggregate stats (single query using Supabase RPC or JS)
// ═══════════════════════════════════════════════════════════════════

export async function fetchCustomerStats(): Promise<CustomerStats> {
  // Fetch counts via multiple targeted queries in parallel
  const [
    totalRes,
    enterpriseRes,
    mediumRes,
    smallRes,
    countriesRes,
    industriesRes,
    previousAtsRes,
    successRes,
    npsDataRes,
    promotersRes,
    passivesRes,
    detractorsRes,
  ] = await Promise.all([
    getCustomersQuery().select('*', { count: 'exact', head: true }),
    getCustomersQuery().select('*', { count: 'exact', head: true }).eq('segment', 'Enterprise'),
    getCustomersQuery().select('*', { count: 'exact', head: true }).eq('segment', 'Medium'),
    getCustomersQuery().select('*', { count: 'exact', head: true }).eq('segment', 'Small'),
    getCustomersQuery().select('billing_country'),
    getCustomersQuery().select('industry').not('industry', 'is', null),
    getCustomersQuery().select('*', { count: 'exact', head: true }).not('previous_ats', 'is', null),
    getCustomersQuery().select('*', { count: 'exact', head: true }).eq('phase', 'Success'),
    getCustomersQuery().select('*', { count: 'exact', head: true }).not('nps_score', 'is', null),
    getCustomersQuery().select('*', { count: 'exact', head: true }).eq('nps_classification', 'Promoter'),
    getCustomersQuery().select('*', { count: 'exact', head: true }).eq('nps_classification', 'Passive'),
    getCustomersQuery().select('*', { count: 'exact', head: true }).eq('nps_classification', 'Detractor'),
  ]);

  // Compute unique countries and industries from the fetched data
  const uniqueCountries = new Set((countriesRes.data ?? []).map((r: { billing_country: string }) => r.billing_country));
  const uniqueIndustries = new Set((industriesRes.data ?? []).map((r: { industry: string }) => r.industry));

  return {
    total: totalRes.count ?? 0,
    enterprise: enterpriseRes.count ?? 0,
    medium: mediumRes.count ?? 0,
    small: smallRes.count ?? 0,
    countries: uniqueCountries.size,
    industries: uniqueIndustries.size,
    withPreviousAts: previousAtsRes.count ?? 0,
    successPhase: successRes.count ?? 0,
    withNpsData: npsDataRes.count ?? 0,
    npsPromoters: promotersRes.count ?? 0,
    npsPassives: passivesRes.count ?? 0,
    npsDetractors: detractorsRes.count ?? 0,
  };
}

// ═══════════════════════════════════════════════════════════════════
// Fetch unique filter values for dropdowns
// ═══════════════════════════════════════════════════════════════════

export async function fetchFilterOptions(): Promise<FilterOptions> {
  const [
    regionsRes,
    industriesRes,
    previousAtsRes,
    countriesRes,
    phasesRes,
    segmentsRes,
    employeeRangesRes,
  ] = await Promise.all([
    getCustomersQuery().select('region'),
    getCustomersQuery().select('industry').not('industry', 'is', null),
    getCustomersQuery().select('previous_ats').not('previous_ats', 'is', null),
    getCustomersQuery().select('billing_country'),
    getCustomersQuery().select('phase'),
    getCustomersQuery().select('segment'),
    getCustomersQuery().select('employee_range'),
  ]);

  const unique = <T>(data: T[] | null, key: keyof T): string[] =>
    [...new Set((data ?? []).map(r => String(r[key])))].sort();

  return {
    regions: unique(regionsRes.data, 'region' as never),
    industries: unique(industriesRes.data, 'industry' as never),
    previousAts: unique(previousAtsRes.data, 'previous_ats' as never),
    countries: unique(countriesRes.data, 'billing_country' as never),
    phases: unique(phasesRes.data, 'phase' as never),
    segments: unique(segmentsRes.data, 'segment' as never),
    employeeRanges: unique(employeeRangesRes.data, 'employee_range' as never),
  };
}
