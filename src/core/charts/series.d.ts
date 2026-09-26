// Chart data is ported JavaScript (deterministic, seeded — see series.js for
// why). This gives lessonCharts.ts a typed surface for it, the same pattern
// already used for drawChart.js's sibling .d.ts: each series is a candle
// array plus whatever extra annotation fields its own code in series.js
// attaches to it (support/resistance zones, pattern-extreme indices, the
// computed RSI line, etc.) — TypeScript otherwise only sees the plain
// candle-array return type of genCandles and has no way to know about
// properties assigned onto it afterward in the same untyped file.

export interface Candle {
  t: Date;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export declare function mulberry32(seed: number): () => number;
export declare function genCandles(
  seed: number,
  waypoints: Array<{ f: number; p: number; t: string }>,
  n: number,
  baseVol: number
): Candle[];
export declare function findExtreme(candles: Candle[], f1: number, f2: number, type: 'low' | 'high'): number;
export declare function overrideCandle(candles: Candle[], idx: number, patch: { o: number; h: number; l: number; c: number; volMult?: number }): void;
export declare function ema(vals: number[], period: number): number[];
export declare function sma(vals: number[], period: number): Array<number | null>;
export declare function computeRSI(closes: number[], period?: number): Array<number | null>;

export declare const L1: Candle[] & { supportZone: [number, number]; resistZone: [number, number] };
/** The "area, not a line" illustration: the band price respects, and the exact
 *  line it pierces on every turn. */
export declare const L1_ZONE: Candle[] & { band: [number, number]; exactLine: number };

export declare const L2: Candle[] & { resistZone: [number, number]; breakIdx: number; retestIdx: number };
export declare const l2BreakIdx: number;
export declare const l2RetestIdx: number;
export declare const L2_REAL: Candle[] & { resistZone: [number, number] };
export declare const L2_FALSE: Candle[] & { resistZone: [number, number] };

export declare const L3: Candle[];
/** A market with no trend, where the same average crosses price endlessly. */
export declare const L3_CHOP: Candle[];

interface FibSeries {
  lowIdx: number;
  highIdx: number;
  swingLow: number;
  swingHigh: number;
  fibLevels: Array<{ ratio: number; price: number }>;
}
export declare const L5: Candle[] & FibSeries;
/** The same construction, on a pullback that goes through every level. */
export declare const L5_FAIL: Candle[] & FibSeries;

export declare const RSI_OB: Candle[] & { rsi: Array<number | null> };
export declare const RSI_OS: Candle[] & { rsi: Array<number | null> };
export declare const RSI_DIV: Candle[] & { rsi: Array<number | null>; peak1Idx: number; peak2Idx: number };

export declare const P_DBL_BOTTOM: Candle[] & { b1Idx: number; b2Idx: number; neckIdx: number };
export declare const P_DBL_TOP: Candle[] & { t1Idx: number; t2Idx: number; neckIdx: number };
export declare const P_HS: Candle[] & {
  shoulder1Idx: number;
  headIdx: number;
  shoulder2Idx: number;
  trough1Idx: number;
  trough2Idx: number;
};
export declare const P_FLAG: Candle[] & { poleStartIdx: number; poleTopIdx: number; flagEndIdx: number };
export declare const P_TRIANGLE: Candle[] & {
  touch1Idx: number;
  touch2Idx: number;
  touch3Idx: number;
  low1Idx: number;
  low2Idx: number;
  breakIdx: number;
};

export declare const C_HAMMER: Candle[] & { highlightIdx: number };
export declare const C_STAR: Candle[] & { highlightIdx: number };
export declare const C_DOJI: Candle[] & { highlightIdx: number };
export declare const C_BULLE: Candle[] & { highlightIdx: number; highlightIdx2: number };
export declare const C_BEARE: Candle[] & { highlightIdx: number; highlightIdx2: number };
export declare const C_MIX: Candle[] & { marks: { a: number; b: number; c: [number, number]; d: number } };

export declare const F3_GAPDOWN: Candle[] & { gapIdx: number; prevClose: number; gapOpen: number; gapTop: number; gapBottom: number };
export declare const F3_BEAT: Candle[] & { gapIdx: number; gapTop: number; gapBottom: number };
export declare const F4_BROAD: Candle[];
export declare const F4_CONC: number[];

// Technical Analysis T2–T5
export interface Swing { idx: number; type: 'high' | 'low'; price: number }
type Swings = { swings: Swing[] };
export declare const T2_CONTEXT: Candle[] & { hammerIdx: number; confirmIdx: number };
export declare const T2_APPLY: Candle[] & { markIdx: number };
export declare const T2_Q_STAR: Candle[] & { markIdx: number };
export declare const T2_Q_DOJI: Candle[] & { markIdx: number };
export declare const T2_Q_BEARE: Candle[] & { markIdx: number; markIdx2: number };
export declare const T3_UP: Candle[] & Swings;
export declare const T3_PULL: Candle[] & Swings;
export declare const T3_DOWN: Candle[] & Swings;
export declare const T3_SIDE: Candle[] & Swings & { ceiling: [number, number]; floor: [number, number] };
export declare const T3_BREAK: Candle[] & Swings;
export declare const T3_Q_DOWN: Candle[] & Swings;
export declare const T3_Q_SIDE: Candle[] & Swings;
export declare const T3_Q_UPRED: Candle[] & Swings;
export declare const T4_TEACH: Candle[] & Swings & { support: [number, number]; resist: [number, number] };
export declare const T4_FLIP: Candle[] & Swings & { zone: [number, number] };
export declare const T4_Q_APPROACH: Candle[] & Swings & { zone: [number, number] };
export declare const T4_Q_BAND: Candle[] & Swings & { band: [number, number] };
export declare const T4_Q_RES: Candle[] & Swings;
type Breakout = Candle[] & Swings & { resist: [number, number]; breakIdx: number };
export declare const T5_BREAK: Breakout;
export declare const T5_THIN: Breakout;
export declare const T5_POKE: Breakout;
export declare const T5_APPLY: Candle[] & Swings & { resist: [number, number]; breakIdx: number };
export declare const T5_Q_POKE: Breakout;
export declare const T5_Q_THIN: Breakout;
export declare const T5_Q_HOLD: Candle[] & Swings & { resist: [number, number]; breakIdx: number };

// Technical Analysis T1
export declare function toPeriods(candles: Candle[], k: number): Candle[];
export declare const T1_DAILY: Candle[] & { markIdx: number };
export declare const T1_YEAR_FACTS: { days: number; firstClose: number; lastClose: number };
export declare const T1_YEAR_LAST20: Candle[];
export declare const T1_YEAR_WEEKLY: Candle[];
export declare const T1_VOL: Candle[] & { upIdx: number; downIdx: number };
export declare const T1_TRY: Candle[] & { marks: { a: number; b: number; c: number; d: number } };
export declare const T1_APPLY: Candle[] & { markIdx: number };
export declare const T1_Q_WEEKLY: Candle[];
export declare const T1_Q_VOL: Candle[] & { markIdx: number };
export declare const T1_Q_SCALE: Candle[];

// Technical Analysis T6
export interface Cross { idx: number; dir: 'up' | 'down' }
export declare function crossings(a: Array<number | null>, b: Array<number | null>): Cross[];
type WithAverages = Candle[] & { ma20: Array<number | null>; ma50: Array<number | null>; crosses: Cross[] };
export declare const T6_TEACH: WithAverages;
export declare const T6_TRY: WithAverages;
export declare const T6_CHOP: WithAverages;
export declare const T6_Q_ABOVE: WithAverages;
export declare const T6_Q_DOWN: WithAverages;
export declare const T6_Q_LAG: WithAverages;

// Technical Analysis T7
export interface MACD { line: Array<number | null>; signal: Array<number | null>; hist: Array<number | null> }
type WithRSI = Candle[] & { rsi: Array<number | null> };
type WithMACD = Candle[] & { macd: MACD };
export declare function withRSI<T extends Candle[]>(c: T): T & { rsi: Array<number | null> };
export declare function withMACD<T extends Candle[]>(c: T): T & { macd: MACD };
export declare const T7_SWING: WithRSI;
export declare const T7_STRONG: WithRSI;
export declare const T7_MACD: WithMACD;
export declare const T7_APPLY: WithRSI;
export declare const T7_Q_RSI: WithRSI;
export declare const T7_Q_BELOW: WithMACD;
export declare const T7_Q_HIST: WithMACD;

// Technical Analysis T8
type Divergence = Candle[] & Swings & { rsi: Array<number | null> };
export declare const T8_BEAR: Divergence;
export declare const T8_BULL: Divergence;
export declare const T8_FAIL: Divergence;
type Cut = Divergence & { after: { maxH: number; minL: number; lastC: number } };
export declare const T8_TRY: Cut;
export declare const T8_APPLY: Cut;
export declare const T8_Q_BEAR: Divergence;
export declare const T8_Q_BULL: Divergence;
export declare const T8_Q_FAIL: Divergence;


// Technical Analysis T9–T12
type WithSwings = Candle[] & Swings;
export declare const T9_MOVE: WithSwings;
export declare const T9_DOWN: WithSwings;
export declare const T9_TRY: WithSwings;
export declare const T9_APPLY: WithSwings;
export declare const T9_Q_LEVEL: WithSwings;
export declare const T9_Q_PRICE: WithSwings;
export declare const T9_Q_DOWN: WithSwings;
export declare const T10_TRY: WithSwings;
export declare const T10_APPLY: WithSwings;
export declare const T10_Q_HS: WithSwings;
export declare const T10_Q_DB: WithSwings;
export declare const T10_Q_FAIL: WithSwings;
export declare const T11_INV_HS: WithSwings;
export declare const T11_RECT: WithSwings;
export declare const T11_APPLY: WithSwings;
export declare const T11_Q_FLAG: WithSwings;
export declare const T11_Q_CONTEXT: WithSwings;
export declare const T11_Q_TRI: WithSwings;
type Tools = { ma50: Array<number | null>; rsi: Array<number | null> };
export declare const T12_TEACH: WithSwings & Tools & { resist: [number, number] };
export declare const T12_PLAN: Breakout;
export declare const T12_CASE: Breakout & Swings & Tools & { rangeLow: number };
export declare const T12_APPLY: Breakout & { rsi: Array<number | null> };
export declare const T12_Q_AGREE: Breakout & Swings & Tools & { rangeLow: number };
export declare const T12_Q_PLAN: Breakout;
export declare const T12_Q_DIV: WithSwings & Tools;
// Fundamentals P8
export declare const P8_REPORT: Candle[] & { reportIdx: number; prevClose: number; gapOpen: number };
// Risk
export declare function closesToCandles(closes: number[], t: string): Candle[];
export declare const R1_CALM: Candle[];
export declare const R1_WILD: Candle[];
export declare const R1_DD: WithSwings;
export declare const R1_TRY: WithSwings;
export declare const R1_Q: WithSwings;
export declare const R5_TRADE: WithSwings & { entryIdx: number };
export declare const R5_PLAN: WithSwings;
export declare const R7_CRASH: WithSwings;
export declare const R7_BUBBLE: WithSwings;
export declare const M7_NEWS: WithSwings;
export declare const M7_RATE: WithSwings;
