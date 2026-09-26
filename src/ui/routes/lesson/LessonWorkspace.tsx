import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Lang, QuizQuestion } from '@core/types/kb';
import {
  LEVELS, TOTAL_LESSONS, formatDuration, lessonById, lessonsOf, nextInTrack, trackById
} from '@core/curriculum/curriculum';
import type { CurriculumLesson } from '@core/curriculum/curriculum';
import { hasContent } from '@core/curriculum/trackInfo';
import { completedIn, practiceOpen } from '@core/progress/learning';
import { lessonContent } from '@core/lessons/content';
import type { Callout, TeachStep } from '@core/lessons/content';
import type { LessonChartSpec } from '@core/charts/lessonCharts';
import { highlightGlossaryGroup } from '@core/glossary/highlight';
import { useAppState } from '@ui/app/AppState';
import { useRoute } from '@ui/hooks/useRoute';
import { useMedia, PHONE } from '@ui/hooks/useMedia';
import { Chart } from '@ui/components/charts';
import { Icon } from '@ui/components/icons/Icons';
import { GlossarySegments } from '@ui/components/learning/GlossaryText';
import { TrackArt } from '@ui/components/curriculum/Curriculum';
import { DiagramView } from '@ui/components/lessons/Diagrams';
import { ApplyCheck } from '@ui/components/lessons/QuestionChart';
import { ActivityPane, ActivityWork, ConceptCards, initialAnswer, isGraded, isReady, isRight, retryAnswer } from '@ui/components/activities/Activities';
import type { DrawerAction } from '@ui/routes/ai/TutorDrawer';
import styles from './LessonWorkspace.module.css';

// The tutor drawer carries the AI engine, so it loads only when first opened.
const TutorDrawer = lazy(() => import('@ui/routes/ai/TutorDrawer').then((m) => ({ default: m.TutorDrawer })));

