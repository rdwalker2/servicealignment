-- ═══════════════════════════════════════════
-- 7. Relational Architecture Migration
-- ═══════════════════════════════════════════

-- 1. Create the standard relational tables
CREATE TABLE IF NOT EXISTS accounts (
  domain text PRIMARY KEY,
  company_name text NOT NULL,
  location text,
  employee_count integer,
  company_size_linkedin text,
  current_ats text,
  audience_source text,
  tier text DEFAULT 'watch',
  market text,
  firmographic_tier text,
  is_existing_customer boolean DEFAULT false,
  sf_account_owner text,
  sf_account_id text,
  assigned_rep_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contacts (
  email text PRIMARY KEY,
  domain text NOT NULL REFERENCES accounts(domain) ON DELETE CASCADE,
  name text NOT NULL,
  title text,
  linkedin_url text,
  phone text,
  persona text,
  is_primary boolean DEFAULT false,
  sf_contact_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Migrate existing unique firmographics into accounts
-- We use a CTE to get the most recently updated firmographics per domain
INSERT INTO accounts (domain, company_name, location, employee_count, company_size_linkedin, current_ats, audience_source, tier, market, firmographic_tier, assigned_rep_id)
SELECT DISTINCT ON (company_domain)
  company_domain,
  company_name,
  company_location,
  employee_count,
  company_size_linkedin,
  current_ats,
  audience_source,
  icp_tier,
  market,
  firmographic_tier,
  assigned_rep_id
FROM clay_signals
ORDER BY company_domain, detected_at DESC
ON CONFLICT (domain) DO NOTHING;

-- Also migrate from audience_seeds for accounts that haven't been enriched
INSERT INTO accounts (domain, company_name, location, employee_count, company_size_linkedin, current_ats, audience_source, market)
SELECT DISTINCT ON (company_domain)
  company_domain,
  company_name,
  company_location,
  employee_count,
  company_size_linkedin,
  current_ats,
  audience_source,
  market
FROM audience_seeds
ORDER BY company_domain, created_at DESC
ON CONFLICT (domain) DO NOTHING;

-- 3. Migrate existing contacts
-- Ensure the columns exist on clay_signals first so we don't get a column not found error
ALTER TABLE clay_signals ADD COLUMN IF NOT EXISTS contact_persona text;

INSERT INTO contacts (email, domain, name, title, linkedin_url, phone, persona)
SELECT DISTINCT ON (email)
  email,
  company_domain,
  full_name,
  job_title,
  linkedin_url,
  phone,
  contact_persona
FROM clay_signals
WHERE email IS NOT NULL AND email != ''
ORDER BY email, detected_at DESC
ON CONFLICT (email) DO NOTHING;

INSERT INTO contacts (email, domain, name, title, linkedin_url, phone)
SELECT DISTINCT ON (email)
  email,
  company_domain,
  full_name,
  job_title,
  linkedin_url,
  phone
FROM audience_contacts
WHERE email IS NOT NULL AND email != ''
ORDER BY email, created_at DESC
ON CONFLICT (email) DO NOTHING;

-- 4. Create trigger to keep accounts/contacts updated from Clay webhook
-- (We keep the old columns in clay_signals so the Clay webhook doesn't break via REST API)
CREATE OR REPLACE FUNCTION trigger_upsert_clay_signal_entities()
RETURNS TRIGGER AS $$
BEGIN
  -- Upsert Account
  INSERT INTO accounts (
    domain, company_name, location, employee_count, company_size_linkedin, 
    current_ats, audience_source, tier, market, firmographic_tier, assigned_rep_id, updated_at
  ) VALUES (
    NEW.company_domain, NEW.company_name, NEW.company_location, NEW.employee_count, NEW.company_size_linkedin,
    NEW.current_ats, NEW.audience_source, NEW.icp_tier, NEW.market, NEW.firmographic_tier, NEW.assigned_rep_id, now()
  )
  ON CONFLICT (domain) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    location = EXCLUDED.location,
    employee_count = EXCLUDED.employee_count,
    company_size_linkedin = EXCLUDED.company_size_linkedin,
    current_ats = EXCLUDED.current_ats,
    tier = EXCLUDED.tier,
    assigned_rep_id = EXCLUDED.assigned_rep_id,
    updated_at = EXCLUDED.updated_at
  WHERE EXCLUDED.company_name IS NOT NULL AND EXCLUDED.company_name != '';

  -- Upsert Contact if present
  IF NEW.email IS NOT NULL AND NEW.email != '' THEN
    INSERT INTO contacts (
      email, domain, name, title, linkedin_url, phone, persona, updated_at
    ) VALUES (
      NEW.email, NEW.company_domain, NEW.full_name, NEW.job_title, NEW.linkedin_url, NEW.phone, NEW.contact_persona, now()
    )
    ON CONFLICT (email) DO UPDATE SET
      name = EXCLUDED.name,
      title = EXCLUDED.title,
      linkedin_url = EXCLUDED.linkedin_url,
      phone = EXCLUDED.phone,
      persona = COALESCE(EXCLUDED.persona, contacts.persona),
      updated_at = EXCLUDED.updated_at;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS clay_signals_upsert_entities ON clay_signals;
CREATE TRIGGER clay_signals_upsert_entities
  AFTER INSERT ON clay_signals
  FOR EACH ROW
  EXECUTE FUNCTION trigger_upsert_clay_signal_entities();

-- 5. Recreate the view to be a true relational projection
DROP VIEW IF EXISTS clay_accounts_view;
CREATE OR REPLACE VIEW clay_accounts_view AS
SELECT
  a.domain as company_domain,
  a.company_name,
  a.location as company_location,
  a.employee_count,
  a.company_size_linkedin,
  a.current_ats,
  a.audience_source,
  a.tier as icp_tier,
  COALESCE(SUM(s.signal_score), 0) as total_score,
  MAX(s.detected_at) as last_activity,
  COUNT(s.id) as signal_count,
  (SELECT COUNT(c.email) FROM contacts c WHERE c.domain = a.domain) as contact_count,
  COUNT(CASE WHEN s.signal_source = 'rb2b' THEN 1 END) as web_visits,
  a.assigned_rep_id,
  MAX(s.ai_research_brief) as ai_research_brief,
  
  -- ISP enrichment fields (these could ideally move to accounts table too, but keeping in view for simplicity for now)
  MAX(s.isp_score) as isp_score,
  MAX(s.isp_explanation) as isp_explanation,
  MAX(s.g2_score) as g2_score,
  MAX(s.indeed_score) as indeed_score,
  MAX(s.glassdoor_score) as glassdoor_score,
  MAX(s.negative_reviews) as negative_reviews,
  MAX(s.signal_category) as signal_category,
  MAX(s.hiring_signals) as hiring_signals,
  
  a.market,
  a.firmographic_tier,
  a.is_existing_customer
FROM accounts a
LEFT JOIN clay_signals s ON a.domain = s.company_domain
GROUP BY a.domain;
