// ============================================================
// GoalWizard → Strategic Sales Plan — Single Pane of Glass
// Matches Sales Autonomy SSP spreadsheet exactly:
//   LEFT:  Last 6 months historicals (editable, saveable)
//   MID:   6-month average (auto-computed)
//   RIGHT: 90-Day Goals (cascade from conversations × rates)
//   BOT:   Drivers (baseline rates → target rates)
// ============================================================
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Check, RotateCcw, Sparkles, Zap, ArrowRight, Edit3,
  ChevronDown, ChevronUp, Target, TrendingUp,
  Phone, Mail, MessageSquare, ArrowDownRight, ArrowUpRight,
} from 'lucide-react';
import { useAuth, REP_PROFILES } from '../contexts/AuthContext';
import { useHistorical } from '../hooks/useHistorical';
import { useCycle } from '../hooks/useCycle';
import { useGoalStore } from '../lib/stores/goalStore';
import { avgMetricRows, safeDiv } from '../lib/math';
import { fmtNum, fmtCurrency, fmtPct } from '../lib/format';
import {
  EMPTY_METRIC_ROW, CASCADE_CHAIN,
  computeCascade, extractBaselineRates, getTotalConversations,
  type MetricKey, type MetricRow, type CascadeRateTargets,
} from '../types';
import type { HistoricalMonth } from '../data/seedData';
import { getMonthlyQuota } from '../data/seedData';
import { REP_ID_TO_INITIALS } from '../contexts/AuthContext';

// ── Constants ──

const CASCADE_DISPLAY: { key: MetricKey; label: string; shortLabel: string }[] = [
  { key: 'conversations', label: 'Phone Conversations', shortLabel: 'Phone' },
  { key: 'discovery_set', label: 'Discovery Set', shortLabel: 'Disc Set' },
  { key: 'discovery_held', label: 'Discovery Held', shortLabel: 'Disc Held' },
  { key: 'demo_held', label: 'Demo Held', shortLabel: 'Demos' },
  { key: 'closed_won', label: 'Closed Won', shortLabel: 'Won' },
  { key: 'closed_lost', label: 'Closed Lost', shortLabel: 'Lost' },
  { key: 'revenue', label: 'Revenue', shortLabel: 'Revenue' },
];

const RATE_KEYS = ['scheduled_rate', 'show_rate', 'proposal_rate', 'close_rate'] as const;
const RATE_LABELS: Record<string, string> = {
  scheduled_rate: 'Scheduled Rate (New Lead → Scheduled)',
  show_rate: 'Attended Rate (Discovery)',
  proposal_rate: 'Attended Rate (Proposal)',
  close_rate: 'Close Rate',
};
const RATE_DESCRIPTIONS: Record<string, string> = {
  scheduled_rate: 'Total Conversations → Disc Set',
  show_rate: 'Disc Set → Disc Held',
  proposal_rate: 'Disc Held → Demo Held',
  close_rate: 'Demo Held → Closed Won',
};

const isCurrency = (k: MetricKey) => k === 'revenue';

