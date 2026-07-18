// ============================================================
// WeeklyTracker — Unified rep home: Dashboard + Weekly grid
// The single operating-rhythm view for AEs
// ============================================================
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, ChevronLeft, ChevronRight, ChevronDown,
  Check, Phone, Mail, MessageSquare, PhoneCall,
  CalendarPlus, Presentation, FileText, Trophy, DollarSign,
  Link2, ArrowDownToLine, Sparkles, Zap, ArrowRight,
  TrendingUp, TrendingDown, Minus, Target, Flame,
  XCircle, ThumbsDown, AlertTriangle,
} from 'lucide-react';
import { useAuth, REP_ID_TO_INITIALS, REP_PROFILES } from '../contexts/AuthContext';
import { useGoals } from '../hooks/useGoals';
import { useCycle } from '../hooks/useCycle';
import { useGoalStore } from '../lib/stores/goalStore';
import { useActualStore } from '../lib/stores/actualStore';
import { getWeeksInMonth, getCurrentWeekMonday } from '../lib/calendar';
import { getPaceStatus, getPaceColor, getPaceLabel } from '../lib/projections';
import { safeDiv } from '../lib/math';
import { fmtNum, fmtCurrency, fmtPct } from '../lib/format';
import {
  ALL_METRICS, METRIC_LABELS, MANUAL_ENTRY_METRICS, EMPTY_METRIC_ROW,
  FUNNEL_CONVERSION_PAIRS, type MetricKey, type MetricRow,
} from '../types';
import { getMonthlyQuota } from '../data/seedData';
import { getRepActivityForWeek } from '../lib/salesloft';


// ── Helpers ──

const METRIC_ICON_MAP: Record<string, React.ReactNode> = {
  dials: <Phone className="w-3.5 h-3.5" />,
  connects: <PhoneCall className="w-3.5 h-3.5" />,
  conversations: <Phone className="w-3.5 h-3.5" />,
  email_conversations: <Mail className="w-3.5 h-3.5" />,
  linkedin_conversations: <MessageSquare className="w-3.5 h-3.5" />,

  discovery_set: <CalendarPlus className="w-3.5 h-3.5" />,
  discovery_held: <Calendar className="w-3.5 h-3.5" />,
  disqualified: <XCircle className="w-3.5 h-3.5" />,
  demo_held: <Presentation className="w-3.5 h-3.5" />,
  proposal_sent: <FileText className="w-3.5 h-3.5" />,
  closed_won: <Trophy className="w-3.5 h-3.5" />,
  closed_lost: <ThumbsDown className="w-3.5 h-3.5" />,
  revenue: <DollarSign className="w-3.5 h-3.5" />,
};

const isCurrency = (k: MetricKey) => k === 'revenue';
const isActivity = (k: MetricKey) =>
  ['dials', 'connects', 'conversations', 'email_conversations', 'linkedin_conversations'].includes(k);

// ── Trend Arrow Component ──
function TrendArrow({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) return <span className="text-stone-300 text-[10px]">—</span>;
  const diff = current - previous;
  if (diff === 0) return <Minus className="w-3 h-3 text-stone-400 inline" />;
  return diff > 0 ? (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-500">
      <TrendingUp className="w-3 h-3" />+{diff}
    </span>
  ) : (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-400">
      <TrendingDown className="w-3 h-3" />{diff}
    </span>
  );
}

// ── Progress Ring Component ──
function ProgressRing({ pct, size = 48, stroke = 4 }: { pct: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const filled = Math.min(pct, 1) * circ;
  const color = pct >= 1 ? '#a7f3d0' : pct >= 0.7 ? '#d6d3d1' : pct >= 0.4 ? '#bfdbfe' : '#f5f5f4';
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#f5f5f4" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ - filled} strokeLinecap="round"
        className="transition-all duration-500" />
    </svg>
  );
}

