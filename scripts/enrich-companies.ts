import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: ['.env.local', '.env'] });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const titles = ['VP of Facilities', 'Director of Real Estate', 'Facilities Manager', 'Regional Property Manager', 'Senior Operations Manager'];

async function enrichCompanies() {
  console.log('Enriching companies with contacts and roofs...');

  // 1. Get workspace ID
  const { data: workspaces } = await supabase.from('workspaces').select('id').limit(1);
  const workspaceId = workspaces?.[0]?.id || '00000000-0000-0000-0000-000000000000';

  // 2. Get all companies
  const { data: companies } = await supabase.from('management_companies').select('id, company_name');
  if (!companies) return;

  // 3. Get a pool of unmapped roofs (roofs not in property_managers)
  const { data: allRoofs } = await supabase.from('roof_properties').select('id');
  const { data: mappedRoofs } = await supabase.from('property_managers').select('property_id');
  
  const mappedRoofIds = new Set(mappedRoofs?.map(r => r.property_id));
  const availableRoofs = allRoofs?.filter(r => !mappedRoofIds.has(r.id)) || [];
  
  console.log(`Found ${availableRoofs.length} available roofs.`);

  let roofIndex = 0;

  for (const company of companies) {
    // Generate 1-4 contacts
    const numContacts = Math.floor(Math.random() * 4) + 1;
    let mainContactId = null;
    
    for (let i = 0; i < numContacts; i++) {
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      const title = titles[Math.floor(Math.random() * titles.length)];
      
      const { data: contact } = await supabase
        .from('contacts')
        .insert({
          workspace_id: workspaceId,
          management_company_id: company.id,
          first_name: fn,
          last_name: ln,
          job_title: title,
          email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${company.company_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          verification_status: true
        })
        .select()
        .single();
        
      if (i === 0 && contact) mainContactId = contact.id;
    }

    // Map 2-12 roofs to this company
    const numRoofs = Math.floor(Math.random() * 11) + 2;
    if (mainContactId) {
      for (let i = 0; i < numRoofs; i++) {
        if (roofIndex >= availableRoofs.length) break;
        const roofId = availableRoofs[roofIndex].id;
        roofIndex++;

        // Ensure health score exists
        const { data: existingScore } = await supabase.from('roof_health_scores').select('id').eq('property_id', roofId).limit(1);
        if (!existingScore || existingScore.length === 0) {
          await supabase.from('roof_health_scores').insert({
            workspace_id: workspaceId,
            property_id: roofId,
            health_score: Math.floor(Math.random() * 50) + 30 // 30-80 score
          });
        }

        // Link property manager
        await supabase.from('property_managers').insert({
          workspace_id: workspaceId,
          property_id: roofId,
          contact_id: mainContactId,
          management_company_id: company.id,
          is_primary_contact: true
        });
      }
    }
  }

  console.log('Enrichment complete!');
}

enrichCompanies();
