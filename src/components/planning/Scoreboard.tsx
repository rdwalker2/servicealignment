// ============================================================
// Scoreboard — Compact persistent bar showing key monthly KPIs
// ============================================================
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGoals } from '../../hooks/useGoals';
import { useActualsForMonth } from '../../hooks/useActuals';
import { fmtCurrency, fmtNum, safeDiv } from '../../lib/calculations';
import { EMPTY_METRIC_ROW, type MetricRow } from '../../types';

interface ScoreboardProps {
  repId: string;
  /** ISO month string, e.g. '2026-06' */
  month: string;
}

interface KPI {
  label: string;
  actual: number;
  goal: number;
  format: (n: number) => string;
}

type PaceStatus = 'ahead' | 'on_track' | 'behind';

interface KPIWithPace extends KPI {
  expectedPace: number;
  paceRatio: number;
  paceStatus: PaceStatus;
}

function getProgressColor(pct: number): string {
  if (pct >= 0.9) return 'bg-emerald-500';
  if (pct >= 0.7) return 'bg-amber-500';
  return 'bg-red-500';
}

function getProgressTextColor(pct: number): string {
  if (pct >= 0.9) return 'text-emerald-600';
  if (pct >= 0.7) return 'text-amber-600';
  return 'text-red-500';
}

/** Pace indicator badge */
function PaceBadge({ status }: { status: PaceStatus }) {
  switch (status) {
    case 'ahead':
      return (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600">
          ↑ Ahead
        </span>
      );
    case 'on_track':
      return (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-600">
          → On Pace
        </span>
      );
    case 'behind':
      return (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-red-500">
          ↓ Behind
        </span>
      );
  }
}

/** Tiny velocity arrow next to the KPI number */
function VelocityArrow({ paceRatio }: { paceRatio: number }) {
  if (paceRatio >= 1.1) return <span className="text-emerald-500 text-xs ml-0.5">↗</span>;
  if (paceRatio < 0.9) return <span className="text-red-500 text-xs ml-0.5">↘</span>;
  return <span className="text-stone-400 text-xs ml-0.5">→</span>;
}

export default function Scoreboard({ repId, month }: ScoreboardProps) {
  // Parse '2026-06' → year / monthIndex
  const [year, monthIndex] = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    return [y, m - 1] as const;
  }, [month]);

  const monthStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;

  const { goal: rawGoal } = useGoals(repId, monthStr);
  const goal: MetricRow = rawGoal ?? EMPTY_METRIC_ROW;

  const { sum: actuals } = useActualsForMonth(repId, year, monthIndex);

  const kpis: KPI[] = useMemo(() => [
    { label: 'Conversations', actual: actuals.conversations, goal: goal.conversations, format: fmtNum },
    { label: 'Meetings',      actual: actuals.discovery_set, goal: goal.discovery_set, format: fmtNum },
    { label: 'Won',           actual: actuals.closed_won,    goal: goal.closed_won,    format: fmtNum },
    { label: 'Revenue',       actual: actuals.revenue,       goal: goal.revenue,       format: fmtCurrency },
  ], [actuals, goal]);

  // --- Pace calculations ---
  const monthProgress = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    return dayOfMonth / daysInMonth; // 0-1
  }, []);

  const kpisWithPace: KPIWithPace[] = useMemo(() =>
    kpis.map(k => {
      const expectedPace = k.goal * monthProgress;
      const paceRatio = expectedPace > 0 ? k.actual / expectedPace : 0;
      let paceStatus: PaceStatus = 'on_track';
      if (k.actual > expectedPace * 1.1) paceStatus = 'ahead';
      else if (k.actual < expectedPace * 0.9) paceStatus = 'behind';
      return { ...k, expectedPace, paceRatio, paceStatus };
    }),
  [kpis, monthProgress]);

  // --- Worst-metric alert ---
  const worstMetric = useMemo(() => {
    const withGoals = kpisWithPace.filter(k => k.goal > 0);
    if (withGoals.length === 0) return null;
    const worst = withGoals.reduce((prev, cur) =>
      cur.paceRatio < prev.paceRatio ? cur : prev,
    );
    // Only show alert if worst metric is <50% of pace target
    return worst.paceRatio < 0.5 ? worst : null;
  }, [kpisWithPace]);

  // Overall % = average completion across key metrics
  const overallPct = useMemo(() => {
    const pcts = kpis.map(k => (k.goal > 0 ? safeDiv(k.actual, k.goal) : 0));
    const validPcts = pcts.filter((_, i) => kpis[i].goal > 0);
    return validPcts.length > 0
      ? validPcts.reduce((a, b) => a + b, 0) / validPcts.length
      : 0;
  }, [kpis]);

  const barColor = getProgressColor(overallPct);
  const textColor = getProgressTextColor(overallPct);
  const clampedPct = Math.min(overallPct, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="bg-white border border-stone-200/60 rounded-xl shadow-sm p-5"
    >
      <div className="flex items-end gap-6">
        {/* KPI metrics */}
        {kpisWithPace.map((k, i) => (
          <div key={k.label} className="flex items-end gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-xs text-stone-400">{k.label}</p>
                {k.goal > 0 && <PaceBadge status={k.paceStatus} />}
              </div>
              <p className={`text-sm font-semibold tabular-nums ${k.label === 'Revenue' ? 'text-emerald-700' : 'text-stone-800'}`}>
                {k.label === 'Revenue' ? k.format(k.actual) : k.actual}
                {k.goal > 0 && <VelocityArrow paceRatio={k.paceRatio} />}
                {k.goal > 0 && (
                  <span className="text-stone-400 font-normal text-[13px] ml-1">
                    / {k.format(k.goal)}
                  </span>
                )}
              </p>
            </div>
            {/* Divider between metrics */}
            {i < kpisWithPace.length - 1 && (
              <div className="h-8 border-r border-stone-100 shrink-0" />
            )}
          </div>
        ))}

        {/* Divider before progress */}
        <div className="h-8 border-r border-stone-100 shrink-0" />

        {/* Overall progress */}
        <div className="min-w-[120px]">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xs text-stone-400">On Track</span>
            <span className={`text-sm font-semibold tabular-nums ${textColor}`}>
              {Math.round(overallPct * 100)}%
            </span>
          </div>
          <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${barColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${clampedPct * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Worst-metric alert */}
      {worstMetric && (
        <div className="mt-3 px-3 py-1.5 rounded-lg bg-amber-50 border border-rose-200/60 text-xs text-rose-700 font-medium">
          ⚠️ {worstMetric.label} is {Math.round((1 - worstMetric.paceRatio) * 100)}% behind pace — focus here today
        </div>
      )}
    </motion.div>
  );
}

