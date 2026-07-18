import { useState, useMemo } from 'react';
import {
  Stethoscope, ChevronRight, TrendingUp, TrendingDown, Clock, Users,
  DollarSign, ShieldX, Puzzle, Zap, BookOpen, Waves, ExternalLink,
  AlertTriangle, CheckCircle2, ArrowRight, Target, BarChart3, CircleDot,
  ArchiveX,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllDiscoverySessions } from '../lib/discoveryDatabase';
import { useAuth } from '../contexts/AuthContext';

/* ─── Types ──────────────────────────────────────────────────── */
type TabId = 'cold-call-playbook' | 'rep-workbook' | 'discovery-sheets';
type Health = 'red' | 'amber' | 'green';

interface TrainingLink { label: string; tab?: TabId; route?: string; section?: string; icon: React.ReactNode }
interface FunnelStage {
  id: string;
  from: string;
  to: string;
  teamAvg: number;
  target: number;
  unit: string;
  health: Health;
  fatalities: string[];
  headline: string;
  rootCause: string;
  techniques: string[];
  training: TrainingLink[];
}

interface PipelineDoctorProps {
  onNavigate: (tab: TabId) => void;
}

/* ─── Data ───────────────────────────────────────────────────── */
const STAGES: FunnelStage[] = [
  {
    id: 'connection',
    from: 'Dials',
    to: 'Connects',
    teamAvg: 5,
    target: 8,
    unit: '%',
    health: 'amber',
    fatalities: [],
    headline: 'Not enough prospects are picking up',
    rootCause:
      'Connection rate is a targeting and timing problem, not a script problem. Wrong list, wrong time of day, or calls that die at the gatekeeper. You can\'t Three Waves your way past voicemail.',
    techniques: [
      'Call Tues–Thurs between 8–10 AM and 4–5 PM — never between 12–2 PM',
      'Research the career page before dialing — know what HRIS/Provider they use before the call',
      'Gatekeeper: state your name + "Can you put me through to [First Last]?" — say it like they\'re expecting you',
      'Prioritize mobile numbers over main lines when available in Nooks',
    ],
    training: [],
  },
  {
    id: 'booking',
    from: 'Connects',
    to: 'Meetings Booked',
    teamAvg: 28,
    target: 35,
    unit: '%',
    health: 'amber',
    fatalities: ['Timing'],
    headline: 'Prospects are saying no too quickly and you\'re accepting it',
    rootCause:
      'The booking gap almost entirely comes from stopping at Wave 1. Nicolas Texier runs 35% because he uses the exact same script every call and never accepts the first brush-off. The team average of 28% means 7 out of every 100 connects that should become meetings are being left on the table.',
    techniques: [
      'Use Nicolas\'s verbatim opener — "show you the innovations in the HR space" — never say "demo"',
      'Wave 1: "Is hiring something you\'re actively improving right now?" — accept that most say no',
      'Wave 2: "Really? So you\'re not worried about [scaling / time-to-hire / show rates]?"',
      'Wave 3: "When was the last time you actually evaluated your Provider against what\'s on the market?"',
      'Binary close: "I can do [Tuesday at 10] or [Thursday at 2] — what works better?"',
      'HRIS Wedge on every call where they use Workday / ADP / Paycom / Dayforce',
    ],
    training: [
      { label: 'Three Waves Framework', tab: 'cold-call-playbook', section: 'wave1', icon: <Waves size={14} /> },
      { label: 'HRIS Wedge Play', tab: 'cold-call-playbook', section: 'hris-wedge', icon: <Target size={14} /> },
    ],
  },
  {
    id: 'showrate',
    from: 'Meetings Booked',
    to: 'Meetings Held',
    teamAvg: 50,
    target: 80,
    unit: '%',
    health: 'red',
    fatalities: [],
    headline: 'You\'re booking meetings that vanish — the biggest leak in the funnel',
    rootCause:
      'A 50% show rate means half the meetings you work hard to book never happen. This is not a prospect problem — it\'s a commitment process problem. When you hang up without the calendar invite accepted, you\'ve created a soft commitment. Soft commitments ghost. Nicolas\'s show rate is ~80% because he stays on the phone until the invite is accepted.',
    techniques: [
      '"Can you stay on 30 seconds while I pull up the invite? I want to make sure it lands before we hang up."',
      'Personalize the invite subject: "[Prospect First Name] + [Your Name] — HR Space Innovations" (not "Service Alignment Demo")',
      'Book only 2 time slots — never "when are you free?" (forces decision, less rescheduling)',
      'Same-morning confirmation: short email/text with the Zoom link and one sentence on what you\'ll cover',
      'If no reply to confirmation — call them 1 hour before the meeting',
    ],
    training: [
      { label: 'Accept on Phone — Full Protocol', tab: 'cold-call-playbook', section: 'nooks-intel', icon: <BarChart3 size={14} /> },
    ],
  },
  {
    id: 'discovery',
    from: 'Meetings Held',
    to: 'Proposals Sent',
    teamAvg: 75,
    target: 90,
    unit: '%',
    health: 'amber',
    fatalities: ['Timing', 'Competition'],
    headline: 'Meetings aren\'t converting because urgency and need aren\'t being confirmed',
    rootCause:
      'When a held meeting doesn\'t produce a proposal, it\'s almost always because Checkpoint 1 or 2 wasn\'t passed. The rep ran a demo before the prospect acknowledged the problem is real or that external help is needed. The prospect leaves thinking "interesting" not "I need this." Deals that skip the checkpoints become ghost pipeline.',
    techniques: [
      'Open every meeting: "We\'ll start with a few questions to understand your situation — the goal is to see if we can define a problem worth solving. Does that sound good?"',
      'CP1 — Urgency: "What happens if your hiring process stays as-is for another 6 months?"',
      'CP2 — Need for external help: "What have you tried so far — why hasn\'t that worked?"',
      'Disqualify early: "Yes is fine, no is fine, MAYBE is never okay." Mark deals that won\'t answer clearly as unqualified.',
      'Don\'t demo features until they\'ve named a pain — demo TO the pain, not at them',
    ],
    training: [
      { label: 'Three Checkpoints', route: '/team/process/overview?topic=three-checkpoints', icon: <CheckCircle2 size={14} /> },
      { label: 'Five Fatalities', route: '/team/process/overview?topic=five-fatalities', icon: <AlertTriangle size={14} /> },
      { label: 'Discovery Call Sheets', tab: 'discovery-sheets', section: '', icon: <BookOpen size={14} /> },
    ],
  },
  {
    id: 'close',
    from: 'Proposals Sent',
    to: 'Deals Closed',
    teamAvg: 24,
    target: 30,
    unit: '%',
    health: 'amber',
    fatalities: ['Price', 'Trust', 'Product Fit'],
    headline: 'Proposals are landing without enough value context to justify a yes',
    rootCause:
      'A 24% close rate means 3 in 4 proposals don\'t close. The most common reason: the proposal arrived before the prospect truly quantified their pain, or trust wasn\'t fully established. Buyers don\'t reject solutions — they reject uncertainty. If you can\'t answer "Why Service Alignment, why now, why not just stay with what we have?" you\'re not ready to propose.',
    techniques: [
      'Run the Five Fatalities pre-mortem before every proposal: have you addressed Timing, Competition, Price, Trust, and Fit?',
      'Open the proposal call with proof: "[Company like theirs] had [their exact problem]. Here\'s what changed in 90 days."',
      'Build ROI before the number: "What does every week without fixing this cost you in [recruiter time / lost candidates / unfilled roles]?"',
      'Get to the fatality that\'s blocking: "What would need to be true for you to feel confident recommending this to your team?"',
      'Drive to a binary: "Based on what we\'ve covered — does this address what you described in our first call? Can you see yourselves moving forward?"',
    ],
    training: [
      { label: 'Five Fatalities — Pre-Mortem', route: '/team/process/overview?topic=five-fatalities', icon: <AlertTriangle size={14} /> },
      { label: 'Three Checkpoints', route: '/team/process/overview?topic=three-checkpoints', icon: <CheckCircle2 size={14} /> },
    ],
  },
];

