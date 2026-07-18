-- ═══════════════════════════════════════════════════════════════════
-- Customer Universe Table
-- Migrated from hardcoded customerUniverse.ts (10,618 records)
-- Run this in the Supabase SQL Editor before running migrate_customers.cjs
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  account_name TEXT NOT NULL,
  website TEXT,
  career_site TEXT,
  phase TEXT,
  last_active TIMESTAMPTZ,
  linkedin_url TEXT,
  segment TEXT,
  employee_range TEXT,
  previous_ats TEXT,
  billing_country TEXT,
  billing_state TEXT,
  region TEXT,
  country_flag TEXT,
  industry TEXT,
  won_opportunities INT DEFAULT 0,
  nps_score INT,
  nps_classification TEXT,
  nps_avg_score DECIMAL,
  nps_responses INT DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated (and anon) users to read
CREATE POLICY "Authenticated users can read" ON customers
  FOR SELECT USING (true);

-- Indexes for common filter/sort columns
CREATE INDEX IF NOT EXISTS idx_customers_phase ON customers (phase);
CREATE INDEX IF NOT EXISTS idx_customers_segment ON customers (segment);
CREATE INDEX IF NOT EXISTS idx_customers_region ON customers (region);
CREATE INDEX IF NOT EXISTS idx_customers_industry ON customers (industry);
CREATE INDEX IF NOT EXISTS idx_customers_billing_country ON customers (billing_country);
CREATE INDEX IF NOT EXISTS idx_customers_nps_classification ON customers (nps_classification);
CREATE INDEX IF NOT EXISTS idx_customers_account_name ON customers (account_name);
