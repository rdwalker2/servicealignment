// ============================================================
// PlaybookShowcase — Prospect-facing playbook visualization
// Renders Service Alignment playbooks in the Discovery Room
// ============================================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Check, X, ChevronRight, ChevronDown, Zap, BookOpen,
  ArrowRight, Sparkles,
} from 'lucide-react';
import {
  PLAYBOOKS,
  PLAYBOOK_PAIN_MAP,
} from '../../data/playbooks';
import { DEMO_AREAS } from './FeatureWalkthrough';
import type {
  Playbook,
  PlaybookFlow,
  PlaybookStep,
  PlaybookNeed,
  PlaybookMetric,
  PlaybookSpotlight,
} from '../../data/playbooks';

// ── Props ──

interface PlaybookShowcaseProps {
  selectedPains: string[];
  enabledPlaybookIds?: string[];
  themeColor?: string;
  overriddenPillars?: string[];
}

// ── Constants ──

const PILLAR_COLORS = [
  { accent: '#0ea5e9', bg: 'bg-sky-50', border: 'border-sky-200', badge: 'bg-sky-100 text-sky-700' },
  { accent: '#8b5cf6', bg: 'bg-violet-50', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700' },
  { accent: '#f59e0b', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
];

const PERSONA_COLORS: Record<string, string> = {
  'Recruiters': '#10b981',
  'TA Leaders': '#8b5cf6',
  'HR Managers': '#f472b6',
  'Hiring Managers': '#fbbf24',
};

// ── Shared animation variants ──

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const expandVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: 'auto', opacity: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
};

// ── Sub-components ──

function PersonaBadge({ persona }: { persona: string }) {
  const color = PERSONA_COLORS[persona] || '#a8a29e';
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}25` }}
    >
      {persona}
    </span>
  );
}

function FlowVisualization({ flow, themeColor }: { flow: PlaybookFlow[]; themeColor: string }) {
  if (flow.length === 0) return null;

  const labelColors: Record<string, string> = {
    Stage: '#10b981',
    Trigger: '#8b5cf6',
    Result: '#f59e0b',
  };

  return (
    <div className="relative">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-0">
        {flow.map((step, idx) => {
          const lc = labelColors[step.label] || themeColor;
          return (
            <div key={idx} className="flex flex-1 items-start gap-3 md:flex-col md:items-center md:text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.4 }}
                className="relative flex-shrink-0"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm text-lg"
                  style={{ backgroundColor: `${lc}12`, border: `1.5px solid ${lc}30` }}
                >
                  {step.icon}
                </div>
                {idx < flow.length - 1 && (
                  <div className="absolute -right-8 top-1/2 hidden -translate-y-1/2 md:block">
                    <div className="flex items-center gap-1">
                      <div className="h-px w-6" style={{ backgroundColor: `${themeColor}30` }} />
                      <ChevronRight size={14} style={{ color: `${themeColor}50` }} />
                    </div>
                  </div>
                )}
              </motion.div>
              <div className="flex-1 md:mt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: lc }}>{step.label}</p>
                <p className="text-sm font-medium text-stone-700">{step.name}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BeforeAfterSection({ before, after }: { before: string[]; after: string[] }) {
  if (before.length === 0 && after.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-red-100 bg-red-50/40 p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
            <X size={12} className="text-red-500" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-400">Without This Playbook</span>
        </div>
        <ul className="space-y-2.5">
          {before.map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-2 text-sm text-stone-600"
            >
              <X size={14} className="mt-0.5 flex-shrink-0 text-red-400" />
              {item}
            </motion.li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
            <Check size={12} className="text-emerald-500" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">With This Playbook</span>
        </div>
        <ul className="space-y-2.5">
          {after.map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-2 text-sm text-stone-600"
            >
              <Check size={14} className="mt-0.5 flex-shrink-0 text-emerald-500" />
              {item}
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function NeedsGrid({ needs }: { needs: PlaybookNeed[] }) {
  if (needs.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {needs.map((need, i) => {
        const isIntegration = need.type === 'integration';
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-xl border p-4 ${isIntegration ? 'bg-violet-50 border-violet-200' : 'bg-emerald-50 border-emerald-200'}`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{need.icon}</span>
              <div>
                <span className={`text-sm font-semibold ${isIntegration ? 'text-violet-700' : 'text-emerald-700'}`}>{need.name}</span>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${isIntegration ? 'text-violet-500' : 'text-emerald-500'} opacity-70`}>
                  {need.type}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function StepByStep({ steps, themeColor }: { steps: PlaybookStep[]; themeColor: string }) {
  if (steps.length === 0) return null;
  return (
    <div className="space-y-4">
      {steps.map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="flex items-start gap-4"
        >
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: themeColor }}
          >
            {i + 1}
          </div>
          <div className="flex-1 pt-0.5">
            {step.navPath && (
              <div className="mb-1.5 inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5">
                <code className="text-[11px] font-mono text-stone-500">{step.navPath}</code>
              </div>
            )}
            <p className="font-semibold text-stone-800">{step.title}</p>
            <p className="mt-0.5 text-sm text-stone-500 leading-relaxed">{step.description}</p>
            {step.proTip && (
              <p className="mt-1.5 text-xs text-amber-600 italic">💡 {step.proTip}</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function SpotlightCards({ spotlights, themeColor }: { spotlights: PlaybookSpotlight[]; themeColor: string }) {
  if (spotlights.length === 0) return null;
  return (
    <div className="space-y-4">
      {spotlights.map((spot, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="relative overflow-hidden rounded-2xl p-[1.5px]"
          style={{
            background: `linear-gradient(135deg, ${themeColor}40, ${themeColor}10, ${themeColor}30)`,
          }}
        >
          <div className="rounded-2xl bg-white p-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} style={{ color: themeColor }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: themeColor }}>
                Feature Spotlight
              </span>
            </div>
            <h4 className="text-base font-bold text-stone-800 mb-2">{spot.feature}</h4>
            <p className="text-sm leading-relaxed text-stone-500">{spot.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function MetricsRow({ metrics, caseStudy, themeColor }: { metrics: PlaybookMetric[]; caseStudy?: { company: string; result: string }; themeColor: string }) {
  return (
    <div>
      {metrics.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {metrics.map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="rounded-2xl border border-stone-100 bg-stone-50/50 p-5 text-center"
            >
              <p
                className="text-3xl font-extrabold bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(180deg, #1c1917, #78716c)' }}
              >
                {metric.value}
              </p>
              <p className="mt-1 text-xs font-medium text-stone-500">{metric.label}</p>
            </motion.div>
          ))}
        </div>
      )}
      {caseStudy && caseStudy.company && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4"
        >
          <div className="flex items-start gap-3">
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${themeColor}12` }}
            >
              <BookOpen size={14} style={{ color: themeColor }} />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-700 mb-0.5">{caseStudy.company}</p>
              <p className="text-sm leading-relaxed text-stone-500">{caseStudy.result}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Detail section label ──

