// ============================================================
// RoomReadinessScore — Pre-Share Readiness Checklist
// Shows a readiness score and checklist before AE shares the room.
// Prevents sharing half-baked rooms with prospects.
//
// UX Upgrade #2: Gate-keep sharing with actionable checklist.
// ============================================================

import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X, CheckCircle2, AlertTriangle, Circle,
  Copy, Mail, ExternalLink, Shield,
} from 'lucide-react';
import type { DiscoverySession } from '../../lib/discoveryDatabase';

// ── Readiness checks ──

interface ReadinessCheck {
  id: string;
  label: string;
  category: 'required' | 'recommended' | 'bonus';
  check: (session: DiscoverySession) => boolean;
  fixHint: string;
  /** Deal stages where this check is relevant. If omitted, applies to all stages. */
  stages?: string[];
}

const READINESS_CHECKS: ReadinessCheck[] = [
  // Required — always
  {
    id: 'company',
    label: 'Company name set',
    category: 'required',
    check: s => !!s.company_name?.trim(),
    fixHint: 'Add a company name',
  },
  {
    id: 'persona',
    label: 'Persona selected',
    category: 'required',
    check: s => !!s.persona && s.persona !== 'all',
    fixHint: 'Select the prospect\'s persona in Context',
  },
  {
    id: 'pains',
    label: 'Pain points identified',
    category: 'required',
    check: s => s.selected_pains?.length > 0,
    fixHint: 'Select at least one pain point',
  },
  // Recommended
  {
    id: 'ats',
    label: 'Current ATS identified',
    category: 'recommended',
    check: s => !!s.current_ats && s.current_ats !== 'None',
    fixHint: 'Set their current ATS for competitive positioning',
    stages: ['evaluating', 'negotiating', 'contracting', 'signing'],
  },
  {
    id: 'industry',
    label: 'Industry specified',
    category: 'recommended',
    check: s => !!s.industry && s.industry !== 'none',
    fixHint: 'Set industry for relevant case studies',
  },
  {
    id: 'callsheet-d1',
    label: 'D1 discovery questions started',
    category: 'recommended',
    check: s => {
      const answers = s.call_sheet_answers || {};
      const d1Keys = ['q1', 'q1b', 'q2', 'q3', 'q4a', 'q4b'];
      return d1Keys.some(k => {
        const ans = answers[k];
        return Array.isArray(ans) ? ans.length > 0 : !!ans;
      });
    },
    fixHint: 'Complete at least some D1 discovery questions',
  },
  {
    id: 'next-action',
    label: 'Next action defined',
    category: 'recommended',
    check: s => !!s.next_action?.trim(),
    fixHint: 'Set a next action for this deal',
  },
  // Bonus — stage-gated
  {
    id: 'roi',
    label: 'ROI calculator populated',
    category: 'bonus',
    check: s => s.roi_total > 0,
    fixHint: 'Configure ROI inputs to show prospect value',
    stages: ['negotiating', 'contracting', 'signing'],
  },
  {
    id: 'stakeholders',
    label: 'Stakeholders mapped',
    category: 'bonus',
    check: s => (s.stakeholders?.length ?? 0) > 0 && s.stakeholders!.some(st => st.name.trim().length > 0),
    fixHint: 'Add key stakeholders to the deal',
    stages: ['evaluating', 'negotiating', 'contracting', 'signing'],
  },
  {
    id: 'meeting',
    label: 'Next meeting scheduled',
    category: 'bonus',
    check: s => !!s.next_meeting_date,
    fixHint: 'Schedule the next meeting date',
  },
];

/** Filter checks to only those relevant for the current deal stage */
function getStageChecks(session: DiscoverySession): ReadinessCheck[] {
  const stage = session.deal_stage ?? 'qualifying';
  return READINESS_CHECKS.filter(c => !c.stages || c.stages.includes(stage));
}

// ── Props ──

interface RoomReadinessProps {
  open: boolean;
  onClose: () => void;
  session: DiscoverySession;
  shareUrl: string;
  onCopyLink: () => void;
}

// ── Component ──

