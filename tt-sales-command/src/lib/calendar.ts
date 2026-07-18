// ============================================================
// Calendar / Date Helpers
// ============================================================

/** Format a local Date as 'YYYY-MM-DD' without UTC conversion */
function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Get all week-start dates (Mondays) that belong to a given month.
 * A week "belongs" to the month that contains its Monday.
 * This prevents double-counting: each week appears in exactly one month.
 */
export function getWeeksInMonth(year: number, month: number): string[] {
  const weeks: string[] = [];

  // Find the first Monday in or before this month
  const first = new Date(year, month, 1);
  const dow = first.getDay(); // 0=Sun, 1=Mon, ...

  let startDate: Date;
  if (dow === 1) {
    // Month starts on Monday — include it
    startDate = new Date(year, month, 1);
  } else {
    // Find the first Monday that falls WITHIN this month
    const daysUntilMonday = dow === 0 ? 1 : (8 - dow);
    startDate = new Date(year, month, 1 + daysUntilMonday);
  }

  // Collect all Mondays that fall within this month
  const lastDay = new Date(year, month + 1, 0); // last day of month
  const current = new Date(startDate);

  while (current <= lastDay) {
    weeks.push(localDateStr(current));
    current.setDate(current.getDate() + 7);
  }

  return weeks;
}

/** Get the Monday of the week containing `date` */
export function getCurrentWeekMonday(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return localDateStr(d);
}

/** Count business days (Mon–Fri) in a given month (0-indexed) */
export function getBusinessDaysInMonth(year: number, month: number): number {
  const lastDate = new Date(year, month + 1, 0).getDate();
  let count = 0;
  for (let d = 1; d <= lastDate; d++) {
    const dow = new Date(year, month, d).getDay();
    if (dow >= 1 && dow <= 5) count++;
  }
  return count;
}

/** Count business days elapsed so far in a given month (0-indexed), up to today */
export function getBusinessDaysElapsed(year: number, month: number): number {
  const today = new Date();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const capDay = today.getFullYear() === year && today.getMonth() === month
    ? Math.min(today.getDate(), lastDate)
    : lastDate;

  let count = 0;
  for (let d = 1; d <= capDay; d++) {
    const dow = new Date(year, month, d).getDay();
    if (dow >= 1 && dow <= 5) count++;
  }
  return count;
}

/** Fraction of the month elapsed (0–1) based on calendar days */
export function getPctThroughMonth(date: Date = new Date()): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = date.getDate();
  return Math.min(currentDay / daysInMonth, 1);
}

/** Fraction of the month elapsed (0–1) based on business days */
export function pctThroughMonth(year: number, month: number): number {
  const total = getBusinessDaysInMonth(year, month);
  if (total === 0) return 0;
  const elapsed = getBusinessDaysElapsed(year, month);
  return Math.min(elapsed / total, 1);
}
