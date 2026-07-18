-- ============================================================
-- Migration: Add Unified Identity Fields to Rep Roster
-- ============================================================

ALTER TABLE rep_roster
ADD COLUMN IF NOT EXISTS granola_email TEXT,
ADD COLUMN IF NOT EXISTS salesloft_guid TEXT;

-- Backfill granola_email with existing teamtailor email 
-- since most reps use SSO/same email across tools.
UPDATE rep_roster
SET granola_email = email
WHERE granola_email IS NULL;
