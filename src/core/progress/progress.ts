// ---------------------------------------------------------------------------
// Lesson progress.
//
// State transitions are pure functions over a LessonProgress value; the only
// impure part is the storage adapter, which is injected. Two reasons that
// matters:
//
//   · Testable without a browser — no localStorage stub needed.
//   · Platform-independent — swapping to AsyncStorage (React Native) or
//     Firestore (cross-device sync, which is on the roadmap) is a different
//     adapter, not a rewrite of the rules.
//
// `visited` is what separates "in progress" from "not started". Opening a
// lesson is enough to move it out of not-started, so the roadmap reflects
// reality immediately rather than waiting for an explicit completion.
// ---------------------------------------------------------------------------
import type { LessonProgress, LessonState } from '@core/types/kb';

export interface StorageAdapter {
  read(key: string): string | null;
  write(key: string, value: string): void;
}

const KEY = 'chartlab.lessonProgress';

export const EMPTY_PROGRESS: LessonProgress = {
  completed: [],
  visited: [],
  lastVisited: null
};

/**
 * Validates a stored value before trusting it.
 *
 * Corrupted or hand-edited storage previously threw and took the whole app
 * down on load. Anything that fails this check is replaced with a clean
 * default rather than propagating.
 */
export function isValidProgress(value: unknown): value is LessonProgress {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<LessonProgress>;
  const strings = (a: unknown) => Array.isArray(a) && a.every((x) => typeof x === 'string');
  if (!strings(v.completed)) return false;
  if (v.visited !== undefined && !strings(v.visited)) return false;
  if (v.lastVisited !== undefined && v.lastVisited !== null && typeof v.lastVisited !== 'string') {
    return false;
  }
  return true;
}

export function readProgress(storage: StorageAdapter): LessonProgress {
  try {
    const raw = storage.read(KEY);
    if (!raw) return { ...EMPTY_PROGRESS };
    const parsed: unknown = JSON.parse(raw);
    if (!isValidProgress(parsed)) return { ...EMPTY_PROGRESS };
    // Migrate saves written before `visited` existed, rather than discarding
    // someone's progress because the shape grew.
    return {
      completed: parsed.completed,
      visited: parsed.visited ?? [],
      lastVisited: parsed.lastVisited ?? null
    };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

export function writeProgress(storage: StorageAdapter, progress: LessonProgress): void {
  try {
    storage.write(KEY, JSON.stringify(progress));
  } catch {
    // Storage can be unavailable (private mode, quota). Losing persistence
    // is acceptable; crashing the lesson the user is reading is not.
  }
}

// --- Pure transitions ------------------------------------------------------

export function markVisited(progress: LessonProgress, lessonId: string): LessonProgress {
  return {
    completed: progress.completed,
    visited: progress.visited.includes(lessonId)
      ? progress.visited
      : [...progress.visited, lessonId],
    lastVisited: lessonId
  };
}

export function markCompleted(progress: LessonProgress, lessonId: string): LessonProgress {
  return {
    completed: progress.completed.includes(lessonId)
      ? progress.completed
      : [...progress.completed, lessonId],
    visited: progress.visited.includes(lessonId)
      ? progress.visited
      : [...progress.visited, lessonId],
    lastVisited: lessonId
  };
}

export function toggleCompleted(progress: LessonProgress, lessonId: string): LessonProgress {
  if (!progress.completed.includes(lessonId)) return markCompleted(progress, lessonId);
  return {
    ...progress,
    completed: progress.completed.filter((id) => id !== lessonId)
  };
}

/** The single place that decides a lesson's state, so no two views disagree. */
export function lessonState(progress: LessonProgress, lessonId: string): LessonState {
  if (progress.completed.includes(lessonId)) return 'completed';
  if (progress.visited.includes(lessonId)) return 'learning';
  return 'not-started';
}

/** Browser adapter. The only place localStorage is named. */
export const browserStorage: StorageAdapter = {
  read: (key) => (typeof localStorage === 'undefined' ? null : localStorage.getItem(key)),
  write: (key, value) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
  }
};
