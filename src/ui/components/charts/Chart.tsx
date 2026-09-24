import { useEffect, useRef } from 'react';
import { drawChart, drawPriceRSI, chartColors } from './drawChart.js';
import { useTheme } from '@ui/hooks/useTheme';
import { useLang } from '@ui/hooks/useLang';
import styles from './Chart.module.css';

// ---------------------------------------------------------------------------
// Resolves a lesson's semantic, language-neutral annotation spec (tones and
// { he, en } labels — @core, never touches colour or language) into the
// concrete colour strings and current-language label text the drawing
// primitives in drawChart.js actually read.
//
// This is the seam between @core (WHAT to annotate) and @ui (HOW it looks) —
// the same split the rest of the app uses for label: { he, en } text.
// Without it, every zone/point/dot/segment/highlight the lesson data
// describes silently has no colour and no label, so nothing draws.
// ---------------------------------------------------------------------------
type Lang = 'he' | 'en';
// Deliberately untyped in and out (`unknown`): this resolves BOTH already-
// plain values (a string label built dynamically elsewhere) and { he, en }
// pairs, and casting FROM unknown at each call site — rather than fighting
// a generic that has to cover both shapes — is what keeps every call site
// below a plain, unambiguous cast instead of a "these types don't overlap"
// error.
function pick(v: unknown, lang: Lang): unknown {
  if (v == null) return undefined;
  if (typeof v === 'object' && 'he' in (v as object) && 'en' in (v as object)) {
    return (v as Record<Lang, unknown>)[lang];
  }
  return v;
}
function resolveChartOptions(options: Record<string, unknown> | undefined, lang: Lang): Record<string, unknown> {
  if (!options) return {};
  const CC = chartColors() as Record<string, string>;
  const toneLine = (tone: string) => CC[tone] ?? CC.gold;
  const toneFill = (tone: string) => CC[`${tone}Dim`] ?? CC[tone] ?? CC.goldDim;
  const out: Record<string, unknown> = { ...options };

  if (Array.isArray(options.zones)) {
    out.zones = (options.zones as Array<Record<string, unknown>>).map((z) => ({
      ...z,
      color: toneFill(z.tone as string),
      line: toneLine(z.tone as string),
      label: pick(z.label, lang)
    }));
  }
  if (Array.isArray(options.points)) {
    out.points = (options.points as Array<Record<string, unknown>>).map((p) => ({
      ...p,
      color: toneLine(p.tone as string),
      label: pick(p.label, lang)
    }));
  }
  if (Array.isArray(options.dots)) {
    out.dots = (options.dots as Array<Record<string, unknown>>).map((d) => ({
      ...d,
      color: toneLine(d.tone as string),
      label: pick(d.label, lang)
    }));
  }
  if (Array.isArray(options.segments)) {
    out.segments = (options.segments as Array<Record<string, unknown>>).map((s) => ({
      ...s,
      color: toneLine(s.tone as string),
      label: pick(s.label, lang)
    }));
  }
  if (Array.isArray(options.highlights)) {
    out.highlights = (options.highlights as Array<Record<string, unknown>>).map((h) => ({
      ...h,
      color: toneLine(h.tone as string),
      label: pick(h.label, lang)
    }));
  }
  if (Array.isArray(options.extraLines)) {
    const lines = options.extraLines as Array<{ tone: string; values: unknown[] }>;
    out.extraLines = lines.map((l) => l.values);
    out.extraColors = lines.map((l) => toneLine(l.tone));
  }
  if (options.divergenceLabels) {
    const [higher, lower] = pick(options.divergenceLabels, lang) as [string, string];
    out.divHigherLabel = higher;
    out.divLowerLabel = lower;
    delete out.divergenceLabels;
  }
  return out;
}

