import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { App } from '@ui/app/App';
import { lessonById, lessonsOf } from '@core/curriculum/curriculum';
import { lessonContent } from '@core/lessons/content';
import type { Diagram } from '@core/lessons/content';
import { isRight } from '@core/lessons/activities';
import { practiceItems, practicePass } from '@core/practice/trackPractice';
import { setSession } from '@ui/routes/practice/session';
import { dcfBreakdown, dcfPerShare } from '@core/calculators/tools';
import * as co from '@core/fundamentals/companies';
import * as series from '@core/charts/series.js';

beforeEach(() => {
  cleanup();
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
  setSession(null);
});

const P = lessonsOf('P').map((l) => l.id);
const { A, B, C, D } = co;
const iA = co.income(A.statement), iB = co.income(B.statement);

/** Every diagram in a lesson: teaching steps, the activity, Apply and the questions. */
function diagrams(id: string): Diagram[] {
  const c = lessonContent(id)!, out: Diagram[] = [];
  for (const t of c.teach) if (t.work.kind === 'diagram') out.push(t.work.diagram);
  const a = c.activity as { diagram?: Diagram } | undefined;
  if (a?.diagram) out.push(a.diagram);
  if (c.apply?.figure) out.push(c.apply.figure);
  for (const q of c.questions) if (q.figure) out.push(q.figure);
  return out;
}

describe('the fictional companies add up', () => {
  it('every balance sheet balances, and A carries the DCF\'s inputs', () => {
    for (const c of [A, B, D]) expect(co.balances(c.balance!), c.name.en).toBe(true);
    expect(co.freeCash(A.cash!)).toBe(400);
    expect(co.netDebt(A.balance!)).toBe(500);
    expect(A.statement.shares).toBe(200);
    expect(co.income(C.statement).net).toBeLessThan(0);
  });

  it('five years of history end on each company\'s own statement', () => {
    for (const [h, c] of [[co.A_HISTORY, A], [co.B_HISTORY, B]] as const) {
      const i = co.income(c.statement), n = h.years.length - 1;
      expect([h.rev[n], h.gross[n], h.op[n], h.net[n]]).toEqual([i.rev, i.gross, i.op, i.net]);
    }
  });

  it('every waterfall\'s totals are the running sums of its steps', () => {
    for (const id of P) for (const d of diagrams(id)) {
      if (d.type !== 'waterfall') continue;
      let run = 0;
      for (const s of d.steps) { if (s.total) expect(s.value, `${id} · ${s.label.en}`).toBeCloseTo(run === 0 ? s.value : run, 6); else run += s.value; if (s.total) run = s.value; }
    }
  });

  it('the lesson DCF is the tool\'s DCF', () => {
    const i = { fcf: 400, growthPct: A.growth!, discountPct: co.A_DCF.discountPct, terminalPct: co.A_DCF.terminalPct, netDebt: 500, shares: 200 };
    expect(dcfBreakdown(i).perShare).toBeCloseTo(dcfPerShare(i)!, 9);
  });
});

