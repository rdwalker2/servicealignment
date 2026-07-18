// ============================================================
// Signal Board Database Layer — Supabase-backed persistence
// Handles all reads/writes for signals, dispositions, pushes, notes
// ============================================================
import { supabase } from './supabase';
import type { ClayRow } from '../data/signalBoardData';

// ── Types ──

export interface DbDisposition {
  company_domain: string;
  status: string;
  updated_by: string;
  updated_at: string;
}

export interface DbPushEvent {
  entity_type: 'account' | 'contact';
  entity_id: string;
  tool: 'instantly' | 'salesloft' | 'salesforce';
  pushed_by: string;
  pushed_at: string;
}

export interface DbNote {
  id: string;
  company_domain: string;
  note_text: string;
  author_name: string;
  author_id?: string;
  created_at: string;
}

// ── Row Mapper (shared between fetch and realtime) ──

function mapRowToClayRow(row: any): ClayRow {
  return {
    full_name: row.full_name,
    email: row.email,
    job_title: row.job_title || '',
    linkedin_url: row.linkedin_url || '',
    phone: row.phone || '',
    company_name: row.company_name,
    company_domain: row.company_domain,
    company_location: row.company_location || '',
    employee_count: row.employee_count || 0,
    open_roles: row.open_roles || 0,
    current_ats: row.current_ats || '',
    signal_name: row.signal_name,
    signal_source: row.signal_source as ClayRow['signal_source'],
    signal_score: row.signal_score || 0,
    signal_description: row.signal_description || '',
    page_visited: row.page_visited || '',
    icp_tier: row.icp_tier as ClayRow['icp_tier'],
    detected_at: row.detected_at,
    assigned_rep_id: row.assigned_rep_id || '',
    ai_research_brief: row.ai_research_brief || '',
    account_intel: row.account_intel || undefined,
    pain_points: row.pain_points || undefined,
    recommended_approach: row.recommended_approach || undefined,
    isp_explanation: row.isp_explanation || undefined,
    isp_score: row.isp_score || undefined,
    g2_score: row.g2_score || undefined,
    indeed_score: row.indeed_score || undefined,
    glassdoor_score: row.glassdoor_score || undefined,
    negative_reviews: row.negative_reviews || undefined,
    signal_category: row.signal_category || undefined,
    hiring_signals: row.hiring_signals || undefined,
    sf_account_owner: row.sf_account_owner || (row.assigned_rep_id === 'rep-jl' ? 'Jack Luther' : null),
    market: row.market || undefined,
    firmographic_tier: row.firmographic_tier || undefined,
    pages_visited_count: row.pages_visited_count || undefined,
    session_duration_seconds: row.session_duration_seconds || undefined,
    visited_pricing: row.visited_pricing || undefined,
    utm_source: row.utm_source || undefined,
    utm_campaign: row.utm_campaign || undefined,
    is_existing_customer: row.is_existing_customer || false,
    account_owner_email: row.account_owner_email || undefined,
    audience_source: row.audience_source || undefined,
  };
}

// ── Signals ──

export async function fetchSignals(): Promise<ClayRow[]> {
  const { data, error } = await supabase
    .from('clay_signals')
    .select('*')
    .order('detected_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch signals:', error);
    return [];
  }

  return (data || []).map(mapRowToClayRow);
}

// ── Realtime Subscription ──

export function subscribeToNewSignals(
  onNewSignal: (signal: ClayRow) => void
): () => void {
  const channel = supabase
    .channel('realtime-clay-signals')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'clay_signals' },
      (payload) => {
        const newSignal = mapRowToClayRow(payload.new);
        onNewSignal(newSignal);
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
}

export async function seedSignals(rows: ClayRow[]): Promise<void> {
  // Check if signals already exist
  const { count } = await supabase
    .from('clay_signals')
    .select('*', { count: 'exact', head: true });

  if (count && count > 0) {
    // Already seeded
    return;
  }

  // Insert seed data in batches of 50
  const batchSize = 50;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize).map(r => ({
      full_name: r.full_name,
      email: r.email,
      job_title: r.job_title,
      linkedin_url: r.linkedin_url,
      phone: r.phone,
      company_name: r.company_name,
      company_domain: r.company_domain,
      company_location: r.company_location,
      employee_count: r.employee_count,
      open_roles: r.open_roles,
      current_ats: r.current_ats,
      signal_name: r.signal_name,
      signal_source: r.signal_source,
      signal_score: r.signal_score,
      signal_description: r.signal_description,
      page_visited: r.page_visited,
      icp_tier: r.icp_tier,
      detected_at: r.detected_at,
      assigned_rep_id: r.assigned_rep_id,
      ai_research_brief: r.ai_research_brief,
      // ISP Enrichment
      account_intel: r.account_intel,
      pain_points: r.pain_points,
      recommended_approach: r.recommended_approach,
      isp_explanation: r.isp_explanation,
      isp_score: r.isp_score,
      g2_score: r.g2_score,
      indeed_score: r.indeed_score,
      glassdoor_score: r.glassdoor_score,
      negative_reviews: r.negative_reviews,
      signal_category: r.signal_category,
      hiring_signals: r.hiring_signals,
      sf_account_owner: r.assigned_rep_id === 'rep-jl' ? 'Jack Luther' : null,
    }));

    const { error } = await supabase.from('clay_signals').insert(batch);
    if (error) {
      console.error(`Failed to seed batch ${i}:`, error);
    }
  }
  // Seed complete
}

