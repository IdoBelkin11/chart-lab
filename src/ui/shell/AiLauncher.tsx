// Deliberately NOT `from '@core/ai/index'`: that barrel re-exports the full
// engine (see its own top-level `import ... from './engine/matchingEngine.js'`),
// so importing even one light thing from it still evaluates the whole file —
// which is exactly the ~300 kB regression this specific import path caused
// once already. This component renders on every route and is not
// lazy-loaded; the AI/stock/compare routes are (see RouteView) precisely so
// a floating button elsewhere doesn't drag their weight in with it.
import { setAmbientLessonTopic } from '@core/ai/ambientTopic';
import { resolveCurrentTopic } from '@core/lessons/currentTopic';
import { useLang } from '@ui/hooks/useLang';
import { useProgress } from '@ui/hooks/useProgress';
import { useRoute } from '@ui/hooks/useRoute';
import styles from './AiLauncher.module.css';

/**
 * The tutor, reachable from anywhere.
 *
 * The header entry alone was not enough. The tools row is `overflow-x: auto`,
 * so on a narrow-ish window it scrolls — and the AI button, being first, was
 * the one that got clipped at the viewport edge. A flagship feature cannot
 * depend on the reader noticing a horizontally-scrolled nav.
 *
 * So it also gets a fixed launcher, present on every route. Two rules keep it
 * from becoming clutter:
 *
 *   · It is hidden on the tutor's own route — a button that navigates to the
 *     page you are already on is noise, and that page offers Back instead.
 *   · It is a single control anchored to the workspace corner, never a
 *     dismissible popup or an attention-seeking pulse.
 *
 * It is also the ONE place that connects `@core/lessons/currentTopic` (the
 * canonical "what is the user looking at" resolver) to the engine's ambient
 * topic. Both existed already and were fully wired to each other's types —
 * neither was ever actually CALLED, so "explain the chart" from inside a
 * lesson silently fell back to "no active lesson" every time. This is the
 * one connection that was missing.
 */
export function AiLauncher() {
  const { t, lang } = useLang();
  const { route, params, go } = useRoute();
  const { progress } = useProgress();

  if (route === 'ai') return null;

  const label = t('navAi');

  return (
    <button
      type="button"
      className={styles.launcher}
      onClick={() => {
        const topic = resolveCurrentTopic({
          activeLessonId: route === 'lesson' ? params.lessonId : null,
          progress,
          lang
        });
        setAmbientLessonTopic(topic?.kbTopicId ?? null);
        go('ai');
      }}
      aria-label={lang === 'he' ? `${label} — שאל שאלה על שוק ההון` : `${label} — ask a market question`}
      title={label}
    >
      <span className={styles.glyph} aria-hidden="true">✦</span>
      <span className={styles.text}>{label}</span>
    </button>
  );
}
