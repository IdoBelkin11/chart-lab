import { useMemo, useState } from 'react';
import type { Lang } from '@core/types/kb';
import { formatDuration, lessonsOf, trackById, trackMinutes } from '@core/curriculum/curriculum';
import type { TrackId } from '@core/curriculum/curriculum';
import {
  EXPERIENCE, GOALS, INTERESTS, TRACK_WHY, WEEKLY, pathFor, recommend
} from '@core/curriculum/recommend';
import type { Experience, Goal, Interest, OnboardingAnswers, WeeklyMinutes } from '@core/curriculum/recommend';
import { chartsForLesson } from '@core/charts/lessonCharts';
import { useAppState } from '@ui/app/AppState';
import { Chart } from '@ui/components/charts';
import { useMedia, PHONE } from '@ui/hooks/useMedia';
import { useRoute } from '@ui/hooks/useRoute';
import { Icon } from '@ui/components/icons/Icons';
import type { IconName } from '@ui/components/icons/Icons';
import { TrackMono, trackColor } from '@ui/components/curriculum/Curriculum';
import styles from './OnboardingRoute.module.css';

const TX = {
  he: {
    brand: 'צ׳ארט לאב', progressAria: 'התקדמות בשאלון', qNames: ['תחומי עניין', 'ניסיון', 'מטרה', 'זמן', 'המסלול שלכם'],
    skip: 'דילוג לדף הבית', back: 'חזרה', next: 'המשך', question: (k: number) => `שאלה ${k} מתוך 4`, chosen: (n: number) => `נבחרו ${n}`,
    welcomeEyebrow: 'שוק ההון, בידיים', welcomeTitle: 'כל שיעור כאן הוא משהו שעושים — לא סרטון שצופים בו.',
    welcomeBody: '6 מסלולים, 47 שיעורים: מהפקודה הראשונה ועד דוחות כספיים ואופציות. בלי המלצות השקעה ובלי כסף אמיתי — לומדים להבין.',
    fourQ: '4 שאלות קצרות, ואז מסלול שמתאים לכם', fourQSub: 'כדקה · אפשר לשנות כל תשובה אחר כך', toFirstQ: 'לשאלה הראשונה', free: 'חינם · בלי הרשמה כדי להתחיל',
    q1: 'מה הכי מעניין אתכם ללמוד?', q1Sub: 'אפשר לבחור יותר מאחד. זה קובע איזה מסלול נמליץ עליו אחרי הבסיס.',
    q2: 'כמה ניסיון יש לכם?', q2Sub: 'אין תשובה לא נכונה — זה רק קובע אם כדאי להתחיל מהבסיס או לדלג עליו.',
    q2Meta: { none: 'מתחילים מהבסיס', some: 'בסיס מומלץ', pro: 'אפשר לדלג בתרגול' }, skipNote: 'דילוג על הבסיס · ', skipNoteBody: 'תרגול של 5 שאלות מתוך "יסודות השוק". עוברים ב־4 — והמסלול מסומן כהושלם.',
    q3: 'מה אתם רוצים שיהיה אחרי?', q3Sub: 'בחרו את המטרה הכי קרובה. היא מכריעה בין מסלולים שמעניינים אתכם באותה מידה.',
    q4: 'כמה זמן בשבוע נוח לכם?', q4Sub: 'לפי זה נחשב כמה שבועות ייקח כל מסלול. אין תזכורות מציקות ואין "רצפים".', weeks: (n: number) => `כ־${n} שבועות`,
    showMe: 'להראות לי את המסלול',
    shaping: 'המסלול מתגבש', shapingSub: 'מתעדכן עם כל תשובה', base: 'בסיס', lead: 'מוביל', afterRisk: 'אחרי סיכון', yourAnswers: 'התשובות שלכם', perWeek: 'בשבוע',
    baseText: { required: 'בסיס · מתחילים כאן', recommended: 'בסיס · מומלץ לפני', optional: 'בסיס · אפשר לדלג בתרגול' },
    byAnswers: 'לפי 4 התשובות שלכם', yourTrack: (t: string) => `המסלול שלכם: ${t}`, change: 'לשנות תשובות', recommended: 'המסלול המומלץ לכם',
    lessons: 'שיעורים', atYourPace: (n: number) => `כ־${n} שבועות בקצב שלכם`, whyThis: 'למה דווקא הוא',
    qTag: (k: number) => `שאלה ${k}`, chose: (x: string) => `בחרתם "${x}"`, goalIs: (x: string) => `המטרה: "${x}"`, weekly: (x: string) => `${x} בשבוע`,
    weeksNote: (n: number, base: number | null) => `כ־${n} שבועות למסלול כולו${base ? `, אחרי ${base} שבועות של בסיס` : ''}.`,
    baseLine: { required: ['מתחילים כאן', 'עוד לא השקעתם — 5 שיעורים קצרים נותנים את המילים שכל מסלול מניח.'], recommended: ['מומלץ לפני', 'השקעתם קצת — 5 שיעורים קצרים סוגרים פערים. מכירים? תרגול דילוג של 5 שאלות.'], optional: ['אפשר לדלג', 'יש לכם בסיס — תרגול של 5 שאלות, עוברים ב־4, ומתחילים ישר במסלול.'] },
    after: 'אחר כך, לפי ההתאמה', alsoFits: 'גם מתאים לכם', dAsked: 'ביקשתם — נפתח אחרי סיכון', notLocking: 'ההמלצה לא נועלת כלום — כל מסלול פתוח זמין מהיום הראשון.',
    fullRoadmap: 'מפת הדרכים המלאה', startBase: 'להתחיל: שיעור 1 ביסודות', toSkipTest: 'לתרגול הדילוג', skipTest: 'תרגול דילוג · 5 שאלות', startBaseM: 'להתחיל: שיעור 1', firstBase: (t: string) => `קודם: ${t}`, leadingNow: 'מוביל כרגע: ', yourTrackM: 'המסלול שלכם', skipM: 'דילוג',
    welcomeTools: ['ספר פקודות', 'דוח רווח והפסד', 'בונה תיק'], markSupport: 'סמנו את רמת התמיכה', welcomeTitleM: 'כל שיעור כאן הוא משהו שעושים.',
    sortChip: 'יסודות · שיעור 1', sortKind: 'תרגיל מיון', sortAssets: ['אג״ח ממשלתי', 'מניית בנק', 'S&P 500', 'קרן סל על זהב'], sortBins: ['מניה', 'אג״ח', 'קרן סל', 'מדד'], sortNote: 'גוררים כל נכס לסוג שלו — ומקבלים הסבר על כל אחד.',
    roadmapEyebrow: 'מפת הדרכים שלכם', roadmapTitle: (x: string) => `כך זה נראה ב־${x} בשבוע`, roadmapSub: 'הערכה לפי אורך השיעורים. את הסדר ואת הקצב אפשר לשנות מתי שרוצים.',
    yours: 'המומלץ לכם', weeksRange: 'שבועות', toFirstLesson: 'לשיעור הראשון',
    ready: 'הכול מוכן', firstWaits: (t: string) => `השיעור הראשון מחכה: ${t}`, firstBody: 'בלי ידע קודם. בסוף השיעור תדעו להסביר את ההבדל בין מניה, אג״ח, קרן סל ומדד.',
    thenTrack: ['אחרי הבסיס ממשיכים ל', ' — המסלול שהומלץ לכם.'], startNow: 'להתחיל עכשיו', home: 'לדף הבית', saved: 'ההתקדמות נשמרת במכשיר. אפשר לחזור לכל שלב.',
    langAria: 'שפה'
  },
  en: {
    brand: 'Chart Lab', progressAria: 'Questionnaire progress', qNames: ['Interests', 'Experience', 'Goal', 'Time', 'Your track'],
    skip: 'Skip to home', back: 'Back', next: 'Continue', question: (k: number) => `Question ${k} of 4`, chosen: (n: number) => `${n} selected`,
    welcomeEyebrow: 'THE MARKET, HANDS-ON', welcomeTitle: 'Every lesson here is something you do — not a video you watch.',
    welcomeBody: '6 tracks, 47 lessons: from your first order to financial statements and options. No investment advice and no real money — just understanding.',
    fourQ: '4 short questions, then a track that fits you', fourQSub: 'About a minute · you can change any answer later', toFirstQ: 'To the first question', free: 'Free · no sign-up to start',
    q1: 'What would you most like to learn?', q1Sub: 'Pick as many as you like. It decides which track we recommend after the basics.',
    q2: 'How much experience do you have?', q2Sub: 'There is no wrong answer — it only decides whether to start with the basics or skip them.',
    q2Meta: { none: 'Start with the basics', some: 'Basics recommended', pro: 'Can skip with a test' }, skipNote: 'Skipping the basics · ', skipNoteBody: 'A 5-question test from Market Foundations. Pass with 4 and the track is marked complete.',
    q3: 'What do you want to be able to do?', q3Sub: 'Pick the closest goal. It decides between tracks that interest you equally.',
    q4: 'How much time a week suits you?', q4Sub: 'We use it to estimate how many weeks each track takes. No nagging reminders, no "streaks".', weeks: (n: number) => `about ${n} weeks`,
    showMe: 'Show me my track',
    shaping: 'Your path is taking shape', shapingSub: 'Updates with every answer', base: 'Basics', lead: 'Leading', afterRisk: 'After Risk', yourAnswers: 'Your answers', perWeek: 'a week',
    baseText: { required: 'Basics · start here', recommended: 'Basics · recommended first', optional: 'Basics · skippable with a test' },
    byAnswers: 'BASED ON YOUR 4 ANSWERS', yourTrack: (t: string) => `Your track: ${t}`, change: 'Change answers', recommended: 'Recommended for you',
    lessons: 'lessons', atYourPace: (n: number) => `about ${n} weeks at your pace`, whyThis: 'Why this one',
    qTag: (k: number) => `Question ${k}`, chose: (x: string) => `You chose "${x}"`, goalIs: (x: string) => `Your goal: "${x}"`, weekly: (x: string) => `${x} a week`,
    weeksNote: (n: number, base: number | null) => `About ${n} weeks for the whole track${base ? `, after ${base} weeks of basics` : ''}.`,
    baseLine: { required: ['Start here', "You haven't invested yet — 5 short lessons give you the vocabulary every track assumes."], recommended: ['Recommended first', 'You have invested a little — 5 short lessons close the gaps. Know it already? Skip it with a 5-question test.'], optional: ['Skippable', 'You have the basics — a 5-question test, pass with 4, and start the track directly.'] },
    after: 'Then, by fit', alsoFits: 'Also a good fit', dAsked: 'You asked — opens after Risk', notLocking: 'The recommendation locks nothing — every open track is available from day one.',
    fullRoadmap: 'Full roadmap', startBase: 'Start: Lesson 1 of the basics', toSkipTest: 'To the skip test', skipTest: 'Skip test · 5 questions', startBaseM: 'Start: Lesson 1', firstBase: (t: string) => `First: ${t}`, leadingNow: 'Leading now: ', yourTrackM: 'Your track', skipM: 'Skip',
    welcomeTools: ['Order book', 'Income statement', 'Portfolio builder'], markSupport: 'Mark the support level', welcomeTitleM: 'Every lesson here is something you do.',
    sortChip: 'Basics · Lesson 1', sortKind: 'Sorting exercise', sortAssets: ['Government bond', 'Bank stock', 'S&P 500', 'Gold ETF'], sortBins: ['Stock', 'Bond', 'ETF', 'Index'], sortNote: 'Drag each asset to its type — and get an explanation for each one.',
    roadmapEyebrow: 'YOUR ROADMAP', roadmapTitle: (x: string) => `This is what ${x} a week looks like`, roadmapSub: 'Estimated from lesson length. You can change the order and pace any time.',
    yours: 'Recommended', weeksRange: 'weeks', toFirstLesson: 'To the first lesson',
    ready: 'ALL SET', firstWaits: (t: string) => `Your first lesson: ${t}`, firstBody: 'No prior knowledge needed. By the end you can explain the difference between a stock, a bond, an ETF and an index.',
    thenTrack: ['After the basics you continue with ', ' — the track recommended for you.'], startNow: 'Start now', home: 'Go to home', saved: 'Progress is saved on this device. You can come back to any step.',
    langAria: 'Language'
  }
} as const;


