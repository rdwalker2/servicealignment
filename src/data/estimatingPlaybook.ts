export interface ProjectType {
  id: string;
  name: string;
  approxCost: string;
  timeToValue: string;
  clientAwareness: 'Aware' | 'Unaware';
  description: string;
}

export interface EstimatingMethod {
  id: string;
  title: string;
  description: string;
  pros: string;
  cons: string;
}

export interface DefectPricing {
  id: string;
  roofType: string;
  problem: string;
  price: string;
  unit: string;
}

export const PROJECT_TYPES: ProjectType[] = [
  { id: 'replacement', name: 'Replacement', approxCost: '$75,000+', timeToValue: '90+ Days', clientAwareness: 'Aware', description: 'Full tear-off and replacement. High cap-ex project requiring extensive forecasting.' },
  { id: 'coating', name: 'Coating', approxCost: '$50,000+', timeToValue: '90+ Days', clientAwareness: 'Aware', description: 'Fluid-applied restoration extending the roof life.' },
  { id: 'inspection', name: 'Inspection (Predictive)', approxCost: '$5,000+', timeToValue: '60-90 Days', clientAwareness: 'Unaware', description: 'Using the Roof Health Wedge to secure a paid, diagnostic drone inspection.' },
  { id: 'site-bid', name: 'Site Bid', approxCost: '$500 - $5,000', timeToValue: '30 Days', clientAwareness: 'Aware', description: 'Quoting a specific repair requested by the client.' },
  { id: 'post-job-proposal', name: 'Post Job Proposal', approxCost: '$500 - $2,000', timeToValue: '30 Days', clientAwareness: 'Unaware', description: 'Additional work found by the tech, proposed after the initial repair is completed.' },
  { id: 'onsite-upsell', name: 'Onsite Upsell', approxCost: '$200 - $500', timeToValue: 'Immediate', clientAwareness: 'Unaware', description: 'Small repairs found and approved while the tech is already on the roof. Target: $2k/week per truck.' },
  { id: 'time-material', name: 'Time & Material', approxCost: 'Under $1,000', timeToValue: 'Immediate', clientAwareness: 'Aware', description: 'Standard leak dispatch.' }
];

export const ESTIMATING_METHODS: EstimatingMethod[] = [
  {
    id: 'unit-pricing',
    title: 'Unit Pricing',
    description: 'Assigns a cost to each specific unit, such as price per square foot or lineal foot.',
    pros: 'Ensures straightforward pricing for single or small units.',
    cons: 'Does not scale with larger units very well and requires a-la-carte proposal models.'
  },
  {
    id: 'third-grade',
    title: '3rd Grade Estimating',
    description: 'Categorizing project tasks into quarter-day, half-day, or full-day efforts based on complexity.',
    pros: 'Streamlines the estimating process by aligning time allocations with anticipated workload.',
    cons: 'Extreme knowledge of the task, materials, and time allowance is required.'
  },
  {
    id: 'full-breakdown',
    title: 'Full Breakdown Estimating',
    description: 'Conducting a detailed analysis of all components (materials, labor hours, equipment, overhead).',
    pros: 'Comprehensive approach ensures accuracy and aligns with the project’s specific requirements.',
    cons: 'Time extensive. Requires dedicated office time with experience in estimating software.'
  }
];

export const DEFECT_PRICING: DefectPricing[] = [
  { id: '1', roofType: 'TPO', problem: 'Puncture', price: '$105.00', unit: 'EA' },
  { id: '2', roofType: 'TPO', problem: 'Open Seam', price: '$15.00', unit: 'LF' },
  { id: '3', roofType: 'TPO', problem: 'Curb Corner', price: '$125.00', unit: 'EA' },
  { id: '4', roofType: 'TPO', problem: 'Missing Fastener', price: '$2.30', unit: 'EA' },
  { id: '5', roofType: 'TPO', problem: 'Clogged Drain', price: '$115.00', unit: 'EA' }
];
