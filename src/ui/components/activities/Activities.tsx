import { useState } from 'react';
import type { DragEvent } from 'react';
import type { Lang } from '@core/types/kb';
import type { Activity, ClassifyActivity, ClassifyAnswer, ExploreActivity, ExploreAnswer, MarkPointActivity, MarkPointsActivity, MarkPointsAnswer, OrderBookActivity, OrderBookAnswer, SortActivity } from '@core/lessons/activities';
import { calcMistake, isRight, markPointsFault, measuredTarget, sketchSwings } from '@core/lessons/activities';
import { DiagramView } from '@ui/components/lessons/Diagrams';
import type { ConceptCard } from '@core/lessons/content';
import { bestAsk, cloneBook, executeBuy, explainOrder, tasksMet } from '@core/lessons/orderBook';
import type { OrderType } from '@core/lessons/orderBook';
import { BookView } from '@ui/components/lessons/Diagrams';
import type { LessonChartSpec } from '@core/charts/lessonCharts';
import { Chart } from '@ui/components/charts';
import { Icon } from '@ui/components/icons/Icons';
import styles from './Activities.module.css';

// ---------------------------------------------------------------------------
// The Try/feedback step of a lesson, per activity type. The lesson workspace
// owns the answer (so its footer can check it) and places the two halves:
// ActivityPane in the instruction pane, ActivityWork in the chart well.
// ---------------------------------------------------------------------------

export type Verdict = 'right' | 'wrong' | null;
export interface SortAnswer { placed: Record<string, string>; selected: string | null }

export const TX = {
  he: {
    sortTask: 'גררו כל פריט לקבוצה שלו — או בחרו פריט ואז את הקבוצה', sorted: (k: number, n: number) => `${k}/${n} מוינו`, left: 'נשארו:', dropHere: 'גררו לכאן',
    moveTo: (x: string) => `להעביר ל${x}`, remove: (x: string) => `להחזיר את "${x}"`, rightCount: (k: number) => `${k} במקום הנכון`,
    notA: (item: string, bin: string) => `${item} — לא ${bin}`, allSorted: 'הכול במקום',
    candle: (k: string) => `נר ${k}`, notThe: (name: string, target = 'פטיש') => `${name}, לא ${target}`,
    revealTitle: 'כך זה נגמר הפעם', otherTime: 'הפעם זה הלך אחרת', caveat: 'שימו לב',
    clickTask: 'לחצו על הגרף בגובה שבחרתם', checkTask: 'לחצו "בדיקה"', picked: (p: string) => `בחרתם: ${p}`, notPicked: 'עוד לא נבחר מחיר',
    reveal: 'חשוף הערות', hide: 'הסתר הערות', pick: 'הבחירה שלכם', targetLabel: 'יעד:',
    concepts: 'מפת מושגים', open: 'פתוח', tapToOpen: 'לחצו לפרטים', example: 'דוגמה', opened: (k: number, n: number) => `נפתחו ${k}/${n}`,
    market: 'פקודת שוק', limit: 'פקודת לימיט', orderType: 'סוג פקודה', shares: 'כמות מניות', maxPrice: 'מחיר מקסימלי', fewer: 'פחות מניות', more: 'יותר מניות', lower: 'הורדת מחיר', higher: 'העלאת מחיר',
    send: 'שלחו פקודת קנייה', reset: 'איפוס הספר', happened: 'מה קרה', avg: 'מחיר ממוצע', cost: 'עלות', waiting: 'ממתין בספר', sharesAt: (q: string) => `${q} מניות`,
    tasks: 'משימות', bookDemo: 'ספר פקודות להמחשה · מניה בדויה · בלי עמלות', allTasks: 'שלוש המשימות בוצעו', allTasksBody: 'ראיתם את שלושת המקרים: ביצוע מיד, המתנה בספר, וטיפוס על כמה שכבות.', tasksLeft: 'השלימו את המשימות, ואז "בדיקה"',
    solution: 'החישוב, צעד אחר צעד', typeTask: 'כתבו את התוצאה', notYet: 'עוד לא',
    pickedDay: (k: number) => `בחרתם: נר ${k}`, noDay: 'עוד לא נבחר נר', clickDay: 'לחצו על הגרף ברגע שבחרתם — או הזיזו את הסמן', dayPicker: 'בחירת נר על הגרף', yourPick: 'הבחירה שלכם',
    chartN: (k: string) => `גרף ${k}`, whichTrend: 'איזו מגמה?', correct: 'נכון', theAnswer: (x: string) => `התשובה: ${x}`,
    youPicked: 'לחצתם על', pickRow: 'לחצו על שורה בדוח כדי לראות מה היא ואיך מחשבים אותה', company: 'בחירת חברה',
    answered: (k: number, n: number) => `נענו ${k} מתוך ${n}`, allAnswered: 'כל התשובות נכונות', checkAgain: 'שווה לקרוא שוב את ההסברים בשאלות שסומנו באדום.',
    classified: (k: number, n: number) => `מוינו ${k} מתוך ${n}`, classRight: (k: number, n: number) => `${k} מתוך ${n} נכונים`, allRight: 'כל הגרפים במקום',
    lookAgain: 'שווה להסתכל שוב על השפלים והשיאים בגרפים שסומנו באדום.', ceiling: 'תקרה', floor: 'רצפה', sketchDemo: 'גרפים להמחשה · לא נתוני מסחר',
    swing: { high: { higher: 'שיא גבוה יותר', lower: 'שיא נמוך יותר', similar: 'שיא דומה' }, low: { higher: 'שפל גבוה יותר', lower: 'שפל נמוך יותר', similar: 'שפל דומה' } },
    status: { 'mkt-one': 'בוצעה במלואה', 'mkt-multi': 'בוצעה במלואה, בכמה מחירים', 'lim-rest': 'ממתינה בספר', 'lim-part': 'בוצעה חלקית', 'lim-full': 'בוצעה במלואה', empty: 'לא בוצעה' }
  },
  en: {
    sortTask: 'Drag each item to its group — or pick an item, then its group', sorted: (k: number, n: number) => `${k}/${n} sorted`, left: 'Left:', dropHere: 'Drop here',
    moveTo: (x: string) => `Move to ${x}`, remove: (x: string) => `Put back "${x}"`, rightCount: (k: number) => `${k} in the right place`,
    notA: (item: string, bin: string) => `${item} — not “${bin}”`, allSorted: 'Everything is in its place',
    candle: (k: string) => `Candle ${k}`, notThe: (name: string, target = 'a hammer') => `${name}, not ${target}`,
    revealTitle: 'How it ended this time', otherTime: 'It went another way this time', caveat: 'Watch out',
    clickTask: 'Click the chart at the height you choose', checkTask: 'Press "Check"', picked: (p: string) => `You picked: ${p}`, notPicked: 'No price picked yet',
    reveal: 'Reveal annotations', hide: 'Hide annotations', pick: 'Your pick', targetLabel: 'Target:',
    concepts: 'Concept map', open: 'Open', tapToOpen: 'Tap for details', example: 'Example', opened: (k: number, n: number) => `${k}/${n} opened`,
    market: 'Market order', limit: 'Limit order', orderType: 'Order type', shares: 'Shares', maxPrice: 'Maximum price', fewer: 'Fewer shares', more: 'More shares', lower: 'Lower the price', higher: 'Raise the price',
    send: 'Send buy order', reset: 'Reset the book', happened: 'What happened', avg: 'Average price', cost: 'Cost', waiting: 'Waiting in the book', sharesAt: (q: string) => `${q} shares`,
    tasks: 'Tasks', bookDemo: 'Illustrative order book · made-up stock · no fees', allTasks: 'All three tasks done', allTasksBody: 'You saw all three cases: an instant fill, an order waiting in the book, and an order climbing several layers.', tasksLeft: 'Finish the tasks, then "Check"',
    solution: 'The maths, step by step', typeTask: 'Type your result', notYet: 'Not yet',
    pickedDay: (k: number) => `You picked: candle ${k}`, noDay: 'No candle picked yet', clickDay: 'Click the chart at the moment you choose — or move the marker', dayPicker: 'Pick a candle on the chart', yourPick: 'Your pick',
    chartN: (k: string) => `Chart ${k}`, whichTrend: 'Which trend?', correct: 'Correct', theAnswer: (x: string) => `Answer: ${x}`,
    youPicked: 'You picked', pickRow: 'Click a line of the statement to see what it is and how it is worked out', company: 'Choose a company',
    answered: (k: number, n: number) => `${k} of ${n} answered`, allAnswered: 'Every answer is right', checkAgain: 'Read the explanations again under the questions marked red.',
    classified: (k: number, n: number) => `${k} of ${n} sorted`, classRight: (k: number, n: number) => `${k} of ${n} right`, allRight: 'Every chart is in its place',
    lookAgain: 'Look again at the highs and lows in the charts marked red.', ceiling: 'Ceiling', floor: 'Floor', sketchDemo: 'Illustrative charts · not trading data',
    swing: { high: { higher: 'Higher high', lower: 'Lower high', similar: 'Similar high' }, low: { higher: 'Higher low', lower: 'Lower low', similar: 'Similar low' } },
    status: { 'mkt-one': 'Filled', 'mkt-multi': 'Filled, at several prices', 'lim-rest': 'Waiting in the book', 'lim-part': 'Partly filled', 'lim-full': 'Filled', empty: 'Not filled' }
  }
} as const;

