import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar, ChevronLeft, ChevronRight, CheckCircle2, Clock,
  X, DollarSign, Users, BarChart3, Grip, Eye, Plus, Search,
  Check,
} from 'lucide-react';
import type { DiscoverySession } from '../../lib/discoveryDatabase';
import { MEETING_TYPE_OPTIONS } from '../../lib/discoveryDatabase';
import type { MeetingType } from '../../lib/discoveryDatabase';
import { REP_ID_TO_INITIALS, REP_PROFILES } from '../../contexts/AuthContext';
import type { GoogleCalendarEvent } from '../../lib/googleCalendarClient';

// ── Stage color map (same as pipelineUtils.ts STAGES) ──
const STAGE_COLORS: Record<string, { color: string; label: string; short: string }> = {
  qualifying:    { color: '#64748b', label: 'Qualifying',    short: 'D1' },
  investigating: { color: '#0ea5e9', label: 'Investigating', short: 'D1' },
  evaluating:    { color: '#8b5cf6', label: 'Evaluating',    short: 'D2' },
  negotiating:   { color: '#f59e0b', label: 'Negotiating',   short: 'D3' },
  contracting:   { color: '#f97316', label: 'Contracting',   short: 'D3' },
  signing:       { color: '#10b981', label: 'Signing',       short: 'D4' },
  closed_won:    { color: '#10b981', label: 'Won',           short: '✓' },
  closed_lost:   { color: '#ef4444', label: 'Lost',          short: '✗' },
};

// ── Props ──

export interface PipelineCalendarProps {
  sessions: DiscoverySession[];
  onSelect: (session: DiscoverySession) => void;
  onReschedule?: (sessionId: string, milestoneKey: string, newDate: string) => void;
  onLogMeeting?: (sessionId: string, date: string, type: string) => void;
  onLogNextSteps?: (session: DiscoverySession, dateStr: string, googleEvent?: GoogleCalendarEvent) => void;
  onOpenTranscriptSync?: (session: DiscoverySession, meetingId: string) => void;
  onMarkHeld?: (sessionId: string, milestoneKey: string, date: string) => void;
  googleCalendarEvents?: GoogleCalendarEvent[];
}

// ── Calendar Event Type ──

interface CalendarEvent {
  id: string;
  session: DiscoverySession;
  type: 'discovery' | 'demo' | 'proposal' | 'custom' | 'google_calendar';
  status: 'upcoming' | 'held';
  label: string;
  milestoneKey: string;
  typeLabel: string;
  googleEvent?: GoogleCalendarEvent;
}

// ── Helpers ──

function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmtDealValue(v: number): string {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
  if (v > 0) return `$${v}`;
  return '';
}

function fmtShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ── Main Component ──

