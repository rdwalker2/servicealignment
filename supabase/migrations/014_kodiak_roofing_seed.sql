-- Seed Data: Kodiak Roofing Workspace & Mock Data
-- This script creates a realistic workspace for Kodiak Roofing, assigns a user, and populates the map with properties and weather signals.

-- 1. Create the Kodiak Roofing Workspace
INSERT INTO public.workspaces (id, name, domain, status)
VALUES ('11111111-1111-1111-1111-111111111111', 'Kodiak Roofing', 'kodiakroofing.com', 'active')
ON CONFLICT (id) DO NOTHING;

-- 2. Add Users to the Workspace
-- Adding Ryan as an admin of the Kodiak workspace so you can log in and see the data
INSERT INTO public.workspace_users (workspace_id, email, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'ryandeniswalker@gmail.com', 'admin'),
  ('11111111-1111-1111-1111-111111111111', 'david.mathisen@servicealignment.com', 'admin')
ON CONFLICT (workspace_id, email) DO NOTHING;

-- 3. Seed Commercial Properties in Kodiak's Territory (California / West Coast)
-- We'll use UUIDs for the properties to link them to signals later
INSERT INTO public.roof_properties (id, workspace_id, property_name, address, square_footage, industry)
VALUES
  -- Sacramento / Roseville Area
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Roseville Galleria', '1151 Galleria Blvd, Roseville, CA', 1300000, 'Retail'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Sacramento Logistics Hub', '8000 Metro Air Pkwy, Sacramento, CA', 850000, 'Industrial'),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'UC Davis Medical Center', '2315 Stockton Blvd, Sacramento, CA', 2100000, 'Healthcare'),
  -- Reno Area
  ('22222222-2222-2222-2222-222222222224', '11111111-1111-1111-1111-111111111111', 'Reno Sparks Convention Center', '4590 S Virginia St, Reno, NV', 500000, 'Hospitality'),
  ('22222222-2222-2222-2222-222222222225', '11111111-1111-1111-1111-111111111111', 'Tesla Gigafactory Nevada', '1 Electric Ave, Sparks, NV', 5400000, 'Manufacturing')
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Roof Health Scores for those properties
INSERT INTO public.roof_health_scores (property_id, health_score, score_factors)
VALUES
  ('22222222-2222-2222-2222-222222222221', 42, '[{"factor": "Age", "impact": -30}, {"factor": "Recent Wind Event", "impact": -28}]'::jsonb),
  ('22222222-2222-2222-2222-222222222222', 88, '[{"factor": "New Installation", "impact": 0}]'::jsonb),
  ('22222222-2222-2222-2222-222222222223', 65, '[{"factor": "Maintenance Overdue", "impact": -15}]'::jsonb),
  ('22222222-2222-2222-2222-222222222224', 38, '[{"factor": "Hail Damage", "impact": -45}, {"factor": "Ponding Water", "impact": -17}]'::jsonb),
  ('22222222-2222-2222-2222-222222222225', 95, '[{"factor": "Routine Inspection Passed", "impact": 0}]'::jsonb)
ON CONFLICT DO NOTHING;

-- 5. Seed Real-time Signals (The "Trigger" events)
INSERT INTO public.roof_signals (property_id, signal_type, signal_data)
VALUES
  ('22222222-2222-2222-2222-222222222221', 'Severe Wind', '{"speed_mph": 65, "duration_mins": 45, "notes": "High wind warning threshold exceeded"}'::jsonb),
  ('22222222-2222-2222-2222-222222222224', 'Hail', '{"hail_size_inches": 1.75, "probability": 0.98, "notes": "Golf ball sized hail detected on radar"}'::jsonb)
ON CONFLICT DO NOTHING;

-- 6. Add some mock Discovery Sessions in the Pipeline for Kodiak
INSERT INTO public.discovery_sessions (workspace_id, company_name, deal_stage, data)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Roseville Galleria Property Management', 'demonstrate', '{"deal_value": 450000, "next_steps_who": "Sarah (Facilities Dir)", "next_steps_what": "Review proposal for TPO overlay"}'::jsonb),
  ('11111111-1111-1111-1111-111111111111', 'Reno Sparks Convention Center', 'diagnosis', '{"deal_value": 1200000, "next_steps_who": "City of Reno Procurement", "next_steps_what": "On-site core sampling scheduled"}'::jsonb)
ON CONFLICT DO NOTHING;
