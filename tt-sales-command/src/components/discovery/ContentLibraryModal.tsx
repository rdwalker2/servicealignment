// ============================================================
// ContentLibraryModal.tsx — Browse & insert CMS content widgets
// 103 widgets · 7 categories · smart suggestions per deal
// ============================================================

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  BookOpen,
  Star,
  Tag,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Shield,
  AlertTriangle,
  Layers,
  BarChart3,
  DollarSign,
  Award,
  Eye,
  Plus,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────

export interface LibraryWidget {
  id: string;
  title: string;
  category: string;
  description?: string;
  tags: string[];
  preview?: string;
  source?: string;
  content?: Record<string, any>;
  data?: any;
  matchSignals?: Record<string, string[]>;
  _score?: number;
  _reasons?: string[];
}

export interface LibraryCategory {
  id: string;
  label: string;
  icon: string;
  description?: string;
  allowedSections?: string[];
}

interface LibraryResponse {
  widgets: LibraryWidget[];
  categories: LibraryCategory[];
  total: number;
}

interface SuggestResponse {
  suggestions: LibraryWidget[];
  context?: Record<string, any>;
  total: number;
}

export interface ContentLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (widget: LibraryWidget) => void;
  companyName: string;
  sessionSlug?: string;
  currentAts?: string;
  industry?: string;
  filterCategory?: string;
}

// ── Icon helper ─────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'case-studies':          <Award size={12} />,
  'g2-reviews':            <Star size={12} />,
  'competitor-battlecards': <Shield size={12} />,
  'competitor-weaknesses': <AlertTriangle size={12} />,
  'feature-deep-dives':    <Layers size={12} />,
  'industry-benchmarks':   <BarChart3 size={12} />,
  'roi-templates':         <DollarSign size={12} />,
};

// ── Main Component ──────────────────────────────────────────────────────

