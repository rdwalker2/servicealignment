import React, { useState, useEffect } from 'react';
import { RefreshCw, FileText, CheckCircle2, ChevronRight, X, Briefcase } from 'lucide-react';
import { fetchRecentNotes, fetchNoteDetails, type GranolaApiNote } from '../../lib/granolaClient';
import { getAllSessions, addGranolaNoteToSession, updateSessionFromGranola, computeBAPAnswers, type DiscoverySession } from '../../lib/discoveryDatabase';
import { parseGranolaSummary } from '../../lib/granolaParser';
import { extractMEDDPICCFromSummary } from '../../lib/granolaClient';
import { analyzeTranscript } from '../../lib/transcriptAnalysis';
import { useToast } from '../ui/Toast';

export function GranolaSyncHub({ onClose }: { onClose: () => void }) {
  const [notes, setNotes] = useState<GranolaApiNote[]>([]);
  const [sessions, setSessions] = useState<DiscoverySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [syncedIds, setSyncedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const allSessions = getAllSessions().filter(s => s.status !== 'closed_won' && s.status !== 'closed_lost');
      setSessions(allSessions);
      const recentNotes = await fetchRecentNotes(50);
      setNotes(recentNotes);
    } catch (err) {
      console.error('Failed to load Granola notes:', err);
      toast('Failed to connect to Granola API. Check your key in Settings.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function getSuggestedSession(note: GranolaApiNote): DiscoverySession | null {
    // 1. Check if it's already attached to ANY session
    for (const session of sessions) {
      if (session.granola_notes?.some(n => n.id === note.id)) {
        return session; // It's already synced to this session
      }
    }

    // 2. Try to match by title
    for (const session of sessions) {
      if (note.title.toLowerCase().includes(session.company_name.toLowerCase())) {
        return session;
      }
    }

    // 3. Try to match by domain
    for (const session of sessions) {
      const companyNameLower = session.company_name.toLowerCase().replace(/\s+/g, '');
      if (note.attendees) {
        for (const attendee of note.attendees) {
          if (attendee.email && attendee.email.toLowerCase().includes(companyNameLower)) {
            return session;
          }
        }
      }
    }

    return null;
  }

  const handleSync = async (note: GranolaApiNote, session: DiscoverySession) => {
    if (syncingIds.has(note.id) || syncedIds.has(note.id)) return;
    
    setSyncingIds(prev => new Set(prev).add(note.id));
    
    try {
      const details = await fetchNoteDetails(note.id);
      
      const newNote = {
        id: details.id,
        url: details.url || `https://granola.ai/notes/${details.id}`,
        title: details.title,
        date: details.start_time || details.created_at,
        summary: details.summary || details.notes || '',
        transcript: details.transcript || '',
        attendees: (details.attendees || []).map(a => a.name || a.email)
      };

      if (newNote.transcript) {
        const existingBap = computeBAPAnswers(session);
        (newNote as any).transcript_analysis = await analyzeTranscript(newNote.transcript, existingBap);
      }

      addGranolaNoteToSession(session.id, newNote);

      const combinedText = `${details.summary || details.notes || ''}\n${details.transcript || ''}`;
      const regexUpdates = parseGranolaSummary(combinedText);
      
      if (Object.keys(regexUpdates).length > 0) {
        updateSessionFromGranola(session.id, regexUpdates);
      }

      const summaryMarkdown = details.summary_markdown || details.summary || details.notes || '';
      if (summaryMarkdown) {
        const meddpiccExtraction = extractMEDDPICCFromSummary(summaryMarkdown, details.attendees);
        const meddpiccUpdates: Partial<DiscoverySession> = {};

        if (meddpiccExtraction.metrics) meddpiccUpdates.success_metrics_text = meddpiccExtraction.metrics;
        if (meddpiccExtraction.economic_buyer) meddpiccUpdates.economic_buyer_access = meddpiccExtraction.economic_buyer;
        if (meddpiccExtraction.decision_criteria) meddpiccUpdates.decision_criteria = meddpiccExtraction.decision_criteria;
        if (meddpiccExtraction.decision_process) meddpiccUpdates.decision_process = meddpiccExtraction.decision_process;
        if (meddpiccExtraction.paper_process) meddpiccUpdates.paper_process = meddpiccExtraction.paper_process;
        if (meddpiccExtraction.identify_pain) meddpiccUpdates.pain_narrative = meddpiccExtraction.identify_pain;
        if (meddpiccExtraction.champion) meddpiccUpdates.champion_name = meddpiccExtraction.champion;
        if (meddpiccExtraction.competition) meddpiccUpdates.competitive_situation = meddpiccExtraction.competition;
        
        if ((meddpiccExtraction as any).next_steps_who) meddpiccUpdates.next_steps_who = (meddpiccExtraction as any).next_steps_who;
        if ((meddpiccExtraction as any).next_steps_what) meddpiccUpdates.next_steps_what = (meddpiccExtraction as any).next_steps_what;
        if ((meddpiccExtraction as any).next_steps_when) meddpiccUpdates.next_steps_when = (meddpiccExtraction as any).next_steps_when;
        if (meddpiccExtraction.next_steps) meddpiccUpdates.next_action = meddpiccExtraction.next_steps;

        if (meddpiccExtraction.most_recent_update) {
          meddpiccUpdates.most_recent_update = meddpiccExtraction.most_recent_update;
          (meddpiccUpdates as any).most_recent_update_source = 'granola';
          (meddpiccUpdates as any).most_recent_update_at = new Date().toISOString();
        }

        (meddpiccUpdates as any).last_call_date = details.start_time || details.created_at || new Date().toISOString();

        if (Object.keys(meddpiccUpdates).length > 0) {
          updateSessionFromGranola(session.id, meddpiccUpdates);
        }
      }

      setSyncedIds(prev => new Set(prev).add(note.id));
      toast(`Synced ${note.title} to ${session.company_name}`, 'success');
      
    } catch (err) {
      console.error('Sync failed:', err);
      toast(`Failed to sync ${note.title}`, 'error');
    } finally {
      setSyncingIds(prev => {
        const next = new Set(prev);
        next.delete(note.id);
        return next;
      });
    }
  };

  const syncAll = async () => {
    for (const note of notes) {
      const session = getSuggestedSession(note);
      const isAlreadySynced = session?.granola_notes?.some(n => n.id === note.id);
      if (session && !isAlreadySynced && !syncedIds.has(note.id)) {
        await handleSync(note, session);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Granola Sync Hub</h2>
            <p className="text-sm text-stone-500 mt-1">Review and associate recent meeting notes with your opportunities.</p>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-50 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 bg-stone-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-stone-400">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <p className="text-sm">Fetching your last 50 meetings...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-stone-500">No recent notes found in Granola.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map(note => {
                const session = getSuggestedSession(note);
                const isAlreadySynced = session?.granola_notes?.some(n => n.id === note.id);
                const isSyncing = syncingIds.has(note.id);
                const isSynced = syncedIds.has(note.id) || isAlreadySynced;

                return (
                  <div key={note.id} className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-4 hover:border-stone-300 transition-colors shadow-sm">
                    <div className="bg-stone-100 p-2.5 rounded-lg text-stone-500 shrink-0">
                      <FileText size={20} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-stone-800 truncate">{note.title}</h4>
                      <p className="text-xs text-stone-400 mt-1">
                        {new Date(note.start_time || note.created_at).toLocaleDateString()} · {note.attendees?.length || 0} attendees
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-4">
                      {session ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-medium text-stone-500 flex items-center gap-1">
                            <Briefcase size={12} />
                            {session.company_name}
                          </span>
                          {isSynced ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full border border-emerald-100">
                              <CheckCircle2 size={14} />
                              Synced
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSync(note, session)}
                              disabled={isSyncing}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-full transition-colors disabled:opacity-50"
                            >
                              {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : 'Sync Note'}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-stone-400 italic px-2 py-1">No match found</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-white flex justify-between items-center">
          <span className="text-xs text-stone-500">Checking last 50 meetings across {sessions.length} open deals.</span>
          <button
            onClick={syncAll}
            disabled={loading || syncingIds.size > 0 || notes.length === 0}
            className="flex items-center gap-2 bg-[#F05A28] hover:bg-[#D94E20] text-white font-semibold py-2 px-5 rounded-lg transition-colors text-sm shadow-sm disabled:opacity-50"
          >
            Sync All Matches <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
