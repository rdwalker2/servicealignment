// ============================================================
// Post-Call Follow-Up Sequence Generator
// Generates a personalized 3-touch email sequence from a
// DiscoverySession captured in the Discovery Room.
// ============================================================

import { type DiscoverySession } from './discoveryDatabase';

// ── Types ──

export interface FollowUpEmail {
  day: number;     // 0 = same day, 2 = +2 days, 5 = +5 days
  subject: string;
  body: string;    // plain text, \n for line breaks
  purpose: 'Summary & Next Steps' | 'Pain Reinforcement' | 'ROI Anchor';
  cta: string;     // the one ask in this email
}

// ── Pain label map ──

const PAIN_LABELS: Record<string, string> = {
  'slow-time-to-hire':       'slow time to hire',
  'poor-candidate-experience': 'poor candidate experience',
  'high-cost-per-hire':      'high cost per hire',
  'outdated-career-site':    'an outdated career site',
  'locked-out-managers':     'hiring managers locked out of the process',
  'no-pipeline-visibility':  'lack of pipeline visibility',
  'manual-screening':        'manual screening overhead',
  'weak-talent-pools':       'weak talent pools',
  'no-content-hub':          'no centralized content hub',
  'multi-language-gaps':     'multi-language hiring gaps',
  'scorecard-friction':      'scorecard and evaluation friction',
  'no-mobile-feedback':      'no mobile feedback loop for managers',
};

// ── Pain-specific benchmark copy ──

const PAIN_BENCHMARKS: Record<string, string> = {
  'slow-time-to-hire':
    'Companies with 40+ day time-to-fill lose 32% of top candidates to faster-moving competitors.',
  'poor-candidate-experience':
    '72% of candidates who have a poor experience share it publicly — directly impacting your employer brand.',
  'high-cost-per-hire':
    'The average cost-per-hire in competitive markets has climbed past $4,700 — agencies alone can push that north of $20K per role.',
  'outdated-career-site':
    'Career sites that load in under 2 seconds convert 3× more applicants than slow or legacy pages.',
  'locked-out-managers':
    'When hiring managers are excluded from the ATS workflow, decision cycles stretch by an average of 11 days.',
  'no-pipeline-visibility':
    'Talent teams without real-time pipeline dashboards report 41% lower offer-acceptance rates due to late-stage surprises.',
  'manual-screening':
    'Manual resume screening consumes an average of 23 hours per role — time that compounds quickly at scale.',
  'weak-talent-pools':
    'Companies with proactive talent pipelines fill roles 55% faster than those sourcing reactively.',
  'no-content-hub':
    'Recruiting teams without a centralized content hub spend 6+ hours per week recreating job descriptions and employer brand assets.',
  'multi-language-gaps':
    'Organizations hiring across 3+ countries that lack localized job content see a 28% drop in qualified applicant volume.',
  'scorecard-friction':
    'Inconsistent evaluation scorecards increase hiring bias risk and extend interview-to-offer timelines by an average of 8 days.',
  'no-mobile-feedback':
    'When hiring managers can\'t give feedback on mobile, response lag averages 3.2 days - slowing every offer cycle downstream.',
};

// ── Persona display labels ──

const PERSONA_LABELS: Record<string, string> = {
  'dir-eb':         'Director of Employer Branding',
  'vp-ta':          'VP of Talent Acquisition',
  'chro':           'Chief HR Officer',
  'hiring-manager': 'Hiring Manager',
};

// ── ATS display names ──

const ATS_NAMES: Record<string, string> = {
  greenhouse:      'Greenhouse',
  ashby:           'Ashby',
  bamboohr:        'BambooHR',
  lever:           'Lever',
  workday:         'Workday',
  icims:           'iCIMS',
  smartrecruiters: 'SmartRecruiters',
  other:           'your current ATS',
};

// ── Helpers ──

function getPainLabel(painId: string): string {
  return PAIN_LABELS[painId] ?? painId.replace(/-/g, ' ');
}

function getPainBenchmark(painId: string): string {
  return (
    PAIN_BENCHMARKS[painId] ??
    'Companies in your space are investing heavily in streamlining this exact challenge.'
  );
}

function getATSName(ats: string | null): string | null {
  if (!ats || ats === 'none') return null;
  return ATS_NAMES[ats.toLowerCase()] ?? ats;
}

function getPersonaLabel(persona: string | null): string | null {
  if (!persona || persona === 'all') return null;
  return PERSONA_LABELS[persona] ?? persona;
}

// ── ROI formatter ──

function formatROI(total: number): string {
  if (total <= 0) return '';
  if (total >= 1_000_000) return `$${(total / 1_000_000).toFixed(1)}M`;
  if (total >= 1_000)     return `$${Math.round(total / 1_000)}K`;
  return `$${total.toLocaleString()}`;
}

// ── Email 1 — Summary & Next Steps (Day 0) ──

