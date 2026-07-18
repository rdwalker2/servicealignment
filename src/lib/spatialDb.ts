import { supabase } from './supabase';

export interface GeoFeature {
  type: 'Feature';
  geometry: {
    type: 'Point' | 'Polygon' | 'MultiPolygon';
    coordinates: any;
  };
  properties: Record<string, any>;
}

export interface GeoFeatureCollection {
  type: 'FeatureCollection';
  features: GeoFeature[];
}

/**
 * Fetch Overture Maps Commercial Building Footprints from the Live Database
 */
export async function fetchLiveFootprints(): Promise<GeoFeatureCollection> {
  const { data, error } = await supabase
    .from('roof_properties')
    .select('id, property_name, workspace_id, building_polygon, coordinates, legal_owner_name, site_address, assessed_value, parcel_id')
    .not('building_polygon', 'is', null);

  if (error) {
    console.error('Error fetching live footprints:', error);
    return { type: 'FeatureCollection', features: [] };
  }

  const features: GeoFeature[] = data.map((row) => {
    // Supabase PostgREST returns geometries as GeoJSON objects automatically
    const geometry = row.building_polygon || row.coordinates;
    
    return {
      type: 'Feature',
      geometry,
      properties: {
        id: row.id,
        property_name: row.property_name,
        workspace_id: row.workspace_id,
        legal_owner_name: row.legal_owner_name,
        site_address: row.site_address,
        assessed_value: row.assessed_value,
        parcel_id: row.parcel_id,
        type: 'roof-footprint',
      }
    };
  });

  return { type: 'FeatureCollection', features };
}

/**
 * Fetch County Tax Assessor Parcels from the Live Database
 */
export async function fetchLiveTaxParcels(): Promise<GeoFeatureCollection> {
  const { data, error } = await supabase
    .from('county_tax_parcels')
    .select('id, parcel_id, legal_owner_name, mailing_address, assessed_value, parcel_polygon')
    .not('parcel_polygon', 'is', null);

  if (error) {
    console.error('Error fetching live tax parcels:', error);
    return { type: 'FeatureCollection', features: [] };
  }

  const features: GeoFeature[] = data.map((row) => {
    return {
      type: 'Feature',
      geometry: row.parcel_polygon,
      properties: {
        id: row.id,
        parcel_id: row.parcel_id,
        legal_owner_name: row.legal_owner_name,
        mailing_address: row.mailing_address,
        assessed_value: row.assessed_value,
        type: 'tax-parcel',
      }
    };
  });

  return { type: 'FeatureCollection', features };
}
