// ============================================================
// Product Knowledge Engine — Fuzzy search + structured responses
// for product, implementation, onboarding, pricing, migration,
// and security questions.
//
// Phase 1: Offline-first with Fuse.js. No API calls, instant,
// deterministic, zero cost.
// ============================================================

import Fuse from 'fuse.js';
import { type WikiFeature, productWikiData } from '../data/productWiki';
import { csWikiData } from '../data/csWiki';

// ── Combined Knowledge Base ──

const ALL_KNOWLEDGE: WikiFeature[] = [...productWikiData, ...csWikiData];

// ── Accuracy Playbook — Known Corrections ──
// Hard-coded from product_accuracy_playbook.md so we can check
// every response for known mistake patterns.

interface AccuracyCorrection {
  keywords: string[];
  wrongClaim: string;
  correction: string;
}

const ACCURACY_CORRECTIONS: AccuracyCorrection[] = [
  {
    keywords: ['caldav', 'calendar', 'ical'],
    wrongClaim: 'CalDAV calendar sync is supported',
    correction: 'Only Google Calendar and Outlook (via Cronofy). CalDAV is explicitly NOT supported.',
  },
  {
    keywords: ['department', 'division', 'career site', 'separate'],
    wrongClaim: 'Separate career sites per Department',
    correction: 'Departments share ONE career site. Separate career sites require Divisions (a different, higher-tier feature).',
  },
  {
    keywords: ['onboarding', 'skip', 'ats', 'direct'],
    wrongClaim: 'Direct-to-onboarding (skip the ATS)',
    correction: 'Every person must go through the ATS first. Fastest path: evergreen job → add candidate → move to Hired → Start Onboarding.',
  },
  {
    keywords: ['i-9', 'i9', 'e-verify', 'everify'],
    wrongClaim: 'TT collects I-9 documents',
    correction: 'TT does NOT collect or manage I-9/E-Verify. It only provides a reminder task with deadline tracking.',
  },
  {
    keywords: ['onboarding', 'complete', 'webhook', 'completion'],
    wrongClaim: 'Webhook fires on "onboarding completion"',
    correction: 'Webhooks fire on stage changes (e.g., moved to "Hired"). There is no "onboarding complete" webhook event.',
  },
  {
    keywords: ['smart move', 'reject', 'auto-reject', 'auto reject'],
    wrongClaim: 'Smart Move auto-rejects candidates',
    correction: 'Smart Move only auto-advances. Quick Reject is the separate feature for rejections. Don\'t conflate them.',
  },
  {
    keywords: ['whatsapp', 'sms'],
    wrongClaim: 'WhatsApp works like SMS in Teamtailor',
    correction: 'WhatsApp is Click-to-Chat only — messages do NOT sync back to TT. SMS is native two-way via Twilio.',
  },
  {
    keywords: ['copilot', 'zoom', 'teams', 'meet', 'video'],
    wrongClaim: 'Co-pilot video features work with Zoom/Teams',
    correction: 'Meeting Insights works with Zoom/Teams/Meet via a recording bot. BUT: some Co-pilot video AI features require TT\'s built-in video tool.',
  },
  {
    keywords: ['payroll', 'native', 'integration'],
    wrongClaim: '30+ native payroll integrations',
    correction: 'TT connects to payroll via webhooks + middleware (Zapier, Make, or custom). Not "native sync."',
  },
  {
    keywords: ['knockout', 'auto-reject', 'block', 'disqualify'],
    wrongClaim: 'Traditional knockout auto-reject questions',
    correction: 'Co-pilot evaluates and flags candidates. Rejection is via manual action or Triggers — not instant auto-reject from application form.',
  },
];

// ── Fuse.js Search Index ──

