import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { App } from '@ui/app/App';
import * as series from '@core/charts/series.js';
import { lessonById } from '@core/curriculum/curriculum';
import { allQuestions, lessonContent } from '@core/lessons/content';
import { isRight, markPointsFault } from '@core/lessons/activities';
import type { MarkPointsAnswer } from '@core/lessons/activities';
import { questionsForLesson } from '@core/quiz/topicScoping';

beforeEach(() => {
  cleanup();
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
});

type Div = typeof series.T8_BEAR;
const pair = (c: Div) => { const [a, b] = c.swings; return { i1: a!.idx, i2: b!.idx, p1: a!.price, p2: b!.price, r1: c.rsi[a!.idx]!, r2: c.rsi[b!.idx]! }; };
const DIVERGENCE = /דיוורגנס|דייברג׳נס|divergence/i;

describe('T8 — price and RSI really disagree where the lesson says they do', () => {
  it('bearish charts: a higher high in price, a lower high in RSI at the same candles', () => {
    for (const c of [series.T8_BEAR, series.T8_FAIL, series.T8_TRY, series.T8_Q_BEAR, series.T8_Q_FAIL]) {
      const d = pair(c);
      expect(c.swings.map((s) => s.type)).toEqual(['high', 'high']);
      expect(d.p2).toBeGreaterThan(d.p1);
      expect(d.r2).toBeLessThan(d.r1);
    }
  });

  it('bullish charts: a lower low in price, a higher low in RSI', () => {
    for (const c of [series.T8_BULL, series.T8_APPLY, series.T8_Q_BULL]) {
      const d = pair(c);
      expect(c.swings.map((s) => s.type)).toEqual(['low', 'low']);
      expect(d.p2).toBeLessThan(d.p1);
      expect(d.r2).toBeGreaterThan(d.r1);
    }
  });

  it('no reversal: after the divergence price climbs higher, and never makes a lower low', () => {
    for (const c of [series.T8_FAIL, series.T8_Q_FAIL]) {
      const d = pair(c), after = c.slice(d.i2 + 1);
      expect(Math.max(...after.map((x) => x.h))).toBeGreaterThan(d.p2 * 1.03);
      const pullbackLow = Math.min(...c.slice(d.i1, d.i2).map((x) => x.l));
      expect(Math.min(...after.map((x) => x.l))).toBeGreaterThan(pullbackLow);
    }
  });

  it('the Try and Apply charts stop just after the second swing; what came next is kept as facts', () => {
    const t = series.T8_TRY, a = series.T8_APPLY;
    expect(t.length).toBe(pair(t).i2 + 5);
    expect(a.length).toBe(pair(a).i2 + 5);
    expect(t.after.minL).toBeLessThan(pair(t).p1);
    // Apply: the bullish divergence did not mark the bottom.
    expect(a.after.minL).toBeLessThan(pair(a).p2);
  });

  it('the exercise: both peaks within 3 candles, in order, and the comparison right', () => {
    const act = lessonContent('T8')!.activity!;
    if (act.kind !== 'markPoints') throw new Error('T8 marks the peaks');
    const [p1, p2] = act.points.map((p) => p.target);
    const ans = (picks: number[], choice: string): MarkPointsAnswer => ({ picks, active: 0, choice });
    expect(isRight(act, ans([p1! + 2, p2! - 3], 'lower'))).toBe(true);
    expect(markPointsFault(act, ans([p1!, p2!], 'higher'))).toBe(act.compare.wrong);
    expect(markPointsFault(act, ans([p1! - 10, p2!], 'lower'))).toBe(act.points[0]!.off);
    expect(markPointsFault(act, ans([p2!, p1!], 'lower'))).toBe(act.points[0]!.off);
  });
});

describe('divergence is only asked once it is taught', () => {
  it('no previous-build lesson quiz asks about divergence; T8 does', () => {
    for (const id of ['l0', 'l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7']) {
      const qs = questionsForLesson(id, allQuestions()) ?? [];
      for (const q of qs) expect(`${q.question.he} ${q.question.en}`, `${id} · ${q.id}`).not.toMatch(DIVERGENCE);
    }
    const t8 = questionsForLesson('T8', allQuestions())!;
    expect(t8.every((q) => q.chart !== undefined)).toBe(true); // the lesson page opens on its visual questions
    expect(lessonContent('T8')!.questions.map((q) => q.id)).toContain('q-rsi-3');
  });

  it('no lesson before T8 carries a divergence question in its practice or tutor set', () => {
    for (const id of ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']) {
      for (const q of lessonContent(id)!.questions) expect(`${q.question.he} ${q.question.en}`, `${id} · ${q.id}`).not.toMatch(DIVERGENCE);
    }
  });

  it('the old #/quiz/l6 page asks only what the RSI lesson teaches', () => {
    location.hash = '#/quiz/l6';
    render(<App />);
    expect(screen.getByRole('main').textContent).not.toMatch(DIVERGENCE);
  });
});

describe('T8 in the lesson workspace', () => {
  const openStep = (i: number) => fireEvent.click(within(screen.getByRole('navigation', { name: 'שלבי השיעור' })).getByRole('button', { name: lessonById('T8')!.steps!.he[i]! }));
  const footBtn = () => within(screen.getByRole('contentinfo')).getAllByRole('button').at(-1) as HTMLButtonElement;

  it('mark both peaks, compare RSI: the comparison is checked, and the right answer explains the relationship', () => {
    location.hash = '#/lesson/T8';
    render(<App />);
    expect(screen.getByRole('heading', { name: 'המחיר עלה גבוה יותר. גם המומנטום?' })).toBeTruthy();
    openStep(3);
    const act = lessonContent('T8')!.activity!;
    if (act.kind !== 'markPoints') throw new Error('T8 marks the peaks');
    expect(screen.queryByText(act.right.he)).toBeNull();
    expect(footBtn().disabled).toBe(true);
    const slider = () => screen.getByRole('slider');
    fireEvent.change(slider(), { target: { value: String(act.points[0]!.target) } });
    fireEvent.change(slider(), { target: { value: String(act.points[1]!.target) } });
    fireEvent.click(screen.getByRole('radio', { name: /שיא גבוה יותר — המומנטום הסכים/ }));
    fireEvent.click(footBtn());
    expect(screen.getByText(act.compare.wrong.he)).toBeTruthy();
    fireEvent.click(footBtn()); // try again: the marks stay, the comparison opens
    fireEvent.click(screen.getByRole('radio', { name: /שיא נמוך יותר — המחיר עלה/ }));
    fireEvent.click(footBtn());
    expect(screen.getByText(act.right.he)).toBeTruthy();
    expect(screen.getByText(act.explain![0]!.he)).toBeTruthy();
    expect(screen.getByRole('region', { name: 'יישום · גרף חדש' })).toBeTruthy();
  });

  it('in English', () => {
    localStorage.setItem('chartlab.lang', 'en');
    location.hash = '#/lesson/T8';
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Price went higher. Did momentum?' })).toBeTruthy();
  });
});