function monthStr(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-01`;
}

function formatMonthYear(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function weekLabel(weekStart: string, _index: number): { num: string; range: string } {
  const start = new Date(weekStart + 'T00:00:00');
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  return {
    num: `W${_index + 1}`,
    range: `${fmt(start)}-${fmt(end)}`,
  };
}



// ── This Week Focus Bar ──

type FocusCardKey = 'conversations' | 'disco_set' | 'demo_held' | 'revenue';

function ThisWeekFocusBar({
  weeklyTargets,
  currentWeekActuals,
  businessDaysLeft,
  onLog,
  readOnly = false,
}: {
  weeklyTargets: { conversations: number; totalConvos: number; discovery_set: number; demo_held: number; revenue: number } | null;
  currentWeekActuals: Record<string, number>;
  businessDaysLeft: number;
  onLog: (updates: Record<string, number>) => void;
  readOnly?: boolean;
}) {
  const [openCard, setOpenCard] = useState<FocusCardKey | null>(null);
  const [draft, setDraft] = useState<Record<string, number>>({});

  if (!weeklyTargets) return null;

  // phone convos are SL-synced (read-only); email + linkedin are manual
  const phoneConvos = currentWeekActuals.conversations ?? 0;
  const emailConvos = currentWeekActuals.email_conversations ?? 0;
  const liConvos    = currentWeekActuals.linkedin_conversations ?? 0;
  const totalConvosActual = phoneConvos + emailConvos + liConvos;

  const items: { key: FocusCardKey; label: string; icon: React.ReactNode; actual: number; target: number; fmt: (n: number) => string; color: string }[] = [
    { key: 'conversations', label: 'Conversations', icon: <Phone className="w-3.5 h-3.5" />, actual: totalConvosActual, target: weeklyTargets.totalConvos || weeklyTargets.conversations, fmt: String, color: 'blue' },
    { key: 'disco_set',     label: 'Disco Set',     icon: <CalendarPlus className="w-3.5 h-3.5" />, actual: currentWeekActuals.discovery_set ?? 0, target: weeklyTargets.discovery_set, fmt: String, color: 'violet' },
    { key: 'demo_held',     label: 'Demo Held',     icon: <Presentation className="w-3.5 h-3.5" />, actual: currentWeekActuals.demo_held ?? 0, target: weeklyTargets.demo_held, fmt: String, color: 'emerald' },
    { key: 'revenue',       label: 'Revenue',       icon: <DollarSign className="w-3.5 h-3.5" />, actual: currentWeekActuals.revenue ?? 0, target: weeklyTargets.revenue, fmt: fmtCurrency, color: 'amber' },
  ];

  const colorMap: Record<string, { bg: string; activeBg: string; fill: string; text: string; light: string; border: string; activeBorder: string; ring: string }> = {
    blue:    { bg: 'bg-blue-50',    activeBg: 'bg-blue-50',    fill: 'bg-blue-500',    text: 'text-blue-700',    light: 'text-blue-500',    border: 'border-blue-100',   activeBorder: 'border-blue-300',   ring: 'ring-blue-200' },
    violet:  { bg: 'bg-violet-50',  activeBg: 'bg-violet-50',  fill: 'bg-violet-500',  text: 'text-violet-700',  light: 'text-violet-500',  border: 'border-violet-100', activeBorder: 'border-violet-300', ring: 'ring-violet-200' },
    emerald: { bg: 'bg-emerald-50', activeBg: 'bg-emerald-50', fill: 'bg-emerald-500', text: 'text-emerald-700', light: 'text-emerald-500', border: 'border-emerald-100',activeBorder: 'border-emerald-300',ring: 'ring-emerald-200' },
    amber:   { bg: 'bg-amber-50',   activeBg: 'bg-amber-50',   fill: 'bg-amber-500',   text: 'text-amber-700',   light: 'text-amber-500',   border: 'border-amber-100',  activeBorder: 'border-amber-300',  ring: 'ring-amber-200' },
  };

  const handleOpen = (key: FocusCardKey) => {
    if (openCard === key) { setOpenCard(null); return; }
    // Seed draft with current actuals
    if (key === 'conversations') {
      setDraft({ email_conversations: emailConvos, linkedin_conversations: liConvos });
    } else if (key === 'disco_set') {
      setDraft({ discovery_set: currentWeekActuals.discovery_set ?? 0 });
    } else if (key === 'demo_held') {
      setDraft({ demo_held: currentWeekActuals.demo_held ?? 0 });
    } else {
      setDraft({ revenue: currentWeekActuals.revenue ?? 0 });
    }
    setOpenCard(key);
  };

  const handleConfirm = () => {
    onLog(draft);
    setOpenCard(null);
  };

  const stepDraft = (field: string, delta: number) =>
    setDraft(prev => ({ ...prev, [field]: Math.max(0, (prev[field] ?? 0) + delta) }));

  return (
    <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">This Week</span>
          {!readOnly && <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">tap to log</span>}
          {readOnly && <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">team total</span>}
        </div>
        <span className="text-[10px] text-stone-400">
          {businessDaysLeft === 0 ? 'Week ends today' : `${businessDaysLeft} business day${businessDaysLeft !== 1 ? 's' : ''} left`}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {items.map(({ key, label, icon, actual, target, fmt, color }) => {
          const pct = target > 0 ? Math.min(actual / target, 1) : 0;
          const need = Math.max(0, target - actual);
          const isDone = actual >= target;
          const isWarning = pct < 0.5 && target > 0;
          const isOpen = openCard === key;
          const c = colorMap[color];

          return (
            <div
              key={key}
              className={`rounded-lg border transition-all duration-200 overflow-hidden ${
                readOnly
                  ? `${c.border} ${c.bg}`
                  : isOpen
                    ? `${c.activeBorder} ${c.activeBg} ring-2 ${c.ring} shadow-sm`
                    : `${c.border} ${c.bg} hover:shadow-sm cursor-pointer`
              }`}
            >
              {/* Card header — always visible, clickable (read-only in team view) */}
              <div
                className={`px-3 py-2.5 select-none ${readOnly ? '' : 'cursor-pointer'}`}
                onClick={() => { if (!readOnly) handleOpen(key); }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`flex items-center gap-1.5 ${c.light}`}>
                    {icon}
                    <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
                  </div>
                  {isDone ? (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Done
                    </span>
                  ) : !readOnly ? (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isOpen ? 'bg-stone-200 text-stone-600' : 'bg-stone-100/60 text-stone-400'
                    }`}>
                      {isOpen ? 'close' : '+ log'}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-base font-bold tabular-nums ${c.text}`}>{fmt(actual)}</span>
                  <span className="text-xs text-stone-400">/ {fmt(target)}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-stone-200/80 overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isDone ? 'bg-emerald-400' : isWarning ? 'bg-rose-400' : c.fill}`}
                    style={{ width: `${pct * 100}%` }}
                  />
                </div>
                {!isDone && target > 0 && (
                  <span className={`text-[10px] font-medium ${isWarning ? 'text-rose-500' : 'text-stone-500'}`}>
                    Need {fmt(need)} more
                  </span>
                )}
              </div>

              {/* Inline log panel — slides open (hidden in read-only team view) */}
              <AnimatePresence>
                {isOpen && !readOnly && (
                  <motion.div
                    key="log-panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 border-t border-stone-200/60 pt-2.5 bg-white/60 space-y-2">

                      {/* Conversations: email + linkedin inputs (phone is SL-synced) */}
                      {key === 'conversations' && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-stone-500 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-blue-400" /> Phone ({phoneConvos}) — auto-synced
                            </span>
                          </div>
                          {[
                            { field: 'email_conversations', label: 'Email' },
                            { field: 'linkedin_conversations', label: 'LinkedIn' },
                          ].map(({ field, label: fl }) => (
                            <div key={field} className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-medium text-stone-600 w-14">{fl}</span>
                              <div className="flex items-center gap-1.5 ml-auto">
                                <button onClick={() => stepDraft(field, -1)} className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 font-bold text-sm transition-colors">−</button>
                                <input
                                  type="number" min={0}
                                  value={draft[field] ?? 0}
                                  onChange={e => setDraft(prev => ({ ...prev, [field]: Math.max(0, parseInt(e.target.value) || 0) }))}
                                  className="w-12 text-center text-xs font-bold text-stone-800 bg-white border border-stone-200 rounded-md py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button onClick={() => stepDraft(field, 1)} className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 font-bold text-sm transition-colors">+</button>
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {/* Revenue: dollar input */}
                      {key === 'revenue' && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-stone-400 font-bold">$</span>
                          <input
                            type="number" min={0} step={500}
                            value={draft.revenue ?? 0}
                            onChange={e => setDraft({ revenue: Math.max(0, parseInt(e.target.value) || 0) })}
                            className="flex-1 text-right text-sm font-bold text-amber-700 bg-white border border-amber-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-300 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      )}

                      {/* Integer metrics: +/- stepper */}
                      {key !== 'conversations' && key !== 'revenue' && (() => {
                        const field = key === 'disco_set' ? 'discovery_set' : 'demo_held';
                        return (
                          <div className="flex items-center gap-2 justify-center">
                            <button onClick={() => stepDraft(field, -1)} className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 font-bold text-base transition-colors">−</button>
                            <input
                              type="number" min={0}
                              value={draft[field] ?? 0}
                              onChange={e => setDraft({ [field]: Math.max(0, parseInt(e.target.value) || 0) })}
                              className="w-16 text-center text-lg font-bold text-stone-800 bg-white border border-stone-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-violet-300 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button onClick={() => stepDraft(field, 1)} className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 font-bold text-base transition-colors">+</button>
                          </div>
                        );
                      })()}

                      {/* Confirm button */}
                      <button
                        onClick={handleConfirm}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold text-white transition-colors ${
                          color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
                          color === 'violet' ? 'bg-violet-500 hover:bg-violet-600' :
                          color === 'emerald' ? 'bg-emerald-500 hover:bg-emerald-600' :
                          'bg-amber-500 hover:bg-amber-600'
                        }`}
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          <Check className="w-3.5 h-3.5" /> Log it
                        </span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MTD Progress Bars ──

function MTDProgressBars({
  monthTotal,
  goal,
  pctThrough,
}: {
  monthTotal: Record<string, number>;
  goal: Record<string, number> | null | undefined;
  pctThrough: number;
}) {
  if (!goal) return null;

  const items = [
    { key: 'conversations', label: 'Convos MTD', fmt: (n: number) => String(n) },
    { key: 'discovery_set', label: 'Disco Set MTD', fmt: (n: number) => String(n) },
    { key: 'demo_held', label: 'Demos MTD', fmt: (n: number) => String(n) },
    { key: 'revenue', label: 'Revenue MTD', fmt: fmtCurrency },
  ];

  return (
    <div className="px-5 py-3 border-b border-stone-100 bg-white">
      <div className="flex items-center gap-6">
        {items.map(({ key, label, fmt }) => {
          // For conversations, sum all channels
          const actual = key === 'conversations'
            ? ((monthTotal.conversations ?? 0) + (monthTotal.email_conversations ?? 0) + (monthTotal.linkedin_conversations ?? 0))
            : (monthTotal[key] ?? 0);
          const goalVal = key === 'conversations'
            ? ((goal.conversations ?? 0) + ((goal as any).email_conversations ?? 0) + ((goal as any).linkedin_conversations ?? 0))
            : (goal[key] ?? 0);
          if (goalVal === 0) return null;
          const pct = Math.min(actual / goalVal, 1);
          const pace = getPaceStatus(actual / goalVal, pctThrough);
          const paceColor = getPaceColor(pace);
          return (
            <div key={key} className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-stone-500 truncate">{label}</span>
                <span className="text-[10px] font-bold tabular-nums" style={{ color: paceColor }}>
                  {fmt(actual)} / {fmt(goalVal)}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct * 100}%`, backgroundColor: paceColor }}
                />
              </div>
            </div>
          );
        })}
        {/* Pct through month marker */}
        <div className="shrink-0 text-right">
          <span className="text-[9px] text-stone-400 block">Month</span>
          <span className="text-xs font-bold text-stone-600">{Math.round(pctThrough * 100)}% thru</span>
        </div>
      </div>
    </div>
  );
}