const KEYS = { he: 'אבגד', en: 'ABCD' };
const letter = (lang: Lang, key: string) => KEYS[lang]['abcd'.indexOf(key)] ?? key;
const money = (p: number) => `$${p.toFixed(2)}`;

export const initialAnswer = (a: Activity): unknown =>
  a.kind === 'sort' ? { placed: {}, selected: null } satisfies SortAnswer
  : a.kind === 'orderBook' ? { book: cloneBook(a.book), orders: [], done: [] } satisfies OrderBookAnswer
  : a.kind === 'classify' || a.kind === 'checklist' ? {} satisfies ClassifyAnswer
  : a.kind === 'markPoints' ? { picks: a.points.map(() => null), active: 0, choice: null } satisfies MarkPointsAnswer
  : a.kind === 'explore' ? { dataset: a.datasets[0]!.key, row: null } satisfies ExploreAnswer
  : null;
/** After a wrong answer: sorting keeps what was right; every other type starts over. */
export const retryAnswer = (a: Activity, answer: unknown): unknown => {
  if (a.kind === 'orderBook') return answer;
  // Exploring keeps the company on screen; the line is picked again.
  if (a.kind === 'explore') return { dataset: (answer as ExploreAnswer).dataset, row: null } satisfies ExploreAnswer;
  // Marking moments keeps the marks already right (and a right comparison); the rest open again.
  if (a.kind === 'markPoints') {
    const s = answer as MarkPointsAnswer;
    const picks = s.picks.map((p, i) => (p !== null && Math.abs(p - a.points[i]!.target) <= a.points[i]!.tolerance ? p : null));
    const active = Math.max(0, picks.findIndex((p) => p === null));
    return { picks, active, choice: s.choice === a.compare.correct ? s.choice : null } satisfies MarkPointsAnswer;
  }
  // Sorting charts keeps the charts already right; the wrong ones open again.
  if (a.kind === 'classify') return Object.fromEntries(Object.entries(answer as ClassifyAnswer).filter(([id, k]) => a.items.find((i) => i.id === id)?.answer === k));
  if (a.kind === 'checklist') return Object.fromEntries(Object.entries(answer as ClassifyAnswer).filter(([id, k]) => a.items.find((i) => i.id === id)?.correct === k));
  if (a.kind !== 'sort') return null;
  const placed = Object.fromEntries(Object.entries((answer as SortAnswer).placed).filter(([id, bin]) => a.items.find((i) => i.id === id)?.bin === bin));
  return { placed, selected: null } satisfies SortAnswer;
};
export const isReady = (a: Activity, answer: unknown) =>
  a.kind === 'sort' ? Object.keys((answer as SortAnswer).placed).length === a.items.length
  : a.kind === 'orderBook' ? isRight(a, answer)
  : a.kind === 'classify' || a.kind === 'checklist' ? a.items.every((it) => (answer as ClassifyAnswer)[it.id])
  : a.kind === 'explore' ? (answer as ExploreAnswer).row !== null
  : a.kind === 'markPoints' ? (answer as MarkPointsAnswer).picks.every((p) => p !== null) && (answer as MarkPointsAnswer).choice !== null
  : answer !== null && answer !== undefined;
/** A prediction is revealed, not marked: any guess moves on. */
export const isGraded = (a: Activity) => a.kind !== 'predict';
export { isRight };

