import type { WikiFeature } from './productWiki';

export const industryWikiData: WikiFeature[] = [
  {
    id: 'roof-health-score',
    title: 'Roof Health Score',
    subtitle: 'Predictive degradation metric',
    category: 'metrics',
    status: 'verified',
    whatItDoes: 'A proprietary 1-100 metric calculated by the Service Alignment engine. It aggregates building age, roof material, historical NOAA weather events, and satellite imagery to predict failure probability.',
    howItWorks: 'A score of 80+ is healthy. A score below 40 triggers a "Predictive Outreach" alert to the sales team, indicating the roof is highly likely to experience water intrusion during the next rain event.',
    tags: ['metrics', 'predictive', 'kpi'],
    prospectQA: [
      {
        q: 'How do you know my roof is failing if you haven\'t been on it?',
        a: 'Our predictive engine tracks NOAA data against the specific installation year of your TPO system. The recent hail event in your grid dropped your Roof Health Score below our safety threshold. We want to do a physical inspection to verify the algorithm\'s findings before the water hits your tenants.'
      }
    ]
  },
  {
    id: 'noi',
    title: 'NOI (Net Operating Income)',
    subtitle: 'Commercial real estate valuation',
    category: 'metrics',
    status: 'verified',
    whatItDoes: 'NOI equals all revenue from the property minus all reasonably necessary operating expenses.',
    howItWorks: 'For Property Owners, the value of their building is directly tied to NOI. An unexpected $150,000 roof replacement destroys NOI for the year. We sell Preventative Maintenance as a tool to protect and stabilize their NOI.',
    tags: ['finance', 'real-estate', 'metrics']
  },
  {
    id: 'commercial-materials',
    title: 'TPO, EPDM, PVC (Membranes)',
    subtitle: 'Single-ply roofing systems',
    category: 'product',
    status: 'verified',
    whatItDoes: 'The most common commercial flat roof materials. TPO is white and reflects heat. EPDM is black rubber. PVC is highly chemical resistant.',
    howItWorks: 'Understanding the material allows you to predict failure points. TPO seams often fail after 12-15 years. EPDM shrinks and pulls at the flashing. Use this knowledge to sound like an expert during the Discovery call.',
    tags: ['materials', 'technical', 'roofing']
  }
];