/* ─── Utility ────────────────────────────────────────────────── */
const FATALITY_META: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  'Timing':      { icon: Clock,       color: 'text-slate-700', bg: 'bg-slate-100',   border: 'border-slate-200'   },
  'Competition': { icon: Users,       color: 'text-amber-700', bg: 'bg-amber-50',    border: 'border-amber-200'   },
  'Price':       { icon: DollarSign,  color: 'text-rose-700',  bg: 'bg-rose-50',     border: 'border-rose-200'    },
  'Trust':       { icon: ShieldX,     color: 'text-violet-700',bg: 'bg-violet-50',   border: 'border-violet-200'  },
  'Product Fit': { icon: Puzzle,      color: 'text-emerald-700',bg: 'bg-emerald-50', border: 'border-emerald-200' },
};

const HEALTH_CONFIG: Record<Health, {
  bar: string; dot: string; text: string; badge: string; badgeText: string; label: string;
}> = {
  red:   { bar: 'bg-rose-500',   dot: 'bg-rose-500',   text: 'text-rose-600',   badge: 'bg-rose-100 border-rose-200',   badgeText: 'text-rose-700',   label: 'Critical' },
  amber: { bar: 'bg-amber-500',  dot: 'bg-amber-500',  text: 'text-amber-600',  badge: 'bg-amber-50 border-amber-200',  badgeText: 'text-amber-700',  label: 'Below Target' },
  green: { bar: 'bg-emerald-500',dot: 'bg-emerald-500',text: 'text-emerald-600',badge: 'bg-emerald-50 border-emerald-200',badgeText: 'text-emerald-700',label: 'On Track' },
};

