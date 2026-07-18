import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Copy, Check, CalendarDays, History, Sparkles, Loader2, ChevronDown, Clock, Users, Plus } from 'lucide-react';
import type { DiscoverySession } from '../../lib/discoveryDatabase';
import { fetchRecentNotes, fetchNoteDetails, extractNextStepsFromMarkdown, type GranolaApiNote } from '../../lib/granolaClient';
import { extractNextStepsFromTranscript, getOpenAIKey } from '../../lib/granolaLLMExtractor';
import { DealTimeline } from './DealTimeline';
import { useToast } from '../ui/Toast';

interface PipelineUpdateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  session: DiscoverySession;
  onSessionChange: (s: DiscoverySession) => void;
  initialDate?: string;
  autoTrigger?: boolean;
}

// ── Contact types ──

interface Contact {
  name: string;
  email: string;
  title?: string; // editable by AE
}

// ── History Parsing ──

interface LogEntry {
  timestamp: string;
  who: string;
  what: string;
  when: string;
  raw: string;
}

function parseLogEntries(log: string): LogEntry[] {
  if (!log.trim()) return [];
  const blocks = log.split(/\n\n(?=\[)/).filter(b => b.trim());
  return blocks.map(block => {
    const lines = block.split('\n');
    const timestamp = (lines[0] || '').replace(/^\[|\]$/g, '').trim();
    let who = '', what = '', when = '';
    for (const line of lines.slice(1)) {
      if (line.toLowerCase().startsWith('who:')) who = line.replace(/^who:/i, '').trim();
      else if (line.toLowerCase().startsWith('what:')) what = line.replace(/^what:/i, '').trim();
      else if (line.toLowerCase().startsWith('when:')) when = line.replace(/^when:/i, '').trim();
    }
    return { timestamp, who, what, when, raw: block };
  });
}

// ── History Card ──

function HistoryCard({ entry, onCopy, copied }: { entry: LogEntry; onCopy: (raw: string) => void; copied: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-stone-200 rounded-xl bg-white overflow-hidden"
    >
      <div className="flex items-center justify-between px-3 py-2 bg-stone-50 border-b border-stone-100">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-500">
          <Clock size={11} className="text-stone-400" />
          {entry.timestamp}
        </div>
        <button
          onClick={() => onCopy(entry.raw)}
          className="flex items-center gap-1 text-[10px] font-semibold text-stone-400 hover:text-violet-600 transition-colors"
          title="Copy this entry for Salesforce"
        >
          {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="px-3 py-2.5 space-y-1.5">
        {entry.who && (
          <div className="flex gap-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide w-10 shrink-0 mt-px">Who</span>
            <span className="text-[12px] text-stone-700">{entry.who}</span>
          </div>
        )}
        {entry.what && (
          <div className="flex gap-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide w-10 shrink-0 mt-px">What</span>
            <span className="text-[12px] text-stone-700">{entry.what}</span>
          </div>
        )}
        {entry.when && (
          <div className="flex gap-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide w-10 shrink-0 mt-px">When</span>
            <span className="text-[12px] text-stone-700">{entry.when}</span>
          </div>
        )}
        {!entry.who && !entry.what && !entry.when && (
          <p className="text-[12px] text-stone-500 italic">{entry.raw.split('\n').slice(1).join(' ')}</p>
        )}
      </div>
    </motion.div>
  );
}

// ── Contact Pill ──

function ContactPill({ contact, selected, onToggle, onTitleChange }: {
  contact: Contact;
  selected: boolean;
  onToggle: () => void;
  onTitleChange: (title: string) => void;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTitle && titleRef.current) titleRef.current.focus();
  }, [editingTitle]);

  return (
    <div className={`group flex items-center gap-1.5 rounded-full border text-[11px] font-medium transition-all cursor-pointer
      ${selected
        ? 'bg-violet-50 border-violet-300 text-violet-800'
        : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50'
      }`}
    >
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 pl-2.5 py-1.5"
      >
        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold
          ${selected ? 'bg-violet-500 text-white' : 'bg-stone-200 text-stone-500'}`}
        >
          {contact.name.charAt(0).toUpperCase()}
        </div>
        <span>{contact.name}</span>
      </button>

      {/* Title input — shown when selected */}
      {selected && (
        editingTitle ? (
          <input
            ref={titleRef}
            value={contact.title || ''}
            onChange={e => onTitleChange(e.target.value)}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)}
            placeholder="Add title..."
            className="w-28 text-[11px] bg-transparent border-none outline-none text-violet-600 placeholder:text-violet-300"
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="text-[10px] text-violet-500 hover:text-violet-700 pr-2"
            title="Add/edit title"
          >
            {contact.title ? contact.title : <span className="opacity-50 italic">+ title</span>}
          </button>
        )
      )}

      {!selected && <span className="pr-2.5" />}
    </div>
  );
}

// ── Helpers ──

function extractContactsFromNote(note: GranolaApiNote): Contact[] {
  const seen = new Set<string>();
  const contacts: Contact[] = [];

  // From attendees
  for (const a of (note.attendees || [])) {
    if (!a.email || a.email.toLowerCase().includes('servicealignment.com')) continue;
    if (seen.has(a.email.toLowerCase())) continue;
    seen.add(a.email.toLowerCase());
    contacts.push({ name: a.name || a.email.split('@')[0], email: a.email });
  }

  // From calendar invitees (email only)
  for (const inv of (note.calendar_event?.invitees || [])) {
    if (!inv.email || inv.email.toLowerCase().includes('servicealignment.com')) continue;
    if (seen.has(inv.email.toLowerCase())) continue;
    seen.add(inv.email.toLowerCase());
    const name = inv.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    contacts.push({ name, email: inv.email });
  }

  return contacts;
}

// ── Main Component ──

export function PipelineUpdateDrawer({ isOpen, onClose, session, onSessionChange, initialDate, autoTrigger }: PipelineUpdateDrawerProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEntry, setCopiedEntry] = useState<number | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const todayStr = () => new Date().toISOString().split('T')[0];
  const [callDate, setCallDate] = useState(initialDate || todayStr());
  const { toast } = useToast();
  const autoTriggeredRef = useRef(false);

  // Contact picker state
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsLoaded, setContactsLoaded] = useState(false);

  const sfOpportunityId = (session as any).sf_opportunity_id || '006Vg00000XY3q5IAD';
  const sfUrl = `https://servicealignment.lightning.force.com/lightning/r/Opportunity/${sfOpportunityId}/view`;

  // Load contacts from latest Granola note when drawer opens
  useEffect(() => {
    if (!isOpen || contactsLoaded) return;
    const load = async () => {
      try {
        setContactsLoading(true);
        const notes = await fetchRecentNotes(10);
        // Find the most recent note matching this company
        const companyName = session.company_name || '';
        let targetNote: GranolaApiNote | undefined;
        if (companyName) {
          const { noteMatchesCompany } = await import('../../lib/granolaClient');
          targetNote = notes.find(n => noteMatchesCompany(n, companyName)) || notes[0];
        } else {
          targetNote = notes[0];
        }
        if (targetNote) {
          const contacts = extractContactsFromNote(targetNote);
          setAvailableContacts(contacts);
        }
      } catch {
        // silently fail — contacts are optional
      } finally {
        setContactsLoading(false);
        setContactsLoaded(true);
      }
    };
    load();
  }, [isOpen, contactsLoaded, session.company_name]);

  // Reset when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setContactsLoaded(false);
      setSelectedContacts([]);
    }
  }, [isOpen]);

  // Build the "Who" string from selected contacts + any manual text
  const whoFromContacts = useMemo(() => {
    if (selectedContacts.length === 0) return '';
    return selectedContacts
      .map(c => c.title ? `${c.name}, ${c.title}` : c.name)
      .join(' · ');
  }, [selectedContacts]);

  // Sync selected contacts → who field
  useEffect(() => {
    if (selectedContacts.length > 0) {
      onSessionChange({ ...session, next_steps_who: whoFromContacts });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whoFromContacts]);

  const handleToggleContact = (contact: Contact) => {
    setSelectedContacts(prev => {
      const exists = prev.find(c => c.email === contact.email);
      if (exists) return prev.filter(c => c.email !== contact.email);
      return [...prev, { ...contact }];
    });
  };

  const handleTitleChange = (email: string, title: string) => {
    setAvailableContacts(prev => prev.map(c => c.email === email ? { ...c, title } : c));
    setSelectedContacts(prev => prev.map(c => c.email === email ? { ...c, title } : c));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sfUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAutoFill = async () => {
    setIsExtracting(true);
    try {
      const notes = await fetchRecentNotes();
      if (!notes || notes.length === 0) {
        toast('No recent Granola notes found.', 'error');
        return;
      }

      const latestNoteMeta = notes[0];
      const latestNote = await fetchNoteDetails(latestNoteMeta.id);

      // Pre-fill call date from meeting date if available
      if (latestNote.created_at) {
        setCallDate(new Date(latestNote.created_at).toISOString().split('T')[0]);
      }

      // Load contacts from this note
      const contacts = extractContactsFromNote(latestNote);
      if (contacts.length > 0) {
        setAvailableContacts(contacts);
        setContactsLoaded(true);
      }

      // Try OpenAI first if key exists
      let extracted = { who: '', what: '', when: '' };
      
      if (getOpenAIKey()) {
        try {
          extracted = await extractNextStepsFromTranscript(latestNote.summary_markdown || '', latestNote.transcript || '');
        } catch (e) {
          // Fallback to markdown if OpenAI fails (e.g. invalid key)
          extracted = extractNextStepsFromMarkdown(latestNote.summary_markdown || '');
        }
      } else {
        // Fallback to free markdown parsing
        extracted = extractNextStepsFromMarkdown(latestNote.summary_markdown || '');
      }

      if (!extracted.who && !extracted.what && !extracted.when) {
        toast(getOpenAIKey() ? 'No clear next steps found in the transcript.' : 'No "Next Steps" recipe output found. Run the Salesforce recipe in Granola first, or add an OpenAI key.', 'error');
        return;
      }

      // Try to match extracted "who" text to a contact
      if (extracted.who) {
        const lowerWho = extracted.who.toLowerCase();
        const matchedContacts = contacts.filter(c =>
          lowerWho.includes(c.name.toLowerCase().split(' ')[0])
        );
        if (matchedContacts.length > 0) {
          setSelectedContacts(matchedContacts);
        }
      }

      onSessionChange({
        ...session,
        next_steps_who: extracted.who || session.next_steps_who,
        next_steps_what: extracted.what || session.next_steps_what,
        next_steps_when: extracted.when || session.next_steps_when,
      });
      toast('Next steps extracted from Granola!', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to extract next steps.', 'error');
    } finally {
      setIsExtracting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (initialDate) setCallDate(initialDate);
      if (autoTrigger && !autoTriggeredRef.current) {
        autoTriggeredRef.current = true;
        handleAutoFill();
      }
    } else {
      autoTriggeredRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, autoTrigger, initialDate]);

  const handleArchive = () => {
    const who = session.next_steps_who?.trim();
    const what = session.next_steps_what?.trim();
    const when = session.next_steps_when || session.next_meeting_date;

    if (!who && !what && !when) {
      toast('Fill in at least one field before saving to history.', 'error');
      return;
    }

    const callDateObj = callDate ? new Date(callDate + 'T12:00:00') : new Date();
    const dateLabel = callDateObj.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
    const savedAt = new Date().toLocaleString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true,
    });

    const lines: string[] = [`[${dateLabel} — logged ${savedAt}]`];
    if (who) lines.push(`Who: ${who}`);
    if (what) lines.push(`What: ${what}`);
    if (when) lines.push(`When: ${when}`);

    const newLogEntry = lines.join('\n');
    const currentLog = session.most_recent_update || '';
    const updatedLog = currentLog ? `${newLogEntry}\n\n${currentLog}` : newLogEntry;

    onSessionChange({
      ...session,
      next_steps_who: '',
      next_steps_what: '',
      next_steps_when: '',
      next_meeting_date: undefined,
      most_recent_update: updatedLog
    });
    setCallDate(todayStr());
    setSelectedContacts([]);
    toast('Saved to history! Fields cleared for next call.', 'success');
  };

  const logEntries = useMemo(
    () => parseLogEntries(session.most_recent_update || ''),
    [session.most_recent_update]
  );

  const handleCopyEntry = (raw: string, idx: number) => {
    navigator.clipboard.writeText(raw);
    setCopiedEntry(idx);
    setTimeout(() => setCopiedEntry(null), 2000);
  };

  const hasActiveNextSteps =
    session.next_steps_who || session.next_steps_what || session.next_steps_when || session.next_meeting_date;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-[480px] bg-white shadow-2xl z-50 flex flex-col border-l border-stone-200"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                  <CalendarDays size={16} className="stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-stone-800 leading-tight">Pipeline Update</h2>
                  <p className="text-[11px] text-stone-500 font-medium">Salesforce Sync & Next Steps</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-7">

              {/* Salesforce Link */}
              <div>
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <img src="https://cdn.iconscout.com/icon/free/png-256/free-salesforce-282298.png" alt="Salesforce" className="w-4 h-4 object-contain opacity-80" />
                  Salesforce Record
                </h3>
                <div className="flex items-center gap-2">
                  <a
                    href={sfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#00a1e0] hover:bg-[#0090c9] text-white py-2.5 rounded-lg text-[13px] font-semibold transition-colors shadow-sm"
                  >
                    <ExternalLink size={14} />
                    Open Opportunity in Salesforce
                  </a>
                  <button
                    onClick={handleCopyLink}
                    className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors"
                    title="Copy Link"
                  >
                    {copiedLink ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="h-px bg-stone-100" />

              {/* Active Next Steps */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Active Next Steps</h3>
                    <p className="text-[11px] text-stone-400 mt-0.5">What you're working toward right now</p>
                  </div>
                  <button
                    onClick={handleAutoFill}
                    disabled={isExtracting}
                    className="text-[11px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
                    title="Pull next steps from your latest Granola note (requires Salesforce recipe)"
                  >
                    {isExtracting ? <Loader2 size={12} className="animate-spin stroke-[3]" /> : <Sparkles size={12} className="stroke-[3]" />}
                    Auto-fill from Granola
                  </button>
                </div>

                {/* Call Date */}
                <div className="mb-4">
                  <label className="block text-[10px] font-semibold text-stone-500 mb-1 uppercase tracking-wider">Date of Call</label>
                  <input
                    type="date"
                    value={callDate}
                    onChange={e => setCallDate(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-[13px] text-stone-700 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">When did this meeting take place?</p>
                </div>

                {/* Who — Contact Picker */}
                <div className="mb-3">
                  <label className="block text-[10px] font-semibold text-stone-500 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={11} />
                    Who — Select contact(s)
                  </label>

                  {/* Contact pills from Granola */}
                  {contactsLoading && (
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mb-2">
                      <Loader2 size={11} className="animate-spin" />
                      Loading meeting attendees...
                    </div>
                  )}

                  {!contactsLoading && availableContacts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {availableContacts.map(contact => (
                        <ContactPill
                          key={contact.email}
                          contact={selectedContacts.find(c => c.email === contact.email) || contact}
                          selected={!!selectedContacts.find(c => c.email === contact.email)}
                          onToggle={() => handleToggleContact(contact)}
                          onTitleChange={(title) => handleTitleChange(contact.email, title)}
                        />
                      ))}
                    </div>
                  )}

                  {!contactsLoading && availableContacts.length === 0 && contactsLoaded && (
                    <p className="text-[11px] text-stone-400 mb-2 italic">No external contacts found from recent notes.</p>
                  )}

                  {/* Manual override text field */}
                  <input
                    type="text"
                    value={session.next_steps_who || ''}
                    onChange={e => {
                      setSelectedContacts([]); // clear pill selection if typing manually
                      onSessionChange({ ...session, next_steps_who: e.target.value });
                    }}
                    placeholder={selectedContacts.length > 0 ? whoFromContacts : 'Or type a name manually...'}
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-[13px] text-stone-700 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-stone-300"
                  />
                  {selectedContacts.length > 0 && (
                    <p className="text-[10px] text-violet-500 mt-1">
                      ✓ {selectedContacts.map(c => c.title ? `${c.name}, ${c.title}` : c.name).join(' · ')}
                    </p>
                  )}
                </div>

                {/* What */}
                <div className="mb-3">
                  <label className="block text-[10px] font-semibold text-stone-500 mb-1 uppercase tracking-wider">What — Action details</label>
                  <input
                    type="text"
                    value={session.next_steps_what || ''}
                    onChange={e => onSessionChange({ ...session, next_steps_what: e.target.value })}
                    placeholder="Scheduled call? F/U date? Owe them something?"
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-[13px] text-stone-700 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-stone-300"
                  />
                </div>

                {/* When */}
                <div className="mb-4">
                  <label className="block text-[10px] font-semibold text-stone-500 mb-1 uppercase tracking-wider">When — Date/Time</label>
                  <input
                    type="text"
                    value={session.next_steps_when || session.next_meeting_date || ''}
                    onChange={e => onSessionChange({ ...session, next_steps_when: e.target.value })}
                    placeholder="mm/dd/yyyy, --:-- --"
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-[13px] text-stone-700 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-stone-300"
                  />
                </div>

                {/* Save CTA */}
                <button
                  onClick={handleArchive}
                  disabled={!hasActiveNextSteps}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold transition-colors bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed text-white shadow-sm"
                >
                  <ChevronDown size={15} className="stroke-[2.5]" />
                  Save to History & Clear Fields
                </button>
                <p className="text-[10px] text-stone-400 text-center mt-1.5">
                  Moves these next steps into the history log below. Fields will be cleared for the next call.
                </p>
              </div>

              <div className="h-px bg-stone-100" />

              {/* History */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <History size={14} className="text-stone-400" />
                    <div>
                      <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Next Steps History</h3>
                      <p className="text-[11px] text-stone-400 mt-0.5">Copy any entry to paste into Salesforce "Most Recent Update"</p>
                    </div>
                  </div>
                  {logEntries.length > 0 && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(session.bap_notes?.['most_recent_update'] || '');
                        toast('Full history copied!', 'success');
                      }}
                      className="text-[10px] font-semibold text-stone-400 hover:text-violet-600 flex items-center gap-1 transition-colors"
                    >
                      <Copy size={11} /> Copy All
                    </button>
                  )}
                </div>

                {logEntries.length === 0 ? (
                  <div className="border border-dashed border-stone-200 rounded-xl p-5 text-center">
                    <History size={20} className="text-stone-300 mx-auto mb-2" />
                    <p className="text-[12px] text-stone-400">No history yet.</p>
                    <p className="text-[11px] text-stone-300 mt-0.5">Fill in next steps above and click "Save to History".</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {logEntries.map((entry, idx) => (
                      <HistoryCard
                        key={idx}
                        entry={entry}
                        onCopy={(raw) => handleCopyEntry(raw, idx)}
                        copied={copiedEntry === idx}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="h-px bg-stone-200/60 w-full my-8" />
              
              <div className="px-2">
                <DealTimeline 
                  session={session} 
                  onSessionUpdate={(field, value) => onSessionChange({ ...session, [field]: value })} 
                />
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
