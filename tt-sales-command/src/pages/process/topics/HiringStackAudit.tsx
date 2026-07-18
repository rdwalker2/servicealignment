import { useState } from 'react';
import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';
import { Star, BarChart3, Users, Cpu, Search, Gauge, ArrowRight, RotateCcw } from 'lucide-react';

// ─── Pillar Data ──────────────────────────────────────────────────

interface ScoringLevel {
  score: number;
  label: string;
  description: string;
}

interface AuditPillar {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  realPain: string;
  discoveryQuestions: string[];
  listenFor: string[];
  wave3Link: string;
  levels: ScoringLevel[];
}

const PILLARS: AuditPillar[] = [
  {
    id: 'process',
    name: 'Process Efficiency',
    subtitle: 'How much manual work is the team doing?',
    icon: <Gauge size={18} />,
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    realPain: '"I am at my wits end with recruiting." — 70%+ of deals start here. The team is drowning in manual screening, scheduling, email coordination, and Excel tracking.',
    discoveryQuestions: [
      '"Walk me through what happens when a new role opens — from the req to the first interview. How many steps is that?"',
      '"How are you screening applications right now — manually reading every resume, or is there any automation?"',
      '"How does interview scheduling work? Are you going back and forth on email, or is there a tool?"',
      '"When a hiring manager needs an update on a role, how do they get it?"',
    ],
    listenFor: [
      'Mentions of spreadsheets, email chains, or manual tracking',
      '"It takes forever" or "it\'s a lot of back and forth"',
      'Multiple systems / double-entry ("we have to input into 10 different systems")',
      'One person doing everything ("it\'s just me and one other person")',
    ],
    wave3Link: 'Wave 3 #4 (Application Drop-Off) or #5 (Source ROI)',
    levels: [
      { score: 1, label: 'Drowning', description: 'Paper apps, email, spreadsheets. No system at all.' },
      { score: 2, label: 'Patching', description: 'Some tools but heavy workarounds. "Bolting things on."' },
      { score: 3, label: 'Functional', description: 'ATS exists but lots of manual steps remain.' },
      { score: 4, label: 'Solid', description: 'Mostly automated with a few gaps.' },
      { score: 5, label: 'Dialed', description: 'Fully streamlined, minimal manual work.' },
    ],
  },
  {
    id: 'experience',
    name: 'Candidate Experience',
    subtitle: 'What does a candidate see when they find you?',
    icon: <Users size={18} />,
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    realPain: '"We still have paper applications." — The career page is where deals get WON in the demo. It\'s the #1 wow moment. Not why they take the call, but what seals it.',
    discoveryQuestions: [
      '"When was the last time you pulled up your career page on your phone and tried to apply?"',
      '"How long does it take a candidate to go from finding a job post to submitting an application?"',
      '"After someone applies, how quickly do they hear back — and is that automated or manual?"',
      '"Do candidates ever tell you the application process was frustrating or confusing?"',
    ],
    listenFor: [
      '"We don\'t really have a career page" or "it\'s just a list of jobs"',
      'Long application processes (paper, multi-step, account creation)',
      '"Candidates ghost us" or high drop-off rates',
      'No employer branding — just a generic job board listing',
    ],
    wave3Link: 'Wave 3 #1 (Candidate Experience Audit) or #3 (Mobile Career Site)',
    levels: [
      { score: 1, label: 'Invisible', description: 'No career page. Paper apps or email-only.' },
      { score: 2, label: 'Generic', description: 'Job board listing. No branding, no mobile.' },
      { score: 3, label: 'Basic', description: 'Career page exists but poor mobile, slow apply.' },
      { score: 4, label: 'Decent', description: 'Branded page, reasonable process, some gaps.' },
      { score: 5, label: 'Premium', description: 'Strong brand, mobile-first, fast apply, auto-responses.' },
    ],
  },
  {
    id: 'technology',
    name: 'Technology Utilization',
    subtitle: 'Are they getting what they pay for?',
    icon: <Search size={18} />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    realPain: '"Our applicant tracking system sucks." — 40% of deals involve replacing an HRIS vendor\'s ATS module that was never built for recruiting. The afterthought problem.',
    discoveryQuestions: [
      '"What are you using for recruiting right now? Is it a standalone system or part of your HRIS?"',
      '"How long have you been on it? And would you say it does everything you need?"',
      '"Does it ever feel like the recruiting side doesn\'t get the same love as payroll and benefits?"',
      '"Are there things you wish it could do that it just... can\'t? Or that you\'re working around?"',
    ],
    listenFor: [
      'HRIS name (ADP, Paycom, Workday, UKG, Paycor, Dayforce) = afterthought play',
      '"It does the job, but..." — they\'re settling',
      'Workarounds: "I have to export to Excel and then..."',
      '"We\'ve been on it for X years" + no recent evaluation',
    ],
    wave3Link: 'Wave 3 #2 (SHRM Tech Evaluation) or #10 (Getting What You Pay For)',
    levels: [
      { score: 1, label: 'Nothing', description: 'No ATS at all. Email and spreadsheets.' },
      { score: 2, label: 'Afterthought', description: 'HRIS with basic ATS module. "It came with it."' },
      { score: 3, label: 'Underused', description: 'Dedicated ATS but using less than half the features.' },
      { score: 4, label: 'Capable', description: 'Using most features, a few pain points.' },
      { score: 5, label: 'Optimized', description: 'Fully utilizing a modern, dedicated ATS.' },
    ],
  },
  {
    id: 'intelligence',
    name: 'Hiring Intelligence',
    subtitle: 'Do they know what\'s working?',
    icon: <BarChart3 size={18} />,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    realPain: '"I\'m tracking in an Excel sheet." — Most teams have zero visibility into what\'s working. No source tracking, no pipeline metrics, no data-driven decisions.',
    discoveryQuestions: [
      '"Do you know which sourcing channels are actually producing your hires — not just applications, but actual hires?"',
      '"Can you pull up your time-to-fill or cost-per-hire right now, or would that take some digging?"',
      '"When leadership asks \'how\'s recruiting going?\' — what do you show them?"',
      '"Are you tracking where candidates drop off in your process?"',
    ],
    listenFor: [
      '"I\'d have to look that up" or "I don\'t know off the top of my head"',
      'No source attribution — "we post everywhere and see what comes in"',
      'Manual reporting — pulling data into spreadsheets for leadership',
      '"We don\'t really track that" — the most common answer',
    ],
    wave3Link: 'Wave 3 #5 (Job Board ROI) or #6 (Cost-Per-Hire)',
    levels: [
      { score: 1, label: 'Blind', description: 'No tracking at all. "We don\'t know."' },
      { score: 2, label: 'Gut Feel', description: 'Anecdotal sense of what works, no data.' },
      { score: 3, label: 'Basic', description: 'Some reports but manual, not real-time.' },
      { score: 4, label: 'Informed', description: 'Good visibility, regular reporting cadence.' },
      { score: 5, label: 'Data-Driven', description: 'Real-time dashboards, source ROI, pipeline metrics.' },
    ],
  },
  {
    id: 'scalability',
    name: 'AI & Scalability',
    subtitle: 'Can their setup handle growth without adding headcount?',
    icon: <Cpu size={18} />,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    realPain: '"If you do it manually, it will run your mind out." — When volume goes up, manual processes break. AI Copilot creates the biggest contrast in demos — 60%+ of prospects react to it.',
    discoveryQuestions: [
      '"If your hiring volume doubled tomorrow, what breaks first?"',
      '"Is there any AI or automation in your current process — resume screening, candidate responses, scheduling?"',
      '"How much of your recruiter\'s time is spent on admin vs actually talking to candidates?"',
      '"If you could automate one thing in recruiting tomorrow, what would it be?"',
    ],
    listenFor: [
      '"We\'d need to hire another recruiter" — headcount-dependent scaling',
      '"Everything is manual" — no automation at all',
      '"I spend most of my time on admin" — doing the ATS\'s job',
      'Interest in AI but no idea what\'s available',
    ],
    wave3Link: 'Wave 3 #9 (AI Compliance) or #10 (ATS Utilization)',
    levels: [
      { score: 1, label: 'Manual', description: 'Zero automation. Everything is headcount-dependent.' },
      { score: 2, label: 'Basic', description: 'Auto-reply emails at best. No screening automation.' },
      { score: 3, label: 'Partial', description: 'Some automation triggers. No AI.' },
      { score: 4, label: 'Automated', description: 'Good automation, workflows, limited AI.' },
      { score: 5, label: 'AI-Powered', description: 'AI screening, auto-scheduling, smart workflows.' },
    ],
  },
];

