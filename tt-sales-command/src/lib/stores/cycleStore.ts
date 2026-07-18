// ============================================================
// Cycle Store — Zustand store for 90-day CyclePlan persistence
// ============================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CyclePlan } from '../../types';

interface CycleState {
  cycles: Record<string, CyclePlan>;

  /** Create or update a cycle plan */
  saveCycle: (plan: Omit<CyclePlan, 'id' | 'created_at'>) => CyclePlan;

  /** Get the active cycle for a rep (status === 'active') */
  getActiveCycle: (repId: string) => CyclePlan | undefined;

  /** Mark a cycle as completed */
  completeCycle: (cycleId: string) => void;

  /** Get all cycles for a rep (sorted newest first) */
  getAllForRep: (repId: string) => CyclePlan[];
}

export const useCycleStore = create<CycleState>()(
  persist(
    (set, get) => ({
      cycles: {},

      saveCycle(input) {
        const id = crypto.randomUUID();
        const saved: CyclePlan = {
          ...input,
          id,
          created_at: new Date().toISOString(),
        };

        // Deactivate any existing active cycle for this rep
        const existing = get().getActiveCycle(input.rep_id);
        if (existing) {
          set((state) => ({
            cycles: {
              ...state.cycles,
              [existing.id]: { ...existing, status: 'completed' },
              [id]: saved,
            },
          }));
        } else {
          set((state) => ({
            cycles: { ...state.cycles, [id]: saved },
          }));
        }

        return saved;
      },

      getActiveCycle(repId) {
        return Object.values(get().cycles).find(
          (c) => c.rep_id === repId && c.status === 'active',
        );
      },

      completeCycle(cycleId) {
        const cycle = get().cycles[cycleId];
        if (!cycle) return;
        set((state) => ({
          cycles: {
            ...state.cycles,
            [cycleId]: { ...cycle, status: 'completed' },
          },
        }));
      },

      getAllForRep(repId) {
        return Object.values(get().cycles)
          .filter((c) => c.rep_id === repId)
          .sort((a, b) => b.created_at.localeCompare(a.created_at));
      },
    }),
    {
      name: 'scc_cycle_plans',
    },
  ),
);
