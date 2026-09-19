// Suggested follow-up prompts.
// Follow-up chip labels are derived automatically from each entry's own
// keyword list, so 124 entries don't require 248 hand-written phrasings.
import { kbById, KB } from '@core/ai/kb/index';

export function pickLabelTerm(kwList, hebrew){
  const isHebrew = k => /[\u0590-\u05FF]/.test(k);
  const isQuestionish = k => {
    const s = k.trim();
    return /^(what|how|why|which|who|when|where|does|do|can|is|are)\b/i.test(s) ||
           /^(מה|איך|למה|האם|מי|ממי|מתי|איפה|כיצד)(\s|$)/.test(s);
  };
  // Some entries carry sentinel keywords that exist only so the matcher can
  // never reach them by text (e.g. an entry served by a guard, not by
  // scoring). They are machinery, not vocabulary, and must never surface as
  // a suggestion to the reader.
  const isInternal = k => k.includes('__');
  const candidates = kwList.filter(k =>
    isHebrew(k) === hebrew && !isQuestionish(k) && !isInternal(k) && k.split(' ').length <= 3);
  // No usable short term → NULL, not "the first keyword we happen to have".
  //
  // That old fallback is what produced chips like "מה זה פריצה נפח גבוה rsi
  // מעל 70?": scenario entries are keyed on long descriptive phrases, and
  // wrapping one in "what is …?" makes a question nobody would ask. A
  // missing chip costs nothing; a nonsense chip makes the tutor look broken
  // and teaches the reader that the suggestions are not worth reading.
  if(!candidates.length) return null;
  return candidates.sort((a,b) => a.length - b.length)[0];
}

/** Long enough to be a real term, short enough to sit on a chip. */
function isUsableLabel(term){
  if(!term) return false;
  const t = term.trim();
  return t.length >= 2 && t.length <= 34 && t.split(' ').length <= 3;
}

export function followupChipsFor(id, langCode){
  const entry = kbById(id);
  if(!entry) return null;
  const hebrew = langCode === 'he';
  const term = pickLabelTerm(entry.kw, hebrew);
  if(!isUsableLabel(term)) return null;
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
export const CATEGORY_LABELS = {
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
export const CATEGORY_ORDER = ['basics','comparisons','fundamentals','technical','risk','macro','bonds','advanced','scenario','israel','behavioral'];

export function topicsInCategory(cat){
  return KB.filter(e => e.cat === cat);
}