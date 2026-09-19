// ---------------------------------------------------------------------------
// The course: eight lessons, in order.
//
// This is the single source of truth for lesson identity — id, order,
// display labels, and the knowledge-base topic each lesson teaches. The old
// build scattered these across an i18n blob (nav0..nav7, l0title..l7title)
// and two separate lookup tables in different feature files, which is how
// the AI tutor and the quiz ended up able to disagree about which topic you
// were on.
//
// Lesson CONTENT (prose and charts) is not here: it stays with the lesson
// views. This module is the spine everything else resolves against.
// ---------------------------------------------------------------------------
import type { Localized } from '@core/types/kb';

export interface Lesson {
  id: string;
  index: number;
  navLabel: Localized;
  title: Localized;
  tag: Localized;
  /** The KB topic this lesson teaches — used by the AI tutor and the quiz. */
  kbTopicId: string;
  /** A deeper follow-up topic, so "another example" digs rather than repeats. */
  followupTopicId: string;
}

export const LESSONS: readonly Lesson[] = [
  {
    id: 'l0',
    index: 0,
    navLabel: { en: 'Basics', he: 'יסודות' },
    title:    { en: 'Before the charts: how markets actually work', he: 'לפני הגרפים: איך השוק באמת עובד' },
    tag:      { en: 'START HERE — MARKET BASICS', he: 'התחילו כאן — יסודות השוק' },
    kbTopicId: 'stock',
    followupTopicId: 'market-index'
  },
  {
    id: 'l1',
    index: 1,
    navLabel: { en: 'Support / Resistance', he: 'תמיכה / התנגדות' },
    title:    { en: 'Where does price keep bouncing?', he: 'איפה המחיר ממשיך להיתקל?' },
    tag:      { en: 'LESSON 01 — SUPPORT & RESISTANCE', he: 'שיעור 01 — תמיכה והתנגדות' },
    kbTopicId: 'support-resistance',
    followupTopicId: 'pullback'
  },
  {
    id: 'l2',
    index: 2,
    navLabel: { en: 'Breakout & Retest', he: 'פריצה וריטסט' },
    title:    { en: 'Resistance breaks. Then price comes back to check it.', he: 'ההתנגדות נפרצת. ואז המחיר חוזר לבדוק אותה.' },
    tag:      { en: 'LESSON 02 — BREAKOUT & RETEST', he: 'שיעור 02 — פריצה ובדיקה חוזרת' },
    kbTopicId: 'breakout-retest',
    followupTopicId: 'volume'
  },
  {
    id: 'l3',
    index: 3,
    navLabel: { en: 'Moving Averages', he: 'ממוצעים נעים' },
    title:    { en: 'Smoothing out the noise to see the trend', he: 'החלקת הרעש כדי לראות את המגמה' },
    tag:      { en: 'LESSON 03 — MOVING AVERAGES', he: 'שיעור 03 — ממוצעים נעים' },
    kbTopicId: 'moving-averages',
    followupTopicId: 'trend'
  },
  {
    id: 'l4',
    index: 4,
    navLabel: { en: 'Candlesticks', he: 'נרות יפניים' },
    title:    { en: 'What a single candle is telling you', he: 'מה נר בודד מספר לך' },
    tag:      { en: 'LESSON 04 — CANDLESTICK PATTERNS', he: 'שיעור 04 — תבניות נרות' },
    kbTopicId: 'candlestick-patterns',
    followupTopicId: 'candlestick'
  },
  {
    id: 'l5',
    index: 5,
    navLabel: { en: 'Fibonacci', he: 'פיבונאצ׳י' },
    title:    { en: 'How far back does a pullback usually go?', he: 'עד כמה בדרך כלל חוזר תיקון מחיר?' },
    tag:      { en: 'LESSON 05 — FIBONACCI RETRACEMENT', he: 'שיעור 05 — רמות פיבונאצ׳י (Fibonacci Retracement)' },
    kbTopicId: 'fibonacci',
    followupTopicId: 'pullback'
  },
  {
    id: 'l6',
    index: 6,
    navLabel: { en: 'RSI', he: 'RSI' },
    title:    { en: 'Measuring momentum, not just price', he: 'מדידת מומנטום, לא רק מחיר' },
    tag:      { en: 'LESSON 06 — RSI (RELATIVE STRENGTH INDEX)', he: 'שיעור 06 — RSI (מדד העוצמה היחסית)' },
    kbTopicId: 'rsi',
    followupTopicId: 'divergence'
  },
  {
    id: 'l7',
    index: 7,
    navLabel: { en: 'Chart Patterns', he: 'תבניות גרף' },
    title:    { en: 'Shapes that tend to repeat', he: 'צורות שנוטות לחזור על עצמן' },
    tag:      { en: 'LESSON 07 — CHART PATTERNS', he: 'שיעור 07 — תבניות גרף' },
    kbTopicId: 'chart-patterns',
    followupTopicId: 'reversal-patterns'
  }
] as const;

export const LESSON_IDS: readonly string[] = LESSONS.map((l) => l.id);

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function lessonByIndex(index: number): Lesson | undefined {
  return LESSONS[index];
}

export function isLessonId(id: string | null | undefined): boolean {
  return !!id && LESSON_IDS.includes(id);
}
