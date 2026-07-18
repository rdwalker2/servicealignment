// ════════════════════════════════════════════════════════════════════
// Farmers Insurance Kaysville — Fully Enriched Discovery Room
// Built from Jack Luther's initial connect call (6/11/2026, ~44 min)
// Contact: Eden Thompson (Office Manager), DM: Tim (District Manager)
// ════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'scc_discovery_sessions_v3';

export function seedFarmersKaysvilleRoom(): string {
  let existing: any[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) existing = JSON.parse(raw);
  } catch { /* empty */ }

  // Don't duplicate — return existing ID if found
  const found = existing.find((s: any) =>
    (s.company_name || '').toLowerCase().includes('farmers') &&
    (s.company_name || '').toLowerCase().includes('kaysville')
  );
  if (found) return found.id;

  const SESSION_ID = `ds_farmers_kaysville_${Date.now()}`;

  const session: any = {
    id: SESSION_ID,
    rep_id: 'rep-jl',
    company_name: 'Farmers Insurance — Kaysville District',
    company_id: null,
    persona: 'chro',
    current_ats: 'idealtraits',
    industry: 'insurance',
    company_size: '1-50',
    use_case: 'replacing-ats',

    // ── Stakeholders ──
    stakeholders: [
      { id: 'sh_eden', role: 'Project Lead', name: 'Eden Thompson', title: 'Office Manager — Kaysville District' },
      { id: 'sh_tim', role: 'Economic Buyer', name: 'Tim', title: 'District Manager — Kaysville' },
      { id: 'sh_trina', role: 'Champion', name: 'Trina', title: 'Dual-Appointed Agent (AgencyZoom evaluator)' },
    ],

    // ── Pains (from transcript) ──
    selected_pains: [
      'tool-sprawl-centralization',
      'vendor-support-gap',
      'manual-sourcing',
      'outdated-career-site',
      'scheduling-chaos',
    ],

    // ── Custom Paradigm Shift (Hope side — from transcript) ──
    custom_hope_pillars: [
      {
        title: 'Broken Workflow',
        subtitle: 'Using 2 disconnected systems — IdealTraits for sourcing, Apex Talent for tracking — with manual data entry between them. Eden called it "a little bit of a broken workflow."',
      },
      {
        title: 'Tools Disappearing',
        subtitle: 'Apex Talent is being sunset across all Farmers locations (corporate mandate) and IdealTraits was just canceled because "we were getting like nothing" from job boards.',
      },
      {
        title: 'Single-Board Fallback',
        subtitle: 'With both tools gone, they\'re left with only KSL (a Utah-only local job board) — no Indeed, LinkedIn, or ZipRecruiter distribution for ~25 agent roles.',
      },
    ],

    roi_inputs: { hiringManagers: 1, totalHires: 25, agencyHires: 0, timeToHire: 30, annualJobBoardSpend: 2000 },
    roi_total: 12000,

    alignment_checks: {
      urgent_priority: true,
      resources_insufficient: true,
      problems_solutions: false,
      roi_sufficient: false,
      right_solution: false,
    },
    mutual_commitments: { executive_sponsor: false, dedicated_admin: false, training_completion: false },
    blueprint_approved: false,

    // ══════════════════════════════════════════════════════════════
    // BAP ANSWERS — ALL 12 QUESTIONS (from call transcript)
    // ══════════════════════════════════════════════════════════════
    bap_answers: {
      q1: 'yes',    // Core Problem: Apex sunsetting + IdealTraits canceled + broken 2-system workflow
      q2: 'yes',    // Stakeholder Map: Eden (PL), Tim (EB), Trina (evaluating AgencyZoom)
      q3: 'maybe',  // Cost of Indecision: Fall back to KSL-only — severely limited reach
      q4: 'yes',    // Priority: Apex sunsetting is corporate-wide forced timeline
      q5: 'yes',    // Current Approach: IdealTraits (canceled) + Apex (sunsetting) + KSL
      q6: 'yes',    // Capability Gap: IdealTraits not delivering, Apex just note-taking, broken workflow
      q7: 'maybe',  // Need External Help: Eden says TT is "a better option" but waiting on AgencyZoom
      q8: 'maybe',  // Readiness: Budget exists but comparing to free AgencyZoom shared login
      q9: 'maybe',  // Proven Results: Jack mentioned UK insurance customers — needs references
      q10: 'maybe', // Solution Map: Showed Provider + career site + scheduling — Tim hasn't seen yet
      q11: 'maybe', // Success Metrics: Implied (more applicants, unified workflow, always-on recruiting)
      q12: 'maybe', // Trial Close: "a better option" but needs Tim + AgencyZoom comparison
    },
    bap_notes: {
      q1: "Apex Talent (Farmers' internal Provider/CRM) is being sunset across ALL Farmers locations. They just canceled IdealTraits annual renewal because it wasn't delivering applicants via Indeed/LinkedIn/ZipRecruiter. Currently falling back to KSL (Utah-only job board).",
      q2: "Eden = Office Manager, 2 months in, just passed P&C license. Tim = District Manager, decision maker, hasn't seen product. Trina = dual-appointed agent evaluating AgencyZoom.",
      q3: "Without action they're limited to KSL only (Utah local board) — no Indeed/LinkedIn/ZipRecruiter distribution. ~25 agents across district to recruit for.",
      q4: "Apex is sunsetting for EVERY Farmers location — corporate mandate. IdealTraits renewed annually on the 16th — canceled to avoid paying for underperformance.",
      q5: "Workflow: (1) Post via IdealTraits to Indeed/LinkedIn/Zip, (2) Review in IdealTraits, (3) Email candidate, (4) Log ALL interactions into Apex Talent. Eden: 'a little bit of a broken workflow.'",
      q6: "IdealTraits: 'We were getting like nothing' — had to pause/unpause job posts weekly to stay visible. Apex: just a note-taking location. The 2-system shuffle creates friction and drop-off.",
      q7: "Eden literally said 'this is just a better option in my opinion.' But she's junior and wants to wait for Trina's AgencyZoom eval before presenting to Tim.",
      q8: "AgencyZoom would be 'free' via shared login. Jack flagged risk: 'if the company catches it, they'll deactivate the account.' Real question: will Tim pay for purpose-built hiring?",
      q9: "Jack mentioned UK insurance firm customers and his own life insurance background. Need to send specific insurance case studies.",
      q10: "Showed career site builder (Eden: 'my boss would like that'), Provider pipeline, AI screening, interview scheduling (Google Cal + Teams), messaging (email + SMS). Eden positive on every feature.",
      q11: "Implied: more applicants vs. 'getting like nothing', unified workflow vs. 2-system shuffle, always-on recruiting for 1099 agents.",
      q12: "Eden: 'this is just a better option in my opinion.' Needs Tim buy-in. Next: sandbox, Eden walks Tim, compare AgencyZoom, decision.",
    },

    budget_confirmed: false,
    implementation_timeline: 'ASAP — Apex sunsetting, IdealTraits already canceled',
    deal_value: 4200,
    deal_stage: 'qualifying',
    next_action: 'Build sandbox environment for Farmers Insurance and send to Eden + Tim. Follow up with Eden by EOD tomorrow. Monday check-in call scheduled.',
    next_meeting_date: '2026-06-16T18:45:00.000Z',
    qa_completed: false,
    buyer_intent_validated: false,
    status: 'in_progress',
    created_at: '2026-06-10T00:00:00.000Z',
    completed_at: null,

    // ══════════════════════════════════════════════════════════════
    // MEDDPICC
    // ══════════════════════════════════════════════════════════════
    pain_narrative: "Eden's district is losing both recruiting tools simultaneously. Apex Talent — Farmers' corporate CRM — is being sunset across every location nationwide. They just canceled IdealTraits because 'we were getting like nothing' from Indeed/LinkedIn/ZipRecruiter. Their fallback is KSL, a Utah-only board. The workflow was already broken: review in IdealTraits, log everything into Apex. With ~25 agents to recruit (all 1099 contractors), they need an always-on hiring engine.",
    success_metrics_text: "More applicants from major job boards (Indeed, ZipRecruiter, LinkedIn) vs. KSL-only. Unified workflow. Branded career site. Self-scheduling interviews.",
    decision_criteria: "(1) Feature parity with IdealTraits + Apex in one system. (2) Career site builder. (3) Google Calendar + Microsoft Teams integration. (4) Background check integration (ACE/Accurate). (5) Cost vs. 'free' AgencyZoom.",
    decision_process: "Eden evaluates → walks Tim through sandbox → Trina evaluates AgencyZoom → Tim compares and decides.",
    paper_process: "Likely Tim signs. Small district, no corporate procurement.",
    champion_name: 'Eden Thompson — Office Manager',
    champion_validation_notes: "2 months in, passed P&C exam, actively owns hiring. Said 'this is just a better option.' But junior — defers to Tim on budget.",
    competitive_situation: "AgencyZoom (primary): Insurance sales CRM with candidate tracking as secondary feature. 'Free' via shared login. NOT an Provider — cannot post to job boards or build career sites. Shared login risk flagged.\n\nIdealTraits (displaced): Former posting tool. Canceled — wasn't delivering.\n\nApex Talent (sunsetting): Farmers' internal CRM. Going away for ALL locations. Was 'a note-taking location.'",
    economic_buyer_access: "Tim (DM) — not yet engaged. Eden will present sandbox. Tim has connections to other Utah DMs facing same Apex sunset.",
    roi_summary_text: "Replace 2 tools with 1. Career site included. Expanded reach vs. KSL-only. Multi-district pricing opportunity.",

    // ── Call Sheet ──
    call_sheet_answers: {
      q1: 'Apex Talent sunsetting + canceled IdealTraits + broken 2-system workflow',
      q2: ['Eden Thompson — Office Manager', 'Tim — District Manager', 'Trina — Agent (AgencyZoom evaluator)'],
      q5: 'IdealTraits for sourcing (canceled), Apex Talent for tracking (sunsetting), KSL (local Utah board)',
      q6: ['IdealTraits not delivering applicants', 'Apex is just note-taking', '2-system workflow causing friction'],
      q6b: 'Partially — open to help but not committed',
    },
    call_sheet_checkpoints: { checkpoint1: true },
    call_sheet_checkpoint_reasons: {},
    call_sheet_persona: 'chro',
    call_sheet_cost_of_problem: 'Annual IdealTraits subscription (canceled) + no major board distribution + manual scheduling',
    call_sheet_target_date: 'ASAP — Apex sunsetting, IdealTraits already canceled',

    // ── CS Handoff ──
    handoff_current_hris: '', handoff_calendar_system: 'Google Calendar',
    handoff_sso_provider: '', handoff_sso_required: false, handoff_infosec_review_required: false,
    handoff_current_career_site_url: '', handoff_custom_domain: '', handoff_brand_maturity: 'none',
    handoff_department_count: 1, handoff_location_count: 1,
    handoff_active_hiring_managers: 1, handoff_active_recruiters: 1,
    handoff_active_jobs_count: 1, handoff_candidate_count_estimate: 0,
    handoff_data_migration_notes: 'Minimal — Apex sunsetting, IdealTraits canceled.',
    handoff_job_boards: ['Indeed', 'ZipRecruiter', 'KSL'],
    handoff_hris_integration: '',
    handoff_other_integrations: ['Microsoft Teams (video)', 'ACE/Accurate Background (checks)'],
    handoff_target_go_live_date: '', handoff_launch_type: '',
    handoff_go_live_notes: '',
    handoff_users_to_train: 3, handoff_training_format: '',
    handoff_training_notes: 'Eden tech-savvy (compared TT to Canva). Tim needs exec walkthrough.',
    handoff_primary_contact_email: '', handoff_it_contact_email: '',
    handoff_preferred_comm_channel: '',
    handoff_target_time_to_hire: 30, handoff_target_cost_per_hire: 0,
    handoff_target_adoption_rate: 0, handoff_success_review_date: '',
    handoff_prework_items: ['Send sandbox to Eden + Tim', 'Send insurance case studies', 'Research AgencyZoom gaps', 'Confirm Google Cal + Teams compatibility'],
    handoff_prework_notes: '',
    handoff_gdpr_applicable: false, handoff_data_retention_months: 0,
    handoff_dpa_required: false,
    handoff_compliance_notes: 'P&C license required for agents. Background checks via ACE/Accurate.',

    // ── Deal Intelligence ──
    contract_end_date: '',
    competing_priorities: "AgencyZoom evaluation (Trina leading). Eden waiting for Trina's report.",
    competitors_identified: 'AgencyZoom (free shared login — NOT an Provider, only candidate tracker)',
    competitors_count: 1,
    sentiment_score: 0, sentiment_gap: '',
    existing_tt_customer: false, budget_ballpark_requested: false,
    demo_prep_checklist: {},

    // ── Call Transcript (as Granola Note) ──
    granola_notes: [{
      id: 'gn_farmers_initial',
      title: 'Initial Connect — Farmers Insurance Kaysville',
      date: '2026-06-11T18:45:00.000Z',
      summary: "44-min discovery with Eden Thompson (Office Manager). Key: (1) Apex Talent sunsetting ALL Farmers locations. (2) Just canceled IdealTraits. (3) Only KSL remaining. (4) Broken 2-system workflow. (5) Tim hasn't seen product. (6) Evaluating AgencyZoom (free shared login). (7) Eden very positive on career site, AI, scheduling, messaging. (8) Next: sandbox, follow-up, Monday call.",
      transcript: '',
      url: '',
      attendees: ['Jack Luther', 'Eden Thompson'],
      stage: 'discovery',
      key_quotes: [
        '"We were getting like nothing" — Eden on IdealTraits applicant volume',
        '"Yeah, it\'s going away" — Eden confirming Apex sunsetting for all Farmers',
        '"We just canceled our subscription to that" — Eden on IdealTraits',
        '"I think my boss would like that" — Eden on career site builder',
        '"First interview over Teams recorded and transcript. Yeah, that\'s awesome"',
        '"Oh wow, that\'s awesome" — Eden on direct candidate messaging',
        '"This is just a better option in my opinion" — Eden on TT vs AgencyZoom',
        '"It wouldn\'t be sourcing candidates" — Eden acknowledging AgencyZoom limitation',
        '"We had to play this game where we were having to pause our job postings for a week"',
      ],
      next_steps: 'Build sandbox → send to Eden + Tim. Follow up EOD tomorrow. Monday call 12:45 MT. Send insurance case studies.',
      checkpoint_validated: '1',
      is_manual: false,
    }],

    rep_forecast: 40,
    open_roles_count: 1, lead_source: 'inbound',
    system_count: 3, division_count: 1,
    evaluation_stage: 'exploring',

    // ── Pricing ──
    pricing_region: 'us', pricing_vertical: 'non-staffing',
    pricing_employee_count: 3, pricing_base_price: 0,
    pricing_override: false, pricing_contract_term: 1,
    pricing_discount_pct: 0, pricing_add_ons: [],
    pricing_notes: 'Insurance — 25+ agents are 1099, not employees. Price on 3 FTE users. Multi-district expansion opportunity.',
    pricing_price_cap_pct: undefined,
    pricing_promo_free_months: undefined,
    pricing_promo_label: undefined,

    // ── Objections ──
    objections: [
      {
        id: 'obj_1',
        text: "AgencyZoom would be free because we'd use another agency's login",
        response: "Flagged shared login risk ('if the company catches it, they'll deactivate the account'). Positioned TT as purpose-built for hiring vs. AgencyZoom as sales CRM.",
        status: 'open', raised_by: 'Eden Thompson', raised_date: '2026-06-11', category: 'competition',
      },
      {
        id: 'obj_2',
        text: 'Job boards bury listings after 6 months because insurance roles are always open',
        response: "Explained this is a job board issue (not Provider-specific). Recommended periodic relisting, location variants. TT integrations make refreshes faster.",
        status: 'resolved', raised_by: 'Eden Thompson', raised_date: '2026-06-11', resolved_date: '2026-06-11', category: 'technical',
      },
    ],

    last_call_date: '2026-06-11T18:45:00.000Z',
  };

  const allSessions = [...existing, session];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allSessions));
  return SESSION_ID;
}
