// ============================================================
// ProblemCanvas — Prospect-facing Executive Brief
// Reflects all structured discovery intel back to the prospect
// in a premium 3-column executive summary layout.
// ============================================================

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Target, Users, Building2, GitBranch,
  AlertTriangle, Lightbulb, TrendingUp,
  CheckCircle2, Building, Flag, ShieldAlert,
  Clock, Check, Search
} from 'lucide-react';
import type { DiscoverySession } from '../../lib/discoveryDatabase';
import { TT_PAINS } from './PainDiscoveryModule';

// ── Types ──

interface ProblemCanvasProps {
  session: DiscoverySession;
  companyName: string;
  themeColor?: string;
}

// ── Helper to format call sheet answers ──

function formatAnswer(answer: unknown): { content: string | null; items: string[] } {
  if (!answer) return { content: null, items: [] };
  if (Array.isArray(answer)) {
    return { content: null, items: answer.map(String) };
  }
  return { content: String(answer), items: [] };
}

// ── Components ──

function BriefSection({
  title,
  icon: Icon,
  accentColor,
  content,
  items,
  delay = 0,
}: {
  title: string;
  icon: React.ElementType;
  accentColor: string;
  content?: string | null;
  items?: string[];
  delay?: number;
}) {
  const isEmpty = !content && (!items || items.length === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="relative mb-6 last:mb-0"
    >
      <div className="mb-2 flex items-center gap-2">
        <Icon size={14} style={{ color: accentColor }} />
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-900">
          {title}
        </h4>
      </div>

      <div className="pl-6">
        {isEmpty ? (
          <p className="text-sm italic text-zinc-400">Pending discovery…</p>
        ) : (
          <>
            {content && (
              <p className="text-sm leading-relaxed text-zinc-600">{content}</p>
            )}
            {items && items.length > 0 && (
              <ul className="mt-1 space-y-1.5">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-600">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

function Column({
  title,
  delay,
  children,
}: {
  title: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className="flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden"
    >
      <div className="bg-zinc-50/80 px-6 py-4 border-b border-zinc-100">
        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">
          {title}
        </h3>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}

function LevelGauge({
  label,
  levels,
  activeLevel,
  themeColor,
}: {
  label: string;
  levels: { text: string; color: string }[];
  activeLevel: number;
  themeColor: string;
}) {
  return (
    <div className="mt-6 pt-5 border-t border-zinc-100">
      <span className="mb-3 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
        {label}
      </span>
      <div className="flex w-full overflow-hidden rounded-full border border-zinc-200 bg-zinc-50 p-1">
        {levels.map((level, i) => {
          const isActive = i === activeLevel;
          return (
            <div
              key={level.text}
              className={`flex-1 text-center py-1.5 text-[10px] font-bold transition-all rounded-full ${
                isActive ? 'text-white shadow-sm' : 'text-zinc-400'
              }`}
              style={isActive ? { backgroundColor: level.color } : undefined}
            >
              {level.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ──

export function ProblemCanvas({ session, companyName, themeColor = '#1c1917' }: ProblemCanvasProps) {
  const overrides = session.problem_canvas_overrides ?? {};

  // -- Data Extraction & Parsing --

  // Objective
  const objectivePains = (session.selected_pains || []).slice(0, 4).map(id => {
    const pain = TT_PAINS.find(p => p.id === id);
    return pain ? pain.title : id;
  });
  const q1 = formatAnswer(session.call_sheet_answers?.q1);
  const objectiveContent = overrides.objective || q1.content;
  const objectiveItems = !objectiveContent ? (q1.items.length > 0 ? q1.items : objectivePains) : [];

  // Decision Makers
  const stakeholderItems = (session.stakeholders || []).map(s =>
    `${s.name || 'TBD'}${s.title ? ` — ${s.title}` : ''}${s.role ? ` (${s.role})` : ''}`
  );

  // Current Reality
  const currentRealityParts: string[] = [];
  if (session.current_ats && session.current_ats !== 'None') {
    currentRealityParts.push(`Currently using ${session.current_ats}`);
  }
  const q5 = formatAnswer(session.call_sheet_answers?.q5);
  if (q5.content) currentRealityParts.push(q5.content);
  const q6 = formatAnswer(session.call_sheet_answers?.q6);
  if (q6.content) currentRealityParts.push(q6.content);

  // ── Surface jk1-jk6 + cs1 tactical discovery intel ──
  const jk1 = formatAnswer(session.call_sheet_answers?.jk1); // Process walkthrough
  const jk3 = formatAnswer(session.call_sheet_answers?.jk3); // HM feedback methods
  const jk4 = formatAnswer(session.call_sheet_answers?.jk4); // Career page quality
  const jk5 = formatAnswer(session.call_sheet_answers?.jk5); // Data flow / handoff
  if (jk1.content) currentRealityParts.push(jk1.content);
  if (jk3.content) currentRealityParts.push(jk3.content);
  if (jk4.content) currentRealityParts.push(jk4.content);
  if (jk5.content) currentRealityParts.push(jk5.content);
  if (session.system_count && session.system_count > 1) {
    currentRealityParts.push(`Using ${session.system_count} separate systems for hiring`);
  }
  
  const currentRealityContent = overrides.current_reality 
    || session.diagnosis_current_approach_override 
    || currentRealityParts.join('. ') 
    || null;
  const currentRealityItems = [...q5.items, ...q6.items, ...jk1.items, ...jk3.items, ...jk4.items, ...jk5.items];

  // Buying Process & Timeline
  const buyingParts: string[] = [];
  const q7 = formatAnswer(session.call_sheet_answers?.q7);
  if (q7.content) buyingParts.push(`Decision process: ${q7.content}`);
  const q4 = formatAnswer(session.call_sheet_answers?.q4);
  if (q4.content) buyingParts.push(q4.content);
  const q8 = formatAnswer(session.call_sheet_answers?.q8);
  if (q8.content) buyingParts.push(q8.content);
  const js3 = formatAnswer(session.call_sheet_answers?.js3);
  if (js3.content) buyingParts.push(`Implementation timeline: ${js3.content}`);
  if (session.implementation_timeline) {
    buyingParts.push(`Target timeline: ${session.implementation_timeline}`);
  }
  if (session.contract_end_date) {
    buyingParts.push(`Current contract ends: ${session.contract_end_date}`);
  }
  const buyingProcessContent = overrides.buying_process || buyingParts.join('. ') || null;
  const buyingProcessItems = [...q7.items, ...q4.items, ...q8.items, ...js3.items];

  // The Challenge / Pain
  const q3 = formatAnswer(session.call_sheet_answers?.q3);
  const jk2 = formatAnswer(session.call_sheet_answers?.jk2); // Time-sinks
  const jk6 = formatAnswer(session.call_sheet_answers?.jk6); // Candidate experience
  const cs2 = formatAnswer(session.call_sheet_answers?.cs2); // Funnel conversion
  const realProblemContent = overrides.real_problem || q3.content || null;
  const realProblemItems = [...q3.items, ...jk2.items, ...jk6.items, ...cs2.items];
  if (jk2.content && !realProblemContent) realProblemItems.push(jk2.content);
  if (jk6.content && !realProblemContent) realProblemItems.push(jk6.content);
  if (cs2.content && !realProblemContent) realProblemItems.push(cs2.content);

  // ROI / Impact
  const roiParts: string[] = [];
  if (session.roi_total > 0) {
    roiParts.push(`Projected annual impact: $${Math.round(session.roi_total).toLocaleString()}`);
  }
  if (session.call_sheet_cost_of_problem) {
    roiParts.push(session.call_sheet_cost_of_problem);
  }
  if (session.deal_value > 0) {
    const multiplier = session.roi_total > 0 ? Math.round(session.roi_total / session.deal_value) : 0;
    if (multiplier > 1) roiParts.push(`${multiplier}x return on investment`);
  }
  const roiSummary = overrides.roi_summary || roiParts.join('. ') || null;

  // Desired Outcomes / Success Vision
  const q8b = formatAnswer(session.call_sheet_answers?.q8b);
  const successVisionContent = q8b.content || null;
  let successVisionItems = q8b.items || [];

  if (!successVisionContent && successVisionItems.length === 0 && session.selected_pains && session.selected_pains.length > 0) {
    const defaultOutcomes = [];
    if (session.selected_pains.some(p => ['outdated-career-site', 'poor-mobile-career', 'engineering-dependency'].includes(p))) {
      defaultOutcomes.push('Launch a stunning, high-converting career site');
    }
    if (session.selected_pains.some(p => ['screening-bottleneck', 'manual-screening', 'slow-time-to-hire'].includes(p))) {
      defaultOutcomes.push('Automate top-of-funnel screening to regain time');
    }
    if (session.selected_pains.includes('scheduling-chaos')) {
      defaultOutcomes.push('Eliminate back-and-forth interview scheduling');
    }
    if (session.selected_pains.includes('poor-candidate-experience') || session.selected_pains.includes('dead-nurture-pipeline')) {
      defaultOutcomes.push('Deliver a consumer-grade candidate experience');
    }
    if (session.selected_pains.includes('no-pipeline-visibility') || session.selected_pains.includes('unmeasurable-brand-roi')) {
      defaultOutcomes.push('Gain real-time visibility into core hiring metrics');
    }
    if (defaultOutcomes.length === 0) {
      defaultOutcomes.push('Streamline the end-to-end recruitment process');
      defaultOutcomes.push('Significantly reduce time-to-hire and cost-per-hire');
    }
    successVisionItems = defaultOutcomes;
  }

  // Compute Gauges
  const priorityLevel = useMemo(() => {
    if (session.priority_self_rating) {
      if (session.priority_self_rating >= 8) return 2;
      if (session.priority_self_rating >= 5) return 1;
      return 0;
    }
    const painCount = (session.selected_pains || []).length;
    return painCount >= 4 ? 2 : painCount >= 2 ? 1 : 0;
  }, [session.priority_self_rating, session.selected_pains]);

  const abilityLevel = useMemo(() => {
    if (session.ability_self_rating) {
      if (session.ability_self_rating >= 8) return 2; // Low ability
      if (session.ability_self_rating >= 5) return 1;
      return 0;
    }
    const hasGapSignals = session.diagnosis_bigger_problem_override || session.diagnosis_root_cause_override;
    const painCount = (session.selected_pains || []).length;
    if (hasGapSignals && painCount >= 3) return 2;
    if (painCount >= 2) return 1;
    return 0;
  }, [session.ability_self_rating, session.selected_pains, session.diagnosis_bigger_problem_override, session.diagnosis_root_cause_override]);

  const alignmentLevel = useMemo(() => {
    const q12 = session.call_sheet_answers?.q12;
    if (q12) {
      const v = Number(q12);
      if (v >= 8) return 2; // High alignment
      if (v >= 5) return 1; // Moderate
      return 0; // Low
    }
    return 0; // Pending
  }, [session.call_sheet_answers?.q12]);

  // Check if we have any data
  const hasData = objectiveContent || objectiveItems.length > 0 || stakeholderItems.length > 0 || currentRealityContent || currentRealityItems.length > 0 || buyingProcessContent || buyingProcessItems.length > 0 || realProblemContent || realProblemItems.length > 0 || rootCause || roiSummary;
  
  if (!hasData) return null;

  return (
    <section className="w-full" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 bg-zinc-900 rounded-3xl p-8 sm:p-10 shadow-xl overflow-hidden relative"
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle at right, ${themeColor}, transparent)` }} />
        <div className="relative z-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
            <Check size={12} className="text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Executive Brief</span>
          </div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl tracking-tight">
            Business Case Summary
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
            A synthesized view of {companyName}'s current landscape, identified challenges, and the projected path forward.
          </p>
        </div>
      </motion.div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
        
        {/* Left Column: The Narrative (2-col inner grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section 1: Current Landscape */}
          <Column title="1. Current Landscape" delay={0.1}>
            <BriefSection title="Primary Objective" icon={Target} accentColor="#6366f1" content={objectiveContent} items={objectiveItems} />
            <BriefSection title="Current Reality" icon={Building2} accentColor="#8b5cf6" content={currentRealityContent} items={currentRealityItems} delay={0.15} />
            <BriefSection title="Decision Makers" icon={Users} accentColor="#ec4899" items={stakeholderItems} delay={0.2} />
          </Column>

          {/* Section 2: The Challenge */}
          <Column title="2. The Challenge" delay={0.2}>
            <BriefSection title="Identified Pain Points" icon={AlertTriangle} accentColor="#ef4444" content={realProblemContent} items={realProblemItems} />
            <BriefSection title="Root Cause" icon={Search} accentColor="#f59e0b" content={session.diagnosis_root_cause_override || 'Pending discovery...'} delay={0.25} />
            {session.gap_in_ability && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.27, duration: 0.4 }}
                className="mb-6 pl-6"
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 border border-purple-200/60 px-3 py-1.5">
                  <span className="text-xs">{session.gap_in_ability === 'knowledge' ? '🧠' : session.gap_in_ability === 'capacity' ? '⚡' : '⏳'}</span>
                  <span className="text-[11px] font-bold text-purple-700 capitalize">{session.gap_in_ability} Gap</span>
                  <span className="text-[10px] text-purple-500">
                    {session.gap_in_ability === 'knowledge' ? "Don't know how" : session.gap_in_ability === 'capacity' ? "Don't have bandwidth" : "Tried and given up"}
                  </span>
                </div>
              </motion.div>
            )}
            <BriefSection title="The Real Problem" icon={Lightbulb} accentColor="#8b5cf6" content={session.diagnosis_bigger_problem_override || 'Pending diagnosis...'} delay={0.3} />
          </Column>

          {/* Section 3: The Path Forward (Spans full width in the inner grid) */}
          <div className="md:col-span-2">
            <Column title="3. The Path Forward" delay={0.3}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <BriefSection title="Buying Process & Timeline" icon={Clock} accentColor="#0ea5e9" content={buyingProcessContent} items={buyingProcessItems} />
                <BriefSection title="What Success Looks Like" icon={Target} accentColor="#8b5cf6" content={successVisionContent} items={successVisionItems} delay={0.32} />
                <BriefSection title="Projected Business Impact" icon={TrendingUp} accentColor="#10b981" content={roiSummary} delay={0.35} />
              </div>
            </Column>
          </div>
        </div>

        {/* Right Column (Alignment Indicators) */}
        <div className="w-full lg:w-[280px] shrink-0">
          <div className="lg:sticky lg:top-10 space-y-4">
            <div className="mb-2 px-1">
              <h3 className="text-[11px] font-black tracking-widest text-zinc-400 uppercase">Alignment Snapshot</h3>
              <p className="text-[9px] text-zinc-400 mt-1 leading-relaxed">Key indicators for mutual fit.</p>
            </div>
            
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-sky-500" />
              <LevelGauge label="Priority Level" levels={[{ text: 'Low', color: '#a1a1aa' }, { text: 'Moderate', color: '#f59e0b' }, { text: 'High', color: '#ef4444' }]} activeLevel={priorityLevel} themeColor={themeColor} />
            </motion.div>

            {session.worst_case_scenario && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
                className="rounded-2xl border border-rose-200/60 bg-gradient-to-br from-rose-50 to-orange-50/50 p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">⚠️</span>
                  <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-rose-600">Worst-Case Scenario</h4>
                </div>
                <p className="text-sm text-stone-700 leading-relaxed italic">"{session.worst_case_scenario}"</p>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
              <LevelGauge label="Internal Capability" levels={[{ text: 'Can Solve Internally', color: '#10b981' }, { text: 'Unsure', color: '#f59e0b' }, { text: 'Need Outside Help', color: '#ef4444' }]} activeLevel={abilityLevel === 0 ? 0 : abilityLevel === 1 ? 1 : 2} themeColor={themeColor} />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <LevelGauge label="Solution Fit" levels={[{ text: 'Exploring', color: '#a1a1aa' }, { text: 'Partial Fit', color: '#f59e0b' }, { text: 'Strong Fit', color: '#10b981' }]} activeLevel={alignmentLevel} themeColor={themeColor} />
            </motion.div>
            
          </div>
        </div>

      </div>
    </section>
  );
}

export default ProblemCanvas;
