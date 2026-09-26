import type { ReactNode } from 'react';
import type { Lang, Localized } from '@core/types/kb';
import type { Diagram } from '@core/lessons/content';
import { Icon } from '@ui/components/icons/Icons';
import styles from './Diagrams.module.css';

// ---------------------------------------------------------------------------
// A lesson's explanatory figures that are not price charts (the shapes in
// @core/lessons/content/types). Each is plain, readable HTML — so a screen
// reader gets the same figures a sighted learner does — and every number sits
// in an LTR-isolated span, so a Hebrew page never reverses one.
// ---------------------------------------------------------------------------

const TX = {
  he: { price: 'מחיר', qty: 'כמות', asks: 'הצעות מכירה', bids: 'הצעות קנייה', spread: 'מרווח', lowest: 'הזולה ביותר', highest: 'הגבוהה ביותר', mine: 'הפקודה שלכם',
    member: 'חברה', weight: 'משקל', change: 'שינוי', contrib: 'תרומה למדד', index: 'המדד',
    open: 'פתיחה', close: 'סגירה', high: 'גבוה', low: 'נמוך', body: 'גוף', upper: 'צל עליון', lower: 'צל תחתון' },
  en: { price: 'Price', qty: 'Quantity', asks: 'Sell offers', bids: 'Buy offers', spread: 'Spread', lowest: 'lowest', highest: 'highest', mine: 'Your order',
    member: 'Company', weight: 'Weight', change: 'Change', contrib: 'Adds to index', index: 'The index',
    open: 'Open', close: 'Close', high: 'High', low: 'Low', body: 'Body', upper: 'Upper shadow', lower: 'Lower shadow' }
} as const;

const pct = (x: number, digits = 0) => `${x > 0 ? '+' : x < 0 ? '−' : ''}${Math.abs(x).toFixed(digits)}%`;
const f2 = (x: number) => x.toFixed(2);
const qty = (x: number) => x.toLocaleString('en-US');

