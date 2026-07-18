// ════════════════════════════════════════════════════════════════
// BAP Canvas — the unified flow
// Extracted from RepWorkspace.tsx
// ════════════════════════════════════════════════════════════════

import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown, ChevronUp, X, Target, Search,
  CheckCircle2, AlertTriangle, Lock, Zap,
  Copy, Check, User, ClipboardList, DollarSign,
  Lightbulb, CalendarDays, Plus, Sparkles,
} from 'lucide-react';
import { updateBAPAnswer, logDealMetric } from '../../lib/discoveryDatabase';
import type { DiscoverySession, BAPAnswer } from '../../lib/discoveryDatabase';
import {
  computeBAPAnswers,
  getCheckpointScore,
  getCheckpointStatus,
} from '../../lib/discoveryDatabase';
import { computeDealKillFlags } from './ControlDrawer';
import { SHEETS, type PersonaSheet, type DiscoveryQuestion } from '../../data/personaSheets';
import { CALL_SHEET_PAIN_MAP } from '../../data/personaSheets';
import { QUESTION_LIBRARY } from '../../data/questionLibrary';
import { QuestionLibraryModal } from './QuestionLibraryModal';
import { copyToClipboard } from '../../lib/shareableRoom';
import { useToast } from '../ui/Toast';
import { ObjectionTracker } from './ObjectionTracker';
import { CallNotesLog } from './CallNotesLog';
import { CallPrepCard } from './CallPrepCard';
import { TT_PAINS } from './PainDiscoveryModule';

import { ScaleSlider, StakeholderQuestion, QuestionCardRenderer } from './QuestionCard';
import {
  D1_COLOR, D2_COLOR, D3_COLOR, D4_COLOR,
  ATS_PROVIDERS, COMPANY_SIZES, INDUSTRIES,
  MAX_CP_SCORE,
} from './repWorkspaceConstants';

// ── Persona resolver ──

function resolveSheet(persona: string | null): PersonaSheet {
  const id = persona === 'vp-ta'           ? 'ta-manager'
    : persona === 'chro'                   ? 'chro'
    : persona === 'ceo'                    ? 'ceo'
    : persona === 'cfo'                    ? 'hr-director'   // CFO → financial framing sheet
    : persona === 'dir-eb'                 ? 'hr-director'   // Dir EB → employer brand sheet
    : persona === 'recruiter'              ? 'hr-director'   // Recruiter → ops sheet
    : persona === 'hiring-manager'         ? 'hr-director'   // HM → manager sheet
    : 'hr-director';                                         // fallback
  return SHEETS.find(s => s.id === id) ?? SHEETS[0];
}

