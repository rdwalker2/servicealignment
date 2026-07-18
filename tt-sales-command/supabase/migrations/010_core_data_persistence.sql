-- ============================================================
-- 010_core_data_persistence.sql
-- Creates JSONB backed tables for Zustand and LocalStorage stores
-- Enables RLS so reps can only access their own data.
-- ============================================================

-- 1. Discovery Sessions
CREATE TABLE IF NOT EXISTS public.discovery_sessions (
  id text PRIMARY KEY,
  rep_id text,
  data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.discovery_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for authenticated users" ON public.discovery_sessions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON public.discovery_sessions FOR ALL USING (auth.role() = 'authenticated');

-- 2. Weekly Actuals
CREATE TABLE IF NOT EXISTS public.weekly_actuals (
  id text PRIMARY KEY,
  rep_id text NOT NULL,
  week_start text NOT NULL,
  data jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.weekly_actuals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for authenticated users" ON public.weekly_actuals FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON public.weekly_actuals FOR ALL USING (auth.role() = 'authenticated');

-- 3. Monthly Goals
CREATE TABLE IF NOT EXISTS public.monthly_goals (
  id text PRIMARY KEY,
  rep_id text NOT NULL,
  month_prefix text NOT NULL,
  data jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.monthly_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for authenticated users" ON public.monthly_goals FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON public.monthly_goals FOR ALL USING (auth.role() = 'authenticated');

-- 4. Historical Overrides
CREATE TABLE IF NOT EXISTS public.historical_overrides (
  id text PRIMARY KEY,
  rep_id text NOT NULL,
  month_prefix text NOT NULL,
  data jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.historical_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for authenticated users" ON public.historical_overrides FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON public.historical_overrides FOR ALL USING (auth.role() = 'authenticated');

-- 5. Cycle Plans
CREATE TABLE IF NOT EXISTS public.cycle_plans (
  id text PRIMARY KEY,
  rep_id text NOT NULL,
  cycle_id text NOT NULL,
  data jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.cycle_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for authenticated users" ON public.cycle_plans FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON public.cycle_plans FOR ALL USING (auth.role() = 'authenticated');

-- 6. SIP Strategies
CREATE TABLE IF NOT EXISTS public.sip_strategies (
  id text PRIMARY KEY,
  rep_id text NOT NULL,
  data jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.sip_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for authenticated users" ON public.sip_strategies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON public.sip_strategies FOR ALL USING (auth.role() = 'authenticated');
