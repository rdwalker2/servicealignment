import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Copy, Check, Waves, Target, Zap, TrendingUp, AlertCircle, CheckCircle2, MessageSquare, Phone, BarChart3 } from 'lucide-react';

/* ─── Types ────────────────────────────────────────────────── */
interface TOCEntry { id: string; label: string; icon: React.ReactNode }

const TOC_SECTIONS: TOCEntry[] = [
  { id: 'the-framework',   label: 'The Framework',        icon: <Waves size={13} /> },
  { id: 'wave1',           label: 'Wave 1 — Surface Pain', icon: <span className="text-[10px] font-black">①</span> },
  { id: 'wave2',           label: 'Wave 2 — Dig Deeper',   icon: <span className="text-[10px] font-black">②</span> },
  { id: 'wave3',           label: 'Wave 3 — Status Quo',   icon: <span className="text-[10px] font-black">③</span> },
  { id: 'hris-wedge',      label: 'The HRIS Wedge',        icon: <Target size={13} /> },
  { id: 'objections',      label: 'Common Objections',     icon: <MessageSquare size={13} /> },
  { id: 'nooks-intel',     label: 'Nooks Intel',           icon: <BarChart3 size={13} /> },
];

/* ─── CopyButton ────────────────────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-all"
      title="Copy to clipboard"
    >
      {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

/* ─── ScriptCard ────────────────────────────────────────────── */
function ScriptCard({ label, script, accent = 'stone', note }: {
  label: string; script: string; accent?: string; note?: string;
}) {
  const accents: Record<string, string> = {
    blue:    'border-blue-200 bg-blue-50/60',
    amber:   'border-amber-200 bg-amber-50/60',
    rose:    'border-rose-200 bg-rose-50/60',
    emerald: 'border-emerald-200 bg-emerald-50/60',
    violet:  'border-violet-200 bg-violet-50/60',
    stone:   'border-stone-200 bg-stone-50',
  };
  const labelAccents: Record<string, string> = {
    blue:    'text-blue-700 bg-blue-100',
    amber:   'text-amber-700 bg-amber-100',
    rose:    'text-rose-700 bg-rose-100',
    emerald: 'text-emerald-700 bg-emerald-100',
    violet:  'text-violet-700 bg-violet-100',
    stone:   'text-stone-600 bg-stone-200',
  };

  return (
    <div className={`rounded-xl border p-4 ${accents[accent] ?? accents.stone}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${labelAccents[accent] ?? labelAccents.stone}`}>
          {label}
        </span>
        <CopyButton text={script} />
      </div>
      <p className="text-[13px] text-stone-800 leading-relaxed italic font-medium">"{script}"</p>
      {note && (
        <p className="mt-3 text-[11px] text-stone-500 border-t border-stone-200 pt-2.5">{note}</p>
      )}
    </div>
  );
}

/* ─── WaveSection ────────────────────────────────────────────── */
function WaveSection({ number, title, subtitle, color, children }: {
  number: number; title: string; subtitle: string; color: string; children: React.ReactNode;
}) {
  const colors: Record<number, { ring: string; num: string; badge: string }> = {
    1: { ring: 'ring-blue-200', num: 'bg-gradient-to-br from-blue-500 to-blue-700 text-white', badge: 'bg-blue-100 text-blue-700' },
    2: { ring: 'ring-amber-200', num: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white', badge: 'bg-amber-100 text-amber-700' },
    3: { ring: 'ring-violet-200', num: 'bg-gradient-to-br from-violet-500 to-purple-700 text-white', badge: 'bg-violet-100 text-violet-700' },
  };
  const c = colors[number] ?? colors[1];

  return (
    <div className={`rounded-2xl border border-stone-200 bg-white ring-2 ${c.ring} shadow-sm overflow-hidden`}>
      <div className="px-6 pt-6 pb-5 border-b border-stone-100">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl ${c.num} flex items-center justify-center text-[15px] font-black shadow-md shrink-0`}>
            {number}
          </div>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${c.badge} mb-2 inline-block`}>
              Wave {number}
            </span>
            <h3 className="text-[16px] font-bold text-stone-900">{title}</h3>
            <p className="text-[12px] text-stone-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
  );
}

