// ============================================================
// DemoReactionsPanel — Structured demo feedback capture
// Tracks positive reactions, concerns, questions, and aha moment
// ============================================================

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ThumbsUp, AlertCircle, HelpCircle,
  Lightbulb, Plus, Trash2, X,
} from 'lucide-react';
import type { DemoReaction } from '../../lib/discoveryDatabase';

interface Props {
  reactions?: DemoReaction;
  onChange: (reactions: DemoReaction) => void;
}

const DEFAULT_REACTIONS: DemoReaction = {
  positive_reactions: [],
  concerns: [],
  questions_asked: [],
  aha_moment: '',
  overall_notes: '',
};

function ListEditor({
  items,
  onAdd,
  onUpdate,
  onRemove,
  placeholder,
  accentColor,
  icon: Icon,
  label,
}: {
  items: string[];
  onAdd: () => void;
  onUpdate: (idx: number, val: string) => void;
  onRemove: (idx: number) => void;
  placeholder: string;
  accentColor: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  label: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className={`text-[10px] font-bold uppercase tracking-wider ${accentColor} flex items-center gap-1`}>
          <Icon size={10} /> {label}
        </label>
        <button onClick={onAdd} className={`text-[10px] font-semibold ${accentColor} hover:opacity-80`}>
          + Add
        </button>
      </div>
      {items.length === 0 && (
        <p className="text-[10px] text-zinc-300 italic mb-2">None logged yet</p>
      )}
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 mb-1.5">
          <input
            value={item}
            onChange={e => onUpdate(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none"
          />
          <button onClick={() => onRemove(i)} className="text-zinc-300 hover:text-red-400 transition-colors">
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function DemoReactionsPanel({ reactions, onChange }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const data = reactions || DEFAULT_REACTIONS;

  const update = useCallback((partial: Partial<DemoReaction>) => {
    onChange({ ...data, ...partial });
  }, [data, onChange]);

  const totalItems = data.positive_reactions.length + data.concerns.length + data.questions_asked.length + (data.aha_moment ? 1 : 0);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-zinc-50"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-violet-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Demo Reactions</span>
          {totalItems > 0 && (
            <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-600">
              {totalItems} captured
            </span>
          )}
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
          <Plus size={14} className={`text-zinc-400 transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 px-4 pb-4 border-t border-zinc-100 pt-3">
              {/* Positive Reactions */}
              <ListEditor
                items={data.positive_reactions}
                onAdd={() => update({ positive_reactions: [...data.positive_reactions, ''] })}
                onUpdate={(i, v) => {
                  const arr = [...data.positive_reactions];
                  arr[i] = v;
                  update({ positive_reactions: arr });
                }}
                onRemove={(i) => update({ positive_reactions: data.positive_reactions.filter((_, idx) => idx !== i) })}
                placeholder="Feature or moment they loved..."
                accentColor="text-emerald-500"
                icon={ThumbsUp}
                label="What They Loved"
              />

              {/* Concerns */}
              <ListEditor
                items={data.concerns}
                onAdd={() => update({ concerns: [...data.concerns, ''] })}
                onUpdate={(i, v) => {
                  const arr = [...data.concerns];
                  arr[i] = v;
                  update({ concerns: arr });
                }}
                onRemove={(i) => update({ concerns: data.concerns.filter((_, idx) => idx !== i) })}
                placeholder="What they pushed back on..."
                accentColor="text-amber-500"
                icon={AlertCircle}
                label="Concerns Raised"
              />

              {/* Questions */}
              <ListEditor
                items={data.questions_asked}
                onAdd={() => update({ questions_asked: [...data.questions_asked, ''] })}
                onUpdate={(i, v) => {
                  const arr = [...data.questions_asked];
                  arr[i] = v;
                  update({ questions_asked: arr });
                }}
                onRemove={(i) => update({ questions_asked: data.questions_asked.filter((_, idx) => idx !== i) })}
                placeholder="Question the prospect asked..."
                accentColor="text-blue-500"
                icon={HelpCircle}
                label="Questions Asked"
              />

              {/* Aha Moment */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-violet-500 mb-1 block flex items-center gap-1">
                  <Lightbulb size={10} /> The "Aha" Moment
                </label>
                <input
                  value={data.aha_moment || ''}
                  onChange={e => update({ aha_moment: e.target.value })}
                  placeholder="The moment their eyes lit up..."
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-700 placeholder:text-zinc-400 focus:border-violet-300 focus:outline-none"
                />
              </div>

              {/* Overall Notes */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 block">Overall Demo Notes</label>
                <textarea
                  value={data.overall_notes || ''}
                  onChange={e => update({ overall_notes: e.target.value })}
                  placeholder="General observations from the demo..."
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none"
                  rows={2}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
