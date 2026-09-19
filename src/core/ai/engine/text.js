// ---------------------------------------------------------------------------
// Text normalisation, shared by the engine, the intent layer and the
// conversation context.
//
// Extracted from matchingEngine.js: several modules need it, and leaving it
// there produced a circular import (engine -> intent -> engine). A leaf
// module with no dependencies of its own breaks the cycle.
// ---------------------------------------------------------------------------

export function normalizeText(s){
  return (s || '')
    .toLowerCase()
    .replace(/[°'"׳״.,!?;:()\[\]{}\-–—/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}


