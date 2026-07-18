export type TakeoutSignalStatus = 'hot' | 'warm' | 'watch' | 'none';
export type ContractRisk = 'High' | 'Medium' | 'Low' | 'Unknown';

export interface TakeoutContact {
  name: string;
  title: string;
  avatarColor: string;
}

export interface CompetitorTakeout {
  id: string;
  companyName: string;
  domain: string;
  employees: number;
  currentAts: string;
  contractRisk: ContractRisk;
  monthsToRenewal: number;
  openRoles: number;
  hiringTrend: 'up' | 'flat' | 'down';
  signalStatus: TakeoutSignalStatus;
  signalCount: number;
  websiteVisits: number;
  adImpressions: number;
  contacts: TakeoutContact[];
  assignedRep: string | null;
  notes: string;
}

export const COMPETITOR_TAKEOUTS: CompetitorTakeout[] = [
  {
    "id": "takeout_0",
    "companyName": "Acme Corp",
    "domain": "acme.com",
    "employees": 500,
    "currentAts": "Lever",
    "contractRisk": "High",
    "monthsToRenewal": 3,
    "openRoles": 12,
    "hiringTrend": "flat",
    "signalStatus": "hot",
    "signalCount": 3,
    "websiteVisits": 3,
    "adImpressions": 2855,
    "contacts": [
      {
        "name": "Alice Smith",
        "title": "Head of TA",
        "avatarColor": "#14b8a6"
      },
      {
        "name": "Bob Jones",
        "title": "Recruiter",
        "avatarColor": "#f59e0b"
      }
    ],
    "assignedRep": "Jack Luther",
    "notes": ""
  },
  {
    "id": "takeout_1",
    "companyName": "Beta LLC",
    "domain": "beta.com",
    "employees": 1200,
    "currentAts": "Workday",
    "contractRisk": "Medium",
    "monthsToRenewal": 12,
    "openRoles": 45,
    "hiringTrend": "flat",
    "signalStatus": "none",
    "signalCount": 0,
    "websiteVisits": 0,
    "adImpressions": 3494,
    "contacts": [
      {
        "name": "Charlie Brown",
        "title": "VP HR",
        "avatarColor": "#ec4899"
      }
    ],
    "assignedRep": "Moe Aqel",
    "notes": ""
  },
  {
    "id": "takeout_2",
    "companyName": "Svenska US",
    "domain": "svenska.com",
    "employees": 300,
    "currentAts": "Greenhouse",
    "contractRisk": "Low",
    "monthsToRenewal": 20,
    "openRoles": 8,
    "hiringTrend": "down",
    "signalStatus": "none",
    "signalCount": 0,
    "websiteVisits": 0,
    "adImpressions": 2398,
    "contacts": [],
    "assignedRep": "Tyler Hanson",
    "notes": ""
  }
];

export function getTakeoutStats() {
  return {
    totalTargets: COMPETITOR_TAKEOUTS.length,
    hotTargets: COMPETITOR_TAKEOUTS.filter(m => m.signalStatus === 'hot').length,
    highRiskContracts: COMPETITOR_TAKEOUTS.filter(m => m.contractRisk === 'High').length,
    leverTargets: COMPETITOR_TAKEOUTS.filter(m => m.currentAts === 'Lever').length,
    workdayTargets: COMPETITOR_TAKEOUTS.filter(m => m.currentAts === 'Workday').length,
  };
}
