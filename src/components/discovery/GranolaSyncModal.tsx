import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, RefreshCw, Calendar, Users, AlertCircle, FileText, ChevronDown, ChevronRight, Sparkles, Check, CheckCircle2 } from 'lucide-react';
import { fetchRecentNotes, fetchNoteDetails } from '../../lib/granolaClient';
import type { GranolaApiNote } from '../../lib/granolaClient';
import { getAllSessions, addGranolaNoteToSession, updateSessionFromGranola, computeBAPAnswers } from '../../lib/discoveryDatabase';
import { analyzeTranscript } from '../../lib/transcriptAnalysis';
import type { GranolaNote, DiscoverySession } from '../../lib/discoveryDatabase';
import { parseGranolaSummary } from '../../lib/granolaParser';
import { extractFieldsFromTranscript, buildSessionUpdates, hasOpenAIKey, type ExtractionResult, type ExtractedField } from '../../lib/granolaLLMExtractor';

interface GranolaSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  session: DiscoverySession;
  onFieldsMerged?: (fieldCount?: number) => void;
  preselectedMeetingId?: string;
}

type ModalStatus = 'idle' | 'loading' | 'importing' | 'extracting' | 'review' | 'merging' | 'error';

const SECTION_CONFIG: { key: ExtractedField['section']; label: string; emoji: string }[] = [
  { key: 'call_sheet', label: 'Call Sheet Answers', emoji: '📋' },
  { key: 'bap', label: 'BAP Scores', emoji: '🎯' },
  { key: 'meddpicc', label: 'MEDDPICC', emoji: '📊' },
  { key: 'deal_intel', label: 'Deal Intelligence', emoji: '🔍' },
];

