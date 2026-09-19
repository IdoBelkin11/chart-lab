import { useCallback, useState } from 'react';
import { lookupStock } from '@core/ai/market/stockLookup';
import type { StockSnapshot } from '@core/ai/market/stockLookup';
import { useLang } from '@ui/hooks/useLang';
import styles from './CompareRoute.module.css';

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ready'; a: StockSnapshot; b: StockSnapshot }
  | { kind: 'error'; message: string };

interface Row {
  key: string;
  label: { he: string; en: string };
  read: (s: StockSnapshot) => number | null;
  format: (v: number) => string;
  /** Higher is "ahead" for some metrics and meaningless for others. */
  higherIsBetter?: boolean;
}

/**
 * Compare two companies.
 *
 * Rows are declared rather than hand-written, so both columns are guaranteed
 * to read the same field through the same formatter — a table where one side
 * was formatted differently from the other would be quietly misleading.
 *
 * A metric missing for either company is shown as "—" on BOTH sides rather
 * than comparing a number against nothing.
 */
const ROWS: Row[] = [
  {
    key: 'price',
    label: { he: 'מחיר', en: 'Price' },
    read: (s) => s.quote.price,
    format: (v) => v.toFixed(2)
  },
  {
    key: 'changePct',
    label: { he: 'שינוי יומי', en: 'Daily change' },
    read: (s) => s.quote.changePct,
    format: (v) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`,
    higherIsBetter: true
  },
  {
    key: 'previousClose',
    label: { he: 'סגירה קודמת', en: 'Previous close' },
    read: (s) => s.quote.previousClose,
    format: (v) => v.toFixed(2)
  }
];

export function CompareRoute() {
  const { t, lang } = useLang();
  const [queryA, setQueryA] = useState('');
  const [queryB, setQueryB] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle' });

  const compare = useCallback(async () => {
    if (!queryA.trim() || !queryB.trim()) return;
    setState({ kind: 'loading' });
    const [ra, rb] = await Promise.all([lookupStock(queryA, lang), lookupStock(queryB, lang)]);
    if (!ra.ok || !rb.ok) {
      setState({
        kind: 'error',
        message:
          lang === 'he'
            ? 'לא הצלחתי למצוא את שתי החברות.'
            : "I couldn't find both companies."
      });
      return;
    }
    setState({ kind: 'ready', a: ra.snapshot, b: rb.snapshot });
  }, [queryA, queryB, lang]);

  const cleanName = (s: StockSnapshot) => s.displayName.replace(/\s*\([^)]*\)\s*$/, '').trim();

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.title}>{t('navCompare')}</h1>
      </div>

      <form
        className={styles.inputs}
        onSubmit={(e) => {
          e.preventDefault();
          void compare();
        }}
      >
        <input
          className={styles.input}
          value={queryA}
          onChange={(e) => setQueryA(e.target.value)}
          aria-label={lang === 'he' ? 'חברה ראשונה' : 'First company'}
          placeholder={lang === 'he' ? 'חברה ראשונה' : 'First company'}
        />
        <span className={styles.vs} aria-hidden="true">vs</span>
        <input
          className={styles.input}
          value={queryB}
          onChange={(e) => setQueryB(e.target.value)}
          aria-label={lang === 'he' ? 'חברה שנייה' : 'Second company'}
          placeholder={lang === 'he' ? 'חברה שנייה' : 'Second company'}
        />
        <button
          type="submit"
          className={styles.submit}
          disabled={state.kind === 'loading' || !queryA.trim() || !queryB.trim()}
        >
          {state.kind === 'loading'
            ? (lang === 'he' ? 'משווה…' : 'Comparing…')
            : (lang === 'he' ? 'השווה' : 'Compare')}
        </button>
      </form>

      {state.kind === 'error' && (
        <p className={styles.error} role="status">{state.message}</p>
      )}

      {state.kind === 'ready' && (
        <section className={styles.table} aria-live="polite">
          <div className={styles.headerRow}>
            <span className={styles.company}>
              {cleanName(state.a)} <i className={styles.ticker}>({state.a.symbol})</i>
            </span>
            <span className={styles.rowLabel} aria-hidden="true">vs</span>
            <span className={styles.company}>
              {cleanName(state.b)} <i className={styles.ticker}>({state.b.symbol})</i>
            </span>
          </div>

          {ROWS.map((row) => {
            const av = row.read(state.a);
            const bv = row.read(state.b);
            // Only call a winner when BOTH sides have the metric and the
            // metric has a direction at all.
            const comparable = av != null && bv != null && row.higherIsBetter;
            const aAhead = comparable && av! > bv!;
            const bAhead = comparable && bv! > av!;
            return (
              <div key={row.key} className={styles.row}>
                <span className={aAhead ? `${styles.value} ${styles.ahead}` : styles.value}>
                  {av == null ? '—' : row.format(av)}
                </span>
                <span className={styles.rowLabel}>{row.label[lang]}</span>
                <span className={bAhead ? `${styles.value} ${styles.ahead}` : styles.value}>
                  {bv == null ? '—' : row.format(bv)}
                </span>
              </div>
            );
          })}

          {(state.a.isDemo || state.b.isDemo) && (
            <p className={styles.note}>
              {lang === 'he'
                ? 'נתוני הדגמה — לא מחירי שוק אמיתיים'
                : 'Demo data — not real market prices'}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
