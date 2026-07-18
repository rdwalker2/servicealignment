import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);
const MOLTSETS_API_KEY = process.env.MOLTSETS_API_KEY || 'ms_49896b9586d9df9d3197734ea3875641';

async function auditCushman() {
  console.log("=== Auditing Cushman & Wakefield Portfolio (Ohio) ===\n");
  
  // Find properties via C&W naming convention
  const { data: properties, error: propErr } = await supabase
    .from('roof_properties')
    .select('id, property_name, site_address, square_footage')
    .ilike('property_name', '%C&W%');
    
  if (propErr) {
    console.error("Error querying roof_properties:", propErr.message);
    return;
  }
  
  console.log(`✅ Found ${properties.length} C&W properties in the database.\n`);
  
  // Find current contacts
  const { data: company } = await supabase
    .from('management_companies')
    .select('id, company_name')
    .ilike('company_name', '%Cushman%')
    .single();

  if (company) {
    const { data: contacts } = await supabase
      .from('contacts')
      .select('first_name, last_name, email')
      .eq('company_id', company.id);
      
    console.log(`Current DB Contacts for ${company.company_name}:`);
    if (contacts && contacts.length > 0) {
      contacts.forEach(c => console.log(`  - ${c.first_name} ${c.last_name} | ${c.email}`));
    } else {
      console.log(`  - None found.`);
    }
  }

  console.log("\n---------------------------------------------------");
  console.log("Testing MoltSets to find REAL decision makers for these properties:");
  
  // We'll run a targeted search for Property Managers / Facilities in Ohio
  const query = `Cushman Property Manager OR Facility Director OR Real Estate Manager Ohio OR Cincinnati`;
  
  try {
    const searchRes = await fetch('https://api.moltsets.com/api/v1/tools/search_people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MOLTSETS_API_KEY}` },
      body: JSON.stringify({ query: query, limit: 10 })
    });
    const searchData = await searchRes.json();
    
    if (searchData.error) {
      console.error('MoltSets Error:', searchData.error.message);
      return;
    }
    
    if (searchData.results && searchData.results.results && searchData.results.results.length > 0) {
      const results = searchData.results.results;
      console.log(`MoltSets found ${results.length} potential decision makers in the region!\n`);
      results.forEach(m => {
        console.log(`[MoltSets] ${m.full_name} - ${m.title}`);
        console.log(`           Location: ${m.location || 'Unknown'}`);
        console.log(`           LinkedIn: ${m.linkedin_url}`);
      });
    } else {
      console.log(`MoltSets found 0 matching decision makers natively.`);
    }
  } catch (e) {
    console.error("Failed MoltSets API call:", e.message);
  }
}

auditCushman();
