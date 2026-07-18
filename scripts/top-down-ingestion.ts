import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Small delay to respect Nominatim rate limits (1 request per second)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function geocodeAddress(address: string): Promise<{ lat: number, lon: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'ServiceAlignment/1.0' }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    }
  } catch (err) {
    console.error(`Geocoding error for ${address}:`, err);
  }
  return null;
}

async function getBuildingFootprint(lat: number, lon: number): Promise<any | null> {
  try {
    // Search for buildings within 50 meters of the geocoded point
    const query = `
      [out:json][timeout:25];
      way["building"](around:50, ${lat}, ${lon});
      out geom;
    `;
    
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        "User-Agent": "ServiceAlignment/1.0"
      },
      body: "data=" + encodeURIComponent(query)
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const ways = data.elements.filter((e: any) => e.type === 'way' && e.geometry);
    
    if (ways.length > 0) {
      // Just take the first building found near the point
      const way = ways[0];
      const coords = way.geometry.map((pt: any) => [pt.lon, pt.lat]);
      
      // Ensure polygon is closed
      if (coords[0][0] !== coords[coords.length-1][0] || coords[0][1] !== coords[coords.length-1][1]) {
        coords.push([...coords[0]]);
      }
      
      if (coords.length >= 4) {
        return {
          type: "Polygon",
          coordinates: [coords]
        };
      }
    }
  } catch (err) {
    console.error(`Overpass API error at ${lat},${lon}:`, err);
  }
  return null;
}

async function run() {
  console.log("==================================================");
  console.log("🏙️  TOP-DOWN PORTFOLIO INGESTION ENGINE 🏙️");
  console.log("==================================================");

  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("❌ Please provide a CSV file path. Example: npx tsx scripts/top-down-ingestion.ts data/test_portfolio.csv");
    process.exit(1);
  }

  const absolutePath = path.resolve(process.cwd(), csvPath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ File not found: ${absolutePath}`);
    process.exit(1);
  }

  const { data: workspaces } = await supabase.from('workspaces').select('id').limit(1);
  if (!workspaces || workspaces.length === 0) {
     console.error("No workspaces found.");
     return;
  }
  const workspaceId = workspaces[0].id;

  console.log(`\n[1/4] Reading CSV: ${csvPath}`);
  const csvData = fs.readFileSync(absolutePath, 'utf-8');
  // Parse CSV with papaparse
  const results = Papa.parse(csvData, { header: true, skipEmptyLines: true });
  
  const properties = results.data.map((row: any, i: number) => ({
    propertyName: row['Property Name'] || `Property ${i}`,
    address: row['Address'] || '',
    manager: row['Management Company'] || row['Owner'] || 'Unknown',
    taxOwner: row['Tax Owner'] || '',
    sqft: parseInt(row['Square Footage'] || '0')
  }));

  console.log(`[2/4] Found ${properties.length} properties. Starting geocoding & footprint extraction...`);
  
  let inserted = 0;
  let failed = 0;

  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    console.log(`\n👉 Processing [${i+1}/${properties.length}]: ${prop.propertyName} (${prop.address})`);
    
    if (!prop.address) {
      console.log(`   ❌ Skipped: No address provided.`);
      failed++;
      continue;
    }

    // 1. Geocode
    console.log(`   🔍 Geocoding...`);
    const coords = await geocodeAddress(prop.address);
    await delay(1100); // Wait 1.1s to respect Nominatim rate limit
    
    if (!coords) {
      console.log(`   ❌ Failed to geocode address.`);
      failed++;
      continue;
    }
    
    console.log(`   📍 Found Coordinates: ${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`);
    
    // 2. Extract Footprint
    console.log(`   🏗️  Extracting true architectural footprint...`);
    const polygon = await getBuildingFootprint(coords.lat, coords.lon);
    await delay(1100); // Be gentle with Overpass too
    
    if (!polygon) {
      console.log(`   ⚠️  Failed to find building footprint near coordinates. Inserting point-based fallback...`);
    }

    // 3. Ensure Management Company Exists
    console.log(`   🏢 Resolving Management Entity: ${prop.manager}...`);
    let managementCompanyId = null;
    
    const { data: existingMgmt } = await supabase
      .from('management_companies')
      .select('id')
      .eq('company_name', prop.manager)
      .limit(1);
      
    if (existingMgmt && existingMgmt.length > 0) {
      managementCompanyId = existingMgmt[0].id;
    } else {
      const { data: newMgmt, error: mgmtErr } = await supabase
        .from('management_companies')
        .insert({
          workspace_id: workspaceId,
          company_name: prop.manager
        })
        .select('id')
        .single();
        
      if (!mgmtErr && newMgmt) {
        managementCompanyId = newMgmt.id;
      }
    }

    // 4. Insert directly into Immaculate Anchor as a verified Golden Record
    console.log(`   💾 Saving Golden Record...`);
    
    const { data: roofData, error: roofErr } = await supabase.from('roof_properties').insert({
      workspace_id: workspaceId,
      property_name: prop.propertyName,
      site_address: prop.address,
      legal_owner_name: prop.taxOwner || null, // Keep separate from manager
      coordinates: JSON.stringify({
        type: "Point",
        coordinates: [coords.lon, coords.lat]
      }),
      building_polygon: polygon ? JSON.stringify(polygon) : null,
      square_footage: prop.sqft > 0 ? prop.sqft : 25000,
      industry: "Commercial",
      pierced_at: new Date().toISOString() // Mark as fully resolved via Top-Down
    }).select('id').single();
    
    if (roofErr || !roofData) {
      console.error(`   ❌ DB Insert Failed:`, roofErr?.message);
      failed++;
      continue;
    }
    
    // 5. Link Property to Management Company
    if (managementCompanyId) {
      console.log(`   🔗 Linking Property to ${prop.manager}...`);
      await supabase.from('property_managers').insert({
        workspace_id: workspaceId,
        property_id: roofData.id,
        management_company_id: managementCompanyId,
        is_primary_contact: true
      });
    }

    console.log(`   ✅ Success!`);
    inserted++;
  }
  
  console.log("\\n==================================================");
  console.log(`🎯 INGESTION COMPLETE!`);
  console.log(`   Successfully imported ${inserted} golden records.`);
  if (failed > 0) console.log(`   Failed to import ${failed} records.`);
  console.log("==================================================");
}

run();
