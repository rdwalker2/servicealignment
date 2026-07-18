// ============================================================
// StagePriorityCard — Stage-Aware Progressive Disclosure
// Shows the AE exactly what they should do NOW based on deal stage.
//
// UX Upgrade #7: Reduces cognitive load by highlighting the
// 3-4 most important actions for the current stage.
// ============================================================

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Target, ClipboardList, Users, DollarSign,
  Lightbulb, Award, BookOpen, Shield,
  CheckCircle2, ChevronRight, Sparkles,
} from 'lucide-react';
import type { DiscoverySession } from '../../lib/discoveryDatabase';

// ── Priority action definition ──

interface PriorityAction {
  id: string;
  label: string;
  detail: string;
  icon: React.ElementType;
  isDone: (session: DiscoverySession) => boolean;
  stage: string[]; // Which stages this action is relevant for
  /** Returns a partial progress string like "4/6" if applicable */
  progress?: (session: DiscoverySession) => string | null;
}

const PRIORITY_ACTIONS: PriorityAction[] = [
  // ── D1: Discovery ──
  {
    id: 'select-persona',
    label: 'Select prospect persona',
    detail: 'Unlocks persona-specific call sheet & pain suggestions',
    icon: Users,
    isDone: s => !!s.persona && s.persona !== 'all',
    stage: ['discovery'],
  },
  {
    id: 'select-pains',
    label: 'Identify pain points',
    detail: 'Select at least 2 pains to personalize the room',
    icon: Target,
    isDone: s => (s.selected_pains?.length ?? 0) >= 2,
    stage: ['discovery'],
    progress: s => {
      const count = s.selected_pains?.length ?? 0;
      return count > 0 && count < 2 ? `${count}/2 identified` : null;
    },
  },
  {
    id: 'd1-questions',
    label: 'Complete D1 discovery questions',
    detail: 'Answer Q1-Q4 to understand the problem & impact',
    icon: ClipboardList,
    isDone: s => {
      const answers = s.call_sheet_answers || {};
      const d1Keys = ['q1', 'q1b', 'q2', 'q3', 'q4a', 'q4b'];
      const answered = d1Keys.filter(k => {
        const ans = answers[k];
        return Array.isArray(ans) ? ans.length > 0 : !!ans;
      }).length;
      return answered >= 4; // At least 4 of 6 D1 questions answered
    },
    stage: ['discovery'],
    progress: s => {
      const answers = s.call_sheet_answers || {};
      const d1Keys = ['q1', 'q1b', 'q2', 'q3', 'q4a', 'q4b'];
      const answered = d1Keys.filter(k => {
        const ans = answers[k];
        return Array.isArray(ans) ? ans.length > 0 : !!ans;
      }).length;
      return answered > 0 && answered < 4 ? `${answered}/6 answered` : null;
    },
  },
  {
    id: 'set-next-action',
    label: 'Define next action',
    detail: 'Always set the next step — never leave a deal without one',
    icon: ChevronRight,
    isDone: s => !!s.next_action?.trim(),
    stage: ['discovery', 'diagnosis', 'demonstrate', 'decision'],
  },

  // ── D2: Diagnosis ──
  {
    id: 'set-ats',
    label: 'Identify current ATS',
    detail: 'Unlocks competitive positioning & kill sheet',
    icon: Shield,
    isDone: s => !!s.current_ats && s.current_ats !== 'None',
    stage: ['diagnosis'],
  },
  {
    id: 'd2-questions',
    label: 'Complete D2 diagnosis questions',
    detail: 'Root cause, decision process & budget questions',
    icon: ClipboardList,
    isDone: s => {
      const answers = s.call_sheet_answers || {};
      const d2Keys = ['q5', 'q6', 'q6b', 'q7', 'q8', 'q8b', 'q8c'];
      const answered = d2Keys.filter(k => {
        const ans = answers[k];
        return Array.isArray(ans) ? ans.length > 0 : !!ans;
      }).length;
      return answered >= 4;
    },
    stage: ['diagnosis'],
    progress: s => {
      const answers = s.call_sheet_answers || {};
      const d2Keys = ['q5', 'q6', 'q6b', 'q7', 'q8', 'q8b', 'q8c'];
      const answered = d2Keys.filter(k => {
        const ans = answers[k];
        return Array.isArray(ans) ? ans.length > 0 : !!ans;
      }).length;
      return answered > 0 && answered < 4 ? `${answered}/7 answered` : null;
    },
  },
  {
    id: 'map-stakeholders',
    label: 'Map key stakeholders',
    detail: 'Name the decision maker, champion, and blocker',
    icon: Users,
    isDone: s => (s.stakeholders?.length ?? 0) > 0 && s.stakeholders!.some(st => st.name.trim().length > 0),
    stage: ['diagnosis'],
  },

  // ── D3: Demonstrate ──
  {
    id: 'configure-roi',
    label: 'Configure ROI calculator',
    detail: 'Show the prospect their specific cost savings',
    icon: DollarSign,
    isDone: s => s.roi_total > 0,
    stage: ['demonstrate'],
  },
  {
    id: 'd3-proof',
    label: 'Share relevant proof points',
    detail: 'Enable case studies matching their industry/size',
    icon: Award,
    isDone: s => (s.enabled_study_names?.length ?? 0) > 0,
    stage: ['demonstrate'],
  },
  {
    id: 'solution-clarity',
    label: 'Confirm solution clarity',
    detail: 'Can the champion explain how TT fixes their problem?',
    icon: Lightbulb,
    isDone: s => s.alignment_checks?.problems_solutions === true,
    stage: ['demonstrate'],
  },

  // ── D4: Decision ──
  {
    id: 'budget-confirmed',
    label: 'Confirm budget',
    detail: 'Budget allocated or business case approved?',
    icon: DollarSign,
    isDone: s => s.budget_confirmed === true,
    stage: ['decision'],
  },
  {
    id: 'timeline-set',
    label: 'Set implementation timeline',
    detail: 'When do they need to go live?',
    icon: BookOpen,
    isDone: s => !!s.implementation_timeline?.trim(),
    stage: ['decision'],
  },
  {
    id: 'roi-alignment',
    label: 'ROI alignment confirmed',
    detail: 'Is the ROI sufficient to justify the investment?',
    icon: Sparkles,
    isDone: s => s.alignment_checks?.roi_sufficient === true,
    stage: ['decision'],
  },
];

