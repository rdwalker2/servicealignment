import { useState } from 'react';
import { DocHeader, DocSection, Callout } from '../../../components/process/DocComponents';
import { User, Users, Building2, Briefcase } from 'lucide-react';
import { InteractiveCallTree } from '../../../components/process/InteractiveCallTree';

// ─── Decision Tree Data ───────────────────────────────────────────

interface TreePath {
  objection: string;
  validate: string;
  reframe: string;
  microYes: string;
  close: string;
  closeType: 'meeting' | 'wave3' | 'callback';
}

interface PersonaTree {
  id: string;
  persona: string;
  subtitle: string;
  icon: React.ReactNode;
  opener: string;
  openerNote: string;
  paths: TreePath[];
}

// ─── THE UNIVERSAL CLOSE ──────────────────────────────────────────
// Same close for 3/4 paths. Reps don't think — they just arrive here.
const UNIVERSAL_CLOSE = `"Why don't I run a quick benchmark on your hiring setup — career site, process, how you compare to companies your size. Worst case you confirm everything's in great shape. Best case you find something worth fixing. Worth a look?"`;

const TREES: PersonaTree[] = [
  {
    id: 'hr-director',
    persona: 'HR Director',
    subtitle: 'Authority & Strategy',
    icon: <Users size={16} />,
    opener: `"Wanted to see if the team is dealing with any challenges in the hiring process right now — or if there are any talent goals you're trying to hit this quarter?"`,
    openerNote: 'Wave 1 — dual-track ask. Authority/strategic language matches their world.',
    paths: [
      {
        objection: `"We don't have the budget for anything right now."`,
        validate: `"Totally fair."`,
        reframe: `"So when a role opens up, you're just posting it to a board and hoping the right person applies?"`,
        microYes: `(They say yes) → "And I'd imagine some of those take longer to fill than you'd like? SHRM's latest puts the average cost-per-hire at $5,475 — and that's before the productivity lost from empty seats."`,
        close: UNIVERSAL_CLOSE,
        closeType: 'meeting',
      },
      {
        objection: `"We're good. Everything is fine right now."`,
        validate: `"Got it."`,
        reframe: `"Has there ever been a role that just took way longer to fill than it should have — or a great candidate you lost because the process moved too slow?"`,
        microYes: `(Yes — they always have one) → "Typically with teams your size, that happens because the recruiting tools weren't built for speed. They work, but they're not great."`,
        close: `"When was the last time you actually benchmarked what's out there?" → If still no, pick from the Wave 3 Arsenal.`,
        closeType: 'wave3',
      },
      {
        objection: `"We already have a system that handles that."`,
        validate: `"Got it — what are you using?" → [ADP / Workday / Paycom / etc.] → "Ok, so you're running recruiting through your HRIS."`,
        reframe: `"Have you ever felt like the recruiting module doesn't get the same love as payroll and benefits?"`,
        microYes: `(Yes/No — rhetorical, they always feel it) → "Do you ever need a second perspective on what's available — even just to make sure you're getting your money's worth?"`,
        close: UNIVERSAL_CLOSE,
        closeType: 'meeting',
      },
      {
        objection: `"I'm too busy to talk about this right now."`,
        validate: `"Understood. Hiring is one of those things that gets deprioritized until it's urgent."`,
        reframe: `"When is better?"`,
        microYes: `(Get the specific day/time — "Tuesday or Thursday next week?")`,
        close: `"Sounds good. I'll send a quick invite so it's locked in. Talk then."`,
        closeType: 'callback',
      },
    ],
  },
  {
    id: 'ta-manager',
    persona: 'TA Manager / Recruiter',
    subtitle: 'Tactical & Data-Driven',
    icon: <Briefcase size={16} />,
    opener: `"Wanted to see if you're dealing with any bottlenecks in the recruiting process — sourcing, candidate drop-off, time-to-fill — or any goals you're trying to hit this half?"`,
    openerNote: 'Wave 1 — speaks their language. TA managers think in metrics and pipeline.',
    paths: [
      {
        objection: `"We don't have the budget for anything right now."`,
        validate: `"Makes sense."`,
        reframe: `"So when req volume spikes, you're just grinding through it manually — screening in spreadsheets, chasing hiring managers over email?"`,
        microYes: `(Yes) → "And are you tracking your application completion rate? Industry average is only 10.6% — most teams are losing 90% of candidates before they even finish applying."`,
        close: UNIVERSAL_CLOSE,
        closeType: 'meeting',
      },
      {
        objection: `"We're good. Everything is fine right now."`,
        validate: `"Nice."`,
        reframe: `"Has there ever been a role where you had plenty of applicants but none of them were actually qualified — like the volume was there but the quality wasn't?"`,
        microYes: `(Yes — always) → "Typically that means the sourcing channels are producing clicks but not hires. Job boards drive 60% of applications but only 25-40% of actual hires."`,
        close: `"When was the last time you looked at which channels are actually converting?" → If still no, Wave 3 Arsenal #4 or #5.`,
        closeType: 'wave3',
      },
      {
        objection: `"We already have a system that handles that."`,
        validate: `"Got it — what are you in?" → [System] → "How long have you been on it?"`,
        reframe: `"Do you ever feel like there's stuff it should be doing that it's just… not? Or that you're working around it more than working with it?"`,
        microYes: `(Yes — they always have workarounds) → "Aptitude Research found 82% of companies report significant gaps in their Provider and only 3% actually use it fully. Do you ever check what else is out there — even just to benchmark?"`,
        close: UNIVERSAL_CLOSE,
        closeType: 'meeting',
      },
      {
        objection: `"I'm too busy to talk about this right now."`,
        validate: `"I hear that — recruiting never slows down."`,
        reframe: `"When's a better 15 minutes? Tuesday or Thursday next week?"`,
        microYes: `(Lock the specific time)`,
        close: `"Perfect. Calendar invite coming. Talk then."`,
        closeType: 'callback',
      },
    ],
  },
  {
    id: 'ceo-founder',
    persona: 'CEO / Founder',
    subtitle: 'Business Impact',
    icon: <Building2 size={16} />,
    opener: `"Wanted to see if hiring is keeping you from focusing on running the business — any open roles taking longer than expected or costing more than they should?"`,
    openerNote: 'Wave 1 — business impact language. CEOs don\'t think in HR terms.',
    paths: [
      {
        objection: `"We don't have the budget for anything right now."`,
        validate: `"Totally fair."`,
        reframe: `"How many open roles do you have right now?" → [Number] → "So you've got [X] seats sitting empty — every week those stay open, that's real revenue walking out the door."`,
        microYes: `"And I'd imagine every week those seats stay empty, there's real productivity you're not getting back?"`,
        close: UNIVERSAL_CLOSE,
        closeType: 'meeting',
      },
      {
        objection: `"We're good. We don't hire that much."`,
        validate: `"Got it."`,
        reframe: `"When you do hire though — has there ever been one that took way too long? Or a great candidate that slipped through because the process wasn't fast enough?"`,
        microYes: `(Yes — always) → "Typically with companies your size, that happens because hiring runs through tools that weren't built for it — email, spreadsheets, the HRIS."`,
        close: `"When was the last time you went through your own application process as a candidate? Most founders haven't — and they're pretty surprised." → Wave 3 Arsenal #1 or #8.`,
        closeType: 'wave3',
      },
      {
        objection: `"Someone else handles that — talk to HR / our office manager."`,
        validate: `"Got it. Who would that be?" → (Get the name and direct line)`,
        reframe: `"Before I reach out — at a high level, would you say hiring has been smooth, or has anything taken longer than you'd like?"`,
        microYes: `"Do you ever wish you had more visibility into what's happening in the pipeline without having to ask?"`,
        close: `"I'll connect with [Name]. If it makes sense on their end, would you be open to 10 minutes on the business case? I'll keep it brief. Can I mention your name?"`,
        closeType: 'meeting',
      },
      {
        objection: `"I'm too busy to talk about this right now."`,
        validate: `"Respect that — you're running a company."`,
        reframe: `"When's a better 15? Before 9 or after 5 tends to work best for founders."`,
        microYes: `(Lock the time. CEOs respect brevity.)`,
        close: `"Done. Calendar invite coming. Talk then."`,
        closeType: 'callback',
      },
    ],
  },
  {
    id: 'ops-office',
    persona: 'Ops / Office Manager',
    subtitle: 'Process & Simplicity',
    icon: <User size={16} />,
    opener: `"Wanted to see if you're dealing with any frustrations managing the hiring process — posting jobs, tracking candidates, scheduling interviews — or anything you're trying to make smoother?"`,
    openerNote: 'Wave 1 — process and simplicity language. Ops people hate inefficiency.',
    paths: [
      {
        objection: `"We don't have the budget for anything right now."`,
        validate: `"Understood."`,
        reframe: `"So when a role opens up, you're managing it yourself — posting to boards one by one, tracking candidates in spreadsheets or email?"`,
        microYes: `(They answer) → "And I'd imagine that takes up more of your time than it probably should — on top of everything else you're managing?"`,
        close: UNIVERSAL_CLOSE,
        closeType: 'meeting',
      },
      {
        objection: `"We're good. Everything is fine right now."`,
        validate: `"Nice."`,
        reframe: `"Has there ever been a role where you were just drowning in applications and couldn't keep track — or the opposite, you posted and heard crickets?"`,
        microYes: `(Yes — always one or the other) → "That's usually a sign the process is working around the tool instead of with it."`,
        close: `"When was the last time you pulled up your career page on your phone and tried to apply? 67% of candidates do it on mobile now." → Wave 3 Arsenal #3 or #1.`,
        closeType: 'wave3',
      },
      {
        objection: `"We already have something that handles that."`,
        validate: `"Got it — what are you using?" → [System]`,
        reframe: `"Does it ever feel like it wasn't really built for recruiting? Like it works, but it's held together with workarounds?"`,
        microYes: `(Yes — always) → "Do you ever check what else is out there — even just to make sure you're not overpaying for features you're not using?"`,
        close: UNIVERSAL_CLOSE,
        closeType: 'meeting',
      },
      {
        objection: `"I'm too busy to talk about this right now."`,
        validate: `"I hear you — lot of hats."`,
        reframe: `"When's a better time? Even 15 minutes works."`,
        microYes: `(Lock the time)`,
        close: `"I'll send an invite right now. Talk then."`,
        closeType: 'callback',
      },
    ],
  },
];

