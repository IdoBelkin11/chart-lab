import { useState } from 'react';
import type { TrackId } from '@core/curriculum/curriculum';
import {
  LEVELS, formatDuration, lessonsOf, trackById, trackMinutes
} from '@core/curriculum/curriculum';
import { TRACK_INFO, hasContent } from '@core/curriculum/trackInfo';
import { completedIn, lessonStatus, practiceOpen, trackStatus } from '@core/progress/learning';
// The size only: counting from the questions would load every lesson with the track page.
import { practicePassFor, practiceSize, writtenLessons } from '@core/practice/practiceSize';
import { useAppState } from '@ui/app/AppState';
import { useRoute } from '@ui/hooks/useRoute';
import { Icon } from '@ui/components/icons/Icons';
import { LessonRow, TrackArt, TrackMono } from '@ui/components/curriculum/Curriculum';
import type { RowState } from '@ui/components/curriculum/Curriculum';
import styles from './TrackRoute.module.css';

const TX = {
  he: {
    tracks: 'מסלולים', lessons: 'שיעורים', estimate: 'הערכה', project: 'פרויקט', projects: 'פרויקטים', ofTrack: 'מהמסלול',
    noPrereq: 'בלי דרישות קדם', softPrereq: 'מומלץ אחרי יסודות', hardPrereq: (t: string) => `דורש: ${t}`,
    start: (n: number) => `להתחיל: שיעור ${n}`, cont: (n: number) => `המשך: שיעור ${n}`, review: 'חזרה על המסלול', preview: 'הצצה לשיעור 1',
    lockedTitle: 'המסלול נעול', lockedBody: (t: string) => `הוא נפתח אחרי שמסיימים את "${t}" ועוברים את התרגול שלו.`,
    doneTitle: 'המסלול הושלם', doneBody: 'כל השיעורים והתרגול המסכם. אפשר לחזור לכל שיעור.',
    tabLessons: 'שיעורים', tabProjects: 'פרויקטים', tabPractice: 'תרגול', tabTerms: 'מונחים',
    skills: 'בסוף המסלול תדעו', trackProject: 'פרויקט המסלול', practice: 'תרגול המסלול', terms: 'מונחים במסלול', termsHint: 'נפתחים במילון',
    practiceBody: (n: number, pass: number) => `${n} שאלות, אחת לכל שיעור כתוב. עוברים ב־${pass} נכונות — ואפשר לנסות שוב בלי הגבלה.`,
    practiceLocked: (n: number) => `נפתח אחרי ${n} השיעורים הכתובים`, practicePassed: 'עבר', practiceOpenNow: 'התרגול פתוח', practiceNone: 'ייפתח יחד עם השיעורים של המסלול.',
    toPractice: 'לתרגול המסכם', toSummary: 'לסיכום המסלול', bestScore: (s: string) => `הציון הטוב ביותר: ${s}`, noProjects: 'במסלול הזה אין פרויקט מסכם — כל שיעור נגמר בתרגול משלו.'
  },
  en: {
    tracks: 'Tracks', lessons: 'lessons', estimate: 'estimate', project: 'project', projects: 'projects', ofTrack: 'of the track',
    noPrereq: 'No prerequisites', softPrereq: 'Recommended after Foundations', hardPrereq: (t: string) => `Requires: ${t}`,
    start: (n: number) => `Start: Lesson ${n}`, cont: (n: number) => `Continue: Lesson ${n}`, review: 'Review the track', preview: 'Preview Lesson 1',
    lockedTitle: 'This track is locked', lockedBody: (t: string) => `It opens once you finish "${t}" and pass its practice.`,
    doneTitle: 'Track completed', doneBody: 'Every lesson and the final practice. You can revisit any lesson.',
    tabLessons: 'Lessons', tabProjects: 'Projects', tabPractice: 'Practice', tabTerms: 'Terms',
    skills: "By the end you'll be able to", trackProject: 'Track project', practice: 'Track practice', terms: 'Terms in this track', termsHint: 'Open in the glossary',
    practiceBody: (n: number, pass: number) => `${n} questions, one per written lesson. Pass with ${pass} correct — retry as many times as you like.`,
    practiceLocked: (n: number) => `Opens after the ${n} written lessons`, practicePassed: 'Passed', practiceOpenNow: 'Practice is open', practiceNone: 'Opens together with the track’s lessons.',
    toPractice: 'Go to the practice', toSummary: 'Track summary', bestScore: (s: string) => `Best score: ${s}`, noProjects: 'This track has no capstone project — every lesson ends in its own practice.'
  }
} as const;

type Tab = 'lessons' | 'projects' | 'practice' | 'terms';

/**
 * A track's page (Artifact: 05 · Tracks): what it is, what you will be able
 * to do, its lessons by module with their state, and its practice.
 */
