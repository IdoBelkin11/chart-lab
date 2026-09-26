// ---------------------------------------------------------------------------
// The one practice attempt in progress.
//
// Module state rather than component state: the attempt moves between the
// shell (entry, results) and the full-screen question view, and React
// remounts the route across that boundary. An attempt lives until it is
// replaced; it is not persisted — reloading mid-attempt starts a fresh one,
// and only finished attempts are recorded (AppState.recordPractice).
// ---------------------------------------------------------------------------
import { useSyncExternalStore } from 'react';
import type { TrackId } from '@core/curriculum/curriculum';
import type { PracticeItem } from '@core/practice/trackPractice';

export interface PracticeSession {
  track: TrackId;
  attempt: number;
  items: PracticeItem[];
  /** The chosen option key per question, once checked. */
  answers: Array<string | null>;
  index: number;
  startedAt: number;
  finishedAt: number | null;
  /** Set when this attempt is the one that completed the whole track. */
  completedTrack: boolean;
}

let current: PracticeSession | null = null;
const listeners = new Set<() => void>();

export function setSession(next: PracticeSession | null) {
  current = next;
  listeners.forEach((l) => l());
}

export function useSession(track: TrackId): PracticeSession | null {
  const s = useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => current
  );
  return s?.track === track ? s : null;
}

export const correctCount = (s: PracticeSession) =>
  s.items.filter((it, i) => s.answers[i] === it.question.correctKey).length;
