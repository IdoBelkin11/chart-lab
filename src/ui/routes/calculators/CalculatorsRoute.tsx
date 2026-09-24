import { useMemo, useState } from 'react';
import {
  compoundInterest, dollarCostAverage, percentageReturn, profitLoss
} from '@core/calculators/calculations.js';
import { useLang } from '@ui/hooks/useLang';
import { SlidingPill, useSlidingPill } from '@ui/components/nav/SlidingPill';
import styles from './CalculatorsRoute.module.css';

type TabId = 'compound' | 'dca' | 'return' | 'position';

interface Field { id: string; label: { he: string; en: string }; value: number; step?: number }

/**
 * Calculators.
 *
 * Each tab is a small declarative spec — fields in, a compute function, and
 * result lines out. Adding a calculator is adding one entry to TABS rather
 * than another block of bespoke markup, which is what kept the previous
 * implementation from staying consistent between tabs.
 *
 * The maths itself lives in @core and is unchanged; this file only presents.
 */
/**
 * `series`, where a tab has one, returns the value at each step of the run —
 * year by year for compounding, period by period for a recurring investment.
 * It exists so the sparkline can be drawn from the SAME function that produced
 * the headline figure: a curve computed some other way could drift out of
 * agreement with the number printed above it, and a teaching tool that
 * contradicts itself is worse than one with no chart.
 *
 * The single-point calculators (return, position) have no series by design —
 * there is no run to plot, and inventing one would be fabricating data.
 */
const TABS: Array<{
  id: TabId;
  label: { he: string; en: string };
  /** What the headline number IS. A result panel labelled "Result" says only
   *  that a calculation happened; "Future value" says what was calculated,
   *  which is the part a learner needs. */
  resultLabel: { he: string; en: string };
  fields: Field[];
  compute: (v: Record<string, number>) => { headline: string; lines: Array<{ label: string; value: string }> };
  series?: (v: Record<string, number>) => number[];
}> = [
  {
    id: 'compound',
    label: { he: 'ריבית דריבית', en: 'Compounding' },
    resultLabel: { he: 'שווי עתידי', en: 'Future value' },
    fields: [
      { id: 'principal', label: { he: 'סכום התחלתי', en: 'Initial amount' }, value: 10000 },
      { id: 'rate', label: { he: 'תשואה שנתית (%)', en: 'Annual return (%)' }, value: 7, step: 0.1 },
      { id: 'years', label: { he: 'שנים', en: 'Years' }, value: 10 },
      { id: 'contribution', label: { he: 'הפקדה שנתית', en: 'Yearly contribution' }, value: 0 }
    ],
    compute: (v) => {
      const r = compoundInterest(v.principal!, v.rate!, v.years!, v.contribution!) as any;
      return {
        headline: money(r.futureValue),
        lines: [
          { label: 'contributed', value: money(r.totalContributed) },
          { label: 'growth', value: money(r.futureValue - r.totalContributed, true) }
        ]
      };
    },
    series: (v) => {
      const years = Math.max(0, Math.min(Math.round(v.years ?? 0), 80));
      return Array.from({ length: years + 1 }, (_, y) => {
        const r = compoundInterest(v.principal!, v.rate!, y, v.contribution!) as any;
        return r.futureValue as number;
      });
    }
  },
  {
    id: 'dca',
    label: { he: 'הפקדה קבועה', en: 'Recurring investment' },
    resultLabel: { he: 'שווי עתידי', en: 'Future value' },
    fields: [
      { id: 'amount', label: { he: 'סכום לתקופה', en: 'Amount per period' }, value: 500 },
      { id: 'periods', label: { he: 'מספר תקופות', en: 'Number of periods' }, value: 120 },
      { id: 'rate', label: { he: 'תשואה שנתית (%)', en: 'Annual return (%)' }, value: 7, step: 0.1 },
      { id: 'perYear', label: { he: 'תקופות בשנה', en: 'Periods per year' }, value: 12 }
    ],
    compute: (v) => {
      const r = dollarCostAverage(v.amount!, v.periods!, v.rate!, v.perYear!) as any;
      return {
        headline: money(r.futureValue),
        lines: [
          { label: 'contributed', value: money(r.totalContributed) },
          { label: 'growth', value: money(r.futureValue - r.totalContributed, true) }
        ]
      };
    },
    series: (v) => {
      const periods = Math.max(0, Math.min(Math.round(v.periods ?? 0), 600));
      // Sampled, not every period: 600 monthly points would be far more
      // vertices than a 92px-tall sparkline can show.
      const steps = Math.min(periods, 60);
      return Array.from({ length: steps + 1 }, (_, i) => {
        const p = Math.round((periods * i) / Math.max(steps, 1));
        const r = dollarCostAverage(v.amount!, p, v.rate!, v.perYear!) as any;
        return r.futureValue as number;
      });
    }
  },
  {
    id: 'return',
    label: { he: 'תשואה', en: 'Return' },
    resultLabel: { he: 'תשואה באחוזים', en: 'Percentage return' },
    fields: [
      { id: 'initial', label: { he: 'שווי התחלתי', en: 'Initial value' }, value: 100 },
      { id: 'final', label: { he: 'שווי סופי', en: 'Final value' }, value: 150 }
    ],
    compute: (v) => {
      const r = percentageReturn(v.initial!, v.final!) as any;
      return {
        headline: r.validInput ? `${r.percentChange.toFixed(2)}%` : '—',
        lines: [{ label: 'absolute', value: money(v.final! - v.initial!, true) }]
      };
    }
  },
  {
    id: 'position',
    label: { he: 'רווח/הפסד', en: 'Profit / loss' },
    resultLabel: { he: 'רווח/הפסד נטו', en: 'Net profit / loss' },
    fields: [
      { id: 'buy', label: { he: 'מחיר קנייה', en: 'Buy price' }, value: 100 },
      { id: 'sell', label: { he: 'מחיר מכירה', en: 'Sell price' }, value: 110 },
      { id: 'shares', label: { he: 'כמות', en: 'Shares' }, value: 10 },
      { id: 'buyFees', label: { he: 'עמלת קנייה', en: 'Buy fees' }, value: 5 },
      { id: 'sellFees', label: { he: 'עמלת מכירה', en: 'Sell fees' }, value: 5 }
    ],
    compute: (v) => {
      const r = profitLoss(v.buy!, v.sell!, v.shares!, v.buyFees!, v.sellFees!) as any;
      return {
        headline: money(r.netProfitLoss),
        lines: [
          { label: 'cost', value: money(r.totalCost) },
          { label: 'proceeds', value: money(r.totalProceeds ?? r.totalCost + r.netProfitLoss) }
        ]
      };
    }
  }
];