// ── Dispositions ──

export async function fetchDispositions(): Promise<Map<string, { status: string; updatedAt: string }>> {
  const { data, error } = await supabase
    .from('dispositions')
    .select('*');

  if (error) {
    console.error('Failed to fetch dispositions:', error);
    return new Map();
  }

  const map = new Map<string, { status: string; updatedAt: string }>();
  for (const row of data || []) {
    map.set(row.company_domain, {
      status: row.status,
      updatedAt: row.updated_at,
    });
  }
  return map;
}

export async function upsertDisposition(
  companyDomain: string,
  status: string,
  updatedBy: string
): Promise<void> {
  const { error } = await supabase
    .from('dispositions')
    .upsert(
      {
        company_domain: companyDomain,
        status,
        updated_by: updatedBy,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'company_domain' }
    );

  if (error) {
    console.error('Failed to upsert disposition:', error);
  }
}

// ── Push Events ──

export async function fetchPushEvents(): Promise<{
  accounts: Map<string, { outreach: boolean; salesforce: boolean }>;
  contacts: Map<string, { outreach: boolean; salesforce: boolean }>;
}> {
  const { data, error } = await supabase
    .from('push_events')
    .select('*');

  if (error) {
    console.error('Failed to fetch push events:', error);
    return { accounts: new Map(), contacts: new Map() };
  }

  const accounts = new Map<string, { outreach: boolean; salesforce: boolean }>();
  const contacts = new Map<string, { outreach: boolean; salesforce: boolean }>();

  for (const row of data || []) {
    const targetMap = row.entity_type === 'account' ? accounts : contacts;
    const existing = targetMap.get(row.entity_id) || { outreach: false, salesforce: false };

    if (row.tool === 'salesforce') {
      existing.salesforce = true;
    } else {
      // instantly or salesloft both count as 'outreach'
      existing.outreach = true;
    }

    targetMap.set(row.entity_id, existing);
  }

  return { accounts, contacts };
}

export async function insertPushEvent(
  entityType: 'account' | 'contact',
  entityId: string,
  tool: 'instantly' | 'salesloft' | 'salesforce',
  pushedBy: string
): Promise<void> {
  const { error } = await supabase
    .from('push_events')
    .upsert(
      {
        entity_type: entityType,
        entity_id: entityId,
        tool,
        pushed_by: pushedBy,
        pushed_at: new Date().toISOString(),
      },
      { onConflict: 'entity_type,entity_id,tool' }
    );

  if (error) {
    console.error('Failed to insert push event:', error);
  }
}

// ── Notes ──

export async function fetchNotes(): Promise<Map<string, DbNote[]>> {
  const { data, error } = await supabase
    .from('account_notes')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch notes:', error);
    return new Map();
  }

  const map = new Map<string, DbNote[]>();
  for (const row of data || []) {
    const existing = map.get(row.company_domain) || [];
    existing.push({
      id: row.id,
      company_domain: row.company_domain,
      note_text: row.note_text,
      author_name: row.author_name,
      author_id: row.author_id,
      created_at: row.created_at,
    });
    map.set(row.company_domain, existing);
  }
  return map;
}

export async function insertNote(
  companyDomain: string,
  text: string,
  authorName: string,
  authorId?: string
): Promise<DbNote | null> {
  const { data, error } = await supabase
    .from('account_notes')
    .insert({
      company_domain: companyDomain,
      note_text: text,
      author_name: authorName,
      author_id: authorId,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to insert note:', error);
    return null;
  }

  return {
    id: data.id,
    company_domain: data.company_domain,
    note_text: data.note_text,
    author_name: data.author_name,
    author_id: data.author_id,
    created_at: data.created_at,
  };
}

// ── Account Owners (from Salesloft/SFDC sync) ──

export async function fetchAccountOwners(): Promise<Map<string, { owner: string; companyType: string }>> {
  const { data, error } = await supabase
    .from('accounts')
    .select('domain, sf_account_owner, company_type')
    .not('sf_account_owner', 'is', null);

  if (error) {
    console.error('Failed to fetch account owners:', error);
    return new Map();
  }

  const map = new Map<string, { owner: string; companyType: string }>();
  for (const row of data || []) {
    map.set(row.domain, {
      owner: row.sf_account_owner,
      companyType: row.company_type || '',
    });
  }
  return map;
}

// ── Full Account List (for Book of Business view) ──

export interface DbAccount {
  domain: string;
  company_name: string;
  sf_account_id?: string;
  sf_account_owner?: string;
  industry?: string;
  city?: string;
  state?: string;
  country?: string;
  employee_count?: number;
  current_ats?: string;
  company_type?: string;
  size_segment?: string;
  icp_fit?: string;
  linkedin_company_url?: string;
  open_roles_count?: number;
  audience_source?: string;
  location?: string;
  updated_at?: string;
}

export async function fetchAllAccounts(): Promise<DbAccount[]> {
  const { data, error } = await supabase
    .from('accounts')
    .select('*');

  if (error) {
    console.error('Failed to fetch all accounts:', error);
    return [];
  }

  return (data || []) as DbAccount[];
}

export interface DbContact {
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  phone?: string;
  linkedin_url?: string;
  company_name?: string;
  domain?: string;
  salesloft_id?: string;
  updated_at?: string;
}

export async function fetchAllContacts(): Promise<DbContact[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*');

  if (error) {
    console.error('Failed to fetch all contacts:', error);
    return [];
  }

  return (data || []) as DbContact[];
}