const INTEREST_ICON: Record<Interest, IconName> = { T: 'chart', P: 'book', R: 'target', M: 'globe', D: 'shield', unsure: 'info' };
const TOOL_ICON: IconName[] = ['list', 'book', 'target'];
const BIN_COLOR = ['var(--info)', 'var(--adv)', 'var(--learn)', 'var(--risk)'];
const EMPTY: OnboardingAnswers = { interests: [], experience: null, goal: null, time: null };
type Tx = (typeof TX)[Lang];

/**
 * First-run onboarding (Artifact: 04 · Onboarding): welcome, four questions
 * with a live "your path is taking shape" panel, one spotlighted track with
 * the reason behind each answer, the roadmap, and the first lesson.
 *
 * The recommendation is @core/curriculum/recommend — the same rules the
 * design's live prototype runs — so the panel and the result always agree.
 * Answers are saved once the learner reaches the result.
 */
export function OnboardingRoute() {
  const { lang, setLang, saveOnboarding, learning } = useAppState();
  const { go } = useRoute();
  const phone = useMedia(PHONE);
  const tx = TX[lang];
  const [step, setStep] = useState(0);
  const [a, setA] = useState<OnboardingAnswers>(() => learning.onboarding?.answers ?? EMPTY);
  const answered = [a.interests.length > 0, !!a.experience, !!a.goal, !!a.time];
  const r = recommend(a);
  const fwdIcon = lang === 'he' ? 'chevL' : 'chevR';
  const backIcon = lang === 'he' ? 'chevR' : 'chevL';

  const show = (n: number) => { setStep(n); window.scrollTo(0, 0); };
  const toResult = () => { saveOnboarding(a); show(5); };
  // Skippable basics lead to Foundations, where its practice (the skip test) lives.
  const toSkipTest = () => go('track', { trackId: 'F' });

  // ---- chrome ----
  const q = Math.min(step - 1, 4); // the 5-item progress: 4 questions + "your track"
  const header = (
    <header className={styles.top}>
      <div className={styles.brand}><span className={styles.brandMark} aria-hidden="true">▼▲</span>{!phone && <span className={styles.brandName}>{tx.brand}</span>}</div>
      {step > 0 && (phone ? (
        <div className={styles.mBar}>
          <div className="segs" aria-hidden="true">{[0, 1, 2, 3, 4].map((i) => <i key={i} className={i < q ? 'done' : i === q ? 'cur' : undefined} />)}</div>
          <span className="meta">{step <= 4 ? tx.question(step) : tx.yourTrackM}</span>
        </div>
      ) : (
        <nav aria-label={tx.progressAria} className={styles.progress}>
          {tx.qNames.map((n, i) => {
            const st = i < q ? 'done' : i === q ? 'cur' : undefined;
            return (
              <span key={n} className={styles.progressStep}>
                <span className={styles.progressItem} data-state={st} aria-current={st === 'cur' ? 'step' : undefined}>
                  {st === 'done' ? <Icon name="check" size={13} /> : <span className={`n ${styles.progressN}`}>{i + 1}</span>}{n}
                </span>
                {i < 4 && <span className={styles.progressSep} aria-hidden="true" />}
              </span>
            );
          })}
        </nav>
      ))}
      <div className={styles.topCtrls}>
        {!phone && (
          <div className="seg" role="group" aria-label={tx.langAria}>
            {(['he', 'en'] as const).map((c) => <button key={c} type="button" lang={c} aria-pressed={lang === c} onClick={() => setLang(c)}>{c === 'he' ? 'עב' : 'EN'}</button>)}
          </div>
        )}
        {(phone || (step > 0 && step < 5)) && <button type="button" className={`btnText ${styles.skip}`} onClick={() => go('home')}>{phone ? tx.skipM : tx.skip}</button>}
      </div>
    </header>
  );

  const primary = (label: string, onClick: () => void, disabled = false) => (
    <button type="button" className="btn lg" onClick={onClick} disabled={disabled}>{label}<Icon name={fwdIcon} size={17} /></button>
  );
  const backBtn = <button type="button" className="btnQuiet" onClick={() => show(Math.max(0, step - 1))}><Icon name={backIcon} size={16} />{tx.back}</button>;
  const footer = (cta: React.ReactNode, { hint, second, showBack = true }: { hint?: string; second?: React.ReactNode; showBack?: boolean } = {}) =>
    phone ? (
      <div className={`glass ${styles.lnav}`}>{showBack && backBtn}{cta}</div>
    ) : (
      <footer className={styles.foot}>
        {showBack ? backBtn : <span />}
        <div className={styles.footEnd}>{hint && <span className="meta">{hint}</span>}{second}{cta}</div>
      </footer>
    );

  // ---- screens ----
  let body: React.ReactNode, foot: React.ReactNode = null, wide = false;
  if (step === 0) {
    body = <Welcome tx={tx} lang={lang} phone={phone} />;
    foot = footer(primary(tx.toFirstQ, () => show(1)), { hint: tx.free, showBack: false });
  } else if (step <= 4) {
    wide = true;
    const next = step === 4 ? toResult : () => show(step + 1);
    body = (
      <div className={styles.qLayout}>
        <div className={styles.qMain}>
          <QHead k={step} tx={tx} phone={phone} />
          <Question k={step} a={a} setA={setA} lang={lang} tx={tx} top={r.top} />
        </div>
        {phone
          ? step > 1 && <div className={`glass ${styles.leadPill}`}><span className={styles.sparkIc}><Icon name="spark" size={15} /></span><span className="small">{tx.leadingNow}<b>{trackById(r.top).title[lang]}</b></span><TrackMono id={r.top} size={30} lang={lang} /></div>
          : <Shaping answers={a} upto={step} lang={lang} />}
      </div>
    );
    foot = footer(primary(step === 4 ? tx.showMe : tx.next, next, !answered[step - 1]), { hint: step === 1 ? tx.chosen(a.interests.length) : undefined });
  } else if (step === 5) {
    wide = true;
    body = <Result answers={a} lang={lang} phone={phone} onChange={() => show(1)} onRoadmap={() => show(6)} onSkipTest={toSkipTest} />;
    foot = footer(
      r.base === 'optional' ? primary(tx.toSkipTest, toSkipTest) : primary(phone ? tx.startBaseM : tx.startBase, () => go('lesson', { lessonId: 'F1' })),
      { second: <button type="button" className="btn2" onClick={() => show(6)}>{tx.fullRoadmap}</button> }
    );
  } else if (step === 6) {
    wide = true;
    body = <Roadmap answers={a} lang={lang} />;
    foot = footer(r.base === 'optional' ? primary(tx.toSkipTest, toSkipTest) : primary(tx.toFirstLesson, () => show(7)));
  } else {
    body = <FirstLesson tx={tx} lang={lang} top={r.top} onStart={() => go('lesson', { lessonId: 'F1' })} onHome={() => go('home')} />;
    foot = phone ? null : <footer className={styles.foot} />;
  }

  return (
    <div className={styles.screen}>
      {header}
      <main className={styles.body} id="workspace">
        <div className={styles.inner} style={{ maxWidth: wide ? 1240 : 1180 }}>{body}</div>
      </main>
      {foot}
    </div>
  );
}

