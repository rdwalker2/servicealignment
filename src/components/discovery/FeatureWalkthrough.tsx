/* eslint-disable react-refresh/only-export-components */
// ============================================================
// FeatureWalkthrough — D3 Solution Presentation (Rule of 3)
// Groups selected pains into 3 Solution Pillars with
// Complexity→Power framing and customer proof points
// ============================================================

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Palette, Brain, Users, BarChart3, Smartphone, Shield,
  Gift, Sparkles, Zap, ExternalLink
} from 'lucide-react';

// ── Demo Area definitions ──

export interface DemoArea {
  id: string;
  title: string;
  icon: React.ElementType;
  painIds: string[];
  description: string;
}

export const DEMO_AREAS: DemoArea[] = [
  { 
    id: 'captivate', 
    title: 'Captivate (Employer Brand)', 
    icon: Palette, 
    painIds: ['outdated-career-site', 'engineering-dependency', 'no-content-hub', 'poor-mobile-career', 'multi-language-gaps', 'weak-referrals'], 
    description: 'Turn your company into a talent magnet with a stunning, conversion-optimized career site.' 
  },
  { 
    id: 'capture', 
    title: 'Capture (Provider & AI Automation)', 
    icon: Shield, 
    painIds: ['screening-bottleneck', 'manual-screening', 'slow-time-to-hire', 'recruiter-burnout', 'locked-out-managers', 'scorecard-friction', 'scheduling-chaos', 'no-mobile-feedback', 'inconsistent-interviews', 'compliance-bottlenecks', 'high-cost-per-hire', 'dei-reporting-gaps', 'no-pipeline-visibility'], 
    description: 'Process applicants efficiently with AI automation, manager self-service, and structured interview kits.' 
  },
  { 
    id: 'convert', 
    title: 'Convert (Talent CRM & Nurture)', 
    icon: Users, 
    painIds: ['poor-candidate-experience', 'dead-nurture-pipeline', 'weak-talent-pools', 'onboarding-gaps', 'unmeasurable-brand-roi'], 
    description: 'Build long-term talent pools, automate candidate nurturing, and seamlessly onboard new hires.' 
  },
];

// ── Feature data (Complexity→Power framing) ──

interface FeatureData {
  title: string;
  product: string;
  without: string;
  withTT: string;
  proof: string;
}

