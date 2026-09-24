// Inline stroke SVGs, never emoji or pictographic Unicode characters — a
// product rule, not a style preference: a glyph like ✦ or 📊 renders as a
// full-colour pictograph on several platforms, at a size and weight nothing
// in the CSS can control, and reads as decoration rather than as product
// chrome. Every icon here is currentColor, so it always matches the text
// around it and the theme it is drawn in.
//
// Shared here because three unrelated components (the AI launcher, the AI
// route's empty state, and the course-complete celebration) each needed one
// of these — past two call sites, a shared file beats copy-pasted SVG.

type IconProps = { className?: string };

/** The AI feature's mark — a four-point sparkle, drawn as geometry rather
 * than the ✦ character it replaces (Unicode dingbat, inconsistent
 * cross-platform rendering, no colour control). */
export function SparkleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2c.6 3.8 1.7 6.3 3.3 7.6 1.5 1.3 3.6 2 6.7 2.4-3.1.4-5.2 1.1-6.7 2.4-1.6 1.3-2.7 3.8-3.3 7.6-.6-3.8-1.7-6.3-3.3-7.6C7.2 13.1 5.1 12.4 2 12c3.1-.4 5.2-1.1 6.7-2.4C10.3 8.3 11.4 5.8 12 2Z" />
    </svg>
  );
}

/** The topic browser's icon — a simple bar chart, replacing the 📊 glyph. */
export function BarChartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
         strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  );
}

/**
 * A chevron, drawn pointing to the LEFT.
 *
 * Direction is a CSS concern, not a second icon: the pager flips it with
 * `scaleX(-1)` for the other end and again under `[dir='rtl']`, because
 * "previous" points right on a Hebrew page and left on an English one. Two
 * hard-coded mirror-image SVGs would need four, and would silently point the
 * wrong way the first time someone forgot one.
 */
export function ChevronIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

/** A checkmark, for "mark as complete" and anything else that confirms. */
export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
         strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** The course-complete celebration mark — a checkmark medal, replacing the
 * 🎉 glyph. A ribboned checkmark reads as "finished, verified" rather than
 * "party", which fits a course-completion screen better than confetti did. */
export function MedalIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
         strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="9" r="6.5" />
      <path d="m9.2 9 1.8 1.8 3.8-3.8" />
      <path d="M8.3 14.5 6.5 22l5.5-2.8 5.5 2.8-1.8-7.5" />
    </svg>
  );
}
