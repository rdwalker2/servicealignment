export const MEMBRANE_OPTIONS = [
  'Unknown',
  'TPO (Thermoplastic Polyolefin)',
  'PVC (Polyvinyl Chloride)',
  'EPDM (Rubber)',
  'Built-Up Roofing (BUR)',
  'Modified Bitumen',
  'Metal',
  'Spray Polyurethane Foam (SPF)',
  'Other'
];

export const BUILDING_USE_CASES = [
  'Warehouse / Distribution',
  'Retail / Shopping Center',
  'Office Building',
  'Manufacturing',
  'Cold Storage',
  'Data Center',
  'Multi-Family',
  'Other'
];

export const PERSONA_OPTIONS = [
  { value: 'property-manager', label: 'Property Manager' },
  { value: 'facility-director', label: 'Director of Facilities' },
  { value: 'cfo', label: 'CFO / Ownership' },
  { value: 'asset-manager', label: 'Asset Manager' },
];

export const ATS_OPTIONS = MEMBRANE_OPTIONS.map(m => ({ value: m, label: m }));
export const HRIS_OPTIONS = [{ value: 'none', label: 'None' }];
export const INDUSTRY_OPTIONS = [{ value: 'commercial', label: 'Commercial Real Estate' }];
export const SIZE_OPTIONS = [{ value: 'large', label: 'Large' }];
export const USE_CASE_OPTIONS = BUILDING_USE_CASES.map(u => ({ value: u, label: u }));
