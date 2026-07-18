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

async function runExpandedSeed() {
  console.log('\n===========================================================');
  console.log(' SEEDING EXPANDED COMMERCIAL PROPERTY MANAGERS (AI DRIVEN)');
  console.log('===========================================================\n');

  // We need a workspace ID
  const { data: workspaces } = await supabase.from('workspaces').select('id').limit(1);
  const workspaceId = workspaces && workspaces.length > 0 ? workspaces[0].id : '00000000-0000-0000-0000-000000000000';

  console.log(`🔍 Asking Gemini to research top national targets for commercial roofing...`);

  const prompt = `You are a sales researcher for a commercial roofing company. 
  Your goal is to build a highly targeted prospect list of the absolute largest national and regional property owners, operators, and facility management firms in the United States that control massive amounts of roof square footage.
  
  Please find and return EXACTLY 50 massive companies across these NEW categories (do not include Prologis, JLL, CBRE, Simon, etc. as we already have them):
  - Big Box Retailers / Home Improvement (e.g. Walmart, Target, Home Depot, Lowe's, Costco)
  - Hospitality & Hotel REITs (e.g. Marriott, Hilton, Host Hotels & Resorts, Park Hotels)
  - Major Grocery Chains (e.g. Kroger, Albertsons, Publix, H-E-B)
  - National Restaurant Franchise Operators (e.g. Flynn Restaurant Group, Carrols)
  - Massive Corporate Campuses / Tech Real Estate (e.g. Amazon Fulfillment, Meta Data Centers, Apple)
  - Entertainment / Theme Park Operators (e.g. Walt Disney Parks, Universal Parks, Six Flags, Cedar Fair)
  - Educational / University Systems (large private university real estate trusts)

  Respond STRICTLY with a JSON array of objects, where each object has:
  - "name" (string): The company name.
  - "domain" (string): Their primary website domain (e.g. "walmart.com").
  - "category" (string): The category of real estate they manage.
  
  JSON ARRAY OUTPUT ONLY. NO MARKDOWN. NO BACKTICKS. JUST THE RAW JSON ARRAY.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      const companies = JSON.parse(jsonMatch[0]);
      console.log(`✅ Gemini returned ${companies.length} high-value target companies! Inserting into Golden Record...\n`);

      let successCount = 0;
      for (const company of companies) {
        // Check if it exists
        const { data: existing } = await supabase
          .from('management_companies')
          .select('id')
          .ilike('company_name', company.name)
          .limit(1);

        if (existing && existing.length > 0) {
          console.log(`  ⚠️ Skipping ${company.name} (Already exists)`);
          continue;
        }

        const { error } = await supabase
          .from('management_companies')
          .insert({
            workspace_id: workspaceId,
            company_name: company.name,
            hq_domain: company.domain,
            total_managed_sqft: 1000000 // Seed with 1M+ sq ft
          });

        if (error) {
           console.error(`  ❌ Error inserting ${company.name}: ${error.message}`);
        } else {
          console.log(`  ✅ Injected Tier 1 Account: ${company.name} [${company.category}]`);
          successCount++;
        }
      }

      console.log(`\n🎉 Expanded Seed Complete. Injected ${successCount} new top-tier corporate accounts into the Golden Record.`);
    } else {
      console.log(`⚠️ No valid JSON returned by Gemini.`);
    }
  } catch (e: any) {
    console.error(`❌ Fetch Failed: ${e.message}`);
  }
}

runExpandedSeed();
