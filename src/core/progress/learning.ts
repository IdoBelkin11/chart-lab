// ---------------------------------------------------------------------------
// Learning progress for the 47-lesson curriculum (storage format v2).
//
// Same discipline as progress.ts: every state change is a pure function over
// a value, and storage is an injected adapter — testable without a browser,
// portable to another store without touching the rules.
//
// NOTHING A LEARNER HAS DONE IS EVER LOST. That is the whole design of the
// migration:
//
//   · On first load the previous build's record (`chartlab.lessonProgress`,
//     lessons l0…l7) is read and mapped onto the curriculum (l1 → T4, …).
//   · Merging is a UNION: completions only accumulate. If both records exist
//     — e.g. someone opened the previous build again after upgrading — the
//     old record's completions are folded in, never the other way round.
//   · The old key is never deleted. It keeps being written as a projection of
//     this record, so the previous build (a rollback) and any code still
//     reading the old shape both see the truth.
// ---------------------------------------------------------------------------
import type { LessonProgress } from '@core/types/kb';
import type { StorageAdapter } from './progress';
import { readProgress, writeProgress } from './progress';
import type { TrackId } from '@core/curriculum/data';
import type { OnboardingAnswers } from '@core/curriculum/recommend';
import {
  LEGACY_TO_LESSON, LESSON_TO_LEGACY, TRACKS, lessonById, lessonsOf, passFor, trackById
} from '@core/curriculum/curriculum';
import { hasContent } from '@core/curriculum/trackInfo';

export const LEARNING_KEY = 'chartlab.learning.v2';
/** Steps in every lesson: idea, why, worked example, your turn, the answer, what to remember, next. */
export const LESSON_STEPS = 7;

export interface LessonRecord {
  /** Furthest step reached, 0-based (0 … LESSON_STEPS - 1). */
  step: number;
  completed: boolean;
}

export interface PracticeRecord {
  attempts: number;
  /** Best score so far, as a count of correct answers. */
  best: number;
  passed: boolean;
  /** Questions in the best attempt, so a score can be shown as best/total. */
  total?: number;
}

export interface LearningProgress {
  v: 2;
  lessons: Record<string, LessonRecord>;
  practice: Partial<Record<TrackId, PracticeRecord>>;
  onboarding: { answers: OnboardingAnswers; completedAt: string } | null;
  lastLesson: string | null;
}

export const EMPTY_LEARNING: LearningProgress = { v: 2, lessons: {}, practice: {}, onboarding: null, lastLesson: null };

// --- validation: storage is read, never trusted ------------------------------
export function isValidLearning(value: unknown): value is LearningProgress {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<LearningProgress>;
  if (v.v !== 2 || !v.lessons || typeof v.lessons !== 'object' || !v.practice || typeof v.practice !== 'object') return false;
  for (const r of Object.values(v.lessons)) {
    if (!r || typeof r !== 'object' || typeof (r as LessonRecord).step !== 'number' || typeof (r as LessonRecord).completed !== 'boolean') return false;
  }
  for (const r of Object.values(v.practice)) {
    const p = r as PracticeRecord;
    if (!p || typeof p.attempts !== 'number' || typeof p.best !== 'number' || typeof p.passed !== 'boolean') return false;
  }
  if (v.lastLesson !== undefined && v.lastLesson !== null && typeof v.lastLesson !== 'string') return false;
  return true;
}

// --- migration from the 8-lesson build ------------------------------------------
/** Folds a previous-build record into this one. Only ever adds. */
export function mergeLegacy(p: LearningProgress, legacy: LessonProgress): LearningProgress {
  const lessons = { ...p.lessons };
  for (const id of legacy.visited) {
    const to = LEGACY_TO_LESSON[id];
    if (to && !lessons[to]) lessons[to] = { step: 0, completed: false };
  }
  for (const id of legacy.completed) {
    const to = LEGACY_TO_LESSON[id];
    if (to) lessons[to] = { step: LESSON_STEPS - 1, completed: true };
  }
  const lastFromLegacy = legacy.lastVisited ? LEGACY_TO_LESSON[legacy.lastVisited] ?? null : null;
  return { ...p, lessons, lastLesson: p.lastLesson ?? lastFromLegacy };
}

/** The previous build's shape, derived from this record (kept written for rollback safety). */
export function toLegacy(p: LearningProgress): LessonProgress {
  const completed: string[] = [];
  const visited: string[] = [];
  for (const [id, r] of Object.entries(p.lessons)) {
    const legacy = LESSON_TO_LEGACY[id];
    if (!legacy) continue;
    visited.push(legacy);
    if (r.completed) completed.push(legacy);
  }
  const order = (ids: string[]) => ids.sort();
  return { completed: order(completed), visited: order(visited), lastVisited: p.lastLesson ? LESSON_TO_LEGACY[p.lastLesson] ?? null : null };
}

export function readLearning(storage: StorageAdapter): LearningProgress {
  let current: LearningProgress = { ...EMPTY_LEARNING };
  try {
    const raw = storage.read(LEARNING_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isValidLearning(parsed)) {
        current = { ...EMPTY_LEARNING, ...parsed, onboarding: parsed.onboarding ?? null, lastLesson: parsed.lastLesson ?? null };
      }
    }
  } catch {
    /* corrupt v2 record: fall through to the legacy record rather than crash */
  }
  // readProgress validates and never throws; an absent record is empty.
  return mergeLegacy(current, readProgress(storage));
}