/** The phone chart is too small for annotation labels; keep the shapes, drop the words. */
const unlabeled = (o: Record<string, unknown> | undefined) => Object.fromEntries(Object.entries(o ?? {}).map(([k, v]) =>
  [k, Array.isArray(v) ? v.map((x: Record<string, unknown>) => Object.fromEntries(Object.entries(x).filter(([kk]) => kk !== 'label'))) : v]));

function Welcome({ tx, lang, phone }: { tx: Tx; lang: Lang; phone: boolean }) {
  const chart = chartsForLesson('l1')[1]!;
  const art = (
    <div className={`well ${styles.welcomeWell}`} aria-hidden="true">
      <Chart candles={chart.candles as never} variant={chart.variant} options={phone ? unlabeled(chart.options) : chart.options} label={chart.label[lang]} height={phone ? 190 : 230} />
      {!phone && <span className={`chip learn ${styles.wellChip}`}>{tx.markSupport}</span>}
    </div>
  );
  return (
    <div className={styles.welcome}>
      {phone && art}
      <div className={styles.welcomeText}>
        <span className="eyebrow">{tx.welcomeEyebrow}</span>
        <h1 className={phone ? 'h1' : 'display'}>{phone ? tx.welcomeTitleM : tx.welcomeTitle}</h1>
        {!phone && <p className="lead">{tx.welcomeBody}</p>}
        <div className={phone ? styles.fourQPlain : `sunk ${styles.fourQ}`}>
          <b>{tx.fourQ}</b>
          <div className={styles.chips}>{tx.qNames.slice(0, 4).map((n, i) => <span key={n} className="chip"><span className={`n ${styles.chipN}`}>{i + 1}</span>{n}</span>)}</div>
          {!phone && <span className="meta">{tx.fourQSub}</span>}
        </div>
      </div>
      {!phone && (
        <div className={`glass ${styles.welcomeArt}`}>
          {art}
          <div className={styles.toolTiles} aria-hidden="true">
            {tx.welcomeTools.map((n, i) => <div key={n}><Icon name={TOOL_ICON[i]!} size={17} />{n}</div>)}
          </div>
        </div>
      )}
    </div>
  );
}

