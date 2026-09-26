import { describe, it, expect } from 'vitest';
import type { StorageAdapter } from '@core/progress/progress';
import {
  EMPTY_LEARNING, LEARNING_KEY, LESSON_STEPS, readLearning, writeLearning, mergeLegacy, toLegacy,
  openLesson, reachStep, completeLesson, uncompleteLesson, recordPractice, saveOnboarding,
  lessonStatus, trackStatus, trackDone, practiceOpen, completedIn, totalCompleted, resumeLesson, activeTracks, isValidLearning
} from '@core/progress/learning';
import type { LearningProgress } from '@core/progress/learning';
import { lessonsOf } from '@core/curriculum/curriculum';

const LEGACY_KEY = 'chartlab.lessonProgress';
function store(seed: Record<string, string> = {}): StorageAdapter & { data: Record<string, string> } {
  const data = { ...seed };
  return { data, read: (k) => data[k] ?? null, write: (k, v) => { data[k] = v; } };
}
const all = (p: LearningProgress, track: 'F' | 'T' | 'P' | 'R' | 'M' | 'D') => lessonsOf(track).reduce((acc, l) => completeLesson(acc, l.id), p);

describe('migration: nobody loses a completed lesson', () => {
  it('a previous-build record is mapped onto the curriculum on first load', () => {
    const s = store({ [LEGACY_KEY]: JSON.stringify({ completed: ['l0', 'l1'], visited: ['l0', 'l1', 'l3'], lastVisited: 'l3' }) });
    const p = readLearning(s);
    expect(lessonStatus(p, 'F1')).toBe('completed');
    expect(lessonStatus(p, 'T4')).toBe('completed');
    expect(lessonStatus(p, 'T6')).toBe('in-progress');
    expect(lessonStatus(p, 'T5')).toBe('not-started');
    expect(p.lastLesson).toBe('T6');
  });

  it('merging only ever adds: a v2 record keeps its own progress and gains the legacy completions', () => {
    const v2 = completeLesson(openLesson(EMPTY_LEARNING, 'P2'), 'P2');
    const s = store({ [LEARNING_KEY]: JSON.stringify(v2), [LEGACY_KEY]: JSON.stringify({ completed: ['l2'], visited: ['l2'], lastVisited: 'l2' }) });
    const p = readLearning(s);
    expect(lessonStatus(p, 'P2')).toBe('completed');
    expect(lessonStatus(p, 'T5')).toBe('completed');
    expect(p.lastLesson).toBe('P2'); // the newer record's own position wins
  });

  it('a legacy visit never downgrades a lesson completed in the new record', () => {
    const v2 = completeLesson(EMPTY_LEARNING, 'T4');
    const p = mergeLegacy(v2, { completed: [], visited: ['l1'], lastVisited: 'l1' });
    expect(lessonStatus(p, 'T4')).toBe('completed');
  });

  it('writing keeps the old key up to date, so a rollback still sees the progress', () => {
    const s = store();
    writeLearning(s, completeLesson(openLesson(EMPTY_LEARNING, 'T6'), 'T6'));
    expect(JSON.parse(s.data[LEGACY_KEY]!)).toEqual({ completed: ['l3'], visited: ['l3'], lastVisited: 'l3' });
    expect(JSON.parse(s.data[LEARNING_KEY]!).v).toBe(2);
  });

  it('round-trips through storage unchanged', () => {
    const s = store();
    const p = recordPractice(reachStep(completeLesson(EMPTY_LEARNING, 'F1'), 'F2', 3), 'F', 4, 5);
    writeLearning(s, p);
    expect(readLearning(s)).toEqual(p);
  });

  it('corrupt or foreign storage falls back instead of throwing', () => {
    expect(readLearning(store({ [LEARNING_KEY]: '{nope' }))).toEqual(EMPTY_LEARNING);
    expect(readLearning(store({ [LEARNING_KEY]: JSON.stringify({ v: 1, lessons: [] }) }))).toEqual(EMPTY_LEARNING);
    expect(isValidLearning({ v: 2, lessons: { T4: { step: 'x', completed: true } }, practice: {} })).toBe(false);
  });

  it('a failing storage write does not throw', () => {
    const broken: StorageAdapter = { read: () => null, write: () => { throw new Error('quota'); } };
    expect(() => writeLearning(broken, completeLesson(EMPTY_LEARNING, 'F1'))).not.toThrow();
  });

  it('toLegacy ignores lessons the previous build never had', () => {
    expect(toLegacy(completeLesson(EMPTY_LEARNING, 'P2'))).toEqual({ completed: [], visited: [], lastVisited: null });
  });
});

