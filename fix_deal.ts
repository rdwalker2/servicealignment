import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function main() {
  const { data } = await supabase.from('discovery_sessions').select('*');
  if (data) {
    const row = data.find((row: any) => row.data.company_name?.toLowerCase().includes('economic'));
    if (row) {
      const deal = row.data;
      deal.deal_value = 2250;
      deal.deal_stage = 'closed_won';
      deal.completed_at = new Date().toISOString();
      await supabase.from('discovery_sessions').update({ data: deal }).eq('id', row.id);
      console.log('Fixed deal:', deal.company_name);
    }
  }
}
main();
