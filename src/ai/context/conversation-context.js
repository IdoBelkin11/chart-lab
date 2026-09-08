// ---------------------------------------------------------------------------
// Conversation context: entity memory.
//
// Before this file, the ONLY thing carried between turns was `lastTopicId`
// — a single KB-entry-id string like 'pe' or 'bear-market'. That's enough
// for "explain simpler" / "is that high?" about a CONCEPT, but it has no
// idea a company was ever mentioned: stock-intent.js resolved a ticker
// fresh from each message with zero memory. "ספר לי על NVIDIA" followed by
// "מה ה-P/E שלה?" (what's HER P/E) has no company name in the second
// message at all — nothing to resolve without entity memory.
//
// This is a genuinely separate axis from lastTopicId, not a replacement for
// it: a conversation can be "about" a KB concept (P/E in general) and/or
// "about" a specific company (NVIDIA) at the same time, and the two can
// diverge (asking a generic question about P/E while NVIDIA is still the
// active entity shouldn't silently answer about NVIDIA's P/E).
//
// Design: a plain object, created and threaded by the caller (chat-ui.js),
// passed as an additional, OPTIONAL argument to generateAiReply — every
// existing call site and test that only passes (text, lang, lastTopicId)
// keeps working exactly as before; entity memory simply doesn't apply.
// ---------------------------------------------------------------------------

function createConversationContext(){
  return {
    activeEntity: null,    // { ticker, exchange, name } | null
    previousEntity: null,  // the entity active before the current one — enables "who is more X, A or B"
    activeMetric: null,    // last stock FACET discussed for the active entity (e.g. 'pe'), for "is that high?"
    turnsSinceEntityTouch: 0, // see noteTurnPassed/touchEntityContext/isEntityContextStale below
  };
}

// ---------------------------------------------------------------------------
// Expiration: activeEntity must not stay relevant forever. Without this, a
// company mentioned once early in a long conversation keeps answering
// unrelated later pronoun questions indefinitely — confirmed as a real
// case: after Apple, five unrelated P/E questions later, "is that high?"
// still silently answered about Apple.
//
// Deliberately simple, per "don't over-engineer": a turn counter, not a
// wall-clock timeout (conversations don't have a meaningful real-time
// deadline) and not a semantic "topic drift" detector (much harder to get
// right, and a turn count already solves the actual reported problem).
// `noteTurnPassed` increments it once per generateAiReply call;
// `touchEntityContext` resets it to 0 whenever the entity is genuinely
// still relevant (a direct mention, a pronoun-resolved answer, or a
// comparison naming it). Once EXPIRE_AFTER_TURNS unrelated turns pass with
// no touch, the context is treated as stale and cleared before the
// pronoun/comparison paths get to use it.
// ---------------------------------------------------------------------------
const EXPIRE_AFTER_TURNS = 3;

function noteTurnPassed(context){
  if(!context) return;
  context.turnsSinceEntityTouch = (context.turnsSinceEntityTouch || 0) + 1;
}
function touchEntityContext(context){
  if(!context) return;
  context.turnsSinceEntityTouch = 0;
}
function isEntityContextStale(context){
  return !!context && context.activeEntity && context.turnsSinceEntityTouch > EXPIRE_AFTER_TURNS;
}
function expireEntityContextIfStale(context){
  if(isEntityContextStale(context)){
    context.activeEntity = null;
    context.previousEntity = null;
    context.activeMetric = null;
  }
}

// ---------------------------------------------------------------------------
// Pronoun / implicit-reference detection.
//
// Deliberately pattern-based over a short list of possessive/demonstrative
// forms, the same style already used for KB-topic follow-ups
// (isHighLowFollowup, isSimplerRequest in matching-engine.js) — not an
// attempt at general pronoun resolution, just the specific forms that come
// up when a company is the likely referent.
//
// Split into two groups because they resolve differently:
//   - GENERIC: "מה ה-P/E שלה" (her P/E) names the metric right there in the
//     message — resolving the pronoun to the active entity is all that's
//     needed; classifyStockIntent() reads the metric from the message as
//     normal.
//   - METRIC-IMPLICIT: "זה גבוה?" (is that high?) names NO metric at all —
//     it only makes sense relative to whatever metric context.activeMetric
//     says was just discussed, the same way tryContextualNumberFollowup()
//     already works for KB concepts (see matching-engine.js).
// ---------------------------------------------------------------------------
const GENERIC_ENTITY_PRONOUN_KW = [
  'שלה','שלו','שלהם','מה איתה','מה איתו','her','his','its',"it's"
];
const METRIC_IMPLICIT_PRONOUN_KW = [
  'זה גבוה','זה נמוך','זה טוב','זה רע','that high','that low','is that high','is that low'
];
function looksLikeEntityPronounReference(norm){
  return GENERIC_ENTITY_PRONOUN_KW.some(k => norm.includes(normalizeText(k)))
      || METRIC_IMPLICIT_PRONOUN_KW.some(k => norm.includes(normalizeText(k)));
}
function looksLikeMetricImplicitReference(norm){
  return METRIC_IMPLICIT_PRONOUN_KW.some(k => norm.includes(normalizeText(k)));
}

// ---------------------------------------------------------------------------
// Entity-comparison detection ("who is more profitable, A or B") — only
// meaningful once two distinct entities are already in context; the phrase
// itself never names either company.
// ---------------------------------------------------------------------------
const ENTITY_COMPARISON_KW = [
  'מי יותר','מי ה','איזה מהם','מה עדיף מביניהם','מי עדיף','מי הכי',
  'who is more','which is more','which one is more','compare them','who has higher','who has better'
];
function looksLikeEntityComparison(norm){
  return ENTITY_COMPARISON_KW.some(k => norm.includes(normalizeText(k)));
}

// Records a newly-resolved company as the active entity, shifting the old
// active entity into `previousEntity` — but only when it's actually a
// DIFFERENT company (asking two questions in a row about the same company
// shouldn't push it into "previous" and lose it).
function recordActiveEntity(context, company){
  if(!context || !company) return;
  if(context.activeEntity && context.activeEntity.ticker !== company.ticker){
    context.previousEntity = context.activeEntity;
  }
  context.activeEntity = { ticker: company.ticker, exchange: company.exchange, name: company.name };
  context.activeMetric = null; // a new entity resets "is THAT high" until a metric is actually discussed
  touchEntityContext(context);
}

function recordActiveMetric(context, facet){
  if(!context) return;
  if(facet && facet !== 'snapshot' && facet !== 'full') context.activeMetric = facet;
}
