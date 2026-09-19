import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { App } from '@ui/app/App';
import { LESSONS } from '@core/lessons/lessons';
import { LESSON_PROSE, proseFor } from '@core/lessons/prose';
import { LESSON_CHARTS } from '@core/charts/lessonCharts';
import { annotationsFor } from '@core/lessons/exercises';

beforeEach(() => {
  cleanup();
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
});

/**
 * Matches the single <p> whose FULL text is the given prose.
 *
 * Lesson prose renders with glossary terms wrapped in <button>s, so it is
 * legitimately split across child elements and the default text matcher —
 * which only sees an element's direct text nodes — cannot find it. Comparing
 * the paragraph's whole textContent asserts exactly what these tests always
 * asserted: the complete authored prose is on screen, uncollapsed.
 */
const wholeParagraph = (text: string) => (_: string, el: Element | null) =>
  el?.tagName === 'P' && el.textContent === text;

describe('lesson prose ported verbatim', () => {
  it('every lesson has authored prose', () => {
    for (const lesson of LESSONS) {
      expect(proseFor(lesson.id), lesson.id).toBeTruthy();
    }
  });

  it('prose is bilingual and substantial, not a stub', () => {
    for (const [id, prose] of Object.entries(LESSON_PROSE)) {
      expect(prose.intro.he.length, `${id} he intro`).toBeGreaterThan(60);
      expect(prose.intro.en.length, `${id} en intro`).toBeGreaterThan(60);
    }
  });

  it('the "worth knowing" block survived for every lesson', () => {
    for (const [id, prose] of Object.entries(LESSON_PROSE)) {
      expect(prose.deeper.he.length, `${id} he deeper`).toBeGreaterThan(60);
      expect(prose.deeper.en.length, `${id} en deeper`).toBeGreaterThan(60);
    }
  });
});

describe('lesson page renders its content', () => {
  it('shows the intro and the deeper block together, nothing collapsed', () => {
    location.hash = '#/lesson/l1';
    render(<App />);
    const prose = proseFor('l1')!;
    expect(screen.getByText(wholeParagraph(prose.intro.he))).toBeTruthy();
    // The collapse control was removed — both blocks are visible at once.
    expect(screen.getByText(wholeParagraph(prose.deeper.he))).toBeTruthy();
    expect(screen.getByText('כדאי לדעת')).toBeTruthy();
  });

  it('switches prose language without losing the lesson', () => {
    localStorage.setItem('chartlab.lang', 'en');
    location.hash = '#/lesson/l2';
    render(<App />);
    expect(screen.getByText(wholeParagraph(proseFor('l2')!.intro.en))).toBeTruthy();
  });
});

describe('chart coverage', () => {
  it('most lessons now have at least one chart', () => {
    expect(Object.keys(LESSON_CHARTS).length).toBeGreaterThanOrEqual(7);
  });

  it('lessons whose prose promises several examples show several charts', () => {
    // l4's intro says "in each chart below" (plural), l6's says "the FIRST
    // example below" (implying more), l7 covers 5 distinct pattern shapes.
    expect(LESSON_CHARTS.l4?.length).toBe(5);
    expect(LESSON_CHARTS.l6?.length).toBe(3);
    expect(LESSON_CHARTS.l7?.length).toBe(5);
  });

  it('every chart label describes what it SHOWS, not just "chart"', () => {
    for (const [id, specs] of Object.entries(LESSON_CHARTS)) {
      for (const spec of specs) {
        expect(spec.label.he.length, `${id} he`).toBeGreaterThan(25);
        expect(spec.label.en.length, `${id} en`).toBeGreaterThan(25);
        expect(spec.candles.length, `${id} candles`).toBeGreaterThan(0);
      }
    }
  });
});

