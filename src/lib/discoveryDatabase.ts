// ============================================================
// Discovery Room + Buyer's Action Plan — Unified Data Layer
// Two sides of the same experience, one shared data store
// ============================================================

import { saveWeeklyActual, getWeeklyActual } from './database';
import { getCurrentWeekMonday } from './calendar';
import { useActualStore } from './stores/actualStore';
import { type TranscriptAnalysis } from './transcriptAnalysis';
import { EMPTY_METRIC_ROW, type MetricKey } from '../types';
import { TT_PAINS } from '../data/painData';

// ── Types ──

export interface ROIInputs {
  squareFootage: number;
  // Assumptions
  emergency_repair_premium?: number;
  liability_risk_cost?: number;
  inventory_value_at_risk?: number;
  energy_waste?: number;
}

export interface AlignmentChecks {
  urgent_priority: boolean;        // "Are we still aligned this is an urgent priority?"
  resources_insufficient: boolean; // "Are we aligned your existing resources are not sufficient?"
  problems_solutions: boolean;     // "Are we aligned on the problems to be solved & how we solve them?"
  roi_sufficient: boolean;         // "Aligned on outcomes & is the ROI sufficient?"
  right_solution: boolean;         // "With alignment on all of that… are we the right solution?"
}

export type BAPAnswer = string | null;

/** The 11 BAP questions mapped to 3 checkpoints */
export const BAP_QUESTIONS = [
  // Checkpoint 1: Do They Need to Act?
  { id: 'q1', checkpoint: 1 as const, title: 'The Core Problem', question: 'What is the exact problem they are trying to solve?', autoKey: 'pains' as const },
  { id: 'q2', checkpoint: 1 as const, title: 'Stakeholder Map', question: 'Who actually owns this problem and makes the decision?', autoKey: 'persona' as const },
  { id: 'q3', checkpoint: 1 as const, title: 'Cost of Indecision', question: 'What happens if they do nothing?', autoKey: 'roi' as const },
  { id: 'q4', checkpoint: 1 as const, title: 'Priority Level', question: 'Is fixing this a top priority for them right now?', autoKey: null },
  // Checkpoint 2: Do They Need Outside Help?
  { id: 'q5', checkpoint: 2 as const, title: 'Current Approach', question: 'What solutions have they tried so far to address this issue?', autoKey: 'diagnosis_approach' as const },
  { id: 'q6', checkpoint: 2 as const, title: 'Capability Gap', question: 'Why have their current efforts failed to fully resolve the problem?', autoKey: 'diagnosis_root_cause' as const },
  { id: 'q7', checkpoint: 2 as const, title: 'Need for External Help', question: 'Have they acknowledged they cannot solve this internally and need outside expertise?', autoKey: 'resources' as const },
  { id: 'q8', checkpoint: 2 as const, title: 'Readiness', question: 'Are they actually capable of implementing a solution now (budget, timeline, resources)?', autoKey: null },
  // Checkpoint 3: Best Solution & Path Forward
  { id: 'q9', checkpoint: 3 as const, title: 'Proven Results', question: 'Have we proven we can solve this specific problem?', autoKey: 'social_proof' as const },
  { id: 'q10', checkpoint: 3 as const, title: 'Solution Map', question: 'Is it completely clear how our product fixes their problem?', autoKey: 'strategic' as const },
  { id: 'q11', checkpoint: 3 as const, title: 'Success Metrics', question: 'How will they measure if this was a success?', autoKey: 'value' as const },
  { id: 'q12', checkpoint: 3 as const, title: 'Trial Close', question: 'Are they confident this solution is the right fit (8+ out of 10)?', autoKey: 'right_solution' as const },
] as const;

export const STAKEHOLDER_ROLES = [
  'Project Lead',
  'Finance / CFO',
  'IT Approver',
  'Legal & Procurement',
  'Champion',
  'Economic Buyer',
] as const;

export interface Stakeholder {
  id: string;
  role: string;
  name: string;
  title: string;
  persona_id?: string;
  email?: string;
  sf_contact_id?: string;
  salesloft_id?: number;
  in_active_cadence?: boolean;
  cadence_name?: string;
}

export type MeetingType = 'discovery' | 'deep_dive' | 'demo' | 'stakeholder_intro' | 'follow_up' | 'proposal_review' | 'negotiation' | 'other';

export const MEETING_TYPE_OPTIONS: { value: MeetingType; label: string; emoji: string }[] = [
  { value: 'discovery', label: 'Discovery', emoji: '🔍' },
  { value: 'deep_dive', label: 'Deep Dive', emoji: '🔬' },
  { value: 'demo', label: 'Demo', emoji: '🎯' },
  { value: 'stakeholder_intro', label: 'Stakeholder Intro', emoji: '🤝' },
  { value: 'follow_up', label: 'Follow-up', emoji: '📞' },
  { value: 'proposal_review', label: 'Proposal Review', emoji: '📄' },
  { value: 'negotiation', label: 'Negotiation', emoji: '⚖️' },
  { value: 'other', label: 'Other', emoji: '📋' },
];

export interface CustomMeeting {
  id: string;
  title: string;
  type: MeetingType;
  date: string;
  attendees: string[];
  note?: string;
}

export interface MAPMilestone {
  id: string;
  label: string;
  owner: string;
  dueDate: string;
  done: boolean;
}

export interface PricingAddOn {
  id: string;
  name: string;
  price: number;
  included: boolean;
  waived?: boolean;  // If true, show as 'Included' at $0 instead of the price
}

export type PricingSetupType = 'single' | 'divisions' | 'group';
export type PricingPresentationStyle = 'single' | 'options';

export interface PricingPackage {
  id: string;
  name: string;        // e.g. "Good", "Better", "Best" or "Core", "Growth", "Enterprise"
  description: string; // e.g. "Everything you need to start"
  addon_ids: string[]; // which addons are included in this package
}

export interface PricingDivision {
  id: string;
  label: string;        // e.g. "Corporate HQ", "West Region"
  employeeCount: number; // FTE for this division
  price: number;         // Annual price looked up from rate card
}

export interface GranolaNote {
  id: string;
  title: string;
  date: string;
  summary: string;
  transcript: string;
  url: string;
  attendees: string[];
  // ── Extended fields (from CallNote consolidation) ──
  stage?: string;                // D1/D2/D3/D4 stage when call happened
  key_quotes?: string[];         // Verbatim prospect quotes captured during this meeting
  next_steps?: string;           // What was agreed as the next step
  checkpoint_validated?: string;  // Which checkpoint was validated on this call (1, 2, 3)
  is_manual?: boolean;           // true = rep-entered manually, false/undefined = Granola-synced
  transcript_analysis?: TranscriptAnalysis; // Insights extracted from full raw transcript
  meeting_id?: string;           // Optional link to a PipelineCalendar Meeting ID
}

export type StakeholderAlignment = 'champion' | 'supporter' | 'neutral' | 'skeptic' | 'blocker';

export interface StakeholderSentiment {
  alignment: StakeholderAlignment;
  notes: string;
  last_updated?: string;
}

export interface DealObjection {
  id: string;
  text: string;               // What the prospect said
  response: string;            // How the rep handled it
  status: 'open' | 'resolved' | 'deferred';
  raised_by?: string;          // Stakeholder name
  raised_date?: string;        // When it was raised
  resolved_date?: string;      // When it was resolved
  category?: 'price' | 'timing' | 'competition' | 'internal' | 'technical' | 'change-mgmt' | 'other';
}

// CallNote is consolidated into GranolaNote above (extended with stage, key_quotes, etc.)
// This type alias is kept for backward compatibility in component imports.
export type CallNote = GranolaNote;

export interface DemoReaction {
  positive_reactions: string[];   // Features/moments they loved
  concerns: string[];             // Things they pushed back on
  questions_asked: string[];      // Questions prospect asked during demo  
  aha_moment?: string;            // The "wow" moment
  overall_notes?: string;         // General demo feedback
}

export interface LossReason {
  primary: 'competitor' | 'no-decision' | 'budget' | 'timing' | 'champion-left' | 'internal-solution' | 'other';
  secondary?: string;             // Free text detail
  competitor_won?: string;        // Which competitor won (if applicable)
  notes: string;                  // What we learned
  winback_potential: boolean;     // Is there a path back?
  winback_date?: string;          // When to re-engage
}

export interface CheckpointEvidence {
  validated: boolean;
  validated_date?: string;        // When it was confirmed
  evidence: string;               // What the prospect said/did that confirmed it
  validated_by?: string;          // Which stakeholder confirmed
}

export interface MutualCommitments {
  executive_sponsor: boolean;
  dedicated_admin: boolean;
  training_completion: boolean;
}

export interface DiscoverySession {
  id: string;
  rep_id: string | null;
  company_name: string;
  company_id: string | null;
  sf_opportunity_id?: string;          // Salesforce Opportunity ID for direct linking
  persona: string | null;              // Selected persona tab
  membrane_type: string | null;        // Replaces current_ats
  industry: string | null;             // Prospect's industry vertical
  building_use_case: string | null;    // Building Use Case
  roof_square_footage?: number;        // Total roof size
  roof_health_score?: number;          // Property Risk Assessment Score
  roof_signals?: any[];                // Weather/Permit Signals
  stakeholders?: Stakeholder[];        // Mapped stakeholders for the deal
  selected_pains: string[];
  roi_inputs: ROIInputs;
  roi_total: number;
  // ── Final Proposal & Alignment ──
  blueprint_approved: boolean;
  alignment_checks: AlignmentChecks;
  mutual_commitments: MutualCommitments;
  bap_answers: Record<string, BAPAnswer>;  // Manual BAP overrides (q4, q5, q6, q7, q8, q9)
  bap_notes: Record<string, string>;       // Free-text notes for Gap Test questions (q5, q6, q7)
  custom_bap_questions?: {                 // Added questions from the Question Library
    d1: string[];
    d2: string[];
    d3: string[];
  };
  overridden_pillars?: string[];           // Manual DemoArea overrides for FeatureWalkthrough
  linked_playbooks?: Record<string, string[]>;  // Pillar ID → linked playbook IDs
  roi_enabled_categories?: Record<string, boolean>; // Toggle ROI value categories on/off
  roi_assumptions?: Record<string, number>;  // Custom ROI assumptions (seat cost, agency fee, etc.)
  coi_config?: {                              // Cost of Indecision config (rep → prospect)
    enabled: boolean;                         // Show CoI section in prospect room?
    monthsSinceDiscussed: number;
  };
  room_enable_kill_sheet?: boolean;        // Prospect-facing: Turn on competitor comparison
  room_enable_map?: boolean;               // Prospect-facing: Turn on Mutual Action Plan timeline
  room_roi_cost_per_hire?: number;         // Prospect-facing: ROI Custom Variable
  room_roi_time_to_fill?: number;          // Prospect-facing: ROI Custom Variable
  room_roi_open_reqs?: number;             // Prospect-facing: ROI Custom Variable
  pain_quotes?: Record<string, string>;    // Maps pain ID → prospect's own quote from calls
  root_cause_quotes?: Record<string, string>;  // Maps pain ID → prospect quote about root causes
  roi_quotes?: Record<string, string>;         // Maps pain ID → prospect quote about impact/cost
  paradigm_quotes?: Record<string, string>;    // Maps pain ID → prospect quote about desired future state
  budget_confirmed: boolean;               // "Do they have allocated budget for this?"
  implementation_timeline: string | null;  // "When do they need this implemented by?"
  deal_value: number;                      // Estimated deal value
  deal_stage: string;                      // 4D stage: discovery | diagnosis | demonstrate | decision | closed_won | closed_lost
  next_action: string;                     // "ALWAYS set the next action" (legacy flat string)
  next_steps_who: string;                  // Who: "Title and name" — per Brian's Pipeline Review Expectations
  next_steps_what: string;                 // What: Scheduled call? F/U date? Owe them something?
  next_steps_when: string;                 // When: "Date/Time" — turns red when overdue
  next_meeting_date: string | null;        // "ALWAYS set the next meeting"
  qa_completed: boolean;                   // "Ask until they ask" checkpoint
  buyer_intent_validated: boolean;         // Buyer's intent chain confirmed before D3
  status: 'in_progress' | 'completed' | 'approved';
  created_at: string;
  completed_at: string | null;
  milestones?: {
    discovery_set: { date: string; scheduled_date?: string; attendees: string[] } | null;
    discovery_held: { date: string; scheduled_date?: string; attendees: string[] } | null;
    demo_held: { date: string; scheduled_date?: string; attendees: string[] } | null;
    proposal_sent: { date: string; scheduled_date?: string; attendees: string[] } | null;
  };
  custom_meetings?: CustomMeeting[];
  mutual_action_plan?: MAPMilestone[];

