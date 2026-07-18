// ============================================================
// CMSWorkspace — CMS-style Room Editor replacing RepWorkspace
// A unified, scrollable section list with inline config panels,
// visibility toggles, phase headers, and BAP progress footer.
// Drop-in replacement for RepWorkspace with identical props.
// ============================================================

import { useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Eye, EyeOff, ChevronDown, Settings, Target, Plus,
  Upload, FileText, RotateCcw, X, Check, Lock,
  Sparkles, BarChart3, Zap, Library, GripVertical,
} from 'lucide-react';
import {
  type SectionKey,
} from './ControlDrawer';
import { type RoomVisibility, isStageAtOrPast, SECTION_UNLOCK_STAGE, STAGE_SHORT_LABELS } from './RoomSections';
import { BusinessCaseDocument } from './BusinessCaseDocument';
import type { DiscoverySession, MAPMilestone, BAPAnswer } from '../../lib/discoveryDatabase';
import {
  getSession,
  computeHopePillars, 
  computeROICategorySelection, 
  computeCompetitorsEvaluating,
  computeDiagnosisOverrides, 
  computePainQuotes, 
  computeParadigmQuotes, 
  computeHeroMessage,
  computeBAPAnswers, 
  getCheckpointScore, 
  getCheckpointStatus,
} from '../../lib/discoveryDatabase';
import { getTopSocialProof, getIndustryCustomerCount } from '../../lib/customerProof';
import { GranolaSettingsDrawer } from './GranolaSettingsDrawer';
import { GranolaSyncModal } from './GranolaSyncModal';
import { PostCallDebriefModal } from './PostCallDebriefModal';
import { FollowUpEmailDraft } from './FollowUpEmailDraft';
import { DealPostMortemModal } from '../sales/DealPostMortemModal';
import { PainModal } from './PainModal';
import { ContentLibraryModal } from './ContentLibraryModal';
import { TT_PAINS } from './PainDiscoveryModule';
import { PlaybookConfig, SocialProofConfig } from './ControlDrawer';
import { PricingConfigPanel } from './PricingConfigPanel';
import { DEMO_AREAS } from './FeatureWalkthrough';
import { PLAYBOOKS, PLAYBOOK_PAIN_MAP } from '../../data/playbooks';
import { FEATURE_CATALOG, FEATURE_CATEGORIES, DEFAULT_SOLUTION_FEATURES, type Feature } from '../../data/featureCatalog';
import { ATS_OPTIONS } from '../../data/roomOptions';
import {
  ATS_PROVIDERS, INDUSTRIES,
  MAX_CP_SCORE,
} from './repWorkspaceConstants';

// ── Constants ──

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const CP_COLORS = {
  CP1: { bg: '#0ea5e910', text: '#0ea5e9', border: '#0ea5e930', solid: '#0ea5e9' },
  CP2: { bg: '#8b5cf610', text: '#8b5cf6', border: '#8b5cf630', solid: '#8b5cf6' },
  CP3: { bg: '#10b98110', text: '#10b981', border: '#10b98130', solid: '#10b981' },
  D4:  { bg: '#f5920010', text: '#f59e0b', border: '#f5920030', solid: '#f59e0b' },
};

const ROI_CATEGORIES_LIST = [
  { key: 'seatSavings',      label: 'ATS Seat Savings',       desc: 'Eliminating legacy ATS per-seat costs' },
  { key: 'agencySavings',    label: 'Agency Fee Reduction',   desc: 'In-house hiring via careers + CRM' },
  { key: 'vacancySavings',   label: 'Vacancy Cost Savings',   desc: 'Faster fill = less days unfilled' },
  { key: 'jobBoardSavings',  label: 'Job Board Savings',      desc: 'Organic traffic reduces paid spend' },
  { key: 'adminTimeSavings', label: 'Admin Time Savings',     desc: 'Automation reduces recruiter hours' },
  { key: 'costOfIndecision', label: 'Cost of Indecision',     desc: 'Urgency — what delay costs per month' },
];

const AREA_EMOJI: Record<string, string> = {
  brand: '🎨', ai: '🤖', candidate: '💌', analytics: '📊',
  manager: '👥', hiring: '🛡️', programs: '🚀',
};

// ── Props ──

interface CMSWorkspaceProps {
  session: DiscoverySession;
  visibility: RoomVisibility;
  onVisibilityChange: (vis: RoomVisibility) => void;
  onSessionChange: (session: DiscoverySession) => void;
  selectedPains: string[];
  onPainChange: (pains: string[]) => void;
  selectedPersona: string | null;
  onPersonaChange: (persona: string) => void;
  selectedATS: string | null;
  onATSChange: (ats: string) => void;
  onIndustryChange: (industry: string) => void;
  onCompanySizeChange: (size: string) => void;
  onUseCaseChange: (useCase: string) => void;
  companyName: string;
  themeColor: string;
  broadcastState: (s: DiscoverySession) => void;
  flashSave: () => void;
  activeTab: 'bap' | 'meddpicc' | 'settings' | 'analytics';
  onTabChange: (tab: 'bap' | 'meddpicc' | 'settings' | 'analytics') => void;
}

// ── Section Definition ──

interface SectionDef {
  id: string;
  visKey: SectionKey;
  label: string;
  checkpoint: 'CP1' | 'CP2' | 'CP3' | 'D4';
  hasConfig: boolean;
}

const SECTIONS: SectionDef[] = [
  // ─── D1 · CP1 — URGENCY TEST: "Do they need to take action?" ───
  { id: 'hero',             visKey: 'hero',             label: 'Hero',                  checkpoint: 'CP1', hasConfig: true },
  { id: 'problemCanvas',    visKey: 'problemCanvas',    label: 'Executive Summary',     checkpoint: 'CP1', hasConfig: true },
  { id: 'pains',            visKey: 'pains',            label: 'Priorities',            checkpoint: 'CP1', hasConfig: true },
  // ─── D2 · CP2 — GAP TEST: "Do they need new/outside help?" ───
  { id: 'diagnosis',        visKey: 'diagnosis',        label: 'Problem Diagnosis',     checkpoint: 'CP2', hasConfig: true },
  { id: 'buyingProcess',    visKey: 'buyingProcess',    label: 'Buying Process',        checkpoint: 'CP1', hasConfig: false },
  { id: 'successCriteria',  visKey: 'successCriteria',  label: 'Success Criteria',      checkpoint: 'CP1', hasConfig: false },
  { id: 'worstCase',        visKey: 'worstCase',        label: 'Worst-Case Scenario',   checkpoint: 'CP1', hasConfig: false },
  { id: 'paradigmShift',    visKey: 'paradigmShift',    label: 'Paradigm Shift',        checkpoint: 'CP2', hasConfig: true },
  { id: 'competitive',      visKey: 'competitive',      label: 'Competitive',           checkpoint: 'CP2', hasConfig: true },
  // ─── D3 · CP3 — SOLUTION ROADMAP: "Who has the best solution?" (WHY → HOW → WHEN) ───
  { id: 'socialProof',      visKey: 'socialProof',      label: 'Proven Results',        checkpoint: 'CP3', hasConfig: true },  // WHY — Credentials
  { id: 'solution',         visKey: 'solution',         label: 'The Solution',          checkpoint: 'CP3', hasConfig: true },  // HOW — Treatment Plan
  { id: 'playbooks',        visKey: 'playbooks',        label: 'Playbooks',             checkpoint: 'CP3', hasConfig: true },  // HOW — Detailed Treatment
  { id: 'roi',              visKey: 'roi',              label: 'ROI / Business Impact', checkpoint: 'CP3', hasConfig: true },
  { id: 'pricing',          visKey: 'pricing',          label: 'Investment & Pricing',  checkpoint: 'CP3', hasConfig: true },
  { id: 'minimumStandards', visKey: 'minimumStandards', label: 'Minimum Standards',     checkpoint: 'CP3', hasConfig: true },  // push-pull
  { id: 'contractSecurity', visKey: 'contractSecurity', label: 'Contract & Security',   checkpoint: 'CP3', hasConfig: true },
  { id: 'map',              visKey: 'map',              label: 'Mutual Action Plan',    checkpoint: 'CP3', hasConfig: true },  // WHEN — Timelines
  // ─── D4 — CONFIRMATION CLOSE: "Are we THE right solution?" ───
  { id: 'alignmentChecklist', visKey: 'alignmentChecklist', label: 'Confirmation Close', checkpoint: 'D4', hasConfig: true },
  { id: 'proposal',         visKey: 'proposal',         label: 'Next Steps',            checkpoint: 'D4', hasConfig: true },
];

// Group sections by phase for phase headers
const PHASE_GROUPS: { phase: string; label: string; question: string; sections: SectionDef[] }[] = [
  { phase: 'CP1', label: 'Discovery',          question: 'Do they need to act?',       sections: SECTIONS.filter(s => s.checkpoint === 'CP1') },
  { phase: 'CP2', label: 'Diagnosis',          question: 'Do they need outside help?', sections: SECTIONS.filter(s => s.checkpoint === 'CP2') },
  { phase: 'CP3', label: 'Solution Roadmap',   question: 'Who has the best solution?', sections: SECTIONS.filter(s => s.checkpoint === 'CP3') },
  { phase: 'D4',  label: 'Confirmation Close', question: 'Are we THE right solution?', sections: SECTIONS.filter(s => s.checkpoint === 'D4') },
];

// ── Phase Header ──

function PhaseHeader({ cp, label, question }: { cp: 'CP1' | 'CP2' | 'CP3' | 'D4'; label: string; question: string }) {
  const colors = CP_COLORS[cp];
  return (
    <div className="flex items-center gap-3 mt-8 mb-4 first:mt-0">
      <div className="flex items-center gap-2">
        <span
          className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
        >
          {cp}
        </span>
        <span className="text-[11px] font-bold text-stone-600">{label}</span>
      </div>
      <div className="flex-1 h-px bg-stone-200" />
      <span className="text-[9px] font-semibold text-stone-400">{question}</span>
    </div>
  );
}

// ── CMS Section Card ──

