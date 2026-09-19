import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { App } from '@ui/app/App';
import { GLOSSARY } from '@core/glossary/terms';

beforeEach(() => {
  cleanup();
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
  location.hash = '#/glossary';
});

const entries = () => document.querySelectorAll('dt');

describe('glossary page', () => {
  it('lists every term in the dictionary', () => {
    render(<App />);
    expect(entries().length).toBe(GLOSSARY.length);
  });

  it('groups terms under every category that has any', () => {
    render(<App />);
    const groups = document.querySelectorAll('dl');
    expect(groups.length).toBeGreaterThan(1);
    expect(screen.getByText('יסודות השוק')).toBeTruthy();
    expect(screen.getByText('ניתוח טכני')).toBeTruthy();
  });

  it('filters by the term itself', () => {
    render(<App />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'דיבידנד' } });
    expect(entries().length).toBe(1);
    expect(entries()[0]!.textContent).toBe('דיבידנד');
  });

  it('filters by the idea, not just the word', () => {
    // The point of searching definitions: a beginner knows the concept but
    // usually not its name.
    render(<App />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'בעלות' } });
    const labels = Array.from(entries()).map((e) => e.textContent);
    expect(labels).toContain('מניה');
  });

  it('says so when nothing matches, rather than showing an empty page', () => {
    render(<App />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzzzqqq' } });
    expect(entries().length).toBe(0);
    expect(screen.getByText(/אין מונח שמתאים/)).toBeTruthy();
  });

  it('is reachable from the header on another route', () => {
    location.hash = '#/';
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'מילון' }));
    expect(location.hash).toBe('#/glossary');
  });

  it('keeps the global shell', () => {
    render(<App />);
    expect(screen.getAllByRole('banner').length).toBe(1);
  });
});