  // ── MEDDPICC Fields (for SFDC copy-paste) ──
  pain_narrative: string;                  // I — Identify Pain: prospect's own words
  success_metrics_text: string;            // M — Metrics: how they'll measure success
  decision_criteria: string;               // D — Decision Criteria: their eval requirements
  decision_process: string;                // D — Decision Process: steps to signed contract
  paper_process: string;                   // P — Paper Process: procurement/legal/infosec
  champion_name: string;                   // C — Champion: who + title
  champion_validation_notes: string;       // C — Champion: evidence they can sell internally
  competitive_situation: string;           // C — Competition: deal-specific competitive landscape
  compelling_event: string;                // C — Compelling Event
  economic_buyer_access: string;           // E — Economic Buyer: access status + sentiment
  roi_summary_text: string;                // M — Metrics: formatted ROI summary

  // ── Discovery Call Sheet persistence ──
  call_sheet_answers: Record<string, string | string[]>;  // Answers from DiscoveryCallSheets
  call_sheet_checkpoints: Record<string, boolean>;        // Checkpoint pass/fail statuses
  call_sheet_checkpoint_reasons: Record<string, string>;  // Override justification text (e.g., { checkpoint1: "Champion confirmed urgency verbally" })
  call_sheet_persona: string | null;                      // Which persona sheet was used
  call_sheet_cost_of_problem: string;                     // "Cost of this problem" field
  // ── Building Specs (Replaces CS Handoff) ──
  roof_square_footage: number;
  membrane_type: string;
  year_built: number;
  hvac_units_count: number;
  building_use_case: string; // warehouse, retail, office, manufacturing
  roof_access_notes: string;
  prospect_has_agreed: boolean;
  prospect_agreement_notes: string;
  handoff_compliance_notes: string;

  // ── Predictive Marketing Fields ──
  roof_health_score?: number;
  roof_weather_signals?: string[];
  roof_permit_signals?: string[];

  // ── Deal Intelligence Fields (from transcript analysis) ──
  contract_end_date: string;              // When does their current Provider contract end?
  competing_priorities: string;           // What could "gazump" this project internally?
  competitors_identified: string;         // Which other vendors are being evaluated?
  competitors_count: number;              // How many vendors in the evaluation?
  sentiment_score: number;                // Post-demo star rating (1-5, 0 = not captured)
  sentiment_gap: string;                  // "What would close the delta to a 5?"
  existing_tt_customer: boolean;          // Is any entity already a TT customer?
  budget_ballpark_requested: boolean;     // Has the prospect asked for pricing/ballpark?
  demo_prep_checklist: Record<string, boolean>;  // Pre-demo personalization checklist
  enabled_study_names?: string[];                 // Whitelist of case study names for Social Proof section
  enabled_proof_customers?: string[];              // Whitelist of customer IDs from universe for dynamic social proof
  enabled_playbook_ids?: string[];                // Whitelist of playbook IDs for Playbooks section
  hris?: string;                                   // Prospect's current HRIS system
  granola_notes?: GranolaNote[];                   // Synced notes from Granola
  rep_forecast: number;                            // Rep's probability forecast (0-100), default 50

  // ── Gap Analysis Fields (from 4D transcript cross-reference) ──
  open_roles_count: number;               // How many roles are open right now? (#1 sizing metric)
  lead_source: string | null;             // How did this lead originate? (inbound, outbound, webinar, referral, nurture, partner)
  system_count: number;                   // How many separate systems involved in hiring? (from cs1)
  division_count: number;                 // How many locations/divisions/brands? (from js1)
  evaluation_stage: string | null;        // Where are they in buying process? (exploring, shortlisted, final-2, sole-evaluator)

  // ── Diagnosis Reframe Overrides ──
  // Rep-editable fields that override the default persona-based diagnosis content
  diagnosis_bigger_problem_override?: string;       // Custom "Bigger Problem" text for the prospect room
  diagnosis_root_cause_override?: string;           // Custom root cause (overrides q6 call-sheet answer)
  diagnosis_current_approach_override?: string;     // Custom current approach (overrides q5 call-sheet answer)

  // ── Pricing Configuration ──
  pricing_region: 'us' | 'ca';
  pricing_vertical: 'non-staffing' | 'staffing';
  pricing_employee_count: number;
  pricing_base_price: number;
  pricing_override: boolean;
  pricing_contract_term: 1 | 2 | 3;
  pricing_discount_pct: number;
  pricing_add_ons: PricingAddOn[];
  pricing_notes: string;
  pricing_price_cap_pct?: number;                  // Annual price escalation cap (e.g., 3 = 3%)
  pricing_promo_free_months?: number;               // Free months added (e.g., 4 for nonprofit)
  pricing_promo_label?: string;                     // Promo label (e.g., 'Nonprofit Bonus')
  // ── Pricing Config ──
  pricing_setup_type?: PricingSetupType;            // 'single' | 'divisions' | 'group'
  pricing_presentation_style?: PricingPresentationStyle; // 'single' | 'options'
  pricing_packages?: PricingPackage[];              // The 3 packages
  selected_pricing_package_id?: string;             // Which package the prospect selected
  pricing_divisions?: PricingDivision[];            // Multi-entity rollup config breakdown (for divisions/group)
  // Room section visibility (persisted so rep customizations survive navigation)
  room_visibility?: Record<string, boolean>;
  // Contract readiness fields (prospect-fillable)
  contract_readiness?: Record<string, string>;

  // ── Problem Canvas Fields ──
  priority_self_rating?: number;   // 1-10, prospect's own priority assessment
  ability_self_rating?: number;    // 1-10, prospect's own assessment of need for outside help
  problem_canvas_overrides?: {     // Rep can refine auto-generated narrative text
    objective?: string;
    current_reality?: string;
    buying_process?: string;
    real_problem?: string;
    root_cause?: string;
    roi_summary?: string;
  };

  // ── Deal Nuance & Transcript Fidelity Fields ──
  stakeholder_sentiment?: Record<string, StakeholderSentiment>;  // stakeholder.id → sentiment
  objections?: DealObjection[];              // Tracked objections throughout the deal
  // call_notes consolidated into granola_notes (extended GranolaNote)
  demo_reactions?: DemoReaction;             // Structured demo feedback (enriches sentiment_score)
  loss_reason?: LossReason;                  // Why we lost (if closed_lost)
  // prospect_verbatims consolidated into granola_notes[].key_quotes
  checkpoint_evidence?: {                    // Evidence for each checkpoint pass
    cp1?: CheckpointEvidence;                // Urgency Test
    cp2?: CheckpointEvidence;                // Gap Test  
    cp3?: CheckpointEvidence;                // Solution Fit
  };

  // ── Post Mortem Autopsy Fields ──
  post_mortem_completed?: boolean;
  post_mortem_fatality?: string;             // e.g., 'Priority Fatality'
  post_mortem_symptoms?: string[];           // Array of symptoms chosen
  post_mortem_pathway?: string;              // Optional text note/commitment

  // ── Post-Call Debrief Fields ──
  gut_feel?: 'strong' | 'mixed' | 'weak';    // Rep's post-call gut check
  gut_feel_note?: string;                     // Optional note on why
  last_call_date?: string;                    // When was the last call (ISO)

  // ── SFDC Pipeline Review Fields ──
  forecast_category?: 'pipeline' | 'best_case' | 'commit' | 'upside' | 'omitted';  // SFDC Forecast Category grouping
  opportunity_name?: string;               // SFDC-style: "Company - IB/OB - Date"
  most_recent_update?: string;             // Auto from Granola or manual — the "busywork" field
  most_recent_update_source?: 'granola' | 'manual';  // Where this came from
  most_recent_update_at?: string;          // ISO timestamp of last update
  compelling_event?: string;               // CE — Compelling Event (MEDDPICC extension)
  lead_source_detail?: string;             // Detailed lead source (Paid Search, Self Sourced, SDR, etc.)
}

// ── Storage ──

const STORAGE_KEY = 'scc_discovery_sessions_v3';

function migrateAlignmentChecks(checks: any): AlignmentChecks {
  // Migrate from old 3-field format to new 5-field format
  if (checks && 'strategic' in checks) {
    return {
      urgent_priority: false,
      resources_insufficient: false,
      problems_solutions: checks.strategic ?? false,
      roi_sufficient: checks.value ?? false,
      right_solution: checks.timeline ?? false,
    };
  }
  return checks ?? { urgent_priority: false, resources_insufficient: false, problems_solutions: false, roi_sufficient: false, right_solution: false };
}

