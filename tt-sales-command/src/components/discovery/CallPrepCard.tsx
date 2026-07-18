// ============================================================
// CallPrepCard.tsx — Pre-call intelligence briefing
// Shows before follow-up calls to prep the AE with key context
// from prior calls, unanswered questions, and coaching tips.
// ============================================================

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, MessageSquareQuote, ListChecks, ArrowRight, Clock, Sparkles, X } from 'lucide-react';
import type { DiscoverySession, GranolaNote } from '../../lib/discoveryDatabase';
import { BAP_QUESTIONS, computeBAPAnswers } from '../../lib/discoveryDatabase';
import { SHEETS } from '../../data/personaSheets';

interface CallPrepCardProps {
  session: DiscoverySession;
  onDismiss: () => void;
}

interface PrepData {
  lastCallSummary: string;
  lastCallDate: string;
  lastCallTitle: string;
  keyQuotes: string[];
  agreedNextSteps: string;
  unansweredBAPQuestions: { id: string; title: string; question: string }[];
  unansweredCallSheetQuestions: { id: string; question: string }[];
  stageCoachingTip: string;
  callNumber: number;
  stakeholdersCovered: string[];
  stakeholdersGap: string[];
}

function buildPrepData(session: DiscoverySession): PrepData | null {
  const notes = session.granola_notes || [];
  if (notes.length === 0 && !session.last_call_date) return null;

  // Sort notes by date, most recent first
  const sorted = [...notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastNote = sorted[0];

  // 1. Last call summary (first 3 sentences of summary)
  const rawSummary = lastNote?.summary || '';
  const sentences = rawSummary.split(/(?<=[.!?])\s+/).filter(s => s.trim());
  const lastCallSummary = sentences.slice(0, 3).join(' ');

  // 2. Key quotes from all notes (deduplicated, most recent first)
  const allQuotes: string[] = [];
  for (const note of sorted) {
    if (note.key_quotes) {
      for (const q of note.key_quotes) {
        if (!allQuotes.includes(q)) allQuotes.push(q);
      }
    }
  }

  // 3. Agreed next steps from most recent note
  const agreedNextSteps = lastNote?.next_steps || session.next_action || '';

  // 4. Unanswered BAP questions
  const bapAnswers = computeBAPAnswers(session);
  const unansweredBAP = BAP_QUESTIONS.filter(q => {
    const answer = bapAnswers[q.id];
    return !answer || answer === 'no';
  });

  // 5. Unanswered call sheet questions (from active persona)
  const personaId = session.call_sheet_persona || session.persona || 'hr-director';
  const sheet = SHEETS.find(s => s.id === personaId);
  const callSheetAnswers = session.call_sheet_answers || {};
  const unansweredCallSheet = (sheet?.questions || []).filter(q => {
    const a = callSheetAnswers[q.id];
    if (Array.isArray(a)) return a.length === 0;
    return !a;
  }).slice(0, 5); // Top 5 unanswered

  // 6. Stage-specific coaching tip
  const stage = session.deal_stage || 'discovery';
  const stageCoachingTips: Record<string, string> = {
    discovery: 'Focus on uncovering pain depth. Ask "what happens if you don\'t solve this?" to quantify the cost of indecision. Aim to pass CP1 (Urgency Test) by end of this call.',
    diagnosis: 'Transition from "what\'s wrong" to "why it\'s wrong." Validate their current approach has failed and they need external help. Get them to verbalize the root cause.',
    demonstrate: 'This is your proof call. Map every pain to a specific capability. Ask for a confidence score (1-10) at the end. If below 8, ask "what would make it a 10?"',
    decision: 'Time to close. Confirm budget, timeline, and paper process. Set the mutual action plan with concrete dates. Ask: "Is there anything that would prevent us from moving forward?"',
  };
  const stageCoachingTip = stageCoachingTips[stage] || stageCoachingTips.discovery;

  // 7. Stakeholder analysis
  const stakeholdersCovered = (session.stakeholders || []).map(s => `${s.name} (${s.role})`);
  const allRoles = ['Champion', 'Economic Buyer', 'Project Lead', 'IT Approver'];
  const coveredRoles = new Set((session.stakeholders || []).map(s => s.role));
  const stakeholdersGap = allRoles.filter(r => !coveredRoles.has(r));

  return {
    lastCallSummary,
    lastCallDate: lastNote?.date || session.last_call_date || '',
    lastCallTitle: lastNote?.title || 'Previous Call',
    keyQuotes: allQuotes.slice(0, 5),
    agreedNextSteps,
    unansweredBAPQuestions: unansweredBAP.map(q => ({ id: q.id, title: q.title, question: q.question })),
    unansweredCallSheetQuestions: unansweredCallSheet.map(q => ({ id: q.id, question: q.question })),
    stageCoachingTip,
    callNumber: notes.length + 1,
    stakeholdersCovered,
    stakeholdersGap,
  };
}

export function CallPrepCard({ session, onDismiss }: CallPrepCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const prep = useMemo(() => buildPrepData(session), [session]);

  if (!prep || dismissed) return null;

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return d;
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss();
  };

  return (
    <div className="mx-4 mb-4 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 overflow-hidden transition-all">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-100/40 border-b border-blue-200/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center">
            <Sparkles size={14} />
          </div>
          <div>
            <h3 className="text-[13px] font-black text-blue-900">
              Call #{prep.callNumber} Prep — {session.company_name}
            </h3>
            <p className="text-[10px] text-blue-600/70">
              {session.next_meeting_date
                ? `Next meeting: ${formatDate(session.next_meeting_date)}`
                : `Last call: ${formatDate(prep.lastCallDate)}`
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-100 transition-colors"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-100 transition-colors"
            title="Dismiss prep card"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 py-3 space-y-4">

          {/* Last Call Summary */}
          {prep.lastCallSummary && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-1.5 flex items-center gap-1.5">
                <Clock size={10} />
                Last Call — {prep.lastCallTitle}
              </h4>
              <p className="text-[11px] text-zinc-700 leading-relaxed bg-white/60 rounded-lg px-3 py-2 border border-blue-100">
                {prep.lastCallSummary}
              </p>
            </div>
          )}

          {/* Key Quotes to Reference */}
          {prep.keyQuotes.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-1.5 flex items-center gap-1.5">
                <MessageSquareQuote size={10} />
                Key Quotes to Reference
              </h4>
              <div className="space-y-1">
                {prep.keyQuotes.map((quote, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white/60 rounded-lg px-3 py-1.5 border border-blue-100">
                    <span className="text-[10px] text-blue-400 mt-0.5 shrink-0">"</span>
                    <p className="text-[10px] text-zinc-600 italic leading-snug">{quote}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agreed Next Steps */}
          {prep.agreedNextSteps && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-1.5 flex items-center gap-1.5">
                <ArrowRight size={10} />
                Agreed Next Steps
              </h4>
              <p className="text-[11px] text-zinc-700 bg-white/60 rounded-lg px-3 py-2 border border-blue-100">
                {prep.agreedNextSteps}
              </p>
            </div>
          )}

          {/* Still Need to Cover */}
          {(prep.unansweredBAPQuestions.length > 0 || prep.unansweredCallSheetQuestions.length > 0) && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-1.5 flex items-center gap-1.5">
                <ListChecks size={10} />
                Still Need to Cover
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {/* BAP gaps */}
                <div className="bg-white/60 rounded-lg px-3 py-2 border border-blue-100">
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">BAP Questions</p>
                  <div className="space-y-1">
                    {prep.unansweredBAPQuestions.slice(0, 4).map(q => (
                      <div key={q.id} className="flex items-start gap-1.5">
                        <span className="w-3 h-3 rounded-full border border-zinc-300 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-zinc-600 leading-snug">{q.title}</p>
                      </div>
                    ))}
                    {prep.unansweredBAPQuestions.length > 4 && (
                      <p className="text-[9px] text-zinc-400">+{prep.unansweredBAPQuestions.length - 4} more</p>
                    )}
                  </div>
                </div>
                {/* Call sheet gaps */}
                <div className="bg-white/60 rounded-lg px-3 py-2 border border-blue-100">
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Discovery Questions</p>
                  <div className="space-y-1">
                    {prep.unansweredCallSheetQuestions.slice(0, 4).map(q => (
                      <div key={q.id} className="flex items-start gap-1.5">
                        <span className="w-3 h-3 rounded-full border border-zinc-300 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-zinc-600 leading-snug truncate">{q.question}</p>
                      </div>
                    ))}
                    {prep.unansweredCallSheetQuestions.length > 4 && (
                      <p className="text-[9px] text-zinc-400">+{prep.unansweredCallSheetQuestions.length - 4} more</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stakeholder Coverage */}
          {prep.stakeholdersGap.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-50/70 rounded-lg px-3 py-2 border border-amber-200/60">
              <span className="text-[10px]">⚠️</span>
              <p className="text-[10px] text-amber-700">
                <span className="font-bold">Multi-threading gap:</span>{' '}
                Haven't engaged {prep.stakeholdersGap.join(', ')}
                {prep.stakeholdersCovered.length > 0 && (
                  <span className="text-amber-500"> — covered: {prep.stakeholdersCovered.join(', ')}</span>
                )}
              </p>
            </div>
          )}

          {/* Stage Coaching Tip */}
          <div className="bg-indigo-50/70 rounded-lg px-3 py-2 border border-indigo-200/60">
            <p className="text-[10px] font-bold text-indigo-600 mb-0.5">💡 Stage Tip</p>
            <p className="text-[10px] text-indigo-700 leading-relaxed">{prep.stageCoachingTip}</p>
          </div>
        </div>
      )}
    </div>
  );
}
