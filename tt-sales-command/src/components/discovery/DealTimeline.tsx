// ============================================================
// DealTimeline.tsx — Timeline/activity log for a deal
// ============================================================

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar, Target, Sparkles, CheckCircle2, X,
  Mail, Plus, Phone, MailOpen, Reply, PhoneCall,
} from 'lucide-react';
import type { DiscoverySession } from '../../lib/discoveryDatabase';
import { MEETING_TYPE_OPTIONS } from '../../lib/discoveryDatabase';
import type { CustomMeeting } from '../../lib/discoveryDatabase';
import { supabase } from '../../lib/supabase';

// ── SalesLoft Activity Type ──
interface SalesloftActivity {
  id: number;
  activity_type: 'email' | 'call';
  person_email: string | null;
  person_name: string | null;
  subject: string | null;
  email_status: string | null;
  view_count: number;
  click_count: number;
  call_disposition: string | null;
  call_sentiment: string | null;
  call_duration: number | null;
  cadence_name: string | null;
  occurred_at: string;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
}

function getEmailIcon(status: string | null) {
  switch (status) {
    case 'replied': return <Reply size={12} className="text-emerald-500" />;
    case 'opened': case 'clicked': return <MailOpen size={12} className="text-blue-500" />;
    case 'bounced': return <X size={12} className="text-red-500" />;
    default: return <Mail size={12} className="text-stone-500" />;
  }
}

function getCallIcon(disposition: string | null) {
  const d = (disposition || '').toLowerCase();
  if (d === 'connected' || d === 'demo scheduled' || d === 'interest') {
    return <PhoneCall size={12} className="text-emerald-500" />;
  }
  return <Phone size={12} className="text-stone-500" />;
}

// ── Deal Timeline (Milestones + Meetings + SalesLoft Activity) ──

