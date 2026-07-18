import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '');

const jllProperties = [
  { name: 'Westgate Industrial', address: '4220 Industrial Pkwy, Tampa, FL', score: 34, lat: 27.9506, lon: -82.4572, note: 'Warranty expired Dec 2025. Hail event Mar 14, satellite damage flagged.' },
  { name: 'Crossroads Logistics Hub', address: '1875 Distribution Way, Orlando, FL', score: 58, lat: 28.5383, lon: -81.3792, note: 'Roof age 16 years. Ponding detected in 3 quadrants. Next storm season: high risk.' },
  { name: 'Northgate Distribution', address: '920 Commerce Blvd, Jacksonville, FL', score: 45, lat: 30.3322, lon: -81.6557, note: 'New property manager 30 days ago. Roof history unknown to new team.' },
  { name: 'Eastpoint Office Park', address: '3300 Eastpoint Dr, Miami, FL', score: 71, lat: 25.7617, lon: -80.1918, note: 'Warranty expires Q2. Capital cycle window approaching. Plan ahead.' },
  { name: 'Sunridge Distribution Center', address: '5500 Sunridge Way, Tampa, FL', score: 92, lat: 27.9600, lon: -82.4500, note: 'Roof reroofed 2024. All clear. Next routine check in 30 days.' },
  { name: 'Harborview Corporate Center', address: '100 Harborview Plaza, Tampa, FL', score: 88, lat: 27.9400, lon: -82.4600, note: 'Strong warranty position. Satellite scan clean as of Mar 28.' },
  { name: 'Meridian Technology Park', address: '7700 Tech Cir, Orlando, FL', score: 76, lat: 28.5400, lon: -81.3800, note: 'Minor seam separation detected. Worth inspecting before peak heat.' },
  { name: 'Riverside Commerce Plaza', address: '1212 River Rd, Jacksonville, FL', score: 82, lat: 30.3400, lon: -81.6600, note: 'All systems normal. Next check Apr 27.' },
  { name: 'Summit Industrial Complex', address: '2200 Summit Ave, Miami, FL', score: 67, lat: 25.7700, lon: -80.1800, note: 'Roof age 14 yrs. Approaching mid-life check.' },
  { name: 'Lakeshore Office Tower', address: '88 Lakeshore Blvd, Tampa, FL', score: 94, lat: 27.9300, lon: -82.4700, note: 'Best score in portfolio. Recently inspected.' },
  { name: 'Greenpoint Manufacturing', address: '4400 Industrial Loop, Orlando, FL', score: 52, lat: 28.5500, lon: -81.3900, note: 'Patchwork detected. Quality concerns.' },
  { name: 'Stonebridge Business Park', address: '6650 Stonebridge Ct, Jacksonville, FL', score: 79, lat: 30.3200, lon: -81.6400, note: 'Stable. Next storm exposure review Jun 1.' }
];

async function run() {
  console.log('Seeding JLL Prototype Database...');
  
  const { data: workspaces } = await supabase.from('workspaces').select('id').limit(1);
  if (!workspaces || workspaces.length === 0) {
     console.error("No workspaces found.");
     return;
  }
  const workspaceId = workspaces[0].id;

  // 1. Ensure Management Company Exists
  let managementCompanyId = null;
  const { data: existingMgmt } = await supabase
    .from('management_companies')
    .select('id')
    .eq('company_name', 'JLL')
    .limit(1);
    
  if (existingMgmt && existingMgmt.length > 0) {
    managementCompanyId = existingMgmt[0].id;
  } else {
    const { data: newMgmt } = await supabase
      .from('management_companies')
      .insert({ workspace_id: workspaceId, company_name: 'JLL' })
      .select('id')
      .single();
    managementCompanyId = newMgmt?.id;
  }

  // 2. Clear old JLL properties just to keep it clean
  await supabase.from('roof_properties')
    .delete()
    .eq('legal_owner_name', 'JLL');
    
  // Also delete properties linked to JLL via property_managers
  const { data: linkedProps } = await supabase.from('property_managers')
    .select('property_id')
    .eq('management_company_id', managementCompanyId);
  
  if (linkedProps && linkedProps.length > 0) {
    const ids = linkedProps.map(lp => lp.property_id);
    await supabase.from('roof_properties').delete().in('id', ids);
  }

  // 3. Insert new properties
  for (const prop of jllProperties) {
    console.log(`Inserting ${prop.name}...`);
    const { data: roofData, error: roofErr } = await supabase.from('roof_properties').insert({
      workspace_id: workspaceId,
      property_name: prop.name,
      site_address: prop.address,
      legal_owner_name: 'Shell LLC (Unknown)',
      coordinates: JSON.stringify({ type: "Point", coordinates: [prop.lon, prop.lat] }),
      square_footage: Math.floor(Math.random() * (300000 - 50000) + 50000),
      industry: "Commercial",
      pierced_at: new Date().toISOString()
    }).select('id').single();
    
    if (roofErr || !roofData) {
      console.error(`❌ DB Insert Failed for ${prop.name}:`, roofErr);
      continue;
    }
    
    // Link to JLL
    if (managementCompanyId) {
      await supabase.from('property_managers').insert({
        workspace_id: workspaceId,
        property_id: roofData.id,
        management_company_id: managementCompanyId,
        is_primary_contact: true
      });
    }

    // Insert Health Score
    await supabase.from('roof_health_scores').insert({
      property_id: roofData.id,
      health_score: prop.score,
      score_factors: JSON.stringify([{ factor: 'mock', impact: -10 }]),
      calculated_at: new Date().toISOString()
    });

    // Insert Signal for the note
    await supabase.from('roof_signals').insert({
      property_id: roofData.id,
      signal_type: 'mock',
      signal_data: JSON.stringify({ description: prop.note }),
      detected_at: new Date().toISOString()
    });
  }
  
  console.log('✅ JLL Prototype Seed Complete!');
}

run();
