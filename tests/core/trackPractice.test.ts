import { describe, it, expect } from 'vitest';
import { practiceItems, practicePass, writtenLessons } from '@core/practice/trackPractice';
import { lessonsOf } from '@core/curriculum/curriculum';

describe('track practice (written lessons only, decided 2026-09-25)', () => {
  it('asks one question per written lesson, in lesson order', () => {
    const items = practiceItems('T', 1);
    expect(items.map((i) => i.lessonId)).toEqual(writtenLessons('T').map((l) => l.id));
    const order = lessonsOf('T').map((l) => l.id);
    expect(items.map((i) => order.indexOf(i.lessonId))).toEqual([...items.map((i) => order.indexOf(i.lessonId))].sort((a, b) => a - b));
    expect(practicePass(items)).toBe(Math.ceil(items.length * 0.8));
  });

  it('a retry asks different questions on the same lessons', () => {
    const a = practiceItems('T', 1), b = practiceItems('T', 2);
    expect(b.map((i) => i.lessonId)).toEqual(a.map((i) => i.lessonId));
    a.forEach((x, k) => expect(b[k]!.question.id).not.toBe(x.question.id));
  });

  it('Foundations asks one question from each of its five lessons, never repeating one', () => {
    const f = practiceItems('F', 1);
    expect(f.map((i) => i.lessonId)).toEqual(['F1', 'F2', 'F3', 'F4', 'F5']);
    expect(new Set(f.map((i) => i.question.id)).size).toBe(5);
    expect(practicePass(f)).toBe(4);
  });

  it('a track with nothing written has no questions', () => {
    expect(practiceItems('R', 1)).toEqual([]);
  });
});
