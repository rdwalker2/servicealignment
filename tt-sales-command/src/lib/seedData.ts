// ============================================================
// Seed Script — Discovery Room Sessions
// Two real accounts with full transcript data:
//   A) Acquire2Win — Megan Baker + Tim Williamson (2 calls)
//   B) Scout Clinical — Katie Eiseman + Tanya Davis (2 calls)
// ============================================================

import type { DiscoverySession, AlignmentChecks, ROIInputs, BAPAnswer, GranolaNote } from './discoveryDatabase';
import mockClosedLostOpps from './mockClosedLostOpps.json';

// ── Build the single real Acquire2Win session ──

function buildAcquire2WinSession(): DiscoverySession {
  // Call 1 with Megan: 5/29/2026
  const call1Date = new Date('2026-05-29T14:00:00-04:00');
  // Call 2 with Tim: 6/8/2026
  const call2Date = new Date('2026-06-08T14:00:00-04:00');
  const createdAt = call1Date.toISOString();

  // Next step: Tim + Megan connect after her vacation (~week of 6/15)
  const nextFollowUp = new Date('2026-06-16T15:00:00-04:00');

  const session: DiscoverySession = {
    id: `ds_acquire2win_${Date.now()}`,
    rep_id: 'rep-jl',
    company_name: 'Acquire2Win',
    company_id: null,
    persona: 'all',              // Multi-persona: Megan (ops/talent), Tim (CEO)
    current_ats: 'None',         // Using spreadsheets — first ATS purchase
    industry: 'Professional Services',
    company_size: '1-50',        // 4 partners + 5 W-2s + ~15 1099s
    use_case: 'first-ats',       // First real ATS / talent CRM purchase

    // ── Pricing Config ──
    pricing_setup_type: 'single',
    pricing_presentation_style: 'options',
    pricing_packages: [
      { id: 'good', name: 'Core Platform', description: 'Centralize your contractor talent pool with tags, search, and pipeline management.', addon_ids: [] },
      { id: 'better', name: 'Growth', description: 'Core + Connect Talent CRM for nurture campaigns and automated contractor engagement.', addon_ids: ['connect'] },
      { id: 'best', name: 'Enterprise', description: 'Full suite: Connect CRM + Advanced Analytics for pipeline intelligence.', addon_ids: ['connect', 'analytics'] }
    ],
    pricing_employee_count: 20,  // 5 W-2 + 15 1099 = 20 total users
    pricing_vertical: 'staffing',
    pricing_discount_pct: 10,
    pricing_add_ons: [
      { id: 'connect', name: 'Connect (Talent CRM)', price: 1200, included: true, waived: false },
      { id: 'sso', name: 'SSO (SAML)', price: 900, included: false, waived: false },
      { id: 'analytics', name: 'Advanced Analytics', price: 1500, included: false, waived: false },
      { id: 'sms', name: 'SMS Messaging', price: 600, included: false, waived: false },
    ],
    pricing_notes: '10% discount if closed before 6/30. Onboarding fee ($420) waived. TT is $350/mo vs Ashby at $400/mo — price advantage. Budget ceiling is $5K/yr.',

    // ── Stakeholders (Updated with Tim from Call 2) ──
    stakeholders: [
      {
        id: 'sh_megan',
        role: 'Champion',
        name: 'Megan Baker',
        title: 'Partner — Business Operations & Talent (New York)',
        persona_id: 'hiring-manager',
      },
      {
        id: 'sh_tim',
        role: 'Economic Buyer',
        name: 'Tim Williamson',
        title: 'Managing Partner / CEO (Atlanta)',
        persona_id: 'chro',
      },
      {
        id: 'sh_partner_sea',
        role: 'Project Lead',
        name: 'Partner (Seattle)',
        title: 'Partner — Seattle (will interview candidates, give feedback)',
      },
      {
        id: 'sh_partner_la',
        role: 'Project Lead',
        name: 'Partner (LA)',
        title: 'Partner — Los Angeles (will interview candidates, give feedback)',
      },
    ],

    // ── Alignment Checks (validated across both calls) ──
    alignment_checks: {
      urgent_priority: true,         // Megan: "I'm fed up and I'm ready to make a move." Tim: "we got a big need around this"
      resources_insufficient: true,   // Megan: "It's not scalable. I can't keep it up to date." Tim: "it's super manual right now"
      problems_solutions: true,       // Tim: "This is awesome. It's super clear why Megan is keen." Saw full demo.
      roi_sufficient: false,          // ROI not formally discussed — but Tim sees time savings value
      right_solution: false,          // Still comparing with Ashby. Tim needs to confer with Megan.
    },
    mutual_commitments: {
      executive_sponsor: true,        // Tim Williamson — attended demo call, engaged, positive
      dedicated_admin: true,          // Megan Baker — she will be the admin
      training_completion: false,     // Not discussed yet
    },
    blueprint_approved: false,

    // ── Pains Identified (from both transcripts) ──
    selected_pains: [
      'weak-talent-pools',           // No proactive talent pipeline — can't match skills to engagements
      'dead-nurture-pipeline',       // Can't keep contractors warm; monthly sync is only touchpoint
      'tool-sprawl-centralization',  // Spreadsheet + DocuSign + Gusto + Harvest + Gmail — no single source of truth
      'no-pipeline-visibility',      // Partners can't trust the spreadsheet data; "is this the right thing?"
      'recruiter-admin-heavy',       // Megan spending too much time on manual admin instead of matching
      'poor-candidate-communication', // No communication cadence; Tim: "It's been a month. That's too long."
    ],

    // ── ROI Inputs (conservative for small company) ──
    roi_inputs: {
      hiringManagers: 4,       // 4 partners who evaluate candidates
      totalHires: 50,          // ~50 contractor engagements/year ("50 projects in a year")
      agencyHires: 0,          // All sourced via network, no agencies
      timeToHire: 7,           // "we need somebody by 1 week from now"
      // SMB modules
      annualJobBoardSpend: 0,
      expectedJobBoardSavings: 0,
      hrHourlyRate: 75,        // Megan's time as partner ($150K+ salary / 2000 hrs)
      hmHourlyRate: 100,       // Partner interview time (Tim, Seattle, LA partners)
      hrHoursSavedPerHire: 2,  // Time saved per contractor intake (no more spreadsheet search)
      hmHoursSavedPerHire: 0.5,
    },
    roi_total: 13750,          // Estimated: 50 hires × (2hrs×$75 + 0.5hrs×$100) = $10K/yr in time + data integrity value

    // ── BAP Answers (comprehensive — both calls) ──
    bap_answers: {
      // D1 — Discovery
      q1: 'yes',    // Problem or Goal: Spreadsheet is broken, need to automate contractor management
      q2: 'yes',    // Stakeholders: Megan (Champion), Tim (EB), 2 other partners
      q3: 'yes',    // Current Approach: Mapped in detail — spreadsheet + DocuSign + monthly sync
      q4: 'yes',    // Priority: "I'm fed up" (Megan) + "big need" (Tim) — 4 demos in 1 day
      q5: 'yes',    // Current Approach Detailed: Full process mapped across both calls
      q6: 'yes',    // Capability Gap: "It's not scalable" + "not just time, it's accuracy" (Tim)
      q7: 'yes',    // External Help Needed: Actively shopping 4 vendors, already rejected 1
      // D2 — Diagnosis
      q8: 'yes',    // Root Cause Identified: Spreadsheet built for 10 contractors, business scaled 5x
      q9: 'maybe',  // Proven Results: Haven't shown A2W-specific case study yet. Need consulting vertical proof.
      // D3 — Demonstrate
      q10: 'yes',   // Demo Completed: Tim saw full demo on 6/8. "This is awesome."
      q11: 'maybe', // Solution Fit Confirmed: Tim positive but needs to confer with Megan before confirming
    },
    bap_notes: {
      q1: "Megan (5/29): 'my list is now 50, it's 20 columns. I'm realizing that like it's not scalable. I can't keep it up to date.' Tim (6/8): 'we got a big need around this and it's super manual right now.'",
      q2: "Megan Baker = Champion (Partner, Biz Ops & Talent, NY). Tim Williamson = Economic Buyer (CEO/Managing Partner, ATL). Two other partners (SEA, LA) will rubber-stamp. Megan: 'In all likelihood, they're going to say just go make a decision.'",
      q3: "Current process: Sourcing via family/friends/referrals → 1:1 intake call → Google Sheet entry → NDA via DocuSign → Work sample → Monthly consultant sync → Manual spreadsheet search for deployment → Client-specific onboarding → Harvest for time/invoicing → Gusto for payroll.",
      q4: "Megan: 'I'm fed up and I'm ready to make a move. Transparently, you're my 4th demo today. I move quick.' Tim: 'we got a big need around this.' Both express urgency — Megan emotional, Tim strategic.",
      q5: "Google Sheet (50+ contractors, 20 columns), DocuSign (NDAs), Gusto (HRIS/payroll), Harvest (time tracking/invoicing), Google Workspace (Gmail, Meet, Calendar). Monthly consultant sync is only nurture mechanism. Tim: 'currently we're using a CRM, so we're about to change that.'",
      q6: "Megan: 'Everyone's like, is this the right thing? And I'm like, I don't know anymore.' Tim: 'it's not just time, it's like being more accurate and being more on the ball.' Gap = no matching, no nurture, no data integrity, no speed to deploy.",
      q7: "Megan explicitly said 'I don't want that process anymore.' 4 vendor demos in 1 day. LeanLayer (friend's company) recommended TT and Ashby specifically. Manatal rejected. Recruit CRM status unknown.",
      q8: "Root cause: Spreadsheet was built for 10 contractors and 2 engagements. Business scaled 5x (now 50+ contractors, 15 1099s, 5 W-2s) but infrastructure didn't follow. Tim frames it as 3 business capabilities they lack: 1) Identify & pool talent, 2) Match to deals by skill/geography/industry, 3) Keep communication cadence to stay top of mind.",
      q9: "Haven't shown consulting/staffing-specific case study. Need to demonstrate TT works for talent pool/CRM use case, not just traditional ATS recruiting. Scandinavian Executive case study is closest match.",
      q10: "Tim (6/8): 'This is awesome. It's super clear why Megan is keen.' 'I love the tagging so that you can get some really scaled data in there.' 'The nurture piece makes a ton of sense.' 'the user interface is really easy.' 'very, very, very cool and a good need that you're solving.' Impressed by: tagging, nurture campaigns, UI ease of use. Lukewarm on: analytics, AI report builder.",
      q11: "Tim is positive but cautious: 'I don't know exactly what the value is for our size, but you seem to think that you want this. So let me at least get my head wrapped around it before we start spending the money.' Needs to confer with Megan when she returns from vacation (~week of 6/15).",
    },
    custom_bap_questions: { d1: [], d2: [], d3: [] },

    budget_confirmed: false,         // Tim hasn't formally approved spend. Megan: "I can make the case for it pretty easily"
    implementation_timeline: '2 weeks',
    deal_value: 4200,                // $4,200/year quoted by Jack ($350/mo)
    deal_stage: 'evaluating',         // Two calls complete, demo shown to EB, now in evaluation
    next_action: 'Send Tim call recording + sandbox invite + YoY growth data + article on AI report builder. Wait for Megan to return from vacation (~6/15). Follow up Monday 6/16 at 3pm ET.',
    next_meeting_date: nextFollowUp.toISOString(),
    qa_completed: false,
    buyer_intent_validated: true,    // Tim: "This is awesome. It's super clear why Megan is keen."
    status: 'in_progress',
    created_at: createdAt,
    completed_at: null,

    // ── MEDDPICC Fields (comprehensive from both calls) ──
    pain_narrative: `Megan's spreadsheet tracking 50+ contractors across 20 columns has hit critical mass. Partners are asking "is this the right thing?" and she says "I don't know anymore." When clients call for last-minute engagement staffing — "we're closing tomorrow, we need somebody by 1 week from now" — she has to "run around like chickens with our heads cut off" searching the spreadsheet.

Tim frames the business need as three capabilities they lack: (1) Identify people and put them into a talent pool, (2) Match them to the right deals/acquisitions by skill set, geography, and industry, (3) Keep a communication cadence to stay top of mind. He says "it's not just time, it's like being more accurate and being more on the ball with some of this stuff."

The monthly consultant sync call is their only nurture mechanism — "that's the only touchpoint I have with them until I need to call somebody." They have more engagements than they can deliver against, meaning lost revenue due to inability to quickly staff.`,

    success_metrics_text: `Time-to-deploy: Find and deploy the right consultant within 24 hours of client call (currently takes days of manual spreadsheet searching). Data integrity: Partners can trust the system as the single source of truth. Nurture cadence: Automated touchpoints at least monthly with all 50+ contractors. Contractor engagement: NPS-style feedback to improve employer brand for consultants. Growth readiness: System that scales from 20 to 50+ people without breaking.`,

    decision_criteria: `1. Talent pool / CRM functionality (NOT job-centric — evergreen consultant role concept)
2. Ease of use for non-recruiter (Megan: "I like the look and feel — doesn't feel built on a spreadsheet")
3. Price ≤ $5,000/year (TT at $4,200 is under budget ✅)
4. Nurture / drip campaigns for contractor pool (Tim: "The nurture piece makes a ton of sense")
5. Tagging & filtering for skill-based matching (Tim: "I love the tagging")
6. Native integrations: DocuSign, Gusto, Gmail/Google
7. Custom onboarding templates per client engagement (Salesforce, HubSpot examples)
8. Multi-user collaboration for 4 partners + contractors
9. NPS surveys for consultant engagement
10. Scalable — must grow from 20 to 50+ users`,

    decision_process: `1. Megan conducted all 4 vendor demos on 5/29 (TT, Ashby, Recruit CRM, Manatal)
2. Megan evaluated and recommended TT to Tim
3. Tim got a dedicated demo from Jack on 6/8 — "cold turkey, 101 is great for me"
4. Tim was very positive: "This is awesome. It's super clear why Megan is keen."
5. Megan is on vacation week of 6/8. Tim will review recording.
6. Tim + Megan connect when she returns (~week of 6/15) to make final decision
7. Tim wants to rewatch recording, review sandbox, then come back with next steps
Risk: Tim's "value for our size" concern — main objection is whether the spend is justified for a 20-person company.`,

    paper_process: 'No formal procurement or legal review — small partnership. Annual agreement via e-signature. Likely credit card or ACH payment. DocuSign for contract (ironic — they use DocuSign daily). Same-day turnaround offered by Jack.',

    champion_name: 'Megan Baker — Partner, Business Operations & Talent',
    champion_validation_notes: `STRONG CHAMPION. Megan is the only partner focused on ops/talent. She said "I'm the best one for the job out of the 4 of us." She did 4 demos in one day — extremely motivated. She told Tim about TT and Tim said she "came back and introduced you guys." Partners will defer: "In all likelihood, they're going to say just go make a decision."

Champion test: Will she sell when Jack isn't in the room? YES — she already pitched Tim on doing this call. Tim confirmed: "Megan came to me and said, it's time for us to go think about a solution."

Background: Entire career in B2B software. Worked at Comcast (used Greenhouse) and Beamery (talent CRM). NYU alum. Deeply understands the CRM/ATS category.`,

    competitive_situation: `ASHBY — PRIMARY THREAT ($400/mo ≈ $4,800/yr)
• Megan liked: "interesting pricing model, no hidden stuff, meets my needs"
• Ashby's analytics suite is typically their key differentiator
• HOWEVER: Megan said "I don't think analytics is as relevant right now for us" — neutralizes Ashby's advantage
• Tim did NOT mention Ashby or any competitor — relying on Megan's evaluation

RECRUIT CRM — UNKNOWN STATUS
• Megan demoed on 5/29 but gave no specific feedback
• No mention in Tim call

MANATAL — ELIMINATED ❌
• Megan: "I don't like them. Very rudimentary. Pricing ratchets up. No native integrations."

STATUS QUO (Spreadsheets) — LOW RISK
• Both Megan and Tim are committed to buying something. The question is which vendor, not whether to buy.

TT ADVANTAGES vs ASHBY:
• Price: $350/mo vs $400/mo (TT wins by $600/yr)
• UI: "I like the look and feel" — Megan preferred TT's design
• Nurture: Connect CRM + campaigns vs Ashby's more ATS-focused approach
• Onboarding: Custom per client engagement — unique TT capability
• Tim's reaction: "This is awesome" — strong product impression`,

    economic_buyer_access: `DIRECT ACCESS — Tim Williamson (CEO/Managing Partner, Atlanta).
Tim attended a dedicated demo call on 6/8. He runs the company: "I run the company."
He's the final decision maker. Megan was previously listed as EB but Tim clarified the dynamic:
"Megan came to me and said, it's time for us to go think about a solution. And I said, okay, go take a look and tell me what you think. She came back and introduced you guys and I said, I don't know exactly what the value is for our size, but let me at least get my head wrapped around it before we start spending the money."
Budget not formally allocated but Megan says she can "make the case for it pretty easily." Max $5K/year.`,

    roi_summary_text: `Conservative ROI estimate for Acquire2Win:
• 50 contractor engagements/year × 2 hrs saved per engagement × $75/hr (Megan's time) = $7,500/yr in recruiter time
• 50 engagements × 0.5 hrs saved per engagement × $100/hr (partner time) = $2,500/yr in HM time
• Data integrity value: Eliminate partner confusion ("is this the right thing?") — trust in system = faster decisions
• Urgency premium: Being able to deploy within 24hrs vs days of spreadsheet searching = won engagements they'd otherwise lose
• Total quantifiable: ~$10,000-$13,750/yr in time savings alone
• TT cost: $4,200/yr = 3.3x ROI on time savings alone, before revenue impact
• Revenue impact: "We have more engagements than we can actually deliver against" — even one additional staffed engagement ($10K+) exceeds annual TT cost`,

    // ── Call Sheet Answers (comprehensive from both calls) ──
    call_sheet_answers: {
      q1: 'Spreadsheet-based contractor management has hit critical mass — 50+ contractors, 20 columns, data untrustworthy. Need ATS/CRM for talent pool management, nurture campaigns, and rapid contractor-to-engagement matching. Tim frames 3 pillars: (1) Identify & pool talent, (2) Match to deals by skill/geography/industry, (3) Keep communication cadence.',
      q1b: 'Megan Baker — Partner, Business Operations & Talent (Champion). Tim Williamson — Managing Partner / CEO (Economic Buyer). Megan owns the problem and evaluates solutions. Tim approves the spend.',
      q2: 'Post-acquisition integration consulting. 4 partners (NY, ATL, SEA, LA), 5 W-2 employees, ~15 active 1099 contractors. Growth plan: 6 W-2s by EOY 2026, 12 by 2027, 20 by 2028. Always maintaining healthy 1099 pipeline. Exit strategy: sell before reaching 100 people.',
      q3: ['weak-talent-pools', 'dead-nurture-pipeline', 'tool-sprawl-centralization', 'no-pipeline-visibility', 'recruiter-admin-heavy', 'poor-candidate-communication'],
      q4a: "None — first ATS purchase. Currently using Google Sheets. Megan has used Greenhouse (at Comcast) and worked at Beamery (talent CRM). Tim has tech background but no ATS experience.",
      q4b: "Gusto (HRIS/payroll), DocuSign (NDAs — critical for M&A confidentiality), Google Workspace (Gmail, Meet, Calendar), Harvest (time tracking/invoicing). Tim also mentioned using 'a CRM' for talent — about to replace.",
      q5: "Tim: 'This is awesome. It's super clear why Megan is keen.' Loved tagging ('I love the tagging so that you can get some really scaled data'), nurture campaigns ('makes a ton of sense'), and UI ease of use ('really easy'). Megan: 'I like the look and feel. It doesn't feel like you guys built it on top of a spreadsheet.'",
      q8b: "Our contractors are fully organized into a talent pool with tags for their core competencies, availability, rates, and engagement history. When a client calls with an urgent engagement — 'closing tomorrow, need somebody in a week' — we filter the pool by skill set, geography, and availability and deploy the right person within 24 hours. No more chickens with heads cut off.",
    },
    call_sheet_checkpoints: {},
    call_sheet_checkpoint_reasons: {},
    call_sheet_persona: 'all',
    call_sheet_cost_of_problem: "Megan spends ~2 hours per contractor intake doing manual spreadsheet work. At $75/hr across 50 engagements = $7,500/yr. Partners spend ~30 min extra per engagement on coordination = $2,500/yr. Plus lost engagements due to inability to rapidly staff — 'we have more engagements than we can actually deliver against.' One missed $10K+ engagement exceeds TT annual cost.",
    call_sheet_target_date: 'Decision after Megan returns from vacation (~week of 6/15). Tim will review recording and sandbox. Originally wanted to decide within 1 week of demos (5/29) but timeline slipped when Tim needed his own demo.',

    // ── CS Handoff Fields ──
    handoff_current_hris: 'Gusto',
    handoff_calendar_system: 'Google Calendar',
    handoff_sso_provider: '',
    handoff_sso_required: false,
    handoff_infosec_review_required: false,
    handoff_current_career_site_url: '',  // No career site — internal consulting firm
    handoff_custom_domain: '',
    handoff_brand_maturity: 'none',       // No employer brand presence, but Megan wants NPS for consultants
    handoff_department_count: 1,           // One department — consulting
    handoff_location_count: 4,             // NY, ATL, SEA, LA
    handoff_active_hiring_managers: 4,     // 4 partners who evaluate/interview contractors
    handoff_active_recruiters: 1,          // Megan is the sole recruiter
    handoff_active_jobs_count: 1,          // One evergreen consultant role (never posted externally)
    handoff_candidate_count_estimate: 50,  // "my list is now 50" — Tim said ~15 active 1099s
    handoff_data_migration_notes: 'Google Sheet with 50+ contractors and 20 columns. Key columns: location, skill set, availability, bandwidth, rate history, engagement preference (half/full-time), NDA status. Need to import all records + tag structure.',
    handoff_job_boards: [],                // Internal-only hiring — engagements never posted externally
    handoff_hris_integration: 'Gusto',
    handoff_other_integrations: ['DocuSign', 'Google Meet'],
    handoff_target_go_live_date: '',
    handoff_launch_type: '',
    handoff_go_live_notes: "Megan wants to get organized before feeling more overwhelmed: 'I'm trying to get ahead of the fact that I'm already feeling overwhelmed.' Expects bare-bones setup initially, build as they go. Tim requested sandbox access to poke around.",
    handoff_users_to_train: 6,             // 4 partners + Megan + 1 W-2 (updated from Tim call: 5 W-2s)
    handoff_training_format: '',
    handoff_training_notes: "Megan is tech-savvy (B2B software career, worked at Beamery). Tim has tech background. Partners need lightweight access to review candidates and give interview feedback. Tim: 'the user interface is really easy.' Low training burden expected.",
    handoff_primary_contact_email: '',      // Need to collect
    handoff_it_contact_email: '',
    handoff_preferred_comm_channel: 'email',
    handoff_target_time_to_hire: 7,        // "need somebody by 1 week from now"
    handoff_target_cost_per_hire: 0,
    handoff_target_adoption_rate: 0,
    handoff_success_review_date: '',
    handoff_prework_items: [
      'Export Google Sheet contractor data for import (50+ records, 20 columns)',
      'List of DocuSign NDA templates for workflow automation',
      'Map client engagement types for custom onboarding templates (e.g., Salesforce, HubSpot)',
      'Define tag taxonomy: skills, seniority, availability, rate ranges, geography',
    ],
    handoff_prework_notes: 'Key clients mentioned for custom onboarding: Salesforce, HubSpot. Each client has bespoke onboarding docs.',
    handoff_gdpr_applicable: false,        // US-only for now
    handoff_data_retention_months: 0,
    handoff_dpa_required: false,
    handoff_compliance_notes: 'All contractors sign NDAs due to M&A confidentiality. DocuSign integration is critical for this workflow. Acquisition work requires strict information barriers.',

    // ── Deal Intelligence ──
    contract_end_date: '',                 // No existing contract — first ATS
    competing_priorities: 'Also shopping for accounting software (mentioned by Megan). Looking at total software costs holistically. Minor overlap concern with Gusto onboarding module. Tim asked about TT company background (revenue, growth, employee count) — evaluating vendor stability.',
    competitors_identified: 'Ashby (~$400/mo, liked "no hidden stuff", strong analytics — BUT Megan said analytics not relevant for their size), Recruit CRM (unknown status), Manatal (rejected — rudimentary, pricing ratchets up, no native integrations)',
    competitors_count: 2,                  // Ashby + Recruit CRM still potentially in play
    sentiment_score: 8,                    // Tim: "This is awesome." Megan: "You're very good at your job."
    sentiment_gap: "Primary risk: Tim's 'value for our size' concern. He needs to be convinced the spend is justified for a 20-person company. Secondary: Copilot job-level auto-matching is a work in progress (Megan wanted auto-top-3 candidates per engagement). Mitigant: ROI math shows 3.3x return on time savings alone.",
    existing_tt_customer: false,
    budget_ballpark_requested: true,       // Megan asked about pricing on Call 1. Jack quoted $4,200/yr.
    demo_prep_checklist: {
      // Call 1 (Megan 5/29) — high-level overview
      'talent-pool-workflow': true,        // Shown — Connect feature, talent pools
      'nurture-campaigns': true,           // Shown — campaign builder, drip emails
      'evaluations': true,                 // Shown — scorecard feature
      'scheduling': true,                  // Shown — Calendly-like scheduling
      'onboarding': true,                  // Shown — custom per client engagement
      'integrations': true,                // Discussed — Gusto, DocuSign, Gmail
      'copilot-ai': true,                  // Shown — AI search, ChatGPT 5.5 built-in
      'pricing-proposal': true,            // Quoted $4,200/yr
      // Call 2 (Tim 6/8) — 101 demo for EB
      'add-candidate-flow': true,          // Tim: "can you click on add candidate and let me see what that looks like?"
      'tagging-filtering': true,           // Tim: "I love the tagging so you can get scaled data"
      'analytics-overview': true,          // Shown briefly — Tim moved past quickly
      'ai-report-builder': true,           // Shown — Tim: "Yeah, that'd be cool" (lukewarm)
      'jobs-tab': true,                    // Tim: "let me see the finished product"
      'career-site': true,                 // Tim: "this is what you'd build within the A2W website?"
      'pre-interview-questions': true,     // Screening questions discussed
      // GAP — still needed
      'custom-contractor-workflow': false,  // NOT shown — need this for custom demo
    },

    // ── Room Configuration ──
    // Enable relevant playbooks for consulting/first-ATS/talent-pool use case
    enabled_playbook_ids: [
      'playbook-first-ats',              // Zero to Live: first ATS purchase — exactly their situation
      'playbook-silver-medalist',        // Never Lose a Silver Medalist — maps to contractor nurture
      'playbook-solo-recruiter',         // Solo Recruiter Survival Kit — Megan is team of one
      'playbook-hiring-intelligence',    // Kill the Spreadsheet — their #1 pain
      'playbook-communication-autopilot', // Candidate Communication Autopilot — maps to nurture cadence
    ],

    // Enable relevant case studies (SMB, professional services, consulting)
    enabled_study_names: [
      'Scandinavian Executive',   // Executive search boutique — closest to their consulting model
      'ESTO',                     // FinTech ~100 employees — SMB professional services
      'Giacom',                   // IT Services ~200 employees — SMB with referral focus
      'Pemo',                     // FinTech ~100 employees — SMB scaling hiring
      'Dacha Real Estate',        // Real estate ~150 employees — professional services, small team
    ],

    // ── Room Visibility (what to show/hide for prospect) ──
    room_visibility: {
      hero: true,                  // Show — personalized greeting with stakeholder badges
      pains: true,                 // Show — pain cards from both Megan + Tim quotes
      problemCanvas: true,         // Show — executive brief with their specific problem framing
      diagnosis: true,             // Show — root cause reframe (spreadsheet scaling failure)
      competitive: false,          // HIDE — they have no current ATS, competitive comparison not relevant
      paradigmShift: true,         // Show — emotional pivot from "hope" to "design" resonates with their chaos
      solution: true,              // Show — 3 Pillars (Captivate/Capture/Convert) — focus on Capture + Convert
      playbooks: true,             // Show — first-ATS, solo-recruiter, kill-spreadsheet playbooks
      socialProof: true,           // Show — Scandinavian Executive + SMB case studies
      roi: true,                   // Show — 3.3x ROI on time savings to address Tim's "value for size" concern
      map: false,                  // HIDE — not in decision stage yet
      contractSecurity: false,     // HIDE — not in decision stage yet
      proposal: false,             // HIDE — not in decision stage yet (pricing discussed but not formal proposal)
      minimumStandards: false,     // HIDE — not in decision stage yet
    },

    hris: 'Gusto',
    granola_notes: [],
    rep_forecast: 75,              // Upgraded from 65: Tim very positive, both stakeholders engaged, under budget, main risk is "value for size"

    // ── Diagnosis Reframe Overrides (synthesized from both calls) ──
    diagnosis_bigger_problem_override: `Your business model lives and dies on talent readiness — clients call with 24 hours notice and you need the right consultant deployed within a week. Tim, you framed it perfectly: you need to (1) identify and pool talent, (2) match them to deals by skill set, geography, and industry, and (3) keep a communication cadence so they're always aware of Acquire2Win.

A spreadsheet can't do any of these three things at scale. It can't keep 50+ contractors warm, track their availability in real time, or instantly match skills to engagements. Every time you "run around like chickens with your heads cut off" searching a stale spreadsheet, you're risking failed delivery on engagements you've already won.

The problem isn't organization — it's that you have no system to maintain an always-on talent pipeline for a business that's inherently unpredictable. And as Megan said, "we have more engagements than we can actually deliver against" — meaning you're leaving revenue on the table right now.`,

    diagnosis_root_cause_override: `The spreadsheet was built for 10 contractors and 2 engagements. The business scaled 5x — you now have 50+ contractors, 15 active 1099s, 5 W-2 employees, and 4 partners across 4 cities — but the infrastructure didn't follow.

Partners can't trust the data ("is this the right thing?" — "I don't know anymore"). There's no nurture mechanism between engagements — the monthly sync call is the only touchpoint, and as Tim said, "It's been a month. That's too long." There's no way to rapidly match contractor skills to urgent client needs. And the manual process becomes a crisis every time a client calls with "we're closing tomorrow, need somebody by next week."

The root cause isn't that Megan isn't working hard enough. It's that she's using a tool designed for 10 people to manage a pipeline of 50+, in a business where speed to deploy is the difference between winning and losing engagements.`,

    diagnosis_current_approach_override: `Google Spreadsheet with 50+ contractors across 20 columns (location, skills, availability, rates, engagement preference, NDA status, etc.). DocuSign for NDAs — mandatory due to M&A confidentiality. Monthly consultant sync call as the only touchpoint between intake and deployment. Gusto for payroll/HRIS. Harvest for time tracking and invoicing. Gmail + Google Meet for communication.

When a client engagement comes in: Megan manually scrolls through the spreadsheet, starts calling people one by one to check availability, then manages bespoke onboarding documents per client (Salesforce has different requirements than HubSpot). Tim described it as "super manual" and confirmed they need to be "more accurate and more on the ball."`,

    // ── Demo Reactions (from Tim call 6/8) ──
    demo_reactions: {
      positive_reactions: [
        "Tim: 'This is awesome. It's super clear why Megan is keen.'",
        "Tim: 'I love the tagging so that you can get some really scaled data in there.'",
        "Tim: 'The nurture piece makes a ton of sense.'",
        "Tim: 'the user interface is really easy.'",
        "Tim: 'very, very, very cool and a good need that you're solving.'",
        "Tim: 'we would just save so much time with being able to automate.'",
        "Megan: 'I like the look and feel. It doesn't feel built on a spreadsheet.'",
      ],
      concerns: [
        "Copilot job-level auto-matching is a 'work in progress' — Megan wanted auto-top-3 candidates per engagement",
        "Nurture emails come from Teamtailor domain, not company domain",
        "Tim cautious about value for their company size",
      ],
      questions_asked: [
        "Tim: 'give me 2 minutes on the background of your company' — wanted to vet TT as vendor",
        "Tim: 'How many customers? Revenue? How long in business? Employees?'",
        "Tim: 'can you click on add candidate and let me see what that looks like?'",
        "Tim: 'when, where, and how do you add a tag?'",
        "Tim: 'this is what you'd build within the Acquire2Win website?' (career site)",
        "Megan: 'Where does the email come from? Could it come from Megan@Acquire2Win?'",
        "Megan: 'is there candidate availability type?' (tracking contractor availability over time)",
      ],
      aha_moment: "Tim seeing the tagging + nurture combination: 'I love the tagging so you can get scaled data... the nurture piece makes a ton of sense.' This maps directly to his 3-pillar framework (identify → match → nurture).",
      overall_notes: "Tim was very positive overall (sentiment 8/10). Most impressed by: tagging, nurture campaigns, UI ease of use. Lukewarm on: analytics (moved past quickly), AI report builder ('that'd be cool' but changed subject). Tim requested to rewatch the recording — strong buying signal.",
    },

    // ── Objections Tracker ──
    objections: [
      {
        id: 'obj_value_for_size',
        text: "Value for our size — Tim: 'I don't know exactly what the value is for our size, but let me get my head wrapped around it before we start spending the money.'",
        response: "ROI math: $4,200/yr TT cost vs $10K-$13.7K/yr in time savings = 3.3x ROI. Plus revenue impact: one additional staffed engagement ($10K+) exceeds annual TT cost. Price is under their $5K budget ceiling.",
        status: 'open' as const,
        raised_by: 'Tim Williamson',
        raised_date: '2026-06-08',
        category: 'price' as const,
      },
      {
        id: 'obj_copilot_job_match',
        text: "Copilot job-level auto-matching not ready — Megan wanted auto-top-3 candidates per engagement. Jack: 'work in progress with the job level.'",
        response: "Copilot AI search can find candidates by skills/tags/availability today. Job-level auto-matching is on the roadmap. Current workflow: post evergreen role → use Copilot to search talent pool → filter by tags. Gets 90% of the way there.",
        status: 'resolved' as const,
        raised_by: 'Megan Baker',
        raised_date: '2026-05-29',
        resolved_date: '2026-05-29',
        category: 'technical' as const,
      },
      {
        id: 'obj_email_domain',
        text: "Nurture emails come from Teamtailor domain, not Acquire2Win domain",
        response: "Megan asked and said 'Cool' — accepted this limitation. Not a blocker.",
        status: 'resolved' as const,
        raised_by: 'Megan Baker',
        raised_date: '2026-05-29',
        resolved_date: '2026-05-29',
        category: 'technical' as const,
      },
      {
        id: 'obj_software_overlap',
        text: "Potential overlap with Gusto onboarding — looking at total software costs",
        response: "Gusto onboarding is for HRIS/payroll. TT onboarding is for per-client engagement requirements (different docs for Salesforce vs HubSpot engagements). No functional overlap.",
        status: 'resolved' as const,
        raised_by: 'Megan Baker',
        raised_date: '2026-05-29',
        resolved_date: '2026-05-29',
        category: 'price' as const,
      },
    ],

    // ── Milestones ──
    milestones: {
      discovery_set: { date: createdAt, attendees: ['Jack Luther', 'Megan Baker'] },
      discovery_held: { date: createdAt, attendees: ['Jack Luther', 'Megan Baker'] },
      demo_held: { date: call2Date.toISOString(), attendees: ['Jack Luther', 'Tim Williamson'] },
      proposal_sent: null,  // Pricing discussed verbally but no formal proposal yet
    },

    // ── Additional fields ──
    lead_source: 'inbound',  // Referral from LeanLayer friend
    stakeholder_sentiment: {
      'sh_megan': { alignment: 'champion' as const, notes: "Extremely positive. 'I'm fed up and ready to make a move.' 'You're very good at your job.' Done 4 demos in one day — most motivated buyer.", last_updated: '2026-05-29' },
      'sh_tim': { alignment: 'supporter' as const, notes: "Very positive on product. 'This is awesome.' But cautious about spend — needs ROI justification. 'Let me get my head wrapped around it.'", last_updated: '2026-06-08' },
    },
    loss_reason: null,
    checkpoint_evidence: {
      cp1: "Urgency confirmed by both stakeholders. Megan: 'I'm fed up.' Tim: 'big need, super manual.' 4 demos in 1 day. Business impact: 'more engagements than we can deliver against.'",
      cp2: "Root cause identified: spreadsheet built for 10 contractors, business scaled 5x. 3-pillar gap framework from Tim. Both stakeholders validated the problem independently.",
      cp3: "Demo completed with EB (Tim, 6/8). 'This is awesome. Super clear why Megan is keen.' Tagged + nurture features addressed their exact use case. Pricing under budget.",
    },
  };

  return session;
}

