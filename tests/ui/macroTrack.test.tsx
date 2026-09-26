import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { App } from '@ui/app/App';
import { lessonById, lessonsOf, TRACKS } from '@core/curriculum/curriculum';
import { lessonContent } from '@core/lessons/content';
import { isRight, calcMistake } from '@core/lessons/activities';
import { practiceItems, practicePass } from '@core/practice/trackPractice';
import { setSession } from '@ui/routes/practice/session';
import * as m from '@core/macro/scenarios';
import * as series from '@core/charts/series.js';
import { generateAiReply, createConversationContext } from '@core/ai';

beforeEach(() => {
  cleanup();
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
  setSession(null);
});

const M = lessonsOf('M').map((l) => l.id);
const argmax = (xs: number[]) => xs.indexOf(Math.max(...xs));

describe('what the Macro lessons claim is what the data says', () => {
  it('M1: at the issue rate the bond is at par; a higher rate cuts far-off money most (the Try\'s answer)', () => {
    expect(m.bondPrice(1000, m.M1_BOND.coupon, m.M1_BOND.years, m.M1_BOND.coupon)).toBeCloseTo(1000, 6);
    const [lo, , hi] = m.RATE_LEVELS;
    const fall = (f: (r: number) => number) => f(hi) / f(lo) - 1;
    const bond = fall((r) => m.bondPrice(1000, m.M1_BOND.coupon, m.M1_BOND.years, r));
    const steady = fall((r) => m.pv(m.STEADY, r)), growth = fall((r) => m.pv(m.GROWTH, r));
    expect(growth).toBeLessThan(bond);
    expect(bond).toBeLessThan(steady);
    expect(steady).toBeLessThan(0);
    const act = lessonContent('M1')!.activity!;
    if (act.kind !== 'explore') throw new Error('M1 explores the rate');
    expect(act.target).toEqual({ dataset: String(hi), row: 'growth' });
    // The long bond in Apply falls more than the short one.
    const { coupon, from, to, short, long } = m.M1_SHORT_LONG;
    expect(m.bondPrice(1000, coupon, long, to) / m.bondPrice(1000, coupon, long, from)).toBeLessThan(m.bondPrice(1000, coupon, short, to) / m.bondPrice(1000, coupon, short, from));
  });

  it('M2: one inflation peak; the bank starts above target, and keeps raising after the peak', () => {
    const peak = argmax(m.M2_CPI);
    expect(m.M2_CPI.filter((x) => x === m.M2_CPI[peak])).toHaveLength(1);
    expect(m.M2_CPI[m.M2_START]!).toBeGreaterThan(m.TARGET * 2);
    expect(m.M2_RATE[m.M2_START - 1]).toBeLessThan(m.M2_RATE[m.M2_START]!);
    expect(argmax(m.M2_RATE)).toBeGreaterThan(peak);
    expect(m.M2_RATE[peak]! - m.M2_CPI[peak]!).toBeLessThan(0);
    expect(m.realValue(100, 8, 10)).toBeLessThan(50);
    const t = lessonContent('M2')!.teach[2].work;
    expect(t.kind === 'diagram' && t.diagram.type === 'table' && t.diagram.badge?.en).toBe('Historical, rounded');
  });

  it('M3: a four-quarter recession; the index peaks before it and bottoms inside it', () => {
    const rec = m.recessionOf(m.M3_GDP);
    expect(m.M3_GDP.slice(rec.from, rec.to + 1).every((g) => g < 0)).toBe(true);
    expect(rec.to - rec.from + 1).toBeGreaterThanOrEqual(2);
    const low = m.M3_INDEX.indexOf(Math.min(...m.M3_INDEX));
    expect(low).toBeGreaterThanOrEqual(rec.from);
    expect(low).toBeLessThan(rec.to);
    expect(argmax(m.M3_INDEX.slice(0, rec.from))).toBeLessThan(rec.from - 1);
  });

  it('M4: the Try\'s bond is below par; a discount means a yield above the coupon; the long bond is the sensitive one', () => {
    const t = m.M4_TRY;
    expect(m.bondPrice(t.face, t.coupon, t.years, t.yield)).toBeCloseTo(946.54, 2);
    expect(m.ytm(m.M4_PRICES[0]!, 1000, m.M4_BOND.coupon, m.M4_BOND.years)).toBeGreaterThan(m.M4_BOND.coupon);
    expect(m.ytm(m.M4_PRICES[2]!, 1000, m.M4_BOND.coupon, m.M4_BOND.years)).toBeLessThan(m.M4_BOND.coupon);
    expect(m.ytm(1000, 1000, m.M4_BOND.coupon, m.M4_BOND.years)).toBeCloseTo(m.M4_BOND.coupon, 6);
    expect(m.duration(1000, 4, 10, 4)).toBeGreaterThan(m.duration(1000, 4, 2, 4) * 3);
    const act = lessonContent('M4')!.activity!;
    if (act.kind !== 'calculate') throw new Error('M4 is a calculation');
    expect(isRight(act, 946.5)).toBe(true);
    expect(calcMistake(act, 1000)).toBe(act.mistakes![0]);
  });

  it('M5: the Try\'s curves are normal, flat and inverted; the recession comes after the inversion', () => {
    const s = (c: number[]) => c[3]! - c[1]!;
    expect(s(m.CURVES_TRY.A)).toBeGreaterThan(1);
    expect(Math.abs(s(m.CURVES_TRY.B))).toBeLessThan(0.2);
    expect(s(m.CURVES_TRY.C)).toBeLessThan(0);
    expect(s(m.CURVE_INVERTED)).toBeLessThan(0);
    expect(m.M5_SPREAD.findIndex((x) => x < 0)).toBeLessThan(m.M5_RECESSION.from);
    expect(m.M5_SPREAD[m.M5_RECESSION.from]!).toBeGreaterThan(0);
    expect(m.M5_APPLY.ten - m.M5_APPLY.two).toBeLessThan(0);
  });

  it('M6: currency moves compound; the Try\'s stock rises and the investor still loses', () => {
    expect(m.inShekels(10, -5)).toBeCloseTo(4.5, 9);
    expect(m.inShekels(m.FX_TRY.stock, m.FX_TRY.dollar)).toBeLessThan(0);
    expect(m.inShekels(m.FX_Q.stock, m.FX_Q.dollar)).toBeGreaterThan(0);
  });

  it('M7: a climb into news that then falls; a slide into a decision that then recovers; the arbitrage runs the right way', () => {
    const n = series.M7_NEWS, r = series.M7_RATE;
    expect(n[n.length - 1]!.c).toBeLessThan(n.swings[0]!.price);
    expect(n[0]!.c).toBeLessThan(n.swings[0]!.price);
    expect(r[r.length - 1]!.c).toBeGreaterThan(r.swings[0]!.price);
    expect(m.ARB.tase).toBeGreaterThan(m.ARB.usd * m.ARB.rate);
    expect(m.ARB_Q.tase).toBeLessThan(m.ARB_Q.usd * m.ARB_Q.rate);
  });
});

