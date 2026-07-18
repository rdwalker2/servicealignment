// ============================================================
// Goal Attainment Forecast — computes month-to-date pacing
// ============================================================
import { getMonthlyGoal, getWeeklyActualsForMonth, sumWeeklyActuals } from './database';
import { getWeeksInMonth } from './calculations';

export interface GoalForecast {
  monthlyGoalRevenue: number;
  pacingRevenue: number;
  pacingPct: number;
  gapRevenue: number;
  weekNumber: number;
  weeksRemaining: number;
  requiredPerWeek: number;
  bottleneck: { metric: string; label: string; impact: string } | null;
  status: 'on_track' | 'at_risk' | 'behind';
  metricPacing: {
    key: string;
    label: string;
    goal: number;
    actual: number;
    pct: number;
  }[];
}

// ---- Human-readable labels for bottleneck callouts ----
const METRIC_LABEL_MAP: Record<string, string> = {
  dials: 'Dials',
  connects: 'Connects',
  conversations: 'Conversations',
  email_conversations: 'Email Conversations',
  linkedin_conversations: 'LinkedIn Conversations',
  emails_sent: 'Emails Sent',
  linkedin_touches: 'LinkedIn Touches',
  discovery_set: 'Discovery Set',
  discovery_held: 'Discovery Held',
  disqualified: 'Disqualified',
  demo_held: 'Demo Held',
  proposal_sent: 'Proposal Sent',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
  revenue: 'Revenue',
};

// Describes the funnel impact of each weak stage
const METRIC_IMPACT_MAP: Record<string, string> = {
  dials: 'More dials = more connects. Increase daily call blocks to fill the top of funnel.',
  connects: 'Low connect rate drags every stage below it. Try calling at different hours or refining your list.',
  conversations: 'Conversations unlock all pipeline. Improve your opener to convert more connects into real dialogue.',
  email_conversations: 'Email replies are a key engagement signal. Improve subject lines and personalization.',
  linkedin_conversations: 'LinkedIn DMs build trust. Increase connection requests and value-first messaging.',
  emails_sent: 'Email volume builds awareness and accelerates warm calls. Ramp sequences this week.',
  linkedin_touches: 'LinkedIn activity creates warm inbound. Increase profile views and engagement.',
  discovery_set: 'Fix this first — it gates everything below it in the funnel. Convert more conversations into booked meetings.',
  discovery_held: 'High no-show rate is killing pipeline. Add a pre-call confirmation touchpoint 24 h before each meeting.',
  disqualified: 'DQ rate is above pace — review your qualification criteria to ensure you\'re not disqualifying too aggressively.',
  demo_held: 'Demo held is below pace — work to advance more discoveries into demos this week.',
  proposal_sent: 'Proposals are the bridge to closed revenue. Push stalled demos to proposal stage immediately.',
  closed_won: 'Wins are the endgame. Focus on accelerating proposal-to-close velocity.',
  closed_lost: 'Losses are above pace — review objection handling and competitive positioning.',
  revenue: 'Revenue is the ultimate metric. Focus on deal size and close rate optimization.',
};

// ---- Zero-state forecast returned when no goal is set ----
const ZERO_FORECAST: GoalForecast = {
  monthlyGoalRevenue: 0,
  pacingRevenue: 0,
  pacingPct: 0,
  gapRevenue: 0,
  weekNumber: 0,
  weeksRemaining: 0,
  requiredPerWeek: 0,
  bottleneck: null,
  status: 'behind',
  metricPacing: [],
};

// ---- 8 non-revenue metrics we track in the attainment grid ----
const GRID_METRICS = [
  'dials', 'connects', 'conversations', 'email_conversations', 'linkedin_conversations',
  'emails_sent', 'linkedin_touches',
  'discovery_set', 'discovery_held', 'disqualified', 'demo_held', 'proposal_sent',
  'closed_won', 'closed_lost', 'revenue',
] as const;

type GridMetric = (typeof GRID_METRICS)[number];

export function computeGoalForecast(
  repId: string,
  year: number,
  month: number, // 0-indexed (JS Date.getMonth())
): GoalForecast {
  // Build the month string in YYYY-MM-DD format (first of month)
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;

  // ---- Fetch goal ----
  const goal = getMonthlyGoal(repId, monthStr);
  if (!goal) return { ...ZERO_FORECAST };

  // ---- Fetch actuals ----
  const weeklyActuals = getWeeklyActualsForMonth(repId, year, month);
  const actuals = sumWeeklyActuals(weeklyActuals);

  // ---- Week arithmetic ----
  const allWeeks = getWeeksInMonth(year, month); // array of Monday ISO strings
  const totalWeeks = allWeeks.length || 4;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Count weeks that have *started* (week_start <= today)
  const weekNumber = allWeeks.filter((w) => {
    const weekDate = new Date(w + 'T00:00:00');
    return weekDate <= today;
  }).length;

  const weeksRemaining = Math.max(0, totalWeeks - weekNumber);

  // ---- Revenue pacing ----
  const actualRevenue = actuals.revenue;
  const monthlyGoalRevenue = goal.revenue;

  const pacingRevenue =
    weekNumber > 0
      ? (actualRevenue / weekNumber) * totalWeeks
      : 0;

  const pacingPct = monthlyGoalRevenue > 0 ? pacingRevenue / monthlyGoalRevenue : 0;
  const gapRevenue = Math.max(0, monthlyGoalRevenue - actualRevenue);
  const requiredPerWeek = weeksRemaining > 0 ? gapRevenue / weeksRemaining : 0;

  // ---- Status ----
  let status: GoalForecast['status'];
  if (pacingPct >= 0.85) {
    status = 'on_track';
  } else if (pacingPct >= 0.5) {
    status = 'at_risk';
  } else {
    status = 'behind';
  }

  // ---- Metric pacing for the 8-metric grid ----
  // Pro-rated goal = (monthly goal / totalWeeks) * weekNumber
  // This shows how much of the goal *should* be done by now
  const metricPacing = GRID_METRICS.map((key) => {
    const monthlyGoalValue = (goal as unknown as Record<string, number>)[key] ?? 0;
    const proRatedGoal =
      totalWeeks > 0 && weekNumber > 0
        ? (monthlyGoalValue / totalWeeks) * weekNumber
        : 0;
    const actualValue = (actuals as unknown as Record<string, number>)[key] ?? 0;
    const pct = proRatedGoal > 0 ? actualValue / proRatedGoal : actualValue > 0 ? 1 : 0;

    return {
      key,
      label: METRIC_LABEL_MAP[key] ?? key,
      goal: proRatedGoal,
      actual: actualValue,
      pct,
    };
  });

  // ---- Bottleneck: lowest pct metric (excluding revenue) ----
  const bottleneckMetric = [...metricPacing].sort((a, b) => a.pct - b.pct)[0] as
    | (typeof metricPacing)[number]
    | undefined;

  const bottleneck =
    bottleneckMetric && bottleneckMetric.pct < 1
      ? {
          metric: bottleneckMetric.key,
          label: METRIC_LABEL_MAP[bottleneckMetric.key as GridMetric] ?? bottleneckMetric.key,
          impact:
            METRIC_IMPACT_MAP[bottleneckMetric.key as GridMetric] ??
            'Fix this metric to unblock the rest of the funnel.',
        }
      : null;

  return {
    monthlyGoalRevenue,
    pacingRevenue,
    pacingPct,
    gapRevenue,
    weekNumber,
    weeksRemaining,
    requiredPerWeek,
    bottleneck,
    status,
    metricPacing,
  };
}
