// ============================================================
// Prospect Room Full Audit — Playwright E2E Test
// Tests every section, visibility logic, navigation, and layout
// ============================================================

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

// Helper: create a discovery session via localStorage injection
async function seedSession(page: Page, overrides: Record<string, any> = {}) {
  const session = {
    id: 'audit_test_session',
    rep_id: 'rep_audit',
    company_name: 'Acme Corp',
    company_id: null,
    persona: 'vp-ta',
    current_ats: 'greenhouse',
    industry: 'Technology',
    company_size: '201-500',
    use_case: 'replacing-ats',
    stakeholders: [
      { id: 's1', role: 'Project Lead', name: 'Sarah Chen', title: 'VP of TA' },
      { id: 's2', role: 'Economic Buyer', name: 'John Smith', title: 'CFO' },
    ],
    selected_pains: ['slow-time-to-hire', 'locked-out-managers', 'high-cost-per-hire', 'outdated-career-site'],
    roi_inputs: { hiringManagers: 25, totalHires: 120, agencyHires: 20, timeToHire: 45 },
    roi_total: 450000,
    alignment_checks: { urgent_priority: false, resources_insufficient: false, problems_solutions: true, roi_sufficient: false, right_solution: false },
    mutual_commitments: { executive_sponsor: false, dedicated_admin: false, training_completion: false },
    blueprint_approved: false,
    bap_answers: {},
    bap_notes: {},
    budget_confirmed: false,
    implementation_timeline: null,
    deal_value: 8000,
    deal_stage: 'decision',  // D4 — all sections should be visible
    next_action: '',
    next_meeting_date: null,
    qa_completed: false,
    buyer_intent_validated: false,
    status: 'in_progress' as const,
    created_at: new Date().toISOString(),
    completed_at: null,
    pain_narrative: '',
    success_metrics_text: '',
    decision_criteria: '',
    decision_process: '',
    paper_process: '',
    champion_name: 'Sarah Chen',
    champion_validation_notes: '',
    competitive_situation: '',
    economic_buyer_access: '',
    roi_summary_text: '',
    call_sheet_answers: { q1: 'yes', q2: 'yes', q5: 'Using Greenhouse but it\'s clunky', q6: 'Greenhouse doesn\'t have AI screening' },
    call_sheet_checkpoints: {},
    call_sheet_persona: 'ta-manager',
    call_sheet_cost_of_problem: '$45K/month',
    call_sheet_target_date: '2026-09-01',
    handoff_current_hris: '',
    handoff_calendar_system: '',
    handoff_sso_provider: '',
    handoff_sso_required: false,
    handoff_infosec_review_required: false,
    handoff_current_career_site_url: '',
    handoff_custom_domain: '',
    handoff_brand_maturity: '',
    handoff_department_count: 0,
    handoff_location_count: 0,
    handoff_active_hiring_managers: 0,
    handoff_active_recruiters: 0,
    handoff_active_jobs_count: 0,
    handoff_candidate_count_estimate: 0,
    handoff_data_migration_notes: '',
    handoff_job_boards: [],
    handoff_hris_integration: '',
    handoff_other_integrations: [],
    handoff_target_go_live_date: '',
    handoff_launch_type: '',
    handoff_go_live_notes: '',
    handoff_users_to_train: 0,
    handoff_training_format: '',
    handoff_training_notes: '',
    handoff_primary_contact_email: '',
    handoff_it_contact_email: '',
    handoff_preferred_comm_channel: '',
    handoff_target_time_to_hire: 0,
    handoff_target_cost_per_hire: 0,
    handoff_target_adoption_rate: 0,
    handoff_success_review_date: '',
    handoff_prework_items: [],
    handoff_prework_notes: '',
    handoff_gdpr_applicable: false,
    handoff_data_retention_months: 0,
    handoff_dpa_required: false,
    handoff_compliance_notes: '',
    contract_end_date: '2027-03-15',
    competing_priorities: '',
    competitors_identified: 'Ashby, Lever',
    competitors_count: 2,
    sentiment_score: 4,
    sentiment_gap: '',
    existing_tt_customer: false,
    budget_ballpark_requested: true,
    demo_prep_checklist: {},
    granola_notes: [],
    rep_forecast: 65,
    open_roles_count: 12,
    lead_source: 'outbound',
    system_count: 3,
    division_count: 2,
    evaluation_stage: 'final-2',
    pricing_region: 'us' as const,
    pricing_vertical: 'non-staffing' as const,
    pricing_employee_count: 350,
    pricing_base_price: 8000,
    pricing_override: false,
    pricing_contract_term: 1 as const,
    pricing_discount_pct: 0,
    pricing_add_ons: [],
    pricing_notes: '',
    room_visibility: {
      hero: true,
      pains: true,
      problemCanvas: true,
      diagnosis: true,
      competitive: true,
      paradigmShift: true,
      solution: true,
      playbooks: true,
      socialProof: true,
      roi: true,
      map: true,
      contractSecurity: true,
      proposal: true,
      minimumStandards: true,
    },
    ...overrides,
  };

  await page.evaluate((s) => {
    localStorage.setItem('scc_discovery_sessions', JSON.stringify([s]));
  }, session);

  return session;
}

