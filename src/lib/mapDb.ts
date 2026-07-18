// ============================================================
// Map Database Layer — Territory Map
// Fetches pipeline deals and resolves locations for map pins
// ============================================================
import { getAllDiscoverySessions, type DiscoverySession } from './discoveryDatabase';

// ── Types ──

export interface GeoFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: Record<string, any>;
}

export interface GeoFeatureCollection {
  type: 'FeatureCollection';
  features: GeoFeature[];
}

// ── US State centroids ──
const US_STATE_CENTROIDS: Record<string, [number, number]> = {
  'Alabama': [-86.9023, 32.3182], 'Alaska': [-153.4937, 64.2008],
  'Arizona': [-111.0937, 34.0489], 'Arkansas': [-92.3731, 34.7465],
  'California': [-119.4179, 36.7783], 'Colorado': [-105.7821, 39.5501],
  'Connecticut': [-72.7554, 41.6032], 'Delaware': [-75.5277, 38.9108],
  'Florida': [-81.5158, 27.6648], 'Georgia': [-83.6431, 32.1656],
  'Hawaii': [-155.5828, 19.8968], 'Idaho': [-114.7420, 44.0682],
  'Illinois': [-89.3985, 40.6331], 'Indiana': [-86.1349, 40.2672],
  'Iowa': [-93.0977, 41.8780], 'Kansas': [-98.4842, 39.0119],
  'Kentucky': [-84.2700, 37.8393], 'Louisiana': [-91.9623, 30.9843],
  'Maine': [-69.4455, 45.2538], 'Maryland': [-76.6413, 39.0458],
  'Massachusetts': [-71.3824, 42.4072], 'Michigan': [-84.5361, 44.3148],
  'Minnesota': [-94.6859, 46.7296], 'Mississippi': [-89.3985, 32.3547],
  'Missouri': [-91.8318, 37.9643], 'Montana': [-110.3626, 46.8797],
  'Nebraska': [-99.9018, 41.4925], 'Nevada': [-116.4194, 38.8026],
  'New Hampshire': [-71.5724, 43.1939], 'New Jersey': [-74.4057, 40.0583],
  'New Mexico': [-105.8701, 34.5199], 'New York': [-74.2179, 43.2994],
  'North Carolina': [-79.0193, 35.7596], 'North Dakota': [-101.0020, 47.5515],
  'Ohio': [-82.9071, 40.4173], 'Oklahoma': [-97.0929, 35.4676],
  'Oregon': [-120.5542, 43.8041], 'Pennsylvania': [-77.1945, 41.2033],
  'Rhode Island': [-71.4774, 41.5801], 'South Carolina': [-81.1637, 33.8361],
  'South Dakota': [-99.9018, 43.9695], 'Tennessee': [-86.5804, 35.5175],
  'Texas': [-99.9018, 31.9686], 'Utah': [-111.0937, 39.3210],
  'Vermont': [-72.5778, 44.5588], 'Virginia': [-78.6569, 37.4316],
  'Washington': [-120.7401, 47.7511], 'West Virginia': [-80.4549, 38.5976],
  'Wisconsin': [-89.6165, 43.7844], 'Wyoming': [-107.2903, 43.0760],
  'District of Columbia': [-77.0369, 38.9072], 'DC': [-77.0369, 38.9072],
  'AL': [-86.9023, 32.3182], 'AK': [-153.4937, 64.2008],
  'AZ': [-111.0937, 34.0489], 'AR': [-92.3731, 34.7465],
  'CA': [-119.4179, 36.7783], 'CO': [-105.7821, 39.5501],
  'CT': [-72.7554, 41.6032], 'DE': [-75.5277, 38.9108],
  'FL': [-81.5158, 27.6648], 'GA': [-83.6431, 32.1656],
  'HI': [-155.5828, 19.8968], 'ID': [-114.7420, 44.0682],
  'IL': [-89.3985, 40.6331], 'IN': [-86.1349, 40.2672],
  'IA': [-93.0977, 41.8780], 'KS': [-98.4842, 39.0119],
  'KY': [-84.2700, 37.8393], 'LA': [-91.9623, 30.9843],
  'ME': [-69.4455, 45.2538], 'MD': [-76.6413, 39.0458],
  'MA': [-71.3824, 42.4072], 'MI': [-84.5361, 44.3148],
  'MN': [-94.6859, 46.7296], 'MS': [-89.3985, 32.3547],
  'MO': [-91.8318, 37.9643], 'MT': [-110.3626, 46.8797],
  'NE': [-99.9018, 41.4925], 'NV': [-116.4194, 38.8026],
  'NH': [-71.5724, 43.1939], 'NJ': [-74.4057, 40.0583],
  'NM': [-105.8701, 34.5199], 'NY': [-74.2179, 43.2994],
  'NC': [-79.0193, 35.7596], 'ND': [-101.0020, 47.5515],
  'OH': [-82.9071, 40.4173], 'OK': [-97.0929, 35.4676],
  'OR': [-120.5542, 43.8041], 'PA': [-77.1945, 41.2033],
  'RI': [-71.4774, 41.5801], 'SC': [-81.1637, 33.8361],
  'SD': [-99.9018, 43.9695], 'TN': [-86.5804, 35.5175],
  'TX': [-99.9018, 31.9686], 'UT': [-111.0937, 39.3210],
  'VT': [-72.5778, 44.5588], 'VA': [-78.6569, 37.4316],
  'WA': [-120.7401, 47.7511], 'WV': [-80.4549, 38.5976],
  'WI': [-89.6165, 43.7844], 'WY': [-107.2903, 43.0760],
};