describe('what the lessons claim is what the data says', () => {
  it('P2: same revenue, close operating income, B\'s net income below half of A\'s — because of interest', () => {
    expect(iA.rev).toBe(iB.rev);
    expect(Math.abs(iA.op - iB.op) / iA.op).toBeLessThan(0.15);
    expect(iB.net).toBeLessThan(iA.net / 2);
    const gaps = (['cogs', 'sm', 'rd', 'ga', 'int', 'tax'] as const).map((k) => [k, (iB[k] - iA[k])] as const);
    // Below operating income, interest is the line that takes the most.
    expect(iB.int - iA.int).toBeGreaterThan(iB.tax - iA.tax);
    expect(gaps.find(([k]) => k === 'int')![1]).toBeGreaterThan(0);
  });

  it('P4: A\'s operating margin nearly doubled; B\'s revenue grew while its net income fell', () => {
    const op = co.margins(co.A_HISTORY, 'op');
    expect(op.at(-1)! / op[0]!).toBeGreaterThan(1.6);
    expect(co.B_HISTORY.rev.at(-1)!).toBeGreaterThan(co.B_HISTORY.rev[0]!);
    expect(co.B_HISTORY.net.at(-1)!).toBeLessThan(co.B_HISTORY.net[0]!);
  });

  it('P5: debt flatters B\'s ROE — almost double A\'s, with about the same ROIC; D\'s ROE rests on the business', () => {
    const rA = co.returns(A), rB = co.returns(B), rD = co.returns(D);
    expect(rB.roe / rA.roe).toBeGreaterThan(1.9);
    expect(Math.abs(rB.roic - rA.roic)).toBeLessThan(0.5);
    expect(Math.abs(rD.roic - rD.roe)).toBeLessThan(3);
    expect(co.netDebt(D.balance!)).toBeLessThan(0);
  });

  it('P6: B is cheapest by P/E and EV/EBITDA but not by P/B; D is cheapest for its growth', () => {
    const [mA, mB, mD] = [A, B, D].map(co.market);
    expect(mB!.pe!).toBeLessThan(Math.min(mA!.pe!, mD!.pe!));
    expect(mB!.evEbitda!).toBeLessThan(Math.min(mA!.evEbitda!, mD!.evEbitda!));
    expect(mB!.pb!).toBeGreaterThan(mA!.pb!);
    expect(mD!.peg!).toBeLessThan(Math.min(mA!.peg!, mB!.peg!));
    expect(co.market(C).pe).toBeNull();
  });

  it('P7–P8: B\'s coverage is thin and gets thinner; D beat, cut its guidance, and gapped down; B pays out more than it earns', () => {
    expect(co.strength(B).coverage).toBeLessThan(2.5);
    expect(iB.op / ((co.totalDebt(B.balance!) * co.B_REFI_RATE) / 100)).toBeLessThan(co.strength(B).coverage);
    expect(co.D_REPORT.actual.rev).toBeGreaterThan(co.D_REPORT.expected.rev);
    expect(co.D_REPORT.actual.eps).toBeGreaterThan(co.D_REPORT.expected.eps);
    expect(co.D_REPORT.guidance.after).toBeLessThan(co.D_REPORT.guidance.before);
    expect(series.P8_REPORT.gapOpen).toBeLessThan(series.P8_REPORT.prevClose * 0.95);
    expect(B.dividend!).toBeGreaterThan(iB.eps);
  });

  it('P9: most of the value is terminal value, and even the optimistic corner is far below A\'s price', () => {
    const m = dcfBreakdown({ fcf: 400, growthPct: 8, discountPct: 10, terminalPct: 2.5, netDebt: 500, shares: 200 });
    expect(m.pvTv / m.ev).toBeGreaterThan(0.7);
    expect(dcfPerShare({ fcf: 400, growthPct: 12, discountPct: 9, terminalPct: 2.5, netDebt: 500, shares: 200 })!).toBeLessThan(A.price!);
  });
});

describe('every Fundamentals lesson is complete', () => {
  it.each(P)('%s: a Try, an Apply on a figure, three visual questions, and practice opens on one', (id) => {
    const c = lessonContent(id)!;
    expect(c.activity).toBeTruthy();
    expect(c.apply?.figure ?? (c.apply?.chart !== undefined ? c.charts[c.apply.chart] : undefined)).toBeTruthy();
    const visual = c.questions.filter((q) => q.figure || q.chart !== undefined);
    expect(visual.length).toBeGreaterThanOrEqual(3);
    expect(c.questions[0]!.figure).toBeTruthy();
    for (const q of c.questions) expect(q.lesson).toBe(id);
  });

  it('the practice asks 9 questions and passes at 8', () => {
    const items = practiceItems('P', 1);
    expect(items).toHaveLength(9);
    expect(practicePass(items)).toBe(8);
  });
});

