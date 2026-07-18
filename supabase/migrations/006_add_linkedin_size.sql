-- ═══════════════════════════════════════════
-- 6. Add LinkedIn Company Size
-- ═══════════════════════════════════════════
-- Run this in Supabase SQL Editor.

-- Add column to audience seeds
ALTER TABLE audience_seeds ADD COLUMN IF NOT EXISTS company_size_linkedin text;

-- Add column to clay signals
ALTER TABLE clay_signals ADD COLUMN IF NOT EXISTS company_size_linkedin text;

-- Recreate view to include the new column
CREATE OR REPLACE VIEW clay_accounts_view AS
SELECT
  company_domain,
  MAX(company_name) as company_name,
  MAX(company_location) as company_location,
  MAX(employee_count) as employee_count,
  MAX(open_roles) as open_roles,
  MAX(current_ats) as current_ats,
  MAX(audience_source) as audience_source,
  MAX(icp_tier) as icp_tier,
  SUM(signal_score) as total_score,
  MAX(detected_at) as last_activity,
  COUNT(id) as signal_count,
  COUNT(DISTINCT email) as contact_count,
  COUNT(CASE WHEN signal_source = 'rb2b' THEN 1 END) as web_visits,
  MAX(assigned_rep_id) as assigned_rep_id,
  MAX(ai_research_brief) as ai_research_brief,
  
  -- ISP enrichment fields
  MAX(isp_score) as isp_score,
  MAX(isp_explanation) as isp_explanation,
  MAX(g2_score) as g2_score,
  MAX(indeed_score) as indeed_score,
  MAX(glassdoor_score) as glassdoor_score,
  MAX(negative_reviews) as negative_reviews,
  MAX(signal_category) as signal_category,
  MAX(hiring_signals) as hiring_signals,
  
  -- The new column
  MAX(company_size_linkedin) as company_size_linkedin
  
FROM clay_signals
GROUP BY company_domain;
