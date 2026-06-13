import { describe, it, expect } from 'vitest';
import {
  calculateAverageCost,
  calculateUnrealizedPL,
  calculateMarketValue,
  calculateAllocationPercent,
} from '@/lib/trading/calculations';

describe('calculateAverageCost', () => {
  it('returns purchase price for first buy', () => {
    expect(calculateAverageCost(0, 0, 10, 100)).toBe(100);
  });

  it('computes weighted average on additional buy at higher price', () => {
    // 10 shares @ $100 + 5 shares @ $130 = 1650 / 15 = $110
    expect(calculateAverageCost(10, 100, 5, 130)).toBe(110);
  });

  it('computes weighted average on additional buy at lower price', () => {
    // 10 shares @ $100 + 10 shares @ $80 = 1800 / 20 = $90
    expect(calculateAverageCost(10, 100, 10, 80)).toBe(90);
  });

  it('returns same price when buying at the same price', () => {
    expect(calculateAverageCost(10, 100, 5, 100)).toBe(100);
  });
});

describe('calculateUnrealizedPL', () => {
  it('returns positive P/L when current price > avg cost', () => {
    const result = calculateUnrealizedPL(10, 100, 120);
    expect(result.amount).toBe(200);
    expect(result.percent).toBeCloseTo(20);
  });

  it('returns negative P/L when current price < avg cost', () => {
    const result = calculateUnrealizedPL(10, 100, 80);
    expect(result.amount).toBe(-200);
    expect(result.percent).toBeCloseTo(-20);
  });

  it('returns zero P/L when at break-even', () => {
    const result = calculateUnrealizedPL(10, 100, 100);
    expect(result.amount).toBe(0);
    expect(result.percent).toBe(0);
  });

  it('returns zero percent when averageCost is zero (no division by zero)', () => {
    const result = calculateUnrealizedPL(10, 0, 50);
    expect(result.percent).toBe(0);
    expect(result.amount).toBe(500);
  });
});

describe('calculateMarketValue', () => {
  it('multiplies quantity by current price', () => {
    expect(calculateMarketValue(10, 150)).toBe(1500);
  });

  it('returns zero for zero quantity', () => {
    expect(calculateMarketValue(0, 150)).toBe(0);
  });
});

describe('calculateAllocationPercent', () => {
  it('returns correct percentage of portfolio', () => {
    expect(calculateAllocationPercent(2500, 10000)).toBe(25);
  });

  it('returns zero when total portfolio value is zero (no division by zero)', () => {
    expect(calculateAllocationPercent(1000, 0)).toBe(0);
  });

  it('returns 100 when holding equals total portfolio value', () => {
    expect(calculateAllocationPercent(5000, 5000)).toBe(100);
  });
});
