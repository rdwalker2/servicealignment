#!/usr/bin/env node
// ============================================================
// seed-demo-instance.js — Acquire2Win Demo Instance
// Wipes existing data and rebuilds a polished demo that shows
// how Teamtailor works for a consulting/staffing firm managing
// a pipeline of 1099 contractors for post-acquisition engagements.
//
// ⚠️  ALL emails use @example.com — NO real notifications will fire.
// ============================================================

const https = require('https');

// ── Config ──
const API_KEY = 'szdZoYVuPCEpJ9hu7H98Y0qlWj5RCLBu7W5c7y4C';
const BASE_URL = 'https://api.na.teamtailor.com/v1';
const API_VERSION = '20240904';
const DELAY_MS = 220;

// ── API Helper ──
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
        if (res.statusCode >= 400) {
          if (res.statusCode === 429) {
            console.log('  ⏳ Rate limited — waiting 3s...');
            return sleep(3000).then(() => api(method, path, body)).then(resolve);
          }
          console.error(`  ❌ ${method} ${path} → ${res.statusCode}: ${data.substring(0, 150)}`);
          resolve(null);
        } else if (res.statusCode === 204) {
          resolve({ deleted: true });
        } else {
          try { resolve(JSON.parse(data)); } catch { resolve(data); }
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function apiGetAll(path) {
  let all = [];
  let url = path;
  while (url) {
    const res = await api('GET', url);
    if (!res?.data) break;
    all = all.concat(res.data);
    const next = res.links?.next;
    if (next) {
      url = next.replace(BASE_URL, '');
    } else {
      break;
    }
  }
  return all;
}

// ══════════════════════════════════════════════════
// PHASE 0: WIPE EVERYTHING
// ══════════════════════════════════════════════════
async function wipeAll() {
  console.log('\n🗑️  Phase 0: Wiping existing data...');

  // Delete all candidates (this also removes their job applications)
  console.log('  Deleting candidates...');
  const candidates = await apiGetAll('/candidates');
  for (const c of candidates) {
    await api('DELETE', `/candidates/${c.id}`);
    console.log(`    🗑️  Candidate ${c.id}: ${c.attributes['first-name']} ${c.attributes['last-name']}`);
  }
  console.log(`  ✅ Deleted ${candidates.length} candidates`);

  // Delete all jobs
  console.log('  Deleting jobs...');
  const jobs = await apiGetAll('/jobs');
  for (const j of jobs) {
    await api('DELETE', `/jobs/${j.id}`);
    console.log(`    🗑️  Job ${j.id}: ${j.attributes.title}`);
  }
  console.log(`  ✅ Deleted ${jobs.length} jobs`);

  // Delete non-essential departments (keep a couple core ones)
  console.log('  Deleting departments...');
  const depts = await apiGetAll('/departments');
  for (const d of depts) {
    await api('DELETE', `/departments/${d.id}`);
    console.log(`    🗑️  Dept ${d.id}: ${d.attributes.name}`);
  }
  console.log(`  ✅ Deleted ${depts.length} departments`);

  // Delete locations that aren't Acquire2Win cities
  console.log('  Deleting locations...');
  const locs = await apiGetAll('/locations');
  for (const l of locs) {
    await api('DELETE', `/locations/${l.id}`);
    console.log(`    🗑️  Location ${l.id}: ${l.attributes.name || l.attributes.city}`);
  }
  console.log(`  ✅ Deleted ${locs.length} locations`);
}

// ══════════════════════════════════════════════════
// PHASE 1: COMPANY + LOCATIONS + DEPARTMENTS
// ══════════════════════════════════════════════════
const IDS = { depts: {}, locs: {}, users: {}, tags: {}, jobs: {} };

async function setupOrg() {
  console.log('\n🏢 Phase 1: Setting up Acquire2Win org structure...');

  // Company name already set to Acquire2Win via previous call

  // Create locations (Acquire2Win's 4 cities)
  const locations = [
    { name: 'New York', city: 'New York', country: 'United States', headquarters: true, address: '110 E 25th St, 5th Floor' },
    { name: 'Atlanta', city: 'Atlanta', country: 'United States', address: '3344 Peachtree Rd NE, Suite 800' },
    { name: 'Seattle', city: 'Seattle', country: 'United States', address: '400 Fairview Ave N, Suite 200' },
    { name: 'Los Angeles', city: 'Los Angeles', country: 'United States', address: '21255 Burbank Blvd, Suite 320' },
    { name: 'Remote / Flexible', city: 'Remote', country: 'United States' },
  ];

  for (const loc of locations) {
    const res = await api('POST', '/locations', {
      data: { type: 'locations', attributes: loc }
    });
    if (res?.data?.id) {
      const key = loc.city.toLowerCase().replace(/[^a-z]/g, '');
      IDS.locs[key] = res.data.id;
      console.log(`  ✅ Location: ${loc.name} (${res.data.id})`);
    }
  }

  // Create departments (Acquire2Win's practice areas)
  const departments = [
    'Technology & Digital',
    'Finance & Accounting',
    'Human Capital',
    'Operations & Strategy',
    'Internal Team',
  ];

  for (const name of departments) {
    const res = await api('POST', '/departments', {
      data: { type: 'departments', attributes: { name } }
    });
    if (res?.data?.id) {
      const key = name.toLowerCase().replace(/[^a-z]/g, '').substring(0, 12);
      IDS.depts[key] = res.data.id;
      console.log(`  ✅ Department: ${name} (${res.data.id})`);
    }
  }
}

// ══════════════════════════════════════════════════
// PHASE 2: TAGS
// ══════════════════════════════════════════════════
async function createTags() {
  console.log('\n🏷️  Phase 2: Creating tags...');

  const tagNames = [
    // Consultant status
    'Available', 'Engaged', 'On Bench', 'Inactive',
    // Onboarding
    'NDA Signed', 'Background Check Complete', 'Onboarded',
    // Skills
    'Finance', 'Technology', 'HR', 'Operations', 'Strategy',
    'M&A Integration', 'Change Management', 'ERP Implementation',
    'Due Diligence', 'Post-Merger Integration',
    // Source
    'Referral', 'LinkedIn', 'Network Event', 'Inbound',
    // Tags for demo showcase
    'Top Talent', 'Urgent Need', 'AI Screened',
    // Rate
    'Premium Rate', 'Standard Rate',
  ];

  for (const name of tagNames) {
    const res = await api('POST', '/tags', {
      data: { type: 'tags', attributes: { name } }
    });
    if (res?.data?.id) {
      IDS.tags[name] = res.data.id;
      console.log(`  ✅ ${name}`);
    }
  }
}

// ══════════════════════════════════════════════════
// PHASE 3: JOBS (Acquire2Win's actual use case)
// ══════════════════════════════════════════════════

function getJobTemplates() {
  const depts = IDS.depts;
  const locs = IDS.locs;
  const deptIds = Object.values(depts);
  const locIds = Object.values(locs);

  return [
    // ── The big one: Evergreen Consultant Pipeline ──
    {
      title: 'Consultant — Evergreen Pipeline',
      dept: deptIds[0], // Tech & Digital
      loc: locIds[4],   // Remote
      pitch: 'Join our network of elite consultants deployed on post-acquisition integration engagements.',
      status: 'open',
      body: `<h2>About Acquire2Win</h2>
<p>Acquire2Win is a post-acquisition integration consulting firm helping enterprise and mid-market companies successfully integrate newly acquired businesses. Our consultants are deployed on 3-6 month engagements covering technology, finance, operations, and human capital workstreams.</p>

<h2>What We're Looking For</h2>
<p>We continuously build our consultant pipeline across all practice areas. If you have experience in any of the following, we want to hear from you:</p>
<ul>
<li><strong>Technology & Digital:</strong> ERP migration, data integration, systems consolidation, IT infrastructure</li>
<li><strong>Finance & Accounting:</strong> Financial close harmonization, chart of accounts mapping, treasury integration</li>
<li><strong>Human Capital:</strong> Benefits harmonization, org design, culture integration, HRIS migration</li>
<li><strong>Operations & Strategy:</strong> Supply chain optimization, process standardization, synergy tracking</li>
</ul>

<h2>Engagement Details</h2>
<ul>
<li>📋 1099 independent contractor basis</li>
<li>⏱️ Typical engagement: 3-6 months</li>
<li>🏢 Mix of on-site and remote work</li>
<li>💰 Competitive daily rates ($800-$2,500/day depending on expertise)</li>
<li>🔄 Multiple engagement opportunities per year</li>
</ul>

<h2>Requirements</h2>
<ul>
<li>5+ years of consulting or relevant industry experience</li>
<li>Prior M&A integration experience strongly preferred</li>
<li>Ability to travel to client sites as needed (typically 50-75%)</li>
<li>Strong communication and client-facing skills</li>
<li>Available to start within 1-2 weeks when engagements arise</li>
</ul>`,
      candidates: 25, // Big pipeline
    },

    // ── Practice-specific roles ──
    {
      title: 'Senior Technology Integration Consultant',
      dept: deptIds[0],
      loc: locIds[2], // Seattle
      pitch: 'Lead technology workstreams for enterprise M&A integrations.',
      status: 'open',
      body: `<h2>The Engagement</h2>
<p>We have an active engagement with a Fortune 500 technology company integrating a recent $2B acquisition. We need a Senior Technology Integration Consultant to lead the application rationalization and data migration workstream.</p>

<h2>What You'll Do</h2>
<ul>
<li>Lead the technology integration workstream across 200+ applications</li>
<li>Map source/target system architectures and define migration approach</li>
<li>Coordinate with client IT leadership and vendor teams</li>
<li>Build and manage the integration timeline and risk register</li>
<li>Report progress weekly to the Integration Management Office (IMO)</li>
</ul>

<h2>Requirements</h2>
<ul>
<li>8+ years of technology consulting experience</li>
<li>3+ M&A technology integrations completed</li>
<li>Experience with enterprise application rationalization</li>
<li>Strong project management skills (PMP or equivalent)</li>
<li>Cloud migration experience (AWS/Azure/GCP) preferred</li>
</ul>

<h2>Engagement Details</h2>
<ul>
<li>📍 Seattle, WA (hybrid — 3 days on-site)</li>
<li>⏱️ 6-month engagement, possible extension</li>
<li>💰 $1,800-$2,200/day</li>
<li>🚀 Start date: ASAP</li>
</ul>`,
      candidates: 8,
    },
    {
      title: 'Finance Integration Analyst',
      dept: deptIds[1], // Finance
      loc: locIds[0],   // New York
      pitch: 'Support financial close harmonization for a cross-border acquisition.',
      status: 'open',
      body: `<h2>The Engagement</h2>
<p>A mid-market financial services company is acquiring a European competitor. We need a Finance Integration Analyst to support the Day 1 financial close harmonization and ongoing monthly consolidation.</p>

<h2>What You'll Do</h2>
<ul>
<li>Map chart of accounts between acquiring and acquired entity</li>
<li>Support Day 1 close process and first consolidated financial statements</li>
<li>Develop interim reporting templates for the integration period</li>
<li>Assist with purchase price allocation (PPA) analysis</li>
<li>Coordinate with external auditors and tax advisors</li>
</ul>

<h2>Requirements</h2>
<ul>
<li>CPA preferred; Big 4 experience a plus</li>
<li>3-5 years of financial reporting or FP&A experience</li>
<li>Experience with multi-entity consolidation</li>
<li>Strong Excel skills; NetSuite or SAP experience preferred</li>
<li>Cross-border / multi-currency experience a plus</li>
</ul>

<h2>Engagement Details</h2>
<ul>
<li>📍 New York, NY (on-site at client HQ)</li>
<li>⏱️ 4-month engagement</li>
<li>💰 $1,000-$1,400/day</li>
</ul>`,
      candidates: 5,
    },
    {
      title: 'HR Integration & Change Management Lead',
      dept: deptIds[2], // Human Capital
      loc: locIds[1],   // Atlanta
      pitch: 'Guide the people side of M&A — org design, culture, and communication.',
      status: 'open',
      body: `<h2>The Engagement</h2>
<p>A healthcare services company is integrating a competitor acquisition (500+ employees joining). We need an HR Integration Lead to manage the people integration: org design, benefits harmonization, culture alignment, and employee communications.</p>

<h2>What You'll Do</h2>
<ul>
<li>Lead the HR integration workstream and people-related Day 1 activities</li>
<li>Design the combined organization structure with client CHRO</li>
<li>Manage benefits harmonization analysis and recommendation</li>
<li>Develop and execute employee communication plan</li>
<li>Coordinate change management activities across both organizations</li>
</ul>

<h2>Requirements</h2>
<ul>
<li>7+ years of HR experience, including 2+ in M&A integration</li>
<li>SHRM-SCP or equivalent certification preferred</li>
<li>Experience with benefits harmonization and total rewards analysis</li>
<li>Strong change management skills (Prosci certification a plus)</li>
<li>Healthcare industry experience preferred but not required</li>
</ul>

<h2>Engagement Details</h2>
<ul>
<li>📍 Atlanta, GA (on-site 4 days/week)</li>
<li>⏱️ 5-month engagement</li>
<li>💰 $1,500-$1,800/day</li>
</ul>`,
      candidates: 6,
    },
    {
      title: 'Operations & Synergy Tracking Consultant',
      dept: deptIds[3], // Operations
      loc: locIds[3],   // LA
      pitch: 'Track and realize the synergies that make acquisitions worth doing.',
      status: 'open',
      body: `<h2>The Engagement</h2>
<p>A consumer products company has completed three tuck-in acquisitions this year. We need an Operations Consultant to build and manage the synergy tracking framework, identify quick wins, and drive realization of $15M+ in targeted cost synergies.</p>

<h2>What You'll Do</h2>
<ul>
<li>Build a synergy tracking model across revenue, cost, and operational categories</li>
<li>Lead synergy identification workshops with functional leaders</li>
<li>Create dashboards and reporting for the C-suite and Board</li>
<li>Drive quick-win initiatives in procurement and operations</li>
<li>Facilitate weekly integration steering committee meetings</li>
</ul>

<h2>Requirements</h2>
<ul>
<li>5+ years of management consulting or corporate strategy experience</li>
<li>2+ M&A synergy realization programs</li>
<li>Advanced financial modeling and analytical skills</li>
<li>Strong stakeholder management and facilitation abilities</li>
<li>MBA preferred</li>
</ul>

<h2>Engagement Details</h2>
<ul>
<li>📍 Los Angeles, CA (hybrid)</li>
<li>⏱️ 3-month engagement with extension likely</li>
<li>💰 $1,400-$1,800/day</li>
</ul>`,
      candidates: 4,
    },

    // ── Internal Team Hires (showing W-2 growth) ──
    {
      title: 'Engagement Manager',
      dept: deptIds[4], // Internal
      loc: locIds[0],   // New York
      pitch: 'Manage our highest-value client relationships and consultant deployments.',
      status: 'open',
      body: `<h2>About the Role</h2>
<p>As Acquire2Win scales, we need an Engagement Manager to own client relationships and oversee consultant deployments across multiple active engagements. You'll be the bridge between our clients and our consultant network — ensuring we deliver exceptional results on every integration.</p>

<h2>What You'll Do</h2>
<ul>
<li>Manage 5-8 active client engagements simultaneously</li>
<li>Match consultants to client needs based on skills, availability, and fit</li>
<li>Onboard consultants to new engagements (NDA, client-specific requirements)</li>
<li>Conduct weekly check-ins with clients and consultants</li>
<li>Manage engagement P&L and consultant utilization</li>
</ul>

<h2>Requirements</h2>
<ul>
<li>5+ years in consulting, staffing, or professional services</li>
<li>Experience managing client relationships at the VP/C-suite level</li>
<li>Strong operational skills — you keep the trains running</li>
<li>Excellent communication and problem-solving abilities</li>
<li>M&A industry knowledge preferred</li>
</ul>

<h2>Compensation</h2>
<ul>
<li>💰 $130-160K base + performance bonus</li>
<li>📈 Equity opportunity (early employee)</li>
<li>🌴 Unlimited PTO + company holidays</li>
<li>🩺 Full benefits (medical, dental, vision)</li>
</ul>`,
      candidates: 7,
    },
    {
      title: 'Business Development Representative',
      dept: deptIds[4], // Internal
      loc: locIds[0],   // New York
      pitch: 'Source new client relationships for a high-growth consulting firm.',
      status: 'open',
      body: `<h2>About the Role</h2>
<p>We're hiring our first BDR to proactively source new client relationships. You'll research companies involved in M&A activity, identify integration leaders, and open doors for our Partners. This is a ground-floor opportunity at a firm with massive momentum.</p>

<h2>What You'll Do</h2>
<ul>
<li>Research M&A activity using PitchBook, Crunchbase, and SEC filings</li>
<li>Identify and reach out to VPs of Corporate Development, Integration, and HR</li>
<li>Book qualified meetings for Partners (target: 10+/month)</li>
<li>Manage outreach sequences via email, LinkedIn, and phone</li>
<li>Maintain CRM and track pipeline metrics</li>
</ul>

<h2>Requirements</h2>
<ul>
<li>1-3 years of B2B sales, business development, or recruiting experience</li>
<li>Strong research and outreach skills</li>
<li>Excellent written communication</li>
<li>Interest in M&A, consulting, or private equity</li>
<li>Self-starter who thrives in an unstructured environment</li>
</ul>

<h2>Compensation</h2>
<ul>
<li>💰 $65-80K base + quarterly bonus</li>
<li>📈 Path to Account Executive or Client Partner</li>
<li>🚀 First BDR hire — build the playbook</li>
</ul>`,
      candidates: 5,
    },
    {
      title: 'Executive Assistant to Partners',
      dept: deptIds[4], // Internal
      loc: locIds[0],   // New York
      pitch: 'Keep four busy Partners organized and clients happy.',
      status: 'draft',
      body: `<h2>About the Role</h2>
<p>Support our 4 founding Partners with scheduling, travel, client communications, and operational coordination. As the firm grows, this role will evolve into an Office Manager / Chief of Staff position.</p>

<h2>What You'll Do</h2>
<ul>
<li>Manage calendars and scheduling across 4 time zones</li>
<li>Coordinate travel arrangements for Partners and consultants</li>
<li>Prepare client meeting materials and follow-up communications</li>
<li>Manage vendor relationships and office operations</li>
<li>Support monthly consultant sync logistics</li>
</ul>

<h2>Requirements</h2>
<ul>
<li>2+ years of executive assistant or operations experience</li>
<li>Exceptional organizational skills and attention to detail</li>
<li>Proficiency with Google Workspace, Calendly, and project management tools</li>
<li>Professional demeanor — you'll interact with C-suite clients</li>
</ul>`,
      candidates: 3,
    },
  ];
}

// ══════════════════════════════════════════════════
// PHASE 4: CANDIDATES — Realistic consultant profiles
// ══════════════════════════════════════════════════

const CONSULTANT_PROFILES = [
  // Technology consultants
  { first: 'Marcus', last: 'Chen', skills: ['Technology', 'ERP Implementation'], status: 'Available', rate: 'Premium Rate' },
  { first: 'Sarah', last: 'Washington', skills: ['Technology', 'M&A Integration'], status: 'Engaged', rate: 'Premium Rate' },
  { first: 'David', last: 'Park', skills: ['Technology'], status: 'Available', rate: 'Standard Rate' },
  { first: 'Priya', last: 'Sharma', skills: ['Technology', 'ERP Implementation'], status: 'On Bench', rate: 'Premium Rate' },
  { first: 'James', last: 'O\'Brien', skills: ['Technology'], status: 'Available', rate: 'Standard Rate' },
  { first: 'Wei', last: 'Liu', skills: ['Technology', 'M&A Integration'], status: 'Available', rate: 'Premium Rate' },
  { first: 'Amanda', last: 'Foster', skills: ['Technology'], status: 'Engaged', rate: 'Standard Rate' },
  { first: 'Raj', last: 'Patel', skills: ['Technology', 'ERP Implementation'], status: 'Available', rate: 'Premium Rate' },
  { first: 'Nicole', last: 'Martinez', skills: ['Technology'], status: 'On Bench', rate: 'Standard Rate' },
  { first: 'Chris', last: 'Thompson', skills: ['Technology', 'Due Diligence'], status: 'Available', rate: 'Standard Rate' },
  { first: 'Kenji', last: 'Tanaka', skills: ['Technology', 'M&A Integration'], status: 'Inactive', rate: 'Premium Rate' },
  { first: 'Lisa', last: 'Rodriguez', skills: ['Technology'], status: 'Available', rate: 'Standard Rate' },

  // Finance consultants
  { first: 'Michael', last: 'Adams', skills: ['Finance', 'Due Diligence'], status: 'Available', rate: 'Premium Rate' },
  { first: 'Jennifer', last: 'Kim', skills: ['Finance', 'M&A Integration'], status: 'Engaged', rate: 'Premium Rate' },
  { first: 'Robert', last: 'Okafor', skills: ['Finance'], status: 'Available', rate: 'Standard Rate' },
  { first: 'Camila', last: 'Torres', skills: ['Finance', 'Due Diligence'], status: 'On Bench', rate: 'Premium Rate' },
  { first: 'Jonathan', last: 'Wright', skills: ['Finance'], status: 'Available', rate: 'Standard Rate' },
  { first: 'Fatima', last: 'Al-Rashid', skills: ['Finance', 'M&A Integration'], status: 'Available', rate: 'Premium Rate' },
  { first: 'Brian', last: 'Sullivan', skills: ['Finance'], status: 'Inactive', rate: 'Standard Rate' },

  // HR / Human Capital consultants
  { first: 'Vanessa', last: 'Green', skills: ['HR', 'Change Management'], status: 'Available', rate: 'Premium Rate' },
  { first: 'Derek', last: 'Johnson', skills: ['HR', 'Post-Merger Integration'], status: 'Engaged', rate: 'Premium Rate' },
  { first: 'Aisha', last: 'Williams', skills: ['HR', 'Change Management'], status: 'Available', rate: 'Standard Rate' },
  { first: 'Ryan', last: 'Clark', skills: ['HR'], status: 'On Bench', rate: 'Standard Rate' },
  { first: 'Elena', last: 'Vasquez', skills: ['HR', 'Change Management'], status: 'Available', rate: 'Premium Rate' },
  { first: 'Tyler', last: 'Mitchell', skills: ['HR'], status: 'Available', rate: 'Standard Rate' },

  // Operations & Strategy consultants
  { first: 'Sophia', last: 'Anderson', skills: ['Operations', 'Strategy'], status: 'Available', rate: 'Premium Rate' },
  { first: 'Daniel', last: 'Nguyen', skills: ['Operations', 'M&A Integration'], status: 'Engaged', rate: 'Premium Rate' },
  { first: 'Ashley', last: 'Davis', skills: ['Operations'], status: 'Available', rate: 'Standard Rate' },
  { first: 'Omar', last: 'Hassan', skills: ['Strategy', 'Due Diligence'], status: 'Available', rate: 'Premium Rate' },
  { first: 'Rachel', last: 'Lee', skills: ['Operations', 'Strategy'], status: 'On Bench', rate: 'Standard Rate' },
  { first: 'Andrew', last: 'Campbell', skills: ['Operations'], status: 'Inactive', rate: 'Standard Rate' },

  // Mixed / cross-functional
  { first: 'Jasmine', last: 'Brown', skills: ['Strategy', 'Post-Merger Integration'], status: 'Available', rate: 'Premium Rate' },
  { first: 'Nathan', last: 'Scott', skills: ['Technology', 'Operations'], status: 'Available', rate: 'Standard Rate' },
  { first: 'Mia', last: 'Taylor', skills: ['Finance', 'Strategy'], status: 'Engaged', rate: 'Premium Rate' },
  { first: 'Ethan', last: 'Garcia', skills: ['HR', 'Operations'], status: 'Available', rate: 'Standard Rate' },
  { first: 'Olivia', last: 'Wilson', skills: ['Technology', 'Change Management'], status: 'Available', rate: 'Premium Rate' },
  { first: 'Liam', last: 'Murphy', skills: ['Finance', 'Operations'], status: 'On Bench', rate: 'Standard Rate' },
  { first: 'Charlotte', last: 'Brooks', skills: ['HR', 'Strategy'], status: 'Available', rate: 'Standard Rate' },
  { first: 'Alexander', last: 'Rivera', skills: ['Technology', 'M&A Integration'], status: 'Engaged', rate: 'Premium Rate' },

  // Internal team applicants (for W-2 roles)
  { first: 'Hannah', last: 'Cooper', skills: [], status: null, rate: null, source: 'LinkedIn' },
  { first: 'Brandon', last: 'Phillips', skills: [], status: null, rate: null, source: 'Referral' },
  { first: 'Samantha', last: 'Reed', skills: [], status: null, rate: null, source: 'LinkedIn' },
  { first: 'Kevin', last: 'Hughes', skills: [], status: null, rate: null, source: 'Inbound' },
  { first: 'Alexis', last: 'Bell', skills: [], status: null, rate: null, source: 'Referral' },
  { first: 'Jordan', last: 'Price', skills: [], status: null, rate: null, source: 'LinkedIn' },
  { first: 'Taylor', last: 'Ross', skills: [], status: null, rate: null, source: 'Inbound' },
  { first: 'Morgan', last: 'Gray', skills: [], status: null, rate: null, source: 'LinkedIn' },
  { first: 'Casey', last: 'Ward', skills: [], status: null, rate: null, source: 'Referral' },
  { first: 'Avery', last: 'Long', skills: [], status: null, rate: null, source: 'Network Event' },
  { first: 'Riley', last: 'Sanders', skills: [], status: null, rate: null, source: 'LinkedIn' },
  { first: 'Quinn', last: 'Flores', skills: [], status: null, rate: null, source: 'Inbound' },
  { first: 'Drew', last: 'Kelly', skills: [], status: null, rate: null, source: 'Referral' },
  { first: 'Blake', last: 'Evans', skills: [], status: null, rate: null, source: 'LinkedIn' },
  { first: 'Reese', last: 'Diaz', skills: [], status: null, rate: null, source: 'Network Event' },
  { first: 'Charlie', last: 'Collins', skills: [], status: null, rate: null, source: 'Inbound' },
  { first: 'Dakota', last: 'Stewart', skills: [], status: null, rate: null, source: 'Referral' },
  { first: 'Parker', last: 'Cruz', skills: [], status: null, rate: null, source: 'LinkedIn' },
  { first: 'Finley', last: 'Gonzalez', skills: [], status: null, rate: null, source: 'Referral' },
  { first: 'Skyler', last: 'Barnes', skills: [], status: null, rate: null, source: 'Inbound' },
];

// Map consultant profiles to jobs
function assignCandidatesToJobs(jobs) {
  const assignments = [];
  let consultantIdx = 0;
  const consultantProfiles = CONSULTANT_PROFILES.filter(p => p.status); // Contractors only
  const internalProfiles = CONSULTANT_PROFILES.filter(p => !p.status); // Internal applicants
  let internalIdx = 0;

  for (const job of jobs) {
    const isInternalRole = job.title.includes('Engagement Manager') ||
                           job.title.includes('Business Development') ||
                           job.title.includes('Executive Assistant');
    const pool = isInternalRole ? internalProfiles : consultantProfiles;
    const startIdx = isInternalRole ? internalIdx : consultantIdx;

    for (let i = 0; i < job.targetCandidates && (startIdx + i) < pool.length; i++) {
      const profile = pool[startIdx + i];
      assignments.push({ job, profile });
    }

    if (isInternalRole) internalIdx += job.targetCandidates;
    else consultantIdx += job.targetCandidates;
  }

  return assignments;
}

function distributeAcrossStages(total, stages) {
  // Realistic funnel
  const weights = [0.30, 0.25, 0.22, 0.13, 0.10];
  const result = [];
  let used = 0;
  for (let i = 0; i < stages.length && i < weights.length; i++) {
    const count = i === stages.length - 1
      ? total - used
      : Math.max(i < 3 ? 1 : 0, Math.round(total * weights[i]));
    used += count;
    if (used > total) break;
    if (count > 0) {
      result.push({ stageId: stages[i].id, stageName: stages[i].name, count });
    }
  }
  return result;
}

async function seedCandidatesAndApps(jobs) {
  console.log('\n👤 Phase 4: Creating candidates & applications...');

  const assignments = assignCandidatesToJobs(jobs);
  let created = 0;

  // Group by job for stage distribution
  const byJob = {};
  for (const a of assignments) {
    const key = a.job.id;
    if (!byJob[key]) byJob[key] = { job: a.job, profiles: [] };
    byJob[key].profiles.push(a.profile);
  }

  for (const { job, profiles } of Object.values(byJob)) {
    console.log(`\n  📋 ${job.title} (${profiles.length} candidates):`);
    const dist = distributeAcrossStages(profiles.length, job.stages);
    let profileIdx = 0;

    for (const { stageId, stageName, count } of dist) {
      for (let i = 0; i < count && profileIdx < profiles.length; i++, profileIdx++) {
        const p = profiles[profileIdx];
        const slug = `${p.first.toLowerCase()}.${p.last.toLowerCase().replace(/'/g, '')}`;

        // Create candidate
        const candidateRes = await api('POST', '/candidates', {
          data: {
            type: 'candidates',
            attributes: {
              'first-name': p.first,
              'last-name': p.last,
              'email': `${slug}_demo@example.com`,
              'phone': `+1${String(2000000000 + Math.floor(Math.random() * 8000000000))}`,
              'linkedin-url': `https://linkedin.com/in/${slug}-${Math.floor(Math.random()*9000+1000)}`,
            }
          }
        });

        if (!candidateRes?.data?.id) {
          console.log(`    ❌ Failed: ${p.first} ${p.last}`);
          continue;
        }
        const cId = candidateRes.data.id;

        // Create job application at specific stage
        await api('POST', '/job-applications', {
          data: {
            type: 'job-applications',
            attributes: {},
            relationships: {
              candidate: { data: { type: 'candidates', id: cId } },
              job: { data: { type: 'jobs', id: job.id } },
              stage: { data: { type: 'stages', id: stageId } },
            }
          }
        });

        // Apply tags
        const tagsToApply = [];
        if (p.source && IDS.tags[p.source]) tagsToApply.push(p.source);
        if (p.status && IDS.tags[p.status]) tagsToApply.push(p.status);
        if (p.rate && IDS.tags[p.rate]) tagsToApply.push(p.rate);
        for (const skill of (p.skills || [])) {
          if (IDS.tags[skill]) tagsToApply.push(skill);
        }
        // Random source for consultants
        if (!p.source) {
          const sources = ['Referral', 'LinkedIn', 'Network Event', 'Inbound'];
          const src = sources[Math.floor(Math.random() * sources.length)];
          if (IDS.tags[src]) tagsToApply.push(src);
        }
        // Random extras
        if (Math.random() > 0.7 && IDS.tags['NDA Signed']) tagsToApply.push('NDA Signed');
        if (Math.random() > 0.8 && IDS.tags['AI Screened']) tagsToApply.push('AI Screened');
        if (Math.random() > 0.85 && IDS.tags['Top Talent']) tagsToApply.push('Top Talent');

        for (const tagName of tagsToApply) {
          if (IDS.tags[tagName]) {
            await api('PATCH', `/candidates/${cId}`, {
              data: {
                type: 'candidates',
                id: cId,
                attributes: {
                  tags: [tagName],
                }
              }
            });
            break; // Just set tags once via attributes
          }
        }

        created++;
        console.log(`    ${stageName}: ${p.first} ${p.last} ✓`);
      }
    }
  }

  console.log(`\n  ✅ Total candidates created: ${created}`);
}

// ══════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════
async function main() {
  console.log('🚀 Acquire2Win — Demo Instance Seed Script');
  console.log('===========================================');
  console.log('⚠️  All emails use @example.com — NO real notifications.');
  console.log('');

  // Verify connection
  const company = await api('GET', '/company');
  if (!company?.data) {
    console.error('❌ API connection failed.');
    process.exit(1);
  }
  console.log(`✅ Connected: ${company.data.attributes.name}`);

  // Phase 0: Wipe
  await wipeAll();

  // Phase 1: Org structure
  await setupOrg();

  // Phase 2: Tags
  await createTags();

  // Phase 3: Jobs
  console.log('\n📋 Phase 3: Creating jobs...');
  const templates = getJobTemplates();
  const jobResults = [];
  for (const t of templates) {
    const res = await api('POST', '/jobs', {
      data: {
        type: 'jobs',
        attributes: {
          title: t.title,
          body: t.body,
          pitch: t.pitch,
          status: t.status || 'open',
        },
        relationships: {
          department: { data: { type: 'departments', id: t.dept } },
          location: { data: { type: 'locations', id: t.loc } },
        }
      }
    });
    if (res?.data?.id) {
      console.log(`  ✅ ${t.title} (${res.data.id})`);
      // Get stages for this job
      const stagesRes = await api('GET', `/jobs/${res.data.id}/stages`);
      jobResults.push({
        id: res.data.id,
        title: t.title,
        targetCandidates: t.candidates,
        stages: (stagesRes?.data || []).map(s => ({ id: s.id, name: s.attributes.name })),
      });
    }
  }

  // Phase 4: Candidates
  await seedCandidatesAndApps(jobResults);

  console.log('\n===========================================');
  console.log('🎉 Demo instance ready!');
  console.log(`   Company: Acquire2Win`);
  console.log(`   Jobs: ${jobResults.length}`);
  console.log(`   Locations: 5 (NY, ATL, SEA, LA, Remote)`);
  console.log(`   Open your TT admin to verify.`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
