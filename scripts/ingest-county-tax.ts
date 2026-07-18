import * as dotenv from 'dotenv';
import { resolve, join } from 'path';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface RawCountyCSVRow {
  PARCEL_NUM: string;
  OWNER_NAME_1: string;
  OWNER_ADDR_1: string;
  OWNER_CITY: string;
  OWNER_STATE: string;
  OWNER_ZIP: string;
  SITUS_ADDR: string;
  TOTAL_VALUE: string;
}

async function runCountyTaxIngestion() {
  console.log("==================================================");
  console.log("🏦 COUNTY TAX ASSESSOR INGESTION ENGINE (LIVE) 🏦");
  console.log("==================================================");

  const csvPath = join(process.cwd(), 'scripts', 'dallas_tax_sample.csv');
  console.log(`[1/3] Reading raw CSV from ${csvPath}...`);
  
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  }) as RawCountyCSVRow[];

  console.log(`[2/3] Processing ${records.length} records from Dallas County CSV...`);
  
  // Fetch a valid workspace_id from the database
  const { data: workspaces } = await supabase.from('workspaces').select('id').limit(1);
  const MOCK_WORKSPACE_ID = workspaces && workspaces.length > 0 ? workspaces[0].id : null;

  if (!MOCK_WORKSPACE_ID) {
     console.error("❌ No workspaces found in the database. Cannot insert tax parcels.");
     return;
  }

  for (const row of records) {
    const fullMailingAddress = `${row.OWNER_ADDR_1}, ${row.OWNER_CITY}, ${row.OWNER_STATE} ${row.OWNER_ZIP}`;
    
    console.log(`\n📄 Standardizing Parcel: ${row.PARCEL_NUM}`);
    console.log(`   Legal Owner: ${row.OWNER_NAME_1}`);
    console.log(`   Mailing Addr: ${fullMailingAddress}`);
    console.log(`   Site Addr: ${row.SITUS_ADDR}`);
    console.log(`   Assessed Value: $${parseInt(row.TOTAL_VALUE).toLocaleString()}`);
    
    console.log(`   -> [LIVE] Inserting into Supabase county_tax_parcels...`);
    
    // Create a mock parcel polygon that encompasses the Overture building for the test
    let parcelPolygon = null;
    if (row.PARCEL_NUM === 'DCAD-001-A') {
      // Wraps around the Mock Dallas Retail Center at [-96.8, 32.8]
      parcelPolygon = '{"type":"Polygon","coordinates":[[[-96.81,32.79],[-96.81,32.82],[-96.78,32.82],[-96.78,32.79],[-96.81,32.79]]]}';
    } else {
      // Wraps around the Mock Dallas Warehouse at [-96.85, 32.75]
      parcelPolygon = '{"type":"Polygon","coordinates":[[[-96.86,32.74],[-96.86,32.77],[-96.83,32.77],[-96.83,32.74],[-96.86,32.74]]]}';
    }
    
    const { data, error } = await supabase
      .from('county_tax_parcels')
      .insert({
        workspace_id: MOCK_WORKSPACE_ID,
        county_name: 'Dallas County',
        parcel_id: row.PARCEL_NUM,
        legal_owner_name: row.OWNER_NAME_1,
        mailing_address: fullMailingAddress,
        site_address: row.SITUS_ADDR,
        assessed_value: parseInt(row.TOTAL_VALUE),
        parcel_polygon: parcelPolygon
      })
      .select();

    if (error) {
      if (error.code === '23505') {
         console.log(`   ⚠️ Already exists in database. Skipping.`);
      } else {
         console.error(`   ❌ Failed to insert:`, error.message);
      }
    } else {
      console.log(`   ✅ Inserted successfully with ID: ${data[0].id}`);
    }
  }

  console.log("\n==================================================");
  console.log("✅ INGESTION COMPLETE. Data mapped to Supabase.");
  console.log("==================================================");
}

runCountyTaxIngestion();
