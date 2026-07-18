import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { DEAL_ROOM_SEEDS } from '../src/data/dealRoomSeeds.js';
import { CLOSED_LOST_SEEDS } from '../src/data/closedLostSeeds.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE config in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const SFDC_STAGE_MAP: Record<string, string> = {
  'Qualifying': 'qualifying',
  'Investigating': 'investigating',
  'Evaluating': 'evaluating',
  'Negotiating': 'negotiating',
  'Contracting': 'contracting',
  'Closed Won': 'signing',
  'Closed Lost': 'closed_lost',
  'Disqualified': 'closed_lost',
};

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

async function run() {
  console.log("🔥 Fetching existing sessions...");
  const { data: existing } = await supabase.from('discovery_sessions').select('data');
  const existingCompanies = new Set((existing || []).map(row => (row.data.company_name || '').toLowerCase()));

  const newSessions: any[] = [];

  // Open Deals
  for (const seed of DEAL_ROOM_SEEDS) {
    if (existingCompanies.has(seed.company.toLowerCase())) continue;

    let createdAt: string;
    if (seed.firstMtgDate) {
      createdAt = new Date(seed.firstMtgDate).toISOString();
    } else if (seed.discoDate) {
      createdAt = new Date(seed.discoDate).toISOString();
    } else {
      const closeDate = new Date(seed.closeMonth + '-01');
      closeDate.setDate(closeDate.getDate() - 14);
      createdAt = closeDate.toISOString();
    }

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
      handoff_dpa_required: false, handoff_compliance_notes: '', contract_end_date: '',
      competing_priorities: '', competitors_identified: '', competitors_count: 0, sentiment_score: 0,
      sentiment_gap: '', existing_tt_customer: false, budget_ballpark_requested: false,
      demo_prep_checklist: {}, enabled_playbook_ids: undefined, granola_notes: [], rep_forecast: 50,
      open_roles_count: 0, lead_source: seed.source.toLowerCase() === 'inbound' ? 'inbound' : 'outbound', system_count: 0,
      division_count: 0, evaluation_stage: null, pricing_region: 'us', pricing_vertical: 'non-staffing',
      pricing_employee_count: 0, pricing_base_price: 0, pricing_override: false, pricing_contract_term: 1,
      pricing_discount_pct: 0, pricing_add_ons: [], pricing_notes: '', pricing_price_cap_pct: undefined,
      pricing_promo_free_months: undefined, pricing_promo_label: undefined, objections: []
    };
    newSessions.push(session);
    existingCompanies.add(seed.company.toLowerCase());
  }

  // Closed Lost Deals
  for (const seed of CLOSED_LOST_SEEDS) {
    if (existingCompanies.has(seed.company.toLowerCase())) continue;

    let createdAt: string;
    let completedAt: string;
    try {
      const parts = seed.closeDate.split('/');
      const closeDateStr = parts.length === 3 ? `${parts[2]}-${parts[0].padStart(2,'0')}-${parts[1].padStart(2,'0')}T12:00:00.000Z` : new Date().toISOString();
      const closeDate = new Date(closeDateStr);
      completedAt = closeDate.toISOString();
      closeDate.setDate(closeDate.getDate() - 30);
      createdAt = closeDate.toISOString();
    } catch {
      createdAt = new Date().toISOString();
      completedAt = new Date().toISOString();
    }

    const session = {
      id: `ds_cl_${seed.company.replace(/\W+/g, '_').toLowerCase()}_${Date.now() + newSessions.length}`,
      rep_id: seed.repId,
      company_name: seed.company,
      deal_stage: 'closed_lost',
      deal_value: seed.amount,
      industry: seed.industry.toLowerCase().replace(/[&,]/g, '').replace(/\s+/g, '-'),
      lead_source: seed.source.toLowerCase() === 'inbound' ? 'inbound' : 'outbound',
      status: 'completed',
      created_at: createdAt,
      completed_at: completedAt,
      loss_reason: { primary: seed.lossPrimary, secondary: seed.sfLostReason || seed.sfDqReason, notes: seed.lossNotes, winback_potential: false },
      post_mortem_completed: false,
      // defaults
      company_id: null, persona: null, current_ats: null, company_size: null, use_case: null,
      stakeholders: [], selected_pains: [], roi_inputs: { hiringManagers: 250, totalHires: 400, agencyHires: 50, timeToHire: 45 },
      roi_total: 0, alignment_checks: { urgent_priority: false, resources_insufficient: false, problems_solutions: false, roi_sufficient: false, right_solution: false },
      mutual_commitments: { executive_sponsor: false, dedicated_admin: false, training_completion: false },
      blueprint_approved: false, bap_answers: {}, bap_notes: {}, budget_confirmed: false,
      implementation_timeline: null, next_action: '', next_meeting_date: null, qa_completed: false, buyer_intent_validated: false,
      pain_narrative: '', success_metrics_text: '', decision_criteria: '', decision_process: '',
      paper_process: '', champion_name: '', champion_validation_notes: '', competitive_situation: '',
      economic_buyer_access: '', roi_summary_text: '', call_sheet_answers: {}, call_sheet_checkpoints: {}, call_sheet_checkpoint_reasons: {},
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
      handoff_dpa_required: false, handoff_compliance_notes: '', contract_end_date: '',
      competing_priorities: '', competitors_identified: '', competitors_count: 0, sentiment_score: 0,
      sentiment_gap: '', existing_tt_customer: false, budget_ballpark_requested: false,
      demo_prep_checklist: {}, enabled_playbook_ids: undefined, granola_notes: [], rep_forecast: 50,
      open_roles_count: 0, system_count: 0, division_count: 0, evaluation_stage: null, pricing_region: 'us', pricing_vertical: 'non-staffing',
      pricing_employee_count: 0, pricing_base_price: 0, pricing_override: false, pricing_contract_term: 1,
      pricing_discount_pct: 0, pricing_add_ons: [], pricing_notes: '', pricing_price_cap_pct: undefined,
      pricing_promo_free_months: undefined, pricing_promo_label: undefined, objections: []
    };
    newSessions.push(session);
    existingCompanies.add(seed.company.toLowerCase());
  }

  console.log(`Inserting ${newSessions.length} new sessions into Supabase...`);

  if (newSessions.length > 0) {
    const payload = newSessions.map(s => ({
      id: s.id,
      rep_id: s.rep_id || 'unassigned',
      data: s,
      created_at: s.created_at,
      updated_at: s.completed_at || s.created_at
    }));

    const batchSize = 50;
    for (let i = 0; i < payload.length; i += batchSize) {
      const batch = payload.slice(i, i + batchSize);
      const { error } = await supabase.from('discovery_sessions').upsert(batch);
      if (error) {
        console.error(`Error inserting batch ${i}:`, error);
        process.exit(1);
      }
    }
  }

  console.log("✅ Pipeline data seeded directly into Supabase!");
}

run();
