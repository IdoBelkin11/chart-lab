import { useEffect, useId, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Lang } from '@core/types/kb';
import { lessonById, lessonsOf } from '@core/curriculum/curriculum';
import {
  compoundMonthly, crossoverYear, dcfGrid, dcfPerShare, positionIssue, positionSize, positionWarnings, riskReward, tenTrades
} from '@core/calculators/tools';
import type { Side } from '@core/calculators/tools';
import { percentageReturn, profitLoss } from '@core/calculators/calculations.js';
import { GLOSSARY } from '@core/glossary/terms';
import { useAppState } from '@ui/app/AppState';
import { useRoute } from '@ui/hooks/useRoute';
import type { ToolId } from '@ui/hooks/useRoute';
import { Icon } from '@ui/components/icons/Icons';
import type { IconName } from '@ui/components/icons/Icons';
import { ToolCrumbs } from './ToolCrumbs';
import styles from './ToolsRoute.module.css';

// ---------------------------------------------------------------------------
// Tools (Artifact 13): the hub and the calculators. Every figure on these
// pages comes from @core/calculators — this file only presents. Results are
// live: there is no "calculate" step between a number and its effect.
// ---------------------------------------------------------------------------

const TRACK_SHORT = { he: { F: 'יסודות', T: 'טכני', P: 'פונדמנטלי', R: 'סיכון', M: 'מאקרו', D: 'נגזרים' }, en: { F: 'Basics', T: 'Technical', P: 'Fundamental', R: 'Risk', M: 'Macro', D: 'Derivatives' } } as const;

