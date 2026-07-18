// ── Farmer's Insurance District & Location Data ──
// Source: https://recruitment.farmers.com/industry-recruiter-locator/us
// Enhanced: Individual District Managers & Recruiters with contact info
// Deduplicated: DMs who cover multiple cities are merged into single entries

import rawLocations from './farmersLocations.json';

export type FarmersType = 'District Manager' | 'Recruiter' | 'District Office';

export interface FarmersLocation {
  id: string;
  name: string;           // Person name or office name
  type: FarmersType;      // District Manager, Recruiter, or District Office
  city: string;           // Primary city
  state: string;
  stateCode: string;
  address: string;
  zip: string;
  phone: string | null;
  profileUrl: string;
  region: string;
  district: string;       // Primary district city name
  districts: string[];    // All district cities this person covers
}

// ── Clean up names ──
function cleanName(raw: string): string {
  return raw
    .replace(/Farmers Insurance®?\s*Industry Professionals?\s*in\s*/i, '')
    .replace(/,\s*[A-Z]{2}$/i, '')
    .replace(/\s+Office$/i, '')
    .trim() || raw;
}

// ── Process and deduplicate ──
function processLocations(): FarmersLocation[] {
  const raw = rawLocations as any[];
  
  // Group by unique person (name + address) to deduplicate
  const byKey = new Map<string, { entry: any; districts: Set<string> }>();
  
  for (const loc of raw) {
    const name = cleanName(loc.name);
    const key = `${name}__${loc.address || ''}__${loc.stateCode}`;
    
    if (byKey.has(key)) {
      // Same person seen on another city page — add district
      byKey.get(key)!.districts.add(loc.district || loc.city);
    } else {
      byKey.set(key, {
        entry: loc,
        districts: new Set([loc.district || loc.city]),
      });
    }
  }
  
  let id = 1;
  const results: FarmersLocation[] = [];
  
  for (const [, { entry, districts }] of byKey) {
    const districtArr = [...districts].sort();
    results.push({
      id: `farmers_${String(id++).padStart(4, '0')}`,
      name: cleanName(entry.name),
      type: (entry.type || 'District Manager') as FarmersType,
      city: entry.city,
      state: entry.state,
      stateCode: entry.stateCode,
      address: entry.address || '',
      zip: entry.zip || '',
      phone: entry.phone || null,
      profileUrl: entry.profileUrl,
      region: entry.region,
      district: districtArr[0], // Primary district
      districts: districtArr,   // All districts covered
    });
  }
  
  return results.sort((a, b) => a.state.localeCompare(b.state) || a.city.localeCompare(b.city));
}

export const FARMERS_LOCATIONS: FarmersLocation[] = processLocations();

// ── Stats ──
export function getFarmersStats() {
  const locations = FARMERS_LOCATIONS;
  const states = new Set(locations.map(l => l.stateCode));
  const regions = new Set(locations.map(l => l.region));
  const allDistricts = new Set(locations.flatMap(l => l.districts));
  const withPhone = locations.filter(l => l.phone).length;
  const types: Record<string, number> = {};
  locations.forEach(l => { types[l.type] = (types[l.type] || 0) + 1; });
  const multiDistrict = locations.filter(l => l.districts.length > 1).length;

  return {
    total: locations.length,
    states: states.size,
    regions: regions.size,
    districts: allDistricts.size,
    withPhone,
    types,
    multiDistrict,
    byState: Object.fromEntries(
      [...states].map(s => [s, locations.filter(l => l.stateCode === s).length])
    ),
    byRegion: Object.fromEntries(
      [...regions].map(r => [r, locations.filter(l => l.region === r).length])
    ),
  };
}

// ── Region helper ──
export function getRegion(stateCode: string): string {
  const STATE_TO_REGION: Record<string, string> = {
    'CA': 'West', 'OR': 'West', 'WA': 'West', 'NV': 'West',
    'CO': 'Mountain', 'UT': 'Mountain', 'ID': 'Mountain', 'MT': 'Mountain', 'AZ': 'Mountain', 'NM': 'Mountain',
    'IL': 'Midwest', 'IN': 'Midwest', 'IA': 'Midwest', 'KS': 'Midwest', 'MI': 'Midwest',
    'MN': 'Midwest', 'MO': 'Midwest', 'NE': 'Midwest', 'ND': 'Midwest', 'OH': 'Midwest',
    'SD': 'Midwest', 'WI': 'Midwest',
    'AL': 'South', 'AR': 'South', 'GA': 'South', 'SC': 'South', 'TN': 'South',
    'TX': 'South', 'OK': 'South', 'NC': 'South',
    'CT': 'Northeast', 'MA': 'Northeast', 'MD': 'Northeast', 'NH': 'Northeast',
    'NJ': 'Northeast', 'NY': 'Northeast', 'PA': 'Northeast', 'VA': 'Northeast',
    'WV': 'Northeast',
  };
  return STATE_TO_REGION[stateCode] || 'Other';
}