// ── Build the Scout Clinical session ──

function buildScoutClinicalSession(): DiscoverySession {
  // Call 1 with Katie + Tanya: 5/15/2026
  const call1Date = new Date('2026-05-15T14:00:00-05:00');
  // Call 2 with Katie (custom demo): 5/22/2026
  const call2Date = new Date('2026-05-22T14:00:00-05:00');
  const createdAt = call1Date.toISOString();

  // Next step: check in with Katie on Friday after demos
  const nextFollowUp = new Date('2026-05-30T15:00:00-05:00');

  // ── Full Transcript — Call 1: Initial Chat (May 15, 2026) ──
  const call1Transcript = `Jack Luther: Hi Katie. Hi Tanya.
Katie Eiseman: Hello, how are you?
Jack Luther: I'm doing well today. How about yourself?
Katie Eiseman: Good, thanks.
Jack Luther: I think I saw you both were calling in from Dallas. Is that correct?
Katie Eiseman: Yes, that's correct. Nice.
Jack Luther: I was just there for Easter weekend.
Katie Eiseman: Okay.
Jack Luther: So like a month ago, uh, My partner's from there originally, and both of her parents still live there. So I've been— never before I met her, but I've been there a couple times since then. Um, okay. And I love the city.
Jack Luther: We've talked about potentially moving there. I'm in Chicago now, so, okay, a little different. But yeah, it's good to meet you guys. I always like speaking to people from Dallas because I'm somewhat familiar with the area.
Katie Eiseman: That's cool. Well, I'm actually originally from the Chicago area, so—
Jack Luther: well, small world.
Katie Eiseman: I know, it really is.
Jack Luther: It's, uh, hi, Tanya. Hi. Uh, I love it too. It's, um, I'm from— just to know, we do record these calls.
Jack Luther: Uh, I'm from the East Coast originally, so it's— what I like about Chicago is I feel like you get all the seasons out here, which is like an interesting, uh, phenomenon.
Jack Luther: Um, but the winters are tough, and like, we went to Dallas and April, 75 degrees. Yeah, exactly.
Katie Eiseman: Um, just visit here in the dead of summer and you might be like, okay, the winters aren't so bad compared to the summer.
Jack Luther: So I have, uh, I went to school at the University of South Carolina, so like I'm, I'm pretty well, I guess, spread out across the country. I have a few friends in the Austin, like in Austin, Austin area.
Jack Luther: I went there in August last year and was like, all right, I understand, like, the sticking for the Texas heat now. Like, that was—
Katie Eiseman: yeah, I don't know, I'll go back in August.
Jack Luther: Um, but great, glad we could connect, guys. I know we have 30 minutes, so I definitely want to, um, jump in and definitely share more on Teamtailor. I appreciate you taking the time and taking the call today.
Jack Luther: Um, typically for these 30-minute sessions, really casual, I think, early on, really looking to understand what you guys are looking for in an ATS.
Jack Luther: I did some, like, info gathering, so I think I have a rough idea of maybe where you're coming from, but, um, definitely love to hear about it, I think, from your end. And then I can also share some more on Teamtailor, more of myself.
Jack Luther: Um, and by the end of the call, I always love to show the system a little bit. Like, I hate getting on these calls and just talking the whole time and not actually showing you guys the software you were hoping to see.
Jack Luther: So like, I'm definitely going to dive in and show you the platform. Um, but I might have a couple questions beforehand. So, um, we can do some light introductions. I'll start with myself. Um, my name's Jack.
Jack Luther: Obviously I'm based here in our Chicago office.
Jack Luther: So Teamtailor globally originally based in Stockholm, Sweden, but we started a US expansion when I joined the company 2 or 3 years ago now, purely focused on, I think, infiltrating this market a little more.
Jack Luther: And we've done a lot of work in the States recently. We've got a lot more clients here since I've joined. I think we had around 500+ join us just last year alone.
Jack Luther: So if you guys were unfamiliar with the brand prior to maybe even booking this call, that's typically why, but really strong platform in general.
Jack Luther: For some added context, we have a little over 12,000 clients globally, are located on every single continent on the globe outside of Antarctica, which I think is a really cool thing.
Jack Luther: And then for us, I'll probably bring this up a lot of the times during the evaluation that you guys do, but because of that really strong support model, really strong customer success model, because we're global, we have 24/5 customer support, 24 hours a day, 5 working days of the week.
Jack Luther: You're getting an average response time from a human being in under like 2 to 5 minutes, which I think is almost unheard of in the software space nowadays.
Jack Luther: So like little things like that that I think we do really well and we're bringing to the United States for the first time as a company. So that's some background in the Teamtailor.
Jack Luther: For myself, I've been working in the HR tech space for 3 or 4 years or so, give or take. Started with like a DocuSign competitor selling only to like schools. But have shifted more into this like private business side of the house now.
Jack Luther: So that's background on me, background on Teamtailor. Katie, Tanya, I'd love to hear about, I think, each of your roles there at Scout.
Jack Luther: And then I know Katie booked the meeting, so maybe, you know, Katie, your viewpoint as to maybe why you guys are taking this call, what you're really looking for in an ATS.
Katie Eiseman: Tanya, do you want to introduce yourself first? Then I'll go and then go into what we're looking for.
Tanya Davis: I'm the head of HR here at Scout. I've been here, you know, 3 and a half years maybe. Um, and there was no HR before I showed up, so we've been pulling things together. Yes.
Tanya Davis: Um, Katie Eiseman is probably going to mention this, but we, you know, there was no ATS, there was no anything. So we had to kind of go cheap to get it approved.
Tanya Davis: Um, and now we're really looking to make sure that we have something that's gonna cover all the bases. So yeah.
Jack Luther: Awesome. Great. Nice to meet you, Tanya.
Katie Eiseman: Um, I'm Katie Eiseman. I'm the Talent Acquisition Lead here at Scout. I just started a couple months ago, so somewhat new to the company, but I have in my previous role implemented one or two other applicant tracking systems.
Katie Eiseman: So familiar with the concepts of how it all works.
Katie Eiseman: So, um, yeah, we, you know, are looking to— because of potential growth and just needing a little bit more robust of a system to kind of help us be more automated using the system letting the system work for us, you know, is kind of the time to start looking at new ATSs.
Katie Eiseman: We use Jazz and they— JazzHR, and they have been fine, but there's definitely some limitations that, you know, we kind of work around, but we're not fully utilizing the full system because of, you know, just some of the frustrations with what they do or don't do for us.
Tanya Davis: So Sure.
Katie Eiseman: You know, we're looking at a few different options. I'm not as familiar with Teamtailor. I know Tanya has heard of you guys before and is a little bit more familiar. So it's one of the reasons, you know, we're looking at you.
Katie Eiseman: Also, we just signed with TestGorilla for our skills assessment, and I believe you guys have an integration together. So that was another reason we're like, let's get them, you know, let's— let's look at this.
Katie Eiseman: And we also use ADP for our payroll or HRIS side of things. So, you know, wanting to make sure there's an integration with that as well.
Katie Eiseman: And really just kind of high level is, you know, we're wanting it to be an easy application process for our candidates where there's not a lot that they have to enter in when it comes to the apply process.
Katie Eiseman: We know the longer the process, the more potential for a drop-off rate. So we've got some specific questions around that.
Katie Eiseman: We currently don't use the offer process within Jazz right now, primarily because we're fine with the creating the document, but when we send it out to candidates and using the Dropbox sign feature, there's the email that gets sent to the candidate has a huge JazzHR logo, like front center on the email, and we want it to be branded for Scout, and they have no intention anytime soon to get rid of that or make it, you know, more user-friendly.
Katie Eiseman: Friendly for the clients to be able to brand. So, um, you know, we're definitely missing out on a good chunk of functionality by not taking advantage of any of that. We do it pretty much all externally. So, so that's kind of the high-level stuff.
Katie Eiseman: We can definitely go into details or, you know, more as, as you kind of go through your process.
Katie Eiseman: But that's high level of kind of where we're at right now and some of the high-level pain points and/or things that we're, you know, are top of mind for us that we're looking looking at for different solutions?
Jack Luther: I think, like, you guys are in a real common spot, I think, with JazzHR, from what I hear. Like, I work with, like, that's probably— I think of all the teams I work with, they're coming over from Jazz more than, like, any other system.
Jack Luther: Um, I think it's probably because, like, they're not innovating nearly as quick as a lot of these other tools.
Jack Luther: Like, I'm sure you guys are evaluating a lot of, like, how many— you don't need to, I think, dive into specific names, but I'd imagine 3 or 4 systems, probably. Um, like, that tends to be— yeah.
Jack Luther: Oh yeah, like, I think for us, like, what I'm starting to find from working with, like, other Jazz clients is, like, it's— they do the— I think you said it, Katie— like, the bare minimum stuff really well, but, like, the frustrations we have with them as a company in general make it really hard to want to, like, further embed ourselves.
Jack Luther: Um, so a lot of our system, I think, is built with that in mind. Like, The stuff that they do really well and that they nail on, our system also does really well and hits really well.
Jack Luther: And then the extra stuff, the job offers, the onboarding, making it just like a friendly application process is like where like we really tend to stick out. TestGorilla, ADP, two tools we integrate with. We integrate with most job boards as well.
Jack Luther: So I think I saw currently you post your jobs to LinkedIn. Indeed.
Katie Eiseman: Indeed. Yeah. Are kind of the— Yeah. We post a lot to, you know, some of those, the— do the free job board posting, but—
Jack Luther: Yes.
Katie Eiseman: Boosting, we usually do it with LinkedIn and Indeed primarily.
Jack Luther: Okay. So that's even better. So for us, and this is what I like to call out early on, is we have for free posting, direct integration, no fees from us, no fees from Indeed, LinkedIn.
Jack Luther: For promoted postings, we actually have like our own promotions portal within Teamtailor. That you can manage these different promotions. And we also have what we call internally our promote team.
Jack Luther: So they're kind of like a— I think the best way to word it is almost like an internal consultancy around promotions.
Jack Luther: So, you know, long-term, say you do decide to become Teamtailor clients, what's cool about the promote team is you can go with them and say, hey, we've budgeted aside, you know, $5,000, $10,000, whatever it is for hiring this year.
Jack Luther: How would you best recommend that we use it on these two different platforms, LinkedIn and Indeed? If they can kind of give past experiences, hey, here's how other, you know, companies we work with in your industry have found success.
Jack Luther: Funny enough, that's kind of like my next question. I think like your biggest problem recruitment-wise right now, I feel like I hear one of two.
Jack Luther: It's either we're not getting enough applicants for the roles that we're posting or we're getting way too many applicants and too many of them are like unqualified and I'm combing through just a bunch of nonsense.
Jack Luther: Like where would you guys say you right now?
Katie Eiseman: I, it really kind of depends on the job, but certain ones where we definitely get a ton of candidates because typically they're a little more entry-level.
Jack Luther: Yeah.
Katie Eiseman: But then some of our other ones where it's a little bit more specific, or, you know, kind of mid, mid-level or more you know, a little bit higher up from a level experience standpoint, we sometimes really struggle with finding the right candidates.
Katie Eiseman: And yes, I feel like we do get a lot that apply that aren't applicable or, you know, or we use knockout questions so they get knocked out, you know, from one of those just based on experience or skills. So we do kind of fall between the two.
Jack Luther: Perfect. Yeah, no problems there. And then I think last question on my end around like your process and the company before I kind of just start sharing my screen and jumping into a few things.
Jack Luther: Current process-wise, so obviously, Tanya, you oversee all of HR. Katie, you're more so the TA component. Are you two the only ones in HR talent acquisition, or is there anyone else typically involved in the process who would also be using the tool?
Tanya Davis: We have another HR person, and then we're about to hire one more. So nice. He would probably help with, you know, phone screening or, you know, creating a job posting, sort of entry.
Jack Luther: So like a generalist, they kind of help where they're needed, sort of. But it sounds like Katie, you'd be overseeing like the ATS functionality. Cool.
Katie Eiseman: Yeah.
Jack Luther: Um, great. And then in terms of hiring process, typically I think like the biggest complaint I hear from a lot of Jazz users is getting your hiring managers into the system can sometimes be a pain.
Jack Luther: For you guys at Scout, like, what does your current hiring workflow look like? Like an intake screening call, then maybe you pass them over to an interview, and then maybe there's an interview with the hiring manager.
Jack Luther: Like, what does that look like currently?
Katie Eiseman: Yeah, typically when candidates apply, um, it's really the hiring team. So it's, it's a pretty minimal team.
Katie Eiseman: I mean, I depend— again, depending on the role, anywhere from 2, maybe kind of 5 max, but there's usually, you know, kind of 2 to 3 key people involved.
Katie Eiseman: And so as new candidates are applying to the position, they will go through and review the candidates that come in, and then they designate through our different statuses who they want to consider for, you know, kind of moving through the process and then who they, you know, are not interested at all.
Katie Eiseman: And so high level, then those that they are interested in, typically will route to me and I will do a phone screen and then provide the feedback back to the team. And then they decide if they want to move through the process.
Katie Eiseman: Most of our positions have, outside of the phone screen, have about 2 formal rounds of interviews. Most of those are through Teams. Um, some of our teams that are more technical might have an extra round.
Katie Eiseman: We do have you know, some roles that have like a coding challenge that are more like the designer developer type roles. But for the most part, it's a phone screen and then 2 rounds of formal interviews before we're ready to make decisions on offers.
Jack Luther: But it sounds like the hiring manager and 1 or 2 people on their team kind of kick off the eval process, right?
Katie Eiseman: Yeah, they, yeah, they're, they're really kind of managing the the process.
Katie Eiseman: Obviously, if they need my assistance, you know, to help, but they're really the ones that are going in and deciding who they want to consider and move through the recruiting process. Yeah. Cool.
Jack Luther: And then since you guys just, you just recently got TestGorilla, where would you be looking to use that in your hiring process? Like, is that the coding challenge? Would that be after the phone screen?
Tanya Davis: All of the above.
Katie Eiseman: I think we're still— Tanya, you can speak to a little more if you want, but I think we're kind of evaluating that too. We definitely want it earlier in the process.
Katie Eiseman: Um, I don't think we're necessarily going to use it for like a knockout standpoint, although I do know that they have that functionality, so maybe we would, but it might be a little bit more on that kind of early stage where, you know, before or after the phone screen.
Katie Eiseman: We would like to— that coding challenge, we would like to incorporate that into the assessment because it's kind of— the process we have now is a little bit, um, kind of clunky and very manual.
Katie Eiseman: So if it's something we can build into the system, kind of push out to the candidate, would be ideal. But as of right now, it's on more of that front end that we're looking to incorporate that into the process.
Tanya Davis: Great.
Jack Luther: I appreciate the context. For me, I think like this, like it's just you guys want, you need honestly more automation. I think smoother handover. I think that's kind of what you guys are looking for from what I'm gathering.
Jack Luther: I think that's a typical use for us. So I'm excited to show a little bit of Teamtailor. And then if it makes sense, we can schedule a full hour demo. The way I typically run these calls is like I'll do a quick like 10-minute preview.
Jack Luther: Of most used features, how current clients use it. And then if it makes sense for you guys to see the full platform and typically like your use case, like I'll build out, you know, an example career page, I'll try and mimic your hiring flow.
Jack Luther: We can do that at the end of the call. So if there's no questions, I'm going to share my screen and kind of walk through, I think, a couple of things with Teamtailor. So you'll see I'm on the Scout career page right now.
Jack Luther: I mentioned it briefly there, but a big thing for us at Teamtailor is like employer branding. And because of that, we have like a career site builder built into the ATS. It's all one tool. It's not an add-on. It's, you know, built within the system.
Jack Luther: And so I like to show people how current clients use that.
Jack Luther: It's not a requirement by any means, but it's typically a little bit more modern than I think like this typical jazz landing page that you'll see when you click explore opportunities that are just sort of name, you know, title, maybe the location.
Jack Luther: And it sounds like I think this is what you guys are looking for, maybe, you know, something a little more modern.
Jack Luther: So for us, The idea with these career pages is obviously, you know, you can leave this sort of main Scout landing page and click explore open positions, but you could also potentially just reinvent this whole careers option with our career site builder.
Jack Luther: And so I pulled in a couple examples of how current teams use this. This is Octavo. They work in a similar industry as you guys, but I believe out in the UK. Again, this is built within Teamtailor.
Jack Luther: I like to show theirs just because I think it's industry relevant. But also because it's pretty simple. Like, there's nothing too crazy going on. I know certain companies really like a careers page that's, you know, straight to the point.
Jack Luther: Tell me about the people who work there, tell me about the jobs, and then maybe when you click into the jobs, you get some details. One I really like to showcase is Lotus Cars.
Jack Luther: So again, to clarify, everything you're seeing here is built within our system. They sort of just add the videos and the photos, but I really like to show theirs just because I think they really take full advantage of what's possible.
Jack Luther: It's really like a Canva for career page building. You're never gonna have to wait on somebody in IT to like help you. You make an edit, you add a new job, you post it, it immediately is up on your website, it's up on your careers page.
Jack Luther: Any edits you make in the same way. Um, and then, you know, all the possibilities are really endless. Like anything you've ever seen on a modern careers page, we can do within hours.
Jack Luther: You can have, you know, meet the team stories, you can do videos, um, you can link out to your social media accounts. Like the possibilities are really endless. But it is a part of the platform.
Jack Luther: And then just to clarify, I think we have teams who also use it in sort of like a job embedding way. So here's a company, Crunchbase, who decided they wanted to keep their own career page.
Jack Luther: And I think from looking at Scout reminded me a lot of this, like you guys have clearly already built out something that falls in line with your employer brand. And if you did want to keep this, we're never going to, you know, take away from it.
Jack Luther: You can always just embed the jobs sort of on that career page, like Frontspace does here. And then once you click the role, it'll take you to sort of a Teamtailor landing page.
Jack Luther: Um, to kind of give you an idea of what this looks like from a candidate level, I'm gonna pull up our Teamtailor career page here. Um, so job openings is gonna take them down to any active roles from here. I'm gonna go back. Sorry, all jobs.
Jack Luther: From here they can filter by different locations, by different departments, you know, really what matters to them. Even the role itself. If you hire for a lot of the same type of roles, they can filter by that.
Jack Luther: But the big thing I also like to call it early on is connect. So right now I think what I hear from a lot of Jazz users is like it's tough to keep a talent pool of people who have shown past interest or applied or things like that.
Jack Luther: Do you guys have a talent pool in place you ever pull from, or is every job kind of like a new search, square one?
Katie Eiseman: It's kind of a new— oh, go ahead.
Katie Eiseman: I was gonna say it's kind of a new search, but also we do try to keep, um, you know, either by a status in the system or just kind of a, you know, a mailbox or a folder of people that are interested, um, you know, that we kind of keep on, on hand for future reference.
Jack Luther: So for us, I think that hits a lot of like what a lot of teams use. And so we have something called Connect. I'm going to try and open it up real quick, but for us it's a candidate portal.
Jack Luther: The reason we created it is it works as a talent pool for our customer. Anybody who ever applies for a job automatically gets connected into your system.
Jack Luther: But this is so that anybody who's interested in maybe working at Scout doesn't see their exact role they're looking for, or maybe the department they're interested in isn't hiring at the moment. Can still express interest.
Jack Luther: It takes them to a landing page that looks like this. This branding here at the top is obviously gonna be changed to yours, same with these colors.
Jack Luther: But the idea for us is that the candidates have a landing page and they can express interest maybe even when the role isn't, you know, available.
Jack Luther: So anytime a new job gets posted by you guys that they're interested in, or they suggest, you know, I'm interested in this department, or I'm just interested in the company, they'll get an email update, they'll get pinged to check out this sort of portal.
Jack Luther: Allows you to nurture people long-term. I think especially like if you're doing a lot of interviewing and maybe somebody wasn't the right choice the first time around, but you want to keep them in mind.
Jack Luther: Maybe somebody is like, hey, I know I want to work at Scout. I'm in Dallas, but I just, you know, can't find the role at the moment. They can share info. They can also add references from in here.
Jack Luther: This is really sort of like our candidate side of the house. I'm going to move over to the backend for kind of a quick, like, you know, most used features.
Jack Luther: Run through, but any questions on sort of like the candidate point of view with Teamtailor from anything I've showed in the last few minutes?
Tanya Davis: So if you had gone through an interview and there were like a couple of people that you really liked, are you able to move them over to where they would get the announcements about new jobs opening up? Yeah.
Jack Luther: So for us, um, it's actually going to be the next thing I show, Tanya. So for us, we call them triggers, uh, for any sort of automation in our system. I'll click into a job real quick to show it to you.
Jack Luther: For some quick rundown, this is like our main dashboard. This can be changed. I can definitely dive into it a little bit more on the full demo. But automations, I think, are a big one for a lot of folks. So we'll click into one of these jobs.
Jack Luther: This is a sales-based role. So the idea for us, we call them triggers. It's any automation in the system. So whenever a candidate reaches a certain stage, some sort of automatic activation is going to happen in the backend.
Jack Luther: That could be scheduling an interview. It could be sending a reminder to the hiring manager to look at their profile or to make sure they're prepared for the interview.
Jack Luther: Or to your point, Tanya, it could be used as like a, hey, you know, make sure you're checking out what's out there. Similarly, when you're reviewing candidates, you can sort them.
Jack Luther: So say maybe you only want to give, you know, future updates to candidates you did 3 stars and above on. You can limit your nurture to that.
Jack Luther: So in short, Tanya, yeah, you can automate sort of reminders going out or every time that a new role is posted for it to send to like your top candidates from the past. As we click through here, I think I just again like to do a quick rundown.
Jack Luther: This is that main dashboard. This is where all relevant info is going to live. So any jobs you're currently hiring for, if any of those jobs are internal, if you book meetings, I think I heard you guys use Teams and Outlook.
Jack Luther: We directly integrate with that email system and that video call conference platform. So Anytime that you integrate your calendar, that's a one-time thing once you set the system up.
Jack Luther: Anytime somebody books time with you for, you know, a recruitment interview, it's gonna be here on the calendar. Similarly with any sort of emails regarding recruitment are gonna pop up here. They're also gonna show up in your Outlook.
Jack Luther: This is sort of that one central location. You can manage it. You can add fun stuff, GIFs. We have like tranquility breathing, you know, sessions that you can throw in.
Jack Luther: Tanya, I'd imagine this may be more relevant for you, but I know sometimes when my HR leaders are like in the system, they like having their onboardings in here. Here as well.
Jack Luther: So maybe you're not super focused on, you know, who we're actively hiring, but maybe who's been hired. You can manage that, view it from here. As we click over into jobs, this is going to show any and all jobs you're actively hiring for.
Jack Luther: Unlisted is just going to mean maybe you want to keep it internal for the time being. Maybe you want to promote somebody within before posting it online.
Jack Luther: You can still manage that hiring process in the ATS without it going live on all your different job boards and your careers page. Once you click into these jobs, and this is what we were looking at a second ago, is where you see your candidates.
Jack Luther: So if you source candidates ever, you can add them from within here. If you source ever on LinkedIn, we have a, you know, a Chrome extension you can pop out and source them over from LinkedIn.
Jack Luther: But I think a lot of the time they're just going to apply for the role, and so they'll end up in inbox when that happens. The first thing you'll see here is a couple different, you know, fun emojis.
Jack Luther: The magic wand is going to be those triggers I mentioned, automations, but then the stars are going to be where there's any AI in the process. This is a lot newer of a feature for us. We call it our Copilot.
Jack Luther: I think where we differentiate compared to a lot of systems is like, this is included with the ATS. It's not an add-on. We're never going to charge you per AI usage, but it's really helpful early on.
Jack Luther: So you'll see on this stage I have what we call screening criteria set. This is pulling 1 to 5 bullet points from the resumes. To try and accelerate that early screening.
Jack Luther: So, you know, Katie, maybe you get sent 10 over, you know, 10 people over from that hiring manager, like, hey, can you screen these 10 folks?
Jack Luther: And then, you know, you use the screening criteria to see like, all right, well, they don't have a bachelor's degree, they don't have experience using the system we need them to use, and they're new to the role.
Jack Luther: So maybe they're not worth a screening call. Just a quick way to kind of clean them up. I know you guys mentioned you also use knockout questions a lot. So we have a similar functionality.
Jack Luther: We call them— I forget what our internal lingo is, but they are knockout questions. We have a couple of ways to use them. You can make them really strict. So say, you know, say somebody needs citizenship or something like that.
Jack Luther: If you don't have citizenship in the United States and they click no, it'll just stop them from applying. And that's possible.
Jack Luther: You can also have it so that if they answer no to a question that needs to be asked, they can finish the application to make it a little more smooth, but it'll flag them in the system as like, hey, unqualified. Hey, you know, this person's not a fit.
Jack Luther: Few different ways. A couple things I do like to, I think, skim over real quick are going to be analytics. So we have a real strong reporting analytics database where you can track all your different hiring statistics.
Jack Luther: And then onboarding is a newer feature for us.
Jack Luther: You guys use ADP, so actually I'm not— with our agreement with ADP, our clients— I'm not sure if you guys do onboarding typically in ADP now, but for us with our ADP clients, you are almost— I don't want to say restricted to using ADP's onboarding, but the way the softwares talk is that you would— you'll never use the Teamtailor onboarding system.
Jack Luther: You would use ADP. So analytics is really the only thing that I think I like to call out for additional info, and I can always talk about it more on the demo. So that's a sneak peek of the system, guys.
Jack Luther: If it makes sense, I'm more than happy to build out, you know, maybe an example careers page and then that step-by-step walkthrough for a full hour. If there's interest in it, I'm more than happy to. What are your thoughts?
Tanya Davis: I think I have a few more questions.
Jack Luther: Yeah, go ahead.
Tanya Davis: On the job banks, are the questions— are those built out by the job, or is there like a question bank that you can assign to each job? Like, sure. Yeah, I understand.
Jack Luther: So you're— yeah, like you're looking to filter it by maybe department or like type of role.
Tanya Davis: Well, like, you know, if there's a question that we ask on every job, I don't want to have to create it every different type of job. My preference would be that there's just a—
Jack Luther: it's like pre-saved. Yeah. So we have— We do. So we have a question bank. We also have templates for everything. So like department-based templates. So like say, you know, the process for technical folks is one thing versus salespeople is another.
Jack Luther: You can save that whole process. And then yes, there is like a job bank you can pull from. So say I, you know, create a new job in here, we'll make it sales leader. Um, I'll sneak peek a couple things.
Jack Luther: Like you can have the AI copilot draft a description. You can also handwrite it if you want to. We'll select a department, a couple different things. Are most of your roles on-site in Dallas, or do you guys have any remote roles?
Tanya Davis: We're mostly remote.
Jack Luther: Okay. We do have some on-site, yeah. We'll do something hybrid just for the sake of building this out, and then we'll do a plain title. So the app is where you can start adding questions.
Jack Luther: Tanya, you'll see here, these are the questions that are currently in my account's job bank. But you can also create new ones as you go. So the idea is once you create it one time, it's living in the backend and you won't have to create it again.
Tanya Davis: Okay.
Jack Luther: Um, and then similarly, like if you were to build full templates out, so say like a sales template, maybe you're hiring like a bunch of sales guys.
Jack Luther: Um, you could template 6, 7, 8, however many questions that are always going to be asked in a sales interview process. And so whenever you create a new sales job, it just pulls those in without even having to do it. Right.
Jack Luther: And then same with the hiring team. So like, I know, I think Katie mentioned that there's typically like 2 to 3 key people that are tied to every job posting.
Jack Luther: If it's the same 2 to 3 people for every role, like every time you hire for that role, it's gonna be the same 2 to 3 people. You can even template that out so that they're just immediately added. You don't have to do the manual.
Jack Luther: All right, let me go make sure I add Jim, John, and, you know, Chris to this. It'll just happen automatically. So I think for us, yeah, like templates are a big thing.
Jack Luther: Once you do something once, you shouldn't have to do it again, I think is kind of how we set the system up for automations, different things like that. Any other questions on the platform, anything I showed?
Tanya Davis: Yeah, the, um, do you have an internal posting page? Is that that candidate— well, I can't imagine it's the candidate page, but where we can post a job just internally without posting it externally?
Jack Luther: Yeah. So when you create them, and I can go back to this page one more time, when you create it, there's going to be a little button at the bottom called— says Make Job Internal, if you can see that on my shared screen.
Jack Luther: Um, when you click that, yeah, it won't post it to your careers page and it won't post it to the job boards, but everybody internally will be notified, like, hey, we're you know, hiring for this role, we'd prefer internal candidates first.
Tanya Davis: Um, see the LinkedIn— do you need to have a full recruiter license for it to feed over to LinkedIn?
Jack Luther: Um, so for us, it's, it's It's like a yes and a no. So it's definitely a little smoother with a LinkedIn recruiter seat, um, but you can still feed people over. So like, I, I can show you real quick how it typically works.
Jack Luther: Um, we have a LinkedIn sort of— let me pull it up— we have a LinkedIn agreement. So like, whenever a candidate applies, they can apply with their LinkedIn profile, no problems. But when you're sourcing folks, there's a couple ways it works.
Jack Luther: So We'll pull up just one of your prospects just because I was digging in before our call. Um, the way it'll work for us is you'll see this like Teamtailor Chrome extension up here.
Jack Luther: If you have a LinkedIn recruiter seat and you're working out of like LinkedIn RSC, there's gonna be like an add-on here on the right that drops down, says push to ATS, and you can click Teamtailor and you send them to Teamtailor.
Jack Luther: I have a video of how that works and I can send it in my follow-up. If you don't have a LinkedIn Recruiter seat, it's going to work like this. So say, you know, I'm looking at Katie Eiseman's profile. I see that, you know, we're interested in her.
Jack Luther: I'll download a PDF, take it from here, drag it into the extension, and then it's going to autofill out this information with everything on the candidate, on the LinkedIn profile.
Jack Luther: So this is sort of our workaround for if you don't have a full license LinkedIn Recruiter seat. And that's a limitation I think they put on us and just other ATSs because they sell like a competing tool.
Jack Luther: So you almost need to be on a premium version of their platform to share with your ATS directly. Do you guys have a LinkedIn RSC right now? Or you go maybe light?
Tanya Davis: We use Recruiter Lite. Okay.
Jack Luther: So what I'll tell you is, funny enough, we use LinkedIn Recruiter Lite here at Teamtailor. And I think works just fine. And like, that's kind of that workflow I just showed.
Jack Luther: So it's— I'll send the video of what it looks like to have a full-fledged seat. But like, I don't think— what I've learned about LinkedIn Recruiter seats is they're typically like $15,000 to $20,000 contracts just to like look at LinkedIn profiles.
Jack Luther: Sometimes even more. And it seems like what they're charging for is just so you can like have a direct integration with your ATS. And I think that's a little odd. So you can still use LinkedIn. Yeah.
Jack Luther: To answer your question in short, You can still source from LinkedIn with Teamtailor without having like a full-fledged sheet.
Katie Eiseman: Okay.
Tanya Davis: And then the information that's sent over to ADP, what's included?
Jack Luther: So any, all like main candidate info. So name, first name, last name, title, date of birth, email, From my understanding, they also integrate with our custom fields.
Jack Luther: So like any of this stuff that you're seeing here, if you can see my screen, all this info is going to come over. But if there's any custom fields that you guys also like to bring over with every candidate, you can add those.
Jack Luther: So any and all like general info. Is there anything like specifically you're thinking of, Tanya, that you'd want to make sure goes over with that integration?
Tanya Davis: Uh, files like their resume or—
Jack Luther: Yeah.
Tanya Davis: Letters, things like that would be ideal.
Jack Luther: And then— Yeah, so it can pull that.
Tanya Davis: Yeah, it does. Okay.
Jack Luther: Yes.
Tanya Davis: Then for payroll, we just want to make sure that there's— it's pulling in a semi-monthly payroll versus like Jazz right now only offers hourly, biweekly, and monthly, but they don't offer semi-monthly. So we always have to correct the rate.
Katie Eiseman: When it pulls over.
Jack Luther: And semi-monthly is once every 2 months? Yeah, our 15th and 31st. Okay, uh, I'm honestly not too sure on the answer to that, so let me dig in. I don't see why not.
Jack Luther: Usually if it's outlined on the job offer that you complete within Teamtailor, it should be fine. But yeah, let me, um, let me clarify on that. And you said right now Jazz can only do every 2 weeks or weekly, I think you said, or monthly, or monthly.
Tanya Davis: Okay, cool.
Jack Luther: Yeah, I'll, uh, I'll ping my product team after this. Um, but yeah, that's like job offers. I can show you guys in the full-fledged demo. Um, I can like get up to that transition to ADP.
Jack Luther: I can't necessarily demo our ADP integration if it's of interest, I can always loop in like my ADP contact or if you guys have like a client success manager that you work with there and you wanted to see like how our ATS would integrate with their system, they can typically show you that too.
Jack Luther: But we do work with them directly if you didn't want me to, you know, make an introduction or kind of start that conversation.
Tanya Davis: Yeah, I think the other big question really is like, what are expected costs for Yes, sure.
Jack Luther: Let me pull up my pricing guide. Do you guys have a budget set aside already for this, or is it kind of just seeing what's out there?
Tanya Davis: Well, you know, we'd like to stay as close as we can to what we pay for Jazz, but we understand that not every system is going to be that— in that range.
Jack Luther: Sure. I think that's— so I'll pull up our pricing. So for us, pricing is based off headcount of the company. Um, what do you guys have that easily available off the top of your head, or like a rough range?
Tanya Davis: Is that based on U.S. headcount or global?
Jack Luther: Uh, total full-time. So if you're going to use— if— does the global team use a different ATS, or would they also be using the one that you end up Yeah.
Jack Luther: Okay, so if they use the same one, then it would— yeah, full-time, you don't have to include contracted employees.
Tanya Davis: Yeah, so it's about 220.
Jack Luther: 220. Okay, so for that you'd fall in our 151 to 250 employee bucket. Um, that's an annual agreement of $11,500. $1,000 USD. This includes everything I showed today, plus like a lot more in the system that we didn't have the time to share.
Jack Luther: And is, you know, an annual agreement. We can do quarterly or biannual payments if needed, but that is the price for a year.
Katie Eiseman: Okay.
Jack Luther: And then what I do, I think, like to clarify with our pricing model is like it's locked in at that price. So say you hire 30 people 6 months in, like, we're not going to come back and be like, hey, you moved up a level.
Jack Luther: Like, you're locked into that pricing structure. And then same with like the AI usage. Like, we're never going to ding you for using a lot of the AI versus not using a lot of it.
Jack Luther: I think what's really cool about our system is like there's not many add-ons. Like, most stuff's included out of the box. And because of that, I think the price is usually pretty you know, all in, like it's included everything you're looking for.
Tanya Davis: I, I don't remember if we asked about, um, number of emails that can be sent.
Tanya Davis: So like, Jazz, depending on which level you purchase, either comes with unlimited emails or certain number of emails that could be sent out to candidates that we don't engage with, basically.
Katie Eiseman: Yes.
Tanya Davis: Like, if we wanted to send rejection emails, there's a cap on—
Jack Luther: No caps for us. We're unlimited everything. So templates, you can have as many candidates in the system as you'd like. Yeah, unlimited everything except sort of like head, like seats in the system.
Jack Luther: The idea for us is like once you hit that, I think I said 151 to 250. If you were to ever go above like 250 employees internally, it might need to get like tweaked on the back end. But yeah, we're unlimited everything.
Tanya Davis: How do you guys know how many employees we have?
Jack Luther: I mean, it's for me, it's like however many people are just using the system. So whenever you add somebody in, I mean, if we check with you guys, I know sometimes we'll do like an audit like year over year.
Jack Luther: Like, that's— I think that's like our client success team. So I don't really work directly in that space, but sometimes they might ask for like an update from ADP or something like that.
Jack Luther: Like, if you could show us— share with your headcount or something like that.
Tanya Davis: Yeah. As far as what amount of people that would use it, I can't imagine that'd be more than, you know, at most 50 people. So yeah, that's why.
Jack Luther: Yeah, so I'll tell you, and, and so what I, what I would say is I think we definitely have like a creative pricing model because of that. Um, for like 151 to 250, like, we're typically going to come in cheaper than a 50-seat, uh, like, ATS agreement.
Jack Luther: Um, and like, if you guys don't mind sharing like who else you're looking at recruitment-wise, I could definitely try and compare ourselves in that regard, because I know some of them, like, I think, um, I'm not sure if you're looking into Workable.
Jack Luther: I think that's the first one that comes to my mind that does it on like a per-seat basis. Um, but I think from my understanding, like, their 50-person per-seat basis is more costly than our like per-headcount basis, if that makes any sense. Gotcha.
Tanya Davis: Okay.
Jack Luther: So it's typically— we technically charge just like a little less. It's, it's, I think it's typically around like half the price per seat because we charge in terms of full headcount versus like the per seat.
Jack Luther: And the reason we do that is the idea around like references or, you know, having multiple stakeholders in the hiring process, like who aren't typically HR recruiting, they can get in whenever they need to.
Tanya Davis: Yeah, got it. Okay.
Katie Eiseman: Do you have a range below the 151 to 250? Like, if we truly sit at, let's say, 50 to 100 people that are actively using the system, regardless of our total employee count goes up?
Jack Luther: Yeah. So for us, yeah, that would be 101 to 150. That's $9,500 USD. Below that is then 76 to 100. That's $8,800 USD. Um, what I'll say, guys, is like, you'll— you would be categorized in our 151 to 250.
Jack Luther: Um, what I would tell you though is like, given we're newer to the US, like, I know our finance team is willing to get flexible on these things sometimes.
Jack Luther: So, um, like, if there is a budget you're looking to stay within, just like, and you have that number off the top of your head, or even if you don't now and it comes up as we continue speaking, like, let me know and I can always take it back and see what's doable on our end.
Katie Eiseman: Okay.
Jack Luther: Um, but I don't like— and I, I'm not sure how many other systems you guys have looked at already.
Tanya Davis: Um, we have quite the list.
Katie Eiseman: Um, so like 5 or 6, but I will say you're the first one that when we've asked about pricing that you've been like up upfront right away. Everyone's like, oh, we'll get back to you, and we haven't received anything yet, so, from anyone.
Jack Luther: So that's—
Katie Eiseman: you're like being willing to just share right away, it definitely helps.
Jack Luther: I think for us, um, like even internally, they, they would prefer we demo the full platform before going through pricing so you get the full picture, because sometimes, you know, we don't want people to make uninformed— like, oh, it's that much money?
Jack Luther: What did I even see today? Um, which is why I do like to do that full hour-long demo. You can see everything you are getting out of the price point. But yeah, happy.
Jack Luther: I like being transparent, I think, in these processes because if it's, you know, the numbers double what you guys have budgeted, like, it's just not going to work. I do like to get that out of the way.
Jack Luther: But so with that in mind, I know we've run a little over, so I don't want to take too much of y'all's days up. Would it make sense for us to chat end of this week, early next week again to see everything?
Jack Luther: Um, I think it's kind of like maybe do a formal eval.
Tanya Davis: I think, I think I would like to see the other— we've got a few more systems that we want to look at.
Jack Luther: Yeah.
Tanya Davis: And then, um, connect after that point.
Jack Luther: So, okay, when do you guys— you guys have a few calls set up this week to do that?
Tanya Davis: Yeah.
Katie Eiseman: Yes, we've got 1 or 2 more, um, scheduled this week. So I would hope by next week at some point, end of next week, we should, uh, have gotten through all of them. Cool.
Jack Luther: And then the ones, the ones you've looked at so far that won't share price with you, are they waiting for like a second call? To do that?
Tanya Davis: Yeah, they want—
Katie Eiseman: go ahead.
Jack Luther: What?
Katie Eiseman: Um, one or two of them are, yes. We have the— we've already set up a little kind of a similar thing where we've done a call like this where it's very high level.
Katie Eiseman: Um, and then, uh, you know, considering doing another I don't know how in-depth it will be, but it would— are those calls have been more like info gathering, um, and then we'll do more of like a high-level demo where I think you did a more of a here, you know, high-level demo right off the bat and gathering information as we discuss.
Katie Eiseman: So, um, some of the other follow-up will be probably along the lines of what you did today of just here's our system kind of basic functionality, here's what we have to offer. So yeah, yeah, cool. Any follow-up, that's what we have scheduled.
Katie Eiseman: So we don't— we haven't scheduled any like full-on demos. Let's put anything together that you can, you know, see, um, more specifically. So, okay.
Jack Luther: So for just— I think for my organization's sake, would it be cool if I just threw something tentative like a week from today for us to do that? And if we get to next week and you guys need to push out for any reason, We can adjust.
Katie Eiseman: I'll defer to Tanya.
Tanya Davis: I tend to prefer to just reach out. Yeah, once we've connected to other companies and have a better idea of what we think is going to work best.
Jack Luther: Sure. When, uh, when are you guys looking to finish your evaluation by? Just so I can make sure I'm checking in if I don't hear back, like the end of the month, end of the quarter, we should be in a better spot.
Jack Luther: Okay, so the end of next week, you said?
Tanya Davis: Mm-hmm.
Jack Luther: That's when you're hoping to have a decision on what system you're going with?
Tanya Davis: Well, a better idea for sure.
Jack Luther: Okay, maybe narrowing it down. Okay, cool. All right, well, I'll make a note, guys. I'll make a note to— I'm going to send a follow-up email today with the recap of like this call and everything we discussed.
Jack Luther: Um, and I'll make a note to just check in maybe next Tuesday to see how those other calls are going. Um, and if it makes sense at that point to do the full hour, let me know.
Jack Luther: I think one thing I want to call out, just because you guys are evaluating a lot of systems, like, if you see something that looks really cool and it's like, damn, Jack, Teamtailor didn't show me that, just ask me.
Jack Luther: There's a lot of the times that we do have it, I just didn't get to run through it in the high-level thing. Um, similarly with like pricing, like if you guys are talking to folks and it seems like my number is like crazy, let me know.
Jack Luther: Um, and I know we're always more than happy to kind of get flexible, meet you where you are, things like that. So, um, I appreciate the time today.
Jack Luther: I know we ran a little over, so my apologies on that end, but just keep an eye out for me for an email.
Jack Luther: Um, and then any questions I can answer on the platform as you guys evaluate the others, my, uh, emails in that email, cell phone number, direct business line, like whatever easiest for you to ask questions, you can reach me there.
Katie Eiseman: Great, thank you. Appreciate your time. This is super helpful.
Jack Luther: Yeah, thank you, Katie. Thank you, Tanya. Hope you guys have a good day.
Katie Eiseman: Thanks, you too. All right, bye.`;

  // ── Full Transcript — Call 2: Custom Demo (May 22, 2026) ──
  const call2Transcript = `Jack Luther: Hi Katie, how are you?
Katie Eiseman: I'm good, how are you doing?
Jack Luther: Doing well, thanks for asking. Yeah, how was your weekend?
Katie Eiseman: It was good. I think what I did, I don't know, did things.
Jack Luther: By the time I get to 1 o'clock on Monday, I always forget what my weekend entails. I know, exactly.
Katie Eiseman: It's like, I know I did things, but I couldn't tell you at this point. So how's your, uh, all your house situation things going?
Jack Luther: Good. Um, for me it was like, I think I'm trying to remember where we left off when we last spoke.
Katie Eiseman: Um, there was a pipe broken and you had to like quickly— I think you had to redo one of our meetings.
Jack Luther: That might have been a different vendor. I don't think that was me. Oh, I thought that was you.
Katie Eiseman: Maybe not.
Jack Luther: Might not have been. I had, um, we were having issues in my apartment. Yeah, just to note, we do record these. We were having issues in my apartment with, um, we had a pipe. I wonder if this— maybe this is what this was about.
Jack Luther: I don't think we canceled the call though. Um, okay, we had a— we had something in the back that was flooding. Like, instead of water draining out of like our— I forget what— I forget the technical term.
Jack Luther: Uh, whatever, like, lines the roof to catch the water before— Oh yeah, we had like a pipe burst there.
Katie Eiseman: Oh gosh.
Jack Luther: Oh yeah, I brought that up.
Katie Eiseman: I can't remember the timing of it, but yeah.
Jack Luther: All good. Is, um, is Tanya joining us today, or is it just gonna be you and me?
Katie Eiseman: See, she just messaged me. Um, okay, yeah, she's not gonna be able to make it, so it's just us two.
Jack Luther: Cool. No, I'm excited.
Katie Eiseman: Some leadership in the office today, so she's probably tied up with them. So didn't know they were coming.
Jack Luther: No, no worries. Is this, uh, is this the same leadership that typically like makes final decisions on like software and stuff too, or—
Katie Eiseman: um, not necessarily, no. I think they're more on the, um, what group are they?
Katie Eiseman: I think they're more on the meeting side of things, so Um, the, the, our meetings team that are organizing and connecting with, um, like our meeting sites and the team that coordinates, um, yeah, kind of the onsite logistics.
Jack Luther: Okay.
Katie Eiseman: So no, they're, they're not like our, our finance or top that would be deciding budgets or anything. Okay. So, yep.
Jack Luther: Awesome. First off, for today's call, just to kind of recap, I think where we left off, I, I was gonna send an agenda, but I figured we could just talk about it here at the beginning.
Katie Eiseman: Okay.
Jack Luther: Um, really just looking to kind of give you a viewpoint into like what could be your day in the life in Teamtailor.
Jack Luther: Um, based off our first conversation, you know, I used the note taker to kind of give me an idea of what we talked about, maybe what your current workflow looks like and how we can mimic it in Teamtailor.
Jack Luther: And then we have a decent, you know, I'd probably save 15, 20, 25 minutes at the end for questions and really like all, you know, final checkpoints.
Jack Luther: But before we kind of, you know, get started, I have a little bit of a slideshow to run through, then I'll go through the backend. Any big things that you really want to hit on today outside of maybe like job offers?
Jack Luther: I know you guys wanted an idea of what that would look like.
Jack Luther: And then, you know, the hiring manager workflow is like the other piece I kind of built out, but A few other things I could show you, but anything specific you were hoping to chat about today?
Katie Eiseman: Yeah. No. I think those are good. And then, yeah, as things come up, you know, can mention it or have questions along the way. But, yeah. No. That sounds good.
Jack Luther: Cool.
Katie Eiseman: And then this recording, is this something that could be shared with Tanya after the fact? Just—
Jack Luther: It can.
Katie Eiseman: Okay.
Jack Luther: I will— I'll send, like, a similar recap email to the last time. I'll just CC her on that, and they'll have a call recording in there.
Katie Eiseman: Okay, perfect.
Jack Luther: Um, and then question around timeline. I know we briefly talked about it last week, but I think you said you were doing some final demos this week, and then maybe you and Tanya were talking at the end of this week or next about a decision.
Jack Luther: Has anything changed regarding that, or—
Katie Eiseman: Not really. Um, yeah, we do have a couple more demos, I think, mid this week, and then, um, hopefully we can decide. But also, she's starting on Friday. She's out on PTO all through next week.
Katie Eiseman: So it might be that we can have a quick conversation, but probably like being able to make kind of a final decision or narrowing it down, we might not get to, um, until she gets back.
Katie Eiseman: So, okay, but hopefully we can at least, you know, um, potentially start narrowing down a little bit.
Katie Eiseman: We are still waiting to hear back too on cost from some other people, so that's kind of a factor as well that we're We're waiting on some additional information.
Jack Luther: Do you think cost is going to be like the biggest factor?
Katie Eiseman: I think so. Um, I think, I think cost is up there.
Katie Eiseman: Um, but I also feel that if we truly can find a solution that like just kind of fits everything, um, that we might be able to you know, go a little bit outside of, you know, kind of what we're currently spending.
Katie Eiseman: Um, obviously it's just the reality of what things are and what we need to work for us.
Katie Eiseman: Um, I also think too, if, you know, we're kind of seeing a similar amount between vendors and maybe if there isn't a ton of difference or it's kind of the same, but we get an extra, 2 or 3 pieces of functionality and it's a little bit more that they might be more open to it.
Katie Eiseman: But yeah, I think a lot of it is cost, but they're also supportive of us being able to have something that works for us and will help. It's not like it's just, nope, sorry. Figure it out what's out there, you know.
Katie Eiseman: But, um, but yeah, it definitely is a factor right now, and we're having to try to stay more on the conservative side of things and, and don't really have a wide range that we can, you know, kind of play with.
Jack Luther: So, okay, so yeah, I appreciate the transparency.
Jack Luther: I know, um, I think from what you've told me about the other vendors you're looking at, like, we're us included, are probably going to be a little bit of a cost increase from Jazz, just because I know the functionality tends to be, you know, that much better.
Jack Luther: Um, but yeah, the reason I bring that up is like, if, you know, we finish these conversations and you determine Teamtailor is your vendor of choice in terms of like platform purely, right?
Jack Luther: Like it's the greatest tool, you know, it's the one we want to use, but the price isn't all the way there, let me know.
Jack Luther: I'm always more than happy to like take it back to our finance team Um, and, you know, given that we're newer here in the US, I think I've outlined that before, like, they are always, you know, willing to get flexible.
Jack Luther: So just keep that in mind as you evaluate. Um, like, I definitely wouldn't want to see you guys go with the solution that you view as lesser just because, you know, we maybe came in a little too high on cost.
Jack Luther: So, um, yeah, just give me some feedback there if you guys have it once you know you're done evaluating, and I'm more than happy to look into it.
Jack Luther: And then, um, the last thing I wanted to mention with Tanya, I know she's I believe the director of the HR department. Is there anybody else on the team that's going to need to see Teamtailor or see the ATS or sign a contract or anything?
Jack Luther: Or is it really just you two kind of spearheading this?
Katie Eiseman: Yeah, I think it's primarily the two of us, um, kind of looking at the system, evaluating that it is what we need.
Katie Eiseman: Um, from a standpoint of signing the contract, I mean, Yes, there's probably people higher up that will technically sign it, you know, like our leadership or, um, you know, CFO, but, um, but they would kind of do it with, you know, the understanding or agreement with us.
Katie Eiseman: I don't know that they would necessarily need to see the system themselves before, um, before.
Katie Eiseman: Now that would be something to confirm with Tanya, but I would assume that If we're able to go to them and, you know, kind of our business case of why this system at this cost makes the most sense and know that we've done our due diligence, that they probably will be, you know, pretty okay with it without having to see details.
Katie Eiseman: Or maybe we do kind of a high-level, you know, highlight one or two key things that are kind of the differentiators.
Katie Eiseman: You know, that we can highlight to kind of plead our case or support, I should say, support our case of why, you know, we think that particular vendor is the right one.
Jack Luther: Cool. Yeah, I know it differs from org to org. So if there's ever anyone else, as you guys are talking, that maybe needs a, you know, a quick 15-minute chat with me or anything as well, just feel free to let me know.
Katie Eiseman: Okay.
Jack Luther: That's good to know. Similarly with Tanya, like if she— I'm gonna send the recording, but if for whatever reason she wants to connect live again before you guys evaluate, just let me know and I can always find some time. As well. Yeah. Great.
Jack Luther: I don't think any other questions for me. I might have a couple as we go out. I think we covered a lot on our first call though.
Jack Luther: So I'm not too— I think I've covered really a lot of what you guys are looking for, what's most important to you, and then I built out again, like, a similar workflow, I think, to the one you guys have currently to try and visualize this.
Jack Luther: So just gonna run through a couple slides. We're Teamtailor. This is from our company trip this past year. I think I'm over here somewhere off to the side. Great hiring starts with you.
Jack Luther: I think this is something that we touched on a lot on the first conversation is, you know, you can only do so much with yourself if the tools aren't supporting you all the way.
Jack Luther: And I think that's where we've put a lot of effort in developing Teamtailor is we want people to, you know, be their all-natural selves, hire the way they like to hire, and have a system that's gonna support them in doing that.
Jack Luther: So 10,000+ customers globally, 200,000+ monthly active users. We've got global, you know, exposure everywhere. And the biggest thing again is creating your candidate experience and creating your experience.
Jack Luther: So I'll show it a couple different ways on the call today, but I really think the biggest thing for us is when you post a job, It's easy to post, it's easy to create, it's easy to source, and then when your candidates are applying for a job, it's easy to apply.
Jack Luther: It's straightforward. They're not digging for information and they're having, you know, an enjoyable recruitment process.
Jack Luther: Couple example organizations, I think we touched on a few on the last call as well, and then also kind of run through a few others.
Jack Luther: But, you know, quick slide, and I think, you know, why Scout Clinical should invest in maybe a little bit more of a modern ATS than JazzHR. I think finding talent easier is a big thing we see. Improving that hiring process, increasing performance.
Jack Luther: A lot of things that we hear just from folks who are moving off of maybe more legacy systems like Jazz.
Jack Luther: Biggest things the platform hits on, and Katie, I'm going to share this presentation with you afterwards as well, so we don't need to go too far in depth into each of these, but again, attracting, converting the right talent, making scheduling easier.
Jack Luther: So, you know, we, I think we talked around a lot, you know, automating the scheduling piece of, you know, the interviews and the screening calls and automating getting the assessments sent out. Increasing efficiency with automation where we can.
Jack Luther: I think, you know, you mentioned on the first call, like, letting the system automate where it can and then kind of letting us focus on everything else is like the biggest priority.
Jack Luther: With that in mind, you know, you're gonna collaborate better just across the organization. We have a really strong analytics platform on the back end.
Jack Luther: I'm not sure if we had a lot of time to go through it on the first call, but I'm gonna dig into it today.
Jack Luther: And then at the end, I think, you know, the goal for every company is to attract and retain a diverse workforce that's, you know, strong and able to do their jobs.
Jack Luther: And then, yeah, excited to dive in, experience the magic, and join 200,000+ recruiters using Teamtailor worldwide. Yeah, that's the presentation. Any questions off anything I showed or ready to jump in? Cool.
Katie Eiseman: Yeah, I think ready to jump in.
Jack Luther: Great. So I may have mentioned it on our first conversation, but I think a big piece for our platform is the career page builder. So it's what differentiates us a little bit. I think right now Scout has a really solid career page.
Jack Luther: I'm working on pulling your current one up. And so if you did wanna stick with your current layout, totally understand.
Jack Luther: I think there's never any pressure from us to kind of, you know, change what's working, but we do like to show what else is out there.
Jack Luther: So I'm gonna start off with our own career page here internally just 'cause I think it does a really good job of kind of hitting on a few different things. This is again our career page. You'll see the different descriptions.
Jack Luther: We have the ability to do team stories. You can link this with your social media accounts. You could break down different departments. So if you maybe wanted to dive into each department a little bit more in depth, you could do that.
Jack Luther: But I think the biggest thing for everybody usually is gonna be like, what do our jobs look like on our career page? So this is gonna be that main landing page, you know, general background, maybe what it's like, the workplace, the culture.
Jack Luther: You know, fun photos here at the bottom and then some additional, you know, information as you'd like to see it. But I think the jobs is a big one. So we're gonna click into the jobs here in another view.
Jack Luther: The one thing I do want to touch on real quick is connect. I believe I touched on this on the first call, but this is our talent pool feature.
Jack Luther: The idea for us here is gonna be anybody who's interested in, say, working at Scout Clinical, but doesn't see the role that's for them.
Jack Luther: Similarly, if you have people who have applied in the past that maybe weren't selected for a specific role, they would also live in Connect, which again is your talent portal. This is going to open up here in a second.
Jack Luther: I think I got to bring over this other page to do so.
Katie Eiseman: Is this only available— sorry, real quick. Is this only available if we use the career page through you guys? Like, if we wanted to keep our page, we wouldn't have this option. Is that correct?
Jack Luther: So, in a way, you can add the connect button in other places in the platform. So, like, the idea would be, like, if you did want to use your career page, you could, you know, create a, like, an open job of sorts.
Jack Luther: And so anybody who would apply for that job would just funnel to your connect or funnel to your talent pool. Okay. Does that answer your question?
Katie Eiseman: Yes.
Jack Luther: Cool. And then this is that talent portal. So this, again, this is Teamtailor. So everything here is going to be branded to Scout. It'll be your logo. It'll be any photos you want, your colors.
Jack Luther: This is where anybody who's interested in the role can see any and all roles that you're hiring for. This is also where they can add their references. I know you emailed me a note about this last week as well.
Jack Luther: There's a couple ways they can add their references. This is typically for folks who maybe want to get ahead of it, I think, is when your candidates are usually putting it in here.
Jack Luther: But we also have a step within the hiring process for like, you know, after, you know, or before a final interview, it automates a message to go out to the candidate to be like, hey, you know, please add your 3 references now.
Jack Luther: Or if you guys did use a third-party reference checker or background checker, I know Checker is a pretty popular one. You could also automate that step of that activating.
Jack Luther: As we click in, I'm going to show a couple career page examples from Teamtailor. You'll see here, this is Navient, AI tech company here in the US.
Jack Luther: I really like their example just because I think it's also, you know, on top of being industry relevant, I think they've done a pretty good job of building out a full career page. Page, you'll see they even have this like question button here.
Jack Luther: This is a cool feature of ours. It's a little newer. The idea here for us is this is gonna be a live chat with you or somebody on your team, Katie.
Jack Luther: This isn't a setting you need to have on, but if it's something you wanna test around and kind of mess with, it's almost like having Intercom, if you're familiar with that chat tool, on your career page and it's gonna link you to somebody directly within the org.
Jack Luther: Again, that could be you, that could be Tanya, that could be a customer support agent. You also don't have to have it turned on.
Jack Luther: I think typically where I see it on is for orgs that have a lot of in-depth sort of things going on in their hiring process and maybe need answers from folks more often than not. You know, not a super necessary piece of the platform.
Jack Luther: As we scroll again, everything you're looking at is built within our system. I really like to show this example just because I think they have a real cool touch on how they want to use the system. They want to show their full hiring process.
Jack Luther: Not every company's like this. They want to show off all the benefits. Some like to gatekeep that. It's really up to you and I think how you want to use it, but I really like Naviant's example. The next one is gonna be Crunchbase.
Jack Luther: So this is gonna be an example of somebody who doesn't use our career page builder, but uses the bulk ATS. What that would look like.
Jack Luther: So say you did keep, you know, that Scout Clinical careers page and I pull it up real quick for you just so we can try and workflow it. Say you did want to keep this career page.
Jack Luther: I know, again, I think you guys really have cool— it's like it's a really cool employer brand you already have here with these different flipping sides and they cover, I think, all the big things that we hit on.
Jack Luther: But when you click explore open positions, it kind of takes you to this maybe more bland jazz page. The idea for us would be, instead of having something like this, you would have something within this page itself.
Jack Luther: So you didn't have to link out to it and it would look something like this. So scrolls down, lives on that main career page.
Jack Luther: And then the only time a candidate is getting redirected is when they click on the role and that's taking them to the job application. So no extra websites, extra blank pages. Really smooth process.
Jack Luther: And as you'll see, I think the biggest thing for us here is like, it looks the same. So instead of, you know, having this JazzHR star or whatever, it would be a Scout logo like it is here for Crunchbase. This is just by adding the favicon.
Jack Luther: I know some features are a little limited in how they can do this. But that's what it would look like here.
Jack Luther: Any questions on the career page builder employer branding suite content, you know, pool for the candidates, like anything around this, you know, candidate-facing material.
Katie Eiseman: I think for me, and this is just my curiosity, like if we were to, you know, work with you guys to build out our career page, is it like a template that we work within?
Katie Eiseman: Or I guess because the pages are such a different look and feel, like how do you know what design you want? Is it usually the company is like already has the idea and tells you, or if we like, let's say, we have no idea, what would you suggest?
Katie Eiseman: Like, you guys could suggest something based on our branding or kind of what we have in place. How does that work?
Jack Luther: So we have, um, not templates per se, but I think what we'll typically do is we have a, you know, a stash of 5 to 10, like, A1 career pages from current clients, um, and we'll share them with new clients, um, to kind of give you an idea.
Jack Luther: I'm working to pull up what this looks like. My Wi-Fi is just moving incredibly slow today.
Jack Luther: So let me try and get up another page, but I do wanna show you what it looks like to build this out just 'cause I think it is a little overwhelming to see and not understand. So let me pull this up. Okay, cool. This should work.
Jack Luther: The other side behind that, Katie, is like we partner with consulting firms too. So like if you wanted to get someone who is maybe a little more artsy or something like that to build it for you, we could set that up.
Jack Luther: Um, but typically speaking, I think our biggest thing is showing people what current clients do, and then on your first few calls with your CSM, kind of walking through how everything is set up. Um, I'll pull this up real quick.
Jack Luther: This is my demo environment, so this is like the one I usually go into. It's going to be very bland. There's probably not going to be real numbers on it or real words for that matter. But the idea here is like, this is what it would look like.
Jack Luther: So this is gonna be that main page. You have a home page, you drag and drop the different areas. So for example, this is a text block we're looking at here. If I wanted this to appear a little lower on the page, I would drag it beneath testimonials.
Jack Luther: It would then come down here. Typically speaking, however, though, when you first set up an account, it's gonna have like a preset arrangement and it typically looks like this.
Jack Luther: So that main page, photos, if you want a video, um, I actually built out sort of a demo one for Scout. I wanted to show you, um, if I could get my— am I freezing on your end? I'm freezing a lot on my screen, but it is like a little delay.
Katie Eiseman: Yeah, it is kind of slow, a little delayed.
Jack Luther: Okay, I'm gonna, I'm gonna turn my camera off just for a few seconds, see if that does anything. I think our Wi-Fi is struggling today for whatever reason. But so here, let me pull up this Scout career page I made real quick.
Jack Luther: So, I'm gonna pull your cover here, pull this off of YouTube. The idea for us is that whenever you're building this out, it updates in lifetime. So, I'm gonna go over here. This is gonna be like that out-of-the-box template you mentioned.
Jack Luther: So cover, a text box, any current job openings. If you wanted to include, you know, an insight into current people who work there or a photo gallery, that's gonna live down here. But yes, we do have an out-of-the-box template to answer your question.
Jack Luther: I feel like I maybe over dove into some of these things, but in short, we do have an out-of-the-box template.
Katie Eiseman: Yeah. Okay. We at least have a starting point, but Exactly. But yeah, but then it's nice to see examples of other companies to kind of get an idea, maybe pick and choose some of the features or know it's possible. Yeah.
Jack Luther: Yeah. And we do— what's really cool is we actually do— so on top of getting a CSM, we have weekly webinars Monday, Tuesday, and Wednesday, and each day is a different theme. One day the whole theme is like career site building.
Jack Luther: Um, and what I have worked— like, a lot of what my clients do typically is I think, like, they'll work with the CSM to get, like, the main pieces figured out.
Jack Luther: And then if maybe the career page is, like, a fun project or something they want to work on later, they'll join one of those webinars and kind of just, like, follow along as it's built out.
Jack Luther: Um, and then there's sometimes you're, like, you're the only person on the webinar and you can pretty much get the person to, like, help you build out your own career page while you're on the call.
Jack Luther: So, like, there's a couple times where you'll have the ability to customize it and get like our in-house sort of support and thought process.
Katie Eiseman: Great.
Jack Luther: Yeah, for sure. Any other questions on this sort of public-facing feature? This is the kind of small demo career page I built for you guys. I don't know how it looks, but I try to pull this a couple videos and photos.
Katie Eiseman: Yeah.
Jack Luther: Great. So we're gonna move on into the backend if there's no other questions. I think the big thing for us when it comes into getting into this system is ease of use.
Jack Luther: We don't want you to have to look all over to find the things that are important to you. We don't want you to have to look at stuff that isn't important to you. And because of that, we have widgets.
Jack Luther: The idea here is when you and Tanya set up the system for the first time ever, It's gonna have locked-in widgets for every employee, but every individual employee is also gonna be able to come in and sort of change what their flow looks like.
Jack Luther: Even you and Tanya, right? So you're gonna be company admins, but you also have your own personal viewpoints.
Jack Luther: I think where this is really helpful for my teams, especially, you know, in similar circumstances to you guys where there's maybe, you know, you oversee the TA side of the house and Tanya is maybe more on the benefits inside.
Jack Luther: Maybe you don't need to know all the onboardings, or maybe Tanya doesn't even need to know all the jobs. So, you know, let's focus on the onboardings.
Jack Luther: Maybe your workflow is gonna be focused on the jobs you're hiring for and the internal jobs that are hiring for. The workflow, you can change it as you go. It's really clean, really easy.
Jack Luther: We integrate with Google and, you know, Outlook so that anytime you need to integrate your calendars or your, you know, meeting systems, all that information is gonna be here at the ready. It's gonna be integrated with your calendar.
Jack Luther: It's not gonna double book you. It's not gonna block over your calendar. It's gonna be a realistic view to what your calendar looks like. As we click into jobs, and I'm gonna bounce around a couple different pages here to showcase this to you.
Jack Luther: We're gonna click into this lead generator moneymaker role. We did cover this last page and I'll go over it again briefly. This is just a snapshot of all the jobs you're hiring for.
Jack Luther: It's once you click in that you're gonna see the more specific pieces. So you'll see a couple things here. I tried to mimic your team's workflow as best as I could with these different stages just to give you an idea of what it would look like.
Jack Luther: So off of our first call, there's an inbox stage. So when people apply, following that, there's going to be a hiring team of a few different people that typically evaluate resumes before maybe shortlisting a few to pass over to you.
Jack Luther: Before they even speak with you, though, there's maybe going to be an assessment phase. So the idea being, say your hiring managers come in here, Katie, and they're like, all right, we're gonna check in who we want Katie to screen.
Jack Luther: All right, Jamie looks pretty good from the screening criteria we're looking at. You know, Anthony's missing maybe a couple years of experience, but we'll give him a shot. And then Eric here just really isn't qualified at all.
Jack Luther: I don't even need to look in that much further. So the idea is we come in here, we click, we reject, we'll put a, you know, a couple-hour delay on it just so it doesn't seem too quick. We'll pick a rejection template.
Jack Luther: Typically, you could have unqualified as a template, or, you know, if it was later in the process, maybe not a culture fit is a template. Reject. It'll remove him from your pipeline and send him an email 3 hours later.
Jack Luther: Now, for the folks you do want to continue interviewing, your hiring managers are going to be able to drag them to a few different pieces. So the idea here, and I think what we're trying to build out for you guys, is automation where it matters.
Jack Luther: After maybe the initial phase of, all right, who's just qualified enough to look at, get looked at by the hiring managers, they move over to a hiring manager review.
Jack Luther: This is where you could put a trigger sending a message to everybody on that hiring team. The idea is it's gonna tag them and be like, hey, X, Y, Z, there's a new candidate for you to evaluate who applied for this job.
Jack Luther: Let Katie know if you're gonna want her to screen them and maybe start a formal interview process. If they make it past that stage, then you move on to the TestGorilla stage. This is an integration I'm unable to show. I do have an article on it.
Jack Luther: I'm gonna send you afterwards, Katie.
Jack Luther: But the idea for us here is if you do integrate your TestGorilla account, once you move somebody to this phase, it activates the TestGorilla, you know, assessment on their website, sends it to the candidate, allows them to complete it, and then you'll get notified when it's completed by TestGorilla.
Jack Luther: And typically, If they're able to feed data back to us, this is also something I need to look into. You can usually get notified within our system as well.
Katie Eiseman: Okay.
Jack Luther: The next stage after that is going to be a phone screen with you. So I would imagine their assessment results probably play a factor into whether or not you screen them. Is that correct?
Katie Eiseman: I think we're going to be doing it the other way. I mean, we're just getting TestGorilla going, but I think we're going to do it between the— screen and first round interview. This will have them do that. Yeah.
Jack Luther: So this is a perfect time for me to show you how easy it is to change that. So you'll see we had it here beforehand. You mentioned that you were going to move it around. We move it and make sure everything else looks good. We click Save, go back.
Jack Luther: You know, see, now it's after your, your interview.
Jack Luther: Again, you can save these as templates so that if there's a different workflow for different departments or maybe different hiring managers want their own workflow, You can save those as templates as well.
Jack Luther: Following the assessment, I believe, is when you mentioned there's 2 interviews typically. The idea for us is that if you want to automate the interview hiring process or the scheduling process, I should say, you can do it with our triggers.
Jack Luther: If you did want to keep it a little bit more manual, you can also set triggers around like, hey, make sure we do schedule this person. It typically depends, I think, on the org, how you want to schedule your interviews.
Jack Luther: I believe you guys mentioned most interviews are going to be, um, virtual at first and then maybe an on-site at the end. Was that correct?
Katie Eiseman: Um, it depends on the role.
Katie Eiseman: Um, I think most are probably going to be virtual for both, both first and second, but some positions will have an on-site or in-person interview, but it's more like HR or finance team, those that come into the office more regularly.
Jack Luther: Sure.
Katie Eiseman: Cool.
Jack Luther: So for us, we're able to automate even in-person interview scheduling. I always just bring it up as an option, like if you did want to keep that more manual.
Jack Luther: I know sometimes in-person events can be a little weird with securing a meeting room and things like that. You can still make it, you know, a manual step and kind of just come in here, click a candidate, and book a meeting.
Jack Luther: To give you an idea of what that would look like automated, I did it with myself before the conversation. So there's a couple things I want to show you real quick. So this is gonna be what a typical interview invite would look like.
Jack Luther: So this would be for screening calls with you, interviews with the hiring manager. These words here again can be templated out to say different things for whatever step it is in the process.
Jack Luther: You'll see your logo is highlighted so they know that they are meeting with Scout and not just somebody else. Else, go to booking form, and they're gonna have full availability of the calendar.
Jack Luther: So whenever it's free for them to meet with you, they'll be able to schedule. I think what's really cool, some people get a little, you know, concerned when they see this, like, oh, my calendar is going to be flooded.
Jack Luther: Um, you have a couple ways to clean this up. So you can have it be only certain days of the week, certain times of day. Uh, the main thing I do like to call out is it's never going to double book.
Jack Luther: So it's already noticing, like, when is free, when is busy. And everything else is kind of like up to your own, you know, preferences. So whether that be the time of day, maybe you only want to give folks a week ahead out.
Jack Luther: You don't want them to be booking 3 weeks from now. You want it to be a week from now. What time zone do you want them to see? Typically, this is gonna be, you know, tied to whatever time zone they're in.
Jack Luther: Like Google will pick it up and change it if they are in a different time zone for whatever reason. And then a buffer period. So like, do you want to be doing back-to-back-to-back interviews? Do you want maybe 15 minutes between them?
Jack Luther: What does that look like?
Katie Eiseman: As we keep going through this— Really quick. So you can do this at the job level or have, like, a default?
Jack Luther: Yeah. So you can have— So what I was showing just now was if you were to automate it.
Jack Luther: So if you wanted to automate scheduling an invite, it would be— So, like, in this example, so the team member Is you or say the team, say maybe when you're hiring, when you're scheduling for your hiring managers, you would be the team member and then you would tie in your hiring manager's calendars and then it would schedule on their calendar.
Jack Luther: Okay.
Katie Eiseman: Yeah, that's the question I had because some of our positions, they do have 2 or more people involved in the interview. And so we want to make sure that, like, all of their schedules align.
Katie Eiseman: Well, one, that they're all selected, but then two, you know, we're matching up their, their schedule.
Jack Luther: Um, sure. At that point too, that's what this is looking for. So this page right here, team members, is going to be anybody who needs to be on the invite. Organizer is going to be who the invite comes from.
Jack Luther: So, for example, the way my other clients typically will have this handled is Katie Eiseman, someone in your role of like talent acquisition partner, would be the organizer.
Jack Luther: The invite would come from you, but it would go and live on everybody else's calendar. And then the required team members is gonna make sure that everybody on this team member section is available during the times that the candidate's picking.
Jack Luther: If it was sort of like an optional panel, hey, maybe only 2 of the 3 need to be available. You could also set that up.
Jack Luther: Similarly, if you have like a one-to-one interview step where 5 different people could be the interviewer, like I know, like here internally, we're hiring interns right now and sometimes it pulls from my calendar, sometimes it pulls from my colleague's calendar.
Jack Luther: It's just like whoever's available during the time that the candidate picks.
Jack Luther: I know for some sort of some lower-level roles, typically when you do like a meet the team or you have a few more people who could do interviewing, like that's, how they set it up. Any other questions on interview scheduling?
Katie Eiseman: Yeah, real quick. So then, so I understand what you're showing me, this is setting up by the job if we want it to happen automatically at the particular step.
Katie Eiseman: Um, if we, let's say we hire into this role, we fill it, 6 months later, we need to hire again. One, can I like kind of clone or copy this job and then update it?
Katie Eiseman: But then two, with these interviews, like, do I have to go in and reset them or do they carry over? So I just kind of review it, make any updates that are needed, but the core of it is still intact.
Jack Luther: Yeah, so with the templates, the core of it's going to be intact. So the idea for us would be like, are you thinking of like a specific role where that's typically like—
Katie Eiseman: Yeah, just because, yeah, because right now we have it where like there's certain roles or certain departments where they kind of have their set interview schedule, you know, like round 1, these people are involved, round 2, these people.
Katie Eiseman: And so, you know, we're able to kind of apply that to the different jobs that become available.
Katie Eiseman: It could be that, you know, we set one interview schedule but it applies to 3 different positions, but we can kind of just— how we, you know, how we do it, what we use, we can kind of pull it in.
Katie Eiseman: So I'm curious, like, do we have to set it individually by job every time, or can we kind of create a template and then pull that in as applicable or somehow copy and, you know, edit it and update as needed for the particular job if it changes slightly?
Jack Luther: So in short, yes. I'm gonna give you an idea of how that would look. So say we're doing— we'll keep it sales just for the sake of this example. So say I'm hiring for this lead generator, moneymaker role, but I make a hire.
Jack Luther: Say we hire Jamie, we don't need to hire anymore. You have a couple options of how you want to handle this internally. I'm trying to drag her over there. You have a couple options. We hired, we don't need to hire another salesperson.
Jack Luther: We could unlist the role so that it's not public anymore. Maybe we leave it open in the backend. We can archive it, which is gonna close applications, or we can just leave it sort of in the backend and mark it internal.
Jack Luther: And if, you know, maybe it's an evergreen role. I think for what you're describing, archiving makes the most sense. So in this circumstance, we would archive it. We filled the role. We don't need to fill for it anymore.
Jack Luther: What that's gonna do, and I'm just not gonna do it just so I can keep showing it to you, it's gonna pull it off of this page here and put it away for good.
Jack Luther: But say to your point, 6 months later, alright, now we wanna hire another one of these salespeople. You would have a template saved from when you did it the first time. You would click that template. You'd give it a new title.
Jack Luther: Typically, if the template has a title tied to it, it's gonna fill this in for you automatically. And then create. To answer your other question, yes, this is gonna pull anything you have on the job already.
Jack Luther: So any triggers you've already set up, anything, you know, any notes, any messages, any other automations. So, yes, in short, yeah, you'll be able to just copy it, paste it, not have to rebuild it out from the beginning.
Katie Eiseman: Okay.
Jack Luther: If it's the same role. The one place you may need to peek here and there is like these team members. So if the team members have changed since the last role or anything like that, if the calendar links are dead, you may need to fix that.
Jack Luther: But typically it's, it's, it's all good to go. And then same with video location. I want to say this is something you might have to add every new job just because, you know, sometimes Zoom doesn't really want to work super friendly with us.
Jack Luther: It'll like disconnect the sections. You have to reconnect it.
Katie Eiseman: And is this always scheduled through Zoom, or can we schedule it through Teams?
Jack Luther: Yes, you can schedule through Teams. So we have integrations with Zoom, Teams, Google Meet, and then we also have our own video platform called Teamtailor Video that if you wanted to use, you could. It's no added cost or anything like that.
Jack Luther: I think it's just kind of like a, you know, a personal preference.
Katie Eiseman: Great.
Jack Luther: The last thing I have down here that we wanted to make sure we definitely covered today was like what job offers look like within the system. So I have something I built in the backend. I'm gonna give you an idea of how maybe this could work though.
Jack Luther: So we have a couple different things going here. We have a couple different people in a couple different stages. You'll see we had just hired Jamie, but maybe we're gonna hire somebody else. Let's make it Mo in this circumstance.
Jack Luther: So we just pushed them over to, you know, schedule the screen with you. As I did that, he's getting an automated email going out. You'll see it with this magic wand that is actively happening with this little blue emoji here.
Jack Luther: He's gonna get an email scheduling to meet with Katie. Say that scheduling, say that meeting happens, it goes super well. We power him onto the interview, that goes super well. We power him onto the next one. All right, we're gonna offer Mo.
Jack Luther: We have a couple things going on here. So we have two triggers. Once they reach the offered stage, We're gonna set up a smart move around hired so that once this person accepts the job offer, they're automatically hired.
Jack Luther: Now, if you did wanna have a manual sort of step of like, all right, let me make sure everything looks good before we mark them hired, you could also just set it up to shoot you an email like, hey, Mo signed his contract, take a double peek before formally hiring him.
Jack Luther: The other trigger you're gonna be able to set up is sending this job offer. So whenever somebody reaches the job offer stage, you don't need to even write anything up. There's gonna be a template built out.
Jack Luther: The only thing you're gonna ever need to add is the salary agreed to, and if there's any special documents for this workflow.
Jack Luther: Outside of that, if you have something you typically have for salespeople, product people, um, you can save these as templates. And then once you drag somebody to that stage, They'll get that information.
Jack Luther: Similarly, if you did want to do it manually, you would build it out from within here. So I would click into the candidate that I'm hiring. We're going to flip over to Jamie just to make this a little easier.
Jack Luther: We're going to flip over into the candidate that I'm hiring. We're going to click job offer. From here is where you build out the job offer. Again, Katie, there's going to be templates you can save.
Jack Luther: So I actually made one ahead of time for sales roles. You'll see here it auto-fills in the words. Again, salary is going to be one of those things that you need to fill in yourself.
Jack Luther: This should only really show USD unless you have other locations that you hire for. I think I saw the team also hires in Great Britain, so you'll be able to see USD and GDP— GBP, yep, GBP.
Jack Luther: And then what this income looks like, so $100,000 yearly, or, you know, whether it's, you know, biweekly payments, monthly payments, what have you. And then what is their start date? it's going to be the last thing that you need to add manually.
Jack Luther: Besides that, everything else is going to be able to fill in. So you'll see here, because it's a sales template, we even have like commission-based sections. Again, this is just because it's a sales template.
Katie Eiseman: For the salary, for the currency amount, is that list like something you guys maintain? And if we needed to add a new value to it, that We would have to come to you to request it, or are we able to manage that list?
Jack Luther: You're saying this list right here of the different—
Katie Eiseman: Correct.
Jack Luther: Yeah, you, you're able to manage the list. So I want to say it's in the back end. You can just click on and off which ones you want to see. We have, um, we have clients in 100 countries though, so I think most are typically covered.
Jack Luther: Um, but if there's something— if you were hiring somewhere that we didn't have the currency, you can usually ping support, get them to add it into your system for you as well.
Katie Eiseman: Okay, and then the salary payment. So currently, and we get paid semi-monthly, so currently in our offer letters we say, um, you know, you're being paid semi-monthly at X dollar amount, which equates to this amount annually.
Katie Eiseman: So we have the two amounts in our offer letter. Would we be able to still do that with current setup, or would we be looking to that?
Jack Luther: Okay, so let me pull in this email. Okay, cool. To kind of give you an idea, so this is going to be— again, I just show you where I am. I sent this email to my personal email ahead of our conversation.
Jack Luther: So I had us automate the job offer step in a different workflow. I built one out for Scout. I dragged myself to the hiring stage. And then that's what sent me this email. So when you click view offer, again, it's just a demo site.
Jack Luther: You'll see that I added your logo here at the top. I believe at the current point in time, this was like an issue you're having with Jazz. Doesn't look like there's a job offer coming from Scout.
Jack Luther: And you'll see here that I was even able to have the AI kind of write out again, not all of this is filled in because it's not a real job, but you'll see like you're able to call out you know, the exact compensation terms, the benefits, the equipment, and then that total salary is going to be what's down here at the bottom.
Jack Luther: So yeah, you could still clarify like, hey, and that would be just within the subject of the message. Hey, this is what you're going to be making for the year on a weekly basis or on a biweekly basis. This is what that looks like.
Jack Luther: And then at the bottom is where it would show you for the full year compensation. That answer your question?
Katie Eiseman: I think so. Yeah. I mean, I just, as long as we're able to kind of capture both amounts.
Jack Luther: Yeah. So you're saying within the ATS, you're hoping to capture both amounts.
Katie Eiseman: Yeah. Because like I said, right now with our offer letters, we indicate both what the semi-monthly amount would be and what the annual— what that equates to from an annual standpoint.
Katie Eiseman: Um, so we want to make sure, again, we want to keep it the same if possible. I just didn't know if there were any limitations to how much of that we can outline and include here.
Jack Luther: Sure. Yeah, there's not— there's really not too many. Like, I can give you an idea real quick. Of what it looks like to build these out. So to give you an idea of where we're going, and I'm moving around pretty quickly, I went into settings.
Jack Luther: We're gonna look at the different templates. We're gonna go down to the job offers templates and make a new one. So you can name it. What's, what's a department that you guys are typically hiring for more than others, would you say?
Katie Eiseman: We'll do clinical trial assistant. It's the current one we've got right now.
Jack Luther: So it's within this offer message that you would have, say, like, an area you could then fill in or change with the payments. And then salary is going to be here as well.
Jack Luther: So the idea, I think, for this example you're kind of giving would be it would be in that message area where it clarifies, hey, this is going to be what that would pay out to biweekly. And that would live again.
Jack Luther: Sorry, I'm— my Wi-Fi is moving increasingly slow as we continue to have this chat. It would live somewhere within here in this sort of compensation and benefits area. It's just, I'm, for whatever reason, I can't get it to save and come over.
Katie Eiseman: That's fine. So then this is considered their offer letter, or is there an actual PDF, like, offer letter that they get?
Jack Luther: Yeah, so this is considered their offer letter. They can save this as a PDF. Similarly, like, if you guys had a another document you wanted to share over, you could attach it with this document or with this sort of web portal.
Jack Luther: But yeah, the idea would be like—
Katie Eiseman: Yeah, we send over like a benefits document with our offers.
Jack Luther: Perfect. Yeah. So that would be set up. You would just add it as an attachment and you would save that to the template. Once I accept it, we'll see what happens. That's you accepted the offer. Print is when you would then be able to save it as a PDF.
Katie Eiseman: If I'm not seeing it, like, yet. No, it's still on the offer with the accept.
Jack Luther: Yeah, I think because it's a pop-up, it won't pull it up. I'll take a screenshot and send it to you after the fact. But yeah, you click the print button and it's going to pull up an area to save it as a PDF.
Katie Eiseman: Okay. And then is this considered an electronic signature? Yeah, sure.
Katie Eiseman: We typically, again, you know, our current process is that we'll send an email with the offer, we'll attach a PDF version of the actual offer letter, and then we'll also send that PDF offer letter through DocuSign.
Katie Eiseman: Sign, and they electronically sign the DocuSign or version of the offer, and that's kind of what we keep on file as like their official signed offer.
Jack Luther: So we can— like, you— our e-signature tool equivalent to DocuSign, and that it's— yes, it's a legitimate legal binding signature.
Jack Luther: Um, what I would say is it's definitely a little limited, and like, you know, if you want to sign a bunch of different sections of the document or sign a bunch of different things, Pretty cool. Yeah.
Jack Luther: So it would work the same if we also— so like if you use DocuSign for other aspects of the business and like you're going to use it no matter what anyway, we also integrate with their system so that you could still send the job offers through DocuSign.
Jack Luther: It would just integrate with Teamtailor and then kind of track similarly how the other integrations work.
Katie Eiseman: Okay. So then does that change the candidates, um, I guess their process if we do say yes, we want to integrate with DocuSign? Does that change their experience once they click accept offer?
Jack Luther: Slightly. Um, it would just— it would just like— they would just see a different signing portal. So like the one I was showing was ours, but it wouldn't require them to do really anything extra.
Jack Luther: They would just get an email from DocuSign instead of us that would prompt them to fill out the application.
Katie Eiseman: Okay.
Jack Luther: Sounds good.
Katie Eiseman: And then with— so at the top of the offer letter email, it sounds like it's kind of position details. So that's pulling from the job details. Is that correct?
Jack Luther: Let me pull that back up so I can follow what you're talking about. You're saying where, like, the information's mentioned in the position?
Katie Eiseman: Yeah, like, there was a section up at top where it was like department, you know, like the position title, the department.
Jack Luther: See, hold on. Since I've signed it, it won't let me go back. Let me— Pull that back up. One second, please. Sorry about this.
Katie Eiseman: You're fine.
Jack Luther: So you're saying this information here?
Katie Eiseman: Yeah, the position details. Is that pulling from the job?
Jack Luther: This is pulling from what I added beforehand. So I added this in on my own beforehand. What the offer is going to pull from the job is the title. So you'll see in that other email I shared, like it'll have the title here.
Jack Luther: When you go to the full printed out offer, which for whatever reason I can't show you, it would also show it there. I'm gonna get a screenshot of this. I'm not sure why it's not doing. I guess it's because it's a pop-up from my printer or whatever.
Jack Luther: But yeah, so the information that's gonna pull in is the title, the location, the name of the candidate that you're hiring, a start date if there's one mentioned on the candidate card.
Jack Luther: And then if you did want to just like, I think what I see teams typically doing like for the job description area is they'll just copy and paste the job description from the job into the job offer template and then it'll just show the description in both places.
Jack Luther: I know that like giving the, 'cause I think I talked about the Copilot a decent bit on our first call, is like the AI Copilot, that's one of its, the areas that we're really trying to infiltrate it next is like the job offer area.
Jack Luther: Area so that, to your point, it could just pull in all the exact info, like, from the candidate card.
Jack Luther: So, like, the salary that's already been discussed, the start date that's already been discussed, because, like, if that stuff's not outlined in the candidate card, right now it's struggling to pull for it.
Jack Luther: Um, so that's where, like, you may, you know, it still may be a bit of a, um, you know, the first few times you do it, you might still have to come in here and hand type it a little bit.
Jack Luther: But the idea is you're going to be able to save templates and save different templates for roles. You could save 6 templates for 6 different roles in one department. It's really unlimited. I'm just kind of throwing 6 out there as a number.
Jack Luther: And so you'll be able to have each individual job offer for each individual instance that you need to use. Then you just click Add Template and you don't have to recreate it every time.
Katie Eiseman: Okay.
Katie Eiseman: And then you're saying for the automated part, when we move a candidate to the offer stage or whatever we call it, we'll just call it Yeah, if we're using the automation and the templates behind the scene, all those fields are going to get populated.
Katie Eiseman: And in essence, it's like that offer letter, quote unquote, is being created, filling in the blanks on our template, and it's getting sent to the candidate without us having to manually add anything or preview it or see anything.
Jack Luther: Is that Yeah, so typically the only thing that you need to preview beforehand is going to be current income salary.
Katie Eiseman: Okay, I believe we'll be prompted for that.
Jack Luther: Yes, I believe it's a law in the U.S. that there needs to be like some sort of human aspect. That's, that's the one feature I think, like, you need to have like sort of a, a final like thumbs up, um, from you beforehand.
Jack Luther: But yeah, you'll be prompted to do that from within the system. You'll typically also get like an email notification.
Jack Luther: Um, but at the same time, like, that's something that if you're like, if you're just dragging somebody to the offered stage because you're offering them, you could also do it on the spot while you're doing it. Sort of the thought.
Katie Eiseman: Okay.
Katie Eiseman: And then do you have, do you have it where, um, If we need to, like, create the offer but route it for approval with the hiring manager or somebody, can we build in that step so before it gets sent to the candidate that there is a review process?
Jack Luther: Let me pull up this again. I know we've been kind of bouncing back and forth here. So yeah, when you're creating it— I'm going to the wrong link again— when you're creating it, yeah, there would be a workflow in place.
Jack Luther: To tie in whether it be like your CFO or somebody like that in the process. Yeah.
Katie Eiseman: Okay. And that can change by position.
Jack Luther: Yeah. And so you just save a different template for the different role and then it would go in that way. To my point though, I think like, do you guys like the DocuSign job offers and the way you use it now, or what's the thought?
Katie Eiseman: We use it because we use DocuSign for other things that we have to, you know, get, get signed, like employment agreements and whatnot. So, yeah.
Katie Eiseman: So we do use that because we don't have any other kind of electronic signature acceptance format from the candidate.
Katie Eiseman: So if it's something that can be handled And again, we're not using it also in JAS right now because of the, the logo and the branding, you know.
Katie Eiseman: So it could be that if all of that is kind of taken care of as part of the process, then it may be that the electronic signature process within Teamtailor could be acceptable, you know, and we don't have to route it through DocuSign.
Katie Eiseman: So I'm not saying we necessarily have to.
Katie Eiseman: That would definitely be a question for us to go to our legal team, um, just to see, like, you know, if the current format or functionality that Teamtailor has, does that suffice to kind of capture that electronic— that candidate saying, yes, I am accepting and this is my electronic, you know, acceptance?
Katie Eiseman: Or if we still need to go that extra step or still need to do it through DocuSign. Signed. So, um, that's just, yeah, a question we'd have to ask.
Jack Luther: So like your point at the beginning, like, can we bring it— what can we bring under one roof without having to— yeah, cool.
Jack Luther: Yeah, I think for us, like, you're— that's a typical, I think, workflow for a lot of people is like, especially because different teams, legal departments always like to take a look at like, all right, let's make sure we're not screwing anything up here.
Jack Luther: Um, yeah, totally get that. So we have a couple— I'll send an article too on our DocuSign integration after the call. just so you have an idea of how that works.
Jack Luther: Um, 'cause like, be fully transparent, Katie, I think like the reason we— like there's a couple things I've showed you today, right, that like we, we do on our own, but then we also integrate with, like job offers.
Jack Luther: Um, because I think at the end of the day, like we realize, like, yeah, we're gonna build it out and we're gonna make it 'cause our, our clients want it, but maybe it's not the greatest, greatest, you know, e-signature solution on the planet.
Jack Luther: So we're gonna integrate with the e-signature providers That describes a lot of different ways with the platform. So like, you know, there's things that we do internally, whether that be, you know, like onboarding even.
Jack Luther: Like if you wanted to keep your onboarding within ADP, you know, typically we recommend you do that because we think their onboarding features are a little stronger than maybe ours natively. Like just a couple uses there.
Jack Luther: So yeah, let me know on the DocuSign piece if there's anything like if you, if I need to demo it, more in depth. I can also kind of show you what it looks like to sign the document and stuff.
Jack Luther: Like, if you did want to see that, I could do it live or just film a recording for you after this conversation. Okay. I think the last thing we didn't touch on on our first call was analytics. So I'm going to shift over to our analytics portal.
Jack Luther: Any questions on anything else that we've seen up to this point? We're also going to have about 5 minutes at the end to kind of chat through some questions.
Katie Eiseman: Yeah. Um, I think— We may have already talked about this.
Katie Eiseman: I'd have to look at notes, but I think just reiterating from the candidate, the apply process of the candidate not needing to create a login that we can, you know, create either— we do have question application questions that we want to ask, and some of them are specific by positions.
Katie Eiseman: Some are going to be specific to the US versus the UK or, you know, things like that.
Katie Eiseman: So just kind of how those are handled, how we can easily, you know, pull in or kind of pick and choose, you know, either from a question library or it's on a template basis, you know, kind of how that all works.
Jack Luther: So a couple different ways. So to your point at the end there, templates I think are usually the best practice with something like this. Having maybe a US template and then a UK template and then a, you know, an EU template per, you know, per se.
Jack Luther: But in the same vein, whenever you're building out an application, you're able to pull any and all questions you've ever added into the system from the select a question field. So anything you've already written is going to live here.
Jack Luther: If you did want to make a new one on the spot, you could also do that. But yeah, so you could add it, you can add it mid-job.
Jack Luther: I think what I've typically seen teams do to your point, like, you know, hey, hey, we hire salespeople in the US, we hire them in the UK and the EU.
Jack Luther: They'll build out like a sales template and then have the recruiter for that role whenever they're building it out, add that template and then come in here and then add those sort of, you know, region-based questions. You know, whatever they be.
Katie Eiseman: Yeah.
Jack Luther: Okay. On sort of manually, but they, again, they're from the question banks. You don't have to retype them out every time. They're just gonna be in the bank for you to add.
Katie Eiseman: Okay. So that's nice. So we can have, let's just say we've got 6 templates by job or by position, but all of the questions captured in each of those job templates are in that dropdown list.
Katie Eiseman: So there, it's almost you can individually select the questions as well and also create a new one to add to that dropdown list.
Jack Luther: Exactly.
Katie Eiseman: And pull in.
Jack Luther: Okay. And then I think you might have seen it back there, but you can also have, like, the AI Copilot suggest questions based off the description. Like, there's a couple different ways to do it.
Katie Eiseman: Okay.
Jack Luther: And then I think the second part of your question had to do around with seeing, like, who— could you repeat it again? Was it, like, who could see, like, from different regions, like, who could see different jobs?
Jack Luther: Or what was the second part of that question?
Katie Eiseman: Um, no, we have— we've got questions that are, like, region-specific. So, like, in the U.S., if they are applying— most of our jobs are remote, but if they're applying for or live in certain states, we don't hire into those states.
Katie Eiseman: So any of our jobs in the U.S., regardless if it's a director level or an entry level, if it's US, we want to pull in that one question to say, where are you located? So we can use that as a knockout.
Katie Eiseman: So it's one of those, like, if we're building out templates, do we need to add that template to, you know, that question to every template?
Katie Eiseman: Or can we do our template where it's, you know, here are the 5 questions I want for this role and the 3 questions for this role. I pull the template, but then every job I'm going to add that US. Question into, you know.
Jack Luther: Sure.
Katie Eiseman: In case, in case that position, you know, some of our positions like the CTA, when I was telling you the clinical trial assistant, like we hire in the US and the UK.
Katie Eiseman: So our template probably wants to be for that position as a whole regardless of location. Um, but then on this, on the job level, if we're posting one in the US, one in the UK, I'd want to be able to ask about, you know, their location in the US.
Katie Eiseman: So I'd probably pull that in separately or individually in addition to that CTA, just job template as a whole. It's kind of what I think appears that that's what we could do.
Jack Luther: Yeah, no, it is. I think— and I was trying to figure out a way to, I think, showcase this sort of location piece you mentioned here. I'm gonna send follow-ups. I think it's gonna take me a little too long to maybe build it out and show you here live.
Jack Luther: So, and I wanna save time for all questions at the end. Yeah. So yeah, I have a couple things to send you in follow-up just so you can, you know, take an eye at and have all your resources. And then this is our analytics portal.
Jack Luther: This is what I like to close with. So do you guys use something like this within Jazz currently, or do you do reporting or analytics?
Katie Eiseman: Not typically. I mean, no, we're not. We're kind of keeping an eye on it, I think, a little bit, but not anything formal or that we're reporting on any, on any regular basis.
Jack Luther: Cool. So if you did, we pull analytics on everything in the system.
Jack Luther: So how many jobs you have open, how many applications you've gotten, how many of those people have been accepted, rejected, where they are, where they're coming from, I think is like the biggest one for people, traffic sources, like, Yeah, that would be nice.
Jack Luther: If we're spending money on job ads, where should we be spending money, right? Indeed or LinkedIn?
Jack Luther: And you can literally see, all right, are we getting more apps from what site and what, you know, what quality are we ranking these candidates that we're hiring?
Jack Luther: And then what's really cool, and this is something I like to chat about at the end of the call. So I'll use it as sort of a transition into any other questions, but we have something internally called our promote team.
Jack Luther: Um, and you'll learn this about Teamtailor is we have like departments for everything, like things that typically would probably just be customer success at other orgs, like we have individual departments for. So like Promote is one.
Jack Luther: Um, what they are is really just like a, a job ad promotions consulting firm in our own company.
Katie Eiseman: Okay.
Jack Luther: And the idea there is like, if you guys have ever spent money, you know, on Indeed promotions or LinkedIn promotions or anything like that to promote jobs, you can go to them before doing any of that and be like, hey, you know, for example, I have $10,000.
Jack Luther: I want— you know, we have 20 jobs we need to hire for this year. What would, you know, be your suggestion on how we can best spend this?
Jack Luther: And they're going to pull in all their data on, all right, you know, from our other clients who are like you, similar industry, similar size, this is where they find the most success.
Jack Luther: This is how much we'd recommend you spend to these— to this platform, to that platform. This is what we recommend you even buy with this money. Like, there's a couple different ways you can do it. Okay. Similarly, we also have like an import team.
Jack Luther: So anytime you want to bring in data from your current system or any outside systems, you have an import team you can work with to do that. And then our client success team.
Jack Luther: So this is kind of what I'll close in just with details real quick on these different functions. And then we should have a few more minutes for questions. For us, typical implementation.
Jack Luther: So an org of your size, you're going to get a dedicated Client Success Manager. This is somebody typically that I work with here in Chicago, but they're usually tied to like specific industries.
Jack Luther: So the CSM that works with you is going to understand your industry maybe more so than our public sector CSMs, etc. What they help you with is general onboarding and setup.
Jack Luther: So if you decide to become a Teamtailor client, typically within your first few days, I'll set up a conversation with them. They kind of run you through the whole process.
Jack Luther: They give you, all right, what are the big things you want to get set up early on? What are these items? They run through what the webinars cover. So I think I mentioned it, but we have 3 webinars that cover like a bulk of setup.
Jack Luther: Those CSM meetings are really for like the more in-depth, to your point, like, all right, I want to build templates out for these 10 different jobs. Like, can you help me do that real quick?
Jack Luther: Like, that's going to be where those sessions come in, come helpful. Similarly, you're also gonna get like an onboarding specialist at times.
Jack Luther: So like if you ever have like a one-on, you know, maybe you need a training for your hiring managers or you need just kind of a refresh training for you and Tanya, like the onboarding specialist would be then who the CSM loops in to help you with that aspect.
Jack Luther: In terms of support, I may have called that out on the first call, but we have a 24/5 support model. So 24 hours a day, 5 business days of the week. You're gonna get in contact with somebody within under 5 minutes.
Jack Luther: It's gonna be a human being every time. They work at Teamtailor. We don't third-party it out. And a lot of them are former recruiters themselves, so like they even understand the system on a kind of a different level.
Jack Luther: And then lastly, I think, you know, implementation for us is typically 4 to 6 weeks. With that in mind, I think for a bulk of the system, it's really 2 weeks. We always say the extra 4 to 6 just to allow for any imports.
Jack Luther: So if there's historic data you want to bring over in Jazz, or if there's any data in ADP that you wanted to bring over, sometimes it can take a few extra weeks for us to get that all connected.
Jack Luther: But for the bulk of the system, it's typically like a 2-week setup. That includes getting all the templates set up, creating all your current jobs you're hiring for, getting all your hiring managers in.
Jack Luther: But they have me, they like me to say 4 to 6 weeks for implementation, even though I think it'd be typically a little faster. Any questions on Teamtailor? I know we covered a lot today.
Jack Luther: I know you had a couple questions coming in, so happy just to chat for a few minutes.
Katie Eiseman: Yeah, no, I think that's good. Going over our past conversations.
Jack Luther: Yeah.
Katie Eiseman: Do you— Do we talk about this? But do you guys have like a— for the jobs, we can post them internally. So if we're just opening a position just for internal candidates and/or like a referral portal.
Jack Luther: Yeah. So we have both. I meant to show that today. So I'm glad you brought it up. I did make a note about this because you sent me an email. So here, let me pull this up again. So you able to see my screen?
Katie Eiseman: Yes.
Jack Luther: So see here, I have it.
Katie Eiseman: I have—
Jack Luther: we have a couple different ways to show this. I'll start with the widget on that main dashboard. So you'll see we have an internal job widget.
Katie Eiseman: Okay.
Jack Luther: This is gonna be for any jobs you've marked internal. What this looks like in the backend, there's gonna be a little tag here that says internal. You can filter by the jobs that are considered internal.
Jack Luther: So So for this example, we'll go down to, I believe it's, yeah, audience internal. So you can see only the internal jobs you're hiring for.
Jack Luther: And then what that looks like when you're creating the job is it's just a button down here where you either make the job public, make it internal. I think the typical use case I see with teams is when they create a job, they want to start internally.
Jack Luther: Click Make Internal. When it's lit up, it means that the job is internal. Save it. Go back. You'll see that it is marked internal.
Jack Luther: And then maybe, you know, after a week or two, you know, maybe we're not finding the candidate internally that we like. We're going to post it out. You go to Make It Public. You click Save.
Jack Luther: And that's when it'll spread to your different job boards that you're integrated with. Okay. And then for reference checks, When you say referrals, do you mean current employees referring, like, friends and stuff like that?
Katie Eiseman: Right. Yes. Yeah.
Jack Luther: Sure. So let me pull up our backend. Should— I might even have someone in here just to kinda give you an idea. I did refer somebody a few weeks ago.
Jack Luther: They changed the view on me. So typically, previously, I'm gonna see if I can find an article on this because I recently got added. They changed my admin privileges. So I was typically— I used to just be a normal employee.
Jack Luther: Now I'm considered a hiring manager.
Katie Eiseman: Okay.
Jack Luther: So because of that, I'm seeing a little bit of a limited view. It would be one of these widgets. Because I'm in a demo environment, I can't change that widget. So let me pull up a video. But yeah, there is a place you can do it.
Jack Luther: It's where like any candidate can come in and just like kind of refer or sorry, any employee can come in and refer a candidate. Yeah, I do have, I do have something I can show you. It's just I'm struggling to pull it up here at the moment.
Jack Luther: I don't think it's gonna be— yeah. Yeah. I'll pull up a follow— I'll send something, some follow-up.
Katie Eiseman: Okay.
Jack Luther: Unless it's— they were doing— we recently shifted the organization to have, like, a North America— okay. Actually, here it is. Never mind. Let me pull it up. Sorry about the confusion.
Jack Luther: We recently shifted from a, So we're European-based, as I'm sure you know at this point. Um, and so now we have our own US landing page for our own hiring. So I was on the wrong one, but you'll see here.
Jack Luther: So it's going to be— we have a couple different stats boards. So leaderboard is going to be like who's referred the most employees or most current employees. My referrals is going to be where you can refer a candidate.
Jack Luther: Okay, so this would fill in the name, email, phone, if you have a LinkedIn profile, and then if they were being referred for a specific job, you could pick the job, or if they were just being referred in general, you could maybe pick the location they're at or maybe the type of department they're interested in.
Jack Luther: Okay. But you also don't need to, you know, it could be all departments, it could be all locations. And then if there's any additional information that—
Katie Eiseman: And then, yeah, more detail.
Jack Luther: Okay.
Katie Eiseman: And then when they add the referral, do I as the admin or recruiter like get that notification or who, who gets notified or where do you see that?
Jack Luther: So you as the recruiter will get notified. Anybody who's tied to the job will get notified. Similarly, the candidate, once it's sort of been approved, should also get notified like, hey, you were referred for this role at Scout.
Jack Luther: Similar messages to if they were just to apply naturally. Okay. But what that would look like is— I'm gonna see if we have any more of these examples. Not that I can see firsthand.
Jack Luther: Typically where it, you know, where you're seeing this overdue sticker right here, it would say referred instead. And it would tell— if you were to click in, it would tell you who they were referred by.
Katie Eiseman: Okay. And then the, um, if they're referring them to a specific job, I'm assuming that list is only jobs that are currently open.
Jack Luther: Yes.
Katie Eiseman: Externally.
Jack Luther: Externally, yes. Um, even if they're unlisted. So like the way I found our role was, I think I might have told you guys, like I connected with Teamtailor, um, but the role that I applied for wasn't publicly listed.
Jack Luther: It was like, okay, we're gonna try and keep it within our networks to start. And so somebody sent me the listing, I was able to access it, apply, um, without the role even still being posted like all over LinkedIn or, you know, what have you.
Jack Luther: Any other questions on the system?
Katie Eiseman: Um, I think we talked about our various integrations. Integrate with TestGorilla ADP. How about, I don't know if we asked about, right now we use HireRight for our background checks. Do you guys integrate with HireRight? Do you know?
Jack Luther: So HireRight, I don't believe we have a direct integration with. Assuming they have an open API, which a lot of these tools do, we would be able to integrate with them.
Katie Eiseman: Okay.
Jack Luther: Let me— I'll shoot a message to product and see if we have any other clients who have that set up, because if we do, then it's usually an even easier experience to kinda get it set up.
Jack Luther: And just to confirm, that's Hire and then Write, R-I-G-H-T, correct?
Katie Eiseman: Correct. Yep. Cool.
Jack Luther: I'm gonna bookmark it and send it to somebody. But, yeah, you should be able to build out an integration fairly easily if there isn't a direct one currently.
Katie Eiseman: Okay.
Jack Luther: And then job boards, any other? I think Indeed, sometimes you guys use LinkedIn, LinkedIn Recruiter Suite, I think you mentioned. Yeah. LinkedIn Lite, maybe?
Katie Eiseman: Yeah, we've got the LinkedIn Recruiter Lite. And then, yeah, kind of just out till the free job boards, pretty much if we're promoting or paying for anything, it would be LinkedIn.
Katie Eiseman: Recruiter Lite, and then Indeed are kind of the two that we will boost or pay for, you know, any jobs to be promoted kind of beyond the free, free stuff. So, yeah.
Jack Luther: Cool. Awesome. I'm trying to think, I'm gonna go.
Katie Eiseman: Yeah, no, good.
Jack Luther: Now, I was just trying to go through my internal checklist real quick to see if there's anything I'm missing. I don't think so. Is there anything I can answer for you?
Katie Eiseman: I don't think so. Um, oh, I think in the email you did say though that with— oh, sourcing, real quick, sourcing. So, um, I think you said that we needed to have a full recruiter license for LinkedIn to be able to use the sourcing piece.
Jack Luther: So in order to use their sourcing tool, you do need a LinkedIn RSC. That's gonna be the case with like any ATS you go with. When you're using LinkedIn with us, it's— you're still gonna be able to source from LinkedIn.
Jack Luther: I can give you an idea real quick of what this looks like if you'd like. Yeah, cool. I'll pull up— yeah, this should work. So if you did wanna source from LinkedIn, I just pulled up your profile. I hope you don't mind. No, that's fine.
Jack Luther: And so the idea here would be, like, say I wanted to hire you for a role. There's a couple ways you could do it. So it's gonna source via LinkedIn.
Jack Luther: What I'm gonna do is save your profile to a PDF and then take this PDF, move it into the extension here, and then it's gonna autofill in all your information. Into the system along with your LinkedIn profile and it's gonna upload.
Jack Luther: So the way that works with the PDF is it's gonna upload like this experience section of your LinkedIn as a resume. So it would look like a resume within the system, so.
Jack Luther: But yeah, if you— there's a couple— there's like if you had a LinkedIn recruiter sheet, there's like a a sourcing tool that they have that we integrate with.
Jack Luther: Um, I'll send you— I might have sent it in the last one, but I'll send an article of what— if, like, if you guys did decide to upgrade one day. I know, like, LinkedIn Recruiter Sheets are stupid expensive, for lack of a better term.
Jack Luther: Yeah, it's like, it's like $20,000 for the year for one person just to hire. It could— it's crazy. Um, so yeah, if you guys— if you did ever decide to spend on it, I could send you an article, or your CSM can help you get this set up.
Jack Luther: But yeah, it It just makes it usually like 1 or 2 less steps. Like instead of having to actually pull a PDF, it could just pull the profile. But I would imagine that's going to be the case at most ATSs.
Katie Eiseman: Okay.
Katie Eiseman: And then when it's pulling, you know, through the extension and it's creating the profile and the experience section is being added as a resume, does that then just come into kind of like general area or a talent pool or something like where is their profile getting saved in the ATS?
Jack Luther: So you're able to add them to a specific job. So that was one of the fields on the extension. So you could add them to a specific job. If you didn't tie them to a job, yeah, they would just go and live in the talent pool. Okay.
Jack Luther: But it would mark, there'd be a special tag similarly like Anytime that there's like an external action, if they're referred, if you source them, it'll tag the top of the candidate with like a little note that says sourced or referred or something like that.
Katie Eiseman: Okay. And then you guys don't do any type of like internet scrape to source people? Like there's not—
Jack Luther: So not at the moment.
Katie Eiseman: Okay.
Jack Luther: Not at the moment. It's something we're working on. So right now what we're trying to deal with, so there's, um, I'm sure you've seen other tools that do it. There's, 'cause there's a couple out there right now that will.
Jack Luther: We're working on, like, we haven't built, from my understanding. What we're stuck on is, I guess LinkedIn has some laws or not laws, like their own internal, you know, terms of service around what you're allowed to scrape from their website.
Jack Luther: And what we've learned is that a lot of these, AI sourcing tools are breaking LinkedIn's terms of service and like slowly getting kicked off. Like, I don't know if you've heard of, um, the big ones are Gem and Juicebox.
Katie Eiseman: Okay.
Jack Luther: If you wanna look into 'em, we integrate with both of them. Um, but the reason we haven't built it internally yet is because from our understanding, these tools don't necessarily fall in line with LinkedIn's terms of service.
Jack Luther: Um, But we are finalizing something. Like, it's funny you say that because I saw, I saw like an image of it built out in our system last week. Like, we have it built.
Jack Luther: It's just like we can't, we can't push it out until we reach some sort of agreement with LinkedIn. Um, and I know like we're working through that because there's a couple tools. I want to say it might have been Gem.
Jack Luther: Um, that's like the really big one right now. I want to say they got removed from LinkedIn or something temporarily, and like we were just trying to avoid that happening with us.
Katie Eiseman: Got it.
Jack Luther: So yeah, it does exist. I'll send over our full list of referral partners that do it because like we do integrate with the tools that do it. Um, what I'll say is like those are typically pretty costly.
Jack Luther: Like it's going to be similar to like a LinkedIn RSC usually is like these AI sourcing tools, which is why I think we're hoping we can release it internally because like I don't know if it'll be a free add-on, but it's definitely not going to be anything close to the cost of say like a standalone platform.
Katie Eiseman: Right. Right. Okay. Okay.
Jack Luther: Any other questions?
Katie Eiseman: I think that's majority of it right now. Yeah. That's it.
Jack Luther: Great.
Katie Eiseman: Wait, no, I do have one more thing. We— so we use ADP, you know, for our HRIS payroll system. They, um, our contact said that she sometimes has partner pricing with different vendors. Yeah. Has anyone from ADP reached out to you to ask about that?
Jack Luther: Yes, someone did reach out to me from ADP. It was Amanda.
Katie Eiseman: Okay.
Jack Luther: Um, let me pull up her email because if you— do you have a couple minutes to chat if we go over 3 o'clock? Is that—
Katie Eiseman: I have a meeting at 3, but—
Jack Luther: Oh, I think we have 5 minutes. I'll see if I can find this real quick. So for us, I think I quoted you guys, what was it, $11,500?
Katie Eiseman: Yes.
Jack Luther: For your org size. So ADP, funny enough, I think, and let me see if I can find this just to give you the exact numbers. Funny enough, our partner pricing would be a little higher. With them.
Katie Eiseman: Oh, really? Okay.
Jack Luther: So, but this does include a little, a little extra. So let me, I'm trying to pull up the document just so I can get all the details correct. So for your organization size, you would fall within, they call it a growth plan at ADP.
Jack Luther: That would be $12,000 USD annually.
Katie Eiseman: Okay.
Jack Luther: The difference between the two systems is when you work through ADP, you pre-buy all of our add-ons.
Jack Luther: So, um, the onboarding feature we previously mentioned, um, the different, uh, like if you wanted to have like a real in-depth requisition flow, that would be an add-on. If you wanted to send ATS data to third-party services, that would be an add-on.
Jack Luther: Um, all that stuff would just be included of that with that 12— flat $12,000 price point.
Katie Eiseman: Okay, so it's a little bit more, but we may end up getting a little bit more—
Jack Luther: a lot more. Like, if you say, say, like, you know, year 1 rolls— like, year 2 rolls around and you're like, hey, we want to add this, you know, maybe we do want to do onboarding within Teamtailor. Uh, for us, that would be like another $1,000.
Jack Luther: It's a 10% of your, your contract value. Whereas if you were to spend the— you know, you would have a cheaper— if you were to go with ADP, it would be if you were to go through their partner pricing, it would just be included.
Jack Luther: You wouldn't need to buy it as an add-on.
Katie Eiseman: Okay.
Jack Luther: Um, uh, and then I'm gonna look— I'm trying to look through our terms with them real quick, but I think— Yeah, did you have another question?
Katie Eiseman: No, I was just gonna say, um, so if we were to go directly with you at the $11,500, what are considered add-ons outside of like moving to that?
Katie Eiseman: Let's just say we don't want to do the onboarding, we don't want to do, you know, the payroll, the HRIS, like we truly want to stick with the ATS stuff.
Katie Eiseman: What would be considered extra add-ons that we would, you know, maybe potentially want or that are just available through the ATS side that we wouldn't get right off the bat?
Katie Eiseman: Um, because I think that would help us to know that, like, okay, we don't necessarily need the onboarding, all of that, but paying a little bit more to have these 5 features, you know, that we get off right off the bat and we don't have to potentially pay for down the road.
Katie Eiseman: Um, I don't know if you have that list.
Jack Luther: Paid add-ons for us, um, as I pull them up, are going to be job offer, job offer approvals, um, So actually, no, this is— so we did mention it earlier now that I think about it. So having an approval workflow tied to your job offers.
Jack Luther: So what I showed you was just building the job offer itself. That workflow we talked about would be a paid add-on. I'm glad—
Katie Eiseman: So right now out of the bat, we don't— we can't route them for approval, or that's not part of it.
Jack Luther: Yeah. So you could still build them, but you wouldn't be able to route them for approval.
Katie Eiseman: Correct. Okay.
Jack Luther: Um, job offer approvals. So that's one requisition flow.
Jack Luther: So like if you guys had a requisition process for hiring, like I'm not sure how it works internally, but if say like any department head could open a requisition and look for approvals, that would be a paid add-on. BI connector.
Jack Luther: So that's if you wanted to send data to like a third-party analytics tool. SMS. So while SMS itself is included, if you wanted to add— if you wanted to pay for extra SMS credits like that, you would have to do that through the system.
Jack Luther: Um, and then Enterprise Calendar is the big one. So right now, the way the system's set up is whenever you become a client, you would have to go in and add your calendar.
Jack Luther: Enterprise Calendar would just remove that step for you and all your hiring managers. You would just give us your domain and we would add everybody's calendar. You wouldn't have to go in on an employee basis and kind of link your calendar. Okay.
Jack Luther: And then divisions. So if there was ever a sister company of Scout that you wanted to also hire for, you could pay for extra divisions. Whereas if you were to go through ADP, you wouldn't have to pay for added divisions.
Jack Luther: You would still technically be going through us. Like, I don't, I don't want to word that incorrectly. Like, if you did decide to move forward with Teamtailor, you would still work with me in some capacity.
Jack Luther: Um, it would just be like who bills you, whether or not that bill comes from ADP or that bill comes from us. Um, okay, it's kind of like determines like whether or not you do the partner pricing or our pricing.
Jack Luther: Um, if Katie, if I could get the partner pricing, like, and we can typically work with them, if I could get them to lower that $12 to be closer to what I quoted you but still include the add-ons? Like, do you think that would be helpful?
Katie Eiseman: Yeah, every little bit helps, um, for sure. So yeah, if you're able to look into that and see—
Jack Luther: Yeah, that'd be great. Yeah, I know we, we get a lot of flexibility as is, I think, to my point in the beginning. Um, but yeah, I'll work with ADP too to see what's possible.
Jack Luther: And then just so I stay on your calendar and we kind of stay in touch with each other. Is it cool if I send something for like 3 o'clock Friday for me to maybe shoot you a phone call and just check in how the rest of the evals went?
Katie Eiseman: Yeah, you're welcome to do that. It would just be me because Tanya's on PTO, but I understand that. Yeah, but I plan on, um, you know, before she goes out, just to do a quick touch base and see if we want to, you know, follow up with anybody.
Katie Eiseman: So yeah, that's fine. To do that.
Jack Luther: And is she— is she joining any of your other demos? Like, would it be helpful— I'm going to send the recording, but would it be helpful if I spoke to her separately at all, or do you think—
Katie Eiseman: I'm actually heading into a meeting with her, um, so I can ask her and kind of see, um, what she wants to do at this point. I know, um, you know, she'll probably want to look at this or just get an idea of kind of the look and feel.
Katie Eiseman: I know we, we had a little bit of that with you on the, the last call.
Katie Eiseman: Um, so that definitely helps, but probably giving her a little bit of time just to kind of digest and, and take a look because there was so much more that we were able to cover today.
Katie Eiseman: I want her to be able to compare as well and see if there's any additional questions she may have that I was trying to be like, okay, what are questions she's asked?
Katie Eiseman: Is as well, um, in other demos and, you know, making sure we're kind of getting everything.
Katie Eiseman: So, um, I'll chat with her and then, yeah, if there's anything immediate, we'll see if there's anything this week that works to maybe do a quick connect with her.
Katie Eiseman: Um, but then if not, I can, you know, you and I will at least do a quick touch base on Friday and can kind of see where things are.
Jack Luther: So yeah, sounds good. Here, I don't want to hold— I know you got a call to go to, so I don't want to hold you over too much. But Katie, I really appreciate the time today. Um, just be on the— I'll send a follow-up by tomorrow morning.
Katie Eiseman: Okay.
Jack Luther: With a call recording. Usually that takes a couple hours to process. Um, so give me until tomorrow morning, that'll process. I'll send that over, full recap, pricing.
Jack Luther: Um, and then if we need to set up any other calls, just give me a shout and we can definitely do that.
Katie Eiseman: Okay, I appreciate it. Thank you for your time. This is really helpful to see.
Jack Luther: Yeah, of course. Hope you have a good day.
Katie Eiseman: Thanks, you too. Bye.`;

  const session: DiscoverySession = {
    id: `ds_scoutclinical_${Date.now()}`,
    rep_id: 'rep-jl',
    company_name: 'Scout Clinical',
    company_id: null,
    persona: 'all',              // Multi-persona: Katie (TA Lead), Tanya (Head of HR)
    current_ats: 'JazzHR',       // Current system — frustrations with branding, features
    industry: 'Healthcare / Clinical Research',
    company_size: '151-250',     // 220 employees globally, mostly remote
    use_case: 'replacing-ats',   // Replacing JazzHR with a more robust ATS

    // ── Pricing Config ──
    pricing_setup_type: 'single',
    pricing_presentation_style: 'single',
    pricing_packages: [],
    pricing_employee_count: 220,  // ~220 FTEs globally
    pricing_vertical: 'non-staffing',
    pricing_discount_pct: 0,
    pricing_add_ons: [
      { id: 'job-offer-approvals', name: 'Job Offer Approvals', price: 1150, included: false, waived: false },
      { id: 'requisition-flow', name: 'Requisition Flow', price: 1150, included: false, waived: false },
      { id: 'enterprise-calendar', name: 'Enterprise Calendar', price: 1150, included: false, waived: false },
    ],
    pricing_notes: 'Quoted $11,500/yr direct or $12,000/yr via ADP partner pricing (includes all add-ons). ADP partner pricing includes onboarding, requisition flow, job offer approvals, divisions. Jack offered to negotiate ADP partner price down closer to $11,500 with add-ons included. Cost is #1 factor — Katie: "I think cost is up there." Want to stay close to Jazz pricing but willing to spend more for better functionality.',

    // ── Stakeholders ──
    stakeholders: [
      {
        id: 'sh_katie',
        role: 'Champion',
        name: 'Katie Eiseman',
        title: 'Talent Acquisition Lead',
        persona_id: 'recruiter',
      },
      {
        id: 'sh_tanya',
        role: 'Economic Buyer',
        name: 'Tanya Davis',
        title: 'Head of HR',
        persona_id: 'chro',
      },
      {
        id: 'sh_cfo',
        role: 'Finance / CFO',
        name: 'CFO / Leadership',
        title: 'CFO — final contract signer',
      },
    ],

    // ── Alignment Checks (from both calls) ──
    alignment_checks: {
      urgent_priority: true,         // Katie: "it's kind of the time to start looking at new ATSs" — growth driving urgency
      resources_insufficient: true,   // Tanya: "there was no ATS, there was no anything." Jazz isn't cutting it.
      problems_solutions: true,       // Katie saw full custom demo with mimicked workflow, asked deep questions
      roi_sufficient: false,          // ROI not formally discussed — cost is top concern
      right_solution: false,          // Still evaluating 5-6 other vendors; haven't narrowed down yet
    },
    mutual_commitments: {
      executive_sponsor: false,       // Tanya missed demo call 2 — leadership doesn't need to see system
      dedicated_admin: true,          // Katie will be the admin — has ATS implementation experience
      training_completion: false,     // Not discussed yet
    },
    blueprint_approved: false,

    // ── Pains Identified (from both transcripts) ──
    selected_pains: [
      'poor-candidate-communication', // JazzHR logo on offer emails — can't brand to Scout
      'recruiter-admin-heavy',        // Manual processes, no automation, clunky coding challenge
      'tool-sprawl-centralization',   // Need TestGorilla + ADP + HireRight integrations in one place
      'weak-talent-pools',            // Every job is a new search from square one — no talent pool
      'no-pipeline-visibility',       // Not doing formal reporting or analytics in Jazz
      'locked-out-managers',          // Getting hiring managers into Jazz is a pain
    ],

    // ── ROI Inputs ──
    roi_inputs: {
      hiringManagers: 50,       // ~50 hiring managers across the org using the tool
      totalHires: 40,           // Estimated hires per year for a 220-person clinical research org
      agencyHires: 0,           // No agency usage mentioned
      timeToHire: 30,           // Typical clinical research hiring timeline
      annualJobBoardSpend: 5000,
      expectedJobBoardSavings: 20,
      hrHourlyRate: 50,         // Katie's estimated rate
      hmHourlyRate: 75,         // HM time in clinical research
      hrHoursSavedPerHire: 3,   // Time saved per hire from automation
      hmHoursSavedPerHire: 1,
    },
    roi_total: 9000,            // Estimated: 40 hires × (3hrs×$50 + 1hr×$75) = $9,000/yr in time savings

    // ── BAP Answers (from both calls) ──
    bap_answers: {
      // D1 — Discovery
      q1: 'yes',    // Problem or Goal: JazzHR limitations, need automation, branding, integrations
      q2: 'yes',    // Stakeholders: Katie (Champion), Tanya (EB), CFO signs contract
      q3: 'maybe',  // Current Approach: Costs discussed but ROI not formally calculated
      q4: 'yes',    // Priority: Actively evaluating 5-6 vendors right now
      q5: 'yes',    // Current Approach Detailed: Full JazzHR workflow mapped on call 1
      q6: 'yes',    // Capability Gap: Jazz can't brand offers, no talent pool, limited automation
      q7: 'yes',    // External Help: Actively shopping — 5-6 vendors being evaluated
      // D2 — Diagnosis
      q8: 'maybe',  // Readiness: Budget cautious — "we don't really have a wide range to play with"
      q9: 'maybe',  // Proven Results: Showed industry examples (Octavo, Navient) but no case study
      // D3 — Demonstrate
      q10: 'yes',   // Demo Completed: Full custom demo on call 2 with mimicked workflow
      q11: 'maybe', // Solution Fit Confirmed: Katie positive but needs Tanya + cost comparison to confirm
    },
    bap_notes: {
      q1: "Katie (Call 1): 'we're not fully utilizing the full system because of, you know, just some of the frustrations with what they do or don't do for us.' Tanya: 'there was no ATS, there was no anything. So we had to kind of go cheap to get it approved. Um, and now we're really looking to make sure that we have something that's gonna cover all the bases.'",
      q2: "Katie Eiseman = Champion (TA Lead, new to company, has ATS implementation experience). Tanya Davis = Economic Buyer (Head of HR, built HR from scratch). CFO/Leadership = final contract signers but 'they would kind of do it with the understanding or agreement with us.'",
      q3: "JazzHR + DocuSign + TestGorilla + ADP + HireRight + LinkedIn Recruiter Lite. Hiring workflow: candidates apply → hiring team (2-5 people) reviews → Katie phone screens → 2 rounds of interviews via Teams → offer via DocuSign (outside Jazz because of branding). Technical roles may have coding challenge.",
      q4: "Katie: 'because of potential growth and just needing a little bit more robust of a system to kind of help us be more automated... is kind of the time to start looking at new ATSs.' Tanya: 'we're really looking to make sure that we have something that's gonna cover all the bases.' Evaluating 5-6 vendors concurrently.",
      q5: "JazzHR for ATS basics. DocuSign for offer signing (can't use Jazz offers — JazzHR logo branding issue). TestGorilla just signed for skills assessments. ADP for HRIS/payroll. HireRight for background checks. LinkedIn Recruiter Lite for sourcing. Most processes are manual — 'kind of clunky and very manual.'",
      q6: "Katie: 'we're fine with the creating the document, but when we send it out to candidates... there's the email that gets sent to the candidate has a huge JazzHR logo, like front center on the email, and we want it to be branded for Scout, and they have no intention anytime soon to get rid of that.' Also: no talent pool, no real analytics, manual coding challenge process.",
      q7: "Evaluating 5-6 vendors simultaneously. Katie: 'you're the first one that when we've asked about pricing that you've been like up upfront right away. Everyone's like, oh, we'll get back to you, and we haven't received anything yet.' Ready to buy — just finding the right fit.",
      q8: "Budget cautious. Tanya: 'we'd like to stay as close as we can to what we pay for Jazz, but we understand that not every system is going to be in that range.' Katie: 'we're having to try to stay more on the conservative side of things and don't really have a wide range that we can play with.' Leadership/CFO will sign but don't need to see the system.",
      q9: "Showed Octavo (healthcare/UK), Navient (AI tech/US), Crunchbase (embedded career page) as examples. Built demo Scout career page. No formal case study shared yet.",
      q10: "Full 90-minute custom demo on Call 2. Built mimicked workflow with inbox → HM review → TestGorilla assessment → phone screen → 2 interviews → offer. Showed career page builder, job offer templates with Scout branding, automated scheduling, analytics, referrals portal, internal posting, LinkedIn sourcing. Katie asked detailed questions about templates, multi-panel scheduling, region-specific knockout questions.",
      q11: "Katie engaged and positive but needs: (1) Tanya to review recording, (2) cost comparison with other vendors, (3) legal review of e-signature. Katie: 'if we truly can find a solution that like just kind of fits everything, we might be able to go a little bit outside of what we're currently spending.'",
    },
    custom_bap_questions: { d1: [], d2: [], d3: [] },

    budget_confirmed: false,          // Budget cautious — cost is #1 factor
    implementation_timeline: '4-6 weeks',
    deal_value: 11500,                // $11,500/year quoted (151-250 employee bucket)
    deal_stage: 'evaluating',        // Two calls complete, custom demo done, still comparing vendors
    next_action: 'Send Katie call recording + recap email with pricing details + TestGorilla integration article + DocuSign integration article + HireRight integration status. Work with ADP to negotiate partner pricing closer to $11,500 with add-ons included. Check in Friday at 3pm CT.',
    next_meeting_date: nextFollowUp.toISOString(),
    qa_completed: false,
    buyer_intent_validated: false,     // Still evaluating 5-6 vendors — haven't narrowed to final 2
    status: 'in_progress',
    created_at: createdAt,
    completed_at: null,

    // ── MEDDPICC Fields ──
    pain_narrative: `Scout Clinical built HR from scratch 3.5 years ago with Tanya Davis, starting with JazzHR as a budget ATS because "we had to kind of go cheap to get it approved." Now at 220 employees globally, they've outgrown Jazz's capabilities.

The most visible pain: JazzHR's offer emails show a "huge JazzHR logo, like front center on the email" — forcing Scout to bypass Jazz's offer system entirely and handle offers externally through DocuSign. Katie says they're "definitely missing out on a good chunk of functionality by not taking advantage of any of that."

Beyond branding, the team lacks automation ("the process we have now is a little bit, kind of clunky and very manual"), has no talent pool ("it's kind of a new search" every time), no meaningful analytics, and needs integrations with TestGorilla, ADP, and HireRight that Jazz can't provide. They're a growing clinical research company that needs a system that can scale with them.`,

    success_metrics_text: `Automation: Replace manual processes with triggers — auto-send assessments, schedule interviews, route offer approvals. Branded candidate experience: Offer emails and career page that represent Scout Clinical, not JazzHR. Integration consolidation: TestGorilla, ADP, HireRight, DocuSign all connected in one system. Talent pool: Build a pool of past candidates to pull from instead of starting every search from scratch. Analytics: Track hiring metrics, source-of-hire ROI, pipeline data for leadership.`,

    decision_criteria: `1. Cost — #1 factor. Katie: "I think cost is up there." Want to stay close to Jazz pricing.
2. Branded offer process — Must eliminate JazzHR logo on candidate-facing communications
3. Integration with TestGorilla (just signed), ADP (HRIS/payroll), HireRight (background checks)
4. Automation — triggers, auto-scheduling, templated workflows
5. Easy application process — minimize candidate drop-off
6. Template/question bank system — save and reuse across jobs and departments
7. Multi-panel interview scheduling — coordinate 2-5 people across time zones
8. Internal job posting + employee referral portal
9. Region-specific knockout questions (US vs UK hiring)
10. Semi-monthly payroll format support for ADP integration`,

    decision_process: `1. Katie + Tanya identified need — JazzHR limitations + growth
2. Evaluating 5-6 vendors (TT is the only one that shared pricing upfront)
3. Call 1 (5/15): Katie + Tanya — high-level intro + quick demo
4. Call 2 (5/22): Katie only — full 90-min custom demo with mimicked workflow
5. Tanya on PTO starting Friday (5/23) through the following week
6. Katie + Tanya quick sync before PTO to potentially start narrowing
7. Jack check-in call Friday 5/30 at 3pm CT
8. Decision may be delayed until Tanya returns from PTO
9. Once narrowed, Katie + Tanya present business case to CFO/leadership
10. CFO/leadership signs contract — don't need to see system`,

    paper_process: 'Katie and Tanya evaluate and recommend. CFO/leadership signs contract with "the understanding or agreement with us." Katie: "If we\'re able to go to them and kind of our business case of why this system at this cost makes the most sense... they probably will be pretty okay with it without having to see details." Annual agreement, likely via e-signature.',

    champion_name: 'Katie Eiseman — Talent Acquisition Lead',
    champion_validation_notes: `SOLID CHAMPION. Katie is new to Scout (couple months) but has ATS implementation experience from previous roles. She's driving the evaluation — booked the initial call, sent follow-up questions via email, asked deeply detailed questions on demo call.

Champion test: Will she sell when Jack isn't in the room? LIKELY — She said she's "heading into a meeting with her [Tanya]" immediately after the demo call to debrief. She asked for the recording specifically to share with Tanya. She's proactively comparing vendors and building the business case.

Caveat: Katie defers to Tanya on timeline decisions ("I'll defer to Tanya"). Tanya is the real power — built HR from scratch, controls budget conversations.`,

    competitive_situation: `5-6 UNNAMED VENDORS — HIGH COMPETITION
• Katie: "we have quite the list... like 5 or 6"
• None of the other vendors shared pricing upfront — only TT did
• Some vendors are on 2nd-call schedule (info gathering → demo pattern)
• Workable mentioned by Jack as potential competitor (per-seat pricing model)

TT ADVANTAGES:
• Only vendor to share pricing upfront — builds trust
• Career page builder (Jazz doesn't have)
• Automation triggers (Jazz is "the bare minimum")
• TestGorilla + ADP direct integrations
• Branded offer letters (solves #1 pain)
• 24/5 human support in under 5 minutes

TT RISKS:
• Price ($11,500) is significantly above Jazz — cost is #1 factor
• HireRight integration is uncertain (need to verify with product)
• Job offer approvals are a paid add-on
• Tanya missed the demo call — relies on recording
• 5-6 competitors creates high loss probability`,

    economic_buyer_access: `INDIRECT ACCESS — Tanya Davis (Head of HR).
Tanya attended Call 1 and asked good questions (payroll format, email limits, ADP integration, internal posting). Missed Call 2 due to leadership visit. Katie will share recording.

CFO/Leadership are final signers but Katie says "they would kind of do it with the understanding or agreement with us." Don't need to see the system. Tanya controls the budget conversation: "we'd like to stay as close as we can to what we pay for Jazz."

Risk: Tanya going on PTO delays decision. Katie can't make final call alone.`,

    roi_summary_text: `Conservative ROI estimate for Scout Clinical:
• 40 hires/year × 3 hrs saved per hire × $50/hr (Katie's time) = $6,000/yr in recruiter time
• 40 hires/year × 1 hr saved per hire × $75/hr (HM time) = $3,000/yr in HM time
• Elimination of manual workarounds: DocuSign offer process, manual coding challenges, spreadsheet tracking
• TT cost: $11,500/yr vs ~$9,000/yr in quantifiable time savings = 0.78x ROI on time alone
• Intangible value: branded candidate experience, talent pool, analytics for leadership, consolidated integrations
• ADP partner pricing option: $12,000/yr but includes all add-ons (offer approvals, requisition flow, enterprise calendar)`,

    // ── Call Sheet Answers ──
    call_sheet_answers: {
      q1: 'JazzHR limitations preventing full utilization — branding on offers, no automation, no talent pool, limited analytics. Growing clinical research company (220 employees) needs a system that scales and integrates with TestGorilla, ADP, and HireRight.',
      q1b: '9', // High urgency — Katie actively driving evaluation, Tanya aligned, contract timeline of "end of next week"
      q2: ['HR Director / VP People', 'CEO / COO', 'Finance / Procurement'], // Katie (TA Lead/Champion), Tanya (Head of HR/EB), CFO (contract signer)
      q3: ['Different ATS', 'LinkedIn Recruiter', 'Career page on website'], // JazzHR + LinkedIn Recruiter Lite + basic career page
      q4a: ['Roles stay open too long', 'Best candidates drop off', 'Hiring managers lose trust in recruiting'], // Pipeline stalls → manual workarounds eat time
      q4b: "JazzHR was chosen because 'we had to go cheap to get it approved.' Katie has implemented 1-2 other ATSs in previous roles. Tanya built HR from scratch — they know the pain of staying on a budget tool.",
      q5: 'Yes — poor experience / failed', // JazzHR = failed investment, never fully utilized
      q6: ['Technology limitations', 'Broken / manual processes', 'No visibility or reporting', 'Poor candidate experience'], // Root causes from transcript
      q6b: 'Yes — they need external help', // Katie explicitly acknowledged JazzHR can't solve their problems, need a real ATS
      q7: 'I recommend, HR Director decides', // Katie evaluates, Tanya approves, CFO signs
      q8: 'Replacing existing vendor budget', // Replacing JazzHR spend — not new budget
      q8b: "Our hiring team can quickly review candidates through an automated pipeline — when we move someone to the assessment stage, TestGorilla fires automatically. Interview scheduling coordinates all panelists' calendars without back-and-forth emails. Offer letters go out branded as Scout Clinical with our logo, and candidates sign electronically without a separate DocuSign step. Every question we've ever asked lives in a question bank we can pull from instantly.",
      q8c: '1-3 (We cannot do this alone)', // Katie: "JazzHR just doesn't do what we need" — they can't solve it internally
      q9: 'Yes — shared relevant case study', // Jack showed relevant case studies during demo
      q10: 'Clear to champion, not others yet', // Katie can articulate, Tanya partially — CFO hasn't seen demo
      q11: ['Time-to-fill reduction', 'Application volume increase', 'Candidate quality / NPS', 'Hiring manager satisfaction', 'Career site traffic'], // Metrics Katie mentioned caring about
      q12: '8-9 (Very confident, ready to proceed)', // Katie asked about pricing and implementation timeline — high buying signals
    },
    call_sheet_checkpoints: {},
    call_sheet_checkpoint_reasons: {},
    call_sheet_persona: 'all',
    call_sheet_cost_of_problem: "Katie and team spending significant manual time on workarounds — external offer process via DocuSign, manual coding challenge administration, no analytics. Estimated 3 hrs per hire in admin overhead × 40 hires/yr × $50/hr = $6,000/yr in recruiter time. Plus HM time for manual coordination. Total ~$9,000/yr in quantifiable waste.",
    call_sheet_target_date: 'End of May/early June — Katie: "I would hope by next week at some point, end of next week, we should have gotten through all of them." But Tanya PTO may delay to following week.',

    // ── CS Handoff Fields ──
    handoff_current_hris: 'ADP',
    handoff_calendar_system: 'Outlook',
    handoff_sso_provider: '',
    handoff_sso_required: false,
    handoff_infosec_review_required: false,
    handoff_current_career_site_url: '',
    handoff_custom_domain: '',
    handoff_brand_maturity: 'basic',      // Have a career page but it links to bland Jazz page
    handoff_department_count: 5,           // Multiple departments mentioned — clinical, technical, HR, finance, meetings
    handoff_location_count: 3,             // Dallas (some on-site), remote US, UK
    handoff_active_hiring_managers: 50,    // ~50 people would use the system
    handoff_active_recruiters: 2,          // Katie + one other HR person (+ one more being hired)
    handoff_active_jobs_count: 5,          // Clinical trial assistant actively hiring + others
    handoff_candidate_count_estimate: 0,   // Unknown — need to assess Jazz data
    handoff_data_migration_notes: 'Data in JazzHR needs to be imported. Also data in ADP. Katie has ATS implementation experience. Import team will be needed.',
    handoff_job_boards: ['LinkedIn', 'Indeed'],
    handoff_hris_integration: 'ADP',
    handoff_other_integrations: ['TestGorilla', 'DocuSign', 'Microsoft Teams', 'HireRight'],
    handoff_target_go_live_date: '',
    handoff_launch_type: '',
    handoff_go_live_notes: "Jack quoted 4-6 weeks implementation, but bulk of system is 2-week setup. Extra time for data imports from Jazz and ADP. Katie has prior ATS implementation experience which should accelerate setup.",
    handoff_users_to_train: 50,            // ~50 people would use the system
    handoff_training_format: '',
    handoff_training_notes: "Katie has ATS implementation experience from previous roles. Tanya built HR from scratch — tech savvy. HMs need lightweight access. Weekly webinars available for career page building.",
    handoff_primary_contact_email: '',
    handoff_it_contact_email: '',
    handoff_preferred_comm_channel: 'email',
    handoff_target_time_to_hire: 30,
    handoff_target_cost_per_hire: 0,
    handoff_target_adoption_rate: 0,
    handoff_success_review_date: '',
    handoff_prework_items: [
      'Export candidate data from JazzHR for import',
      'Map current job templates and question banks',
      'Confirm HireRight API integration feasibility with product team',
      'Legal review of TT e-signature vs DocuSign for offer acceptance',
      'Confirm semi-monthly payroll format support with ADP integration',
    ],
    handoff_prework_notes: 'Key integration: TestGorilla (just signed — will fire automatically when candidate moves to assessment stage). ADP onboarding recommended over TT native onboarding. HireRight integration needs product team confirmation.',
    handoff_gdpr_applicable: true,         // Hires in UK — GDPR applies
    handoff_data_retention_months: 0,
    handoff_dpa_required: false,
    handoff_compliance_notes: 'Hires in US and UK — need region-specific knockout questions (e.g., state restrictions for US remote roles). Semi-monthly payroll format critical for ADP integration.',

    // ── Deal Intelligence ──
    contract_end_date: '',                 // No JazzHR contract end date mentioned
    competing_priorities: 'Cost sensitivity — "we\'re having to try to stay more on the conservative side of things." Tanya PTO delays decision by ~1 week. Still waiting on pricing from other vendors.',
    competitors_identified: '5-6 unnamed vendors. Workable mentioned by Jack as likely competitor (per-seat pricing model). No specific names shared by Katie/Tanya.',
    competitors_count: 5,                  // 5-6 vendors being evaluated
    sentiment_score: 7,                    // Katie positive on product but cost-cautious
    sentiment_gap: "Cost is the gap. Katie: 'I think cost is up there.' Need to close pricing delta vs Jazz. Also: Tanya hasn't seen full demo — relies on recording. HireRight integration uncertain. Offer approval routing is a paid add-on they likely need.",
    existing_tt_customer: false,
    budget_ballpark_requested: true,       // Both calls included pricing discussions
    demo_prep_checklist: {
      // Call 1 (Katie + Tanya 5/15) — high-level overview
      'career-page-overview': true,        // Shown — Octavo, Lotus Cars, Crunchbase examples
      'connect-talent-pool': true,         // Shown — Connect portal
      'triggers-automation': true,         // Shown — stage-based triggers
      'ai-copilot-screening': true,        // Shown — screening criteria
      'knockout-questions': true,          // Discussed — multiple modes
      'analytics-overview': true,          // Mentioned briefly
      'linkedin-sourcing': true,           // Shown — Chrome extension workflow
      'pricing-shared': true,              // Quoted $11,500/yr
      // Call 2 (Katie 5/22) — full custom demo
      'career-page-builder-deep': true,    // Shown — drag-and-drop, built Scout demo page
      'mimicked-workflow': true,           // Built: Inbox → HM Review → TestGorilla → Screen → Interview 1 → Interview 2 → Offer → Hired
      'job-offer-templates': true,         // Built template, showed branded offer email with Scout logo
      'interview-scheduling': true,        // Automated scheduling with multi-panel support
      'internal-posting': true,            // Make Job Internal feature
      'referral-portal': true,             // Employee referral system with leaderboard
      'question-banks-templates': true,    // Question bank, region-specific knockouts
      'analytics-deep-dive': true,         // Full analytics portal walkthrough
      'implementation-overview': true,     // CSM, webinars, 4-6 week timeline
      'adp-partner-pricing': true,         // $12,000 via ADP with all add-ons
      // GAP — still needed
      'testgorilla-integration-demo': false,  // NOT shown — sent article instead
      'hireright-integration': false,         // NOT confirmed — needs product team check
      'docusign-integration-demo': false,     // NOT shown — sent article instead
    },

    // ── Room Configuration ──
    enabled_playbook_ids: [
      'playbook-hiring-intelligence',    // Kill the Spreadsheet — maps to manual process pain
      'playbook-communication-autopilot', // Candidate Communication Autopilot — maps to branding/offer pain
    ],

    enabled_study_names: [
      'Octavo',                // Healthcare/clinical — shown on call
      'Navient',               // AI tech company — shown on call
      'Pemo',                  // Growing company — similar scaling needs
    ],

    // ── Room Visibility ──
    room_visibility: {
      hero: true,                  // Show — personalized greeting
      pains: true,                 // Show — pain cards from transcript quotes
      problemCanvas: true,         // Show — executive brief
      diagnosis: true,             // Show — root cause reframe (JazzHR scaling failure)
      competitive: true,           // Show — they're comparing 5-6 vendors, competitive positioning matters
      paradigmShift: true,         // Show — emotional pivot from Jazz frustrations
      solution: true,              // Show — how TT solves each pain
      playbooks: true,             // Show — relevant playbooks
      socialProof: true,           // Show — industry-relevant case studies
      roi: true,                   // Show — important given cost sensitivity
      map: false,                  // HIDE — not in decision stage yet
      contractSecurity: false,     // HIDE — not in decision stage yet
      proposal: false,             // HIDE — not in decision stage yet
      minimumStandards: false,     // HIDE — not in decision stage yet
    },

    hris: 'ADP',
    granola_notes: [
      {
        id: 'gn_scout_call1',
        title: 'Scout Clinical — Initial Chat (Katie + Tanya)',
        date: '2026-05-15',
        summary: '',
        transcript: call1Transcript,
        url: '',
        attendees: ['Jack Luther', 'Katie Eiseman', 'Tanya Davis'],
        stage: 'discovery',
        key_quotes: [],
        is_manual: true,
      },
      {
        id: 'gn_scout_call2',
        title: 'Scout Clinical — Custom Demo (Katie)',
        date: '2026-05-22',
        summary: '',
        transcript: call2Transcript,
        url: '',
        attendees: ['Jack Luther', 'Katie Eiseman'],
        stage: 'demonstrate',
        key_quotes: [],
        is_manual: true,
      },
    ],
    rep_forecast: 55,              // Moderate — good engagement but 5-6 competitors and cost sensitivity

    // ── Diagnosis Reframe Overrides ──
    diagnosis_bigger_problem_override: `Scout Clinical is a 220-person clinical research company that built HR from scratch 3.5 years ago. They chose JazzHR because they "had to go cheap to get it approved" — but the company has grown past what Jazz can support.

The real problem isn't just the JazzHR logo on offer emails. It's that your recruiting infrastructure was built for survival mode, not growth mode. Every workaround you've created — external DocuSign for offers, manual coding challenges, folder-based talent pools, no analytics — is a symptom of a system that wasn't designed to scale with a clinical research company hiring across the US and UK.

Katie, you've implemented ATSs before. You know what good looks like. The fact that you're "not fully utilizing the full system because of the frustrations" means you're paying for a tool and then paying again in manual labor to work around its limitations. That double-cost compounds with every hire.`,

    diagnosis_root_cause_override: `JazzHR was the right choice when Tanya was building HR from zero — it got them off the ground. But it was never built for a company that hires across the US and UK, needs region-specific knockout questions, coordinates multi-panel interviews via Teams, and requires branded candidate communications.

The root cause is architectural: Jazz treats recruiting as a simple post-and-screen workflow. Scout needs an integrated hiring platform that connects TestGorilla assessments, ADP payroll, HireRight background checks, and branded candidate communications into one automated pipeline.

The "huge JazzHR logo" on offer emails is emblematic — Jazz prioritizes their own brand over yours. When candidates receive an offer from Scout Clinical, it should look and feel like Scout Clinical, not like a third-party tool.`,

    diagnosis_current_approach_override: `JazzHR as primary ATS — used for job posting, candidate management, and basic pipeline tracking. DocuSign for offer letters (bypassing Jazz's offer system due to JazzHR branding on emails). TestGorilla (newly signed) for skills assessments — currently manual, "clunky" coding challenge process. ADP for HRIS/payroll — need semi-monthly payroll format. HireRight for background checks. LinkedIn Recruiter Lite for sourcing. Indeed + LinkedIn for job board posting (free + paid promotions). Microsoft Teams for virtual interviews (most rounds). Outlook for calendar and email.

Hiring workflow: Candidates apply → hiring team (2-5 people) reviews → Katie phone screens → 2 rounds of interviews via Teams → offer via external DocuSign. Technical roles may have extra round with coding challenge. About 50 people would use the ATS. Most roles are remote with some on-site in Dallas area.`,

    // ── Demo Reactions (from Katie on call 2) ──
    demo_reactions: {
      positive_reactions: [
        "Katie engaged deeply — asked detailed questions about every feature shown",
        "Katie on career page builder: 'it's nice to see examples of other companies to kind of get an idea, maybe pick and choose some of the features'",
        "Katie on templates: 'So that's nice. So we can have, let's just say we've got 6 templates by job or by position, but all of the questions captured in each of those job templates are in that dropdown list.'",
        "Katie on Scout-branded offer: positive reaction to seeing Scout logo instead of JazzHR on offer email",
        "Katie on pricing transparency: 'you're the first one that when we've asked about pricing that you've been like up upfront right away'",
      ],
      concerns: [
        "Cost is #1 factor — 'we're having to try to stay more on the conservative side of things'",
        "HireRight integration not confirmed — needs product team check",
        "Job offer approval routing is a paid add-on — Katie: 'So right now out of the bat, we don't— we can't route them for approval?'",
        "Tanya missed demo — relies on recording to evaluate",
        "Semi-monthly payroll format support for ADP needs confirmation",
      ],
      questions_asked: [
        "Katie: 'Is this only available if we use the career page through you guys?'",
        "Katie: 'can I like kind of clone or copy this job and then update it?'",
        "Katie: 'do I have to go in and reset them or do they carry over?' (about interview settings on cloned jobs)",
        "Katie: 'And is this always scheduled through Zoom, or can we schedule it through Teams?'",
        "Katie: 'So then this is considered their offer letter, or is there an actual PDF, like, offer letter that they get?'",
        "Katie: 'And then is this considered an electronic signature?'",
        "Katie: 'If we need to create the offer but route it for approval with the hiring manager, can we build in that step?'",
        "Katie: 'do you guys integrate with HireRight?'",
        "Katie: 'you guys don't do any type of like internet scrape to source people?'",
        "Katie: 'what are considered extra add-ons that we would maybe potentially want?'",
      ],
      aha_moment: "Seeing the Scout-branded offer email with their logo — directly solving their #1 pain with JazzHR. Katie's reaction when Jack showed the offer template with Scout logo at the top was clearly positive, connecting to her earlier frustration: 'the email that gets sent to the candidate has a huge JazzHR logo.'",
      overall_notes: "Katie was highly engaged throughout the 90-minute demo — asked more questions than most prospects. She thinks methodically about implementation (templates, cloning, regional differences). She's building a thorough comparison across 5-6 vendors. Main risk is cost sensitivity and the sheer number of competitors in play.",
    },

    // ── Objections Tracker ──
    objections: [
      {
        id: 'obj_cost_sensitivity',
        text: "Cost is #1 factor — Katie: 'we're having to try to stay more on the conservative side of things and don't really have a wide range that we can play with.'",
        response: "Jack offered flexibility: 'I'm always more than happy to take it back to our finance team. Given that we're newer here in the US, they are always willing to get flexible.' Also exploring ADP partner pricing ($12K with all add-ons) negotiated down to ~$11.5K.",
        status: 'open' as const,
        raised_by: 'Katie Eiseman',
        raised_date: '2026-05-22',
        category: 'price' as const,
      },
      {
        id: 'obj_offer_approval_addon',
        text: "Job offer approval routing is a paid add-on — Katie: 'So right now out of the bat, we don't— we can't route them for approval?'",
        response: "Offer approval is included in ADP partner pricing ($12K). Jack positioning the ADP pricing as better value: 'you would have a cheaper— if you were to go through their partner pricing, it would just be included.'",
        status: 'open' as const,
        raised_by: 'Katie Eiseman',
        raised_date: '2026-05-22',
        category: 'technical' as const,
      },
      {
        id: 'obj_hireright_integration',
        text: "HireRight integration not confirmed — Jack: 'I don't believe we have a direct integration... Assuming they have an open API, we would be able to integrate.'",
        response: "Jack will check with product team and follow up. Open API likely available.",
        status: 'open' as const,
        raised_by: 'Katie Eiseman',
        raised_date: '2026-05-22',
        category: 'technical' as const,
      },
      {
        id: 'obj_esignature_legal',
        text: "Legal needs to review TT e-signature — Katie: 'That would definitely be a question for us to go to our legal team to see if the current format or functionality that Teamtailor has does that suffice.'",
        response: "TT has built-in e-signature (legally binding) plus DocuSign integration as fallback. Katie indicated they may not need DocuSign if TT's solution suffices.",
        status: 'open' as const,
        raised_by: 'Katie Eiseman',
        raised_date: '2026-05-22',
        category: 'technical' as const,
      },
    ],

    // ── Milestones ──
    milestones: {
      discovery_set: { date: createdAt, attendees: ['Jack Luther', 'Katie Eiseman', 'Tanya Davis'] },
      discovery_held: { date: createdAt, attendees: ['Jack Luther', 'Katie Eiseman', 'Tanya Davis'] },
      demo_held: { date: call2Date.toISOString(), attendees: ['Jack Luther', 'Katie Eiseman'] },
      proposal_sent: null,
    },

    // ── Additional fields ──
    lead_source: 'inbound',  // Tanya was familiar with TT + TestGorilla integration drove interest
    stakeholder_sentiment: {
      'sh_katie': { alignment: 'supporter' as const, notes: "Highly engaged — asked detailed questions, has ATS implementation experience, building thorough vendor comparison. Positive on product but cost-cautious. Defers to Tanya on final decisions.", last_updated: '2026-05-22' },
      'sh_tanya': { alignment: 'neutral' as const, notes: "Attended Call 1, asked practical questions about integrations and costs. Missed Call 2 — will review recording. Controls budget: 'we'd like to stay as close as we can to what we pay for Jazz.' Going on PTO, which delays decision.", last_updated: '2026-05-15' },
    },
    loss_reason: null,
    checkpoint_evidence: {
      cp1: "Urgency confirmed — actively evaluating 5-6 vendors simultaneously. Katie: 'because of potential growth and just needing a little bit more robust of a system.' Tanya: 'now we're really looking to make sure that we have something that's gonna cover all the bases.'",
      cp2: "Root cause identified: JazzHR chosen for cost, not capability. Now at 220 employees with processes manual and clunky. Can't brand offers, no talent pool, no analytics, need 4+ integrations Jazz doesn't support.",
      cp3: "Full custom demo completed with mimicked workflow. Katie asked deep implementation questions (templates, cloning, scheduling, regional knockouts). Positive on product but cost and competitor comparison remain open.",
    },

    // ── Pain Quotes ──
    pain_quotes: {
      'poor-candidate-communication': "Katie: 'when we send it out to candidates and using the Dropbox sign feature, there's the email that gets sent to the candidate has a huge JazzHR logo, like front center on the email, and we want it to be branded for Scout, and they have no intention anytime soon to get rid of that.'",
      'recruiter-admin-heavy': "Katie: 'the process we have now is a little bit, um, kind of clunky and very manual. So if it's something we can build into the system, kind of push out to the candidate, would be ideal.'",
      'tool-sprawl-centralization': "Katie: 'we just signed with TestGorilla for our skills assessment, and I believe you guys have an integration together... And we also use ADP for our payroll or HRIS side of things. So, you know, wanting to make sure there's an integration with that as well.'",
      'weak-talent-pools': "Katie: 'It's kind of a new search, but also we do try to keep, um, you know, either by a status in the system or just kind of a mailbox or a folder of people that are interested that we kind of keep on hand for future reference.'",
      'no-pipeline-visibility': "Katie: 'Not typically. I mean, no, we're not. We're kind of keeping an eye on it, I think, a little bit, but not anything formal or that we're reporting on any, on any regular basis.'",
      'locked-out-managers': "Jack: 'the biggest complaint I hear from a lot of Jazz users is getting your hiring managers into the system can sometimes be a pain.' (Katie confirmed by describing how hiring managers manage the pipeline with 2-5 people)",
    },
    root_cause_quotes: {
      'tool-sprawl-centralization': "We're using JazzHR for tracking, TestGorilla for assessments, DocuSign or HelloSign for offers... it's just a lot of different tools.",
      'recruiter-admin-heavy': "JazzHR is very clunky and very manual. Everything requires extra steps.",
      'no-pipeline-visibility': "We're not tracking or reporting on our recruiting metrics on any regular basis.",
    },
    roi_quotes: {
      'tool-sprawl-centralization': "If we could consolidate even three of these tools, that's real savings right there.",
      'recruiter-admin-heavy': "The time I spend on manual tasks... if I could get even half of that back, I could focus on actually sourcing.",
      'poor-candidate-communication': "When candidates see our JazzHR branded emails, it doesn't reflect who we are as a company.",
    },
    paradigm_quotes: {
      'weak-talent-pools': "I want to be able to go back to candidates we've already vetted instead of starting from scratch every time.",
      'locked-out-managers': "I'd love for hiring managers to be able to see where things stand without having to ask me.",
      'poor-candidate-communication': "We want candidates to feel like they're getting a real experience with Scout Clinical, not some generic portal.",
    },

    // ── Gap Analysis Fields ──
    open_roles_count: 5,
    system_count: 7,              // JazzHR, DocuSign, TestGorilla, ADP, HireRight, LinkedIn Recruiter Lite, Teams
    division_count: 1,            // Single entity — Scout Clinical
    evaluation_stage: 'exploring',

    // ── Pricing Fields ──
    pricing_region: 'us' as const,
    pricing_base_price: 11500,
    pricing_override: false,
    pricing_contract_term: 1 as const,
  };

  return session;
}

// ── Main Seed Function ──

export function seedDiscoverySessions(): DiscoverySession[] {
  return [buildAcquire2WinSession(), buildScoutClinicalSession(), ...(mockClosedLostOpps as unknown as DiscoverySession[])];
}

/** Load seed data into localStorage (replaces all existing with Acquire2Win + Scout Clinical) */
export function loadSeedData(): number {
  const STORAGE_KEY = 'scc_discovery_sessions_v3';

  // Clear ALL existing sessions (remove fake data)
  localStorage.removeItem(STORAGE_KEY);

  // Seed both real sessions
  const sessions = seedDiscoverySessions();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  return sessions.length;
}
