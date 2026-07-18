import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  MessageCircle,
  Lightbulb,
  Check,
  X,
  Shield,
  Activity,
  Zap,
  CalendarDays,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { SHEETS, Q1_PAIN_MAP, type PersonaSheet, type DiscoveryQuestion } from '../../data/personaSheets';
import type { DiscoverySession } from '../../lib/discoveryDatabase';
import { useToast } from '../ui/Toast';

const expandVariants = {
  collapsed: { height: 0, opacity: 0, overflow: 'hidden' as const },
  expanded: { height: 'auto', opacity: 1, overflow: 'visible' as const },
};

// ════════════════════════════════════════════════════════════════
// Persona Discovery Questions — D1 / D2 / D3 Phases
// ════════════════════════════════════════════════════════════════

/** Map session.persona to a personaSheet id */
function resolvePersonaSheetId(persona: string | null): string {
  switch (persona) {
    case 'dir-eb':
    case 'hiring-manager':
      return 'hr-director';
    case 'vp-ta':
    case 'recruiter':
      return 'ta-manager';
    case 'chro':
      return 'chro';
    case 'cfo':
    case 'ceo':
      return 'ceo';
    default:
      return 'hr-director';
  }
}

/** Phase definition for grouping discovery questions */
interface DiscoveryPhase {
  id: string;
  label: string;
  color: string;
  dotColor: string;
  questionIds: string[];
  checkpointAfter?: { id: string; label: string; question: string };
}

