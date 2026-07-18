-- ============================================
-- CUSTOMER SUPPRESSION + EMPLOYEE FILTER
-- Prevents existing customers and internal
-- employees from appearing as prospects.
-- ============================================

-- 1. Customer domains table (populate when list is available)
CREATE TABLE IF NOT EXISTS customer_domains (
  domain text PRIMARY KEY,
  customer_name text,
  added_at timestamptz DEFAULT now(),
  notes text
);

-- 2. Update the auto-matching trigger to include suppression
CREATE OR REPLACE FUNCTION auto_match_audience()
RETURNS TRIGGER AS $$
DECLARE
  matched_source text;
  canonical text;
  is_customer boolean;
BEGIN
  -- Step 1: Check domain_aliases for subsidiary/rebrand mapping
  SELECT da.canonical_domain INTO canonical
  FROM domain_aliases da
  WHERE da.alias_domain = NEW.company_domain
  LIMIT 1;

  IF canonical IS NOT NULL THEN
    NEW.company_domain = canonical;
  END IF;

  -- Step 2: Suppress internal employees
  IF NEW.email IS NOT NULL AND (
    NEW.email LIKE '%@teamtailor.com' OR
    NEW.email LIKE '%@teamtailor.se'
  ) THEN
    -- Tag as internal so portal can filter/hide
    NEW.is_existing_customer = true;
  END IF;

  -- Step 3: Check if company is an existing customer
  SELECT EXISTS(
    SELECT 1 FROM customer_domains cd WHERE cd.domain = NEW.company_domain
  ) INTO is_customer;

  IF is_customer THEN
    NEW.is_existing_customer = true;
  END IF;

  -- Step 4: Auto-match audience (only if not explicitly set)
  IF NEW.audience_source IS NULL OR NEW.audience_source = '' OR NEW.audience_source = 'inbound' THEN
    SELECT a.audience_source INTO matched_source
    FROM audience_seeds a
    WHERE a.company_domain = NEW.company_domain
    LIMIT 1;

    IF matched_source IS NOT NULL THEN
      NEW.audience_source = matched_source;
    ELSE
      NEW.audience_source = 'inbound';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger already exists, function replacement takes effect immediately
