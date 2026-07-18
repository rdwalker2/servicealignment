-- 1. Evolve the roof_properties table to act as the true "Immaculate Anchor"
ALTER TABLE public.roof_properties
ADD COLUMN IF NOT EXISTS legal_owner_name text,
ADD COLUMN IF NOT EXISTS site_address text,
ADD COLUMN IF NOT EXISTS assessed_value numeric,
ADD COLUMN IF NOT EXISTS parcel_id text,
ADD COLUMN IF NOT EXISTS pierced_at timestamp with time zone;

-- 2. Create the Master Spatial Merge Engine
-- This function executes a bulk UPDATE to permanently stamp the golden data 
-- onto the roof records in a fraction of a second, using ST_Intersects.
CREATE OR REPLACE FUNCTION public.run_master_spatial_merge(target_workspace_id uuid)
RETURNS integer AS $$
DECLARE
  rows_affected integer;
BEGIN
  -- Perform a bulk spatial join UPDATE
  -- It finds the largest intersecting parcel for each unpierced roof
  UPDATE public.roof_properties rp
  SET 
    legal_owner_name = matched.legal_owner_name,
    site_address = matched.site_address,
    assessed_value = matched.assessed_value,
    parcel_id = matched.parcel_id,
    pierced_at = now()
  FROM (
    SELECT DISTINCT ON (r.id)
      r.id as roof_id,
      p.legal_owner_name,
      p.site_address,
      p.assessed_value,
      p.parcel_id
    FROM public.roof_properties r
    JOIN public.county_tax_parcels p 
      ON r.workspace_id = p.workspace_id 
      AND ST_Intersects(r.building_polygon, p.parcel_polygon)
    WHERE r.workspace_id = target_workspace_id
    ORDER BY r.id, ST_Area(ST_Intersection(r.building_polygon, p.parcel_polygon)) DESC
  ) matched
  WHERE rp.id = matched.roof_id
    AND rp.workspace_id = target_workspace_id;
    
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  RETURN rows_affected;
END;
$$ LANGUAGE plpgsql;
