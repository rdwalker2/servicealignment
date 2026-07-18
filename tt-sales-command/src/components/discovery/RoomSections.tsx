/* eslint-disable react-refresh/only-export-components */
// ============================================================
// RoomSections — Shared prospect-facing room content
// Used by both DiscoveryRoom (rep preview) and ProspectRoom (public view)
// ============================================================

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowUp, TrendingUp, ChevronDown, Lock, CheckCircle2 } from 'lucide-react';
import type { DiscoverySession, MAPMilestone } from '../../lib/discoveryDatabase';
import { computeHopePillars, computeDiagnosisOverrides, computePainQuotes, computeParadigmQuotes, computeHeroMessage } from '../../lib/discoveryDatabase';
import { TT_PAINS } from './PainDiscoveryModule';
import { DiagnosisReframe } from './DiagnosisReframe';
import { ParadigmShift } from './ParadigmShift';
import FeatureWalkthrough from './FeatureWalkthrough';
import { PlaybookShowcase } from './PlaybookShowcase';
import { SocialProofGrid } from './SocialProofGrid';
import { ATSKillPage } from './ATSKillPage';
import { LogoBar } from './HospitalityLogos';
import { ProblemCanvas } from './ProblemCanvas';
import MinimumStandards from './MinimumStandards';
import { TeamtailorWallOfLove } from './TeamtailorWallOfLove';
import { BusinessImpactCalculator } from './BusinessImpactCalculator';
import SolutionProposal from './SolutionProposal';
import ObjectionsPanel from './sections/ObjectionsPanel';
import { MutualActionPlan } from './MutualActionPlan';
import { ContractSecurityCenter } from './ContractSecurityCenter';
import { HeroSection } from './sections/HeroSection';
import { PrioritiesSection } from './sections/PrioritiesSection';

// ── Animation types for section reveals ──
type RevealType = 'fade-up' | 'slide-left' | 'slide-right' | 'scale-up' | 'blur-in';

const REVEAL_VARIANTS: Record<RevealType, any> = {
  'fade-up':     { hidden: { opacity: 0, y: 50 },                    visible: { opacity: 1, y: 0 } },
  'slide-left':  { hidden: { opacity: 0, x: -60 },                   visible: { opacity: 1, x: 0 } },
  'slide-right': { hidden: { opacity: 0, x: 60 },                    visible: { opacity: 1, x: 0 } },
  'scale-up':    { hidden: { opacity: 0, scale: 0.92 },              visible: { opacity: 1, scale: 1 } },
  'blur-in':     { hidden: { opacity: 0, filter: 'blur(8px)' },      visible: { opacity: 1, filter: 'blur(0px)' } },
};

