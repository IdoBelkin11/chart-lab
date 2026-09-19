import { useCallback, useState } from 'react';
import { lookupStock } from '@core/ai/market/stockLookup';
import type { StockSnapshot } from '@core/ai/market/stockLookup';
import { useLang } from '@ui/hooks/useLang';
import { Chart } from '@ui/components/charts';
import styles from './StockRoute.module.css';

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'found'; snapshot: StockSnapshot }
  | { kind: 'error'; reason: 'not-found' | 'unavailable' };

/**
 * Explore a stock.
 *
 * Everything lives in one route component with a single `state` value — no
 * nested overlay. The legacy build opened a separate stock-detail overlay on
 * top of this one, and leaving the route only closed the outer panel, so a
 * stale detail view survived navigation to Home / AI / Compare. There is no
 * second surface here to leak, which removes that bug by construction rather
 * than by remembering to close it.
 */
export function StockRoute() {
  const { t, lang } = useLang();
  const [query, setQuery] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle' });

  const search = useCallback(
    async (raw: string) => {
      const q = raw.trim();
      if (!q) return;
      setState({ kind: 'loading' });
      const result = await lookupStock(q, lang);
      setState(result.ok ? { kind: 'found', snapshot: result.snapshot } : { kind: 'error', reason: result.reason });
    },
    [lang]
  );

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.title}>{t('navStock')}</h1>
      </div>

      <form
        className={styles.search}
        onSubmit={(e) => {
          e.preventDefault();
          void search(query);
        }}
      >
        <input
          className={styles.input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={lang === 'he' ? 'חברה או טיקר, למשל Apple' : 'Company or ticker, e.g. Apple'}
          aria-label={t('navStock')}
        />
        <button type="submit" className={styles.submit} disabled={state.kind === 'loading' || !query.trim()}>
          {state.kind === 'loading'
            ? (lang === 'he' ? 'מחפש…' : 'Searching…')
            : (lang === 'he' ? 'חפש' : 'Search')}
        </button>
      </form>

      {state.kind === 'error' && (
        <p className={styles.error} role="status">
          {state.reason === 'not-found'
            ? (lang === 'he' ? 'לא מצאתי חברה בשם הזה.' : "I couldn't find a company by that name.")
            : (lang === 'he' ? 'נתוני השוק אינם זמינים כרגע.' : 'Market data is unavailable right now.')}
        </p>
      )}

      {state.kind === 'found' && <StockSnapshotView snapshot={state.snapshot} />}
    </div>
  );
}

function StockSnapshotView({ snapshot }: { snapshot: StockSnapshot }) {
  const { lang } = useLang();
  const { quote, history, displayName, symbol, isDemo, sourceLabel } = snapshot;
  const up = (quote.changePct ?? 0) >= 0;

  // Strip an existing parenthetical: the Hebrew display names already carry
  // the English name, and appending the ticker produced "אנבידיה (NVIDIA) (NVDA)".
  const baseName = displayName.replace(/\s*\([^)]*\)\s*$/, '').trim();

  const candles = history.map((c) => ({
    t: new Date(c.date),
    o: c.open,
    h: c.high,
    l: c.low,
    c: c.close,
    v: c.volume ?? 0
  }));

  return (
    <section className={styles.snapshot} aria-live="polite">
      <p className={styles.name}>
        {baseName} <span className={styles.ticker}>({symbol})</span>
      </p>

      <p className={styles.price}>
        {quote.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        {quote.changePct != null && (
          <span className={up ? styles.up : styles.down}>
            {up ? '+' : ''}
            {quote.changePct.toFixed(2)}%
          </span>
        )}
      </p>

      {/* Provenance is never optional: a learner must be able to tell demo
          data from live market data at a glance. */}
      <p className={styles.provenance}>
        {isDemo
          ? (lang === 'he' ? 'נתוני הדגמה — לא מחירי שוק אמיתיים' : 'Demo data — not real market prices')
          : (lang === 'he' ? `נכון ל-${quote.asOf} · ${sourceLabel}` : `As of ${quote.asOf} · ${sourceLabel}`)}
      </p>

      {candles.length > 0 && (
        <div className={styles.chart}>
          <Chart
            candles={candles as never}
            variant="price"
            options={{ showVolume: true }}
            label={
              lang === 'he'
                ? `גרף מחיר יומי של ${baseName} על פני ${candles.length} ימי מסחר`
                : `Daily price chart for ${baseName} over ${candles.length} trading sessions`
            }
            height={340}
          />
        </div>
      )}

      <dl className={styles.metrics}>
        <Metric
          label={lang === 'he' ? 'סגירה קודמת' : 'Previous close'}
          value={quote.previousClose?.toFixed(2) ?? '—'}
        />
        <Metric label={lang === 'he' ? 'מטבע' : 'Currency'} value={quote.currency ?? 'USD'} />
        <Metric label={lang === 'he' ? 'מקור' : 'Source'} value={sourceLabel} />
      </dl>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.metric}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
