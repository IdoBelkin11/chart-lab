import { useEffect, useState } from 'react';
import type { LessonChartSpec } from '@core/charts/lessonCharts';
import {
  LEVELS, TOTAL_LESSONS, TRACKS, formatDuration, lessonById, lessonsOf, trackById
} from '@core/curriculum/curriculum';
import type { CurriculumLesson, TrackId } from '@core/curriculum/curriculum';
import { hasContent } from '@core/curriculum/trackInfo';
import { recommend } from '@core/curriculum/recommend';
import {
  activeTracks, completedIn, resumeLesson, totalCompleted, trackStatus, LESSON_STEPS
} from '@core/progress/learning';
import { useAppState } from '@ui/app/AppState';
import { useRoute } from '@ui/hooks/useRoute';
import { useOpenTutor } from '@ui/shell/AiLauncher';
import { Icon } from '@ui/components/icons/Icons';
import type { IconName } from '@ui/components/icons/Icons';
import { Chart } from '@ui/components/charts';
import { useMedia, PHONE } from '@ui/hooks/useMedia';
import { TrackArt, TrackCard, TrackMono } from '@ui/components/curriculum/Curriculum';
import styles from './HomeRoute.module.css';

const TX = {
  he: {
    hiFirst: 'ברוכים הבאים לצ׳ארט לאב', subFirst: 'לומדים את שוק ההון בידיים: בכל שיעור מפעילים משהו — גרף, דוח, תיק.',
    hiBack: 'ברוכים השבים', subBack: (d: number) => `השלמתם ${d} מתוך ${TOTAL_LESSONS} שיעורים. הנה הצעד הבא.`,
    startHere: 'מתחילים כאן', firstLesson: 'השיעור הראשון שלכם', startCta: 'התחילו את השיעור הראשון', notSure: 'לא בטוחים מאיפה להתחיל?',
    noPrior: 'בלי ידע קודם', firstPitch: 'מה ההבדל בין מניה, אג״ח, קרן סל ומדד — ואיך כל אחד מהם עובד בפועל.',
    what: ['גרפים שמסמנים עליהם', 'דוחות שקוראים שורה־שורה', 'מורה שמכיר את השיעור'],
    whatSub: ['מזהים מגמה, תמיכה ופריצה — עם משוב מיידי', 'מבינים מאיפה מגיע כל מספר ברווח', 'שואלים על מה שעל המסך ומקבלים הסבר'],
    resume: 'ממשיכים מאיפה שעצרתם', lesson: 'שיעור', of: 'מתוך', nextStep: 'השלב הבא', left: (n: number) => `נשארו כ־${n} דקות`,
    continueLesson: 'המשך לשיעור', trackPage: 'לעמוד המסלול',
    next: 'הצעד הבא', practice: 'חזרה על מה שלמדתם', practiceSub: 'שאלות מהשיעורים שכבר עברתם', tool: 'מחשבון גודל פוזיציה', toolSub: 'כמה מניות לקנות מסיכון מוגדר',
    ai: (x: string) => `שאלו את המורה על ${x}`, aiSub: 'מכיר את השיעור שבו עצרתם',
    inProgress: 'בתהליך', nextLabel: 'הבא', lessonsLeft: (n: number) => `${n} שיעורים נשארו`, cont: 'המשך',
    tracks: 'כל המסלולים', tracksMeta: '6 מסלולים · 47 שיעורים'
  },
  en: {
    hiFirst: 'Welcome to Chart Lab', subFirst: 'Learn the market hands-on: every lesson has you operate something — a chart, a statement, a portfolio.',
    hiBack: 'Welcome back', subBack: (d: number) => `You've completed ${d} of ${TOTAL_LESSONS} lessons. Here's your next step.`,
    startHere: 'START HERE', firstLesson: 'Your first lesson', startCta: 'Start your first lesson', notSure: 'Not sure where to start?',
    noPrior: 'No prior knowledge', firstPitch: 'Stock vs bond vs ETF vs index — and how each one actually works.',
    what: ['Charts you mark up', 'Statements you read line by line', 'A tutor that knows the lesson'],
    whatSub: ['Spot trend, support and breakouts with instant feedback', 'See where every number in profit comes from', 'Ask about what is on screen and get an explanation'],
    resume: 'PICK UP WHERE YOU LEFT OFF', lesson: 'Lesson', of: 'of', nextStep: 'Next step', left: (n: number) => `about ${n} min left`,
    continueLesson: 'Continue lesson', trackPage: 'Track page',
    next: 'Next step', practice: 'Review what you learned', practiceSub: 'Questions from the lessons you have done', tool: 'Position size calculator', toolSub: 'How many shares, from a defined risk',
    ai: (x: string) => `Ask the tutor about ${x}`, aiSub: 'It knows the lesson you stopped at',
    inProgress: 'In progress', nextLabel: 'Next', lessonsLeft: (n: number) => `${n} lessons left`, cont: 'Continue',
    tracks: 'All tracks', tracksMeta: '6 tracks · 47 lessons'
  }
} as const;

