-- ============================================================
-- Migration 009: Lead Routing & Rep Assignment Engine
-- ============================================================
-- Adds rep roster, round-robin state, and assignment audit log
-- to support automated, fair lead distribution.
-- ============================================================

-- ── Rep Roster ──
-- Source of truth for rep configuration and SFDC user mapping
CREATE TABLE IF NOT EXISTS rep_roster (
  rep_id TEXT PRIMARY KEY,                    -- 'rep-jl', 'rep-ma', etc.
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  sf_user_id TEXT,                            -- Salesforce User ID (005...) for OwnerId sync
  is_active BOOLEAN DEFAULT true,             -- In rotation?
  is_available BOOLEAN DEFAULT true,          -- Not OOO?
  unavailable_reason TEXT,                    -- 'PTO', 'Sick', 'Training', etc.
  weight INTEGER DEFAULT 1,                   -- Distribution weight (1 = equal share)
  ramping_until TIMESTAMPTZ,                  -- Reduced allocation until this date
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed with current roster
INSERT INTO rep_roster (rep_id, full_name, email, is_active, weight) VALUES
  ('rep-jl', 'Jack Luther',   'jack.luther@teamtailor.com',   true, 1),
  ('rep-ma', 'Moe Aqel',      'moe.aqel@teamtailor.com',     true, 1),
  ('rep-th', 'Tyler Hanson',   'tyler.hanson@teamtailor.com',  true, 1),
  ('rep-ks', 'Katy Shelman',   'katy.shelman@teamtailor.com',  true, 1)
ON CONFLICT (rep_id) DO NOTHING;

-- ── Round-Robin State ──
-- Tracks the current pointer position for fair distribution
CREATE TABLE IF NOT EXISTS round_robin_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  current_index INTEGER DEFAULT 0,            -- Points to position in sorted active rep list
  last_assigned_rep_id TEXT,                   -- Last rep who received an assignment
  last_assigned_at TIMESTAMPTZ,
  total_assignments INTEGER DEFAULT 0,         -- Running counter
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Initialize with a single row
INSERT INTO round_robin_state (id, current_index, total_assignments)
VALUES (1, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- ── Assignment Log ──
-- Full audit trail for every assignment and reassignment
CREATE TABLE IF NOT EXISTS assignment_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL,                        -- Company domain
  company_name TEXT,
  rep_id TEXT NOT NULL REFERENCES rep_roster(rep_id),
  previous_rep_id TEXT,                        -- NULL for first assignment
  method TEXT NOT NULL,                        -- 'round_robin', 'sfdc_owner', 'sticky', 'manual'
  reason TEXT,                                 -- 'New RB2B signal', 'Admin reassignment', etc.
  signal_id UUID,                              -- Optional link to triggering signal
  triggered_by TEXT,                           -- 'flywheel', 'clay_webhook', 'admin', 'sfdc_sync'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_assignment_log_domain ON assignment_log(domain);
CREATE INDEX IF NOT EXISTS idx_assignment_log_rep_id ON assignment_log(rep_id);
CREATE INDEX IF NOT EXISTS idx_assignment_log_created_at ON assignment_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assignment_log_method ON assignment_log(method);

-- ── Add assignment_method to clay_signals ──
-- Tracks how the rep was assigned for each signal
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clay_signals' AND column_name = 'assignment_method'
  ) THEN
    ALTER TABLE clay_signals ADD COLUMN assignment_method TEXT;
  END IF;
END $$;

-- ── Enable RLS ──
ALTER TABLE rep_roster ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_robin_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_log ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access on rep_roster"
  ON rep_roster FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on round_robin_state"
  ON round_robin_state FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on assignment_log"
  ON assignment_log FOR ALL
  USING (auth.role() = 'service_role');

-- Anon can read roster and stats (for the UI)
CREATE POLICY "Anon read rep_roster"
  ON rep_roster FOR SELECT
  USING (true);

CREATE POLICY "Anon read assignment_log"
  ON assignment_log FOR SELECT
  USING (true);
