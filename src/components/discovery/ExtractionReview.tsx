// ============================================================
// ExtractionReview — Review + approve AI-extracted transcript data
// Shows extracted fields grouped by section with confidence badges,
// evidence quotes, and conflict detection. Rep approves before merge.
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, AlertTriangle, XCircle, X, ChevronDown, ChevronUp,
  Sparkles, Quote, FileText, Shield, Target, Zap, Check,
} from 'lucide-react';
import type { ExtractedField, ExtractionResult } from '../../lib/granolaLLMExtractor';

const SECTION_CONFIG: Record<string, { label: string; icon: typeof FileText; color: string; bg: string }> = {
  call_sheet: { label: 'Call Sheet', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  bap:        { label: 'Buyer\'s Action Plan', icon: Target, color: 'text-violet-600', bg: 'bg-violet-50' },
  meddpicc:   { label: 'MEDDPICC', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  deal_intel:  { label: 'Deal Intelligence', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
  meta:       { label: 'Room Content & Quotes', icon: Quote, color: 'text-pink-600', bg: 'bg-pink-50' },
};

const CONFIDENCE_BADGE: Record<string, { label: string; icon: typeof CheckCircle2; cls: string }> = {
  high:   { label: 'High', icon: CheckCircle2, cls: 'text-emerald-600 bg-emerald-50' },
  medium: { label: 'Med',  icon: AlertTriangle, cls: 'text-amber-600 bg-amber-50' },
  low:    { label: 'Low',  icon: XCircle, cls: 'text-red-500 bg-red-50' },
};

interface Props {
  result: ExtractionResult;
  onApply: (selectedKeys: Set<string>) => void;
  onClose: () => void;
}

export function ExtractionReview({ result, onApply, onClose }: Props) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => {
    // Auto-select all high-confidence, non-conflicting fields
    return new Set(
      result.fields
        .filter(f => f.confidence === 'high' && !f.hasConflict)
        .map(f => f.key)
    );
  });
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    // Auto-expand sections that have fields
    return new Set(Object.keys(SECTION_CONFIG));
  });

  // Group fields by section
  const grouped = useMemo(() => {
    const map = new Map<string, ExtractedField[]>();
    for (const field of result.fields) {
      const section = field.section;
      if (!map.has(section)) map.set(section, []);
      map.get(section)!.push(field);
    }
    return map;
  }, [result.fields]);

  const toggleField = useCallback((key: string) => {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedKeys(new Set(result.fields.map(f => f.key)));
  }, [result.fields]);

  const selectHighConfidence = useCallback(() => {
    setSelectedKeys(new Set(
      result.fields.filter(f => f.confidence === 'high').map(f => f.key)
    ));
  }, [result.fields]);

  const deselectAll = useCallback(() => {
    setSelectedKeys(new Set());
  }, []);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }, []);

  const totalFields = result.fields.length;
  const selectedCount = selectedKeys.size;
  const highConfCount = result.fields.filter(f => f.confidence === 'high').length;
  const conflictCount = result.fields.filter(f => f.hasConflict).length;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-x-4 top-[3%] z-50 mx-auto max-w-3xl max-h-[94vh] flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="border-b border-zinc-100 px-5 py-4 shrink-0 bg-gradient-to-r from-violet-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                <Sparkles size={20} className="text-violet-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">AI Extraction Results</h3>
                <p className="text-[11px] text-zinc-500">
                  {totalFields} fields extracted · {highConfCount} high confidence
                  {conflictCount > 0 && <span className="text-amber-600 font-semibold"> · {conflictCount} conflicts</span>}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
              <X size={18} />
            </button>
          </div>

          {/* Summary bar */}
          {result.summary && (
            <div className="mt-3 rounded-lg bg-white border border-zinc-100 px-3 py-2">
              <p className="text-xs text-zinc-600 leading-relaxed">{result.summary}</p>
            </div>
          )}

          {/* Quick actions */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={selectAll}
              className="rounded-lg px-2.5 py-1 text-[10px] font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors"
            >
              Select All ({totalFields})
            </button>
            <button
              onClick={selectHighConfidence}
              className="rounded-lg px-2.5 py-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
            >
              High Confidence Only ({highConfCount})
            </button>
            <button
              onClick={deselectAll}
              className="rounded-lg px-2.5 py-1 text-[10px] font-semibold text-zinc-400 hover:bg-zinc-100 transition-colors"
            >
              Deselect All
            </button>
            <div className="flex-1" />
            <span className="text-[10px] font-bold text-zinc-400">
              {selectedCount}/{totalFields} selected
            </span>
          </div>
        </div>

        {/* Key Quotes */}
        {result.key_quotes.length > 0 && (
          <div className="border-b border-zinc-100 px-5 py-3 bg-violet-50/30">
            <p className="text-[9px] font-bold uppercase tracking-wider text-violet-500 mb-1.5 flex items-center gap-1">
              <Quote size={9} /> Key Prospect Quotes
            </p>
            <div className="space-y-1">
              {result.key_quotes.slice(0, 5).map((q, i) => (
                <p key={i} className="text-[11px] italic text-violet-700 leading-snug">
                  "{q}"
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Field Groups */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {Array.from(grouped.entries()).map(([section, fields]) => {
            const config = SECTION_CONFIG[section] || SECTION_CONFIG.meta;
            const SectionIcon = config.icon;
            const isExpanded = expandedSections.has(section);
            const sectionSelected = fields.filter(f => selectedKeys.has(f.key)).length;

            return (
              <div key={section} className="mb-3">
                <button
                  onClick={() => toggleSection(section)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-zinc-50"
                >
                  <div className={`flex h-6 w-6 items-center justify-center rounded-md ${config.bg}`}>
                    <SectionIcon size={12} className={config.color} />
                  </div>
                  <span className="text-xs font-bold text-zinc-800">{config.label}</span>
                  <span className="text-[10px] text-zinc-400">
                    {sectionSelected}/{fields.length} selected
                  </span>
                  <div className="flex-1" />
                  {isExpanded ? <ChevronUp size={14} className="text-zinc-400" /> : <ChevronDown size={14} className="text-zinc-400" />}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1 pl-2 pr-1 pb-2">
                        {fields.map(field => {
                          const isSelected = selectedKeys.has(field.key);
                          const conf = CONFIDENCE_BADGE[field.confidence] || CONFIDENCE_BADGE.medium;
                          const ConfIcon = conf.icon;
                          const isLongValue = typeof field.value === 'string' && field.value.length > 120;

                          return (
                            <div
                              key={field.key}
                              onClick={() => toggleField(field.key)}
                              className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-violet-200 bg-violet-50/30'
                                  : 'border-zinc-100 bg-white hover:bg-zinc-50'
                              }`}
                            >
                              {/* Checkbox */}
                              <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                                isSelected ? 'border-violet-500 bg-violet-500' : 'border-zinc-300'
                              }`}>
                                {isSelected && <Check size={10} className="text-white" />}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-[11px] font-semibold text-zinc-700 truncate">{field.label}</span>
                                  <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[8px] font-bold ${conf.cls}`}>
                                    <ConfIcon size={8} />{conf.label}
                                  </span>
                                  {field.hasConflict && (
                                    <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[8px] font-bold text-amber-600 bg-amber-50">
                                      <AlertTriangle size={8} />Conflict
                                    </span>
                                  )}
                                </div>

                                {/* Value */}
                                <p className={`text-[11px] text-zinc-600 leading-snug ${isLongValue ? '' : 'truncate'}`}>
                                  {typeof field.value === 'string'
                                    ? (isLongValue ? field.value.slice(0, 300) + '…' : field.value)
                                    : JSON.stringify(field.value)}
                                </p>

                                {/* Evidence quote */}
                                {field.evidence && field.evidence !== field.value && (
                                  <p className="mt-1 text-[10px] italic text-violet-500 leading-snug border-l-2 border-violet-200 pl-2">
                                    "{field.evidence.slice(0, 150)}{field.evidence.length > 150 ? '…' : ''}"
                                  </p>
                                )}

                                {/* Conflict detail */}
                                {field.hasConflict && field.existingValue && (
                                  <div className="mt-1 rounded bg-amber-50 px-2 py-1">
                                    <p className="text-[9px] font-bold text-amber-600 mb-0.5">EXISTING VALUE:</p>
                                    <p className="text-[10px] text-amber-700">
                                      {typeof field.existingValue === 'string'
                                        ? field.existingValue.slice(0, 100)
                                        : JSON.stringify(field.existingValue)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3 shrink-0 bg-zinc-50/50">
          <div className="text-[10px] text-zinc-400">
            {result.next_steps && (
              <span className="flex items-center gap-1">
                <Zap size={10} className="text-amber-500" />
                <strong>Next Steps:</strong> {result.next_steps.slice(0, 80)}
                {result.next_steps.length > 80 ? '…' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              onClick={() => onApply(selectedKeys)}
              disabled={selectedCount === 0}
              className="rounded-lg bg-violet-600 px-5 py-2 text-xs font-bold text-white transition-all hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Apply {selectedCount} Field{selectedCount !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