describe('every Macro lesson is complete', () => {
  it.each(M)('%s: a Try, an Apply on a figure or chart, and three visual questions', (id) => {
    const c = lessonContent(id)!;
    expect(c.activity).toBeTruthy();
    expect(c.apply?.figure ?? (c.apply?.chart !== undefined ? c.charts[c.apply.chart] : undefined)).toBeTruthy();
    expect(c.questions.filter((q) => q.figure || q.chart !== undefined)).toHaveLength(3);
    for (const q of c.questions) expect(q.lesson).toBe(id);
  });

  it('the tutor is asked about a knowledge-base topic each lesson itself lists', () => {
    for (const id of M) expect(lessonById(id)!.kbTopics, id).toContain(lessonContent(id)!.tutor.topic);
  });

  it("the tutor answers each lesson's question from the knowledge base, in both languages", async () => {
    const ask: Record<string, [string, string]> = {
      M1: ['מה זה ריבית?', 'What is an interest rate?'], M2: ['מה זה אינפלציה?', 'What is inflation?'], M3: ['מה זה מיתון?', 'What is a recession?'],
      M4: ['מה זה אג״ח?', 'What is a bond?'], M5: ['מה זה עקום תשואות?', 'What is the yield curve?'], M6: ['למה הדולר מתחזק?', 'Why does the dollar get stronger?'],
      M7: ['מה זה מגולם במחיר?', 'What does priced in mean?']
    };
    for (const id of M) {
      for (const [q, lang] of [[ask[id]![0], 'he'], [ask[id]![1], 'en']] as const) {
        const r = await generateAiReply(q, lang, null, createConversationContext());
        expect(r.topicId, `${id}: ${q}`).toBe(lessonContent(id)!.tutor.topic);
      }
    }
    expect((await generateAiReply('מה זה עושה שוק?', 'he', null, createConversationContext())).topicId).toBe('market-makers');
  });

  it('the practice asks 7 questions and passes at 6', () => {
    const items = practiceItems('M', 1);
    expect(items).toHaveLength(7);
    expect(practicePass(items)).toBe(6);
  });
});

