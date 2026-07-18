-- Phase 2: Create County Tax Parcels Table (The Ownership Layer)
CREATE TABLE IF NOT EXISTS public.county_tax_parcels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  county_name text NOT NULL,
  parcel_id text NOT NULL,
  legal_owner_name text, -- The LLC or Trust
  mailing_address text,
  site_address text,
  assessed_value numeric,
  parcel_polygon geometry(Polygon, 4326),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(county_name, parcel_id)
);

ALTER TABLE public.county_tax_parcels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for county_tax_parcels"
ON public.county_tax_parcels FOR ALL
USING (workspace_id IN (SELECT workspace_id FROM public.workspace_users WHERE email = auth.jwt()->>'email'));

CREATE INDEX idx_county_tax_parcels_workspace_id ON public.county_tax_parcels(workspace_id);
CREATE INDEX idx_county_tax_parcels_polygon ON public.county_tax_parcels USING GIST (parcel_polygon);


-- Phase 3: The Spatial Join (The Magic)
-- We create a database function to automatically find the legal owner of a building footprint

DROP FUNCTION IF EXISTS public.get_owner_from_footprint_by_id(uuid, uuid);
DROP FUNCTION IF EXISTS public.get_owner_from_footprint(geometry(Polygon, 4326), uuid);

CREATE OR REPLACE FUNCTION public.get_owner_from_footprint(footprint_geom geometry(Polygon, 4326), target_workspace_id uuid)
RETURNS TABLE (
  parcel_id text,
  legal_owner_name text,
  mailing_address text,
  intersection_area double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.parcel_id,
    t.legal_owner_name,
    t.mailing_address,
    ST_Area(ST_Intersection(t.parcel_polygon, footprint_geom)) as intersection_area
  FROM 
    public.county_tax_parcels t
  WHERE 
    t.workspace_id = target_workspace_id
    AND ST_Intersects(t.parcel_polygon, footprint_geom)
  ORDER BY 
    intersection_area DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Wrapper function to take a building ID instead of raw geometry
CREATE OR REPLACE FUNCTION public.get_owner_from_footprint_by_id(building_id uuid, target_workspace_id uuid)
RETURNS TABLE (
  parcel_id text,
  legal_owner_name text,
  mailing_address text,
  intersection_area double precision
) AS $$
DECLARE
  target_geom geometry(Polygon, 4326);
BEGIN
  -- Grab the footprint for the given building ID
  SELECT building_polygon INTO target_geom FROM public.roof_properties WHERE id = building_id AND workspace_id = target_workspace_id LIMIT 1;
  
  -- Return the joined result
  RETURN QUERY SELECT * FROM public.get_owner_from_footprint(target_geom, target_workspace_id);
END;
$$ LANGUAGE plpgsql;
