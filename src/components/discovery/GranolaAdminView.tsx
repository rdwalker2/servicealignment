import React, { useState, useEffect } from 'react';
import { RefreshCw, FileText, CheckCircle2, Link2, Unlink, AlertTriangle, X } from 'lucide-react';
import { fetchRecentNotes, type GranolaApiNote } from '../../lib/granolaClient';
import { getAllSessions, removeGranolaNoteFromSession, addGranolaNoteToSession, type DiscoverySession } from '../../lib/discoveryDatabase';
import { useToast } from '../ui/Toast';

export function GranolaAdminView() {
  const [notes, setNotes] = useState<GranolaApiNote[]>([]);
  const [sessions, setSessions] = useState<DiscoverySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [linkingNoteId, setLinkingNoteId] = useState<string | null>(null);
  const [dealSearchQuery, setDealSearchQuery] = useState('');
  const { toast } = useToast();

  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setApiKeyMissing(false);
    try {
      const allSessions = getAllSessions();
      setSessions(allSessions);
      const recentNotes = await fetchRecentNotes(50);
      setNotes(recentNotes);
    } catch (err: any) {
      console.error('Failed to load Granola admin data:', err);
      if (err.message && err.message.includes('API key is not set')) {
        setApiKeyMissing(true);
      } else {
        toast('Failed to load Granola data.', 'error');
      }
    } finally {
      setLoading(false);
    }
  }

  const saveKey = () => {
    if (!apiKeyInput.trim()) return;
    localStorage.setItem('granola_api_key', apiKeyInput.trim());
    setApiKeyInput('');
    loadData();
  };

  const handleUnlink = async (noteId: string, sessionId: string) => {
    if (!window.confirm('Are you sure you want to unlink this call? The extracted data (BAP, MEDDPICC) will remain on the deal, but the call log will be removed.')) {
      return;
    }
    setProcessingId(noteId);
    try {
      removeGranolaNoteFromSession(sessionId, noteId);
      // Reload sessions to reflect changes
      setSessions(getAllSessions());
      toast('Call unlinked successfully.', 'success');
    } catch (err) {
      toast('Failed to unlink call.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleLink = async (note: GranolaApiNote, sessionId: string) => {
    setProcessingId(note.id);
    try {
      addGranolaNoteToSession(sessionId, note);
      setSessions(getAllSessions());
      toast('Call linked successfully.', 'success');
    } catch (err) {
      toast('Failed to link call.', 'error');
    } finally {
      setProcessingId(null);
      setLinkingNoteId(null);
    }
  };

  const getLinkedSession = (noteId: string) => {
    return sessions.find(s => s.granola_notes?.some(n => n.id === noteId));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-stone-400">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <p className="text-sm">Loading workspace calls...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
      <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
        <div>
          <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-stone-500" />
            Granola Activity Feed
          </h2>
          <p className="text-sm text-stone-500 mt-1">Global view of all recent calls across the workspace.</p>
        </div>
        <button onClick={loadData} className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="divide-y divide-stone-100">
        {apiKeyMissing ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
            <h3 className="text-lg font-bold text-stone-900">Granola API Key Missing</h3>
            <p className="text-sm text-stone-500 max-w-md mt-1 mb-6">
              You need to set your Granola API key to view the global activity feed.
            </p>
            <div className="flex w-full max-w-sm gap-2">
              <input
                type="password"
                placeholder="grn_..."
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-stone-400"
              />
              <button
                onClick={saveKey}
                className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors"
              >
                Save Key
              </button>
            </div>
          </div>
        ) : notes.length === 0 ? (
          <div className="p-8 text-center text-stone-500 text-sm">No recent calls found.</div>
        ) : (
          notes.map(note => {
            const linkedSession = getLinkedSession(note.id);
            const isProcessing = processingId === note.id;

            return (
              <div key={note.id} className="p-4 flex items-center justify-between hover:bg-stone-50/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-stone-400">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-stone-800">{note.title}</h4>
                    <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
                      <span>{new Date(note.start_time || note.created_at).toLocaleString()}</span>
                      {note.attendees && note.attendees.length > 0 && (
                        <>
                          <span>·</span>
                          <span>{note.attendees.length} attendees</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {linkedSession ? (
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          Linked to Deal
                        </span>
                        <span className="text-sm font-semibold text-stone-700">{linkedSession.company_name}</span>
                      </div>
                      <button
                        onClick={() => handleUnlink(note.id, linkedSession.id)}
                        disabled={isProcessing}
                        title="Unlink from deal"
                        className="p-1.5 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : <Unlink size={16} />}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <AlertTriangle size={12} />
                        Unlinked
                      </span>
                      {linkingNoteId === note.id ? (
                        <div className="relative">
                          <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-md px-2 py-1 focus-within:border-stone-400">
                            <input
                              autoFocus
                              value={dealSearchQuery}
                              onChange={(e) => setDealSearchQuery(e.target.value)}
                              placeholder="Search deals..."
                              className="text-xs outline-none bg-transparent w-40"
                            />
                            <button
                              onClick={() => {
                                setLinkingNoteId(null);
                                setDealSearchQuery('');
                              }}
                              className="text-stone-400 hover:text-stone-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <div className="absolute top-full right-0 mt-1 w-64 max-h-60 overflow-y-auto bg-white border border-stone-200 rounded-lg shadow-xl z-50">
                            {sessions
                              .filter(s => s.company_name.toLowerCase().includes(dealSearchQuery.toLowerCase()))
                              .map(s => (
                                <button
                                  key={s.id}
                                  onClick={() => handleLink(note, s.id)}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-stone-50 focus:bg-stone-50 outline-none border-b border-stone-50 last:border-0"
                                >
                                  {s.company_name}
                                </button>
                              ))}
                            {sessions.filter(s => s.company_name.toLowerCase().includes(dealSearchQuery.toLowerCase())).length === 0 && (
                              <div className="px-3 py-4 text-xs text-stone-500 text-center">No deals found.</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setLinkingNoteId(note.id)}
                          title="Link to deal"
                          className="p-1.5 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                        >
                          <Link2 size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
