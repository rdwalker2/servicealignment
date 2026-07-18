// ============================================================
// PipelineColumns.tsx — WorkingColumn, ChannelCaptureModal,
// ConversationsColumn, and PacingBar components
// ============================================================

import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar, Target, ArrowRight, CheckCircle2,
  Mail, MessageSquare, TrendingUp, Plus,
} from 'lucide-react';
import type { DiscoverySession } from '../../lib/discoveryDatabase';
import { createProspectCard } from '../../lib/discoveryDatabase';
import { useActualStore } from '../../lib/stores/actualStore';
import { useGoalStore } from '../../lib/stores/goalStore';
import { getCurrentWeekMonday, getWeeksInMonth } from '../../lib/calendar';
import { getTotalConversations } from '../../types';
import { CHANNEL_ICONS, CHANNEL_COLORS } from './pipelineUtils';
import type { PacingMetric } from './pipelineUtils';
import { ProspectCard } from './PipelineCards';

// ── Working Column ──

export function WorkingColumn({
  prospects,
  repId,
  onConvert,
  onSessionUpdate,
  onDragStart,
  draggedId,
  isOver,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  prospects: DiscoverySession[];
  repId: string;
  onConvert: (id: string) => void;
  onSessionUpdate: (s: DiscoverySession) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  draggedId: string | null;
  isOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newChannel, setNewChannel] = useState<'phone' | 'email' | 'linkedin'>('phone');
  const [newNote, setNewNote] = useState('');

  const handleAdd = () => {
    if (!newCompany.trim()) return;
    if (!repId) return;
    createProspectCard(repId, newCompany.trim(), newContact.trim(), newChannel, newNote.trim() || undefined);
    setNewCompany('');
    setNewContact('');
    setNewChannel('phone');
    setNewNote('');
    setIsAdding(false);
    // Force re-render by triggering a page reload event
    window.dispatchEvent(new Event('storage'));
  };

  const staleCount = prospects.filter(p => {
    const lastTouch = p.last_call_date || p.created_at;
    return Math.floor((Date.now() - new Date(lastTouch).getTime()) / (1000 * 60 * 60 * 24)) >= 7;
  }).length;

  return (
    <div
      className={`flex-1 min-w-[200px] max-w-[240px] flex flex-col rounded-xl transition-all ${
        isOver ? 'bg-slate-100 ring-2 ring-slate-400' : 'bg-slate-50/80'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Column header */}
      <div className="px-3 py-3 border-b border-stone-200/60">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-violet-500 text-white text-[9px] font-bold">
            📡
          </div>
          <span className="text-[12px] font-bold text-stone-700">In Cadence</span>
          <span className="text-[10px] font-bold text-stone-400 ml-auto">{prospects.length}</span>
        </div>
        <div className="flex items-center gap-3 text-[9px] text-stone-400">
          <span>Pushed from Signal Board</span>
          {staleCount > 0 && (
            <span className="text-amber-500 font-bold">{staleCount} stale</span>
          )}
        </div>
      </div>

      {/* Prospect cards */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-[100px]">
        {prospects.length === 0 && !isAdding && (
          <div className="flex items-center justify-center h-20 text-[10px] text-stone-300 font-medium">
            No prospects yet
          </div>
        )}
        {prospects.map(p => (
          <ProspectCard
            key={p.id}
            session={p}
            onConvert={onConvert}
            onSessionUpdate={onSessionUpdate}
            onDragStart={onDragStart}
            isDragging={draggedId === p.id}
          />
        ))}

        {/* Inline Add Form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-2.5 space-y-2">
                <input
                  type="text"
                  value={newCompany}
                  onChange={e => setNewCompany(e.target.value)}
                  placeholder="Company name *"
                  autoFocus
                  className="w-full text-[11px] rounded-md border border-stone-200 bg-white px-2 py-1.5 text-stone-700 placeholder:text-stone-400 focus:border-blue-400 focus:outline-none"
                />
                <input
                  type="text"
                  value={newContact}
                  onChange={e => setNewContact(e.target.value)}
                  placeholder="Contact name"
                  className="w-full text-[11px] rounded-md border border-stone-200 bg-white px-2 py-1.5 text-stone-700 placeholder:text-stone-400 focus:border-blue-400 focus:outline-none"
                />
                {/* Channel toggle */}
                <div className="flex gap-1">
                  {(['phone', 'email', 'linkedin'] as const).map(ch => (
                    <button
                      key={ch}
                      onClick={() => setNewChannel(ch)}
                      className={`flex-1 flex items-center justify-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold transition-all ${
                        newChannel === ch
                          ? CHANNEL_COLORS[ch] + ' border border-current'
                          : 'text-stone-400 bg-stone-100 hover:bg-stone-200'
                      }`}
                    >
                      {CHANNEL_ICONS[ch]}
                      {ch === 'phone' ? 'Phone' : ch === 'email' ? 'Email' : 'LI'}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Next step (optional)"
                  className="w-full text-[11px] rounded-md border border-stone-200 bg-white px-2 py-1.5 text-stone-700 placeholder:text-stone-400 focus:border-blue-400 focus:outline-none"
                />
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setIsAdding(false)}
                    className="flex-1 rounded-md px-2 py-1 text-[10px] font-medium text-stone-500 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={!newCompany.trim()}
                    className="flex-1 rounded-md bg-slate-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-slate-700 disabled:opacity-40 transition-all"
                  >
                    Add
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Prospect Button */}
      {!isAdding && (
        <div className="p-2 border-t border-stone-200/60">
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-1 rounded-lg border border-dashed border-stone-300 px-2 py-1.5 text-[10px] font-semibold text-stone-400 transition-all hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50"
          >
            <Plus size={11} />
            Add Account
          </button>
        </div>
      )}
    </div>
  );
}

// ── Channel Capture Modal ──

export function ChannelCaptureModal({
  companyName,
  onConfirm,
  onCancel,
}: {
  companyName: string;
  onConfirm: (channel: 'phone' | 'email' | 'linkedin') => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden"
      >
        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-200">
          <h3 className="text-sm font-semibold text-stone-900">Conversation Started 🎉</h3>
          <p className="text-[11px] text-stone-500 mt-0.5">
            How did the conversation with <strong>{companyName}</strong> happen?
          </p>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-3 gap-3">
            {(['phone', 'email', 'linkedin'] as const).map(ch => (
              <button
                key={ch}
                onClick={() => onConfirm(ch)}
                className="flex flex-col items-center gap-2 rounded-xl border-2 border-stone-200 bg-stone-50 px-4 py-4 transition-all hover:border-violet-400 hover:bg-violet-50 hover:shadow-md active:scale-95"
              >
                <span className="text-2xl">
                  {ch === 'phone' ? '📞' : ch === 'email' ? '📧' : '💬'}
                </span>
                <span className="text-[11px] font-bold text-stone-700">
                  {ch === 'phone' ? 'Phone' : ch === 'email' ? 'Email' : 'LinkedIn'}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="px-6 py-3 border-t border-stone-100 flex justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-500 hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Conversations Column ──

export function ConversationsColumn({
  sessions,
  onDragStart,
  draggedId,
  isOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onConvert,
}: {
  sessions: DiscoverySession[];
  onDragStart: (e: React.DragEvent, id: string) => void;
  draggedId: string | null;
  isOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onConvert: (id: string) => void;
}) {
  return (
    <div
      className={`flex-1 min-w-[200px] max-w-[240px] flex flex-col rounded-xl transition-all ${
        isOver ? 'bg-emerald-100/60 ring-2 ring-emerald-400' : 'bg-emerald-50/30'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="px-3 py-3 border-b border-stone-200/60">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-emerald-500 text-white text-[9px] font-bold">
            💬
          </div>
          <span className="text-[12px] font-bold text-stone-700">Conversations</span>
          <span className="text-[10px] font-bold text-stone-400 ml-auto">{sessions.length}</span>
        </div>
        <div className="text-[9px] text-stone-400">Reply received</div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-[100px]">
        {sessions.length === 0 && (
          <div className="flex items-center justify-center h-20 text-[10px] text-stone-300 font-medium">
            No conversations yet
          </div>
        )}
        {sessions.map(s => {
          const channel = (s as any).conversation_channel as string | undefined;
          const diff = Math.floor((Date.now() - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24));
          const daysSince = diff < 0 ? 0 : diff;
          return (
            <motion.div
              key={s.id}
              draggable
              onDragStart={e => onDragStart(e, s.id)}
              className={`rounded-lg border bg-white px-3 py-2.5 cursor-grab transition-all hover:shadow-md ${
                draggedId === s.id ? 'opacity-40 scale-95' : 'border-stone-200/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-stone-800 truncate">{s.company_name}</span>
                {channel && (
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${
                    channel === 'phone' ? 'bg-blue-50 text-blue-600' :
                    channel === 'email' ? 'bg-amber-50 text-amber-600' :
                    'bg-violet-50 text-violet-600'
                  }`}>
                    {channel === 'phone' ? '📞 Phone' : channel === 'email' ? '📧 Email' : '💬 LinkedIn'}
                  </span>
                )}
              </div>
              {s.champion_name && (
                <div className="text-[10px] text-stone-500 truncate">{s.champion_name}</div>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[9px] font-medium ${daysSince >= 7 ? 'text-amber-600' : 'text-stone-400'}`}>
                  {daysSince === 0 ? 'Today' : daysSince === 1 ? '1d ago' : `${daysSince}d ago`}
                </span>
                {s.next_action && (
                  <>
                    <span className="text-stone-200">·</span>
                    <span className="text-[9px] text-stone-400 truncate flex-1">→ {s.next_action}</span>
                  </>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onConvert(s.id); }}
                className="w-full mt-2 flex items-center justify-center gap-1 rounded-md bg-sky-50 border border-sky-200 px-2 py-1 text-[9px] font-bold text-sky-700 transition-all hover:bg-sky-100 active:scale-95"
              >
                <ArrowRight size={10} /> Book Discovery
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Pipeline Pacing Bar ──

export function PacingBar({ repId, sessions }: { repId: string; sessions: DiscoverySession[] }) {
  const getActual = useActualStore(s => s.getActual);
  const getGoal = useGoalStore(s => s.getGoal);

  const metrics = useMemo<PacingMetric[]>(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const weekStart = getCurrentWeekMonday(now);
    const weeksInMonth = getWeeksInMonth(year, month);
    const weekCount = weeksInMonth.length || 4;

    const goal = getGoal(repId, monthStr);
    const actual = getActual(repId, weekStart);

    if (!goal) return [];

    // Compute weekly targets from monthly goals
    const wk = (v: number) => Math.round(v / weekCount);

    // Aggregate actuals
    const totalConvos = actual ? getTotalConversations(actual) : 0;
    const totalConvoGoal = wk((goal.conversations || 0) + ((goal as any).email_conversations || 0) + ((goal as any).linkedin_conversations || 0));

    return [
      { label: 'Conversations', icon: <MessageSquare size={12} className="text-stone-400" />, actual: totalConvos, target: totalConvoGoal },
      { label: 'Disco Set', icon: <Calendar size={12} className="text-stone-400" />, actual: actual?.discovery_set ?? 0, target: wk(goal.discovery_set || 0) },
      { label: 'Disco Held', icon: <CheckCircle2 size={12} className="text-stone-400" />, actual: actual?.discovery_held ?? 0, target: wk(goal.discovery_held || 0) },
      { label: 'Demo Held', icon: <Target size={12} className="text-stone-400" />, actual: actual?.demo_held ?? 0, target: wk(goal.demo_held || 0) },
      { label: 'Proposal', icon: <Mail size={12} className="text-stone-400" />, actual: actual?.proposal_sent ?? 0, target: wk(goal.proposal_sent || 0) },
      { label: 'Revenue', icon: <TrendingUp size={12} className="text-stone-400" />, actual: actual?.revenue ?? 0, target: wk(goal.revenue || 0), isCurrency: true },
    ];
  }, [repId, getActual, getGoal]);

  // Pipeline coverage: total weighted pipeline vs monthly quota
  const coverage = useMemo(() => {
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const goal = getGoal(repId, monthStr);
    const quota = goal?.revenue || 0;
    if (quota <= 0) return null;

    const activePipeline = sessions
      .filter(s => s.deal_stage && !['closed_won', 'closed_lost', 'prospecting'].includes(s.deal_stage))
      .reduce((sum, s) => sum + (s.deal_value || 0), 0);

    const ratio = activePipeline / quota;
    return { pipeline: activePipeline, quota, ratio };
  }, [repId, sessions, getGoal]);

  if (metrics.length === 0) return null;

  return (
    <div className="border-b border-stone-200/60 bg-white/80 backdrop-blur-sm px-6 py-2">
      <div className="flex items-center gap-4">
        <span className="text-[9px] font-bold text-stone-400 shrink-0">
          This Week
        </span>

        <div className="flex items-center gap-4 overflow-x-auto flex-1">
          {metrics.map(m => {
            if (m.target <= 0) return null;
            return (
              <div key={m.label} className="flex items-center gap-2 shrink-0 border-l border-stone-200 pl-4 first:border-0 first:pl-0">
                <span className="flex items-center justify-center">{m.icon}</span>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-stone-400">{m.label}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[12px] font-bold text-stone-700">
                      {m.isCurrency ? `$${(m.actual / 1000).toFixed(1)}k` : m.actual}
                    </span>
                    <span className="text-[9px] font-bold text-stone-400">
                      / {m.isCurrency ? `$${(m.target / 1000).toFixed(1)}k` : m.target}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pipeline Coverage Gauge */}
        {coverage && (
          <div className="flex items-center gap-2 shrink-0 border-l border-stone-200 pl-4 ml-2">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-stone-400">Coverage</span>
              <span className={`text-[12px] font-bold ${
                coverage.ratio >= 3 ? 'text-stone-700' :
                coverage.ratio >= 2 ? 'text-stone-600' :
                'text-stone-500'
              }`}>
                {coverage.ratio.toFixed(1)}x
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