const TX = {
  he: {
    lesson: 'שיעור', of: 'מתוך', prev: 'הקודם', stepsAria: 'שלבי השיעור', tutor: 'מורה AI', backToTrack: 'חזרה למסלול', toTrack: 'לעמוד המסלול',
    step: (k: number) => `שלב ${k}/7`, revealNext: 'חשפו את ההמשך', fullChart: 'גרף במסך מלא', close: 'סגירה', rotate: 'סובבו את המכשיר לתצוגה רחבה',
    offerAria: 'הצעת עזרה', offerTitle: 'תקועים על השאלה?', offerBody: 'אני יודע באיזה שיעור ושלב אתם. אפשר לשאול כל דבר — לא אגלה את התשובה.', offerExplain: 'הסבירו שוב במילים אחרות', offerExample: 'תנו דוגמה נוספת', notNow: 'לא עכשיו', openTutor: 'לפתוח את המורה',
    backAt: (k: number, s: string) => `חזרתם לשלב ${k} · ${s}`, reopen: 'לפתוח שוב את השיחה', next: (s: string) => `הבא: ${s}`, check: 'בדיקה', retry: 'נסו שוב', finish: 'סיום השיעור', nextLesson: 'לשיעור הבא',
    worth: 'כדאי לדעת', terms: 'מושגים נוספים', notice: 'מה לשים לב', noticeLead: 'הסתכלו על הגרף קודם. כשתהיו מוכנים, חשפו את ההערות.', noticeLeadFig: 'הסתכלו קודם על מה שמוצג. כשתהיו מוכנים, חשפו את ההערות.',
    reveal: 'חשוף הערות', hide: 'הסתר הערות', demo: 'נתוני הדגמה', summed: 'הגרף — מסוכם', gallery: 'הגרפים של השלב',
    pickTask: 'בחרו תשובה אחת, ואז "בדיקה"',
    right: 'נכון', wrong: 'עוד לא', rightHead: 'יפה — זו התשובה', wrongHead: 'כמעט. בואו נסתכל שוב', attempt: (n: number) => `ניסיון ${n} · אין הגבלה`, answerFirst: 'קודם עונים — ואז רואים את ההסבר.', toTry: (s: string) => `ל${s}`,
    curious: 'רוצים להמשיך לחקור? · ', curiousBody: 'המורה מכיר את השיעור הזה ויכול להסביר אותו אחרת או לתת עוד דוגמה.',
    explain: 'הסבר לי את הנושא', example: 'דוגמה נוספת', explainAsk: (t: string) => `הסבר לי על ${t}`, exampleAsk: (t: string) => `תן לי דוגמה נוספת על ${t}`,
    takeTitle: 'מה לקחת מהשיעור', bottom: 'בשורה התחתונה', caveat: 'שימו לב', inNext: 'בשיעור הבא', endOfTrack: 'זה השיעור האחרון במסלול — הצעד הבא הוא תרגול המסלול.',
    done: 'השיעור הושלם', inTrack: 'במסלול', attempts: 'ניסיונות', total: 'בסך הכול', upNext: 'השיעור הבא', soon: 'בקרוב', practice: 'תרגול על השיעור', practiceOpenLead: 'התרגול המסכם נפתח', practiceOpenBody: 'סיימתם את כל השיעורים הכתובים במסלול.', toPractice: 'לתרגול המסכם', undo: 'סימון השיעור כלא הושלם', redo: 'סימון השיעור כהושלם', notDone: 'השיעור לא מסומן כהושלם',
    nextTeaser: (t: string) => `בשיעור הבא: ${t}`
  },
  en: {
    lesson: 'Lesson', of: 'of', prev: 'Back', stepsAria: 'Lesson steps', tutor: 'AI Tutor', backToTrack: 'Back to track', toTrack: 'Track page',
    step: (k: number) => `Step ${k}/7`, revealNext: 'Reveal what followed', fullChart: 'Chart full screen', close: 'Close', rotate: 'Turn your phone sideways for a wider view',
    offerAria: 'Offer of help', offerTitle: 'Stuck on this one?', offerBody: "I know which lesson and step you're on. Ask anything — I won't give the answer away.", offerExplain: 'Explain it another way', offerExample: 'Give me another example', notNow: 'Not now', openTutor: 'Open the tutor',
    backAt: (k: number, s: string) => `Back on step ${k} · ${s}`, reopen: 'Reopen the conversation', next: (s: string) => `Next: ${s}`, check: 'Check', retry: 'Try again', finish: 'Finish the lesson', nextLesson: 'Next lesson',
    worth: 'Worth knowing', terms: 'A couple more terms', notice: 'What to notice', noticeLead: 'Look at the chart first. Reveal the notes when you are ready.', noticeLeadFig: 'Look at the figure first. Reveal the notes when you are ready.',
    reveal: 'Reveal annotations', hide: 'Hide annotations', demo: 'Demo data', summed: 'The chart, summed up', gallery: 'Charts for this step',
    pickTask: 'Pick one answer, then "Check"',
    right: 'Correct', wrong: 'Not yet', rightHead: "Nicely done — that's it", wrongHead: "Almost. Let's look again", attempt: (n: number) => `Attempt ${n} · no limit`, answerFirst: 'Answer first — then the explanation.', toTry: (s: string) => `To: ${s}`,
    curious: 'Want to dig further? · ', curiousBody: 'The tutor knows this lesson and can explain it another way or give another example.',
    explain: 'Explain this concept', example: 'Another example', explainAsk: (t: string) => `Explain ${t}`, exampleAsk: (t: string) => `Give me another example of ${t}`,
    takeTitle: 'What to take from this lesson', bottom: 'The bottom line', caveat: 'Watch out', inNext: 'Next lesson', endOfTrack: "This is the track's last lesson — track practice comes next.",
    done: 'Lesson complete', inTrack: 'in the track', attempts: 'attempts', total: 'overall', upNext: 'Up next', soon: 'Coming soon', practice: 'Practice this lesson', practiceOpenLead: 'Track practice is open', practiceOpenBody: 'You have finished every written lesson in the track.', toPractice: 'Go to the practice', undo: 'Mark lesson as incomplete', redo: 'Mark lesson as complete', notDone: 'Lesson not marked complete',
    nextTeaser: (t: string) => `Next lesson: ${t}`
  }
} as const;

type Verdict = 'right' | 'wrong' | null;
const KEYS = { he: 'אבגד', en: 'ABCD' };

/**
 * The lesson workspace (Artifact: 06 · Lesson): a focused full-screen page —
 * the lesson bar with its own 7 step names, an instruction pane, the chart
 * well, and a footer that names where each move goes.
 *
 * Every written lesson fills it from one content model (@core/lessons/content):
 * steps 1–3 teach (prose, callouts, notes, and a chart / diagram / cards in
 * the well), 4–5 are the activity or the lesson's first question, 6 is what
 * to keep, 7 completes the lesson. Every step stays reachable from the loop —
 * nothing is gated behind the one before it.
 */