export function getAllSessions(): DiscoverySession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    // Migrate old sessions that lack new fields
    const sessions: DiscoverySession[] = JSON.parse(raw);
    const rawWithMs = sessions.filter((s: any) => s.milestones && Object.keys(s.milestones).length > 0);
    console.log(`[getAllSessions] RAW from localStorage: ${sessions.length} total, ${rawWithMs.length} with milestones`);
    const result = sessions.map(s => ({
      ...s,
      persona: s.persona ?? null,
      current_ats: s.current_ats ?? null,
      industry: (s as any).industry ?? null,
      company_size: (s as any).company_size ?? null,
      use_case: (s as any).use_case ?? null,
      stakeholders: s.stakeholders ?? [],
      bap_answers: s.bap_answers ?? {},
      bap_notes: (s as any).bap_notes ?? {},
      overridden_pillars: s.overridden_pillars ?? [],
      budget_confirmed: (s as any).budget_confirmed ?? false,
      implementation_timeline: (s as any).implementation_timeline ?? null,
      deal_value: s.deal_value ?? 0,
      deal_stage: s.deal_stage ?? (s.blueprint_approved ? 'signing' : 'qualifying'),
      alignment_checks: migrateAlignmentChecks(s.alignment_checks),
      mutual_commitments: (s as any).mutual_commitments ?? { executive_sponsor: false, dedicated_admin: false, training_completion: false },
      next_action: (s as any).next_action ?? '',
      next_steps_who: (s as any).next_steps_who ?? '',
      next_steps_what: (s as any).next_steps_what ?? '',
      next_steps_when: (s as any).next_steps_when ?? '',
      next_meeting_date: (s as any).next_meeting_date ?? null,
      qa_completed: (s as any).qa_completed ?? false,
      buyer_intent_validated: (s as any).buyer_intent_validated ?? false,
      // MEDDPICC fields
      pain_narrative: (s as any).pain_narrative ?? '',
      success_metrics_text: (s as any).success_metrics_text ?? '',
      decision_criteria: (s as any).decision_criteria ?? '',
      decision_process: (s as any).decision_process ?? '',
      paper_process: (s as any).paper_process ?? '',
      champion_name: (s as any).champion_name ?? '',
      champion_validation_notes: (s as any).champion_validation_notes ?? '',
      competitive_situation: (s as any).competitive_situation ?? '',
      economic_buyer_access: (s as any).economic_buyer_access ?? '',
      roi_summary_text: (s as any).roi_summary_text ?? '',
      // Call Sheet persistence
      call_sheet_answers: (s as any).call_sheet_answers ?? {},
      call_sheet_checkpoints: (s as any).call_sheet_checkpoints ?? {},
      call_sheet_persona: (s as any).call_sheet_persona ?? null,
      call_sheet_cost_of_problem: (s as any).call_sheet_cost_of_problem ?? '',
      call_sheet_target_date: (s as any).call_sheet_target_date ?? '',
      // CS Handoff fields
      handoff_current_hris: (s as any).handoff_current_hris ?? '',
      handoff_calendar_system: (s as any).handoff_calendar_system ?? '',
      handoff_sso_provider: (s as any).handoff_sso_provider ?? '',
      handoff_sso_required: (s as any).handoff_sso_required ?? false,
      handoff_infosec_review_required: (s as any).handoff_infosec_review_required ?? false,
      handoff_current_career_site_url: (s as any).handoff_current_career_site_url ?? '',
      handoff_custom_domain: (s as any).handoff_custom_domain ?? '',
      handoff_brand_maturity: (s as any).handoff_brand_maturity ?? '',
      handoff_department_count: (s as any).handoff_department_count ?? 0,
      handoff_location_count: (s as any).handoff_location_count ?? 0,
      handoff_active_hiring_managers: (s as any).handoff_active_hiring_managers ?? 0,
      handoff_active_recruiters: (s as any).handoff_active_recruiters ?? 0,
      handoff_active_jobs_count: (s as any).handoff_active_jobs_count ?? 0,
      handoff_candidate_count_estimate: (s as any).handoff_candidate_count_estimate ?? 0,
      handoff_data_migration_notes: (s as any).handoff_data_migration_notes ?? '',
      handoff_job_boards: (s as any).handoff_job_boards ?? [],
      handoff_hris_integration: (s as any).handoff_hris_integration ?? '',
      handoff_other_integrations: (s as any).handoff_other_integrations ?? [],
      handoff_target_go_live_date: (s as any).handoff_target_go_live_date ?? '',
      handoff_launch_type: (s as any).handoff_launch_type ?? '',
      handoff_go_live_notes: (s as any).handoff_go_live_notes ?? '',
      handoff_users_to_train: (s as any).handoff_users_to_train ?? 0,
      handoff_training_format: (s as any).handoff_training_format ?? '',
      handoff_training_notes: (s as any).handoff_training_notes ?? '',
      handoff_primary_contact_email: (s as any).handoff_primary_contact_email ?? '',
      handoff_it_contact_email: (s as any).handoff_it_contact_email ?? '',
      handoff_preferred_comm_channel: (s as any).handoff_preferred_comm_channel ?? '',
      handoff_target_time_to_hire: (s as any).handoff_target_time_to_hire ?? 0,
      handoff_target_cost_per_hire: (s as any).handoff_target_cost_per_hire ?? 0,
      handoff_target_adoption_rate: (s as any).handoff_target_adoption_rate ?? 0,
      handoff_success_review_date: (s as any).handoff_success_review_date ?? '',
      handoff_prework_items: (s as any).handoff_prework_items ?? [],
      handoff_prework_notes: (s as any).handoff_prework_notes ?? '',
      handoff_gdpr_applicable: (s as any).handoff_gdpr_applicable ?? false,
      handoff_data_retention_months: (s as any).handoff_data_retention_months ?? 0,
      handoff_dpa_required: (s as any).handoff_dpa_required ?? false,
      handoff_compliance_notes: (s as any).handoff_compliance_notes ?? '',
      // Deal Intelligence fields
      contract_end_date: (s as any).contract_end_date ?? '',
      competing_priorities: (s as any).competing_priorities ?? '',
      competitors_identified: (s as any).competitors_identified ?? '',
      competitors_count: (s as any).competitors_count ?? 0,
      sentiment_score: (s as any).sentiment_score ?? 0,
      sentiment_gap: (s as any).sentiment_gap ?? '',
      existing_tt_customer: (s as any).existing_tt_customer ?? false,
      budget_ballpark_requested: (s as any).budget_ballpark_requested ?? false,
      demo_prep_checklist: (s as any).demo_prep_checklist ?? {},
      enabled_study_names: (s as any).enabled_study_names ?? undefined,
      enabled_playbook_ids: (s as any).enabled_playbook_ids ?? undefined,
      hris: (s as any).hris ?? undefined,
      granola_notes: (s as any).granola_notes ?? [],
      rep_forecast: (s as any).rep_forecast ?? 50,
      // Pricing fields
      pricing_region: (s as any).pricing_region ?? 'us',
      pricing_vertical: (s as any).pricing_vertical ?? 'non-staffing',
      pricing_employee_count: (s as any).pricing_employee_count ?? 0,
      pricing_base_price: (s as any).pricing_base_price ?? 0,
      pricing_override: (s as any).pricing_override ?? false,
      pricing_contract_term: (s as any).pricing_contract_term ?? 1,
      pricing_discount_pct: (s as any).pricing_discount_pct ?? 0,
      pricing_add_ons: (s as any).pricing_add_ons ?? [],
      pricing_notes: (s as any).pricing_notes ?? '',
      pricing_price_cap_pct: (s as any).pricing_price_cap_pct ?? undefined,
      pricing_promo_free_months: (s as any).pricing_promo_free_months ?? undefined,
      pricing_promo_label: (s as any).pricing_promo_label ?? undefined,
      room_visibility: (s as any).room_visibility ?? undefined,
      contract_readiness: (s as any).contract_readiness ?? undefined,
      // Problem Canvas fields
      priority_self_rating: (s as any).priority_self_rating ?? undefined,
      ability_self_rating: (s as any).ability_self_rating ?? undefined,
      problem_canvas_overrides: (s as any).problem_canvas_overrides ?? undefined,
      // Deal Nuance fields
      stakeholder_sentiment: (s as any).stakeholder_sentiment ?? undefined,
      objections: (s as any).objections ?? [],
      demo_reactions: (s as any).demo_reactions ?? undefined,
      loss_reason: (s as any).loss_reason ?? undefined,
      checkpoint_evidence: (s as any).checkpoint_evidence ?? undefined,
      post_mortem_completed: (s as any).post_mortem_completed ?? false,
      post_mortem_fatality: (s as any).post_mortem_fatality ?? undefined,
      post_mortem_symptoms: (s as any).post_mortem_symptoms ?? [],
      post_mortem_pathway: (s as any).post_mortem_pathway ?? undefined,
      // SFDC Pipeline Review fields
      forecast_category: (s as any).forecast_category ?? 'pipeline',
      opportunity_name: (s as any).opportunity_name ?? undefined,
      most_recent_update: (s as any).most_recent_update ?? '',
      most_recent_update_source: (s as any).most_recent_update_source ?? undefined,
      most_recent_update_at: (s as any).most_recent_update_at ?? undefined,
      compelling_event: (s as any).compelling_event ?? '',
      lead_source_detail: (s as any).lead_source_detail ?? undefined,
      company_id: (s as any).company_id ?? undefined,
      sf_opportunity_id: (s as any).sf_opportunity_id ?? undefined,
    }));
    const resultWithMs = result.filter((s: any) => s.milestones && Object.keys(s.milestones).length > 0);
    console.log(`[getAllSessions] AFTER map: ${result.length} total, ${resultWithMs.length} with milestones`);
    return result;
  } catch {
    return [];
  }
}

