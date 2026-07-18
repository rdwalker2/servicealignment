import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config({ path: ['.env.local', '.env'] });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
// Use gemini-2.5-flash with Google Search Grounding to pull real property data from the internet
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  tools: [{ googleSearch: {} } as any] 
});

async function runIdentityResolution() {
  console.log('\n===========================================================');
  console.log(' PREDICTIVE ENGINE: IDENTITY RESOLUTION CRAWLER (REAL DATA)');
  console.log('===========================================================\n');

  // Fetch properties
  const { data: properties, error } = await supabase
    .from('roof_properties')
    .select('*')
    .limit(3); 

  if (error || !properties) {
    console.error('❌ Failed to fetch properties:', error?.message);
    return;
  }

  // Ensure workspace exists for these records (using the first one found or a mock)
  const { data: workspaces } = await supabase.from('workspaces').select('id').limit(1);
  const workspaceId = workspaces && workspaces.length > 0 ? workspaces[0].id : '00000000-0000-0000-0000-000000000000';

  for (const prop of properties) {
    const address = prop.site_address || prop.address || 'Unknown Address';
    console.log(`🏢 Processing Property: ${prop.property_name || address}`);
    console.log(`  🔍 Using Gemini Search Grounding to resolve true identity...`);

    try {
      const prompt = `You are a commercial real estate researcher. Use Google Search to find the property management company or owner for the commercial property located at "${address}".
      If it is a Prologis building, JLL building, CBRE, or Holt Lunsford, state that.
      
      Respond STRICTLY with a JSON object containing:
      - "management_company" (string): The clean name of the company that manages or owns the building (e.g., "Prologis", "JLL", "Holt Lunsford").
      - "confidence" (number): 1-100 score of how sure you are based on the search results.
      - "notes" (string): 1 sentence explanation of where you found it.
      
      JSON OUTPUT ONLY.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const resolved = JSON.parse(jsonMatch[0]);
        console.log(`  ✅ Match Found: ${resolved.management_company} (Confidence: ${resolved.confidence}%)`);
        console.log(`  📝 Notes: ${resolved.notes}`);

        // Insert into management_companies
        const { data: company, error: coErr } = await supabase
          .from('management_companies')
          .insert({
            workspace_id: workspaceId,
            company_name: resolved.management_company,
            hq_domain: `${resolved.management_company.toLowerCase().replace(/\s+/g, '')}.com` // rough guess for prototype
          })
          .select()
          .single();

        if (coErr && coErr.code !== '23505') {
            console.error(`  ❌ DB Error (Company): ${coErr.message}`);
        } else if (company) {
            // We need a dummy contact to satisfy the property_managers join table which requires contact_id
            const { data: dummyContact } = await supabase
              .from('contacts')
              .insert({
                workspace_id: workspaceId,
                management_company_id: company.id,
                first_name: 'Facility',
                last_name: 'Manager',
                job_title: 'Facilities Manager'
              }).select().single();

            if (dummyContact) {
              // Link property to management company
              await supabase
                .from('property_managers')
                .insert({
                  workspace_id: workspaceId,
                  property_id: prop.id,
                  management_company_id: company.id,
                  contact_id: dummyContact.id
                });
              console.log(`  🔗 Successfully linked ${prop.property_name} to ${resolved.management_company} in Golden Record.`);
            }
        }
      } else {
        console.log(`  ⚠️ No valid JSON returned by Gemini.`);
      }
    } catch (e: any) {
      console.error(`  ❌ Resolution Failed: ${e.message}`);
    }
    console.log('');
  }

  console.log('✅ Identity Resolution Complete.');
}

runIdentityResolution();
