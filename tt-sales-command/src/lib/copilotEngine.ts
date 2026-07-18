// ============================================================
// Copilot Engine — Context aggregation, smart responses, LLM streaming
// ============================================================

import {
  type DiscoverySession,
  getSessionsForRep,
  getAllDiscoverySessions,
  computeBAPAnswers,
  getCheckpointScore,
  BAP_QUESTIONS,
} from './discoveryDatabase';
import { computeGoalForecast, type GoalForecast } from './goalForecast';
import { scoreDeal } from './leaderboard';
import { fmtCurrency, fmtNum, fmtPct } from './calculations';
import {
  isProductKnowledgeQuery,
  searchProductKnowledge,
  handleProductCapabilityQuery,
  handleImplementationQuery,
  handleOnboardingQuery,
  handlePricingQuery,
  handleMigrationQuery,
  handleSecurityQuery,
  resolveFollowUp,
} from './productKnowledgeEngine';
import {
  isCompetitorQuery,
  searchCompetitorIntel,
} from './supplementalKnowledge';

// ── Types ──

export interface CopilotContext {
  currentRoute: string;
  currentPage: string;
  activeSession: DiscoverySession | null;
  goalForecast: GoalForecast | null;
  pipelineStats: PipelineStats;
  stalledDeals: DiscoverySession[];
  upcomingMeetings: DiscoverySession[];
  userName: string;
  userRole: string;
}