function PersonaDiscoverySection({
  session,
  onSessionChange,
}: {
  session: DiscoverySession;
  onSessionChange: (s: DiscoverySession) => void;
}) {
  const { toast } = useToast();
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [expandedCoaching, setExpandedCoaching] = useState<Record<string, boolean>>({});
  const [confirmedQuestions, setConfirmedQuestions] = useState<Record<string, boolean>>({});

  // Track which auto-advances have already fired so they don't re-trigger
  const advancedRef = useRef({ d1ToD2: false, d2ToD3: false });

  // Auto-advance phase ONLY when a checkpoint is toggled (not on every session change)
  const cp1 = session.call_sheet_checkpoints?.['checkpoint1'] ?? false;
  const cp2 = session.call_sheet_checkpoints?.['checkpoint2'] ?? false;

  useEffect(() => {
    if (cp1 && !advancedRef.current.d1ToD2) {
      const answers = session.call_sheet_answers || {};
      const d1Ids = ['q1','q1b','q2','q3','q4a','q4b'];
      const d1Done = d1Ids.every(id => {
        const a = answers[id];
        if (Array.isArray(a)) return a.length > 0;
        return a !== undefined && a !== '';
      });
      if (d1Done) {
        advancedRef.current.d1ToD2 = true;
      }
    }
  }, [cp1]);

  useEffect(() => {
    if (cp2 && !advancedRef.current.d2ToD3) {
      const answers = session.call_sheet_answers || {};
      const d2Ids = ['q5','q6','q6b','q7','q8','q8b','q8c'];
      const d2Done = d2Ids.every(id => {
        const a = answers[id];
        if (Array.isArray(a)) return a.length > 0;
        return a !== undefined && a !== '';
      });
      if (d2Done) {
        advancedRef.current.d2ToD3 = true;
      }
    }
  }, [cp2]);

  const toggleQuestion = (qId: string) => setExpandedQuestion(prev => prev === qId ? null : qId);
  const toggleCoaching = (qId: string) => setExpandedCoaching(prev => ({ ...prev, [qId]: !prev[qId] }));

  // ── Q1 ↔ Pain auto-sync ──
  useEffect(() => {
    const q1Answer = session.call_sheet_answers['q1'];
    if (q1Answer) return;
    if (!session.selected_pains || session.selected_pains.length === 0) return;

    const sheetId = resolvePersonaSheetId(session.persona);
    const painMap = Q1_PAIN_MAP[sheetId];
    if (!painMap) return;

    let bestOption = '';
    let bestOverlap = 0;
    for (const [option, painIds] of Object.entries(painMap)) {
      const overlap = painIds.filter(id => session.selected_pains.includes(id)).length;
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        bestOption = option;
      }
    }
    if (bestOption && bestOverlap > 0) {
      onSessionChange({
        ...session,
        call_sheet_answers: { ...session.call_sheet_answers, q1: bestOption },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  const sheetId = resolvePersonaSheetId(session.persona);
  const sheet = SHEETS.find(s => s.id === sheetId) ?? SHEETS[0];

  const questionMap = new Map<string, DiscoveryQuestion>();
  for (const q of sheet.questions) {
    questionMap.set(q.id, q);
  }

  const phases: DiscoveryPhase[] = [
    {
      id: 'd1', label: '1. Discovery', color: '#8b5cf6', dotColor: 'bg-violet-500',
      questionIds: ['q1','q1b','q2','q3','q4a','q4b'],
      checkpointAfter: { id: 'checkpoint1', label: 'CP1: Priority & Urgency', question: 'Do they have a compelling reason to act now?' }
    },
    {
      id: 'd2', label: '2. Diagnosis', color: '#0ea5e9', dotColor: 'bg-sky-500',
      questionIds: ['q5','q6','q6b','q7','q8','q8b','q8c'],
      checkpointAfter: { id: 'checkpoint2', label: 'CP2: Root Cause Reframe', question: 'Have they accepted our reframed view of the problem?' }
    },
    {
      id: 'd3', label: '3. Demonstrate', color: '#f59e0b', dotColor: 'bg-amber-500',
      questionIds: ['q9','q10','q11'],
      checkpointAfter: { id: 'checkpoint3', label: 'CP3: Delivery & Timeline', question: 'Are they bought into our execution plan?' }
    }
  ];

  const handleAnswerChange = (qId: string, value: string | string[]) => {
    if (qId === 'q1' && typeof value === 'string' && value) {
      const painMap = Q1_PAIN_MAP[sheetId];
      if (painMap && painMap[value]) {
        const recommendedPains = painMap[value];
        const newPains = Array.from(new Set([...session.selected_pains, ...recommendedPains]));
        onSessionChange({
          ...session,
          selected_pains: newPains,
          call_sheet_answers: { ...session.call_sheet_answers, [qId]: value },
        });
        return;
      }
    }
    onSessionChange({
      ...session,
      call_sheet_answers: { ...session.call_sheet_answers, [qId]: value },
    });
  };

  const handleCheckboxToggle = (qId: string, option: string) => {
    const current = (session.call_sheet_answers[qId] as string[] | undefined) ?? [];
    const next = current.includes(option) ? current.filter(o => o !== option) : [...current, option];
    handleAnswerChange(qId, next);
  };

  const handleCheckpointChange = (cpId: string) => {
    const current = session.call_sheet_checkpoints?.[cpId] ?? false;
    onSessionChange({
      ...session,
      call_sheet_checkpoints: { ...session.call_sheet_checkpoints, [cpId]: !current }
    });
  };

  const answeredCount = sheet.questions.filter(q => {
    const ans = session.call_sheet_answers[q.id];
    if (Array.isArray(ans)) return ans.length > 0;
    return !!ans;
  }).length;

  return (
    <section>
      {/* Header */}
      <div className="mb-4 rounded-xl bg-slate-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10">
              <ClipboardList size={13} className="text-white/80" />
            </div>
            <h3 className="text-[13px] font-bold text-white">Discovery Questions</h3>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: sheet.color + '25', color: sheet.color }}
            >
              {sheet.label}
            </span>
            <span className="text-[11px] text-white/50 font-bold tabular-nums">{answeredCount}/{sheet.questions.length}</span>
          </div>
        </div>
      </div>

      {/* Opening Line */}
      <div className="mb-8 rounded-xl bg-[#1a2332] p-4 shadow-md border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <MessageCircle size={10} className="text-slate-400" />
            <span className="text-[9px] font-bold tracking-[0.15em] text-slate-400">Opening Line</span>
          </div>
          <button
            onClick={async () => { await navigator.clipboard.writeText(sheet.openingLine); toast('Opening line copied!', 'success'); }}
            className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-all"
          >
            <Copy size={11} /> COPY
          </button>
        </div>
        <p className="text-[12px] text-white/90 leading-relaxed italic font-medium">&ldquo;{sheet.openingLine}&rdquo;</p>
      </div>

      {/* Phases & Questions in Card Stack Style */}
      <div className="space-y-6">
        {phases.map((phase) => {
          const phaseQuestions = phase.questionIds.map(id => questionMap.get(id)).filter(Boolean) as DiscoveryQuestion[];
          const phaseAnsweredCount = phaseQuestions.filter(q => {
            const ans = session.call_sheet_answers[q.id];
            if (Array.isArray(ans)) return ans.length > 0;
            return !!ans;
          }).length;

          return (
            <div key={phase.id}>
              {/* Phase Header Divider */}
              <div className="relative mb-4 mt-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-stone-50 px-4 text-[10px] font-bold tracking-[0.15em] text-stone-400">
                    {phase.label}
                  </span>
                </div>
              </div>

              {/* Cards Stack */}
              <div className="space-y-2">
                {phaseQuestions.map((q) => {
                  const answer = session.call_sheet_answers[q.id];
                  const hasAnswer = Array.isArray(answer) ? answer.length > 0 : !!answer;
                  const isExpanded = expandedQuestion === q.id;

                  return (
                    <div key={q.id} className="rounded-xl border border-stone-200 bg-white overflow-hidden transition-all duration-200">
                      {/* Card Header (Clickable) */}
                      <div
                        onClick={() => toggleQuestion(q.id)}
                        className="flex items-center gap-3 w-full p-3 hover:bg-stone-50/50 cursor-pointer"
                      >
                        {/* Status Ring */}
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                          {hasAnswer ? (
                            <CheckCircle2 size={18} className="text-emerald-500 bg-white rounded-full" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-stone-200 bg-stone-50" />
                          )}
                        </div>

                        {/* Q ID Badge */}
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-100 border border-stone-200/50">
                          <span className="text-[9px] font-bold text-stone-500">{q.id}</span>
                        </div>

                        {/* Title and Short Question */}
                        <div className="flex-1 min-w-0 text-left">
                          <h3 className="text-[13px] font-bold text-stone-900 leading-tight truncate">
                            {q.label || q.question}
                          </h3>
                          {q.label && (
                            <p className="text-[10px] text-stone-500 truncate mt-0.5">{q.question}</p>
                          )}
                        </div>

                        {/* "Answer" / "Edit" Button */}
                        <button
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1 shrink-0 ${
                            isExpanded
                              ? 'bg-stone-100 border-stone-200 text-stone-700'
                              : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                          }`}
                        >
                          {hasAnswer ? 'Edit' : 'Answer'}
                          <ChevronDown size={12} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>

                      {/* Expanded Content Drawer */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-stone-100 bg-stone-50/50 p-4">
                              {/* Top Bar inside Drawer: Coaching & Confirmation */}
                              <div className="flex justify-between items-center mb-4 pb-3 border-b border-stone-100">
                                {q.coaching ? (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); toggleCoaching(q.id); }}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                                      expandedCoaching[q.id] ? 'bg-amber-100 text-amber-700' : 'bg-white border border-stone-200 text-stone-500 hover:text-amber-600'
                                    }`}
                                  >
                                    <Lightbulb size={12} />
                                    {expandedCoaching[q.id] ? 'HIDE TIP' : 'COACHING TIP'}
                                  </button>
                                ) : <div />}

                                {/* Y/N Confirm Toggle */}
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-bold text-stone-400">Confirmed?</span>
                                  <div className="flex bg-white rounded-md border border-stone-200 p-0.5">
                                    <button
                                      onClick={() => setConfirmedQuestions(prev => ({ ...prev, [q.id]: true }))}
                                      className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                                        confirmedQuestions[q.id] === true
                                          ? 'bg-emerald-500 text-white shadow-sm'
                                          : 'text-stone-400 hover:bg-stone-50'
                                      }`}
                                    >
                                      Y
                                    </button>
                                    <button
                                      onClick={() => setConfirmedQuestions(prev => ({ ...prev, [q.id]: false }))}
                                      className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                                        confirmedQuestions[q.id] === false
                                          ? 'bg-rose-500 text-white shadow-sm'
                                          : 'text-stone-400 hover:bg-stone-50'
                                      }`}
                                    >
                                      N
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Coaching Tip Bubble */}
                              <AnimatePresence>
                                {q.coaching && expandedCoaching[q.id] && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mb-4"
                                  >
                                    <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3">
                                      <p className="text-[12px] text-amber-900 leading-relaxed font-medium">{q.coaching}</p>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* Input Area */}
                              <div className="mt-2">
                                {/* Select Type */}
                                {q.type === 'select' && q.options && (() => {
                                  const isCustom = !!answer && typeof answer === 'string' && !q.options!.includes(answer);
                                  return (
                                    <div className="space-y-2">
                                      <div className="flex flex-wrap gap-2">
                                        {q.options!.map((opt) => {
                                          const isSelected = answer === opt;
                                          return (
                                            <button
                                              key={opt}
                                              onClick={() => handleAnswerChange(q.id, isSelected ? '' : opt)}
                                              className={`text-[11px] px-3 py-2 rounded-xl border-2 font-bold transition-all ${
                                                isSelected
                                                  ? `bg-stone-900 text-white border-stone-900 shadow-md`
                                                  : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:shadow-sm'
                                              }`}
                                            >
                                              {opt}
                                            </button>
                                          );
                                        })}
                                        <button
                                          onClick={() => { if (!isCustom) handleAnswerChange(q.id, ' '); }}
                                          className={`text-[11px] px-3 py-2 rounded-xl border-2 font-bold transition-all flex items-center gap-1 ${
                                            isCustom
                                              ? `bg-stone-900 text-white border-stone-900 shadow-md`
                                              : 'border-dashed border-stone-300 bg-transparent text-stone-400 hover:border-stone-400 hover:text-stone-600'
                                          }`}
                                        >
                                          + Other
                                        </button>
                                      </div>
                                      {isCustom && (
                                        <input
                                          type="text"
                                          value={(answer as string).trim()}
                                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                          placeholder="Type custom answer…"
                                          autoFocus
                                          className="w-full text-[12px] text-stone-800 bg-white border-2 border-stone-200 rounded-xl px-4 py-3 mt-2 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 font-medium"
                                        />
                                      )}
                                    </div>
                                  );
                                })()}

                                {/* Checkbox Type */}
                                {q.type === 'checkbox' && q.options && (() => {
                                  const selected = Array.isArray(answer) ? answer : [];
                                  const customEntries = selected.filter(v => !q.options!.includes(v) && v.trim());
                                  return (
                                    <div className="space-y-3">
                                      <div className="flex flex-wrap gap-2">
                                        {q.options!.map((opt) => {
                                          const isChecked = selected.includes(opt);
                                          return (
                                            <button
                                              key={opt}
                                              onClick={() => handleCheckboxToggle(q.id, opt)}
                                              className={`text-[11px] px-3 py-2 rounded-xl border-2 font-bold transition-all flex items-center gap-2 ${
                                                isChecked
                                                  ? `bg-stone-900 text-white border-stone-900 shadow-md`
                                                  : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:shadow-sm'
                                              }`}
                                            >
                                              <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded ${isChecked ? 'bg-white text-stone-900' : 'border-2 border-stone-300 bg-white'}`}>
                                                {isChecked && <Check size={10} strokeWidth={4} />}
                                              </div>
                                              {opt}
                                            </button>
                                          );
                                        })}
                                        {customEntries.map((custom) => (
                                          <button
                                            key={custom}
                                            onClick={() => handleCheckboxToggle(q.id, custom)}
                                            className="text-[11px] px-3 py-2 rounded-xl border-2 font-bold transition-all flex items-center gap-2 bg-stone-900 text-white border-stone-900 shadow-md"
                                          >
                                            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-white text-stone-900">
                                              <Check size={10} strokeWidth={4} />
                                            </div>
                                            {custom}
                                            <X size={12} className="ml-1 opacity-60 hover:opacity-100" />
                                          </button>
                                        ))}
                                      </div>
                                      <input
                                        type="text"
                                        placeholder="+ Type and hit Enter to add other…"
                                        className="w-full text-[12px] text-stone-800 bg-transparent border-b-2 border-dashed border-stone-300 py-2 px-1 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 font-medium transition-colors"
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            const val = (e.target as HTMLInputElement).value.trim();
                                            if (val && !selected.includes(val)) {
                                              handleAnswerChange(q.id, [...selected, val]);
                                              (e.target as HTMLInputElement).value = '';
                                            }
                                          }
                                        }}
                                      />
                                    </div>
                                  );
                                })()}

                                {/* Open Type */}
                                {q.type === 'open' && (
                                  <textarea
                                    value={(answer as string) ?? ''}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    placeholder="Capture their answer…"
                                    rows={3}
                                    className="w-full text-[13px] text-stone-800 bg-white border-2 border-stone-200 rounded-xl px-4 py-3 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 resize-none leading-relaxed font-medium transition-all"
                                  />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {/* Priority & Ability Gauges (D1 Only) as standard cards */}
                {phase.id === 'd1' && (
                  <>
                    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden transition-all duration-200 mt-4">
                      <div
                        onClick={() => toggleQuestion('priority')}
                        className="flex items-center gap-3 w-full p-3 hover:bg-stone-50/50 cursor-pointer"
                      >
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                          {session.priority_self_rating ? (
                            <CheckCircle2 size={18} className="text-emerald-500 bg-white rounded-full" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-stone-200 bg-stone-50" />
                          )}
                        </div>
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-100 border border-rose-200/50">
                          <Activity size={12} className="text-rose-600" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <h3 className="text-[13px] font-bold text-stone-900 leading-tight truncate">Priority Rating</h3>
                          <p className="text-[10px] text-stone-500 truncate mt-0.5">Scale 1-10: How big of a priority is this?</p>
                        </div>
                        <button className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1 shrink-0 ${expandedQuestion === 'priority' ? 'bg-stone-100 border-stone-200 text-stone-700' : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'}`}>
                          {session.priority_self_rating ? 'Edit' : 'Answer'}
                          <ChevronDown size={12} className={`transition-transform ${expandedQuestion === 'priority' ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                      <AnimatePresence>
                        {expandedQuestion === 'priority' && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="border-t border-stone-100 bg-stone-50/50 p-6">
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-stone-600">Current Rating:</span>
                                <span className="text-2xl font-bold text-rose-500">{session.priority_self_rating ?? '-'}</span>
                              </div>
                              <input
                                type="range" min="1" max="10"
                                value={session.priority_self_rating ?? 5}
                                onChange={(e) => onSessionChange({ ...session, priority_self_rating: parseInt(e.target.value) })}
                                className="w-full accent-rose-500"
                              />
                              <div className="flex justify-between mt-2 text-[10px] font-bold text-stone-400">
                                <span>1 - Low</span><span>10 - High</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden transition-all duration-200">
                      <div
                        onClick={() => toggleQuestion('ability')}
                        className="flex items-center gap-3 w-full p-3 hover:bg-stone-50/50 cursor-pointer"
                      >
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                          {session.ability_self_rating ? (
                            <CheckCircle2 size={18} className="text-emerald-500 bg-white rounded-full" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-stone-200 bg-stone-50" />
                          )}
                        </div>
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-100 border border-sky-200/50">
                          <Zap size={12} className="text-sky-600" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <h3 className="text-[13px] font-bold text-stone-900 leading-tight truncate">Ability Rating</h3>
                          <p className="text-[10px] text-stone-500 truncate mt-0.5">Scale 1-10: Can you fix it internally?</p>
                        </div>
                        <button className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1 shrink-0 ${expandedQuestion === 'ability' ? 'bg-stone-100 border-stone-200 text-stone-700' : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'}`}>
                          {session.ability_self_rating ? 'Edit' : 'Answer'}
                          <ChevronDown size={12} className={`transition-transform ${expandedQuestion === 'ability' ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                      <AnimatePresence>
                        {expandedQuestion === 'ability' && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="border-t border-stone-100 bg-stone-50/50 p-6">
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-stone-600">Current Rating:</span>
                                <span className="text-2xl font-bold text-sky-500">{session.ability_self_rating ?? '-'}</span>
                              </div>
                              <input
                                type="range" min="1" max="10"
                                value={session.ability_self_rating ?? 5}
                                onChange={(e) => onSessionChange({ ...session, ability_self_rating: parseInt(e.target.value) })}
                                className="w-full accent-sky-500"
                              />
                              <div className="flex justify-between mt-2 text-[10px] font-bold text-stone-400">
                                <span>1 - Can do</span><span>10 - Need help</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                )}

                {phase.id === 'd1' && (
                  <div className="rounded-xl border border-stone-200 bg-white overflow-hidden transition-all duration-200 mt-2">
                    <div
                      onClick={() => toggleQuestion('worst_case')}
                      className="flex items-center gap-3 w-full p-3 hover:bg-stone-50/50 cursor-pointer"
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                        {session.worst_case_scenario ? (
                          <CheckCircle2 size={18} className="text-emerald-500 bg-white rounded-full" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-stone-200 bg-stone-50" />
                        )}
                      </div>
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-100 border border-orange-200/50">
                        <span className="text-xs">⚠️</span>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <h3 className="text-[13px] font-bold text-stone-900 leading-tight truncate">Worst-Case Scenario</h3>
                        <p className="text-[10px] text-stone-500 truncate mt-0.5">What's the worst that happens if this doesn't get solved?</p>
                      </div>
                      <button className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1 shrink-0 ${expandedQuestion === 'worst_case' ? 'bg-stone-100 border-stone-200 text-stone-700' : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'}`}>
                        {session.worst_case_scenario ? 'Edit' : 'Answer'}
                        <ChevronDown size={12} className={`transition-transform ${expandedQuestion === 'worst_case' ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    <AnimatePresence>
                      {expandedQuestion === 'worst_case' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="border-t border-stone-100 bg-stone-50/50 p-4">
                            <div className="rounded-xl border border-orange-200/80 bg-orange-50/80 px-4 py-3 mb-4">
                              <p className="text-[12px] text-orange-900 leading-relaxed font-medium">💡 Capture the prospect's own words. "Realistically, what's the worst thing that happens if this doesn't get solved?" This is the emotional anchor for urgency.</p>
                            </div>
                            <textarea
                              value={session.worst_case_scenario ?? ''}
                              onChange={(e) => onSessionChange({ ...session, worst_case_scenario: e.target.value })}
                              placeholder="Capture their worst-case scenario in their own words…"
                              rows={3}
                              className="w-full text-[13px] text-stone-800 bg-white border-2 border-stone-200 rounded-xl px-4 py-3 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 resize-none leading-relaxed font-medium transition-all"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {phase.id === 'd2' && (
                  <div className="rounded-xl border border-stone-200 bg-white overflow-hidden transition-all duration-200 mt-4">
                    <div
                      onClick={() => toggleQuestion('gap_ability')}
                      className="flex items-center gap-3 w-full p-3 hover:bg-stone-50/50 cursor-pointer"
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                        {session.gap_in_ability ? (
                          <CheckCircle2 size={18} className="text-emerald-500 bg-white rounded-full" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-stone-200 bg-stone-50" />
                        )}
                      </div>
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-100 border border-purple-200/50">
                        <span className="text-xs">🧩</span>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <h3 className="text-[13px] font-bold text-stone-900 leading-tight truncate">Gap in Ability</h3>
                        <p className="text-[10px] text-stone-500 truncate mt-0.5">What kept them from solving this? Knowledge, capacity, or patience?</p>
                      </div>
                      <button className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1 shrink-0 ${expandedQuestion === 'gap_ability' ? 'bg-stone-100 border-stone-200 text-stone-700' : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'}`}>
                        {session.gap_in_ability ? 'Edit' : 'Answer'}
                        <ChevronDown size={12} className={`transition-transform ${expandedQuestion === 'gap_ability' ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    <AnimatePresence>
                      {expandedQuestion === 'gap_ability' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="border-t border-stone-100 bg-stone-50/50 p-4">
                            <div className="rounded-xl border border-purple-200/80 bg-purple-50/80 px-4 py-3 mb-4">
                              <p className="text-[12px] text-purple-900 leading-relaxed font-medium">💡 "What has kept you from being able to solve this?" — Classify as Knowledge (don't know how), Capacity (don't have bandwidth), or Patience (tried and given up).</p>
                            </div>
                            <div className="flex gap-2">
                              {(['knowledge', 'capacity', 'patience'] as const).map(gap => {
                                const isSelected = session.gap_in_ability === gap;
                                const labels = { knowledge: '🧠 Knowledge', capacity: '⚡ Capacity', patience: '⏳ Patience' };
                                const descriptions = { knowledge: "They don't know how", capacity: "They don't have bandwidth", patience: "They've tried and given up" };
                                return (
                                  <button
                                    key={gap}
                                    onClick={() => onSessionChange({ ...session, gap_in_ability: isSelected ? undefined : gap })}
                                    className={`flex-1 rounded-xl border-2 p-3 text-center transition-all ${isSelected ? 'bg-stone-900 border-stone-900 text-white shadow-md' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}`}
                                  >
                                    <div className="text-lg mb-1">{labels[gap].split(' ')[0]}</div>
                                    <div className="text-[11px] font-bold">{labels[gap].split(' ')[1]}</div>
                                    <div className={`text-[9px] mt-1 ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>{descriptions[gap]}</div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Checkpoint Gauge (between phases) */}
              {phase.checkpointAfter && (
                <div className="mt-4 mb-2 rounded-xl bg-gradient-to-r from-stone-50 to-white border border-stone-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shield size={14} className={session.call_sheet_checkpoints[phase.checkpointAfter.id] ? 'text-emerald-500' : 'text-stone-400'} />
                      <span className="text-[11px] font-bold tracking-[0.12em] text-slate-700">{phase.checkpointAfter.label}</span>
                    </div>
                    <button
                      onClick={() => handleCheckpointChange(phase.checkpointAfter!.id)}
                      className={`text-[10px] font-bold px-4 py-1.5 rounded-lg border-2 transition-all ${
                        session.call_sheet_checkpoints[phase.checkpointAfter.id]
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                          : 'bg-white border-stone-300 text-stone-500 hover:border-stone-400 hover:shadow-sm'
                      }`}
                    >
                      {session.call_sheet_checkpoints[phase.checkpointAfter.id] ? '✓ PASS' : 'PENDING'}
                    </button>
                  </div>
                  {/* Gradient gauge bar */}
                  <div className="relative h-2.5 rounded-full overflow-hidden mb-2"
                    style={{ background: 'linear-gradient(to right, #ef4444, #f59e0b, #22c55e)' }}>
                    <div
                      className="absolute inset-y-0 right-0 bg-stone-200/80 transition-all duration-500"
                      style={{ width: `${100 - (phaseAnsweredCount / Math.max(phaseQuestions.length, 1)) * 100}%` }}
                    />
                  </div>
                  {/* Score labels */}
                  <div className="flex items-center justify-between text-[8px] font-bold">
                    <span className="text-rose-500">1-4 = NO</span>
                    <span className="text-amber-500">5-7 = MAYBE</span>
                    <span className="text-emerald-500">8-10 = YES</span>
                  </div>
                  <p className="text-[11px] text-stone-600 font-medium italic mt-2">{phase.checkpointAfter.question}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}


// ════════════════════════════════════════════════════════════════

export function BAPTab({ session, onSessionChange }: { session: DiscoverySession; onSessionChange: (s: DiscoverySession) => void }) {
  // ── Unified progress: questions answered + checkpoints passed ──
  const personaSheetId = resolvePersonaSheetId(session.persona);
  const [openD4, setOpenD4] = useState(false);
  const personaSheet = SHEETS.find(s => s.id === personaSheetId) ?? SHEETS[0];

  const totalQuestions = personaSheet.questions.length;
  const answeredQuestions = personaSheet.questions.filter(q => {
    const ans = session.call_sheet_answers[q.id];
    if (Array.isArray(ans)) return ans.length > 0;
    return !!ans;
  }).length;

  const checkpointsPassed = [
    session.call_sheet_checkpoints['cp1'],
    session.call_sheet_checkpoints['cp2'],
    session.call_sheet_checkpoints['cp3'],
  ].filter(Boolean).length;

  const d4Done = [
    session.budget_confirmed,
    !!session.implementation_timeline,
    !!session.next_action,
  ].filter(Boolean).length;

  // Progress: questions (60%) + checkpoints (25%) + d4 (15%)
  const progress = Math.round(
    (answeredQuestions / totalQuestions) * 60 +
    (checkpointsPassed / 3) * 25 +
    (d4Done / 3) * 15
  );
  const progressColor = progress <= 33 ? '#ef4444' : progress <= 66 ? '#f59e0b' : '#22c55e';

  return (
    <div className="px-4 py-4 space-y-5">
      {/* ── Unified Progress Bar — Deal Health Indicator ── */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-stone-100 -mx-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2.5 rounded-full bg-stone-100 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${progressColor}cc, ${progressColor})`,
                boxShadow: `0 0 8px ${progressColor}40`,
              }}
            />
          </div>
          <span className="text-[12px] font-bold tabular-nums" style={{ color: progressColor }}>{progress}%</span>
        </div>
        {/* Phase dot indicators */}
        <div className="flex items-center gap-2 mt-2">
          {/* D1 */}
          <div className="flex items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-full transition-colors ${answeredQuestions > 0 ? 'bg-violet-500' : 'bg-stone-200'}`} />
            <span className={`text-[9px] font-bold ${answeredQuestions > 0 ? 'text-violet-600' : 'text-stone-400'}`}>D1</span>
          </div>
          <div className="flex-1 h-px bg-stone-200" />
          {/* CP1 */}
          <div className={`w-1.5 h-1.5 rounded-full ${checkpointsPassed >= 1 ? 'bg-emerald-400' : 'bg-stone-200'}`} />
          <div className="flex-1 h-px bg-stone-200" />
          {/* D2 */}
          <div className="flex items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-full transition-colors ${checkpointsPassed >= 1 ? 'bg-cyan-500' : 'bg-stone-200'}`} />
            <span className={`text-[9px] font-bold ${checkpointsPassed >= 1 ? 'text-cyan-600' : 'text-stone-400'}`}>D2</span>
          </div>
          <div className="flex-1 h-px bg-stone-200" />
          {/* CP2 */}
          <div className={`w-1.5 h-1.5 rounded-full ${checkpointsPassed >= 2 ? 'bg-emerald-400' : 'bg-stone-200'}`} />
          <div className="flex-1 h-px bg-stone-200" />
          {/* D3 */}
          <div className="flex items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-full transition-colors ${checkpointsPassed >= 2 ? 'bg-amber-500' : 'bg-stone-200'}`} />
            <span className={`text-[9px] font-bold ${checkpointsPassed >= 2 ? 'text-amber-600' : 'text-stone-400'}`}>D3</span>
          </div>
          <div className="flex-1 h-px bg-stone-200" />
          {/* CP3 */}
          <div className={`w-1.5 h-1.5 rounded-full ${checkpointsPassed >= 3 ? 'bg-emerald-400' : 'bg-stone-200'}`} />
          <div className="flex-1 h-px bg-stone-200" />
          {/* D4 */}
          <div className="flex items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-full transition-colors ${d4Done > 0 ? 'bg-rose-500' : 'bg-stone-200'}`} />
            <span className={`text-[9px] font-bold ${d4Done > 0 ? 'text-rose-600' : 'text-stone-400'}`}>D4</span>
          </div>
        </div>
        {/* Summary stats */}
        <div className="flex items-center gap-3 mt-2 text-[9px] font-bold text-stone-400">
          <span className={answeredQuestions > 0 ? 'text-slate-600' : ''}>
            {answeredQuestions}/{totalQuestions} questions
          </span>
          <span className="text-stone-200">·</span>
          <span className={checkpointsPassed > 0 ? 'text-emerald-600' : ''}>
            {checkpointsPassed}/3 gates
          </span>
          <span className="text-stone-200">·</span>
          <span className={d4Done > 0 ? 'text-rose-600' : ''}>
            D4: {d4Done}/3
          </span>
        </div>
      </div>

      {/* ─── D1 → CP1 → D2 → CP2 → D3 → CP3 (Unified 4D Flow) ─── */}
      <PersonaDiscoverySection session={session} onSessionChange={onSessionChange} />

      {/* ─── D4: DECISION — same pattern as D1-D3 ─── */}
      <section>
        <div className="rounded-xl overflow-hidden border border-stone-200/80">
          {/* D4 Header — collapsible, matching D1-D3 */}
          <button
            onClick={() => setOpenD4(!openD4)}
            className="w-full flex items-center gap-3 py-3 px-4 border-l-4 border-rose-500 bg-rose-50/60 hover:brightness-95 transition-all duration-200 group"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-rose-600 shadow-sm">
              <span className="text-[9px] font-bold text-white">D4</span>
            </div>
            <span className="text-[12px] font-bold tracking-[0.12em] text-slate-800">D4: Decision</span>
            <div className="ml-auto flex items-center gap-2">
              {d4Done === 3 && (
                <span className="text-[8px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Complete</span>
              )}
              <span className="text-[11px] text-slate-500 font-bold tabular-nums">{d4Done}/3</span>
              <motion.div animate={{ rotate: openD4 ? 90 : 0 }} transition={{ duration: 0.15 }}>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700" />
              </motion.div>
            </div>
          </button>

          {/* Collapsible content */}
          <AnimatePresence initial={false}>
            {openD4 && (
              <motion.div
                key="d4-content"
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                variants={expandVariants}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="space-y-2 p-3 bg-white">
                  {/* Budget — Y/N toggle card */}
                  <div className={`rounded-xl border-2 p-3 transition-all duration-200 ${
                    session.budget_confirmed
                      ? 'border-emerald-300 bg-emerald-50/40 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]'
                      : 'border-stone-100 bg-white hover:border-stone-200'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      <div className="shrink-0 flex items-center justify-center rounded-lg px-2 py-1 text-[9px] font-bold bg-rose-600 text-white shadow-sm mt-0.5">
                        BUD
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-slate-800">Budget Allocated?</p>
                        <p className="text-[10px] text-stone-500 mt-0.5">Confirm budget has been approved for this initiative</p>
                      </div>
                      {/* Y/N toggle */}
                      <div className="flex gap-0.5 shrink-0">
                        <button
                          onClick={() => onSessionChange({ ...session, budget_confirmed: true })}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all ${
                            session.budget_confirmed
                              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                              : 'bg-stone-100 text-stone-400 hover:bg-emerald-100 hover:text-emerald-600'
                          }`}
                        >
                          Y
                        </button>
                        <button
                          onClick={() => onSessionChange({ ...session, budget_confirmed: false })}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all ${
                            !session.budget_confirmed
                              ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                              : 'bg-stone-100 text-stone-400 hover:bg-rose-100 hover:text-rose-600'
                          }`}
                        >
                          N
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Timeline — card with label tag */}
                  <div className={`rounded-xl border-2 p-3 transition-all duration-200 ${
                    session.implementation_timeline
                      ? 'border-slate-200 bg-slate-50/30'
                      : 'border-stone-100 bg-white hover:border-stone-200'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      <div className="shrink-0 flex items-center justify-center rounded-lg px-2 py-1 text-[9px] font-bold bg-rose-600 text-white shadow-sm mt-0.5">
                        TML
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-slate-800">Implementation Timeline</p>
                        <div className="flex items-center gap-2 mt-1">
                          <CalendarDays size={13} className="text-stone-400 shrink-0" />
                          <input
                            type="text"
                            value={session.implementation_timeline || ''}
                            onChange={(e) => onSessionChange({ ...session, implementation_timeline: e.target.value || null })}
                            placeholder="e.g. 30 days, Q3 2026, ASAP…"
                            className="flex-1 text-[12px] font-medium text-slate-700 placeholder:text-stone-400 focus:outline-none bg-transparent"
                          />
                        </div>
                      </div>
                      {/* Y/N toggle */}
                      <div className="flex gap-0.5 shrink-0">
                        <button className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all ${
                          session.implementation_timeline
                            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                            : 'bg-stone-100 text-stone-400'
                        }`}>Y</button>
                        <button className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all ${
                          !session.implementation_timeline
                            ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                            : 'bg-stone-100 text-stone-400'
                        }`}>N</button>
                      </div>
                    </div>
                  </div>

                  {/* Next Action — card with label tag */}
                  <div className={`rounded-xl border-2 p-3 transition-all duration-200 ${
                    session.next_action
                      ? 'border-slate-200 bg-slate-50/30'
                      : 'border-stone-100 bg-white hover:border-stone-200'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      <div className="shrink-0 flex items-center justify-center rounded-lg px-2 py-1 text-[9px] font-bold bg-rose-600 text-white shadow-sm mt-0.5">
                        NXT
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-slate-800">Next Concrete Action</p>
                        <div className="flex items-center gap-2 mt-1">
                          <ChevronRight size={13} className="text-stone-400 shrink-0" />
                          <input
                            type="text"
                            value={session.next_action || ''}
                            onChange={(e) => onSessionChange({ ...session, next_action: e.target.value || '' })}
                            placeholder="Next step: demo, proposal, intro call…"
                            className="flex-1 text-[12px] font-medium text-slate-700 placeholder:text-stone-400 focus:outline-none bg-transparent"
                          />
                        </div>
                      </div>
                      {/* Y/N toggle */}
                      <div className="flex gap-0.5 shrink-0">
                        <button className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all ${
                          session.next_action
                            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                            : 'bg-stone-100 text-stone-400'
                        }`}>Y</button>
                        <button className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all ${
                          !session.next_action
                            ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                            : 'bg-stone-100 text-stone-400'
                        }`}>N</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* D4 Checkpoint Gauge — "Ready to Close?" */}
                <div className="border-t border-stone-200/80 bg-gradient-to-r from-stone-50 to-white p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield size={13} className={d4Done === 3 ? 'text-emerald-500' : 'text-stone-400'} />
                      <span className="text-[10px] font-bold tracking-[0.12em] text-slate-700">Decision Gate</span>
                    </div>
                    <span className={`text-[9px] font-bold px-3 py-1 rounded-lg border-2 transition-all ${
                      d4Done === 3
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                        : 'bg-white border-stone-300 text-stone-500'
                    }`}>
                      {d4Done === 3 ? '✓ PASS' : 'PENDING'}
                    </span>
                  </div>
                  {/* Gradient gauge bar */}
                  <div className="relative h-2.5 rounded-full overflow-hidden mb-2"
                    style={{ background: 'linear-gradient(to right, #ef4444, #f59e0b, #22c55e)' }}>
                    <div
                      className="absolute inset-y-0 right-0 bg-stone-200/80 transition-all duration-500"
                      style={{ width: `${100 - (d4Done / 3) * 100}%` }}
                    />
                  </div>
                  {/* Score labels */}
                  <div className="flex items-center justify-between text-[8px] font-bold">
                    <span className="text-rose-500">1-4 = NO</span>
                    <span className="text-amber-500">5-7 = MAYBE</span>
                    <span className="text-emerald-500">8-10 = YES</span>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-2 leading-relaxed italic">Are all decision criteria met to move forward?</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
