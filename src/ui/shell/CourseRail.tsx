import { useEffect } from 'react';
import { LESSONS } from '@core/lessons/lessons';
import { useLang } from '@ui/hooks/useLang';
import { useProgress } from '@ui/hooks/useProgress';
import { useRoute } from '@ui/hooks/useRoute';
import { SlidingPill, useSlidingPill } from '@ui/components/nav/SlidingPill';
import styles from './CourseRail.module.css';

/**
 * The course roadmap.
 *
 * Two deliberate product decisions, both from direct feedback:
 *
 *   1. ALWAYS OPEN. There is no toggle and no scrim. The roadmap is
 *      permanent context — where you are in the course — not a menu you
 *      summon. (The old toggle also carried a scrim bug: it shipped with the
 *      HTML `hidden` attribute, which beats any CSS display rule, so it
 *      could never appear while still holding pointer-events — an invisible
 *      click-blocker. Removing the toggle removes that whole class of bug
 *      rather than patching it.)
 *
 *   2. NO "OVERVIEW" BUTTON. The Chart Lab brand at the top of this rail
 *      already returns home from every route, so a second control doing the
 *      same thing was redundant chrome.
 */
export function CourseRail() {
  const { t, lang } = useLang();
  const { stateOf, completedCount } = useProgress();
  const { route, params, go } = useRoute();
  const activeLessonId = route === 'lesson' ? params.lessonId : null;
  // The same capsule the header uses, travelling vertically down the list.
  // `completedCount` is a dependency because a row's marker changing state can
  // reflow the list, which moves every row below it.
  const pill = useSlidingPill<HTMLElement>([activeLessonId, lang, completedCount]);

  // Keep the current chapter in view. On a narrow screen the rail is a
  // horizontal strip that scrolls, so chapter 7 sits off the end of it; on a
  // tall list the same is true vertically. `nearest` is what makes this safe
  // to run unconditionally — it does nothing when the row is already visible,
  // so it never yanks the page while someone is reading.
  useEffect(() => {
    const host = pill.ref.current;
    if (!host || !activeLessonId) return;
    host
      .querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [activeLessonId, pill.ref]);

  return (
    <aside className={styles.rail} aria-label={t('railAria')}>
      {/* The brand is the single way home, on every route. */}
      <a
        className={styles.brand}
        href="#/"
        onClick={(e) => {
          e.preventDefault();
          go('home');
        }}
        aria-label={t('brandHomeAria')}
      >
        <span className={styles.mark} aria-hidden="true">▲▼</span>
        <span className={styles.brandName}>{t('brandName')}</span>
      </a>

      <div className={styles.head}>
        <p className={styles.kicker}>{t('courseKicker')}</p>
        <h2 className={styles.courseName}>{t('courseName')}</h2>
        <div className={styles.progress}>
          <div className={styles.meter}>
            <span style={{ width: `${(completedCount / LESSONS.length) * 100}%` }} />
          </div>
          <span className={styles.count}>
            {completedCount}/{LESSONS.length}
          </span>
        </div>
      </div>

      <nav className={styles.list} aria-label={t('lessonsAria')} ref={pill.ref}>
        <SlidingPill rect={pill.rect} instant={pill.placed} />
        {LESSONS.map((lesson, i) => {
          const state = stateOf(lesson.id);
          const isCurrent = lesson.id === activeLessonId;
          return (
            <button
              key={lesson.id}
              type="button"
              className={[
                styles.item,
                styles[state],
                isCurrent ? styles.current : ''
              ].join(' ')}
              aria-current={isCurrent ? 'true' : undefined}
              data-active={isCurrent ? 'true' : undefined}
              onClick={() => go('lesson', { lessonId: lesson.id })}
            >
              <span className={styles.marker} aria-hidden="true">
                {state === 'completed' ? '' : i + 1}
              </span>
              <span className={styles.title}>{lesson.navLabel[lang]}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
