import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: ['.env.local', '.env'] });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { count: roofCount } = await supabase.from('roof_properties').select('*', { count: 'exact', head: true });
  const { count: companiesCount } = await supabase.from('management_companies').select('*', { count: 'exact', head: true });
  const { count: contactsCount } = await supabase.from('contacts').select('*', { count: 'exact', head: true });
  const { count: pmCount } = await supabase.from('property_managers').select('*', { count: 'exact', head: true });

  console.log(`Roofs: ${roofCount}`);
  console.log(`Companies: ${companiesCount}`);
  console.log(`Contacts: ${contactsCount}`);
  console.log(`Property Managers (links): ${pmCount}`);
}

checkData();
