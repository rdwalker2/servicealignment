import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function main() {
  const { data } = await supabase.from('discovery_sessions').select('*').ilike('data->>company_name', '%Economic%');
  console.log(data?.[0]?.data?.deal_stage, data?.[0]?.data?.pipeline_stage, data?.[0]?.data?.completed_at, data?.[0]?.data?.deal_value);
}
main();
