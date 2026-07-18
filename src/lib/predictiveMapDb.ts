import { supabase } from './supabase';
import type { GeoFeature, GeoFeatureCollection } from './mapDb';

// Hardcoded coordinates for our Kodiak Roofing properties (Sacramento / Reno)
const MOCK_COORDS: Record<string, [number, number]> = {
  '1151 Galleria Blvd, Roseville, CA': [-121.2670, 38.7710], // Roseville Galleria
  '8000 Metro Air Pkwy, Sacramento, CA': [-121.5790, 38.6940], // Logistics Hub
  '2315 Stockton Blvd, Sacramento, CA': [-121.4550, 38.5540], // UC Davis Medical
  '4590 S Virginia St, Reno, NV': [-119.7910, 39.4790], // Reno Sparks Convention
  '1 Electric Ave, Sparks, NV': [-119.5390, 39.5390], // Tesla Gigafactory
};

export async function fetchRoofingMapData(): Promise<GeoFeatureCollection> {
  const { data: properties, error } = await supabase
    .from('roof_properties')
    .select(`
      *,
      roof_health_scores(health_score),
      roof_signals(signal_data)
    `);

  if (error || !properties) {
    console.error("Error fetching map properties:", error);
    return { type: 'FeatureCollection', features: [] };
  }

  const features: GeoFeature[] = [];

  for (const p of properties) {
    const score = p.roof_health_scores?.[0]?.health_score ?? 100;
    const signalData = p.roof_signals?.[0]?.signal_data;
    
    // Determine color
    let color = '#22c55e'; // Green
    let status = 'Clear';
    if (score < 50) {
      color = '#ef4444'; // Red
      status = 'At Risk';
    } else if (score < 75) {
      color = '#f59e0b'; // Yellow
      status = 'Watch';
    }

    const coords = MOCK_COORDS[p.address] || [-98.5795, 39.8283]; // Default to US center if unknown

    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: coords },
      properties: {
        id: p.id,
        property_name: p.property_name,
        address: p.address,
        square_footage: p.square_footage,
        score,
        status,
        color,
        notes: signalData?.notes || signalData?.description || 'Routine monitoring active.'
      }
    });
  }

  return { type: 'FeatureCollection', features };
}

// A mock storm swath GeoJSON to display over Dallas, TX
export const MOCK_HAIL_SWATH = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-96.88, 32.72],
          [-96.85, 32.88],
          [-96.72, 32.85],
          [-96.75, 32.70],
          [-96.88, 32.72]
        ]]
      },
      properties: {
        severity: 'severe',
        type: 'hail',
        description: 'Severe Wind & Rain Event - 65mph gusts'
      }
    }
  ]
};
