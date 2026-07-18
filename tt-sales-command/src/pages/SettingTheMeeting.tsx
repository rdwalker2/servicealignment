import { useState } from 'react';
import { ArrowRight, Shield, ChevronRight, CheckCircle2, PhoneCall, RotateCcw } from 'lucide-react';
import { CleanPage, CleanCard, CleanPageHeader, Reveal } from '../components/ui/CleanUI';

// ── Types ──────────────────────────────────────────────────────────────────
interface Choice {
  text: string;
  coaching?: string;
  next: string | null;
}

interface DecisionNode {
  id: string;
  label: string;
  choices: Choice[];
}

interface Persona {
  id: string;
  label: string;
  emoji: string;
  role: string;
  color: string;
  opener: string;
  nodes: DecisionNode[];
}

// ── Personas ───────────────────────────────────────────────────────────────
const PERSONAS: Persona[] = [
  {
    id: 'hr-director',
    label: 'HR Director',
    emoji: '👩‍💼',
    role: 'Strategic buyer. Owns employer brand, headcount planning, and total cost of hiring.',
    color: '#a855f7',
    opener:
      '"Wanted to see if you\'re dealing with any hiring bottlenecks that are keeping you from hitting your headcount goals — or if you have any big talent initiatives coming up this quarter..."',
    nodes: [
      {
        id: 'start',
        label: 'Their Opening Response',
        choices: [
          { text: '"We don\'t have the budget for anything right now."', coaching: 'Budget objection — don\'t retreat, reframe around cost of vacancy.', next: 'no-budget' },
          { text: '"We\'re good. Everything\'s fine right now."', coaching: 'Status quo — gently surface a gap.', next: 'everything-fine' },
          { text: '"We already have an ATS we use."', coaching: 'Competitor — find the gap in adoption or output.', next: 'have-ats' },
          { text: '"I\'m too busy to talk right now."', coaching: 'Timing — earn 60 more seconds.', next: 'too-busy' },
        ],
      },
      {
        id: 'no-budget',
        label: 'Handle: No Budget',
        choices: [
          { text: '"Totally get it. So when a key role stays open 45+ days, how does that affect your team\'s productivity and morale?"', coaching: 'Rhetorical — let them feel the cost of indecision. Yes/No (rhetorical).', next: 'pain-close' },
        ],
      },
      {
        id: 'everything-fine',
        label: 'Handle: We\'re Good',
        choices: [
          { text: '"Have you ever had a strong candidate accept another offer because your process moved too slow?"', coaching: 'Yes/No (rhetorical) — most HR leaders have felt this.', next: 'pain-close' },
        ],
      },
      {
        id: 'have-ats',
        label: 'Handle: Have an ATS',
        choices: [
          { text: '"Understood. Are your hiring managers actually logging in and giving feedback, or is recruiting still chasing them for updates?"', coaching: 'Surfaces the real problem: adoption vs. output.', next: 'pain-close' },
        ],
      },
      {
        id: 'too-busy',
        label: 'Handle: Too Busy',
        choices: [
          { text: '"Understood — hiring is commonly deprioritized until it becomes a crisis. When is a better time?"', coaching: 'Validate and reschedule.', next: 'schedule' },
        ],
      },
      {
        id: 'pain-close',
        label: 'Pain Surfaced → Close for Meeting',
        choices: [
          { text: '"Why don\'t I put together a quick look at where your biggest hiring bottlenecks are? 20 minutes — if it\'s not valuable, I\'ll be the first to tell you. Deal?"', coaching: 'Low commitment, high value. This is the close.', next: null },
        ],
      },
      {
        id: 'schedule',
        label: 'Schedule the Follow-up',
        choices: [
          { text: '"Sounds good. I\'ll send a calendar invite over — talk then."', coaching: 'Send the invite immediately. Don\'t wait.', next: null },
        ],
      },
    ],
  },
  {
    id: 'ta-manager',
    label: 'TA Manager',
    emoji: '🎯',
    role: 'Operational buyer. Owns recruiter efficiency, time-to-fill, candidate pipeline, and hiring manager experience.',
    color: '#3b82f6',
    opener:
      '"Wanted to see if your recruiting team is dealing with any bottlenecks slowing down time-to-fill — or if you have any goals around improving your process or candidate experience..."',
    nodes: [
      {
        id: 'start',
        label: 'Their Opening Response',
        choices: [
          { text: '"We don\'t have the budget right now."', coaching: 'Reframe around the cost of slow hiring.', next: 'no-budget' },
          { text: '"We\'re good. Everything\'s running fine."', coaching: 'Challenge the status quo without being aggressive.', next: 'everything-fine' },
          { text: '"We already have an ATS."', coaching: 'Dig into whether it\'s actually working.', next: 'have-ats' },
          { text: '"I\'m too busy — can you call back?"', coaching: 'Earn 30 more seconds.', next: 'too-busy' },
        ],
      },
      {
        id: 'no-budget',
        label: 'Handle: No Budget',
        choices: [
          { text: '"I get it. If your recruiters are spending a big chunk of their day on manual tasks instead of talking to candidates, does that hurt your fill rate?"', coaching: 'Yes/No (rhetorical) — connects time waste to business impact.', next: 'pain-close' },
        ],
      },
      {
        id: 'everything-fine',
        label: 'Handle: Everything\'s Fine',
        choices: [
          { text: '"Good to hear. Are your recruiters sourcing passive candidates, or mostly just screening inbound applicants?"', coaching: 'Yes/No (rhetorical) — reveals if they\'re truly proactive or reactive.', next: 'pain-close' },
        ],
      },
      {
        id: 'have-ats',
        label: 'Handle: Have an ATS',
        choices: [
          { text: '"Are your hiring managers actually giving feedback inside the system, or is recruiting still chasing them down for updates?"', coaching: 'Yes/No (rhetorical) — surfaces the adoption gap.', next: 'pain-close' },
        ],
      },
      {
        id: 'too-busy',
        label: 'Handle: Too Busy',
        choices: [
          { text: '"Totally get it — recruiting never really slows down. When would be a better 15 minutes?"', coaching: 'Validate and lock in a time.', next: 'schedule' },
        ],
      },
      {
        id: 'pain-close',
        label: 'Pain Surfaced → Close for Meeting',
        choices: [
          { text: '"Let me show you how TA teams at your scale are cutting time-to-fill by 30%+. 20 minutes, very focused. I\'ll send a calendar invite — deal?"', coaching: 'Benchmark-driven close. Specific outcome = specific ask.', next: null },
        ],
      },
      {
        id: 'schedule',
        label: 'Schedule the Follow-up',
        choices: [
          { text: '"Sounds good. I\'ll send a calendar invite right now."', coaching: 'Send it while you\'re still on the call.', next: null },
        ],
      },
    ],
  },
  {
    id: 'ceo-founder',
    label: 'CEO / Founder',
    emoji: '🚀',
    role: 'Executive decision-maker (SMB). Hiring is a growth lever — they care about speed, cost, and whether it\'s slowing the business down.',
    color: '#ef4444',
    opener:
      '"Wanted to see if hiring is keeping you from growing as fast as you want to — are there any open roles right now that are slowing your team down or holding back a key initiative?"',
    nodes: [
      {
        id: 'start',
        label: 'Their Opening Response',
        choices: [
          { text: '"We don\'t have the budget."', coaching: 'Calculate the real cost of an open seat.', next: 'no-budget' },
          { text: '"We\'re fine. HR handles it."', coaching: 'Redirect to whether HR is actually equipped.', next: 'delegate' },
          { text: '"We already have something in place."', coaching: 'Find the gap in output.', next: 'have-ats' },
          { text: '"Not a good time."', coaching: 'Short, respectful pivot.', next: 'too-busy' },
        ],
      },
      {
        id: 'no-budget',
        label: 'Handle: No Budget',
        choices: [
          { text: '"Totally. What\'s it costing you to have that open role sit unfilled for another month — in lost revenue, team burnout, or customers waiting?"', coaching: 'Rhetorical — forces them to calculate the cost of indecision themselves.', next: 'pain-close' },
        ],
      },
      {
        id: 'delegate',
        label: 'Handle: HR / Someone Handles It',
        choices: [
          { text: '"Makes sense. Are they set up with the right tools to hire at the pace your business actually needs right now?"', coaching: 'Doesn\'t challenge the delegation — questions whether they\'re equipped.', next: 'pain-close' },
        ],
      },
      {
        id: 'have-ats',
        label: 'Handle: Have Something in Place',
        choices: [
          { text: '"Got it. Is it helping you fill roles fast enough to hit your growth targets, or does hiring still feel like a bottleneck?"', coaching: 'Yes/No (rhetorical) — connects tools to business outcomes.', next: 'pain-close' },
        ],
      },
      {
        id: 'too-busy',
        label: 'Handle: Not a Good Time',
        choices: [
          { text: '"Completely get it. When\'s a better 10 minutes — I\'ll be very brief."', coaching: 'Keep it short. Respect their time above all.', next: 'schedule' },
        ],
      },
      {
        id: 'pain-close',
        label: 'Pain Surfaced → Close for Meeting',
        choices: [
          { text: '"Let me show you how companies your size are cutting time-to-hire in half without adding headcount. Very quick, very specific to your situation. I\'ll send a calendar invite."', coaching: 'Outcome-first close. No commitment, all upside.', next: null },
        ],
      },
      {
        id: 'schedule',
        label: 'Schedule the Follow-up',
        choices: [
          { text: '"Sounds good — I\'ll send the invite right now so it\'s on the calendar."', coaching: 'Send immediately. Founders forget fast.', next: null },
        ],
      },
    ],
  },
  {
    id: 'ops-manager',
    label: 'Ops / Office Mgr',
    emoji: '⚙️',
    role: 'Gatekeeper and sometimes budget holder in small SMBs. Owns logistics, coordinates hiring, and influences the decision.',
    color: '#14b8a6',
    opener:
      '"Wanted to see if you\'re dealing with any headaches around coordinating the hiring process — like keeping track of candidates, getting feedback from managers, or just keeping things organized when you\'re filling multiple roles..."',
    nodes: [
      {
        id: 'start',
        label: 'Their Opening Response',
        choices: [
          { text: '"We don\'t have the budget for anything like that."', coaching: 'Educate on ROI — they may not own the budget decision.', next: 'no-budget' },
          { text: '"We\'re good. We use spreadsheets / email."', coaching: 'Surface the pain that comes with manual coordination.', next: 'everything-fine' },
          { text: '"The CEO / HR person handles all of that."', coaching: 'Get the referral or set the next step.', next: 'delegate' },
          { text: '"I\'m pretty slammed right now."', coaching: 'Short and respectful.', next: 'too-busy' },
        ],
      },
      {
        id: 'no-budget',
        label: 'Handle: No Budget',
        choices: [
          { text: '"Totally understandable. When you\'re juggling multiple open roles, how do you keep track of where everyone is in the process — does that ever get chaotic?"', coaching: 'Yes/No (rhetorical) — makes the pain tangible for their day-to-day.', next: 'pain-close' },
        ],
      },
      {
        id: 'everything-fine',
        label: 'Handle: Managing With What We Have',
        choices: [
          { text: '"Got it. Have you ever had a great candidate fall through the cracks because of slow follow-up or miscommunication between the hiring manager and you?"', coaching: 'Yes/No (rhetorical) — very relatable for coordinators.', next: 'pain-close' },
        ],
      },
      {
        id: 'delegate',
        label: 'Handle: Someone Else Owns It',
        choices: [
          { text: '"Totally makes sense. Would it be okay if I reached out to them directly? And even a quick 10 minutes with you to understand how the process works today would be super helpful."', coaching: 'Get the referral AND keep them engaged as a champion.', next: 'pain-close' },
        ],
      },
      {
        id: 'too-busy',
        label: 'Handle: Too Busy',
        choices: [
          { text: '"Completely get it. Hiring coordination never really slows down. When would be a better 10 minutes?"', coaching: 'Validate their reality and lock in a time.', next: 'schedule' },
        ],
      },
      {
        id: 'pain-close',
        label: 'Pain Surfaced → Close for Meeting',
        choices: [
          { text: '"Why don\'t I show you how other companies your size keep the whole process in one place — managers, candidates, feedback, all of it. 20 minutes, I\'ll show you your most chaotic role first. I\'ll send a calendar invite."', coaching: 'Make it practical and low-pressure. They care about making their life easier.', next: null },
        ],
      },
      {
        id: 'schedule',
        label: 'Schedule the Follow-up',
        choices: [
          { text: '"Sounds good — I\'ll send a calendar invite over so we\'re locked in."', coaching: 'Send it immediately.', next: null },
        ],
      },
    ],
  },
];

