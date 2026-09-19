import { LESSONS } from '@core/lessons/lessons';
import { nextLessonId } from '@core/lessons/currentTopic';
import { useLang } from '@ui/hooks/useLang';
import { useProgress } from '@ui/hooks/useProgress';
import { useRoute } from '@ui/hooks/useRoute';
import styles from './HomeRoute.module.css';

/**
 * The course overview.
 *
 * One primary action and nothing competing with it. The previous build
 * rendered the roadmap three times on this screen (rail, masthead column and
 * a syllabus band) and stacked stale progress meters; here the roadmap lives
 * only in the rail, and this screen answers exactly one question: what should
 * I do next.
 */
export function HomeRoute() {
  const { t, lang } = useLang();
  const { progress, completedCount } = useProgress();
  const { go } = useRoute();

  const resumeId = nextLessonId(progress.completed) ?? progress.lastVisited ?? LESSONS[0]!.id;
  const resume = LESSONS.find((l) => l.id === resumeId) ?? LESSONS[0]!;
  const finished = nextLessonId(progress.completed) === null;
  const fresh = completedCount === 0 && progress.visited.length === 0;

  const kicker = finished
    ? (lang === 'he' ? 'סיימת את המסלול' : 'Course complete')
    : fresh
      ? (lang === 'he' ? 'נתחיל' : 'Start here')
      : (lang === 'he' ? 'להמשיך מאיפה שעצרת' : 'Pick up where you left off');

  const cta = finished
    ? (lang === 'he' ? 'לחזור על שיעור' : 'Review a lesson')
    : fresh
      ? (lang === 'he' ? 'התחל ללמוד' : 'Start learning')
      : (lang === 'he' ? 'המשך ללמוד' : 'Continue learning');

  return (
    <div className={styles.page}>
      <section className={styles.masthead}>
        <p className={styles.kicker}>
          {t('courseName')}
          <i>{lang === 'he' ? `${LESSONS.length} שיעורים` : `${LESSONS.length} lessons`}</i>
        </p>
        {fresh && <p className={styles.freshNote}>{t('freshWelcome')}</p>}
        <h1 className={styles.headline}>{t('heroTitle')}</h1>
        <p className={styles.lead}>{t('heroBody')}</p>

        <div className={styles.stat}>
          <span className={styles.statNum}>
            {completedCount}
            <i>/{LESSONS.length}</i>
          </span>
          <span className={styles.statLabel}>
            {lang === 'he' ? 'שיעורים הושלמו' : 'lessons completed'}
          </span>
        </div>
      </section>

      <section className={styles.resume} aria-labelledby="resume-heading">
        <p className={styles.resumeKicker}>{kicker}</p>
        <h2 id="resume-heading" className={styles.resumeTitle}>
          {resume.title[lang]}
        </h2>
        <p className={styles.resumeMeta}>
          {lang === 'he'
            ? `שיעור ${resume.index + 1} מתוך ${LESSONS.length}`
            : `Lesson ${resume.index + 1} of ${LESSONS.length}`}
        </p>
        <div className={styles.track}>
          <span style={{ width: `${(completedCount / LESSONS.length) * 100}%` }} />
        </div>
        <button
          type="button"
          className={styles.cta}
          onClick={() => go('lesson', { lessonId: resume.id })}
        >
          {cta}
        </button>
      </section>

      <section className={styles.band}>
        <h2 className={styles.bandTitle}>{t('methodTitle')}</h2>
        <ol className={styles.method}>
          {(['pathStep1', 'pathStep2', 'pathStep3', 'pathStep4'] as const).map((key, i) => (
            <li key={key}>
              <span className={styles.methodNum}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.methodText}>{t(key)}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
