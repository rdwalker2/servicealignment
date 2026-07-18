// ============================================================
// CallMode.tsx — Call Companion (BAP-Diagram Layout)
// Mirrors the Buyer's Action Plan from training exactly:
// Call Opener → 4 sections per CP → 1-10 gate → Y/N checkpoint
// All coaching pulled directly from training transcripts.
// ============================================================

import { useState, useCallback, useMemo } from 'react';
import { Check, Copy, ClipboardCopy, ChevronDown, ChevronRight, Phone } from 'lucide-react';
import type { DiscoverySession } from '../../lib/discoveryDatabase';
import { computeBAPAnswers, getCheckpointScore, scoreMEDDPICC } from '../../lib/discoveryDatabase';
import { MAX_CP_SCORE } from './repWorkspaceConstants';
import { CallNotesLog } from './CallNotesLog';
import { TT_PAINS } from './PainDiscoveryModule';
import { MEDDPICCTab } from './MEDDPICCTab';
import { DealTimeline } from './DealTimeline';

/* ------------------------------------------------------------------ */
/*  Types & Props                                                      */
/* ------------------------------------------------------------------ */

interface CallModeProps {
  session: DiscoverySession;
  onSessionChange: (session: DiscoverySession) => void;
  selectedPains: string[];
  onPainChange: (pains: string[]) => void;
  selectedPersona: string | null;
  onPersonaChange: (persona: string) => void;
  onSwitchToFull: () => void;
}

interface BAPSection {
  key: string;
  label: string;
  core: string;
  coaching: string;
  fieldId: string;
  probes?: string[];
  type?: 'text' | 'napkin';
  mode?: 'discover' | 'present'; // CP3 uses 'present'
  placeholder?: string;
}

interface GateQuestion {
  fieldId: string;
  question: string;
  checkpointPrompt: string; // The binary Y/N question from training
  recoveryQuestion: string; // What to ask if they say No
  mismatchCoaching?: string;
  invertScale?: boolean;    // CP2: low score = good
}

/* ------------------------------------------------------------------ */
/*  Call Opener (from training 5.2 - Taking Leadership Position)       */
/* ------------------------------------------------------------------ */

const CALL_OPENER = {
  script: `Hello {name}! How are you?

So you're located in {city}? How's it going out there?

Great. So are you ready to hop into the call?

Ok, well this is how these calls go…

I'll start off by asking you some questions to get an understanding of what's going on. Ultimately though, this time is for you, and the goal is that you come out of this conversation with a plan of action… even if that plan doesn't include us working together.

I'm not here to just pitch you our stuff. We want to support you in reaching the outcomes you want to reach.

If it does sound like we can help, and if we're a good fit together, I'll explain exactly what we've got to offer and how it will help you. Then you can ask me any questions you may have, and at the end you can make a decision whether you want to be a part of it or not.

Sound good?`,
  coaching: 'Light rapport → Set agenda → Get confirmation. Don\'t overdo rapport (comes off as manipulative). The goal: take leadership position so YOU lead them to outcomes they wouldn\'t normally achieve.',
};

/* ------------------------------------------------------------------ */
/*  CP1: Do They Need to Act? (Urgency Test)                          */
/*  Training: 5.3 Buyer's Objective, 5.4 Decision Makers,             */
/*           5.5 Current Reality, 5.6 Business Disruption              */
/* ------------------------------------------------------------------ */