function monthLabel(monthStr: string): string {
  return new Date(monthStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' });
}

function fullMonthLabel(monthStr: string): string {
  return new Date(monthStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Returns 3 planning months:
 * - If an active cycle exists, return those months (so edits update the live plan)
 * - If no active plan and we're less than 6 weeks into the current quarter,
 *   return the CURRENT quarter (so a new rep can plan for now, not next quarter)
 * - Otherwise return NEXT quarter
 */
function getPlanningMonths(activeCycle?: { months: [string, string, string] } | null): [string, string, string] {
  // If a cycle is already live, editing it updates those same months
  if (activeCycle) return activeCycle.months;

  const now = new Date();
  const currentMonth0 = now.getMonth(); // 0-indexed
  const currentQuarter = Math.floor(currentMonth0 / 3); // 0-indexed quarter
  const quarterStartMonth0 = currentQuarter * 3;
  const weeksIntoQuarter = (now.getDate() + (currentMonth0 - quarterStartMonth0) * 30) / 7;

  // If we're early in the quarter (< 6 weeks in), plan for the current quarter
  const useCurrentQuarter = weeksIntoQuarter < 6;

  const targetQuarterStart = useCurrentQuarter ? quarterStartMonth0 : (currentQuarter + 1) * 3;
  const targetYear = targetQuarterStart >= 12 ? now.getFullYear() + 1 : now.getFullYear();
  const firstMonth = targetQuarterStart % 12;

  const months: string[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(targetYear, firstMonth + i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`);
  }
  return months as [string, string, string];
}

// ── Team Goals Dashboard (Admin View) ──

function TeamGoalsDashboard() {
  const { startImpersonation } = useAuth();
  const getGoal = useGoalStore((s) => s.getGoal);
  const getAllForRep = useGoalStore((s) => s.getAllForRep);

  // Month navigation
  const now = new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  const viewDate = useMemo(() => {
    const d = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    return d;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthOffset]);
  const currentMonthStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-01`;
  const monthDisplayLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Gather goals for each rep
  const repGoals = useMemo(() => {
    return REP_PROFILES.map((rep) => {
      const goal = getGoal(rep.id, currentMonthStr);
      return { rep, goal };
    });
  }, [currentMonthStr, getGoal]);

  // Compute team totals
  const teamTotals = useMemo(() => {
    const totals = { ...EMPTY_METRIC_ROW };
    for (const { goal } of repGoals) {
      if (!goal) continue;
      for (const { key } of CASCADE_DISPLAY) {
        totals[key] += goal[key] ?? 0;
      }
    }
    return totals;
  }, [repGoals]);

  const TEAM_METRICS: { key: MetricKey; label: string; fmt: (v: number) => string }[] = [
    { key: 'revenue', label: 'Revenue', fmt: fmtCurrency },
    { key: 'conversations', label: 'Conversations', fmt: fmtNum },
    { key: 'discovery_set', label: 'Disc Set', fmt: fmtNum },
    { key: 'discovery_held', label: 'Disc Held', fmt: fmtNum },
    { key: 'demo_held', label: 'Demo Held', fmt: fmtNum },
    { key: 'closed_won', label: 'Closed Won', fmt: fmtNum },
    { key: 'closed_lost', label: 'Closed Lost', fmt: fmtNum },
  ];

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-stone-800 flex items-center gap-2">
          <Target className="w-5 h-5 text-stone-500" />
          Team Goals
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Overview of each rep's monthly targets. Click a rep to view their full Strategic Sales Plan.
        </p>
      </div>

      {/* Month Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMonthOffset((p) => p - 1)}
          className="px-2.5 py-1 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
        >
          ← Prev
        </button>
        <span className="text-sm font-bold text-stone-800 min-w-[160px] text-center">
          {monthDisplayLabel}
        </span>
        <button
          onClick={() => setMonthOffset((p) => p + 1)}
          className="px-2.5 py-1 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Goals Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-stone-500 uppercase tracking-wider w-40">
                  Rep
                </th>
                {TEAM_METRICS.map(({ key, label }) => (
                  <th key={key} className="px-3 py-2.5 text-center text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                    {label}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-center text-[10px] font-bold text-stone-500 uppercase tracking-wider w-24">
                  Status
                </th>
                <th className="px-3 py-2.5 w-20" />
              </tr>
            </thead>
            <tbody>
              {repGoals.map(({ rep, goal }) => {
                const hasGoal = !!goal;
                return (
                  <tr
                    key={rep.id}
                    className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors cursor-pointer group"
                    onClick={() => startImpersonation(rep.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                          style={{ backgroundColor: rep.avatar_color }}
                        >
                          {rep.initials}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-stone-800">{rep.full_name}</div>
                        </div>
                      </div>
                    </td>
                    {TEAM_METRICS.map(({ key, fmt }) => (
                      <td key={key} className="px-3 py-3 text-center">
                        <span className={`text-xs tabular-nums font-medium ${
                          hasGoal ? (key === 'revenue' ? 'text-stone-800 font-bold' : 'text-stone-700') : 'text-stone-300'
                        }`}>
                          {hasGoal ? fmt(Math.round(goal[key] ?? 0)) : '—'}
                        </span>
                      </td>
                    ))}
                    <td className="px-3 py-3 text-center">
                      {hasGoal ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700">
                          <Check className="w-2.5 h-2.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-stone-100 text-stone-400">
                          No Plan
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="text-[10px] font-bold text-stone-400 group-hover:text-stone-700 transition-colors flex items-center gap-1 justify-end">
                        View <ArrowRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* Team Totals Row */}
              <tr className="bg-stone-50 border-t-2 border-stone-200">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-stone-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      Σ
                    </div>
                    <span className="text-xs font-bold text-stone-800">Team Total</span>
                  </div>
                </td>
                {TEAM_METRICS.map(({ key, fmt }) => (
                  <td key={key} className="px-3 py-3 text-center">
                    <span className={`text-xs tabular-nums font-bold ${
                      key === 'revenue' ? 'text-stone-900' : 'text-stone-700'
                    }`}>
                      {fmt(Math.round(teamTotals[key]))}
                    </span>
                  </td>
                ))}
                <td className="px-3 py-3" />
                <td className="px-3 py-3" />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tip */}
      <div className="flex items-center gap-2 px-4 py-3 bg-stone-50 rounded-xl border border-stone-200">
        <Sparkles className="w-4 h-4 text-stone-400 shrink-0" />
        <p className="text-xs text-stone-500">
          Click any rep row to view and edit their full Strategic Sales Plan. Use the sidebar to switch between reps.
        </p>
      </div>
    </div>
  );
}

// ── Main Component ──

export default function GoalWizard() {
  const { effectiveUser, isAdmin, isImpersonating } = useAuth();
  const isTeamView = isAdmin && !isImpersonating;
  const repId = effectiveUser?.id ?? '';
  const { editable, saveMonth, reset: resetHistorical } = useHistorical(repId);
  const { activeCycle, saveCycle } = useCycle(repId);
  const setGoal = useGoalStore((s) => s.setGoal);
  const getGoal = useGoalStore((s) => s.getGoal);

  // The trailing 6 months for baseline
  const baseline6 = useMemo(() => editable.slice(-6), [editable]);
  const baselineAvg = useMemo(() => avgMetricRows(baseline6 as MetricRow[]), [baseline6]);
  const baselineCascade = useMemo(() => extractBaselineRates(baselineAvg), [baselineAvg]);

  // Forward-looking months — current quarter if new plan, active cycle months if editing
  const targetMonths = useMemo(() => getPlanningMonths(activeCycle), [activeCycle]);

  // ── Historical editing state ──
  const [editingHistorical, setEditingHistorical] = useState(false);
  const [dirtyMonths, setDirtyMonths] = useState<Record<string, Partial<HistoricalMonth>>>({});
  const [savedHistorical, setSavedHistorical] = useState(false);

  const handleHistoricalChange = useCallback((monthKey: string, metric: MetricKey, value: number) => {
    setDirtyMonths((prev) => ({
      ...prev,
      [monthKey]: { ...prev[monthKey], [metric]: value },
    }));
  }, []);

  const handleSaveHistorical = useCallback(() => {
    for (const [monthKey, changes] of Object.entries(dirtyMonths)) {
      const existing = baseline6.find((m) => m.month === monthKey);
      if (existing) {
        saveMonth({ ...existing, ...changes, month: monthKey } as HistoricalMonth);
      }
    }
    setDirtyMonths({});
    setEditingHistorical(false);
    setSavedHistorical(true);
    setTimeout(() => setSavedHistorical(false), 2000);
  }, [dirtyMonths, baseline6, saveMonth]);

  // Get value for display (dirty value takes precedence)
  const getHistoricalValue = useCallback((monthKey: string, metric: MetricKey): number => {
    const dirty = dirtyMonths[monthKey]?.[metric as keyof HistoricalMonth];
    if (dirty !== undefined) return dirty as number;
    const m = baseline6.find((h) => h.month === monthKey);
    return (m as any)?.[metric] ?? 0;
  }, [dirtyMonths, baseline6]);

  // Get IB/OB fields (not MetricKey — these are HistoricalMonth-specific)
  const getIbObValue = useCallback((monthKey: string, field: 'ib_won' | 'ib_revenue' | 'ob_won' | 'ob_revenue' | 'ib_opps' | 'ob_opps'): number => {
    const dirty = dirtyMonths[monthKey]?.[field];
    if (dirty !== undefined) return dirty as number;
    const m = baseline6.find((h) => h.month === monthKey);
    return m?.[field] ?? 0;
  }, [dirtyMonths, baseline6]);

  // Compute IB/OB averages across baseline
  const ibObAvg = useMemo(() => {
    const sums = { ib_opps: 0, ob_opps: 0, ib_won: 0, ib_revenue: 0, ob_won: 0, ob_revenue: 0 };
    let count = 0;
    for (const m of baseline6) {
      const dirty = dirtyMonths[m.month];
      sums.ib_opps += (dirty?.ib_opps as number ?? m.ib_opps) || 0;
      sums.ob_opps += (dirty?.ob_opps as number ?? m.ob_opps) || 0;
      sums.ib_won += (dirty?.ib_won as number ?? m.ib_won) || 0;
      sums.ib_revenue += (dirty?.ib_revenue as number ?? m.ib_revenue) || 0;
      sums.ob_won += (dirty?.ob_won as number ?? m.ob_won) || 0;
      sums.ob_revenue += (dirty?.ob_revenue as number ?? m.ob_revenue) || 0;
      count++;
    }
    return {
      ib_opps: count > 0 ? sums.ib_opps / count : 0,
      ob_opps: count > 0 ? sums.ob_opps / count : 0,
      ib_won: count > 0 ? sums.ib_won / count : 0,
      ib_revenue: count > 0 ? sums.ib_revenue / count : 0,
      ob_won: count > 0 ? sums.ob_won / count : 0,
      ob_revenue: count > 0 ? sums.ob_revenue / count : 0,
    };
  }, [baseline6, dirtyMonths]);

  // Compute live averages (including dirty edits)
  const liveAvg = useMemo((): MetricRow => {
    const rows = baseline6.map((m) => {
      const dirty = dirtyMonths[m.month];
      if (!dirty) return m as MetricRow;
      return { ...m, ...dirty } as MetricRow;
    });
    return avgMetricRows(rows);
  }, [baseline6, dirtyMonths]);

  const liveCascade = useMemo(() => extractBaselineRates(liveAvg), [liveAvg]);

  // ── 90-Day Goals (cascade state) ──
  const [monthRates, setMonthRates] = useState<Record<string, CascadeRateTargets>>(() => {
    const init: Record<string, CascadeRateTargets> = {};
    for (const m of targetMonths) {
      init[m] = { ...baselineCascade };
    }
    return init;
  });

  // Re-init when baseline loads (only if all zeros)
  useEffect(() => {
    if (liveCascade.conversations > 0) {
      setMonthRates((prev) => {
        const allDefault = Object.values(prev).every((r) => r.conversations === 0);
        if (allDefault) {
          const init: Record<string, CascadeRateTargets> = {};
          for (const m of targetMonths) {
            init[m] = { ...liveCascade };
          }
          return init;
        }
        return prev;
      });
    }
  }, [liveCascade, targetMonths]);

  // Cascaded goals
  const cascadedGoals = useMemo(() => {
    const result: Record<string, MetricRow> = {};
    for (const m of targetMonths) {
      result[m] = computeCascade(monthRates[m] ?? liveCascade);
    }
    return result;
  }, [monthRates, targetMonths, liveCascade]);

  // 90-day totals
  const totals90 = useMemo(() => {
    const result: MetricRow = { ...EMPTY_METRIC_ROW };
    for (const m of targetMonths) {
      for (const { key } of CASCADE_DISPLAY) {
        result[key] += cascadedGoals[m]?.[key] ?? 0;
      }
      // Also accumulate per-channel conversations
      result.email_conversations += cascadedGoals[m]?.email_conversations ?? 0;
      result.linkedin_conversations += cascadedGoals[m]?.linkedin_conversations ?? 0;
    }
    return result;
  }, [cascadedGoals, targetMonths]);

  // 90-day averages
  const avg90 = useMemo(() => {
    const result: MetricRow = { ...EMPTY_METRIC_ROW };
    for (const { key } of CASCADE_DISPLAY) {
      result[key] = Math.round(totals90[key] / 3);
    }
    return result;
  }, [totals90]);

  const updateRate = useCallback((month: string, key: string, value: number) => {
    setMonthRates((prev) => ({
      ...prev,
      [month]: { ...prev[month], [key]: value },
    }));
  }, []);

  // Sync rates to baseline when baseline changes
  const syncRatesToBaseline = useCallback(() => {
    const init: Record<string, CascadeRateTargets> = {};
    for (const m of targetMonths) {
      init[m] = { ...liveCascade };
    }
    setMonthRates(init);
  }, [targetMonths, liveCascade]);

  // ── Activate Plan ──
  // planSaved stays true until the user navigates away or saves again
  const [planSaved, setPlanSaved] = useState(!!activeCycle);
  const handleActivate = useCallback(() => {
    for (const m of targetMonths) {
      setGoal({
        rep_id: repId,
        month: m,
        created_by: repId,
        ...cascadedGoals[m],
      });
    }
    saveCycle({
      rep_id: repId,
      start_month: targetMonths[0],
      baseline_months: baseline6.map((m) => m.month),
      baseline_averages: liveAvg,
      baseline_rates: liveCascade as any,
      months: targetMonths,
      status: 'active',
      focus_area: undefined,
    });
    setPlanSaved(true);
  }, [targetMonths, cascadedGoals, repId, setGoal, saveCycle, baseline6, liveAvg, liveCascade]);

  // ── Auto-sync goals to store when cascade changes & plan is active ──
  // This keeps the Weekly Tracker aligned without requiring a manual re-save.
  // On mount: syncs immediately if stored goals are stale (e.g. after data correction).
  // On edit: debounces at 500ms so it doesn't save on every keystroke.
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!planSaved) return;

    const goalsAreStale = targetMonths.some((m) => {
      const stored = getGoal(repId, m);
      const cascade = cascadedGoals[m];
      if (!stored || !cascade) return true;
      // Compare a few key metrics to detect drift
      return (
        Math.round(stored.conversations ?? 0) !== Math.round(cascade.conversations ?? 0) ||
        Math.round(stored.discovery_set ?? 0) !== Math.round(cascade.discovery_set ?? 0) ||
        Math.round(stored.demo_held ?? 0) !== Math.round(cascade.demo_held ?? 0) ||
        Math.round(stored.closed_won ?? 0) !== Math.round(cascade.closed_won ?? 0) ||
        Math.round(stored.revenue ?? 0) !== Math.round(cascade.revenue ?? 0)
      );
    });

    if (!goalsAreStale && hasMountedRef.current) return;
    hasMountedRef.current = true;

    const delay = goalsAreStale && !hasMountedRef.current ? 0 : 500;
    const timer = setTimeout(() => {
      for (const m of targetMonths) {
        setGoal({
          rep_id: repId,
          month: m,
          created_by: repId,
          ...cascadedGoals[m],
        });
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [planSaved, cascadedGoals, targetMonths, repId, setGoal, getGoal]);

  // ── Drivers section expand ──
  const [driversExpanded, setDriversExpanded] = useState(true);

  // ── IB/OB source breakdown expand (collapsed by default) ──
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const toggleSource = useCallback((key: string) => {
    setExpandedSources((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  if (!effectiveUser) return null;

  // Admin not impersonating → show team goals dashboard
  if (isTeamView) {
    return <TeamGoalsDashboard />;
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            Strategic Sales Plan
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Your complete data & modeling view. Historicals on the left, 90-day cascade on the right.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleActivate}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              planSaved
                ? 'bg-emerald-500 text-white'
                : 'bg-stone-800 text-white hover:bg-stone-700'
            }`}
          >
            {planSaved ? (
              <><Check className="w-3.5 h-3.5" /> Plan Saved</>
            ) : (
              <><Save className="w-3.5 h-3.5" /> {activeCycle ? 'Update Plan' : 'Save Plan'}</>
            )}
          </button>
        </div>
      </div>

      {/* Plan Is Live Banner */}
      {planSaved && (
        <div className="flex items-center justify-between px-5 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-600" />
            <p className="text-sm font-bold text-emerald-800">Plan saved</p>
            <span className="text-xs text-emerald-600">— go to your Weekly Tracker to start executing.</span>
          </div>
          <a
            href="/team/tracker"
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
          >
            Go to Tracker <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MAIN TABLE — The SSP Spreadsheet
          Left: 6 months historicals | Middle: Avg | Right: 3 months goals
         ══════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {/* Column Headers */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              {/* Group Headers */}
              <tr className="border-b border-stone-200">
                <th className="px-3 py-2 w-32" />
                <th colSpan={6} className="text-center py-2 text-[10px] font-bold text-stone-500 bg-amber-50/50 border-l border-r border-stone-100">
                  <div className="flex items-center justify-center gap-2">
                    Last 6 Months Actuals
                    <button
                      onClick={() => setEditingHistorical(!editingHistorical)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold transition-colors ${
                        editingHistorical
                          ? 'bg-amber-200 text-amber-800'
                          : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                      }`}
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                      {editingHistorical ? 'Editing' : 'Edit'}
                    </button>
                  </div>
                </th>
                <th className="px-2 py-2 bg-stone-100 border-l border-r border-stone-200 text-center text-[10px] font-bold text-stone-600">
                  Avg
                </th>
                <th className="px-1 py-2 w-3" />
                <th colSpan={3} className="text-center py-2 text-[10px] font-bold text-violet-600 bg-violet-50/30 border-l border-r border-stone-100">
                  90-Day Goals
                </th>
                <th className="px-2 py-2 bg-stone-100 border-l border-stone-200 text-center text-[10px] font-bold text-stone-600">
                  Total
                </th>
                <th className="px-2 py-2 bg-stone-100 border-l border-stone-200 text-center text-[10px] font-bold text-stone-600">
                  Avg
                </th>
              </tr>
              {/* Month Names */}
              <tr className="border-b border-stone-100">
                <th className="px-3 py-2 text-left text-[10px] font-bold text-stone-500">
                  Funnel
                </th>
                {baseline6.map((m) => (
                  <th key={m.month} className="text-center px-2 py-2 text-[10px] font-medium text-stone-500 bg-amber-50/30">
                    {monthLabel(m.month)}
                  </th>
                ))}
                <th className="text-center px-2 py-2 text-[10px] font-bold text-stone-700 bg-stone-100" />
                <th className="px-1 py-2 w-3" />
                {targetMonths.map((m, mi) => (
                  <th key={m} className="text-center px-2 py-2 bg-violet-50/20">
                    <span className={`text-[10px] font-bold ${
                      mi === 0 ? 'text-blue-600' : mi === 1 ? 'text-violet-600' : 'text-emerald-600'
                    }`}>
                      {fullMonthLabel(m)}
                    </span>
                  </th>
                ))}
                <th className="text-center px-2 py-2 bg-stone-100" />
                <th className="text-center px-2 py-2 bg-stone-100" />
              </tr>
            </thead>
            <tbody>
              {/* ── FUNNEL ROWS ── */}
              {CASCADE_DISPLAY.map(({ key, label }, ri) => {
                const isConversations = key === 'conversations';
                const isClosedWon = key === 'closed_won';
                const isRevenue = key === 'revenue';
                const isRev = isCurrency(key);
                const fmt = isRev ? fmtCurrency : fmtNum;
                const avgVal = liveAvg[key];

                // Helper to render an IB or OB sub-row (read-only, derived from historicals)
                const renderSourceRow = (
                  sourceLabel: string,
                  ibObField: 'ib_won' | 'ob_won' | 'ib_revenue' | 'ob_revenue' | 'ib_opps' | 'ob_opps',
                  icon: React.ReactNode,
                  isCurr: boolean,
                  bgClass: string,
                ) => {
                  const fmtFn = isCurr ? fmtCurrency : fmtNum;
                  const avgKey = ibObField as keyof typeof ibObAvg;
                  return (
                    <tr key={ibObField} className={`border-b border-stone-50 hover:bg-stone-50/30 transition-colors ${bgClass}`}>
                      <td className="px-3 py-1.5 text-xs font-medium text-stone-500 sticky left-0 bg-white z-10">
                        <div className="flex items-center gap-1.5 pl-3">
                          {icon}
                          {sourceLabel}
                        </div>
                      </td>
                      {baseline6.map((m) => {
                        const val = getIbObValue(m.month, ibObField);
                        const isDirty = dirtyMonths[m.month]?.[ibObField] !== undefined;
                        return (
                          <td key={m.month} className={`text-center px-1 py-1.5 ${isDirty ? 'bg-amber-50' : ''}`}>
                            {editingHistorical ? (
                              <input
                                type="number"
                                min={0}
                                value={val || ''}
                                onChange={(e) => handleHistoricalChange(m.month, ibObField as any, parseInt(e.target.value) || 0)}
                                className={`w-full text-center text-xs font-medium tabular-nums bg-white border rounded px-1 py-1 focus:outline-none focus:ring-1 ${
                                  isDirty ? 'border-amber-300 focus:ring-amber-400' : 'border-stone-200 focus:ring-stone-400'
                                }`}
                              />
                            ) : (
                              <span className={`text-xs tabular-nums ${ibObField.startsWith('ob') ? 'text-blue-600' : 'text-stone-400'}`}>
                                {isCurr ? fmtCurrency(val) : fmtNum(val)}
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="text-center px-2 py-1.5 bg-stone-50 border-l border-r border-stone-100">
                        <span className={`text-xs font-bold tabular-nums ${ibObField.startsWith('ob') ? 'text-blue-700' : 'text-stone-500'}`}>
                          {fmtFn(Math.round(ibObAvg[avgKey]))}
                        </span>
                      </td>
                      <td className="px-1 w-3" />
                      {/* Goal columns — outbound shows cascade value, inbound shows dash (not modeled) */}
                      {targetMonths.map((gm) => (
                        <td key={gm} className="text-center px-2 py-1.5 bg-violet-50/10">
                          <span className="text-[10px] text-stone-300">—</span>
                        </td>
                      ))}
                      <td className="text-center px-2 py-1.5 bg-stone-50 border-l border-stone-100">
                        <span className="text-[10px] text-stone-300">—</span>
                      </td>
                      <td className="text-center px-2 py-1.5 bg-stone-50 border-l border-stone-100">
                        <span className="text-[10px] text-stone-300">—</span>
                      </td>
                    </tr>
                  );
                };

                // Helper to render a single conversation channel row (editable driver)
                const renderChannelRow = (
                  channelKey: 'conversations' | 'email_conversations' | 'linkedin_conversations',
                  channelLabel: string,
                  icon: React.ReactNode,
                  bgClass: string,
                ) => (
                  <tr key={channelKey} className={`border-b border-stone-50 hover:bg-stone-50/30 transition-colors ${bgClass}`}>
                    <td className="px-3 py-1.5 text-xs font-medium text-stone-600 sticky left-0 bg-white z-10">
                      <div className="flex items-center gap-1.5 pl-3">
                        {icon}
                        {channelLabel}
                      </div>
                    </td>
                    {baseline6.map((m) => {
                      const val = getHistoricalValue(m.month, channelKey);
                      const isDirty = dirtyMonths[m.month]?.[channelKey as keyof HistoricalMonth] !== undefined;
                      return (
                        <td key={m.month} className={`text-center px-1 py-1 ${isDirty ? 'bg-amber-50' : ''}`}>
                          {editingHistorical ? (
                            <input
                              type="number"
                              min={0}
                              value={val || ''}
                              onChange={(e) => handleHistoricalChange(m.month, channelKey, parseInt(e.target.value) || 0)}
                              className={`w-full text-center text-xs font-medium tabular-nums bg-white border rounded px-1 py-1 focus:outline-none focus:ring-1 ${
                                isDirty ? 'border-amber-300 focus:ring-amber-400' : 'border-stone-200 focus:ring-stone-400'
                              }`}
                            />
                          ) : (
                            <span className="text-xs text-stone-500 tabular-nums">{fmtNum(val)}</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="text-center px-2 py-1.5 bg-stone-50 border-l border-r border-stone-100">
                      <span className="text-xs font-bold text-stone-700 tabular-nums">
                        {fmtNum(Math.round(liveAvg[channelKey]))}
                      </span>
                    </td>
                    <td className="px-1 w-3" />
                    {targetMonths.map((gm) => (
                      <td key={gm} className="text-center px-1 py-1 bg-amber-50/40">
                        <input
                          type="number"
                          min={0}
                          value={monthRates[gm]?.[channelKey] || ''}
                          onChange={(e) => updateRate(gm, channelKey, parseInt(e.target.value) || 0)}
                          className="w-full text-center text-xs font-bold text-stone-800 bg-white border border-stone-200 rounded-md px-1 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-300 focus:border-stone-300 tabular-nums transition-colors"
                        />
                      </td>
                    ))}
                    <td className="text-center px-2 py-1.5 bg-stone-50 border-l border-stone-100">
                      <span className="text-xs font-bold text-stone-700 tabular-nums">
                        {fmtNum(targetMonths.reduce((s, gm) => s + (cascadedGoals[gm]?.[channelKey] ?? 0), 0))}
                      </span>
                    </td>
                    <td className="text-center px-2 py-1.5 bg-stone-50 border-l border-stone-100">
                      <span className="text-xs font-bold text-stone-700 tabular-nums">
                        {fmtNum(Math.round(targetMonths.reduce((s, gm) => s + (cascadedGoals[gm]?.[channelKey] ?? 0), 0) / 3))}
                      </span>
                    </td>
                  </tr>
                );

                // For conversations, render Total row first, then collapsible channels
                if (isConversations) {
                  // Compute total conversations across channels for historicals
                  const totalAvg = getTotalConversations(liveAvg);
                  const total90 = targetMonths.reduce((s, gm) => s + getTotalConversations(cascadedGoals[gm] ?? EMPTY_METRIC_ROW), 0);
                  const channelsExpanded = expandedSources.has('conversations');

                  return (
                    <React.Fragment key="conversation-channels">
                      {/* Total Conversations (main visible row with chevron) */}
                      <tr className="border-b border-stone-100 bg-amber-50/30">
                        <td
                          className="px-3 py-2 text-xs font-bold text-stone-800 sticky left-0 bg-amber-50/30 z-10 cursor-pointer select-none"
                          onClick={() => toggleSource('conversations')}
                        >
                          <div className="flex items-center gap-1">
                            <ChevronDown
                              className={`w-3 h-3 text-stone-400 transition-transform duration-200 flex-shrink-0 ${
                                channelsExpanded ? '' : '-rotate-90'
                              }`}
                            />
                            Total Conversations
                          </div>
                        </td>
                        {baseline6.map((m) => {
                          const phone = getHistoricalValue(m.month, 'conversations');
                          const email = getHistoricalValue(m.month, 'email_conversations');
                          const li = getHistoricalValue(m.month, 'linkedin_conversations');
                          const total = phone + email + li;
                          return (
                            <td key={m.month} className="text-center px-2 py-2">
                              <span className="text-xs font-bold text-stone-700 tabular-nums">
                                {fmtNum(total)}
                              </span>
                            </td>
                          );
                        })}
                        <td className="text-center px-2 py-2 bg-stone-50 border-l border-r border-stone-100">
                          <span className="text-xs font-bold text-stone-800 tabular-nums">
                            {fmtNum(Math.round(totalAvg))}
                          </span>
                        </td>
                        <td className="px-1 w-3" />
                        {targetMonths.map((gm) => {
                          const totalGoal = (monthRates[gm]?.conversations ?? liveCascade.conversations)
                            + (monthRates[gm]?.email_conversations ?? liveCascade.email_conversations)
                            + (monthRates[gm]?.linkedin_conversations ?? liveCascade.linkedin_conversations);
                          return (
                            <td key={gm} className="text-center px-1 py-1 bg-amber-50/40">
                              <input
                                type="number"
                                min={0}
                                value={totalGoal || ''}
                                onChange={(e) => {
                                  const newTotal = parseInt(e.target.value) || 0;
                                  // Distribute: keep email/linkedin as-is, put remainder in phone
                                  const emailConvos = monthRates[gm]?.email_conversations ?? liveCascade.email_conversations;
                                  const liConvos = monthRates[gm]?.linkedin_conversations ?? liveCascade.linkedin_conversations;
                                  const phoneConvos = Math.max(0, newTotal - emailConvos - liConvos);
                                  updateRate(gm, 'conversations', phoneConvos);
                                }}
                                className="w-full text-center text-xs font-bold text-stone-800 bg-white border border-stone-200 rounded-md px-1 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-300 tabular-nums transition-colors"
                              />
                            </td>
                          );
                        })}
                        <td className="text-center px-2 py-2 bg-stone-50 border-l border-stone-100">
                          <span className="text-xs font-bold text-stone-800 tabular-nums">
                            {fmtNum(total90)}
                          </span>
                        </td>
                        <td className="text-center px-2 py-2 bg-stone-50 border-l border-stone-100">
                          <span className="text-xs font-bold text-stone-800 tabular-nums">
                            {fmtNum(Math.round(total90 / 3))}
                          </span>
                        </td>
                      </tr>
                      {/* Channel detail rows (collapsed by default) */}
                      {channelsExpanded && (
                        <>
                          {renderChannelRow('conversations', 'Phone Conversations', <Phone className="w-3 h-3 text-blue-500" />, 'bg-amber-50/20')}
                          {renderChannelRow('email_conversations', 'Email Conversations', <Mail className="w-3 h-3 text-orange-500" />, 'bg-amber-50/10')}
                          {renderChannelRow('linkedin_conversations', 'LinkedIn Conversations', <MessageSquare className="w-3 h-3 text-sky-600" />, 'bg-amber-50/10')}
                        </>
                      )}
                    </React.Fragment>
                  );
                }

                // Determine if this row needs IB/OB sub-rows
                const needsSourceSplit = isClosedWon || isRevenue || key === 'discovery_set';
                const isDiagnostic = key === 'closed_lost';

                const mainRow = (
                  <tr key={key} className={`border-b border-stone-50 hover:bg-stone-50/30 transition-colors ${isDiagnostic ? 'opacity-70' : ''}`}>
                    {/* Metric Label */}
                    <td
                      className={`px-3 py-2 text-xs font-medium sticky left-0 bg-white z-10 ${
                        needsSourceSplit ? 'cursor-pointer select-none text-stone-700' :
                        isDiagnostic ? 'text-stone-500 italic' : 'text-stone-700'
                      }`}
                      onClick={needsSourceSplit ? () => toggleSource(key) : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {needsSourceSplit && (
                          <ChevronDown
                            className={`w-3 h-3 text-stone-400 transition-transform duration-200 flex-shrink-0 ${
                              expandedSources.has(key) ? '' : '-rotate-90'
                            }`}
                          />
                        )}
                        {label}
                      </div>
                    </td>

                    {/* Historical months (editable) */}
                    {baseline6.map((m) => {
                      const val = getHistoricalValue(m.month, key);
                      const isDirty = dirtyMonths[m.month]?.[key as keyof HistoricalMonth] !== undefined;

                      return (
                        <td key={m.month} className={`text-center px-1 py-1.5 ${isDirty ? 'bg-amber-50' : ''}`}>
                          {editingHistorical ? (
                            <input
                              type="number"
                              min={0}
                              value={val || ''}
                              onChange={(e) => handleHistoricalChange(m.month, key, parseInt(e.target.value) || 0)}
                              className={`w-full text-center text-xs font-medium tabular-nums bg-white border rounded px-1 py-1 focus:outline-none focus:ring-1 ${
                                isDirty ? 'border-amber-300 focus:ring-amber-400' : 'border-stone-200 focus:ring-stone-400'
                              }`}
                            />
                          ) : (
                            <span className="text-xs text-stone-600 tabular-nums">
                              {isRev ? fmtCurrency(val) : fmtNum(val)}
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* 6-Month Average */}
                    <td className="text-center px-2 py-2 bg-stone-50 border-l border-r border-stone-100">
                      <span className="text-xs font-bold text-stone-800 tabular-nums">
                        {isRev ? fmtCurrency(Math.round(avgVal)) : fmtNum(Math.round(avgVal))}
                      </span>
                    </td>

                    {/* Spacer */}
                    <td className="px-1 w-3" />

                    {/* 90-Day Goal months */}
                    {targetMonths.map((gm, mi) => {
                      if (isDiagnostic) {
                        return (
                          <td key={gm} className="text-center px-2 py-1.5 bg-violet-50/10">
                            <span className="text-[10px] text-stone-300">—</span>
                          </td>
                        );
                      }
                      const goalVal = cascadedGoals[gm]?.[key] ?? 0;

                      return (
                        <td key={gm} className="text-center px-1 py-1.5 bg-violet-50/20">
                          <span className={`text-xs font-medium tabular-nums ${
                            goalVal > Math.round(avgVal) ? 'text-emerald-700 font-bold' : 'text-violet-900'
                          }`}>
                            {isRev ? fmtCurrency(goalVal) : fmtNum(goalVal)}
                          </span>
                        </td>
                      );
                    })}

                    {/* 90-Day Total */}
                    <td className="text-center px-2 py-2 bg-stone-50 border-l border-stone-100">
                      {isDiagnostic ? (
                        <span className="text-[10px] text-stone-300">—</span>
                      ) : (
                        <span className="text-xs font-bold text-stone-800 tabular-nums">
                          {isRev ? fmtCurrency(totals90[key]) : fmtNum(totals90[key])}
                        </span>
                      )}
                    </td>

                    {/* 90-Day Average */}
                    <td className="text-center px-2 py-2 bg-stone-50 border-l border-stone-100">
                      {isDiagnostic ? (
                        <span className="text-[10px] text-stone-300">—</span>
                      ) : (
                        <span className="text-xs font-bold text-stone-800 tabular-nums">
                          {isRev ? fmtCurrency(avg90[key]) : fmtNum(avg90[key])}
                        </span>
                      )}
                    </td>
                  </tr>
                );

                if (!needsSourceSplit) return mainRow;

                return (
                  <React.Fragment key={`${key}-with-source`}>
                    {mainRow}
                    {expandedSources.has(key) && (
                      <>
                        {renderSourceRow(
                          key === 'discovery_set' ? 'Outbound Opps' : isClosedWon ? 'Outbound Won' : 'Outbound Revenue',
                          key === 'discovery_set' ? 'ob_opps' : isClosedWon ? 'ob_won' : 'ob_revenue',
                          <ArrowUpRight className="w-3 h-3 text-blue-500" />,
                          key === 'revenue',
                          'bg-blue-50/20',
                        )}
                        {renderSourceRow(
                          key === 'discovery_set' ? 'Inbound Opps' : isClosedWon ? 'Inbound Won' : 'Inbound Revenue',
                          key === 'discovery_set' ? 'ib_opps' : isClosedWon ? 'ib_won' : 'ib_revenue',
                          <ArrowDownRight className="w-3 h-3 text-amber-500" />,
                          key === 'revenue',
                          'bg-amber-50/10',
                        )}
                      </>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Avg Revenue per Sale row */}
              <tr className="border-b border-stone-50 hover:bg-stone-50/30">
                <td className="px-3 py-2 text-xs font-medium text-stone-500 italic sticky left-0 bg-white z-10">
                  Avg Rev / Sale
                </td>
                {baseline6.map((m) => {
                  const won = getHistoricalValue(m.month, 'closed_won');
                  const rev = getHistoricalValue(m.month, 'revenue');
                  return (
                    <td key={m.month} className="text-center px-2 py-2 text-xs text-stone-400 tabular-nums">
                      {won > 0 ? fmtCurrency(Math.round(rev / won)) : '—'}
                    </td>
                  );
                })}
                <td className="text-center px-2 py-2 bg-stone-50 border-l border-r border-stone-100 text-xs font-bold text-stone-600 tabular-nums">
                  {liveAvg.closed_won > 0 ? fmtCurrency(Math.round(liveAvg.revenue / liveAvg.closed_won)) : '—'}
                </td>
                <td className="px-1 w-3" />
                {targetMonths.map((gm) => (
                  <td key={gm} className="text-center px-2 py-2 bg-violet-50/20 text-xs text-violet-600 tabular-nums">
                    {cascadedGoals[gm]?.closed_won > 0
                      ? fmtCurrency(Math.round((cascadedGoals[gm]?.revenue ?? 0) / cascadedGoals[gm]?.closed_won))
                      : '—'}
                  </td>
                ))}
                <td className="text-center px-2 py-2 bg-stone-50 border-l border-stone-100 text-xs text-stone-600 tabular-nums">
                  {totals90.closed_won > 0 ? fmtCurrency(Math.round(totals90.revenue / totals90.closed_won)) : '—'}
                </td>
                <td className="px-2 py-2 bg-stone-50 border-l border-stone-100" />
              </tr>

              {/* ── QUOTA ROW ── */}
              <tr className="border-b border-stone-100 bg-stone-50/40">
                <td className="px-3 py-2 text-xs font-bold text-stone-600 sticky left-0 bg-stone-50/40 z-10">
                  Monthly Quota
                </td>
                {baseline6.map((m) => {
                  const q = getMonthlyQuota(REP_ID_TO_INITIALS[repId] ?? '', m.month);
                  return (
                    <td key={m.month} className="text-center px-2 py-2 text-xs font-bold text-stone-600 tabular-nums">
                      {fmtCurrency(q)}
                    </td>
                  );
                })}
                <td className="text-center px-2 py-2 bg-stone-100/80 border-l border-r border-stone-200/50 text-xs font-bold text-stone-700 tabular-nums">
                  {fmtCurrency(Math.round(baseline6.reduce((s, m) => s + getMonthlyQuota(REP_ID_TO_INITIALS[repId] ?? '', m.month), 0) / baseline6.length))}
                </td>
                <td className="px-1 w-3" />
                {targetMonths.map((gm) => {
                  const q = getMonthlyQuota(REP_ID_TO_INITIALS[repId] ?? '', gm);
                  const goalRev = cascadedGoals[gm]?.revenue ?? 0;
                  const meetsQuota = goalRev >= q;
                  return (
                    <td key={gm} className="text-center px-2 py-2 bg-amber-50/20">
                      <span className={`text-xs font-bold tabular-nums ${meetsQuota ? 'text-stone-700' : 'text-stone-400'}`}>
                        {fmtCurrency(q)}
                      </span>
                    </td>
                  );
                })}
                <td className="text-center px-2 py-2 bg-stone-100/30 border-l border-stone-200/50 text-xs font-bold text-stone-700 tabular-nums">
                  {fmtCurrency(targetMonths.reduce((s, m) => s + getMonthlyQuota(REP_ID_TO_INITIALS[repId] ?? '', m), 0))}
                </td>
                <td className="text-center px-2 py-2 bg-stone-100/30 border-l border-stone-200/50 text-xs font-bold text-stone-700 tabular-nums">
                  {fmtCurrency(Math.round(targetMonths.reduce((s, m) => s + getMonthlyQuota(REP_ID_TO_INITIALS[repId] ?? '', m), 0) / 3))}
                </td>
              </tr>

              {/* ── % TO TARGET ROW ── */}
              <tr className="border-b border-stone-100">
                <td className="px-3 py-2 text-[10px] font-bold text-stone-500 sticky left-0 bg-white z-10">
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-stone-400" />
                    % to Target
                  </div>
                </td>
                {baseline6.map((m) => {
                  const actual = getHistoricalValue(m.month, 'revenue');
                  const quota = getMonthlyQuota(REP_ID_TO_INITIALS[repId] ?? '', m.month);
                  const pct = quota > 0 ? Math.round((actual / quota) * 100) : 0;
                  const fillPct = Math.min(pct, 100);
                  const barColor = pct >= 100 ? 'bg-emerald-400' : pct >= 70 ? 'bg-stone-400' : 'bg-rose-300';
                  const textColor = pct >= 100 ? 'text-emerald-600' : pct >= 70 ? 'text-stone-500' : 'text-rose-400';
                  return (
                    <td key={m.month} className="text-center px-2 py-1.5">
                      {quota > 0 ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-full h-[3px] rounded-full bg-stone-200/80 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                              style={{ width: `${fillPct}%` }}
                            />
                          </div>
                          <span className={`text-[10px] font-bold tabular-nums ${textColor}`}>
                            {pct}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-stone-300">—</span>
                      )}
                    </td>
                  );
                })}
                {/* Average attainment */}
                {(() => {
                  const attainments = baseline6
                    .map((m) => {
                      const actual = getHistoricalValue(m.month, 'revenue');
                      const quota = getMonthlyQuota(REP_ID_TO_INITIALS[repId] ?? '', m.month);
                      return quota > 0 ? actual / quota : null;
                    })
                    .filter((v): v is number => v !== null);
                  const avgPct = attainments.length > 0
                    ? Math.round((attainments.reduce((a, b) => a + b, 0) / attainments.length) * 100)
                    : 0;
                  const textColor = avgPct >= 100 ? 'text-emerald-600' : avgPct >= 70 ? 'text-amber-600' : 'text-rose-500';
                  return (
                    <td className="text-center px-2 py-2 bg-stone-50 border-l border-r border-stone-100">
                      {avgPct > 0 ? (
                        <span className={`text-[10px] font-bold tabular-nums ${textColor}`}>{avgPct}%</span>
                      ) : (
                        <span className="text-[10px] text-stone-300">—</span>
                      )}
                    </td>
                  );
                })()}
                <td className="px-1 w-3" />
                {/* Target months — future, show TARGET label */}
                {targetMonths.map((gm) => (
                  <td key={gm} className="text-center px-2 py-2 bg-violet-50/20">
                    <span className="text-[9px] font-bold text-violet-400/60">Target</span>
                  </td>
                ))}
                <td className="px-2 py-2 bg-stone-50 border-l border-stone-100" />
                <td className="px-2 py-2 bg-stone-50 border-l border-stone-100" />
              </tr>

              {/* ── SPACER ── */}
              <tr>
                <td colSpan={14} className="h-2 bg-stone-100" />
              </tr>

              {/* ── DRIVERS SECTION ── */}
              <tr className="bg-stone-50/50">
                <td className="px-3 py-2 text-[10px] font-bold text-stone-500 sticky left-0 bg-stone-50/50 z-10">
                  Drivers
                </td>
                {baseline6.map((m) => (
                  <td key={m.month} className="px-2 py-2" />
                ))}
                <td className="px-2 py-2 bg-stone-100 text-center text-[10px] font-bold text-stone-500">
                  Baseline
                </td>
                <td className="px-1 w-3" />
                {targetMonths.map((_, mi) => (
                  <td key={mi} className="px-2 py-2 bg-violet-50/20 text-center text-[10px] font-bold text-violet-500">
                    Target
                  </td>
                ))}
                <td className="px-2 py-2 bg-stone-50" />
                <td className="px-2 py-2 bg-stone-50 text-center text-[10px] font-bold text-stone-500">
                  Avg
                </td>
              </tr>

              {RATE_KEYS.map((rk) => {
                const baseVal = liveCascade[rk];
                return (
                  <tr key={rk} className="border-b border-stone-50 hover:bg-stone-50/30">
                    <td className="px-3 py-2 text-xs font-medium text-stone-700 sticky left-0 bg-white z-10">
                      {RATE_LABELS[rk]}
                    </td>
                    {/* Per-month historical rates */}
                    {baseline6.map((m) => {
                      const step = CASCADE_CHAIN.find((s) => s.rateKey === rk);
                      if (!step) return <td key={m.month} />;
                      let from: number;
                      if (rk === 'scheduled_rate') {
                        // Total conversations across all channels
                        from = getHistoricalValue(m.month, 'conversations')
                          + getHistoricalValue(m.month, 'email_conversations')
                          + getHistoricalValue(m.month, 'linkedin_conversations');
                      } else {
                        from = getHistoricalValue(m.month, step.from);
                      }
                      const to = getHistoricalValue(m.month, step.to);
                      const rate = safeDiv(to, from);
                      return (
                        <td key={m.month} className="text-center px-2 py-2 text-xs text-stone-500 tabular-nums">
                          {from > 0 ? fmtPct(rate) : '—'}
                        </td>
                      );
                    })}
                    {/* Baseline average rate */}
                    <td className="text-center px-2 py-2 bg-stone-50 border-l border-r border-stone-100">
                      <span className="text-xs font-bold text-stone-700 tabular-nums">
                        {baseVal > 0 ? fmtPct(baseVal) : '—'}
                      </span>
                    </td>
                    <td className="px-1 w-3" />
                    {/* Target rate inputs per month */}
                    {targetMonths.map((gm) => {
                      const val = monthRates[gm]?.[rk] ?? baseVal;
                      const improved = val > baseVal;
                      const decreased = val < baseVal;
                      return (
                        <td key={gm} className="text-center px-1 py-1 bg-violet-50/20">
                          <div className="relative inline-flex items-center">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={Math.round(val * 100) || ''}
                              onChange={(e) => updateRate(gm, rk, (parseInt(e.target.value) || 0) / 100)}
                              className={`w-16 text-center text-xs font-bold bg-white border rounded-md px-1 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-300 tabular-nums transition-colors ${
                                improved ? 'border-emerald-200 text-emerald-700 bg-emerald-50/30' :
                                decreased ? 'border-rose-200 text-rose-600 bg-rose-50/30' :
                                'border-stone-200 text-stone-700'
                              }`}
                            />
                            <span className="absolute right-1.5 text-[10px] text-stone-300 pointer-events-none">%</span>
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-2 py-2 bg-stone-50 border-l border-stone-100" />
                    {/* Average of target rates */}
                    <td className="text-center px-2 py-2 bg-stone-50 border-l border-stone-100">
                      <span className="text-xs font-bold text-stone-700 tabular-nums">
                        {fmtPct(
                          targetMonths.reduce((s, gm) => s + (monthRates[gm]?.[rk] ?? baseVal), 0) / 3
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* Avg Revenue / Sale — target */}
              <tr className="border-b border-stone-50 hover:bg-stone-50/30">
                <td className="px-3 py-2 text-xs font-medium text-stone-700 sticky left-0 bg-white z-10">
                  Avg Revenue / Sale
                </td>
                {baseline6.map((m) => {
                  const won = getHistoricalValue(m.month, 'closed_won');
                  const rev = getHistoricalValue(m.month, 'revenue');
                  return (
                    <td key={m.month} className="text-center px-2 py-2 text-xs text-stone-500 tabular-nums">
                      {won > 0 ? fmtCurrency(Math.round(rev / won)) : '—'}
                    </td>
                  );
                })}
                <td className="text-center px-2 py-2 bg-stone-50 border-l border-r border-stone-100 text-xs font-bold text-stone-700 tabular-nums">
                  {liveCascade.avg_revenue > 0 ? fmtCurrency(Math.round(liveCascade.avg_revenue)) : '—'}
                </td>
                <td className="px-1 w-3" />
                {targetMonths.map((gm) => (
                  <td key={gm} className="text-center px-1 py-1 bg-violet-50/20">
                    <input
                      type="number"
                      min={0}
                      step={500}
                      value={Math.round(monthRates[gm]?.avg_revenue ?? liveCascade.avg_revenue) || ''}
                      onChange={(e) => updateRate(gm, 'avg_revenue', parseInt(e.target.value) || 0)}
                      className="w-16 text-center text-xs font-bold text-stone-700 bg-white border border-stone-200 rounded-md px-1 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-300 tabular-nums transition-colors"
                    />
                  </td>
                ))}
                <td className="px-2 py-2 bg-stone-50 border-l border-stone-100" />
                <td className="text-center px-2 py-2 bg-stone-50 border-l border-stone-100 text-xs font-bold text-stone-700 tabular-nums">
                  {fmtCurrency(Math.round(
                    targetMonths.reduce((s, gm) => s + (monthRates[gm]?.avg_revenue ?? liveCascade.avg_revenue), 0) / 3
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Historical Save Bar (when editing) */}
        {editingHistorical && Object.keys(dirtyMonths).length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 bg-amber-50 border-t border-amber-100">
            <span className="text-xs text-amber-700">
              {Object.keys(dirtyMonths).length} month(s) modified
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setDirtyMonths({}); setEditingHistorical(false); }}
                className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveHistorical}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors"
              >
                <Save className="w-3 h-3" /> Save Historicals
              </button>
            </div>
          </div>
        )}

        {savedHistorical && (
          <div className="flex items-center justify-center px-5 py-2.5 bg-emerald-50 border-t border-emerald-100">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <Check className="w-3.5 h-3.5" /> Historicals saved — averages and cascade updated
            </span>
          </div>
        )}
      </div>

      {/* ── TIMELINE VISUAL ── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-stone-400" />
          <span className="text-sm font-bold text-stone-700">90-Day Improvement Window</span>
        </div>
        <div className="flex items-stretch gap-0">
          {/* Historical section */}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-stone-400 mb-2 text-center">
              Historical Baseline (Look Back)
            </div>
            <div className="flex gap-1">
              {baseline6.map((m, i) => {
                const hasData = (m as MetricRow).conversations > 0;
                return (
                  <div
                    key={m.month}
                    className={`flex-1 h-10 rounded flex items-center justify-center text-[10px] font-bold ${
                      hasData ? 'bg-stone-200 text-stone-600' : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    {monthLabel(m.month)}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-end justify-center px-3 pb-2">
            <ArrowRight className="w-5 h-5 text-stone-300" />
          </div>

          {/* Forward section */}
          <div className="w-[280px] shrink-0">
            <div className="text-[10px] font-bold text-violet-500 mb-2 text-center">
              90-Day Goals (Look Forward)
            </div>
            <div className="flex gap-1">
              {targetMonths.map((m, mi) => (
                <div
                  key={m}
                  className={`flex-1 h-10 rounded flex items-center justify-center text-[10px] font-bold bg-stone-100 text-stone-600`}
                >
                  <span>M{mi + 1}</span>
                  <span className="ml-1 opacity-70">{monthLabel(m)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Narrative */}
        <div className="mt-3 flex items-center gap-3 text-[10px] text-stone-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-stone-200" /> Historicals populate your baseline
          </span>
          <ArrowRight className="w-3 h-3 text-stone-300" />
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-stone-200" /> Averages set your starting point
          </span>
          <ArrowRight className="w-3 h-3 text-stone-300" />
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-stone-300" /> Rate improvements cascade all goals
          </span>
          <ArrowRight className="w-3 h-3 text-stone-300" />
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-stone-400" /> Weekly Tracker breaks it down
          </span>
        </div>
      </div>

      {/* Quick Link to Weekly Tracker */}
      {activeCycle && (
        <a
          href="/team/tracker"
          className="flex items-center justify-between bg-stone-800 rounded-xl px-5 py-4 hover:bg-stone-700 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-sm font-bold text-white">Go to Weekly Tracker</p>
              <p className="text-xs text-stone-400">Track your weekly actuals against these cascaded goals</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-white transition-colors" />
        </a>
      )}
    </div>
  );
}
