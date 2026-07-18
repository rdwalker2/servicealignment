// ============================================================
// Deal Room Seeds — Auto-generated from SFDC Open Opps export
// 62 deals across May–Dec 2026 for JL, MA, TH
// ============================================================

// No imports needed — we read/write localStorage directly for reliable bulk seeding

// ── SFDC → Internal Stage Mapping ──

const SFDC_STAGE_MAP: Record<string, string> = {
  'Qualifying':     'qualifying',
  'Investigating':  'investigating',
  'Evaluating':     'evaluating',
  'Negotiating':    'negotiating',
  'Contracting':    'contracting',
  'Signing':        'signing',
  'Closed Won':     'closed_won',
  'Closed Lost':    'closed_lost',
};

// ── Deal Room Seed Records ──

export interface DealRoomSeed {
  repId: string;          // rep-jl | rep-ma | rep-th
  company: string;        // Account Name
  amount: number;         // Deal value ($)
  closeMonth: string;     // Expected close month (YYYY-MM)
  sfdcStage: string;      // SFDC stage name
  source: string;         // Inbound | Outbound
  industry: string;       // SFDC industry
  ats: string;            // Current ATS provider
  prevAts?: string;       // Previous ATS
  discoDate?: string;     // Discovery completed date
  demoDate?: string;      // Demo completed date
  firstMtgDate?: string;  // First meeting date
  oppName?: string;       // SFDC Opportunity Name
}

