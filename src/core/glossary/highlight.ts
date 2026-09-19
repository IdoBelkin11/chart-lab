// ---------------------------------------------------------------------------
// Glossary highlighting.
//
// Splits a plain string into segments, marking the first occurrence of each
// known glossary term so @ui can wrap just those segments in an interactive
// definition. UI-agnostic on purpose — this is string processing, not
// rendering, so it belongs in @core with everything else that would survive
// a move to another renderer.
// ---------------------------------------------------------------------------
import type { Lang } from '@core/types/kb';
import { GLOSSARY } from './terms';

export interface GlossarySegment {
  text: string;
  termId: string | null;
}

interface Matcher {
  termId: string;
  regex: RegExp;
  length: number;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const HEB_LETTER = '\\u0590-\\u05FF';

/**
 * English needs a real word boundary, or "trend" would light up inside
 * "trending". Hebrew needs the equivalent for a different reason: JS's `\b`
 * is defined over `\w`, which does not include Hebrew letters at all, so it
 * cannot be reused here. Without an explicit Hebrew boundary, plain
 * substring matching finds a short bare form ANYWHERE it occurs as a
 * sequence of letters — including inside a longer, unrelated word that
 * merely shares a Hebrew root. Two real cases this shipped and broke:
 * "התיק" (portfolio, prefixed) matching inside "התיקון" ("the correction"),
 * and "מדד" (index) matching inside "הנמדדת" ("measured") — a completely
 * different word from the same triliteral root מ-ד-ד.
 *
 * A Hebrew prefix (ה/ב/ל/מ/ו/כ…) still attaches with no space, so it must
 * still match without one — which is exactly what a boundary requiring
 * "not glued to another Hebrew letter" allows, while a hard requirement of
 * whitespace would not.
 */
function buildMatchers(lang: Lang): Matcher[] {
  const matchers: Matcher[] = [];
  for (const term of GLOSSARY) {
    const phrases = lang === 'he' ? term.he : term.en;
    for (const phrase of phrases) {
      if (!phrase) continue;
      const escaped = escapeRegExp(phrase);
      const pattern =
        lang === 'en'
          ? `\\b${escaped}\\b`
          : `(?<![${HEB_LETTER}])${escaped}(?![${HEB_LETTER}])`;
      matchers.push({ termId: term.id, regex: new RegExp(pattern, 'i'), length: phrase.length });
    }
  }
  // Longest phrase first: "moving average" must get the chance to match
  // before a shorter overlapping phrase could claim part of it.
  return matchers.sort((a, b) => b.length - a.length);
}

/**
 * Segments `text` for one render. Each term is marked only on its FIRST
 * occurrence — a paragraph that says "support" five times does not need
 * five identical tooltips competing for the reader's attention.
 *
 * `claimed`, when passed, is shared across several calls so the same word is
 * not decorated twice on one screen. It is MUTATED, which makes this unsafe
 * to call with a set that outlives a single render pass — see
 * `highlightGlossaryGroup`, which is what callers should normally use.
 */
export function highlightGlossary(text: string, lang: Lang, claimed: Set<string> = new Set()): GlossarySegment[] {
  if (!text) return [];
  const matchers = buildMatchers(lang);
  const segments: GlossarySegment[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    let best: { start: number; end: number; termId: string } | null = null;
    for (const m of matchers) {
      if (claimed.has(m.termId)) continue;
      const rest = text.slice(cursor);
      const found = rest.match(m.regex);
      if (!found || found.index === undefined) continue;
      const start = cursor + found.index;
      const end = start + found[0].length;
      if (!best || start < best.start) {
        best = { start, end, termId: m.termId };
      }
    }
    if (!best) {
      segments.push({ text: text.slice(cursor), termId: null });
      break;
    }
    if (best.start > cursor) {
      segments.push({ text: text.slice(cursor, best.start), termId: null });
    }
    segments.push({ text: text.slice(best.start, best.end), termId: best.termId });
    claimed.add(best.termId);
    cursor = best.end;
  }

  return segments;
}

/**
 * Segments several related blocks together — a lesson's intro and its
 * "worth knowing" text, or every paragraph of one answer — sharing dedup
 * across all of them, so a term appearing in two blocks is marked once.
 *
 * Pure, and that is the whole point. The first version of this shared a
 * mutable Set through React context, held in a ref. It worked on the first
 * render and then silently stopped: the ref survived, so on every later
 * render every term was already "claimed" and NOTHING was marked. The
 * glossary quietly vanished the moment anything re-rendered the lesson.
 *
 * Taking all the blocks at once removes the possibility: dedup state lives
 * and dies inside this call, so the same inputs always give the same output
 * no matter how many times React renders.
 */
export function highlightGlossaryGroup(texts: string[], lang: Lang): GlossarySegment[][] {
  const claimed = new Set<string>();
  return texts.map((t) => highlightGlossary(t, lang, claimed));
}
