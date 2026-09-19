import type { ReactNode } from 'react';
import { Chart } from '@ui/components/charts';
import type { LessonChartSpec } from '@core/charts/lessonCharts';
import { useLang } from '@ui/hooks/useLang';
import styles from './ChartCard.module.css';

/**
 * One lesson chart, presented as a card.
 *
 * Why a card rather than a bare canvas: a lesson can show five charts in a
 * row (the candlestick patterns), and a bare stack of five canvases gives the
 * reader nothing to anchor on — the pattern name was a 12px caption floating
 * above an enormous full-width chart, so the label and the thing it labelled
 * read as unrelated. The card binds them: the name sits in a header band
 * attached to the chart, the chart is bounded rather than page-wide, and the
 * count ("3 / 5") tells the reader where they are in the set.
 *
 * `tone` tints the header's gradient. It is passed from the lesson data, so
 * a bullish example and a bearish one are distinguishable at a glance
 * without reading either label — the same semantic-colour rule the rest of
 * the app follows.
 */
export function ChartCard({
  spec,
  index,
  count,
  height,
  aside,
  spanFull,
  onPriceClick,
  options
}: {
  spec: LessonChartSpec;
  index: number;
  count: number;
  height?: number;
  /** The exercise or notes panel, when this chart has one. */
  aside?: ReactNode;
  /** Forces the full-row treatment even with no aside — for the one card
   *  left alone in its row by an odd total, which would otherwise sit in a
   *  half-width column beside empty space. */
  spanFull?: boolean;
  onPriceClick?: (price: number) => void;
  /** Overrides spec.options — used when an exercise reveals its answer. */
  options?: Record<string, unknown>;
}) {
  const { lang } = useLang();
  const caption = spec.caption?.[lang];
  const tone = spec.tone ?? 'neutral';

  // A card holding the practice panel spans the whole row AND uses that
  // width, for the split chart+panel layout below. A lone card with no
  // aside spans the row too — so it isn't left beside empty space — but
  // stays centred at a normal card's width: stretching a single chart to
  // fill a two-column row would distort it into a wide, short strip
  // instead of the proportions every other example in the lesson has.
  const className = aside
    ? `${styles.card} ${styles.spanFull}`
    : spanFull
      ? `${styles.card} ${styles.spanFullCentered}`
      : styles.card;

  return (
    <figure className={className} data-tone={tone}>
      {(caption || count > 1) && (
        <div className={styles.header}>
          <span className={styles.dot} aria-hidden="true" />
          <div className={styles.headerText}>
            {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
            {spec.subcaption && (
              <p className={styles.subcaption}>{spec.subcaption[lang]}</p>
            )}
          </div>
          {count > 1 && (
            <span className={styles.counter} aria-hidden="true">
              {index + 1}<span className={styles.counterTotal}>/{count}</span>
            </span>
          )}
        </div>
      )}

      <div className={aside ? styles.bodySplit : styles.body}>
        <div className={styles.well}>
          <Chart
            candles={spec.candles as never}
            variant={spec.variant}
            options={options ?? spec.options}
            label={spec.label[lang]}
            {...(height ? { height } : {})}
            {...(onPriceClick ? { onPriceClick } : {})}
          />
        </div>
        {aside}
      </div>
    </figure>
  );
}
