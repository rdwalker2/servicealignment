// ============================================================
// CallCompanionSidebar.tsx — Persistent sidebar for the Call Companion
// Shows current 4D phase, key scripts, BAP score thermometer,
// checkpoint status, and quick-access objection tracker.
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Target, Stethoscope, Presentation, Handshake,
  Flame, CheckCircle2, AlertTriangle, XCircle, MessageSquareQuote, Lightbulb,
  Shield,
} from 'lucide-react';
import type { DiscoverySession, BAPAnswer } from '../../lib/discoveryDatabase';
import { BAP_QUESTIONS, computeBAPAnswers, getCheckpointScore } from '../../lib/discoveryDatabase';

/* ------------------------------------------------------------------ */
/*  Types & Constants                                                  */
/* ------------------------------------------------------------------ */

export type DPhase = 'D1' | 'D2' | 'D3' | 'D4';

interface PhaseConfig {
  key: DPhase;
  label: string;
  subtitle: string;
  icon: typeof Target;
  color: string;
  bgGradient: string;
  checkpoint: 1 | 2 | 3;
  checkpointLabel: string;
  checkpointQuestion: string;
  goldenQuestion: string;
  keyScripts: string[];
}

const PHASE_CONFIGS: PhaseConfig[] = [
  {
    key: 'D1',
    label: 'Discovery',
    subtitle: 'Find the Pain',
    icon: Target,
    color: '#8b5cf6',
    bgGradient: 'from-violet-50 to-violet-100/50',
    checkpoint: 1,
    checkpointLabel: 'CP1 · Urgency Test',
    checkpointQuestion: 'Do they NEED to act?',
    goldenQuestion: '"What happens if you don\'t fix this in the next 90 days?"',
    keyScripts: [
      '"Why are we having this call today?"',
      '"On a scale of 1-10, how severe is this problem?"',
      '"Walk me through what happens when you get a new application today."',
      '"What would you do if you could wave a magic wand?"',
      '"How does your career page look on mobile right now?"',
    ],
  },
  {
    key: 'D2',
    label: 'Diagnosis',
    subtitle: 'Be the Doctor',
    icon: Stethoscope,
    color: '#3b82f6',
    bgGradient: 'from-blue-50 to-blue-100/50',
    checkpoint: 2,
    checkpointLabel: 'CP2 · Gap Test',
    checkpointQuestion: 'Do they need OUTSIDE help?',
    goldenQuestion: '"Based on what we\'ve discussed, do you feel your team has the tools and bandwidth to solve this?"',
    keyScripts: [
      '🔺 Price Trinity Step 1: Diagnose the BIGGER problem',
      '"What are the root causes? Technology, process, or people?"',
      '🔺 Price Trinity Step 2: Stack the ROI (vacancy + agency + admin + quality)',
      '"What ROI multiple do you expect — 3x, 5x, 20x?"',
      '🔺 Price Trinity Step 3: "On a scale of 1-10, how capable is your team of solving this alone?"',
    ],
  },
  {
    key: 'D3',
    label: 'Demonstrate',
    subtitle: 'Show YOUR Solution',
    icon: Presentation,
    color: '#f97316',
    bgGradient: 'from-orange-50 to-orange-100/50',
    checkpoint: 3,
    checkpointLabel: 'CP3 · Best Solution',
    checkpointQuestion: 'Are we undeniably THE solution?',
    goldenQuestion: '"On a scale of 1-10, how confident are you this is the right solution?"',
    keyScripts: [
      'Rule of 3: Connect each pain → feature → outcome',
      '"We helped [similar company] solve this exact problem..."',
      '"How can I help you build the internal case?"',
      '"What does your decision-maker need to see?"',
      'Arm the Champion: Give them slides, ROI, and language',
    ],
  },
  {
    key: 'D4',
    label: 'Decision',
    subtitle: 'Drive to Close',
    icon: Handshake,
    color: '#10b981',
    bgGradient: 'from-emerald-50 to-emerald-100/50',
    checkpoint: 3, // D4 uses CP3 as well
    checkpointLabel: '5 Alignment Checks',
    checkpointQuestion: 'All 5 checks aligned?',
    goldenQuestion: '"With alignment on all of that — are we the right solution?"',
    keyScripts: [
      '✅ 1. "Are we still aligned this is an urgent priority?"',
      '✅ 2. "Aligned your existing resources are not sufficient?"',
      '✅ 3. "Aligned on the problems to be solved & how we solve them?"',
      '✅ 4. "Aligned on outcomes & is the ROI sufficient?"',
      '✅ 5. "With alignment on all of that… are we the right solution?"',
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Helper: Derive current phase from deal_stage                       */
/* ------------------------------------------------------------------ */

export function derivePhase(dealStage: string): DPhase {
  switch (dealStage) {
    case 'qualifying':
    case 'investigating':
      return 'D1';
    case 'evaluating':
      return 'D2';
    case 'negotiating':
    case 'contracting':
      return 'D3';
    case 'signing':
      return 'D4';
    default:
      return 'D1';
  }
}

export function getPhaseConfig(phase: DPhase): PhaseConfig {
  return PHASE_CONFIGS.find(p => p.key === phase) ?? PHASE_CONFIGS[0];
}

/* ------------------------------------------------------------------ */
/*  BAP Score Thermometer                                              */
/* ------------------------------------------------------------------ */

function BAPThermometer({ session }: { session: DiscoverySession }) {
  const bapAnswers = computeBAPAnswers(session);
  const total = BAP_QUESTIONS.length;
  let yesCount = 0;
  let maybeCount = 0;
  for (const q of BAP_QUESTIONS) {
    const val = bapAnswers[q.id];
    if (val === 'yes') yesCount++;
    else if (val === 'maybe') maybeCount++;
  }
  const score = yesCount + maybeCount * 0.5;
  const pct = Math.round((score / total) * 100);
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : pct >= 25 ? '#f97316' : '#ef4444';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">BAP Score</span>
        <span className="text-xs font-bold tabular-nums" style={{ color }}>
          {pct}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-stone-200 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="flex items-center gap-3 text-[10px] text-stone-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> {yesCount} Yes
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> {maybeCount} Maybe
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-stone-300 inline-block" /> {total - yesCount - maybeCount} Open
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Checkpoint Status Row                                              */
/* ------------------------------------------------------------------ */

function CheckpointRow({
  num,
  label,
  score,
  maxScore,
  passed,
}: {
  num: number;
  label: string;
  score: number;
  maxScore: number;
  passed: boolean;
}) {
  const StatusIcon = passed ? CheckCircle2 : score >= maxScore * 0.5 ? AlertTriangle : XCircle;
  const statusColor = passed ? '#10b981' : score >= maxScore * 0.5 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex items-center gap-2.5">
      <StatusIcon size={14} style={{ color: statusColor }} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-stone-700 truncate">CP{num}: {label}</p>
      </div>
      <span className="text-[10px] font-bold tabular-nums" style={{ color: statusColor }}>
        {score.toFixed(1)}/{maxScore}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Sidebar Component                                             */
/* ------------------------------------------------------------------ */

interface CallCompanionSidebarProps {
  session: DiscoverySession;
  currentPhase: DPhase;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function CallCompanionSidebar({
  session,
  currentPhase,
  collapsed = false,
  onToggleCollapse,
}: CallCompanionSidebarProps) {
  const [showScripts, setShowScripts] = useState(true);
  const config = getPhaseConfig(currentPhase);

  // Compute checkpoint scores
  const bapAnswers = computeBAPAnswers(session);
  const cpScores = [1, 2, 3].map(cp => {
    const score = getCheckpointScore(bapAnswers, cp as 1 | 2 | 3);
    const maxScore = BAP_QUESTIONS.filter(q => q.checkpoint === cp).length * 2.5;
    return { score, maxScore, passed: score >= maxScore - 2.5 };
  });

  // Count open objections
  const openObjections = (session.objections ?? []).filter(o => o.status === 'open').length;

  if (collapsed) {
    return (
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 48 }}
        className="flex flex-col items-center py-4 gap-4 bg-stone-50 border-r border-stone-200 shrink-0"
      >
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-stone-200 transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight size={16} className="text-stone-500" />
        </button>
        {/* Phase icon */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${config.color}15`, color: config.color }}
        >
          <config.icon size={16} />
        </div>
        {/* Mini checkpoint dots */}
        <div className="flex flex-col gap-1.5">
          {cpScores.map((cp, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: cp.passed ? '#10b981' : cp.score >= cp.maxScore * 0.5 ? '#f59e0b' : '#e4e4e7',
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 280, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col bg-stone-50 border-r border-stone-200 shrink-0 overflow-hidden"
      style={{ width: 280 }}
    >
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {/* Collapse button */}
        <div className="flex justify-end">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-stone-200 transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft size={14} className="text-stone-400" />
          </button>
        </div>

        {/* Current Phase Card */}
        <div className={`rounded-xl bg-gradient-to-br ${config.bgGradient} border p-4`} style={{ borderColor: `${config.color}25` }}>
          <div className="flex items-center gap-2.5 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${config.color}20`, color: config.color }}
            >
              <config.icon size={16} />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: config.color }}>
                {config.key} · {config.label}
              </p>
              <p className="text-[10px] text-stone-500 font-medium">{config.subtitle}</p>
            </div>
          </div>
          {/* Checkpoint question */}
          <div className="mt-3 rounded-lg bg-white/70 border border-white/50 px-3 py-2">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Gate Question</p>
            <p className="text-xs font-semibold text-stone-700">{config.checkpointQuestion}</p>
          </div>
        </div>

        {/* Golden Question */}
        <div className="rounded-xl bg-amber-50 border border-amber-200/50 px-4 py-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Flame size={12} className="text-amber-500" />
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Power Question</span>
          </div>
          <p className="text-xs font-semibold text-amber-800 italic leading-relaxed">
            {config.goldenQuestion}
          </p>
        </div>

        {/* Key Scripts */}
        <div>
          <button
            onClick={() => setShowScripts(!showScripts)}
            className="flex items-center gap-1.5 mb-2 w-full"
          >
            <Lightbulb size={12} className="text-stone-400" />
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex-1 text-left">
              Key Scripts
            </span>
            <motion.div animate={{ rotate: showScripts ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight size={12} className="text-stone-300 rotate-90" />
            </motion.div>
          </button>
          <AnimatePresence>
            {showScripts && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-1.5">
                  {config.keyScripts.map((script, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded-lg bg-white border border-stone-100 px-3 py-2 hover:border-stone-200 transition-colors"
                    >
                      <MessageSquareQuote size={10} className="text-stone-300 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-stone-600 leading-relaxed">{script}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="border-t border-stone-200" />

        {/* BAP Thermometer */}
        <BAPThermometer session={session} />

        {/* Checkpoint Status */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Checkpoints</span>
          {cpScores.map((cp, i) => (
            <CheckpointRow
              key={i}
              num={i + 1}
              label={['Urgency', 'Gap', 'Solution'][i]}
              score={cp.score}
              maxScore={cp.maxScore}
              passed={cp.passed}
            />
          ))}
        </div>

        {/* Open Objections Badge */}
        {openObjections > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200/50 px-3 py-2">
            <Shield size={12} className="text-rose-500" />
            <span className="text-[11px] font-semibold text-rose-700">
              {openObjections} open objection{openObjections !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default CallCompanionSidebar;
