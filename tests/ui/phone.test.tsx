import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { App } from '@ui/app/App';

// Simulate a phone: every media query "matches" (the app only asks about the phone breakpoint).
const original = globalThis.matchMedia;
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
  globalThis.matchMedia = ((q: string) => ({
    matches: true, media: q, onchange: null,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false
  })) as unknown as typeof matchMedia;
});
afterEach(() => { cleanup(); globalThis.matchMedia = original; });

describe('on a phone (Artifact 15)', () => {
  it('home keeps the brand bar, with language and theme', () => {
    location.hash = '#/';
    render(<App />);
    expect(screen.getByRole('link', { name: /צ׳ארט לאב|Chart Lab/ })).toBeTruthy();
    expect(screen.getByRole('group', { name: /שפה|Language/ })).toBeTruthy();
  });

  it('an inner page names the way back and goes there', () => {
    location.hash = '#/track/T';
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'חזרה אל מסלולים' }));
    expect(location.hash).toBe('#/');
  });

  it('a tool page leads back to the tools, and its section tab stays lit', () => {
    location.hash = '#/stock';
    render(<App />);
    expect(screen.getByRole('button', { name: 'חזרה אל כלים' })).toBeTruthy();
    const tabs = screen.getByRole('navigation', { name: /ניווט ראשי/ });
    expect(tabs.querySelector('[aria-current="page"]')?.textContent).toMatch(/כלים/);
  });

  it('the tools hub is a section root: its name, no way back', async () => {
    location.hash = '#/tools';
    render(<App />);
    expect(screen.getAllByRole('heading', { level: 1, name: 'כלים' }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /^חזרה אל/ })).toBeNull();
  });
});
