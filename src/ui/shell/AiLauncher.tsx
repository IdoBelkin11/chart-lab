// Deliberately NOT `from '@core/ai/index'`: that barrel re-exports the full
// engine (see its own top-level `import ... from './engine/matchingEngine.js'`),
// so importing even one light thing from it still evaluates the whole file —
// which is exactly the ~300 kB regression this specific import path caused
// once already. This component renders on every route and is not
// lazy-loaded; the AI/stock/compare routes are (see RouteView) precisely so
// a floating button elsewhere doesn't drag their weight in with it.
import { useCallback } from 'react';
import { setAmbientLessonTopic } from '@core/ai/ambientTopic';
import { resolveCurrentTopic } from '@core/lessons/currentTopic';
import { LESSON_TO_LEGACY, lessonById as curriculumLesson } from '@core/curriculum/curriculum';
import { LESSON_META } from '@core/lessons/content/meta';
import { lessonById } from '@core/lessons/lessons';
import { useLang } from '@ui/hooks/useLang';
import { useProgress } from '@ui/hooks/useProgress';
import { useRoute } from '@ui/hooks/useRoute';
import { Icon } from '@ui/components/icons/Icons';
import { useMedia, PHONE } from '@ui/hooks/useMedia';
import styles from './AiLauncher.module.css';

/**
 * Opens the tutor with the learner's current topic already set.
 *
 * The ONE place that connects `@core/lessons/currentTopic` (the canonical
 * "what is the user looking at" resolver) to the engine's ambient topic, so
 * "explain the chart" from inside a lesson knows which chart. Shared by the
 * desktop launcher and the phone tab bar, so the two cannot drift apart.
 */
export function useOpenTutor() {
  const { lang } = useLang();
  const { route, params, go } = useRoute();
  const { progress } = useProgress();
  return useCallback(() => {
    const open = route === 'lesson' ? params.lessonId : undefined;
    const lesson = open ? curriculumLesson(open) : undefined;
    if (lesson && !LESSON_TO_LEGACY[lesson.id]) {
      // A curriculum lesson with no previous-build counterpart: its tutor
      // topic (or its first knowledge-base topic) is the thing to ask about.
      setAmbientLessonTopic(LESSON_META[lesson.id]?.topic ?? lesson.kbTopics[0] ?? null);
    } else {
      const topic = resolveCurrentTopic({
        activeLessonId: lesson ? LESSON_TO_LEGACY[lesson.id] : null,
        progress,
        lang
      });
      setAmbientLessonTopic(topic?.kbTopicId ?? null);
    }
    go('ai');
  }, [route, params.lessonId, progress, lang, go]);
}

/**
 * The tutor, reachable from every screen: a glass capsule at the inline-start
 * corner (opposite the rail), carrying the lesson it will be asked about.
 * Hidden on the tutor's own route — a button to the page you are on is noise.
 */
export function AiLauncher() {
  const { t, lang } = useLang();
  const { route, params } = useRoute();
  const open = useOpenTutor();
  const phone = useMedia(PHONE);

  // On a phone the tutor is a tab in the bottom bar instead.
  if (route === 'ai' || phone) return null;

  const label = t('navAi');
  const openId = route === 'lesson' ? params.lessonId : undefined;
  const legacy = openId && LESSON_TO_LEGACY[openId] ? lessonById(LESSON_TO_LEGACY[openId]!) : undefined;
  const ctx = legacy ? legacy.navLabel[lang] : openId ? curriculumLesson(openId)?.title[lang] : undefined;

  return (
    <button
      type="button"
      className={`${styles.launcher} glass`}
      onClick={open}
      aria-label={lang === 'he' ? `${label} — שאל שאלה על שוק ההון` : `${label} — ask a market question`}
      title={label}
    >
      <span className={styles.mark} aria-hidden="true"><Icon name="spark" size={15} /></span>
      <span className={styles.text}>{label}</span>
      {ctx && <span className={`${styles.ctx} meta`}>{ctx}</span>}
    </button>
  );
}