const fuseOptions: Fuse.IFuseOptions<WikiFeature> = {
  keys: [
    { name: 'title', weight: 0.3 },
    { name: 'subtitle', weight: 0.15 },
    { name: 'searchAliases', weight: 0.25 },
    { name: 'tags', weight: 0.1 },
    { name: 'whatItDoes', weight: 0.1 },
    { name: 'id', weight: 0.1 },
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
};

const fuse = new Fuse(ALL_KNOWLEDGE, fuseOptions);

// ── Follow-up Context ──
// Tracks the last product topic so vague follow-ups like
// "how do you set it up?" or "is it included?" resolve correctly.

let _lastProductTopic: WikiFeature | null = null;

/**
 * Resolve vague follow-up queries by injecting the last topic.
 * Returns a rewritten query, or the original if no follow-up detected.
 */
export function resolveFollowUp(query: string): string {
  if (!_lastProductTopic) return query;

  // Detect vague pronouns/references that suggest a follow-up
  const followUpPatterns = [
    /^(how|what|can|does|is|do|tell)\b.*\b(it|that|this|the feature|the module|the add.?on)\b/i,
    /^(set.?up|configure|implement|how.?much|is.?it|does.?it|pricing for)\b/i,
    /^(more|details|explain|elaborate|go.?deeper|tell me more)/i,
    /^(and|also|what about|how about)\b/i,
  ];

  const isFollowUp = followUpPatterns.some(p => p.test(query.trim()));
  if (!isFollowUp) return query;

  // Inject the last topic's name to disambiguate
  const topic = _lastProductTopic.title;
  const rewritten = `${query.replace(/\b(it|that|this|the feature|the module|the add.?on)\b/gi, topic)} ${topic}`;
  return rewritten;
}

function _trackTopic(item: WikiFeature): void {
  _lastProductTopic = item;
}

/** Get the current follow-up topic (for testing/debugging) */
export function getLastProductTopic(): WikiFeature | null {
  return _lastProductTopic;
}

// ── Public API ──

export interface ProductKnowledgeResult {
  found: boolean;
  response: string;
  sources: WikiFeature[];
}

/**
 * Search the product knowledge base and return a structured response.
 * This is the main entry point for product questions.
 */
export function searchProductKnowledge(query: string): ProductKnowledgeResult {
  const results = fuse.search(query, { limit: 5 });

  if (results.length === 0 || (results[0].score && results[0].score > 0.5)) {
    return {
      found: false,
      response: formatNoMatchResponse(query),
      sources: [],
    };
  }

  const topResult = results[0].item;
  const secondaryResults = results.slice(1, 3).map(r => r.item);

  // Track for follow-up context
  _trackTopic(topResult);

  // Check for accuracy corrections relevant to this query
  const corrections = findRelevantCorrections(query, topResult);

  return {
    found: true,
    response: formatKnowledgeResponse(topResult, secondaryResults, corrections, query),
    sources: [topResult, ...secondaryResults],
  };
}

/**
 * Determine if a query is a product/implementation question
 * (vs. a deal-coaching question handled by the existing copilot)
 */
export function isProductKnowledgeQuery(query: string): boolean {
  const productPatterns = [
    // Product capability: "does TT do X?" / "can we X?" / "do we have X?"
    /\b(does tt|does teamtailor|do we (have|support|offer|do|integrate)|can (we|tt|teamtailor)|is there a?)\b/i,
    // Feature-specific: "how does X work?" / "what is X?"
    /\b(how does|what is|what are|tell me about|explain)\b.*\b(feature|work|module|tool)\b/i,
    // Implementation: "how do you set up X?" / "how to configure X?"
    /\b(set ?up|setup|configure|implement|deploy|install|activate|enable)\b/i,
    // Onboarding/CS: "onboarding" / "CSM" / "after we sign" / "support"
    /\b(onboard|after.?sign|csm|customer success|handover|hand ?off|training|webinar|activation)\b/i,
    // Pricing: "cost" / "price" / "included" / "add-on" / "extra"
    /\b(cost|price|pricing|how much|included|add.?on|extra charge|free|pay for)\b/i,
    // Migration: "migrate" / "import" / "transfer" / "bring data"
    /\b(migrat|import|transfer|bring.?data|csv|move.?data|export)\b/i,
    // Security/Compliance: "SSO" / "SOC" / "GDPR" / "security"
    /\b(sso|saml|scim|2fa|soc|gdpr|security|compliance|data.?resid|hosting|encrypt|single.?tenant)\b/i,
    // Integration-specific: "integrate with X" / "X integration"
    /\b(integrat|connect|webhook|api |zapier|cronofy|checkr|linkedin|indeed|marketplace)\b/i,
    // Feature names: direct references to known features
    /\b(smart ?(move|schedule)|co.?pilot|triggers?|referral|career.?site|nurture|connect|interview.?kit|pipeline|requisition|approval|e.?sign|video.?question|sms|whatsapp|promote|bi.?connector|candidate.?bank|screening)\b/i,
    // "Is X available?" / "Does X support Y?"
    /\b(available|support|compatible|work with)\b/i,
    // Timeline questions
    /\b(how long|timeline|go.?live|launch|deploy|weeks?|days?)\b.*\b(implement|setup|set.?up|onboard|migrat|import)\b/i,
    // SLA and support
    /\b(sla|uptime|support.?level|response.?time)\b/i,
  ];

  return productPatterns.some(p => p.test(query));
}

// ── Intent-Specific Handlers ──
// These are used by copilotEngine.ts to route specific question types

export function handleProductCapabilityQuery(query: string): string | null {
  const result = searchProductKnowledge(query);
  return result.response;
}

export function handleImplementationQuery(query: string): string | null {
  // Boost implementation-related entries
  const implResults = fuse.search(query, { limit: 5 });

  if (implResults.length === 0) {
    return formatNoMatchResponse(query);
  }

  const top = implResults[0].item;
  _trackTopic(top);
  const corrections = findRelevantCorrections(query, top);
  return formatImplementationResponse(top, corrections, query);
}

export function handleOnboardingQuery(query: string): string | null {
  // Search specifically for onboarding/CS entries
  const onboardingEntries = ALL_KNOWLEDGE.filter(k =>
    ['onboarding', 'handoff', 'csm-operations', 'training'].includes(k.category)
  );
  const onboardingFuse = new Fuse(onboardingEntries, fuseOptions);
  const results = onboardingFuse.search(query, { limit: 3 });

  if (results.length === 0) {
    // Fall back to general search
    return searchProductKnowledge(query).response;
  }

  const top = results[0].item;
  _trackTopic(top);
  const related = results.slice(1).map(r => r.item);
  const corrections = findRelevantCorrections(query, top);

  return formatOnboardingResponse(top, related, corrections);
}

export function handlePricingQuery(query: string): string | null {
  // Search pricing-related entries
  const pricingEntries = ALL_KNOWLEDGE.filter(k =>
    k.category === 'pricing-negotiation' ||
    k.addOn === true ||
    (k.implementationNotes?.includes('$') ?? false)
  );
  const pricingFuse = new Fuse(pricingEntries, fuseOptions);
  const results = pricingFuse.search(query, { limit: 3 });

  if (results.length === 0) {
    return searchProductKnowledge(query).response;
  }

  const top = results[0].item;
  _trackTopic(top);
  const corrections = findRelevantCorrections(query, top);
  return formatPricingResponse(top, corrections);
}

export function handleMigrationQuery(query: string): string | null {
  const migrationEntries = ALL_KNOWLEDGE.filter(k =>
    k.category === 'data-migration' ||
    k.id.includes('import') || k.id.includes('migration')
  );
  const migrationFuse = new Fuse(migrationEntries, fuseOptions);
  const results = migrationFuse.search(query, { limit: 3 });

  if (results.length === 0) {
    return searchProductKnowledge(query).response;
  }

  const top = results[0].item;
  _trackTopic(top);
  const related = results.slice(1).map(r => r.item);
  const corrections = findRelevantCorrections(query, top);
  return formatMigrationResponse(top, related, corrections);
}

export function handleSecurityQuery(query: string): string | null {
  const securityEntries = ALL_KNOWLEDGE.filter(k =>
    ['implementation'].includes(k.category) &&
    (k.tags?.some(t => ['security', 'SSO', 'SCIM', 'hosting', 'architecture'].includes(t)) ?? false)
    || k.id.includes('security') || k.id.includes('platform-architecture')
    || k.id.includes('single-tenant') || k.id.includes('sla')
  );
  const securityFuse = new Fuse(securityEntries, fuseOptions);
  const results = securityFuse.search(query, { limit: 3 });

  if (results.length === 0) {
    return searchProductKnowledge(query).response;
  }

  const top = results[0].item;
  _trackTopic(top);
  const related = results.slice(1).map(r => r.item);
  const corrections = findRelevantCorrections(query, top);
  return formatSecurityResponse(top, related, corrections);
}

// ── Response Formatting ──

function getVerificationBadge(item: WikiFeature): string {
  if (item.status === 'verified') {
    return `✅ **Verified** (${item.lastVerified ?? 'date unknown'})`;
  } else if (item.status === 'needs-review') {
    return `⚠️ **Needs Review** — verify before quoting to a prospect`;
  }
  return `❓ **Unverified** — verify with Product/CS before using`;
}

function formatDoNotSay(items: string[]): string {
  if (!items || items.length === 0) return '';
  const lines = ['### ⚠️ Watch Out\n'];
  items.forEach(d => lines.push(`- ${d}`));
  return lines.join('\n');
}

function formatProspectQA(qa: { q: string; a: string }[]): string {
  if (!qa || qa.length === 0) return '';
  const lines = ['### 💬 If They Ask\n'];
  qa.forEach(item => {
    lines.push(`**Q:** ${item.q}`);
    lines.push(`**A:** ${item.a}\n`);
  });
  return lines.join('\n');
}

function formatSourceCitation(item: WikiFeature): string {
  const parts = [`📎 Source: ${item.category} › ${item.title}`];
  if (item.supportDocUrl) {
    parts.push(`📄 [Support Article](${item.supportDocUrl})`);
  }
  if (item.verifiedBy) {
    parts.push(`🔍 Verified by: ${item.verifiedBy}`);
  }
  return parts.join('\n');
}

function formatPlanStatus(item: WikiFeature): string {
  if (item.addOn) {
    return '💰 **Paid add-on** — check pricing before quoting';
  }
  const plans = item.plans;
  if (plans && plans.includes('all')) {
    return '📦 **Included on all plans**';
  }
  if (plans && plans.length > 0) {
    return `📦 Available on: ${plans.join(', ')}`;
  }
  return '';
}

function formatKnowledgeResponse(
  top: WikiFeature,
  secondary: WikiFeature[],
  corrections: AccuracyCorrection[],
  query: string,
): string {
  const lines: string[] = [];

  // Verification badge
  lines.push(getVerificationBadge(top));
  lines.push('');

  // Title
  lines.push(`## ${top.title}`);
  if (top.subtitle) lines.push(`*${top.subtitle}*`);
  lines.push('');

  // Main answer
  if (top.whatItDoes) {
    lines.push(top.whatItDoes);
    lines.push('');
  }

  // Plan status
  const planStatus = formatPlanStatus(top);
  if (planStatus) {
    lines.push(planStatus);
    lines.push('');
  }

  // How it works (if query asks "how")
  if (/how|setup|set.?up|configure|works?|step/i.test(query) && top.howItWorks) {
    lines.push('### How It Works\n');
    lines.push(top.howItWorks);
    lines.push('');
  }

  // Implementation notes (if available and relevant)
  if (top.implementationNotes && /setup|set.?up|implement|configure|deploy|install/i.test(query)) {
    lines.push('### Setup Details\n');
    lines.push(top.implementationNotes);
    lines.push('');
  }

  // doNotSay warnings
  if (top.doNotSay && top.doNotSay.length > 0) {
    lines.push(formatDoNotSay(top.doNotSay));
    lines.push('');
  }

  // Prospect Q&A
  if (top.prospectQA && top.prospectQA.length > 0) {
    lines.push(formatProspectQA(top.prospectQA));
  }

  // Accuracy corrections
  if (corrections.length > 0) {
    lines.push('### 🚨 Known Accuracy Issue\n');
    corrections.forEach(c => {
      lines.push(`- **Don't say:** ${c.wrongClaim}`);
      lines.push(`  **Truth:** ${c.correction}`);
    });
    lines.push('');
  }

  // Related features
  if (secondary.length > 0) {
    lines.push('### Related\n');
    secondary.forEach(s => {
      lines.push(`- **${s.title}** — ${s.subtitle ?? s.whatItDoes?.slice(0, 80) ?? ''}`);
    });
    lines.push('');
  }

  // Source
  lines.push('---');
  lines.push(formatSourceCitation(top));

  return lines.join('\n');
}

function formatImplementationResponse(
  top: WikiFeature,
  corrections: AccuracyCorrection[],
  query: string,
): string {
  const lines: string[] = [];

  lines.push(getVerificationBadge(top));
  lines.push('');
  lines.push(`## ⚙️ ${top.title}`);
  if (top.subtitle) lines.push(`*${top.subtitle}*`);
  lines.push('');

  if (top.whatItDoes) {
    lines.push(top.whatItDoes);
    lines.push('');
  }

  if (top.howItWorks) {
    lines.push('### Step-by-Step\n');
    lines.push(top.howItWorks);
    lines.push('');
  }

  if (top.implementationNotes) {
    lines.push('### Implementation Details\n');
    lines.push(top.implementationNotes);
    lines.push('');
  }

  const planStatus = formatPlanStatus(top);
  if (planStatus) {
    lines.push(planStatus);
    lines.push('');
  }

  if (top.doNotSay && top.doNotSay.length > 0) {
    lines.push(formatDoNotSay(top.doNotSay));
    lines.push('');
  }

  if (top.prospectQA && top.prospectQA.length > 0) {
    lines.push(formatProspectQA(top.prospectQA));
  }

  if (corrections.length > 0) {
    lines.push('### 🚨 Known Accuracy Issue\n');
    corrections.forEach(c => {
      lines.push(`- **Don't say:** ${c.wrongClaim}`);
      lines.push(`  **Truth:** ${c.correction}`);
    });
    lines.push('');
  }

  lines.push('---');
  lines.push(formatSourceCitation(top));

  return lines.join('\n');
}

function formatOnboardingResponse(
  top: WikiFeature,
  related: WikiFeature[],
  corrections: AccuracyCorrection[],
): string {
  const lines: string[] = [];

  lines.push(getVerificationBadge(top));
  lines.push('');
  lines.push(`## 🤝 ${top.title}`);
  if (top.subtitle) lines.push(`*${top.subtitle}*`);
  lines.push('');

  if (top.whatItDoes) {
    lines.push(top.whatItDoes);
    lines.push('');
  }

  if (top.howItWorks) {
    lines.push('### Process\n');
    lines.push(top.howItWorks);
    lines.push('');
  }

  if (top.implementationNotes) {
    lines.push('### Key Details\n');
    lines.push(top.implementationNotes);
    lines.push('');
  }

  if (top.doNotSay && top.doNotSay.length > 0) {
    lines.push(formatDoNotSay(top.doNotSay));
    lines.push('');
  }

  if (top.prospectQA && top.prospectQA.length > 0) {
    lines.push(formatProspectQA(top.prospectQA));
  }

  if (corrections.length > 0) {
    lines.push('### 🚨 Known Accuracy Issue\n');
    corrections.forEach(c => {
      lines.push(`- **Don't say:** ${c.wrongClaim}`);
      lines.push(`  **Truth:** ${c.correction}`);
    });
    lines.push('');
  }

  if (related.length > 0) {
    lines.push('### Related CS Topics\n');
    related.forEach(r => {
      lines.push(`- **${r.title}** — ${r.subtitle ?? ''}`);
    });
    lines.push('');
  }

  lines.push('---');
  lines.push(formatSourceCitation(top));

  return lines.join('\n');
}

function formatPricingResponse(
  top: WikiFeature,
  corrections: AccuracyCorrection[],
): string {
  const lines: string[] = [];

  lines.push(getVerificationBadge(top));
  lines.push('');
  lines.push(`## 💰 ${top.title}`);
  if (top.subtitle) lines.push(`*${top.subtitle}*`);
  lines.push('');

  if (top.whatItDoes) {
    lines.push(top.whatItDoes);
    lines.push('');
  }

  const planStatus = formatPlanStatus(top);
  if (planStatus) {
    lines.push(planStatus);
    lines.push('');
  }

  if (top.implementationNotes) {
    lines.push('### Pricing Details\n');
    lines.push(top.implementationNotes);
    lines.push('');
  }

  if (top.doNotSay && top.doNotSay.length > 0) {
    lines.push(formatDoNotSay(top.doNotSay));
    lines.push('');
  }

  if (top.prospectQA && top.prospectQA.length > 0) {
    lines.push(formatProspectQA(top.prospectQA));
  }

  if (corrections.length > 0) {
    lines.push('### 🚨 Known Accuracy Issue\n');
    corrections.forEach(c => {
      lines.push(`- **Don't say:** ${c.wrongClaim}`);
      lines.push(`  **Truth:** ${c.correction}`);
    });
    lines.push('');
  }

  lines.push('---');
  lines.push(formatSourceCitation(top));

  return lines.join('\n');
}

function formatMigrationResponse(
  top: WikiFeature,
  related: WikiFeature[],
  corrections: AccuracyCorrection[],
): string {
  const lines: string[] = [];

  lines.push(getVerificationBadge(top));
  lines.push('');
  lines.push(`## 📦 ${top.title}`);
  if (top.subtitle) lines.push(`*${top.subtitle}*`);
  lines.push('');

  if (top.whatItDoes) {
    lines.push(top.whatItDoes);
    lines.push('');
  }

  if (top.howItWorks) {
    lines.push('### Process\n');
    lines.push(top.howItWorks);
    lines.push('');
  }

  if (top.implementationNotes) {
    lines.push('### Details & Pricing\n');
    lines.push(top.implementationNotes);
    lines.push('');
  }

  if (top.doNotSay && top.doNotSay.length > 0) {
    lines.push(formatDoNotSay(top.doNotSay));
    lines.push('');
  }

  if (top.prospectQA && top.prospectQA.length > 0) {
    lines.push(formatProspectQA(top.prospectQA));
  }

  if (corrections.length > 0) {
    lines.push('### 🚨 Known Accuracy Issue\n');
    corrections.forEach(c => {
      lines.push(`- **Don't say:** ${c.wrongClaim}`);
      lines.push(`  **Truth:** ${c.correction}`);
    });
    lines.push('');
  }

  if (related.length > 0) {
    lines.push('### Other Migration Options\n');
    related.forEach(r => {
      lines.push(`- **${r.title}** — ${r.subtitle ?? ''}`);
    });
    lines.push('');
  }

  lines.push('---');
  lines.push(formatSourceCitation(top));

  return lines.join('\n');
}

function formatSecurityResponse(
  top: WikiFeature,
  related: WikiFeature[],
  corrections: AccuracyCorrection[],
): string {
  const lines: string[] = [];

  lines.push(getVerificationBadge(top));
  lines.push('');
  lines.push(`## 🔒 ${top.title}`);
  if (top.subtitle) lines.push(`*${top.subtitle}*`);
  lines.push('');

  if (top.whatItDoes) {
    lines.push(top.whatItDoes);
    lines.push('');
  }

  if (top.howItWorks) {
    lines.push('### Details\n');
    lines.push(top.howItWorks);
    lines.push('');
  }

  if (top.implementationNotes) {
    lines.push('### Implementation\n');
    lines.push(top.implementationNotes);
    lines.push('');
  }

  const planStatus = formatPlanStatus(top);
  if (planStatus) {
    lines.push(planStatus);
    lines.push('');
  }

  if (top.doNotSay && top.doNotSay.length > 0) {
    lines.push(formatDoNotSay(top.doNotSay));
    lines.push('');
  }

  if (top.prospectQA && top.prospectQA.length > 0) {
    lines.push(formatProspectQA(top.prospectQA));
  }

  if (corrections.length > 0) {
    lines.push('### 🚨 Known Accuracy Issue\n');
    corrections.forEach(c => {
      lines.push(`- **Don't say:** ${c.wrongClaim}`);
      lines.push(`  **Truth:** ${c.correction}`);
    });
    lines.push('');
  }

  if (related.length > 0) {
    lines.push('### Related Security Topics\n');
    related.forEach(r => {
      lines.push(`- **${r.title}** — ${r.subtitle ?? ''}`);
    });
    lines.push('');
  }

  lines.push('---');
  lines.push(formatSourceCitation(top));

  return lines.join('\n');
}

function formatNoMatchResponse(query: string): string {
  return [
    `❓ **No verified information found** for: "${query}"`,
    '',
    `I don't have a verified answer for this in the product wiki or CS knowledge base.`,
    '',
    '**Where to check:**',
    '- 📄 [TT Support Docs](https://support.teamtailor.com)',
    '- 📘 [API Docs](https://docs.teamtailor.com)',
    '- 💬 Ask in #product-questions on Slack',
    '',
    '> If this is something reps need to know, hit 👎 so we can add it to the knowledge base.',
  ].join('\n');
}

// ── Accuracy Playbook Checker ──

function findRelevantCorrections(query: string, item: WikiFeature): AccuracyCorrection[] {
  const lowerQuery = query.toLowerCase();
  const lowerTitle = (item.title ?? '').toLowerCase();
  const lowerId = (item.id ?? '').toLowerCase();
  const lowerDesc = (item.whatItDoes ?? '').toLowerCase();

  const searchText = `${lowerQuery} ${lowerTitle} ${lowerId} ${lowerDesc}`;

  return ACCURACY_CORRECTIONS.filter(correction =>
    correction.keywords.some(kw => searchText.includes(kw.toLowerCase()))
  );
}