function ConfidenceBadge({ confidence }: { confidence: 'high' | 'medium' | 'low' }) {
  const styles: Record<string, string> = {
    high: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-zinc-100 text-zinc-500 border-zinc-200',
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${styles[confidence]}`}>
      {confidence}
    </span>
  );
}

// ── Step 1: Browse & Select Note ──

function NoteBrowser({
  notes,
  search,
  setSearch,
  status,
  errorMsg,
  onImport,
  onRetry,
  linkedNoteIds,
}: {
  notes: GranolaApiNote[];
  search: string;
  setSearch: (s: string) => void;
  status: ModalStatus;
  errorMsg: string;
  onImport: (noteId: string) => void;
  onRetry: () => void;
  linkedNoteIds: Set<string>;
}) {
  const filteredNotes = notes.filter(n =>
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.attendees?.some(a => (a.name || '').toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-zinc-50/50">
      <div className="p-4 border-b border-zinc-200 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by title or attendee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F05A28]/20 focus:border-[#F05A28] transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {status === 'loading' ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <p className="text-sm">Loading recent notes...</p>
          </div>
        ) : status === 'error' ? (
          <div className="flex flex-col items-center justify-center h-full text-rose-500 gap-3">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm font-medium">{errorMsg}</p>
            <button
              onClick={onRetry}
              className="mt-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-lg text-sm hover:bg-rose-100 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2">
            <FileText className="h-8 w-8 opacity-20" />
            <p className="text-sm">No notes found.</p>
          </div>
        ) : (
          filteredNotes.map(note => (
            <div
              key={note.id}
              className="bg-white border border-zinc-200 rounded-xl p-4 hover:border-[#F05A28]/30 hover:shadow-md transition-all group flex items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <h3 className="font-medium text-zinc-900 group-hover:text-[#F05A28] transition-colors">
                  {note.title || 'Untitled Meeting'}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(note.start_time || note.created_at).toLocaleString()}
                  </div>
                  {note.attendees && note.attendees.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {note.attendees.map(a => a.name || a.email).join(', ')}
                    </div>
                  )}
                </div>
              </div>
              {linkedNoteIds.has(note.id) ? (
                <span className="px-4 py-2 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-lg flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Linked
                </span>
              ) : (
                <button
                  onClick={() => onImport(note.id)}
                  disabled={status === 'importing' || status === 'extracting'}
                  className="px-4 py-2 bg-zinc-100 hover:bg-[#F05A28] hover:text-white text-zinc-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {status === 'importing' || status === 'extracting' ? 'Importing...' : 'Import'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Step 1b: Paste Raw Transcript ──

function RawTranscriptPaste({
  rawText,
  setRawText,
  status,
  onImport,
}: {
  rawText: string;
  setRawText: (s: string) => void;
  status: ModalStatus;
  onImport: () => void;
}) {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv') || file.type === 'text/plain' || file.name.endsWith('.txt'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) setRawText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-zinc-50/50 p-4 space-y-4">
      {status === 'error' && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>You must configure your OpenAI API Key in the Global Settings to extract data from manual transcripts.</p>
        </div>
      )}
      <div 
        className={`flex-1 bg-white border-2 rounded-xl overflow-hidden flex flex-col transition-colors ${isDragging ? 'border-emerald-500 bg-emerald-50/50' : 'border-zinc-200'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="p-3 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
          <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Paste or Drop Transcript (CSV/TXT)</label>
        </div>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste raw transcript text here, or drag & drop a .csv or .txt file directly..."
          className="flex-1 w-full p-4 text-sm text-zinc-700 bg-transparent placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
        />
      </div>
      <div className="flex justify-end">
        <button
          onClick={onImport}
          disabled={status === 'importing' || status === 'extracting' || !rawText.trim()}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
        >
          {status === 'extracting' ? 'Analyzing...' : 'Extract Data from Transcript'}
        </button>
      </div>
    </div>
  );
}

// ── Extracting State ──

function ExtractingView() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-6 bg-zinc-50/50 p-8">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F05A28]/10 to-[#F05A28]/5 flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-[#F05A28] animate-pulse" />
        </div>
        <div className="absolute -inset-3 rounded-3xl border-2 border-[#F05A28]/10 animate-ping opacity-20" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-bold text-zinc-900">AI is analyzing the transcript...</h3>
        <p className="text-sm text-zinc-500 max-w-sm">
          Extracting call sheet answers, BAP scores, MEDDPICC fields, and deal intelligence from the meeting.
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-[#F05A28]"
            style={{
              animation: 'pulse 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Step 2: Review & Merge ──

function ReviewScreen({
  result,
  noteTitle,
  selectedKeys,
  setSelectedKeys,
  collapsedSections,
  toggleSection,
  nextStepsText,
  setNextStepsText,
  onApply,
  onSkip,
  isMerging,
}: {
  result: ExtractionResult;
  noteTitle: string;
  selectedKeys: Set<string>;
  setSelectedKeys: React.Dispatch<React.SetStateAction<Set<string>>>;
  collapsedSections: Set<string>;
  toggleSection: (key: string) => void;
  nextStepsText: string;
  setNextStepsText: (s: string) => void;
  onApply: () => void;
  onSkip: () => void;
  isMerging: boolean;
}) {
  const fieldsBySection = useMemo(() => {
    const map: Record<string, ExtractedField[]> = {};
    for (const field of result.fields) {
      if (!map[field.section]) map[field.section] = [];
      map[field.section].push(field);
    }
    return map;
  }, [result.fields]);

  const selectedCount = selectedKeys.size;

  const toggleField = (key: string) => {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Review Header */}
      <div className="p-5 border-b border-zinc-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-zinc-900">
              AI extracted {result.fields.length} fields from this call
            </h3>
            <p className="text-xs text-zinc-500 truncate">{noteTitle}</p>
          </div>
        </div>
      </div>

      {/* Scrollable field list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/50">
        {SECTION_CONFIG.map(({ key, label, emoji }) => {
          const fields = fieldsBySection[key];
          if (!fields || fields.length === 0) return null;
          const isCollapsed = collapsedSections.has(key);

          return (
            <div key={key} className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
              {/* Section header */}
              <button
                onClick={() => toggleSection(key)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{emoji}</span>
                  <span className="text-xs font-bold text-zinc-900">{label}</span>
                  <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-100 rounded-full px-2 py-0.5">
                    {fields.length}
                  </span>
                </div>
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 text-zinc-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-zinc-400" />
                )}
              </button>

              {/* Fields */}
              {!isCollapsed && (
                <div className="border-t border-zinc-100">
                  {fields.map(field => {
                    const isSelected = selectedKeys.has(field.key);
                    return (
                      <div
                        key={field.key}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-zinc-50 last:border-b-0 transition-colors ${
                          isSelected ? 'bg-white' : 'bg-zinc-50/50'
                        }`}
                      >
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleField(field.key)}
                          className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-zinc-300 hover:border-emerald-400'
                          }`}
                        >
                          {isSelected && <Check size={10} className="text-white" />}
                        </button>

                        {/* Field content */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-semibold text-zinc-700">{field.label}</span>
                            <ConfidenceBadge confidence={field.confidence} />
                          </div>

                          {/* Value */}
                          <p className={`text-xs font-medium ${field.hasConflict ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {typeof field.value === 'object' ? JSON.stringify(field.value) : String(field.value)}
                          </p>

                          {/* Conflict: existing value crossed out */}
                          {field.hasConflict && field.existingValue && (
                            <p className="text-[10px] text-zinc-400 line-through">
                              Current: {typeof field.existingValue === 'object' ? JSON.stringify(field.existingValue) : String(field.existingValue)}
                            </p>
                          )}

                          {/* Evidence quote */}
                          {field.evidence && (
                            <p className="text-[10px] italic text-zinc-400 leading-relaxed">
                              "{field.evidence}"
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Key Quotes */}
        {result.key_quotes.length > 0 && (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="text-sm">💬</span>
                <span className="text-xs font-bold text-zinc-900">Key Quotes</span>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {result.key_quotes.map((quote, i) => (
                <p key={i} className="text-[11px] italic text-zinc-500 leading-relaxed pl-3 border-l-2 border-zinc-200">
                  "{quote}"
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <span className="text-sm">📝</span>
              <span className="text-xs font-bold text-zinc-900">Next Steps</span>
            </div>
          </div>
          <div className="p-4">
            <textarea
              value={nextStepsText}
              onChange={(e) => setNextStepsText(e.target.value)}
              placeholder="No next steps extracted..."
              rows={3}
              className="w-full text-xs text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F05A28]/20 focus:border-[#F05A28] transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-200 bg-white flex items-center justify-between gap-3">
        <button
          onClick={onSkip}
          disabled={isMerging}
          className="px-4 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors disabled:opacity-50"
        >
          Skip
        </button>
        <button
          onClick={onApply}
          disabled={isMerging || selectedCount === 0}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isMerging ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Applying...
            </>
          ) : (
            `Apply ${selectedCount} Selected Field${selectedCount !== 1 ? 's' : ''}`
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main Modal ──

export function GranolaSyncModal({ isOpen, onClose, sessionId, session, onFieldsMerged, preselectedMeetingId }: GranolaSyncModalProps) {
  const [notes, setNotes] = useState<GranolaApiNote[]>([]);
  const [status, setStatus] = useState<ModalStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [importMode, setImportMode] = useState<'granola' | 'paste'>('granola');
  const [rawTranscript, setRawTranscript] = useState('');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(preselectedMeetingId || '');

  // Step 2 state
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [noteTitle, setNoteTitle] = useState('');
  const [noteId, setNoteId] = useState('');
  const [nextStepsText, setNextStepsText] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadNotes();
      // Reset step 2 state
      setExtractionResult(null);
      setSelectedKeys(new Set());
      setCollapsedSections(new Set());
      setNoteTitle('');
      setNoteId('');
      setNextStepsText('');
    }
  }, [isOpen]);

  const loadNotes = async () => {
    setStatus('loading');
    setErrorMsg('');
    try {
      const data = await fetchRecentNotes(20);
      setNotes(data);
      setStatus('idle');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to load notes. Please check your API key.');
    }
  };

  const handleImport = async (selectedNoteId: string) => {
    setStatus('importing');
    setErrorMsg('');
    try {
      // Fetch full details including summary and transcript
      const details = await fetchNoteDetails(selectedNoteId);

      // Granola v1 API returns summary_text/summary_markdown, not summary/notes
      const summaryText = (details as any).summary_text || (details as any).summary || '';
      const summaryMarkdown = (details as any).summary_markdown || summaryText;
      const transcript = details.transcript || '';

      const newNote: GranolaNote = {
        id: details.id,
        title: details.title,
        date: (details as any).calendar_event?.scheduled_start_time || details.created_at,
        summary: summaryText,
        transcript: transcript,
        url: (details as any).web_url || details.url,
        attendees: details.attendees ? details.attendees.map(a => a.name || a.email) : [],
        meeting_id: selectedMeetingId || undefined,
      };

      const sessions = getAllSessions();
      const session = sessions.find(s => s.id === sessionId);
      const existingBap = session ? computeBAPAnswers(session) : {};

      if (transcript) {
        newNote.transcript_analysis = await analyzeTranscript(transcript, existingBap);
      }

      // 1. Save note to session
      addGranolaNoteToSession(sessionId, newNote);

      // 2. Run MEDDPICC extraction from summary_markdown (structured Who/What/When parsing)
      const { extractMEDDPICCFromSummary } = await import('../../lib/granolaClient');
      const meddpiccExtraction = extractMEDDPICCFromSummary(summaryMarkdown, details.attendees);
      
      // Map extraction fields → session fields
      const meddpiccUpdates: Partial<DiscoverySession> = {};
      if (meddpiccExtraction.identify_pain) meddpiccUpdates.pain_narrative = meddpiccExtraction.identify_pain;
      if (meddpiccExtraction.metrics) meddpiccUpdates.success_metrics_text = meddpiccExtraction.metrics;
      if (meddpiccExtraction.decision_criteria) meddpiccUpdates.decision_criteria = meddpiccExtraction.decision_criteria;
      if (meddpiccExtraction.decision_process) meddpiccUpdates.decision_process = meddpiccExtraction.decision_process;
      if (meddpiccExtraction.paper_process) meddpiccUpdates.paper_process = meddpiccExtraction.paper_process;
      if (meddpiccExtraction.champion) meddpiccUpdates.champion_name = meddpiccExtraction.champion;
      if (meddpiccExtraction.competition) meddpiccUpdates.competitive_situation = meddpiccExtraction.competition;
      if (meddpiccExtraction.economic_buyer) meddpiccUpdates.economic_buyer_access = meddpiccExtraction.economic_buyer;
      if (meddpiccExtraction.next_steps) meddpiccUpdates.next_action = meddpiccExtraction.next_steps;
      if (meddpiccExtraction.most_recent_update) meddpiccUpdates.most_recent_update = meddpiccExtraction.most_recent_update;
      if ((meddpiccExtraction as any).next_steps_who) meddpiccUpdates.next_steps_who = (meddpiccExtraction as any).next_steps_who;
      if ((meddpiccExtraction as any).next_steps_what) meddpiccUpdates.next_steps_what = (meddpiccExtraction as any).next_steps_what;
      if ((meddpiccExtraction as any).next_steps_when) meddpiccUpdates.next_steps_when = (meddpiccExtraction as any).next_steps_when;
      meddpiccUpdates.most_recent_update_source = 'granola';
      meddpiccUpdates.most_recent_update_at = new Date().toISOString();
      
      const newCallSheet = { ...(session?.call_sheet_answers || {}) };
      let updatedCallSheet = false;
      if (meddpiccExtraction.identify_pain) { newCallSheet.q1 = meddpiccExtraction.identify_pain; updatedCallSheet = true; }
      if (meddpiccExtraction.champion || meddpiccExtraction.economic_buyer) {
        newCallSheet.q2 = [
          meddpiccExtraction.champion ? `Champion: ${meddpiccExtraction.champion}` : '',
          meddpiccExtraction.economic_buyer ? `EB: ${meddpiccExtraction.economic_buyer}` : ''
        ].filter(Boolean).join('\n');
        updatedCallSheet = true;
      }
      if (meddpiccExtraction.competition) { newCallSheet.q5 = meddpiccExtraction.competition; updatedCallSheet = true; }
      if (meddpiccExtraction.decision_process) { newCallSheet.q8 = meddpiccExtraction.decision_process; updatedCallSheet = true; }
      if (meddpiccExtraction.metrics) { newCallSheet.q11 = meddpiccExtraction.metrics; updatedCallSheet = true; }
      
      if (updatedCallSheet) {
        meddpiccUpdates.call_sheet_answers = newCallSheet;
      }

      if (Object.keys(meddpiccUpdates).length > 0) {
        updateSessionFromGranola(sessionId, meddpiccUpdates);
      }

      // 3. Also run regex parser for BAP/call sheet extraction
      const combinedText = `${summaryText}\n${transcript}`;
      const regexUpdates = parseGranolaSummary(combinedText);
      if (Object.keys(regexUpdates).length > 0) {
        updateSessionFromGranola(sessionId, regexUpdates);
      }

      // 3. Check for OpenAI key
      if (hasOpenAIKey()) {
        // Transition to extracting state
        setStatus('extracting');
        setNoteTitle(details.title || 'Untitled Meeting');
        setNoteId(details.id);

        const summary = details.summary || details.notes || '';
        const transcript = details.transcript || '';

        try {
          const result = await extractFieldsFromTranscript(summary, transcript, session);
          setExtractionResult(result);
          setNextStepsText(result.next_steps || '');

          // Pre-select high/medium confidence fields
          const preSelected = new Set<string>();
          for (const field of result.fields) {
            if (field.confidence === 'high' || field.confidence === 'medium') {
              preSelected.add(field.key);
            }
          }
          setSelectedKeys(preSelected);

          setStatus('review');
        } catch (extractErr: any) {
          // If LLM extraction fails, regex already applied — just close
          console.error('LLM extraction failed:', extractErr);
          setStatus('idle');
          onClose();
        }
      } else {
        // No OpenAI key — regex already applied, just close
        setStatus('idle');
        onClose();
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to import note.');
    }
  };

  const handlePasteImport = async () => {
    if (!hasOpenAIKey()) {
      setErrorMsg('OpenAI key required for manual transcript extraction.');
      setStatus('error');
      return;
    }
    setStatus('extracting');
    setNoteTitle('Manual Transcript Upload');
    const newNoteId = `manual_${Date.now()}`;
    setNoteId(newNoteId);
    
    try {
      const result = await extractFieldsFromTranscript('', rawTranscript, session);
      setExtractionResult(result);
      setNextStepsText(result.next_steps || '');

      // Create and save the note
      const newNote: GranolaNote = {
        id: newNoteId,
        title: 'Manual Transcript Upload',
        date: new Date().toISOString(),
        summary: '',
        transcript: rawTranscript,
        url: '',
        attendees: [],
        is_manual: true,
        transcript_analysis: result,
        meeting_id: selectedMeetingId || undefined,
      };
      addGranolaNoteToSession(sessionId, newNote);

      const preSelected = new Set<string>();
      for (const field of result.fields) {
        if (field.confidence === 'high' || field.confidence === 'medium') {
          preSelected.add(field.key);
        }
      }
      setSelectedKeys(preSelected);
      setStatus('review');
    } catch (err: any) {
      console.error('LLM extraction failed:', err);
      setStatus('error');
      setErrorMsg(err.message || 'Failed to analyze transcript.');
    }
  };

  const handleApply = async () => {
    if (!extractionResult) return;

    setStatus('merging');
    try {
      // 1. Build and apply session updates
      const updates = buildSessionUpdates(extractionResult, selectedKeys);
      updateSessionFromGranola(sessionId, updates);

      // 2. Update the GranolaNote with key_quotes if they exist
      if (extractionResult.key_quotes.length > 0 && noteId) {
        const allSessions = JSON.parse(localStorage.getItem('scc_discovery_sessions') || '[]');
        const sessionIdx = allSessions.findIndex((s: any) => s.id === sessionId);
        if (sessionIdx !== -1) {
          const granolaNote = allSessions[sessionIdx].granola_notes?.find((n: any) => n.id === noteId);
          if (granolaNote) {
            granolaNote.key_quotes = extractionResult.key_quotes;
            if (nextStepsText) granolaNote.next_steps = nextStepsText;
            localStorage.setItem('scc_discovery_sessions', JSON.stringify(allSessions));
          }
        }
      }

      // 3. Callback
      onFieldsMerged?.(selectedKeys.size);

      // 4. Close
      setStatus('idle');
      onClose();
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to apply fields.');
    }
  };

  const handleSkip = () => {
    setStatus('idle');
    onClose();
  };

  const toggleSection = (key: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (!isOpen) return null;

  const isReviewStep = status === 'review' || status === 'merging';
  const isExtracting = status === 'extracting';

  return (
    <>
      <div
        className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[100] transition-opacity"
        onClick={isExtracting || status === 'merging' ? undefined : onClose}
      />

      <div className="fixed inset-0 m-auto w-full max-w-2xl h-[600px] bg-white shadow-2xl z-[110] flex flex-col rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-white">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isReviewStep
                ? 'bg-emerald-50 text-emerald-600'
                : importMode === 'granola' ? 'bg-[#F05A28]/10 text-[#F05A28]' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {isReviewStep ? (
                <Sparkles className="h-5 w-5" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900">
                {isReviewStep ? 'Review Extracted Fields' : isExtracting ? 'Analyzing Transcript' : 'Import Transcript Data'}
              </h2>
              <div className="flex items-center gap-4 mt-1">
                {!isReviewStep && !isExtracting ? (
                  <div className="flex items-center gap-4">
                    <div className="flex bg-zinc-100 p-0.5 rounded-lg">
                      <button
                        onClick={() => setImportMode('granola')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${importMode === 'granola' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                      >
                        Granola API
                      </button>
                      <button
                        onClick={() => setImportMode('paste')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${importMode === 'paste' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                      >
                        Paste Transcript
                      </button>
                    </div>
                    <div className="h-4 w-px bg-zinc-200" />
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">Link to:</span>
                      <select
                        value={selectedMeetingId}
                        onChange={(e) => setSelectedMeetingId(e.target.value)}
                        className="text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-md px-2 py-1 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 max-w-[200px]"
                      >
                        <option value="">-- Deal Activity Log --</option>
                        {(() => {
                          const allMeetings: { id: string; title: string; date: string }[] = [];
                          // Add custom meetings
                          session.custom_meetings?.forEach(m => {
                            allMeetings.push({ id: m.id, title: m.title, date: m.date });
                          });
                          // Add milestones
                          const ms = session.milestones;
                          if (ms?.discovery_set?.date) allMeetings.push({ id: 'discovery_set', title: 'Discovery (Set)', date: ms.discovery_set.date });
                          if (ms?.discovery_held?.date) allMeetings.push({ id: 'discovery_held', title: 'Discovery (Held)', date: ms.discovery_held.date });
                          if (ms?.demo_held?.date) allMeetings.push({ id: 'demo_held', title: 'Demo', date: ms.demo_held.date });
                          if (ms?.proposal_sent?.date) allMeetings.push({ id: 'proposal_sent', title: 'Proposal Review', date: ms.proposal_sent.date });
                          
                          return allMeetings
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map(m => (
                              <option key={m.id} value={m.id}>
                                {m.title} ({new Date(m.date).toLocaleDateString()})
                              </option>
                            ));
                        })()}
                      </select>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">
                    {isReviewStep
                      ? 'Select which fields to apply to your session'
                      : 'AI is processing the meeting transcript'}
                  </p>
                )}
              </div>
            </div>
          </div>
          {!isExtracting && status !== 'merging' && (
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        {isExtracting ? (
          <ExtractingView />
        ) : isReviewStep && extractionResult ? (
          <ReviewScreen
            result={extractionResult}
            noteTitle={noteTitle}
            selectedKeys={selectedKeys}
            setSelectedKeys={setSelectedKeys}
            collapsedSections={collapsedSections}
            toggleSection={toggleSection}
            nextStepsText={nextStepsText}
            setNextStepsText={setNextStepsText}
            onApply={handleApply}
            onSkip={handleSkip}
            isMerging={status === 'merging'}
          />
        ) : importMode === 'granola' ? (
          <NoteBrowser
            notes={notes}
            search={search}
            setSearch={setSearch}
            status={status}
            errorMsg={errorMsg}
            onImport={handleImport}
            onRetry={loadNotes}
            linkedNoteIds={new Set(getAllSessions().find(s => s.id === sessionId)?.granola_notes?.map(n => n.id) || [])}
          />
        ) : (
          <RawTranscriptPaste
            rawText={rawTranscript}
            setRawText={setRawTranscript}
            status={status}
            onImport={handlePasteImport}
          />
        )}
      </div>

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
