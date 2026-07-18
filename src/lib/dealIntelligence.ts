// ============================================================
// Deal Intelligence Bridge
// Reverse-engineers Discovery Room sessions into scored deals
// for the 4D Pipeline Rigor integration.
// ============================================================

import {
  getAllDiscoverySessions,
  computeBAPAnswers,
  getCheckpointScore,
  getCheckpointStatus,
  BAP_QUESTIONS,
  type DiscoverySession,
  type BAPAnswer,
} from './discoveryDatabase';

// ── Types ──

export interface DiscoveryDeal {
  id: string;
  companyName: string;
  persona: string;
  stage: string;
  createdAt: string;
  lastUpdated: string;
  // Scoring
  bapScore: number; // 0-100
  checkpoint1Passed: boolean;
  checkpoint2Passed: boolean;
  checkpoint3Passed: boolean;
  healthStatus: 'healthy' | 'at_risk' | 'critical';
  // Key signals
  selectedPains: string[];
  currentATS: string | null;
  budgetConfirmed: boolean;
  championIdentified: boolean;
  stakeholderCount: number;
  // Computed flags
  isStale: boolean; // >7 days since last update
  dealKillFlags: string[]; // list of flag labels
  nextAction: string | null;
}

export interface DealInsights {
  totalDeals: number;
  avgScore: number;
  healthBreakdown: { healthy: number; at_risk: number; critical: number };
  topPains: { painId: string; count: number }[];
  topCompetitors: { ats: string; count: number }[];
  staleDeals: number;
  budgetConfirmedRate: number; // percentage
}

// ── Pain label mapping ──

const PAIN_LABELS: Record<string, string> = {
  'slow-time-to-hire': 'Slow Time to Hire',
  'poor-candidate-experience': 'Poor Candidate Experience',
  'high-cost-per-hire': 'High Cost Per Hire',
  'outdated-career-site': 'Outdated Career Site',
  'locked-out-managers': 'Managers Locked Out of Process',
  'no-pipeline-visibility': 'No Pipeline Visibility',
  'manual-screening': 'Manual Screening Overhead',
  'weak-talent-pools': 'Weak Talent Pools',
  'no-content-hub': 'No Content Hub / Employer Brand',
  'multi-language-gaps': 'Multi-Language Gaps',
  'scorecard-friction': 'Scorecard / Interview Friction',
  'no-mobile-feedback': 'No Mobile Feedback',
};