function DetailLabel({ label }: { label: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <div className="h-px flex-1 bg-gradient-to-r from-stone-200 to-transparent" />
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">{label}</span>
      <div className="h-px flex-1 bg-gradient-to-l from-stone-200 to-transparent" />
    </div>
  );
}

// ── Playbook Card (collapsed state) ──

function PlaybookCard({
  playbook,
  index,
  isExpanded,
  onToggle,
  themeColor,
}: {
  playbook: Playbook;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  themeColor: string;
}) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      layout
      className="group"
    >
      {/* Card */}
      <motion.button
        onClick={onToggle}
        whileHover={!isExpanded ? { y: -4, boxShadow: '0 12px 40px rgba(28, 25, 23, 0.08)' } : undefined}
        className={`w-full text-left rounded-2xl border transition-all duration-300 ${
          isExpanded
            ? 'border-stone-300 bg-white shadow-lg ring-1 ring-stone-200/50'
            : 'border-stone-200 bg-white shadow-sm hover:border-stone-300'
        }`}
      >
        <div className="p-6">
          {/* Top row: persona badges + setup time */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {playbook.personas.map((p) => (
              <PersonaBadge key={p} persona={p} />
            ))}
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-500">
              <Clock size={10} />
              {playbook.setupTime}
            </span>
          </div>

          {/* Title */}
          <h3 className="mb-2 text-lg font-bold text-stone-800 leading-snug group-hover:text-stone-900 transition-colors">
            {playbook.title}
          </h3>

          {/* Description */}
          <p className="mb-4 text-sm leading-relaxed text-stone-500">{playbook.description}</p>

          {/* Feature tags */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {playbook.features.map((feat) => (
              <span
                key={feat}
                className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600"
              >
                {feat}
              </span>
            ))}
          </div>

          {/* CTA row */}
          <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: themeColor }}>
            {isExpanded ? (
              <>
                <span>Close Playbook</span>
                <ChevronDown size={16} className="transition-transform" />
              </>
            ) : (
              <>
                <span>View Playbook</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </div>
        </div>
      </motion.button>

      {/* Expanded detail */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={expandVariants}
            initial="collapsed"
            animate="expanded"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-8 rounded-2xl border border-stone-200 bg-stone-50/30 p-6 shadow-inner">
              {/* Automation Flow */}
              {playbook.automationFlow.length > 0 && (
                <div>
                  <DetailLabel label="Automation Flow" />
                  <FlowVisualization flow={playbook.automationFlow} themeColor={themeColor} />
                </div>
              )}

              {/* Before/After */}
              {(playbook.beforeList.length > 0 || playbook.afterList.length > 0) && (
                <div>
                  <DetailLabel label="Before & After" />
                  <BeforeAfterSection before={playbook.beforeList} after={playbook.afterList} />
                </div>
              )}

              {/* What You'll Need */}
              {playbook.needs.length > 0 && (
                <div>
                  <DetailLabel label="What You'll Need" />
                  <NeedsGrid needs={playbook.needs} />
                </div>
              )}

              {/* Step-by-Step */}
              {playbook.steps.length > 0 && (
                <div>
                  <DetailLabel label="Step-by-Step Setup" />
                  <StepByStep steps={playbook.steps} themeColor={themeColor} />
                </div>
              )}

              {/* Feature Spotlights */}
              {playbook.spotlights.length > 0 && (
                <div>
                  <DetailLabel label="Feature Spotlight" />
                  <SpotlightCards spotlights={playbook.spotlights} themeColor={themeColor} />
                </div>
              )}

              {/* Results & Metrics */}
              {playbook.results.metrics.length > 0 && (
                <div>
                  <DetailLabel label="Expected Results" />
                  <MetricsRow
                    metrics={playbook.results.metrics}
                    caseStudy={playbook.results.caseStudy}
                    themeColor={themeColor}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Component ──

export function PlaybookShowcase({
  selectedPains,
  enabledPlaybookIds,
  themeColor = '#78716c',
  overriddenPillars = [],
}: PlaybookShowcaseProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Compute the same 3 pillars as FeatureWalkthrough for grouping consistency
  const pillars = useMemo(() => {
    if (!selectedPains.length && !overriddenPillars.length) return [];

    let areaScores: { area: typeof DEMO_AREAS[0]; matchedPains: string[] }[] = [];
    for (const area of DEMO_AREAS) {
      const matched = area.painIds.filter(id => selectedPains.includes(id));
      if (matched.length > 0) areaScores.push({ area, matchedPains: matched });
    }
    areaScores.sort((a, b) => b.matchedPains.length - a.matchedPains.length);

    if (overriddenPillars.length > 0) {
      const overrideScores: typeof areaScores = [];
      const usedIds = new Set<string>();
      for (const id of overriddenPillars) {
        const area = DEMO_AREAS.find(a => a.id === id);
        if (area) {
          const existing = areaScores.find(s => s.area.id === id);
          overrideScores.push({ area, matchedPains: existing ? existing.matchedPains : area.painIds.slice(0, 2) });
          usedIds.add(id);
        }
      }
      areaScores = [...overrideScores, ...areaScores.filter(s => !usedIds.has(s.area.id))];
    }

    if (areaScores.length < 3) {
      const usedIds = new Set(areaScores.map(s => s.area.id));
      for (const fallback of ['ai', 'candidate', 'analytics', 'brand', 'manager', 'hiring', 'programs']) {
        if (areaScores.length >= 3) break;
        if (!usedIds.has(fallback)) {
          const area = DEMO_AREAS.find(a => a.id === fallback);
          if (area) { areaScores.push({ area, matchedPains: area.painIds.slice(0, 2) }); usedIds.add(fallback); }
        }
      }
    }
    return areaScores.slice(0, 3);
  }, [selectedPains, overriddenPillars]);

  // Match playbooks and group by pillar
  const matchedPlaybooks = useMemo(() => {
    if (!PLAYBOOKS || !PLAYBOOK_PAIN_MAP) return [];
    if (enabledPlaybookIds && enabledPlaybookIds.length > 0) {
      return PLAYBOOKS.filter((pb) => enabledPlaybookIds.includes(pb.id));
    }
    if (selectedPains.length === 0) return [];
    const painSet = new Set(selectedPains);
    return PLAYBOOKS.filter((pb) => {
      const playbookPains = PLAYBOOK_PAIN_MAP[pb.id];
      if (!playbookPains) return false;
      return playbookPains.some((painId) => painSet.has(painId));
    });
  }, [selectedPains, enabledPlaybookIds]);

  // Group playbooks by pillar — each playbook goes under the pillar it best matches
  const pillarGroups = useMemo(() => {
    if (pillars.length === 0) return [];
    const assigned = new Set<string>();
    const groups: { pillar: typeof pillars[0]; playbooks: typeof matchedPlaybooks; colorIndex: number }[] = [];

    pillars.forEach((pillar, i) => {
      const pillarPainSet = new Set(pillar.area.painIds);
      const matching = matchedPlaybooks.filter(pb => {
        if (assigned.has(pb.id)) return false;
        const pbPains = PLAYBOOK_PAIN_MAP[pb.id] || [];
        return pbPains.some(pid => pillarPainSet.has(pid));
      });
      matching.forEach(pb => assigned.add(pb.id));
      groups.push({ pillar, playbooks: matching, colorIndex: i });
    });

    // Ungrouped playbooks (don't match any pillar) go under the most relevant pillar
    const ungrouped = matchedPlaybooks.filter(pb => !assigned.has(pb.id));
    if (ungrouped.length > 0 && groups.length > 0) {
      groups[groups.length - 1].playbooks.push(...ungrouped);
    }

    return groups.filter(g => g.playbooks.length > 0);
  }, [pillars, matchedPlaybooks]);

  if (matchedPlaybooks.length === 0) return null;

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="w-full" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12 text-center"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-4 py-1.5">
          <BookOpen size={14} className="text-stone-500" />
          <span className="text-xs font-semibold text-stone-600">How We Deploy Each Pillar</span>
        </div>
        <h2 className="mb-3 text-3xl font-bold text-stone-800 sm:text-4xl">
          Your Recruitment{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(135deg, ${themeColor}, ${themeColor}99)` }}
          >
            Operating System
          </span>
        </h2>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-stone-500">
          Each pillar from your solution has pre-built automation playbooks.
          Click any playbook to see the full setup guide, automation flow, and expected results.
        </p>
      </motion.div>

      {/* Pillar-grouped playbooks */}
      <div className="space-y-12">
        {pillarGroups.map(({ pillar, playbooks, colorIndex }) => {
          const colors = PILLAR_COLORS[colorIndex] || PILLAR_COLORS[0];
          const Icon = pillar.area.icon;
          return (
            <div key={pillar.area.id}>
              {/* Pillar header */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mb-6 flex items-center gap-3"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.badge}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: colors.accent }}>
                    Pillar {colorIndex + 1} — How
                  </p>
                  <h3 className="text-lg font-bold text-stone-800">{pillar.area.title}</h3>
                </div>
                <div className="ml-auto rounded-full px-3 py-1 text-[11px] font-semibold" style={{ backgroundColor: `${colors.accent}12`, color: colors.accent }}>
                  {playbooks.length} playbook{playbooks.length !== 1 ? 's' : ''}
                </div>
              </motion.div>

              {/* Playbook cards under this pillar */}
              <div className="grid grid-cols-1 gap-5 pl-[52px]">
                {playbooks.map((playbook, index) => (
                  <PlaybookCard
                    key={playbook.id}
                    playbook={playbook}
                    index={index}
                    isExpanded={expandedId === playbook.id}
                    onToggle={() => handleToggle(playbook.id)}
                    themeColor={colors.accent}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default PlaybookShowcase;
