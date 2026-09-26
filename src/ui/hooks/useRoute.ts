// ---------------------------------------------------------------------------
// Hash routing.
//
// Hash-based rather than history-based on purpose: the app is deployed as a
// static site, so a deep link like /lesson/T4 would 404 on refresh without
// server rewrites. Hashes work anywhere, which also keeps hosting config
// simple.
//
// Routes are a small closed set, so they are typed — an unknown route is a
// compile error rather than a blank screen.
//
// LESSON IDS ARE CURRICULUM IDS (T4, P2, …). The previous build's ids are
// still honoured everywhere they can appear — `#/lesson/l1`, the bare `#l1`
// it shared, `#/quiz/l1` — and a lesson link is normalised to the curriculum
// lesson that now carries that content, so no old link or bookmark breaks.
// ---------------------------------------------------------------------------
import { useCallback, useEffect, useState } from 'react';
import { isLessonId as isLegacyLessonId } from '@core/lessons/lessons';
import { LEGACY_TO_LESSON, isTrackId, lessonById } from '@core/curriculum/curriculum';
import { LESSON_META } from '@core/lessons/content/meta';
import type { TrackId } from '@core/curriculum/curriculum';

export type RouteName =
  | 'home' | 'onboarding' | 'track' | 'lesson' | 'practice' | 'complete' | 'quiz' | 'ai' | 'stock' | 'compare' | 'tools' | 'glossary';

/** The calculators under #/tools/<id>. */
export type ToolId = 'position' | 'rr' | 'compound' | 'dcf' | 'pnl';
export const TOOL_IDS: readonly ToolId[] = ['position', 'rr', 'compound', 'dcf', 'pnl'];

/** `view` is a sub-screen: the practice session ('run'), the next-track choice ('next'), or a tool. */
export interface RouteParams { lessonId?: string; trackId?: TrackId; view?: 'run' | 'next' | ToolId }

export interface Route { route: RouteName; params: RouteParams }

const FEATURE_ROUTES: RouteName[] = ['onboarding', 'quiz', 'ai', 'stock', 'compare', 'tools', 'glossary'];

/** A curriculum lesson id for either a curriculum id or a previous-build id, else null. */
export function toLessonId(id: string | undefined): string | null {
  if (!id) return null;
  if (LEGACY_TO_LESSON[id]) return LEGACY_TO_LESSON[id]!;
  return lessonById(id) ? id : null;
}

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#\/?/, '');
  if (!raw) return { route: 'home', params: {} };
  const [head, second, third] = raw.split('/');
  if (head === 'lesson') {
    const id = toLessonId(second);
    if (id) return { route: 'lesson', params: { lessonId: id } };
  }
  if (head === 'track' && isTrackId(second)) return { route: 'track', params: { trackId: second } };
  if (head === 'practice' && isTrackId(second)) return { route: 'practice', params: third === 'run' ? { trackId: second, view: 'run' } : { trackId: second } };
  if (head === 'tools' && TOOL_IDS.includes(second as ToolId)) return { route: 'tools', params: { view: second as ToolId } };
  // The previous build's calculators page is now the Tools hub.
  if (head === 'calculators') return { route: 'tools', params: {} };
  if (head === 'complete' && isTrackId(second)) return { route: 'complete', params: third === 'next' ? { trackId: second, view: 'next' } : { trackId: second } };
  // Deep links to a bare old lesson id (#l3) were the shareable URLs of the
  // previous build and should not break.
  if (isLegacyLessonId(head)) return { route: 'lesson', params: { lessonId: LEGACY_TO_LESSON[head!]! } };
  // Practice scoped to a lesson travels in the URL rather than in a mutable
  // module variable — which is what previously let the quiz drift onto a
  // topic the learner had already left. The id is the one its questions carry:
  // the previous build's (l3) while the lesson still uses that build's content, else the curriculum's (F2, T2).
  const quizId = head === 'quiz' && second ? (isLegacyLessonId(second) ? second : lessonById(second) ? LESSON_META[second]?.legacyId ?? second : null) : null;
  if (quizId) return { route: 'quiz', params: { lessonId: quizId } };
  if (FEATURE_ROUTES.includes(head as RouteName)) return { route: head as RouteName, params: {} };
  return { route: 'home', params: {} };
}

export function buildHash(route: RouteName, params: RouteParams = {}): string {
  if (route === 'home') return '#/';
  if (route === 'lesson' && params.lessonId) return `#/lesson/${toLessonId(params.lessonId) ?? params.lessonId}`;
  if (route === 'track' && params.trackId) return `#/track/${params.trackId}`;
  if (route === 'tools' && params.view) return `#/tools/${params.view}`;
  if ((route === 'practice' || route === 'complete') && params.trackId) return `#/${route}/${params.trackId}${params.view ? `/${params.view}` : ''}`;
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
