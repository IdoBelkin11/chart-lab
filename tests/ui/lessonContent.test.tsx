import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react';
import { App } from '@ui/app/App';
import { LESSONS } from '@core/lessons/lessons';
import { LESSON_PROSE, proseFor } from '@core/lessons/prose';
import { LESSON_CHARTS } from '@core/charts/lessonCharts';
import { annotationsFor } from '@core/lessons/exercises';
import { WORKSPACE } from '@core/lessons/workspace';
import { LEGACY_TO_LESSON, lessonById } from '@core/curriculum/curriculum';
import { lessonContent } from '@core/lessons/content';

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

/** Opens a lesson step from the lesson bar's loop, by the step's own name. */
function openStep(lessonId: string, index: number) {
  const name = lessonById(lessonId)!.steps!.he[index]!;
  fireEvent.click(within(screen.getByRole('navigation', { name: 'שלבי השיעור' })).getByRole('button', { name }));
}

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

describe('the lesson workspace carries the authored content', () => {
  // The 7-step workspace (approved design) spreads a lesson over steps rather
  // than one long page. Nothing is gated: every step opens from the loop.
  it('step 1 is the intro, step 2 the "worth knowing" block, both in full', () => {
    // F1 is the one lesson still read through the previous build's adapter.
    location.hash = '#/lesson/l0';
    render(<App />);
    const prose = proseFor('l0')!;
    expect(screen.getByText(wholeParagraph(prose.intro.he))).toBeTruthy();
    openStep('F1', 1);
    expect(screen.getByText(wholeParagraph(prose.deeper.he))).toBeTruthy();
    expect(screen.getByText('כדאי לדעת')).toBeTruthy();
  });

  it('switches prose language without losing the lesson', () => {
    localStorage.setItem('chartlab.lang', 'en');
    location.hash = '#/lesson/l0';
    render(<App />);
    expect(screen.getByText(wholeParagraph(proseFor('l0')!.intro.en))).toBeTruthy();
  });

  it('every step of every written lesson names itself after its content, not the pedagogy', () => {
    const generic = /^(לומדים|מבינים|דוגמה|מנסים|משוב|מסכמים|ממשיכים)$/;
    for (const [legacy, id] of Object.entries(LEGACY_TO_LESSON)) {
      const steps = lessonById(id)!.steps!;
      expect(steps.he.length, legacy).toBe(7);
      expect(steps.en.length, legacy).toBe(7);
      for (const s of steps.he) expect(s, `${id}: ${s}`).not.toMatch(generic);
    }
  });

  it('every step a lesson plan points at is a chart that exists', () => {
    for (const [legacy, plan] of Object.entries(WORKSPACE)) {
      const n = LESSON_CHARTS[legacy]?.length ?? 0;
      for (const i of plan.charts.flat()) expect(i, legacy).toBeLessThan(n);
      if (plan.notesStep !== undefined) expect(annotationsFor(legacy), legacy).toBeTruthy();
    }
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
  it('a many-chart lesson shows each chart captioned with its own name', () => {
    location.hash = '#/lesson/l4';
    render(<App />);
    openStep('T2', 2);
    // Five candlestick patterns in the examples step: the pattern name has to
    // be attached to its own chart, not float above a row of canvases.
    const cards = screen.getAllByRole('figure');
    expect(cards.length).toBe(5);
    expect(cards[0]!.textContent).toMatch(/פטיש/);
    expect(cards[1]!.textContent).toMatch(/כוכב נופל/);
  });

  it('every lesson that teaches from charts shows more than one', () => {
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

  it('every chart the lesson has is shown on some step', () => {
    for (const [legacy, specs] of Object.entries(LESSON_CHARTS)) {
      const shown = new Set(WORKSPACE[legacy]!.charts.flat());
      specs.forEach((_, i) => expect(shown.has(i), `${legacy} chart ${i} never shown`).toBe(true));
    }
  });

  it('charts are sized per content, not one height for all', () => {
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
    // The 150 line was drawn but never explained — the legend only covered
    // the 20, so one of the two lines on screen was unaccounted for.
    const notes = annotationsFor('l3');
    expect(notes).toBeTruthy();
    expect(notes!.notes.length).toBeGreaterThanOrEqual(2);
    const labels = notes!.notes.map((n) => n.label.he).join(' ');
    expect(labels).toMatch(/20/);
    expect(labels).toMatch(/150/);
  });
});

describe('finishing a lesson', () => {
  // Replaces the previous build's "Finish the course" (8 chapters). The course
  // is now 6 tracks; a lesson completes at its takeaway step and hands over to
  // the next lesson by name. Finishing a whole track is the track's practice.
  it('the takeaway step completes the lesson and names the next one', () => {
    location.hash = '#/lesson/l1';
    render(<App />);
    openStep('T4', 5);
    fireEvent.click(screen.getByRole('button', { name: /סיום השיעור/ }));
    expect(screen.getByText('השיעור הושלם')).toBeTruthy();
    const v2 = JSON.parse(localStorage.getItem('chartlab.learning.v2')!);
    expect(v2.lessons.T4.completed).toBe(true);
    // The previous build's record is kept in step, so nothing reading it breaks.
    expect(JSON.parse(localStorage.getItem('chartlab.lessonProgress')!).completed).toContain('l1');
    fireEvent.click(within(screen.getByRole('contentinfo')).getByRole('button', { name: /לשיעור הבא/ }));
    expect(location.hash).toBe('#/lesson/T5');
  });

  it("the track's last lesson hands over to track practice, not to another lesson", () => {
    location.hash = '#/lesson/T12';
    render(<App />);
    openStep('T12', 5);
    expect(screen.getByText(/זה השיעור האחרון במסלול — הצעד הבא הוא תרגול המסלול/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /סיום השיעור/ }));
    expect(screen.queryByText(/בקרוב/)).toBeNull();
  });

  it('opens where the learner left off', () => {
    localStorage.setItem('chartlab.learning.v2', JSON.stringify({ v: 2, lessons: { T6: { step: 2, completed: false } }, practice: {}, onboarding: null, lastLesson: 'T6' }));
    location.hash = '#/lesson/l3';
    render(<App />);
    const cur = within(screen.getByRole('navigation', { name: 'שלבי השיעור' })).getByRole('button', { current: 'step' });
    expect(cur.textContent).toBe(lessonById('T6')!.steps!.he[2]);
  });
});

describe('quiz/lesson alignment audit — content added where the quiz tested something never taught', () => {
  // Found by cross-referencing every quiz question's lesson against that
  // lesson's own prose: l0 tested ETFs and market cap without defining
  // either; l4 tested hammer/engulfing shapes without describing either;
  // l6 tested RSI divergence, never mentioned; l7 tested a double bottom's
  // structure, never described. Each now has a real "extra" block for the
  // gap, additive — the original intro/deeper text is untouched. In the
  // workspace it is step 3, under its own "מושגים נוספים" heading.
  // [lesson, the teaching step that covers it, …what it must say]. T10 (l7, rewritten
  // 2026-09-26) teaches the double bottom and its neckline on its first step.
  const cases: Array<[string, 0 | 1 | 2, RegExp, RegExp]> = [
    ['l0', 2, /קרן סל/, /שווי שוק/],
    ['l0', 2, /סימול/, /דיבידנד/],
    ['l4', 2, /פטיש/, /בליעה עולה/],
    ['l7', 0, /תחתית כפולה/, /קו הצוואר/],
    // l2 was added later: its quiz is answerable, but the lesson never said
    // what volume IS. A comprehension gap rather than a quiz gap.
    ['l2', 2, /נפח מסחר/, /עברו יד/]
  ];
  for (const [lessonId, step, ...patterns] of cases) {
    it(`${lessonId} now teaches what its own quiz questions test`, () => {
      location.hash = `#/lesson/${lessonId}`;
      render(<App />);
      if (step) openStep(LEGACY_TO_LESSON[lessonId]!, step);
      const heading = lessonContent(LEGACY_TO_LESSON[lessonId]!)!.teach[step].heading.he;
      const pane = screen.getByRole('heading', { name: heading }).closest('section')!;
      for (const p of patterns) {
        expect(pane.textContent, `${lessonId}: expected to match ${p}`).toMatch(p);
      }
    });
  }

  it('divergence moved to T8 (decided 2026-09-26): T7 neither teaches it nor asks about it', () => {
    const t7 = lessonContent('T7')!;
    expect(t7.questions.map((q) => q.id)).not.toContain('q-rsi-3');
    const text = t7.teach.flatMap((t) => [t.heading, ...t.paragraphs]).map((l) => `${l.he} ${l.en}`).join(' ');
    expect(text).not.toMatch(/דיוורגנס|דייברג׳נס|divergence/i);
  });

  it('lessons with no gap show no extra-terms step content at all', () => {
    // l1/l3/l5 were audited too and found already covered — by the annotation
    // notes for l3/l5, and by prose alone for l1. No invented content.
    for (const lessonId of ['l1', 'l3', 'l5']) {
      cleanup();
      location.hash = `#/lesson/${lessonId}`;
      render(<App />);
      openStep(LEGACY_TO_LESSON[lessonId]!, 2);
      expect(screen.queryByText('מושגים נוספים'), lessonId).toBeNull();
    }
  });
});
