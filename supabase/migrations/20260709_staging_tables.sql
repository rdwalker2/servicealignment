CREATE TABLE IF NOT EXISTS pending_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL, -- e.g. 'clay', 'rb2b'
  domain TEXT NOT NULL,
  company_name TEXT,
  raw_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_rep_id TEXT
);

-- Index for fast lookups by domain or status
CREATE INDEX IF NOT EXISTS idx_pending_signals_domain ON pending_signals(domain);
CREATE INDEX IF NOT EXISTS idx_pending_signals_status ON pending_signals(status);
