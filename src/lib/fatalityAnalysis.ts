// ============================================================
// Fatality Analysis — Aggregated loss reason intelligence
// Reads from DiscoverySession.loss_reason across all closed_lost deals
// ============================================================
import { getAllDiscoverySessions, type DiscoverySession, type LossReason } from './discoveryDatabase';

export interface FatalityCount {
  reason: string;
  label: string;
  count: number;
  pct: number;
  revenue: number;
}

export interface FatalityTrend {
  month: string;
  counts: Record<string, number>;
}

export interface CompetitorLoss {
  competitor: string;
  count: number;
  totalRevenue: number;
}

const REASON_LABELS: Record<string, string> = {
  'competitor': 'Lost to Competitor',
  'no-decision': 'No Decision Made',
  'budget': 'Budget / Price',
  'timing': 'Timing / Not Now',
  'champion-left': 'Champion Left',
  'internal-solution': 'Built Internally',
  'other': 'Other',
};

function getClosedLostSessions(repId?: string): DiscoverySession[] {
  const all = getAllDiscoverySessions();
  return all.filter(s => {
    if (s.deal_stage !== 'closed_lost') return false;
    // Only count deals that have been through the Sales Redemption autopsy process
    if (!s.post_mortem_completed) return false;
    if (repId && s.rep_id !== repId) return false;
    return true;
  });
}

/** Build aggregated fatality tally — counts and revenue by loss reason */
export function buildFatalityTally(repId?: string): FatalityCount[] {
  const sessions = getClosedLostSessions(repId);
  const counts: Record<string, { count: number; revenue: number }> = {};
  
  for (const s of sessions) {
    const reason = s.post_mortem_fatality ?? 'Unknown Fatality';
    if (!counts[reason]) counts[reason] = { count: 0, revenue: 0 };
    counts[reason].count += 1;
    counts[reason].revenue += s.deal_value ?? 0;
  }
  
  const total = sessions.length || 1;
  
  return Object.entries(counts)
    .map(([reason, data]) => ({
      reason,
      label: reason, // Use the raw fatality string from the autopsy
      count: data.count,
      pct: data.count / total,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.count - a.count);
}

/** Build monthly trend of loss reasons */
export function buildFatalityTrend(repId?: string): FatalityTrend[] {
  const sessions = getClosedLostSessions(repId);
  const monthMap: Record<string, Record<string, number>> = {};
  
  for (const s of sessions) {
    const month = s.created_at.substring(0, 7); // 'YYYY-MM'
    if (!monthMap[month]) monthMap[month] = {};
    const reason = s.post_mortem_fatality ?? 'Unknown Fatality';
    monthMap[month][reason] = (monthMap[month][reason] ?? 0) + 1;
  }
  
  return Object.entries(monthMap)
    .map(([month, counts]) => ({ month, counts }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/** Get top competitor losses */
export function getTopCompetitorLosses(repId?: string): CompetitorLoss[] {
  const sessions = getClosedLostSessions(repId);
  const comps: Record<string, { count: number; totalRevenue: number }> = {};
  
  for (const s of sessions) {
    const comp = s.loss_reason?.competitor_won;
    if (!comp) continue;
    if (!comps[comp]) comps[comp] = { count: 0, totalRevenue: 0 };
    comps[comp].count += 1;
    comps[comp].totalRevenue += s.deal_value ?? 0;
  }
  
  return Object.entries(comps)
    .map(([competitor, data]) => ({ competitor, ...data }))
    .sort((a, b) => b.count - a.count);
}

/** Get all closed-lost sessions with their loss details for the log table */
export function getClosedLostLog(repId?: string): {
  company: string;
  reason: string;
  reasonLabel: string;
  competitor?: string;
  notes: string;
  revenue: number;
  date: string;
  stage: string;
}[] {
  const sessions = getClosedLostSessions(repId);
  
  return sessions.map(s => ({
    company: s.company_name,
    reason: s.post_mortem_fatality ?? 'Unknown',
    reasonLabel: s.post_mortem_fatality ?? 'Unknown',
    competitor: s.loss_reason?.competitor_won,
    notes: s.post_mortem_pathway ?? s.loss_reason?.notes ?? '',
    revenue: s.deal_value ?? 0,
    date: s.created_at.substring(0, 10),
    stage: s.deal_stage,
  })).sort((a, b) => b.date.localeCompare(a.date));
}
