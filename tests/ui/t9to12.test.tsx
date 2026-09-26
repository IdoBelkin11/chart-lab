import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { App } from '@ui/app/App';
import * as series from '@core/charts/series.js';
import { lessonById } from '@core/curriculum/curriculum';
import { lessonContent } from '@core/lessons/content';
import { calcMistake, isRight, markPointsFault } from '@core/lessons/activities';
import type { ClassifyAnswer, MarkPointsAnswer } from '@core/lessons/activities';
import { retryAnswer } from '@ui/components/activities/Activities';

beforeEach(() => {
  cleanup();
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
});

type C = Array<{ o: number; h: number; l: number; c: number; v: number }>;
const low = (c: C, a: number, b = c.length) => Math.min(...c.slice(a, b).map((x) => x.l));
const high = (c: C, a: number, b = c.length) => Math.max(...c.slice(a, b).map((x) => x.h));
const firstClose = (c: C, from: number, lvl: number, below: boolean) => c.findIndex((x, i) => i > from && (below ? x.c < lvl : x.c > lvl));
const volX = (c: C & { breakIdx: number }) => c[c.breakIdx]!.v / (c.slice(0, c.breakIdx).reduce((s, x) => s + x.v, 0) / c.breakIdx);

describe('T9 — the swings are where the lesson says, and the percentages follow from them', () => {
  const move = (c: typeof series.T9_MOVE) => { const [a, b, p] = c.swings; return { a: a!, b: b!, p: p!, pct: (Math.abs(b!.price - p!.price) / Math.abs(b!.price - a!.price)) * 100 }; };

  it('each move runs from its start to its end, and the pullback stops where stated', () => {
    for (const c of [series.T9_MOVE, series.T9_TRY, series.T9_Q_LEVEL, series.T9_Q_PRICE]) {
      const { a, b, p } = move(c);
      expect([a.type, b.type, p.type]).toEqual(['low', 'high', 'low']);
      expect(low(c, 0, b.idx)).toBe(a.price);
      expect(high(c, a.idx, p.idx)).toBe(b.price);
      expect(low(c, b.idx, c.length)).toBe(p.price); // the pullback's low is the lowest after the high
    }
    for (const c of [series.T9_DOWN, series.T9_Q_DOWN]) {
      const { a, b, p } = move(c);
      expect([a.type, b.type, p.type]).toEqual(['high', 'low', 'high']);
      expect(low(c, a.idx, p.idx)).toBe(b.price);
      expect(high(c, b.idx, p.idx + 1)).toBe(p.price);
    }
  });

  it('the Artifact\'s move (90 → 120 → 101.50) sits on 61.8%; the rest on the levels the lesson names', () => {
    expect(move(series.T9_MOVE).pct).toBeCloseTo(61.7, 1);
    expect(Math.abs(move(series.T9_TRY).pct - 38.2)).toBeLessThan(0.2);
    expect(move(series.T9_Q_LEVEL).pct).toBe(50);
    expect(Math.abs(move(series.T9_Q_DOWN).pct - 38.2)).toBeLessThan(0.5);
    expect(Math.abs(move(series.T9_DOWN).pct - 38.2)).toBeLessThan(0.5);
    // Apply: the pullback goes below the low the tool was drawn from.
    const ap = move(series.T9_APPLY);
    expect(ap.p.price).toBeLessThan(ap.a.price);
  });

  it('the calculation: right within rounding; the known wrong turns explain themselves', () => {
    const act = lessonContent('T9')!.activity!;
    if (act.kind !== 'calculate') throw new Error('T9 is a calculation');
    expect(act.chart).toBe(3);
    expect(isRight(act, 38.3)).toBe(true);
    expect(isRight(act, 38)).toBe(true);
    expect(isRight(act, 61.7)).toBe(false);
    expect(calcMistake(act, 61.7)).toBe(act.mistakes![0]);
    expect(calcMistake(act, 11.5)).toBe(act.mistakes![1]);
  });
});