// ── 3 Waves ────────────────────────────────────────────────────────────────
const THREE_WAVES = [
  {
    wave: 1,
    title: 'The Direct Ask',
    script: '"Do you have a couple of minutes to sit down and talk about your hiring challenges? Any goals or problems you\'re trying to solve this quarter?"',
    note: 'If they say they have no problem and just want to be left alone...',
  },
  {
    wave: 2,
    title: 'The Surprised Follow-up',
    script: '"Really? There aren\'t any future hiring challenges you\'re worried about, or talent goals you\'re working toward at all?"',
    note: 'Act genuinely surprised. If they hold their ground and say "No" again...',
  },
  {
    wave: 3,
    title: 'The Reveal Question',
    script: '"Ok — when was the last time you actually looked at your time-to-fill, cost-per-hire, or how many candidates are dropping out of your process?"',
    note: 'If they haven\'t looked at these metrics, offer a free benchmark.',
    closer:
      '"Would it be valuable if I ran a quick benchmark showing how your hiring compares to companies your size? No cost, no pitch — just data."',
  },
];

// ── Component ──────────────────────────────────────────────────────────────
export default function SettingTheMeeting() {
  const [activePersonaId, setActivePersonaId] = useState(PERSONAS[0].id);
  const [currentNodeId, setCurrentNodeId] = useState('start');
  const [history, setHistory] = useState<string[]>([]);

  const persona = PERSONAS.find(p => p.id === activePersonaId)!;
  const currentNode = persona.nodes.find(n => n.id === currentNodeId);

  const selectPersona = (id: string) => {
    setActivePersonaId(id);
    setCurrentNodeId('start');
    setHistory([]);
  };

  const navigate = (nextId: string) => {
    setHistory(h => [...h, currentNodeId]);
    setCurrentNodeId(nextId);
  };

  const goBack = (targetId: string) => {
    const idx = history.indexOf(targetId);
    if (idx >= 0) {
      setHistory(h => h.slice(0, idx));
      setCurrentNodeId(targetId);
    } else {
      setCurrentNodeId('start');
      setHistory([]);
    }
  };

  const reset = () => { setCurrentNodeId('start'); setHistory([]); };

  const isTerminal = !currentNode;

  // breadcrumb labels
  const breadcrumbs = ['Opening', ...history.map(id => {
    const n = persona.nodes.find(x => x.id === id);
    return { id, label: n?.label ?? id };
  })];

  return (
    <CleanPage className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Header ── */}
        <Reveal>
          <CleanPageHeader
            variant="hero"
            title="Scheduling the Meeting"
            subtitle="Pick the persona you're calling on. Follow the tree step-by-step to set the meeting — every branch ends with a close."
            icon={
              <div className="w-12 h-12 rounded-2xl bg-stone-900/10 text-stone-900 flex items-center justify-center mx-auto mb-2 shadow-sm">
                <PhoneCall className="w-6 h-6" />
              </div>
            }
          />
        </Reveal>

        {/* ── Persona Selector ── */}
        <Reveal delay={0.05}>
          <div className="flex gap-2 flex-wrap">
            {PERSONAS.map(p => (
              <button
                key={p.id}
                onClick={() => selectPersona(p.id)}
                className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border ${
                  activePersonaId === p.id
                    ? 'bg-white shadow-md border-stone-300 text-stone-800'
                    : 'bg-white/50 border-stone-200/60 text-stone-500 hover:bg-white hover:text-stone-700'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: p.color }}
                />
                {p.emoji} {p.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* ── Decision Tree Card ── */}
        <Reveal delay={0.1}>
          <CleanCard className="p-0 overflow-hidden">

            {/* Header */}
            <div
              className="px-6 py-5 border-b border-stone-200/60 flex items-start justify-between gap-4"
              style={{ background: `${persona.color}08` }}
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: persona.color }}>
                  Calling On
                </p>
                <h2 className="text-xl font-bold text-stone-800">
                  {persona.emoji} {persona.label}
                </h2>
                <p className="text-sm text-stone-500 mt-0.5">{persona.role}</p>
              </div>
              {(currentNodeId !== 'start' || history.length > 0) && (
                <button
                  onClick={reset}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700 transition-colors shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            <div className="p-6 space-y-5">

              {/* Opener */}
              {currentNodeId === 'start' && history.length === 0 && (
                <div
                  className="rounded-xl p-5 border-l-4 bg-stone-50 border border-stone-200"
                  style={{ borderLeftColor: persona.color }}
                >
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Your Opening Line</p>
                  <p className="text-base leading-relaxed font-medium italic" style={{ color: persona.color }}>
                    {persona.opener}
                  </p>
                </div>
              )}

              {/* Breadcrumb */}
              {history.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {breadcrumbs.map((bc, i) => {
                    const isLast = i === breadcrumbs.length - 1;
                    return (
                      <span key={i} className="flex items-center gap-1.5">
                        {!isLast ? (
                          <>
                            <button
                              onClick={() => goBack(typeof bc === 'string' ? 'start' : bc.id)}
                              className="text-[11px] text-stone-400 hover:text-stone-700 transition-colors font-medium"
                            >
                              {typeof bc === 'string' ? bc : bc.label}
                            </button>
                            <span className="text-stone-300 text-xs">›</span>
                          </>
                        ) : (
                          <span className="text-[11px] font-bold text-stone-700">
                            {typeof bc === 'string' ? bc : bc.label}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Current Node */}
              {currentNode && !isTerminal && (
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">
                    → {currentNode.label}
                  </p>
                  <div className="space-y-2">
                    {currentNode.choices.map((choice, i) => (
                      <button
                        key={i}
                        onClick={() => choice.next ? navigate(choice.next) : undefined}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                          choice.next
                            ? 'border-stone-200/60 hover:border-stone-300 hover:bg-stone-50 cursor-pointer'
                            : 'border-emerald-200 bg-emerald-50 cursor-default'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 mt-0.5"
                          style={{
                            background: choice.next ? `${persona.color}15` : 'rgba(34,197,94,0.15)',
                          }}
                        >
                          {choice.next ? '💬' : '🎯'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium leading-relaxed ${choice.next ? 'text-stone-800' : 'text-emerald-800'}`}>
                            {choice.text}
                          </p>
                          {choice.coaching && (
                            <p className="text-xs text-stone-400 mt-1 italic">{choice.coaching}</p>
                          )}
                        </div>
                        {choice.next ? (
                          <ChevronRight className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Terminal — meeting booked */}
              {isTerminal && (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-3xl">
                    ✅
                  </div>
                  <h3 className="font-bold text-stone-800 text-xl mb-2">Meeting Booked</h3>
                  <p className="text-stone-500 text-sm mb-5 max-w-sm mx-auto">
                    Send the calendar invite immediately — while you still have them on the phone. Don't wait.
                  </p>
                  <button
                    onClick={reset}
                    className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-colors"
                  >
                    ↺ Run Another Scenario
                  </button>
                </div>
              )}
            </div>
          </CleanCard>
        </Reveal>

        {/* ── The 3 Waves ── */}
        <Reveal delay={0.15}>
          <CleanCard className="p-0 overflow-hidden">
            <div className="bg-stone-50 border-b border-stone-200/60 px-6 py-4">
              <h3 className="font-bold text-lg flex items-center gap-2 text-stone-800">
                <Shield className="w-5 h-5 text-stone-700" />
                The 3 Waves — When They Won't Budge
              </h3>
              <p className="text-stone-500 text-sm mt-1">
                Use this escalation if a prospect pushes back on meeting. Each wave challenges whether they actually know enough to hold their position.
              </p>
            </div>
            <div className="divide-y divide-stone-100">
              {THREE_WAVES.map(wave => (
                <div key={wave.wave} className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="w-8 h-8 rounded-full bg-stone-900/10 text-stone-900 flex items-center justify-center text-sm font-bold shrink-0">
                      {wave.wave}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-stone-800 mb-2">{wave.title}</h4>
                      <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 mb-3">
                        <p className="text-stone-700 italic">{wave.script}</p>
                      </div>
                      <p className="text-xs text-stone-500 flex items-center gap-1.5">
                        <ArrowRight className="w-3 h-3" /> {wave.note}
                      </p>
                      {wave.closer && (
                        <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                          <p className="text-sm text-emerald-800 font-medium">{wave.closer}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CleanCard>
        </Reveal>

      </div>
    </CleanPage>
  );
}
