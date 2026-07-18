// ============================================================
// Leaderboard — Auto-Scoring Engine
// Every point computed from Discovery Room, BAP, and Weekly Tracker
// Zero manual entry. The system IS the scorekeeper.
// ============================================================

import {
  getAllDiscoverySessions,
  computeBAPAnswers,
  getCheckpointScore,
  getCheckpointStatus,
  type DiscoverySession,
} from './discoveryDatabase';
import { getMonthlyGoal, getWeeklyActualsForMonth } from './database';
import { type MetricKey } from '../types';

// ── Point Constants ──

const POINTS = {
  // D1 — Discovery
  pains_identified: 5,    // ≥2 pains selected
  persona_identified: 5,  // persona !== null
  stakeholder_mapped: 5,  // Q2 = yes
  checkpoint_1_passed: 5, // CP1 ≥ 9/10

  // D2 — Diagnosis
  cost_of_inaction: 5,    // roi_total > 0
  problem_reframe: 5,     // persona + pains ≥ 2
  capability_gap: 5,      // Q6 = yes
  checkpoint_2_passed: 5, // CP2 ≥ 9/10

  // D3 — Demonstrate
  solution_mapped: 5,     // Q10 = yes (strategic ✓)
  proven_results: 5,      // Q9 = yes
  checkpoint_3_passed: 5, // CP3 ≥ 6.5/7.5

  // D4 — Decision
  value_validated: 5,     // alignment.value ✓
  timeline_committed: 5,  // alignment.timeline ✓
  blueprint_approved: 10, // blueprint_approved === true

  // Closed
  closed_won: 25,         // deal_stage === 'closed_won'

  // Process Quality Bonuses
  use_case_identified: 3,
  hris_captured: 3,
  competitor_mapped: 3,
  contract_end_captured: 3,
  multi_threaded: 5,
  discovery_depth: 3,
  next_meeting_set: 3,

  // Activity Bonuses (weekly)
  dial_goal_hit: 3,
  conversation_goal_hit: 3,
  pipeline_goal_hit: 5,
  demo_goal_hit: 5,
  perfect_week: 10,
  consistency_streak: 5,  // per week after 3+
} as const;

export const MAX_DEAL_POINTS = 123;

// ── Types ──

export interface DealScore {
  sessionId: string;
  companyName: string;
  createdAt: string;
  d1Points: number;
  d2Points: number;
  d3Points: number;
  d4Points: number;
  closedPoints: number;
  totalPoints: number;
  maxPossible: number;
  isPerfectDeal: boolean;
  breakdown: { label: string; earned: boolean; points: number }[];
}

export interface WeeklyBonus {
  weekStart: string;
  bonuses: { label: string; points: number }[];
  totalPoints: number;
}

export interface Badge {
  id: string;
  label: string;
  emoji: string;
  description: string;
  earned: boolean;
  earnedDate?: string;
}

export interface RepLeaderboard {
  repId: string;
  dealScores: DealScore[];
  weeklyBonuses: WeeklyBonus[];
  totalDealPoints: number;
  totalActivityPoints: number;
  totalPoints: number;
  avgPerDeal: number;
  dealsScored: number;
  perfectDeals: number;
  badges: Badge[];
}

// ── Scoring Functions ──