function money(n: number, signed = false): string {
  if (!Number.isFinite(n)) return '—';
  const s = n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  // A growth figure reads as a change, so it carries its direction. A negative
  // number already has its sign; only the positive case needs one added.
  return signed && n > 0 ? `+${s}` : s;
}

/**
 * Splits a formatted figure into the part that carries the meaning and the
 * cents that follow it, so the decimals can be set smaller and quieter.
 *
 * At 42px, ".51" is as visually loud as the thousands it hangs off, and the
 * eye has to work past it to read the number. Any trailing unit (a "%") stays
 * at full size — it is not noise, it is what the number is measured in.
 */
function splitFigure(s: string): { lead: string; frac: string; unit: string } {
  const m = /^(.*?)([.,]\d+)(\D*)$/.exec(s);
  if (!m) return { lead: s, frac: '', unit: '' };
  return { lead: m[1]!, frac: m[2]!, unit: m[3]! };
}

/**
 * The growth curve, as plain SVG.
 *
 * Deliberately not the canvas Chart component: that one draws OHLC candles
 * from market data and carries a tooltip, a grid and an axis. This is a
 * single monotonic series with no time axis worth labelling, and it has to
 * redraw on every keystroke — a path with a fill under it is the whole job.
 *
 * `preserveAspectRatio="none"` lets the 0–100 viewBox stretch to whatever
 * width the result card happens to be, so no measurement is needed.
 */
