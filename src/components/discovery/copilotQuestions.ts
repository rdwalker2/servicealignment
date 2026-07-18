// ============================================================
// Contextual Discovery Questions — persona × use-case matrix
// Surfaced in CopilotDrawerContent based on session context
// ============================================================

export const CONTEXTUAL_DISCOVERY_QUESTIONS: Record<string, Record<string, string[]>> = {
  // by persona
  'dir-eb': {
    default: [
      "Your careers site — who owns updates to it today, your team or IT? How long does a typical change take?",
      "When you look at your top-of-funnel metrics, do you know your career site visit-to-application conversion rate?",
      "If a candidate lands on your careers page from a LinkedIn ad — what's the experience that greets them?",
    ],
    'replacing-ats': [
      "What specifically broke about your current setup from an employer brand perspective?",
      "Does your current Provider career page look like the rest of your brand — or does it feel like a different company?",
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
      "How do your hiring managers interact with candidates today — are they actually inside the Provider or routing around it?",
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
      "How many tools is your TA team actually using right now — Provider, CRM, careers site, analytics — and are they talking to each other?",
      "What's the annual cost of your current stack, and what percentage of your team would say they're getting full value from it?",
      "Which tool in your current stack causes the most internal complaints — and why hasn't it been fixed?",
    ],
  },
  'hiring-manager': {
    default: [
      "How do you give feedback on candidates today — inside the Provider, email, Slack, or something else?",
      "When you have a role to fill urgently, what's the fastest the current process has ever moved — and what made it fast?",
      "What would need to be true for you to say the hiring process at this company is actually working well?",
    ],
  },
  'cfo': {
    default: [
      "What percentage of your hires currently come through external agencies — and is that number going up, down, or flat?",
      "Do you know your cost-per-hire today — all in, including recruiter time, job boards, and agency fees?",
      "If I showed you that a $30K investment in the right Provider would save $200K in agency fees this year — what would you need to believe for that math to be credible?",
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

// ── Power Questions — battle-tested questions from top performers ──
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
    question: "I hear that Paycom/Paycor is simple for payroll, but how much time are your managers wasting doing manual workarounds because the Provider module is too rigid?",
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
