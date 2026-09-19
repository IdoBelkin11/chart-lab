import { describe, it, expect } from 'vitest';
import { QUIZ_QUESTIONS, getQuizQuestions } from '@core/quiz/questions.js';
import { createQuizSession, createQuizSessionFromQuestions, currentQuestion, submitAnswer, getQuizScore, restartQuiz } from '@core/quiz/engine.js';
import { compoundInterest, percentageReturn, profitLoss, peRatio, dividendYield } from '@core/calculators/calculations.js';
import { questionsForLesson } from '@core/quiz/topicScoping';
import { LESSONS } from '@core/lessons/lessons';
import type { QuizQuestion } from '@core/types/kb';

describe('quiz bank ported intact', () => {
  // Re-baselined upward when the bank grew from 9 to 29: every lesson gained
  // its own three questions so that "Practice this" could be scoped to the
  // chapter the learner is actually in. The count stays EXACT rather than a
  // lower bound — that is what catches an accidental deletion.
  it('keeps the exact question count', () => expect(QUIZ_QUESTIONS.length).toBe(29));

  it('every lesson has at least three of its own questions', () => {
    for (const lesson of LESSONS) {
      const own = QUIZ_QUESTIONS.filter((q: QuizQuestion) => q.lesson === lesson.id);
      expect(own.length, `${lesson.id} own questions`).toBeGreaterThanOrEqual(3);
    }
  });

  it('a scoped quiz contains ONLY that lesson\'s questions', () => {
    // The whole point of the rewrite: no category fallback, so practice can
    // never serve material from a chapter the learner has not reached.
    for (const lesson of LESSONS) {
      const picked = questionsForLesson(lesson.id, QUIZ_QUESTIONS as QuizQuestion[]);
      expect(picked, lesson.id).toBeTruthy();
      for (const q of picked!) {
        expect(q.lesson, `${q.id} in ${lesson.id} quiz`).toBe(lesson.id);
      }
    }
  });

  it('question ids are unique', () => {
    const ids = QUIZ_QUESTIONS.map((q: QuizQuestion) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every correctKey names one of that question\'s own options', () => {
    for (const q of QUIZ_QUESTIONS as QuizQuestion[]) {
      expect(q.options.some((o) => o.key === q.correctKey), q.id).toBe(true);
    }
  });
  it('every question is bilingual with options', () => {
    for (const q of QUIZ_QUESTIONS) {
      expect(q.question.he && q.question.en).toBeTruthy();
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    }
  });
  it('MACD question stays removed', () => {
    expect(QUIZ_QUESTIONS.some((q: any) => /macd/i.test(q.id))).toBe(false);
  });
  it('filters by category', () => {
    expect(getQuizQuestions({ category: 'technical' }).length).toBeGreaterThan(0);
  });
});

describe('quiz engine', () => {
  it('builds a session and advances', () => {
    const s = createQuizSession({}, 3);
    expect(s.questions.length).toBe(3);
    const q = currentQuestion(s) as any;
    expect(q).toBeTruthy();
    // Options are keyed ('a'..'d') and carry bilingual text.
    expect(q.options[0].key).toBeTruthy();
    expect(q.options[0].text.he && q.options[0].text.en).toBeTruthy();
    submitAnswer(s, q.options[0].key);
    expect(getQuizScore(s).total).toBe(1);
  });
  it('an explicit list preserves relevance order (not shuffled)', () => {
    const picked = QUIZ_QUESTIONS.slice(0, 3);
    const s = createQuizSessionFromQuestions(picked, 6);
    expect(s.questions.map((q: any) => q.id)).toEqual(picked.map((q: any) => q.id));
  });
  it('restart clears answers', () => {
    const s = restartQuiz(createQuizSession({}, 2));
    expect(s.currentIndex).toBe(0);
    expect(s.finished).toBe(false);
  });
});

describe('calculators produce the same numbers as before', () => {
  // These return result OBJECTS, not bare numbers — the calculators expose a
  // breakdown (yearly balances, fees, validity) that the UI renders. Asserting
  // the exact shape is what makes this a real port check rather than a smoke test.
  it('compound interest, with the full yearly series', () => {
    const r = compoundInterest(10000, 7, 10, 0) as any;
    expect(Math.round(r.futureValue)).toBe(19672);
    expect(r.totalContributed).toBe(10000);
    expect(r.yearlyBalances.length).toBe(11);   // year 0 through year 10
  });
  it('percentage return', () => {
    const r = percentageReturn(100, 150) as any;
    expect(r.validInput).toBe(true);
    expect(r.percentChange).toBeCloseTo(50);
  });
  it('profit/loss nets both fees', () => {
    const r = profitLoss(100, 110, 10, 5, 5) as any;
    expect(r.totalCost).toBe(1005);
    expect(r.netProfitLoss).toBeCloseTo(90);
  });
  it('P/E', () => expect((peRatio(100, 5) as any).pe).toBeCloseTo(20));
  it('dividend yield', () => expect((dividendYield(100, 3) as any).yieldPct).toBeCloseTo(3));
});