const TX = {
  he: {
    tools: 'כלים', hubSub: 'מחשבונים שלמדתם להשתמש בהם בשיעורים — עכשיו על מספרים משלכם.', search: 'חיפוש כלי', noMatch: 'לא נמצא כלי כזה.', toGlossary: 'לחפש במילון',
    example: 'דוגמה', lastUsed: 'שימוש אחרון', reopen: 'לפתוח שוב', demo: 'להמחשה · לא ייעוץ', howItWorks: (l: string) => `איך זה עובד · ${l}`,
    lessonRef: (t: string, n: number) => `${t} · שיעור ${n}`, liveData: 'נתוני שוק', basics: 'מחשבון בסיס', allTracks: 'כל המסלולים', termsN: (n: number) => `${n} מונחים`,
    eg: (x: string) => `לדוגמה ${x}`, cur: '₪', yourData: 'הנתונים שלכם', reset: 'איפוס', fillExample: 'למלא בדוגמה',
    // position
    posTitle: 'מחשבון גודל פוזיציה', posShort: 'גודל פוזיציה', posSub: 'מתחילים ממה שמותר להפסיד — הכמות נגזרת מזה.', posCard: 'כמה מניות לקנות כדי שהפסד בסטופ יהיה בדיוק מה שהחלטתם.',
    account: 'גודל החשבון', risk: 'סיכון לעסקה', riskHelp: 'נהוג 0.5%–2%', entry: 'מחיר כניסה', stop: 'מחיר סטופ', side: 'כיוון העסקה', long: 'קנייה', short: 'מכירה בחסר',
    fourNumbers: 'ארבעה מספרים, תשובה אחת', fourBody: 'מלאו את השדות. התוצאה תופיע כאן: כמה מניות, כמה זה עולה, וכמה תפסידו אם הסטופ ייפגע.', steps4: ['חשבון', 'סיכון', 'כניסה', 'סטופ'],
    qty: 'כמות לקנייה', sharesWord: 'מניות', posCost: 'עלות הפוזיציה', lossIfStop: 'הפסד אם הסטופ נפגע', toStop: 'מרחק לסטופ', ofAccount: 'חלק מהחשבון',
    inTrade: 'מהחשבון בעסקה', atRisk: 'מסכנים', whyN: (n: number) => `למה ${n}`,
    whyBody: (risk: string, per: string, n: number) => `${risk} ÷ ${per} למניה = ${n} מניות. סטופ רחוק יותר = פחות מניות, אותו הפסד.`,
    cantYet: 'אי אפשר לחשב עדיין', stopSideLong: 'בעסקת קנייה הסטופ צריך להיות מתחת למחיר הכניסה', stopSideShort: 'במכירה בחסר הסטופ צריך להיות מעל מחיר הכניסה', stopEqual: 'הסטופ לא יכול להיות בדיוק במחיר הכניסה',
    stopHint: 'אם התכוונתם לכיוון ההפוך — החליפו את כיוון העסקה למעלה.', warnNotError: 'אזהרה, לא שגיאה',
    highRisk: (p: string) => `סיכון של ${p}% לעסקה — כמה הפסדים ברצף מורידים חלק גדול מהחשבון. רוב מנהלי הסיכון מגבילים ל־1%–2%.`,
    overAccount: 'הפוזיציה גדולה מהחשבון — זה אפשרי רק עם מינוף.', result: 'תוצאה',
    // risk / reward
    rrTitle: 'יחס סיכוי-סיכון', rrSub: 'כמה מסכנים, כמה אפשר להרוויח, ומה צריך לקרות כדי שזה ישתלם.', rrCard: 'סטופ, יעד ומה אחוז ההצלחה שצריך כדי שהעסקה תשתלם.',
    trade: 'העסקה', target: 'יעד', riskPerShare: 'סיכון למניה', rewardPerShare: 'סיכוי למניה', ratio: 'יחס', rrInvalid: 'הסטופ והיעד צריכים להיות משני צדי מחיר הכניסה.',
    tenTitle: 'מה יוצא מ־10 עסקאות כאלה', tenSub: (l: string, w: string) => `הפסד ${l} כשנכשל, רווח ${w} כשמצליח (למניה).`, success: (p: number) => `${p}% הצלחה`,
    breakEven: 'נקודת האיזון', breakBody: (r: string, w: string, p: number) => `${r} ÷ (${r} + ${w}) = ${p}%. מעל זה — רווח לאורך זמן.`, ladderAria: 'כניסה, סטופ ויעד על ציר המחיר',
    // compound
    cmpTitle: 'ריבית דריבית', cmpSub: 'הפקדה חודשית קבועה, תשואה שנתית ממוצעת, ושנים. הריבית עושה את השאר.', cmpCard: 'כמה יצמח חיסכון חודשי לאורך שנים — ומה חלק הריבית.',
    initial: 'סכום התחלתי', monthly: 'הפקדה חודשית', annual: 'תשואה שנתית', years: 'שנים', lower: (x: string) => `${x} — הורדה`, higher: (x: string) => `${x} — העלאה`,
    atEnd: 'בסוף התקופה', deposited: 'הפקדתם', added: 'הריבית הוסיפה', growth: 'צמיחה שנה אחרי שנה', depLegend: 'מה שהפקדתם', intLegend: 'מה שהריבית הוסיפה', yearN: (n: number) => `שנה ${n}`,
    crossNote: (y: number) => `משנה ${y} הריבית מוסיפה יותר ממה שהפקדתם. לכן הזמן חשוב יותר מהסכום.`, noCross: 'בתקופה הזו ההפקדות עדיין גדולות מהריבית. הוסיפו שנים וראו מתי זה מתהפך.',
    chartAria: (y: number) => `צמיחת החיסכון לאורך ${y} שנים`,
    // dcf
    dcfTitle: 'מודל DCF', dcfSub: 'השווי שהמודל נותן, מול המחיר בשוק — ועד כמה התשובה תלויה בהנחות.', dcfCard: 'שווי משוער למניה מתזרים עתידי, עם טבלת רגישות.',
    assumptions: 'הנחות', fcf: 'תזרים חופשי אחרון', mUnit: 'מיליון', g15: 'צמיחה, שנים 1–5', disc: 'שיעור היוון', term: 'צמיחה ארוכת טווח', netDebt: 'חוב נטו', sharesOut: 'מניות', price: 'מחיר בשוק',
    value: 'שווי משוער', margin: 'מרווח ביטחון', sens: 'רגישות: שווי למניה', above: 'מעל מחיר השוק', below: 'מתחת', axis: 'היוון ↓ · צמיחה ←',
    below40: (k: number, n: number) => `ב־${n} צירופים, ${k} נותנים שווי מתחת למחיר השוק. זה מה ש"מרווח ביטחון" בא לכסות.`, discErr: 'שיעור ההיוון חייב להיות גבוה מהצמיחה ארוכת הטווח.',
    // p&l
    pnlTitle: 'רווח והפסד מעסקה', pnlSub: 'מחיר קנייה, מחיר מכירה ועמלות — כמה נשאר ביד, ובכמה אחוזים.', pnlCard: 'רווח או הפסד נטו אחרי עמלות, ותשואה באחוזים.',
    buy: 'מחיר קנייה', sell: 'מחיר מכירה', qtyField: 'כמות', buyFee: 'עמלת קנייה', sellFee: 'עמלת מכירה', net: 'רווח/הפסד נטו', cost: 'עלות כוללת', proceeds: 'תמורה', returnPct: 'תשואה',
    // other cards
    cmpStocks: 'השוואת מניות', cmpStocksCard: 'מכפילים, צמיחה, רווחיות וחוב — זו ליד זו, על נתוני שוק.', stock: 'ניתוח מניה', stockCard: 'מחיר, גרף ונתונים של מניה אמיתית — עם הסבר לכל מספר.',
    glossary: 'מילון מונחים', glossaryCard: 'כל מונח עם הסבר פשוט ודוגמה.', twoCo: 'שתי חברות', anyTicker: 'כל סימול'
  },
  en: {
    tools: 'Tools', hubSub: 'Calculators you learned to use in the lessons — now on your own numbers.', search: 'Search tools', noMatch: 'No tool matches that.', toGlossary: 'Search the glossary',
    example: 'Example', lastUsed: 'Last used', reopen: 'Open again', demo: 'Illustration · not advice', howItWorks: (l: string) => `How it works · ${l}`,
    lessonRef: (t: string, n: number) => `${t} · Lesson ${n}`, liveData: 'Market data', basics: 'Basic calculator', allTracks: 'All tracks', termsN: (n: number) => `${n} terms`,
    eg: (x: string) => `e.g. ${x}`, cur: '$', yourData: 'Your numbers', reset: 'Reset', fillExample: 'Fill in an example',
    posTitle: 'Position size calculator', posShort: 'Position size', posSub: 'Start from what you are willing to lose — the quantity follows from it.', posCard: 'How many shares to buy so a stopped-out loss is exactly what you decided.',
    account: 'Account size', risk: 'Risk per trade', riskHelp: 'Typically 0.5%–2%', entry: 'Entry price', stop: 'Stop price', side: 'Trade direction', long: 'Buy', short: 'Short sell',
    fourNumbers: 'Four numbers, one answer', fourBody: 'Fill in the fields. The result appears here: how many shares, what it costs, and what you lose if the stop is hit.', steps4: ['Account', 'Risk', 'Entry', 'Stop'],
    qty: 'Quantity to buy', sharesWord: 'shares', posCost: 'Position cost', lossIfStop: 'Loss if the stop is hit', toStop: 'Distance to stop', ofAccount: 'Share of the account',
    inTrade: 'Of the account in the trade', atRisk: 'At risk', whyN: (n: number) => `Why ${n}`,
    whyBody: (risk: string, per: string, n: number) => `${risk} ÷ ${per} per share = ${n} shares. A farther stop = fewer shares, the same loss.`,
    cantYet: "Can't calculate yet", stopSideLong: 'In a buy, the stop must be below the entry price', stopSideShort: 'In a short, the stop must be above the entry price', stopEqual: 'The stop cannot be exactly at the entry price',
    stopHint: 'If you meant the other direction, switch the trade direction above.', warnNotError: 'A warning, not an error',
    highRisk: (p: string) => `Risking ${p}% per trade — a few losses in a row take a big bite out of the account. Most risk managers cap it at 1%–2%.`,
    overAccount: 'The position is bigger than the account — only possible with leverage.', result: 'Result',
    rrTitle: 'Risk / reward', rrSub: 'What you risk, what you could make, and what has to happen for it to pay.', rrCard: 'Stop, target, and the success rate the trade needs to pay off.',
    trade: 'The trade', target: 'Target', riskPerShare: 'Risk per share', rewardPerShare: 'Reward per share', ratio: 'Ratio', rrInvalid: 'The stop and the target must be on opposite sides of the entry.',
    tenTitle: 'What 10 trades like this return', tenSub: (l: string, w: string) => `Lose ${l} when it fails, make ${w} when it works (per share).`, success: (p: number) => `${p}% success`,
    breakEven: 'Break-even', breakBody: (r: string, w: string, p: number) => `${r} ÷ (${r} + ${w}) = ${p}%. Above that — profit over time.`, ladderAria: 'Entry, stop and target on the price axis',
    cmpTitle: 'Compound interest', cmpSub: 'A fixed monthly deposit, an average yearly return, and years. Compounding does the rest.', cmpCard: 'How a monthly saving grows over the years — and how much is interest.',
    initial: 'Initial amount', monthly: 'Monthly deposit', annual: 'Yearly return', years: 'Years', lower: (x: string) => `${x} — lower`, higher: (x: string) => `${x} — higher`,
    atEnd: 'At the end', deposited: 'You deposited', added: 'Interest added', growth: 'Growth, year by year', depLegend: 'What you deposited', intLegend: 'What interest added', yearN: (n: number) => `Year ${n}`,
    crossNote: (y: number) => `From year ${y}, interest adds more than you deposited. That is why time matters more than the amount.`, noCross: 'Over this period deposits still outweigh interest. Add years to see when it flips.',
    chartAria: (y: number) => `Savings growth over ${y} years`,
    dcfTitle: 'DCF model', dcfSub: "The value the model gives, against the market price — and how much the answer depends on its assumptions.", dcfCard: 'An estimated value per share from future cash flow, with a sensitivity table.',
    assumptions: 'Assumptions', fcf: 'Latest free cash flow', mUnit: 'million', g15: 'Growth, years 1–5', disc: 'Discount rate', term: 'Long-term growth', netDebt: 'Net debt', sharesOut: 'Shares', price: 'Market price',
    value: 'Estimated value', margin: 'Margin of safety', sens: 'Sensitivity: value per share', above: 'Above market price', below: 'Below', axis: 'Discount ↓ · growth →',
    below40: (k: number, n: number) => `Of ${n} combinations, ${k} value the share below its market price. That is what a "margin of safety" is for.`, discErr: 'The discount rate must be higher than long-term growth.',
    pnlTitle: 'Profit & loss on a trade', pnlSub: 'Buy price, sell price and fees — what you keep, and as a percentage.', pnlCard: 'Net profit or loss after fees, and the return in percent.',
    buy: 'Buy price', sell: 'Sell price', qtyField: 'Quantity', buyFee: 'Buy fee', sellFee: 'Sell fee', net: 'Net profit / loss', cost: 'Total cost', proceeds: 'Proceeds', returnPct: 'Return',
    cmpStocks: 'Compare stocks', cmpStocksCard: 'Multiples, growth, profitability and debt — side by side, on market data.', stock: 'Stock analysis', stockCard: "A real stock's price, chart and numbers — with an explanation for each.",
    glossary: 'Glossary', glossaryCard: 'Every term with a plain explanation and an example.', twoCo: 'Two companies', anyTicker: 'Any ticker'
  }
} as const;
type Tx = (typeof TX)[Lang];

