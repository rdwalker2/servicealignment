// ============================================================
// CallNotesLog — Unified meeting notes log
// Renders BOTH Granola-synced and manually-entered meeting notes
// from the single granola_notes[] array on DiscoverySession.
// ============================================================

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, Plus, Trash2, ChevronDown, ChevronUp,
  Quote, Users, Calendar, ArrowRight, CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import type { GranolaNote, DiscoverySession } from '../../lib/discoveryDatabase';
import { TranscriptUpload } from './TranscriptUpload';

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  qualifying:    { label: 'Qualifying', color: 'bg-slate-500' },
  investigating: { label: 'Investigating', color: 'bg-blue-500' },
  evaluating:    { label: 'Evaluating', color: 'bg-purple-500' },
  negotiating:   { label: 'Negotiating', color: 'bg-amber-500' },
  contracting:   { label: 'Contracting', color: 'bg-orange-500' },
  signing:       { label: 'Signing', color: 'bg-emerald-500' },
};

interface Props {
  notes: GranolaNote[];
  onChange: (notes: GranolaNote[]) => void;
  currentStage: string;
  stakeholderNames?: string[];
  selectedPains?: string[];
  painLabels?: Record<string, string>;
  onQuoteAssign?: (painId: string, quote: string) => void;
  session: DiscoverySession;
  onSessionChange: (session: DiscoverySession) => void;
  onLogMetric?: (type: string, date: string, auxiliaryDate?: string) => void;
}

