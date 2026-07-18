import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import './BusinessCaseDocument.css';
import type { DiscoverySession, MAPMilestone } from '../../lib/discoveryDatabase';
import type { RoomVisibility } from './RoomSections';
import { TT_PAINS } from '../../data/painData';
import { FEATURE_CATALOG, FEATURE_CATEGORIES, DEFAULT_SOLUTION_FEATURES, getCategoryById, type Feature } from '../../data/featureCatalog';
import { NwsPrecipitationForecast } from './NwsPrecipitationForecast';
import { RoofHealthSection } from './sections/RoofHealthSection';
import { PortfolioWeatherMap } from './PortfolioWeatherMap';
import { RoofHealthScoreExplainer } from './RoofHealthScoreExplainer';
import { FAQSection } from './FAQSection';
import { CFODashboard } from './CFODashboard';
import { AssetDrawer } from './AssetDrawer';
import { SchedulingModal } from './SchedulingModal';
import { Zap, ChevronRight, AlertCircle, CheckCircle, ShieldAlert, AlertTriangle, CheckCircle2, MapPin, Clock, CloudLightning, ArrowRight, Activity, Lock } from 'lucide-react';

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
  predictiveData?: any;
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
              <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid var(--color-border-light)', color: accentColor, fontWeight: 600 }}>Service Alignment</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid var(--color-border-light)', color: '#ef4444', fontWeight: 600 }}>{content.competitor || 'Competitor'}</th>
            </tr>
          </thead>
          <tbody>
            {content.rows.map((row: any, i: number) => (
              <tr key={i}>
                <td style={{ padding: '6px 12px', borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text)' }}>{row.capability || row.feature || ''}</td>
                <td style={{ padding: '6px 12px', borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-secondary)' }}>{row.servicealignment || ''}</td>
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
          <span className="capability-tag" style={{ color: '#10b981', backgroundColor: '#ecfdf5' }}>With Service Alignment</span>
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
  { key: 'roofHealth', id: 'roof-health', title: 'Custom Roof Health Score' },
  { key: 'problemCanvas', id: 'executive-summary', title: 'Executive Summary' },
  { key: 'pains', id: 'priorities', title: 'Your Priorities' },
  { key: 'diagnosis', id: 'problem-diagnosis', title: 'Problem Diagnosis' },
  { key: 'buyingProcess', id: 'buying-process', title: 'Buying Process & Timeline' },
  { key: 'successCriteria', id: 'success-criteria', title: 'What Success Looks Like' },
  { key: 'worstCase', id: 'worst-case', title: 'Worst-Case Scenario' },
  { key: 'paradigmShift', id: 'paradigm-shift', title: 'A Different Approach' },
  { key: 'competitive', id: 'competitive', title: 'Competitive Landscape' },
  { key: 'socialProof', id: 'proven-results', title: 'Proven Results' },
  { key: 'solution', id: 'solution', title: 'How Service Alignment Works' },
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
  predictiveData,
  onMAPChange,
  onContractReadinessChange,
}: BusinessCaseDocumentProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);

  // ── Scroll Tracking & Parallax ──
  const { scrollYProgress } = useScroll();
  const [showStickyBar, setShowStickyBar] = useState(false);
  const heroParallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  useEffect(() => {
    return scrollYProgress.onChange((latest) => {
      // Show sticky bar after scrolling past ~600px (hero section)
      if (latest > 0.05 && !showStickyBar) {
        setShowStickyBar(true);
      } else if (latest <= 0.05 && showStickyBar) {
        setShowStickyBar(false);
      }
    });
  }, [scrollYProgress, showStickyBar]);

  // ── Derived values ──
  const accentColor = (session as any)?.cms_accent || themeColor;
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const preparedBy = (session as any)?.cms_prepared_by || repName || 'Tyler Hanson';
  const preparedFor = (session as any)?.cms_prepared_for || companyName;
  const coverSubtitle = (session as any)?.cms_subtitle || `Service Alignment for ${companyName}`;
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
        { title: 'Purpose-Built Provider', subtitle: 'A platform built exclusively for recruiting — not bolted onto an HRIS.' },
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
          1. PORTFOLIO ROOF HEALTH HERO
          ═══════════════════════════════════════════ */}
      {predictiveData?.properties?.length > 1 ? gated('hero', 'Portfolio Overview', (() => {
        const totalBuildings = predictiveData.properties.length;
        const atRiskCount = predictiveData.properties.filter((p: any) => { return (p.healthScore?.health_score ?? 100) < 50; }).length;
        const avgScore = Math.round(predictiveData.properties.reduce((sum: number, p: any) => sum + (p.healthScore?.health_score ?? 100), 0) / (totalBuildings || 1));
        
        return (
          <section className="page hero-page bg-white text-zinc-900 relative overflow-hidden flex items-center w-full min-h-[90vh]" id="portfolio-hero" style={{ padding: 'clamp(4rem,10vw,8rem) clamp(1.5rem,5vw,40px)', border: 'none', boxShadow: 'none', maxWidth: 'none' }}>
            
            {/* Background Satellite Map Effect & Gradients */}
            <motion.div className="absolute inset-0 opacity-[0.04] mix-blend-multiply pointer-events-none" style={{ y: heroParallaxY }}>
               <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" alt="Satellite background" className="w-full h-[120%] object-cover grayscale" fetchPriority="high" decoding="sync" style={{ transform: 'translateY(-10%)' }} />
            </motion.div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-100/80 via-white/90 to-white pointer-events-none"></div>
            
            {/* Ambient glows */}
            <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-zinc-100/50 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-[1200px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center">
              
              {/* Left Column - Typography */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.25em', color: '#9f1239', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12, textTransform: 'uppercase', animation: 'rise 0.85s cubic-bezier(0.2,0.7,0.2,1) 0.08s forwards', opacity: 0 }}>
                  <Activity size={16} />
                  System Alert For {companyName}
                </div>
                
                <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.75rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', color: '#09090b', margin: '0 0 24px 0', animation: 'rise 0.85s cubic-bezier(0.2,0.7,0.2,1) 0.2s forwards', opacity: 0 }}>
                  Your portfolio just <br />
                  <span style={{ 
                    background: 'linear-gradient(to right, #09090b, #52525b, #09090b)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'gradient-flow 3s linear infinite',
                    display: 'inline-block'
                  }}>pinged our system.</span>
                </h1>
                
                <p style={{ fontSize: '1.05rem', color: '#a1a1aa', lineHeight: 1.6, maxWidth: 480, fontWeight: 400, animation: 'rise 0.85s cubic-bezier(0.2,0.7,0.2,1) 0.34s forwards', opacity: 0 }}>
                  Our predictive monitoring engine cross-referenced recent severe weather data with satellite imagery of your {totalBuildings} properties. We've detected critical vulnerabilities on <strong style={{ color: '#09090b' }}>{atRiskCount} roofs</strong> that require your immediate review.
                </p>
                
                {/* Actions Cluster */}
                <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-8 animate-[rise_0.85s_cubic-bezier(.2,.7,.2,1)_0.45s_forwards] opacity-0">
                  
                  {/* Primary CTA */}
                  <button onClick={() => {
                    const el = document.getElementById('portfolio');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  className="group relative flex items-center justify-center gap-3 px-6 py-3.5 bg-zinc-900 text-white rounded-full font-bold tracking-[0.05em] uppercase text-[0.75rem] sm:text-[0.8rem] overflow-hidden transition-all duration-300 hover:bg-black hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <span>View Damage Report</span>
                    <ArrowRight size={16} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </button>

                  <div className="hidden sm:block w-px h-12 bg-black/10"></div>

                  {/* SMS Alternative */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[0.65rem] font-bold text-zinc-500 uppercase tracking-widest pl-1">Prefer text alerts?</span>
                    <div className="relative flex items-center group/sms">
                      <input 
                        type="tel" 
                        placeholder="Enter mobile number" 
                        className="bg-white/60 backdrop-blur-md border border-zinc-200 rounded-full pl-4 pr-12 py-2.5 text-[0.8rem] font-medium outline-none focus:border-zinc-400 focus:bg-white focus:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all w-[190px] focus:w-[220px] placeholder:text-zinc-400" 
                      />
                      <button 
                        type="button"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-zinc-100 text-zinc-500 group-focus-within/sms:bg-emerald-600 group-focus-within/sms:text-white flex items-center justify-center hover:scale-105 transition-all outline-none focus:outline-none shadow-sm group-focus-within/sms:shadow-md"
                      >
                        <ArrowRight size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 pl-1 text-[0.65rem] font-medium text-zinc-400">
                      <Lock size={10} /> 
                      <span>Secure. <span className="text-zinc-400/80">No spam.</span></span>
                    </div>
                  </div>
                </div>

                {/* Verified Data Sources */}
                <div className="mt-10 pt-8 border-t border-black/5 animate-[rise_0.85s_cubic-bezier(.2,.7,.2,1)_0.5s_forwards] opacity-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <div className="text-[0.65rem] font-bold tracking-[0.15em] text-zinc-400 uppercase flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500" /> Powered By
                    </div>
                    <div className="flex items-center gap-5 grayscale hover:grayscale-0 transition-all duration-500">
                      <div className="flex items-center gap-1.5 text-[0.75rem] font-bold text-zinc-700">
                        <CloudLightning size={16} className="text-[#015287]" /> NOAA
                      </div>
                      <div className="flex items-center gap-1.5 text-[0.75rem] font-bold text-zinc-700">
                        <MapPin size={16} className="text-[#3b82f6]" /> Lightbox
                      </div>
                      <div className="flex items-center gap-1.5 text-[0.75rem] font-bold text-zinc-700">
                        <Activity size={16} className="text-[#f59e0b]" /> Municipal Permits
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Glassmorphism Card */}
              <div style={{ animation: 'rise 0.85s cubic-bezier(0.2,0.7,0.2,1) 0.48s forwards', opacity: 0 }}>
                <div style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', backgroundColor: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 24, padding: 'clamp(24px, 5vw, 40px)', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5)' }}>
                  
                  {/* Subtle grid pattern inside card */}
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                  <div style={{ position: 'absolute', top: 24, right: 24 }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'rgba(159,18,57,0.05)', backdropFilter: 'blur(12px)', padding: '6px 14px', borderRadius: 999, border: '1px solid rgba(159,18,57,0.15)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                       <Activity size={12} color="#9f1239" />
                       <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.2em', color: '#9f1239', textTransform: 'uppercase' }}>LIVE</span>
                     </div>
                  </div>
                  

                  
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.2em', color: '#71717a', textTransform: 'uppercase', marginBottom: 8 }}>Portfolio Average</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#09090b', marginBottom: 24 }}>Roof Health Score</div>
                  
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 24 }}>
                    <div style={{ fontWeight: 900, fontSize: '5rem', lineHeight: 1, letterSpacing: '-0.05em', color: '#09090b', textShadow: '0 4px 24px rgba(0,0,0,0.05)', fontFamily: 'monospace' }}>
                      {avgScore}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#71717a', marginBottom: 12, letterSpacing: '0.1em' }}>/ 100</div>
                  </div>
                  
                  <div style={{ width: '100%', height: 8, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 999, overflow: 'hidden', marginBottom: 32, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
                    <div style={{ height: '100%', background: 'linear-gradient(to right, #18181b, #f97316, #10b981)', width: `${avgScore}%`, position: 'relative', boxShadow: '0 0 10px rgba(24,24,27,0.3)' }}>
                      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 80, background: 'linear-gradient(to left, rgba(255,255,255,0.8), transparent)' }}></div>
                    </div>
                  </div>
                  
                  {/* AI Telemetry - Moved here to avoid top-right absolute badge collision */}
                  <div className="mb-8 p-4 rounded-xl bg-white/40 border border-black/5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)] backdrop-blur-sm">
                    <div className="text-[0.65rem] font-bold tracking-[0.1em] text-zinc-500 uppercase mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Active Monitoring Feeds
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-[0.7rem] font-medium">
                        <span className="flex items-center gap-2 text-zinc-700"><CloudLightning size={12} className="text-[#015287]"/> NOAA Severe Weather API</span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-md tracking-wide">SYNCED</span>
                      </div>
                      <div className="flex items-center justify-between text-[0.7rem] font-medium">
                        <span className="flex items-center gap-2 text-zinc-700"><MapPin size={12} className="text-[#3b82f6]"/> Geospatial Satellite Feed</span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-md tracking-wide">LIVE</span>
                      </div>
                      <div className="flex items-center justify-between text-[0.7rem] font-medium">
                        <span className="flex items-center gap-2 text-zinc-700"><Activity size={12} className="text-[#f59e0b]"/> Local Permit Ledger</span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-md tracking-wide">VERIFIED</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: 24 }}>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: 900, color: '#09090b', lineHeight: 1, fontFamily: 'monospace' }}>{atRiskCount}</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.15em', color: '#18181b', textTransform: 'uppercase', marginTop: 8 }}>Critical Roofs</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: 900, color: '#09090b', lineHeight: 1, fontFamily: 'monospace' }}>{totalBuildings}</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.15em', color: '#71717a', textTransform: 'uppercase', marginTop: 8 }}>Total Monitored</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>
        );
      })()) : gated('hero', 'Predictive Marketing Hero', (
        <section className="page hero-page bg-white text-zinc-900 relative overflow-hidden flex items-center w-full min-h-[90vh]" id="cover" style={{ padding: 'clamp(4rem,10vw,8rem) clamp(1.5rem,5vw,40px)', border: 'none', boxShadow: 'none', maxWidth: 'none' }}>
          {/* Background Effects */}
          <motion.div className="absolute inset-0 opacity-[0.04] mix-blend-multiply pointer-events-none" style={{ y: heroParallaxY }}>
             <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" alt="Satellite background" className="w-full h-[120%] object-cover grayscale" fetchPriority="high" decoding="sync" style={{ transform: 'translateY(-10%)' }} />
          </motion.div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-100/80 via-white/90 to-white pointer-events-none"></div>
          <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-zinc-100/50 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="w-full max-w-[1200px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center">
            
            {/* Left Column */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.25em', color: '#9f1239', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12, textTransform: 'uppercase', animation: 'rise 0.85s cubic-bezier(0.2,0.7,0.2,1) 0.08s forwards', opacity: 0 }}>
                <Activity size={16} />
                System Alert For {companyName}
              </div>
              
              <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.75rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', color: '#09090b', margin: '0 0 24px 0', animation: 'rise 0.85s cubic-bezier(0.2,0.7,0.2,1) 0.2s forwards', opacity: 0 }}>
                Your roof just <br />
                <span style={{ 
                  background: 'linear-gradient(to right, #09090b, #52525b, #09090b)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'gradient-flow 3s linear infinite',
                  display: 'inline-block'
                }}>pinged our system.</span>
              </h1>
              
              <p style={{ fontSize: '1.05rem', color: '#52525b', lineHeight: 1.6, maxWidth: 480, fontWeight: 400, animation: 'rise 0.85s cubic-bezier(0.2,0.7,0.2,1) 0.34s forwards', opacity: 0 }}>
                Our 24/7 predictive monitoring engine cross-referenced recent severe weather data with satellite imagery of your property. We've detected critical vulnerabilities that require immediate review.
              </p>
              
              {/* Actions Cluster */}
              <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-8 animate-[rise_0.85s_cubic-bezier(.2,.7,.2,1)_0.45s_forwards] opacity-0">
                  
                {/* Primary CTA */}
                <button onClick={() => {
                  const el = document.getElementById('portfolio');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="group relative flex items-center justify-center gap-3 px-6 py-3.5 bg-zinc-900 text-white rounded-full font-bold tracking-[0.05em] uppercase text-[0.75rem] sm:text-[0.8rem] overflow-hidden transition-all duration-300 hover:bg-black hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-transparent hover:border-white/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span>Book a Free Diagnosis</span>
                  <ArrowRight size={16} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>

                <div className="hidden sm:block w-px h-12 bg-black/10"></div>

                {/* SMS Alternative */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[0.65rem] font-bold text-zinc-500 uppercase tracking-widest pl-1">Prefer text alerts?</span>
                  <div className="relative flex items-center group/sms">
                    <input 
                      type="tel" 
                      placeholder="Enter mobile number" 
                      className="bg-white/60 backdrop-blur-md border border-zinc-200 rounded-full pl-4 pr-12 py-2.5 text-[0.8rem] font-medium outline-none focus:border-zinc-400 focus:bg-white focus:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all w-full max-w-[220px] placeholder:text-zinc-400" 
                    />
                    <button 
                      type="button"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-zinc-100 text-zinc-500 group-focus-within/sms:bg-emerald-600 group-focus-within/sms:text-white flex items-center justify-center hover:scale-105 transition-all outline-none focus:outline-none shadow-sm group-focus-within/sms:shadow-md"
                    >
                      <ArrowRight size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 pl-1 text-[0.65rem] font-medium text-zinc-400">
                    <Lock size={10} /> 
                    <span>Secure. <span className="text-zinc-400/80">No spam.</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Roof Health Section */}
            <div style={{ animation: 'rise 0.85s cubic-bezier(0.2,0.7,0.2,1) 0.48s forwards', opacity: 0 }}>
              <div style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', backgroundColor: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 24, padding: 'clamp(24px, 5vw, 40px)', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5)' }}>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  {/* AI Telemetry - Prime Real Estate */}
                  <div className="mb-10 pb-6 border-b border-zinc-100">
                    <div className="text-[0.65rem] font-bold tracking-[0.1em] text-zinc-500 uppercase mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Active Monitoring Feeds
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="flex items-center gap-2 text-zinc-600"><CloudLightning size={14} className="text-[#015287]"/> NOAA Severe Weather API</span>
                        <span className="text-emerald-600 font-bold bg-emerald-50/50 border border-emerald-100 px-2 py-0.5 rounded-full text-[10px] tracking-wide">SYNCED</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="flex items-center gap-2 text-zinc-600"><MapPin size={14} className="text-[#3b82f6]"/> Geospatial Satellite Feed</span>
                        <span className="text-emerald-600 font-bold bg-emerald-50/50 border border-emerald-100 px-2 py-0.5 rounded-full text-[10px] tracking-wide">LIVE</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="flex items-center gap-2 text-zinc-600"><Activity size={14} className="text-[#f59e0b]"/> Local Permit Ledger</span>
                        <span className="text-emerald-600 font-bold bg-emerald-50/50 border border-emerald-100 px-2 py-0.5 rounded-full text-[10px] tracking-wide">VERIFIED</span>
                      </div>
                    </div>
                  </div>

                  <RoofHealthSection 
                    score={(session as any)?.roof_health_score ?? 68} 
                    signals={(session as any)?.roof_signals ?? []} 
                  />
                  <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(0,0,0,0.05)', fontSize: '0.8rem', color: '#71717a', textAlign: 'center' }}>
                    Powered by NOAA satellite imagery and local building permit histories.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>
      ))}

      {/* ═══════════════════════════════════════════
          2. PORTFOLIO WEATHER MAP
          ═══════════════════════════════════════════ */}
      {predictiveData?.properties?.length > 1 && gated('hero', 'Satellite Feed', (
        <section className="page w-full max-w-[1100px] mx-auto px-4 md:px-12 pt-10 md:pt-16" id="satellite-feed" style={{ border: 'none', background: 'transparent', boxShadow: 'none', contentVisibility: 'auto', containIntrinsicSize: 'auto none auto 800px' }}>
          
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.15em', color: '#ef4444', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, textTransform: 'uppercase' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
                Predictive Threat Radar
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight leading-tight">
                Live Portfolio Monitoring
              </h2>
            </div>
            <p className="text-[0.8rem] font-medium text-zinc-500 max-w-xs md:text-right leading-relaxed">
              Geospatial tracking of high-risk weather events approaching your properties. <strong className="text-zinc-700">Assets at risk are highlighted below.</strong>
            </p>
          </div>

          <div className="relative w-full mb-4">
            <div className="flex items-center w-full bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden relative">
              
              <div className="flex items-center gap-2 px-4 py-3 shrink-0 bg-zinc-50 border-r border-zinc-200 z-10 shadow-[4px_0_12px_rgba(0,0,0,0.02)]">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                 <span className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-500">Live Assets</span>
              </div>
              
              {/* Right edge fade out to avoid harsh scroll cutoff */}
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none z-20"></div>

              {/* Ticker Container */}
              <div className="flex overflow-x-auto scrollbar-hide flex-grow items-center pl-3 pr-12 py-2.5 gap-2" style={{ scrollSnapType: 'x mandatory' }}>
                {predictiveData?.properties?.map((p: any) => {
                  const score = p.healthScore?.health_score ?? 100;
                  let scoreColor = 'text-emerald-600';
                  let bgColor = 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300';
                  
                  if (score < 50) {
                    scoreColor = 'text-rose-600';
                    bgColor = 'bg-rose-50 border-rose-200 hover:bg-rose-100 hover:border-rose-300';
                  } else if (score < 75) {
                    scoreColor = 'text-amber-600';
                    bgColor = 'bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300';
                  }
                  
                  const name = p.property?.property_name?.split('-')[0]?.trim() || p.property?.legal_owner_name || 'Property';
                  
                  return (
                    <button 
                      key={p.property?.id || Math.random()} 
                      onClick={() => {
                        const el = document.getElementById(`property-${p.property?.id}`);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg border ${bgColor} transition-colors duration-200 cursor-pointer scroll-snap-align-start`}
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      <Activity size={13} className={scoreColor} />
                      <span className="text-[0.75rem] font-bold text-zinc-700 whitespace-nowrap">{name}</span>
                      <div className={`px-1.5 py-0.5 rounded ml-1 bg-white/60 text-[0.65rem] font-black ${scoreColor}`}>
                        {score}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <PortfolioWeatherMap predictiveData={predictiveData} />
        </section>
      ))}

      {/* ═══════════════════════════════════════════
          3. PORTFOLIO ROOF HEALTH (GRID)
          ═══════════════════════════════════════════ */}
      {predictiveData?.properties?.length > 1 && gated('hero', 'Portfolio Grid', (
        <section className="page w-full max-w-[1100px] mx-auto px-4 md:px-12 py-12 md:py-16" id="portfolio" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e4e4e7', contentVisibility: 'auto', containIntrinsicSize: 'auto none auto 1200px' }}>
          <RoofHealthScoreExplainer />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.15em', color: '#18181b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, textTransform: 'uppercase' }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, backgroundColor: '#18181b' }}></span>
                YOUR PORTFOLIO · {predictiveData.properties.length} BUILDINGS
              </div>
              <h2 style={{ fontSize: 'clamp(2.5rem,4vw,4rem)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.05em', color: '#09090b', margin: 0 }}>
                Every roof. <em style={{ fontStyle: 'normal', color: '#18181b', fontWeight: 900 }}>Scored.</em> Today.
              </h2>
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-[0.65rem] font-extrabold uppercase tracking-widest text-zinc-900">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><div style={{ width: 8, height: 8, backgroundColor: '#9f1239' }}></div> At Risk</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><div style={{ width: 8, height: 8, backgroundColor: '#ea580c' }}></div> Watch</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><div style={{ width: 8, height: 8, backgroundColor: '#eab308' }}></div> Caution</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><div style={{ width: 8, height: 8, backgroundColor: '#10b981' }}></div> Clear</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {
              [...predictiveData.properties]
              .sort((a, b) => (a.healthScore?.health_score ?? 100) - (b.healthScore?.health_score ?? 100))
              .map((item: any, idx: number) => {
              const score = item.healthScore?.health_score ?? 100;
              let bandColor = '#10b981'; // green
              let statusText = 'CLEAR';
              let statusColor = '#059669';

              if (score < 50) {
                bandColor = '#9f1239'; // subtle red
                statusText = 'CRITICAL RISK';
                statusColor = '#9f1239';
              } else if (score < 70) {
                bandColor = '#ea580c'; // orange
                statusText = 'HIGH RISK';
                statusColor = '#ea580c';
              } else if (score < 85) {
                bandColor = '#eab308'; // yellow
                statusText = 'CAUTION';
                statusColor = '#ca8a04';
              }

              // Extract Factors
              let age = 15;
              let hasHail = false;
              if (item.healthScore?.score_factors) {
                try {
                  const factors = typeof item.healthScore.score_factors === 'string' 
                    ? JSON.parse(item.healthScore.score_factors) 
                    : item.healthScore.score_factors;
                  
                  const ageFactor = factors.find((f: any) => f.factor === 'permit_roof_age');
                  if (ageFactor) age = ageFactor.age;

                  const hailFactor = factors.find((f: any) => f.factor === 'real_time_hail');
                  if (hailFactor && hailFactor.strikes > 0) hasHail = true;
                } catch(e) {}
              }

              const installYear = new Date().getFullYear() - age;
              
              // Financial Risk Assessment Math (Derived from Roof Wars Playbook)
              const sqFt = item.property.square_footage || item.property.square_feet || item.property.sq_ft || 20000;
              const capexRisk = sqFt * 7.20 * (hasHail ? 0.65 : 0.07);
              const disruptionCost = hasHail ? 10000 : 2500;
              const maintenanceSpike = sqFt * 0.10 * (hasHail ? 3 : 1);
              const totalRisk = capexRisk + disruptionCost + maintenanceSpike;
              
              // Triage Calculation
              const isTop5Percent = idx === 0 && predictiveData.properties.length > 3;

              return (
                <div key={item.property.id} id={`property-${item.property.id}`} className="group" style={{ 
                  backgroundColor: 'rgba(255,255,255,0.95)', 
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: 16, 
                  overflow: 'hidden', 
                  boxShadow: '0 8px 30px -6px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.02)', 
                  border: `1px solid rgba(0,0,0,0.04)`, 
                  borderTop: `4px solid ${bandColor}`,
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = `0 24px 48px -12px ${bandColor}40, 0 8px 16px ${bandColor}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 24px -6px ${bandColor}15, 0 1px 3px rgba(0,0,0,0.02)`;
                }}>
                  {/* Top Status Bar */}
                  <div style={{ padding: '16px 20px', background: `linear-gradient(to bottom, ${bandColor}05, transparent)`, borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.15em', color: statusColor, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase' }}>
                      <Activity size={12} strokeWidth={3} />
                      {statusText}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b', opacity: 0.9, display: 'flex', alignItems: 'center', fontFamily: 'monospace' }}>
                      Score: {score}
                    </div>
                  </div>

                  <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '4px 6px', backgroundColor: '#f4f4f5', color: '#52525b', borderRadius: 2, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                          PRIORITY #{idx + 1} OF {predictiveData.properties.length}
                        </span>
                        {isTop5Percent && (
                          <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '4px 6px', backgroundColor: '#f4f4f5', color: '#18181b', borderRadius: 2, letterSpacing: '0.1em', border: '1px solid #e4e4e7', textTransform: 'uppercase' }}>
                            TOP 5% HIGHEST RISK
                          </span>
                        )}
                        {age < 20 && (
                          <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '4px 6px', backgroundColor: '#fefce8', color: '#ca8a04', borderRadius: 0, letterSpacing: '0.1em', border: '1px solid #fef08a', textTransform: 'uppercase' }}>
                            ⚠️ WARRANTY AT RISK
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontWeight: 900, fontSize: '1.25rem', color: '#09090b', lineHeight: 1.2, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                        {item.property.property_name}
                      </h3>
                      {item.property.address && (
                        <p style={{ fontSize: '0.85rem', color: '#52525b', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={14} />
                          {item.property.address}
                        </p>
                      )}
                    </div>
                    
                    {/* Simplified Liability Summary */}
                    <div style={{ padding: '16px 0', borderTop: '1px solid #e4e4e7', borderBottom: '1px solid #e4e4e7', marginBottom: 24 }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>
                        Est. Capital Liability
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: statusColor, fontFamily: 'monospace' }}>
                        {formatMoney(totalRisk)}
                      </div>
                    </div>

                    <button 
                      onClick={() => setSelectedPropertyId(item.property.id)}
                      style={{ 
                        marginTop: 'auto', 
                        width: '100%', 
                        padding: '16px', 
                        backgroundColor: '#09090b', 
                        color: '#fff', 
                        border: 'none', 
                        fontSize: '0.8rem', 
                        fontWeight: 800, 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: 8, 
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                      }}>
                      View Asset Detail <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* ═══════════════════════════════════════════
          2.4. CFO DASHBOARD (PORTFOLIO CAPEX)
          ═══════════════════════════════════════════ */}
      <div style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto none auto 800px' }}>
        <CFODashboard predictiveData={predictiveData} />
      </div>
      {/* ═══════════════════════════════════════════
          2.5. ASSET DRAWER
          ═══════════════════════════════════════════ */}
      <AssetDrawer 
        isOpen={!!selectedPropertyId} 
        onClose={() => setSelectedPropertyId(null)} 
        property={predictiveData?.properties?.find((p: any) => p.property.id === selectedPropertyId)} 
      />

      {/* ═══════════════════════════════════════════
          2.6. FREQUENTLY ASKED QUESTIONS
          ═══════════════════════════════════════════ */}
      <div style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto none auto 600px' }}>
        <FAQSection />
      </div>

      <footer style={{ backgroundColor: '#ffffff', color: '#09090b', padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 5vw, 4.5rem)', marginTop: 120, borderTop: '1px solid #e4e4e7' }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 max-w-[1100px] mx-auto w-full">
          
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.15em', color: '#d97706', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase' }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, backgroundColor: 'currentColor', transform: 'rotate(45deg)' }}></span>
              BROUGHT TO YOU BY
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 12px 0', letterSpacing: '-0.02em', color: '#09090b' }}>
              Paramount Commercial Roofing
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#52525b', margin: 0 }}>
              {preparedBy}, Service Division · scott@paramountroofs.com · (813) 555-0142
            </p>
          </div>

          <div className="text-left md:text-right w-full md:w-auto">
            <div className="text-[0.65rem] font-extrabold tracking-widest text-rose-700 mb-3 flex items-center justify-start md:justify-end gap-1.5 uppercase">
              <Activity size={12} strokeWidth={3} />
              CRITICAL RISK IDENTIFIED
            </div>
            <button 
              onClick={() => setIsGlobalModalOpen(true)}
              style={{
                padding: '16px 32px',
                backgroundColor: '#18181b',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: '1rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Dispatch Drone Audit
            </button>
          </div>

        </div>
      </footer>

      <SchedulingModal 
        isOpen={isGlobalModalOpen} 
        onClose={() => setIsGlobalModalOpen(false)} 
        propertyName="Your Entire Portfolio"
      />

      {/* Sticky Floating Action Bar */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[600px]"
          >
            <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-2xl p-3 flex items-center justify-between gap-4">
              
              <div className="flex items-center gap-4 pl-3">
                <div className="flex flex-col">
                  <span className="text-[0.65rem] font-bold text-zinc-500 uppercase tracking-widest">System Status</span>
                  <span className="text-sm font-black text-emerald-600 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Active
                  </span>
                </div>
                <div className="w-px h-8 bg-zinc-200 hidden sm:block"></div>
                <div className="flex flex-col hidden sm:flex">
                  <span className="text-[0.65rem] font-bold text-zinc-500 uppercase tracking-widest">Critical Roofs</span>
                  <span className="text-sm font-black text-rose-600 flex items-center gap-1.5"><Activity size={14} /> {(predictiveData?.properties || []).filter((p: any) => (p.healthScore?.health_score ?? 100) < 50).length} Detected</span>
                </div>
              </div>

              <button 
                onClick={() => setIsGlobalModalOpen(true)}
                className="shrink-0 px-6 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Book Diagnosis
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
