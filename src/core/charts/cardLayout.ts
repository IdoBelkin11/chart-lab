// ---------------------------------------------------------------------------
// How wide each lesson chart card should be.
//
// This replaces an index-parity rule: card 0 spanned the row because it
// carried the exercise, and whichever card happened to land alone in the last
// row was promoted to a centred full-width card. The result was that the SAME
// chart got a different width depending on how many siblings it had and
// whether the lesson had an exercise — so a lesson read as "one wide card, and
// a narrower one centred underneath", which is what a layout bug looks like.
//
// The rule here is about the CONTENT instead. A chart's right width is a
// property of what it shows:
//
//   · A long series is a story over time. Squeezed into half a column, 100+
//     candles become a smear and the trend the lesson is pointing at is no
//     longer visible. It takes the full row.
//   · A short series is a single illustration — one pattern, one level, one
//     crossing. It reads perfectly at half width, and at full width it is a
//     small drawing stretched across a wide box with nothing in the middle.
//     Half width also puts it BESIDE its siblings, which is the whole point
//     when the set is a comparison ("genuine retest" next to "failed one").
//   · A two-panel chart (price plus RSI underneath) is tall and dense; half
//     width makes it taller than it is wide. Full row.
//   · The card carrying the interactive exercise holds a chart and a panel
//     side by side. Full row, always.
//
// Pure and data-only, so the decisions are testable without rendering
// anything — and so the reasoning lives next to the chart specs it reasons
// about rather than inside a component's JSX.
// ---------------------------------------------------------------------------
import type { LessonChartSpec } from './lessonCharts';

export type CardSpan = 'full' | 'half';

/** Below this many candles a chart is an illustration, not a time series.
 *  The candlestick-pattern charts run 20–40; the trend and moving-average
 *  charts run 96–260. Nothing in the course sits near the boundary, so the
 *  exact value is not load-bearing — it only has to separate those two groups. */
const ILLUSTRATION_MAX_CANDLES = 60;

/** The width one chart wants, before the row-packing pass below. */
export function preferredSpan(spec: LessonChartSpec): CardSpan {
  if (spec.span) return spec.span;
  if (spec.variant === 'price-rsi') return 'full';
  return spec.candles.length > ILLUSTRATION_MAX_CANDLES ? 'full' : 'half';
}

/**
 * Assigns a span to every card, then fixes the one case the content rule
 * cannot see: a half card with no partner.
 *
 * A lone half card is promoted to full rather than left beside a gap. That is
 * the only positional adjustment made — everything else is decided by the
 * chart itself, so the same chart keeps the same width no matter what is
 * around it.
 *
 * `hasAside` marks the first card as carrying the exercise panel; it always
 * takes the full row because it holds two things side by side.
 */
export function layoutChartCards(
  specs: readonly LessonChartSpec[],
  { hasAside = false, columns = 2 }: { hasAside?: boolean; columns?: number } = {}
): CardSpan[] {
  const spans: CardSpan[] = specs.map((spec, i) =>
    i === 0 && hasAside ? 'full' : preferredSpan(spec)
  );

  // Walk the rows the way the grid will, and promote a trailing half that
  // never gets a neighbour. Counting rather than assuming parity is what makes
  // this correct when full-width cards are mixed in anywhere, not only first.
  let column = 0;
  for (let i = 0; i < spans.length; i++) {
    if (spans[i] === 'full') { column = 0; continue; }
    if (column === 0) {
      const partner = spans.slice(i + 1).findIndex((s) => s === 'half');
      // No later half card at all, or a full-width card comes first and ends
      // the row — either way this one would sit alone.
      const blockedBy = spans.slice(i + 1).findIndex((s) => s === 'full');
      const hasPartner = partner !== -1 && (blockedBy === -1 || partner < blockedBy);
      if (!hasPartner) { spans[i] = 'full'; continue; }
      column = 1;
    } else {
      column = (column + 1) % columns;
    }
  }

  return spans;
}
