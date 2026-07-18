// ============================================================
// EditableSectionWrap — Section wrapper with edit overlay
// Used in the Room Builder (rep's WYSIWYG editing surface)
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Settings, Lock, ChevronDown } from 'lucide-react';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const CP_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CP1: { bg: '#0ea5e910', text: '#0ea5e9', border: '#0ea5e930' },
  CP2: { bg: '#8b5cf610', text: '#8b5cf6', border: '#8b5cf630' },
  CP3: { bg: '#10b98110', text: '#10b981', border: '#10b98130' },
};

interface EditableSectionWrapProps {
  id: string;
  label: string;
  checkpoint: 'CP1' | 'CP2' | 'CP3';
  checkpointLabel: string;
  visible: boolean;
  locked: boolean;
  unlockStageLabel?: string;
  hasConfig: boolean;
  onToggleVisibility: () => void;
  children: React.ReactNode;
  configContent?: React.ReactNode;
}

export function EditableSectionWrap({
  id,
  label,
  checkpoint,
  checkpointLabel,
  visible,
  locked,
  unlockStageLabel,
  hasConfig,
  onToggleVisibility,
  children,
  configContent,
}: EditableSectionWrapProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const cp = CP_COLORS[checkpoint];

  // ── Locked section ──
  if (locked && !visible) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-4 py-3 flex items-center gap-3 opacity-50">
        <Lock size={14} className="text-zinc-300 shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-semibold text-zinc-400">{label}</span>
          {unlockStageLabel && (
            <span className="ml-2 text-[9px] font-bold text-zinc-300">Unlocks {unlockStageLabel}</span>
          )}
        </div>
        <span
          className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{ backgroundColor: cp.bg, color: cp.text }}
        >
          {checkpointLabel}
        </span>
      </div>
    );
  }

  // ── Hidden section (toggled off) ──
  if (!visible) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/30 px-4 py-3 flex items-center gap-3 group hover:border-zinc-300 transition-colors">
        <button
          onClick={onToggleVisibility}
          className="shrink-0 text-zinc-300 hover:text-zinc-500 transition-colors"
          title="Show section"
        >
          <EyeOff size={14} />
        </button>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-semibold text-zinc-400">{label}</span>
          <span className="ml-2 text-[9px] text-zinc-300">Hidden from prospect</span>
        </div>
        <span
          className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{ backgroundColor: cp.bg, color: cp.text }}
        >
          {checkpointLabel}
        </span>
      </div>
    );
  }

  // ── Visible section with edit overlay ──
  return (
    <div
      id={`builder-${id}`}
      className={`relative rounded-2xl border transition-all duration-200 overflow-hidden ${
        isHovered || isConfigOpen
          ? 'border-zinc-300 shadow-md ring-1 ring-zinc-200/50'
          : 'border-zinc-200 shadow-sm'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Section control bar ── */}
      <div className={`flex items-center gap-2 px-4 py-2 border-b transition-colors duration-200 ${
        isHovered || isConfigOpen ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-zinc-100'
      }`}>
        {/* Checkpoint badge */}
        <span
          className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
          style={{ backgroundColor: cp.bg, color: cp.text, border: `1px solid ${cp.border}` }}
        >
          {checkpointLabel}
        </span>

        {/* Section label */}
        <span className="text-[11px] font-bold text-zinc-700 flex-1">{label}</span>

        {/* Configure button (appears on hover or when open) */}
        <AnimatePresence>
          {hasConfig && (isHovered || isConfigOpen) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                isConfigOpen
                  ? 'bg-zinc-800 text-white'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700'
              }`}
            >
              <Settings size={10} />
              Configure
              <ChevronDown
                size={10}
                className={`transition-transform duration-200 ${isConfigOpen ? 'rotate-180' : ''}`}
              />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Visibility toggle */}
        <button
          onClick={onToggleVisibility}
          className="shrink-0 text-zinc-400 hover:text-zinc-600 transition-colors p-1 rounded-md hover:bg-zinc-100"
          title={visible ? 'Hide from prospect' : 'Show to prospect'}
        >
          <Eye size={13} />
        </button>
      </div>

      {/* ── Config panel (expands inline) ── */}
      <AnimatePresence>
        {isConfigOpen && hasConfig && configContent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4 bg-zinc-50/80 border-b border-zinc-200">
              {configContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Actual section content (rendered as prospect sees it) ── */}
      <div className="bg-white">
        {children}
      </div>
    </div>
  );
}
