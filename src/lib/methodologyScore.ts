// ============================================================
// methodologyScore.ts — Per-deal methodology adherence scoring
// Measures execution quality (did the AE follow the process?)
// as opposed to BAP score which measures deal quality.
// ============================================================

import type { DiscoverySession } from './discoveryDatabase';
import { computeBAPAnswers, getCheckpointScore } from './discoveryDatabase';

export interface MethodologyScoreResult {
  totalScore: number;         // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: MethodologyBreakdownItem[];
  topGap: string | null;      // Most impactful thing they haven't done
}

export interface MethodologyBreakdownItem {
  label: string;
  maxPoints: number;
  earnedPoints: number;
  status: 'complete' | 'partial' | 'missing';
  detail: string;
}

const MAX_CP_SCORE = 10;

export function computeMethodologyScore(session: DiscoverySession): MethodologyScoreResult {
  const breakdown: MethodologyBreakdownItem[] = [];
  let totalEarned = 0;

  // ── 1. Pre-Call Setup (15 pts) ──
  // Did they set persona + Provider before first call?
  const hasPersona = !!(session.persona || session.call_sheet_persona);
  const hasATS = !!(session.current_ats && session.current_ats !== 'None');
  const hasIndustry = !!session.industry;
  const setupCount = [hasPersona, hasATS, hasIndustry].filter(Boolean).length;
  const setupPoints = Math.round((setupCount / 3) * 15);
  totalEarned += setupPoints;
  breakdown.push({
    label: 'Pre-Call Setup',
    maxPoints: 15,
    earnedPoints: setupPoints,
    status: setupCount === 3 ? 'complete' : setupCount > 0 ? 'partial' : 'missing',
    detail: [
      hasPersona ? '✓ Persona' : '✗ Persona',
      hasATS ? '✓ Provider' : '✗ Provider',
      hasIndustry ? '✓ Industry' : '✗ Industry',
    ].join(' · '),
  });

  // ── 2. Checkpoints Earned vs Overridden (20 pts) ──
  // Full points for earned, reduced for overridden
  const bapAnswers = computeBAPAnswers(session);
  const overrides = session.call_sheet_checkpoints || {};
  let cpPoints = 0;
  const cpDetails: string[] = [];

  for (let i = 1; i <= 3; i++) {
    const score = getCheckpointScore(bapAnswers, i);
    const isOverridden = !!overrides[`checkpoint${i}`];
    const isPassed = score >= (MAX_CP_SCORE * 0.75);

    if (isPassed && !isOverridden) {
      cpPoints += 7; // Full credit for earning it
      cpDetails.push(`CP${i}: ✓ Earned`);
    } else if (isOverridden) {
      cpPoints += 2; // Reduced credit for overriding
      cpDetails.push(`CP${i}: ⚡ Override`);
    } else {
      cpDetails.push(`CP${i}: ○ Pending`);
    }
  }
  const cpEarned = Math.min(cpPoints, 20);
  totalEarned += cpEarned;
  breakdown.push({
    label: 'Checkpoint Integrity',
    maxPoints: 20,
    earnedPoints: cpEarned,
    status: cpEarned >= 18 ? 'complete' : cpEarned >= 8 ? 'partial' : 'missing',
    detail: cpDetails.join(' · '),
  });

  // ── 3. Discovery Documentation (15 pts) ──
  // Did they sync Granola after calls?
  const granolaCount = session.granola_notes?.length || 0;
  const hasGranola = granolaCount > 0;
  const granolaPoints = hasGranola ? Math.min(granolaCount * 5, 15) : 0;
  totalEarned += granolaPoints;
  breakdown.push({
    label: 'Call Documentation',
    maxPoints: 15,
    earnedPoints: granolaPoints,
    status: granolaCount >= 3 ? 'complete' : granolaCount >= 1 ? 'partial' : 'missing',
    detail: `${granolaCount} call${granolaCount !== 1 ? 's' : ''} documented via Granola`,
  });

  // ── 4. ROI Quantification (10 pts) ──
  // Did they fill ROI numeric fields from the call sheet?
  const roiInputs = (session as any).roi_inputs || {};
  const hasHires = roiInputs.totalHires > 0;
  const hasTTF = roiInputs.currentTTF > 0;
  const hasAgency = roiInputs.agencySpend > 0 || roiInputs.agencyPct > 0;
  const roiCount = [hasHires, hasTTF, hasAgency].filter(Boolean).length;
  const roiPoints = Math.round((roiCount / 3) * 10);
  totalEarned += roiPoints;
  breakdown.push({
    label: 'ROI Quantification',
    maxPoints: 10,
    earnedPoints: roiPoints,
    status: roiCount === 3 ? 'complete' : roiCount > 0 ? 'partial' : 'missing',
    detail: [
      hasHires ? '✓ Hire volume' : '✗ Hire volume',
      hasTTF ? '✓ Time-to-fill' : '✗ Time-to-fill',
      hasAgency ? '✓ Agency spend' : '✗ Agency spend',
    ].join(' · '),
  });

  // ── 5. Pain Discovery Depth (10 pts) ──
  // Did they identify multiple pains?
  const painCount = session.selected_pains?.length || 0;
  const painPoints = painCount >= 4 ? 10 : painCount >= 2 ? 7 : painCount >= 1 ? 4 : 0;
  totalEarned += painPoints;
  breakdown.push({
    label: 'Pain Discovery Depth',
    maxPoints: 10,
    earnedPoints: painPoints,
    status: painCount >= 4 ? 'complete' : painCount >= 1 ? 'partial' : 'missing',
    detail: `${painCount} pain point${painCount !== 1 ? 's' : ''} identified`,
  });

  // ── 6. Pipeline Hygiene (15 pts) ──
  // next_action + next_meeting + post-call debrief
  const hasNextAction = !!session.next_action;
  const hasNextMeeting = !!session.next_meeting_date;
  const hasGutFeel = !!session.gut_feel;
  const hygieneCount = [hasNextAction, hasNextMeeting, hasGutFeel].filter(Boolean).length;
  const hygienePoints = hygieneCount * 5;
  totalEarned += hygienePoints;
  breakdown.push({
    label: 'Pipeline Hygiene',
    maxPoints: 15,
    earnedPoints: hygienePoints,
    status: hygieneCount === 3 ? 'complete' : hygieneCount > 0 ? 'partial' : 'missing',
    detail: [
      hasNextAction ? '✓ Next action' : '✗ Next action',
      hasNextMeeting ? '✓ Next meeting' : '✗ Next meeting',
      hasGutFeel ? '✓ Post-call debrief' : '✗ Post-call debrief',
    ].join(' · '),
  });

  // ── 7. Room Preparation (15 pts) ──
  // Did they configure room sections, share the room?
  const hasRoomVisibility = !!session.room_visibility && Object.values(session.room_visibility).some(Boolean);
  const hasPains = painCount > 0;
  const hasStakeholders = (session.stakeholders || []).length > 0;
  const roomCount = [hasRoomVisibility, hasPains, hasStakeholders].filter(Boolean).length;
  const roomPoints = roomCount * 5;
  totalEarned += roomPoints;
  breakdown.push({
    label: 'Room Preparation',
    maxPoints: 15,
    earnedPoints: roomPoints,
    status: roomCount === 3 ? 'complete' : roomCount > 0 ? 'partial' : 'missing',
    detail: [
      hasRoomVisibility ? '✓ Room configured' : '✗ Room not configured',
      hasPains ? '✓ Pains in room' : '✗ No pains',
      hasStakeholders ? '✓ Stakeholders mapped' : '✗ No stakeholders',
    ].join(' · '),
  });

  // ── Calculate grade ──
  const totalScore = Math.min(totalEarned, 100);
  const grade: MethodologyScoreResult['grade'] =
    totalScore >= 90 ? 'A' :
    totalScore >= 75 ? 'B' :
    totalScore >= 60 ? 'C' :
    totalScore >= 40 ? 'D' : 'F';

  // ── Find top gap ──
  const sortedGaps = breakdown
    .filter(b => b.status !== 'complete')
    .sort((a, b) => (b.maxPoints - b.earnedPoints) - (a.maxPoints - a.earnedPoints));
  const topGap = sortedGaps[0]
    ? `${sortedGaps[0].label}: ${sortedGaps[0].detail}`
    : null;

  return { totalScore, grade, breakdown, topGap };
}
