export interface HospitalityContact {
  name: string;
  title: string;
  email?: string;
  linkedin_url?: string;
  role: 'decision_maker' | 'champion' | 'gatekeeper' | 'contact';
}

export type AtsCategory = 'legacy' | 'modern' | 'jobboard' | 'paper' | 'teamtailor' | 'none' | 'unknown';

export interface HospitalityGroup {
  id: string;
  name: string;
  website: string;
  hq_location: string;
  venue_count: number;
  employee_count: number;
  cuisine_type: string;
  group_type: 'restaurant_group' | 'hotel_chain' | 'event_venue' | 'franchise';
  
  // Tech Stack
  pos_system: string;
  reservation_system: string;
  current_ats: string;
  
  // Intelligence
  has_yelp_integration: boolean;
  open_roles_foh: number;
  open_roles_boh: number;
  nps_score?: number; // employee satisfaction
  
  contacts: HospitalityContact[];
}

export const NO_ATS_VALUES = ['none', 'email', 'paper', 'walk-in'];
export const JOBBOARD_ATS = ['indeed', 'craigslist', 'culinary agents', 'seasoned'];
export const LEGACY_ATS = ['taleo', 'workday', 'icims', 'brassring'];
export const MODERN_ATS = ['harri', 'greenhouse', 'lever', 'bamboohr', 'paycom'];

export function classifyAts(ats: string): AtsCategory {
  const l = ats.toLowerCase();
  if (NO_ATS_VALUES.includes(l)) return 'paper';
  if (JOBBOARD_ATS.includes(l)) return 'jobboard';
  if (LEGACY_ATS.includes(l)) return 'legacy';
  if (MODERN_ATS.includes(l)) return 'modern';
  if (l === 'teamtailor') return 'teamtailor';
  return 'unknown';
}

export const HOSPITALITY_GROUPS: HospitalityGroup[] = [
  {
    id: 'grp-001',
    name: 'Lettuce Entertain You Enterprises',
    website: 'leye.com',
    hq_location: 'Chicago, IL',
    venue_count: 130,
    employee_count: 7000,
    cuisine_type: 'Multi-Concept',
    group_type: 'restaurant_group',
    pos_system: 'Toast',
    reservation_system: 'SevenRooms',
    current_ats: 'Workday',
    has_yelp_integration: true,
    open_roles_foh: 45,
    open_roles_boh: 62,
    nps_score: 3.8,
    contacts: [
      { name: 'Sarah Mitchell', title: 'VP of Human Resources', role: 'decision_maker' },
      { name: 'David Chen', title: 'Director of Talent Acquisition', role: 'champion' }
    ]
  },
  {
    id: 'grp-002',
    name: 'Hillstone Restaurant Group',
    website: 'hillstone.com',
    hq_location: 'Beverly Hills, CA',
    venue_count: 45,
    employee_count: 3500,
    cuisine_type: 'American Fine Dining',
    group_type: 'restaurant_group',
    pos_system: 'Aloha',
    reservation_system: 'Resy',
    current_ats: 'Harri',
    has_yelp_integration: false,
    open_roles_foh: 12,
    open_roles_boh: 30,
    nps_score: 4.1,
    contacts: [
      { name: 'James Walton', title: 'Chief People Officer', role: 'decision_maker' }
    ]
  },
  {
    id: 'grp-003',
    name: 'Major Food Group',
    website: 'majorfood.com',
    hq_location: 'New York, NY',
    venue_count: 32,
    employee_count: 2800,
    cuisine_type: 'Italian / Fine Dining',
    group_type: 'restaurant_group',
    pos_system: 'Toast',
    reservation_system: 'SevenRooms',
    current_ats: 'Culinary Agents',
    has_yelp_integration: true,
    open_roles_foh: 88,
    open_roles_boh: 40,
    nps_score: 3.4,
    contacts: [
      { name: 'Elena Rossi', title: 'Head of People & Culture', role: 'decision_maker' },
      { name: 'Marcus Todd', title: 'Corporate Executive Chef', role: 'champion' }
    ]
  },
  {
    id: 'grp-004',
    name: 'Auberge Resorts Collection',
    website: 'aubergeresorts.com',
    hq_location: 'Mill Valley, CA',
    venue_count: 27,
    employee_count: 4500,
    cuisine_type: 'Luxury Hospitality',
    group_type: 'hotel_chain',
    pos_system: 'Oracle MICROS',
    reservation_system: 'OpenTable',
    current_ats: 'Taleo',
    has_yelp_integration: false,
    open_roles_foh: 110,
    open_roles_boh: 65,
    nps_score: 4.5,
    contacts: [
      { name: 'Amanda Lewis', title: 'SVP Human Resources', role: 'decision_maker' }
    ]
  },
  {
    id: 'grp-005',
    name: 'First Watch Restaurants',
    website: 'firstwatch.com',
    hq_location: 'Bradenton, FL',
    venue_count: 450,
    employee_count: 11000,
    cuisine_type: 'Breakfast/Brunch',
    group_type: 'restaurant_group',
    pos_system: 'NCR Aloha',
    reservation_system: 'Yelp Waitlist',
    current_ats: 'Paycom',
    has_yelp_integration: true,
    open_roles_foh: 300,
    open_roles_boh: 450,
    nps_score: 3.2,
    contacts: [
      { name: 'Richard Banks', title: 'VP of Talent Acquisition', role: 'decision_maker' },
      { name: 'Lauren Smith', title: 'Regional HR Manager', role: 'champion' }
    ]
  }
];

export async function loadHospitalityData(): Promise<HospitalityGroup[]> {
  // Simulate network request
  return new Promise(resolve => setTimeout(() => resolve(HOSPITALITY_GROUPS), 400));
}
