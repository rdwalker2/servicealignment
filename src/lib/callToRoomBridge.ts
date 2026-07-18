// ============================================================
// callToRoomBridge.ts — Auto-Bridge from Call Companion → Room
// Transforms call_sheet_answers and BAP data into room-facing
// content. This is the "glue" that eliminates double-entry.
// ============================================================

import type { DiscoverySession } from '../../lib/discoveryDatabase';
import { TT_PAINS } from '../components/discovery/PainDiscoveryModule';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface BridgeResult {
  /** Fields to auto-merge into the session (non-destructive — only fills blanks) */
  sessionUpdates: Partial<DiscoverySession>;
  /** Count of fields that were auto-populated */
  fieldsPopulated: number;
  /** Human-readable summary of what was bridged */
  summary: string[];
}

/* ------------------------------------------------------------------ */
/*  Pain → Feature Mapping (for room sections)                         */
/* ------------------------------------------------------------------ */

const PAIN_TO_DEMO_AREA: Record<string, string[]> = {
  'slow-time-to-fill': ['hiring', 'ai'],
  'poor-career-site': ['brand'],
  'agency-dependency': ['candidate', 'brand'],
  'candidate-experience': ['candidate'],
  'employer-brand': ['brand'],
  'data-reporting': ['analytics'],
  'collaboration': ['manager'],
  'compliance-risk': ['hiring', 'programs'],
  'tech-fragmentation': ['hiring', 'programs'],
  'high-volume': ['ai', 'hiring'],
  'recruiter-burnout': ['ai', 'hiring'],
  'diversity': ['programs', 'hiring'],
  'internal-mobility': ['programs'],
  'onboarding-gaps': ['programs'],
  'referral-program': ['candidate'],
};

/* ------------------------------------------------------------------ */
/*  Core Bridge Function                                               */
/* ------------------------------------------------------------------ */

/**
 * Given a session with call_sheet_answers, compute what room fields
 * should be auto-populated. Returns updates that should be merged
 * into the session (only fills blank fields — never overwrites).
 */