export const DEAL_ROOM_SEEDS: DealRoomSeed[] = [
  // ════════════════════════════════════════════════════════════════
  // MAY 2026
  // ════════════════════════════════════════════════════════════════

  // MA — May
  { repId: 'rep-ma', company: 'Leader Bank N.A', amount: 14500, closeMonth: '2026-05', sfdcStage: 'Qualifying', source: 'Outbound', industry: 'Banking', ats: 'No ATS', discoDate: '4/16/2026' },
  { repId: 'rep-ma', company: 'Royal Oaks Country Club | Houston, TX', amount: 0, closeMonth: '2026-05', sfdcStage: 'Qualifying', source: 'Outbound', industry: 'Recreational Facilities and Services', ats: 'Jotform' },
  { repId: 'rep-ma', company: 'Brookfield Country Club', amount: 0, closeMonth: '2026-05', sfdcStage: 'Qualifying', source: 'Outbound', industry: 'Hospitality', ats: 'No ATS' },

  // ════════════════════════════════════════════════════════════════
  // JUNE 2026
  // ════════════════════════════════════════════════════════════════

  // JL — June
  { repId: 'rep-jl', company: 'Acquire2Win', amount: 4200, closeMonth: '2026-06', sfdcStage: 'Evaluating', source: 'Inbound', industry: 'Business Services', ats: 'No ATS', firstMtgDate: '5/29/2026', discoDate: '5/29/2026' },
  { repId: 'rep-jl', company: 'Dandelion Chocolate', amount: 10255, closeMonth: '2026-06', sfdcStage: 'Investigating', source: 'Inbound', industry: 'Food and Beverages', ats: 'JazzHR', firstMtgDate: '5/11/2026', discoDate: '5/12/2026' },
  { repId: 'rep-jl', company: 'Economic Hardship Reporting Project', amount: 3000, closeMonth: '2026-06', sfdcStage: 'Contracting', source: 'Inbound', industry: 'Non-profit Organization Management', ats: 'No ATS', firstMtgDate: '6/9/2026', discoDate: '6/9/2026' },
  { repId: 'rep-jl', company: 'PR Consulting', amount: 6240, closeMonth: '2026-06', sfdcStage: 'Qualifying', source: 'Inbound', industry: 'Management Consulting', ats: 'No ATS', discoDate: '3/6/2026' },
  { repId: 'rep-jl', company: 'TigerGraph', amount: 0, closeMonth: '2026-09', sfdcStage: 'Qualifying', source: 'Outbound', industry: 'Computer Software', ats: 'Greenhouse' },

  // MA — June
  { repId: 'rep-ma', company: 'Compliance Management International', amount: 10000, closeMonth: '2026-06', sfdcStage: 'Evaluating', source: 'Inbound', industry: 'Environmental Services', ats: 'Greenhouse', discoDate: '3/13/2026', demoDate: '3/19/2026' },

  // TH — June
  { repId: 'rep-th', company: 'Modern Art Museum of Fort Worth', amount: 0, closeMonth: '2026-06', sfdcStage: 'Qualifying', source: 'Outbound', industry: 'Museums and Institutions', ats: 'No ATS' },

  // ════════════════════════════════════════════════════════════════
  // JULY 2026
  // ════════════════════════════════════════════════════════════════

  // JL — July
  { repId: 'rep-jl', company: 'Apex Building Group', amount: 11000, closeMonth: '2026-07', sfdcStage: 'Evaluating', source: 'Inbound', industry: 'Commercial Real Estate', ats: 'No ATS', discoDate: '6/17/2026', demoDate: '6/15/2026' },
  { repId: 'rep-jl', company: 'Rockwell Health Center', amount: 12100, closeMonth: '2026-07', sfdcStage: 'Evaluating', source: 'Inbound', industry: 'Hospital and Health Care', ats: 'No ATS', discoDate: '6/15/2026' },
  { repId: 'rep-jl', company: 'Rx Diet', amount: 0, closeMonth: '2026-07', sfdcStage: 'Investigating', source: 'Inbound', industry: 'Hospital and Health Care', ats: 'LinkedIn ATS', discoDate: '6/15/2026' },
  { repId: 'rep-jl', company: 'Scout Clinical', amount: 11500, closeMonth: '2026-07', sfdcStage: 'Evaluating', source: 'Inbound', industry: 'Research', ats: 'JazzHR', discoDate: '5/28/2026', demoDate: '5/28/2026' },
  { repId: 'rep-jl', company: 'Station A', amount: 0, closeMonth: '2026-07', sfdcStage: 'Investigating', source: 'Inbound', industry: 'Civil Engineering', ats: 'Workable', discoDate: '6/5/2026' },

  // MA — July
  { repId: 'rep-ma', company: 'Emergence AI', amount: 10500, closeMonth: '2026-07', sfdcStage: 'Evaluating', source: 'Inbound', industry: 'Information Technology & Services', ats: 'Paylocity', discoDate: '6/3/2026', firstMtgDate: '5/27/2026' },
  { repId: 'rep-ma', company: 'Engram-Lab', amount: 4125, closeMonth: '2026-07', sfdcStage: 'Qualifying', source: 'Inbound', industry: 'Business Services', ats: 'No ATS' },
  { repId: 'rep-ma', company: 'Grow Law', amount: 0, closeMonth: '2026-07', sfdcStage: 'Investigating', source: 'Inbound', industry: 'Marketing and Advertising', ats: 'No ATS' },
  { repId: 'rep-ma', company: 'Oak Hill Country Club', amount: 0, closeMonth: '2026-07', sfdcStage: 'Qualifying', source: 'Outbound', industry: 'Hospitality', ats: 'No ATS' },
  { repId: 'rep-ma', company: 'PromoPSG', amount: 2000, closeMonth: '2026-07', sfdcStage: 'Investigating', source: 'Inbound', industry: 'Marketing and Advertising', ats: 'No ATS', discoDate: '6/9/2026' },
  { repId: 'rep-ma', company: 'Qual Chem', amount: 0, closeMonth: '2026-07', sfdcStage: 'Qualifying', source: 'Inbound', industry: 'Facilities Services', ats: 'No ATS' },
  { repId: 'rep-ma', company: 'SQP Construction Group', amount: 0, closeMonth: '2026-07', sfdcStage: 'Investigating', source: 'Outbound', industry: 'Commercial and Residential Construction', ats: 'No ATS', discoDate: '6/15/2026' },

  // TH — July
  { repId: 'rep-th', company: 'Formic', amount: 0, closeMonth: '2026-07', sfdcStage: 'Investigating', source: 'Outbound', industry: 'Computer Software', ats: 'Greenhouse', firstMtgDate: '6/4/2026', discoDate: '6/18/2026' },
  { repId: 'rep-th', company: 'Infoworld', amount: 0, closeMonth: '2026-07', sfdcStage: 'Qualifying', source: 'Inbound', industry: 'Information Technology and Services', ats: 'No ATS' },
  { repId: 'rep-th', company: 'Newport Industries Inc', amount: 12600, closeMonth: '2026-07', sfdcStage: 'Investigating', source: 'Inbound', industry: 'Electrical/Electronic Manufacturing', ats: 'No ATS', discoDate: '5/13/2026', firstMtgDate: '5/13/2026' },
  { repId: 'rep-th', company: 'Nicholas and Company Inc. Foodservice', amount: 18000, closeMonth: '2026-07', sfdcStage: 'Negotiating', source: 'Outbound', industry: 'Business Services', ats: 'ADP' },
  { repId: 'rep-th', company: 'Oxford Companies', amount: 0, closeMonth: '2026-07', sfdcStage: 'Qualifying', source: 'Outbound', industry: 'Real Estate', ats: 'Jobvite' },
  { repId: 'rep-th', company: 'Terraformation', amount: 8000, closeMonth: '2026-07', sfdcStage: 'Investigating', source: 'Inbound', industry: 'Environmental Services', ats: 'Lever', discoDate: '5/13/2026', firstMtgDate: '5/8/2026' },
  { repId: 'rep-th', company: 'The NOW', amount: 10500, closeMonth: '2026-07', sfdcStage: 'Evaluating', source: 'Outbound', industry: 'Retail', ats: 'CareerPlug', discoDate: '5/13/2026', demoDate: '5/13/2026', firstMtgDate: '5/13/2026' },
  { repId: 'rep-th', company: 'Thelaunchbox', amount: 0, closeMonth: '2026-07', sfdcStage: 'Investigating', source: 'Inbound', industry: 'E-Learning', ats: 'No ATS', discoDate: '6/15/2026' },
  { repId: 'rep-th', company: 'UTTR', amount: 0, closeMonth: '2026-07', sfdcStage: 'Qualifying', source: 'Outbound', industry: 'Marketing and Advertising', ats: 'CATS', discoDate: '2/16/2026' },

  // ════════════════════════════════════════════════════════════════
  // AUGUST 2026
  // ════════════════════════════════════════════════════════════════

  // JL — August
  { repId: 'rep-jl', company: 'Oregon Coast Community Action', amount: 0, closeMonth: '2026-08', sfdcStage: 'Qualifying', source: 'Outbound', industry: 'Non-profit Organization Management', ats: 'No ATS' },

  // MA — August
  { repId: 'rep-ma', company: 'Employee Navigator', amount: 15000, closeMonth: '2026-08', sfdcStage: 'Investigating', source: 'Outbound', industry: 'Internet', ats: 'Greenhouse' },
  { repId: 'rep-ma', company: 'MSI Viking', amount: 15000, closeMonth: '2026-08', sfdcStage: 'Negotiating', source: 'Inbound', industry: 'Machinery', ats: 'Workable', discoDate: '6/4/2026' },
  { repId: 'rep-ma', company: 'Sequencing', amount: 0, closeMonth: '2026-08', sfdcStage: 'Qualifying', source: 'Inbound', industry: 'Research', ats: 'No ATS' },
  { repId: 'rep-ma', company: 'Sygaldry', amount: 0, closeMonth: '2026-08', sfdcStage: 'Investigating', source: 'Inbound', industry: 'Computer Software', ats: 'No ATS' },
  { repId: 'rep-ma', company: 'InfluxData', amount: 10500, closeMonth: '2026-07', sfdcStage: 'Qualifying', source: 'Inbound', industry: 'Computer Software', ats: 'Ashby', discoDate: '4/14/2026' },

  // TH — August
  { repId: 'rep-th', company: 'Crumdale Specialty', amount: 0, closeMonth: '2026-08', sfdcStage: 'Investigating', source: 'Outbound', industry: 'Food and Beverages', ats: 'No ATS', discoDate: '6/18/2026' },
  { repId: 'rep-th', company: 'Deeku Healthcare', amount: 4125, closeMonth: '2026-08', sfdcStage: 'Investigating', source: 'Inbound', industry: 'Health, Wellness and Fitness', ats: 'No ATS' },
  { repId: 'rep-th', company: 'Doyles Sheehan', amount: 0, closeMonth: '2026-08', sfdcStage: 'Investigating', source: 'Outbound', industry: 'Law Practice', ats: 'No ATS', discoDate: '6/18/2026' },
  { repId: 'rep-th', company: 'Encompass Onsite Solutions', amount: 0, closeMonth: '2026-08', sfdcStage: 'Qualifying', source: 'Outbound', industry: 'Environmental Services', ats: 'No ATS' },
  { repId: 'rep-th', company: 'Ingenuity Prep Public Charter School', amount: 0, closeMonth: '2026-08', sfdcStage: 'Qualifying', source: 'Outbound', industry: 'Education', ats: 'Greenhouse' },
  { repId: 'rep-th', company: 'Jambalaya Group', amount: 0, closeMonth: '2026-08', sfdcStage: 'Qualifying', source: 'Inbound', industry: 'Business Services', ats: 'Hireology' },
  { repId: 'rep-th', company: 'Qualio', amount: 9000, closeMonth: '2026-08', sfdcStage: 'Investigating', source: 'Outbound', industry: 'Computer Software', ats: 'Greenhouse' },
  { repId: 'rep-th', company: 'Sigma Phi Epsilon (Official)', amount: 5000, closeMonth: '2026-08', sfdcStage: 'Evaluating', source: 'Inbound', industry: 'Non-profit Organization Management', ats: 'No ATS' },
  { repId: 'rep-th', company: 'Vestia Advisors', amount: 4125, closeMonth: '2026-08', sfdcStage: 'Investigating', source: 'Outbound', industry: 'Financial Services', ats: 'No ATS' },

  // ════════════════════════════════════════════════════════════════
  // SEPTEMBER 2026
  // ════════════════════════════════════════════════════════════════

  // MA — September
  { repId: 'rep-ma', company: 'Southern Indian Health Council Inc.', amount: 0, closeMonth: '2026-09', sfdcStage: 'Qualifying', source: 'Outbound', industry: 'Hospital and Health Care', ats: 'No ATS' },
  { repId: 'rep-ma', company: 'The Lester Group', amount: 0, closeMonth: '2026-09', sfdcStage: 'Qualifying', source: 'Outbound', industry: 'Business Services', ats: 'No ATS' },
  { repId: 'rep-ma', company: 'United Way of New York City', amount: 0, closeMonth: '2026-09', sfdcStage: 'Qualifying', source: 'Outbound', industry: 'Non-profit Organization Management', ats: 'No ATS' },

  // JL — September
  { repId: 'rep-jl', company: 'The Fresh Air Fund', amount: 8000, closeMonth: '2026-09', sfdcStage: 'Qualifying', source: 'Outbound', industry: 'Hospitality', ats: 'JazzHR', prevAts: 'ADP', discoDate: '2/12/2026' },

  // TH — September
  { repId: 'rep-th', company: 'Blue Hill Farm', amount: 0, closeMonth: '2026-09', sfdcStage: 'Qualifying', source: 'Outbound', industry: 'Hospitality', ats: 'No ATS' },
  { repId: 'rep-th', company: 'Garp', amount: 8000, closeMonth: '2026-09', sfdcStage: 'Investigating', source: 'Inbound', industry: 'Financial Services', ats: 'No ATS', demoDate: '2/13/2026' },
  { repId: 'rep-th', company: 'NuHarbor Security', amount: 0, closeMonth: '2026-09', sfdcStage: 'Qualifying', source: 'Outbound', industry: 'Business Services', ats: 'Greenhouse' },

  // ════════════════════════════════════════════════════════════════
  // OCTOBER 2026
  // ════════════════════════════════════════════════════════════════

  // JL — September/October
  { repId: 'rep-jl', company: 'Aspen Contracting Inc', amount: 0, closeMonth: '2026-09', sfdcStage: 'Qualifying', source: 'Outbound', industry: 'Construction', ats: 'Pinpoint' },
  { repId: 'rep-jl', company: 'Serene Health', amount: 0, closeMonth: '2026-10', sfdcStage: 'Qualifying', source: 'Outbound', industry: 'Hospital and Health Care', ats: 'No ATS' },

  // TH — October
  { repId: 'rep-th', company: 'PulseLearning Global', amount: 0, closeMonth: '2026-10', sfdcStage: 'Qualifying', source: 'Outbound', industry: 'E-Learning', ats: 'No ATS' },

  // ════════════════════════════════════════════════════════════════
  // NOVEMBER 2026
  // ════════════════════════════════════════════════════════════════

  // TH — November
  { repId: 'rep-th', company: 'Patel Greene & Associates LLC', amount: 0, closeMonth: '2026-11', sfdcStage: 'Investigating', source: 'Inbound', industry: 'Law Practice', ats: 'No ATS', discoDate: '6/9/2026' },

  // ════════════════════════════════════════════════════════════════
  // DECEMBER 2026
  // ════════════════════════════════════════════════════════════════

  // JL — December
  { repId: 'rep-jl', company: 'Seed Health', amount: 0, closeMonth: '2026-12', sfdcStage: 'Investigating', source: 'Inbound', industry: 'Biotechnology', ats: 'Greenhouse', demoDate: '3/12/2026' },

  // MA — December
  { repId: 'rep-ma', company: 'Ntirety', amount: 13000, closeMonth: '2026-12', sfdcStage: 'Contracting', source: 'Inbound', industry: 'Information Technology and Services', ats: 'Greenhouse' },

  // TH — December
  { repId: 'rep-th', company: 'Allegis Corporation', amount: 0, closeMonth: '2026-12', sfdcStage: 'Qualifying', source: 'Outbound', industry: 'Staffing and Recruiting', ats: 'No ATS' },
  { repId: 'rep-th', company: 'Counterpart Insurance', amount: 0, closeMonth: '2026-12', sfdcStage: 'Investigating', source: 'Inbound', industry: 'Insurance', ats: 'No ATS', discoDate: '6/9/2026' },
  { repId: 'rep-th', company: 'Fluxx', amount: 0, closeMonth: '2026-12', sfdcStage: 'Investigating', source: 'Outbound', industry: 'Computer Software', ats: 'No ATS', demoDate: '4/23/2026' },

  // JL — July (Qualifying)
  { repId: 'rep-jl', company: 'HUM', amount: 0, closeMonth: '2026-07', sfdcStage: 'Qualifying', source: 'Outbound', industry: 'Individual and Family Services', ats: 'No ATS' },

  // TH — December (Qualifying)
  { repId: 'rep-th', company: 'Park Printing House', amount: 0, closeMonth: '2026-12', sfdcStage: 'Qualifying', source: 'Outbound', industry: 'Printing', ats: 'No ATS', discoDate: '4/23/2026' },
];

