-- ═══════════════════════════════════════════
-- 005: Salesforce Field Alignment
-- Adds columns to match Gordon's SFDC field list
-- ═══════════════════════════════════════════

-- ── New columns from SFDC mapping ──

-- BillingCountry — SFDC tracks country separately from city
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS billing_country text;
COMMENT ON COLUMN accounts.billing_country IS 'SFDC: BillingCountry — ISO or free-text country';

-- Lifecycle_Stage__c — SFDC account lifecycle stage
-- Maps to our dispositions system and drives ad segmentation
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS lifecycle_stage text;
COMMENT ON COLUMN accounts.lifecycle_stage IS 'SFDC: Lifecycle_Stage__c — synced from Salesforce, drives ad targeting segments';

-- Current_HR_Provider__c — HR/HCM vendor (separate from ATS)
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS current_hr_provider text;
COMMENT ON COLUMN accounts.current_hr_provider IS 'SFDC: Current_HR_Provider__c — e.g. ADP, Paychex, Gusto';

-- Salesforce_Administration_Notes__c — read-only admin notes
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS sf_admin_notes text;
COMMENT ON COLUMN accounts.sf_admin_notes IS 'SFDC: Salesforce_Administration_Notes__c — read-only reference';

-- ── Split location into city + state for SFDC BillingCity alignment ──

ALTER TABLE accounts ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS state text;
COMMENT ON COLUMN accounts.city IS 'SFDC: BillingCity — parsed from location or synced from SFDC';
COMMENT ON COLUMN accounts.state IS 'State/province — parsed from location or synced from SFDC';

-- Backfill city/state from existing location field
-- Format is typically "City, ST" (e.g. "Arlington, VA")
UPDATE accounts
SET
  city  = TRIM(SPLIT_PART(location, ',', 1)),
  state = TRIM(SPLIT_PART(location, ',', 2))
WHERE location IS NOT NULL
  AND location LIKE '%,%'
  AND city IS NULL;

-- ── Add Company LinkedIn URL to accounts table ──
-- Existed in clay_signals but not in accounts directly
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS linkedin_company_url text;
COMMENT ON COLUMN accounts.linkedin_company_url IS 'SFDC: Company_LinkedIn__c — company LinkedIn page URL';

-- Backfill from clay_signals if available
UPDATE accounts a
SET linkedin_company_url = sub.linkedin_url
FROM (
  SELECT DISTINCT ON (company_domain) company_domain, company_linkedin_url as linkedin_url
  FROM clay_signals
  WHERE company_linkedin_url IS NOT NULL AND company_linkedin_url != ''
  ORDER BY company_domain, detected_at DESC
) sub
WHERE a.domain = sub.company_domain
  AND a.linkedin_company_url IS NULL;

-- ── Index for lifecycle stage (used in ad segmentation queries) ──
CREATE INDEX IF NOT EXISTS idx_accounts_lifecycle_stage ON accounts (lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_accounts_billing_country ON accounts (billing_country);
