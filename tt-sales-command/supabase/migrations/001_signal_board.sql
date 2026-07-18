-- Signal Board Supabase Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ═══════════════════════════════════════════
-- 1. clay_signals — Raw signal data from Clay
-- ═══════════════════════════════════════════
create table if not exists clay_signals (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  job_title text,
  linkedin_url text,
  phone text,
  company_name text not null,
  company_domain text not null,
  company_location text,
  employee_count int default 0,
  open_roles int default 0,
  current_ats text,
  signal_name text not null,
  signal_source text not null check (signal_source in ('vector','clay','linkedin','job_board')),
  signal_score int default 0,
  signal_description text,
  page_visited text,
  icp_tier text default 'watch' check (icp_tier in ('hot','warm','watch')),
  detected_at timestamptz not null default now(),
  assigned_rep_id text,
  ai_research_brief text,

  -- ISP Enrichment fields (from Clay's AI analysis)
  account_intel      TEXT[],           -- array of up to 5 account intelligence bullets
  pain_points        TEXT[],           -- array of up to 4 pain point questions to explore
  recommended_approach TEXT[],         -- array of up to 6 approach/positioning suggestions
  isp_explanation    TEXT,             -- AI-generated paragraph explaining the ISP score
  isp_score          INTEGER DEFAULT 0, -- composite Intent Signal Processing score (0-100)
  g2_score           DECIMAL,          -- G2 employer review score
  indeed_score       DECIMAL,          -- Indeed employer review score
  glassdoor_score    DECIMAL,          -- Glassdoor employer review score
  negative_reviews   TEXT,             -- AI analysis of negative employer reviews
  signal_category    TEXT,             -- e.g. 'Tech Stack & Change Readiness', 'Hiring Volume & Volatility'
  hiring_signals     TEXT,             -- LinkedIn hiring signals detected

  created_at timestamptz default now()
);

-- Indexes for common queries
create index if not exists idx_signals_domain on clay_signals(company_domain);
create index if not exists idx_signals_rep on clay_signals(assigned_rep_id);
create index if not exists idx_signals_detected on clay_signals(detected_at desc);

-- ═══════════════════════════════════════════
-- 2. dispositions — Rep stage tracking
-- ═══════════════════════════════════════════
create table if not exists dispositions (
  id uuid primary key default gen_random_uuid(),
  company_domain text not null unique,
  status text not null default 'new' check (status in ('new','working','engaged','meeting_set','nurture','not_now','disqualified')),
  updated_by text not null,
  updated_at timestamptz default now()
);

-- ═══════════════════════════════════════════
-- 3. push_events — Outreach tool push log
-- ═══════════════════════════════════════════
create table if not exists push_events (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('account','contact')),
  entity_id text not null,
  tool text not null check (tool in ('instantly','salesloft','salesforce')),
  pushed_by text not null,
  pushed_at timestamptz default now(),
  unique(entity_type, entity_id, tool)
);

-- ═══════════════════════════════════════════
-- 4. account_notes — Rep notes per account
-- ═══════════════════════════════════════════
create table if not exists account_notes (
  id uuid primary key default gen_random_uuid(),
  company_domain text not null,
  note_text text not null,
  author_name text not null,
  author_id text,
  created_at timestamptz default now()
);

create index if not exists idx_notes_domain on account_notes(company_domain);

-- ═══════════════════════════════════════════
-- 5. RLS Policies
-- ═══════════════════════════════════════════
alter table clay_signals enable row level security;
alter table dispositions enable row level security;
alter table push_events enable row level security;
alter table account_notes enable row level security;

-- Allow anon (frontend) to read all tables
create policy "anon_read_signals" on clay_signals for select to anon using (true);
create policy "anon_read_dispositions" on dispositions for select to anon using (true);
create policy "anon_read_push_events" on push_events for select to anon using (true);
create policy "anon_read_notes" on account_notes for select to anon using (true);

-- Allow anon (frontend) to write dispositions, push_events, notes
create policy "anon_write_dispositions" on dispositions for insert to anon with check (true);
create policy "anon_update_dispositions" on dispositions for update to anon using (true);
create policy "anon_write_push_events" on push_events for insert to anon with check (true);
create policy "anon_write_notes" on account_notes for insert to anon with check (true);

-- Allow service_role (webhook) to write signals
create policy "service_write_signals" on clay_signals for insert to service_role with check (true);
-- Also allow anon to insert signals (for seed data loading from frontend)
create policy "anon_write_signals" on clay_signals for insert to anon with check (true);
