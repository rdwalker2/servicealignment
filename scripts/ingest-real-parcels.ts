import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("==================================================");
  console.log("🏦 REAL PARCEL GENERATION ENGINE 🏦");
  console.log("==================================================");

  console.log("[1/3] Fetching real building footprints from Supabase...");
  
  const { data: workspaces } = await supabase.from('workspaces').select('id').limit(1);
  const workspaceId = workspaces[0].id;
  
  // Clear old mock parcels
  await supabase.from('county_tax_parcels').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  // We need to fetch the raw JSON of the polygons to compute bounding boxes
  // PostgREST returns it correctly if we cast or just fetch it
  const { data: roofs, error: roofErr } = await supabase
    .from('roof_properties')
    .select('id, property_name, building_polygon, coordinates');
    
  if (roofErr || !roofs) {
    console.error("Failed to fetch roofs:", roofErr);
    return;
  }
  
  console.log(`[2/3] Processing ${roofs.length} buildings into county tax parcels...`);
  
  let inserted = 0;
  for (const roof of roofs) {
    let geojson;
    if (typeof roof.building_polygon === 'string') {
      geojson = JSON.parse(roof.building_polygon);
    } else {
      geojson = roof.building_polygon;
    }
    
    if (!geojson || geojson.type !== 'Polygon') continue;
    
    // Compute Bounding Box
    const coords = geojson.coordinates[0];
    const lons = coords.map((c: any) => c[0]);
    const lats = coords.map((c: any) => c[1]);
    
    // Add a tiny buffer (approx 10-20 meters) around the building to represent the property line
    const buffer = 0.0002; 
    const minLon = Math.min(...lons) - buffer;
    const maxLon = Math.max(...lons) + buffer;
    const minLat = Math.min(...lats) - buffer;
    const maxLat = Math.max(...lats) + buffer;
    
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
    
    // Generate realistic mock owner info based on building name
    const ownerName = roof.property_name.toUpperCase() + " LLC";
    
    const { error } = await supabase.from('county_tax_parcels').insert({
      workspace_id: workspaceId,
      county_name: "Dallas County",
      parcel_id: `DCAD-${roof.id.substring(0, 8).toUpperCase()}`,
      legal_owner_name: ownerName,
      mailing_address: "123 CORPORATE BLVD, DALLAS, TX 75201",
      site_address: "DOWNTOWN DALLAS",
      assessed_value: Math.floor(Math.random() * 10000000) + 1000000,
      parcel_polygon: JSON.stringify(parcelGeojson)
    });
    
    if (error) {
      console.error(`Failed to insert parcel for ${roof.property_name}:`, error.message);
    } else {
      inserted++;
    }
  }
  
  console.log(`\n[3/3] ✅ Successfully generated ${inserted} realistic property lines surrounding the buildings!`);
}

run();
