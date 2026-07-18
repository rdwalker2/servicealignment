import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: ['.env.local', '.env'] });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// DFW Area bounding box approx
// Lat: 32.6 to 33.0
// Lon: -97.4 to -96.5

const streetNames = ['Stemmons Fwy', 'Industrial Blvd', 'Trinity Blvd', 'Regal Row', 'Mockingbird Ln', 'Royal Ln', 'Harry Hines Blvd', 'Lamar St', 'Commerce St', 'Main St', 'Belt Line Rd', 'Airport Fwy', 'Centerville Rd', 'Shiloh Rd', 'Jupiter Rd', 'Pioneer Pkwy', 'Division St', 'Collins St'];
const cities = ['Dallas', 'Fort Worth', 'Arlington', 'Irving', 'Grand Prairie', 'Garland', 'Mesquite', 'Plano', 'Richardson', 'Carrollton'];

function generateRandomProperty(workspaceId: string) {
  const lat = 32.6 + (Math.random() * 0.4);
  const lon = -97.4 + (Math.random() * 0.9);
  
  const streetNum = Math.floor(Math.random() * 9999) + 100;
  const street = streetNames[Math.floor(Math.random() * streetNames.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const zip = 75000 + Math.floor(Math.random() * 200);
  
  const address = `${streetNum} ${street}, ${city}, TX ${zip}`;
  
  // Size bias towards mid-size, some massive
  const isMassive = Math.random() > 0.9;
  const sqft = isMassive ? Math.floor(Math.random() * 800000) + 200000 : Math.floor(Math.random() * 180000) + 20000;
  
  // Tax owner shell
  const taxId = Math.floor(Math.random() * 900000000) + 100000000;
  const shellOwner = `COMMERCIAL BUILDING OSM-${taxId} LLC`;
  
  // Assessed Value (approx $50-$150 per sqft)
  const valPerSqft = 50 + (Math.random() * 100);
  const value = Math.floor(sqft * valPerSqft);

  // GeoJSON Polygon (very basic square around the point)
  const offset = 0.001 * (sqft / 100000); 
  const geojson = {
    type: "Polygon",
    coordinates: [[
      [lon - offset, lat - offset],
      [lon + offset, lat - offset],
      [lon + offset, lat + offset],
      [lon - offset, lat + offset],
      [lon - offset, lat - offset]
    ]]
  };

  return {
    workspace_id: workspaceId,
    property_name: `${city} Industrial Center - Bldg ${Math.floor(Math.random() * 100)}`,
    address: address,
    square_footage: sqft,
    industry: 'Commercial/Industrial'
  };
}

async function ingestGeospatialData() {
  console.log('\n===========================================================');
  console.log(' PREDICTIVE ENGINE: DETERMINISTIC GEOSPATIAL INGESTION');
  console.log('===========================================================\n');

  // Ensure workspace exists
  const { data: workspaces } = await supabase.from('workspaces').select('id').limit(1);
  const workspaceId = workspaces && workspaces.length > 0 ? workspaces[0].id : '00000000-0000-0000-0000-000000000000';

  const TARGET_PROPERTIES = 1000;
  const BATCH_SIZE = 50;
  let successCount = 0;

  console.log(`🚀 Simulating ingestion of ${TARGET_PROPERTIES} commercial parcels in DFW...`);

  for (let i = 0; i < TARGET_PROPERTIES; i += BATCH_SIZE) {
    const batchSize = Math.min(BATCH_SIZE, TARGET_PROPERTIES - i);
    const properties = [];

    for (let j = 0; j < batchSize; j++) {
      properties.push(generateRandomProperty(workspaceId));
    }

    // Insert Properties
    const { data: insertedRoofs, error: roofErr } = await supabase
      .from('roof_properties')
      .insert(properties)
      .select('id');

    if (roofErr) {
      console.error(`❌ Batch failed: ${roofErr.message}`);
      continue;
    }

    if (insertedRoofs) {
      // Generate baseline health scores for the batch
      const scores = insertedRoofs.map(roof => ({
        property_id: roof.id,
        health_score: Math.floor(Math.random() * 40) + 60, // 60-100 baseline
        score_factors: { baseline: 'Deterministic Data Load', source: 'Regrid/Overture Simulation' }
      }));

      const { error: scoreErr } = await supabase
        .from('roof_health_scores')
        .insert(scores);

      if (scoreErr) {
        console.error(`❌ Health Score insertion failed: ${scoreErr.message}`);
      } else {
        successCount += insertedRoofs.length;
        process.stdout.write(`\r✅ Ingested ${successCount} / ${TARGET_PROPERTIES} properties...`);
      }
    }
  }

  console.log('\n\n✅ Geospatial Ingestion Complete.');
  console.log(`Database flooded with ${successCount} raw, unmanaged properties ready for resolution.`);
}

ingestGeospatialData();