function QHead({ k, tx, phone }: { k: number; tx: Tx; phone: boolean }) {
  const [title, sub] = [[tx.q1, tx.q1Sub], [tx.q2, tx.q2Sub], [tx.q3, tx.q3Sub], [tx.q4, tx.q4Sub]][k - 1]!;
  return (
    <div className={styles.qHead}>
      {!phone && <span className="eyebrow">{tx.question(k)}</span>}
      <h1 className={`h1 ${styles.qTitle}`}>{title}</h1>
      {!phone && <p className="lead">{sub}</p>}
    </div>
  );
}

function Question({ k, a, setA, lang, tx, top }: {
  k: number; a: OnboardingAnswers; setA: React.Dispatch<React.SetStateAction<OnboardingAnswers>>; lang: Lang; tx: Tx; top: TrackId;
}) {
  if (k === 1) {
    const toggle = (id: Interest) => setA((x) => ({ ...x, interests: x.interests.includes(id) ? x.interests.filter((i) => i !== id) : [...x.interests, id] }));
    return (
      <div className={styles.optGrid} role="group" aria-label={tx.qNames[0]}>
        {INTERESTS.map((it) => {
          const on = a.interests.includes(it.id);
          return (
            <button key={it.id} type="button" className={styles.opt} aria-pressed={on} onClick={() => toggle(it.id)}>
              <span className={styles.optCheck} aria-hidden="true">{on && <Icon name="check" size={14} />}</span>
              <span className={styles.optIcon}><Icon name={INTEREST_ICON[it.id]} size={22} /></span>
              <b className={styles.optTitle}>{it.title[lang]}</b><span className="small">{it.sub[lang]}</span>
            </button>
          );
        })}
      </div>
    );
  }
  if (k === 2) {
    return (
      <>
        <Radios<Experience> name={tx.qNames[1]} value={a.experience} onChange={(v) => setA((x) => ({ ...x, experience: v }))}
          options={EXPERIENCE.map((e) => ({ value: e.id, label: e.title[lang], meta: tx.q2Meta[e.id] }))} />
        <div className="block example"><b className="lead2">{tx.skipNote}</b>{tx.skipNoteBody}</div>
      </>
    );
  }
  if (k === 3) {
    return (
      <Radios<Goal> name={tx.qNames[2]} value={a.goal} onChange={(v) => setA((x) => ({ ...x, goal: v }))} keys={lang === 'he' ? 'אבגד' : 'ABCD'}
        options={(Object.keys(GOALS) as Goal[]).map((g) => ({ value: g, label: GOALS[g].title[lang] }))} />
    );
  }
  return (
    <div className={styles.timeGrid} role="radiogroup" aria-label={tx.qNames[3]}>
      {WEEKLY.map((w) => (
        <button key={w.minutes} type="button" role="radio" aria-checked={a.time === w.minutes} className={styles.opt} onClick={() => setA((x) => ({ ...x, time: w.minutes }))}>
          <b className={styles.timeTitle}>{w.title[lang]}</b><span className="small">{w.sub[lang]}</span>
          <span className={`meta ${styles.timeMeta}`}>{trackById(top).title[lang]}: {tx.weeks(Math.ceil(trackMinutes(top) / w.minutes))}</span>
        </button>
      ))}
    </div>
  );
}

