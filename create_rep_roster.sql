-- ══════════════════════════════════════════════════════════
-- Create rep_roster + round_robin_state tables
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════

-- Rep roster with SFDC User IDs
CREATE TABLE IF NOT EXISTS rep_roster (
  rep_id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  sf_user_id TEXT,
  salesloft_user_id INTEGER,
  salesloft_guid TEXT,
  territory TEXT,
  weight NUMERIC DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  unavailable_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Round-robin state tracker
CREATE TABLE IF NOT EXISTS round_robin_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  current_index INTEGER DEFAULT 0,
  last_assigned_rep_id TEXT,
  last_assigned_at TIMESTAMPTZ,
  total_assignments INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Assignment log
CREATE TABLE IF NOT EXISTS assignment_log (
  id BIGSERIAL PRIMARY KEY,
  domain TEXT,
  company_name TEXT,
  rep_id TEXT,
  previous_rep_id TEXT,
  method TEXT,
  reason TEXT,
  signal_id TEXT,
  triggered_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Insert reps ──
INSERT INTO rep_roster (rep_id, full_name, email, sf_user_id, salesloft_user_id, salesloft_guid, territory)
VALUES
  ('rep-ma', 'Moe Aqel', 'moe.aqel@teamtailor.com', '005Vg0000052LDZIA2', 12427, '0a9c8f1e-31d7-40d6-84d9-d7b42531e07b', 'all'),
  ('rep-jl', 'Jack Luther', 'jack.luther@teamtailor.com', '005Vg0000052LQTIA2', 12457, '5b01a11c-6e1b-4312-8487-55542a9f1578', 'all'),
  ('rep-th', 'Tyler Hanson', 'tyler.hanson@teamtailor.com', '005Vg000004mEJJIA2', 12418, 'd3e9a1f1-2c4b-4f8e-8d5a-9b7c3e1f2a4d', 'all')
ON CONFLICT (rep_id) DO UPDATE SET
  sf_user_id = EXCLUDED.sf_user_id,
  salesloft_user_id = EXCLUDED.salesloft_user_id,
  salesloft_guid = EXCLUDED.salesloft_guid,
  updated_at = now();

-- Initialize round-robin state
INSERT INTO round_robin_state (id, current_index, total_assignments)
VALUES (1, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- ── RLS Policies ──
ALTER TABLE rep_roster ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_robin_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_log ENABLE ROW LEVEL SECURITY;

-- Service role gets full access
CREATE POLICY "service_role_rep_roster" ON rep_roster FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_round_robin" ON round_robin_state FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_assignment_log" ON assignment_log FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Anon gets read-only
CREATE POLICY "anon_read_rep_roster" ON rep_roster FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_round_robin" ON round_robin_state FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_assignment_log" ON assignment_log FOR SELECT TO anon USING (true);