export function TrackRoute({ trackId }: { trackId: TrackId }) {
  const { lang, learning } = useAppState();
  const { go } = useRoute();
  const [tab, setTab] = useState<Tab>('lessons');
  const tx = TX[lang];
  const t = trackById(trackId), info = TRACK_INFO[trackId], ls = lessonsOf(trackId);
  const status = trackStatus(learning, trackId);
  const done = completedIn(learning, trackId);
  const pct = Math.round((done / ls.length) * 100);
  const projects = ls.filter((l) => l.kind === 'project');
  const hard = t.prereq?.hard ? trackById(t.prereq.hard).title[lang] : null;
  const record = learning.practice[trackId];
  const passed = !!record?.passed;
  const practiceN = practiceSize(trackId);

  // The lesson "continue" points at: the first started-but-unfinished one,
  // else the first not completed that can actually be learned today. A track
  // with nothing written yet has no "start" — only a preview.
  const current =
    ls.find((l) => lessonStatus(learning, l.id) === 'in-progress' && hasContent(l.id)) ??
    ls.find((l) => lessonStatus(learning, l.id) !== 'completed' && hasContent(l.id));
  const rowState = (id: string): RowState => {
    if (status === 'locked') return 'locked';
    const st = lessonStatus(learning, id);
    if (st === 'completed') return 'done';
    if (!hasContent(id)) return 'soon';
    if (current?.id === id && st === 'in-progress') return 'current';
    return 'todo';
  };
  const open = (id: string) => go('lesson', { lessonId: id });

  const cta =
    status === 'locked' || !current ? (
      <button type="button" className="btn2" onClick={() => open(ls[0]!.id)}><Icon name="play" size={14} />{tx.preview}</button>
    ) : status === 'done' ? (
      <button type="button" className="btn2" onClick={() => open(ls[0]!.id)}><Icon name="refresh" size={15} />{tx.review}</button>
    ) : (
      <button type="button" className="btn lg" onClick={() => current && open(current.id)} disabled={!current}>
        {ls.some((l) => learning.lessons[l.id]) ? tx.cont(ls.indexOf(current!) + 1) : tx.start(ls.indexOf(current!) + 1)}
        <Icon name={lang === 'he' ? 'chevL' : 'chevR'} size={17} />
      </button>
    );

  const practiceCard = (
    <div className={`card solid ${styles.sideCard}`}>
      <div className={styles.sideHead}><span className="num" style={{ width: 34, height: 34, color: 'var(--info)', background: 'var(--info-dim)', boxShadow: 'none' }}><Icon name="target" size={16} /></span><b className="h3">{tx.practice}</b>{passed && <span className="chip ok" style={{ marginInlineStart: 'auto' }}><Icon name="check" size={12} />{tx.practicePassed}</span>}</div>
      {practiceN ? <p className="small">{tx.practiceBody(practiceN, practicePassFor(trackId))}</p> : <p className="small">{tx.practiceNone}</p>}
      {record && <span className="meta">{tx.bestScore(`${record.best}/${record.total ?? practiceN}`)}</span>}
      {practiceOpen(learning, trackId)
        ? <button type="button" className="btn2 sm" onClick={() => go(status === 'done' ? 'complete' : 'practice', { trackId })}>{status === 'done' ? tx.toSummary : passed ? tx.toPractice : tx.practiceOpenNow}</button>
        : practiceN > 0 && <span className={`meta ${styles.lockLine}`}><Icon name="lock" size={13} />{tx.practiceLocked(writtenLessons(trackId).length)}</span>}
    </div>
  );

  return (
    <div className={styles.page}>
      <nav className={styles.crumbs} aria-label={lang === 'he' ? 'פירורי לחם' : 'Breadcrumb'}>
        <a href="#/" onClick={(e) => { e.preventDefault(); go('home'); }}>{tx.tracks}</a>
        <Icon name={lang === 'he' ? 'chevL' : 'chevR'} size={13} />
        <span aria-current="page">{t.title[lang]}</span>
      </nav>

      <section className={`glass ${styles.hero}`}>
        <div className={styles.heroText}>
          <div className={styles.heroTitleRow}>
            <TrackMono id={trackId} size={60} lang={lang} />
            <div className={styles.heroTitle}><h1 className="h1">{t.title[lang]}</h1><span className="small">{info.why[lang]}</span></div>
          </div>
          <p className="txt">{t.description[lang]}</p>
          <div className={styles.stats}>
            <span><Icon name="list" size={15} /> <span className="n">{ls.length}</span> {tx.lessons}</span>
            <span><Icon name="clock" size={15} /> {formatDuration(trackMinutes(trackId), lang)} ({tx.estimate})</span>
            <span><Icon name="flag" size={15} /> <span className="n">{projects.length}</span> {projects.length === 1 ? tx.project : tx.projects}</span>
            <span>{[...new Set(ls.map((l) => l.level))].map((x) => LEVELS[x][lang]).join(' → ')}</span>
            <span>{hard ? <><Icon name="lock" size={14} /> {tx.hardPrereq(hard)}</> : t.prereq ? tx.softPrereq : tx.noPrereq}</span>
          </div>
          <div className={styles.heroCta}>
            {cta}
            {status !== 'locked' && (
              <span className={styles.ringWrap}>
                <span className="ring" style={{ ['--p' as string]: pct, ['--c' as string]: status === 'done' ? 'var(--ok)' : 'var(--learn-fill)', width: 52, height: 52 }}>
                  <span className="n" style={{ fontSize: 12 }}>{done}/{ls.length}</span>
                </span>
                <span className="meta">{pct}% {tx.ofTrack}</span>
              </span>
            )}
          </div>
        </div>
        <div className={styles.heroArt}><div className={status === 'locked' ? styles.artDim : undefined}><TrackArt id={trackId} /></div></div>
      </section>

      {status === 'locked' && (
        <div className={`card ${styles.banner} ${styles.bannerLocked}`} role="status">
          <span className={styles.bannerIcon}><Icon name="lock" size={20} /></span>
          <div><b>{tx.lockedTitle}</b><p className="small">{tx.lockedBody(hard!)}</p></div>
        </div>
      )}
      {status === 'done' && (
        <div className={`card ${styles.banner} ${styles.bannerDone}`} role="status">
          <span className={styles.bannerIcon}><Icon name="check" size={20} /></span>
          <div><b>{tx.doneTitle}</b><p className="small">{tx.doneBody}</p></div>
        </div>
      )}

      <div className={styles.tabs} role="tablist" aria-label={t.title[lang]}>
        {(['lessons', 'projects', 'practice', 'terms'] as Tab[]).map((k) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? `${styles.tab} ${styles.tabOn}` : styles.tab} onClick={() => setTab(k)}>
            {k === 'lessons' ? tx.tabLessons : k === 'projects' ? <>{tx.tabProjects} · <span className="n">{projects.length}</span></> : k === 'practice' ? tx.tabPractice : <>{tx.tabTerms} · <span className="n">{info.terms[lang].length}</span></>}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        <div className={styles.mainCol} role="tabpanel">
          {tab === 'lessons' && t.modules.map((m, mi) => {
            const mls = m.lessons.map((id) => ls.find((l) => l.id === id)!);
            const mDone = mls.filter((l) => lessonStatus(learning, l.id) === 'completed').length;
            return (
              <section key={mi} className={styles.module}>
                <div className={styles.moduleHead}>
                  <h2 className="h3">{mi + 1}. {m.title[lang]}</h2>
                  <span className="meta"><span className="n">{mDone}/{mls.length}</span> · {formatDuration(mls.reduce((s, l) => s + l.minutes, 0), lang)}</span>
                </div>
                {mls.map((l) => (
                  <LessonRow key={l.id} lesson={l} index={ls.indexOf(l)} state={rowState(l.id)} lang={lang}
                    step={learning.lessons[l.id]?.step ?? null} onOpen={() => open(l.id)} />
                ))}
              </section>
            );
          })}
          {tab === 'projects' && (projects.length
            ? projects.map((l) => <LessonRow key={l.id} lesson={l} index={ls.indexOf(l)} state={rowState(l.id)} lang={lang} onOpen={() => open(l.id)} />)
            : <p className="txt">{tx.noProjects}</p>)}
          {tab === 'practice' && practiceCard}
          {tab === 'terms' && (
            <div className={styles.terms}>{info.terms[lang].map((w) => <button key={w} type="button" className="chip" onClick={() => go('glossary')}>{w}</button>)}</div>
          )}
        </div>

        <aside className={styles.side}>
          <div className={`card solid ${styles.sideCard}`}>
            <b className="h3">{tx.skills}</b>
            {info.skills.map((s) => (
              <div key={s.en} className={styles.skill}>
                <span style={{ color: status === 'done' ? 'var(--ok)' : 'var(--text-faint)' }}><Icon name="check" size={15} /></span>
                <span>{s[lang]}</span>
              </div>
            ))}
          </div>
          {info.project && projects[0] && (
            <div className={`card ${styles.sideCard} ${styles.projectCard}`}>
              <span className="chip adv" style={{ alignSelf: 'flex-start' }}>{tx.trackProject}</span>
              <b className={styles.projectTitle}>{projects[0].title[lang].replace(/^(פרויקט|Project):\s*/, '')}</b>
              <p className="small">{info.project[lang]}</p>
            </div>
          )}
          {tab !== 'practice' && practiceCard}
          <div className={`card solid ${styles.sideCard}`}>
            <div className={styles.sideHead}><b className="h3">{tx.terms}</b><span className="meta" style={{ marginInlineStart: 'auto' }}>{tx.termsHint}</span></div>
            <div className={styles.terms}>{info.terms[lang].map((w) => <button key={w} type="button" className="chip" onClick={() => go('glossary')}>{w}</button>)}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
