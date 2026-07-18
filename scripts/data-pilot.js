/**
 * Service Alignment Data Engine - Pilot Script (Kodiak Roofing Territory)
 * 
 * This script demonstrates the 3-step enrichment pipeline required to map 
 * a raw physical address to a decision-maker's cell phone for automated dispatch.
 * 
 * Step 1: Geospatial Resolution (LIVE - OpenStreetMap / Nominatim)
 * Step 2: Entity Resolution (STUBBED - representing Clay.com / Ocean.io)
 * Step 3: Identity Resolution (STUBBED - representing Apollo.io / ZoomInfo)
 */

import fs from 'fs';
import path from 'path';

// Target Addresses in Kodiak's territory
const TARGET_ADDRESSES = [
  "1151 Galleria Blvd, Roseville, CA",
  "8000 Metro Air Pkwy, Sacramento, CA",
  "2315 Stockton Blvd, Sacramento, CA",
  "4590 S Virginia St, Reno, NV",
  "1 Electric Ave, Sparks, NV"
];

// Utility: Simulate network delay for stubs
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * STEP 1: Geospatial Resolution
 * Converts an address into exact coordinates using the free Nominatim API.
 */
async function resolveGeospatial(address) {
  console.log(`\n[Geospatial] Geocoding address: ${address}`);
  
  try {
    // We add a specific user-agent as required by Nominatim's terms of service
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'ServiceAlignment-DataPilot/1.0' } }
    );
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      console.log(`  ✓ Found coordinates: [${result.lon}, ${result.lat}]`);
      console.log(`  ✓ Place Name: ${result.display_name.split(',')[0]}`);
      
      return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        placeId: result.place_id,
        rawName: result.display_name.split(',')[0],
        success: true
      };
    } else {
      console.log(`  ✗ Geocoding failed: No results found.`);
      return { success: false };
    }
  } catch (error) {
    console.error(`  ✗ Geocoding API Error:`, error.message);
    return { success: false };
  }
}

/**
 * STEP 2: Entity Resolution
 * In production, this takes the address and searches corporate registries (via Clay.com)
 * to pierce the LLC veil and find the actual Property Management firm.
 */
async function enrichCompanyEntity(address, geoData) {
  console.log(`[Entity]     Resolving management firm for ${address}...`);
  await delay(800); // Simulate API call to Clay.com
  
  // Mock Data DB
  const mockEntityDb = {
    'Galleria': { company: 'Brookfield Properties', industry: 'Retail Management' },
    'Metro Air': { company: 'Prologis', industry: 'Industrial Logistics' },
    'Stockton': { company: 'UC Davis Health Facilities', industry: 'Healthcare' },
    'Virginia St': { company: 'Reno-Sparks Convention and Visitors Authority', industry: 'Government' },
    'Electric Ave': { company: 'Tesla Global Facilities', industry: 'Manufacturing' }
  };
  
  let resolvedCompany = 'Unknown Management LLC';
  let industry = 'Commercial Real Estate';
  
  // Simple stub matching
  for (const [key, val] of Object.entries(mockEntityDb)) {
    if (address.includes(key)) {
      resolvedCompany = val.company;
      industry = val.industry;
      break;
    }
  }
  
  console.log(`  ✓ Entity resolved: ${resolvedCompany} (${industry})`);
  return { companyName: resolvedCompany, industry };
}

/**
 * STEP 3: Identity Resolution
 * In production, this queries Apollo.io for "Facility Manager" at the resolved company.
 */
async function findDecisionMaker(companyName) {
  console.log(`[Identity]   Searching for Facility Manager at ${companyName}...`);
  await delay(600); // Simulate API call to Apollo.io
  
  // Generate a mock realistic contact based on the company name
  const firstNames = ['Sarah', 'Michael', 'David', 'Jessica', 'Robert'];
  const lastNames = ['Chen', 'Miller', 'Johnson', 'Smith', 'Martinez'];
  
  const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
  
  const contact = {
    name: `${fName} ${lName}`,
    title: 'Director of Facilities & Maintenance',
    email: `${fName.toLowerCase()}.${lName.toLowerCase()}@${domain}`,
    mobile: `+1 (${Math.floor(Math.random()*900)+100}) 555-${Math.floor(Math.random()*9000)+1000}`
  };
  
  console.log(`  ✓ Contact found: ${contact.name} | ${contact.email} | ${contact.mobile}`);
  return contact;
}