describe('T10 — the patterns are really there, and so are their outcomes', () => {
  const hs = (c: typeof series.T10_TRY) => { const [ls, t1, h, t2, rs] = c.swings; return { ls: ls!, t1: t1!, h: h!, t2: t2!, rs: rs!, neck: (t1!.price + t2!.price) / 2 }; };

  it('head and shoulders: the head is the highest, the shoulders lower; the neckline breaks after the right shoulder', () => {
    for (const c of [series.T10_TRY, series.T10_Q_HS, series.T10_Q_FAIL]) {
      const x = hs(c);
      expect(high(c, 0, x.rs.idx + 1)).toBe(x.h.price);
      expect(x.ls.price).toBeLessThan(x.h.price);
      expect(x.rs.price).toBeLessThan(x.h.price);
      expect(firstClose(c, x.rs.idx, x.neck, true)).toBeGreaterThan(x.rs.idx);
    }
    // The Try: price fell after the break, but not as far as the measured target.
    const t = hs(series.T10_TRY), target = t.neck - (t.h.price - t.neck);
    expect(low(series.T10_TRY, t.rs.idx)).toBeGreaterThan(target);
    // The failed one: after the break price climbed past the head.
    const f = hs(series.T10_Q_FAIL);
    expect(high(series.T10_Q_FAIL, f.rs.idx)).toBeGreaterThan(f.h.price);
  });

  it('the Apply double top never closes below its low; the double bottom breaks up but stops short of its target', () => {
    const ap = series.T10_APPLY;
    expect(firstClose(ap, ap.swings[2]!.idx, ap.swings[1]!.price, true)).toBe(-1);
    const db = series.T10_Q_DB, neck = db.swings[1]!.price, target = neck + (neck - db.swings[0]!.price);
    const brk = firstClose(db, db.swings[2]!.idx, neck, false);
    expect(brk).toBeGreaterThan(0);
    expect(high(db, brk)).toBeLessThan(target);
  });

  it('the exercise: three marks in order, then the neckline as what completes it', () => {
    const act = lessonContent('T10')!.activity!;
    if (act.kind !== 'markPoints') throw new Error('T10 marks the pattern');
    const t = act.points.map((p) => p.target);
    const ans = (picks: number[], choice: string): MarkPointsAnswer => ({ picks, active: 0, choice });
    expect(isRight(act, ans([t[0]! + 3, t[1]! - 2, t[2]!], 'neck'))).toBe(true);
    expect(markPointsFault(act, ans(t, 'shoulder'))).toBe(act.compare.wrong);
    expect(markPointsFault(act, ans([t[1]!, t[0]!, t[2]!], 'neck'))).toBe(act.points[0]!.off);
  });
});

describe('T11 — the break decides, and the question charts stop before it', () => {
  it('six sketches, three of each; none shows its break', () => {
    const act = lessonContent('T11')!.activity!;
    if (act.kind !== 'classify') throw new Error('T11 sorts sketches');
    expect(act.items).toHaveLength(6);
    expect(act.items.filter((i) => i.answer === 'rev')).toHaveLength(3);
    expect(act.showSwings).toBe(false);
  });

  it('the question charts end before the outcome the explanation reveals', () => {
    const c = lessonContent('T11')!;
    const qf = series.T11_Q_FLAG, qt = series.T11_Q_TRI;
    const qfBreak = firstClose(qf, qf.swings[3]!.idx, qf.swings[0]!.price, false);
    const qtBreak = firstClose(qt, qt.swings[4]!.idx, Math.min(qt.swings[1]!.price, qt.swings[3]!.price), true);
    expect((c.charts[5]!.candles as unknown[]).length).toBeLessThan(qfBreak);
    expect((c.charts[7]!.candles as unknown[]).length).toBeLessThan(qtBreak);
    // …and no close beyond the pattern happens inside what is shown.
    const shownF = qf.slice(0, (c.charts[5]!.candles as unknown[]).length);
    expect(Math.max(...shownF.slice(qf.swings[0]!.idx + 1).map((x) => x.c))).toBeLessThan(qf.swings[0]!.price);
  });

  it('the equal peaks never close below the low between them; the Apply flag breaks down', () => {
    const qc = series.T11_Q_CONTEXT;
    expect(firstClose(qc, qc.swings[2]!.idx, qc.swings[1]!.price, true)).toBe(-1);
    expect(high(qc, qc.swings[2]!.idx)).toBeGreaterThan(qc.swings[2]!.price + 3);
    const ap = series.T11_APPLY, floor = Math.min(ap.swings[1]!.price, ap.swings[3]!.price);
    const brk = firstClose(ap, ap.swings[4]!.idx, floor, true);
    expect(brk).toBeGreaterThan(0);
    expect(low(ap, brk)).toBeLessThan(floor - 5);
  });
});

