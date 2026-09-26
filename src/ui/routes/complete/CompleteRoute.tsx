import { useEffect, useRef, useState } from 'react';
import type { Lang } from '@core/types/kb';
import { TRACKS, formatDuration, lessonsOf, trackById, trackMinutes } from '@core/curriculum/curriculum';
import type { TrackId } from '@core/curriculum/curriculum';
import { TRACK_INFO } from '@core/curriculum/trackInfo';
import { pathFor } from '@core/curriculum/recommend';
import { completedIn, trackDone, trackStatus } from '@core/progress/learning';
import type { LearningProgress } from '@core/progress/learning';
import { useAppState } from '@ui/app/AppState';
import { useRoute } from '@ui/hooks/useRoute';
import { Icon } from '@ui/components/icons/Icons';
import { TrackCard, TrackMono } from '@ui/components/curriculum/Curriculum';
import { setSession, useSession } from '../practice/session';
import styles from './CompleteRoute.module.css';

const TX = {
  he: {
    tracks: 'מסלולים', summary: 'סיכום', next: 'המסלול הבא', doneToday: 'הושלם', lessons: 'שיעורים', practice: 'תרגול מסכם', time: 'זמן למידה', project: 'פרויקט',
    canDo: 'מה אתם יודעים לעשות עכשיו', dict: 'נכנסו למילון שלכם', allLessons: (n: number) => `${n} השיעורים`, stepNext: 'הצעד הבא', recNext: 'המסלול הבא שמומלץ לכם',
    open: (t: string) => `למסלול ${t}`, yourProject: 'הפרויקט של המסלול', reviewPractice: 'סקירת התרגול המסכם',
    passedChip: (s: string) => `עברתם את התרגול · ${s}`, doneH: (t: string) => `${t} — הושלם`, doneBody: (n: number, p: boolean) => `${n} שיעורים${p ? ', פרויקט אחד' : ''} ותרגול מסכם. כל מה שבמסלול — מאחוריכם.`,
    toSummary: 'לסיכום המסלול', straightNext: 'ישר למסלול הבא', close: 'סגירה',
    doneOf: (k: number) => `סיימתם ${k} מתוך 6 מסלולים`, whereNow: 'לאן ממשיכים?', whereBody: 'הסדר גמיש. ההמלצה מבוססת על מה שכבר התחלתם ועל מה שנפתח בהמשך.',
    started: (d: number, n: number) => `כבר התחלתם · ${d}/${n}`, opensAfter: (t: string) => `נפתח אחרי ${t}`, unlocks: (t: string) => `פותח את ${t}`, anytime: 'אפשר להתחיל בכל שלב',
    notDoneH: 'המסלול עוד לא הושלם', notDoneBody: (d: number, n: number) => `הושלמו ${d} מתוך ${n} שיעורים. המסלול מסתיים כשכל השיעורים והתרגול המסכם מאחוריכם.`, toTrack: 'לעמוד המסלול',
    allDone: 'סיימתם את כל המסלולים.'
  },
  en: {
    tracks: 'Tracks', summary: 'Summary', next: 'Next track', doneToday: 'Complete', lessons: 'lessons', practice: 'Final practice', time: 'Learning time', project: 'Project',
    canDo: 'What you can do now', dict: 'Now in your glossary', allLessons: (n: number) => `All ${n} lessons`, stepNext: 'NEXT STEP', recNext: 'The track we recommend next',
    open: (t: string) => `Go to ${t}`, yourProject: "The track's project", reviewPractice: 'Review the final practice',
    passedChip: (s: string) => `Practice passed · ${s}`, doneH: (t: string) => `${t} — complete`, doneBody: (n: number, p: boolean) => `${n} lessons${p ? ', one project' : ''} and the final practice. The whole track is behind you.`,
    toSummary: 'Track summary', straightNext: 'Straight to the next track', close: 'Close',
    doneOf: (k: number) => `${k} of 6 tracks complete`, whereNow: 'Where to next?', whereBody: "The order is flexible. The recommendation weighs what you've started and what opens up next.",
    started: (d: number, n: number) => `Already started · ${d}/${n}`, opensAfter: (t: string) => `Opens after ${t}`, unlocks: (t: string) => `Unlocks ${t}`, anytime: 'Start any time',
    notDoneH: 'This track is not complete yet', notDoneBody: (d: number, n: number) => `${d} of ${n} lessons done. A track completes once every lesson and the final practice are behind you.`, toTrack: 'Track page',
    allDone: 'You have completed every track.'
  }
} as const;
type Tx = (typeof TX)[Lang];

