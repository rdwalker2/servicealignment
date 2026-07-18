import { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2, AlertCircle, Calculator, Crosshair, MessageSquare,
  AlertTriangle, Copy, Check, ChevronDown, ChevronUp, TrendingUp,
  DollarSign, Zap, Target
} from 'lucide-react';
import { BATTLECARDS } from '../data/battlecards';

// ── Helpers ──────────────────────────────────────────────────────────────────

function winRateConfig(rate: number) {
  if (rate >= 80) return {
    threat: 'Low Threat',
    threatClass: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
    ring: 'from-emerald-400 to-emerald-600',
    label: 'emerald',
  };
  if (rate >= 65) return {
    threat: 'Medium Threat',
    threatClass: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
    ring: 'from-amber-400 to-amber-600',
    label: 'amber',
  };
  return {
    threat: 'High Threat',
    threatClass: 'bg-rose-500/10 text-rose-600 border border-rose-500/20',
    ring: 'from-rose-400 to-rose-600',
    label: 'rose',
  };
}

// ── Copy Button ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy script"
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
        copied
          ? 'bg-emerald-500 text-white'
          : 'bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-800'
      }`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

// ── Win Rate Ring ─────────────────────────────────────────────────────────────

function WinRateRing({ rate, config }: { rate: number; config: ReturnType<typeof winRateConfig> }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const filled = circ * (rate / 100);

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 96 96">
        {/* Track */}
        <circle cx={48} cy={48} r={r} fill="none" strokeWidth={7} stroke="rgba(255,255,255,0.12)" />
        {/* Progress */}
        <circle
          cx={48} cy={48} r={r}
          fill="none"
          strokeWidth={7}
          stroke="white"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeDashoffset={0}
          style={{ opacity: 0.9 }}
        />
      </svg>
      <div className="relative text-center z-10">
        <div className="text-2xl font-black text-white leading-none">{rate}%</div>
        <div className="text-[9px] font-bold text-white/60 uppercase tracking-wide mt-0.5">Win Rate</div>
      </div>
    </div>
  );
}

// ── Trap Question Card ────────────────────────────────────────────────────────

function TrapCard({ question, painHighlighted }: { question: string; painHighlighted: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 shadow-lg border border-white/5 hover:border-indigo-500/30 transition-all duration-300">
      {/* Subtle grid texture overlay */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <div className="relative p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/20">
            <Target size={14} className="text-indigo-300" />
          </div>
          <p className="text-white font-semibold leading-snug text-[15px]">"{question}"</p>
        </div>

        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1.5 text-indigo-300/80 text-[11px] font-semibold uppercase tracking-wider hover:text-indigo-200 transition-colors"
        >
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          Why this works
        </button>

        {open && (
          <div className="mt-3 bg-white/5 border border-white/10 rounded-xl p-4 text-indigo-100/80 text-sm leading-relaxed">
            <span className="font-semibold text-amber-300">The Trap: </span>
            {painHighlighted}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Differentiator Row ────────────────────────────────────────────────────────

function DiffRow({ index, claim, proof, ttFeature }: { index: number; claim: string; proof: string; ttFeature: string }) {
  return (
    <div className="group flex gap-5 py-5 border-b border-stone-100 last:border-0 hover:bg-stone-50/50 px-1 -mx-1 rounded-lg transition-all duration-200">
      {/* Index */}
      <div className="shrink-0 pt-0.5">
        <span className="w-7 h-7 rounded-lg bg-stone-100 group-hover:bg-stone-200 flex items-center justify-center text-[11px] font-black text-stone-500 tabular-nums transition-colors">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <h4 className="font-bold text-stone-900 text-[14px]">{claim}</h4>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF2A7F]/8 text-[#FF2A7F] text-[10px] font-bold border border-[#FF2A7F]/15">
            <Zap size={9} /> {ttFeature}
          </span>
        </div>
        <p className="text-stone-600 text-[13px] leading-relaxed">{proof}</p>
      </div>
    </div>
  );
}

// ── Sticky Section TOC ────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'know',  label: 'Know',  sub: 'Differentiation' },
  { id: 'say',   label: 'Say',   sub: 'Objections' },
  { id: 'show',  label: 'Show',  sub: 'Diagnostics' },
];

function StickyTOC({ activeSection }: { activeSection: string }) {
  return (
    <div className="hidden xl:flex flex-col gap-1 sticky top-6 w-36 shrink-0">
      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2 px-2">On this page</p>
      {SECTIONS.map(s => (
        <a
          key={s.id}
          href={`#section-${s.id}`}
          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] font-semibold transition-all group ${
            activeSection === s.id
              ? 'text-stone-900 bg-stone-100'
              : 'text-stone-400 hover:text-stone-700 hover:bg-stone-50'
          }`}
        >
          <span className={`w-1 h-1 rounded-full shrink-0 transition-colors ${
            activeSection === s.id ? 'bg-[#FF2A7F]' : 'bg-stone-300 group-hover:bg-stone-500'
          }`} />
          <span>{s.label}</span>
          <span className="text-[10px] font-normal text-stone-400 hidden xl:block">— {s.sub}</span>
        </a>
      ))}
    </div>
  );
}

// ── Main Battlecards Component ────────────────────────────────────────────────

export default function Battlecards({ activeBattlecardId }: { activeBattlecardId: string }) {
  const activeBattlecard = BATTLECARDS.find(bc => bc.id === activeBattlecardId) || BATTLECARDS[0];
  const [activeSection, setActiveSection] = useState('know');
  const contentRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for sticky TOC
  useEffect(() => {
    const sections = ['know', 'say', 'show'];
    const observers: IntersectionObserver[] = [];

    sections.forEach(id => {
      const el = document.getElementById(`section-${id}`);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, [activeBattlecardId]);

  if (!activeBattlecard) return null;

  const cfg = winRateConfig(activeBattlecard.winRate);

  return (
    <div ref={contentRef} className="h-full overflow-y-auto scroll-smooth">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#FF2A7F]/10 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative max-w-5xl mx-auto px-8 py-10">
          <div className="flex items-start gap-8">
            {/* Left: logo + name */}
            <div className="flex-1 min-w-0">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-white/40 text-[11px] font-medium mb-5">
                <span>Enablement</span>
                <span>/</span>
                <span>Battlecards</span>
                <span>/</span>
                <span className="text-white/70">{activeBattlecard.competitorName}</span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                {/* Competitor logo badge */}
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-xl font-black text-white shadow-lg backdrop-blur-sm shrink-0">
                  {activeBattlecard.logoText}
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white leading-tight tracking-tight">
                    Winning Against<br />
                    <span className="text-[#FF2A7F]">{activeBattlecard.competitorName}</span>
                  </h1>
                </div>
              </div>

              {/* Badges row */}
              <div className="flex items-center gap-2 flex-wrap mt-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${cfg.threatClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
                  {cfg.threat}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-white/8 text-white/60 border border-white/10">
                  <DollarSign size={11} />
                  Pricing Intel Available
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-white/8 text-white/60 border border-white/10">
                  <MessageSquare size={11} />
                  {activeBattlecard.objections.length} Objection Scripts
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-white/8 text-white/60 border border-white/10">
                  <Target size={11} />
                  {activeBattlecard.trapQuestions.length} Trap Questions
                </span>
              </div>
            </div>

            {/* Right: Win Rate ring */}
            <div className="shrink-0 flex flex-col items-center gap-3">
              <WinRateRing rate={activeBattlecard.winRate} config={cfg} />
              <div className="text-[10px] text-white/40 font-medium text-center uppercase tracking-wider">
                Gong Intelligence
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY — 2-col: content + sticky TOC ── */}
      <div className="max-w-5xl mx-auto px-8 py-8 flex gap-10">

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-12">

          {/* ════════════════════════════════════════════════════════
              SECTION 1 — KNOW (Differentiation)
          ════════════════════════════════════════════════════════ */}
          <section id="section-know" className="scroll-mt-6">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                <Crosshair size={16} className="text-indigo-500" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Section 1</div>
                <h2 className="text-xl font-black text-stone-900 leading-none">Know — Differentiation</h2>
              </div>
            </div>

            {/* Win / Lose */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* When We Win */}
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                  <h3 className="text-[11px] font-black text-emerald-800 uppercase tracking-widest">When We Win</h3>
                </div>
                <ul className="space-y-2.5">
                  {activeBattlecard.whenWeWin.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13px] text-emerald-900 leading-snug">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* When We Lose */}
              <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={15} className="text-rose-500 shrink-0" />
                  <h3 className="text-[11px] font-black text-rose-800 uppercase tracking-widest">When We Lose</h3>
                </div>
                <ul className="space-y-2.5">
                  {activeBattlecard.whenWeLose.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13px] text-rose-900 leading-snug">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Their Strengths */}
            {activeBattlecard.competitorStrengths?.length > 0 && (
              <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/50 to-white p-5 mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={15} className="text-amber-500 shrink-0" />
                  <h3 className="text-[11px] font-black text-amber-800 uppercase tracking-widest">Their Strengths — Know These Cold</h3>
                </div>
                <ul className="space-y-2">
                  {activeBattlecard.competitorStrengths.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13px] text-amber-900 leading-snug">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Differentiators */}
            <div className="rounded-2xl border border-stone-200/60 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex items-center gap-2">
                <TrendingUp size={14} className="text-stone-500" />
                <h3 className="text-[12px] font-black text-stone-700 uppercase tracking-widest">
                  Our Differentiators vs {activeBattlecard.competitorName}
                </h3>
              </div>
              <div className="px-6 py-2 divide-y divide-stone-50">
                {activeBattlecard.ourDifferentiators.map((diff, i) => (
                  <DiffRow
                    key={i}
                    index={i}
                    claim={diff.claim}
                    proof={diff.proof}
                    ttFeature={(diff as any).ttFeature || ''}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════
              SECTION 2 — SAY (Objection Handling)
          ════════════════════════════════════════════════════════ */}
          <section id="section-say" className="scroll-mt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                <MessageSquare size={16} className="text-violet-500" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Section 2</div>
                <h2 className="text-xl font-black text-stone-900 leading-none">Say — Objection Handling</h2>
              </div>
              {/* Gong badge */}
              <div className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5v14M7 5v14M22 8v8M2 8v8"/>
                </svg>
                Gong Intelligence
              </div>
            </div>

            {/* Pricing Intelligence */}
            <div className="rounded-2xl border border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50/30 p-5 mb-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <Calculator size={16} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-[11px] font-black text-amber-800 uppercase tracking-widest mb-1.5">
                    💰 Pricing Intelligence
                  </h3>
                  <p className="text-[13px] text-amber-900 leading-relaxed font-medium">
                    {activeBattlecard.pricingIntelligence}
                  </p>
                </div>
              </div>
            </div>

            {/* Objection Cards */}
            <div className="space-y-4">
              {activeBattlecard.objections.map((obj, i) => (
                <div key={i} className="rounded-2xl border border-stone-200/60 bg-white shadow-sm overflow-hidden">
                  {/* They Say header */}
                  <div className="px-6 py-4 bg-rose-50/50 border-b border-rose-100/60">
                    <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">They Say</div>
                    <p className="text-[15px] font-semibold text-stone-900 leading-snug">"{obj.question}"</p>
                  </div>

                  {/* You Say body */}
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">You Say</div>
                      <CopyButton text={obj.script.replace(/^"|"$/g, '')} />
                    </div>
                    <div className="relative pl-4 border-l-2 border-emerald-200">
                      <p className="text-[13px] text-stone-700 leading-relaxed font-medium italic">
                        {obj.script}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════
              SECTION 3 — SHOW (Diagnostic Questions)
          ════════════════════════════════════════════════════════ */}
          <section id="section-show" className="scroll-mt-6 pb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                <AlertTriangle size={16} className="text-slate-600" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Section 3</div>
                <h2 className="text-xl font-black text-stone-900 leading-none">Show — Diagnostic Questions</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBattlecard.trapQuestions.map((trap, i) => (
                <TrapCard key={i} question={trap.question} painHighlighted={trap.painHighlighted} />
              ))}
            </div>
          </section>

        </div>

        {/* Sticky TOC */}
        <StickyTOC activeSection={activeSection} />
      </div>
    </div>
  );
}