export function LessonWorkspace({ lessonId }: { lessonId: string }) {
  const { lang, learning, learningCompleted, openLesson, reachStep, completeLesson, toggleLessonComplete } = useAppState();
  const { go } = useRoute();
  const phone = useMedia(PHONE);
  const tx = TX[lang];

  const lesson = lessonById(lessonId)!;
  const content = lessonContent(lessonId)!;
  const { charts, teach } = content;
  const activity = content.activity ?? null;
  const question = activity ? null : content.questions[0]!;
  const activitySpec = activity && 'chart' in activity && activity.chart !== undefined ? charts[activity.chart] : undefined;
  const steps = lesson.steps![lang];
  const track = trackById(lesson.track);
  const ls = lessonsOf(lesson.track), idx = ls.indexOf(lesson);
  const next = nextInTrack(lessonId);

  const record = learning.lessons[lessonId];
  const [step, setStep] = useState(() => (!record || record.completed ? 0 : record.step === 4 ? 3 : record.step));
  const [furthest, setFurthest] = useState(() => record?.step ?? 0);
  const [answer, setAnswer] = useState<unknown>(() => (activity ? initialAnswer(activity) : null));
  const [choice, setChoice] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [attempts, setAttempts] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const paneRef = useRef<HTMLDivElement>(null);
  // The tutor beside the lesson (Artifact 14): open or not, what to do on open,
  // the one-time offer after a wrong answer (14.1), and the return toast (14.7).
  const [drawer, setDrawer] = useState(false);
  const [drawerAction, setDrawerAction] = useState<DrawerAction>(null);
  const [offer, setOffer] = useState<'hidden' | 'shown' | 'dismissed'>('hidden');
  const [toast, setToast] = useState(false);
  const [sheetFull, setSheetFull] = useState(false);
  // Phone: one lesson chart at full screen (Artifact 15.4).
  const [fullChart, setFullChart] = useState<LessonChartSpec | null>(null);
  useEffect(() => {
    if (!fullChart) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFullChart(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [fullChart]);
  const aiBtnRef = useRef<HTMLButtonElement>(null);
  const openDrawer = (action: DrawerAction = null) => { setDrawerAction(action); setDrawer(true); setOffer((o) => (o === 'shown' ? 'dismissed' : o)); setToast(false); };
  const closeDrawer = useCallback(() => { setDrawer(false); setToast(true); aiBtnRef.current?.focus(); }, []);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(false), 6000); return () => clearTimeout(id); }, [toast]);

  useEffect(() => { openLesson(lessonId); }, [lessonId, openLesson]);

  // Glossary terms are highlighted across the whole lesson at once, so a term is marked where it first appears.
  const segs = useMemo(() => {
    const flat = highlightGlossaryGroup(teach.flatMap((t) => t.paragraphs.map((x) => x[lang])), lang);
    let k = 0;
    return teach.map((t) => t.paragraphs.map(() => flat[k++] ?? []));
  }, [teach, lang]);

  const goStep = (k: number) => {
    setStep(k);
    setFurthest((f) => Math.max(f, k));
    reachStep(lessonId, k);
    paneRef.current?.scrollTo({ top: 0 });
    document.getElementById('workspace')?.scrollTo({ top: 0 });
  };
  const check = () => {
    const ok = activity ? isRight(activity, answer) : choice === question!.correctKey;
    setVerdict(ok ? 'right' : 'wrong');
    if (!ok && !drawer) setOffer((o) => (o === 'hidden' ? 'shown' : o));
    setAttempts((n) => n + 1);
    goStep(4);
  };
  const retry = () => { setVerdict(null); setRevealed(false); setAnswer(activity ? retryAnswer(activity, answer) : null); setChoice(null); goStep(3); };
  // A prediction is revealed rather than marked: whatever was guessed, the lesson moves on.
  const mustRetry = verdict === 'wrong' && (!activity || isGraded(activity));
  const finish = () => { completeLesson(lessonId); goStep(6); };
  const askTutor = (kind: 'explain' | 'example') => openDrawer(kind);


  // ---------- the pane ----------
  const head = (title: string) => (
    <div className={styles.paneHead}>
      <span className="eyebrow">{steps[step]}</span>
      <h2 className={`h1 ${styles.paneTitle}`}>{title}</h2>
    </div>
  );
  const notesBlock = (t: TeachStep) => t.notes && (
    <div className={`solid2 ${styles.notes}`}>
      <div className={styles.notesHead}><b>{t.notesTitle?.[lang] ?? tx.notice}</b><button type="button" className="btn2 sm" aria-expanded={revealed} onClick={() => setRevealed((r) => !r)}>{revealed ? tx.hide : tx.reveal}</button></div>
      {!revealed && <p className="small">{t.work.kind === 'charts' ? tx.noticeLead : tx.noticeLeadFig}</p>}
      {revealed && (
        <ul className={styles.noteList}>
          {t.notes.map((n, i) => (
            <li key={i}><span className={styles.swatch} data-tone={n.tone} aria-hidden="true" /><div><b>{n.label[lang]}</b><p className="small">{n.explanation[lang]}</p></div></li>
          ))}
        </ul>
      )}
    </div>
  );

  const callout = (c: Callout, i: number) => <div key={i} className={`block ${c.kind}`}><b className="lead2">{c.lead[lang]} · </b>{c.text[lang]}</div>;

  let pane: ReactNode;
  if (step <= 2) {
    const t = teach[step as 0 | 1 | 2];
    pane = <>{head(t.heading[lang])}
      {t.paragraphs.map((_, i) => <p key={i} className={`${step === 0 && i === 0 ? 'lead' : 'txt'} ${styles.prose}`}><GlossarySegments segments={segs[step]![i]!} /></p>)}
      {t.callouts?.map(callout)}
      {step === 0 && <div className={styles.chips}><span className="chip"><Icon name="clock" size={12} />{formatDuration(lesson.minutes, lang)}</span><span className="chip">{LEVELS[lesson.level][lang]}</span></div>}
      {notesBlock(t)}</>;
  } else if (step === 3) {
    pane = activity ? (
      <>{head(activity.prompt[lang])}
        <ActivityPane a={activity} answer={answer} setAnswer={setAnswer} verdict={null} lang={lang} revealed={revealed} onToggleReveal={() => setRevealed((r) => !r)} onRetry={retry} /></>
    ) : question ? (
      <>{head(question.question[lang])}
        <Choices q={question} lang={lang} value={choice} onChange={setChoice} />
        <span className="meta">{tx.pickTask}</span></>
    ) : null;
  } else if (step === 4) {
    pane = verdict === null ? (
      <>{head(steps[4]!)}<p className="txt">{tx.answerFirst}</p>
        <button type="button" className="btn2" onClick={() => goStep(3)}>{tx.toTry(steps[3]!)}</button></>
    ) : (
      <>{head(activity && !isGraded(activity) ? activity.prompt[lang] : verdict === 'right' ? tx.rightHead : tx.wrongHead)}
        {activity
          ? <>
            <ActivityPane a={activity} answer={answer} setAnswer={setAnswer} verdict={verdict} lang={lang} revealed={revealed} onToggleReveal={() => setRevealed((r) => !r)} onRetry={retry} />
            {(verdict === 'right' || !isGraded(activity)) && 'explain' in activity && activity.explain?.map((x, i) => <p key={i} className={`txt ${styles.prose}`}>{x[lang]}</p>)}
          </>
          : <>
            <Choices q={question!} lang={lang} value={choice} verdict={verdict} />
            <div className={`fb ${verdict}`} role="status">
              <span className="fbIcon"><Icon name={verdict === 'right' ? 'check' : 'x'} size={verdict === 'right' ? 18 : 16} /></span>
              <div className={styles.fbBody}>
                <b>{verdict === 'right' ? tx.right : tx.wrong}</b>
                <span className="small">{question!.explanation[lang]}</span>
                {verdict === 'wrong' && <button type="button" className={`btnText ${styles.selfStart}`} onClick={retry}><Icon name="refresh" size={14} />{tx.retry}</button>}
              </div>
            </div>
          </>}
        {(!activity || isGraded(activity)) && <span className="meta">{tx.attempt(attempts)}</span>}
        {/* The one-time offer after a wrong answer (14.1), in the pane's flow under the verdict:
            floating over the work area, it covered the chart, and on phones the Apply check. */}
        {offer === 'shown' && !drawer && (
          <section className={`glass ${styles.offer}`} aria-label={tx.offerAria}>
            <div className={styles.offerHead}><span className="aiMark" aria-hidden="true"><Icon name="spark" size={15} /></span><b>{tx.offerTitle}</b></div>
            <span className="small">{tx.offerBody}</span>
            <div className={styles.offerSuggs}>
              <button type="button" className="sugg" onClick={() => openDrawer('explain')}>{tx.offerExplain}</button>
              <button type="button" className="sugg" onClick={() => openDrawer('example')}>{tx.offerExample}</button>
            </div>
            <div className={styles.offerFoot}>
              <button type="button" className="btnText" onClick={() => setOffer('dismissed')}>{tx.notNow}</button>
              <button type="button" className="btnAi" onClick={() => openDrawer()}><Icon name="spark" size={14} />{tx.openTutor}</button>
            </div>
          </section>
        )}
        {/* Apply: once the Try step is settled, the same idea on a chart the lesson has not shown. */}
        {content.apply && !mustRetry && <ApplyCheck key={lessonId} q={content.apply} spec={content.apply.chart !== undefined ? charts[content.apply.chart] : undefined} lang={lang} />}
        <div className="block ai">
          <b className="lead2">{tx.curious}</b>{tx.curiousBody}
          <div className={styles.aiActions}>
            <button type="button" className="btnText" onClick={() => askTutor('explain')}>{tx.explain}</button>
            <button type="button" className="btnText" onClick={() => askTutor('example')}>{tx.example}</button>
          </div>
        </div></>
    );
  } else if (step === 5) {
    pane = <>{head(tx.takeTitle)}
      <div className="block takeaway"><b className="lead2">{tx.bottom} · </b>{content.takeaway.bottomLine[lang]}</div>
      <div className="block caveat"><b className="lead2">{tx.caveat} · </b>{content.takeaway.caveat[lang]}</div>
      <div className="block example"><b className="lead2">{tx.inNext} · </b>{next ? next.title[lang] : tx.endOfTrack}</div></>;
  } else {
    const doneInTrack = completedIn(learning, lesson.track);
    pane = (
      <>
        <div className={styles.doneHead}>
          {record?.completed
            ? <><span className={styles.doneMark}><Icon name="check" size={26} /></span><span className={`eyebrow ${styles.okEyebrow}`}>{tx.done}</span></>
            : <span className="eyebrow">{tx.notDone}</span>}
          <h2 className={`h1 ${styles.paneTitle}`}>{lesson.title[lang]}</h2>
        </div>
        <div className={styles.stats}>
          <div><b className="n">{doneInTrack}/{ls.length}</b><span className="meta">{tx.inTrack}</span></div>
          <div><b className="n">{Math.max(1, attempts)}</b><span className="meta">{tx.attempts}</span></div>
          <div><b className="n">{learningCompleted}/{TOTAL_LESSONS}</b><span className="meta">{tx.total}</span></div>
        </div>
        <div className={styles.trackMeter}><span className="meta">{track.title[lang]}</span><div className="meter"><span style={{ width: `${(doneInTrack / ls.length) * 100}%` }} /></div></div>
        {practiceOpen(learning, lesson.track) && !learning.practice[lesson.track]?.passed && (
          <div className="block hint"><b className="lead2">{tx.practiceOpenLead} · </b>{tx.practiceOpenBody}
            <button type="button" className={`btn2 sm ${styles.selfStart}`} onClick={() => go('practice', { trackId: lesson.track })}>{tx.toPractice}</button></div>
        )}
        <NextCard next={next} lang={lang} onOpen={(id) => go('lesson', { lessonId: id })} onTrack={() => go('track', { trackId: lesson.track })} />
        <button type="button" className={`btnText ${styles.selfCenter}`} onClick={() => go('quiz', { lessonId: content.legacyId ?? lessonId })}><Icon name="target" size={14} />{tx.practice}</button>
        {/* Completion is a toggle both ways: one button whose label follows the state, so
            focus stays on it after each press and "incomplete" is never a dead end. */}
        <button type="button" className={record?.completed ? `btnText ${styles.selfCenter} ${styles.undo}` : `btn2 sm ${styles.selfCenter}`} onClick={() => toggleLessonComplete(lessonId)}>{record?.completed ? tx.undo : tx.redo}</button>
      </>
    );
  }

  // ---------- the work well ----------
  // A quiz question's Try step shows no chart: the lesson's first chart is often
  // labelled with the very answer being asked for.
  const teachWork = step <= 2 ? teach[step as 0 | 1 | 2].work : null;
  const chartIdx = teachWork ? (teachWork.kind === 'charts' ? teachWork.charts : [])
    : step === 6 || (step === 3 && !activity) || !charts.length ? [] : [0];
  // Without a chart to sum up, the takeaway step shows the lesson's first diagram again.
  const diagram = teachWork ? (teachWork.kind === 'diagram' ? teachWork.diagram : null)
    : step === 5 && !charts.length ? teach.map((t) => (t.work.kind === 'diagram' ? t.work.diagram : null)).find(Boolean) ?? null : null;
  let work: ReactNode;
  if (activity && (step === 3 || step === 4 || (step === 5 && activity.kind !== 'sort'))) {
    // The activity's own chart; on the takeaway step, as it ends — answered.
    const shown = step === 5 && activity.kind === 'markLevel' ? (activity.target[0] + activity.target[1]) / 2
      : step === 5 && activity.kind === 'markPoint' ? activity.target
      : step === 5 && activity.kind === 'markPoints' ? { picks: activity.points.map((p) => p.target), active: 0, choice: activity.compare.correct }
      : step === 5 && activity.kind === 'chartChoice' ? activity.correct
      : step === 5 && activity.kind === 'predict' ? activity.likely
      : step === 5 && activity.kind === 'explore' ? { dataset: activity.target.dataset, row: activity.target.row } : answer;
    work = <ActivityWork a={activity} spec={activitySpec} answer={shown} setAnswer={setAnswer}
      verdict={step === 5 ? 'right' : step === 4 ? verdict : null} lang={lang} revealed={revealed || step === 5} phone={phone} />;
  } else if (diagram) {
    work = <DiagramView d={diagram} lang={lang} />;
  } else if (content.cards && chartIdx.length === 0 && step !== 6 && teachWork?.kind !== 'none') {
    work = <ConceptCards cards={content.cards} lang={lang} />;
  } else if (step === 6) {
    const nextSpec = next ? lessonContent(next.id)?.charts[0] : undefined;
    work = (
      <div className={styles.teaser}>
        <div className={`${styles.teaserFrame} ${nextSpec ? styles.teaserDim : ''}`}>
          {nextSpec
            ? <Chart candles={nextSpec.candles as never} variant={nextSpec.variant} options={{ ...nextSpec.options, showVolume: false }} label={nextSpec.label[lang]} height={phone ? 180 : 270} />
            : <TrackArt id={next?.track ?? lesson.track} />}
          {next && <span className={`chip ${styles.teaserChip}`}>{tx.nextTeaser(next.title[lang])}</span>}
        </div>
      </div>
    );
  } else if (chartIdx.length === 0) {
    work = <div className={styles.art}><TrackArt id={lesson.track} /></div>;
  } else if (chartIdx.length === 1) {
    const spec = charts[chartIdx[0]!]!;
    work = (
      <figure className={styles.single}>
        <div className={styles.wsHead}>
          <figcaption className="chip">{step === 5 ? tx.summed : spec.caption?.[lang]}</figcaption>
          <span className="demo">{tx.demo}</span>
          {phone && <button type="button" className={`iconBtn ${styles.fullBtn}`} aria-label={tx.fullChart} onClick={() => setFullChart(spec)}><Icon name="grid" size={16} /></button>}
        </div>
        <div className={styles.chartBox}>
          <Chart candles={spec.candles as never} variant={spec.variant} options={spec.options} label={spec.label[lang]} height={phone ? 260 : undefined} />
        </div>
        {spec.subcaption && <p className={`meta ${styles.wsFoot}`}>{spec.subcaption[lang]}</p>}
      </figure>
    );
  } else {
    work = (
      // Focusable: the gallery scrolls on its own, so a keyboard has to be able to reach it.
      <div className={styles.gallery} tabIndex={0} role="region" aria-label={tx.gallery}>
        {chartIdx.map((i) => {
          const spec = charts[i]!;
          return (
            <figure key={i} className={styles.card}>
              <figcaption className={styles.cardCap}><b>{spec.caption?.[lang]}</b>{spec.subcaption && <span className="meta">{spec.subcaption[lang]}</span>}</figcaption>
              <Chart candles={spec.candles as never} variant={spec.variant} options={spec.options} label={spec.label[lang]} height={phone ? 200 : 220} />
            </figure>
          );
        })}
      </div>
    );
  }

  // ---------- the footer ----------
  const chev = lang === 'he' ? 'chevL' : 'chevR', chevBack = lang === 'he' ? 'chevR' : 'chevL';
  const prevBtn = step === 0
    ? <button type="button" className="btnQuiet" onClick={() => go('track', { trackId: lesson.track })}><Icon name={chevBack} size={16} />{tx.toTrack}</button>
    : <button type="button" className="btnQuiet" onClick={() => goStep(step - 1)}><Icon name={chevBack} size={16} />{phone ? tx.prev : steps[step - 1]}</button>;
  let nextBtn: ReactNode;
  if (step <= 2) nextBtn = <button type="button" className="btn" onClick={() => goStep(step + 1)}>{tx.next(steps[step + 1]!)}<Icon name={chev} size={16} /></button>;
  else if (step === 3) nextBtn = <button type="button" className="btn" disabled={activity ? !isReady(activity, answer) : choice === null} onClick={check}>{activity?.kind === 'predict' ? tx.revealNext : tx.check}</button>;
  else if (step === 4) nextBtn = mustRetry
    ? <button type="button" className="btn" onClick={retry}><Icon name="refresh" size={15} />{tx.retry}</button>
    : <button type="button" className="btn" disabled={verdict === null} onClick={() => goStep(5)}>{tx.next(steps[5]!)}<Icon name={chev} size={16} /></button>;
  else if (step === 5) nextBtn = <button type="button" className="btn" onClick={finish}>{tx.finish}<Icon name={chev} size={16} /></button>;
  else nextBtn = next
    ? <button type="button" className="btn" onClick={() => go('lesson', { lessonId: next.id })}>{tx.nextLesson}<Icon name={chev} size={16} /></button>
    : <button type="button" className="btn" onClick={() => go('track', { trackId: lesson.track })}>{tx.toTrack}<Icon name={chev} size={16} /></button>;

  const title = `${tx.lesson} ${idx + 1} · ${lesson.title[lang]}`;
  return (
    <div className={styles.lesson}>
      <header className={`glass ${styles.lbar}`}>
        <button type="button" className={`btnQuiet sm ${styles.back}`} onClick={() => go('track', { trackId: lesson.track })} aria-label={tx.backToTrack}>
          <Icon name={chevBack} size={16} />{phone ? null : track.title[lang]}
        </button>
        <div className={styles.lbarTitle}>
          <span className="meta">{tx.lesson} <span className="n">{idx + 1}</span> {tx.of} <span className="n">{ls.length}</span></span>
          <b>{lesson.title[lang]}</b>
        </div>
        <nav className={styles.loop} aria-label={tx.stepsAria}>
          {steps.map((s, i) => {
            const st = i === step ? 'cur' : i < Math.max(step, furthest) || record?.completed ? 'done' : undefined;
            return (
              <button key={i} type="button" data-state={st} aria-current={i === step ? 'step' : undefined} title={s} onClick={() => goStep(i === 6 && !record?.completed ? 5 : i)}>
                {st === 'done' ? <Icon name="check" size={12} /> : <i className={styles.ld} aria-hidden="true" />}<span className={styles.lt}>{s}</span>
              </button>
            );
          })}
        </nav>
        <button ref={aiBtnRef} type="button" className={`btnAi ${styles.ai}`} onClick={() => (drawer ? closeDrawer() : openDrawer())} aria-expanded={drawer} aria-label={phone ? tx.tutor : undefined}><Icon name="spark" size={15} />{phone ? null : tx.tutor}</button>
      </header>
      {phone && (
        <div className={styles.mLoop} aria-hidden="true">
          <div className={styles.mLoopHead}><span className="eyebrow">{steps[step]}</span><span className="meta">{tx.step(step + 1)}</span></div>
          <div className="segs">{steps.map((_, i) => <i key={i} className={i < step ? 'done' : i === step ? 'cur' : undefined} />)}</div>
        </div>
      )}
      <main className={drawer ? `${styles.lbody} ${styles.withDrawer}` : styles.lbody} id="workspace" aria-label={title}>
        {/* Phone: the answer's feedback rises as a sheet over the chart (Artifact 15.3). */}
        {phone && step === 4 && verdict && <div className={styles.scrim} aria-hidden="true" />}
        {/* Focusable and named: a long step scrolls inside the pane, and a keyboard has to be able to reach it. */}
        {/* The glass is the frame; the text scrolls inside it. When the glass element itself
            scrolled, its edge ring and sheen (absolutely placed) scrolled with the text and cut across it. */}
        <section className={`glass ${styles.lpane}`} aria-label={steps[step]} data-sheet={phone && step === 4 && verdict ? true : undefined}>
          <div className={styles.paneScroll} ref={paneRef} tabIndex={0}>{pane}</div>
        </section>
        <section className={`well ${styles.lwork}`} data-step={step}>{work}</section>
        {drawer && (
          <div className={sheetFull ? `${styles.drawerSlot} ${styles.sheetFull}` : styles.drawerSlot}>
            <Suspense fallback={<div className={`glass ${styles.drawerLoading}`} role="status"><span className="typing"><i /><i /><i /></span></div>}>
              <TutorDrawer lessonId={lessonId} step={step} action={drawerAction} onActionDone={() => setDrawerAction(null)} onClose={closeDrawer} onFullPage={() => go('ai')}
                {...(phone ? { expanded: sheetFull, onToggleExpand: () => setSheetFull((v) => !v) } : {})} />
            </Suspense>
          </div>
        )}
      </main>
      {fullChart && (
        <div className={styles.fullChart} role="dialog" aria-modal="true" aria-label={fullChart.caption?.[lang] ?? tx.fullChart}>
          <div className={`glass ${styles.fullHead}`}>
            <b>{fullChart.caption?.[lang]}</b><span className="demo">{tx.demo}</span>
            <button type="button" className={`btnQuiet sm ${styles.fullClose}`} onClick={() => setFullChart(null)} autoFocus><Icon name="x" size={16} />{tx.close}</button>
          </div>
          <div className={styles.fullBody}><Chart candles={fullChart.candles as never} variant={fullChart.variant} options={fullChart.options} label={fullChart.label[lang]} /></div>
          <span className={`meta ${styles.fullHint}`}>{tx.rotate}</span>
        </div>
      )}
      {toast && (
        <div className={`glass toast ${styles.toast}`} role="status">
          <span className={styles.okIc}><Icon name="check" size={18} /></span>
          <b>{tx.backAt(step + 1, steps[step]!)}</b>
          <button type="button" className="btnText" onClick={() => openDrawer()}>{tx.reopen}</button>
        </div>
      )}
      <footer className={`glass ${styles.lfoot}`}>
        {prevBtn}
        {!phone && <span className="meta">{tx.step(step + 1)}</span>}
        {nextBtn}
      </footer>
    </div>
  );
}