describe('chart cards', () => {
  it('each chart is a captioned card, not a bare canvas', () => {
    location.hash = '#/lesson/l4';
    render(<App />);
    // A five-chart lesson: the pattern name has to be attached to its own
    // chart. Previously it was a 12px caption floating above a full-width
    // canvas, so label and chart read as unrelated.
    const cards = screen.getAllByRole('figure');
    expect(cards.length).toBe(5);
    // getAllByText, not getByText: each pattern name appears twice on
    // purpose — once as the card's caption and once as the label drawn on
    // the chart itself. Asserting a single match would be asserting that the
    // on-chart label is missing.
    expect(screen.getAllByText(/פטיש/).length).toBeGreaterThan(0);
    // The caption specifically must live inside the card, next to its own
    // chart, which is the whole point of the card.
    expect(cards[0]!.textContent).toMatch(/פטיש/);
    expect(cards[1]!.textContent).toMatch(/כוכב נופל/);
  });

  it('a single-chart lesson still gets a card', () => {
    location.hash = '#/lesson/l3';
    render(<App />);
    expect(screen.getAllByRole('figure').length).toBe(1);
  });

  it('charts are sized per content, not one height for all', () => {
    // A 20-candle single-pattern illustration needs far less vertical room
    // than a 260-candle trend; giving both the same height is what made the
    // candlestick charts feel enormous next to the one candle they point at.
    const heights = Object.values(LESSON_CHARTS).flat().map((s) => s.height);
    expect(heights.every((h) => typeof h === 'number')).toBe(true);
    expect(new Set(heights).size).toBeGreaterThan(1);
    expect(LESSON_CHARTS.l4![0]!.height!).toBeLessThan(LESSON_CHARTS.l5![0]!.height!);
  });

  it('every chart carries a tone and a subcaption', () => {
    for (const [id, specs] of Object.entries(LESSON_CHARTS)) {
      for (const spec of specs) {
        expect(spec.tone, `${id} tone`).toBeTruthy();
        expect(spec.subcaption?.he, `${id} he subcaption`).toBeTruthy();
        expect(spec.subcaption?.en, `${id} en subcaption`).toBeTruthy();
      }
    }
  });
});

describe('moving-averages lesson explains both of its lines', () => {
  it('has a note for the 150 as well as the 20', () => {
    // The purple 150 line was drawn but never explained — the legend only
    // covered the 20, so one of the two lines on screen was unaccounted for.
    const notes = annotationsFor('l3');
    expect(notes).toBeTruthy();
    expect(notes!.notes.length).toBeGreaterThanOrEqual(2);
    const labels = notes!.notes.map((n) => n.label.he).join(' ');
    expect(labels).toMatch(/20/);
    expect(labels).toMatch(/150/);
  });
});

describe('finishing the course', () => {
  it('the last lesson offers Finish instead of a forward arrow', () => {
    location.hash = '#/lesson/l7';
    render(<App />);
    expect(screen.getByRole('button', { name: /סיים את הקורס/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /שיעור הבא/ })).toBeNull();
  });

  it('Finish is locked until every chapter is complete', () => {
    location.hash = '#/lesson/l7';
    render(<App />);
    const finish = screen.getByRole('button', { name: /סיים את הקורס/ }) as HTMLButtonElement;
    expect(finish.disabled).toBe(true);
    // The locked state says how many remain rather than only going grey.
    expect(finish.getAttribute('aria-label')).toMatch(/נותרו/);
  });

  it('Finish unlocks and celebrates once all chapters are complete', () => {
    localStorage.setItem(
      'chartlab.lessonProgress',
      JSON.stringify({ completed: LESSONS.map((l) => l.id), visited: [], lastVisited: null })
    );
    location.hash = '#/lesson/l7';
    render(<App />);
    const finish = screen.getByRole('button', { name: /סיים את הקורס/ }) as HTMLButtonElement;
    expect(finish.disabled).toBe(false);
    fireEvent.click(finish);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText(/סיימת את הלימוד הבסיסי/)).toBeTruthy();
  });

  it('a middle lesson still pages forward normally', () => {
    location.hash = '#/lesson/l3';
    render(<App />);
    expect(screen.getByRole('button', { name: /שיעור הבא/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /סיים את הקורס/ })).toBeNull();
  });
});

describe('chart cards lay out as a grid, not one per screen', () => {
  it('a multi-chart lesson uses the grid track, not a stacked column', () => {
    location.hash = '#/lesson/l4';
    const { container } = render(<App />);
    const stack = container.querySelector('[class*="cardStack"]')!;
    expect(stack).toBeTruthy();
    // A single full-width card per chart turned five candlestick examples
    // into five screens of scrolling, and stretched each chart far wider
    // than the one candle it points at.
    expect(stack.className).not.toMatch(/cardStackSingle/);
  });

  it('a single-chart lesson still takes the full width', () => {
    location.hash = '#/lesson/l3';
    const { container } = render(<App />);
    const stack = container.querySelector('[class*="cardStack"]')!;
    expect(stack.className).toMatch(/cardStackSingle/);
  });

  it('the card carrying the practice panel spans the whole row', () => {
    location.hash = '#/lesson/l1';
    render(<App />);
    const figure = screen.getAllByRole('figure')[0]!;
    expect(figure.className).toMatch(/spanFull/);
  });
});

