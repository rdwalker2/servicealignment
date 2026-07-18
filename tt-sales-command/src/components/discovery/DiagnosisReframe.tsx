import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, AlertTriangle, Target, Lightbulb } from 'lucide-react';

// ── Persona → Bigger Problem Reframe ──

interface BiggerProblem {
  persona: string;
  surfaceLabel: string;
  biggerProblem: string;
  reframeQuestion: string;
  costFrame: string;
}

const PERSONA_REFRAMES: Record<string, BiggerProblem> = {
  'dir-eb': {
    persona: 'Director of Employer Brand',
    surfaceLabel: 'Brand & Career Site Issues',
    biggerProblem: "You're invisible to the 70% of talent that's passive — every competitor with a stronger employer brand is winning candidates you never even see.",
    reframeQuestion: "When was the last time you measured how many qualified candidates abandoned your career site before applying?",
    costFrame: "talent brand gap",
  },
  'vp-ta': {
    persona: 'VP of Talent Acquisition',
    surfaceLabel: 'Operational Bottlenecks',
    biggerProblem: "Your TA team spends 60% of their time on manual sourcing and screening instead of closing — that's a capacity crisis that compounds every quarter.",
    reframeQuestion: "If your recruiters could reclaim 15 hours per week from manual tasks, how many more hires would they close?",
    costFrame: "recruiter capacity gap",
  },
  'chro': {
    persona: 'CHRO / VP People',
    surfaceLabel: 'Experience & Compliance Gaps',
    biggerProblem: "You're losing the talent war to competitors who move 3x faster — speed IS your competitive advantage, and every day of delay costs you your best candidates.",
    reframeQuestion: "How many of your top-choice candidates accepted another offer before you made yours?",
    costFrame: "competitive speed gap",
  },
  'hiring-manager': {
    persona: 'Hiring Managers',
    surfaceLabel: 'Adoption & Enablement Gaps',
    biggerProblem: "Every day a hiring manager can't self-serve in your system, you add 5 days to time-to-fill — and your best candidates are gone in 10.",
    reframeQuestion: "What percentage of your hiring managers actually log into your ATS more than once a month?",
    costFrame: "manager adoption gap",
  },
  'cfo': {
    persona: 'CFO / Finance',
    surfaceLabel: 'Cost & ROI Visibility',
    biggerProblem: "You're paying for a fragmented stack of tools that each solve 20% of the problem — meanwhile agency fees, vacancy costs, and recruiter admin are compounding unchecked because nobody can see the total cost of hiring.",
    reframeQuestion: "Do you know what your true all-in cost per hire is today — including agency fees, job boards, recruiter time, and vacancy costs?",
    costFrame: "hidden hiring cost crisis",
  },
  'recruiter': {
    persona: 'Recruiter / TA Specialist',
    surfaceLabel: 'Daily Workflow Friction',
    biggerProblem: "You're spending 60% of your day on admin — data entry, scheduling, chasing feedback, copy-pasting between tools — and the candidates you're fighting to engage are slipping through the cracks while you're buried in process.",
    reframeQuestion: "How many hours per week do you spend on tasks that aren't actually talking to candidates or hiring managers?",
    costFrame: "recruiter productivity drain",
  },
  'procurement': {
    persona: 'Procurement / IT Procurement',
    surfaceLabel: 'Vendor & Compliance Risk',
    biggerProblem: "Your current vendor is either holding your data hostage with lock-in pricing, failing security audits, or both — and every renewal cycle the leverage shifts further away from you.",
    reframeQuestion: "When was the last time you benchmarked your ATS vendor's pricing against the market — and did you have a viable migration path?",
    costFrame: "vendor risk exposure",
  },
  'it-cio': {
    persona: 'IT / CIO',
    surfaceLabel: 'Integration & Security Gaps',
    biggerProblem: "Your HR tech stack has become shadow IT — scattered tools, manual data handoffs, no SSO, and compliance gaps that won't survive your next audit.",
    reframeQuestion: "How many of your recruiting tools are outside your SSO and not covered by your security review process?",
    costFrame: "HR tech governance gap",
  },
  'all': {
    persona: 'Leadership Team',
    surfaceLabel: 'Hiring Infrastructure',
    biggerProblem: "Your hiring infrastructure wasn't built for the speed and scale your business needs today — you're solving symptoms instead of the root cause.",
    reframeQuestion: "If you could redesign your entire hiring process from scratch, what would be the first thing you'd fix?",
    costFrame: "infrastructure gap",
  },
};

// ── Pain → Feature → Demo Focus Mapping ──

