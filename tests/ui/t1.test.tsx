import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { App } from '@ui/app/App';
import * as series from '@core/charts/series.js';
import { lessonById } from '@core/curriculum/curriculum';
import { lessonContent } from '@core/lessons/content';

beforeEach(() => {
  cleanup();
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
});

type C = Array<{ o: number; c: number; v: number }>;
/** Candle i's volume as a multiple of the average of the other candles — the lesson's own measure. */
const volX = (c: C, i: number) => c[i]!.v / (c.filter((_, k) => k !== i).reduce((s, x) => s + x.v, 0) / (c.length - 1));
const body = (c: C, i: number) => Math.abs(c[i]!.c - c[i]!.o);

describe('T1 — every chart shows what its text says', () => {
  it('the Try chart: A is the biggest candle on ordinary volume, C the only heavy-volume day, B a quiet one', () => {
    const t = series.T1_TRY, { a, b, c, d } = t.marks;
    expect(t.every((_, i) => i === a || body(t, i) < body(t, a))).toBe(true);
    expect(volX(t, a)).toBeGreaterThan(0.8);
    expect(volX(t, a)).toBeLessThan(1.2);
    expect(volX(t, b)).toBeLessThan(0.5);
    expect(volX(t, c)).toBeGreaterThan(3);
    expect(volX(t, d)).toBeLessThan(1.2);
    expect(t.every((_, i) => i === c || volX(t, i) < 1.6)).toBe(true);
  });

  it('volume counts, it does not point: one heavy day up, one heavy day down', () => {
    const v = series.T1_VOL;
    expect(v[v.upIdx]!.c).toBeGreaterThan(v[v.upIdx]!.o);
    expect(v[v.downIdx]!.c).toBeLessThan(v[v.downIdx]!.o);
    for (const i of [v.upIdx, v.downIdx]) expect(volX(v, i)).toBeGreaterThan(2.5);
    expect(v.every((_, i) => i === v.upIdx || i === v.downIdx || volX(v, i) < 1.6)).toBe(true);
  });

  it('the same stock: the last 20 days fall, the year rises, and the weekly chart is built from the days', () => {
    const l20 = series.T1_YEAR_LAST20, w = series.T1_YEAR_WEEKLY, y = series.T1_YEAR_FACTS;
    expect(l20.at(-1)!.c / l20[0]!.c - 1).toBeLessThan(-0.05);
    expect(y.lastClose / y.firstClose - 1).toBeGreaterThan(0.3);
    expect(w).toHaveLength(y.days / 5);
    expect(w.at(-1)!.c).toBe(y.lastClose);
    expect(l20.at(-1)!.c).toBe(y.lastClose);
  });

  it('apply and question charts', () => {
    const a = series.T1_APPLY;
    expect(a[a.markIdx]!.c).toBeLessThan(a[a.markIdx]!.o);
    expect(a.every((_, i) => i === a.markIdx || a[i]!.v < a[a.markIdx]!.v)).toBe(true);
    const q = series.T1_Q_VOL;
    expect(q.every((_, i) => i === q.markIdx || q[i]!.v < q[q.markIdx]!.v)).toBe(true);
    expect(body(q, q.markIdx) / q[q.markIdx]!.o).toBeLessThan(0.01);
    expect(series.T1_Q_WEEKLY).toHaveLength(26);
    const s = series.T1_Q_SCALE;
    expect(s.at(-1)!.c / s[0]!.c - 1).toBeLessThan(0.1);
  });

  it('stays on its side of the line: no candle anatomy (T2), no trend structure (T3)', () => {
    const t1 = lessonContent('T1')!;
    const teach = t1.teach.flatMap((t) => [t.heading, ...t.paragraphs, ...(t.callouts ?? []).map((x) => x.text), ...(t.notes ?? []).flatMap((n) => [n.label, n.explanation])]);
    const text = teach.map((l) => `${l.he} ${l.en}`).join(' ');
    expect(text).not.toMatch(/צל|פתיל|shadow|wick|שיא גבוה|שפל גבוה|higher high|higher low|מגמה|trend|פריצה|breakout/i);
  });
});

describe('T1 in the lesson workspace', () => {
  const openStep = (index: number) => fireEvent.click(within(screen.getByRole('navigation', { name: 'שלבי השיעור' })).getByRole('button', { name: lessonById('T1')!.steps!.he[index]! }));
  const footBtn = () => within(screen.getByRole('contentinfo')).getAllByRole('button').at(-1) as HTMLButtonElement;

  it('find the heavy-volume day: the biggest candle is the trap, and the feedback says why', () => {
    location.hash = '#/lesson/T1';
    render(<App />);
    expect(screen.getByRole('heading', { name: 'מה בעצם רואים בגרף מחיר?' })).toBeTruthy();
    openStep(3);
    expect(screen.getByRole('heading', { name: 'באיזה יום נסחרו הרבה יותר מניות מהרגיל?' })).toBeTruthy();
    expect(screen.queryByRole('region', { name: 'יישום · גרף חדש' })).toBeNull();
    fireEvent.click(screen.getByRole('radio', { name: /נר א/ }));
    fireEvent.click(footBtn());
    expect(screen.getByText('נר גדול בנפח רגיל, לא היום עם הנפח החריג')).toBeTruthy();
    fireEvent.click(footBtn()); // try again
    fireEvent.click(screen.getByRole('radio', { name: /נר ג/ }));
    fireEvent.click(footBtn());
    expect(screen.getByRole('region', { name: 'יישום · גרף חדש' })).toBeTruthy();
  });

  it('in English', () => {
    localStorage.setItem('chartlab.lang', 'en');
    location.hash = '#/lesson/T1';
    render(<App />);
    expect(screen.getByRole('heading', { name: 'What does a price chart actually show?' })).toBeTruthy();
  });
});
