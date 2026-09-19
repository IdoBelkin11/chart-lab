import { lazy, Suspense, useEffect, useRef } from 'react';
import { useRoute } from '@ui/hooks/useRoute';
import { rememberOrigin } from '@ui/shell/returnTo';
import { HomeRoute } from '@ui/routes/home/HomeRoute';
import { LessonRoute } from '@ui/routes/lesson/LessonRoute';
import { QuizRoute } from '@ui/routes/quiz/QuizRoute';
import { CalculatorsRoute } from '@ui/routes/calculators/CalculatorsRoute';
import { GlossaryRoute } from '@ui/routes/glossary/GlossaryRoute';
import styles from './RouteView.module.css';

/**
 * Three routes are loaded on demand; four are not.
 *
 * This is not "code-split everything" — home, lesson, quiz and calculators
 * stay eager because they are the reading path and cost little. The three
 * below share one heavy dependency graph:
 *
 *   AiRoute     → @core/ai/index     → engine → kb   (~295 kB of source)
 *   StockRoute  ┐
 *   CompareRoute┘→ market/stockLookup → entity/tickers
 *                                     → context/conversationContext
 *                                     → engine/matchingEngine → kb
 *
 * That second path is the subtle one, and it is why lazy-loading the AI
 * route ALONE did nothing measurable: the stock and compare routes reach
 * the same knowledge base through the market layer, so while either stayed
 * eager the KB stayed in the main chunk. All three have to cross the
 * boundary together, or none of them does.
 *
 * Measured after the change, not estimated: main chunk 675 kB → 324 kB
 * (gzip 220 kB → 107 kB), with the engine + KB now a 338 kB chunk fetched
 * only when one of these three routes is opened. Vite's 500 kB warning is
 * gone as a side effect. If a future change makes anything eager import
 * `@core/ai`, that gain silently reverses — check `dist/assets` sizes.
 */
const AiRoute = lazy(() =>
  import('@ui/routes/ai/AiRoute').then((m) => ({ default: m.AiRoute }))
);
const StockRoute = lazy(() =>
  import('@ui/routes/stock/StockRoute').then((m) => ({ default: m.StockRoute }))
);
const CompareRoute = lazy(() =>
  import('@ui/routes/compare/CompareRoute').then((m) => ({ default: m.CompareRoute }))
);

/** One loading state for every on-demand route, so they cannot drift apart. */
function Loading() {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
    </div>
  );
}

/**
 * Renders the active route inside the workspace.
 *
 * A plain switch rather than a router library: there are seven routes, they
 * are a closed typed set, and adding a dependency to map a hash to a
 * component would be more machinery than the problem needs.
 */
export function RouteView() {
  const { route, params } = useRoute();

  // Paging to the next lesson must start at the top of it. The workspace is
  // the scroll container (not the window — see AppShell), so scrolling the
  // window here would do nothing; this is why the previous behaviour left
  // the reader stranded at the foot of a fresh page.
  //
  // The FIRST render is skipped on purpose: a deep link that arrives already
  // scrolled (a restored session, a browser's own scroll restoration) should
  // be left where it is. Only an in-app navigation resets it.
  // Remember where the reader was before they opened the tutor, so its Back
  // control returns them to that exact page rather than to the course home.
  useEffect(() => {
    rememberOrigin(route, params);
  }, [route, params]);

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const workspace = document.getElementById('workspace');
    // `instant`, not smooth: this is a page change, and animating a long
    // lesson back to the top reads as the app losing its place.
    workspace?.scrollTo({ top: 0, behavior: 'instant' });
  }, [route, params.lessonId]);

  switch (route) {
    case 'home':
      return <HomeRoute />;
    case 'lesson':
      return <LessonRoute lessonId={params.lessonId!} />;
    case 'quiz':
      // The lesson scope travels in the URL, so scoped practice is
      // shareable and cannot drift onto a topic the learner already left.
      return <QuizRoute lessonId={params.lessonId} />;
    case 'ai':
      return (
        <Suspense fallback={<Loading />}>
          <AiRoute />
        </Suspense>
      );
    case 'stock':
      return (
        <Suspense fallback={<Loading />}>
          <StockRoute />
        </Suspense>
      );
    case 'compare':
      return (
        <Suspense fallback={<Loading />}>
          <CompareRoute />
        </Suspense>
      );
    case 'calculators':
      return <CalculatorsRoute />;
    // Eager: it is pure term data with no market or engine dependency, so it
    // costs almost nothing and is the page a stuck reader wants instantly.
    case 'glossary':
      return <GlossaryRoute />;
  }
}
