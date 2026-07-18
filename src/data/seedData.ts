import type { DiscoverySession } from './types';

export const discoverySessions: DiscoverySession[] = [
  {
    id: 'opp-001',
    company_name: 'Apex Building Group',
    company_id: 'apex.com',
    industry: 'Commercial Real Estate',
    deal_stage: 'discovery',
    deal_value: 125000,
    rep_id: 'rep-rw',
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-10T10:00:00Z'
  },
  {
    id: 'opp-002',
    company_name: 'JLL Corporate HQ',
    company_id: 'jll.com',
    industry: 'Property Management',
    deal_stage: 'qualifying',
    deal_value: 450000,
    rep_id: 'rep-rw',
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-04-05T10:00:00Z'
  }
];

export function getMonthlyQuota(repId: string, month: string) {
  return 100000;
}

export const REP_SEED_DATA: Record<string, any> = {};
