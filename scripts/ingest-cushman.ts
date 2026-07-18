import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config({ path: ['.env.local', '.env'] });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  tools: [{ googleSearch: {} } as any] 
});

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function geocodeAddress(address: string): Promise<{ lat: number, lon: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const response = await fetch(url, { headers: { 'User-Agent': 'ServiceAlignment/1.0' } });
    if (!response.ok) return null;
    const data = await response.json();
    if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch (err) {}
  return null;
}

async function checkNOAAForHail(lat: number, lon: number): Promise<number> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  const formatNOAADate = (d: Date) => `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  try {
    const apiUrl = `https://www.ncei.noaa.gov/swdiws/json/nx3hail/${formatNOAADate(startDate)}:${formatNOAADate(endDate)}?radius=15.0&center=${lon},${lat}&stat=count`;
    const res = await fetch(apiUrl);
    if (!res.ok) return 0;
    const data = await res.json();
    return data.result && data.result.length > 0 ? parseInt(data.result[0].COUNT) : 0;
  } catch (err) {
    return 0;
  }
}

const propertiesToIngest = [
  { name: 'C&W Facility - Walnut', address: '580 Walnut St, Cincinnati, OH 45202', sqft: 450000 },
  { name: 'C&W Logistics Center - Dorset', address: '998 S Dorset Rd, Troy, OH 45373', sqft: 1200000 },
  { name: 'C&W Distribution - Crescentville', address: '862 E Crescentville Rd, West Chester Township, OH 45246', sqft: 850000 },
  { name: 'C&W Regional Hub - Alliance', address: '10200 Alliance Rd, Cincinnati, OH 45242', sqft: 320000 },
  { name: 'C&W Commercial Center - Smith', address: '4000 Smith Rd, Cincinnati, OH 45209', sqft: 210000 },
  { name: 'C&W Office Plaza - Walnut', address: '425 Walnut St, Cincinnati, OH 45202', sqft: 500000 }
];