const shortTitle = (t: string) => t.split(/[:—]/)[0]!.trim();

/** The tracks still to do, best first: the onboarding path's order, then open before locked. */
function remaining(p: LearningProgress): TrackId[] {
  const order = p.onboarding ? pathFor(p.onboarding.answers) : TRACKS.map((t) => t.id);
  const all = [...order, ...TRACKS.map((t) => t.id).filter((id) => !order.includes(id))];
  const left = all.filter((id) => !trackDone(p, id));
  return [...left.filter((id) => trackStatus(p, id) === 'active'), ...left.filter((id) => trackStatus(p, id) === 'new'), ...left.filter((id) => trackStatus(p, id) === 'locked')];
}

/**
 * Finishing a track (Artifact: 12 · Completion): the celebration moment over
 * the summary, the summary itself, and the choice of what comes next.
 */
export function CompleteRoute({ trackId, next }: { trackId: TrackId; next: boolean }) {
  const { lang, learning } = useAppState();
  const { go } = useRoute();
  const tx = TX[lang];
  const t = trackById(trackId), ls = lessonsOf(trackId);

  if (!trackDone(learning, trackId)) {
    return (
      <div className={styles.page}>
        <section className={`glass ${styles.hero} ${styles.notDone}`}>
          <TrackMono id={trackId} size={56} lang={lang} />
          <h1 className="h1">{tx.notDoneH}</h1>
          <p className="txt">{tx.notDoneBody(completedIn(learning, trackId), ls.length)}</p>
          <button type="button" className="btn" onClick={() => go('track', { trackId })}>{tx.toTrack}</button>
        </section>
      </div>
    );
  }
  return next ? <NextTrack tx={tx} lang={lang} /> : <Summary trackId={trackId} tx={tx} lang={lang} title={t.title[lang]} />;
}

