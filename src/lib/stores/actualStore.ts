// ============================================================
// Actual Store — Zustand store for WeeklyActual persistence
// Replaces the actuals portion of database.ts
// ============================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WeeklyActual, MetricRow } from '../../types';
import { EMPTY_METRIC_ROW } from '../../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function actualKey(repId: string, weekStart: string): string {
  return `${repId}_${weekStart}`;
}

/**
 * Build a 'YYYY-MM' prefix from year + zero-based month index.
 * e.g. monthPrefix(2026, 4) → '2026-05'
 */
function monthPrefix(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Store types
// ---------------------------------------------------------------------------

interface ActualState {
  actuals: Record<string, WeeklyActual>;

  /** Look up a single weekly actual */
  getActual: (repId: string, weekStart: string) => WeeklyActual | undefined;

  /** Upsert a weekly actual */
  saveActual: (actual: Omit<WeeklyActual, 'id' | 'updated_at'>) => WeeklyActual;

  /** Return all actuals for a rep within a given month (0-indexed) */
  getForMonth: (repId: string, year: number, month: number) => WeeklyActual[];

  /** Return all actuals across all reps for a given month */
  getAllForMonth: (year: number, month: number) => WeeklyActual[];

  /** Sum metric values for a rep's month into a single MetricRow */
  sumForMonth: (repId: string, year: number, month: number) => MetricRow;
}

// ---------------------------------------------------------------------------
// Migration: convert old array format → Record
// ---------------------------------------------------------------------------

function migrateFromLegacy(): Record<string, WeeklyActual> | null {
  try {
    const raw = localStorage.getItem('scc_weekly_actuals');
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    const arr = parsed as WeeklyActual[];
    const record: Record<string, WeeklyActual> = {};
    for (const a of arr) {
      record[actualKey(a.rep_id, a.week_start)] = a;
    }
    return record;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useActualStore = create<ActualState>()(
  persist(
    (set, get) => ({
      actuals: migrateFromLegacy() ?? {},

      getActual(repId: string, weekStart: string): WeeklyActual | undefined {
        return get().actuals[actualKey(repId, weekStart)];
      },

      saveActual(input: Omit<WeeklyActual, 'id' | 'updated_at'>): WeeklyActual {
        const key = actualKey(input.rep_id, input.week_start);
        const existing = get().actuals[key];

        const saved: WeeklyActual = {
          ...input,
          id: existing?.id ?? crypto.randomUUID(),
          updated_at: new Date().toISOString(),
        };

        set((state) => ({
          actuals: { ...state.actuals, [key]: saved },
        }));

        return saved;
      },

      getForMonth(repId: string, year: number, month: number): WeeklyActual[] {
        const prefix = monthPrefix(year, month);
        return Object.values(get().actuals).filter(
          (a) => a.rep_id === repId && a.week_start.startsWith(prefix),
        );
      },

      getAllForMonth(year: number, month: number): WeeklyActual[] {
        const prefix = monthPrefix(year, month);
        return Object.values(get().actuals).filter((a) =>
          a.week_start.startsWith(prefix),
        );
      },

      sumForMonth(repId: string, year: number, month: number): MetricRow {
        const weekly = get().getForMonth(repId, year, month);
        const result: MetricRow = { ...EMPTY_METRIC_ROW };

        for (const a of weekly) {
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
      },
    }),
    {
      name: 'scc_weekly_actuals',
    },
  ),
);
