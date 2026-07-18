// ============================================================
// Pure Math / Aggregation Helpers
// ============================================================
import type { MetricRow, DriverRates, MetricKey, WeeklyActual } from '../types';

/** Safe divide — returns 0 when the denominator is 0 */
export function safeDiv(num: number, den: number): number {
  return den === 0 ? 0 : num / den;
}

/** Compute conversion / driver rates from a MetricRow */
export function computeDriverRates(row: MetricRow): DriverRates {
  return {
    connect_rate: safeDiv(row.connects, row.dials),
    conversation_rate: safeDiv(row.conversations, row.connects),
    set_rate: safeDiv(row.discovery_set, row.conversations),
    show_rate: safeDiv(row.discovery_held, row.discovery_set),
    demo_rate: safeDiv(row.demo_held, row.discovery_held),
    proposal_rate: safeDiv(row.proposal_sent, row.demo_held),
    close_rate: safeDiv(row.closed_won, row.demo_held),
    avg_revenue: safeDiv(row.revenue, row.closed_won),
  };
}

const METRIC_KEYS: MetricKey[] = [
  'dials', 'connects', 'conversations', 'emails_sent',
  'linkedin_touches',
  'discovery_set', 'discovery_held', 'demo_held', 'proposal_sent',
  'closed_won', 'closed_lost', 'disqualified', 'revenue',
];

/** Create a zeroed-out MetricRow */
function emptyRow(): MetricRow {
  return {
    dials: 0, connects: 0, conversations: 0, email_conversations: 0, linkedin_conversations: 0, emails_sent: 0,
    linkedin_touches: 0,
    discovery_set: 0, discovery_held: 0, demo_held: 0, proposal_sent: 0,
    closed_won: 0, closed_lost: 0, disqualified: 0, revenue: 0,
  };
}

/** Sum multiple MetricRows into one */
export function sumMetricRows(rows: MetricRow[]): MetricRow {
  const result = emptyRow();
  for (const row of rows) {
    for (const key of METRIC_KEYS) {
      result[key] += row[key] ?? 0;
    }
  }
  return result;
}

/** Average multiple MetricRows (rounded to integers) */
export function avgMetricRows(rows: MetricRow[]): MetricRow {
  if (rows.length === 0) return emptyRow();
  const sum = sumMetricRows(rows);
  const result: MetricRow = { ...sum };
  for (const key of METRIC_KEYS) {
    result[key] = Math.round(result[key] / rows.length);
  }
  return result;
}

/** Sum an array of WeeklyActuals into a single MetricRow */
export function sumWeeklyActuals(actuals: WeeklyActual[]): MetricRow {
  const result = emptyRow();
  for (const a of actuals) {
    for (const key of METRIC_KEYS) {
      result[key] += a[key] ?? 0;
    }
  }
  return result;
}
