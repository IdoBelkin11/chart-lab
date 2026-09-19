import { describe, it, expect } from 'vitest';
import { KB } from '@core/ai/kb/index';
import { generateAiReply, createConversationContext } from '@core/ai/index';

// ---------------------------------------------------------------------------
// Coverage sweep: EVERY keyword of EVERY KB entry, asked as its own question,
// must resolve back to the entry that owns it — or to a documented exception
// below. This is exhaustive on purpose: the bugs it exists to catch (a
// missing `priority` letting a generic sibling steal a specific entry's own
// authored trigger phrase) only show up on the exact phrasing the author
// wrote, which a handful of spot-check questions will not reliably hit.
//
// Found this way, and fixed rather than worked around: a missing import
// that crashed on any moving-average-period question; two bare-English-word
// ticker aliases ("cost" -> Costco, "target" -> Target Corp) hijacking
// ordinary phrases like "dollar cost averaging" and "price target"; and
// eleven specificity bugs where a specific entry lost to a generic sibling
// on its OWN keyword, fixed with the same `priority` mechanism the facet
// layer already established (see kb/facets.js).
// ---------------------------------------------------------------------------

const isHebrew = (s: string) => /[\u0590-\u05FF]/.test(s);
const FALLBACK_HE = 'אין לי תשובה טובה';
const FALLBACK_EN = "don't have a good answer";

/**
 * Keywords that are DELIBERATELY shared between a parent entry and one of
 * its facets — asking with the facet's own specific wording (e.g. "golden
 * cross") is correctly answered by the facet, not by the parent's general
 * overview. This is the exact behaviour `tests/core/ai.test.ts` already
 * pins under "resolves a specific facet, not its parent"; listed here too,
 * explicitly, so a real regression in this sweep is never masked by
 * silently allowing "any KB id" as a passing result.
 */
const FACET_OVERRIDES: Record<string, string> = {
  sma: 'sma',
  ema: 'ema',
  'golden cross': 'golden-cross',
  'death cross': 'death-cross',
  'צלב זהב': 'golden-cross',
  'צלב מוות': 'death-cross',
  'גולדן קרוס': 'golden-cross',
  'דת קרוס': 'death-cross'
};

describe('every KB entry answers its own keywords', () => {
  it('has no fallback and no unexplained mismatch, across every keyword', async () => {
    const fallbacks: string[] = [];
    const mismatches: string[] = [];
    let total = 0;

    for (const entry of KB as Array<{ id: string; kw?: string[] }>) {
      for (const raw of entry.kw ?? []) {
        total++;
        const lang: 'he' | 'en' = isHebrew(raw) ? 'he' : 'en';
        const r = await generateAiReply(raw, lang, null, createConversationContext());
        const isFallback =
          lang === 'he' ? r.text.includes(FALLBACK_HE) : r.text.toLowerCase().includes(FALLBACK_EN);

        if (isFallback) {
          fallbacks.push(`[${lang}] ${entry.id}: "${raw}"`);
          continue;
        }
        const expected = FACET_OVERRIDES[raw] ?? entry.id;
        if (r.topicId !== entry.id && r.topicId !== expected) {
          mismatches.push(`[${lang}] ${entry.id} -> ${r.topicId}: "${raw}"`);
        }
      }
    }

    // A sanity floor on the sweep itself: if the KB shrank to a handful of
    // entries, this test would still pass trivially and stop meaning much.
    expect(total).toBeGreaterThan(1000);
    expect(fallbacks, fallbacks.join('\n')).toEqual([]);
    expect(mismatches, mismatches.join('\n')).toEqual([]);
  });
});

describe('KB entry ids are unique', () => {
  it('has no id defined twice across the KB source files', () => {
    // Found from real use, not a hypothetical: two files each independently
    // authored a full 'risk-reward-ratio' entry. kbById() silently resolved
    // to whichever loaded last, so lookups by id looked fine — but
    // topicsInCategory() filters the raw KB array without deduping, so the
    // topic browser rendered the SAME entry as two separate buttons with
    // identical text. A same-id mismatch would also have been invisible to
    // the sweep above, since entry.id is identical for both duplicate
    // objects — this is the test that actually catches it.
    const ids = (KB as Array<{ id: string }>).map((e) => e.id);
    const seen = new Set<string>();
    const dupes: string[] = [];
    for (const id of ids) {
      if (seen.has(id)) dupes.push(id);
      seen.add(id);
    }
    expect(dupes).toEqual([]);
  });
});
