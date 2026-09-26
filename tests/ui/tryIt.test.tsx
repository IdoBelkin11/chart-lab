import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, within, waitFor } from '@testing-library/react';
import { App } from '@ui/app/App';
import { exerciseFor } from '@core/lessons/exercises';
import { lessonById } from '@core/curriculum/curriculum';
import { lessonContent } from '@core/lessons/content';

// Every written lesson has its own activity now, but a lesson without one still
// takes its first quiz question as the Try step. T9 without its activity stands in.
vi.mock('@core/lessons/content', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@core/lessons/content')>();
  return {
    ...mod,
    lessonContent: (id: string) => {
      const c = mod.lessonContent(id);
      if (id !== 'T9' || !c) return c;
      const { activity: _unused, ...rest } = c;
      return rest;
    }
  };
});

beforeEach(() => {
  cleanup();
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
});

function openStep(lessonId: string, index: number) {
  const name = lessonById(lessonId)!.steps!.he[index]!;
  fireEvent.click(within(screen.getByRole('navigation', { name: 'שלבי השיעור' })).getByRole('button', { name }));
}
const checkBtn = () => screen.getByRole('button', { name: 'בדיקה' }) as HTMLButtonElement;

describe('the chart exercise (l1 → T4, step 4)', () => {
  beforeEach(() => { location.hash = '#/lesson/l1'; });

  it('asks for a click on the chart and shows no answer before one', () => {
    render(<App />);
    openStep('T4', 3);
    expect(screen.getByText(/לחצו על הגרף במקום שבו לדעתכם נמצא אזור התמיכה/)).toBeTruthy();
    // Revealing up front would turn "work it out" into "read the answer".
    expect(screen.queryByText(exerciseFor('l1')!.annotations[0]!.label.he)).toBeNull();
  });

  it('cannot be checked, and gives no feedback, before a guess', () => {
    render(<App />);
    openStep('T4', 3);
    expect(checkBtn().disabled).toBe(true);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('the feedback step asks for an answer first rather than revealing it', () => {
    render(<App />);
    openStep('T4', 4);
    expect(screen.getByText('קודם עונים — ואז רואים את ההסבר.')).toBeTruthy();
    expect(screen.queryByText(exerciseFor('l1')!.annotations[0]!.label.he)).toBeNull();
  });
});

describe('lessons without a chart exercise use their own first quiz question', () => {
  it('a wrong answer explains, allows another try, and a right one moves on', () => {
    location.hash = '#/lesson/l5';
    render(<App />);
    openStep('T9', 3);
    const q = lessonContent('T9')!.questions[0]!;
    expect(screen.getByRole('heading', { name: q.question.he })).toBeTruthy();
    expect(checkBtn().disabled).toBe(true);
    const wrong = q.options.find((o) => o.key !== q.correctKey)!;
    fireEvent.click(screen.getByRole('radio', { name: new RegExp(wrong.text.he.slice(0, 12)) }));
    fireEvent.click(checkBtn());
    expect(screen.getByRole('status').textContent).toMatch(q.explanation.he.slice(0, 20));
    expect(screen.getByText('ניסיון 1 · אין הגבלה')).toBeTruthy();
    fireEvent.click(within(screen.getByRole('contentinfo')).getByRole('button', { name: /נסו שוב/ }));
    const right = q.options.find((o) => o.key === q.correctKey)!;
    fireEvent.click(screen.getByRole('radio', { name: new RegExp(right.text.he.slice(0, 12)) }));
    fireEvent.click(checkBtn());
    expect(screen.getByRole('heading', { name: 'יפה — זו התשובה' })).toBeTruthy();
    expect(screen.getByText('ניסיון 2 · אין הגבלה')).toBeTruthy();
  });

  it('the feedback step offers the tutor on this lesson', async () => {
    location.hash = '#/lesson/l5';
    render(<App />);
    openStep('T9', 3);
    const q = lessonContent('T9')!.questions[0]!;
    fireEvent.click(screen.getByRole('radio', { name: new RegExp(q.options.find((o) => o.key === q.correctKey)!.text.he.slice(0, 12)) }));
    fireEvent.click(checkBtn());
    fireEvent.click(screen.getByRole('button', { name: 'הסבר לי את הנושא' }));
    // The tutor opens beside the lesson (Artifact 14.2), already explaining it.
    const drawer = await screen.findByRole('complementary', { name: 'מורה AI' }, { timeout: 3000 });
    // The answer types itself out, so wait for it.
    await waitFor(() => expect(drawer.textContent).toMatch(/פיבונאצ/), { timeout: 4000 });
    expect(location.hash).not.toBe('#/ai');
  });
});

describe('notes-only lessons', () => {
  it('offer a reveal of the authored notes and hide them again', () => {
    location.hash = '#/lesson/T9';
    render(<App />);
    openStep('T9', 2);
    expect(screen.getByText('שאלה למחשבה')).toBeTruthy();
    const first = lessonContent('T9')!.teach[2].notes![0]!;
    // Scoped to the notes list: a note label like "פריצה" is also a glossary
    // term, so it legitimately appears in the lesson prose too.
    const notes = () => document.querySelector('ul[class*="noteList"]');
    expect(notes()).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'חשוף הערות' }));
    expect(within(notes() as HTMLElement).getByText(first.label.he)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'הסתר הערות' }));
    expect(notes()).toBeNull();
  });
});