function Summary({ trackId, tx, lang, title }: { trackId: TrackId; tx: Tx; lang: Lang; title: string }) {
  const { learning } = useAppState();
  const { go } = useRoute();
  const session = useSession(trackId);
  const [celebrate, setCelebrate] = useState(!!session?.completedTrack);
  const info = TRACK_INFO[trackId], ls = lessonsOf(trackId), rec = learning.practice[trackId]!;
  const score = rec.total ? `${rec.best}/${rec.total}` : String(rec.best);
  const nextId = remaining(learning)[0];
  const chev = lang === 'he' ? 'chevL' : 'chevR';
  const close = () => { setCelebrate(false); if (session) setSession({ ...session, completedTrack: false }); };

  return (
    <div className={styles.page}>
      <nav className={styles.crumbs} aria-label={lang === 'he' ? 'פירורי לחם' : 'Breadcrumb'}>
        <a href="#/" onClick={(e) => { e.preventDefault(); go('home'); }}>{tx.tracks}</a><Icon name={chev} size={13} />
        <a href={`#/track/${trackId}`} onClick={(e) => { e.preventDefault(); go('track', { trackId }); }}>{title}</a><Icon name={chev} size={13} />
        <span aria-current="page">{tx.summary}</span>
      </nav>
      <section className={`glass ${styles.hero}`}>
        <div className={styles.heroText}>
          <div className={styles.headRow}><TrackMono id={trackId} size={60} lang={lang} /><div><span className="chip ok"><Icon name="check" size={13} />{tx.doneToday}</span><h1 className={`h1 ${styles.title}`}>{title}</h1></div></div>
          <p className="txt">{info.why[lang]}</p>
        </div>
        <div className={styles.stats}>
          {([['list', `${ls.length}/${ls.length}`, tx.lessons, 'var(--learn)'], ['target', score, tx.practice, 'var(--ok)'], ['clock', formatDuration(trackMinutes(trackId), lang), tx.time, 'var(--info)']] as const).map(([ic, v, k, c]) => (
            <div key={k} className="sunk"><span style={{ color: c }}><Icon name={ic} size={18} /></span><div className={styles.stack}><b className="n">{v}</b><span className="meta">{k}</span></div></div>
          ))}
          {info.project && <div className="sunk"><span style={{ color: 'var(--adv)' }}><Icon name="flag" size={18} /></span><div className={styles.stack}><b className="n">1</b><span className="meta">{tx.project}</span></div></div>}
        </div>
      </section>
      <div className={styles.cols}>
        <div className={styles.col}>
          <section className={`solid ${styles.card}`}>
            <b className="h3">{tx.canDo}</b>
            {info.skills.map((s) => <div key={s.en} className={styles.skill}><span className={styles.okDot}><Icon name="check" size={13} /></span><span>{s[lang]}</span></div>)}
            <hr className="hr" />
            <span className="label">{tx.dict}</span>
            <div className={styles.chips}>{info.terms[lang].map((w) => <button key={w} type="button" className="chip" onClick={() => go('glossary')}>{w}</button>)}</div>
          </section>
          <section className={`solid ${styles.card}`}>
            <b className="h3">{tx.allLessons(ls.length)}</b>
            <div className={styles.lessonGrid}>
              {ls.map((l) => <button key={l.id} type="button" className={styles.lessonRow} onClick={() => go('lesson', { lessonId: l.id })}><span className="num done"><Icon name="check" size={11} /></span><span>{shortTitle(l.title[lang])}</span></button>)}
            </div>
          </section>
        </div>
        <div className={styles.col}>
          {nextId ? (
            <section className={`glass ${styles.card}`}>
              <span className="eyebrow">{tx.stepNext}</span>
              <b className="h3">{tx.recNext}</b>
              <TrackCard id={nextId} status={trackStatus(learning, nextId)} done={completedIn(learning, nextId)} lang={lang} recommended onOpen={() => go('track', { trackId: nextId })} />
              <button type="button" className={`btn lg ${styles.selfStart}`} onClick={() => go('track', { trackId: nextId })}>{tx.open(trackById(nextId).title[lang])}<Icon name={chev} size={17} /></button>
            </section>
          ) : <section className={`glass ${styles.card}`}><b className="h3">{tx.allDone}</b></section>}
          {info.project && <section className={`solid ${styles.card}`}><b className="h3">{tx.yourProject}</b><span className="small">{info.project[lang]}</span></section>}
          <button type="button" className={`btnQuiet ${styles.selfStart}`} onClick={() => go('practice', { trackId })}><Icon name="target" size={15} />{tx.reviewPractice}</button>
        </div>
      </div>
      {celebrate && <Celebrate trackId={trackId} tx={tx} lang={lang} score={score} onClose={close} onNext={() => { close(); go('complete', { trackId, view: 'next' }); }} />}
    </div>
  );
}

// Confetti in the brand accents (never purple), placed by a fixed seed so it never jumps between renders.
const CONFETTI = (() => {
  const cols = ['var(--learn)', 'var(--adv)', 'var(--info)', 'var(--ok)', 'var(--risk)'];
  let s = 7; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: 70 }, (_, i) => ({ left: r() * 100, top: r() * 62, w: 4 + Math.round(r() * 6), h: 8 + Math.round(r() * 10), c: cols[i % 5]!, o: 0.5 + r() * 0.5, rot: Math.round(r() * 180) }));
})();