// ── Normalize industry → persona hint ──

function industryToPersona(industry: string): string | null {
  const lower = industry.toLowerCase();
  if (lower.includes('hospital') || lower.includes('health') || lower.includes('wellness')) return 'chro';
  if (lower.includes('staffing') || lower.includes('recruit')) return 'vp-ta';
  if (lower.includes('software') || lower.includes('tech') || lower.includes('internet')) return 'vp-ta';
  if (lower.includes('non-profit') || lower.includes('nonprofit')) return 'chro';
  if (lower.includes('construction') || lower.includes('manufacturing')) return 'chro';
  if (lower.includes('food') || lower.includes('hospitality') || lower.includes('retail')) return 'chro';
  if (lower.includes('financial') || lower.includes('insurance') || lower.includes('law')) return 'vp-ta';
  return null;
}

// ── Normalize ATS name ──

function normalizeAts(ats: string): string | null {
  if (!ats || ats === 'No ATS' || ats === '') return null;
  const lower = ats.toLowerCase();
  if (lower.includes('greenhouse')) return 'greenhouse';
  if (lower.includes('lever')) return 'lever';
  if (lower.includes('workday')) return 'workday';
  if (lower.includes('icims')) return 'icims';
  if (lower.includes('adp')) return 'adp';
  if (lower.includes('paylocity')) return 'paylocity';
  if (lower.includes('bamboo')) return 'bamboohr';
  if (lower.includes('jazz')) return 'jazzhr';
  if (lower.includes('jobvite')) return 'jobvite';
  if (lower.includes('workable')) return 'workable';
  if (lower.includes('ashby')) return 'ashby';
  if (lower.includes('paycor')) return 'paycor';
  return ats.toLowerCase().replace(/\s+/g, '-');
}

