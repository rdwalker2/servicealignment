-- Migration: Add contact_persona column to clay_signals
-- Purpose: Enable persona-based scoring and buying committee tracking
-- Date: 2026-06-16
-- Replaces: contact_role (never deployed to prod)

-- Add contact_persona column
ALTER TABLE clay_signals 
ADD COLUMN IF NOT EXISTS contact_persona text;

-- Add CHECK constraint for valid personas
ALTER TABLE clay_signals 
ADD CONSTRAINT clay_signals_contact_persona_check 
CHECK (contact_persona IS NULL OR contact_persona IN (
  'exec_hr',        -- CHRO, VP HR, Chief People Officer
  'exec_business',  -- CEO, Founder, Owner (SMB)
  'head_of_ta',     -- Head/Director of TA, VP Talent Acquisition
  'hr_director',    -- HR Director, Head of People
  'ta_manager',     -- TA Manager, Recruiting Manager
  'hr_manager',     -- HR Manager, People Ops Manager
  'recruiter',      -- Recruiter, Senior Recruiter, Sourcer
  'hr_coordinator', -- HR Coordinator, HR Admin
  'it_security',    -- CTO, IT Director, HRIS Manager
  'finance_ops'     -- CFO, VP Finance, Procurement
));

-- Add index for persona-based queries
CREATE INDEX IF NOT EXISTS idx_clay_signals_contact_persona 
ON clay_signals (company_domain, contact_persona) 
WHERE contact_persona IS NOT NULL;

-- Commentary:
-- contact_persona is OPTIONAL. Existing data works without it.
-- Daniel tags the ACTUAL functional role (e.g., head_of_ta).
-- The portal auto-derives the buying committee role:
--   exec_hr → decision_maker
--   head_of_ta → champion
--   ta_manager → evaluator
--   recruiter → end_user
--   it_security → technical_buyer
--   finance_ops → economic_buyer
-- Contact scoring is weighted by persona tier:
--   exec_hr: +10, head_of_ta: +9, hr_director: +9, exec_business: +8
--   ta_manager: +6, hr_manager: +5, it_security: +4, finance_ops: +4
--   recruiter: +3, hr_coordinator: +2
