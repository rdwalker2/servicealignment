// ============================================================
// QuickEditPanel.tsx — Inline deal editing drawer
// ============================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, ArrowRight, ExternalLink,
} from 'lucide-react';
import type { DiscoverySession } from '../../lib/discoveryDatabase';
import { computeBAPAnswers, getCheckpointScore } from '../../lib/discoveryDatabase';
import { computeMethodologyScore } from '../../lib/methodologyScore';
import { STAGES, MAX_CP_SCORE, CP_PASS_THRESHOLD } from './pipelineUtils';
import { DealTimeline } from './DealTimeline';

// ── Inline Quick-Edit Panel ──

export function QuickEditPanel({
  session,
  onSelect,
  onStageChange,
  onOverride,
  onSessionUpdate,
}: {
  session: DiscoverySession;
  onSelect: () => void;
  onStageChange: (sessionId: string, newStage: string) => void;
  onOverride: (sessionId: string, checkpointNum: number, reason: string) => void;
  onSessionUpdate: (session: DiscoverySession) => void;
}) {
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverrideInput, setShowOverrideInput] = useState(false);

  const stage = session.deal_stage || 'qualifying';
  const stageConfig = STAGES.find(s => s.key === stage);
  const stageIdx = STAGES.findIndex(s => s.key === stage);
  const nextStage = stageIdx < STAGES.length - 1 ? STAGES[stageIdx + 1] : null;

  // Checkpoint data
  const bapAnswers = computeBAPAnswers(session);
  const cpNum = stageConfig?.checkpoint ?? null;
  const cpScore = cpNum ? getCheckpointScore(bapAnswers, cpNum) : 0;
  const overrides = session.call_sheet_checkpoints || {};
  const isOverridden = cpNum ? !!overrides[`checkpoint${cpNum}`] : false;
  const isPassed = cpScore >= CP_PASS_THRESHOLD || isOverridden;

  // Methodology score for coaching
  const methScore = computeMethodologyScore(session);

  const handleQuickEdit = (field: string, value: any) => {
    const updated = { ...session, [field]: value };
    onSessionUpdate(updated);
  };

  const handleAdvance = () => {
    if (!nextStage) return;
    if (isPassed) {
      onStageChange(session.id, nextStage.key);
    }
  };

  const handleOverrideSubmit = () => {
    if (!cpNum || !overrideReason.trim() || !nextStage) return;
    onOverride(session.id, cpNum, overrideReason.trim());
    onStageChange(session.id, nextStage.key);
    setOverrideReason('');
    setShowOverrideInput(false);
  };

  const stakeholderCount = session.stakeholders?.length || 0;
  const objectionCount = session.objections?.length || 0;
  const openObjections = session.objections?.filter(o => o.status !== 'resolved').length || 0;

  return (
    <div className="px-5 py-4 space-y-4">
      {/* ── Stage Progression ── */}
      {(() => {
        const practicalSteps = [
          { key: 'disco_set', label: 'Disco Set', check: () => !!session.deal_stage },
          { key: 'disco_held', label: 'Disco Held', check: () => !!session.milestones?.discovery_held?.date },
          { key: 'demo_set', label: 'Demo Set', check: () => {
            const stage = session.deal_stage || '';
            return ['negotiating', 'contracting', 'signing', 'closed_won'].includes(stage) || !!session.milestones?.demo_held?.date;
          }},
          { key: 'demo_held', label: 'Demo Held', check: () => !!session.milestones?.demo_held?.date },
          { key: 'proposal', label: 'Proposal', check: () => !!session.milestones?.proposal_sent?.date },
          { key: 'closed', label: 'Closed', check: () => session.deal_stage === 'closed_won' },
        ];

        // Find the current step (last completed or first incomplete)
        let currentIdx = 0;
        for (let i = 0; i < practicalSteps.length; i++) {
          if (practicalSteps[i].check()) currentIdx = i;
          else break;
        }

        return (
          <div className="flex items-center gap-0">
            {practicalSteps.map((step, i) => {
              const completed = step.check();
              const isCurrent = i === currentIdx;
              return (
                <React.Fragment key={step.key}>
                  {i > 0 && (
                    <div className={`flex-1 h-0.5 ${completed ? 'bg-emerald-400' : 'bg-stone-200'}`} />
                  )}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold transition-all ${
                      completed ? 'bg-emerald-500 text-white' :
                      isCurrent ? 'bg-blue-500 text-white ring-2 ring-blue-200' :
                      'bg-stone-200 text-stone-400'
                    }`}>
                      {completed ? '✓' : i + 1}
                    </div>
                    <span className={`text-[8px] font-bold whitespace-nowrap ${
                      completed ? 'text-emerald-600' :
                      isCurrent ? 'text-blue-600' :
                      'text-stone-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        );
      })()}

      {/* ── SECTION 1: Quick Intel ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Deal Value */}
        <div>
          <label className="text-[10px] font-bold text-stone-400 block mb-1">💰 Deal Value</label>
          <div className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[12px] text-stone-700 flex items-center justify-between">
            <span className="font-bold tabular-nums">
              {session.deal_value ? `$${session.deal_value.toLocaleString()}` : '$0'}
            </span>
            <span className="text-[9px] text-stone-400">from pricing builder</span>
          </div>
        </div>

        {/* Champion */}
        <div>
          <label className="text-[10px] font-bold text-stone-400 block mb-1">👤 Champion</label>
          <input
            type="text"
            defaultValue={session.champion_name || ''}
            onBlur={(e) => handleQuickEdit('champion_name', e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Not identified"
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[12px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Intel badges row */}
      <div className="flex items-center gap-2 flex-wrap">
        {session.current_ats && (
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
            🏢 {session.current_ats}
          </span>
        )}
        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${
          stakeholderCount >= 3 ? 'bg-emerald-50 text-emerald-600' :
          stakeholderCount >= 1 ? 'bg-amber-50 text-amber-600' :
          'bg-red-50 text-red-500'
        }`}>
          👥 {stakeholderCount} stakeholder{stakeholderCount !== 1 ? 's' : ''}
        </span>
        {objectionCount > 0 && (
          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${
            openObjections > 0 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
          }`}>
            ⚠ {openObjections} open / {objectionCount} objection{objectionCount !== 1 ? 's' : ''}
          </span>
        )}
        {session.competitors_identified && (
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-orange-50 text-orange-600">
            ⚔ {session.competitors_identified}
          </span>
        )}
      </div>

      {/* ── Deal Timeline (Milestones + Meetings merged) ── */}
      <DealTimeline session={session} onSessionUpdate={handleQuickEdit} />

      {/* Checkpoint Progress (kept compact) */}
      {cpNum && stageConfig && (
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] font-bold text-stone-400">
              {stageConfig.checkpointLabel.split(':')[0]}
            </span>
            <span className={`text-[9px] font-bold tabular-nums ${isPassed ? 'text-emerald-600' : 'text-amber-600'}`}>
              {isPassed ? '✅ Passed' : `${cpScore}/${MAX_CP_SCORE}`}
            </span>
          </div>
          {!isPassed && (
            <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(cpScore / MAX_CP_SCORE) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full rounded-full bg-amber-500"
              />
            </div>
          )}
        </div>
      )}

      {/* Methodology — grade only */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-stone-400">Methodology</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
          methScore.grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
          methScore.grade === 'B' ? 'bg-blue-100 text-blue-700' :
          methScore.grade === 'C' ? 'bg-amber-100 text-amber-700' :
          'bg-red-100 text-red-700'
        }`}>
          {methScore.grade} — {methScore.totalScore}/100
        </span>
      </div>

      {/* ── SECTION 3: Actions ── */}
      {/* Gut Feel */}
      <div>
        <label className="text-[10px] font-bold text-stone-400 mb-1.5 block">Gut Feel</label>
        <div className="flex items-center gap-1.5">
          {([
            { value: 'strong', color: 'bg-emerald-500', label: 'Strong', activeBg: 'bg-emerald-50 border border-emerald-300' },
            { value: 'mixed', color: 'bg-amber-500', label: 'Mixed', activeBg: 'bg-amber-50 border border-amber-300' },
            { value: 'weak', color: 'bg-red-500', label: 'Weak', activeBg: 'bg-red-50 border border-red-300' },
          ] as const).map(opt => (
            <button
              key={opt.value}
              onClick={(e) => {
                e.stopPropagation();
                handleQuickEdit('gut_feel', opt.value);
              }}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${
                session.gut_feel === opt.value
                  ? opt.activeBg
                  : 'bg-stone-50 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${opt.color}`} />
              <span className="text-[11px] font-bold text-stone-600">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Next Action — structured picklist */}
      <div>
        <label className="text-[10px] font-bold text-stone-400 mb-1.5 block">What needs to happen next?</label>
        <div className="flex flex-wrap gap-1.5">
          {([
            { value: 'send_followup', label: 'Send follow-up' },
            { value: 'schedule_meeting', label: 'Schedule meeting' },
            { value: 'send_proposal', label: 'Send proposal' },
            { value: 'get_intro', label: 'Get intro' },
            { value: 'make_call', label: 'Make call' },
            { value: 'waiting_prospect', label: 'Waiting on prospect' },
            { value: 'internal_review', label: 'Internal review' },
          ] as const).map(opt => (
            <button
              key={opt.value}
              onClick={(e) => { e.stopPropagation(); handleQuickEdit('next_action', opt.value); }}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${
                session.next_action === opt.value
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <ArrowRight size={10} className={session.next_action === opt.value ? 'text-stone-300' : 'text-stone-400'} />
              <span className="text-[11px] font-bold">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Inline Override */}
      {cpNum && !isPassed && showOverrideInput && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5">
          <p className="text-[10px] font-bold text-amber-800 mb-1.5">⚡ Override reason</p>
          <input
            value={overrideReason}
            onChange={e => setOverrideReason(e.target.value)}
            onClick={e => e.stopPropagation()}
            placeholder="e.g., Champion confirmed verbally…"
            className="w-full rounded-md border border-amber-200 bg-white px-2.5 py-1.5 text-[10px] text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none mb-1.5"
            autoFocus
          />
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); handleOverrideSubmit(); }}
              disabled={!overrideReason.trim()}
              className="flex-1 flex items-center justify-center gap-1 rounded-md bg-amber-500 text-white py-1.5 text-[10px] font-bold hover:bg-amber-600 transition-colors disabled:opacity-40"
            >
              <Zap size={10} /> Override & Advance
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowOverrideInput(false); setOverrideReason(''); }}
              className="px-2.5 py-1.5 rounded-md text-[10px] font-semibold text-stone-500 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 pt-0.5">
        {nextStage && (
          isPassed ? (
            <button
              onClick={(e) => { e.stopPropagation(); handleAdvance(); }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-white py-2 text-[10px] font-bold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <ArrowRight size={11} />
              Advance to {nextStage.short}
            </button>
          ) : cpNum ? (
            !showOverrideInput && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowOverrideInput(true); }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 text-white py-2 text-[10px] font-bold hover:bg-amber-600 transition-colors shadow-sm"
              >
                <Zap size={11} />
                Override
              </button>
            )
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); handleAdvance(); }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-white py-2 text-[10px] font-bold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <ArrowRight size={11} />
              Advance to {nextStage.short}
            </button>
          )
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white text-stone-700 py-2 text-[10px] font-bold hover:bg-stone-50 transition-colors shadow-sm"
        >
          <ExternalLink size={11} />
          Open Room
        </button>
      </div>
    </div>
  );
}
