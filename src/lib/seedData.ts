import type { DiscoverySession } from './discoveryDatabase';

export function seedDiscoverySessions(): DiscoverySession[] {
  const baseSession = {
    rep_id: 'rep-rw',
    persona: 'property-manager',
    industry: 'Commercial Real Estate',
    membrane_type: 'TPO',
    building_use_case: 'Retail / Shopping Center',
    selected_pains: ['unbudgeted-capex', 'membrane-degradation'],
    roi_inputs: {
      team_size: 5,
      avg_salary: 85000,
      hours_spent: 15,
      time_to_hire: 45,
      cost_per_hire: 4500,
      open_reqs: 20
    },
    roi_total: 0,
    blueprint_approved: false,
    alignment_checks: {
      urgent_priority: false,
      resources_insufficient: false,
      problems_solutions: false,
      roi_sufficient: false,
      right_solution: false
    },
    mutual_commitments: {
      executive_sponsor: false,
      dedicated_admin: false,
      training_completion: false
    },
    bap_answers: {},
    bap_notes: {},
    budget_confirmed: false,
    implementation_timeline: '2026-08-01',
    next_action: 'schedule_meeting',
    next_steps_who: 'John Doe',
    next_steps_what: 'Review Property Risk Assessment',
    next_steps_when: '2026-07-15',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    post_mortem_completed: false,
    post_mortem_fatality: null,
    post_mortem_symptoms: [],
    post_mortem_pathway: null,
    call_sheet_answers: {},
    call_sheet_checkpoints: {}
  };

  return [
    {
      ...baseSession,
      id: 'opp-roofing-cushman',
      company_name: 'Cushman & Wakefield',
      company_id: 'cushman',
      deal_value: 3400000,
      deal_stage: 'investigating',
      roof_health_score: 38,
      roof_square_footage: 1500000,
      membrane_type: 'Mixed (TPO/EPDM)',
      selected_pains: ['unbudgeted-capex', 'roof-leaks', 'tenant-complaints']
    },
    {
      ...baseSession,
      id: 'opp-roofing-001',
      company_name: 'Simon Property Group',
      company_id: 'simon-prop',
      deal_value: 1200000,
      deal_stage: 'investigating',
      roof_health_score: 42,
      roof_square_footage: 250000,
      membrane_type: 'Built-Up (BUR)'
    },
    {
      ...baseSession,
      id: 'opp-roofing-002',
      company_name: 'Prologis Warehousing',
      company_id: 'prologis',
      deal_value: 850000,
      deal_stage: 'evaluating',
      roof_health_score: 55,
      roof_square_footage: 400000,
      membrane_type: 'TPO'
    },
    {
      ...baseSession,
      id: 'opp-roofing-003',
      company_name: 'CBRE Managed Properties',
      company_id: 'cbre',
      deal_value: 450000,
      deal_stage: 'qualifying',
      roof_health_score: 72,
      roof_square_footage: 150000,
      membrane_type: 'EPDM'
    },
    {
      ...baseSession,
      id: 'opp-roofing-004',
      company_name: 'Brookfield Properties',
      company_id: 'brookfield',
      deal_value: 2200000,
      deal_stage: 'negotiating',
      roof_health_score: 38,
      roof_square_footage: 600000,
      membrane_type: 'PVC'
    },
    {
      ...baseSession,
      id: 'opp-roofing-005',
      company_name: 'JLL Corporate HQ',
      company_id: 'jll',
      deal_value: 300000,
      deal_stage: 'contracting',
      roof_health_score: 85,
      roof_square_footage: 100000,
      membrane_type: 'Metal'
    }
  ] as DiscoverySession[];
}

export function loadSeedData(): number {
  const STORAGE_KEY = 'scc_discovery_sessions_v3';
  localStorage.removeItem(STORAGE_KEY);
  const sessions = seedDiscoverySessions();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  return sessions.length;
}