async function runCushmanIngestion() {
  console.log('===========================================================');
  console.log(' INGESTING CUSHMAN & WAKEFIELD PORTFOLIO (OHIO) ');
  console.log('===========================================================\n');

  // Fetch or create Cushman & Wakefield company
  let { data: company } = await supabase.from('management_companies').select('*').ilike('company_name', '%Cushman%').limit(1).single();
  
  if (!company) {
    const { data: newComp } = await supabase.from('management_companies').insert({
      workspace_id: 'default',
      company_name: 'Cushman & Wakefield',
      total_managed_sqft: 250000000
    }).select().single();
    company = newComp;
  }

  if (!company) {
    console.error('❌ Could not establish company record.');
    return;
  }

  // Clear existing campaign for cushman-ohio-portfolio
  await supabase.from('campaign_outreach').delete().eq('prospect_room_token', 'cushman-ohio-portfolio');

  // Clear existing properties with this company
  const { data: existingProps } = await supabase.from('roof_properties').select('id').ilike('property_name', '%C&W%');
  if (existingProps && existingProps.length > 0) {
    const ids = existingProps.map(p => p.id);
    await supabase.from('roof_health_scores').delete().in('property_id', ids);
    await supabase.from('roof_signals').delete().in('property_id', ids);
    await supabase.from('property_managers').delete().in('property_id', ids);
    await supabase.from('roof_properties').delete().in('id', ids);
  }

  // Ensure a contact exists
  let { data: contact } = await supabase.from('contacts').select('id').eq('email', 'facilities@cushman.com').single();
  if (!contact) {
    const { data: newContact } = await supabase.from('contacts').insert({
      workspace_id: company.workspace_id,
      first_name: 'Facilities',
      last_name: 'Manager',
      email: 'facilities@cushman.com',
      company_id: company.id
    }).select().single();
    contact = newContact;
  }

  for (const prop of propertiesToIngest) {
    console.log(`\n📍 Processing: ${prop.name} | ${prop.address}`);
    
    const coords = await geocodeAddress(prop.address);
    await delay(1000);
    
    let lat = 39.1031, lon = -84.5120; // Fallback to Cincinnati
    if (coords) { lat = coords.lat; lon = coords.lon; }

    const hailStrikes = await checkNOAAForHail(lat, lon);
    
    // 1. Insert Roof
    const { data: newRoof, error: roofErr } = await supabase.from('roof_properties').insert({
      workspace_id: company.workspace_id,
      property_name: prop.name,
      site_address: prop.address,
      square_footage: prop.sqft,
      industry: 'Commercial Real Estate',
      coordinates: JSON.stringify({ type: "Point", coordinates: [lon, lat] }),
      pierced_at: new Date().toISOString()
    }).select().single();

    if (roofErr || !newRoof) {
      console.error(`❌ Error inserting roof:`, roofErr);
      continue;
    }

    // 2. Link to PM
    if (contact) {
      await supabase.from('property_managers').insert({
        workspace_id: company.workspace_id,
        property_id: newRoof.id,
        management_company_id: company.id,
        contact_id: contact.id
      });
    }

    // 3. Health Score & Signals
    const baseline = 95;
    
    // Use Gemini to find real permit/roof age data
    let realRoofAge = 15; // default fallback
    let permitSummary = 'Historical building permits indicate standard roof age.';
    try {
      const prompt = `Use Google Search to find the approximate age of the building or roof at "${prop.address}". If you can find building permits or construction dates, use those. 
      Respond strictly with a JSON object: 
      { "age_in_years": number, "summary": "brief explanation" }`;
      
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const permitData = JSON.parse(jsonMatch[0]);
        if (permitData.age_in_years && !isNaN(permitData.age_in_years)) {
          realRoofAge = permitData.age_in_years;
          permitSummary = permitData.summary;
        }
      }
    } catch (e) {
      console.log('      ⚠️ Failed to fetch real permit data, using fallback.');
    }

    const agePenalty = Math.max(0, (realRoofAge - 15) * 4); // Penalty grows after 15 years
    const hailPenalty = Math.min(40, hailStrikes * 10);
    
    const newScore = Math.max(0, baseline - agePenalty - hailPenalty);
    
    await supabase.from('roof_health_scores').insert({
      property_id: newRoof.id,
      health_score: newScore,
      score_factors: JSON.stringify([
        { factor: 'baseline', impact: baseline },
        { factor: 'permit_roof_age', age: realRoofAge, impact: -agePenalty, label: `Permit Age: ${realRoofAge} yrs` },
        { factor: 'real_time_hail', strikes: hailStrikes, impact: -hailPenalty, label: `Recent Hail Events` }
      ])
    });

    // Insert Signals
    await supabase.from('roof_signals').insert({
      property_id: newRoof.id,
      signal_type: 'permit',
      signal_data: JSON.stringify({ description: permitSummary, age: realRoofAge }),
      detected_at: new Date().toISOString()
    });

    if (hailStrikes > 0) {
      await supabase.from('roof_signals').insert({
        property_id: newRoof.id,
        signal_type: 'weather',
        signal_data: JSON.stringify({ description: `${hailStrikes} severe hail anomalies recorded via NOAA API.` }),
        detected_at: new Date().toISOString()
      });
    }

    // 4. Create Campaign Token record
    await supabase.from('campaign_outreach').insert({
      property_id: newRoof.id,
      campaign_name: 'Cushman & Wakefield OH Regional Target',
      status: 'active',
      prospect_room_token: 'cushman-ohio-portfolio'
    });

    console.log(`✅ Fully Ingested. Age: ${realRoofAge} yrs | Hail: ${hailStrikes} | Score: ${newScore}`);
  }
  console.log('\n✅ DONE! Lander available at /case/cushman-ohio');
}

runCushmanIngestion();
