import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { App } from '@ui/app/App';
import { __resetChatSessionForTests } from '@ui/routes/ai/AiRoute';
import { tryQuestionFor } from '@core/lessons/workspace';
import { lessonById } from '@core/curriculum/curriculum';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
  __resetChatSessionForTests();
});

const openDrawer = async () => {
  fireEvent.click(screen.getByRole('button', { name: /מורה AI/ }));
  return screen.findByRole('complementary', { name: 'מורה AI' }, { timeout: 3000 });
};

describe('the tutor beside the lesson', () => {
  it('opens in the lesson, knows which lesson and step it is, and the lesson stays on screen', async () => {
    location.hash = '#/lesson/l3';
    render(<App />);
    const drawer = await openDrawer();
    expect(drawer.textContent).toMatch(/ניתוח טכני · שיעור 6/);
    expect(drawer.textContent).toMatch(new RegExp(lessonById('T6')!.steps!.he[0]!));
    expect(screen.getByRole('navigation', { name: 'שלבי השיעור' })).toBeTruthy();
  });

  it('"quiz me" asks the lesson\'s own bonus questions, never the Try-step one', async () => {
    location.hash = '#/lesson/l3';
    render(<App />);
    const drawer = within(await openDrawer());
    fireEvent.click(drawer.getByRole('button', { name: 'תבחנו אותי' }));
    const group = await drawer.findByRole('radiogroup', {}, { timeout: 3000 });
    expect(group.getAttribute('aria-label')).not.toBe(tryQuestionFor('l3')!.question.he);
    fireEvent.click(within(group).getAllByRole('radio')[0]!);
    await waitFor(() => expect(drawer.getByText(/מצב תרגול/)).toBeTruthy());
  });

  it('closing it returns to the step with a note, and the conversation can be reopened', async () => {
    location.hash = '#/lesson/l3';
    render(<App />);
    const drawer = within(await openDrawer());
    fireEvent.click(drawer.getByRole('button', { name: 'סגירת המורה' }));
    expect(screen.queryByRole('complementary', { name: 'מורה AI' })).toBeNull();
    expect(screen.getByText(/חזרתם לשלב 1/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'לפתוח שוב את השיחה' }));
    expect(await screen.findByRole('complementary', { name: 'מורה AI' }, { timeout: 3000 })).toBeTruthy();
  });

  it('after a wrong answer, it offers help once — and "not now" means not now', () => {
    location.hash = '#/lesson/T9';
    render(<App />);
    fireEvent.click(within(screen.getByRole('navigation', { name: 'שלבי השיעור' })).getByRole('button', { name: lessonById('T9')!.steps!.he[3]! }));
    // T9's Try is a calculation: a wrong number.
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'בדיקה' }));
    const offer = screen.getByRole('region', { name: 'הצעת עזרה' });
    expect(offer.textContent).toMatch(/תקועים על השאלה/);
    fireEvent.click(within(offer).getByRole('button', { name: 'לא עכשיו' }));
    expect(screen.queryByRole('region', { name: 'הצעת עזרה' })).toBeNull();
  });
});
