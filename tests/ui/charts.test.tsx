import { describe, it, expect, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { App } from '@ui/app/App';
import { ACTIVITIES } from '@core/lessons/activities';
import { FOUNDATIONS } from '@core/lessons/content/foundations';
import { TECHNICAL } from '@core/lessons/content/technical';
import { T1 } from '@core/lessons/content/t1';
import { T6 } from '@core/lessons/content/t6';
import { T7 } from '@core/lessons/content/t7';
import { T8 } from '@core/lessons/content/t8';
import { T9 } from '@core/lessons/content/t9';
import { T10 } from '@core/lessons/content/t10';
import { T11 } from '@core/lessons/content/t11';
import { T12 } from '@core/lessons/content/t12';
import { P8 } from '@core/lessons/content/p7to9';
import { RISK_1 } from '@core/lessons/content/r1to3';
import { RISK_2 } from '@core/lessons/content/r4to6';
import { RISK_3 } from '@core/lessons/content/r7to8';
const RISK = [...RISK_1, ...RISK_2, ...RISK_3];
import * as series from '@core/charts/series.js';
import { chartsForLesson, LESSON_CHARTS } from '@core/charts/lessonCharts';
import { chartColors } from '@ui/components/charts/drawChart.js';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
});

describe('chart data ported to core', () => {
  it('no series was lost in the port', () => {
    // 19 is the floor carried over from the pre-port build, not a target: this
    // test exists to catch a series going MISSING. Pinning it exactly meant
    // every chart added to a lesson failed a test about a migration it had
    // nothing to do with, which teaches the reflex of editing the number
    // instead of reading why it is there. The companion test below — every
    // series is wired to some lesson — is what stops the count drifting up
    // with data nothing draws.
    const arrays = Object.keys(series).filter((k) => Array.isArray((series as never)[k]));
    expect(arrays.length).toBeGreaterThanOrEqual(19);
  });

  it('the "area, not a line" chart actually shows what its caption claims', () => {
    // The caption says some turns stop above the line, some cut below it, and
    // every one of them sits inside the band. That is a claim ABOUT THE DATA,
    // and the first draft of this chart broke it: hand-picked band edges plus
    // generated noise put wicks well below the band while the caption said
    // price never left it. A caption contradicting its own picture teaches the
    // opposite of the lesson, so the claim is pinned here rather than trusted
    // to a screenshot.
    const s = series.L1_ZONE;
    const [lo, hi] = s.band;
    const turns: number[] = [];
    for (let i = 3; i < s.length - 3; i++) {
      const l = s[i]!.l;
      if (l < 158 && s.slice(i - 3, i + 4).every((c) => c.l >= l)) turns.push(l);
    }
    expect(turns.length, 'turns found').toBeGreaterThanOrEqual(4);
    for (const t of turns) {
      expect(t, `turn at ${t} is inside [${lo}, ${hi}]`).toBeGreaterThanOrEqual(lo);
      expect(t).toBeLessThanOrEqual(hi);
    }
    // And the line is genuinely ambiguous: crossed by some turns, respected by
    // others. A line every turn cleared would make the opposite point.
    expect(turns.some((t) => t < s.exactLine), 'a turn below the line').toBe(true);
    expect(turns.some((t) => t > s.exactLine), 'a turn above the line').toBe(true);
  });

  it('series are deterministic — a lesson referring to a level stays true', () => {
    // Generated from a seeded PRNG, not Math.random: if these shifted between
    // loads, lesson text like "notice support near 165" would become wrong.
    const a = series.L1.map((c: { c: number }) => c.c).join(',');
    const b = series.L1.map((c: { c: number }) => c.c).join(',');
    expect(a).toBe(b);
    expect(series.L1.length).toBeGreaterThan(50);
  });

  it('candles have a complete OHLC shape', () => {
    // `t` is a Date, o/h/l/c/v are numbers — the shape the drawing
    // primitives expect.
    interface Candle { t: Date; o: number; h: number; l: number; c: number; v: number }
    for (const candle of series.L1.slice(0, 5) as Candle[]) {
      expect(candle.t instanceof Date).toBe(true);
      expect(typeof candle.o).toBe('number');
      expect(typeof candle.c).toBe('number');
      // A high below its low would mean the generator is broken.
      expect(candle.h).toBeGreaterThanOrEqual(candle.l);
    }
  });
});