// ---------- the pane ----------
export function ActivityPane({ a, answer, setAnswer, verdict, lang, revealed, onToggleReveal, onRetry }: {
  a: Activity; answer: unknown; setAnswer: (x: unknown) => void; verdict: Verdict; lang: Lang;
  revealed: boolean; onToggleReveal: () => void; onRetry: () => void;
}) {
  const tx = TX[lang];
  const retry = verdict === 'wrong' && isGraded(a) && <button type="button" className={`btnText ${styles.selfStart}`} onClick={onRetry}><Icon name="refresh" size={14} />{lang === 'he' ? 'נסו שוב' : 'Try again'}</button>;
  const fb = (kind: 'right' | 'wrong' | 'hint', title: string, body: string, extra?: React.ReactNode) => (
    <div className={`fb ${kind}`} role="status">
      <span className="fbIcon"><Icon name={kind === 'right' ? 'check' : kind === 'wrong' ? 'x' : 'bulb'} size={kind === 'right' ? 18 : 16} /></span>
      <div className={styles.fbBody}><b>{title}</b><span className="small">{body}</span>{extra}</div>
    </div>
  );

  if (a.kind === 'sort') {
    const s = answer as SortAnswer, n = a.items.length, placed = Object.keys(s.placed).length;
    const firstWrong = verdict ? a.items.find((it) => s.placed[it.id] && s.placed[it.id] !== it.bin) : undefined;
    const good = a.items.filter((it) => s.placed[it.id] === it.bin).length;
    return (
      <>
        <div className={`task${verdict === 'right' ? ' ok' : ''}`}><span className="tn">{verdict === 'right' ? <Icon name="check" size={13} /> : 1}</span><span>{tx.sortTask}</span></div>
        {verdict === 'right' && fb('right', tx.allSorted, a.right[lang])}
        {firstWrong && fb('wrong', tx.notA(firstWrong.label[lang], a.bins.find((b) => b.id === s.placed[firstWrong.id])!.label[lang]), firstWrong.why[lang], retry)}
        <p className="meta" aria-live="polite">{tx.sorted(placed, n)}{verdict ? ` · ${tx.rightCount(good)}` : ''}</p>
      </>
    );
  }
  if (a.kind === 'chartChoice') {
    const chosen = a.marks.find((m) => m.key === answer);
    return (
      <>
        <div className={styles.choices} role="radiogroup" aria-label={a.prompt[lang]}>
          {a.marks.map((m) => {
            const on = answer === m.key;
            const cls = verdict ? (m.key === a.correct && verdict === 'right' ? 'right' : on ? verdict : 'dim') : on ? 'sel' : '';
            return (
              <button key={m.key} type="button" role="radio" aria-checked={on} className={`choice ${cls}`} disabled={!!verdict} onClick={() => setAnswer(m.key)}>
                <span className="key" aria-hidden="true">{letter(lang, m.key)}</span><span className={styles.grow}>{verdict ? `${tx.candle(letter(lang, m.key))} · ${m.name[lang]}` : tx.candle(letter(lang, m.key))}</span>
              </button>
            );
          })}
        </div>
        {verdict === 'right' && fb('right', chosen!.name[lang], a.right[lang])}
        {verdict === 'wrong' && chosen && fb('wrong', tx.notThe(chosen.name[lang], a.target?.[lang]), chosen.why[lang], retry)}
      </>
    );
  }
  if (a.kind === 'predict') {
    return (
      <>
        {!verdict && <p className="txt">{a.sub[lang]}</p>}
        <div className={styles.choices} role="radiogroup" aria-label={a.prompt[lang]}>
          {a.choices.map((c, i) => {
            const on = answer === c.key;
            const cls = verdict ? (c.key === a.likely ? 'right' : on ? 'wrong' : 'dim') : on ? 'sel' : '';
            return (
              <button key={c.key} type="button" role="radio" aria-checked={on} className={`choice ${cls}`} disabled={!!verdict} onClick={() => setAnswer(c.key)}>
                <span className="key" aria-hidden="true">{KEYS[lang][i]}</span><span className={styles.grow}>{c.label[lang]}</span>
              </button>
            );
          })}
        </div>
        {verdict && fb(verdict === 'right' ? 'right' : 'hint', verdict === 'right' ? tx.revealTitle : tx.otherTime, a.outcome[lang])}
        {verdict && <div className="block caveat"><b className="lead2">{tx.caveat} · </b>{a.caveat[lang]}</div>}
      </>
    );
  }
  if (a.kind === 'orderBook') return <OrderDesk a={a} s={answer as OrderBookAnswer} set={setAnswer} verdict={verdict} lang={lang} />;
  if (a.kind === 'markPoints') {
    const s = answer as MarkPointsAnswer;
    const fault = verdict === 'wrong' ? markPointsFault(a, s) : null;
    return (
      <>
        {!verdict && <p className="txt">{a.task[lang]}</p>}
        {!verdict && (
          <div className={styles.pickList} role="group" aria-label={a.prompt[lang]}>
            {a.points.map((pt, i) => {
              const p = s.picks[i] ?? null;
              return (
                <button key={i} type="button" className={`task${p !== null ? ' ok' : ''}${s.active === i ? ` ${styles.activePick}` : ''}`} aria-pressed={s.active === i} onClick={() => setAnswer({ ...s, active: i })}>
                  <span className="tn">{p !== null ? <Icon name="check" size={13} /> : i + 1}</span>
                  <span>{pt.label[lang]}{p !== null ? ` · ${tx.candle(String(p + 1))}` : ''}</span>
                </button>
              );
            })}
          </div>
        )}
        <div className={styles.choices} role="radiogroup" aria-label={a.compare.question[lang]}>
          <b className={styles.compareQ}>{a.compare.question[lang]}</b>
          {a.compare.options.map((o, i) => {
            const on = s.choice === o.key;
            const cls = verdict ? (o.key === a.compare.correct && verdict === 'right' ? 'right' : on ? verdict : 'dim') : on ? 'sel' : '';
            return (
              <button key={o.key} type="button" role="radio" aria-checked={on} className={`choice ${cls}`} disabled={!!verdict} onClick={() => setAnswer({ ...s, choice: o.key })}>
                <span className="key" aria-hidden="true">{KEYS[lang][i]}</span><span className={styles.grow}>{o.label[lang]}</span>
              </button>
            );
          })}
        </div>
        {verdict === 'right' && fb('right', lang === 'he' ? 'נכון' : 'Correct', a.right[lang])}
        {verdict === 'wrong' && fault && fb('wrong', tx.notYet, fault[lang], retry)}
      </>
    );
  }
  if (a.kind === 'explore') {
    return (
      <>
        {!verdict && <p className="txt">{a.task[lang]}</p>}
        {verdict === 'right' && fb('right', lang === 'he' ? 'נכון' : 'Correct', a.right[lang])}
        {verdict === 'wrong' && fb('wrong', tx.notYet, a.off[lang], retry)}
      </>
    );
  }
  if (a.kind === 'checklist') {
    const s = answer as ClassifyAnswer, n = a.items.length, done = Object.keys(s).length;
    const good = a.items.filter((it) => s[it.id] === it.correct).length;
    return (
      <>
        {!verdict && <p className="txt">{a.task[lang]}</p>}
        <ol className={styles.checklist}>
          {a.items.map((it, i) => {
            const pick = s[it.id], answered = !!pick;
            return (
              <li key={it.id} className={styles.checkItem} data-state={answered ? (pick === it.correct ? 'right' : 'wrong') : undefined}>
                <p className={styles.compareQ}>{`${i + 1}. ${it.question[lang]}`}</p>
                <div className={styles.choices} role="radiogroup" aria-label={it.question[lang]}>
                  {it.options.map((o, k) => {
                    const on = pick === o.key;
                    const cls = !answered ? '' : o.key === it.correct ? 'right' : on ? 'wrong' : 'dim';
                    return (
                      <button key={o.key} type="button" role="radio" aria-checked={on} className={`choice ${cls}`} disabled={answered || !!verdict} onClick={() => setAnswer({ ...s, [it.id]: o.key })}>
                        <span className="key" aria-hidden="true">{KEYS[lang][k]}</span><span className={styles.grow}>{o.label[lang]}</span>
                      </button>
                    );
                  })}
                </div>
                {answered && <p className="small">{it.why[lang]}</p>}
              </li>
            );
          })}
        </ol>
        {verdict === 'right' && fb('right', tx.allAnswered, a.right[lang])}
        {verdict === 'wrong' && fb('wrong', tx.classRight(good, n), tx.checkAgain, retry)}
        {!verdict && <p className="meta" aria-live="polite">{tx.answered(done, n)}</p>}
      </>
    );
  }
  if (a.kind === 'calculate') {
    const v = answer as number | null;
    const mistake = verdict === 'wrong' && v !== null ? calcMistake(a, v) : null;
    return (
      <>
        <p className="txt">{a.task[lang]}</p>
        {!verdict && (
          <label className={`field ${styles.calcField}`}>
            <span className="fieldLabel">{a.field[lang]}</span>
            <span className="input"><input type="number" dir="ltr" inputMode="decimal" step="any" value={v ?? ''} onChange={(e) => setAnswer(e.target.value === '' ? null : Number(e.target.value))} /></span>
          </label>
        )}
        {!verdict && <div className="task todo"><span className="tn">✓</span><span>{tx.checkTask}</span></div>}
        {verdict === 'right' && fb('right', lang === 'he' ? 'נכון' : 'Correct', a.right[lang])}
        {verdict === 'wrong' && fb('wrong', tx.notYet, (mistake ? mistake.why : a.off)[lang], retry)}
        {verdict === 'right' && (
          <div className={`solid2 ${styles.solution}`}>
            <b>{tx.solution}</b>
            <ol>{a.steps.map((s, i) => <li key={i} className="n-mixed">{s[lang]}</li>)}</ol>
          </div>
        )}
      </>
    );
  }
  if (a.kind === 'markPoint') {
    const p = answer as number | null;
    return (
      <>
        {!verdict && (
          <>
            <p className="txt">{a.task[lang]}</p>
            <div className={`task${p !== null ? ' ok' : ''}`}><span className="tn">{p !== null ? <Icon name="check" size={13} /> : 1}</span><span>{tx.clickDay}</span></div>
            <div className="task todo"><span className="tn">2</span><span>{tx.checkTask}</span></div>
            <p className="meta" aria-live="polite">{p !== null ? tx.pickedDay(p + 1) : tx.noDay}</p>
          </>
        )}
        {verdict && fb(verdict === 'right' ? 'right' : 'wrong', verdict === 'right' ? (lang === 'he' ? 'נכון' : 'Correct') : (lang === 'he' ? 'עוד לא' : 'Not yet'), (verdict === 'right' ? a.right : a.off)[lang], retry)}
      </>
    );
  }
  if (a.kind === 'classify') {
    const s = answer as ClassifyAnswer, n = a.items.length, done = Object.keys(s).length;
    const good = a.items.filter((it) => s[it.id] === it.answer).length;
    return (
      <>
        {!verdict && <p className="txt">{a.sub[lang]}</p>}
        <div className={styles.rules}>{a.rules.map((r, i) => <span key={i} className="chip" style={{ color: r.tone }}>{r.label[lang]}</span>)}</div>
        {verdict === 'right' && fb('right', tx.allRight, a.right[lang])}
        {verdict === 'wrong' && fb('wrong', tx.classRight(good, n), a.hint?.[lang] ?? tx.lookAgain, retry)}
        {!verdict && <p className="meta" aria-live="polite">{tx.classified(done, n)}</p>}
      </>
    );
  }
  // markLevel
  const p = answer as number | null;
  const target = a.measure && p !== null && verdict === 'right' ? measuredTarget((a.target[0] + a.target[1]) / 2, a.measure.peak) : null;
  const lvl = (a.target[0] + a.target[1]) / 2;
  return (
    <>
      {!verdict && (
        <>
          <p className="txt">{a.task[lang]}</p>
          <div className={`task${p !== null ? ' ok' : ''}`}><span className="tn">{p !== null ? <Icon name="check" size={13} /> : 1}</span><span>{tx.clickTask}</span></div>
          <div className="task todo"><span className="tn">2</span><span>{tx.checkTask}</span></div>
          <p className="meta" aria-live="polite">{p !== null ? tx.picked(money(p)) : tx.notPicked}</p>
        </>
      )}
      {verdict && fb(verdict === 'right' ? 'right' : 'wrong', verdict === 'right' ? (lang === 'he' ? 'נכון' : 'Correct') : (lang === 'he' ? 'עוד לא' : 'Not yet'), (verdict === 'right' ? a.right : a.off)[lang], retry)}
      {verdict === 'wrong' && <button type="button" className={`btn2 sm ${styles.selfStart}`} aria-expanded={revealed} onClick={onToggleReveal}>{revealed ? tx.hide : tx.reveal}</button>}
      {verdict && revealed && (
        <ul className={styles.noteList}>
          {a.answer.map((z, i) => <li key={i}><span className={styles.swatch} data-tone={z.tone} aria-hidden="true" /><div><b>{z.label[lang]}</b><p className="small">{z.explanation[lang]}</p></div></li>)}
        </ul>
      )}
      {target !== null && a.measure && (
        <>
          <div className="task ok"><span className="tn"><Icon name="check" size={13} /></span><span>{tx.targetLabel} <span className="n">{`${lvl.toFixed(1)} − (${a.measure.peak.toFixed(1)} − ${lvl.toFixed(1)}) = ${target.toFixed(1)}`}</span></span></div>
          <p className="small">{a.measure.explain[lang]}</p>
          <div className="block caveat"><b className="lead2">{tx.caveat} · </b>{a.measure.caveat[lang]}</div>
        </>
      )}
    </>
  );
}

