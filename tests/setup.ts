// Test-environment gaps, not product concerns.
//
// jsdom implements no layout engine, so a handful of browser APIs that the UI
// legitimately depends on simply do not exist there. Stubbing them here keeps
// the guards out of the components, where they would be dead code in every
// real browser.

// The sliding selection capsule observes its container to re-measure when the
// webfont swaps in and the labels reflow (see components/nav/SlidingPill).
// jsdom never reflows, so an observer that records nothing is the correct
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
