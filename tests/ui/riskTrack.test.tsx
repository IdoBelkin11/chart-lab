import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { App } from '@ui/app/App';
import { lessonById, lessonsOf } from '@core/curriculum/curriculum';
import { lessonContent } from '@core/lessons/content';
import { isRight, calcMistake } from '@core/lessons/activities';
import { practiceItems, practicePass } from '@core/practice/trackPractice';
import { setSession } from '@ui/routes/practice/session';
import { positionSize, riskReward } from '@core/calculators/tools';
import * as r from '@core/risk/scenarios';
import * as series from '@core/charts/series.js';

beforeEach(() => {
  cleanup();
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
  setSession(null);
});

const R = lessonsOf('R').map((l) => l.id);
const K = (a: r.AssetKey, b: r.AssetKey) => r.correlation(r.RETURNS[a], r.RETURNS[b]);
const avgMove = (c: Array<{ c: number }>) => c.slice(1).reduce((t, x, i) => t + Math.abs(x.c / c[i]!.c - 1), 0) / (c.length - 1);

describe('what the Risk lessons claim is what the data says', () => {
  it('R1: the calm and the volatile stock end close together, with very different moves; the drawdowns are where stated', () => {
    const end = (c: typeof series.R1_CALM) => c[c.length - 1]!.c / c[0]!.c;
    expect(Math.abs(end(series.R1_CALM) - end(series.R1_WILD))).toBeLessThan(0.02);
    expect(avgMove(series.R1_WILD) / avgMove(series.R1_CALM)).toBeGreaterThan(3);
    const t = series.R1_TRY;
    expect(t.swings.map((s) => s.type)).toEqual(['high', 'low']);
    expect(Math.min(...t.slice(t.swings[0]!.idx).map((x) => x.l))).toBe(t.swings[1]!.price);
    expect(r.recoveryPct(50)).toBeCloseTo(100, 9);
  });

  it('R2: the banks move together, bonds lean the other way, gold and cash barely relate to stocks', () => {
    expect(K('bankA', 'bankB')).toBeGreaterThan(0.8);
    expect(K('stocks', 'bonds')).toBeLessThan(-0.15);
    expect(Math.abs(K('stocks', 'gold'))).toBeLessThan(0.15);
    expect(Math.abs(K('stocks', 'cash'))).toBeLessThan(0.15);
    // The most negative entry in the stocks row is bonds (the Try's first answer).
    const row = (['bonds', 'gold', 'cash'] as const).map((k) => K('stocks', k));
    expect(Math.min(...row)).toBe(row[0]);
  });

  it('R4: the Artifact\'s account gives 100 shares at a stop of 95, and the same loss at every stop', () => {
    const at = (stop: number) => positionSize({ account: r.ACCOUNT, riskPct: r.R4_TRADE.riskPct, entry: r.R4_TRADE.entry, stop, side: 'long' })!;
    expect(at(r.R4_TRADE.stop).shares).toBe(100);
    expect(r.R4_STOPS.map((s) => at(s).shares)).toEqual([250, 100, 50]);
    for (const s of r.R4_STOPS) expect(at(s).loss).toBeCloseTo(500, 6);
    expect(positionSize({ ...r.R4_OVER, side: 'long' })!.portion).toBeGreaterThan(1);
  });

  it('R5: 1:2.5 and 28.6% on the Artifact\'s trade; on the chart the stop is never touched and the target is reached', () => {
    const rr = riskReward(r.R5_TRADE.entry, r.R5_TRADE.stop, r.R5_TRADE.target)!;
    expect(rr.ratio).toBeCloseTo(2.5, 9);
    expect(rr.breakEven * 100).toBeCloseTo(28.57, 1);
    const t = series.R5_TRADE, after = t.slice(t.entryIdx);
    expect(Math.min(...after.map((x) => x.l))).toBeGreaterThan(r.R5_TRADE.stop);
    expect(Math.max(...after.map((x) => x.h))).toBeGreaterThan(r.R5_TRADE.target);
    expect(t.swings[1]!.price).toBeGreaterThan(r.R5_TRADE.stop);
  });

  it('R5 Try: the stop zone sits just under the last low, and the chart ends above it', () => {
    const act = lessonContent('R5')!.activity!;
    if (act.kind !== 'markLevel') throw new Error('R5 places a stop');
    const low = series.R5_PLAN.swings[1]!.price;
    expect(act.target[1]).toBeLessThan(low);
    expect(low - act.target[0]).toBeLessThan(1);
    expect(series.R5_PLAN[series.R5_PLAN.length - 1]!.c).toBeGreaterThan(low);
    expect(isRight(act, (act.target[0] + act.target[1]) / 2)).toBe(true);
    expect(isRight(act, series.R5_PLAN[series.R5_PLAN.length - 1]!.c)).toBe(false);
  });

  it('R7–R8: the crash is 30% and comes back part of the way; only the cautious profile stays within the loss limit', () => {
    const c = series.R7_CRASH;
    expect(1 - c.swings[1]!.price / c.swings[0]!.price).toBeCloseTo(0.3, 9);
    expect(c[c.length - 1]!.c).toBeGreaterThan(c.swings[1]!.price);
    expect(c[c.length - 1]!.c).toBeLessThan(c.swings[0]!.price);
    const bad = r.PROFILES.map((p) => r.profileReturn(p.weights, 'bad'));
    expect(bad.filter((x) => -x <= r.MAX_LOSS)).toHaveLength(1);
    expect(-bad[0]!).toBeLessThanOrEqual(r.MAX_LOSS);
  });
});

