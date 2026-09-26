// ---------------------------------------------------------------------------
// A track's practice: which questions, in what order, and what passes.
//
// The design's rule is one question per lesson, at least 5, pass at 80%
// rounded up, unlimited retries. Decided 2026-09-25: while lessons are still
// being written, the practice covers the WRITTEN lessons only, and is topped
// up to 5 (where the bank allows) from those same lessons' own questions.
//
// Each attempt asks different questions where the bank has them: attempt k
// takes question (k-1) mod n of each lesson — the design's "new questions,
// same ideas" retry.
// ---------------------------------------------------------------------------
import type { QuizQuestion } from '@core/types/kb';
import type { TrackId } from '@core/curriculum/curriculum';
import { passFor } from '@core/curriculum/curriculum';
import { lessonContent } from '@core/lessons/content';
import { MIN_QUESTIONS, writtenLessons } from './practiceSize';

export { writtenLessons };

export interface PracticeItem {
  /** The curriculum lesson the question comes from. */
  lessonId: string;
  question: QuizQuestion;
}

const bankFor = (lessonId: string): QuizQuestion[] => lessonContent(lessonId)?.questions ?? [];

/** The questions for one attempt (1-based), in lesson order. */
export function practiceItems(track: TrackId, attempt: number): PracticeItem[] {
  const banks = writtenLessons(track).map((l) => ({ lessonId: l.id, qs: bankFor(l.id) })).filter((b) => b.qs.length);
  const shift = Math.max(0, attempt - 1);
  const items: PracticeItem[] = banks.map((b) => ({ lessonId: b.lessonId, question: b.qs[shift % b.qs.length]! }));
  // Top up to the minimum from the same lessons, round-robin, never repeating a question.
  const used = new Set(items.map((i) => i.question.id));
  for (let k = 1; items.length < MIN_QUESTIONS && banks.some((b) => b.qs.length > k); k++) {
    for (const b of banks) {
      const q = b.qs[(shift + k) % b.qs.length]!;
      if (items.length < MIN_QUESTIONS && !used.has(q.id)) { used.add(q.id); items.push({ lessonId: b.lessonId, question: q }); }
    }
  }
  return items;
}

export const practicePass = (items: readonly PracticeItem[]): number => passFor(items.length);
