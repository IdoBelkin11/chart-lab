import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { App } from '@ui/app/App';
import * as series from '@core/charts/series.js';
import { lessonById } from '@core/curriculum/curriculum';
import { lessonContent } from '@core/lessons/content';
import { isRight } from '@core/lessons/activities';

beforeEach(() => {
  cleanup();
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
});

const lowIdx = (c: Array<{ l: number }>) => c.reduce((m, x, i) => (x.l < c[m]!.l ? i : m), 0);
const turn = (a: Array<number | null>) => a.reduce<number>((m, v, i) => (v != null && (a[m] == null || v < a[m]!) ? i : m), a.findIndex((v) => v != null));

describe('T6 — the averages and their crossings are what the text says', () => {
  it('crossings() finds each side-change, in both directions, and ignores the warm-up', () => {
    expect(series.crossings([null, 1, 3, 2, 0], [null, 2, 2, 2, 2])).toEqual([{ idx: 2, dir: 'up' }, { idx: 4, dir: 'down' }]);
  });

  it('the teaching chart: one upward crossover, and the short average turns before the long one', () => {
    const t = series.T6_TEACH;
    expect(t.crosses).toEqual([{ idx: t.crosses[0]!.idx, dir: 'up' }]);
    expect(t.ma20[19]).not.toBeNull();
    expect(t.ma20[18]).toBeNull();
    const low = lowIdx(t);
    expect(turn(t.ma20)).toBeGreaterThan(low);
    expect(turn(t.ma50)).toBeGreaterThan(turn(t.ma20));
    expect(t.crosses[0]!.idx).toBeGreaterThan(low);
  });

  it('the Try chart has one crossover — upward — well after its low; sideways crosses again and again', () => {
    const y = series.T6_TRY;
    expect(y.crosses).toHaveLength(1);
    expect(y.crosses[0]!.dir).toBe('up');
    const low = lowIdx(y);
    expect(y[y.crosses[0]!.idx]!.c / y[low]!.l - 1).toBeGreaterThan(0.05);
    expect(series.T6_CHOP.crosses.length).toBeGreaterThanOrEqual(3);
  });

  it('question charts: the order at the end, one downward crossing, and a lagging upward one', () => {
    const a = series.T6_Q_ABOVE, n = a.length - 1;
    expect(a[n]!.c > a.ma20[n]! && a.ma20[n]! > a.ma50[n]!).toBe(true);
    expect(series.T6_Q_DOWN.crosses.map((x) => x.dir)).toEqual(['down']);
    const l = series.T6_Q_LAG;
    expect(l.crosses.map((x) => x.dir)).toEqual(['up']);
    expect(l.crosses[0]!.idx).toBeGreaterThan(lowIdx(l));
  });

  it('the exercise counts within 3 candles of the crossover', () => {
    const a = lessonContent('T6')!.activity!;
    if (a.kind !== 'markPoint') throw new Error('T6 asks for a moment');
    expect(a.target).toBe(series.T6_TRY.crosses[0]!.idx);
    expect(isRight(a, a.target + 3)).toBe(true);
    expect(isRight(a, a.target - 4)).toBe(false);
  });

  it('stays in its lane: no RSI or MACD, and "golden cross" is the 50/200 case', () => {
    const t6 = lessonContent('T6')!;
    const text = t6.teach.flatMap((t) => [t.heading, ...t.paragraphs, ...(t.callouts ?? []).map((x) => x.text)]).map((l) => `${l.he} ${l.en}`).join(' ');
    expect(text).not.toMatch(/RSI|MACD/);
    const golden = t6.teach.flatMap((t) => t.paragraphs).find((p) => /צלב זהב/.test(p.he))!;
    expect(golden.he).toMatch(/50/);
    expect(golden.he).toMatch(/200/);
    expect(golden.en).toMatch(/50-day average crosses above the 200-day/);
  });
});

describe('T6 in the lesson workspace', () => {
  const openStep = (i: number) => fireEvent.click(within(screen.getByRole('navigation', { name: 'שלבי השיעור' })).getByRole('button', { name: lessonById('T6')!.steps!.he[i]! }));
  const footBtn = () => within(screen.getByRole('contentinfo')).getAllByRole('button').at(-1) as HTMLButtonElement;

  it('pick the crossover with the keyboard slider: a miss says so, the hit explains the lag and offers Apply', () => {
    location.hash = '#/lesson/T6';
    render(<App />);
    expect(screen.getByRole('heading', { name: 'ממוצע נע מחליק את הרעש' })).toBeTruthy();
    openStep(3);
    const a = lessonContent('T6')!.activity!;
    if (a.kind !== 'markPoint') throw new Error('T6 asks for a moment');
    expect(footBtn().disabled).toBe(true);
    const slider = screen.getByRole('slider', { name: /בחירת נר/ });
    fireEvent.change(slider, { target: { value: String(a.target - 20) } });
    expect(screen.getByText(`בחרתם: נר ${a.target - 19}`)).toBeTruthy();
    fireEvent.click(footBtn());
    expect(screen.getByText(a.off.he)).toBeTruthy();
    fireEvent.click(footBtn()); // try again
    fireEvent.change(screen.getByRole('slider', { name: /בחירת נר/ }), { target: { value: String(a.target + 1) } });
    fireEvent.click(footBtn());
    expect(screen.getByText(a.right.he)).toBeTruthy();
    expect(screen.getByText(a.explain![1]!.he)).toBeTruthy();
    expect(screen.getByRole('region', { name: 'יישום · גרף חדש' })).toBeTruthy();
  });

  it('in English', () => {
    localStorage.setItem('chartlab.lang', 'en');
    location.hash = '#/lesson/T6';
    render(<App />);
    expect(screen.getByRole('heading', { name: 'A moving average smooths out the noise' })).toBeTruthy();
  });
});
