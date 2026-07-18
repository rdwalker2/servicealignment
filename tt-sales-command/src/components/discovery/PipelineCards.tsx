// ============================================================
// PipelineCards.tsx — Deal card and prospect card components
// ============================================================

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar, ArrowRight, GripVertical,
  AlertTriangle, UserCircle,
} from 'lucide-react';
import type { DiscoverySession } from '../../lib/discoveryDatabase';
import { scoreDeal } from '../../lib/leaderboard';
import { daysInStage, relativeTime, CHANNEL_ICONS, CHANNEL_COLORS } from './pipelineUtils';

// ── Deal Card (Compact) ──

export function PipelineDealCard({
  session,
  onSelect,
  onDragStart,
  isDragging,
}: {
  session: DiscoverySession;
  onSelect: () => void;
  onDragStart: (e: React.DragEvent) => void;
  isDragging: boolean;
}) {
  const score = scoreDeal(session);
  const days = daysInStage(session);
  const pct = score.totalPoints;
  const scoreColor = pct > 70 ? '#10b981' : pct > 40 ? '#f59e0b' : '#ef4444';

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onSelect}
      className={`group relative rounded-xl border bg-white transition-all cursor-grab active:cursor-grabbing hover:shadow-md ${
        isDragging ? 'opacity-40 scale-95' : 'opacity-100'
      } ${days >= 14 ? 'border-red-200/60' : 'border-stone-200/60'}`}
    >
      {/* Health-colored left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: scoreColor }} />

      <div className="pl-3.5 pr-3 py-2">
        {/* Drag handle */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-40 transition-opacity">
          <GripVertical size={12} className="text-stone-400" />
        </div>

        {/* Row 1: Name + Deal Value */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className="text-[12px] font-semibold text-stone-800 truncate flex-1 leading-tight">
            {session.company_name}
          </h4>
          <span className="text-[10px] font-medium text-stone-500 tabular-nums shrink-0">
            {(session.deal_value || 0) > 0 ? `$${(session.deal_value / 1000).toFixed(1)}K` : ''}
          </span>
        </div>

        {/* Row 2: Action + Days badge */}
        <div className="flex items-center justify-between gap-2">
          {/* Contextual action */}
          {(() => {
            const today = new Date().toISOString().slice(0, 10);
            const futureMeetings = (session.custom_meetings || [])
              .filter(m => m.date >= today)
              .sort((a, b) => a.date.localeCompare(b.date));
            const nextMeeting = futureMeetings[0];

            if (nextMeeting) {
              const d = new Date(nextMeeting.date);
              const isToday = d.toDateString() === new Date().toDateString();
              const label = isToday ? 'Today' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              return (
                <div className={`flex items-center gap-1 ${isToday ? 'text-amber-600' : 'text-stone-400'}`}>
                  <Calendar size={9} />
                  <span className={`text-[9px] ${isToday ? 'font-semibold' : 'font-medium'}`}>{label}</span>
                </div>
              );
            }
            if (session.next_action) {
              const actions: Record<string, string> = {
                send_followup: 'Follow up', schedule_meeting: 'Schedule', send_proposal: 'Proposal',
                get_intro: 'Get intro', make_call: 'Call', waiting_prospect: 'Waiting', internal_review: 'Review',
              };
              return (
                <div className="flex items-center gap-1 text-stone-400">
                  <ArrowRight size={9} />
                  <span className="text-[9px] font-medium truncate max-w-[120px]">{actions[session.next_action] || session.next_action}</span>
                </div>
              );
            }
            return <span className="text-[9px] text-amber-500 font-medium">No next step</span>;
          })()}

          {/* Days in stage badge */}
          <span className={`text-[9px] font-medium tabular-nums px-1.5 py-0.5 rounded-md ${
            days >= 14 ? 'text-red-600 bg-red-50' : 'text-stone-400 bg-stone-100'
          }`}>
            {days}d
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Working Column — Pre-pipeline Prospect Cards ──

export function ProspectCard({
  session,
  onConvert,
  onSessionUpdate,
  onDragStart,
  isDragging,
}: {
  session: DiscoverySession;
  onConvert: (id: string) => void;
  onSessionUpdate: (s: DiscoverySession) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  isDragging: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editNextStep, setEditNextStep] = useState(session.next_action || '');

  const channel = ((session as any).prospect_channel || 'phone') as 'phone' | 'email' | 'linkedin';
  const contactName = (session as any).prospect_contact || session.champion_name || '';
  const lastTouch = session.last_call_date || session.created_at;
  const daysSinceTouch = Math.floor((Date.now() - new Date(lastTouch).getTime()) / (1000 * 60 * 60 * 24));
  const isStale = daysSinceTouch >= 7;

  const handleSaveNextStep = () => {
    const updated = { ...session, next_action: editNextStep };
    onSessionUpdate(updated);
    setIsExpanded(false);
  };

  return (
    <motion.div
      layout
      draggable
      onDragStart={e => onDragStart(e, session.id)}
      className={`rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-40 scale-95' :
        isStale ? 'border-amber-200 bg-amber-50/50 shadow-sm' :
        'border-stone-200 bg-white shadow-sm hover:shadow-md'
      }`}
    >
      {/* Main card */}
      <div
        className="px-3 py-2.5 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Row 1: Company + channel */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold text-stone-800 truncate flex-1">
            {session.company_name}
          </span>
          <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold ${CHANNEL_COLORS[channel]}`}>
            {CHANNEL_ICONS[channel]}
          </span>
          {isStale && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-amber-200 text-[8px] font-bold text-amber-600 bg-amber-50 animate-pulse">
              <AlertTriangle size={8} /> STALE
            </span>
          )}
        </div>

        {/* Row 2: Contact name */}
        {contactName && (
          <div className="flex items-center gap-1 mb-1">
            <UserCircle size={10} className="text-stone-400 shrink-0" />
            <span className="text-[10px] text-stone-500 truncate">{contactName}</span>
          </div>
        )}

        {/* Row 3: Last touch + next step */}
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-medium ${isStale ? 'text-amber-600' : 'text-stone-400'}`}>
            {relativeTime(lastTouch)}
          </span>
          {session.next_action && (
            <>
              <span className="text-stone-200">·</span>
              <span className="text-[9px] text-stone-400 truncate flex-1">
                → {session.next_action}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Expanded section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-stone-100"
          >
            <div className="px-3 py-2.5 space-y-2">
              {/* Editable next step */}
              <div>
                <label className="text-[8px] font-bold text-stone-400 block mb-1">
                  Next Step
                </label>
                <input
                  type="text"
                  value={editNextStep}
                  onChange={e => setEditNextStep(e.target.value)}
                  onBlur={handleSaveNextStep}
                  onKeyDown={e => e.key === 'Enter' && handleSaveNextStep()}
                  placeholder="What's the next move?"
                  className="w-full text-[11px] rounded-md border border-stone-200 px-2 py-1.5 text-stone-700 placeholder:text-stone-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>

              {/* Convert button */}
              <button
                onClick={(e) => { e.stopPropagation(); onConvert(session.id); }}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-[10px] font-bold text-white transition-all hover:bg-sky-600 hover:shadow-md active:scale-95"
              >
                <ArrowRight size={11} />
                Convert to D1
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