/** `compact`: inside a question or an Apply check rather than filling the work well. */
export function DiagramView({ d, lang, compact }: { d: Diagram; lang: Lang; compact?: boolean }) {
  let body: ReactNode;
  if (d.type === 'flow') {
    body = (
      <ol className={styles.flow}>
        {d.stages.map((s, i) => (
          <li key={i} className={styles.stage}>
            <span className={styles.stageN} aria-hidden="true">{i + 1}</span>
            <b>{s.label[lang]}</b>
            <span className="small">{s.sub[lang]}</span>
            {i < d.stages.length - 1 && <span className={styles.arrow} aria-hidden="true"><Icon name={lang === 'he' ? 'chevL' : 'chevR'} size={18} /></span>}
          </li>
        ))}
      </ol>
    );
  } else if (d.type === 'weights') body = <Weights d={d} lang={lang} />;
  else if (d.type === 'book') body = <BookView asks={d.asks} bids={d.bids} highlight={d.highlight} lang={lang} />;
  else if (d.type === 'candles') body = <Candles d={d} lang={lang} />;
  else if (d.type === 'table') body = <Table d={d} lang={lang} />;
  else if (d.type === 'stacks') body = <Stacks d={d} lang={lang} />;
  else if (d.type === 'waterfall') body = <Waterfall d={d} lang={lang} />;
  else if (d.type === 'grouped') body = <Grouped d={d} lang={lang} />;
  else {
    const max = Math.max(...d.bars.map((b) => b.value));
    body = (
      <ul className={styles.bars}>
        {d.bars.map((b, i) => (
          <li key={i}>
            <span className={styles.barLabel}>{b.label[lang]}</span>
            <span className={styles.barTrack}><span className={styles.barFill} data-tone={b.tone} style={{ width: `${(b.value / max) * 100}%` }} /></span>
            <b className={styles.barValue}>{b.shown[lang]}</b>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <figure className={`${styles.frame}${compact ? ` ${styles.compact}` : ''}`}>
      <div className={styles.head}><figcaption className="chip">{d.title[lang]}</figcaption><span className="demo">{lang === 'he' ? 'דוגמה להמחשה' : 'Illustration'}</span></div>
      <div className={styles.body}>{body}</div>
      {d.caption && <p className={`small ${styles.caption}`}>{d.caption[lang]}</p>}
    </figure>
  );
}

function Weights({ d, lang }: { d: Extract<Diagram, { type: 'weights' }>; lang: Lang }) {
  const tx = TX[lang];
  const total = d.members.reduce((s, m) => s + (m.weight * m.change) / 100, 0);
  const tone = (x: number) => (x > 0 ? 'up' : x < 0 ? 'down' : undefined);
  return (
    <table className={styles.weights}>
      <thead><tr><th scope="col">{tx.member}</th><th scope="col">{tx.weight}</th><th scope="col">{tx.change}</th><th scope="col">{tx.contrib}</th></tr></thead>
      <tbody>
        {d.members.map((m, i) => {
          const c = (m.weight * m.change) / 100;
          return (
            <tr key={i}>
              <th scope="row">{m.name[lang]}</th>
              <td><span className={styles.wBar}><span style={{ width: `${m.weight}%` }} /></span><span className="n">{m.weight}%</span></td>
              <td data-tone={tone(m.change)}><span className="n">{pct(m.change)}</span></td>
              <td data-tone={tone(c)}><span className="n">{pct(c, 2)}</span></td>
            </tr>
          );
        })}
      </tbody>
      <tfoot><tr><th scope="row" colSpan={3}>{tx.index}</th><td data-tone={tone(total)}><b className="n">{pct(total, 2)}</b></td></tr></tfoot>
    </table>
  );
}

/**
 * Single candles drawn large on one shared price scale, every part named: the
 * four prices on one side, the body and the two shadows on the other.
 */
function Candles({ d, lang }: { d: Extract<Diagram, { type: 'candles' }>; lang: Lang }) {
  const tx = TX[lang];
  const lo = Math.min(...d.candles.map((c) => c.l)), hi = Math.max(...d.candles.map((c) => c.h));
  const H = 230, top = 16, colW = 260, W = colW * d.candles.length;
  const y = (p: number) => top + ((hi - p) / (hi - lo)) * H;
  const f = (p: number) => p.toFixed(0);
  // Candles run in reading order (right to left in Hebrew), matching the captions below them.
  // Prices sit on the inline-end side of each candle, parts on the inline-start side. The SVG
  // inherits the page direction, so 'start'/'end' anchors already flip with it: prices always
  // anchor at 'start' and parts at 'end', whichever side that is.
  const endSide = lang === 'he' ? -1 : 1;
  const colX = (i: number) => (lang === 'he' ? W - colW * i - colW / 2 : colW * i + colW / 2);
  return (
    <div className={styles.candles}>
      <svg viewBox={`0 0 ${W} ${H + top * 2}`} role="img" aria-label={d.candles.map((c) => `${c.name[lang]}: ${tx.open} ${f(c.o)}, ${tx.close} ${f(c.c)}, ${tx.high} ${f(c.h)}, ${tx.low} ${f(c.l)}`).join(' · ')}>
        {d.candles.map((c, i) => {
          const cx = colX(i), up = c.c >= c.o;
          const bt = y(Math.max(c.o, c.c)), bb = y(Math.min(c.o, c.c));
          const px = cx + endSide * 34, qx = cx - endSide * 34;
          const anchorP = 'start', anchorQ = 'end';
          return (
            <g key={i} data-dir={up ? 'up' : 'down'} className={styles.candle}>
              <line x1={cx} x2={cx} y1={y(c.h)} y2={y(c.l)} />
              <rect x={cx - 20} y={bt} width="40" height={Math.max(2, bb - bt)} rx="3" />
              <text x={px} y={y(c.h) + 4} textAnchor={anchorP}>{tx.high} {f(c.h)}</text>
              <text x={px} y={y(c.o) + 4} textAnchor={anchorP} className={styles.oc}>{tx.open} {f(c.o)}</text>
              <text x={px} y={y(c.c) + 4} textAnchor={anchorP} className={styles.oc}>{tx.close} {f(c.c)}</text>
              <text x={px} y={y(c.l) + 4} textAnchor={anchorP}>{tx.low} {f(c.l)}</text>
              <text x={qx} y={(y(c.h) + bt) / 2 + 4} textAnchor={anchorQ} className={styles.part}>{tx.upper}</text>
              <text x={qx} y={(bt + bb) / 2 + 4} textAnchor={anchorQ} className={styles.part}>{tx.body}</text>
              <text x={qx} y={(bb + y(c.l)) / 2 + 4} textAnchor={anchorQ} className={styles.part}>{tx.lower}</text>
            </g>
          );
        })}
      </svg>
      <div className={styles.candleNotes} style={{ gridTemplateColumns: `repeat(${d.candles.length}, minmax(0, 1fr))` }}>
        {d.candles.map((c, i) => <div key={i}><b>{c.name[lang]}</b><span className="small">{c.note[lang]}</span></div>)}
      </div>
    </div>
  );
}

/**
 * An order book: sell offers above (highest first, so the cheapest sits in the
 * middle), buy offers below. Shared by the lesson diagrams and the F5 activity.
 */
export function BookView({ asks, bids, highlight = 'none', hit = [], lang, live }: {
  asks: ReadonlyArray<readonly [number, number]>; bids: ReadonlyArray<readonly [number, number, boolean?]>;
  highlight?: 'none' | 'best' | 'spread'; hit?: number[]; lang: Lang; live?: boolean;
}) {
  const tx = TX[lang];
  const width = (q: number) => `${Math.min(100, Math.round(q / 12))}%`;
  const a = asks.slice(0, 4), b = bids.slice(0, 4);
  const spread = asks.length && bids.length ? asks[0]![0] - bids[0]![0] : null;
  return (
    <div className={styles.book} aria-live={live ? 'polite' : undefined}>
      <div className={styles.bookHead}><span>{tx.price}</span><span>{tx.qty}</span></div>
      <span className={`label ${styles.askLabel}`}>{tx.asks}</span>
      {[...a].reverse().map(([p, q], i) => {
        const best = highlight === 'best' && p === asks[0]![0];
        return (
          <div key={`a${p}`} className={styles.row} data-side="ask" data-hit={hit.includes(p) || undefined} data-best={best || undefined} data-last={i === a.length - 1 || undefined}>
            <span className={styles.bar} style={{ width: width(q) }} /><span className={`n ${styles.px}`}>{f2(p)}</span>
            <span className={styles.qty}>{best && <span className="chip err">{tx.lowest}</span>}<span className="n">{qty(q)}</span></span>
          </div>
        );
      })}
      <div className={styles.spread} data-on={highlight === 'spread' || undefined}>
        {spread !== null && (highlight === 'spread' || live) ? <><span>{tx.spread}</span><b className="n">{f2(spread)}</b></> : null}
      </div>
      {b.map(([p, q, mine]) => {
        const best = highlight === 'best' && p === bids[0]![0];
        return (
          <div key={`b${p}${mine ? 'm' : ''}`} className={styles.row} data-side="bid" data-mine={mine || undefined} data-best={best || undefined}>
            <span className={styles.bar} style={{ width: width(q) }} /><span className={`n ${styles.px}`}>{f2(p)}</span>
            <span className={styles.qty}>{best && <span className="chip ok">{tx.highest}</span>}{mine && <span className="chip info">{tx.mine}</span>}<span className="n">{qty(q)}</span></span>
          </div>
        );
      })}
      <span className={`label ${styles.bidLabel}`}>{tx.bids}</span>
    </div>
  );
}

/** A cell: a formatted number (kept left to right in any language), or words. */
const cell = (c: string | Localized, lang: Lang) => (typeof c === 'string' ? <span className="n">{c}</span> : c[lang]);

/** A labelled grid — statement lines (sub-lines indented, totals ruled), comparisons, forecasts. */
function Table({ d, lang }: { d: Extract<Diagram, { type: 'table' }>; lang: Lang }) {
  return (
    // Focusable: on a phone a wide table scrolls sideways, and a keyboard has to be able to reach it.
    <div className={styles.tableWrap} tabIndex={0} role="region" aria-label={d.title[lang]}>
      <table className={styles.table}>
        <thead><tr>{d.columns.map((c, i) => <th key={i} scope="col">{c[lang]}</th>)}</tr></thead>
        <tbody>
          {d.rows.map((r, i) => (
            <tr key={i} data-kind={r.kind}>
              <th scope="row">{r.label[lang]}</th>
              {r.cells.map((c, k) => <td key={k} data-mark={r.mark?.includes(k) || undefined}>{cell(c, lang)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Columns of proportional blocks: each block's height is its share of the tallest column. */
function Stacks({ d, lang }: { d: Extract<Diagram, { type: 'stacks' }>; lang: Lang }) {
  const sums = d.columns.map((c) => c.parts.reduce((s, p) => s + p.value, 0)), max = Math.max(...sums);
  return (
    <div className={styles.stacks} style={{ gridTemplateColumns: `repeat(${d.columns.length}, minmax(0, 1fr))` }}>
      {d.columns.map((c, i) => (
        <div key={i} className={styles.stackCol}>
          <div className={styles.stackHead}><b>{c.label[lang]}</b><span className="n">{c.total}</span></div>
          <div className={styles.stackArea}>
            <div className={styles.stack} style={{ height: `${(sums[i]! / max) * 100}%` }}>
              {c.parts.map((p, k) => (
                <div key={k} className={styles.block} data-tone={p.tone} data-mark={p.mark || undefined} style={{ flexGrow: p.value }}>
                  <span>{p.label[lang]}</span><b className="n">{p.shown}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * A running total, one step per row: each step's bar runs from the total before
 * it to the total after it; a `total` row is drawn from zero. Rows, not columns,
 * so every label stays readable at phone width and in either direction.
 */
function Waterfall({ d, lang }: { d: Extract<Diagram, { type: 'waterfall' }>; lang: Lang }) {
  let run = 0;
  const segs = d.steps.map((s) => {
    const from = s.total ? 0 : run, to = s.total ? s.value : run + s.value;
    run = to;
    return { ...s, lo: Math.min(from, to), hi: Math.max(from, to) };
  });
  const lo = Math.min(0, ...segs.map((s) => s.lo)), hi = Math.max(0, ...segs.map((s) => s.hi));
  const x = (v: number) => ((v - lo) / (hi - lo)) * 100;
  return (
    <ul className={styles.fall}>
      {segs.map((s, i) => (
        <li key={i} data-total={s.total || undefined}>
          <span className={styles.barLabel}>{s.label[lang]}</span>
          <span className={styles.fallTrack}>
            <span className={styles.zero} style={{ insetInlineStart: `${x(0)}%` }} />
            <span className={styles.fallBar} data-tone={s.total ? (s.value >= 0 ? 'info' : 'err') : s.value >= 0 ? 'ok' : 'err'} style={{ insetInlineStart: `${x(s.lo)}%`, width: `${Math.max(0.8, x(s.hi) - x(s.lo))}%` }} />
          </span>
          <b className={`n ${styles.barValue}`}>{s.shown}</b>
        </li>
      ))}
    </ul>
  );
}

/** Bars grouped by period (time runs left to right in every language, as on the charts). */
function Grouped({ d, lang }: { d: Extract<Diagram, { type: 'grouped' }>; lang: Lang }) {
  const max = Math.max(...d.series.flatMap((s) => s.values));
  const summary = d.series.map((s) => `${s.label[lang]}: ${d.groups.map((g, i) => `${g} ${s.shown[i]}`).join(', ')}`).join(' · ');
  return (
    <div className={styles.grouped}>
      <div className={styles.gPlot} dir="ltr" role="img" aria-label={summary}>
        {d.groups.map((g, i) => (
          <div key={g} className={styles.gGroup}>
            <div className={styles.gBars}>
              {d.series.map((s, k) => <span key={k} className={styles.gBar} data-tone={s.tone} style={{ height: `${Math.max(1, (s.values[i]! / max) * 100)}%` }}><b className="n">{s.shown[i]}</b></span>)}
            </div>
            <span className={`n ${styles.gLabel}`}>{g}</span>
          </div>
        ))}
      </div>
      <ul className={styles.legend}>{d.series.map((s, k) => <li key={k}><span className={styles.swatch} data-tone={s.tone} />{s.label[lang]}</li>)}</ul>
    </div>
  );
}
