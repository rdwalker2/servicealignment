import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function main() {
  const { data: actuals } = await supabase.from('weekly_actuals').select('*').eq('rep_id', 'rep-jl');
  console.log("Jack's weekly actuals:");
  actuals?.forEach(r => console.log(r.data.week_start, r.data.revenue, r.data.closed_won));
}
main();