describe('T12 — every tool reads the way the lesson says', () => {
  it('the Try: an uptrend, a thin breakout, RSI lower than at the last test; the ceiling holds afterwards', () => {
    const c = series.T12_CASE, peak = c.swings[2]!, b = c.breakIdx;
    expect(c.swings[3]!.price).toBeGreaterThan(c.swings[1]!.price); // rising lows
    expect(c.ma50[b]!).toBeGreaterThan(c.ma50[b - 20]!);
    expect(c[b]!.c).toBeGreaterThan(c.resist[1]);
    expect(high(c, 0, b)).toBeLessThanOrEqual(c.resist[1]);
    expect(volX(c)).toBeLessThan(0.7);
    expect(c[b]!.h).toBeGreaterThan(peak.price);
    expect(c.rsi[b]!).toBeLessThan(c.rsi[peak.idx]! - 3);
    expect(low(c, b + 1)).toBeGreaterThan(c.resist[0]);
  });

  it('the agreeing case, the conflict, the stretched breakout and the fading trend', () => {
    const a = series.T12_Q_AGREE;
    expect(volX(a)).toBeGreaterThan(2);
    expect(a.rsi[a.breakIdx]!).toBeGreaterThan(a.rsi[a.swings[2]!.idx]!);
    const t = series.T12_TEACH, [, p2, p3] = t.swings.filter((s) => s.type === 'high');
    expect(p3!.price).toBeGreaterThan(p2!.price);
    expect(t.rsi[p3!.idx]!).toBeLessThan(t.rsi[p2!.idx]!);
    const ap = series.T12_APPLY;
    expect(volX(ap)).toBeGreaterThan(2.5);
    expect(ap.rsi[ap.breakIdx]!).toBeGreaterThan(70);
    const d = series.T12_Q_DIV, hs = d.swings.filter((s) => s.type === 'high');
    expect(hs.map((s) => s.price)).toEqual([...hs.map((s) => s.price)].sort((x, y) => x - y));
    expect(d.rsi[hs[2]!.idx]!).toBeLessThan(d.rsi[hs[1]!.idx]!);
    expect(d.rsi[hs[1]!.idx]!).toBeLessThan(d.rsi[hs[0]!.idx]!);
    expect(low(d, hs[2]!.idx)).toBeGreaterThan(d.swings[3]!.price);
  });

  it('the checklist: right only when every answer is; a retry keeps the right ones', () => {
    const act = lessonContent('T12')!.activity!;
    if (act.kind !== 'checklist') throw new Error('T12 is a checklist');
    const all: ClassifyAnswer = Object.fromEntries(act.items.map((i) => [i.id, i.correct]));
    expect(isRight(act, all)).toBe(true);
    const oneWrong = { ...all, overall: 'buy' };
    expect(isRight(act, oneWrong)).toBe(false);
    expect(retryAnswer(act, oneWrong)).toEqual(Object.fromEntries(act.items.filter((i) => i.id !== 'overall').map((i) => [i.id, i.correct])));
  });
});