/** Score a single discovery session / deal */
export function scoreDeal(session: DiscoverySession): DealScore {
  const answers = computeBAPAnswers(session);
  const cp1Score = getCheckpointScore(answers, 1);
  const cp2Score = getCheckpointScore(answers, 2);
  const cp3Score = getCheckpointScore(answers, 3);
  const cp1Status = getCheckpointStatus(cp1Score, 10);
  const cp2Status = getCheckpointStatus(cp2Score, 10);
  const cp3Status = getCheckpointStatus(cp3Score, 7.5);

  const breakdown: { label: string; earned: boolean; points: number; stage: string }[] = [
    // D1
    { label: 'Pain Points Identified (≥2)', earned: (session.selected_pains || []).length >= 2, points: POINTS.pains_identified, stage: 'd1' },
    { label: 'Persona Identified', earned: session.persona !== null && session.persona !== 'all', points: POINTS.persona_identified, stage: 'd1' },
    { label: 'Stakeholder Mapped', earned: answers.q2 === 'yes', points: POINTS.stakeholder_mapped, stage: 'd1' },
    { label: 'Checkpoint 1 Passed', earned: cp1Status.passed, points: POINTS.checkpoint_1_passed, stage: 'd1' },

    // D2
    { label: 'Cost of Indecision Calculated', earned: session.roi_total > 0, points: POINTS.cost_of_inaction, stage: 'd2' },
    { label: 'Problem Reframe Delivered', earned: (session.persona !== null && session.persona !== 'all') && (session.selected_pains || []).length >= 2, points: POINTS.problem_reframe, stage: 'd2' },
    { label: 'Capability Gap Established', earned: answers.q6 === 'yes', points: POINTS.capability_gap, stage: 'd2' },
    { label: 'Checkpoint 2 Passed', earned: cp2Status.passed, points: POINTS.checkpoint_2_passed, stage: 'd2' },

    // D3
    { label: 'Solution Mapped', earned: answers.q10 === 'yes', points: POINTS.solution_mapped, stage: 'd3' },
    { label: 'Proven Results Shared', earned: answers.q9 === 'yes', points: POINTS.proven_results, stage: 'd3' },
    { label: 'Checkpoint 3 Passed', earned: cp3Status.passed, points: POINTS.checkpoint_3_passed, stage: 'd3' },

    // D4
    { label: 'ROI Validated', earned: session.alignment_checks.roi_sufficient, points: POINTS.value_validated, stage: 'd4' },
    { label: 'Priority Confirmed', earned: session.alignment_checks.urgent_priority, points: POINTS.timeline_committed, stage: 'd4' },
    { label: 'Blueprint Approved', earned: session.blueprint_approved, points: POINTS.blueprint_approved, stage: 'd4' },

    // Closed
    { label: 'Closed Won', earned: session.deal_stage === 'closed_won', points: POINTS.closed_won, stage: 'closed' },

    // Process Quality
    { label: 'Use Case Identified', earned: session.use_case !== null && session.use_case !== '', points: POINTS.use_case_identified, stage: 'd1' },
    { label: 'HRIS Captured', earned: !!(session.hris && session.hris !== ''), points: POINTS.hris_captured, stage: 'd1' },
    { label: 'Competitor Mapped', earned: !!(session.competitors_identified && session.competitors_identified !== ''), points: POINTS.competitor_mapped, stage: 'd2' },
    { label: 'Contract End Date Captured', earned: !!(session.contract_end_date && session.contract_end_date !== ''), points: POINTS.contract_end_captured, stage: 'd2' },
    { label: 'Multi-Threaded (2+ Stakeholders)', earned: (session.stakeholders?.length ?? 0) >= 2, points: POINTS.multi_threaded, stage: 'd2' },
    { label: 'Discovery Depth (8+ Questions)', earned: Object.keys(session.call_sheet_answers || {}).length >= 8, points: POINTS.discovery_depth, stage: 'd1' },
    { label: 'Next Meeting Set', earned: session.next_meeting_date !== null && session.next_meeting_date !== '', points: POINTS.next_meeting_set, stage: 'd1' },
  ];

  const d1Points = breakdown.filter(b => b.stage === 'd1' && b.earned).reduce((s, b) => s + b.points, 0);
  const d2Points = breakdown.filter(b => b.stage === 'd2' && b.earned).reduce((s, b) => s + b.points, 0);
  const d3Points = breakdown.filter(b => b.stage === 'd3' && b.earned).reduce((s, b) => s + b.points, 0);
  const d4Points = breakdown.filter(b => b.stage === 'd4' && b.earned).reduce((s, b) => s + b.points, 0);
  const closedPoints = breakdown.filter(b => b.stage === 'closed' && b.earned).reduce((s, b) => s + b.points, 0);
  const totalPoints = d1Points + d2Points + d3Points + d4Points + closedPoints;

  return {
    sessionId: session.id,
    companyName: session.company_name,
    createdAt: session.created_at,
    d1Points,
    d2Points,
    d3Points,
    d4Points,
    closedPoints,
    totalPoints,
    maxPossible: MAX_DEAL_POINTS,
    isPerfectDeal: totalPoints === MAX_DEAL_POINTS,
    breakdown,
  };
}