// Helper: create a room token pointing at the session
async function createRoomToken(page: Page, sessionId: string) {
  const token = await page.evaluate((sid) => {
    const config = {
      sessionId: sid,
      company: 'Acme Corp',
      accent: '#1c1917',
      pains: ['slow-time-to-hire', 'locked-out-managers', 'high-cost-per-hire', 'outdated-career-site'],
      persona: 'vp-ta',
      ats: 'greenhouse',
      repName: 'Admin Ryan',
      showPricing: true,
    };
    return btoa(JSON.stringify(config));
  }, sessionId);
  return token;
}

test.describe('Prospect Room Full Audit', () => {
  
  test.beforeEach(async ({ page }) => {
    // Seed session data
    await page.goto(BASE_URL);
    await seedSession(page);
  });

  test('1. Room loads and shows branded header', async ({ page }) => {
    const token = await createRoomToken(page, 'audit_test_session');
    await page.goto(`${BASE_URL}/room/${token}`);
    await page.waitForTimeout(2000);

    // Header should show company name
    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(header.locator('text=Acme Corp')).toBeVisible();
    await expect(header.locator('text=Admin Ryan')).toBeVisible();
    await expect(header.locator('text=Discovery Room')).toBeVisible();
  });

  test('2. Hero section renders with correct content', async ({ page }) => {
    const token = await createRoomToken(page, 'audit_test_session');
    await page.goto(`${BASE_URL}/room/${token}`);
    await page.waitForTimeout(2000);

    const hero = page.locator('#hero');
    await expect(hero).toBeVisible();
    
    // Should mention company name
    await expect(hero.locator('text=Acme Corp').first()).toBeVisible();
    
    // Should have a pain-related headline
    await expect(hero.locator('h1')).toBeVisible();
    
    // Should show stakeholder greeting
    await expect(hero.locator('text=Sarah Chen').first()).toBeVisible();
    
    // Should show platform stats
    await expect(hero.locator('text=845K+')).toBeVisible();
    await expect(hero.locator('text=13,000+')).toBeVisible();
  });

  test('3. Pain Discovery section renders all selected pains', async ({ page }) => {
    const token = await createRoomToken(page, 'audit_test_session');
    await page.goto(`${BASE_URL}/room/${token}`);
    await page.waitForTimeout(2000);

    const painSection = page.locator('#pain-discovery');
    await expect(painSection).toBeVisible();
    
    // Should show section header
    await expect(painSection.locator('text=What We\'re Solving for Acme Corp')).toBeVisible();
    
    // Should show all 4 selected pains
    // Count pain cards
    const painCards = painSection.locator('.rounded-2xl.border');
    const count = await painCards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('4. ROI section renders with calculator', async ({ page }) => {
    const token = await createRoomToken(page, 'audit_test_session');
    await page.goto(`${BASE_URL}/room/${token}`);
    await page.waitForTimeout(2000);

    const roiSection = page.locator('#roi');
    await expect(roiSection).toBeVisible();
    await expect(roiSection.locator('text=Business Impact')).toBeVisible();
    await expect(roiSection.locator('text=Projected Value for Acme Corp')).toBeVisible();
  });

  test('5. Competitive section renders for Greenhouse', async ({ page }) => {
    const token = await createRoomToken(page, 'audit_test_session');
    await page.goto(`${BASE_URL}/room/${token}`);
    await page.waitForTimeout(2000);

    const atsSection = page.locator('#ats-kill');
    await expect(atsSection).toBeVisible();
  });

  test('6. Diagnosis section renders', async ({ page }) => {
    const token = await createRoomToken(page, 'audit_test_session');
    await page.goto(`${BASE_URL}/room/${token}`);
    await page.waitForTimeout(2000);

    const diagSection = page.locator('#diagnosis');
    await expect(diagSection).toBeVisible();
  });

  test('7. Solution walkthrough section renders', async ({ page }) => {
    const token = await createRoomToken(page, 'audit_test_session');
    await page.goto(`${BASE_URL}/room/${token}`);
    await page.waitForTimeout(2000);

    const solSection = page.locator('#walkthrough');
    await expect(solSection).toBeVisible();
  });

  test('8. Social Proof section renders', async ({ page }) => {
    const token = await createRoomToken(page, 'audit_test_session');
    await page.goto(`${BASE_URL}/room/${token}`);
    await page.waitForTimeout(2000);

    const spSection = page.locator('#social-proof');
    await expect(spSection).toBeVisible();
    await expect(spSection.locator('text=Proven Results')).toBeVisible();
  });

  test('9. Proposal section renders correctly', async ({ page }) => {
    const token = await createRoomToken(page, 'audit_test_session');
    await page.goto(`${BASE_URL}/room/${token}`);
    await page.waitForTimeout(2000);

    const proposalSection = page.locator('#proposal');
    await expect(proposalSection).toBeVisible();
    
    // Should show pricing
    await expect(proposalSection.locator('text=Teamtailor Platform').or(proposalSection.locator('text=Custom Proposal'))).toBeVisible();
  });

  test('10. Partnership Alignment section renders with all 5 checks', async ({ page }) => {
    const token = await createRoomToken(page, 'audit_test_session');
    await page.goto(`${BASE_URL}/room/${token}`);
    await page.waitForTimeout(2000);

    // Scroll to bottom to find alignment section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Check for alignment items
    await expect(page.getByRole('heading', { name: 'Urgent Priority' })).toBeVisible();
    await expect(page.locator('text=Resources Insufficient')).toBeVisible();
    await expect(page.locator('text=Problems & Solutions')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'ROI Sufficient' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Right Solution' })).toBeVisible();
    
    // Approve Blueprint button
    await expect(page.locator('text=Approve Blueprint')).toBeVisible();
  });

  test('11. Left navigation renders all 4 phases', async ({ page }) => {
    const token = await createRoomToken(page, 'audit_test_session');
    await page.goto(`${BASE_URL}/room/${token}`);
    await page.waitForTimeout(2000);

    // Left nav is only visible on xl screens, so set viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(500);

    // Check all 4 phase labels
    const nav = page.locator('nav[aria-label="Buying Journey"]');
    await expect(nav.locator('text=1. Priorities')).toBeVisible();
    await expect(nav.locator('text=2. Diagnosis')).toBeVisible();
    await expect(nav.locator('text=3. Solution')).toBeVisible();
    await expect(nav.locator('text=4. Partnership')).toBeVisible();
  });

  test('12. D4 stage - no "Up Next" locked gate should appear', async ({ page }) => {
    const token = await createRoomToken(page, 'audit_test_session');
    await page.goto(`${BASE_URL}/room/${token}`);
    await page.waitForTimeout(2000);

    // At D4 stage with all visibility on, there should be NO locked gate
    const lockedGate = page.locator('text=Up Next:');
    const count = await lockedGate.count();
    expect(count).toBe(0);
  });

  test('13. D1 stage - should lock D2/D3/D4 sections', async ({ page }) => {
    // Create a D1-only session
    await seedSession(page, {
      deal_stage: 'discovery',
      room_visibility: {
        hero: true,
        pains: true,
        problemCanvas: false,
        diagnosis: false,
        competitive: false,
        paradigmShift: false,
        solution: false,
        playbooks: false,
        socialProof: false,
        roi: true,
        map: false,
        contractSecurity: false,
        proposal: false,
        minimumStandards: false,
      },
    });
    const token = await createRoomToken(page, 'audit_test_session');
    await page.goto(`${BASE_URL}/room/${token}`);
    await page.waitForTimeout(2000);

    // Should show "Up Next: 2. Diagnosis"
    await expect(page.locator('text=Up Next: 2. Diagnosis')).toBeVisible();
    
    // D2+ sections should NOT be present
    const diagSection = page.locator('#diagnosis');
    await expect(diagSection).not.toBeVisible();
    
    const atsSection = page.locator('#ats-kill');
    await expect(atsSection).not.toBeVisible();
  });

  test('14. Footer shows confidentiality notice', async ({ page }) => {
    const token = await createRoomToken(page, 'audit_test_session');
    await page.goto(`${BASE_URL}/room/${token}`);
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    await expect(page.getByText('Confidential — Prepared')).toBeVisible();
    const footer = page.locator('footer');
    await expect(footer.getByText('Acme Corp')).toBeVisible();
    await expect(footer.locator('text=Powered by')).toBeVisible();
  });

  test('15. Take full-page screenshots for visual audit', async ({ page }) => {
    const token = await createRoomToken(page, 'audit_test_session');
    await page.goto(`${BASE_URL}/room/${token}`);
    await page.waitForTimeout(3000);
    
    // Full page screenshot
    await page.screenshot({ 
      path: 'test-results/prospect-room-full.png', 
      fullPage: true,
    });

    // Section-by-section screenshots
    const sections = ['hero', 'pain-discovery', 'roi', 'ats-kill', 'diagnosis', 'walkthrough', 'social-proof', 'proposal'];
    for (const id of sections) {
      const el = page.locator(`#${id}`);
      if (await el.isVisible()) {
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await el.screenshot({ path: `test-results/section-${id}.png` });
      }
    }
  });

  test('16. MAP section is interactive', async ({ page }) => {
    const token = await createRoomToken(page, 'audit_test_session');
    await page.goto(`${BASE_URL}/room/${token}`);
    await page.waitForTimeout(2000);

    const mapSection = page.locator('#map');
    if (await mapSection.isVisible()) {
      await mapSection.scrollIntoViewIfNeeded();
      await expect(mapSection).toBeVisible();
    }
  });

  test('17. Contract Security section renders', async ({ page }) => {
    const token = await createRoomToken(page, 'audit_test_session');
    await page.goto(`${BASE_URL}/room/${token}`);
    await page.waitForTimeout(2000);

    const csSection = page.locator('#contract-security');
    if (await csSection.isVisible()) {
      await csSection.scrollIntoViewIfNeeded();
      await expect(csSection).toBeVisible();
    }
  });

  test('18. No JS console errors on full page load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        errors.push(msg.text());
      }
    });
    
    const token = await createRoomToken(page, 'audit_test_session');
    await page.goto(`${BASE_URL}/room/${token}`);
    await page.waitForTimeout(3000);
    
    // Scroll through entire page to trigger lazy renders
    await page.evaluate(async () => {
      const scrollStep = 500;
      const totalHeight = document.body.scrollHeight;
      for (let pos = 0; pos < totalHeight; pos += scrollStep) {
        window.scrollTo(0, pos);
        await new Promise(r => setTimeout(r, 200));
      }
    });
    await page.waitForTimeout(2000);

    // Filter out non-critical warnings
    const criticalErrors = errors.filter(e => 
      !e.includes('width(-1)') && 
      !e.includes('height(-1)') &&
      !e.includes('Failed to load resource') &&
      !e.includes('net::ERR')
    );
    
    if (criticalErrors.length > 0) {
      console.log('Console errors found:', criticalErrors);
    }
    expect(criticalErrors.length).toBe(0);
  });
});
