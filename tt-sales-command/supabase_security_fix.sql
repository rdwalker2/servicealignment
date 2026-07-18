-- ============================================================
-- SUPABASE SECURITY FIX: Enable RLS + Create Policies
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- STEP 1: Enable Row Level Security on ALL tables
-- ══════════════════════════════════════════════════════════════

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clay_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispositions ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_segments ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════
-- STEP 2: Create READ-ONLY policies for the anon (public) key
-- The anon key is used by the frontend and ad audience API.
-- It should ONLY be able to READ, never write/delete.
-- ══════════════════════════════════════════════════════════════

-- Accounts: anon can read (for audience builder, ad queries)
CREATE POLICY "anon_read_accounts" ON accounts
  FOR SELECT USING (auth.role() = 'anon');

-- Contacts: anon can read (for audience queries)
CREATE POLICY "anon_read_contacts" ON contacts
  FOR SELECT USING (auth.role() = 'anon');

-- Clay signals: anon can read (for signal board display)
CREATE POLICY "anon_read_clay_signals" ON clay_signals
  FOR SELECT USING (auth.role() = 'anon');

-- Dispositions: anon can read and write (reps update these from the UI)
CREATE POLICY "anon_read_dispositions" ON dispositions
  FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "anon_write_dispositions" ON dispositions
  FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "anon_update_dispositions" ON dispositions
  FOR UPDATE USING (auth.role() = 'anon');

-- Push events: anon can read and write (UI logs push actions)
CREATE POLICY "anon_read_push_events" ON push_events
  FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "anon_write_push_events" ON push_events
  FOR INSERT WITH CHECK (auth.role() = 'anon');

-- Account notes: anon can read and write (reps add notes from UI)
CREATE POLICY "anon_read_account_notes" ON account_notes
  FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "anon_write_account_notes" ON account_notes
  FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "anon_update_account_notes" ON account_notes
  FOR UPDATE USING (auth.role() = 'anon');

-- Saved segments: anon can read and write (audience builder saves)
CREATE POLICY "anon_read_saved_segments" ON saved_segments
  FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "anon_write_saved_segments" ON saved_segments
  FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "anon_update_saved_segments" ON saved_segments
  FOR UPDATE USING (auth.role() = 'anon');
CREATE POLICY "anon_delete_saved_segments" ON saved_segments
  FOR DELETE USING (auth.role() = 'anon');

-- ══════════════════════════════════════════════════════════════
-- STEP 3: Service role bypasses RLS automatically
-- No policies needed — service_role key always has full access.
-- This is used by: server.js, flywheel.js, clay_webhook.js
-- ══════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════
-- STEP 4: Data cleanup (delete junk records)
-- ══════════════════════════════════════════════════════════════

-- Delete Salesforce ID domains (314 rows of garbage)
DELETE FROM accounts WHERE domain LIKE '001%';

-- Delete junk company names from scraping artifacts
DELETE FROM accounts 
WHERE company_name ILIKE 'Current Open%' 
   OR company_name ILIKE 'Career Opportun%'
   OR company_name ILIKE 'Job Board%'
   OR company_name = 'Open Roles'
   OR company_name ILIKE 'Open Roles%'
   OR company_name ILIKE 'Current Opening%'
   OR company_name ILIKE 'Jobs at %'
   OR company_name ILIKE 'Join our Team%';

-- ══════════════════════════════════════════════════════════════
-- STEP 5: Tag untagged accounts so the data looks organized
-- ══════════════════════════════════════════════════════════════

-- Tag the ~18,700 null audience_source records as CRM imports
UPDATE accounts 
SET audience_source = 'crm_import' 
WHERE audience_source IS NULL;

-- Retag the 558 mislabeled "inbound" records
UPDATE accounts 
SET audience_source = 'rippling_unenriched' 
WHERE audience_source = 'inbound' 
  AND current_ats = 'Rippling';

-- Tag remaining inbound without Rippling ATS
UPDATE accounts 
SET audience_source = 'inbound_unenriched' 
WHERE audience_source = 'inbound';
