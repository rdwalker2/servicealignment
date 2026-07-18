-- ═══════════════════════════════════════════
-- 007: SFDC Picklist Alignment + New Fields
-- Based on Gordon's picklist exports (July 2 2026)
-- ═══════════════════════════════════════════

-- ── Employee range bucket (SFDC stores as picklist, not integer) ──
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS employee_range text;
COMMENT ON COLUMN accounts.employee_range IS 'SFDC Amount_of_Employees__c range: 1-25, 26-100, 101-250, 251-500, 501-1000, 1001-2000, 2001-5000, 5000+';

-- Backfill from existing integer employee_count
UPDATE accounts SET employee_range = CASE
  WHEN employee_count IS NULL OR employee_count <= 0 THEN NULL
  WHEN employee_count <= 25 THEN '1-25'
  WHEN employee_count <= 100 THEN '26-100'
  WHEN employee_count <= 250 THEN '101-250'
  WHEN employee_count <= 500 THEN '251-500'
  WHEN employee_count <= 1000 THEN '501-1000'
  WHEN employee_count <= 2000 THEN '1001-2000'
  WHEN employee_count <= 5000 THEN '2001-5000'
  ELSE '5000+'
END
WHERE employee_range IS NULL AND employee_count IS NOT NULL;

-- ── SFDC AccountSource (separate from our audience_source) ──
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS sf_account_source text;
COMMENT ON COLUMN accounts.sf_account_source IS 'SFDC AccountSource picklist — marketing channel attribution';

-- ── Additional fields discovered from screenshots ──

ALTER TABLE accounts ADD COLUMN IF NOT EXISTS account_tier text;
COMMENT ON COLUMN accounts.account_tier IS 'SFDC Account Tier — ICP tier from sales ops';

ALTER TABLE accounts ADD COLUMN IF NOT EXISTS ats_renewal_date date;
COMMENT ON COLUMN accounts.ats_renewal_date IS 'SFDC Current ATS Renewal Date — critical for outreach timing';

ALTER TABLE accounts ADD COLUMN IF NOT EXISTS previous_ats text;
COMMENT ON COLUMN accounts.previous_ats IS 'SFDC Previous ATS Provider — shows switching behavior';

ALTER TABLE accounts ADD COLUMN IF NOT EXISTS previous_hr_provider text;
COMMENT ON COLUMN accounts.previous_hr_provider IS 'SFDC Previous HR Provider';

ALTER TABLE accounts ADD COLUMN IF NOT EXISTS account_research_insights text;
COMMENT ON COLUMN accounts.account_research_insights IS 'SFDC Account Research Insights — free text notes';

-- ── Index for renewal date queries (timing outreach) ──
CREATE INDEX IF NOT EXISTS idx_accounts_ats_renewal ON accounts (ats_renewal_date) WHERE ats_renewal_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_accounts_account_tier ON accounts (account_tier);
