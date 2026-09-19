// ---------------------------------------------------------------------------
// Hash routing.
//
// Hash-based rather than history-based on purpose: the app is deployed as a
// static site, so a deep link like /lesson/l3 would 404 on refresh without
// server rewrites. Hashes work anywhere, which also keeps the Firebase
// Hosting config simple.
//
// Routes are a small closed set, so they are typed — an unknown route is a
// compile error rather than a blank screen.
// ---------------------------------------------------------------------------
import { useCallback, useEffect, useState } from 'react';
import { isLessonId } from '@core/lessons/lessons';

export type RouteName =
  | 'home' | 'lesson' | 'quiz' | 'ai' | 'stock' | 'compare' | 'calculators' | 'glossary';

export interface RouteParams { lessonId?: string }

export interface Route { route: RouteName; params: RouteParams }

const FEATURE_ROUTES: RouteName[] = ['quiz', 'ai', 'stock', 'compare', 'calculators', 'glossary'];

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#\/?/, '');
  if (!raw) return { route: 'home', params: {} };
  const [head, second] = raw.split('/');
  if (head === 'lesson' && isLessonId(second)) return { route: 'lesson', params: { lessonId: second } };
  // Deep links to a bare lesson id (#l3) are still honoured: they were the
  // shareable URLs of the previous build and should not break.
  if (isLessonId(head)) return { route: 'lesson', params: { lessonId: head } };
  if (head === 'quiz' && isLessonId(second)) {
    // Practice scoped to a lesson travels in the URL rather than in a mutable
    // module variable — which is what previously let the quiz drift onto a
    // topic the learner had already left.
    return { route: 'quiz', params: { lessonId: second } };
  }
  if (FEATURE_ROUTES.includes(head as RouteName)) return { route: head as RouteName, params: {} };
  return { route: 'home', params: {} };
}

export function buildHash(route: RouteName, params: RouteParams = {}): string {
  if (route === 'home') return '#/';
  if (route === 'lesson' && params.lessonId) return `#/lesson/${params.lessonId}`;
  if (route === 'quiz' && params.lessonId) return `#/quiz/${params.lessonId}`;
  return `#/${route}`;
}

export function useRoute() {
  const [current, setCurrent] = useState<Route>(() =>
    parseHash(typeof location === 'undefined' ? '' : location.hash)
  );

  useEffect(() => {
    const onChange = () => setCurrent(parseHash(location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const go = useCallback((route: RouteName, params: RouteParams = {}) => {
    const next = buildHash(route, params);
    if (location.hash === next) return;   // no-op, so no spurious re-render
    location.hash = next;
  }, []);

  return { ...current, go };
}
