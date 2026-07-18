// ============================================================
// Rep Dashboard — Main dashboard view for sales reps
// ============================================================
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, PhoneCall, MessageSquare, Mail, CalendarPlus, Calendar,
  Presentation, FileText, Trophy, DollarSign, Save, Check,
  TrendingUp, Target, Minus, Plus, Search, ArrowRight,
  Zap, ChevronDown, PenLine, AlertTriangle, Clock,
  Star, Sparkles, Award,
} from 'lucide-react';
import { useAuth, REP_ID_TO_INITIALS } from '../contexts/AuthContext';
import {
  fmtCurrency, fmtNum, fmtPct, safeDiv, getPaceColor, getPaceLabel,
  getPctThroughMonth, getCurrentWeekMonday, getMetricPaces,
} from '../lib/calculations';
import {
  getMonthlyGoal, getWeeklyActualsForMonth, sumWeeklyActuals,
  getWeeklyActual, saveWeeklyActual,
} from '../lib/database';
import type { MetricKey, MetricRow, MetricPace } from '../types';
import { EMPTY_METRIC_ROW, METRIC_LABELS } from '../types';
import { computeGoalForecast, type GoalForecast } from '../lib/goalForecast';
import { getSessionsForRep, getSessionStats, type DiscoverySession } from '../lib/discoveryDatabase';
import { useNavigate } from 'react-router-dom';
import { GranolaSyncHub } from '../components/discovery/GranolaSyncHub';
import { GranolaAutoSyncBadge } from '../components/discovery/GranolaAutoSyncBadge';
import { GranolaReviewDrawer } from '../components/discovery/GranolaReviewDrawer';
import { RefreshCw } from 'lucide-react';

// ---- Icon map ----
const METRIC_ICON_MAP: Record<MetricKey, React.ReactNode> = {
  dials: <Phone className="w-4 h-4" />,
  connects: <PhoneCall className="w-4 h-4" />,
  conversations: <MessageSquare className="w-4 h-4" />,
  email_conversations: <Mail className="w-4 h-4" />,
  linkedin_conversations: <MessageSquare className="w-4 h-4" />,
  emails_sent: <Mail className="w-4 h-4" />,
  linkedin_touches: <MessageSquare className="w-4 h-4" />,
  discovery_set: <CalendarPlus className="w-4 h-4" />,
  discovery_held: <Calendar className="w-4 h-4" />,
  demo_held: <Presentation className="w-4 h-4" />,
  proposal_sent: <FileText className="w-4 h-4" />,
  closed_won: <Trophy className="w-4 h-4" />,
  revenue: <DollarSign className="w-4 h-4" />,
};

