-- ============================================
-- DATA INTEGRITY CONSTRAINTS MIGRATION
-- Run in Supabase SQL Editor
-- ============================================

-- 1. DOMAIN NORMALIZER FUNCTION
-- Auto-cleans domain on every insert/update across all tables
CREATE OR REPLACE FUNCTION normalize_domain()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.company_domain IS NOT NULL THEN
    NEW.company_domain = lower(
      regexp_replace(
        regexp_replace(
          regexp_replace(NEW.company_domain, '^https?://', ''),
          '^www\.', ''
        ),
        '/$', ''
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all three tables
CREATE TRIGGER trg_normalize_seeds
  BEFORE INSERT OR UPDATE ON audience_seeds
  FOR EACH ROW EXECUTE FUNCTION normalize_domain();

CREATE TRIGGER trg_normalize_contacts
  BEFORE INSERT OR UPDATE ON audience_contacts
  FOR EACH ROW EXECUTE FUNCTION normalize_domain();

CREATE TRIGGER trg_normalize_signals
  BEFORE INSERT OR UPDATE ON clay_signals
  FOR EACH ROW EXECUTE FUNCTION normalize_domain();


-- 2. UNIQUE CONSTRAINT: No duplicate accounts in same audience
ALTER TABLE audience_seeds
  ADD CONSTRAINT unique_domain_audience UNIQUE (company_domain, audience_source);


-- 3. LOWERCASE ENFORCEMENT on audience_source
ALTER TABLE audience_seeds
  ADD CONSTRAINT chk_lowercase_source CHECK (audience_source = lower(audience_source));

ALTER TABLE audience_contacts
  ADD CONSTRAINT chk_lowercase_source_contacts CHECK (audience_source = lower(audience_source));


-- 4. SIGNAL SOURCE: NOT NULL with default
ALTER TABLE clay_signals
  ALTER COLUMN signal_source SET DEFAULT 'clay';

-- Backfill any nulls before adding NOT NULL
UPDATE clay_signals SET signal_source = 'clay' WHERE signal_source IS NULL OR signal_source = '';

ALTER TABLE clay_signals
  ALTER COLUMN signal_source SET NOT NULL;


-- 5. SIGNAL DEDUP CONSTRAINT
-- Prevent exact same signal for same person at same time
-- Using a partial unique index to handle NULLs in email gracefully
CREATE UNIQUE INDEX idx_unique_signal
  ON clay_signals (company_domain, email, signal_name, detected_at)
  WHERE email IS NOT NULL AND email != '';

-- For signals without email (account-level signals), dedup on company+signal+time
CREATE UNIQUE INDEX idx_unique_signal_no_email
  ON clay_signals (company_domain, signal_name, detected_at)
  WHERE email IS NULL OR email = '';


-- 6. DOMAIN ALIASES TABLE (for subsidiaries / rebrands)
CREATE TABLE IF NOT EXISTS domain_aliases (
  alias_domain text PRIMARY KEY,
  canonical_domain text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Example entries (add as discovered):
-- INSERT INTO domain_aliases (alias_domain, canonical_domain, notes) VALUES
--   ('valspar.com', 'sherwin-williams.com', 'Subsidiary acquired 2017'),
--   ('ceridian.com', 'dayforce.com', 'Rebranded 2024');


-- ============================================
-- VERIFICATION QUERIES (run after migration)
-- ============================================

-- Check for any remaining dupes
-- SELECT company_domain, audience_source, count(*) 
-- FROM audience_seeds 
-- GROUP BY company_domain, audience_source 
-- HAVING count(*) > 1;

-- Check constraint works
-- INSERT INTO audience_seeds (company_name, company_domain, audience_source, market) 
-- VALUES ('Test', 'TEST.COM', 'rippling', 'us');
-- Should auto-normalize to 'test.com'
