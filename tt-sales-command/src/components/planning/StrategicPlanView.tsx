// ============================================================
// StrategicPlanView — Digital version of TT_SMB_Strategic_Sales_Plan_v4
// One scrollable page per rep: Historical → Goals → Weekly Tracker
// ============================================================
import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Check, ChevronDown, ChevronRight, Target } from 'lucide-react';
import { getTotalConversations } from '../../types';
import { computeAllPipelineMetrics, PIPELINE_AUTO_FIELDS, type PipelineMonthMetrics } from '../../lib/pipelineMetrics';

import {
  getSessionsForRep,
  computeBAPAnswers,
  getCheckpointScore,
  getCheckpointStatus,
  BAP_QUESTIONS,
  type DiscoverySession,
  type BAPAnswer,
} from '../../lib/discoveryDatabase';

import { useHistorical, type HistoricalMonth } from '../../hooks/useHistorical';
import { useGoalStore } from '../../lib/stores/goalStore';
import { useActualStore } from '../../lib/stores/actualStore';
import { getWeeksInMonth } from '../../lib/calculations';
import { REP_SEED_DATA } from '../../data/seedData';
import { REP_ID_TO_INITIALS } from '../../contexts/AuthContext';
import type { MonthlyGoal } from '../../types';

// ── Dynamic Quarter Calculation ────────────────────────────────
const FULL_MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT_MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

interface QuarterInfo {
  year: number;
  quarter: number;               // 1-4
  goalMonthIndices: number[];    // 0-based month indices (e.g. [3,4,5] for Q2)
  goalMonthKeys: string[];       // ISO keys like '2026-04-01'
  goalMonthLabels: string[];     // Full names like 'April'
  histMonthLabels: string[];     // Short names like 'Oct', 'Nov', ...
  cycleStart: Date;
  cycleEnd: Date;
  cycleDayOfYear: number;        // 1-based day within the cycle
  cycleTotalDays: number;
}

