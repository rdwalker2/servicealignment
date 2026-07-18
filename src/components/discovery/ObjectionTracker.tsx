// ============================================================
// ObjectionTracker — Structured objection log for deals
// Captures what the prospect pushed back on, how it was handled,
// and whether it's resolved. Critical for multi-call deals.
// ============================================================

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, CheckCircle2, Clock, Plus, Trash2,
  ChevronDown, ChevronUp, MessageSquare, Tag,
} from 'lucide-react';
import type { DealObjection } from '../../lib/discoveryDatabase';

const CATEGORY_OPTIONS: { value: DealObjection['category']; label: string; emoji: string }[] = [
  { value: 'price', label: 'Price / Budget', emoji: '💰' },
  { value: 'timing', label: 'Timing / Urgency', emoji: '⏰' },
  { value: 'competition', label: 'Competition', emoji: '⚔️' },
  { value: 'internal', label: 'Internal Politics', emoji: '🏛️' },
  { value: 'technical', label: 'Technical / Integration', emoji: '🔧' },
  { value: 'change-mgmt', label: 'Change Management', emoji: '🔄' },
  { value: 'other', label: 'Other', emoji: '📋' },
];

const STATUS_CONFIG = {
  open: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: AlertTriangle, label: 'Open' },
  resolved: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2, label: 'Resolved' },
  deferred: { color: 'text-zinc-400', bg: 'bg-zinc-400/10', icon: Clock, label: 'Deferred' },
};

interface Props {
  objections: DealObjection[];
  onChange: (objections: DealObjection[]) => void;
  stakeholderNames?: string[];  // For the "raised by" dropdown
}

export function ObjectionTracker({ objections, onChange, stakeholderNames = [] }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<DealObjection['category']>('other');
  const [newRaisedBy, setNewRaisedBy] = useState('');

  const addObjection = useCallback(() => {
    if (!newText.trim()) return;
    const objection: DealObjection = {
      id: `obj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      text: newText.trim(),
      response: '',
      status: 'open',
      raised_by: newRaisedBy || undefined,
      raised_date: new Date().toISOString().split('T')[0],
      category: newCategory,
    };
    onChange([...objections, objection]);
    setNewText('');
    setNewRaisedBy('');
    setNewCategory('other');
    setIsAdding(false);
    setExpandedId(objection.id);
  }, [newText, newCategory, newRaisedBy, objections, onChange]);

  const updateObjection = useCallback((id: string, updates: Partial<DealObjection>) => {
    onChange(objections.map(o => o.id === id ? { ...o, ...updates } : o));
  }, [objections, onChange]);

  const removeObjection = useCallback((id: string) => {
    onChange(objections.filter(o => o.id !== id));
    if (expandedId === id) setExpandedId(null);
  }, [objections, onChange, expandedId]);

  const openCount = objections.filter(o => o.status === 'open').length;
  const resolvedCount = objections.filter(o => o.status === 'resolved').length;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-amber-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Objections</span>
          {objections.length > 0 && (
            <div className="flex items-center gap-1.5 ml-2">
              {openCount > 0 && (
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                  {openCount} open
                </span>
              )}
              {resolvedCount > 0 && (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                  {resolvedCount} resolved
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600 transition-all hover:bg-zinc-200"
        >
          <Plus size={12} />
          Add
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-zinc-100"
          >
            <div className="space-y-2 p-4 bg-zinc-50/50">
              <textarea
                value={newText}
                onChange={e => setNewText(e.target.value)}
                placeholder="What did the prospect push back on?"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                rows={2}
              />
              <div className="flex gap-2">
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as DealObjection['category'])}
                  className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 focus:border-amber-400 focus:outline-none"
                >
                  {CATEGORY_OPTIONS.map(c => (
                    <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                  ))}
                </select>
                {stakeholderNames.length > 0 && (
                  <select
                    value={newRaisedBy}
                    onChange={e => setNewRaisedBy(e.target.value)}
                    className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 focus:border-amber-400 focus:outline-none"
                  >
                    <option value="">Raised by...</option>
                    {stakeholderNames.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsAdding(false)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100">Cancel</button>
                <button
                  onClick={addObjection}
                  disabled={!newText.trim()}
                  className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-amber-600 disabled:opacity-40"
                >
                  Log Objection
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Objection List */}
      <div className="divide-y divide-zinc-100">
        {objections.length === 0 && !isAdding && (
          <div className="px-4 py-6 text-center">
            <p className="text-xs text-zinc-400">No objections logged yet</p>
            <p className="text-[10px] text-zinc-300 mt-1">Track pushback to ensure nothing falls through the cracks</p>
          </div>
        )}
        {objections.map(obj => {
          const isExpanded = expandedId === obj.id;
          const statusCfg = STATUS_CONFIG[obj.status];
          const StatusIcon = statusCfg.icon;
          const cat = CATEGORY_OPTIONS.find(c => c.value === obj.category);

          return (
            <div key={obj.id} className="group">
              {/* Summary Row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : obj.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50"
              >
                <StatusIcon size={14} className={statusCfg.color} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">{obj.text}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {cat && <span className="text-[10px] text-zinc-400">{cat.emoji} {cat.label}</span>}
                    {obj.raised_by && <span className="text-[10px] text-zinc-400">· {obj.raised_by}</span>}
                    {obj.raised_date && <span className="text-[10px] text-zinc-300">· {obj.raised_date}</span>}
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusCfg.bg} ${statusCfg.color}`}>
                  {statusCfg.label}
                </span>
                {isExpanded ? <ChevronUp size={14} className="text-zinc-400" /> : <ChevronDown size={14} className="text-zinc-400" />}
              </button>

              {/* Expanded Detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 px-4 pb-4 pt-1">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 block">How did you handle it?</label>
                        <textarea
                          value={obj.response}
                          onChange={e => updateObjection(obj.id, { response: e.target.value })}
                          placeholder="Document your response..."
                          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                          rows={2}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Status:</label>
                        {(['open', 'resolved', 'deferred'] as const).map(status => {
                          const cfg = STATUS_CONFIG[status];
                          return (
                            <button
                              key={status}
                              onClick={() => updateObjection(obj.id, {
                                status,
                                resolved_date: status === 'resolved' ? new Date().toISOString().split('T')[0] : obj.resolved_date,
                              })}
                              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                                obj.status === status
                                  ? `${cfg.bg} ${cfg.color} ring-1 ring-current`
                                  : 'text-zinc-400 hover:bg-zinc-100'
                              }`}
                            >
                              {cfg.label}
                            </button>
                          );
                        })}
                        <div className="flex-1" />
                        <button
                          onClick={() => removeObjection(obj.id)}
                          className="rounded-lg p-1.5 text-zinc-300 transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