export function computeBridge(session: DiscoverySession): BridgeResult {
  const cs = session.call_sheet_answers || {};
  const updates: Partial<DiscoverySession> = {};
  const summary: string[] = [];
  let fieldsPopulated = 0;

  // ── 1. Pain Narrative (MEDDPICC "I") ──
  // Auto-compose from selected pains + q1 answer + q1b severity
  if (!session.pain_narrative && session.selected_pains.length > 0) {
    const painTitles = session.selected_pains
      .map(id => TT_PAINS.find(p => p.id === id)?.title)
      .filter(Boolean);
    const q1Answer = typeof cs.q1 === 'string' ? cs.q1 : '';
    const severity = typeof cs.q1b === 'string' ? cs.q1b : '';

    let narrative = `Key challenges: ${painTitles.join(', ')}.`;
    if (q1Answer) narrative += ` ${q1Answer}`;
    if (severity && parseInt(severity) >= 7) narrative += ` (Severity: ${severity}/10)`;

    updates.pain_narrative = narrative;
    summary.push('Pain narrative auto-composed from selected pains');
    fieldsPopulated++;
  }

  // ── 2. Diagnosis Overrides (Room "Root Cause" section) ──
  // Q5 → current approach, Q6 → root cause, Q6b → acknowledgment
  if (!session.diagnosis_current_approach_override) {
    const q5 = typeof cs.q5 === 'string' ? cs.q5.trim() : '';
    if (q5) {
      updates.diagnosis_current_approach_override = q5;
      summary.push('Current approach auto-filled from D2 discovery');
      fieldsPopulated++;
    }
  }

  if (!session.diagnosis_root_cause_override) {
    const q6 = cs.q6;
    if (q6) {
      const rootCauseText = Array.isArray(q6)
        ? q6.join('; ')
        : typeof q6 === 'string' ? q6 : '';
      if (rootCauseText) {
        updates.diagnosis_root_cause_override = rootCauseText;
        summary.push('Root cause auto-filled from D2 diagnosis');
        fieldsPopulated++;
      }
    }
  }

  // ── 3. Competitive Situation (MEDDPICC "C") ──
  if (!session.competitive_situation && session.current_ats) {
    const q7 = typeof cs.q7 === 'string' ? cs.q7.trim() : '';
    let compSit = `Currently using: ${session.current_ats}`;
    if (q7) compSit += `. ${q7}`;
    updates.competitive_situation = compSit;
    summary.push('Competitive situation auto-filled from Provider + D2 answers');
    fieldsPopulated++;
  }

  // ── 4. Success Metrics (MEDDPICC "M") ──
  if (!session.success_metrics_text) {
    const q11 = cs.q11;
    if (q11) {
      const metricsText = Array.isArray(q11) ? q11.join('; ') : typeof q11 === 'string' ? q11 : '';
      if (metricsText) {
        updates.success_metrics_text = metricsText;
        summary.push('Success metrics auto-filled from D3 answers');
        fieldsPopulated++;
      }
    }
  }

  // ── 5. Decision Criteria (MEDDPICC "D") ──
  if (!session.decision_criteria) {
    const q8 = cs.q8;
    if (q8) {
      const criteriaText = Array.isArray(q8) ? q8.join(', ') : typeof q8 === 'string' ? q8 : '';
      if (criteriaText) {
        updates.decision_criteria = criteriaText;
        summary.push('Decision criteria auto-filled from D2 readiness');
        fieldsPopulated++;
      }
    }
  }

  // ── 6. Budget from Call Sheet ──
  if (!session.budget_confirmed) {
    const q8b = typeof cs.q8b === 'string' ? cs.q8b.trim().toLowerCase() : '';
    const q8c = typeof cs.q8c === 'string' ? parseInt(cs.q8c) : NaN;
    if (q8b.includes('yes') || q8b.includes('allocated') || (!isNaN(q8c) && q8c <= 3)) {
      updates.budget_confirmed = true;
      summary.push('Budget confirmed from D2 readiness answers');
      fieldsPopulated++;
    }
  }

  // ── 7. Timeline ──
  if (!session.implementation_timeline) {
    const targetDate = session.call_sheet_target_date;
    if (targetDate) {
      updates.implementation_timeline = targetDate;
      summary.push('Implementation timeline auto-filled from target date');
      fieldsPopulated++;
    }
  }

  // ── 8. Cost of Indecision → CoI config ──
  if (!session.coi_config?.enabled) {
    const costOfProblem = session.call_sheet_cost_of_problem;
    if (costOfProblem && costOfProblem.trim()) {
      // Don't auto-enable CoI, but capture the text into pain_narrative
      if (updates.pain_narrative) {
        updates.pain_narrative += ` Cost of inaction: ${costOfProblem}`;
      }
      summary.push('Cost of problem captured for narrative');
      fieldsPopulated++;
    }
  }

  // ── 9. Demo Area Auto-Selection (from pains) ──
  if (!session.overridden_pillars || session.overridden_pillars.length === 0) {
    const autoAreas = new Set<string>();
    for (const painId of session.selected_pains) {
      const areas = PAIN_TO_DEMO_AREA[painId];
      if (areas) areas.forEach(a => autoAreas.add(a));
    }
    if (autoAreas.size > 0) {
      updates.overridden_pillars = Array.from(autoAreas);
      summary.push(`Demo areas auto-selected from pains: ${Array.from(autoAreas).join(', ')}`);
      fieldsPopulated++;
    }
  }

  // ── 10. Champion from stakeholder data ──
  if (!session.champion_name) {
    const champion = session.stakeholders?.find(s =>
      /champion|advocate/i.test(s.role ?? '')
    );
    if (champion && champion.name) {
      updates.champion_name = champion.name;
      if (champion.title) {
        updates.champion_validation_notes = `Title: ${champion.title}`;
      }
      summary.push(`Champion auto-identified: ${champion.name}`);
      fieldsPopulated++;
    }
  }

  return { sessionUpdates: updates, fieldsPopulated, summary };
}

/* ------------------------------------------------------------------ */
/*  Apply Bridge (merge updates into session, non-destructive)         */
/* ------------------------------------------------------------------ */

/**
 * Applies bridge results to a session. Only fills blank fields.
 * Returns the updated session.
 */
export function applyBridge(session: DiscoverySession, result: BridgeResult): DiscoverySession {
  if (result.fieldsPopulated === 0) return session;

  return {
    ...session,
    ...result.sessionUpdates,
  };
}

/* ------------------------------------------------------------------ */
/*  Quick Check: How many fields COULD be auto-filled?                 */
/* ------------------------------------------------------------------ */

export function countBridgeableFields(session: DiscoverySession): {
  total: number;
  filled: number;
  available: number;
} {
  const result = computeBridge(session);
  const filled = Object.keys(result.sessionUpdates).length;
  return {
    total: 10, // Total possible bridge fields
    filled,
    available: result.fieldsPopulated,
  };
}
