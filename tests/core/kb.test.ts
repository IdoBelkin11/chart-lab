import { describe, it, expect } from 'vitest';
import { KB, kbById, kbFacetsOf } from '@core/ai/kb/index.js';
import { KB_TEACHING } from '@core/ai/kb/teaching.js';

describe('KB composition (ported to ESM)', () => {
  it('never drops below the full entry count carried over from the legacy build', () => {
    // 164 is the migration-completeness floor, not a target. It was 165:
    // two files each independently defined a full 'risk-reward-ratio' entry
    // — found via the topic browser rendering it as two identical buttons,
    // confirmed by grepping every kb/*.js file for the id. One copy was kept
    // (the more complete of the two, in focused.js); its related links were
    // merged from both before the other was deleted. See kbCoverage.test.ts's
    // "KB entry ids are unique" for the guard against that recurring.
    //
    // A floor rather than an exact count, because this test is here to catch
    // entries going MISSING. Pinning it exactly meant every added topic
    // failed a test about a migration it had nothing to do with, which
    // teaches the reflex of editing the number without reading why it exists.
    expect(KB.length).toBeGreaterThanOrEqual(164);
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

  it('every teaching block is attached to a topic that exists', () => {
    // A typo in a key here fails silently — the block is simply never
    // attached, and the answer comes out one paragraph shorter with nothing
    // to indicate anything was meant to be there.
    for (const id of Object.keys(KB_TEACHING)) {
      expect(kbById(id), `teaching block for unknown topic "${id}"`).toBeTruthy();
    }
  });

  it('teaching blocks open with the words the renderer keys on', () => {
    // AiAnswer decides a block's colour from its opening words. A caveat that
    // starts any other way renders as an ordinary paragraph — it still reads
    // correctly, which is exactly why the loss would go unnoticed.
    for (const [id, blocks] of Object.entries(KB_TEACHING)) {
      if (blocks.caveat) {
        expect(blocks.caveat.he, id).toMatch(/^שימו לב/);
        expect(blocks.caveat.en, id).toMatch(/^Watch out/);
      }
      if (blocks.bottomLine) {
        expect(blocks.bottomLine.he, id).toMatch(/^בשורה התחתונה/);
        expect(blocks.bottomLine.en, id).toMatch(/^Bottom line/);
      }
    }
  });
});
