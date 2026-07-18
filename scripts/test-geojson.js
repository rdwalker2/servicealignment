import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function test() {
  const { data } = await supabase.from('roof_properties').select('id, building_polygon').order('created_at', { ascending: false }).limit(1);
  console.log(data);
}
test();
