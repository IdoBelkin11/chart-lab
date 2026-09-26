import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { App } from '@ui/app/App';
import { __resetChatSessionForTests } from '@ui/routes/ai/AiRoute';
import { lessonById } from '@core/curriculum/curriculum';
import { lessonContent } from '@core/lessons/content';
import { setSession } from '@ui/routes/practice/session';

beforeEach(() => {
  cleanup();
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
  __resetChatSessionForTests();
  setSession(null);
});

const openStep = (lessonId: string, index: number) => {
  const name = lessonById(lessonId)!.steps!.he[index]!;
  fireEvent.click(within(screen.getByRole('navigation', { name: 'שלבי השיעור' })).getByRole('button', { name }));
};
const footBtn = () => within(screen.getByRole('contentinfo')).getAllByRole('button').at(-1) as HTMLButtonElement;
const canvasLabels = () => screen.queryAllByRole('img').filter((el) => el.tagName === 'CANVAS').map((el) => el.getAttribute('aria-label'));

describe('Technical Analysis 2–5 in the lesson workspace', () => {
  it('T2 opens on the anatomy of a candle, then the hammer in context', () => {
    location.hash = '#/lesson/T2';
    render(<App />);
    expect(screen.getByRole('heading', { name: 'מה נר בודד מספר?' })).toBeTruthy();
    expect(screen.getByRole('img', { name: /פתיחה 100, סגירה 106, גבוה 108, נמוך 98/ })).toBeTruthy();
    openStep('T2', 1);
    expect(canvasLabels()[0]).toBe(lessonContent('T2')!.charts[0]!.label.he);
  });

  it('T2: after the Try step, Apply asks about a new chart — and explains either way', () => {
    location.hash = '#/lesson/T2';
    render(<App />);
    openStep('T2', 3);
    expect(screen.queryByRole('region', { name: 'יישום · גרף חדש' })).toBeNull();
    fireEvent.click(screen.getByRole('radio', { name: /נר ב/ }));
    fireEvent.click(footBtn());
    const apply = screen.getByRole('region', { name: 'יישום · גרף חדש' });
    const q = lessonContent('T2')!.apply!;
    expect(within(apply).getAllByRole('img').some((el) => el.getAttribute('aria-label') === lessonContent('T2')!.charts[q.chart!]!.label.he)).toBe(true);
    expect(within(apply).queryByText(q.explanation.he)).toBeNull();
    fireEvent.click(within(apply).getAllByRole('radio')[0]!);
    fireEvent.click(within(apply).getByRole('button', { name: 'בדיקה' }));
    expect(within(apply).getByText(q.explanation.he)).toBeTruthy();
    expect(within(apply).getByText('לא בדיוק')).toBeTruthy();
  });

  it('T3 drill: a card reveals its reasoning only once answered; a retry keeps the right ones', () => {
    location.hash = '#/lesson/T3';
    render(<App />);
    openStep('T3', 3);
    const a = lessonContent('T3')!.activity!;
    if (a.kind !== 'classify') throw new Error('T3 is the four-chart drill');
    for (const it of a.items) expect(screen.queryByText(it.why.he)).toBeNull();
    expect(footBtn().disabled).toBe(true);
    const card = (i: number) => screen.getByRole('region', { name: `גרף ${'אבגד'[i]}` });
    // Chart C is the trap: answer it wrong ("down"), the rest right.
    a.items.forEach((it, i) => {
      const pick = it.id === 'c' ? 'יורדת' : a.options.find((o) => o.key === it.answer)!.label.he;
      fireEvent.click(within(card(i)).getByRole('button', { name: pick }));
      expect(within(card(i)).getByText(it.why.he)).toBeTruthy();
    });
    expect(within(card(2)).getByText('התשובה: עולה')).toBeTruthy();
    fireEvent.click(footBtn());
    expect(screen.getByText('3 מתוך 4 נכונים')).toBeTruthy();
    fireEvent.click(footBtn()); // try again
    expect(within(card(0)).getByText('נכון')).toBeTruthy();
    expect(within(card(2)).queryByText(a.items[2]!.why.he)).toBeNull();
    fireEvent.click(within(card(2)).getByRole('button', { name: 'עולה' }));
    fireEvent.click(footBtn());
    expect(screen.getByText('כל הגרפים במקום')).toBeTruthy();
    expect(screen.getByText(a.explain![0]!.he)).toBeTruthy();
  });

  it('T5: nothing about the retest is on screen before the prediction; it all follows it', () => {
    location.hash = '#/lesson/T5';
    render(<App />);
    for (let k = 0; k < 3; k++) {
      openStep('T5', k);
      // The lesson's title and step names name the idea (curriculum + Artifact); the teaching itself does not show it.
      expect(screen.getByRole('main').textContent).not.toMatch(/ריטסט|בדיקה חוזרת/);
    }
    openStep('T5', 3);
    const a = lessonContent('T5')!.activity!;
    if (a.kind !== 'predict') throw new Error('T5 is a prediction');
    expect(screen.queryByText(a.outcome.he)).toBeNull();
    expect(document.querySelector('figcaption')!.textContent).toBe('מה קורה אחרי הפריצה?');
    fireEvent.click(screen.getByRole('radio', { name: /ממשיך לעלות/ }));
    fireEvent.click(footBtn());
    expect(screen.getByText(a.outcome.he)).toBeTruthy();
    expect(screen.getByText(a.explain![0]!.he)).toBeTruthy();
    // An ungraded prediction still gets its Apply check.
    expect(screen.getByRole('region', { name: 'יישום · גרף חדש' })).toBeTruthy();
  });

  it('T4 in English, with its order-book figure on step 2', () => {
    localStorage.setItem('chartlab.lang', 'en');
    location.hash = '#/lesson/T4';
    render(<App />);
    expect(screen.getByRole('heading', { name: 'What support is — and resistance' })).toBeTruthy();
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Lesson steps' })).getByRole('button', { name: lessonById('T4')!.steps!.en[1]! }));
    expect(screen.getByText('Why 50 holds: orders waiting there')).toBeTruthy();
  });
});

