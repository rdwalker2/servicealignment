// Run migration against remote Supabase using the Management API
// Usage: npx tsx migrations/run_002.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tqmpaaxocpwmziivxkym.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!serviceKey) {
  console.error('Set SUPABASE_SERVICE_KEY env var');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  db: { schema: 'public' },
  auth: { persistSession: false },
});

const columns = [
  { name: 'audience_source', type: 'text', default: null },
  { name: 'market', type: 'text', default: null },
  { name: 'firmographic_tier', type: 'text', default: null },
  { name: 'pages_visited_count', type: 'integer', default: null },
  { name: 'session_duration_seconds', type: 'integer', default: null },
  { name: 'visited_pricing', type: 'boolean', default: 'false' },
  { name: 'utm_source', type: 'text', default: null },
  { name: 'utm_campaign', type: 'text', default: null },
  { name: 'utm_medium', type: 'text', default: null },
  { name: 'utm_content', type: 'text', default: null },
  { name: 'is_existing_customer', type: 'boolean', default: 'false' },
  { name: 'account_owner_email', type: 'text', default: null },
];

async function checkColumnExists(colName: string): Promise<boolean> {
  // Try inserting a test value — if column doesn't exist, we get an error
  const { error } = await supabase
    .from('clay_signals')
    .select(colName)
    .limit(1);
  
  return !error;
}

async function run() {
  console.log('Checking existing columns...');
  
  // First, check which columns already exist
  const { data, error } = await supabase
    .from('clay_signals')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('Failed to query clay_signals:', error);
    process.exit(1);
  }

  const existingCols = data && data.length > 0 ? Object.keys(data[0]) : [];
  console.log('Existing columns:', existingCols.length);

  const missing = columns.filter(c => !existingCols.includes(c.name));
  
  if (missing.length === 0) {
    console.log('✅ All columns already exist. No migration needed.');
    return;
  }

  console.log(`Missing columns: ${missing.map(c => c.name).join(', ')}`);
  console.log('\n⚠️  Cannot add columns via REST API. Run this SQL in the Supabase Dashboard SQL Editor:\n');
  
  for (const col of missing) {
    const defaultClause = col.default !== null ? ` DEFAULT ${col.default}` : '';
    console.log(`ALTER TABLE clay_signals ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}${defaultClause};`);
  }
  
  console.log('\nGo to: https://supabase.com/dashboard/project/tqmpaaxocpwmziivxkym/sql/new');
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