function healthFromGap(avg: number, target: number): Health {
  const pct = avg / target;
  if (pct >= 0.92) return 'green';
  if (pct >= 0.70) return 'amber';
  return 'red';
}

/* ─── Sub-components ─────────────────────────────────────────── */
function MetricBar({ avg, target }: { avg: number; target: number }) {
  const health = healthFromGap(avg, target);
  const h = HEALTH_CONFIG[health];
  const pct = Math.min((avg / target) * 100, 100);
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[11px] font-bold ${h.text}`}>{avg}% avg</span>
        <span className="text-[11px] text-stone-400">target {target}%</span>
      </div>
      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${h.bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StageRow({ stage, isSelected, onClick }: { stage: FunnelStage; isSelected: boolean; onClick: () => void }) {
  const health = healthFromGap(stage.teamAvg, stage.target);
  const h = HEALTH_CONFIG[health];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border-2 transition-all ${
        isSelected
          ? 'border-[#FF2A7F] bg-[#FF2A7F]/4 shadow-md shadow-rose-100'
          : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/80 shadow-sm'
      }`}
    >
      {/* Stage header */}
      <div className="px-5 py-4 flex items-center gap-4">
        {/* Health dot */}
        <div className={`w-3 h-3 rounded-full ${h.dot} shrink-0 shadow-sm`} />

        {/* Stage label */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[12px] font-bold text-stone-500 truncate">{stage.from}</span>
            <ArrowRight size={12} className="text-stone-300 shrink-0" />
            <span className="text-[12px] font-bold text-stone-800 truncate">{stage.to}</span>
          </div>
          <MetricBar avg={stage.teamAvg} target={stage.target} />
        </div>

        {/* Health badge */}
        <div className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest shrink-0 ${h.badge} ${h.badgeText}`}>
          {h.label}
        </div>

        <ChevronRight size={14} className={`shrink-0 transition-transform ${isSelected ? 'rotate-90 text-[#FF2A7F]' : 'text-stone-300'}`} />
      </div>

      {/* Fatality pills — only when there are fatalities */}
      {stage.fatalities.length > 0 && (
        <div className="px-5 pb-4 flex flex-wrap gap-1.5">
          {stage.fatalities.map(f => {
            const meta = FATALITY_META[f];
            const Icon = meta?.icon;
            return (
              <span key={f} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${meta?.bg} ${meta?.color} ${meta?.border}`}>
                {Icon && <Icon size={10} />}
                {f} Fatality
              </span>
            );
          })}
        </div>
      )}
    </button>
  );
}

