import { describe, it, expect } from 'vitest';
import {
  compoundMonthly, crossoverYear, dcfGrid, dcfPerShare, positionIssue, positionSize, positionWarnings, riskReward, tenTrades
} from '@core/calculators/tools';

describe('position size', () => {
  it('derives the share count from what may be lost (the design example: 100 shares)', () => {
    const r = positionSize({ account: 50000, riskPct: 1, entry: 100, stop: 95, side: 'long' })!;
    expect(r).toMatchObject({ shares: 100, cost: 10000, loss: 500, perShare: 5, distancePct: 5, portion: 0.2 });
  });
  it('a farther stop means fewer shares for the same loss', () => {
    expect(positionSize({ account: 50000, riskPct: 1, entry: 100, stop: 90, side: 'long' })!.shares).toBe(50);
  });
  it('a stop on the wrong side of the entry blocks the result; a short flips the rule', () => {
    expect(positionIssue({ account: 50000, riskPct: 1, entry: 100, stop: 104, side: 'long' })).toBe('stopSide');
    expect(positionSize({ account: 50000, riskPct: 1, entry: 100, stop: 104, side: 'short' })!.shares).toBe(125);
    expect(positionIssue({ account: 50000, riskPct: 1, entry: 100 })).toBe('missing');
  });
  it('high risk and a position bigger than the account warn, and never block', () => {
    const i = { account: 1000, riskPct: 8, entry: 100, stop: 99, side: 'long' as const };
    expect(positionWarnings(i, positionSize(i))).toEqual(['highRisk', 'overAccount']);
  });
});

describe('risk / reward', () => {
  it('matches the design: 104 / 101 / 111.5 → 1 : 2.5, break-even 29%', () => {
    const r = riskReward(104, 101, 111.5)!;
    expect(r.ratio).toBeCloseTo(2.5);
    expect(Math.round(r.breakEven * 100)).toBe(29);
    expect(tenTrades(r, 50)).toBeCloseTo(22.5);
    expect(tenTrades(r, 20)).toBeCloseTo(-9);
  });
  it('stop and target on the same side is not a trade', () => {
    expect(riskReward(100, 95, 90)).toBeNull();
  });
});

describe('compounding', () => {
  it('monthly compounding, year by year, with the crossover year', () => {
    const rows = compoundMonthly(10000, 500, 6, 20);
    expect(rows).toHaveLength(20);
    expect(rows[19]!.deposited).toBe(130000);
    // Closed form, deposits at month end: P(1+i)^n + m((1+i)^n − 1)/i, i = 0.5%, n = 240.
    const g = 1.005 ** 240;
    expect(rows[19]!.balance).toBeCloseTo(10000 * g + 500 * ((g - 1) / 0.005), 4);
    expect(crossoverYear(rows)).toBeGreaterThan(10);
    expect(compoundMonthly(1000, 0, 0, 3).map((r) => r.balance)).toEqual([1000, 1000, 1000]);
  });
});

describe('DCF', () => {
  const base = { fcf: 400, growthPct: 8, discountPct: 10, terminalPct: 2.5, netDebt: 500, shares: 200 };
  it('values the design example at about 31.9 per share', () => {
    expect(dcfPerShare(base)!).toBeCloseTo(31.9, 0);
  });
  it('refuses a discount rate at or below terminal growth', () => {
    expect(dcfPerShare({ ...base, discountPct: 2.5 })).toBeNull();
  });
  it('the sensitivity grid is centred on the chosen rates and moves the right way', () => {
    const g = dcfGrid(base);
    expect(g.values[2]![2]).toBeCloseTo(dcfPerShare(base)!);
    expect(g.values[2]![4]!).toBeGreaterThan(g.values[2]![0]!); // more growth, more value
    expect(g.values[4]![2]!).toBeLessThan(g.values[0]![2]!);    // higher discount, less value
  });
});
