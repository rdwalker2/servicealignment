-- Migration: Add July pilot fields to clay_signals
-- Based on Daniel meeting decisions (June 16, 2026)
-- 
-- New fields:
--   audience_source      - Campaign/audience tag (existed in TS but missing from DB)
--   market              - US/CA/EU market separation
--   market              - US/CA/EU market separation
--   firmographic_tier    - Daniel's Tier 1/2/3 ICP scoring (from pipeline + finance data)
--   pages_visited_count  - RB2B web intent: number of pages visited
--   session_duration_seconds - RB2B web intent: time on site
--   visited_pricing      - RB2B web intent: hit the pricing page
--   utm_source           - Salesloft attribution
--   utm_campaign         - Campaign attribution
--   utm_medium           - Channel attribution
--   utm_content          - Cadence-level attribution
--   is_existing_customer - Suppression flag for existing customers
--   account_owner_email  - Rep assignment for routing

-- ── Audience Source (backfill — exists in TypeScript but missing from DB) ──
ALTER TABLE clay_signals ADD COLUMN IF NOT EXISTS audience_source text;
COMMENT ON COLUMN clay_signals.audience_source IS 'Campaign/audience tag: rippling, adp, k12, etc.';

-- ── Market / Region ──
ALTER TABLE clay_signals ADD COLUMN IF NOT EXISTS market text;
COMMENT ON COLUMN clay_signals.market IS 'Market region: us, ca, eu, etc.';

-- ── Firmographic ICP Tier ──
ALTER TABLE clay_signals ADD COLUMN IF NOT EXISTS firmographic_tier text;
COMMENT ON COLUMN clay_signals.firmographic_tier IS 'ICP tier from pipeline + finance data: tier_1, tier_2, tier_3';

-- ── RB2B Web Intent Fields ──
ALTER TABLE clay_signals ADD COLUMN IF NOT EXISTS pages_visited_count integer;
COMMENT ON COLUMN clay_signals.pages_visited_count IS 'Number of pages visited in the web session (RB2B)';

ALTER TABLE clay_signals ADD COLUMN IF NOT EXISTS session_duration_seconds integer;
COMMENT ON COLUMN clay_signals.session_duration_seconds IS 'Time on site in seconds (RB2B)';

ALTER TABLE clay_signals ADD COLUMN IF NOT EXISTS visited_pricing boolean DEFAULT false;
COMMENT ON COLUMN clay_signals.visited_pricing IS 'Whether the visitor hit the pricing page (RB2B)';

-- ── UTM Attribution ──
ALTER TABLE clay_signals ADD COLUMN IF NOT EXISTS utm_source text;
ALTER TABLE clay_signals ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE clay_signals ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE clay_signals ADD COLUMN IF NOT EXISTS utm_content text;
COMMENT ON COLUMN clay_signals.utm_source IS 'UTM source from Salesloft cadence URL';
COMMENT ON COLUMN clay_signals.utm_campaign IS 'UTM campaign tag';
COMMENT ON COLUMN clay_signals.utm_medium IS 'UTM medium (email, social, etc.)';
COMMENT ON COLUMN clay_signals.utm_content IS 'UTM content for cadence-level attribution';

-- ── Suppression / Routing ──
ALTER TABLE clay_signals ADD COLUMN IF NOT EXISTS is_existing_customer boolean DEFAULT false;
COMMENT ON COLUMN clay_signals.is_existing_customer IS 'Flag to suppress existing customers from prospecting';

ALTER TABLE clay_signals ADD COLUMN IF NOT EXISTS account_owner_email text;
COMMENT ON COLUMN clay_signals.account_owner_email IS 'Assigned rep email for routing (from SF account ownership)';
