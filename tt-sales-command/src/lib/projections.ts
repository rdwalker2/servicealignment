// ============================================================
// Projection / Pacing Models
// ============================================================
import type { MetricRow, DriverRates, MetricKey, PaceStatus, MetricPace } from '../types';

/** Categorise pace based on % complete vs % through the month */
export function getPaceStatus(pctComplete: number, pctThroughMonth: number): PaceStatus {
  const ratio = pctThroughMonth > 0
    ? pctComplete / pctThroughMonth
    : pctComplete > 0 ? 1 : 0;

  if (ratio >= 0.95) return 'ahead';
  if (ratio >= 0.75) return 'on_track';
  if (ratio >= 0.5) return 'behind';
  return 'at_risk';
}

/** Map a PaceStatus to a display colour */
export function getPaceColor(pace: PaceStatus): string {
  switch (pace) {
    case 'ahead': return '#10b981';    // emerald-500
    case 'on_track': return '#3b82f6'; // blue-500
    case 'behind': return '#f59e0b';   // amber-500
    case 'at_risk': return '#ef4444';  // red-500
  }
}

/** Map a PaceStatus to a human-readable label */
export function getPaceLabel(pace: PaceStatus): string {
  switch (pace) {
    case 'ahead': return 'Ahead';
    case 'on_track': return 'On Track';
    case 'behind': return 'Behind';
    case 'at_risk': return 'At Risk';
  }
}

/** Compute per-metric pacing against a goal row */
export function getMetricPaces(
  goal: MetricRow,
  actual: MetricRow,
  pctThroughMonth: number,
): MetricPace[] {
  const metrics: MetricKey[] = [
    'dials', 'connects', 'conversations', 'emails_sent',
    'linkedin_touches',
    'discovery_set', 'discovery_held', 'demo_held', 'proposal_sent',
    'closed_won', 'revenue',
  ];

  return metrics.map((metric) => {
    const g = goal[metric] ?? 0;
    const a = actual[metric] ?? 0;
    const pctComplete = g > 0 ? a / g : 0;
    return {
      metric,
      goal: g,
      actual: a,
      pct_complete: pctComplete,
      pct_through_month: pctThroughMonth,
      pace: getPaceStatus(pctComplete, pctThroughMonth),
    };
  });
}

/** Project full-funnel outcomes from daily activity using driver rates */
export function projectFromActivity(
  baseRates: DriverRates,
  dials: number,
  emailsSent: number,
): MetricRow {
  const connects = Math.round(dials * baseRates.connect_rate);
  const conversations = Math.round(connects * baseRates.conversation_rate);
  const discoverySet = Math.round(conversations * baseRates.set_rate);
  const discoveryHeld = Math.round(discoverySet * baseRates.show_rate);
  const demoHeld = Math.round(discoveryHeld * baseRates.demo_rate);
  const proposalSent = Math.round(demoHeld * baseRates.proposal_rate);
  const closedWon = Math.round(demoHeld * baseRates.close_rate);
  const revenue = Math.round(closedWon * baseRates.avg_revenue);

  return {
    dials,
    connects,
    conversations,
    email_conversations: 0,
    linkedin_conversations: 0,
    emails_sent: emailsSent,
    linkedin_touches: 0,
    discovery_set: discoverySet,
    discovery_held: discoveryHeld,
    demo_held: demoHeld,
    proposal_sent: proposalSent,
    closed_won: closedWon,
    revenue,
  };
}
