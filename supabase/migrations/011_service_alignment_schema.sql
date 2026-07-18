-- Migration: 011_service_alignment_schema.sql
-- Description: Core schema for Service Alignment's predictive marketing engine

-- 1. Roof Properties
CREATE TABLE IF NOT EXISTS public.roof_properties (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_name text NOT NULL,
  address text,
  square_footage integer,
  industry text,
  property_manager_id uuid, -- Reference to a CRM/Account ID if applicable
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Roof Signals (24/7 Monitoring Data)
CREATE TABLE IF NOT EXISTS public.roof_signals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.roof_properties(id) ON DELETE CASCADE,
  signal_type text NOT NULL, -- 'weather', 'satellite', 'permit', etc.
  signal_data jsonb NOT NULL DEFAULT '{}'::jsonb, -- Store dynamic data (e.g., hail size, wind speed, permit details)
  detected_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Roof Health Score History
CREATE TABLE IF NOT EXISTS public.roof_health_scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.roof_properties(id) ON DELETE CASCADE,
  health_score integer NOT NULL, -- e.g. 0-100 scale
  score_factors jsonb NOT NULL DEFAULT '[]'::jsonb, -- Array of factors that contributed to the score
  calculated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Campaign Outreach (The "Infusionsoft" piece)
CREATE TABLE IF NOT EXISTS public.campaign_outreach (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.roof_properties(id) ON DELETE CASCADE,
  campaign_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'opened', 'clicked', 'bounced'
  prospect_room_token text, -- The token used to access the personalized landing page
  sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. RLS Policies (Basic setup)
ALTER TABLE public.roof_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roof_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roof_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_outreach ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users for now
CREATE POLICY "Enable read access for all authenticated users" ON public.roof_properties FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON public.roof_signals FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON public.roof_health_scores FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all authenticated users" ON public.campaign_outreach FOR SELECT USING (auth.role() = 'authenticated');

-- Indexes for performance
CREATE INDEX idx_roof_signals_property_id ON public.roof_signals(property_id);
CREATE INDEX idx_roof_health_scores_property_id ON public.roof_health_scores(property_id);
CREATE INDEX idx_campaign_outreach_property_id ON public.campaign_outreach(property_id);
CREATE INDEX idx_campaign_outreach_token ON public.campaign_outreach(prospect_room_token);
