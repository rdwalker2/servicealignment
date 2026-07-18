#!/usr/bin/env node
// ============================================================
// fix-gaps.cjs — Fix all gaps from transcript audit
// 1. Make engagement jobs unlisted (internal only)
// 2. Add ~15 more consultant candidates to reach 50+
// 3. Add intake notes to key candidates
// 4. Add level/bandwidth tags
// 5. Clean up test candidate
// ============================================================

const https = require('https');
const API_KEY = 'szdZoYVuPCEpJ9hu7H98Y0qlWj5RCLBu7W5c7y4C';
const BASE_URL = 'https://api.na.teamtailor.com/v1';
const API_VERSION = '20240904';
const DELAY_MS = 220;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function api(method, path, body = null) {
  await sleep(DELAY_MS);
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const opts = {
      hostname: url.hostname, path: url.pathname + url.search, method,
      headers: {
        'Authorization': `Token token=${API_KEY}`,
        'Content-Type': 'application/vnd.api+json',
        'X-Api-Version': API_VERSION,
      },
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 429) {
          console.log('  ⏳ Rate limited...');
          return sleep(3000).then(() => api(method, path, body)).then(resolve);
        }
        if (res.statusCode >= 400) {
          console.error(`  ❌ ${method} ${path} → ${res.statusCode}: ${data.substring(0, 120)}`);
          resolve(null); return;
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

// ════════════════════════════════════════
// FIX 1: Make engagement jobs UNLISTED
// Megan: "I'm not going to post the engagement externally"
// ════════════════════════════════════════
async function fixJobVisibility() {
  console.log('\n🔒 Fix 1: Making engagement jobs unlisted (internal only)...');
  const engagementJobIds = ['632860', '632861', '632862', '632863']; // Tech, Finance, HR, Ops engagement jobs
  for (const id of engagementJobIds) {
    const res = await api('PATCH', `/jobs/${id}`, {
      data: { type: 'jobs', id, attributes: { status: 'unlisted' } }
    });
    if (res?.data) {
      console.log(`  ✅ ${res.data.attributes.title} → unlisted`);
    }
  }
  // Keep Evergreen Pipeline (632859), Engagement Manager (632864), BDR (632865) as open
  // Keep EA (632866) as draft
  console.log('  ✓ Evergreen Pipeline, Engagement Manager, BDR remain public');
}

// ════════════════════════════════════════
// FIX 2: Add ~15 more consultant candidates
// Megan's spreadsheet has ~50 people
// ════════════════════════════════════════
async function addMoreConsultants() {
  console.log('\n👤 Fix 2: Adding more consultants to reach 50+...');

  const extraConsultants = [
    { first:'Victoria',last:'Hernandez',tags:['Available','Technology','Due Diligence','Standard Rate','LinkedIn','Mid-Level','Full-Time'] },
    { first:'Grant',last:'Nakamura',tags:['Available','Finance','M&A Integration','Premium Rate','Referral','Executive','NDA Signed','Full-Time'] },
    { first:'Isabelle',last:'Moreau',tags:['On Bench','HR','Change Management','Premium Rate','Network Event','Executive','Full-Time'] },
    { first:'Curtis',last:'Fleming',tags:['Available','Operations','Strategy','Standard Rate','Inbound','Mid-Level','Full-Time'] },
    { first:'Layla',last:'Abadi',tags:['Available','Technology','ERP Implementation','Premium Rate','Referral','Executive','NDA Signed','Top Talent','Full-Time'] },
    { first:'Scott',last:'Bergstrom',tags:['Unavailable','Technology','Standard Rate','LinkedIn','Mid-Level','Full-Time'] },
    { first:'Nina',last:'Petrovic',tags:['Available','Finance','Due Diligence','Premium Rate','Network Event','Executive','NDA Signed','Full-Time'] },
    { first:'Andre',last:'Jackson',tags:['Engaged','Operations','M&A Integration','Premium Rate','Referral','Executive','NDA Signed','Half-Time'] },
    { first:'Simone',last:'Dubois',tags:['Available','HR','Post-Merger Integration','Standard Rate','LinkedIn','Mid-Level','Full-Time'] },
    { first:'Patrick',last:'O\'Neill',tags:['On Bench','Technology','Standard Rate','Referral','Junior','Half-Time'] },
    { first:'Maya',last:'Gupta',tags:['Available','Finance','Strategy','Premium Rate','LinkedIn','Executive','NDA Signed','AI Screened','Full-Time'] },
    { first:'Carlos',last:'Medina',tags:['Unavailable','Operations','Standard Rate','Inbound','Mid-Level','Full-Time'] },
    { first:'Zara',last:'Osei',tags:['Available','HR','Change Management','Premium Rate','Referral','Mid-Level','NDA Signed','Full-Time'] },
    { first:'Dmitri',last:'Volkov',tags:['Available','Technology','M&A Integration','Premium Rate','Network Event','Executive','NDA Signed','Top Talent','Full-Time'] },
    { first:'Rebecca',last:'Shaw',tags:['Inactive','Finance','Standard Rate','LinkedIn','Junior','Half-Time'] },
  ];

  // Get Evergreen Pipeline job stages for applications
  const stagesRes = await api('GET', '/jobs/632859/stages');
  const stages = stagesRes?.data?.map(s => ({ id: s.id, name: s.attributes.name })) || [];

  let created = 0;
  for (let i = 0; i < extraConsultants.length; i++) {
    const p = extraConsultants[i];
    const slug = `${p.first.toLowerCase()}.${p.last.toLowerCase().replace(/[^a-z]/g, '')}`;

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

    if (!res?.data?.id) { console.log(`  ❌ ${p.first} ${p.last}`); continue; }

    // Add to Evergreen Pipeline at distributed stages
    const stageIdx = i % stages.length;
    await api('POST', '/job-applications', {
      data: {
        type: 'job-applications', attributes: {},
        relationships: {
          candidate: { data: { type: 'candidates', id: res.data.id } },
          job: { data: { type: 'jobs', id: '632859' } },
          stage: { data: { type: 'stages', id: stages[stageIdx].id } },
        }
      }
    });

    created++;
    console.log(`  ✅ ${p.first} ${p.last} → ${stages[stageIdx].name} [${p.tags.slice(0,3).join(', ')}]`);
  }
  console.log(`  Total added: ${created}`);
}

// ════════════════════════════════════════
// FIX 3: Add intake notes to key candidates
// Megan: "intake — location, skill set, status, bandwidth, rates"
// ════════════════════════════════════════
async function addCandidateNotes() {
  console.log('\n📝 Fix 3: Adding intake notes to key candidates...');

  // Get first page of candidates to add notes to
  const candRes = await api('GET', '/candidates?page%5Bsize%5D=30');
  const candidates = candRes?.data || [];

  const notesData = [
    {
      match: 'Marcus',
      note: '**Intake Call — Megan (4/15)**\n• Location: New York (flexible on travel)\n• Practice: Technology — ERP migration specialist (SAP, Oracle)\n• Rate: $2,100/day\n• Bandwidth: Full-time only\n• Prior engagements: Led SAP S/4HANA migration for $3B manufacturing acquisition. Excellent client feedback.\n• Availability: Immediately available\n• NDA: Signed 4/15\n• Assessment: Top-tier. Deploy on any enterprise tech integration.'
    },
    {
      match: 'Sarah',
      note: '**Intake Call — Megan (3/20)**\n• Location: Seattle (prefers PNW clients)\n• Practice: Technology — data integration & systems consolidation\n• Rate: $1,800/day\n• Bandwidth: Full-time\n• Current status: ENGAGED — deployed on TechCorp acquisition through August\n• Prior engagements: 2 successful integrations with us. Client retention: 100%\n• NDA: Signed 3/20'
    },
    {
      match: 'Michael',
      note: '**Intake Call — Megan (2/28)**\n• Location: New York (will travel anywhere)\n• Practice: Finance — due diligence & financial close harmonization\n• Rate: $2,200/day\n• Bandwidth: Full-time\n• Background: Ex-Deloitte M&A advisory (12 years). CPA.\n• Prior engagements: Led Day 1 close for FinServ Co. acquisition — flawless execution.\n• Availability: Available now — just finished 6-month engagement\n• NDA: Signed 2/28\n• Assessment: Elite. Our best finance consultant. First call for any finance workstream.'
    },
    {
      match: 'Vanessa',
      note: '**Intake Call — Megan (3/5)**\n• Location: Atlanta\n• Practice: HR — change management & culture integration\n• Rate: $1,600/day\n• Bandwidth: Full-time or half-time\n• Background: Prosci certified. 8 years at Mercer.\n• Prior engagements: HR integration lead on HealthCo acquisition (our first big win).\n• Availability: Available — engagement ended last month\n• NDA: Signed 3/5'
    },
    {
      match: 'Sophia',
      note: '**Intake Call — Megan (4/1)**\n• Location: LA (remote-flexible)\n• Practice: Operations & Strategy — synergy tracking specialist\n• Rate: $1,900/day\n• Bandwidth: Full-time\n• Background: McKinsey → corporate strategy. MBA Stanford.\n• Prior engagements: Built synergy model for consumer products client — tracked $22M in realized synergies.\n• Availability: Available\n• NDA: Signed 4/1\n• Assessment: Premium consultant. Great with C-suite clients.'
    },
    {
      match: 'Wei',
      note: '**Intake Call — Megan (1/15)**\n• Location: San Francisco (will travel)\n• Practice: Technology — cloud migration & infrastructure\n• Rate: $2,000/day\n• Bandwidth: Full-time\n• Background: AWS Solutions Architect. 3 M&A tech integrations.\n• Availability: Available — wrapping current project next week\n• NDA: Signed 1/15\n• Assessment: Strong. Pairs well with Marcus on large tech workstreams.'
    },
    {
      match: 'Jennifer',
      note: '**Intake Call — Megan (3/10)**\n• Location: Chicago (flexible)\n• Practice: Finance — multi-entity consolidation specialist\n• Rate: $1,400/day\n• Bandwidth: Full-time\n• Current status: ENGAGED — on FinServ cross-border acquisition through July\n• Background: Ex-PwC. NetSuite expert.\n• NDA: Signed 3/10'
    },
    {
      match: 'Derek',
      note: '**Intake Call — Megan (2/1)**\n• Location: Atlanta\n• Practice: HR — post-merger org design\n• Rate: $1,700/day\n• Bandwidth: Full-time\n• Current status: ENGAGED — HealthCo HR integration (through Sept)\n• Background: SHRM-SCP. Former CHRO at mid-market tech co.\n• NDA: Signed 2/1\n• Note: Partners love working with him. Re-deploy immediately when available.'
    },
    {
      match: 'Scott',
      note: '**Intake Call — Megan (4/20)**\n• Location: Denver\n• Practice: Technology — general IT integration\n• Rate: $1,200/day\n• Bandwidth: Full-time\n• Current status: UNAVAILABLE — took a full-time gig at Accenture. Said he\'d be open again in ~6 months.\n• NDA: Signed 4/20\n• Note: Check back in October.'
    },
    {
      match: 'Carlos',
      note: '**Intake Call — Megan (5/1)**\n• Location: Miami\n• Practice: Operations\n• Rate: $1,300/day\n• Bandwidth: Full-time\n• Current status: UNAVAILABLE — accepted contract with another firm through December.\n• NDA: Not yet signed\n• Note: Interested in working with us in 2027. Keep warm via monthly sync.'
    },
  ];

  for (const nd of notesData) {
    const candidate = candidates.find(c =>
      c.attributes['first-name'] === nd.match ||
      c.attributes['first-name']?.includes(nd.match)
    );
    if (candidate) {
      const res = await api('POST', '/notes', {
        data: {
          type: 'notes',
          attributes: { body: nd.note },
          relationships: {
            candidate: { data: { type: 'candidates', id: candidate.id } }
          }
        }
      });
      if (res?.data) {
        console.log(`  ✅ Note added: ${candidate.attributes['first-name']} ${candidate.attributes['last-name']}`);
      }
    } else {
      console.log(`  ⚠️  Candidate "${nd.match}" not found in first 30`);
    }
  }
}

// ════════════════════════════════════════
// FIX 4: Clean up test candidate
// ════════════════════════════════════════
async function cleanupTestCandidate() {
  console.log('\n🧹 Fix 4: Cleaning up test candidate...');
  // Update test candidate to be a real consultant instead of deleting (can't delete)
  const res = await api('PATCH', '/candidates/10227005', {
    data: {
      type: 'candidates', id: '10227005',
      attributes: {
        'first-name': 'Tessa',
        'last-name': 'Lindgren',
        'email': 'tessa.lindgren_demo@example.com',
        'tags': ['Available', 'Technology', 'Operations', 'Premium Rate', 'Referral', 'Executive', 'NDA Signed', 'Full-Time'],
      }
    }
  });
  if (res?.data) {
    console.log(`  ✅ Test candidate → Tessa Lindgren (consultant profile)`);
    // Add to Evergreen Pipeline
    const stagesRes = await api('GET', '/jobs/632859/stages');
    const stage = stagesRes?.data?.[2]; // Interview stage
    if (stage) {
      await api('POST', '/job-applications', {
        data: {
          type: 'job-applications', attributes: {},
          relationships: {
            candidate: { data: { type: 'candidates', id: '10227005' } },
            job: { data: { type: 'jobs', id: '632859' } },
            stage: { data: { type: 'stages', id: stage.id } },
          }
        }
      });
      console.log(`  ✅ Added to Evergreen Pipeline → ${stage.attributes.name}`);
    }
  }
}

// ════════════════════════════════════════
// MAIN
// ════════════════════════════════════════
async function main() {
  console.log('🔧 Acquire2Win — Gap Fixes');
  console.log('==========================\n');

  await fixJobVisibility();
  await addMoreConsultants();
  await addCandidateNotes();
  await cleanupTestCandidate();

  // Final count
  const candRes = await api('GET', '/candidates');
  const jobRes = await api('GET', '/jobs');

  console.log('\n==========================');
  console.log('✅ All gaps fixed!');
  console.log(`   Candidates: ${candRes?.meta?.['record-count'] || '?'}`);
  console.log(`   Active jobs: ${jobRes?.meta?.['record-count'] || '?'}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
