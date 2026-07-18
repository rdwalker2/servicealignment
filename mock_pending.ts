import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function seed() {
  const { data, error } = await supabase.from('pending_signals').insert([
    {
      source: 'clay',
      domain: 'rippling.com',
      company_name: 'Rippling',
      raw_data: { employee_count: '2001-5000', current_ats: 'Greenhouse' },
      status: 'pending'
    },
    {
      source: 'rb2b',
      domain: 'deel.com',
      company_name: 'Deel',
      raw_data: { employee_count: '1001-2000', current_ats: 'Lever', score: 85 },
      status: 'pending'
    }
  ]);
  console.log('Seed result:', { data, error });
}
seed();