describe('T9–T12 in the lesson workspace', () => {
  const openStep = (id: string, i: number) => fireEvent.click(within(screen.getByRole('navigation', { name: 'שלבי השיעור' })).getByRole('button', { name: lessonById(id)!.steps!.he[i]! }));
  const footBtn = () => within(screen.getByRole('contentinfo')).getAllByRole('button').at(-1) as HTMLButtonElement;

  it('T9: a known wrong turn gets its own explanation; the right answer shows the working and the Apply', () => {
    location.hash = '#/lesson/T9';
    render(<App />);
    openStep('T9', 3);
    const act = lessonContent('T9')!.activity!;
    if (act.kind !== 'calculate') throw new Error('T9 is a calculation');
    expect(screen.queryByText(act.right.he)).toBeNull();
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '61.7' } });
    fireEvent.click(footBtn());
    expect(screen.getByText(act.mistakes![0]!.why.he)).toBeTruthy();
    fireEvent.click(footBtn());
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '38.3' } });
    fireEvent.click(footBtn());
    expect(screen.getByText(act.right.he)).toBeTruthy();
    expect(screen.getByText('החישוב, צעד אחר צעד')).toBeTruthy();
    expect(screen.getByRole('region', { name: 'יישום · גרף חדש' })).toBeTruthy();
  });

  it('T10: mark shoulder, head, shoulder, then say what completes it', () => {
    location.hash = '#/lesson/T10';
    render(<App />);
    openStep('T10', 3);
    const act = lessonContent('T10')!.activity!;
    if (act.kind !== 'markPoints') throw new Error('T10 marks the pattern');
    for (const p of act.points) fireEvent.change(screen.getByRole('slider'), { target: { value: String(p.target) } });
    fireEvent.click(screen.getByRole('radio', { name: /סגירה מתחת לקו שמחבר/ }));
    fireEvent.click(footBtn());
    expect(screen.getByText(act.right.he)).toBeTruthy();
    expect(screen.getByText(act.explain![0]!.he)).toBeTruthy();
  });

  it('T11: every sketch sorted; each answer shows why only once picked', () => {
    location.hash = '#/lesson/T11';
    render(<App />);
    openStep('T11', 3);
    const act = lessonContent('T11')!.activity!;
    if (act.kind !== 'classify') throw new Error('T11 sorts sketches');
    expect(screen.queryByText(act.items[0]!.why.he)).toBeNull();
    const cards = screen.getAllByRole('group', { name: /היפוך או המשך\?/ });
    expect(cards).toHaveLength(6);
    act.items.forEach((it, i) => fireEvent.click(within(cards[i]!).getByRole('button', { name: it.answer === 'rev' ? 'היפוך' : 'המשך' })));
    expect(screen.getByText(act.items[0]!.why.he)).toBeTruthy();
    fireEvent.click(footBtn());
    expect(screen.getByText(act.right.he)).toBeTruthy();
  });

  it('T12: each answer locks and explains; one wrong answer is retried alone', () => {
    location.hash = '#/lesson/T12';
    render(<App />);
    openStep('T12', 3);
    const act = lessonContent('T12')!.activity!;
    if (act.kind !== 'checklist') throw new Error('T12 is a checklist');
    const pick = (i: number, key: string) => {
      const item = act.items[i]!, label = item.options.find((o) => o.key === key)!.label.he;
      fireEvent.click(within(screen.getByRole('radiogroup', { name: item.question.he })).getByRole('radio', { name: new RegExp(label.slice(0, 14).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }));
    };
    act.items.forEach((it, i) => pick(i, i === act.items.length - 1 ? 'buy' : it.correct));
    expect(screen.getByText(act.items[0]!.why.he)).toBeTruthy();
    fireEvent.click(footBtn());
    expect(screen.getByText(`${act.items.length - 1} מתוך ${act.items.length} נכונים`)).toBeTruthy();
    fireEvent.click(footBtn()); // try again: only the wrong one opens
    pick(act.items.length - 1, 'caution');
    fireEvent.click(footBtn());
    expect(screen.getByText(act.right.he)).toBeTruthy();
    expect(screen.getByRole('region', { name: 'יישום · גרף חדש' })).toBeTruthy();
  });
});
