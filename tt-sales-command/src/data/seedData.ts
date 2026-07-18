// ============================================================
// Seed Data — Historical data from Salesforce + Nooks
// Dec 2025 – Jun 2026 for JL, MA, TH
// Pipeline fields (closed_won/lost, revenue, ib/ob) from
//   SF detail export on 2026-06-22 (report1782140197965.xls)
// Activity fields (dials, connects, conversations) from
//   Nooks monthly exports (data_table_1 (1)-(7).csv, 2026-06-22)
// Emails/LinkedIn from Instantly/SalesLoft
// ============================================================
import type { MetricRow } from '../types';

export interface HistoricalMonth extends MetricRow {
  month: string; // 'YYYY-MM-01'
  // linkedin_touches comes from MetricRow
  ib_opps: number;
  ib_won: number;
  ib_revenue: number;
  ob_opps: number;
  ob_won: number;
  ob_revenue: number;
}

export interface RepSeedData {
  initials: string;
  full_name: string;
  avatar_color: string;
  history: HistoricalMonth[];
}

export const REP_SEED_DATA: Record<string, RepSeedData> = {
  JL: {
    initials: 'JL',
    full_name: 'Jack Luther',
    avatar_color: '#3b82f6', // blue
    history: [
      {
        month: '2025-12-01',
        dials: 269, connects: 9, conversations: 8, email_conversations: 0, linkedin_conversations: 0, emails_sent: 217, linkedin_touches: 2,
        discovery_set: 5, discovery_held: 4, disqualified: 2, demo_held: 2, proposal_sent: 0, closed_won: 1, closed_lost: 0, revenue: 2722,
        ib_opps: 1, ib_won: 1, ib_revenue: 2722, ob_opps: 0, ob_won: 0, ob_revenue: 0,
      },
      {
        month: '2026-01-01',
        dials: 341, connects: 50, conversations: 24, email_conversations: 0, linkedin_conversations: 0, emails_sent: 468, linkedin_touches: 0,
        discovery_set: 3, discovery_held: 2, disqualified: 1, demo_held: 5, proposal_sent: 0, closed_won: 0, closed_lost: 5, revenue: 0,
        ib_opps: 6, ib_won: 0, ib_revenue: 0, ob_opps: 3, ob_won: 0, ob_revenue: 0,
      },
      {
        month: '2026-02-01',
        dials: 393, connects: 54, conversations: 15, email_conversations: 0, linkedin_conversations: 0, emails_sent: 249, linkedin_touches: 46,
        discovery_set: 7, discovery_held: 5, disqualified: 0, demo_held: 3, proposal_sent: 0, closed_won: 1, closed_lost: 7, revenue: 4400,
        ib_opps: 5, ib_won: 0, ib_revenue: 0, ob_opps: 4, ob_won: 1, ob_revenue: 4400,
      },
      {
        month: '2026-03-01',
        dials: 689, connects: 89, conversations: 33, email_conversations: 0, linkedin_conversations: 0, emails_sent: 676, linkedin_touches: 140,
        discovery_set: 8, discovery_held: 6, disqualified: 3, demo_held: 4, proposal_sent: 0, closed_won: 2, closed_lost: 7, revenue: 7220,
        ib_opps: 8, ib_won: 2, ib_revenue: 7220, ob_opps: 2, ob_won: 0, ob_revenue: 0,
      },
      {
        month: '2026-04-01',
        dials: 1888, connects: 138, conversations: 53, email_conversations: 0, linkedin_conversations: 0, emails_sent: 1398, linkedin_touches: 164,
        discovery_set: 7, discovery_held: 5, disqualified: 6, demo_held: 3, proposal_sent: 0, closed_won: 0, closed_lost: 8, revenue: 0,
        ib_opps: 7, ib_won: 0, ib_revenue: 0, ob_opps: 7, ob_won: 0, ob_revenue: 0,
      },
      {
        month: '2026-05-01',
        dials: 1431, connects: 67, conversations: 19, email_conversations: 0, linkedin_conversations: 0, emails_sent: 1799, linkedin_touches: 150,
        discovery_set: 10, discovery_held: 8, disqualified: 2, demo_held: 0, proposal_sent: 0, closed_won: 1, closed_lost: 6, revenue: 8000,
        ib_opps: 8, ib_won: 1, ib_revenue: 8000, ob_opps: 2, ob_won: 0, ob_revenue: 0,
      },
      {
        month: '2026-06-01',
        dials: 714, connects: 32, conversations: 14, email_conversations: 0, linkedin_conversations: 0, emails_sent: 588, linkedin_touches: 0,
        discovery_set: 0, discovery_held: 0, disqualified: 0, demo_held: 1, proposal_sent: 0, closed_won: 0, closed_lost: 2, revenue: 0,
        ib_opps: 5, ib_won: 0, ib_revenue: 0, ob_opps: 1, ob_won: 0, ob_revenue: 0,
      },
    ],
  },

  MA: {
    initials: 'MA',
    full_name: 'Moe Aqel',
    avatar_color: '#8b5cf6', // violet
    history: [
      {
        month: '2025-12-01',
        dials: 398, connects: 12, conversations: 9, email_conversations: 0, linkedin_conversations: 0, emails_sent: 1111, linkedin_touches: 4,
        discovery_set: 4, discovery_held: 3, disqualified: 2, demo_held: 1, proposal_sent: 0, closed_won: 1, closed_lost: 0, revenue: 3025,
        ib_opps: 0, ib_won: 0, ib_revenue: 0, ob_opps: 1, ob_won: 1, ob_revenue: 3025,
      },
      {
        month: '2026-01-01',
        dials: 534, connects: 33, conversations: 7, email_conversations: 0, linkedin_conversations: 0, emails_sent: 1204, linkedin_touches: 0,
        discovery_set: 3, discovery_held: 2, disqualified: 1, demo_held: 0, proposal_sent: 0, closed_won: 0, closed_lost: 6, revenue: 0,
        ib_opps: 1, ib_won: 0, ib_revenue: 0, ob_opps: 1, ob_won: 0, ob_revenue: 0,
      },
      {
        month: '2026-02-01',
        dials: 432, connects: 29, conversations: 8, email_conversations: 0, linkedin_conversations: 0, emails_sent: 345, linkedin_touches: 0,
        discovery_set: 4, discovery_held: 3, disqualified: 0, demo_held: 3, proposal_sent: 0, closed_won: 3, closed_lost: 3, revenue: 8175,
        ib_opps: 5, ib_won: 2, ib_revenue: 5375, ob_opps: 2, ob_won: 1, ob_revenue: 2800,
      },
      {
        month: '2026-03-01',
        dials: 645, connects: 49, conversations: 14, email_conversations: 0, linkedin_conversations: 0, emails_sent: 925, linkedin_touches: 23,
        discovery_set: 4, discovery_held: 3, disqualified: 0, demo_held: 5, proposal_sent: 0, closed_won: 0, closed_lost: 6, revenue: 0,
        ib_opps: 8, ib_won: 0, ib_revenue: 0, ob_opps: 3, ob_won: 0, ob_revenue: 0,
      },
      {
        month: '2026-04-01',
        dials: 2021, connects: 153, conversations: 35, email_conversations: 0, linkedin_conversations: 0, emails_sent: 1598, linkedin_touches: 252,
        discovery_set: 4, discovery_held: 3, disqualified: 2, demo_held: 1, proposal_sent: 0, closed_won: 2, closed_lost: 5, revenue: 12525,
        ib_opps: 10, ib_won: 2, ib_revenue: 12525, ob_opps: 2, ob_won: 0, ob_revenue: 0,
      },
      {
        month: '2026-05-01',
        dials: 429, connects: 32, conversations: 10, email_conversations: 0, linkedin_conversations: 0, emails_sent: 385, linkedin_touches: 4,
        discovery_set: 7, discovery_held: 5, disqualified: 0, demo_held: 0, proposal_sent: 0, closed_won: 3, closed_lost: 2, revenue: 17025,
        ib_opps: 8, ib_won: 3, ib_revenue: 17025, ob_opps: 2, ob_won: 0, ob_revenue: 0,
      },
      {
        month: '2026-06-01',
        dials: 996, connects: 108, conversations: 39, email_conversations: 0, linkedin_conversations: 0, emails_sent: 761, linkedin_touches: 0,
        discovery_set: 0, discovery_held: 0, disqualified: 0, demo_held: 0, proposal_sent: 0, closed_won: 1, closed_lost: 2, revenue: 3025,
        ib_opps: 4, ib_won: 1, ib_revenue: 3025, ob_opps: 4, ob_won: 0, ob_revenue: 0,
      },
    ],
  },

  TH: {
    initials: 'TH',
    full_name: 'Tyler Hanson',
    avatar_color: '#10b981', // emerald
    history: [
      {
        month: '2025-12-01',
        dials: 167, connects: 12, conversations: 4, email_conversations: 0, linkedin_conversations: 0, emails_sent: 1119, linkedin_touches: 44,
        discovery_set: 2, discovery_held: 1, disqualified: 0, demo_held: 1, proposal_sent: 0, closed_won: 0, closed_lost: 0, revenue: 0,
        ib_opps: 0, ib_won: 0, ib_revenue: 0, ob_opps: 0, ob_won: 0, ob_revenue: 0,
      },
      {
        month: '2026-01-01',
        dials: 405, connects: 34, conversations: 10, email_conversations: 0, linkedin_conversations: 0, emails_sent: 1200, linkedin_touches: 163,
        discovery_set: 0, discovery_held: 0, disqualified: 0, demo_held: 4, proposal_sent: 0, closed_won: 0, closed_lost: 6, revenue: 0,
        ib_opps: 5, ib_won: 0, ib_revenue: 0, ob_opps: 1, ob_won: 0, ob_revenue: 0,
      },
      {
        month: '2026-02-01',
        dials: 341, connects: 26, conversations: 7, email_conversations: 0, linkedin_conversations: 0, emails_sent: 685, linkedin_touches: 70,
        discovery_set: 3, discovery_held: 2, disqualified: 2, demo_held: 5, proposal_sent: 0, closed_won: 3, closed_lost: 3, revenue: 9876,
        ib_opps: 7, ib_won: 2, ib_revenue: 7876, ob_opps: 5, ob_won: 1, ob_revenue: 2000,
      },
      {
        month: '2026-03-01',
        dials: 524, connects: 26, conversations: 9, email_conversations: 0, linkedin_conversations: 0, emails_sent: 848, linkedin_touches: 128,
        discovery_set: 5, discovery_held: 4, disqualified: 3, demo_held: 3, proposal_sent: 0, closed_won: 2, closed_lost: 8, revenue: 9800,
        ib_opps: 7, ib_won: 1, ib_revenue: 4200, ob_opps: 4, ob_won: 1, ob_revenue: 5600,
      },
      {
        month: '2026-04-01',
        dials: 2974, connects: 191, conversations: 43, email_conversations: 0, linkedin_conversations: 0, emails_sent: 2608, linkedin_touches: 516,
        discovery_set: 7, discovery_held: 5, disqualified: 3, demo_held: 3, proposal_sent: 0, closed_won: 6, closed_lost: 2, revenue: 26925,
        ib_opps: 7, ib_won: 5, ib_revenue: 17925, ob_opps: 8, ob_won: 1, ob_revenue: 9000,
      },
      {
        month: '2026-05-01',
        dials: 1281, connects: 72, conversations: 5, email_conversations: 0, linkedin_conversations: 0, emails_sent: 916, linkedin_touches: 130,
        discovery_set: 2, discovery_held: 1, disqualified: 2, demo_held: 1, proposal_sent: 0, closed_won: 1, closed_lost: 2, revenue: 7000,
        ib_opps: 7, ib_won: 1, ib_revenue: 7000, ob_opps: 4, ob_won: 0, ob_revenue: 0,
      },
      {
        month: '2026-06-01',
        dials: 833, connects: 90, conversations: 23, email_conversations: 0, linkedin_conversations: 0, emails_sent: 656, linkedin_touches: 0,
        discovery_set: 0, discovery_held: 0, disqualified: 0, demo_held: 0, proposal_sent: 0, closed_won: 0, closed_lost: 1, revenue: 0,
        ib_opps: 3, ib_won: 0, ib_revenue: 0, ob_opps: 4, ob_won: 0, ob_revenue: 0,
      },
    ],
  },

  KS: {
    initials: 'KS',
    full_name: 'Katy Shelman',
    avatar_color: '#ea4335', // red
    history: [
      { month: '2025-12-01', dials: 0, connects: 0, conversations: 0, email_conversations: 0, linkedin_conversations: 0, emails_sent: 0, linkedin_touches: 0, discovery_set: 0, discovery_held: 0, disqualified: 0, demo_held: 0, proposal_sent: 0, closed_won: 0, closed_lost: 0, revenue: 0, ib_opps: 0, ib_won: 0, ib_revenue: 0, ob_opps: 0, ob_won: 0, ob_revenue: 0 },
      { month: '2026-01-01', dials: 0, connects: 0, conversations: 0, email_conversations: 0, linkedin_conversations: 0, emails_sent: 0, linkedin_touches: 0, discovery_set: 0, discovery_held: 0, disqualified: 0, demo_held: 0, proposal_sent: 0, closed_won: 0, closed_lost: 0, revenue: 0, ib_opps: 0, ib_won: 0, ib_revenue: 0, ob_opps: 0, ob_won: 0, ob_revenue: 0 },
      { month: '2026-02-01', dials: 0, connects: 0, conversations: 0, email_conversations: 0, linkedin_conversations: 0, emails_sent: 0, linkedin_touches: 0, discovery_set: 0, discovery_held: 0, disqualified: 0, demo_held: 0, proposal_sent: 0, closed_won: 0, closed_lost: 0, revenue: 0, ib_opps: 0, ib_won: 0, ib_revenue: 0, ob_opps: 0, ob_won: 0, ob_revenue: 0 },
      { month: '2026-03-01', dials: 0, connects: 0, conversations: 0, email_conversations: 0, linkedin_conversations: 0, emails_sent: 0, linkedin_touches: 0, discovery_set: 0, discovery_held: 0, disqualified: 0, demo_held: 0, proposal_sent: 0, closed_won: 0, closed_lost: 0, revenue: 0, ib_opps: 0, ib_won: 0, ib_revenue: 0, ob_opps: 0, ob_won: 0, ob_revenue: 0 },
      { month: '2026-04-01', dials: 0, connects: 0, conversations: 0, email_conversations: 0, linkedin_conversations: 0, emails_sent: 0, linkedin_touches: 0, discovery_set: 0, discovery_held: 0, disqualified: 0, demo_held: 0, proposal_sent: 0, closed_won: 0, closed_lost: 0, revenue: 0, ib_opps: 0, ib_won: 0, ib_revenue: 0, ob_opps: 0, ob_won: 0, ob_revenue: 0 },
      { month: '2026-05-01', dials: 0, connects: 0, conversations: 0, email_conversations: 0, linkedin_conversations: 0, emails_sent: 0, linkedin_touches: 0, discovery_set: 0, discovery_held: 0, disqualified: 0, demo_held: 0, proposal_sent: 0, closed_won: 0, closed_lost: 0, revenue: 0, ib_opps: 0, ib_won: 0, ib_revenue: 0, ob_opps: 0, ob_won: 0, ob_revenue: 0 },
      { month: '2026-06-01', dials: 0, connects: 0, conversations: 0, email_conversations: 0, linkedin_conversations: 0, emails_sent: 0, linkedin_touches: 0, discovery_set: 0, discovery_held: 0, disqualified: 0, demo_held: 0, proposal_sent: 0, closed_won: 0, closed_lost: 0, revenue: 0, ib_opps: 0, ib_won: 0, ib_revenue: 0, ob_opps: 0, ob_won: 0, ob_revenue: 0 },
    ],
  },
};

