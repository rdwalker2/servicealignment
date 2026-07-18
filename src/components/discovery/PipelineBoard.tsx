// ============================================================
// PipelineBoard.tsx — 4D Pipeline Board with Checkpoint Gates
// Visual kanban-style board where columns = 4D stages,
// gates = checkpoints, and cards show deal intelligence.
// ============================================================

import React, { useState, useMemo, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  Zap, Clock,
  CheckCircle2, Lock, ChevronDown,
} from 'lucide-react';
import type { DiscoverySession } from '../../lib/discoveryDatabase';
import { computeBAPAnswers, getCheckpointScore } from '../../lib/discoveryDatabase';

// ── Re-export shared types/constants for downstream consumers ──
export type { PipelineBoardProps, StageConfig, PacingMetric } from './pipelineUtils';
export { STAGES, END_STAGES, MAX_CP_SCORE, CP_PASS_THRESHOLD, daysInStage, daysColor, getMilestoneBadge, relativeTime, CHANNEL_ICONS, CHANNEL_COLORS } from './pipelineUtils';

import type { PipelineBoardProps } from './pipelineUtils';
import { STAGES, END_STAGES, CP_PASS_THRESHOLD, daysInStage } from './pipelineUtils';
import { GateModal } from './GateModal';
import { PipelineDealCard } from './PipelineCards';


// ── Main Board ──

