export type SignalStatus = 'hot' | 'warm' | 'watch' | 'none';
export type HiringTrend = 'up' | 'flat' | 'down';
export type Segment = 'Enterprise' | 'Mid-Market' | 'SMB';
export type CadenceStatus = 'enrolled' | 'not_started' | 'completed' | null;

export interface RipplingAccount {
  id: string;
  companyName: string;
  domain: string;
  industry: string;
  employees: number;
  location: string;
  currentAts: string;
  linkedinUrl: string;
  openRoles: number;
  hiringTrend: HiringTrend;
  signalCount: number;
  signalStatus: SignalStatus;
  lastSignalDate: string | null;
  adImpressions: number;
  websiteVisits: number;
  contacts: number;
  assignedRep: string;
  segment: Segment;
  cadenceStatus: CadenceStatus;
}

export const RIPPLING_ACCOUNTS: RipplingAccount[] = [
  {
    "id": "rippling_0",
    "companyName": "Acme Corp",
    "domain": "acme.com",
    "industry": "Software",
    "employees": 500,
    "location": "United States",
    "currentAts": "Rippling",
    "linkedinUrl": "https://linkedin.com/company/acme",
    "openRoles": 12,
    "hiringTrend": "flat",
    "signalCount": 3,
    "signalStatus": "hot",
    "lastSignalDate": "1d ago",
    "adImpressions": 4578,
    "websiteVisits": 6,
    "contacts": 2,
    "assignedRep": "Jack Luther",
    "segment": "Mid-Market",
    "cadenceStatus": "enrolled"
  },
  {
    "id": "rippling_1",
    "companyName": "Beta LLC",
    "domain": "beta.com",
    "industry": "K-12",
    "employees": 1200,
    "location": "United States",
    "currentAts": "Rippling",
    "linkedinUrl": "https://linkedin.com/company/beta",
    "openRoles": 45,
    "hiringTrend": "up",
    "signalCount": 0,
    "signalStatus": "none",
    "lastSignalDate": "5d ago",
    "adImpressions": 932,
    "websiteVisits": 0,
    "contacts": 1,
    "assignedRep": "Moe Aqel",
    "segment": "Enterprise",
    "cadenceStatus": "enrolled"
  },
  {
    "id": "rippling_2",
    "companyName": "Svenska US",
    "domain": "svenska.com",
    "industry": "Retail",
    "employees": 300,
    "location": "United States",
    "currentAts": "Rippling",
    "linkedinUrl": "https://linkedin.com/company/svenska",
    "openRoles": 8,
    "hiringTrend": "down",
    "signalCount": 0,
    "signalStatus": "none",
    "lastSignalDate": "1d ago",
    "adImpressions": 758,
    "websiteVisits": 0,
    "contacts": 0,
    "assignedRep": "Tyler Hanson",
    "segment": "Mid-Market",
    "cadenceStatus": null
  }
];

export function getRipplingStats() {
  return {
    totalCompanies: RIPPLING_ACCOUNTS.length,
    inSignalBoard: RIPPLING_ACCOUNTS.filter(a => a.signalStatus !== 'none').length,
    hotAccounts: RIPPLING_ACCOUNTS.filter(a => a.signalStatus === 'hot').length,
    totalContacts: RIPPLING_ACCOUNTS.reduce((sum, a) => sum + a.contacts, 0),
    totalWebsiteVisits: RIPPLING_ACCOUNTS.reduce((sum, a) => sum + a.websiteVisits, 0),
  };
}
