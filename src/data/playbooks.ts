// ============================================================
// Playbooks — Full Sales Playbook Data
// Pre-built playbooks for the Service Alignment 4D Methodology
// ============================================================

export interface PlaybookStep {
  navPath?: string;
  title: string;
  description: string;
  proTip?: string;
}

export interface PlaybookFlow {
  icon: string;
  label: 'Stage' | 'Trigger' | 'Result';
  name: string;
}

export interface PlaybookNeed {
  icon: string;
  name: string;
  type: 'core' | 'integration';
}

export interface PlaybookMetric {
  value: string;
  label: string;
}

export interface PlaybookSpotlight {
  feature: string;
  description: string;
}

export interface Playbook {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  personas: string[];
  setupTime: string;
  features: string[];
  demoAreaIds: string[];
  automationFlow: PlaybookFlow[];
  beforeList: string[];
  afterList: string[];
  needs: PlaybookNeed[];
  steps: PlaybookStep[];
  spotlights: PlaybookSpotlight[];
  results: {
    metrics: PlaybookMetric[];
    caseStudy: { company: string; result: string };
  };
}

export const PLAYBOOKS: Playbook[] = [
  {
    id: 'playbook-discovery',
    title: 'Phase 1: Discovery (The Roof Health Wedge)',
    subtitle: 'Leverage predictive alerts to book meetings before leaks happen.',
    description: 'Use the "Your roof just pinged us" script based on NOAA alerts and satellite data. Transition the prospect from a reactive mindset to a proactive one.',
    personas: ['Property Manager', 'Facility Manager', 'Owner'],
    setupTime: '5 min',
    features: ['NOAA Alerts', 'Satellite Imagery', 'Roof Health Score'],
    demoAreaIds: ['predictive'],
    automationFlow: [
      { icon: '🌩️', label: 'Trigger', name: 'NOAA Weather Alert' },
      { icon: '📉', label: 'Stage', name: 'Roof Health Score Drops' },
      { icon: '📞', label: 'Trigger', name: 'Predictive Outreach Call' },
      { icon: '📅', label: 'Result', name: 'Discovery Meeting Booked' },
    ],
    beforeList: [
      'Cold calling 100 random buildings (10 & 10 method)',
      'Asking "Do you have any leaks?"',
      'Getting rejected by gatekeepers',
      'Waiting for the prospect to realize they have a problem',
    ],
    afterList: [
      'Calling 5 highly targeted, at-risk buildings',
      'Stating: "Your roof just pinged us"',
      'Bypassing gatekeepers with precise property data',
      'Positioning yourself as a risk-management partner',
    ],
    needs: [
      { icon: '📡', name: 'Predictive Engine', type: 'core' },
      { icon: '📞', name: 'Outreach Cadence', type: 'core' },
    ],
    steps: [
      {
        navPath: 'Predictive Dashboard → Signal Board',
        title: 'Identify At-Risk Assets',
        description: 'Filter the Signal Board for properties in your territory that recently experienced severe weather or have a deteriorating Roof Health Score.',
        proTip: 'Look for properties owned by existing clients first (Account Development).',
      },
      {
        navPath: 'CRM → Contact View',
        title: 'Execute the "Ping" Script',
        description: 'Call the Facility or Property Manager. Lead with: "We got an alert regarding the roof at [Address]. Have you noticed water intrusion yet, or are we catching this early?"',
      },
      {
        title: 'Book the Diagnosis Meeting',
        description: 'Once pain is established, secure a time for a physical or drone inspection to diagnose the root cause.',
      },
    ],
    spotlights: [
      {
        feature: 'Roof Health Score',
        description: 'A dynamic 1-100 score that combines age, material, weather history, and satellite imagery to predict failure probability.',
      },
    ],
    results: {
      metrics: [
        { value: '3x', label: 'Increase in meeting set rate' },
        { value: '0', label: 'Cold doors knocked' },
      ],
      caseStudy: {
        company: 'Roof Wars Trainee',
        result: 'Booked 4 meetings in one hour using predictive signals instead of spending 8 hours knocking on doors.',
      },
    },
  },
  {
    id: 'playbook-diagnosis',
    title: 'Phase 2: Diagnosis (The Inspection)',
    subtitle: 'Uncover the root cause and quantify the financial impact.',
    description: 'Conduct a thorough inspection (physical or drone). Document all deficiencies and tie them back to the prospect\'s operational or financial pain.',
    personas: ['Facility Manager', 'Maintenance Manager'],
    setupTime: '45 min',
    features: ['Drone Inspection', 'Deficiency Mapping', 'Cost-of-Inaction Calculator'],
    demoAreaIds: ['inspection'],
    automationFlow: [
      { icon: '🚁', label: 'Stage', name: 'Drone/Physical Inspection' },
      { icon: '📸', label: 'Trigger', name: 'Capture Deficiencies' },
      { icon: '💵', label: 'Trigger', name: 'Calculate Risk Exposure' },
      { icon: '📊', label: 'Result', name: 'Diagnosis Report Generated' },
    ],
    beforeList: [
      'Walking the roof blindly',
      'Taking a few blurry photos on a phone',
      'Telling the prospect "it looks bad"',
      'Providing a free quote with no context',
    ],
    afterList: [
      'Systematic mapping of all deficiencies',
      'High-res drone imagery and thermal scans',
      'Quantifying the exact cost of ignoring the problem',
      'Preparing a comprehensive Condition Report',
    ],
    needs: [
      { icon: '📱', name: 'Inspection App', type: 'core' },
      { icon: '🚁', name: 'Drone Integration', type: 'integration' },
    ],
    steps: [
      {
        title: 'Pre-Inspection Briefing',
        description: 'Meet with the site contact to confirm what they are experiencing inside the building before getting on the roof.',
      },
      {
        title: 'Document and Map',
        description: 'Photograph every defect. Map them to the roof plan. If using a drone, run the automated flight pattern.',
      },
      {
        title: 'Calculate the Impact',
        description: 'Use the Cost-of-Inaction framework. If this roof fails, what is the cost of inventory loss, tenant lawsuits, or operational downtime?',
      },
    ],
    spotlights: [
      {
        feature: 'Deficiency Mapping',
        description: 'Visualizing exact defect locations transforms abstract roofing concepts into tangible, undeniable proof of risk.',
      },
    ],
    results: {
      metrics: [
        { value: '85%', label: 'Close rate when using drone imagery' },
        { value: '4x', label: 'Larger average deal size (shifting from repair to replacement)' },
      ],
      caseStudy: {
        company: 'Service Alignment Client',
        result: 'Converted a $500 leak call into a $120k replacement by diagnosing underlying wet insulation via thermal drone.',
      },
    },
  },
  {
    id: 'playbook-demo',
    title: 'Phase 3: Demo (The Solution Roadmap)',
    subtitle: 'Present the tailored solution to solve their specific pain.',
    description: 'Present your findings and propose a solution (Repair, Restore, Replace, or Preventative Maintenance) using the Solution Roadmap.',
    personas: ['Property Manager', 'Owner'],
    setupTime: '20 min',
    features: ['Solution Roadmap', 'Good/Better/Best Pricing', 'ROI Modeling'],
    demoAreaIds: ['presentation'],
    automationFlow: [
      { icon: '📑', label: 'Stage', name: 'Review Diagnosis' },
      { icon: '🗺️', label: 'Trigger', name: 'Present Solution Roadmap' },
      { icon: '⚖️', label: 'Stage', name: 'Review Options (Good/Better/Best)' },
      { icon: '🤝', label: 'Result', name: 'Verbal Agreement on Solution Path' },
    ],
    beforeList: [
      'Emailing a PDF quote',
      'Hoping they call back',
      'Only offering one expensive option',
      'Focusing on materials (TPO, screws, glue)',
    ],
    afterList: [
      'In-person or Zoom presentation',
      'Guiding them through the visual Solution Roadmap',
      'Providing 3 tailored options (Good, Better, Best)',
      'Focusing on business outcomes (NOI, safety, peace of mind)',
    ],
    needs: [
      { icon: '💻', name: 'Presentation Mode', type: 'core' },
      { icon: '📈', name: 'ROI Calculator', type: 'core' },
    ],
    steps: [
      {
        title: 'Review the Diagnosis',
        description: 'Reiterate their pain. Show the photos. Get them to agree that the Status Quo is unacceptable.',
      },
      {
        title: 'Present the Roadmap',
        description: 'Walk through the customized Solution Roadmap. Explain how your proposed scope directly solves the root cause.',
      },
      {
        title: 'Present Options',
        description: 'Give them control by offering Good (Repair + PM), Better (Restoration), or Best (Full Replacement) options.',
      },
    ],
    spotlights: [
      {
        feature: 'Good/Better/Best Pricing',
        description: 'Prevents "sticker shock" and keeps the prospect negotiating with you on scope, rather than shopping you against competitors on price.',
      },
    ],
    results: {
      metrics: [
        { value: '60%', label: 'Win rate on "Better" option' },
        { value: '0', label: 'Quotes "lost in email"' },
      ],
      caseStudy: {
        company: 'Commercial Roofer',
        result: 'Eliminated the "we need to get 3 bids" objection by providing 3 distinct scope options in a single presentation.',
      },
    },
  },
  {
    id: 'playbook-decision',
    title: 'Phase 4: Decision (Securing the Partnership)',
    subtitle: 'Finalize the agreement and transition to operations.',
    description: 'Overcome final objections (The 5 Fatalities), secure the signature, and smoothly hand off to the service delivery team.',
    personas: ['Owner', 'Property Manager'],
    setupTime: '10 min',
    features: ['E-Signature', 'Handoff Checklist', 'Service Agreement Tracker'],
    demoAreaIds: ['closing'],
    automationFlow: [
      { icon: '✍️', label: 'Stage', name: 'Contract Sent' },
      { icon: '✅', label: 'Trigger', name: 'Signature Captured' },
      { icon: '🚀', label: 'Trigger', name: 'Operations Handoff' },
      { icon: '🎉', label: 'Result', name: 'Deal Closed Won' },
    ],
    beforeList: [
      'Chasing signatures for weeks',
      'Losing deals to "timing" or "budget"',
      'Operations team blindsided by new projects',
      'Client feels abandoned after signing',
    ],
    afterList: [
      'Using the "5 Fatalities" framework to preempt objections',
      'Seamless digital contracting',
      'Automated handoff alerts to Ops',
      'Immediate scheduling of kickoff call',
    ],
    needs: [
      { icon: '✍️', name: 'DocuSign / E-Sign', type: 'integration' },
      { icon: '📋', name: 'Automated Workflows', type: 'core' },
    ],
    steps: [
      {
        title: 'Clear the 5 Fatalities',
        description: 'Ensure Timing, Competition, Price, Trust, and Product Fit are completely resolved before asking for the signature.',
      },
      {
        title: 'Secure Signature & Deposit',
        description: 'Send the digital agreement. Collect the mobilization deposit (if applicable) immediately.',
      },
      {
        title: 'The Perfect Handoff',
        description: 'Introduce the client to their dedicated Account Manager or Project Manager. Set expectations for day 1 of the project.',
      },
    ],
    spotlights: [
      {
        feature: 'Automated Operations Handoff',
        description: 'The moment a deal is Closed Won, all notes, photos, and scopes are instantly transferred to the production queue.',
      },
    ],
    results: {
      metrics: [
        { value: '100%', label: 'Alignment between Sales and Ops' },
        { value: '48hr', label: 'Average time from signature to mobilization' },
      ],
      caseStudy: {
        company: 'Service Division',
        result: 'Reduced pre-construction delays by 50% by enforcing a standardized 4D handoff checklist.',
      },
    },
  },
];

export const PLAYBOOK_PAIN_MAP: Record<string, string[]> = {
  'playbook-discovery': ['pain-leak', 'pain-damage'],
  'playbook-diagnosis': ['pain-cost', 'pain-liability'],
  'playbook-demo': ['pain-budget'],
  'playbook-decision': ['pain-trust']
};
