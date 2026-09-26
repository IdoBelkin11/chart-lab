// ---------------------------------------------------------------------------
// A track practice's size, for pages that show it without asking it (the track
// page): from which lessons are written, not from their questions — so the
// lessons themselves are not loaded just to count. trackPractice builds the
// actual attempt; a test keeps the two equal for every track.
// ---------------------------------------------------------------------------
import type { CurriculumLesson, TrackId } from '@core/curriculum/curriculum';
import { lessonsOf, passFor } from '@core/curriculum/curriculum';
import { hasContent } from '@core/curriculum/trackInfo';

export const MIN_QUESTIONS = 5;

export function writtenLessons(track: TrackId): CurriculumLesson[] {
  return lessonsOf(track).filter((l) => hasContent(l.id));
}

/**
 * One question per written lesson, topped up to 5. Every written lesson has at
 * least 3 questions of its own, so from 2 written lessons on the top-up always fills.
 * ponytail: assumes 2+ written lessons per track; a track with exactly one would
 * count its bank instead (the equality test flags it).
 */
export function practiceSize(track: TrackId): number {
  const n = writtenLessons(track).length;
  return n ? Math.max(n, MIN_QUESTIONS) : 0;
}

export const practicePassFor = (track: TrackId): number => passFor(practiceSize(track));
