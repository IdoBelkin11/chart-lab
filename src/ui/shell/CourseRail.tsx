import { useEffect, useRef } from 'react';
import { TRACKS, TOTAL_LESSONS, lessonById, lessonsOf, trackById } from '@core/curriculum/curriculum';
import type { TrackId } from '@core/curriculum/curriculum';
import { hasContent } from '@core/curriculum/trackInfo';
import { completedIn, lessonStatus, practiceOpen, totalCompleted, trackStatus } from '@core/progress/learning';
import { useAppState } from '@ui/app/AppState';
import { useRoute } from '@ui/hooks/useRoute';
import { Icon } from '@ui/components/icons/Icons';
import { trackColor } from '@ui/components/curriculum/Curriculum';
import { useGlide } from '@ui/components/nav/Glide';
import styles from './CourseRail.module.css';

const TX = {
  he: { myProgress: 'ההתקדמות שלי', done: 'שיעורים הושלמו', track: 'מסלול', practice: 'תרגול', tools: 'כלים', trackPractice: 'תרגול המסלול', passed: 'עבר', open: 'פתוח', soon: 'בקרוב', tracksAria: 'המסלולים שלי', lessonsAria: 'שיעורי המסלול' },
  en: { myProgress: 'MY PROGRESS', done: 'lessons done', track: 'TRACK', practice: 'Practice', tools: 'Tools', trackPractice: 'Track practice', passed: 'Passed', open: 'Open', soon: 'Soon', tracksAria: 'My tracks', lessonsAria: 'Track lessons' }
} as const;

/**
 * The rail, at the INLINE-END edge (left in Hebrew, right in English) and
 * second in the DOM so tab order follows the eye. Context-aware, as designed:
 *
 *   · inside a track or a lesson — that track's lessons, its progress and
 *     its practice (Artifact: trackRail)
 *   · anywhere else — overall progress and every track (Artifact: homeRail)
 *
 * ALWAYS OPEN, never a toggle: the roadmap is context, not a menu. The brand
 * in the topbar is the way home, so the rail carries no "overview" control.
 */
export function CourseRail() {
  const { route, params } = useRoute();
  const inTrack: TrackId | null =
    route === 'track' || route === 'practice' || route === 'complete' ? params.trackId ?? null : route === 'lesson' && params.lessonId ? lessonById(params.lessonId)?.track ?? null : null;
  return inTrack ? <TrackRail track={inTrack} current={route === 'lesson' ? params.lessonId ?? null : null} /> : <HomeRail />;
}

function HomeRail() {
  const { lang, learning, t } = useAppState();
  const { route, go } = useRoute();
  const tx = TX[lang];
  const done = totalCompleted(learning);
  const pct = Math.round((done / TOTAL_LESSONS) * 100);
  return (
    <aside className={`${styles.rail} glass`} aria-label={t('railAria')}>
      <div className={styles.head}>
        <span className={styles.kick}>{tx.myProgress}</span>
        <div className={styles.overall}>
          <span className="ring" style={{ ['--p' as string]: pct }}><span className="n" style={{ fontSize: 14 }}>{pct}%</span></span>
          <div className={styles.overallText}><span className={`${styles.title} n`}>{done}/{TOTAL_LESSONS}</span><span className="meta">{tx.done}</span></div>
        </div>
      </div>
      <hr className="hr" />
      <nav className={styles.rows} aria-label={tx.tracksAria}>
        {TRACKS.map((tr) => {
          const st = trackStatus(learning, tr.id), n = lessonsOf(tr.id).length;
          return (
            <button key={tr.id} type="button" className={st === 'locked' ? `${styles.row} ${styles.locked}` : styles.row} onClick={() => go('track', { trackId: tr.id })}>
              <span className={styles.dot} style={{ background: trackColor(tr.id) }} aria-hidden="true" />
              <span className={styles.label}>{tr.title[lang]}</span>
              <span className={styles.end}>
                {st === 'locked' ? <Icon name="lock" size={14} /> : st === 'done' ? <span style={{ color: 'var(--ok)' }}><Icon name="check" size={15} /></span> : <span className="n">{completedIn(learning, tr.id)}/{n}</span>}
              </span>
            </button>
          );
        })}
      </nav>
      <div className={styles.foot}>
        <button type="button" className={route === 'quiz' ? `${styles.row} ${styles.on}` : styles.row} onClick={() => go('quiz')}><Icon name="target" size={17} /><span className={styles.label}>{tx.practice}</span></button>
        <button type="button" className={route === 'tools' ? `${styles.row} ${styles.on}` : styles.row} onClick={() => go('tools')}><Icon name="calc" size={17} /><span className={styles.label}>{tx.tools}</span></button>
      </div>
    </aside>
  );
}