function Sparkline({ values, label }: { values: number[]; label: string }) {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || 1;
  const step = 100 / (values.length - 1);
  // 4% of headroom top and bottom so the peak is not clipped by the stroke.
  const pts = values.map((v, i) => `${(i * step).toFixed(2)},${(96 - ((v - lo) / span) * 92).toFixed(2)}`);

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={label}>
      <defs>
        <linearGradient id="calc-spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.38" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,100 ${pts.join(' ')} 100,100`} fill="url(#calc-spark-fill)" />
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke="var(--accent-strong)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

const LINE_LABELS: Record<string, { he: string; en: string }> = {
  contributed: { he: 'סך ההפקדות', en: 'Total contributed' },
  growth: { he: 'רווח מצטבר', en: 'Growth' },
  absolute: { he: 'שינוי מוחלט', en: 'Absolute change' },
  cost: { he: 'עלות כוללת', en: 'Total cost' },
  proceeds: { he: 'תמורה', en: 'Proceeds' }
};

export function CalculatorsRoute() {
  const { lang, t } = useLang();
  const [tabId, setTabId] = useState<TabId>('compound');
  const tab = TABS.find((x) => x.id === tabId)!;
  const seg = useSlidingPill<HTMLDivElement>([tabId, lang]);

  // Values are keyed per tab, so switching tabs and back keeps what you typed.
  const [values, setValues] = useState<Record<string, Record<string, number>>>(() =>
    Object.fromEntries(
      TABS.map((x) => [x.id, Object.fromEntries(x.fields.map((f) => [f.id, f.value]))])
    )
  );

  const current = values[tabId]!;
  const result = useMemo(() => tab.compute(current), [tab, current]);
  const series = useMemo(() => {
    if (!tab.series) return null;
    const vals = tab.series(current);
    // A run that never changes (0 years, 0 periods, a zero rate on a zero
    // balance) has no curve to show — a flat line would imply a result the
    // maths did not produce.
    return vals.every((v) => Number.isFinite(v)) && vals[0] !== vals[vals.length - 1] ? vals : null;
  }, [tab, current]);

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.title}>{t('navCalculators')}</h1>
      </div>

      <div className={styles.tabs} role="tablist" aria-label={t('navCalculators')} ref={seg.ref}>
        {/* The same capsule that travels in the header, not four backgrounds
            toggling on and off. */}
        <SlidingPill rect={seg.rect} instant={seg.placed} tone="inset" />
        {TABS.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={x.id === tabId}
            data-active={x.id === tabId ? 'true' : undefined}
            className={x.id === tabId ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            onClick={() => setTabId(x.id)}
          >
            {x.label[lang]}
          </button>
        ))}
      </div>

      <div className={styles.body}>
        <div className={styles.fields}>
          {tab.fields.map((f) => (
            <label key={f.id} className={styles.field}>
              <span className={styles.fieldLabel}>{f.label[lang]}</span>
              <input
                className={styles.input}
                type="number"
                step={f.step ?? 1}
                value={current[f.id] ?? 0}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    [tabId]: { ...prev[tabId]!, [f.id]: Number(e.target.value) }
                  }))
                }
              />
            </label>
          ))}

          {/* Under the inputs, not stranded at the foot of the page: it
              qualifies the numbers being entered and read right here. */}
          <p className={styles.note}>
            {lang === 'he'
              ? 'החישובים להמחשה חינוכית בלבד ואינם ייעוץ השקעות.'
              : 'Calculations are for educational illustration only and are not investment advice.'}
          </p>
        </div>

        <output className={styles.result} aria-live="polite">
          <p className={styles.resultKicker}>{tab.resultLabel[lang]}</p>
          {/* data-testid stays on one element holding the complete figure, so
              a test still reads "19,671.51" rather than the lead alone. */}
          <p className={styles.headline} data-testid="calc-headline">
            {(() => {
              const { lead, frac, unit } = splitFigure(result.headline);
              return (
                <span className={styles.figure}>
                  {lead}
                  {frac && <span className={styles.frac}>{frac}</span>}
                  {unit}
                </span>
              );
            })()}
          </p>
          <div className={styles.rule} />
          {result.lines.map((line) => (
            <p
              key={line.label}
              className={line.label === 'growth' ? `${styles.line} ${styles.lineGrowth}` : styles.line}
            >
              <span>{LINE_LABELS[line.label]?.[lang] ?? line.label}</span>
              <b>{line.value}</b>
            </p>
          ))}
          {series && series.length > 1 && (
            <div className={styles.spark}>
              <Sparkline
                values={series}
                label={
                  lang === 'he'
                    ? `עקומת צמיחה לאורך ${series.length - 1} צעדים, מ-${money(series[0]!)} ל-${money(series[series.length - 1]!)}`
                    : `Growth curve over ${series.length - 1} steps, from ${money(series[0]!)} to ${money(series[series.length - 1]!)}`
                }
              />
            </div>
          )}
        </output>
      </div>
    </div>
  );
}
