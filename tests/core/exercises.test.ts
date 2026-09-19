import { describe, it, expect } from 'vitest';
import { EXERCISES, exerciseFor, evaluateGuess } from '@core/lessons/exercises';

const l1 = exerciseFor('l1')!;

describe('guess scoring', () => {
  it('anywhere inside the zone is correct', () => {
    // The target is an AREA. Clicking inside it is exactly right — the old
    // midpoint-distance check unfairly penalised a correct click near an edge.
    expect(evaluateGuess(l1, 163)).toBe('close');
    expect(evaluateGuess(l1, 165.5)).toBe('close');
    expect(evaluateGuess(l1, 168)).toBe('close');
  });

  it('within tolerance of an edge is still correct', () => {
    expect(evaluateGuess(l1, 163 - l1.tolerance)).toBe('close');
    expect(evaluateGuess(l1, 168 + l1.tolerance)).toBe('close');
  });

  it('beyond tolerance is off', () => {
    expect(evaluateGuess(l1, 163 - l1.tolerance - 1)).toBe('off');
    expect(evaluateGuess(l1, 168 + l1.tolerance + 1)).toBe('off');
  });

  it('a guess at the resistance zone is not credited as support', () => {
    // 194 is the OTHER annotated zone — a real misunderstanding, and it must
    // be scored as wrong rather than accidentally passing.
    expect(evaluateGuess(l1, 194)).toBe('off');
  });
});

describe('exercise data', () => {
  it('is bilingual throughout', () => {
    for (const [id, ex] of Object.entries(EXERCISES)) {
      expect(ex.prompt.he && ex.prompt.en, `${id} prompt`).toBeTruthy();
      expect(ex.feedbackClose.he && ex.feedbackClose.en, `${id} close`).toBeTruthy();
      expect(ex.feedbackOff.he && ex.feedbackOff.en, `${id} off`).toBeTruthy();
      for (const zone of ex.annotations) {
        expect(zone.label.he && zone.label.en).toBeTruthy();
        expect(zone.explanation.he.length).toBeGreaterThan(30);
      }
    }
  });

  it('every target sits inside an annotated zone', () => {
    for (const ex of Object.values(EXERCISES)) {
      const match = ex.annotations.find(
        (z) => z.range[0] === ex.target[0] && z.range[1] === ex.target[1]
      );
      expect(match, 'target must correspond to a revealed annotation').toBeTruthy();
    }
  });

  it('returns null for a lesson without an exercise', () => {
    expect(exerciseFor('l0')).toBeNull();
  });
});

describe('annotation-only lessons', () => {
  it('cover the lessons that teach by pointing, not by asking', async () => {
    const { ANNOTATION_LESSONS, annotationsFor } = await import('@core/lessons/exercises');
    expect(Object.keys(ANNOTATION_LESSONS).sort()).toEqual(['l2', 'l3', 'l5']);
    expect(annotationsFor('l2')!.notes.length).toBe(2);
  });

  it('carry authored bilingual explanations, not placeholders', async () => {
    const { ANNOTATION_LESSONS } = await import('@core/lessons/exercises');
    for (const [id, entry] of Object.entries(ANNOTATION_LESSONS)) {
      for (const note of entry.notes) {
        expect(note.label.he && note.label.en, `${id} label`).toBeTruthy();
        expect(note.explanation.he.length, `${id} he body`).toBeGreaterThan(40);
        expect(note.explanation.en.length, `${id} en body`).toBeGreaterThan(40);
      }
    }
  });

  it('a lesson is never both a guess exercise and notes-only', async () => {
    const { ANNOTATION_LESSONS, EXERCISES } = await import('@core/lessons/exercises');
    const overlap = Object.keys(EXERCISES).filter((id) => id in ANNOTATION_LESSONS);
    expect(overlap).toEqual([]);
  });
});