export function getPainLabel(id: string): string {
  return PAIN_LABELS[id] || id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ── Provider label mapping ──

const ATS_LABELS: Record<string, string> = {
  greenhouse: 'Greenhouse',
  ashby: 'Ashby',
  bamboohr: 'BambooHR',
  lever: 'Lever',
  workday: 'Workday',
  icims: 'iCIMS',
  smartrecruiters: 'SmartRecruiters',
  workable: 'Workable',
  jazzhr: 'JazzHR',
  paycor: 'Paycor',
  other: 'Other',
};

export function getATSLabel(id: string): string {
  return ATS_LABELS[id] || id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ── Persona label mapping ──

const PERSONA_LABELS: Record<string, string> = {
  'dir-eb': 'Director / EB',
  'vp-ta': 'VP Talent Acquisition',
  'chro': 'CHRO',
  'hiring-manager': 'Hiring Manager',
  'all': 'All',
};

function getPersonaLabel(id: string | null): string {
  if (!id) return 'Unknown';
  return PERSONA_LABELS[id] || id;
}

// ── Scoring ──

/**
 * Compute a deal health score (0–100) for a DiscoverySession.
 *
 * Weights:
 *  - CP1 questions answered: 30%
 *  - CP2 questions answered: 30%
 *  - CP3 questions answered: 20%
 *  - Alignment checks:       10%
 *  - Stakeholders mapped:     5%
 *  - Budget confirmed:        5%
 */
export function computeDealScore(session: DiscoverySession): number {
  const answers = computeBAPAnswers(session);

  // CP1 — 4 questions, max 10 pts
  const cp1Qs = BAP_QUESTIONS.filter(q => q.checkpoint === 1);
  const cp1Score = getCheckpointScore(answers, 1);
  const cp1Max = cp1Qs.length * 2.5;
  const cp1Pct = cp1Max > 0 ? cp1Score / cp1Max : 0;

  // CP2 — 4 questions, max 10 pts
  const cp2Qs = BAP_QUESTIONS.filter(q => q.checkpoint === 2);
  const cp2Score = getCheckpointScore(answers, 2);
  const cp2Max = cp2Qs.length * 2.5;
  const cp2Pct = cp2Max > 0 ? cp2Score / cp2Max : 0;

  // CP3 — 4 questions, max 10 pts
  const cp3Qs = BAP_QUESTIONS.filter(q => q.checkpoint === 3);
  const cp3Score = getCheckpointScore(answers, 3);
  const cp3Max = cp3Qs.length * 2.5;
  const cp3Pct = cp3Max > 0 ? cp3Score / cp3Max : 0;

  // Alignment checks (5 booleans)
  const alignmentChecks = session.alignment_checks;
  const alignmentTotal = 5;
  const alignmentHit = [
    alignmentChecks.urgent_priority,
    alignmentChecks.resources_insufficient,
    alignmentChecks.problems_solutions,
    alignmentChecks.roi_sufficient,
    alignmentChecks.right_solution,
  ].filter(Boolean).length;
  const alignPct = alignmentHit / alignmentTotal;

  // Stakeholders mapped (cap at 4 for 100%)
  const stakeholders = session.stakeholders ?? [];
  const namedStakeholders = stakeholders.filter(s => s.name.trim().length > 0);
  const stakeholderPct = Math.min(namedStakeholders.length / 4, 1);

  // Budget confirmed
  const budgetPct = session.budget_confirmed ? 1 : 0;

  const score =
    cp1Pct * 30 +
    cp2Pct * 30 +
    cp3Pct * 20 +
    alignPct * 10 +
    stakeholderPct * 5 +
    budgetPct * 5;

  return Math.round(score);
}

// ── Helpers ──

function daysSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

function determineLastUpdated(session: DiscoverySession): string {
  // Use the most recent of created_at, completed_at, milestones, or custom meetings
  const candidates = [session.created_at];
  if (session.completed_at) candidates.push(session.completed_at);
  if (session.milestones) {
    Object.values(session.milestones).forEach(m => {
      if (m?.date) candidates.push(m.date);
    });
  }
  if (session.custom_meetings) {
    session.custom_meetings.forEach(m => {
      if (m.date) candidates.push(m.date);
    });
  }
  // Pick the most recent
  return candidates.reduce((latest, d) => {
    return new Date(d).getTime() > new Date(latest).getTime() ? d : latest;
  });
}

function computeKillFlags(session: DiscoverySession, answers: Record<string, BAPAnswer>): string[] {
  const flags: string[] = [];

  // No pains selected
  if (session.selected_pains.length === 0) flags.push('No pains identified');

  // No stakeholder mapped
  const hasNamedStakeholder = (session.stakeholders ?? []).some(s => s.name.trim().length > 0);
  if (!hasNamedStakeholder && (!session.persona || session.persona === 'all')) {
    flags.push('No stakeholder mapped');
  }

  // No ROI
  if (session.roi_total <= 0) flags.push('No ROI calculated');

  // No compelling event (priority not confirmed)
  if (answers.q4 !== 'yes') flags.push('No compelling event');

  // No capability gap
  if (answers.q6 !== 'yes') flags.push('Capability gap unconfirmed');

  // Solution not mapped
  if (answers.q10 !== 'yes') flags.push('Solution not mapped');

  // No budget
  if (!session.budget_confirmed) flags.push('Budget unconfirmed');

  return flags;
}

// ── Main exports ──

/**
 * Read all Discovery Room sessions from localStorage, compute BAP scores,
 * checkpoint status, health, and return an array of DiscoveryDeal objects.
 */
export function getDiscoveryRoomDeals(): DiscoveryDeal[] {
  const sessions = getAllDiscoverySessions();

  return sessions.map(session => {
    const answers = computeBAPAnswers(session);
    const cp1Score = getCheckpointScore(answers, 1);
    const cp2Score = getCheckpointScore(answers, 2);
    const cp3Score = getCheckpointScore(answers, 3);

    const cp1Max = BAP_QUESTIONS.filter(q => q.checkpoint === 1).length * 2.5;
    const cp2Max = BAP_QUESTIONS.filter(q => q.checkpoint === 2).length * 2.5;
    const cp3Max = BAP_QUESTIONS.filter(q => q.checkpoint === 3).length * 2.5;

    const cp1Status = getCheckpointStatus(cp1Score, cp1Max);
    const cp2Status = getCheckpointStatus(cp2Score, cp2Max);
    const cp3Status = getCheckpointStatus(cp3Score, cp3Max);

    const bapScore = computeDealScore(session);
    const lastUpdated = determineLastUpdated(session);
    const isStale = daysSince(lastUpdated) > 7;

    // Health status
    const healthStatus: DiscoveryDeal['healthStatus'] =
      bapScore >= 60 ? 'healthy' :
      bapScore >= 30 ? 'at_risk' :
      'critical';

    // Champion identification
    const hasChampion =
      (session.stakeholders ?? []).some(s => s.role === 'Champion' && s.name.trim().length > 0) ||
      session.champion_name.trim().length > 0;

    const dealKillFlags = computeKillFlags(session, answers);

    return {
      id: session.id,
      companyName: session.company_name || 'Untitled',
      persona: getPersonaLabel(session.persona),
      stage: session.deal_stage,
      createdAt: session.created_at,
      lastUpdated,
      bapScore,
      checkpoint1Passed: cp1Status.passed,
      checkpoint2Passed: cp2Status.passed,
      checkpoint3Passed: cp3Status.passed,
      healthStatus,
      selectedPains: session.selected_pains,
      currentATS: session.current_ats,
      budgetConfirmed: session.budget_confirmed,
      championIdentified: hasChampion,
      stakeholderCount: (session.stakeholders ?? []).filter(s => s.name.trim().length > 0).length,
      isStale,
      dealKillFlags,
      nextAction: session.next_action || null,
    };
  });
}

/**
 * Aggregate insights across all scored deals.
 */
export function getDealInsights(deals: DiscoveryDeal[]): DealInsights {
  const totalDeals = deals.length;
  const avgScore = totalDeals > 0 ? Math.round(deals.reduce((s, d) => s + d.bapScore, 0) / totalDeals) : 0;

  const healthBreakdown = { healthy: 0, at_risk: 0, critical: 0 };
  deals.forEach(d => healthBreakdown[d.healthStatus]++);

  // Top pains
  const painMap = new Map<string, number>();
  deals.forEach(d => {
    d.selectedPains.forEach(p => {
      painMap.set(p, (painMap.get(p) || 0) + 1);
    });
  });
  const topPains = Array.from(painMap.entries())
    .map(([painId, count]) => ({ painId, count }))
    .sort((a, b) => b.count - a.count);

  // Top competitors
  const atsMap = new Map<string, number>();
  deals.forEach(d => {
    if (d.currentATS) {
      atsMap.set(d.currentATS, (atsMap.get(d.currentATS) || 0) + 1);
    }
  });
  const topCompetitors = Array.from(atsMap.entries())
    .map(([ats, count]) => ({ ats, count }))
    .sort((a, b) => b.count - a.count);

  const staleDeals = deals.filter(d => d.isStale).length;
  const budgetConfirmedRate = totalDeals > 0 ? Math.round((deals.filter(d => d.budgetConfirmed).length / totalDeals) * 100) : 0;

  return {
    totalDeals,
    avgScore,
    healthBreakdown,
    topPains,
    topCompetitors,
    staleDeals,
    budgetConfirmedRate,
  };
}
