-- ============================================
-- DATA INTEGRITY AUDIT
-- Run periodically to find orphaned records,
-- mismatches, and data quality issues.
-- ============================================

-- 1. ORPHANED CONTACTS: contacts with no matching account
SELECT 'Orphaned Contacts' as check_name,
       count(*) as issue_count
FROM audience_contacts ac
WHERE ac.company_domain NOT IN (
  SELECT company_domain FROM audience_seeds
);

-- 2. ORPHANED SIGNALS: signals with no matching account (excluding inbound)
SELECT 'Orphaned Signals (non-inbound)' as check_name,
       count(*) as issue_count
FROM clay_signals cs
WHERE cs.audience_source != 'inbound'
  AND cs.company_domain NOT IN (
    SELECT company_domain FROM audience_seeds
  );

-- 3. AUDIENCE TAG MISMATCH: signals tagged with an audience but domain isn't in that audience
SELECT 'Audience Tag Mismatch' as check_name,
       count(*) as issue_count
FROM clay_signals cs
WHERE cs.audience_source != 'inbound'
  AND cs.audience_source IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM audience_seeds a 
    WHERE a.company_domain = cs.company_domain 
      AND a.audience_source = cs.audience_source
  );

-- 4. DUPLICATE DOMAINS: same domain in multiple audiences
SELECT 'Duplicate Domains (multi-audience)' as check_name,
       count(*) as issue_count
FROM (
  SELECT company_domain
  FROM audience_seeds
  GROUP BY company_domain
  HAVING count(DISTINCT audience_source) > 1
) dupes;

-- 5. EMPTY DOMAINS: accounts with blank or null domain
SELECT 'Empty Domains' as check_name,
       count(*) as issue_count
FROM audience_seeds
WHERE company_domain IS NULL OR company_domain = '';

-- 6. MISSING SIGNAL SOURCE: signals without a source tag
SELECT 'Missing Signal Source' as check_name,
       count(*) as issue_count
FROM clay_signals
WHERE signal_source IS NULL OR signal_source = '';

-- 7. STALE CONTACTS: contacts not verified in 90+ days
SELECT 'Contacts Without Verified Date' as check_name,
       count(*) as issue_count
FROM audience_contacts
WHERE 1=1; -- All contacts lack verified_at for now

-- 8. INTERNAL EMPLOYEE SIGNALS: teamtailor emails in signals
SELECT 'Internal Employee Signals' as check_name,
       count(*) as issue_count
FROM clay_signals
WHERE email LIKE '%@teamtailor.com' OR email LIKE '%@teamtailor.se';

-- 9. AUDIENCE SOURCE DISTRIBUTION
SELECT audience_source, count(*) as account_count
FROM audience_seeds
GROUP BY audience_source
ORDER BY count(*) DESC;

-- 10. SIGNAL SOURCE DISTRIBUTION
SELECT signal_source, count(*) as signal_count
FROM clay_signals
GROUP BY signal_source
ORDER BY count(*) DESC;

-- ============================================
-- DETAILED VIEWS (uncomment as needed)
-- ============================================

-- List orphaned contacts with details:
-- SELECT ac.company_domain, ac.full_name, ac.audience_source
-- FROM audience_contacts ac
-- WHERE ac.company_domain NOT IN (SELECT company_domain FROM audience_seeds)
-- ORDER BY ac.audience_source, ac.company_domain;

-- List duplicate domains with their audiences:
-- SELECT company_domain, array_agg(DISTINCT audience_source) as audiences, count(*)
-- FROM audience_seeds
-- GROUP BY company_domain
-- HAVING count(DISTINCT audience_source) > 1
-- ORDER BY count(*) DESC;

-- List mismatched signal audience tags:
-- SELECT cs.company_domain, cs.audience_source as signal_audience,
--        (SELECT string_agg(DISTINCT a.audience_source, ', ') FROM audience_seeds a WHERE a.company_domain = cs.company_domain) as actual_audiences
-- FROM clay_signals cs
-- WHERE cs.audience_source != 'inbound'
--   AND NOT EXISTS (SELECT 1 FROM audience_seeds a WHERE a.company_domain = cs.company_domain AND a.audience_source = cs.audience_source)
-- GROUP BY cs.company_domain, cs.audience_source
-- ORDER BY cs.company_domain;
