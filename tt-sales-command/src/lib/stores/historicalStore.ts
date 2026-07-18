// ============================================================
// Historical Store — Zustand store for historical seed + overrides
// Replaces the historical-data portion of database.ts
// ============================================================
import { create } from 'zustand';
import { useActualStore } from './actualStore';
import { persist } from 'zustand/middleware';
import { REP_SEED_DATA, type HistoricalMonth } from '../../data/seedData';
import { REP_ID_TO_INITIALS } from '../../contexts/AuthContext';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a zero-value HistoricalMonth for a given 'YYYY-MM-01' string */
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

/** Generate the last-12-month 'YYYY-MM-01' strings ending with current month */
function last12MonthKeys(): string[] {
  const keys: string[] = [];
  const now = new Date();
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
  const nextQuarterFirstMonth = currentQuarter * 3;
  const goalYear = nextQuarterFirstMonth >= 12 ? now.getFullYear() + 1 : now.getFullYear();
  const firstGoalMonth = nextQuarterFirstMonth % 12;

  for (let i = 12; i >= 1; i--) {
    const d = new Date(goalYear, firstGoalMonth - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    keys.push(`${y}-${m}-01`);
  }
  return keys;
}

/** Resolve repId → seed data history array */
function seedHistoryForRep(repId: string): HistoricalMonth[] {
  const initials = REP_ID_TO_INITIALS[repId];
  if (!initials || !REP_SEED_DATA[initials]) return [];
  return REP_SEED_DATA[initials].history;
}

// ---------------------------------------------------------------------------
// Migration: pull existing override data from legacy localStorage
// ---------------------------------------------------------------------------

function migrateFromLegacy(): Record<string, HistoricalMonth[]> | null {
  try {
    const raw = localStorage.getItem('scc_historical_overrides');
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);

    // Already a zustand-persist envelope → skip migration
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'state' in parsed
    ) {
      return null;
    }

    // Legacy format: Record<string, HistoricalMonth[]>
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, HistoricalMonth[]>;
    }

    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Store types
// ---------------------------------------------------------------------------

interface HistoricalState {
  /** Per-rep override arrays (only user-edited months are stored) */
  overrides: Record<string, HistoricalMonth[]>;

  /** Raw seed data for a rep (no overrides) */
  getData: (repId: string) => HistoricalMonth[];

  /** Merged seed + overrides, always 12 months, sorted oldest-first */
  getEditable: (repId: string) => HistoricalMonth[];

  /** Save/upsert a single month override for a rep */
  saveMonth: (repId: string, month: HistoricalMonth) => void;

  /** Reset a rep's overrides back to seed data */
  reset: (repId: string) => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useHistoricalStore = create<HistoricalState>()(
  persist(
    (set, get) => ({
      overrides: migrateFromLegacy() ?? {},

      getData(repId: string): HistoricalMonth[] {
        return seedHistoryForRep(repId);
      },

      getEditable(repId: string): HistoricalMonth[] {
        const seedMonths = seedHistoryForRep(repId);
        const repOverrides = get().overrides[repId] ?? [];

        // Build month → data map, seed first
        const monthMap = new Map<string, HistoricalMonth>();
        for (const m of seedMonths) {
          monthMap.set(m.month, { ...m });
        }
        // Override wins
        for (const m of repOverrides) {
          monthMap.set(m.month, { ...m });
        }

        // Live Actuals win for the current month
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonthIdx = now.getMonth();
        const currentMonthStr = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}-01`;
        
        const actualsSum = useActualStore.getState().sumForMonth(repId, currentYear, currentMonthIdx);
        // Only overlay if there's actually some activity logged
        if (actualsSum.total_conversations > 0 || actualsSum.revenue > 0 || actualsSum.discovery_held > 0) {
          monthMap.set(currentMonthStr, { month: currentMonthStr, ...actualsSum });
        }

        // Ensure all 12 month keys exist
        const keys = last12MonthKeys();
        for (const key of keys) {
          if (!monthMap.has(key)) {
            monthMap.set(key, emptyHistoricalMonth(key));
          }
        }

        // Return exactly the 12 target months, oldest-first
        return keys.map((k) => monthMap.get(k)!);
      },

      saveMonth(repId: string, month: HistoricalMonth): void {
        set((state) => {
          const existing = state.overrides[repId] ?? [];
          const idx = existing.findIndex((m) => m.month === month.month);
          const updated =
            idx >= 0
              ? existing.map((m, i) => (i === idx ? month : m))
              : [...existing, month];

          return {
            overrides: { ...state.overrides, [repId]: updated },
          };
        });
      },

      reset(repId: string): void {
        set((state) => {
          const { [repId]: _, ...rest } = state.overrides;
          return { overrides: rest };
        });
      },
    }),
    {
      name: 'scc_historical_overrides',
      // Only persist the overrides — seed data comes from the module
      partialize: (state) => ({ overrides: state.overrides }),
    },
  ),
);
