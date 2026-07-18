import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, PhoneOff, X, Clock, CheckCircle2, MessageSquare,
  Loader2, AlertCircle, ChevronDown,
} from 'lucide-react';

// ── Types ──

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: {
    name: string;
    email: string;
    phone?: string;
    title?: string;
    companyName: string;
    companyDomain?: string;
  };
  onCallLogged?: (result: CallResult) => void;
}

interface CallResult {
  sentiment: string;
  disposition: string;
  duration: number;
  notes: string;
  callId?: number;
}

// ── Constants ──

const SENTIMENTS = [
  { id: 'Interested', label: 'Interested', icon: '🟢', color: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  { id: 'Neutral', label: 'Neutral', icon: '🟡', color: 'bg-amber-50 text-amber-700 ring-amber-200' },
  { id: 'Not Interested', label: 'Not Interested', icon: '🔴', color: 'bg-red-50 text-red-700 ring-red-200' },
];

const DISPOSITIONS = [
  { id: 'Connected', label: 'Connected', icon: '✅' },
  { id: 'Left Voicemail', label: 'Left Voicemail', icon: '📩' },
  { id: 'No Answer', label: 'No Answer', icon: '📵' },
  { id: 'Busy', label: 'Busy', icon: '🔄' },
  { id: 'Wrong Number', label: 'Wrong Number', icon: '❌' },
  { id: 'Gatekeeper', label: 'Gatekeeper', icon: '🚪' },
  { id: 'Requested Callback', label: 'Callback Requested', icon: '📞' },
  { id: 'Meeting Set', label: 'Meeting Set!', icon: '📅' },
];

type ModalPhase = 'calling' | 'outcome' | 'submitting' | 'done';

// ── Component ──

export function CallModal({ isOpen, onClose, contact, onCallLogged }: CallModalProps) {
  const [phase, setPhase] = useState<ModalPhase>('calling');
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [sentiment, setSentiment] = useState('');
  const [disposition, setDisposition] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setPhase('calling');
      setCallStartTime(Date.now());
      setElapsed(0);
      setSentiment('');
      setDisposition('');
      setNotes('');
      setError('');
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  // Timer
  useEffect(() => {
    if (phase === 'calling' && callStartTime) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, callStartTime]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('outcome');
  };

  const handleSubmit = async () => {
    if (!disposition) {
      setError('Select a call outcome');
      return;
    }

    setPhase('submitting');
    setError('');

    try {
      const resp = await fetch('/api/salesloft/log-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: contact.email,
          phone: contact.phone,
          sentiment: sentiment || undefined,
          disposition,
          duration: elapsed,
          notes,
        }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || 'Failed to log call');
      }

      setPhase('done');
      onCallLogged?.({
        sentiment,
        disposition,
        duration: elapsed,
        notes,
        callId: data.callId,
      });

      // Auto-close after 1.5s
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to log call');
      setPhase('outcome');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-[420px] max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 pt-4 pb-3 border-b border-stone-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-bold
                  ${phase === 'calling' ? 'bg-emerald-500 animate-pulse' : phase === 'done' ? 'bg-emerald-500' : 'bg-stone-700'}`}>
                  {phase === 'calling' ? <Phone size={16} /> : phase === 'done' ? <CheckCircle2 size={16} /> : <PhoneOff size={16} />}
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-stone-900">{contact.name}</div>
                  <div className="text-[11px] text-stone-500">{contact.title} · {contact.companyName}</div>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* ── Phase: Calling ── */}
          {phase === 'calling' && (
            <div className="px-5 py-6 text-center">
              <div className="mb-4">
                <a
                  href={`tel:${contact.phone}`}
                  className="text-[22px] font-mono font-semibold text-stone-900 hover:text-emerald-600 transition"
                >
                  {contact.phone || 'No phone number'}
                </a>
              </div>

              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Clock size={13} className="text-stone-400" />
                <span className="text-[18px] font-mono font-semibold text-stone-700">{formatTime(elapsed)}</span>
              </div>

              <button
                onClick={handleEndCall}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold text-[13px] rounded-xl transition-colors shadow-lg shadow-red-500/20"
              >
                <PhoneOff size={15} />
                End Call & Log Outcome
              </button>

              <p className="text-[10px] text-stone-400 mt-3">
                Click the phone number to dial · Timer tracks call duration
              </p>
            </div>
          )}

          {/* ── Phase: Outcome ── */}
          {phase === 'outcome' && (
            <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Duration summary */}
              <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-lg">
                <Clock size={12} className="text-stone-400" />
                <span className="text-[11px] font-medium text-stone-600">Call duration: {formatTime(elapsed)}</span>
              </div>

              {/* Call Outcome (required) */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2 block">
                  Call Outcome *
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {DISPOSITIONS.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setDisposition(d.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-[11px] font-semibold transition-all ring-1
                        ${disposition === d.id
                          ? 'bg-stone-900 text-white ring-stone-900 shadow-md'
                          : 'bg-white text-stone-600 ring-stone-200 hover:ring-stone-300 hover:bg-stone-50'}`}
                    >
                      <span className="text-[13px]">{d.icon}</span>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sentiment (optional, shows only if connected) */}
              {(disposition === 'Connected' || disposition === 'Meeting Set') && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2 block">
                    How'd it go?
                  </label>
                  <div className="flex gap-2">
                    {SENTIMENTS.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSentiment(s.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-[11px] font-semibold transition-all ring-1
                          ${sentiment === s.id
                            ? `${s.color} ring-current shadow-sm`
                            : 'bg-white text-stone-500 ring-stone-200 hover:bg-stone-50'}`}
                      >
                        <span>{s.icon}</span>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Notes */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5 block">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="What happened on the call? Key takeaways, next steps..."
                  className="w-full h-20 px-3 py-2 text-[12px] text-stone-700 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400/30 resize-none placeholder:text-stone-400"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-700">
                  <AlertCircle size={12} />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!disposition}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold transition-all
                  ${disposition
                    ? 'bg-stone-900 text-white hover:bg-stone-800 shadow-lg shadow-stone-900/20'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
              >
                <MessageSquare size={14} />
                Log Call to Salesloft
              </button>

              <p className="text-[9px] text-stone-400 text-center">
                Call will be logged in Salesloft → syncs to Salesforce as a Task
              </p>
            </div>
          )}

          {/* ── Phase: Submitting ── */}
          {phase === 'submitting' && (
            <div className="px-5 py-10 text-center">
              <Loader2 size={24} className="animate-spin text-stone-400 mx-auto mb-3" />
              <div className="text-[13px] font-medium text-stone-600">Logging call to Salesloft...</div>
            </div>
          )}

          {/* ── Phase: Done ── */}
          {phase === 'done' && (
            <div className="px-5 py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={24} className="text-emerald-600" />
              </div>
              <div className="text-[14px] font-semibold text-stone-900">Call Logged</div>
              <div className="text-[11px] text-stone-500 mt-1">
                {disposition}{sentiment ? ` · ${sentiment}` : ''} · {formatTime(elapsed)}
              </div>
              <div className="text-[10px] text-stone-400 mt-2">Syncing to Salesforce...</div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CallModal;
