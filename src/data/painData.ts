import {
    Building2, FileWarning, LineChart, ShieldAlert,
    Banknote, Wrench, AlertTriangle, CloudLightning,
    Droplets, Umbrella, HardHat, TrendingDown
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type PersonaId = 'property-manager' | 'facility-director' | 'cfo' | 'asset-manager' | 'all';

export type MembraneOption =
    | 'Unknown' | 'TPO' | 'PVC' | 'EPDM' | 'Built-Up (BUR)'
    | 'Modified Bitumen' | 'Metal' | 'Spray Foam' | 'Other';

export type PainCategory = 'financial' | 'liability' | 'operational' | 'weather' | 'maintenance';

export interface PainDefinition {
    id: string;
    persona: string;
    category: PainCategory;
    personaTabs?: string[];
    title: string;
    description: string;
    icon: React.ElementType;
    feature: string;
    verbatim?: string;
    topRank?: number;
}

/* ------------------------------------------------------------------ */
/*  Personas                                                           */
/* ------------------------------------------------------------------ */

export const PERSONAS = [
    { id: 'all', label: 'All Stakeholders' },
    { id: 'property-manager', label: 'Property Manager' },
    { id: 'facility-director', label: 'Director of Facilities' },
    { id: 'cfo', label: 'CFO / Ownership' },
    { id: 'asset-manager', label: 'Asset Manager' },
];

/* ------------------------------------------------------------------ */
/*  Provider Options & Mappings                                             */
/* ------------------------------------------------------------------ */

export const MEMBRANE_OPTIONS: MembraneOption[] = [
    'Unknown', 'TPO', 'PVC', 'EPDM', 'Built-Up (BUR)',
    'Modified Bitumen', 'Metal', 'Spray Foam', 'Other'
];

export const MEMBRANE_PAIN_MAP: Record<string, string[]> = {
    'TPO': ['membrane-degradation', 'unbudgeted-capex', 'energy-inefficiency'],
    'EPDM': ['membrane-shrinkage', 'seam-failure', 'unbudgeted-capex'],
    'Built-Up (BUR)': ['heavy-weight-load', 'difficult-leak-detection', 'unbudgeted-capex'],
    'Metal': ['rust-corrosion', 'fastener-backing-out', 'thermal-shock'],
};

/* ------------------------------------------------------------------ */
/*  Pains Database                                                     */
/* ------------------------------------------------------------------ */

export const ROOFING_PAINS: PainDefinition[] = [
    // ── Financial ──
    {
        id: 'unbudgeted-capex',
        persona: 'CFO',
        personaTabs: ['cfo', 'asset-manager'],
        category: 'financial',
        title: 'Unbudgeted CapEx',
        description: 'Surprise $250k+ roof replacements destroying quarterly net operating income.',
        icon: TrendingDown,
        feature: 'Preventative Maintenance',
        verbatim: 'We got hit with a $300k replacement we didn\'t budget for this year.',
        topRank: 1,
    },
    {
        id: 'energy-inefficiency',
        persona: 'Property Manager',
        personaTabs: ['property-manager', 'cfo'],
        category: 'financial',
        title: 'Energy Waste',
        description: 'Wet insulation losing thermal resistance (R-value), causing HVAC costs to skyrocket.',
        icon: Banknote,
        feature: 'Infrared Scanning',
        verbatim: 'Our summer HVAC bills are 30% higher than last year for the same footprint.',
    },
    // ── Liability ──
    {
        id: 'slip-fall-liability',
        persona: 'Director of Facilities',
        personaTabs: ['facility-director', 'property-manager'],
        category: 'liability',
        title: 'Slip and Fall Risk',
        description: 'Interior leaks creating pooling water on warehouse floors, driving up insurance premiums and lawsuit risk.',
        icon: ShieldAlert,
        feature: 'Emergency Response',
        verbatim: 'A tenant\'s employee slipped on a puddle from a roof leak and we are facing a lawsuit.',
        topRank: 2,
    },
    {
        id: 'inventory-loss',
        persona: 'Property Manager',
        personaTabs: ['property-manager', 'asset-manager'],
        category: 'liability',
        title: 'Inventory Damage',
        description: 'Water intrusion destroying millions of dollars of tenant inventory and equipment.',
        icon: AlertTriangle,
        feature: '24/7 Monitoring',
        verbatim: 'We had to pay $50k in damages to a tenant because a leak ruined their electronics stock.',
    },
    // ── Weather & Wear ──
    {
        id: 'membrane-degradation',
        persona: 'Director of Facilities',
        personaTabs: ['facility-director', 'property-manager'],
        category: 'weather',
        title: 'Premature Degradation',
        description: 'UV exposure and minor hail impacts shortening the 20-year roof lifespan to 12 years.',
        icon: CloudLightning,
        feature: 'Drone Inspections',
        verbatim: 'The roof is only 10 years old but the inspector said it is already failing.',
        topRank: 3,
    },
    {
        id: 'seam-failure',
        persona: 'Property Manager',
        personaTabs: ['property-manager', 'facility-director'],
        category: 'maintenance',
        title: 'Seam & Flashing Failure',
        description: 'Micro-tears in seams and flashing expanding during freeze/thaw cycles causing insidious leaks.',
        icon: Wrench,
        feature: 'Membrane Restoration',
        verbatim: 'Every time it rains heavy, we have 4 different buckets out in the warehouse.',
    }
];

export function getPainsForPersona(persona: string): PainDefinition[] {
    if (persona === 'all' || !persona) return ROOFING_PAINS;
    return ROOFING_PAINS.filter(p => (p.personaTabs || []).includes(persona));
}

// ── Legacy Aliases to prevent breaking imports ──
export const TT_PAINS = ROOFING_PAINS;
export const ATS_OPTIONS = MEMBRANE_OPTIONS;
export const ATS_PAIN_MAP = MEMBRANE_PAIN_MAP;
export const ATS_MATURITY_MAP = {};
export const INDUSTRIES = [{id: 'commercial', label: 'Commercial Real Estate'}];
export const INDUSTRY_PAIN_MAP = {};
export const COMPANY_SIZES = [{id: 'large', label: 'Large'}];
export const USE_CASES = [{id: 'maintenance', label: 'Maintenance'}];
export const PAIN_CATEGORIES = [
  { id: 'financial', label: 'Financial' },
  { id: 'liability', label: 'Liability' },
  { id: 'operational', label: 'Operational' },
  { id: 'weather', label: 'Weather' },
  { id: 'maintenance', label: 'Maintenance' },
];
export type ATSOption = MembraneOption;

