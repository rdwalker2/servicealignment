// rippling-contacts/scraper/apollo-contact-enricher.js
// ============================================================
// Apollo.io contact enricher — deployed against Rippling accounts in Supabase
// Targets: VP/Director TA, CHRO, VP People, HR Ops at 2,722 Rippling accounts
// Uses the correct 2026 endpoint: mixed_people/api_search (not deprecated people/search)
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

const SUPABASE_URL = 'https://tqmpaaxocpwmziivxkym.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const APOLLO_API_KEY = process.env.APOLLO_API_KEY;

if (!SUPABASE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1); }
if (!APOLLO_API_KEY) { console.error('Missing APOLLO_API_KEY'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Persona tier definitions — priority 1 is contacted first
const PERSONA_TIERS = [
  {
    tier: 1,
    label: 'champion_ta',
    description: 'TA/Recruiting Leader — primary champion',
    titles: [
      'VP of Talent Acquisition', 'VP Talent Acquisition',
      'Director of Talent Acquisition', 'Director Talent Acquisition',
      'Head of Talent Acquisition', 'Head of Recruiting',
      'Talent Acquisition Manager', 'Recruiting Manager',
      'Director of Recruiting', 'VP of Recruiting',
    ],
    seniorities: ['vp', 'director', 'manager'],
  },
  {
    tier: 2,
    label: 'economic_buyer',
    description: 'CHRO / VP People — economic buyer',
    titles: [
      'Chief People Officer', 'CHRO', 'Chief Human Resources Officer',
      'VP of People', 'VP of Human Resources', 'Head of People',
      'VP of HR', 'Director of People', 'VP People',
    ],
    seniorities: ['c_suite', 'vp'],
  },
  {
    tier: 3,
    label: 'hr_ops_gatekeeper',
    description: 'HR Ops / HRIS — technical gatekeeper',
    titles: [
      'HR Operations Manager', 'People Operations Manager',
      'HRIS Manager', 'HR Systems Manager', 'HR Technology Manager',
      'HR Director', 'Human Resources Manager', 'HR Manager',
      'People Operations', 'HR Business Partner',
    ],
    seniorities: ['director', 'manager', 'senior'],
  },
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function apolloSearch(domain, titles, seniorities) {
  const url = 'https://api.apollo.io/api/v1/mixed_people/search';
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY,
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({
        q_organization_domains_list: [domain],
        person_titles: titles,
        person_seniorities: seniorities,
        page: 1,
        per_page: 10,
        // Only US contacts
        person_locations: ['United States'],
      }),
    });

    if (res.status === 429) {
      console.log('  Rate limited — waiting 10s...');
      await sleep(10000);
      return null;
    }

    if (!res.ok) {
      const text = await res.text();
      console.error(`  Apollo error ${res.status}: ${text.substring(0, 200)}`);
      return null;
    }

    const data = await res.json();
    return data.people || [];
  } catch (e) {
    console.error(`  Apollo fetch error: ${e.message}`);
    return null;
  }
}

function mapPersonaFromTitle(title) {
  if (!title) return { tier: 4, label: 'other' };
  const t = title.toLowerCase();
  if (['talent acquisition', 'recruiting', 'recruiter'].some(k => t.includes(k))) {
    return { tier: 1, label: 'champion_ta' };
  }
  if (['chief people', 'chro', 'vp of people', 'vp people', 'head of people', 'vp of hr', 'vp of human'].some(k => t.includes(k))) {
    return { tier: 2, label: 'economic_buyer' };
  }
  if (['hr ops', 'hris', 'hr system', 'hr operation', 'people operation', 'hr director', 'hr manager', 'hr business'].some(k => t.includes(k))) {
    return { tier: 3, label: 'hr_ops_gatekeeper' };
  }
  return { tier: 4, label: 'other' };
}

