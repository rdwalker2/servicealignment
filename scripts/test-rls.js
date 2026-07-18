import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function test() {
  const { data: workspaces } = await supabase.from('workspaces').select('id');
  console.log("Workspaces:", workspaces);
  
  const { data: users } = await supabase.from('workspace_users').select('*');
  console.log("Users:", users);

  const { data: roofs } = await supabase.from('roof_properties').select('id, workspace_id');
  console.log("Roofs:", roofs.length);
}
test();
