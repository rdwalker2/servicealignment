export interface WikiFeature {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  status: 'verified' | 'needs-review' | 'unverified';
  whatItDoes?: string;
  howItWorks?: string;
  whatNotToSay?: string;
  doNotSay?: string[]; // CS wiki format
  supportDoc?: string;
  supportDocUrl?: string;
  apiEndpoint?: string;
  apiNotes?: string;
  tags?: string[];
  lastVerified?: string;
  verifiedBy?: string;
  implementationNotes?: string;
  prospectQA?: { q: string; a: string }[];
  plans?: string[];
  addOn?: boolean;
  searchAliases?: string[];
  valueDrivers?: string[];
  discoveryQuestions?: string[];
  objections?: { q: string; a: string }[];
  competitiveTraps?: string[];
}

export const productWikiData: WikiFeature[] = [
  {
    id: 'predictive-engine',
    title: 'Infusionsoft 100.0 Predictive Engine',
    subtitle: 'The core of Service Alignment',
    category: 'core',
    status: 'verified',
    whatItDoes: 'Monitors commercial roofs 24/7 by correlating historical installation data with live NOAA weather alerts and satellite imagery.',
    howItWorks: 'The engine flags properties in the CRM when a severe weather event (wind, hail, heavy rain) crosses the geographical grid of an aging roof system. This drops the Roof Health Score and triggers a sales cadence.',
    whatNotToSay: 'Do not call it just a "CRM." It is a Predictive Marketing Engine.',
    valueDrivers: [
      'Allows reps to call with a specific, urgent reason ("Your roof just pinged us").',
      'Eliminates the need for blind cold calling.',
      'Positions the roofing contractor as a proactive tech partner.'
    ],
    prospectQA: [
      {
        q: 'How accurate is the weather data?',
        a: 'We use the same NOAA grid-level data that insurance companies use to process claims. It is highly accurate at the parcel level.'
      }
    ],
    tags: ['predictive', 'engine', 'noaa', 'core']
  },
  {
    id: 'solution-roadmap',
    title: 'Digital Solution Roadmap',
    subtitle: 'Interactive proposal generator',
    category: 'sales-tools',
    status: 'verified',
    whatItDoes: 'Replaces static PDF quotes with an interactive presentation layer for the 4D Demo phase.',
    howItWorks: 'Reps input the findings from the Diagnosis phase. The system automatically generates a Good/Better/Best proposal with embedded drone photos and thermal imagery.',
    valueDrivers: [
      'Prevents sticker shock by providing options.',
      'Keeps the prospect in the presentation longer.',
      'Increases the win rate of the "Better" tier.'
    ],
    tags: ['demo', 'proposals', 'sales']
  }
];