// ── Seed Function ──

const STORAGE_KEY = 'scc_discovery_sessions_v3';

/**
 * Seeds deal rooms into localStorage.
 * Called from ensureSeedData() which handles version gating.
 * Uses a single bulk write for reliability.
 * Returns the number of rooms created.
 */
export function seedDealRooms(): number {

  // Read existing sessions directly from localStorage
  let existing: any[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) existing = JSON.parse(raw);
  } catch { /* empty */ }

  const existingCompanies = new Set(existing.map((s: any) => (s.company_name || '').toLowerCase()));

  const newSessions: any[] = [];

  for (const seed of DEAL_ROOM_SEEDS) {
    // Check if a session already exists for this company
    const existingIdx = existing.findIndex((s: any) => (s.company_name || '').toLowerCase() === seed.company.toLowerCase());
    
    // Build milestones for the Calendar view
    const milestones: any = {};
    if (seed.firstMtgDate || seed.discoDate) {
      const setDate = new Date(seed.firstMtgDate || seed.discoDate!);
      setDate.setDate(setDate.getDate() - 3);
      milestones.discovery_set = {
        date: setDate.toISOString(),
        scheduled_date: new Date(seed.discoDate || seed.firstMtgDate!).toISOString(),
        attendees: [],
      };
    }
    if (seed.discoDate) {
      milestones.discovery_held = {
        date: new Date(seed.discoDate).toISOString(),
        attendees: [],
      };
    }
    if (seed.demoDate) {
      milestones.demo_held = {
        date: new Date(seed.demoDate).toISOString(),
        attendees: [],
      };
    }

    if (existingIdx >= 0) {
      // Always patch milestones from seed data (ensures calendar is populated)
      if (Object.keys(milestones).length > 0) {
        existing[existingIdx].milestones = { ...existing[existingIdx].milestones, ...milestones };
      }
      continue;
    }

    // Compute created_at from SFDC dates
    let createdAt: string;
    if (seed.firstMtgDate) {
      createdAt = new Date(seed.firstMtgDate).toISOString();
    } else if (seed.discoDate) {
      createdAt = new Date(seed.discoDate).toISOString();
    } else {
      createdAt = new Date().toISOString();
    }

    // Build BAP answers based on progress
    const bapAnswers: Record<string, string> = {};
    if (seed.demoDate) {
      Object.assign(bapAnswers, { q1: 'yes', q2: 'yes', q3: 'maybe', q5: 'yes', q6: 'maybe' });
    } else if (seed.discoDate) {
      Object.assign(bapAnswers, { q1: 'yes', q2: 'maybe' });
    }

    const session = {
      id: `ds_sfdc_${seed.company.replace(/\W+/g, '_').toLowerCase()}_${Date.now() + newSessions.length}`,
      rep_id: seed.repId,
      company_name: seed.company,
      company_id: null,
      persona: industryToPersona(seed.industry),
      current_ats: normalizeAts(seed.ats),
      industry: seed.industry.toLowerCase().replace(/[&,]/g, '').replace(/\s+/g, '-'),
      company_size: null,
      use_case: null,
      stakeholders: [],
      selected_pains: [],
      roi_inputs: { hiringManagers: 250, totalHires: 400, agencyHires: 50, timeToHire: 45 },
      roi_total: 0,
      alignment_checks: { urgent_priority: false, resources_insufficient: false, problems_solutions: false, roi_sufficient: false, right_solution: false },
      mutual_commitments: { executive_sponsor: false, dedicated_admin: false, training_completion: false },
      blueprint_approved: false,
      bap_answers: bapAnswers,
      bap_notes: {},
      milestones: milestones,
      budget_confirmed: false,
      implementation_timeline: (() => {
        const [y, m] = seed.closeMonth.split('-');
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return `${months[parseInt(m, 10) - 1]} 15, ${y}`;
      })(),
      deal_value: seed.amount,
      deal_stage: SFDC_STAGE_MAP[seed.sfdcStage] || 'qualifying',
      next_action: '',
      next_meeting_date: null,
      qa_completed: false,
      buyer_intent_validated: false,
      status: 'in_progress',
      created_at: createdAt,
      completed_at: null,
      pain_narrative: '', success_metrics_text: '', decision_criteria: '', decision_process: '',
      paper_process: '', champion_name: '', champion_validation_notes: '', competitive_situation: '',
      economic_buyer_access: '', roi_summary_text: '',
      call_sheet_answers: {}, call_sheet_checkpoints: {}, call_sheet_checkpoint_reasons: {},
      call_sheet_persona: null, call_sheet_cost_of_problem: '', call_sheet_target_date: '',
      handoff_current_hris: '', handoff_calendar_system: '', handoff_sso_provider: '',
      handoff_sso_required: false, handoff_infosec_review_required: false,
      handoff_current_career_site_url: '', handoff_custom_domain: '', handoff_brand_maturity: '',
      handoff_department_count: 0, handoff_location_count: 0, handoff_active_hiring_managers: 0,
      handoff_active_recruiters: 0, handoff_active_jobs_count: 0, handoff_candidate_count_estimate: 0,
      handoff_data_migration_notes: '', handoff_job_boards: [], handoff_hris_integration: '',
      handoff_other_integrations: [], handoff_target_go_live_date: '', handoff_launch_type: '',
      handoff_go_live_notes: '', handoff_users_to_train: 0, handoff_training_format: '',
      handoff_training_notes: '', handoff_primary_contact_email: '', handoff_it_contact_email: '',
      handoff_preferred_comm_channel: '', handoff_target_time_to_hire: 0, handoff_target_cost_per_hire: 0,
      handoff_target_adoption_rate: 0, handoff_success_review_date: '', handoff_prework_items: [],
      handoff_prework_notes: '', handoff_gdpr_applicable: false, handoff_data_retention_months: 0,
      handoff_dpa_required: false, handoff_compliance_notes: '',
      contract_end_date: '', competing_priorities: '', competitors_identified: '',
      competitors_count: 0, sentiment_score: 0, sentiment_gap: '',
      existing_tt_customer: false, budget_ballpark_requested: false,
      demo_prep_checklist: {}, enabled_playbook_ids: undefined,
      granola_notes: [], rep_forecast: 50,
      open_roles_count: 0, lead_source: seed.source.toLowerCase(),
      system_count: 0, division_count: 0, evaluation_stage: null,
      pricing_region: 'us', pricing_vertical: 'non-staffing', pricing_employee_count: 0,
      pricing_base_price: 0, pricing_override: false, pricing_contract_term: 1,
      pricing_discount_pct: 0, pricing_add_ons: [], pricing_notes: '',
      pricing_price_cap_pct: undefined, pricing_promo_free_months: undefined,
      pricing_promo_label: undefined,
      objections: [],
    };

    newSessions.push(session);
  }

  // Bulk write all sessions at once
  const allSessions = [...existing, ...newSessions];
  const withMilestones = allSessions.filter((s: any) => s.milestones && Object.keys(s.milestones).length > 0);
  console.log(`[seedDealRooms] ${newSessions.length} new, ${existing.length} existing, ${withMilestones.length} with milestones`);
  if (withMilestones.length > 0) {
    console.log('[seedDealRooms] sample milestone:', withMilestones[0].company_name, JSON.stringify(withMilestones[0].milestones));
  }
  const jsonStr = JSON.stringify(allSessions);
  console.log(`[seedDealRooms] JSON string length: ${jsonStr.length}, contains "discovery_held": ${jsonStr.includes('discovery_held')}`);
  try {
    localStorage.setItem(STORAGE_KEY, jsonStr);
  } catch (e) {
    console.error('[seedDealRooms] localStorage.setItem FAILED:', e);
  }
  // Verify read-back
  const readBack = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const verifyMs = readBack.filter((s: any) => s.milestones && Object.keys(s.milestones).length > 0);
  console.log(`[seedDealRooms] VERIFY read-back: ${readBack.length} total, ${verifyMs.length} with milestones`);

  return newSessions.length;
}