function Celebrate({ trackId, tx, lang, score, onClose, onNext }: { trackId: TrackId; tx: Tx; lang: Lang; score: string; onClose: () => void; onNext: () => void }) {
  const first = useRef<HTMLButtonElement>(null);
  const t = trackById(trackId), n = lessonsOf(trackId).length;
  useEffect(() => {
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <>
      <div className={styles.scrim} onClick={onClose} aria-hidden="true" />
      <div className={styles.confetti} aria-hidden="true">
        {CONFETTI.map((p, i) => <i key={i} style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.w, height: p.h, background: p.c, opacity: p.o, transform: `rotate(${p.rot}deg)` }} />)}
      </div>
      <div className={`glass ${styles.modal}`} role="dialog" aria-modal="true" aria-labelledby="cpTitle">
        <div className={styles.ringWrap}>
          <span className="ring" style={{ ['--p' as string]: 100, ['--c' as string]: 'var(--ok)', width: 132, height: 132 }}><span /></span>
          <span className={styles.ringMono}><TrackMono id={trackId} size={70} lang={lang} /></span>
        </div>
        <span className="chip ok"><Icon name="check" size={14} />{tx.passedChip(score)}</span>
        <h1 className={`h1 ${styles.modalTitle}`} id="cpTitle">{tx.doneH(t.title[lang])}</h1>
        <p className="txt">{tx.doneBody(n, !!TRACK_INFO[trackId].project)}</p>
        <div className={styles.modalActions}>
          <button ref={first} type="button" className="btn lg" onClick={onClose}>{tx.toSummary}<Icon name={lang === 'he' ? 'chevL' : 'chevR'} size={17} /></button>
          <button type="button" className="btnQuiet" onClick={onNext}>{tx.straightNext}</button>
        </div>
      </div>
    </>
  );
}

function NextTrack({ tx, lang }: { tx: Tx; lang: Lang }) {
  const { learning } = useAppState();
  const { go } = useRoute();
  const doneCount = TRACKS.filter((t) => trackDone(learning, t.id)).length;
  const left = remaining(learning);
  const reason = (id: TrackId) => {
    const st = trackStatus(learning, id), n = lessonsOf(id).length, d = completedIn(learning, id);
    if (st === 'locked') return tx.opensAfter(trackById(trackById(id).prereq!.hard!).title[lang]);
    if (st === 'active') return tx.started(d, n);
    const unlocks = TRACKS.find((t) => t.prereq?.hard === id);
    return unlocks ? tx.unlocks(unlocks.title[lang]) : tx.anytime;
  };
  return (
    <div className={styles.page}>
      <div className={styles.stack6}><span className="eyebrow">{tx.doneOf(doneCount)}</span><h1 className={`h1 ${styles.title}`}>{tx.whereNow}</h1><p className="txt">{tx.whereBody}</p></div>
      <div className={styles.strip}>
        {TRACKS.map((t) => {
          const n = lessonsOf(t.id).length, d = completedIn(learning, t.id), full = trackDone(learning, t.id);
          return (
            <div key={t.id} style={{ flex: n }} className={styles.stripItem}>
              <div className={styles.stripBar}><span style={{ width: `${(d / n) * 100}%`, background: full ? 'var(--ok)' : 'var(--learn-fill)' }} /></div>
              <span className="meta">{t.title[lang]} · <span className="n">{d}/{n}</span></span>
            </div>
          );
        })}
      </div>
      {left.length ? (
        <div className={styles.nextGrid}>
          {left.map((id, i) => (
            <div key={id} className={styles.stack6}>
              <TrackCard id={id} status={trackStatus(learning, id)} done={completedIn(learning, id)} lang={lang} recommended={i === 0} onOpen={() => go('track', { trackId: id })} />
              <span className={`meta ${styles.reason}`}>{trackStatus(learning, id) === 'locked' && <Icon name="lock" size={12} />}{reason(id)}</span>
            </div>
          ))}
        </div>
      ) : <p className="txt">{tx.allDone}</p>}
    </div>
  );
}
