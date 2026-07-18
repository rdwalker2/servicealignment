-- ============================================================
-- Granola Auto-Sync Queue
-- Stores meeting notes matched to discovery sessions with
-- extracted fields classified as auto-applied or pending review.
-- ============================================================

create table if not exists granola_sync_queue (
  id uuid primary key default gen_random_uuid(),
  
  -- Granola note metadata
  granola_note_id text not null,
  granola_note_title text,
  granola_note_date timestamptz,
  
  -- Matched discovery session
  session_id text not null,
  company_name text,
  
  -- Match quality
  match_tier int default 1,             -- 1=exact domain, 2=title, 3=fuzzy
  match_confidence text default 'high', -- high, medium, low
  
  -- Extracted fields (full LLM/regex output)
  extracted_fields jsonb,               -- raw extraction result
  auto_applied_fields jsonb,            -- fields auto-merged into session
  pending_review_fields jsonb,          -- fields needing AE approval
  
  -- Status tracking
  status text default 'pending',        -- pending | auto_applied | reviewed | dismissed
  reviewed_by text,
  reviewed_at timestamptz,
  
  created_at timestamptz default now(),
  
  -- Prevent duplicate processing
  unique(granola_note_id, session_id)
);

-- Fast lookup for "pending items for this rep"
create index if not exists idx_granola_sync_status 
  on granola_sync_queue(status) 
  where status = 'pending';

-- Fast lookup by session
create index if not exists idx_granola_sync_session 
  on granola_sync_queue(session_id);

-- Enable realtime subscriptions for the frontend badge
alter publication supabase_realtime add table granola_sync_queue;

-- RLS: Allow authenticated users to read/update their sync items
alter table granola_sync_queue enable row level security;

create policy "Anyone can read sync queue" on granola_sync_queue
  for select using (true);

create policy "Anyone can update sync queue" on granola_sync_queue
  for update using (true);

create policy "Service role can insert" on granola_sync_queue
  for insert with check (true);