export function writeLearning(storage: StorageAdapter, p: LearningProgress): void {
  try {
    storage.write(LEARNING_KEY, JSON.stringify(p));
  } catch {
    // Storage can be unavailable (private mode, quota). Losing persistence
    // is acceptable; crashing the lesson being read is not.
  }
  writeProgress(storage, toLegacy(p));
}

// --- pure transitions --------------------------------------------------------------
export function openLesson(p: LearningProgress, id: string): LearningProgress {
  if (!lessonById(id)) return p;
  const r = p.lessons[id] ?? { step: 0, completed: false };
  return { ...p, lessons: { ...p.lessons, [id]: r }, lastLesson: id };
}

/** Records reaching a step. Progress only moves forward; revisiting an earlier step changes nothing. */
export function reachStep(p: LearningProgress, id: string, step: number): LearningProgress {
  if (!lessonById(id)) return p;
  const s = Math.max(0, Math.min(LESSON_STEPS - 1, Math.floor(step)));
  const r = p.lessons[id] ?? { step: 0, completed: false };
  if (s <= r.step && p.lastLesson === id && p.lessons[id]) return p;
  return { ...p, lessons: { ...p.lessons, [id]: { ...r, step: Math.max(r.step, s) } }, lastLesson: id };
}

export function completeLesson(p: LearningProgress, id: string): LearningProgress {
  if (!lessonById(id)) return p;
  return { ...p, lessons: { ...p.lessons, [id]: { step: LESSON_STEPS - 1, completed: true } }, lastLesson: id };
}

/** Un-marks a completion (the previous build's "mark as complete" was a toggle). Keeps the lesson started. */
export function uncompleteLesson(p: LearningProgress, id: string): LearningProgress {
  const r = p.lessons[id];
  if (!r?.completed) return p;
  return { ...p, lessons: { ...p.lessons, [id]: { ...r, completed: false } } };
}

/** One attempt at a track's practice. Pass = 80% of its questions, rounded up; passing is permanent. */
export function recordPractice(p: LearningProgress, track: TrackId, correct: number, total: number): LearningProgress {
  const prev = p.practice[track] ?? { attempts: 0, best: 0, passed: false };
  const better = correct >= prev.best;
  const rec: PracticeRecord = {
    attempts: prev.attempts + 1, best: better ? correct : prev.best, passed: prev.passed || correct >= passFor(total),
    total: better ? total : prev.total ?? total
  };
  return { ...p, practice: { ...p.practice, [track]: rec } };
}

export function saveOnboarding(p: LearningProgress, answers: OnboardingAnswers, at: Date = new Date()): LearningProgress {
  return { ...p, onboarding: { answers, completedAt: at.toISOString() } };
}

// --- derived state: the one place each question is answered ------------------------
export type LessonStatus = 'not-started' | 'in-progress' | 'completed';
export type TrackStatus = 'locked' | 'new' | 'active' | 'done';

export function lessonStatus(p: LearningProgress, id: string): LessonStatus {
  const r = p.lessons[id];
  return !r ? 'not-started' : r.completed ? 'completed' : 'in-progress';
}

export function completedIn(p: LearningProgress, track: TrackId): number {
  return lessonsOf(track).filter((l) => p.lessons[l.id]?.completed).length;
}

export function totalCompleted(p: LearningProgress): number {
  return Object.values(p.lessons).filter((r) => r.completed).length;
}

/** Done = every lesson completed AND the track practice passed. */
export function trackDone(p: LearningProgress, track: TrackId): boolean {
  return completedIn(p, track) === lessonsOf(track).length && !!p.practice[track]?.passed;
}

export function trackStatus(p: LearningProgress, track: TrackId): TrackStatus {
  const hard = trackById(track).prereq?.hard;
  if (hard && !trackDone(p, hard)) return 'locked';
  if (trackDone(p, track)) return 'done';
  return lessonsOf(track).some((l) => p.lessons[l.id]) ? 'active' : 'new';
}

/**
 * Practice opens once every WRITTEN lesson of the track is completed (decided
 * 2026-09-25: while lessons are still being written, practice covers the ones
 * that are). A track with nothing written has no practice yet.
 */
export function practiceOpen(p: LearningProgress, track: TrackId): boolean {
  const written = lessonsOf(track).filter((l) => hasContent(l.id));
  return written.length > 0 && written.every((l) => p.lessons[l.id]?.completed);
}

/** Where "continue" goes: the last lesson if unfinished, else the next unfinished lesson in its track. */
export function resumeLesson(p: LearningProgress): string | null {
  const last = p.lastLesson ? lessonById(p.lastLesson) : undefined;
  if (!last) return null;
  if (!p.lessons[last.id]?.completed) return last.id;
  return lessonsOf(last.track).find((l) => !p.lessons[l.id]?.completed)?.id ?? null;
}

/** Tracks with at least one lesson opened and not yet done, in curriculum order. */
export function activeTracks(p: LearningProgress): TrackId[] {
  return TRACKS.map((t) => t.id).filter((id) => trackStatus(p, id) === 'active');
}
