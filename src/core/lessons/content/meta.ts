// ---------------------------------------------------------------------------
// What the always-loaded shell needs to know about the written lessons —
// which ones exist, their previous-build id, and what the tutor is asked
// about — WITHOUT loading them. The lessons themselves (prose, charts,
// questions) are ~450 kB of source; they load with the lesson, quiz and
// practice routes (see RouteView). A test keeps this in step with the
// content itself, so the two cannot drift.
// ---------------------------------------------------------------------------

export interface LessonMeta { legacyId?: string; topic: string }

export const LESSON_META: Readonly<Record<string, LessonMeta>> = {
  F1: { legacyId: 'l0', topic: 'stock' },
  F2: { topic: 'exchange' },
  F3: { topic: 'why-price-moves' },
  F4: { topic: 'etf' },
  F5: { topic: 'order-types' },
  T1: { topic: 'how-to-read-a-chart' },
  T2: { topic: 'candlestick-patterns' },
  T3: { topic: 'trend' },
  T4: { topic: 'support-resistance' },
  T5: { topic: 'breakout-retest' },
  T6: { topic: 'moving-averages' },
  T7: { topic: 'rsi' },
  T8: { topic: 'divergence' },
  T9: { legacyId: 'l5', topic: 'fibonacci' },
  T10: { legacyId: 'l7', topic: 'chart-patterns' },
  T11: { topic: 'reversal-patterns' },
  T12: { topic: 'combining-indicators' },
  P1: { topic: 'fundamental' },
  P2: { topic: 'net-income' },
  P3: { topic: 'free-cash-flow' },
  P4: { topic: 'operating-margin' },
  P5: { topic: 'roic' },
  P6: { topic: 'pe' },
  P7: { topic: 'debt-equity' },
  P8: { topic: 'guidance' },
  P9: { topic: 'dcf' }
};

/** Whether a lesson is written (has content to open). */
export const isWritten = (id: string): boolean => id in LESSON_META;
