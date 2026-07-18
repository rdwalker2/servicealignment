-- ============================================
-- AUTO AUDIENCE MATCHING TRIGGER
-- Automatically tags incoming clay_signals with
-- the correct audience_source by matching
-- company_domain against audience_seeds.
--
-- Daniel just pushes data. This trigger does the rest.
-- ============================================

CREATE OR REPLACE FUNCTION auto_match_audience()
RETURNS TRIGGER AS $$
DECLARE
  matched_source text;
  canonical text;
BEGIN
  -- Step 1: Check domain_aliases for subsidiary/rebrand mapping
  SELECT da.canonical_domain INTO canonical
  FROM domain_aliases da
  WHERE da.alias_domain = NEW.company_domain
  LIMIT 1;

  -- If alias found, update the domain to canonical
  IF canonical IS NOT NULL THEN
    NEW.company_domain = canonical;
  END IF;

  -- Step 2: Only auto-match if audience_source is null, empty, or 'inbound'
  -- (Don't override if Daniel explicitly set an audience)
  IF NEW.audience_source IS NULL OR NEW.audience_source = '' OR NEW.audience_source = 'inbound' THEN
    -- Check if domain exists in any audience
    SELECT a.audience_source INTO matched_source
    FROM audience_seeds a
    WHERE a.company_domain = NEW.company_domain
    LIMIT 1;

    IF matched_source IS NOT NULL THEN
      NEW.audience_source = matched_source;
    ELSE
      -- No match — tag as inbound
      NEW.audience_source = 'inbound';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Run BEFORE the domain normalizer (which is also BEFORE INSERT)
-- so that by the time this runs, the domain is already normalized
CREATE TRIGGER trg_auto_match_audience
  BEFORE INSERT ON clay_signals
  FOR EACH ROW EXECUTE FUNCTION auto_match_audience();
