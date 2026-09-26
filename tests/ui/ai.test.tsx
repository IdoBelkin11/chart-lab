import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { App } from '@ui/app/App';
import { __resetChatSessionForTests } from '@ui/routes/ai/AiRoute';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
  location.hash = '#/ai';
  __resetChatSessionForTests();
});

/** From a lesson: open the tutor drawer, then its full-screen link — the way to #/ai from inside a lesson. */
async function toFullPageFromLesson() {
  fireEvent.click(screen.getByRole('button', { name: /מורה AI/ }));
  fireEvent.click(await screen.findByRole('button', { name: 'למסך מלא' }, { timeout: 3000 }));
}

/**
 * Renders the app and waits for the tutor to be on screen.
 *
 * The AI route is loaded on demand (see RouteView — the KB behind it is the
 * bulk of the bundle), so it is not in the DOM on the first render tick.
 * Every assertion below is unchanged; they just wait for the chunk first.
 * Asserting through this helper rather than adding bare `await`s keeps the
 * reason in one place.
 */
async function renderTutor() {
  render(<App />);
  return screen.findByRole('log', {}, { timeout: 3000 });
}

describe('AI tutor route', () => {
  it('is a labelled region, not a false modal', async () => {
    render(<App />);
    const panel = await screen.findByRole('region', { name: /עוזר שוק ההון|Market tutor/ }, { timeout: 3000 });
    expect(panel).toBeTruthy();
    expect(panel.getAttribute('aria-modal')).toBeNull();
  });

  it('exposes the transcript as a polite live log', async () => {
    const log = await renderTutor();
    expect(log.getAttribute('aria-live')).toBe('polite');
  });

  it('keeps the global shell visible alongside it', async () => {
    await renderTutor();
    // Exactly one banner in the document — the global header.
    expect(screen.getAllByRole('banner').length).toBe(1);
    expect(screen.getByRole('link', { name: /Chart Lab|צ׳ארט לאב/ })).toBeTruthy();
  });

  it('answers a real question from the ported engine', async () => {
    await renderTutor();
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'מה זה צלב זהב?' } });
    fireEvent.submit(input.closest('form')!);
    // The question also names the conversation (title + history), so it appears more than once.
    await waitFor(() => expect(screen.getByRole('log').textContent).toMatch(/צלב זהב/), { timeout: 3000 });
  });

  it('a second example differs from the first', async () => {
    await renderTutor();
    const input = screen.getByRole('textbox');
    const ask = (q: string) => {
      fireEvent.change(input, { target: { value: q } });
      fireEvent.submit(input.closest('form')!);
    };
    ask('מה זה צלב זהב?');
    await waitFor(() => expect(screen.getAllByText(/צלב זהב/).length).toBeGreaterThan(0), { timeout: 3000 });
    // Compared at the BLOCK, not at the node that matched. "דוגמה היפותטית"
    // is now rendered as the block's own label element (see AiAnswer), so the
    // matched node is that label — identical for every example — and comparing
    // it would report two different examples as the same one.
    const exampleBlocks = () =>
      screen.getAllByText(/היפותטית/).map((n) => n.closest('p')?.textContent ?? n.textContent);

    ask('תן לי דוגמה');
    await waitFor(() => expect(exampleBlocks().length).toBeGreaterThan(0), { timeout: 3000 });
    const first = exampleBlocks()[0]!;
    ask('תן לי דוגמה אחרת');
    await waitFor(() => expect(exampleBlocks().some((x) => x !== first)).toBe(true), { timeout: 3000 });
  });

  it('example prompts are offered when empty', async () => {
    await renderTutor();
    expect(screen.getAllByRole('button').length).toBeGreaterThan(4);
  });
});

