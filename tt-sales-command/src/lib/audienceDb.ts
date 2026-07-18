// ── Audience Seeds Database Layer ──
// Handles CRUD for audience seed lists (pre-Clay-enrichment account lists)

import { supabase } from './supabase';
import { normalizeDomain } from './normalizeDomain';

export interface AudienceSeed {
  id: string;
  company_name: string;
  company_domain: string;
  company_location?: string;
  employee_count?: number;
  company_size_linkedin?: string;
  current_ats?: string;
  industry?: string;
  audience_source: string;
  market: string;
  status: 'pending' | 'sent_to_clay' | 'enriched';
  created_at: string;
  created_by?: string;
}

export interface AudienceSummary {
  audience_source: string;
  count: number;
  pending: number;
  sent_to_clay: number;
  enriched: number;
  created_at: string; // earliest
}

// ── Fetch all seeds ──
export async function fetchAudienceSeeds(audienceSource?: string): Promise<AudienceSeed[]> {
  // Read from the new accounts table
  const PAGE = 1000;
  const allRows: any[] = [];
  let offset = 0;
  while (true) {
    let query = supabase.from('accounts').select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE - 1);
    if (audienceSource) query = query.eq('audience_source', audienceSource);
    const { data, error } = await query;
    if (error) { console.error('Failed to fetch accounts:', error); break; }
    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < PAGE) break;
    offset += PAGE;
  }
  // Map back to AudienceSeed format for backwards compatibility in UI for now
  return allRows.map(r => ({
    id: r.domain,
    company_name: r.company_name,
    company_domain: r.domain,
    company_location: r.location,
    employee_count: r.employee_count,
    company_size_linkedin: r.company_size_linkedin,
    current_ats: r.current_ats,
    audience_source: r.audience_source,
    market: r.market,
    status: 'pending', // deprecated conceptually
    created_at: r.created_at
  }));
}

// ── Get audience summaries (grouped by audience_source) ──
export async function fetchAudienceSummaries(): Promise<AudienceSummary[]> {
  // Paginated fetch — Supabase server caps at 1000 rows per request
  const PAGE = 1000;
  const allRows: any[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from('accounts')
      .select('audience_source, created_at')
      .range(offset, offset + PAGE - 1);
    if (error) { console.error('Failed to fetch audience summaries:', error); break; }
    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < PAGE) break;
    offset += PAGE;
  }

  const map = new Map<string, AudienceSeed[]>();
  for (const row of allRows) {
    if (!map.has(row.audience_source)) map.set(row.audience_source, []);
    map.get(row.audience_source)!.push(row);
  }

  return Array.from(map.entries()).map(([source, seeds]) => ({
    audience_source: source,
    count: seeds.length,
    pending: 0,
    sent_to_clay: 0,
    enriched: seeds.length,
    created_at: seeds.reduce((earliest, s) => s.created_at < earliest ? s.created_at : earliest, seeds[0].created_at),
  }));
}

// ── Import seeds from CSV data ──
export async function importAudienceSeeds(
  rows: Omit<AudienceSeed, 'id' | 'status' | 'created_at'>[],
): Promise<{ inserted: number; duplicates: number }> {
  // Map to new accounts structure
  const accountRows = rows.map(r => ({
    domain: normalizeDomain(r.company_domain),
    company_name: r.company_name,
    location: r.company_location,
    employee_count: r.employee_count,
    company_size_linkedin: r.company_size_linkedin,
    current_ats: r.current_ats,
    audience_source: r.audience_source,
    market: r.market,
    tier: 'watch'
  }));

  // Upsert into accounts table
  const batchSize = 100;
  let inserted = 0;
  for (let i = 0; i < accountRows.length; i += batchSize) {
    const batch = accountRows.slice(i, i + batchSize);
    const { error } = await supabase.from('accounts').upsert(batch, { onConflict: 'domain' });
    if (error) console.error(`Failed to upsert accounts batch ${i}:`, error);
    else inserted += batch.length;
  }

  return { inserted, duplicates: 0 }; // Upsert handles duplicates automatically
}

