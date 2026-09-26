// The curriculum's building blocks, ported from the approved design
// (components.mjs): a track's badge and illustration, a syllabus row, a track
// card. Every screen that shows tracks or lessons composes these, so a track
// looks the same on the home screen, its own page and the rail.
import type { CSSProperties } from 'react';
import type { Lang } from '@core/types/kb';
import type { CurriculumLesson, TrackId } from '@core/curriculum/curriculum';
import { LEVELS, formatDuration, lessonsOf, trackById, trackMinutes } from '@core/curriculum/curriculum';
import type { TrackStatus } from '@core/progress/learning';
import { Icon } from '@ui/components/icons/Icons';
import styles from './Curriculum.module.css';

export const trackColor = (id: TrackId) => `var(--track-${id})`;

/** The track's two-letter badge in its own colour. */
export function TrackMono({ id, size = 40, lang }: { id: TrackId; size?: number; lang: Lang }) {
  const c = trackColor(id);
  const style: CSSProperties = {
    width: size, height: size, borderRadius: Math.round(size * 0.32), fontSize: Math.round(size * 0.33),
    background: `color-mix(in srgb, ${c} var(--mono-tint), transparent)`, color: c,
    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${c} 30%, transparent)`
  };
  return <span className={styles.mono} style={style} aria-hidden="true">{trackById(id).abbr[lang]}</span>;
}

/** A small illustration of what the track is about (decorative). */
export function TrackArt({ id }: { id: TrackId }) {
  const w = 240, h = 120;
  const svg = (children: JSX.Element) => <svg viewBox={`0 0 ${w} ${h}`} className={styles.art} aria-hidden="true">{children}</svg>;
  switch (id) {
    case 'T': {
      const price = [92, 98, 95, 101, 97, 104, 100, 108, 104, 111, 108, 115];
      const pts = price.map((v, i) => `${14 + i * 19.3},${h - 10 - (v - 88) * 3.4}`).join(' ');
      const ma = price.map((_, i) => price.slice(Math.max(0, i - 3), i + 1).reduce((a, b, _k, arr) => a + b / arr.length, 0));
      const mpts = ma.map((v, i) => `${14 + i * 19.3},${h - 10 - (v - 88) * 3.4}`).join(' ');
      return svg(<><polyline points={pts} fill="none" stroke="var(--up)" strokeWidth="2.2" strokeLinejoin="round" /><polyline points={mpts} fill="none" stroke="var(--learn)" strokeWidth="2" strokeLinejoin="round" /></>);
    }
    case 'F': {
      const rows: Array<[number, 'd' | 'u']> = [[0.55, 'd'], [0.38, 'd'], [0.25, 'd'], [0.3, 'u'], [0.48, 'u'], [0.66, 'u']];
      return svg(<>{rows.map(([f, s], i) => <rect key={i} x={w - 16 - f * (w - 30)} y={10 + i * ((h - 20) / 6) + (i > 2 ? 6 : 0)} width={f * (w - 30)} height={(h - 20) / 6 - 5} rx="4" fill={s === 'd' ? 'var(--down)' : 'var(--up)'} fillOpacity="0.35" />)}<line x1="10" x2={w - 10} y1={h / 2 + 3} y2={h / 2 + 3} stroke="var(--learn)" strokeDasharray="4 4" /></>);
    }
    case 'P':
      return svg(<>{[1, 0.55, 0.3, 0.16].map((f, i) => <rect key={i} x="12" y={12 + i * 26} width={f * (w - 24)} height="18" rx="6" fill="var(--adv)" fillOpacity={0.85 - i * 0.18} />)}</>);
    case 'R': {
      const segs: Array<[number, number, string]> = [[0, 0.6, 'var(--info)'], [0.6, 0.85, 'var(--adv)'], [0.85, 0.95, 'var(--learn-fill)'], [0.95, 1, 'var(--text-faint)']];
      const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 12;
      const p = (a: number) => [cx + r * Math.cos(2 * Math.PI * a - Math.PI / 2), cy + r * Math.sin(2 * Math.PI * a - Math.PI / 2)] as const;
      const arc = (a0: number, a1: number) => { const [x0, y0] = p(a0), [x1, y1] = p(a1); return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${a1 - a0 > 0.5 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`; };
      return svg(<>{segs.map(([a, b, c]) => <path key={a} d={arc(a, b - 0.006)} fill="none" stroke={c} strokeWidth="16" />)}</>);
    }
    case 'M': {
      const v = [3, 3, 3.5, 4, 4.5, 4.5, 4, 3.5, 3.5], sx = (w - 24) / v.length;
      let d = `M12 ${h - 12 - v[0]! * 16}`;
      v.forEach((x, i) => { d += ` H${12 + i * sx} V${h - 12 - x * 16} H${12 + (i + 1) * sx}`; });
      return svg(<path d={d} fill="none" stroke="var(--risk)" strokeWidth="3" strokeLinejoin="round" />);
    }
    case 'D':
      return svg(<><line x1="10" x2={w - 10} y1={h * 0.62} y2={h * 0.62} stroke="var(--text-faint)" strokeOpacity="0.5" /><polyline points={`10,${h * 0.78} ${w * 0.5},${h * 0.78} ${w - 10},10`} fill="none" stroke="var(--err)" strokeWidth="3" strokeLinejoin="round" /><circle cx={w * 0.62} cy={h * 0.62} r="5" fill="var(--ok)" /></>);
  }
}

