import { useEffect, useState } from 'react';
import { DiagramView } from '@ui/components/lessons/Diagrams';
import type { ReactNode } from 'react';
import type { Lang } from '@core/types/kb';
import { lessonById, lessonsOf, trackById } from '@core/curriculum/curriculum';
import type { TrackId } from '@core/curriculum/curriculum';
import { trackDone } from '@core/progress/learning';
import { practiceItems, practicePass, writtenLessons } from '@core/practice/trackPractice';
import { lessonContent, questionChart } from '@core/lessons/content';
import { useAppState } from '@ui/app/AppState';
import { useRoute } from '@ui/hooks/useRoute';
import { useMedia, PHONE } from '@ui/hooks/useMedia';
import { useOpenTutor } from '@ui/shell/AiLauncher';
import { Chart } from '@ui/components/charts';
import { Icon } from '@ui/components/icons/Icons';
import { TrackArt, TrackMono } from '@ui/components/curriculum/Curriculum';
import { correctCount, setSession, useSession } from './session';
import type { PracticeSession } from './session';
import ws from '../lesson/LessonWorkspace.module.css';
import styles from './PracticeRoute.module.css';

const TX = {
  he: {
    tracks: 'מסלולים', crumb: 'תרגול מסכם', resultsCrumb: 'תוצאות התרגול', title: (t: string) => `תרגול מסכם: ${t}`,
    doneOf: (d: number, n: number) => `סיימתם ${d}/${n} שיעורים`,
    intro: 'שאלה אחת מכל שיעור. אין טיימר ואין עונש על טעות: כל תשובה מגיעה עם הסבר, וכל טעות מקשרת לשיעור שבו הנושא נלמד.',
    writtenNote: (w: number, n: number) => `השאלות מכסות את ${w} השיעורים שכבר כתובים מתוך ${n}. שיעורים חדשים יצטרפו לתרגול כשייכתבו.`,
    questions: 'שאלות', toPass: 'כדי לעבור', time: 'זמן משוער', attempts: 'ניסיונות', unlimited: 'ללא הגבלה', minutes: (m: number) => `${m} דק׳`,
    how: 'איך זה עובד', howBody: 'עונים, לוחצים "בדיקה", ורואים מיד אם צדקתם ולמה.',
    start: 'התחלת התרגול', resume: (q: number) => `להמשיך · שאלה ${q}`, back: 'חזרה למסלול', inside: 'מה בתרגול', insideMeta: (n: number) => `${n} שאלות · לפי סדר השיעורים`, mcq: 'בחירה',
    attemptChip: (n: number) => `ניסיון ${n}`, retryTitle: (n: number) => `${n} שאלות חדשות. אותם נושאים.`,
    retryBody: (best: number) => `בניסיון הטוב ביותר עניתם נכון על ${best}. השאלות הפעם שונות, אבל בודקות את אותם רעיונות.`,
    startN: (n: number) => `להתחיל את ניסיון ${n}`, later: 'אחר כך', prevAttempt: 'ניסיון קודם', review: (t: string) => `חזרה מהירה · ${t}`,
    lockedTitle: 'התרגול עוד סגור', lockedBody: 'התרגול נפתח כשמסיימים את כל השיעורים הכתובים במסלול.', toNext: 'לשיעור הבא בתור',
    emptyTitle: 'עוד אין שיעורים כתובים במסלול הזה', emptyBody: 'התרגול המסכם ייפתח יחד עם השיעורים.',
    exit: 'יציאה', barMeta: (t: string) => `תרגול מסכם · ${t}`, qOf: (q: number, n: number) => `שאלה ${q}/${n}`, correctChip: (k: number) => `${k} נכונות`,
    dotsAria: (k: number, a: number) => `התקדמות: ${k} נכונות מתוך ${a} שנענו`, fromLesson: (i: number, t: string) => `משיעור ${i} · ${t}`,
    pickCheck: 'בחרו תשובה ולחצו "בדיקה".', check: 'בדיקה', nextQ: 'לשאלה הבאה', toResults: 'לתוצאות', footMeta: (p: number, n: number) => `צריך ${p} מתוך ${n} כדי לעבור · אין הגבלת ניסיונות`,
    right: 'נכון', wrong: 'לא בדיוק', toLesson: (i: number, t: string) => `לשיעור ${i}: ${t}`, tutor: 'מורה AI', demo: 'נתוני הדגמה',
    passed: 'עברתם', notYet: 'עוד לא', trackDoneH: 'המסלול הושלם', passedH: 'עברתם את התרגול', missingOne: 'כמעט. חסרה תשובה אחת.', missingN: (k: number) => `עוד לא. חסרות ${k} תשובות.`,
    passLine: (s: number, n: number, p: number) => `${s} נכונות מתוך ${n} — מעל הרף של ${p}.`, failLine: (s: number, n: number, p: number) => `${s} נכונות מתוך ${n}. צריך ${p} כדי לעבור.`,
    yourScore: 'הציון שלכם', bar: 'רף מעבר · 80%', timeTaken: 'זמן', attemptN: 'ניסיון', bestLabel: 'הטוב ביותר',
    next: 'מה הלאה', nextDone: 'המסלול הושלם: כל השיעורים והתרגול המסכם.',
    nextWritten: 'התרגול עבר ונשמר. המסלול יסומן כהושלם כשכל השיעורים שלו ייכתבו ויושלמו.',
    nextTry: 'בניסיון הבא', nextTryBody: (n: number) => `${n} שאלות מאותם שיעורים, ככל שיש בבנק שאלות אחרות. התוצאה הטובה ביותר שלכם נשמרת.`,
    toSummary: 'לסיכום המסלול', again: 'ניסיון נוסף', revisit: (k: number) => (k === 1 ? 'השאלה שכדאי לחזור אליה' : `${k} השאלות שכדאי לחזור אליהן`), allRight: 'כל התשובות נכונות',
    all: 'כל השאלות', lessonN: (i: number, t: string) => `שיעור ${i} · ${t}`, toLessonShort: 'לשיעור'
  },
  en: {
    tracks: 'Tracks', crumb: 'Track practice', resultsCrumb: 'Practice results', title: (t: string) => `Track practice: ${t}`,
    doneOf: (d: number, n: number) => `${d}/${n} lessons done`,
    intro: 'One question from each lesson. No timer and no penalty: every answer comes with an explanation, and every mistake links to the lesson that teaches it.',
    writtenNote: (w: number, n: number) => `The questions cover the ${w} lessons written so far, out of ${n}. New lessons join the practice once written.`,
    questions: 'questions', toPass: 'to pass', time: 'estimated', attempts: 'attempts', unlimited: 'unlimited', minutes: (m: number) => `${m} min`,
    how: 'How it works', howBody: 'Answer, press "Check", and see right away whether you were right and why.',
    start: 'Start the practice', resume: (q: number) => `Continue · question ${q}`, back: 'Back to the track', inside: "What's in it", insideMeta: (n: number) => `${n} questions · in lesson order`, mcq: 'Choice',
    attemptChip: (n: number) => `Attempt ${n}`, retryTitle: (n: number) => `${n} new questions. Same ideas.`,
    retryBody: (best: number) => `Your best attempt got ${best} right. The questions differ this time, but they test the same ideas.`,
    startN: (n: number) => `Start attempt ${n}`, later: 'Later', prevAttempt: 'Previous attempt', review: (t: string) => `Quick review · ${t}`,
    lockedTitle: 'Practice is still locked', lockedBody: 'It opens once you finish every written lesson in the track.', toNext: 'To the next lesson',
    emptyTitle: 'No lessons are written in this track yet', emptyBody: 'Its practice opens together with its lessons.',
    exit: 'Exit', barMeta: (t: string) => `Track practice · ${t}`, qOf: (q: number, n: number) => `Question ${q}/${n}`, correctChip: (k: number) => `${k} correct`,
    dotsAria: (k: number, a: number) => `Progress: ${k} correct of ${a} answered`, fromLesson: (i: number, t: string) => `From lesson ${i} · ${t}`,
    pickCheck: 'Pick an answer and press "Check".', check: 'Check', nextQ: 'Next question', toResults: 'See results', footMeta: (p: number, n: number) => `${p} of ${n} to pass · unlimited attempts`,
    right: 'Correct', wrong: 'Not quite', toLesson: (i: number, t: string) => `To lesson ${i}: ${t}`, tutor: 'AI Tutor', demo: 'Demo data',
    passed: 'Passed', notYet: 'Not yet', trackDoneH: 'Track complete', passedH: 'You passed the practice', missingOne: 'Almost. One answer short.', missingN: (k: number) => `Not yet. ${k} answers short.`,
    passLine: (s: number, n: number, p: number) => `${s} correct out of ${n} — above the bar of ${p}.`, failLine: (s: number, n: number, p: number) => `${s} correct out of ${n}. You need ${p} to pass.`,
    yourScore: 'Your score', bar: 'Pass mark · 80%', timeTaken: 'Time', attemptN: 'Attempt', bestLabel: 'Best',
    next: "What's next", nextDone: 'Track complete: every lesson and the final practice.',
    nextWritten: 'Passed and saved. The track is marked complete once all of its lessons are written and done.',
    nextTry: 'Next attempt', nextTryBody: (n: number) => `${n} questions from the same lessons, different ones where the bank has them. Your best result is kept.`,
    toSummary: 'Track summary', again: 'Try again', revisit: (k: number) => (k === 1 ? 'The question worth revisiting' : `${k} questions worth revisiting`), allRight: 'Every answer correct',
    all: 'All questions', lessonN: (i: number, t: string) => `Lesson ${i} · ${t}`, toLessonShort: 'Lesson'
  }
} as const;
type Tx = (typeof TX)[Lang];