export function DealTimeline({ session, onSessionUpdate }: {
  session: DiscoverySession;
  onSessionUpdate: (field: string, value: any) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [newType, setNewType] = useState<string>('discovery');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newAttendees, setNewAttendees] = useState<string[]>([]);
  const [newNote, setNewNote] = useState('');
  const [attendeeInput, setAttendeeInput] = useState('');
  const [slActivities, setSlActivities] = useState<SalesloftActivity[]>([]);
  const [showSalesLoft, setShowSalesLoft] = useState(true);

  const meetings = session.custom_meetings || [];
  const stakeholderNames = (session.stakeholders || []).map(s => s.name).filter(Boolean);

  // Fetch SalesLoft activities for this deal's domain
  useEffect(() => {
    const domain = session.company_domain;
    if (!domain) return;
    
    (async () => {
      const { data, error } = await supabase
        .from('salesloft_activities')
        .select('*')
        .eq('domain', domain)
        .order('occurred_at', { ascending: false })
        .limit(50);
      
      if (!error && data) {
        setSlActivities(data as SalesloftActivity[]);
      }
    })();
  }, [session.company_domain]);

  // Build unified timeline
  type TimelineEntry = { 
    date: string; 
    kind: 'milestone' | 'meeting' | 'email' | 'call'; 
    label: string; 
    icon: React.ReactNode; 
    attendees?: string[]; 
    note?: string; 
    meetingId?: string;
    meta?: string;
    metaColor?: string;
  };
  const entries: TimelineEntry[] = [];

  if (session.created_at) entries.push({ date: session.created_at.slice(0, 10), kind: 'milestone', label: 'Opp Created', icon: <Sparkles size={12} className="text-blue-500" /> });
  if (session.milestones?.discovery_held?.date) entries.push({ date: session.milestones.discovery_held.date.slice(0, 10), kind: 'milestone', label: 'Discovery Held', icon: <CheckCircle2 size={12} className="text-emerald-500" />, attendees: session.milestones.discovery_held.attendees });
  if (session.milestones?.demo_held?.date) entries.push({ date: session.milestones.demo_held.date.slice(0, 10), kind: 'milestone', label: 'Demo Held', icon: <Target size={12} className="text-emerald-500" />, attendees: session.milestones.demo_held.attendees });
  if (session.milestones?.proposal_sent?.date) entries.push({ date: session.milestones.proposal_sent.date.slice(0, 10), kind: 'milestone', label: 'Proposal Sent', icon: <Mail size={12} className="text-emerald-500" /> });
  if (session.completed_at) entries.push({ date: session.completed_at.slice(0, 10), kind: 'milestone', label: 'Closed Won', icon: <CheckCircle2 size={12} className="text-emerald-500" /> });

  meetings.forEach(mtg => {
    const opt = MEETING_TYPE_OPTIONS.find(o => o.value === mtg.type);
    entries.push({ date: mtg.date, kind: 'meeting', label: opt?.label || mtg.type, icon: <Calendar size={12} className="text-stone-500" />, attendees: mtg.attendees, note: mtg.note, meetingId: mtg.id });
  });

  // Merge SalesLoft activities
  if (showSalesLoft) {
    for (const act of slActivities) {
      const dateStr = act.occurred_at?.slice(0, 10) || '';
      const personLabel = act.person_name || act.person_email || 'Unknown';
      
      if (act.activity_type === 'email') {
        const statusBadge = act.email_status === 'replied' ? ' ✅ Replied' 
          : act.email_status === 'opened' ? ` 👁 Opened${act.view_count > 1 ? ` ${act.view_count}x` : ''}`
          : act.email_status === 'clicked' ? ' 🔗 Clicked'
          : act.email_status === 'bounced' ? ' ⚠️ Bounced'
          : '';
        
        entries.push({
          date: dateStr,
          kind: 'email',
          label: `Email → ${personLabel}`,
          icon: getEmailIcon(act.email_status),
          note: act.subject || undefined,
          meta: statusBadge || undefined,
          metaColor: act.email_status === 'replied' ? 'text-emerald-600' 
            : act.email_status === 'bounced' ? 'text-red-500' 
            : 'text-blue-500',
        });
      } else if (act.activity_type === 'call') {
        const dispLabel = act.call_disposition || 'Called';
        const durLabel = act.call_duration ? ` · ${formatDuration(act.call_duration)}` : '';
        const sentLabel = act.call_sentiment ? ` · ${act.call_sentiment}` : '';
        
        entries.push({
          date: dateStr,
          kind: 'call',
          label: `Call → ${personLabel}`,
          icon: getCallIcon(act.call_disposition),
          meta: `${dispLabel}${durLabel}${sentLabel}`,
          metaColor: (act.call_disposition || '').toLowerCase() === 'connected' ? 'text-emerald-600' : 'text-stone-500',
        });
      }
    }
  }

  entries.sort((a, b) => b.date.localeCompare(a.date)); // newest first

  const today = new Date().toISOString().slice(0, 10);

  const handleAdd = () => {
    const meeting: CustomMeeting = {
      id: `mtg-${Date.now()}`,
      title: MEETING_TYPE_OPTIONS.find(o => o.value === newType)?.label || newType,
      type: newType as any,
      date: newDate,
      attendees: newAttendees,
      note: newNote || undefined,
    };
    onSessionUpdate('custom_meetings', [...meetings, meeting]);
    setShowAdd(false); setNewType('discovery'); setNewDate(new Date().toISOString().slice(0, 10)); setNewAttendees([]); setNewNote('');
  };

  const handleDelete = (id: string) => onSessionUpdate('custom_meetings', meetings.filter(m => m.id !== id));

  const toggleAttendee = (name: string) => setNewAttendees(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);

  const addFreeAttendee = () => {
    const name = attendeeInput.trim();
    if (name && !newAttendees.includes(name)) { setNewAttendees(prev => [...prev, name]); setAttendeeInput(''); }
  };

  const slCount = slActivities.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-stone-400">Deal Timeline</label>
          {slCount > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setShowSalesLoft(!showSalesLoft); }}
              className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full transition-all ${
                showSalesLoft 
                  ? 'bg-violet-100 text-violet-700 border border-violet-200' 
                  : 'bg-stone-100 text-stone-400 border border-stone-200'
              }`}
            >
              <Mail size={9} /> SalesLoft ({slCount})
            </button>
          )}
        </div>
        {!showAdd && (
          <button onClick={(e) => { e.stopPropagation(); setShowAdd(true); }} className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors">
            <Plus size={12} /> Log Activity
          </button>
        )}
      </div>

      {/* Add Activity Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden mb-3">
            <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-stone-500 block mb-1">Type</label>
                  <select value={newType} onChange={e => setNewType(e.target.value)} onClick={e => e.stopPropagation()} className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-[11px] font-semibold text-stone-700 focus:outline-none focus:border-blue-400">
                    {MEETING_TYPE_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.emoji} {opt.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-500 block mb-1">Date</label>
                  <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} onClick={e => e.stopPropagation()} className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-blue-400" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-500 block mb-1">Who was on the call?</label>
                {stakeholderNames.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {stakeholderNames.map(name => (
                      <button key={name} onClick={(e) => { e.stopPropagation(); toggleAttendee(name); }} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${newAttendees.includes(name) ? 'bg-blue-500 text-white ring-2 ring-blue-300' : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'}`}>
                        {name}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <input type="text" value={attendeeInput} onChange={e => setAttendeeInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFreeAttendee(); } }} onClick={e => e.stopPropagation()} placeholder="Add someone else…" className="flex-1 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-[11px] text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-blue-400" />
                  {attendeeInput.trim() && (
                    <button onClick={(e) => { e.stopPropagation(); addFreeAttendee(); }} className="px-2 py-1.5 rounded-lg bg-stone-100 text-stone-600 text-[10px] font-bold hover:bg-stone-200 transition-colors">Add</button>
                  )}
                </div>
                {newAttendees.filter(a => !stakeholderNames.includes(a)).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {newAttendees.filter(a => !stakeholderNames.includes(a)).map(name => (
                      <span key={name} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-500 text-white text-[9px] font-bold">
                        {name}
                        <button onClick={(e) => { e.stopPropagation(); toggleAttendee(name); }} className="hover:text-blue-200"><X size={8} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-500 block mb-1">Note <span className="font-normal text-stone-400">(optional)</span></label>
                <input type="text" value={newNote} onChange={e => setNewNote(e.target.value)} onClick={e => e.stopPropagation()} placeholder="Quick takeaway…" className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-[11px] text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-blue-400" />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); handleAdd(); }} disabled={!newDate} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 text-white py-2 text-[11px] font-bold hover:bg-blue-700 transition-colors disabled:opacity-40">
                  <Plus size={12} /> Log Activity
                </button>
                <button onClick={(e) => { e.stopPropagation(); setShowAdd(false); }} className="px-3 py-2 rounded-lg text-[11px] font-semibold text-stone-500 hover:bg-stone-100 transition-colors">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline feed */}
      {entries.length > 0 ? (
        <div className="relative pl-5">
          <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-stone-200 rounded-full" />
          <div className="space-y-2">
            {entries.map((entry, i) => {
              const isFuture = entry.date > today;
              const isSalesLoft = entry.kind === 'email' || entry.kind === 'call';
              return (
                <div key={`${entry.kind}-${entry.date}-${i}`} className="relative group">
                  <div className={`absolute -left-5 top-2 w-2.5 h-2.5 rounded-full border-2 ${
                    entry.kind === 'milestone' ? 'bg-emerald-500 border-emerald-300' 
                    : entry.kind === 'email' ? 'bg-violet-400 border-violet-200'
                    : entry.kind === 'call' ? 'bg-amber-400 border-amber-200'
                    : isFuture ? 'bg-blue-400 border-blue-200' 
                    : 'bg-stone-400 border-stone-300'
                  }`} />
                  <div className={`rounded-lg px-3 py-1.5 ${
                    entry.kind === 'milestone' ? 'bg-emerald-50/60 border border-emerald-100' 
                    : isSalesLoft ? 'bg-violet-50/40 border border-violet-100/60'
                    : 'bg-stone-50 border border-stone-100'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="flex items-center justify-center w-4 h-4 shrink-0">{entry.icon}</span>
                        <span className={`text-[11px] font-bold truncate ${
                          entry.kind === 'milestone' ? 'text-emerald-700' 
                          : isSalesLoft ? 'text-violet-700' 
                          : 'text-stone-700'
                        }`}>{entry.label}</span>
                        {entry.meta && (
                          <span className={`text-[9px] font-bold ${entry.metaColor || 'text-stone-500'}`}>{entry.meta}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[10px] ${isFuture ? 'font-bold text-blue-500' : 'text-stone-400'}`}>
                          {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        {entry.meetingId && (
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(entry.meetingId!); }} className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all">
                            <X size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                    {entry.attendees && entry.attendees.length > 0 && (
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        {entry.attendees.map(a => (<span key={a} className="text-[9px] font-semibold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{a}</span>))}
                      </div>
                    )}
                    {entry.note && <p className={`text-[10px] mt-0.5 italic ${isSalesLoft ? 'text-violet-500' : 'text-stone-500'}`}>{entry.note}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-[10px] text-stone-400 italic">No activity yet — log your first meeting</p>
      )}
    </div>
  );
}
