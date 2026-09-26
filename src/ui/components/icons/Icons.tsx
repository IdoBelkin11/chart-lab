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

/* The design system's icon set, path for path from the approved Artifact
   (ui.mjs `I`). 24-unit stroke icons; `fill` marks the one solid glyph. */
const PATHS = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  chevR: '<path d="m9 18 6-6-6-6"/>',
  chevL: '<path d="m15 18-6-6 6-6"/>',
  chevD: '<path d="m6 9 6 6 6-6"/>',
  arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowL: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
  compare: '<path d="M8 3v18M16 3v18M3 8h5M16 16h5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5"/>',
  play: '<path d="M7 4v16l13-8L7 4Z"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>',
  alert: '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17h.01"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  chart: '<path d="M4 20V4M4 20h16"/><path d="m7 15 4-4 3 3 5-6"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6l-8-3Z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/>',
  home: '<path d="M3 11 12 4l9 7M5 10v10h14V10"/>',
  send: '<path d="M4 12 20 4l-6 16-3-7-7-1Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m14 6 4 4"/>'
} as const;
export type IconName = keyof typeof PATHS | 'spark';

const SPARK = 'M12 2c.6 3.8 1.7 6.3 3.3 7.6 1.5 1.3 3.6 2 6.7 2.4-3.1.4-5.2 1.1-6.7 2.4-1.6 1.3-2.7 3.8-3.3 7.6-.6-3.8-1.7-6.3-3.3-7.6C7.2 13.1 5.1 12.4 2 12c3.1-.4 5.2-1.1 6.7-2.4C10.3 8.3 11.4 5.8 12 2Z';

/** One icon from the design system's set, sized in px, always currentColor. */
export function Icon({ name, size = 16, className }: { name: IconName; size?: number; className?: string }) {
  const style = { width: size, height: size, flex: 'none' as const };
  if (name === 'spark') {
    return <svg viewBox="0 0 24 24" fill="currentColor" style={style} className={className} aria-hidden="true"><path d={SPARK} /></svg>;
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={name === 'check' || name === 'x' ? 2.4 : 2}
         strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true"
         dangerouslySetInnerHTML={{ __html: PATHS[name] }} />
  );
}

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
