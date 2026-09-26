import { useState } from 'react';
import type { Lang, QuizQuestion } from '@core/types/kb';
import type { LessonChartSpec } from '@core/charts/lessonCharts';
import { Chart } from '@ui/components/charts';
import { Icon } from '@ui/components/icons/Icons';
import { DiagramView } from './Diagrams';
import styles from './QuestionChart.module.css';

const KEYS = { he: 'אבגד', en: 'ABCD' };
const TX = {
  he: { demo: 'נתוני הדגמה', apply: 'יישום · גרף חדש', check: 'בדיקה', right: 'נכון', wrong: 'לא בדיוק' },
  en: { demo: 'Demo data', apply: 'Apply it · a new chart', check: 'Check', right: 'Correct', wrong: 'Not quite' }
} as const;

/** The chart a visual question is asked about — the same frame wherever the question appears. */
export function QuestionChart({ spec, lang, height = 220 }: { spec: LessonChartSpec; lang: Lang; height?: number }) {
  return (
    <figure className={styles.qchart}>
      <div className={styles.qhead}>{spec.caption && <figcaption className="chip">{spec.caption[lang]}</figcaption>}<span className="demo">{TX[lang].demo}</span></div>
      <Chart candles={spec.candles as never} variant={spec.variant} options={spec.options} label={spec.label[lang]} height={height} />
    </figure>
  );
}

/** What a visual question is asked about: its chart, or its figure (a statement, a comparison…). */
export function QuestionFigure({ q, spec, lang, height }: { q: QuizQuestion; spec?: LessonChartSpec; lang: Lang; height?: number }) {
  if (spec) return <QuestionChart spec={spec} lang={lang} height={height} />;
  return q.figure ? <DiagramView d={q.figure} lang={lang} compact /> : null;
}

/**
 * "Apply" (lesson feedback step): one question on a chart the lesson has not
 * shown. Answered once and explained either way — it never gates the lesson.
 */
export function ApplyCheck({ q, spec, lang }: { q: QuizQuestion; spec?: LessonChartSpec; lang: Lang }) {
  const tx = TX[lang];
  const [pick, setPick] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const right = pick === q.correctKey;
  return (
    <section className={`solid2 ${styles.apply}`} aria-label={tx.apply}>
      <span className="eyebrow">{tx.apply}</span>
      <QuestionFigure q={q} spec={spec} lang={lang} height={190} />
      <b className={styles.q}>{q.question[lang]}</b>
      <div className={styles.choices} role="radiogroup" aria-label={q.question[lang]}>
        {q.options.map((o, i) => {
          const on = pick === o.key;
          const cls = done ? (o.key === q.correctKey ? 'right' : on ? 'wrong' : 'dim') : on ? 'sel' : '';
          return (
            <button key={o.key} type="button" role="radio" aria-checked={on} className={`choice ${cls}`} disabled={done} onClick={() => setPick(o.key)}>
              <span className="key" aria-hidden="true">{KEYS[lang][i]}</span><span className={styles.grow}>{o.text[lang]}</span>
            </button>
          );
        })}
      </div>
      {!done && <button type="button" className={`btn2 sm ${styles.self}`} disabled={!pick} onClick={() => setDone(true)}>{tx.check}</button>}
      {done && (
        <div className={`fb ${right ? 'right' : 'wrong'}`} role="status">
          <span className="fbIcon"><Icon name={right ? 'check' : 'x'} size={right ? 18 : 16} /></span>
          <div className={styles.fbBody}><b>{right ? tx.right : tx.wrong}</b><span className="small">{q.explanation[lang]}</span></div>
        </div>
      )}
    </section>
  );
}