export interface Candle {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface ChartProps {
  candles: Candle[];
  /** Which primitive to use. */
  variant?: 'price' | 'price-rsi';
  /** Passed straight through to the drawing primitive. */
  options?: Record<string, unknown>;
  /** Accessible description — canvases are invisible to screen readers
   *  without one, and "chart" alone tells a user nothing. */
  label: string;
  height?: number;
  /**
   * Called with the PRICE the learner clicked, not pixel coordinates.
   *
   * The drawing primitive owns the price/pixel mapping, so converting here
   * keeps that knowledge in one place — a caller should never have to know
   * the chart's internal scale to interpret a click.
   */
  onPriceClick?: (price: number) => void;
}

/**
 * A lesson chart.
 *
 * The component owns everything the imperative canvas code cannot know about
 * on its own:
 *
 *   · **Device pixel ratio.** Canvas is sized in CSS pixels but drawn in
 *     device pixels; without scaling, every chart is blurry on a retina
 *     screen.
 *   · **Resize.** Redraws are throttled through requestAnimationFrame, so a
 *     drag-resize schedules at most one repaint per frame instead of one per
 *     resize event. The previous build redrew all 19 charts on every event.
 *   · **Theme.** Colours come from CSS variables read at draw time, so a
 *     theme switch has to trigger a redraw — the canvas cannot restyle
 *     itself the way DOM does.
 *   · **Accessibility.** A canvas is opaque to assistive tech, so it carries
 *     an explicit role and label.
 */
export function Chart({ candles, variant = 'price', options, label, height = 320, onPriceClick }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const frame = useRef<number | null>(null);
  const { theme } = useTheme();
  const { lang } = useLang();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const paint = () => {
      frame.current = null;
      const parent = canvas.parentElement;
      if (!parent) return;
      // CSS owns the canvas's box (see .canvas — pinned to all four sides of
      // the wrapper), so this only READS it. Writing it here as well is what
      // produced a canvas that kept one height forever no matter which card it
      // was in: this function sized the canvas from its parent while drawChart
      // sized it from its own previous backing store, and the two never agreed
      // on who was measuring whom.
      //
      // The one thing still written is the wrapper's height, and only when its
      // container gives it none — a caller that drops a chart into an
      // auto-height box. Without that the wrapper would collapse, because the
      // canvas inside it is out of flow and holds nothing open.
      const cs = getComputedStyle(parent);
      const vPad = parseFloat(cs.paddingTop || '0') + parseFloat(cs.paddingBottom || '0');
      if (parent.clientHeight - vPad <= 1) parent.style.height = `${height + vPad}px`;

      const cssWidth = canvas.clientWidth;
      const cssHeight = canvas.clientHeight;
      // Mid-transition, or before the container has been laid out, there is
      // nothing to draw into yet — and a zero-sized backing store would throw
      // the scale maths off rather than merely render nothing.
      if (cssWidth < 1 || cssHeight < 1) return;

      const dpr = window.devicePixelRatio || 1;
      // Only the backing store, in device pixels. The element's CSS size is
      // already correct and must not be overwritten.
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      const ctx = canvas.getContext('2d');
      // A 2D context can genuinely be unavailable — canvas disabled by policy,
      // or a non-painting environment such as jsdom under test. Bail out
      // rather than throwing: the accessible label still describes the chart,
      // so the page stays usable instead of crashing the whole lesson.
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const draw = variant === 'price-rsi' ? drawPriceRSI : drawChart;
      // The primitive invokes onClick with a price it derived from its own
      // scale, which is exactly the seam the exercises need.
      draw(canvas, tipRef.current, candles, {
        ...resolveChartOptions(options, lang),
        ...(onPriceClick ? { onClick: onPriceClick } : {})
      });
    };

    const schedule = () => {
      // Coalesce bursts of resize events into one repaint per frame.
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(paint);
    };

    paint();

    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    if (observer && canvas.parentElement) observer.observe(canvas.parentElement);
    window.addEventListener('resize', schedule);

    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      observer?.disconnect();
      window.removeEventListener('resize', schedule);
    };
    // `theme` and `lang` are dependencies because the canvas cannot restyle or
    // relabel itself — it must be repainted.
  }, [candles, variant, options, height, theme, lang, onPriceClick]);

  return (
    <div className={styles.wrap}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        role="img"
        aria-label={label}
      />
      <div ref={tipRef} className={styles.tip} aria-hidden="true" />
    </div>
  );
}