async function upsertContacts(contacts, domain) {
  if (!contacts.length) return 0;
  
  const rows = contacts.map(c => ({
    domain,
    full_name: `${c.first_name || ''} ${c.last_name || ''}`.trim(),
    first_name: c.first_name || null,
    last_name: c.last_name || null,
    title: c.title || null,
    seniority: c.seniority || null,
    linkedin_url: c.linkedin_url || null,
    email: c.email || null,
    email_verified: c.email_status === 'verified',
    email_status: c.email_status || null,
    phone: c.phone_numbers?.[0]?.raw_number || null,
    organization_name: c.organization?.name || null,
    source: 'apollo',
    audience_source: 'rippling',
    persona_rank: mapPersonaFromTitle(c.title).tier,
    persona_label: mapPersonaFromTitle(c.title).label,
    apollo_id: c.id || null,
    enriched_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('contacts')
    .upsert(rows, { onConflict: 'apollo_id', ignoreDuplicates: true });

  if (error) {
    // Table may not exist yet — log and continue
    if (error.code === '42P01') {
      console.error('  contacts table does not exist — will save to JSON only');
      return 0;
    }
    console.error(`  Supabase upsert error: ${error.message}`);
    return 0;
  }
  return rows.length;
}

async function main() {
  console.log('Apollo Contact Enricher — Rippling Accounts');
  console.log('============================================\n');

  // Load resume state
  const progressPath = path.join(DATA_DIR, 'apollo_progress.json');
  let progress = { processed: [], contacts_found: 0 };
  if (existsSync(progressPath)) {
    progress = JSON.parse(readFileSync(progressPath, 'utf-8'));
    console.log(`Resuming — ${progress.processed.length} accounts already processed`);
  }

  const processedSet = new Set(progress.processed);

  // Fetch all Rippling accounts from Supabase
  console.log('Fetching Rippling accounts from Supabase...');
  let allAccounts = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('accounts')
      .select('domain, company_name, employee_count, employee_range, industry, city, state')
      .eq('audience_source', 'rippling')
      .not('domain', 'is', null)
      .range(from, from + 999);

    if (error) { console.error(error.message); break; }
    allAccounts = allAccounts.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }

  console.log(`Loaded ${allAccounts.length} Rippling accounts\n`);

  // Filter to target size range (if desired — comment out to run all)
  // const targeted = allAccounts.filter(a => a.employee_count >= 100 && a.employee_count <= 500);
  const targeted = allAccounts; // Run all for now
  const toProcess = targeted.filter(a => a.domain && !processedSet.has(a.domain));

  console.log(`Processing ${toProcess.length} accounts (${targeted.length - toProcess.length} already done)\n`);

  const allContacts = [];
  let totalFound = progress.contacts_found;

  for (let i = 0; i < toProcess.length; i++) {
    const account = toProcess[i];
    
    if ((i + 1) % 50 === 0) {
      console.log(`\nProgress: ${i+1}/${toProcess.length} | Contacts found: ${totalFound}`);
      // Save progress
      progress.processed = [...processedSet];
      progress.contacts_found = totalFound;
      writeFileSync(progressPath, JSON.stringify(progress, null, 2));
      writeFileSync(path.join(DATA_DIR, 'apollo_contacts_raw.json'), JSON.stringify(allContacts, null, 2));
    }

    const domainContacts = [];

    // Run each persona tier search
    for (const persona of PERSONA_TIERS) {
      const people = await apolloSearch(account.domain, persona.titles, persona.seniorities);
      
      if (people && people.length > 0) {
        people.forEach(p => {
          p._persona_tier = persona.tier;
          p._persona_label = persona.label;
          p._account_domain = account.domain;
          p._account_name = account.company_name;
        });
        domainContacts.push(...people);
      }

      await sleep(1100); // Apollo rate limit: ~1 req/sec
    }

    // Dedupe by person ID within this domain
    const seen = new Set();
    const uniqueContacts = domainContacts.filter(p => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    if (uniqueContacts.length > 0) {
      console.log(`  ✅ ${account.domain} → ${uniqueContacts.length} contacts (${account.company_name})`);
      allContacts.push(...uniqueContacts);
      totalFound += uniqueContacts.length;
      await upsertContacts(uniqueContacts, account.domain);
    }

    processedSet.add(account.domain);
  }

  // Final save
  progress.processed = [...processedSet];
  progress.contacts_found = totalFound;
  writeFileSync(progressPath, JSON.stringify(progress, null, 2));
  writeFileSync(path.join(DATA_DIR, 'apollo_contacts_raw.json'), JSON.stringify(allContacts, null, 2));

  // Stats
  const tier1 = allContacts.filter(c => c._persona_tier === 1).length;
  const tier2 = allContacts.filter(c => c._persona_tier === 2).length;
  const tier3 = allContacts.filter(c => c._persona_tier === 3).length;

  console.log(`\n✅ Apollo enrichment complete`);
  console.log(`   Total contacts found: ${totalFound}`);
  console.log(`   Tier 1 (TA Leaders): ${tier1}`);
  console.log(`   Tier 2 (CHRO/VP People): ${tier2}`);
  console.log(`   Tier 3 (HR Ops): ${tier3}`);
  console.log(`   Coverage rate: ${Math.round(processedSet.size / allAccounts.length * 100)}%`);
  console.log(`\nNext: run g2-review-miner.js for intent overlay`);
}

main().catch(console.error);