describe('visual questions carry their chart', () => {
  it('in track practice, the chart is there before the answer', async () => {
    localStorage.setItem('chartlab.learning.v2', JSON.stringify({ v: 2, lessons: Object.fromEntries(['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10'].map((id) => [id, { step: 6, completed: true }])), practice: {}, onboarding: null, lastLesson: null }));
    location.hash = '#/practice/T/run';
    render(<App />);
    const first = lessonContent('T1')!.questions[0]!;
    expect(await screen.findByRole('heading', { name: first.question.he })).toBeTruthy();
    expect(canvasLabels()).toContain(lessonContent('T1')!.charts[first.chart!]!.label.he);
  });

  it("on a lesson's own practice page", () => {
    location.hash = '#/quiz/T3';
    render(<App />);
    const first = lessonContent('T3')!.questions[0]!;
    expect(screen.getByText(first.question.he)).toBeTruthy();
    expect(canvasLabels()).toContain(lessonContent('T3')!.charts[first.chart!]!.label.he);
  });

  it("in the tutor's 'quiz me'", async () => {
    location.hash = '#/lesson/T4';
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /מורה AI/ }));
    const drawer = within(await screen.findByRole('complementary', { name: 'מורה AI' }, { timeout: 3000 }));
    fireEvent.click(drawer.getByRole('button', { name: 'תבחנו אותי' }));
    const group = await drawer.findByRole('radiogroup', {}, { timeout: 3000 });
    const q = lessonContent('T4')!.questions.find((x) => x.question.he === group.getAttribute('aria-label'))!;
    expect(q.chart).toBeDefined();
    expect(drawer.getAllByRole('img').some((el) => el.getAttribute('aria-label') === lessonContent('T4')!.charts[q.chart!]!.label.he)).toBe(true);
  });

  it('the old quiz link for the previous candlestick lesson still works', () => {
    location.hash = '#/quiz/l4';
    render(<App />);
    expect(screen.getByText(/נר "פטיש"|פטיש/)).toBeTruthy();
  });
});
