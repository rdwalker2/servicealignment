// ============================================================
// TranscriptUpload — Upload or paste call transcripts
// Pipeline: Upload → AI Extract → Review → Approve → Merge
// Supports: paste, .txt upload, .csv upload
// ============================================================

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, X, Quote, Check,
  Sparkles, Loader2, AlertCircle,
} from 'lucide-react';
import type { GranolaNote, DiscoverySession } from '../../lib/discoveryDatabase';
import {
  extractFieldsFromTranscript,
  buildSessionUpdates,
  hasOpenAIKey,
  type ExtractionResult,
} from '../../lib/granolaLLMExtractor';
import { ExtractionReview } from './ExtractionReview';

interface Props {
  onUpload: (note: GranolaNote) => void;
  session: DiscoverySession;
  onSessionChange: (session: DiscoverySession) => void;
  selectedPains?: string[];
  painLabels?: Record<string, string>;
  onQuoteAssign?: (painId: string, quote: string) => void;
  onLogMetric?: (type: string, date: string, auxiliaryDate?: string) => void;
}

function parseCSVTranscript(csv: string): string {
  const lines = csv.split('\n').filter(l => l.trim());
  if (lines.length === 0) return '';

  const firstLine = lines[0];
  const commaCount = (firstLine.match(/,/g) || []).length;
  const looksLikeHeader = /^(timestamp|time|speaker|name|text|content|dialogue)/i.test(firstLine);
  const startIdx = looksLikeHeader ? 1 : 0;

  const parsed: string[] = [];
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    const fields = line.match(/("(?:[^"]|"")*"|[^,]*)/g)?.map(f =>
      f.replace(/^"|"$/g, '').replace(/""/g, '"').trim()
    ) || [line];

    if (commaCount >= 2 && fields.length >= 3) {
      const [, speaker, text] = fields;
      parsed.push(`${speaker}: ${text}`);
    } else if (commaCount >= 1 && fields.length >= 2) {
      const [speaker, text] = fields;
      parsed.push(`${speaker}: ${text}`);
    } else {
      parsed.push(fields[0]);
    }
  }
  return parsed.join('\n');
}

type Step = 'upload' | 'review' | 'extracting' | 'extraction_review';

