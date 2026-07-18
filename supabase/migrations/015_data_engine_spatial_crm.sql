-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Alter roof_properties to include spatial data
ALTER TABLE public.roof_properties
ADD COLUMN IF NOT EXISTS coordinates geometry(Point, 4326),
ADD COLUMN IF NOT EXISTS building_polygon geometry(Polygon, 4326),
ADD COLUMN IF NOT EXISTS roof_type text;

-- Create an index for spatial queries on properties
CREATE INDEX IF NOT EXISTS idx_roof_properties_coordinates ON public.roof_properties USING GIST (coordinates);
CREATE INDEX IF NOT EXISTS idx_roof_properties_polygon ON public.roof_properties USING GIST (building_polygon);


-- 2. Create Management Companies Table
CREATE TABLE IF NOT EXISTS public.management_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  company_name text NOT NULL,
  hq_domain text,
  total_managed_sqft integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.management_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for management_companies"
ON public.management_companies FOR ALL
USING (workspace_id IN (SELECT workspace_id FROM public.workspace_users WHERE email = auth.jwt()->>'email'));

CREATE INDEX idx_management_companies_workspace_id ON public.management_companies(workspace_id);


-- 3. Create Contacts Table (Facility Managers / Decision Makers)
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  management_company_id uuid REFERENCES public.management_companies(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  job_title text,
  email text,
  mobile_phone text,
  linkedin_url text,
  verification_status boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for contacts"
ON public.contacts FOR ALL
USING (workspace_id IN (SELECT workspace_id FROM public.workspace_users WHERE email = auth.jwt()->>'email'));

CREATE INDEX idx_contacts_workspace_id ON public.contacts(workspace_id);
CREATE INDEX idx_contacts_company_id ON public.contacts(management_company_id);


-- 4. Create Property Managers Join Table
CREATE TABLE IF NOT EXISTS public.property_managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  property_id uuid NOT NULL REFERENCES public.roof_properties(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  management_company_id uuid NOT NULL REFERENCES public.management_companies(id) ON DELETE CASCADE,
  is_primary_contact boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(property_id, contact_id)
);

ALTER TABLE public.property_managers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for property_managers"
ON public.property_managers FOR ALL
USING (workspace_id IN (SELECT workspace_id FROM public.workspace_users WHERE email = auth.jwt()->>'email'));

CREATE INDEX idx_property_managers_property_id ON public.property_managers(property_id);
CREATE INDEX idx_property_managers_contact_id ON public.property_managers(contact_id);


-- 5. Create Geospatial Weather Events Table
CREATE TABLE IF NOT EXISTS public.geospatial_weather_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  event_type text NOT NULL, -- e.g., 'Hail', 'Wind'
  severity text, -- e.g., '2.0 inch hail'
  storm_polygon geometry(Polygon, 4326),
  date_of_loss timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.geospatial_weather_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for geospatial_weather_events"
ON public.geospatial_weather_events FOR ALL
USING (workspace_id IN (SELECT workspace_id FROM public.workspace_users WHERE email = auth.jwt()->>'email'));

CREATE INDEX idx_geospatial_weather_events_workspace_id ON public.geospatial_weather_events(workspace_id);
CREATE INDEX idx_geospatial_weather_events_polygon ON public.geospatial_weather_events USING GIST (storm_polygon);
