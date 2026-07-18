// ============================================================
// LossReasonCapture — Modal for capturing why a deal was lost
// Triggered when deal_stage changes to 'closed_lost'
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Calendar, RefreshCw } from 'lucide-react';
import type { LossReason } from '../../lib/discoveryDatabase';

const PRIMARY_REASONS: { value: LossReason['primary']; label: string; emoji: string }[] = [
  { value: 'competitor', label: 'Lost to Competitor', emoji: '⚔️' },
  { value: 'no-decision', label: 'No Decision / Status Quo', emoji: '🤷' },
  { value: 'budget', label: 'Budget / Funding Cut', emoji: '💰' },
  { value: 'timing', label: 'Bad Timing', emoji: '⏰' },
  { value: 'champion-left', label: 'Champion Left', emoji: '🚪' },
  { value: 'internal-solution', label: 'Built Internally', emoji: '🏗️' },
  { value: 'other', label: 'Other', emoji: '📋' },
];

const COMPETITOR_OPTIONS = [
  'Ashby', 'Greenhouse', 'Lever', 'Workday', 'iCIMS',
  'SmartRecruiters', 'BreezyHR', 'Workable', 'JazzHR', 'Other',
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reason: LossReason) => void;
  existingReason?: LossReason;
  companyName: string;
}

export function LossReasonCapture({ isOpen, onClose, onSave, existingReason, companyName }: Props) {
  const [primary, setPrimary] = useState<LossReason['primary']>(existingReason?.primary || 'no-decision');
  const [secondary, setSecondary] = useState(existingReason?.secondary || '');
  const [competitorWon, setCompetitorWon] = useState(existingReason?.competitor_won || '');
  const [notes, setNotes] = useState(existingReason?.notes || '');
  const [winbackPotential, setWinbackPotential] = useState(existingReason?.winback_potential || false);
  const [winbackDate, setWinbackDate] = useState(existingReason?.winback_date || '');

  const handleSave = () => {
    onSave({
      primary,
      secondary: secondary || undefined,
      competitor_won: primary === 'competitor' ? competitorWon : undefined,
      notes,
      winback_potential: winbackPotential,
      winback_date: winbackPotential ? winbackDate : undefined,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" />
                <h3 className="text-sm font-bold text-zinc-900">Deal Lost — {companyName}</h3>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 px-6 py-4">
              {/* Primary Reason */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 block">Why did we lose?</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRIMARY_REASONS.map(r => (
                    <button
                      key={r.value}
                      onClick={() => setPrimary(r.value)}
                      className={`rounded-lg px-3 py-2 text-left text-xs font-medium transition-all ${
                        primary === r.value
                          ? 'bg-red-500/10 text-red-700 ring-1 ring-red-300'
                          : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100'
                      }`}
                    >
                      {r.emoji} {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Competitor Won */}
              {primary === 'competitor' && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 block">Which competitor won?</label>
                  <select
                    value={competitorWon}
                    onChange={e => setCompetitorWon(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:border-red-300 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    {COMPETITOR_OPTIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Secondary Detail */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 block">Additional Detail</label>
                <input
                  value={secondary}
                  onChange={e => setSecondary(e.target.value)}
                  placeholder="Any specific context..."
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none"
                />
              </div>

              {/* What We Learned */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 block">What did we learn?</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Post-mortem: what could we do differently next time?"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none"
                  rows={3}
                />
              </div>

              {/* Winback */}
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWinbackPotential(!winbackPotential)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                      winbackPotential
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-zinc-300 bg-white'
                    }`}
                  >
                    {winbackPotential && <RefreshCw size={10} className="text-white" />}
                  </button>
                  <label className="text-xs font-semibold text-zinc-700">Is there a winback path?</label>
                </div>
                {winbackPotential && (
                  <div className="mt-2 flex items-center gap-2 pl-7">
                    <Calendar size={12} className="text-zinc-400" />
                    <input
                      type="date"
                      value={winbackDate}
                      onChange={e => setWinbackDate(e.target.value)}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 focus:border-emerald-300 focus:outline-none"
                    />
                    <span className="text-[10px] text-zinc-400">Re-engage date</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t border-zinc-100 px-6 py-3">
              <button onClick={onClose} className="rounded-lg px-4 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-100">
                Skip
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-zinc-800"
              >
                Save Loss Reason
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
