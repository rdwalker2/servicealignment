/* eslint-disable react-refresh/only-export-components */
// ============================================================
// ControlDrawer — Unified rep-side control panel
// Consolidates Settings, Copilot, and inline config panels
// into one clean 4-tab drawer: Room · Call Sheet · Coach · Competitors
//
// Design patterns stolen from ForGood GranteeProfileDrawer
// and Build-ABA MissionExecutionDrawer
//
// v2: Decomposed — static data in controlDrawerData.ts,
// BAPTab in BAPTab.tsx, CoachTab in CoachTab.tsx
// ============================================================

import { useState, useCallback, useMemo } from 'react';
import {
  Eye, EyeOff, ChevronRight,
  Target, Search, Swords, Lightbulb,
  DollarSign,
  ClipboardList, MessageCircle,
  Layout, Sparkles, CheckCircle2,
  FileText, Calendar,
  Check, Lock,
  TrendingUp, Users,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { TT_PAINS } from './PainDiscoveryModule';
import { DEMO_AREAS } from './FeatureWalkthrough';
import type { DiscoverySession } from '../../lib/discoveryDatabase';
import type { RoomVisibility } from './RoomSections';
import { SECTION_UNLOCK_STAGE, STAGE_SHORT_LABELS, isStageAtOrPast } from './RoomSections';
import { ALL_CASE_STUDIES } from './SocialProofGrid';
import { PLAYBOOKS } from '../../data/playbooks';
import { updateSessionPillars, updateSessionROIConfig } from '../../lib/discoveryDatabase';
import { computeBAPAnswers, BAP_QUESTIONS } from '../../lib/discoveryDatabase';
import { CompetitorBattlecardTab } from './CompetitorBattlecardTab';
import { PricingConfigPanel } from './PricingConfigPanel';

import {
  ATS_OPTIONS, HRIS_OPTIONS, PERSONA_OPTIONS,
  INDUSTRY_OPTIONS, SIZE_OPTIONS, USE_CASE_OPTIONS,
} from '../../data/roomOptions';

// ── Extracted tab components ──
import { BAPTab } from './BAPTab';
import { CoachTab } from './CoachTab';

// ── Extracted data & helpers ──
import {
  ROI_CATEGORIES,
  SECTIONS,
  computeDealKillFlags,
  type SectionKey,
  type SectionDef,
} from '../../data/controlDrawerData';

// Re-export SectionKey for RepWorkspace and other consumers
export type { SectionKey };
// Re-export tab components for any external consumers
export { BAPTab, CoachTab };
// Re-export helpers used externally
export { computeDealKillFlags, POWER_QUESTIONS } from '../../data/controlDrawerData';

// ── Reusable InspectorSection (stolen from ForGood EntitySheet) ──

function InspectorSection({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mb-6 last:mb-0">
      <div className="mb-3 flex items-center justify-between border-b border-stone-50 pb-2">
        <h3 className="text-[10px] font-bold tracking-[0.1em] text-stone-400">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

// ── Reusable select input (ForGood pattern) ──

const selectClass = 'w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-700 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-200 transition-colors';

// ── Expand/collapse animation ──

const expandVariants = {
  collapsed: { height: 0, opacity: 0, overflow: 'hidden' as const },
  expanded: { height: 'auto', opacity: 1, overflow: 'visible' as const },
};

// ── Props ──

interface ControlDrawerProps {
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
  prospectToken?: string;
}

// ── Tabs ──

type TabId = 'room' | 'callsheet' | 'coach' | 'competitors';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'room', label: 'Room', icon: Layout },
  { id: 'callsheet', label: 'Call Sheet', icon: ClipboardList },
  { id: 'coach', label: 'Coach', icon: MessageCircle },
  { id: 'competitors', label: 'Competitors', icon: Swords },
];

// ════════════════════════════════════════════════════════════════
// Main Component
// ════════════════════════════════════════════════════════════════

export function ControlDrawer({
  session,
  visibility,
  onVisibilityChange,
  onSessionChange,
  selectedPains,
  onPainChange,
  selectedPersona,
  onPersonaChange,
  selectedATS,
  onATSChange,
  onIndustryChange,
  onCompanySizeChange,
  onUseCaseChange,
  prospectToken,
}: ControlDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabId>('room');
  const [expandedSection, setExpandedSection] = useState<SectionKey | null>(null);

  // ── Handlers ──

  const toggleVisibility = (key: SectionKey) => {
    onVisibilityChange({ ...visibility, [key]: !visibility[key] });
    // Item 4: Scroll the section into view in the room preview
    setTimeout(() => {
      const sectionMap: Record<string, string> = {
        hero: 'hero', pains: 'pain-discovery', problemCanvas: 'problem-canvas', diagnosis: 'diagnosis',
        competitive: 'ats-kill', solution: 'walkthrough', socialProof: 'social-proof',
        roi: 'roi', map: 'map', contractSecurity: 'contract-security', pricing: 'pricing', proposal: 'proposal',
      };
      const el = document.getElementById(sectionMap[key] || key);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const toggleExpand = (key: SectionKey) => {
    setExpandedSection(prev => (prev === key ? null : key));
  };

  const togglePain = (painId: string) => {
    if (selectedPains.includes(painId)) {
      onPainChange(selectedPains.filter(p => p !== painId));
    } else {
      onPainChange([...selectedPains, painId]);
    }
  };

  const togglePillar = (pillarId: string) => {
    const current = session.overridden_pillars ?? [];
    const next = current.includes(pillarId)
      ? current.filter(p => p !== pillarId)
      : [...current, pillarId];
    updateSessionPillars(session.id, next);
    onSessionChange({ ...session, overridden_pillars: next });
  };

  const toggleROICategory = (catKey: string) => {
    const current = session.roi_enabled_categories ?? {
      seatSavings: true, agencySavings: true, vacancySavings: true,
      jobBoardSavings: true, adminTimeSavings: true,
    };
    const next = { ...current, [catKey]: !current[catKey] };
    updateSessionROIConfig(session.id, next, session.roi_assumptions ?? {});
    onSessionChange({ ...session, roi_enabled_categories: next });
  };

  // ── Memoized expensive computations ──
  const bapAnswers = useMemo(() => computeBAPAnswers(session), [session]);
  const killFlags = useMemo(() => computeDealKillFlags(session), [session]);

  // ── Counts ──

  const enabledCount = Object.values(visibility).filter(Boolean).length;
  const totalCount = Object.values(visibility).length;

  return (
    <div className="flex h-full flex-col">
      {/* ── Tab Navigation — ForGood style with bottom border highlight + Item 3 badges ── */}
      <div className="flex shrink-0 border-b border-stone-100">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          // Item 3: Compute badge content per tab
          let badge: React.ReactNode = null;
          if (tab.id === 'room' && selectedPains.length === 0) {
            badge = <span className="absolute -top-0.5 -right-0.5 w-[5px] h-[5px] rounded-full bg-orange-400" />;
          }
          if (tab.id === 'callsheet') {
            const bapAnswered = BAP_QUESTIONS.filter(q => !!bapAnswers[q.id as keyof typeof bapAnswers]).length;
            badge = <span className="absolute -top-0.5 -right-1 text-[8px] font-bold text-stone-400 tabular-nums">{bapAnswered}/{BAP_QUESTIONS.length}</span>;
          }
          if (tab.id === 'coach') {
            if (killFlags.length > 0) {
              badge = <span className="absolute -top-0.5 -right-0.5 w-[5px] h-[5px] rounded-full bg-rose-500" />;
            }
          }
          if (tab.id === 'competitors') {
            if (selectedATS && selectedATS !== 'none' && selectedATS !== 'other' && selectedATS !== 'unknown') {
               badge = <span className="absolute -top-0.5 -right-0.5 w-[5px] h-[5px] rounded-full bg-indigo-500" />;
            }
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'border-b-2 border-stone-800 text-stone-800'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <Icon size={13} />
              {tab.label}
              {badge}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {activeTab === 'room' && (
          <RoomBuilderTab
            visibility={visibility}
            expandedSection={expandedSection}
            session={session}
            selectedPains={selectedPains}
            selectedPersona={selectedPersona}
            selectedATS={selectedATS}
            enabledCount={enabledCount}
            totalCount={totalCount}
            onToggleVisibility={toggleVisibility}
            onToggleExpand={toggleExpand}
            onTogglePain={togglePain}
            onPersonaChange={onPersonaChange}
            onATSChange={onATSChange}
            onIndustryChange={onIndustryChange}
            onCompanySizeChange={onCompanySizeChange}
            onUseCaseChange={onUseCaseChange}
            onTogglePillar={togglePillar}
            onToggleROICategory={toggleROICategory}
            onSessionChange={onSessionChange}
          />
        )}
        {activeTab === 'callsheet' && (
          <BAPTab session={session} onSessionChange={onSessionChange} />
        )}
        {activeTab === 'coach' && (
          <CoachTab session={session} onSessionChange={onSessionChange} prospectToken={prospectToken} />
        )}
        {activeTab === 'competitors' && (
          <CompetitorBattlecardTab selectedATS={selectedATS} />
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Tab 1: Room Builder
// ════════════════════════════════════════════════════════════════

export interface RoomBuilderTabProps {
  visibility: RoomVisibility;
  expandedSection: SectionKey | null;
  session: DiscoverySession;
  selectedPains: string[];
  selectedPersona: string | null;
  selectedATS: string | null;
  enabledCount: number;
  totalCount: number;
  onToggleVisibility: (key: SectionKey) => void;
  onToggleExpand: (key: SectionKey) => void;
  onTogglePain: (painId: string) => void;
  onPersonaChange: (persona: string) => void;
  onATSChange: (ats: string) => void;
  onIndustryChange: (industry: string) => void;
  onCompanySizeChange: (size: string) => void;
  onUseCaseChange: (useCase: string) => void;
  onTogglePillar: (pillarId: string) => void;
  onToggleROICategory: (catKey: string) => void;
  onSessionChange: (session: DiscoverySession) => void;
}

export function RoomBuilderTab({
  visibility, expandedSection, session,
  selectedPains, selectedPersona, selectedATS,
  enabledCount, totalCount,
  onToggleVisibility, onToggleExpand,
  onTogglePain, onPersonaChange, onATSChange,
  onIndustryChange, onCompanySizeChange, onUseCaseChange,
  onTogglePillar, onToggleROICategory,
  onSessionChange,
}: RoomBuilderTabProps) {
  const currentStage = session.deal_stage ?? 'qualifying';

  // Stage config for the progress indicator
  const STAGE_STEPS = [
    { key: 'qualifying', short: 'Q', label: 'Qualifying', color: '#64748b', sections: ['hero', 'pains', 'diagnosis'] },
    { key: 'investigating', short: 'I', label: 'Investigating', color: '#0ea5e9', sections: [] },
    { key: 'evaluating', short: 'E', label: 'Evaluating', color: '#8b5cf6', sections: ['+competitive', '+socialProof'] },
    { key: 'negotiating', short: 'N', label: 'Negotiating', color: '#f59e0b', sections: ['+solution', '+playbooks', '+roi'] },
    { key: 'contracting', short: 'C', label: 'Contracting', color: '#f97316', sections: ['+map', '+proposal'] },
    { key: 'signing', short: 'S', label: 'Signing', color: '#10b981', sections: [] },
  ];

  const STAGE_ORDER = ['qualifying', 'investigating', 'evaluating', 'negotiating', 'contracting', 'signing'];
  const currentIdx = STAGE_ORDER.indexOf(currentStage);

  return (
    <div className="px-4 py-4">
      {/* ── Stage Progress Indicator ── */}
      <div className="mb-4 rounded-xl border border-stone-100 bg-stone-50/80 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[9px] font-bold tracking-[0.1em] text-stone-400">Deal Stage</span>
          <span className="text-[10px] font-semibold text-stone-500">
            {STAGE_STEPS.find(s => s.key === currentStage)?.label ?? 'Discovery'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {STAGE_STEPS.map((step, i) => {
            const isActive = step.key === currentStage;
            const isPast = i < currentIdx;
            return (
              <div key={step.key} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                    isActive || isPast ? '' : 'bg-stone-200'
                  }`}
                  style={isActive || isPast ? { backgroundColor: step.color } : undefined}
                />
                <span className={`text-[8px] font-bold ${
                  isActive ? 'text-stone-800' : isPast ? 'text-stone-500' : 'text-stone-300'
                }`}>
                  {step.short}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary strip — ForGood tripartite pattern */}
      <div className="mb-4 flex rounded-lg border border-stone-100 bg-stone-50 divide-x divide-stone-100 overflow-hidden">
        <div className="flex-1 px-3 py-2 text-center">
          <div className="text-[9px] font-bold text-stone-400">Sections</div>
          <div className="text-sm font-semibold tabular-nums text-stone-800">{enabledCount}/{totalCount}</div>
        </div>
        <div className="flex-1 px-3 py-2 text-center">
          <div className="text-[9px] font-bold text-stone-400">Pains</div>
          <div className="text-sm font-semibold tabular-nums text-stone-800">{selectedPains.length}</div>
        </div>
        <div className="flex-1 px-3 py-2 text-center">
          <div className="text-[9px] font-bold text-stone-400">Pillars</div>
          <div className="text-sm font-semibold tabular-nums text-stone-800">{(session.overridden_pillars ?? []).length}/3</div>
        </div>
      </div>

      {/* Section toggles */}
      <InspectorSection title="Prospect Room Sections">
        <div className="space-y-0.5">
          {SECTIONS.map(sec => {
            const isVisible = visibility[sec.key];
            const isExpanded = expandedSection === sec.key;
            const Icon = sec.icon;

            // Stage gating
            const unlockStage = SECTION_UNLOCK_STAGE[sec.key];
            const unlockLabel = STAGE_SHORT_LABELS[unlockStage] ?? 'D1';
            const isLocked = !isStageAtOrPast(currentStage, unlockStage);

            return (
              <div key={sec.key}>
                {/* Section row */}
                <div className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                  isExpanded ? 'bg-stone-50 border border-stone-100' : isLocked ? 'opacity-50' : 'hover:bg-stone-50/50'
                }`}>
                  {/* Visibility toggle */}
                  <button
                    onClick={() => {
                      if (isLocked && !isVisible) {
                        if (!confirm(`This section typically unlocks at ${unlockLabel}. Enable it anyway?`)) return;
                      }
                      onToggleVisibility(sec.key);
                    }}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors ${
                      isLocked ? 'cursor-pointer' : ''
                    }`}
                    title={
                      isLocked
                        ? `Unlocks at ${unlockLabel} — click to override`
                        : isVisible ? 'Hide from prospect' : 'Show to prospect'
                    }
                  >
                    {isLocked && !isVisible ? (
                      <Lock size={14} className="text-stone-300" />
                    ) : isVisible ? (
                      <Eye size={14} className={isLocked ? 'text-amber-400' : 'text-emerald-500'} />
                    ) : (
                      <EyeOff size={14} className="text-stone-300" />
                    )}
                  </button>

                  {/* Icon + label — clickable for expand */}
                  <button
                    onClick={() => sec.hasConfig && onToggleExpand(sec.key)}
                    className={`flex flex-1 items-center gap-2.5 text-left ${sec.hasConfig ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                      isVisible ? 'bg-stone-100 text-stone-600' : isLocked ? 'bg-stone-50 text-stone-200' : 'bg-stone-50 text-stone-300'
                    }`}>
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-xs font-semibold leading-tight ${
                          isVisible ? 'text-stone-800' : isLocked ? 'text-stone-300' : 'text-stone-400'
                        }`}>
                          {sec.label}
                        </p>
                        {isLocked && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-stone-100 px-1.5 py-0.5 text-[8px] font-bold text-stone-400">
                            {unlockLabel}
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] leading-tight ${
                        isLocked ? 'text-stone-300' : 'text-stone-400'
                      }`}>
                        {isLocked ? `Unlocks at ${unlockLabel}` : sec.description}
                      </p>
                    </div>
                  </button>

                  {/* Expand chevron */}
                  {sec.hasConfig && (
                    <button
                      onClick={() => onToggleExpand(sec.key)}
                      className="flex h-5 w-5 items-center justify-center rounded text-stone-300 hover:text-stone-500 transition-colors"
                    >
                      <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.15 }}>
                        <ChevronRight size={13} />
                      </motion.div>
                    </button>
                  )}
                </div>

                {/* Expandable config — ForGood-style smooth reveal */}
                <AnimatePresence initial={false}>
                  {sec.hasConfig && isExpanded && (
                    <motion.div
                      key={`${sec.key}-config`}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      variants={expandVariants}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="ml-10 border-l-2 border-stone-100 pl-4 pb-3 pt-2">
                        {sec.key === 'pains' && (
                          <PainsConfig
                            selectedPains={selectedPains}
                            selectedPersona={selectedPersona}
                            selectedATS={selectedATS}
                            session={session}
                            onTogglePain={onTogglePain}
                            onPersonaChange={onPersonaChange}
                            onATSChange={onATSChange}
                            onIndustryChange={onIndustryChange}
                            onCompanySizeChange={onCompanySizeChange}
                            onUseCaseChange={onUseCaseChange}
                            onSessionChange={onSessionChange}
                          />
                        )}
                        {sec.key === 'solution' && (
                          <SolutionConfig session={session} onTogglePillar={onTogglePillar} />
                        )}
                        {sec.key === 'roi' && (
                          <ROIConfig session={session} onToggleROICategory={onToggleROICategory} />
                        )}
                        {sec.key === 'playbooks' && (
                          <PlaybookConfig session={session} onSessionChange={onSessionChange} />
                        )}
                        {sec.key === 'socialProof' && (
                          <SocialProofConfig session={session} onSessionChange={onSessionChange} />
                        )}
                        {sec.key === 'pricing' && (
                          <PricingConfigPanel session={session} onSessionChange={onSessionChange} />
                        )}
                        {sec.key === 'proposal' && (
                          <NextStepsConfig session={session} onSessionChange={onSessionChange} />
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </InspectorSection>
    </div>
  );
}

// ── Pains Config Panel ──

const PAIN_FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'selected', label: '✓ Selected' },
  { id: 'dir-eb', label: 'EB Dir' },
  { id: 'vp-ta', label: 'VP TA' },
  { id: 'chro', label: 'CHRO' },
  { id: 'cfo', label: 'CFO' },
  { id: 'recruiter', label: 'Recruiter' },
  { id: 'hiring-manager', label: 'HM' },
] as const;

const PERSONA_BADGE_COLORS: Record<string, string> = {
  'dir-eb': 'bg-violet-100 text-violet-600',
  'vp-ta': 'bg-cyan-100 text-cyan-600',
  'chro': 'bg-rose-100 text-rose-600',
  'cfo': 'bg-emerald-100 text-emerald-600',
  'recruiter': 'bg-amber-100 text-amber-600',
  'hiring-manager': 'bg-sky-100 text-sky-600',
};

const PERSONA_SHORT: Record<string, string> = {
  'dir-eb': 'EB',
  'vp-ta': 'TA',
  'chro': 'C',
  'cfo': '$',
  'recruiter': 'R',
  'hiring-manager': 'HM',
};

function PainsConfig({
  selectedPains, selectedPersona, selectedATS, session,
  onTogglePain, onPersonaChange, onATSChange,
  onIndustryChange, onCompanySizeChange, onUseCaseChange,
  onSessionChange,
}: {
  selectedPains: string[];
  selectedPersona: string | null;
  selectedATS: string | null;
  session: DiscoverySession;
  onTogglePain: (painId: string) => void;
  onPersonaChange: (persona: string) => void;
  onATSChange: (ats: string) => void;
  onIndustryChange: (industry: string) => void;
  onCompanySizeChange: (size: string) => void;
  onUseCaseChange: (useCase: string) => void;
  onSessionChange: (session: DiscoverySession) => void;
}) {
  const [painSearch, setPainSearch] = useState('');
  const [painFilter, setPainFilter] = useState<string>('all');

  // Filter pains by search + persona tab
  const filteredPains = TT_PAINS.filter(p => {
    // Search filter
    if (painSearch.trim()) {
      const q = painSearch.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
    }
    // Tab filter
    if (painFilter === 'all') return true;
    if (painFilter === 'selected') return selectedPains.includes(p.id);
    // Filter by persona: check both `persona` and `personaTabs`
    const personaTabs = (p as any).personaTabs as string[] | undefined;
    if (personaTabs && personaTabs.includes(painFilter)) return true;
    return p.persona === painFilter;
  });

  // Sort: selected first, then alphabetical
  const sortedPains = [...filteredPains].sort((a, b) => {
    const aSelected = selectedPains.includes(a.id) ? 0 : 1;
    const bSelected = selectedPains.includes(b.id) ? 0 : 1;
    if (aSelected !== bSelected) return aSelected - bSelected;
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="space-y-4">
      {/* SecondaryDataGrid — ForGood 2-col pattern */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-[10px] font-bold text-stone-400">Persona</label>
          <select value={selectedPersona ?? ''} onChange={e => onPersonaChange(e.target.value)} className={selectClass}>
            <option value="">Select…</option>
            {PERSONA_OPTIONS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold text-stone-400">Current Provider</label>
          <select value={selectedATS ?? 'None'} onChange={e => onATSChange(e.target.value)} className={selectClass}>
            {ATS_OPTIONS.map(ats => <option key={ats} value={ats}>{ats}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold text-stone-400">Current HRIS</label>
          <select value={session.hris ?? 'None'} onChange={e => onSessionChange({ ...session, hris: e.target.value })} className={selectClass}>
            {HRIS_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="mb-1 block text-[10px] font-bold text-stone-400">Industry</label>
          <select value={session.industry ?? 'none'} onChange={e => onIndustryChange(e.target.value)} className={selectClass}>
            {INDUSTRY_OPTIONS.map(ind => <option key={ind} value={ind}>{ind === 'none' ? 'Select…' : ind}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold text-stone-400">Size</label>
          <select value={session.company_size ?? 'none'} onChange={e => onCompanySizeChange(e.target.value)} className={selectClass}>
            {SIZE_OPTIONS.map(s => <option key={s} value={s}>{s === 'none' ? 'Select…' : s}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold text-stone-400">Use Case</label>
          <select value={session.use_case ?? 'none'} onChange={e => onUseCaseChange(e.target.value)} className={selectClass}>
            {USE_CASE_OPTIONS.map(uc => <option key={uc.id} value={uc.id}>{uc.label}</option>)}
          </select>
        </div>
      </div>

      {/* Pain pills — with filter tabs + search */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-[10px] font-bold text-stone-400">
            Pain Points
          </label>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
            <CheckCircle2 size={9} />
            {selectedPains.length} selected
          </span>
        </div>

        {/* Persona filter tabs */}
        <div className="mb-2 flex flex-wrap gap-1">
          {PAIN_FILTER_TABS.map(tab => {
            const isActive = painFilter === tab.id;
            const count = tab.id === 'all'
              ? TT_PAINS.length
              : tab.id === 'selected'
                ? selectedPains.length
                : TT_PAINS.filter(p => {
                    const personaTabs = (p as any).personaTabs as string[] | undefined;
                    return (personaTabs && personaTabs.includes(tab.id)) || p.persona === tab.id;
                  }).length;
            return (
              <button
                key={tab.id}
                onClick={() => setPainFilter(tab.id)}
                className={`px-2 py-0.5 text-[9px] font-bold rounded-full border transition-all ${
                  isActive
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:text-stone-700'
                }`}
              >
                {tab.label} <span className="opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" size={13} />
          <input
            type="text"
            value={painSearch}
            onChange={e => setPainSearch(e.target.value)}
            placeholder="Search pains…"
            className="w-full rounded-lg border border-stone-200 bg-stone-50 py-1.5 pl-8 pr-3 text-xs text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-200"
          />
        </div>
        {/* Pills */}
        <div className="flex max-h-52 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-stone-100 bg-white p-2">
          {sortedPains.map(pain => {
            const isSelected = selectedPains.includes(pain.id);
            const badgeColor = PERSONA_BADGE_COLORS[pain.persona] || 'bg-stone-100 text-stone-500';
            const shortLabel = PERSONA_SHORT[pain.persona] || '?';
            return (
              <button
                key={pain.id}
                onClick={() => onTogglePain(pain.id)}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all duration-200 ${
                  isSelected
                    ? 'bg-stone-800 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700'
                }`}
                title={`${pain.description}\n\nPersona: ${pain.persona}`}
              >
                {isSelected && <CheckCircle2 size={10} />}
                {!isSelected && (
                  <span className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[7px] font-bold ${badgeColor}`}>
                    {shortLabel}
                  </span>
                )}
                {pain.title}
              </button>
            );
          })}
          {sortedPains.length === 0 && (
            <p className="w-full text-center text-[10px] text-stone-400 py-3">No pains match this filter</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Solution Demo Config ──

function SolutionConfig({
  session,
  onTogglePillar,
}: {
  session: DiscoverySession;
  onTogglePillar: (pillarId: string) => void;
}) {
  const overridden = session.overridden_pillars ?? [];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-[10px] font-bold text-stone-400">Pillar Overrides</label>
        <span className="text-[10px] font-medium tabular-nums text-stone-400">{overridden.length}/3</span>
      </div>
      <p className="mb-3 text-[10px] text-stone-400 leading-relaxed">
        Force specific demo pillars. If none selected, pillars auto-derive from pains.
      </p>
      <div className="space-y-1.5">
        {DEMO_AREAS.map(area => {
          const Icon = area.icon;
          const isActive = overridden.includes(area.id);
          return (
            <button
              key={area.id}
              onClick={() => onTogglePillar(area.id)}
              className={`flex w-full items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all duration-200 ${
                isActive
                  ? 'border-emerald-500/30 bg-emerald-50/50 shadow-sm'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
              }`}
            >
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-100 text-stone-500'
              }`}>
                <Icon size={14} />
              </div>
              <span className={`flex-1 text-xs font-semibold ${isActive ? 'text-emerald-800' : 'text-stone-700'}`}>
                {area.title}
              </span>
              {isActive && <CheckCircle2 size={14} className="text-emerald-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── ROI Config ──

function ROIConfig({
  session,
  onToggleROICategory,
}: {
  session: DiscoverySession;
  onToggleROICategory: (catKey: string) => void;
}) {
  const enabled = session.roi_enabled_categories ?? {
    seatSavings: true, agencySavings: true, vacancySavings: true,
    jobBoardSavings: true, adminTimeSavings: true,
  };

  return (
    <div>
      <label className="mb-2 block text-[10px] font-bold text-stone-400">
        Value Categories
      </label>
      <div className="space-y-1.5">
        {ROI_CATEGORIES.map(cat => {
          const isOn = enabled[cat.key] !== false;
          const CatIcon = cat.icon;
          return (
            <button
              key={cat.key}
              onClick={() => onToggleROICategory(cat.key)}
              className={`flex w-full items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all duration-200 ${
                isOn
                  ? 'border-emerald-500/30 bg-emerald-50/50'
                  : 'border-stone-200 bg-white hover:bg-stone-50'
              }`}
            >
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                isOn ? 'border-emerald-500 bg-emerald-500' : 'border-stone-300 bg-white'
              }`}>
                {isOn && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <CatIcon size={13} className={isOn ? 'text-emerald-600' : 'text-stone-400'} />
              <span className={`flex-1 text-xs font-medium ${isOn ? 'text-emerald-800' : 'text-stone-500'}`}>
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Playbook Config ──

export function PlaybookConfig({
  session,
  onSessionChange,
}: {
  session: DiscoverySession;
  onSessionChange: (session: DiscoverySession) => void;
}) {
  const [pbSearch, setPbSearch] = useState('');
  const [pbFilter, setPbFilter] = useState<string>('all');

  const PB_FILTER_TABS = [
    { id: 'all', label: 'All' },
    { id: 'Recruiters', label: 'Recruiters' },
    { id: 'TA Leaders', label: 'TA Leaders' },
    { id: 'HR Managers', label: 'HR Mgrs' },
    { id: 'Hiring Managers', label: 'HMs' },
  ];

  const filteredPlaybooks = PLAYBOOKS.filter(pb => {
    if (pbSearch.trim()) {
      const q = pbSearch.toLowerCase();
      if (!pb.title.toLowerCase().includes(q) && !pb.subtitle.toLowerCase().includes(q) && !pb.features.some(f => f.toLowerCase().includes(q))) return false;
    }
    if (pbFilter === 'all') return true;
    return pb.personas.includes(pbFilter);
  });

  const enabledIds = session.enabled_playbook_ids || [];
  const allEnabled = enabledIds.length === 0;

  // Sort: enabled first
  const sortedPlaybooks = [...filteredPlaybooks].sort((a, b) => {
    const aEnabled = allEnabled || enabledIds.includes(a.id) ? 0 : 1;
    const bEnabled = allEnabled || enabledIds.includes(b.id) ? 0 : 1;
    return aEnabled - bEnabled;
  });

  const enabledCount = allEnabled ? PLAYBOOKS.length : enabledIds.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-stone-400">Active Playbooks</label>
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
          <CheckCircle2 size={9} />
          {enabledCount} active
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1">
        {PB_FILTER_TABS.map(tab => {
          const isActive = pbFilter === tab.id;
          const count = tab.id === 'all' ? PLAYBOOKS.length : PLAYBOOKS.filter(pb => pb.personas.includes(tab.id)).length;
          return (
            <button
              key={tab.id}
              onClick={() => setPbFilter(tab.id)}
              className={`px-2 py-0.5 text-[9px] font-bold rounded-full border transition-all ${
                isActive
                  ? 'bg-stone-800 text-white border-stone-800'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:text-stone-700'
              }`}
            >
              {tab.label} <span className="opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" size={13} />
        <input
          type="text"
          value={pbSearch}
          onChange={e => setPbSearch(e.target.value)}
          placeholder="Search playbooks…"
          className="w-full rounded-lg border border-stone-200 bg-stone-50 py-1.5 pl-8 pr-3 text-xs text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-200"
        />
      </div>

      {/* Playbook list */}
      <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto rounded-lg border border-stone-100 bg-white p-2">
        {sortedPlaybooks.map(pb => {
          const enabled = allEnabled || enabledIds.includes(pb.id);
          return (
            <button
              key={pb.id}
              onClick={() => {
                const current = enabledIds.length === 0 ? PLAYBOOKS.map(p => p.id) : enabledIds;
                const next = enabled
                  ? current.filter(n => n !== pb.id)
                  : [...current, pb.id];
                onSessionChange({ ...session, enabled_playbook_ids: next });
              }}
              className={`flex items-center gap-2.5 px-3 py-2 text-left rounded-lg transition-all duration-150 ${
                enabled
                  ? 'bg-stone-50 border border-stone-200'
                  : 'hover:bg-stone-50/50'
              }`}
            >
              <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                enabled ? 'border-stone-800 bg-stone-800' : 'border-stone-300 bg-white'
              }`}>
                {enabled && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-semibold leading-tight truncate ${enabled ? 'text-stone-800' : 'text-stone-500'}`}>
                  {pb.title}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {pb.personas.slice(0, 2).map(p => (
                    <span key={p} className="text-[8px] font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">{p}</span>
                  ))}
                  <span className="text-[8px] text-stone-400">· {pb.setupTime}</span>
                </div>
              </div>
            </button>
          );
        })}
        {sortedPlaybooks.length === 0 && (
          <p className="w-full text-center text-[10px] text-stone-400 py-3">No playbooks match this filter</p>
        )}
      </div>
    </div>
  );
}

// ── Social Proof Config ──

export function SocialProofConfig({
  session,
  onSessionChange,
}: {
  session: DiscoverySession;
  onSessionChange: (session: DiscoverySession) => void;
}) {
  const [csFilter, setCsFilter] = useState<string>('all');
  const [csSearch, setCsSearch] = useState('');

  const CS_FILTER_TABS = [
    { id: 'all', label: 'All' },
    { id: 'smb', label: 'SMB' },
    { id: 'enterprise', label: 'Enterprise' },
    { id: 'hospitality', label: 'Hospitality' },
    { id: 'retail', label: 'Retail' },
    { id: 'technology', label: 'Tech' },
    { id: 'professional-services', label: 'Prof Svcs' },
    { id: 'construction', label: 'Construction' },
  ];

  const filteredStudies = ALL_CASE_STUDIES.filter(s => {
    if (csSearch.trim()) {
      const q = csSearch.toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !s.industry.toLowerCase().includes(q) && !s.ttFeature.toLowerCase().includes(q)) return false;
    }
    if (csFilter === 'all') return true;
    if (csFilter === 'smb') return s.smbFriendly;
    if (csFilter === 'enterprise') return !s.smbFriendly;
    return s.industries.includes(csFilter);
  });

  const enabledNames = session.enabled_study_names || [];
  const allEnabled = enabledNames.length === 0;

  // Sort: enabled first
  const sortedStudies = [...filteredStudies].sort((a, b) => {
    const aEnabled = allEnabled || enabledNames.includes(a.name) ? 0 : 1;
    const bEnabled = allEnabled || enabledNames.includes(b.name) ? 0 : 1;
    return aEnabled - bEnabled;
  });

  const enabledCount = allEnabled ? ALL_CASE_STUDIES.length : enabledNames.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-stone-400">Case Studies</label>
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
          <CheckCircle2 size={9} />
          {enabledCount} active
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1">
        {CS_FILTER_TABS.map(tab => {
          const isActive = csFilter === tab.id;
          const count = tab.id === 'all' ? ALL_CASE_STUDIES.length
            : tab.id === 'smb' ? ALL_CASE_STUDIES.filter(s => s.smbFriendly).length
            : tab.id === 'enterprise' ? ALL_CASE_STUDIES.filter(s => !s.smbFriendly).length
            : ALL_CASE_STUDIES.filter(s => s.industries.includes(tab.id)).length;
          return (
            <button
              key={tab.id}
              onClick={() => setCsFilter(tab.id)}
              className={`px-2 py-0.5 text-[9px] font-bold rounded-full border transition-all ${
                isActive
                  ? 'bg-stone-800 text-white border-stone-800'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:text-stone-700'
              }`}
            >
              {tab.label} <span className="opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" size={13} />
        <input
          type="text"
          value={csSearch}
          onChange={e => setCsSearch(e.target.value)}
          placeholder="Search case studies…"
          className="w-full rounded-lg border border-stone-200 bg-stone-50 py-1.5 pl-8 pr-3 text-xs text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-200"
        />
      </div>

      {/* Study list */}
      <div className="flex flex-col gap-1 max-h-64 overflow-y-auto rounded-lg border border-stone-100 bg-white p-2">
        {sortedStudies.map(study => {
          const enabled = allEnabled || enabledNames.includes(study.name);
          return (
            <button
              key={study.name}
              onClick={() => {
                const current = enabledNames.length === 0 ? ALL_CASE_STUDIES.map(s => s.name) : enabledNames;
                const next = enabled
                  ? current.filter(n => n !== study.name)
                  : [...current, study.name];
                onSessionChange({ ...session, enabled_study_names: next });
              }}
              className={`flex items-center gap-2.5 px-3 py-1.5 text-left rounded-lg transition-all duration-150 ${
                enabled
                  ? 'bg-stone-50 border border-stone-200'
                  : 'hover:bg-stone-50/50'
              }`}
            >
              <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                enabled ? 'border-stone-800 bg-stone-800' : 'border-stone-300 bg-white'
              }`}>
                {enabled && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-semibold ${enabled ? 'text-stone-800' : 'text-stone-500'}`}>{study.name}</span>
                  {study.smbFriendly && (
                    <span className="text-[7px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">SMB</span>
                  )}
                </div>
                <p className="text-[9px] text-stone-400 truncate">{study.industry}</p>
              </div>
            </button>
          );
        })}
        {sortedStudies.length === 0 && (
          <p className="w-full text-center text-[10px] text-stone-400 py-3">No studies match this filter</p>
        )}
      </div>
    </div>
  );
}

// ── Next Steps Config (for proposal section) ──

function NextStepsConfig({
  session,
  onSessionChange,
}: {
  session: DiscoverySession;
  onSessionChange: (session: DiscoverySession) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-bold text-stone-400">Timeline & Budget</label>
      <div>
        <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Next Meeting Date</label>
        <input
          type="date"
          value={session.next_meeting_date ?? ''}
          onChange={e => onSessionChange({ ...session, next_meeting_date: e.target.value })}
          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-700 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-200 transition-colors"
        />
      </div>
      <div>
        <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Implementation Timeline</label>
        <select
          value={session.implementation_timeline ?? ''}
          onChange={e => onSessionChange({ ...session, implementation_timeline: e.target.value || null })}
          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-700 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-200 transition-colors"
        >
          <option value="">— Select timeline —</option>
          {['ASAP (1–2 weeks)', 'Q3 2026', 'Q4 2026', 'Q1 2027', 'Q2 2027', 'H2 2027', '2028', 'Flexible / TBD'].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center justify-between">
        <label className="text-[9px] font-bold text-stone-400">Budget Confirmed</label>
        <button
          onClick={() => onSessionChange({ ...session, budget_confirmed: !session.budget_confirmed })}
          className={`relative shrink-0 w-9 h-5 rounded-full transition-all duration-200 ${session.budget_confirmed ? 'bg-emerald-500' : 'bg-stone-200'}`}
        >
          <div
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
            style={{ transform: session.budget_confirmed ? 'translateX(17px)' : 'translateX(2px)' }}
          />
        </button>
      </div>
    </div>
  );
}
