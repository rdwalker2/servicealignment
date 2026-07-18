// ============================================================
// useHistorical — Reactive hook for historical data
// Priority (highest → lowest):
//   1. Manual overrides (rep explicitly edited a month)
//   2. Seed data (CSV-imported historicals in seedData.ts)
//   3. Computed from weekly actuals in actualStore
// ============================================================
import { useMemo, useCallback } from 'react';
import { useHistoricalStore } from '../lib/stores/historicalStore';
import { useActualStore } from '../lib/stores/actualStore';
import { REP_SEED_DATA, type HistoricalMonth } from '../data/seedData';
import { REP_ID_TO_INITIALS } from '../contexts/AuthContext';

/**
 * Build the last-12-month 'YYYY-MM-01' strings, ending at the last month
 * before the next calendar quarter starts.
 * In June (Q2), next quarter = Q3 (Jul), so this returns Jul '25 through Jun '26.
 */
function last12MonthKeys(): string[] {
  const keys: string[] = [];
  const now = new Date();
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
  const nextQuarterFirstMonth = currentQuarter * 3; // 0-based
  const goalYear = nextQuarterFirstMonth >= 12 ? now.getFullYear() + 1 : now.getFullYear();
  const firstGoalMonth = nextQuarterFirstMonth % 12;

  // 12 months ending at the month before goal quarter
  for (let i = 12; i >= 1; i--) {
    const d = new Date(goalYear, firstGoalMonth - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    keys.push(`${y}-${m}-01`);
  }
  return keys;
}

function emptyHistoricalMonth(monthStr: string): HistoricalMonth {
  return {
    month: monthStr,
    dials: 0, connects: 0, conversations: 0, email_conversations: 0, linkedin_conversations: 0, emails_sent: 0,
    linkedin_touches: 0,
    discovery_set: 0, discovery_held: 0, demo_held: 0,
    proposal_sent: 0, closed_won: 0, revenue: 0,
    ib_opps: 0, ib_won: 0, ib_revenue: 0,
    ob_opps: 0, ob_won: 0, ob_revenue: 0,
  };
}

/** Parse a 'YYYY-MM-01' string into { year, month } (month is 0-indexed) */
function parseMonthStr(monthStr: string): { year: number; month: number } {
  const [y, m] = monthStr.split('-').map(Number);
  return { year: y, month: m - 1 };
}

/** Derive whether a computed-from-actuals month has meaningful data */
function hasAnyData(m: HistoricalMonth): boolean {
  return (
    m.conversations > 0 ||
    m.discovery_set > 0 ||
    m.discovery_held > 0 ||
    m.demo_held > 0 ||
    m.closed_won > 0 ||
    m.revenue > 0
  );
}

export function useHistorical(repId: string) {
  // Select just the overrides for this rep — stable reference when unchanged
  const repOverrides = useHistoricalStore((s) => s.overrides[repId]);
  const saveMonth = useHistoricalStore((s) => s.saveMonth);
  const reset = useHistoricalStore((s) => s.reset);

  // Pull the sumForMonth helper from actualStore (stable function ref)
  const sumForMonth = useActualStore((s) => s.sumForMonth);
  // Snapshot of actuals so the memo below reacts to changes
  const allActuals = useActualStore((s) => s.actuals);

  // Raw seed data (static, no store dependency)
  const seedData = useMemo((): HistoricalMonth[] => {
    const initials = REP_ID_TO_INITIALS[repId];
    if (!initials || !REP_SEED_DATA[initials]) return [];
    return REP_SEED_DATA[initials].history;
  }, [repId]);

  // Merged seed + actuals + overrides — 12 months, oldest-first
  const editable = useMemo((): HistoricalMonth[] => {
    const keys = last12MonthKeys();
    const monthMap = new Map<string, HistoricalMonth>();

    // Layer 1 (lowest): seed data
    for (const key of keys) {
      monthMap.set(key, emptyHistoricalMonth(key));
    }
    for (const m of seedData) {
      if (keys.includes(m.month)) {
        monthMap.set(m.month, { ...m });
      }
    }

    // Layer 2: actuals (overwrites seed data if actuals has > 0)
    for (const key of keys) {
      const { year, month } = parseMonthStr(key);
      const summed = sumForMonth(repId, year, month);
      if (hasAnyData(summed)) {
        const existing = monthMap.get(key)!;
        monthMap.set(key, {
          ...existing,
          // Only overwrite if actuals > 0, to preserve seed data during transition
          dials: summed.dials > 0 ? summed.dials : existing.dials,
          connects: summed.connects > 0 ? summed.connects : existing.connects,
          conversations: summed.conversations > 0 ? summed.conversations : existing.conversations,
          email_conversations: summed.email_conversations > 0 ? summed.email_conversations : existing.email_conversations,
          linkedin_conversations: summed.linkedin_conversations > 0 ? summed.linkedin_conversations : existing.linkedin_conversations,
          emails_sent: summed.emails_sent > 0 ? summed.emails_sent : existing.emails_sent,
          linkedin_touches: summed.linkedin_touches > 0 ? summed.linkedin_touches : existing.linkedin_touches,
          discovery_set: summed.discovery_set > 0 ? summed.discovery_set : existing.discovery_set,
          discovery_held: summed.discovery_held > 0 ? summed.discovery_held : existing.discovery_held,
          demo_held: summed.demo_held > 0 ? summed.demo_held : existing.demo_held,
          proposal_sent: summed.proposal_sent > 0 ? summed.proposal_sent : existing.proposal_sent,
          closed_won: summed.closed_won > 0 ? summed.closed_won : existing.closed_won,
          closed_lost: summed.closed_lost > 0 ? summed.closed_lost : existing.closed_lost,
          revenue: summed.revenue > 0 ? summed.revenue : existing.revenue,
        });
      }
    }

    // Layer 3 (highest): manual overrides win over everything
    if (repOverrides) {
      for (const m of repOverrides) {
        if (keys.includes(m.month)) {
          monthMap.set(m.month, { ...m });
        }
      }
    }

    return keys.map((k) => monthMap.get(k)!);
    }, [seedData, repOverrides, repId, sumForMonth, allActuals]);

  return {
    seedData,
    editable,
    saveMonth: useCallback(
      (month: HistoricalMonth) => saveMonth(repId, month),
      [repId, saveMonth],
    ),
    reset: useCallback(() => reset(repId), [repId, reset]),
  } as const;
}

export type { HistoricalMonth };
