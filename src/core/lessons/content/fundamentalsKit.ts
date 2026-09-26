// ---------------------------------------------------------------------------
// Shared by the Fundamentals lessons (P1–P9): formatting, the question builder,
// and the figures more than one lesson draws. Every number comes from
// @core/fundamentals/companies — these helpers only format it.
// ---------------------------------------------------------------------------
import type { Localized, QuizQuestion } from '@core/types/kb';
import type { Diagram } from './types';
import type { Company } from '@core/fundamentals/companies';
import { income } from '@core/fundamentals/companies';

export const L = (he: string, en: string): Localized => ({ he, en });
/** Isolates a formula inside Hebrew text so it reads left to right. */
export const ltr = (x: string) => `⁦${x}⁩`;
/** An amount in millions, with thousands separators and a true minus sign. */
export const n0 = (x: number) => `${x < 0 ? '−' : ''}${Math.round(Math.abs(x)).toLocaleString('en-US')}`;
export const n1 = (x: number) => `${x < 0 ? '−' : ''}${Math.abs(x).toFixed(1)}`;
export const n2 = (x: number) => `${x < 0 ? '−' : ''}${Math.abs(x).toFixed(2)}`;
export const pc = (x: number, d = 1) => `${x < 0 ? '−' : ''}${Math.abs(x).toFixed(d)}%`;
/** Money per share: ₪ in Hebrew, $ in English (as the calculators do). */
export const cur = (x: number, d = 2): Localized => L(`₪${x.toFixed(d)}`, `$${x.toFixed(d)}`);
export const MILLIONS = L('מיליוני ₪', '$ millions');

export const q = (id: string, lesson: string, figure: Diagram, difficulty: 'beginner' | 'intermediate', question: Localized, options: Array<[string, Localized]>, correctKey: string, explanation: Localized): QuizQuestion => ({
  id, lesson, category: 'fundamental', difficulty, figure, question, options: options.map(([key, text]) => ({ key, text })), correctKey, explanation
});
/** A question whose options are numbers, the same in both languages. */
export const nums = (xs: string[]): Array<[string, Localized]> => xs.map((x, i) => ['abcd'[i]!, L(x, x)]);

/** The income-statement lines, in order: [key, Hebrew, English, sub-line or total]. */
export const LINES = [
  ['rev', 'הכנסות', 'Revenue', undefined],
  ['cogs', 'עלות המכר', 'Cost of goods sold', 'sub'],
  ['gross', 'רווח גולמי', 'Gross profit', 'total'],
  ['sm', 'מכירה ושיווק', 'Sales & marketing', 'sub'],
  ['rd', 'מחקר ופיתוח', 'R&D', 'sub'],
  ['ga', 'הנהלה וכלליות', 'General & admin', 'sub'],
  ['op', 'רווח תפעולי', 'Operating income', 'total'],
  ['int', 'הוצאות מימון', 'Interest', 'sub'],
  ['pre', 'רווח לפני מס', 'Pre-tax income', 'total'],
  ['tax', 'מסים', 'Taxes', 'sub'],
  ['net', 'רווח נקי', 'Net income', 'total']
] as const;
export type Line = (typeof LINES)[number][0];
/** A statement line as shown: costs in brackets, the way statements print them. */
export const shown = (c: Company, k: Line) => { const v = income(c.statement)[k]; return LINES.find((l) => l[0] === k)![3] === 'sub' ? `(${n0(v)})` : n0(v); };

/** Income statements side by side, from `from` to `to` (inclusive), one column per company. */
export function statementTable(title: Localized, cos: Company[], from: Line = 'rev', to: Line = 'net', extra: Array<{ label: Localized; cells: string[]; kind?: 'sub' | 'total' }> = []): Diagram {
  const i0 = LINES.findIndex((l) => l[0] === from), i1 = LINES.findIndex((l) => l[0] === to);
  return {
    type: 'table', title,
    columns: [MILLIONS, ...cos.map((c) => c.name)],
    rows: [
      ...LINES.slice(i0, i1 + 1).map(([k, he, en, kind]) => ({ label: L(he, en), cells: cos.map((c) => shown(c, k)), ...(kind ? { kind } : {}) })),
      ...extra
    ]
  };
}