function getCurrentQuarter(now: Date = new Date()): QuarterInfo {
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-based

  // Current calendar quarter (Q1=0-2, Q2=3-5, Q3=6-8, Q4=9-11)
  const currentQuarter = Math.floor(m / 3) + 1; // 1-4
  const quarter = currentQuarter;

  // Goal months = NEXT calendar quarter
  const nextQuarterFirstMonth = currentQuarter * 3; // 0-based: Q1→3(Apr), Q2→6(Jul), Q3→9(Oct), Q4→12(Jan next yr)
  const goalYear = nextQuarterFirstMonth >= 12 ? y + 1 : y;
  const firstGoalMonth = nextQuarterFirstMonth % 12;

  const goalMonthIndices = [firstGoalMonth, firstGoalMonth + 1, firstGoalMonth + 2];

  const goalMonthKeys = goalMonthIndices.map(mi => {
    const d = new Date(goalYear, mi, 1);
    return d.toISOString().slice(0, 10);
  });

  const goalMonthLabels = goalMonthIndices.map(mi => {
    const d = new Date(goalYear, mi, 1);
    return FULL_MONTH_NAMES[d.getMonth()];
  });

  // 6 preceding months for historical view (before goal quarter starts)
  const histMonthLabels: string[] = [];
  for (let i = 6; i >= 1; i--) {
    const d = new Date(goalYear, firstGoalMonth - i, 1);
    histMonthLabels.push(SHORT_MONTH_NAMES[d.getMonth()]);
  }

  const cycleStart = new Date(goalYear, firstGoalMonth, 1);
  const cycleEnd = new Date(goalYear, firstGoalMonth + 3, 0); // last day of 3rd goal month
  const cycleTotalDays = Math.round((cycleEnd.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const cycleDayOfYear = Math.max(1, Math.min(cycleTotalDays, Math.floor((now.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1));

  return { year: goalYear, quarter, goalMonthIndices, goalMonthKeys, goalMonthLabels, histMonthLabels, cycleStart, cycleEnd, cycleDayOfYear, cycleTotalDays };
}

/** Compute week boundary labels for any month given its ISO key */
function computeWeekBoundaries(monthKey: string): string[] {
  const d = new Date(monthKey + 'T00:00:00');
  const month = d.getMonth(); // 0-based
  const year = d.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const m1 = month + 1; // 1-based for display

  const weeks: string[] = [];
  let day = 1;
  while (day <= daysInMonth) {
    const current = new Date(year, month, day);
    const dow = current.getDay(); // 0=Sun
    // End of this week = next Sunday or end of month
    const daysUntilSunday = dow === 0 ? 0 : 7 - dow;
    const endDay = Math.min(day + daysUntilSunday, daysInMonth);
    weeks.push(day === endDay ? `${m1}/${day}` : `${m1}/${day}–${endDay}`);
    day = endDay + 1;
  }
  return weeks;
}

// Instantiate the current quarter info
const QUARTER = getCurrentQuarter();
const MONTH_LABELS = QUARTER.histMonthLabels;
const GOAL_MONTHS = QUARTER.goalMonthLabels;
const GOAL_MONTH_KEYS = QUARTER.goalMonthKeys;

// Dynamically computed week boundaries for goal months
const WEEK_BOUNDARIES: Record<string, string[]> = {};
for (const mk of GOAL_MONTH_KEYS) {
  WEEK_BOUNDARIES[mk] = computeWeekBoundaries(mk);
}

// Per-rep 90-day stretch targets (from Salesforce Closed Won data, Mar–May 2026)
const REP_TARGETS: Record<string, number> = {
  'rep-jl': 18000,
  'rep-ma': 28000,
  'rep-th': 50000,
};

// ── Metric definitions matching v4 spreadsheet ─────────────────
interface MetricDef {
  key: string;
  label: string;
  seedField?: keyof HistoricalMonth;
  isCurrency?: boolean;
  isRate?: boolean;
  isGoalInput?: boolean;
  computeFn?: (row: HistoricalMonth) => number; // used for historical avg math
  unavailable?: boolean;
}

const OB_ACTIVITY: MetricDef[] = [
  { key: 'dials', label: 'Dials', seedField: 'dials', isGoalInput: true },
  { key: 'phone_connects', label: 'Phone Connects', seedField: 'connects' },
  { key: 'emails_sent', label: 'Emails Sent', seedField: 'emails_sent', isGoalInput: true },
  { key: 'email_connects', label: 'Email Connects', unavailable: true },
  { key: 'linkedin_touches', label: 'LinkedIn Touches', seedField: 'linkedin_touches', isGoalInput: true },
  { key: 'linkedin_connects', label: 'LinkedIn Connects', unavailable: true },
  { key: 'conversations', label: '📞 Phone Conversations', seedField: 'conversations', isGoalInput: true },
  { key: 'email_conversations', label: '📧 Email Conversations', seedField: 'email_conversations', isGoalInput: true },
  { key: 'linkedin_conversations', label: '💬 LinkedIn Conversations', seedField: 'linkedin_conversations', isGoalInput: true },
  { key: 'total_conversations', label: '🗣️ Total Conversations',
    computeFn: (r) => (r.conversations || 0) + (r.email_conversations || 0) + (r.linkedin_conversations || 0) },
  { key: 'net_new_accounts', label: 'Net New Accounts', unavailable: true },
];

const OB_PIPELINE: MetricDef[] = [
  { key: 'meetings_booked', label: 'Meetings Booked', seedField: 'discovery_set' },
  { key: 'discovery_held', label: 'Discovery Held', seedField: 'discovery_held' },
  { key: 'demo_held', label: 'Demo Held', seedField: 'demo_held' },
  { key: 'proposal_sent', label: 'Proposal Sent', seedField: 'proposal_sent' },
  { key: 'closed_won', label: 'Closed Won', seedField: 'closed_won' },
  { key: 'revenue', label: 'Revenue', seedField: 'revenue', isCurrency: true },
  { key: 'avg_rev', label: 'Avg Rev per Sale', isCurrency: true,
    computeFn: (r) => r.closed_won > 0 ? Math.round(r.revenue / r.closed_won) : 0 },
];

const OB_DRIVERS: MetricDef[] = [
  { key: 'connect_rate', label: 'Phone Connect Rate', isRate: true, isGoalInput: true,
    computeFn: (r) => r.dials > 0 ? r.connects / r.dials : 0 },
  { key: 'email_connect_rate', label: 'Email Connect Rate', isRate: true, unavailable: true },
  { key: 'linkedin_connect_rate', label: 'LinkedIn Connect Rate', isRate: true, unavailable: true },
  { key: 'phone_scheduled_rate', label: 'Phone → Meeting Rate', isRate: true, isGoalInput: true,
    computeFn: (r) => r.conversations > 0 ? r.discovery_set / ((r.conversations || 0) + (r.email_conversations || 0) + (r.linkedin_conversations || 0) || 1) : 0 },
  { key: 'email_scheduled_rate', label: 'Email → Meeting Rate', isRate: true, isGoalInput: true,
    computeFn: () => 0.08 },
  { key: 'linkedin_scheduled_rate', label: 'LinkedIn → Meeting Rate', isRate: true, isGoalInput: true,
    computeFn: () => 0.10 },
  { key: 'show_rate', label: 'Show Rate', isRate: true, isGoalInput: true,
    computeFn: (r) => r.discovery_set > 0 ? r.discovery_held / r.discovery_set : 0 },
  { key: 'advancement_rate', label: 'Advancement Rate', isRate: true, isGoalInput: true,
    computeFn: (r) => r.discovery_held > 0 ? r.demo_held / r.discovery_held : 0 },
  { key: 'proposal_rate', label: 'Proposal Rate', isRate: true, isGoalInput: true,
    computeFn: (r) => r.demo_held > 0 ? r.proposal_sent / r.demo_held : 0 },
  { key: 'close_rate', label: 'Close Rate', isRate: true, isGoalInput: true,
    computeFn: (r) => r.proposal_sent > 0 ? r.closed_won / r.proposal_sent : 0 },
  { key: 'avg_rev_driver', label: 'Avg Revenue Per Sale', isCurrency: true, isGoalInput: true,
    computeFn: (r) => r.closed_won > 0 ? Math.round(r.revenue / r.closed_won) : 0 },
];



// ── Helpers ────────────────────────────────────────────────────

function fmtVal(n: number, isCurrency?: boolean, isRate?: boolean): string {
  if (isRate) return n > 0 ? `${(n * 100).toFixed(1)}%` : '—';
  if (isCurrency) {
    if (n === 0) return '$0';
    if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
    return `$${n.toLocaleString()}`;
  }
  return n > 0 ? n.toLocaleString() : '0';
}

function getVal(row: HistoricalMonth, def: MetricDef): number {
  if (def.computeFn) return def.computeFn(row);
  if (def.seedField) return (row[def.seedField] as number) ?? 0;
  return 0;
}

function avg(nums: number[]): number {
  const valid = nums.filter(n => n > 0);
  return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
}

// ── Props ──────────────────────────────────────────────────────
interface StrategicPlanViewProps {
  repId: string;
  onGoalsSaved?: () => void;
}

// ── Component ──────────────────────────────────────────────────
export default function StrategicPlanView({ repId, onGoalsSaved }: StrategicPlanViewProps) {
  const initials = REP_ID_TO_INITIALS[repId] ?? '';
  const repData = REP_SEED_DATA[initials];
  const { editable, saveMonth } = useHistorical(repId);
  const history = useMemo(() => editable.slice(-6), [editable]);

  // Auto-computed bottom-funnel metrics from opp card data
  const pipelineMetrics = useMemo(() => {
    const monthKeys = history.map(h => h.month);
    return computeAllPipelineMetrics(repId, monthKeys);
  }, [repId, history]);

  // Goal store
  const setGoal = useGoalStore((s) => s.setGoal);
  const allGoals = useGoalStore((s) => s.goals);
  const storedGoals = useMemo(() => {
    const out: Record<string, MonthlyGoal> = {};
    for (const mk of GOAL_MONTH_KEYS) {
      const g = allGoals[`${repId}_${mk}`];
      if (g) out[mk] = g;
    }
    return out;
  }, [allGoals, repId]);

  // Local goal edits — keyed by `monthKey_metricKey`
  const [goalEdits, setGoalEdits] = useState<Record<string, string>>({});
  const [historyEdits, setHistoryEdits] = useState<Record<string, string>>({});

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // View state
  const [activeView, setActiveView] = useState<'plan' | 'tracker'>('plan');
  const [activeTrackerMonth, setActiveTrackerMonth] = useState<string>(GOAL_MONTH_KEYS[0]);

  // Section collapse state
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));

  // helper to get historical avg
  const getHistAvg = useCallback((defKey: string) => {
    const def = [...OB_ACTIVITY, ...OB_PIPELINE, ...OB_DRIVERS].find(d => d.key === defKey);
    if (!def) return 0;
    const values = history.map(h => getVal(h, def));
    return def.isRate ? avg(values) : Math.round(avg(values));
  }, [history]);

  // helper to get effective goal input (rates are returned as decimals)
  const getGoalInput = useCallback((monthKey: string, metricKey: string): number => {
    const editKey = `${monthKey}_${metricKey}`;
    const def = [...OB_ACTIVITY, ...OB_PIPELINE, ...OB_DRIVERS].find(d => d.key === metricKey);
    
    if (goalEdits[editKey] !== undefined) {
      let v = parseFloat(goalEdits[editKey]) || 0;
      if (def?.isRate) v = v / 100;
      return v;
    }

    const stored = storedGoals[monthKey];
    const hasStored = stored && Object.values(stored).some(v => typeof v === 'number' && v > 0);
    
    if (hasStored) {
      if (metricKey === 'dials') return stored.dials;
      if (metricKey === 'emails_sent') return stored.emails_sent;
      if (metricKey === 'linkedin_touches') return (stored as any).linkedin_touches || 0;
      if (metricKey === 'conversations') return stored.conversations;
      if (metricKey === 'email_conversations') return (stored as any).email_conversations || 0;
      if (metricKey === 'linkedin_conversations') return (stored as any).linkedin_conversations || 0;
      
      // Drivers
      if (metricKey === 'connect_rate') return stored.dials > 0 ? stored.connects / stored.dials : 0;
      // Per-channel scheduled rates from stored goals
      if (metricKey === 'phone_scheduled_rate') {
        const totalConvo = (stored.conversations || 0) + ((stored as any).email_conversations || 0) + ((stored as any).linkedin_conversations || 0);
        return totalConvo > 0 ? stored.discovery_set / totalConvo : 0;
      }
      if (metricKey === 'email_scheduled_rate') return (stored as any)._email_scheduled_rate || 0.08;
      if (metricKey === 'linkedin_scheduled_rate') return (stored as any)._linkedin_scheduled_rate || 0.10;
      if (metricKey === 'show_rate') return stored.discovery_set > 0 ? stored.discovery_held / stored.discovery_set : 0;
      if (metricKey === 'advancement_rate') return stored.discovery_held > 0 ? stored.demo_held / stored.discovery_held : 0;
      if (metricKey === 'proposal_rate') return stored.demo_held > 0 ? stored.proposal_sent / stored.demo_held : 0;
      if (metricKey === 'close_rate') return stored.proposal_sent > 0 ? stored.closed_won / stored.proposal_sent : 0;
      if (metricKey === 'avg_rev_driver') return stored.closed_won > 0 ? stored.revenue / stored.closed_won : 0;
    }

    return getHistAvg(metricKey);
  }, [goalEdits, storedGoals, getHistAvg]);

  // helper to compute funnel downwards
  const getComputedGoal = useCallback((monthKey: string, metricKey: string): number => {
    const isInput = ['dials', 'emails_sent', 'linkedin_touches', 'conversations', 'email_conversations', 'linkedin_conversations', 'connect_rate', 'phone_scheduled_rate', 'email_scheduled_rate', 'linkedin_scheduled_rate', 'show_rate', 'advancement_rate', 'proposal_rate', 'close_rate', 'avg_rev_driver'].includes(metricKey);
    if (isInput) return getGoalInput(monthKey, metricKey);

    if (metricKey === 'phone_connects') return Math.round(getGoalInput(monthKey, 'dials') * getGoalInput(monthKey, 'connect_rate'));
    // Total conversations (computed)
    if (metricKey === 'total_conversations') {
      return Math.round(
        getGoalInput(monthKey, 'conversations') +
        getGoalInput(monthKey, 'email_conversations') +
        getGoalInput(monthKey, 'linkedin_conversations')
      );
    }
    // Meetings booked = weighted multi-channel cascade
    if (metricKey === 'meetings_booked') {
      const phoneConvo = getGoalInput(monthKey, 'conversations');
      const emailConvo = getGoalInput(monthKey, 'email_conversations');
      const liConvo = getGoalInput(monthKey, 'linkedin_conversations');
      const phoneRate = getGoalInput(monthKey, 'phone_scheduled_rate');
      const emailRate = getGoalInput(monthKey, 'email_scheduled_rate');
      const liRate = getGoalInput(monthKey, 'linkedin_scheduled_rate');
      return Math.round(
        (phoneConvo * phoneRate) + (emailConvo * emailRate) + (liConvo * liRate)
      );
    }
    if (metricKey === 'discovery_held') return Math.round(getComputedGoal(monthKey, 'meetings_booked') * getGoalInput(monthKey, 'show_rate'));
    if (metricKey === 'demo_held') return Math.round(getComputedGoal(monthKey, 'discovery_held') * getGoalInput(monthKey, 'advancement_rate'));
    if (metricKey === 'proposal_sent') return Math.round(getComputedGoal(monthKey, 'demo_held') * getGoalInput(monthKey, 'proposal_rate'));
    if (metricKey === 'closed_won') return Math.round(getComputedGoal(monthKey, 'proposal_sent') * getGoalInput(monthKey, 'close_rate'));
    if (metricKey === 'revenue') return Math.round(getComputedGoal(monthKey, 'closed_won') * getGoalInput(monthKey, 'avg_rev_driver'));
    if (metricKey === 'avg_rev') return getGoalInput(monthKey, 'avg_rev_driver');

    return 0;
  }, [getGoalInput]);

  // Set a goal edit
  const setEdit = useCallback((monthKey: string, metricKey: string, value: string) => {
    setGoalEdits(prev => ({ ...prev, [`${monthKey}_${metricKey}`]: value }));
    setSaved(false);
  }, []);

  // ActualStore reader for weekly tracker
  const getActual = useActualStore((s) => s.getActual);

  // Helper to get actual value for a week, translating SPV keys to MetricRow keys
  const getActualValue = useCallback((weekStart: string, spvKey: string): number => {
    const actual = getActual(repId, weekStart);
    if (!actual) return 0;
    const keyMap: Record<string, string> = {
      'phone_connects': 'connects',
      'meetings_booked': 'discovery_set',
    };
    const metricKey = keyMap[spvKey] || spvKey;
    if (spvKey === 'total_conversations') {
      return (actual.conversations || 0) + (actual.email_conversations || 0) + (actual.linkedin_conversations || 0);
    }
    if (spvKey === 'avg_rev') {
      return actual.closed_won > 0 ? Math.round(actual.revenue / actual.closed_won) : 0;
    }
    return (actual as any)[metricKey] ?? 0;
  }, [getActual, repId]);

  // Helper: get weekly tracker total for a metric in a month (from actualStore)
  const getWeeklyTotal = useCallback((monthKey: string, metricKey: string): number => {
    const d = new Date(monthKey + 'T00:00:00');
    const weeks = getWeeksInMonth(d.getFullYear(), d.getMonth());
    let total = 0;
    for (const ws of weeks) {
      total += getActualValue(ws, metricKey);
    }
    return total;
  }, [getActualValue]);

  // Helper: get weekly tracker % of goal
  const getWeeklyPct = useCallback((monthKey: string, metricKey: string): string => {
    const total = getWeeklyTotal(monthKey, metricKey);
    const goal = getComputedGoal(monthKey, metricKey);
    if (goal <= 0 || total <= 0) return '—';
    return `${Math.round((total / goal) * 100)}%`;
  }, [getWeeklyTotal, getComputedGoal]);

  // Save all goals
  const handleSave = useCallback(() => {
    setSaving(true);
    for (const monthKey of GOAL_MONTH_KEYS) {
      setGoal({
        rep_id: repId,
        month: monthKey,
        created_by: 'admin-ryan',
        dials: getComputedGoal(monthKey, 'dials'),
        connects: getComputedGoal(monthKey, 'phone_connects'),
        conversations: getComputedGoal(monthKey, 'conversations'),
        email_conversations: getComputedGoal(monthKey, 'email_conversations'),
        linkedin_conversations: getComputedGoal(monthKey, 'linkedin_conversations'),
        emails_sent: getComputedGoal(monthKey, 'emails_sent'),
        linkedin_touches: getComputedGoal(monthKey, 'linkedin_touches'),

        discovery_set: getComputedGoal(monthKey, 'meetings_booked'),
        discovery_held: getComputedGoal(monthKey, 'discovery_held'),
        demo_held: getComputedGoal(monthKey, 'demo_held'),
        proposal_sent: getComputedGoal(monthKey, 'proposal_sent'),
        closed_won: getComputedGoal(monthKey, 'closed_won'),
        revenue: getComputedGoal(monthKey, 'revenue'),
      });
    }

    // Save historical data
    const editedMonths = new Set(Object.keys(historyEdits).map(k => k.split('_')[0]));
    for (const mk of editedMonths) {
      const baseMonth = history.find(h => h.month === mk);
      if (!baseMonth) continue;
      
      const newMonthData = { ...baseMonth };
      const fieldMap: Record<string, keyof HistoricalMonth> = {
        dials: 'dials', phone_connects: 'connects', emails_sent: 'emails_sent',
        conversations: 'conversations', meetings_booked: 'discovery_set',
        discovery_held: 'discovery_held', demo_held: 'demo_held',
        proposal_sent: 'proposal_sent', closed_won: 'closed_won', revenue: 'revenue',

      };
      
      for (const [metricKey, field] of Object.entries(fieldMap)) {
        const editKey = `${mk}_${metricKey}`;
        if (historyEdits[editKey] !== undefined) {
           (newMonthData as any)[field] = parseFloat(historyEdits[editKey]) || 0;
        }
      }
      saveMonth(newMonthData);
    }



    setSaving(false);
    setSaved(true);
    onGoalsSaved?.();
    setTimeout(() => setSaved(false), 2000);
  }, [repId, goalEdits, historyEdits, history, storedGoals, setGoal, saveMonth, onGoalsSaved, getComputedGoal]);

  // ── Render helpers ─────────────────────────────────────────

  // Section header
  const renderSectionHeader = ({ title, sectionKey, color }: { title: string; sectionKey: string; color: string }) => (
    <button
      onClick={() => toggle(sectionKey)}
      className="flex items-center gap-2 w-full text-left py-2"
    >
      {collapsed[sectionKey]
        ? <ChevronRight size={14} className="text-stone-400" />
        : <ChevronDown size={14} className="text-stone-400" />}
      <span className={`text-[11px] font-bold tracking-widest uppercase ${color}`}>{title}</span>
    </button>
  );

  // Data row
  const renderDataRow = ({ def, isLast }: { def: MetricDef; isLast?: boolean }) => {
    const values = history.map(h => getVal(h, def));
    const avgVal = def.isRate ? avg(values) : Math.round(avg(values));

    return (
      <tr className={`group ${isLast ? '' : 'border-b border-stone-100'} ${def.unavailable ? 'opacity-40' : ''}`}>
        <td className="py-1.5 pl-5 pr-3 text-[13px] text-stone-600 whitespace-nowrap sticky left-0 bg-white z-10 font-medium">
          {def.label}
        </td>
        {/* Historical 6 months */}
        {history.map((h, i) => {
          const mk = h.month;
          const editKey = `${mk}_${def.key}`;
          const isEdited = historyEdits[editKey] !== undefined;
          const val = isEdited ? historyEdits[editKey] : getVal(h, def);

          // Auto-computed pipeline fields: show read-only cell with indicator
          if (PIPELINE_AUTO_FIELDS.has(def.key)) {
            const pipelineVal = pipelineMetrics[h.month]?.[def.key as keyof PipelineMonthMetrics] ?? 0;
            return (
              <td key={i} className="py-1.5 px-2 text-[13px] text-right tabular-nums font-medium bg-blue-50/40">
                <div className="flex items-center justify-end gap-1">
                  <span className="text-[8px] text-blue-400">📊</span>
                  <span className="text-stone-700">{fmtVal(pipelineVal, def.isCurrency, def.isRate)}</span>
                </div>
              </td>
            );
          }

          if (def.computeFn || def.unavailable || def.isRate) {
            return (
              <td key={i} className="py-1.5 px-2 text-[13px] text-stone-700 text-right tabular-nums font-medium">
                {def.unavailable ? '—' : fmtVal(getVal(h, def), def.isCurrency, def.isRate)}
              </td>
            );
          }

          return (
            <td key={i} className="py-1 px-1">
              <input
                type="text"
                value={isEdited ? val : String(val === 0 ? '' : val)}
                onChange={(e) => {
                  setHistoryEdits(prev => ({ ...prev, [editKey]: e.target.value.replace(/[^0-9.]/g, '') }));
                  setSaved(false);
                }}
                placeholder="0"
                className="w-full bg-transparent border border-transparent hover:bg-stone-100/50 rounded-md px-2 py-1 text-[13px] text-stone-700 text-right tabular-nums focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400/50 placeholder-stone-300 transition-all font-medium outline-none"
              />
            </td>
          );
        })}
        {/* Average */}
        <td className="py-1.5 px-2 text-[13px] text-stone-500 text-right tabular-nums font-medium bg-stone-50/50">
          {def.unavailable ? '—' : fmtVal(def.isRate ? avgVal : Math.round(avgVal), def.isCurrency, def.isRate)}
        </td>
        {/* Spacer */}
        <td className="w-3" />
        {/* 90-Day Goal inputs */}
        {def.isGoalInput ? (
          GOAL_MONTH_KEYS.map((mk) => {
            const editKey = `${mk}_${def.key}`;
            const isEdited = goalEdits[editKey] !== undefined;
            const computedBase = getGoalInput(mk, def.key);
            const displayVal = isEdited 
              ? goalEdits[editKey] 
              : (computedBase === 0 ? '' : def.isRate ? (computedBase * 100).toFixed(1) : String(computedBase));

            return (
              <td key={mk} className="py-1 px-1">
                <input
                  type="text"
                  value={displayVal}
                  onChange={(e) => setEdit(mk, def.key, e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="—"
                  className="w-full bg-stone-50/60 border border-stone-200/50 rounded-md px-2 py-1.5 text-[13px] text-stone-800 text-right tabular-nums focus:outline-none focus:ring-1 focus:ring-stone-300 placeholder-stone-300 transition-all font-medium"
                />
              </td>
            );
          })
        ) : (
          GOAL_MONTH_KEYS.map((mk) => {
            const val = getComputedGoal(mk, def.key);
            return (
              <td key={mk} className="py-1.5 px-2 text-[13px] text-stone-600 text-right tabular-nums font-medium bg-stone-50/20">
                {val > 0 ? fmtVal(val, def.isCurrency, def.isRate) : '—'}
              </td>
            );
          })
        )}
        {/* Total + Avg */}
        <td className="py-1.5 px-2 text-[13px] text-stone-400 text-right tabular-nums">—</td>
        <td className="py-1.5 px-2 text-[13px] text-stone-400 text-right tabular-nums">—</td>
      </tr>
    );
  };

  // Metric group (activity/pipeline/drivers)
  const renderMetricGroup = ({ metrics }: { metrics: MetricDef[] }) => (
    <>
      {metrics.map((def, i) => (
        renderDataRow({ def, isLast: i === metrics.length - 1 })
      ))}
    </>
  );

  const isCollapsed = (key: string) => collapsed[key] ?? false;

  return (
    <div className="space-y-4">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-stone-800">
            {repData?.full_name ?? initials} — Strategic Sales Plan
          </h2>
          <p className="text-[12px] text-stone-400 mt-0.5">
            <span className="font-semibold text-stone-500">Q{QUARTER.quarter} {QUARTER.year}</span>
            <span className="mx-1.5 text-stone-300">·</span>
            Day {QUARTER.cycleDayOfYear} of {QUARTER.cycleTotalDays}
            <span className="mx-1.5 text-stone-300">·</span>
            90-day target: {fmtVal(REP_TARGETS[repId] ?? 25000, true)} (based on historical run rate + stretch)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5 bg-stone-100 rounded-lg p-0.5">
            <button
              onClick={() => setActiveView('plan')}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeView === 'plan'
                  ? 'bg-white text-stone-800 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              90-Day Plan
            </button>
            <button
              onClick={() => setActiveView('tracker')}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeView === 'tracker'
                  ? 'bg-white text-stone-800 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Weekly Tracker
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
              saved
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-stone-800 text-white hover:bg-stone-700'
            }`}
          >
            {saved ? <Check size={14} /> : <Save size={14} />}
            {saved ? 'Saved' : saving ? 'Saving...' : 'Save Goals'}
          </button>
        </div>
      </div>

      {/* ── Process Adoption Card ────────────────────────── */}
      <BAPAdoptionCard repId={repId} />

      {/* ── Main Grid (Plan View) ───────────────────────── */}
      {activeView === 'plan' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-stone-200/60 rounded-xl shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-2.5 pl-5 pr-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider sticky left-0 bg-white z-10 w-44">
                    Metric
                  </th>
                  {/* Historical headers */}
                  {MONTH_LABELS.map((m) => (
                    <th key={m} className="py-2.5 px-2 text-[11px] font-bold text-stone-400 text-right uppercase tracking-wider w-16">
                      {m}
                    </th>
                  ))}
                  <th className="py-2.5 px-2 text-[11px] font-bold text-stone-400 text-right uppercase tracking-wider bg-stone-50/50 w-16">
                    Avg
                  </th>
                  {/* Spacer */}
                  <th className="w-3" />
                  {/* Goal headers */}
                  {GOAL_MONTHS.map((m) => (
                    <th key={m} className="py-2.5 px-2 text-[11px] font-bold text-amber-600 text-right uppercase tracking-wider w-20">
                      {m}
                    </th>
                  ))}
                  <th className="py-2.5 px-2 text-[11px] font-bold text-stone-400 text-right uppercase tracking-wider w-16">
                    Total
                  </th>
                  <th className="py-2.5 px-2 text-[11px] font-bold text-stone-400 text-right uppercase tracking-wider w-16">
                    Avg
                  </th>
                </tr>
                {/* Sub-header row */}
                <tr className="border-b border-stone-100">
                  <th className="sticky left-0 bg-white z-10" />
                  <th colSpan={6} className="py-1 text-[10px] text-stone-300 text-center font-normal">
                    Last 6 Months Actuals
                  </th>
                  <th className="bg-stone-50/50" />
                  <th />
                  <th colSpan={3} className="py-1 text-[10px] text-amber-400 text-center font-normal">
                    90-Day Goals
                  </th>
                  <th colSpan={2} />
                </tr>
              </thead>
              <tbody className="text-sm">
                {/* ── OUTBOUND ACTIVITY ──────────────────── */}
                <tr>
                  <td colSpan={14} className="pl-5 pr-3 pt-3 pb-0">
                    {renderSectionHeader({ title: "Outbound Activity", sectionKey: "ob_act", color: "text-blue-600" })}
                  </td>
                </tr>
                  {!isCollapsed('ob_act') && renderMetricGroup({ metrics: OB_ACTIVITY })}

                {/* ── OUTBOUND PIPELINE ──────────────────── */}
                <tr>
                  <td colSpan={14} className="pl-5 pr-3 pt-2 pb-0">
                    {renderSectionHeader({ title: "Outbound Pipeline", sectionKey: "ob_pipe", color: "text-blue-600" })}
                  </td>
                </tr>
                {!isCollapsed('ob_pipe') && renderMetricGroup({ metrics: OB_PIPELINE })}

                {/* ── OUTBOUND DRIVERS ───────────────────── */}
                <tr>
                  <td colSpan={14} className="pl-5 pr-3 pt-2 pb-0">
                    {renderSectionHeader({ title: "Outbound Drivers", sectionKey: "ob_drv", color: "text-blue-600" })}
                  </td>
                </tr>
                {!isCollapsed('ob_drv') && renderMetricGroup({ metrics: OB_DRIVERS })}


              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ── WEEKLY TRACKER (Tracker View) ─────────────────── */}
      {activeView === 'tracker' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Note */}
          <p className="text-[11px] text-stone-400 italic">
            Data populated from your Weekly Tracker. Edit on the Weekly Tracker page.
          </p>

          {/* Month selector */}
          <div className="flex items-center gap-1">
            {GOAL_MONTH_KEYS.map((monthKey, idx) => (
              <button
                key={monthKey}
                onClick={() => setActiveTrackerMonth(monthKey)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTrackerMonth === monthKey
                    ? 'bg-stone-800 text-white shadow-sm'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {GOAL_MONTHS[idx]} {QUARTER.year}
              </button>
            ))}
          </div>

          {/* Render Active Month Tracker */}
          {GOAL_MONTH_KEYS.filter(mk => mk === activeTrackerMonth).map((monthKey) => {
            const mi = GOAL_MONTH_KEYS.indexOf(monthKey);
            const mkDate = new Date(monthKey + 'T00:00:00');
            const weekStarts = getWeeksInMonth(mkDate.getFullYear(), mkDate.getMonth());
            return (
              <div
                key={monthKey}
                className="bg-white border border-stone-200/60 rounded-xl shadow-sm overflow-hidden"
              >
                <div className="w-full flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-stone-50/30">
                  <span className="text-[13px] font-bold text-stone-700 uppercase tracking-wide">
                    {GOAL_MONTHS[mi]} {QUARTER.year} — Weekly Tracker
                  </span>
                </div>
                <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="text-left py-2 px-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider w-8">#</th>
                    <th className="text-left py-2 px-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider w-40">Activity</th>
                    <th className="py-2 px-2 text-[10px] font-bold text-stone-400 text-right uppercase tracking-wider w-16">Mo Goal</th>
                    <th className="py-2 px-2 text-[10px] font-bold text-stone-400 text-right uppercase tracking-wider w-16">Wk Goal</th>
                    {weekStarts.map((ws) => {
                      const d = new Date(ws + 'T00:00:00');
                      return (
                        <th key={ws} className="py-2 px-2 text-[10px] font-bold text-amber-500 text-right uppercase tracking-wider w-16">
                          {d.getMonth() + 1}/{d.getDate()}
                        </th>
                      );
                    })}
                    <th className="py-2 px-2 text-[10px] font-bold text-stone-400 text-right uppercase tracking-wider w-14">Total</th>
                    <th className="py-2 px-2 text-[10px] font-bold text-stone-400 text-right uppercase tracking-wider w-14">%</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Outbound section header */}
                  <tr>
                    <td colSpan={10} className="px-3 pt-2 pb-1">
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Outbound</span>
                    </td>
                  </tr>
                  {[...OB_ACTIVITY.filter(m => !m.unavailable), ...OB_PIPELINE].map((def, idx) => (
                    <tr key={def.key} className="border-b border-stone-50 group hover:bg-stone-50/30">
                      <td className="py-1.5 px-3 text-[12px] text-stone-400 tabular-nums">{idx + 1}</td>
                      <td className="py-1.5 px-3 text-[13px] text-stone-600">{def.label}</td>
                      <td className="py-1.5 px-2 text-[13px] text-stone-400 text-right tabular-nums">
                        {fmtVal(getComputedGoal(monthKey, def.key), def.isCurrency, def.isRate) || '—'}
                      </td>
                      <td className="py-1.5 px-2 text-[13px] text-stone-400 text-right tabular-nums">
                        {(() => {
                          const mo = getComputedGoal(monthKey, def.key);
                          const wks = weekStarts.length || 4;
                          return mo > 0 ? (def.isCurrency ? fmtVal(mo / wks, true) : Math.round(mo / wks).toLocaleString()) : '—';
                        })()}
                      </td>
                      {weekStarts.map((ws) => {
                        const val = getActualValue(ws, def.key);
                        return (
                          <td key={ws} className="py-1.5 px-1.5 text-[12px] text-stone-700 text-right tabular-nums">
                            {val > 0 ? (def.isCurrency ? fmtVal(val, true) : val.toLocaleString()) : '—'}
                          </td>
                        );
                      })}
                      <td className="py-1.5 px-2 text-[13px] text-stone-600 text-right tabular-nums font-medium">
                        {(() => {
                          const t = getWeeklyTotal(monthKey, def.key);
                          return t > 0 ? (def.isCurrency ? fmtVal(t, true) : t.toLocaleString()) : '—';
                        })()}
                      </td>
                      <td className="py-1.5 px-2 text-[13px] text-stone-500 text-right tabular-nums">
                        {getWeeklyPct(monthKey, def.key)}
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          </div>
        );
      })}
        </motion.div>
      )}
    </div>
  );
}

// ── BAP Process Adoption Card ───────────────────────────────
const CP_MAX_SCORES: Record<1 | 2 | 3, number> = { 1: 10, 2: 10, 3: 7.5 };
const CP_LABELS: Record<1 | 2 | 3, string> = { 1: 'Urgency', 2: 'Gap', 3: 'Fit' };

function CircularProgress({ pct, size = 40 }: { pct: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;
  const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#f43f5e';
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e7e5e4" strokeWidth={4} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={4} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        className="transition-all duration-700"
      />
    </svg>
  );
}

interface DealBAP {
  session: DiscoverySession;
  answeredCount: number;
  totalQuestions: number;
  cp: Record<1 | 2 | 3, { score: number; maxScore: number; passed: boolean; label: string; color: string }>;
  allPassed: boolean;
  stalled: boolean;
}

function computeDealBAP(session: DiscoverySession): DealBAP {
  const answers = computeBAPAnswers(session);
  const answeredCount = BAP_QUESTIONS.filter(q => {
    const a = answers[q.id];
    return a === 'yes' || a === 'no' || a === 'maybe';
  }).length;
  const totalQuestions = BAP_QUESTIONS.length;

  const cp = ([1, 2, 3] as const).reduce((acc, checkpoint) => {
    const score = getCheckpointScore(answers, checkpoint);
    const maxScore = CP_MAX_SCORES[checkpoint];
    const status = getCheckpointStatus(score, maxScore);
    acc[checkpoint] = { score, maxScore, ...status };
    return acc;
  }, {} as DealBAP['cp']);

  const allPassed = cp[1].passed && cp[2].passed && cp[3].passed;

  // Stalled: created > 7 days ago AND answered < 4
  const daysSinceCreated = (Date.now() - new Date(session.created_at).getTime()) / (1000 * 60 * 60 * 24);
  const stalled = daysSinceCreated > 7 && answeredCount < 4;

  return { session, answeredCount, totalQuestions, cp, allPassed, stalled };
}

const STAGE_LABELS: Record<string, string> = {
  discovery: 'D1 Discovery',
  diagnosis: 'D2 Diagnosis',
  demonstrate: 'D3 Demo',
  decision: 'D4 Decision',
  closed_won: 'Won',
  closed_lost: 'Lost',
};

function BAPAdoptionCard({ repId }: { repId: string }) {
  const [expanded, setExpanded] = useState(false);

  const { deals, overall, cpRates, bapComplete, stalledCount } = useMemo(() => {
    const activeSessions = getSessionsForRep(repId).filter(s => s.status === 'in_progress');
    const deals = activeSessions.map(computeDealBAP);

    // Overall adoption: avg of (answered / total) across active deals
    const overall = deals.length > 0
      ? Math.round(deals.reduce((sum, d) => sum + (d.answeredCount / d.totalQuestions), 0) / deals.length * 100)
      : 0;

    // CP pass rates: % of active deals that passed each checkpoint
    const cpRates = ([1, 2, 3] as const).reduce((acc, cp) => {
      acc[cp] = deals.length > 0
        ? Math.round(deals.filter(d => d.cp[cp].passed).length / deals.length * 100)
        : 0;
      return acc;
    }, {} as Record<1 | 2 | 3, number>);

    const bapComplete = deals.filter(d => d.allPassed).length;
    const stalledCount = deals.filter(d => d.stalled).length;

    return { deals, overall, cpRates, bapComplete, stalledCount };
  }, [repId]);

  const cpColor = (pct: number) => pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-rose-600';
  const cpBg = (pct: number) => pct >= 70 ? 'bg-emerald-50' : pct >= 40 ? 'bg-amber-50' : 'bg-rose-50';

  const checkpointBadge = (cp: DealBAP['cp'][1]) => {
    if (cp.passed) return <span className="inline-flex items-center gap-0.5 text-emerald-600"><Check size={10} /> ✓</span>;
    if (cp.score >= cp.maxScore / 2) return <span className="text-amber-500">⚠</span>;
    return <span className="text-stone-300">○</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-stone-200/60 rounded-xl shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-2">
        <Target size={14} className="text-violet-500" />
        <h3 className="text-[11px] font-bold tracking-widest uppercase text-violet-600">
          Process Adoption — 5D Discovery Compliance
        </h3>
      </div>

      <div className="p-4">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {/* Overall adoption */}
          <div className="rounded-lg bg-stone-50 p-3 flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <CircularProgress pct={overall} size={40} />
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-stone-700 rotate-0">
                {overall}%
              </span>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-stone-700">Overall</div>
              <div className="text-[10px] text-stone-400">adoption</div>
            </div>
          </div>

          {/* CP1, CP2, CP3 */}
          {([1, 2, 3] as const).map(cp => (
            <div key={cp} className={`rounded-lg ${cpBg(cpRates[cp])} p-3 text-center`}>
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">CP{cp}</div>
              <div className={`text-lg font-bold tabular-nums ${cpColor(cpRates[cp])}`}>{cpRates[cp]}%</div>
              <div className="text-[10px] text-stone-400">{CP_LABELS[cp]}</div>
            </div>
          ))}
        </div>

        {/* Summary line */}
        <div className="flex items-center gap-4 text-[11px] text-stone-500 mb-3">
          <span>Active Deals: <span className="font-semibold text-stone-700">{deals.length}</span></span>
          <span className="text-stone-300">│</span>
          <span>BAP Complete: <span className="font-semibold text-emerald-600">{bapComplete}</span></span>
          <span className="text-stone-300">│</span>
          <span>Stalled: <span className={`font-semibold ${stalledCount > 0 ? 'text-rose-600' : 'text-stone-400'}`}>{stalledCount}</span></span>
        </div>

        {/* Collapsible deal-level table */}
        {deals.length > 0 && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-[11px] font-medium text-stone-500 hover:text-stone-700 transition-colors mb-2"
            >
              {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              Deal-Level BAP Status
            </button>

            {expanded && (
              <div className="border border-stone-100 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-stone-50/50 border-b border-stone-100">
                      <th className="text-left py-2 px-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">Deal</th>
                      <th className="py-2 px-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider text-center w-14">CP1</th>
                      <th className="py-2 px-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider text-center w-14">CP2</th>
                      <th className="py-2 px-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider text-center w-14">CP3</th>
                      <th className="py-2 px-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider text-center w-14">Qs</th>
                      <th className="text-right py-2 px-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">Stage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deals.map((d) => (
                      <tr key={d.session.id} className="border-b border-stone-50 hover:bg-stone-50/30">
                        <td className="py-1.5 px-3 text-[12px] text-stone-700 font-medium truncate max-w-[180px]">
                          {d.session.company_name}
                          {d.stalled && <span className="ml-1.5 text-[9px] font-bold text-rose-500 uppercase">stalled</span>}
                        </td>
                        <td className="py-1.5 px-2 text-center text-[12px]">{checkpointBadge(d.cp[1])}</td>
                        <td className="py-1.5 px-2 text-center text-[12px]">{checkpointBadge(d.cp[2])}</td>
                        <td className="py-1.5 px-2 text-center text-[12px]">{checkpointBadge(d.cp[3])}</td>
                        <td className="py-1.5 px-2 text-center text-[11px] text-stone-400 tabular-nums">{d.answeredCount}/{d.totalQuestions}</td>
                        <td className="py-1.5 px-3 text-right text-[11px] text-stone-400">
                          {STAGE_LABELS[d.session.deal_stage] ?? d.session.deal_stage}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {deals.length === 0 && (
          <div className="text-[12px] text-stone-400 text-center py-3">
            No active discovery sessions for this rep.
          </div>
        )}
      </div>
    </motion.div>
  );
}