function Choices({ q, lang, value, onChange, verdict }: { q: QuizQuestion; lang: Lang; value: string | null; onChange?: (k: string) => void; verdict?: Verdict }) {
  return (
    <div className={styles.choices} role="radiogroup" aria-label={q.question[lang]}>
      {q.options.map((o, i) => {
        const on = value === o.key;
        const cls = verdict ? (on ? verdict : verdict === 'right' ? 'dim' : '') : on ? 'sel' : '';
        return (
          <button key={o.key} type="button" role="radio" aria-checked={on} className={`choice ${cls}`} disabled={!onChange} onClick={() => onChange?.(o.key)}>
            <span className="key" aria-hidden="true">{KEYS[lang][i]}</span><span className={styles.grow}>{o.text[lang]}</span>
            {verdict && on && <Icon name={verdict === 'right' ? 'check' : 'x'} size={16} />}
          </button>
        );
      })}
    </div>
  );
}

function NextCard({ next, lang, onOpen, onTrack }: { next: CurriculumLesson | null; lang: Lang; onOpen: (id: string) => void; onTrack: () => void }) {
  const tx = TX[lang];
  if (!next) return <button type="button" className="btn" onClick={onTrack}>{tx.toTrack}</button>;
  return (
    <div className={`glass ${styles.nextCard}`}>
      <span className="label">{tx.upNext}</span>
      <b className={styles.nextTitle}>{next.title[lang]}</b>
      <span className="meta"><Icon name="clock" size={12} /> {formatDuration(next.minutes, lang)} · {LEVELS[next.level][lang]}{hasContent(next.id) ? '' : ` · ${tx.soon}`}</span>
      <button type="button" className="btn" onClick={() => onOpen(next.id)}>{tx.nextLesson}<Icon name={lang === 'he' ? 'chevL' : 'chevR'} size={16} /></button>
      <button type="button" className={`btnText ${styles.selfCenter}`} onClick={onTrack}>{tx.toTrack}</button>
    </div>
  );
}
