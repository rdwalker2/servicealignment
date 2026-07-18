// ============================================================
// SIP Store — Strategic Improvement Plan persistence
// Per-stage improvement strategies with status tracking
// ============================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SIPStrategy {
  id: string;
  rep_id: string;
  stage: string;          // 'scheduled_rate' | 'show_rate' | 'proposal_rate' | 'close_rate'
  text: string;           // strategy description
  due_date?: string;      // ISO date
  goal?: string;          // target description
  actual?: string;        // actual result
  status: 'not_started' | 'in_progress' | 'done';
  created_at: string;
  updated_at: string;
}

interface SIPStore {
  strategies: Record<string, SIPStrategy>;      // id → strategy
  addStrategy: (s: Omit<SIPStrategy, 'id' | 'created_at' | 'updated_at'>) => void;
  updateStrategy: (id: string, updates: Partial<SIPStrategy>) => void;
  removeStrategy: (id: string) => void;
  getForRep: (repId: string) => SIPStrategy[];
  getForStage: (repId: string, stage: string) => SIPStrategy[];
}

export const useSIPStore = create<SIPStore>()(
  persist(
    (set, get) => ({
      strategies: {},

      addStrategy: (s) => {
        const id = `sip_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const now = new Date().toISOString();
        set((state) => ({
          strategies: {
            ...state.strategies,
            [id]: { ...s, id, created_at: now, updated_at: now },
          },
        }));
      },

      updateStrategy: (id, updates) => {
        set((state) => {
          const existing = state.strategies[id];
          if (!existing) return state;
          return {
            strategies: {
              ...state.strategies,
              [id]: { ...existing, ...updates, updated_at: new Date().toISOString() },
            },
          };
        });
      },

      removeStrategy: (id) => {
        set((state) => {
          const { [id]: _, ...rest } = state.strategies;
          return { strategies: rest };
        });
      },

      getForRep: (repId) => {
        return Object.values(get().strategies)
          .filter((s) => s.rep_id === repId)
          .sort((a, b) => a.created_at.localeCompare(b.created_at));
      },

      getForStage: (repId, stage) => {
        return Object.values(get().strategies)
          .filter((s) => s.rep_id === repId && s.stage === stage)
          .sort((a, b) => a.created_at.localeCompare(b.created_at));
      },
    }),
    { name: 'scc_sip_strategies' },
  ),
);
