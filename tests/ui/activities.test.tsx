import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { App } from '@ui/app/App';
import { ACTIVITIES, isRight, measuredTarget } from '@core/lessons/activities';
import type { SortActivity } from '@core/lessons/activities';
import { lessonById } from '@core/curriculum/curriculum';
import * as series from '@core/charts/series.js';

beforeEach(() => {
  cleanup();
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
});

function openStep(lessonId: string, index: number) {
  const name = lessonById(lessonId)!.steps!.he[index]!;
  fireEvent.click(within(screen.getByRole('navigation', { name: 'שלבי השיעור' })).getByRole('button', { name }));
}
const checkBtn = () => within(screen.getByRole('contentinfo')).getAllByRole('button').at(-1) as HTMLButtonElement;

describe('activity rules', () => {
  it('the candle chart really has the shapes it asks about', () => {
    const c = series.C_MIX, m = series.C_MIX.marks;
    const body = (i: number) => Math.abs(c[i]!.c - c[i]!.o);
    // Hammer: lower shadow at least twice the body, almost no upper shadow.
    expect(Math.min(c[m.b]!.o, c[m.b]!.c) - c[m.b]!.l).toBeGreaterThan(2 * body(m.b));
    // Doji: a near-zero body.
    expect(body(m.a)).toBeLessThan(0.5);
    // Engulfing: the green body covers the whole red candle before it.
    const [r, g] = m.c;
    expect(c[r]!.c < c[r]!.o && c[g]!.c > c[g]!.o && c[g]!.o <= c[r]!.c && c[g]!.c >= c[r]!.o).toBe(true);
    // Shooting star: the long shadow is on top.
    expect(c[m.d]!.h - Math.max(c[m.d]!.o, c[m.d]!.c)).toBeGreaterThan(2 * body(m.d));
  });

  it('the neckline counts inside its band or within tolerance, and the target is a measured move', () => {
    const a = ACTIVITIES.l7!;
    if (a.kind !== 'markLevel') throw new Error('l7 is a markLevel activity');
    const mid = (a.target[0] + a.target[1]) / 2;
    expect(isRight(a, mid)).toBe(true);
    expect(isRight(a, a.target[1] + a.tolerance - 0.01)).toBe(true);
    expect(isRight(a, a.target[1] + a.tolerance + 1)).toBe(false);
    expect(measuredTarget(100, 120)).toBe(80);
  });

  it('every sort item belongs to a bin that exists', () => {
    const a = ACTIVITIES.l0 as SortActivity;
    const bins = new Set(a.bins.map((b) => b.id));
    for (const it of a.items) expect(bins.has(it.bin), it.id).toBe(true);
  });
});

describe('sorting (F1)', () => {
  it('places by tapping an asset, then its type; a wrong one explains and keeps the right ones on retry', () => {
    location.hash = '#/lesson/l0';
    render(<App />);
    openStep('F1', 3);
    const a = ACTIVITIES.l0 as SortActivity;
    const binName = (id: string) => a.bins.find((b) => b.id === id)!.label.he;
    expect(checkBtn().disabled).toBe(true);
    for (const it of a.items) {
      fireEvent.click(screen.getByRole('button', { name: it.label.he }));
      // The gold ETF goes to "stock" on purpose — the mistake the design shows.
      const bin = it.id === 'gold' ? 'stock' : it.bin;
      fireEvent.click(screen.getByRole('button', { name: `להעביר ל${binName(bin)}` }));
    }
    fireEvent.click(checkBtn());
    expect(screen.getByRole('status').textContent).toMatch(/קרן סל על זהב — לא מניה/);
    fireEvent.click(within(screen.getByRole('contentinfo')).getByRole('button', { name: /נסו שוב/ }));
    // Only the misplaced asset is back in the pool.
    expect(screen.getByText('7/8 מוינו')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'קרן סל על זהב' }).length).toBe(1);
    fireEvent.click(screen.getByRole('button', { name: 'קרן סל על זהב' }));
    fireEvent.click(screen.getByRole('button', { name: `להעביר ל${binName('etf')}` }));
    fireEvent.click(checkBtn());
    expect(screen.getByText('הכול במקום')).toBeTruthy();
  });

  it('the lesson opens on its four concept cards', () => {
    location.hash = '#/lesson/l0';
    render(<App />);
    const card = screen.getByRole('button', { name: /אג״ח/ });
    expect(card.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(card);
    expect(card.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText(/מקבלים ריבית קבועה/)).toBeTruthy();
  });
});

describe('choosing on a chart (T2)', () => {
  it('a wrong candle is named and explained; the hammer is right', () => {
    location.hash = '#/lesson/l4';
    render(<App />);
    openStep('T2', 3);
    fireEvent.click(screen.getByRole('radio', { name: 'נר א' }));
    fireEvent.click(checkBtn());
    expect(screen.getByRole('status').textContent).toMatch(/דוג׳י, לא פטיש/);
    fireEvent.click(within(screen.getByRole('contentinfo')).getByRole('button', { name: /נסו שוב/ }));
    fireEvent.click(screen.getByRole('radio', { name: 'נר ב' }));
    fireEvent.click(checkBtn());
    expect(screen.getByRole('heading', { name: 'יפה — זו התשובה' })).toBeTruthy();
  });
});

describe('predicting (T5)', () => {
  it('is revealed, not marked: any guess moves on, with what actually happened', () => {
    location.hash = '#/lesson/l2';
    render(<App />);
    openStep('T5', 3);
    fireEvent.click(screen.getByRole('radio', { name: /ממשיך לעלות בלי לחזור/ }));
    fireEvent.click(within(screen.getByRole('contentinfo')).getByRole('button', { name: 'חשפו את ההמשך' }));
    expect(screen.getByRole('status').textContent).toMatch(/הפעם זה הלך אחרת/);
    expect(screen.queryByRole('button', { name: /נסו שוב/ })).toBeNull();
    expect((within(screen.getByRole('contentinfo')).getByRole('button', { name: /הבא:/ }) as HTMLButtonElement).disabled).toBe(false);
  });
});
