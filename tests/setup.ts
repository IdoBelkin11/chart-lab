// Test-environment gaps, not product concerns.
//
// jsdom implements no layout engine, so a handful of browser APIs that the UI
// legitimately depends on simply do not exist there. Stubbing them here keeps
// the guards out of the components, where they would be dead code in every
// real browser.

// Charts observe their container to redraw when it resizes (see
// components/charts/Chart). jsdom never lays out, so an observer that
// records nothing is the correct
// stand-in.
class NoopResizeObserver implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = NoopResizeObserver;
}

// The course rail keeps the current chapter scrolled into view — which matters
// on a narrow screen, where the rail is a horizontal strip and chapter 7 sits
// off the end of it (see CourseRail). jsdom has no scrollable layout and does
// not implement the method at all, so calling it throws rather than no-ops.
// Stubbed here rather than guarded in the component: a `typeof === 'function'`
// check in the product would be dead code in every real browser, and would
// quietly swallow the day the call genuinely stops working.
if (typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}

// Same gap for element scrolling: a route change resets the workspace to the
// top (see RouteView), and jsdom does not implement Element.scrollTo.
if (typeof Element.prototype.scrollTo !== 'function') {
  Element.prototype.scrollTo = function scrollTo() {};
}

// …and window.scrollTo only logs "not implemented" (onboarding scrolls the
// window, since it has no shell workspace).
window.scrollTo = function scrollTo() {} as typeof window.scrollTo;

// Routes load on demand (React.lazy + Suspense, see RouteView): in the browser
// the first render shows the loading state for a moment, then the route. Most
// tests render and assert synchronously, as they did while the lesson and quiz
// routes were eager. So here each lazy() starts its import as soon as it is
// defined, and once that import has arrived, renders the module straight away
// — React 18 resolves a lazy synchronously when its thenable calls back
// synchronously. The code-split itself is unchanged and covered by
// contentSplit.test.ts and the production build.
import { beforeAll, vi } from 'vitest';
const lazyImports: Array<Promise<unknown>> = [];
(globalThis as { __lazyImports?: typeof lazyImports }).__lazyImports = lazyImports;
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  type Factory = Parameters<typeof actual.lazy>[0];
  const lazy = (factory: Factory) => {
    let loaded: Awaited<ReturnType<Factory>> | undefined;
    const pending = factory().then((m) => (loaded = m));
    (globalThis as { __lazyImports?: Array<Promise<unknown>> }).__lazyImports?.push(pending);
    return actual.lazy((() => (loaded ? { then: (done: (m: typeof loaded) => void) => done(loaded) } : pending)) as unknown as Factory);
  };
  return { ...actual, default: { ...actual, lazy }, lazy };
});
// …and every test file waits for those imports before its first test.
beforeAll(async () => { await Promise.all(lazyImports); });
