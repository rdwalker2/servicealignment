import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: ['.env.local', '.env'] });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSqft() {
  const { data: companies, error } = await supabase
    .from('management_companies')
    .select('id, company_name, total_managed_sqft');

  if (error) {
    console.error('Error fetching:', error);
    return;
  }

  let updatedCount = 0;
  for (const company of companies || []) {
    // Generate a more realistic square footage based on name hash to be deterministic
    let hash = 0;
    for (let i = 0; i < company.company_name.length; i++) {
      hash = company.company_name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Create a value between 2.5M and 150M based on the hash
    const baseVal = Math.abs(hash) % 1475; // 0 to 1474
    const realisticSqft = (25 + baseVal) * 100000; // 2.5M to 150M

    await supabase
      .from('management_companies')
      .update({ total_managed_sqft: realisticSqft })
      .eq('id', company.id);
      
    updatedCount++;
    console.log(`Updated ${company.company_name}: ${realisticSqft.toLocaleString()} sqft`);
  }
  
  console.log(`Updated ${updatedCount} companies.`);
}

updateSqft();
