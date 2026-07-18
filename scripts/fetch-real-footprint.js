import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("Fetching a REAL building outline from OpenStreetMap / Overpass API...");
  
  // A query to grab a real large building in Dallas (e.g. American Airlines Center or similar)
  const overpassQuery = `
    [out:json];
    way(32490562); /* American Airlines Center */
    out geom;
  `;
  
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: overpassQuery
  });
  
  const data = await res.json();
  const way = data.elements[0];
  
  // Convert OSM geometry to GeoJSON coordinates
  const coords = way.geometry.map(point => [point.lon, point.lat]);
  // Ensure the polygon is closed
  if (coords[0][0] !== coords[coords.length-1][0] || coords[0][1] !== coords[coords.length-1][1]) {
    coords.push([...coords[0]]);
  }
  
  const geojson = {
    type: "Polygon",
    coordinates: [coords]
  };
  
  console.log("Real geometry grabbed! Vertices:", coords.length);
  
  // Find a workspace
  const { data: workspaces } = await supabase.from('workspaces').select('id').limit(1);
  const MOCK_WORKSPACE_ID = workspaces[0].id;
  
  // Insert the real building into roof_properties
  const { data: roof, error: roofErr } = await supabase.from('roof_properties').insert({
    workspace_id: MOCK_WORKSPACE_ID,
    property_name: "American Airlines Center (REAL)",
    building_polygon: JSON.stringify(geojson),
    industry: "Commercial",
    square_footage: 840000
  }).select();
  
  if (roofErr) {
    console.error("Roof insert error:", roofErr);
    return;
  }
  
  console.log("Inserted real roof:", roof[0].id);
  
  // Now create a tax parcel that is a bounding box slightly larger than the building
  const lons = coords.map(c => c[0]);
  const lats = coords.map(c => c[1]);
  const minLon = Math.min(...lons) - 0.001;
  const maxLon = Math.max(...lons) + 0.001;
  const minLat = Math.min(...lats) - 0.001;
  const maxLat = Math.max(...lats) + 0.001;
  
  const parcelGeojson = {
    type: "Polygon",
    coordinates: [[
      [minLon, minLat],
      [minLon, maxLat],
      [maxLon, maxLat],
      [maxLon, minLat],
      [minLon, minLat]
    ]]
  };
  
  const { data: parcel, error: parcelErr } = await supabase.from('county_tax_parcels').insert({
    workspace_id: MOCK_WORKSPACE_ID,
    county_name: "Dallas County",
    parcel_id: "DCAD-AAC-001",
    legal_owner_name: "CENTER OPERATING CO LP",
    mailing_address: "2500 VICTORY AVE, DALLAS, TX 75219",
    site_address: "2500 VICTORY AVE",
    assessed_value: 350000000,
    parcel_polygon: JSON.stringify(parcelGeojson)
  }).select();
  
  if (parcelErr) console.error("Parcel error:", parcelErr);
  else console.log("Inserted real tax parcel:", parcel[0].id);
}
run();
