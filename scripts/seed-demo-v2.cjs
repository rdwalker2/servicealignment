#!/usr/bin/env node
// ============================================================
// seed-demo-v2.cjs — Acquire2Win Demo Instance (Fixed)
// Archives old data, creates Acquire2Win-themed demo content.
// ALL candidate emails use @example.com — ZERO real notifications.
// ============================================================

const https = require('https');

const API_KEY = 'szdZoYVuPCEpJ9hu7H98Y0qlWj5RCLBu7W5c7y4C';
const BASE_URL = 'https://api.na.teamtailor.com/v1';
const API_VERSION = '20240904';
const DELAY_MS = 220;
const DEFAULT_USER_ID = '94880'; // Sophia Martinez (CEO)

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function api(method, path, body = null) {
  await sleep(DELAY_MS);
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'Authorization': `Token token=${API_KEY}`,
        'Content-Type': 'application/vnd.api+json',
        'X-Api-Version': API_VERSION,
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 429) {
          console.log('  ⏳ Rate limited — waiting 3s...');
          return sleep(3000).then(() => api(method, path, body)).then(resolve);
        }
        if (res.statusCode >= 400) {
          console.error(`  ❌ ${method} ${path} → ${res.statusCode}: ${data.substring(0, 120)}`);
          resolve(null);
          return;
        }
        if (res.statusCode === 204) { resolve({ ok: true }); return; }
        try { resolve(JSON.parse(data)); } catch { resolve(data); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// IDs collected during setup
const IDS = { depts: [], locs: [] };

// ════════════════════════════════════════
// PHASE 0: ARCHIVE OLD JOBS
// ════════════════════════════════════════
async function archiveOldJobs() {
  console.log('\n🗑️  Phase 0: Archiving old jobs...');
  const oldJobIds = ['615994', '615996', '615995', '615992', '632855'];
  for (const id of oldJobIds) {
    await api('PATCH', `/jobs/${id}`, {
      data: { type: 'jobs', id, attributes: { status: 'archived' } }
    });
  }
  console.log(`  ✅ Archived ${oldJobIds.length} old jobs`);
}

// ════════════════════════════════════════
// PHASE 1: ORG STRUCTURE
// ════════════════════════════════════════
async function setupOrg() {
  console.log('\n🏢 Phase 1: Org structure (locations + departments already created)...');
  
  // Check if our departments already exist from previous run
  const deptRes = await api('GET', '/departments');
  const existingDepts = deptRes?.data || [];
  
  const wantedDepts = [
    'Technology & Digital',
    'Finance & Accounting', 
    'Human Capital',
    'Operations & Strategy',
    'Internal Team',
  ];
  
  for (const name of wantedDepts) {
    const existing = existingDepts.find(d => d.attributes.name === name);
    if (existing) {
      IDS.depts.push({ id: existing.id, name });
      console.log(`  ✓ Dept exists: ${name} (${existing.id})`);
    } else {
      const res = await api('POST', '/departments', {
        data: { type: 'departments', attributes: { name } }
      });
      if (res?.data?.id) {
        IDS.depts.push({ id: res.data.id, name });
        console.log(`  ✅ Created dept: ${name} (${res.data.id})`);
      }
    }
  }

  // Check locations
  const locRes = await api('GET', '/locations');
  const existingLocs = locRes?.data || [];
  
  const wantedLocs = [
    { name: 'New York', city: 'New York', country: 'United States', headquarters: true },
    { name: 'Atlanta', city: 'Atlanta', country: 'United States' },
    { name: 'Seattle', city: 'Seattle', country: 'United States' },
    { name: 'Los Angeles', city: 'Los Angeles', country: 'United States' },
    { name: 'Remote / Flexible', city: 'Remote', country: 'United States' },
  ];

  for (const loc of wantedLocs) {
    const existing = existingLocs.find(l => l.attributes.name === loc.name || l.attributes.city === loc.city);
    if (existing) {
      IDS.locs.push({ id: existing.id, name: loc.name });
      console.log(`  ✓ Loc exists: ${loc.name} (${existing.id})`);
    } else {
      const res = await api('POST', '/locations', {
        data: { type: 'locations', attributes: loc }
      });
      if (res?.data?.id) {
        IDS.locs.push({ id: res.data.id, name: loc.name });
        console.log(`  ✅ Created loc: ${loc.name} (${res.data.id})`);
      }
    }
  }
}

// Helper to find dept/loc ID
function deptId(keyword) {
  const d = IDS.depts.find(d => d.name.toLowerCase().includes(keyword.toLowerCase()));
  return d?.id || IDS.depts[0]?.id;
}
function locId(keyword) {
  const l = IDS.locs.find(l => l.name.toLowerCase().includes(keyword.toLowerCase()));
  return l?.id || IDS.locs[0]?.id;
}

// ════════════════════════════════════════
// PHASE 2: CREATE JOBS
// ════════════════════════════════════════
async function createJobs() {
  console.log('\n📋 Phase 2: Creating Acquire2Win jobs...');
  
  const templates = [
    {
      title: 'Consultant — Evergreen Pipeline',
      dept: 'technology', loc: 'remote', status: 'open',
      pitch: 'Join our network of elite consultants deployed on post-acquisition integration engagements.',
      body: `<h2>About Acquire2Win</h2>
<p>Acquire2Win is a post-acquisition integration consulting firm helping enterprise and mid-market companies successfully integrate newly acquired businesses. Our consultants are deployed on 3-6 month engagements covering technology, finance, operations, and human capital workstreams.</p>
<h2>What We're Looking For</h2>
<p>We continuously build our consultant pipeline across all practice areas:</p>
<ul>
<li><strong>Technology &amp; Digital:</strong> ERP migration, data integration, systems consolidation</li>
<li><strong>Finance &amp; Accounting:</strong> Financial close harmonization, chart of accounts mapping</li>
<li><strong>Human Capital:</strong> Benefits harmonization, org design, culture integration</li>
<li><strong>Operations &amp; Strategy:</strong> Supply chain optimization, synergy tracking</li>
</ul>
<h2>Engagement Details</h2>
<ul><li>📋 1099 independent contractor</li><li>⏱️ 3-6 month engagements</li><li>🏢 Mix of on-site and remote</li><li>💰 $800-$2,500/day</li><li>🔄 Multiple engagements per year</li></ul>`,
      candidateCount: 22,
    },
    {
      title: 'Senior Technology Integration Consultant',
      dept: 'technology', loc: 'seattle', status: 'open',
      pitch: 'Lead technology workstreams for enterprise M&A integrations.',
      body: `<h2>The Engagement</h2><p>Fortune 500 tech company integrating a $2B acquisition. Lead the application rationalization and data migration workstream.</p>
<h2>What You'll Do</h2><ul><li>Lead technology integration across 200+ applications</li><li>Map source/target architectures and define migration approach</li><li>Report weekly to the Integration Management Office</li></ul>
<h2>Requirements</h2><ul><li>8+ years of technology consulting</li><li>3+ M&A tech integrations completed</li><li>Cloud migration experience preferred</li></ul>
<h2>Details</h2><ul><li>📍 Seattle (hybrid)</li><li>⏱️ 6-month engagement</li><li>💰 $1,800-$2,200/day</li><li>🚀 Start: ASAP</li></ul>`,
      candidateCount: 8,
    },
    {
      title: 'Finance Integration Analyst',
      dept: 'finance', loc: 'new york', status: 'open',
      pitch: 'Support financial close harmonization for a cross-border acquisition.',
      body: `<h2>The Engagement</h2><p>Mid-market financial services company acquiring a European competitor. Support Day 1 financial close and ongoing consolidation.</p>
<h2>What You'll Do</h2><ul><li>Map chart of accounts between entities</li><li>Support first consolidated financial statements</li><li>Coordinate with external auditors</li></ul>
<h2>Requirements</h2><ul><li>CPA preferred; Big 4 a plus</li><li>3-5 years financial reporting or FP&A</li><li>Multi-entity consolidation experience</li></ul>
<h2>Details</h2><ul><li>📍 New York (on-site)</li><li>⏱️ 4 months</li><li>💰 $1,000-$1,400/day</li></ul>`,
      candidateCount: 5,
    },
    {
      title: 'HR Integration & Change Management Lead',
      dept: 'human', loc: 'atlanta', status: 'open',
      pitch: 'Guide the people side of M&A — org design, culture, and communication.',
      body: `<h2>The Engagement</h2><p>Healthcare company integrating 500+ employees from a competitor acquisition. Lead HR integration: org design, benefits harmonization, culture alignment.</p>
<h2>What You'll Do</h2><ul><li>Lead HR integration workstream</li><li>Design combined org structure with client CHRO</li><li>Manage benefits harmonization</li><li>Execute employee communication plan</li></ul>
<h2>Requirements</h2><ul><li>7+ years HR, 2+ in M&A integration</li><li>Change management experience (Prosci a plus)</li></ul>
<h2>Details</h2><ul><li>📍 Atlanta (on-site 4 days/week)</li><li>⏱️ 5 months</li><li>💰 $1,500-$1,800/day</li></ul>`,
      candidateCount: 6,
    },
    {
      title: 'Operations & Synergy Tracking Consultant',
      dept: 'operations', loc: 'los angeles', status: 'open',
      pitch: 'Track and realize the synergies that make acquisitions worth doing.',
      body: `<h2>The Engagement</h2><p>Consumer products company with three tuck-in acquisitions. Build the synergy tracking framework and drive $15M+ in cost synergies.</p>
<h2>What You'll Do</h2><ul><li>Build synergy tracking model</li><li>Lead identification workshops</li><li>Create C-suite dashboards</li><li>Drive procurement quick wins</li></ul>
<h2>Requirements</h2><ul><li>5+ years management consulting</li><li>2+ synergy realization programs</li><li>MBA preferred</li></ul>
<h2>Details</h2><ul><li>📍 Los Angeles (hybrid)</li><li>⏱️ 3 months + extension</li><li>💰 $1,400-$1,800/day</li></ul>`,
      candidateCount: 4,
    },
    {
      title: 'Engagement Manager',
      dept: 'internal', loc: 'new york', status: 'open',
      pitch: 'Manage our highest-value client relationships and consultant deployments.',
      body: `<h2>About the Role</h2><p>Own client relationships and oversee consultant deployments across multiple active engagements. Bridge between clients and our consultant network.</p>
<h2>What You'll Do</h2><ul><li>Manage 5-8 active client engagements</li><li>Match consultants to client needs</li><li>Onboard consultants (NDA, client requirements)</li><li>Manage engagement P&L</li></ul>
<h2>Requirements</h2><ul><li>5+ years consulting/staffing/professional services</li><li>VP/C-suite client relationship experience</li></ul>
<h2>Compensation</h2><ul><li>💰 $130-160K + bonus</li><li>📈 Equity (early employee)</li><li>🌴 Unlimited PTO</li></ul>`,
      candidateCount: 6,
    },
    {
      title: 'Business Development Representative',
      dept: 'internal', loc: 'new york', status: 'open',
      pitch: 'Source new client relationships for a high-growth consulting firm.',
      body: `<h2>About the Role</h2><p>First BDR hire — source new client relationships by researching M&A activity and reaching out to integration leaders.</p>
<h2>What You'll Do</h2><ul><li>Research M&A activity via PitchBook and SEC filings</li><li>Reach out to VPs of Corp Dev and Integration</li><li>Book 10+ qualified meetings/month for Partners</li></ul>
<h2>Requirements</h2><ul><li>1-3 years B2B sales or recruiting experience</li><li>Interest in M&A/consulting/PE</li></ul>
<h2>Compensation</h2><ul><li>💰 $65-80K + quarterly bonus</li><li>📈 Path to Account Executive</li></ul>`,
      candidateCount: 5,
    },
    {
      title: 'Executive Assistant to Partners',
      dept: 'internal', loc: 'new york', status: 'draft',
      pitch: 'Keep four busy Partners organized and clients happy.',
      body: `<h2>About the Role</h2><p>Support 4 founding Partners with scheduling, travel, and client communications. Path to Office Manager / Chief of Staff.</p>
<h2>What You'll Do</h2><ul><li>Manage calendars across 4 time zones</li><li>Coordinate travel for Partners and consultants</li><li>Prepare client meeting materials</li></ul>
<h2>Requirements</h2><ul><li>2+ years EA or ops experience</li><li>Google Workspace proficiency</li></ul>`,
      candidateCount: 3,
    },
  ];

  const jobResults = [];
  for (const t of templates) {
    const res = await api('POST', '/jobs', {
      data: {
        type: 'jobs',
        attributes: { title: t.title, body: t.body, pitch: t.pitch, status: t.status },
        relationships: {
          user: { data: { type: 'users', id: DEFAULT_USER_ID } },
          department: { data: { type: 'departments', id: deptId(t.dept) } },
          location: { data: { type: 'locations', id: locId(t.loc) } },
        }
      }
    });
    if (res?.data?.id) {
      console.log(`  ✅ ${t.title} (${res.data.id})`);
      // Fetch stages
      const stagesRes = await api('GET', `/jobs/${res.data.id}/stages`);
      jobResults.push({
        id: res.data.id,
        title: t.title,
        count: t.candidateCount,
        stages: (stagesRes?.data || []).map(s => ({ id: s.id, name: s.attributes.name })),
      });
    } else {
      console.log(`  ❌ Failed: ${t.title}`);
    }
  }
  return jobResults;
}

// ════════════════════════════════════════
// PHASE 3: CANDIDATES + APPLICATIONS
// ════════════════════════════════════════

// Consultant profiles for the pipeline jobs
const CONSULTANTS = [
  { first:'Marcus',last:'Chen',tags:['Available','Technology','M&A Integration','Premium Rate','NDA Signed','Referral'] },
  { first:'Sarah',last:'Washington',tags:['Engaged','Technology','ERP Implementation','Premium Rate','NDA Signed','LinkedIn'] },
  { first:'David',last:'Park',tags:['Available','Technology','Standard Rate','Referral'] },
  { first:'Priya',last:'Sharma',tags:['On Bench','Technology','ERP Implementation','Premium Rate','NDA Signed','AI Screened','Network Event'] },
  { first:'James',last:'O\'Brien',tags:['Available','Technology','Standard Rate','Inbound'] },
  { first:'Wei',last:'Liu',tags:['Available','Technology','M&A Integration','Premium Rate','Top Talent','Referral'] },
  { first:'Amanda',last:'Foster',tags:['Engaged','Technology','Standard Rate','LinkedIn'] },
  { first:'Raj',last:'Patel',tags:['Available','Technology','ERP Implementation','Premium Rate','NDA Signed','Referral'] },
  { first:'Nicole',last:'Martinez',tags:['On Bench','Technology','Standard Rate','Inbound'] },
  { first:'Chris',last:'Thompson',tags:['Available','Technology','Due Diligence','Standard Rate','LinkedIn'] },
  { first:'Kenji',last:'Tanaka',tags:['Inactive','Technology','M&A Integration','Premium Rate','LinkedIn'] },
  { first:'Lisa',last:'Rodriguez',tags:['Available','Technology','Standard Rate','Referral'] },
  { first:'Michael',last:'Adams',tags:['Available','Finance','Due Diligence','Premium Rate','NDA Signed','Top Talent','Referral'] },
  { first:'Jennifer',last:'Kim',tags:['Engaged','Finance','M&A Integration','Premium Rate','NDA Signed','LinkedIn'] },
  { first:'Robert',last:'Okafor',tags:['Available','Finance','Standard Rate','Inbound'] },
  { first:'Camila',last:'Torres',tags:['On Bench','Finance','Due Diligence','Premium Rate','NDA Signed','Referral'] },
  { first:'Jonathan',last:'Wright',tags:['Available','Finance','Standard Rate','LinkedIn'] },
  { first:'Fatima',last:'Al-Rashid',tags:['Available','Finance','M&A Integration','Premium Rate','Top Talent','Network Event'] },
  { first:'Brian',last:'Sullivan',tags:['Inactive','Finance','Standard Rate','Referral'] },
  { first:'Vanessa',last:'Green',tags:['Available','HR','Change Management','Premium Rate','NDA Signed','Referral'] },
  { first:'Derek',last:'Johnson',tags:['Engaged','HR','Post-Merger Integration','Premium Rate','NDA Signed','LinkedIn'] },
  { first:'Aisha',last:'Williams',tags:['Available','HR','Change Management','Standard Rate','Inbound'] },
  { first:'Ryan',last:'Clark',tags:['On Bench','HR','Standard Rate','Referral'] },
  { first:'Elena',last:'Vasquez',tags:['Available','HR','Change Management','Premium Rate','Top Talent','Network Event'] },
  { first:'Tyler',last:'Mitchell',tags:['Available','HR','Standard Rate','LinkedIn'] },
  { first:'Sophia',last:'Anderson',tags:['Available','Operations','Strategy','Premium Rate','NDA Signed','Referral'] },
  { first:'Daniel',last:'Nguyen',tags:['Engaged','Operations','M&A Integration','Premium Rate','NDA Signed','LinkedIn'] },
  { first:'Ashley',last:'Davis',tags:['Available','Operations','Standard Rate','Inbound'] },
  { first:'Omar',last:'Hassan',tags:['Available','Strategy','Due Diligence','Premium Rate','Top Talent','Referral'] },
  { first:'Rachel',last:'Lee',tags:['On Bench','Operations','Strategy','Standard Rate','LinkedIn'] },
  { first:'Andrew',last:'Campbell',tags:['Inactive','Operations','Standard Rate','Referral'] },
  { first:'Jasmine',last:'Brown',tags:['Available','Strategy','Post-Merger Integration','Premium Rate','NDA Signed','Network Event'] },
  { first:'Nathan',last:'Scott',tags:['Available','Technology','Operations','Standard Rate','Inbound'] },
  { first:'Mia',last:'Taylor',tags:['Engaged','Finance','Strategy','Premium Rate','NDA Signed','LinkedIn'] },
  { first:'Ethan',last:'Garcia',tags:['Available','HR','Operations','Standard Rate','Referral'] },
  { first:'Olivia',last:'Wilson',tags:['Available','Technology','Change Management','Premium Rate','Top Talent','AI Screened','Referral'] },
  { first:'Liam',last:'Murphy',tags:['On Bench','Finance','Operations','Standard Rate','LinkedIn'] },
  { first:'Charlotte',last:'Brooks',tags:['Available','HR','Strategy','Standard Rate','Inbound'] },
  { first:'Alexander',last:'Rivera',tags:['Engaged','Technology','M&A Integration','Premium Rate','NDA Signed','Referral'] },
];

// Internal applicants (no consultant tags)
const INTERNALS = [
  { first:'Hannah',last:'Cooper',tags:['LinkedIn'] },
  { first:'Brandon',last:'Phillips',tags:['Referral'] },
  { first:'Samantha',last:'Reed',tags:['LinkedIn'] },
  { first:'Kevin',last:'Hughes',tags:['Inbound'] },
  { first:'Alexis',last:'Bell',tags:['Referral'] },
  { first:'Jordan',last:'Price',tags:['LinkedIn'] },
  { first:'Taylor',last:'Ross',tags:['Inbound'] },
  { first:'Morgan',last:'Gray',tags:['LinkedIn'] },
  { first:'Casey',last:'Ward',tags:['Referral'] },
  { first:'Avery',last:'Long',tags:['Network Event'] },
  { first:'Riley',last:'Sanders',tags:['LinkedIn'] },
  { first:'Quinn',last:'Flores',tags:['Inbound'] },
  { first:'Drew',last:'Kelly',tags:['Referral'] },
  { first:'Blake',last:'Evans',tags:['LinkedIn'] },
  { first:'Reese',last:'Diaz',tags:['Network Event'] },
  { first:'Charlie',last:'Collins',tags:['Inbound'] },
  { first:'Dakota',last:'Stewart',tags:['Referral'] },
  { first:'Parker',last:'Cruz',tags:['LinkedIn'] },
  { first:'Finley',last:'Gonzalez',tags:['Referral'] },
  { first:'Skyler',last:'Barnes',tags:['Inbound'] },
];

function distributeStages(count, stages) {
  const weights = [0.30, 0.25, 0.22, 0.13, 0.10];
  const result = [];
  let used = 0;
  for (let i = 0; i < Math.min(stages.length, weights.length); i++) {
    const n = i === Math.min(stages.length, weights.length) - 1
      ? count - used
      : Math.max(1, Math.round(count * weights[i]));
    if (used + n > count) break;
    result.push({ stageId: stages[i].id, stageName: stages[i].name, count: n });
    used += n;
  }
  // If we have remainder, add to first stage
  if (used < count && result.length) result[0].count += (count - used);
  return result;
}

async function seedCandidates(jobs) {
  console.log('\n👤 Phase 3: Creating candidates & applications...');
  
  let consultantIdx = 0;
  let internalIdx = 0;
  let totalCreated = 0;

  for (const job of jobs) {
    const isInternal = job.title.includes('Engagement Manager') ||
                       job.title.includes('Business Development') ||
                       job.title.includes('Executive Assistant');
    
    const pool = isInternal ? INTERNALS : CONSULTANTS;
    const startIdx = isInternal ? internalIdx : consultantIdx;
    const available = Math.min(job.count, pool.length - startIdx);
    
    if (available <= 0 || !job.stages.length) {
      console.log(`  ⚠️  Skipping ${job.title} — no candidates or stages`);
      continue;
    }

    console.log(`\n  📋 ${job.title} (${available} candidates):`);
    const dist = distributeStages(available, job.stages);
    let pIdx = startIdx;

    for (const { stageId, stageName, count } of dist) {
      for (let i = 0; i < count && pIdx < pool.length; i++, pIdx++) {
        const p = pool[pIdx];
        const slug = `${p.first.toLowerCase()}.${p.last.toLowerCase().replace(/[^a-z]/g, '')}`;

        // Create candidate with tags inline
        const res = await api('POST', '/candidates', {
          data: {
            type: 'candidates',
            attributes: {
              'first-name': p.first,
              'last-name': p.last,
              'email': `${slug}_demo@example.com`,
              'phone': `+1${String(2000000000 + Math.floor(Math.random() * 8000000000))}`,
              'linkedin-url': `https://linkedin.com/in/${slug}-${Math.floor(Math.random()*9000+1000)}`,
              'tags': p.tags,
            }
          }
        });

        if (!res?.data?.id) {
          console.log(`    ❌ ${p.first} ${p.last}`);
          continue;
        }

        // Create application at stage
        await api('POST', '/job-applications', {
          data: {
            type: 'job-applications',
            attributes: {},
            relationships: {
              candidate: { data: { type: 'candidates', id: res.data.id } },
              job: { data: { type: 'jobs', id: job.id } },
              stage: { data: { type: 'stages', id: stageId } },
            }
          }
        });

        totalCreated++;
        console.log(`    ${stageName}: ${p.first} ${p.last} ✓ [${p.tags.slice(0,3).join(', ')}]`);
      }
    }

    if (isInternal) internalIdx = pIdx;
    else consultantIdx = pIdx;
  }

  console.log(`\n  ✅ Total candidates created: ${totalCreated}`);
}

// ════════════════════════════════════════
// MAIN
// ════════════════════════════════════════
async function main() {
  console.log('🚀 Acquire2Win — Demo Instance Seed (v2)');
  console.log('=========================================');
  console.log('⚠️  ALL emails use @example.com — zero notifications.\n');

  const company = await api('GET', '/company');
  if (!company?.data) { console.error('❌ API fail'); process.exit(1); }
  console.log(`✅ Connected: ${company.data.attributes.name}`);

  await archiveOldJobs();
  await setupOrg();
  const jobs = await createJobs();
  await seedCandidates(jobs);

  console.log('\n=========================================');
  console.log('🎉 Acquire2Win demo instance ready!');
  console.log(`   Jobs created: ${jobs.length}`);
  console.log(`   Departments: ${IDS.depts.length}`);
  console.log(`   Locations: ${IDS.locs.length}`);
  console.log('   Open Teamtailor admin to verify →');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
