import { describe, it, expect } from 'vitest';
import { LESSONS, lessonById } from '@core/curriculum/curriculum';
import { hasContent } from '@core/curriculum/trackInfo';
import { allQuestions, lessonContent, questionChart } from '@core/lessons/content';
import { FOUNDATIONS } from '@core/lessons/content/foundations';
import { TECHNICAL as T2_T5 } from '@core/lessons/content/technical';
import { T1 } from '@core/lessons/content/t1';
import { T6 } from '@core/lessons/content/t6';
import { T7 } from '@core/lessons/content/t7';
import { T8 } from '@core/lessons/content/t8';
import { T9 } from '@core/lessons/content/t9';
import { T10 } from '@core/lessons/content/t10';
import { T11 } from '@core/lessons/content/t11';
import { T12 } from '@core/lessons/content/t12';
import { FUNDAMENTALS_1 } from '@core/lessons/content/p1to3';
import { FUNDAMENTALS_2 } from '@core/lessons/content/p4to6';
import { FUNDAMENTALS_3 } from '@core/lessons/content/p7to9';
import { RISK_1 } from '@core/lessons/content/r1to3';
import { RISK_2 } from '@core/lessons/content/r4to6';
import { RISK_3 } from '@core/lessons/content/r7to8';
import { MACRO_1 } from '@core/lessons/content/m1to3';
import { MACRO_2 } from '@core/lessons/content/m4to6';
import { MACRO_3 } from '@core/lessons/content/m7';

const TECHNICAL = [T1, ...T2_T5, T6, T7, T8, T9, T10, T11, T12];
const FUNDAMENTALS = [...FUNDAMENTALS_1, ...FUNDAMENTALS_2, ...FUNDAMENTALS_3, ...RISK_1, ...RISK_2, ...RISK_3, ...MACRO_1, ...MACRO_2, ...MACRO_3];
import { sketchSwings } from '@core/lessons/activities';
import { executeBuy, tasksMet } from '@core/lessons/orderBook';
import * as series from '@core/charts/series.js';

// Every written lesson — carried over or new — has the same complete shape,
// so the workspace, the tutor and practice can rely on it.
const written = LESSONS.filter((l) => hasContent(l.id));

/** Every { he, en } in a value, with where it sits. */
function localized(v: unknown, path: string, out: Array<[string, { he: unknown; en: unknown }]> = []) {
  if (Array.isArray(v)) v.forEach((x, i) => localized(x, `${path}[${i}]`, out));
  else if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    if ('he' in o && 'en' in o && Object.keys(o).length === 2) out.push([path, o as { he: unknown; en: unknown }]);
    else for (const [k, x] of Object.entries(o)) if (k !== 'candles' && k !== 'values') localized(x, `${path}.${k}`, out);
  }
  return out;
}

