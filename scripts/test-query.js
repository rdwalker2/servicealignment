import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY); // use ANON key to simulate frontend

async function test() {
  const { data, error } = await supabase
    .from('roof_properties')
    .select('id, property_name')
    .not('building_polygon', 'is', null);
  
  console.log("Anon Data:", data);
  console.log("Anon Error:", error);
}
test();