const CP1_SECTIONS: BAPSection[] = [
  {
    key: 'objective',
    label: 'Their Objective',
    core: '"When people take time to hop on these calls with me, they usually have a problem they\'re trying to solve or a goal they\'re trying to achieve. Which is it for you?"',
    coaching: 'This answer is the small domino that knocks down all the bigger dominos. They scheduled this call for a reason — that\'s a HUGE tell. Identify the problem succinctly, no matter how long their answer is.',
    fieldId: 'q1',
    probes: [
      '💡 Three Waves if they\'re vague:',
      'Wave 1: "Which is it — a problem you\'re solving or a goal you\'re trying to achieve?"',
      'Wave 2 (mild disbelief): "Really? There\'s no future problem you\'re trying to avoid or goal you\'re trying to achieve with your recruiting?"',
      'Wave 3 (alternative angle): "When was the last time you evaluated your hiring process end to end?"',
      '— Also try: Walk me through what happens when you get a new application today, start to finish.',
      '— What\'s eating most of your time in the recruiting process right now?',
      '— If you could wave a magic wand and fix one thing, what would it be?',
    ],
    placeholder: 'Capture their problem/goal in their exact words...',
  },
  {
    key: 'decision_makers',
    label: 'Decision Makers',
    core: '"Who is ultimately responsible for solving this [repeat their problem]? And who ultimately will be making the decision on how this gets solved?"',
    coaching: 'This question MUST stay connected to their objective — think of it like a Venn diagram. If they stay connected, it works seamlessly every time. We\'re building a plan, and that plan is only as good as the inputs we get.',
    fieldId: 'q2',
    probes: [
      '"If you think it\'s important to bring [name] into this call so we\'re all aligned on your current situation, we can bring them on now — or I\'ll create a summary they can review. Which works best?"',
      '"What\'s your process for purchasing solutions like this?"',
    ],
    placeholder: 'Who owns the problem? Who decides? Who else needs to be involved?',
  },
  {
    key: 'current_reality',
    label: 'Current Reality',
    core: '"What else have you guys done or what are you currently doing to solve this? And why is it not working at the level needed?"',
    coaching: 'Unpack frustration with past efforts. This starts uncovering the real problem for diagnosis AND starts them coming to terms with their low ability to solve this alone. If they haven\'t tried anything — why not? Is it really not painful enough?',
    fieldId: 'q3',
    probes: [
      '"Have you guys ever purchased something like this before?"',
      'If YES: "What worked well? What didn\'t work well?" (critical info)',
      'If NO: "Why not?" (tells you if they don\'t see the pain)',
      '— How are hiring managers giving feedback on candidates today?',
      '— What does your mobile career page look like?',
      '— How many separate systems are involved in your hiring process?',
      '— Who else is in the mix? (competitors being evaluated)',
    ],
    placeholder: 'What have they tried? Why hasn\'t it worked? Current tools/processes?',
  },
  {
    key: 'priority_urgency',
    label: 'Priority & Urgency',
    core: '"I want to understand so we can assess together the level of priority this needs to take. As far as you can see, what is the worst thing that will happen if [their problem] doesn\'t get solved? Realistically speaking."',
    coaching: 'We are logically progressing to "what happens if they keep failing." Probe the REALISTIC worst case — not far-fetched. Get them to paint the picture of consequences: lost hires, wasted time, missed goals, team burnout.',
    fieldId: 'q4a',
    probes: [
      '🚨 Probe at least 2-3 times!',
      '"Tell me more about that..."',
      '"What did you mean when you said [mirror their words]?"',
      '"What would happen if the issue isn\'t fixed correctly the first time?"',
      '"What would happen if you choose not to do anything at all?"',
      '— What goals would be at risk?',
      '— How would this affect the team day-to-day?',
    ],
    placeholder: 'What\'s the realistic worst case? Consequences? Who/what is impacted?',
  },
];

/* ------------------------------------------------------------------ */
/*  CP2: Do They Need Outside Help? (Gap Test)                        */
/*  Training: 6.1 Other Providers, 6.2 Problem Diagnosis,             */
/*           4.4 Price Anchoring, 6.3 Buying Process,                  */
/*           6.4 Budget & Timeline / 4.5 Price Sensitivity             */
/* ------------------------------------------------------------------ */

const CP2_SECTIONS: BAPSection[] = [
  {
    key: 'other_providers',
    label: 'Other Providers',
    core: '"Are you currently working with any other Provider or recruiting platform? What\'s your current system?"',
    coaching: 'Identify their current solution and why it hasn\'t fully resolved their issues. Watch for the "devil you know" psychology — prospects fear switching because of unknown problems. Address that directly.',
    fieldId: 'q5',
    probes: [
      '"What issues has your current system been unable to address or resolve completely?"',
      '"What has been the impact of these unresolved issues on your hiring?"',
      '"What are you guys paying currently?" (context for price anchoring)',
      'If satisfied: "I understand — what made you take this call if things are working?"',
    ],
    placeholder: 'Current Provider? What\'s not working? Contract end date?',
  },
  {
    key: 'problem_diagnosis',
    label: 'Problem Diagnosis',
    core: '"Typically, what I see in situations like this is [share your expert perspective on the broader problem]. How does this align with what you\'re experiencing?"',
    coaching: '🔺 PRICE TRINITY Step 1: BIGGER PROBLEM. You\'re the doctor now — share your expert diagnosis. Elevate beyond their surface-level symptoms to the root cause. "You think this is your problem, when really THIS is the problem."',
    fieldId: 'q6',
    probes: [
      '"Based on what you\'ve shared, here\'s what I believe is actually causing this..." (share expert view)',
      '"Do they acknowledge they need outside help to solve this?"',
      'Key: Create alignment between the BIGGER problem and their pain points',
      '"How many locations/divisions/brands are involved?" (scoping)',
    ],
    placeholder: 'Root cause diagnosis? Do they agree with the bigger problem?',
  },
  {
    key: 'expected_outcomes',
    label: 'Expected Outcomes',
    core: '"So we\'ve established the problems needing to be solved. Let\'s take a look at what outcomes you would expect if these were solved — not by us, but by anyone. What would the ROI be?"',
    coaching: '🔺 PRICE TRINITY Step 2: PRICE ANCHORING. Use "Back of the Napkin Math" — keep it simple and believable. The training warns: complex ROI calculators confuse prospects and reduce confidence. Use THEIR conservative numbers. Stack KPIs until you hit 5-10x ROI.',
    fieldId: 'q3',
    type: 'napkin',
    probes: [
      '💡 Back of the Napkin Math flow:',
      '1. "How are you measuring that this problem exists?" (identify the KPI)',
      '2. "What\'s the current number?" (baseline)',
      '3. "What would it CONSERVATIVELY improve to if solved?" (target)',
      '4. Calculate the gap = ROI per unit, scale it out annually',
      '5. If one KPI isn\'t enough → STACK ATTACK: add more KPIs!',
      '— Time-to-fill: "What is it now? What should it be? × hires/yr = days saved"',
      '— Agency spend: "How many agency hires? × avg fee = annual agency cost"',
      '— Admin time: "Hours/week on manual tasks? × hourly cost = annual waste"',
      '— Quality of hire: "Cost of a bad hire? × turnover rate = annual impact"',
      '💡 5-10x Rule: Prospects expect 5-10x ROI. If your ROI number is 5-10x our price, there should be zero price resistance.',
    ],
    placeholder: 'Capture the napkin math: KPI → baseline → target → gap → annual ROI...',
  },
  {
    key: 'buying_process',
    label: 'Buying Process',
    core: '"Can you walk me through the process for approving a purchase like this? Who needs to be involved?"',
    coaching: 'Identify all steps required for approval. Determine: reactive buyer (only acts on problems) or proactive buyer (acts in advance)? "Time kills all deals" — understand their internal process so you can align with it and speed it up.',
    fieldId: 'q7',
    probes: [
      '"What HRIS/payroll system are you on?" (scopes integration needs)',
      'If they don\'t know their process: Offer to help map it out',
      '"Who will be reviewing and approving the solution?"',
    ],
    placeholder: 'Approval process? Reactive or proactive buyer? Key steps?',
  },
  {
    key: 'budget_timelines',
    label: 'Budget & Timelines',
    core: '"Based on the ROI of roughly [X] over the next 6-12 months… what would you typically invest to create that kind of outcome?"',
    coaching: '🔺 PRICE TRINITY Step 3: PRICE SENSITIVITY. Link directly to the ROI you just calculated. If they say "I don\'t know" → "What kind of ROI do you typically expect? 3x? 5x? 20x?" (polarize). Then back into their price range. Work BACKWARDS from their desired date.',
    fieldId: 'q8',
    probes: [
      '💡 Key: You\'re not asking "how much do you want to spend?" — you\'re asking in context of the outcome.',
      'If they won\'t give a number: "What ROI do you typically expect? 3x, 5x, 20x?" Then back into range.',
      'If unrealistic ("20x"): "Is that realistic? Do you typically get that return in this area?"',
      '"When would you ideally like to have a new system in place?"',
      '"To meet your goal of going live by [date], we\'d need the contract signed by [date]."',
    ],
    placeholder: 'Budget range? Expected ROI multiple? Desired go-live date?',
  },
];

