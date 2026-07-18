// ============================================================
// pipelineMetrics.ts — Auto-compute bottom-funnel metrics from
// opp card milestone/meeting data for the Sales Plan
// ============================================================
import { getSessionsForRep, type DiscoverySession } from './discoveryDatabase';

export interface PipelineMonthMetrics {
  discovery_held: number;
  demo_held: number;
  proposal_sent: number;
  closed_won: number;
  revenue: number;
  /** Number of opp cards that contributed to these counts */
  source_count: number;
}

/**
 * Check if a date string falls within a given month.
 * @param dateStr  ISO date string (e.g. '2026-03-15' or '2026-03-15T...')
 * @param monthKey ISO month key (e.g. '2026-03-01')
 */
function isInMonth(dateStr: string, monthKey: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const m = new Date(monthKey);
  return d.getFullYear() === m.getFullYear() && d.getMonth() === m.getMonth();
}

/**
 * Compute bottom-funnel pipeline metrics for a rep in a given month
 * by aggregating milestone dates and deal values from their opp cards.
 *
 * These metrics auto-fill the Sales Plan's "Outbound Pipeline" section:
 * - discovery_held, demo_held, proposal_sent = milestone date counts
 * - closed_won = completed sessions in that month
 * - revenue = sum of deal_value for closed-won sessions
 */
export function computePipelineMetrics(
  repId: string,
  monthKey: string
): PipelineMonthMetrics {
  const sessions = getSessionsForRep(repId);
  
  let discovery_held = 0;
  let demo_held = 0;
  let proposal_sent = 0;
  let closed_won = 0;
  let revenue = 0;
  const sourceIds = new Set<string>();

  for (const s of sessions) {
    // Discovery Held
    if (s.milestones?.discovery_held?.date && isInMonth(s.milestones.discovery_held.date, monthKey)) {
      discovery_held++;
      sourceIds.add(s.id);
    }

    // Demo Held
    if (s.milestones?.demo_held?.date && isInMonth(s.milestones.demo_held.date, monthKey)) {
      demo_held++;
      sourceIds.add(s.id);
    }

    // Proposal Sent
    if (s.milestones?.proposal_sent?.date && isInMonth(s.milestones.proposal_sent.date, monthKey)) {
      proposal_sent++;
      sourceIds.add(s.id);
    }

    // Closed Won — use completed_at date
    if (s.completed_at && isInMonth(s.completed_at, monthKey)) {
      // Only count if actually closed-won (not just completed)
      const isClosedWon = s.deal_stage === 'closed_won' || s.status === 'approved';
      if (isClosedWon) {
        closed_won++;
        revenue += s.deal_value || 0;
        sourceIds.add(s.id);
      }
    }
  }

  return {
    discovery_held,
    demo_held,
    proposal_sent,
    closed_won,
    revenue,
    source_count: sourceIds.size,
  };
}

/**
 * Compute pipeline metrics for all 6 historical months at once.
 * Returns a map of monthKey → PipelineMonthMetrics.
 */
export function computeAllPipelineMetrics(
  repId: string,
  monthKeys: string[]
): Record<string, PipelineMonthMetrics> {
  const result: Record<string, PipelineMonthMetrics> = {};
  for (const mk of monthKeys) {
    result[mk] = computePipelineMetrics(repId, mk);
  }
  return result;
}

/** Fields that are auto-computed from pipeline (bottom-funnel) */
export const PIPELINE_AUTO_FIELDS = new Set([
  'discovery_held',
  'demo_held',
  'proposal_sent',
  'closed_won',
  'revenue',
]);
