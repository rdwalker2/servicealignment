export interface DiscoveryQuestion {
  id: string;
  question: string;
  coaching?: string;
  options?: string[];
  type: 'open' | 'select' | 'checkbox' | 'number';
  numberUnit?: string;
}

export interface Checkpoint {
  id: string;
  label: string;
  question: string;
}

export interface PersonaSheet {
  id: string;
  label: string;
  role: string;
  color: string;
  opener: string;
  openingLine: string;
  questions: DiscoveryQuestion[];
  checkpoint1: Checkpoint;
  checkpoint2: Checkpoint;
  checkpoint3: Checkpoint;
}

export const SHEETS: PersonaSheet[] = [
  {
    id: 'property-manager',
    label: 'Property Manager',
    role: 'Manages tenant satisfaction, budgets, and property value across multiple sites.',
    color: '#7C3AED',
    opener: 'Your roof just pinged us with a severe weather alert. Are you currently experiencing any leaks, or are we catching this before it hits the tenants?',
    openingLine: 'Your roof just pinged us with a severe weather alert. Are you currently experiencing any leaks, or are we catching this before it hits the tenants?',
    questions: [
      { id: 'q1', question: '1. What is the current state of the roof at this property?', type: 'select', options: ['Leaking actively', 'No known issues, but aging', 'Recently repaired', 'Unknown / No recent inspection'], coaching: "Always anchor to the Roof Health Score and the recent weather event." },
      { id: 'q2', question: '2. How do leaks currently impact your tenants?', type: 'checkbox', options: ['Tenant complaints', 'Inventory damage', 'Safety hazards', 'Lease renewal risks', 'Lost revenue'], coaching: "Quantify the pain: What does a tenant complaint actually cost in terms of time and money?" },
      { id: 'q3', question: '3. When a leak occurs, what is your current protocol?', type: 'open', coaching: "Listen for 'call a random roofer' or 'wait for it to get bad'. This exposes the Status Quo / Run to Fail model." },
      { id: 'q4', question: '4. Do you have a Preventative Maintenance program in place?', type: 'select', options: ['Yes, comprehensive', 'Yes, basic inspections', 'No, reactive only', 'Not sure'], coaching: "If they say 'reactive only', introduce the financial impact of the 4D methodology (predictive vs reactive)." },
      { id: 'q5', question: '5. How much of your annual budget is eaten up by emergency repairs?', type: 'number', numberUnit: 'dollars/year', coaching: "Anchor the cost of the Status Quo." }
    ],
    checkpoint1: { id: 'cp1', label: 'Pain & Impact', question: 'Is the Status Quo causing financial or tenant pain?' },
    checkpoint2: { id: 'cp2', label: 'Budget', question: 'Are they wasting money on reactive repairs?' },
    checkpoint3: { id: 'cp3', label: 'Decision', question: 'Will they commit to a 4D Inspection?' }
  },
  {
    id: 'facility-manager',
    label: 'Facility Manager',
    role: 'Ensures operational continuity and facility safety.',
    color: '#0891B2',
    opener: 'We received an alert regarding potential roof damage at your facility. How is this impacting your daily operations?',
    openingLine: 'We received an alert regarding potential roof damage at your facility. How is this impacting your daily operations?',
    questions: [
      { id: 'q1', question: '1. How often are you dealing with roof-related disruptions?', type: 'select', options: ['Weekly', 'Monthly', 'A few times a year', 'Rarely'], coaching: "Look for frequency of pain." },
      { id: 'q2', question: '2. What happens to production/operations when a leak occurs?', type: 'open', coaching: "Get them to describe the operational shutdown. Uncover the true cost of downtime." },
      { id: 'q3', question: '3. Who handles your roof repairs currently?', type: 'select', options: ['In-house maintenance', 'Local roofing contractor', 'National provider', 'No one specific'], coaching: "Identify the competition (usually a hustle-based roofer or in-house team without expertise)." },
      { id: 'q4', question: '4. Are you tired of chasing roofers for emergency dispatch?', type: 'select', options: ['Yes, it takes days', 'Sometimes', 'They respond fast', 'We do it internally'], coaching: "Position the Predictive Marketing / 24-7 monitoring as the solution to their dispatch headaches." }
    ],
    checkpoint1: { id: 'cp1', label: 'Operational Pain', question: 'Is the roof disrupting operations?' },
    checkpoint2: { id: 'cp2', label: 'Current Provider Gap', question: 'Is their current roofer too slow or reactive?' },
    checkpoint3: { id: 'cp3', label: 'Decision', question: 'Will they schedule a Diagnosis meeting?' }
  },
  {
    id: 'owner',
    label: 'Owner / Asset Manager',
    role: 'Focuses on asset valuation, capital expenditures, and long-term ROI.',
    color: '#DC2626',
    opener: 'Our predictive system indicates your asset\'s Roof Health Score has dropped into the risk zone. Are you planning capital expenditures for this roof soon?',
    openingLine: 'Our predictive system indicates your asset\'s Roof Health Score has dropped into the risk zone. Are you planning capital expenditures for this roof soon?',
    questions: [
      { id: 'q1', question: '1. What is your long-term strategy for this asset?', type: 'select', options: ['Hold for 10+ years', 'Sell in 1-3 years', 'Refinance', 'Repurpose'], coaching: "Strategy dictates the solution. If selling, they need a band-aid or a warranty. If holding, they need a full replacement or PM plan." },
      { id: 'q2', question: '2. How are unexpected roof capital expenditures affecting your NOI (Net Operating Income)?', type: 'open', coaching: "Speak their language. NOI is everything to an owner." },
      { id: 'q3', question: '3. Would a predictable, fixed-cost Preventative Maintenance plan improve your valuation model?', type: 'select', options: ['Yes', 'Maybe', 'No, we prefer cash flow flexibility'], coaching: "Position Service Alignment as a financial tool, not just a roofing service." }
    ],
    checkpoint1: { id: 'cp1', label: 'Asset Strategy', question: 'Do we understand their hold/sell strategy?' },
    checkpoint2: { id: 'cp2', label: 'Financial Pain', question: 'Is reactive maintenance hurting their NOI?' },
    checkpoint3: { id: 'cp3', label: 'Decision', question: 'Will they review the 4D Solution Roadmap?' }
  }
];

export const Q1_PAIN_MAP: Record<string, Record<string, string[]>> = {
  'property-manager': {
    'Leaking actively': ['pain-leak', 'pain-damage'],
    'No known issues, but aging': ['pain-liability']
  },
  'facility-manager': {
    'Weekly': ['pain-cost'],
    'Monthly': ['pain-cost']
  },
  'owner': {
    'Hold for 10+ years': ['pain-budget']
  }
};
