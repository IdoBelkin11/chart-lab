import { describe, it, expect } from 'vitest';
import { KB, kbById, kbFacetsOf } from '@core/ai/kb/index.js';

describe('KB composition (ported to ESM)', () => {
  it('preserves the full entry count from the legacy build, minus one confirmed duplicate', () => {
    // Was 165 (the original migration-completeness count). Two files each
    // independently defined a full 'risk-reward-ratio' entry — found via
    // the topic browser rendering it as two identical buttons, confirmed
    // by grepping every kb/*.js file for the id. One copy was kept (the
    // more complete of the two, in focused.js); its related links were
    // merged from both before the other was deleted. See
    // kbCoverage.test.ts's "KB entry ids are unique" for the guard against
    // this recurring.
    expect(KB.length).toBe(164);
  });
  it('keeps the facet layer intact', () => {
    expect(KB.filter((e) => e.parent).length).toBe(10);
  });
  it('every facet points at a real parent', () => {
    for (const f of KB.filter((e) => e.parent)) {
      expect(kbById(f.parent!), `parent of ${f.id}`).toBeTruthy();
    }
  });
  it('every entry is bilingual', () => {
    expect(KB.every((e) => !!e.he && !!e.en)).toBe(true);
  });
  it('attaches the shared example bank', () => {
    expect(KB.filter((e) => e.examples).length).toBeGreaterThanOrEqual(19);
  });
  it('does not overwrite examples an entry declares inline', () => {
    const gc = kbById('golden-cross');
    expect(gc?.examples).toBeTruthy();
  });
  it('resolves facets of a parent', () => {
    const ma = kbFacetsOf('moving-averages').map((e) => e.id);
    expect(ma).toContain('golden-cross');
    expect(ma).toContain('death-cross');
  });
  it('lookup is by id and returns undefined for unknown', () => {
    expect(kbById('rsi')?.id).toBe('rsi');
    expect(kbById('does-not-exist')).toBeUndefined();
  });
  it('MACD remains removed as a learning topic', () => {
    expect(kbById('macd')).toBeUndefined();
  });
});
