-- ============================================================
-- Salesforce Sync Schema
-- Stores OAuth credentials and tracks all sync operations
-- ============================================================

-- Store Salesforce OAuth credentials securely
CREATE TABLE IF NOT EXISTS sf_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  instance_url TEXT NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  issued_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  integration_user TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Track every sync operation for audit + debugging
CREATE TABLE IF NOT EXISTS sf_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  operation TEXT NOT NULL,
  sfdc_object TEXT,
  sfdc_id TEXT,
  supabase_domain TEXT,
  supabase_email TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'skipped')),
  error_message TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add salesforce columns to clay_signals if not already present
ALTER TABLE clay_signals ADD COLUMN IF NOT EXISTS salesforce_account_id TEXT;
ALTER TABLE clay_signals ADD COLUMN IF NOT EXISTS salesforce_contact_id TEXT;
ALTER TABLE clay_signals ADD COLUMN IF NOT EXISTS salesforce_owner_id TEXT;
ALTER TABLE clay_signals ADD COLUMN IF NOT EXISTS sf_sync_status TEXT DEFAULT 'pending'
  CHECK (sf_sync_status IN ('pending', 'synced', 'not_in_sfdc', 'created', 'error'));
ALTER TABLE clay_signals ADD COLUMN IF NOT EXISTS sf_last_synced_at TIMESTAMPTZ;

-- Index for fast gap detection queries
CREATE INDEX IF NOT EXISTS idx_clay_signals_sf_sync_status
  ON clay_signals (sf_sync_status);
CREATE INDEX IF NOT EXISTS idx_clay_signals_sf_account_id
  ON clay_signals (salesforce_account_id);

-- Enable RLS but allow service role full access
ALTER TABLE sf_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE sf_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to sf_credentials"
  ON sf_credentials FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to sf_sync_log"
  ON sf_sync_log FOR ALL
  USING (auth.role() = 'service_role');
