import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { App } from '@ui/app/App';
import { exerciseFor } from '@core/lessons/exercises';

beforeEach(() => {
  cleanup();
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
  location.hash = '#/lesson/l1';
});

describe('try it yourself panel', () => {
  it('shows the prompt but no answer until asked', () => {
    render(<App />);
    const ex = exerciseFor('l1')!;
    expect(screen.getByText(ex.prompt.he)).toBeTruthy();
    // Revealing up front would turn "work it out" into "read the answer".
    expect(screen.queryByText(ex.annotations[0]!.label.he)).toBeNull();
  });

  it('reveals annotations on request and hides them again', () => {
    render(<App />);
    const ex = exerciseFor('l1')!;
    fireEvent.click(screen.getByRole('button', { name: 'חשוף הערות' }));
    expect(screen.getByText(ex.annotations[0]!.label.he)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'הסתר הערות' }));
    expect(screen.queryByText(ex.annotations[0]!.label.he)).toBeNull();
  });

  it('gives no feedback before a guess is made', () => {
    render(<App />);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('a lesson without an exercise shows no panel', () => {
    location.hash = '#/lesson/l3';
    render(<App />);
    expect(screen.queryByText('נסו בעצמכם')).toBeNull();
  });
});

describe('notes-only lessons', () => {
  it('offer a reveal without asking for a guess', () => {
    location.hash = '#/lesson/l2';
    render(<App />);
    expect(screen.getByText('מה לשים לב')).toBeTruthy();
    // No guess prompt — this chapter teaches by pointing.
    expect(screen.queryByText('נסו בעצמכם')).toBeNull();
  });

  it('reveal shows the authored notes and hides them again', async () => {
    const { annotationsFor } = await import('@core/lessons/exercises');
    location.hash = '#/lesson/l2';
    render(<App />);
    const first = annotationsFor('l2')!.notes[0]!;
    // Scoped to the notes list on purpose: a note label like "פריצה" is also
    // a glossary term, so it legitimately appears in the lesson prose too.
    // An unscoped query matches both and says "found multiple elements",
    // which is about the page, not about whether the notes revealed.
    const notes = () => document.querySelector('ul[class*="legend"]');
    expect(notes()).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'חשוף הערות' }));
    expect(within(notes() as HTMLElement).getByText(first.label.he)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'הסתר הערות' }));
    expect(notes()).toBeNull();
  });
});
