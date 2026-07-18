import type { WikiFeature } from './productWiki';

export const commercialWikiData: WikiFeature[] = [
  {
    id: 'pm-contracts',
    title: 'Preventative Maintenance (PM) Agreements',
    subtitle: 'Recurring revenue contracts',
    category: 'pricing',
    status: 'verified',
    whatItDoes: 'PM agreements are annual contracts where the client pays a fixed fee (e.g., $0.02 - $0.05 per sq/ft) for semi-annual inspections and minor maintenance (clearing drains, resealing pitch pans).',
    howItWorks: '1. Diagnose the roof.\n2. Present the Solution Roadmap.\n3. Include a PM contract as the "Good" option or attached to a "Better/Best" option.\n4. PMs guarantee we are the first call when a major replacement is eventually needed.',
    whatNotToSay: 'Do not position a PM as a "warranty." A warranty covers defects; a PM covers maintenance to keep the warranty valid.',
    tags: ['pricing', 'recurring-revenue', 'pm'],
    lastVerified: '2026-07-12',
    verifiedBy: 'RevOps',
    prospectQA: [
      {
        q: 'Why should I pay for maintenance if I just bought a new roof?',
        a: 'Every manufacturer requires documented, semi-annual maintenance to keep your 20-year NDL (No Dollar Limit) warranty valid. If a storm hits and drains are clogged with debris, the manufacturer will void your claim. The PM agreement guarantees your warranty stays intact.'
      }
    ]
  },
  {
    id: 'gbb-pricing',
    title: 'Good/Better/Best Pricing Strategy',
    subtitle: 'Scope-based negotiation',
    category: 'operations',
    status: 'verified',
    whatItDoes: 'Instead of submitting a single bid and hoping it wins, we submit three tailored options for every Diagnosis.',
    howItWorks: 'Good: Repair immediate leaks + PM agreement.\nBetter: Fluid-applied restoration (extends life 10 years).\nBest: Full tear-off and replacement (20-year warranty).',
    tags: ['pricing', 'sales-strategy', 'solution-roadmap'],
    prospectQA: [
      {
        q: 'Can you just give me your cheapest price to fix this leak?',
        a: 'We can definitely provide the "Good" option to stop the immediate water intrusion. However, as an asset manager, we want to show you the "Better" and "Best" options as well, so you can forecast this capital expenditure accurately for your investors over the next 5 years.'
      }
    ]
  }
];