const shortTitle = (t: string) => t.split(/[:—]/)[0]!.trim();
const lessonNo = (lessonId: string) => { const l = lessonById(lessonId)!; return lessonsOf(l.track).indexOf(l) + 1; };

/**
 * Track practice (Artifact: 11 · Practice). `#/practice/T` is the entry —
 * or the retry entry, or the results of the attempt just finished — inside
 * the shell; `#/practice/T/run` is the full-screen question view.
 */
export function PracticeRoute({ trackId, run }: { trackId: TrackId; run: boolean }) {
  const { lang, learning } = useAppState();
  const { go } = useRoute();
  const session = useSession(trackId);
  const tx = TX[lang];
  const record = learning.practice[trackId];

  const start = () => {
    const attempt = (record?.attempts ?? 0) + 1;
    const items = practiceItems(trackId, attempt);
    setSession({ track: trackId, attempt, items, answers: items.map(() => null), index: 0, startedAt: Date.now(), finishedAt: null, completedTrack: false });
    go('practice', { trackId, view: 'run' });
  };

  // Arriving at the question view with no attempt in progress starts one. Only
  // on arrival: the last answer finishes the attempt a moment before the page
  // leaves this view, and that must not start another.
  useEffect(() => { if (run && (!session || session.finishedAt)) start(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (run) return session && !session.finishedAt ? <Session s={session} tx={tx} lang={lang} /> : null;
  if (session?.finishedAt) return <Results s={session} tx={tx} lang={lang} onRetry={start} />;
  return <Entry trackId={trackId} tx={tx} lang={lang} session={session} onStart={start} onResume={() => go('practice', { trackId, view: 'run' })} />;
}

function Crumbs({ trackId, tx, last }: { trackId: TrackId; tx: Tx; last: string }) {
  const { lang } = useAppState();
  const { go } = useRoute();
  const chev = lang === 'he' ? 'chevL' : 'chevR';
  return (
    <nav className={styles.crumbs} aria-label={lang === 'he' ? 'פירורי לחם' : 'Breadcrumb'}>
      <a href="#/" onClick={(e) => { e.preventDefault(); go('home'); }}>{tx.tracks}</a><Icon name={chev} size={13} />
      <a href={`#/track/${trackId}`} onClick={(e) => { e.preventDefault(); go('track', { trackId }); }}>{trackById(trackId).title[lang]}</a><Icon name={chev} size={13} />
      <span aria-current="page">{last}</span>
    </nav>
  );
}

function Entry({ trackId, tx, lang, session, onStart, onResume }: { trackId: TrackId; tx: Tx; lang: Lang; session: PracticeSession | null; onStart: () => void; onResume: () => void }) {
  const { learning } = useAppState();
  const { go } = useRoute();
  const t = trackById(trackId), all = lessonsOf(trackId), written = writtenLessons(trackId);
  const record = learning.practice[trackId];
  const done = written.filter((l) => learning.lessons[l.id]?.completed);
  const open = written.length > 0 && done.length === written.length;
  const attempt = (record?.attempts ?? 0) + 1;
  const items = practiceItems(trackId, attempt);
  const pass = practicePass(items);
  const retry = !!record && !record.passed;
  const chev = lang === 'he' ? 'chevL' : 'chevR';
  const nextUp = written.find((l) => !learning.lessons[l.id]?.completed);

  let head: ReactNode, body: ReactNode, actions: ReactNode;
  if (!written.length) {
    head = <h1 className={`h1 ${styles.title}`}>{tx.emptyTitle}</h1>;
    body = <p className="txt">{tx.emptyBody}</p>;
    actions = <button type="button" className="btnQuiet" onClick={() => go('track', { trackId })}>{tx.back}</button>;
  } else if (!open) {
    head = <div className={styles.headRow}><TrackMono id={trackId} size={56} lang={lang} /><div><span className="eyebrow">{tx.doneOf(done.length, written.length)}</span><h1 className={`h1 ${styles.title}`}>{tx.lockedTitle}</h1></div></div>;
    body = <><p className="txt">{tx.lockedBody}</p>{written.length < all.length && <p className="meta">{tx.writtenNote(written.length, all.length)}</p>}</>;
    actions = <>{nextUp && <button type="button" className="btn lg" onClick={() => go('lesson', { lessonId: nextUp.id })}>{tx.toNext}<Icon name={chev} size={17} /></button>}<button type="button" className="btnQuiet" onClick={() => go('track', { trackId })}>{tx.back}</button></>;
  } else if (retry && !session) {
    head = <><span className={`chip ${styles.selfStart}`}><Icon name="refresh" size={14} />{tx.attemptChip(attempt)}</span><h1 className={`h1 ${styles.title}`}>{tx.retryTitle(items.length)}</h1></>;
    body = <p className="txt">{tx.retryBody(record!.best)}</p>;
    actions = <><button type="button" className="btn lg" onClick={onStart}>{tx.startN(attempt)}<Icon name={chev} size={17} /></button><button type="button" className="btnQuiet" onClick={() => go('track', { trackId })}>{tx.later}</button></>;
  } else {
    head = <div className={styles.headRow}><TrackMono id={trackId} size={56} lang={lang} /><div><span className="eyebrow">{tx.doneOf(done.length, written.length)}</span><h1 className={`h1 ${styles.title}`}>{tx.title(t.title[lang])}</h1></div></div>;
    body = (
      <>
        <p className="txt">{tx.intro}</p>
        <div className={styles.stats4}>
          {([['list', String(items.length), tx.questions], ['target', `${pass}/${items.length}`, tx.toPass], ['clock', tx.minutes(Math.max(5, Math.round(items.length * 1.25))), tx.time], ['refresh', tx.unlimited, tx.attempts]] as const).map(([ic, v, k]) => (
            <div key={k} className="sunk"><span className={styles.learnIc}><Icon name={ic} size={18} /></span><b className="n">{v}</b><span className="meta">{k}</span></div>
          ))}
        </div>
        <div className="block example"><b className="lead2">{tx.how} · </b>{tx.howBody}</div>
        {written.length < all.length && <p className="meta">{tx.writtenNote(written.length, all.length)}</p>}
      </>
    );
    actions = <>
      {session && !session.finishedAt
        ? <button type="button" className="btn lg" onClick={onResume}>{tx.resume(session.index + 1)}<Icon name={chev} size={17} /></button>
        : <button type="button" className="btn lg" onClick={onStart}>{tx.start}<Icon name={chev} size={17} /></button>}
      <button type="button" className="btnQuiet" onClick={() => go('track', { trackId })}>{tx.back}</button>
    </>;
  }

  return (
    <div className={styles.page}>
      <Crumbs trackId={trackId} tx={tx} last={tx.crumb} />
      <div className={styles.grid}>
        <section className={`glass ${styles.main}`}>{head}{body}<div className={styles.actions}>{actions}</div></section>
        {written.length > 0 && (
          <section className={`solid ${styles.side}`}>
            <div className={styles.sideHead}><b>{retry ? tx.prevAttempt : tx.inside}</b><span className="meta">{retry && record?.total ? `${record.best}/${record.total}` : tx.insideMeta(items.length)}</span></div>
            {items.map((it, i) => {
              const l = lessonById(it.lessonId)!;
              const ok = !!learning.lessons[l.id]?.completed;
              return (
                <div key={i} className={styles.qRow} data-todo={!open && !ok ? true : undefined}>
                  <span className={`num${!open && ok ? ' done' : ''}`}>{!open && ok ? <Icon name="check" size={11} /> : i + 1}</span>
                  <span className={styles.qTitle}>{shortTitle(l.title[lang])}</span>
                  <span className={`meta ${styles.type}`}><Icon name="list" size={14} />{tx.mcq}</span>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}

function Session({ s, tx, lang }: { s: PracticeSession; tx: Tx; lang: Lang }) {
  const { learning, recordPractice } = useAppState();
  const { go } = useRoute();
  const openTutor = useOpenTutor();
  const phone = useMedia(PHONE);
  const [picked, setPicked] = useState<string | null>(null);
  const it = s.items[s.index]!, q = it.question;
  const answered = s.answers[s.index] ?? null;
  const checked = answered !== null;
  const value = checked ? answered : picked;
  const isRight = checked && answered === q.correctKey;
  const lesson = lessonById(it.lessonId)!, n = lessonNo(it.lessonId);
  const correct = correctCount(s);
  const pass = practicePass(s.items);
  const last = s.index === s.items.length - 1;
  const chev = lang === 'he' ? 'chevL' : 'chevR';
  const keys = lang === 'he' ? 'אבגד' : 'ABCD';

  const check = () => { const answers = [...s.answers]; answers[s.index] = picked; setSession({ ...s, answers }); };
  const next = () => {
    setPicked(null);
    if (!last) { setSession({ ...s, index: s.index + 1 }); return; }
    const score = correctCount(s), total = s.items.length;
    recordPractice(s.track, score, total);
    // Whether this attempt is the one that completed the whole track (every
    // lesson done AND a pass) — the results page then leads to the celebration.
    const nowPassed = learning.practice[s.track]?.passed || score >= pass;
    const completed = !trackDone(learning, s.track) && nowPassed && lessonsOf(s.track).every((l) => learning.lessons[l.id]?.completed);
    setSession({ ...s, finishedAt: Date.now(), completedTrack: completed });
    go('practice', { trackId: s.track });
  };

  // A visual question shows its own chart from the start; otherwise the lesson's chart follows the answer.
  const qSpec = questionChart(q);
  const spec = qSpec ?? lessonContent(lesson.id)?.charts[0];
  const dots = s.items.map((x, i) => (s.answers[i] == null ? (i === s.index ? 'cur' : '') : s.answers[i] === x.question.correctKey ? 'ok' : 'err'));
  const answeredCount = s.answers.filter((a) => a != null).length;

  return (
    <div className={ws.lesson}>
      <header className={`glass ${ws.lbar}`}>
        <button type="button" className={`btnQuiet sm ${ws.back}`} onClick={() => go('track', { trackId: s.track })}><Icon name="x" size={15} />{tx.exit}</button>
        <div className={ws.lbarTitle}><span className="meta">{tx.barMeta(trackById(s.track).title[lang])}</span><b>{tx.qOf(s.index + 1, s.items.length)}</b></div>
        <div className={styles.pdots} role="img" aria-label={tx.dotsAria(correct, answeredCount)}>{dots.map((d, i) => <i key={i} className={d ? styles[d] : undefined} />)}</div>
        {!phone && <span className="chip ok">{tx.correctChip(correct)}</span>}
        <button type="button" className={`btnAi ${ws.ai}`} onClick={openTutor} aria-label={phone ? tx.tutor : undefined}><Icon name="spark" size={15} />{phone ? null : tx.tutor}</button>
      </header>
      <main className={ws.lbody} id="workspace" aria-label={tx.qOf(s.index + 1, s.items.length)}>
        <section className={`glass ${ws.lpane}`}>
          <div className={styles.qhead}><span className="chip"><Icon name="list" size={14} />{tx.mcq}</span><span className={styles.qn}>{tx.fromLesson(n, shortTitle(lesson.title[lang]))}</span></div>
          <h2 className={`h1 ${styles.qH}`}>{q.question[lang]}</h2>
          {!checked && <p className="small">{tx.pickCheck}</p>}
          <div className={styles.choices} role="radiogroup" aria-label={q.question[lang]}>
            {q.options.map((o, i) => {
              const on = value === o.key;
              const cls = checked ? (o.key === q.correctKey ? 'right' : on ? 'wrong' : 'dim') : on ? 'sel' : '';
              return (
                <button key={o.key} type="button" role="radio" aria-checked={on} className={`choice ${cls}`} disabled={checked} onClick={() => setPicked(o.key)}>
                  <span className="key" aria-hidden="true">{keys[i]}</span><span className={styles.grow}>{o.text[lang]}</span>
                  {checked && o.key === q.correctKey && <Icon name="check" size={16} />}
                  {checked && on && !isRight && <Icon name="x" size={15} />}
                </button>
              );
            })}
          </div>
          {checked && (
            <div className={`fb ${isRight ? 'right' : 'wrong'}`} role="status">
              <span className="fbIcon"><Icon name={isRight ? 'check' : 'x'} size={isRight ? 18 : 16} /></span>
              <div className={styles.fbBody}>
                <b>{isRight ? tx.right : tx.wrong}</b>
                <span className="small">{q.explanation[lang]}</span>
                {!isRight && <button type="button" className={`btnText ${styles.selfStart}`} onClick={() => go('lesson', { lessonId: lesson.id })}><Icon name="book" size={14} />{tx.toLesson(n, shortTitle(lesson.title[lang]))}</button>}
              </div>
            </div>
          )}
        </section>
        <section className={`well ${ws.lwork}`}>
          {q.figure && !qSpec ? <DiagramView d={q.figure} lang={lang} /> : (checked || qSpec) && spec ? (
            <figure className={ws.single}>
              <div className={ws.wsHead}><figcaption className="chip">{spec.caption?.[lang]}</figcaption><span className="demo">{tx.demo}</span></div>
              <div className={ws.chartBox}><Chart candles={spec.candles as never} variant={spec.variant} options={spec.options} label={spec.label[lang]} height={phone ? 260 : undefined} /></div>
            </figure>
          ) : <div className={ws.art}><TrackArt id={s.track} /></div>}
        </section>
      </main>
      <footer className={`glass ${ws.lfoot}`}>
        <span />
        {!phone && <span className="meta">{tx.footMeta(pass, s.items.length)}</span>}
        {checked
          ? <button type="button" className="btn" onClick={next}>{last ? tx.toResults : tx.nextQ}<Icon name={chev} size={16} /></button>
          : <button type="button" className="btn" disabled={!picked} onClick={check}>{tx.check}</button>}
      </footer>
    </div>
  );
}

function Results({ s, tx, lang, onRetry }: { s: PracticeSession; tx: Tx; lang: Lang; onRetry: () => void }) {
  const { go } = useRoute();
  const n = s.items.length, score = correctCount(s), pass = practicePass(s.items), ok = score >= pass;
  const pct = Math.round((score / n) * 100);
  const mins = Math.max(1, Math.round(((s.finishedAt ?? Date.now()) - s.startedAt) / 60000));
  const misses = s.items.map((it, i) => ({ it, i })).filter(({ it, i }) => s.answers[i] !== it.question.correctKey);
  const chev = lang === 'he' ? 'chevL' : 'chevR';
  return (
    <div className={styles.page}>
      <Crumbs trackId={s.track} tx={tx} last={tx.resultsCrumb} />
      <div className={styles.grid2}>
        <section className={`glass ${styles.main} ${styles.result}`}>
          <span className={`chip ${ok ? 'ok' : 'warn'}`}>{ok && <Icon name="check" size={14} />}{ok ? tx.passed : tx.notYet} · {tx.attemptChip(s.attempt)}</span>
          <div className={styles.scoreRow}>
            <span className="ring" style={{ ['--p' as string]: pct, ['--c' as string]: ok ? 'var(--ok)' : 'var(--learn-fill)', width: 120, height: 120 }}><span className="n" style={{ fontSize: 26 }}>{score}/{n}</span></span>
            <div className={styles.stack6}>
              <h1 className={`h1 ${styles.title}`}>{ok ? (s.completedTrack ? tx.trackDoneH : tx.passedH) : pass - score === 1 ? tx.missingOne : tx.missingN(pass - score)}</h1>
              <span className="txt">{ok ? tx.passLine(score, n, pass) : tx.failLine(score, n, pass)}</span>
            </div>
          </div>
          <div className={styles.scoreBar}>
            <div className={styles.barHead}><span className="meta">{tx.yourScore}</span><span className="meta">{tx.bar}</span></div>
            <div className={styles.track}><span style={{ width: `${pct}%`, background: ok ? 'var(--ok)' : 'var(--learn-fill)' }} /><i style={{ insetInlineStart: `${(pass / n) * 100}%` }} aria-hidden="true" /></div>
          </div>
          <div className={styles.stats3}>
            {([['clock', tx.minutes(mins), tx.timeTaken], ['refresh', String(s.attempt), tx.attemptN], ['target', `${score}/${n}`, tx.bestLabel]] as const).map(([ic, v, k]) => (
              <div key={k} className="sunk"><span className={styles.mutedIc}><Icon name={ic} size={16} /></span><div className={styles.stack}><b className="n">{v}</b><span className="meta">{k}</span></div></div>
            ))}
          </div>
          {ok
            ? <div className="block takeaway"><b className="lead2">{tx.next} · </b>{s.completedTrack ? tx.nextDone : tx.nextWritten}</div>
            : <div className="block example"><b className="lead2">{tx.nextTry} · </b>{tx.nextTryBody(n)}</div>}
          <div className={styles.actions}>
            {ok
              ? s.completedTrack
                ? <button type="button" className="btn lg" onClick={() => go('complete', { trackId: s.track })}>{tx.toSummary}<Icon name={chev} size={17} /></button>
                : <button type="button" className="btn lg" onClick={() => go('track', { trackId: s.track })}>{tx.back}<Icon name={chev} size={17} /></button>
              : <><button type="button" className="btn lg" onClick={onRetry}><Icon name="refresh" size={16} />{tx.again}</button><button type="button" className="btn2" onClick={() => go('track', { trackId: s.track })}>{tx.back}</button></>}
          </div>
        </section>
        <section className={`solid ${styles.side}`}>
          <b>{misses.length ? tx.revisit(misses.length) : tx.allRight}</b>
          {misses.map(({ it }) => {
            const l = lessonById(it.lessonId)!;
            return (
              <div key={it.question.id} className={`sunk ${styles.miss}`}>
                <span className={styles.missMark}><Icon name="x" size={12} /></span>
                <div className={styles.stack}><b className={styles.missTitle}>{tx.lessonN(lessonNo(l.id), shortTitle(l.title[lang]))}</b><span className="small">{it.question.question[lang]}</span></div>
                <button type="button" className="btnText" onClick={() => go('lesson', { lessonId: l.id })}><Icon name="book" size={14} />{tx.toLessonShort}</button>
              </div>
            );
          })}
          <hr className="hr" />
          <span className="label">{tx.all}</span>
          <div className={styles.allGrid}>
            {s.items.map((it, i) => {
              const good = s.answers[i] === it.question.correctKey;
              return <div key={i} className={styles.cell} data-ok={good}><b className="n">{i + 1}</b><Icon name={good ? 'check' : 'x'} size={good ? 14 : 13} /><span className="sr-only">{good ? tx.right : tx.wrong}</span></div>;
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