/**
 * Home (Artifact: 03 · Home & Dashboard). Two faces:
 *
 *   · first visit — the first lesson, and the questionnaire for anyone not
 *     sure where to start
 *   · returning — "continue where you left off" with that lesson's own step
 *     names, the next step, the tracks in progress, and every track with the
 *     recommended one marked
 *
 * Everything shown is derived from real progress; nothing is decorative data.
 */
export function HomeRoute() {
  const { lang, learning } = useAppState();
  const { go } = useRoute();
  const tx = TX[lang];
  const done = totalCompleted(learning);
  const first = done === 0 && Object.keys(learning.lessons).length === 0;
  const resumeId = resumeLesson(learning);
  const resume = resumeId ? lessonById(resumeId) : undefined;

  // The recommended track: the questionnaire's answer if there is one, else
  // Foundations for a newcomer, else the first track still to finish.
  const rec: TrackId =
    learning.onboarding?.answers ? recommend(learning.onboarding.answers).top
      : first ? 'F'
      : TRACKS.find((t) => trackStatus(learning, t.id) !== 'done' && trackStatus(learning, t.id) !== 'locked')?.id ?? 'F';

  const active = activeTracks(learning);

  return (
    <div className={styles.page}>
      <header className={styles.greeting}>
        <h1 className="h1">{first ? tx.hiFirst : tx.hiBack}</h1>
        <p className="txt">{first ? tx.subFirst : tx.subBack(done)}</p>
      </header>

      {first || !resume ? <FirstHero /> : <ContinueHero lesson={resume} />}

      {first ? (
        <section className={styles.whatRow}>
          {tx.what.map((w, i) => (
            <div key={w} className={`card solid ${styles.whatCard}`}>
              <span className={styles.whatIcon}><Icon name={(['chart', 'book', 'spark'] as IconName[])[i]!} size={19} /></span>
              <div><b className={styles.whatTitle}>{w}</b><p className="small">{tx.whatSub[i]}</p></div>
            </div>
          ))}
        </section>
      ) : (
        <NextSteps lesson={resume} />
      )}

      {active.length > 1 && (
        <section className={styles.section}>
          <h2 className="label">{tx.inProgress} · <span className="n">{active.length}</span></h2>
          <div className={styles.twoCol}>
            {active.map((id) => {
              const ls = lessonsOf(id), d = completedIn(learning, id);
              const nxt = ls.find((l) => !learning.lessons[l.id]?.completed && hasContent(l.id)) ?? ls.find((l) => !learning.lessons[l.id]?.completed);
              return (
                <button key={id} type="button" className={`card glass ${styles.progressCard}`} onClick={() => go('track', { trackId: id })}>
                  <TrackMono id={id} size={48} lang={lang} />
                  <span className={styles.progressBody}>
                    <span className={styles.progressHead}><b>{trackById(id).title[lang]}</b><span className="meta n">{d}/{ls.length}</span></span>
                    <span className="meter"><span style={{ width: `${(d / ls.length) * 100}%` }} /></span>
                    {nxt && <span className="small">{tx.nextLabel}: <b className={styles.strong}>{nxt.title[lang]}</b> · {tx.lessonsLeft(ls.length - d)}</span>}
                  </span>
                  <span className="btn2 sm">{tx.cont}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <div className={styles.sectionHead}><h2 className="label">{tx.tracks}</h2><span className="meta">{tx.tracksMeta}</span></div>
        <div className={styles.grid}>
          {TRACKS.map((t) => (
            <TrackCard key={t.id} id={t.id} status={trackStatus(learning, t.id)} done={completedIn(learning, t.id)} lang={lang}
              recommended={t.id === rec && trackStatus(learning, t.id) !== 'done'} onOpen={() => go('track', { trackId: t.id })} />
          ))}
        </div>
      </section>
    </div>
  );
}

/** First visit: the first lesson, and the way into the questionnaire. */
function FirstHero() {
  const { lang } = useAppState();
  const { go } = useRoute();
  const tx = TX[lang];
  const f1 = lessonsOf('F')[0]!;
  const chips: Array<[string, string]> = lang === 'he'
    ? [['מניה', 'var(--info)'], ['אג״ח', 'var(--adv)'], ['קרן סל', 'var(--learn)'], ['מדד', 'var(--risk)']]
    : [['Stock', 'var(--info)'], ['Bond', 'var(--adv)'], ['ETF', 'var(--learn)'], ['Index', 'var(--risk)']];
  return (
    <section className={`glass ${styles.hero}`}>
      <div className={styles.heroText}>
        <span className="eyebrow">{tx.startHere}</span>
        <span className="meta">{tx.firstLesson} · {trackById('F').title[lang]}</span>
        <h2 className="h1">{f1.title[lang]}</h2>
        <p className="txt">{tx.firstPitch}</p>
        <div className={styles.heroMeta}>
          <span><Icon name="clock" size={13} /> {formatDuration(f1.minutes, lang)}</span>
          <span>{LEVELS[1][lang]}</span>
          <span>{tx.noPrior}</span>
        </div>
        <div className={styles.heroCta}>
          <button type="button" className="btn lg" onClick={() => go('lesson', { lessonId: f1.id })}>{tx.startCta}<Icon name={lang === 'he' ? 'chevL' : 'chevR'} size={17} /></button>
          <button type="button" className="btnText" onClick={() => go('onboarding')}>{tx.notSure}</button>
        </div>
      </div>
      <div className={styles.firstArt} aria-hidden="true">
        {chips.map(([n, c]) => (
          <div key={n} className={styles.assetTile} style={{ boxShadow: `inset 0 0 0 1.5px ${c}` }}>
            <b style={{ color: c }}>{n}</b><span /><span />
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * A lesson's first chart, fetched with the lesson content rather than with the
 * home page (the content is a separate chunk). undefined while loading; null
 * when the lesson has no chart.
 */
function useFirstChart(lessonId: string) {
  const [chart, setChart] = useState<LessonChartSpec | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    void import('@core/lessons/content').then((m) => { if (live) setChart(m.lessonContent(lessonId)?.charts[0] ?? null); });
    return () => { live = false; };
  }, [lessonId]);
  return chart;
}

/** "Continue where you left off": the lesson, its own step names, what is next, and its chart. */
function ContinueHero({ lesson }: { lesson: CurriculumLesson }) {
  const { lang, learning } = useAppState();
  const { go } = useRoute();
  const tx = TX[lang];
  const ls = lessonsOf(lesson.track), i = ls.indexOf(lesson);
  const step = learning.lessons[lesson.id]?.step ?? 0;
  const left = Math.max(3, Math.round(lesson.minutes * (1 - step / LESSON_STEPS)));
  const chart = useFirstChart(lesson.id);
  const phone = useMedia(PHONE);
  return (
    <section className={`glass ${styles.hero}`}>
      <div className={styles.heroText}>
        <span className="eyebrow">{tx.resume}</span>
        <h2 className="h1">{lesson.title[lang]}</h2>
        <span className={`small ${styles.trackLine}`}>
          <TrackMono id={lesson.track} size={26} lang={lang} />
          <span>{trackById(lesson.track).title[lang]} · {tx.lesson} <span className="n">{i + 1}</span> {tx.of} <span className="n">{ls.length}</span></span>
        </span>
        {lesson.steps && (
          <div className={styles.stepBlock}>
            <div className="segs" aria-hidden="true">
              {lesson.steps[lang].map((_, k) => <i key={k} className={k < step ? 'done' : k === step ? 'cur' : ''} />)}
            </div>
            <span className="meta">{tx.nextStep}: <b className={styles.strong}>{lesson.steps[lang][step]}</b> · {tx.left(left)}</span>
          </div>
        )}
        <div className={styles.heroCta}>
          <button type="button" className="btn lg" onClick={() => go('lesson', { lessonId: lesson.id })}>{tx.continueLesson}<Icon name={lang === 'he' ? 'chevL' : 'chevR'} size={17} /></button>
          <button type="button" className="btn2" onClick={() => go('track', { trackId: lesson.track })}>{tx.trackPage}</button>
        </div>
      </div>
      <div className={styles.thumb}>
        {chart === undefined ? null : chart
          ? <Chart candles={chart.candles as never} variant={chart.variant} options={phone ? { ...chart.options, showVolume: false } : chart.options} label={chart.label[lang]} height={phone ? 110 : 230} />
          : <div className={styles.artWrap}><TrackArt id={lesson.track} /></div>}
      </div>
    </section>
  );
}

/** Three honest next steps: review, a tool, and the tutor on the current lesson. */
function NextSteps({ lesson }: { lesson?: CurriculumLesson }) {
  const { lang } = useAppState();
  const { go } = useRoute();
  const openTutor = useOpenTutor();
  const tx = TX[lang];
  const topic = lesson ? lesson.title[lang].split(':')[0]! : '';
  return (
    <section className={styles.section}>
      <h2 className="label">{tx.next}</h2>
      <div className={styles.threeCol}>
        <button type="button" className={`card solid ${styles.nextCard}`} onClick={() => go('quiz')}>
          <span className={styles.nextIcon} style={{ background: 'var(--info-dim)', color: 'var(--info)' }}><Icon name="target" size={20} /></span>
          <span className={styles.nextBody}><b>{tx.practice}</b><span className="small">{tx.practiceSub}</span></span>
          <Icon name={lang === 'he' ? 'chevL' : 'chevR'} size={16} />
        </button>
        <button type="button" className={`card solid ${styles.nextCard}`} onClick={() => go('tools', { view: 'position' })}>
          <span className={styles.nextIcon} style={{ background: 'var(--wash-2)' }}><Icon name="calc" size={20} /></span>
          <span className={styles.nextBody}><b>{tx.tool}</b><span className="small">{tx.toolSub}</span></span>
          <Icon name={lang === 'he' ? 'chevL' : 'chevR'} size={16} />
        </button>
        <button type="button" className={`card ${styles.nextCard} ${styles.aiCard}`} onClick={openTutor}>
          <span className={styles.aiMark}><Icon name="spark" size={19} /></span>
          <span className={styles.nextBody}><b>{tx.ai(topic)}</b><span className="small">{tx.aiSub}</span></span>
          <Icon name={lang === 'he' ? 'chevL' : 'chevR'} size={16} />
        </button>
      </div>
    </section>
  );
}
