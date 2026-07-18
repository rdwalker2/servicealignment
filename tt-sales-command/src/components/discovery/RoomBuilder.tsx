// ============================================================
// RoomBuilder — WYSIWYG prospect room editor
// Replaces the Settings tab with a real preview of each section
// wrapped in EditableSectionWrap for inline config & visibility.
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, X, Check, ChevronDown, Eye, EyeOff, RotateCcw, Plus } from 'lucide-react';
import type { DiscoverySession, MAPMilestone } from '../../lib/discoveryDatabase';
import { computeHopePillars, computeROICategorySelection, computeCompetitorsEvaluating, computeDiagnosisOverrides, computePainQuotes, computeParadigmQuotes, computeHeroMessage } from '../../lib/discoveryDatabase';
import {
  type RoomVisibility,
  SectionReveal,
  PREMIUM_EASE,
  isStageAtOrPast,
  SECTION_UNLOCK_STAGE,
  STAGE_SHORT_LABELS,
} from './RoomSections';
import { EditableSectionWrap } from './EditableSectionWrap';
import { HeroSection } from './sections/HeroSection';
import { PrioritiesSection } from './sections/PrioritiesSection';
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
import { MutualActionPlan } from './MutualActionPlan';
import { ContractSecurityCenter } from './ContractSecurityCenter';
import { TT_PAINS } from './PainDiscoveryModule';
import { PlaybookConfig, SocialProofConfig } from './ControlDrawer';
import { PricingConfigPanel } from './PricingConfigPanel';
import { DEMO_AREAS } from './FeatureWalkthrough';
import { PLAYBOOKS, PLAYBOOK_PAIN_MAP } from '../../data/playbooks';
import { ATS_OPTIONS } from '../../data/roomOptions';
import ObjectionsPanel from './sections/ObjectionsPanel';

// ── Types ──

type SectionKey = keyof RoomVisibility;

interface RoomBuilderProps {
  session: DiscoverySession;
  onSessionChange: (s: DiscoverySession) => void;
  visibility: RoomVisibility;
  onToggleVisibility: (key: SectionKey) => void;
  selectedPains: string[];
  onOpenPainModal: () => void;
  companyName: string;
  themeColor: string;
}

// ── Constants ──

