import { describe, it, expect } from 'vitest';
import { resolveCurrentTopic, nextLessonId } from '@core/lessons/currentTopic';
import { LESSONS } from '@core/lessons/lessons';

const base = { lang: 'en' as const };

describe('canonical current-topic resolution', () => {
  it('explicit beats everything', () => {
    const t = resolveCurrentTopic({ ...base, explicitLessonId: 'l1', activeLessonId: 'l6', progress: { lastVisited: 'l3' } });
    expect(t?.lessonId).toBe('l1');
    expect(t?.source).toBe('explicit');
  });
  it('the open lesson wins over history', () => {
    const t = resolveCurrentTopic({ ...base, activeLessonId: 'l6', progress: { lastVisited: 'l3' } });
    expect(t?.lessonId).toBe('l6');
    expect(t?.source).toBe('active-lesson');
  });
  it('falls back to last visited only when nothing is open', () => {
    const t = resolveCurrentTopic({ ...base, progress: { lastVisited: 'l3' } });
    expect(t?.source).toBe('last-visited');
  });
  it('returns null when there is nothing to resolve', () => {
    expect(resolveCurrentTopic({ ...base, progress: { lastVisited: null } })).toBeNull();
  });
  it('ignores an unknown lesson id rather than trusting it', () => {
    const t = resolveCurrentTopic({ ...base, explicitLessonId: 'nope', activeLessonId: 'l2' });
    expect(t?.lessonId).toBe('l2');
  });
  it('carries the KB topic so the AI and quiz cannot disagree', () => {
    expect(resolveCurrentTopic({ ...base, activeLessonId: 'l6' })?.kbTopicId).toBe('rsi');
    expect(resolveCurrentTopic({ ...base, activeLessonId: 'l3' })?.kbTopicId).toBe('moving-averages');
  });
  it('labels follow the language', () => {
    expect(resolveCurrentTopic({ lang: 'he', activeLessonId: 'l0' })?.label).toBe('יסודות');
    expect(resolveCurrentTopic({ lang: 'en', activeLessonId: 'l0' })?.label).toBe('Basics');
  });
});

describe('next lesson', () => {
  it('is the first incomplete one', () => {
    expect(nextLessonId(['l0', 'l1'])).toBe('l2');
  });
  it('is null once the course is finished', () => {
    expect(nextLessonId(LESSONS.map((l) => l.id))).toBeNull();
  });
});