describe('lesson transitions are pure and only move forward', () => {
  it('opening starts a lesson at step 0 without completing it', () => {
    const p = openLesson(EMPTY_LEARNING, 'T4');
    expect(p.lessons.T4).toEqual({ step: 0, completed: false });
    expect(EMPTY_LEARNING.lessons).toEqual({});
  });

  it('steps only advance, and stay within the seven steps', () => {
    let p = reachStep(EMPTY_LEARNING, 'T4', 4);
    p = reachStep(p, 'T4', 2);
    expect(p.lessons.T4!.step).toBe(4);
    expect(reachStep(p, 'T4', 99).lessons.T4!.step).toBe(LESSON_STEPS - 1);
  });

  it('completing, then un-completing keeps the lesson started', () => {
    const p = uncompleteLesson(completeLesson(EMPTY_LEARNING, 'T4'), 'T4');
    expect(lessonStatus(p, 'T4')).toBe('in-progress');
  });

  it('unknown lesson ids change nothing', () => {
    expect(openLesson(EMPTY_LEARNING, 'Z9')).toBe(EMPTY_LEARNING);
    expect(completeLesson(EMPTY_LEARNING, 'l1')).toBe(EMPTY_LEARNING);
  });
});

describe('practice, tracks and resume', () => {
  it('passing needs 80% rounded up; retries are unlimited and a pass is permanent', () => {
    let p = recordPractice(EMPTY_LEARNING, 'T', 9, 12);
    expect(p.practice.T).toEqual({ attempts: 1, best: 9, passed: false, total: 12 });
    p = recordPractice(p, 'T', 10, 12);
    p = recordPractice(p, 'T', 3, 12);
    expect(p.practice.T).toEqual({ attempts: 3, best: 10, passed: true, total: 12 });
  });

  it('practice opens once every WRITTEN lesson of the track is done', () => {
    // All 12 TA lessons are written: practice opens with the last one.
    const written = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11'];
    const almost = written.reduce((acc, id) => completeLesson(acc, id), EMPTY_LEARNING);
    expect(practiceOpen(almost, 'T')).toBe(false);
    expect(practiceOpen(completeLesson(almost, 'T12'), 'T')).toBe(true);
    // A track with nothing written has no practice yet.
    expect(practiceOpen(all(EMPTY_LEARNING, 'M'), 'M')).toBe(false);
  });

  it('a track is done only with all lessons AND a passed practice', () => {
    const p = all(EMPTY_LEARNING, 'F');
    expect(trackDone(p, 'F')).toBe(false);
    expect(trackStatus(p, 'F')).toBe('active');
    expect(trackStatus(recordPractice(p, 'F', 4, 5), 'F')).toBe('done');
  });

  it('derivatives stay locked until the risk track is done', () => {
    expect(trackStatus(EMPTY_LEARNING, 'D')).toBe('locked');
    const risk = recordPractice(all(EMPTY_LEARNING, 'R'), 'R', 8, 8);
    expect(trackStatus(risk, 'D')).toBe('new');
  });

  it('continue goes to the unfinished last lesson, else the next one in its track', () => {
    expect(resumeLesson(EMPTY_LEARNING)).toBeNull();
    expect(resumeLesson(reachStep(EMPTY_LEARNING, 'T4', 3))).toBe('T4');
    expect(resumeLesson(completeLesson(EMPTY_LEARNING, 'T4'))).toBe('T1');
  });

  it('counts and active tracks follow the lessons', () => {
    const p = completeLesson(openLesson(completeLesson(EMPTY_LEARNING, 'F1'), 'P2'), 'T4');
    expect(totalCompleted(p)).toBe(2);
    expect(completedIn(p, 'T')).toBe(1);
    expect(activeTracks(p)).toEqual(['F', 'T', 'P']);
  });

  it('onboarding answers are kept with a timestamp', () => {
    const answers = { interests: ['P' as const], experience: 'some' as const, goal: 'invest' as const, time: 30 as const };
    const p = saveOnboarding(EMPTY_LEARNING, answers, new Date('2026-09-25T10:00:00Z'));
    expect(p.onboarding).toEqual({ answers, completedAt: '2026-09-25T10:00:00.000Z' });
  });
});
