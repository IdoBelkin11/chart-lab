// ---------------------------------------------------------------------------
// A one-shot handoff from a lesson's "Something unclear?" buttons to the AI
// page: which action to perform, for which topic, and what to show as the
// user's own message in the transcript.
//
// Deliberately its own module with NO other imports — same reasoning as
// ambientTopic.js, which this sits right next to. LessonRoute is not
// lazy-loaded, so it must never import anything that drags the ~300kB
// engine along with it; a plain module-level variable costs nothing.
// Previously these buttons just called go('ai') with nothing set, landing
// the reader on the empty AI page having to type out the question
// themselves — this is what lets AiRoute perform the action immediately
// on arrival instead.
// ---------------------------------------------------------------------------

let pending = null;

/** Set by the lesson tutor buttons right before navigating to the AI page. */
export function setPendingTutorAction(action, topicId, questionLabel) {
  pending = { action, topicId, questionLabel };
}

/** Read once by the AI page on mount; clears itself so it only fires once. */
export function takePendingTutorAction() {
  const p = pending;
  pending = null;
  return p;
}
