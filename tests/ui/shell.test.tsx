import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '@ui/app/App';
import { LESSONS } from '@core/lessons/lessons';

beforeEach(() => {
  localStorage.clear();
  location.hash = '';
  // Pin the language. Without this the app correctly falls back to the
  // browser locale (jsdom reports en-US), so asserting on Hebrew copy would
  // be testing the environment rather than the component.
  localStorage.setItem('chartlab.lang', 'he');
});

describe('global shell', () => {
  it('renders the rail with every lesson, always open', () => {
    render(<App />);
    // No toggle to press: the roadmap is permanent context.
    expect(screen.queryByRole('button', { name: /roadmap|מסלול הקורס/i })).toBeNull();
    for (const lesson of LESSONS) {
      expect(screen.getAllByText(lesson.navLabel.he).length).toBeGreaterThan(0);
    }
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
    location.hash = '#/lesson/l3';
    render(<App />);
    expect(screen.getByText(LESSONS[3]!.title.he)).toBeTruthy();
  });

  it('honours legacy bare-id deep links', () => {
    location.hash = '#l6';
    render(<App />);
    expect(screen.getByText(LESSONS[6]!.title.he)).toBeTruthy();
  });

  it('falls back home on an unknown route', () => {
    location.hash = '#/nonsense';
    render(<App />);
    expect(screen.getByText(/lessons completed|שיעורים הושלמו/)).toBeTruthy();
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

  it('marking complete persists and toggles back', () => {
    location.hash = '#/lesson/l1';
    render(<App />);
    const btn = screen.getByRole('button', { name: /סמן כהושלם|Mark as complete/ });
    fireEvent.click(btn);
    expect(JSON.parse(localStorage.getItem('chartlab.lessonProgress')!).completed).toContain('l1');
    fireEvent.click(screen.getByRole('button', { name: /הושלם|Completed/ }));
    expect(JSON.parse(localStorage.getItem('chartlab.lessonProgress')!).completed).not.toContain('l1');
  });
});

describe('language and theme are global', () => {
  it('switching language flips direction', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'EN' }));
    expect(document.documentElement.dir).toBe('ltr');
    fireEvent.click(screen.getByRole('button', { name: 'HE' }));
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('theme toggles and persists', () => {
    render(<App />);
    const before = document.documentElement.dataset.theme;
    fireEvent.click(screen.getByRole('button', { name: /Toggle light\/dark|מעבר בין מצב/ }));
    expect(document.documentElement.dataset.theme).not.toBe(before);
    expect(localStorage.getItem('chartlab.theme')).toBe(document.documentElement.dataset.theme);
  });
});