function CMSSectionCard({
  section,
  visible,
  locked,
  unlockStageLabel,
  onToggleVisibility,
  configContent,
}: {
  section: SectionDef;
  visible: boolean;
  locked: boolean;
  unlockStageLabel: string;
  onToggleVisibility: () => void;
  configContent?: React.ReactNode;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const cp = CP_COLORS[section.checkpoint];

  // Locked section
  if (locked && !visible) {
    return (
      <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/50 px-4 py-3 flex items-center gap-3 opacity-50">
        <Lock size={14} className="text-stone-300 shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-semibold text-stone-400">{section.label}</span>
          <span className="ml-2 text-[9px] font-bold text-stone-300">Unlocks {unlockStageLabel}</span>
        </div>
        <span
          className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{ backgroundColor: cp.bg, color: cp.text }}
        >
          {section.checkpoint}
        </span>
      </div>
    );
  }

  // Hidden section (toggled off)
  if (!visible) {
    return (
      <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/30 px-4 py-3 flex items-center gap-3 group hover:border-stone-300 transition-colors">
        <button
          onClick={onToggleVisibility}
          className="shrink-0 text-stone-300 hover:text-stone-500 transition-colors"
          title="Show section"
        >
          <EyeOff size={14} />
        </button>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-semibold text-stone-400">{section.label}</span>
          <span className="ml-2 text-[9px] text-stone-300">Hidden from prospect</span>
        </div>
        <span
          className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{ backgroundColor: cp.bg, color: cp.text }}
        >
          {section.checkpoint}
        </span>
      </div>
    );
  }

  // Visible section with config
  return (
    <div
      className={`relative rounded-2xl border transition-all duration-200 overflow-hidden ${
        isHovered || isConfigOpen
          ? 'border-stone-300 shadow-md ring-1 ring-stone-200/50'
          : 'border-stone-200 shadow-sm'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Section control bar */}
      <div className={`flex items-center gap-2 px-4 py-2.5 border-b transition-colors duration-200 ${
        isHovered || isConfigOpen ? 'bg-stone-50 border-stone-200' : 'bg-white border-stone-100'
      }`}>
        {/* Checkpoint badge */}
        <span
          className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
          style={{ backgroundColor: cp.bg, color: cp.text, border: `1px solid ${cp.border}` }}
        >
          {section.checkpoint}
        </span>

        {/* Section label */}
        <span className="text-[11px] font-bold text-stone-700 flex-1">{section.label}</span>

        {/* Status indicator */}
        <span className="text-[9px] font-semibold text-emerald-500 flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Visible
        </span>

        {/* Configure button */}
        <AnimatePresence>
          {section.hasConfig && (isHovered || isConfigOpen) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                isConfigOpen
                  ? 'bg-stone-800 text-white'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700'
              }`}
            >
              <Settings size={10} />
              Configure
              <ChevronDown
                size={10}
                className={`transition-transform duration-200 ${isConfigOpen ? 'rotate-180' : ''}`}
              />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Visibility toggle */}
        <button
          onClick={onToggleVisibility}
          className="shrink-0 text-stone-400 hover:text-stone-600 transition-colors p-1 rounded-md hover:bg-stone-100"
          title="Hide from prospect"
        >
          <Eye size={13} />
        </button>
      </div>

      {/* Config panel (expands inline) */}
      <AnimatePresence>
        {isConfigOpen && section.hasConfig && configContent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4 bg-stone-50/80 border-b border-stone-200">
              {configContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// CMSWorkspace Component
// ════════════════════════════════════════════════════════════════

export function CMSWorkspace({
  session, visibility, onVisibilityChange, onSessionChange,
  selectedPains, onPainChange, selectedPersona, onPersonaChange,
  selectedATS, onATSChange, onIndustryChange, onCompanySizeChange,
  onUseCaseChange, companyName, themeColor, broadcastState, flashSave,
  activeTab, onTabChange,
}: CMSWorkspaceProps) {
  // ── Modal state ──
  const [showPainModal, setShowPainModal] = useState(false);
  const [showGranolaSettings, setShowGranolaSettings] = useState(false);
  const [showGranolaSync, setShowGranolaSync] = useState(false);
  const [showLossReason, setShowLossReason] = useState(false);
  const [showDebrief, setShowDebrief] = useState(false);
  const [debriefFieldCount, setDebriefFieldCount] = useState(0);
  const [showFollowUpEmail, setShowFollowUpEmail] = useState(false);
  const [newStandardLabel, setNewStandardLabel] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);

  // Async social proof state
  const [proofCandidates, setProofCandidates] = useState<Awaited<ReturnType<typeof getTopSocialProof>>>([]);
  const [industryCount, setIndustryCount] = useState(0);

  // Load social proof data when session changes
  useEffect(() => {
    let cancelled = false;
    getTopSocialProof(session, 20).then(candidates => { if (!cancelled) setProofCandidates(candidates); });
    if (session.industry) {
      getIndustryCustomerCount(session.industry).then(count => { if (!cancelled) setIndustryCount(count); });
    } else {
      setIndustryCount(0);
    }
   return () => { cancelled = true; };
  }, [session.industry, session.current_ats, session.company_size, session.pricing_region]);

  // ── Auto-provision CMS config on mount ──
  // Creates a deal config in deal-rooms.js if one doesn't exist yet.
  // 409 = already exists (no-op). This ensures the preview iframe works.
  useEffect(() => {
    if (!companyName) return;
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!slug) return;

    fetch('/cms-api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName,
        slug,
        preparedFor: session.stakeholders?.[0]?.name || '',
        preparedBy: 'Tyler Hanson',
      }),
    }).then(r => {
      if (r.ok) console.log(`[CMS] Auto-provisioned config for "${slug}"`);
      else if (r.status === 409) console.log(`[CMS] Config already exists for "${slug}"`);
      else console.warn(`[CMS] Failed to provision config: ${r.status}`);
    }).catch(err => console.warn('[CMS] Provision error:', err));
  }, [companyName]); // only runs when deal name changes

  const brand = themeColor;
  const currentStage = session.deal_stage ?? 'qualifying';
  const hasPains = selectedPains.length > 0;
  const hasATS = !!selectedATS && selectedATS !== 'other' && selectedATS !== 'None' && selectedATS !== 'none';

  // Hero helpers
  const firstPain = hasPains ? TT_PAINS.find(p => p.id === selectedPains[0]) : null;

  // BAP score computation
  const bapAnswers = useMemo(() => computeBAPAnswers(session), [session]);
  const cp1Score = useMemo(() => getCheckpointScore(bapAnswers, 1), [bapAnswers]);
  const cp2Score = useMemo(() => getCheckpointScore(bapAnswers, 2), [bapAnswers]);
  const cp3Score = useMemo(() => getCheckpointScore(bapAnswers, 3), [bapAnswers]);
  const cp1Status = useMemo(() => getCheckpointStatus(cp1Score, MAX_CP_SCORE), [cp1Score]);
  const cp2Status = useMemo(() => getCheckpointStatus(cp2Score, MAX_CP_SCORE), [cp2Score]);
  const cp3Status = useMemo(() => getCheckpointStatus(cp3Score, MAX_CP_SCORE), [cp3Score]);

  // ── Callbacks ──

  const toggleVisibility = useCallback((key: SectionKey) => {
    onVisibilityChange({ ...visibility, [key]: !visibility[key] });
  }, [visibility, onVisibilityChange]);

  const togglePain = useCallback((id: string) => {
    onPainChange(selectedPains.includes(id) ? selectedPains.filter(p => p !== id) : [...selectedPains, id]);
  }, [selectedPains, onPainChange]);

  const handleSessionChange = useCallback((s: DiscoverySession) => {
    onSessionChange(s); broadcastState(s); flashSave();
  }, [onSessionChange, broadcastState, flashSave]);

  const handleStageChange = useCallback((stage: string) => {
    onSessionChange({ ...session, deal_stage: stage });
    if (stage === 'closed_lost') {
      if (!session.post_mortem_completed) {
        setShowLossReason(true);
      }
    }
  }, [session, onSessionChange]);

  // ── Stage gating helper ──
  const getSectionLock = (key: SectionKey) => {
    const unlockStage = SECTION_UNLOCK_STAGE[key];
    const locked = !isStageAtOrPast(currentStage, unlockStage);
    const unlockLabel = STAGE_SHORT_LABELS[unlockStage] ?? 'D1';
    return { locked, unlockStageLabel: `D${unlockLabel}` };
  };

  // ── Pillar toggle helper ──
  const togglePillar = (pillarId: string) => {
    const current = session.overridden_pillars ?? [];
    handleSessionChange({
      ...session,
      overridden_pillars: current.includes(pillarId)
        ? current.filter(p => p !== pillarId)
        : [...current, pillarId],
    });
  };

  // ── ROI category toggle ──
  const toggleROICategory = (catKey: string) => {
    const current = session.roi_enabled_categories ?? computeROICategorySelection(session);
    handleSessionChange({ ...session, roi_enabled_categories: { ...current, [catKey]: !current[catKey] } });
  };

  // ── MAP milestone helpers ──
  const milestones = session.mutual_action_plan ?? [];
  const toggleMilestoneDone = (id: string) =>
    handleSessionChange({ ...session, mutual_action_plan: milestones.map(m => m.id === id ? { ...m, done: !m.done } : m) });
  const deleteMilestone = (id: string) =>
    handleSessionChange({ ...session, mutual_action_plan: milestones.filter(m => m.id !== id) });
  const addMilestone = () =>
    handleSessionChange({ ...session, mutual_action_plan: [...milestones, { id: `m_${Date.now()}`, label: '', owner: '', dueDate: '', done: false }] });
  const updateMilestone = (id: string, field: string, val: string) =>
    handleSessionChange({ ...session, mutual_action_plan: milestones.map(m => m.id === id ? { ...m, [field]: val } : m) });

  // ── Minimum Standards helpers ──
  const DEFAULT_MINIMUM_STANDARDS = [
    { id: 'ms_exec_sponsor', label: 'Executive Sponsor Assigned', checked: false },
    { id: 'ms_admin', label: 'Dedicated Admin Identified', checked: false },
    { id: 'ms_training', label: 'Training Completion Commitment', checked: false },
  ];

  const getMinimumStandards = () => session.custom_minimum_standards ?? DEFAULT_MINIMUM_STANDARDS;

  const addStandard = (label: string) => {
    if (!label.trim()) return;
    const current = getMinimumStandards();
    const newStandard = { id: `ms_${Date.now()}`, label: label.trim(), checked: false };
    handleSessionChange({ ...session, custom_minimum_standards: [...current, newStandard] });
    setNewStandardLabel('');
  };

  const removeStandard = (id: string) => {
    const current = getMinimumStandards();
    handleSessionChange({ ...session, custom_minimum_standards: current.filter(s => s.id !== id) });
  };

  // ── Meeting quotes for config panels ──
  const allMeetingQuotes = (session.granola_notes || [])
    .flatMap(n => (n.key_quotes || []).filter(q => q.trim()))
    .slice(0, 20);

  // ════════════════════════════════════════
  // SECTION CONFIG BUILDERS
  // (Copied verbatim from RoomBuilder.tsx)
  // ════════════════════════════════════════

  const heroConfig = () => (
    <div className="space-y-3">
      <div>
        <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Headline</label>
        <input
          type="text"
          value={(session as any).hero_custom_headline || ''}
          onChange={e => handleSessionChange({ ...session, hero_custom_headline: e.target.value } as any)}
          placeholder={firstPain ? `Solving ${firstPain.title} for ${companyName}` : 'Your Path to Modern Talent Acquisition'}
          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
        />
      </div>
      <div>
        <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Custom Message</label>
        <textarea
          value={(session as any).hero_custom_message || ''}
          onChange={e => handleSessionChange({ ...session, hero_custom_message: e.target.value } as any)}
          placeholder={`Auto-generated from your BAP notes and call data…`}
          rows={3}
          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Badge Text</label>
          <input
            type="text"
            value={(session as any).hero_custom_badge || ''}
            onChange={e => handleSessionChange({ ...session, hero_custom_badge: e.target.value } as any)}
            placeholder="Interactive Experience"
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
          />
        </div>
        <div className="flex items-end">
          <div className="flex items-center justify-between w-full rounded-lg border border-stone-100 px-3 py-2">
            <span className="text-[10px] font-semibold text-stone-600">Platform Stats</span>
            <button onClick={() => handleSessionChange({ ...session, hero_show_platform_stats: !(session as any).hero_show_platform_stats === false ? false : true } as any)} className={`relative shrink-0 w-9 h-5 rounded-full transition-all duration-200 ${(session as any).hero_show_platform_stats !== false ? 'bg-stone-800' : 'bg-stone-200'}`}>
              <motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" animate={{ x: (session as any).hero_show_platform_stats !== false ? 17 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
            </button>
          </div>
        </div>
      </div>
      {((session as any).hero_custom_headline || (session as any).hero_custom_message || (session as any).hero_custom_badge) && (
        <button
          onClick={() => {
            const { hero_custom_headline, hero_custom_message, hero_custom_badge, ...rest } = session as any;
            handleSessionChange(rest as any);
          }}
          className="flex items-center gap-1 text-[10px] text-stone-400 hover:text-stone-600 transition-colors"
        >
          <RotateCcw size={10} /> Reset to auto-generated
        </button>
      )}
    </div>
  );

  // ── Executive Brief Config ──

  const BRIEF_FIELDS = [
    { key: 'q1', label: 'Primary Objective' },
    { key: 'q5', label: 'Current Reality' },
    { key: 'q3', label: 'Pain Points' },
    { key: 'q7', label: 'Decision Process' },
    { key: 'q4', label: 'Timeline' },
    { key: 'q8b', label: 'Success Vision' },
  ] as const;

  const execBriefConfig = () => {
    const visibleFields: Record<string, boolean> = (session as any).exec_brief_visible_fields ?? {};
    const toggleField = (key: string) => {
      const current = (session as any).exec_brief_visible_fields ?? {};
      handleSessionChange({ ...session, exec_brief_visible_fields: { ...current, [key]: current[key] === false ? true : false } } as any);
    };
    const hasAnswer = (key: string) => {
      const ans = session.call_sheet_answers?.[key];
      return !!ans && (Array.isArray(ans) ? ans.length > 0 : String(ans).trim().length > 0);
    };
    return (
      <div className="space-y-3">
        <p className="text-[10px] text-stone-400 leading-relaxed">
          Choose which discovery fields appear in the Executive Brief. Only fields with data are listed.
        </p>
        <div className="space-y-1.5">
          {BRIEF_FIELDS.filter(f => hasAnswer(f.key)).map(f => {
            const isVisible = visibleFields[f.key] !== false;
            return (
              <div key={f.key} className={`flex items-center justify-between rounded-lg border px-3 py-2 transition-all ${isVisible ? 'border-stone-200 bg-white' : 'border-dashed border-stone-200 bg-stone-50 opacity-60'}`}>
                <div className="flex items-center gap-2">
                  {isVisible ? <Eye size={12} className="text-emerald-500" /> : <EyeOff size={12} className="text-stone-300" />}
                  <span className="text-[11px] font-semibold text-stone-700">{f.label}</span>
                </div>
                <button onClick={() => toggleField(f.key)} className={`relative shrink-0 w-9 h-5 rounded-full transition-all duration-200 ${isVisible ? 'bg-stone-800' : 'bg-stone-200'}`}>
                  <motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" animate={{ x: isVisible ? 17 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2.5">
          <div><p className="text-[11px] font-bold text-stone-700">Show Alignment Gauges</p><p className="text-[9px] text-stone-400">Priority Level, Internal Capability, Solution Fit indicators</p></div>
          <button onClick={() => handleSessionChange({ ...session, exec_brief_show_gauges: !(session as any).exec_brief_show_gauges === false ? false : true } as any)} className={`relative shrink-0 w-9 h-5 rounded-full transition-all duration-200 ${(session as any).exec_brief_show_gauges !== false ? 'bg-stone-800' : 'bg-stone-200'}`}>
            <motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" animate={{ x: (session as any).exec_brief_show_gauges !== false ? 17 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
          </button>
        </div>
        <div>
          <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Priority Scale (1-10)</label>
          <div className="flex gap-1">
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <button 
                key={n} 
                onClick={() => handleSessionChange({ ...session, priority_self_rating: n === session.priority_self_rating ? undefined : n })} 
                className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all ${(session.priority_self_rating ?? 0) === n ? 'bg-indigo-500 text-white shadow-sm' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}
              >
                {n}
              </button>
            ))}
          </div>
          {/* Juxtaposition coaching hint */}
          {(session as any).priority_self_rating && (session as any).priority_self_rating < 7 && selectedPains.length >= 3 && (
            <div className="flex items-start gap-2 mt-1.5 p-2 rounded-lg bg-amber-50 border border-amber-100">
              <Zap size={10} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[9px] text-amber-700 leading-relaxed">
                <strong>Juxtaposition opportunity:</strong> Rating is {(session as any).priority_self_rating}/10 but {selectedPains.length} pain points identified. Consider: &quot;Based on what you described, I expected that to be higher...&quot;
              </p>
            </div>
          )}
          {(session as any).priority_self_rating && (session as any).priority_self_rating >= 8 && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <Check size={10} className="text-emerald-500" />
              <span className="text-[9px] font-semibold text-emerald-600">Strong urgency signal</span>
            </div>
          )}
        </div>
        {/* Cost of Indecision — BAP Q4a/Q4b */}
        <div className="border-t border-stone-100 pt-3 mt-3">
          <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Cost of Indecision</label>
          <p className="text-[10px] text-stone-400 mb-2 leading-relaxed">
            What happens if this problem continues? Capture the business impact and urgency.
          </p>
          <div className="space-y-2">
            <div>
              <label className="text-[9px] font-medium text-stone-400 mb-0.5 block">Business Impact (Q4a)</label>
              <textarea
                value={session.call_sheet_answers?.q4a ?? ''}
                onChange={e => {
                  const answers = { ...session.call_sheet_answers, q4a: e.target.value };
                  handleSessionChange({ ...session, call_sheet_answers: answers });
                }}
                placeholder="Loss of productivity, revenue at risk, compliance exposure..."
                rows={2}
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors resize-none"
              />
            </div>
            <div>
              <label className="text-[9px] font-medium text-stone-400 mb-0.5 block">Why Now? / 90-Day Consequence (Q4b)</label>
              <textarea
                value={session.call_sheet_answers?.q4b ?? ''}
                onChange={e => {
                  const answers = { ...session.call_sheet_answers, q4b: e.target.value };
                  handleSessionChange({ ...session, call_sheet_answers: answers });
                }}
                placeholder="What happens if this isn't fixed in 90 days?"
                rows={2}
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Pains Config ──

  const painsConfig = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div><p className="text-xs font-bold text-stone-700">{selectedPains.length} pain points selected</p><p className="text-[10px] text-stone-400 mt-0.5">These appear in the Priorities section of the room</p></div>
        <button onClick={() => setShowPainModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 text-white rounded-lg text-[10px] font-bold hover:bg-stone-700 transition-colors"><Target size={10} /> Manage Pains</button>
      </div>
      {selectedPains.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedPains.slice(0, 8).map(id => { const pain = TT_PAINS.find(p => p.id === id); return pain ? <span key={id} className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-1 text-[10px] font-semibold text-stone-600">{pain.title}</span> : null; })}
          {selectedPains.length > 8 && <span className="text-[10px] text-stone-400">+{selectedPains.length - 8} more</span>}
        </div>
      )}

      {/* Per-pain prospect quote editor */}
      {selectedPains.length > 0 && (
        <div className="border-t border-stone-100 pt-3 mt-2">
          <p className="text-[9px] font-bold text-violet-500 mb-2 flex items-center gap-1">
            💬 Prospect Quotes — In Their Words
          </p>
          <p className="text-[10px] text-stone-400 mb-3 leading-relaxed">
            Tie the prospect's exact words to each pain. These replace the generic quotes in the room.
          </p>
          <div className="space-y-2">
            {selectedPains.map(painId => {
              const pain = TT_PAINS.find(p => p.id === painId);
              if (!pain) return null;
              const currentQuote = session.pain_quotes?.[painId] || '';
              return (
                <div key={painId} className="space-y-1">
                  <label className="text-[10px] font-semibold text-stone-600">{pain.title}</label>
                  <textarea
                    value={currentQuote}
                    onChange={e => {
                      const updated = { ...(session.pain_quotes || {}), [painId]: e.target.value };
                      handleSessionChange({ ...session, pain_quotes: updated });
                    }}
                    placeholder={pain.verbatim ? `Default: ${pain.verbatim.slice(0, 80)}…` : 'Paste their exact words from the call…'}
                    rows={2}
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-violet-300 focus:bg-white transition-colors"
                  />
                </div>
              );
            })}
          </div>
          {/* Quick-assign from meeting notes */}
          {allMeetingQuotes.length > 0 && (
            <details className="mt-3">
              <summary className="text-[10px] font-semibold text-blue-500 cursor-pointer hover:text-blue-600">
                📋 Quotes from meeting notes ({allMeetingQuotes.length})
              </summary>
              <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
                {allMeetingQuotes.map((q, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-stone-50 px-2.5 py-1.5 text-[10px]">
                    <span className="text-violet-400 shrink-0 mt-0.5 font-serif">"</span>
                    <span className="text-stone-600 italic flex-1 leading-snug">{q}</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(q); }}
                      className="shrink-0 text-[9px] font-semibold text-blue-500 hover:text-blue-600"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
      {/* CP1 Confirmation */}
      <div className="border-t border-stone-100 pt-3 mt-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-stone-600">Checkpoint 1 Confirmed</p>
            <p className="text-[9px] text-stone-400 mt-0.5">&quot;This is an urgent priority for you — is that correct?&quot;</p>
          </div>
          <button
            onClick={() => handleSessionChange({ ...session, cp1_confirmed: !(session as any).cp1_confirmed } as any)}
            className={`relative w-9 h-5 rounded-full transition-colors ${(session as any).cp1_confirmed ? 'bg-emerald-500' : 'bg-stone-200'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${(session as any).cp1_confirmed ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>
    </div>
  );

  // ── Diagnosis Config ──

  const diagnosisConfig = () => {
    const reframe = (() => {
      const p = (session as any).diagnosis_persona_override || (session as any).call_sheet_persona || 'all';
      const LABELS: Record<string, string> = {
        'vp-ta': "Your TA team spends 60% of their time on manual sourcing…",
        'chro': "You're losing the talent war to competitors who move 3x faster…",
        'dir-eb': "You're invisible to the 70% of talent that's passive…",
        'hiring-manager': "Every day a hiring manager can't self-serve…",
        'cfo': "You're paying for a fragmented stack of tools…",
        'recruiter': "You're spending 60% of your day on admin…",
        'procurement': "Your current vendor is holding your data hostage…",
        'it-cio': "Your HR tech stack has become shadow IT…",
        'all': "Your hiring infrastructure wasn't built for the speed and scale…",
      };
      return LABELS[p] || LABELS['all'];
    })();

    return (
      <div className="space-y-4">
        <div>
          <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Persona Template</label>
          <p className="text-[10px] text-stone-400 mb-2 leading-relaxed">
            Sets default language for root cause and bigger problem. Override below.
          </p>
          <select
            value={(session as any).diagnosis_persona_override || ''}
            onChange={e => handleSessionChange({ ...session, diagnosis_persona_override: e.target.value } as any)}
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
          >
            <option value="">— Auto (from selected persona) —</option>
            <option value="vp-ta">VP of Talent Acquisition — Recruiter Capacity Gap</option>
            <option value="chro">CHRO / VP People — Competitive Speed Gap</option>
            <option value="dir-eb">Director of Employer Brand — Talent Brand Gap</option>
            <option value="hiring-manager">Hiring Managers — Manager Adoption Gap</option>
            <option value="cfo">CFO / Finance — Hidden Hiring Cost Crisis</option>
            <option value="recruiter">Recruiter / TA Specialist — Productivity Drain</option>
            <option value="procurement">Procurement — Vendor Risk Exposure</option>
            <option value="it-cio">IT / CIO — HR Tech Governance Gap</option>
            <option value="all">Leadership Team — Infrastructure Gap</option>
          </select>
        </div>

        <div className="border-t border-stone-100 pt-3" />

        <div>
          <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Context / Landscape</label>
          <p className="text-[10px] text-stone-400 mb-2 leading-relaxed">
            Set the scene — educate the prospect on what's really happening behind the surface.
          </p>
          <textarea
            value={(session as any).diagnosis_context ?? ''}
            onChange={e => handleSessionChange({ ...session, diagnosis_context: e.target.value } as any)}
            placeholder={'e.g. The "800 million candidate profiles" claim — where the data actually comes from and why it matters for your specific roles...'}
            rows={3}
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors resize-none"
          />
        </div>


        <div>
          <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Current Approach</label>
          <p className="text-[10px] text-stone-400 mb-2">What is the prospect doing today to solve this problem?</p>
          <textarea
            value={(session as any).diagnosis_current_approach_override || ''}
            onChange={e => handleSessionChange({ ...session, diagnosis_current_approach_override: e.target.value } as any)}
            placeholder="e.g. Using Greenhouse + 3 job boards + agency for senior roles"
            rows={2}
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors resize-none"
          />
        </div>

        <div>
          <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Root Cause</label>
          <p className="text-[10px] text-stone-400 mb-2">What's the real root cause specific to this prospect?</p>
          <textarea
            value={(session as any).diagnosis_root_cause_override || ''}
            onChange={e => handleSessionChange({ ...session, diagnosis_root_cause_override: e.target.value } as any)}
            placeholder="e.g. No single system of record — data lives in 4 tools with no automation between them"
            rows={2}
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors resize-none"
          />
        </div>

        <div>
          <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Bigger Problem</label>
          <p className="text-[10px] text-stone-400 mb-2">Override the persona default with a custom reframe.</p>
          <textarea
            value={(session as any).diagnosis_bigger_problem_override || ''}
            onChange={e => handleSessionChange({ ...session, diagnosis_bigger_problem_override: e.target.value } as any)}
            placeholder={reframe}
            rows={3}
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors resize-none"
          />
        </div>

        <div className="border-t border-stone-100 pt-3 mt-1">
          <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Prospect Quote</label>
          <p className="text-[10px] text-stone-400 mb-2 leading-relaxed">
            Their exact words about this topic — makes the reframe personal.
          </p>
          <textarea
            value={(session as any).diagnosis_prospect_quote ?? ''}
            onChange={e => handleSessionChange({ ...session, diagnosis_prospect_quote: e.target.value } as any)}
            placeholder={'"The biggest piece is they have a sourcing agent... for me, that was pretty amazing."'}
            rows={2}
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors resize-none"
          />
          <input
            type="text"
            value={(session as any).diagnosis_prospect_quote_attribution ?? ''}
            onChange={e => handleSessionChange({ ...session, diagnosis_prospect_quote_attribution: e.target.value } as any)}
            placeholder="— Name, Title"
            className="w-full mt-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] text-stone-600 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">The Reframe Question</label>
          <p className="text-[10px] text-stone-400 mb-2 leading-relaxed">
            Bridge from their stated need to the BIGGER question.
          </p>
          <input
            type="text"
            value={(session as any).diagnosis_reframe_question ?? ''}
            onChange={e => handleSessionChange({ ...session, diagnosis_reframe_question: e.target.value } as any)}
            placeholder="The question is: what's the right way to solve it?"
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Ability Scale (1-10)</label>
          <div className="flex gap-1">
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <button 
                key={n} 
                onClick={() => handleSessionChange({ ...session, ability_self_rating: n === session.ability_self_rating ? undefined : n })} 
                className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all ${(session.ability_self_rating ?? 0) === n ? 'bg-purple-500 text-white shadow-sm' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        {/* Budget & Timeline — BAP Q8 */}
        <div className="border-t border-stone-100 pt-3 mt-3">
          <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Budget & Timeline</label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-stone-600">Budget Confirmed</p>
                <p className="text-[9px] text-stone-400">Prospect confirmed budget is allocated</p>
              </div>
              <button
                onClick={() => handleSessionChange({ ...session, budget_confirmed: !(session as any).budget_confirmed } as any)}
                className={`relative w-9 h-5 rounded-full transition-colors ${(session as any).budget_confirmed ? 'bg-emerald-500' : 'bg-stone-200'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${(session as any).budget_confirmed ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div>
              <label className="text-[9px] font-medium text-stone-400 mb-0.5 block">Target Go-Live Date</label>
              <input
                type="date"
                value={(session as any).target_completion_date ?? ''}
                onChange={e => handleSessionChange({ ...session, target_completion_date: e.target.value } as any)}
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ROI Price Anchor Preview */}
        {session.deal_value > 0 && (session as any).roi_total > 0 && (
          <div className="border-t border-stone-100 pt-3 mt-3">
            <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Price Anchor Preview</label>
            <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3">
              <p className="text-[10px] text-indigo-700 font-semibold">
                At ${Math.round(session.deal_value).toLocaleString()} investment → projected {Math.round(((session as any).roi_total || 0) / session.deal_value)}x ROI
              </p>
              <p className="text-[9px] text-indigo-500 mt-1">
                Resolving these issues could save {companyName} ~${Math.round((session as any).roi_total || 0).toLocaleString()} annually
              </p>
            </div>
          </div>
        )}

        {/* CP2 Confirmation */}
        <div className="border-t border-stone-100 pt-3 mt-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-stone-600">Checkpoint 2 Confirmed</p>
              <p className="text-[9px] text-stone-400 mt-0.5">&quot;You need new/outside help to achieve your outcomes — correct?&quot;</p>
            </div>
            <button
              onClick={() => handleSessionChange({ ...session, cp2_confirmed: !(session as any).cp2_confirmed } as any)}
              className={`relative w-9 h-5 rounded-full transition-colors ${(session as any).cp2_confirmed ? 'bg-emerald-500' : 'bg-stone-200'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${(session as any).cp2_confirmed ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Paradigm Shift Config ──

  const paradigmShiftConfig = () => {
    const DEFAULT_HOPES = computeHopePillars(session);
    const customPillars: { title: string; subtitle: string }[] = (session as any).custom_hope_pillars ?? [];
    const pillars = customPillars.length > 0 ? customPillars : DEFAULT_HOPES;
    const isCustom = customPillars.length > 0;
    const isComparisonMode = (session as any).paradigm_comparison_mode !== false; // default true

    const updatePillar = (index: number, field: 'title' | 'subtitle', value: string) => {
      const updated = pillars.map((p, i) => i === index ? { ...p, [field]: value } : { ...p });
      handleSessionChange({ ...session, custom_hope_pillars: updated } as any);
    };

    const resetToDefaults = () => {
      const { custom_hope_pillars, ...rest } = session as any;
      handleSessionChange(rest as any);
    };

    return (
      <div className="space-y-4">
        {/* Layout Toggle */}
        <div className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2.5">
          <div>
            <p className="text-xs font-bold text-stone-700">Comparison Mode</p>
            <p className="text-[10px] text-stone-400 mt-0.5">Approach A vs B side-by-side (best for competitive deals)</p>
          </div>
          <button
            onClick={() => handleSessionChange({ ...session, paradigm_comparison_mode: !isComparisonMode } as any)}
            className={`relative w-9 h-5 rounded-full transition-colors ${isComparisonMode ? 'bg-stone-800' : 'bg-stone-200'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isComparisonMode ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {isComparisonMode ? (
          /* ── Comparison Mode: Approach A vs B ── */
          <>
            {/* Approach A — Hope / Current Way */}
            <div className="rounded-xl border border-red-200 bg-red-50/30 p-3 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-5 px-2 items-center rounded-full bg-red-500 text-[9px] font-bold text-white">A</span>
                <span className="text-[10px] font-bold text-red-700">Their Current Approach</span>
              </div>
              <input
                type="text"
                value={(session as any).approach_a_title ?? ''}
                onChange={e => handleSessionChange({ ...session, approach_a_title: e.target.value } as any)}
                placeholder="e.g. Autonomous Agent on Cold Data"
                className="w-full bg-white border border-red-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-100"
              />
              <textarea
                value={(session as any).approach_a_description ?? ''}
                onChange={e => handleSessionChange({ ...session, approach_a_description: e.target.value } as any)}
                placeholder="Why this approach falls short for this specific prospect..."
                rows={3}
                className="w-full bg-white border border-red-200 rounded-lg px-2.5 py-1.5 text-[11px] text-stone-600 placeholder:text-stone-300 focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-100 resize-none leading-relaxed"
              />
              <input
                type="text"
                value={(session as any).approach_a_callout ?? ''}
                onChange={e => handleSessionChange({ ...session, approach_a_callout: e.target.value } as any)}
                placeholder="Optional closing question: e.g. How many of those 20 matches would you actually reach out to?"
                className="w-full bg-white border border-red-100 rounded-lg px-2.5 py-1.5 text-[10px] italic text-stone-500 placeholder:text-stone-300 focus:outline-none focus:border-red-200"
              />
            </div>

            {/* Approach B — Design / Our Way */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-3 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-5 px-2 items-center rounded-full bg-indigo-500 text-[9px] font-bold text-white">B</span>
                <span className="text-[10px] font-bold text-indigo-700">Our Designed Approach</span>
              </div>
              <input
                type="text"
                value={(session as any).approach_b_title ?? ''}
                onChange={e => handleSessionChange({ ...session, approach_b_title: e.target.value } as any)}
                placeholder="e.g. Build a Sourcing Engine"
                className="w-full bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100"
              />
              <textarea
                value={(session as any).approach_b_description ?? ''}
                onChange={e => handleSessionChange({ ...session, approach_b_description: e.target.value } as any)}
                placeholder="Why our approach works — how it compounds over time..."
                rows={3}
                className="w-full bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 text-[11px] text-stone-600 placeholder:text-stone-300 focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100 resize-none leading-relaxed"
              />
              <input
                type="text"
                value={(session as any).approach_b_callout ?? ''}
                onChange={e => handleSessionChange({ ...session, approach_b_callout: e.target.value } as any)}
                placeholder="Optional closing statement: e.g. The pipeline compounds over time."
                className="w-full bg-white border border-indigo-100 rounded-lg px-2.5 py-1.5 text-[10px] italic text-stone-500 placeholder:text-stone-300 focus:outline-none focus:border-indigo-200"
              />
            </div>
          </>
        ) : (
          /* ── Pillars Mode: Original 3 Pillars ── */
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-stone-700">"Hope" Side — Prospect's Current State</p>
                <p className="text-[10px] text-stone-400 mt-0.5">Customize to mirror back the prospect's specific pain. The "Design" side stays static.</p>
              </div>
              {isCustom && (
                <button onClick={resetToDefaults} className="text-[10px] font-semibold text-stone-400 hover:text-stone-600 transition-colors underline underline-offset-2">
                  Reset to Defaults
                </button>
              )}
            </div>

            {pillars.map((pillar, i) => (
              <div key={i} className="rounded-xl border border-stone-200 bg-stone-50/50 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                    i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                  }`}>{i + 1}</span>
                  <input
                    type="text"
                    value={pillar.title}
                    onChange={e => updatePillar(i, 'title', e.target.value)}
                    placeholder="Pillar title..."
                    className="flex-1 bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-200"
                  />
                </div>
                <textarea
                  value={pillar.subtitle}
                  onChange={e => updatePillar(i, 'subtitle', e.target.value)}
                  placeholder="Description of what this looks like today..."
                  rows={2}
                  className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-[11px] text-stone-600 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-200 resize-none leading-relaxed"
                />
              </div>
            ))}

            {!isCustom && (
              <p className="text-[9px] text-stone-400 italic text-center">
                {pillars[0]?.title === 'Spray & Pray'
                  ? 'Using generic defaults. Fill out BAP notes (Q5/Q6/Q3) or edit above to customize.'
                  : 'Auto-generated from your call notes & BAP. Edit any field above to customize.'}
              </p>
            )}
          </>
        )}
      </div>
    );
  };

  // ── Competitive Config ──

  const competitiveConfig = () => {
    const evaluating: string[] = (session as any).competitors_evaluating ?? computeCompetitorsEvaluating(session);
    const currentAts = session.current_ats;
    const currentAtsLabel = ATS_OPTIONS.find(a => a.toLowerCase() === currentAts?.toLowerCase()) ?? currentAts;
    const competitorChoices = ATS_OPTIONS.filter(a =>
      a !== 'None' && a !== 'other' && a.toLowerCase() !== currentAts?.toLowerCase()
    );

    const toggleEvaluating = (ats: string) => {
      const next = evaluating.includes(ats)
        ? evaluating.filter(a => a !== ats)
        : [...evaluating, ats];
      handleSessionChange({ ...session, competitors_evaluating: next, competitors_count: next.length } as any);
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2.5">
          <div><p className="text-xs font-bold text-stone-700">Competitor Comparison Sheet</p><p className="text-[10px] text-stone-400">Show a live ATS teardown vs their current provider</p></div>
          <button onClick={() => handleSessionChange({ ...session, room_enable_kill_sheet: !session.room_enable_kill_sheet })} className={`relative shrink-0 w-9 h-5 rounded-full transition-all duration-200 ${session.room_enable_kill_sheet ? 'bg-stone-800' : 'bg-stone-200'}`}>
            <motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" animate={{ x: session.room_enable_kill_sheet ? 17 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
          </button>
        </div>

        <div>
          <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Current ATS</label>
          {currentAts && currentAts !== 'None' ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-[11px] font-bold text-white">{currentAtsLabel}</span>
              <span className="text-[10px] text-stone-400">Set via Deal Context</span>
            </div>
          ) : (
            <p className="text-[10px] text-stone-400 italic">No ATS selected — set in Deal Context above</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[9px] font-bold text-stone-400">Also Evaluating</label>
            {evaluating.length > 0 && (
              <span className="text-[9px] font-bold text-stone-500 tabular-nums">{evaluating.length} selected</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 rounded-lg border border-stone-100 bg-stone-50/50 p-2.5">
            {competitorChoices.map(ats => {
              const isSelected = evaluating.includes(ats);
              return (
                <button
                  key={ats}
                  onClick={() => toggleEvaluating(ats)}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all duration-200 ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white text-stone-500 border border-stone-200 hover:border-stone-400 hover:text-stone-700'
                  }`}
                >
                  {isSelected && <X size={9} strokeWidth={3} />}
                  {ats}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Sentiment Score</label>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => handleSessionChange({ ...session, sentiment_score: n === session.sentiment_score ? 0 : n })} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${(session.sentiment_score ?? 0) >= n ? 'bg-amber-400 text-white' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}>{n}★</button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── Solution Config ──

  const solutionConfig = () => {
    const pinnedIds: string[] = session.overridden_pillars ?? [];
    const painSet = new Set(selectedPains);

    return (
      <div className="space-y-3">
        <p className="text-[10px] text-stone-500 leading-relaxed">
          Both the Solution walkthrough and Playbooks auto-derive from your selected pains.
          Pin specific focus areas to guarantee they appear as Pillars 1–3 in the demo.
        </p>

        <div className="space-y-2">
          {DEMO_AREAS.map(area => {
            const matchedPains = area.painIds.filter(id => painSet.has(id));
            const isPinned = pinnedIds.includes(area.id);
            const isAutoMatched = matchedPains.length > 0;
            const areaPlaybooks = PLAYBOOKS.filter(pb => {
              const pbPains = PLAYBOOK_PAIN_MAP[pb.id] ?? [];
              return pbPains.some(pid => area.painIds.includes(pid) && painSet.has(pid));
            });
            const emoji = AREA_EMOJI[area.id] ?? '⚡';

            return (
              <div
                key={area.id}
                className={`rounded-xl border transition-all ${
                  isPinned
                    ? 'border-stone-800 bg-stone-900'
                    : isAutoMatched
                    ? 'border-stone-200 bg-white'
                    : 'border-dashed border-stone-200 bg-stone-50/40 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <span className="text-base shrink-0">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-bold ${isPinned ? 'text-white' : 'text-stone-800'}`}>
                      {area.title}
                      {isAutoMatched && !isPinned && (
                        <span className="ml-2 text-[9px] font-semibold text-emerald-500">Auto ✓</span>
                      )}
                    </p>
                    {matchedPains.length > 0 && (
                      <p className={`text-[9px] mt-0.5 truncate ${isPinned ? 'text-stone-400' : 'text-stone-400'}`}>
                        {matchedPains.length} pain{matchedPains.length !== 1 ? 's' : ''} matched
                        {areaPlaybooks.length > 0 && ` · ${areaPlaybooks.length} playbook${areaPlaybooks.length !== 1 ? 's' : ''}`}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => togglePillar(area.id)}
                    className={`shrink-0 text-[9px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                      isPinned
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                    }`}
                  >
                    {isPinned ? 'Pinned ✓' : 'Pin'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {pinnedIds.length > 0 && (
          <button
            onClick={() => handleSessionChange({ ...session, overridden_pillars: [] })}
            className="text-[10px] text-stone-400 hover:text-stone-600 transition-colors"
          >
            Clear pins — revert to auto-match
          </button>
        )}

        {/* Feature Catalog Selector */}
        <div className="border-t border-stone-100 pt-3 mt-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-bold text-stone-700">Solution Features</p>
              <p className="text-[10px] text-stone-400 mt-0.5">Select features to show in the document's solution section</p>
            </div>
            <button
              onClick={() => {
                handleSessionChange({ ...session, solution_feature_ids: DEFAULT_SOLUTION_FEATURES } as any);
              }}
              className="text-[10px] font-semibold text-stone-400 hover:text-stone-600 transition-colors underline underline-offset-2"
            >
              Reset to Defaults
            </button>
          </div>
          
          {FEATURE_CATEGORIES.map(cat => {
            const catFeatures = FEATURE_CATALOG.filter(f => f.category === cat.id);
            const selectedIds: string[] = (session as any).solution_feature_ids ?? DEFAULT_SOLUTION_FEATURES;
            const selectedInCat = catFeatures.filter(f => selectedIds.includes(f.id)).length;
            
            return (
              <details key={cat.id} className="mb-1.5">
                <summary className="flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-stone-50 transition-colors">
                  <span className="text-[12px]">{cat.icon}</span>
                  <span className="text-[10px] font-bold text-stone-600 flex-1">{cat.label}</span>
                  {selectedInCat > 0 && (
                    <span className="text-[9px] font-bold text-white bg-stone-800 rounded-full px-1.5 py-0.5">{selectedInCat}</span>
                  )}
                </summary>
                <div className="pl-2 pr-1 pb-2 space-y-0.5">
                  {catFeatures.map(feature => {
                    const isSelected = selectedIds.includes(feature.id);
                    return (
                      <button
                        key={feature.id}
                        onClick={() => {
                          const current: string[] = (session as any).solution_feature_ids ?? DEFAULT_SOLUTION_FEATURES;
                          const next = isSelected
                            ? current.filter(id => id !== feature.id)
                            : [...current, feature.id];
                          handleSessionChange({ ...session, solution_feature_ids: next } as any);
                        }}
                        className={`w-full flex items-start gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all ${
                          isSelected ? 'bg-stone-800 text-white' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        <span className="text-[11px] mt-0.5 shrink-0">{feature.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-stone-700'}`}>{feature.title}</p>
                          <p className={`text-[9px] leading-snug mt-0.5 ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>{feature.description}</p>
                        </div>
                        <span className={`text-[10px] font-bold shrink-0 ${isSelected ? 'text-emerald-400' : 'text-stone-300'}`}>
                          {isSelected ? '✓' : '+'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </details>
            );
          })}
          
          <div className="mt-2 px-2">
            <p className="text-[9px] text-stone-400">
              {((session as any).solution_feature_ids ?? DEFAULT_SOLUTION_FEATURES).length} features selected
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ── ROI Config ──

  const roiConfig = () => (
    <div className="space-y-5">
      <div>
        <p className="text-[9px] font-bold text-stone-400 mb-1">Prospect Slider Defaults</p>
        <p className="text-[9px] text-stone-400 mb-3">Pre-set the sliders the prospect sees. They can still adjust.</p>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Hiring Managers</label><input type="number" min={1} max={200} value={session.room_roi_open_reqs ?? ''} onChange={e => handleSessionChange({ ...session, room_roi_open_reqs: Number(e.target.value) })} placeholder="default: 15" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" /></div>
          <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Annual Hires</label><input type="number" min={1} max={1000} value={session.roi_inputs?.totalHires ?? ''} onChange={e => { const v = Number(e.target.value); handleSessionChange({ ...session, roi_inputs: { ...(session.roi_inputs || {}), totalHires: v } }); }} placeholder="default: 60" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" /></div>
          <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Agency Hires / Year</label><input type="number" min={0} max={200} value={session.roi_inputs?.agencyHires ?? ''} onChange={e => { const v = Number(e.target.value); handleSessionChange({ ...session, roi_inputs: { ...(session.roi_inputs || {}), agencyHires: v } }); }} placeholder="default: 10" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" /></div>
          <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Time to Fill (days)</label><input type="number" min={1} max={180} value={session.room_roi_time_to_fill ?? ''} onChange={e => handleSessionChange({ ...session, room_roi_time_to_fill: Number(e.target.value) })} placeholder="default: 30" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" /></div>
        </div>
      </div>

      {/* Assumption Overrides */}
      <details className="group">
        <summary className="text-[9px] font-bold text-stone-400 cursor-pointer hover:text-stone-600 transition-colors list-none flex items-center gap-1">
          <ChevronDown size={10} className="transition-transform group-open:rotate-180" />
          Assumption Overrides
        </summary>
        <p className="text-[9px] text-stone-400 mt-1 mb-2">Fine-tune the math behind each ROI category.</p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Legacy ATS Seat Cost ($)</label><input type="number" min={0} value={session.roi_inputs?.legacyAtsSeatCost ?? ''} onChange={e => { const v = Number(e.target.value); handleSessionChange({ ...session, roi_inputs: { ...(session.roi_inputs || {}), legacyAtsSeatCost: v } }); }} placeholder="default: 1200" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" /></div>
          <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Avg Agency Fee / Hire ($)</label><input type="number" min={0} value={session.roi_inputs?.avgAgencyFee ?? ''} onChange={e => { const v = Number(e.target.value); handleSessionChange({ ...session, roi_inputs: { ...(session.roi_inputs || {}), avgAgencyFee: v } }); }} placeholder="default: 15000" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" /></div>
          <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Annual Job Board Spend ($)</label><input type="number" min={0} value={session.roi_inputs?.annualJobBoardSpend ?? ''} onChange={e => { const v = Number(e.target.value); handleSessionChange({ ...session, roi_inputs: { ...(session.roi_inputs || {}), annualJobBoardSpend: v } }); }} placeholder="default: 30000" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" /></div>
          <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Lost Revenue / Empty Day ($)</label><input type="number" min={0} value={session.roi_inputs?.lostRevenuePerEmptyDay ?? ''} onChange={e => { const v = Number(e.target.value); handleSessionChange({ ...session, roi_inputs: { ...(session.roi_inputs || {}), lostRevenuePerEmptyDay: v } }); }} placeholder="default: 400" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" /></div>
        </div>
      </details>

      {/* ROI Categories */}
      <div>
        <p className="text-[9px] font-bold text-stone-400 mb-2">Value Stack Categories</p>
        <div className="space-y-1.5">
          {(() => { const computedROI = computeROICategorySelection(session); return ROI_CATEGORIES_LIST.map(cat => { const enabled = computedROI[cat.key] ?? true; return (
            <div key={cat.key} className={`flex items-center justify-between rounded-lg border px-3 py-2 transition-all ${enabled ? 'border-stone-200 bg-white' : 'border-dashed border-stone-200 bg-stone-50 opacity-60'}`}>
              <div><p className="text-[11px] font-bold text-stone-700">{cat.label}</p><p className="text-[9px] text-stone-400">{cat.desc}</p></div>
              <button onClick={() => toggleROICategory(cat.key)} className={`relative shrink-0 w-9 h-5 rounded-full transition-all duration-200 ${enabled ? 'bg-stone-800' : 'bg-stone-200'}`}><motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" animate={{ x: enabled ? 17 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} /></button>
            </div>
          ); }); })()}
        </div>
      </div>
    </div>
  );

  // ── Contract & Security Config ──

  const ALL_TRUST_BADGES = ['SOC 2 Type II', 'ISO 27001', 'ISO 27701', 'GDPR Compliant', 'Responsible AI', 'EU AI Act Ready'];
  const DOC_CATEGORIES = ['Contract / Legal', 'Security / Compliance', 'Procurement / Finance'];

  const contractSecurityConfig = () => {
    const badges: Record<string, boolean> = (session as any).trust_enabled_badges ?? {};
    const docs: Record<string, boolean> = (session as any).trust_enabled_documents ?? {};
    const toggleBadge = (b: string) => {
      const current = (session as any).trust_enabled_badges ?? {};
      handleSessionChange({ ...session, trust_enabled_badges: { ...current, [b]: current[b] === false ? true : false } } as any);
    };
    const toggleDoc = (d: string) => {
      const current = (session as any).trust_enabled_documents ?? {};
      handleSessionChange({ ...session, trust_enabled_documents: { ...current, [d]: current[d] === false ? true : false } } as any);
    };
    return (
      <div className="space-y-4">
        <div>
          <p className="text-[9px] font-bold text-stone-400 mb-2">Trust Badges</p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_TRUST_BADGES.map(b => {
              const enabled = badges[b] !== false;
              return (
                <button
                  key={b}
                  onClick={() => toggleBadge(b)}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all duration-200 ${
                    enabled ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-400 border border-dashed border-stone-200 line-through'
                  }`}
                >
                  {enabled && <Check size={9} strokeWidth={3} />}
                  {b}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-[9px] font-bold text-stone-400 mb-2">Document Sections</p>
          <div className="space-y-1.5">
            {DOC_CATEGORIES.map(d => {
              const enabled = docs[d] !== false;
              return (
                <div key={d} className={`flex items-center justify-between rounded-lg border px-3 py-2 transition-all ${enabled ? 'border-stone-200 bg-white' : 'border-dashed border-stone-200 bg-stone-50 opacity-60'}`}>
                  <span className="text-[11px] font-semibold text-stone-700">{d}</span>
                  <button onClick={() => toggleDoc(d)} className={`relative shrink-0 w-9 h-5 rounded-full transition-all duration-200 ${enabled ? 'bg-stone-800' : 'bg-stone-200'}`}>
                    <motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" animate={{ x: enabled ? 17 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2.5">
          <div><p className="text-[11px] font-bold text-stone-700">AI Data Promise</p><p className="text-[9px] text-stone-400">Show the Responsible AI data commitment callout</p></div>
          <button onClick={() => handleSessionChange({ ...session, trust_show_ai_promise: !(session as any).trust_show_ai_promise === false ? false : true } as any)} className={`relative shrink-0 w-9 h-5 rounded-full transition-all duration-200 ${(session as any).trust_show_ai_promise !== false ? 'bg-stone-800' : 'bg-stone-200'}`}>
            <motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" animate={{ x: (session as any).trust_show_ai_promise !== false ? 17 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
          </button>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2.5">
          <div><p className="text-[11px] font-bold text-stone-700">Review Badges</p><p className="text-[9px] text-stone-400">G2, Capterra, and Gartner ratings</p></div>
          <button onClick={() => handleSessionChange({ ...session, trust_show_review_badges: !(session as any).trust_show_review_badges === false ? false : true } as any)} className={`relative shrink-0 w-9 h-5 rounded-full transition-all duration-200 ${(session as any).trust_show_review_badges !== false ? 'bg-stone-800' : 'bg-stone-200'}`}>
            <motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" animate={{ x: (session as any).trust_show_review_badges !== false ? 17 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
          </button>
        </div>
      </div>
    );
  };

  // ── MAP Config ──

  const mapConfig = () => {
    const SALES_CYCLE_TEMPLATE: MAPMilestone[] = [
      { id: `m_s1_${Date.now()}`, label: 'Intro Call — Establish mutual fit & align on goals', owner: 'Teamtailor', dueDate: '', done: false },
      { id: `m_s2_${Date.now()}`, label: 'Tailored Demo — Career site, pipeline, AI & automation', owner: 'Teamtailor', dueDate: '', done: false },
      { id: `m_s3_${Date.now()}`, label: 'Business Case Review — Finalize capabilities & desired outcomes', owner: session.company_name, dueDate: '', done: false },
      { id: `m_s4_${Date.now()}`, label: 'Commercial Proposal — Preview pricing, implementation steps & T&Cs', owner: 'Teamtailor', dueDate: '', done: false },
      { id: `m_s5_${Date.now()}`, label: 'Internal Stakeholder Review — Security, IT & leadership sign-off', owner: session.company_name, dueDate: '', done: false },
      { id: `m_s6_${Date.now()}`, label: 'Contract Sign Off — Finalize commercial terms & mutual agreement', owner: session.company_name, dueDate: '', done: false },
    ];

    const IMPLEMENTATION_TEMPLATE: MAPMilestone[] = [
      { id: `m_i1_${Date.now()}`, label: 'Implementation Kickoff — Meet CSM, align on timeline, success metrics & go-live date', owner: 'Teamtailor CSM', dueDate: '', done: false },
      { id: `m_i2_${Date.now()}`, label: 'Content Prep — Gather photos, videos, brand assets & copy for career site', owner: session.company_name, dueDate: '', done: false },
      { id: `m_i3_${Date.now()}`, label: 'Data Migration — Export from legacy ATS, map fields, import candidates & job history', owner: 'Teamtailor CSM', dueDate: '', done: false },
      { id: `m_i4_${Date.now()}`, label: 'Account Configuration — Departments, roles, locations, message templates & reject reasons', owner: 'Teamtailor CSM', dueDate: '', done: false },
      { id: `m_i5_${Date.now()}`, label: 'Data & Privacy Setup — GDPR templates, retention periods, consent & cookie policies', owner: session.company_name, dueDate: '', done: false },
      { id: `m_i6_${Date.now()}`, label: 'Career Site Build — Design branded career site, department & landing pages', owner: session.company_name, dueDate: '', done: false },
      { id: `m_i7_${Date.now()}`, label: 'Interview Kits & Job Templates — Scorecards, application forms & default workflows', owner: 'Teamtailor CSM', dueDate: '', done: false },
      { id: `m_i8_${Date.now()}`, label: 'Integrations Setup — HRIS, calendar, SSO, job boards, assessment & background check tools', owner: 'Teamtailor CSM', dueDate: '', done: false },
      { id: `m_i9_${Date.now()}`, label: 'Automations & Add-on Activation — Triggers, Nurture, Co-pilot, NPS, Smart Schedule', owner: 'Teamtailor CSM', dueDate: '', done: false },
      { id: `m_i10_${Date.now()}`, label: 'Recruiter Training — Job creation, pipeline management, candidate collaboration', owner: 'Teamtailor CSM', dueDate: '', done: false },
      { id: `m_i11_${Date.now()}`, label: 'Hiring Manager Training — Profile setup, candidate review, notes, interview feedback', owner: session.company_name, dueDate: '', done: false },
      { id: `m_i12_${Date.now()}`, label: 'UAT & Testing — Candidate flow, recruiter flow, domain verification, user invitations', owner: session.company_name, dueDate: '', done: false },
      { id: `m_i13_${Date.now()}`, label: 'Go-Live — Custom domain live, homepage linked, legacy ATS decommissioned', owner: session.company_name, dueDate: '', done: false },
      { id: `m_i14_${Date.now()}`, label: 'Launch Campaign — Internal comms (intranet) & external comms (LinkedIn, social, website)', owner: session.company_name, dueDate: '', done: false },
      { id: `m_i15_${Date.now()}`, label: 'Hypercare (2 weeks) — Dedicated CSM support, daily check-ins, workflow fine-tuning', owner: 'Teamtailor CSM', dueDate: '', done: false },
      { id: `m_i16_${Date.now()}`, label: '30-Day Success Review — Adoption metrics, ROI validation & optimization roadmap', owner: 'Teamtailor CSM', dueDate: '', done: false },
    ];

    const FULL_TEMPLATE: MAPMilestone[] = [
      ...SALES_CYCLE_TEMPLATE.map((m, i) => ({ ...m, id: `m_f${i}_${Date.now()}` })),
      ...IMPLEMENTATION_TEMPLATE.map((m, i) => ({ ...m, id: `m_g${i}_${Date.now()}` })),
    ];

    const applyTemplate = (template: MAPMilestone[]) => {
      handleSessionChange({ ...session, mutual_action_plan: template });
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2.5">
          <div><p className="text-xs font-bold text-stone-700">Show Mutual Action Plan timeline</p><p className="text-[10px] text-stone-400">Prospect sees shared milestones in their room</p></div>
          <button onClick={() => handleSessionChange({ ...session, room_enable_map: !session.room_enable_map })} className={`relative shrink-0 w-9 h-5 rounded-full transition-all duration-200 ${session.room_enable_map ? 'bg-stone-800' : 'bg-stone-200'}`}>
            <motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" animate={{ x: session.room_enable_map ? 17 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
          </button>
        </div>

        {/* Template buttons */}
        <div>
          <p className="text-[9px] font-bold text-stone-400 mb-2">Load Template</p>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => applyTemplate(SALES_CYCLE_TEMPLATE)} className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-stone-200 px-3 py-3 text-center hover:border-stone-400 hover:bg-stone-50 transition-all group">
              <span className="text-base">🤝</span>
              <span className="text-[10px] font-bold text-stone-600 group-hover:text-stone-800">Sales Cycle</span>
              <span className="text-[8px] text-stone-400">6 milestones</span>
            </button>
            <button onClick={() => applyTemplate(IMPLEMENTATION_TEMPLATE)} className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-stone-200 px-3 py-3 text-center hover:border-stone-400 hover:bg-stone-50 transition-all group">
              <span className="text-base">🚀</span>
              <span className="text-[10px] font-bold text-stone-600 group-hover:text-stone-800">Implementation</span>
              <span className="text-[8px] text-stone-400">16 milestones</span>
            </button>
            <button onClick={() => applyTemplate(FULL_TEMPLATE)} className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-stone-200 px-3 py-3 text-center hover:border-stone-400 hover:bg-stone-50 transition-all group">
              <span className="text-base">📋</span>
              <span className="text-[10px] font-bold text-stone-600 group-hover:text-stone-800">Full Journey</span>
              <span className="text-[8px] text-stone-400">22 milestones</span>
            </button>
          </div>
          {milestones.length > 0 && (
            <p className="text-[9px] text-amber-500 mt-1.5">⚠ Loading a template will replace current milestones</p>
          )}
        </div>

        {milestones.length > 0 && (
          <div className="space-y-2">
            {milestones.map(m => (
              <div key={m.id} className="rounded-lg border border-stone-200 bg-white p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleMilestoneDone(m.id)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${m.done ? 'bg-emerald-500 border-emerald-500' : 'border-stone-300 hover:border-emerald-400'}`}>{m.done && <Check size={10} className="text-white" />}</button>
                  <input value={m.label} onChange={e => updateMilestone(m.id, 'label', e.target.value)} placeholder="Milestone label…" className={`flex-1 text-[11px] font-semibold bg-transparent focus:outline-none ${m.done ? 'line-through text-stone-400' : 'text-stone-700'}`} />
                  <button onClick={() => deleteMilestone(m.id)} className="shrink-0 text-stone-300 hover:text-rose-400 transition-colors"><X size={12} /></button>
                </div>
                <div className="flex items-center gap-2 pl-7">
                  <input value={m.owner} onChange={e => updateMilestone(m.id, 'owner', e.target.value)} placeholder="Owner" className="flex-1 rounded-md border border-stone-100 bg-stone-50 px-2 py-1 text-[10px] text-stone-600 focus:outline-none focus:border-stone-300" />
                  <input type="date" value={m.dueDate} onChange={e => updateMilestone(m.id, 'dueDate', e.target.value)} className="flex-1 rounded-md border border-stone-100 bg-stone-50 px-2 py-1 text-[10px] text-stone-600 focus:outline-none focus:border-stone-300" />
                </div>
              </div>
            ))}
          </div>
        )}
        <button onClick={addMilestone} className="w-full flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-stone-200 py-2.5 text-[10px] font-semibold text-stone-400 hover:border-stone-300 hover:text-stone-600 hover:bg-stone-50 transition-all">+ Add Milestone</button>
      </div>
    );
  };

  // ── Minimum Standards Config ──

  const minimumStandardsConfig = () => {
    const standards = getMinimumStandards();
    return (
      <div className="space-y-3">
        <p className="text-[10px] text-stone-400 leading-relaxed">
          Define the minimum commitments the prospect must meet before go-live. These appear as checkboxes in the room.
        </p>
        <div className="space-y-1.5">
          {standards.map(s => (
            <div key={s.id} className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2 transition-all">
              <div className="flex items-center gap-2 min-w-0">
                <Check size={12} className="text-emerald-500 shrink-0" />
                <span className="text-[11px] font-semibold text-stone-700 truncate">{s.label}</span>
              </div>
              <button
                onClick={() => removeStandard(s.id)}
                className="shrink-0 ml-2 text-stone-300 hover:text-rose-400 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newStandardLabel}
            onChange={e => setNewStandardLabel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addStandard(newStandardLabel); } }}
            placeholder="Add a new minimum standard…"
            className="flex-1 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
          />
          <button
            onClick={() => addStandard(newStandardLabel)}
            disabled={!newStandardLabel.trim()}
            className="flex items-center gap-1 rounded-lg bg-stone-800 px-3 py-2 text-[10px] font-bold text-white hover:bg-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={10} /> Add
          </button>
        </div>
        {(session.custom_minimum_standards ?? []).length > 0 && (
          <button
            onClick={() => {
              const { custom_minimum_standards, ...rest } = session as any;
              handleSessionChange(rest as any);
            }}
            className="flex items-center gap-1 text-[10px] text-stone-400 hover:text-stone-600 transition-colors"
          >
            <RotateCcw size={10} /> Reset to defaults
          </button>
        )}
      </div>
    );
  };


  // ── Config content mapper ──

  const getConfigContent = (sectionId: string): React.ReactNode | undefined => {
    switch (sectionId) {
      case 'hero': return heroConfig();
      case 'problemCanvas': return execBriefConfig();
      case 'pains': return painsConfig();
      case 'diagnosis': return diagnosisConfig();
      case 'paradigmShift': return paradigmShiftConfig();
      case 'competitive': return competitiveConfig();
      case 'socialProof': return <SocialProofConfig session={session} onSessionChange={handleSessionChange} />;
      case 'solution': return solutionConfig();
      case 'playbooks': return <PlaybookConfig session={session} onSessionChange={handleSessionChange} />;
      case 'roi': return roiConfig();
      case 'minimumStandards': return minimumStandardsConfig();
      case 'contractSecurity': return contractSecurityConfig();
      case 'map': return mapConfig();
      case 'pricing': return <PricingConfigPanel session={session} onSessionChange={handleSessionChange} />;
      case 'alignmentChecklist': return alignmentChecklistConfig();
      case 'proposal': return nextStepsConfig();
      default: return undefined;
    }
  };

  // ── D4: Next Steps config ──
  const nextStepsConfig = () => (
    <div className="space-y-3">
      <p className="text-[10px] text-stone-400 leading-relaxed">
        Define the agreed next action and meeting date. These appear in the prospect's Next Steps section.
      </p>
      <div>
        <label className="text-[9px] font-bold text-stone-400 mb-1 block">Agreed Next Action</label>
        <input
          type="text"
          value={session.next_action ?? ''}
          onChange={e => handleSessionChange({ ...session, next_action: e.target.value })}
          placeholder="Schedule closing call, send contract, internal review..."
          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
        />
      </div>
      <div>
        <label className="text-[9px] font-bold text-stone-400 mb-1 block">Next Meeting Date</label>
        <input
          type="date"
          value={session.next_meeting_date ?? ''}
          onChange={e => handleSessionChange({ ...session, next_meeting_date: e.target.value })}
          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
        />
      </div>
      <div>
        <label className="text-[9px] font-bold text-stone-400 mb-1 block">Rep Contact Name</label>
        <input
          type="text"
          value={(session as any).cms_prepared_by ?? ''}
          onChange={e => handleSessionChange({ ...session, cms_prepared_by: e.target.value } as any)}
          placeholder="Tyler Hanson"
          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
        />
      </div>
    </div>
  );

  // ── D4: Alignment Checklist / Confirmation Close config ──
  const alignmentChecklistConfig = () => {
    const checks = session.alignment_checks ?? { urgent_priority: false, resources_insufficient: false, problems_solutions: false, roi_sufficient: false, right_solution: false };
    const updateCheck = (key: keyof typeof checks, val: boolean) => {
      handleSessionChange({ ...session, alignment_checks: { ...checks, [key]: val } });
    };
    return (
      <div className="space-y-3">
        <p className="text-[9px] text-stone-400 italic">The 3-question close from the training deck (Slides 187-193)</p>
        {[
          { key: 'problems_solutions' as const, label: 'Aligned on PROBLEMS + HOW we solve them?' },
          { key: 'roi_sufficient' as const, label: 'Aligned on OUTCOMES + ROI sufficient?' },
          { key: 'right_solution' as const, label: 'Are we THE right solution?' },
        ].map(q => (
          <div key={q.key} className="flex items-start gap-2 rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2">
            <button
              onClick={() => updateCheck(q.key, !checks[q.key])}
              className={`shrink-0 mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                checks[q.key] ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-stone-300 bg-white'
              }`}
            >
              {checks[q.key] && <Check size={10} />}
            </button>
            <span className="text-[10px] font-semibold text-stone-600 leading-snug">{q.label}</span>
          </div>
        ))}
        <div className="pt-2 space-y-2">
          <div>
            <label className="text-[9px] font-bold text-stone-400 mb-1 block">Next Action</label>
            <input
              type="text"
              value={session.next_action ?? ''}
              onChange={e => handleSessionChange({ ...session, next_action: e.target.value })}
              placeholder="Schedule closing call, send contract..."
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label className="text-[9px] font-bold text-stone-400 mb-1 block">Next Meeting</label>
            <input
              type="date"
              value={session.next_meeting_date ?? ''}
              onChange={e => handleSessionChange({ ...session, next_meeting_date: e.target.value })}
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>
    );
  };

  // ── Gut feel indicator ──

  const gutFeelEmoji = session.gut_feel === 'strong' ? '🟢' : session.gut_feel === 'cautious' ? '🟡' : session.gut_feel === 'at_risk' ? '🔴' : '⬜';

  // ── Notes count ──
  const notesCount = (session.granola_notes || []).length;

  // ════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════

  // ── Preview iframe key (refreshes on session changes) ──
  const previewKey = useMemo(() => {
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'draft';
    return slug;
  }, [companyName]);

  const [previewRefreshCount, setPreviewRefreshCount] = useState(0);

  // Trigger preview refresh when session fields or visibility changes
  useEffect(() => {
    const timer = setTimeout(() => setPreviewRefreshCount(c => c + 1), 1500);
    return () => clearTimeout(timer);
  }, [visibility, session]);

  // ── CMS field helpers ──
  const cmsSubtitle = (session as any).cms_subtitle ?? 'A Benchmark for Best-in-Class Recruiting Infrastructure';
  const cmsPreparedFor = (session as any).cms_prepared_for ?? session.stakeholders?.[0]?.name ?? session.champion_name ?? '';
  const cmsPreparedBy = (session as any).cms_prepared_by ?? 'Tyler Hanson';
  const cmsDate = (session as any).cms_date ?? new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const cmsConfidential = (session as any).cms_confidential ?? false;
  const cmsAccent = (session as any).cms_accent ?? '#6366f1';
  const cmsGradient1 = (session as any).cms_gradient_1 ?? '#1a1a2e';
  const cmsGradient2 = (session as any).cms_gradient_2 ?? '#16213e';
  const cmsGradient3 = (session as any).cms_gradient_3 ?? '#0f3460';

  // ── Stakeholders helper ──
  const stakeholders = session.stakeholders ?? [];
  const updateStakeholder = (idx: number, field: string, val: string) => {
    const updated = [...stakeholders];
    updated[idx] = { ...updated[idx], [field]: val };
    handleSessionChange({ ...session, stakeholders: updated });
  };
  const addStakeholder = () => {
    handleSessionChange({ ...session, stakeholders: [...stakeholders, { name: '', role: '', email: '', note: '' }] });
  };
  const removeStakeholder = (idx: number) => {
    handleSessionChange({ ...session, stakeholders: stakeholders.filter((_: any, i: number) => i !== idx) });
  };

  return (
    <>
      <div className="flex-1 min-h-0 flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="flex-1 min-h-0 flex">

          {/* ─────────── LEFT SIDEBAR ─────────── */}
          <div className="w-[380px] shrink-0 flex flex-col border-r border-stone-200 bg-[#f8f7f6]">

            {/* Sidebar Header */}
            <div className="shrink-0 px-4 py-3 border-b border-stone-200 bg-white flex items-center gap-2">
              <span className="text-[11px] font-black text-stone-800 flex-1">{companyName || 'New Deal'}</span>
              <span className="text-[9px] text-emerald-500 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Saved
              </span>
              <button onClick={() => setShowGranolaSync(true)} className="flex items-center gap-1 px-2 py-1 bg-stone-100 rounded-lg text-[10px] font-semibold text-stone-600 hover:bg-stone-200 transition-colors">
                🌿 Granola
              </button>
              <button onClick={flashSave} className="px-2.5 py-1 bg-stone-800 text-white rounded-lg text-[10px] font-bold hover:bg-stone-700 transition-colors">Save</button>
            </div>

            {/* Scrollable Editor */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="px-4 py-4 space-y-3">

                {/* 1. Deal Settings */}
                <Collapsible title="Deal Settings" defaultOpen>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[9px] font-bold text-stone-400 mb-1 block">Company Name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={e => handleSessionChange({ ...session, company_name: e.target.value })}
                        placeholder="Acme Corp"
                        className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-stone-400 mb-1 block">Subtitle</label>
                      <input
                        type="text"
                        value={cmsSubtitle}
                        onChange={e => handleSessionChange({ ...session, cms_subtitle: e.target.value } as any)}
                        placeholder="A Benchmark for Best-in-Class Recruiting Infrastructure"
                        className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-stone-400 mb-1 block">Prepared For</label>
                        <input
                          type="text"
                          value={cmsPreparedFor}
                          onChange={e => handleSessionChange({ ...session, cms_prepared_for: e.target.value } as any)}
                          placeholder="Jane Smith"
                          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-stone-400 mb-1 block">Prepared By</label>
                        <input
                          type="text"
                          value={cmsPreparedBy}
                          onChange={e => handleSessionChange({ ...session, cms_prepared_by: e.target.value } as any)}
                          placeholder="Tyler Hanson"
                          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-stone-400 mb-1 block">Date</label>
                      <input
                        type="text"
                        value={cmsDate}
                        onChange={e => handleSessionChange({ ...session, cms_date: e.target.value } as any)}
                        placeholder="June 2026"
                        className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2">
                      <span className="text-[10px] font-semibold text-stone-600">Confidential</span>
                      <button
                        onClick={() => handleSessionChange({ ...session, cms_confidential: !cmsConfidential } as any)}
                        className={`relative shrink-0 w-9 h-5 rounded-full transition-colors ${cmsConfidential ? 'bg-stone-800' : 'bg-stone-200'}`}
                      >
                        <motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" animate={{ x: cmsConfidential ? 17 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                      </button>
                    </div>
                  </div>
                </Collapsible>

                {/* 2. Theme */}
                <Collapsible title="Theme">
                  <div className="space-y-3">
                    <div>
                      <label className="text-[9px] font-bold text-stone-400 mb-1 block">Accent Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={cmsAccent}
                          onChange={e => handleSessionChange({ ...session, cms_accent: e.target.value } as any)}
                          className="w-8 h-8 rounded-lg border border-stone-200 cursor-pointer"
                        />
                        <span className="text-[10px] font-mono text-stone-500">{cmsAccent}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-stone-400 mb-1 block">Cover Gradient</label>
                      <div className="flex gap-3">
                        {[
                          { label: 'Stop 1', value: cmsGradient1, key: 'cms_gradient_1' },
                          { label: 'Stop 2', value: cmsGradient2, key: 'cms_gradient_2' },
                          { label: 'Stop 3', value: cmsGradient3, key: 'cms_gradient_3' },
                        ].map(g => (
                          <div key={g.key} className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={g.value}
                              onChange={e => handleSessionChange({ ...session, [g.key]: e.target.value } as any)}
                              className="w-7 h-7 rounded-lg border border-stone-200 cursor-pointer"
                            />
                            <span className="text-[9px] font-mono text-stone-400">{g.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Collapsible>

                {/* 3. BAP Context */}
                <Collapsible title="BAP Context" defaultOpen>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-stone-400 mb-1 block">Industry</label>
                        <select
                          value={session.industry ?? ''}
                          onChange={e => onIndustryChange(e.target.value)}
                          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
                        >
                          <option value="">Select...</option>
                          {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-stone-400 mb-1 block">Incumbent ATS</label>
                        <select
                          value={selectedATS ?? ''}
                          onChange={e => onATSChange(e.target.value)}
                          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
                        >
                          <option value="">Select...</option>
                          {ATS_PROVIDERS.map(ats => <option key={ats.id} value={ats.id}>{ats.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-stone-400 mb-1 block">Employees</label>
                        <input
                          type="number"
                          min={1}
                          value={session.pricing_employee_count || ''}
                          onChange={e => handleSessionChange({ ...session, pricing_employee_count: Number(e.target.value) })}
                          placeholder="350"
                          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-stone-400 mb-1 block">Annual Hires</label>
                        <input
                          type="number"
                          min={0}
                          value={session.roi_inputs?.totalHires || ''}
                          onChange={e => { const v = Number(e.target.value); handleSessionChange({ ...session, roi_inputs: { ...(session.roi_inputs || {}), totalHires: v } }); }}
                          placeholder="120"
                          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-stone-400 mb-1 block">Persona</label>
                      <select
                        value={selectedPersona ?? ''}
                        onChange={e => onPersonaChange(e.target.value)}
                        className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
                      >
                        <option value="">Select...</option>
                        <option value="vp-ta">VP of Talent Acquisition</option>
                        <option value="chro">CHRO / VP People</option>
                        <option value="dir-eb">Director of Employer Brand</option>
                        <option value="hiring-manager">Hiring Manager</option>
                        <option value="cfo">CFO / Finance</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="procurement">Procurement</option>
                        <option value="it-cio">IT / CIO</option>
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[9px] font-bold text-stone-400">Pains</label>
                        <button
                          onClick={() => setShowPainModal(true)}
                          className="flex items-center gap-1 px-2 py-0.5 bg-stone-800 text-white rounded-md text-[9px] font-bold hover:bg-stone-700 transition-colors"
                        >
                          <Target size={8} /> Manage
                        </button>
                      </div>
                      {selectedPains.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {selectedPains.slice(0, 6).map(id => {
                            const pain = TT_PAINS.find(p => p.id === id);
                            return pain ? (
                              <span key={id} className="inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 text-[9px] font-semibold text-stone-600">{pain.title}</span>
                            ) : null;
                          })}
                          {selectedPains.length > 6 && <span className="text-[9px] text-stone-400">+{selectedPains.length - 6} more</span>}
                        </div>
                      ) : (
                        <p className="text-[10px] text-stone-400 italic">No pains selected</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-stone-400 mb-1 block">Use Case</label>
                      <select
                        value={session.use_case ?? ''}
                        onChange={e => { onUseCaseChange(e.target.value); handleSessionChange({ ...session, use_case: e.target.value || null }); }}
                        className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
                      >
                        <option value="">Select...</option>
                        <option value="replacing-ats">Replacing ATS</option>
                        <option value="first-ats">First ATS</option>
                        <option value="adding-brand">Employer Brand</option>
                        <option value="consolidating">Consolidating</option>
                        <option value="scaling">Scaling TA</option>
                      </select>
                    </div>
                  </div>
                </Collapsible>

                {/* 4. Sections label */}
                <div className="pt-2">
                  <span className="text-[9px] font-black text-stone-400 uppercase tracking-[0.15em] px-1">Sections</span>
                </div>

                {/* 5. Section list — grouped by 4D/BAP Checkpoints */}
                {/* Compute page numbers matching BusinessCaseDocument numbering */}
                {(() => {
                  // ALL_SECTIONS order from BusinessCaseDocument — must stay in sync
                  const DOC_ORDER: string[] = [
                    'hero', 'problemCanvas', 'pains', 'diagnosis', 'paradigmShift',
                    'competitive', 'socialProof', 'solution', 'playbooks', 'roi',
                    'pricing', 'minimumStandards', 'contractSecurity', 'map',
                    'alignmentChecklist', 'proposal',
                  ];
                  const visibleKeys = DOC_ORDER.filter(k => visibility[k as keyof typeof visibility]);
                  const pageNumFor = (visKey: string): string | null => {
                    const idx = visibleKeys.indexOf(visKey);
                    return idx >= 0 ? String(idx + 1).padStart(2, '0') : null;
                  };

                  return (
                <div className="space-y-2">
                  {PHASE_GROUPS.map(group => (
                    <div key={group.phase}>
                      {/* Phase header */}
                      <div className="flex items-center gap-2 mt-3 mb-2 first:mt-0">
                        <span
                          className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: CP_COLORS[group.phase as keyof typeof CP_COLORS].bg,
                            color: CP_COLORS[group.phase as keyof typeof CP_COLORS].text,
                            border: `1px solid ${CP_COLORS[group.phase as keyof typeof CP_COLORS].border}`,
                          }}
                        >
                          {group.phase}
                        </span>
                        <span className="text-[10px] font-bold text-stone-600">{group.label}</span>
                        <div className="flex-1 h-px bg-stone-200" />
                        <span className="text-[8px] font-semibold text-stone-400 italic">{group.question}</span>
                      </div>

                      {/* Sections in this phase */}
                      <div className="space-y-1.5">
                        {group.sections.map(section => {
                          const lock = getSectionLock(section.visKey);
                          return (
                            <SectionItem
                              key={section.id}
                              title={section.label}
                              pageNum={pageNumFor(section.visKey)}
                              locked={lock.locked}
                              lockedLabel={lock.unlockStageLabel}
                              enabled={visibility[section.visKey]}
                              onToggle={() => toggleVisibility(section.visKey)}
                              onExpand={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                              isExpanded={expandedSection === section.id}
                            >
                              {section.hasConfig && getConfigContent(section.id)}
                            </SectionItem>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Library widgets added by rep */}
                  {((session as any).library_widgets ?? []).map((widget: any, i: number) => (
                    <SectionItem
                      key={`lib-${i}`}
                      title={widget.title}
                      enabled={widget.enabled !== false}
                      onToggle={() => {
                        const widgets = [...((session as any).library_widgets ?? [])];
                        widgets[i] = { ...widgets[i], enabled: !(widgets[i].enabled !== false) };
                        handleSessionChange({ ...session, library_widgets: widgets } as any);
                      }}
                      onExpand={() => setExpandedSection(expandedSection === `lib-${i}` ? null : `lib-${i}`)}
                      isExpanded={expandedSection === `lib-${i}`}
                      isLibrary
                      onRemove={() => {
                        const widgets = [...((session as any).library_widgets ?? [])];
                        widgets.splice(i, 1);
                        handleSessionChange({ ...session, library_widgets: widgets } as any);
                      }}
                    />
                   ))}
                 </div>

                  ); // end of computed page numbers IIFE
                })()}

                {/* 6. + Add Section */}
                <div className="relative">
                  <button
                    onClick={() => setShowAddSection(!showAddSection)}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-stone-200 text-[10px] font-bold text-stone-400 hover:border-stone-400 hover:text-stone-600 hover:bg-white transition-all"
                  >
                    + Add Section
                  </button>
                  {showAddSection && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border shadow-lg z-10 py-1 max-h-60 overflow-y-auto">
                      <button
                        onClick={() => { setShowLibrary(true); setShowAddSection(false); }}
                        className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-violet-600 hover:bg-violet-50 border-b border-stone-100"
                      >
                        📚 Browse Library
                      </button>
                      {['Executive Summary', 'Challenges', 'Features', 'Why Dedicated ATS', 'Investment', 'Next Steps'].map(label => (
                        <button
                          key={label}
                          onClick={() => {
                            const widgets = (session as any).library_widgets ?? [];
                            handleSessionChange({ ...session, library_widgets: [...widgets, { title: label, type: label.toLowerCase().replace(/\s+/g, '-'), enabled: true }] } as any);
                            setShowAddSection(false);
                          }}
                          className="w-full text-left px-4 py-2 text-[11px] text-stone-600 hover:bg-stone-50"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 7. Contacts */}
                <Collapsible title="Contacts">
                  <div className="space-y-3">
                    {stakeholders.map((s: any, i: number) => (
                      <div key={i} className="rounded-lg border border-stone-200 bg-stone-50/50 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-stone-400">Contact {i + 1}</span>
                          <button onClick={() => removeStakeholder(i)} className="text-stone-300 hover:text-red-400 transition-colors"><X size={12} /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-bold text-stone-400 mb-0.5 block">Name</label>
                            <input type="text" value={s.name || ''} onChange={e => updateStakeholder(i, 'name', e.target.value)} placeholder="Jane Smith" className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 transition-colors" />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-stone-400 mb-0.5 block">Role</label>
                            <input type="text" value={s.role || ''} onChange={e => updateStakeholder(i, 'role', e.target.value)} placeholder="VP of TA" className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 transition-colors" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-stone-400 mb-0.5 block">Email</label>
                          <input type="email" value={s.email || ''} onChange={e => updateStakeholder(i, 'email', e.target.value)} placeholder="jane@acme.com" className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 transition-colors" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-stone-400 mb-0.5 block">Note</label>
                          <input type="text" value={s.note || ''} onChange={e => updateStakeholder(i, 'note', e.target.value)} placeholder="Decision maker, strong advocate" className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 transition-colors" />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addStakeholder}
                      className="w-full flex items-center justify-center gap-1 rounded-lg border-2 border-dashed border-stone-200 py-2 text-[10px] font-semibold text-stone-400 hover:border-stone-300 hover:text-stone-600 hover:bg-white transition-all"
                    >
                      <Plus size={10} /> Add Contact
                    </button>
                  </div>
                </Collapsible>

                <div className="h-4" />
              </div>
            </div>

            {/* Sidebar Footer: BAP Progress */}
            <div className="shrink-0 border-t border-stone-200 bg-white px-3 py-2.5">
              <div className="flex items-center gap-2">
                {/* D1-D4 progress dots */}
                <div className="flex items-center gap-0.5">
                  {['D1', 'D2', 'D3', 'D4'].map((label, i) => {
                    const isComplete = i === 0 ? cp1Status.passed
                      : i === 1 ? cp1Status.passed && cp2Status.passed
                      : i === 2 ? cp1Status.passed && cp2Status.passed && cp3Status.passed
                      : false;
                    const isCurrent = !isComplete && (
                      i === 0 ? !cp1Status.passed
                      : i === 1 ? cp1Status.passed && !cp2Status.passed
                      : i === 2 ? cp1Status.passed && cp2Status.passed && !cp3Status.passed
                      : false
                    );
                    return (
                      <div key={label} className="flex items-center gap-0.5">
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[8px] font-black ${
                          isComplete ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-amber-100 text-amber-600 border border-amber-300' : 'bg-stone-100 text-stone-400'
                        }`}>
                          {isComplete ? '✓' : label}
                        </span>
                        {i < 3 && <div className="w-2 h-px bg-stone-200" />}
                      </div>
                    );
                  })}
                </div>

                <div className="w-px h-4 bg-stone-200" />

                {/* CP scores */}
                {[
                  { label: 'CP1', score: cp1Score, status: cp1Status },
                  { label: 'CP2', score: cp2Score, status: cp2Status },
                  { label: 'CP3', score: cp3Score, status: cp3Status },
                ].map(cp => (
                  <span key={cp.label} className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                    cp.status.passed ? 'bg-emerald-50 text-emerald-600' : cp.score > 0 ? 'bg-amber-50 text-amber-600' : 'bg-stone-50 text-stone-400'
                  }`}>
                    {cp.label} {cp.score}/{MAX_CP_SCORE}
                  </span>
                ))}

                <div className="flex-1" />

                {/* Gut feel */}
                <span className="text-[9px] font-semibold text-stone-500">
                  {gutFeelEmoji}
                </span>
              </div>
            </div>
          </div>

          {/* ─────────── RIGHT PANEL: Live Preview ─────────── */}
          <div className="flex-1 min-w-0 flex flex-col bg-stone-100">
            {/* Preview Header */}
            <div className="shrink-0 px-5 py-2.5 border-b border-stone-200 bg-white flex items-center gap-3">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Live Preview</span>
              <div className="flex-1" />
              <button
                onClick={() => setPreviewRefreshCount(c => c + 1)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-500 text-[10px] font-semibold hover:bg-stone-200 transition-colors"
              >
                <RotateCcw size={10} />
                Refresh
              </button>
              <a
                href={`/${previewKey}/business-case`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 text-white text-[10px] font-semibold hover:bg-stone-700 transition-colors"
              >
                <Eye size={10} />
                Open Full Preview
              </a>
            </div>
            {/* Preview Document */}
            <div className="flex-1 min-h-0 bg-stone-100 p-8 flex justify-center overflow-y-auto overflow-x-hidden custom-scrollbar">
              <div 
                className="w-full max-w-[850px] bg-transparent relative"
                style={{ minHeight: '80vh' }}
              >
                <div className="relative z-10 w-full h-full pointer-events-auto">
                  <BusinessCaseDocument
                    companyName={companyName || 'New Company'}
                    themeColor={themeColor || '#1c1917'}
                    selectedPains={selectedPains || []}
                    session={session}
                    visibility={visibility}
                    isRepPreview={true}
                    currentApproach={(session.call_sheet_answers || {})['q5'] as string}
                    rootCause={(session.call_sheet_answers || {})['q6'] as string}
                    biggerProblemOverride={(session as any)?.diagnosis_bigger_problem_override}
                    problemStatement={(session.call_sheet_answers || {})['q1'] as string}
                    businessImpact={(session.call_sheet_answers || {})['q4a'] as string}
                    urgencyReason={(session.call_sheet_answers || {})['q4b'] as string}
                    customMessage={computeHeroMessage(session)}
                    repName={cmsPreparedBy}
                    showPricing={true}
                    enabledProofCustomers={session.enabled_proof_customers}
                    enabledPlaybookIds={session.enabled_playbook_ids}
                    onMAPChange={() => {}}
                    onContractReadinessChange={() => {}}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ════════ Modals ════════ */}
      <PainModal open={showPainModal} onClose={() => setShowPainModal(false)} selectedPains={selectedPains} onToggle={togglePain} />
      <GranolaSettingsDrawer isOpen={showGranolaSettings} onClose={() => setShowGranolaSettings(false)} />
      <GranolaSyncModal
        isOpen={showGranolaSync}
        onClose={() => setShowGranolaSync(false)}
        sessionId={session.id}
        session={session}
        onFieldsMerged={(fieldCount?: number) => {
          onSessionChange({ ...session });
          setDebriefFieldCount(fieldCount || 0);
          setShowDebrief(true);
        }}
      />
      <PostCallDebriefModal
        isOpen={showDebrief}
        onClose={() => setShowDebrief(false)}
        companyName={companyName}
        fieldsExtracted={debriefFieldCount}
        currentNextAction={session.next_action}
        currentNextMeeting={session.next_meeting_date}
        currentGutFeel={session.gut_feel}
        onSave={(data) => {
          handleSessionChange({
            ...session,
            gut_feel: data.gut_feel,
            gut_feel_note: data.gut_feel_note,
            next_action: data.next_action,
            next_meeting_date: data.next_meeting_date,
            last_call_date: new Date().toISOString().split('T')[0],
          });
          setShowDebrief(false);
          setShowFollowUpEmail(true);
        }}
      />
      <FollowUpEmailDraft
        isOpen={showFollowUpEmail}
        onClose={() => setShowFollowUpEmail(false)}
        session={session}
      />
      <DealPostMortemModal
        isOpen={showLossReason}
        onClose={() => setShowLossReason(false)}
        session={session}
        onSave={(symptoms, analysis) => {
          handleSessionChange({
            ...session,
            post_mortem_completed: true,
            post_mortem_symptoms: symptoms,
            post_mortem_fatality: analysis.type,
            post_mortem_pathway: analysis.description,
          });
          setShowLossReason(false);
        }}
      />
      <ContentLibraryModal
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
        onInsert={(widget) => {
          const widgets = (session as any).library_widgets ?? [];
          handleSessionChange({ ...session, library_widgets: [...widgets, { ...widget, enabled: true }] } as any);
        }}
        companyName={companyName}
        sessionSlug={previewKey}
        currentAts={selectedATS ?? undefined}
        industry={session.industry ?? undefined}
      />
    </>
  );
}

// ════════════════════════════════════════════════════════════════
// Collapsible — reusable sidebar section
// ════════════════════════════════════════════════════════════════

function Collapsible({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? false);
  return (
    <div className="border border-stone-200 rounded-xl bg-white overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-stone-50 transition-colors"
      >
        <ChevronDown size={14} className={`text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex-1">{title}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SectionItem — individual section in the section list
// ════════════════════════════════════════════════════════════════

function SectionItem({
  title, pageNum, enabled, locked, lockedLabel, onToggle, onExpand, isExpanded, isLibrary, onRemove, children,
}: {
  title: string; pageNum?: string | null; enabled: boolean;
  locked?: boolean; lockedLabel?: string;
  onToggle: () => void;
  onExpand: () => void; isExpanded: boolean;
  isLibrary?: boolean; onRemove?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className={`border rounded-xl transition-all ${isExpanded ? 'border-stone-300 shadow-sm bg-white' : 'border-stone-200 bg-white'}`}>
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* Drag grip */}
        <div className="text-stone-300 cursor-grab" title="Drag to reorder">
          <GripVertical size={14} />
        </div>
        {/* Page number badge */}
        {pageNum && enabled ? (
          <span className="shrink-0 w-6 h-5 flex items-center justify-center rounded-md bg-stone-100 text-[9px] font-bold text-stone-500 tabular-nums">
            {pageNum}
          </span>
        ) : pageNum === null || !enabled ? (
          <span className="shrink-0 w-6 h-5 flex items-center justify-center rounded-md bg-stone-50 text-[9px] font-bold text-stone-300 tabular-nums">
            —
          </span>
        ) : null}
        {/* Title — click to expand */}
        <button onClick={onExpand} className="flex-1 text-left text-[11px] font-semibold text-stone-700 hover:text-stone-900 transition-colors flex items-center gap-1.5">
          {title}
          {locked && enabled && (
            <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full" title={`Visible to prospect at ${lockedLabel}`}>
              🔒 {lockedLabel}
            </span>
          )}
        </button>
        {/* Toggle */}
        <button onClick={onToggle} className={`relative w-9 h-5 rounded-full transition-colors ${enabled ? 'bg-stone-800' : 'bg-stone-200'}`}>
          <motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" animate={{ x: enabled ? 17 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
        </button>
        {/* Remove button for library items */}
        {isLibrary && onRemove && (
          <button onClick={onRemove} className="text-stone-300 hover:text-red-400 transition-colors"><X size={14} /></button>
        )}
      </div>
      {/* Expandable config content */}
      <AnimatePresence>
        {isExpanded && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-stone-100">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

