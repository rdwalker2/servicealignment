-- ═══════════════════════════════════════════
-- 008: Align Supabase columns to SFDC field names
-- Renames existing columns + adds missing SFDC fields
-- ═══════════════════════════════════════════

-- Rename current_hris → current_hr_provider (SFDC: Current_HR_Provider__c)
ALTER TABLE accounts RENAME COLUMN current_hris TO current_hr_provider;

-- Rename country → billing_country (SFDC: BillingCountry)
ALTER TABLE accounts RENAME COLUMN country TO billing_country;

-- Consolidate hq_city/hq_state into city/state where null
UPDATE accounts SET city = hq_city WHERE city IS NULL AND hq_city IS NOT NULL;
UPDATE accounts SET state = hq_state WHERE state IS NULL AND hq_state IS NOT NULL;

-- Add SFDC alignment columns
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS employee_range text;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS lifecycle_stage text;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS sf_account_source text;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS sf_admin_notes text;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS account_tier text;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS ats_renewal_date date;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS previous_ats text;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS previous_hr_provider text;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS account_research_insights text;

-- Backfill employee_range from employee_count
UPDATE accounts SET employee_range = CASE
  WHEN employee_count <= 25 THEN '1-25'
  WHEN employee_count <= 100 THEN '26-100'
  WHEN employee_count <= 250 THEN '101-250'
  WHEN employee_count <= 500 THEN '251-500'
  WHEN employee_count <= 1000 THEN '501-1000'
  WHEN employee_count <= 2000 THEN '1001-2000'
  WHEN employee_count <= 5000 THEN '2001-5000'
  ELSE '5000+'
END
WHERE employee_count IS NOT NULL AND employee_count > 0 AND employee_range IS NULL;

-- Add territory + sf_reassignment_id to rep_roster (if exists)
DO $$ BEGIN
  ALTER TABLE rep_roster ADD COLUMN IF NOT EXISTS territory text;
  ALTER TABLE rep_roster ADD COLUMN IF NOT EXISTS sf_reassignment_id text;
  UPDATE rep_roster SET territory = 'all' WHERE territory IS NULL;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
