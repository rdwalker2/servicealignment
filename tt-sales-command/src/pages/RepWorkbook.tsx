import { useState, useEffect, useRef } from 'react';
import { BookOpen, ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, Clock, Users, DollarSign, ShieldX, Puzzle, Target, Zap, TrendingUp, Star, Copy, Check } from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────── */
interface TOCEntry { id: string; label: string; icon: React.ReactNode }
const TOC_SECTIONS: TOCEntry[] = [
  { id: 'buyer-intent', label: 'Buyer\'s Intent',     icon: <Target size={13} /> },
  { id: 'five-fatalities', label: 'Five Fatalities',  icon: <AlertTriangle size={13} /> },
  { id: 'three-checkpoints', label: 'Three Checkpoints', icon: <CheckCircle2 size={13} /> },
  { id: 'doctor-vs-date', label: 'Doctor vs. Date',   icon: <Star size={13} /> },
  { id: 'funnel-math', label: 'Funnel Math',          icon: <TrendingUp size={13} /> },
];

/* ─── CopyButton ─────────────────────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
  return (
    <button onClick={copy} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-all">
      {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

/* ─── FatalityCard ───────────────────────────────────────────── */
const FATALITY_CONFIG = [
  {
    id: 'timing',
    icon: Clock,
    label: 'Timing',
    color: { card: 'border-slate-200 bg-slate-50/60', badge: 'bg-slate-100 text-slate-700', icon: 'text-slate-500', accent: 'bg-slate-500' },
    theySay: '"We\'ll revisit this next quarter" / "Too much going on right now"',
    whyItHappens: 'No urgency was established. The pain wasn\'t real enough — or they don\'t believe the pain is costing them.',
    prevent: 'Quantify the cost of waiting: "What does every week without fixing this cost you in recruiter hours / lost candidates / unfilled roles?"',
    question: 'What happens to your business if this hiring problem continues for another 6 months?',
  },
  {
    id: 'competition',
    icon: Users,
    label: 'Competition',
    color: { card: 'border-amber-200 bg-amber-50/50', badge: 'bg-amber-100 text-amber-700', icon: 'text-amber-600', accent: 'bg-amber-500' },
    theySay: '"We went with [Competitor]" / "We\'re going to stay with what we have" / "Our IT team can build something"',
    whyItHappens: 'You didn\'t differentiate strongly enough, or they were always just shopping for a benchmark.',
    prevent: 'Ask early: "Are you evaluating us alongside other tools, or is this more exploratory?" Surface the competitive landscape before the final round.',
    question: 'What would your current system need to do better for you to stay with it another year?',
  },
  {
    id: 'price',
    icon: DollarSign,
    label: 'Price',
    color: { card: 'border-rose-200 bg-rose-50/50', badge: 'bg-rose-100 text-rose-700', icon: 'text-rose-600', accent: 'bg-rose-500' },
    theySay: '"It\'s over budget" / "The ROI isn\'t there" / "We love it but can\'t justify the cost"',
    whyItHappens: 'Value was never quantified. They saw a big number with no frame of reference for what it prevents or generates.',
    prevent: 'Build the ROI case before the proposal: "If we reduce your time-to-hire by 30%, what does that save you per quarter in recruiter costs + lost productivity?"',
    question: 'If you knew this would cut your time-to-hire in half — what would that be worth to you?',
  },
  {
    id: 'trust',
    icon: ShieldX,
    label: 'Trust',
    color: { card: 'border-violet-200 bg-violet-50/50', badge: 'bg-violet-100 text-violet-700', icon: 'text-violet-600', accent: 'bg-violet-500' },
    theySay: '"We\'re not confident you can handle our scale" / Went dark after demo / "We need more references"',
    whyItHappens: 'They didn\'t feel heard, doubted a claim, or a key stakeholder wasn\'t won over.',
    prevent: 'Share proof early — case studies, references from companies their size. Follow through on every small commitment (send the info when you said you would).',
    question: 'What would need to be true about Teamtailor for you to feel 100% confident recommending it to your leadership?',
  },
  {
    id: 'product-fit',
    icon: Puzzle,
    label: 'Product Fit',
    color: { card: 'border-emerald-200 bg-emerald-50/50', badge: 'bg-emerald-100 text-emerald-700', icon: 'text-emerald-600', accent: 'bg-emerald-500' },
    theySay: '"It doesn\'t integrate with X" / "We need [specific feature] and you can\'t do it" / "Not quite the right fit"',
    whyItHappens: 'Discovery wasn\'t deep enough. Either a real gap exists, or they\'re fixated on a feature that isn\'t actually critical.',
    prevent: 'Diagnose requirements before you pitch. If there\'s a real gap, name it early and discuss workarounds — don\'t hope they won\'t notice.',
    question: 'What are the 2-3 things your ATS absolutely must do — non-negotiable, deal-killers if they\'re missing?',
  },
];

