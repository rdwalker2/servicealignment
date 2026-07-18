-- ════════════════════════════════════════════════════════════
-- Migration 006: Territory Support for Lead Routing
-- ════════════════════════════════════════════════════════════
-- Adds territory field to rep_roster for geography-based routing.
-- Territory values: 'east', 'west', 'all', or NULL (accepts any).
-- Customize based on team structure.
-- ════════════════════════════════════════════════════════════

-- Add territory column
ALTER TABLE rep_roster ADD COLUMN IF NOT EXISTS territory TEXT;
COMMENT ON COLUMN rep_roster.territory IS 'Territory assignment: east, west, all, or NULL. Used for geography-based signal routing.';

-- Default all existing reps to 'all' (pure round-robin until territories are defined)
UPDATE rep_roster SET territory = 'all' WHERE territory IS NULL;

-- Add Reassignment_Id__c mapping field
-- Used to sync rep assignments back to Salesforce
ALTER TABLE rep_roster ADD COLUMN IF NOT EXISTS sf_reassignment_id TEXT;
COMMENT ON COLUMN rep_roster.sf_reassignment_id IS 'SFDC Reassignment_Id__c value for this rep — used for bidirectional ownership sync';
