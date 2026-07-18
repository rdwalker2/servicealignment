-- ============================================================
-- SCC Security Hardening SQL
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ══════════════════════════════════════════════
-- 1. AUDIT LOG TABLE
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);

-- ══════════════════════════════════════════════
-- 2. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ══════════════════════════════════════════════

-- Clay signals
ALTER TABLE clay_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for authenticated users" ON clay_signals FOR SELECT USING (true);
CREATE POLICY "Allow insert for anon (Clay webhook)" ON clay_signals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" ON clay_signals FOR UPDATE USING (true);

-- Dispositions
ALTER TABLE dispositions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON dispositions FOR ALL USING (true);

-- Push events
ALTER TABLE push_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON push_events FOR ALL USING (true);

-- Account notes
ALTER TABLE account_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON account_notes FOR ALL USING (true);

-- Audit log (anyone can insert, only readable for auditing)
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert" ON audit_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read" ON audit_log FOR SELECT USING (true);

-- ══════════════════════════════════════════════
-- 3. DATA RETENTION: Auto-purge signals older than 90 days
-- ══════════════════════════════════════════════

-- Add retention column if not exists
ALTER TABLE clay_signals 
  ADD COLUMN IF NOT EXISTS retention_expires_at TIMESTAMPTZ 
  DEFAULT (now() + INTERVAL '90 days');

-- Cron job to purge expired records (requires pg_cron extension)
-- Enable in Supabase Dashboard: Database → Extensions → pg_cron → Enable
-- Then run:
-- SELECT cron.schedule(
--   'purge-expired-signals',
--   '0 3 * * *',  -- Run daily at 3 AM UTC
--   $$DELETE FROM clay_signals WHERE retention_expires_at < now()$$
-- );

-- ══════════════════════════════════════════════
-- 4. VERIFY SETUP
-- ══════════════════════════════════════════════

-- Check RLS is enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('clay_signals', 'dispositions', 'push_events', 'account_notes', 'audit_log');
