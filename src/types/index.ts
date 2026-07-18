// ============================================================
// Service Alignment GTM Workspace — Core Types
// ============================================================

export type UserRole = 'manager' | 'rep' | 'admin' | 'exec' | 'super_admin';

export interface Profile {
  id: string; // auth.users id
  email: string;
  full_name: string;
  initials: string;
  role: UserRole;
  avatar_color: string;
  workspace_id?: string; // Optional for super_admin, required for others
  created_at: string;
}

// Pipeline metric keys (ordered as funnel stages)
export const ACTIVITY_METRICS = ['dials', 'connects', 'conversations', 'email_conversations', 'linkedin_conversations', 'emails_sent', 'linkedin_touches'] as const;
export const PIPELINE_METRICS = ['discovery_set', 'discovery_held', 'disqualified', 'demo_held', 'proposal_sent', 'closed_won', 'closed_lost', 'revenue'] as const;
export const ALL_METRICS = [...ACTIVITY_METRICS, ...PIPELINE_METRICS] as const;

// Metrics that reps manually enter each week
export const MANUAL_ENTRY_METRICS = ['dials', 'connects', 'conversations', 'email_conversations', 'linkedin_conversations', 'discovery_set', 'discovery_held', 'disqualified', 'demo_held', 'proposal_sent', 'closed_won', 'closed_lost', 'revenue'] as const;
export type ManualEntryMetric = typeof MANUAL_ENTRY_METRICS[number];

export type MetricKey = typeof ALL_METRICS[number];

// Labels for display
export const METRIC_LABELS: Record<MetricKey, string> = {
  dials: 'Dials',
  connects: 'Connects',
  conversations: 'Phone Conversations',
  email_conversations: 'Email Conversations',
  linkedin_conversations: 'LinkedIn Conversations',
  emails_sent: 'Emails Sent',
  linkedin_touches: 'LinkedIn Touches',
  discovery_set: 'Discovery Set',
  discovery_held: 'Discovery Held',
  disqualified: 'Disqualified',
  demo_held: 'Demo Held',
  proposal_sent: 'Proposal Sent',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
  revenue: 'Revenue',
};

// Icons (lucide names) for each metric
export const METRIC_ICONS: Record<MetricKey, string> = {
  dials: 'Phone',
  connects: 'PhoneCall',
  conversations: 'MessageSquare',
  email_conversations: 'Mail',
  linkedin_conversations: 'Linkedin',
  emails_sent: 'Mail',
  linkedin_touches: 'Linkedin',
  discovery_set: 'CalendarPlus',
  discovery_held: 'Calendar',
  disqualified: 'XCircle',
  demo_held: 'Presentation',
  proposal_sent: 'FileText',
  closed_won: 'Trophy',
  closed_lost: 'ThumbsDown',
  revenue: 'DollarSign',
};

// A row of metric values
export interface MetricRow {
  dials: number;
  connects: number;
  conversations: number;           // Phone conversations (≥2min)
  email_conversations: number;     // Qualified email replies
  linkedin_conversations: number;  // Qualified LinkedIn DM exchanges (2+ msgs)
  emails_sent: number;
  linkedin_touches: number;
  discovery_set: number;
  discovery_held: number;
  disqualified: number;          // DQ'd at/after discovery
  demo_held: number;
  proposal_sent: number;
  closed_won: number;
  closed_lost: number;           // Lost at/after proposal
  revenue: number;
}

/** Total conversations across all channels */
export function getTotalConversations(row: MetricRow): number {
  return (row.conversations || 0) + (row.email_conversations || 0) + (row.linkedin_conversations || 0);
}

/** Get a metric value from a MetricRow by key */
export function getMetricValue(row: MetricRow, key: MetricKey | 'total_conversations'): number {
  if (key === 'total_conversations') return getTotalConversations(row as MetricRow);
  return (row as any)[key] ?? 0;
}

