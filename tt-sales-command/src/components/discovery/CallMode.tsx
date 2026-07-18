// ============================================================
// CallMode.tsx — Simplified guided call interface for Discovery Room
// Shows critical-path BAP questions one at a time with coaching tips,
// progress dots, checkpoint scoring, and post-call quick capture.
// ============================================================

import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Phone, Zap, Check, HelpCircle, Calendar } from 'lucide-react';
import type { DiscoverySession } from '../../lib/discoveryDatabase';
import { BAP_QUESTIONS, computeBAPAnswers, getCheckpointScore } from '../../lib/discoveryDatabase';
import { TT_PAINS } from './PainDiscoveryModule';
import { PERSONA_OPTIONS_COMPACT as PERSONA_OPTIONS } from '../../data/roomOptions';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface CallModeProps {
  session: DiscoverySession;
  onSessionChange: (session: DiscoverySession) => void;
  selectedPains: string[];
  onPainChange: (pains: string[]) => void;
  selectedPersona: string | null;
  onPersonaChange: (persona: string) => void;
  onSwitchToFull: () => void;
}

/* ------------------------------------------------------------------ */
/*  Stage Configuration & Coaching Tips                                */
/* ------------------------------------------------------------------ */

type InputType = 'pain-select' | 'persona-select' | 'textarea' | 'slider' | 'yes-maybe-no' | 'call-sheet-select';

interface CallModeQuestion {
  bapQuestionId: string;
  title: string;
  prompt: string;
  inputType: InputType;
  coachingTip: string;
}

interface StageConfig {
  stageKey: string;
  stageLabel: string;
  checkpoint: 1 | 2 | 3;
  checkpointLabel: string;
  questions: CallModeQuestion[];
}

const CALL_SHEET_CURRENT_APPROACH_OPTIONS = [
  'Spreadsheets & email',
  'Basic HRIS add-on',
  'Legacy ATS (5+ years)',
  'Modern ATS (switching)',
  'No system at all',
  'Staffing agencies only',
  'Manual paper process',
  'Other',
];

