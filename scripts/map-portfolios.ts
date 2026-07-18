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

async function mapPortfolios() {
  console.log('\n===========================================================');
  console.log(' PREDICTIVE ENGINE: GEOSPATIAL PORTFOLIO MAPPER');
  console.log('===========================================================\n');

  // Fetch top 10 companies to map first
  const { data: companies, error } = await supabase
    .from('management_companies')
    .select('id, company_name, workspace_id')
    .order('total_managed_sqft', { ascending: false })
    .limit(10);

  if (error || !companies) {
    console.error('❌ Failed to fetch companies:', error?.message);
    return;
  }

  console.log(`Found ${companies.length} target accounts to map...`);

  for (const company of companies) {
    console.log(`\n🏢 Mapping Portfolio for: ${company.company_name}`);
    
    try {
      const prompt = `You are a commercial real estate analyst. Use Google Search to find 2 to 3 actual physical commercial property locations owned, operated, or managed by "${company.company_name}" in the state of Texas (specifically Dallas, Fort Worth, Austin, or Houston if possible).
      
      Respond STRICTLY with a JSON array containing objects with:
      - "property_name" (string): A descriptive name (e.g. "Prologis Stemmons", "Walmart Supercenter #123")
      - "address" (string): The full street address including city, state, zip.
      - "sqft" (number): An estimate of the square footage of the building. (e.g. 150000)
      - "tax_owner_shell" (string): A plausible LLC name for the tax owner (e.g. "COMMERCIAL BUILDING ${company.company_name.toUpperCase().substring(0,3)} LLC")
      
      JSON ARRAY OUTPUT ONLY. No markdown, no introductory text.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const properties = JSON.parse(jsonMatch[0]);
        console.log(`  ✅ Found ${properties.length} physical properties.`);

        for (const prop of properties) {
          // 1. Insert into roof_properties
          const { data: newRoof, error: roofErr } = await supabase
            .from('roof_properties')
            .insert({
              workspace_id: company.workspace_id,
              property_name: prop.property_name,
              site_address: prop.address,
              square_footage: prop.sqft,
              industry: 'Commercial',
              legal_owner_name: prop.tax_owner_shell
            })
            .select()
            .single();

          if (roofErr) {
            console.error(`  ❌ Error inserting roof: ${roofErr.message}`);
            continue;
          }

          if (newRoof) {
            // 2. Generate Baseline Roof Health Score (simulate 75-100 for baseline)
            const baselineScore = Math.floor(Math.random() * 25) + 75;
            
            await supabase
              .from('roof_health_scores')
              .insert({
                workspace_id: company.workspace_id,
                property_id: newRoof.id,
                health_score: baselineScore,
                score_factors: { baseline: 'Visual assessment pending', age: '10 years' }
              });

            // 3. We need a dummy contact for the property_managers join table
            const { data: dummyContact } = await supabase
              .from('contacts')
              .insert({
                workspace_id: company.workspace_id,
                management_company_id: company.id,
                first_name: 'Facility',
                last_name: 'Manager',
                job_title: 'Facilities Manager'
              }).select().single();

            // 4. Link Property to Company
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

            console.log(`    🔗 Linked: ${prop.property_name} -> ${company.company_name} (Score: ${baselineScore})`);
          }
        }
      } else {
        console.log(`  ⚠️ No valid JSON returned by Gemini.`);
      }
    } catch (e: any) {
      console.error(`  ❌ Mapping Failed: ${e.message}`);
    }
    
    // Slight delay to prevent rate limits
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n✅ Portfolio Mapping Complete.');
}

mapPortfolios();