/** Compute weekly activity bonuses for a rep in a given month */
export function computeWeeklyBonuses(repId: string, year: number, month: number): WeeklyBonus[] {
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const goal = getMonthlyGoal(repId, monthStr);
  const actuals = getWeeklyActualsForMonth(repId, year, month);

  if (!goal || actuals.length === 0) return [];

  // Weekly goals = monthly / number of weeks in month (approx 4.33, use 4)
  const weeksInMonth = Math.max(actuals.length, 4);
  const weeklyGoals: Partial<Record<MetricKey, number>> = {};
  const metricKeys: MetricKey[] = ['dials', 'connects', 'conversations', 'emails_sent', 'discovery_set', 'discovery_held', 'demo_held', 'proposal_sent', 'closed_won', 'revenue'];
  metricKeys.forEach(k => {
    weeklyGoals[k] = Math.ceil(((goal as any)[k] || 0) / weeksInMonth);
  });

  return actuals.map(actual => {
    const bonuses: { label: string; points: number }[] = [];

    const dialGoal = weeklyGoals.dials || 0;
    const convoGoal = weeklyGoals.conversations || 0;
    const discSetGoal = weeklyGoals.discovery_set || 0;
    const demoGoal = weeklyGoals.demo_held || 0;

    if (dialGoal > 0 && actual.dials >= dialGoal) {
      bonuses.push({ label: 'Dial Warrior', points: POINTS.dial_goal_hit });
    }
    if (convoGoal > 0 && actual.conversations >= convoGoal) {
      bonuses.push({ label: 'Conversation King', points: POINTS.conversation_goal_hit });
    }
    if (discSetGoal > 0 && actual.discovery_set >= discSetGoal) {
      bonuses.push({ label: 'Pipeline Builder', points: POINTS.pipeline_goal_hit });
    }
    if (demoGoal > 0 && actual.demo_held >= demoGoal) {
      bonuses.push({ label: 'Demo Machine', points: POINTS.demo_goal_hit });
    }

    // Perfect Week: all metrics at or above weekly goal
    const allMet = metricKeys.every(k => {
      const wg = weeklyGoals[k] || 0;
      return wg === 0 || (actual as any)[k] >= wg;
    });
    if (allMet && metricKeys.some(k => (weeklyGoals[k] || 0) > 0)) {
      bonuses.push({ label: 'Perfect Week', points: POINTS.perfect_week });
    }

    return {
      weekStart: actual.week_start,
      bonuses,
      totalPoints: bonuses.reduce((s, b) => s + b.points, 0),
    };
  });
}

/** Compute badges for a rep */
export function computeBadges(dealScores: DealScore[], weeklyBonuses: WeeklyBonus[]): Badge[] {
  const perfectDeals = dealScores.filter(d => d.isPerfectDeal).length;
  const reframeDeals = dealScores.filter(d => d.breakdown.find(b => b.label === 'Problem Reframe Delivered')?.earned).length;
  const sweepDeals = dealScores.filter(d => {
    const cp1 = d.breakdown.find(b => b.label === 'Checkpoint 1 Passed')?.earned;
    const cp2 = d.breakdown.find(b => b.label === 'Checkpoint 2 Passed')?.earned;
    const cp3 = d.breakdown.find(b => b.label === 'Checkpoint 3 Passed')?.earned;
    return cp1 && cp2 && cp3;
  }).length;
  const totalDeals = dealScores.length;

  // Consistency streak: find longest run of consecutive weeks with at least 1 bonus
  let maxStreak = 0;
  let currentStreak = 0;
  weeklyBonuses.forEach(w => {
    if (w.totalPoints > 0) { currentStreak++; maxStreak = Math.max(maxStreak, currentStreak); }
    else currentStreak = 0;
  });

  return [
    { id: 'perfect-deal', label: 'Perfect Deal', emoji: '🏅', description: '100/100 points on a single deal', earned: perfectDeals >= 1, earnedDate: perfectDeals >= 1 ? dealScores.find(d => d.isPerfectDeal)?.createdAt : undefined },
    { id: 'hot-streak', label: 'Hot Streak', emoji: '🔥', description: '3+ consecutive weeks with activity bonuses', earned: maxStreak >= 3 },
    { id: 'doctors-orders', label: "Doctor's Orders", emoji: '🩺', description: '5+ deals with Problem Reframe delivered', earned: reframeDeals >= 5 },
    { id: 'checkpoint-sweep', label: 'Checkpoint Sweep', emoji: '🎯', description: '3+ deals with all 3 checkpoints PASSED', earned: sweepDeals >= 3 },
    { id: 'pipeline-machine', label: 'Pipeline Machine', emoji: '⚡', description: '10+ discovery sessions created in a month', earned: totalDeals >= 10 },
    { id: 'process-champion', label: 'Process Champion', emoji: '👑', description: 'Highest avg score per deal', earned: false }, // Computed at leaderboard level
  ];
}

