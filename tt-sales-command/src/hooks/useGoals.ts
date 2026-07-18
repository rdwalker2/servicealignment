// ============================================================
// useGoals — Reactive hook for monthly goals
// ============================================================
import { useGoalStore } from '../lib/stores/goalStore';
import type { MonthlyGoal } from '../types';

function goalKey(repId: string, month: string): string {
  return `${repId}_${month}`;
}

export function useGoals(repId: string, month: string) {
  // Select the specific goal by key — returns stable reference
  const goal = useGoalStore(
    (s) => s.goals[goalKey(repId, month)],
  );

  const setGoal = useGoalStore((s) => s.setGoal);

  return { goal, setGoal } as const;
}

export function useGoalForRep(repId: string) {
  // Select all goals and filter — only re-renders when goals change
  const goals = useGoalStore((s) => {
    const all: MonthlyGoal[] = [];
    for (const [key, goal] of Object.entries(s.goals)) {
      if (key.startsWith(repId + '_')) all.push(goal);
    }
    return all;
  });

  const setGoal = useGoalStore((s) => s.setGoal);

  return { goals, setGoal } as const;
}

export type { MonthlyGoal };
