// ---------------------------------------------------------------------------
// The maths behind the Tools pages (Artifact 13): position size, risk/reward,
// monthly compounding and a small DCF. Pure functions — every number a tool
// prints comes from here, so the page cannot disagree with its own chart.
// ---------------------------------------------------------------------------

export type Side = 'long' | 'short';

export interface PositionInput { account: number; riskPct: number; entry: number; stop: number; side: Side }
export type PositionIssue = 'missing' | 'stopSide' | 'stopEqual';
export interface PositionResult {
  shares: number;
  cost: number;
  /** What is lost if the stop is hit (positive number). */
  loss: number;
  perShare: number;
  distancePct: number;
  /** Cost as a share of the account (0–1+). */
  portion: number;
  riskAmount: number;
}

/** Validation that blocks the result; warnings are separate and never block. */
export function positionIssue(i: Partial<PositionInput>): PositionIssue | null {
  const { account, riskPct, entry, stop, side = 'long' } = i;
  if (![account, riskPct, entry, stop].every((x) => typeof x === 'number' && Number.isFinite(x) && x > 0)) return 'missing';
  if (entry === stop) return 'stopEqual';
  if (side === 'long' ? stop! > entry! : stop! < entry!) return 'stopSide';
  return null;
}
export function positionWarnings(i: PositionInput, r: PositionResult | null): Array<'highRisk' | 'overAccount'> {
  const w: Array<'highRisk' | 'overAccount'> = [];
  if (i.riskPct > 2) w.push('highRisk');
  if (r && r.cost > i.account) w.push('overAccount');
  return w;
}
export function positionSize(i: PositionInput): PositionResult | null {
  if (positionIssue(i)) return null;
  const riskAmount = i.account * (i.riskPct / 100);
  const perShare = Math.abs(i.entry - i.stop);
  const shares = Math.floor(riskAmount / perShare + 1e-9);
  const cost = shares * i.entry;
  return { shares, cost, loss: shares * perShare, perShare, distancePct: (perShare / i.entry) * 100, portion: cost / i.account, riskAmount };
}

export interface RiskRewardResult { risk: number; reward: number; ratio: number; breakEven: number }
/** Null when the stop and target are not on opposite sides of the entry. */
export function riskReward(entry: number, stop: number, target: number): RiskRewardResult | null {
  if (![entry, stop, target].every((x) => Number.isFinite(x) && x > 0)) return null;
  const long = stop < entry && target > entry, short = stop > entry && target < entry;
  if (!long && !short) return null;
  const risk = Math.abs(entry - stop), reward = Math.abs(target - entry);
  return { risk, reward, ratio: reward / risk, breakEven: risk / (risk + reward) };
}
/** Profit per share over 10 such trades at a given success rate (%). */
export const tenTrades = (r: RiskRewardResult, winPct: number) => (winPct / 10) * r.reward - ((100 - winPct) / 10) * r.risk;

export interface YearRow { year: number; balance: number; deposited: number }
/** Monthly compounding: an initial amount plus a fixed monthly deposit, year by year. */
export function compoundMonthly(initial: number, monthly: number, ratePct: number, years: number): YearRow[] {
  const rows: YearRow[] = [];
  let b = initial;
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) b = b * (1 + ratePct / 1200) + monthly;
    rows.push({ year: y, balance: b, deposited: initial + monthly * 12 * y });
  }
  return rows;
}
/** The first year in which the interest earned so far exceeds what was deposited, or null. */
export const crossoverYear = (rows: YearRow[]) => rows.find((r) => r.balance - r.deposited > r.deposited)?.year ?? null;

export interface DcfInput { fcf: number; growthPct: number; discountPct: number; terminalPct: number; netDebt: number; shares: number }
/** Value per share: 5 years of growing free cash flow, a terminal value, minus net debt. Null if discount ≤ terminal growth. */
export function dcfPerShare(i: DcfInput): number | null {
  if (!(i.shares > 0) || !(i.discountPct > i.terminalPct)) return null;
  let f = i.fcf, pv = 0, df5 = 1;
  for (let t = 1; t <= 5; t++) {
    f *= 1 + i.growthPct / 100;
    const df = 1 / (1 + i.discountPct / 100) ** t;
    pv += f * df; df5 = df;
  }
  const tv = (f * (1 + i.terminalPct / 100)) / ((i.discountPct - i.terminalPct) / 100);
  return (pv + tv * df5 - i.netDebt) / i.shares;
}
/**
 * The same model, step by step (P9 walks through it): each year's cash flow,
 * discount factor and present value, the terminal value, and what they add up to.
 */
export function dcfBreakdown(i: DcfInput) {
  const rows: Array<{ year: number; fcf: number; df: number; pv: number }> = [];
  let f = i.fcf;
  for (let t = 1; t <= 5; t++) { f *= 1 + i.growthPct / 100; const df = 1 / (1 + i.discountPct / 100) ** t; rows.push({ year: t, fcf: f, df, pv: f * df }); }
  const sumPv = rows.reduce((s, r) => s + r.pv, 0);
  const tv = (f * (1 + i.terminalPct / 100)) / ((i.discountPct - i.terminalPct) / 100);
  const pvTv = tv * rows[4]!.df, ev = sumPv + pvTv;
  return { rows, sumPv, tv, pvTv, ev, equity: ev - i.netDebt, perShare: (ev - i.netDebt) / i.shares };
}
/** The value grid around the chosen growth and discount rates (±2 points in steps of 1 and 2). */
export function dcfGrid(i: DcfInput): { growth: number[]; discount: number[]; values: Array<Array<number | null>> } {
  const growth = [-4, -2, 0, 2, 4].map((d) => i.growthPct + d);
  const discount = [-2, -1, 0, 1, 2].map((d) => i.discountPct + d);
  return { growth, discount, values: discount.map((r) => growth.map((g) => dcfPerShare({ ...i, growthPct: g, discountPct: r }))) };
}
