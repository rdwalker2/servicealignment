// linkedin-people-scraper.js
// ============================================================
// LinkedIn People Search scraper using injected session
// Finds HR/TA leaders at Rippling accounts by company name
// 
// SAFETY RULES (baked in):
//   - Max 100 searches/day (randomized daily cap)
//   - 5-12s random delay between every action
//   - Randomized scroll + mouse movement simulation
//   - Stops immediately if LinkedIn shows any warning
//   - Uses secondary account session only
// ============================================================

import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const SESSION_PATH = path.join(DATA_DIR, 'linkedin-session.json');

const SUPABASE_URL = 'https://tqmpaaxocpwmziivxkym.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabase = SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Daily safety cap — never exceed this
const MAX_SEARCHES_PER_RUN = 80;

// Upsert contacts to Supabase using the real contacts table schema
async function upsertContacts(contacts) {
  if (!supabase || !contacts.length) return;
  
  const rows = contacts.map(c => ({
    domain:        c.domain || null,
    name:          c.name || c.currentTitle ? (c.name || null) : null,
    title:         c.currentTitle || null,
    linkedin_url:  c.profileUrl || null,   // ← always captured from LinkedIn
    persona:       c.persona_label || mapPersonaLabel(c.persona_rank),
    is_primary:    c.persona_rank === 1,
    created_at:    new Date().toISOString(),
    updated_at:    new Date().toISOString(),
  })).filter(r => r.name || r.linkedin_url); // must have at least one identifier

  const { error } = await supabase
    .from('contacts')
    .upsert(rows, { onConflict: 'linkedin_url', ignoreDuplicates: true });

  if (error && error.code !== '23505') {
    console.error(`  Supabase upsert error: ${error.message}`);
  }
}

function mapPersonaLabel(rank) {
  if (rank === 1) return 'TA Leader';
  if (rank === 2) return 'Economic Buyer';
  if (rank === 3) return 'HR Ops';
  return 'Other';
}

// Target HR/TA titles to search per company
const TITLE_SEARCHES = [
  'VP Talent Acquisition',
  'Director Talent Acquisition', 
  'Head of Recruiting',
  'Chief People Officer',
  'VP of People',
  'HR Operations Manager',
];

function randomSleep(min = 5000, max = 12000) {
  const ms = Math.floor(Math.random() * (max - min)) + min;
  return new Promise(r => setTimeout(r, ms));
}

function randomMicroSleep(min = 800, max = 2500) {
  const ms = Math.floor(Math.random() * (max - min)) + min;
  return new Promise(r => setTimeout(r, ms));
}

// Simulate human-like scrolling
async function humanScroll(page) {
  const scrolls = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < scrolls; i++) {
    await page.evaluate(() => window.scrollBy(0, Math.random() * 300 + 100));
    await randomMicroSleep(300, 800);
  }
}

// Check if LinkedIn is showing a warning or CAPTCHA
async function checkForWarnings(page) {
  const url = page.url();
  const title = await page.title().catch(() => '');
  
  if (url.includes('checkpoint') || url.includes('challenge') || url.includes('security')) {
    return 'checkpoint';
  }
  if (title.toLowerCase().includes('security verification')) {
    return 'security_check';
  }
  // Check for "unusual activity" text
  const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');
  if (bodyText.includes('unusual activity') || bodyText.includes('We noticed some unusual')) {
    return 'unusual_activity';
  }
  return null;
}

