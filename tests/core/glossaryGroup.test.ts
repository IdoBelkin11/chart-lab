import { describe, it, expect } from 'vitest';
import { highlightGlossaryGroup } from '@core/glossary/highlight';

describe('highlightGlossaryGroup', () => {
  it('marks a term appearing in two blocks only in the first', () => {
    const [a, b] = highlightGlossaryGroup(
      ['Resistance is a price area.', 'Resistance eventually breaks.'],
      'en'
    );
    expect(a!.some((s) => s.termId === 'resistance')).toBe(true);
    expect(b!.some((s) => s.termId === 'resistance')).toBe(false);
  });

  it('is pure — repeated calls with the same input give the same output', () => {
    // This is the regression that matters. The first implementation shared a
    // mutable Set across renders via a ref, so the SECOND render marked
    // nothing at all and the glossary silently vanished from the page.
    const input = ['Support holds.', 'Volume confirms it.'];
    const first = highlightGlossaryGroup(input, 'en');
    const second = highlightGlossaryGroup(input, 'en');
    expect(second).toEqual(first);
    expect(first.flat().some((s) => s.termId !== null)).toBe(true);
  });

  it('still reassembles every block to its original text', () => {
    const input = ['Support and resistance.', 'A breakout, then a retest.'];
    const out = highlightGlossaryGroup(input, 'en');
    out.forEach((segs, i) => {
      expect(segs.map((s) => s.text).join('')).toBe(input[i]);
    });
  });
});