/* ------------------------------------------------------------------ */
/*  CP3: Do We Have the Best Solution? (Solution Roadmap)             */
/*  Training: 7.1 Proven Results, 7.2 Clear Solution,                 */
/*           7.3 Delivery & Timelines                                  */
/*  NOTE: CP3 is PRESENTING mode, not discovery mode.                  */
/* ------------------------------------------------------------------ */

const CP3_SECTIONS: BAPSection[] = [
  {
    key: 'proven_results',
    label: 'Proven Results',
    mode: 'present',
    core: 'Show them we have a proven history of solving their specific problem. Share case studies, metrics, and data that match their situation.',
    coaching: 'Don\'t just say "we\'ve been around X years." Show SPECIFIC, MEASURABLE outcomes for similar companies. Tailor case studies to THEIR industry, size, and pains. "Most of our clients in [their industry] experience [specific metric]." Use the Discovery Room case study matcher.',
    fieldId: 'q9',
    probes: [
      'Share case studies that match their industry, company size, and pain points',
      'Lead with metrics: "Companies like yours see X% improvement in time-to-fill"',
      'If they\'re skeptical: "Here\'s a client in [their industry] who had the exact same challenge..."',
    ],
    placeholder: 'Which case studies did you share? How did they react? What resonated?',
  },
  {
    key: 'clear_solution',
    label: 'A Clear Solution',
    mode: 'present',
    core: 'Be crystal clear on how Service Alignment solves THEIR specific problems. No jargon. No feature tours. Laser-focused on their pain.',
    coaching: 'Connect back to the problem diagnosis from CP2. Don\'t make them "burn calories" understanding how it works — keep it simple. Introduce your "secret sauce" — what makes TT unique. They\'re NOT wondering if they need it (CP1) or if they can do it alone (CP2). Just: are WE the best?',
    fieldId: 'q10',
    probes: [
      'Connect each feature to a specific pain they told you about',
      '"Earlier you mentioned [pain] — here\'s exactly how we solve that..."',
      '"Can we help you build the internal business case for leadership?"',
      'What\'s your "secret sauce" demo moment? Lead with it.',
    ],
    placeholder: 'What did you demo? What features mapped to their pains? Their reaction?',
  },
  {
    key: 'delivery_timelines',
    label: 'Delivery & Timelines',
    mode: 'present',
    core: 'Align on key delivery milestones, success metrics, and what they should expect. Paint the dream vision of what partnering with TT looks like.',
    coaching: 'Define specific, measurable success metrics. Walk through implementation timeline step by step. Address past bad experiences with other vendors. "Paint the dream vision" — imagine a smooth, hassle-free process where every step is clearly communicated.',
    fieldId: 'q11',
    probes: [
      '"Here\'s what the first 90 days look like with us..."',
      '"What does success look like for you 6 months from now?"',
      '"You mentioned your last vendor was [pain] — here\'s how we avoid that"',
      'Key points of value: when will they see specific results?',
    ],
    placeholder: 'Success metrics defined? Implementation timeline discussed? Their vision?',
  },
];