const PAIN_TO_FEATURE: Record<string, { feature: string; demoArea: string; icon: string }> = {
  // Captivate
  'outdated-career-site':    { feature: 'Career Site Builder',       demoArea: 'Captivate (Employer Brand)',   icon: '🎨' },
  'engineering-dependency':  { feature: 'No-Code Career Site',       demoArea: 'Captivate (Employer Brand)',   icon: '🎨' },
  'no-content-hub':          { feature: 'Blog & Content Engine',     demoArea: 'Captivate (Employer Brand)',   icon: '📝' },
  'poor-mobile-career':      { feature: 'Mobile-First Career Pages', demoArea: 'Captivate (Employer Brand)',   icon: '📱' },
  'multi-language-gaps':     { feature: '30+ Language Support',      demoArea: 'Captivate (Employer Brand)',   icon: '🌍' },
  'weak-referrals':          { feature: 'Employee Referrals',        demoArea: 'Captivate (Employer Brand)',   icon: '🤝' },

  // Capture
  'screening-bottleneck':    { feature: 'AI Co-pilot',               demoArea: 'Capture (ATS & AI)',           icon: '🤖' },
  'manual-screening':        { feature: 'AI Resume Screening',      demoArea: 'Capture (ATS & AI)',           icon: '🤖' },
  'slow-time-to-hire':       { feature: 'Automation & Triggers',    demoArea: 'Capture (ATS & AI)',           icon: '⚡' },
  'recruiter-burnout':       { feature: 'Workflow Automation',      demoArea: 'Capture (ATS & AI)',           icon: '🔥' },
  'locked-out-managers':     { feature: 'Mobile App',                demoArea: 'Capture (ATS & AI)',           icon: '📱' },
  'scorecard-friction':      { feature: 'Simple Scorecards',        demoArea: 'Capture (ATS & AI)',           icon: '⭐' },
  'scheduling-chaos':        { feature: 'Smart Scheduling',         demoArea: 'Capture (ATS & AI)',           icon: '📅' },
  'no-mobile-feedback':      { feature: 'Full Mobile App',          demoArea: 'Capture (ATS & AI)',           icon: '📱' },
  'inconsistent-interviews': { feature: 'Interview Kits',            demoArea: 'Capture (ATS & AI)',           icon: '📋' },
  'compliance-bottlenecks':  { feature: 'GDPR & Compliance',         demoArea: 'Capture (ATS & AI)',           icon: '🛡️' },
  'high-cost-per-hire':      { feature: 'All-in-One Platform',      demoArea: 'Capture (ATS & AI)',           icon: '💰' },
  'dei-reporting-gaps':      { feature: 'DEI Analytics',            demoArea: 'Capture (ATS & AI)',           icon: '📈' },
  'no-pipeline-visibility':  { feature: 'Real-Time Analytics',      demoArea: 'Capture (ATS & AI)',           icon: '📊' },

  // Convert
  'poor-candidate-experience': { feature: 'Candidate Experience',    demoArea: 'Convert (Talent CRM)',         icon: '✨' },
  'dead-nurture-pipeline':   { feature: 'Connect & Nurture',         demoArea: 'Convert (Talent CRM)',         icon: '💌' },
  'weak-talent-pools':       { feature: 'Candidate CRM',             demoArea: 'Convert (Talent CRM)',         icon: '👥' },
  'onboarding-gaps':         { feature: 'Onboarding',                demoArea: 'Convert (Talent CRM)',         icon: '🚀' },
  'unmeasurable-brand-roi':  { feature: 'Reporting & Analytics',     demoArea: 'Convert (Talent CRM)',         icon: '📈' },
};

function getDemoFocusAreas(selectedPains: string[]): { icon: string; area: string; features: string[] }[] {
  // Group pains by demo area
  const grouped: Record<string, { icon: string; features: string[] }> = {};
  selectedPains.forEach(painId => {
    const mapping = PAIN_TO_FEATURE[painId];
    if (!mapping) return;
    if (!grouped[mapping.demoArea]) {
      grouped[mapping.demoArea] = { icon: mapping.icon, features: [] };
    }
    if (!grouped[mapping.demoArea].features.includes(mapping.feature)) {
      grouped[mapping.demoArea].features.push(mapping.feature);
    }
  });
  // Ensure canonical order
  const canonicalOrder = ['Captivate (Employer Brand)', 'Capture (ATS & AI)', 'Convert (Talent CRM)'];
  
  // Return top 3 areas, sorted properly
  return Object.entries(grouped)
    .sort((a, b) => canonicalOrder.indexOf(a[0]) - canonicalOrder.indexOf(b[0]))
    .slice(0, 3)
    .map(([area, data]) => ({ icon: data.icon, area, features: data.features }));
}

// ── Component ──

interface DiagnosisReframeProps {
  companyName: string;
  themeColor?: string;
  selectedPains: string[];
  persona: string | null;
  currentApproach?: string;
  rootCause?: string;
  biggerProblemOverride?: string;
  rootCauseQuotes?: Record<string, string>;
}