export const EMPTY_METRIC_ROW: MetricRow = {
  dials: 0, connects: 0, conversations: 0,
  email_conversations: 0, linkedin_conversations: 0,
  emails_sent: 0, linkedin_touches: 0,
  discovery_set: 0, discovery_held: 0, disqualified: 0, demo_held: 0, proposal_sent: 0,
  closed_won: 0, closed_lost: 0, revenue: 0,
};

// Monthly goals (set by manager)
export interface MonthlyGoal extends MetricRow {
  id: string;
  rep_id: string;
  month: string; // ISO date, first of month
  created_by: string;
  updated_at: string;
}

// Weekly actuals (entered by reps)
export interface WeeklyActual extends MetricRow {
  id: string;
  rep_id: string;
  week_start: string; // ISO date, Monday
  notes: string | null;
  submitted_at: string | null;
  updated_at: string;
}

// Historical monthly data (imported from CSVs)
export interface HistoricalMonthly extends MetricRow {
  id: string;
  rep_id: string;
  month: string;
  source: 'import' | 'calculated';
  linkedin_touches: number;
  // IB/OB split
  ib_opps: number;
  ib_won: number;
  ib_revenue: number;
  ob_opps: number;
  ob_won: number;
  ob_revenue: number;
}

// Coaching notes
export interface CoachingNote {
  id: string;
  rep_id: string;
  manager_id: string;
  week_start: string | null;
  note: string;
  action_items: string[];
  created_at: string;
}

// Computed driver rates
export interface DriverRates {
  connect_rate: number;       // connects / dials
  conversation_rate: number;  // conversations / connects
  set_rate: number;           // discovery_set / conversations
  show_rate: number;          // discovery_held / discovery_set
  demo_rate: number;          // demo_held / discovery_held
  proposal_rate: number;      // proposal_sent / demo_held
  close_rate: number;         // closed_won / demo_held (using opps as proxy)
  avg_revenue: number;        // revenue / closed_won
}

// Pace status for a metric
export type PaceStatus = 'ahead' | 'on_track' | 'behind' | 'at_risk';

export interface MetricPace {
  metric: MetricKey;
  goal: number;
  actual: number;
  pct_complete: number;
  pct_through_month: number;
  pace: PaceStatus;
}

// Rep summary for manager view
export interface RepSummary {
  profile: Profile;
  revenue_goal: number;
  revenue_actual: number;
  revenue_pct: number;
  pace: PaceStatus;
  weekly_streak: number;
}

// ============================================================
// Funnel Command Center Types
// ============================================================

// 90-day improvement cycle plan
export interface CyclePlan {
  id: string;
  rep_id: string;
  start_month: string;          // '2026-06-01' (first of 3 months)
  baseline_months: string[];    // 6 month keys used as baseline
  baseline_averages: MetricRow;
  baseline_rates: DriverRates;
  months: [string, string, string]; // the 3 monthly goal keys
  created_at: string;
  status: 'active' | 'completed';
  focus_area?: string;          // which conversion rate they're focused on improving
}

// Funnel conversion pair for analysis
export interface FunnelConversionPair {
  from: MetricKey;
  to: MetricKey;
  label: string;               // 'Dials → Connects'
  benchmark: number;           // team/industry benchmark rate
}

// Predefined conversion pairs representing the sales funnel chain
export const FUNNEL_CONVERSION_PAIRS: FunnelConversionPair[] = [
  { from: 'dials', to: 'connects', label: 'Dials → Connects', benchmark: 0.07 },
  { from: 'connects', to: 'conversations', label: 'Connects → Conversations', benchmark: 0.55 },
  { from: 'conversations', to: 'discovery_set', label: 'Conversations → Meetings Booked', benchmark: 0.15 },
  { from: 'discovery_set', to: 'discovery_held', label: 'Booked → Discovery Held', benchmark: 0.70 },
  { from: 'discovery_held', to: 'demo_held', label: 'Discovery → Demo', benchmark: 0.65 },
  { from: 'demo_held', to: 'proposal_sent', label: 'Demo → Proposal', benchmark: 0.50 },
  { from: 'demo_held', to: 'closed_won', label: 'Demo → Won', benchmark: 0.25 },
];

