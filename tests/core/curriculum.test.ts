import { describe, it, expect } from 'vitest';
import { KB } from '@core/ai/kb/index';
import {
  LESSONS, TRACKS, TOTAL_LESSONS, lessonById, lessonsOf, nextInTrack, passFor,
  LEGACY_TO_LESSON, LESSON_TO_LEGACY, trackMinutes
} from '@core/curriculum/curriculum';
import { LESSONS as OLD_LESSONS } from '@core/lessons/lessons';
import { recommend, pathFor } from '@core/curriculum/recommend';
import type { OnboardingAnswers } from '@core/curriculum/recommend';

describe('curriculum shape', () => {
  it('has the approved 6 tracks and 47 lessons', () => {
    expect(TRACKS.map((t) => t.id)).toEqual(['F', 'T', 'P', 'R', 'M', 'D']);
    expect(TOTAL_LESSONS).toBe(47);
    expect(TRACKS.map((t) => lessonsOf(t.id).length)).toEqual([5, 12, 9, 8, 7, 6]);
  });

  it('every lesson id is unique and every module points at a real lesson of its own track', () => {
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(LESSONS.length);
    for (const t of TRACKS) for (const m of t.modules) for (const id of m.lessons) {
      expect(lessonById(id)?.track, id).toBe(t.id);
    }
  });

  it('derivatives are hard-locked behind risk; the rest only recommend foundations', () => {
    expect(TRACKS.find((t) => t.id === 'D')!.prereq).toEqual({ hard: 'R' });
    for (const id of ['T', 'P', 'R', 'M']) expect(TRACKS.find((t) => t.id === id)!.prereq).toEqual({ soft: 'F' });
    expect(TRACKS.find((t) => t.id === 'F')!.prereq).toBeNull();
  });

  it('every lesson is bilingual, timed and tied to knowledge-base topics that exist', () => {
    const kb = new Set(KB.map((e) => e.id));
    for (const l of LESSONS) {
      expect(l.title.he && l.title.en, l.id).toBeTruthy();
      expect(l.minutes, l.id).toBeGreaterThan(0);
      for (const k of l.kbTopics) expect(kb.has(k), `${l.id} → ${k}`).toBe(true);
    }
  });

  it('a lesson that has step titles has exactly seven, in both languages, none of them generic', () => {
    const generic = /^(לומדים|מבינים|דוגמה|מנסים|משוב|מסכמים|ממשיכים|Learn|Understand|Example|Try|Feedback|Takeaway|Continue)$/;
    for (const l of LESSONS.filter((x) => x.steps)) {
      expect(l.steps!.he.length, l.id).toBe(7);
      expect(l.steps!.en.length, l.id).toBe(7);
      for (const s of [...l.steps!.he, ...l.steps!.en]) expect(s, l.id).not.toMatch(generic);
    }
  });

  it('next-in-track walks modules in order and stops at the track end', () => {
    expect(nextInTrack('T3')?.id).toBe('T4');
    expect(nextInTrack('T12')).toBeNull();
  });

  it('practice passes at 80% rounded up', () => {
    expect([passFor(5), passFor(12), passFor(7), passFor(3)]).toEqual([4, 10, 6, 3]);
  });

  it('track time is the sum of its lessons', () => {
    expect(trackMinutes('F')).toBe(lessonsOf('F').reduce((s, l) => s + l.minutes, 0));
  });
});

describe('the previous 8-lesson build maps onto the curriculum', () => {
  it('every old lesson has exactly one new home, as approved', () => {
    expect(LEGACY_TO_LESSON).toEqual({ l0: 'F1', l1: 'T4', l2: 'T5', l3: 'T6', l4: 'T2', l5: 'T9', l6: 'T7', l7: 'T10' });
    for (const old of OLD_LESSONS) expect(LEGACY_TO_LESSON[old.id], old.id).toBeTruthy();
    for (const [a, b] of Object.entries(LEGACY_TO_LESSON)) expect(LESSON_TO_LEGACY[b]).toBe(a);
  });

  it('each old lesson lands on a new lesson that teaches the same knowledge-base topic', () => {
    for (const old of OLD_LESSONS) {
      expect(lessonById(LEGACY_TO_LESSON[old.id]!)!.kbTopics, old.id).toContain(old.kbTopicId);
    }
  });
});

describe('onboarding recommendation', () => {
  const A: OnboardingAnswers = { interests: ['T', 'P'], experience: 'some', goal: 'invest', time: 30 };
  const B: OnboardingAnswers = { interests: ['R'], experience: 'none', goal: 'pension', time: 15 };
  const C: OnboardingAnswers = { interests: ['T', 'D'], experience: 'pro', goal: 'charts', time: 60 };

  it('the three design profiles land on three different tracks', () => {
    expect(recommend(A).top).toBe('P');
    expect(recommend(B).top).toBe('R');
    expect(recommend(C).top).toBe('T');
  });

  it('experience decides how Foundations fits, never which track wins', () => {
    expect(recommend(A).base).toBe('recommended');
    expect(recommend(B).base).toBe('required');
    expect(recommend(C).base).toBe('optional');
    expect(recommend({ ...A, experience: 'pro' }).top).toBe(recommend(A).top);
  });

  it('asking for options routes through Risk, since derivatives are locked behind it', () => {
    const r = recommend({ interests: ['D'], experience: null, goal: null, time: null });
    expect(r.top).toBe('R');
    expect(r.wantsDerivatives).toBe(true);
  });

  it('ties keep the design order P, R, T, M', () => {
    expect(recommend({ interests: [], experience: null, goal: null, time: null }).order).toEqual(['P', 'R', 'T', 'M']);
  });

  it('weeks follow the chosen pace', () => {
    expect(recommend(A).weeks.P).toBe(Math.ceil(trackMinutes('P') / 30));
    expect(recommend(B).weeks.R).toBe(Math.ceil(trackMinutes('R') / 15));
  });

  it('the path starts with Foundations unless it can be skipped, and always ends with Derivatives', () => {
    expect(pathFor(A)).toEqual(['F', 'P', 'T', 'R', 'M', 'D']);
    expect(pathFor(C)[0]).toBe('T');
    expect(pathFor(C).at(-1)).toBe('D');
  });
});