// ── Gap Rate Banner ──

function GapRateBanner({
  monthTotal,
  goal,
}: {
  monthTotal: Record<string, number>;
  goal: Record<string, number> | null | undefined;
}) {
  if (!goal) return null;

  const safeDiv = (a: number, b: number) => b > 0 ? a / b : 0;

  const rates = [
    {
      label: 'Show Rate',
      desc: 'discoveries held vs set',
      actual: safeDiv(monthTotal.discovery_held ?? 0, monthTotal.discovery_set ?? 0),
      goal: safeDiv(goal.discovery_held ?? 0, goal.discovery_set ?? 0),
      volume: monthTotal.discovery_set ?? 0,
      minVolume: 2,
      advice: 'Reduce no-shows — send a reminder + agenda 24hr before each discovery.',
    },
    {
      label: 'Scheduled Rate',
      desc: 'conversations → discovery set',
      actual: safeDiv(monthTotal.discovery_set ?? 0, (monthTotal.conversations ?? 0) + (monthTotal.email_conversations ?? 0) + (monthTotal.linkedin_conversations ?? 0)),
      goal: safeDiv(goal.discovery_set ?? 0, (goal.conversations ?? 0) + ((goal as any).email_conversations ?? 0) + ((goal as any).linkedin_conversations ?? 0)),
      volume: (monthTotal.conversations ?? 0) + (monthTotal.email_conversations ?? 0) + (monthTotal.linkedin_conversations ?? 0),
      minVolume: 3,
      advice: 'Improve your ask — lead with impact, not a pitch. Practice the booking close.',
    },
    {
      label: 'Proposal Rate',
      desc: 'disco held → demo held',
      actual: safeDiv(monthTotal.demo_held ?? 0, monthTotal.discovery_held ?? 0),
      goal: safeDiv(goal.demo_held ?? 0, goal.discovery_held ?? 0),
      volume: monthTotal.discovery_held ?? 0,
      minVolume: 2,
      advice: 'More discoveries should advance to demo — nail the discovery call outcome.',
    },
    {
      label: 'Close Rate',
      desc: 'demo held → closed won',
      actual: safeDiv(monthTotal.closed_won ?? 0, monthTotal.demo_held ?? 0),
      goal: safeDiv(goal.closed_won ?? 0, goal.demo_held ?? 0),
      volume: monthTotal.demo_held ?? 0,
      minVolume: 2,
      advice: 'Work your late-stage deals — identify the decision-maker and create urgency.',
    },
  ];

  // Find the biggest gap (only where volume is sufficient and gap > 10pp)
  const worst = rates
    .filter((r) => r.volume >= r.minVolume && r.goal > 0 && r.goal - r.actual > 0.10)
    .sort((a, b) => (b.goal - b.actual) - (a.goal - a.actual))[0];

  if (!worst) return null;

  return (
    <div className="mx-5 mt-3 mb-1 flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200">
      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-xs font-bold text-amber-800">
            ⚠ Your {worst.label} is {fmtPct(worst.actual)} vs your {fmtPct(worst.goal)} goal
          </span>
          <span className="text-[10px] text-amber-600">({worst.desc})</span>
          <span className="ml-auto text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">#1 Lever</span>
        </div>
        <p className="text-[11px] text-amber-700 mt-0.5">{worst.advice}</p>
      </div>
    </div>
  );
}

// ── Pace Badge ──

