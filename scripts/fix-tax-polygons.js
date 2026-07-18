import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function fix() {
  await supabase.from('county_tax_parcels').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log("Deleted old tax parcels with null polygons.");
}
fix();