// ── US cities with lat/lng ──
const US_CITY_COORDS: Record<string, [number, number]> = {
  'New York': [-74.006, 40.7128], 'Los Angeles': [-118.2437, 34.0522],
  'Chicago': [-87.6298, 41.8781], 'Houston': [-95.3698, 29.7604],
  'Phoenix': [-112.074, 33.4484], 'Philadelphia': [-75.1652, 39.9526],
  'San Antonio': [-98.4936, 29.4241], 'San Diego': [-117.1611, 32.7157],
  'Dallas': [-96.797, 32.7767], 'San Jose': [-121.8863, 37.3382],
  'Austin': [-97.7431, 30.2672], 'Jacksonville': [-81.6557, 30.3322],
  'Fort Worth': [-97.3308, 32.7555], 'Columbus': [-82.9988, 39.9612],
  'Charlotte': [-80.8431, 35.2271], 'Indianapolis': [-86.1581, 39.7684],
  'San Francisco': [-122.4194, 37.7749], 'Seattle': [-122.3321, 47.6062],
  'Denver': [-104.9903, 39.7392], 'Nashville': [-86.7816, 36.1627],
  'Washington': [-77.0369, 38.9072], 'Oklahoma City': [-97.5164, 35.4676],
  'El Paso': [-106.425, 31.7619], 'Boston': [-71.0589, 42.3601],
  'Portland': [-122.6765, 45.5152], 'Las Vegas': [-115.1398, 36.1699],
  'Memphis': [-90.049, 35.1495], 'Louisville': [-85.7585, 38.2527],
  'Baltimore': [-76.6122, 39.2904], 'Milwaukee': [-87.9065, 43.0389],
  'Albuquerque': [-106.6504, 35.0844], 'Tucson': [-110.9747, 32.2226],
  'Fresno': [-119.7726, 36.7378], 'Sacramento': [-121.4944, 38.5816],
  'Kansas City': [-94.5786, 39.0997], 'Atlanta': [-84.388, 33.749],
  'Omaha': [-95.9345, 41.2565], 'Colorado Springs': [-104.8214, 38.8339],
  'Raleigh': [-78.6382, 35.7796], 'Miami': [-80.1918, 25.7617],
  'Minneapolis': [-93.265, 44.9778], 'Tampa': [-82.4572, 27.9506],
  'Tulsa': [-95.9928, 36.154], 'Arlington': [-97.1081, 32.7357],
  'New Orleans': [-90.0715, 29.9511], 'Cleveland': [-81.6944, 41.4993],
  'Pittsburgh': [-79.9959, 40.4406], 'Cincinnati': [-84.512, 39.1031],
  'St. Louis': [-90.1994, 38.627], 'Orlando': [-81.3789, 28.5383],
  'Salt Lake City': [-111.891, 40.7608], 'Richmond': [-77.436, 37.5407],
  'Boise': [-116.2146, 43.615], 'Detroit': [-83.0458, 42.3314],
  'Madison': [-89.4012, 43.0731], 'Birmingham': [-86.8025, 33.5207],
  'Baton Rouge': [-91.1403, 30.4515], 'Des Moines': [-93.6091, 41.5868],
  'Chattanooga': [-85.3097, 35.0456], 'Knoxville': [-83.9207, 35.9606],
  'Dayton': [-84.1916, 39.7589], 'Savannah': [-81.0998, 32.0809],
  'Charleston': [-79.9311, 32.7765], 'Honolulu': [-157.8583, 21.3069],
  'Scottsdale': [-111.9261, 33.4942], 'Irvine': [-117.7947, 33.6846],
  'Oakland': [-122.2712, 37.8044], 'Plano': [-96.6989, 33.0198],
  'Newark': [-74.1724, 40.7357], 'Buffalo': [-78.8784, 42.8864],
  'Reno': [-119.8138, 39.5296], 'St. Petersburg': [-82.6403, 27.7676],
  'Spokane': [-117.4260, 47.6588], 'Lexington': [-84.504, 38.0406],
  'Durham': [-78.8986, 35.994], 'Provo': [-111.6585, 40.2338],
  'Greenville': [-82.394, 34.8526], 'Huntsville': [-86.5861, 34.7304],
  'Ann Arbor': [-83.7430, 42.2808], 'Bethesda': [-77.0947, 38.9847],
  'Richmond': [-77.436, 37.5407], 'Redwood City': [-122.2364, 37.4852],
};