function PaceBadge({ pace }: { pace: ReturnType<typeof getPaceStatus> }) {
  const color = getPaceColor(pace);
  const label = getPaceLabel(pace);
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{
        backgroundColor: `${color}15`,
        color,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

// ── Main Component ──

export default function WeeklyTracker() {
  const { effectiveUser, isAdmin, isImpersonating } = useAuth();
  const repId = effectiveUser?.id ?? '';

  // Team aggregate mode: admin viewing without impersonating a rep
  const isTeamView = isAdmin && !isImpersonating;

  // 90-day cycle awareness
  const { activeCycle } = useCycle(repId);
  const allGoals = useGoalStore((s) => s.goals);

  // Month navigation
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

  const currentMonthStr = monthStr(selectedYear, selectedMonth);
  const { goal: repGoal } = useGoals(repId, currentMonthStr);

  // In team view, sum goals across all reps for this month
  // NOTE: derive from allGoals (already selected) in useMemo — never call .filter() inside a
  // Zustand selector or it returns a new array every render causing an infinite loop.
  const teamGoal = useMemo((): MetricRow | null => {
    if (!isTeamView) return null;
    const goalsForMonth = Object.values(allGoals).filter(g => g.month === currentMonthStr);
    if (goalsForMonth.length === 0) return null;
    const sum: MetricRow = { ...EMPTY_METRIC_ROW };
    for (const g of goalsForMonth) {
      for (const k of ALL_METRICS) {
        (sum as any)[k] += (g as any)[k] ?? 0;
      }
    }
    return sum;
  }, [isTeamView, allGoals, currentMonthStr]);

  const goal = isTeamView ? teamGoal : repGoal;

  // Cycle context: which month of M1/M2/M3 are we viewing?
  const cycleContext = useMemo(() => {
    if (!activeCycle) return null;
    const planMonths = activeCycle.months; // [string, string, string]
    const monthIdx = planMonths.indexOf(currentMonthStr);
    const isInPlan = monthIdx >= 0;

    // Calculate overall cycle progress
    const cycleStart = new Date(planMonths[0]);
    const cycleEnd = new Date(planMonths[2]);
    cycleEnd.setMonth(cycleEnd.getMonth() + 1); // end of M3
    const totalDays = (cycleEnd.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24);
    const daysIn = Math.max(0, (now.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24));
    const pctThrough90 = Math.min(daysIn / totalDays, 1);
    const daysLeft = Math.max(0, Math.ceil(totalDays - daysIn));

    return {
      planMonths,
      monthIdx,       // -1 if not in plan, 0/1/2 if viewing M1/M2/M3
      isInPlan,
      pctThrough90,
      daysLeft,
      focusArea: activeCycle.focus_area,
    };
  }, [activeCycle, currentMonthStr, now]);

  // Weeks in this month
  const weeks = useMemo(
    () => getWeeksInMonth(selectedYear, selectedMonth),
    [selectedYear, selectedMonth],
  );
  const currentWeekMonday = getCurrentWeekMonday();

  // All actuals from store
  const allActuals = useActualStore((s) => s.actuals);
  const saveActual = useActualStore((s) => s.saveActual);

  // In team view, aggregate all reps' actuals per week
  const teamWeekActuals = useMemo(() => {
    if (!isTeamView) return null;
    return weeks.map((ws) => {
      const repIds = REP_PROFILES.map(r => r.id);
      const sum: MetricRow = { ...EMPTY_METRIC_ROW };
      for (const rid of repIds) {
        const key = `${rid}_${ws}`;
        const a = allActuals[key];
        if (!a) continue;
        for (const k of ALL_METRICS) {
          (sum as any)[k] += (a as any)[k] ?? 0;
        }
      }
      return sum;
    });
  }, [isTeamView, weeks, allActuals]);

  // Get actuals for each week (rep view)
  const repWeekActuals = useMemo(() => {
    return weeks.map((ws) => {
      const key = `${repId}_${ws}`;
      return allActuals[key] ?? null;
    });
  }, [weeks, repId, allActuals]);

  const weekActuals = isTeamView ? (teamWeekActuals ?? []) : repWeekActuals;

  // Quick Entry state — keyed by week_start so any past/current week can be edited
  const [savedThisSession, setSavedThisSession] = useState(false);

  // Conversation channels accordion (collapsed by default)
  const [convosExpanded, setConvosExpanded] = useState(false);

  // Initialize quickEntry from all existing week actuals in this month (rep view only)
  const [quickEntry, setQuickEntry] = useState<Record<string, Record<string, number>>>(() => {
    if (isTeamView) return {}; // team view never edits
    const init: Record<string, Record<string, number>> = {};
    for (const ws of weeks) {
      const key = `${repId}_${ws}`;
      const existing = allActuals[key];
      const weekInit: Record<string, number> = {};
      for (const k of MANUAL_ENTRY_METRICS) {
        weekInit[k] = existing?.[k] ?? 0;
      }
      init[ws] = weekInit;
    }
    return init;
  });

  // Sync quickEntry when navigating months or when store data changes externally
  useEffect(() => {
    setQuickEntry((prev) => {
      const next: Record<string, Record<string, number>> = {};
      for (const ws of weeks) {
        const key = `${repId}_${ws}`;
        const existing = allActuals[key];
        const weekInit: Record<string, number> = {};
        for (const k of MANUAL_ENTRY_METRICS) {
          // Keep user edits if they exist for this week, otherwise use stored value
          weekInit[k] = prev[ws]?.[k] ?? existing?.[k] ?? 0;
        }
        next[ws] = weekInit;
      }
      return next;
    });
  }, [weeks, repId, allActuals]);

  // Monthly total (merges quickEntry for rep view; sums teamWeekActuals for team view)
  const monthTotal = useMemo((): MetricRow => {
    const result: MetricRow = { ...EMPTY_METRIC_ROW };
    if (isTeamView) {
      for (const wa of teamWeekActuals ?? []) {
        for (const key of ALL_METRICS) {
          (result as any)[key] += (wa as any)?.[key] ?? 0;
        }
      }
    } else {
      for (let wi = 0; wi < weeks.length; wi++) {
        const ws = weeks[wi];
        const wa = weekActuals[wi];
        const weekEdits = quickEntry[ws];
        for (const key of ALL_METRICS) {
          if (weekEdits && (MANUAL_ENTRY_METRICS as readonly string[]).includes(key)) {
            (result as any)[key] += weekEdits[key] ?? (wa as any)?.[key] ?? 0;
          } else {
            (result as any)[key] += (wa as any)?.[key] ?? 0;
          }
        }
      }
    }
    return result;
  }, [isTeamView, teamWeekActuals, weekActuals, weeks, quickEntry]);


  // Pct through month
  const currentWeekIdx = weeks.indexOf(currentWeekMonday);
  const pctThrough = weeks.length > 0
    ? Math.min((currentWeekIdx + 1) / weeks.length, 1)
    : 0;

  // ── Auto-Sync SalesLoft Data ──
  const [isSyncingSL, setIsSyncingSL] = useState(false);
  
  useEffect(() => {
    if (!repId || weeks.length === 0) return;
    
    let isMounted = true;
    
    async function syncSalesloft() {
      setIsSyncingSL(true);
      
      const updates: Record<string, any> = {};
      
      // Only sync the CURRENT active week so we don't constantly overwrite historical data
      const weeksToSync = weeks.filter(ws => ws === currentWeekMonday);
      
      const results = await Promise.all(
        weeksToSync.map(ws => getRepActivityForWeek(repId, ws).then(res => ({ ws, data: res })))
      );
      
      for (const res of results) {
        if (res.data) {
          updates[res.ws] = res.data;
        }
      }
      
      if (!isMounted) return;
      
      // Merge updates into quickEntry
      if (Object.keys(updates).length > 0) {
        setQuickEntry(prev => {
          const next = { ...prev };
          let changed = false;
          
          for (const [ws, data] of Object.entries(updates)) {
            const current = next[ws] || {};
            // Only update if numbers are different to prevent infinite save loops
            if (current.dials !== data.dials || 
                current.conversations !== data.conversations || 
                current.emails_sent !== data.emails_sent) {
              
              next[ws] = {
                ...current,
                dials: data.dials,
                conversations: data.conversations,
                emails_sent: data.emails_sent,
              };
              changed = true;
            }
          }
          
          if (changed) {
            // Trigger auto-save by simulating a user edit
            userEditedRef.current = true;
          }
          return changed ? next : prev;
        });
      }
      
      setIsSyncingSL(false);
    }
    
    syncSalesloft();
    
    return () => { isMounted = false; };
  }, [repId, weeks, currentWeekMonday]);

  // ── Auto-save with debounce ──
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const userEditedRef = useRef(false); // Only true when user types in an input

  const doSave = useCallback(() => {
    // Save every week that has quickEntry edits
    for (const ws of weeks) {
      const weekEdits = quickEntry[ws];
      if (!weekEdits) continue;

      const existingKey = `${repId}_${ws}`;
      const existing = allActuals[existingKey];
      const base = existing ?? {
        rep_id: repId,
        week_start: ws,
        ...EMPTY_METRIC_ROW,
        notes: null,
        submitted_at: null,
      };

      const toSave = {
        rep_id: repId,
        week_start: ws,
        dials: weekEdits.dials ?? base.dials,
        connects: weekEdits.connects ?? base.connects,
        conversations: weekEdits.conversations ?? base.conversations,
        emails_sent: base.emails_sent ?? 0,
        email_conversations: weekEdits.email_conversations ?? base.email_conversations ?? 0,
        linkedin_conversations: weekEdits.linkedin_conversations ?? base.linkedin_conversations ?? 0,
        linkedin_touches: base.linkedin_touches ?? 0,
        discovery_set: weekEdits.discovery_set ?? base.discovery_set,
        discovery_held: weekEdits.discovery_held ?? base.discovery_held,
        disqualified: weekEdits.disqualified ?? base.disqualified ?? 0,
        demo_held: weekEdits.demo_held ?? base.demo_held,
        proposal_sent: weekEdits.proposal_sent ?? base.proposal_sent,
        closed_won: weekEdits.closed_won ?? base.closed_won,
        closed_lost: weekEdits.closed_lost ?? base.closed_lost ?? 0,
        revenue: weekEdits.revenue ?? base.revenue,
        notes: base.notes ?? null,
        submitted_at: new Date().toISOString(),
      };

      saveActual(toSave);
    }

    userEditedRef.current = false; // Reset after save
    setAutoSaveStatus('saved');
    setSavedThisSession(true);
    setTimeout(() => { setAutoSaveStatus('idle'); setSavedThisSession(false); }, 2500);
  }, [quickEntry, weeks, repId, allActuals, saveActual]);

  // Debounced auto-save: only fires when user has actually edited an input
  useEffect(() => {
    if (!userEditedRef.current) return; // Skip sync-triggered updates
    setAutoSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => doSave(), 1000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [quickEntry, doSave]);

  // Previous week actuals for momentum arrows
  const prevWeekIdx = currentWeekIdx > 0 ? currentWeekIdx - 1 : -1;
  const prevWeekActuals = prevWeekIdx >= 0 ? weekActuals[prevWeekIdx] : null;

  // This week's target and remaining (for hero card)
  const weeklyTargets = useMemo(() => {
    if (!goal || weeks.length === 0) return null;
    const wkCount = weeks.length;
    return {
      dials: Math.round((goal.dials ?? 0) / wkCount),
      connects: Math.round((goal.connects ?? 0) / wkCount),
      conversations: Math.round((goal.conversations ?? 0) / wkCount),
      email_conversations: Math.round(((goal as any).email_conversations ?? 0) / wkCount),
      linkedin_conversations: Math.round(((goal as any).linkedin_conversations ?? 0) / wkCount),
      totalConvos: Math.round(((goal.conversations ?? 0) + ((goal as any).email_conversations ?? 0) + ((goal as any).linkedin_conversations ?? 0)) / wkCount),
      discovery_set: Math.round((goal.discovery_set ?? 0) / wkCount),
    };
  }, [goal, weeks]);

  // Days remaining in current week (Mon-Fri)
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  const businessDaysLeft = dayOfWeek >= 1 && dayOfWeek <= 5 ? 5 - dayOfWeek : dayOfWeek === 0 ? 5 : 0;

  // Month navigation
  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedYear(selectedYear - 1);
      setSelectedMonth(11);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };
  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedYear(selectedYear + 1);
      setSelectedMonth(0);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  if (!effectiveUser) return null;

  // Current week actuals for the focus bar
  const currentWeekActualsRaw = quickEntry[currentWeekMonday] ?? {};

  // Handler: focus bar logs directly into quickEntry for current week
  const handleFocusBarLog = useCallback((updates: Record<string, number>) => {
    userEditedRef.current = true;
    setQuickEntry(prev => ({
      ...prev,
      [currentWeekMonday]: { ...(prev[currentWeekMonday] ?? {}), ...updates },
    }));
  }, [currentWeekMonday]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Month Selector */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1 hover:bg-stone-100 rounded transition-colors">
              <ChevronLeft className="w-4 h-4 text-stone-500" />
            </button>
            <Calendar className="w-4 h-4 text-stone-400" />
            <span className="text-sm font-bold text-stone-800">
              {formatMonthYear(selectedYear, selectedMonth)}
            </span>
            {cycleContext && cycleContext.monthIdx >= 0 && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                cycleContext.monthIdx === 0 ? 'bg-stone-100 text-stone-600' :
                cycleContext.monthIdx === 1 ? 'bg-stone-100 text-stone-600' :
                'bg-stone-100 text-stone-600'
              }`}>
                M{cycleContext.monthIdx + 1} of 3
              </span>
            )}
            <button onClick={nextMonth} className="p-1 hover:bg-stone-100 rounded transition-colors">
              <ChevronRight className="w-4 h-4 text-stone-500" />
            </button>
            {/* Quota Badge / Team Overview tag */}
            {isTeamView ? (
              <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-100">
                <Target className="w-3 h-3" />
                Team Overview — {REP_PROFILES.length} reps
              </span>
            ) : (() => {
              const q = getMonthlyQuota(REP_ID_TO_INITIALS[repId] ?? '', currentMonthStr);
              const isAdjusted = q < 11250;
              return (
                <span className={`ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                  isAdjusted
                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : 'bg-stone-50 text-stone-600 border border-stone-100'
                }`}>
                  <DollarSign className="w-3 h-3" />
                  Quota: {fmtCurrency(q)}
                  {isAdjusted && <span className="text-[8px] opacity-70">(adj)</span>}
                </span>
              );
            })()}
          </div>
          {/* Auto-save indicator (replaces manual save button) */}
          <AnimatePresence mode="wait">
            {autoSaveStatus === 'saving' && (
              <motion.span key="grid-saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-xs text-stone-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Saving…
              </motion.span>
            )}
            {autoSaveStatus === 'saved' && (
              <motion.span key="grid-saved" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="text-xs text-emerald-500 flex items-center gap-1.5 font-bold">
                <Check className="w-3.5 h-3.5" /> Saved
              </motion.span>
            )}
            {autoSaveStatus === 'idle' && isSyncingSL && (
              <motion.span key="grid-syncing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-xs text-blue-500 flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Syncing SalesLoft...
              </motion.span>
            )}
            {autoSaveStatus === 'idle' && !isSyncingSL && (
              <motion.span key="grid-idle" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
                className="text-[10px] text-stone-300">Auto-saves as you type</motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* This Week Focus Bar */}
        <ThisWeekFocusBar
          weeklyTargets={weeklyTargets}
          currentWeekActuals={currentWeekActualsRaw}
          businessDaysLeft={businessDaysLeft}
          onLog={handleFocusBarLog}
          readOnly={isTeamView}
        />

        {/* MTD Progress Bars */}
        <MTDProgressBars
          monthTotal={monthTotal as unknown as Record<string, number>}
          goal={goal as unknown as Record<string, number> | null}
          pctThrough={pctThrough}
        />


        {/* Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/50">
                <th className="text-left px-4 py-2.5 font-bold text-stone-500 uppercase tracking-wider w-36 sticky left-0 bg-stone-50/50 z-10">
                  Metric
                </th>
                <th className="text-right px-2 py-2.5 font-bold text-stone-500 w-16">Goal</th>
                <th className="text-right px-2 py-2.5 font-bold text-stone-500 w-14">Wk Target</th>
                {weeks.map((ws, i) => {
                  const wl = weekLabel(ws, i);
                  return (
                    <th
                      key={ws}
                      className={`text-center px-1 py-2 font-bold w-[4.5rem] ${
                        ws === currentWeekMonday
                          ? 'text-blue-700 bg-blue-50/50'
                          : 'text-stone-500'
                      }`}
                    >
                      <div className="leading-tight">{wl.num}</div>
                      <div className={`text-[9px] font-medium leading-tight ${
                        ws === currentWeekMonday ? 'text-blue-500' : 'text-stone-400'
                      }`}>{wl.range}</div>
                    </th>
                  );
                })}
                <th className="text-right px-2 py-2.5 font-bold text-stone-700 w-16">Total</th>
                <th className="text-center px-2 py-2.5 font-bold text-stone-500 w-14">Trend</th>
                <th className="text-right px-2 py-2.5 font-bold text-stone-500 w-12">%</th>
                <th className="text-center px-2 py-2.5 font-bold text-stone-500 w-16">Pace</th>
              </tr>
            </thead>
            <tbody>
              {/* Render metrics with conversation channel grouping */}
              {(() => {
                // Metrics to render in order, with special handling for conversations
                const CONVO_CHANNELS: MetricKey[] = ['conversations', 'email_conversations', 'linkedin_conversations'];
                const HIDDEN_METRICS: MetricKey[] = ['dials', 'connects', 'proposal_sent', 'emails_sent', 'linkedin_touches'];  // dials/connects replaced by conversations; proposal_sent redundant; emails/linkedin activity auto-synced from SalesLoft
                const CONVO_LABELS: Record<string, string> = {
                  conversations: 'Phone Conversations',
                  email_conversations: 'Email Conversations',
                  linkedin_conversations: 'LinkedIn Conversations',
                };

                // Build ordered list excluding convo channels (rendered in group) and hidden metrics
                const orderedMetrics = ALL_METRICS.filter(k => !CONVO_CHANNELS.includes(k) && !HIDDEN_METRICS.includes(k));

                // Insert conversation group at the top (position 0, right after the Outbound Activity header)
                const insertAt = 0;

                const renderMetricRow = (key: MetricKey, label?: string, isSubRow?: boolean, isComputedTotal?: boolean) => {
                  // For total conversations, compute from channels
                  const goalVal = isComputedTotal
                    ? (goal?.conversations ?? 0) + ((goal as any)?.email_conversations ?? 0) + ((goal as any)?.linkedin_conversations ?? 0)
                    : (goal?.[key] ?? 0);
                  const weeklyTarget = weeks.length > 0 ? Math.round(goalVal / weeks.length) : 0;
                  const total = isComputedTotal
                    ? monthTotal.conversations + monthTotal.email_conversations + monthTotal.linkedin_conversations
                    : monthTotal[key];
                  const pct = goalVal > 0 ? total / goalVal : 0;
                  const pace = getPaceStatus(pct, pctThrough);

                  return (
                    <tr
                      key={isComputedTotal ? 'total_conversations' : key}
                      className={`border-b border-stone-50 hover:bg-stone-50/30 transition-colors ${
                        isComputedTotal ? 'bg-stone-50/30 font-semibold' : ''
                      }`}
                    >
                      {/* Metric Label */}
                      <td className={`px-4 py-2 font-medium sticky left-0 z-10 ${
                        isComputedTotal ? 'bg-stone-50/30 text-stone-800' :
                        isSubRow ? 'bg-white text-stone-600 pl-8' : 'bg-white text-stone-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          {!isComputedTotal && (
                            <span className="text-stone-400">{METRIC_ICON_MAP[key]}</span>
                          )}
                          {isComputedTotal ? 'Total Conversations' : (label || METRIC_LABELS[key])}
                        </div>
                      </td>

                      {/* Monthly Goal */}
                      <td className={`text-right px-2 py-2 font-bold tabular-nums ${
                        isComputedTotal ? 'text-stone-800' : 'text-stone-800'
                      }`}>
                        {isCurrency(key) ? fmtCurrency(goalVal) : fmtNum(goalVal)}
                      </td>

                      {/* Weekly Target */}
                      <td className="text-right px-2 py-2 text-stone-500 tabular-nums">
                        {isCurrency(key) ? fmtCurrency(weeklyTarget) : fmtNum(weeklyTarget)}
                      </td>

                      {/* Week columns */}
                      {weeks.map((ws, wi) => {
                        const storedActual = isComputedTotal
                          ? ((weekActuals[wi]?.conversations ?? 0) + (weekActuals[wi]?.email_conversations ?? 0) + (weekActuals[wi]?.linkedin_conversations ?? 0))
                          : (weekActuals[wi]?.[key] ?? 0);
                        const isCurrent = ws === currentWeekMonday;
                        const isFuture = ws > currentWeekMonday;
                        const isEditable = !isFuture && !isComputedTotal && (MANUAL_ENTRY_METRICS as readonly string[]).includes(key);

                        // Use quickEntry state for editable weeks, otherwise stored actual
                        const weekEdits = quickEntry[ws];
                        const displayActual = !isFuture && !isComputedTotal && weekEdits
                          ? (weekEdits[key] ?? storedActual)
                          : isComputedTotal && !isFuture && weekEdits
                            ? ((weekEdits.conversations ?? weekActuals[wi]?.conversations ?? 0) + (weekEdits.email_conversations ?? weekActuals[wi]?.email_conversations ?? 0) + (weekEdits.linkedin_conversations ?? weekActuals[wi]?.linkedin_conversations ?? 0))
                            : storedActual;

                        const weekPct = weeklyTarget > 0 ? displayActual / weeklyTarget : 0;

                        let cellBg = '';
                        if (!isFuture && weeklyTarget > 0 && displayActual > 0) {
                          if (weekPct >= 1) cellBg = 'bg-emerald-50/50';
                          else if (weekPct >= 0.7) cellBg = 'bg-stone-50';
                          else cellBg = 'bg-rose-50/50';
                        }

                        if (isEditable && !isTeamView) {
                          return (
                            <td
                              key={ws}
                              className={`px-1 py-1 ${
                                isCurrent
                                  ? 'border-l border-r border-stone-300 bg-blue-50/30'
                                  : 'bg-stone-50/30'
                              }`}
                            >
                              <div className="relative group">
                                <input
                                  type="number"
                                  value={(weekEdits?.[key] ?? storedActual) || ''}
                                  onChange={(e) => {
                                    const v = Math.max(0, parseInt(e.target.value) || 0);
                                    userEditedRef.current = true;
                                    setQuickEntry((prev) => ({
                                      ...prev,
                                      [ws]: { ...(prev[ws] ?? {}), [key]: v },
                                    }));
                                    setSavedThisSession(false);
                                  }}
                                  min={0}
                                  className={`w-full border rounded px-1.5 py-1 text-right text-xs font-medium text-stone-800 tabular-nums focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                    isCurrent
                                      ? 'bg-white border-blue-200'
                                      : 'bg-white border-stone-200'
                                  }`}
                                />
                              </div>
                            </td>
                          );
                        }

                        return (
                          <td
                            key={ws}
                            className={`text-right px-2 py-2 tabular-nums ${
                              isCurrent ? 'border-l border-r border-stone-300 bg-blue-50/30 font-medium text-stone-800' :
                              isFuture ? 'text-stone-300' :
                              `text-stone-600 ${cellBg}`
                            }`}
                          >
                            {isFuture ? '—' : isCurrency(key) ? fmtCurrency(displayActual) : displayActual === 0 ? '—' : fmtNum(displayActual)}
                          </td>
                        );
                      })}

                      {/* Total */}
                      <td className={`text-right px-2 py-2 font-bold tabular-nums ${
                        isComputedTotal ? 'text-stone-900' : 'text-stone-800'
                      }`}>
                        {isCurrency(key) ? fmtCurrency(total) : fmtNum(total)}
                      </td>

                      {/* WoW Trend Arrow */}
                      <td className="text-center px-2 py-2">
                        {(() => {
                          if (!prevWeekActuals || isComputedTotal) return <span className="text-stone-300 text-[10px]">—</span>;
                          const currWeekVal = isComputedTotal
                            ? 0
                            : (weekActuals[currentWeekIdx]?.[key] ?? quickEntry[key] ?? 0);
                          const prevVal = prevWeekActuals[key] ?? 0;
                          return <TrendArrow current={currWeekVal} previous={prevVal} />;
                        })()}
                      </td>

                      {/* % */}
                      <td className="text-right px-2 py-2 tabular-nums text-stone-600">
                        {goalVal > 0 ? fmtPct(pct) : '—'}
                      </td>

                      {/* Pace */}
                      <td className="text-center px-2 py-2">
                        {goalVal > 0 ? <PaceBadge pace={pace} /> : <span className="text-stone-300">—</span>}
                      </td>
                    </tr>
                  );
                };

                const rows: React.ReactNode[] = [];
                let metricIdx = 0;

                // Add outbound activity header at the top
                rows.push(
                  <tr key="ob-activity-header">
                    <td colSpan={weeks.length + 7} className="px-4 py-1.5 bg-stone-50/80">
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Outbound Activity</span>
                    </td>
                  </tr>
                );

                for (let i = 0; i <= orderedMetrics.length; i++) {
                  // Insert conversation group at the right position
                  if (i === insertAt) {
                    // Section header with chevron
                    rows.push(
                      <tr key="convo-header">
                        <td
                          colSpan={weeks.length + 7}
                          className="px-4 py-1.5 bg-stone-50/80 cursor-pointer select-none"
                          onClick={() => setConvosExpanded(!convosExpanded)}
                        >
                          <div className="flex items-center gap-1">
                            <ChevronDown
                              className={`w-3 h-3 text-stone-400 transition-transform duration-200 ${convosExpanded ? '' : '-rotate-90'}`}
                            />
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Conversations by Channel</span>
                          </div>
                        </td>
                      </tr>
                    );
                    // Total row first (always visible)
                    rows.push(renderMetricRow('conversations', undefined, false, true));
                    // 3 channel rows (collapsed by default)
                    if (convosExpanded) {
                      for (const ck of CONVO_CHANNELS) {
                        rows.push(renderMetricRow(ck, CONVO_LABELS[ck], true));
                      }
                    }
                  }

                  if (i >= orderedMetrics.length) break;
                  const key = orderedMetrics[i];
                  const showDivider = key === 'discovery_set' && metricIdx > 0;

                  if (showDivider) {
                    rows.push(
                      <tr key={`div-${key}`}>
                        <td colSpan={weeks.length + 7} className="h-px bg-stone-200" />
                      </tr>
                    );
                    rows.push(
                      <tr key="ob-pipeline-header">
                        <td colSpan={weeks.length + 7} className="px-4 py-1.5 bg-stone-50/80">
                          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Outbound Pipeline</span>
                        </td>
                      </tr>
                    );
                  }
                  rows.push(renderMetricRow(key));
                  metricIdx++;
                }

                return rows;
              })()}

              {/* Conversion Rates Section — SSP style: Actual vs Goal */}
              <tr>
                <td colSpan={weeks.length + 7} className="h-px bg-stone-300" />
              </tr>
              <tr className="bg-stone-50/50">
                <td className="px-4 py-2 font-bold text-stone-600 text-[10px] uppercase tracking-wider sticky left-0 bg-stone-50/50 z-10" colSpan={1}>
                  Outbound Conversion Rates
                </td>
                <td className="text-right px-2 py-2 font-bold text-[10px] text-stone-500 uppercase tracking-wider">Goal</td>
                <td className="px-2 py-2" />
                {weeks.map((ws) => (
                  <td key={ws} className="px-2 py-2" />
                ))}
                <td className="text-right px-2 py-2 font-bold text-[10px] text-stone-500 uppercase tracking-wider">Actual</td>
                <td className="text-right px-2 py-2 font-bold text-[10px] text-stone-500 uppercase tracking-wider">Goal</td>
                <td className="text-center px-2 py-2 font-bold text-[10px] text-stone-500 uppercase tracking-wider">Status</td>
              </tr>
              {[
                { label: 'Scheduled Rate', from: 'conversations' as MetricKey, to: 'discovery_set' as MetricKey, desc: 'Total Convos → Disc Set', useTotal: true },
                { label: 'Show Rate', from: 'discovery_set' as MetricKey, to: 'discovery_held' as MetricKey, desc: 'Disc Set → Disc Held' },
                { label: 'Proposal Rate', from: 'discovery_held' as MetricKey, to: 'demo_held' as MetricKey, desc: 'Disc Held → Demo Held' },
                { label: 'Close Rate', from: 'demo_held' as MetricKey, to: 'closed_won' as MetricKey, desc: 'Demo Held → Closed Won' },
              ].map((driver) => {
                const fromActual = (driver as any).useTotal
                  ? (monthTotal.conversations + monthTotal.email_conversations + monthTotal.linkedin_conversations)
                  : monthTotal[driver.from];
                const fromGoal = (driver as any).useTotal
                  ? ((goal?.conversations ?? 0) + ((goal as any)?.email_conversations ?? 0) + ((goal as any)?.linkedin_conversations ?? 0))
                  : (goal?.[driver.from] ?? 0);
                const actualRate = safeDiv(monthTotal[driver.to], fromActual);
                const goalRate = goal ? safeDiv(goal[driver.to], fromGoal) : 0;
                const hitRate = goalRate > 0 ? actualRate >= goalRate : actualRate > 0;
                const closeRate = goalRate > 0 ? actualRate >= goalRate * 0.85 : true;
                const statusColor = hitRate ? 'emerald' : closeRate ? 'amber' : 'red';
                const statusLabel = hitRate ? 'On Track' : closeRate ? 'Watch' : 'Off Pace';

                return (
                  <tr key={driver.label} className="border-b border-stone-50 hover:bg-stone-50/30">
                    <td className="px-4 py-2 text-stone-600 sticky left-0 bg-white z-10">
                      <span className="font-medium">{driver.label}</span>
                      <span className="text-stone-400 ml-1 text-[10px]">({driver.desc})</span>
                    </td>
                    <td className="text-right px-2 py-2 text-stone-400 tabular-nums">
                      {goalRate > 0 ? fmtPct(goalRate) : '—'}
                    </td>
                    <td />
                    {weeks.map((ws, wi) => {
                      const weekFrom = (driver as any).useTotal
                        ? ((weekActuals[wi]?.conversations ?? 0) + (weekActuals[wi]?.email_conversations ?? 0) + (weekActuals[wi]?.linkedin_conversations ?? 0))
                        : (weekActuals[wi]?.[driver.from] ?? 0);
                      const weekTo = weekActuals[wi]?.[driver.to] ?? 0;
                      const weekRate = safeDiv(weekTo, weekFrom);
                      const isFuture = ws > currentWeekMonday;
                      const isCurrent = ws === currentWeekMonday;

                      return (
                        <td
                          key={ws}
                          className={`text-right px-2 py-2 tabular-nums ${
                            isCurrent ? 'border-l border-r border-stone-300 bg-blue-50/30 text-stone-700' :
                            isFuture ? 'text-stone-300' :
                            weekFrom > 0 ? 'text-stone-600' : 'text-stone-300'
                          }`}
                        >
                          {isFuture ? '—' : weekFrom > 0 ? fmtPct(weekRate) : '—'}
                        </td>
                      );
                    })}
                    <td className={`text-right px-2 py-2 font-bold tabular-nums ${
                      statusColor === 'emerald' ? 'text-emerald-500' :
                      statusColor === 'amber' ? 'text-stone-500' : 'text-rose-400'
                    }`}>
                      {monthTotal[driver.from] > 0 ? fmtPct(actualRate) : '—'}
                    </td>
                    <td className="text-right px-2 py-2 text-stone-400 tabular-nums">
                      {goalRate > 0 ? fmtPct(goalRate) : '—'}
                    </td>
                    <td className="text-center px-2 py-2">
                      {goalRate > 0 && monthTotal[driver.from] > 0 ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          statusColor === 'emerald' ? 'bg-emerald-50/50 text-emerald-600' :
                          statusColor === 'amber' ? 'bg-stone-50 text-stone-600' : 'bg-rose-50/50 text-rose-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            statusColor === 'emerald' ? 'bg-emerald-400' :
                            statusColor === 'amber' ? 'bg-stone-400' : 'bg-rose-400'
                          }`} />
                          {statusLabel}
                        </span>
                      ) : <span className="text-stone-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
