// ---------------------------------------------------------------------------
// Every number in the Macro lessons (M1–M7), in one place. All of it is
// illustrative — a teaching economy, not a live one — except HISTORY_2022,
// which is a handful of rounded, well-documented facts about 2022 and is
// labelled as history wherever it is shown. The lessons compute everything
// else from these values with the helpers below, so the prose, the figures
// and the answers cannot drift apart (tests/ui/macroTrack.test.tsx checks the
// claims the prose makes).
// ---------------------------------------------------------------------------

/** Present value of a stream of yearly amounts (year 1 first) at a yearly rate, %. */
export const pv = (flows: number[], ratePct: number) => flows.reduce((s, f, i) => s + f / (1 + ratePct / 100) ** (i + 1), 0);

/** A bond's cash flows: a yearly coupon, and the face value back with the last one. */
export const bondFlows = (face: number, couponPct: number, years: number) =>
  Array.from({ length: years }, (_, i) => (face * couponPct) / 100 + (i === years - 1 ? face : 0));

/** What a bond is worth when the market asks `yieldPct` a year. */
export const bondPrice = (face: number, couponPct: number, years: number, yieldPct: number) => pv(bondFlows(face, couponPct, years), yieldPct);

/** Duration, measured: the % a price moves for a 1-point move in yields (half a point each way). */
export const duration = (face: number, couponPct: number, years: number, yieldPct: number) =>
  ((bondPrice(face, couponPct, years, yieldPct - 0.5) - bondPrice(face, couponPct, years, yieldPct + 0.5)) / bondPrice(face, couponPct, years, yieldPct)) * 100;

