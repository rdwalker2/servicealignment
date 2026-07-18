// ============================================================
// Deal Health Engine — BAP-driven scoring + coaching nudges
// ============================================================

import { computeBAPAnswers, getCheckpointScore, type DiscoverySession } from './discoveryDatabase';

export interface DealHealthNudge {
  severity: 'error' | 'warning' | 'info';
  message: string;
}

export interface DealHealth {
  status: 'healthy' | 'at_risk' | 'critical';
  score: number;         // 0–100
  nudges: DealHealthNudge[];
  daysInStage: number;
  isStale: boolean;      // true if >14 days in current stage
}

const SEVERITY_ORDER: Record<DealHealthNudge['severity'], number> = {
  error: 0,
  warning: 1,
  info: 2,
};

export function computeDealHealth(session: DiscoverySession): DealHealth {
  const answers = computeBAPAnswers(session);

  // ── Checkpoint scores ──────────────────────────────────────
  // Checkpoint 1: 4 questions × 2.5 = max 10
  // Checkpoint 2: 4 questions × 2.5 = max 10
  // Checkpoint 3: 3 questions × 2.5 = max 7.5
  const cp1 = getCheckpointScore(answers, 1);   // max 10
  const cp2 = getCheckpointScore(answers, 2);   // max 10
  const cp3 = getCheckpointScore(answers, 3);   // max 7.5

  const score = Math.round(((cp1 + cp2 + cp3) / 27.5) * 100);

  // ── Status ────────────────────────────────────────────────
  const status: DealHealth['status'] =
    score >= 65 ? 'healthy' : score >= 35 ? 'at_risk' : 'critical';

  // ── Staleness ─────────────────────────────────────────────
  const createdAt = new Date(session.created_at).getTime();
  const nowMs = Date.now();
  const daysInStage = Math.floor((nowMs - createdAt) / (1000 * 60 * 60 * 24));
  const isStale = daysInStage > 14;

  // ── Nudges ────────────────────────────────────────────────
  const allNudges: DealHealthNudge[] = [];

  if (answers.q1 === null) {
    allNudges.push({
      severity: 'error',
      message: 'No pains captured yet — open with the Urgency Test before anything else.',
    });
  }

  if (answers.q2 === null) {
    allNudges.push({
      severity: 'error',
      message: 'Stakeholder not mapped — ask who owns this problem and makes the final decision.',
    });
  }

  if (answers.q3 === null) {
    allNudges.push({
      severity: 'warning',
      message: 'ROI not anchored — calculate the cost of indecision before moving to D2.',
    });
  }

  if (answers.q4 === null || answers.q4 === 'no') {
    allNudges.push({
      severity: 'warning',
      message: 'Priority unconfirmed — ask: Is solving this in your top 3 priorities right now?',
    });
  }

  if (answers.q6 !== 'yes') {
    allNudges.push({
      severity: 'warning',
      message: 'Capability gap not established — ask: Why has your current approach failed to fully solve this?',
    });
  }

  if (answers.q8 !== 'yes') {
    allNudges.push({
      severity: 'warning',
      message: 'Budget unconfirmed — ask about allocated budget and implementation readiness.',
    });
  }

  if (answers.q9 !== 'yes') {
    allNudges.push({
      severity: 'info',
      message: 'Proven results not shared — drop a specific customer case study relevant to their industry.',
    });
  }

  if (answers.q10 !== 'yes') {
    allNudges.push({
      severity: 'info',
      message: 'Solution map incomplete — confirm: Is it completely clear how Service Alignment fixes their specific problem?',
    });
  }

  if (isStale) {
    allNudges.push({
      severity: 'warning',
      message: `Deal stale at ${daysInStage} days — set a next meeting date and create urgency around their timeline.`,
    });
  }

  if (!session.blueprint_approved && score >= 65) {
    allNudges.push({
      severity: 'info',
      message: 'Deal is healthy — push for Blueprint approval to lock in commitment.',
    });
  }

  // ── Price Objections Trinity Nudges ──────────────────────────
  // Fire when Trinity steps are incomplete, signaling price fatality risk

  if (answers.q6 === null && (answers.q5 !== null || answers.q7 !== null)) {
    // In D2+ but root cause not diagnosed → Step 1 missing
    allNudges.push({
      severity: 'warning',
      message: '🔺 Price risk: The bigger problem hasn\'t been diagnosed. Without problem elevation, they\'ll see your price as too high for a simple Provider. Complete root cause diagnosis before discussing cost.',
    });
  }

  if (answers.q8 !== 'yes' && (!session.roi_total || session.roi_total === 0)) {
    // Budget not confirmed AND no ROI calculated → Step 2 missing
    allNudges.push({
      severity: 'warning',
      message: '🔺 Trinity gap: ROI hasn\'t been anchored. Calculate the value stack before the next call — if they hear your price before seeing the ROI, sticker shock is almost guaranteed.',
    });
  }

  if (answers.q8 !== null && answers.q8 !== 'yes' && session.roi_total && session.roi_total > 0 && !session.budget_confirmed) {
    // Got a budget answer + has ROI but budget not confirmed → Step 3 gap
    allNudges.push({
      severity: 'info',
      message: '🔺 You have the ROI ($' + session.roi_total.toLocaleString() + ') but budget isn\'t confirmed. Ask: "Based on saving $' + session.roi_total.toLocaleString() + ', what would you typically invest to create that outcome?" — anchor before proposing.',
    });
  }

  // Sort by severity (error → warning → info) and cap at 4
  const nudges = allNudges
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
    .slice(0, 4);

  return { status, score, nudges, daysInStage, isStale };
}