// ---- Helpers ----
function getMonthName(date: Date): string {
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function getWeekRange(monday: string): string {
  const start = new Date(monday + 'T00:00:00');
  const end = new Date(start);
  end.setDate(end.getDate() + 4);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

function formatMetricValue(key: MetricKey, value: number): string {
  return key === 'revenue' ? fmtCurrency(value) : fmtNum(value);
}

// ---- Period Label Helper ----
function getPeriodLabel(period: 'week' | 'month' | 'quarter'): string {
  const now = new Date();
  if (period === 'week') {
    const monday = getCurrentWeekMonday(now);
    return `Week of ${getWeekRange(monday)}`;
  }
  if (period === 'month') return getMonthName(now);
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `Q${q} ${now.getFullYear()}`;
}

// ---- Collapsible Section ----
function CollapsibleSection({
  title,
  icon: Icon,
  defaultOpen = true,
  children,
  id,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  defaultOpen?: boolean;
  children: React.ReactNode;
  id?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div id={id} className="rounded-xl border border-stone-200/60 bg-white overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-stone-500" />
          <h3 className="text-sm font-medium text-stone-800">{title}</h3>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Pace Badge ----
function PaceBadge({ pace }: { pace: MetricPace }) {
  const color = getPaceColor(pace.pace);
  const label = getPaceLabel(pace.pace);
  return (
    <span
      className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full"
      style={{ backgroundColor: `${color}18`, color }}
    >
      {label}
    </span>
  );
}

// ---- Progress Bar ----
function ProgressBar({ pct, color }: { pct: number; color: string }) {
  const clampedPct = Math.min(pct, 1);
  return (
    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clampedPct * 100}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

// ---- Revenue Ring ----
function RevenueRing({
  actual,
  goal,
  pace,
}: {
  actual: number;
  goal: number;
  pace: MetricPace | undefined;
}) {
  const pct = goal > 0 ? Math.min(actual / goal, 1) : 0;
  const color = pace ? getPaceColor(pace.pace) : '#6ee7b7';
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct);

  return (
    <div className="relative flex items-center justify-center w-[200px] h-[200px] flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="rgba(214, 211, 209, 0.4)"
          strokeWidth="10"
        />
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-stone-800">{fmtPct(pct)}</span>
        <span className="text-sm font-semibold text-stone-800 mt-0.5">{fmtCurrency(actual)}</span>
        <span className="text-xs text-stone-400">of {fmtCurrency(goal)}</span>
      </div>
    </div>
  );
}

// ---- Small Stat Card ----
function StatCard({
  icon,
  label,
  value,
  subValue,
  pace,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  pace?: MetricPace;
}) {
  const pct = pace ? Math.min(pace.pct_complete, 1) : 0;
  const color = pace ? getPaceColor(pace.pace) : '#93c5fd';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="bg-white border border-stone-200/60 rounded-xl p-4 flex flex-col gap-2"
    >
      <div className="flex items-center gap-2">
        <div className="text-stone-400">{icon}</div>
        <span className="text-xs font-medium text-stone-500">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-stone-800">{value}</span>
        {subValue && <span className="text-xs text-stone-400">{subValue}</span>}
      </div>
      <ProgressBar pct={pct} color={color} />
    </motion.div>
  );
}

// ---- Metric Row inside Activity/Pipeline cards ----
function MetricRowItem({ pace }: { pace: MetricPace }) {
  const color = getPaceColor(pace.pace);
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="text-stone-400 flex-shrink-0">{METRIC_ICON_MAP[pace.metric]}</div>
      <span className="text-sm text-stone-500 w-28 flex-shrink-0">{METRIC_LABELS[pace.metric]}</span>
      <div className="flex items-baseline gap-1 w-24 flex-shrink-0">
        <span className="text-sm font-semibold text-stone-800">{formatMetricValue(pace.metric, pace.actual)}</span>
        <span className="text-xs text-stone-400">/ {formatMetricValue(pace.metric, pace.goal)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <ProgressBar pct={pace.pct_complete} color={color} />
      </div>
      <PaceBadge pace={pace} />
    </div>
  );
}

// ---- Activity/Pipeline Card ----
function SectionCard({
  title,
  metrics,
  delay = 0,
}: {
  title: string;
  metrics: MetricPace[];
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white border border-stone-200/60 rounded-xl p-5"
    >
      <h3 className="text-sm font-semibold text-stone-600 mb-3">{title}</h3>
      <div className="divide-y divide-stone-100">
        {metrics.map(p => (
          <MetricRowItem key={p.metric} pace={p} />
        ))}
      </div>
    </motion.div>
  );
}

// ---- Number Input with stepper ----
function NumberStepper({
  label,
  value,
  onChange,
  step = 1,
  isCurrency = false,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  isCurrency?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-stone-500">{label}</label>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - step))}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-stone-50 border border-stone-200 text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <input
          type="number"
          value={value}
          onChange={e => onChange(Math.max(0, Number(e.target.value) || 0))}
          min={0}
          step={step}
          className="flex-1 bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-center text-lg font-semibold text-stone-800 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-300 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => onChange(value + step)}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-stone-50 border border-stone-200 text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      {isCurrency && value > 0 && (
        <span className="text-xs text-stone-400 text-center">{fmtCurrency(value)}</span>
      )}
    </div>
  );
}

// ---- Time Period Toggle ----
function TimePeriodToggle({
  period,
  setPeriod,
}: {
  period: 'week' | 'month' | 'quarter';
  setPeriod: (p: 'week' | 'month' | 'quarter') => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
      {(['week', 'month', 'quarter'] as const).map(p => (
        <button
          key={p}
          onClick={() => setPeriod(p)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            period === p ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'This Quarter'}
        </button>
      ))}
    </div>
  );
}

// ---- Priority Item Type ----
interface PriorityItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  action: string;
  cta?: string;
  onAction?: () => void;
}

