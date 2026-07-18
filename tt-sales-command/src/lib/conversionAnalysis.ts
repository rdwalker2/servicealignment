// ============================================================
// Conversion Analysis Engine — stage-to-stage conversion rates
// ============================================================
import type { MetricRow, DriverRates, FunnelConversionPair } from '../types';
import { FUNNEL_CONVERSION_PAIRS } from '../types';
import { safeDiv, computeDriverRates } from './math';
import type { HistoricalMonth } from '../data/seedData';

export interface ConversionSnapshot {
  month: string;
  rates: Record<string, number>; // pair label → rate
}

export interface ConversionGap {
  pair: FunnelConversionPair;
  actual: number;
  benchmark: number;
  gap: number;       // benchmark - actual (positive = underperforming)
  impact: string;    // coaching tip
}

// Coaching tips keyed by the 'from' metric
const COACHING_TIPS: Record<string, string> = {
  dials: 'More dials = more connects. Increase daily call blocks to fill the top of funnel.',
  connects: 'Low connect rate drags every stage below it. Try calling at different hours or refining your list.',
  conversations: 'Conversations unlock all pipeline. Improve your opener to convert more connects into real dialogue.',
  discovery_set: 'Fix this first — it gates everything below it. Convert more conversations into booked meetings.',
  discovery_held: 'High no-show rate is killing pipeline. Add a pre-call confirmation touchpoint 24h before each meeting.',
  demo_held: 'Push stalled demos to proposal stage. Every day without a proposal is lost momentum.',
};

/** Compute conversion rate for each pair from a MetricRow */
export function computeMonthlyConversions(row: MetricRow): Record<string, number> {
  const result: Record<string, number> = {};
  for (const pair of FUNNEL_CONVERSION_PAIRS) {
    result[pair.label] = safeDiv(row[pair.to], row[pair.from]);
  }
  return result;
}

/** Compute a time-series of conversion snapshots from historical months */
export function computeConversionTrend(history: HistoricalMonth[]): ConversionSnapshot[] {
  return history.map(m => ({
    month: m.month,
    rates: computeMonthlyConversions(m),
  }));
}

/** Identify conversion gaps sorted by severity (biggest gap first) */
export function identifyBottlenecks(
  current: MetricRow,
  benchmarkRates?: Record<string, number>,
): ConversionGap[] {
  const gaps: ConversionGap[] = [];
  
  for (const pair of FUNNEL_CONVERSION_PAIRS) {
    const actual = safeDiv(current[pair.to], current[pair.from]);
    const benchmark = benchmarkRates?.[pair.label] ?? pair.benchmark;
    const gap = benchmark - actual;
    
    if (gap > 0) {
      gaps.push({
        pair,
        actual,
        benchmark,
        gap,
        impact: COACHING_TIPS[pair.from] ?? 'Focus on improving this conversion rate.',
      });
    }
  }
  
  return gaps.sort((a, b) => b.gap - a.gap);
}

/** Suggest monthly goals based on improving weakest conversion rate by a target improvement */
export function suggestGoals(
  baseline: MetricRow,
  improvementFactor: number = 0.20, // 20% improvement on weakest rate
): MetricRow {
  const rates = computeDriverRates(baseline);
  const gaps = identifyBottlenecks(baseline);
  
  // Start with baseline averages as suggested goals
  const suggested: MetricRow = { ...baseline };
  
  // If we have a gap, project what improving the weakest rate would yield
  if (gaps.length > 0) {
    const weakest = gaps[0];
    const currentRate = weakest.actual;
    const improvedRate = Math.min(currentRate * (1 + improvementFactor), weakest.benchmark);
    
    // Re-project downstream metrics from the improved rate
    // Keep upstream metrics the same, recalculate downstream
    const pairIdx = FUNNEL_CONVERSION_PAIRS.indexOf(weakest.pair);
    if (pairIdx >= 0) {
      let carry = suggested[weakest.pair.from];
      for (let i = pairIdx; i < FUNNEL_CONVERSION_PAIRS.length; i++) {
        const p = FUNNEL_CONVERSION_PAIRS[i];
        // Use improved rate for the weakest, current rates for others
        const rate = i === pairIdx ? improvedRate : safeDiv(baseline[p.to], baseline[p.from]);
        const projected = Math.round(carry * rate);
        suggested[p.to] = Math.max(projected, suggested[p.to]);
        if (i < FUNNEL_CONVERSION_PAIRS.length - 1) {
          carry = projected;
        }
      }
    }
  }
  
  return suggested;
}

/** Compute team-average conversion rates from multiple reps' historical data */
export function computeTeamBenchmarks(
  allRepHistories: HistoricalMonth[][],
): Record<string, number> {
  const sums: Record<string, { fromTotal: number; toTotal: number }> = {};
  
  for (const pair of FUNNEL_CONVERSION_PAIRS) {
    sums[pair.label] = { fromTotal: 0, toTotal: 0 };
  }
  
  for (const history of allRepHistories) {
    for (const month of history) {
      for (const pair of FUNNEL_CONVERSION_PAIRS) {
        sums[pair.label].fromTotal += month[pair.from];
        sums[pair.label].toTotal += month[pair.to];
      }
    }
  }
  
  const result: Record<string, number> = {};
  for (const pair of FUNNEL_CONVERSION_PAIRS) {
    result[pair.label] = safeDiv(sums[pair.label].toTotal, sums[pair.label].fromTotal);
  }
  
  return result;
}

/** Compute top-performer conversion rates (best individual rate per pair) */
export function computeTopPerformerRates(
  allRepHistories: HistoricalMonth[][],
): Record<string, number> {
  const result: Record<string, number> = {};
  
  for (const pair of FUNNEL_CONVERSION_PAIRS) {
    let best = 0;
    for (const history of allRepHistories) {
      // Use trailing 3 months for recency
      const recent = history.slice(-3);
      let fromTotal = 0;
      let toTotal = 0;
      for (const m of recent) {
        fromTotal += m[pair.from];
        toTotal += m[pair.to];
      }
      const rate = safeDiv(toTotal, fromTotal);
      if (rate > best) best = rate;
    }
    result[pair.label] = best;
  }
  
  return result;
}