// ── Known company HQ locations (for pipeline deals that lack city/state) ──
// This is the lookup table for your real pipeline companies.
// Format: lowercased company name → [city, state]
const KNOWN_COMPANY_LOCATIONS: Record<string, [string, string]> = {
  // MA deals
  'leader bank n.a': ['Arlington', 'MA'],
  'royal oaks country club': ['Houston', 'TX'],
  'brookfield country club': ['Boca Raton', 'FL'],
  'compliance management international': ['Bethesda', 'MD'],
  'emergence ai': ['San Francisco', 'CA'],
  'engram-lab': ['San Francisco', 'CA'],
  'grow law': ['Denver', 'CO'],
  'oak hill country club': ['Rochester', 'NY'],
  'promopsg': ['Chicago', 'IL'],
  'qual chem': ['Houston', 'TX'],
  'sqp construction group': ['Dallas', 'TX'],
  'employee navigator': ['Bethesda', 'MD'],
  'msi viking': ['San Diego', 'CA'],
  'sequencing': ['San Francisco', 'CA'],
  'sygaldry': ['Austin', 'TX'],
  'influxdata': ['San Francisco', 'CA'],
  'southern indian health council inc.': ['San Diego', 'CA'],
  'the lester group': ['Philadelphia', 'PA'],
  'united way of new york city': ['New York', 'NY'],

  // JL deals
  'acquire2win': ['New York', 'NY'],
  'dandelion chocolate': ['San Francisco', 'CA'],
  'economic hardship reporting project': ['New York', 'NY'],
  'pr consulting': ['Los Angeles', 'CA'],
  'tigergraph': ['Redwood City', 'CA'],
  'apex building group': ['Chicago', 'IL'],
  'rockwell health center': ['Kansas City', 'MO'],
  'rx diet': ['Dallas', 'TX'],
  'scout clinical': ['Boston', 'MA'],
  'station a': ['San Francisco', 'CA'],
  'oregon coast community action': ['Portland', 'OR'],

  // TH deals
  'modern art museum of fort worth': ['Fort Worth', 'TX'],
  'formic': ['Chicago', 'IL'],
  'infoworld': ['San Francisco', 'CA'],
  'newport industries inc': ['Newport', 'KY'],
  'nicholas and company inc. foodservice': ['Salt Lake City', 'UT'],
  'oxford companies': ['Ann Arbor', 'MI'],
  'terraformation': ['Honolulu', 'HI'],
  'the now': ['Los Angeles', 'CA'],
  'thelaunchbox': ['Atlanta', 'GA'],
  'uttr': ['Austin', 'TX'],
  'crumdale specialty': ['Chicago', 'IL'],
  'deeku healthcare': ['Nashville', 'TN'],
  'doyles sheehan': ['Omaha', 'NE'],
  'encompass onsite solutions': ['Houston', 'TX'],
  'ingenuity prep public charter school': ['Washington', 'DC'],
  'jambalaya group': ['New Orleans', 'LA'],
  'qualio': ['San Francisco', 'CA'],
  'sigma phi epsilon (official)': ['Richmond', 'VA'],
  'vestia advisors': ['Birmingham', 'AL'],
};