export const PREMIUM_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ── Scroll reveal wrapper with section-specific animations ──
export function SectionReveal({
  children,
  type = 'fade-up',
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  type?: RevealType;
  delay?: number;
  className?: string;
}) {
  const v = REVEAL_VARIANTS[type];
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={{
        hidden: v.hidden,
        visible: { ...v.visible, transition: { duration: 0.7, ease: PREMIUM_EASE, delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Backward-compatible alias used in sub-section staggering
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return <SectionReveal type="fade-up" delay={delay} className={className}>{children}</SectionReveal>;
}

// ── Section visibility config ──
export interface RoomVisibility {
  hero: boolean;
  pains: boolean;
  problemCanvas: boolean;
  diagnosis: boolean;
  buyingProcess: boolean;
  successCriteria: boolean;
  worstCase: boolean;
  competitive: boolean;
  paradigmShift: boolean;
  solution: boolean;
  playbooks: boolean;
  socialProof: boolean;
  roi: boolean;
  objectionsIntel: boolean;
  map: boolean;
  contractSecurity: boolean;
  pricing: boolean;
  proposal: boolean;
  minimumStandards: boolean;
  alignmentChecklist: boolean;
}

export const DEFAULT_VISIBILITY: RoomVisibility = {
  hero: true,
  pains: true,
  problemCanvas: true,
  diagnosis: true,
  buyingProcess: true,
  successCriteria: true,
  worstCase: true,
  competitive: true,
  paradigmShift: true,
  solution: true,
  playbooks: true,
  socialProof: true,
  roi: true,
  objectionsIntel: true,
  map: true,
  contractSecurity: true,
  pricing: true,
  proposal: true,
  minimumStandards: true,
  alignmentChecklist: true,
};

// ── Stage-gated visibility ──
// Maps each deal stage to which sections should be visible by default.
// Reps can still manually override, but these are the smart defaults.

export const STAGE_SECTION_MAP: Record<string, RoomVisibility> = {
  qualifying: {
    hero: true,
    pains: true,
    problemCanvas: true,
    diagnosis: true,
    buyingProcess: true,
    successCriteria: true,
    worstCase: true,
    competitive: false,
    paradigmShift: false,
    solution: false,
    playbooks: false,
    minimumStandards: false,
    socialProof: false,
    roi: false,
    objectionsIntel: false,
    map: false,
    contractSecurity: false,
    pricing: false,
    proposal: false,
    alignmentChecklist: false,
  },
  investigating: {
    hero: true,
    pains: true,
    problemCanvas: true,
    diagnosis: true,
    buyingProcess: true,
    successCriteria: true,
    worstCase: true,
    competitive: false,
    paradigmShift: false,
    solution: false,
    playbooks: false,
    minimumStandards: false,
    socialProof: false,
    roi: false,
    objectionsIntel: false,
    map: false,
    contractSecurity: false,
    pricing: false,
    proposal: false,
    alignmentChecklist: false,
  },
  evaluating: {
    hero: true,
    pains: true,
    problemCanvas: true,
    diagnosis: true,
    buyingProcess: true,
    successCriteria: true,
    worstCase: true,
    competitive: true,
    paradigmShift: false,
    solution: false,
    playbooks: false,
    minimumStandards: false,
    socialProof: true,
    roi: false,
    objectionsIntel: false,
    map: false,
    contractSecurity: false,
    pricing: false,
    proposal: false,
    alignmentChecklist: false,
  },
  negotiating: {
    hero: true,
    pains: true,
    problemCanvas: true,
    diagnosis: true,
    buyingProcess: true,
    successCriteria: true,
    worstCase: true,
    competitive: true,
    paradigmShift: true,
    solution: true,
    playbooks: true,
    minimumStandards: false,
    socialProof: true,
    roi: true,
    objectionsIntel: true,
    map: false,
    contractSecurity: false,
    pricing: false,
    proposal: false,
    alignmentChecklist: false,
  },
  contracting: {
    hero: true,
    pains: true,
    problemCanvas: true,
    diagnosis: true,
    buyingProcess: true,
    successCriteria: true,
    worstCase: true,
    competitive: true,
    paradigmShift: true,
    solution: true,
    playbooks: true,
    minimumStandards: true,
    socialProof: true,
    roi: true,
    objectionsIntel: true,
    map: true,
    contractSecurity: true,
    pricing: true,
    proposal: true,
    alignmentChecklist: true,
  },
  signing: {
    hero: true,
    pains: true,
    problemCanvas: true,
    diagnosis: true,
    buyingProcess: true,
    successCriteria: true,
    worstCase: true,
    competitive: true,
    paradigmShift: true,
    solution: true,
    playbooks: true,
    minimumStandards: true,
    socialProof: true,
    roi: true,
    objectionsIntel: true,
    map: true,
    contractSecurity: true,
    pricing: true,
    proposal: true,
    alignmentChecklist: true,
  },
};

export const SECTION_UNLOCK_STAGE: Record<keyof RoomVisibility, string> = {
  hero: 'qualifying',
  pains: 'qualifying',
  problemCanvas: 'qualifying',    // CP1: Executive Brief — unlocks at qualifying
  diagnosis: 'evaluating',        // CP2: Problem Diagnosis (moved from CP1 per training)
  buyingProcess: 'qualifying',    // CP1: Buying Process & Timeline — unlocks at qualifying
  successCriteria: 'qualifying',  // CP1: What Success Looks Like — unlocks at qualifying
  worstCase: 'qualifying',        // CP1: Worst-Case Scenario — unlocks at qualifying
  competitive: 'evaluating',      // CP2: Other Providers
  paradigmShift: 'evaluating',    // CP2: Hope vs Design (emotional pivot)
  socialProof: 'negotiating',     // CP3: Proven Results (WHY)
  solution: 'negotiating',        // CP3: Treatment Plan (HOW)
  playbooks: 'negotiating',       // CP3: Treatment Plan (detail)
  roi: 'negotiating',             // CP3: ROI — unlocks at negotiating
  objectionsIntel: 'negotiating', // CP3: Deal Intel — unlocks at negotiating
  contractSecurity: 'contracting',  // CP3: Trust validation before commitment
  map: 'contracting',               // CP3: Delivery & Timelines (WHEN)
  minimumStandards: 'contracting',  // CP3: Push-pull before decision
  pricing: 'contracting',           // CP3: Pricing
  proposal: 'contracting',          // Close / Next Steps
  alignmentChecklist: 'contracting', // D4: Confirmation Close — The Alignment Checklist
};

// Short display labels for stages
export const STAGE_SHORT_LABELS: Record<string, string> = {
  qualifying: '1',
  investigating: '1',
  evaluating: '2',
  negotiating: '2',
  contracting: '3',
  signing: '3',
};

// Ordered stage list for comparison
const STAGE_ORDER = ['qualifying', 'investigating', 'evaluating', 'negotiating', 'contracting', 'signing'];

// Maps section IDs (used in PHASES) to their RoomVisibility keys
const SECTION_VIS_KEY: Record<string, keyof RoomVisibility> = {
  'hero': 'hero', 'pain-discovery': 'pains', 'roi': 'roi',
  'ats-kill': 'competitive', 'diagnosis': 'diagnosis', 'paradigm-shift': 'paradigmShift',
  'social-proof': 'socialProof', 'walkthrough': 'solution', 'playbooks': 'playbooks',
  'problem-canvas': 'problemCanvas', 'contract-security': 'contractSecurity',
  'objections-intel': 'objectionsIntel',
  'map': 'map', 'minimum-standards': 'minimumStandards', 'pricing': 'pricing', 'proposal': 'proposal',
};

/** Returns true if `currentStage` is at or past `requiredStage` */
export function isStageAtOrPast(currentStage: string, requiredStage: string): boolean {
  const cur = STAGE_ORDER.indexOf(currentStage);
  const req = STAGE_ORDER.indexOf(requiredStage);
  if (cur === -1 || req === -1) return true; // unknown stages → don't gate
  return cur >= req;
}

/** Get the default RoomVisibility for a given deal stage */
export function getStageVisibility(dealStage: string): RoomVisibility {
  return STAGE_SECTION_MAP[dealStage] ?? STAGE_SECTION_MAP.qualifying;
}

// ── Props ──
export interface RoomSectionsProps {
  companyName: string;
  themeColor: string;
  selectedPains: string[];
  selectedPersona: string | null;
  selectedATS: string | null;
  session: DiscoverySession | null;
  visibility: RoomVisibility;
  // Optional overrides from call sheet (for diagnosis reframe)
  currentApproach?: string;
  rootCause?: string;
  biggerProblemOverride?: string;
  // BAP / proposal data
  problemStatement?: string;
  businessImpact?: string;
  urgencyReason?: string;
  costOfProblem?: string;
  dateToSolve?: string;
  priorityRating?: string;
  // Callbacks
  onMAPChange?: (map: MAPMilestone[]) => void;
  onContractReadinessChange?: (data: Record<string, string>) => void;
  // Display mode
  isRepPreview?: boolean; // true = rep view (shows section labels), false = prospect view
  customMessage?: string;
  repName?: string;
  showPricing?: boolean;
  enabledStudyNames?: string[];
  enabledProofCustomers?: string[];
  enabledPlaybookIds?: string[];
}

function SectionDivider() {
  return (
    <div className="relative h-px w-full">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
    </div>
  );
}

function SectionWrap({
  id,
  label,
  children,
  visible,
  isRepPreview
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  visible: boolean;
  isRepPreview: boolean;
}) {
  if (!visible) {
    if (!isRepPreview) return null;
    return (
      <section id={id} className="border-t border-dashed border-stone-200 bg-stone-50/30">
        <div className="mx-auto max-w-5xl px-6 py-8 text-center">
          <p className="text-xs font-semibold text-stone-300 uppercase tracking-widest">{label} — Hidden from prospect</p>
        </div>
      </section>
    );
  }
  return (
    <>
      <SectionDivider />
      <section id={id} className="relative scroll-mt-28">
        {isRepPreview && (
          <div className="absolute top-2 left-4 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-stone-900/80 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm">
              {label}
            </span>
          </div>
        )}
        {children}
      </section>
    </>
  );
}

export function RoomSections({
  companyName,
  themeColor,
  selectedPains,
  selectedPersona,
  selectedATS,
  session,
  visibility,
  currentApproach,
  rootCause,
  biggerProblemOverride,
  problemStatement,
  businessImpact,
  urgencyReason,
  costOfProblem,
  dateToSolve,
  priorityRating,
  onMAPChange,
  onContractReadinessChange,
  isRepPreview = false,
  customMessage,
  repName,
  showPricing = true,
  enabledStudyNames,
  enabledProofCustomers,
  enabledPlaybookIds,
}: RoomSectionsProps) {
  const brand = themeColor;
  const hasPains = selectedPains.length > 0;
  const hasATS = !!selectedATS && selectedATS !== 'other' && selectedATS !== 'None' && selectedATS !== 'none';
  const hasCanvasContent = hasPains && !!session && (
    Object.keys(session.call_sheet_answers || {}).length > 0 ||
    (session.stakeholders || []).length > 0 ||
    !!session.diagnosis_bigger_problem_override ||
    !!session.diagnosis_root_cause_override ||
    session.roi_total > 0
  );

  // ── Scroll spy state ──
  const [activeSection, setActiveSection] = useState('hero');

  // ── Progress indicator state (prospect view) ──
  const [visitedSections, setVisitedSections] = useState<Set<string>>(new Set(['hero']));
  const [heroPassed, setHeroPassed] = useState(false);
  const [lastSectionVisible, setLastSectionVisible] = useState(false);

  // ── BAP Checkpoint Phase Definitions ──
  const PHASES = useMemo(() => [
    { id: 'qualifying', label: 'CP1 — Do They Need to Act?', sections: ['hero', 'problem-canvas', 'pain-discovery', 'diagnosis'], teaseText: 'Aligning on your key goals and the challenges we heard.' },
    { id: 'negotiating', label: 'CP2 — Do They Need Outside Help?', sections: ['paradigm-shift', 'ats-kill', 'social-proof'], teaseText: 'Why internal solutions fall short, and who else has solved this.' },
    { id: 'contracting', label: 'CP3 — Best Solution & Path Forward', sections: ['walkthrough', 'playbooks', 'roi', 'minimum-standards', 'contract-security', 'map', 'proposal'], teaseText: 'Your custom solution, business impact, and investment.' }
  ], []);

  // ── ROI summary pill state ──
  const [showROIPill, setShowROIPill] = useState(false);
  const roiSectionRef = useRef<HTMLDivElement>(null);

  // Compute the ROI total from session data
  const roiTotal = useMemo(() => {
    if (session?.roi_total) return session.roi_total;
    // Fallback: compute from roi_inputs if available
    const inputs = session?.roi_inputs;
    if (!inputs) return 0;
    const legacyAtsSeatCost = inputs.legacyAtsSeatCost ?? 1200;
    const avgAgencyFee = inputs.avgAgencyFee ?? 15000;
    const expectedOrganicShift = inputs.expectedOrganicShift ?? 0.25;
    const expectedTimeSavings = inputs.expectedTimeSavings ?? 0.40;
    const lostRevenuePerEmptyDay = inputs.lostRevenuePerEmptyDay ?? 400;
    const annualJobBoardSpend = inputs.annualJobBoardSpend ?? 30000;
    const expectedJobBoardSavings = inputs.expectedJobBoardSavings ?? 0.20;
    const hrHourlyRate = inputs.hrHourlyRate ?? 40;
    const hmHourlyRate = inputs.hmHourlyRate ?? 60;
    const hrHoursSavedPerHire = inputs.hrHoursSavedPerHire ?? 3;
    const hmHoursSavedPerHire = inputs.hmHoursSavedPerHire ?? 1.5;
    const hiringManagers = inputs.hiringManagers ?? 15;
    const totalHires = inputs.totalHires ?? 60;
    const agencyHires = inputs.agencyHires ?? 10;
    const timeToHire = inputs.timeToHire ?? 30;

    const seatSavings = hiringManagers * legacyAtsSeatCost;
    const agencySavings = Math.round(agencyHires * expectedOrganicShift) * avgAgencyFee;
    const daysSaved = Math.round(timeToHire * expectedTimeSavings);
    const vacancySavings = totalHires * daysSaved * lostRevenuePerEmptyDay;
    const jobBoardSavings = annualJobBoardSpend * expectedJobBoardSavings;
    const adminTimeSavings = (totalHires * hrHoursSavedPerHire * hrHourlyRate) +
                              (totalHires * hmHoursSavedPerHire * hmHourlyRate);
    return seatSavings + agencySavings + vacancySavings + jobBoardSavings + adminTimeSavings;
  }, [session]);

  const formattedROI = useMemo(() => {
    if (!roiTotal) return null;
    if (roiTotal >= 1_000_000) return `$${(roiTotal / 1_000_000).toFixed(1)}M`;
    if (roiTotal >= 1_000) return `$${Math.round(roiTotal / 1_000)}K`;
    return `$${roiTotal.toLocaleString()}`;
  }, [roiTotal]);

  // Build the list of section definitions
  const allSections = useMemo(() => [
    // CP1 — Do They Need to Act?
    { id: 'hero',           label: 'Hero',             visible: visibility.hero },
    { id: 'problem-canvas', label: 'Executive Brief',   visible: visibility.problemCanvas && hasPains && hasCanvasContent },
    { id: 'pain-discovery', label: 'Priorities',        visible: visibility.pains && hasPains },
    { id: 'diagnosis',      label: 'Root Cause',        visible: visibility.diagnosis && hasPains },
    // CP2 — Do They Need Outside Help?
    { id: 'paradigm-shift', label: 'Paradigm Shift',    visible: visibility.paradigmShift && hasPains },
    { id: 'ats-kill',       label: 'Competitive',       visible: visibility.competitive && hasPains && hasATS },
    { id: 'social-proof',   label: 'Social Proof',      visible: visibility.socialProof },
    // CP3 — Best Solution & Path Forward
    { id: 'walkthrough',    label: 'Solution',          visible: visibility.solution && hasPains },
    { id: 'playbooks',      label: 'Playbooks',         visible: visibility.playbooks && hasPains },
    { id: 'roi',            label: 'ROI',               visible: visibility.roi },
    { id: 'minimum-standards', label: 'Minimum Standards', visible: visibility.minimumStandards },
    { id: 'contract-security', label: 'Contract & Security', visible: visibility.contractSecurity },
    { id: 'map',            label: 'Action Plan',       visible: visibility.map },
    { id: 'proposal',       label: 'Next Steps',        visible: visibility.proposal && showPricing },
  ], [visibility, hasPains, hasATS, showPricing, hasCanvasContent]);

  const visibleSections = useMemo(() => allSections.filter(s => s.visible), [allSections]);

  // IntersectionObserver for ROI sticky banner (prospect view only)
  useEffect(() => {
    if (isRepPreview || !visibility.roi) return;
    const el = document.getElementById('roi');
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show banner when ROI section is scrolled past (not intersecting) and user has scrolled below it
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setShowROIPill(true);
        } else {
          setShowROIPill(false);
        }
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isRepPreview, visibility.roi]);

  // IntersectionObserver for progress indicator (prospect view only)
  useEffect(() => {
    if (isRepPreview) return;
    const ids = visibleSections.map(s => s.id);
    if (ids.length === 0) return;

    // Track hero passing (for fade-in)
    const heroEl = document.getElementById('hero');
    let heroObs: IntersectionObserver | null = null;
    if (heroEl) {
      heroObs = new IntersectionObserver(
        ([entry]) => setHeroPassed(!entry.isIntersecting && entry.boundingClientRect.top < 0),
        { threshold: 0 }
      );
      heroObs.observe(heroEl);
    }

    // Track last section visibility (for fade-out)
    const lastId = ids[ids.length - 1];
    const lastEl = document.getElementById(lastId);
    let lastObs: IntersectionObserver | null = null;
    if (lastEl) {
      lastObs = new IntersectionObserver(
        ([entry]) => setLastSectionVisible(entry.isIntersecting),
        { threshold: 0.5 }
      );
      lastObs.observe(lastEl);
    }

    // Track visited sections
    const progressObs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisitedSections(prev => {
              if (prev.has(entry.target.id)) return prev;
              const next = new Set(prev);
              next.add(entry.target.id);
              return next;
            });
          }
        });
      },
      { threshold: 0.3 }
    );
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) progressObs.observe(el);
    });

    return () => {
      heroObs?.disconnect();
      lastObs?.disconnect();
      progressObs.disconnect();
    };
  }, [isRepPreview, visibleSections]);



  // IntersectionObserver for scroll spy
  useEffect(() => {
    const ids = visibleSections.map(s => s.id);
    if (ids.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.3, rootMargin: '-20% 0px -60% 0px' }
    );
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [visibleSections]);

  // ── Personalized hero copy ──
  const firstPain = hasPains ? TT_PAINS.find(p => p.id === selectedPains[0]) : null;
  const extraPainCount = selectedPains.length - 1;
  const firstStakeholderName = session?.stakeholders?.find(s => s.name)?.name ?? null;



  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ─── Prospect Sticky Section Nav ─── */}
      {!isRepPreview && (
        <AnimatePresence>
          {heroPassed && (
            <motion.nav
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.3, ease: PREMIUM_EASE }}
              className="fixed top-14 left-0 right-0 z-40 border-b border-zinc-100 bg-white/95 backdrop-blur-md shadow-sm"
              aria-label="Section Navigation"
            >
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-100">
                <motion.div
                  className="h-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(visitedSections.size / visibleSections.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: PREMIUM_EASE }}
                />
              </div>
              <div className="mx-auto max-w-5xl px-4 sm:px-6">
                <div
                  className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  ref={(el) => {
                    // Auto-scroll active pill into view
                    if (!el) return;
                    const activeEl = el.querySelector('[data-active="true"]');
                    if (activeEl) {
                      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }
                  }}
                >
                  {visibleSections.map(sec => {
                    const isActive = activeSection === sec.id;
                    const isVisited = visitedSections.has(sec.id);
                    // Find which phase this section belongs to
                    const phase = PHASES.find(p => p.sections.includes(sec.id));
                    const phaseLabel = phase ? STAGE_SHORT_LABELS[phase.id] : '';

                    return (
                      <button
                        key={sec.id}
                        data-active={isActive ? 'true' : 'false'}
                        onClick={() => document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className={`group flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all duration-200 shrink-0 ${
                          isActive
                            ? 'bg-zinc-900 text-white shadow-sm'
                            : isVisited
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {isVisited && !isActive && <CheckCircle2 size={10} className="text-emerald-500" />}
                        {isActive && <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                        {phaseLabel && <span className={`text-[9px] font-black uppercase ${isActive ? 'text-white/60' : isVisited ? 'text-emerald-500/60' : 'text-zinc-300'}`}>{phaseLabel}</span>}
                        {sec.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      )}

      {/* ─── Act 1: What You Shared ─── */}

      {/* ─── Act 1: Hero ─── */}
      <SectionWrap isRepPreview={isRepPreview} id="hero" label="Hero" visible={visibility.hero}>
        <HeroSection
          companyName={companyName}
          brand={brand}
          firstPain={firstPain as any}
          extraPainCount={extraPainCount}
          firstStakeholderName={firstStakeholderName}
          stakeholders={session?.stakeholders || []}
          customMessage={customMessage || (session ? ((session as any).hero_custom_message || computeHeroMessage(session)) : undefined)}
          repName={repName}
          customHeadline={(session as any)?.hero_custom_headline || undefined}
          customBadge={(session as any)?.hero_custom_badge || undefined}
          showPlatformStats={(session as any)?.hero_show_platform_stats !== false}
        />
      </SectionWrap>

      {/* ─── Act 1: Executive Brief (Summary of Discovery) ─── */}
      <SectionWrap isRepPreview={isRepPreview} id="problem-canvas" label="Executive Brief" visible={visibility.problemCanvas && hasPains && hasCanvasContent}>
        <div className="bg-white">
          <SectionReveal type="fade-up" delay={1 * 0.08} className="mx-auto max-w-7xl px-6 py-20">
            {session && (
              <ProblemCanvas
                session={session}
                companyName={companyName}
                themeColor={brand}
              />
            )}
          </SectionReveal>
        </div>
      </SectionWrap>

      {/* ─── Act 1: Priorities (Pain Cards) ─── */}
      <SectionWrap isRepPreview={isRepPreview} id="pain-discovery" label="Priorities" visible={visibility.pains && hasPains}>
        <PrioritiesSection
          selectedPains={selectedPains}
          companyName={companyName}
          brand={brand}
          painQuotes={session ? computePainQuotes(session) : undefined}
        />
      </SectionWrap>

      {/* ─── Act 1: Root Cause / Diagnosis ─── */}
      <SectionWrap isRepPreview={isRepPreview} id="diagnosis" label="Root Cause" visible={visibility.diagnosis && hasPains}>
        <div className="bg-white">
          <SectionReveal type="slide-left" delay={2 * 0.08} className="mx-auto max-w-5xl px-6 py-20">
            <DiagnosisReframe
              companyName={companyName}
              themeColor={brand}
              selectedPains={selectedPains}
              persona={selectedPersona}
              currentApproach={currentApproach || (session ? computeDiagnosisOverrides(session).currentApproach : undefined)}
              rootCause={rootCause || (session ? computeDiagnosisOverrides(session).rootCause : undefined)}
              biggerProblemOverride={biggerProblemOverride || (session ? computeDiagnosisOverrides(session).biggerProblem : undefined)}
            />
          </SectionReveal>
        </div>
      </SectionWrap>

      {/* ─── CP2: Paradigm Shift ─── */}
      <SectionWrap isRepPreview={isRepPreview} id="paradigm-shift" label="Paradigm Shift" visible={visibility.paradigmShift && hasPains}>
        <div className="bg-white">
          <SectionReveal type="fade-up" delay={4 * 0.08} className="mx-auto max-w-7xl px-6 py-20">
            <ParadigmShift 
              customHopePillars={session ? computeHopePillars(session) : undefined} 
              paradigmQuotes={session ? computeParadigmQuotes(session) : undefined} 
            />
          </SectionReveal>
        </div>
      </SectionWrap>

      {/* ─── CP2: Competitive Analysis ─── */}
      <SectionWrap isRepPreview={isRepPreview} id="ats-kill" label="Competitive" visible={visibility.competitive && hasPains && hasATS}>
        <div className="bg-zinc-50/30">
          <SectionReveal type="slide-right" delay={5 * 0.08} className="mx-auto max-w-5xl px-6 py-20">
            <ATSKillPage ats={selectedATS} selectedPains={selectedPains} themeColor={brand} companyName={companyName} />
          </SectionReveal>
        </div>
      </SectionWrap>

      {/* ─── Solution Roadmap Header ─── */}
      {visibility.socialProof && (
        <>
          <SectionDivider />
          <SectionReveal type="fade-up">
            <div className="mx-auto max-w-5xl px-6 py-12">
              <div className="text-center mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400 mb-2">Solution Roadmap</p>
                <h2 className="text-3xl font-bold text-stone-900 mb-3">Your Path Forward</h2>
                <p className="text-sm text-stone-500 max-w-2xl mx-auto">
                  A clear, step-by-step plan from proven results to implementation.
                </p>
              </div>

              {/* 3-step indicator */}
              <div className="flex items-center justify-center gap-0 mt-8">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-sm">1</div>
                  <span className="text-[10px] font-bold text-stone-600 mt-2">Why Us</span>
                  <span className="text-[9px] text-stone-400">Proven Results</span>
                </div>
                <div className="w-16 h-px bg-stone-200 mx-2" />
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-black text-sm">2</div>
                  <span className="text-[10px] font-bold text-stone-600 mt-2">How We Solve It</span>
                  <span className="text-[9px] text-stone-400">Clear Method</span>
                </div>
                <div className="w-16 h-px bg-stone-200 mx-2" />
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-black text-sm">3</div>
                  <span className="text-[10px] font-bold text-stone-600 mt-2">When & How</span>
                  <span className="text-[9px] text-stone-400">Delivery & Timeline</span>
                </div>
              </div>
            </div>
          </SectionReveal>
        </>
      )}

      {/* ─── Step 1 · Why Us ─── */}
      {visibility.socialProof && (
        <div className="mx-auto max-w-5xl px-6 pt-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-[10px]">1</div>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400">Step 1 · Why Us</span>
          </div>
        </div>
      )}

      {/* ─── CP2: Social Proof (Proven Results — before Solution per BAP) ─── */}
      <SectionWrap isRepPreview={isRepPreview} id="social-proof" label="Social Proof" visible={visibility.socialProof}>
        <div className="bg-white">
          <LogoBar enabledStudyNames={enabledStudyNames} selectedIndustry={session?.industry} enabledProofCustomers={enabledProofCustomers} />
          <div className="mx-auto max-w-5xl px-6 py-20">
            <SectionReveal type="fade-up" delay={6 * 0.08}>
              <h2 className="mb-10 text-center text-2xl font-bold text-zinc-900 sm:text-3xl">Proven Results for Companies Like Yours</h2>
            </SectionReveal>
            <SectionReveal type="fade-up" delay={6 * 0.08 + 0.15}>
              <SocialProofGrid selectedIndustry={session?.industry} enabledStudyNames={enabledStudyNames} enabledProofCustomers={enabledProofCustomers} />
            </SectionReveal>
            <SectionReveal type="fade-up" delay={6 * 0.08 + 0.25}>
              <TeamtailorWallOfLove selectedPains={selectedPains} themeColor={brand} />
            </SectionReveal>
          </div>
        </div>
      </SectionWrap>

      {/* ─── Step 2 · How We Solve It ─── */}
      {visibility.solution && hasPains && (
        <div className="mx-auto max-w-5xl px-6 pt-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-black text-[10px]">2</div>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400">Step 2 · How We Solve It</span>
          </div>
        </div>
      )}

      {/* ─── CP3: Solution Demo ─── */}
      <SectionWrap isRepPreview={isRepPreview} id="walkthrough" label="Solution" visible={visibility.solution && hasPains}>
        <div className="bg-zinc-50">
          <SectionReveal type="scale-up" delay={7 * 0.08} className="mx-auto max-w-5xl px-6 py-20">
            <FeatureWalkthrough
              selectedObjectiveIds={selectedPains}
              companyName={companyName}
              themeColor={brand}
              overriddenPillars={session?.overridden_pillars}
            />
          </SectionReveal>
        </div>
      </SectionWrap>

      {/* ─── CP3: Playbooks ─── */}
      <SectionWrap isRepPreview={isRepPreview} id="playbooks" label="Playbooks" visible={visibility.playbooks && hasPains}>
        <div className="bg-white">
          <SectionReveal type="scale-up" delay={7.5 * 0.08} className="mx-auto max-w-5xl px-6 py-20">
            <PlaybookShowcase
              selectedPains={selectedPains}
              enabledPlaybookIds={enabledPlaybookIds}
              themeColor={brand}
              overriddenPillars={session?.overridden_pillars}
            />
          </SectionReveal>
        </div>
      </SectionWrap>

      {/* ─── CP3: ROI / Business Impact ─── */}
      <SectionWrap isRepPreview={isRepPreview} id="roi" label="ROI" visible={visibility.roi}>
        <div className="bg-zinc-50" ref={roiSectionRef}>
          <div className="mx-auto max-w-4xl px-6 py-20">
            <SectionReveal type="scale-up" delay={8 * 0.08}>
              <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">Business Impact</p>
              <h2 className="mb-10 text-center text-2xl font-bold text-zinc-900 sm:text-3xl">Projected Value for {companyName}</h2>
            </SectionReveal>
            <SectionReveal type="scale-up" delay={8 * 0.08 + 0.12}>
              <BusinessImpactCalculator
                companyName={companyName}
                themeColor={brand}
                sessionId={session?.id}
                enabledCategories={session?.roi_enabled_categories}
                roiQuotes={session?.roi_quotes}
              />
            </SectionReveal>
          </div>
        </div>
      </SectionWrap>

      {/* ─── CP3: Minimum Standards ─── */}
      <SectionWrap isRepPreview={isRepPreview} id="minimum-standards" label="Minimum Standards" visible={visibility.minimumStandards}>
        <div className="bg-white">
          <SectionReveal type="fade-up" delay={8.5 * 0.08} className="mx-auto max-w-4xl px-6 py-20">
            <MinimumStandards companyName={companyName} themeColor={brand} />
          </SectionReveal>
        </div>
      </SectionWrap>

      {/* ─── CP3: Contract & Security ─── */}
      <SectionWrap isRepPreview={isRepPreview} id="contract-security" label="Contract & Security" visible={visibility.contractSecurity}>
        <div className="bg-white">
          <SectionReveal type="fade-up" delay={9 * 0.08} className="mx-auto max-w-5xl px-6 py-20">
            <ContractSecurityCenter
              companyName={companyName}
              themeColor={brand}
              session={session}
              enabledBadges={(session as any)?.trust_enabled_badges}
              enabledDocCategories={(session as any)?.trust_enabled_documents}
              showAIPromise={(session as any)?.trust_show_ai_promise !== false}
              showReviewBadges={(session as any)?.trust_show_review_badges !== false}
            />
          </SectionReveal>
        </div>
      </SectionWrap>

      {/* ─── Step 3 · Delivery & Timeline ─── */}
      {visibility.map && (
        <div className="mx-auto max-w-5xl px-6 pt-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-black text-[10px]">3</div>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400">Step 3 · Delivery & Timeline</span>
          </div>
        </div>
      )}

      {/* ─── CP3: Mutual Action Plan ─── */}
      <SectionWrap isRepPreview={isRepPreview} id="map" label="Action Plan" visible={visibility.map}>
        <div className="bg-zinc-50">
          <SectionReveal type="fade-up" delay={9.5 * 0.08} className="mx-auto max-w-4xl px-6 py-20">
            <MutualActionPlan
              session={session || { id: 'preview', stakeholders: [], mutual_action_plan: undefined } as unknown as DiscoverySession}
              themeColor={brand}
              onChange={onMAPChange}
              onContractReadinessChange={onContractReadinessChange}
            />
          </SectionReveal>
        </div>
      </SectionWrap>

      {/* ─── CP3: Solution Proposal / Next Steps ─── */}
      <SectionWrap isRepPreview={isRepPreview} id="proposal" label="Next Steps" visible={visibility.proposal && showPricing}>
        <div className="bg-white">
          <SectionReveal type="fade-up" delay={10 * 0.08} className="mx-auto max-w-5xl px-6 py-20">
            <SolutionProposal
              companyName={companyName}
              themeColor={brand}
              sessionId={session?.id}
              session={session}
              selectedPainIds={selectedPains}
              onApprove={() => {}}
              problemStatement={problemStatement}
              businessImpact={businessImpact}
              urgencyReason={urgencyReason}
              costOfProblem={costOfProblem}
              dateToSolve={dateToSolve}
              priorityRating={priorityRating}
            />
          </SectionReveal>
        </div>
      </SectionWrap>
      {/* ─── Locked Gate for Next Phase ─── */}
      {!isRepPreview && (() => {
        // A phase is locked only when NONE of its sections have their visibility flag enabled
        const firstLockedPhase = PHASES.find(phase =>
          !phase.sections.some(sId => {
            const visKey = SECTION_VIS_KEY[sId];
            return visKey ? visibility[visKey] : false;
          })
        );
        if (!firstLockedPhase) return null;
        
        return (
          <div className="relative overflow-hidden bg-zinc-50 border-t border-dashed border-zinc-200">
            {/* Blurred background preview effect */}
            <div className="absolute inset-0 opacity-40 select-none pointer-events-none blur-sm bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDEwaDQwTTAgMjBoNDBNMCAzMGg0ME0xMCAwdjQwTTIwIDB2NDBNMzAgMHY0MCIgc3Ryb2tlPSIjZTVlN2ViIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] mix-blend-multiply" />
            
            <div className="relative mx-auto max-w-2xl px-6 py-24 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-zinc-200">
                <Lock size={20} className="text-zinc-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-zinc-900">
                Up Next: {firstLockedPhase.label}
              </h3>
              <p className="text-sm text-zinc-500">
                {firstLockedPhase.teaseText} This section will be unlocked by {repName || 'your AE'} in your next meeting.
              </p>
            </div>
          </div>
        );
      })()}
      {/* ─── Sticky ROI Summary Banner (prospect view only) ─── */}
      {!isRepPreview && visibility.roi && (
        <AnimatePresence>
          {showROIPill && roiTotal > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -48 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -48 }}
              transition={{ duration: 0.3, ease: PREMIUM_EASE }}
              className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-2.5 px-6 shadow-lg"
            >
              <div className="mx-auto flex max-w-5xl items-center justify-center gap-4">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <span className="text-base">💰</span>
                  Estimated Annual Savings: <span className="text-base font-bold">{formattedROI}</span>
                </span>
                <button
                  onClick={() => document.getElementById('roi')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/30"
                >
                  See Breakdown <ChevronDown size={12} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ─── Back to Top Button (prospect view only) ─── */}
      {!isRepPreview && (
        <AnimatePresence>
          {heroPassed && !lastSectionVisible && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, ease: PREMIUM_EASE }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg hover:bg-zinc-700 transition-colors"
              title="Back to top"
            >
              <ArrowUp size={16} />
            </motion.button>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
