// ---------------------------------------------------------------------------
// Which lesson the learner is currently on, so "explain this chart" can
// answer about what is actually on screen.
//
// Deliberately its own module with NO other imports. It used to live at the
// top of matchingEngine.js, which is harmless for the engine itself (already
// pulls in the whole KB) but not for the UI: the one other caller of
// `setAmbientLessonTopic` is AiLauncher, which renders on every route and is
// NOT lazy-loaded — importing it from matchingEngine.js pulled the entire
// ~300 kB knowledge base into the eager bundle for a floating button on
// every page. Splitting the AI/stock/compare routes into an on-demand chunk
// (see RouteView) is worthless if a two-line function eagerly re-imports the
// thing it was trying to keep out.
//
// Measured, not assumed: main chunk went 335 kB -> 692 kB when this state
// lived in matchingEngine.js and AiLauncher imported it from there. Moving
// it here restored the split. If a future change makes this module import
// anything else, check `dist/assets` sizes again before shipping it.
// ---------------------------------------------------------------------------

let ambientLessonTopicId = null;

/** Set by the UI whenever the active lesson changes. */
export function setAmbientLessonTopic(kbTopicId) {
  ambientLessonTopicId = kbTopicId || null;
}

export function currentLessonTopicId() {
  return ambientLessonTopicId;
}
