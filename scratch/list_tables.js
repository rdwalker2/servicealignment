import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function listTables() {
  const { data, error } = await supabase
    .rpc('get_tables'); // Or try querying directly if they have a view
    
  // A standard way to list tables via JS client if RPC isn't set up is to do a raw query, 
  // but supabase-js doesn't support raw SQL natively.
  // Instead, let's just fetch from 'deals', 'properties', 'persona_map', 'clay_signals' and log which ones work.
  
  const tables = ['accounts', 'deals', 'properties', 'clay_signals', 'persona_map', 'target_properties', 'roof_properties'];
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table '${table}' failed:`, error.message);
    } else {
      console.log(`Table '${table}' EXISTS!`);
    }
  }
}

listTables();