// ---- helpers ------------------------------------------------------------------
const num = (s: string) => { const v = parseFloat(s.replace(/,/g, '')); return Number.isFinite(v) ? v : NaN; };
const fmt = (n: number, d = 2) => (Number.isFinite(n) ? n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—');
const fmt0 = (n: number) => fmt(n, 0);

const LAST_KEY = 'chartlab.tools.last';
interface LastUsed { tool: ToolId; summary: { he: string; en: string } }
function readLast(): LastUsed | null { try { return JSON.parse(localStorage.getItem(LAST_KEY) ?? 'null'); } catch { return null; } }
function writeLast(v: LastUsed) { try { localStorage.setItem(LAST_KEY, JSON.stringify(v)); } catch { /* storage may be unavailable */ } }

function Field({ label, value, onChange, unit, help, state, message, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; unit?: string; help?: string; state?: 'error' | 'warn'; message?: string; placeholder?: string;
}) {
  const id = useId();
  const note = message ?? help;
  return (
    <div className="field">
      <label className="fieldLabel" htmlFor={id}>{label}</label>
      <div className={`input${state ? ` ${state}` : ''}`}>
        <input id={id} value={value} inputMode="decimal" placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
          aria-invalid={state === 'error' || undefined} aria-describedby={note ? `${id}h` : undefined} />
        {unit && <span className="unit">{unit}</span>}
      </div>
      {note && <span className={`help${message ? ` ${state}` : ''}`} id={`${id}h`}>{message && <Icon name="alert" size={14} />}{note}</span>}
    </div>
  );
}

function Head({ tx, title, sub, lessonId, lang }: { tx: Tx; title: string; sub: string; lessonId: string; lang: Lang }) {
  const { go } = useRoute();
  const l = lessonById(lessonId)!;
  const ref = tx.lessonRef(TRACK_SHORT[lang][l.track], lessonsOf(l.track).indexOf(l) + 1);
  return (
    <div className={styles.head}>
      <div className={styles.stack6}><h1 className={`h1 ${styles.title}`}>{title}</h1><p className="txt">{sub}</p></div>
      <div className={styles.headEnd}>
        <button type="button" className={`btnText ${styles.small13}`} onClick={() => go('lesson', { lessonId })}><Icon name="book" size={14} />{tx.howItWorks(ref)}</button>
        <span className="demo">{tx.demo}</span>
      </div>
    </div>
  );
}

const Row = ({ k, v, strong, color }: { k: string; v: string; strong?: boolean; color?: string }) => (
  <div className={styles.row}><span className="small" style={strong ? { color: 'var(--text)' } : undefined}>{k}</span><b className="n" style={color ? { color } : undefined}>{v}</b></div>
);

// ---------------------------------------------------------------------------
export function ToolsRoute({ tool }: { tool?: ToolId }) {
  const { lang } = useAppState();
  const tx = TX[lang];
  if (tool === 'position') return <Position tx={tx} lang={lang} />;
  if (tool === 'rr') return <RiskReward tx={tx} lang={lang} />;
  if (tool === 'compound') return <Compound tx={tx} lang={lang} />;
  if (tool === 'dcf') return <Dcf tx={tx} lang={lang} />;
  if (tool === 'pnl') return <Pnl tx={tx} lang={lang} />;
  return <Hub tx={tx} lang={lang} />;
}

// ---- 13.1 · hub --------------------------------------------------------------
function Hub({ tx, lang }: { tx: Tx; lang: Lang }) {
  const { go } = useRoute();
  const [q, setQ] = useState('');
  const last = useMemo(readLast, []);
  const ref = (id: string) => { const l = lessonById(id)!; return tx.lessonRef(TRACK_SHORT[lang][l.track], lessonsOf(l.track).indexOf(l) + 1); };
  const cards: Array<{ key: string; title: string; body: string; meta: string; icon: IconName; color: string; sample: string; open: () => void }> = [
    { key: 'position', title: tx.posShort, body: tx.posCard, meta: ref('R4'), icon: 'shield', color: 'var(--ok)', sample: `100 ${tx.sharesWord}`, open: () => go('tools', { view: 'position' }) },
    { key: 'rr', title: tx.rrTitle, body: tx.rrCard, meta: ref('R5'), icon: 'target', color: 'var(--learn)', sample: '1 : 2.5', open: () => go('tools', { view: 'rr' }) },
    { key: 'compound', title: tx.cmpTitle, body: tx.cmpCard, meta: ref('R3'), icon: 'chart', color: 'var(--info)', sample: `${tx.cur} ${fmt0(compoundMonthly(10000, 500, 6, 20)[19]!.balance)}`, open: () => go('tools', { view: 'compound' }) },
    { key: 'dcf', title: tx.dcfTitle, body: tx.dcfCard, meta: ref('P9'), icon: 'calc', color: 'var(--adv)', sample: `${tx.cur} ${fmt(dcfPerShare({ fcf: 400, growthPct: 8, discountPct: 10, terminalPct: 2.5, netDebt: 500, shares: 200 })!)}`, open: () => go('tools', { view: 'dcf' }) },
    { key: 'compare', title: tx.cmpStocks, body: tx.cmpStocksCard, meta: ref('P6'), icon: 'compare', color: 'var(--risk)', sample: tx.twoCo, open: () => go('compare') },
    { key: 'stock', title: tx.stock, body: tx.stockCard, meta: tx.liveData, icon: 'search', color: 'var(--ai)', sample: tx.anyTicker, open: () => go('stock') },
    { key: 'pnl', title: tx.pnlTitle, body: tx.pnlCard, meta: tx.basics, icon: 'list', color: 'var(--learn)', sample: `+${tx.cur} 90.00`, open: () => go('tools', { view: 'pnl' }) },
    { key: 'glossary', title: tx.glossary, body: tx.glossaryCard, meta: tx.allTracks, icon: 'book', color: 'var(--text-muted)', sample: tx.termsN(GLOSSARY.length), open: () => go('glossary') }
  ];
  const needle = q.trim().toLowerCase();
  const shown = needle ? cards.filter((c) => `${c.title} ${c.body}`.toLowerCase().includes(needle)) : cards;
  const searchId = useId();
  return (
    <div className={styles.page}>
      <ToolCrumbs />
      <div className={styles.head}>
        <div className={styles.stack6}><h1 className={`h1 ${styles.titleL}`}>{tx.tools}</h1><p className="txt">{tx.hubSub}</p></div>
        <div className={`input ${styles.search}`}><Icon name="search" size={17} /><label htmlFor={searchId} className="sr-only">{tx.search}</label><input id={searchId} type="search" value={q} placeholder={tx.search} onChange={(e) => setQ(e.target.value)} /></div>
      </div>
      {shown.length ? (
        <div className={styles.hubGrid}>
          {shown.map((c) => (
            <button key={c.key} type="button" className={`card glass ${styles.toolCard}`} onClick={c.open}>
              <span className={styles.cardTop}><span className={styles.toolIcon} style={{ color: c.color, background: `color-mix(in srgb, ${c.color} 16%, transparent)` }}><Icon name={c.icon} size={22} /></span><span className="meta">{c.meta}</span></span>
              <b className={`h3 ${styles.cardTitle}`}>{c.title}</b>
              <span className="small">{c.body}</span>
              <span className={`sunk ${styles.sample}`}><span className="meta">{tx.example}</span><b className="n">{c.sample}</b></span>
              <span className={styles.chev} aria-hidden="true"><Icon name={lang === 'he' ? 'chevL' : 'chevR'} size={16} /></span>
            </button>
          ))}
        </div>
      ) : (
        <p className="txt">{tx.noMatch} <button type="button" className="btnText" onClick={() => go('glossary')}>{tx.toGlossary}</button></p>
      )}
      {last && (
        <div className={`solid ${styles.lastUsed}`}>
          <span className={styles.muted}><Icon name="clock" size={18} /></span><b>{tx.lastUsed}</b><span className="small">{last.summary[lang]}</span>
          <button type="button" className={`btnText ${styles.pushEnd}`} onClick={() => go('tools', { view: last.tool })}>{tx.reopen}<Icon name={lang === 'he' ? 'chevL' : 'chevR'} size={14} /></button>
        </div>
      )}
    </div>
  );
}

// ---- 13.2–13.4 · position size ------------------------------------------------------
function Position({ tx, lang }: { tx: Tx; lang: Lang }) {
  const [v, setV] = useState({ account: '', risk: '', entry: '', stop: '' });
  const [side, setSide] = useState<Side>('long');
  const set = (k: keyof typeof v) => (x: string) => setV((s) => ({ ...s, [k]: x }));
  const input = { account: num(v.account), riskPct: num(v.risk), entry: num(v.entry), stop: num(v.stop), side };
  const issue = positionIssue(input);
  const r = positionSize(input);
  const warnings = Number.isFinite(input.riskPct) && Number.isFinite(input.account) ? positionWarnings(input, r) : [];
  const empty = Object.values(v).every((x) => !x.trim());
  const stopMsg = issue === 'stopSide' ? (side === 'long' ? tx.stopSideLong : tx.stopSideShort) : issue === 'stopEqual' ? tx.stopEqual : undefined;
  useEffect(() => {
    if (r) writeLast({ tool: 'position', summary: { he: `גודל פוזיציה · חשבון ₪ ${fmt0(input.account)} · סיכון ${input.riskPct}%`, en: `Position size · account $${fmt0(input.account)} · risk ${input.riskPct}%` } });
  }, [r?.shares, input.account, input.riskPct]); // eslint-disable-line react-hooks/exhaustive-deps

  let panel: ReactNode;
  if (r) {
    const investPct = Math.min(100, r.portion * 100), riskPct = Math.min(100, (r.loss / input.account) * 100);
    panel = (
      <section className={`glass ${styles.result}`} aria-live="polite">
        <span className="label">{tx.qty}</span>
        <div className={styles.big}><output className="n" data-testid="tool-headline">{r.shares}</output><span className="txt">{tx.sharesWord}</span></div>
        <div className={`solid ${styles.rows}`}>
          <Row k={tx.posCost} v={`${tx.cur} ${fmt(r.cost)}`} strong />
          <Row k={tx.lossIfStop} v={`−${tx.cur} ${fmt(r.loss)}`} strong color="var(--err)" />
          <Row k={tx.toStop} v={`${tx.cur} ${fmt(r.perShare)} · ${fmt(r.distancePct, 1)}%`} />
          <Row k={tx.ofAccount} v={`${fmt(r.portion * 100, 0)}%`} />
        </div>
        <div className={styles.split}>
          <div className={styles.splitHead}><span className="meta">{tx.inTrade}</span><span className="meta">{tx.atRisk}</span></div>
          <div className={styles.splitBar} aria-hidden="true"><span style={{ width: `${investPct - riskPct}%`, background: 'var(--learn-fill)' }} /><span style={{ width: `${riskPct}%`, background: 'var(--err)' }} /></div>
          <div className={styles.splitHead}><span className="meta n">{tx.cur} {fmt0(r.cost)} / {fmt0(input.account)}</span><span className="meta n" style={{ color: 'var(--err)' }}>{tx.cur} {fmt0(r.loss)}</span></div>
        </div>
        {warnings.map((w) => <div key={w} className="fb hint"><span className="fbIcon"><Icon name="alert" size={16} /></span><div className={styles.fbBody}><b>{tx.warnNotError}</b><span className="small">{w === 'highRisk' ? tx.highRisk(String(input.riskPct)) : tx.overAccount}</span></div></div>)}
        <div className="block takeaway"><b className="lead2">{tx.whyN(r.shares)} · </b>{tx.whyBody(`${tx.cur} ${fmt0(r.riskAmount)}`, `${tx.cur} ${fmt(r.perShare)}`, r.shares)}</div>
      </section>
    );
  } else if (issue && issue !== 'missing') {
    panel = (
      <section className={`glass ${styles.result} ${styles.centered}`} aria-live="polite">
        <div className="fb wrong"><span className="fbIcon"><Icon name="x" size={16} /></span><div className={styles.fbBody}><b>{tx.cantYet}</b><span className="small">{stopMsg} {tx.stopHint}</span></div></div>
        <div className={`sunk ${styles.ghost}`} aria-hidden="true"><span className="label">{tx.result}</span><b className="n">—</b></div>
      </section>
    );
  } else {
    panel = (
      <section className={`glass ${styles.result} ${styles.centered} ${styles.emptyState}`}>
        <div className={styles.flow} aria-hidden="true">{tx.steps4.map((x, i) => <span key={x} className={styles.flowStep}><span className="num">{i + 1}</span><span className="meta">{x}</span></span>)}</div>
        <b className="h3">{tx.fourNumbers}</b>
        <p className="small">{tx.fourBody}</p>
        <button type="button" className="btn2" onClick={() => { setSide('long'); setV({ account: '50,000', risk: '1', entry: '100.00', stop: '95.00' }); }}><Icon name="play" size={14} />{tx.fillExample}</button>
      </section>
    );
  }
  return (
    <div className={styles.page}>
      <ToolCrumbs here={tx.posShort} />
      <Head tx={tx} title={tx.posTitle} sub={tx.posSub} lessonId="R4" lang={lang} />
      <div className={styles.grid2}>
        <section className={`solid ${styles.form}`}>
          <b className="h3">{tx.yourData}</b>
          <Field label={tx.account} value={v.account} onChange={set('account')} unit={tx.cur} placeholder={tx.eg('50,000')} />
          <Field label={tx.risk} value={v.risk} onChange={set('risk')} unit="%" placeholder="1" help={tx.riskHelp}
            {...(warnings.includes('highRisk') ? { state: 'warn' as const, message: tx.highRisk(String(input.riskPct)) } : {})} />
          <div className={styles.pair}>
            <Field label={tx.entry} value={v.entry} onChange={set('entry')} unit={tx.cur} placeholder="100.00" />
            <Field label={tx.stop} value={v.stop} onChange={set('stop')} unit={tx.cur} placeholder="95.00" {...(stopMsg ? { state: 'error' as const, message: stopMsg } : {})} />
          </div>
          <div className={`seg ${styles.selfStart}`} role="group" aria-label={tx.side}>
            <button type="button" aria-pressed={side === 'long'} onClick={() => setSide('long')}>{tx.long}</button>
            <button type="button" aria-pressed={side === 'short'} onClick={() => setSide('short')}>{tx.short}</button>
          </div>
          <div className={styles.formActions}>{!empty && <button type="button" className="btnQuiet" onClick={() => setV({ account: '', risk: '', entry: '', stop: '' })}>{tx.reset}</button>}</div>
        </section>
        {panel}
      </div>
    </div>
  );
}

// ---- 13.5 · risk / reward -----------------------------------------------------------
function RiskReward({ tx, lang }: { tx: Tx; lang: Lang }) {
  const [v, setV] = useState({ entry: '104.00', stop: '101.00', target: '111.50' });
  const set = (k: keyof typeof v) => (x: string) => setV((s) => ({ ...s, [k]: x }));
  const e = num(v.entry), s = num(v.stop), t = num(v.target);
  const r = riskReward(e, s, t);
  const rates = [20, 30, 40, 50, 60];
  const evs = r ? rates.map((w) => tenTrades(r, w)) : [];
  const maxAbs = Math.max(1, ...evs.map(Math.abs));
  useEffect(() => { if (r) writeLast({ tool: 'rr', summary: { he: `יחס סיכוי-סיכון · 1 : ${fmt(r.ratio, 1)}`, en: `Risk / reward · 1 : ${fmt(r.ratio, 1)}` } }); }, [r?.ratio]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className={styles.page}>
      <ToolCrumbs here={tx.rrTitle} />
      <Head tx={tx} title={tx.rrTitle} sub={tx.rrSub} lessonId="R5" lang={lang} />
      <div className={styles.grid3}>
        <section className={`solid ${styles.form}`}>
          <b className="h3">{tx.trade}</b>
          <Field label={tx.entry} value={v.entry} onChange={set('entry')} unit={tx.cur} />
          <Field label={tx.stop} value={v.stop} onChange={set('stop')} unit={tx.cur} {...(!r ? { state: 'error' as const, message: tx.rrInvalid } : {})} />
          <Field label={tx.target} value={v.target} onChange={set('target')} unit={tx.cur} />
          {r && (
            <div className={`sunk ${styles.sumBox}`}>
              <Row k={tx.riskPerShare} v={`${tx.cur} ${fmt(r.risk)}`} />
              <Row k={tx.rewardPerShare} v={`${tx.cur} ${fmt(r.reward)}`} />
              <div className={styles.ratio}><b>{tx.ratio}</b><output className="n" data-testid="tool-headline" aria-live="polite">1 : {fmt(r.ratio, 1)}</output></div>
            </div>
          )}
        </section>
        <section className={`well ${styles.ladderWrap}`}>{r && <Ladder entry={e} stop={s} target={t} tx={tx} />}</section>
        <section className={`glass ${styles.card}`}>
          <b className="h3">{tx.tenTitle}</b>
          {r && <>
            <span className="small">{tx.tenSub(`${tx.cur} ${fmt(r.risk)}`, `${tx.cur} ${fmt(r.reward)}`)}</span>
            <div className={styles.evList}>
              {rates.map((w, i) => {
                const ev = evs[i]!;
                return (
                  <div key={w} className={styles.evRow}>
                    <span className="small">{tx.success(w)}</span>
                    <span className={styles.evTrack} aria-hidden="true"><span style={{ [ev >= 0 ? 'left' : 'right']: '50%', width: `${(Math.abs(ev) / maxAbs) * 50}%`, background: ev >= 0 ? 'var(--ok)' : 'var(--err)' }} /></span>
                    <b className="n" style={{ color: ev >= 0 ? 'var(--ok)' : 'var(--err)' }}>{ev >= 0 ? '+' : '−'}{tx.cur} {fmt(Math.abs(ev), 1)}</b>
                  </div>
                );
              })}
            </div>
            <div className="block example"><b className="lead2">{tx.breakEven} · </b>{tx.breakBody(fmt(r.risk), fmt(r.reward), Math.round(r.breakEven * 100))}</div>
          </>}
        </section>
      </div>
    </div>
  );
}

/** Entry, stop and target on one price axis, scaled to the learner's own numbers. */
function Ladder({ entry, stop, target, tx }: { entry: number; stop: number; target: number; tx: Tx }) {
  const hi = Math.max(entry, stop, target), lo = Math.min(entry, stop, target), pad = (hi - lo) * 0.18 || 1;
  const y = (p: number) => 8 + ((hi + pad - p) / (hi - lo + 2 * pad)) * 84;
  const line = (p: number, color: string, label: string, dash?: boolean) => (
    <g key={label}>
      <line x1="4" x2="70" y1={y(p)} y2={y(p)} stroke={color} strokeWidth="0.8" strokeDasharray={dash ? '2 1.5' : undefined} vectorEffect="non-scaling-stroke" />
      <text x="72" y={y(p) + 1.2} fontSize="3.4" fill={color} fontWeight="700">{label} {fmt(p)}</text>
    </g>
  );
  return (
    <svg className={styles.ladder} viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={tx.ladderAria}>
      <rect x="4" width="66" y={Math.min(y(entry), y(stop))} height={Math.abs(y(entry) - y(stop))} fill="var(--err)" opacity="0.16" />
      <rect x="4" width="66" y={Math.min(y(entry), y(target))} height={Math.abs(y(entry) - y(target))} fill="var(--ok)" opacity="0.12" />
      {line(target, 'var(--ok)', tx.target, true)}
      {line(entry, 'var(--learn)', tx.entry)}
      {line(stop, 'var(--err)', tx.stop, true)}
    </svg>
  );
}

// ---- 13.6 · compound ----------------------------------------------------------------
function Compound({ tx, lang }: { tx: Tx; lang: Lang }) {
  const [p0, setP0] = useState(10000), [m, setM] = useState(500), [r, setR] = useState(6), [y, setY] = useState(20);
  const rows = compoundMonthly(p0, m, r, y);
  const end = rows[rows.length - 1]!;
  const cross = crossoverYear(rows);
  useEffect(() => { writeLast({ tool: 'compound', summary: { he: `ריבית דריבית · ₪ ${fmt0(m)} בחודש · ${y} שנים`, en: `Compound interest · $${fmt0(m)} a month · ${y} years` } }); }, [m, y]);
  const stepper = (label: string, shown: string, value: number, set: (n: number) => void, step: number, min: number, max: number) => (
    <div className={styles.stepRow}>
      <span className="small" style={{ color: 'var(--text)' }}>{label}</span>
      <div className="stepper">
        <button type="button" aria-label={tx.lower(label)} disabled={value <= min} onClick={() => set(Math.max(min, value - step))}>−</button>
        <span className="stepVal n" aria-live="polite">{shown}</span>
        <button type="button" aria-label={tx.higher(label)} disabled={value >= max} onClick={() => set(Math.min(max, value + step))}>+</button>
      </div>
    </div>
  );
  return (
    <div className={styles.page}>
      <ToolCrumbs here={tx.cmpTitle} />
      <Head tx={tx} title={tx.cmpTitle} sub={tx.cmpSub} lessonId="R3" lang={lang} />
      <div className={styles.grid2c}>
        <section className={`solid ${styles.form}`}>
          {stepper(tx.initial, `${tx.cur} ${fmt0(p0)}`, p0, setP0, 5000, 0, 100000)}
          {stepper(tx.monthly, `${tx.cur} ${fmt0(m)}`, m, setM, 250, 0, 5000)}
          {stepper(tx.annual, `${r}%`, r, setR, 1, 1, 12)}
          {stepper(tx.years, String(y), y, setY, 5, 5, 40)}
          <div className={styles.endBox}>
            <span className="label">{tx.atEnd}</span>
            <output className={`n ${styles.endVal}`} data-testid="tool-headline" aria-live="polite">{tx.cur} {fmt0(end.balance)}</output>
            <span className="meta">{tx.deposited} <bdi className="n">{tx.cur} {fmt0(end.deposited)}</bdi> · {tx.added} <bdi className="n" style={{ color: 'var(--learn)' }}>{tx.cur} {fmt0(end.balance - end.deposited)}</bdi></span>
          </div>
        </section>
        <section className={`glass ${styles.card}`}>
          <div className={styles.cardHeadRow}>
            <b className="h3">{tx.growth}</b>
            <span className={styles.legend}><span><i style={{ background: 'var(--info)' }} />{tx.depLegend}</span><span><i style={{ background: 'var(--learn-fill)' }} />{tx.intLegend}</span></span>
          </div>
          <div className={styles.bars} role="img" aria-label={tx.chartAria(y)}>
            {rows.map((row) => (
              <div key={row.year} className={styles.bar} style={{ height: `${(row.balance / end.balance) * 100}%` }}>
                <div className={styles.barGain} style={{ height: `${((row.balance - row.deposited) / row.balance) * 100}%` }} />
              </div>
            ))}
          </div>
          <div className={styles.barAxis}><span className="meta">{tx.yearN(1)}</span><span className="meta">{tx.yearN(y)}</span></div>
          <div className="block takeaway">{cross ? tx.crossNote(cross) : tx.noCross}</div>
        </section>
      </div>
    </div>
  );
}

// ---- 13.7 · DCF ---------------------------------------------------------------------
function Dcf({ tx, lang }: { tx: Tx; lang: Lang }) {
  const [v, setV] = useState({ fcf: '400', g: '8', r: '10', gt: '2.5', debt: '500', shares: '200', price: '30' });
  const set = (k: keyof typeof v) => (x: string) => setV((s) => ({ ...s, [k]: x }));
  const input = { fcf: num(v.fcf), growthPct: num(v.g), discountPct: num(v.r), terminalPct: num(v.gt), netDebt: num(v.debt), shares: num(v.shares) };
  const price = num(v.price);
  const value = dcfPerShare(input);
  const grid = value !== null ? dcfGrid(input) : null;
  const all = grid ? grid.values.flat().filter((x): x is number => x !== null) : [];
  const belowN = all.filter((x) => x < price).length;
  useEffect(() => { if (value !== null) writeLast({ tool: 'dcf', summary: { he: `מודל DCF · שווי ₪ ${fmt(value)}`, en: `DCF model · value $${fmt(value)}` } }); }, [value]);
  const discErr = Number.isFinite(input.discountPct) && Number.isFinite(input.terminalPct) && input.discountPct <= input.terminalPct;
  return (
    <div className={styles.page}>
      <ToolCrumbs here={tx.dcfTitle} />
      <Head tx={tx} title={tx.dcfTitle} sub={tx.dcfSub} lessonId="P9" lang={lang} />
      <div className={styles.grid2d}>
        <section className={`solid ${styles.form}`}>
          <b className="h3">{tx.assumptions}</b>
          <Field label={tx.fcf} value={v.fcf} onChange={set('fcf')} unit={`${tx.mUnit} ${tx.cur}`} />
          <div className={styles.pair}>
            <Field label={tx.g15} value={v.g} onChange={set('g')} unit="%" />
            <Field label={tx.disc} value={v.r} onChange={set('r')} unit="%" {...(discErr ? { state: 'error' as const, message: tx.discErr } : {})} />
            <Field label={tx.term} value={v.gt} onChange={set('gt')} unit="%" />
            <Field label={tx.netDebt} value={v.debt} onChange={set('debt')} unit={`M ${tx.cur}`} />
            <Field label={tx.sharesOut} value={v.shares} onChange={set('shares')} unit={tx.mUnit} />
            <Field label={tx.price} value={v.price} onChange={set('price')} unit={tx.cur} />
          </div>
        </section>
        <div className={styles.col}>
          <section className={`glass ${styles.kpis}`} aria-live="polite">
            <div className={styles.stack}><span className="label">{tx.value}</span><output className={`n ${styles.kpi}`} data-testid="tool-headline">{value !== null ? `${tx.cur} ${fmt(value)}` : '—'}</output></div>
            <div className={styles.stack}><span className="label">{tx.price}</span><b className={`n ${styles.kpi} ${styles.muted}`}>{Number.isFinite(price) ? `${tx.cur} ${fmt(price)}` : '—'}</b></div>
            <div className={styles.stack}><span className="label">{tx.margin}</span><b className={`n ${styles.kpi}`} style={{ color: value !== null && value >= price ? 'var(--ok)' : 'var(--err)' }}>{value !== null && price > 0 ? `${value >= price ? '+' : ''}${fmt(((value / price) - 1) * 100, 0)}%` : '—'}</b></div>
          </section>
          {grid && (
            <section className={`solid ${styles.card}`}>
              <div className={styles.cardHeadRow}><b className="h3">{tx.sens}</b><span className={styles.legend}><span><i style={{ background: 'var(--ok)' }} />{tx.above}</span><span><i style={{ background: 'var(--err)' }} />{tx.below}</span></span></div>
              <table className={styles.sens}>
                <caption className="sr-only">{tx.sens}</caption>
                <thead><tr><th scope="col" className="label">{tx.axis}</th>{grid.growth.map((g) => <th key={g} scope="col" className="label"><span className="n">{fmt(g, 1)}%</span></th>)}</tr></thead>
                <tbody>
                  {grid.discount.map((rr, ri) => (
                    <tr key={rr}>
                      <th scope="row" className="meta"><span className="n">{fmt(rr, 1)}%</span></th>
                      {grid.values[ri]!.map((x, gi) => {
                        const d = x !== null && price > 0 ? x / price - 1 : 0, cur = ri === 2 && gi === 2;
                        return (
                          <td key={gi} data-cur={cur || undefined}
                            style={{ background: x === null ? 'var(--sunk)' : `color-mix(in srgb, ${d >= 0 ? 'var(--ok)' : 'var(--err)'} ${Math.min(34, Math.round(Math.abs(d) * 70) + 8)}%, transparent)` }}>
                            <span className="n">{x !== null ? `${tx.cur} ${fmt(x)}` : '—'}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {Number.isFinite(price) && <span className="meta">{tx.below40(belowN, all.length)}</span>}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- profit & loss (the previous build's return + P/L calculators) ------------------------
function Pnl({ tx, lang }: { tx: Tx; lang: Lang }) {
  const [v, setV] = useState({ buy: '100', sell: '110', qty: '10', bf: '5', sf: '5' });
  const set = (k: keyof typeof v) => (x: string) => setV((s) => ({ ...s, [k]: x }));
  const r = profitLoss(num(v.buy), num(v.sell), num(v.qty), num(v.bf), num(v.sf)) as { netProfitLoss: number; totalCost: number; totalProceeds?: number };
  const ret = percentageReturn(r.totalCost, r.totalCost + r.netProfitLoss) as { validInput: boolean; percentChange: number };
  const net = r.netProfitLoss;
  useEffect(() => { if (Number.isFinite(net)) writeLast({ tool: 'pnl', summary: { he: `רווח והפסד · ${fmt(net)}`, en: `Profit & loss · ${fmt(net)}` } }); }, [net]);
  return (
    <div className={styles.page}>
      <ToolCrumbs here={tx.pnlTitle} />
      <div className={styles.head}><div className={styles.stack6}><h1 className={`h1 ${styles.title}`}>{tx.pnlTitle}</h1><p className="txt">{tx.pnlSub}</p></div><span className="demo">{tx.demo}</span></div>
      <div className={styles.grid2}>
        <section className={`solid ${styles.form}`}>
          <b className="h3">{tx.yourData}</b>
          <div className={styles.pair}>
            <Field label={tx.buy} value={v.buy} onChange={set('buy')} unit={tx.cur} />
            <Field label={tx.sell} value={v.sell} onChange={set('sell')} unit={tx.cur} />
          </div>
          <Field label={tx.qtyField} value={v.qty} onChange={set('qty')} />
          <div className={styles.pair}>
            <Field label={tx.buyFee} value={v.bf} onChange={set('bf')} unit={tx.cur} />
            <Field label={tx.sellFee} value={v.sf} onChange={set('sf')} unit={tx.cur} />
          </div>
        </section>
        <section className={`glass ${styles.result}`}>
          <span className="label">{tx.net}</span>
          <div className={styles.big}><output className="n" data-testid="tool-headline" aria-live="polite" style={{ color: net >= 0 ? 'var(--ok)' : 'var(--err)' }}>{Number.isFinite(net) ? `${net > 0 ? '+' : net < 0 ? '−' : ''}${tx.cur} ${fmt(Math.abs(net))}` : '—'}</output></div>
          <div className={`solid ${styles.rows}`}>
            <Row k={tx.cost} v={`${tx.cur} ${fmt(r.totalCost)}`} strong />
            <Row k={tx.proceeds} v={`${tx.cur} ${fmt(r.totalProceeds ?? r.totalCost + net)}`} strong />
            <Row k={tx.returnPct} v={ret.validInput ? `${fmt(ret.percentChange)}%` : '—'} />
          </div>
        </section>
      </div>
    </div>
  );
}