export function TranscriptUpload({
  onUpload, session, onSessionChange,
  selectedPains = [], painLabels = {}, onQuoteAssign, onLogMetric
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'paste' | 'file'>('paste');
  const [title, setTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [pastedText, setPastedText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedText, setParsedText] = useState('');
  const [step, setStep] = useState<Step>('upload');
  const [selectedText, setSelectedText] = useState('');
  const [assignPain, setAssignPain] = useState('');
  const [copiedQuote, setCopiedQuote] = useState<string | null>(null);
  const [metricType, setMetricType] = useState<string>('');
  const [secondaryMeetingDate, setSecondaryMeetingDate] = useState<string>('');
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const resetState = useCallback(() => {
    setTitle('');
    setMeetingDate(new Date().toISOString().split('T')[0]);
    setPastedText('');
    setFileName('');
    setParsedText('');
    setStep('upload');
    setSelectedText('');
    setAssignPain('');
    setMode('paste');
    setMetricType('');
    setSecondaryMeetingDate('');
    setExtractionResult(null);
    setExtractError(null);
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setTitle(file.name.replace(/\.(txt|csv)$/i, ''));

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (file.name.toLowerCase().endsWith('.csv')) {
        setParsedText(parseCSVTranscript(text));
      } else {
        setParsedText(text);
      }
      setStep('review');
    };
    reader.readAsText(file);
  }, []);

  const handlePasteSubmit = useCallback(() => {
    if (!pastedText.trim()) return;
    setParsedText(pastedText);
    setStep('review');
  }, [pastedText]);

  // Create the meeting note (used by both manual and AI paths)
  const createNote = useCallback((summary?: string, keyQuotes?: string[]): GranolaNote => {
    return {
      id: `transcript_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      date: meetingDate,
      title: title.trim() || 'Uploaded Transcript',
      summary: summary || '',
      transcript: parsedText,
      url: '',
      attendees: [],
      stage: session.deal_stage || 'discovery',
      key_quotes: keyQuotes || [],
      is_manual: true,
    };
  }, [title, meetingDate, parsedText, session.deal_stage]);

  // Save transcript without AI extraction
  const handleSaveManual = useCallback(() => {
    onUpload(createNote());
    if (metricType && onLogMetric) {
      onLogMetric(metricType, meetingDate, secondaryMeetingDate || undefined);
    }
    resetState();
    setIsOpen(false);
  }, [createNote, onUpload, resetState, metricType, meetingDate, secondaryMeetingDate, onLogMetric]);

  // Trigger AI extraction
  const handleExtract = useCallback(async () => {
    setStep('extracting');
    setExtractError(null);

    try {
      const result = await extractFieldsFromTranscript(
        '', // no Granola summary
        parsedText,
        session,
      );
      setExtractionResult(result);
      setStep('extraction_review');
    } catch (err: any) {
      setExtractError(err.message || 'Extraction failed');
      setStep('review'); // go back to review to retry
    }
  }, [parsedText, session]);

  // Apply approved extraction fields + save transcript as meeting note
  const handleApplyExtraction = useCallback((selectedKeys: Set<string>) => {
    if (!extractionResult) return;

    // Build session updates from selected fields
    const updates = buildSessionUpdates(extractionResult, selectedKeys);

    // Merge updates into existing session
    const merged = { ...session };

    // Merge call_sheet_answers (additive)
    if (updates.call_sheet_answers) {
      merged.call_sheet_answers = {
        ...(merged.call_sheet_answers || {}),
        ...updates.call_sheet_answers,
      };
      delete updates.call_sheet_answers;
    }

    // Merge bap_answers (additive)
    if (updates.bap_answers) {
      merged.bap_answers = {
        ...(merged.bap_answers || {}),
        ...updates.bap_answers,
      };
      delete updates.bap_answers;
    }

    // Merge pain_quotes (additive)
    if (updates.pain_quotes) {
      merged.pain_quotes = {
        ...(merged.pain_quotes || {}),
        ...updates.pain_quotes,
      };
      delete updates.pain_quotes;
    }

    // Merge bap_notes (additive)
    if (updates.bap_notes) {
      merged.bap_notes = {
        ...(merged.bap_notes || {}),
        ...updates.bap_notes,
      };
      delete updates.bap_notes;
    }

    // Merge selected_pains (additive — combine, deduplicate)
    if (updates.selected_pains) {
      const existing = new Set(merged.selected_pains || []);
      for (const id of updates.selected_pains) existing.add(id);
      merged.selected_pains = [...existing];
      delete updates.selected_pains;
    }

    // Apply remaining flat fields
    Object.assign(merged, updates);

    // Save the merged session
    onSessionChange(merged);

    // Save transcript as a meeting note (with AI-extracted summary + quotes)
    const note = createNote(
      extractionResult.summary,
      extractionResult.key_quotes,
    );
    onUpload(note);
    if (metricType && onLogMetric) {
      onLogMetric(metricType, meetingDate, secondaryMeetingDate || undefined);
    }

    // Done
    resetState();
    setIsOpen(false);
  }, [extractionResult, session, onSessionChange, createNote, onUpload, resetState, metricType, meetingDate, secondaryMeetingDate, onLogMetric]);

  const wordCount = parsedText ? parsedText.split(/\s+/).filter(Boolean).length : 0;
  const estimatedMinutes = Math.round(wordCount / 150);
  const hasApiKey = hasOpenAIKey();

  const handleTextSelect = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 10) {
      setSelectedText(selection.toString().trim());
    }
  }, []);

  const handleAssignQuote = useCallback(() => {
    if (selectedText && assignPain && onQuoteAssign) {
      onQuoteAssign(assignPain, selectedText);
      setCopiedQuote(selectedText);
      setSelectedText('');
      setAssignPain('');
      setTimeout(() => setCopiedQuote(null), 2000);
    }
  }, [selectedText, assignPain, onQuoteAssign]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1.5 text-[11px] font-semibold text-violet-600 transition-all hover:bg-violet-100"
      >
        <Upload size={11} />
        Upload Transcript
      </button>

      {/* Extraction Review Modal (separate layer) */}
      <AnimatePresence>
        {step === 'extraction_review' && extractionResult && (
          <ExtractionReview
            result={extractionResult}
            onApply={handleApplyExtraction}
            onClose={() => {
              // Go back to transcript review (don't lose the transcript)
              setStep('review');
              setExtractionResult(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Upload/Review Modal */}
      <AnimatePresence>
        {isOpen && step !== 'extraction_review' && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsOpen(false); resetState(); }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 top-[5%] z-50 mx-auto max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                    {step === 'extracting'
                      ? <Loader2 size={16} className="text-violet-600 animate-spin" />
                      : <FileText size={16} className="text-violet-600" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">
                      {step === 'upload' ? 'Upload Call Transcript' :
                       step === 'extracting' ? 'Analyzing Transcript…' :
                       'Review & Tag Quotes'}
                    </h3>
                    <p className="text-[10px] text-zinc-400">
                      {step === 'upload'
                        ? 'Paste text or upload a .txt / .csv file'
                        : step === 'extracting'
                        ? 'AI is extracting BAP data, pain quotes, and room content…'
                        : `${wordCount.toLocaleString()} words · ~${estimatedMinutes} min call`}
                    </p>
                  </div>
                </div>
                <button onClick={() => { setIsOpen(false); resetState(); }} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {step === 'upload' ? (
                  <div className="space-y-4">
                    {/* Title & Date */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 block">Meeting Title</label>
                        <input
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          placeholder="e.g., Discovery Call 1, Demo with CFO"
                          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                        />
                      </div>
                      <div className="w-36">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 block">Meeting Date</label>
                        <input
                          type="date"
                          value={meetingDate}
                          onChange={e => setMeetingDate(e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                        />
                      </div>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex rounded-lg bg-zinc-100 p-0.5">
                      {(['paste', 'file'] as const).map(m => (
                        <button
                          key={m}
                          onClick={() => setMode(m)}
                          className={`flex-1 rounded-md px-3 py-1.5 text-[11px] font-semibold transition-all ${
                            mode === m ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
                          }`}
                        >
                          {m === 'paste' ? '📋 Paste Text' : '📁 Upload File'}
                        </button>
                      ))}
                    </div>

                    {mode === 'paste' ? (
                      <div>
                        <textarea
                          value={pastedText}
                          onChange={e => setPastedText(e.target.value)}
                          placeholder="Paste the full call transcript here...

Speaker 1: Hi, thanks for taking the time today.
Speaker 2: Of course. So the main issue we're facing..."
                          rows={12}
                          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-700 leading-relaxed placeholder:text-zinc-300 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400 font-mono"
                        />
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] text-zinc-400">
                            {pastedText.split(/\s+/).filter(Boolean).length.toLocaleString()} words
                          </span>
                          <button
                            onClick={handlePasteSubmit}
                            disabled={!pastedText.trim()}
                            className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Continue →
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".txt,.csv"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 py-12 text-center transition-all hover:border-violet-300 hover:bg-violet-50/30"
                        >
                          <Upload size={28} className="mx-auto mb-3 text-zinc-300" />
                          <p className="text-sm font-medium text-zinc-600">
                            {fileName || 'Click to select a file'}
                          </p>
                          <p className="text-[10px] text-zinc-400 mt-1">.txt or .csv (speaker, text format)</p>
                        </button>
                      </div>
                    )}
                  </div>
                ) : step === 'extracting' ? (
                  /* Extracting state */
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="relative mb-6">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                        <Sparkles size={28} className="text-violet-500" />
                      </div>
                      <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-violet-500 flex items-center justify-center">
                        <Loader2 size={10} className="text-white animate-spin" />
                      </div>
                    </div>
                    <p className="text-sm font-bold text-zinc-900 mb-1">Analyzing Transcript</p>
                    <p className="text-xs text-zinc-400 text-center max-w-xs leading-relaxed">
                      Extracting BAP checkpoint scores, call sheet answers,
                      pain quotes, 4D Action Plan fields, and writing room content…
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-1.5">
                      {['Call Sheet', '4D Scores', 'Pain Quotes', 'Room Content'].map((item, i) => (
                        <motion.span
                          key={item}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.3 }}
                          className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-600"
                        >
                          {item}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Review Step */
                  <div className="space-y-4">
                    {/* Title edit */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 block">Meeting Title</label>
                        <input
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 focus:border-violet-400 focus:outline-none"
                        />
                      </div>
                      <div className="w-36">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 block">
                          {metricType === 'discovery_held' ? "Meeting Held Date" : "Date Booked"}
                        </label>
                        <input
                          type="date"
                          value={meetingDate}
                          onChange={e => setMeetingDate(e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 focus:border-violet-400 focus:outline-none"
                        />
                      </div>
                      {metricType === 'discovery_set' && (
                        <div className="w-36">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1 block">Scheduled For</label>
                          <input
                            type="date"
                            value={secondaryMeetingDate}
                            onChange={e => setSecondaryMeetingDate(e.target.value)}
                            className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-900 focus:border-emerald-400 focus:outline-none"
                          />
                        </div>
                      )}
                      {metricType === 'discovery_held' && (
                        <div className="w-36">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-orange-400 mb-1 block">Date Booked</label>
                          <input
                            type="date"
                            value={secondaryMeetingDate}
                            onChange={e => setSecondaryMeetingDate(e.target.value)}
                            className="w-full rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm text-orange-900 focus:border-orange-400 focus:outline-none"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 block">Pipeline Metric</label>
                        <select
                          value={metricType}
                          onChange={e => setMetricType(e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[11px] text-zinc-700 focus:border-violet-400 focus:outline-none"
                        >
                          <option value="">No Pipeline Metric (Just notes)</option>
                          <option value="discovery_set">Log as Discovery Set</option>
                          <option value="discovery_held">Log as Discovery Held</option>
                          <option value="demo_held">Log as Demo Held</option>
                          <option value="proposal_sent">Log as Proposal Sent</option>
                        </select>
                      </div>
                    </div>

                    {/* Error display */}
                    {extractError && (
                      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 flex items-start gap-2">
                        <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-red-700">AI Extraction Failed</p>
                          <p className="text-[10px] text-red-500 mt-0.5">{extractError}</p>
                          <p className="text-[10px] text-red-400 mt-1">You can retry or save the transcript manually.</p>
                        </div>
                      </div>
                    )}

                    {/* Quote assignment zone */}
                    {selectedPains.length > 0 && onQuoteAssign && (
                      <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500 mb-1 flex items-center gap-1">
                          <Quote size={10} /> Manual Quote Tagging
                        </p>
                        <p className="text-[10px] text-violet-400 mb-2">
                          Highlight text below, then assign it to a priority.
                        </p>
                        {selectedText ? (
                          <div className="space-y-2">
                            <div className="rounded-lg bg-white border border-violet-200 px-3 py-2">
                              <p className="text-xs italic text-violet-700 leading-relaxed">"{selectedText.slice(0, 200)}{selectedText.length > 200 ? '…' : ''}"</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={assignPain}
                                onChange={e => setAssignPain(e.target.value)}
                                className="flex-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[11px] text-zinc-700 focus:outline-none focus:border-violet-400"
                              >
                                <option value="">Assign to priority…</option>
                                {selectedPains.map(id => (
                                  <option key={id} value={id}>{painLabels[id] || id}</option>
                                ))}
                              </select>
                              <button
                                onClick={handleAssignQuote}
                                disabled={!assignPain}
                                className="rounded-lg bg-violet-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-violet-700 disabled:opacity-40"
                              >
                                Assign
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[10px] text-violet-300 italic">Select text from the transcript to tag it…</p>
                        )}
                        {copiedQuote && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-emerald-600"
                          >
                            <Check size={10} /> Quote assigned!
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* Transcript viewer */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 block">
                        Transcript Preview
                      </label>
                      <div
                        ref={transcriptRef}
                        onMouseUp={handleTextSelect}
                        className="max-h-[40vh] overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-600 leading-relaxed font-mono whitespace-pre-wrap select-text cursor-text"
                      >
                        {parsedText}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3 shrink-0 bg-zinc-50/50">
                {step === 'review' && (
                  <button
                    onClick={() => setStep('upload')}
                    className="text-xs font-medium text-zinc-500 hover:text-zinc-700"
                  >
                    ← Back
                  </button>
                )}
                <div className="flex-1" />
                {step === 'review' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveManual}
                      className="rounded-lg px-4 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-100 transition-colors"
                    >
                      Save Without Analysis
                    </button>
                    {hasApiKey ? (
                      <button
                        onClick={handleExtract}
                        className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2 text-xs font-bold text-white transition-all hover:from-violet-700 hover:to-purple-700 flex items-center gap-1.5"
                      >
                        <Sparkles size={12} />
                        Analyze with AI
                      </button>
                    ) : (
                      <button
                        onClick={handleSaveManual}
                        className="rounded-lg bg-zinc-900 px-5 py-2 text-xs font-bold text-white transition-all hover:bg-zinc-800"
                      >
                        Save Transcript
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
