// ============================================================
// Data Store — localStorage-based persistence
// Wraps seed data + user-entered goals/actuals
// ============================================================
import type { MetricRow, MonthlyGoal, WeeklyActual } from '../types';
import { REP_SEED_DATA, type HistoricalMonth } from '../data/seedData';
import { REP_ID_TO_INITIALS } from '../contexts/AuthContext';

const GOALS_KEY = 'scc_monthly_goals';
const ACTUALS_KEY = 'scc_weekly_actuals';

// ---- Historical Data (read-only from seed) ----

export function getHistoricalData(repId: string): HistoricalMonth[] {
  const initials = REP_ID_TO_INITIALS[repId];
  if (!initials || !REP_SEED_DATA[initials]) return [];
  return REP_SEED_DATA[initials].history;
}

export function getAllRepsHistorical(): Record<string, HistoricalMonth[]> {
  const result: Record<string, HistoricalMonth[]> = {};
  for (const [repId, initials] of Object.entries(REP_ID_TO_INITIALS)) {
    result[repId] = REP_SEED_DATA[initials]?.history || [];
  }
  return result;
}

// ---- Monthly Goals (localStorage) ----

function loadGoals(): MonthlyGoal[] {
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Handle Zustand persist envelope: { state: { goals: Record<string, MonthlyGoal> } }
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const record = parsed.state?.goals ?? parsed.goals ?? parsed;
      if (typeof record === 'object' && !Array.isArray(record)) {
        return Object.values(record) as MonthlyGoal[];
      }
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveGoals(goals: MonthlyGoal[]) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export function getMonthlyGoal(repId: string, month: string): MonthlyGoal | null {
  const goals = loadGoals();
  return goals.find(g => g.rep_id === repId && g.month === month) || null;
}

export function getAllGoalsForMonth(month: string): MonthlyGoal[] {
  return loadGoals().filter(g => g.month === month);
}

export function setMonthlyGoal(goal: Omit<MonthlyGoal, 'id' | 'updated_at'>): MonthlyGoal {
  const goals = loadGoals();
  const existing = goals.findIndex(g => g.rep_id === goal.rep_id && g.month === goal.month);
  const saved: MonthlyGoal = {
    ...goal,
    id: existing >= 0 ? goals[existing].id : crypto.randomUUID(),
    updated_at: new Date().toISOString(),
  };
  if (existing >= 0) {
    goals[existing] = saved;
  } else {
    goals.push(saved);
  }
  saveGoals(goals);
  return saved;
}

// ---- Weekly Actuals (localStorage) ----

function loadActuals(): WeeklyActual[] {
  try {
    const raw = localStorage.getItem(ACTUALS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Handle Zustand persist envelope: { state: { actuals: Record<string, WeeklyActual> } }
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const record = parsed.state?.actuals ?? parsed.actuals ?? parsed;
      if (typeof record === 'object' && !Array.isArray(record)) {
        return Object.values(record) as WeeklyActual[];
      }
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveActuals(actuals: WeeklyActual[]) {
  localStorage.setItem(ACTUALS_KEY, JSON.stringify(actuals));
}

export function getWeeklyActual(repId: string, weekStart: string): WeeklyActual | null {
  return loadActuals().find(a => a.rep_id === repId && a.week_start === weekStart) || null;
}

export function getWeeklyActualsForMonth(repId: string, year: number, month: number): WeeklyActual[] {
  const actuals = loadActuals();
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  return actuals.filter(a => a.rep_id === repId && a.week_start.startsWith(monthStr));
}

export function getAllActualsForMonth(year: number, month: number): WeeklyActual[] {
  const actuals = loadActuals();
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  return actuals.filter(a => a.week_start.startsWith(monthStr));
}

export function saveWeeklyActual(actual: Omit<WeeklyActual, 'id' | 'updated_at'>): WeeklyActual {
  const actuals = loadActuals();
  const existing = actuals.findIndex(a => a.rep_id === actual.rep_id && a.week_start === actual.week_start);
  const saved: WeeklyActual = {
    ...actual,
    id: existing >= 0 ? actuals[existing].id : crypto.randomUUID(),
    updated_at: new Date().toISOString(),
  };
  if (existing >= 0) {
    actuals[existing] = saved;
  } else {
    actuals.push(saved);
  }
  saveActuals(actuals);
  return saved;
}

// ---- Editable Historical Data (seed + localStorage overrides) ----

const HISTORICAL_OVERRIDES_KEY = 'scc_historical_overrides';

/** Build a zero-value HistoricalMonth for a given 'YYYY-MM-01' string */
function emptyHistoricalMonth(monthStr: string): HistoricalMonth {
  return {
    month: monthStr,
    dials: 0, connects: 0, conversations: 0, email_conversations: 0, linkedin_conversations: 0, emails_sent: 0,
    linkedin_touches: 0,
    discovery_set: 0, discovery_held: 0, demo_held: 0,
    proposal_sent: 0, closed_won: 0, revenue: 0,
    ib_opps: 0, ib_won: 0, ib_revenue: 0,
    ob_opps: 0, ob_won: 0, ob_revenue: 0,
  };
}

/** Generate the last-12-month 'YYYY-MM-01' strings ending with current month */
function last12MonthKeys(): string[] {
  const keys: string[] = [];
  const now = new Date();
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
  const nextQuarterFirstMonth = currentQuarter * 3;
  const goalYear = nextQuarterFirstMonth >= 12 ? now.getFullYear() + 1 : now.getFullYear();
  const firstGoalMonth = nextQuarterFirstMonth % 12;

  for (let i = 12; i >= 1; i--) {
    const d = new Date(goalYear, firstGoalMonth - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    keys.push(`${y}-${m}-01`);
  }
  return keys;
}

function loadOverrides(): Record<string, HistoricalMonth[]> {
  try {
    const raw = localStorage.getItem(HISTORICAL_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function persistOverrides(overrides: Record<string, HistoricalMonth[]>) {
  localStorage.setItem(HISTORICAL_OVERRIDES_KEY, JSON.stringify(overrides));
}

/**
 * Returns merged data: seed data + any user overrides, sorted by month asc.
 * Always returns exactly 12 months (backfills with zero rows if seed has fewer).
 */
export function getHistoricalDataEditable(repId: string): HistoricalMonth[] {
  const seedMonths = getHistoricalData(repId);
  const overrides = loadOverrides();
  const repOverrides: HistoricalMonth[] = overrides[repId] || [];

  // Build a map of month → data, seeded first
  const monthMap = new Map<string, HistoricalMonth>();
  for (const m of seedMonths) {
    monthMap.set(m.month, { ...m });
  }
  // Apply overrides (override wins)
  for (const m of repOverrides) {
    monthMap.set(m.month, { ...m });
  }

  // Ensure all last-12 month keys exist
  const keys = last12MonthKeys();
  for (const key of keys) {
    if (!monthMap.has(key)) {
      monthMap.set(key, emptyHistoricalMonth(key));
    }
  }

  // Return only the 12 target months, sorted oldest-first
  return keys.map(k => monthMap.get(k)!);
}

/** Save a single month override for a rep */
export function saveHistoricalMonth(repId: string, month: HistoricalMonth): void {
  const overrides = loadOverrides();
  const repOverrides: HistoricalMonth[] = overrides[repId] || [];
  const idx = repOverrides.findIndex(m => m.month === month.month);
  if (idx >= 0) {
    repOverrides[idx] = month;
  } else {
    repOverrides.push(month);
  }
  overrides[repId] = repOverrides;
  persistOverrides(overrides);
}

/** Reset a rep's overrides back to seed data */
export function resetHistoricalData(repId: string): void {
  const overrides = loadOverrides();
  delete overrides[repId];
  persistOverrides(overrides);
}



// ---- Aggregation helpers ----

export function sumWeeklyActuals(actuals: WeeklyActual[]): MetricRow {
  const result: MetricRow = {
    dials: 0, connects: 0, conversations: 0, email_conversations: 0, linkedin_conversations: 0, emails_sent: 0,
    linkedin_touches: 0,
    discovery_set: 0, discovery_held: 0, disqualified: 0, demo_held: 0, proposal_sent: 0,
    closed_won: 0, closed_lost: 0, revenue: 0,
  };
  for (const a of actuals) {
    result.dials += a.dials;
    result.connects += a.connects;
    result.conversations += a.conversations;
    result.emails_sent += a.emails_sent;
    result.email_conversations += a.email_conversations ?? 0;
    result.linkedin_conversations += a.linkedin_conversations ?? 0;
    result.linkedin_touches += a.linkedin_touches ?? 0;
    result.discovery_set += a.discovery_set;
    result.discovery_held += a.discovery_held;
    result.disqualified += a.disqualified ?? 0;
    result.demo_held += a.demo_held;
    result.proposal_sent += a.proposal_sent;
    result.closed_won += a.closed_won;
    result.closed_lost += a.closed_lost ?? 0;
    result.revenue += a.revenue;
  }
  return result;
}