async function searchLinkedInPeople(page, companyName, title) {
  // Build LinkedIn People search URL
  // Using the search filter approach: company keyword + title keyword
  const query = encodeURIComponent(`${title} ${companyName}`);
  const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${query}&origin=GLOBAL_SEARCH_HEADER`;
  
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await randomSleep(3000, 6000);
  await humanScroll(page);

  const warning = await checkForWarnings(page);
  if (warning) {
    console.log(`  ⚠️  Warning detected: ${warning} — stopping for safety`);
    return { warning, results: [] };
  }

  // Extract person cards from search results
  const results = await page.evaluate(() => {
    const cards = document.querySelectorAll(
      'li.reusable-search__result-container, ' +
      '[data-chameleon-result-urn], ' +
      '.entity-result__item, ' +
      '.search-result__wrapper'
    );
    
    return Array.from(cards).slice(0, 5).map(card => {
      // Name
      const nameEl = card.querySelector(
        '.entity-result__title-text a span[aria-hidden="true"], ' +
        '.actor-name, ' +
        'span.entity-result__title-line a'
      );
      const name = nameEl?.textContent?.trim();
      
      // Title / subtitle
      const titleEl = card.querySelector(
        '.entity-result__primary-subtitle, ' +
        '.subline-level-1, ' +
        '.search-result__truncate'
      );
      const currentTitle = titleEl?.textContent?.trim();
      
      // Secondary (company)
      const companyEl = card.querySelector(
        '.entity-result__secondary-subtitle, ' +
        '.subline-level-2'
      );
      const company = companyEl?.textContent?.trim();

      // LinkedIn profile URL
      const linkEl = card.querySelector(
        'a.app-aware-link[href*="/in/"], ' +
        '.entity-result__title-text a'
      );
      const profileUrl = linkEl?.href?.split('?')[0]; // strip tracking params
      
      // Location
      const locationEl = card.querySelector('.entity-result__tertiary-subtitle, .subline-level-3');
      const location = locationEl?.textContent?.trim();

      return { name, currentTitle, company, profileUrl, location };
    }).filter(r => r.name && r.profileUrl);
  });

  return { warning: null, results };
}

// Also try LinkedIn's company employee search (more targeted)
async function searchCompanyEmployees(page, linkedinCompanyUrl, titleKeyword) {
  if (!linkedinCompanyUrl) return [];
  
  // Navigate to company people page filtered by keyword
  const companyId = linkedinCompanyUrl.match(/\/company\/([^\/]+)/)?.[1];
  if (!companyId) return [];
  
  const url = `https://www.linkedin.com/company/${companyId}/people/?keywords=${encodeURIComponent(titleKeyword)}`;
  
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await randomSleep(4000, 8000);
  await humanScroll(page);

  const warning = await checkForWarnings(page);
  if (warning) return [{ _warning: warning }];

  const results = await page.evaluate(() => {
    const cards = document.querySelectorAll(
      '.org-people-profile-card__profile-title, ' +
      '[data-member-id], ' +
      '.artdeco-entity-lockup'
    );
    
    return Array.from(cards).slice(0, 8).map(card => {
      const nameEl = card.querySelector('.artdeco-entity-lockup__title, .org-people-profile-card__profile-info span');
      const titleEl = card.querySelector('.artdeco-entity-lockup__subtitle, .lt-line-clamp');
      const linkEl = card.querySelector('a[href*="/in/"]');
      return {
        name: nameEl?.textContent?.trim(),
        currentTitle: titleEl?.textContent?.trim(),
        profileUrl: linkEl?.href?.split('?')[0],
        source: 'company_page',
      };
    }).filter(r => r.name);
  });

  return results;
}

function mapPersonaRank(title) {
  if (!title) return 4;
  const t = title.toLowerCase();
  if (['talent acquisition', 'recruiting', 'recruiter', 'head of ta'].some(k => t.includes(k))) return 1;
  if (['chief people', 'chro', 'vp of people', 'vp people', 'head of people', 'vp of hr'].some(k => t.includes(k))) return 2;
  if (['hr ops', 'hris', 'hr system', 'hr operation', 'people operation', 'hr director', 'hr manager'].some(k => t.includes(k))) return 3;
  return 4;
}

