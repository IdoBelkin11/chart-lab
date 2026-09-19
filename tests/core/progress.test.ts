import { describe, it, expect } from 'vitest';
import {
  EMPTY_PROGRESS, readProgress, writeProgress, isValidProgress,
  markVisited, markCompleted, toggleCompleted, lessonState
} from '@core/progress/progress';
import type { StorageAdapter } from '@core/progress/progress';

function memoryStorage(seed?: string): StorageAdapter {
  let v = seed ?? null;
  return { read: () => v, write: (_k, value) => { v = value; } };
}

describe('progress transitions are pure', () => {
  it('visiting does not complete', () => {
    const p = markVisited(EMPTY_PROGRESS, 'l1');
    expect(p.visited).toEqual(['l1']);
    expect(p.completed).toEqual([]);
    expect(lessonState(p, 'l1')).toBe('learning');
  });
  it('completing also marks visited', () => {
    const p = markCompleted(EMPTY_PROGRESS, 'l2');
    expect(p.completed).toContain('l2');
    expect(p.visited).toContain('l2');
    expect(lessonState(p, 'l2')).toBe('completed');
  });
  it('does not mutate its input', () => {
    const before = { ...EMPTY_PROGRESS };
    markCompleted(before, 'l0');
    expect(before.completed).toEqual([]);
  });
  it('does not duplicate on repeat', () => {
    let p = markCompleted(EMPTY_PROGRESS, 'l0');
    p = markCompleted(p, 'l0');
    expect(p.completed).toEqual(['l0']);
  });
  it('toggle removes completion but keeps it visited', () => {
    let p = markCompleted(EMPTY_PROGRESS, 'l3');
    p = toggleCompleted(p, 'l3');
    expect(p.completed).not.toContain('l3');
    expect(lessonState(p, 'l3')).toBe('learning');
  });
  it('unknown lessons are not-started', () => {
    expect(lessonState(EMPTY_PROGRESS, 'l7')).toBe('not-started');
  });
});

describe('storage is validated, never trusted', () => {
  it('round-trips', () => {
    const s = memoryStorage();
    writeProgress(s, markCompleted(EMPTY_PROGRESS, 'l1'));
    expect(readProgress(s).completed).toEqual(['l1']);
  });
  it('corrupt JSON falls back instead of throwing', () => {
    expect(readProgress(memoryStorage('{not json'))).toEqual(EMPTY_PROGRESS);
  });
  it('wrong shape falls back', () => {
    expect(readProgress(memoryStorage('{"completed":"nope"}'))).toEqual(EMPTY_PROGRESS);
  });
  it('migrates saves written before `visited` existed', () => {
    const p = readProgress(memoryStorage('{"completed":["l0"],"lastVisited":"l0"}'));
    expect(p.completed).toEqual(['l0']);
    expect(p.visited).toEqual([]);
  });
  it('validator rejects junk', () => {
    expect(isValidProgress(null)).toBe(false);
    expect(isValidProgress({ completed: [1] })).toBe(false);
    expect(isValidProgress({ completed: [], visited: [], lastVisited: null })).toBe(true);
  });
  it('a failing storage write does not throw', () => {
    const boom: StorageAdapter = { read: () => null, write: () => { throw new Error('quota'); } };
    expect(() => writeProgress(boom, EMPTY_PROGRESS)).not.toThrow();
  });
});