/** Build the full leaderboard for a rep */
export function buildRepLeaderboard(repId: string, windowDays: number = 90): RepLeaderboard {
  const allSessions = getAllDiscoverySessions();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - windowDays);

  // Filter sessions for this rep within the window
  const repSessions = allSessions
    .filter(s => s.rep_id === repId)
    .filter(s => new Date(s.created_at) >= cutoff);

  const dealScores = repSessions.map(scoreDeal);

  // Compute weekly bonuses for the months in the window
  const now = new Date();
  const months: { year: number; month: number }[] = [];
  for (let i = 0; i < Math.ceil(windowDays / 30); i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() });
  }
  const weeklyBonuses = months.flatMap(m => computeWeeklyBonuses(repId, m.year, m.month));

  const totalDealPoints = dealScores.reduce((s, d) => s + d.totalPoints, 0);
  const totalActivityPoints = weeklyBonuses.reduce((s, w) => s + w.totalPoints, 0);

  // Streak bonus: 5 pts per week after 3+ consecutive
  let streakBonus = 0;
  let streak = 0;
  weeklyBonuses.forEach(w => {
    if (w.totalPoints > 0) {
      streak++;
      if (streak > 3) streakBonus += POINTS.consistency_streak;
    } else {
      streak = 0;
    }
  });

  const totalPoints = totalDealPoints + totalActivityPoints + streakBonus;
  const dealsScored = dealScores.filter(d => d.totalPoints > 0).length;
  const avgPerDeal = dealsScored >= 3 ? Math.round(totalDealPoints / dealsScored) : 0; // Min 3 deals to qualify
  const badges = computeBadges(dealScores, weeklyBonuses);

  return {
    repId,
    dealScores,
    weeklyBonuses,
    totalDealPoints,
    totalActivityPoints: totalActivityPoints + streakBonus,
    totalPoints,
    avgPerDeal,
    dealsScored,
    perfectDeals: dealScores.filter(d => d.isPerfectDeal).length,
    badges,
  };
}

/** Build leaderboard for all reps, sorted by total points */
export function buildFullLeaderboard(repIds: string[], windowDays: number = 90): RepLeaderboard[] {
  const boards = repIds.map(id => buildRepLeaderboard(id, windowDays));

  // Award Process Champion badge to the rep with highest avg per deal (min 3 deals)
  const qualified = boards.filter(b => b.dealsScored >= 3);
  if (qualified.length > 0) {
    const champion = qualified.reduce((best, b) => b.avgPerDeal > best.avgPerDeal ? b : best);
    const champBadge = champion.badges.find(b => b.id === 'process-champion');
    if (champBadge) champBadge.earned = true;
  }

  return boards.sort((a, b) => b.totalPoints - a.totalPoints);
}

/** Get the monthly leaderboard (current month only) */
export function buildMonthlyLeaderboard(repIds: string[]): RepLeaderboard[] {
  const now = new Date();
  const daysSinceMonthStart = now.getDate();
  return buildFullLeaderboard(repIds, daysSinceMonthStart);
}
