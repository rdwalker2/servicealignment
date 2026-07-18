-- Migration: 012_multi_tenant_schema.sql
-- Description: Multi-Tenant schema (Workspaces, Users, RLS enforcement)

-- 1. Super Admins (Global Service Alignment Admins)
CREATE TABLE IF NOT EXISTS public.super_admins (
  email text PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.super_admins (email) VALUES 
  ('ryandeniswalker@gmail.com'),
  ('david.mathisen@servicealignment.com'),
  ('daniel.mathisen@servicealignment.com')
ON CONFLICT DO NOTHING;

-- 2. Workspaces (Tenants)
CREATE TABLE IF NOT EXISTS public.workspaces (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  domain text,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Workspace Users (Mapping emails to workspaces + roles)
CREATE TABLE IF NOT EXISTS public.workspace_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'rep', -- 'admin', 'rep'
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(workspace_id, email)
);

-- =========================================================================
-- Recreate core tables with workspace_id to enforce multi-tenancy
-- =========================================================================

-- We drop the existing tables to start fresh.
DROP TABLE IF EXISTS public.campaign_outreach CASCADE;
DROP TABLE IF EXISTS public.roof_health_scores CASCADE;
DROP TABLE IF EXISTS public.roof_signals CASCADE;
DROP TABLE IF EXISTS public.roof_properties CASCADE;
DROP TABLE IF EXISTS public.clay_signals CASCADE;
DROP TABLE IF EXISTS public.discovery_sessions CASCADE;

-- Discovery Sessions
CREATE TABLE public.discovery_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  deal_stage text DEFAULT 'qualifying',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- Clay Signals (Prospecting Signals)
CREATE TABLE public.clay_signals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  contact_name text,
  contact_email text,
  signal_type text,
  signal_score integer DEFAULT 0,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Roof Properties
CREATE TABLE public.roof_properties (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  property_name text NOT NULL,
  address text,
  square_footage integer,
  industry text,
  property_manager_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Roof Signals (24/7 Monitoring Data)
CREATE TABLE public.roof_signals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.roof_properties(id) ON DELETE CASCADE,
  signal_type text NOT NULL,
  signal_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  detected_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Roof Health Score History
CREATE TABLE public.roof_health_scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.roof_properties(id) ON DELETE CASCADE,
  health_score integer NOT NULL,
  score_factors jsonb NOT NULL DEFAULT '[]'::jsonb,
  calculated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Campaign Outreach
CREATE TABLE public.campaign_outreach (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.roof_properties(id) ON DELETE CASCADE,
  campaign_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  prospect_room_token text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- Security & RLS Policies
-- =========================================================================

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clay_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roof_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roof_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roof_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_outreach ENABLE ROW LEVEL SECURITY;

-- Super Admins can see everything
CREATE POLICY "Super Admins can see all workspaces" 
ON public.workspaces FOR ALL 
USING (EXISTS (SELECT 1 FROM public.super_admins WHERE email = auth.jwt()->>'email'));

-- Workspace Users can see their own workspace
CREATE POLICY "Users can see their own workspace" 
ON public.workspaces FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.workspace_users WHERE workspace_id = id AND email = auth.jwt()->>'email'));

-- Workspace Users can see their own workspace users
CREATE POLICY "Users can see workspace users in their workspace" 
ON public.workspace_users FOR SELECT 
USING (workspace_id IN (SELECT workspace_id FROM public.workspace_users WHERE email = auth.jwt()->>'email'));

-- Data Tables RLS (Super admins can see all, workspace users see their workspace)
CREATE POLICY "Tenant isolation for discovery_sessions"
ON public.discovery_sessions FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.super_admins WHERE email = auth.jwt()->>'email') OR
  workspace_id IN (SELECT workspace_id FROM public.workspace_users WHERE email = auth.jwt()->>'email')
);

CREATE POLICY "Tenant isolation for clay_signals"
ON public.clay_signals FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.super_admins WHERE email = auth.jwt()->>'email') OR
  workspace_id IN (SELECT workspace_id FROM public.workspace_users WHERE email = auth.jwt()->>'email')
);

CREATE POLICY "Tenant isolation for roof_properties"
ON public.roof_properties FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.super_admins WHERE email = auth.jwt()->>'email') OR
  workspace_id IN (SELECT workspace_id FROM public.workspace_users WHERE email = auth.jwt()->>'email')
);

-- Cascading policies for child tables
CREATE POLICY "Tenant isolation for roof_signals"
ON public.roof_signals FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.super_admins WHERE email = auth.jwt()->>'email') OR
  property_id IN (SELECT id FROM public.roof_properties WHERE workspace_id IN (SELECT workspace_id FROM public.workspace_users WHERE email = auth.jwt()->>'email'))
);

CREATE POLICY "Tenant isolation for roof_health_scores"
ON public.roof_health_scores FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.super_admins WHERE email = auth.jwt()->>'email') OR
  property_id IN (SELECT id FROM public.roof_properties WHERE workspace_id IN (SELECT workspace_id FROM public.workspace_users WHERE email = auth.jwt()->>'email'))
);

CREATE POLICY "Tenant isolation for campaign_outreach"
ON public.campaign_outreach FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.super_admins WHERE email = auth.jwt()->>'email') OR
  property_id IN (SELECT id FROM public.roof_properties WHERE workspace_id IN (SELECT workspace_id FROM public.workspace_users WHERE email = auth.jwt()->>'email'))
);

-- Indexes for performance
CREATE INDEX idx_workspace_users_email ON public.workspace_users(email);
CREATE INDEX idx_discovery_sessions_workspace_id ON public.discovery_sessions(workspace_id);
CREATE INDEX idx_clay_signals_workspace_id ON public.clay_signals(workspace_id);
CREATE INDEX idx_roof_properties_workspace_id ON public.roof_properties(workspace_id);