describe('Macro in the lesson workspace', () => {
  const openStep = (id: string, i: number) => fireEvent.click(within(screen.getByRole('navigation', { name: 'שלבי השיעור' })).getByRole('button', { name: lessonById(id)!.steps!.he[i]! }));
  const footBtn = () => within(screen.getByRole('contentinfo')).getAllByRole('button').at(-1) as HTMLButtonElement;

  it('M1: move the rate, read any line — only the growth company at the top rate is the answer', () => {
    location.hash = '#/lesson/M1';
    render(<App />);
    openStep('M1', 3);
    const act = lessonContent('M1')!.activity!;
    if (act.kind !== 'explore') throw new Error('M1 explores the rate');
    const explorer = within(screen.getByRole('region', { name: act.title.he }));
    expect(explorer.getByRole('group', { name: 'רמת הריבית' })).toBeTruthy();
    fireEvent.click(explorer.getByRole('button', { name: /אג״ח קיים/ }));
    fireEvent.click(footBtn());
    expect(screen.getByText(act.off.he)).toBeTruthy();
    fireEvent.click(footBtn());
    fireEvent.click(within(explorer.getByRole('group', { name: 'רמת הריבית' })).getByRole('button', { name: `${m.RATE_LEVELS[2]}%` }));
    fireEvent.click(explorer.getByRole('button', { name: /חברת צמיחה/ }));
    fireEvent.click(footBtn());
    expect(screen.getByText(act.right.he)).toBeTruthy();
  });

  it('M2: reading the chart, question by question', () => {
    location.hash = '#/lesson/M2';
    render(<App />);
    openStep('M2', 3);
    const act = lessonContent('M2')!.activity!;
    if (act.kind !== 'checklist') throw new Error('M2 is a checklist');
    expect(screen.getByRole('img', { name: /אינפלציה \(שיעור שנתי\)/ })).toBeTruthy();
    for (const it of act.items) {
      const label = it.options.find((o) => o.key === it.correct)!.label.he;
      fireEvent.click(within(screen.getByRole('radiogroup', { name: it.question.he })).getByRole('radio', { name: new RegExp(label.slice(0, 8).replace(/[.*+?^${}()|[\]\\−]/g, '\\$&')) }));
    }
    fireEvent.click(footBtn());
    expect(screen.getByText(act.right.he)).toBeTruthy();
  });
});

describe('the Macro track, end to end', () => {
  const seed = (ids: string[]) => localStorage.setItem('chartlab.learning.v2', JSON.stringify({
    v: 2, lessons: Object.fromEntries(ids.map((id) => [id, { step: 6, completed: true }])), practice: {}, onboarding: null, lastLesson: null
  }));

  it('Macro is open from the start: its prerequisite is only a recommendation', () => {
    expect(TRACKS.find((t) => t.id === 'M')!.prereq).toEqual({ soft: 'F' });
    location.hash = '#/track/M';
    render(<App />);
    expect(within(screen.getByRole('main')).queryByText('המסלול נעול')).toBeNull();
    expect(within(screen.getByRole('main')).getByRole('button', { name: /להתחיל: שיעור 1/ })).toBeTruthy();
  });

  it('passing the practice completes the track', async () => {
    seed(M);
    location.hash = '#/practice/M/run';
    render(<App />);
    const items = practiceItems('M', 1);
    for (let i = 0; i < items.length; i++) {
      const q = items[i]!.question;
      fireEvent.click((await screen.findAllByRole('radio'))[q.options.findIndex((o) => o.key === q.correctKey)]!);
      fireEvent.click(screen.getByRole('button', { name: 'בדיקה' }));
      fireEvent.click(screen.getByRole('button', { name: i === items.length - 1 ? /לתוצאות/ : /לשאלה הבאה/ }));
    }
    expect(await screen.findByRole('heading', { name: 'המסלול הושלם' })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('chartlab.learning.v2')!).practice.M).toEqual({ attempts: 1, best: 7, passed: true, total: 7 });
  });

  it('every Macro lesson opens as a lesson, not a preview', () => {
    for (const id of M) {
      cleanup();
      location.hash = `#/lesson/${id}`;
      render(<App />);
      expect(screen.queryByText(/השיעור הזה עוד נכתב/), id).toBeNull();
    }
  });
});
