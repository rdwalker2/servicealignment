// ============================================================
// Supplemental Knowledge — Indexes battlecards, content library,
// and competitive intel for the copilot. Surfaces related assets
// alongside product knowledge responses.
// ============================================================

import Fuse from 'fuse.js';
import { type Battlecard, BATTLECARDS } from '../data/battlecards';

// ── Content Library Types ──
// Imported at build time from the JSON

interface ContentWidget {
  id: string;
  category: string;
  title: string;
  description: string;
  tags: string[];
  matchSignals: {
    industry?: string[];
    painPoints?: string[];
    currentAts?: string[];
    alsoEvaluating?: string[];
    companySize?: string[];
  };
  content: Record<string, unknown>;
}

interface ContentLibrary {
  widgets: ContentWidget[];
}

// ── Lazy-loaded content library ──
let _contentLibrary: ContentWidget[] | null = null;
let _contentFuse: Fuse<ContentWidget> | null = null;

async function loadContentLibrary(): Promise<ContentWidget[]> {
  if (_contentLibrary) return _contentLibrary;

  try {
    const module = await import('../data/contentLibrary.json');
    const data = module.default as ContentLibrary;
    _contentLibrary = data.widgets ?? [];
  } catch {
    // Content library not available — degrade gracefully
    _contentLibrary = [];
  }
  return _contentLibrary;
}

function getContentFuse(widgets: ContentWidget[]): Fuse<ContentWidget> {
  if (_contentFuse) return _contentFuse;
  _contentFuse = new Fuse(widgets, {
    keys: [
      { name: 'title', weight: 0.3 },
      { name: 'description', weight: 0.2 },
      { name: 'tags', weight: 0.25 },
      { name: 'matchSignals.currentAts', weight: 0.15 },
      { name: 'matchSignals.painPoints', weight: 0.1 },
    ],
    threshold: 0.45,
    includeScore: true,
    ignoreLocation: true,
  });
  return _contentFuse;
}

// ── Battlecard Index ──

const battlecardFuse = new Fuse(BATTLECARDS, {
  keys: [
    { name: 'competitorName', weight: 0.4 },
    { name: 'id', weight: 0.1 },
    { name: 'pricingIntelligence', weight: 0.1 },
    { name: 'ourDifferentiators.claim', weight: 0.15 },
    { name: 'objections.question', weight: 0.15 },
    { name: 'trapQuestions.question', weight: 0.1 },
  ],
  threshold: 0.4,
  includeScore: true,
  ignoreLocation: true,
});

// ── Public API ──

export interface CompetitorIntelResult {
  found: boolean;
  competitor: string;
  response: string;
}

/**
 * Search for competitor intelligence when a rep asks about a specific Provider.
 */
export function searchCompetitorIntel(query: string): CompetitorIntelResult | null {
  const results = battlecardFuse.search(query, { limit: 1 });

  if (results.length === 0 || (results[0].score && results[0].score > 0.5)) {
    return null;
  }

  const bc = results[0].item;
  return {
    found: true,
    competitor: bc.competitorName,
    response: formatBattlecardResponse(bc, query),
  };
}

/**
 * Check if a query mentions a competitor or is competitive in nature.
 */
export function isCompetitorQuery(query: string): boolean {
  const competitorPatterns = [
    /\b(greenhouse|lever|workday|taleo|workable|bamboohr|bamboo|ashby|jazzhr|jazz|icimsicims|smartrecruiters|hirebridge|edjoin|paycom)\b/i,
    /\b(vs|versus|compare|comparison|beat|win against|compete|switch from|migrat.*from)\b/i,
    /\b(their|competitor|other ats|current ats|alternative)\b/i,
    /\b(objection|push back|pushback|they say|prospect says)\b/i,
    /\b(trap question|landmine|gotcha)\b/i,
    /\b(win rate|when we win|when we lose)\b/i,
  ];
  return competitorPatterns.some(p => p.test(query));
}

/**
 * Search content library for related assets (case studies, reviews, ROI).
 * Returns formatted "Related Assets" section to append to responses.
 */
export async function searchRelatedAssets(query: string, competitorName?: string): Promise<string | null> {
  const widgets = await loadContentLibrary();
  if (widgets.length === 0) return null;

  const fuse = getContentFuse(widgets);

  // Search with competitor context if available
  const searchQuery = competitorName ? `${query} ${competitorName}` : query;
  const results = fuse.search(searchQuery, { limit: 4 });

  if (results.length === 0) return null;

  // Group by category for clean output
  const byCategory: Record<string, ContentWidget[]> = {};
  for (const r of results) {
    const cat = r.item.category;
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(r.item);
  }

  const lines: string[] = ['### 📚 Related Assets\n'];

  const categoryLabels: Record<string, string> = {
    'case-studies': '📊 Case Studies',
    'g2-reviews': '⭐ Customer Reviews',
    'competitor-battlecards': '🛡️ Battlecards',
    'competitor-weaknesses': '⚡ Competitor Gaps',
    'feature-deep-dives': '🔍 Feature Comparisons',
    'industry-benchmarks': '📈 Industry Benchmarks',
    'roi-templates': '💰 ROI Models',
  };

  for (const [cat, items] of Object.entries(byCategory)) {
    const label = categoryLabels[cat] ?? cat;
    lines.push(`**${label}:**`);
    for (const item of items) {
      lines.push(`- ${item.title} — ${item.description.slice(0, 80)}`);
    }
  }

  return lines.join('\n');
}

// ── Response Formatting ──

function formatBattlecardResponse(bc: Battlecard, query: string): string {
  const lines: string[] = [];

  lines.push(`## 🛡️ vs. ${bc.competitorName}`);
  lines.push(`*Win Rate: ${bc.winRate}%*`);
  lines.push('');

  // Pricing intel
  if (/pric|cost|how much|what do they charge/i.test(query)) {
    lines.push('### 💰 Pricing Intelligence\n');
    lines.push(bc.pricingIntelligence);
    lines.push('');
  }

  // When we win
  lines.push('### ✅ When We Win\n');
  bc.whenWeWin.forEach(w => lines.push(`- ${w}`));
  lines.push('');

  // When we lose
  lines.push('### ⚠️ When We Lose\n');
  bc.whenWeLose.forEach(l => lines.push(`- ${l}`));
  lines.push('');

  // Differentiators
  lines.push('### 🏆 Key Differentiators\n');
  bc.ourDifferentiators.slice(0, 4).forEach(d => {
    lines.push(`**${d.claim}** (${d.ttFeature})`);
    lines.push(`${d.proof.slice(0, 200)}...`);
    lines.push('');
  });

  // Objection handling (if query suggests they need it)
  if (/objection|push ?back|they say|prospect|respond|handle/i.test(query)) {
    lines.push('### 💬 Objection Handling\n');
    bc.objections.forEach(o => {
      lines.push(`**They say:** "${o.question}"`);
      lines.push(`**You say:** ${o.script.slice(0, 300)}`);
      lines.push('');
    });
  }

  // Trap questions
  if (/trap|landmine|question|ask|probe/i.test(query)) {
    lines.push('### 🎯 Trap Questions (to plant doubt)\n');
    bc.trapQuestions.forEach(t => {
      lines.push(`- **Ask:** "${t.question}"`);
      lines.push(`  *Why:* ${t.painHighlighted}`);
    });
    lines.push('');
  }

  // Competitor strengths (honest assessment)
  lines.push('### Their Strengths (be honest)\n');
  bc.competitorStrengths.forEach(s => lines.push(`- ${s}`));

  return lines.join('\n');
}