export function PipelineBoard({ sessions, repId, onSelect, onStageChange, onOverride, onSessionUpdate }: PipelineBoardProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [gateModal, setGateModal] = useState<{
    session: DiscoverySession;
    fromStage: (typeof STAGES)[number];
    toStage: (typeof STAGES)[number];
    cpScore: number;
    isPassed: boolean;
    isOverridden: boolean;
  } | null>(null);
  const [expandedEndStages, setExpandedEndStages] = useState<Record<string, boolean>>({});


  // Group sessions by stage (including prospecting and working)
  const grouped = useMemo(() => {
    const g: Record<string, DiscoverySession[]> = {};
    for (const stage of [...STAGES, ...END_STAGES]) {
      g[stage.key] = [];
    }
    for (const s of sessions) {
      const key = s.deal_stage || 'qualifying';
      if (g[key]) g[key].push(s);
      else g['qualifying'].push(s);
    }
    // Sort within each stage: highest priority first (needs attention → upcoming meeting → recency)
    for (const key of Object.keys(g)) {
      g[key].sort((a, b) => {
        const daysA = daysInStage(a);
        const daysB = daysInStage(b);
        if (daysA >= 14 !== daysB >= 14) return daysA >= 14 ? -1 : 1;
        return daysB - daysA; // longest first
      });
    }
    return g;
  }, [sessions]);

  // Compute stage metrics
  const stageMetrics = useMemo(() => {
    const m: Record<string, { count: number; avgDays: number; totalValue: number }> = {};
    for (const stage of STAGES) {
      const deals = grouped[stage.key] || [];
      const totalDays = deals.reduce((sum, d) => sum + daysInStage(d), 0);
      const totalValue = deals.reduce((sum, d) => sum + (d.deal_value || 0), 0);
      m[stage.key] = {
        count: deals.length,
        avgDays: deals.length > 0 ? Math.round(totalDays / deals.length) : 0,
        totalValue,
      };
    }
    return m;
  }, [grouped]);


  // Drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, sessionId: string) => {
    setDraggedId(sessionId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', sessionId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageKey);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverStage(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetStageKey: string) => {
    e.preventDefault();
    setDragOverStage(null);
    const sessionId = e.dataTransfer.getData('text/plain');
    if (!sessionId) return;

    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const currentStage = session.deal_stage || 'qualifying';
    if (currentStage === targetStageKey) { setDraggedId(null); return; }



    // End stages — no gate check
    if (targetStageKey === 'closed_won' || targetStageKey === 'closed_lost' || targetStageKey === 'disqualified') {
      onStageChange(sessionId, targetStageKey);
      setDraggedId(null);
      return;
    }

    // Find if we need to pass a gate (advancing forward)
    const fromIdx = STAGES.findIndex(s => s.key === currentStage);
    const toIdx = STAGES.findIndex(s => s.key === targetStageKey);

    if (toIdx > fromIdx) {
      // Advancing — check gate
      const fromStage = STAGES[fromIdx];
      if (fromStage.checkpoint) {
        const bapAnswers = computeBAPAnswers(session);
        const cpScore = getCheckpointScore(bapAnswers, fromStage.checkpoint);
        const overrides = session.call_sheet_checkpoints || {};
        const isOverridden = !!overrides[`checkpoint${fromStage.checkpoint}`];
        const isPassed = cpScore >= CP_PASS_THRESHOLD;

        if (isPassed || isOverridden) {
          // Gate passed — advance directly
          onStageChange(sessionId, targetStageKey);
          setDraggedId(null);
        } else {
          // Gate not passed — show modal
          setGateModal({
            session,
            fromStage,
            toStage: STAGES[toIdx],
            cpScore,
            isPassed: false,
            isOverridden: false,
          });
          setDraggedId(null);
        }
      } else {
        onStageChange(sessionId, targetStageKey);
        setDraggedId(null);
      }
    } else {
      // Moving backwards — no gate needed
      onStageChange(sessionId, targetStageKey);
      setDraggedId(null);
    }
  }, [sessions, onStageChange]);

  const handleGateConfirm = useCallback(() => {
    if (!gateModal) return;
    onStageChange(gateModal.session.id, gateModal.toStage.key);
    setGateModal(null);
  }, [gateModal, onStageChange]);

  const handleGateOverride = useCallback((reason: string) => {
    if (!gateModal || !gateModal.fromStage.checkpoint) return;
    onOverride(gateModal.session.id, gateModal.fromStage.checkpoint, reason);
    onStageChange(gateModal.session.id, gateModal.toStage.key);
    setGateModal(null);
  }, [gateModal, onStageChange, onOverride]);



  return (
    <div className="flex-1 flex flex-col min-h-0 bg-stone-50">




      {/* ── Board ── */}
      <div className="flex-1 flex gap-0 overflow-x-auto px-4 py-4 min-h-0">

        {STAGES.map((stage, stageIdx) => {
          const metrics = stageMetrics[stage.key];
          const deals = grouped[stage.key] || [];
          const isOver = dragOverStage === stage.key;

          // Gate status for the checkpoint leaving this stage
          let gateStatus: 'passed' | 'partial' | 'blocked' = 'blocked';
          if (stage.checkpoint) {
            const readyCount = deals.filter(d => {
              const ba = computeBAPAnswers(d);
              const cp = getCheckpointScore(ba, stage.checkpoint!);
              const ov = d.call_sheet_checkpoints?.[`checkpoint${stage.checkpoint}`];
              return cp >= CP_PASS_THRESHOLD || ov;
            }).length;
            if (readyCount === deals.length && deals.length > 0) gateStatus = 'passed';
            else if (readyCount > 0) gateStatus = 'partial';
          }

          return (
            <React.Fragment key={stage.key}>
              {/* Column */}
              <div
                className={`flex-1 min-w-[220px] max-w-[300px] flex flex-col rounded-xl transition-all ${
                  isOver ? 'bg-blue-50/60 ring-2 ring-blue-300' : 'bg-stone-100/50'
                }`}
                onDragOver={e => handleDragOver(e, stage.key)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, stage.key)}
              >
                {/* Column header */}
                <div className="px-3 py-3 border-b border-stone-200/60">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[9px] font-bold"
                      style={{ backgroundColor: stage.color }}
                    >
                      {stage.short}
                    </div>
                    <span className="text-[12px] font-bold text-stone-700">{stage.label}</span>
                    <span className="text-[10px] font-bold text-stone-400 ml-auto">{metrics.count}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[9px] text-stone-400">
                    <span className="flex items-center gap-0.5">
                      <Clock size={8} /> avg {metrics.avgDays}d
                    </span>
                    {metrics.totalValue > 0 && (
                      <span>${(metrics.totalValue / 1000).toFixed(0)}k</span>
                    )}
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[100px]">
                  {deals.length === 0 && (
                    <div className="flex items-center justify-center h-20 text-[10px] text-stone-300 font-medium">
                      No deals
                    </div>
                  )}
                  {deals.map(d => (
                    <PipelineDealCard
                      key={d.id}
                      session={d}
                      onSelect={() => onSelect(d)}
                      onDragStart={e => handleDragStart(e, d.id)}
                      isDragging={draggedId === d.id}
                    />
                  ))}
                </div>
              </div>

              {/* Gate between columns */}
              {stageIdx < STAGES.length - 1 && stage.checkpoint && (
                <div className="flex flex-col items-center justify-start pt-16 px-1 shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    gateStatus === 'passed' ? 'bg-emerald-100 border-emerald-400 text-emerald-600' :
                    gateStatus === 'partial' ? 'bg-amber-100 border-amber-400 text-amber-600' :
                    'bg-stone-100 border-stone-300 text-stone-400'
                  }`}>
                    {gateStatus === 'passed' ? <CheckCircle2 size={14} /> :
                     gateStatus === 'partial' ? <Zap size={14} /> :
                     <Lock size={14} />}
                  </div>
                  <div className="mt-1 w-0.5 flex-1 bg-stone-200 rounded-full" />
                  <p className="text-[7px] font-bold text-stone-400 mt-1 writing-mode-vertical [writing-mode:vertical-lr] rotate-180">
                    {stage.checkpointLabel.split(':')[0]}
                  </p>
                </div>
              )}

              {/* Spacer between columns when no gate */}
              {stageIdx < STAGES.length - 1 && !stage.checkpoint && (
                <div className="w-2 shrink-0" />
              )}
            </React.Fragment>
          );
        })}

        {/* End state columns (expandable) */}
        <div className="flex flex-col gap-2 ml-2 shrink-0" style={{ width: Object.values(expandedEndStages).some(Boolean) ? 200 : 120, transition: 'width 0.2s ease' }}>
          {END_STAGES.map(endStage => {
            const deals = grouped[endStage.key] || [];
            const isExpanded = !!expandedEndStages[endStage.key];
            return (
              <div
                key={endStage.key}
                className={`rounded-xl border transition-all ${
                  isExpanded ? '' : 'flex-1'
                } min-h-[60px] ${
                  dragOverStage === endStage.key ? 'ring-2 ring-blue-300 bg-blue-50/50' : 'bg-stone-100/30'
                } ${endStage.key === 'closed_won' ? 'border-emerald-200' : endStage.key === 'disqualified' ? 'border-stone-300' : 'border-red-200'}`}
                onDragOver={e => handleDragOver(e, endStage.key)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, endStage.key)}
              >
                {/* Clickable header */}
                <button
                  onClick={() => setExpandedEndStages(prev => ({ ...prev, [endStage.key]: !prev[endStage.key] }))}
                  className="w-full px-3 py-2 flex items-center justify-between hover:bg-stone-50/50 rounded-t-xl transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    {endStage.icon}
                    <span className="text-[10px] font-bold" style={{ color: endStage.color }}>
                      {endStage.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-stone-400">
                      {deals.length}
                    </span>
                    {deals.length > 0 && (
                      <ChevronDown
                        size={10}
                        className={`text-stone-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    )}
                  </div>
                </button>

                {/* Expanded deal cards */}
                {isExpanded && deals.length > 0 && (
                  <div className="px-2 pb-2 space-y-1.5 max-h-[300px] overflow-y-auto">
                    {deals.map(d => (
                      <PipelineDealCard
                        key={d.id}
                        session={d}
                        onSelect={() => onSelect(d)}
                        onDragStart={e => handleDragStart(e, d.id)}
                        isDragging={draggedId === d.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Gate Modal */}
      <AnimatePresence>
        {gateModal && (
          <GateModal
            checkpoint={gateModal.fromStage}
            score={gateModal.cpScore}
            maxScore={10}
            isPassed={gateModal.isPassed}
            isOverridden={gateModal.isOverridden}
            companyName={gateModal.session.company_name}
            targetStage={gateModal.toStage.label}
            fromStageKey={gateModal.fromStage.key}
            toStageKey={gateModal.toStage.key}
            session={gateModal.session}
            onConfirm={handleGateConfirm}
            onOverride={handleGateOverride}
            onCancel={() => setGateModal(null)}
            onSessionUpdate={onSessionUpdate}
          />
        )}
      </AnimatePresence>


    </div>
  );
}