describe('Fundamentals in the lesson workspace', () => {
  const openStep = (id: string, i: number) => fireEvent.click(within(screen.getByRole('navigation', { name: 'שלבי השיעור' })).getByRole('button', { name: lessonById(id)!.steps!.he[i]! }));
  const footBtn = () => within(screen.getByRole('contentinfo')).getAllByRole('button').at(-1) as HTMLButtonElement;

  it('P2: the explorer explains any line; only B\'s interest line is the answer', () => {
    location.hash = '#/lesson/P2';
    render(<App />);
    openStep('P2', 3);
    const act = lessonContent('P2')!.activity!;
    if (act.kind !== 'explore') throw new Error('P2 explores the statement');
    expect(footBtn().disabled).toBe(true);
    const explorer = within(screen.getByRole('region', { name: act.title.he }));
    fireEvent.click(explorer.getByRole('button', { name: /רווח תפעולי/ }));
    expect(screen.getByText(`${iA.gross.toLocaleString('en-US')} − ${iA.sm} − ${iA.rd} − ${iA.ga} = ${iA.op}`)).toBeTruthy();
    fireEvent.click(footBtn());
    expect(screen.getByText(act.off.he)).toBeTruthy();
    fireEvent.click(footBtn());
    fireEvent.click(explorer.getByRole('button', { name: B.name.he }));
    fireEvent.click(explorer.getByRole('button', { name: /הוצאות מימון/ }));
    fireEvent.click(footBtn());
    expect(screen.getByText(act.right.he)).toBeTruthy();
    expect(isRight(act, { dataset: 'b', row: 'int' })).toBe(true);
  });

  it('P3: a known wrong turn in the current ratio is explained; the right one shows the working', () => {
    location.hash = '#/lesson/P3';
    render(<App />);
    openStep('P3', 3);
    const act = lessonContent('P3')!.activity!;
    if (act.kind !== 'calculate') throw new Error('P3 is a calculation');
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: (1 / co.currentRatio(A.balance!)).toFixed(2) } });
    fireEvent.click(footBtn());
    expect(screen.getByText(act.mistakes![0]!.why.he)).toBeTruthy();
    fireEvent.click(footBtn());
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: String(act.answer) } });
    fireEvent.click(footBtn());
    expect(screen.getByText(act.right.he)).toBeTruthy();
    expect(screen.getByRole('region', { name: 'יישום · גרף חדש' })).toBeTruthy();
  });

  it('P6: the comparison, question by question, on a table', () => {
    location.hash = '#/lesson/P6';
    render(<App />);
    openStep('P6', 3);
    const act = lessonContent('P6')!.activity!;
    if (act.kind !== 'checklist') throw new Error('P6 is a checklist');
    expect(screen.getAllByRole('table').length).toBeGreaterThan(0);
    for (const it of act.items) {
      const label = it.options.find((o) => o.key === it.correct)!.label.he;
      fireEvent.click(within(screen.getByRole('radiogroup', { name: it.question.he })).getByRole('radio', { name: new RegExp(label.slice(0, 12).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }));
    }
    fireEvent.click(footBtn());
    expect(screen.getByText(act.right.he)).toBeTruthy();
  });

  it('P1: the sort, all right', () => {
    location.hash = '#/lesson/P1';
    render(<App />);
    openStep('P1', 3);
    const act = lessonContent('P1')!.activity!;
    if (act.kind !== 'sort') throw new Error('P1 sorts');
    for (const it of act.items) {
      fireEvent.click(screen.getByRole('button', { name: it.label.he }));
      fireEvent.click(screen.getByRole('button', { name: `להעביר ל${act.bins.find((b) => b.id === it.bin)!.label.he}` }));
    }
    fireEvent.click(footBtn());
    expect(screen.getByText(act.right.he)).toBeTruthy();
  });
});

describe('the Fundamentals track, end to end', () => {
  const seed = (ids: string[]) => localStorage.setItem('chartlab.learning.v2', JSON.stringify({
    v: 2, lessons: Object.fromEntries(ids.map((id) => [id, { step: 6, completed: true }])), practice: {}, onboarding: null, lastLesson: null
  }));

  it('practice shows each question\'s figure, and passing it completes the track', async () => {
    seed(P);
    location.hash = '#/practice/P/run';
    render(<App />);
    const items = practiceItems('P', 1);
    for (let i = 0; i < items.length; i++) {
      const q = items[i]!.question;
      expect((await screen.findAllByRole('table')).length, q.id).toBeGreaterThan(0);
      fireEvent.click((await screen.findAllByRole('radio'))[q.options.findIndex((o) => o.key === q.correctKey)]!);
      fireEvent.click(screen.getByRole('button', { name: 'בדיקה' }));
      fireEvent.click(screen.getByRole('button', { name: i === items.length - 1 ? /לתוצאות/ : /לשאלה הבאה/ }));
    }
    expect(await screen.findByRole('heading', { name: 'המסלול הושלם' })).toBeTruthy();
    const rec = JSON.parse(localStorage.getItem('chartlab.learning.v2')!).practice.P;
    expect(rec).toEqual({ attempts: 1, best: 9, passed: true, total: 9 });
  });

  it('every Fundamentals lesson opens as a lesson, not a preview', () => {
    for (const id of P) {
      cleanup();
      location.hash = `#/lesson/${id}`;
      render(<App />);
      expect(screen.queryByText(/השיעור הזה עוד נכתב/), id).toBeNull();
    }
  });
});
