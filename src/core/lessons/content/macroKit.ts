// ---------------------------------------------------------------------------
// Shared by the Macro lessons (M1–M7): the question builder and the same
// formatters the Risk lessons use. Every number comes from @core/macro/scenarios
// — these helpers only format it.
// ---------------------------------------------------------------------------
import type { Localized, QuizQuestion } from '@core/types/kb';
import type { Diagram } from './types';

export { L, ltr, n0, n1, n2, nums, money } from './riskKit';
import { ltr, pc as plainPc } from './riskKit';

/**
 * A percentage — and when it is negative, isolated left-to-right: in a Hebrew
 * line a bare "−1.5%" is laid out as "1.5%−". Macro is full of falls, spreads
 * below zero and negative real rates, so its figures carry the isolate.
 */
export const pc = (x: number, d = 1) => (x < 0 ? ltr(plainPc(x, d)) : plainPc(x, d));

/** A question asked about a figure, or about one of the lesson's charts (by index). */
export const mq = (id: string, lesson: string, on: Diagram | number, difficulty: 'beginner' | 'intermediate', question: Localized, options: Array<[string, Localized]>, correctKey: string, explanation: Localized): QuizQuestion => ({
  id, lesson, category: 'macro', difficulty, ...(typeof on === 'number' ? { chart: on } : { figure: on }), question, options: options.map(([key, text]) => ({ key, text })), correctKey, explanation
});

/** A signed percentage change, for "from A to B" claims. */
export const change = (from: number, to: number) => (to / from - 1) * 100;
/** "+3.2%" / "−1.1%" — a signed rate or growth figure, isolated (see pc). */
export const sp = (x: number, d = 1) => ltr(`${x > 0 ? '+' : x < 0 ? '−' : ''}${Math.abs(x).toFixed(d)}%`);
