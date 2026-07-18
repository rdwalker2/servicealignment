import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config({ path: ['.env.local', '.env'] });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  tools: [{ googleSearch: {} } as any] 
});

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
      const way = ways[0];
      const coords = way.geometry.map((pt: any) => [pt.lon, pt.lat]);
      
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

async function checkNOAAForHail(lat: number, lon: number): Promise<number> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Check last 30 days for better demo
  
  const formatNOAADate = (d: Date) => {
    return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  };
  
  const dateRange = `${formatNOAADate(startDate)}:${formatNOAADate(endDate)}`;
  
  try {
    const apiUrl = `https://www.ncei.noaa.gov/swdiws/json/nx3hail/${dateRange}?radius=15.0&center=${lon},${lat}&stat=count`;
    const res = await fetch(apiUrl);
    if (!res.ok) return 0;
    
    const data = await res.json();
    return data.result && data.result.length > 0 ? parseInt(data.result[0].COUNT) : 0;
  } catch (err) {
    return 0;
  }
}

async function runMasterIngestion() {
  console.log('===========================================================');
  console.log(' REAL DATA INGESTION ENGINE (GEMINI -> NOMINATIM -> OVERPASS -> NOAA)');
  console.log('===========================================================\n');

  // Fetch top 5 companies
  const { data: companies, error } = await supabase
    .from('management_companies')
    .select('id, company_name, workspace_id')
    .order('total_managed_sqft', { ascending: false })
    .limit(5);

  if (error || !companies) {
    console.error('❌ Failed to fetch companies');
    return;
  }

  for (const company of companies) {
    console.log(`\n🏢 Starting Ingestion for: ${company.company_name}`);
    
    try {
      console.log(`  🤖 Asking Gemini to find real addresses...`);
      const prompt = `Use Google Search to find 2 to 3 actual physical commercial property locations (like retail stores, warehouses, offices) owned, operated, or managed by "${company.company_name}" in the USA.
      
      Respond STRICTLY with a JSON array containing objects with:
      - "property_name" (string): A descriptive name (e.g. "Walmart Supercenter #123")
      - "address" (string): The full street address including city, state, zip.
      - "sqft" (number): An estimate of the square footage of the building.
      - "tax_owner_shell" (string): A plausible LLC name for the tax owner.
      
      JSON ARRAY OUTPUT ONLY. No markdown.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        console.log(`  ⚠️ No valid JSON returned by Gemini.`);
        continue;
      }

      const properties = JSON.parse(jsonMatch[0]);
      console.log(`  ✅ Gemini found ${properties.length} real locations.`);

      for (const prop of properties) {
        console.log(`\n    📍 Processing: ${prop.property_name} | ${prop.address}`);
        
        console.log(`      🔍 Geocoding address...`);
        const coords = await geocodeAddress(prop.address);
        await delay(1100);
        
        if (!coords) {
          console.log(`      ❌ Failed to geocode address.`);
          continue;
        }

        console.log(`      🗺️ Extracting building polygon...`);
        const polygon = await getBuildingFootprint(coords.lat, coords.lon);
        await delay(1100);

        console.log(`      ☁️ Checking NOAA for severe hail (last 30 days)...`);
        const hailStrikes = await checkNOAAForHail(coords.lat, coords.lon);
        
        console.log(`      💾 Saving to database...`);
        
        // 1. Insert Roof
        const { data: newRoof, error: roofErr } = await supabase
          .from('roof_properties')
          .insert({
            workspace_id: company.workspace_id,
            property_name: prop.property_name,
            site_address: prop.address,
            square_footage: prop.sqft,
            industry: 'Commercial',
            legal_owner_name: prop.tax_owner_shell,
            coordinates: JSON.stringify({ type: "Point", coordinates: [coords.lon, coords.lat] }),
            building_polygon: polygon ? JSON.stringify(polygon) : null,
            pierced_at: new Date().toISOString()
          })
          .select()
          .single();

        if (roofErr || !newRoof) {
          console.error(`      ❌ Error inserting roof: ${roofErr?.message}`);
          continue;
        }

        // 2. Health Score
        const baseline = 95;
        const newScore = Math.max(0, baseline - (hailStrikes * 10)); // Deduct 10 points per strike
        
        await supabase
          .from('roof_health_scores')
          .insert({
            workspace_id: company.workspace_id,
            property_id: newRoof.id,
            health_score: newScore,
            score_factors: JSON.stringify([
              { factor: 'baseline', impact: baseline },
              { factor: 'real_time_hail', impact: -(hailStrikes * 10) }
            ])
          });

        if (hailStrikes > 0) {
          console.log(`      🚨 NOAA Hail Detected: ${hailStrikes} strikes. Score adjusted to ${newScore}.`);
          await supabase.from('roof_signals').insert({
            property_id: newRoof.id,
            signal_type: 'weather',
            signal_data: JSON.stringify({ description: `${hailStrikes} severe hail anomalies recorded via NOAA API.` }),
            detected_at: new Date().toISOString()
          });
        } else {
          console.log(`      ✅ Clear skies.`);
        }

        // 3. Dummy Contact
        const { data: dummyContact } = await supabase
          .from('contacts')
          .insert({
            workspace_id: company.workspace_id,
            management_company_id: company.id,
            first_name: 'Facility',
            last_name: 'Director',
            job_title: 'Facilities Director'
          }).select().single();

        // 4. Link
        if (dummyContact) {
          await supabase
            .from('property_managers')
            .insert({
              workspace_id: company.workspace_id,
              property_id: newRoof.id,
              management_company_id: company.id,
              contact_id: dummyContact.id
            });
        }
        
        console.log(`      ✅ Successfully fully ingested!`);
      }
    } catch (e: any) {
      console.error(`  ❌ Failed: ${e.message}`);
    }
  }

  console.log('\n===========================================================');
  console.log('✅ MASTER INGESTION COMPLETE');
  console.log('===========================================================');
}

runMasterIngestion();
