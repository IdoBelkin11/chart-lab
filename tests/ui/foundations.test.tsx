import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within, waitFor } from '@testing-library/react';
import { App } from '@ui/app/App';
import { __resetChatSessionForTests } from '@ui/routes/ai/AiRoute';
import { lessonById } from '@core/curriculum/curriculum';
import { lessonContent } from '@core/lessons/content';
import type { SortActivity } from '@core/lessons/activities';

beforeEach(() => {
  cleanup();
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
  __resetChatSessionForTests();
});

const openStep = (lessonId: string, index: number) => {
  const name = lessonById(lessonId)!.steps!.he[index]!;
  fireEvent.click(within(screen.getByRole('navigation', { name: 'שלבי השיעור' })).getByRole('button', { name }));
};
const footBtn = () => within(screen.getByRole('contentinfo')).getAllByRole('button').at(-1) as HTMLButtonElement;

describe('Foundations 2–5 in the lesson workspace', () => {
  it('F2 opens as a written lesson: its own heading, the order-path figure, then the weighted index', () => {
    location.hash = '#/lesson/F2';
    render(<App />);
    expect(screen.getByRole('heading', { name: lessonContent('F2')!.teach[0].heading.he })).toBeTruthy();
    expect(screen.getByText('הדרך של פקודת קנייה')).toBeTruthy();
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(expect.arrayContaining([expect.stringMatching(/^1אתם/)]));
    openStep('F2', 2);
    const table = screen.getByRole('table');
    expect(within(table).getByText('+0.95%')).toBeTruthy();
  });

  it('F2 sorting: all right shows the verdict, then the order path explained', () => {
    location.hash = '#/lesson/F2';
    render(<App />);
    openStep('F2', 3);
    const a = lessonContent('F2')!.activity as SortActivity;
    for (const it of a.items) {
      fireEvent.click(screen.getByRole('button', { name: it.label.he }));
      fireEvent.click(screen.getByRole('button', { name: `להעביר ל${a.bins.find((b) => b.id === it.bin)!.label.he}` }));
    }
    expect(footBtn().disabled).toBe(false);
    fireEvent.click(footBtn());
    expect(screen.getByText('הכול במקום')).toBeTruthy();
    expect(screen.getByText(/ככה נראית הדרך של פקודה/)).toBeTruthy();
  });

  it('F3 prediction: the outcome stays hidden until a guess is made', () => {
    location.hash = '#/lesson/F3';
    render(<App />);
    openStep('F3', 3);
    const a = lessonContent('F3')!.activity!;
    if (a.kind !== 'predict') throw new Error('F3 is a prediction');
    expect(screen.queryByText(a.outcome.he)).toBeNull();
    fireEvent.click(screen.getByRole('radio', { name: /נפתחת גבוה יותר/ }));
    fireEvent.click(footBtn());
    expect(screen.getByText(a.outcome.he)).toBeTruthy();
  });

  it('F5 order book: the three tasks, each recognised from what the order did, then the feedback', () => {
    location.hash = '#/lesson/F5';
    render(<App />);
    openStep('F5', 3);
    expect(footBtn().disabled).toBe(true);
    const send = () => fireEvent.click(screen.getByRole('button', { name: 'שלחו פקודת קנייה' }));
    send(); // market, 100 shares: the cheapest seller
    expect(screen.getByText(/נקנתה מהמוכר הזול ביותר בספר: 100 מניות ב־100.10/)).toBeTruthy();
    for (let k = 0; k < 4; k++) fireEvent.click(screen.getByRole('button', { name: 'יותר מניות' }));
    send(); // market, 500 shares: 200 left at 100.10, the rest climbs
    expect(screen.getByText(/המשיכה לשכבות יקרות יותר/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'פקודת לימיט' }));
    send(); // limit at 100.00, below the offer: waits
    expect(screen.getByText(/נכנסה לספר כהצעת קנייה ומחכה/)).toBeTruthy();
    expect(screen.getByText('הפקודה שלכם')).toBeTruthy();
    expect(footBtn().disabled).toBe(false);
    fireEvent.click(footBtn());
    expect(screen.getByText('שלוש המשימות בוצעו')).toBeTruthy();
  });

  it('F5 in English', () => {
    localStorage.setItem('chartlab.lang', 'en');
    location.hash = '#/lesson/F5';
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Why are there two prices, not one?' })).toBeTruthy();
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Lesson steps' })).getByRole('button', { name: lessonById('F5')!.steps!.en[3]! }));
    expect(screen.getByRole('button', { name: 'Send buy order' })).toBeTruthy();
  });

  it('the tutor knows F4 and quizzes with its own questions', async () => {
    location.hash = '#/lesson/F4';
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /מורה AI/ }));
    const drawer = within(await screen.findByRole('complementary', { name: 'מורה AI' }, { timeout: 3000 }));
    fireEvent.click(drawer.getByRole('button', { name: 'תבחנו אותי' }));
    const group = await drawer.findByRole('radiogroup', {}, { timeout: 3000 });
    expect(lessonContent('F4')!.questions.map((q) => q.question.he)).toContain(group.getAttribute('aria-label'));
    await waitFor(() => expect(drawer.getByText(/שאלת בונוס 1 מתוך 3/)).toBeTruthy());
  });

  it('a new lesson\'s practice link opens its own questions', async () => {
    location.hash = '#/quiz/F3';
    render(<App />);
    const first = lessonContent('F3')!.questions[0]!;
    expect(await screen.findByText(first.question.he)).toBeTruthy();
  });
});