describe('quiz/lesson alignment audit — content added where the quiz tested something never taught', () => {
  // Found by cross-referencing every quiz question's lesson against that
  // lesson's own prose: l0 tested ETFs and market cap without defining
  // either; l4 tested hammer/engulfing shapes without describing either;
  // l6 tested RSI divergence, never mentioned; l7 tested a double bottom's
  // structure, never described. Each now has a real "extra" block for the
  // gap, additive — the original intro/deeper text is untouched.
  const cases: Array<[string, RegExp, RegExp]> = [
    ['l0', /קרן סל/, /שווי שוק/],
    ['l0', /סימול/, /דיבידנד/],
    ['l4', /פטיש/, /בליעה עולה/],
    ['l6', /דיוורגנס/, /RSI/],
    ['l7', /תחתית כפולה/, /קו הצוואר/]
  ];
  for (const [lessonId, ...patterns] of cases) {
    it(`${lessonId} now teaches what its own quiz questions test`, () => {
      location.hash = `#/lesson/${lessonId}`;
      render(<App />);
      const label = screen.getByText('מושגים נוספים');
      const panel = label.closest('aside')!;
      for (const p of patterns) {
        expect(panel.textContent, `${lessonId}: expected to match ${p}`).toMatch(p);
      }
    });
  }

  it('lessons with no gap render no extra panel at all', () => {
    // l1/l2/l3/l5 were audited too and found already covered — by the
    // annotation notes for l2/l3/l5, and by prose alone for l1. No
    // invented content for lessons that did not need any.
    for (const lessonId of ['l1', 'l2', 'l3', 'l5']) {
      cleanup();
      location.hash = `#/lesson/${lessonId}`;
      render(<App />);
      expect(screen.queryByText('מושגים נוספים'), lessonId).toBeNull();
    }
  });
});

describe('layout fixes from real-use feedback', () => {
  it('"worth knowing" and the extra block sit in one shared row, not stacked separately', () => {
    // Both l0 and l4 have a `deeper` AND an `extra` block — either is a
    // real case of the reported bug (they rendered as two separate stacked
    // asides before this fix).
    location.hash = '#/lesson/l0';
    render(<App />);
    const deeper = document.querySelector('[class*="deeperLabel"]')!;
    const extra = document.querySelector('[class*="extraLabel"]')!;
    expect(deeper).toBeTruthy();
    expect(extra).toBeTruthy();
    const deeperRow = deeper.closest('[class*="notesRow"]');
    const extraRow = extra.closest('[class*="notesRow"]');
    expect(deeperRow).toBeTruthy();
    // The real assertion: the SAME row element, not two different ones.
    expect(deeperRow).toBe(extraRow);
  });

  it('a lesson with an odd number of example charts spans the lone leftover card across the row, centred, rather than leaving it beside empty space', () => {
    // l7 (chart patterns) has 5 examples — the exact case reported.
    location.hash = '#/lesson/l7';
    render(<App />);
    const cards = document.querySelectorAll('figure[class*="card"]');
    expect(cards.length).toBe(5);
    const last = cards[cards.length - 1]!;
    expect(last.className).toMatch(/spanFullCentered/);
    // None of the OTHER four should get it — only the one left alone.
    for (let i = 0; i < cards.length - 1; i++) {
      expect(cards[i]!.className, `card ${i}`).not.toMatch(/spanFullCentered/);
    }
  });

  it('a lone card at the front (from an aside) does not throw off the pairing after it', () => {
    // l2 has 3 example charts, and the FIRST spans the row by itself (it
    // carries the annotation notes) — a naive "is the total odd" check
    // said card 3 was alone too, which was wrong: card 1 already used up
    // its own full row, so cards 2 and 3 pair up cleanly after it.
    location.hash = '#/lesson/l2';
    render(<App />);
    const cards = document.querySelectorAll('figure[class*="card"]');
    expect(cards.length).toBe(3);
    for (const card of Array.from(cards)) {
      expect(card.className).not.toMatch(/spanFullCentered/);
    }
  });

  it('the same odd-gallery fix applies to every lesson with an odd example count, not just the one reported', () => {
    // l4 (candlesticks) and l6 (RSI) turned out to have the identical
    // shape once checked — 5 and 3 plain example charts respectively, no
    // aside — so the same fix that closes the reported l7 gap closes
    // theirs too, found by checking every lesson rather than only l7.
    for (const [lessonId, expectedCount] of [['l4', 5], ['l6', 3]] as const) {
      cleanup();
      location.hash = `#/lesson/${lessonId}`;
      render(<App />);
      const cards = document.querySelectorAll('figure[class*="card"]');
      expect(cards.length, lessonId).toBe(expectedCount);
      expect(cards[cards.length - 1]!.className, lessonId).toMatch(/spanFullCentered/);
    }
  });
});
