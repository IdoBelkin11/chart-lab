// ---------------------------------------------------------------------------
// The Risk track's scenarios — the one source of every number the lessons show
// (the Risk counterpart of fundamentals/companies.ts). All illustrative: a
// fictional account, fictional trades, and simulated returns, never market data.
//
// From the Artifact (page 10): the ₪50,000 account with a 1% risk and a stop
// at 95 (board 10.1); the trade at 104 with a stop at 101 and a target at
// 111.50 (10.2); the four assets, three profiles and the good / bad year of
// the portfolio project (10.4); the two stocks of the bias scenario (10.5).
// Correlations are computed from simulated daily returns, not typed in.
// ---------------------------------------------------------------------------
import { mulberry32 } from '@core/charts/series.js';
import type { Localized } from '@core/types/kb';

const L = (he: string, en: string): Localized => ({ he, en });

/** R4: the Artifact's account and trade, and the stops it compares. */
export const ACCOUNT = 50000;
export const R4_TRADE = { entry: 100, stop: 95, riskPct: 1 };
export const R4_STOPS = [98, 95, 90];
/** R4's Try: a different account, risk and trade. */
export const R4_TRY = { account: 80000, riskPct: 1.5, entry: 42, stop: 39.6 };

/** R5: the Artifact's trade. */
export const R5_TRADE = { entry: 104, stop: 101, target: 111.5 };
/** R5's Apply: a close target and a far stop. */
export const R5_POOR = { entry: 60, stop: 55, target: 63 };

/** R3: regular investing through a fall and a recovery — a fixed amount each month. */
export const DCA = { monthly: 1000, prices: [50, 40, 25, 50] };
/** R3: the compounding examples. */
export const COMPOUND = { amount: 10000, ratePct: 7, years: 20 };
export const EARLY_LATE = { early: { age: 25, monthly: 500 }, late: { age: 35, monthly: 1000 }, until: 65, ratePct: 6 };

/** R8 (Artifact 10.4): four assets, their returns in a good and a very bad year, and three profiles. */
export const ASSETS = [
  { id: 'st', name: L('מניות (מדד רחב)', 'Stocks (broad index)'), good: 22, bad: -38, tone: 'info' as const },
  { id: 'bd', name: L('אג״ח ממשלתי', 'Government bonds'), good: 3, bad: 4, tone: 'adv' as const },
  { id: 'gd', name: L('זהב', 'Gold'), good: -2, bad: 8, tone: 'learn' as const },
  { id: 'cs', name: L('מזומן / פיקדון', 'Cash / deposit'), good: 2, bad: 2, tone: 'muted' as const }
];
export const PROFILES = [
  { id: 'c', name: L('זהיר', 'Cautious'), weights: [30, 50, 10, 10] },
  { id: 'm', name: L('מאוזן', 'Balanced'), weights: [60, 30, 5, 5] },
  { id: 'a', name: L('אגרסיבי', 'Aggressive'), weights: [90, 5, 0, 5] }
];
/** A profile's return in a year, %: each asset's return times its weight. */
export const profileReturn = (weights: number[], year: 'good' | 'bad') => weights.reduce((s, w, i) => s + (w * ASSETS[i]![year]) / 100, 0);
export const PORTFOLIO_START = 100000;
/** R8: the learner's maximum acceptable loss in one year, %. */
export const MAX_LOSS = 15;

/** R6 (Artifact 10.5): two holdings, what each is worth now, and the change since buying. */
export const BIAS = {
  need: 10000,
  a: { name: L('מניה א׳', 'Stock A'), value: 12400, change: 24, news: L('הצמיחה בהכנסות עוד נמשכת. התחזית לשנה הבאה עלתה.', 'Revenue growth is still going. Next year\'s guidance was raised.') },
  b: { name: L('מניה ב׳', 'Stock B'), value: 7100, change: -29, news: L('החברה איבדה את הלקוח הגדול שלה. התחזית ירדה פעמיים.', 'The company lost its biggest customer. Guidance was cut twice.') }
};

/** Recovery arithmetic: the gain needed to get back after a fall of `dropPct`. */
export const recoveryPct = (dropPct: number) => (1 / (1 - dropPct / 100) - 1) * 100;

// ---------- R2: simulated daily returns and their correlations ----------
/** A roughly normal draw from the seeded generator (sum of uniforms). */
function gauss(rng: () => number) { let s = 0; for (let i = 0; i < 6; i++) s += rng(); return s - 3; }
const DAYS = 250;
function simulate(seed: number) {
  const rng = mulberry32(seed);
  const out = { bankA: [] as number[], bankB: [] as number[], stocks: [] as number[], bonds: [] as number[], gold: [] as number[], cash: [] as number[] };
  for (let t = 0; t < DAYS; t++) {
    const m = gauss(rng) * 0.011;
    out.stocks.push(m + gauss(rng) * 0.002);
    out.bankA.push(1.1 * m + gauss(rng) * 0.004);
    out.bankB.push(1.1 * m + gauss(rng) * 0.004);
    out.bonds.push(-0.12 * m + gauss(rng) * 0.004 + 0.0001);
    out.gold.push(0.05 * m + gauss(rng) * 0.009 + 0.0002);
    out.cash.push(0.00012 + gauss(rng) * 0.00002);
  }
  return out;
}
export const RETURNS = simulate(1701);
export type AssetKey = keyof typeof RETURNS;
/** Pearson correlation of two return series. */
export function correlation(a: number[], b: number[]) {
  const n = a.length, ma = a.reduce((s, x) => s + x, 0) / n, mb = b.reduce((s, x) => s + x, 0) / n;
  let sab = 0, saa = 0, sbb = 0;
  for (let i = 0; i < n; i++) { const da = a[i]! - ma, db = b[i]! - mb; sab += da * db; saa += da * da; sbb += db * db; }
  return sab / Math.sqrt(saa * sbb);
}
/** A price path from 100, from daily returns. */
export const pricePath = (r: number[]) => r.reduce<number[]>((acc, x) => [...acc, acc[acc.length - 1]! * (1 + x)], [100]);
export const MATRIX_ASSETS: Array<{ key: AssetKey; name: Localized }> = [
  { key: 'stocks', name: L('מניות', 'Stocks') },
  { key: 'bonds', name: L('אג״ח', 'Bonds') },
  { key: 'gold', name: L('זהב', 'Gold') },
  { key: 'cash', name: L('מזומן', 'Cash') }
];

/** R1's Apply: the loss a learner can bear, a stock's worst past fall, and a smaller share of the account in it. */
export const R1_LIMIT = { maxLoss: 20, pastFall: 45, share: 40 };
/** A one-year fall a broad stock index has had more than once (R3, R7). */
export const BIG_FALL = 30;

/** R4: a stop so tight the formula asks for more than the account; an opening gap through a stop; a question's trade. */
export const R4_OVER = { account: 20000, riskPct: 2, entry: 10, stop: 9.9 };
export const GAP_PCT = 20;
export const R4_Q = { account: 30000, riskPct: 1, entry: 25, stop: 23.5 };
/** R5: a question's trade (a 1:3 ratio) and a 1:2 ratio. */
export const R5_Q = { entry: 50, stop: 48, target: 56 };
/** R6: a stock everyone is talking about, and a plan's cap; an anchored seller. */
export const R6_FOMO = { rise: 60, maxShare: 5 };
export const R6_ANCHOR = { paid: 80, now: 52 };
/** R7: the bubble stock's earnings per share, unchanged while the price ran. */
export const BUBBLE_EPS = 1;
