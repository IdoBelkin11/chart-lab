import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { App } from '@ui/app/App';

beforeEach(() => {
  cleanup();
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
  location.hash = '#/lesson/l1';
});

/** Every interactive glossary term currently on screen — in the lesson's
 *  content, not its bar (whose tutor toggle is also an aria-expanded button). */
function terms() {
  return Array.from(document.querySelectorAll('main button[aria-expanded]')).filter(
    (b) => !b.hasAttribute('aria-current')
  );
}

describe('glossary terms in a lesson', () => {
  it('actually renders interactive terms in the prose', () => {
    render(<App />);
    expect(terms().length).toBeGreaterThan(0);
  });

  it('survives a re-render', () => {
    // The regression this pins: dedup state used to live in a ref shared
    // across renders, so the first render marked terms and EVERY later one
    // marked none — the glossary disappeared as soon as anything changed.
    render(<App />);
    const before = terms().length;
    expect(before).toBeGreaterThan(0);
    // Paging to the next step and back re-renders the whole lesson.
    const loop = document.querySelector('nav[aria-label="שלבי השיעור"]')!;
    fireEvent.click(loop.querySelectorAll('button')[1]!);
    fireEvent.click(loop.querySelectorAll('button')[0]!);
    expect(terms().length).toBe(before);
  });

  it('opens a definition on click and closes it again', () => {
    render(<App />);
    const term = terms()[0] as HTMLButtonElement;
    expect(term.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(term);
    expect(term.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('tooltip').textContent!.length).toBeGreaterThan(20);
    fireEvent.click(term);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('marks each term once per lesson, across intro and "worth knowing"', () => {
    render(<App />);
    const labels = terms().map((t) => t.textContent);
    expect(new Set(labels).size).toBe(labels.length);
  });
});
