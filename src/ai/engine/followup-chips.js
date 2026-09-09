// Follow-up chip labels are derived automatically from each entry's own
// keyword list, so 124 entries don't require 248 hand-written phrasings.
function pickLabelTerm(kwList, hebrew){
  const isHebrew = k => /[\u0590-\u05FF]/.test(k);
  // NOTE: \b relies on ASCII \w, so it never matches right after a Hebrew
  // letter — a Hebrew starter word must be checked with an explicit
  // space/end-of-string lookahead instead, or it silently fails to filter.
  const isQuestionish = k => {
    const s = k.trim();
    return /^(what|how|why|which|who|when|where|does|do|can|is|are)\b/i.test(s) ||
           /^(מה|איך|למה|האם|מי|ממי|מתי|איפה|כיצד)(\s|$)/.test(s);
  };
  const candidates = kwList.filter(k => isHebrew(k) === hebrew && !isQuestionish(k) && k.split(' ').length <= 3);
  if(!candidates.length) return kwList.find(k => isHebrew(k) === hebrew) || kwList[0];
  return candidates.sort((a,b) => a.length - b.length)[0];
}

function chipLabelFor(id, langCode){
  const entry = kbById(id);
  if(!entry) return null;
  const hebrew = langCode === 'he';
  const term = pickLabelTerm(entry.kw, hebrew);
  if(!term) return null;
  // Some entries (e.g. "why does price move") have no good short noun form
  // in a given language, so pickLabelTerm's fallback returns an
  // already-question-shaped keyword. Use it as-is instead of double-wrapping
  // it into "what is why does price move?".
  const looksLikeQuestion = hebrew
    ? /^(מה|איך|למה|האם|מי|ממי|מתי|איפה|כיצד)(\s|$)/.test(term)
    : /^(what|how|why|which|who|when|where|does|do|can|is|are)\b/i.test(term);
  if(looksLikeQuestion){
    const trimmed = term.trim();
    return /[?？]\s*$/.test(trimmed) ? trimmed : trimmed + '?';
  }
  return hebrew ? `מה זה ${term}?` : `What is ${term}?`;
}


// ---------------------------------------------------------------------------
// Topic browser: groups every KB entry by its category so the visitor can
// reliably find any topic by clicking, without needing to guess phrasing
// that the matcher would recognize.
// ---------------------------------------------------------------------------
const CATEGORY_LABELS = {
  basics: { he:'יסודות', en:'Basics' },
  comparisons: { he:'השוואות', en:'Comparisons' },
  fundamentals: { he:'ניתוח פונדמנטלי', en:'Fundamental analysis' },
  technical: { he:'ניתוח טכני', en:'Technical analysis' },
  risk: { he:'סיכון וניהול תיק', en:'Risk & portfolio' },
  macro: { he:'מאקרו-כלכלה', en:'Macroeconomics' },
  bonds: { he:'אג"ח', en:'Bonds' },
  advanced: { he:'מושגים מתקדמים', en:'Advanced topics' },
  scenario: { he:'תרחישים משולבים', en:'Combined scenarios' },
  israel: { he:'שוק ההון בישראל ומיסוי', en:'Israeli market & tax' },
  behavioral: { he:'פסיכולוגיה ומדעי ההתנהגות בשוק', en:'Market psychology & behavioral finance' }
};
const CATEGORY_ORDER = ['basics','comparisons','fundamentals','technical','risk','macro','bonds','advanced','scenario','israel','behavioral'];

function topicsInCategory(cat){
  return KB.filter(e => e.cat === cat);
}

