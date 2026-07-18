import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("==================================================");
  console.log("🌍 LIVE OVERPASS API INGESTION ENGINE 🌍");
  console.log("==================================================");

  // We will target a specific bounding box in downtown Dallas
  // [bbox: south, west, north, east]
  const query = `
    [out:json][timeout:25];
    (
      way["building"="commercial"](32.775, -96.805, 32.785, -96.795);
      way["building"="retail"](32.775, -96.805, 32.785, -96.795);
      way["building"="warehouse"](32.775, -96.805, 32.785, -96.795);
    );
    out geom;
  `;
  
  console.log("[1/3] Querying OpenStreetMap Live Overpass API for Commercial Buildings...");
  
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { 
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
      "User-Agent": "ServiceAlignment/1.0"
    },
    body: "data=" + encodeURIComponent(query)
  });
  
  if (!response.ok) {
    throw new Error(`Overpass API failed: ${response.status} ${await response.text()}`);
  }
  
  const data = await response.json();
  const ways = data.elements.filter((e: any) => e.type === 'way' && e.geometry);
  
  console.log(`[2/3] Retrieved ${ways.length} real commercial building geometries.`);
  
  if (ways.length === 0) {
    console.log("No buildings found in this bounding box. Try expanding it.");
    return;
  }
  
  const { data: workspaces } = await supabase.from('workspaces').select('id').limit(1);
  const workspaceId = workspaces[0].id;
  
  // Clear old mock data
  await supabase.from('roof_properties').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  let inserted = 0;
  for (const way of ways) {
    const coords = way.geometry.map((pt: any) => [pt.lon, pt.lat]);
    
    // Ensure polygon is closed
    if (coords[0][0] !== coords[coords.length-1][0] || coords[0][1] !== coords[coords.length-1][1]) {
      coords.push([...coords[0]]);
    }
    
    // Skip invalid polygons
    if (coords.length < 4) continue;
    
    const geojson = {
      type: "Polygon",
      coordinates: [coords]
    };
    
    const name = way.tags?.name || way.tags?.operator || `Commercial Building OSM-${way.id}`;
    
    const { error } = await supabase.from('roof_properties').insert({
      workspace_id: workspaceId,
      property_name: name,
      building_polygon: JSON.stringify(geojson),
      industry: way.tags?.building || "Commercial",
      square_footage: 20000 // mock size for demo
    });
    
    if (error) {
      console.error(`Failed to insert ${name}:`, error.message);
    } else {
      inserted++;
    }
  }
  
  console.log(`\n[3/3] ✅ Successfully inserted ${inserted} true commercial building footprints into Supabase!`);
}

run();
