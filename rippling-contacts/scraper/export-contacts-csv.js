// rippling-contacts/scraper/export-contacts-csv.js
// ============================================================
// Export enriched contacts from Supabase + local JSON files
// Produces SFDC/Salesloft-ready CSV with persona tier ranking
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

const supabase = createClient(
  'https://tqmpaaxocpwmziivxkym.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || ''
);

function escapeCsv(val) {
  const str = String(val || '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function main() {
  console.log('Exporting contacts to CSV...\n');

  // Try Supabase first, fall back to local JSON
  let contacts = [];

  try {
    let from = 0;
    while (true) {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('audience_source', 'rippling')
        .order('persona_rank', { ascending: true })
        .range(from, from + 999);

      if (error) throw error;
      contacts = contacts.concat(data);
      if (data.length < 1000) break;
      from += 1000;
    }
    console.log(`Loaded ${contacts.length} contacts from Supabase`);
  } catch (e) {
    console.log(`Supabase contacts table not available (${e.message}) — loading from JSON`);
    
    // Fall back to Apollo JSON
    const apolloPath = path.join(DATA_DIR, 'apollo_contacts_raw.json');
    if (existsSync(apolloPath)) {
      const raw = JSON.parse(readFileSync(apolloPath, 'utf-8'));
      contacts = raw.map(c => ({
        full_name: `${c.first_name || ''} ${c.last_name || ''}`.trim(),
        first_name: c.first_name,
        last_name: c.last_name,
        title: c.title,
        email: c.email,
        email_verified: c.email_status === 'verified',
        email_status: c.email_status,
        phone: c.phone_numbers?.[0]?.raw_number,
        linkedin_url: c.linkedin_url,
        organization_name: c._account_name,
        domain: c._account_domain,
        source: 'apollo',
        audience_source: 'rippling',
        persona_rank: c._persona_tier,
        persona_label: c._persona_label,
      }));
      console.log(`Loaded ${contacts.length} contacts from apollo_contacts_raw.json`);
    }

    // Also merge G2 contacts
    const g2Path = path.join(DATA_DIR, 'g2_hr_contacts.json');
    if (existsSync(g2Path)) {
      const g2 = JSON.parse(readFileSync(g2Path, 'utf-8'));
      const g2Mapped = g2.map(c => ({
        full_name: c.name,
        first_name: c.name?.split(' ')[0],
        last_name: c.name?.split(' ').slice(1).join(' '),
        title: c.title,
        email: null,
        email_verified: false,
        email_status: 'unknown',
        phone: null,
        linkedin_url: null,
        organization_name: c.company,
        domain: null,
        source: 'g2_review',
        audience_source: c.audience_source,
        persona_rank: c.persona_rank,
        persona_label: null,
        g2_review_product: c.product,
        g2_pros: c.pros,
        g2_cons: c.cons,
        g2_review_body: c.reviewBody,
      }));
      contacts = contacts.concat(g2Mapped);
      console.log(`+ ${g2Mapped.length} G2 intent contacts`);
    }
  }

  // SFDC-mapped CSV headers
  const headers = [
    'Persona_Rank',
    'Persona_Label',
    'First_Name',
    'Last_Name',
    'Full_Name',
    'Title',
    'Email',
    'Email_Verified',
    'Email_Status',
    'Phone',
    'LinkedIn_URL',
    'Company_Name',
    'Domain',
    'Source',
    'Audience_Source',
    'G2_Review_Product',
    'G2_Pain_Points',     // Use in outreach personalization!
    'Lead_Source',
    'Contact_Status',
  ];

  const rows = contacts.map(c => [
    c.persona_rank || '',
    escapeCsv(c.persona_label || ''),
    escapeCsv(c.first_name || ''),
    escapeCsv(c.last_name || ''),
    escapeCsv(c.full_name || ''),
    escapeCsv(c.title || ''),
    escapeCsv(c.email || ''),
    c.email_verified ? 'TRUE' : 'FALSE',
    escapeCsv(c.email_status || ''),
    escapeCsv(c.phone || ''),
    escapeCsv(c.linkedin_url || ''),
    escapeCsv(c.organization_name || ''),
    escapeCsv(c.domain || ''),
    escapeCsv(c.source || ''),
    escapeCsv(c.audience_source || ''),
    escapeCsv(c.g2_review_product || ''),
    escapeCsv(c.g2_cons || ''),  // Their cons = your pitch
    escapeCsv('Rippling Audience Scrape'),
    escapeCsv('Net New'),
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const outputPath = '/Users/ryan.walker/Desktop/Rippling_Contacts_SFDC.csv';
  writeFileSync(outputPath, csv);

  // Summary stats
  const byTier = {};
  const bySource = {};
  contacts.forEach(c => {
    const t = `Tier ${c.persona_rank || '?'}`;
    byTier[t] = (byTier[t] || 0) + 1;
    bySource[c.source || 'unknown'] = (bySource[c.source || 'unknown'] || 0) + 1;
  });

  console.log(`\n✅ Exported ${contacts.length} contacts to: ${outputPath}`);
  console.log('\nBy Persona Tier:');
  Object.entries(byTier).sort().forEach(([t, n]) => console.log(`  ${t}: ${n}`));
  console.log('\nBy Source:');
  Object.entries(bySource).forEach(([s, n]) => console.log(`  ${s}: ${n}`));
  console.log('\n💡 Import into Salesloft → sequence Tier 1 contacts first (TA Leaders)');
}

main().catch(console.error);
