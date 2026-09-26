import { useCallback, useState } from 'react';
import { lookupStock } from '@core/ai/market/stockLookup';
import type { StockSnapshot, LookupResult } from '@core/ai/market/stockLookup';
import { useLang } from '@ui/hooks/useLang';
import { ToolCrumbs } from '@ui/routes/tools/ToolCrumbs';
import { Chart } from '@ui/components/charts';
import { TICKER_MAP } from '@core/ai/entity/tickers.js';
import styles from './StockRoute.module.css';

/**
 * The companies offered when demo mode can't search.
 *
 * Read off the curated list rather than typed out here, so the offer can't
 * drift into naming a company the app would then fail to find — the failure
 * mode of every hardcoded "try one of these" list.
 */
const SUGGESTED = (TICKER_MAP as Array<{ ticker: string; name: { he: string; en: string } }>).slice(0, 6);

/** Derived from LookupResult rather than restated, so adding a reason in the
 *  core can't leave this component silently rendering nothing for it. */
type LookupFailure = Extract<LookupResult, { ok: false }>['reason'];

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'found'; snapshot: StockSnapshot }
  | { kind: 'error'; reason: LookupFailure };

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
      <ToolCrumbs here={t('navStock')} />
      <div className={styles.head}>
        <h1 className={styles.title}>{t('navStock')}</h1>
      </div>

      {/* A real, visible label rather than a placeholder standing in for one:
          a placeholder disappears the moment you type, so the field loses its
          name exactly when you are checking what you entered. */}
      <form
        className={styles.search}
        onSubmit={(e) => {
          e.preventDefault();
          void search(query);
        }}
      >
        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            {lang === 'he' ? 'חברה או סימול' : 'Company or symbol'}
          </span>
          <input
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === 'he' ? 'למשל Apple' : 'e.g. Apple'}
          />
        </label>
        <button type="submit" className={styles.submit} disabled={state.kind === 'loading' || !query.trim()}>
          {state.kind === 'loading'
            ? (lang === 'he' ? 'מחפש…' : 'Searching…')
            : (lang === 'he' ? 'חפש' : 'Search')}
        </button>
      </form>

      {state.kind === 'error' && (
        <div className={state.reason === 'demo-limited' ? styles.notice : styles.error} role="status">
          {state.reason === 'not-found' && (
            <p>{lang === 'he' ? 'לא מצאתי חברה בשם הזה.' : "I couldn't find a company by that name."}</p>
          )}
          {state.reason === 'unavailable' && (
            <p>{lang === 'he' ? 'נתוני השוק אינם זמינים כרגע.' : 'Market data is unavailable right now.'}</p>
          )}
          {/* A dead end is the one thing this must not be. Demo Mode can chart
              any company on the curated list, so the reply says so and offers
              them — a name the visitor can click rather than a suggestion that
              they check their spelling for a limit that isn't theirs. */}
          {state.reason === 'demo-limited' && (
            <>
              <p>
                {lang === 'he'
                  ? 'במצב הדגמה אין חיבור לחיפוש חברות, אז אפשר להציג רק את החברות שמוגדרות מראש. נסה אחת מאלה:'
                  : 'In demo mode there is no company-search connection, so only the built-in companies can be shown. Try one of these:'}
              </p>
              <p className={styles.suggestions}>
                {SUGGESTED.map((s) => (
                  <button
                    key={s.ticker}
                    type="button"
                    className={styles.suggestion}
                    onClick={() => {
                      setQuery(s.ticker);
                      void search(s.ticker);
                    }}
                  >
                    {s.name[lang]}
                  </button>
                ))}
              </p>
            </>
          )}
        </div>
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
    // One glass card holds the whole answer — identity, price, chart and
    // metrics. They were laid out loose on the page, which left the reader to
    // work out that four separate things were all about the same company.
    <section className={styles.snapshot} aria-live="polite">
      <div className={styles.snapHead}>
        <div>
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
        </div>

        {/* Provenance is never optional: a learner must be able to tell demo
            data from live market data at a glance. It sits at the head of the
            card, opposite the price — the two things you read first. */}
        <p className={isDemo ? `${styles.provenance} ${styles.provenanceDemo}` : styles.provenance}>
          {isDemo
            ? (lang === 'he' ? 'נתוני הדגמה' : 'Demo data')
            : (lang === 'he' ? `נכון ל-${quote.asOf}` : `As of ${quote.asOf}`)}
        </p>
      </div>

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
        {/* The provider's own label is a full sentence ("Demo Mode — נתוני
            הדגמה, אינם משקפים מחירים אמיתיים"); it is the right text for a
            provenance line and the wrong text for a one-word metric box, where
            it wrapped to three lines. The full sentence still reaches the
            reader — it is this card's title attribute — and the badge at the
            head of the card carries the warning itself. */}
        <Metric
          label={lang === 'he' ? 'מקור' : 'Source'}
          value={sourceLabel.split('—')[0]!.trim()}
          title={sourceLabel}
        />
      </dl>
    </section>
  );
}

function Metric({ label, value, title }: { label: string; value: string; title?: string }) {
  return (
    <div className={styles.metric} title={title}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