const T = {
  he: { lessons: 'שיעורים', projects: 'פרויקטים', project: 'פרויקט', interactive: 'אינטראקטיבי', cont: 'המשך', start: 'התחילו', done: 'הושלם', locked: 'נעול', rec: 'מומלץ עכשיו', soon: 'בקרוב', inProgress: 'בתהליך', notStarted: 'לא התחלתם', step: 'שלב', opensAfter: (t: string) => `נפתח אחרי "${t}"` },
  en: { lessons: 'lessons', projects: 'projects', project: 'Project', interactive: 'Interactive', cont: 'Continue', start: 'Start', done: 'Completed', locked: 'Locked', rec: 'Recommended', soon: 'Coming soon', inProgress: 'In progress', notStarted: 'Not started', step: 'Step', opensAfter: (t: string) => `Opens after ${t}` }
} as const;
export const CURRICULUM_TEXT = T;

export type RowState = 'done' | 'current' | 'todo' | 'locked' | 'soon';

/** One syllabus row: number/check, title, level + time (+ step), kind chip, state or Continue. */
export function LessonRow({ lesson, index, state, lang, step, onOpen }: {
  lesson: CurriculumLesson; index: number; state: RowState; lang: Lang; step?: number | null; onOpen: () => void;
}) {
  const tx = T[lang];
  const done = state === 'done', cur = state === 'current', lock = state === 'locked', soon = state === 'soon';
  const num = done ? 'num done' : cur ? 'num cur' : lesson.kind === 'project' ? `num ${styles.proj}` : 'num';
  const endLabel = done ? tx.done : lock ? tx.locked : soon ? tx.soon : tx.notStarted;
  return (
    <div className={[styles.row, cur ? styles.rowCur : '', lock || soon ? styles.rowDim : ''].join(' ')}>
      <span className={num} style={{ width: 32, height: 32 }} aria-hidden="true">
        {done ? <Icon name="check" size={15} /> : lock ? <Icon name="lock" size={13} /> : index + 1}
      </span>
      <button type="button" className={styles.rowMain} onClick={onOpen} disabled={lock} aria-label={`${index + 1}. ${lesson.title[lang]} — ${cur ? tx.inProgress : endLabel}`}>
        <span className={styles.rowTitle}>{lesson.title[lang]}</span>
        <span className={`${styles.rowMeta} meta`}>
          {LEVELS[lesson.level][lang]} · <Icon name="clock" size={12} /> {formatDuration(lesson.minutes, lang)}
          {cur && step != null && <> · {tx.step} <span className="n">{step + 1}/7</span></>}
        </span>
      </button>
      {lesson.kind === 'project' && <span className="chip adv">{tx.project}</span>}
      {lesson.kind === 'interactive' && <span className="chip info"><Icon name="play" size={10} />{tx.interactive}</span>}
      {cur ? (
        <button type="button" className="btn sm" onClick={onOpen}>{tx.cont}<Icon name={lang === 'he' ? 'chevL' : 'chevR'} size={14} /></button>
      ) : soon ? (
        <span className="chip">{tx.soon}</span>
      ) : (
        <span className={`meta ${styles.rowEnd}`}>{endLabel}</span>
      )}
    </div>
  );
}

/** A track card: badge, title, levels, description, counts, meter, and its state. */
export function TrackCard({ id, status, done, lang, recommended = false, onOpen }: {
  id: TrackId; status: TrackStatus; done: number; lang: Lang; recommended?: boolean; onOpen: () => void;
}) {
  const tx = T[lang], t = trackById(id), ls = lessonsOf(id);
  const levels = [...new Set(ls.map((l) => l.level))].map((x) => LEVELS[x][lang]).join(' → ');
  const projects = ls.filter((l) => l.kind === 'project').length;
  const pct = Math.round((done / ls.length) * 100);
  return (
    <button type="button" onClick={onOpen} className={['card glass', styles.card, status === 'locked' ? styles.cardLocked : '', recommended ? styles.cardRec : ''].join(' ')}>
      <span className={styles.cardHead}>
        <TrackMono id={id} size={44} lang={lang} />
        <span className={styles.cardTitle}><span className="h3">{t.title[lang]}</span><span className="meta">{levels}</span></span>
        {recommended && <span className="chip solidLearn">{tx.rec}</span>}
      </span>
      <span className={`small ${styles.cardDesc}`}>{t.description[lang]}</span>
      <span className={styles.cardStats}>
        <span><span className="n">{ls.length}</span> {tx.lessons}</span>
        <span><Icon name="clock" size={13} /> {formatDuration(trackMinutes(id), lang)}</span>
        <span><span className="n">{projects}</span> {tx.projects}</span>
      </span>
      {status === 'locked' ? (
        <span className={`small ${styles.cardLock}`}><Icon name="lock" size={13} />{tx.opensAfter(trackById(t.prereq!.hard!).title[lang])}</span>
      ) : (
        <span className={styles.meterRow}>
          <span className="meter"><span style={{ width: `${pct}%`, background: status === 'done' ? 'var(--ok)' : undefined }} /></span>
          <span className="n meta">{done}/{ls.length}</span>
        </span>
      )}
      <span className={styles.cardCta}>
        {status === 'locked' ? <span className="chip"><Icon name="lock" size={12} />{tx.locked}</span>
          : status === 'done' ? <span className="chip ok"><Icon name="check" size={12} />{tx.done}</span>
          : <span className="btnText">{status === 'active' ? tx.cont : tx.start}<Icon name={lang === 'he' ? 'chevL' : 'chevR'} size={15} /></span>}
      </span>
    </button>
  );
}