const FEATURES: Record<string, FeatureData> = {
  // Employer Brand & Career Site
  'outdated-career-site': { title: 'Drag-and-Drop Career Site Builder', product: 'Career Site', without: 'Engineering tickets for every career page update', withTT: 'Anyone on the team builds stunning, on-brand pages in minutes', proof: 'Knauf — 50%+ applicant boost across 90+ countries' },
  'engineering-dependency': { title: 'No-Code Career Site & Automations', product: 'Career Site + Smart Move', without: 'Dev sprints consumed by recruiting page requests', withTT: 'TA owns the career site end-to-end — zero dev dependency', proof: 'Dacha Real Estate — career site live in 2 days, no developers' },
  'no-content-hub': { title: 'Blog & Content Engine', product: 'Career Site', without: 'You rely on job boards for every single hire', withTT: 'Your career site becomes a talent magnet with SEO-optimized content', proof: 'Companies with content hubs see 3x more organic applicants' },
  'poor-mobile-career': { title: 'Mobile-First Career Pages', product: 'Career Site', without: 'Candidates can\'t apply from their phone — 60% bounce', withTT: 'Apply in under 60 seconds on any device', proof: 'Volvo — 60% of all applications come from mobile' },
  'multi-language-gaps': { title: '30+ Language Support', product: 'Career Site', without: 'Separate career sites per region, manual translation costs', withTT: 'One career site, automatically localized for every market', proof: 'Pleo — hiring seamlessly across 15 countries' },

  // AI & Automation
  'screening-bottleneck': { title: 'AI Co-pilot Intelligence Suite', product: 'AI Co-pilot', without: 'Recruiters spend 6 seconds per resume — at 200+ apps per role', withTT: 'AI surfaces the best candidates instantly, writes JDs, and summarizes', proof: 'Movember — 99% candidate satisfaction with AI-assisted flow' },
  'manual-screening': { title: 'AI Resume Screening', product: 'AI Co-pilot', without: '23 hours/week lost to manual resume review per recruiter', withTT: 'AI ranks and surfaces top matches — humans make final decisions', proof: '80% reduction in screening time for high-volume roles' },
  'slow-time-to-hire': { title: 'Automation & Triggers', product: 'Smart Move', without: 'Manual stage movements, forgotten follow-ups, candidates going cold', withTT: 'Automated workflows keep every candidate moving through the pipeline', proof: 'Dacha — cut time-to-hire by 40% with Smart Move automations' },
  'recruiter-burnout': { title: 'Workflow Automation', product: 'Triggers', without: 'Recruiters drowning in admin — 17.7 hrs/wk lost per vacancy', withTT: 'Automate the mundane, let recruiters focus on humans', proof: '35-55% reduction in admin time with automated workflows' },

  // Candidate Experience & Engagement
  'poor-candidate-experience': { title: 'Candidate-First Experience', product: 'Candidate Experience', without: '60% of candidates abandon applications that feel broken', withTT: 'Beautiful, branded apply flow that candidates actually complete', proof: 'Hoxhunt — €10,000 saved with 3x application completion' },
  'dead-nurture-pipeline': { title: 'Connect & Nurture Campaigns', product: 'Connect + Nurture', without: 'Silver-medalist candidates forgotten — rehiring from scratch every time', withTT: 'Automated nurture keeps your talent pool warm and engaged', proof: 'Pemo — 40% of hires from nurtured talent pool in MENA' },
  'weak-talent-pools': { title: 'Candidate CRM & Talent Pools', product: 'Candidate CRM', without: 'No proactive pipeline — every role starts from zero', withTT: 'Build, segment, and activate talent pools before roles open', proof: 'ESTO — 21-day time-to-hire from pre-built talent pools' },

  // Analytics & Intelligence
  'unmeasurable-brand-roi': { title: 'Recruitment Analytics & Reporting', product: 'Reporting & Analytics', without: 'Exporting to Excel weekly — leadership can\'t see recruiting impact', withTT: 'Live dashboards that answer questions in seconds', proof: 'Giacom — real-time pipeline dashboards replaced manual reporting' },
  'no-pipeline-visibility': { title: 'Real-Time Pipeline Analytics', product: 'Reporting', without: 'Pulling reports manually — always a week behind', withTT: 'Live dashboards with pipeline velocity, source ROI, and bottleneck alerts', proof: 'Giacom — data-driven decisions replaced gut-feel forecasting' },
  'dei-reporting-gaps': { title: 'Structured Hiring Analytics', product: 'Analytics', without: 'Post-hoc compliance reports only — no real-time DEI tracking', withTT: 'Track diversity at every pipeline stage with live dashboards', proof: 'Real-time DEI pipeline dashboards for proactive compliance' },

  // Manager Self-Service
  'locked-out-managers': { title: 'Consumer-Grade Mobile App', product: 'Mobile App + Chat', without: 'Managers refuse the Provider — recruiters do admin FOR them', withTT: 'Full pipeline management from any device, in under 30 seconds', proof: 'Actavo — 90% hiring manager adoption on mobile' },
  'scorecard-friction': { title: 'Simple Rating System', product: 'Interview Kits', without: 'Complex scorecard forms managers won\'t fill out', withTT: '2-minute mobile scorecards managers actually love using', proof: 'Lotus — 95% scorecard completion rate' },
  'scheduling-chaos': { title: 'Smart Scheduling', product: 'Calendar', without: '5+ emails to book one interview — scheduling is the bottleneck', withTT: 'Candidates self-schedule in one click with calendar sync', proof: 'Reduce scheduling back-and-forth by 80%' },
  'no-mobile-feedback': { title: 'Full Mobile App', product: 'Mobile App', without: 'Managers can\'t review candidates from their phone', withTT: 'Full pipeline management, feedback, and approvals from any device', proof: 'Actavo — managers review and approve from the train' },

  // Structured Hiring
  'inconsistent-interviews': { title: 'Interview Kits & AI Questions', product: 'Interview Kits + AI', without: 'Every interviewer asks different questions — inconsistent evaluation', withTT: 'Structured kits ensure fair, consistent, competency-based interviews', proof: 'Lotus — standardized process across 12 hiring managers' },
  'compliance-bottlenecks': { title: 'GDPR Compliance & Data Protection', product: 'GDPR & Security', without: 'Manual consent tracking, audit anxiety, data scattered everywhere', withTT: 'Automated consent, retention policies, and audit-ready compliance', proof: 'Rocco Forte Hotels — GDPR compliance across 15 properties' },
  'high-cost-per-hire': { title: 'All-in-One Platform', product: 'Platform', without: 'Paying for 5+ separate recruiting tools — hidden TCO', withTT: 'One platform replaces your entire recruiting tech stack', proof: 'Companies save $15K+/year consolidating to Service Alignment' },

  // Employee Programs
  'weak-referrals': { title: 'Employee Referral Engine', product: 'Referrals', without: 'Broken referral process — employees don\'t know what roles are open', withTT: 'Gamified referrals with tracking, rewards, and team leaderboards', proof: 'Wego — referrals became #2 source of quality hires' },
  'onboarding-gaps': { title: 'Seamless Onboarding Module', product: 'Onboarding', without: 'The gap between offer acceptance and Day 1 loses candidates', withTT: 'Pre-boarding tasks, welcome content, and team introductions', proof: 'Scandinavian Executive — zero Day-1 no-shows after onboarding launch' },
};

