import React from 'react';
import './BusinessCaseDocument.css';
import type { DiscoverySession, MAPMilestone } from '../../lib/discoveryDatabase';
import type { RoomVisibility } from './RoomSections';
import { TT_PAINS } from '../../data/painData';
import { FEATURE_CATALOG, FEATURE_CATEGORIES, DEFAULT_SOLUTION_FEATURES, getCategoryById, type Feature } from '../../data/featureCatalog';

// ── Props ──

interface BusinessCaseDocumentProps {
  companyName: string;
  themeColor: string;
  selectedPains: string[];
  session: DiscoverySession | null;
  visibility: RoomVisibility;
  isRepPreview?: boolean;
  // Diagnosis
  currentApproach?: string;
  rootCause?: string;
  biggerProblemOverride?: string;
  // BAP / Proposal
  problemStatement?: string;
  businessImpact?: string;
  urgencyReason?: string;
  // Display
  customMessage?: string;
  repName?: string;
  showPricing?: boolean;
  enabledProofCustomers?: string[];
  enabledPlaybookIds?: string[];
  // Callbacks
  onMAPChange?: (map: MAPMilestone[]) => void;
  onContractReadinessChange?: (data: Record<string, string>) => void;
}

// ── Helpers ──

function HiddenPlaceholder({ label }: { label: string }) {
  return (
    <div style={{ maxWidth: 860, margin: '20px auto', padding: '24px 32px', border: '2px dashed #d6d3d1', borderRadius: 12, textAlign: 'center', color: '#a8a29e', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
      {label} — Hidden from Prospect
    </div>
  );
}

const formatMoney = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);

function padNum(n: number): string {
  return String(n).padStart(2, '0');
}

// ── Library Widget Renderer ──

function WidgetRenderer({ widget, accentColor }: { widget: any; accentColor: string }) {
  const content = widget.content || widget.data || {};
  const type = content.type || widget.type || '';

  if (type === 'case-study-card') {
    return (
      <div className="summary-box">
        {content.industry && <p style={{ fontSize: '0.72rem', fontWeight: 700, color: accentColor, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 4 }}>{content.industry}</p>}
        {content.metric && <h3 style={{ color: accentColor, marginBottom: 8 }}>{content.metric}</h3>}
        {content.quote && (
          <div className="quote-callout info" style={{ borderLeftColor: accentColor, margin: '12px 0' }}>
            <blockquote>"{content.quote}"</blockquote>
          </div>
        )}
        {content.feature && <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Feature: {content.feature}</p>}
      </div>
    );
  }

  if (type === 'g2-review-block') {
    return (
      <div className="quote-callout info" style={{ borderLeftColor: '#f59e0b' }}>
        <p style={{ fontSize: '1rem', marginBottom: 6 }}>★★★★★</p>
        <blockquote>"{content.quote || ''}"</blockquote>
        <cite>— {content.reviewerRole || 'Reviewer'}{content.companySize ? ` · ${content.companySize}` : ''}{content.source ? ` · ${content.source}` : ''}</cite>
      </div>
    );
  }

  if (type === 'battlecard-table' && content.rows) {
    return (
      <div style={{ overflowX: 'auto' }}>
        {content.headline && (
          <div className="quote-callout info" style={{ borderLeftColor: '#ef4444', marginBottom: 16 }}>
            <blockquote>"{content.headline}"</blockquote>
          </div>
        )}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid var(--color-border-light)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Capability</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid var(--color-border-light)', color: accentColor, fontWeight: 600 }}>Teamtailor</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid var(--color-border-light)', color: '#ef4444', fontWeight: 600 }}>{content.competitor || 'Competitor'}</th>
            </tr>
          </thead>
          <tbody>
            {content.rows.map((row: any, i: number) => (
              <tr key={i}>
                <td style={{ padding: '6px 12px', borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text)' }}>{row.capability || row.feature || ''}</td>
                <td style={{ padding: '6px 12px', borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-secondary)' }}>{row.teamtailor || ''}</td>
                <td style={{ padding: '6px 12px', borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-secondary)' }}>{row.competitor || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === 'feature-comparison') {
    return (
      <div className="capability-grid">
        <div className="capability-card" style={{ borderColor: '#fecaca' }}>
          <span className="capability-tag" style={{ color: '#ef4444', backgroundColor: '#fef2f2' }}>Without</span>
          <p>{content.without || ''}</p>
        </div>
        <div className="capability-card" style={{ borderColor: '#bbf7d0' }}>
          <span className="capability-tag" style={{ color: '#10b981', backgroundColor: '#ecfdf5' }}>With Teamtailor</span>
          <p>{content.withTT || ''}</p>
        </div>
      </div>
    );
  }

  if (type === 'competitor-weakness') {
    return (
      <div className="quote-callout info" style={{ borderLeftColor: '#ef4444' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ef4444', marginBottom: 4 }}>{content.competitor || ''}{content.source ? ` · ${content.source}` : ''}</p>
        {content.quote && <blockquote>"{content.quote}"</blockquote>}
        {content.reviewerRole && <cite>— {content.reviewerRole}</cite>}
      </div>
    );
  }

  if (type === 'industry-benchmark') {
    return (
      <div className="challenge-list">
        {(content.stats || []).map((s: any, i: number) => (
          <div className="challenge-item" key={i}>
            <div className="challenge-num" style={{ color: accentColor }}>{padNum(i + 1)}</div>
            <div className="challenge-content">
              <h3>{s.stat}</h3>
              {s.source && <p>{s.source}</p>}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Fallback: render title + description
  return (
    <div className="summary-box">
      <h3>{widget.title || 'Content Widget'}</h3>
      {widget.description && <p>{widget.description}</p>}
    </div>
  );
}

// ── Section definitions for TOC + numbering ──

interface SectionDef {
  key: keyof RoomVisibility;
  id: string;
  title: string;
}

const ALL_SECTIONS: SectionDef[] = [
  { key: 'problemCanvas', id: 'executive-summary', title: 'Executive Summary' },
  { key: 'pains', id: 'priorities', title: 'Your Priorities' },
  { key: 'diagnosis', id: 'problem-diagnosis', title: 'Problem Diagnosis' },
  { key: 'buyingProcess', id: 'buying-process', title: 'Buying Process & Timeline' },
  { key: 'successCriteria', id: 'success-criteria', title: 'What Success Looks Like' },
  { key: 'worstCase', id: 'worst-case', title: 'Worst-Case Scenario' },
  { key: 'paradigmShift', id: 'paradigm-shift', title: 'A Different Approach' },
  { key: 'competitive', id: 'competitive', title: 'Competitive Landscape' },
  { key: 'socialProof', id: 'proven-results', title: 'Proven Results' },
  { key: 'solution', id: 'solution', title: 'How Teamtailor Works' },
  { key: 'playbooks', id: 'playbooks', title: 'Playbooks' },
  { key: 'roi', id: 'roi', title: 'Return on Investment' },
  { key: 'pricing', id: 'pricing', title: 'Investment & Pricing' },
  { key: 'minimumStandards', id: 'minimum-standards', title: 'Minimum Standards' },
  { key: 'contractSecurity', id: 'contract-security', title: 'Contract & Security' },
  { key: 'map', id: 'map', title: 'Mutual Action Plan' },
  { key: 'alignmentChecklist', id: 'alignment-checklist', title: 'Alignment Checklist' },
  { key: 'proposal', id: 'next-steps', title: 'Next Steps' },
];

// ── Main Component ──

export function BusinessCaseDocument({
  companyName,
  themeColor,
  selectedPains,
  session,
  visibility,
  isRepPreview = false,
  currentApproach,
  rootCause,
  biggerProblemOverride,
  problemStatement,
  businessImpact,
  urgencyReason,
  customMessage,
  repName,
  showPricing = true,
  enabledProofCustomers,
  enabledPlaybookIds,
  onMAPChange,
  onContractReadinessChange,
}: BusinessCaseDocumentProps) {
  // ── Derived values ──
  const accentColor = (session as any)?.cms_accent || themeColor;
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const preparedBy = (session as any)?.cms_prepared_by || repName || 'Tyler Hanson';
  const preparedFor = (session as any)?.cms_prepared_for || companyName;
  const coverSubtitle = (session as any)?.cms_subtitle || `Teamtailor for ${companyName}`;
  const coverDate = (session as any)?.cms_date || currentMonth;
  const isConfidential = (session as any)?.cms_confidential !== false;
  const gradient1 = (session as any)?.cms_gradient_1 || '#1e1b4b';
  const gradient2 = (session as any)?.cms_gradient_2 || '#312e81';
  const gradient3 = (session as any)?.cms_gradient_3 || '#4338ca';

  const pains = TT_PAINS.filter(p => selectedPains.includes(p.id));
  const painQuotes = session?.pain_quotes ?? {};

  const dealValue = session?.deal_value || 0;
  const annualPrice = dealValue > 0 ? formatMoney(dealValue) : 'TBD';
  const monthlyPrice = dealValue > 0 ? formatMoney(Math.round(dealValue / 12)) : 'TBD';

  // ── ROI ──
  const roiTotal = session?.roi_total || 0;
  const roiEnabledCategories = session?.roi_enabled_categories ?? {};

  // ── Pricing details ──
  const pricingBasePrice = session?.pricing_base_price || 0;
  const pricingContractTerm = session?.pricing_contract_term || 1;
  const pricingDiscountPct = session?.pricing_discount_pct || 0;
  const pricingAddOns: any[] = session?.pricing_add_ons ?? [];
  const pricingNotes = session?.pricing_notes ?? '';
  const pricingPriceCapPct = (session as any)?.pricing_price_cap_pct;
  const pricingPromoFreeMonths = (session as any)?.pricing_promo_free_months;
  const pricingPromoLabel = (session as any)?.pricing_promo_label ?? '';
  const pricingSetupType = (session as any)?.pricing_setup_type ?? 'single';
  const pricingPresentationStyle = (session as any)?.pricing_presentation_style ?? 'single';
  const pricingPackages: any[] = (session as any)?.pricing_packages ?? [];
  const pricingDivisions: any[] = (session as any)?.pricing_divisions ?? [];
  const isMultiEntity = pricingSetupType === 'divisions' || pricingSetupType === 'group';
  const includedAddOns = pricingAddOns.filter(a => a.included);
  const paidAddOns = includedAddOns.filter(a => !a.waived && a.price > 0);
  const waivedAddOns = includedAddOns.filter(a => a.waived);
  const addOnTotal = paidAddOns.reduce((s, a) => s + (a.price || 0), 0);
  const divisionTotal = pricingDivisions.reduce((s, d) => s + d.price, 0);
  const effectiveBase = isMultiEntity ? divisionTotal : pricingBasePrice;
  const subtotal = effectiveBase + addOnTotal;
  const discountAmount = Math.round(subtotal * (pricingDiscountPct / 100));
  const finalTotal = subtotal - discountAmount;
  const roiMultiple = finalTotal > 0 && roiTotal > 0 ? Math.round(roiTotal / finalTotal) : 0;

  // Build visible sections list for TOC numbering
  const visibleSections = ALL_SECTIONS.filter(s => visibility[s.key]);

  // Section number lookup (only visible sections get numbers)
  const sectionNumber = (key: keyof RoomVisibility): string => {
    const idx = visibleSections.findIndex(s => s.key === key);
    return idx >= 0 ? padNum(idx + 1) : '00';
  };

  // ── Gate helper ──
  function gated(key: keyof RoomVisibility, label: string, content: React.ReactNode): React.ReactNode {
    if (visibility[key]) return content;
    if (isRepPreview) return <HiddenPlaceholder label={label} />;
    return null;
  }

  // ── Diagnosis values ──
  const diagCurrentApproach = currentApproach || (session as any)?.diagnosis_current_approach_override || '';
  const diagRootCause = rootCause || (session as any)?.diagnosis_root_cause_override || '';
  const diagBiggerProblem = biggerProblemOverride || (session as any)?.diagnosis_bigger_problem_override || '';
  const abilityRating = session?.ability_self_rating;
  const priorityRating = session?.priority_self_rating;

  // ── Diagnosis extras ──
  const diagContext = (session as any).diagnosis_context ?? '';
  const diagProspectQuote = (session as any).diagnosis_prospect_quote ?? '';
  const diagProspectQuoteAttribution = (session as any).diagnosis_prospect_quote_attribution ?? '';
  const diagReframeQuestion = (session as any).diagnosis_reframe_question ?? '';

  // ── Paradigm shift comparison fields ──
  const isComparisonMode = (session as any).paradigm_comparison_mode !== false;
  const approachATitle = (session as any).approach_a_title ?? '';
  const approachADescription = (session as any).approach_a_description ?? '';
  const approachACallout = (session as any).approach_a_callout ?? '';
  const approachBTitle = (session as any).approach_b_title ?? '';
  const approachBDescription = (session as any).approach_b_description ?? '';
  const approachBCallout = (session as any).approach_b_callout ?? '';

  // ── Stakeholders ──
  const stakeholders = session?.stakeholders ?? [];

  // ── Alignment checklist — use canonical alignment_checks (same source as SolutionProposal) ──
  const alignmentChecks = session?.alignment_checks ?? { urgent_priority: false, resources_insufficient: false, problems_solutions: false, roi_sufficient: false, right_solution: false };

  // ── Budget/Timeline from discovery ──
  const costOfProblem = session?.call_sheet_cost_of_problem || '';
  const targetDate = session?.call_sheet_target_date || '';

  // ── Hope pillars ──
  const customPillars = (session as any)?.custom_hope_pillars;
  const hopePillars = Array.isArray(customPillars) && customPillars.length > 0
    ? customPillars.slice(0, 3)
    : [
        { title: 'Purpose-Built ATS', subtitle: 'A platform built exclusively for recruiting — not bolted onto an HRIS.' },
        { title: 'AI-Powered Efficiency', subtitle: 'Automated screening, smart scheduling, and intelligent workflows.' },
        { title: 'Employer Brand', subtitle: 'A career site that reflects your culture and converts top talent.' },
      ];

  // ── Solution feature selections ──
  const solutionFeatureIds: string[] = (session as any)?.solution_feature_ids ?? DEFAULT_SOLUTION_FEATURES;
  const selectedFeatures = solutionFeatureIds.map(id => FEATURE_CATALOG.find(f => f.id === id)).filter(Boolean) as Feature[];
  const featuresByCategory = FEATURE_CATEGORIES.map(cat => ({
    ...cat,
    features: selectedFeatures.filter(f => f.category === cat.id),
  })).filter(group => group.features.length > 0);



  // ── MAP ──
  const mapMilestones = session?.mutual_action_plan ?? [];

  // ── Trust badges ──
  const trustBadgesDefault: Record<string, boolean> = {
    soc2: true,
    iso27001: true,
    iso27701: true,
    gdpr: true,
    responsibleAi: true,
    euAiAct: true,
  };
  const trustBadges = (session as any)?.trust_enabled_badges ?? trustBadgesDefault;
  const showReviewBadges = (session as any)?.trust_show_review_badges !== false;

  // ── Minimum standards ──
  const customMinStandards: any[] = (session as any)?.custom_minimum_standards ?? [];

  // ── Competitors ──
  const currentAts = session?.current_ats || '';
  const competitorsEval: string[] = (session as any)?.competitors_evaluating ?? [];

  // ── Library Widgets (inline within sections) ──
  const allWidgets: any[] = ((session as any)?.library_widgets ?? []).filter((w: any) => w.enabled !== false);
  const WIDGET_SECTION_MAP: Record<string, string> = {
    'case-studies': 'socialProof',
    'g2-reviews': 'socialProof',
    'competitor-battlecards': 'competitive',
    'competitor-weaknesses': 'competitive',
    'feature-deep-dives': 'solution',
    'feature-comparison': 'solution',
    'industry-benchmarks': 'problemCanvas',
    'roi-templates': 'roi',
  };
  const widgetsFor = (sectionKey: string) =>
    allWidgets.filter(w => WIDGET_SECTION_MAP[w.category || w.type || ''] === sectionKey);
  const unmappedWidgets = allWidgets.filter(w => !WIDGET_SECTION_MAP[w.category || w.type || '']);

  // ── CSS custom properties ──
  const containerStyle: React.CSSProperties = {
    '--color-primary': accentColor,
    '--cover-gradient-1': gradient1,
    '--cover-gradient-2': gradient2,
    '--cover-gradient-3': gradient3,
  } as React.CSSProperties;

  // ══════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════

  return (
    <div className="business-case-container" style={containerStyle}>

      {/* ═══════════════════════════════════════════
          1. COVER PAGE
          ═══════════════════════════════════════════ */}
      {gated('hero', 'Cover Page', (
        <section className="cover-page" id="cover">
          {isConfidential && (
            <div className="cover-badge">CONFIDENTIAL</div>
          )}
          <div className="cover-content">
            <div className="cover-logo-area">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill={accentColor} />
                <path d="M14 24L22 32L34 16" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="cover-from">Prepared by Teamtailor</span>
            </div>
            <h1 className="cover-title">Business Case</h1>
            <p className="cover-subtitle">{coverSubtitle}</p>
            <div className="cover-divider" style={{ background: accentColor }} />
            <div className="cover-for">
              <span className="cover-label">Prepared for</span>
              <span className="cover-company">{preparedFor}</span>
            </div>
            <div className="cover-meta">
              <div className="cover-meta-item">
                <span className="cover-meta-label">Date</span>
                <span className="cover-meta-value">{coverDate}</span>
              </div>
              <div className="cover-meta-item">
                <span className="cover-meta-label">Contact</span>
                <span className="cover-meta-value">{preparedBy}</span>
              </div>
            </div>
          </div>
          <div className="cover-footer">
            <span>© {new Date().getFullYear()} Teamtailor — This document is confidential and intended solely for {companyName}.</span>
          </div>
        </section>
      ))}

      {/* ═══════════════════════════════════════════
          CHAMPION ENABLEMENT CALLOUT
          ═══════════════════════════════════════════ */}
      {visibility.hero && (
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '20px 32px' }}>
          <p style={{
            fontSize: '0.82rem',
            fontStyle: 'italic',
            color: '#a8a29e',
            textAlign: 'center',
            lineHeight: 1.6,
            margin: 0,
          }}>
            This document is designed to help you build the internal case for change. Share it with your leadership team to align on the problem, the solution, and the path forward.
          </p>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          2. TABLE OF CONTENTS
          ═══════════════════════════════════════════ */}
      {visibility.hero && (
        <section className="page toc-page" id="toc">
          <div className="section-number" style={{ color: accentColor }}>00</div>
          <h2 className="toc-heading">Contents</h2>
          <nav className="toc-list">
            {visibleSections.map((sec, idx) => (
              <a href={`#${sec.id}`} className="toc-item" key={sec.id}>
                <span className="toc-num" style={{ color: accentColor }}>{padNum(idx + 1)}</span>
                <span className="toc-text">{sec.title}</span>
                <span className="toc-dots" />
              </a>
            ))}
          </nav>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          3. EXECUTIVE SUMMARY
          ═══════════════════════════════════════════ */}
      {gated('problemCanvas', 'Executive Summary', (
        <section className="page" id="executive-summary">
          <div className="section-number" style={{ color: accentColor }}>{sectionNumber('problemCanvas')}</div>
          <h2 className="section-title">Executive Summary</h2>
          <p className="section-subtitle">A snapshot of {companyName}'s talent acquisition landscape</p>

          <div className="section-intro">
            <p>
              {session?.problem_canvas_overrides?.objective
                || problemStatement
                || `${companyName} is currently evaluating its talent acquisition infrastructure. As the company scales, the need for a dedicated, modern recruiting platform becomes increasingly apparent.`
              }
            </p>
            {customMessage && <p>{customMessage}</p>}
          </div>

          {/* Highlight grid — top 3 pains */}
          {pains.length > 0 && (
            <div className="highlight-grid">
              {pains.slice(0, 3).map((pain) => (
                <div className="highlight-card" key={pain.id}>
                  <div className="highlight-icon" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                    <span style={{ fontSize: '1.2rem' }}>⚡</span>
                  </div>
                  <h3>{pain.title}</h3>
                  <p>{pain.description.split('.')[0]}.</p>
                </div>
              ))}
            </div>
          )}

          {/* Quote callout — first pain with a quote */}
          {(() => {
            const firstQuotePain = pains.find(p => painQuotes[p.id] || p.verbatim);
            if (!firstQuotePain) return null;
            const quote = painQuotes[firstQuotePain.id] || firstQuotePain.verbatim;
            return (
              <div className="quote-callout info" style={{ borderLeftColor: accentColor }}>
                <blockquote>"{quote}"</blockquote>
                <cite>— Stakeholder feedback during discovery</cite>
              </div>
            );
          })()}

          {/* Decision Makers / Stakeholders */}
          {stakeholders.length > 0 && (
            <div className="highlight-grid" style={{ marginTop: 32 }}>
              {stakeholders.slice(0, 4).map((s: any, idx: number) => (
                <div className="highlight-card" key={idx}>
                  <div className="highlight-icon" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                    <span style={{ fontSize: '1.2rem' }}>👤</span>
                  </div>
                  <h3>{s.name || 'TBD'}</h3>
                  <p>{s.title || s.role || 'Stakeholder'}</p>
                </div>
              ))}
            </div>
          )}

          {/* Priority Scale (1-10) */}
          {priorityRating != null && priorityRating > 0 && (
            <div style={{ marginTop: 32, padding: '28px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Priority Self-Assessment</h3>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: accentColor }}>{priorityRating}/10</span>
              </div>
              <div style={{ height: 8, background: 'var(--color-border-light)', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${priorityRating * 10}%`, background: accentColor, borderRadius: 100, transition: 'width 0.5s ease' }} />
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 10, margin: 0 }}>
                {companyName} rated this as a <strong>{priorityRating >= 8 ? 'critical' : priorityRating >= 5 ? 'significant' : 'moderate'}</strong> priority.
                {priorityRating >= 8 && ' This is among their top initiatives requiring near-term action.'}
              </p>
            </div>
          )}

          <div className="summary-box" style={{ marginTop: 32 }}>
            <h3>What This Document Is</h3>
            <p>
              This is a <strong>benchmark</strong> — a clear picture of what a dedicated, modern ATS delivers.
              As {companyName} evaluates its capabilities, this document provides a reference point for what
              "really good" looks like. If gaps appear, Teamtailor is ready to deploy.
            </p>
          </div>

          {/* Inline widgets: industry benchmarks */}
          {widgetsFor('problemCanvas').map((w: any, i: number) => (
            <div key={`w-pc-${i}`} style={{ marginTop: 24 }}>
              <WidgetRenderer widget={w} accentColor={accentColor} />
            </div>
          ))}
        </section>
      ))}

      {/* ═══════════════════════════════════════════
          4. YOUR PRIORITIES
          ═══════════════════════════════════════════ */}
      {gated('pains', 'Your Priorities', (
        <section className="page" id="priorities">
          <div className="section-number" style={{ color: accentColor }}>{sectionNumber('pains')}</div>
          <h2 className="section-title">Your Priorities</h2>
          <p className="section-subtitle">Key challenges identified during our discovery conversations</p>

          <div className="challenge-list">
            {pains.length > 0 ? pains.map((pain, index) => (
              <div className="challenge-item" key={pain.id}>
                <div className="challenge-num" style={{ color: accentColor }}>{padNum(index + 1)}</div>
                <div className="challenge-content">
                  <h3>{pain.title}</h3>
                  <p>{pain.description}</p>
                  {(painQuotes[pain.id] || pain.verbatim) && (
                    <div className="quote-callout info" style={{ borderLeftColor: accentColor, marginTop: 12 }}>
                      <blockquote>"{painQuotes[pain.id] || pain.verbatim}"</blockquote>
                      <cite>— Stakeholder Quote</cite>
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <p>No specific challenges documented yet.</p>
            )}
          </div>
        </section>
      ))}

      {/* ═══════════════════════════════════════════
          5. ROOT CAUSE ANALYSIS
          ═══════════════════════════════════════════ */}
      {gated('diagnosis', 'Problem Diagnosis', (
        <section className="page" id="root-cause">
          <div className="section-number" style={{ color: accentColor }}>{sectionNumber('diagnosis')}</div>
          <h2 className="section-title">Problem Diagnosis</h2>
          <p className="section-subtitle">Understanding the deeper challenges behind the symptoms</p>

          {diagContext && (
            <div style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-md)', padding: '24px 28px', marginBottom: 28 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
                {diagContext}
              </div>
            </div>
          )}

          <div className="challenge-list">
            {diagCurrentApproach && (
              <div className="challenge-item">
                <div className="challenge-num" style={{ color: accentColor }}>01</div>
                <div className="challenge-content">
                  <h3>Current Approach</h3>
                  <p>{diagCurrentApproach}</p>
                </div>
              </div>
            )}
            {diagRootCause && (
              <div className="challenge-item">
                <div className="challenge-num" style={{ color: accentColor }}>02</div>
                <div className="challenge-content">
                  <h3>Root Cause</h3>
                  <p>{diagRootCause}</p>
                </div>
              </div>
            )}
            {diagBiggerProblem && (
              <div className="challenge-item">
                <div className="challenge-num" style={{ color: accentColor }}>03</div>
                <div className="challenge-content">
                  <h3>The Bigger Problem</h3>
                  <p>{diagBiggerProblem}</p>
                </div>
              </div>
            )}
            {!diagCurrentApproach && !diagRootCause && !diagBiggerProblem && (
              <div className="section-intro">
                <p>Problem diagnosis details will be added after deeper discovery conversations.</p>
              </div>
            )}
          </div>

          {diagReframeQuestion && (
            <div style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}20`, borderRadius: 'var(--radius-md)', padding: '24px 28px', marginTop: 28 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: accentColor, marginBottom: 10 }}>The real question</div>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.65, color: 'var(--color-text-primary)', fontWeight: 500, margin: 0 }}>
                {diagReframeQuestion}
              </p>
            </div>
          )}

          {diagProspectQuote && (
            <div className="quote-callout" style={{ marginTop: 20 }}>
              <blockquote>{diagProspectQuote}</blockquote>
              {diagProspectQuoteAttribution && <cite>{diagProspectQuoteAttribution}</cite>}
            </div>
          )}

          {abilityRating != null && abilityRating > 0 && (
            <div style={{ marginTop: 32, padding: '28px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Ability Self-Assessment</h3>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: abilityRating <= 4 ? '#ef4444' : abilityRating <= 7 ? '#f59e0b' : '#10b981' }}>{abilityRating}/10</span>
              </div>
              <div style={{ height: 8, background: 'var(--color-border-light)', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${abilityRating * 10}%`, background: abilityRating <= 4 ? '#ef4444' : abilityRating <= 7 ? '#f59e0b' : '#10b981', borderRadius: 100, transition: 'width 0.5s ease' }} />
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 10, margin: 0 }}>
                {companyName} rated their ability to solve this internally at <strong>{abilityRating}/10</strong>.
                {abilityRating <= 4 && ' This signals a strong need for new or outside help.'}
                {abilityRating >= 5 && abilityRating <= 7 && ' There is recognition that outside expertise could accelerate progress.'}
                {abilityRating >= 8 && ' The team feels capable but may benefit from specialized tooling.'}
              </p>
            </div>
          )}
        </section>
      ))}

      {/* ═══════════════════════════════════════════
          BUYING PROCESS & TIMELINE
          ═══════════════════════════════════════════ */}
      {gated('buyingProcess', 'Buying Process & Timeline', (
        <section className="page" id="buying-process">
          <div className="section-number" style={{ color: accentColor }}>{sectionNumber('buyingProcess')}</div>
          <h2 className="section-title">Buying Process &amp; Timeline</h2>
          <p className="section-subtitle">Understanding how {companyName} evaluates and adopts new technology</p>

          {(() => {
            const bpProcess = session?.call_sheet_answers?.q7;
            const bpTimeline = session?.call_sheet_answers?.q4;
            const bpBudget = session?.call_sheet_answers?.q8;
            const hasAnyData = bpProcess || bpTimeline || bpBudget;

            if (!hasAnyData) {
              return (
                <div className="section-intro">
                  <p>Buying process details will be captured during upcoming discovery conversations.</p>
                </div>
              );
            }

            return (
              <div className="challenge-list">
                {bpProcess && (
                  <div className="challenge-item">
                    <div className="challenge-num" style={{ color: accentColor }}>01</div>
                    <div className="challenge-content">
                      <h3>Decision Process</h3>
                      <p>{typeof bpProcess === 'string' ? bpProcess : Array.isArray(bpProcess) ? bpProcess.join(', ') : String(bpProcess)}</p>
                    </div>
                  </div>
                )}
                {bpTimeline && (
                  <div className="challenge-item">
                    <div className="challenge-num" style={{ color: accentColor }}>02</div>
                    <div className="challenge-content">
                      <h3>Timeline</h3>
                      <p>{typeof bpTimeline === 'string' ? bpTimeline : Array.isArray(bpTimeline) ? bpTimeline.join(', ') : String(bpTimeline)}</p>
                    </div>
                  </div>
                )}
                {bpBudget && (
                  <div className="challenge-item">
                    <div className="challenge-num" style={{ color: accentColor }}>03</div>
                    <div className="challenge-content">
                      <h3>Budget Considerations</h3>
                      <p>{typeof bpBudget === 'string' ? bpBudget : Array.isArray(bpBudget) ? bpBudget.join(', ') : String(bpBudget)}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </section>
      ))}

      {/* ═══════════════════════════════════════════
          WHAT SUCCESS LOOKS LIKE
          ═══════════════════════════════════════════ */}
      {gated('successCriteria', 'What Success Looks Like', (
        <section className="page" id="success-criteria">
          <div className="section-number" style={{ color: accentColor }}>{sectionNumber('successCriteria')}</div>
          <h2 className="section-title">What Success Looks Like</h2>
          <p className="section-subtitle">{companyName}'s vision for a successful outcome</p>

          {(() => {
            const successData = session?.call_sheet_answers?.q8b;
            if (!successData) {
              return (
                <div className="section-intro">
                  <p>Success criteria will be defined as discovery progresses.</p>
                </div>
              );
            }
            const successText = typeof successData === 'string'
              ? successData
              : Array.isArray(successData)
                ? successData.join('; ')
                : String(successData);
            return (
              <div className="quote-callout info" style={{ borderLeftColor: accentColor }}>
                <blockquote>"{successText}"</blockquote>
                <cite>— {companyName}'s stated success criteria</cite>
              </div>
            );
          })()}
        </section>
      ))}

      {/* ═══════════════════════════════════════════
          WORST-CASE SCENARIO
          ═══════════════════════════════════════════ */}
      {gated('worstCase', 'Worst-Case Scenario', (
        <section className="page" id="worst-case">
          <div className="section-number" style={{ color: accentColor }}>{sectionNumber('worstCase')}</div>
          <h2 className="section-title">Worst-Case Scenario</h2>
          <p className="section-subtitle">What happens if {companyName} doesn't solve this</p>

          {(() => {
            const worstCaseData = (session as any)?.worst_case_scenario || session?.call_sheet_answers?.q6;
            if (!worstCaseData) {
              return (
                <div className="section-intro">
                  <p>Worst-case implications will be explored during deeper discovery conversations.</p>
                </div>
              );
            }
            const worstCaseText = typeof worstCaseData === 'string'
              ? worstCaseData
              : Array.isArray(worstCaseData)
                ? worstCaseData.join('; ')
                : String(worstCaseData);
            return (
              <div className="quote-callout" style={{
                borderLeftColor: '#ef4444',
                background: 'rgba(239, 68, 68, 0.04)',
                borderLeft: '4px solid #ef4444',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#ef4444' }}>If No Action Is Taken</span>
                </div>
                <blockquote style={{ color: 'var(--color-text-primary)' }}>"{worstCaseText}"</blockquote>
                <cite>— Identified during discovery</cite>
              </div>
            );
          })()}
        </section>
      ))}

      {/* ═══════════════════════════════════════════
          6. A DIFFERENT APPROACH (Paradigm Shift)
          ═══════════════════════════════════════════ */}
      {gated('paradigmShift', 'A Different Approach', (
        <section className="page" id="paradigm-shift">
          <div className="section-number" style={{ color: accentColor }}>{sectionNumber('paradigmShift')}</div>
          <h2 className="section-title">A Different Approach</h2>
          <p className="section-subtitle">Moving from hope-based tactics to a designed recruiting infrastructure</p>

          {isComparisonMode && (approachATitle || approachBTitle) ? (
            /* ── Comparison Mode: Approach A vs B ── */
            <>
              <div className="section-intro">
                <p>
                  Most talent acquisition teams rely on reactive, hope-based strategies — posting jobs and praying the right
                  people apply. A purpose-built platform replaces hope with design.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
                {/* Approach A — Red/Hope */}
                <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#ef4444', marginBottom: 12 }}>
                    Approach A: {approachATitle || 'Current Approach'}
                  </div>
                  {approachADescription && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{approachADescription}</p>
                  )}
                  {approachACallout && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.55, marginTop: 12, fontStyle: 'italic' }}>{approachACallout}</p>
                  )}
                </div>

                {/* Approach B — Accent/Design */}
                <div style={{ background: `${accentColor}06`, border: `1px solid ${accentColor}18`, borderRadius: 'var(--radius-md)', padding: '24px' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: accentColor, marginBottom: 12 }}>
                    Approach B: {approachBTitle || 'Designed Approach'}
                  </div>
                  {approachBDescription && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{approachBDescription}</p>
                  )}
                  {approachBCallout && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.55, marginTop: 12, fontStyle: 'italic' }}>{approachBCallout}</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* ── Pillars Mode: Original 3 Pillars ── */
            <>
              <div className="section-intro">
                <p>
                  Most talent acquisition teams rely on reactive, hope-based strategies — posting jobs and praying the right
                  people apply. A purpose-built platform replaces hope with design.
                </p>
              </div>

              <div className="capability-grid">
                {hopePillars.map((pillar: { title: string; subtitle: string }, idx: number) => (
                  <div className="capability-card" key={idx}>
                    <span className="capability-tag" style={{ color: accentColor, backgroundColor: `${accentColor}20` }}>
                      Pillar {idx + 1}
                    </span>
                    <h3>{pillar.title}</h3>
                    <p>{pillar.subtitle}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      ))}

      {/* ═══════════════════════════════════════════
          7. COMPETITIVE LANDSCAPE
          ═══════════════════════════════════════════ */}
      {gated('competitive', 'Competitive Landscape', (
        <section className="page" id="competitive">
          <div className="section-number" style={{ color: accentColor }}>{sectionNumber('competitive')}</div>
          <h2 className="section-title">Competitive Landscape</h2>
          <p className="section-subtitle">Understanding where {companyName} stands in the market</p>

          <div className="capability-grid">
            {currentAts && (
              <div className="capability-card">
                <span className="capability-tag" style={{ color: accentColor, backgroundColor: `${accentColor}20` }}>Current System</span>
                <h3>{currentAts}</h3>
                <p>{companyName}'s current applicant tracking system. This document benchmarks its capabilities against a purpose-built ATS.</p>
              </div>
            )}
            <div className="capability-card">
              <span className="capability-tag" style={{ color: accentColor, backgroundColor: `${accentColor}20` }}>Evaluation</span>
              <h3>Vendors Being Evaluated</h3>
              {competitorsEval.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {competitorsEval.map((c, i) => (
                    <span key={i} style={{
                      display: 'inline-block',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      padding: '4px 14px',
                      borderRadius: 100,
                      background: `${accentColor}12`,
                      color: accentColor,
                      border: `1px solid ${accentColor}30`,
                    }}>
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <p>Evaluation details will be refined as the process progresses.</p>
              )}
            </div>
          </div>

          {/* Inline widgets: battlecards, competitor weaknesses */}
          {widgetsFor('competitive').map((w: any, i: number) => (
            <div key={`w-comp-${i}`} style={{ marginTop: 24 }}>
              <WidgetRenderer widget={w} accentColor={accentColor} />
            </div>
          ))}
        </section>
      ))}

      {/* ═══════════════════════════════════════════
          8. PROVEN RESULTS (Social Proof)
          ═══════════════════════════════════════════ */}
      {gated('socialProof', 'Proven Results', (
        <section className="page" id="proven-results">
          <div className="section-number" style={{ color: accentColor }}>{sectionNumber('socialProof')}</div>
          <h2 className="section-title">Proven Results</h2>
          <p className="section-subtitle">Trusted by high-growth companies worldwide</p>

          <div className="highlight-grid">
            <div className="highlight-card">
              <div className="highlight-icon" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                <span style={{ fontSize: '1.2rem' }}>🌍</span>
              </div>
              <h3>10,000+ Customers</h3>
              <p>Companies across every industry trust Teamtailor for their talent acquisition.</p>
            </div>
            <div className="highlight-card">
              <div className="highlight-icon" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                <span style={{ fontSize: '1.2rem' }}>🗺️</span>
              </div>
              <h3>90+ Countries</h3>
              <p>Global reach with localized support in 30+ languages.</p>
            </div>
            <div className="highlight-card">
              <div className="highlight-icon" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                <span style={{ fontSize: '1.2rem' }}>⭐</span>
              </div>
              <h3>4.6/5 G2 Rating</h3>
              <p>Consistently top-rated on G2, Capterra, and TrustRadius.</p>
            </div>
            <div className="highlight-card">
              <div className="highlight-icon" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                <span style={{ fontSize: '1.2rem' }}>🏆</span>
              </div>
              <h3>Founder-Led Since 2013</h3>
              <p>100% of the roadmap focused on recruiting. No distractions.</p>
            </div>
          </div>

          {enabledProofCustomers && enabledProofCustomers.length > 0 && (
            <div className="summary-box" style={{ marginTop: 24 }}>
              <h3>Selected Customer References</h3>
              <p>{enabledProofCustomers.length} customer case studies are available for {companyName} to review as part of this evaluation.</p>
            </div>
          )}

          {/* Inline widgets: case studies, G2 reviews */}
          {widgetsFor('socialProof').map((w: any, i: number) => (
            <div key={`w-sp-${i}`} style={{ marginTop: 24 }}>
              <WidgetRenderer widget={w} accentColor={accentColor} />
            </div>
          ))}
        </section>
      ))}

      {/* ═══════════════════════════════════════════
          9. HOW TEAMTAILOR WORKS (Solution)
          ═══════════════════════════════════════════ */}
      {gated('solution', 'How Teamtailor Works', (
        <section className="page" id="solution">
          <div className="section-number" style={{ color: accentColor }}>{sectionNumber('solution')}</div>
          <h2 className="section-title">How Teamtailor Works</h2>
          <p className="section-subtitle">Capabilities that directly address {companyName}'s recruiting challenges</p>

          <div className="section-intro">
            <p>Every capability below is <strong>live in production today</strong>, used by 10,000+ companies across 90+ countries.</p>
          </div>

          {/* Feature Catalog — Grouped by Category */}
          {featuresByCategory.length > 0 ? (
            <div style={{ marginTop: 24 }}>
              {featuresByCategory.map(group => (
                <div key={group.id} style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: '0.85rem' }}>{group.icon}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: group.color }}>
                      {group.label}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {group.features.map(feature => (
                      <div key={feature.id} style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <span style={{ fontSize: '0.9rem' }}>{feature.icon}</span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{feature.title}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: 0 }}>
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="section-intro">
              <p>Feature selection will be customized based on your specific requirements.</p>
            </div>
          )}

          {/* Inline widgets: feature deep-dives, comparisons */}
          {widgetsFor('solution').map((w: any, i: number) => (
            <div key={`w-sol-${i}`} style={{ marginTop: 24 }}>
              <WidgetRenderer widget={w} accentColor={accentColor} />
            </div>
          ))}
        </section>
      ))}

      {/* ═══════════════════════════════════════════
          PLAYBOOKS
          ═══════════════════════════════════════════ */}
      {gated('playbooks', 'Playbooks', (
        <section className="page" id="playbooks">
          <div className="section-number" style={{ color: accentColor }}>{sectionNumber('playbooks')}</div>
          <h2 className="section-title">Playbooks</h2>
          <p className="section-subtitle">Proven methods for solving your specific challenges</p>

          <div className="section-intro">
            <p>
              Teamtailor doesn't just provide tools — we provide playbooks: step-by-step methods
              proven across thousands of customers for tackling specific recruiting challenges.
            </p>
          </div>

          {enabledPlaybookIds && enabledPlaybookIds.length > 0 ? (
            <div className="highlight-grid">
              {enabledPlaybookIds.slice(0, 6).map((id, idx) => (
                <div className="highlight-card" key={id}>
                  <div className="highlight-icon" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                    <span style={{ fontSize: '1.2rem' }}>📋</span>
                  </div>
                  <h3>Playbook {padNum(idx + 1)}</h3>
                  <p>A structured method customized for {companyName}'s workflow and team size.</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="summary-box">
              <h3>Custom Playbooks</h3>
              <p>
                Based on the challenges identified during discovery, {preparedBy} will recommend
                specific playbooks tailored to {companyName}'s team structure and hiring goals.
              </p>
            </div>
          )}
        </section>
      ))}

      {/* ═══════════════════════════════════════════
          RETURN ON INVESTMENT
          ═══════════════════════════════════════════ */}
      {gated('roi', 'Return on Investment', (
        <section className="page" id="roi">
          <div className="section-number" style={{ color: accentColor }}>{sectionNumber('roi')}</div>
          <h2 className="section-title">Return on Investment</h2>
          <p className="section-subtitle">Quantifying the value of a purpose-built recruiting platform</p>

          {/* Budget & Timeline from Discovery */}
          {(costOfProblem || targetDate) && (
            <div className="highlight-grid" style={{ marginBottom: 32 }}>
              {costOfProblem && (
                <div className="highlight-card">
                  <div className="highlight-icon" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                    <span style={{ fontSize: '1.2rem' }}>💰</span>
                  </div>
                  <h3>Your Stated Cost of Problem</h3>
                  <p>{costOfProblem}</p>
                </div>
              )}
              {targetDate && (
                <div className="highlight-card">
                  <div className="highlight-icon" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                    <span style={{ fontSize: '1.2rem' }}>📅</span>
                  </div>
                  <h3>Target Date to Solve</h3>
                  <p>{targetDate}</p>
                </div>
              )}
            </div>
          )}

          {roiTotal > 0 && (
            <div className="roi-summary-box">
              <h3>Projected Annual Value</h3>
              <p>
                Based on {companyName}'s inputs, switching to Teamtailor delivers an estimated
                <strong> {formatMoney(roiTotal)}</strong> in annual value through:
              </p>
              <ul>
                {(!roiEnabledCategories || roiEnabledCategories['seatSavings'] !== false) && (
                  <li>Elimination of per-seat ATS licensing costs</li>
                )}
                {(!roiEnabledCategories || roiEnabledCategories['agencySavings'] !== false) && (
                  <li>Reduction in agency recruitment spend</li>
                )}
                {(!roiEnabledCategories || roiEnabledCategories['vacancySavings'] !== false) && (
                  <li>Faster time-to-hire reducing vacancy costs</li>
                )}
                {(!roiEnabledCategories || roiEnabledCategories['adminTimeSavings'] !== false) && (
                  <li>Admin time savings for recruiters and hiring managers</li>
                )}
                {(!roiEnabledCategories || roiEnabledCategories['jobBoardSavings'] !== false) && (
                  <li>Reduced job board spend through organic career site traffic</li>
                )}
              </ul>
            </div>
          )}

          {roiTotal === 0 && (
            <div className="section-intro">
              <p>ROI projections will be calculated once {companyName} provides key inputs around hiring volume, agency spend, and current costs.</p>
            </div>
          )}

          {roiTotal > 0 && dealValue > 0 && (
            <div className="summary-box" style={{ marginTop: 32 }}>
              <h3>ROI Multiple</h3>
              <p>
                At an annual investment of {formatMoney(dealValue)}, the projected ROI
                is <strong>{Math.round(roiTotal / dealValue)}x</strong> — meaning every dollar
                invested returns {formatMoney(Math.round(roiTotal / dealValue))} in value.
              </p>
            </div>
          )}

          {/* Inline widgets: ROI templates */}
          {widgetsFor('roi').map((w: any, i: number) => (
            <div key={`w-roi-${i}`} style={{ marginTop: 24 }}>
              <WidgetRenderer widget={w} accentColor={accentColor} />
            </div>
          ))}
        </section>
      ))}

      {/* ═══════════════════════════════════════════
          11. INVESTMENT & PRICING
          ═══════════════════════════════════════════ */}
      {gated('pricing', 'Investment & Pricing', (
        <section className="page" id="pricing">
          <div className="section-number" style={{ color: accentColor }}>{sectionNumber('pricing')}</div>
          <h2 className="section-title">Investment &amp; Pricing</h2>
          <p className="section-subtitle">Transparent, flat-rate pricing — no surprises</p>

          <div className="section-intro">
            <p>
              Teamtailor uses flat-rate annual pricing. No per-seat fees for hiring managers,
              no usage-based AI charges, no surprises at renewal.
            </p>
          </div>

          {/* ── ROI Price Anchor (if ROI data exists) ── */}
          {roiMultiple > 0 && (
            <div style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}20`, borderRadius: 'var(--radius-md)', padding: '20px 24px', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: accentColor, marginBottom: 4 }}>Return on Investment</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', margin: 0, fontWeight: 500 }}>
                    Projected annual savings of {formatMoney(roiTotal)} against a {formatMoney(finalTotal)}/yr investment
                  </p>
                </div>
                <div style={{ textAlign: 'center', padding: '8px 16px', background: `${accentColor}15`, borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: accentColor, lineHeight: 1 }}>{roiMultiple}x</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: 2 }}>ROI</div>
                </div>
              </div>
            </div>
          )}

          {/* ── Multi-Entity Breakdown (Divisions/Group) ── */}
          {isMultiEntity && pricingDivisions.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                {pricingSetupType === 'divisions' ? 'Division' : 'Platform'} Breakdown
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid var(--color-border-light)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                      {pricingSetupType === 'divisions' ? 'Division' : 'Platform'}
                    </th>
                    <th style={{ textAlign: 'right', padding: '8px 12px', borderBottom: '2px solid var(--color-border-light)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Employees</th>
                    <th style={{ textAlign: 'right', padding: '8px 12px', borderBottom: '2px solid var(--color-border-light)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Annual</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingDivisions.map((div: any, i: number) => (
                    <tr key={i}>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-primary)', fontWeight: 500 }}>{div.label || `${pricingSetupType === 'divisions' ? 'Division' : 'Platform'} ${i + 1}`}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-muted)', textAlign: 'right' }}>{div.employeeCount > 0 ? div.employeeCount.toLocaleString() : '—'}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-primary)', textAlign: 'right', fontWeight: 600 }}>{div.price > 0 ? formatMoney(div.price) : 'TBD'}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Total</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--color-text-muted)' }}>{pricingDivisions.reduce((s: number, d: any) => s + d.employeeCount, 0).toLocaleString()}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: accentColor }}>{formatMoney(divisionTotal)}/yr</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pricing Card(s) ── */}
          {pricingPresentationStyle === 'options' && pricingPackages.length > 0 ? (
            /* Good / Better / Best Packages */
            <div className="pricing-comparison" style={{ display: 'grid', gridTemplateColumns: `repeat(${pricingPackages.length}, 1fr)`, gap: 16 }}>
              {pricingPackages.map((pkg: any, idx: number) => {
                const isBest = idx === pricingPackages.length - 1;
                const pkgAddOns = pricingAddOns.filter(a => pkg.addon_ids?.includes(a.id));
                const pkgAddOnCost = pkgAddOns.filter(a => !a.waived).reduce((s, a) => s + (a.price || 0), 0);
                const pkgTotal = effectiveBase + pkgAddOnCost;
                return (
                  <div key={pkg.id} className={`pricing-card ${isBest ? 'promo' : ''}`} style={isBest ? { borderColor: accentColor } : {}}>
                    {isBest && <div className="pricing-badge" style={{ backgroundColor: accentColor }}>Recommended</div>}
                    <div className="pricing-header" style={isBest ? { backgroundColor: `${accentColor}10` } : {}}>
                      <h3>{pkg.name}</h3>
                      <div className="pricing-amount">
                        <span className="pricing-number">{formatMoney(pkgTotal)}</span>
                        <span className="pricing-period">/year</span>
                      </div>
                      <span className="pricing-monthly">≈ {formatMoney(Math.round(pkgTotal / 12))} / month</span>
                    </div>
                    <div className="pricing-body">
                      {pkg.description && <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>{pkg.description}</p>}
                      <ul>
                        <li className="promo-item" style={{ color: accentColor }}>Unlimited hiring manager seats</li>
                        <li>Full AI Copilot &amp; Screening</li>
                        <li>Career site builder</li>
                        {pkgAddOns.map((a: any) => (
                          <li key={a.id} className="promo-item" style={{ color: accentColor }}>
                            {a.name}{a.waived ? ' (included)' : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Single Proposal Card */
            <div className="pricing-comparison">
              <div className="pricing-card promo" style={{ borderColor: accentColor }}>
                <div className="pricing-badge" style={{ backgroundColor: accentColor }}>Proposed Investment</div>
                <div className="pricing-header" style={{ backgroundColor: `${accentColor}10` }}>
                  <h3>Teamtailor {pricingContractTerm > 1 ? `${pricingContractTerm}-Year` : 'Annual'}</h3>
                  <div className="pricing-amount">
                    <span className="pricing-number">{finalTotal > 0 ? formatMoney(finalTotal) : annualPrice}</span>
                    <span className="pricing-period">/year</span>
                  </div>
                  {finalTotal > 0 && (
                    <span className="pricing-monthly">≈ {formatMoney(Math.round(finalTotal / 12))} / month</span>
                  )}
                </div>
                <div className="pricing-body">
                  <ul>
                    <li className="promo-item" style={{ color: accentColor }}>Unlimited hiring manager seats</li>
                    <li>Full AI Copilot &amp; Screening</li>
                    <li>Career site builder with custom domain</li>
                    <li>Job board distribution</li>
                    <li>Self-scheduling &amp; calendar integration</li>
                    <li>Candidate CRM &amp; nurture campaigns</li>
                    <li>Real-time analytics &amp; reporting</li>
                    <li>GDPR compliance engine</li>
                    {waivedAddOns.map((a: any) => (
                      <li key={a.id} className="promo-item" style={{ color: accentColor }}>
                        {a.name} — Included ✓
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ── Line-Item Breakdown Table ── */}
          {(paidAddOns.length > 0 || pricingDiscountPct > 0 || pricingContractTerm > 1) && (
            <div style={{ marginTop: 24, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <tbody>
                  {/* Base */}
                  <tr>
                    <td style={{ padding: '10px 16px', color: 'var(--color-text-secondary)' }}>{isMultiEntity ? 'Platform Total' : 'Base Platform'}</td>
                    <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-primary)' }}>{formatMoney(effectiveBase)}/yr</td>
                  </tr>
                  {/* Paid Add-Ons */}
                  {paidAddOns.map((a: any) => (
                    <tr key={a.id}>
                      <td style={{ padding: '8px 16px', color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border-light)' }}>{a.name}</td>
                      <td style={{ padding: '8px 16px', textAlign: 'right', color: 'var(--color-text-primary)', borderTop: '1px solid var(--color-border-light)' }}>+{formatMoney(a.price)}</td>
                    </tr>
                  ))}
                  {/* Waived Add-Ons */}
                  {waivedAddOns.map((a: any) => (
                    <tr key={a.id}>
                      <td style={{ padding: '8px 16px', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border-light)' }}>{a.name}</td>
                      <td style={{ padding: '8px 16px', textAlign: 'right', borderTop: '1px solid var(--color-border-light)' }}>
                        <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', marginRight: 8 }}>{formatMoney(a.price)}</span>
                        <span style={{ color: accentColor, fontWeight: 600 }}>Included</span>
                      </td>
                    </tr>
                  ))}
                  {/* Discount */}
                  {pricingDiscountPct > 0 && (
                    <tr>
                      <td style={{ padding: '10px 16px', color: '#10b981', fontWeight: 600, borderTop: '1px solid var(--color-border-light)' }}>Discount ({pricingDiscountPct}%)</td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', color: '#10b981', fontWeight: 600, borderTop: '1px solid var(--color-border-light)' }}>−{formatMoney(discountAmount)}</td>
                    </tr>
                  )}
                  {/* Total */}
                  <tr style={{ background: 'var(--color-bg-subtle)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-primary)', borderTop: '2px solid var(--color-border-light)' }}>Annual Investment</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, fontSize: '0.95rem', color: accentColor, borderTop: '2px solid var(--color-border-light)' }}>{formatMoney(finalTotal)}/yr</td>
                  </tr>
                  {/* Multi-year TCV */}
                  {pricingContractTerm > 1 && (
                    <tr>
                      <td style={{ padding: '8px 16px', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{pricingContractTerm}-Year Total Contract Value</td>
                      <td style={{ padding: '8px 16px', textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.78rem', fontWeight: 600 }}>{formatMoney(finalTotal * pricingContractTerm)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Contract Terms ── */}
          {(pricingPriceCapPct || pricingPromoFreeMonths || pricingContractTerm > 1) && (
            <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              {pricingContractTerm > 1 && (
                <div style={{ padding: '16px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-light)' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 4 }}>Contract Term</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{pricingContractTerm} Year{pricingContractTerm > 1 ? 's' : ''}</div>
                </div>
              )}
              {pricingPriceCapPct != null && pricingPriceCapPct > 0 && (
                <div style={{ padding: '16px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-light)' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 4 }}>Annual Price Cap</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{pricingPriceCapPct}% max increase</div>
                </div>
              )}
              {pricingPromoFreeMonths != null && pricingPromoFreeMonths > 0 && (
                <div style={{ padding: '16px', background: `${accentColor}08`, borderRadius: 'var(--radius-sm)', border: `1px solid ${accentColor}20` }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: accentColor, marginBottom: 4 }}>{pricingPromoLabel || 'Promotional Offer'}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{pricingPromoFreeMonths} Free Month{pricingPromoFreeMonths > 1 ? 's' : ''}</div>
                </div>
              )}
            </div>
          )}

          {/* ── Pricing Notes ── */}
          {pricingNotes && (
            <div style={{ marginTop: 24, padding: '20px 24px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 8 }}>Notes</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>{pricingNotes}</p>
            </div>
          )}

          {/* ── Bottom Line Summary ── */}
          <div className="summary-box">
            <h3>Bottom Line</h3>
            <p>
              {roiMultiple > 0
                ? `At ${formatMoney(finalTotal)}/yr, Teamtailor delivers a projected ${roiMultiple}x return on investment. The price you see is the price you pay — no usage-based AI fees, no per-seat charges for hiring managers, no surprises when it's time to renew.`
                : `The price you see is the price you pay — no usage-based AI fees, no per-seat charges for hiring managers, no surprises when it's time to renew. Teamtailor is flat-rate, all-inclusive, and built to scale with ${companyName}.`
              }
            </p>
          </div>
        </section>
      ))}

      {/* ═══════════════════════════════════════════
          12. MINIMUM STANDARDS
          ═══════════════════════════════════════════ */}
      {gated('minimumStandards', 'Minimum Standards', (
        <section className="page" id="minimum-standards">
          <div className="section-number" style={{ color: accentColor }}>{sectionNumber('minimumStandards')}</div>
          <h2 className="section-title">Minimum Standards</h2>
          <p className="section-subtitle">What we ask of our most successful customers</p>

          <div className="section-intro">
            <p>
              Every Teamtailor customer that achieves exceptional results shares three commitments.
              These aren't barriers — they're the foundation for a successful partnership.
            </p>
          </div>

          <div className="challenge-list">
            <div className="challenge-item">
              <div className="challenge-num" style={{ color: accentColor }}>01</div>
              <div className="challenge-content">
                <h3>Executive Sponsor</h3>
                <p>A named leader who champions the project internally and removes blockers when they arise.</p>
              </div>
            </div>
            <div className="challenge-item">
              <div className="challenge-num" style={{ color: accentColor }}>02</div>
              <div className="challenge-content">
                <h3>Dedicated Admin</h3>
                <p>A primary point of contact who owns the platform configuration and drives adoption across the team.</p>
              </div>
            </div>
            <div className="challenge-item">
              <div className="challenge-num" style={{ color: accentColor }}>03</div>
              <div className="challenge-content">
                <h3>Training Completion</h3>
                <p>All key users complete the onboarding training program within the first 30 days to maximize time-to-value.</p>
              </div>
            </div>
            {customMinStandards.map((std: any, idx: number) => (
              <div className="challenge-item" key={idx}>
                <div className="challenge-num" style={{ color: accentColor }}>{padNum(idx + 4)}</div>
                <div className="challenge-content">
                  <h3>{typeof std === 'string' ? std : std?.label || ''}</h3>
                </div>
              </div>
            ))}

          </div>
        </section>
      ))}

      {/* ═══════════════════════════════════════════
          13. CONTRACT & SECURITY
          ═══════════════════════════════════════════ */}
      {gated('contractSecurity', 'Contract & Security', (
        <section className="page" id="contract-security">
          <div className="section-number" style={{ color: accentColor }}>{sectionNumber('contractSecurity')}</div>
          <h2 className="section-title">Contract &amp; Security</h2>
          <p className="section-subtitle">Enterprise-grade compliance and data protection</p>

          <div className="section-intro">
            <p>
              Teamtailor meets the highest standards for data security, privacy, and regulatory compliance.
              Your data is protected by industry-leading certifications and frameworks.
            </p>
          </div>

          <div className="highlight-grid">
            {trustBadges.soc2 !== false && (
              <div className="highlight-card">
                <div className="highlight-icon" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                  <span style={{ fontSize: '1.2rem' }}>🛡️</span>
                </div>
                <h3>SOC 2 Type II</h3>
                <p>Independently audited for security, availability, and confidentiality controls.</p>
              </div>
            )}
            {trustBadges.iso27001 !== false && (
              <div className="highlight-card">
                <div className="highlight-icon" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                  <span style={{ fontSize: '1.2rem' }}>🔒</span>
                </div>
                <h3>ISO 27001</h3>
                <p>Certified information security management system meeting international standards.</p>
              </div>
            )}
            {trustBadges.iso27701 !== false && (
              <div className="highlight-card">
                <div className="highlight-icon" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                  <span style={{ fontSize: '1.2rem' }}>🔐</span>
                </div>
                <h3>ISO 27701</h3>
                <p>Privacy information management certification for personal data processing.</p>
              </div>
            )}
            {trustBadges.gdpr !== false && (
              <div className="highlight-card">
                <div className="highlight-icon" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                  <span style={{ fontSize: '1.2rem' }}>🇪🇺</span>
                </div>
                <h3>GDPR Compliant</h3>
                <p>Full compliance with EU data protection regulations including automated data retention and consent management.</p>
              </div>
            )}
            {trustBadges.responsibleAi !== false && (
              <div className="highlight-card">
                <div className="highlight-icon" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                  <span style={{ fontSize: '1.2rem' }}>🤖</span>
                </div>
                <h3>Responsible AI</h3>
                <p>AI features built with transparency, fairness, and human oversight at every step.</p>
              </div>
            )}
            {trustBadges.euAiAct !== false && (
              <div className="highlight-card">
                <div className="highlight-icon" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                  <span style={{ fontSize: '1.2rem' }}>⚖️</span>
                </div>
                <h3>EU AI Act Ready</h3>
                <p>Proactive compliance with the EU AI Act's requirements for high-risk AI in employment.</p>
              </div>
            )}
          </div>

          {showReviewBadges && (
            <div className="summary-box" style={{ marginTop: 24 }}>
              <h3>Industry Recognition</h3>
              <p>
                Teamtailor is consistently rated a top ATS on G2, Capterra, and TrustRadius —
                with industry-leading scores in ease of use, customer support, and overall satisfaction.
              </p>
            </div>
          )}
        </section>
      ))}

      {/* ═══════════════════════════════════════════
          14. MUTUAL ACTION PLAN
          ═══════════════════════════════════════════ */}
      {gated('map', 'Mutual Action Plan', (
        <section className="page" id="map">
          <div className="section-number" style={{ color: accentColor }}>{sectionNumber('map')}</div>
          <h2 className="section-title">Mutual Action Plan</h2>
          <p className="section-subtitle">Agreed milestones to keep this evaluation on track</p>

          {mapMilestones.length > 0 ? (
            <div className="deal-timeline">
              {mapMilestones.map((milestone, idx) => (
                <div className="deal-step" key={milestone.id}>
                  <div className={`deal-dot ${milestone.done ? 'done' : idx === 0 ? 'active' : 'future'}`}
                    style={!milestone.done && idx === 0 ? { background: accentColor, boxShadow: `0 0 0 4px ${accentColor}33` } : undefined}
                  >
                    {milestone.done ? '✓' : padNum(idx + 1)}
                  </div>
                  <div className="deal-step-content">
                    <h4>{milestone.label}</h4>
                    <p>
                      {milestone.owner && <>{milestone.owner} · </>}
                      {milestone.dueDate && <>Due: {milestone.dueDate}</>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="section-intro">
              <p>The mutual action plan will be built collaboratively once both teams agree on the evaluation timeline.</p>
            </div>
          )}
        </section>
      ))}

      {/* ═══════════════════════════════════════════
          ALIGNMENT CHECKLIST (D4 Confirmation Close)
          ═══════════════════════════════════════════ */}
      {gated('alignmentChecklist', 'Alignment Checklist', (
        <section className="page" id="alignment-checklist">
          <div className="section-number" style={{ color: accentColor }}>{sectionNumber('alignmentChecklist')}</div>
          <h2 className="section-title">Alignment Checklist</h2>
          <p className="section-subtitle">Confirming mutual alignment before moving forward</p>

          {/* Priority + Ability Scale Echo */}
          {(priorityRating || abilityRating) && (
            <div className="highlight-grid" style={{ marginBottom: 32 }}>
              {priorityRating != null && priorityRating > 0 && (
                <div className="highlight-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <h3 style={{ margin: 0, fontSize: '0.9rem' }}>Priority (CP1)</h3>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: accentColor }}>{priorityRating}/10</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--color-border-light)', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${priorityRating * 10}%`, background: accentColor, borderRadius: 100 }} />
                  </div>
                </div>
              )}
              {abilityRating != null && abilityRating > 0 && (
                <div className="highlight-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <h3 style={{ margin: 0, fontSize: '0.9rem' }}>Need for Help (CP2)</h3>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: abilityRating <= 4 ? '#ef4444' : abilityRating <= 7 ? '#f59e0b' : '#10b981' }}>{abilityRating}/10</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--color-border-light)', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${abilityRating * 10}%`, background: abilityRating <= 4 ? '#ef4444' : abilityRating <= 7 ? '#f59e0b' : '#10b981', borderRadius: 100 }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3 Confirmation Checkboxes */}
          <div className="challenge-list">
            <div className="challenge-item">
              <div className="challenge-num" style={{ color: alignmentChecks.problems_solutions ? '#10b981' : accentColor }}>
                {alignmentChecks.problems_solutions ? '✓' : '01'}
              </div>
              <div className="challenge-content">
                <h3>Aligned on Problems & Solution</h3>
                <p>Are we aligned on the problems needing to be solved, and are you clear on how we solve them?</p>
              </div>
            </div>
            <div className="challenge-item">
              <div className="challenge-num" style={{ color: alignmentChecks.roi_sufficient ? '#10b981' : accentColor }}>
                {alignmentChecks.roi_sufficient ? '✓' : '02'}
              </div>
              <div className="challenge-content">
                <h3>Aligned on Outcomes & ROI</h3>
                <p>Are we aligned on the expected outcomes, and now that you know our pricing, is the ROI sufficient?</p>
              </div>
            </div>
            <div className="challenge-item">
              <div className="challenge-num" style={{ color: alignmentChecks.right_solution ? '#10b981' : accentColor }}>
                {alignmentChecks.right_solution ? '✓' : '03'}
              </div>
              <div className="challenge-content">
                <h3>The Right Solution</h3>
                <p>With alignment on all of that — are we the right solution to solve your problems and get you to where you're wanting to go?</p>
              </div>
            </div>
          </div>

          {alignmentChecks.problems_solutions && alignmentChecks.roi_sufficient && alignmentChecks.right_solution && (
            <div className="roi-summary-box" style={{ marginTop: 32 }}>
              <h3>Full Alignment Confirmed ✓</h3>
              <p>
                {companyName} has confirmed alignment on the problems, the solution, and the path forward.
                We're looking forward to partnering together.
              </p>
            </div>
          )}
        </section>
      ))}

      {/* ═══════════════════════════════════════════
          NEXT STEPS
          ═══════════════════════════════════════════ */}
      {gated('proposal', 'Next Steps', (
        <section className="page" id="next-steps">
          <div className="section-number" style={{ color: accentColor }}>{sectionNumber('proposal')}</div>
          <h2 className="section-title">Next Steps</h2>
          <p className="section-subtitle">No pressure, no rush — just a clear path forward</p>

          <div className="next-steps-list">
            <div className="next-step">
              <div className="step-num" style={{ background: accentColor }}>1</div>
              <div className="step-content">
                <h3>Review This Document</h3>
                <p>Share with your team and identify any gaps against your internal requirements.</p>
              </div>
            </div>
            <div className="next-step">
              <div className="step-num" style={{ background: accentColor }}>2</div>
              <div className="step-content">
                <h3>Custom Demo Environment</h3>
                <p>{preparedBy} can build a sandbox with {companyName}'s branding, job templates, and sample data for your team to explore.</p>
              </div>
            </div>
            {session?.next_action && (
              <div className="next-step">
                <div className="step-num" style={{ background: accentColor }}>3</div>
                <div className="step-content">
                  <h3>Agreed Next Action</h3>
                  <p>{session.next_action}</p>
                </div>
              </div>
            )}
          </div>

          {session?.next_meeting_date && (
            <div className="quote-callout info" style={{ borderLeftColor: accentColor, marginBottom: 32 }}>
              <blockquote>Next meeting scheduled: <strong>{session.next_meeting_date}</strong></blockquote>
              <cite>— Confirmed during our last conversation</cite>
            </div>
          )}

          <div className="contact-box">
            <h3>Your Teamtailor Contact</h3>
            <div className="contact-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="contact-person">
                <div className="contact-avatar" style={{ background: accentColor }}>
                  {preparedBy.substring(0, 2).toUpperCase()}
                </div>
                <div className="contact-info">
                  <strong>{preparedBy}</strong>
                  <span>Account Executive</span>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 8, fontStyle: 'italic', lineHeight: 1.5 }}>
                    Ready to build a custom demo, answer any questions, or put together a proposal whenever you're ready.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="deal-timeline" style={{ marginTop: 32 }}>
            <h3 style={{ marginBottom: 20 }}>Where We Are in the Process</h3>
            <div className="deal-step">
              <div className="deal-dot done">✓</div>
              <div className="deal-step-content">
                <h4>Discovery Call</h4>
                <p>Understood {companyName}'s needs, current pain points, and technology landscape</p>
              </div>
            </div>
            <div className="deal-step">
              <div className="deal-dot active" style={{ background: accentColor, boxShadow: `0 0 0 4px ${accentColor}33` }}>★</div>
              <div className="deal-step-content">
                <h4>Business Case Delivered</h4>
                <p>This document — a benchmark for what best-in-class ATS looks like</p>
              </div>
            </div>
            <div className="deal-step">
              <div className="deal-dot future">3</div>
              <div className="deal-step-content">
                <h4>Custom Demo &amp; Proposal</h4>
                <p>A personalized walkthrough with {companyName}'s branding and workflows</p>
              </div>
            </div>
          </div>
        </section>
      ))}
      {/* Uncategorized widgets that don't map to a section */}
      {unmappedWidgets.length > 0 && unmappedWidgets.map((widget: any, idx: number) => (
        <section className="page" key={`widget-extra-${idx}`}>
          <div className="section-number" style={{ color: accentColor }}>+{padNum(idx + 1)}</div>
          <h2 className="section-title">{widget.title || `Additional Resource`}</h2>
          {widget.description && <p className="section-subtitle">{widget.description}</p>}
          <WidgetRenderer widget={widget} accentColor={accentColor} />
        </section>
      ))}

    </div>
  );
}
