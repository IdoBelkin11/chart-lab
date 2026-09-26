import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { App } from '@ui/app/App';
import { lessonsOf } from '@core/curriculum/curriculum';
import { practiceItems, writtenLessons } from '@core/practice/trackPractice';
import { setSession } from '@ui/routes/practice/session';
import type { TrackId } from '@core/curriculum/curriculum';

const seed = (ids: string[], practice: object = {}) =>
  localStorage.setItem('chartlab.learning.v2', JSON.stringify({
    v: 2, lessons: Object.fromEntries(ids.map((id) => [id, { step: 6, completed: true }])), practice, onboarding: null, lastLesson: null
  }));

beforeEach(() => {
  cleanup();
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
  setSession(null);
});

/** Answers every question of the running attempt: right for the first `right`, wrong after. */
async function answerAll(track: TrackId, right: number) {
  const items = practiceItems(track, 1);
  for (let i = 0; i < items.length; i++) {
    const q = items[i]!.question;
    const key = i < right ? q.correctKey : q.options.find((o) => o.key !== q.correctKey)!.key;
    const idx = q.options.findIndex((o) => o.key === key);
    fireEvent.click((await screen.findAllByRole('radio'))[idx]!);
    fireEvent.click(screen.getByRole('button', { name: 'בדיקה' }));
    expect(screen.getByRole('status')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: i === items.length - 1 ? /לתוצאות/ : /לשאלה הבאה/ }));
  }
}

describe('track practice', () => {
  // The practice and completion routes load on demand, so each test waits for them.
  it('stays locked, and says why, until every written lesson is done', async () => {
    location.hash = '#/practice/T';
    render(<App />);
    await screen.findByRole('heading', { name: 'התרגול עוד סגור' });
    const main = within(screen.getByRole('main'));
    // Every TA lesson is written now, so there is no "more lessons will join" note.
    expect(main.queryByText(/שכבר כתובים/)).toBeNull();
  });

  it('a pass is recorded, with the questions answered one at a time', async () => {
    seed(writtenLessons('T').map((l) => l.id));
    location.hash = '#/practice/T';
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /התחלת התרגול/ }));
    expect(location.hash).toBe('#/practice/T/run');
    await answerAll('T', 10);
    // All 12 TA lessons are written and done, so passing completes the track.
    expect(await screen.findByRole('heading', { name: 'המסלול הושלם' })).toBeTruthy();
    const rec = JSON.parse(localStorage.getItem('chartlab.learning.v2')!).practice.T;
    expect(rec).toEqual({ attempts: 1, best: 10, passed: true, total: 12 });
    expect(screen.getByRole('button', { name: /לסיכום המסלול/ })).toBeTruthy();
  });

  it('below 80% it does not pass, lists what to revisit, and offers another attempt', async () => {
    seed(writtenLessons('T').map((l) => l.id));
    location.hash = '#/practice/T/run';
    render(<App />);
    await answerAll('T', 9); // pass mark for 12 questions is 10
    expect(await screen.findByRole('heading', { name: 'כמעט. חסרה תשובה אחת.' })).toBeTruthy();
    expect(screen.getByText('3 השאלות שכדאי לחזור אליהן')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /ניסיון נוסף/ }));
    expect(location.hash).toBe('#/practice/T/run');
    expect(await screen.findByText('שאלה 1/12')).toBeTruthy();
  });

  it('the attempt that completes a whole track leads to the celebration and the summary', async () => {
    seed(lessonsOf('F').map((l) => l.id));
    location.hash = '#/practice/F/run';
    render(<App />);
    await answerAll('F', 5);
    expect(await screen.findByRole('heading', { name: 'המסלול הושלם' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /לסיכום המסלול/ }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: /יסודות השוק — הושלם/ })).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: /לסיכום המסלול/ }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByText('מה אתם יודעים לעשות עכשיו')).toBeTruthy();
  });
});

describe('track completion', () => {
  it('is honest about a track that is not complete', async () => {
    location.hash = '#/complete/T';
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'המסלול עוד לא הושלם' })).toBeTruthy();
  });

  it('the next-track choice lists what is left, and why each one', async () => {
    seed(lessonsOf('F').map((l) => l.id), { F: { attempts: 1, best: 3, passed: true, total: 3 } });
    location.hash = '#/complete/F/next';
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'לאן ממשיכים?' })).toBeTruthy();
    expect(screen.getByText('סיימתם 1 מתוך 6 מסלולים')).toBeTruthy();
    expect(screen.getByText(/נפתח אחרי סיכון, תיק והתנהגות/)).toBeTruthy();
  });
});
