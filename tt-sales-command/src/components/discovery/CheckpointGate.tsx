// ════════════════════════════════════════════════════════════════
// Checkpoint Gate
// Extracted from RepWorkspace.tsx
// ════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  CheckCircle2, Lock, Zap,
} from 'lucide-react';
import type { DiscoverySession } from '../../lib/discoveryDatabase';
import { getCheckpointScore, getCheckpointStatus } from '../../lib/discoveryDatabase';
import { MAX_CP_SCORE } from './repWorkspaceConstants';

export function CheckpointGate({
  checkpoint, bapAnswers, session, onSessionChange,
}: {
  checkpoint: any;
  bapAnswers: Record<string, string | null>;
  session: DiscoverySession;
  onSessionChange: (s: DiscoverySession) => void;
}) {
  const overrides = session.call_sheet_checkpoints || {};
  const isOverridden = !!overrides[`checkpoint${checkpoint.num}`];
  
  const score = getCheckpointScore(bapAnswers, checkpoint.num);
  const status = getCheckpointStatus(score, MAX_CP_SCORE);
  const isPassed = status.passed || isOverridden;

  const [showOverrideInput, setShowOverrideInput] = React.useState(false);
  const [overrideReason, setOverrideReason] = React.useState(
    session.call_sheet_checkpoint_reasons?.[`checkpoint${checkpoint.num}`] || ''
  );

  const handleOverride = () => {
    if (isOverridden) {
      // Toggle off
      onSessionChange({
        ...session,
        call_sheet_checkpoints: { ...overrides, [`checkpoint${checkpoint.num}`]: false },
      });
      setShowOverrideInput(false);
    } else {
      // Show justification input
      setShowOverrideInput(true);
    }
  };

  const handleConfirmOverride = () => {
    if (!overrideReason.trim()) return;
    onSessionChange({
      ...session,
      call_sheet_checkpoints: { ...overrides, [`checkpoint${checkpoint.num}`]: true },
      call_sheet_checkpoint_reasons: {
        ...(session.call_sheet_checkpoint_reasons || {}),
        [`checkpoint${checkpoint.num}`]: overrideReason.trim(),
      },
    });
    setShowOverrideInput(false);
  };

  return (
    <div className={`mt-4 mb-8 rounded-2xl border-2 transition-all duration-300 ${
      isPassed ? 'border-emerald-200 bg-emerald-50/30' : 'border-stone-200 bg-stone-50/50'
    }`}>
      <div className="flex items-center justify-between p-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
            isPassed ? 'bg-emerald-500 text-white shadow-sm' : 'bg-stone-200 text-stone-500'
          }`}>
            {isPassed ? <CheckCircle2 size={16} /> : <Lock size={16} />}
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-stone-800">
              CP{checkpoint.num}: {checkpoint.title}
            </h4>
            <p className="text-[10px] font-medium text-stone-500">{checkpoint.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-baseline gap-1 justify-end">
              <span className={`text-xl font-black ${isPassed ? 'text-emerald-600' : 'text-stone-700'}`}>
                {score}
              </span>
              <span className="text-[10px] font-bold text-stone-400">/ {MAX_CP_SCORE}</span>
            </div>
            <p className="text-[9px] font-bold text-stone-400">
              {isOverridden ? '⚡ Override' : isPassed ? 'Passed' : 'Pending'}
            </p>
          </div>
          <button
            onClick={handleOverride}
            title="Manager Override"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              isOverridden ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'bg-white text-stone-400 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Zap size={12} className={isOverridden ? 'fill-amber-500' : ''} />
          </button>
        </div>
      </div>

      {isPassed && (
        <div className="border-t border-emerald-200">
          <div className="flex items-center gap-2 bg-emerald-100/60 px-4 py-3">
            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
            <span className="text-[11px] font-bold text-emerald-800">
              {checkpoint.num < 3 ? `Checkpoint passed → ${checkpoint.gateLabel} unlocked` : '🎉 All checkpoints passed — move to D4 close plan below'}
            </span>
          </div>
          {/* ── Inline Evidence Capture (consolidated from CheckpointEvidencePanel) ── */}
          <div className="px-4 py-3 bg-white/80 space-y-1.5 rounded-b-2xl">
            <input
              value={session.checkpoint_evidence?.[`cp${checkpoint.num}` as 'cp1' | 'cp2' | 'cp3']?.evidence || ''}
              onChange={e => {
                const cpKey = `cp${checkpoint.num}` as 'cp1' | 'cp2' | 'cp3';
                onSessionChange({
                  ...session,
                  checkpoint_evidence: {
                    ...session.checkpoint_evidence,
                    [cpKey]: {
                      ...session.checkpoint_evidence?.[cpKey],
                      validated: true,
                      validated_date: session.checkpoint_evidence?.[cpKey]?.validated_date || new Date().toISOString().split('T')[0],
                      evidence: e.target.value,
                    },
                  },
                });
              }}
              placeholder="What did they say/do that confirmed this checkpoint?"
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] text-stone-700 placeholder:text-stone-400 focus:border-emerald-300 focus:outline-none"
            />
            <p className="text-[9px] text-stone-400 italic">Capture evidence — strengthens deal conviction</p>
          </div>
        </div>
      )}

      {/* Override justification input */}
      {showOverrideInput && !isOverridden && (
        <div className="border-t border-amber-200 bg-amber-50/50 px-4 py-3 space-y-2 rounded-b-2xl">
          <p className="text-[11px] font-bold text-amber-800">⚡ Why are you overriding this checkpoint?</p>
          <input
            value={overrideReason}
            onChange={e => setOverrideReason(e.target.value)}
            placeholder="e.g., Champion confirmed urgency verbally but hasn't selected formal options yet"
            className="w-full rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-[11px] text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleConfirmOverride}
              disabled={!overrideReason.trim()}
              className="px-3 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-bold hover:bg-amber-600 transition-colors disabled:opacity-40"
            >
              Confirm Override
            </button>
            <button
              onClick={() => setShowOverrideInput(false)}
              className="px-3 py-1 rounded-lg text-[10px] font-medium text-stone-500 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Show override reason if overridden */}
      {isOverridden && (
        <div className="border-t border-amber-200 bg-amber-50/30 px-4 py-2 rounded-b-2xl">
          <p className="text-[10px] text-amber-700">
            <span className="font-bold">⚡ Override reason:</span>{' '}
            {session.call_sheet_checkpoint_reasons?.[`checkpoint${checkpoint.num}`] || 'No reason provided'}
          </p>
        </div>
      )}
    </div>
  );
}
