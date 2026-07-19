const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function bulkEnrichPortfolio() {
  console.log('Starting MoltSets Portfolio Enrichment...');
  
  // Dynamically import the ES module client
  const { enrichDomainWithMoltSets } = await import('../../../../server/lib/moltsetsClient.js');

  // Find the target company (e.g., Cushman & Wakefield)
  // For production, you could loop through multiple companies
  const targetCompany = 'Cushman & Wakefield';
  
  const { data: company, error: companyErr } = await supabase
    .from('management_companies')
    .select('*')
    .ilike('company_name', `%${targetCompany.split(' ')[0]}%`)
    .single();

  if (companyErr || !company) {
    console.error(`Error finding company ${targetCompany}:`, companyErr?.message);
    return;
  }

  // Fetch all properties for this company to link them later
  // In the DB, the Cushman properties are currently named "C&W ..." 
  const { data: properties } = await supabase
    .from('roof_properties')
    .select('id, property_name, workspace_id, site_address')
    .ilike('property_name', '%C&W%'); // specific to Cushman data setup

  if (!properties || properties.length === 0) {
    console.log(`No properties found to associate for ${company.company_name}.`);
    return;
  }

  console.log(`Found ${properties.length} properties for ${company.company_name}.`);
  console.log(`Searching MoltSets for specific local decision makers for each property...`);

  const MOLTSETS_API_KEY = process.env.MOLTSETS_API_KEY || 'ms_49896b9586d9df9d3197734ea3875641';

  for (const prop of properties) {
    console.log(`\n🔍 Searching contacts for: ${prop.property_name} (${prop.site_address})`);
    
    // Extract city from standard US address format (e.g. "..., Cincinnati, OH 45202")
    let city = 'Ohio'; 
    if (prop.site_address) {
      const parts = prop.site_address.split(',');
      if (parts.length >= 3) {
        city = parts[parts.length - 2].trim(); // Usually the city
      }
    }

    const query = `"Cushman & Wakefield" Property Manager ${city}`;
    console.log(`   Query: "${query}"`);

    try {
      const searchRes = await fetch('https://api.moltsets.com/api/v1/tools/search_people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MOLTSETS_API_KEY}` },
        body: JSON.stringify({ query: query, limit: 3 })
      });
      const searchData = await searchRes.json();

      if (searchData.results && searchData.results.results && searchData.results.results.length > 0) {
        const results = searchData.results.results;
        console.log(`   ✅ Found ${results.length} local managers!`);

        for (const person of results) {
          const email = (person.personal_emails && person.personal_emails[0]) || person.personal_email || person.business_email || `unknown@${person.linkedin_slug}.com`;
          
          // 1. Check if contact exists
          let { data: contact } = await supabase
            .from('contacts')
            .select('id')
            .eq('email', email)
            .single();

          if (!contact) {
            const { data: newContact, error: contactErr } = await supabase
              .from('contacts')
              .insert({
                workspace_id: company.workspace_id,
                first_name: person.first_name || 'Unknown',
                last_name: person.last_name || 'Unknown',
                email: email,
                job_title: person.title,
                linkedin_url: person.linkedin_url
              })
              .select()
              .single();

            if (contactErr) {
              console.error(`      ❌ Failed to insert contact ${person.full_name}:`, contactErr.message);
              continue;
            }
            contact = newContact;
            console.log(`      👤 Injected: ${person.full_name} (${person.title})`);
          } else {
            console.log(`      ⚠️ Contact already exists: ${person.full_name}`);
          }

          // 2. Link this contact strictly to THIS property
          const { data: link } = await supabase
            .from('property_managers')
            .select('id')
            .eq('property_id', prop.id)
            .eq('contact_id', contact.id)
            .single();
            
          if (!link) {
            await supabase.from('property_managers').insert({
              workspace_id: prop.workspace_id,
              property_id: prop.id,
              management_company_id: company.id,
              contact_id: contact.id
            });
            console.log(`      🔗 Linked to ${prop.property_name}`);
          }
        }
      } else {
        console.log(`   ❌ Found 0 matching decision makers for this location.`);
      }
    } catch (err) {
      console.error(`   ⚠️ Failed to process MoltSets search:`, err.message);
    }
  }
  
  console.log('\nBatch complete.');
}

bulkEnrichPortfolio();