let _prevSessionsStr = '';
function saveSessions(sessions: DiscoverySession[]): void {
  const newStr = JSON.stringify(sessions);
  localStorage.setItem(STORAGE_KEY, newStr);
  
  if (typeof window !== 'undefined') {
    // Notify the UI to re-render via our new realtime hook event
    window.dispatchEvent(new CustomEvent('scc_discovery_updated'));

    // Diff against previous state to find what changed
    const prevStr = _prevSessionsStr || '[]';
    _prevSessionsStr = newStr;
    
    // Skip if nothing changed (or first run)
    if (prevStr === newStr || prevStr === '[]') return;

    try {
      const prev = JSON.parse(prevStr);
      const prevMap = new Map(prev.map((s: any) => [s.id, s]));
      
      const changed = sessions.filter(s => {
        const p = prevMap.get(s.id);
        return !p || JSON.stringify(p) !== JSON.stringify(s);
      });

      if (changed.length > 0) {
        import('./supabase').then(({ supabase }) => {
          const workspaceId = localStorage.getItem('scc_workspace_id');
          if (!workspaceId) return;

          const payload = changed.map(s => ({
            id: s.id,
            workspace_id: workspaceId,
            rep_id: s.rep_id || 'unassigned',
            data: s,
            created_at: s.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));
          supabase.from('discovery_sessions').upsert(payload).then(res => {
            if (res.error) console.error('[RealtimeSync] Discovery Sync Error:', res.error);
          });
        });
      }
    } catch (err) {
      console.error('Failed to sync diff to Supabase', err);
    }
  }
}

// ── BAP Auto-Scoring ──

/** Compute the auto-scored BAP answers from session data.
 *  9 of 12 questions auto-score. The other 3 (Q4 partial, manual overrides) use bap_answers. */
export function computeBAPAnswers(session: DiscoverySession): Record<string, BAPAnswer> {
  const auto: Record<string, BAPAnswer> = {};
  const cs = session.call_sheet_answers || {};

  // ── CP1: Do They Need to Act? ──

  // Q1: Core Problem → pains selected? Boosted if call_sheet q1 answered or q1b severity 8+
  auto.q1 = (session.selected_pains || []).length > 0 ? 'yes' : null;
  if (!auto.q1 && cs.q1) auto.q1 = 'yes';
  if (cs.q1b && typeof cs.q1b === 'string' && parseInt(cs.q1b, 10) >= 8) auto.q1 = 'yes';

  // Q2: Stakeholder Map → requires Champion + Economic Buyer for 'yes', either for 'maybe'
  const stakeholders = session.stakeholders ?? [];
  const hasChampion = stakeholders.some(s => s.name.trim().length > 0 && /champion|advocate/i.test(s.role ?? ''));
  const hasEB = stakeholders.some(s => s.name.trim().length > 0 && /economic.?buyer|decision.?maker|budget.?holder|cfo|ceo|vp|head|director/i.test(s.role ?? '') && !/champion/i.test(s.role ?? ''));
  const hasAnyNamed = stakeholders.some(s => s.name.trim().length > 0);
  auto.q2 = hasChampion && hasEB ? 'yes' : (hasChampion || hasEB || hasAnyNamed) ? 'maybe' : null;
  if (!auto.q2 && cs.q2) {
    const q2Val = cs.q2;
    auto.q2 = (Array.isArray(q2Val) ? q2Val.length > 0 : !!q2Val) ? 'maybe' : null;
  }

  // Q3: Cost of Indecision → ROI calculated?
  auto.q3 = session.roi_total > 0 ? 'yes' : null;

  // Q4: Priority Level → auto-score from pain count (≥4 = yes, ≥2 = maybe), boosted by call_sheet q4a
  auto.q4 = (session.selected_pains || []).length >= 4 ? 'yes'
    : (session.selected_pains || []).length >= 2 ? 'maybe'
    : null;
  if (!auto.q4 || auto.q4 === 'maybe') {
    if (cs.q4a) {
      const q4aVal = cs.q4a;
      const hasImpacts = Array.isArray(q4aVal) ? q4aVal.length > 0 : !!q4aVal;
      if (hasImpacts) auto.q4 = 'yes';
    }
  }

  // ── CP2: Do They Need Outside Help? ──

  // Q5: Current Approach → rep filled in "Current Approach" override? Or call_sheet q5 answered
  const hasCurrentApproach = !!((session as any).diagnosis_current_approach_override?.trim());
  auto.q5 = hasCurrentApproach ? 'yes' : null;
  if (!auto.q5 && cs.q5) {
    const q5Val = typeof cs.q5 === 'string' ? cs.q5.trim() : '';
    auto.q5 = q5Val ? (q5Val.length > 10 ? 'yes' : 'maybe') : null;
  }

  // Q6: Capability Gap → rep filled in "Root Cause" override? Or call_sheet q6 has root causes
  const hasRootCause = !!((session as any).diagnosis_root_cause_override?.trim());
  auto.q6 = hasRootCause ? 'yes' : null;
  if (!auto.q6 && cs.q6) {
    const q6Val = cs.q6;
    const hasRootCauses = Array.isArray(q6Val) ? q6Val.length > 0 : !!q6Val;
    if (hasRootCauses) auto.q6 = 'yes';
  }

  // Q7: Need for External Help → alignment check or call_sheet q6b
  auto.q7 = session.alignment_checks.resources_insufficient ? 'yes' : null;
  if (!auto.q7 && cs.q6b) {
    if (cs.q6b === 'Yes — they need external help') auto.q7 = 'yes';
    else if (cs.q6b === 'Partially — open to help but not committed') auto.q7 = 'maybe';
  }

  // Q8: Readiness → budget confirmed? Or call_sheet q8 has budget, reinforced by q8c 1-3
  auto.q8 = session.budget_confirmed ? 'yes' : null;
  if (!auto.q8 && cs.q8) {
    const q8Val = cs.q8;
    const hasBudget = Array.isArray(q8Val) ? q8Val.length > 0 : !!q8Val;
    if (hasBudget) auto.q8 = 'yes';
  }
  if (cs.q8c && typeof cs.q8c === 'string') {
    const q8cNum = parseInt(cs.q8c, 10);
    if (q8cNum >= 1 && q8cNum <= 3) auto.q8 = 'yes';
  }

  // ── CP3: Best Solution & Path Forward ──

  // Q9: Proven Results → case studies enabled? Or call_sheet q9 answered
  const hasEnabledStudies = (session.enabled_study_names?.length ?? 0) > 0;
  auto.q9 = hasEnabledStudies ? 'yes' : null;
  if (!auto.q9 && cs.q9) {
    const q9Val = cs.q9;
    auto.q9 = (Array.isArray(q9Val) ? q9Val.length > 0 : !!q9Val) ? 'yes' : null;
  }

  // Q10: Solution Map → problems_solutions checkbox? Or call_sheet q10 clear
  auto.q10 = session.alignment_checks.problems_solutions ? 'yes' : null;
  if (!auto.q10 && cs.q10) {
    const q10Val = typeof cs.q10 === 'string' ? cs.q10.trim() : '';
    if (q10Val) auto.q10 = 'yes';
  }

  // Q11: Success Metrics → roi_sufficient checkbox? Or call_sheet q11 has metrics
  auto.q11 = session.alignment_checks.roi_sufficient ? 'yes' : null;
  if (!auto.q11 && cs.q11) {
    const q11Val = cs.q11;
    const hasMetrics = Array.isArray(q11Val) ? q11Val.length > 0 : !!q11Val;
    if (hasMetrics) auto.q11 = 'yes';
  }

  // Q12: Trial Close → alignment check or call_sheet q12 score 8+
  auto.q12 = session.alignment_checks.right_solution ? 'yes' : null;
  if (!auto.q12 && cs.q12) {
    const q12Num = typeof cs.q12 === 'string' ? parseInt(cs.q12, 10) : NaN;
    if (!isNaN(q12Num)) {
      auto.q12 = q12Num >= 8 ? 'yes' : q12Num >= 5 ? 'maybe' : 'no';
    }
  }

  // Objection-aware risk: if CP3 Q12 is 'yes' but there are open objections, downgrade to 'maybe'
  const openObjections = (session.objections ?? []).filter(o => o.status === 'open').length;
  if (auto.q12 === 'yes' && openObjections > 0) {
    auto.q12 = 'maybe';
  }

  // Fallback: if auto-derivation returns null for a question, use the rep's manual bap_answers
  // This preserves nuanced judgments (e.g., Q8='maybe' for budget-cautious but discussed)
  const manual = session.bap_answers ?? {};
  for (const q of BAP_QUESTIONS) {
    if (auto[q.id] === null || auto[q.id] === undefined) {
      const manualVal = manual[q.id];
      if (manualVal === 'yes' || manualVal === 'maybe' || manualVal === 'no') {
        auto[q.id] = manualVal;
      }
    }
  }

  return auto;
}

// ── Auto-Derive Hope Pillars from Session Data ──

export interface HopePillar {
  title: string;
  subtitle: string;
}

const GENERIC_HOPE_PILLARS: HopePillar[] = [
  { title: 'Spray & Pray', subtitle: 'Relying heavily on job board postings and waiting for active candidates.' },
  { title: 'Cold Outreach', subtitle: 'High-volume, low-conversion InMail campaigns with no warmup.' },
  { title: 'Agency Reliance', subtitle: 'Paying 20%+ fees for external recruiters due to internal bottlenecks.' },
];

/**
 * Auto-compute Hope pillars from session data.
 *
 * Priority:
 *  1. session.custom_hope_pillars (manual override — always wins)
 *  2. Auto-derived from BAP notes (q5 = Current Approach, q6 = Capability Gap, q3 = Cost of Indecision)
 *  3. Auto-derived from call_sheet_answers + pain_narrative + competitive_situation
 *  4. Generic defaults (Spray & Pray / Cold Outreach / Agency Reliance)
 *
 * Returns up to 3 pillars.
 */
export function computeHopePillars(session: DiscoverySession): HopePillar[] {
  // 1. Manual override — always wins
  const manual = (session as any).custom_hope_pillars;
  if (Array.isArray(manual) && manual.length > 0 && manual.some((p: any) => p?.title)) {
    return manual.slice(0, 3);
  }

  // 2. Try to derive from BAP notes (richest source after manual)
  const bapNotes = session.bap_notes || {};
  const csAnswers = session.call_sheet_answers || {};
  const pillars: HopePillar[] = [];

  // Pillar 1: Current Approach (BAP Q5 or call sheet Q5)
  const q5Note = bapNotes.q5 || '';
  const q5Answer = typeof csAnswers.q5 === 'string' ? csAnswers.q5 : '';
  const approachText = q5Note || q5Answer || session.diagnosis_current_approach_override || '';
  if (approachText.length > 15) {
    pillars.push({
      title: 'Current Approach',
      subtitle: truncateToSentence(approachText, 200),
    });
  }

  // Pillar 2: Capability Gap / Root Cause (BAP Q6 or call sheet Q6)
  const q6Note = bapNotes.q6 || '';
  const q6Answers = Array.isArray(csAnswers.q6) ? csAnswers.q6.join('. ') : typeof csAnswers.q6 === 'string' ? csAnswers.q6 : '';
  const gapText = q6Note || q6Answers || session.diagnosis_root_cause_override || '';
  if (gapText.length > 15) {
    pillars.push({
      title: 'The Gap',
      subtitle: truncateToSentence(gapText, 200),
    });
  }

  // Pillar 3: Cost of Indecision / Consequence (BAP Q3 or cost_of_problem)
  const q3Note = bapNotes.q3 || '';
  const costText = q3Note || session.call_sheet_cost_of_problem || '';
  if (costText.length > 15) {
    pillars.push({
      title: 'Cost of Inaction',
      subtitle: truncateToSentence(costText, 200),
    });
  }

  // If we got at least 2 pillars from BAP notes, use them
  if (pillars.length >= 2) return pillars.slice(0, 3);

  // 3. Try to derive from pain_narrative + competitive_situation (broader fallback)
  if (pillars.length < 2) {
    if (session.pain_narrative && session.pain_narrative.length > 30 && pillars.length === 0) {
      pillars.push({
        title: 'The Problem',
        subtitle: truncateToSentence(session.pain_narrative, 200),
      });
    }
    if (session.competitive_situation && session.competitive_situation.length > 30) {
      const firstLine = session.competitive_situation.split('\n')[0];
      pillars.push({
        title: 'Competitive Landscape',
        subtitle: truncateToSentence(firstLine, 200),
      });
    }
  }

  if (pillars.length >= 2) return pillars.slice(0, 3);

  // 4. Not enough data — return generic defaults
  return GENERIC_HOPE_PILLARS;
}

/** Truncate to the last complete sentence within maxLen characters */
function truncateToSentence(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  // Try to cut at the last sentence boundary
  const lastPeriod = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('." '), cut.lastIndexOf(".' "));
  if (lastPeriod > maxLen * 0.4) return cut.slice(0, lastPeriod + 1);
  // Fall back to last space
  const lastSpace = cut.lastIndexOf(' ');
  return lastSpace > maxLen * 0.5 ? cut.slice(0, lastSpace) + '…' : cut + '…';
}

// ── Auto-Derive Prospect Room Data ──

/** Compute diagnosis overrides with priority chain:
 *  1. Manual override field
 *  2. BAP notes
 *  3. Call sheet answers
 *  4. Empty string fallback */
export function computeDiagnosisOverrides(session: DiscoverySession): { currentApproach: string; rootCause: string; biggerProblem: string } {
  const bap = session.bap_notes || {};
  const cs = session.call_sheet_answers || {};

  // currentApproach: manual → bap q5 → call sheet q5 → ''
  const currentApproach =
    (session.diagnosis_current_approach_override ?? '').trim() ||
    (bap.q5 ?? '').trim() ||
    (typeof cs.q5 === 'string' ? cs.q5.trim() : '') ||
    '';

  // rootCause: manual → bap q6 → call sheet q6 (join if array) → ''
  const rootCause =
    (session.diagnosis_root_cause_override ?? '').trim() ||
    (bap.q6 ?? '').trim() ||
    (Array.isArray(cs.q6) ? cs.q6.join('. ') : typeof cs.q6 === 'string' ? cs.q6.trim() : '') ||
    '';

  // biggerProblem: manual → bap q3 → cost of problem → ''
  const biggerProblem =
    (session.diagnosis_bigger_problem_override ?? '').trim() ||
    (bap.q3 ?? '').trim() ||
    (session.call_sheet_cost_of_problem ?? '').trim() ||
    '';

  return { currentApproach, rootCause, biggerProblem };
}

/** Auto-match prospect quotes to selected pains.
 *  Priority: (1) manual pain_quotes, (2) keyword-matched quotes from granola_notes key_quotes. */
export function computePainQuotes(session: DiscoverySession): Record<string, string> {
  const allQuotes: string[] = [];
  for (const note of session.granola_notes ?? []) {
    for (const q of note.key_quotes ?? []) {
      if (q.trim()) allQuotes.push(q.trim());
    }
  }

  // Keyword map for well-known pain IDs
  const PAIN_KEYWORDS: Record<string, string[]> = {
    'broken-workflow': ['broken', 'workflow', 'disconnect', 'manual'],
    'ats-sunsetting': ['sunset', 'going away', 'shutting down', 'end of life'],
    'low-applicant-volume': ['nothing', 'no applicants', 'not getting', 'low volume'],
    'no-career-site': ['career site', 'career page', 'careers page'],
    'manual-screening': ['screen', 'review', 'manual', 'read'],
    'outdated-career-site': ['career site', 'career page', 'outdated'],
    'high-cost-per-hire': ['cost', 'expensive', 'paying', 'spend'],
    'poor-candidate-experience': ['experience', 'apply', 'application'],
    'locked-out-managers': ['manager', 'hiring manager', "won't use"],
    'scheduling-chaos': ['schedule', 'calendar', 'book'],
    'tool-sprawl-centralization': ['systems', 'tools', 'spreadsheet'],
    'vendor-support-gap': ['support', 'vendor', 'unresponsive'],
  };

  const usedQuotes = new Set<string>();
  const autoMatched: Record<string, string> = {};

  for (const painId of session.selected_pains || []) {
    let keywords = PAIN_KEYWORDS[painId];

    // Fallback: derive keywords from pain title words
    if (!keywords) {
      const pain = TT_PAINS.find(p => p.id === painId);
      if (pain) {
        keywords = pain.title
          .toLowerCase()
          .split(/[\s-]+/)
          .filter(w => w.length > 3);
      }
    }

    if (!keywords || keywords.length === 0) continue;

    // Find first matching quote that hasn't been used
    const match = allQuotes.find(q => {
      if (usedQuotes.has(q)) return false;
      const lower = q.toLowerCase();
      return keywords!.some(kw => lower.includes(kw));
    });

    if (match) {
      autoMatched[painId] = match;
      usedQuotes.add(match);
    }
  }

  // Manual always wins
  return { ...autoMatched, ...(session.pain_quotes ?? {}) };
}

/** Auto-pick paradigm shift quotes (hope + design) from granola_notes key_quotes.
 *  Priority: (1) manual paradigm_quotes, (2) auto-picked by sentiment keywords. */
