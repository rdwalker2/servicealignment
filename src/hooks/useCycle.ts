// ============================================================
// useCycle — Reactive hook for 90-day cycle plans
// ============================================================
import { useMemo } from 'react';
import { useCycleStore } from '../lib/stores/cycleStore';
import type { CyclePlan } from '../types';

export function useCycle(repId: string) {
  const cycles = useCycleStore((s) => s.cycles);
  const saveCycle = useCycleStore((s) => s.saveCycle);
  const completeCycle = useCycleStore((s) => s.completeCycle);

  const activeCycle = useMemo(
    () => Object.values(cycles).find((c) => c.rep_id === repId && c.status === 'active'),
    [cycles, repId],
  );

  const allCycles = useMemo(
    () =>
      Object.values(cycles)
        .filter((c) => c.rep_id === repId)
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [cycles, repId],
  );

  return {
    activeCycle,
    allCycles,
    saveCycle,
    completeCycle,
  } as const;
}

export type { CyclePlan };
