import { setAmbientLessonTopic } from '@core/ai/ambientTopic';
import { LEVELS, formatDuration, lessonById, lessonsOf, trackById } from '@core/curriculum/curriculum';
import { hasContent } from '@core/curriculum/trackInfo';
import { useAppState } from '@ui/app/AppState';
import { useRoute } from '@ui/hooks/useRoute';
import { Icon } from '@ui/components/icons/Icons';
import { TrackMono } from '@ui/components/curriculum/Curriculum';
import styles from './LessonPreview.module.css';

const TX = {
  he: {
    tracks: 'מסלולים', soon: 'בקרוב', writing: 'השיעור הזה עוד נכתב. זה מה שהוא ילמד:', steps: 'שלבי השיעור', lesson: 'שיעור', of: 'מתוך',
    meanwhile: 'בינתיים', nextAvailable: (n: number, t: string) => `לשיעור ${n}: ${t}`, backToTrack: 'חזרה למסלול',
    askTutor: 'לשאול את המורה על הנושא', askBody: 'המורה כבר מכיר את החומר של השיעור הזה ויכול להסביר אותו עכשיו.',
    interactive: 'אינטראקטיבי', project: 'פרויקט'
  },
  en: {
    tracks: 'Tracks', soon: 'Coming soon', writing: "This lesson is still being written. Here's what it will teach:", steps: 'Lesson steps', lesson: 'Lesson', of: 'of',
    meanwhile: 'Meanwhile', nextAvailable: (n: number, t: string) => `Go to lesson ${n}: ${t}`, backToTrack: 'Back to the track',
    askTutor: 'Ask the tutor about this topic', askBody: 'The tutor already knows this lesson’s material and can explain it now.',
    interactive: 'Interactive', project: 'Project'
  }
} as const;

/**
 * A lesson whose content is not written yet (decided 2026-09-25: show every
 * lesson, and be honest about the ones still being written). It says so, shows
 * exactly what the lesson will teach, and offers the two useful things to do
 * now: the nearest lesson that IS ready, and the tutor, which already knows
 * this lesson's knowledge-base topics.
 */
export function LessonPreview({ lessonId }: { lessonId: string }) {
  const { lang } = useAppState();
  const { go } = useRoute();
  const tx = TX[lang];
  const l = lessonById(lessonId)!;
  const t = trackById(l.track), ls = lessonsOf(l.track), idx = ls.indexOf(l);
  const ready = [...ls.slice(idx + 1), ...ls.slice(0, idx).reverse()].find((x) => hasContent(x.id));
  const chev = lang === 'he' ? 'chevL' : 'chevR';

  return (
    <div className={styles.page}>
      <nav className={styles.crumbs} aria-label={lang === 'he' ? 'פירורי לחם' : 'Breadcrumb'}>
        <a href="#/" onClick={(e) => { e.preventDefault(); go('home'); }}>{tx.tracks}</a>
        <Icon name={chev} size={13} />
        <a href={`#/track/${t.id}`} onClick={(e) => { e.preventDefault(); go('track', { trackId: t.id }); }}>{t.title[lang]}</a>
        <Icon name={chev} size={13} />
        <span aria-current="page">{l.title[lang]}</span>
      </nav>

      <section className={`glass ${styles.card}`}>
        <div className={styles.head}>
          <TrackMono id={t.id} size={48} lang={lang} />
          <div className={styles.titleBlock}>
            <span className="meta">{tx.lesson} <span className="n">{idx + 1}</span> {tx.of} <span className="n">{ls.length}</span> · {t.title[lang]}</span>
            <h1 className="h1">{l.title[lang]}</h1>
          </div>
          <span className="chip">{tx.soon}</span>
        </div>
        <div className={styles.meta}>
          <span>{LEVELS[l.level][lang]}</span>
          <span><Icon name="clock" size={14} /> {formatDuration(l.minutes, lang)}</span>
          {l.kind === 'interactive' && <span className="chip info"><Icon name="play" size={10} />{tx.interactive}</span>}
          {l.kind === 'project' && <span className="chip adv">{tx.project}</span>}
        </div>
        <p className="txt">{tx.writing}</p>
        {l.steps && (
          <ol className={styles.steps} aria-label={tx.steps}>
            {l.steps[lang].map((s, i) => (
              <li key={i}><span className="num">{i + 1}</span><span>{s}</span></li>
            ))}
          </ol>
        )}
      </section>

      <section className={styles.meanwhile}>
        <span className="label">{tx.meanwhile}</span>
        <div className={styles.actions}>
          {ready && (
            <button type="button" className="btn" onClick={() => go('lesson', { lessonId: ready.id })}>
              {tx.nextAvailable(ls.indexOf(ready) + 1, ready.title[lang])}<Icon name={chev} size={16} />
            </button>
          )}
          <button type="button" className="btnQuiet" onClick={() => go('track', { trackId: t.id })}>{tx.backToTrack}</button>
        </div>
        {l.kbTopics.length > 0 && (
          <button
            type="button"
            className={`solid ${styles.tutor}`}
            onClick={() => { setAmbientLessonTopic(l.kbTopics[0]!); go('ai'); }}
          >
            <span className={styles.aiMark} aria-hidden="true"><Icon name="spark" size={15} /></span>
            <span className={styles.tutorText}><b>{tx.askTutor}</b><span className="small">{tx.askBody}</span></span>
            <Icon name={chev} size={16} />
          </button>
        )}
      </section>
    </div>
  );
}