export function DiagnosisReframe({ companyName, themeColor = '#1c1917', selectedPains, persona, currentApproach, rootCause, biggerProblemOverride, rootCauseQuotes }: DiagnosisReframeProps) {
  const reframe = PERSONA_REFRAMES[persona || 'all'] || PERSONA_REFRAMES['all'];
  const demoFocus = getDemoFocusAreas(selectedPains);
  const hasPains = selectedPains.length > 0;

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="mb-10 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">
          D2 — Diagnosis
        </p>
        <h2 className="mb-4 text-3xl font-bold text-zinc-900">
          The Bigger Problem
        </h2>
        <p className="mx-auto max-w-2xl text-zinc-500">
          The challenges you've identified point to something larger. Let's connect the dots.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left: The Reframe */}
        <div className="space-y-6">
          {/* Surface Problem */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6"
          >
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">What You Told Us</span>
            </div>
            {hasPains ? (
              <div className="space-y-2">
                {selectedPains.slice(0, 4).map(painId => {
                  const mapping = PAIN_TO_FEATURE[painId];
                  return mapping ? (
                    <div key={painId} className="flex items-center gap-2 text-sm text-zinc-700">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      {mapping.feature} challenges
                    </div>
                  ) : null;
                })}
                {selectedPains.length > 4 && (
                  <div className="text-xs text-zinc-400">+ {selectedPains.length - 4} more</div>
                )}
                {currentApproach && (
                  <div className="mt-3 pt-3 border-t border-zinc-200">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Current Approach</p>
                    <p className="text-sm text-zinc-600 italic">"{currentApproach}"</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-400 italic">Select pain points above to see your diagnosis</p>
            )}
          </motion.div>

          {/* Arrow connector */}
          {hasPains && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex justify-center"
            >
              <div className="flex flex-col items-center gap-1">
                <div className="h-6 w-px" style={{ backgroundColor: themeColor }} />
                <ArrowRight size={14} className="rotate-90" style={{ color: themeColor }} />
              </div>
            </motion.div>
          )}

          {/* Bigger Problem */}
          {hasPains && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="rounded-2xl border-2 p-6 shadow-lg"
              style={{ borderColor: themeColor, backgroundColor: `${themeColor}08` }}
            >
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb size={16} style={{ color: themeColor }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: themeColor }}>The Real Issue</span>
              </div>
              <p className="mb-4 text-lg font-semibold leading-relaxed text-zinc-900">
                {biggerProblemOverride || reframe.biggerProblem}
              </p>
              {rootCause && (
                <div className="mb-4 rounded-xl bg-white/60 border border-zinc-200 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Root Cause ({companyName})</p>
                  <p className="text-sm font-medium text-zinc-800">"{rootCause}"</p>
                </div>
              )}

              {/* Prospect root cause quotes */}
              {rootCauseQuotes && Object.entries(rootCauseQuotes).filter(([id]) => selectedPains.includes(id)).slice(0, 2).map(([id, quote]) => (
                <div key={id} className="mt-3 px-3 py-2 bg-amber-50 border-l-2 border-amber-400 rounded-r-lg">
                  <p className="text-xs text-amber-800 italic leading-relaxed">
                    "{quote}"
                  </p>
                  <span className="text-[10px] text-amber-600 font-medium mt-1 block">— Prospect</span>
                </div>
              ))}

            </motion.div>
          )}
        </div>

        {/* Right: Demo Agenda */}
        <div className="space-y-6">
          {/* Demo Focus Areas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl bg-zinc-900 p-6 text-white shadow-2xl"
          >
            <div className="mb-5 flex items-center gap-2">
              <Sparkles size={16} style={{ color: themeColor }} />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                The Teamtailor Flywheel
              </span>
            </div>

            <AnimatePresence mode="wait">
              {demoFocus.length > 0 ? (
                <motion.div
                  key="focus"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {demoFocus.map((focus, i) => (
                    <motion.div
                      key={focus.area}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="flex items-start gap-4 rounded-xl bg-zinc-800/60 p-4 ring-1 ring-zinc-700/50"
                    >
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg"
                        style={{ backgroundColor: `${themeColor}20` }}
                      >
                        {focus.icon}
                      </div>
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: themeColor }}>
                            Pillar {i + 1}
                          </span>
                        </div>
                        <h4 className="font-bold text-zinc-100">{focus.area}</h4>
                        <p className="mt-1 text-xs text-zinc-400">
                          {focus.features.join(' · ')}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="py-8 text-center">
                  <Target size={28} className="mx-auto mb-3 text-zinc-600" />
                  <p className="text-sm text-zinc-500">Select pain points to generate your flywheel agenda</p>
                </div>
              )}
            </AnimatePresence>

            {demoFocus.length > 0 && (
              <div className="mt-5 rounded-xl p-3 text-center" style={{ backgroundColor: `${themeColor}15` }}>
                <p className="text-[11px] font-medium text-zinc-400">
                  Demo structured around {companyName}'s <span className="font-bold" style={{ color: themeColor }}>{reframe.costFrame}</span> — not a generic feature tour
                </p>
              </div>
            )}
          </motion.div>


        </div>
      </div>
    </div>
  );
}
