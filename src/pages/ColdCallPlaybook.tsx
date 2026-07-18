import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check, Waves, Target, AlertCircle, CheckCircle2, MessageSquare, Phone } from 'lucide-react';

/* ─── Types ────────────────────────────────────────────────── */
interface TOCEntry { id: string; label: string; icon: React.ReactNode }

const TOC_SECTIONS: TOCEntry[] = [
  { id: 'the-framework',   label: 'The Predictive Framework', icon: <Waves size={13} /> },
  { id: 'wave1',           label: 'Wave 1 — The Ping',       icon: <span className="text-[10px] font-black">①</span> },
  { id: 'wave2',           label: 'Wave 2 — Financial Pain', icon: <span className="text-[10px] font-black">②</span> },
  { id: 'wave3',           label: 'Wave 3 — Status Quo',     icon: <span className="text-[10px] font-black">③</span> },
  { id: 'roof-wedge',      label: 'The Roof Health Wedge',   icon: <Target size={13} /> },
  { id: 'objections',      label: 'Common Objections',       icon: <MessageSquare size={13} /> },
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

/* ─── Main Component ────────────────────────────────────────── */
export default function ColdCallPlaybook() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex items-start gap-8 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ── Main Content ── */}
      <div className="flex-1 py-10 min-w-0">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-widest flex items-center gap-1.5">
              <Phone size={12} />
              Active Playbook
            </span>
            <span className="text-stone-400 text-[12px] font-medium">Updated July 2026</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight mb-2">The Predictive Roof Wedge</h1>
          <p className="text-[15px] text-stone-500 max-w-2xl leading-relaxed">
            Stop dialing for dollars and asking "Do you have any leaks?" 
            Leverage the Service Alignment Predictive Engine to call prospects with an urgent, data-backed reason: <strong className="text-stone-700 font-semibold">Their roof just pinged us.</strong>
          </p>
        </div>

        {/* The Framework */}
        <div className="space-y-16">
          <section id="the-framework" className="scroll-mt-24">
            <div className="bg-stone-900 rounded-2xl p-8 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Waves size={200} />
              </div>
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-white mb-2">The 3-Wave Pitch Architecture</h2>
                <p className="text-stone-400 text-[14px] mb-6 max-w-xl">
                  Traditional roofers use a 1-step pitch ("I'm in the area, can I check your roof?"). 
                  We use a 3-Wave architecture that starts with data, moves to financial pain, and traps them in the risk of the status quo.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { num: '1', title: 'The Ping', desc: 'Anchor on the NOAA alert', color: 'bg-blue-500' },
                    { num: '2', title: 'Financial Pain', desc: 'Inventory/Tenant risk', color: 'bg-amber-500' },
                    { num: '3', title: 'Status Quo', desc: 'Predictive vs Reactive', color: 'bg-violet-500' }
                  ].map(w => (
                    <div key={w.num} className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4 backdrop-blur-sm">
                      <div className={`w-6 h-6 rounded-full ${w.color} flex items-center justify-center text-white text-[11px] font-black mb-3 shadow-sm`}>
                        {w.num}
                      </div>
                      <h3 className="text-white font-bold text-[13px] mb-1">{w.title}</h3>
                      <p className="text-stone-400 text-[11px] font-medium leading-relaxed">{w.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Wave 1 */}
          <section id="wave1" className="scroll-mt-24">
            <WaveSection 
              number={1} 
              title="The Ping (Pattern Interrupt)" 
              subtitle="Break their brain immediately. They expect a roofer; sound like a tech partner."
              color="blue"
            >
              <ScriptCard 
                label="The Opener" 
                accent="blue"
                script="Hey [Name] — I'm calling because your roof at [Address] just pinged our system."
                note="PAUSE. Let them be confused. 'What do you mean my roof pinged you?'"
              />
              <ScriptCard 
                label="The Data Drop" 
                accent="blue"
                script="Our predictive system tracks NOAA weather data against the age of commercial roofs. The recent hail event in your grid dropped your property's Roof Health Score into the risk zone. Have you experienced any water intrusion yet, or are we catching this early?"
                note="This immediately positions you as an expert who knows more about their building than they do."
              />
            </WaveSection>
          </section>

          {/* Wave 2 */}
          <section id="wave2" className="scroll-mt-24">
            <WaveSection 
              number={2} 
              title="Financial Pain (The 'Why Now')" 
              subtitle="Transition from the roof to their wallet (NOI)."
              color="amber"
            >
              <ScriptCard 
                label="If they say 'No leaks yet'" 
                accent="amber"
                script="That's exactly why I reached out. By the time you see the leak inside, the insulation has been wet for months, which turns a $1,000 repair into a $150,000 replacement. Are you planning any capital expenditures for that roof this year, or were you hoping it would hold on?"
                note="Introduce the massive financial risk of waiting."
              />
              <ScriptCard 
                label="If they say 'Yes, we have leaks'" 
                accent="amber"
                script="I figured. How is that impacting the tenants right now? Are they threatening to withhold rent or is inventory getting damaged?"
                note="Dig into the true cost of the leak."
              />
            </WaveSection>
          </section>

          {/* Wave 3 */}
          <section id="wave3" className="scroll-mt-24">
            <WaveSection 
              number={3} 
              title="Status Quo (The Trap)" 
              subtitle="Box out traditional roofers and secure the Diagnosis meeting."
              color="violet"
            >
              <ScriptCard 
                label="The Trap" 
                accent="violet"
                script="Usually when I talk to owners, they either have a guy who patches leaks when they pop up, or they have a true preventative maintenance plan. Which camp are you in?"
                note="If they say 'we just patch it', they just admitted to the Run-to-Fail model."
              />
              <ScriptCard 
                label="The Close" 
                accent="violet"
                script="Given the risk score on that property, I'd like to send our tech out to do a quick drone scan and thermal diagnostic. It takes 30 minutes, doesn't disrupt tenants, and will give us a baseline of what's actually happening under the membrane. Do you have 15 minutes next Tuesday to review the findings?"
                note="Close for the 4D Diagnosis meeting, not a sale."
              />
            </WaveSection>
          </section>

          {/* HRIS Wedge -> Roof Wedge */}
          <section id="roof-wedge" className="scroll-mt-24">
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-stone-200 p-2 rounded-lg text-stone-600">
                  <Target size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">The Predictive Roof Wedge</h3>
                  <p className="text-[13px] text-stone-500">How to displace the incumbent roofer</p>
                </div>
              </div>
              <p className="text-[14px] text-stone-700 leading-relaxed mb-6">
                Prospects will often say "We already have a roofer." You must wedge the gap between <strong>Reactive Patching</strong> (what their roofer does) and <strong>Predictive Diagnostics</strong> (what we do).
              </p>
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                  <p className="text-[13px] font-bold text-stone-900 mb-2">Step 1: Validate their roofer</p>
                  <p className="text-[13px] text-stone-600 italic">"That's great you have someone. When you call them for a leak, how fast do they show up?"</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                  <p className="text-[13px] font-bold text-stone-900 mb-2">Step 2: Highlight the blind spot</p>
                  <p className="text-[13px] text-stone-600 italic">"When they fix that leak, do they just caulk it, or do they provide a full diagnostic of the surrounding membrane to show you what will fail next month?"</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                  <p className="text-[13px] font-bold text-stone-900 mb-2">Step 3: The Wedge</p>
                  <p className="text-[13px] text-stone-600 italic">"Most roofers are great at patching. We use predictive tech to stop the leak from happening in the first place, protecting your NOI. Let's just do a baseline diagnostic — you can even share the report with your current roofer."</p>
                </div>
              </div>
            </div>
          </section>

          {/* Objections */}
          <section id="objections" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-stone-900 mb-5">Common Objections</h2>
            <div className="space-y-3">
              <ObjectionCard 
                wave="1"
                objection="We aren't experiencing any leaks right now."
                response="I completely understand. The challenge with commercial roofs is that by the time you see the leak inside, the insulation has been wet for months. Our predictive system flagged your property due to recent wind events in your grid. Are you opposed to us doing a quick, non-invasive drone scan just to verify the integrity?"
              />
              <ObjectionCard 
                wave="2"
                objection="We just use our in-house maintenance guy."
                response="Makes sense for everyday fixes. But commercial single-ply membranes require specific heat-welding. If your guy uses the wrong caulk, it actually voids your manufacturer's 20-year warranty. Has he been documenting his repairs to warranty spec?"
              />
              <ObjectionCard 
                wave="3"
                objection="We don't have the budget for a new roof this year."
                response="I completely understand, and I'm not calling to sell you a roof. I'm calling because the cheapest way to avoid a $150,000 replacement next year is a $2,000 preventative maintenance plan today. Can we at least diagnose the current condition so you have a baseline for your capital expenditure forecasting?"
              />
            </div>
          </section>

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
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] transition-all text-left text-stone-500 hover:text-stone-800 hover:bg-stone-100 font-medium"
            >
              <span className="text-stone-400">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