export interface PipelineStats {
  totalDeals: number;
  byStage: Record<string, number>;
  avgHealth: number;
  totalValue: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface SuggestedPrompt {
  label: string;
  prompt: string;
  icon: string;
}

// ── Context Builder ──

export function buildCopilotContext(
  route: string,
  userId: string | null,
  userRole: string,
  userName: string,
  activeSession: DiscoverySession | null,
): CopilotContext {
  const sessions = userId ? getSessionsForRep(userId) : getAllDiscoverySessions();

  // Pipeline stats
  const byStage: Record<string, number> = {};
  let totalScore = 0;
  let totalValue = 0;
  sessions.forEach((s) => {
    const stage = s.deal_stage ?? 'qualifying';
    byStage[stage] = (byStage[stage] || 0) + 1;
    totalScore += scoreDeal(s).totalPoints;
    totalValue += s.deal_value || 0;
  });
  const avgHealth = sessions.length > 0 ? Math.round(totalScore / sessions.length) : 0;

  // Stalled deals: no next action, no meeting, and some age
  const now = Date.now();
  const stalledDeals = sessions.filter((s) => {
    if (s.deal_stage === 'closed_won' || s.deal_stage === 'closed_lost') return false;
    const hasNextAction = !!s.next_action?.trim();
    const hasNextMeeting = !!s.next_meeting_date;
    const daysSinceCreated = (now - new Date(s.created_at).getTime()) / 86400000;
    return !hasNextAction && !hasNextMeeting && daysSinceCreated > 1;
  });

  // Upcoming meetings (next 48h)
  const in48h = now + 48 * 60 * 60 * 1000;
  const upcomingMeetings = sessions.filter((s) => {
    if (!s.next_meeting_date) return false;
    const meetTime = new Date(s.next_meeting_date).getTime();
    return meetTime >= now && meetTime <= in48h;
  });

  // Goal forecast
  const today = new Date();
  let goalForecast: GoalForecast | null = null;
  if (userId) {
    goalForecast = computeGoalForecast(userId, today.getFullYear(), today.getMonth());
  }

  // Current page name from route
  const pageName = getPageName(route);

  return {
    currentRoute: route,
    currentPage: pageName,
    activeSession,
    goalForecast,
    pipelineStats: { totalDeals: sessions.length, byStage, avgHealth, totalValue },
    stalledDeals,
    upcomingMeetings,
    userName,
    userRole,
  };
}

function getPageName(route: string): string {
  if (route.includes('/discovery')) return 'Discovery Rooms';
  if (route.includes('/pipeline')) return 'Pipeline';
  if (route.includes('/leaderboard')) return 'Leaderboard';
  if (route.includes('/analytics')) return 'Analytics';
  if (route.includes('/playbook')) return 'Sales Playbook';
  if (route.includes('/battlecards')) return 'Battlecards';
  if (route.includes('/operations')) return 'Operating Rhythm';
  if (route.includes('/goal-wizard')) return 'Goal Wizard';
  if (route.includes('/data')) return 'Data Modeling';
  if (route.includes('/ssp')) return 'Strategic Sales Plan';

  if (route === '/team' || route === '/team/') return 'Dashboard';
  return 'Dashboard';
}

// ── Suggested Prompts (context-aware) ──

export function getSuggestedPrompts(ctx: CopilotContext): SuggestedPrompt[] {
  const prompts: SuggestedPrompt[] = [];

  if (ctx.activeSession && ctx.currentPage === 'Discovery Rooms') {
    prompts.push(
      { label: 'Prep me for this call', prompt: `Prep me for my call with ${ctx.activeSession.company_name}`, icon: '🎯' },
      { label: "What's missing?", prompt: `What's missing in my BAP for ${ctx.activeSession.company_name}?`, icon: '📋' },
      { label: 'Draft follow-up', prompt: `Draft a follow-up email for ${ctx.activeSession.company_name}`, icon: '✉️' },
    );
  } else if (ctx.currentPage === 'Pipeline') {
    prompts.push(
      { label: 'Stalled deals', prompt: 'Which deals are stalled and need attention?', icon: '⚠️' },
      { label: 'Pipeline health', prompt: 'Give me a pipeline health summary', icon: '📊' },
    );
  } else {
    prompts.push(
      { label: 'Focus today', prompt: 'What should I focus on today?', icon: '⚡' },
      { label: 'My pacing', prompt: "How's my pacing this month?", icon: '📊' },
    );
  }

  // Always add these
  prompts.push(
    { label: 'Deals needing attention', prompt: 'What deals need attention?', icon: '🔔' },
  );

  // Product knowledge prompts (always available)
  prompts.push(
    { label: 'Product question', prompt: 'Does TT support...', icon: '🔍' },
    { label: 'Implementation', prompt: 'How do you set up...', icon: '⚙️' },
    { label: 'After they sign', prompt: 'What happens after signing?', icon: '🤝' },
    { label: 'vs. Competitor', prompt: 'How do we beat Greenhouse?', icon: '🛡️' },
  );

  // Context-aware: migration prompt if prospect has an ATS
  if (ctx.activeSession?.current_ats && ctx.activeSession.current_ats !== 'None') {
    prompts.push(
      { label: `Migration from ${ctx.activeSession.current_ats}`, prompt: `How do we migrate data from ${ctx.activeSession.current_ats}?`, icon: '📦' },
    );
  }

  return prompts;
}

// ── Smart Offline Responses ──

type IntentHandler = (ctx: CopilotContext, query: string) => string | null;

const INTENT_HANDLERS: { pattern: RegExp; handler: IntentHandler }[] = [
  // ── Product Knowledge Handlers (checked FIRST) ──
  // Security/Compliance — specific terms that should always route to security
  {
    pattern: /\b(sso|saml|scim|2fa|soc.?2|gdpr|data.?resid|single.?tenant|hosting|encrypt|penetration|audit.?log)\b/i,
    handler: (_ctx, query) => handleSecurityQuery(query),
  },
  // Migration — specific data import/transfer terms
  {
    pattern: /\b(migrat|data.?import|csv.?import|transfer.?data|bring.?(over|data)|move.?data|import.?candidate)\b/i,
    handler: (_ctx, query) => handleMigrationQuery(query),
  },
  // Onboarding/CS — post-sale, CSM, handover questions
  {
    pattern: /\b(after.?(we|they)?.?sign|onboard|csm.?(assign|tier)|customer.?success|handover|hand.?off|activation.?webinar|go.?live.?timeline|implement.?timeline)\b/i,
    handler: (_ctx, query) => handleOnboardingQuery(query),
  },
  // Pricing — cost, included, add-on questions
  {
    pattern: /\b(how.?much.?(does|is|cost)|what.?(does|is).?the.?price|is.?(it|this).?(included|free|extra)|add.?on.?(cost|price|fee)|pricing.?(for|of)|discount.?(policy|cap|rule)|free.?months?|split.?pay|ramp.?off|multi.?year)\b/i,
    handler: (_ctx, query) => handlePricingQuery(query),
  },
  // Implementation/Setup — how to configure/set up
  {
    pattern: /\b(how.?do.?(you|we|i).?(set|configure|implement|deploy|install|activate|enable)|set.?up.?(guide|process|steps)|implementation.?(steps|process|guide)|configure.?(the|a|our))\b/i,
    handler: (_ctx, query) => handleImplementationQuery(query),
  },
  // Competitor Intelligence — battlecard queries about specific competitors
  {
    pattern: /\b(greenhouse|lever|workday|taleo|workable|bamboohr|bamboo|ashby|jazzhr|jazz|icims|smartrecruiters|hirebridge|edjoin|paycom|vs|versus|compare|comparison|beat|compete|switch.?from|objection|push.?back|trap.?question|landmine|win.?rate|when.?we.?win|when.?we.?lose|battlecard)\b/i,
    handler: (_ctx, query) => {
      if (isCompetitorQuery(query)) {
        const result = searchCompetitorIntel(query);
        if (result?.found) return result.response;
      }
      return null;
    },
  },
  // General Product Knowledge — broad catch-all for product questions
  // This uses the isProductKnowledgeQuery classifier for accuracy
  {
    pattern: /\b(does.?(tt|teamtailor)|do.?(we|you).?(have|support|offer|integrate)|can.?(we|tt|you|teamtailor)|is.?there.?a|feature|integrat|how.?does.?.*work|what.?is.?the|tell.?me.?about|smart.?schedule|smart.?move|co.?pilot|career.?site|referral|webhook|api|trigger|screening|nurture|connect|interview.?kit|requisition|e.?sign|video.?question|sms|whatsapp|promote|bi.?connector|candidate.?bank|marketplace)\b/i,
    handler: (_ctx, query) => {
      // Double-check with the classifier to avoid false positives
      if (isProductKnowledgeQuery(query)) {
        return handleProductCapabilityQuery(query);
      }
      return null; // Let other handlers try
    },
  },

  // ── Deal Coaching Handlers (existing) ──
  // Focus / priorities
  {
    pattern: /\b(focus|priorit|today|should i|what.s first|action items)\b/i,
    handler: handleFocusQuery,
  },
  // Pacing / numbers
  {
    pattern: /\b(pacing|pace|track|numbers?|how.?m i|month|forecast|attain)\b/i,
    handler: handlePacingQuery,
  },
  // BAP / missing
  {
    pattern: /\b(bap|missing|gap|checkpoint|buyer action)\b/i,
    handler: handleBAPQuery,
  },
  // Stalled / attention
  {
    pattern: /\b(stall|stuck|attention|need.?attention|at risk|risk)\b/i,
    handler: handleStalledQuery,
  },
  // Pipeline
  {
    pattern: /\b(pipeline|funnel|stage|deals?|overview|summary|health)\b/i,
    handler: handlePipelineQuery,
  },
  // Prep / call
  {
    pattern: /\b(prep|call|meeting|brief|prepare)\b/i,
    handler: handlePrepQuery,
  },
  // Follow-up / email
  {
    pattern: /\b(follow.?up|email|draft|re.?engage|outreach)\b/i,
    handler: handleEmailQuery,
  },
];

export function generateSmartResponse(ctx: CopilotContext, query: string): string {
  // Resolve vague follow-ups: "how do you set it up?" → "how do you set up Smart Schedule?"
  const resolvedQuery = resolveFollowUp(query);

  for (const { pattern, handler } of INTENT_HANDLERS) {
    if (pattern.test(resolvedQuery)) {
      const result = handler(ctx, resolvedQuery);
      if (result) return result;
    }
  }
  // Also try the original query in case resolution changed it too much
  if (resolvedQuery !== query) {
    for (const { pattern, handler } of INTENT_HANDLERS) {
      if (pattern.test(query)) {
        const result = handler(ctx, query);
        if (result) return result;
      }
    }
  }
  return generateDefaultResponse(ctx);
}

// ── Intent Handlers ──

function handleFocusQuery(ctx: CopilotContext): string | null {
  const lines: string[] = [];
  lines.push(`Here's your priority list for today, ${ctx.userName.split(' ')[0]}:\n`);

  let priority = 1;

  // Bottleneck from goal forecast
  if (ctx.goalForecast?.bottleneck) {
    const b = ctx.goalForecast.bottleneck;
    lines.push(`**${priority}. Fix your #1 drag: ${b.label}**`);
    lines.push(`   ${b.impact}\n`);
    priority++;
  }

  // Stalled deals
  if (ctx.stalledDeals.length > 0) {
    lines.push(`**${priority}. Unblock ${ctx.stalledDeals.length} stalled deal${ctx.stalledDeals.length > 1 ? 's' : ''}**`);
    ctx.stalledDeals.slice(0, 3).forEach((d) => {
      const days = Math.floor((Date.now() - new Date(d.created_at).getTime()) / 86400000);
      lines.push(`   → ${d.company_name} — no next action set (${days}d old)`);
    });
    lines.push('');
    priority++;
  }

  // Upcoming meetings
  if (ctx.upcomingMeetings.length > 0) {
    lines.push(`**${priority}. Prepare for ${ctx.upcomingMeetings.length} upcoming meeting${ctx.upcomingMeetings.length > 1 ? 's' : ''}**`);
    ctx.upcomingMeetings.forEach((d) => {
      const when = d.next_meeting_date
        ? new Date(d.next_meeting_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        : '';
      lines.push(`   → ${d.company_name} — ${when}`);
    });
    lines.push('');
    priority++;
  }

  // Pacing check
  if (ctx.goalForecast && ctx.goalForecast.monthlyGoalRevenue > 0) {
    const pct = Math.round(ctx.goalForecast.pacingPct * 100);
    const status = ctx.goalForecast.status;
    const emoji = status === 'on_track' ? '🟢' : status === 'at_risk' ? '🟡' : '🔴';
    lines.push(`**${priority}. Month-to-date pacing: ${emoji} ${pct}%** (${fmtCurrency(ctx.goalForecast.pacingRevenue)} projected vs ${fmtCurrency(ctx.goalForecast.monthlyGoalRevenue)} goal)`);
  }

  if (priority === 1) {
    return `All systems green, ${ctx.userName.split(' ')[0]}! ✨\n\nNo stalled deals, no meetings in the next 48h, and no urgent bottlenecks. Keep pushing — momentum is everything.`;
  }

  return lines.join('\n');
}

function handlePacingQuery(ctx: CopilotContext): string | null {
  const f = ctx.goalForecast;
  if (!f || f.monthlyGoalRevenue === 0) {
    return `You don't have a monthly goal set yet. Head to **Goal Wizard** to set your targets — then I can track your pacing in real time.`;
  }

  const pct = Math.round(f.pacingPct * 100);
  const emoji = f.status === 'on_track' ? '🟢' : f.status === 'at_risk' ? '🟡' : '🔴';
  const lines: string[] = [];

  lines.push(`## ${emoji} Pacing: ${pct}%\n`);
  lines.push(`**Projected**: ${fmtCurrency(f.pacingRevenue)} of ${fmtCurrency(f.monthlyGoalRevenue)} goal`);

  if (f.gapRevenue > 0 && f.weeksRemaining > 0) {
    lines.push(`**Gap**: ${fmtCurrency(f.gapRevenue)} remaining — need ${fmtCurrency(f.requiredPerWeek)}/week for the next ${f.weeksRemaining} week${f.weeksRemaining > 1 ? 's' : ''}`);
  } else if (f.gapRevenue === 0) {
    lines.push(`\n🎯 **Goal achieved!** Keep pushing to blow past target.`);
  }

  if (f.metricPacing.length > 0) {
    lines.push(`\n### Metric Breakdown\n`);
    lines.push('| Metric | Actual | Pro-rated Goal | Pacing |');
    lines.push('|--------|--------|----------------|--------|');
    f.metricPacing.forEach((m) => {
      const metricPct = Math.round(m.pct * 100);
      const indicator = metricPct >= 85 ? '🟢' : metricPct >= 50 ? '🟡' : '🔴';
      lines.push(`| ${m.label} | ${fmtNum(Math.round(m.actual))} | ${fmtNum(Math.round(m.goal))} | ${indicator} ${metricPct}% |`);
    });
  }

  if (f.bottleneck) {
    lines.push(`\n> ⚠️ **#1 Drag — ${f.bottleneck.label}**: ${f.bottleneck.impact}`);
  }

  return lines.join('\n');
}

function handleBAPQuery(ctx: CopilotContext, query: string): string | null {
  // Try to find a matching session
  const session = findSessionFromQuery(ctx, query) ?? ctx.activeSession;
  if (!session) {
    return `I don't see an active discovery room. Open a deal first, then ask me about the BAP gaps.`;
  }

  const answers = computeBAPAnswers(session);
  const cp1Score = getCheckpointScore(answers, 1);
  const cp2Score = getCheckpointScore(answers, 2);
  const cp3Score = getCheckpointScore(answers, 3);

  const lines: string[] = [];
  lines.push(`## BAP Analysis — ${session.company_name}\n`);

  // Checkpoint summary
  const cpStatus = (score: number, max: number) =>
    score >= max - 2.5 ? '✅ Passed' : score >= max / 2 ? '⚠️ At Risk' : '❌ Needs Work';

  lines.push(`| Checkpoint | Score | Status |`);
  lines.push(`|---|---|---|`);
  lines.push(`| CP1: Urgency Test | ${cp1Score}/10 | ${cpStatus(cp1Score, 10)} |`);
  lines.push(`| CP2: Gap Test | ${cp2Score}/10 | ${cpStatus(cp2Score, 10)} |`);
  lines.push(`| CP3: Solution Fit | ${cp3Score}/10 | ${cpStatus(cp3Score, 10)} |`);

  // Unanswered questions
  const unanswered = BAP_QUESTIONS.filter((q) => {
    const a = answers[q.id];
    return !a || a === 'no';
  });

  if (unanswered.length > 0) {
    lines.push(`\n### Missing Answers (${unanswered.length})\n`);
    unanswered.forEach((q) => {
      lines.push(`- **${q.title}**: ${q.question}`);
    });
    lines.push(`\n💡 Focus on CP${unanswered[0].checkpoint} first — answer "${unanswered[0].title}" in your next conversation.`);
  } else {
    lines.push(`\n✨ All BAP questions answered! This deal is well-qualified.`);
  }

  return lines.join('\n');
}

function handleStalledQuery(ctx: CopilotContext): string | null {
  if (ctx.stalledDeals.length === 0) {
    return `All clear! 🟢 None of your deals are stalled. Every active deal has a next action or upcoming meeting set.`;
  }

  const lines: string[] = [];
  lines.push(`## ⚠️ ${ctx.stalledDeals.length} Deal${ctx.stalledDeals.length > 1 ? 's' : ''} Need${ctx.stalledDeals.length === 1 ? 's' : ''} Attention\n`);

  ctx.stalledDeals.forEach((d) => {
    const days = Math.floor((Date.now() - new Date(d.created_at).getTime()) / 86400000);
    const score = scoreDeal(d).totalPoints;
    const painCount = d.selected_pains?.length ?? 0;
    const stage = d.deal_stage ?? 'qualifying';

    lines.push(`### ${d.company_name}`);
    lines.push(`- **Stage**: ${stage.charAt(0).toUpperCase() + stage.slice(1)} · **Health**: ${score}% · **Age**: ${days}d`);
    lines.push(`- **Pains**: ${painCount > 0 ? painCount + ' identified' : '⚠️ None identified'}`);
    lines.push(`- **Missing**: No next action, no meeting scheduled`);
    lines.push(`- **Recommended**: Set a next action and schedule a follow-up within 48h\n`);
  });

  return lines.join('\n');
}

function handlePipelineQuery(ctx: CopilotContext): string | null {
  const s = ctx.pipelineStats;
  if (s.totalDeals === 0) {
    return `Your pipeline is empty. Create a Discovery Room to start tracking your first deal.`;
  }

  const lines: string[] = [];
  lines.push(`## Pipeline Summary\n`);
  lines.push(`**${s.totalDeals} active deals** · Avg health: **${s.avgHealth}%** · Total value: **${fmtCurrency(s.totalValue)}**\n`);

  const stageLabels: Record<string, string> = {
    discovery: 'D1 — Discovery',
    diagnosis: 'D2 — Diagnosis',
    demonstrate: 'D3 — Demonstrate',
    decision: 'D4 — Decision',
    closed_won: '✅ Closed Won',
    closed_lost: '❌ Closed Lost',
  };

  lines.push('| Stage | Deals |');
  lines.push('|-------|-------|');
  Object.entries(s.byStage).forEach(([stage, count]) => {
    lines.push(`| ${stageLabels[stage] || stage} | ${count} |`);
  });

  if (ctx.stalledDeals.length > 0) {
    lines.push(`\n> ⚠️ **${ctx.stalledDeals.length} deal${ctx.stalledDeals.length > 1 ? 's' : ''} stalled** — no next action or meeting set. Ask me "which deals need attention?" for details.`);
  }

  return lines.join('\n');
}

function handlePrepQuery(ctx: CopilotContext, query: string): string | null {
  const session = findSessionFromQuery(ctx, query) ?? ctx.activeSession;
  if (!session) {
    return `I need to know which company to prep for. Try: "Prep me for my call with [Company Name]"`;
  }

  const score = scoreDeal(session).totalPoints;
  const answers = computeBAPAnswers(session);
  const cp1 = getCheckpointScore(answers, 1);
  const cp2 = getCheckpointScore(answers, 2);
  const cp3 = getCheckpointScore(answers, 3);

  const lines: string[] = [];
  lines.push(`## 🎯 Call Prep — ${session.company_name}\n`);

  // Quick stats
  const stage = session.deal_stage ?? 'qualifying';
  lines.push(`**Stage**: ${stage.charAt(0).toUpperCase() + stage.slice(1)} · **Health**: ${score}% · **Value**: ${session.deal_value > 0 ? fmtCurrency(session.deal_value) : 'Not set'}\n`);

  // Pains
  if (session.selected_pains.length > 0) {
    lines.push(`### Pain Points`);
    session.selected_pains.forEach((p) => lines.push(`- ${p}`));
    lines.push('');
  } else {
    lines.push(`> ⚠️ No pains identified yet. Your #1 job on this call is to uncover at least 2-3 specific pains.\n`);
  }

  // Persona & ATS
  if (session.persona || session.current_ats) {
    lines.push(`### Context`);
    if (session.persona) lines.push(`- **Persona**: ${formatPersona(session.persona)}`);
    if (session.current_ats && session.current_ats !== 'None') lines.push(`- **Current ATS**: ${session.current_ats}`);
    if (session.industry) lines.push(`- **Industry**: ${session.industry}`);
    if (session.company_size) lines.push(`- **Size**: ${session.company_size} employees`);
    lines.push('');
  }

  // BAP gaps — what to push on
  const unanswered = BAP_QUESTIONS.filter((q) => {
    const a = answers[q.id];
    return !a || a === 'no';
  });
  if (unanswered.length > 0) {
    lines.push(`### Questions to Answer on This Call`);
    unanswered.slice(0, 4).forEach((q) => {
      lines.push(`- **${q.title}**: ${q.question}`);
    });
    lines.push('');
  }

  // Next action reminder
  if (session.next_action) {
    lines.push(`### Committed Next Action`);
    lines.push(`→ ${session.next_action}\n`);
  }

  // Stakeholders
  if (session.stakeholders && session.stakeholders.length > 0) {
    const named = session.stakeholders.filter((s) => s.name.trim());
    if (named.length > 0) {
      lines.push(`### Key Stakeholders`);
      named.forEach((s) => lines.push(`- **${s.name}** — ${s.role}${s.title ? ` (${s.title})` : ''}`));
      lines.push('');
    }
  }

  // Champion check
  if (!session.champion_name) {
    lines.push(`> 💡 **No champion identified yet.** Try to identify who will champion this internally.`);
  }

  return lines.join('\n');
}

function handleEmailQuery(ctx: CopilotContext, query: string): string | null {
  const session = findSessionFromQuery(ctx, query) ?? ctx.activeSession;
  if (!session) {
    return `I need a company context to draft an email. Open a Discovery Room first, or say "Draft email for [Company Name]".`;
  }

  const firstName = ctx.userName.split(' ')[0];
  const pains = session.selected_pains;
  const company = session.company_name;

  const lines: string[] = [];
  lines.push(`## ✉️ Follow-Up Email — ${company}\n`);
  lines.push('---\n');
  lines.push(`**Subject**: Following up on our conversation, ${company}\n`);
  lines.push(`Hi [Contact Name],\n`);
  lines.push(`Great speaking with you! I wanted to recap a few things we discussed:\n`);

  if (pains.length > 0) {
    lines.push(`**Key challenges we aligned on:**`);
    pains.slice(0, 3).forEach((p) => lines.push(`- ${p}`));
    lines.push('');
  }

  if (session.roi_total > 0) {
    lines.push(`Based on our conversation, the potential impact of solving these challenges is approximately **${fmtCurrency(session.roi_total)}** annually.\n`);
  }

  if (session.next_action) {
    lines.push(`**Next Steps**: ${session.next_action}\n`);
  } else {
    lines.push(`I'd love to schedule a follow-up to dive deeper into how we can help. Would [Day] at [Time] work for a 30-minute call?\n`);
  }

  lines.push(`Looking forward to continuing the conversation.\n`);
  lines.push(`Best,`);
  lines.push(`${firstName}`);
  lines.push('\n---\n');
  lines.push('*Copy and customize this email before sending. Personalize the greeting and specific details.*');

  return lines.join('\n');
}

function generateDefaultResponse(ctx: CopilotContext): string {
  const firstName = ctx.userName.split(' ')[0];
  const lines: string[] = [];

  lines.push(`Hey ${firstName}! 👋 Here's what I can help with:\n`);
  lines.push(`### 🔍 Product Knowledge\n`);
  lines.push(`- **"Does TT support [feature]?"** — verified product answers with watch-outs`);
  lines.push(`- **"How do you set up SSO?"** — implementation guides with gotchas`);
  lines.push(`- **"What happens after they sign?"** — onboarding process, CSM tiers`);
  lines.push(`- **"How much does data migration cost?"** — pricing with details`);
  lines.push(`- **"Is SSO included?"** — plan/add-on status for any feature`);
  lines.push(`- **"Where is data hosted?"** — security, compliance, architecture\n`);
  lines.push(`### 📊 Deal Coaching\n`);
  lines.push(`- **"What should I focus on today?"** — prioritized action list`);
  lines.push(`- **"How's my pacing?"** — month-to-date goal tracking`);
  lines.push(`- **"Prep me for [Company]"** — call prep brief`);
  lines.push(`- **"What's missing in my BAP?"** — BAP gap analysis`);
  lines.push(`- **"Draft follow-up for [Company]"** — email template`);
  lines.push(`- **"Pipeline summary"** — deal stage overview`);

  if (ctx.activeSession) {
    lines.push(`\nI can see you're in **${ctx.activeSession.company_name}**'s Discovery Room — try asking me to prep you for this call!`);
  }

  return lines.join('\n');
}

// ── Helpers ──

function findSessionFromQuery(ctx: CopilotContext, query: string): DiscoverySession | null {
  // Try to extract a company name from the query
  const sessions = ctx.pipelineStats.totalDeals > 0
    ? (ctx.activeSession?.rep_id ? getSessionsForRep(ctx.activeSession.rep_id) : getAllDiscoverySessions())
    : [];

  const lower = query.toLowerCase();
  for (const s of sessions) {
    if (lower.includes(s.company_name.toLowerCase())) {
      return s;
    }
  }
  return null;
}

function formatPersona(persona: string): string {
  const map: Record<string, string> = {
    'vp-ta': 'VP Talent Acquisition',
    'dir-eb': 'Director Employer Branding',
    'chro': 'CHRO',
    'cfo': 'CFO',
    'hiring-manager': 'Hiring Manager',
  };
  return map[persona] || persona;
}

// ── LLM Streaming (Optional — requires API key) ──

const LLM_STORAGE_KEY = 'scc_copilot_llm_key';

export function getLLMApiKey(): string | null {
  try {
    return localStorage.getItem(LLM_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setLLMApiKey(key: string | null): void {
  try {
    if (key) {
      localStorage.setItem(LLM_STORAGE_KEY, key);
    } else {
      localStorage.removeItem(LLM_STORAGE_KEY);
    }
  } catch { /* noop */ }
}

function buildSystemPrompt(ctx: CopilotContext): string {
  const parts: string[] = [];

  parts.push(`You are the AI Copilot for Teamtailor's GTM Workspace. You help sales reps with both deal coaching AND product knowledge questions.`);
  parts.push(`The user's name is ${ctx.userName} (${ctx.userRole}). They are on the "${ctx.currentPage}" page.`);
  parts.push(`Be concise, actionable, and use markdown formatting. Use tables and bullet points for clarity.`);

  // Product knowledge grounding instructions
  parts.push(`\nIMPORTANT PRODUCT KNOWLEDGE RULES:`);
  parts.push(`- When answering product questions, ONLY use information from the verified product wiki and CS wiki.`);
  parts.push(`- If you're not sure about a product capability, say "I don't have verified information on that — check the support docs or ask in #product-questions."`);
  parts.push(`- NEVER claim a feature exists that isn't in the wiki. NEVER say something is included if it's actually a paid add-on.`);
  parts.push(`- Always mention "doNotSay" warnings when relevant — these are things reps must NEVER claim to prospects.`);
  parts.push(`- Key accuracy rules: CalDAV NOT supported (Google+Outlook only). Smart Move only auto-advances (Quick Reject for rejections). Every person must go through the ATS. TT does NOT collect I-9/E-Verify documents. WhatsApp is Click-to-Chat only — messages don't sync to TT. SSO/SAML is FREE on all plans.`);

  if (ctx.goalForecast && ctx.goalForecast.monthlyGoalRevenue > 0) {
    const f = ctx.goalForecast;
    parts.push(`\nGoal Forecast: Pacing at ${Math.round(f.pacingPct * 100)}% (${fmtCurrency(f.pacingRevenue)} projected vs ${fmtCurrency(f.monthlyGoalRevenue)} goal). Status: ${f.status}.`);
    if (f.bottleneck) parts.push(`#1 Bottleneck: ${f.bottleneck.label} — ${f.bottleneck.impact}`);
  }

  parts.push(`\nPipeline: ${ctx.pipelineStats.totalDeals} deals, avg health ${ctx.pipelineStats.avgHealth}%.`);
  if (ctx.stalledDeals.length > 0) {
    parts.push(`Stalled deals (no next action): ${ctx.stalledDeals.map((d) => d.company_name).join(', ')}`);
  }

  if (ctx.activeSession) {
    const s = ctx.activeSession;
    parts.push(`\nActive deal: ${s.company_name} (${s.deal_stage ?? 'qualifying'} stage)`);
    if (s.selected_pains.length > 0) parts.push(`Pains: ${s.selected_pains.join(', ')}`);
    if (s.current_ats) parts.push(`Current ATS: ${s.current_ats}`);
    if (s.persona) parts.push(`Persona: ${formatPersona(s.persona)}`);
    if (s.next_action) parts.push(`Next action: ${s.next_action}`);
    if (s.champion_name) parts.push(`Champion: ${s.champion_name}`);
    const bap = computeBAPAnswers(s);
    const unanswered = BAP_QUESTIONS.filter((q) => !bap[q.id] || bap[q.id] === 'no');
    if (unanswered.length > 0) {
      parts.push(`Unanswered BAP questions: ${unanswered.map((q) => q.title).join(', ')}`);
    }
  }

  return parts.join('\n');
}

export async function* streamLLMResponse(
  messages: ChatMessage[],
  ctx: CopilotContext,
  apiKey: string,
): AsyncGenerator<string> {
  const systemPrompt = buildSystemPrompt(ctx);

  // Dynamic wiki injection: search for relevant product knowledge
  // based on the user's latest message and inject it as grounding context
  const latestUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';
  let groundingContext = '';

  if (latestUserMsg && isProductKnowledgeQuery(latestUserMsg)) {
    const resolvedQuery = resolveFollowUp(latestUserMsg);
    const result = searchProductKnowledge(resolvedQuery);
    if (result.found && result.sources.length > 0) {
      const top = result.sources[0];
      const parts: string[] = [
        `\n\nRELEVANT PRODUCT KNOWLEDGE (use this as your primary source for answering):`,
        `Feature: ${top.title}`,
        top.subtitle ? `Subtitle: ${top.subtitle}` : '',
        `Category: ${top.category}`,
        `Status: ${top.status}${top.lastVerified ? ` (verified ${top.lastVerified})` : ''}`,
        top.whatItDoes ? `What it does: ${top.whatItDoes}` : '',
        top.howItWorks ? `How it works: ${top.howItWorks}` : '',
        top.implementationNotes ? `Implementation notes: ${top.implementationNotes}` : '',
        top.plans ? `Plans: ${top.plans.join(', ')}` : '',
        top.addOn ? `ADD-ON: This is a paid add-on, not included by default` : '',
        top.doNotSay && top.doNotSay.length > 0 ? `DO NOT SAY (critical guardrails — NEVER claim these):\n${top.doNotSay.map(d => `- ${d}`).join('\n')}` : '',
        top.prospectQA && top.prospectQA.length > 0 ? `Pre-verified Q&A:\n${top.prospectQA.map(qa => `Q: ${qa.q}\nA: ${qa.a}`).join('\n')}` : '',
        top.supportDocUrl ? `Source: ${top.supportDocUrl}` : '',
        top.verifiedBy ? `Verified by: ${top.verifiedBy}` : '',
      ].filter(Boolean);
      groundingContext = parts.join('\n');

      // Add secondary results
      if (result.sources.length > 1) {
        groundingContext += '\n\nRELATED FEATURES:\n';
        for (const s of result.sources.slice(1)) {
          groundingContext += `- ${s.title}: ${s.whatItDoes?.slice(0, 120) ?? ''}\n`;
        }
      }
    }
  }

  const apiMessages = [
    { role: 'system' as const, content: systemPrompt + groundingContext },
    ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: apiMessages,
      stream: true,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => 'Unknown error');
    yield `⚠️ API Error (${response.status}): ${errText}\n\nFalling back to smart offline mode...`;
    yield '\n\n' + generateSmartResponse(ctx, messages[messages.length - 1]?.content ?? '');
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    yield generateSmartResponse(ctx, messages[messages.length - 1]?.content ?? '');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') return;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // skip malformed JSON
      }
    }
  }
}