export function ContentLibraryModal({
  isOpen,
  onClose,
  onInsert,
  companyName,
  sessionSlug,
  currentAts,
  industry,
  filterCategory,
}: ContentLibraryModalProps) {
  // Data state
  const [widgets, setWidgets] = useState<LibraryWidget[]>([]);
  const [categories, setCategories] = useState<LibraryCategory[]>([]);
  const [suggestions, setSuggestions] = useState<LibraryWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(filterCategory || '');
  const [expandedWidgetId, setExpandedWidgetId] = useState<string | null>(null);
  const [suggestionsExpanded, setSuggestionsExpanded] = useState(true);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // ── Load data ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setError(null);

    const fetchLibrary = fetch('/cms-api/library')
      .then(r => {
        if (!r.ok) throw new Error(`Library fetch failed: ${r.status}`);
        return r.json() as Promise<LibraryResponse>;
      });

    const fetchSuggestions = sessionSlug
      ? fetch(`/cms-api/library/suggest/${sessionSlug}`)
          .then(r => r.ok ? r.json() as Promise<SuggestResponse> : { suggestions: [], total: 0 })
          .catch(() => ({ suggestions: [] as LibraryWidget[], total: 0 }))
      : Promise.resolve({ suggestions: [] as LibraryWidget[], total: 0 });

    Promise.all([fetchLibrary, fetchSuggestions])
      .then(([libData, sugData]) => {
        setWidgets(libData.widgets || []);
        setCategories(libData.categories || []);
        setSuggestions(sugData.suggestions || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load library');
        setLoading(false);
      });
  }, [isOpen, sessionSlug]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setDebouncedQuery('');
      setActiveCategory(filterCategory || '');
      setExpandedWidgetId(null);
      setSuggestionsExpanded(true);
      // Focus search after animation
      setTimeout(() => searchInputRef.current?.focus(), 200);
    }
  }, [isOpen, filterCategory]);

  // ── Debounced search ──────────────────────────────────────────────────

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery]);

  // ── Filtering ─────────────────────────────────────────────────────────

  const filteredWidgets = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();
    return widgets.filter(w => {
      if (activeCategory && w.category !== activeCategory) return false;
      if (q) {
        return (
          (w.title || '').toLowerCase().includes(q) ||
          (w.description || '').toLowerCase().includes(q) ||
          (w.tags || []).some(t => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [widgets, activeCategory, debouncedQuery]);

  const suggestionIds = useMemo(() => new Set(suggestions.map(s => s.id)), [suggestions]);

  const nonSuggestedWidgets = useMemo(
    () => filteredWidgets.filter(w => !suggestionIds.has(w.id)),
    [filteredWidgets, suggestionIds],
  );

  const showSuggestions = !debouncedQuery && !activeCategory && suggestions.length > 0;

  // ── Category counts ───────────────────────────────────────────────────

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    widgets.forEach(w => {
      counts[w.category] = (counts[w.category] || 0) + 1;
    });
    return counts;
  }, [widgets]);

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleInsert = useCallback(
    (widget: LibraryWidget) => {
      onInsert(widget);
      onClose();
    },
    [onInsert, onClose],
  );

  const toggleCategory = useCallback((catId: string) => {
    setActiveCategory(prev => (prev === catId ? '' : catId));
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="content-library-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
          onKeyDown={handleKeyDown}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            className="w-full max-w-4xl max-h-[85vh] rounded-2xl bg-white shadow-2xl border border-stone-200 flex flex-col overflow-hidden"
          >
            {/* ─── Header ─────────────────────────────────────────── */}
            <div className="flex-shrink-0 px-6 pt-5 pb-4 border-b border-stone-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-stone-900">Content Library</h2>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      {widgets.length || 103} widgets · {categories.length || 7} categories
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search widgets, tags, competitors…"
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-200 bg-stone-50 text-[12px] text-stone-700 placeholder:text-stone-400 focus:border-stone-300 focus:ring-1 focus:ring-stone-200 focus:bg-white focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-1.5 mt-3 overflow-x-auto scrollbar-none pb-0.5">
                <CategoryPill
                  label="All"
                  count={widgets.length}
                  active={!activeCategory}
                  onClick={() => setActiveCategory('')}
                />
                {categories.map(cat => (
                  <CategoryPill
                    key={cat.id}
                    label={cat.label}
                    count={categoryCounts[cat.id] || 0}
                    active={activeCategory === cat.id}
                    icon={CATEGORY_ICONS[cat.id]}
                    onClick={() => toggleCategory(cat.id)}
                  />
                ))}
              </div>
            </div>

            {/* ─── Body ───────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loading ? (
                <LoadingState />
              ) : error ? (
                <ErrorState message={error} />
              ) : (
                <>
                  {/* Suggestions section */}
                  {showSuggestions && (
                    <div className="mb-5">
                      <button
                        onClick={() => setSuggestionsExpanded(prev => !prev)}
                        className="flex items-center gap-2 mb-2 group"
                      >
                        <Sparkles size={12} className="text-amber-500" />
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                          Suggested for {companyName}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          ({suggestions.length})
                        </span>
                        {suggestionsExpanded
                          ? <ChevronUp size={12} className="text-stone-400" />
                          : <ChevronDown size={12} className="text-stone-400" />}
                      </button>

                      <AnimatePresence initial={false}>
                        {suggestionsExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-2 gap-2">
                              {suggestions.map(w => (
                                <WidgetCard
                                  key={w.id}
                                  widget={w}
                                  categories={categories}
                                  isSuggestion
                                  isExpanded={expandedWidgetId === w.id}
                                  onToggleExpand={() =>
                                    setExpandedWidgetId(prev => (prev === w.id ? null : w.id))
                                  }
                                  onInsert={handleInsert}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="mt-4 mb-2 flex items-center gap-2">
                        <div className="flex-1 h-px bg-stone-100" />
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                          All Widgets
                        </span>
                        <div className="flex-1 h-px bg-stone-100" />
                      </div>
                    </div>
                  )}

                  {/* Widget grid */}
                  {(showSuggestions ? nonSuggestedWidgets : filteredWidgets).length === 0 ? (
                    <EmptyState query={debouncedQuery} />
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {(showSuggestions ? nonSuggestedWidgets : filteredWidgets).map(w => (
                        <WidgetCard
                          key={w.id}
                          widget={w}
                          categories={categories}
                          isSuggestion={false}
                          isExpanded={expandedWidgetId === w.id}
                          onToggleExpand={() =>
                            setExpandedWidgetId(prev => (prev === w.id ? null : w.id))
                          }
                          onInsert={handleInsert}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ─── Footer ─────────────────────────────────────────── */}
            <div className="flex-shrink-0 px-6 py-3 border-t border-stone-100 flex items-center justify-between">
              <p className="text-[10px] text-stone-400">
                {filteredWidgets.length} widget{filteredWidgets.length !== 1 ? 's' : ''} shown
                {debouncedQuery && ` for "${debouncedQuery}"`}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg border border-stone-200 text-[11px] font-semibold text-stone-500 hover:bg-stone-50 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────

function CategoryPill({
  label,
  count,
  active,
  icon,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold transition-all ${
        active
          ? 'bg-indigo-600 text-white shadow-sm'
          : 'bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700'
      }`}
    >
      {icon}
      <span>{label}</span>
      <span className={`${active ? 'text-indigo-200' : 'text-stone-400'}`}>
        {count}
      </span>
    </button>
  );
}

function WidgetCard({
  widget,
  categories,
  isSuggestion,
  isExpanded,
  onToggleExpand,
  onInsert,
}: {
  widget: LibraryWidget;
  categories: LibraryCategory[];
  isSuggestion: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onInsert: (widget: LibraryWidget) => void;
}) {
  const cat = categories.find(c => c.id === widget.category);
  const catLabel = cat?.label || widget.category;
  const content = widget.content || {};

  return (
    <motion.div
      layout
      className={`rounded-xl border transition-all ${
        isSuggestion
          ? 'border-amber-200 bg-amber-50/50'
          : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
      }`}
    >
      {/* Card header */}
      <div className="px-3.5 pt-3 pb-2.5">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-md bg-stone-100 px-1.5 py-0.5 text-[9px] font-medium text-stone-500">
              {CATEGORY_ICONS[widget.category]}
              {catLabel}
            </span>
            {isSuggestion && widget._score != null && (
              <span className="flex-shrink-0 inline-flex items-center gap-0.5 rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                <Star size={8} className="fill-amber-500 text-amber-500" />
                {Math.round(widget._score)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={onToggleExpand}
              className="w-6 h-6 rounded-md flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
              title="Preview"
            >
              <Eye size={12} />
            </button>
            <button
              onClick={() => onInsert(widget)}
              className="flex items-center gap-1 rounded-md bg-indigo-600 text-white px-2 py-1 text-[10px] font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Plus size={10} />
              Insert
            </button>
          </div>
        </div>

        <h4 className="text-[12px] font-semibold text-stone-800 leading-tight truncate">
          {widget.title}
        </h4>
        <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-2 leading-relaxed">
          {widget.description || ''}
        </p>

        {/* Suggestion reason tags */}
        {isSuggestion && widget._reasons && widget._reasons.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {widget._reasons.map((reason, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-0.5 rounded-full bg-indigo-50 text-indigo-600 px-2 py-0.5 text-[8px] font-medium"
              >
                <Tag size={7} />
                {reason}
              </span>
            ))}
          </div>
        )}

        {/* Tags (non-suggestion) */}
        {!isSuggestion && widget.tags && widget.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {widget.tags.slice(0, 4).map((tag, i) => (
              <span
                key={i}
                className="rounded-full bg-stone-100 text-stone-500 px-1.5 py-0.5 text-[8px] font-medium"
              >
                {tag}
              </span>
            ))}
            {widget.tags.length > 4 && (
              <span className="rounded-full bg-stone-100 text-stone-400 px-1.5 py-0.5 text-[8px]">
                +{widget.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Expanded preview */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3 pt-1 border-t border-stone-100">
              <WidgetPreview content={content} widget={widget} />
              <div className="flex items-center justify-end gap-2 mt-2.5">
                <button
                  onClick={onToggleExpand}
                  className="text-[10px] font-medium text-stone-400 hover:text-stone-600 transition-colors"
                >
                  Collapse
                </button>
                <button
                  onClick={() => onInsert(widget)}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-[11px] font-semibold hover:bg-indigo-700 transition-colors"
                >
                  <ArrowRight size={12} />
                  Insert into Deal
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Widget preview renderer (mirrors vanilla JS showWidgetPreview) ──────

function WidgetPreview({
  content,
  widget,
}: {
  content: Record<string, any>;
  widget: LibraryWidget;
}) {
  if (content.type === 'case-study-card') {
    return (
      <div className="rounded-lg bg-stone-50 p-3 mt-1">
        <p className="text-[9px] font-semibold text-indigo-500 uppercase tracking-wider mb-1">
          {content.industry || ''}
        </p>
        <p className="text-[15px] font-bold text-indigo-600 mb-1.5 leading-snug">
          {content.metric || ''}
        </p>
        {content.quote && (
          <p className="text-[11px] text-stone-500 italic border-l-2 border-indigo-400 pl-2.5 mb-2">
            "{content.quote}"
          </p>
        )}
        {content.feature && (
          <p className="text-[9px] text-stone-400">Feature: {content.feature}</p>
        )}
      </div>
    );
  }

  if (content.type === 'g2-review-block') {
    return (
      <div className="rounded-lg bg-stone-50 p-3 mt-1">
        <p className="text-amber-500 text-sm mb-1.5">★★★★★</p>
        <p className="text-[11px] text-stone-600 italic mb-2 leading-relaxed">
          "{content.quote || ''}"
        </p>
        <p className="text-[9px] text-stone-400">
          {content.reviewerRole} · {content.companySize} · {content.source}
        </p>
        {content.painsSolved && content.painsSolved.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {content.painsSolved.map((p: string, i: number) => (
              <span key={i} className="rounded-full bg-emerald-50 text-emerald-600 px-2 py-0.5 text-[8px] font-medium">
                {p}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (content.type === 'battlecard-table' && content.rows) {
    return (
      <div className="rounded-lg bg-stone-50 p-3 mt-1 overflow-x-auto">
        {content.headline && (
          <p className="text-[11px] text-rose-500 font-semibold italic mb-1.5">
            "{content.headline}"
          </p>
        )}
        {content.switchRate && (
          <p className="text-[9px] text-emerald-600 mb-2">
            Switch rate: {content.switchRate} · Saves {content.timeSaved || ''}
          </p>
        )}
        <table className="w-full text-[9px] border-collapse">
          <thead>
            <tr>
              <th className="text-left py-1 px-1.5 text-stone-400 border-b border-stone-200 font-semibold">Capability</th>
              <th className="text-left py-1 px-1.5 text-indigo-600 border-b border-stone-200 font-semibold">Teamtailor</th>
              <th className="text-left py-1 px-1.5 text-rose-500 border-b border-stone-200 font-semibold">{content.competitor || ''}</th>
            </tr>
          </thead>
          <tbody>
            {content.rows.map((row: any, i: number) => (
              <tr key={i}>
                <td className="py-1 px-1.5 text-stone-600 border-b border-stone-100">{row.capability || row.feature || ''}</td>
                <td className="py-1 px-1.5 text-stone-500 border-b border-stone-100">{(row.teamtailor || '').slice(0, 80)}</td>
                <td className="py-1 px-1.5 text-stone-500 border-b border-stone-100">{(row.competitor || '').slice(0, 80)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (content.type === 'battlecard-full') {
    return (
      <div className="rounded-lg bg-stone-50 p-3 mt-1">
        {content.winRate && (
          <p className="text-[11px] text-emerald-600 font-semibold mb-2">
            Win Rate: {content.winRate}
          </p>
        )}
        {content.differentiators?.length > 0 && (
          <>
            <p className="text-[9px] text-stone-400 uppercase tracking-wider mb-1">Differentiators</p>
            {content.differentiators.map((d: any, i: number) => (
              <p key={i} className="text-[10px] text-stone-600 mb-0.5">
                • <strong>{d.title}</strong>
              </p>
            ))}
          </>
        )}
        {content.objections?.length > 0 && (
          <>
            <p className="text-[9px] text-stone-400 uppercase tracking-wider mt-2 mb-1">
              Objection Scripts ({content.objections.length})
            </p>
            {content.objections.slice(0, 3).map((o: any, i: number) => (
              <p key={i} className="text-[9px] text-rose-500 mb-0.5 truncate">
                "{o.objection}"
              </p>
            ))}
          </>
        )}
      </div>
    );
  }

  if (content.type === 'feature-comparison') {
    return (
      <div className="rounded-lg bg-stone-50 p-3 mt-1">
        {content.painAddressed && (
          <p className="text-[9px] text-amber-600 font-semibold mb-2">
            Pain: {content.painAddressed}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-rose-50 border border-rose-100 p-2.5">
            <p className="text-[8px] font-bold text-rose-500 uppercase mb-1">Without</p>
            <p className="text-[10px] text-stone-500 leading-relaxed">{content.without || ''}</p>
          </div>
          <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-2.5">
            <p className="text-[8px] font-bold text-emerald-600 uppercase mb-1">With Teamtailor</p>
            <p className="text-[10px] text-stone-500 leading-relaxed">{content.withTT || ''}</p>
          </div>
        </div>
        {content.proofPoint && (
          <p className="text-[9px] text-stone-400 mt-2">Proof: {content.proofPoint}</p>
        )}
      </div>
    );
  }

  if (content.type === 'competitor-weakness') {
    return (
      <div className="rounded-lg bg-rose-50 border border-rose-100 p-3 mt-1">
        <p className="text-[10px] text-rose-600 font-semibold mb-1">
          {content.competitor || ''} · {content.source || ''}
        </p>
        {content.quote && (
          <p className="text-[11px] text-stone-500 italic leading-relaxed">
            "{content.quote}"
          </p>
        )}
        {content.reviewerRole && (
          <p className="text-[9px] text-stone-400 mt-1">— {content.reviewerRole}</p>
        )}
      </div>
    );
  }

  if (content.type === 'industry-benchmark') {
    return (
      <div className="rounded-lg bg-stone-50 p-3 mt-1">
        {(content.stats || []).map((s: any, i: number) => (
          <p key={i} className="text-[10px] text-stone-600 mb-1">
            • <strong>{s.stat}</strong>
            <span className="text-stone-400"> — {s.source}</span>
          </p>
        ))}
      </div>
    );
  }

  // Fallback: show raw JSON
  return (
    <div className="rounded-lg bg-stone-50 p-3 mt-1">
      <pre className="text-[9px] text-stone-500 whitespace-pre-wrap leading-relaxed overflow-x-auto">
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );
}

// ── State views ─────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-stone-200 border-t-indigo-500 animate-spin" />
      <p className="text-[11px] text-stone-400">Loading content library…</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-2">
      <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
        <AlertTriangle size={18} className="text-rose-500" />
      </div>
      <p className="text-[12px] font-semibold text-stone-700">Failed to load</p>
      <p className="text-[10px] text-stone-400">{message}</p>
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-2">
      <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
        <Search size={18} className="text-stone-400" />
      </div>
      <p className="text-[12px] font-semibold text-stone-600">No widgets found</p>
      {query && (
        <p className="text-[10px] text-stone-400">
          No results for "{query}". Try different keywords.
        </p>
      )}
    </div>
  );
}
