import type { Route, RouteName, RouteParams } from '@ui/hooks/useRoute';

/**
 * Where the tutor was opened from.
 *
 * The tutor's Back control used to go home unconditionally, which is wrong
 * whenever the reader arrived from somewhere else: asking a question in the
 * middle of lesson 2 and being returned to the course overview loses their
 * place, and the lesson they were reading is the one thing they obviously
 * wanted to get back to.
 *
 * Module state rather than context or a URL parameter, deliberately:
 *
 *   · It is a UI breadcrumb, not application state — nothing renders from
 *     it, so putting it in context would re-render every consumer for a
 *     value none of them display.
 *   · Keeping it out of the URL means a shared `#/ai` link cannot carry a
 *     stranger's browsing history into someone else's session.
 *
 * It is not persisted. A cold load straight to `#/ai` has no origin, and
 * Back correctly falls back to the course home.
 */
let origin: Route | null = null;

/** Records any route that is not the tutor itself. */
export function rememberOrigin(route: RouteName, params: RouteParams): void {
  if (route === 'ai') return;
  origin = { route, params };
}

/** Where Back should go, or null when the tutor was opened cold. */
export function originRoute(): Route | null {
  return origin;
}
