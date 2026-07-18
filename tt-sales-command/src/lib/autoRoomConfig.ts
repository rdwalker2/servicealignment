// ============================================================
// Auto Room Config — Smart section visibility from session state
// Pure computation: no side effects, no localStorage access
// ============================================================

import type { DiscoverySession } from './discoveryDatabase';
import { STAGE_SECTION_MAP, type RoomVisibility } from '../components/discovery/RoomSections';

// ── Types ──

export interface AutoRoomResult {
  visibility: Record<string, boolean>;
  configUpdates: Partial<DiscoverySession>;
  reasoning: string[];  // human-readable explanations of what was configured
}

// ── Section keys (the 14 togglable sections) ──

const ALL_SECTIONS: (keyof RoomVisibility)[] = [
  'hero', 'pains', 'problemCanvas', 'diagnosis', 'competitive',
  'socialProof', 'paradigmShift', 'solution', 'playbooks', 'roi',
  'contractSecurity', 'map', 'minimumStandards', 'proposal',
];

// ── Helpers ──

/** Parse a comma-separated competitors string into individual names */
function parseCompetitors(raw: string): string[] {
  if (!raw || !raw.trim()) return [];
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

/** Format a number as a compact display string (e.g. 45, 120) */
function formatCount(n: number): string {
  return n.toLocaleString();
}

// ── Core computation ──

export function computeAutoRoomConfig(session: DiscoverySession): AutoRoomResult {
  const reasoning: string[] = [];
  const configUpdates: Partial<DiscoverySession> = {};

  // 1. Start with stage-based defaults
  const stage = session.deal_stage || 'qualifying';
  const stageDefaults = STAGE_SECTION_MAP[stage] ?? STAGE_SECTION_MAP.qualifying;
  const visibility: Record<string, boolean> = { ...stageDefaults };

  reasoning.push(`Base visibility set for "${stage}" stage`);

  // 2. Smart overrides — data-driven section activation

  // Competitors: enable competitive section if competitors are identified (even in D1)
  const competitors = parseCompetitors(session.competitors_identified);
  if (competitors.length > 0) {
    visibility.competitive = true;
    reasoning.push(
      `Competitive section enabled — ${competitors.join(' and ')} detected from discovery`
    );
  } else if (!stageDefaults.competitive) {
    reasoning.push('Competitive section hidden — no competitors identified yet');
  }

  // ROI: enable if roi_inputs has totalHires populated
  if (session.roi_inputs?.totalHires > 0) {
    visibility.roi = true;
    reasoning.push(
      `ROI section enabled — ${formatCount(session.roi_inputs.totalHires)} annual hires captured from call sheet`
    );
  } else if (!stageDefaults.roi) {
    reasoning.push('ROI section hidden — no hiring volume data captured yet');
  }

  // MAP: enable if mutual_action_plan has milestones
  if (session.mutual_action_plan && session.mutual_action_plan.length > 0) {
    visibility.map = true;
    reasoning.push(
      `MAP section enabled — ${session.mutual_action_plan.length} milestone${session.mutual_action_plan.length === 1 ? '' : 's'} configured`
    );
  } else if (!stageDefaults.map) {
    reasoning.push('MAP section hidden — no milestones configured yet');
  }

  // Pains: enable if selected_pains has entries
  if (session.selected_pains && session.selected_pains.length > 0) {
    visibility.pains = true;
    reasoning.push(
      `Pains section enabled — ${session.selected_pains.length} priorit${session.selected_pains.length === 1 ? 'y' : 'ies'} identified`
    );
  } else {
    reasoning.push('Pains section hidden — no priorities selected yet');
  }

  // Proposal: enable if pricing is configured
  if (session.pricing_base_price > 0) {
    visibility.proposal = true;
    reasoning.push(
      `Proposal section enabled — pricing configured at $${formatCount(session.pricing_base_price)}/yr`
    );
  } else if (!stageDefaults.proposal) {
    reasoning.push('Proposal section hidden — no pricing configured yet');
  }

  // 3. Config updates — auto-set session fields from available data

  // Auto-compute competitors_count from competitors_identified if not already set
  if (competitors.length > 0 && (!session.competitors_count || session.competitors_count === 0)) {
    configUpdates.competitors_count = competitors.length;
    reasoning.push(
      `Auto-set competitors_count to ${competitors.length} from identified competitors`
    );
  }

  // Auto-set sentiment_score from call sheet checkpoint data if available and not already captured
  if (
    (!session.sentiment_score || session.sentiment_score === 0) &&
    session.call_sheet_checkpoints &&
    Object.keys(session.call_sheet_checkpoints).length > 0
  ) {
    // Derive a basic sentiment from checkpoint pass rate:
    // each passed checkpoint contributes ~1.67 toward a 5-point scale
    const checkpoints = Object.values(session.call_sheet_checkpoints);
    const passedCount = checkpoints.filter(Boolean).length;
    if (passedCount > 0) {
      const derived = Math.min(5, Math.round((passedCount / Math.max(checkpoints.length, 1)) * 5));
      configUpdates.sentiment_score = derived;
      reasoning.push(
        `Auto-set sentiment_score to ${derived}/5 from call sheet checkpoints (${passedCount}/${checkpoints.length} passed)`
      );
    }
  }

  return { visibility, configUpdates, reasoning };
}

// ── Convenience helper ──

/**
 * Calls computeAutoRoomConfig and returns a single Partial<DiscoverySession>
 * ready to merge (spread) onto the existing session.
 * Merges room_visibility + any configUpdates into one object.
 */
export function applyAutoRoomConfig(session: DiscoverySession): Partial<DiscoverySession> {
  const { visibility, configUpdates } = computeAutoRoomConfig(session);

  return {
    ...configUpdates,
    room_visibility: visibility,
  };
}