export function BAPCanvas({
  session, onSessionChange, selectedPains, selectedPersona, selectedATS,
  onPersonaChange, onATSChange, onIndustryChange, onCompanySizeChange,
  onOpenPainModal, onOpenGranolaSync, companyName, onPainToggle,
}: {
  session: DiscoverySession; onSessionChange: (s: DiscoverySession) => void;
  selectedPains: string[]; selectedPersona: string | null; selectedATS: string | null;
  onPersonaChange: (p: string) => void; onATSChange: (a: string) => void;
  onIndustryChange: (i: string) => void; onCompanySizeChange: (s: string) => void;
  onOpenPainModal: () => void; onOpenGranolaSync: () => void;
  companyName: string;
  onPainToggle: (id: string) => void;
}) {
  const { toast } = useToast();
  const sheet = resolveSheet(selectedPersona);
  const answers = session.call_sheet_answers || {};
  const bapAnswers = useMemo(() => computeBAPAnswers(session), [session]);
  const killFlags = useMemo(() => computeDealKillFlags(session), [session]);

  const cp1Passed = getCheckpointStatus(getCheckpointScore(bapAnswers, 1), MAX_CP_SCORE).passed || !!(session.call_sheet_checkpoints?.['checkpoint1']);
  const cp2Passed = cp1Passed && (getCheckpointStatus(getCheckpointScore(bapAnswers, 2), MAX_CP_SCORE).passed || !!(session.call_sheet_checkpoints?.['checkpoint2']));
  const cp3Passed = cp2Passed && (getCheckpointStatus(getCheckpointScore(bapAnswers, 3), MAX_CP_SCORE).passed || !!(session.call_sheet_checkpoints?.['checkpoint3']));

  const baseD1Qs = sheet.questions.filter(q => ['q1', 'q1b', 'q2', 'q3', 'q4a', 'q4b'].includes(q.id));
  const baseD2Qs = sheet.questions.filter(q => ['q5', 'q6', 'q6b', 'q7', 'q8', 'q8b', 'q8c'].includes(q.id));
  const baseD3Qs = sheet.questions.filter(q => ['q9', 'q10', 'q11', 'q12'].includes(q.id));

  const customD1 = (session.custom_bap_questions?.d1 || []).map(id => QUESTION_LIBRARY.find(q => q.id === id) as any).filter(Boolean);
  const customD2 = (session.custom_bap_questions?.d2 || []).map(id => QUESTION_LIBRARY.find(q => q.id === id) as any).filter(Boolean);
  const customD3 = (session.custom_bap_questions?.d3 || []).map(id => QUESTION_LIBRARY.find(q => q.id === id) as any).filter(Boolean);

  const d1Qs = [...baseD1Qs, ...customD1];
  const d2Qs = [...baseD2Qs, ...customD2];
  const d3Qs = [...baseD3Qs, ...customD3];

  const countAnswered = (qs: DiscoveryQuestion[]) => qs.filter(q => {
    const a = answers[q.id];
    if (q.id === 'q1') return selectedPains.length > 0;
    if (q.id === 'q2') return (session.stakeholders || []).some(s => s.name.trim().length > 0);
    return Array.isArray(a) ? a.length > 0 : !!a;
  }).length;

  const d1Progress = { done: countAnswered(d1Qs), total: d1Qs.length };
  const d2Progress = { done: countAnswered(d2Qs), total: d2Qs.length };
  const d3Progress = { done: countAnswered(d3Qs), total: d3Qs.length };

  const currentStage = session.deal_stage ?? 'qualifying';

  const handleAnswer = (qId: string, val: any) => {
    const updated: Record<string, any> = { call_sheet_answers: { ...answers, [qId]: val } };

    // ── Auto-wire call sheet answers → Deal Context fields ──
    // js1: How many locations/divisions → division_count
    if (qId === 'js1') {
      const divMap: Record<string, number> = { 'Single location / entity': 1, '2-3 locations': 3, '4-10 locations': 7, '10+ locations': 15, 'Multiple brands with separate careers pages': 5 };
      updated.division_count = divMap[val] || 0;
    }
    // js2: What HRIS/payroll system → hris
    if (qId === 'js2' && val && val !== 'No HRIS yet') {
      updated.hris = val;
    }
    // cs3: Competitors being evaluated → competitors_identified
    if (qId === 'cs3') {
      const competitors = Array.isArray(val) ? val.filter((c: string) => c !== 'No one else — just exploring' && c !== 'They won\'t say').join(', ') : '';
      if (competitors) { updated.competitors_identified = competitors; updated.competitors_count = competitors.split(',').length; }
    }
    // js3: Implementation timeline → implementation_timeline
    if (qId === 'js3') {
      updated.implementation_timeline = val;
    }
    // cs1: System count → system_count
    if (qId === 'cs1') {
      const sysMap: Record<string, number> = { '1 (all-in-one)': 1, '2-3 systems': 3, '4-5 systems': 5, '6+ systems': 7, 'I\'ve lost count': 10 };
      updated.system_count = sysMap[val] || 0;
    }
    // ── Auto-bridge numeric ROI questions → roi_inputs ──
    if (qId === 'roi_hires' && val) {
      updated.roi_inputs = { ...session.roi_inputs, totalHires: Number(val) || session.roi_inputs.totalHires };
    }
    if (qId === 'roi_agency' && val) {
      updated.roi_inputs = { ...session.roi_inputs, agencyHires: Number(val) || session.roi_inputs.agencyHires };
    }
    if (qId === 'roi_ttf' && val) {
      updated.roi_inputs = { ...session.roi_inputs, timeToHire: Number(val) || session.roi_inputs.timeToHire };
    }
    if (qId === 'roi_admin_hrs' && val) {
      // Store admin hours — used by CoI section and can enrich ROI assumptions
      updated.coi_config = { ...(session.coi_config || {} as any), hoursWasted: Number(val) || 0 };
    }
    // q6b: External help acknowledgement → auto-score BAP Q7
    if (qId === 'q6b') {
      const q7Map: Record<string, string> = {
        'Yes — they need external help': 'yes',
        'Partially — open to help but not committed': 'maybe',
        'No — they think they can do it alone': 'no',
      };
      const q7Score = q7Map[val];
      if (q7Score) {
        updated.bap_answers = { ...session.bap_answers, q7: q7Score };
      }
    }

    // ── Auto-suggest pains from call sheet answers ──
    const painMap = CALL_SHEET_PAIN_MAP[qId];
    if (painMap) {
      const answer = typeof val === 'string' ? val : '';
      const suggestedPainIds = painMap[answer] || [];
      if (suggestedPainIds.length > 0) {
        const currentPains = session.selected_pains || [];
        const newPains = suggestedPainIds.filter((p: string) => !currentPains.includes(p));
        if (newPains.length > 0) {
          updated.selected_pains = [...currentPains, ...newPains];
        }
      }
    }

    onSessionChange({ ...session, ...updated });
  };

  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [expandedCoaching, setExpandedCoaching] = useState<Record<string, boolean>>({});
  const [confirmedQuestions, setConfirmedQuestions] = useState<Record<string, boolean>>({});
  const [activeModalPhase, setActiveModalPhase] = useState<'d1' | 'd2' | 'd3' | null>(null);
  const [contextExpanded, setContextExpanded] = useState(true);

  const handleAddQuestion = (qId: string) => {
    if (!activeModalPhase) return;
    const current = session.custom_bap_questions?.[activeModalPhase] || [];
    if (!current.includes(qId)) {
      onSessionChange({
        ...session,
        custom_bap_questions: {
          ...session.custom_bap_questions,
          d1: session.custom_bap_questions?.d1 || [],
          d2: session.custom_bap_questions?.d2 || [],
          d3: session.custom_bap_questions?.d3 || [],
          [activeModalPhase]: [...current, qId]
        }
      });
    }
    setActiveModalPhase(null);
  };

  const handleRemoveCustomQuestion = (phase: 'd1' | 'd2' | 'd3', qId: string) => {
    const current = session.custom_bap_questions?.[phase] || [];
    onSessionChange({
      ...session,
      custom_bap_questions: {
        ...session.custom_bap_questions,
        d1: session.custom_bap_questions?.d1 || [],
        d2: session.custom_bap_questions?.d2 || [],
        d3: session.custom_bap_questions?.d3 || [],
        [phase]: current.filter(id => id !== qId),
      }
    });
  };

  const toggleQuestion = (qId: string) => setExpandedQuestion(prev => prev === qId ? null : qId);
  const toggleCoaching = (qId: string) => setExpandedCoaching(prev => ({ ...prev, [qId]: !prev[qId] }));

  // Build a compact answer preview string for the collapsed state
  const getAnswerPreview = (qId: string): string | null => {
    // Special cases
    if (qId === 'q1') return selectedPains.length > 0 ? `${selectedPains.length} pains selected` : null;
    if (qId === 'q2') {
      const named = (session.stakeholders || []).filter(s => s.name.trim());
      return named.length > 0 ? named.map(s => s.name).join(', ') : null;
    }
    if (qId === 'q1b') return session.priority_self_rating ? `${session.priority_self_rating}/10` : null;
    if (qId === 'q8c') return session.ability_self_rating ? `${session.ability_self_rating}/10` : null;
    if (qId === 'priority') return session.priority_self_rating ? `${session.priority_self_rating}/10` : null;
    if (qId === 'ability') return session.ability_self_rating ? `${session.ability_self_rating}/10` : null;
    if (qId === 'd4_bud') return session.budget_confirmed ? 'Yes — Allocated' : null;
    if (qId === 'd4_tml') return session.implementation_timeline || null;
    if (qId === 'd4_nxt') return session.next_action || null;
    if (qId === 'd2_ca') return session.diagnosis_current_approach_override || null;
    if (qId === 'd2_rc') return session.diagnosis_root_cause_override || null;
    if (qId === 'd2_bp') return session.diagnosis_bigger_problem_override || null;
    // Generic from call sheet answers
    const a = answers[qId];
    if (!a) return null;
    if (Array.isArray(a)) return a.length > 0 ? a.join(', ') : null;
    return typeof a === 'string' && a.trim() ? a : null;
  };

  // Helper to render the flow-style row for any question
  const renderCard = (q: DiscoveryQuestion, hasAnswer: boolean, phaseColor: string, isConfirmed: boolean, renderContent: () => React.ReactNode, customPhase?: 'd1' | 'd2' | 'd3') => {
    const isExpanded = expandedQuestion === q.id;
    const isCoachingOpen = expandedCoaching[q.id] ?? false;
    const preview = hasAnswer ? getAnswerPreview(q.id) : null;
    const isCustom = !!customPhase;

    // Map q.id to the mockup labels
    let labelFallback = 'DISCOVERY';
    if (q.id === 'q1') labelFallback = 'THEIR OBJECTIVE';
    else if (q.id === 'q2') labelFallback = 'DECISION MAKERS';
    else if (q.id === 'ability' || q.id === 'd2_ca') labelFallback = 'CURRENT REALITY';
    else if (q.id === 'priority' || q.id === 'q1b') labelFallback = 'PRIORITY & URGENCY';
    else if (q.id === 'q5') labelFallback = 'OTHER PROVIDERS';
    else if (q.id === 'd2_rc' || q.id === 'd2_bp') labelFallback = 'PROBLEM DIAGNOSIS';
    else if (q.id === 'q7') labelFallback = 'BUYING PROCESS';
    else if (q.id === 'd4_bud' || q.id === 'd4_tml') labelFallback = 'BUDGET & TIMELINES';
    else if (q.id === 'q9' || q.id === 'q10') labelFallback = 'PROVEN RESULTS';
    else if (q.id === 'q11' || q.id === 'q12') labelFallback = 'A CLEAR SOLUTION';
    else if (q.id === 'd4_nxt') labelFallback = 'DELIVERY & TIMELINES';

    const displayLabel = q.label || labelFallback;

    return (
      <div key={q.id} className="relative rounded-md border border-stone-200 bg-white mb-2 overflow-hidden shadow-sm transition-all duration-200 hover:border-stone-300">
        <div
          onClick={() => toggleQuestion(q.id)}
          className="flex flex-col sm:flex-row sm:items-stretch cursor-pointer"
        >
          {/* Left Label Block (Dark Blue) */}
          <div className="w-full sm:w-[140px] shrink-0 bg-[#1e293b] flex items-center justify-center p-3 border-r border-stone-200/20">
            <span className="text-[9px] font-bold text-white uppercase text-center tracking-wider leading-tight">
              {displayLabel}
            </span>
          </div>

          {/* Middle: Question Text & Preview */}
          <div className="flex-1 flex flex-col justify-center px-4 py-3 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[12px] font-medium text-stone-800 leading-snug">
                {q.question}
              </h3>
              {isCustom && (
                <span className="shrink-0 text-[8px] font-bold text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded">Custom</span>
              )}
            </div>
            {!isExpanded && preview && (
              <p className="text-[10px] text-stone-500 truncate mt-1 font-medium">
                ↳ {preview.length > 80 ? preview.slice(0, 80) + '…' : preview}
              </p>
            )}
          </div>

          {/* Right: Y/N Indicator */}
          <div className="shrink-0 flex sm:flex-col border-l border-stone-100 bg-stone-50/50">
            <div className={`flex-1 flex items-center justify-center px-4 sm:px-3 border-b sm:border-b-0 sm:border-r border-stone-100 text-[10px] font-bold transition-colors ${
              hasAnswer ? 'text-emerald-600 bg-emerald-50/50' : 'text-stone-300'
            }`}>
              Y
            </div>
            <div className={`flex-1 flex items-center justify-center px-4 sm:px-3 text-[10px] font-bold transition-colors ${
              !hasAnswer ? 'text-stone-400 bg-stone-100/50' : 'text-stone-300'
            }`}>
              N
            </div>
          </div>
        </div>
          {isCustom && (
            <div className="absolute top-2 right-12 sm:right-16 z-10">
              <button
                onClick={(e) => { e.stopPropagation(); handleRemoveCustomQuestion(customPhase, q.id); }}
                className="w-5 h-5 flex items-center justify-center rounded-md text-stone-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                title="Remove custom question"
              >
                <X size={12} />
              </button>
            </div>
          )}


        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="border-t border-stone-100 bg-stone-50/30 p-4">
                {/* Coaching tip toggle */}
                {q.coaching && (
                  <div className="mb-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleCoaching(q.id); }}
                      className={`flex items-center gap-1.5 text-[10px] font-medium transition-colors ${
                        isCoachingOpen ? 'text-amber-600' : 'text-stone-400 hover:text-amber-600'
                      }`}
                    >
                      <Lightbulb size={11} />
                      {isCoachingOpen ? 'Hide tip' : 'Show coaching tip'}
                    </button>
                  </div>
                )}

                <AnimatePresence>
                  {q.coaching && isCoachingOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-3">
                      <div className="rounded-lg bg-amber-50 px-3 py-2.5">
                        <p className="text-[11px] text-amber-800 leading-relaxed">{q.coaching}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Content */}
                {renderContent()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#fafafa]">
      {/* ── Scrollable Area ── */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-8 custom-scrollbar relative">
          {/* ── Main content column (full width, centered) ── */}
          <div className="max-w-[900px] mx-auto space-y-6">

            {/* ── Call Prep Card (shows when prior call data exists) ── */}
            {(session.granola_notes?.length || 0) > 0 && (
              <CallPrepCard
                session={session}
                onDismiss={() => {}}
              />
            )}

            {/* ── Scrollspy Section Nav with Checkpoints ── */}
            <div className="sticky top-0 z-20 -mx-6 lg:-mx-10 px-6 lg:px-10 py-2 bg-[#fafafa]/95 backdrop-blur-sm border-b border-stone-100">
              <div className="flex items-center gap-0.5 max-w-[900px] mx-auto">
                {(() => {
                  const cp1Score = getCheckpointScore(bapAnswers, 1);
                  const cp2Score = getCheckpointScore(bapAnswers, 2);
                  const cp3Score = getCheckpointScore(bapAnswers, 3);
                  const overrides = session.call_sheet_checkpoints || {};

                  const handleOverride = (num: number) => {
                    onSessionChange({
                      ...session,
                      call_sheet_checkpoints: { ...overrides, [`checkpoint${num}`]: !overrides[`checkpoint${num}` as keyof typeof overrides] }
                    });
                  };

                  type NavItem = { type: 'section'; id: string; label: string; color: string; done: number; total: number; locked?: boolean }
                    | { type: 'checkpoint'; num: number; score: number; passed: boolean; overridden: boolean };

                  const items: NavItem[] = [
                    { type: 'section', id: 'section-context', label: 'Context', color: '#71717a', done: (session.pricing_employee_count && session.industry && selectedATS) ? 1 : 0, total: 1 },
                    { type: 'section', id: 'section-d1', label: 'D1', color: D1_COLOR, done: d1Progress.done, total: d1Progress.total },
                    { type: 'section', id: 'section-d2', label: 'D2', color: D2_COLOR, done: d2Progress.done, total: d2Progress.total, locked: !cp1Passed },
                    { type: 'section', id: 'section-d3', label: 'D3', color: D3_COLOR, done: d3Progress.done, total: d3Progress.total, locked: !cp2Passed },
                    { type: 'section', id: 'section-d4', label: 'D4', color: D4_COLOR, done: (session.budget_confirmed ? 1 : 0) + (session.implementation_timeline ? 1 : 0) + (session.next_action ? 1 : 0), total: 3, locked: !cp3Passed },
                  ];

                  return items.map((item, i) => {
                    if (item.type === 'checkpoint') {
                      const cp = item as Extract<NavItem, { type: 'checkpoint' }>;
                      return (
                        <div key={`cp${cp.num}`} className="flex items-center gap-0.5 mx-0.5">
                          <div className="w-4 h-[1px] bg-stone-200" />
                          <button
                            onClick={() => handleOverride(cp.num)}
                            title={`CP${cp.num}: ${cp.score}/${MAX_CP_SCORE} — ${cp.passed ? 'PASSED' : 'Click to override'}`}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold transition-all whitespace-nowrap ${
                              cp.passed
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-stone-100 text-stone-400 border border-stone-200 hover:border-amber-300 hover:text-amber-600'
                            }`}
                          >
                            {cp.passed ? <CheckCircle2 size={9} /> : <Lock size={9} />}
                            <span>CP{cp.num}</span>
                            <span className="tabular-nums">{cp.score}</span>
                            {cp.overridden && <Zap size={8} className="fill-amber-500 text-amber-500" />}
                          </button>
                          <div className="w-4 h-[1px] bg-stone-200" />
                        </div>
                      );
                    }

                    const sec = item as Extract<NavItem, { type: 'section' }>;
                    const pct = sec.total > 0 ? sec.done / sec.total : 0;
                    const isComplete = pct >= 1;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                          sec.locked
                            ? 'text-stone-300 cursor-default'
                            : isComplete
                              ? 'text-white hover:opacity-90'
                              : 'text-stone-600 hover:bg-stone-100'
                        }`}
                        style={isComplete && !sec.locked ? { backgroundColor: sec.color } : undefined}
                      >
                        {!sec.locked && !isComplete && (
                          <svg width="10" height="10" viewBox="0 0 10 10" className="shrink-0">
                            <circle cx="5" cy="5" r="4" fill="none" stroke="#e4e4e7" strokeWidth="1.5" />
                            <circle cx="5" cy="5" r="4" fill="none" stroke={sec.color} strokeWidth="1.5"
                              strokeDasharray={2 * Math.PI * 4}
                              strokeDashoffset={2 * Math.PI * 4 * (1 - pct)}
                              strokeLinecap="round"
                              transform="rotate(-90 5 5)"
                            />
                          </svg>
                        )}
                        {isComplete && !sec.locked && <CheckCircle2 size={10} />}
                        {sec.locked && <Lock size={10} />}
                        {sec.label}
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

          {/* ── Deal Context & Meeting Log (Unified) ── */}
          {(() => {
            const atsName = selectedATS ? ATS_PROVIDERS.find(a => a.id === selectedATS)?.name : null;
            const empCount = session.pricing_employee_count;
            const industry = session.industry;
            const compSize = session.company_size;
            const openRoles = session.open_roles_count;
            const annualHires = session.roi_inputs?.totalHires;
            const hiringMgrs = session.roi_inputs?.hiringManagers;
            const useCase = session.use_case;
            const leadSource = session.lead_source;
            const evalStage = session.evaluation_stage;

            const filledCount = [
              industry, empCount, atsName && atsName !== 'None / No Provider',
              useCase, annualHires, hiringMgrs, leadSource
            ].filter(Boolean).length;
            const hasCriticalGap = !industry || !selectedATS;

            return (
              <div id="section-context" className="scroll-mt-16 pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Deal Context</span>
                  {hasCriticalGap && (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Missing fields
                    </span>
                  )}
                  <div className="flex-1 h-px bg-stone-200" />
                  <span className="text-[9px] text-stone-400 font-semibold">{filledCount}/7 Fields</span>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
                  {/* Top half: Context Fields */}
                  <div className="p-5 lg:p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-5">

                        <div>
                          <label className="block text-[9px] font-bold text-stone-400 mb-1.5">Industry</label>
                          <select value={session.industry ?? ''} onChange={e => onIndustryChange(e.target.value)}
                            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:border-stone-400 transition-colors">
                            <option value="">Select industry...</option>
                            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-stone-400 mb-1.5">Employee Count</label>
                          <input type="number" min={1} value={session.pricing_employee_count || ''} onChange={e => onSessionChange({ ...session, pricing_employee_count: Number(e.target.value) })}
                            placeholder="e.g. 350"
                            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:border-stone-400 transition-colors placeholder:text-stone-300" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-stone-400 mb-1.5">Incumbent Provider</label>
                          <select value={selectedATS ?? ''} onChange={e => onATSChange(e.target.value)}
                            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:border-stone-400 transition-colors">
                            <option value="">Select Provider...</option>
                            {ATS_PROVIDERS.map(ats => <option key={ats.id} value={ats.id}>{ats.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-stone-400 mb-1.5">Use Case</label>
                          <select value={session.use_case ?? ''} onChange={e => onSessionChange({ ...session, use_case: e.target.value || null })}
                            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:border-stone-400 transition-colors">
                            <option value="">Select use case...</option>
                            <option value="replacing-ats">Replacing Current Provider</option>
                            <option value="first-ats">First Provider (No System)</option>
                            <option value="adding-brand">Adding Employer Brand</option>
                            <option value="consolidating">Consolidating Tools</option>
                            <option value="scaling">Scaling TA Function</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-stone-400 mb-1.5">Annual Hires</label>
                          <input type="number" min={0} value={session.roi_inputs?.totalHires || ''} onChange={e => { const v = Number(e.target.value); onSessionChange({ ...session, roi_inputs: { ...(session.roi_inputs || {}), totalHires: v } }); }}
                            placeholder="e.g. 120"
                            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:border-stone-400 transition-colors placeholder:text-stone-300" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-stone-400 mb-1.5">Hiring Managers</label>
                          <input type="number" min={0} value={session.roi_inputs?.hiringManagers || ''} onChange={e => { const v = Number(e.target.value); onSessionChange({ ...session, roi_inputs: { ...(session.roi_inputs || {}), hiringManagers: v } }); }}
                            placeholder="e.g. 25"
                            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:border-stone-400 transition-colors placeholder:text-stone-300" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-stone-400 mb-1.5">Lead Source</label>
                          <select value={session.lead_source ?? ''} onChange={e => onSessionChange({ ...session, lead_source: e.target.value || null })}
                            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:border-stone-400 transition-colors">
                            <option value="">Select source...</option>
                            <option value="inbound">Inbound</option>
                            <option value="outbound">Outbound</option>
                            <option value="webinar">Webinar</option>
                            <option value="referral">Referral</option>
                            <option value="nurture">Nurture</option>
                            <option value="event">Event</option>
                          </select>
                        </div>
                        </div>
                    </div>

                  {/* Bottom half: Meeting Log */}
                  <div className="border-t border-stone-200 bg-[#fbfbfb] p-5 lg:p-6">
                    <CallNotesLog
                      notes={session.granola_notes || []}
                      onChange={(notes) => onSessionChange({ ...session, granola_notes: notes })}
                      currentStage={currentStage}
                      stakeholderNames={(session.stakeholders || []).map(s => s.name).filter(Boolean)}
                      selectedPains={selectedPains}
                      painLabels={Object.fromEntries(TT_PAINS.map(p => [p.id, p.title]))}
                      onQuoteAssign={(painId, quote) => {
                        const updated = { ...(session.pain_quotes || {}), [painId]: quote };
                        onSessionChange({ ...session, pain_quotes: updated });
                      }}
                      session={session}
                      onSessionChange={onSessionChange}
                      onLogMetric={(type, date, auxiliaryDate) => {
                        // 1. Log the primary metric
                        logDealMetric(session.rep_id!, type, date);

                        // 2. Log source if applicable
                        if (type === 'discovery_set') {
                           const source = session.lead_source === 'inbound' ? 'ib_opps' : 'ob_opps';
                           logDealMetric(session.rep_id!, source, date);
                        }

                        // 3. Handle Auxiliary Date logic (Retroactive logging)
                        if (type === 'discovery_held' && auxiliaryDate) {
                           // They are backdating the 'Set' metric while logging the 'Held' meeting
                           logDealMetric(session.rep_id!, 'discovery_set', auxiliaryDate);
                           const source = session.lead_source === 'inbound' ? 'ib_opps' : 'ob_opps';
                           logDealMetric(session.rep_id!, source, auxiliaryDate);
                        }

                        // 4. Update Deal Milestones
                        let mType: string = type;
                        if (!['discovery_set', 'discovery_held', 'demo_held', 'proposal_sent'].includes(type)) {
                          mType = 'discovery_held'; // fallback
                        }

                        const currentMilestone = session.milestones?.[mType as any] || { attendees: [] };
                        const newMilestone = { ...currentMilestone, date };

                        // If it's a Set metric, the auxiliary date is the "Scheduled Date"
                        if (type === 'discovery_set' && auxiliaryDate) {
                          newMilestone.scheduled_date = auxiliaryDate;
                        }

                        // Build updated milestones object
                        let updatedMilestones = {
                          ...session.milestones,
                          [mType]: newMilestone
                        };

                        // If backdating Set from a Held log, also update the set milestone
                        if (type === 'discovery_held' && auxiliaryDate) {
                           updatedMilestones.discovery_set = {
                             ...(session.milestones?.discovery_set || { attendees: [] }),
                             date: auxiliaryDate,
                             scheduled_date: date // if they hold it on 'date', it was scheduled for 'date'
                           };
                        }

                        onSessionChange({
                          ...session,
                          milestones: updatedMilestones
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}

           {/* ══════════════════════════════════════════════════
              PHASE D1 — DISCOVERY
          ══════════════════════════════════════════════════ */}
          <div id="section-d1" className="scroll-mt-16 pt-8">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative">
              {/* Left Column: Questions */}
              <div className="xl:col-span-8">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-[14px] font-black text-[#1e293b] tracking-tight uppercase">PHASE D1 · Discovery</span>
                  <div className="flex-1 h-px bg-stone-200" />
                  <span className="text-[10px] text-stone-400 tabular-nums font-bold">{d1Progress.done}/{d1Progress.total}</span>
                </div>

                <div className="space-y-0 relative z-10">
                  {d1Qs.map(q => {
                    if (q.id === 'q1') {
                      const hasAnswer = selectedPains.length > 0;
                      return renderCard(q, hasAnswer, D1_COLOR, confirmedQuestions[q.id] || false, () => (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-stone-500 flex items-center gap-1"><span>🔥</span> Most Common Pains</p>
                            <button onClick={onOpenPainModal} className="text-[10px] font-bold text-stone-500 hover:text-stone-800 bg-white border border-stone-200 px-2 py-1 rounded-md flex items-center gap-1"><Search size={10} /> Full List</button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {TT_PAINS.filter((p: any) => p.topRank).map(pain => {
                              const isSelected = selectedPains.includes(pain.id);
                              return (
                                <button key={pain.id} onClick={() => onPainToggle(pain.id)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                    isSelected ? 'text-white border-transparent shadow-sm' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                                  }`} style={isSelected ? { backgroundColor: D1_COLOR } : {}}>
                                  {isSelected && <Check size={9} />}
                                  {pain.title}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ));
                    } else if (q.id === 'q2') {
                      const hasAnswer = (session.stakeholders || []).some(s => s.name.trim().length > 0);
                      return renderCard(q, hasAnswer, D1_COLOR, confirmedQuestions[q.id] || false, () => (
                        <StakeholderQuestion
                          question={q.question}
                          stakeholders={session.stakeholders ?? []}
                          phaseColor={D1_COLOR}
                          onUpdate={updated => onSessionChange({ ...session, stakeholders: updated })}
                          sentimentMap={session.stakeholder_sentiment}
                          onSentimentChange={(stakeholderId, sentiment) => onSessionChange({
                            ...session,
                            stakeholder_sentiment: { ...session.stakeholder_sentiment, [stakeholderId]: sentiment },
                          })}
                        />
                      ));
                    } else if (q.id === 'q1b') {
                      const hasAnswer = !!answers['q1b'];
                      return renderCard(q, hasAnswer, D1_COLOR, confirmedQuestions[q.id] || false, () => (
                        <ScaleSlider question={q.question} value={Number(answers['q1b']) || 0} calloutText="8 or above = critical pain — validates urgency and sets the tone for the whole deal" onUpdate={v => handleAnswer('q1b', String(v))} />
                      ));
                    } else {
                      const hasAnswer = Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : !!answers[q.id];
                      const isCustomQ = (session.custom_bap_questions?.d1 || []).includes(q.id);
                      return renderCard(q, hasAnswer, D1_COLOR, confirmedQuestions[q.id] || false, () => (
                        <QuestionCardRenderer q={q} answer={answers[q.id]} onAnswer={handleAnswer} phaseColor={D1_COLOR} selectedATS={selectedATS} />
                      ), isCustomQ ? 'd1' : undefined);
                    }
                  })}
                  
                  {/* Priority & Ability Gauges */}
                  {renderCard({ id: 'priority', question: 'Scale 1-10: How big of a priority is this?', label: 'Priority Rating', type: 'open' }, !!session.priority_self_rating, D1_COLOR, confirmedQuestions['priority'] || false, () => (
                    <ScaleSlider question="Priority Rating" value={session.priority_self_rating || 0} calloutText="Directly anchors the prospect to their own urgency before moving to D2." onUpdate={v => onSessionChange({ ...session, priority_self_rating: v })} />
                  ))}
                  {renderCard({ id: 'ability', question: 'Scale 1-10: Can you fix it internally?', label: 'Ability Rating', type: 'open' }, !!session.ability_self_rating, D1_COLOR, confirmedQuestions['ability'] || false, () => (
                    <ScaleSlider question="Ability Rating" inverted value={session.ability_self_rating || 0} calloutText="High scores (10) prove they cannot solve this without Service Alignment." onUpdate={v => onSessionChange({ ...session, ability_self_rating: v })} />
                  ))}
                </div>
                
                <button
                  onClick={() => setActiveModalPhase('d1')}
                  className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-stone-400 hover:text-stone-600 transition-colors uppercase tracking-wider"
                >
                  <Plus size={12} /> Add custom question
                </button>
              </div>

              {/* Right Column: Checkpoint Card */}
              <div className="xl:col-span-4 hidden xl:block relative z-0">
                {/* Arrow pointing right */}
                <div className="absolute -left-12 top-32 text-stone-200 border-t-2 border-dashed border-stone-200 w-10 flex items-center justify-end">
                  <div className="w-2 h-2 border-t-2 border-r-2 border-stone-200 rotate-45 transform translate-x-1" />
                </div>
                
                <div className="sticky top-28 pt-8">
                  <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center flex flex-col items-center">
                    <div className={`text-[10px] font-black tracking-widest uppercase mb-5 px-4 py-1.5 rounded-full shadow-sm transition-colors duration-500 ${cp1Passed ? 'bg-rose-600 text-white' : 'bg-stone-100 text-stone-400'}`}>
                      {cp1Passed ? '✓ Checkpoint 1' : 'Checkpoint 1'}
                    </div>
                    <h3 className="text-[14px] font-black text-[#1e293b] mb-8 uppercase tracking-tight">Do they need to act?</h3>
                    
                    {/* Thermometer / Score visual */}
                    <div className="flex items-stretch gap-5 justify-center h-40 mb-8 w-full">
                      {/* Gradient bar */}
                      <div className="w-5 rounded-full bg-gradient-to-b from-rose-500 via-amber-400 to-emerald-500 relative shadow-inner">
                        {/* Marker */}
                        <div className="absolute w-0 h-0 border-y-[8px] border-y-transparent border-r-[10px] border-r-stone-800 -left-3 transition-all duration-700 ease-out drop-shadow-md" 
                          style={{ top: `${Math.max(0, Math.min(100, 100 - (getCheckpointScore(bapAnswers, 1) / 10) * 100))}%`, transform: 'translateY(-50%)' }} />
                      </div>
                      
                      {/* Labels */}
                      <div className="flex flex-col justify-between py-1 text-left w-24">
                        <div className="text-[11px] font-bold text-stone-500 flex items-center gap-2">8-10 = <span className="text-stone-800 font-black">YES</span></div>
                        <div className="text-[11px] font-bold text-stone-500 flex items-center gap-2">5-7 = <span className="text-stone-800 font-black">MAYBE</span></div>
                        <div className="text-[11px] font-bold text-stone-500 flex items-center gap-2">1-4 = <span className="text-stone-800 font-black">NO</span></div>
                      </div>
                    </div>

                    <div className="border-t border-stone-100 pt-5 w-full">
                      <button onClick={() => onSessionChange({ ...session, call_sheet_checkpoints: { ...session.call_sheet_checkpoints, checkpoint1: !session.call_sheet_checkpoints?.['checkpoint1'] } })} className="text-[9px] font-black text-stone-400 hover:text-stone-800 transition-colors uppercase tracking-widest bg-stone-50 px-3 py-1.5 rounded hover:bg-stone-100">
                        {cp1Passed ? 'Revert Checkpoint' : 'Override Checkpoint'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* ══════════════════════════════════════════════════
              PHASE D2 — DIAGNOSIS
          ══════════════════════════════════════════════════ */}
          <div id="section-d2" className={`scroll-mt-16 pt-12 ${cp1Passed ? '' : 'opacity-40 pointer-events-none'}`}>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative">
              {/* Left Column: Questions */}
              <div className="xl:col-span-8">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-[14px] font-black text-[#1e293b] tracking-tight uppercase">PHASE D2 · Diagnosis</span>
                  <div className="flex-1 h-px bg-stone-200" />
                  <span className="text-[10px] text-stone-400 tabular-nums font-bold">{d2Progress.done}/{d2Progress.total}</span>
                </div>

                <div className="space-y-0 relative z-10">
                  {d2Qs.map(q => {
                    if (q.id === 'q8c') {
                      const hasAnswer = !!answers['q8c'];
                      return renderCard(q, hasAnswer, D2_COLOR, confirmedQuestions[q.id] || false, () => (
                        <ScaleSlider question={q.question} value={Number(answers['q8c']) || 0} inverted calloutText="3 or below = cannot solve alone — validates the Gap Test for CP2" onUpdate={v => handleAnswer('q8c', String(v))} />
                      ));
                    } else {
                      const hasAnswer = Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : !!answers[q.id];
                      const isCustomQ = (session.custom_bap_questions?.d2 || []).includes(q.id);
                      return renderCard(q, hasAnswer, D2_COLOR, confirmedQuestions[q.id] || false, () => (
                        <QuestionCardRenderer q={q} answer={answers[q.id]} onAnswer={handleAnswer} phaseColor={D2_COLOR} selectedATS={selectedATS} />
                      ), isCustomQ ? 'd2' : undefined);
                    }
                  })}

                  {renderCard({ id: 'd2_ca', question: 'Shown in "What You Told Us" — Auto-pulled from Q5. Override here if needed.', label: 'Current Approach Override', type: 'open' }, !!session.diagnosis_current_approach_override, D2_COLOR, false, () => (
                    <div className="p-4 bg-stone-50 border-t border-stone-100">
                      <input
                        value={session.diagnosis_current_approach_override || ''}
                        onChange={e => onSessionChange({ ...session, diagnosis_current_approach_override: e.target.value })}
                        placeholder="Override the auto-pulled answer..."
                        className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  ))}

                  {renderCard({ id: 'd2_rc', question: 'Shown in "The Real Issue" card — Auto-pulled from selected pains. Override here if needed.', label: 'Root Cause Statement', type: 'open' }, !!session.diagnosis_root_cause_override, D2_COLOR, false, () => (
                    <div className="p-4 bg-stone-50 border-t border-stone-100">
                      <textarea
                        value={session.diagnosis_root_cause_override || ''}
                        onChange={e => onSessionChange({ ...session, diagnosis_root_cause_override: e.target.value })}
                        placeholder="e.g. Their Provider is creating a 3-week delay in every hire cycle, compounding silently across 80+ open reqs…"
                        rows={3}
                        className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                      />
                    </div>
                  ))}

                  {renderCard({ id: 'd2_bp', question: 'Replaces the generic persona template in the prospect-facing room.', label: 'Custom "Bigger Problem" Statement', type: 'open' }, !!session.diagnosis_bigger_problem_override, D2_COLOR, false, () => (
                    <div className="p-4 bg-stone-50 border-t border-stone-100">
                      <p className="text-[10px] text-stone-500 mb-2 font-medium">Write the specific reframe for this prospect based on the conversation.</p>
                      <textarea
                        value={session.diagnosis_bigger_problem_override || ''}
                        onChange={e => onSessionChange({ ...session, diagnosis_bigger_problem_override: e.target.value })}
                        placeholder="e.g. You've outgrown spreadsheets but haven't outgrown the mindset. The real problem isn't tracking consultants — it's that you have no system to keep your talent pool warm…"
                        rows={4}
                        className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                      />
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => setActiveModalPhase('d2')}
                  className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-stone-400 hover:text-stone-600 transition-colors uppercase tracking-wider"
                >
                  <Plus size={12} /> Add custom question
                </button>
              </div>

              {/* Right Column: Checkpoint Card */}
              <div className="xl:col-span-4 hidden xl:block relative z-0">
                <div className="absolute -left-12 top-32 text-stone-200 border-t-2 border-dashed border-stone-200 w-10 flex items-center justify-end">
                  <div className="w-2 h-2 border-t-2 border-r-2 border-stone-200 rotate-45 transform translate-x-1" />
                </div>
                
                <div className="sticky top-28 pt-8">
                  <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center flex flex-col items-center">
                    <div className={`text-[10px] font-black tracking-widest uppercase mb-5 px-4 py-1.5 rounded-full shadow-sm transition-colors duration-500 ${cp2Passed ? 'bg-rose-600 text-white' : 'bg-stone-100 text-stone-400'}`}>
                      {cp2Passed ? '✓ Checkpoint 2' : 'Checkpoint 2'}
                    </div>
                    <h3 className="text-[14px] font-black text-[#1e293b] mb-8 uppercase tracking-tight">Do they need new/outside help?</h3>
                    
                    <div className="flex items-stretch gap-5 justify-center h-40 mb-8 w-full">
                      <div className="w-5 rounded-full bg-gradient-to-b from-rose-500 via-amber-400 to-emerald-500 relative shadow-inner">
                        <div className="absolute w-0 h-0 border-y-[8px] border-y-transparent border-r-[10px] border-r-stone-800 -left-3 transition-all duration-700 ease-out drop-shadow-md" 
                          style={{ top: `${Math.max(0, Math.min(100, 100 - (getCheckpointScore(bapAnswers, 2) / 10) * 100))}%`, transform: 'translateY(-50%)' }} />
                      </div>
                      
                      <div className="flex flex-col justify-between py-1 text-left w-24">
                        <div className="text-[11px] font-bold text-stone-500 flex items-center gap-2">8-10 = <span className="text-stone-800 font-black">YES</span></div>
                        <div className="text-[11px] font-bold text-stone-500 flex items-center gap-2">5-7 = <span className="text-stone-800 font-black">MAYBE</span></div>
                        <div className="text-[11px] font-bold text-stone-500 flex items-center gap-2">1-4 = <span className="text-stone-800 font-black">NO</span></div>
                      </div>
                    </div>

                    <div className="border-t border-stone-100 pt-5 w-full">
                      <button onClick={() => onSessionChange({ ...session, call_sheet_checkpoints: { ...session.call_sheet_checkpoints, checkpoint2: !session.call_sheet_checkpoints?.['checkpoint2'] } })} className="text-[9px] font-black text-stone-400 hover:text-stone-800 transition-colors uppercase tracking-widest bg-stone-50 px-3 py-1.5 rounded hover:bg-stone-100">
                        {cp2Passed ? 'Revert Checkpoint' : 'Override Checkpoint'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* ══════════════════════════════════════════════════
              PHASE D3 & D4 — DEMONSTRATE & DECISION
          ══════════════════════════════════════════════════ */}
          <div id="section-d3" className={`scroll-mt-16 pt-12 ${cp2Passed ? '' : 'opacity-40 pointer-events-none'}`}>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative">
              {/* Left Column: Questions */}
              <div className="xl:col-span-8">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-[14px] font-black text-[#1e293b] tracking-tight uppercase">PHASE D3 & D4 · Prove & Close</span>
                  <div className="flex-1 h-px bg-stone-200" />
                  <span className="text-[10px] text-stone-400 tabular-nums font-bold">{d3Progress.done}/{d3Progress.total}</span>
                </div>

                <div className="space-y-0 relative z-10">
                  {d3Qs.map(q => {
                    if (q.id === 'q12') {
                      const hasAnswer = !!answers['q12'];
                      return renderCard(q, hasAnswer, D3_COLOR, confirmedQuestions[q.id] || false, () => (
                        <ScaleSlider question={q.question} value={Number(answers['q12']) || 0} calloutText="8 or above = trial close passed — move to D4 close plan" onUpdate={v => {
                          const bapVal: 'yes' | 'maybe' | 'no' | null = v >= 8 ? 'yes' : v >= 5 ? 'maybe' : v >= 1 ? 'no' : null;
                          onSessionChange({ ...session, call_sheet_answers: { ...answers, q12: String(v) }, bap_answers: { ...session.bap_answers, q12: bapVal } });
                        }} />
                      ));
                    } else {
                      const hasAnswer = Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : !!answers[q.id];
                      const isCustomQ = (session.custom_bap_questions?.d3 || []).includes(q.id);
                      return renderCard(q, hasAnswer, D3_COLOR, confirmedQuestions[q.id] || false, () => (
                        <QuestionCardRenderer q={q} answer={answers[q.id]} onAnswer={handleAnswer} phaseColor={D3_COLOR} selectedATS={selectedATS} />
                      ), isCustomQ ? 'd3' : undefined);
                    }
                  })}

                  <div className="h-6" />

                  {renderCard(
                    { id: 'd4_bud', question: 'Confirm budget has been approved for this initiative', label: 'Budget Allocated?', type: 'select' },
                    !!session.budget_confirmed,
                    D4_COLOR,
                    false,
                    () => (
                      <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center gap-3">
                        <button
                          onClick={() => onSessionChange({ ...session, budget_confirmed: true })}
                          className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all shadow-sm ${
                            session.budget_confirmed ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-emerald-300 hover:text-emerald-600'
                          }`}
                        >
                          Yes — Allocated
                        </button>
                        <button
                          onClick={() => onSessionChange({ ...session, budget_confirmed: false })}
                          className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all shadow-sm ${
                            !session.budget_confirmed ? 'bg-rose-500 text-white border-rose-600' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-rose-300 hover:text-rose-600'
                          }`}
                        >
                          No — Needs Approval
                        </button>
                      </div>
                    )
                  )}

                  {renderCard(
                    { id: 'd4_tml', question: 'e.g. 30 days, Q3 2026, ASAP…', label: 'Implementation Timeline', type: 'open' },
                    !!session.implementation_timeline,
                    D4_COLOR,
                    false,
                    () => (
                      <div className="p-4 bg-stone-50 border-t border-stone-100">
                        <input
                          type="text"
                          value={session.implementation_timeline || ''}
                          onChange={(e) => onSessionChange({ ...session, implementation_timeline: e.target.value || null })}
                          placeholder="e.g. 30 days, Q3 2026, ASAP…"
                          className="w-full p-3 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                    )
                  )}

                  {renderCard(
                    { id: 'd4_nxt', question: 'Next step: demo, proposal, intro call…', label: 'Next Concrete Action', type: 'open' },
                    !!session.next_action,
                    D4_COLOR,
                    false,
                    () => (
                      <div className="p-4 bg-stone-50 border-t border-stone-100">
                        <input
                          type="text"
                          value={session.next_action || ''}
                          onChange={(e) => onSessionChange({ ...session, next_action: e.target.value || '' })}
                          placeholder="Next step: demo, proposal, intro call…"
                          className="w-full p-3 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                    )
                  )}
                </div>
                
                <button
                  onClick={() => setActiveModalPhase('d3')}
                  className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-stone-400 hover:text-stone-600 transition-colors uppercase tracking-wider"
                >
                  <Plus size={12} /> Add custom question
                </button>
              </div>

              {/* Right Column: Checkpoint Card */}
              <div className="xl:col-span-4 hidden xl:block relative z-0">
                <div className="absolute -left-12 top-32 text-stone-200 border-t-2 border-dashed border-stone-200 w-10 flex items-center justify-end">
                  <div className="w-2 h-2 border-t-2 border-r-2 border-stone-200 rotate-45 transform translate-x-1" />
                </div>
                
                <div className="sticky top-28 pt-8">
                  <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center flex flex-col items-center">
                    <div className={`text-[10px] font-black tracking-widest uppercase mb-5 px-4 py-1.5 rounded-full shadow-sm transition-colors duration-500 ${cp3Passed ? 'bg-rose-600 text-white' : 'bg-stone-100 text-stone-400'}`}>
                      {cp3Passed ? '✓ Checkpoint 3' : 'Checkpoint 3'}
                    </div>
                    <h3 className="text-[14px] font-black text-[#1e293b] mb-8 uppercase tracking-tight">Do we have the best solution?</h3>
                    
                    <div className="flex items-stretch gap-5 justify-center h-40 mb-8 w-full">
                      <div className="w-5 rounded-full bg-gradient-to-b from-rose-500 via-amber-400 to-emerald-500 relative shadow-inner">
                        <div className="absolute w-0 h-0 border-y-[8px] border-y-transparent border-r-[10px] border-r-stone-800 -left-3 transition-all duration-700 ease-out drop-shadow-md" 
                          style={{ top: `${Math.max(0, Math.min(100, 100 - (getCheckpointScore(bapAnswers, 3) / 10) * 100))}%`, transform: 'translateY(-50%)' }} />
                      </div>
                      
                      <div className="flex flex-col justify-between py-1 text-left w-24">
                        <div className="text-[11px] font-bold text-stone-500 flex items-center gap-2">8-10 = <span className="text-stone-800 font-black">YES</span></div>
                        <div className="text-[11px] font-bold text-stone-500 flex items-center gap-2">5-7 = <span className="text-stone-800 font-black">MAYBE</span></div>
                        <div className="text-[11px] font-bold text-stone-500 flex items-center gap-2">1-4 = <span className="text-stone-800 font-black">NO</span></div>
                      </div>
                    </div>

                    <div className="border-t border-stone-100 pt-5 w-full">
                      <button onClick={() => onSessionChange({ ...session, call_sheet_checkpoints: { ...session.call_sheet_checkpoints, checkpoint3: !session.call_sheet_checkpoints?.['checkpoint3'] } })} className="text-[9px] font-black text-stone-400 hover:text-stone-800 transition-colors uppercase tracking-widest bg-stone-50 px-3 py-1.5 rounded hover:bg-stone-100">
                        {cp3Passed ? 'Revert Checkpoint' : 'Override Checkpoint'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div className="h-10" />
        </div>
      </div>
      
      {activeModalPhase && (
        <QuestionLibraryModal 
          onClose={() => setActiveModalPhase(null)}
          onSelect={handleAddQuestion}
          phaseLabel={activeModalPhase === 'd1' ? 'D1 · Discovery' : activeModalPhase === 'd2' ? 'D2 · Diagnosis' : 'D3 · Demonstrate'}
          phase={activeModalPhase}
        />
      )}
    </div>
  );
}