describe('the AI tutor is reachable from anywhere', () => {
  // It went missing in the port: the route existed and RouteView rendered
  // it, but nothing in the global nav pointed at it, so the only ways in
  // were typing #/ai or finding the buttons at the foot of a lesson. The
  // header entry alone was still not enough — the tools row scrolls
  // horizontally, and being first in it is how the button ended up clipped
  // at the viewport edge. Hence a fixed launcher as well.
  const ROUTES = ['#/', '#/lesson/l3', '#/quiz', '#/calculators', '#/stock', '#/compare'];

  it('offers a way in on every route', () => {
    for (const hash of ROUTES) {
      cleanup();
      location.hash = hash;
      render(<App />);
      expect(
        screen.getAllByRole('button', { name: /מורה AI/ }).length,
        `no tutor entry on ${hash}`
      ).toBeGreaterThan(0);
    }
  });

  // A written lesson has its own tutor button that opens the drawer beside it;
  // the floating launcher (every other route) goes to the full page.
  it('the launcher navigates to the tutor', () => {
    location.hash = '#/quiz';
    render(<App />);
    const entries = screen.getAllByRole('button', { name: /מורה AI/ });
    fireEvent.click(entries[entries.length - 1]!);
    expect(location.hash).toBe('#/ai');
  });

  it('the launcher is the ONLY entry — the header carries no AI button', () => {
    // The header tools row scrolls horizontally, so anything in it can be
    // scrolled out of reach. The tutor gets a fixed launcher instead, and
    // appears in the header nowhere.
    location.hash = '#/';
    render(<App />);
    const nav = screen.getByRole('navigation', { name: /ניווט ראשי/ });
    expect(nav.textContent).not.toMatch(/מורה AI/);
    expect(screen.getAllByRole('button', { name: /מורה AI/ }).length).toBe(1);
  });

  it('nothing points at the tutor from the tutor, which offers Back instead', async () => {
    location.hash = '#/ai';
    await renderTutor();
    // A button that navigates to the page you are already on is noise.
    expect(screen.queryByRole('button', { name: /מורה AI/ })).toBeNull();
    expect(screen.getByRole('button', { name: /חזרה לקורס/ })).toBeTruthy();
  });

  it('Back leaves the tutor', async () => {
    location.hash = '#/ai';
    await renderTutor();
    fireEvent.click(screen.getByRole('button', { name: /חזרה לקורס/ }));
    expect(location.hash).toBe('#/');
  });
});

describe('answers offer somewhere to go next', () => {
  it('shows follow-up chips derived from the answer\'s related entries', async () => {
    location.hash = '#/ai';
    await renderTutor();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'מה זה מכפיל רווח' } });
    fireEvent.submit(screen.getByRole('textbox').closest('form')!);
    // relatedIds was computed on every single turn and thrown away.
    // Chips are deliberately held back until the answer has finished
    // revealing, so this waits past the reveal rather than racing it.
    await waitFor(() => expect(screen.getByText(/להמשיך מכאן/)).toBeTruthy(), { timeout: 6000 });
  });

  it('the topic browser renders categories, not just prose about them', async () => {
    location.hash = '#/ai';
    await renderTutor();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'רשימת נושאים' } });
    fireEvent.submit(screen.getByRole('textbox').closest('form')!);
    // browse:true previously produced text telling the reader to pick a
    // category, followed by no categories at all.
    await waitFor(() => expect(screen.getByRole('button', { name: 'ניתוח טכני' })).toBeTruthy(), { timeout: 6000 });
  });

  it('opening a category lists its topics', async () => {
    location.hash = '#/ai';
    await renderTutor();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'רשימת נושאים' } });
    fireEvent.submit(screen.getByRole('textbox').closest('form')!);
    const cat = await screen.findByRole('button', { name: 'אג"ח' }, { timeout: 6000 });
    fireEvent.click(cat);
    expect(cat.getAttribute('aria-expanded')).toBe('true');
  });
});

describe('Back returns to where the tutor was opened from', () => {
  it('goes back to the lesson, not to the course home', async () => {
    // Asking a question mid-lesson and being dropped at the course overview
    // loses the reader's place — the lesson they were reading is obviously
    // the thing they want to return to.
    location.hash = '#/lesson/l2';
    render(<App />);
    await toFullPageFromLesson();
    cleanup();
    await renderTutor();
    fireEvent.click(screen.getByRole('button', { name: /חזרה לשיעור/ }));
    // The same lesson, at its curriculum address (l2 now lives at T5).
    expect(location.hash).toBe('#/lesson/T5');
  });

  it('names the lesson it will return to', async () => {
    location.hash = '#/lesson/l6';
    render(<App />);
    await toFullPageFromLesson();
    cleanup();
    await renderTutor();
    expect(screen.getByRole('button', { name: /חזרה לשיעור: RSI/ })).toBeTruthy();
  });

  it('has no origin at all before anything is visited', async () => {
    // A cold load straight to #/ai has nothing to return to, and Back falls
    // back to the course home. Asserted against a FRESH module: the origin
    // is module state, so within one test file it survives from the tests
    // above — which is correct behaviour, not something to assert around.
    vi.resetModules();
    const { originRoute } = await import('@ui/shell/returnTo');
    expect(originRoute()).toBeNull();
  });

  it('never leaves the reader on the tutor route', async () => {
    location.hash = '#/lesson/l5';
    render(<App />);
    await toFullPageFromLesson();
    cleanup();
    await renderTutor();
    fireEvent.click(screen.getByRole('button', { name: /חזרה/ }));
    expect(location.hash).not.toBe('#/ai');
  });
});