/* ─── ObjectionCard ──────────────────────────────────────────── */
function ObjectionCard({ objection, response, wave }: {
  objection: string; response: string; wave: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-5 py-4 flex items-start gap-3 hover:bg-stone-50 transition-colors text-left"
      >
        <AlertCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-stone-800">"{objection}"</p>
          <span className={`mt-1 inline-flex text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
            wave === '1' ? 'bg-blue-100 text-blue-600' :
            wave === '2' ? 'bg-amber-100 text-amber-600' :
            'bg-violet-100 text-violet-600'
          }`}>
            Deploy Wave {wave}
          </span>
        </div>
        {open
          ? <ChevronDown size={16} className="text-stone-400 shrink-0 mt-0.5" />
          : <ChevronRight size={16} className="text-stone-400 shrink-0 mt-0.5" />
        }
      </button>
      {open && (
        <div className="px-5 pb-4 pt-0 border-t border-stone-100 bg-emerald-50/50">
          <div className="flex items-start gap-3 pt-4">
            <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-stone-500 uppercase tracking-widest mb-2">Your Response</p>
              <p className="text-[13px] text-stone-800 leading-relaxed italic font-medium">"{response}"</p>
              <div className="mt-3 flex justify-end">
                <CopyButton text={response} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── NooksStatCard ──────────────────────────────────────────── */
function NooksStatCard({ value, label, sublabel, color }: {
  value: string; label: string; sublabel?: string; color: string;
}) {
  return (
    <div className={`rounded-xl p-4 border ${color}`}>
      <p className="text-[26px] font-black text-stone-900 leading-none">{value}</p>
      <p className="text-[12px] font-bold text-stone-700 mt-1">{label}</p>
      {sublabel && <p className="text-[11px] text-stone-500 mt-0.5">{sublabel}</p>}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function ColdCallPlaybook() {
  const [activeToc, setActiveToc] = useState('the-framework');
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll spy
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const handler = () => {
      const ids = TOC_SECTIONS.map(s => s.id);
      for (const id of [...ids].reverse()) {
        const sec = document.getElementById(id);
        if (sec && sec.getBoundingClientRect().top <= 120) {
          setActiveToc(id);
          break;
        }
      }
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative flex h-full bg-stone-50">
      {/* ── Main scroll area ── */}
      <div ref={contentRef} className="flex-1 overflow-y-auto">

        {/* ── HERO ── */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 40%)' }} />

          <div className="relative px-10 py-12 max-w-4xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">Enablement</span>
              <span className="text-slate-600">›</span>
              <span className="text-[11px] text-slate-300 font-semibold">Cold Call Playbook</span>
            </div>

            <div className="flex items-start gap-5 mb-7">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-900/40 shrink-0">
                <Waves size={26} className="text-white" />
              </div>
              <div>
                <h1 className="text-[30px] font-black text-white tracking-tight leading-none">
                  The Three Waves Framework
                </h1>
                <p className="text-[14px] text-slate-400 mt-2 max-w-xl leading-relaxed">
                  The cold call methodology that drives a 35% booking rate. Stop accepting "we're all set" — learn to work through three layers of resistance to surface real pain.
                </p>
              </div>
            </div>

            {/* Stat row */}
            <div className="flex flex-wrap gap-3">
              {[
                { v: '35%',  l: 'Nicolas Texier booking rate', c: 'bg-blue-500/20 border-blue-500/30 text-blue-300' },
                { v: '3',    l: 'waves = 3 attempts before you stop', c: 'bg-violet-500/20 border-violet-500/30 text-violet-300' },
                { v: '100%', l: 'of calls should use this script', c: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' },
                { v: '8,961', l: 'Nooks dials analyzed', c: 'bg-amber-500/20 border-amber-500/30 text-amber-300' },
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

          {/* ── THE FRAMEWORK ── */}
          <section id="the-framework">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <Waves size={16} className="text-white" />
              </div>
              <h2 className="text-[20px] font-black text-stone-900">The Framework</h2>
            </div>

            <div className="prose prose-stone max-w-none">
              <p className="text-[14px] text-stone-600 leading-relaxed mb-5">
                Every prospect's first response is a reflex, not a decision. When they say <em>"We're all set"</em> or <em>"We already have a system"</em> — they haven't thought about it, they just said it. The Three Waves framework is designed to work through that wall systematically.
              </p>
              <p className="text-[14px] text-stone-600 leading-relaxed mb-6">
                The rule: <strong className="text-stone-800">you get exactly 3 attempts before you move on.</strong> Each wave goes one layer deeper. Most deals open on Wave 2 or 3 — the reps who stop at Wave 1 leave the majority of their pipeline on the table.
              </p>
            </div>

            {/* Visual wave flow */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <div className="flex items-center gap-0">
                {[
                  { num: '1', label: 'Surface Pain', sub: '"Do you have any current challenges with hiring?"', color: 'from-blue-500 to-blue-700', textColor: 'text-blue-700', bg: 'bg-blue-50' },
                  { num: '→', label: '', sub: '', color: '', textColor: 'text-stone-300', bg: '' },
                  { num: '2', label: 'Dig Deeper', sub: '"Really? So you\'re not worried about [risk]?"', color: 'from-amber-500 to-orange-600', textColor: 'text-amber-700', bg: 'bg-amber-50' },
                  { num: '→', label: '', sub: '', color: '', textColor: 'text-stone-300', bg: '' },
                  { num: '3', label: 'Status Quo', sub: '"When did you last evaluate your current system?"', color: 'from-violet-500 to-purple-700', textColor: 'text-violet-700', bg: 'bg-violet-50' },
                ].map((step, i) =>
                  step.num === '→' ? (
                    <div key={i} className="flex-1 flex justify-center">
                      <ChevronRight size={20} className="text-stone-300" />
                    </div>
                  ) : (
                    <div key={i} className={`flex-1 ${step.bg} rounded-xl p-4 text-center border border-stone-100`}>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-black text-[16px] shadow-md mx-auto mb-3`}>
                        {step.num}
                      </div>
                      <p className={`text-[12px] font-bold ${step.textColor} mb-2`}>{step.label}</p>
                      <p className="text-[11px] text-stone-500 italic leading-relaxed">{step.sub}</p>
                    </div>
                  )
                )}
              </div>
              <div className="mt-4 px-4 py-3 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-[12px] text-amber-800 font-semibold">
                  <strong>The Rule:</strong> If they open up at any wave — stop the script, go with the conversation. The waves are a framework for resistance, not a rigid script. The moment they show real interest, you're in discovery mode.
                </p>
              </div>
            </div>
          </section>

          {/* ── WAVE 1 ── */}
          <section id="wave1">
            <WaveSection
              number={1}
              title="Surface Potential Pain or Goals"
              subtitle="The gentle probe. Most will say no — that's expected."
              color="blue"
            >
              <p className="text-[13px] text-stone-600 leading-relaxed">
                Wave 1 is your opener after their initial brush-off. It's a direct, honest question about whether there's any current problem worth discussing. Keep it casual — this is inquiry, not interrogation.
              </p>

              {/* Nicolas's verbatim opener */}
              <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 overflow-hidden">
                <div className="px-5 py-3 border-b border-emerald-100 bg-emerald-50 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-black text-emerald-800 uppercase tracking-widest">Nicolas Texier's Verbatim Opener — 35% Booking Rate</p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">From 5,936 dials → 41 transcribed calls · Use this word-for-word</p>
                  </div>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <ScriptCard
                    label="Step 1 — Intro"
                    accent="emerald"
                    script="Hi [First Name], it's [Your Name] from Teamtailor, the applicant management platform. Hope you're doing well."
                    note="Short. No fluff. 'Applicant management platform' not 'ATS' — less triggering."
                  />
                  <ScriptCard
                    label="Step 2 — Validate ownership"
                    accent="emerald"
                    script="I wanted to make sure I have the right person — you handle the recruiting tools and applicant management internally, correct?"
                    note="Don't pitch a gatekeeper. Get the yes before you continue."
                  />
                  <ScriptCard
                    label="Step 3 — The pitch (NEVER say 'demo')"
                    accent="emerald"
                    script="The reason I'm reaching out is to show you the innovations in the HR space during a short 15-20 minute call — no commitment. We've been the industry leader for 13 years with 13,000+ clients. Just so you have the information on hand whenever you want to compare."
                    note="Key phrases: 'innovations in the HR space' · 'no commitment' · 'so you have the information on hand' · 'whenever you want to compare' — each word is intentional."
                  />
                  <ScriptCard
                    label="Step 4 — Binary time close"
                    accent="emerald"
                    script="I have my calendar in front of me — do you have yours? Next week or the week after? I can do [Tuesday] at [10] or [2] — what works better?"
                    note="Two slots only. Never 'when are you free?' Binary choice = faster decision, less back-and-forth."
                  />
                </div>
              </div>

              <ScriptCard
                label="Alternative — Pain-Forward (if they've already said no)"
                accent="blue"
                script="I hear you. Quick question before I let you go — are you dealing with anything specific around time-to-hire, show rates, or getting hiring managers to actually engage with candidates?"
                note="More specific = more likely to land. Tailor to what you know about their company size."
              />

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-2">What to listen for</p>
                <div className="space-y-2">
                  {[
                    'Any hesitation or "well, we have been having some issues with..."',
                    '"We\'re looking at a few options right now"',
                    '"Our system works but it\'s a bit clunky"',
                    'Tone shift from dismissive to conversational',
                  ].map(s => (
                    <div key={s} className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-[12px] text-stone-600">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </WaveSection>
          </section>

          {/* ── WAVE 2 ── */}
          <section id="wave2">
            <WaveSection
              number={2}
              title="Dig Deeper — Challenge Assumptions"
              subtitle="They said they're fine. Now you show slight surprise and widen the scope."
              color="amber"
            >
              <p className="text-[13px] text-stone-600 leading-relaxed">
                Wave 2 is where you use your industry knowledge as a rep. You're not challenging them aggressively — you're thinking aloud, referencing patterns you see across other companies in their space.
              </p>

              <ScriptCard
                label="Standard ATS Wave 2"
                accent="amber"
                script="Really? So you're not running into anything around show rates being lower than you'd like, or hiring managers not reviewing candidates quickly enough? Because those are the two things I hear about most from teams your size."
                note="Two specific pain points → forces them to actually think about it rather than just reflexively say 'we're good.'"
              />

              <ScriptCard
                label="Competitive Angle — Wave 2"
                accent="amber"
                script="Interesting. So you're on [Competitor] and you're not finding the candidate experience — like the career page or mobile apply flow — to be a bottleneck? Most teams I work with on [Competitor] eventually hit a wall there."
                note="Name the competitor if you know it. Specificity creates credibility."
              />

              <ScriptCard
                label="Future Risk — Wave 2"
                accent="amber"
                script="Got it. No concerns about scaling the hiring process as you grow, or getting better data on where candidates are dropping off in the funnel? That's where I usually see teams realize they need something more purpose-built."
                note="'As you grow' plants the seed even if they're not growing today."
              />

              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest mb-2">The Psychology</p>
                <p className="text-[12px] text-amber-800 leading-relaxed">
                  A "really?" said with genuine curiosity — not sarcasm — signals that their answer surprises you based on what you know. This forces them to reconsider. They start explaining themselves rather than just brushing you off.
                </p>
              </div>
            </WaveSection>
          </section>

          {/* ── WAVE 3 ── */}
          <section id="wave3">
            <WaveSection
              number={3}
              title="Confront the Status Quo"
              subtitle="The pattern-interrupt question. This is where latent pain surfaces."
              color="violet"
            >
              <p className="text-[13px] text-stone-600 leading-relaxed">
                If they've made it to Wave 3, they probably haven't thought about their ATS in a while. The Wave 3 question is designed to surface that blind spot — when was the last time they actually evaluated this?
              </p>

              <ScriptCard
                label="The Status Quo Question — ATS"
                accent="violet"
                script="Out of curiosity — when was the last time you actually walked through your own application process as a candidate, from job post to confirmation email? Most HR leaders I talk to haven't done it in over a year."
                note="This is devastating in a good way. The answer is almost always 'not recently.' Now you have an opening."
              />

              <ScriptCard
                label="The Benchmark Offer — Wave 3 Follow-through"
                accent="violet"
                script="What we typically do for teams in your situation is a quick 20-minute benchmark — we look at your career site, time-to-hire, and candidate experience against companies your size. Worst case you confirm everything's great. Best case you find something worth fixing. Worth a look?"
                note="This reframes the meeting from 'sales pitch' to 'free diagnostic.' Much easier yes."
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-4">
                  <p className="text-[11px] font-bold text-violet-700 uppercase tracking-widest mb-2">If still no interest</p>
                  <p className="text-[12px] text-violet-800 leading-relaxed">
                    "Totally fair. Let me send you one thing — we did an analysis of the top 5 things companies like yours are missing in their hiring stack. It's a 2-minute read. I'll include my number if anything ever comes up." → Exit gracefully, stay warm.
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                  <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest mb-2">If they engage</p>
                  <p className="text-[12px] text-emerald-800 leading-relaxed">
                    Stop the waves. You're now in a discovery conversation. Ask: "Tell me more about that — how long has that been an issue?" Don't rush to pitch — stay curious.
                  </p>
                </div>
              </div>
            </WaveSection>
          </section>

          {/* ── HRIS WEDGE ── */}
          <section id="hris-wedge">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF2A7F] to-[#c0006a] flex items-center justify-center">
                <Target size={16} className="text-white" />
              </div>
              <h2 className="text-[20px] font-black text-stone-900">The HRIS Wedge Play</h2>
              <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full uppercase tracking-widest">Use on 100% of calls</span>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 mb-6 shadow-lg">
              <p className="text-[13px] text-slate-300 leading-relaxed mb-4">
                Most companies use two systems: an <strong className="text-white">HRIS/payroll system</strong> (ADP, Paylocity, BambooHR, Gusto, Rippling, isolved) and an <strong className="text-white">ATS</strong> for recruiting. The problem: the HRIS ATS module was bolted on — it's not purpose-built for hiring.
              </p>
              <p className="text-[13px] text-slate-300 leading-relaxed">
                The wedge: <strong className="text-white">you don't compete with their HRIS</strong>. You replace only the recruiting module. They keep payroll/HR in the system they trust — they just get a world-class ATS on top.
              </p>
            </div>

            <div className="mb-6 rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-emerald-100 bg-emerald-50">
                <p className="text-[12px] font-black text-emerald-800 uppercase tracking-widest">Chris Smith's Verbatim Script — Used on 30+ Calls</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">Copy this word-for-word. The exact phrasing is what makes it work.</p>
              </div>
              <div className="px-6 py-5 space-y-4">
                <ScriptCard
                  label="The Wedge Opener (ADP / Paycom / Paylocity)"
                  accent="emerald"
                  script="I hear [wonderful/phenomenal] things about [ADP/Paycom/Paylocity] from the HR side of it. When it comes to the applicant tracking system side — I've heard it can be seen as a bit of an afterthought. Just curious if that resonates with you at all."
                  note="Real transcript response: 'A bit. It does the job, but it certainly doesn't have some of the functionality that dedicated ATS platforms would have.' — This line works because you're complimenting their HRIS while opening the ATS gap."
                />
                <ScriptCard
                  label="Workday variant (verbatim)"
                  accent="blue"
                  script="I've used Workday before from the employee side. I hear wonderful things about it for time stamps, vacation, employee benefits. When it comes to the recruiting side — I've heard it can be seen as a bit of an afterthought. Do you feel that way at all?"
                  note="Real transcript response: 'I think there's definitely some slight challenges with it.' — Workday's recruiting module is universally disliked by TA teams."
                />
                <ScriptCard
                  label="Dayforce / Ceridian variant"
                  accent="amber"
                  script="Typically I hear phenomenal things about Dayforce from the HRIS side. Sometimes I hear when it comes to the applicant tracking system side — it can be seen as a bit of an afterthought. Sometimes not the easiest system to use. Just curious if that resonates with you at all."
                  note="If they say it works great: 'I'm glad to hear that. Is there anything that — maybe not a pain point — but something where if Dayforce could just do this one thing, it would make your life a little easier?'"
                />
                <ScriptCard
                  label="Bridge + reframe (after wedge lands)"
                  accent="violet"
                  script="So what companies do is use Teamtailor for the ATS — and once the candidate gets hired, they kick right off into the HRIS as an employee. We actually have a few customers using both. We have a direct integration into [HRIS]. It takes 15-20 minutes to see how it works — would it be worth a look?"
                  note="You are NOT replacing their HRIS. You are adding a purpose-built recruiting layer on top. Say this clearly every time."
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[14px] font-bold text-stone-700 uppercase tracking-widest">Step-by-Step Process</h3>

              {[
                {
                  step: '1',
                  label: 'Confirm they handle recruiting tools',
                  script: 'I wanted to make sure I have the right person — you handle the recruiting tools and applicant management internally, correct?',
                  note: 'From Nicolas\'s playbook. Validate ownership before you deploy the wedge. Don\'t pitch a gatekeeper.',
                  accent: 'blue',
                },
                {
                  step: '2',
                  label: 'Identify their HRIS / ATS',
                  script: 'What are you using right now for your HRIS and applicant tracking? Is that still ADP / [what you see on their site]?',
                  note: 'Research their career page first. You should already have a name. This is confirmation, not discovery.',
                  accent: 'stone',
                },
                {
                  step: '3',
                  label: 'Fire the HRIS Wedge',
                  script: 'I hear [wonderful/phenomenal] things about [HRIS] from the HR side of it. When it comes to the applicant tracking system side — I\'ve heard it can be seen as a bit of an afterthought. Just curious if that resonates with you at all.',
                  note: 'Use the exact phrasing. The softness of "a bit of an afterthought" is intentional — it invites them to agree without feeling defensive.',
                  accent: 'amber',
                },
                {
                  step: '4',
                  label: 'Bridge to Teamtailor',
                  script: 'So what companies do is use Teamtailor for the ATS — and once a candidate gets hired, they kick right off into [HRIS] as an employee. We have a direct integration. That way you get the best of both: [HRIS] for payroll and HR records, Teamtailor for recruiting.',
                  note: 'This removes the "we don\'t want to switch everything" fear before it\'s raised.',
                  accent: 'emerald',
                },
                {
                  step: '5',
                  label: 'Close for the educational meeting',
                  script: 'I\'d love to show you the innovations in the HR space during a short 15-20 minute call — no commitment. Just so you have the information on hand whenever you want to compare. Do you have your calendar in front of you? I can do [Tuesday at 10] or [Thursday at 2] — what works better?',
                  note: 'From Nicolas: NEVER say "demo." It\'s "educational call" or "show you the innovations." Offer exactly 2 slots. Binary choice = faster decision.',
                  accent: 'violet',
                },
              ].map(s => (
                <div key={s.step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-stone-900 text-white text-[12px] font-black flex items-center justify-center shrink-0">
                      {s.step}
                    </div>
                    {Number(s.step) < 5 && <div className="flex-1 w-px bg-stone-200 mt-2" />}
                  </div>
                  <div className="pb-4 flex-1">
                    <p className="text-[12px] font-bold text-stone-700 mb-2">{s.label}</p>
                    <ScriptCard label={`Step ${s.step}`} script={s.script} note={s.note} accent={s.accent} />
                  </div>
                </div>
              ))}
            </div>

            {/* HRIS quick-ref table */}
            <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-stone-100 bg-stone-50">
                <p className="text-[12px] font-bold text-stone-700 uppercase tracking-widest">HRIS Integration Quick Reference</p>
              </div>
              <div className="divide-y divide-stone-100">
                {[
                  { hris: 'ADP Workforce Now', angle: 'Keep ADP for payroll — we\'re an ADP Marketplace partner with a native integration', status: '✅ Native' },
                  { hris: 'Paylocity', angle: 'Paylocity ATS is their biggest weak point — rep doesn\'t proactively show features. Keep payroll, replace ATS.', status: '✅ API' },
                  { hris: 'BambooHR', angle: 'BambooHR recruiting was acquired and never rebuilt. Keep BambooHR for HR — replace recruiting.', status: '✅ API' },
                  { hris: 'Rippling', angle: 'Rippling is excellent for HRIS/payroll. ATS is an add-on module, not their focus.', status: '✅ API' },
                  { hris: 'Gusto', angle: 'Gusto is payroll-first. Their ATS is basic. Easy integration with TT.', status: '✅ Native' },
                  { hris: 'isolved / Paycom / Paycor', angle: 'All HRIS-first platforms with bolted-on ATS. Same wedge play applies.', status: '✅ API' },
                ].map(r => (
                  <div key={r.hris} className="px-5 py-3.5 flex gap-4 items-start">
                    <div className="w-32 shrink-0">
                      <p className="text-[12px] font-bold text-stone-800">{r.hris}</p>
                      <span className="text-[10px] text-emerald-600 font-semibold">{r.status}</span>
                    </div>
                    <p className="text-[12px] text-stone-500 leading-relaxed flex-1">{r.angle}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── COMMON OBJECTIONS ── */}
          <section id="objections">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center">
                <MessageSquare size={16} className="text-white" />
              </div>
              <h2 className="text-[20px] font-black text-stone-900">Common Objections — Cold Call</h2>
            </div>

            <p className="text-[13px] text-stone-500 mb-5 leading-relaxed">
              These are the exact responses heard on successful calls across your team. Each maps to the wave that opens the most doors.
            </p>

            <div className="space-y-3">
              {[
                {
                  objection: "We're all set, we have a system",
                  response: "Totally hear you — quick question before I go. Is your hiring team fully satisfied with it, or is it more of a 'it works but there are workarounds' situation? Because that's usually where we find the gap.",
                  wave: '1',
                },
                {
                  objection: "We're happy with what we have",
                  response: "That's great. Out of curiosity — are you on the recruiting side or more HRIS and payroll? Because sometimes when I hear 'happy,' the recruiter has a totally different take than the HR manager. Which perspective are you coming from?",
                  wave: '2',
                },
                {
                  objection: "Not a good time, we just implemented something",
                  response: "Completely get it — implementations are brutal. How long ago did you go live? I ask because there's usually a 6-month window where teams realize what the new system can't do. Just want to plant a flag in case that happens.",
                  wave: '2',
                },
                {
                  objection: "Send me an email",
                  response: "Absolutely, I'll send it right now. While I have you — what's the one thing you wish your current ATS did better? I'll make sure whatever I send is actually relevant to you.",
                  wave: '1',
                },
                {
                  objection: "We already evaluated you and went with someone else",
                  response: "I appreciate you being straight with me. Just so I understand — was it a feature gap, price, or timing that drove the decision? I want to make sure if we reconnect down the road it's actually worth your time.",
                  wave: '3',
                },
                {
                  objection: "We're not looking at this until next year",
                  response: "Makes total sense. When you do get there — would it be more of a rip-and-replace of everything, or are you thinking about separating the HRIS from the ATS? That usually shapes which direction is the right move.",
                  wave: '2',
                },
                {
                  objection: "We use ADP / Paycom / BambooHR for everything",
                  response: "Totally — and we work alongside those systems, not instead of them. Most teams keep [HRIS] for payroll and HR records and just replace the recruiting piece. We actually have a native integration. Would it be worth 20 minutes to see what that looks like?",
                  wave: '1',
                },
              ].map(o => (
                <ObjectionCard key={o.objection} {...o} />
              ))}
            </div>
          </section>

          {/* ── NOOKS INTEL ── */}
          <section id="nooks-intel">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center">
                <BarChart3 size={16} className="text-white" />
              </div>
              <h2 className="text-[20px] font-black text-stone-900">Nooks Intelligence</h2>
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">8,961 dials analyzed</span>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-3 mb-8">
              <NooksStatCard value="35%" label="Nicolas Texier booking rate" sublabel="Same script. Every. Single. Call." color="border-emerald-200 bg-emerald-50/60" />
              <NooksStatCard value="14.3%" label="Chris Smith booking rate" sublabel="High volume, lower script consistency" color="border-amber-200 bg-amber-50/60" />
              <NooksStatCard value="50%" label="Team show rate" sublabel="Industry standard is 75–80%" color="border-rose-200 bg-rose-50/60" />
              <NooksStatCard value="28%" label="Team conv→meeting rate" sublabel="Target: 33%. Nicolas: 34.9%" color="border-blue-200 bg-blue-50/60" />
            </div>

            {/* Nicolas's playbook */}
            <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white overflow-hidden shadow-sm mb-6">
              <div className="px-6 py-5 border-b border-emerald-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                  <TrendingUp size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-[15px] font-black text-stone-900">Nicolas Texier — The 35% Benchmark</p>
                  <p className="text-[12px] text-stone-500">What separates his booking rate from the team average</p>
                </div>
              </div>
              <div className="px-6 py-5 space-y-3">
                {[
                  { label: 'Script consistency', detail: 'Uses the exact same opener on 100% of calls. Zero improvisation on the intro. This alone accounts for most of the gap.' },
                  { label: 'HRIS wedge — every call', detail: 'Asks about HRIS/payroll system on every conversation. Positions TT as complementary, not replacement. Removes the biggest objection before it\'s raised.' },
                  { label: 'Calendar invite on the phone', detail: '"Let me send you an invite right now — can you accept it while I have you?" Prospect accepts on the call. Show rate goes from 50% → 80%.' },
                  { label: 'No small talk, fast to the point', detail: 'Respects their time immediately. "I\'ll be brief" + gets to the wave structure within 30 seconds.' },
                  { label: 'Specific meeting premise', detail: '"I want to show you how we\'ve helped teams your size cut time-to-hire by 40%" — not "jump on a call to learn more."' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <Zap size={14} className="text-emerald-500 shrink-0 mt-1" />
                    <div>
                      <p className="text-[13px] font-bold text-stone-800">{item.label}</p>
                      <p className="text-[12px] text-stone-500 leading-relaxed">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Show rate fix */}
            <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/40 overflow-hidden">
              <div className="px-6 py-5 border-b border-rose-100">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-rose-500" />
                  <div>
                    <p className="text-[15px] font-black text-stone-900">The Show Rate Crisis — and the Fix</p>
                    <p className="text-[12px] text-stone-500">Your team is doing the hardest part (booking) and losing the payoff</p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-5">
                <div className="grid grid-cols-3 gap-4 mb-5">
                  {[
                    { rep: 'Jack Luther', rate: '61%', delta: '+11% vs target', color: 'text-amber-600' },
                    { rep: 'Moe Aqel', rate: '47%', delta: '🚨 -33% vs target', color: 'text-rose-600' },
                    { rep: 'Tyler Hanson', rate: '41%', delta: '🚨 -39% vs target', color: 'text-rose-600' },
                  ].map(r => (
                    <div key={r.rep} className="bg-white rounded-xl border border-rose-100 p-4 text-center">
                      <p className="text-[22px] font-black text-stone-900">{r.rate}</p>
                      <p className="text-[12px] font-semibold text-stone-700">{r.rep}</p>
                      <p className={`text-[11px] font-bold mt-1 ${r.color}`}>{r.delta}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl border border-emerald-200 p-5">
                  <p className="text-[12px] font-bold text-stone-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    The One-Move Fix: Accept On Phone
                  </p>
                  <ScriptCard
                    label="After they agree to meet"
                    accent="emerald"
                    script="Perfect — I'm going to send you the calendar invite right now. Can you stay on for just 30 seconds while I pull that up? I want to make sure it lands in your calendar before we hang up."
                    note="Nicolas's 80% show rate vs the team's 50% comes almost entirely from this. The prospect accepts the invite on the call — they can't ghost what they already accepted."
                  />
                </div>
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
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] transition-all text-left ${
                activeToc === s.id
                  ? 'bg-[#FF2A7F]/8 text-[#FF2A7F] font-semibold'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100 font-medium'
              }`}
            >
              <span className={activeToc === s.id ? 'text-[#FF2A7F]' : 'text-stone-400'}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
