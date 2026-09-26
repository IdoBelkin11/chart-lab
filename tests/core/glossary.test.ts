import { describe, it, expect } from 'vitest';
import { highlightGlossary } from '@core/glossary/highlight';
import { GLOSSARY, GLOSSARY_CATEGORY_ORDER, glossaryTerm, searchGlossary } from '@core/glossary/terms';
import { TRACK_INFO } from '@core/curriculum/trackInfo';
import { lessonsOf } from '@core/curriculum/curriculum';
import { lessonContent } from '@core/lessons/content';
import type { TrackId } from '@core/curriculum/data';

describe('glossary terms', () => {
  it('every term is bilingual with at least one surface form per language', () => {
    for (const term of GLOSSARY) {
      expect(term.he.length, term.id).toBeGreaterThan(0);
      expect(term.en.length, term.id).toBeGreaterThan(0);
      expect(term.def.he, term.id).toBeTruthy();
      expect(term.def.en, term.id).toBeTruthy();
    }
  });
  it('ids are unique', () => {
    const ids = GLOSSARY.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('looks up by id and returns undefined for unknown', () => {
    expect(glossaryTerm('support')?.id).toBe('support');
    expect(glossaryTerm('does-not-exist')).toBeUndefined();
  });
});

describe('highlightGlossary — English', () => {
  it('returns a single plain segment when nothing matches', () => {
    const segments = highlightGlossary('Just an ordinary sentence.', 'en');
    expect(segments).toEqual([{ text: 'Just an ordinary sentence.', termId: null }]);
  });
  it('marks a known term with a real word boundary', () => {
    const segments = highlightGlossary('Support is a price area worth watching.', 'en');
    expect(segments[0]).toEqual({ text: 'Support', termId: 'support' });
  });
  it('does not match a term inside a longer, unrelated word', () => {
    const segments = highlightGlossary('This trending topic is popular.', 'en');
    expect(segments.every((s) => s.termId === null)).toBe(true);
  });
  it('only marks the first occurrence of a repeated term', () => {
    const segments = highlightGlossary('Resistance holds. Later, resistance breaks.', 'en');
    const marked = segments.filter((s) => s.termId === 'resistance');
    expect(marked.length).toBe(1);
  });
  it('prefers the longer overlapping phrase', () => {
    const segments = highlightGlossary('A moving average smooths price.', 'en');
    const marked = segments.find((s) => s.termId === 'moving-average');
    expect(marked?.text.toLowerCase()).toBe('moving average');
  });
  it('reassembles to the original text', () => {
    const text = 'RSI above 70 is called overbought, below 30 oversold.';
    const segments = highlightGlossary(text, 'en');
    expect(segments.map((s) => s.text).join('')).toBe(text);
  });
});

describe('highlightGlossary — Hebrew', () => {
  it('matches a term with an attached prefix', () => {
    const segments = highlightGlossary('ההתנגדות נפרצת ואז נבדקת.', 'he');
    expect(segments[0]).toEqual({ text: 'ההתנגדות', termId: 'resistance' });
  });
  it('matches the bare form without a prefix', () => {
    const segments = highlightGlossary('תמיכה היא אזור מחיר.', 'he');
    expect(segments[0]).toEqual({ text: 'תמיכה', termId: 'support' });
  });
  it('reassembles to the original text', () => {
    const text = 'ה-RSI נע מעל 70, שנקרא קניית יתר.';
    const segments = highlightGlossary(text, 'he');
    expect(segments.map((s) => s.text).join('')).toBe(text);
  });
});

describe('the expanded term set', () => {
  it('every term carries a category', () => {
    for (const term of GLOSSARY) {
      expect(GLOSSARY_CATEGORY_ORDER, term.id).toContain(term.cat);
    }
  });

  it('every category in the display order is actually used', () => {
    // A heading that can never render is dead weight on the page.
    for (const cat of GLOSSARY_CATEGORY_ORDER) {
      expect(GLOSSARY.some((t) => t.cat === cat), cat).toBe(true);
    }
  });

  it('covers the beginner vocabulary the lessons assume', () => {
    const ids = new Set(GLOSSARY.map((t) => t.id));
    for (const id of ['stock', 'index', 'dividend', 'volatility', 'pe-ratio', 'diversification']) {
      expect(ids.has(id), id).toBe(true);
    }
  });

  it('holds no stray non-Hebrew letters in the Hebrew forms', () => {
    // A copy-paste slip once put Arabic characters inside a Hebrew word,
    // which typechecks perfectly and silently never matches anything.
    const arabic = /[\u0600-\u06FF]/;
    for (const term of GLOSSARY) {
      for (const form of term.he) {
        expect(arabic.test(form), `${term.id}: ${form}`).toBe(false);
      }
    }
  });

  it('definitions are real sentences, not stubs', () => {
    for (const term of GLOSSARY) {
      expect(term.def.he.length, `${term.id} he`).toBeGreaterThan(30);
      expect(term.def.en.length, `${term.id} en`).toBeGreaterThan(30);
    }
  });
});

describe('searchGlossary', () => {
  it('returns everything for an empty query', () => {
    expect(searchGlossary('', 'he').length).toBe(GLOSSARY.length);
  });

  it('matches a surface form in either language', () => {
    expect(searchGlossary('dividend', 'en').map((t) => t.id)).toContain('dividend');
    expect(searchGlossary('דיבידנד', 'he').map((t) => t.id)).toContain('dividend');
  });

  it('matches text inside a definition', () => {
    expect(searchGlossary('ownership', 'en').map((t) => t.id)).toContain('stock');
  });

  it('is case-insensitive', () => {
    expect(searchGlossary('ETF', 'en').map((t) => t.id)).toContain('etf');
    expect(searchGlossary('etf', 'en').map((t) => t.id)).toContain('etf');
  });

  it('returns nothing for a query that matches nothing', () => {
    expect(searchGlossary('zzzzqqq', 'he')).toEqual([]);
  });
});

describe('Hebrew matching does not cross into an unrelated word', () => {
  // Both cases below were reported from real use, not invented: Ido found
  // them by reading the actual rendered lesson pages.
  it('does not match "התיק" (portfolio) as a prefix of "התיקון" (the correction)', () => {
    const segments = highlightGlossary('תיקון פיבונאצ׳י מסמן את התיקון כאחוז', 'he');
    const marked = segments.filter((s) => s.termId !== null);
    for (const m of marked) {
      expect(m.termId, `matched "${m.text}"`).not.toBe('portfolio');
    }
  });
  it('does not match "מדד" (index) inside "הנמדדת" (measured), a different word from the same root', () => {
    const segments = highlightGlossary('התנועה הנמדדת אחרי הפריצה', 'he');
    const marked = segments.filter((s) => s.termId !== null);
    for (const m of marked) {
      expect(m.termId, `matched "${m.text}"`).not.toBe('index');
    }
  });
  it('still matches a bare prefixed form when it is a real, whole word', () => {
    // The fix must not cost the legitimate case it exists to still allow.
    const segments = highlightGlossary('התיק שלי גדל השנה', 'he');
    expect(segments[0]).toEqual({ text: 'התיק', termId: 'portfolio' });
  });
  it('still matches "מדד" as its own real word', () => {
    const segments = highlightGlossary('המדד עלה היום', 'he');
    expect(segments[0]).toEqual({ text: 'המדד', termId: 'index' });
  });
});

describe('measured move', () => {
  it('matches the full concept, not a fragment of it', () => {
    const segments = highlightGlossary(
      'טכניקה נפוצה (וגסה) היא "התנועה הנמדדת": לוקחים את הגובה',
      'he'
    );
    const marked = segments.find((s) => s.termId === 'measured-move');
    expect(marked?.text).toBe('התנועה הנמדדת');
  });
});

describe('the glossary keeps up with the curriculum', () => {
  // A finished track's completion screen says "Now in your glossary" and lists
  // terms; each written track must actually deliver them. Unwritten tracks are
  // exempt until their lessons land — then this fails until the terms do too.
  const norm = (s: string) => s.toLowerCase().replace(/[-/]/g, ' ');
  const has = (w: string, lang: 'he' | 'en') => GLOSSARY.some((g) => g[lang].some((f) => norm(f) === norm(w)));
  const written = Object.keys(TRACK_INFO).filter((t) => lessonsOf(t as TrackId).every((l) => lessonContent(l.id)));

  it.each(written)('track %s: every term its completion screen promises is in the glossary', (t) => {
    const { terms } = TRACK_INFO[t as TrackId];
    for (const lang of ['he', 'en'] as const) expect(terms[lang].filter((w) => !has(w, lang)), lang).toEqual([]);
  });

  it('Risk prose meets its new terms where it teaches them', () => {
    expect(highlightGlossary('המתאם בין שתי המניות גבוה', 'he').find((s) => s.termId)?.termId).toBe('correlation');
    expect(highlightGlossary('Rebalancing means buying what fell', 'en')[0]?.termId).toBe('rebalancing');
    // "מרווח ביטחון" is its own idea, not the bid–ask spread.
    expect(highlightGlossary('ומשאירים מרווח ביטחון', 'he').find((s) => s.termId)?.termId).toBe('margin-of-safety');
  });

  it("Macro's terms do not swallow the longer ones they sit inside", () => {
    // "ריבית" (interest rate) is Macro's; "ריבית דריבית" stays compound interest.
    expect(highlightGlossary('כוחה של ריבית דריבית', 'he').find((s) => s.termId)?.termId).toBe('compound-interest');
    expect(highlightGlossary('הריבית עלתה', 'he')[0]?.termId).toBe('interest-rate');
    expect(highlightGlossary('The yield curve inverted', 'en').find((s) => s.termId)?.termId).toBe('yield-curve');
    expect(highlightGlossary('the news was priced in', 'en').find((s) => s.termId)?.termId).toBe('priced-in');
  });
});
