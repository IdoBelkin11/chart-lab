import { useMemo, useState } from 'react';
import {
  compoundInterest, dollarCostAverage, percentageReturn, profitLoss
} from '@core/calculators/calculations.js';
import { useLang } from '@ui/hooks/useLang';
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
const TABS: Array<{
  id: TabId;
  label: { he: string; en: string };
  fields: Field[];
  compute: (v: Record<string, number>) => { headline: string; lines: Array<{ label: string; value: string }> };
}> = [
  {
    id: 'compound',
    label: { he: 'ריבית דריבית', en: 'Compounding' },
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
          { label: 'growth', value: money(r.futureValue - r.totalContributed) }
        ]
      };
    }
  },
  {
    id: 'dca',
    label: { he: 'הפקדה קבועה', en: 'Recurring investment' },
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
          { label: 'growth', value: money(r.futureValue - r.totalContributed) }
        ]
      };
    }
  },
  {
    id: 'return',
    label: { he: 'תשואה', en: 'Return' },
    fields: [
      { id: 'initial', label: { he: 'שווי התחלתי', en: 'Initial value' }, value: 100 },
      { id: 'final', label: { he: 'שווי סופי', en: 'Final value' }, value: 150 }
    ],
    compute: (v) => {
      const r = percentageReturn(v.initial!, v.final!) as any;
      return {
        headline: r.validInput ? `${r.percentChange.toFixed(2)}%` : '—',
        lines: [{ label: 'absolute', value: money(v.final! - v.initial!) }]
      };
    }
  },
  {
    id: 'position',
    label: { he: 'רווח/הפסד', en: 'Profit / loss' },
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

function money(n: number): string {
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
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

  // Values are keyed per tab, so switching tabs and back keeps what you typed.
  const [values, setValues] = useState<Record<string, Record<string, number>>>(() =>
    Object.fromEntries(
      TABS.map((x) => [x.id, Object.fromEntries(x.fields.map((f) => [f.id, f.value]))])
    )
  );

  const current = values[tabId]!;
  const result = useMemo(() => tab.compute(current), [tab, current]);

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.title}>{t('navCalculators')}</h1>
      </div>

      <div className={styles.tabs} role="tablist" aria-label={t('navCalculators')}>
        {TABS.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={x.id === tabId}
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
        </div>

        <output className={styles.result} aria-live="polite">
          <p className={styles.headline} data-testid="calc-headline">{result.headline}</p>
          {result.lines.map((line) => (
            <p key={line.label} className={styles.line}>
              <span>{LINE_LABELS[line.label]?.[lang] ?? line.label}</span>
              <b>{line.value}</b>
            </p>
          ))}
        </output>
      </div>

      <p className={styles.note}>
        {lang === 'he'
          ? 'החישובים להמחשה חינוכית בלבד ואינם ייעוץ השקעות.'
          : 'Calculations are for educational illustration only and are not investment advice.'}
      </p>
    </div>
  );
}
