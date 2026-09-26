import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { App } from '@ui/app/App';
import * as series from '@core/charts/series.js';
import { lessonById } from '@core/curriculum/curriculum';
import { lessonContent } from '@core/lessons/content';
import { T7_CALC_CHANGES } from '@core/lessons/content/t7';
import { calcMistake, isRight } from '@core/lessons/activities';

beforeEach(() => {
  cleanup();
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
});

const share = (a: Array<number | null>, test: (v: number) => boolean, from: number, to: number) => {
  const xs = a.slice(from, to).filter((v): v is number => v != null);
  return xs.filter(test).length / xs.length;
};

describe('T7 — the indicators say what the text says', () => {
  it('the Try step: the fourteen days give RSI 60 — by the same code that draws RSI on the charts', () => {
    const closes = T7_CALC_CHANGES.reduce<number[]>((acc, d) => [...acc, acc.at(-1)! + d], [50]);
    expect(series.computeRSI(closes, 14)[14]).toBeCloseTo(60, 6);
    const a = lessonContent('T7')!.activity!;
    if (a.kind !== 'calculate') throw new Error('T7 is a calculation');
    expect(a.answer).toBe(60);
    expect(isRight(a, 60)).toBe(true);
    expect(isRight(a, 62)).toBe(false);
    // Each known wrong turn gets its own explanation.
    expect(calcMistake(a, 40)?.why.he).toMatch(/הפוך/);
    expect(calcMistake(a, 1.5)?.why.he).toMatch(/RS/);
    expect(calcMistake(a, 53)?.why.he).toMatch(/14/);
    expect(calcMistake(a, 75)).toBeNull();
  });

  it('RSI: above 50 through the rise, below 50 through the fall; "overbought" and "oversold" that last', () => {
    const sw = series.T7_SWING, peak = sw.reduce((m, x, i) => (x.c > sw[m]!.c ? i : m), 0);
    expect(share(sw.rsi, (v) => v > 50, 14, peak)).toBeGreaterThan(0.8);
    expect(share(sw.rsi, (v) => v < 50, peak + 5, sw.length)).toBeGreaterThan(0.8);
    const st = series.T7_STRONG, s70 = st.rsi.findIndex((v) => v != null && v > 70);
    expect(share(st.rsi, (v) => v > 70, s70, st.length)).toBeGreaterThan(0.8);
    expect(st.at(-1)!.c / st[s70]!.c - 1).toBeGreaterThan(0.2);
    const ap = series.T7_APPLY, a30 = ap.rsi.findIndex((v) => v != null && v < 30);
    expect(share(ap.rsi, (v) => v < 30, a30, ap.length)).toBeGreaterThan(0.6);
    expect(ap.at(-1)!.c).toBeLessThan(ap[a30]!.c);
    expect(share(series.T7_Q_RSI.rsi, (v) => v > 50, series.T7_Q_RSI.length - 30, series.T7_Q_RSI.length)).toBe(1);
  });

  it('MACD: the line is the 12-day minus the 26-day EMA; the signal cross comes near the low, the zero cross later', () => {
    const m = series.T7_MACD, closes = m.map((c) => c.c);
    const e12 = series.ema(closes, 12), e26 = series.ema(closes, 26);
    expect(m.macd.line[60]).toBeCloseTo(e12[60]! - e26[60]!, 10);
    expect(m.macd.line[24]).toBeNull();
    expect(m.macd.signal[32]).toBeNull();
    const low = m.reduce((a, x, i) => (x.l < m[a]!.l ? i : a), 0);
    const sig = m.macd.line.findIndex((v, i) => i > 0 && v != null && m.macd.signal[i] != null && m.macd.signal[i - 1] != null && m.macd.line[i - 1]! - m.macd.signal[i - 1]! <= 0 && v - m.macd.signal[i]! > 0);
    const zero = m.macd.line.findIndex((v, i) => i > 0 && v != null && m.macd.line[i - 1] != null && m.macd.line[i - 1]! <= 0 && v > 0);
    expect(Math.abs(sig - low)).toBeLessThanOrEqual(2);
    expect(zero - low).toBeGreaterThan(10);
    const b = series.T7_Q_BELOW;
    expect(b.macd.line.at(-1)!).toBeLessThan(0);
    const h = series.T7_Q_HIST;
    for (let i = h.length - 8; i < h.length; i++) {
      expect(h.macd.line[i]!).toBeGreaterThan(0);
      expect(h.macd.hist[i]!).toBeLessThan(0);
    }
  });

  it('never a mechanical rule: the lesson says in both languages that 70/30 are not signals', () => {
    const t7 = lessonContent('T7')!;
    const he = t7.teach.flatMap((t) => [...t.paragraphs, ...(t.callouts ?? []).map((c) => c.text)]).map((l) => l.he).join(' ');
    const en = t7.teach.flatMap((t) => [...t.paragraphs, ...(t.callouts ?? []).map((c) => c.text)]).map((l) => l.en).join(' ');
    expect(he).toMatch(/אינו איתות מסחר אוטומטי/);
    expect(en).toMatch(/neither is an automatic trade signal/);
  });
});

describe('T7 in the lesson workspace', () => {
  const openStep = (i: number) => fireEvent.click(within(screen.getByRole('navigation', { name: 'שלבי השיעור' })).getByRole('button', { name: lessonById('T7')!.steps!.he[i]! }));
  const footBtn = () => within(screen.getByRole('contentinfo')).getAllByRole('button').at(-1) as HTMLButtonElement;

  it('work out the RSI: a wrong-way-round answer is named, the right one shows the maths and then Apply', () => {
    location.hash = '#/lesson/T7';
    render(<App />);
    expect(screen.getByRole('heading', { name: 'מומנטום: כמה חזק המהלך' })).toBeTruthy();
    openStep(3);
    expect(footBtn().disabled).toBe(true);
    const input = screen.getByRole('spinbutton', { name: 'ה־RSI שלכם' });
    expect(screen.queryByText('החישוב, צעד אחר צעד')).toBeNull();
    fireEvent.change(input, { target: { value: '40' } });
    fireEvent.click(footBtn());
    expect(screen.getByText(/חילקתם את ממוצע הירידות בממוצע העליות/)).toBeTruthy();
    fireEvent.click(footBtn()); // try again
    fireEvent.change(screen.getByRole('spinbutton', { name: 'ה־RSI שלכם' }), { target: { value: '60' } });
    fireEvent.click(footBtn());
    expect(screen.getByText('החישוב, צעד אחר צעד')).toBeTruthy();
    expect(screen.getByText(/RS = 1\.2 ÷ 0\.8 = 1\.5/)).toBeTruthy();
    expect(screen.getByRole('region', { name: 'יישום · גרף חדש' })).toBeTruthy();
  });

  it('in English', () => {
    localStorage.setItem('chartlab.lang', 'en');
    location.hash = '#/lesson/T7';
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Momentum: how strong is the move' })).toBeTruthy();
  });
});
