import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: ['.env.local', '.env'] });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const topTexasCompanies = [
  { name: 'Prologis Inc.', domain: 'prologis.com' },
  { name: 'Lincoln Property Company', domain: 'lpc.com' },
  { name: 'Blackstone Inc. / Link Logistics', domain: 'linklogistics.com' },
  { name: 'CBRE', domain: 'cbre.com' },
  { name: 'JLL (Jones Lang LaSalle)', domain: 'jll.com' },
  { name: 'Transwestern', domain: 'transwestern.com' },
  { name: 'Cushman & Wakefield', domain: 'cushmanwakefield.com' },
  { name: 'Stream Realty Partners', domain: 'streamrealty.com' },
  { name: 'Holt Lunsford Commercial', domain: 'holtlunsford.com' },
  { name: 'Weitzman', domain: 'weitzmangroup.com' },
  { name: 'Partners', domain: 'partnersrealestate.com' },
  { name: 'Moody Rambin', domain: 'moodyrambin.com' },
  { name: 'Lovett Industrial', domain: 'lovettindustrial.com' },
  { name: 'Henry S. Miller', domain: 'henrysmiller.com' },
  { name: 'Oldham Goodwin', domain: 'oldhamgoodwin.com' },
  { name: 'TXRE Properties', domain: 'txreproperties.com' },
  { name: 'Bradford Commercial Real Estate Services', domain: 'bradford.com' }
];

async function seedCompanies() {
  console.log('\n===========================================================');
  console.log(' SEEDING TOP TEXAS COMMERCIAL PROPERTY MANAGERS');
  console.log('===========================================================\n');

  // We need a workspace ID to insert into the multi-tenant table
  const { data: workspaces } = await supabase.from('workspaces').select('id').limit(1);
  const workspaceId = workspaces && workspaces.length > 0 ? workspaces[0].id : '00000000-0000-0000-0000-000000000000';

  let successCount = 0;

  for (const company of topTexasCompanies) {
    // Check if it exists first because we don't have a unique constraint on company_name to use upsert safely
    const { data: existing } = await supabase
      .from('management_companies')
      .select('id')
      .ilike('company_name', company.name)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`  ⚠️ Skipping ${company.name} (Already exists)`);
      continue;
    }

    const { error } = await supabase
      .from('management_companies')
      .insert({
        workspace_id: workspaceId,
        company_name: company.name,
        hq_domain: company.domain,
        total_managed_sqft: 500000 // Just a seed placeholder > 500k
      });

    if (error) {
       console.error(`  ❌ Error inserting ${company.name}: ${error.message}`);
    } else {
      console.log(`  ✅ Injected Tier 1 Account: ${company.name}`);
      successCount++;
    }
  }

  console.log(`\n🎉 Seed Complete. Injected ${successCount} new top-tier corporate accounts into the Golden Record.`);
}

seedCompanies();