const PILLAR_COLORS = [
  { accent: '#0ea5e9', bg: 'bg-sky-50', border: 'border-sky-200', bar: 'bg-sky-500', badge: 'bg-sky-100 text-sky-700' },
  { accent: '#8b5cf6', bg: 'bg-violet-50', border: 'border-violet-200', bar: 'bg-violet-500', badge: 'bg-violet-100 text-violet-700' },
  { accent: '#f59e0b', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700' },
];

interface Props {
  selectedObjectiveIds: string[];
  companyName: string;
  themeColor: string;
  overriddenPillars?: string[];
}

export default function FeatureWalkthrough({ selectedObjectiveIds, companyName, themeColor = '#1c1917', overriddenPillars = [] }: Props) {
  const pillars = useMemo(() => {
    // If no pains and no overrides, return empty to hide section
    if (!selectedObjectiveIds.length && !overriddenPillars.length) return [];

    // Group selected pains by demo area
    let areaScores: { area: DemoArea; matchedPains: string[] }[] = [];
    for (const area of DEMO_AREAS) {
      const matched = area.painIds.filter(id => selectedObjectiveIds.includes(id));
      if (matched.length > 0) {
        areaScores.push({ area, matchedPains: matched });
      }
    }

    // Sort by number of matching pains (descending)
    areaScores.sort((a, b) => b.matchedPains.length - a.matchedPains.length);

    // Apply Overrides if any
    if (overriddenPillars.length > 0) {
      const overrideScores: { area: DemoArea; matchedPains: string[] }[] = [];
      const usedOverrideIds = new Set<string>();

      for (const id of overriddenPillars) {
        const area = DEMO_AREAS.find(a => a.id === id);
        if (area) {
          // Find any matched pains we already had for this area
          const existing = areaScores.find(s => s.area.id === id);
          overrideScores.push({
            area,
            matchedPains: existing ? existing.matchedPains : area.painIds.slice(0, 2)
          });
          usedOverrideIds.add(id);
        }
      }

      // Filter out overridden ones from the auto-calculated list
      areaScores = areaScores.filter(s => !usedOverrideIds.has(s.area.id));
      // Prepend overrides
      areaScores = [...overrideScores, ...areaScores];
    }
    
    // Always return 3 pillars to maintain the "Three Pillars" sales framework
    if (areaScores.length < 3) {
      const usedAreaIds = new Set(areaScores.map(s => s.area.id));
      const fallbackOrder = ['captivate', 'capture', 'convert'];
      
      for (const fallbackId of fallbackOrder) {
        if (areaScores.length >= 3) break;
        if (!usedAreaIds.has(fallbackId)) {
          const area = DEMO_AREAS.find(a => a.id === fallbackId);
          if (area) {
            // Provide 2 default features for the padded pillar
            areaScores.push({ area, matchedPains: area.painIds.slice(0, 2) });
            usedAreaIds.add(fallbackId);
          }
        }
      }
    }

    // Always sort the final 3 pillars in the canonical order: Captivate -> Capture -> Convert
    const canonicalOrder = ['captivate', 'capture', 'convert'];
    areaScores.sort((a, b) => canonicalOrder.indexOf(a.area.id) - canonicalOrder.indexOf(b.area.id));

    return areaScores.slice(0, 3);
  }, [selectedObjectiveIds]);



  if (pillars.length === 0) {
    return (
      <div className="py-12 text-center">
        <Sparkles className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
        <p className="text-sm text-zinc-400">Select challenges above to see your tailored solution</p>
      </div>
    );
  }

  return (
    <div>
      {/* Section header */}
      <div className="mb-4 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">Your Method</p>
        <h2 className="mb-3 text-2xl font-bold text-zinc-900 sm:text-3xl">
          Three Pillars to Solve {companyName}'s Hiring Challenges
        </h2>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-zinc-500">
          Based on the challenges you've identified, here's exactly how Service Alignment handles the complexity —
          so your team doesn't have to.
        </p>
      </div>

      {/* Complexity→Power intro */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto mb-10 flex max-w-xl items-center gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${themeColor}15` }}>
          <Zap size={18} style={{ color: themeColor }} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">The Service Alignment Approach</p>
          <p className="text-sm text-zinc-600">We bear the burden of complexity so it becomes <strong className="text-zinc-900">your power</strong>, not your problem.</p>
        </div>
      </motion.div>

      {/* 3 Pillars */}
      <div className="grid gap-6 lg:grid-cols-3">
        {pillars.map(({ area, matchedPains }, i) => {
          const colors = PILLAR_COLORS[i] || PILLAR_COLORS[0];
          const Icon = area.icon;

          return (
            <motion.div
              key={area.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className={`relative overflow-hidden rounded-2xl border ${colors.border} ${colors.bg}`}
            >
              {/* Colored accent bar */}
              <div className={`absolute left-0 top-0 h-full w-1 ${colors.bar}`} />

              {/* Pillar header */}
              <div className="p-5 pb-3">
                <div className="mb-3 flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${colors.badge}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Pillar {i + 1}</span>
                    <h3 className="text-sm font-bold text-zinc-900">{area.title}</h3>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Solving: {matchedPains.map(id => FEATURES[id]?.title || id).join(' · ')}
                </p>
              </div>

              {/* Feature cards within pillar */}
              <div className="space-y-3 p-5 pt-0">
                {matchedPains.map((painId) => {
                  const feature = FEATURES[painId];
                  if (!feature) return null;

                  return (
                    <motion.div
                      key={painId}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="rounded-xl border border-white/80 bg-white p-4 shadow-sm"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <h4 className="text-xs font-bold text-zinc-900">{feature.title}</h4>
                        <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-semibold text-zinc-500">{feature.product}</span>
                      </div>

                      {/* Without / With comparison */}
                      <div className="mb-3 space-y-1.5">
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-rose-100 text-center text-[10px] font-bold leading-4 text-rose-500">✕</span>
                          <p className="text-[11px] leading-relaxed text-zinc-400">{feature.without}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full text-center text-[10px] font-bold leading-4 text-white" style={{ backgroundColor: themeColor }}>✓</span>
                          <p className="text-[11px] font-medium leading-relaxed text-zinc-700">{feature.withTT}</p>
                        </div>
                      </div>

                      {/* Proof point & Docs */}
                      <div className="border-t border-zinc-100 pt-3 mt-3 flex items-center justify-between gap-3">
                        <p className="text-[10px] italic text-zinc-400 flex-1">
                          {feature.proof}
                        </p>
                        <a 
                          href={`https://support.servicealignment.com/en/?q=${encodeURIComponent(feature.product)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 shrink-0 text-[9px] font-bold uppercase tracking-wider text-zinc-400 hover:text-stone-800 transition-colors"
                        >
                          See Feature <ExternalLink size={10} />
                        </a>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
