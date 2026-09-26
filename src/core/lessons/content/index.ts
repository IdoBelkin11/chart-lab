// ---------------------------------------------------------------------------
// The one registry of written lessons, keyed by curriculum id. A lesson is
// "written" exactly when it has content here — the track page, the rail, the
// lesson route, practice and the tutor all ask this, so they cannot disagree.
// ---------------------------------------------------------------------------
import type { QuizQuestion } from '@core/types/kb';
import type { LessonChartSpec } from '@core/charts/lessonCharts';
import { QUIZ_QUESTIONS } from '@core/quiz/questions.js';
import { LESSON_TO_LEGACY, LEGACY_TO_LESSON } from '@core/curriculum/curriculum';
import { legacyContent } from './legacy';
import { FOUNDATIONS } from './foundations';
import { T1 } from './t1';
import { T6 } from './t6';
import { T7 } from './t7';
import { T8 } from './t8';
import { T9 } from './t9';
import { T10 } from './t10';
import { T11 } from './t11';
import { T12 } from './t12';
import { FUNDAMENTALS_1 } from './p1to3';
import { FUNDAMENTALS_2 } from './p4to6';
import { FUNDAMENTALS_3 } from './p7to9';
import { RISK_1 } from './r1to3';
import { RISK_2 } from './r4to6';
import { RISK_3 } from './r7to8';
import { TECHNICAL } from './technical';
import type { LessonContent } from './types';

export type * from './types';

/** Lessons written in the content model. They take precedence over the previous build's adapter. */
const WRITTEN: ReadonlyMap<string, LessonContent> = new Map([...FOUNDATIONS, T1, ...TECHNICAL, T6, T7, T8, T9, T10, T11, T12, ...FUNDAMENTALS_1, ...FUNDAMENTALS_2, ...FUNDAMENTALS_3, ...RISK_1, ...RISK_2, ...RISK_3].map((c) => [c.id, c]));
const cache = new Map<string, LessonContent | null>();

export function lessonContent(id: string): LessonContent | null {
  if (!cache.has(id)) {
    const legacy = LESSON_TO_LEGACY[id];
    cache.set(id, WRITTEN.get(id) ?? (legacy ? legacyContent(legacy) : null));
  }
  return cache.get(id)!;
}

export { isWritten, LESSON_META } from './meta';

/**
 * The whole question bank, each question once: every written lesson's own questions first (so a
 * lesson's quiz page opens on the questions written for it), then the rest of the previous build's.
 */
export function allQuestions(): QuizQuestion[] {
  const all = [...[...WRITTEN.values()].flatMap((c) => c.questions), ...(QUIZ_QUESTIONS as QuizQuestion[])];
  return [...new Map(all.map((q) => [q.id, q])).values()];
}

/** A visual question's chart, looked up in the lesson that owns the question. */
export function questionChart(q: QuizQuestion): LessonChartSpec | undefined {
  if (q.chart === undefined || !q.lesson) return undefined;
  return lessonContent(LEGACY_TO_LESSON[q.lesson] ?? q.lesson)?.charts[q.chart];
}