/* ------------------------------------------------------------------ */
/*  Checkpoint Gates                                                   */
/* ------------------------------------------------------------------ */

const GATE_QUESTIONS: Record<number, GateQuestion> = {
  1: {
    fieldId: 'q1b',
    question: 'Scale of 1-10, how much of a priority is this?',
    checkpointPrompt: 'Is this problem causing enough pain for them to take action?',
    recoveryQuestion: '"So it sounds like this might not be the top priority right now — can I ask then, why are you spending time researching solutions? Why are you looking to change anything?"',
    mismatchCoaching: 'If pain is HIGH but score is LOW: "I thought that number was going to be much higher based on the expected outcomes. Can you tell me more?"\n\nIf pain is LOW but score is HIGH: "Wow, I was expecting this to be lower. Can you tell me more?"',
  },
  2: {
    fieldId: 'q8c',
    question: 'Scale of 1-10, how confident are you your team can solve this without outside help?',
    invertScale: true,
    checkpointPrompt: 'Do they need new or outside help to solve this?',
    recoveryQuestion: '"What specifically gives you that confidence, given everything we\'d discussed about the challenges your current resources have had?"',
    mismatchCoaching: 'LOW score (1-3) = They need outside help = CP2 is passing.\n\nHIGH score (8-10) = They think they can do it alone. Probe: "If your current resources could have solved this, they would have by now. What\'s different this time?"',
  },
  3: {
    fieldId: 'q12',
    question: 'Scale of 1-10, how confident are you this is the right solution for you?',
    checkpointPrompt: 'Are we undeniably the best solution for them?',
    recoveryQuestion: '"What would need to change to make that a 10? What\'s holding you back from full confidence?"',
  },
};

const CHECKPOINTS = [
  { num: 1, label: 'CP1 · Do They Need to Act?', subtitle: 'Urgency Test', color: 'bg-sky-500', sections: CP1_SECTIONS },
  { num: 2, label: 'CP2 · Do They Need Outside Help?', subtitle: 'Gap Test', color: 'bg-amber-500', sections: CP2_SECTIONS },
  { num: 3, label: 'CP3 · Do We Have the Best Solution?', subtitle: 'Solution Roadmap', color: 'bg-emerald-500', sections: CP3_SECTIONS },
] as const;

