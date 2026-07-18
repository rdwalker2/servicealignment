// ============================================================
// Goal Store — Zustand store for MonthlyGoal persistence
// Replaces the goals portion of database.ts
// ============================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MonthlyGoal, MetricRow } from '../../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function goalKey(repId: string, month: string): string {
  return `${repId}_${month}`;
}

// ---------------------------------------------------------------------------
// Store types
// ---------------------------------------------------------------------------

interface GoalState {
  goals: Record<string, MonthlyGoal>;

  /** Look up a single goal (returns undefined when not found) */
  getGoal: (repId: string, month: string) => MonthlyGoal | undefined;

  /** Upsert a goal — merges with existing or creates a new one */
  setGoal: (goal: Omit<MonthlyGoal, 'id' | 'updated_at'>) => MonthlyGoal;

  /** Return every goal belonging to a rep */
  getAllForRep: (repId: string) => MonthlyGoal[];

  /** Return every goal for a given month across all reps */
  getAllForMonth: (month: string) => MonthlyGoal[];
}

// ---------------------------------------------------------------------------
// Migration: convert old array format → Record keyed by repId_month
// ---------------------------------------------------------------------------

function migrateFromLegacy(): Record<string, MonthlyGoal> | null {
  try {
    const raw = localStorage.getItem('scc_monthly_goals');
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);

    // Already migrated (object with nested 'state' from zustand persist)
    if (!Array.isArray(parsed)) return null;

    // Old format: MonthlyGoal[]
    const arr = parsed as MonthlyGoal[];
    const record: Record<string, MonthlyGoal> = {};
    for (const g of arr) {
      record[goalKey(g.rep_id, g.month)] = g;
    }
    return record;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      goals: migrateFromLegacy() ?? {},

      getGoal(repId: string, month: string): MonthlyGoal | undefined {
        return get().goals[goalKey(repId, month)];
      },

      setGoal(input: Omit<MonthlyGoal, 'id' | 'updated_at'>): MonthlyGoal {
        const key = goalKey(input.rep_id, input.month);
        const existing = get().goals[key];

        const saved: MonthlyGoal = {
          ...input,
          id: existing?.id ?? crypto.randomUUID(),
          updated_at: new Date().toISOString(),
        };

        set((state) => ({
          goals: { ...state.goals, [key]: saved },
        }));

        return saved;
      },

      getAllForRep(repId: string): MonthlyGoal[] {
        return Object.values(get().goals).filter((g) => g.rep_id === repId);
      },

      getAllForMonth(month: string): MonthlyGoal[] {
        return Object.values(get().goals).filter((g) => g.month === month);
      },
    }),
    {
      name: 'scc_monthly_goals',
    },
  ),
);
