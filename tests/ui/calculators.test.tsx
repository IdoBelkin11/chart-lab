import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '@ui/app/App';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
  location.hash = '#/calculators';
});

describe('calculators route', () => {
  it('offers every calculator as a tab', () => {
    render(<App />);
    expect(screen.getAllByRole('tab').length).toBe(4);
  });

  it('shows a result without pressing anything', () => {
    render(<App />);
    // Exploratory tools: no submit step between changing a number and seeing
    // its effect.
    expect(screen.getByTestId('calc-headline').textContent).toMatch(/[\d,]+\.\d{2}/);
  });

  it('recomputes live as a value changes', () => {
    render(<App />);
    const before = screen.getByTestId('calc-headline').textContent;
    const years = screen.getAllByRole('spinbutton')[2]!;
    fireEvent.change(years, { target: { value: '30' } });
    expect(screen.getByTestId('calc-headline').textContent).not.toBe(before);
  });

  it('switching tabs preserves each calculator’s own values', () => {
    render(<App />);
    const principal = screen.getAllByRole('spinbutton')[0]!;
    fireEvent.change(principal, { target: { value: '55555' } });
    fireEvent.click(screen.getAllByRole('tab')[1]!);
    fireEvent.click(screen.getAllByRole('tab')[0]!);
    expect((screen.getAllByRole('spinbutton')[0] as HTMLInputElement).value).toBe('55555');
  });

  it('announces the result politely', () => {
    render(<App />);
    expect(screen.getByTestId('calc-headline').closest('output')!.getAttribute('aria-live')).toBe('polite');
  });

  it('keeps the global shell', () => {
    render(<App />);
    expect(screen.getAllByRole('banner').length).toBe(1);
    expect(screen.getByRole('link', { name: /Chart Lab|צ׳ארט לאב/ })).toBeTruthy();
  });
});
