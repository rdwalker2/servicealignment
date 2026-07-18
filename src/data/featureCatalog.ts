// ============================================================
// featureCatalog.ts — Complete Service Alignment Feature Catalog
// Used in the Solution section for AE-selectable feature grids
// ============================================================

export interface Feature {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  status: 'included' | 'add-on' | 'upcoming';
}

export interface FeatureCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export const FEATURE_CATEGORIES: FeatureCategory[] = [
  { id: 'intelligence',        label: 'Inspection & Intelligence',         icon: '🚁', color: '#8b5cf6' },
  { id: 'preventative',        label: 'Preventative Maintenance',          icon: '🛡️', color: '#10b981' },
  { id: 'emergency',           label: 'Emergency Response',                icon: '🚨', color: '#ef4444' },
  { id: 'restoration',         label: 'Restoration & Replacement',         icon: '🏗️', color: '#f59e0b' },
  { id: 'reporting',           label: 'Client Portal & Reporting',         icon: '📊', color: '#0ea5e9' },
];

export const FEATURE_CATALOG: Feature[] = [
  // ── Intelligence ──────────────────────────────────────────
  { id: 'drone-inspections',   title: 'AI Drone Mapping',             description: 'Automated drone flights capture high-res imagery of the entire roof footprint, identifying pooling water and debris.', category: 'intelligence', icon: '🚁', status: 'included' },
  { id: 'infrared-scanning',   title: 'Thermal Infrared Scanning',    description: 'Find invisible water trapped under the membrane before it rots the insulation and decking.', category: 'intelligence', icon: '🌡️', status: 'included' },
  { id: 'core-sampling',       title: 'Core Sampling & Analysis',     description: 'Physical extraction of roof layers to determine exact material composition, saturation levels, and structural health.', category: 'intelligence', icon: '🔬', status: 'included' },
  { id: 'weather-monitoring',  title: '24/7 Weather Monitoring',      description: 'We track NOAA storm events against your building coordinates to immediately dispatch inspectors after severe weather.', category: 'intelligence', icon: '🌩️', status: 'included' },

  // ── Preventative ────────────────────────────────────────────────
  { id: 'bi-annual-maintenance', title: 'Bi-Annual Maintenance',      description: 'Spring and Fall inspections, drain clearing, and minor sealant touch-ups to maximize membrane lifespan.', category: 'preventative', icon: '📅', status: 'included' },
  { id: 'debris-removal',      title: 'Debris & Drain Clearing',      description: 'Removal of leaves, branches, and trash to prevent pooling water from collapsing the roof structure.', category: 'preventative', icon: '🍂', status: 'included' },
  { id: 'flashing-sealant',    title: 'Flashing & Pitch Pocket Sealing', description: 'Re-sealing HVAC curbs, pitch pockets, and parapet walls where 90% of commercial roof leaks originate.', category: 'preventative', icon: '🔫', status: 'included' },

  // ── Emergency ───────────────────────────────────────────────────
  { id: 'priority-dispatch',   title: '24/7 Priority Dispatch',       description: 'Guaranteed 4-hour response time for active interior leaks to minimize tenant inventory and equipment damage.', category: 'emergency', icon: '🚨', status: 'included' },
  { id: 'temporary-tarping',   title: 'Temporary Shrink-Wrap Tarping',description: 'Heavy-duty commercial shrink wrap to secure compromised roof sections until full repairs can be permitted and scheduled.', category: 'emergency', icon: '🛡️', status: 'included' },

  // ── Restoration ─────────────────────────────────────────────────
  { id: 'silicone-coating',    title: 'Silicone Roof Coating',        description: 'Extend the life of your existing roof by 10-15 years without the cost and landfill waste of a full tear-off.', category: 'restoration', icon: '🪣', status: 'included' },
  { id: 'tpo-replacement',     title: 'TPO Membrane Replacement',     description: 'Full tear-off and replacement with highly reflective, energy-efficient thermoplastic polyolefin (TPO) membrane.', category: 'restoration', icon: '🏗️', status: 'included' },
  { id: 'metal-retrofits',     title: 'Metal Roof Retrofits',         description: 'Installing single-ply membrane over aging, rusting standing-seam metal roofs to stop leaks and thermal shock.', category: 'restoration', icon: '🔩', status: 'included' },

  // ── Reporting ───────────────────────────────────────────────────
  { id: 'client-portal',       title: 'Asset Management Portal',      description: 'Log in to view the health score, inspection reports, and repair history of every building in your portfolio.', category: 'reporting', icon: '💻', status: 'included' },
  { id: 'budget-forecasting',  title: 'CapEx Budget Forecasting',     description: '1, 3, and 5-year capital expenditure predictions so you never get hit with a surprise $300k replacement.', category: 'reporting', icon: '📈', status: 'included' },
];

export const DEFAULT_SOLUTION_FEATURES = [
  'drone-inspections', 'infrared-scanning', 'bi-annual-maintenance', 'priority-dispatch', 'budget-forecasting'
];

export function getCategoryById(id: string): FeatureCategory | undefined {
  return FEATURE_CATEGORIES.find(c => c.id === id);
}