function TrackRail({ track, current }: { track: TrackId; current: string | null }) {
  const { lang, learning } = useAppState();
  const { route, go } = useRoute();
  const tx = TX[lang];
  const ls = lessonsOf(track), done = completedIn(learning, track);
  const locked = trackStatus(learning, track) === 'locked';
  const glide = useGlide<HTMLElement>([current, lang, track]);
  const list = glide.ref;

  // Keep the open lesson in view. `nearest` does nothing when the row is
  // already visible, so this never yanks the list while someone is reading.
  useEffect(() => {
    if (!current) return;
    list.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [current]);

  const passed = !!learning.practice[track]?.passed;
  return (
    <aside className={`${styles.rail} glass`} aria-label={tx.lessonsAria}>
      <div className={styles.head}>
        <span className={styles.kick}>{tx.track}</span>
        <span className={styles.title}>{trackById(track).title[lang]}</span>
        <div className={styles.meterRow}>
          <div className="meter" aria-hidden="true"><span style={{ width: `${(done / ls.length) * 100}%` }} /></div>
          <span className={`${styles.meterVal} n`}>{done}/{ls.length}</span>
        </div>
      </div>
      <hr className="hr" />
      <nav className={`${styles.rows} ${glide.hostClass}`} aria-label={tx.lessonsAria} ref={list}>
        {glide.pill}
        {ls.map((l, i) => {
          const st = lessonStatus(learning, l.id), isCur = l.id === current;
          const num = st === 'completed' ? 'num done' : isCur ? 'num cur' : l.kind === 'project' ? `num ${styles.proj}` : st === 'in-progress' ? `num ${styles.learning}` : 'num';
          const soon = !hasContent(l.id);
          return (
            <button
              key={l.id}
              type="button"
              className={[styles.row, isCur ? styles.on : '', locked ? styles.locked : ''].join(' ')}
              aria-current={isCur ? 'true' : undefined}
              data-active={isCur ? 'true' : undefined}
              data-state={st}
              onClick={() => go('lesson', { lessonId: l.id })}
            >
              <span className={num} aria-hidden="true">
                {st === 'completed' ? <Icon name="check" size={13} /> : locked ? <Icon name="lock" size={11} /> : i + 1}
              </span>
              <span className={styles.label}>{shortTitle(l.title[lang])}</span>
              {soon && st === 'not-started' && <span className={styles.end}>{tx.soon}</span>}
            </button>
          );
        })}
      </nav>
      <button type="button" className={`${styles.row} ${styles.practice}${route === 'practice' ? ` ${styles.on}` : ''}`} aria-current={route === 'practice' ? 'page' : undefined} onClick={() => go('practice', { trackId: track })}>
        <span className="num" aria-hidden="true"><Icon name="target" size={12} /></span>
        <span className={styles.label}>{tx.trackPractice}</span>
        <span className={styles.end}>{passed ? tx.passed : practiceOpen(learning, track) ? tx.open : <Icon name="lock" size={12} />}</span>
      </button>
    </aside>
  );
}

/** The design's short title: the part before a colon ("RSI: מדידת מומנטום" → "RSI"), or a project's name after "Project:". */
function shortTitle(s: string): string {
  const i = s.indexOf(':');
  if (i > 0 && /^(פרויקט|Project)/.test(s)) return s.slice(i + 1).trim();
  return i > 0 && i < 28 ? s.slice(0, i) : s;
}
