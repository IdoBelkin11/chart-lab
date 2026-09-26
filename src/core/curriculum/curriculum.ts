// ---------------------------------------------------------------------------
// Curriculum lookups — the one place anything asks "which lesson / track is
// this, what comes next, is it locked". Pure; no UI, no storage.
// ---------------------------------------------------------------------------
import { LESSONS, TRACKS } from './data';
import type { CurriculumLesson, Track, TrackId } from './data';

export { LESSONS, TRACKS };
export type { CurriculumLesson, Track, TrackId, LessonKind, LessonLevel, TrackModule } from './data';

export const TOTAL_LESSONS = LESSONS.length;

const byId = new Map(LESSONS.map((l) => [l.id, l]));
const trackMap = new Map(TRACKS.map((t) => [t.id, t]));

export function lessonById(id: string): CurriculumLesson | undefined {
  return byId.get(id);
}

export function trackById(id: TrackId): Track {
  const t = trackMap.get(id);
  if (!t) throw new Error(`unknown track ${id}`);
  return t;
}

export function isTrackId(id: string | null | undefined): id is TrackId {
  return !!id && trackMap.has(id as TrackId);
}

/** A track's lessons, in course order (module by module). */
export function lessonsOf(track: TrackId): CurriculumLesson[] {
  return trackById(track).modules.flatMap((m) => m.lessons.map((id) => byId.get(id)!));
}

export function trackMinutes(track: TrackId): number {
  return lessonsOf(track).reduce((s, l) => s + l.minutes, 0);
}

/** The lesson after this one in its own track, or null at the track's end. */
export function nextInTrack(lessonId: string): CurriculumLesson | null {
  const l = byId.get(lessonId);
  if (!l) return null;
  const ls = lessonsOf(l.track);
  return ls[ls.indexOf(l) + 1] ?? null;
}

export const LEVELS: Readonly<Record<1 | 2 | 3, { he: string; en: string }>> = {
  1: { he: 'בסיס', en: 'Basic' },
  2: { he: 'ביניים', en: 'Intermediate' },
  3: { he: 'מתקדם', en: 'Advanced' }
};

/**
 * A time estimate as the design writes it: Hebrew in decimal hours ("2.4
 * שעות", which reads the same in RTL as LTR — "2 ש׳ 24 ד׳" scrambled under
 * bidi), English as "2h 24m"; under an hour, minutes.
 */
export function formatDuration(minutes: number, lang: 'he' | 'en'): string {
  const h = Math.floor(minutes / 60), m = minutes % 60;
  if (lang === 'en') return h ? `${h}h${m ? ` ${m}m` : ''}` : `${minutes}m`;
  return h ? `${(minutes / 60).toFixed(1)} שעות` : `${minutes} ד׳`;
}

// --- track practice -------------------------------------------------------
// One question per lesson (minimum 5); pass = 80% rounded UP; retries are
// unlimited. The question set itself is @core/practice/trackPractice.
export const passFor = (questions: number): number => Math.ceil(questions * 0.8);

// --- the previous 8-lesson build --------------------------------------------
/** l0…l7 → the curriculum lesson that carries that content now. */
export const LEGACY_TO_LESSON: Readonly<Record<string, string>> = Object.fromEntries(
  LESSONS.filter((l) => l.legacyId).map((l) => [l.legacyId!, l.id])
);
export const LESSON_TO_LEGACY: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(LEGACY_TO_LESSON).map(([a, b]) => [b, a])
);
