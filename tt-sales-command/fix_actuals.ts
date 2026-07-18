import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function main() {
  const repId = 'rep-jl';
  const weekStart = '2026-06-22';
  
  const { data: rows } = await supabase.from('weekly_actuals').select('*').eq('id', `${repId}_${weekStart}`);
  let data;
  if (rows && rows.length > 0) {
    data = rows[0].data;
  } else {
    data = {
      id: `${repId}_${weekStart}`,
      rep_id: repId,
      week_start: weekStart,
      calls: 0,
      emails: 0,
      social_touches: 0,
      conversations: 0,
      meetings_booked: 0,
      discovery_set: 0,
      discovery_held: 0,
      demo_held: 0,
      closed_won: 0,
      revenue: 0,
      ib_won: 0,
      ib_revenue: 0,
      closed_lost: 0
    };
  }
  
  data.closed_won = (data.closed_won || 0) + 1;
  data.revenue = (data.revenue || 0) + 2250;
  data.ib_won = (data.ib_won || 0) + 1;
  data.ib_revenue = (data.ib_revenue || 0) + 2250;

  const payload = {
    id: `${repId}_${weekStart}`,
    rep_id: repId,
    data: data,
    updated_at: new Date().toISOString()
  };
  
  await supabase.from('weekly_actuals').upsert(payload);
  console.log('Fixed Jack\'s weekly actuals for', weekStart);
}
main();
