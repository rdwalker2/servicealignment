import { describe, it, expect } from 'vitest';
import {
  getWeeksInMonth,
  getBusinessDaysInMonth,
  getBusinessDaysElapsed,
  getPctThroughMonth,
  pctThroughMonth,
} from '../calendar';

describe('getWeeksInMonth', () => {
  it('returns correct week starts for June 2026 (starts on Monday)', () => {
    // June 1 2026 is a Monday — all 5 Mondays belong to June
    const weeks = getWeeksInMonth(2026, 5);
    expect(weeks).toEqual([
      '2026-06-01',
      '2026-06-08',
      '2026-06-15',
      '2026-06-22',
      '2026-06-29',
    ]);
    expect(weeks).toHaveLength(5);
  });

  it('does NOT include a Monday from the previous month', () => {
    // May 2026: May 1 is a Friday. The Monday before (Apr 27) should NOT be in May.
    // First Monday in May = May 4
    const weeks = getWeeksInMonth(2026, 4);
    expect(weeks[0]).toBe('2026-05-04');
    // Every Monday in the list should be in May
    for (const w of weeks) {
      expect(new Date(w + 'T00:00:00').getMonth()).toBe(4);
    }
  });

  it('each week appears in exactly one month (no overlap)', () => {
    // Check June→July boundary
    const juneWeeks = getWeeksInMonth(2026, 5);
    const julyWeeks = getWeeksInMonth(2026, 6);
    const overlap = juneWeeks.filter(w => julyWeeks.includes(w));
    expect(overlap).toHaveLength(0);
  });

  it('returns at least 4 weeks for any month', () => {
    for (let m = 0; m < 12; m++) {
      const weeks = getWeeksInMonth(2026, m);
      expect(weeks.length).toBeGreaterThanOrEqual(4);
    }
  });
});

describe('getBusinessDaysInMonth', () => {
  it('returns ~22 for a normal month', () => {
    // June 2026 has 22 business days (Mon-Fri)
    const days = getBusinessDaysInMonth(2026, 5);
    expect(days).toBe(22);
  });

  it('returns a reasonable range for any month', () => {
    for (let m = 0; m < 12; m++) {
      const days = getBusinessDaysInMonth(2026, m);
      expect(days).toBeGreaterThanOrEqual(20);
      expect(days).toBeLessThanOrEqual(23);
    }
  });

  it('handles February correctly', () => {
    // Feb 2026 has 28 days, starts on Sunday
    const days = getBusinessDaysInMonth(2026, 1);
    expect(days).toBe(20);
  });
});

describe('getBusinessDaysElapsed', () => {
  it('returns a value between 0 and total business days', () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const elapsed = getBusinessDaysElapsed(year, month);
    const total = getBusinessDaysInMonth(year, month);
    expect(elapsed).toBeGreaterThanOrEqual(0);
    expect(elapsed).toBeLessThanOrEqual(total);
  });

  it('returns total business days for a past month', () => {
    // Jan 2025 is fully in the past
    const elapsed = getBusinessDaysElapsed(2025, 0);
    const total = getBusinessDaysInMonth(2025, 0);
    expect(elapsed).toBe(total);
  });
});

describe('getPctThroughMonth', () => {
  it('returns 0 at start of month', () => {
    const jan1 = new Date(2026, 0, 1);
    const pct = getPctThroughMonth(jan1);
    // 1/31 ≈ 0.032
    expect(pct).toBeCloseTo(1 / 31, 2);
  });

  it('returns 1 at end of month', () => {
    const jan31 = new Date(2026, 0, 31);
    const pct = getPctThroughMonth(jan31);
    expect(pct).toBe(1);
  });

  it('returns ~0.5 mid-month', () => {
    const jan15 = new Date(2026, 0, 15);
    const pct = getPctThroughMonth(jan15);
    expect(pct).toBeCloseTo(15 / 31, 2);
  });
});

describe('pctThroughMonth', () => {
  it('returns 1 for a fully past month', () => {
    // Jan 2025 is fully in the past
    const pct = pctThroughMonth(2025, 0);
    expect(pct).toBe(1);
  });

  it('returns a value between 0 and 1 for the current month', () => {
    const now = new Date();
    const pct = pctThroughMonth(now.getFullYear(), now.getMonth());
    expect(pct).toBeGreaterThanOrEqual(0);
    expect(pct).toBeLessThanOrEqual(1);
  });
});
