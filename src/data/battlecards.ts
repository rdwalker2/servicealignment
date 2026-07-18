export type Battlecard = {
  id: string;
  competitorName: string;
  logoText: string;
  category: 'Status Quo' | 'Traditional Roofer' | 'National Provider' | 'In-House';
  tier: 1 | 2 | 3;
  pricingIntelligence: string;
  whenWeWin: string[];
  whenWeLose: string[];
  competitorStrengths: string[];
  ourDifferentiators: { claim: string; proof: string; ttFeature: string }[];
  objections: { question: string; script: string }[];
  trapQuestions: { question: string; painHighlighted: string }[];
};

export const BATTLECARDS: Battlecard[] = [
  {
    id: 'bc_status_quo',
    competitorName: 'The Status Quo (Run to Fail)',
    category: 'Status Quo',
    tier: 1,
    logoText: 'SQ',
    pricingIntelligence: 'Zero upfront cost. Infinite unpredictable costs when a catastrophic failure occurs.',
    whenWeWin: [
      'The Owner or Facility Manager understands the concept of NOI and capital expenditure planning.',
      'We use Drone / Thermal imagery to prove invisible water intrusion.',
      'The prospect has recently experienced a major weather event.'
    ],
    whenWeLose: [
      'The building is slated for demolition.',
      'The prospect has zero budget and doesn\'t care about tenant experience.'
    ],
    competitorStrengths: [
      'Requires zero effort or thought today.',
      'No immediate cash outlay.'
    ],
    ourDifferentiators: [
      {
        claim: 'Predictive Roof Health Score',
        proof: 'We use satellite and weather data to predict failure before it happens, preventing catastrophic inventory/tenant loss.',
        ttFeature: 'Roof Health Score'
      },
      {
        claim: 'Cost of Inaction (COI) Calculator',
        proof: 'By ignoring a minor $500 repair today, we can mathematically prove it will become a $50,000 replacement in 3 years.',
        ttFeature: 'ROI Calculator'
      }
    ],
    objections: [
      {
        question: 'We aren\'t experiencing any leaks right now, so we don\'t need a roofer.',
        script: '"I completely understand. The challenge with commercial roofs is that by the time you see the leak inside, the insulation has been wet for months. Our predictive system flagged your property due to recent wind events in your grid. Are you opposed to us doing a quick, non-invasive drone scan just to verify the integrity?"'
      }
    ],
    trapQuestions: [
      {
        question: 'When a leak does happen, how much does it cost you in operational downtime and tenant complaints?',
        painHighlighted: 'Forces them to calculate the hidden costs of the Status Quo.'
      }
    ]
  },
  {
    id: 'bc_traditional',
    competitorName: 'The "Hustle" Roofer',
    category: 'Traditional Roofer',
    tier: 2,
    logoText: 'TR',
    pricingIntelligence: 'Often the lowest bidder. They quote based on visible damage only, leading to massive change orders later.',
    whenWeWin: [
      'The prospect values professional reporting, communication, and long-term partnership.',
      'We present the Good/Better/Best Solution Roadmap rather than a single quote.',
      'The prospect has been burned by "Chuck in a truck" previously.'
    ],
    whenWeLose: [
      'The prospect is solely focused on the cheapest possible patch for a building they are flipping next month.'
    ],
    competitorStrengths: [
      'Very cheap upfront pricing.',
      'Will do whatever the prospect asks without pushing back.'
    ],
    ourDifferentiators: [
      {
        claim: '4D Methodology (Diagnosis vs Quoting)',
        proof: 'Traditional roofers just give a quote for what you ask. We do a full Diagnosis to find the root cause, ensuring the problem doesn\'t return.',
        ttFeature: '4D Methodology'
      },
      {
        claim: 'Solution Roadmap Options',
        proof: 'We provide 3 customized options (Good/Better/Best) so the owner has control over their capital expenditure strategy.',
        ttFeature: 'Solution Roadmap'
      }
    ],
    objections: [
      {
        question: 'We have a guy who fixes our leaks for $300 a pop.',
        script: '"That is a great price for a patch. The issue we see with reactive patching is it’s like putting a band-aid on a broken arm — you are treating the symptom, not the cause. Have you noticed that you have to call him out multiple times a year for the same areas?"'
      }
    ],
    trapQuestions: [
      {
        question: 'When they fix a leak, do they provide a root-cause analysis and photographic proof of the surrounding system health?',
        painHighlighted: 'Highlights the lack of professionalism and predictive care from traditional roofers.'
      }
    ]
  },
  {
    id: 'bc_national',
    competitorName: 'National Broker / Facility Mgmt',
    category: 'National Provider',
    tier: 1,
    logoText: 'NP',
    pricingIntelligence: 'High margins due to broker fees. Slow dispatch times because they sub-contract to local roofers.',
    whenWeWin: [
      'The prospect is frustrated by slow dispatch times and poor communication.',
      'The prospect wants a direct relationship with the actual service provider.',
      'The prospect is tired of paying inflated broker margins.'
    ],
    whenWeLose: [
      'Massive national accounts that demand a single vendor for HVAC, Plumbing, and Roofing across 500 locations.'
    ],
    competitorStrengths: [
      'One throat to choke for all facility trades.',
      'Consolidated billing across all locations.'
    ],
    ourDifferentiators: [
      {
        claim: 'Direct Service & Speed',
        proof: 'Because we aren\'t a broker, our dispatch times are hours, not days. You talk directly to the technicians solving the problem.',
        ttFeature: '24/7 Monitoring'
      },
      {
        claim: 'Specialized Expertise',
        proof: 'National providers are generalists. We are predictive roofing specialists. We solve the problem permanently rather than just subbing out a temporary patch.',
        ttFeature: 'Predictive Engine'
      }
    ],
    objections: [
      {
        question: 'We use a national facilities company so we only have to deal with one invoice.',
        script: '"Consolidated billing is definitely convenient. However, most of our clients found that convenience came at the cost of speed and quality, because the national provider is just sub-contracting to the lowest local bidder. If we could provide the same billing simplicity but with direct, specialized roofing expertise, would that be worth a 15-minute conversation?"'
      }
    ],
    trapQuestions: [
      {
        question: 'What is your average response time from when you submit a ticket to when a technician is actually on your roof?',
        painHighlighted: 'Exposes the slow dispatch times of broker models.'
      }
    ]
  }
];