const STAGE_CONFIGS: StageConfig[] = [
  {
    stageKey: 'investigating',
    stageLabel: 'Investigating',
    checkpoint: 1,
    checkpointLabel: 'CP1 Urgency Test',
    questions: [
      {
        bapQuestionId: 'q1',
        title: 'Core Problem',
        prompt: 'What is the exact problem they\'re trying to solve?',
        inputType: 'pain-select',
        coachingTip: 'Don\'t accept vague answers like "we\'re just exploring." Push for the specific problem and its cost.',
      },
      {
        bapQuestionId: 'q2',
        title: 'Stakeholder Map',
        prompt: 'Who owns this problem and makes the decision?',
        inputType: 'persona-select',
        coachingTip: 'Ask: "Who else will be involved in this decision?" Don\'t accept "we\'ll all decide together."',
      },
      {
        bapQuestionId: 'q3',
        title: 'Cost of Indecision',
        prompt: 'What happens if they do nothing?',
        inputType: 'textarea',
        coachingTip: 'Ask: "What happens if you don\'t fix this in the next 90 days?" Quantify in dollars or time.',
      },
      {
        bapQuestionId: 'q4',
        title: 'Priority Level',
        prompt: 'Is fixing this a top priority?',
        inputType: 'slider',
        coachingTip: 'If they say it\'s important but not urgent, ask: "What would need to happen to make this a Q3 priority?"',
      },
      {
        bapQuestionId: 'cs_current_approach',
        title: 'Current Approach',
        prompt: 'What are they doing today to solve this?',
        inputType: 'call-sheet-select',
        coachingTip: 'Understanding their current state reveals the size of the gap. If it\'s "nothing," probe why — budget, awareness, or inertia?',
      },
    ],
  },
  {
    stageKey: 'evaluating',
    stageLabel: 'Evaluating',
    checkpoint: 2,
    checkpointLabel: 'CP2 Gap Test',
    questions: [
      {
        bapQuestionId: 'q5',
        title: 'Current Approach',
        prompt: 'What solutions have they tried?',
        inputType: 'textarea',
        coachingTip: 'Ask what they\'ve tried. If "nothing", probe why — is it budget, awareness, or organizational inertia?',
      },
      {
        bapQuestionId: 'q6',
        title: 'Capability Gap',
        prompt: 'Why have current efforts failed?',
        inputType: 'textarea',
        coachingTip: 'Ask: "What\'s preventing your current tools from solving this?"',
      },
      {
        bapQuestionId: 'q7',
        title: 'Need for Help',
        prompt: 'Have they acknowledged they need outside help?',
        inputType: 'yes-maybe-no',
        coachingTip: 'Listen for: "We can\'t do this alone" or "We need a partner." If they haven\'t said it, ask directly.',
      },
      {
        bapQuestionId: 'q8',
        title: 'Readiness',
        prompt: 'Budget, timeline, resources ready?',
        inputType: 'yes-maybe-no',
        coachingTip: 'Ask: "If we were the right fit, do you have budget allocated for this initiative?"',
      },
    ],
  },
  {
    stageKey: 'negotiating',
    stageLabel: 'Negotiating',
    checkpoint: 3,
    checkpointLabel: 'CP3 Solution Fit',
    questions: [
      {
        bapQuestionId: 'q9',
        title: 'Proven Results',
        prompt: 'Have we proven we can solve this?',
        inputType: 'yes-maybe-no',
        coachingTip: 'Reference a case study. Say: "We helped [company] solve exactly this — here\'s what happened."',
      },
      {
        bapQuestionId: 'q11',
        title: 'Success Metrics',
        prompt: 'How will they measure success?',
        inputType: 'textarea',
        coachingTip: 'Ask: "If we do this perfectly, what does success look like 12 months from now?"',
      },
      {
        bapQuestionId: 'q12',
        title: 'Trial Close',
        prompt: 'Confidence level 1-10?',
        inputType: 'slider',
        coachingTip: 'Ask: "On a scale of 1-10, how confident are you this is the right solution? What would make it a 10?"',
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function mapStageToConfig(dealStage: string): StageConfig {
  switch (dealStage) {
    case 'evaluating':
      return STAGE_CONFIGS[1];
    case 'negotiating':
    case 'contracting':
    case 'signing':
      return STAGE_CONFIGS[2];
    default:
      return STAGE_CONFIGS[0];
  }
}

/** Map slider value to bap answer */
function sliderToAnswer(value: number): 'yes' | 'maybe' | 'no' {
  if (value >= 8) return 'yes';
  if (value >= 5) return 'maybe';
  return 'no';
}

/* ------------------------------------------------------------------ */
/*  Sub-Components                                                     */
/* ------------------------------------------------------------------ */

/* ---- Progress Dots ---- */
function ProgressDots({
  total,
  current,
  answered,
}: {
  total: number;
  current: number;
  answered: boolean[];
}) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <motion.button
          key={i}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
 i === current
 ? 'bg-stone-900 scale-125 ring-2 ring-stone-400 ring-offset-2'
 : answered[i]
 ? 'bg-emerald-500'
 : 'bg-stone-300'
 }`}
          whileHover={{ scale: 1.3 }}
          aria-label={`Question ${i + 1}`}
        />
      ))}
    </div>
  );
}

/* ---- Pain Tag Selector ---- */
function PainTagSelector({
  selectedPains,
  onPainChange,
}: {
  selectedPains: string[];
  onPainChange: (pains: string[]) => void;
}) {
  // Show top-ranked pains first, then fill to 10
  const topPains = useMemo(() => {
    const ranked = TT_PAINS.filter(p => p.topRank != null).sort((a, b) => (a.topRank ?? 99) - (b.topRank ?? 99));
    const rest = TT_PAINS.filter(p => p.topRank == null);
    return [...ranked, ...rest].slice(0, 10);
  }, []);

  const togglePain = (id: string) => {
    if (selectedPains.includes(id)) {
      onPainChange(selectedPains.filter(p => p !== id));
    } else {
      onPainChange([...selectedPains, id]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {topPains.map(pain => {
        const isSelected = selectedPains.includes(pain.id);
        return (
          <motion.button
            key={pain.id}
            onClick={() => togglePain(pain.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
 isSelected
 ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
 : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400 hover:bg-stone-50'
 }`}
          >
            {isSelected && <Check size={12} className="inline mr-1.5 -mt-0.5" />}
            {pain.title}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ---- Persona Pill Selector ---- */
function PersonaPillSelector({
  selectedPersona,
  stakeholderName,
  onPersonaChange,
  onStakeholderNameChange,
}: {
  selectedPersona: string | null;
  stakeholderName: string;
  onPersonaChange: (persona: string) => void;
  onStakeholderNameChange: (name: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {PERSONA_OPTIONS.map(opt => {
          const isSelected = selectedPersona === opt.id;
          return (
            <motion.button
              key={opt.id}
              onClick={() => onPersonaChange(opt.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
 isSelected
 ? 'bg-stone-900 text-white border-stone-900 shadow-md'
 : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400 hover:bg-stone-50'
 }`}
            >
              {opt.label}
            </motion.button>
          );
        })}
      </div>
      <div className="max-w-sm mx-auto">
        <label className="block text-xs font-semibold text-stone-400 mb-1.5">
          Stakeholder Name
        </label>
        <input
          type="text"
          value={stakeholderName}
          onChange={e => onStakeholderNameChange(e.target.value)}
          placeholder="Enter their name..."
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-100 transition-all"
        />
      </div>
    </div>
  );
}

/* ---- Yes / Maybe / No Buttons ---- */
function YesMaybeNoButtons({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: 'yes' | 'maybe' | 'no') => void;
}) {
  const options: { key: 'yes' | 'maybe' | 'no'; label: string; color: string; activeColor: string }[] = [
    { key: 'yes', label: '✅ Yes', color: 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50', activeColor: 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200' },
    { key: 'maybe', label: '🤔 Maybe', color: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50', activeColor: 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-200' },
    { key: 'no', label: '❌ No', color: 'border-rose-200 hover:border-rose-400 hover:bg-rose-50', activeColor: 'bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-200' },
  ];

  return (
    <div className="flex gap-3 justify-center">
      {options.map(opt => (
        <motion.button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-3 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
            value === opt.key ? opt.activeColor : `bg-white text-stone-700 ${opt.color}`
          }`}
        >
          {opt.label}
        </motion.button>
      ))}
    </div>
  );
}

/* ---- Scale Slider ---- */
function ScaleSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const color = value >= 8 ? '#10B981' : value >= 5 ? '#F59E0B' : '#EF4444';

  return (
    <div className="max-w-sm mx-auto space-y-3">
      <div className="flex items-center justify-between text-xs font-medium text-stone-400">
        <span>1 – Low</span>
        <span>10 – High</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${((value - 1) / 9) * 100}%, #e4e4e7 ${((value - 1) / 9) * 100}%, #e4e4e7 100%)`,
        }}
      />
      <div className="text-center">
        <span
          className="inline-flex items-center justify-center w-12 h-12 rounded-2xl text-xl font-bold text-white shadow-lg"
          style={{ backgroundColor: color }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

/* ---- Call Sheet Select ---- */
function CallSheetSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {CALL_SHEET_CURRENT_APPROACH_OPTIONS.map(opt => {
        const isSelected = value === opt;
        return (
          <motion.button
            key={opt}
            onClick={() => onChange(opt)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
 isSelected
 ? 'bg-stone-900 text-white border-stone-900 shadow-md'
 : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400 hover:bg-stone-50'
 }`}
          >
            {opt}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ---- Checkpoint Progress Bar ---- */
function CheckpointProgressBar({
  checkpoint,
  label,
  score,
  maxScore,
}: {
  checkpoint: number;
  label: string;
  score: number;
  maxScore: number;
}) {
  const pct = Math.min((score / maxScore) * 100, 100);
  const passed = score >= maxScore - 2.5;
  const atRisk = score >= maxScore / 2;
  const color = passed ? '#10B981' : atRisk ? '#F59E0B' : '#EF4444';
  const statusLabel = passed ? 'PASS' : atRisk ? 'AT RISK' : 'NEEDS WORK';
  const statusEmoji = passed ? '✅' : atRisk ? '⚠️' : '🔴';

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 px-5 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-stone-500">
          Checkpoint {checkpoint} Progress
        </span>
        <span className="text-xs font-bold" style={{ color }}>
          {statusEmoji} {statusLabel}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2.5 rounded-full bg-stone-200 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <span className="text-sm font-bold tabular-nums" style={{ color }}>
          {score.toFixed(1)}/{maxScore}
        </span>
      </div>
      <p className="mt-1.5 text-[11px] text-stone-400">{label}</p>
    </div>
  );
}

/* ---- Post-Call Quick Capture ---- */
function PostCallQuickCapture({
  session,
  onSessionChange,
}: {
  session: DiscoverySession;
  onSessionChange: (session: DiscoverySession) => void;
}) {
  const gutFeel = session.gut_feel ?? null;
  const nextAction = session.next_action ?? '';
  const nextMeeting = session.next_meeting_date ?? '';

  const setGutFeel = (v: 'strong' | 'mixed' | 'weak') => {
    onSessionChange({ ...session, gut_feel: v, last_call_date: new Date().toISOString() });
  };

  const gutOptions: { key: 'strong' | 'mixed' | 'weak'; emoji: string; label: string; color: string; activeColor: string }[] = [
    { key: 'strong', emoji: '🟢', label: 'Strong', color: 'border-emerald-200 hover:bg-emerald-50', activeColor: 'bg-emerald-600 text-white border-emerald-600' },
    { key: 'mixed', emoji: '🟡', label: 'Mixed', color: 'border-amber-200 hover:bg-amber-50', activeColor: 'bg-amber-500 text-white border-amber-500' },
    { key: 'weak', emoji: '🔴', label: 'Weak', color: 'border-rose-200 hover:bg-rose-50', activeColor: 'bg-rose-600 text-white border-rose-600' },
  ];

  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-white/60 px-5 py-4 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Zap size={14} className="text-amber-500" />
        <span className="text-xs font-bold text-stone-500">
          Post-Call Quick Capture
        </span>
      </div>

      {/* Gut Feel */}
      <div>
        <label className="block text-xs font-semibold text-stone-500 mb-2">Gut Feel</label>
        <div className="flex gap-2">
          {gutOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setGutFeel(opt.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                gutFeel === opt.key ? opt.activeColor : `bg-white text-stone-600 ${opt.color}`
              }`}
            >
              <span>{opt.emoji}</span> {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Next Action */}
      <div>
        <label className="block text-xs font-semibold text-stone-500 mb-1.5">Next Action</label>
        <input
          type="text"
          value={nextAction}
          onChange={e => onSessionChange({ ...session, next_action: e.target.value })}
          placeholder="What's the next step?"
          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-100 transition-all"
        />
      </div>

      {/* Next Meeting */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 mb-1.5">
          <Calendar size={12} /> Next Meeting
        </label>
        <input
          type="date"
          value={nextMeeting}
          onChange={e => onSessionChange({ ...session, next_meeting_date: e.target.value })}
          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-100 transition-all"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function CallMode({
  session,
  onSessionChange,
  selectedPains,
  onPainChange,
  selectedPersona,
  onPersonaChange,
  onSwitchToFull,
}: CallModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 = left, 1 = right (for animation)

  // Determine current stage config
  const stageConfig = useMemo(
    () => mapStageToConfig(session.deal_stage || 'qualifying'),
    [session.deal_stage]
  );

  const questions = stageConfig.questions;
  const totalQuestions = questions.length;
  const currentQ = questions[Math.min(currentIndex, totalQuestions - 1)];

  // Compute BAP answers for checkpoint scoring
  const bapAnswers = useMemo(() => computeBAPAnswers(session), [session]);
  const checkpointScore = useMemo(
    () => getCheckpointScore(bapAnswers, stageConfig.checkpoint),
    [bapAnswers, stageConfig.checkpoint]
  );
  const maxScore = BAP_QUESTIONS.filter(q => q.checkpoint === stageConfig.checkpoint).length * 2.5;

  // Determine the next stage label for the advance button
  const nextStageLabel = useMemo(() => {
    const STAGE_ORDER = ['qualifying', 'investigating', 'evaluating', 'negotiating', 'contracting', 'signing'];
    const STAGE_LABELS: Record<string, string> = {
      'qualifying': 'Qualifying',
      'investigating': 'Investigating',
      'evaluating': 'Evaluating',
      'negotiating': 'Negotiating',
      'contracting': 'Contracting',
      'signing': 'Signing',
    };
    const currentIdx = STAGE_ORDER.indexOf(session.deal_stage || 'qualifying');
    if (currentIdx < STAGE_ORDER.length - 1) {
      return STAGE_LABELS[STAGE_ORDER[currentIdx + 1]] || null;
    }
    return null;
  }, [session.deal_stage]);

  // Local state for slider values (not directly mapped to BAP yes/maybe/no until change)
  const getSliderValue = useCallback(
    (qId: string): number => {
      if (qId === 'q4') {
        // Priority level: derive from pain count or stored value
        const stored = session.call_sheet_answers?.['cm_slider_q4'];
        if (stored && typeof stored === 'string') return parseInt(stored) || 5;
        return session.selected_pains.length >= 4 ? 8 : session.selected_pains.length >= 2 ? 6 : 5;
      }
      if (qId === 'q12') {
        const stored = session.call_sheet_answers?.['cm_slider_q12'];
        if (stored && typeof stored === 'string') return parseInt(stored) || 5;
        return 5;
      }
      return 5;
    },
    [session]
  );

  // Detect answered questions
  const answeredFlags = useMemo(
    () =>
      questions.map(q => {
        if (q.bapQuestionId === 'cs_current_approach') {
          return !!session.call_sheet_answers?.['cm_current_approach'];
        }
        if (q.bapQuestionId === 'q1') return selectedPains.length > 0;
        if (q.bapQuestionId === 'q2') return !!selectedPersona;
        // textarea questions: check bap_notes
        if (q.inputType === 'textarea') {
          return !!(session.bap_notes?.[q.bapQuestionId]);
        }
        // slider: check if stored
        if (q.inputType === 'slider') {
          return !!session.call_sheet_answers?.[`cm_slider_${q.bapQuestionId}`];
        }
        // yes/maybe/no
        return !!bapAnswers[q.bapQuestionId];
      }),
    [questions, selectedPains, selectedPersona, session, bapAnswers]
  );

  // Stakeholder name for Q2
  const stakeholderName = useMemo(() => {
    const primary = session.stakeholders?.[0];
    return primary?.name ?? (session.champion_name || '');
  }, [session]);

  // ── Handlers ──

  const updateBapAnswer = useCallback(
    (qId: string, value: 'yes' | 'maybe' | 'no') => {
      onSessionChange({
        ...session,
        bap_answers: {
          ...(session.bap_answers || {}),
          [qId]: value,
        },
      });
    },
    [session, onSessionChange]
  );

  const updateBapNote = useCallback(
    (qId: string, text: string) => {
      onSessionChange({
        ...session,
        bap_notes: {
          ...(session.bap_notes || {}),
          [qId]: text,
        },
      });
    },
    [session, onSessionChange]
  );

  const updateSlider = useCallback(
    (qId: string, value: number) => {
      const answer = sliderToAnswer(value);
      onSessionChange({
        ...session,
        bap_answers: {
          ...(session.bap_answers || {}),
          [qId]: answer,
        },
        call_sheet_answers: {
          ...(session.call_sheet_answers || {}),
          [`cm_slider_${qId}`]: String(value),
        },
      });
    },
    [session, onSessionChange]
  );

  const updateCallSheetAnswer = useCallback(
    (key: string, value: string) => {
      onSessionChange({
        ...session,
        call_sheet_answers: {
          ...(session.call_sheet_answers || {}),
          [key]: value,
        },
      });
    },
    [session, onSessionChange]
  );

  const handleStakeholderNameChange = useCallback(
    (name: string) => {
      const existing = session.stakeholders || [];
      if (existing.length > 0) {
        const updated = [...existing];
        updated[0] = { ...updated[0], name };
        onSessionChange({ ...session, stakeholders: updated });
      } else {
        onSessionChange({
          ...session,
          champion_name: name,
        });
      }
    },
    [session, onSessionChange]
  );

  const goNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setDirection(1);
      setCurrentIndex(i => i + 1);
    }
  }, [currentIndex, totalQuestions]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(i => i - 1);
    }
  }, [currentIndex]);

  // ── Animation Variants ──
  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  // ── Render Input for Current Question ──
  const renderInput = (q: CallModeQuestion) => {
    switch (q.inputType) {
      case 'pain-select':
        return <PainTagSelector selectedPains={selectedPains} onPainChange={onPainChange} />;

      case 'persona-select':
        return (
          <PersonaPillSelector
            selectedPersona={selectedPersona}
            stakeholderName={stakeholderName}
            onPersonaChange={onPersonaChange}
            onStakeholderNameChange={handleStakeholderNameChange}
          />
        );

      case 'textarea':
        return (
          <div className="max-w-lg mx-auto">
            <textarea
              value={session.bap_notes?.[q.bapQuestionId] ?? ''}
              onChange={e => {
                updateBapNote(q.bapQuestionId, e.target.value);
                // Also mark as 'yes' if there's text, 'no' if empty
                if (e.target.value.trim()) {
                  updateBapAnswer(q.bapQuestionId, 'yes');
                }
              }}
              placeholder="Capture their exact words..."
              rows={4}
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-100 transition-all resize-none"
            />
          </div>
        );

      case 'slider':
        return (
          <ScaleSlider
            value={getSliderValue(q.bapQuestionId)}
            onChange={v => updateSlider(q.bapQuestionId, v)}
          />
        );

      case 'yes-maybe-no':
        return (
          <YesMaybeNoButtons
            value={bapAnswers[q.bapQuestionId] ?? null}
            onChange={v => updateBapAnswer(q.bapQuestionId, v)}
          />
        );

      case 'call-sheet-select':
        return (
          <CallSheetSelect
            value={(session.call_sheet_answers?.['cm_current_approach'] as string) ?? ''}
            onChange={v => updateCallSheetAnswer('cm_current_approach', v)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto font-[Inter,system-ui,sans-serif]">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Phone size={16} className="text-emerald-600" />
          <span className="text-xs font-bold text-stone-500">
            Call Mode
          </span>
        </div>
        <button
          onClick={onSwitchToFull}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-500 bg-stone-100 hover:bg-stone-200 transition-colors"
        >
          Switch to Full View
        </button>
      </div>

      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-stone-500">
          {stageConfig.stageLabel} · Question {currentIndex + 1} of {totalQuestions}
        </p>
        <span className="text-xs font-bold text-stone-400">
          {stageConfig.checkpointLabel}: {checkpointScore.toFixed(1)}/{maxScore}
        </span>
      </div>

      {/* ── Progress Dots ── */}
      <ProgressDots total={totalQuestions} current={currentIndex} answered={answeredFlags} />

      {/* ── Question Card ── */}
      <div className="relative min-h-[340px] mb-6">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentQ.bapQuestionId + currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-stone-200 bg-white shadow-lg p-6 space-y-5"
          >
            {/* Title & Prompt */}
            <div className="text-center">
              <span className="inline-block text-[10px] font-bold text-stone-400 mb-2">
                {currentQ.title}
              </span>
              <h3 className="text-lg font-bold text-stone-900">{currentQ.prompt}</h3>
            </div>

            {/* Coaching Tip */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3"
            >
              <HelpCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed text-amber-800">
                <span className="font-bold">💡 Coaching:</span> {currentQ.coachingTip}
              </p>
            </motion.div>

            {/* Input Area */}
            <div>{renderInput(currentQ)}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Navigation Buttons ── */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
 currentIndex === 0
 ? 'text-stone-300 cursor-not-allowed'
 : 'text-stone-600 hover:bg-stone-100 active:bg-stone-200'
 }`}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {currentIndex < totalQuestions - 1 ? (
          <button
            onClick={goNext}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all bg-stone-900 text-white hover:bg-stone-800 shadow-md active:"
          >
            Next Question <ChevronRight size={16} />
          </button>
        ) : checkpointScore >= 7.5 && nextStageLabel ? (
          <button
            onClick={() => {
              const STAGE_ORDER = ['qualifying', 'investigating', 'evaluating', 'negotiating', 'contracting', 'signing'];
              const currentIdx = STAGE_ORDER.indexOf(session.deal_stage || 'qualifying');
              if (currentIdx < STAGE_ORDER.length - 1) {
                onSessionChange({ ...session, deal_stage: STAGE_ORDER[currentIdx + 1] });
                setCurrentIndex(0);
                setDirection(1);
              }
            }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-md active:"
          >
            ✅ Advance to {nextStageLabel} <ChevronRight size={16} />
          </button>
        ) : (
          <span className="text-xs font-medium text-stone-400 italic">
            {nextStageLabel ? `Score ${checkpointScore.toFixed(1)}/7.5 to advance` : 'Final stage'}
          </span>
        )}
      </div>

      {/* ── Checkpoint Progress ── */}
      <div className="mb-6">
        <CheckpointProgressBar
          checkpoint={stageConfig.checkpoint}
          label={stageConfig.checkpointLabel}
          score={checkpointScore}
          maxScore={maxScore}
        />
      </div>

      {/* ── Post-Call Quick Capture ── */}
      <PostCallQuickCapture session={session} onSessionChange={onSessionChange} />
    </div>
  );
}

export default CallMode;