const CP_COLORS = {
  CP1: '#0ea5e9',
  CP2: '#8b5cf6',
  CP3: '#10b981',
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

// ── Phase Header ──

function PhaseHeader({ n, label, question, color }: { n: number; label: string; question: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mt-8 mb-4 first:mt-0">
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-bold" style={{ color }}>CP{n}</span>
        <span className="text-[11px] font-bold text-stone-600">{label}</span>
      </div>
      <div className="flex-1 h-px bg-stone-200" />
      <span className="text-[9px] font-semibold text-stone-400">{question}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// RoomBuilder Component
// ════════════════════════════════════════════════════════════════

export function RoomBuilder({
  session,
  onSessionChange,
  visibility,
  onToggleVisibility,
  selectedPains,
  onOpenPainModal,
  companyName,
  themeColor,
}: RoomBuilderProps) {
  const brand = themeColor;
  const currentStage = session.deal_stage ?? 'qualifying';
  const hasPains = selectedPains.length > 0;
  const selectedATS = session.current_ats ?? null;
  const hasATS = !!selectedATS && selectedATS !== 'other' && selectedATS !== 'None' && selectedATS !== 'none';
  const selectedPersona = (session as any).selected_persona ?? null;

  // Hero helpers
  const firstPain = hasPains ? TT_PAINS.find(p => p.id === selectedPains[0]) : null;
  const extraPainCount = selectedPains.length - 1;
  const firstStakeholderName = session.stakeholders?.find(s => s.name)?.name ?? null;

  // Stage gating helper
  const getSectionLock = (key: SectionKey) => {
    const unlockStage = SECTION_UNLOCK_STAGE[key];
    const locked = !isStageAtOrPast(currentStage, unlockStage);
    const unlockLabel = STAGE_SHORT_LABELS[unlockStage] ?? 'D1';
    return { locked, unlockStageLabel: `D${unlockLabel}` };
  };

  // Pillar toggle helper
  const togglePillar = (pillarId: string) => {
    const current = session.overridden_pillars ?? [];
    onSessionChange({
      ...session,
      overridden_pillars: current.includes(pillarId)
        ? current.filter(p => p !== pillarId)
        : [...current, pillarId],
    });
  };

  // ROI category toggle helper
  const toggleROICategory = (catKey: string) => {
    const current = session.roi_enabled_categories ?? computeROICategorySelection(session);
    onSessionChange({ ...session, roi_enabled_categories: { ...current, [catKey]: !current[catKey] } });
  };

  // MAP milestone helpers
  const milestones = session.mutual_action_plan ?? [];
  const toggleMilestoneDone = (id: string) =>
    onSessionChange({ ...session, mutual_action_plan: milestones.map(m => m.id === id ? { ...m, done: !m.done } : m) });
  const deleteMilestone = (id: string) =>
    onSessionChange({ ...session, mutual_action_plan: milestones.filter(m => m.id !== id) });
  const addMilestone = () =>
    onSessionChange({ ...session, mutual_action_plan: [...milestones, { id: `m_${Date.now()}`, label: '', owner: '', dueDate: '', done: false }] });
  const updateMilestone = (id: string, field: string, val: string) =>
    onSessionChange({ ...session, mutual_action_plan: milestones.map(m => m.id === id ? { ...m, [field]: val } : m) });

  // ── Config Content Builders ──

  // Collect all prospect verbatims from meeting notes for suggestions
  const allMeetingQuotes = (session.granola_notes || [])
    .flatMap(n => (n.key_quotes || []).filter(q => q.trim()))
    .slice(0, 20); // cap at 20 for UI

  // ── Hero Config ──

  const heroConfig = () => (
    <div className="space-y-3">
      <div>
        <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Headline</label>
        <input
          type="text"
          value={(session as any).hero_custom_headline || ''}
          onChange={e => onSessionChange({ ...session, hero_custom_headline: e.target.value } as any)}
          placeholder={firstPain ? `Solving ${firstPain.title} for ${companyName}` : 'Your Path to Modern Talent Acquisition'}
          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
        />
      </div>
      <div>
        <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Custom Message</label>
        <textarea
          value={(session as any).hero_custom_message || ''}
          onChange={e => onSessionChange({ ...session, hero_custom_message: e.target.value } as any)}
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
            onChange={e => onSessionChange({ ...session, hero_custom_badge: e.target.value } as any)}
            placeholder="Interactive Experience"
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
          />
        </div>
        <div className="flex items-end">
          <div className="flex items-center justify-between w-full rounded-lg border border-stone-100 px-3 py-2">
            <span className="text-[10px] font-semibold text-stone-600">Platform Stats</span>
            <button onClick={() => onSessionChange({ ...session, hero_show_platform_stats: !(session as any).hero_show_platform_stats === false ? false : true } as any)} className={`relative shrink-0 w-9 h-5 rounded-full transition-all duration-200 ${(session as any).hero_show_platform_stats !== false ? 'bg-stone-800' : 'bg-stone-200'}`}>
              <motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" animate={{ x: (session as any).hero_show_platform_stats !== false ? 17 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
            </button>
          </div>
        </div>
      </div>
      {((session as any).hero_custom_headline || (session as any).hero_custom_message || (session as any).hero_custom_badge) && (
        <button
          onClick={() => {
            const { hero_custom_headline, hero_custom_message, hero_custom_badge, ...rest } = session as any;
            onSessionChange(rest as any);
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
      onSessionChange({ ...session, exec_brief_visible_fields: { ...current, [key]: current[key] === false ? true : false } } as any);
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
          <button onClick={() => onSessionChange({ ...session, exec_brief_show_gauges: !(session as any).exec_brief_show_gauges === false ? false : true } as any)} className={`relative shrink-0 w-9 h-5 rounded-full transition-all duration-200 ${(session as any).exec_brief_show_gauges !== false ? 'bg-stone-800' : 'bg-stone-200'}`}>
            <motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" animate={{ x: (session as any).exec_brief_show_gauges !== false ? 17 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
          </button>
        </div>
      </div>
    );
  };

  // ── Contract & Security Config ──

  const ALL_TRUST_BADGES = ['SOC 2 Type II', 'ISO 27001', 'ISO 27701', 'GDPR Compliant', 'Responsible AI', 'EU AI Act Ready'];
  const DOC_CATEGORIES = ['Contract / Legal', 'Security / Compliance', 'Procurement / Finance'];

  const contractSecurityConfig = () => {
    const badges: Record<string, boolean> = (session as any).trust_enabled_badges ?? {};
    const docs: Record<string, boolean> = (session as any).trust_enabled_documents ?? {};
    const toggleBadge = (b: string) => {
      const current = (session as any).trust_enabled_badges ?? {};
      onSessionChange({ ...session, trust_enabled_badges: { ...current, [b]: current[b] === false ? true : false } } as any);
    };
    const toggleDoc = (d: string) => {
      const current = (session as any).trust_enabled_documents ?? {};
      onSessionChange({ ...session, trust_enabled_documents: { ...current, [d]: current[d] === false ? true : false } } as any);
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
          <button onClick={() => onSessionChange({ ...session, trust_show_ai_promise: !(session as any).trust_show_ai_promise === false ? false : true } as any)} className={`relative shrink-0 w-9 h-5 rounded-full transition-all duration-200 ${(session as any).trust_show_ai_promise !== false ? 'bg-stone-800' : 'bg-stone-200'}`}>
            <motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" animate={{ x: (session as any).trust_show_ai_promise !== false ? 17 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
          </button>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2.5">
          <div><p className="text-[11px] font-bold text-stone-700">Review Badges</p><p className="text-[9px] text-stone-400">G2, Capterra, and Gartner ratings</p></div>
          <button onClick={() => onSessionChange({ ...session, trust_show_review_badges: !(session as any).trust_show_review_badges === false ? false : true } as any)} className={`relative shrink-0 w-9 h-5 rounded-full transition-all duration-200 ${(session as any).trust_show_review_badges !== false ? 'bg-stone-800' : 'bg-stone-200'}`}>
            <motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" animate={{ x: (session as any).trust_show_review_badges !== false ? 17 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
          </button>
        </div>
      </div>
    );
  };

  const painsConfig = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div><p className="text-xs font-bold text-stone-700">{selectedPains.length} pain points selected</p><p className="text-[10px] text-stone-400 mt-0.5">These appear in the Priorities section of the room</p></div>
        <button onClick={onOpenPainModal} className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 text-white rounded-lg text-[10px] font-bold hover:bg-stone-700 transition-colors"><Target size={10} /> Manage Pains</button>
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
                      onSessionChange({ ...session, pain_quotes: updated });
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
                      onClick={() => {
                        navigator.clipboard.writeText(q);
                      }}
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
    </div>
  );

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
        {/* Persona Template */}
        <div>
          <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Persona Template</label>
          <p className="text-[10px] text-stone-400 mb-2 leading-relaxed">
            Sets default language for root cause and bigger problem. Override below.
          </p>
          <select
            value={(session as any).diagnosis_persona_override || ''}
            onChange={e => onSessionChange({ ...session, diagnosis_persona_override: e.target.value } as any)}
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

        {/* Current Approach Override */}
        <div>
          <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Current Approach</label>
          <p className="text-[10px] text-stone-400 mb-2">What is the prospect doing today to solve this problem?</p>
          <textarea
            value={(session as any).diagnosis_current_approach_override || ''}
            onChange={e => onSessionChange({ ...session, diagnosis_current_approach_override: e.target.value } as any)}
            placeholder="e.g. Using Greenhouse + 3 job boards + agency for senior roles"
            rows={2}
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors resize-none"
          />
        </div>

        {/* Root Cause Override */}
        <div>
          <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Root Cause</label>
          <p className="text-[10px] text-stone-400 mb-2">What's the real root cause specific to this prospect?</p>
          <textarea
            value={(session as any).diagnosis_root_cause_override || ''}
            onChange={e => onSessionChange({ ...session, diagnosis_root_cause_override: e.target.value } as any)}
            placeholder="e.g. No single system of record — data lives in 4 tools with no automation between them"
            rows={2}
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors resize-none"
          />
        </div>

        {/* Bigger Problem Override */}
        <div>
          <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Bigger Problem</label>
          <p className="text-[10px] text-stone-400 mb-2">Override the persona default with a custom reframe.</p>
          <textarea
            value={(session as any).diagnosis_bigger_problem_override || ''}
            onChange={e => onSessionChange({ ...session, diagnosis_bigger_problem_override: e.target.value } as any)}
            placeholder={reframe}
            rows={3}
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors resize-none"
          />
        </div>
      </div>
    );
  };

  const paradigmShiftConfig = () => {
    const DEFAULT_HOPES = computeHopePillars(session);
    const customPillars: { title: string; subtitle: string }[] = (session as any).custom_hope_pillars ?? [];
    const pillars = customPillars.length > 0 ? customPillars : DEFAULT_HOPES;
    const isCustom = customPillars.length > 0;

    const updatePillar = (index: number, field: 'title' | 'subtitle', value: string) => {
      const updated = pillars.map((p, i) => i === index ? { ...p, [field]: value } : { ...p });
      onSessionChange({ ...session, custom_hope_pillars: updated } as any);
    };

    const resetToDefaults = () => {
      const { custom_hope_pillars, ...rest } = session as any;
      onSessionChange(rest as any);
    };

    return (
      <div className="space-y-4">
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
      </div>
    );
  };

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
      onSessionChange({ ...session, competitors_evaluating: next, competitors_count: next.length } as any);
    };

    return (
      <div className="space-y-4">
        {/* Competitor Comparison Sheet toggle */}
        <div className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2.5">
          <div><p className="text-xs font-bold text-stone-700">Competitor Comparison Sheet</p><p className="text-[10px] text-stone-400">Show a live ATS teardown vs their current provider</p></div>
          <button onClick={() => onSessionChange({ ...session, room_enable_kill_sheet: !session.room_enable_kill_sheet })} className={`relative shrink-0 w-9 h-5 rounded-full transition-all duration-200 ${session.room_enable_kill_sheet ? 'bg-stone-800' : 'bg-stone-200'}`}>
            <motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" animate={{ x: session.room_enable_kill_sheet ? 17 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
          </button>
        </div>

        {/* Current ATS */}
        <div>
          <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Current ATS</label>
          {currentAts && currentAts !== 'None' ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-[11px] font-bold text-white">{currentAtsLabel}</span>
              <span className="text-[10px] text-stone-400">Set via Room Config → Priorities</span>
            </div>
          ) : (
            <p className="text-[10px] text-stone-400 italic">No ATS selected — set in Room Config → Priorities</p>
          )}
        </div>

        {/* Also Evaluating */}
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

        {/* Sentiment Score */}
        <div>
          <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Sentiment Score</label>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => onSessionChange({ ...session, sentiment_score: n === session.sentiment_score ? 0 : n })} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${(session.sentiment_score ?? 0) >= n ? 'bg-amber-400 text-white' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}>{n}★</button>
            ))}
          </div>
        </div>
      </div>
    );
  };

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
            onClick={() => onSessionChange({ ...session, overridden_pillars: [] })}
            className="text-[10px] text-stone-400 hover:text-stone-600 transition-colors"
          >
            Clear pins — revert to auto-match
          </button>
        )}
      </div>
    );
  };

  const roiConfig = () => (
    <div className="space-y-5">
      {/* Prospect Slider Defaults */}
      <div>
        <p className="text-[9px] font-bold text-stone-400 mb-1">Prospect Slider Defaults</p>
        <p className="text-[9px] text-stone-400 mb-3">Pre-set the sliders the prospect sees. They can still adjust.</p>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Hiring Managers</label><input type="number" min={1} max={200} value={session.room_roi_open_reqs ?? ''} onChange={e => onSessionChange({ ...session, room_roi_open_reqs: Number(e.target.value) })} placeholder="default: 15" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" /></div>
          <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Annual Hires</label><input type="number" min={1} max={1000} value={session.roi_inputs?.totalHires ?? ''} onChange={e => { const v = Number(e.target.value); onSessionChange({ ...session, roi_inputs: { ...(session.roi_inputs || {}), totalHires: v } }); }} placeholder="default: 60" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" /></div>
          <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Agency Hires / Year</label><input type="number" min={0} max={200} value={session.roi_inputs?.agencyHires ?? ''} onChange={e => { const v = Number(e.target.value); onSessionChange({ ...session, roi_inputs: { ...(session.roi_inputs || {}), agencyHires: v } }); }} placeholder="default: 10" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" /></div>
          <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Time to Fill (days)</label><input type="number" min={1} max={180} value={session.room_roi_time_to_fill ?? ''} onChange={e => onSessionChange({ ...session, room_roi_time_to_fill: Number(e.target.value) })} placeholder="default: 30" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" /></div>
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
          <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Legacy ATS Seat Cost ($)</label><input type="number" min={0} value={session.roi_inputs?.legacyAtsSeatCost ?? ''} onChange={e => { const v = Number(e.target.value); onSessionChange({ ...session, roi_inputs: { ...(session.roi_inputs || {}), legacyAtsSeatCost: v } }); }} placeholder="default: 1200" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" /></div>
          <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Avg Agency Fee / Hire ($)</label><input type="number" min={0} value={session.roi_inputs?.avgAgencyFee ?? ''} onChange={e => { const v = Number(e.target.value); onSessionChange({ ...session, roi_inputs: { ...(session.roi_inputs || {}), avgAgencyFee: v } }); }} placeholder="default: 15000" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" /></div>
          <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Annual Job Board Spend ($)</label><input type="number" min={0} value={session.roi_inputs?.annualJobBoardSpend ?? ''} onChange={e => { const v = Number(e.target.value); onSessionChange({ ...session, roi_inputs: { ...(session.roi_inputs || {}), annualJobBoardSpend: v } }); }} placeholder="default: 30000" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" /></div>
          <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Lost Revenue / Empty Day ($)</label><input type="number" min={0} value={session.roi_inputs?.lostRevenuePerEmptyDay ?? ''} onChange={e => { const v = Number(e.target.value); onSessionChange({ ...session, roi_inputs: { ...(session.roi_inputs || {}), lostRevenuePerEmptyDay: v } }); }} placeholder="default: 400" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" /></div>
        </div>
        {/* Cost of Indecision inputs */}
        {(session.roi_enabled_categories?.costOfIndecision !== false) && (
          <>
            <p className="text-[9px] font-bold text-stone-400 mt-4 mb-2">Cost of Indecision Inputs</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Open Roles', key: 'openRoles' as const, placeholder: '30' },
                { label: 'Avg Salary ($)', key: 'avgSalary' as const, placeholder: '75000' },
                { label: 'Annual Hires', key: 'hiresPerYear' as const, placeholder: '120' },
                { label: 'TA Team Size', key: 'recruiterCount' as const, placeholder: '5' },
                { label: 'Current TTF (days)', key: 'currentTTF' as const, placeholder: '52' },
                { label: 'Projected TTF w/ TT', key: 'projectedTTF' as const, placeholder: '38' },
                { label: 'Admin Hrs Lost/Wk', key: 'hoursWasted' as const, placeholder: '6' },
                { label: 'Drop-off Rate (%)', key: 'dropOffRate' as const, placeholder: '22' },
                { label: 'Agency $/Hire', key: 'agencySpendPerHire' as const, placeholder: '4200' },
                { label: 'Recruiter Cost ($)', key: 'recruiterSalary' as const, placeholder: '95000' },
                { label: 'Months Discussed', key: 'monthsSinceDiscussed' as const, placeholder: '3' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[8px] font-bold text-stone-400 mb-1 block">{f.label}</label>
                  <input type="number" min={0} value={session.coi_config?.[f.key] ?? ''} onChange={e => {
                    const v = Number(e.target.value);
                    const prev = session.coi_config;
                    onSessionChange({ ...session, coi_config: {
                      enabled: true,
                      openRoles: prev?.openRoles ?? 30,
                      avgSalary: prev?.avgSalary ?? 75000,
                      recruiterCount: prev?.recruiterCount ?? 5,
                      recruiterSalary: prev?.recruiterSalary ?? 95000,
                      hoursWasted: prev?.hoursWasted ?? 6,
                      dropOffRate: prev?.dropOffRate ?? 22,
                      currentTTF: prev?.currentTTF ?? 52,
                      projectedTTF: prev?.projectedTTF ?? 38,
                      agencySpendPerHire: prev?.agencySpendPerHire ?? 4200,
                      hiresPerYear: prev?.hiresPerYear ?? 120,
                      monthsSinceDiscussed: prev?.monthsSinceDiscussed ?? 3,
                      [f.key]: v,
                    } });
                  }} placeholder={f.placeholder} className="w-full rounded-md border border-stone-200 bg-stone-50 px-2 py-1.5 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" />
                </div>
              ))}
            </div>
          </>
        )}
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
      onSessionChange({ ...session, mutual_action_plan: template });
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2.5">
          <div><p className="text-xs font-bold text-stone-700">Show Mutual Action Plan timeline</p><p className="text-[10px] text-stone-400">Prospect sees shared milestones in their room</p></div>
          <button onClick={() => onSessionChange({ ...session, room_enable_map: !session.room_enable_map })} className={`relative shrink-0 w-9 h-5 rounded-full transition-all duration-200 ${session.room_enable_map ? 'bg-stone-800' : 'bg-stone-200'}`}>
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

  const DEFAULT_MINIMUM_STANDARDS = [
    { id: 'ms_exec_sponsor', label: 'Executive Sponsor Assigned', checked: false },
    { id: 'ms_admin', label: 'Dedicated Admin Identified', checked: false },
    { id: 'ms_training', label: 'Training Completion Commitment', checked: false },
  ];

  const [newStandardLabel, setNewStandardLabel] = useState('');

  const getMinimumStandards = () =>
    session.custom_minimum_standards ?? DEFAULT_MINIMUM_STANDARDS;

  const addStandard = (label: string) => {
    if (!label.trim()) return;
    const current = getMinimumStandards();
    const newStandard = { id: `ms_${Date.now()}`, label: label.trim(), checked: false };
    onSessionChange({ ...session, custom_minimum_standards: [...current, newStandard] });
    setNewStandardLabel('');
  };

  const removeStandard = (id: string) => {
    const current = getMinimumStandards();
    onSessionChange({ ...session, custom_minimum_standards: current.filter(s => s.id !== id) });
  };

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
              onSessionChange(rest as any);
            }}
            className="flex items-center gap-1 text-[10px] text-stone-400 hover:text-stone-600 transition-colors"
          >
            <RotateCcw size={10} /> Reset to defaults
          </button>
        )}
      </div>
    );
  };


  // Canvas content check (same as RoomSections)
  const hasCanvasContent = hasPains && !!session && (
    Object.keys(session.call_sheet_answers || {}).length > 0 ||
    (session.stakeholders || []).length > 0 ||
    !!session.diagnosis_bigger_problem_override ||
    !!session.diagnosis_root_cause_override ||
    session.roi_total > 0
  );

  // ── Render ──

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="mx-auto max-w-4xl px-5 py-6 space-y-3">

      {/* ═══════ CP1 — "What You Shared" ═══════ */}
      <PhaseHeader n={1} label="What You Shared" question="Do they need to act?" color={CP_COLORS.CP1} />

      {/* 1. Hero */}
      <EditableSectionWrap
        id="hero"
        label="Hero"
        checkpoint="CP1"
        checkpointLabel="CP1"
        visible={visibility.hero}
        locked={getSectionLock('hero').locked}
        unlockStageLabel={getSectionLock('hero').unlockStageLabel}
        hasConfig={true}
        onToggleVisibility={() => onToggleVisibility('hero')}
        configContent={heroConfig()}
      >
        <HeroSection
          companyName={companyName}
          brand={brand}
          firstPain={firstPain as any}
          extraPainCount={extraPainCount}
          firstStakeholderName={firstStakeholderName}
          stakeholders={session.stakeholders || []}
          customMessage={(session as any).hero_custom_message || computeHeroMessage(session)}
          customHeadline={(session as any).hero_custom_headline || undefined}
          customBadge={(session as any).hero_custom_badge || undefined}
          showPlatformStats={(session as any).hero_show_platform_stats !== false}
        />
      </EditableSectionWrap>

      {/* 2. Executive Brief (ProblemCanvas) — Summary comes first */}
      <EditableSectionWrap
        id="problemCanvas"
        label="Executive Brief"
        checkpoint="CP1"
        checkpointLabel="CP1"
        visible={visibility.problemCanvas}
        locked={getSectionLock('problemCanvas').locked}
        unlockStageLabel={getSectionLock('problemCanvas').unlockStageLabel}
        hasConfig={true}
        onToggleVisibility={() => onToggleVisibility('problemCanvas')}
        configContent={execBriefConfig()}
      >
        {hasPains && hasCanvasContent && (
          <div className="bg-white">
            <SectionReveal type="fade-up" delay={1 * 0.08} className="mx-auto max-w-7xl px-6 py-20">
              <ProblemCanvas
                session={session}
                companyName={companyName}
                themeColor={brand}
              />
            </SectionReveal>
          </div>
        )}
      </EditableSectionWrap>

      {/* 3. Priorities */}
      <EditableSectionWrap
        id="pains"
        label="Priorities"
        checkpoint="CP1"
        checkpointLabel="CP1"
        visible={visibility.pains}
        locked={getSectionLock('pains').locked}
        unlockStageLabel={getSectionLock('pains').unlockStageLabel}
        hasConfig={true}
        onToggleVisibility={() => onToggleVisibility('pains')}
        configContent={painsConfig()}
      >
        {hasPains && (
          <PrioritiesSection
            selectedPains={selectedPains}
            companyName={companyName}
            brand={brand}
            painQuotes={computePainQuotes(session)}
          />
        )}
      </EditableSectionWrap>

      {/* 4. Root Cause (DiagnosisReframe) */}
      <EditableSectionWrap
        id="diagnosis"
        label="Root Cause"
        checkpoint="CP1"
        checkpointLabel="CP1"
        visible={visibility.diagnosis}
        locked={getSectionLock('diagnosis').locked}
        unlockStageLabel={getSectionLock('diagnosis').unlockStageLabel}
        hasConfig={true}
        onToggleVisibility={() => onToggleVisibility('diagnosis')}
        configContent={diagnosisConfig()}
      >
        {hasPains && (
          <div className="bg-white">
            <SectionReveal type="slide-left" delay={2 * 0.08} className="mx-auto max-w-5xl px-6 py-20">
              <DiagnosisReframe
                companyName={companyName}
                themeColor={brand}
                selectedPains={selectedPains}
                persona={selectedPersona}
                currentApproach={computeDiagnosisOverrides(session).currentApproach}
                rootCause={computeDiagnosisOverrides(session).rootCause}
                biggerProblemOverride={computeDiagnosisOverrides(session).biggerProblem}
              />
            </SectionReveal>
          </div>
        )}
      </EditableSectionWrap>

      {/* ═══════ CP2 — "Why Outside Help?" ═══════ */}
      <PhaseHeader n={2} label="Why Outside Help?" question="Do they need new/outside help?" color={CP_COLORS.CP2} />

      {/* 5. Paradigm Shift */}
      <EditableSectionWrap
        id="paradigmShift"
        label="Paradigm Shift"
        checkpoint="CP2"
        checkpointLabel="CP2"
        visible={visibility.paradigmShift}
        locked={getSectionLock('paradigmShift').locked}
        unlockStageLabel={getSectionLock('paradigmShift').unlockStageLabel}
        hasConfig={true}
        onToggleVisibility={() => onToggleVisibility('paradigmShift')}
        configContent={paradigmShiftConfig()}
      >
        {hasPains && (
          <div className="bg-white">
            <SectionReveal type="fade-up" delay={4 * 0.08} className="mx-auto max-w-7xl px-6 py-20">
              <ParadigmShift customHopePillars={computeHopePillars(session)} paradigmQuotes={computeParadigmQuotes(session)} />
            </SectionReveal>
          </div>
        )}
      </EditableSectionWrap>

      {/* 6. Competitive (ATSKillPage) */}
      <EditableSectionWrap
        id="competitive"
        label="Competitive"
        checkpoint="CP2"
        checkpointLabel="CP2"
        visible={visibility.competitive}
        locked={getSectionLock('competitive').locked}
        unlockStageLabel={getSectionLock('competitive').unlockStageLabel}
        hasConfig={true}
        onToggleVisibility={() => onToggleVisibility('competitive')}
        configContent={competitiveConfig()}
      >
        {hasPains && hasATS && (
          <div className="bg-stone-50/30">
            <SectionReveal type="slide-right" delay={5 * 0.08} className="mx-auto max-w-5xl px-6 py-20">
              <ATSKillPage ats={selectedATS} selectedPains={selectedPains} themeColor={brand} companyName={companyName} />
            </SectionReveal>
          </div>
        )}
      </EditableSectionWrap>

      {/* 5b. Social Proof (CP2: Proven Results → before Solution per BAP) */}
      <EditableSectionWrap
        id="socialProof"
        label="Social Proof"
        checkpoint="CP2"
        checkpointLabel="CP2"
        visible={visibility.socialProof}
        locked={getSectionLock('socialProof').locked}
        unlockStageLabel={getSectionLock('socialProof').unlockStageLabel}
        hasConfig={true}
        onToggleVisibility={() => onToggleVisibility('socialProof')}
        configContent={<SocialProofConfig session={session} onSessionChange={onSessionChange} />}
      >
        <div className="bg-white">
          <LogoBar enabledStudyNames={session.enabled_study_names} selectedIndustry={session.industry} />
          <div className="mx-auto max-w-5xl px-6 py-20">
            <SectionReveal type="fade-up" delay={6 * 0.08}>
              <h2 className="mb-10 text-center text-2xl font-bold text-stone-900 sm:text-3xl">Proven Results for Companies Like Yours</h2>
            </SectionReveal>
            <SectionReveal type="fade-up" delay={6 * 0.08 + 0.15}>
              <SocialProofGrid selectedIndustry={session.industry} enabledStudyNames={session.enabled_study_names} />
            </SectionReveal>
            <SectionReveal type="fade-up" delay={6 * 0.08 + 0.25}>
              <TeamtailorWallOfLove selectedPains={selectedPains} themeColor={brand} />
            </SectionReveal>
          </div>
        </div>
      </EditableSectionWrap>

      {/* ═══════ CP3 — "Best Solution" ═══════ */}
      <PhaseHeader n={3} label="Best Solution" question="Do we have the best solution?" color={CP_COLORS.CP3} />

      {/* 8. Solution (FeatureWalkthrough) */}
      <EditableSectionWrap
        id="solution"
        label="Solution"
        checkpoint="CP3"
        checkpointLabel="CP3"
        visible={visibility.solution}
        locked={getSectionLock('solution').locked}
        unlockStageLabel={getSectionLock('solution').unlockStageLabel}
        hasConfig={true}
        onToggleVisibility={() => onToggleVisibility('solution')}
        configContent={solutionConfig()}
      >
        {hasPains && (
          <div className="bg-stone-50">
            <SectionReveal type="scale-up" delay={6 * 0.08} className="mx-auto max-w-5xl px-6 py-20">
              <FeatureWalkthrough
                selectedObjectiveIds={selectedPains}
                companyName={companyName}
                themeColor={brand}
                overriddenPillars={session.overridden_pillars}
              />
            </SectionReveal>
          </div>
        )}
      </EditableSectionWrap>

      {/* 9. Playbooks */}
      <EditableSectionWrap
        id="playbooks"
        label="Playbooks"
        checkpoint="CP3"
        checkpointLabel="CP3"
        visible={visibility.playbooks}
        locked={getSectionLock('playbooks').locked}
        unlockStageLabel={getSectionLock('playbooks').unlockStageLabel}
        hasConfig={true}
        onToggleVisibility={() => onToggleVisibility('playbooks')}
        configContent={<PlaybookConfig session={session} onSessionChange={onSessionChange} />}
      >
        {hasPains && (
          <div className="bg-white">
            <SectionReveal type="scale-up" delay={6.5 * 0.08} className="mx-auto max-w-5xl px-6 py-20">
              <PlaybookShowcase
                selectedPains={selectedPains}
                enabledPlaybookIds={session.enabled_playbook_ids}
                themeColor={brand}
                overriddenPillars={session.overridden_pillars}
              />
            </SectionReveal>
          </div>
        )}
      </EditableSectionWrap>

      {/* 10. ROI (BusinessImpactCalculator) */}
      <EditableSectionWrap
        id="roi"
        label="ROI"
        checkpoint="CP3"
        checkpointLabel="CP3"
        visible={visibility.roi}
        locked={getSectionLock('roi').locked}
        unlockStageLabel={getSectionLock('roi').unlockStageLabel}
        hasConfig={true}
        onToggleVisibility={() => onToggleVisibility('roi')}
        configContent={roiConfig()}
      >
        <div className="bg-stone-50">
          <div className="mx-auto max-w-4xl px-6 py-20">
            <SectionReveal type="scale-up" delay={8 * 0.08}>
              <p className="mb-2 text-center text-xs font-semibold tracking-[0.15em] text-stone-400">Business Impact</p>
              <h2 className="mb-10 text-center text-2xl font-bold text-stone-900 sm:text-3xl">Projected Value for {companyName}</h2>
            </SectionReveal>
            <SectionReveal type="scale-up" delay={8 * 0.08 + 0.12}>
              <BusinessImpactCalculator
                companyName={companyName}
                themeColor={brand}
                sessionId={session.id}
                enabledCategories={session.roi_enabled_categories}
              />
            </SectionReveal>
          </div>
        </div>
      </EditableSectionWrap>

      {/* 11. Minimum Standards */}
      <EditableSectionWrap
        id="minimumStandards"
        label="Minimum Standards"
        checkpoint="CP3"
        checkpointLabel="CP3"
        visible={visibility.minimumStandards}
        locked={getSectionLock('minimumStandards').locked}
        unlockStageLabel={getSectionLock('minimumStandards').unlockStageLabel}
        hasConfig={true}
        onToggleVisibility={() => onToggleVisibility('minimumStandards')}
        configContent={minimumStandardsConfig()}
      >
        <div className="bg-white">
          <SectionReveal type="fade-up" delay={8.5 * 0.08} className="mx-auto max-w-4xl px-6 py-20">
            <MinimumStandards companyName={companyName} themeColor={brand} />
          </SectionReveal>
        </div>
      </EditableSectionWrap>


      {/* 12. Contract & Security */}
      <EditableSectionWrap
        id="contractSecurity"
        label="Contract & Security"
        checkpoint="CP3"
        checkpointLabel="CP3"
        visible={visibility.contractSecurity}
        locked={getSectionLock('contractSecurity').locked}
        unlockStageLabel={getSectionLock('contractSecurity').unlockStageLabel}
        hasConfig={true}
        onToggleVisibility={() => onToggleVisibility('contractSecurity')}
        configContent={contractSecurityConfig()}
      >
        <div className="bg-white">
          <SectionReveal type="fade-up" delay={9 * 0.08} className="mx-auto max-w-5xl px-6 py-20">
            <ContractSecurityCenter
              companyName={companyName}
              themeColor={brand}
              session={session}
              enabledBadges={(session as any).trust_enabled_badges}
              enabledDocCategories={(session as any).trust_enabled_documents}
              showAIPromise={(session as any).trust_show_ai_promise !== false}
              showReviewBadges={(session as any).trust_show_review_badges !== false}
            />
          </SectionReveal>
        </div>
      </EditableSectionWrap>

      {/* 13. Action Plan (MutualActionPlan) */}
      <EditableSectionWrap
        id="map"
        label="Action Plan"
        checkpoint="CP3"
        checkpointLabel="CP3"
        visible={visibility.map}
        locked={getSectionLock('map').locked}
        unlockStageLabel={getSectionLock('map').unlockStageLabel}
        hasConfig={true}
        onToggleVisibility={() => onToggleVisibility('map')}
        configContent={mapConfig()}
      >
        <div className="bg-stone-50">
          <SectionReveal type="fade-up" delay={9.5 * 0.08} className="mx-auto max-w-4xl px-6 py-20">
            <MutualActionPlan
              session={session}
              themeColor={brand}
            />
          </SectionReveal>
        </div>
      </EditableSectionWrap>

      {/* 14. Proposal & Pricing */}
      <EditableSectionWrap
        id="pricing"
        label="Proposal & Pricing"
        checkpoint="CP3"
        checkpointLabel="CP3"
        visible={visibility.pricing}
        locked={getSectionLock('pricing').locked}
        unlockStageLabel={getSectionLock('pricing').unlockStageLabel}
        hasConfig={true}
        onToggleVisibility={() => onToggleVisibility('pricing')}
        configContent={<PricingConfigPanel session={session} onSessionChange={onSessionChange} />}
      >
        <div className="bg-white">
          <SectionReveal type="fade-up" delay={10 * 0.08} className="mx-auto max-w-5xl px-6 py-20">
            <SolutionProposal
              companyName={companyName}
              themeColor={brand}
              sessionId={session.id}
              session={session}
              selectedPainIds={selectedPains}
              onApprove={() => {}}
            />
          </SectionReveal>
        </div>
      </EditableSectionWrap>

      <div className="h-10" />
      </div>
    </div>
  );
}

