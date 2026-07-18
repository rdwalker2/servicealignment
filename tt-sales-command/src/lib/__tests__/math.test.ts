import { describe, it, expect } from 'vitest';
import { safeDiv, computeDriverRates, avgMetricRows, sumMetricRows } from '../math';
import type { MetricRow } from '../../types';

describe('safeDiv', () => {
  it('divides normally', () => {
    expect(safeDiv(10, 5)).toBe(2);
  });

  it('returns 0 when denominator is 0', () => {
    expect(safeDiv(10, 0)).toBe(0);
  });

  it('returns 0 when both are 0', () => {
    expect(safeDiv(0, 0)).toBe(0);
  });

  it('handles negative numbers', () => {
    expect(safeDiv(-10, 2)).toBe(-5);
  });

  it('handles fractional results', () => {
    expect(safeDiv(1, 3)).toBeCloseTo(0.3333, 3);
  });
});

describe('computeDriverRates', () => {
  it('computes rates from a known row', () => {
    const row: MetricRow = {
      dials: 100,
      connects: 20,
      conversations: 10,
      email_conversations: 0,
      linkedin_conversations: 0,
      emails_sent: 50,
      linkedin_touches: 0,
      discovery_set: 5,
      discovery_held: 4,
      demo_held: 3,
      proposal_sent: 2,
      closed_won: 1,
      revenue: 15000,
    };

    const rates = computeDriverRates(row);

    expect(rates.connect_rate).toBeCloseTo(0.2);
    expect(rates.conversation_rate).toBeCloseTo(0.5);
    expect(rates.set_rate).toBeCloseTo(0.5);
    expect(rates.show_rate).toBeCloseTo(0.8);
    expect(rates.demo_rate).toBeCloseTo(0.75);
    expect(rates.proposal_rate).toBeCloseTo(2 / 3, 4);
    expect(rates.close_rate).toBeCloseTo(1 / 3, 4);
    expect(rates.avg_revenue).toBe(15000);
  });

  it('returns all zeros for a zero row', () => {
    const zero: MetricRow = {
      dials: 0, connects: 0, conversations: 0, email_conversations: 0, linkedin_conversations: 0, emails_sent: 0, linkedin_touches: 0,
      discovery_set: 0, discovery_held: 0, demo_held: 0, proposal_sent: 0,
      closed_won: 0, revenue: 0,
    };

    const rates = computeDriverRates(zero);

    expect(rates.connect_rate).toBe(0);
    expect(rates.conversation_rate).toBe(0);
    expect(rates.set_rate).toBe(0);
    expect(rates.show_rate).toBe(0);
    expect(rates.demo_rate).toBe(0);
    expect(rates.proposal_rate).toBe(0);
    expect(rates.close_rate).toBe(0);
    expect(rates.avg_revenue).toBe(0);
  });
});

describe('sumMetricRows', () => {
  it('sums multiple rows', () => {
    const rows: MetricRow[] = [
      { dials: 10, connects: 2, conversations: 1, email_conversations: 0, linkedin_conversations: 0, emails_sent: 5, linkedin_touches: 0, discovery_set: 1, discovery_held: 1, demo_held: 1, proposal_sent: 0, closed_won: 0, revenue: 0 },
      { dials: 20, connects: 4, conversations: 2, email_conversations: 0, linkedin_conversations: 0, emails_sent: 10, linkedin_touches: 0, discovery_set: 2, discovery_held: 1, demo_held: 0, proposal_sent: 1, closed_won: 1, revenue: 5000 },
    ];

    const result = sumMetricRows(rows);

    expect(result.dials).toBe(30);
    expect(result.connects).toBe(6);
    expect(result.conversations).toBe(3);
    expect(result.emails_sent).toBe(15);
    expect(result.revenue).toBe(5000);
  });

  it('returns zeros for empty array', () => {
    const result = sumMetricRows([]);
    expect(result.dials).toBe(0);
    expect(result.revenue).toBe(0);
  });
});

describe('avgMetricRows', () => {
  it('returns zeros for empty array', () => {
    const result = avgMetricRows([]);
    expect(result.dials).toBe(0);
    expect(result.connects).toBe(0);
    expect(result.revenue).toBe(0);
  });

  it('returns same values for a single row', () => {
    const row: MetricRow = {
      dials: 100, connects: 20, conversations: 10, email_conversations: 0, linkedin_conversations: 0, emails_sent: 50, linkedin_touches: 0,
      discovery_set: 5, discovery_held: 4, demo_held: 3, proposal_sent: 2,
      closed_won: 1, revenue: 15000,
    };

    const result = avgMetricRows([row]);

    expect(result.dials).toBe(100);
    expect(result.connects).toBe(20);
    expect(result.revenue).toBe(15000);
  });

  it('averages multiple rows with rounding', () => {
    const rows: MetricRow[] = [
      { dials: 10, connects: 3, conversations: 1, email_conversations: 0, linkedin_conversations: 0, emails_sent: 5, linkedin_touches: 0, discovery_set: 1, discovery_held: 1, demo_held: 1, proposal_sent: 0, closed_won: 0, revenue: 0 },
      { dials: 20, connects: 4, conversations: 2, email_conversations: 0, linkedin_conversations: 0, emails_sent: 10, linkedin_touches: 0, discovery_set: 2, discovery_held: 1, demo_held: 0, proposal_sent: 1, closed_won: 1, revenue: 5000 },
      { dials: 15, connects: 5, conversations: 3, email_conversations: 0, linkedin_conversations: 0, emails_sent: 8, linkedin_touches: 0, discovery_set: 1, discovery_held: 0, demo_held: 1, proposal_sent: 0, closed_won: 0, revenue: 0 },
    ];

    const result = avgMetricRows(rows);

    // (10+20+15)/3 = 15
    expect(result.dials).toBe(15);
    // (3+4+5)/3 = 4
    expect(result.connects).toBe(4);
    // (1+2+3)/3 = 2
    expect(result.conversations).toBe(2);
    // (0+5000+0)/3 = 1666.67 → rounds to 1667
    expect(result.revenue).toBe(1667);
  });
});
