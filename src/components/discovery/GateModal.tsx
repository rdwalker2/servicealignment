// ============================================================
// GateModal.tsx — Checkpoint gate modal with scoring and overrides
// ============================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import type { DiscoverySession } from '../../lib/discoveryDatabase';
import type { StageConfig } from './pipelineUtils';
import { CP_PASS_THRESHOLD } from './pipelineUtils';

// ── Gate Modal ──

export function GateModal({
  checkpoint,
  score,
  maxScore,
  isPassed,
  isOverridden,
  companyName,
  targetStage,
  fromStageKey,
  toStageKey,
  session,
  onConfirm,
  onOverride,
  onCancel,
  onSessionUpdate,
}: {
  checkpoint: StageConfig;
  score: number;
  maxScore: number;
  isPassed: boolean;
  isOverridden: boolean;
  companyName: string;
  targetStage: string;
  fromStageKey: string;
  toStageKey: string;
  session: DiscoverySession;
  onConfirm: () => void;
  onOverride: (reason: string) => void;
  onCancel: () => void;
  onSessionUpdate: (session: DiscoverySession) => void;
}) {
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverrideInput, setShowOverrideInput] = useState(false);
  const canPass = isPassed || isOverridden;

  // Transition debrief state
  const todayStr = new Date().toISOString().slice(0, 10);
  const [debriefGutFeel, setDebriefGutFeel] = useState<string>(session.gut_feel || '');
  const [debriefNextAction, setDebriefNextAction] = useState(session.next_action || '');
  const [debriefNextMeeting, setDebriefNextMeeting] = useState(session.next_meeting_date?.slice(0, 10) || '');
  const [debriefMilestoneDate, setDebriefMilestoneDate] = useState(todayStr);

  // Save debrief data before advancing
  const handleAdvanceWithDebrief = () => {
    const updated = { ...session };
    const milestones = { ...(updated.milestones || { discovery_set: null, discovery_held: null, demo_held: null, proposal_sent: null }) };

    if (fromStageKey === 'investigating') {
      milestones.discovery_held = { date: debriefMilestoneDate, attendees: milestones.discovery_held?.attendees || [] };
    } else if (fromStageKey === 'negotiating') {
      milestones.demo_held = { date: debriefMilestoneDate, attendees: milestones.demo_held?.attendees || [] };
    }

    updated.milestones = milestones;
    if (debriefGutFeel) updated.gut_feel = debriefGutFeel as any;
    if (debriefNextAction) updated.next_action = debriefNextAction;
    if (debriefNextMeeting) updated.next_meeting_date = debriefNextMeeting;

    onSessionUpdate(updated);
    onConfirm();
  };

  const handleOverrideWithDebrief = (reason: string) => {
    const updated = { ...session };
    if (debriefGutFeel) updated.gut_feel = debriefGutFeel as any;
    if (debriefNextAction) updated.next_action = debriefNextAction;
    if (debriefNextMeeting) updated.next_meeting_date = debriefNextMeeting;
    onSessionUpdate(updated);
    onOverride(reason);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden"
      >
        {/* Header */}
        <div className={`px-6 py-4 ${canPass ? 'bg-emerald-50 border-b border-emerald-200' : 'bg-amber-50 border-b border-amber-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${canPass ? 'bg-emerald-500' : 'bg-amber-500'} text-white`}>
              {canPass ? <CheckCircle2 size={20} /> : <Lock size={20} />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">
                {canPass ? 'Gate Passed' : 'Checkpoint Gate'}
              </h3>
              <p className="text-[11px] text-stone-500">
                Advancing <strong>{companyName}</strong> → {targetStage}
              </p>
            </div>
          </div>
        </div>

        {/* Score */}
        <div className="px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-700">{checkpoint.checkpointLabel}</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${canPass ? 'text-emerald-600' : 'text-amber-600'}`}>
                {score}
              </span>
              <span className="text-[11px] font-bold text-stone-400">/ {maxScore}</span>
            </div>
          </div>
          <div className="h-2 rounded-full bg-stone-100 overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${canPass ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${(score / maxScore) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-stone-500">
            {canPass
              ? 'Checkpoint satisfied. Complete the quick debrief below.'
              : `Requires ${CP_PASS_THRESHOLD}/${maxScore} to pass.`
            }
          </p>
        </div>

        {/* ── Transition Debrief ── */}
        <div className="px-6 py-3 border-t border-stone-100 bg-stone-50/50">
          <h4 className="text-[10px] font-bold text-stone-400 mb-2.5">
            Quick Debrief
          </h4>

          {/* Investigating→Evaluating: Discovery held */}
          {fromStageKey === 'investigating' && (
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-stone-600 block mb-1">📅 When was discovery held?</label>
                <input
                  type="date"
                  value={debriefMilestoneDate}
                  onChange={e => setDebriefMilestoneDate(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-[11px] text-stone-700 focus:border-stone-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-600 block mb-1">How'd it go?</label>
                <div className="flex items-center gap-2">
                  {(['strong', 'mixed', 'weak'] as const).map(feel => (
                    <button
                      key={feel}
                      onClick={() => setDebriefGutFeel(feel)}
                      className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-2 text-[11px] font-bold transition-all ${
                        debriefGutFeel === feel
                          ? feel === 'strong' ? 'bg-emerald-200 ring-2 ring-emerald-500 text-emerald-800'
                            : feel === 'mixed' ? 'bg-amber-200 ring-2 ring-amber-500 text-amber-800'
                            : 'bg-rose-200 ring-2 ring-rose-500 text-rose-800'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-200'
                      }`}
                    >
                      {feel === 'strong' ? '🟢 Strong' : feel === 'mixed' ? '🟡 Mixed' : '🔴 Weak'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Evaluating→Negotiating: Demo scheduling */}
          {fromStageKey === 'evaluating' && (
            <div>
              <label className="text-[10px] font-bold text-stone-600 block mb-1">📅 When is the demo?</label>
              <input
                type="date"
                value={debriefNextMeeting}
                onChange={e => setDebriefNextMeeting(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-[11px] text-stone-700 focus:border-stone-400 focus:outline-none"
              />
            </div>
          )}

          {/* Negotiating→Contracting: Demo debrief */}
          {fromStageKey === 'negotiating' && (
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-stone-600 block mb-1">📅 When was the demo?</label>
                <input
                  type="date"
                  value={debriefMilestoneDate}
                  onChange={e => setDebriefMilestoneDate(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-[11px] text-stone-700 focus:border-stone-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-600 block mb-1">Post-demo gut feel?</label>
                <div className="flex items-center gap-2">
                  {(['strong', 'mixed', 'weak'] as const).map(feel => (
                    <button
                      key={feel}
                      onClick={() => setDebriefGutFeel(feel)}
                      className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-2 text-[11px] font-bold transition-all ${
                        debriefGutFeel === feel
                          ? feel === 'strong' ? 'bg-emerald-200 ring-2 ring-emerald-500 text-emerald-800'
                            : feel === 'mixed' ? 'bg-amber-200 ring-2 ring-amber-500 text-amber-800'
                            : 'bg-rose-200 ring-2 ring-rose-500 text-rose-800'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-200'
                      }`}
                    >
                      {feel === 'strong' ? '🟢 Strong' : feel === 'mixed' ? '🟡 Mixed' : '🔴 Weak'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Common: next step + next meeting */}
          <div className="grid grid-cols-2 gap-2 mt-2.5">
            <div>
              <label className="text-[10px] font-bold text-stone-600 block mb-1">Next step</label>
              <input
                type="text"
                value={debriefNextAction}
                onChange={e => setDebriefNextAction(e.target.value)}
                placeholder="Send proposal…"
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-[11px] text-stone-700 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-600 block mb-1">Next meeting</label>
              <input
                type="date"
                value={debriefNextMeeting}
                onChange={e => setDebriefNextMeeting(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-[11px] text-stone-700 focus:border-stone-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Override input */}
        {!canPass && showOverrideInput && (
          <div className="px-6 py-3 bg-amber-50/50 border-t border-amber-200">
            <p className="text-[11px] font-bold text-amber-800 mb-2">⚡ Why are you overriding?</p>
            <input
              value={overrideReason}
              onChange={e => setOverrideReason(e.target.value)}
              placeholder="e.g., Champion confirmed verbally but hasn't selected formal options"
              className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-[11px] text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none"
              autoFocus
            />
          </div>
        )}

        {/* Actions */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center gap-2">
          {canPass ? (
            <button
              onClick={handleAdvanceWithDebrief}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white py-2.5 text-sm font-bold hover:bg-emerald-700 transition-colors"
            >
              <ArrowRight size={14} />
              Advance to {targetStage}
            </button>
          ) : showOverrideInput ? (
            <button
              onClick={() => { if (overrideReason.trim()) handleOverrideWithDebrief(overrideReason.trim()); }}
              disabled={!overrideReason.trim()}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 text-white py-2.5 text-sm font-bold hover:bg-amber-600 transition-colors disabled:opacity-40"
            >
              <Zap size={14} />
              Override & Advance
            </button>
          ) : (
            <button
              onClick={() => setShowOverrideInput(true)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 text-white py-2.5 text-sm font-bold hover:bg-amber-600 transition-colors"
            >
              <Zap size={14} />
              Override Checkpoint
            </button>
          )}
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-500 hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}