export function computeParadigmQuotes(session: DiscoverySession): Record<string, string> {
  const allQuotes: string[] = [];
  for (const note of session.granola_notes ?? []) {
    for (const q of note.key_quotes ?? []) {
      if (q.trim()) allQuotes.push(q.trim());
    }
  }

  const HOPE_KEYWORDS = ['broken', 'workflow', 'not working', 'nothing', 'canceled', 'sunset', 'going away'];
  const DESIGN_KEYWORDS = ['better', 'awesome', 'like that', 'option', 'love'];

  const auto: Record<string, string> = {};

  // Find a Hope-side quote
  const hopeQuote = allQuotes.find(q => {
    const lower = q.toLowerCase();
    return HOPE_KEYWORDS.some(kw => lower.includes(kw));
  });
  if (hopeQuote) auto.hope = hopeQuote;

  // Find a Design-side quote (different from hope)
  const designQuote = allQuotes.find(q => {
    if (q === hopeQuote) return false;
    const lower = q.toLowerCase();
    return DESIGN_KEYWORDS.some(kw => lower.includes(kw));
  });
  if (designQuote) auto.design = designQuote;

  // Manual always wins
  return { ...auto, ...(session.paradigm_quotes ?? {}) };
}

/** Compute a personalized hero message for the prospect room.
 *  Returns '' if not enough data to generate a meaningful message. */
export function computeHeroMessage(session: DiscoverySession): string {
  const stakeholders = session.stakeholders ?? [];
  const hasNotes = (session.granola_notes ?? []).length > 0;
  const hasPainNarrative = !!session.pain_narrative;

  if (stakeholders.length === 0 || !hasNotes || !hasPainNarrative) return '';

  const firstStakeholder = stakeholders.find(s => s.name.trim().length > 0);
  if (!firstStakeholder) return '';

  const firstName = firstStakeholder.name.split(' ')[0];
  const bap = session.bap_notes || {};
  const painSource = (bap.q1 ?? '').trim() || session.pain_narrative;
  const painSummary = truncateToSentence(painSource, 80);

  // Derive outcome from use_case
  const USE_CASE_OUTCOMES: Record<string, string> = {
    'replacing-ats': 'unify your hiring in one platform',
    'first-ats': 'build your first structured hiring engine',
    'adding-brand': 'transform your employer brand',
    'consolidating': 'consolidate your hiring tools',
    'scaling': 'scale your hiring for growth',
  };
  const outcome = USE_CASE_OUTCOMES[session.use_case ?? ''] ?? 'modernize your talent acquisition';

  return `${firstName} — based on our conversation about ${painSummary}, here's a tailored blueprint for how ${session.company_name} can ${outcome}.`;
}

/** Auto-parse competitors being evaluated from session data.
 *  Priority: (1) manual competitors_evaluating array, (2) parsed from competitors_identified + competitive_situation. */
export function computeCompetitorsEvaluating(session: DiscoverySession): string[] {
  const manual = (session as any).competitors_evaluating;
  if (Array.isArray(manual) && manual.length > 0) return manual;

  const KNOWN_ATS: string[] = [
    'AgencyZoom', 'Greenhouse', 'Ashby', 'BambooHR', 'Lever', 'Workday',
    'iCIMS', 'SmartRecruiters', 'Workable', 'JazzHR', 'Breezy HR', 'Paycor',
    'Paycom', 'ADP', 'Dayforce', 'Rippling', 'Jobvite', 'Bullhorn',
    'IdealTraits', 'ApplicantPro', 'Pinpoint',
  ];

  const found = new Set<string>();

  // Parse from competitors_identified
  const raw = session.competitors_identified ?? '';
  if (raw) {
    const tokens = raw.split(/[,;\n]+/).map(t => t.trim()).filter(Boolean);
    for (const token of tokens) {
      const knownMatch = KNOWN_ATS.find(k => k.toLowerCase() === token.toLowerCase());
      if (knownMatch) {
        found.add(knownMatch);
      } else if (token.length > 3) {
        found.add(token);
      }
    }
  }

  // Also scan competitive_situation for known names
  const situation = (session.competitive_situation ?? '').toLowerCase();
  if (situation) {
    for (const name of KNOWN_ATS) {
      if (situation.includes(name.toLowerCase())) {
        found.add(name);
      }
    }
  }

  // Filter out the prospect's own current Provider
  const currentAts = session.current_ats ?? '';
  if (currentAts) found.delete(currentAts);

  return Array.from(found);
}

/** Seed initial Mutual Action Plan milestones from granola_notes next_steps.
 *  Returns [] if session already has a populated mutual_action_plan. */
export function computeInitialMAP(session: DiscoverySession): MAPMilestone[] {
  if ((session.mutual_action_plan ?? []).length > 0) return [];

  const milestones: MAPMilestone[] = [];
  let index = 0;

  // Add next_action as first milestone if present
  if (session.next_action && session.next_action.trim().length > 0) {
    milestones.push({
      id: `m_auto_${index}_${Date.now()}`,
      label: session.next_action.trim(),
      owner: 'Service Alignment',
      dueDate: '',
      done: false,
    });
    index++;
  }

  // Gather next_steps from all granola notes
  for (const note of session.granola_notes ?? []) {
    if (!note.next_steps) continue;
    const chunks = note.next_steps.split(/[.→,\n]+/).map(c => c.trim()).filter(c => c.length > 10);
    for (const chunk of chunks) {
      if (milestones.length >= 6) break;
      milestones.push({
        id: `m_auto_${index}_${Date.now()}`,
        label: chunk,
        owner: session.company_name,
        dueDate: '',
        done: false,
      });
      index++;
    }
    if (milestones.length >= 6) break;
  }

  return milestones.slice(0, 6);
}

/** Hook for future auto-curation of case studies.
 *  Returns undefined if session already has manual enabled_study_names, or undefined to let
 *  the SocialProofGrid component handle industry filtering naturally. */