export function RoomReadinessModal({ open, onClose, session, shareUrl, onCopyLink }: RoomReadinessProps) {
  const stageChecks = useMemo(() => getStageChecks(session), [session]);
  const results = useMemo(() => {
    return stageChecks.map(check => ({
      ...check,
      passed: check.check(session),
    }));
  }, [session, stageChecks]);

  const requiredPassed = results.filter(r => r.category === 'required' && r.passed).length;
  const requiredTotal = results.filter(r => r.category === 'required').length;
  const allRequiredPassed = requiredPassed === requiredTotal;

  const recommendedPassed = results.filter(r => r.category === 'recommended' && r.passed).length;
  const recommendedTotal = results.filter(r => r.category === 'recommended').length;

  const bonusPassed = results.filter(r => r.category === 'bonus' && r.passed).length;
  const bonusTotal = results.filter(r => r.category === 'bonus').length;

  const totalPassed = results.filter(r => r.passed).length;
  const totalChecks = results.length;
  const percentage = Math.round((totalPassed / totalChecks) * 100);

  const getColor = () => {
    if (percentage >= 80) return { main: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', bar: 'bg-emerald-500' };
    if (percentage >= 50) return { main: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', bar: 'bg-amber-500' };
    return { main: '#ef4444', bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-200', bar: 'bg-rose-500' };
  };

  const color = getColor();

  const handleCopyAndClose = () => {
    onCopyLink();
    onClose();
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Teamtailor Discovery Room — ${session.company_name}`);
    const body = encodeURIComponent(`Hi,\n\nI've prepared a personalized Discovery Room for ${session.company_name}. You can view it here:\n\n${shareUrl}\n\nLooking forward to our conversation!\n\nBest regards`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-[520px] max-w-[95vw] overflow-hidden"
          >
            {/* ── Header with score ── */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center`}>
                    <Shield size={18} className={color.text} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-900">Share Room — {session.company_name}</h2>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Readiness for {session.deal_stage === 'evaluating' ? 'Evaluating' : session.deal_stage === 'negotiating' ? 'Negotiating' : session.deal_stage === 'contracting' ? 'Contracting' : session.deal_stage === 'signing' ? 'Signing' : session.deal_stage === 'investigating' ? 'Investigating' : 'Qualifying'} stage · {results.length} checks
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Score bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2.5 rounded-full bg-stone-100 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${color.bar}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <span className={`text-sm font-bold tabular-nums ${color.text}`}>{percentage}%</span>
              </div>
            </div>

            {/* ── Checklist ── */}
            <div className="px-6 pb-4 space-y-4">
              {/* Required checks */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Required</span>
                  <span className={`text-[9px] font-bold tabular-nums ${allRequiredPassed ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {requiredPassed}/{requiredTotal}
                  </span>
                </div>
                <div className="space-y-1">
                  {results.filter(r => r.category === 'required').map(r => (
                    <CheckItem key={r.id} label={r.label} passed={r.passed} fixHint={r.fixHint} />
                  ))}
                </div>
              </div>

              {/* Recommended checks */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Recommended</span>
                  <span className="text-[9px] font-bold tabular-nums text-stone-400">{recommendedPassed}/{recommendedTotal}</span>
                </div>
                <div className="space-y-1">
                  {results.filter(r => r.category === 'recommended').map(r => (
                    <CheckItem key={r.id} label={r.label} passed={r.passed} fixHint={r.fixHint} />
                  ))}
                </div>
              </div>

              {/* Bonus checks */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Bonus</span>
                  <span className="text-[9px] font-bold tabular-nums text-stone-400">{bonusPassed}/{bonusTotal}</span>
                </div>
                <div className="space-y-1">
                  {results.filter(r => r.category === 'bonus').map(r => (
                    <CheckItem key={r.id} label={r.label} passed={r.passed} fixHint={r.fixHint} />
                  ))}
                </div>
              </div>
            </div>

            {/* ── Footer with actions ── */}
            <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/50">
              {!allRequiredPassed && (
                <div className="flex items-center gap-2 mb-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                  <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                  <p className="text-[11px] text-amber-700 font-medium">
                    Complete all required items for the best prospect experience
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  onClick={handleEmailShare}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-stone-500 hover:bg-stone-100 transition-colors"
                >
                  <Mail size={12} />
                  Email
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-stone-500 hover:bg-stone-100 transition-colors"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handleCopyAndClose}
                    className="flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 transition-all shadow-sm hover:shadow-md"
                  >
                    <Copy size={13} />
                    {allRequiredPassed ? 'Copy Link' : 'Copy Anyway'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Check Item ──

function CheckItem({ label, passed, fixHint }: { label: string; passed: boolean; fixHint: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 transition-colors hover:bg-stone-50">
      {passed ? (
        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
      ) : (
        <Circle size={14} className="text-stone-300 shrink-0" />
      )}
      <span className={`text-xs font-medium flex-1 ${passed ? 'text-stone-600' : 'text-stone-400'}`}>
        {label}
      </span>
      {!passed && (
        <span className="text-[10px] text-stone-400 italic">
          {fixHint}
        </span>
      )}
    </div>
  );
}