describe('the conversation survives leaving the AI page and coming back', () => {
  it('keeps the transcript after navigating away and back, and only New chat clears it', async () => {
    await renderTutor();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'מה זה צלב זהב?' } });
    fireEvent.submit(screen.getByRole('textbox').closest('form')!);
    await waitFor(() => expect(screen.getAllByText(/צלב זהב/).length).toBeGreaterThan(0), { timeout: 3000 });

    // Leave the AI route entirely (a real route change unmounts AiRoute —
    // it is lazy-loaded, not just hidden) and come back.
    location.hash = '#/';
    cleanup();
    location.hash = '#/ai';
    const log = await renderTutor();
    expect(log.textContent).toMatch(/צלב זהב/);

    // New chat is the one thing that starts over: the transcript is empty again,
    // and the previous conversation moves to the history column (Artifact 14.8).
    fireEvent.click(screen.getByRole('button', { name: /התחל שיחה חדשה/ }));
    expect(screen.getByRole('log').textContent).not.toMatch(/צלב זהב/);
    expect(screen.getByRole('complementary', { name: 'היסטוריית שיחות' }).textContent).toMatch(/צלב זהב/);
  });
});

describe('the empty state offers six starting points', () => {
  it('renders six prompts, so the grid fills two rows of three', async () => {
    location.hash = '#/ai';
    const log = await renderTutor();
    const prompts = log.querySelectorAll('button');
    expect(prompts.length).toBe(6);
  });

  it('includes the topic browser as one of them', async () => {
    location.hash = '#/ai';
    await renderTutor();
    expect(screen.getByRole('button', { name: /עיין בכל הנושאים/ })).toBeTruthy();
  });
});

describe('the topic browser scopes its open category per browse turn', () => {
  it('opening a category in a later browse widget does not also open it in an earlier one', async () => {
    await renderTutor();
    const ask = (q: string) => {
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: q } });
      fireEvent.submit(input.closest('form')!);
    };

    // Two separate browse widgets in the same conversation.
    ask('רשימת נושאים');
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'ניתוח טכני' }).length).toBe(1), {
      timeout: 6000
    });
    ask('רשימת נושאים');
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'ניתוח טכני' }).length).toBe(2), {
      timeout: 6000
    });

    // Open a category only in the SECOND (newest) widget.
    const categoryButtons = screen.getAllByRole('button', { name: 'ניתוח טכני' });
    fireEvent.click(categoryButtons[1]!);

    expect(categoryButtons[1]!.getAttribute('aria-expanded')).toBe('true');
    // The first widget's matching category button must stay closed — this
    // is the exact bug: a single shared `openCategory` made opening a
    // category in one browse turn also open it in every other one.
    expect(categoryButtons[0]!.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('"explain the chart" recognizes the lesson it was opened from', () => {
  it('answers about that lesson\'s own topic, not the generic "scroll to a lesson" fallback', async () => {
    // l2 is breakout/retest — see lessons.ts. Asked in the drawer beside it.
    location.hash = '#/lesson/l2';
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /מורה AI/ }));
    const log = await screen.findByRole('log', {}, { timeout: 3000 });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'תסביר לי את הגרף' } });
    fireEvent.submit(screen.getByRole('textbox').closest('form')!);
    await waitFor(
      () => {
        // The generic fallback tells the reader to go scroll to a lesson —
        // wrong when they just came from one. A real answer about breakout/
        // retest is the thing to check for instead of just "not the
        // fallback", since an unrelated real answer would also pass a
        // purely negative assertion.
        expect(log.textContent).toMatch(/פריצה/);
        expect(log.textContent).not.toMatch(/גלול לאחד השיעורים/);
      },
      { timeout: 3000 }
    );
  });
});