function Radios<V extends string>({ name, value, onChange, options, keys }: {
  name: string; value: V | null; onChange: (v: V) => void; options: Array<{ value: V; label: string; meta?: string }>; keys?: string;
}) {
  return (
    <div className={styles.radios} role="radiogroup" aria-label={name}>
      {options.map((o, i) => {
        const on = value === o.value;
        return (
          <button key={o.value} type="button" role="radio" aria-checked={on} className={on ? 'choice sel' : 'choice'} onClick={() => onChange(o.value)}>
            {keys ? <span className="key" aria-hidden="true">{keys[i]}</span> : <span className={styles.dotRadio} aria-hidden="true" />}
            <span className={styles.radioLabel}>{o.label}</span>
            {o.meta && <span className="meta">{o.meta}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** The live side panel: each answer visibly moves the ranking. */
function Shaping({ answers, upto, lang }: { answers: OnboardingAnswers; upto: number; lang: Lang }) {
  const tx = TX[lang];
  const known = useMemo<OnboardingAnswers>(() => ({
    interests: upto >= 1 ? answers.interests : [], experience: upto >= 2 ? answers.experience : null,
    goal: upto >= 3 ? answers.goal : null, time: upto >= 4 ? answers.time : null
  }), [answers, upto]);
  const r = recommend(known);
  const max = Math.max(1, ...Object.values(r.scores));
  const ans: Array<[string, string | null]> = [
    [tx.qNames[0], upto >= 1 && answers.interests.length ? answers.interests.map((k) => INTERESTS.find((x) => x.id === k)!.title[lang]).join(', ') : null],
    [tx.qNames[1], upto >= 2 && answers.experience ? EXPERIENCE.find((x) => x.id === answers.experience)!.title[lang] : null],
    [tx.qNames[2], upto >= 3 && answers.goal ? GOALS[answers.goal].title[lang] : null],
    [tx.qNames[3], upto >= 4 && answers.time ? `${WEEKLY.find((x) => x.minutes === answers.time)!.title[lang]} ${tx.perWeek}` : null]
  ];
  return (
    <aside className={`glass ${styles.shaping}`} aria-label={tx.shaping}>
      <div><b className={`h3 ${styles.shapingTitle}`}><span className={styles.sparkIc}><Icon name="spark" size={16} /></span>{tx.shaping}</b><span className="meta">{tx.shapingSub}</span></div>
      <ShapeRow id="F" lang={lang} tag={known.experience ? tx.baseText[r.base] : tx.base} />
      <hr className="hr" />
      {r.order.map((id) => {
        const lead = r.scores[id] > 0 && id === r.top;
        return <ShapeRow key={id} id={id} lang={lang} fill={(r.scores[id] / max) * 100} lead={lead} tag={lead ? tx.lead : undefined} />;
      })}
      <ShapeRow id="D" lang={lang} tag={tx.afterRisk} locked />
      <hr className="hr" />
      <span className="label">{tx.yourAnswers}</span>
      <dl className={styles.answers}>
        {ans.map(([k, v]) => <div key={k}><dt className="meta">{k}</dt><dd className={v ? undefined : styles.empty}>{v ?? '—'}</dd></div>)}
      </dl>
    </aside>
  );
}

function ShapeRow({ id, lang, fill, lead, tag, locked }: { id: TrackId; lang: Lang; fill?: number; lead?: boolean; tag?: string; locked?: boolean }) {
  return (
    <div className={styles.shapeRow} data-locked={locked || undefined}>
      <TrackMono id={id} size={32} lang={lang} />
      <div className={styles.shapeBody}>
        <span className={lead ? styles.shapeLead : styles.shapeName}>{trackById(id).title[lang]}</span>
        {fill !== undefined && <span className={styles.shapeBar}><span style={{ width: `${Math.max(4, fill)}%` }} data-lead={lead || undefined} /></span>}
      </div>
      {lead ? <span className={`chip solidLearn ${styles.smallChip}`}>{tag}</span> : tag ? <span className={`meta ${styles.shapeTag}`}>{locked && <Icon name="lock" size={11} />}{tag}</span> : null}
    </div>
  );
}

/** The result: one track in the spotlight, with the reason behind each answer. */
function Result({ answers, lang, phone, onChange, onRoadmap, onSkipTest }: {
  answers: OnboardingAnswers; lang: Lang; phone: boolean; onChange: () => void; onRoadmap: () => void; onSkipTest: () => void;
}) {
  const tx = TX[lang];
  const r = recommend(answers), t = trackById(r.top), c = trackColor(r.top);
  const reasons: Array<[number, string, string]> = [];
  const intr = INTERESTS.find((x) => x.id === r.top);
  if (intr && answers.interests.includes(r.top)) reasons.push([1, tx.chose(intr.title[lang]), TRACK_WHY[r.top][lang]]);
  const g = answers.goal ? GOALS[answers.goal] : null;
  if (g?.why[r.top]) reasons.push([3, tx.goalIs(g.title[lang]), g.why[r.top]![lang]]);
  if (answers.time) reasons.push([4, tx.weekly(WEEKLY.find((x) => x.minutes === answers.time)!.title[lang]), tx.weeksNote(r.weeks[r.top], r.base === 'optional' ? null : r.weeks.F)]);
  const [baseChip, baseBody] = tx.baseLine[r.base];
  const ring = { boxShadow: `var(--glass-inset), inset 0 0 0 2px color-mix(in srgb, ${c} 55%, transparent), var(--glass-shadow)` };
  const halo = <div className={styles.halo} style={{ background: `radial-gradient(closest-side, color-mix(in srgb, ${c} 26%, transparent), transparent)` }} aria-hidden="true" />;

  if (phone) {
    return (
      <div className={styles.result}>
        <span className="eyebrow">{tx.byAnswers}</span>
        <section className={`glass ${styles.spotlight}`} style={ring}>
          {halo}
          <div className={styles.spotInner}>
            <span className={`chip solidLearn ${styles.selfStart}`}><Icon name="check" size={12} />{tx.recommended}</span>
            <div className={styles.spotHead}><TrackMono id={r.top} size={56} lang={lang} /><h1 className="h2">{t.title[lang]}</h1></div>
            <p className={`small ${styles.why}`}>{TRACK_WHY[r.top][lang]}</p>
            <div className={styles.mStats}><span><span className="n">{lessonsOf(r.top).length}</span> {tx.lessons}</span><span>{tx.weeks(r.weeks[r.top])}</span></div>
          </div>
        </section>
        {r.base !== 'optional' && (
          <div className={`solid ${styles.baseCard} ${styles.baseRow}`}>
            <TrackMono id="F" size={34} lang={lang} />
            <div><b className={styles.baseName}>{tx.firstBase(trackById('F').title[lang])}</b><p className="meta"><span className="n">5</span> {tx.lessons} · {baseChip}</p></div>
          </div>
        )}
        <button type="button" className={`btnText ${styles.selfCenter}`} onClick={onRoadmap}>{tx.fullRoadmap}</button>
        <button type="button" className={`btnText ${styles.selfCenter}`} onClick={onChange}><Icon name="pen" size={14} />{tx.change}</button>
      </div>
    );
  }
  return (
    <div className={styles.result}>
      <div className={styles.resultHead}>
        <div className={styles.stack6}><span className="eyebrow">{tx.byAnswers}</span><h1 className={`h1 ${styles.qTitle}`}>{tx.yourTrack(t.title[lang])}</h1></div>
        <button type="button" className="btnText" onClick={onChange}><Icon name="pen" size={14} />{tx.change}</button>
      </div>
      <div className={styles.resultGrid}>
        <section className={`glass ${styles.spotlight}`} style={ring}>
          {halo}
          <div className={styles.spotInner}>
            <div className={styles.spotHead}>
              <TrackMono id={r.top} size={72} lang={lang} />
              <div className={styles.stack6}><span className={`chip solidLearn ${styles.selfStart}`}><Icon name="check" size={12} />{tx.recommended}</span><b className={`h1 ${styles.spotName}`}>{t.title[lang]}</b></div>
            </div>
            <p className={`txt ${styles.why}`}>{TRACK_WHY[r.top][lang]}</p>
            <div className={styles.spotStats}>
              {([['list', <><span className="n">{lessonsOf(r.top).length}</span> {tx.lessons}</>], ['clock', formatDuration(trackMinutes(r.top), lang)], ['flag', tx.atYourPace(r.weeks[r.top])]] as Array<[IconName, React.ReactNode]>).map(([ic, v]) => (
                <div key={ic} className="sunk"><span style={{ color: c }}><Icon name={ic} size={16} /></span>{v}</div>
              ))}
            </div>
            <div className={styles.reasons}>
              <span className="label">{tx.whyThis}</span>
              {reasons.map(([k, h, w]) => (
                <div key={k} className={styles.reason}><span className={`chip ${styles.smallChip}`}>{tx.qTag(k)}</span><div><b className={styles.reasonHead}>{h}</b><p className="small">{w}</p></div></div>
              ))}
            </div>
          </div>
        </section>
        <div className={styles.resultSide}>
          <section className={`solid ${styles.baseCard}`}>
            <div className={styles.baseRow}>
              <TrackMono id="F" size={40} lang={lang} />
              <div className={styles.grow}><b className={styles.baseName}>{trackById('F').title[lang]}</b><p className="meta"><span className="n">5</span> {tx.lessons} · {tx.weeks(r.weeks.F)}</p></div>
              <span className={r.base === 'optional' ? 'chip' : 'chip warn'}>{baseChip}</span>
            </div>
            <p className="small">{baseBody}</p>
            {r.base !== 'required' && <button type="button" className={`btnText ${styles.selfStart} ${styles.small13}`} onClick={onSkipTest}><Icon name="target" size={14} />{tx.skipTest}</button>}
          </section>
          <section className={`solid ${styles.nextCard}`}>
            <span className="label">{tx.after}</span>
            {r.order.slice(1).map((id, i) => (
              <div key={id} className={styles.nextRow}><span className="meta n">{i + 2}</span><TrackMono id={id} size={30} lang={lang} /><span>{trackById(id).title[lang]}</span>{i === 0 ? <span className="meta">{tx.alsoFits}</span> : <span />}</div>
            ))}
            <div className={styles.nextRow}><span className="meta n">6</span><TrackMono id="D" size={30} lang={lang} /><span className={styles.muted}>{trackById('D').title[lang]}</span><span className={`meta ${styles.shapeTag}`}><Icon name="lock" size={11} />{r.wantsDerivatives ? tx.dAsked : tx.afterRisk}</span></div>
            <p className={`meta ${styles.pushEnd}`}>{tx.notLocking}</p>
          </section>
        </div>
      </div>
    </div>
  );
}

/** The roadmap: the whole path at the chosen pace, the recommended track highlighted. */
function Roadmap({ answers, lang }: { answers: OnboardingAnswers; lang: Lang }) {
  const tx = TX[lang];
  const r = recommend(answers), path = pathFor(answers);
  const total = path.reduce((s, id) => s + r.weeks[id], 0);
  let acc = 0;
  return (
    <div className={styles.result}>
      <div className={styles.stack6}>
        <span className="eyebrow">{tx.roadmapEyebrow}</span>
        <h1 className={`h1 ${styles.qTitle}`}>{tx.roadmapTitle(WEEKLY.find((x) => x.minutes === (answers.time ?? 30))!.title[lang])}</h1>
        <p className="lead">{tx.roadmapSub}</p>
      </div>
      <ol className={`glass ${styles.roadmap}`}>
        {path.map((id, i) => {
          const w0 = acc; acc += r.weeks[id];
          const rec = id === r.top, lock = id === 'D', base = id === 'F';
          const fill = rec ? 'var(--learn-fill)' : base ? 'color-mix(in srgb, var(--text) 45%, transparent)' : lock ? 'var(--text-faint)' : 'var(--info)';
          return (
            <li key={id} className={styles.roadRow} data-rec={rec || undefined} data-locked={lock || undefined} style={rec ? { ['--c' as string]: trackColor(id) } : undefined}>
              <span className={i === 0 ? `num cur ${styles.roadNum}` : `num ${styles.roadNum}`}>{i + 1}</span>
              <TrackMono id={id} size={42} lang={lang} />
              <div><b className={styles.roadName}>{trackById(id).title[lang]}</b><p className="meta"><span className="n">{lessonsOf(id).length}</span> {tx.lessons} · {formatDuration(trackMinutes(id), lang)}</p></div>
              <span className={styles.roadBar} aria-hidden="true"><span style={{ insetInlineStart: `${(w0 / total) * 100}%`, width: `${(r.weeks[id] / total) * 100}%`, background: fill }} /></span>
              <span className={styles.roadEnd}>
                {rec ? <span className="chip solidLearn">{tx.yours}</span>
                  : lock ? <span className={`meta ${styles.shapeTag}`}><Icon name="lock" size={11} />{tx.afterRisk}</span>
                  : base ? <span className="meta">{tx.baseText[r.base].split(' · ')[1]}</span>
                  : <span className="meta">{tx.weeksRange} <span className="n">{w0 + 1}–{acc}</span></span>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function FirstLesson({ tx, lang, top, onStart, onHome }: { tx: Tx; lang: Lang; top: TrackId; onStart: () => void; onHome: () => void }) {
  const f1 = lessonsOf('F')[0]!;
  return (
    <div className={styles.first}>
      <div className={styles.firstText}>
        <span className="eyebrow">{tx.ready}</span>
        <h1 className={`display ${styles.firstTitle}`}>{tx.firstWaits(f1.title[lang])}</h1>
        <p className="lead">{formatDuration(f1.minutes, lang)} · {tx.firstBody}</p>
        <div className={`sunk ${styles.thenTrack}`}><TrackMono id={top} size={32} lang={lang} /><span className={`small ${styles.why}`}>{tx.thenTrack[0]}<b>{trackById(top).title[lang]}</b>{tx.thenTrack[1]}</span></div>
        <div className={styles.footEnd}>
          <button type="button" className="btn lg" onClick={onStart}>{tx.startNow}<Icon name={lang === 'he' ? 'chevL' : 'chevR'} size={17} /></button>
          <button type="button" className="btn2" onClick={onHome}>{tx.home}</button>
        </div>
        <span className="meta">{tx.saved}</span>
      </div>
      <div className={`glass ${styles.sortPreview}`} aria-hidden="true">
        <div className={styles.sortHead}><span className="chip">{tx.sortChip}</span><span className="chip info"><Icon name="play" size={10} />{tx.sortKind}</span></div>
        <div className={styles.sortRow}>{tx.sortAssets.map((x) => <div key={x} className={styles.sortAsset}>{x}</div>)}</div>
        <div className={styles.sortRow}>{tx.sortBins.map((x, i) => <div key={x} className={styles.sortBin} style={{ color: BIN_COLOR[i], borderColor: BIN_COLOR[i] }}>{x}</div>)}</div>
        <p className="small">{tx.sortNote}</p>
      </div>
    </div>
  );
}