export function PipelineCalendar({ sessions, onSelect, onReschedule, onLogMeeting, onLogNextSteps, onOpenTranscriptSync, onMarkHeld, googleCalendarEvents = [] }: PipelineCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const agendaRef = useRef<HTMLDivElement>(null);

  // Quick Log state
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const [quickLogSearch, setQuickLogSearch] = useState('');
  const [quickLogSession, setQuickLogSession] = useState<DiscoverySession | null>(null);
  const [quickLogType, setQuickLogType] = useState<MeetingType>('discovery');
  const [quickLogShowResults, setQuickLogShowResults] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close agenda on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (agendaRef.current && !agendaRef.current.contains(e.target as Node)) {
        setSelectedDate(null);
        setQuickLogOpen(false);
        setQuickLogSession(null);
        setQuickLogSearch('');
      }
    }
    if (selectedDate) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [selectedDate]);

  // Focus search input when quick log opens
  useEffect(() => {
    if (quickLogOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [quickLogOpen]);

  // Navigate
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    }
  };
  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    }
  };
  const handleToday = () => setCurrentDate(new Date());

  // ── Map sessions to calendar events ──
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    sessions.forEach(session => {
      const ms = session.milestones;
      if (!ms) return;

      // Discovery
      if (ms.discovery_held?.date) {
        const dateStr = ms.discovery_held.date.split('T')[0];
        const list = map.get(dateStr) || [];
        list.push({
          id: `${session.id}-disc-held`, session, type: 'discovery', status: 'held',
          label: session.company_name, milestoneKey: 'discovery_held', typeLabel: 'Discovery',
        });
        map.set(dateStr, list);
      } else if (ms.discovery_set?.scheduled_date) {
        const dateStr = ms.discovery_set.scheduled_date.split('T')[0];
        const list = map.get(dateStr) || [];
        list.push({
          id: `${session.id}-disc-upc`, session, type: 'discovery', status: 'upcoming',
          label: session.company_name, milestoneKey: 'discovery_set', typeLabel: 'Discovery',
        });
        map.set(dateStr, list);
      } else if (ms.discovery_set?.date) {
        const dateStr = ms.discovery_set.date.split('T')[0];
        const list = map.get(dateStr) || [];
        list.push({
          id: `${session.id}-disc-upc`, session, type: 'discovery', status: 'upcoming',
          label: session.company_name, milestoneKey: 'discovery_set', typeLabel: 'Discovery',
        });
        map.set(dateStr, list);
      }

      // Demo
      if (ms.demo_held?.date) {
        const dateStr = ms.demo_held.date.split('T')[0];
        const list = map.get(dateStr) || [];
        list.push({
          id: `${session.id}-demo-held`, session, type: 'demo', status: 'held',
          label: session.company_name, milestoneKey: 'demo_held', typeLabel: 'Demo',
        });
        map.set(dateStr, list);
      }

      // Proposal
      if (ms.proposal_sent?.date) {
        const dateStr = ms.proposal_sent.date.split('T')[0];
        const list = map.get(dateStr) || [];
        list.push({
          id: `${session.id}-prop-sent`, session, type: 'proposal', status: 'held',
          label: session.company_name, milestoneKey: 'proposal_sent', typeLabel: 'Proposal',
        });
        map.set(dateStr, list);
      }

      // Custom meetings
      if (session.custom_meetings) {
        session.custom_meetings.forEach(cm => {
          if (!cm.date) return;
          const dateStr = cm.date.split('T')[0];
          const list = map.get(dateStr) || [];
          const isPast = new Date(cm.date) < new Date();
          list.push({
            id: `${session.id}-cm-${cm.id}`, session, type: 'custom',
            status: isPast ? 'held' : 'upcoming',
            label: session.company_name, milestoneKey: `custom_${cm.id}`, typeLabel: cm.title || cm.type,
          });
          map.set(dateStr, list);
        });
      }
    });

    // Merge Google Calendar events
    googleCalendarEvents.forEach(gEvent => {
      const dateStr = gEvent.start.split('T')[0];
      if (!dateStr) return;
      const isPast = new Date(gEvent.start) < new Date();
      const list = map.get(dateStr) || [];
      // Format attendee names for the label
      const externalNames = gEvent.externalAttendees?.slice(0, 2).map(a => a.name || a.email.split('@')[0]).join(', ') || '';
      list.push({
        id: `gcal-${gEvent.id}`,
        session: {} as DiscoverySession, // placeholder — not linked to a session
        type: 'google_calendar',
        status: isPast ? 'held' : 'upcoming',
        label: gEvent.title || 'Meeting',
        milestoneKey: `gcal_${gEvent.id}`,
        typeLabel: externalNames || 'Google Calendar',
        googleEvent: gEvent,
      });
      map.set(dateStr, list);
    });

    return map;
  }, [sessions, googleCalendarEvents]);

  // ── Stats ──
  const stats = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    let total = 0, held = 0, upcoming = 0;
    const byRep: Record<string, number> = {};
    const byType: Record<string, number> = {};

    eventsByDate.forEach((events, dateStr) => {
      const d = new Date(dateStr + 'T00:00:00');
      if (d.getFullYear() !== year || d.getMonth() !== month) return;
      events.forEach(ev => {
        total++;
        if (ev.status === 'held') held++;
        else upcoming++;
        const repId = ev.session.rep_id || 'unassigned';
        byRep[repId] = (byRep[repId] || 0) + 1;
        byType[ev.type] = (byType[ev.type] || 0) + 1;
      });
    });

    return { total, held, upcoming, byRep, byType };
  }, [eventsByDate, currentDate]);

  // ── Quick Log: filtered sessions for search ──
  const filteredSessions = useMemo(() => {
    if (!quickLogSearch.trim()) return sessions.slice(0, 8);
    const q = quickLogSearch.toLowerCase();
    return sessions.filter(s =>
      s.company_name.toLowerCase().includes(q) ||
      (s.champion_name && s.champion_name.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [sessions, quickLogSearch]);

  // ── Quick Log: submit ──
  const handleQuickLogSubmit = useCallback(() => {
    if (!quickLogSession || !selectedDate || !onLogMeeting) return;
    onLogMeeting(quickLogSession.id, selectedDate, quickLogType);
    // Reset form
    setQuickLogOpen(false);
    setQuickLogSession(null);
    setQuickLogSearch('');
    setQuickLogType('discovery');
  }, [quickLogSession, selectedDate, quickLogType, onLogMeeting]);

  // ── Mark as Held ──
  const handleMarkHeld = useCallback((ev: CalendarEvent) => {
    if (!onMarkHeld || !selectedDate) return;
    onMarkHeld(ev.session.id, ev.milestoneKey, selectedDate);
  }, [onMarkHeld, selectedDate]);

  // ── Drag & Drop ──
  const handleDragStart = useCallback((e: React.DragEvent, event: CalendarEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({
      sessionId: event.session.id,
      milestoneKey: event.milestoneKey,
      eventId: event.id,
    }));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(dateStr);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverDate(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    setDragOverDate(null);
    setDraggedEvent(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.sessionId && data.milestoneKey && onReschedule) {
        if (data.milestoneKey.startsWith('custom_')) return;
        onReschedule(data.sessionId, data.milestoneKey, targetDateStr);
      }
    } catch { /* ignore */ }
  }, [onReschedule]);

  // ── Calendar Grid Data ──
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const todayStr = localDateStr(new Date());

  // Month view grid
  const monthGrid = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const date = new Date(year, month - 1, d);
      cells.push({ day: d, dateStr: localDateStr(date), isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      cells.push({ day: i, dateStr: localDateStr(date), isCurrentMonth: true });
    }

    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const date = new Date(year, month + 1, i);
        cells.push({ day: i, dateStr: localDateStr(date), isCurrentMonth: false });
      }
    }

    return cells;
  }, [year, month]);

  // Week view grid
  const weekGrid = useMemo(() => {
    const monday = getMondayOfWeek(currentDate);
    const days: { day: number; dateStr: string; dayName: string; isToday: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push({
        day: d.getDate(),
        dateStr: localDateStr(d),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        isToday: localDateStr(d) === todayStr,
      });
    }
    return days;
  }, [currentDate, todayStr]);

  // Agenda events for selected date
  const agendaEvents = selectedDate ? eventsByDate.get(selectedDate) || [] : [];

  // Is selected date in the past or today?
  const isSelectedDatePastOrToday = selectedDate ? selectedDate <= todayStr : false;

  // Month header text
  const monthName = viewMode === 'month'
    ? currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    : (() => {
        const monday = getMondayOfWeek(currentDate);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${fmt(monday)} – ${fmt(sunday)}, ${sunday.getFullYear()}`;
      })();

  // ── Render Helpers ──

  const renderEventCard = (ev: CalendarEvent, compact: boolean = true) => {
    const stage = STAGE_COLORS[ev.session.deal_stage || 'qualifying'] || STAGE_COLORS.qualifying;
    const isHeld = ev.status === 'held';
    const dealVal = ev.session.deal_value;
    const rep = REP_PROFILES.find(r => r.id === ev.session.rep_id);
    const isDragging = draggedEvent?.id === ev.id;
    const canDrag = !!onReschedule && !ev.milestoneKey.startsWith('custom_');
    const canMarkHeld = !isHeld && !!onMarkHeld && !ev.milestoneKey.startsWith('custom_');

    if (compact) {
      return (
        <div
          key={ev.id}
          draggable={canDrag}
          onDragStart={canDrag ? (e) => handleDragStart(e, ev) : undefined}
          onClick={(e) => { e.stopPropagation(); if (ev.type !== 'google_calendar') onSelect(ev.session); }}
          className={`group relative rounded-lg px-2 py-1.5 text-[10px] font-semibold truncate cursor-pointer transition-all duration-200 border
            ${isDragging ? 'opacity-40 scale-95' : 'hover:shadow-md hover:-translate-y-0.5'}
            ${ev.type === 'google_calendar'
              ? 'bg-blue-50/80 border-blue-200/60'
              : isHeld ? 'bg-white/80 border-stone-200/60' : 'bg-white border-stone-200/60'
            }
          `}
          style={{ borderLeftWidth: '3px', borderLeftColor: ev.type === 'google_calendar' ? '#4285F4' : stage.color }}
        >
          <div className="flex items-center gap-1 truncate">
            {ev.type === 'google_calendar' ? (
              <Calendar size={9} className="text-blue-500 shrink-0" />
            ) : isHeld ? (
              <CheckCircle2 size={9} className="text-emerald-500 shrink-0" />
            ) : (
              <Clock size={9} className="text-stone-400 shrink-0" />
            )}
            <span className={`truncate ${ev.type === 'google_calendar' ? 'text-blue-800' : 'text-stone-800'}`}>{ev.label}</span>
          </div>
          <div className="flex items-center justify-between mt-0.5 ml-[13px]">
            <span className={`text-[8px] font-medium ${ev.type === 'google_calendar' ? 'text-blue-400' : 'text-stone-400'}`}>{ev.typeLabel}</span>
            <div className="flex items-center gap-1">
              {ev.type === 'google_calendar' && ev.googleEvent?.meetingLink && (
                <span className="text-[7px] font-bold text-blue-400">📹</span>
              )}
              {ev.type !== 'google_calendar' && dealVal > 0 && (
                <span className="text-[8px] font-bold text-stone-500">{fmtDealValue(dealVal)}</span>
              )}
              {ev.type !== 'google_calendar' && rep && (
                <div
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[6px] font-bold text-white shrink-0"
                  style={{ backgroundColor: rep.avatar_color }}
                >
                  {rep.initials}
                </div>
              )}
            </div>
          </div>
          {canDrag && (
            <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-40 transition-opacity">
              <Grip size={8} className="text-stone-400" />
            </div>
          )}
        </div>
      );
    }

    // Expanded card (for agenda panel)
    return (
      <motion.div
        key={ev.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="rounded-xl border border-stone-200 bg-white p-3 cursor-pointer hover:shadow-lg hover:border-stone-300 transition-all duration-200 group"
        style={{ borderLeftWidth: '4px', borderLeftColor: stage.color }}
      >
        <div className="flex items-start justify-between gap-2" onClick={() => onSelect(ev.session)}>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-stone-800 truncate">{ev.label}</p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white"
                style={{ backgroundColor: stage.color }}
              >
                {stage.short}
              </span>
              <span className="text-[10px] font-medium text-stone-500">{ev.typeLabel}</span>
              {isHeld ? (
                <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-600">
                  <CheckCircle2 size={10} /> Held
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-[10px] font-medium text-blue-500">
                  <Clock size={10} /> Scheduled
                </span>
              )}
            </div>
          </div>
          {dealVal > 0 && (
            <div className="flex items-center gap-0.5 rounded-lg bg-stone-100 px-2 py-1 text-[11px] font-bold text-stone-700 shrink-0">
              <DollarSign size={10} className="text-stone-400" />
              {fmtDealValue(dealVal)}
            </div>
          )}
        </div>

        {rep && (
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-stone-100" onClick={() => onSelect(ev.session)}>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
              style={{ backgroundColor: rep.avatar_color }}
            >
              {rep.initials}
            </div>
            <span className="text-[11px] font-medium text-stone-500">{rep.full_name}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => onSelect(ev.session)}>
            <Eye size={10} className="text-stone-400" />
            <span className="text-[9px] text-stone-400 font-medium">Open deal room</span>
          </div>
          <div className="flex items-center gap-1.5">
            {canMarkHeld && (
              <button
                onClick={(e) => { e.stopPropagation(); handleMarkHeld(ev); }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors text-[10px] font-bold"
              >
                <CheckCircle2 size={10} />
                Mark Held
              </button>
            )}
            {onLogNextSteps && ev.type !== 'google_calendar' && ev.status === 'held' && (
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  const dt = ev.milestoneKey.startsWith('custom_') 
                    ? ev.session.custom_meetings?.find(m => m.id === ev.milestoneKey.split('_')[1])?.date?.split('T')[0]
                    : new Date().toISOString().split('T')[0];
                  onLogNextSteps(ev.session, dt || new Date().toISOString().split('T')[0]); 
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors text-[10px] font-bold"
              >
                <Sparkles size={10} />
                Log Next Steps
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // ── Month View Cell ──
  const renderMonthCell = (cell: { day: number; dateStr: string; isCurrentMonth: boolean }, idx: number) => {
    const isToday = cell.dateStr === todayStr;
    const events = eventsByDate.get(cell.dateStr) || [];
    const isDropTarget = dragOverDate === cell.dateStr;
    const isSelected = selectedDate === cell.dateStr;
    const dayOfWeek = new Date(cell.dateStr + 'T00:00:00').getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const showWeekNum = dayOfWeek === 0;
    const weekNum = showWeekNum ? getISOWeekNumber(new Date(cell.dateStr + 'T00:00:00')) : null;

    return (
      <div
        key={idx}
        onClick={() => { if (cell.isCurrentMonth) setSelectedDate(cell.dateStr); }}
        onDragOver={(e) => handleDragOver(e, cell.dateStr)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, cell.dateStr)}
        className={`min-h-[110px] rounded-xl border p-2 flex flex-col transition-all duration-200 relative
          ${!cell.isCurrentMonth
            ? 'bg-stone-50/30 border-stone-100/50 opacity-40'
            : isDropTarget
              ? 'bg-blue-50/50 border-blue-300 ring-2 ring-blue-200 scale-[1.02]'
              : isSelected
                ? 'bg-indigo-50/30 border-indigo-200 ring-1 ring-indigo-100'
                : isToday
                  ? 'bg-gradient-to-br from-blue-50/40 to-indigo-50/30 border-blue-200 ring-1 ring-blue-100'
                  : isWeekend
                    ? 'bg-stone-50/40 border-stone-100 opacity-70'
                    : 'bg-white border-stone-200/60 hover:border-stone-300 hover:shadow-sm'
          }
          ${cell.isCurrentMonth ? 'cursor-pointer' : ''}
        `}
      >
        {showWeekNum && weekNum && cell.isCurrentMonth && (
          <div className="absolute -left-7 top-2 text-[8px] font-bold text-stone-300 tabular-nums">
            W{weekNum}
          </div>
        )}

        <div className="flex justify-between items-start mb-1.5">
          <div className="flex items-center gap-1">
            <span className={`text-[11px] font-bold flex items-center justify-center w-6 h-6 rounded-full transition-all
              ${isToday
                ? 'bg-blue-500 text-white shadow-sm shadow-blue-200'
                : cell.isCurrentMonth
                  ? 'text-stone-700'
                  : 'text-stone-300'
              }
            `}>
              {cell.day}
            </span>
            {isToday && (
              <span className="text-[8px] font-bold text-blue-500 uppercase tracking-wider">Today</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {events.length > 0 && (
              <span className="text-[9px] font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-full tabular-nums">
                {events.length}
              </span>
            )}
            {/* Quick-add hint on hover for empty cells */}
            {events.length === 0 && cell.isCurrentMonth && onLogMeeting && (
              <div className="opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity">
                <Plus size={12} className="text-stone-300 hover:text-stone-500" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar">
          {events.slice(0, 3).map(ev => renderEventCard(ev, true))}
          {events.length > 3 && (
            <div className="text-[9px] font-bold text-stone-400 text-center py-0.5">
              +{events.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Week View Column ──
  const renderWeekColumn = (day: { day: number; dateStr: string; dayName: string; isToday: boolean }) => {
    const events = eventsByDate.get(day.dateStr) || [];
    const isDropTarget = dragOverDate === day.dateStr;
    const dayOfWeek = new Date(day.dateStr + 'T00:00:00').getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    return (
      <div
        key={day.dateStr}
        onClick={() => setSelectedDate(day.dateStr)}
        onDragOver={(e) => handleDragOver(e, day.dateStr)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, day.dateStr)}
        className={`flex-1 min-w-0 flex flex-col rounded-xl border transition-all duration-200 cursor-pointer
          ${isDropTarget
            ? 'bg-blue-50/50 border-blue-300 ring-2 ring-blue-200'
            : day.isToday
              ? 'bg-gradient-to-b from-blue-50/40 to-indigo-50/20 border-blue-200'
              : isWeekend
                ? 'bg-stone-50/40 border-stone-100 opacity-70'
                : 'bg-white border-stone-200/60'
          }
        `}
      >
        <div className={`px-3 py-2.5 border-b text-center
          ${day.isToday ? 'border-blue-200/60' : 'border-stone-100/60'}
        `}>
          <div className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-0.5">
            {day.dayName}
          </div>
          <div className={`text-lg font-bold leading-none
            ${day.isToday ? 'text-blue-600' : 'text-stone-800'}
          `}>
            {day.day}
          </div>
          {day.isToday && (
            <div className="flex items-center justify-center gap-1 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[8px] font-bold text-blue-500 uppercase">Today</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 no-scrollbar">
          {events.length === 0 && (
            <div className="flex items-center justify-center h-full text-stone-200">
              <Calendar size={16} className="opacity-30" />
            </div>
          )}
          {events.map(ev => renderEventCard(ev, true))}
        </div>

        {events.length > 0 && (
          <div className="px-2 py-1.5 border-t border-stone-100/60 text-center">
            <span className="text-[9px] font-bold text-stone-400">
              {events.length} meeting{events.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    );
  };

  // ── Quick Log Form (inline in sidebar) ──
  const renderQuickLogForm = () => {
    if (!selectedDate || !onLogMeeting) return null;

    return (
      <div className="border-b border-stone-100">
        {!quickLogOpen ? (
          <button
            onClick={() => setQuickLogOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-[11px] font-bold text-stone-500 hover:text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <Plus size={12} />
            Log Meeting
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-2.5 bg-stone-50/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Quick Log</span>
                <button
                  onClick={() => { setQuickLogOpen(false); setQuickLogSession(null); setQuickLogSearch(''); }}
                  className="w-5 h-5 rounded-md hover:bg-stone-200/60 flex items-center justify-center text-stone-400 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>

              {/* Account search */}
              <div className="relative">
                <div className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5">
                  <Search size={11} className="text-stone-400 shrink-0" />
                  {quickLogSession ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <span className="text-[11px] font-bold text-stone-800 truncate">{quickLogSession.company_name}</span>
                      <button
                        onClick={() => { setQuickLogSession(null); setQuickLogSearch(''); }}
                        className="shrink-0 w-4 h-4 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                      >
                        <X size={8} className="text-stone-500" />
                      </button>
                    </div>
                  ) : (
                    <input
                      ref={searchRef}
                      type="text"
                      value={quickLogSearch}
                      onChange={(e) => { setQuickLogSearch(e.target.value); setQuickLogShowResults(true); }}
                      onFocus={() => setQuickLogShowResults(true)}
                      placeholder="Search account..."
                      className="flex-1 bg-transparent text-[11px] text-stone-800 placeholder:text-stone-300 focus:outline-none font-medium"
                    />
                  )}
                </div>

                {/* Search results dropdown */}
                {quickLogShowResults && !quickLogSession && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-stone-200 bg-white shadow-lg z-50 max-h-[200px] overflow-y-auto">
                    {filteredSessions.length === 0 ? (
                      <div className="px-3 py-2 text-[10px] text-stone-400 font-medium">No accounts found</div>
                    ) : (
                      filteredSessions.map(s => {
                        const stage = STAGE_COLORS[s.deal_stage || 'qualifying'] || STAGE_COLORS.qualifying;
                        const rep = REP_PROFILES.find(r => r.id === s.rep_id);
                        return (
                          <button
                            key={s.id}
                            onClick={() => {
                              setQuickLogSession(s);
                              setQuickLogSearch('');
                              setQuickLogShowResults(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-stone-50 transition-colors text-left"
                          >
                            <div className="w-1.5 h-full rounded-full shrink-0" style={{ backgroundColor: stage.color }}>
                              <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: stage.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-stone-800 truncate">{s.company_name}</p>
                              <p className="text-[9px] font-medium text-stone-400">{stage.label}</p>
                            </div>
                            {s.deal_value > 0 && (
                              <span className="text-[9px] font-bold text-stone-500">{fmtDealValue(s.deal_value)}</span>
                            )}
                            {rep && (
                              <div
                                className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white shrink-0"
                                style={{ backgroundColor: rep.avatar_color }}
                              >
                                {rep.initials}
                              </div>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Meeting type */}
              <select
                value={quickLogType}
                onChange={(e) => setQuickLogType(e.target.value as MeetingType)}
                className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-stone-800 focus:outline-none focus:border-stone-400 transition-colors"
              >
                {MEETING_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.emoji} {opt.label}</option>
                ))}
              </select>

              {/* Status indicator + Submit */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {isSelectedDatePastOrToday ? (
                    <>
                      <CheckCircle2 size={10} className="text-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-600">Held</span>
                    </>
                  ) : (
                    <>
                      <Clock size={10} className="text-blue-500" />
                      <span className="text-[10px] font-bold text-blue-600">Scheduled</span>
                    </>
                  )}
                </div>
                <button
                  onClick={handleQuickLogSubmit}
                  disabled={!quickLogSession}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all
                    ${quickLogSession
                      ? 'bg-stone-800 text-white hover:bg-stone-700 shadow-sm'
                      : 'bg-stone-100 text-stone-300 cursor-not-allowed'
                    }
                  `}
                >
                  <Check size={10} />
                  Log
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-stone-50/30 relative">
      {/* ── Header ── */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-stone-200/60 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-sm shadow-emerald-200">
            <Calendar size={16} />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-stone-800 leading-tight">{monthName}</h2>
            <p className="text-[10px] text-stone-400 font-semibold tracking-wide uppercase">Pipeline Meetings</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-stone-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('month')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all
                ${viewMode === 'month' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'}
              `}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all
                ${viewMode === 'week' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'}
              `}
            >
              Week
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={handlePrev}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-500 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-[10px] font-bold text-stone-500 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-500 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="shrink-0 border-b border-stone-100 bg-white/80 backdrop-blur-sm"
      >
        <div className="flex items-center gap-4 px-5 py-2">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-stone-100 flex items-center justify-center">
              <BarChart3 size={10} className="text-stone-500" />
            </div>
            <div>
              <div className="text-[14px] font-bold text-stone-800 tabular-nums leading-none">{stats.total}</div>
              <div className="text-[8px] font-semibold text-stone-400 uppercase">Total</div>
            </div>
          </div>

          <div className="h-6 w-px bg-stone-200" />

          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={10} className="text-emerald-500" />
            </div>
            <div>
              <div className="text-[14px] font-bold text-emerald-600 tabular-nums leading-none">{stats.held}</div>
              <div className="text-[8px] font-semibold text-stone-400 uppercase">Held</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center">
              <Clock size={10} className="text-blue-500" />
            </div>
            <div>
              <div className="text-[14px] font-bold text-blue-600 tabular-nums leading-none">{stats.upcoming}</div>
              <div className="text-[8px] font-semibold text-stone-400 uppercase">Scheduled</div>
            </div>
          </div>

          <div className="h-6 w-px bg-stone-200" />

          <div className="flex items-center gap-2">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  type === 'discovery' ? 'bg-sky-400' :
                  type === 'demo' ? 'bg-violet-400' :
                  type === 'proposal' ? 'bg-orange-400' :
                  'bg-stone-400'
                }`} />
                <span className="text-[10px] font-medium text-stone-500 capitalize">{type}</span>
                <span className="text-[10px] font-bold text-stone-700 tabular-nums">{count}</span>
              </div>
            ))}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-1">
            <Users size={10} className="text-stone-400" />
            <div className="flex items-center -space-x-1">
              {Object.entries(stats.byRep).slice(0, 6).map(([repId, count]) => {
                const rep = REP_PROFILES.find(r => r.id === repId);
                if (!rep) return null;
                return (
                  <div
                    key={repId}
                    className="relative w-6 h-6 rounded-full flex items-center justify-center text-[7px] font-bold text-white border-2 border-white"
                    style={{ backgroundColor: rep.avatar_color }}
                    title={`${rep.full_name}: ${count}`}
                  >
                    {rep.initials}
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-stone-800 text-[6px] text-white flex items-center justify-center font-bold border border-white">
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Calendar Grid ── */}
      <div className="flex-1 overflow-hidden flex">
        <div className={`flex-1 overflow-y-auto p-4 ${selectedDate ? 'pr-2' : ''}`}>
          {viewMode === 'month' ? (
            <div className="grid grid-cols-7 gap-2 pl-8">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-stone-400 pb-2">
                  {day}
                </div>
              ))}
              {monthGrid.map((cell, idx) => renderMonthCell(cell, idx))}
            </div>
          ) : (
            <div className="flex gap-2 h-full">
              {weekGrid.map(day => renderWeekColumn(day))}
            </div>
          )}
        </div>

        {/* ── Agenda Sidebar ── */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              ref={agendaRef}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="shrink-0 border-l border-stone-200/60 bg-white overflow-hidden flex flex-col"
            >
              <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h3 className="text-[13px] font-bold text-stone-800">
                    {fmtShortDate(selectedDate)}
                  </h3>
                  <p className="text-[10px] font-medium text-stone-400">
                    {agendaEvents.length} meeting{agendaEvents.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedDate(null); setQuickLogOpen(false); setQuickLogSession(null); setQuickLogSearch(''); }}
                  className="w-6 h-6 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Quick Log Form */}
              {renderQuickLogForm()}

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {agendaEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-stone-300">
                    <Calendar size={24} className="mb-2 opacity-30" />
                    <p className="text-[11px] font-medium">No meetings</p>
                    {onLogMeeting && !quickLogOpen && (
                      <button
                        onClick={() => setQuickLogOpen(true)}
                        className="mt-2 flex items-center gap-1 text-[10px] font-bold text-stone-400 hover:text-stone-600 transition-colors"
                      >
                        <Plus size={10} />
                        Log a meeting for this day
                      </button>
                    )}
                  </div>
                ) : (
                  agendaEvents.map(ev => renderEventCard(ev, false))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
