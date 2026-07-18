import { describe, it, expect } from 'vitest';
import { fmtCurrency, fmtNum, fmtPct } from '../format';

describe('fmtCurrency', () => {
  it('formats a typical value', () => {
    expect(fmtCurrency(12500)).toBe('$12,500');
  });

  it('formats zero', () => {
    expect(fmtCurrency(0)).toBe('$0');
  });

  it('formats large numbers', () => {
    expect(fmtCurrency(1234567)).toBe('$1,234,567');
  });

  it('rounds fractional cents', () => {
    expect(fmtCurrency(99.99)).toBe('$100');
  });

  it('formats negative values', () => {
    expect(fmtCurrency(-500)).toBe('-$500');
  });
});

describe('fmtNum', () => {
  it('formats with commas', () => {
    expect(fmtNum(1234)).toBe('1,234');
  });

  it('formats zero', () => {
    expect(fmtNum(0)).toBe('0');
  });

  it('formats large numbers', () => {
    expect(fmtNum(1000000)).toBe('1,000,000');
  });

  it('handles small numbers without commas', () => {
    expect(fmtNum(42)).toBe('42');
  });
});

describe('fmtPct', () => {
  it('formats a decimal as a rounded percentage', () => {
    // 0.235 * 100 = 23.5, rounds to 24
    expect(fmtPct(0.235)).toBe('24%');
  });

  it('formats exact values', () => {
    expect(fmtPct(0.5)).toBe('50%');
  });

  it('formats 100%', () => {
    expect(fmtPct(1)).toBe('100%');
  });

  it('formats zero', () => {
    expect(fmtPct(0)).toBe('0%');
  });

  it('handles values above 100%', () => {
    expect(fmtPct(1.5)).toBe('150%');
  });
});