describe('lesson chart mapping', () => {
  it('maps a lesson to one or more series and a drawing variant', () => {
    // l6 (RSI) shows three examples: overbought, oversold, divergence — all
    // sharing the price-rsi variant.
    const specs = chartsForLesson('l6');
    expect(specs.length).toBeGreaterThanOrEqual(3);
    for (const spec of specs) {
      expect(spec.variant).toBe('price-rsi');
      expect(spec.candles.length).toBeGreaterThan(0);
    }
  });

  it('every mapped chart has a bilingual accessible label', () => {
    for (const [id, specs] of Object.entries(LESSON_CHARTS)) {
      for (const spec of specs) {
        expect(spec.label.he, `${id} he label`).toBeTruthy();
        expect(spec.label.en, `${id} en label`).toBeTruthy();
        // A label must describe what the chart SHOWS, not just say "chart".
        expect(spec.label.he.length).toBeGreaterThan(20);
      }
    }
  });

  it('a lesson with more than one chart captions each one', () => {
    const specs = chartsForLesson('l7');
    expect(specs.length).toBeGreaterThan(1);
    for (const spec of specs) {
      expect(spec.caption?.he).toBeTruthy();
      expect(spec.caption?.en).toBeTruthy();
    }
  });

  it('returns no charts for a lesson that intentionally has none (l0)', () => {
    expect(chartsForLesson('l0')).toEqual([]);
  });

  it('every series is wired to some lesson chart or lesson activity', () => {
    const wiredCandles = new Set<unknown>(Object.values(LESSON_CHARTS).flat().map((s) => s.candles));
    for (const a of Object.values(ACTIVITIES)) if (a.kind === 'chartChoice') wiredCandles.add(a.candles);
    if (T1.activity?.kind === 'chartChoice') wiredCandles.add(T1.activity.candles);
    // Lessons written in the content model (Phase 8): their charts, and their comparison lines.
    // A chart cut before its outcome (T11's questions) is a slice: it starts on the series' own first candle.
    const firstCandles = new Set<unknown>();
    for (const s of [...FOUNDATIONS, T1, ...TECHNICAL, T6, T7, T8, T9, T10, T11, T12, P8, ...RISK].flatMap((c) => c.charts)) {
      wiredCandles.add(s.candles);
      firstCandles.add((s.candles as unknown[])[0]);
      for (const l of (s.options?.extraLines as Array<{ values: unknown }> | undefined) ?? []) wiredCandles.add(l.values);
    }
    const arrays = Object.keys(series).filter((k) => Array.isArray((series as never)[k]));
    for (const key of arrays) {
      const arr = (series as never)[key] as unknown[];
      expect(wiredCandles.has(arr) || firstCandles.has(arr[0]), key).toBe(true);
    }
  });
});

describe('chart rendering', () => {
  it('renders a labelled canvas, not an opaque one', () => {
    location.hash = '#/lesson/l4';
    render(<App />);
    // The lesson's examples step shows all five charts. Every one is checked,
    // not just the first: a canvas is invisible to assistive tech, so one
    // unlabelled chart among several is one chart that does not exist for
    // part of the audience.
    fireEvent.click(screen.getByRole('button', { name: 'חמש תבניות' }));
    const imgs = screen.getAllByRole('img').filter((el) => el.tagName === 'CANVAS');
    expect(imgs.length).toBe(5);
    for (const img of imgs) {
      expect(img.tagName).toBe('CANVAS');
      expect(img.getAttribute('aria-label')!.length).toBeGreaterThan(20);
    }
    expect(imgs[0]!.getAttribute('aria-label')).toMatch(/פטיש/);
  });

  it('a lesson with no chart (l0) simply has no analysis workspace section', () => {
    location.hash = '#/lesson/l0';
    render(<App />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.queryByText('סביבת ניתוח')).toBeNull();
  });

  it('a single-chart step labels its chart by what it shows', () => {
    location.hash = '#/lesson/l1';
    render(<App />);
    const canvas = screen.getAllByRole('img').find((el) => el.tagName === 'CANVAS')!;
    expect(canvas.getAttribute('aria-label')).toMatch(/תמיכה|התנגדות/);
  });
});

describe('annotation tones resolve to real colours', () => {
  // This is the failure mode that shipped: a tone with a *Dim fill but no
  // matching line colour resolved its fill correctly and then fell through
  // to the informational blue for its border and label — so a resistance
  // zone drew a red box with a blue label sitting on it. Nothing threw, so
  // only looking at the rendered chart would have caught it.
  const CANVAS_TONES = ['bull', 'bear', 'support', 'resistance', 'gold', 'text', 'ema20', 'sma150'];

  it('every tone used in drawing options has a line colour', () => {
    const colors = chartColors();
    for (const tone of CANVAS_TONES) {
      expect(colors[tone], `${tone} line colour`).toBeTruthy();
    }
  });

  it('support and resistance are not the same colour as the neutral accent', () => {
    const colors = chartColors();
    expect(colors.support).not.toBe(colors.gold);
    expect(colors.resistance).not.toBe(colors.gold);
    expect(colors.support).not.toBe(colors.resistance);
  });

  it('no lesson chart uses a tone the canvas cannot resolve', () => {
    const optionTones = new Set<string>();
    const collect = (list: unknown) => {
      if (!Array.isArray(list)) return;
      for (const item of list as Array<Record<string, unknown>>) {
        if (typeof item.tone === 'string') optionTones.add(item.tone);
      }
    };
    for (const spec of Object.values(LESSON_CHARTS).flat()) {
      const o = (spec.options ?? {}) as Record<string, unknown>;
      collect(o.zones); collect(o.points); collect(o.dots);
      collect(o.segments); collect(o.highlights); collect(o.extraLines);
    }
    const colors = chartColors();
    for (const tone of optionTones) {
      expect(colors[tone], `tone "${tone}" used in chart options`).toBeTruthy();
    }
  });
});

describe('cards in a row are uniform', () => {
  it('every chart within a lesson shares one height', () => {
    // Cards in a grid row stretch to the tallest, but the CANVASES inside
    // them only line up if the charts themselves agree. Mixed heights in one
    // lesson produce a ragged row of differently-sized charts.
    for (const [id, specs] of Object.entries(LESSON_CHARTS)) {
      // The first card carries the exercise/notes panel and spans its own
      // row, so it is exempt — it never shares a row with another card.
      const inGrid = specs.length > 1 ? specs.slice(1) : specs;
      const heights = new Set(inGrid.map((s) => s.height));
      expect(heights.size, `${id} heights: ${[...heights].join(', ')}`).toBe(1);
    }
  });

  it('charts are large enough to read the pattern they show', () => {
    for (const [id, specs] of Object.entries(LESSON_CHARTS)) {
      for (const spec of specs) {
        expect(spec.height!, `${id} height`).toBeGreaterThanOrEqual(330);
      }
    }
  });
});
