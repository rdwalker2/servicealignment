import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: ['.env.local', '.env'] });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function purgeMockData() {
  console.log('Purging mock data from database...');
  
  // Due to RLS or constraints, we can use delete with neq null on id to delete all rows
  const { error: pmErr } = await supabase.from('property_managers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (pmErr) console.log('Error deleting property_managers:', pmErr);
  
  const { error: contactErr } = await supabase.from('contacts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (contactErr) console.log('Error deleting contacts:', contactErr);

  const { error: healthErr } = await supabase.from('roof_health_scores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (healthErr) console.log('Error deleting roof_health_scores:', healthErr);

  const { error: roofErr } = await supabase.from('roof_properties').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (roofErr) console.log('Error deleting roof_properties:', roofErr);

  console.log('Purge complete.');
}

purgeMockData();