// ─── Score Interpretation ─────────────────────────────────────────

function getScoreInterpretation(avg: number): { label: string; color: string; close: string } {
  if (avg <= 2.0) return {
    label: 'Significant Gaps',
    color: 'text-rose-700',
    close: `"Based on what we just walked through, you scored a ${avg.toFixed(1)} out of 5. The biggest gaps are in [lowest pillars]. This is exactly the type of situation we built Teamtailor for. Want to see what it looks like when these are solved? Takes 20 minutes."`,
  };
  if (avg <= 3.0) return {
    label: 'Clear Opportunities',
    color: 'text-amber-700',
    close: `"You scored a ${avg.toFixed(1)} out of 5. You've got the basics covered but the gaps in [lowest pillars] are probably costing you more than you realize. Let me show you what the next level looks like — 20 minutes, you'll see the difference immediately."`,
  };
  if (avg <= 4.0) return {
    label: 'Room to Optimize',
    color: 'text-blue-700',
    close: `"You're at a ${avg.toFixed(1)} — honestly, better than most teams I talk to. The question is whether it's worth 20 minutes to see what closes the gap in [lowest pillars]. Most people at your level are surprised by how much they're leaving on the table."`,
  };
  return {
    label: 'Strong Setup',
    color: 'text-emerald-700',
    close: `"You're at a ${avg.toFixed(1)} — you're in great shape. I'd still recommend a quick look at our AI capabilities — that's where we're seeing the biggest leap for teams that already have the fundamentals down. 15 minutes, worth it?"`,
  };
}

