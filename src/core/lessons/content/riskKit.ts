// ---------------------------------------------------------------------------
// Shared by the Risk lessons (R1–R8): money in the lesson's currency, the
// question builder, and small numeric helpers over price series. Every number
// comes from @core/risk/scenarios or a series — these helpers only format it.
// ---------------------------------------------------------------------------
import type { Localized, QuizQuestion } from '@core/types/kb';
import type { Diagram } from './types';

export { L, ltr, n0, n1, n2, pc, nums } from './fundamentalsKit';
import { L } from './fundamentalsKit';

/** Money with thousands separators: ₪ in Hebrew, $ in English (as the calculators do). */
export const money = (x: number, d = 0): Localized => {
  const s = `${x < 0 ? '−' : ''}${Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
  return L(`₪${s}`, `$${s}`);
};

/** A question asked about a figure, or about one of the lesson's charts (by index). */
export const rq = (id: string, lesson: string, on: Diagram | number, difficulty: 'beginner' | 'intermediate', question: Localized, options: Array<[string, Localized]>, correctKey: string, explanation: Localized): QuizQuestion => ({
  id, lesson, category: 'risk', difficulty, ...(typeof on === 'number' ? { chart: on } : { figure: on }), question, options: options.map(([key, text]) => ({ key, text })), correctKey, explanation
});

type C = Array<{ o: number; h: number; l: number; c: number }>;
/** The average size of a daily move, % (up or down alike). */
export const avgMove = (c: C) => (c.slice(1).reduce((t, x, i) => t + Math.abs(x.c / c[i]!.c - 1), 0) / (c.length - 1)) * 100;
/** Drawdown from a peak to a trough, %. */
export const drawdown = (peak: number, trough: number) => (1 - trough / peak) * 100;
/** The deepest fall from any earlier high in a path of values, %. */
export const maxDrawdown = (path: number[]) => { let hi = path[0]!, dd = 0; for (const v of path) { hi = Math.max(hi, v); dd = Math.max(dd, 1 - v / hi); } return dd * 100; };
/** The standard deviation of daily returns, %. */
export const dailyVol = (r: number[]) => { const m = r.reduce((s, x) => s + x, 0) / r.length; return Math.sqrt(r.reduce((s, x) => s + (x - m) ** 2, 0) / r.length) * 100; };