// ---- Coaching Tips Map (keyed by bottleneck metric) ----
const COACHING_TIPS: Record<string, string> = {
  discovery_held: 'Try: Send a confirmation email within 2 hours of booking',
  connects: 'Try: Call between 8-9 AM and 4-5 PM',
  closed_won: 'Try: Use the ROI calculator to build urgency before the proposal',
  proposal_sent: 'Try: Use the ROI calculator to build urgency before the proposal',
  discovery_set: "Try: Ask 'would it make sense to block 20 min next week?' before ending calls",
  demo_held: 'Try: End every discovery with a clear next-step commitment',
  conversations: 'Try: End every discovery with a clear next-step commitment',
  dials: 'Try: Call between 8-9 AM and 4-5 PM',
  emails_sent: 'Try: Ramp sequences and add 10 more personalized emails this week',
};

// ---- Hero Priority Actions ----
function HeroPriorityActions({ priorities }: { priorities: PriorityItem[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, duration: 0.25 }}
      className="rounded-2xl border border-stone-200/60 bg-white shadow-md p-6 md:p-8 mb-6"
    >
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center">
          <Zap size={18} className="text-stone-500" />
        </div>
        <h2 className="text-lg font-semibold text-stone-900">Today&apos;s Priorities</h2>
      </div>
      {priorities.length > 0 ? (
        <div className="space-y-4">
          {priorities.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 + idx * 0.06, duration: 0.2 }}
              className="flex items-center gap-4 rounded-xl bg-stone-50 border border-stone-200/60 px-5 py-4"
            >
              <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center flex-shrink-0">
                {p.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-stone-800">{p.title}</p>
                <p className="text-sm text-stone-500 mt-0.5">{p.action}</p>
              </div>
              {p.cta && (
                <button
                  onClick={p.onAction}
                  className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold py-2 px-4 rounded-xl transition-all text-sm shadow-sm whitespace-nowrap active:scale-[0.97]"
                >
                  {p.cta}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-5">
          <Sparkles size={22} className="text-emerald-500 flex-shrink-0" />
          <div>
            <p className="text-base font-semibold text-emerald-800">All systems green — keep the momentum</p>
            <p className="text-sm text-emerald-600 mt-0.5">You&apos;re on track across the board. Stay focused and keep pushing.</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ---- Wins This Week Card ----
function WinsThisWeekCard({
  sessions,
  goalForecast,
  actualRow,
  goalRow,
}: {
  sessions: DiscoverySession[];
  goalForecast: GoalForecast;
  actualRow: MetricRow;
  goalRow: MetricRow;
}) {
  // Recently closed deals
  const closedWonDeals = sessions.filter(s => s.deal_stage === 'closed_won');
  const recentWins = closedWonDeals.slice(0, 5);

  // Goals exceeded (any metric where actual > goal and goal > 0)
  const metricKeys: MetricKey[] = [
    'dials', 'connects', 'conversations', 'emails_sent',
    'discovery_set', 'discovery_held', 'demo_held', 'proposal_sent',
    'closed_won', 'revenue',
  ];
  const exceededGoals = metricKeys.filter(key => {
    const goal = goalRow[key];
    const actual = actualRow[key];
    return goal > 0 && actual > goal;
  });

  const hasAnyWins = recentWins.length > 0 || exceededGoals.length > 0;

  if (!hasAnyWins) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06, duration: 0.2 }}
      className="rounded-xl border border-stone-200/60 bg-white p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Award size={16} className="text-amber-500" />
        <h3 className="text-sm font-medium text-stone-800">Wins This Week</h3>
      </div>

      {/* Closed deals */}
      {recentWins.length > 0 && (
        <div className="space-y-2 mb-3">
          {recentWins.map(deal => (
            <div key={deal.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100">
              <Trophy size={14} className="text-emerald-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-emerald-800 truncate block">{deal.company_name}</span>
                {deal.deal_value > 0 && (
                  <span className="text-xs text-emerald-600">{fmtCurrency(deal.deal_value)}</span>
                )}
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Closed Won</span>
            </div>
          ))}
        </div>
      )}

      {/* Exceeded goals */}
      {exceededGoals.length > 0 && (
        <div className="space-y-2">
          {exceededGoals.map(key => (
            <div key={key} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-stone-50 border border-stone-100">
              <Star size={14} className="text-stone-400 flex-shrink-0" />
              <span className="text-sm text-stone-600">
                <span className="font-semibold">{METRIC_LABELS[key]}</span>: {formatMetricValue(key, actualRow[key])} vs {formatMetricValue(key, goalRow[key])} goal
              </span>
              <span className="ml-auto text-xs font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full whitespace-nowrap">Exceeded</span>
            </div>
          ))}
        </div>
      )}

      {/* Congrats message */}
      {(recentWins.length > 0 || exceededGoals.length >= 3) && (
        <div className="mt-4 text-center">
          <p className="text-sm font-semibold text-stone-600">Great work — keep the momentum going!</p>
        </div>
      )}
    </motion.div>
  );
}

// ---- Goal Attainment Panel ----
function GoalAttainmentPanel({
  forecast,
  onSetGoal,
}: {
  forecast: GoalForecast;
  onSetGoal: () => void;
}) {
  // No goal set → CTA card
  if (forecast.monthlyGoalRevenue === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04, duration: 0.2 }}
        className="rounded-xl border border-stone-200/60 bg-white p-5 mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-stone-400" />
            <span className="text-sm font-medium text-stone-800">Month-to-Date Attainment</span>
          </div>
        </div>
        <div className="mt-4 flex flex-col items-center gap-3 py-4">
          <Target size={28} className="text-stone-300" />
          <p className="text-sm text-stone-500 text-center">
            No goal set for this month yet.
          </p>
          <button
            onClick={onSetGoal}
            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold py-2 px-5 rounded-xl transition-all text-sm shadow-sm"
          >
            Set your 90-day goal to unlock forecasting →
          </button>
        </div>
      </motion.div>
    );
  }

  // Status colors
  const statusConfig = {
    on_track: { label: 'On Track', dotColor: 'bg-emerald-400', barColor: '#6ee7b7', textColor: 'text-emerald-600', bgColor: 'bg-emerald-50 border-emerald-200' },
    at_risk:  { label: 'At Risk',  dotColor: 'bg-stone-400',   barColor: '#a8a29e', textColor: 'text-stone-500',   bgColor: 'bg-stone-50 border-stone-200' },
    behind:   { label: 'Behind',   dotColor: 'bg-rose-400',    barColor: '#fda4af', textColor: 'text-rose-400',     bgColor: 'bg-red-50 border-red-200' },
  } as const;
  const sc = statusConfig[forecast.status];

  // Metric bar color based on pct
  function metricBarColor(pct: number) {
    if (pct >= 0.85) return '#6ee7b7'; // green
    if (pct >= 0.5)  return '#a8a29e'; // stone
    return '#fda4af';                  // rose
  }

  const pacingPctDisplay = Math.round(forecast.pacingPct * 100);
  const progressBarPct = Math.min(forecast.pacingPct, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04, duration: 0.2 }}
      className="rounded-xl border border-stone-200/60 bg-white p-5 mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-stone-500" />
          <h3 className="text-sm font-medium text-stone-800">Month-to-Date Attainment</h3>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.bgColor} ${sc.textColor}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${sc.dotColor}`}></span> {sc.label}
        </span>
      </div>

      {/* Big pacing number + bar */}
      <div className="mb-2">
        <p className="text-base font-semibold text-stone-600">
          Tracking to{' '}
          <span className="text-stone-800 font-bold">{fmtCurrency(forecast.pacingRevenue)}</span>
          {' '}of{' '}
          <span className="text-stone-600">{fmtCurrency(forecast.monthlyGoalRevenue)}</span> goal
        </p>
        <p className={`text-2xl font-bold mt-0.5 ${sc.textColor}`}>
          {pacingPctDisplay}% pacing
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressBarPct * 100}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: sc.barColor }}
        />
      </div>

      {/* Required per week */}
      {forecast.weeksRemaining > 0 && forecast.gapRevenue > 0 && (
        <p className="text-xs text-stone-500 mb-4">
          <span className="font-semibold text-stone-700">
            Required to close: {fmtCurrency(forecast.requiredPerWeek)}/week
          </span>{' '}
          for the next{' '}
          <span className="font-semibold text-stone-700">
            {forecast.weeksRemaining} week{forecast.weeksRemaining !== 1 ? 's' : ''}
          </span>
        </p>
      )}
      {forecast.weeksRemaining === 0 && forecast.gapRevenue > 0 && (
        <p className="text-xs text-rose-400 mb-4 font-semibold">Final week — {fmtCurrency(forecast.gapRevenue)} still needed to hit goal.</p>
      )}
      {forecast.gapRevenue === 0 && (
        <p className="text-xs text-emerald-600 mb-4 font-semibold">Goal achieved! Keep pushing.</p>
      )}

      {/* Bottleneck callout */}
      {forecast.bottleneck && (
        <div className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 mb-4">
          <AlertTriangle size={15} className="text-stone-500 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-stone-600">
              #1 Drag — {forecast.bottleneck.label}
            </p>
            <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
              {forecast.bottleneck.impact}
            </p>
            {COACHING_TIPS[forecast.bottleneck.metric] && (
              <p className="text-xs font-semibold text-stone-500 mt-2 flex items-center gap-1.5">
                <Sparkles size={12} className="flex-shrink-0" />
                {COACHING_TIPS[forecast.bottleneck.metric]}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 8-metric attainment grid */}
      {forecast.metricPacing.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {forecast.metricPacing.map((m) => {
            const barPct = Math.min(m.pct, 1);
            const color = metricBarColor(m.pct);
            const pctLabel = `${Math.round(m.pct * 100)}%`;
            return (
              <div key={m.key} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500">{m.label}</span>
                  <span
                    className="text-[11px] font-semibold"
                    style={{ color }}
                  >
                    {pctLabel}
                  </span>
                </div>
                <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barPct * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-stone-400">
                    {m.key === 'revenue' ? fmtCurrency(m.actual) : fmtNum(m.actual)}
                    {' / '}
                    {m.key === 'revenue' ? fmtCurrency(m.goal) : fmtNum(Math.round(m.goal))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}



// ============================================================
// Main Component
// ============================================================
export default function RepDashboard() {
  // ---- ALL HOOKS FIRST (before any conditional returns) ----
  const { effectiveUser: user } = useAuth();
  const navigate = useNavigate();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
  const currentWeekMonday = getCurrentWeekMonday(now);
  const pctThroughMonth = getPctThroughMonth(now);

  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [logSectionOpen, setLogSectionOpen] = useState(false);
  const [showGranolaSync, setShowGranolaSync] = useState(false);
  const [showGranolaReview, setShowGranolaReview] = useState(false);

  // ---- Load Goals & Actuals ----
  const goalRow = useMemo<MetricRow>(() => {
    if (!user) return { ...EMPTY_METRIC_ROW };
    const goal = getMonthlyGoal(user.id, monthStr);
    return goal ?? { ...EMPTY_METRIC_ROW };
  }, [user, monthStr]);

  const actualRow = useMemo<MetricRow>(() => {
    if (!user) return { ...EMPTY_METRIC_ROW };
    const actuals = getWeeklyActualsForMonth(user.id, currentYear, currentMonth);
    return sumWeeklyActuals(actuals);
  }, [user, currentYear, currentMonth]);

  const paces = useMemo(() => {
    return getMetricPaces(goalRow, actualRow, pctThroughMonth);
  }, [goalRow, actualRow, pctThroughMonth]);

  const paceMap = useMemo(() => {
    const map: Partial<Record<MetricKey, MetricPace>> = {};
    paces.forEach(p => { map[p.metric] = p; });
    return map;
  }, [paces]);

  const goalForecast = useMemo<GoalForecast>(() => {
    if (!user) return {
      monthlyGoalRevenue: 0, pacingRevenue: 0, pacingPct: 0, gapRevenue: 0,
      weekNumber: 0, weeksRemaining: 0, requiredPerWeek: 0, bottleneck: null,
      status: 'behind' as const, metricPacing: [],
    };
    return computeGoalForecast(user.id, currentYear, currentMonth);
  }, [user, currentYear, currentMonth]);

  // ---- Discovery Sessions ----
  const sessions = useMemo(() => {
    if (!user) return [];
    return getSessionsForRep(user.id);
  }, [user]);

  const sessionStats = useMemo(() => {
    if (!user) return { total: 0, in_progress: 0, completed: 0, approved: 0, total_roi: 0, total_pipeline: 0 };
    return getSessionStats(user.id);
  }, [user]);

  // ---- Dynamic Priorities ----
  const priorities = useMemo<PriorityItem[]>(() => {
    if (!user) return [];
    const items: PriorityItem[] = [];

    // 1. Check conversation pace — behind target?
    const convoPace = paceMap.conversations;
    if (convoPace && (convoPace.pace === 'behind' || convoPace.pace === 'at_risk')) {
      const gap = Math.max(0, Math.round(convoPace.goal * pctThroughMonth) - convoPace.actual);
      if (gap > 0) {
        items.push({
          id: 'convo-behind',
          icon: <AlertTriangle size={14} className="text-stone-500" />,
          title: `You're ${gap} conversations behind target this week`,
          action: 'Block time for prospecting today',
          cta: 'Log Activity',
          onAction: () => {
            setLogSectionOpen(true);
            setTimeout(() => {
              document.getElementById('log-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 350);
          },
        });
      }
    }

    // 2. Check for stalled deals (sessions with no recent stage change > 7 days)
    const stalledSessions = sessions.filter(s => {
      if (s.status === 'approved' || s.deal_stage === 'closed_won' || s.deal_stage === 'closed_lost') return false;
      const daysSinceCreation = Math.floor((Date.now() - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceCreation > 7;
    });
    if (stalledSessions.length > 0) {
      const stalled = stalledSessions[0];
      const daysSince = Math.floor((Date.now() - new Date(stalled.created_at).getTime()) / (1000 * 60 * 60 * 24));
      items.push({
        id: `stalled-${stalled.id}`,
        icon: <Clock size={14} className="text-stone-400" />,
        title: `${stalled.company_name} — stalled for ${daysSince} days`,
        action: 'Update deal status or schedule follow-up',
        cta: 'Open Deal',
        onAction: () => navigate('/team/discovery'),
      });
    }

    // 3. Pipeline coverage check
    const revGoal = goalRow.revenue;
    const totalPipeline = sessions.reduce((sum, s) => sum + (s.deal_value || 0), 0);
    const pipelineCoverage = revGoal > 0 ? totalPipeline / revGoal : 0;
    if (pipelineCoverage < 3 && revGoal > 0) {
      items.push({
        id: 'pipeline-coverage',
        icon: <Target size={14} className="text-red-500" />,
        title: `Pipeline coverage is ${pipelineCoverage.toFixed(1)}x — need more top-of-funnel activity`,
        action: 'Target 3x coverage to hit quota confidently',
        cta: 'Prospect',
        onAction: () => navigate('/team/discovery'),
      });
    }

    // 4. Upcoming meeting reminders
    const upcomingSessions = sessions.filter(s => {
      if (!s.next_meeting_date) return false;
      const meetingDate = new Date(s.next_meeting_date);
      const diffDays = Math.floor((meetingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 3;
    });
    if (upcomingSessions.length > 0) {
      const upcoming = upcomingSessions[0];
      items.push({
        id: `meeting-${upcoming.id}`,
        icon: <Calendar size={14} className="text-blue-500" />,
        title: `${upcoming.company_name} prep — meeting coming up`,
        action: 'Review battlecard and pain points',
        cta: 'Review',
        onAction: () => navigate('/team/discovery'),
      });
    }

    // Return top 3 priorities
    return items.slice(0, 3);
  }, [user, paceMap, pctThroughMonth, sessions, goalRow, navigate]);

  // ---- Weekly Entry State ----
  const [weekEntry, setWeekEntry] = useState<MetricRow>({ ...EMPTY_METRIC_ROW });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    const existing = getWeeklyActual(user.id, currentWeekMonday);
    if (existing) {
      const { id: _id, rep_id: _rid, week_start: _ws, notes: _n, submitted_at: _sa, updated_at: _ua, ...metrics } = existing;
      setWeekEntry(metrics as MetricRow);
    }
  }, [user, currentWeekMonday]);

  const updateWeekEntry = useCallback((key: MetricKey, value: number) => {
    setWeekEntry(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    if (!user) return;
    saveWeeklyActual({
      rep_id: user.id,
      week_start: currentWeekMonday,
      notes: null,
      submitted_at: new Date().toISOString(),
      ...weekEntry,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, [user, currentWeekMonday, weekEntry]);

  // ---- Conditional return AFTER all hooks ----
  if (!user) return null;

  const initials = REP_ID_TO_INITIALS[user.id] || user.initials;
  const avgDealSize = safeDiv(actualRow.revenue, actualRow.closed_won);

  // Group paces for section cards
  const callingPaces = paces.filter(p => ['dials', 'connects', 'conversations'].includes(p.metric));
  const outreachPaces = paces.filter(p => ['emails_sent'].includes(p.metric));
  const pipelinePaces = paces.filter(p => ['discovery_set', 'discovery_held', 'demo_held'].includes(p.metric));
  const closingPaces = paces.filter(p => ['proposal_sent', 'closed_won', 'revenue'].includes(p.metric));

  const metricKeysForEntry: MetricKey[] = [
    'dials', 'connects', 'conversations', 'emails_sent',
    'discovery_set', 'discovery_held', 'demo_held', 'proposal_sent',
    'closed_won', 'revenue',
  ];

  const handleScrollToLog = () => {
    setLogSectionOpen(true);
    setTimeout(() => {
      document.getElementById('log-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 350);
  };

  return (
    <div className="min-h-full bg-stone-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ---- Header ---- */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-stone-800">
              Welcome back, <span className="text-stone-900">{user.full_name.split(' ')[0]}</span>
            </h1>
            <p className="text-sm text-stone-400 mt-0.5">{getPeriodLabel(period)} Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowGranolaSync(true)}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold py-1.5 px-3 rounded-lg transition-colors text-sm shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Granola Sync
            </button>
            <GranolaAutoSyncBadge
              sessionIds={sessions.map(s => s.id)}
              onClick={() => setShowGranolaReview(true)}
            />
            <TimePeriodToggle period={period} setPeriod={setPeriod} />
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2"
              style={{
                backgroundColor: `${user.avatar_color}20`,
                borderColor: user.avatar_color,
                color: user.avatar_color,
              }}
            >
              {initials}
            </div>
          </div>
        </motion.header>

        {/* ================================================================ */}
        {/* TOP TIER: Priority Actions + Goal Attainment (what matters now) */}
        {/* ================================================================ */}

        {/* ---- Hero Priority Actions ---- */}
        <HeroPriorityActions priorities={priorities} />

        {/* ---- Goal Attainment Forecast ---- */}
        <GoalAttainmentPanel
          forecast={goalForecast}
          onSetGoal={() => navigate('/team/planning/goals')}
        />

        {/* ---- Wins This Week ---- */}
        <WinsThisWeekCard
          sessions={sessions}
          goalForecast={goalForecast}
          actualRow={actualRow}
          goalRow={goalRow}
        />

        {/* ================================================================ */}
        {/* BOTTOM TIER: Everything else (collapsible)                       */}
        {/* ================================================================ */}
        <div className="space-y-4">

          {/* ---- Revenue Progress (Collapsible) ---- */}
          <CollapsibleSection title="Revenue Progress" icon={TrendingUp} defaultOpen={false}>
            <div className="flex items-center gap-2 mb-4">
              <div className="ml-auto text-xs text-stone-400">
                {fmtPct(pctThroughMonth)} through month
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <RevenueRing actual={actualRow.revenue} goal={goalRow.revenue} pace={paceMap.revenue} />
              <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                <StatCard
                  icon={<Trophy className="w-4 h-4" />}
                  label="Deals Won"
                  value={fmtNum(actualRow.closed_won)}
                  subValue={`/ ${fmtNum(goalRow.closed_won)}`}
                  pace={paceMap.closed_won}
                />
                <StatCard
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Avg Deal Size"
                  value={fmtCurrency(avgDealSize)}
                  pace={undefined}
                />
                <StatCard
                  icon={<FileText className="w-4 h-4" />}
                  label="Proposals Sent"
                  value={fmtNum(actualRow.proposal_sent)}
                  subValue={`/ ${fmtNum(goalRow.proposal_sent)}`}
                  pace={paceMap.proposal_sent}
                />
                <StatCard
                  icon={<Target className="w-4 h-4" />}
                  label="Pipeline"
                  value={fmtNum(actualRow.discovery_set)}
                  subValue={`/ ${fmtNum(goalRow.discovery_set)}`}
                  pace={paceMap.discovery_set}
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* ---- Activity & Pipeline (Collapsible) ---- */}
          <CollapsibleSection title="Activity & Pipeline" icon={Phone} defaultOpen={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SectionCard title="Calling" metrics={callingPaces} delay={0} />
              <SectionCard title="Outreach" metrics={outreachPaces} delay={0.05} />
              <SectionCard title="Pipeline" metrics={pipelinePaces} delay={0.1} />
              <SectionCard title="Closing" metrics={closingPaces} delay={0.15} />
            </div>
          </CollapsibleSection>

          {/* ---- Discovery Sessions (Collapsible, collapsed by default) ---- */}
          <CollapsibleSection title="Discovery Sessions" icon={Search} defaultOpen={false}>
            <div className="flex items-center justify-between mb-4">
              {sessionStats.total > 0 && (
                <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{sessionStats.total} total</span>
              )}
              <button
                onClick={() => navigate('/team/discovery')}
                className="flex items-center gap-1 text-xs font-medium text-stone-900 hover:text-stone-600 transition-colors ml-auto"
              >
                Launch New <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-8 h-8 text-stone-300 mx-auto mb-3" />
                <p className="text-sm text-stone-500">No discovery sessions yet</p>
                <p className="text-xs text-stone-400 mt-1">Launch one to start qualifying prospects</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.slice(0, 5).map((s: DiscoverySession) => (
                  <div key={s.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-stone-50 border border-stone-200/60 hover:border-stone-300 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate text-stone-700">{s.company_name}</div>
                      <div className="text-xs text-stone-400">
                        {s.selected_pains.length} pain{s.selected_pains.length !== 1 ? 's' : ''}{s.roi_total > 0 ? ` · $${Math.round(s.roi_total).toLocaleString()} ROI` : ''}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      s.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                      s.status === 'completed' ? 'bg-blue-50 text-blue-700' :
                      'bg-stone-50 text-stone-500'
                    }`}>
                      {s.status === 'approved' ? 'Approved' : s.status === 'completed' ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>

          {/* ---- Weekly Entry (Collapsible, collapsed by default) ---- */}
          <div id="log-section">
            <CollapsibleSection
              title="Log This Week"
              icon={Save}
              defaultOpen={logSectionOpen}
            >
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs text-stone-400">
                  Week of {getWeekRange(currentWeekMonday)}
                </p>
                <AnimatePresence>
                  {saved && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1 text-sm font-medium text-emerald-600"
                    >
                      <Check className="w-4 h-4" />
                      Saved ✓
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {metricKeysForEntry.map(key => (
                  <NumberStepper
                    key={key}
                    label={METRIC_LABELS[key]}
                    value={weekEntry[key]}
                    onChange={(v) => updateWeekEntry(key, v)}
                    step={key === 'revenue' ? 1000 : 1}
                    isCurrency={key === 'revenue'}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-sm active:scale-[0.98]"
              >
                <Save className="w-4 h-4" />
                Save Week
              </button>
            </CollapsibleSection>
          </div>


        </div>
      </div>

      {/* ---- Floating Log Activity CTA ---- */}
      <button
        onClick={handleScrollToLog}
        className="fixed bottom-6 right-6 bg-stone-900 hover:bg-stone-800 text-white px-4 py-3 rounded-xl shadow-sm font-semibold text-sm flex items-center gap-2 z-50 transition-all hover:shadow-md active:scale-95"
      >
        <PenLine size={16} />
        Log This Week
      </button>

      {showGranolaSync && <GranolaSyncHub onClose={() => setShowGranolaSync(false)} />}
      <GranolaReviewDrawer
        isOpen={showGranolaReview}
        onClose={() => setShowGranolaReview(false)}
        sessionIds={sessions.map(s => s.id)}
      />
    </div>
  );
}