// ─── Score Button ─────────────────────────────────────────────────

function ScoreButton({ value, selected, onClick, pillar }: {
  value: number; selected: boolean; onClick: () => void; pillar: AuditPillar;
}) {
  const level = pillar.levels.find(l => l.score === value);
  return (
    <button
      onClick={onClick}
      title={level ? `${level.label}: ${level.description}` : ''}
      className={`w-9 h-9 rounded-lg text-[13px] font-bold transition-all ${
        selected
          ? `${pillar.bgColor} ${pillar.color} ring-2 ring-current shadow-sm`
          : 'bg-stone-100 text-stone-400 hover:bg-stone-200 hover:text-stone-600'
      }`}
    >
      {value}
    </button>
  );
}

// ─── Pillar Detail Card ───────────────────────────────────────────

function PillarDetail({ pillar }: { pillar: AuditPillar }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`rounded-xl border ${pillar.borderColor} overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full px-5 py-4 ${pillar.bgColor} flex items-center justify-between text-left`}
      >
        <div className="flex items-center gap-3">
          <span className={pillar.color}>{pillar.icon}</span>
          <div>
            <p className={`text-[14px] font-bold ${pillar.color}`}>{pillar.name}</p>
            <p className="text-[12px] text-stone-500">{pillar.subtitle}</p>
          </div>
        </div>
        <span className="text-stone-400 text-[12px]">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="p-5 space-y-4 bg-white">
          {/* Real pain */}
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">The Real Pain (From Our Data)</p>
            <p className="text-[12.5px] text-stone-700 italic">{pillar.realPain}</p>
          </div>

          {/* Discovery questions */}
          <div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Discovery Questions</p>
            <div className="space-y-2">
              {pillar.discoveryQuestions.map((q, i) => (
                <p key={i} className="text-[12.5px] text-stone-700 pl-3 border-l-2 border-stone-200">{q}</p>
              ))}
            </div>
          </div>

          {/* Listen for */}
          <div>
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Listen For</p>
            <div className="space-y-1">
              {pillar.listenFor.map((l, i) => (
                <p key={i} className="text-[12.5px] text-stone-600">• {l}</p>
              ))}
            </div>
          </div>

          {/* Scoring guide */}
          <div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Scoring Guide</p>
            <div className="space-y-1">
              {pillar.levels.map(level => (
                <div key={level.score} className="flex items-start gap-2 text-[12px]">
                  <span className={`w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold shrink-0 ${pillar.bgColor} ${pillar.color}`}>
                    {level.score}
                  </span>
                  <span className="text-stone-700"><strong>{level.label}</strong> — {level.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Wave 3 link */}
          <p className="text-[11px] text-stone-400 italic">Maps to: {pillar.wave3Link}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────

export default function HiringStackAudit() {
  const [scores, setScores] = useState<Record<string, number>>({});

  const scoredPillars = PILLARS.filter(p => scores[p.id] !== undefined);
  const avgScore = scoredPillars.length > 0
    ? scoredPillars.reduce((sum, p) => sum + (scores[p.id] || 0), 0) / scoredPillars.length
    : 0;
  const allScored = scoredPillars.length === PILLARS.length;
  const interpretation = getScoreInterpretation(avgScore);

  const lowestPillars = allScored
    ? [...PILLARS].sort((a, b) => (scores[a.id] || 0) - (scores[b.id] || 0)).slice(0, 2)
    : [];

  return (
    <div className="p-10 max-w-5xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader
        stage="THE VALUE-ADD"
        title="Hiring Stack Audit"
        subtitle="Your discovery call isn't a pitch — it's a free audit. Score their hiring stack across 5 pillars and close with data, not hope."
      />

      {/* Concept */}
      <DocSection title="The Concept">
        <div className="bg-stone-900 text-white p-6 rounded-xl">
          <p className="text-[15px] leading-relaxed">
            The meeting isn't a demo. It isn't a pitch. It's a <strong>Hiring Stack Audit</strong> — a 20-minute assessment where you score their recruiting setup across 5 pillars and show them exactly where the gaps are.
          </p>
          <p className="text-[15px] leading-relaxed mt-3">
            They get real value whether they buy or not. You get a structured discovery that naturally exposes every problem Teamtailor solves. <strong>The audit IS the Three Waves framework, delivered as a service.</strong>
          </p>
        </div>
      </DocSection>

      {/* Cold Call Close */}
      <DocSection title="How to Offer It on a Cold Call">
        <ScriptBlock label="The Cold Call Close — After Any Wave">
{`"What we typically do for teams in your situation is a quick Hiring
Stack Audit — takes about 20 minutes. We look at your process, your
tools, your candidate experience, and how you compare to companies
your size.

Worst case you confirm everything's in great shape.
Best case you find something worth fixing before your next big hire.

Worth a look?"`}
        </ScriptBlock>

        <ScriptBlock label="When They Say 'We Already Have a System'">
{`"That's actually exactly what we audit — Aptitude Research found 82%
of companies have significant gaps in their ATS and only 3% use it
to its full extent. We'll show you in 20 minutes if you're in the
3% or the 82%. Fair?"`}
        </ScriptBlock>

        <Callout type="success" title="Why This Works">
          You're not asking for a meeting — you're offering a free inspection. The word "audit" sounds like something a consultant does, not a sales rep. And "worst case / best case" removes all risk.
        </Callout>
      </DocSection>

      {/* Live Scorecard */}
      <DocSection title="Live Scorecard — Use During the Call">
        <p className="text-[13px] text-stone-500 mb-4">Click to score each pillar as you walk through the audit. Tap the pillar name to expand discovery questions and scoring criteria.</p>

        <div className="space-y-3">
          {PILLARS.map(pillar => (
            <div key={pillar.id} className="space-y-2">
              {/* Score row */}
              <div className={`flex items-center gap-4 p-4 rounded-xl border ${pillar.borderColor} ${pillar.bgColor}`}>
                <div className="flex items-center gap-2 min-w-[180px]">
                  <span className={pillar.color}>{pillar.icon}</span>
                  <div>
                    <p className={`text-[13px] font-bold ${pillar.color}`}>{pillar.name}</p>
                    <p className="text-[11px] text-stone-400">{pillar.subtitle}</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-auto">
                  {[1, 2, 3, 4, 5].map(val => (
                    <ScoreButton
                      key={val}
                      value={val}
                      selected={scores[pillar.id] === val}
                      onClick={() => setScores(prev => ({ ...prev, [pillar.id]: val }))}
                      pillar={pillar}
                    />
                  ))}
                </div>
              </div>

              {/* Scoring level hint */}
              {scores[pillar.id] && (
                <p className="text-[11px] text-stone-400 pl-5 italic">
                  {pillar.levels.find(l => l.score === scores[pillar.id])?.label}: {pillar.levels.find(l => l.score === scores[pillar.id])?.description}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Results */}
        {allScored && (
          <div className="mt-6 p-6 rounded-xl border-2 border-stone-800 bg-stone-900 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Audit Result</p>
                <p className="text-[28px] font-black">{avgScore.toFixed(1)} <span className="text-[14px] text-stone-400">/ 5.0</span></p>
              </div>
              <span className={`text-[13px] font-bold px-3 py-1.5 rounded-lg bg-stone-800 ${interpretation.color}`}>
                {interpretation.label}
              </span>
            </div>

            {/* Pillar breakdown */}
            <div className="flex gap-3 mb-4">
              {PILLARS.map(p => (
                <div key={p.id} className="flex-1 text-center">
                  <div className={`text-[18px] font-bold ${scores[p.id] <= 2 ? 'text-rose-400' : scores[p.id] <= 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {scores[p.id]}
                  </div>
                  <p className="text-[9px] text-stone-500 uppercase">{p.name.split(' ')[0]}</p>
                </div>
              ))}
            </div>

            {/* Lowest pillars */}
            {lowestPillars.length > 0 && (
              <div className="mb-4 p-3 bg-stone-800 rounded-lg">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Biggest Gaps</p>
                <p className="text-[13px] text-stone-300">
                  {lowestPillars.map(p => p.name).join(' & ')} — scored {lowestPillars.map(p => scores[p.id]).join(' & ')} out of 5.
                </p>
              </div>
            )}

            {/* Close script */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">
                <ArrowRight size={10} className="inline mr-1" />Your Close
              </p>
              <p className="text-[13px] text-stone-200 leading-relaxed">
                {interpretation.close.replace('[lowest pillars]', lowestPillars.map(p => p.name).join(' and '))}
              </p>
            </div>

            {/* Reset */}
            <button
              onClick={() => setScores({})}
              className="mt-4 flex items-center gap-1.5 text-[11px] text-stone-500 hover:text-stone-300 transition-colors"
            >
              <RotateCcw size={10} /> Reset scorecard
            </button>
          </div>
        )}

        {!allScored && scoredPillars.length > 0 && (
          <p className="mt-4 text-[12px] text-stone-400 italic text-center">
            Score all 5 pillars to see the audit result and your closing script.
          </p>
        )}
      </DocSection>

      {/* Pillar Deep-Dives */}
      <DocSection title="Pillar Deep-Dives — Discovery Questions & Scoring Guide">
        <p className="text-[13px] text-stone-500 mb-4">Tap each pillar to expand the full discovery playbook, scoring criteria, and what to listen for.</p>
        <div className="space-y-3">
          {PILLARS.map(pillar => (
            <PillarDetail key={pillar.id} pillar={pillar} />
          ))}
        </div>
      </DocSection>

      {/* Meeting Flow */}
      <DocSection title="The Meeting Flow">
        <div className="space-y-3">
          <div className="flex items-start gap-4 p-4 rounded-lg border border-stone-200 bg-stone-50">
            <span className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 text-sm font-black shrink-0">1</span>
            <div>
              <p className="font-bold text-stone-800 text-[14px]">Set the Frame (2 min)</p>
              <p className="text-[12px] text-stone-500 mt-1">"I'm going to walk through 5 areas of your hiring setup and score each one. At the end you'll know exactly where you stand and where the gaps are — if there are any. Sound good?"</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg border border-stone-200 bg-stone-50">
            <span className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 text-sm font-black shrink-0">2</span>
            <div>
              <p className="font-bold text-stone-800 text-[14px]">Walk the 5 Pillars (15 min)</p>
              <p className="text-[12px] text-stone-500 mt-1">Ask the discovery questions for each pillar. Score as you go. Don't pitch — just diagnose. Let THEM tell you what's broken.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg border border-stone-200 bg-stone-50">
            <span className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 text-sm font-black shrink-0">3</span>
            <div>
              <p className="font-bold text-stone-800 text-[14px]">Deliver the Score (2 min)</p>
              <p className="text-[12px] text-stone-500 mt-1">"Based on what we just walked through, you scored a [X] out of 5. Your biggest gaps are in [pillar] and [pillar]."</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg border border-emerald-200 bg-emerald-50">
            <span className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 text-sm font-black shrink-0">4</span>
            <div>
              <p className="font-bold text-stone-800 text-[14px]">Close Into the Demo (1 min)</p>
              <p className="text-[12px] text-stone-500 mt-1">"Want to see what it looks like when those gaps are filled? I can show you in 20 minutes." — The demo is now positioned as the SOLUTION to problems they just admitted to.</p>
            </div>
          </div>
        </div>
      </DocSection>

      {/* The Leave-Behind */}
      <DocSection title="The Leave-Behind">
        <Callout type="info" title="After the Call — Send the Scorecard">
          Email them a summary of their scores with the 2-3 biggest gaps highlighted. This gives them something to share with their boss/team internally. "Here's what we found in the audit — [Name] and I are going to look at solutions for [gap 1] and [gap 2] next week." Now your champion has ammo.
        </Callout>
      </DocSection>
    </div>
  );
}