/** Get all rep initials */
export function getRepInitials(): string[] {
  return Object.keys(REP_SEED_DATA);
}

/** Get seed data for a specific rep */
export function getRepSeed(initials: string): RepSeedData | undefined {
  return REP_SEED_DATA[initials];
}

// ============================================================
// Monthly Quotas
// Default: $11,250/mo — Adjusted months (Jan, Jun, Jul): $5,625
// ============================================================

const DEFAULT_MONTHLY_QUOTA = 11250;
const ADJUSTED_MONTHLY_QUOTA = 5625;

/** Months with adjusted (half) quota — 1-indexed month numbers */
const ADJUSTED_MONTHS = [1, 6, 7]; // January, June, July

/** Get the monthly quota for a given rep and month.
 *  @param _initials — rep initials (currently all reps share the same quota)
 *  @param month — ISO date string (e.g. '2026-07-01') or Date
 */
export function getMonthlyQuota(_initials: string, month: string | Date): number {
  const d = typeof month === 'string' ? new Date(month) : month;
  const m = d.getUTCMonth() + 1; // 1-indexed
  return ADJUSTED_MONTHS.includes(m) ? ADJUSTED_MONTHLY_QUOTA : DEFAULT_MONTHLY_QUOTA;
}

/** Get quarterly quota (sum of 3 months) */
export function getQuarterlyQuota(initials: string, months: string[]): number {
  return months.reduce((sum, m) => sum + getMonthlyQuota(initials, m), 0);
}