/**
 * Main Pipeline Execution
 */
async function runPipeline() {
  console.log("==================================================");
  console.log("🚀 STARTING DATA PILOT PIPELINE (Kodiak Roofing) 🚀");
  console.log("==================================================");
  
  const results = [];
  
  for (const address of TARGET_ADDRESSES) {
    // 1. Geocode
    const geo = await resolveGeospatial(address);
    if (!geo.success) continue;
    
    // 2. Entity Match
    const entity = await enrichCompanyEntity(address, geo);
    
    // 3. Find Contact
    const contact = await findDecisionMaker(entity.companyName);
    
    results.push({
      address,
      coordinates: [geo.lon, geo.lat],
      placeName: geo.rawName,
      managementCompany: entity.companyName,
      industry: entity.industry,
      decisionMaker: contact
    });
    
    // Small delay between addresses to avoid rate limits on the public Nominatim API
    await delay(1000); 
  }
  
  console.log("\n==================================================");
  console.log("✅ PIPELINE COMPLETE. Generated Relational Payload:");
  console.log("==================================================");
  console.log(JSON.stringify(results, null, 2));
  
  // Save output
  const outputPath = path.join(process.cwd(), 'scripts', 'kodiak_enriched_targets.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Saved full payload to ${outputPath}`);

  console.log("\n==================================================");
  console.log("🛠️  DATABASE MAPPING (PostGIS & CRM Relations) 🛠️");
  console.log("==================================================");
  
  // Generate fake UUIDs just for the demonstration
  const fakeWorkspaceId = 'wks-1234-5678';
  
  results.forEach((res, i) => {
    const propId = `prop-uuid-${i}`;
    const compId = `comp-uuid-${i}`;
    const contId = `cont-uuid-${i}`;
    
    console.log(`\n-- [Property ${i+1}: ${res.placeName}] --`);
    
    // 1. Insert Management Company
    console.log(`INSERT INTO public.management_companies (id, workspace_id, company_name)`);
    console.log(`VALUES ('${compId}', '${fakeWorkspaceId}', '${res.managementCompany}');`);
    
    // 2. Insert Contact
    console.log(`\nINSERT INTO public.contacts (id, workspace_id, management_company_id, first_name, last_name, job_title, email, mobile_phone)`);
    const [fName, lName] = res.decisionMaker.name.split(' ');
    console.log(`VALUES ('${contId}', '${fakeWorkspaceId}', '${compId}', '${fName}', '${lName}', '${res.decisionMaker.title}', '${res.decisionMaker.email}', '${res.decisionMaker.mobile}');`);
    
    // 3. Insert Property with Spatial Point
    console.log(`\nINSERT INTO public.roof_properties (id, workspace_id, property_name, address, industry, coordinates)`);
    console.log(`VALUES ('${propId}', '${fakeWorkspaceId}', '${res.placeName}', '${res.address}', '${res.industry}', ST_SetSRID(ST_MakePoint(${res.coordinates[0]}, ${res.coordinates[1]}), 4326));`);
    
    // 4. Insert Join Table (Property Manager)
    console.log(`\nINSERT INTO public.property_managers (workspace_id, property_id, contact_id, management_company_id, is_primary_contact)`);
    console.log(`VALUES ('${fakeWorkspaceId}', '${propId}', '${contId}', '${compId}', true);`);
    console.log(`--------------------------------------------------`);
  });

  console.log("\n🎯 MAGIC QUERY: When a Hail Storm hits...");
  console.log(`
SELECT pm.contact_id, c.mobile_phone, p.address 
FROM public.properties p
JOIN public.geospatial_weather_events w ON ST_Intersects(p.coordinates, w.storm_polygon)
JOIN public.property_managers pm ON pm.property_id = p.id
JOIN public.contacts c ON pm.contact_id = c.id
WHERE w.event_type = 'Hail' AND w.created_at > now() - interval '1 hour';
  `);
}

// Execute
runPipeline();
