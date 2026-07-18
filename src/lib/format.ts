// ============================================================
// Formatting Helpers
// ============================================================

/** Format a number as currency string ($X,XXX) */
export function fmtCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format a number with commas */
export function fmtNum(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/** Format a number as percentage string (0.235 → '24%') */
export function fmtPct(value: number): string {
  return `${Math.round(value * 100)}%`;
}
