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

export declare const L2: Candle[] & { resistZone: [number, number]; breakIdx: number; retestIdx: number };
export declare const l2BreakIdx: number;
export declare const l2RetestIdx: number;
export declare const L2_REAL: Candle[] & { resistZone: [number, number] };
export declare const L2_FALSE: Candle[] & { resistZone: [number, number] };

export declare const L3: Candle[];

export declare const L5: Candle[] & {
  lowIdx: number;
  highIdx: number;
  swingLow: number;
  swingHigh: number;
  fibLevels: Array<{ ratio: number; price: number }>;
};

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