function DiagnosisPanel({ stage, onNavigate }: { stage: FunnelStage; onNavigate: (tab: TabId) => void }) {
  const health = healthFromGap(stage.teamAvg, stage.target);
  const gap = stage.target - stage.teamAvg;
  const h = HEALTH_CONFIG[health];

  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden h-full flex flex-col">
      {/* Panel header */}
      <div className={`px-6 py-5 border-b ${
        health === 'red' ? 'bg-rose-50 border-rose-100' :
        health === 'amber' ? 'bg-amber-50 border-amber-100' :
        'bg-emerald-50 border-emerald-100'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
            health === 'red' ? 'bg-rose-500' : health === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'
          }`}>
            <Stethoscope size={20} className="text-white" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Diagnosis</p>
            <p className="text-[16px] font-black text-stone-900 leading-tight">{stage.headline}</p>
          </div>
        </div>

        {/* Gap callout */}
        <div className={`mt-4 flex items-center gap-6 bg-white/70 rounded-xl px-4 py-3 border ${
          health === 'red' ? 'border-rose-200' : 'border-amber-200'
        }`}>
          <div className="text-center">
            <p className="text-[28px] font-black text-stone-900 leading-none">{stage.teamAvg}{stage.unit}</p>
            <p className="text-[10px] text-stone-500 font-semibold mt-1">Team Avg</p>
          </div>
          <div className="flex-1">
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden mb-1">
              <div className={`h-full rounded-full ${h.bar}`} style={{ width: `${Math.min((stage.teamAvg / stage.target) * 100, 100)}%` }} />
            </div>
            <div className="flex justify-between">
              <span className={`text-[10px] font-bold ${h.text}`}>{stage.teamAvg}{stage.unit}</span>
              <span className="text-[10px] text-stone-400">target {stage.target}{stage.unit}</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-[28px] font-black text-stone-900 leading-none">{stage.target}{stage.unit}</p>
            <p className="text-[10px] text-stone-500 font-semibold mt-1">Target</p>
          </div>
          <div className={`text-center border-l pl-6 ${health === 'red' ? 'border-rose-200' : 'border-amber-200'}`}>
            <p className={`text-[22px] font-black leading-none ${h.text}`}>-{gap}{stage.unit}</p>
            <p className="text-[10px] text-stone-500 font-semibold mt-1">Gap</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Fatalities (if any) */}
        {stage.fatalities.length > 0 && (
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3">Responsible Fatalities</p>
            <div className="space-y-2">
              {stage.fatalities.map(f => {
                const meta = FATALITY_META[f];
                const Icon = meta?.icon;
                return (
                  <div key={f} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${meta?.bg} ${meta?.border}`}>
                    {Icon && <Icon size={16} className={meta?.color} />}
                    <div>
                      <p className={`text-[13px] font-bold ${meta?.color}`}>{f} Fatality</p>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        {f === 'Timing'      && 'No urgency was established — the pain wasn\'t real enough to justify action.'}
                        {f === 'Competition' && 'They don\'t believe they need outside help — status quo won.'}
                        {f === 'Price'       && 'Value wasn\'t quantified before the number — sticker shock wins.'}
                        {f === 'Trust'       && 'Prospect isn\'t fully confident in you or your company.'}
                        {f === 'Product Fit' && 'They don\'t believe your solution solves their specific problem.'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Root cause */}
        <div>
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3">Root Cause</p>
          <div className="bg-stone-50 rounded-xl border border-stone-200 px-4 py-4">
            <p className="text-[13px] text-stone-700 leading-relaxed">{stage.rootCause}</p>
          </div>
        </div>

        {/* Techniques */}
        <div>
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3">
            {stage.training.length > 0 ? 'What to practice' : 'What to fix'}
          </p>
          <div className="space-y-2">
            {stage.techniques.map((t, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-[13px] text-stone-700 leading-relaxed flex-1">{t}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Training links */}
        {stage.training.length > 0 && (
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3">Go Practice</p>
            <div className="space-y-2">
              {stage.training.map((link, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (link.route) {
                      navigate(link.route);
                    } else if (link.tab) {
                      onNavigate(link.tab);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-[#FF2A7F]/20 bg-[#FF2A7F]/4 hover:bg-[#FF2A7F]/8 hover:border-[#FF2A7F]/40 transition-all group text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF2A7F] to-[#c0006a] flex items-center justify-center text-white shadow-sm shrink-0">
                    {link.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-stone-900">{link.label}</p>
                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                      {link.route ? 'Sales Playbook' : 
                       link.tab === 'cold-call-playbook' ? 'Cold Call Playbook' :
                       'Discovery Sheets'}
                    </span>
                  </div>
                  <ExternalLink size={14} className="text-[#FF2A7F] group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── The Flywheel Visual ────────────────────────────────────── */
function FlywheelBar() {
  return (
    <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-3 flex items-center gap-3 text-white text-[12px] font-semibold">
      {[
        { icon: <BarChart3 size={14} />, label: 'Spot the metric' },
        { icon: <Stethoscope size={14} />, label: 'Diagnose the cause' },
        { icon: <BookOpen size={14} />, label: 'Practice the fix' },
        { icon: <TrendingUp size={14} />, label: 'Move the number' },
      ].map((s, i) => (
        <>
          <div key={s.label} className="flex items-center gap-2 text-white/80">
            {s.icon}
            <span>{s.label}</span>
          </div>
          {i < 3 && <ArrowRight size={12} className="text-white/30 shrink-0" />}
        </>
      ))}
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────── */
function EmptyDiagnosis() {
  return (
    <div className="h-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/60 text-center p-10">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center mb-4">
        <Stethoscope size={26} className="text-stone-500" />
      </div>
      <p className="text-[15px] font-black text-stone-700 mb-2">Select a funnel stage</p>
      <p className="text-[13px] text-stone-400 max-w-48 leading-relaxed">
        Click any stage on the left to see the diagnosis and training prescription.
      </p>
    </div>
  );
}

/* ─── Overview strip ─────────────────────────────────────────── */
function FunnelOverview({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
        <p className="text-[12px] font-bold text-stone-700 uppercase tracking-widest">Full Funnel Snapshot</p>
        <p className="text-[11px] text-stone-400">Based on 6-month Nooks data</p>
      </div>
      <div className="divide-y divide-stone-100">
        {STAGES.map(stage => {
          const health = healthFromGap(stage.teamAvg, stage.target);
          const h = HEALTH_CONFIG[health];
          const pct = Math.min((stage.teamAvg / stage.target) * 100, 100);
          return (
            <button
              key={stage.id}
              onClick={() => onSelect(stage.id)}
              className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-stone-50 transition-colors text-left group"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${h.dot} shrink-0`} />
              <div className="flex items-center gap-1.5 w-40 shrink-0">
                <span className="text-[12px] font-medium text-stone-500 truncate">{stage.from}</span>
                <ArrowRight size={10} className="text-stone-300" />
                <span className="text-[12px] font-bold text-stone-800 truncate">{stage.to}</span>
              </div>
              <div className="flex-1">
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${h.bar} transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
              <span className={`text-[12px] font-black tabular-nums w-10 text-right ${h.text}`}>{stage.teamAvg}{stage.unit}</span>
              <span className="text-[11px] text-stone-300 w-14 text-right">/ {stage.target}{stage.unit}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ml-1 ${h.badge} ${h.badgeText}`}>{h.label}</span>
              <ChevronRight size={13} className="text-stone-300 group-hover:text-stone-500 transition-colors" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function PipelineDoctor({ onNavigate }: PipelineDoctorProps) {
  const navigate = useNavigate();
  const { effectiveUser } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const selectedStage = STAGES.find(s => s.id === selected) ?? null;

  // Pull real closed-lost fatality data from Redemption database
  const fatalityPattern = useMemo(() => {
    const all = getAllDiscoverySessions();
    const myLosses = all.filter(s =>
      s.deal_stage === 'closed_lost' &&
      s.rep_id === effectiveUser?.id &&
      s.post_mortem_completed &&
      s.post_mortem_fatality
    );
    const counts: Record<string, number> = {};
    myLosses.forEach(d => {
      const f = d.post_mortem_fatality!;
      counts[f] = (counts[f] ?? 0) + 1;
    });
    const total = myLosses.length;
    const topFatality = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return { counts, total, topFatality: topFatality ? { name: topFatality[0], count: topFatality[1] } : null };
  }, [effectiveUser?.id]);

  const criticalCount = STAGES.filter(s => healthFromGap(s.teamAvg, s.target) === 'red').length;
  const amberCount = STAGES.filter(s => healthFromGap(s.teamAvg, s.target) === 'amber').length;

  return (
    <div className="h-full flex flex-col bg-stone-50 overflow-hidden">

      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative shrink-0 overflow-hidden">
        <div className="absolute inset-0 opacity-15"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #FF2A7F 0%, transparent 50%), radial-gradient(circle at 20% 80%, #6366f1 0%, transparent 40%)' }} />
        <div className="relative px-10 py-8 flex items-start justify-between gap-8">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF2A7F] to-[#c0006a] flex items-center justify-center shadow-lg shrink-0">
              <Stethoscope size={24} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">Enablement</span>
                <span className="text-slate-600">›</span>
                <span className="text-[11px] text-slate-300 font-semibold">Pipeline Doctor</span>
              </div>
              <h1 className="text-[26px] font-black text-white leading-none tracking-tight">Pipeline Doctor</h1>
              <p className="text-[13px] text-slate-400 mt-1.5 max-w-lg leading-relaxed">
                Find where your funnel is leaking, understand why, and go straight to the training that fixes it.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {criticalCount > 0 && (
              <div className="flex items-center gap-2 bg-rose-500/20 border border-rose-500/30 px-3 py-2 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="text-[12px] font-bold text-rose-300">{criticalCount} critical stage{criticalCount > 1 ? 's' : ''}</span>
              </div>
            )}
            {amberCount > 0 && (
              <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 px-3 py-2 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[12px] font-bold text-amber-300">{amberCount} below target</span>
              </div>
            )}
          </div>
        </div>

        {/* Flywheel bar */}
        <div className="px-10 pb-6">
          <FlywheelBar />
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-hidden px-8 py-6 flex flex-col gap-5">

        {/* Funnel overview strip (always visible) */}
        <FunnelOverview onSelect={id => setSelected(id)} />

        {/* Deal Autopsy Pattern — live from Redemption data */}
        {fatalityPattern.total > 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArchiveX size={14} className="text-rose-500" />
                <p className="text-[12px] font-bold text-stone-700 uppercase tracking-widest">Your Closed-Lost Pattern</p>
                <span className="text-[10px] text-stone-400">from {fatalityPattern.total} autopsied deal{fatalityPattern.total !== 1 ? 's' : ''}</span>
              </div>
              <button
                onClick={() => navigate('/team/redemption')}
                className="flex items-center gap-1.5 text-[11px] font-bold text-[#FF2A7F] hover:text-[#c0006a] transition-colors"
              >
                Review in Closed Lost Audit <ExternalLink size={11} />
              </button>
            </div>
            <div className="px-5 py-4 flex items-center gap-6">
              {/* Top fatality callout */}
              {fatalityPattern.topFatality && (
                <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                  <AlertTriangle size={18} className="text-rose-500 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-rose-600 uppercase tracking-widest">Top Killer</p>
                    <p className="text-[14px] font-black text-stone-900">{fatalityPattern.topFatality.name.replace(' Fatality', '')}</p>
                    <p className="text-[11px] text-stone-500">{fatalityPattern.topFatality.count} of {fatalityPattern.total} deals</p>
                  </div>
                </div>
              )}
              {/* Fatality bars */}
              <div className="flex-1 space-y-2">
                {Object.entries(fatalityPattern.counts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([fatality, count]) => {
                    const pct = Math.round((count / fatalityPattern.total) * 100);
                    const colorMap: Record<string, string> = {
                      'Priority Fatality': 'bg-amber-500',
                      'Value / Competition Fatality': 'bg-violet-500',
                      'Trust Fatality': 'bg-rose-500',
                      'Unknown Fatality': 'bg-stone-400',
                    };
                    const bar = colorMap[fatality] ?? 'bg-stone-400';
                    return (
                      <div key={fatality} className="flex items-center gap-3">
                        <span className="text-[11px] text-stone-600 w-36 shrink-0 truncate">{fatality.replace(' Fatality', '')}</span>
                        <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-stone-700 tabular-nums w-10 text-right">{count}x</span>
                        <span className="text-[10px] text-stone-400 tabular-nums w-8">{pct}%</span>
                      </div>
                    );
                  })}
              </div>
              {/* CTA */}
              <div className="text-center shrink-0">
                <p className="text-[10px] text-stone-400 mb-2">Fix your top killer</p>
                <button
                  onClick={() => {
                    // Navigate to the matching training page
                    const routeMap: Record<string, string> = {
                      'Priority Fatality': '/enablement/cold-call-playbook',
                      'Value / Competition Fatality': '/enablement/rep-workbook',
                      'Trust Fatality': '/enablement/rep-workbook',
                    };
                    const route = fatalityPattern.topFatality
                      ? (routeMap[fatalityPattern.topFatality.name] ?? '/enablement/rep-workbook')
                      : '/enablement/rep-workbook';
                    navigate(route);
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#FF2A7F] to-[#c0006a] text-white font-bold px-4 py-2.5 rounded-xl text-[12px] hover:from-[#e0246f] hover:to-[#a8005e] transition-all shadow-sm"
                >
                  <BookOpen size={13} /> Go Practice
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Diagnostic workspace */}
        <div className={`flex-1 overflow-hidden grid gap-5 ${selected ? 'grid-cols-[380px_1fr]' : 'grid-cols-1'}`}>

          {/* Left: stage list */}
          <div className="space-y-3 overflow-y-auto pr-1">
            {selected && (
              <>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1">Select a stage to diagnose</p>
                {STAGES.map(stage => (
                  <StageRow
                    key={stage.id}
                    stage={stage}
                    isSelected={selected === stage.id}
                    onClick={() => setSelected(s => s === stage.id ? null : stage.id)}
                  />
                ))}
              </>
            )}
          </div>

          {/* Right: diagnosis */}
          <div className="overflow-hidden">
            {selectedStage
              ? <DiagnosisPanel stage={selectedStage} onNavigate={onNavigate} />
              : (
                <div className="grid grid-cols-3 gap-4 h-full content-start">
                  {STAGES.map(stage => {
                    const health = healthFromGap(stage.teamAvg, stage.target);
                    const h = HEALTH_CONFIG[health];
                    return (
                      <button
                        key={stage.id}
                        onClick={() => setSelected(stage.id)}
                        className="rounded-2xl border-2 border-stone-200 bg-white hover:border-[#FF2A7F]/30 hover:shadow-md shadow-sm transition-all text-left p-5 group"
                      >
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest mb-3 ${h.badge} ${h.badgeText}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${h.dot}`} />
                          {h.label}
                        </div>
                        <div className="flex items-center gap-1.5 mb-3">
                          <span className="text-[12px] font-medium text-stone-500">{stage.from}</span>
                          <ArrowRight size={11} className="text-stone-300" />
                          <span className="text-[13px] font-bold text-stone-900">{stage.to}</span>
                        </div>
                        <div className="flex items-end gap-2 mb-3">
                          <span className={`text-[32px] font-black leading-none ${h.text}`}>{stage.teamAvg}{stage.unit}</span>
                          <span className="text-[13px] text-stone-400 mb-0.5">/ {stage.target}{stage.unit} target</span>
                        </div>
                        <MetricBar avg={stage.teamAvg} target={stage.target} />
                        {stage.fatalities.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {stage.fatalities.map(f => {
                              const meta = FATALITY_META[f];
                              return (
                                <span key={f} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${meta?.bg} ${meta?.color} ${meta?.border}`}>
                                  {f}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        <p className="mt-3 text-[11px] text-stone-500 leading-snug line-clamp-2">{stage.headline}</p>
                        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-[#FF2A7F] opacity-0 group-hover:opacity-100 transition-opacity">
                          Diagnose <ArrowRight size={11} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}