// ── Stage colors ──

const STAGE_COLORS: Record<string, { accent: string; bg: string; text: string; badge: string }> = {
  discovery: { accent: '#0ea5e9', bg: 'bg-sky-50', text: 'text-sky-700', badge: 'bg-sky-100 text-sky-600 border-sky-200' },
  diagnosis: { accent: '#8b5cf6', bg: 'bg-violet-50', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-600 border-violet-200' },
  demonstrate: { accent: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-600 border-amber-200' },
  decision: { accent: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
};

const STAGE_LABELS: Record<string, string> = {
  discovery: 'D1 · Discovery',
  diagnosis: 'D2 · Diagnosis',
  demonstrate: 'D3 · Demo',
  decision: 'D4 · Decision',
};

const NEXT_STAGE: Record<string, string> = {
  discovery: 'D2 · Diagnosis',
  diagnosis: 'D3 · Demo',
  demonstrate: 'D4 · Decision',
  decision: 'Closed Won 🎉',
};

// ── Component ──

interface StagePriorityCardProps {
  session: DiscoverySession;
}

export function StagePriorityCard({ session }: StagePriorityCardProps) {
  const stage = session.deal_stage || 'discovery';
  const colors = STAGE_COLORS[stage] || STAGE_COLORS.discovery;

  // Calculate days in current stage
  const daysInStage = useMemo(() => {
    const created = new Date(session.created_at).getTime();
    return Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
  }, [session.created_at]);

  const actions = useMemo(() => {
    return PRIORITY_ACTIONS
      .filter(a => a.stage.includes(stage))
      .map(a => ({
        ...a,
        done: a.isDone(session),
        partialProgress: a.progress?.(session) ?? null,
      }));
  }, [session, stage]);

  const doneCount = actions.filter(a => a.done).length;
  const totalCount = actions.length;
  const allDone = doneCount === totalCount;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const isOverdue = daysInStage > 7 && !allDone;

  return (
    <div className="border-b border-zinc-100">
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ backgroundColor: colors.accent }}
            >
              <Sparkles size={10} className="text-white" />
            </div>
            <span className="text-[11px] font-bold text-zinc-700">Priority Actions</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold ${colors.badge}`}>
              {STAGE_LABELS[stage]}
            </span>
            {allDone ? (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-500">
                <CheckCircle2 size={9} />
                Done
              </span>
            ) : (
              <span className="text-[9px] font-bold text-zinc-400 tabular-nums">{doneCount}/{totalCount}</span>
            )}
          </div>
        </div>

        {/* Overdue warning */}
        {isOverdue && (
          <div className="flex items-center gap-1.5 mb-2 rounded-md bg-amber-50 border border-amber-200 px-2.5 py-1.5">
            <span className="text-amber-500 text-[10px]">⚡</span>
            <span className="text-[10px] font-semibold text-amber-700">
              {daysInStage} days in {STAGE_LABELS[stage]} — {totalCount - doneCount} action{totalCount - doneCount > 1 ? 's' : ''} remaining
            </span>
          </div>
        )}

        {/* Progress bar */}
        <div className="h-1 rounded-full bg-zinc-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: colors.accent }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      {/* Action list — show incomplete first, then completed */}
      <div className="px-4 pb-3 space-y-0.5">
        {actions
          .sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1))
          .map(action => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                className={`flex items-start gap-2.5 rounded-lg px-2 py-1.5 transition-all ${
                  action.done ? 'opacity-50' : 'hover:bg-zinc-50'
                }`}
              >
                {action.done ? (
                  <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                ) : (
                  <div
                    className="w-[13px] h-[13px] rounded-full border-2 mt-0.5 shrink-0"
                    style={{ borderColor: colors.accent }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <span className={`text-[11px] font-semibold block ${action.done ? 'text-zinc-400 line-through' : 'text-zinc-700'}`}>
                    {action.label}
                  </span>
                  {!action.done && (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-zinc-400">
                        {action.detail}
                      </span>
                      {action.partialProgress && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: colors.accent + '15', color: colors.accent }}>
                          {action.partialProgress}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        {/* Ready to advance CTA */}
        {allDone && stage !== 'decision' && (
          <div className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 border border-dashed" style={{ borderColor: colors.accent + '40', backgroundColor: colors.accent + '08' }}>
            <CheckCircle2 size={12} style={{ color: colors.accent }} />
            <span className="text-[10px] font-bold" style={{ color: colors.accent }}>
              Ready to advance → {NEXT_STAGE[stage]}
            </span>
          </div>
        )}
        {allDone && stage === 'decision' && (
          <div className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 bg-emerald-50 border border-emerald-200">
            <span className="text-sm">🎉</span>
            <span className="text-[10px] font-bold text-emerald-700">
              All checkpoints passed — close this deal!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

