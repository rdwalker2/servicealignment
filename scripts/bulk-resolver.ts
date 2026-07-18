import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config({ path: ['.env.local', '.env'] });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
// We don't need Search Grounding for this simulation step since we are resolving simulated LLCs
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

async function runBulkResolver() {
  console.log('\n===========================================================');
  console.log(' PREDICTIVE ENGINE: LLC PIERCING ENGINE (BULK RESOLUTION)');
  console.log('===========================================================\n');

  // 1. Fetch valid Target Accounts (Top 10)
  const { data: companies, error: compErr } = await supabase
    .from('management_companies')
    .select('id, company_name, workspace_id')
    .order('total_managed_sqft', { ascending: false })
    .limit(10);

  if (compErr || !companies) {
    console.error('❌ Failed to fetch Target Accounts.');
    return;
  }

  const validAccounts = companies.map(c => c.company_name);
  const accountMap = new Map(companies.map(c => [c.company_name, c]));

  console.log(`🎯 Loaded ${validAccounts.length} Golden Record Target Accounts to map against.`);

  // 2. Fetch unmanaged properties (Left join to find properties without a manager)
  // Since supabase-js doesn't easily do "where not exists" left joins, we'll fetch properties 
  // and check if they lack a manager in a simpler way.
  
  const { data: allRoofs, error: roofErr } = await supabase
    .from('roof_properties')
    .select(`
      id, 
      property_name, 
      address, 
      legal_owner_name,
      square_footage,
      workspace_id,
      property_managers(id)
    `)
    .limit(500);

  if (roofErr || !allRoofs) {
    console.error('❌ Failed to fetch Roof Properties.');
    return;
  }

  // Filter for unmanaged (those without a property_manager record)
  const unmanagedRoofs = allRoofs.filter(r => !r.property_managers || r.property_managers.length === 0);
  
  if (unmanagedRoofs.length === 0) {
    console.log('✅ No unmanaged properties found. Database is fully resolved!');
    return;
  }

  // Take a batch of 30 to prevent massive LLM payloads
  const batch = unmanagedRoofs.slice(0, 30);
  
  console.log(`\n🔍 Found ${unmanagedRoofs.length} unmanaged properties. Processing a batch of ${batch.length}...`);

  const payload = batch.map(r => ({
    id: r.id,
    address: r.address,
    taxOwner: r.legal_owner_name,
    sqft: r.square_footage
  }));

  console.log(`\n🧠 Sending batch to AI Forensic Enrichment Engine...`);
  
  const prompt = `You are an enterprise data enrichment API. I am giving you a batch of commercial properties registered to shell LLCs.
  Your job is to "pierce the corporate veil" and resolve them to their true corporate owner.
  
  You MUST map each property to one of the following Valid Target Accounts:
  ${validAccounts.join(', ')}
  
  Use logic based on square footage (e.g., massive sqft > 300k is likely Prologis or Lineage Logistics, smaller retail is likely Walmart or Kimco).
  
  PROPERTIES TO RESOLVE:
  ${JSON.stringify(payload, null, 2)}
  
  Respond STRICTLY with a JSON array where each object has:
  - "property_id" (string): The exact ID from the payload.
  - "resolved_company" (string): MUST perfectly match one of the Valid Target Accounts.
  - "confidence" (number): 85-99.
  
  JSON ARRAY OUTPUT ONLY.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      const resolutions = JSON.parse(jsonMatch[0]);
      console.log(`\n✅ AI Engine Successfully Resolved ${resolutions.length} Properties.`);
      
      let successCount = 0;

      for (const res of resolutions) {
        const company = accountMap.get(res.resolved_company);
        const roof = batch.find(b => b.id === res.property_id);
        
        if (company && roof) {
          // Find dummy contact for the company (to satisfy the join table)
          const { data: contacts } = await supabase
            .from('contacts')
            .select('id')
            .eq('management_company_id', company.id)
            .limit(1);
            
          let contactId = contacts && contacts.length > 0 ? contacts[0].id : null;
          
          if (!contactId) {
            // Create fallback contact if missing
             const { data: dummyContact } = await supabase
              .from('contacts')
              .insert({
                workspace_id: company.workspace_id,
                management_company_id: company.id,
                first_name: 'Facility',
                last_name: 'Manager',
                job_title: 'Facilities Manager'
              }).select().single();
              if (dummyContact) contactId = dummyContact.id;
          }

          if (contactId) {
            // Insert into property_managers
            await supabase
              .from('property_managers')
              .insert({
                workspace_id: company.workspace_id,
                property_id: roof.id,
                management_company_id: company.id,
                contact_id: contactId
              });
              
             console.log(`  🔗 [Confidence ${res.confidence}%] Linked: ${roof.taxOwner} -> ${company.company_name}`);
             successCount++;
          }
        }
      }
      
      console.log(`\n✅ Batch Resolution Complete. ${successCount} new properties successfully mapped to Golden Records.`);
    } else {
      console.log('⚠️ No valid JSON returned by Gemini.');
    }
  } catch (e: any) {
    console.error(`❌ Resolution Failed: ${e.message}`);
  }
}

runBulkResolver();
