import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { App } from '@ui/app/App';
import { TRACKS, lessonById, lessonsOf } from '@core/curriculum/curriculum';

beforeEach(() => {
  localStorage.clear();
  location.hash = '';
  // Pin the language. Without this the app correctly falls back to the
  // browser locale (jsdom reports en-US), so asserting on Hebrew copy would
  // be testing the environment rather than the component.
  localStorage.setItem('chartlab.lang', 'he');
});

describe('global shell', () => {
  it('renders the rail with every track, always open', () => {
    render(<App />);
    // No toggle to press: the roadmap is permanent context.
    expect(screen.queryByRole('button', { name: /roadmap|מסלול הקורס/i })).toBeNull();
    const rail = within(screen.getByRole('navigation', { name: 'המסלולים שלי' }));
    for (const t of TRACKS) expect(rail.getByText(t.title.he)).toBeTruthy();
  });

  // A written lesson opens full screen (its own lesson bar, no rail); an
  // unwritten one's preview sits in the shell with the track's lesson list.
  it("beside a lesson preview, the rail lists that track's lessons", () => {
    location.hash = '#/lesson/M2';
    render(<App />);
    const rail = within(screen.getByRole('navigation', { name: 'שיעורי המסלול' }));
    expect(rail.getAllByRole('button').length).toBe(lessonsOf('M').length);
    expect(rail.getByRole('button', { current: true })).toBeTruthy();
  });

  it('has no redundant Overview control — the brand is the way home', () => {
    render(<App />);
    expect(screen.queryByText(/^סקירה$/)).toBeNull();
    expect(screen.queryByText(/^Overview$/)).toBeNull();
  });

  it('keeps the header on a feature route', () => {
    location.hash = '#/quiz';
    render(<App />);
    expect(screen.getByRole('banner')).toBeTruthy();
    // Identify the brand by its accessible name rather than its visible text,
    // which is localized.
    expect(screen.getByRole('link', { name: /Chart Lab|צ׳ארט לאב/ })).toBeTruthy();
    // Global controls stay reachable on a feature route — that is the whole
    // point of the shell.
    expect(screen.getByRole('button', { name: 'EN' })).toBeTruthy();
  });
});

describe('routing', () => {
  it('opens a lesson and shows its authored title', () => {
    location.hash = '#/lesson/l5';
    render(<App />);
    // The previous build's l5 is T9 now.
    expect(screen.getAllByText(lessonById('T9')!.title.he).length).toBeGreaterThan(0);
  });

  it('honours legacy bare-id deep links', () => {
    location.hash = '#l7';
    render(<App />);
    expect(screen.getAllByText(lessonById('T10')!.title.he).length).toBeGreaterThan(0);
  });

  it('falls back home on an unknown route', () => {
    location.hash = '#/nonsense';
    render(<App />);
    expect(within(screen.getByRole('main')).getByRole('heading', { level: 1, name: /Welcome to Chart Lab|ברוכים הבאים לצ׳ארט לאב/ })).toBeTruthy();
  });
});

describe('progress', () => {
  it('visiting a lesson marks it in progress, not complete', () => {
    location.hash = '#/lesson/l1';
    render(<App />);
    const stored = JSON.parse(localStorage.getItem('chartlab.lessonProgress') ?? '{}');
    expect(stored.visited).toContain('l1');
    expect(stored.completed ?? []).not.toContain('l1');
  });

  it('finishing a lesson persists, and can be undone', () => {
    location.hash = '#/lesson/l1';
    render(<App />);
    fireEvent.click(within(screen.getByRole('navigation', { name: 'שלבי השיעור' })).getByRole('button', { name: '3 דברים לזכור' }));
    fireEvent.click(screen.getByRole('button', { name: /סיום השיעור/ }));
    expect(JSON.parse(localStorage.getItem('chartlab.lessonProgress')!).completed).toContain('l1');
    fireEvent.click(screen.getByRole('button', { name: 'ביטול סימון ההשלמה' }));
    expect(JSON.parse(localStorage.getItem('chartlab.lessonProgress')!).completed).not.toContain('l1');
  });
});

describe('language and theme are global', () => {
  it('switching language flips direction', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'EN' }));
    expect(document.documentElement.dir).toBe('ltr');
    // The Hebrew button carries its own name, as the approved design labels it.
    fireEvent.click(screen.getByRole('button', { name: 'עב' }));
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('theme toggles and persists', () => {
    render(<App />);
    // Two buttons, dark and light; pressing the one not in use switches.
    const before = document.documentElement.dataset.theme;
    const other = before === 'light' ? /מצב כהה/ : /מצב בהיר/;
    fireEvent.click(screen.getByRole('button', { name: other }));
    expect(document.documentElement.dataset.theme).not.toBe(before);
    expect(screen.getByRole('button', { name: other }).getAttribute('aria-pressed')).toBe('true');
    expect(localStorage.getItem('chartlab.theme')).toBe(document.documentElement.dataset.theme);
  });
});