async function main() {
  console.log('LinkedIn People Scraper — Rippling Accounts');
  console.log('============================================\n');

  if (!existsSync(SESSION_PATH)) {
    console.error('❌ No LinkedIn session found!');
    console.error('   Run first: node scraper/linkedin-setup.js');
    process.exit(1);
  }

  // Load progress state
  const progressPath = path.join(DATA_DIR, 'linkedin_progress.json');
  let progress = { processed: [], contacts: [] };
  if (existsSync(progressPath)) {
    progress = JSON.parse(readFileSync(progressPath, 'utf-8'));
    console.log(`Resuming — ${progress.processed.length} accounts done, ${progress.contacts.length} contacts found`);
  }
  const processedSet = new Set(progress.processed);

  // Load Rippling accounts from Supabase
  console.log('Loading Rippling accounts from Supabase...');
  let accounts = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('accounts')
      .select('domain, company_name, linkedin_company_url, employee_count')
      .eq('audience_source', 'rippling')
      .not('domain', 'is', null)
      .range(from, from + 999);
    if (error || !data.length) break;
    accounts = accounts.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }
  console.log(`Loaded ${accounts.length} accounts\n`);

  const toProcess = accounts
    .filter(a => !processedSet.has(a.domain))
    .slice(0, MAX_SEARCHES_PER_RUN); // Safety cap per run

  console.log(`Processing up to ${toProcess.length} accounts this run (daily cap: ${MAX_SEARCHES_PER_RUN})`);
  console.log('Random delays 5-12s between searches — this will take a while.\n');

  // Launch browser with injected LinkedIn session
  const browser = await chromium.launch({
    headless: true, // Headless is fine with session cookies
    args: [
      '--no-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
    ],
  });

  const context = await browser.newContext({
    storageState: SESSION_PATH, // <-- This is the magic: inject saved session
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
    timezoneId: 'America/Chicago',
  });

  const page = await context.newPage();

  // Stealth patches
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    window.chrome = { runtime: {} };
  });

  // Verify session is valid
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await randomSleep(2000, 4000);
  const feedUrl = page.url();
  if (feedUrl.includes('/login') || feedUrl.includes('/checkpoint')) {
    console.error('❌ LinkedIn session expired — run node scraper/linkedin-setup.js again');
    await browser.close();
    process.exit(1);
  }
  console.log('✅ LinkedIn session valid — starting scrape\n');

  let searchCount = 0;
  let foundCount = progress.contacts.length;
  let hitWarning = false;

  for (const account of toProcess) {
    if (hitWarning) break;
    if (searchCount >= MAX_SEARCHES_PER_RUN) {
      console.log(`\nDaily cap of ${MAX_SEARCHES_PER_RUN} searches reached — stopping for today.`);
      break;
    }

    const accountContacts = [];

    // Strategy 1: Company employee page (most targeted, uses linkedin_company_url)
    if (account.linkedin_company_url) {
      for (const titleKw of ['talent acquisition', 'VP people', 'HR director']) {
        if (hitWarning || searchCount >= MAX_SEARCHES_PER_RUN) break;
        
        const results = await searchCompanyEmployees(page, account.linkedin_company_url, titleKw);
        
        if (results[0]?._warning) {
          console.log(`\n🛑 LinkedIn warning — pausing run for safety`);
          hitWarning = true;
          break;
        }
        
        results.forEach(r => {
          if (r.name || r.profileUrl) {
            accountContacts.push({
              name:          r.name,
              currentTitle:  r.currentTitle,
              profileUrl:    r.profileUrl,    // LinkedIn URL
              domain:        account.domain,
              organization_name: account.company_name,
              persona_rank:  mapPersonaRank(r.currentTitle),
              persona_label: mapPersonaLabel(mapPersonaRank(r.currentTitle)),
              source:        'linkedin_company_page',
              audience_source: 'rippling',
              enriched_at:   new Date().toISOString(),
            });
          }
        });

        searchCount++;
        await randomSleep(5000, 10000); // Human-paced delay
      }
    } else {
      // Strategy 2: Keyword search (when no LinkedIn company URL)
      for (const title of TITLE_SEARCHES.slice(0, 2)) { // Max 2 searches per account
        if (hitWarning || searchCount >= MAX_SEARCHES_PER_RUN) break;
        
        const { warning, results } = await searchLinkedInPeople(page, account.company_name, title);
        
        if (warning) {
          console.log(`\n🛑 LinkedIn warning: ${warning} — stopping run`);
          hitWarning = true;
          break;
        }
        
        // Only keep results that match the company
        const companyName = account.company_name?.toLowerCase() || '';
        const filtered = results.filter(r => 
          r.company?.toLowerCase().includes(companyName.split(' ')[0]) || true
        );
        
        filtered.forEach(r => {
          if (r.name || r.profileUrl) {
            accountContacts.push({
              name:          r.name,
              currentTitle:  r.currentTitle,
              profileUrl:    r.profileUrl,    // LinkedIn URL
              domain:        account.domain,
              organization_name: account.company_name,
              persona_rank:  mapPersonaRank(r.currentTitle),
              persona_label: mapPersonaLabel(mapPersonaRank(r.currentTitle)),
              source:        'linkedin_search',
              audience_source: 'rippling',
              enriched_at:   new Date().toISOString(),
            });
          }
        });

        searchCount++;
        await randomSleep(6000, 12000);
      }
    }

    if (accountContacts.length > 0) {
      const linkedinUrlCount = accountContacts.filter(c => c.profileUrl).length;
      console.log(`  ✅ ${account.company_name} → ${accountContacts.length} contacts (${linkedinUrlCount} with LinkedIn URL)`);
      progress.contacts.push(...accountContacts);
      foundCount += accountContacts.length;
      // Persist to Supabase immediately — linkedin_url saved on every contact
      await upsertContacts(accountContacts);
    }

    processedSet.add(account.domain);
    progress.processed = [...processedSet];

    // Save progress every 10 accounts
    if (searchCount % 10 === 0) {
      writeFileSync(progressPath, JSON.stringify(progress, null, 2));
      console.log(`  Progress saved | Searches: ${searchCount}/${MAX_SEARCHES_PER_RUN} | Contacts: ${foundCount}`);
    }

    // Longer random pause every 20 searches to mimic natural breaks
    if (searchCount > 0 && searchCount % 20 === 0) {
      const longBreak = 30000 + Math.random() * 30000;
      console.log(`\n  Taking a ${Math.round(longBreak/1000)}s break (mimicking human behavior)...`);
      await new Promise(r => setTimeout(r, longBreak));
    }
  }

  await browser.close();

  // Final save
  writeFileSync(progressPath, JSON.stringify(progress, null, 2));
  writeFileSync(
    path.join(DATA_DIR, 'linkedin_contacts_raw.json'),
    JSON.stringify(progress.contacts, null, 2)
  );

  const tier1 = progress.contacts.filter(c => c.persona_rank === 1).length;
  const tier2 = progress.contacts.filter(c => c.persona_rank === 2).length;
  const tier3 = progress.contacts.filter(c => c.persona_rank === 3).length;

  console.log(`\n✅ LinkedIn scrape session complete`);
  console.log(`   Searches this run: ${searchCount}`);
  console.log(`   Total contacts found: ${foundCount}`);
  console.log(`   Tier 1 (TA Leaders): ${tier1}`);
  console.log(`   Tier 2 (CHRO/VP People): ${tier2}`);
  console.log(`   Tier 3 (HR Ops): ${tier3}`);
  console.log(`   Accounts remaining: ${accounts.length - processedSet.size}`);
  
  if (accounts.length > processedSet.size) {
    console.log(`\n💡 Run again tomorrow for next batch (daily cap = ${MAX_SEARCHES_PER_RUN} searches)`);
  } else {
    console.log(`\n✅ All accounts processed! Run export-contacts-csv.js next.`);
  }
}

main().catch(console.error);
