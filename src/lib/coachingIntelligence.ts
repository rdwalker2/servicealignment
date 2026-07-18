// ============================================================
// Coaching Intelligence — Manager view of rep BAP health & gaps
// Aggregates discovery session data into per-rep coaching signals
// ============================================================

import { getAllDiscoverySessions, computeBAPAnswers, getCheckpointScore, BAP_QUESTIONS, type DiscoverySession } from './discoveryDatabase';
import { REP_PROFILES } from '../contexts/AuthContext';

// ── Types ──

export interface RepCoachingProfile {
  repId: string;
  repInitials: string;
  repName: string;
  repColor: string;
  totalDeals: number;
  healthyDeals: number;
  atRiskDeals: number;
  criticalDeals: number;
  avgBAPScore: number;           // 0-100
  checkpointPassRates: {
    cp1: number;  // 0-1, proportion of deals passing CP1 (score >= 7)
    cp2: number;  // proportion passing CP2
    cp3: number;  // proportion passing CP3
  };
  topGap: string;                // e.g. 'Q3 — ROI not anchored on 5 deals'
  staleDealCount: number;        // deals not updated in >14 days
  recentWins: number;            // deals with blueprint_approved = true
  coachingPriority: 'high' | 'medium' | 'low';
  happyEarsCount: number;
  missedObjections: number;
}

// ── Internal helpers ──

const MAX_CHECKPOINT_SCORE = 27.5; // max 11 questions × 2.5 = 27.5

function getDealHealth(session: DiscoverySession): 'healthy' | 'at_risk' | 'critical' {
  const answers = computeBAPAnswers(session);
  const cp1 = getCheckpointScore(answers, 1);
  const cp2 = getCheckpointScore(answers, 2);
  const cp3 = getCheckpointScore(answers, 3);
  const totalScore = cp1 + cp2 + cp3;
  const pct = (totalScore / MAX_CHECKPOINT_SCORE) * 100;
  if (pct >= 65) return 'healthy';
  if (pct >= 35) return 'at_risk';
  return 'critical';
}

function getDealBAPScore(session: DiscoverySession): number {
  const answers = computeBAPAnswers(session);
  const cp1 = getCheckpointScore(answers, 1);
  const cp2 = getCheckpointScore(answers, 2);
  const cp3 = getCheckpointScore(answers, 3);
  const totalScore = cp1 + cp2 + cp3;
  return (totalScore / MAX_CHECKPOINT_SCORE) * 100;
}

function isStale(session: DiscoverySession): boolean {
  const daysSince = Math.floor(
    (Date.now() - new Date(session.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysSince > 14;
}

function findTopGap(sessions: DiscoverySession[]): string {
  if (sessions.length === 0) return 'No deals yet';

  // Count how many deals each question is unanswered (null) in
  const gapCounts: Record<string, number> = {};

  for (const session of sessions) {
    const answers = computeBAPAnswers(session);
    for (const q of BAP_QUESTIONS) {
      const answer = answers[q.id];
      if (answer === null || answer === undefined) {
        gapCounts[q.id] = (gapCounts[q.id] || 0) + 1;
      }
    }
  }

  // Find the question with the highest unanswered count
  let topQId: string | null = null;
  let topCount = 0;
  for (const [qId, count] of Object.entries(gapCounts)) {
    if (count > topCount) {
      topCount = count;
      topQId = qId;
    }
  }

  if (!topQId || topCount === 0) return 'No gaps found';

  const q = BAP_QUESTIONS.find(bq => bq.id === topQId);
  if (!q) return 'No gaps found';

  const qNum = parseInt(topQId.replace('q', ''), 10);
  return `Q${qNum} — ${q.title} on ${topCount} deal${topCount !== 1 ? 's' : ''}`;
}

function getCoachingPriority(
  criticalDeals: number,
  atRiskDeals: number,
  avgBAPScore: number,
  happyEarsCount: number,
  missedObjections: number
): 'high' | 'medium' | 'low' {
  if (criticalDeals > 2 || avgBAPScore < 30 || happyEarsCount > 3 || missedObjections > 3) return 'high';
  if (atRiskDeals > 2 || avgBAPScore < 60 || happyEarsCount > 1 || missedObjections > 1) return 'medium';
  return 'low';
}

// ── Main export ──

export function buildCoachingProfiles(): RepCoachingProfile[] {
  const allSessions = getAllDiscoverySessions();

  const profiles: RepCoachingProfile[] = REP_PROFILES.map(rep => {
    const repSessions = allSessions.filter(s => s.rep_id === rep.id);

    // Per-deal health and scores
    let healthyDeals = 0;
    let atRiskDeals = 0;
    let criticalDeals = 0;
    let totalBAPScore = 0;
    let cp1Passes = 0;
    let cp2Passes = 0;
    let cp3Passes = 0;
    let staleCount = 0;
    let recentWins = 0;
    let happyEarsCount = 0;
    let missedObjections = 0;

    for (const session of repSessions) {
      const answers = computeBAPAnswers(session);
      const cp1Score = getCheckpointScore(answers, 1);
      const cp2Score = getCheckpointScore(answers, 2);
      const cp3Score = getCheckpointScore(answers, 3);

      const health = getDealHealth(session);
      if (health === 'healthy') healthyDeals++;
      else if (health === 'at_risk') atRiskDeals++;
      else criticalDeals++;

      if (session.granola_notes) {
        for (const note of session.granola_notes) {
          if (note.transcript_analysis) {
            happyEarsCount += note.transcript_analysis.happy_ears_warnings.length;
            missedObjections += note.transcript_analysis.objections.filter(o => o.grade === 'Fail').length;
          }
        }
      }

      totalBAPScore += getDealBAPScore(session);

      // CP1 pass threshold >= 7
      if (cp1Score >= 7) cp1Passes++;
      // CP2 pass threshold >= 7
      if (cp2Score >= 7) cp2Passes++;
      // CP3 pass threshold >= 5
      if (cp3Score >= 5) cp3Passes++;

      if (isStale(session)) staleCount++;
      if (session.blueprint_approved) recentWins++;
    }

    const totalDeals = repSessions.length;
    const avgBAPScore = totalDeals > 0 ? totalBAPScore / totalDeals : 0;

    const checkpointPassRates = {
      cp1: totalDeals > 0 ? cp1Passes / totalDeals : 0,
      cp2: totalDeals > 0 ? cp2Passes / totalDeals : 0,
      cp3: totalDeals > 0 ? cp3Passes / totalDeals : 0,
    };

    const topGap = findTopGap(repSessions);
    const coachingPriority = getCoachingPriority(criticalDeals, atRiskDeals, avgBAPScore, happyEarsCount, missedObjections);

    return {
      repId: rep.id,
      repInitials: rep.initials,
      repName: rep.full_name,
      repColor: rep.avatar_color,
      totalDeals,
      healthyDeals,
      atRiskDeals,
      criticalDeals,
      avgBAPScore: Math.round(avgBAPScore),
      checkpointPassRates,
      topGap,
      staleDealCount: staleCount,
      recentWins,
      coachingPriority,
      happyEarsCount,
      missedObjections,
    };
  });

  // Sort: high → medium → low
  const priorityOrder: Record<RepCoachingProfile['coachingPriority'], number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  return profiles.sort((a, b) => priorityOrder[a.coachingPriority] - priorityOrder[b.coachingPriority]);
}