// ─── Main Component ───────────────────────────────────────────────

export default function CallDecisionTrees() {
  const [activeTree, setActiveTree] = useState(0);
  const tree = TREES[activeTree];

  return (
    <div className="p-10 max-w-5xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader
        stage="QUICK REFERENCE"
        title="Call Decision Trees"
        subtitle="One-page call maps for each persona. Open during the call — know exactly what to say when they respond."
      />

      {/* Persona Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {TREES.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setActiveTree(i)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${
              activeTree === i
                ? 'bg-stone-900 text-white shadow-md'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700'
            }`}
          >
            {t.icon}
            {t.persona}
          </button>
        ))}
      </div>

      {/* Active Tree - Now using the Interactive Component */}
      <div className="mt-8 mb-12">
        <InteractiveCallTree tree={tree} />
      </div>

      {/* Strategy Decoder */}
      <DocSection title="The Strategy Behind Every Step">
        <p className="text-[13px] text-stone-500 mb-4">These trees aren't random — every step uses a specific technique from the training framework, adapted for Provider sales.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="border-l-[3px] border-emerald-400 pl-4 py-3">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">❷ Validate</p>
            <p className="text-[12px] text-stone-600 mt-1">Never argue. Absorb the objection, say "Totally fair" or "Got it" — then redirect. People who feel heard keep talking.</p>
          </div>
          <div className="border-l-[3px] border-amber-400 pl-4 py-3">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">❸ Reframe</p>
            <p className="text-[12px] text-stone-600 mt-1">Turn their "no" into evidence of the problem. "No budget" becomes "so you're just being reactive?" — which sounds risky. Their objection IS your case.</p>
          </div>
          <div className="border-l-[3px] border-sky-400 pl-4 py-3">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">❹ Micro-Yes</p>
            <p className="text-[12px] text-stone-600 mt-1">Rhetorical questions where the only answer is "yes." Each yes builds momentum. By the time you ask for the meeting, they've already agreed 2-3 times.</p>
          </div>
          <div className="border-l-[3px] border-violet-400 pl-4 py-3">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">Inevitability Play</p>
            <p className="text-[12px] text-stone-600 mt-1">"Has there EVER been a role that took too long?" — the answer is always yes. You're not asking about now. You're proving the problem is inevitable. Then you position for it.</p>
          </div>
          <div className="border-l-[3px] border-[#FF2A7F] pl-4 py-3">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">Second Option, Not Replacement</p>
            <p className="text-[12px] text-stone-600 mt-1">"Do you ever need a second perspective?" — low threat. You're not taking anything away. You're the benchmark, the backup, the smart thing to have in their pocket.</p>
          </div>
          <div className="border-l-[3px] border-stone-300 pl-4 py-3">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">One Universal Close</p>
            <p className="text-[12px] text-stone-600 mt-1">3 of 4 paths end with the same sentence. Reps don't think about how to close — they just arrive at the same destination. "Quick benchmark... worst case / best case... worth a look?"</p>
          </div>
        </div>
      </DocSection>

      {/* Anticipation Callout */}
      <Callout type="rule" title="The #1 Rule: Anticipate, Don't React">
        You already know they're going to say one of these 4 things. There are no surprises. Sound like you've heard it a thousand times — because you have. The moment you sound surprised or confused, you lose the trusted advisor position.
      </Callout>
    </div>
  );
}
