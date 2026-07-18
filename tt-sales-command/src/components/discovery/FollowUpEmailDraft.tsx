// ============================================================
// FollowUpEmailDraft.tsx — AI-generated follow-up email after calls
// Auto-drafts a personalized email using session data, pains,
// quotes, and next steps. AE reviews + copies to clipboard.
// ============================================================

import React, { useState, useMemo, useCallback } from 'react';
import { Copy, Check, Mail, Sparkles, X, RefreshCw } from 'lucide-react';
import type { DiscoverySession } from '../../lib/discoveryDatabase';
import { TT_PAINS } from './PainDiscoveryModule';

interface FollowUpEmailDraftProps {
  isOpen: boolean;
  onClose: () => void;
  session: DiscoverySession;
  roomUrl?: string;
}

function generateEmail(session: DiscoverySession, roomUrl?: string): { subject: string; body: string } {
  const company = session.company_name;
  const pains = (session.selected_pains || [])
    .map(id => TT_PAINS.find(p => p.id === id)?.title)
    .filter(Boolean);

  // Get the most recent granola note
  const notes = [...(session.granola_notes || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastNote = notes[0];

  // Key quotes from recent notes
  const quotes = notes
    .flatMap(n => n.key_quotes || [])
    .slice(0, 2);

  const nextAction = session.next_action;
  const nextMeeting = session.next_meeting_date;
  const persona = session.persona;

  // Build subject line
  const subject = `Following up — ${company} + Teamtailor`;

  // Build body
  const lines: string[] = [];

  // Opening
  const contactName = session.stakeholders?.[0]?.name || 'there';
  lines.push(`Hi ${contactName},`);
  lines.push('');
  lines.push(`Thanks for taking the time to chat today. I really appreciated learning more about what's happening at ${company}.`);
  lines.push('');

  // Pain recap
  if (pains.length > 0) {
    lines.push('Based on our conversation, here\'s what stood out:');
    lines.push('');
    for (const pain of pains.slice(0, 3)) {
      lines.push(`• ${pain}`);
    }
    lines.push('');
  }

  // Key quotes
  if (quotes.length > 0) {
    lines.push('A few things you mentioned that really resonated:');
    lines.push('');
    for (const q of quotes) {
      lines.push(`> "${q}"`);
    }
    lines.push('');
  }

  // Last call summary
  if (lastNote?.summary) {
    const sentences = lastNote.summary.split(/(?<=[.!?])\s+/).filter(s => s.trim());
    if (sentences.length > 0) {
      lines.push(`Quick summary of what we covered: ${sentences.slice(0, 2).join(' ')}`);
      lines.push('');
    }
  }

  // Room link
  if (roomUrl) {
    lines.push('I\'ve put together a personalized Discovery Room for you and your team. It includes everything we discussed, along with relevant case studies and ROI analysis:');
    lines.push('');
    lines.push(`🔗 ${roomUrl}`);
    lines.push('');
    lines.push('Feel free to share this with anyone on your team who should be involved in the evaluation.');
    lines.push('');
  }

  // Next steps
  if (nextAction || nextMeeting) {
    lines.push('Next steps:');
    if (nextAction) lines.push(`• ${nextAction}`);
    if (nextMeeting) {
      const meetDate = new Date(nextMeeting).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      });
      lines.push(`• Our next conversation is scheduled for ${meetDate}`);
    }
    lines.push('');
  }

  // Closing
  lines.push('Looking forward to continuing the conversation. Let me know if any questions come up in the meantime.');
  lines.push('');
  lines.push('Best,');

  return { subject, body: lines.join('\n') };
}

export function FollowUpEmailDraft({ isOpen, onClose, session, roomUrl }: FollowUpEmailDraftProps) {
  const generated = useMemo(() => generateEmail(session, roomUrl), [session, roomUrl]);
  const [subject, setSubject] = useState(generated.subject);
  const [body, setBody] = useState(generated.body);
  const [copied, setCopied] = useState<'subject' | 'body' | 'all' | null>(null);

  const handleRegenerate = useCallback(() => {
    const fresh = generateEmail(session, roomUrl);
    setSubject(fresh.subject);
    setBody(fresh.body);
  }, [session, roomUrl]);

  const handleCopy = useCallback(async (type: 'subject' | 'body' | 'all') => {
    const text = type === 'subject' ? subject : type === 'body' ? body : `Subject: ${subject}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  }, [subject, body]);

  const handleOpenMail = useCallback(() => {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
  }, [subject, body]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl bg-white shadow-2xl border border-zinc-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center">
              <Mail size={16} />
            </div>
            <div>
              <h2 className="text-sm font-black text-zinc-900">Follow-Up Email Draft</h2>
              <p className="text-[10px] text-zinc-400">Auto-generated from your call data — edit before sending</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleRegenerate}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors"
              title="Regenerate draft"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Subject line */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Subject</label>
              <button
                onClick={() => handleCopy('subject')}
                className="flex items-center gap-1 text-[10px] font-medium text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                {copied === 'subject' ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                {copied === 'subject' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-800 font-medium focus:outline-none focus:border-zinc-400 focus:bg-white transition-colors"
            />
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Body</label>
              <button
                onClick={() => handleCopy('body')}
                className="flex items-center gap-1 text-[10px] font-medium text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                {copied === 'body' ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                {copied === 'body' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={18}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-[12px] text-zinc-700 leading-relaxed font-mono focus:outline-none focus:border-zinc-400 focus:bg-white transition-colors resize-none"
            />
          </div>

          {/* Data source indicators */}
          <div className="flex flex-wrap gap-1.5">
            {(session.selected_pains?.length || 0) > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 text-violet-600 px-2 py-0.5 text-[9px] font-bold">
                <Sparkles size={8} /> {session.selected_pains!.length} pains referenced
              </span>
            )}
            {(session.granola_notes?.length || 0) > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 text-blue-600 px-2 py-0.5 text-[9px] font-bold">
                <Sparkles size={8} /> {session.granola_notes!.length} call notes used
              </span>
            )}
            {roomUrl && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-600 px-2 py-0.5 text-[9px] font-bold">
                <Sparkles size={8} /> Room link included
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 flex items-center gap-3">
          <button
            onClick={() => handleCopy('all')}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-zinc-900 text-white py-2.5 text-sm font-bold hover:bg-zinc-800 transition-colors"
          >
            {copied === 'all' ? (
              <><Check size={14} className="text-emerald-400" /> Copied to Clipboard</>
            ) : (
              <><Copy size={14} /> Copy Full Email</>
            )}
          </button>
          <button
            onClick={handleOpenMail}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <Mail size={14} /> Open in Email
          </button>
        </div>
      </div>
    </div>
  );
}