// ---------- the work well ----------
export function ActivityWork({ a, spec, answer, setAnswer, verdict, lang, revealed, phone }: {
  a: Activity; spec?: LessonChartSpec; answer: unknown; setAnswer: (x: unknown) => void; verdict: Verdict; lang: Lang; revealed: boolean; phone: boolean;
}) {
  const tx = TX[lang];
  if (a.kind === 'sort') return <SortBoard a={a} s={answer as SortAnswer} set={setAnswer} verdict={verdict} lang={lang} />;
  // Worked out from — or asked about — a figure rather than a chart.
  if ((a.kind === 'calculate' || a.kind === 'checklist') && !spec && a.diagram) return <div className={styles.calcWork}><DiagramView d={a.diagram} lang={lang} /></div>;
  if (a.kind === 'explore') return <ExploreBoard a={a} s={answer as ExploreAnswer} set={setAnswer} verdict={verdict} lang={lang} />;
  if (a.kind === 'markPoints') return <PointsBoard a={a} spec={spec!} s={answer as MarkPointsAnswer} set={setAnswer} verdict={verdict} lang={lang} phone={phone} />;
  if (a.kind === 'markPoint') return <PointBoard a={a} spec={spec!} p={answer as number | null} set={setAnswer} verdict={verdict} lang={lang} phone={phone} />;
  if (a.kind === 'classify') return <ClassifyBoard a={a} s={answer as ClassifyAnswer} set={setAnswer} verdict={verdict} lang={lang} />;
  if (a.kind === 'orderBook') {
    const s = answer as OrderBookAnswer, last = s.orders[s.orders.length - 1];
    return (
      <div className={styles.sortStage}>
        <div className={styles.wsHeadStatic}><span className="demo">{tx.bookDemo}</span></div>
        <BookView asks={s.book.asks} bids={s.book.bids} hit={last?.fills.map((f) => f[0]) ?? []} lang={lang} live />
      </div>
    );
  }

  let candles: unknown[], options: Record<string, unknown> | undefined, label: string, caption: string | undefined, onPick: ((p: number) => void) | undefined;
  if (a.kind === 'chartChoice') {
    candles = a.candles; label = a.chartLabel[lang]; caption = undefined;
    options = {
      showVolume: a.showVolume ?? false,
      highlights: a.marks.map((m) => {
        const tone = verdict ? (m.key === a.correct && verdict === 'right' ? 'bull' : m.key === answer ? 'bear' : 'text') : m.key === answer ? 'gold' : 'text';
        // Letters only on a phone: four names do not fit above four candles (the pane lists them).
        const text = verdict && !phone ? `${letter(lang, m.key)} · ${m.name[lang]}` : letter(lang, m.key);
        return { i1: m.i1, ...(m.i2 !== undefined ? { i2: m.i2 } : {}), tone, label: { he: text, en: text } };
      })
    };
  } else if (a.kind === 'calculate' || a.kind === 'checklist') {
    // A chart to read from: fixed while answering, with the answer drawn on it once right.
    candles = spec!.candles as unknown[]; label = spec!.label[lang]; caption = spec!.caption?.[lang];
    options = verdict === 'right' ? { ...spec!.options, ...a.reveal } : spec!.options;
  } else if (a.kind === 'predict') {
    const cut = !verdict;
    candles = cut ? (spec!.candles as unknown[]).slice(0, a.cut) : spec!.candles as unknown[];
    const pts = (spec!.options?.points as Array<{ idx: number }> | undefined) ?? [];
    options = cut ? { ...spec!.options, points: pts.filter((p) => p.idx < a.cut) } : spec!.options;
    label = spec!.label[lang]; caption = spec!.caption?.[lang];
  } else {
    const base = { ...spec!.options } as Record<string, unknown>;
    if (a.hideOption && !(verdict === 'right' || revealed)) delete base[a.hideOption];
    const zones: unknown[] = [];
    const p = answer as number | null;
    if (!verdict && p !== null) zones.push({ range: [p - 0.6, p + 0.6], tone: 'gold', label: { he: tx.pick, en: tx.pick } });
    // Where the chart's own annotation is the answer (T10's neckline), revealing it is enough.
    if ((verdict === 'right' || revealed) && !a.hideOption) zones.push(...a.answer.map((z) => ({ range: z.range, tone: z.tone, label: z.label })));
    if (verdict === 'right' && a.measure) {
      const lvl = (a.target[0] + a.target[1]) / 2, t = measuredTarget(lvl, a.measure.peak);
      zones.push({ range: [t - 0.5, t + 0.5], tone: 'gold', label: { he: `${a.measure.label.he} ${t.toFixed(1)}`, en: `${a.measure.label.en} ${t.toFixed(1)}` } });
      // A flat line at the target keeps it inside the price scale (zones alone do not stretch it).
      base.extraLines = [...((base.extraLines as unknown[]) ?? []), { tone: 'gold', values: (spec!.candles as unknown[]).map(() => t) }];
    }
    options = { ...base, showAnnotations: true, zones: [...((base.zones as unknown[]) ?? []), ...zones] };
    candles = spec!.candles as unknown[]; label = spec!.label[lang]; caption = spec!.caption?.[lang];
    onPick = verdict ? undefined : (price: number) => setAnswer(price);
  }
  return (
    <figure className={styles.single}>
      <div className={styles.wsHead}>
        {caption && <figcaption className="chip">{caption}</figcaption>}
        <span className="demo">{lang === 'he' ? 'נתוני הדגמה' : 'Demo data'}</span>
      </div>
      <div className={styles.chartBox}>
        <Chart candles={candles as never} variant={spec?.variant ?? 'price'} options={options} label={label} height={phone ? 260 : undefined} {...(onPick ? { onPriceClick: onPick } : {})} />
      </div>
    </figure>
  );
}