describe('every Risk lesson is complete', () => {
  it.each(R)('%s: a Try, an Apply on a figure or chart, and three visual questions', (id) => {
    const c = lessonContent(id)!;
    expect(c.activity).toBeTruthy();
    expect(c.apply?.figure ?? (c.apply?.chart !== undefined ? c.charts[c.apply.chart] : undefined)).toBeTruthy();
    expect(c.questions.filter((q) => q.figure || q.chart !== undefined)).toHaveLength(3);
    for (const q of c.questions) expect(q.lesson).toBe(id);
  });

  it('the tutor is asked about a knowledge-base topic each lesson itself lists', () => {
    for (const id of R) expect(lessonById(id)!.kbTopics, id).toContain(lessonContent(id)!.tutor.topic);
  });

  it('the practice asks 8 questions and passes at 7', () => {
    const items = practiceItems('R', 1);
    expect(items).toHaveLength(8);
    expect(practicePass(items)).toBe(7);
  });

  it('R1\'s calculation explains the classic mistake: taking the fall\'s percentage as the way back', () => {
    const act = lessonContent('R1')!.activity!;
    if (act.kind !== 'calculate') throw new Error('R1 is a calculation');
    expect(isRight(act, 60)).toBe(true);
    expect(calcMistake(act, 37.5)).toBe(act.mistakes![0]);
  });
});

describe('Risk in the lesson workspace', () => {
  const openStep = (id: string, i: number) => fireEvent.click(within(screen.getByRole('navigation', { name: 'שלבי השיעור' })).getByRole('button', { name: lessonById(id)!.steps!.he[i]! }));
  const footBtn = () => within(screen.getByRole('contentinfo')).getAllByRole('button').at(-1) as HTMLButtonElement;

  it('R4: how many shares — a wrong turn is named, the right answer shows the working', () => {
    location.hash = '#/lesson/R4';
    render(<App />);
    openStep('R4', 3);
    const act = lessonContent('R4')!.activity!;
    if (act.kind !== 'calculate') throw new Error('R4 is a calculation');
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: String(Math.floor(r.R4_TRY.account / r.R4_TRY.entry)) } });
    fireEvent.click(footBtn());
    expect(screen.getByText(act.mistakes![3]!.why.he)).toBeTruthy();
    fireEvent.click(footBtn());
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: String(act.answer) } });
    fireEvent.click(footBtn());
    expect(screen.getByText(act.right.he)).toBeTruthy();
    expect(screen.getByRole('region', { name: 'יישום · גרף חדש' })).toBeTruthy();
  });

  it('R8: the bad year, question by question', () => {
    location.hash = '#/lesson/R8';
    render(<App />);
    openStep('R8', 3);
    const act = lessonContent('R8')!.activity!;
    if (act.kind !== 'checklist') throw new Error('R8 is a checklist');
    for (const it of act.items) {
      const label = it.options.find((o) => o.key === it.correct)!.label.he;
      fireEvent.click(within(screen.getByRole('radiogroup', { name: it.question.he })).getByRole('radio', { name: new RegExp(label.slice(0, 10).replace(/[.*+?^${}()|[\]\\−]/g, '\\$&')) }));
    }
    fireEvent.click(footBtn());
    expect(screen.getByText(act.right.he)).toBeTruthy();
  });
});

describe('the Risk track, end to end', () => {
  const seed = (ids: string[], practice: object = {}) => localStorage.setItem('chartlab.learning.v2', JSON.stringify({
    v: 2, lessons: Object.fromEntries(ids.map((id) => [id, { step: 6, completed: true }])), practice, onboarding: null, lastLesson: null
  }));

  it('Derivatives stays locked until Risk is complete', () => {
    location.hash = '#/track/D';
    render(<App />);
    expect(within(screen.getByRole('main')).getByText('המסלול נעול')).toBeTruthy();
  });

  it('passing the practice completes the track — and opens Derivatives, which requires it', async () => {
    seed(R);
    location.hash = '#/practice/R/run';
    render(<App />);
    const items = practiceItems('R', 1);
    for (let i = 0; i < items.length; i++) {
      const q = items[i]!.question;
      fireEvent.click((await screen.findAllByRole('radio'))[q.options.findIndex((o) => o.key === q.correctKey)]!);
      fireEvent.click(screen.getByRole('button', { name: 'בדיקה' }));
      fireEvent.click(screen.getByRole('button', { name: i === items.length - 1 ? /לתוצאות/ : /לשאלה הבאה/ }));
    }
    expect(await screen.findByRole('heading', { name: 'המסלול הושלם' })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('chartlab.learning.v2')!).practice.R).toEqual({ attempts: 1, best: 8, passed: true, total: 8 });
    cleanup();
    location.hash = '#/track/D';
    render(<App />);
    expect(within(screen.getByRole('main')).queryByText('המסלול נעול')).toBeNull();
  });

  it('every Risk lesson opens as a lesson, not a preview', () => {
    for (const id of R) {
      cleanup();
      location.hash = `#/lesson/${id}`;
      render(<App />);
      expect(screen.queryByText(/השיעור הזה עוד נכתב/), id).toBeNull();
    }
  });
});