function buildEmail1(
  session: DiscoverySession,
  companyName: string,
  repName: string,
): FollowUpEmail {
  const pains = session.selected_pains.slice(0, 2);
  const painList =
    pains.length > 0
      ? pains.map(p => `• ${getPainLabel(p).charAt(0).toUpperCase() + getPainLabel(p).slice(1)}`).join('\n')
      : '• Optimizing your talent acquisition process';

  const atsLine = getATSName(session.current_ats)
    ? `We also discussed the friction your team is experiencing with ${getATSName(session.current_ats)} and how a modern platform could close those gaps.\n\n`
    : '';

  const nextStep = session.next_action?.trim()
    ? session.next_action.trim()
    : 'reviewing a tailored assessment of your hiring workflow';

  const cta =
    'Do you have 20 minutes this week to walk through our initial assessment?';

  const body =
    `Hi ${companyName} team,\n\n` +
    `Thank you for the time today — it was a genuinely insightful conversation.\n\n` +
    `Based on what we discussed, the top priorities on your plate right now are:\n\n` +
    `${painList}\n\n` +
    `${atsLine}` +
    `We agreed the logical next step is ${nextStep}. I want to make sure we keep the momentum going and get you the right information to move forward confidently.\n\n` +
    `${cta}\n\n` +
    `Looking forward to it,\n${repName}`;

  return {
    day: 0,
    subject: `Following up — ${companyName} next steps`,
    body,
    purpose: 'Summary & Next Steps',
    cta,
  };
}

// ── Email 2 — Pain Reinforcement (Day 2) ──

function buildEmail2(
  session: DiscoverySession,
  companyName: string,
  repName: string,
): FollowUpEmail {
  const topPain = session.selected_pains[0] ?? null;
  const painLabel = topPain ? getPainLabel(topPain) : 'inefficiencies in your hiring process';
  const benchmark = topPain ? getPainBenchmark(topPain) : 'Talent teams at your scale face mounting pressure to hire faster with fewer resources.';
  const personaLabel = getPersonaLabel(session.persona);

  const personaLine = personaLabel
    ? `As a ${personaLabel}, you're likely feeling this acutely — every day the problem persists is a day your hiring velocity falls behind.\n\n`
    : `Your team is likely feeling this acutely — every day the problem persists is a day your hiring velocity falls behind.\n\n`;

  const subjectPain = topPain ? getPainLabel(topPain) : 'this hiring challenge';

  const cta = `I'd love to show you how similar companies solved this in 90 days.`;

  const body =
    `Hi ${companyName} team,\n\n` +
    `When we spoke, you mentioned ${painLabel} as one of your most pressing challenges. I've been thinking about it since our call.\n\n` +
    `Here's a benchmark worth sitting with:\n\n` +
    `"${benchmark}"\n\n` +
    `${personaLine}` +
    `Teamtailor was built specifically to close this gap — and the results our customers see in the first quarter are meaningful.\n\n` +
    `${cta}\n\n` +
    `Best,\n${repName}`;

  return {
    day: 2,
    subject: `The real cost of ${subjectPain} at ${companyName}`,
    body,
    purpose: 'Pain Reinforcement',
    cta,
  };
}

// ── Email 3 — ROI Anchor (Day 5) ──

function buildEmail3(
  session: DiscoverySession,
  companyName: string,
  repName: string,
): FollowUpEmail {
  const roiFormatted = formatROI(session.roi_total);
  const roiLine = roiFormatted
    ? `Based on the numbers you shared, companies similar to ${companyName} typically realize ${roiFormatted} in reduced agency spend and see measurably faster fill times in their first quarter with Teamtailor.\n\n`
    : `Based on what you shared about your hiring volume, companies similar to ${companyName} typically see significant reductions in agency spend and measurably faster fill times in their first quarter.\n\n`;

  const blueprintLine =
    session.blueprint_approved
      ? `Given that we've already aligned on a solution blueprint, this is an ideal moment to lock in a timeline and get your team on the path to results.\n\n`
      : '';

  const cta =
    `Can we schedule a 30-minute assessment call this week? I'll come prepared with a custom benchmark.`;

  const body =
    `Hi ${companyName} team,\n\n` +
    `I wanted to close out this week with one final thought before the weekend.\n\n` +
    `${roiLine}` +
    `${blueprintLine}` +
    `The window to make a meaningful impact on Q3 hiring is narrowing — and I'd hate for you to miss it.\n\n` +
    `${cta}\n\n` +
    `Talk soon,\n${repName}`;

  return {
    day: 5,
    subject: `What ${companyName} could gain in Q3`,
    body,
    purpose: 'ROI Anchor',
    cta,
  };
}

// ── Public API ──

export function generateFollowUpSequence(
  session: DiscoverySession,
  companyName: string,
  repName?: string,
): FollowUpEmail[] {
  const rep = repName?.trim() || 'Your Teamtailor Rep';
  return [
    buildEmail1(session, companyName, rep),
    buildEmail2(session, companyName, rep),
    buildEmail3(session, companyName, rep),
  ];
}
