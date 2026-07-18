// ============================================================
// SolutionConfigPanel — Rep-Only Solution Configuration
// Appears in D3 Solution step: select pillars & link playbooks
// ============================================================

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, BookOpen, Check, ChevronDown, ChevronUp,
  Clock, Users, Sparkles, Zap,
} from 'lucide-react';
import { PLAYBOOKS, type Playbook } from '../../data/playbooks';

// ── Demo Area Definitions ──

const DEMO_AREAS = [
  { id: 'brand', label: 'Employer Brand & Career Site' },
  { id: 'ai', label: 'AI & Automation' },
  { id: 'candidate', label: 'Candidate Experience & Engagement' },
  { id: 'analytics', label: 'Analytics & Intelligence' },
  { id: 'manager', label: 'Manager Self-Service' },
  { id: 'hiring', label: 'Structured Hiring' },
  { id: 'programs', label: 'Employee Programs' },
] as const;

const MAX_PILLARS = 3;

// ── Props ──

interface SolutionConfigPanelProps {
  selectedPillars: string[];
  onPillarsChange: (pillars: string[]) => void;
  linkedPlaybooks: Record<string, string[]>;
  onPlaybooksChange: (linked: Record<string, string[]>) => void;
}

// ── Component ──

export function SolutionConfigPanel({
  selectedPillars,
  onPillarsChange,
  linkedPlaybooks,
  onPlaybooksChange,
}: SolutionConfigPanelProps) {
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  // Toggle a pillar on/off (max 3)
  const togglePillar = useCallback(
    (id: string) => {
      if (selectedPillars.includes(id)) {
        // Remove pillar and its linked playbooks
        const next = selectedPillars.filter(p => p !== id);
        onPillarsChange(next);
        const nextLinked = { ...linkedPlaybooks };
        delete nextLinked[id];
        onPlaybooksChange(nextLinked);
        if (expandedPillar === id) setExpandedPillar(null);
      } else if (selectedPillars.length < MAX_PILLARS) {
        onPillarsChange([...selectedPillars, id]);
      }
    },
    [selectedPillars, onPillarsChange, linkedPlaybooks, onPlaybooksChange, expandedPillar],
  );

  // Toggle a playbook link under a specific pillar
  const togglePlaybook = useCallback(
    (pillarId: string, playbookId: string) => {
      const current = linkedPlaybooks[pillarId] || [];
      const next = current.includes(playbookId)
        ? current.filter(id => id !== playbookId)
        : [...current, playbookId];
      onPlaybooksChange({ ...linkedPlaybooks, [pillarId]: next });
    },
    [linkedPlaybooks, onPlaybooksChange],
  );

  // Get playbooks relevant to a given demo area
  const getPlaybooksForArea = useMemo(() => {
    const map: Record<string, Playbook[]> = {};
    for (const area of DEMO_AREAS) {
      map[area.id] = PLAYBOOKS.filter(pb => pb.demoAreaIds.includes(area.id));
    }
    return map;
  }, []);

  // Total linked playbooks count
  const totalLinked = useMemo(
    () => Object.values(linkedPlaybooks).reduce((sum, ids) => sum + ids.length, 0),
    [linkedPlaybooks],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-stone-200/60 bg-white shadow-sm overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-stone-100">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-900/5">
          <Layers size={18} className="text-stone-700" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-stone-900">Solution Configuration</h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Select up to 3 pillars and link playbooks for the demo
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedPillars.length > 0 && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
              {selectedPillars.length}/{MAX_PILLARS} pillars
            </span>
          )}
          {totalLinked > 0 && (
            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold text-sky-700 ring-1 ring-sky-200">
              {totalLinked} playbook{totalLinked !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* ── Section 1: Select 3 Pillars ── */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={13} className="text-stone-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Select 3 Pillars
          </span>
          <span className="ml-auto text-[10px] font-medium text-stone-400">
            {selectedPillars.length} of {MAX_PILLARS} selected
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {DEMO_AREAS.map(area => {
            const isSelected = selectedPillars.includes(area.id);
            const isDisabled = !isSelected && selectedPillars.length >= MAX_PILLARS;
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => togglePillar(area.id)}
                disabled={isDisabled}
                className={`
                  group relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-semibold
                  transition-all duration-200
                  ${isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200'
                    : isDisabled
                      ? 'bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed'
                      : 'bg-white text-stone-700 border-stone-200/60 hover:border-stone-400 hover:bg-stone-50 hover:shadow-sm'
                  }
                `}
              >
                {/* Checkbox indicator */}
                <span
                  className={`
                    flex h-4 w-4 shrink-0 items-center justify-center rounded-md border-[1.5px] transition-all duration-200
                    ${isSelected
                      ? 'bg-white border-white/40'
                      : isDisabled
                        ? 'border-stone-200 bg-stone-100'
                        : 'border-stone-300 group-hover:border-stone-400'
                    }
                  `}
                >
                  {isSelected && <Check size={10} className="text-emerald-600" strokeWidth={3} />}
                </span>
                {area.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section 2: Link Playbooks ── */}
      {selectedPillars.length > 0 && (
        <div className="px-5 pt-4 pb-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={13} className="text-stone-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Link Playbooks
            </span>
          </div>

          <div className="space-y-2">
            {selectedPillars.map(pillarId => {
              const area = DEMO_AREAS.find(a => a.id === pillarId);
              if (!area) return null;

              const isExpanded = expandedPillar === pillarId;
              const relevantPlaybooks = getPlaybooksForArea[pillarId] || [];
              const linkedIds = linkedPlaybooks[pillarId] || [];

              return (
                <div
                  key={pillarId}
                  className={`rounded-xl border transition-all ${
                    isExpanded ? 'border-stone-300 shadow-sm' : 'border-stone-200/60'
                  }`}
                >
                  {/* Pillar Accordion Header */}
                  <button
                    type="button"
                    onClick={() => setExpandedPillar(isExpanded ? null : pillarId)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50/50 transition-colors text-left rounded-xl"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white text-[10px] font-black">
                      {selectedPillars.indexOf(pillarId) + 1}
                    </span>
                    <span className="flex-1 text-sm font-semibold text-stone-800">
                      {area.label}
                    </span>
                    {linkedIds.length > 0 && (
                      <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-600 ring-1 ring-sky-200">
                        {linkedIds.length} linked
                      </span>
                    )}
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ChevronDown size={14} className="text-stone-400" />
                    </motion.div>
                  </button>

                  {/* Playbook Cards */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 border-t border-stone-100 space-y-2">
                          {relevantPlaybooks.length === 0 ? (
                            <p className="text-xs text-stone-400 italic py-3 text-center">
                              No playbooks available for this area yet
                            </p>
                          ) : (
                            relevantPlaybooks.map(pb => {
                              const isLinked = linkedIds.includes(pb.id);
                              return (
                                <button
                                  key={pb.id}
                                  type="button"
                                  onClick={() => togglePlaybook(pillarId, pb.id)}
                                  className={`
                                    w-full text-left rounded-xl border p-3.5 transition-all duration-200
                                    ${isLinked
                                      ? 'bg-sky-50/60 border-sky-200 ring-1 ring-sky-200'
                                      : 'bg-white border-stone-200/60 hover:border-stone-300 hover:bg-stone-50/50'
                                    }
                                  `}
                                >
                                  <div className="flex items-start gap-3">
                                    {/* Toggle indicator */}
                                    <span
                                      className={`
                                        mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px] transition-all duration-200
                                        ${isLinked
                                          ? 'bg-sky-600 border-sky-600'
                                          : 'border-stone-300 bg-white'
                                        }
                                      `}
                                    >
                                      {isLinked && <Check size={10} className="text-white" strokeWidth={3} />}
                                    </span>

                                    <div className="flex-1 min-w-0">
                                      {/* Title */}
                                      <p className={`text-sm font-semibold leading-snug ${
                                        isLinked ? 'text-sky-900' : 'text-stone-800'
                                      }`}>
                                        {pb.title}
                                      </p>

                                      {/* Description */}
                                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                                        {pb.description}
                                      </p>

                                      {/* Meta row: personas + setup time */}
                                      <div className="flex flex-wrap items-center gap-2 mt-2">
                                        {pb.personas.map(persona => (
                                          <span
                                            key={persona}
                                            className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600"
                                          >
                                            <Users size={8} className="text-stone-400" />
                                            {persona}
                                          </span>
                                        ))}
                                        <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-500">
                                          <Clock size={8} className="text-stone-400" />
                                          {pb.setupTime}
                                        </span>
                                      </div>

                                      {/* Feature pills */}
                                      <div className="flex flex-wrap gap-1.5 mt-2">
                                        {pb.features.map(feat => (
                                          <span
                                            key={feat}
                                            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                                              isLinked
                                                ? 'bg-sky-100 text-sky-700'
                                                : 'bg-stone-50 text-stone-500 border border-stone-200/60'
                                            }`}
                                          >
                                            {feat}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {selectedPillars.length === 0 && (
        <div className="px-5 py-8 text-center">
          <Zap size={20} className="mx-auto mb-2 text-stone-300" />
          <p className="text-xs text-stone-400">
            Select pillars above to start building the solution demo
          </p>
        </div>
      )}
    </motion.div>
  );
}
