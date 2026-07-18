import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function main() {
  const { data } = await supabase.from('discovery_sessions').select('*');
  if (data) {
    const deal = data.find((row: any) => row.data.company_name?.toLowerCase().includes('economic'));
    console.log(JSON.stringify(deal, null, 2));
  }
}
main();
