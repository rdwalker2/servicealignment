// ============================================================
// StakeholderSentimentBadge — Per-stakeholder alignment indicator
// Shows champion/supporter/neutral/skeptic/blocker status
// Designed to be placed inline on existing stakeholder cards
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { StakeholderAlignment, StakeholderSentiment } from '../../lib/discoveryDatabase';

const ALIGNMENT_CONFIG: Record<StakeholderAlignment, { emoji: string; label: string; color: string; bg: string; ring: string }> = {
  champion: { emoji: '🏆', label: 'Champion', color: 'text-emerald-600', bg: 'bg-emerald-500/10', ring: 'ring-emerald-300' },
  supporter: { emoji: '👍', label: 'Supporter', color: 'text-blue-600', bg: 'bg-blue-500/10', ring: 'ring-blue-300' },
  neutral: { emoji: '😐', label: 'Neutral', color: 'text-zinc-500', bg: 'bg-zinc-100', ring: 'ring-zinc-300' },
  skeptic: { emoji: '🤔', label: 'Skeptic', color: 'text-amber-600', bg: 'bg-amber-500/10', ring: 'ring-amber-300' },
  blocker: { emoji: '🚫', label: 'Blocker', color: 'text-red-600', bg: 'bg-red-500/10', ring: 'ring-red-300' },
};

interface Props {
  stakeholderId: string;
  sentiment?: StakeholderSentiment;
  onChange: (stakeholderId: string, sentiment: StakeholderSentiment) => void;
  compact?: boolean;
}

export function StakeholderSentimentBadge({ stakeholderId, sentiment, onChange, compact = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState(sentiment?.notes || '');

  const currentAlignment = sentiment?.alignment || 'neutral';
  const config = ALIGNMENT_CONFIG[currentAlignment];

  const handleSelect = (alignment: StakeholderAlignment) => {
    onChange(stakeholderId, {
      alignment,
      notes: notes || sentiment?.notes || '',
      last_updated: new Date().toISOString(),
    });
    if (!compact) setIsOpen(false);
  };

  const handleNotesBlur = () => {
    if (notes !== (sentiment?.notes || '')) {
      onChange(stakeholderId, {
        alignment: currentAlignment,
        notes,
        last_updated: new Date().toISOString(),
      });
    }
  };

  if (compact) {
    // Inline pill: just shows current state with dropdown
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition-all ${config.bg} ${config.color}`}
        >
          {config.emoji} {config.label}
          <ChevronDown size={10} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute right-0 top-full z-50 mt-1 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-lg"
            >
              <div className="flex gap-1">
                {(Object.keys(ALIGNMENT_CONFIG) as StakeholderAlignment[]).map(a => {
                  const cfg = ALIGNMENT_CONFIG[a];
                  return (
                    <button
                      key={a}
                      onClick={() => handleSelect(a)}
                      className={`rounded-md px-2 py-1 text-[10px] font-semibold transition-all ${
                        currentAlignment === a
                          ? `${cfg.bg} ${cfg.color} ring-1 ${cfg.ring}`
                          : 'text-zinc-400 hover:bg-zinc-50'
                      }`}
                      title={cfg.label}
                    >
                      {cfg.emoji}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full version with notes
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        {(Object.keys(ALIGNMENT_CONFIG) as StakeholderAlignment[]).map(a => {
          const cfg = ALIGNMENT_CONFIG[a];
          return (
            <button
              key={a}
              onClick={() => handleSelect(a)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                currentAlignment === a
                  ? `${cfg.bg} ${cfg.color} ring-1 ${cfg.ring}`
                  : 'text-zinc-400 hover:bg-zinc-50'
              }`}
            >
              {cfg.emoji} {cfg.label}
            </button>
          );
        })}
      </div>
      <input
        value={notes}
        onChange={e => setNotes(e.target.value)}
        onBlur={handleNotesBlur}
        placeholder="Notes on this stakeholder's stance..."
        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-600 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none"
      />
    </div>
  );
}
