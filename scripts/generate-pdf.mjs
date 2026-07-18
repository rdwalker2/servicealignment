import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

const ARTIFACT_DIR = '/Users/ryan.walker/.gemini/antigravity/brain/5310cba1-8ac3-4e0d-9ec2-24d3b424adf6';

function imgBase64(filename) {
  try {
    const data = readFileSync(resolve(ARTIFACT_DIR, filename));
    return `data:image/png;base64,${data.toString('base64')}`;
  } catch { return ''; }
}

const img1 = imgBase64('system_overview_1781830730561.png');
const img2 = imgBase64('webhook_flow_1781830748786.png');
const img3 = imgBase64('end_to_end_flow_v4_1781836377885.png');

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: letter; margin: 50px 56px 50px 56px; }
  body { font-family: 'Inter', -apple-system, sans-serif; color: #1e293b; line-height: 1.6; font-size: 10.5pt; }
  h1, h2, h3, h4 { page-break-after: avoid; break-after: avoid; }
  .scenario, .callout, table, pre, img, .keep { page-break-inside: avoid; break-inside: avoid; }
  p, li { orphans: 3; widows: 3; }
  .page-break { page-break-before: always; break-before: page; }
  h1 { font-size: 24pt; font-weight: 800; color: #0f172a; margin-bottom: 3px; letter-spacing: -0.5px; }
  .subtitle { font-size: 11pt; color: #64748b; margin-bottom: 20px; }
  h2 { font-size: 15pt; font-weight: 700; color: #0f172a; margin-top: 24px; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 2px solid #e2e8f0; }
  h3 { font-size: 11.5pt; font-weight: 700; color: #334155; margin-top: 18px; margin-bottom: 7px; }
  h4 { font-size: 10.5pt; font-weight: 700; color: #475569; margin-top: 0; margin-bottom: 5px; }
  p { margin-bottom: 8px; }
  strong { font-weight: 600; }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 18px 0; }
  ul, ol { margin-left: 16px; margin-bottom: 8px; }
  li { margin-bottom: 2px; }
  img { max-width: 82%; display: block; margin: 10px auto; border-radius: 8px; box-shadow: 0 1px 6px rgba(0,0,0,0.05); }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 9.5pt; }
  th { background: #f1f5f9; font-weight: 600; text-align: left; padding: 5px 8px; border: 1px solid #e2e8f0; color: #475569; }
  td { padding: 4px 8px; border: 1px solid #e2e8f0; }
  tr:nth-child(even) td { background: #f8fafc; }
  code { background: #f1f5f9; padding: 1px 4px; border-radius: 3px; font-size: 8.5pt; font-family: 'SF Mono', monospace; color: #7c3aed; }
  pre { background: #1e293b; color: #e2e8f0; padding: 10px 14px; border-radius: 7px; margin: 8px 0; font-size: 8.5pt; line-height: 1.45; }
  pre code { background: none; color: inherit; padding: 0; }
  blockquote { border-left: 3px solid #3b82f6; background: #eff6ff; padding: 8px 12px; border-radius: 0 6px 6px 0; margin: 8px 0; font-size: 9.5pt; color: #1e40af; }
  .scenario { background: #fafafa; border: 1px solid #e5e7eb; border-radius: 7px; padding: 14px; margin: 10px 0; }
  .callout { background: linear-gradient(135deg, #eff6ff, #f0f9ff); border: 1px solid #bfdbfe; border-radius: 7px; padding: 12px 14px; margin: 10px 0; }
  .callout-title { font-weight: 700; color: #1d4ed8; font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
  .sn { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: #3b82f6; color: white; font-weight: 700; font-size: 11pt; margin-right: 5px; vertical-align: middle; }
  .range { font-size: 8pt; color: #64748b; font-style: italic; }
</style>
</head>
<body>

<h1>GTM Workspace</h1>
<p style="font-size: 14pt; color: #3b82f6; font-weight: 600; margin-bottom: 2px;">Technical Overview</p>
<p class="subtitle">How our signal intelligence platform connects RB2B, Supabase, Salesforce, and ad targeting into a single closed-loop system.</p>
<hr>

<h2>The Big Picture</h2>
<p>We have three systems that talk to each other:</p>
<img src="${img1}" alt="System Overview">
<p><strong>In one sentence:</strong> When someone visits our website, RB2B figures out who they are, sends that info to our workspace, and our workspace automatically checks if that person exists in Salesforce — creating them if they don't, and enriching them with signal data if they do.</p>

<hr>

<h2><span class="sn">1</span> How RB2B Connects to the GTM Workspace</h2>

<div class="keep">
<h3>What is RB2B?</h3>
<p>RB2B is a tool that sits on our website (teamtailor.com) and identifies anonymous visitors. When someone lands on our site, RB2B uses reverse-IP lookup and identity resolution to figure out:</p>
<ul>
  <li><strong>Who</strong> they are (name, email, job title, LinkedIn)</li>
  <li><strong>Where</strong> they work (company name, domain, employee count)</li>
  <li><strong>What</strong> they looked at (which pages, how long, pricing page?)</li>
</ul>
</div>

<div class="keep">
<h3>How to connect RB2B</h3>
<p>In the RB2B dashboard under <strong>Integrations → Webhook</strong>, here's what to configure:</p>
<ol>
  <li><strong>Add our webhook URL</strong> — <code>https://our-server.railway.app/api/webhook/rb2b</code></li>
  <li><strong>Turn ON "Sync company-only profiles"</strong> — so we get data even when RB2B only identifies the company</li>
  <li><strong>Turn ON "Send repeat visitor data"</strong> — so we track return visits (our server handles deduplication)</li>
  <li><strong>Click "Send a Test Event"</strong> — to verify our server receives and processes it correctly</li>
  <li><strong>Authentication</strong> — include a secret key as a URL query parameter</li>
</ol>
<blockquote>Dashboard configuration only — no code changes inside RB2B. Paste the URL, toggle two switches, test.</blockquote>
</div>

<div class="keep">
<h3>What exactly does RB2B send in the webhook?</h3>
<p>Every time a visitor is identified, RB2B fires a JSON POST. Here's the payload:</p>
<table>
  <tr><th>Field</th><th>Example</th><th>What we use it for</th></tr>
  <tr><td><code>first_name</code> / <code>last_name</code></td><td>Sarah Chen</td><td>Contact name</td></tr>
  <tr><td><code>business_email</code></td><td>sarah@acme.com</td><td>Contact email + domain extraction</td></tr>
  <tr><td><code>title</code></td><td>VP of People</td><td>Job title for persona scoring</td></tr>
  <tr><td><code>linkedin_url</code></td><td>linkedin.com/in/sarachen</td><td>LinkedIn link in workspace</td></tr>
  <tr><td><code>company_name</code> / <code>website</code></td><td>Acme Corp / acme.com</td><td>Account name + domain (primary key)</td></tr>
  <tr><td><code>industry</code> / <code>employee_count</code></td><td>Healthcare / 500</td><td>ICP tier scoring</td></tr>
  <tr><td><code>captured_url</code></td><td>teamtailor.com/pricing</td><td><strong>Which page visited</strong> — critical for intent</td></tr>
  <tr><td><code>referrer</code></td><td>google.com</td><td>How they found us (ad attribution)</td></tr>
  <tr><td><code>seen_at</code></td><td>2025-06-18T14:23:00Z</td><td>Visit timestamp</td></tr>
</table>
<blockquote>Some fields may be null — if RB2B identifies the company but not the person, name/email will be empty. Our server handles this.</blockquote>
</div>

<div class="keep">
<h3>How does the data get to our workspace?</h3>
<p>Every time RB2B identifies a visitor, it sends this webhook to our server:</p>
</div>
<img src="${img2}" alt="Webhook Flow">

<div class="keep">
<h3>What does our server do when it receives the webhook?</h3>
<p>The server (our "flywheel") does 5 things in order:</p>
<ol>
  <li><strong>Extracts identity</strong> — Pulls the domain from <code>website</code> or <code>business_email</code></li>
  <li><strong>Scores the signal</strong> — <code>captured_url</code> containing "pricing" = high intent</li>
  <li><strong>Tags by ICP tier</strong> — Based on <code>employee_count</code>, <code>industry</code>, signal strength → Hot/Warm/Watch</li>
  <li><strong>Deduplicates</strong> — If domain exists, updates score + timestamp instead of creating a duplicate</li>
  <li><strong>Stores it</strong> — Saves to Supabase, auto-assigns a rep, then checks Salesforce</li>
</ol>
</div>

<div class="keep">
<h3>What does this look like in the workspace?</h3>
<p>The signal appears as a row in the accounts table with company info, person details, signal type, ICP tier, signal score, and assigned rep. Reps can click into any account to see the full timeline.</p>
</div>

<div class="page-break"></div>

<h2>The Ad Retargeting Flywheel (Jesper's Loop)</h2>

<div class="keep">
<h3>What Jesper does with it</h3>
<p>Jesper runs paid ads (LinkedIn, Google, programmatic) driving traffic to teamtailor.com. He built <strong>Pectus</strong> — an open-source insights framework that classifies data and generates targeted ad audiences. Here's how the integration works:</p>
<ol>
  <li><strong>Reads enriched signal data</strong> directly from our Supabase database</li>
  <li><strong>Classifies leads by pain point and intent</strong> — using ICP tier, ATS, industry, signal score, pages visited</li>
  <li><strong>Generates hyper-targeted ad audiences</strong> — e.g., "Healthcare companies using Rippling ATS who visited pricing" → served the ADP displacement campaign</li>
  <li><strong>Remarketing</strong> — retargets visitors who haven't converted</li>
  <li><strong>Prospecting</strong> — builds lookalike audiences from enriched profiles</li>
</ol>
</div>

<div class="keep">
<h3>Why this creates a flywheel</h3>
<p>The system is <strong>circular</strong>, not linear:</p>
<pre><code>Ads → Traffic → RB2B identifies → Signals enrich → Jesper reads signals
  ↑                                                          ↓
  └──── Generates better ads ← Classifies by pain point ←───┘</code></pre>
<p>Every cycle gets smarter. More signals → more precise ads → higher-quality traffic → richer signals.</p>
</div>

<div class="keep">
<h3>What Jesper has access to</h3>
<ol>
  <li><strong>Read-only Supabase API key</strong> — to query <code>clay_signals</code></li>
  <li><strong>SFDC Campaign ID</strong> — auto-associates Leads/Contacts for attribution</li>
  <li><strong>Pectus connector (in progress)</strong> — Jesper is building an automated bridge</li>
</ol>
</div>

<div class="keep">
<h3>Data Jesper reads from the workspace</h3>
<table>
  <tr><th>Field</th><th>Ad use case</th></tr>
  <tr><td><code>company_domain</code></td><td>LinkedIn company targeting</td></tr>
  <tr><td><code>industry</code></td><td>Industry-specific creatives</td></tr>
  <tr><td><code>employee_count</code></td><td>Company size segmentation</td></tr>
  <tr><td><code>current_ats</code></td><td>ATS-specific campaigns (ADP displacement)</td></tr>
  <tr><td><code>icp_tier</code> / <code>signal_score</code></td><td>Intent-based ad budget allocation</td></tr>
  <tr><td><code>company_location</code></td><td>Geo-targeted campaigns</td></tr>
  <tr><td><code>email</code></td><td>Custom audience matching</td></tr>
</table>
</div>

<div class="keep">
<h3>SFDC Campaign Attribution</h3>
<p>When we create a Lead/Contact, we also create a <strong>CampaignMember</strong>:</p>
<pre><code>Lead/Contact → CampaignMember:
  CampaignId: Jesper's campaign
  Status: "Responded" → later "Converted"</code></pre>
<p>Ad visitors → Leads → Opportunities → closed won = full <strong>ad-to-revenue attribution</strong>.</p>
</div>

<div class="page-break"></div>

<h2><span class="sn">2</span> How the Salesforce Bi-Directional Sync Works</h2>

<div class="keep">
<h3>What does "bi-directional" mean?</h3>
<p>Data flows in <strong>both directions</strong>:</p>
<ul>
  <li><strong>Outbound (Workspace → Salesforce):</strong> We push signal data, create new records, update existing ones</li>
  <li><strong>Inbound (Salesforce → Workspace):</strong> We pull account ownership, lead status, lifecycle data back</li>
</ul>
<p>Neither system is "the boss." Each is the <strong>source of truth</strong> for specific things:</p>
</div>

<table>
  <tr><th>Data Point</th><th>Source of Truth</th><th>Direction</th></tr>
  <tr><td>Who owns the account</td><td><strong>Salesforce</strong></td><td>SF → Workspace</td></tr>
  <tr><td>Lead status / opportunity stage</td><td><strong>Salesforce</strong></td><td>SF → Workspace</td></tr>
  <tr><td>Contact's phone and title</td><td><strong>Salesforce</strong></td><td>SF → Workspace</td></tr>
  <tr><td>Signal score</td><td><strong>Workspace</strong></td><td>Workspace → SF</td></tr>
  <tr><td>ICP tier (Hot/Warm/Watch)</td><td><strong>Workspace</strong></td><td>Workspace → SF</td></tr>
  <tr><td>Web visit count</td><td><strong>Workspace</strong></td><td>Workspace → SF</td></tr>
  <tr><td>Last signal date</td><td><strong>Workspace</strong></td><td>Workspace → SF</td></tr>
</table>

<div class="keep">
<h3>The Three Scenarios</h3>
<p>When a new signal comes in, the system asks: <strong>"Does this company and person exist in Salesforce?"</strong></p>
</div>

<div class="scenario">
  <h4>Scenario 1: Company exists, but the person doesn't</h4>
  <p><em>Acme Corp is an Account (owned by Moe), but Sarah Chen isn't a Contact yet.</em></p>
  <ol>
    <li>Looks up Acme Corp's domain → finds the Account</li>
    <li>Searches for Sarah's email → not found</li>
    <li><strong>Creates a new Contact</strong> on the existing Account with <code>LeadSource = "RB2B Intent Signal"</code></li>
    <li>Writes signal score and page visited to custom fields</li>
  </ol>
  <pre><code>Before: Acme Corp ← 3 Contacts
After:  Acme Corp ← 4 Contacts (Sarah Chen added)</code></pre>
</div>

<div class="scenario">
  <h4>Scenario 2: Company doesn't exist at all</h4>
  <p><em>NewStartup.io visited pricing. Not in Salesforce.</em></p>
  <ol>
    <li>Searches for "newstartup.io" → nothing</li>
    <li><strong>Creates a new Lead</strong> with name, email, company, signal data</li>
    <li>Lead sits in queue until claimed or auto-assigned</li>
  </ol>
  <pre><code>Before: Nothing in Salesforce
After:  New Lead → "Sarah Chen at NewStartup.io"</code></pre>
</div>

<div class="scenario">
  <h4>Scenario 3: Both already exist</h4>
  <p><em>DispatchHealth is an Account, John Smith is a Contact. He visited pricing again.</em></p>
  <ol>
    <li>Finds both → already linked ✅</li>
    <li><strong>Updates signal data</strong> on Account + Contact</li>
  </ol>
  <pre><code>Before: GTM_Signal_Score = 65
After:  GTM_Signal_Score = 85, Last Signal = today</code></pre>
</div>

<div class="page-break"></div>

<div class="keep">
<h3>When does the sync happen?</h3>
<ol>
  <li><strong>Real-time:</strong> Every new signal triggers an immediate Salesforce check. Within seconds.</li>
  <li><strong>Every 15 minutes (safety net):</strong> Batch job pulls fresh ownership data and pushes missed updates.</li>
</ol>
</div>

<div class="keep">
<h3>How many API calls does this use?</h3>
<p>Estimated based on <strong>50,000 monthly visitors</strong> to the US site:</p>
<table>
  <tr><th>Step</th><th>Math</th><th>Calls/Day</th></tr>
  <tr><td><strong>RB2B identifies ~5-15%</strong></td><td>50k × 10% ≈ ~167/day</td><td>—</td></tr>
  <tr><td>Account lookup <span style="color:#16a34a">✓</span></td><td>167 × 1 SOQL</td><td><strong>167</strong></td></tr>
  <tr><td>Contact lookup <span style="color:#16a34a">✓</span></td><td>167 × 1 SOQL</td><td><strong>167</strong></td></tr>
  <tr><td>Record creation (~30% new)</td><td>167 × 30%</td><td><strong>~50</strong></td></tr>
  <tr><td>Campaign association</td><td>~50 new + ~117 existing</td><td><strong>~167</strong></td></tr>
  <tr><td>Cron: pull ownership <span style="color:#16a34a">✓</span></td><td>96 runs × 1 query</td><td><strong>96</strong></td></tr>
  <tr><td>Cron: push signals</td><td>~200 domains</td><td><strong>~200</strong></td></tr>
  <tr><td>Cron: push contacts</td><td>~100 contacts</td><td><strong>~100</strong></td></tr>
  <tr style="background:#f0f9ff;font-weight:600;"><td>Estimated Daily Range</td><td></td><td>~500 – 2,500</td></tr>
</table>
</div>

<div class="callout">
  <div class="callout-title">💡 Capacity Headroom</div>
  <p>Salesforce allows <strong>15,000/day</strong> (Professional) to <strong>100,000/day</strong> (Enterprise). Even at ~2,500/day we use <strong>~17%</strong> of the cheapest tier. Massive headroom.</p>
  <p class="range">✓ = verified from source code. Volume estimates validated once live.</p>
</div>

<div class="keep">
<h3>What gets written to Salesforce?</h3>
<p><strong>On every Account:</strong> <code>GTM Signal Score</code>, <code>GTM ICP Tier</code>, <code>GTM Last Signal Date</code>, <code>GTM Signal Count</code>, <code>GTM Current ATS</code>, <code>GTM Web Visit Count</code></p>
<p><strong>On every Contact/Lead:</strong> <code>GTM Contact Score</code>, <code>GTM Last Page Visited</code>, <code>GTM Web Visits</code></p>
<p><strong>On CampaignMember:</strong> Auto-associated to Jesper's campaign with status "Responded"</p>
</div>

<div class="keep">
<h3>What gets pulled from Salesforce?</h3>
<ul>
  <li><strong>Account Owner</strong> — Routes signals to the right rep</li>
  <li><strong>Lead Status</strong> — Worked, converted, or disqualified</li>
  <li><strong>Account details</strong> — Industry, type, scoring data</li>
</ul>
</div>

<div class="page-break"></div>

<h2>How It All Connects — End to End</h2>
<p>The complete flow from anonymous visitor to actionable rep intelligence:</p>
<img src="${img3}" alt="End to End Flow" style="max-width:70%;">

<hr>

<div class="keep">
<h2>Security & Best Practices</h2>
<ul>
  <li><strong>OAuth2 authentication</strong> — No passwords stored. Standard Salesforce-recommended flow</li>
  <li><strong>Dedicated integration user</strong> — API calls from a service account</li>
  <li><strong>Audit logging</strong> — Every sync logged with timestamps and record IDs</li>
  <li><strong>Loop prevention</strong> — Records tagged <code>GTM_Signal_Source__c = "GTM Workspace"</code></li>
  <li><strong>Rate limiting</strong> — Well within Salesforce daily limits</li>
  <li><strong>No packages</strong> — Just a Connected App + custom fields</li>
</ul>
</div>

<hr>

<h2>What Reps See</h2>
<div class="keep">
<h3>In the GTM Workspace:</h3>
<ul>
  <li>Every account shows a <strong>☁ cloud icon</strong> with SFDC sync status</li>
  <li>Account Drawer: <strong>Salesforce CRM panel</strong> — Account ID, Owner, last sync, SFDC contact coverage</li>
</ul>
</div>
<div class="keep">
<h3>In Salesforce:</h3>
<ul>
  <li>New Leads appear with <code>LeadSource = "RB2B Intent Signal"</code></li>
  <li>Accounts show live signal scores, ICP tier, web visit counts</li>
  <li>Contacts show engagement data and last page visited</li>
  <li>Campaign Members auto-appear on Jesper's campaign for attribution</li>
  <li>All automatic — reps don't lift a finger</li>
</ul>
</div>

</body>
</html>`;

const htmlPath = '/tmp/how_it_all_works.html';
writeFileSync(htmlPath, html);
execSync(`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --no-sandbox --print-to-pdf="/Users/ryan.walker/Desktop/GTM_Workspace_Technical_Overview.pdf" --no-pdf-header-footer ${htmlPath}`, { timeout: 30000 });
console.log('✅ PDF saved to Desktop/GTM_Workspace_Technical_Overview.pdf');