describe('the lesson content model', () => {
  it('covers Foundations and the whole TA, Fundamentals, Risk and Macro tracks', () => {
    expect(written.map((l) => l.id)).toEqual(['F1', 'F2', 'F3', 'F4', 'F5', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7']);
    // Every TA lesson is in the content model; T9 and T10 keep their old ids only for #/quiz/l5 and l7.
    for (const t of TECHNICAL) expect(lessonContent(t.id)).toBe(t);
    expect(lessonContent('T9')!.legacyId).toBe('l5');
    expect(lessonContent('T10')!.legacyId).toBe('l7');
    // T2, T4 and T5 are written in the content model now, not read through the adapter.
    for (const id of ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8']) expect(lessonContent(id)!.legacyId, id).toBeUndefined();
  });

  it.each(written.map((l) => l.id))('%s is complete: 7 step titles, 3 teaching steps, 3+ questions, valid charts', (id) => {
    const c = lessonContent(id)!;
    const steps = lessonById(id)!.steps!;
    expect(steps.he).toHaveLength(7);
    expect(steps.en).toHaveLength(7);
    expect(c.teach).toHaveLength(3);
    for (const t of c.teach) {
      if (t.work.kind === 'charts') for (const i of t.work.charts) expect(c.charts[i], `${id} chart ${i}`).toBeTruthy();
      if (t.work.kind === 'cards') expect(c.cards?.length).toBeGreaterThan(0);
    }
    expect(c.questions.length).toBeGreaterThanOrEqual(3);
    for (const q of c.questions) {
      expect(q.options).toHaveLength(4);
      expect(q.options.map((o) => o.key)).toContain(q.correctKey);
    }
    if (c.activity && 'chart' in c.activity && c.activity.chart !== undefined) expect(c.charts[c.activity.chart]).toBeTruthy();
    // A prediction's chart is never shown while teaching: it would give the answer away.
    if (c.activity?.kind === 'predict') {
      const shown = c.teach.flatMap((t) => (t.work.kind === 'charts' ? t.work.charts : []));
      expect(shown).not.toContain(c.activity.chart);
    }
  });

  it.each([...FOUNDATIONS, ...TECHNICAL, ...FUNDAMENTALS].map((c) => c.id))('%s is fully bilingual, with real prose on every teaching step', (id) => {
    const c = lessonContent(id)!;
    for (const [path, l] of localized(c, id)) {
      expect(typeof l.he === 'string' && l.he.trim().length > 0, `${path}.he`).toBe(true);
      expect(typeof l.en === 'string' && l.en.trim().length > 0, `${path}.en`).toBe(true);
      // Hebrew text is Hebrew; English text has no Hebrew in it.
      expect(/[֐-׿]/.test(l.en as string), `${path}.en`).toBe(false);
    }
    for (const t of c.teach) {
      expect(t.paragraphs.length).toBeGreaterThan(0);
      expect(t.paragraphs.map((p) => p.he).join(' ').length).toBeGreaterThan(250);
    }
  });

  it('every order-book figure lists sell offers cheapest first and buy offers highest first', () => {
    for (const l of written) for (const t of lessonContent(l.id)!.teach) {
      if (t.work.kind !== 'diagram' || t.work.diagram.type !== 'book') continue;
      const { asks, bids } = t.work.diagram;
      expect(asks.every((x, i) => i === 0 || x[0] > asks[i - 1]![0]), l.id).toBe(true);
      expect(bids.every((x, i) => i === 0 || x[0] < bids[i - 1]![0]), l.id).toBe(true);
      expect(asks[0]![0]).toBeGreaterThan(bids[0]![0]);
    }
  });

  it('question ids are unique across the whole bank', () => {
    const ids = allQuestions().map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('Foundations — every figure in the prose adds up', () => {
  it('F2: the weighted index rises 0.95% while 3 of 5 stocks fall', () => {
    const d = lessonContent('F2')!.teach[2].work;
    if (d.kind !== 'diagram' || d.diagram.type !== 'weights') throw new Error('F2 step 3 shows the weights');
    const m = d.diagram.members;
    expect(m.reduce((s, x) => s + x.weight, 0)).toBe(100);
    expect(m.reduce((s, x) => s + (x.weight * x.change) / 100, 0)).toBeCloseTo(0.95, 10);
    expect(m.filter((x) => x.change < 0)).toHaveLength(3);
    // "B, C and D … take just 0.6% off"; "A's 3% adds 1.5%".
    expect(m.filter((x) => x.change < 0).reduce((s, x) => s + (x.weight * x.change) / 100, 0)).toBeCloseTo(-0.6, 10);
    expect((m[0]!.weight * m[0]!.change) / 100).toBe(1.5);
  });

  it('F3: the gap down is about 8%, the report gap up about 10%, and nothing trades inside a gap', () => {
    const g = series.F3_GAPDOWN;
    expect(g.gapOpen / g.prevClose - 1).toBeCloseTo(-0.08, 2);
    expect(g[g.gapIdx]!.h).toBeLessThan(g[g.gapIdx - 1]!.l);
    const b = series.F3_BEAT;
    expect(b[b.gapIdx]!.o / b[b.gapIdx - 1]!.c - 1).toBeGreaterThan(0.08);
    expect(b[b.gapIdx]!.o / b[b.gapIdx - 1]!.c - 1).toBeLessThan(0.12);
    expect(b[b.gapIdx]!.l).toBeGreaterThan(b[b.gapIdx - 1]!.h);
    // Market cap: 200M shares from 40 to 44.
    expect(200e6 * 44 / (200e6 * 40) - 1).toBeCloseTo(0.1, 10);
  });

  it('F4: 600 vs 980, the fee gap over 20 years, and a concentrated index that swings about twice as far', () => {
    expect(1000 * 0.6).toBe(600);
    expect(1000 * 19 / 20 + (1000 / 20) * 0.6).toBe(980);
    expect(100 * 1.059 ** 20).toBeCloseTo(314.7, 1);
    expect(100 * 1.05 ** 20).toBeCloseTo(265.3, 1);
    const broad = series.F4_BROAD, conc = series.F4_CONC;
    const rb = broad.at(-1)!.c / broad[0]!.o - 1, rc = conc.at(-1)! / conc[0]! - 1;
    expect(rc / rb).toBeGreaterThan(1.5);
    expect(rc / rb).toBeLessThan(2.5);
  });
});

describe('the order book (F5)', () => {
  const book = { asks: [[100.10, 300], [100.15, 500], [100.25, 800], [100.40, 1000]] as Array<[number, number]>, bids: [[100.00, 400], [99.95, 600], [99.85, 900], [99.70, 1200]] as Array<[number, number, boolean?]> };

  it('a market order buys from the cheapest seller, and climbs layers when one is not enough', () => {
    const one = executeBuy(book, 'market', 100).result;
    expect(one.kind).toBe('mkt-one');
    expect(one.avg).toBeCloseTo(100.10, 10);
    const multi = executeBuy(book, 'market', 500);
    expect(multi.result.kind).toBe('mkt-multi');
    expect(multi.result.fills).toEqual([[100.10, 300], [100.15, 200]]);
    expect(multi.result.avg).toBeCloseTo(100.12, 10); // the lesson's worked example
    expect(multi.book.asks[0]).toEqual([100.15, 300]);
    expect(tasksMet(multi.result)).toEqual(['market', 'sweep']);
  });

  it('a limit order below the offer waits in the book as the learner\'s bid', () => {
    const r = executeBuy(book, 'limit', 200, 100.05);
    expect(r.result.kind).toBe('lim-rest');
    expect(r.result.filled).toBe(0);
    expect(r.book.bids[0]).toEqual([100.05, 200, true]);
    expect(tasksMet(r.result)).toEqual(['limitRest']);
  });

  it('a limit at or above the offer fills — fully, or up to its price', () => {
    expect(executeBuy(book, 'limit', 200, 100.10).result.kind).toBe('lim-full');
    const part = executeBuy(book, 'limit', 1000, 100.15).result;
    expect(part.kind).toBe('lim-part');
    expect([part.filled, part.rest]).toEqual([800, 200]);
  });

  it('the book never goes negative and an empty book fills nothing', () => {
    const all = executeBuy(book, 'market', 5000);
    expect(all.result.filled).toBe(2600);
    expect(all.book.asks).toEqual([]);
    expect(executeBuy(all.book, 'market', 100).result.kind).toBe('empty');
  });
});

// ---------------------------------------------------------------------------
// Technical Analysis T2–T5 (user brief: charts teach, observations are true of
// the data, no answer is shown before the learner acts).
// ---------------------------------------------------------------------------
const hi = (c: { swings: Array<{ type: string; price: number }> }) => c.swings.filter((x) => x.type === 'high').map((x) => x.price);
const lo = (c: { swings: Array<{ type: string; price: number }> }) => c.swings.filter((x) => x.type === 'low').map((x) => x.price);
const rising = (xs: number[]) => xs.every((x, i) => i === 0 || x > xs[i - 1]!);
const falling = (xs: number[]) => xs.every((x, i) => i === 0 || x < xs[i - 1]!);
const spread = (xs: number[]) => Math.max(...xs) - Math.min(...xs);

describe('TA — every chart shows what its text says', () => {
  it('T2: the hammer is a hammer, at the low, and the next candle confirms it', () => {
    const c = series.T2_CONTEXT, h = c[c.hammerIdx]!, n = c[c.confirmIdx]!;
    const body = Math.abs(h.c - h.o);
    expect(Math.min(h.o, h.c) - h.l).toBeGreaterThanOrEqual(2 * body);
    expect(h.h - Math.max(h.o, h.c)).toBeLessThan(body);
    expect(Math.min(...c.map((x) => x.l))).toBe(h.l);
    expect(n.c).toBeGreaterThan(h.h);
    // Apply: the same shape, after a RISE.
    const a = series.T2_APPLY, m = a[a.markIdx]!;
    expect(Math.min(m.o, m.c) - m.l).toBeGreaterThanOrEqual(2 * Math.abs(m.c - m.o));
    expect(m.c).toBeGreaterThan(a[a.markIdx - 10]!.c + 5);
  });

  it('T2 question charts: shooting star, doji and bearish engulfing, each after a rise', () => {
    const s = series.T2_Q_STAR[series.T2_Q_STAR.markIdx]!;
    expect(s.h - Math.max(s.o, s.c)).toBeGreaterThan(2 * Math.abs(s.c - s.o));
    const d = series.T2_Q_DOJI[series.T2_Q_DOJI.markIdx]!;
    expect(Math.abs(d.c - d.o)).toBeLessThan(0.2);
    const b = series.T2_Q_BEARE, g = b[b.markIdx]!, r = b[b.markIdx2]!;
    expect(g.c > g.o && r.c < r.o && r.o > g.c && r.c < g.o).toBe(true);
    for (const [c, i] of [[series.T2_Q_STAR, series.T2_Q_STAR.markIdx], [series.T2_Q_DOJI, series.T2_Q_DOJI.markIdx], [series.T2_Q_BEARE, series.T2_Q_BEARE.markIdx]] as const) {
      expect(c[i]!.c).toBeGreaterThan(c[i - 8]!.c);
    }
  });

  it('T3: up is higher highs and lows, down is lower, sideways stays in its band', () => {
    expect(rising(hi(series.T3_UP)) && rising(lo(series.T3_UP))).toBe(true);
    expect(falling(hi(series.T3_DOWN)) && falling(lo(series.T3_DOWN))).toBe(true);
    expect(falling(hi(series.T3_Q_DOWN)) && falling(lo(series.T3_Q_DOWN))).toBe(true);
    for (const c of [series.T3_SIDE, series.T3_Q_SIDE]) {
      expect(spread(hi(c))).toBeLessThan(1.5);
      expect(spread(lo(c))).toBeLessThan(1.6);
    }
    // The sharp pullback: a drop of more than 10% that still makes a higher low, then a new high.
    const p = series.T3_PULL, [l1, l2] = lo(p), h = hi(p)[0]!;
    expect((h - l2!) / h).toBeGreaterThan(0.1);
    expect(l2).toBeGreaterThan(l1!);
    expect(Math.max(...p.slice(p.swings[2]!.idx).map((x) => x.h))).toBeGreaterThan(h);
    // Apply: the last low breaks below the previous one.
    const b = lo(series.T3_BREAK);
    expect(b[2]).toBeLessThan(b[1]!);
    expect(b[1]).toBeGreaterThan(b[0]!);
    // "Still up": the red last candle stays above the previous low.
    const u = series.T3_Q_UPRED, last = u[u.length - 1]!;
    expect(last.c).toBeLessThan(last.o - 2);
    expect(last.l).toBeGreaterThan(lo(u).at(-1)!);
    expect(rising(hi(u)) && rising(lo(u))).toBe(true);
  });

  it('T3 drill: each sketch\'s swings agree with its answer (the Artifact\'s own data)', () => {
    const a = lessonContent('T3')!.activity!;
    if (a.kind !== 'classify') throw new Error('T3 is the four-chart drill');
    for (const it of a.items) {
      const vs = sketchSwings(it.points).map((m) => m.vs).filter(Boolean);
      const expected = it.answer === 'up' ? 'higher' : it.answer === 'down' ? 'lower' : 'similar';
      expect(vs.every((v) => v === expected), it.id).toBe(true);
    }
  });

  it('T4: three touches of support inside its zone; the flip; the band; the resistance', () => {
    const t = series.T4_TEACH;
    expect(lo(t)).toHaveLength(3);
    for (const p of lo(t)) expect(p >= t.support[0] && p <= t.support[1]).toBe(true);
    // The Try chart's support: price turned inside 163–168 three times.
    const l1 = series.L1, turns = l1.map((x, i) => ({ i, l: x.l })).filter((x, i, arr) => i > 2 && i < arr.length - 3 && arr.slice(i - 3, i + 4).every((y) => y.l >= x.l) && x.l < 170);
    expect(turns.filter((x) => x.l >= 163 && x.l <= 168)).toHaveLength(3);
    // Apply: after the break, the rally stalls at the old zone and price ends well below it.
    const f = series.T4_FLIP, rally = f.swings[2]!;
    expect(rally.price).toBeGreaterThan(f.zone[0]);
    expect(rally.price).toBeLessThan(f.zone[1] + 1);
    expect(Math.max(...f.slice(rally.idx + 1).map((x) => x.c))).toBeLessThan(f.zone[0]);
    // The band question: two turns below the line, one above.
    const b = series.T4_Q_BAND, line = Math.round((b.band[0] + b.band[1]) / 2);
    expect(lo(b).filter((p) => p < line)).toHaveLength(2);
    expect(lo(b).filter((p) => p > line)).toHaveLength(1);
    expect(spread(hi(series.T4_Q_RES))).toBeLessThan(1.5);
  });

  it('T5: the teaching charts end before any retest — nothing shows the answer early', () => {
    for (const c of [series.T5_BREAK, series.T5_THIN]) {
      const b = c[c.breakIdx]!;
      expect(b.c).toBeGreaterThan(c.resist[1]);
      expect(Math.max(...c.slice(0, c.breakIdx).map((x) => x.h))).toBeLessThanOrEqual(c.resist[1]);
      // Every candle after the break stays clear above the level: no return to it on screen.
      for (const x of c.slice(c.breakIdx + 1)) expect(x.l).toBeGreaterThan(c.resist[1]);
    }
    for (const c of [series.T5_POKE, series.T5_Q_POKE]) {
      const b = c[c.breakIdx]!;
      expect(b.h).toBeGreaterThan(c.resist[1] + 1);
      expect(b.c).toBeLessThan(c.resist[1]);
      expect(c.at(-1)!.c).toBeLessThan(b.c);
    }
    const t5 = lessonContent('T5')!;
    const teachText = t5.teach.flatMap((t) => [t.heading, ...t.paragraphs, ...(t.callouts ?? []).map((x) => x.text)]).map((l) => `${l.he} ${l.en}`).join(' ');
    expect(teachText).not.toMatch(/ריטסט|בדיקה חוזרת|retest/i);
    const spec = t5.charts[(t5.activity as { chart: number }).chart]!;
    expect(`${spec.caption?.he} ${spec.caption?.en} ${spec.label.he} ${spec.label.en}`).not.toMatch(/ריטסט|בדיקה חוזרת|retest/i);
  });

  it('T5: volume, and the retests that hold', () => {
    const vx = (c: typeof series.T5_BREAK) => c[c.breakIdx]!.v / (c.slice(0, c.breakIdx).reduce((s, x) => s + x.v, 0) / c.breakIdx);
    expect(vx(series.T5_BREAK)).toBeGreaterThan(2.5);
    expect(vx(series.T5_THIN)).toBeLessThan(0.6);
    expect(vx(series.T5_Q_THIN)).toBeLessThan(0.6);
    const a = series.T5_APPLY, after = a.slice(a.breakIdx);
    expect(Math.min(...after.map((x) => x.l))).toBeLessThan(a.resist[0]);
    expect(Math.min(...after.map((x) => x.c))).toBeGreaterThan(a.resist[1]);
    const h = series.T5_Q_HOLD, hAfter = h.slice(h.breakIdx + 5);
    expect(Math.min(...hAfter.map((x) => x.l))).toBeLessThan(h.resist[1]);
    expect(Math.min(...hAfter.map((x) => x.c))).toBeGreaterThan(h.resist[1]);
  });
});

describe('TA — visual questions and Apply', () => {
  it.each(TECHNICAL.map((c) => c.id))('%s asks three visual questions on charts the lesson never taught with', (id) => {
    const c = lessonContent(id)!;
    const taught = new Set(c.teach.flatMap((t) => (t.work.kind === 'charts' ? t.work.charts : [])));
    if (c.activity && 'chart' in c.activity && c.activity.chart !== undefined) taught.add(c.activity.chart);
    const visual = c.questions.filter((q) => q.chart !== undefined);
    expect(visual.length).toBe(3);
    for (const q of visual) {
      expect(q.lesson).toBe(id);
      expect(questionChart(q), q.id).toBe(c.charts[q.chart!]);
      expect(taught.has(q.chart!), q.id).toBe(false);
    }
    // Practice asks one question per lesson and starts from the first: a visual one.
    expect(c.questions[0]!.chart).toBeDefined();
  });

  it.each(TECHNICAL.map((c) => c.id))('%s has an Apply check on a new chart', (id) => {
    const c = lessonContent(id)!;
    const a = c.apply!;
    expect(a.options).toHaveLength(4);
    expect(a.options.map((o) => o.key)).toContain(a.correctKey);
    const taught = c.teach.flatMap((t) => (t.work.kind === 'charts' ? t.work.charts : []));
    expect(c.charts[a.chart!]).toBeTruthy();
    expect(taught).not.toContain(a.chart);
    expect(c.questions.some((q) => q.chart === a.chart)).toBe(false);
  });

  it('the old quiz links still open the old questions; the new lessons open their own', () => {
    expect(allQuestions().filter((q) => q.lesson === 'l4')).toHaveLength(3);
    expect(allQuestions().filter((q) => q.lesson === 'T2')).toHaveLength(3);
  });
});