/**
 * Try to extract "City, ST" from a company name.
 * Handles patterns like "Company | Houston, TX" or "Company of Fort Worth"
 */
function parseLocationFromName(name: string): [string, string] | null {
  // Check known locations first (case-insensitive)
  const key = name.toLowerCase().replace(/\s*\|.*$/, '').trim();
  const known = KNOWN_COMPANY_LOCATIONS[key] || KNOWN_COMPANY_LOCATIONS[name.toLowerCase().trim()];
  if (known) return known;

  // Pattern: "Company | City, ST"
  const pipeMatch = name.match(/\|\s*([^,]+),\s*(\w{2})\s*$/);
  if (pipeMatch) return [pipeMatch[1].trim(), pipeMatch[2].trim()];

  // Pattern: "Company of CityName"
  const ofMatch = name.match(/\bof\s+(Fort Worth|New York|Los Angeles|San Francisco|Houston|Chicago|Boston|Austin|Denver|Seattle|Portland|Nashville|Atlanta|Miami|Dallas|Phoenix|Charlotte|Raleigh|San Diego|Tampa|Orlando|Indianapolis|Columbus|Salt Lake City|Kansas City|St\.?\s*Louis|Minneapolis|Pittsburgh|Cleveland|Cincinnati|Milwaukee|Memphis|Louisville|Las Vegas|Richmond|Boise|Baltimore|Washington|New Orleans|Omaha|Savannah|Charleston)\b/i);
  if (ofMatch) {
    const city = ofMatch[1].trim();
    return [city, ''];
  }

  return null;
}

/**
 * Resolve coordinates for a company.
 * Tries: known HQ lookup → name parsing → city centroid → state centroid
 */
function resolveCoordinates(city: string | null, state: string | null, companyName?: string): [number, number] | null {
  // 1. Try parsing location from company name
  if (companyName) {
    const parsed = parseLocationFromName(companyName);
    if (parsed) {
      const [parsedCity, parsedState] = parsed;
      // Try city coords
      const cityCoords = US_CITY_COORDS[parsedCity];
      if (cityCoords) {
        const jitter = () => (Math.random() - 0.5) * 0.06;
        return [cityCoords[0] + jitter(), cityCoords[1] + jitter()];
      }
      // Try state centroid
      if (parsedState) {
        const stateCoords = US_STATE_CENTROIDS[parsedState];
        if (stateCoords) {
          const jitter = () => (Math.random() - 0.5) * 0.5;
          return [stateCoords[0] + jitter(), stateCoords[1] + jitter()];
        }
      }
    }
  }

  // 2. Try direct city lookup
  if (city) {
    const cityCoords = US_CITY_COORDS[city.trim()];
    if (cityCoords) {
      const jitter = () => (Math.random() - 0.5) * 0.06;
      return [cityCoords[0] + jitter(), cityCoords[1] + jitter()];
    }
  }

  // 3. Try state centroid
  if (state) {
    const stateCoords = US_STATE_CENTROIDS[state.trim()];
    if (stateCoords) {
      const jitter = () => (Math.random() - 0.5) * 0.5;
      return [stateCoords[0] + jitter(), stateCoords[1] + jitter()];
    }
  }

  return null;
}

