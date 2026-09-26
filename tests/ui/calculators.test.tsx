import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { App } from '@ui/app/App';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
});

// The Tools pages load on demand, so each test waits for its page first.
const headline = () => screen.findByTestId('tool-headline');

describe('tools hub', () => {
  it('offers every tool, including stock lookup, and the old calculators link lands here', async () => {
    location.hash = '#/calculators';
    render(<App />);
    await screen.findByRole('heading', { level: 1, name: 'כלים' });
    const main = within(screen.getByRole('main'));
    for (const name of ['גודל פוזיציה', 'יחס סיכוי-סיכון', 'ריבית דריבית', 'מודל DCF', 'השוואת מניות', 'ניתוח מניה', 'רווח והפסד מעסקה', 'מילון מונחים']) {
      expect(main.getByRole('button', { name: new RegExp(name) }), name).toBeTruthy();
    }
  });

  it('search narrows the tools, and says so when nothing matches', async () => {
    location.hash = '#/tools';
    render(<App />);
    const search = await screen.findByRole('searchbox', { name: 'חיפוש כלי' });
    fireEvent.change(search, { target: { value: 'DCF' } });
    expect(screen.getAllByRole('button', { name: /מודל DCF/ }).length).toBe(1);
    expect(screen.queryByRole('button', { name: /ריבית דריבית/ })).toBeNull();
    fireEvent.change(search, { target: { value: 'zzz' } });
    expect(screen.getByText('לא נמצא כלי כזה.')).toBeTruthy();
  });

  it('keeps the global shell', async () => {
    location.hash = '#/tools';
    render(<App />);
    await screen.findByRole('heading', { level: 1, name: 'כלים' });
    expect(screen.getAllByRole('banner').length).toBe(1);
  });
});

describe('calculators compute live, with no submit step', () => {
  it('compounding shows a result at once, recomputes as a stepper moves, and announces politely', async () => {
    location.hash = '#/tools/compound';
    render(<App />);
    const out = await headline();
    const before = out.textContent;
    expect(before).toMatch(/[\d,]+/);
    fireEvent.click(screen.getByRole('button', { name: 'שנים — העלאה' }));
    expect(out.textContent).not.toBe(before);
    expect(out.getAttribute('aria-live')).toBe('polite');
  });

  it('position size: empty until four numbers, the design example gives 100 shares', async () => {
    location.hash = '#/tools/position';
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /למלא בדוגמה/ }));
    expect((await headline()).textContent).toBe('100');
  });

  it('position size: a stop on the wrong side blocks, and a short flips the rule', async () => {
    location.hash = '#/tools/position';
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /למלא בדוגמה/ }));
    fireEvent.change(screen.getByLabelText('מחיר סטופ'), { target: { value: '104' } });
    expect(screen.getByText('אי אפשר לחשב עדיין')).toBeTruthy();
    expect(screen.getByLabelText('מחיר סטופ').getAttribute('aria-invalid')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'מכירה בחסר' }));
    expect((await headline()).textContent).toBe('125');
  });

  it('position size: high risk warns without blocking', async () => {
    location.hash = '#/tools/position';
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /למלא בדוגמה/ }));
    fireEvent.change(screen.getByLabelText('סיכון לעסקה'), { target: { value: '8' } });
    expect(screen.getAllByText(/סיכון של 8% לעסקה/).length).toBeGreaterThan(0);
    expect((await headline()).textContent).toBe('800');
  });

  it('risk / reward, DCF and profit & loss start from the design examples', async () => {
    location.hash = '#/tools/rr';
    const { unmount } = render(<App />);
    expect((await headline()).textContent).toBe('1 : 2.5');
    unmount();
    location.hash = '#/tools/dcf';
    const dcf = render(<App />);
    expect((await headline()).textContent).toMatch(/31\.9\d/);
    fireEvent.change(screen.getByLabelText('שיעור היוון'), { target: { value: '2' } });
    expect(screen.getByText('שיעור ההיוון חייב להיות גבוה מהצמיחה ארוכת הטווח.')).toBeTruthy();
    dcf.unmount();
    location.hash = '#/tools/pnl';
    render(<App />);
    expect((await headline()).textContent).toBe('+₪ 90.00');
  });

  it('remembers the last tool used, on the hub', async () => {
    location.hash = '#/tools/rr';
    const { unmount } = render(<App />);
    await headline();
    unmount();
    location.hash = '#/tools';
    render(<App />);
    expect(await screen.findByText(/יחס סיכוי-סיכון · 1 : 2.5/)).toBeTruthy();
  });
});
