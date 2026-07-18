// ============================================================
// pipelineUtils.ts — Shared utilities, types, and constants
// for the Pipeline Board components.
// ============================================================

import React from 'react';
import { CheckCircle2, X, Phone, Mail, MessageSquare, Ban } from 'lucide-react';
import type { DiscoverySession } from '../../lib/discoveryDatabase';

// ── Types ──

export interface PipelineBoardProps {
  sessions: DiscoverySession[];
  repId: string;  // Current rep ID for creating new prospects
  onSelect: (s: DiscoverySession) => void;
  onStageChange: (sessionId: string, newStage: string) => void;
  onOverride: (sessionId: string, checkpointNum: number, reason: string) => void;
  onSessionUpdate: (session: DiscoverySession) => void;
}

export interface StageConfig {
  key: string;
  label: string;
  short: string;
  color: string;
  checkpoint: number | null; // checkpoint to pass to LEAVE this stage
  checkpointLabel: string;
}

export interface PacingMetric {
  label: string;
  icon: React.ReactNode;
  actual: number;
  target: number;
  isCurrency?: boolean;
}

// ── Constants ──

export const STAGES: StageConfig[] = [
  { key: 'qualifying',     label: 'Qualifying',     short: 'D1', color: '#64748b', checkpoint: null, checkpointLabel: '' },
  { key: 'investigating',  label: 'Investigating',  short: 'D1', color: '#0ea5e9', checkpoint: 1, checkpointLabel: 'CP1: Urgency Test' },
  { key: 'evaluating',     label: 'Evaluating',     short: 'D2', color: '#8b5cf6', checkpoint: 2, checkpointLabel: 'CP2: Gap Test' },
  { key: 'negotiating',    label: 'Negotiating',    short: 'D3', color: '#f59e0b', checkpoint: null, checkpointLabel: '' },
  { key: 'contracting',    label: 'Contracting',    short: 'D3', color: '#f97316', checkpoint: 3, checkpointLabel: 'CP3: Solution Fit' },
  { key: 'signing',        label: 'Signing',        short: 'D4', color: '#10b981', checkpoint: null, checkpointLabel: '' },
];

export const END_STAGES = [
  { key: 'closed_won', label: 'Won', color: '#10b981', icon: React.createElement(CheckCircle2, { size: 16, className: 'text-emerald-500 mx-auto mb-1' }) },
  { key: 'closed_lost', label: 'Lost', color: '#ef4444', icon: React.createElement(X, { size: 16, className: 'text-red-500 mx-auto mb-1' }) },
  { key: 'disqualified', label: 'DQ', color: '#78716c', icon: React.createElement(Ban, { size: 16, className: 'text-stone-500 mx-auto mb-1' }) },
];

export const MAX_CP_SCORE = 10;
export const CP_PASS_THRESHOLD = 7.5;

export const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  phone: React.createElement(Phone, { size: 12 }),
  email: React.createElement(Mail, { size: 12 }),
  linkedin: React.createElement(MessageSquare, { size: 12 }),
};

export const CHANNEL_COLORS: Record<string, string> = {
  phone: 'text-stone-500 bg-stone-50 border border-stone-200',
  email: 'text-stone-500 bg-stone-50 border border-stone-200',
  linkedin: 'text-stone-500 bg-stone-50 border border-stone-200',
};

// ── Utility Functions ──

export function daysInStage(session: DiscoverySession): number {
  const created = new Date(session.created_at).getTime();
  const diff = Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
  return diff < 0 ? 0 : diff;
}

export function daysColor(days: number): string {
  if (days <= 7) return 'text-emerald-600 bg-emerald-50';
  if (days <= 14) return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
}

/** Get the practical milestone badge for a deal based on its stage + milestones */
export function getMilestoneBadge(session: DiscoverySession): { label: string; color: string } | null {
  const stage = session.deal_stage || 'qualifying';
  const m = session.milestones;

  if (stage === 'qualifying') {
    return { label: '📅 Qualifying', color: 'bg-stone-50 text-stone-500' };
  }
  if (stage === 'investigating') {
    if (m?.discovery_held?.date) return { label: '✅ Disco Held', color: 'bg-sky-100 text-sky-700' };
    return { label: '📅 Disco Set', color: 'bg-sky-50 text-sky-500' };
  }
  if (stage === 'evaluating') {
    return null; // No sub-milestone for evaluating
  }
  if (stage === 'negotiating') {
    if (m?.demo_held?.date) return { label: '🎯 Demo Held', color: 'bg-amber-100 text-amber-700' };
    return { label: '📅 Demo Scheduled', color: 'bg-amber-50 text-amber-500' };
  }
  if (stage === 'contracting') {
    if (m?.proposal_sent?.date) return { label: '📄 Proposal Sent', color: 'bg-orange-100 text-orange-700' };
    return { label: '📝 Contracting', color: 'bg-orange-50 text-orange-500' };
  }
  if (stage === 'signing') {
    return { label: '🤝 Signing', color: 'bg-emerald-50 text-emerald-500' };
  }
  return null;
}

export function relativeTime(dateStr: string | undefined): string {
  if (!dateStr) return 'No touch';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return '1d ago';
  return `${days}d ago`;
}
