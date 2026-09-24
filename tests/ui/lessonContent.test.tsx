import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react';
import { App } from '@ui/app/App';
import { LESSONS } from '@core/lessons/lessons';
import { LESSON_PROSE, proseFor } from '@core/lessons/prose';
import { LESSON_CHARTS } from '@core/charts/lessonCharts';
import { layoutChartCards, preferredSpan } from '@core/charts/cardLayout';
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

  it('every lesson that teaches from charts shows more than one', () => {
    // This replaces a pair of tests that used l3 as "the single-chart lesson".
    // l1, l3 and l5 each had exactly one example, which meant the three
    // concepts hardest to believe from one picture — that a level is an area
    // and not a line, that a moving average is meaningless without a trend,
    // and that a Fibonacci level is not a floor — were each taught from the
    // single case where the idea works. A second chart per lesson is the
    // counter-example, so the rule is now that there is always one.
    for (const [id, specs] of Object.entries(LESSON_CHARTS)) {
      expect(specs.length, `${id} has only one chart`).toBeGreaterThan(1);
    }
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
  it('the last lesson offers Finish, and cannot page forward', () => {
    location.hash = '#/lesson/l7';
    render(<App />);
    expect(screen.getByRole('button', { name: /סיים את הקורס/ })).toBeTruthy();
    // The forward arrow is DISABLED rather than removed. Removing it used to
    // need an empty spacer element to stop the page count sliding off centre
    // — a placeholder holding a hole open. Keeping the real control and
    // disabling it says the same thing to a screen reader and needs no
    // phantom sibling.
    const forward = screen.getByRole('button', { name: /שיעור הבא/ }) as HTMLButtonElement;
    expect(forward.disabled).toBe(true);
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
    const forward = screen.getByRole('button', { name: /שיעור הבא/ }) as HTMLButtonElement;
    expect(forward.disabled).toBe(false);
    expect(screen.queryByRole('button', { name: /סיים את הקורס/ })).toBeNull();
  });

  it('the primary action names the chapter it leads to, not just "next"', () => {
    // The pager arrow and the primary button do the same thing, so if they
    // also read the same they are two controls saying one word. The button
    // carries the destination; that is what makes it worth its weight.
    location.hash = '#/lesson/l3';
    const { container } = render(<App />);
    const next = LESSONS[LESSONS.findIndex((l) => l.id === 'l3') + 1]!;
    // Scoped to the footer: the rail lists every chapter by the same label, so
    // an unscoped query matches the roadmap entry too.
    const footer = container.querySelector('footer')!;
    expect(within(footer).getByRole('button', { name: new RegExp(next.navLabel.he) })).toBeTruthy();
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
    ['l7', /תחתית כפולה/, /קו הצוואר/],
    // l2 was added later, on a different criterion than the four above. Its
    // quiz IS answerable from the lesson — the annotation note explains what a
    // volume spike signals, which is what the question asks. What the lesson
    // never did was say what volume IS: the word appears three times in
    // visible copy (intro and chart note) without once stating that it counts
    // shares changing hands. A comprehension gap rather than a quiz gap.
    ['l2', /נפח מסחר/, /עברו יד/]
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
    // l1/l3/l5 were audited too and found already covered — by the annotation
    // notes for l3/l5, and by prose alone for l1. No invented content for
    // lessons that did not need any: l3 in particular was checked again and
    // deliberately left alone, because the only undefined terms on it (EMA,
    // SMA) appear solely in the chart's accessible label, never in copy a
    // reader sees — explaining acronyms that are not on screen would add
    // confusion, not clarity.
    for (const lessonId of ['l1', 'l3', 'l5']) {
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

  it('no card is ever left alone at half width in its row', () => {
    // These three tests replace a set that pinned `spanFullCentered` — a card
    // that took the whole row but stayed narrow and centred inside it. It was
    // added so a leftover card would not sit beside a gap, and it is exactly
    // what made a lesson read as "one wide chart, and a smaller one underneath
    // it" with no reason a reader could see. A card that takes the row now
    // uses it; the guarantee being kept is only that nothing is stranded.
    for (const lessonId of ['l4', 'l6', 'l7', 'l1', 'l2'] as const) {
      cleanup();
      location.hash = `#/lesson/${lessonId}`;
      render(<App />);
      const spans = [...document.querySelectorAll('figure[class*="card"]')].map((c) =>
        /spanFull/.test(c.className) ? 'full' : 'half'
      );
      // Walk the rows the grid will build and check no half card is alone.
      let column = 0;
      spans.forEach((s, i) => {
        if (s === 'full') { column = 0; return; }
        if (column === 0) {
          expect(spans[i + 1], `${lessonId} card ${i} has no partner`).toBe('half');
          column = 1;
        } else {
          column = 0;
        }
      });
    }
  });

  it('a chart keeps the same width wherever it appears', () => {
    // The old rule derived width from position, so the identical chart could
    // be full-width in one lesson and half in another purely because of how
    // many siblings it had. Width now comes from the series itself.
    const longSeries = LESSON_CHARTS.l3![0]!;   // 260 candles — a trend
    const illustration = LESSON_CHARTS.l4![1]!; // ~20 candles — one pattern
    expect(preferredSpan(longSeries)).toBe('full');
    expect(preferredSpan(illustration)).toBe('half');
  });

  it('the exercise card takes the whole row, since it holds two things', () => {
    expect(layoutChartCards(LESSON_CHARTS.l1!, { hasAside: true })[0]).toBe('full');
  });
});
