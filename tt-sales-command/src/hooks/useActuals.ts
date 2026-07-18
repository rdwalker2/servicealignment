// ============================================================
// useActuals — Reactive hook for weekly actuals
// ============================================================
import { useMemo } from 'react';
import { useActualStore } from '../lib/stores/actualStore';
import { EMPTY_METRIC_ROW } from '../types';
import type { WeeklyActual, MetricRow } from '../types';

function actualKey(repId: string, weekStart: string): string {
  return `${repId}_${weekStart}`;
}

function monthPrefix(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

export function useActuals(repId: string, weekStart: string) {
  // Select by key — stable reference
  const actual = useActualStore(
    (s) => s.actuals[actualKey(repId, weekStart)],
  );

  const saveActual = useActualStore((s) => s.saveActual);

  return { actual, saveActual } as const;
}

export function useActualsForMonth(repId: string, year: number, month: number) {
  // Get the whole actuals record and derive in useMemo
  const allActuals = useActualStore((s) => s.actuals);
  const saveActual = useActualStore((s) => s.saveActual);

  const prefix = monthPrefix(year, month);

  const actuals = useMemo(() => {
    return Object.values(allActuals).filter(
      (a) => a.rep_id === repId && a.week_start.startsWith(prefix),
    );
  }, [allActuals, repId, prefix]);

  const sum = useMemo((): MetricRow => {
    const result: MetricRow = { ...EMPTY_METRIC_ROW };
    for (const a of actuals) {
      result.dials += a.dials;
      result.connects += a.connects;
      result.conversations += a.conversations;
      result.emails_sent += a.emails_sent;
      result.email_conversations += a.email_conversations ?? 0;
      result.linkedin_conversations += a.linkedin_conversations ?? 0;
      result.linkedin_touches += a.linkedin_touches ?? 0;
      result.discovery_set += a.discovery_set;
      result.discovery_held += a.discovery_held;
      result.disqualified += a.disqualified ?? 0;
      result.demo_held += a.demo_held;
      result.proposal_sent += a.proposal_sent;
      result.closed_won += a.closed_won;
      result.closed_lost += a.closed_lost ?? 0;
      result.revenue += a.revenue;
    }
    return result;
  }, [actuals]);

  return { actuals, sum, saveActual } as const;
}

export type { WeeklyActual, MetricRow };
