// ---------------------------------------------------------------------------
// Per-lesson quiz scoping.
//
// The bug this replaces: every lesson was mapped to a broad CATEGORY, so all
// seven technical lessons drew from the same three technical questions and
// "Practice this" gave an identical quiz regardless of which chapter you were
// in — pressing it inside the moving-averages lesson opened an RSI question.
//
// Selection is now trivial, because the question data carries its own home
// chapter: a lesson's quiz is exactly the questions authored for that lesson.
// There is no category fallback and no top-up from neighbouring chapters, so
// a scoped quiz can never include material the learner has not been taught
// here. That guarantee is what the previous indirection gave away.
//
// No question data is modified here. This is selection, not authoring.
// ---------------------------------------------------------------------------
import type { QuizQuestion } from '@core/types/kb';

/** How many questions a lesson quiz holds. Every lesson has at least this many. */
export const QUESTIONS_PER_LESSON = 3;

export function questionsForLesson(
  lessonId: string,
  all: QuizQuestion[]
): QuizQuestion[] | null {
  const own = all.filter((q) => q.lesson === lessonId);
  // Null, not an empty array: the caller distinguishes "no scoped quiz for
  // this lesson, fall back to the general bank" from "a quiz with no
  // questions", which would render an immediately-finished session.
  return own.length ? own.slice(0, QUESTIONS_PER_LESSON) : null;
}

/** Whether a lesson has its own practice set — used to show or hide the CTA. */
export function hasLessonQuiz(lessonId: string, all: QuizQuestion[]): boolean {
  return all.some((q) => q.lesson === lessonId);
}