/** Yield to maturity: the one yearly rate at which the bond's flows are worth its price (bisection). */
export function ytm(price: number, face: number, couponPct: number, years: number): number {
  let lo = -50, hi = 100;
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    if (bondPrice(face, couponPct, years, mid) > price) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/** A loan's fixed monthly payment (an ordinary mortgage). */
export const monthlyPayment = (principal: number, ratePct: number, years: number) => {
  const r = ratePct / 1200, n = years * 12;
  return r === 0 ? principal / n : (principal * r) / (1 - (1 + r) ** -n);
};

/** What `amount` buys after `years` of `inflationPct` a year, in today's money. */
export const realValue = (amount: number, inflationPct: number, years: number) => amount / (1 + inflationPct / 100) ** years;

// ---------- M1 · rates: the price of money ----------
/** The three rate levels the learner moves between (Try), %. */
export const RATE_LEVELS = [1, 3, 5] as const;
export const SAVINGS = 100_000;
export const MORTGAGE = { principal: 1_000_000, years: 25 };
/** A bond issued when rates were 3%: pays 3% for 10 years. */
export const M1_BOND = { face: 1000, coupon: 3, years: 10 };
/** Two companies valued as the profits they will send back. The steady one pays
 *  100 a year for 10 years; the growth one nothing for 10 years, then 300 a year. */
export const STEADY = Array.from({ length: 10 }, () => 100);
export const GROWTH = Array.from({ length: 20 }, (_, i) => (i < 10 ? 0 : 300));
/** Apply: a short and a long bond, both 3%, when rates go from 3% to 5%. */
export const M1_SHORT_LONG = { coupon: 3, from: 3, to: 5, short: 2, long: 20 };

// ---------- M2 · inflation, GDP and unemployment ----------
export const TARGET = 2;
export const BASKET = 100;
export const M2_INFLATION = [TARGET, 8] as const;
export const M2_YEARS = 10;
/** Rounded, well-documented facts about 2022 in the US — history, not a forecast. */
export const HISTORY_2022 = { cpiPeak: 9.1, cpiPeakMonth: { he: 'יוני 2022', en: 'June 2022' }, rateFrom: '0–0.25', rateTo: '4.25–4.50', hikes: 7, stocks: -19, bonds: -13 };
/** The Try's economy: 36 months of inflation and the policy rate (%). Inflation
 *  climbs to a peak, the bank starts late and keeps raising after the peak. */
export const M2_MONTHS = 36;
const bump = (i: number) => (i <= 16 ? 1.5 + 6.5 * Math.sin((Math.PI / 2) * (i / 16)) ** 2 : 3 + 5 * Math.cos((Math.PI / 2) * Math.min(1, (i - 16) / 12)) ** 2);
export const M2_CPI = Array.from({ length: M2_MONTHS }, (_, i) => Math.round(bump(i) * 10) / 10);
export const M2_START = 9;
export const M2_RATE = Array.from({ length: M2_MONTHS }, (_, i) => (i < M2_START ? 0.25 : Math.min(5, 0.25 + 0.5 * Math.ceil((i - M2_START + 1) / 1.5))));
/** Apply and a question: a policy rate against inflation. */
export const M2_REAL = { rate: 3, inflation: 5 };
export const M2_HOT = { inflation: 6, unemployment: 3.5 };
export const M2_SLOW = { gdp: [-0.4, -0.6], unemploymentFrom: 4, unemploymentTo: 6, inflation: 2.5 };

// ---------- M3 · cycles ----------
/** 24 quarters of an illustrative economy: GDP growth (% a year) and a stock index. */
export const M3_GDP = [2.4, 2.8, 3.1, 3.0, 2.6, 2.0, 1.2, 0.4, -1.1, -2.3, -1.6, -0.4, 0.8, 1.9, 2.6, 3.0, 3.2, 3.1, 2.9, 2.7, 2.6, 2.5, 2.4, 2.4];
export const M3_INDEX = [100, 104, 108, 112, 113, 110, 104, 96, 86, 80, 84, 92, 99, 105, 110, 114, 117, 120, 122, 125, 127, 128, 131, 133];
/** Quarters of negative growth: the recession. */
export const recessionOf = (g: number[]) => { const q = g.map((x, i) => (x < 0 ? i : -1)).filter((i) => i >= 0); return { from: q[0]!, to: q[q.length - 1]! }; };

// ---------- M4 · bonds ----------
export const M4_BOND = { face: 1000, coupon: 4, years: 5 };
export const M4_PRICES = [950, 1000, 1050];
export const M4_TRY = { face: 1000, coupon: 4, years: 3, yield: 6 };
export const M4_YIELDS = [1, 2, 3, 4, 5, 6, 7, 8];
export const M4_CURVES = { short: 2, long: 10, coupon: 4 };
export const M4_CURRENT = { coupon: 50, price: 1250 };
export const M4_CREDIT = { gov: 4, corp: 7 };

// ---------- M5 · the yield curve ----------
export const MATURITIES = ['3M', '2Y', '5Y', '10Y', '30Y'];
export const CURVE_NORMAL = [2.0, 2.6, 3.1, 3.6, 4.0];
export const CURVE_INVERTED = [5.3, 4.9, 4.4, 4.2, 4.3];
/** The Try: three dates' curves. */
export const CURVES_TRY = { A: [1.0, 1.6, 2.4, 3.1, 3.5], B: [4.2, 4.3, 4.3, 4.35, 4.4], C: [4.9, 4.6, 4.1, 3.8, 3.9] };
/** Ten years of the 10Y − 2Y spread, a point a quarter (%), and the recession after the inversion. */
export const M5_SPREAD = [1.6, 1.5, 1.3, 1.2, 1.0, 0.9, 0.7, 0.5, 0.3, 0.1, -0.2, -0.4, -0.5, -0.3, -0.1, 0.2, 0.6, 1.1, 1.6, 1.9, 2.1, 2.0, 1.8, 1.6, 1.5, 1.3, 1.1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.4, 0.3, 0.3, 0.2, 0.3, 0.4, 0.5];
export const M5_RECESSION = { from: 16, to: 19 };
export const M5_APPLY = { two: 4.6, ten: 4.1 };

// ---------- M6 · the dollar, gold and commodities ----------
/** A US stock's return in dollars, and the dollar's move against the shekel, %. */
export const FX_CASE = { stock: 10, dollar: -5 };
export const FX_TRY = { stock: 8, dollar: -10 };
export const FX_Q = { stock: -4, dollar: 6 };
/** Return in shekels of a dollar asset: both moves compound. */
export const inShekels = (stockPct: number, dollarPct: number) => ((1 + stockPct / 100) * (1 + dollarPct / 100) - 1) * 100;
/** Gold pays nothing; a deposit pays the real rate. The cost of holding gold, per 100,000. */
export const GOLD_COST = { amount: 100_000, rates: [-1, 1, 3] };

// ---------- M7 · institutions, market makers, "priced in" ----------
/** The market maker's quotes (price, quantity), best first. */
export const M7_BOOK = { asks: [[50.04, 800], [50.06, 1500], [50.1, 3000]] as Array<[number, number]>, bids: [[49.98, 1000], [49.95, 2000], [49.9, 2500]] as Array<[number, number]> };
/** A dual-listed stock: in New York in dollars, in Tel Aviv in shekels. */
export const ARB = { usd: 50, rate: 3.6, tase: 183 };
export const ARB_Q = { usd: 40, rate: 3.5, tase: 136 };