export function computeEnabledStudies(session: DiscoverySession): string[] | undefined {
  // Manual override wins
  if ((session.enabled_study_names ?? []).length > 0) return session.enabled_study_names;

  // Need at least industry or company_size to curate
  if (!session.industry && !session.company_size) return undefined;

  // Import-free approach: reference the case study names + metadata directly
  // This avoids circular imports with SocialProofGrid
  const STUDY_META: { name: string; industries: string[]; smbFriendly: boolean; keywords: string[] }[] = [
    { name: 'ESTO', industries: ['professional-services', 'financial-services'], smbFriendly: true, keywords: ['time-to-hire', 'automation', 'workflow'] },
    { name: 'Giacom', industries: ['professional-services'], smbFriendly: true, keywords: ['ai', 'screening', 'referrals'] },
    { name: 'Movember', industries: ['nonprofit'], smbFriendly: true, keywords: ['global', 'satisfaction', 'ai'] },
    { name: 'Rocco Forte Hotels', industries: ['hospitality'], smbFriendly: true, keywords: ['hiring-managers', 'adoption', 'multilingual'] },
    { name: 'Five Guys', industries: ['food-beverage', 'hospitality'], smbFriendly: true, keywords: ['high-volume', 'automation', 'responses'] },
    { name: 'Pincho Nation', industries: ['hospitality', 'food-beverage'], smbFriendly: true, keywords: ['franchise', 'volume', 'triggers'] },
    { name: 'Knauf', industries: ['manufacturing'], smbFriendly: false, keywords: ['global', 'career-site', 'multi-language'] },
    { name: 'Footasylum', industries: ['retail'], smbFriendly: false, keywords: ['career-site', 'crm', 'direct-applications'] },
    { name: 'Motorpoint', industries: ['retail'], smbFriendly: false, keywords: ['time-to-hire', 'sla', 'automation'] },
    { name: 'Lotus Cars', industries: ['automotive'], smbFriendly: false, keywords: ['time-to-hire', 'sla', 'automation'] },
    { name: 'Savills', industries: ['professional-services'], smbFriendly: false, keywords: ['hiring-managers', 'change-management', 'training'] },
    { name: 'Octavo', industries: ['construction'], smbFriendly: false, keywords: ['adoption', 'hiring-managers', 'user-friendly'] },
    { name: 'Kelso Burnett', industries: ['construction'], smbFriendly: false, keywords: ['agency-reduction', 'career-site', 'crm'] },
    { name: 'Pemo', industries: ['financial-services', 'technology'], smbFriendly: true, keywords: ['structured-hiring', 'career-site', 'culture'] },
    { name: 'Actavo', industries: ['construction'], smbFriendly: false, keywords: ['automation', 'triggers', 'adoption'] },
    { name: 'Dacha Real Estate', industries: ['professional-services'], smbFriendly: true, keywords: ['international', 'career-site', 'visual-pipelines'] },
    { name: 'Wego', industries: ['technology'], smbFriendly: true, keywords: ['first-ats', 'hiring-managers', 'plug-and-play'] },
    { name: 'Scandinavian Executive', industries: ['professional-services'], smbFriendly: true, keywords: ['pipeline', 'talent-network', 'boutique'] },
    { name: 'GoodOaks Homecare', industries: ['healthcare'], smbFriendly: true, keywords: ['franchise', 'automation', 'ai'] },
    { name: 'Precis Digital', industries: ['media', 'technology'], smbFriendly: false, keywords: ['diversity', 'scorecards', 'blind-hiring'] },
  ];

  const INDUSTRY_ALIASES: Record<string, string[]> = {
    'insurance': ['financial-services', 'professional-services'],
    'financial-services': ['professional-services'],
    'education': ['nonprofit'],
    'government': ['nonprofit', 'professional-services'],
    'logistics': ['construction'],
    'manufacturing': ['construction'],
    'automotive': ['retail'],
    'real-estate': ['professional-services', 'construction'],
    'staffing': ['professional-services'],
    'legal': ['professional-services'],
  };

  const industry = session.industry || '';
  const industriesToMatch = [industry, ...(INDUSTRY_ALIASES[industry] || [])];
  const isSMB = ['1-50', '51-200'].includes(session.company_size || '');
  const pains = session.selected_pains || [];
  const useCase = session.use_case || '';
  const commercialIndustries = ['insurance', 'financial-services', 'professional-services', 'retail', 'technology', 'construction', 'real-estate', 'staffing', 'legal', 'automotive', 'logistics', 'manufacturing'];
  const isCommercial = commercialIndustries.includes(industry);

  // Score each study
  const scored = STUDY_META.map(study => {
    let score = 0;
    // Industry match (strongest signal)
    if (study.industries.some(si => industriesToMatch.includes(si))) score += 10;
    // Size match
    if (isSMB && study.smbFriendly) score += 5;
    if (!isSMB && !study.smbFriendly) score += 3;
    // Penalize nonprofits for commercial deals
    if (isCommercial && study.industries.includes('nonprofit')) score -= 20;
    // Use case keyword bonuses
    if (useCase === 'replacing-ats' && study.keywords.some(k => ['time-to-hire', 'adoption', 'user-friendly', 'automation'].includes(k))) score += 3;
    if (useCase === 'first-ats' && study.keywords.some(k => ['first-ats', 'plug-and-play', 'structured-hiring'].includes(k))) score += 3;
    if (useCase === 'adding-brand' && study.keywords.some(k => ['career-site', 'culture', 'direct-applications'].includes(k))) score += 3;
    // Pain keyword bonuses
    if (pains.includes('scheduling-chaos') && study.keywords.includes('automation')) score += 2;
    if (pains.includes('tool-sprawl-centralization') && study.keywords.some(k => ['workflow', 'automation'].includes(k))) score += 2;
    if (pains.includes('outdated-career-site') && study.keywords.includes('career-site')) score += 2;
    if (pains.includes('manual-sourcing') && study.keywords.some(k => ['crm', 'direct-applications'].includes(k))) score += 2;
    if (pains.includes('vendor-support-gap') && study.keywords.some(k => ['adoption', 'user-friendly'].includes(k))) score += 2;
    return { name: study.name, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const topStudies = scored.filter(s => s.score > 0).slice(0, 6).map(s => s.name);
  return topStudies.length >= 3 ? topStudies : undefined;
}

/** Auto-derive ROI category toggles from session data.
 *  Priority: (1) manual roi_enabled_categories (if has keys), (2) auto-derived from session fields. */
export function computeROICategorySelection(session: DiscoverySession): Record<string, boolean> {
  // Manual override wins if it has any keys
  if (session.roi_enabled_categories && Object.keys(session.roi_enabled_categories).length > 0) {
    return session.roi_enabled_categories;
  }

  const bap = session.bap_notes || {};
  const hasCostContent = !!(bap.q3 ?? '').trim() || !!(session.call_sheet_cost_of_problem ?? '').trim();

  return {
    seatSavings: !!(session.current_ats && session.current_ats !== 'None'),
    agencySavings: (session.roi_inputs?.agencyHires ?? 0) > 0,
    vacancySavings: true,
    jobBoardSavings: true,
    adminTimeSavings: true,
    costOfIndecision: hasCostContent,
  };
}

/** Get checkpoint score (YES=2.5, MAYBE=1.25, NO=0) */
export function getCheckpointScore(answers: Record<string, BAPAnswer>, checkpoint: 1 | 2 | 3): number {
  const qs = BAP_QUESTIONS.filter(q => q.checkpoint === checkpoint);
  return qs.reduce((score, q) => {
    const a = answers[q.id];
    if (a === 'yes' || (typeof a === 'string' && a !== 'no' && a !== 'maybe')) return score + 2.5;
    if (a === 'maybe') return score + 1.25;
    return score;
  }, 0);
}

/** Get checkpoint status */
export function getCheckpointStatus(score: number, maxScore: number): { label: string; color: string; passed: boolean } {
  if (score >= maxScore - 2.5) return { label: 'PASSED', color: 'emerald', passed: true };
  if (score >= maxScore / 2) return { label: 'AT RISK', color: 'amber', passed: false };
  return { label: 'FAILED', color: 'rose', passed: false };
}

/** Compute 4D pipeline booleans from BAP scores */
export function compute4DFromBAP(session: DiscoverySession): { d1: boolean; d2: boolean; d3: boolean; d4: boolean } {
  const answers = computeBAPAnswers(session);
  const c1 = getCheckpointScore(answers, 1);
  const c2 = getCheckpointScore(answers, 2);
  const c3 = getCheckpointScore(answers, 3);

  return {
    d1: c1 >= 7.5,   // Checkpoint 1 passed (max 10, threshold lowered from 9→7.5 since Q4 can auto-score maybe)
    d2: c2 >= 7.5,   // Checkpoint 2 passed (max 10)
    d3: c3 >= 5,     // Checkpoint 3 passed (max 7.5)
    d4: session.blueprint_approved,
  };
}

/** Compute validated forecast probability from 4D booleans */
export function computeValidatedForecast(session: DiscoverySession, repForecast: number): number {
  const d = compute4DFromBAP(session);
  let validated = repForecast;
  if (!d.d1) validated -= 20;
  if (!d.d2) validated -= 20;
  if (!d.d3) validated -= 20;
  if (!d.d4 && repForecast >= 80) validated -= 10;
  return Math.max(0, validated);
}

// ── CRUD ──

/** Create a new discovery session */
export function createDiscoverySession(
  repId: string | null,
  companyName: string,
  companyId: string | null
): DiscoverySession {
  const session: DiscoverySession = {
    id: `ds_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    rep_id: repId,
    company_name: companyName,
    company_id: companyId,
    persona: null,
    current_ats: null,
    industry: null,
    company_size: null,
    use_case: null,
    stakeholders: [],
    selected_pains: [],
    roi_inputs: { squareFootage: 50000 },
    roi_total: 0,
    alignment_checks: { urgent_priority: false, resources_insufficient: false, problems_solutions: false, roi_sufficient: false, right_solution: false },
    mutual_commitments: { executive_sponsor: false, dedicated_admin: false, training_completion: false },
    blueprint_approved: false,
    bap_answers: {},
    bap_notes: {},
    budget_confirmed: false,
    implementation_timeline: null,
    deal_value: 0,
    deal_stage: 'qualifying',
    next_action: '',
    next_steps_who: '',
    next_steps_what: '',
    next_steps_when: '',
    next_meeting_date: null,
    qa_completed: false,
    buyer_intent_validated: false,
    status: 'in_progress',
    created_at: new Date().toISOString(),
    completed_at: null,
    // MEDDPICC fields
    pain_narrative: '',
    success_metrics_text: '',
    decision_criteria: '',
    decision_process: '',
    paper_process: '',
    champion_name: '',
    champion_validation_notes: '',
    competitive_situation: '',
    compelling_event: '',
    economic_buyer_access: '',
    roi_summary_text: '',
    post_mortem_completed: false,
    post_mortem_symptoms: [],
    // Call Sheet persistence
    call_sheet_answers: {},
    call_sheet_checkpoints: {},
    call_sheet_checkpoint_reasons: {},
    call_sheet_persona: null,
    call_sheet_cost_of_problem: '',
    call_sheet_target_date: '',
    // Building Specs (Replaces CS Handoff)
    roof_square_footage: 0,
    membrane_type: '',
    year_built: 0,
    hvac_units_count: 0,
    building_use_case: '',
    roof_access_notes: '',
    prospect_has_agreed: false,
    prospect_agreement_notes: '',
    handoff_compliance_notes: '',
    // Deal Intelligence fields
    contract_end_date: '',
    competing_priorities: '',
    competitors_identified: '',
    competitors_count: 0,
    sentiment_score: 0,
    sentiment_gap: '',
    existing_tt_customer: false,
    budget_ballpark_requested: false,
    demo_prep_checklist: {},
    enabled_playbook_ids: undefined,
    granola_notes: [],
    rep_forecast: 50,
    // Gap Analysis fields
    open_roles_count: 0,
    lead_source: null,
    system_count: 0,
    division_count: 0,
    evaluation_stage: null,
    // Pricing
    pricing_region: 'us',
    pricing_vertical: 'non-staffing',
    pricing_employee_count: 0,
    pricing_base_price: 0,
    pricing_override: false,
    pricing_contract_term: 1,
    pricing_discount_pct: 0,
    pricing_add_ons: [],
    pricing_notes: '',
    pricing_price_cap_pct: undefined,
    pricing_promo_free_months: undefined,
    pricing_promo_label: undefined,
    // Deal Nuance fields
    objections: [],
  };

  const sessions = getAllSessions();
  sessions.push(session);
  saveSessions(sessions);

  // Metrics are logged explicitly by reps via CallNotesLog or Calendar quick-log

  return session;
}

/**
 * Creates a lightweight prospect card for the "Working" pre-pipeline stage.
 * Minimal data — just company, contact, channel, and notes.
 * Does NOT increment discovery_set (that happens when converted to D1).
 */
export function createProspectCard(
  repId: string,
  companyName: string,
  contactName: string,
  channel: 'phone' | 'email' | 'linkedin',
  notes?: string,
): DiscoverySession {
  const now = new Date().toISOString();
  const session = createDiscoverySession(repId, companyName, null);

  // Override to prospecting stage
  session.deal_stage = 'prospecting';
  session.champion_name = contactName;
  session.lead_source = channel === 'phone' ? 'outbound' : channel === 'email' ? 'outbound' : 'outbound';
  session.next_action = notes || '';
  session.last_call_date = now;

  // Store channel in a lightweight way
  (session as any).prospect_channel = channel;
  (session as any).prospect_contact = contactName;

  // Persist stage override
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
    saveSessions(sessions);
  }

  return session;
}

/** Convert a prospect card to a full D1 Discovery session */
export function convertProspectToDiscovery(sessionId: string): DiscoverySession | null {
  const sessions = getAllSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session || session.deal_stage !== 'prospecting') return null;

  session.deal_stage = 'qualifying';

  // Set milestone
  if (!session.milestones) {
    session.milestones = {} as any;
  }
  (session.milestones as any).discovery_set = {
    date: new Date().toISOString(),
    attendees: [],
  };

  const idx = sessions.findIndex(s => s.id === sessionId);
  sessions[idx] = session;
  saveSessions(sessions);

  // Metrics are logged explicitly by reps via CallNotesLog or Calendar quick-log

  return session;
}

/** Helper: increment a single weekly metric for the specific week */
export function incrementWeeklyMetric(repId: string, metric: string, amount: number = 1, dateStr?: string): void {
  const d = dateStr ? new Date(dateStr) : new Date();
  // Adjust for timezone differences if dateStr is YYYY-MM-DD
  if (dateStr && dateStr.length <= 10) {
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
  }
  const weekStart = getCurrentWeekMonday(d);
  const existing = useActualStore.getState().getActual(repId, weekStart);
  if (existing) {
    const { id: _id, updated_at: _ua, ...rest } = existing;
    (rest as any)[metric] = ((rest as any)[metric] || 0) + amount;
    useActualStore.getState().saveActual(rest);
  } else {
    useActualStore.getState().saveActual({
      rep_id: repId,
      week_start: weekStart,
      ...EMPTY_METRIC_ROW,
      [metric]: amount,
      notes: null,
      submitted_at: null,
    });
  }
}

/** Helper: decrement a single weekly metric for the specific week */
export function decrementWeeklyMetric(repId: string, metric: string, amount: number = 1, dateStr?: string): void {
  const d = dateStr ? new Date(dateStr) : new Date();
  if (dateStr && dateStr.length <= 10) {
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
  }
  const weekStart = getCurrentWeekMonday(d);
  const existing = useActualStore.getState().getActual(repId, weekStart);
  if (existing) {
    const { id: _id, updated_at: _ua, ...rest } = existing;
    (rest as any)[metric] = Math.max(0, ((rest as any)[metric] || 0) - amount);
    useActualStore.getState().saveActual(rest);
  }
}



/** Explicitly log a meeting metric for a specific date */
export function logDealMetric(repId: string, metric: string, dateStr: string): void {
  incrementWeeklyMetric(repId, metric, 1, dateStr);
}

/** Get a session by ID */
export function getSession(sessionId: string): DiscoverySession | null {
  return getAllSessions().find(s => s.id === sessionId) || null;
}

/**
 * Compute deal value from pricing builder fields.
 * Formula: (base_price × contract_term_years) × (1 - discount/100) + sum(included, non-waived add-ons)
 * This is the single source of truth for deal_value.
 */
export function computeDealValue(session: DiscoverySession): number {
  const base = session.pricing_base_price || 0;
  const term = session.pricing_contract_term || 1;
  const discountPct = session.pricing_discount_pct || 0;
  const addOns = session.pricing_add_ons || [];

  const baseTotal = base * term;
  const afterDiscount = baseTotal * (1 - discountPct / 100);
  const addOnTotal = addOns
    .filter(a => a.included && !a.waived)
    .reduce((sum, a) => sum + (a.price || 0), 0);

  return Math.round(afterDiscount + addOnTotal);
}

/** Get all sessions for a specific rep */
export function getSessionsForRep(repId: string): DiscoverySession[] {
  return getAllSessions()
    .filter(s => s.rep_id === repId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/** Get recent sessions (across all reps, for manager view) */
export function getRecentSessions(limit = 10): DiscoverySession[] {
  return getAllSessions()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

/** Get all sessions (for pipeline view) */
export function getAllDiscoverySessions(): DiscoverySession[] {
  return getAllSessions()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/** Persist a full session object to localStorage (replaces the session in the array) */
export const persistSession: (session: DiscoverySession) => void = (() => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let latest: DiscoverySession | null = null;
  return (session: DiscoverySession) => {
    latest = session;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      if (!latest) return;
      const sessions = getAllSessions();
      const idx = sessions.findIndex(s => s.id === latest!.id);
      if (idx === -1) return;
      sessions[idx] = latest;
      saveSessions(sessions);
      latest = null;
      timer = null;
    }, 300);
  };
})();

/** Update selected pains for a session */
export function updateSessionPains(sessionId: string, pains: string[]): void {
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return;
  sessions[idx].selected_pains = pains;
  saveSessions(sessions);
}

/** Update persona selection */
export function updateSessionPersona(sessionId: string, persona: string): void {
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return;
  sessions[idx].persona = persona;
  saveSessions(sessions);
}

/** Update current Provider provider */
export function updateSessionATS(sessionId: string, ats: string | null): void {
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return;
  sessions[idx].current_ats = ats;
  saveSessions(sessions);
}

/** Update industry */
export function updateSessionIndustry(sessionId: string, industry: string | null): void {
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return;
  sessions[idx].industry = industry;
  saveSessions(sessions);
}

/** Update company size */
export function updateSessionCompanySize(sessionId: string, size: string | null): void {
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return;
  sessions[idx].company_size = size;
  saveSessions(sessions);
}

/** Update use case */
export function updateSessionUseCase(sessionId: string, useCase: string | null): void {
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return;
  sessions[idx].use_case = useCase;
  saveSessions(sessions);
}

/** Update stakeholders */
export function updateSessionStakeholders(id: string, stakeholders: Stakeholder[]): void {
  const sessions = getAllSessions();
  const session = sessions.find(s => s.id === id);
  if (session) {
    session.stakeholders = stakeholders;
    saveSessions(sessions);
  }
}

export function updateSessionPillars(id: string, pillars: string[]): void {
  const sessions = getAllSessions();
  const session = sessions.find(s => s.id === id);
  if (session) {
    session.overridden_pillars = pillars;
    saveSessions(sessions);
  }
}

export function updateSessionLinkedPlaybooks(id: string, linked: Record<string, string[]>): void {
  const sessions = getAllSessions();
  const session = sessions.find(s => s.id === id);
  if (session) {
    session.linked_playbooks = linked;
    saveSessions(sessions);
  }
}

export function updateSessionROIConfig(id: string, enabledCategories: Record<string, boolean>, assumptions: Record<string, number>): void {
  const sessions = getAllSessions();
  const session = sessions.find(s => s.id === id);
  if (session) {
    session.roi_enabled_categories = enabledCategories;
    session.roi_assumptions = assumptions;
    saveSessions(sessions);
  }
}

export function updateSessionMAP(id: string, map: MAPMilestone[]): void {
  const sessions = getAllSessions();
  const session = sessions.find(s => s.id === id);
  if (session) {
    session.mutual_action_plan = map;
    saveSessions(sessions);
  }
}

export function addGranolaNoteToSession(sessionId: string, note: GranolaNote): void {
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return;
  if (!sessions[idx].granola_notes) sessions[idx].granola_notes = [];
  
  // Deduplication: If this note is tied to a specific meeting, remove any existing note for that same meeting.
  if (note.meeting_id) {
    sessions[idx].granola_notes = sessions[idx].granola_notes.filter(n => n.meeting_id !== note.meeting_id);
  }

  // check if already added by exact ID
  if (!sessions[idx].granola_notes.some(n => n.id === note.id)) {
    sessions[idx].granola_notes.push(note);
    saveSessions(sessions);
  }
}

export function removeGranolaNoteFromSession(sessionId: string, noteId: string): void {
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return;
  if (!sessions[idx].granola_notes) return;
  
  sessions[idx].granola_notes = sessions[idx].granola_notes.filter(n => n.id !== noteId);
  saveSessions(sessions);
}

export function updateSessionFromGranola(sessionId: string, updates: Partial<DiscoverySession>): void {
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return;
  
  const session = sessions[idx];
  
  const dateStr = updates.most_recent_update_at ? new Date(updates.most_recent_update_at).toLocaleDateString() : new Date().toLocaleDateString();

  // MEDDPICC Fields - Append rather than replace
  const meddpiccFields: Array<keyof DiscoverySession> = [
    'success_metrics_text', 'economic_buyer_access', 'decision_criteria',
    'decision_process', 'paper_process', 'pain_narrative', 
    'champion_name', 'competitive_situation',
  ];

  meddpiccFields.forEach(field => {
    if (updates[field]) {
      if (session[field] && String(session[field]).trim().length > 0) {
        // Append if existing value
        (session as any)[field] = `${session[field]}\n\n[Updated from call on ${dateStr}]: ${updates[field]}`;
      } else {
        // Set if empty
        (session as any)[field] = updates[field];
      }
    }
  });

  // Other String Fields - Only overwrite if longer
  const stringFields: Array<keyof DiscoverySession> = [
    'next_action', 'next_steps_who', 'next_steps_what', 'next_steps_when',
    'most_recent_update_source', 'most_recent_update_at',
  ];

  stringFields.forEach(field => {
    if (updates[field]) {
      const currentVal = session[field] ? String(session[field]) : '';
      const newVal = String(updates[field]);
      if (newVal.length > currentVal.length) {
        (session as any)[field] = updates[field];
      }
    }
  });

  // most_recent_update - Prepend
  if (updates.most_recent_update) {
    if (session.most_recent_update) {
      session.most_recent_update = `[${dateStr}]: ${updates.most_recent_update}\n\n${session.most_recent_update}`;
    } else {
      session.most_recent_update = `[${dateStr}]: ${updates.most_recent_update}`;
    }
  }

  // Merge BAP Answers
  if (updates.bap_answers) {
    session.bap_answers = {
      ...(session.bap_answers || {}),
      ...updates.bap_answers
    };
  }

  // Merge Call Sheet Answers
  if (updates.call_sheet_answers) {
    session.call_sheet_answers = {
      ...(session.call_sheet_answers || {}),
      ...updates.call_sheet_answers
    };
  }

  // Merge BAP Notes
  if (updates.bap_notes) {
    session.bap_notes = {
      ...(session.bap_notes || {}),
      ...updates.bap_notes
    };
  }

  // Deep merge call_sheet_answers (don't overwrite with empty values)
  if (updates.call_sheet_answers) {
    const existing = session.call_sheet_answers || {};
    const newAnswers = updates.call_sheet_answers;
    session.call_sheet_answers = { ...existing };
    for (const [key, val] of Object.entries(newAnswers)) {
      if (val !== undefined && val !== '') {
        session.call_sheet_answers[key] = val;
      }
    }
  }

  // Union merge selected_pains
  if (updates.selected_pains) {
    const existing = new Set(session.selected_pains || []);
    for (const pain of updates.selected_pains) {
      existing.add(pain);
    }
    session.selected_pains = Array.from(existing);
  }

  // Deep merge pain_quotes
  if (updates.pain_quotes) {
    session.pain_quotes = {
      ...(session.pain_quotes || {}),
      ...updates.pain_quotes
    };
  }

  // Room content overrides - only set if currently empty
  const roomContentFields: Array<keyof DiscoverySession> = [
    'executive_brief_override', 'diagnosis_current_approach_override', 
    'diagnosis_root_cause_override', 'diagnosis_bigger_problem_override'
  ];
  roomContentFields.forEach(field => {
    if (updates[field] && !session[field]) {
      (session as any)[field] = updates[field];
    }
  });

  // Append new MAP milestones (avoid duplicates by label)
  if (updates.mutual_action_plan && Array.isArray(updates.mutual_action_plan)) {
    if (!session.mutual_action_plan) session.mutual_action_plan = [];
    for (const milestone of updates.mutual_action_plan) {
      if (!session.mutual_action_plan.some(m => m.label.toLowerCase() === milestone.label.toLowerCase())) {
        session.mutual_action_plan.push(milestone);
      }
    }
    // Also automatically enable MAP in the room if we just added milestones
    if (session.mutual_action_plan.length > 0) {
      session.room_enable_map = true;
    }
  }

  saveSessions(sessions);
}

export function updateRoomSettings(id: string, settings: Partial<Pick<DiscoverySession, 'room_enable_kill_sheet' | 'room_enable_map' | 'room_roi_cost_per_hire' | 'room_roi_time_to_fill' | 'room_roi_open_reqs'>>): void {
  const sessions = getAllSessions();
  const session = sessions.find(s => s.id === id);
  if (session) {
    if (settings.room_enable_kill_sheet !== undefined) session.room_enable_kill_sheet = settings.room_enable_kill_sheet;
    if (settings.room_enable_map !== undefined) session.room_enable_map = settings.room_enable_map;
    if (settings.room_roi_cost_per_hire !== undefined) session.room_roi_cost_per_hire = settings.room_roi_cost_per_hire;
    if (settings.room_roi_time_to_fill !== undefined) session.room_roi_time_to_fill = settings.room_roi_time_to_fill;
    if (settings.room_roi_open_reqs !== undefined) session.room_roi_open_reqs = settings.room_roi_open_reqs;
    saveSessions(sessions);
  }
}

/** Update Deal Milestones and auto-sync to global Actuals Store */
export function updateSessionMilestone(
  sessionId: string, 
  milestoneKey: keyof NonNullable<DiscoverySession['milestones']>, 
  payload: { date: string; attendees: string[] } | null
): void {
  const sessions = getAllSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return;
  
  if (!session.milestones) {
    session.milestones = {
      discovery_set: null,
      discovery_held: null,
      demo_held: null,
      proposal_sent: null,
    };
  }

  const previousPayload = session.milestones[milestoneKey];
  const previousDate = previousPayload?.date;
  
  session.milestones[milestoneKey] = payload;
  
  saveSessions(sessions);

  // Sync back to actualStore if rep_id is present
  if (session.rep_id) {
    const store = useActualStore.getState();
    
    // If it was checked previously, decrement from the old week
    if (previousDate) {
      const oldWeek = getCurrentWeekMonday(new Date(previousDate));
      const oldActual = store.getActual(session.rep_id, oldWeek) || { rep_id: session.rep_id, week_start: oldWeek, notes: null, submitted_at: null, ...EMPTY_METRIC_ROW };
      store.saveActual({
        ...oldActual,
        [milestoneKey]: Math.max(0, (oldActual[milestoneKey as MetricKey] ?? 0) - 1)
      });
    }

    // If it's checked now, increment the new week
    if (payload?.date) {
      const newWeek = getCurrentWeekMonday(new Date(payload.date));
      const newActual = store.getActual(session.rep_id, newWeek) || { rep_id: session.rep_id, week_start: newWeek, notes: null, submitted_at: null, ...EMPTY_METRIC_ROW };
      store.saveActual({
        ...newActual,
        [milestoneKey]: (newActual[milestoneKey as MetricKey] ?? 0) + 1
      });
    }
  }
}

/** Add a custom meeting to the timeline and increment global metric */
export function addCustomMeeting(sessionId: string, meeting: CustomMeeting): void {
  const sessions = getAllSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return;
  
  if (!session.custom_meetings) session.custom_meetings = [];
  session.custom_meetings.push(meeting);
  saveSessions(sessions);

  if (session.rep_id) {
    const store = useActualStore.getState();
    const week = getCurrentWeekMonday(new Date(meeting.date));
    const actual = store.getActual(session.rep_id, week) || { rep_id: session.rep_id, week_start: week, notes: null, submitted_at: null, ...EMPTY_METRIC_ROW };
    store.saveActual({
      ...actual,
      [meeting.type]: (actual[meeting.type as keyof typeof actual] as number ?? 0) + 1
    });
  }
}

/** Update a custom meeting, recalculating metrics if the date or type changed */
export function updateCustomMeeting(sessionId: string, meetingId: string, payload: Partial<CustomMeeting>): void {
  const sessions = getAllSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session || !session.custom_meetings) return;
  
  const idx = session.custom_meetings.findIndex(m => m.id === meetingId);
  if (idx === -1) return;
  
  const oldMeeting = session.custom_meetings[idx];
  session.custom_meetings[idx] = { ...oldMeeting, ...payload };
  saveSessions(sessions);

  const dateChanged = payload.date && payload.date !== oldMeeting.date;
  const typeChanged = payload.type && payload.type !== oldMeeting.type;

  if ((dateChanged || typeChanged) && session.rep_id) {
    const store = useActualStore.getState();
    
    // Decrement old
    const oldWeek = getCurrentWeekMonday(new Date(oldMeeting.date));
    const oldActual = store.getActual(session.rep_id, oldWeek) || { rep_id: session.rep_id, week_start: oldWeek, notes: null, submitted_at: null, ...EMPTY_METRIC_ROW };
    store.saveActual({
      ...oldActual,
      [oldMeeting.type]: Math.max(0, (oldActual[oldMeeting.type as keyof typeof oldActual] as number ?? 0) - 1)
    });

    // Increment new
    const newDate = payload.date || oldMeeting.date;
    const newType = payload.type || oldMeeting.type;
    const newWeek = getCurrentWeekMonday(new Date(newDate));
    const newActual = store.getActual(session.rep_id, newWeek) || { rep_id: session.rep_id, week_start: newWeek, notes: null, submitted_at: null, ...EMPTY_METRIC_ROW };
    store.saveActual({
      ...newActual,
      [newType]: (newActual[newType as keyof typeof newActual] as number ?? 0) + 1
    });
  }
}

/** Delete a custom meeting and decrement global metric */
export function deleteCustomMeeting(sessionId: string, meetingId: string): void {
  const sessions = getAllSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session || !session.custom_meetings) return;
  
  const idx = session.custom_meetings.findIndex(m => m.id === meetingId);
  if (idx === -1) return;
  
  const meeting = session.custom_meetings[idx];
  session.custom_meetings.splice(idx, 1);
  saveSessions(sessions);

  if (session.rep_id) {
    const store = useActualStore.getState();
    const week = getCurrentWeekMonday(new Date(meeting.date));
    const actual = store.getActual(session.rep_id, week) || { rep_id: session.rep_id, week_start: week, notes: null, submitted_at: null, ...EMPTY_METRIC_ROW };
    store.saveActual({
      ...actual,
      [meeting.type]: Math.max(0, (actual[meeting.type as keyof typeof actual] as number ?? 0) - 1)
    });
  }
}

/** Update ROI inputs and computed total */
export function updateSessionROI(sessionId: string, inputs: ROIInputs, total: number): void {
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return;
  sessions[idx].roi_inputs = inputs;
  sessions[idx].roi_total = total;
  saveSessions(sessions);
}

/** Update alignment checkboxes */
export function updateSessionAlignment(
  sessionId: string, 
  checks: AlignmentChecks, 
  commitments?: MutualCommitments
): void {
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return;
  sessions[idx].alignment_checks = checks;
  if (commitments) {
    sessions[idx].mutual_commitments = commitments;
  }
  saveSessions(sessions);
}

/** Update manual BAP answers (for the 5 questions that can't auto-score) */
export function updateBAPAnswer(sessionId: string, questionId: string, answer: BAPAnswer): void {
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return;
  sessions[idx].bap_answers[questionId] = answer;
  saveSessions(sessions);
}

/** Update deal stage */
export function updateDealStage(sessionId: string, stage: string): void {
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return;
  sessions[idx].deal_stage = stage;
  saveSessions(sessions);
}

/** Update deal value */
export function updateDealValue(sessionId: string, value: number): void {
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return;
  sessions[idx].deal_value = value;
  saveSessions(sessions);
}

/** Update the rep's probability forecast for a deal (0-100) */
export function updateRepForecast(sessionId: string, forecast: number): void {
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return;
  sessions[idx].rep_forecast = Math.max(0, Math.min(100, forecast));
  saveSessions(sessions);
}

/** Approve the blueprint — marks session as approved and increments rep's weekly discovery_held */
export function approveBlueprint(sessionId: string): DiscoverySession | null {
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return null;

  sessions[idx].blueprint_approved = true;
  sessions[idx].status = 'approved';
  sessions[idx].deal_stage = 'signing';
  sessions[idx].completed_at = new Date().toISOString();
  saveSessions(sessions);



  return sessions[idx];
}

/** Mark session as completed (without full approval) */
export function completeSession(sessionId: string): void {
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return;
  sessions[idx].status = 'completed';
  sessions[idx].completed_at = new Date().toISOString();
  saveSessions(sessions);
}

/** Get session counts for a rep (for dashboard stats) */
export function getSessionStats(repId: string): {
  total: number;
  in_progress: number;
  completed: number;
  approved: number;
  total_roi: number;
  total_pipeline: number;
} {
  const sessions = getSessionsForRep(repId);
  return {
    total: sessions.length,
    in_progress: sessions.filter(s => s.status === 'in_progress').length,
    completed: sessions.filter(s => s.status === 'completed').length,
    approved: sessions.filter(s => s.status === 'approved').length,
    total_roi: sessions.reduce((sum, s) => sum + s.roi_total, 0),
    total_pipeline: sessions.reduce((sum, s) => sum + s.deal_value, 0),
  };
}

// ── MEDDPICC Field CRUD ──

/** Update a single MEDDPICC text field */
export function updateMEDDPICCField(
  sessionId: string,
  field: 'pain_narrative' | 'success_metrics_text' | 'decision_criteria' | 'decision_process' | 'paper_process' | 'champion_name' | 'champion_validation_notes' | 'competitive_situation' | 'economic_buyer_access' | 'roi_summary_text',
  value: string
): void {
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return;
  sessions[idx][field] = value;
  saveSessions(sessions);
}

/** Score a single MEDDPICC field: 'green' (filled, ≥30 chars), 'yellow' (partially filled), 'red' (empty) */
export type MEDDPICCStatus = 'green' | 'yellow' | 'red';

export interface MEDDPICCScore {
  metrics: MEDDPICCStatus;
  economic_buyer: MEDDPICCStatus;
  decision_criteria: MEDDPICCStatus;
  decision_process: MEDDPICCStatus;
  paper_process: MEDDPICCStatus;
  identify_pain: MEDDPICCStatus;
  champion: MEDDPICCStatus;
  competition: MEDDPICCStatus;
  compelling_event: MEDDPICCStatus;
  green: number;
  yellow: number;
  red: number;
}

function scoreField(value: string | undefined | null): MEDDPICCStatus {
  const v = (value ?? '').trim();
  if (v.length >= 30) return 'green';
  if (v.length > 0) return 'yellow';
  return 'red';
}

/** Score all 5 MEDDPICC fields that map to Salesforce */
export function scoreMEDDPICC(session: DiscoverySession): MEDDPICCScore {
  const metrics = scoreField(session.success_metrics_text);
  const economic_buyer = scoreField(session.economic_buyer_access);
  const decision_criteria = scoreField(session.decision_criteria);
  const decision_process = scoreField(session.decision_process);
  const paper_process = scoreField(session.paper_process);
  const identify_pain = scoreField(session.pain_narrative);
  const championText = [session.champion_name, session.champion_validation_notes].filter(Boolean).join(' ');
  const champion = scoreField(championText);
  const competition = scoreField(session.competitive_situation);
  const compelling_event = scoreField(session.compelling_event);

  const statuses = [metrics, economic_buyer, decision_criteria, decision_process, paper_process, identify_pain, champion, competition, compelling_event];
  return {
    metrics,
    economic_buyer,
    decision_criteria,
    decision_process,
    paper_process,
    identify_pain,
    champion,
    competition,
    compelling_event,
    green: statuses.filter(s => s === 'green').length,
    yellow: statuses.filter(s => s === 'yellow').length,
    red: statuses.filter(s => s === 'red').length,
  };
}

/** Generate a formatted MEDDPICC summary for copying to Salesforce (all fields) */
export function generateMEDDPICCSummary(session: DiscoverySession): string {
  const lines: string[] = [];
  lines.push('── MEDDPICC Summary ──');
  lines.push('');
  lines.push(`Metrics: ${session.success_metrics_text || '(not filled)'}`);
  lines.push('');
  lines.push(`Economic Buyer: ${session.economic_buyer_access || '(not filled)'}`);
  lines.push('');
  lines.push(`Decision Criteria: ${session.decision_criteria || '(not filled)'}`);
  lines.push('');
  lines.push(`Decision Process: ${session.decision_process || '(not filled)'}`);
  lines.push('');
  lines.push(`Paper Process: ${session.paper_process || '(not filled)'}`);
  lines.push('');
  lines.push(`Identify Pain: ${session.pain_narrative || '(not filled)'}`);
  lines.push('');
  const championText = [session.champion_name, session.champion_validation_notes].filter(Boolean).join(' — ');
  lines.push(`Champion: ${championText || '(not filled)'}`);
  lines.push('');
  lines.push(`Competition: ${session.competitive_situation || '(not filled)'}`);
  lines.push('');
  lines.push(`Compelling Event: ${session.compelling_event || '(not filled)'}`);
  return lines.join('\n');
}

/** Update Discovery Call Sheet data */
export function updateCallSheetData(
  sessionId: string,
  data: {
    answers?: Record<string, string | string[]>;
    checkpoints?: Record<string, boolean>;
    persona?: string | null;
    costOfProblem?: string;
    targetDate?: string;
  }
): void {
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return;
  if (data.answers !== undefined) sessions[idx].call_sheet_answers = data.answers;
  if (data.checkpoints !== undefined) sessions[idx].call_sheet_checkpoints = data.checkpoints;
  if (data.persona !== undefined) sessions[idx].call_sheet_persona = data.persona;
  if (data.costOfProblem !== undefined) sessions[idx].call_sheet_cost_of_problem = data.costOfProblem;
  if (data.targetDate !== undefined) sessions[idx].call_sheet_target_date = data.targetDate;
  saveSessions(sessions);
}

/** All keys that belong to the CS Handoff section */
export type HandoffFieldKey = Extract<keyof DiscoverySession, `handoff_${string}`>;

/** Update CS Handoff fields (bulk partial update) */
export function updateHandoffFields(
  sessionId: string,
  data: Partial<Pick<DiscoverySession, HandoffFieldKey>>
): void {
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return;
  Object.assign(sessions[idx], data);
  saveSessions(sessions);
}

/** Compute handoff readiness score (0-100) based on how many handoff fields are filled */
export function computeHandoffReadiness(session: DiscoverySession): { score: number; filled: number; total: number; sections: Record<string, { filled: number; total: number }> } {
  const check = (val: any): boolean => {
    if (typeof val === 'string') return val.trim().length > 0;
    if (typeof val === 'number') return val > 0;
    if (typeof val === 'boolean') return true; // booleans are always "set"
    if (Array.isArray(val)) return val.length > 0;
    return false;
  };

  const sections: Record<string, { fields: HandoffFieldKey[]; label: string }> = {
    tech: { label: 'Technical Environment', fields: ['handoff_current_hris', 'handoff_calendar_system', 'handoff_sso_provider'] },
    brand: { label: 'Career Site & Brand', fields: ['handoff_current_career_site_url', 'handoff_custom_domain', 'handoff_brand_maturity'] },
    org: { label: 'Org Structure', fields: ['handoff_department_count', 'handoff_location_count', 'handoff_active_hiring_managers', 'handoff_active_recruiters'] },
    data: { label: 'Data Migration', fields: ['handoff_active_jobs_count', 'handoff_candidate_count_estimate'] },
    integrations: { label: 'Integrations', fields: ['handoff_job_boards', 'handoff_hris_integration'] },
    golive: { label: 'Go-Live', fields: ['handoff_target_go_live_date', 'handoff_launch_type'] },
    training: { label: 'Training', fields: ['handoff_users_to_train', 'handoff_training_format'] },
    contacts: { label: 'Contacts', fields: ['handoff_primary_contact_email', 'handoff_it_contact_email'] },
    kpis: { label: 'Success KPIs', fields: ['handoff_target_time_to_hire', 'handoff_target_adoption_rate'] },
    compliance: { label: 'Compliance', fields: ['handoff_compliance_notes'] },
  };

  let filled = 0;
  let total = 0;
  const sectionResults: Record<string, { filled: number; total: number }> = {};

  for (const [key, { fields }] of Object.entries(sections)) {
    let sFilled = 0;
    for (const field of fields) {
      total++;
      if (check(session[field])) {
        filled++;
        sFilled++;
      }
    }
    sectionResults[key] = { filled: sFilled, total: fields.length };
  }

  return { score: total > 0 ? Math.round((filled / total) * 100) : 0, filled, total, sections: sectionResults };
}

// ── Pain label mapping for human-readable output ──

const PAIN_LABELS: Record<string, string> = {
  'slow-time-to-hire': 'Slow Time to Hire',
  'poor-candidate-experience': 'Poor Candidate Experience',
  'high-cost-per-hire': 'High Cost Per Hire',
  'outdated-career-site': 'Outdated Career Site',
  'locked-out-managers': 'Managers Locked Out of Process',
  'no-pipeline-visibility': 'No Pipeline Visibility',
  'manual-screening': 'Manual Screening Overhead',
  'weak-talent-pools': 'Weak Talent Pools',
  'no-content-hub': 'No Content Hub / Employer Brand',
  'multi-language-gaps': 'Multi-Language Gaps',
  'scorecard-friction': 'Scorecard / Interview Friction',
  'no-mobile-feedback': 'No Mobile Feedback',
};


export function updatePostMortemFields(
  sessionId: string,
  updates: Pick<DiscoverySession, 'post_mortem_completed' | 'post_mortem_fatality' | 'post_mortem_symptoms' | 'post_mortem_pathway'>
): void {
  const sessions = getAllSessions();
  const i = sessions.findIndex(s => s.id === sessionId);
  if (i === -1) return;
  
  sessions[i] = { ...sessions[i], ...updates };
  saveSessions(sessions);
}
