import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("Replacing giant mock footprints with a realistic building outline...");
  
  // Real coordinates approximating a building in downtown Dallas (roughly 50m x 50m)
  const geojson = {
    type: "Polygon",
    coordinates: [[
      [-96.8050, 32.7800],
      [-96.8045, 32.7800],
      [-96.8045, 32.7795],
      [-96.8050, 32.7795],
      [-96.8050, 32.7800]
    ]]
  };
  
  const MOCK_WORKSPACE_ID = "11111111-1111-1111-1111-111111111111";
  
  // First, delete the old mock buildings
  await supabase.from('roof_properties').delete().in('property_name', ['Mock Dallas Retail Center', 'Mock Dallas Warehouse']);
  await supabase.from('county_tax_parcels').delete().in('parcel_id', ['DCAD-001-A', 'DCAD-002-B']);
  
  // Insert the realistic building into roof_properties
  const { data: roof, error: roofErr } = await supabase.from('roof_properties').insert({
    workspace_id: MOCK_WORKSPACE_ID,
    property_name: "Dallas Tower 1 (Realistic Mock)",
    building_polygon: JSON.stringify(geojson),
    industry: "Commercial",
    square_footage: 25000
  }).select();
  
  if (roofErr) {
    console.error("Roof insert error:", roofErr);
    return;
  }
  
  // Now create a tax parcel that is a bounding box slightly larger than the building
  const parcelGeojson = {
    type: "Polygon",
    coordinates: [[
      [-96.8052, 32.7802],
      [-96.8043, 32.7802],
      [-96.8043, 32.7793],
      [-96.8052, 32.7793],
      [-96.8052, 32.7802]
    ]]
  };
  
  const { data: parcel, error: parcelErr } = await supabase.from('county_tax_parcels').insert({
    workspace_id: MOCK_WORKSPACE_ID,
    county_name: "Dallas County",
    parcel_id: "DCAD-REAL-001",
    legal_owner_name: "DALLAS TOWER INVESTMENTS LLC",
    mailing_address: "123 MAIN ST, DALLAS, TX 75201",
    site_address: "500 DOWNTOWN AVE",
    assessed_value: 15000000,
    parcel_polygon: JSON.stringify(parcelGeojson)
  }).select();
  
  if (parcelErr) console.error("Parcel error:", parcelErr);
  else console.log("Inserted realistic mock successfully!");
}
run();