function FatalityCard({ fatality }: { fatality: typeof FATALITY_CONFIG[0] }) {
  const [open, setOpen] = useState(false);
  const Icon = fatality.icon;
  const c = fatality.color;

  return (
    <div className={`rounded-2xl border-2 ${c.card} overflow-hidden shadow-sm`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-6 py-5 flex items-center gap-4 hover:bg-black/3 transition-colors text-left"
      >
        <div className={`w-3 h-8 rounded-full ${c.accent} shrink-0`} />
        <Icon size={22} className={c.icon} />
        <div className="flex-1">
          <p className="text-[16px] font-black text-stone-900">Fatality #{FATALITY_CONFIG.indexOf(fatality) + 1}: {fatality.label}</p>
          <p className="text-[12px] text-stone-500 italic mt-0.5">{fatality.theySay.split('/')[0].trim()}...</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${c.badge}`}>{fatality.label}</span>
        {open ? <ChevronDown size={16} className="text-stone-400 shrink-0" /> : <ChevronRight size={16} className="text-stone-400 shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-stone-100 divide-y divide-stone-100">
          <div className="px-6 py-4">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">They say</p>
            <p className="text-[13px] text-stone-700 italic">{fatality.theySay}</p>
          </div>
          <div className="px-6 py-4">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Why it happens</p>
            <p className="text-[13px] text-stone-600 leading-relaxed">{fatality.whyItHappens}</p>
          </div>
          <div className="px-6 py-4">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Prevention</p>
            <p className="text-[13px] text-stone-700 leading-relaxed font-medium">{fatality.prevent}</p>
          </div>
          <div className="px-6 py-4 bg-stone-50">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Power question to defuse this</p>
            <div className="flex items-start justify-between gap-3">
              <p className="text-[13px] text-stone-800 leading-relaxed italic font-semibold flex-1">"{fatality.question}"</p>
              <CopyButton text={fatality.question} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── CheckpointCard ─────────────────────────────────────────── */
const CHECKPOINTS = [
  {
    number: 1,
    gate: 'Need & Urgency',
    question: 'Do they need to take action on this problem NOW?',
    why: 'Addresses the Timing fatality. If they don\'t acknowledge urgency, the deal will always drift to "next quarter." You need them to say the cost of inaction out loud.',
    howToTest: 'Ask: "What happens if this doesn\'t get fixed in the next 90 days?" If the answer is shrugs, you haven\'t established urgency yet.',
    passSignal: '"We really need to fix this before Q3 hiring season" / "We can\'t keep losing candidates to this process"',
    failSignal: '"It\'s something we\'d like to improve eventually" / "Not urgent, just exploring"',
    questions: [
      'What\'s the cost of this problem continuing for another 6 months?',
      'Is this on your quarterly roadmap, or is it more of a nice-to-have?',
      'What\'s the single biggest recruiting problem you HAVE to solve this year?',
    ],
    color: { bg: 'from-blue-500 to-blue-700', ring: 'ring-blue-200', badge: 'bg-blue-100 text-blue-700', pass: 'bg-emerald-50 border-emerald-200', fail: 'bg-rose-50 border-rose-200' },
  },
  {
    number: 2,
    gate: 'External Solution Needed',
    question: 'Do they agree they need outside help (i.e., they can\'t solve this internally)?',
    why: 'Addresses the Competition (status quo) fatality. Even urgency means nothing if they think their team can build it or their existing system can be configured.',
    howToTest: 'Ask: "What have you tried so far? Why hasn\'t that worked?" You want them to articulate why the internal option isn\'t enough.',
    passSignal: '"We need something purpose-built for this, our current setup can\'t do it" / "We\'re actively evaluating vendors"',
    failSignal: '"We might just train our team on what we have" / "IT says they can probably build something"',
    questions: [
      'Why hasn\'t your current system solved this yet — what\'s holding it back?',
      'Could your team handle this if you just allocated more time to it?',
      'What\'s your current ATS missing that made you want to explore alternatives?',
    ],
    color: { bg: 'from-amber-500 to-orange-600', ring: 'ring-amber-200', badge: 'bg-amber-100 text-amber-700', pass: 'bg-emerald-50 border-emerald-200', fail: 'bg-rose-50 border-rose-200' },
  },
  {
    number: 3,
    gate: 'Best-Fit Solution',
    question: 'Do they believe Teamtailor is the best option for them?',
    why: 'Addresses Product Fit, Price, and Trust fatalities simultaneously. You need to earn this — not just present features, but show how TT specifically solves their specific problem better than alternatives.',
    howToTest: 'Ask: "Based on what you\'ve seen — does this feel like it addresses what you described in our first call?" Listen for enthusiasm vs. hesitation.',
    passSignal: '"This makes a lot of sense for us" / Starts asking implementation questions ("How would onboarding work?")',
    failSignal: 'Goes quiet after the demo / "We need to think about it" without a clear next step',
    questions: [
      'What would need to be true about Teamtailor for you to feel confident recommending it to your team?',
      'Is there anything from what you\'ve seen that gives you pause or doesn\'t quite fit?',
      'If price were the same across all vendors — what would be your #1 reason to choose us?',
    ],
    color: { bg: 'from-violet-500 to-purple-700', ring: 'ring-violet-200', badge: 'bg-violet-100 text-violet-700', pass: 'bg-emerald-50 border-emerald-200', fail: 'bg-rose-50 border-rose-200' },
  },
];

function CheckpointCard({ cp }: { cp: typeof CHECKPOINTS[0] }) {
  const [open, setOpen] = useState(false);
  const c = cp.color;

  return (
    <div className={`rounded-2xl border bg-white ring-2 ${c.ring} overflow-hidden shadow-sm`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-6 py-5 flex items-start gap-4 hover:bg-stone-50/50 transition-colors text-left"
      >
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.bg} flex items-center justify-center text-white text-[18px] font-black shadow-md shrink-0`}>
          {cp.number}
        </div>
        <div className="flex-1">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${c.badge} mb-2 inline-block`}>
            Checkpoint {cp.number}
          </span>
          <p className="text-[15px] font-black text-stone-900">{cp.gate}</p>
          <p className="text-[12px] text-stone-500 mt-1 italic">"{cp.question}"</p>
        </div>
        {open ? <ChevronDown size={16} className="text-stone-400 mt-1 shrink-0" /> : <ChevronRight size={16} className="text-stone-400 mt-1 shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-stone-100 divide-y divide-stone-100">
          <div className="px-6 py-4">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Why this gate exists</p>
            <p className="text-[13px] text-stone-600 leading-relaxed">{cp.why}</p>
          </div>
          <div className="px-6 py-4">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">How to test it</p>
            <p className="text-[13px] text-stone-700 font-medium leading-relaxed">{cp.howToTest}</p>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className={`rounded-xl border p-3 ${c.pass}`}>
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1.5">✅ Pass signal</p>
                <p className="text-[12px] text-stone-700 italic">{cp.passSignal}</p>
              </div>
              <div className={`rounded-xl border p-3 ${c.fail}`}>
                <p className="text-[10px] font-bold text-rose-700 uppercase tracking-widest mb-1.5">🚩 Fail signal</p>
                <p className="text-[12px] text-stone-700 italic">{cp.failSignal}</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-stone-50">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3">Questions to confirm this checkpoint</p>
            <div className="space-y-2">
              {cp.questions.map(q => (
                <div key={q} className="flex items-start justify-between gap-3 bg-white rounded-lg border border-stone-200 px-4 py-3">
                  <p className="text-[12px] text-stone-700 italic flex-1">"{q}"</p>
                  <CopyButton text={q} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function RepWorkbook() {
  const [activeToc, setActiveToc] = useState('buyer-intent');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const handler = () => {
      const ids = TOC_SECTIONS.map(s => s.id);
      for (const id of [...ids].reverse()) {
        const sec = document.getElementById(id);
        if (sec && sec.getBoundingClientRect().top <= 120) { setActiveToc(id); break; }
      }
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="relative flex h-full bg-stone-50">
      <div ref={contentRef} className="flex-1 overflow-y-auto">

        {/* ── HERO ── */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #6366f1 0%, transparent 50%), radial-gradient(circle at 20% 70%, #a855f7 0%, transparent 40%)' }} />
          <div className="relative px-10 py-12 max-w-4xl">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">Enablement</span>
              <span className="text-slate-600">›</span>
              <span className="text-[11px] text-slate-300 font-semibold">Rep Workbook</span>
            </div>
            <div className="flex items-start gap-5 mb-7">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shrink-0">
                <BookOpen size={26} className="text-white" />
              </div>
              <div>
                <h1 className="text-[30px] font-black text-white tracking-tight leading-none">Rep Workbook</h1>
                <p className="text-[14px] text-slate-400 mt-2 max-w-xl leading-relaxed">
                  The sales methodology behind every great call. Buyer's intent, the Five Fatalities, the Three Checkpoints — the mental models that separate reps who grind from reps who close.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { v: '5', l: 'reasons deals die', c: 'bg-rose-500/20 border-rose-500/30 text-rose-300' },
                { v: '3', l: 'checkpoints every deal must pass', c: 'bg-violet-500/20 border-violet-500/30 text-violet-300' },
                { v: '88%', l: 'of buyers only buy from trusted advisors', c: 'bg-blue-500/20 border-blue-500/30 text-blue-300' },
                { v: '70%', l: 'of buyers prefer not to talk to reps', c: 'bg-amber-500/20 border-amber-500/30 text-amber-300' },
              ].map(s => (
                <div key={s.v} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[12px] font-semibold ${s.c}`}>
                  <span className="text-[18px] font-black">{s.v}</span>
                  <span className="opacity-80">{s.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="px-10 py-10 max-w-4xl space-y-14">

          {/* ── BUYER INTENT ── */}
          <section id="buyer-intent">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <Target size={16} className="text-white" />
              </div>
              <h2 className="text-[20px] font-black text-stone-900">Buyer's Intent</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-4">What buyers are NOT looking for</p>
                {[
                  'A product pitch about features',
                  'A sales rep trying to hit their number',
                  'A 45-minute demo of everything you can do',
                  'Someone who talks more than they listen',
                ].map(s => (
                  <div key={s} className="flex items-start gap-2 mb-2">
                    <span className="text-rose-400 text-[14px] shrink-0 font-black">✕</span>
                    <p className="text-[12px] text-stone-600">{s}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm">
                <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-4">What buyers ARE looking for</p>
                {[
                  'Someone who understands their specific problem',
                  'A trusted advisor — not a salesperson',
                  'Proof that you\'ve solved this for others like them',
                  'Help making a good decision (not being sold)',
                ].map(s => (
                  <div key={s} className="flex items-start gap-2 mb-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-stone-700">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">The Core Principle</p>
              <p className="text-[16px] font-black leading-relaxed text-white mb-3">
                Prospects spend time with salespeople ONLY because they believe it will help them solve a pressing problem. They are not looking to buy a product — they are looking to eliminate a pain.
              </p>
              <p className="text-[13px] text-slate-300 leading-relaxed">
                The rep who wins isn't the most persistent or the most charming. It's the one who best demonstrates they understand the prospect's world and can actually fix what's broken.
              </p>
            </div>
          </section>

          {/* ── FIVE FATALITIES ── */}
          <section id="five-fatalities">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center">
                <AlertTriangle size={16} className="text-white" />
              </div>
              <h2 className="text-[20px] font-black text-stone-900">The Five Fatalities</h2>
            </div>
            <p className="text-[13px] text-stone-500 mb-6 leading-relaxed">
              Every lost deal traces back to one of five root causes. If you can recognize which fatality is threatening a deal, you can counter it before it kills the opportunity.
            </p>

            <div className="space-y-4">
              {FATALITY_CONFIG.map(f => <FatalityCard key={f.id} fatality={f} />)}
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={16} className="text-amber-600" />
                <p className="text-[13px] font-bold text-amber-800">The Pre-Mortem Practice</p>
              </div>
              <p className="text-[12px] text-amber-700 leading-relaxed">
                Before every proposal goes out, run through the Five Fatalities like a checklist: <strong>Have I confirmed urgency? Have I addressed why they can't just stick with the status quo? Have I built an ROI case? Have I earned their trust? Have I shown this solves their specific requirements?</strong> If any answer is "no" — that's where you'll lose the deal.
              </p>
            </div>
          </section>

          {/* ── THREE CHECKPOINTS ── */}
          <section id="three-checkpoints">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
                <CheckCircle2 size={16} className="text-white" />
              </div>
              <h2 className="text-[20px] font-black text-stone-900">The Three Checkpoints</h2>
            </div>
            <p className="text-[13px] text-stone-500 mb-6 leading-relaxed">
              Think of these as qualifying gates. A deal should NOT advance to proposal until it has cleared all three. Skipping a checkpoint doesn't speed things up — it creates zombie deals that consume time and never close.
            </p>

            <div className="space-y-4">
              {CHECKPOINTS.map(cp => <CheckpointCard key={cp.number} cp={cp} />)}
            </div>

            <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-[12px] font-bold text-stone-700 uppercase tracking-widest mb-4">Checkpoint Status — Quick Self-Check for Live Deals</p>
              <div className="grid grid-cols-3 gap-3">
                {['Urgency confirmed (they said it out loud)', 'They agree they need external help', 'They believe TT is the best fit'].map((item, i) => (
                  <div key={i} className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 text-white text-[14px] font-black flex items-center justify-center mx-auto mb-3 shadow-md">{i + 1}</div>
                    <p className="text-[12px] text-stone-600 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl">
                <p className="text-[12px] text-rose-800 font-semibold">
                  <strong>Disqualify early.</strong> A deal that hasn't passed Checkpoint 1 or 2 is not a pipeline deal — it's a wish. Marking it as such isn't pessimism, it's professionalism. Move on and find a real one.
                </p>
              </div>
            </div>
          </section>

          {/* ── DOCTOR VS DATE ── */}
          <section id="doctor-vs-date">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center">
                <Star size={16} className="text-white" />
              </div>
              <h2 className="text-[20px] font-black text-stone-900">The Doctor vs. Date Mindset</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/40 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">💔</span>
                  <p className="text-[15px] font-black text-rose-800">The "Date" Approach</p>
                </div>
                <div className="space-y-3">
                  {[
                    'Tries to be liked — charm over substance',
                    'Talks more than they listen',
                    'Pitches features hoping something sticks',
                    'Avoids hard questions to keep things pleasant',
                    'Pushes for a close at the first sign of interest',
                  ].map(s => (
                    <div key={s} className="flex items-start gap-2">
                      <span className="text-rose-400 font-black text-[14px] shrink-0">✕</span>
                      <p className="text-[12px] text-stone-700">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🩺</span>
                  <p className="text-[15px] font-black text-emerald-800">The "Doctor" Approach</p>
                </div>
                <div className="space-y-3">
                  {[
                    'Earns trust by diagnosing before prescribing',
                    'Asks hard questions because that\'s their job',
                    'Recommends only what actually fits the patient',
                    'Will tell you if it\'s not a fit — that builds trust',
                    'Moves at the patient\'s pace, not their own',
                  ].map(s => (
                    <div key={s} className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-[12px] text-stone-700">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
              <p className="text-[14px] font-black text-white mb-3">In Practice: What Would a Doctor Do?</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { when: 'First call opener', doc: '"What\'s the main recruiting problem you\'re trying to solve this quarter?"', date: '"Let me tell you about all the great things Teamtailor can do..."' },
                  { when: 'If they seem uninterested', doc: '"Is recruiting even a top priority for your team right now?"', date: 'Pitch harder, find a feature that might excite them' },
                ].map(e => (
                  <div key={e.when} className="rounded-xl bg-white/10 p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{e.when}</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-[10px] text-emerald-400 font-bold mb-1">🩺 DOCTOR</p>
                        <p className="text-[12px] text-slate-200 italic">"{e.doc}"</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-rose-400 font-bold mb-1">💔 DATE</p>
                        <p className="text-[12px] text-slate-400 italic">"{e.date}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FUNNEL MATH ── */}
          <section id="funnel-math">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center">
                <TrendingUp size={16} className="text-white" />
              </div>
              <h2 className="text-[20px] font-black text-stone-900">The Funnel Math — Where Your Number Comes From</h2>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-100 bg-stone-50">
                <p className="text-[12px] font-bold text-stone-600">Q3 Target: $15,000/month · 3 deals · $5K avg deal</p>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {[
                    { metric: '48 Conversations/month',    detail: '12/week. A "conversation" = 2+ min with the right person where you explored pain.', rate: '', color: 'bg-blue-500' },
                    { metric: '× 33% scheduling rate',     detail: '= 16 meetings set. Nicolas runs 34.9%. Your team avg is 28%. This is the Three Waves gap.', rate: '16 set', color: 'bg-indigo-500' },
                    { metric: '× 80% show rate',           detail: '= 13 meetings held. Your team is at 50%. The accept-on-phone technique is the fix.', rate: '13 held', color: 'bg-violet-500' },
                    { metric: '× 75% demo-to-proposal',    detail: '= 10 proposals sent. You\'re already here — no changes needed.', rate: '10 proposals', color: 'bg-purple-500' },
                    { metric: '× 30% close rate',          detail: '= 3 deals won. Tyler is at 29% — proof it\'s achievable. BAP scorecard drives this.', rate: '3 deals', color: 'bg-[#FF2A7F]' },
                    { metric: '× $5,000 avg deal',         detail: '= $15,000/month. The goal. The math works if the inputs work.', rate: '$15,000', color: 'bg-emerald-600' },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-2 h-10 rounded-full ${row.color} shrink-0`} />
                      <div className="flex-1">
                        <p className="text-[13px] font-bold text-stone-900">{row.metric}</p>
                        <p className="text-[11px] text-stone-500">{row.detail}</p>
                      </div>
                      {row.rate && (
                        <div className="text-right shrink-0">
                          <span className="text-[14px] font-black text-stone-800">{row.rate}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-6 py-4 bg-gradient-to-r from-[#FF2A7F]/10 to-rose-50 border-t border-rose-100">
                <p className="text-[12px] text-stone-600 leading-relaxed">
                  <strong className="text-stone-900">The bottom line:</strong> We're not asking you to become superhuman. Fix two numbers — your <strong>show rate</strong> (50% → 80%) and your <strong>scheduling consistency</strong> (28% → 33%). If those two move, the revenue follows automatically.
                </p>
              </div>
            </div>
          </section>

          <div className="h-20" />
        </div>
      </div>

      {/* ── Sticky TOC ── */}
      <div className="hidden xl:block w-52 shrink-0 py-10 pr-6">
        <div className="sticky top-10 space-y-1">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 px-2">On this page</p>
          {TOC_SECTIONS.map(s => (
            <button key={s.id} onClick={() => scrollTo(s.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] transition-all text-left ${
                activeToc === s.id ? 'bg-[#FF2A7F]/8 text-[#FF2A7F] font-semibold' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100 font-medium'
              }`}>
              <span className={activeToc === s.id ? 'text-[#FF2A7F]' : 'text-stone-400'}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