// ============================================================
// SSP Cascade Chain — matches Sales Autonomy spreadsheet
// ============================================================
// The cascade: Conversations (driver) → rates → all downstream goals
// Rep sets: conversations + 5 rate targets per month
// System computes: everything else

export interface CascadeStep {
  from: MetricKey;
  to: MetricKey;
  rateLabel: string;        // "Scheduled Rate", "Show Rate", etc.
  rateKey: string;           // unique key for storing the rate target
  roundDown?: boolean;       // ROUNDDOWN for integer metrics
}

/** The linear cascade chain matching the SSP spreadsheet */
export const CASCADE_CHAIN: CascadeStep[] = [
  { from: 'conversations', to: 'discovery_set',  rateLabel: 'Scheduled Rate',      rateKey: 'scheduled_rate' },
  { from: 'discovery_set', to: 'discovery_held',  rateLabel: 'Show Rate',            rateKey: 'show_rate' },
  { from: 'discovery_held', to: 'demo_held',      rateLabel: 'Proposal Rate',        rateKey: 'proposal_rate' },
  { from: 'demo_held',      to: 'closed_won',     rateLabel: 'Close Rate',           rateKey: 'close_rate', roundDown: true },
];

/** Rate targets for a single month — simplified cascade */
export interface CascadeRateTargets {
  // Conversation inputs (the driver)
  conversations: number;           // Phone conversations target
  email_conversations: number;     // Email conversations target
  linkedin_conversations: number;  // LinkedIn conversations target

  // Funnel rates (5 drivers matching SSP template)
  scheduled_rate: number;    // Total conversations → discovery_set ("Scheduled Rate")
  show_rate: number;         // discovery_set → discovery_held ("Attended Rate - Discovery")
  proposal_rate: number;     // discovery_held → demo_held ("Attended Rate - Proposal")
  close_rate: number;        // demo_held → closed_won ("Close Rate")
  avg_revenue: number;       // revenue per closed_won ("Average Revenue Per Sale")
}

/** Compute cascaded goals from simplified rate targets */
export function computeCascade(inputs: CascadeRateTargets): MetricRow {
  const row: MetricRow = { ...EMPTY_METRIC_ROW };

  // Conversation inputs
  row.conversations = Math.round(inputs.conversations);
  row.email_conversations = Math.round(inputs.email_conversations || 0);
  row.linkedin_conversations = Math.round(inputs.linkedin_conversations || 0);

  // Total conversations → single scheduled rate → discovery_set
  const totalConvos = row.conversations + row.email_conversations + row.linkedin_conversations;
  row.discovery_set = Math.round(totalConvos * (inputs.scheduled_rate || 0));

  // Downstream cascade (channel-agnostic)
  row.discovery_held = Math.round(row.discovery_set * inputs.show_rate);
  row.demo_held = Math.round(row.discovery_held * inputs.proposal_rate);
  row.closed_won = Math.floor(row.demo_held * inputs.close_rate); // ROUNDDOWN per SSP
  row.revenue = row.closed_won * inputs.avg_revenue;
  row.proposal_sent = row.demo_held;
  return row;
}

/** Extract cascade rate targets from a baseline MetricRow (the 6-month averages) */
export function extractBaselineRates(baseline: MetricRow): CascadeRateTargets {
  const safeDiv = (a: number, b: number) => b > 0 ? a / b : 0;
  const totalConvo = getTotalConversations(baseline);

  return {
    conversations: baseline.conversations,
    email_conversations: baseline.email_conversations || 0,
    linkedin_conversations: baseline.linkedin_conversations || 0,

    scheduled_rate: safeDiv(baseline.discovery_set, totalConvo || baseline.conversations),
    show_rate: safeDiv(baseline.discovery_held, baseline.discovery_set),
    proposal_rate: safeDiv(baseline.demo_held, baseline.discovery_held),
    close_rate: safeDiv(baseline.closed_won, baseline.demo_held),
    avg_revenue: safeDiv(baseline.revenue, baseline.closed_won),
  };
}

