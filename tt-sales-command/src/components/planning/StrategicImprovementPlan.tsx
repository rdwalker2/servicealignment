// ============================================================
// StrategicImprovementPlan — Per-stage improvement strategies
// Matches Sales Autonomy SSP "Strategic Sales Plan" tab
// ============================================================
import { useState, useMemo, useCallback } from 'react';
import { Plus, X, Check, Circle, Clock, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { useSIPStore, type SIPStrategy } from '../../lib/stores/sipStore';
import { CASCADE_CHAIN, extractBaselineRates, type CascadeRateTargets } from '../../types';
import { fmtPct } from '../../lib/format';

const STAGE_CONFIG: Record<string, { label: string; desc: string; color: string; bgColor: string }> = {
  scheduled_rate: {
    label: 'Scheduled Rate',
    desc: 'Improve how many conversations turn into booked meetings',
    color: 'text-blue-700',
    bgColor: 'bg-blue-600',
  },
  show_rate: {
    label: 'Show Rate',
    desc: 'Improve how many scheduled meetings actually happen',
    color: 'text-violet-700',
    bgColor: 'bg-violet-600',
  },
  proposal_rate: {
    label: 'Proposal Rate',
    desc: 'Improve how many discoveries advance to proposals/demos',
    color: 'text-amber-700',
    bgColor: 'bg-amber-600',
  },
  close_rate: {
    label: 'Close Rate',
    desc: 'Improve how many proposals convert to closed-won deals',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-600',
  },
};

const STATUS_ICONS = {
  not_started: <Circle className="w-3.5 h-3.5 text-stone-400" />,
  in_progress: <Clock className="w-3.5 h-3.5 text-amber-500" />,
  done: <Check className="w-3.5 h-3.5 text-emerald-500" />,
};

const STATUS_LABELS = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  done: 'Done',
};

const STATUS_CYCLE: SIPStrategy['status'][] = ['not_started', 'in_progress', 'done'];

// Starter suggestions based on Sales Autonomy methodology
const STARTER_SUGGESTIONS: Record<string, string[]> = {
  scheduled_rate: [
    'Leverage GTM Connect for outbound prospecting',
    'Generate more referrals with Buyer Centric Referral Strategy',
    'Create "Hot Boomerangs" through high quality buyer experiences',
    'Improve opening pitch to create urgency in first 30 seconds',
  ],
  show_rate: [
    'Send pre-call agenda 24h before each meeting',
    'Add confirmation touchpoint via text/email day-of',
    'Create compelling pre-meeting Discovery Room content',
    'Reduce time-to-meeting from scheduling to \u003c48 hours',
  ],
  proposal_rate: [
    'Integrate "Urgency Test" into Discovery Call process (Checkpoint 1)',
    'Create Problem Reframes to differentiate from competition',
    'Integrate "Price Objections Trinity" into Discovery process (Checkpoint 2)',
    'Evaluate need for outside help with BAP key questions',
  ],
  close_rate: [
    'Integrate decision-maker identification into BAP process',
    'Map their purchasing process early using BAP questions',
    'Perform post-mortem with Process Execution Audit sheet',
    'Add "Battle Tested, Proven Results" section to solution presentation',
  ],
};

interface Props {
  repId: string;
  focusArea?: string;
  baselineRates?: CascadeRateTargets;
}