const D4_CHECKS = [
  { key: 'urgent_priority', label: 'Urgent Priority', script: '"Are we still aligned this is an urgent priority?"' },
  { key: 'resources_insufficient', label: 'Resources Insufficient', script: '"Aligned your existing resources are not sufficient?"' },
  { key: 'problems_solutions', label: 'Problems & Solutions', script: '"Aligned on the problems & how we solve them?"' },
  { key: 'roi_sufficient', label: 'ROI Sufficient', script: '"Aligned on outcomes & is the ROI sufficient?"' },
  { key: 'right_solution', label: 'Right Solution', script: '"With alignment on all of that… are we the right solution?"' },
] as const;

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function CallMode({
  session,
  onSessionChange,
  selectedPains,
  onPainChange,
  selectedPersona,
  onPersonaChange,
  onSwitchToFull,
}: CallModeProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'insights' | 'status'>('insights');
  // Remove viewMode state as MEDDPICC is deprecated
  const [expandedProbes, setExpandedProbes] = useState<Record<string, boolean>>({});
  const [openerOpen, setOpenerOpen] = useState(false);

  // BAP / checkpoint scores
  const bapAnswers = useMemo(() => computeBAPAnswers(session), [session]);
  const cpScores = useMemo(() => [1, 2, 3].map(cp => {
    const score = getCheckpointScore(bapAnswers, cp as 1 | 2 | 3);
    return { score, passed: score >= MAX_CP_SCORE - 2.5 };
  }), [bapAnswers]);

  // Get / set values
  const getValue = useCallback((qId: string): string => {
    const cs = session.call_sheet_answers?.[qId];
    if (cs) {
      if (Array.isArray(cs)) return cs.join(', ');
      return String(cs);
    }
    return session.bap_notes?.[qId] ?? '';
  }, [session]);

  const setValue = useCallback((qId: string, value: string) => {
    let updatedCallSheet = { ...(session.call_sheet_answers || {}), [qId]: value };
    let updatedBapNotes = { ...(session.bap_notes || {}), [qId]: value };
    let updatedRoiTotal = session.roi_total;

    const parseNumber = (val: string): number => {
      const clean = val.replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(clean);
      return isNaN(parsed) ? 0 : parsed;
    };

    if (qId === 'napkin_roi_total') {
      updatedRoiTotal = parseNumber(value);
    } else if (
      qId === 'napkin_kpi1_value' ||
      qId === 'napkin_kpi2_value' ||
      qId === 'napkin_kpi3_value'
    ) {
      const v1 = qId === 'napkin_kpi1_value' ? value : (updatedCallSheet['napkin_kpi1_value'] as string || '');
      const v2 = qId === 'napkin_kpi2_value' ? value : (updatedCallSheet['napkin_kpi2_value'] as string || '');
      const v3 = qId === 'napkin_kpi3_value' ? value : (updatedCallSheet['napkin_kpi3_value'] as string || '');

      const sum = parseNumber(v1) + parseNumber(v2) + parseNumber(v3);
      updatedRoiTotal = sum;
      updatedCallSheet['napkin_roi_total'] = sum > 0 ? `$${sum.toLocaleString()}` : '';
      updatedBapNotes['napkin_roi_total'] = sum > 0 ? `$${sum.toLocaleString()}` : '';
    }

    onSessionChange({
      ...session,
      call_sheet_answers: updatedCallSheet,
      bap_notes: updatedBapNotes,
      roi_total: updatedRoiTotal,
    });
  }, [session, onSessionChange]);

  const setNumericValue = useCallback((qId: string, value: number) => {
    onSessionChange({
      ...session,
      call_sheet_answers: { ...(session.call_sheet_answers || {}), [qId]: value },
    });
  }, [session, onSessionChange]);

  // Copy helpers
  const handleCopy = useCallback(async (qId: string) => {
    const text = getValue(qId);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(qId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch { /* fallback */ }
  }, [getValue]);

  const handleCopyAll = useCallback(async () => {
    const lines: string[] = [];
    lines.push(`Call Notes — ${session.company_name || 'Deal'}`);
    lines.push(`Date: ${new Date().toLocaleDateString()}`);
    lines.push('');
    for (const cp of CHECKPOINTS) {
      const hasAny = cp.sections.some(s => getValue(s.fieldId));
      if (!hasAny) continue;
      lines.push(`── ${cp.label} ──`);
      for (const s of cp.sections) {
        const val = getValue(s.fieldId);
        if (val) lines.push(`${s.label}: ${val}`);
      }
      const gate = GATE_QUESTIONS[cp.num];
      const gateVal = getValue(gate.fieldId);
      if (gateVal) lines.push(`Gate (1-10): ${gateVal}`);
      lines.push('');
    }
    const quickNotes = session.bap_notes?.['call_companion_notes'];
    if (quickNotes) {
      lines.push('── Notes ──');
      lines.push(quickNotes);
    }
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch { /* fallback */ }
  }, [session, getValue]);

  // D4 alignment toggle
  const toggleAlignment = useCallback((key: string) => {
    const checks = session.alignment_checks || {
      urgent_priority: false, resources_insufficient: false,
      problems_solutions: false, roi_sufficient: false, right_solution: false,
    };
    onSessionChange({
      ...session,
      alignment_checks: { ...checks, [key]: !(checks as any)[key] },
    });
  }, [session, onSessionChange]);

  const alignmentChecks = session.alignment_checks || {
    urgent_priority: false, resources_insufficient: false,
    problems_solutions: false, roi_sufficient: false, right_solution: false,
  };
  const alignedCount = Object.values(alignmentChecks).filter(Boolean).length;

  const toggleProbes = useCallback((key: string) => {
    setExpandedProbes(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Checkpoint Y/N state
  const getCheckpointConfirm = useCallback((cpNum: number): string | null => {
    return session.call_sheet_answers?.[`cp${cpNum}_confirmed`] ?? null;
  }, [session]);

  const setCheckpointConfirm = useCallback((cpNum: number, val: 'yes' | 'no') => {
    onSessionChange({
      ...session,
      call_sheet_answers: { ...(session.call_sheet_answers || {}), [`cp${cpNum}_confirmed`]: val },
    });
  }, [session, onSessionChange]);

  /* ──────── Render: Gate ──────── */

  const renderGate = (cpNum: number) => {
    const gate = GATE_QUESTIONS[cpNum];
    const currentVal = Number(getValue(gate.fieldId)) || 0;
    const isCP2 = gate.invertScale;
    const confirmed = getCheckpointConfirm(cpNum);

    return (
      <div className="bg-stone-50 border-2 border-dashed border-stone-300 rounded-xl p-4 mt-4">
        {/* 1-10 scale */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-semibold text-stone-600">{gate.question}</span>
        </div>
        <div className="flex gap-1.5 mb-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
            const isSelected = currentVal === n;
            let colorClass = '';
            if (isSelected) {
              if (isCP2) {
                colorClass = n <= 3 ? 'bg-emerald-500 text-white' : n <= 7 ? 'bg-amber-500 text-white' : 'bg-rose-400 text-white';
              } else {
                colorClass = n >= 8 ? 'bg-emerald-500 text-white' : n >= 5 ? 'bg-amber-500 text-white' : 'bg-rose-400 text-white';
              }
            }
            return (
              <button
                key={n}
                onClick={() => setNumericValue(gate.fieldId, n)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${
                  isSelected
                    ? `${colorClass} border-transparent`
                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>
        <div className="flex justify-between text-[9px] text-stone-400 px-1 mb-3">
          <span>{isCP2 ? 'Need outside help' : 'Not a priority'}</span>
          <span>{isCP2 ? 'Can solve alone' : 'Top priority'}</span>
        </div>

        {/* Mismatch coaching */}
        {currentVal > 0 && gate.mismatchCoaching && (
          <div className="bg-amber-50 border border-amber-200/60 rounded-md px-3 py-2 mb-3 flex items-start gap-2">
            <span className="text-[12px] mt-0.5">⚠️</span>
            <p className="text-[11px] text-amber-800 font-medium leading-snug whitespace-pre-line">
              {gate.mismatchCoaching}
            </p>
          </div>
        )}

        {/* Binary Y/N Checkpoint Confirmation */}
        <div className="border-t border-stone-200 pt-3 mt-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-800 text-white">
              🔒 Checkpoint
            </span>
            <span className="text-[11px] font-semibold text-stone-700">{gate.checkpointPrompt}</span>
          </div>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setCheckpointConfirm(cpNum, 'yes')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold border transition-all ${
                confirmed === 'yes'
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              ✅ Yes — Move Forward
            </button>
            <button
              onClick={() => setCheckpointConfirm(cpNum, 'no')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold border transition-all ${
                confirmed === 'no'
                  ? 'bg-rose-400 text-white border-rose-400'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-rose-300 hover:bg-rose-50'
              }`}
            >
              ❌ No — Not Yet
            </button>
          </div>

          {/* Recovery question on No */}
          {confirmed === 'no' && (
            <div className="bg-rose-50 rounded-lg px-3 py-2 border border-rose-200">
              <p className="text-[10px] font-semibold text-rose-700 mb-1">Ask this recovery question:</p>
              <p className="text-[11px] text-rose-600 italic leading-relaxed">{gate.recoveryQuestion}</p>
            </div>
          )}

          {confirmed === 'yes' && (
            <div className="bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-200">
              <p className="text-[10px] font-semibold text-emerald-700">
                ✅ Checkpoint {cpNum} confirmed — {cpNum < 3 ? `proceed to ${cpNum === 1 ? 'Gap Test' : 'Solution Roadmap'}` : 'move to D4 Confirmation Close'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ──────── Render: Section Card ──────── */

  const renderSection = (section: BAPSection, cpColor: string) => {
    const value = getValue(section.fieldId);
    const hasValue = !!value.trim();
    const isCopied = copiedField === section.fieldId;
    const isProbesOpen = expandedProbes[section.key] ?? false;
    const isPresenting = section.mode === 'present';

    return (
      <div key={section.key} className={`bg-white border rounded-xl overflow-hidden ${
        isPresenting ? 'border-emerald-200/60' : 'border-stone-200/40'
      }`}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className={`shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider text-white ${cpColor}`}>
            {section.label}
          </div>
          {isPresenting && (
            <span className="text-[8px] font-semibold uppercase tracking-wider text-emerald-500">Present</span>
          )}
          <div className="flex-1" />
          <button
            onClick={() => handleCopy(section.fieldId)}
            disabled={!hasValue}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              isCopied
                ? 'bg-emerald-100 text-emerald-700'
                : hasValue
                  ? 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                  : 'bg-stone-50 text-stone-300 cursor-not-allowed'
            }`}
          >
            {isCopied ? <Check size={12} /> : <Copy size={12} />}
            {isCopied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Core question / presenting prompt */}
        <div className="px-5 pb-3 pt-1">
          <p className={`text-[15px] font-semibold leading-relaxed ${isPresenting ? 'text-emerald-800' : 'text-stone-800'}`}>
            {section.key === 'budget_timelines'
              ? section.core.replace('[X]', session.roi_total > 0 ? `$${session.roi_total.toLocaleString()}` : '[calculated ROI]')
              : section.core}
          </p>
        </div>

        {/* Coaching */}
        <div className="px-5 pb-4">
          <div className="bg-stone-50 border border-stone-200/60 rounded-md px-3 py-2.5 flex items-start gap-2.5">
            <span className="text-[14px] mt-0.5 opacity-80">💡</span>
            <p className="text-[12px] text-stone-600 font-medium leading-snug">
              {section.coaching}
            </p>
          </div>
        </div>

        {/* Textarea */}
        <div className="px-5 pb-5">
          <textarea
            value={value}
            onChange={e => setValue(section.fieldId, e.target.value)}
            placeholder={section.placeholder || (isPresenting ? 'How did they react? What resonated?' : 'Capture their exact words...')}
            style={{ fieldSizing: 'content' } as any}
            className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-700 resize-none focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300 min-h-[3lh] max-h-[15lh] overflow-y-auto leading-relaxed"
          />
        </div>

        {/* Back of the Napkin Math (Price Anchoring) */}
        {section.type === 'napkin' && (
          <div className="px-4 pb-3">
            <div className="bg-amber-50/50 rounded-lg border border-amber-200/60 p-3">
              <p className="text-[9px] font-semibold text-amber-700 mb-2 uppercase tracking-wider">📝 Back of the Napkin Math</p>
              <p className="text-[9px] text-amber-600/70 italic mb-3">Keep it simple & believable. Use THEIR conservative numbers. Stack KPIs to reach 5-10x ROI.</p>
              <div className="space-y-2">
                {[
                  { id: 'napkin_kpi1_name', id2: 'napkin_kpi1_value', label: 'KPI #1', placeholder: 'e.g., Time-to-fill reduction', valuePlaceholder: 'Annual savings $' },
                  { id: 'napkin_kpi2_name', id2: 'napkin_kpi2_value', label: 'KPI #2', placeholder: 'e.g., Agency spend reduction', valuePlaceholder: 'Annual savings $' },
                  { id: 'napkin_kpi3_name', id2: 'napkin_kpi3_value', label: 'KPI #3', placeholder: 'e.g., Admin time savings', valuePlaceholder: 'Annual savings $' },
                ].map(field => (
                  <div key={field.id} className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[8px] text-amber-600/60 mb-0.5 block">{field.label}</label>
                      <input
                        type="text"
                        value={getValue(field.id) || ''}
                        onChange={e => setValue(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-white border border-amber-200 rounded px-2 py-1 text-xs text-stone-700 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="w-28">
                      <label className="text-[8px] text-amber-600/60 mb-0.5 block">Impact</label>
                      <input
                        type="text"
                        value={getValue(field.id2) || ''}
                        onChange={e => setValue(field.id2, e.target.value)}
                        placeholder={field.valuePlaceholder}
                        className="w-full bg-white border border-amber-200 rounded px-2 py-1 text-xs text-stone-700 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between">
                <span className="text-[9px] font-bold text-amber-700 uppercase">Total ROI (annual)</span>
                <input
                  type="text"
                  value={getValue('napkin_roi_total') || ''}
                  onChange={e => setValue('napkin_roi_total', e.target.value)}
                  placeholder="$0"
                  className="w-32 bg-white border-2 border-amber-300 rounded-lg px-3 py-1.5 text-sm font-bold text-amber-800 text-right focus:outline-none focus:border-amber-500"
                />
              </div>
              <p className="text-[8px] text-amber-500 mt-1 text-right">5-10x rule: If ROI is 5-10x our price → zero price resistance</p>
            </div>
          </div>
        )}

        {/* Probing hints */}
        {section.probes && section.probes.length > 0 && (
          <div className="px-4 pb-3">
            <button
              onClick={() => toggleProbes(section.key)}
              className="flex items-center gap-1 text-[10px] font-medium text-stone-400 hover:text-stone-600 transition-colors"
            >
              {isProbesOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              {isPresenting ? 'Presentation tips' : `${section.probes.length} probing questions`}
            </button>
            {isProbesOpen && (
              <div className="mt-2 space-y-1.5 pl-4 border-l-2 border-stone-100">
                {section.probes.map((probe, i) => (
                  <p key={i} className={`text-[10px] leading-relaxed ${
                    probe.startsWith('💡') || probe.startsWith('🚨')
                      ? 'text-amber-600 font-semibold not-italic'
                      : 'text-stone-400 italic'
                  }`}>
                    {probe.startsWith('💡') || probe.startsWith('🚨') || probe.startsWith('—') ? probe : `→ ${probe}`}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  /* ──────── Main render ──────── */

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header without Toggle */}
      <div className="flex items-center justify-between p-6 pb-0 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-stone-800">Buyer's Action Plan</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          </div>
          <p className="text-xs text-stone-400">Urgency Test → Gap Test → Solution Roadmap → Confirmation Close</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="flex gap-6 p-6 h-full">
            {/* ═══ Main column ═══ */}
            <div className="flex-1 min-w-0 space-y-6 overflow-y-auto h-full pr-2">
        {/* ─── Call Opener ─── */}
        <div className="bg-white border border-stone-200/40 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpenerOpen(!openerOpen)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors"
          >
            <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold text-white bg-violet-500">
              <Phone size={13} />
            </div>
            <span className="text-sm font-medium text-stone-800 flex-1 text-left">Call Opener — Take Leadership Position</span>
            {openerOpen ? <ChevronDown size={14} className="text-stone-400" /> : <ChevronRight size={14} className="text-stone-400" />}
          </button>
          {openerOpen && (
            <div className="px-4 pb-4 border-t border-stone-100">
              <p className="text-[10px] text-stone-400 italic mt-2 mb-3">
                💡 {CALL_OPENER.coaching}
              </p>
              <pre className="text-[11px] text-stone-600 bg-stone-50 rounded-lg px-4 py-3 whitespace-pre-wrap leading-relaxed font-sans border border-stone-200">
                {CALL_OPENER.script}
              </pre>
            </div>
          )}
        </div>

        {/* ─── CP1, CP2, CP3 ─── */}
        {CHECKPOINTS.map(cp => {
          const cpScore = cpScores[cp.num - 1];
          const confirmed = getCheckpointConfirm(cp.num);
          return (
            <div key={cp.num}>
              {/* Checkpoint header */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white ${cp.color}`}>
                  CP{cp.num}
                </span>
                <div className="flex-1">
                  <span className="text-[12px] font-bold text-stone-700">{cp.label.split('·')[1]?.trim()}</span>
                  <span className="text-[10px] text-stone-400 ml-2">{cp.subtitle}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  confirmed === 'yes' || cpScore.passed
                    ? 'bg-emerald-50 text-emerald-600'
                    : cpScore.score >= 5 ? 'bg-amber-50 text-amber-600' : 'bg-stone-100 text-stone-400'
                }`}>
                  {confirmed === 'yes' ? '✓ Confirmed' : `${cpScore.score}/${MAX_CP_SCORE}`}
                </span>
              </div>

              {/* Section cards */}
              <div className="space-y-3">
                {cp.sections.map(section => renderSection(section, cp.color))}
              </div>

              {/* Gate */}
              {renderGate(cp.num)}

              {/* Spacer */}
              {cp.num < 3 && <div className="h-2" />}
            </div>
          );
        })}

        {/* ─── D4: Confirmation Close ─── */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white bg-rose-500">
              D4
            </span>
            <span className="text-[12px] font-bold text-stone-700">Confirmation Close</span>
            <div className="flex-1 h-px bg-stone-200" />
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              alignedCount === 5 ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-400'
            }`}>
              {alignedCount}/5 aligned
            </span>
          </div>
          <div className="space-y-2.5">
            {D4_CHECKS.map((item, i) => {
              const isChecked = (alignmentChecks as any)[item.key];
              return (
                <div
                  key={item.key}
                  onClick={() => toggleAlignment(item.key)}
                  className={`bg-white border rounded-xl px-4 py-3 cursor-pointer transition-all ${
                    isChecked ? 'border-emerald-300 bg-emerald-50/30' : 'border-stone-200/40 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                      isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-stone-300 bg-white'
                    }`}>
                      {isChecked && <Check size={12} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <span className={`text-sm font-medium ${isChecked ? 'text-emerald-700' : 'text-stone-800'}`}>
                        {i + 1}. {item.label}
                      </span>
                      <p className="text-[10px] text-stone-400 italic mt-0.5">{item.script}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Quick Notes ─── */}
        <div className="bg-white border border-stone-200/40 rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider text-white bg-stone-400">
              Notes
            </div>
            <span className="text-sm font-medium text-stone-800 flex-1">Quick Notes</span>
          </div>
          <div className="px-4 pb-4">
            <textarea
              value={session.bap_notes?.['call_companion_notes'] ?? ''}
              onChange={e => onSessionChange({
                ...session,
                bap_notes: { ...(session.bap_notes || {}), call_companion_notes: e.target.value },
              })}
              placeholder="Key quotes, objections, observations — anything you want to remember."
              rows={4}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-700 resize-none focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300 leading-relaxed"
            />
          </div>
        </div>


            </div>      {/* ═══ Right sidebar ═══ */}
      <div className="hidden xl:block w-64 shrink-0 overflow-y-auto h-full pr-2">
        <div className="space-y-5">

          {/* Checkpoint Progress */}
          <div className="bg-white border border-stone-200/40 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-stone-700 mb-3">Checkpoint Progress</h3>
            <div className="space-y-2.5">
              {[
                { label: 'CP1 · Urgency Test', cp: 0 },
                { label: 'CP2 · Gap Test', cp: 1 },
                { label: 'CP3 · Solution', cp: 2 },
              ].map(item => {
                const confirmed = getCheckpointConfirm(item.cp + 1);
                return (
                  <label key={item.label} className="flex items-start gap-2">
                    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                      confirmed === 'yes' || cpScores[item.cp].passed
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-stone-300 bg-white'
                    }`}>
                      {(confirmed === 'yes' || cpScores[item.cp].passed) && <Check size={10} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[11px] leading-snug ${
                        confirmed === 'yes' || cpScores[item.cp].passed ? 'text-stone-700' : 'text-stone-400'
                      }`}>
                        {item.label}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="flex-1 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              confirmed === 'yes' || cpScores[item.cp].passed ? 'bg-emerald-500' : cpScores[item.cp].score >= 5 ? 'bg-amber-400' : 'bg-stone-300'
                            }`}
                            style={{ width: `${Math.min((cpScores[item.cp].score / MAX_CP_SCORE) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-bold text-stone-400 tabular-nums">
                          {cpScores[item.cp].score}/{MAX_CP_SCORE}
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })}
              <label className="flex items-start gap-2">
                <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                  alignedCount === 5 ? 'bg-emerald-500 border-emerald-500' : 'border-stone-300 bg-white'
                }`}>
                  {alignedCount === 5 && <Check size={10} className="text-white" />}
                </div>
                <span className={`text-[11px] leading-snug ${alignedCount === 5 ? 'text-stone-700' : 'text-stone-400'}`}>
                  D4 · Confirmation ({alignedCount}/5)
                </span>
              </label>
            </div>
          </div>

          {/* Call Status */}
          <div className="bg-white border border-stone-200/40 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-stone-700 mb-3">Call Status</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Next steps (Who)', checked: !!session.next_steps_who },
                { label: 'Next steps (What)', checked: !!session.next_steps_what },
                { label: 'Next steps (When)', checked: !!session.next_steps_when || !!session.next_meeting_date },
                { label: 'Pains identified', checked: selectedPains.length > 0 },
                { label: 'Notes captured', checked: !!(session.bap_notes?.['call_companion_notes']) },
              ].map(item => (
                <label key={item.label} className="flex items-start gap-2">
                  <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                    item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-stone-300 bg-white'
                  }`}>
                    {item.checked && <Check size={10} className="text-white" />}
                  </div>
                  <span className={`text-[11px] leading-snug ${item.checked ? 'text-stone-700' : 'text-stone-400'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Deal Timeline / Activity Feed (Temporarily hidden per request)
          <div className="bg-white border border-stone-200/40 rounded-xl p-4">
            <DealTimeline session={session} onSessionUpdate={(field, value) => {
              onSessionChange({ ...session, [field]: value });
            }} />
          </div>
          */}

        </div>
      </div>
    </div>
  </div>
</div>
  );
}

export default CallMode;