export function CallNotesLog({ notes, onChange, currentStage, stakeholderNames = [], selectedPains = [], painLabels = {}, onQuoteAssign, session, onSessionChange, onLogMetric }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newSecondaryDate, setNewSecondaryDate] = useState('');
  const [newAttendees, setNewAttendees] = useState('');
  const [newMetricType, setNewMetricType] = useState<string>('');

  const addNote = useCallback(() => {
    if (!newTitle.trim()) return;
    const note: GranolaNote = {
      id: `cn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      date: newDate,
      title: newTitle.trim(),
      summary: '',
      transcript: '',
      url: '',
      attendees: newAttendees.split(',').map(a => a.trim()).filter(Boolean),
      // Extended fields
      stage: currentStage,
      key_quotes: [],
      next_steps: '',
      is_manual: true,
    };
    onChange([note, ...notes]); // newest first
    if (newMetricType && onLogMetric) {
      onLogMetric(newMetricType, newDate, newSecondaryDate || undefined);
    }
    setNewTitle('');
    setNewDate(new Date().toISOString().split('T')[0]);
    setNewSecondaryDate('');
    setNewAttendees('');
    setNewMetricType('');
    setIsAdding(false);
    setExpandedId(note.id);
  }, [newTitle, newDate, newSecondaryDate, newAttendees, newMetricType, currentStage, notes, onChange, onLogMetric]);

  const updateNote = useCallback((id: string, updates: Partial<GranolaNote>) => {
    onChange(notes.map(n => n.id === id ? { ...n, ...updates } : n));
  }, [notes, onChange]);

  const removeNote = useCallback((id: string) => {
    onChange(notes.filter(n => n.id !== id));
    if (expandedId === id) setExpandedId(null);
  }, [notes, onChange, expandedId]);

  const addQuote = useCallback((noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    updateNote(noteId, { key_quotes: [...(note.key_quotes || []), ''] });
  }, [notes, updateNote]);

  const updateQuote = useCallback((noteId: string, quoteIdx: number, text: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    const quotes = [...(note.key_quotes || [])];
    quotes[quoteIdx] = text;
    updateNote(noteId, { key_quotes: quotes });
  }, [notes, updateNote]);

  const removeQuote = useCallback((noteId: string, quoteIdx: number) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    updateNote(noteId, { key_quotes: (note.key_quotes || []).filter((_, i) => i !== quoteIdx) });
  }, [notes, updateNote]);

  // Count all verbatim quotes across all meetings
  const totalQuotes = notes.reduce((sum, n) => sum + (n.key_quotes || []).filter(q => q.trim()).length, 0);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-blue-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Meeting Log</span>
          {notes.length > 0 && (
            <div className="flex items-center gap-1.5 ml-1">
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                {notes.length} {notes.length === 1 ? 'meeting' : 'meetings'}
              </span>
              {totalQuotes > 0 && (
                <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-600">
                  {totalQuotes} verbatim{totalQuotes !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <TranscriptUpload
            onUpload={(note) => onChange([note, ...notes])}
            session={session}
            onSessionChange={onSessionChange}
            selectedPains={selectedPains}
            painLabels={painLabels}
            onQuoteAssign={onQuoteAssign}
            onLogMetric={onLogMetric}
          />
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600 transition-all hover:bg-zinc-200"
          >
            <Plus size={12} />
            Log Meeting
          </button>
        </div>
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
              <input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Meeting title (e.g., Discovery Call 1, Demo with CFO)"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <div className="flex gap-2">
                <div className="relative flex-shrink-0">
                  <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    title={newMetricType === 'discovery_held' ? "Meeting Held Date" : "Date Booked"}
                    className="rounded-lg border border-zinc-200 bg-white pl-9 pr-3 py-2 text-sm text-zinc-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                {newMetricType === 'discovery_set' && (
                  <div className="relative flex-shrink-0" title="Scheduled Meeting Date">
                    <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
                    <input
                      type="date"
                      value={newSecondaryDate}
                      onChange={e => setNewSecondaryDate(e.target.value)}
                      placeholder="Scheduled Date"
                      className="rounded-lg border border-emerald-200 bg-emerald-50 pl-9 pr-3 py-2 text-sm text-emerald-900 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                  </div>
                )}
                {newMetricType === 'discovery_held' && (
                  <div className="relative flex-shrink-0" title="Original Date Booked (Backdate Set Metric)">
                    <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none" />
                    <input
                      type="date"
                      value={newSecondaryDate}
                      onChange={e => setNewSecondaryDate(e.target.value)}
                      placeholder="Date Booked"
                      className="rounded-lg border border-orange-200 bg-orange-50 pl-9 pr-3 py-2 text-sm text-orange-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                  </div>
                )}
                <input
                  value={newAttendees}
                  onChange={e => setNewAttendees(e.target.value)}
                  placeholder="Attendees (comma-separated names)"
                  className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div className="flex gap-2 items-center justify-between">
                <select
                  value={newMetricType}
                  onChange={e => setNewMetricType(e.target.value)}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[11px] text-zinc-700 focus:border-blue-400 focus:outline-none"
                >
                  <option value="">No Pipeline Metric (Just notes)</option>
                  <option value="discovery_set">Log as Discovery Set (Meeting Booked)</option>
                  <option value="discovery_held">Log as Discovery Held</option>
                  <option value="demo_held">Log as Demo Held</option>
                  <option value="proposal_sent">Log as Proposal Sent</option>
                </select>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setIsAdding(false)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100">Cancel</button>
                  <button
                    onClick={addNote}
                    disabled={!newTitle.trim()}
                    className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-blue-600 disabled:opacity-40"
                  >
                    Create Note
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes List */}
      <div className="divide-y divide-zinc-100">
        {notes.length === 0 && !isAdding && (
          <div className="px-4 py-6 text-center">
            <p className="text-xs text-zinc-400">No meeting notes yet</p>
            <p className="text-[10px] text-zinc-300 mt-1">Log each meeting to build a complete deal narrative. Granola-synced notes also appear here.</p>
          </div>
        )}
        {notes.map(note => {
          const isExpanded = expandedId === note.id;
          const stageCfg = STAGE_LABELS[note.stage || 'qualifying'] || { label: '—', color: 'bg-zinc-400' };
          const isGranola = !note.is_manual && !!note.url;
          const quoteCount = (note.key_quotes || []).filter(q => q.trim()).length;

          return (
            <div key={note.id}>
              {/* Summary Row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : note.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50"
              >
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[9px] font-black text-white ${stageCfg.color}`}>
                  {stageCfg.label}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-zinc-900 truncate">{note.title}</p>
                    {isGranola && (
                      <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[8px] font-bold text-violet-600 uppercase tracking-wider shrink-0">
                        Granola
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <Calendar size={9} /> {note.date}
                    </span>
                    {note.attendees.length > 0 && (
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <Users size={9} /> {note.attendees.length}
                      </span>
                    )}
                    {quoteCount > 0 && (
                      <span className="text-[10px] text-violet-500 flex items-center gap-1 font-semibold">
                        <Quote size={9} /> {quoteCount} quote{quoteCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                {note.checkpoint_validated && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                    <CheckCircle2 size={10} /> CP{note.checkpoint_validated}
                  </span>
                )}
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
                      {/* Granola link */}
                      {isGranola && note.url && (
                        <a
                          href={note.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-[11px] font-semibold text-violet-600 hover:bg-violet-100 transition-colors"
                        >
                          <ExternalLink size={11} /> Open in Granola
                        </a>
                      )}

                      {/* Summary */}
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 block">Meeting Summary</label>
                        <textarea
                          value={note.summary}
                          onChange={e => updateNote(note.id, { summary: e.target.value })}
                          placeholder="What happened on this call? Key takeaways..."
                          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                          rows={3}
                        />
                      </div>

                      {/* Key Quotes / Verbatims */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-violet-500 flex items-center gap-1">
                            <Quote size={10} /> Prospect Verbatims
                          </label>
                          <button
                            onClick={() => addQuote(note.id)}
                            className="text-[10px] font-semibold text-blue-500 hover:text-blue-600"
                          >
                            + Add Quote
                          </button>
                        </div>
                        {(note.key_quotes || []).length === 0 && (
                          <p className="text-[10px] text-zinc-300 italic">Capture their exact words — critical for deal fidelity</p>
                        )}
                        {(note.key_quotes || []).map((quote, qi) => (
                          <div key={qi} className="flex items-start gap-2 mb-1.5">
                            <span className="mt-2 text-violet-300 shrink-0 text-sm font-serif">"</span>
                            <input
                              value={quote}
                              onChange={e => updateQuote(note.id, qi, e.target.value)}
                              placeholder="Exact words the prospect used..."
                              className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm italic text-zinc-700 placeholder:text-zinc-400 focus:border-blue-400 focus:outline-none"
                            />
                            <button onClick={() => removeQuote(note.id, qi)} className="mt-1 text-zinc-300 hover:text-red-400">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Next Steps */}
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1">
                          <ArrowRight size={10} /> Next Steps Agreed
                        </label>
                        <input
                          value={note.next_steps || ''}
                          onChange={e => updateNote(note.id, { next_steps: e.target.value })}
                          placeholder="What was committed as the next step?"
                          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-700 placeholder:text-zinc-400 focus:border-blue-400 focus:outline-none"
                        />
                      </div>

                      {/* Stage + Checkpoint + Delete */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Stage:</label>
                        <select
                          value={note.stage || 'qualifying'}
                          onChange={e => updateNote(note.id, { stage: e.target.value })}
                          className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] text-zinc-700 focus:outline-none"
                        >
                          {Object.entries(STAGE_LABELS).map(([id, cfg]) => (
                            <option key={id} value={id}>{cfg.label}</option>
                          ))}
                        </select>

                        <span className="text-zinc-200 mx-1">|</span>

                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">CP Validated:</label>
                        {['1', '2', '3'].map(cp => (
                          <button
                            key={cp}
                            onClick={() => updateNote(note.id, {
                              checkpoint_validated: note.checkpoint_validated === cp ? undefined : cp,
                            })}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                              note.checkpoint_validated === cp
                                ? 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-300'
                                : 'text-zinc-400 hover:bg-zinc-100'
                            }`}
                          >
                            CP{cp}
                          </button>
                        ))}
                        <div className="flex-1" />
                        {note.is_manual && (
                          <button
                            onClick={() => removeNote(note.id)}
                            className="rounded-lg p-1.5 text-zinc-300 transition-colors hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
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
