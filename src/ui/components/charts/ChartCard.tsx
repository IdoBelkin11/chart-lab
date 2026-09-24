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
  span = 'half',
  onPriceClick,
  options
}: {
  spec: LessonChartSpec;
  index: number;
  count: number;
  height?: number;
  /** The exercise or notes panel, when this chart has one. */
  aside?: ReactNode;
  /** How wide this card sits in the grid. Decided from the chart's own
   *  content by @core/charts/cardLayout, never from its position. */
  span?: 'full' | 'half';
  onPriceClick?: (price: number) => void;
  /** Overrides spec.options — used when an exercise reveals its answer. */
  options?: Record<string, unknown>;
}) {
  const { lang } = useLang();
  const caption = spec.caption?.[lang];
  const tone = spec.tone ?? 'neutral';

  // A full card uses the whole row and the whole width. There is no longer a
  // third "spans the row but stays narrow and centred" state: that existed to
  // stop a leftover card looking stranded, and it is what made two charts in
  // one lesson read as two different sizes for no reason the reader could see.
  // A card that takes the row now uses it.
  const className = span === 'full' ? `${styles.card} ${styles.spanFull}` : styles.card;

  // The shape of the well, not its pixel height — see .well's comment.
  // A price+RSI chart stacks two panels, so it needs to be squarer or the
  // lower panel is a sliver; a half-width illustration is wider than it is
  // tall because that is the shape a short candle series reads best in; a
  // full-row chart beside an exercise panel gets the roomiest ratio.
  const aspect =
    spec.variant === 'price-rsi' ? '16 / 12'
      : aside ? '16 / 9'
        : span === 'full' ? '16 / 8'
          : '16 / 11';

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
        <div
          className={styles.well}
          style={{
            '--chart-aspect': aspect,
            ...(height ? { '--chart-max-h': `${height}px` } : null)
          } as React.CSSProperties}
        >
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
