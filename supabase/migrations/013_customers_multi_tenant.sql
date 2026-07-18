-- Migration: 013_customers_multi_tenant.sql
-- Description: Create customers table and enforce RLS for Multi-Tenant architecture

CREATE TABLE IF NOT EXISTS public.customers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  account_name text NOT NULL,
  website text,
  career_site text,
  phase text,
  last_active timestamp with time zone,
  linkedin_url text,
  segment text,
  employee_range text,
  previous_ats text,
  billing_country text,
  billing_state text,
  region text,
  country_flag text,
  industry text,
  won_opportunities integer DEFAULT 0,
  nps_score integer,
  nps_classification text,
  nps_avg_score numeric,
  nps_responses integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policy for tenant isolation
CREATE POLICY "Tenant isolation for customers"
ON public.customers FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.super_admins WHERE email = auth.jwt()->>'email') OR
  workspace_id IN (SELECT workspace_id FROM public.workspace_users WHERE email = auth.jwt()->>'email') OR
  workspace_id IS NULL -- Global seed data is visible to all
);

-- Create index on workspace_id for fast filtering
CREATE INDEX IF NOT EXISTS idx_customers_workspace_id ON public.customers(workspace_id);