function SortBoard({ a, s, set, verdict, lang }: { a: SortActivity; s: SortAnswer; set: (x: SortAnswer) => void; verdict: Verdict; lang: Lang }) {
  const tx = TX[lang];
  const locked = !!verdict;
  const pool = a.items.filter((it) => !s.placed[it.id]);
  const place = (id: string, bin: string) => set({ placed: { ...s.placed, [id]: bin }, selected: null });
  const unplace = (id: string) => { const placed = { ...s.placed }; delete placed[id]; set({ placed, selected: null }); };
  const onDrop = (bin: string) => (e: DragEvent) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (id && !locked) place(id, bin); };
  return (
    <div className={styles.sortStage}>
      <div className={styles.bins} style={{ '--bins': a.bins.length } as React.CSSProperties}>
        {a.bins.map((b) => (
          <div key={b.id} className={styles.bin} style={{ borderColor: b.tone }} onDragOver={(e) => !locked && e.preventDefault()} onDrop={onDrop(b.id)}>
            <button type="button" className={styles.binHead} style={{ color: b.tone }} disabled={locked || !s.selected} onClick={() => s.selected && place(s.selected, b.id)}
              aria-label={tx.moveTo(b.label[lang])}>{b.label[lang]}</button>
            {a.items.filter((it) => s.placed[it.id] === b.id).map((it) => {
              const state = verdict ? (it.bin === b.id ? 'ok' : 'err') : undefined;
              return (
                <button key={it.id} type="button" className={styles.placed} data-state={state} disabled={locked} onClick={() => unplace(it.id)} aria-label={locked ? it.label[lang] : tx.remove(it.label[lang])}>
                  {it.label[lang]}{state && <Icon name={state === 'ok' ? 'check' : 'x'} size={14} />}
                </button>
              );
            })}
            {!locked && s.selected && <span className={styles.dropHint} aria-hidden="true">{tx.dropHere}</span>}
          </div>
        ))}
      </div>
      {pool.length > 0 && (
        <div className={styles.pool}>
          <span className="meta">{tx.left}</span>
          {pool.map((it) => (
            <button key={it.id} type="button" draggable={!locked} onDragStart={(e) => e.dataTransfer.setData('text/plain', it.id)}
              className={styles.item} aria-pressed={s.selected === it.id} disabled={locked} onClick={() => set({ ...s, selected: s.selected === it.id ? null : it.id })}>
              {it.label[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** F1's four concepts as cards to open (Artifact 07.1a) — the lesson's work area before the sort. */
export function ConceptCards({ cards, lang }: { cards: readonly ConceptCard[]; lang: Lang }) {
  const tx = TX[lang];
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  return (
    <div className={styles.sortStage}>
      <div className={styles.wsHeadStatic}><span className="chip">{tx.concepts}</span><span className="meta">{tx.opened(open.size, cards.length)}</span></div>
      <div className={styles.cards}>
        {cards.map((c) => {
          const on = open.has(c.id);
          return (
            <button key={c.id} type="button" className={styles.card} aria-expanded={on} style={on ? { boxShadow: `inset 0 0 0 2px ${c.tone}` } : undefined}
              onClick={() => setOpen((s) => { const n = new Set(s); if (n.has(c.id)) n.delete(c.id); else n.add(c.id); return n; })}>
              <span className={styles.cardHead}><b style={{ color: c.tone }}>{c.name[lang]}</b><span className="chip">{on ? tx.open : tx.tapToOpen}</span></span>
              <span className={styles.cardWhat}>{c.what[lang]}</span>
              {on && <><span className="small">{c.more[lang]}</span><span className="block example"><b className="lead2">{tx.example} · </b>{c.example[lang]}</span></>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** F5's order desk (Artifact 06.F5): order type, quantity and limit, then what the book did with the order. */
function OrderDesk({ a, s, set, verdict, lang }: { a: OrderBookActivity; s: OrderBookAnswer; set: (x: OrderBookAnswer) => void; verdict: Verdict; lang: Lang }) {
  const tx = TX[lang];
  const prices = [...a.book.asks.map((x) => x[0]), ...a.book.bids.map((x) => x[0])];
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const [type, setType] = useState<OrderType>('market');
  const [qty, setQty] = useState(100);
  const [limit, setLimit] = useState(() => a.book.bids[0]![0]);
  const last = s.orders[s.orders.length - 1];
  const cur = a.currency[lang];
  const money = (x: number) => `${cur} ${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const send = () => {
    const out = executeBuy(s.book, type, qty, type === 'limit' ? limit : null);
    set({ book: out.book, orders: [...s.orders, out.result], done: [...new Set([...s.done, ...tasksMet(out.result)])] });
  };
  const step = (v: number, d: number) => Math.round((v + d) * 100) / 100;
  const tasks = (
    <div className={styles.taskList}>
      <div className={styles.rowBetween}><span className="h3">{tx.tasks}</span><span className="meta"><span className="n">{s.done.length}/{a.tasks.length}</span></span></div>
      {a.tasks.map((t, i) => {
        const ok = s.done.includes(t.id);
        return <div key={t.id} className={`task${ok ? ' ok' : ''}`}><span className="tn">{ok ? <Icon name="check" size={12} /> : i + 1}</span><span>{t.text[lang]}</span></div>;
      })}
    </div>
  );
  if (verdict) {
    return (
      <>
        <div className="fb right" role="status"><span className="fbIcon"><Icon name="check" size={18} /></span><div className={styles.fbBody}><b>{tx.allTasks}</b><span className="small">{tx.allTasksBody}</span></div></div>
        {tasks}
      </>
    );
  }
  return (
    <>
      <div className={`glass ${styles.desk}`}>
        <div className={`seg ${styles.segFull}`} role="group" aria-label={tx.orderType}>
          <button type="button" aria-pressed={type === 'market'} onClick={() => setType('market')}>{tx.market}</button>
          <button type="button" aria-pressed={type === 'limit'} onClick={() => setType('limit')}>{tx.limit}</button>
        </div>
        <div className={styles.rowBetween}><span className="small">{tx.shares}</span>
          <div className="stepper"><button type="button" aria-label={tx.fewer} disabled={qty <= 100} onClick={() => setQty(qty - 100)}>−</button><span className="stepVal n" aria-live="polite">{qty.toLocaleString('en-US')}</span><button type="button" aria-label={tx.more} disabled={qty >= 1500} onClick={() => setQty(qty + 100)}>+</button></div>
        </div>
        {type === 'limit' && (
          <div className={styles.rowBetween}><span className="small">{tx.maxPrice}</span>
            <div className="stepper"><button type="button" aria-label={tx.lower} disabled={limit <= lo + 1e-9} onClick={() => setLimit(step(limit, -0.05))}>−</button><span className="stepVal n" aria-live="polite">{limit.toFixed(2)}</span><button type="button" aria-label={tx.higher} disabled={limit >= hi - 1e-9} onClick={() => setLimit(step(limit, 0.05))}>+</button></div>
          </div>
        )}
        <div className={styles.deskActions}>
          <button type="button" className={`btn ${styles.grow}`} disabled={bestAsk(s.book) === null && type === 'market'} onClick={send}>{tx.send}</button>
          <button type="button" className="btnQuiet" onClick={() => set({ ...s, book: cloneBook(a.book), orders: [] })}><Icon name="refresh" size={15} />{tx.reset}</button>
        </div>
      </div>
      {last && (
        <div className={`glass ${styles.desk}`} aria-live="polite">
          <div className={styles.rowBetween}><span className="h3">{tx.happened}</span><span className={`chip ${last.filled === 0 ? (last.kind === 'empty' ? 'err' : 'warn') : last.rest > 0 ? 'warn' : 'ok'}`}>{tx.status[last.kind]}</span></div>
          {last.fills.map((f, i) => <div key={i} className={styles.fill}><span>{tx.sharesAt(f[1].toLocaleString('en-US'))}</span><span className="n">{money(f[0])}</span></div>)}
          <div className={`${styles.fill} ${styles.fillTop}`}><span>{tx.avg}</span><b className="n">{last.filled ? last.avg.toFixed(2) : '—'}</b></div>
          <div className={styles.fill}><span>{tx.cost}</span><b className="n">{last.filled ? money(last.cost) : '—'}</b></div>
          {last.rest > 0 && <div className={styles.fill}><span>{tx.waiting}</span><b className="n">{last.rest.toLocaleString('en-US')}</b></div>}
          <p className="small">{explainOrder(last)[lang]}</p>
        </div>
      )}
      {tasks}
      {s.done.length < a.tasks.length && <span className="meta">{tx.tasksLeft}</span>}
    </>
  );
}

/** A sketch path through swing points, with a small fixed wiggle so it reads as price, not geometry (Artifact 3.2). */
function sketchPath(sw: ReadonlyArray<readonly [number, number]>) {
  const pts: string[] = [];
  for (let i = 0; i < sw.length - 1; i++) {
    const [x1, y1] = sw[i]!, [x2, y2] = sw[i + 1]!;
    for (let k = 0; k < 6; k++) {
      const f = k / 6, wig = k === 0 ? 0 : Math.sin((i * 6 + k) * 2.3) * 4;
      pts.push(`${(x1 + (x2 - x1) * f).toFixed(1)},${(y1 + (y2 - y1) * f + wig).toFixed(1)}`);
    }
  }
  const [lx, ly] = sw[sw.length - 1]!;
  return [...pts, `${lx},${ly}`].join(' ');
}

/** T3's drill (Artifact 3.2): each chart locks once picked and reveals the swings that decide it. */
function ClassifyBoard({ a, s, set, verdict, lang }: { a: ClassifyActivity; s: ClassifyAnswer; set: (x: ClassifyAnswer) => void; verdict: Verdict; lang: Lang }) {
  const tx = TX[lang];
  const label = (k: string) => a.options.find((o) => o.key === k)!.label[lang];
  return (
    // Focusable: the drill scrolls on its own, and once every card is answered nothing inside it takes focus.
    <div className={styles.sortStage} tabIndex={0} role="region" aria-label={a.prompt[lang]}>
      <div className={styles.wsHeadStatic}><span className="demo">{tx.sketchDemo}</span></div>
      <div className={styles.cgrid}>
        {a.items.map((it, i) => {
          const pick = s[it.id], answered = !!pick, right = pick === it.answer;
          const name = tx.chartN(KEYS[lang][i] ?? String(i + 1));
          return (
            <section key={it.id} className={styles.ccard} data-state={answered ? (right ? 'right' : 'wrong') : undefined} aria-label={name}>
              <div className={styles.rowBetween}><span className="h3">{name}</span>{answered && <span className={`chip ${right ? 'ok' : 'err'}`}>{right ? tx.correct : tx.theAnswer(label(it.answer))}</span>}</div>
              <div className={`well ${styles.sketch}`}>
                <svg viewBox="0 0 400 180" role="img" aria-label={`${name} · ${it.name[lang]}`}>
                  {answered && it.band && it.band.map((y, k) => (
                    <g key={k}><line x1="0" x2="400" y1={y} y2={y} className={styles.bandLine} /><text x={lang === 'he' ? 4 : 396} y={k ? y + 16 : y - 6} textAnchor={lang === 'he' ? 'start' : 'end'} className={styles.bandText}>{k ? tx.floor : tx.ceiling}</text></g>
                  ))}
                  <polyline points={sketchPath(it.points)} className={styles.sketchLine} />
                  {answered && a.showSwings !== false && sketchSwings(it.points).filter((m) => m.vs).map((m, k) => (
                    <g key={k} data-kind={m.kind} className={styles.swingMark}>
                      <circle cx={m.x} cy={m.y} r="4.5" />
                      <text x={m.x} y={m.kind === 'high' ? m.y - 10 : m.y + 18} textAnchor="middle">{tx.swing[m.kind][m.vs!]}</text>
                    </g>
                  ))}
                </svg>
              </div>
              <div className={styles.ans} style={{ '--n': a.options.length } as React.CSSProperties} role="group" aria-label={`${name} · ${a.ask?.[lang] ?? tx.whichTrend}`}>
                {a.options.map((o) => {
                  const cls = !answered ? '' : o.key === it.answer ? 'right' : o.key === pick ? 'wrong' : 'dim';
                  return <button key={o.key} type="button" className={`choice ${cls}`} aria-pressed={pick === o.key} disabled={answered || !!verdict} onClick={() => set({ ...s, [it.id]: o.key })}>{o.label[lang]}</button>;
                })}
              </div>
              {answered && <p className="small">{it.why[lang]}</p>}
            </section>
          );
        })}
      </div>
    </div>
  );
}

/** The chart for a "when did it happen" exercise: click a candle, or move the slider (keyboard). */
function PointBoard({ a, spec, p, set, verdict, lang, phone }: { a: MarkPointActivity; spec: LessonChartSpec; p: number | null; set: (x: number) => void; verdict: Verdict; lang: Lang; phone: boolean }) {
  const tx = TX[lang];
  const n = (spec.candles as unknown[]).length;
  const marks: unknown[] = [];
  if (verdict === 'right') {
    if (a.reveal.span) marks.push({ i1: a.reveal.span.from, i2: a.target - 1, tone: 'text', label: a.reveal.span.label });
    marks.push({ i1: a.target, tone: 'bull', label: a.reveal.label });
  } else if (p !== null) marks.push({ i1: p, tone: verdict === 'wrong' ? 'bear' : 'gold', label: { he: tx.yourPick, en: tx.yourPick } });
  const options = { ...spec.options, highlights: [...((spec.options?.highlights as unknown[]) ?? []), ...marks] };
  return (
    <figure className={styles.single}>
      <div className={styles.wsHead}>
        {spec.caption && <figcaption className="chip">{spec.caption[lang]}</figcaption>}
        <span className="demo">{lang === 'he' ? 'נתוני הדגמה' : 'Demo data'}</span>
      </div>
      <div className={styles.chartBox}>
        <Chart candles={spec.candles as never} variant={spec.variant} options={options} label={spec.label[lang]} height={phone ? 260 : undefined} {...(verdict ? {} : { onIndexClick: set })} />
      </div>
      {!verdict && (
        <label className={styles.slider}>
          <span className="meta">{tx.dayPicker}</span>
          {/* LTR in every language: the chart's time axis runs left to right, so the slider must too. */}
          <input type="range" dir="ltr" min={0} max={n - 1} value={p ?? Math.floor(n / 2)} onChange={(e) => set(Number(e.target.value))} aria-valuetext={p !== null ? tx.pickedDay(p + 1) : tx.noDay} />
        </label>
      )}
    </figure>
  );
}

/**
 * The chart for "find these moments": each mark is numbered at the candle's high
 * (or low), with the indicator's value at that candle beside it when the chart
 * has one — so comparing them is the learner's job, done on screen.
 */
function PointsBoard({ a, spec, s, set, verdict, lang, phone }: { a: MarkPointsActivity; spec: LessonChartSpec; s: MarkPointsAnswer; set: (x: MarkPointsAnswer) => void; verdict: Verdict; lang: Lang; phone: boolean }) {
  const tx = TX[lang];
  const candles = spec.candles as unknown[] & { rsi?: Array<number | null> };
  const n = candles.length;
  const tone = verdict === 'right' ? 'bull' : verdict === 'wrong' ? 'bear' : 'gold';
  // Once right, the revealed lines mark the same points (and the feedback states the values), so the learner's own marks step aside.
  const marked = verdict === 'right' ? [] : s.picks.map((p, i) => ({ p, i })).filter((x): x is { p: number; i: number } => x.p !== null);
  const points = marked.map(({ p, i }) => ({ idx: p, at: a.at, place: a.at === 'low' ? 'below' : undefined, tone, label: { he: String(i + 1), en: String(i + 1) } }));
  const subMarks = candles.rsi ? marked.filter(({ p }) => candles.rsi![p] != null).map(({ p }) => ({ idx: p, tone, place: a.at === 'low' ? 'below' : undefined, label: { he: `RSI ${Math.round(candles.rsi![p]!)}`, en: `RSI ${Math.round(candles.rsi![p]!)}` } })) : [];
  const options = { ...spec.options, points: [...((spec.options?.points as unknown[]) ?? []), ...points], subMarks: [...((spec.options?.subMarks as unknown[]) ?? []), ...subMarks], ...(verdict === 'right' ? a.reveal : {}) };
  const pick = (idx: number) => {
    const picks = [...s.picks]; picks[s.active] = idx;
    const next = picks.findIndex((p, k) => p === null && k !== s.active);
    set({ ...s, picks, active: next >= 0 ? next : s.active });
  };
  const current = s.picks[s.active] ?? null;
  return (
    <figure className={styles.single}>
      <div className={styles.wsHead}>
        {spec.caption && <figcaption className="chip">{spec.caption[lang]}</figcaption>}
        <span className="demo">{lang === 'he' ? 'נתוני הדגמה' : 'Demo data'}</span>
      </div>
      <div className={styles.chartBox}>
        <Chart candles={spec.candles as never} variant={spec.variant} options={options} label={spec.label[lang]} height={phone ? 300 : undefined} {...(verdict ? {} : { onIndexClick: pick })} />
      </div>
      {!verdict && (
        <label className={styles.slider}>
          <span className="meta">{`${tx.dayPicker} · ${a.points[s.active]!.label[lang]}`}</span>
          {/* LTR in every language: the chart's time axis runs left to right, so the slider must too. */}
          <input type="range" dir="ltr" min={0} max={n - 1} value={current ?? Math.floor(n / 2)} onChange={(e) => pick(Number(e.target.value))} aria-valuetext={current !== null ? tx.pickedDay(current + 1) : tx.noDay} />
        </label>
      )}
    </figure>
  );
}

/**
 * The explorer's work area (Artifact 09.1): the table, one dataset at a time;
 * the line picked, explained with its formula; and what is left of the first
 * line at each total. Picking is free until checked; the answer never shows first.
 */
function ExploreBoard({ a, s, set, verdict, lang }: { a: ExploreActivity; s: ExploreAnswer; set: (x: ExploreAnswer) => void; verdict: Verdict; lang: Lang }) {
  const tx = TX[lang];
  const row = a.rows.find((r) => r.id === s.row);
  const shares = a.rows.filter((r) => r.share);
  const locked = !!verdict;
  return (
    <div className={styles.explore} tabIndex={0} role="region" aria-label={a.title[lang]}>
      <div className={`solid ${styles.exTable}`}>
        <div className={styles.rowBetween}>
          <b className={styles.exTitle}>{a.title[lang]}</b>
          <div className="seg" role="group" aria-label={a.datasetsLabel?.[lang] ?? tx.company}>
            {a.datasets.map((d) => <button key={d.key} type="button" className={s.dataset === d.key ? 'on' : ''} aria-pressed={s.dataset === d.key} disabled={locked} onClick={() => set({ ...s, dataset: d.key })}>{d.label[lang]}</button>)}
          </div>
        </div>
        <div className={styles.exRows}>
          {a.rows.map((r) => (
            <button key={r.id} type="button" className={styles.exRow} data-kind={r.kind} data-on={r.id === s.row || undefined} aria-pressed={r.id === s.row} disabled={locked} onClick={() => set({ ...s, row: r.id })}>
              <span>{r.label[lang]}</span><span className="n">{r.values[s.dataset]}</span>
            </button>
          ))}
        </div>
      </div>
      <div className={styles.exSide}>
        <section className={`glass ${styles.exDetail}`} aria-live="polite" aria-label={tx.youPicked}>
          {row ? <>
            <span className="label">{tx.youPicked}</span>
            <div className={styles.exName}><b className="h2">{row.label[lang]}</b>{row.term && lang === 'he' && <span className="meta" dir="ltr">{row.term}</span>}</div>
            <p className="small">{row.why[lang]}</p>
            {row.formula?.[s.dataset] && <div className="sunk"><span className="n">{row.formula[s.dataset]}</span></div>}
          </> : <p className="small">{tx.pickRow}</p>}
        </section>
        {shares.length > 0 && a.sharesTitle && (
          <section className={`solid ${styles.exShares}`} aria-label={a.sharesTitle[lang]}>
            <div className={styles.rowBetween}><b>{a.sharesTitle[lang]}</b><span className="meta">{a.datasets.find((d) => d.key === s.dataset)!.label[lang]}</span></div>
            {shares.map((r) => {
              const v = r.share![s.dataset]!;
              return (
                <div key={r.id} className={styles.exShare} data-on={r.id === s.row || undefined}>
                  <span>{r.label[lang]}</span>
                  <span className={styles.exTrack}><span style={{ width: `${Math.max(1, v)}%` }} /></span>
                  <span className="n">{v.toFixed(1)}%</span>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}
