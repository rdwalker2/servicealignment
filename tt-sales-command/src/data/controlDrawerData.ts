/**
 * controlDrawerData.ts — Static data extracted from ControlDrawer.tsx
 * 
 * Contains:
 * - Contextual discovery questions by persona/use-case
 * - Power questions from top performers
 * - Data Arsenal stats mapped to selected pains
 * - Deal kill flag computation
 * - Section definitions for Room Builder tab
 * - ROI category definitions
 */

import {
  Target, Search, Swords, Lightbulb,
  TrendingUp, Users, DollarSign,
  ClipboardList,
  Layout, Sparkles, Award,
  Shield, FileText, Calendar,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { computeBAPAnswers, getCheckpointScore, type DiscoverySession } from '../lib/discoveryDatabase';
import type { RoomVisibility } from '../components/discovery/RoomSections';

/* ------------------------------------------------------------------ */
/*  ROI Categories                                                     */
/* ------------------------------------------------------------------ */

export const ROI_CATEGORIES = [
  { key: 'seatSavings', label: 'ATS Seat Savings', icon: DollarSign },
  { key: 'agencySavings', label: 'Agency Savings', icon: Users },
  { key: 'vacancySavings', label: 'Vacancy Cost Savings', icon: Calendar },
  { key: 'jobBoardSavings', label: 'Job Board Savings', icon: FileText },
  { key: 'adminTimeSavings', label: 'Admin Time Savings', icon: TrendingUp },
] as const;

/* ------------------------------------------------------------------ */
/*  Contextual Discovery Questions                                     */
/* ------------------------------------------------------------------ */

export const CONTEXTUAL_DISCOVERY_QUESTIONS: Record<string, Record<string, string[]>> = {
  'dir-eb': {
    default: [
      "Your careers site — who owns updates to it today, your team or IT? How long does a typical change take?",
      "When you look at your top-of-funnel metrics, do you know your career site visit-to-application conversion rate?",
      "If a candidate lands on your careers page from a LinkedIn ad — what's the experience that greets them?",
    ],
    'replacing-ats': [
      "What specifically broke about your current setup from an employer brand perspective?",
      "Does your current ATS career page look like the rest of your brand — or does it feel like a different company?",
      "How much of your employer brand investment is being wasted because the application experience kills conversion?",
    ],
    'adding-brand': [
      "You have the brand assets — what's the blocker to getting them onto the careers site?",
      "What does a 'win' look like for your employer brand in the next 12 months — and what's the biggest obstacle?",
      "Are you measuring candidate NPS or application completion rates today?",
    ],
  },
  'vp-ta': {
    default: [
      "Walk me through what happens from the moment a role gets approved to when you have a shortlist. Where does it slow down?",
      "When a candidate drops out of your process, do you know the reason — or is that usually a mystery?",
      "How do your hiring managers interact with candidates today — are they actually inside the ATS or routing around it?",
    ],
    'first-ats': [
      "Right now, if I asked you for a list of every candidate in your pipeline across all open roles — how long would that take?",
      "What's breaking first as you scale — sourcing, screening, or feedback loops?",
      "Have you lost a strong candidate because the process took too long or felt disorganized on your end?",
    ],
    'scaling': [
      "What does your current setup allow you to do at 3x your current hiring volume — where does it break?",
      "Are you starting every new role from zero, or do you have passive talent pools you can activate?",
      "What's your time-to-fill benchmark, and where do you think the biggest time waste is hiding?",
    ],
  },
  'chro': {
    default: [
      "When the board asks you about talent acquisition performance — what's the story you're able to tell, and what's the story you wish you could tell?",
      "What does the biggest recruiting miss of the last 12 months tell you about what's broken in your current process?",
      "If nothing changes in your TA infrastructure over the next 12 months — what does that cost you in real terms?",
    ],
    'consolidating': [
      "How many tools is your TA team actually using right now — ATS, CRM, careers site, analytics — and are they talking to each other?",
      "What's the annual cost of your current stack, and what percentage of your team would say they're getting full value from it?",
      "Which tool in your current stack causes the most internal complaints — and why hasn't it been fixed?",
    ],
  },
  'hiring-manager': {
    default: [
      "How do you give feedback on candidates today — inside the ATS, email, Slack, or something else?",
      "When you have a role to fill urgently, what's the fastest the current process has ever moved — and what made it fast?",
      "What would need to be true for you to say the hiring process at this company is actually working well?",
    ],
  },
  'cfo': {
    default: [
      "What percentage of your hires currently come through external agencies — and is that number going up, down, or flat?",
      "Do you know your cost-per-hire today — all in, including recruiter time, job boards, and agency fees?",
      "If I showed you that a $30K investment in the right ATS would save $200K in agency fees this year — what would you need to believe for that math to be credible?",
    ],
  },
  'recruiter': {
    default: [
      "What percentage of your day is admin versus actually talking to candidates — and what's eating the most time?",
      "When you close a role, how much of that talent pool do you retain for future roles — or does it evaporate?",
      "What's the one thing about your current setup that, if fixed tomorrow, would make the biggest difference to your week?",
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Power Questions                                                    */
/* ------------------------------------------------------------------ */

export const POWER_QUESTIONS: { label: string; question: string; when: string; advances: string }[] = [
  {
    label: 'The "Dumb Question"',
    question: "I'm going to ask what sounds like a stupid question — if I was your CIO, why couldn't you just keep doing what you're doing on your current system?",
    when: 'After Q5 (Current Approach) is answered',
    advances: 'Q3 (Cost of Indecision), Q6 (Capability Gap)',
  },
  {
    label: 'Cost of Indecision',
    question: 'What happens if you do nothing for another 12 months?',
    when: 'When Q3 is unanswered',
    advances: 'Q3 (Cost of Indecision)',
  },
  {
    label: 'Priority Probe',
    question: "If your CPO was in the room right now, what's their #1 priority in the next 12 months? Is it recruitment tech, or is there something that would gazump us?",
    when: 'When Q4 is unanswered',
    advances: 'Q4 (Priority Level)',
  },
  {
    label: 'Stakeholder Landscape',
    question: "How many different stakeholders need to be involved? Who would be an ally, and who might be a trickier customer that takes more convincing?",
    when: 'When Q2 is unanswered',
    advances: 'Q2 (Stakeholder Map), Q7 (Buying Process)',
  },
  {
    label: 'Competitor Flush',
    question: "If there's anything you've seen elsewhere that you like and you're thinking, why isn't he showing me that — please just flag it.",
    when: 'D3 stage, after demo',
    advances: 'Q10 (Solution Map)',
  },
  {
    label: 'Star Rating Close',
    question: 'If you had to score us out of 5 stars, what would you give us?',
    when: 'End of D3 demo',
    advances: 'Q10 (Solution Map), Q11 (Success Metrics)',
  },
  {
    label: 'Gap-Closing Follow-up',
    question: "What would close the delta between that and a 5? What did you feel might be a limiting factor?",
    when: 'Immediately after star rating',
    advances: 'Q10, Q11',
  },
  {
    label: 'Agency Displacement Probe',
    question: "If we could help you bring just 30% of your current agency hires in-house this year, what would that save you, and what's stopping you from doing that today?",
    when: 'Early discovery when high agency spend is flagged',
    advances: 'Q1 (Quantified Pain), Q3 (Cost of Indecision)',
  },
  {
    label: 'HRIS Bundle Fatigue Check',
    question: "I hear that Paycom/Paycor is simple for payroll, but how much time are your managers wasting doing manual workarounds because the ATS module is too rigid?",
    when: 'When competitor is an HRIS bundle',
    advances: 'Q6 (Capability Gap)',
  },
  {
    label: 'The "Single Source" Trap',
    question: "Having employee records in one system is convenient for HR, but if it means recruiters are drowning in spreadsheets and candidates are ghosting, who is actually winning?",
    when: 'Friction around HRIS consolidation objection',
    advances: 'Q6 (Capability Gap), Q10 (Solution Map)',
  },
  {
    label: 'Industry Mirror',
    question: "We want to provide that five-star experience to your candidates — the same way you provide it to your guests.",
    when: 'Hospitality/service industry prospects during career site discussion',
    advances: 'Q1 (Core Problem), Q10 (Solution Map)',
  },
  {
    label: 'Trigger Event Probe',
    question: "Can you tell me — why are we having the call today? Is there something missing from the system, or has something changed that made this a priority now?",
    when: 'Opening of any discovery call (D1)',
    advances: 'Q1 (Core Problem), Q4 (Priority Level)',
  },
  {
    label: 'Growth Seed',
    question: "If the hiring volume doesn't change significantly, I wouldn't recommend switching right now. But when you're ready to scale — you'll already know the platform.",
    when: 'When prospect is price-sensitive and current tool is adequate for volume',
    advances: 'Q4 (Priority Level), Q8 (Readiness)',
  },
  {
    label: 'Multi-Thread Demand',
    question: "Who else needs to see this before a decision is made? Can we get them on the next call — even just for 15 minutes?",
    when: 'End of any call with a single stakeholder',
    advances: 'Q2 (Stakeholder Map), Q7 (Need for External Help)',
  },
  {
    label: 'Pain Quantification',
    question: "When you say it costs you — do you know roughly what that costs per quarter? Even a ballpark creates urgency.",
    when: 'When prospect acknowledges pain but doesn\'t quantify it',
    advances: 'Q1 (Core Problem), Q3 (Cost of Indecision)',
  },
  {
    label: 'Technical Debt Probe',
    question: "Is your current system built internally by a consultant or developer? Who maintains it today — and what happens when they leave?",
    when: 'When prospect has a homegrown/custom-built system',
    advances: 'Q1 (Core Problem), Q6 (Root Cause)',
  },
];

/* ------------------------------------------------------------------ */
/*  Data Arsenal                                                       */
/* ------------------------------------------------------------------ */

export const DATA_ARSENAL: Record<string, { stat: string; source: string }[]> = {
  'manual-screening': [
    { stat: '0.74% of applications result in a hire (6M apps analyzed)', source: 'Teamtailor Enterprise Data' },
    { stat: '5.4x more likely to be hired at 5/5 AI screening match', source: 'Teamtailor Enterprise Data' },
    { stat: '16M+ candidates screened through AI — this is not a guinea pig', source: 'Teamtailor Platform' },
    { stat: 'Recruiters using AI handle 246 apps vs 66 without — 3x capacity', source: 'Teamtailor Enterprise Data' },
  ],
  'screening-bottleneck': [
    { stat: '0.74% of applications result in a hire — needle in a haystack', source: 'Teamtailor Enterprise Data' },
    { stat: '5.4x more likely to be hired at 5/5 AI screening match', source: 'Teamtailor Enterprise Data' },
    { stat: '60M candidates screened through AI globally', source: 'Teamtailor Platform' },
  ],
  'poor-candidate-experience': [
    { stat: '80% of candidate withdrawals due to communication delays', source: 'Indeed 2024' },
    { stat: 'Gen Z expects to hear back in 5-7 days', source: 'Industry Research' },
    { stat: '2.6x more applications YoY vs 12 months ago', source: 'Indeed Recruit' },
  ],
  'slow-time-to-hire': [
    { stat: '80% of withdrawn applications due to communication delays', source: 'Indeed 2024' },
    { stat: 'Motorpoint: 58% reduction in time-to-hire downtime with SLA triggers', source: 'Customer Case Study' },
    { stat: 'Lotus Cars: TTH reduced from 55 → 23 days', source: 'Customer Case Study' },
  ],
  'outdated-career-site': [
    { stat: '63% of candidates research careers page before first interview', source: 'Randstad State of Employer Branding 2025' },
    { stat: 'Foot Asylum: 0% → 40% direct applications via careers page in 2 years', source: 'Customer Case Study' },
  ],
  'no-content-hub': [
    { stat: '63% of candidates research careers page before first interview', source: 'Randstad State of Employer Branding 2025' },
    { stat: 'Gen Z/Alpha prefer short-form video — attention spans require rich media', source: 'Industry Panel Discussion' },
  ],
  'high-cost-per-hire': [
    { stat: '£408/day per vacancy — one enterprise customer calculated £31M total', source: 'Anonymized Business Case' },
    { stat: '20% reduction in vacancy cost = millions in savings', source: 'Anonymized Business Case' },
    { stat: 'Foot Asylum: 17.1% of hires from Connect CRM (1 in 5 hires free)', source: 'Customer Case Study' },
  ],
  'agency-spend': [
    { stat: 'Foot Asylum: 17.1% of 2,500 hires from Connect — massive agency offset', source: 'Customer Case Study' },
    { stat: '200,000 applications via careers page = zero job board cost', source: 'Foot Asylum Case Study' },
  ],
  'weak-talent-pools': [
    { stat: 'Foot Asylum: 17.1% of all hires from Connect talent pool', source: 'Customer Case Study' },
    { stat: '13,000 customers with aggregated benchmarking data available', source: 'Teamtailor Platform' },
  ],
  'locked-out-managers': [
    { stat: 'Octavo: 100% hiring manager adoption in ~3 months (from technophobic HMs)', source: 'Customer Case Study' },
    { stat: 'Savills: Embedded training videos on dashboard — 15,000 employee org', source: 'Customer Case Study' },
  ],
  'hris-ats-rigidity': [
    { stat: 'Paycom is double the cost of a standard HRIS with limited ATS capabilities', source: 'Eagle Mountain Casino evaluation' },
    { stat: '90% of hiring managers bypass HRIS recruiting modules due to clunky desktop UIs', source: 'Platform Adoption Benchmark' },
  ],
  'agency-to-in-house-transition': [
    { stat: 'Foot Asylum: Direct hiring model cut agency spend by 65% in 18 months', source: 'Customer Case Study' },
    { stat: 'Average agency fee is 15-20% of first-year salary ($15K+ per hire)', source: 'Industry Standard' },
  ],
  'mobile-retail-capture-gap': [
    { stat: 'JD Sports: 40% candidate capture boost using in-store QR codes', source: 'Retail Case Study' },
    { stat: 'Over 60% of retail/hospitality job seekers apply on a mobile device', source: 'Indeed Benchmark' },
  ],
  'candidate-communication-black-hole': [
    { stat: '80% of candidate withdrawals due to communication delays', source: 'Indeed 2024' },
    { stat: 'Gen Z/Alpha expect contact in 24-48 hours via text/SMS', source: 'Industry Panel' },
    { stat: 'Indeed Study: 80% of withdrawn applications could be prevented with automated triggers', source: 'Indeed Research' },
  ],
  'email-deliverability': [
    { stat: 'JazzHR users report candidate emails consistently going to spam — candidates never see interview invites', source: 'JK Transcript: Henley / Centre Tech' },
    { stat: 'Teamtailor uses enterprise-grade email infrastructure with SPF/DKIM/DMARC compliance', source: 'Teamtailor Platform' },
  ],
  'gdpr-automation-gap': [
    { stat: 'GDPR fines can reach €20M or 4% of global annual turnover — whichever is higher', source: 'EU GDPR Regulation' },
    { stat: 'Teamtailor is GDPR-native with automated consent management, data retention, and right-to-deletion', source: 'Teamtailor Platform' },
  ],
  'duplicate-candidate-mess': [
    { stat: 'Duplicate records create false pipeline metrics — one candidate counted as 3 inflates funnel data', source: 'Industry Research' },
    { stat: 'Teamtailor automatically detects and merges duplicate candidate profiles', source: 'Teamtailor Platform' },
  ],
  'hm-handwritten-notes': [
    { stat: 'Hiring managers using handwritten notes create zero audit trail — legal risk in discrimination claims', source: 'Employment Law Best Practice' },
    { stat: 'Teamtailor mobile app: hiring managers leave structured feedback in 30 seconds from their phone', source: 'Teamtailor Platform' },
  ],
  'job-posting-formatting': [
    { stat: 'Job postings with broken formatting get 40% fewer applications than properly formatted listings', source: 'LinkedIn Talent Solutions' },
    { stat: "Teamtailor's multi-channel distribution preserves formatting across LinkedIn, Indeed, and 30+ job boards", source: 'Teamtailor Platform' },
  ],
  'adoption-gap': [
    { stat: 'Amy Bush / Outform: 3.5-4 hours every Monday doing manual reports that should be automated', source: 'JK Transcript: Outform' },
    { stat: 'Octavo: 100% hiring manager adoption in ~3 months — even from technophobic managers', source: 'Customer Case Study' },
  ],
  'careers-page-ownership-conflict': [
    { stat: 'James Keating builds a custom Teamtailor career site in 15 minutes live on demo calls — zero IT dependency', source: 'JK Demo Technique' },
    { stat: '63% of candidates research careers page before first interview', source: 'Randstad Employer Branding 2025' },
  ],
  'application-volume-explosion': [
    { stat: 'Jessica/Henley: reviewed 60 CVs in 2 hours with zero qualified candidates — AI screening fixes this', source: 'JK Transcript: Henley' },
    { stat: 'Recruiters using AI handle 246 apps vs 66 without — 3x capacity increase', source: 'Teamtailor Enterprise Data' },
  ],
  'internal-mobility-gap': [
    { stat: 'Companies with strong internal mobility reduce external hiring costs by 20-30%', source: 'Industry Research' },
    { stat: 'Teamtailor Connect enables internal talent pools and cross-brand job visibility', source: 'Teamtailor Platform' },
  ],
  'interview-governance-gap': [
    { stat: 'Unstructured interviews are only 14% predictive vs. 26% for structured interviews', source: 'Schmidt & Hunter Meta-Analysis' },
    { stat: 'Teamtailor Interview Kits provide standardized scorecards and AI-generated questions', source: 'Teamtailor Platform' },
  ],
  'application-form-rigidity': [
    { stat: 'Zeus International: "It asks the same questions for every role — housekeeping to engineering. Not possible to cut them."', source: 'Thanos Transcript: Zeus International' },
    { stat: 'Customizable application forms increase completion rates by 30-40%', source: 'Industry Research' },
  ],
  'hiring-forecast-gap': [
    { stat: 'Smart NS: "The team hasn\'t learned how to work with forecasting yet. If we need people like yesterday, that\'s going to cost us."', source: 'Thanos Transcript: Smart NS' },
    { stat: 'Reactive hiring costs 30-50% more than planned hiring due to agency dependency', source: 'Industry Research' },
  ],
  'scorecard-manual-aggregation': [
    { stat: 'GR8 Tech: "I do it manually. After filling the scorecards for all managers — I manually aggregate. Not like an average."', source: 'Thanos Transcript: GR8 Tech' },
    { stat: 'Structured interviews with auto-aggregated scorecards are 26% predictive vs 14% for unstructured', source: 'Schmidt & Hunter Meta-Analysis' },
  ],
  'multi-country-career-site': [
    { stat: 'BYD: 40+ countries needed localized career sites — Chinese, Thai, English, and more', source: 'Thanos Transcript: BYD' },
    { stat: 'Vopak: Career site split across Dutch/English subdomains with inconsistent branding', source: 'Thanos Transcript: Vopak' },
    { stat: 'Teamtailor supports 30+ languages with per-page localization', source: 'Teamtailor Platform' },
  ],
};

/* ------------------------------------------------------------------ */
/*  Deal Kill Flags                                                    */
/* ------------------------------------------------------------------ */

export interface DealKillFlag {
  id: string;
  severity: 'critical' | 'warning';
  label: string;
  reason: string;
  fix: string;
}

export function computeDealKillFlags(session: DiscoverySession): DealKillFlag[] {
  const flags: DealKillFlag[] = [];
  const answers = computeBAPAnswers(session);

  const c1Score = getCheckpointScore(answers, 1);
  const c2Score = getCheckpointScore(answers, 2);
  const checkpoint = c1Score >= 5 ? (c2Score >= 5 ? 2 : 1) : 0;

  if (checkpoint >= 1 && !answers['q1']) {
    flags.push({
      id: 'no-pain-quantified',
      severity: 'critical',
      label: 'Pain not quantified',
      reason: 'Q1 (Quantified Pain) is unanswered. You cannot advance past CP1 without a number on the pain.',
      fix: 'Ask: "If you had to put a dollar figure on what this costs you — in time, missed hires, and agency spend — what would you say?"'
    });
  }

  if (checkpoint >= 1 && !answers['q2']) {
    flags.push({
      id: 'no-dm',
      severity: 'critical',
      label: 'Decision maker unknown',
      reason: 'Q2 (Stakeholder Map) is unanswered. Deals without a mapped decision maker close at <20%.',
      fix: 'Ask: "Who else in the organization feels this problem — and who ultimately signs off on a decision like this?"'
    });
  }

  if (checkpoint >= 2 && !answers['q8']) {
    flags.push({
      id: 'no-budget',
      severity: 'critical',
      label: 'Budget unconfirmed',
      reason: 'Q8 (Budget) is unanswered. Do not send a proposal without budget confirmation.',
      fix: 'Ask: "Have you set aside budget for a solution like this, or is this coming from a discretionary pool?"'
    });
  }

  if (!answers['q3']) {
    flags.push({
      id: 'no-urgency',
      severity: 'warning',
      label: 'Cost of inaction unclear',
      reason: 'Q3 (Cost of Indecision) is unanswered. Without urgency, deals stall.',
      fix: 'Ask: "What happens to the business if this stays exactly as it is for the next 12 months?"'
    });
  }

  if (session.persona === 'chro' && !answers['q2']) {
    flags.push({
      id: 'no-champion',
      severity: 'warning',
      label: 'Champion not identified',
      reason: 'CHRO-only deals without a TA champion have high stall risk — the champion drives internal momentum.',
      fix: 'Ask: "Who on your team would own the day-to-day relationship with us — and are they in the loop on this conversation?"'
    });
  }

  if (answers['q5'] === 'no') {
    flags.push({
      id: 'reactive-buyer',
      severity: 'warning',
      label: 'Reactive buyer pattern',
      reason: 'Prospect has not proactively tried to solve this. May not have urgency to act now.',
      fix: 'Ask: "Is there a specific event — a hiring plan, a board mandate, a renewal — that\'s driving you to solve this now rather than later?"'
    });
  }

  if (checkpoint >= 1 && !answers['q4']) {
    flags.push({
      id: 'not-top-priority',
      severity: 'warning',
      label: 'Priority level unknown',
      reason: 'Q4 (Priority) is unanswered. If this isn\'t in their top 3, it will get deprioritized.',
      fix: 'Ask: "Is solving this in your top 3 priorities right now, or is there something above it on the list?"'
    });
  }

  if (checkpoint >= 1 && (!session.stakeholders || session.stakeholders.length <= 1)) {
    flags.push({
      id: 'single-threaded',
      severity: 'critical',
      label: 'Single-threaded deal',
      reason: 'Only one (or no) stakeholder mapped. Single-threaded deals close at <20%. Multi-threading is required.',
      fix: 'Ask: "Who else feels this problem? Can we get them on the next call — even just for 15 minutes?"'
    });
  }

  if (!session.next_meeting_date && session.deal_stage !== 'closed_won' && session.deal_stage !== 'closed_lost') {
    const ageMs = Date.now() - new Date(session.created_at).getTime();
    if (ageMs > 3 * 24 * 60 * 60 * 1000) {
      flags.push({
        id: 'no-next-meeting',
        severity: 'critical',
        label: 'No next meeting scheduled',
        reason: 'Deal is 3+ days old with no next meeting. ALWAYS book the next step before hanging up.',
        fix: 'Reach out now. Don\'t end any future call without a confirmed next date on the calendar.'
      });
    }
  }

  if (checkpoint >= 1 && !session.competitors_identified && !answers['q10']) {
    flags.push({
      id: 'competitor-unmapped',
      severity: 'warning',
      label: 'Competitor landscape unknown',
      reason: 'No competitors identified. You cannot position effectively without knowing who else is in the evaluation.',
      fix: 'Ask: "Are you looking at any other solutions right now? It helps me focus on what matters most to you."'
    });
  }

  return flags;
}

/* ------------------------------------------------------------------ */
/*  Section Definitions for Room Builder                               */
/* ------------------------------------------------------------------ */

export type SectionKey = keyof RoomVisibility;

export interface SectionDef {
  key: SectionKey;
  label: string;
  icon: React.ElementType;
  hasConfig: boolean;
  description: string;
}

export const SECTIONS: SectionDef[] = [
  // D1
  { key: 'hero', label: 'Hero', icon: Sparkles, hasConfig: false, description: 'Opening branded section — company name, theme' },
  { key: 'pains', label: 'Priorities', icon: Target, hasConfig: true, description: 'Pain points & objectives shown to the prospect' },
  { key: 'problemCanvas', label: 'Executive Brief', icon: ClipboardList, hasConfig: false, description: 'Discovery summary for prospect' },
  { key: 'buyingProcess', label: 'Buying Process', icon: Calendar, hasConfig: false, description: 'Decision process, timeline & budget context' },
  { key: 'successCriteria', label: 'Success Criteria', icon: Target, hasConfig: false, description: 'What a successful outcome looks like' },
  { key: 'worstCase', label: 'Worst-Case Scenario', icon: Shield, hasConfig: false, description: 'Cost of inaction — what happens if nothing changes' },
  { key: 'roi', label: 'ROI Calculator', icon: DollarSign, hasConfig: true, description: 'Business impact calculator & inputs' },
  // D2
  { key: 'competitive', label: 'Competitive', icon: Swords, hasConfig: false, description: 'ATS teardown, competitor sheet & sentiment' },
  { key: 'diagnosis', label: 'Root Cause', icon: Search, hasConfig: false, description: 'Root cause reframe — auto-generated' },
  { key: 'contractSecurity', label: 'Contract & Security', icon: ShieldCheck, hasConfig: false, description: 'Trust center & security docs' },
  // D3
  { key: 'socialProof', label: 'Social Proof', icon: Award, hasConfig: true, description: 'Case studies & customer stats' },
  { key: 'paradigmShift', label: 'Paradigm Shift', icon: Lightbulb, hasConfig: false, description: 'Hope vs Design framework' },
  { key: 'solution', label: 'Solution Walkthrough', icon: Lightbulb, hasConfig: true, description: 'Demo focus areas mapped to 3 Pillars' },
  { key: 'playbooks', label: 'Playbooks', icon: BookOpen, hasConfig: true, description: 'Operational playbooks — matched from pains' },
  // D4
  { key: 'minimumStandards', label: 'Minimum Standards', icon: ShieldCheck, hasConfig: false, description: 'Mutual commitments before pricing' },
  { key: 'map', label: 'Action Plan', icon: ClipboardList, hasConfig: false, description: 'Mutual Action Plan & milestones' },
  { key: 'pricing', label: 'Proposal & Pricing', icon: DollarSign, hasConfig: true, description: 'Build your proposal with pricing, add-ons & terms' },
  { key: 'proposal', label: 'Next Steps', icon: Shield, hasConfig: true, description: 'Timeline, budget & commitments' },
];

/* ------------------------------------------------------------------ */
/*  Gap Test note-supporting questions                                 */
/* ------------------------------------------------------------------ */

export const NOTE_QUESTIONS = new Set(['q5', 'q6', 'q7']);