// ── Stage display helpers ──
const STAGE_LABELS: Record<string, string> = {
  prospecting: 'Prospecting',
  qualifying: 'Qualifying',
  discovery: 'Discovery',
  diagnosis: 'Diagnosis',
  demonstrate: 'Demonstrate',
  decision: 'Decision',
  signing: 'Signing',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

const STAGE_COLORS: Record<string, string> = {
  prospecting: '#a8a29e',
  qualifying: '#f59e0b',
  discovery: '#3b82f6',
  diagnosis: '#8b5cf6',
  demonstrate: '#ec4899',
  decision: '#f97316',
  signing: '#10b981',
  closed_won: '#22c55e',
  closed_lost: '#ef4444',
};

// ── Rep name lookup ──
const REP_NAMES: Record<string, string> = {
  'rep-jl': 'Jack Luther',
  'rep-ma': 'Michael Adeyeye',
  'rep-th': 'Tyler Hubbard',
  'rep-rw': 'Ryan Walker',
};

// ── Fetch pipeline deals for map ──

export async function fetchPipelineMapData(): Promise<GeoFeatureCollection> {
  const sessions = getAllDiscoverySessions();
  const activeSessions = sessions.filter(s => 
    s.deal_stage !== 'closed_lost' && s.deal_stage !== 'closed_won'
  );

  const features: GeoFeature[] = [];
  
  for (const session of activeSessions) {
    const coords = resolveCoordinates(null, null, session.company_name);
    if (!coords) continue;

    const parsed = parseLocationFromName(session.company_name);

    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: coords },
      properties: {
        type: 'deal',
        id: session.id,
        company_name: session.company_name,
        domain: session.company_id || '',
        city: parsed?.[0] || '',
        state: parsed?.[1] || '',
        deal_stage: session.deal_stage,
        deal_stage_label: STAGE_LABELS[session.deal_stage] || session.deal_stage,
        deal_value: session.deal_value || 0,
        industry: session.industry || 'Unknown',
        company_size: session.company_size || '',
        current_ats: session.current_ats || 'Unknown',
        owner: REP_NAMES[session.rep_id || ''] || session.rep_id || 'Unassigned',
        owner_id: session.rep_id || '',
        forecast_category: (session as any).forecast_category || 'pipeline',
        next_steps: session.next_steps_what || session.next_action || '',
        next_meeting: session.next_meeting_date || '',
        stage_color: STAGE_COLORS[session.deal_stage] || '#a8a29e',
      },
    });
  }

  console.log(`[TerritoryMap] Mapped ${features.length}/${activeSessions.length} deals to locations`);
  return { type: 'FeatureCollection', features };
}

// ── Fetch unique filter values ──

export function fetchMapFilterOptions(): {
  owners: string[];
  stages: string[];
  industries: string[];
} {
  const sessions = getAllDiscoverySessions();
  const activeSessions = sessions.filter(s => 
    s.deal_stage !== 'closed_lost' && s.deal_stage !== 'closed_won'
  );

  const owners = [...new Set(activeSessions.map(s => REP_NAMES[s.rep_id || ''] || s.rep_id).filter(Boolean))].sort() as string[];
  const stages = [...new Set(activeSessions.map(s => s.deal_stage).filter(Boolean))].sort() as string[];
  const industries = [...new Set(activeSessions.map(s => s.industry).filter(Boolean))].sort() as string[];

  return { owners, stages, industries };
}

export { STAGE_LABELS, STAGE_COLORS };