export default function StrategicImprovementPlan({ repId, focusArea, baselineRates }: Props) {
  const strategies = useSIPStore((s) => s.strategies);
  const addStrategy = useSIPStore((s) => s.addStrategy);
  const updateStrategy = useSIPStore((s) => s.updateStrategy);
  const removeStrategy = useSIPStore((s) => s.removeStrategy);

  const repStrategies = useMemo(
    () => Object.values(strategies).filter((s) => s.rep_id === repId),
    [strategies, repId],
  );

  const [expandedStage, setExpandedStage] = useState<string | null>(
    focusArea
      ? CASCADE_CHAIN.find((s) => s.rateLabel === focusArea)?.rateKey ?? null
      : null,
  );
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newText, setNewText] = useState('');

  const handleAdd = useCallback(
    (stage: string, text?: string) => {
      const t = text ?? newText.trim();
      if (!t) return;
      addStrategy({
        rep_id: repId,
        stage,
        text: t,
        status: 'not_started',
      });
      setNewText('');
      if (!text) setAddingTo(null);
    },
    [addStrategy, repId, newText],
  );

  const handleStatusCycle = useCallback(
    (id: string, current: SIPStrategy['status']) => {
      const idx = STATUS_CYCLE.indexOf(current);
      const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
      updateStrategy(id, { status: next });
    },
    [updateStrategy],
  );

  const stages = CASCADE_CHAIN.map((s) => s.rateKey);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Strategic Improvement Plan
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Per-stage strategies to improve your conversion rates. What will you DO to move each driver?
          </p>
        </div>
      </div>

      {stages.map((stageKey) => {
        const config = STAGE_CONFIG[stageKey];
        if (!config) return null;
        const stageStrategies = repStrategies.filter((s) => s.stage === stageKey);
        const isExpanded = expandedStage === stageKey;
        const isFocus = focusArea && CASCADE_CHAIN.find((s) => s.rateKey === stageKey)?.rateLabel === focusArea;
        const doneCount = stageStrategies.filter((s) => s.status === 'done').length;
        const suggestions = STARTER_SUGGESTIONS[stageKey] ?? [];

        return (
          <div
            key={stageKey}
            className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
              isFocus ? 'border-amber-200 ring-1 ring-amber-100' : 'border-stone-200'
            }`}
          >
            {/* Stage Header */}
            <button
              onClick={() => setExpandedStage(isExpanded ? null : stageKey)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-8 rounded-full ${config.bgColor}`} />
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${config.color}`}>{config.label}</span>
                    {isFocus && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold">
                        <Zap className="w-2.5 h-2.5" /> FOCUS
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-400">{config.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {stageStrategies.length > 0 && (
                  <span className="text-[10px] text-stone-500 tabular-nums">
                    {doneCount}/{stageStrategies.length} done
                  </span>
                )}
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-stone-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                )}
              </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-stone-100 px-4 py-3 space-y-2">
                {/* Existing Strategies */}
                {stageStrategies.map((strategy, i) => (
                  <div
                    key={strategy.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 transition-colors group"
                  >
                    <span className="text-xs text-stone-400 w-4 text-center tabular-nums">{i + 1}</span>
                    <button
                      onClick={() => handleStatusCycle(strategy.id, strategy.status)}
                      className="shrink-0 hover:opacity-70 transition-opacity"
                      title={`Status: ${STATUS_LABELS[strategy.status]} — click to cycle`}
                    >
                      {STATUS_ICONS[strategy.status]}
                    </button>
                    <span className={`flex-1 text-xs ${
                      strategy.status === 'done' ? 'text-stone-400 line-through' : 'text-stone-700'
                    }`}>
                      {strategy.text}
                    </span>
                    <button
                      onClick={() => removeStrategy(strategy.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-stone-200 transition-all"
                    >
                      <X className="w-3 h-3 text-stone-400" />
                    </button>
                  </div>
                ))}

                {/* Add New */}
                {addingTo === stageKey ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAdd(stageKey)}
                      placeholder="Describe your improvement strategy..."
                      autoFocus
                      className="flex-1 text-xs text-stone-700 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:border-stone-400"
                    />
                    <button
                      onClick={() => handleAdd(stageKey)}
                      className="px-3 py-2 text-xs font-bold text-white bg-stone-800 rounded-lg hover:bg-stone-700 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setAddingTo(null); setNewText(''); }}
                      className="px-2 py-2 text-xs text-stone-500 hover:text-stone-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingTo(stageKey)}
                    className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 px-2 py-1.5 rounded-lg hover:bg-stone-50 transition-colors mt-1"
                  >
                    <Plus className="w-3 h-3" /> Add strategy
                  </button>
                )}

                {/* Starter Suggestions */}
                {stageStrategies.length === 0 && suggestions.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-stone-100">
                    <p className="text-[10px] text-stone-400 font-medium mb-1.5">
                      Suggested strategies from Sales Autonomy:
                    </p>
                    <div className="space-y-1">
                      {suggestions.map((sug) => (
                        <button
                          key={sug}
                          onClick={() => handleAdd(stageKey, sug)}
                          className="w-full text-left text-[11px] text-stone-500 hover:text-stone-700 px-2 py-1.5 rounded hover:bg-stone-50 transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-3 h-3 text-stone-400 shrink-0" />
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