// ── Update status (e.g., mark as sent to Clay) ──
export async function updateSeedStatus(
  audienceSource: string,
  status: 'pending' | 'sent_to_clay' | 'enriched'
): Promise<void> {
  const { error } = await supabase
    .from('audience_seeds')
    .update({ status })
    .eq('audience_source', audienceSource);
  if (error) console.error('Failed to update seed status:', error);
}

export async function deleteAudience(audienceSource: string): Promise<void> {
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('audience_source', audienceSource);
  if (error) console.error('Failed to delete audience:', error);
}

// ── Generate Clay-ready CSV from seeds (includes metadata) ──
export function generateClayCSV(seeds: AudienceSeed[]): string {
  // Collect all metadata keys across all seeds
  const metaKeys = new Set<string>();
  for (const s of seeds) {
    const meta = (s as any).metadata;
    if (meta && typeof meta === 'object') {
      for (const k of Object.keys(meta)) metaKeys.add(k);
    }
  }
  const sortedMetaKeys = [...metaKeys].sort();

  const headers = [
    'company_name', 'company_domain', 'company_location', 'employee_count',
    'company_size_linkedin', 'current_ats', 'industry', 'audience_source', 'market',
    'annual_revenue', 'headcount_growth_pct', 'website', 'phone', 'email_domain', 'state',
    ...sortedMetaKeys
  ];
  const rows = seeds.map(s => {
    const meta = (s as any).metadata || {};
    return [
      s.company_name, s.company_domain, s.company_location || '', s.employee_count || '',
      s.company_size_linkedin || '', s.current_ats || '', s.industry || '', s.audience_source, s.market,
      (s as any).annual_revenue || '', (s as any).headcount_growth_pct || '',
      (s as any).website || '', (s as any).phone || '', (s as any).email_domain || '', (s as any).state || '',
      ...sortedMetaKeys.map(k => meta[k] ?? '')
    ];
  });
  return [headers, ...rows]
    .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

// ── Parse imported CSV (flexible column mapping) ──
export function parseCSV(
  csvText: string,
  audienceSource: string,
  market: string,
  createdBy?: string
): Omit<AudienceSeed, 'id' | 'status' | 'created_at'>[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());

  // Flexible column mapping — map common CSV header names to our fields
  const colMap: Record<string, string[]> = {
    company_name: ['company_name', 'company', 'name', 'organization', 'account', 'account name'],
    company_domain: ['company_domain', 'domain', 'website', 'url', 'company website', 'company url', 'company domain'],
    company_location: ['company_location', 'location', 'hq', 'headquarters', 'city', 'hq location', 'company hq'],
    employee_count: ['employee_count', 'employees', 'employee count', 'company size', 'size', 'headcount', 'number of employees'],
    company_size_linkedin: ['company_size_linkedin', 'linkedin_size', 'linkedin company size', 'company size (linkedin)', 'linkedin size range'],
    current_ats: ['current_ats', 'ats', 'technology', 'tech', 'applicant tracking', 'hr tech'],
    industry: ['industry', 'sector', 'vertical'],
  };

  // Find column indices
  const indices: Record<string, number> = {};
  for (const [field, aliases] of Object.entries(colMap)) {
    const idx = headers.findIndex(h => aliases.includes(h));
    if (idx !== -1) indices[field] = idx;
  }

  if (indices.company_name === undefined && indices.company_domain === undefined) {
    throw new Error('CSV must have at least a "company_name" or "company_domain" column');
  }

  const results: Omit<AudienceSeed, 'id' | 'status' | 'created_at'>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parse (handles quoted fields)
    const cols: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { cols.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    cols.push(current.trim());

    const get = (field: string) => indices[field] !== undefined ? cols[indices[field]] || '' : '';

    const domain = normalizeDomain(get('company_domain') || get('company_name').toLowerCase().replace(/\s+/g, '') + '.com');

    if (!domain && !get('company_name')) continue;

    results.push({
      company_name: get('company_name'),
      company_domain: domain || get('company_name').toLowerCase().replace(/\s+/g, '') + '.com',
      company_location: get('company_location') || undefined,
      employee_count: parseInt(get('employee_count')) || undefined,
      company_size_linkedin: get('company_size_linkedin') || undefined,
      current_ats: get('current_ats') || undefined,
      industry: get('industry') || undefined,
      audience_source: audienceSource,
      market,
      created_by: createdBy,
    });
  }

  return results;
}
