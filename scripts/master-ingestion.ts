import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("==================================================");
  console.log("🚀 MASTER SPATIAL DATA INGESTION PIPELINE 🚀");
  console.log("==================================================");

  // 1. Ingest Raw OpenStreetMap Buildings
  console.log("\n[1/4] Triggering Overpass API Fetch...");
  execSync('npx tsx scripts/ingest-real-buildings.ts', { stdio: 'inherit' });

  // 2. Ingest County Tax Parcels (Mocking exact bounding boxes)
  console.log("\n[2/4] Triggering Realistic Parcel Generation...");
  execSync('npx tsx scripts/ingest-real-parcels.ts', { stdio: 'inherit' });

  // 3. Trigger Master Spatial Merge Engine
  console.log("\n[3/4] Triggering Master Spatial Merge Engine...");
  console.log("      (Running background ST_Intersects over entire DB...)");
  
  const { data: workspaces } = await supabase.from('workspaces').select('id').limit(1);
  if (!workspaces || workspaces.length === 0) {
     console.error("No workspaces found.");
     return;
  }
  const workspaceId = workspaces[0].id;
  
  const { data, error } = await supabase.rpc('run_master_spatial_merge', {
    target_workspace_id: workspaceId
  });
  
  if (error) {
    console.error("❌ Master Spatial Merge Failed:", error.message);
    console.log("   (Did you remember to run 017_immaculate_anchor.sql in Supabase?)");
  } else {
    console.log(`\n[4/4] ✅ IMMACULATE ANCHOR CREATED!`);
    console.log(`      Successfully pierced and permanently enriched ${data} golden roof records.`);
  }
}

run();
