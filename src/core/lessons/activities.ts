// ---------------------------------------------------------------------------
// Lesson activities: the Try step's interaction, as data (Artifact 07 · lesson
// types, and the per-lesson boards on 08).
//
// Four representative types, each attached to a written lesson where the
// approved design shows it:
//   sort         F1  — sort assets into stock / bond / ETF / index
//   chartChoice  T2  — "which of the marked candles is the hammer?"
//   predict      T5  — the chart stops at the breakout; guess, then reveal
//   markLevel    T4  — click where support is (the previous build's exercise)
//                T10 — place the neckline, then the measured-move target
//
// A lesson without an activity keeps its first quiz question as the Try step.
// Every explanation here restates what that lesson's own prose teaches.
// ---------------------------------------------------------------------------
import type { Localized } from '@core/types/kb';
import * as series from '@core/charts/series.js';
import { exerciseFor } from './exercises';
import type { Book, OrderResult, OrderTask } from './orderBook';
import type { Diagram } from './content/types';

const L = (he: string, en: string): Localized => ({ he, en });

export interface SortActivity {
  kind: 'sort';
  prompt: Localized;
  bins: Array<{ id: string; label: Localized; tone: string }>;
  items: Array<{ id: string; label: Localized; bin: string; why: Localized }>;
  right: Localized;
  /** Shown on the feedback step under the verdict: what the sorting was really about. */
  explain?: Localized[];
}
export interface ChartChoiceActivity {
  kind: 'chartChoice';
  prompt: Localized;
  candles: unknown[];
  chartLabel: Localized;
  marks: Array<{ key: string; i1: number; i2?: number; name: Localized; why: Localized }>;
  correct: string;
  right: Localized;
  /** What the learner is looking for, for the wrong-answer title ("X, not <target>"). Default: a hammer (T2). */
  target?: Localized;
  /** Show the volume bars — when the question is about them (T1). */
  showVolume?: boolean;
}
export interface PredictActivity {
  kind: 'predict';
  prompt: Localized;
  sub: Localized;
  /** Index into the lesson's LESSON_CHARTS; the chart is cut after `cut` until revealed. */
  chart: number;
  cut: number;
  choices: Array<{ key: string; label: Localized }>;
  likely: string;
  outcome: Localized;
  caveat: Localized;
  /** Shown once the continuation is revealed: what the outcome teaches. */
  explain?: Localized[];
}
export interface MarkLevelActivity {
  kind: 'markLevel';
  prompt: Localized;
  task: Localized;
  chart: number;
  /** The chart's own annotation that gives the answer away, hidden until checked. */
  hideOption?: 'segments' | 'zones';
  target: [number, number];
  tolerance: number;
  right: Localized;
  off: Localized;
  /** Answer zones drawn once revealed, with their explanations. */
  answer: Array<{ range: [number, number]; tone: 'support' | 'resistance'; label: Localized; explanation: Localized }>;
  /** A measured move computed from the level: target = level − (peak − level). */
  measure?: { peak: number; label: Localized; explain: Localized; caveat: Localized };
}
/**
 * "When did it happen?" — the learner clicks the chart at a MOMENT (a candle),
 * not a price (Artifact 08.1b · T6's crossover). Right within `tolerance`
 * candles of `target`. Once right, the moment is drawn, and optionally the
 * span leading up to it (T6: the lag between the low and the crossover).
 */
export interface MarkPointActivity {
  kind: 'markPoint';
  prompt: Localized;
  task: Localized;
  /** Index into the lesson's charts. */
  chart: number;
  target: number;
  tolerance: number;
  right: Localized;
  off: Localized;
  reveal: { label: Localized; span?: { from: number; label: Localized } };
  explain?: Localized[];
}
/**
 * "Work it out" — a number to calculate from what the work area shows (Artifact:
 * T7 "חשבו RSI"; reusable for any lesson with a formula). Right within
 * `tolerance`. A known wrong turn (dividing the wrong way round, skipping a
 * step) gets its own explanation; the worked solution is shown once it's right.
 */
export interface CalculateActivity {
  kind: 'calculate';
  prompt: Localized;
  task: Localized;
  /** The numbers to calculate from, shown in the work area — as a diagram… */
  diagram?: Diagram;
  /** …or as one of the lesson's charts (T9: the move and the pullback, marked). */
  chart?: number;
  /** Chart options drawn once right (T9: the levels the answer lands on). */
  reveal?: Record<string, unknown>;
  answer: number;
  tolerance: number;
  /** Label of the input field. */
  field: Localized;
  mistakes?: Array<{ value: number; tolerance: number; why: Localized }>;
  /** The worked solution, one line per step. */
  steps: Localized[];
  right: Localized;
  off: Localized;
  explain?: Localized[];
}
/**
 * "Find these moments, then compare them" — the learner marks several candles,
 * in order (T8: the first peak, then the second; Artifact 08.2b), and then
 * answers one question about what they marked. Each mark is right within its
 * own tolerance; the answer must be right too. Reusable wherever a lesson asks
 * "find A and B, then say how they relate" (T10's shoulders and head, …).
 */
export interface MarkPointsActivity {
  kind: 'markPoints';
  prompt: Localized;
  task: Localized;
  chart: number;
  /** Where the marks sit on each candle: its high or its low. */
  at: 'high' | 'low';
  points: Array<{ target: number; tolerance: number; label: Localized; off: Localized }>;
  compare: { question: Localized; options: Array<{ key: string; label: Localized }>; correct: string; wrong: Localized };
  right: Localized;
  /** Chart options drawn once right (e.g. lines linking the marked points). */
  reveal: Record<string, unknown>;
  explain?: Localized[];
}
export interface MarkPointsAnswer { picks: Array<number | null>; active: number; choice: string | null }
export interface OrderBookActivity {
  kind: 'orderBook';
  prompt: Localized;
  book: Book;
  tasks: Array<{ id: OrderTask; text: Localized }>;
  /** The currency the book is priced in, per language. */
  currency: Localized;
  explain?: Localized[];
}
/**
 * Sort several small charts into categories (Artifact 3.2 · T3's trend drill).
 * Each chart is a sketch of swing points in a 400×180 box (y grows downward,
 * so a smaller y is a higher price). Every pick locks that card and reveals
 * the swings that decide it — the answer is shown only for a card already answered.
 */
export interface ClassifyActivity {
  kind: 'classify';
  prompt: Localized;
  sub: Localized;
  /** The rule of thumb for each category, shown as chips above the cards. */
  rules: Array<{ tone: string; label: Localized }>;
  options: Array<{ key: string; label: Localized }>;
  items: Array<{ id: string; name: Localized; points: Array<[number, number]>; band?: [number, number]; answer: string; why: Localized }>;
  right: Localized;
  explain?: Localized[];
  /** Label the swings once a card is answered (higher high, lower low…). Default true — T3's trend drill; off where the shape, not the trend, is the answer (T11). */
  showSwings?: boolean;
  /** What each card asks (default: "Which trend?"). */
  ask?: Localized;
  /** The nudge after a wrong sort (default: look again at the highs and lows). */
  hint?: Localized;
}
export type ClassifyAnswer = Record<string, string>;
/**
 * "Read the whole chart" — several questions about ONE chart, each answered in
 * turn (T12's project: trend, volume, momentum, where the idea is wrong, and a
 * target). Every pick locks and explains itself; right when all are right.
 * Reusable for any lesson that pulls several tools together on one case.
 */
export interface ChecklistActivity {
  kind: 'checklist';
  prompt: Localized;
  task: Localized;
  /** One of the lesson's charts to read from — or a figure (P4's margins, P6's comparison). */
  chart?: number;
  diagram?: Diagram;
  items: Array<{ id: string; question: Localized; options: Array<{ key: string; label: Localized }>; correct: string; why: Localized }>;
  right: Localized;
  /** Chart options drawn once every answer is right. */
  reveal?: Record<string, unknown>;
  explain?: Localized[];
}
/** The learner's session in the order book: the book as it stands, and every order sent. */
export interface OrderBookAnswer { book: Book; orders: OrderResult[]; done: OrderTask[] }
/**
 * "Explore, then find it" (Artifact 09.1 · P2's statement explorer): a table
 * whose lines explain themselves when clicked — what the line is, and how it is
 * worked out — shown for one of several datasets (companies) at a time. The
 * task names one line in one dataset to find; the check is on the line picked.
 */
export interface ExploreActivity {
  kind: 'explore';
  prompt: Localized;
  task: Localized;
  title: Localized;
  datasets: Array<{ key: string; label: Localized }>;
  rows: Array<{ id: string; label: Localized; term?: string; kind?: 'sub' | 'total'; values: Record<string, string>; why: Localized; formula?: Record<string, string>; share?: Record<string, number> }>;
  /** Heading of the "share of the first line" bars (rows with a `share`). */
  sharesTitle?: Localized;
  target: { dataset: string; row: string };
  right: Localized;
  off: Localized;
  explain?: Localized[];
}
export interface ExploreAnswer { dataset: string; row: string | null }
export type Activity = SortActivity | ChartChoiceActivity | PredictActivity | MarkLevelActivity | OrderBookActivity | ClassifyActivity | MarkPointActivity | CalculateActivity | MarkPointsActivity | ChecklistActivity | ExploreActivity;

/** The four things F1 introduces (Artifact 07.1a), shown as cards in its work area. */
export const F1_CONCEPTS: ReadonlyArray<{ id: string; tone: string; name: Localized; what: Localized; more: Localized; example: Localized }> = [
  { id: 'stock', tone: 'var(--info)', name: L('מניה', 'Stock'), what: L('חלק קטן מהבעלות על חברה', 'A small slice of owning a company'), more: L('רווח אם החברה מצליחה — ואין הבטחה.', 'You gain if the company does well — and nothing is promised.'), example: L('קניתם מניה של בנק — אתם שותפים קטנים ברווחים שלו.', "You bought a bank's stock — you're a small partner in its profits.") },
  { id: 'bond', tone: 'var(--adv)', name: L('אג״ח', 'Bond'), what: L('הלוואה שנתתם לחברה או למדינה', 'A loan you gave a company or a government'), more: L('מקבלים ריבית קבועה והחזר בסוף.', 'You get fixed interest, and your money back at the end.'), example: L('קניתם אג״ח ממשלתי ל־5 שנים — המדינה משלמת לכם ריבית כל שנה.', 'You bought a 5-year government bond — the state pays you interest every year.') },
  { id: 'etf', tone: 'var(--learn)', name: L('קרן סל', 'ETF'), what: L('סל של הרבה ניירות בפקודה אחת', 'A basket of many securities in one order'), more: L('פיזור מיידי, עם דמי ניהול נמוכים.', 'Instant diversification, with low fees.'), example: L('קרן סל על מדד רחב — בפקודה אחת מחזיקים מאות חברות.', 'An ETF on a broad index — one order, hundreds of companies.') },
  { id: 'index', tone: 'var(--risk)', name: L('מדד', 'Index'), what: L('מדידה של קבוצת מניות', 'A measurement of a group of stocks'), more: L('אי אפשר לקנות מדד — רק קרן שעוקבת אחריו.', "You can't buy an index — only a fund that tracks it."), example: L('ת״א 35 מודד את 35 החברות הגדולות בבורסה.', 'The TA-35 measures the 35 largest companies on the Tel Aviv exchange.') }
];

const HS = series.P_HS as unknown as Array<{ h: number; l: number }> & { headIdx: number; trough1Idx: number; trough2Idx: number };
const NECK = (HS[HS.trough1Idx]!.l + HS[HS.trough2Idx]!.l) / 2;
const HEAD = HS[HS.headIdx]!.h;
const MIX = series.C_MIX as unknown as unknown[] & { marks: { a: number; b: number; c: [number, number]; d: number } };
const L2 = series.L2 as unknown as unknown[] & { breakIdx: number };
const ex1 = exerciseFor('l1')!;

export const ACTIVITIES: Readonly<Record<string, Activity>> = {
  l0: {
    kind: 'sort',
    prompt: L('מיינו 8 נכסים לפי מה שהם', 'Sort 8 assets by what they are'),
    bins: F1_CONCEPTS.map((c) => ({ id: c.id, label: c.name, tone: c.tone })),
    items: [
      { id: 'bank', label: L('מניית בנק', 'A bank stock'), bin: 'stock', why: L('חלק מהבעלות על הבנק — מניה.', 'A slice of owning the bank — a stock.') },
      { id: 'tech', label: L('מניית טכנולוגיה', 'A tech stock'), bin: 'stock', why: L('חלק מהבעלות על חברה אחת — מניה.', 'A slice of one company — a stock.') },
      { id: 'gov', label: L('אג״ח ממשלתי ל־5 שנים', '5-year government bond'), bin: 'bond', why: L('הלוואה למדינה עם ריבית והחזר בסוף — אג״ח.', 'A loan to the state with interest and repayment — a bond.') },
      { id: 'corp', label: L('אג״ח קונצרני', 'Corporate bond'), bin: 'bond', why: L('הלוואה לחברה, לא בעלות בה — אג״ח.', 'A loan to a company, not a share of it — a bond.') },
      { id: 'spy', label: L('קרן סל על S&P 500', 'S&P 500 ETF'), bin: 'etf', why: L('סל של 500 חברות בפקודה אחת — קרן סל.', '500 companies in one order — an ETF.') },
      { id: 'gold', label: L('קרן סל על זהב', 'Gold ETF'), bin: 'etf', why: L('זו קרן סל: היא מחזיקה זהב בשבילכם — לא מניה של חברה.', "It's an ETF: it holds gold for you — not a company's stock.") },
      { id: 'ta35', label: L('ת״א 35', 'TA-35'), bin: 'index', why: L('מספר שמודד 35 חברות — מדד. קונים רק קרן שעוקבת אחריו.', 'A number measuring 35 companies — an index. You can only buy a fund that tracks it.') },
      { id: 'ndx', label: L('נאסד״ק 100', 'Nasdaq 100'), bin: 'index', why: L('מדידה של 100 חברות — מדד, לא נייר שקונים ישירות.', 'A measure of 100 companies — an index, not something you buy directly.') }
    ],
    right: L('מניה = בעלות, אג״ח = הלוואה, קרן סל = סל בפקודה אחת, מדד = מספר שמודד — וקונים רק קרן שעוקבת אחריו.', 'Stock = ownership, bond = a loan, ETF = a basket in one order, index = a measurement — you can only buy a fund that tracks it.')
  },
  l4: {
    kind: 'chartChoice',
    prompt: L('איזה מהנרות המסומנים הוא פטיש?', 'Which of the marked candles is the hammer?'),
    candles: MIX,
    chartLabel: L('גרף נרות עם ארבעה נרות מסומנים באותיות, לבחירה', 'Candlestick chart with four candles marked by letter, to choose from'),
    marks: [
      { key: 'a', i1: MIX.marks.a, name: L('דוג׳י', 'Doji'), why: L('בדוג׳י הפתיחה והסגירה כמעט זהות — חוסר הכרעה. לפטיש יש גוף קטן למעלה וצל תחתון ארוך.', 'In a doji the open and close are almost identical — indecision. A hammer has a small body at the top and a long lower shadow.') },
      { key: 'b', i1: MIX.marks.b, name: L('פטיש', 'Hammer'), why: L('גוף קטן למעלה, צל תחתון ארוך, בסוף ירידה.', 'Small body at the top, long lower shadow, at the end of a decline.') },
      { key: 'c', i1: MIX.marks.c[0], i2: MIX.marks.c[1], name: L('בליעה עולה', 'Bullish engulfing'), why: L('זה זוג נרות — בליעה עולה: הירוק מכסה את כל טווח האדום שלפניו.', "That's a pair — bullish engulfing: the green covers the red one's whole range.") },
      { key: 'd', i1: MIX.marks.d, name: L('כוכב נופל', 'Shooting star'), why: L('זה כוכב נופל: הצל הארוך למעלה, בסוף עלייה — התמונה ההפוכה של פטיש.', "That's a shooting star: the long shadow is on top, after a rise — the hammer's mirror image.") }
    ],
    correct: 'b',
    right: L('גוף קטן למעלה וצל תחתון ארוך, בסוף ירידה: המחיר צנח במהלך היום ונדחף חזרה עד הסגירה. וזכרו — נר אחד הוא רמז, לא הוכחה.', 'A small body at the top and a long lower shadow, after a decline: price fell hard during the session and was pushed back by the close. And remember — one candle is a hint, not proof.')
  },
  l2: {
    kind: 'predict',
    prompt: L('המחיר פרץ את ההתנגדות. מה הכי סביר עכשיו?', 'Price broke through resistance. What is most likely now?'),
    sub: L('אין כאן ניחוש נכון אחד — יש תרחיש שקורה לעתים קרובות. בחרו, ואז נחשוף את ההמשך.', "There's no single right guess — there's a scenario that happens often. Choose, then we'll reveal what followed."),
    chart: 0,
    cut: L2.breakIdx + 2,
    choices: [
      { key: 'up', label: L('ממשיך לעלות בלי לחזור', 'Keeps rising without coming back') },
      { key: 'retest', label: L('חוזר לבדוק את ההתנגדות — ואז עולה', 'Comes back to test the resistance — then rises') },
      { key: 'fail', label: L('נופל חזרה מתחת לרמה', 'Falls back below the level') }
    ],
    likely: 'retest',
    outcome: L('ההתנגדות הישנה הפכה לתמיכה: המחיר חזר לאזור הפריצה, מצא קונים, והמשיך למעלה — ריטסט.', 'The old resistance turned into support: price came back to the breakout area, found buyers, and moved on up — a retest.'),
    caveat: L('זה לא תמיד קורה. סגירה שנשארת מתחת לרמה הישנה יותר מנר או שניים היא אזהרה שהפריצה נכשלת.', "It doesn't always happen. A close that stays below the old level for more than a candle or two warns that the breakout may be failing.")
  },
  l1: {
    kind: 'markLevel',
    prompt: L('איפה אזור התמיכה?', 'Where is the support zone?'),
    task: ex1.prompt,
    chart: 0,
    target: ex1.target,
    tolerance: ex1.tolerance,
    right: ex1.feedbackClose,
    off: ex1.feedbackOff,
    answer: ex1.annotations
  },
  l7: {
    kind: 'markLevel',
    prompt: L('שרטטו את קו הצוואר', 'Draw the neckline'),
    task: L('לחצו על הגרף בגובה שבו לדעתכם עובר קו הצוואר — הקו שמחבר את שני השפלים שבין הכתפיים לראש.', 'Click the chart at the height where you think the neckline runs — the line joining the two lows between the shoulders and the head.'),
    chart: 2,
    hideOption: 'segments',
    target: [NECK - 1.2, NECK + 1.2],
    tolerance: 2.5,
    right: L('קו הצוואר מחבר את שני השפלים — והשבירה שלו היא מה שמאשר את התבנית.', 'The neckline joins the two lows — and breaking it is what confirms the pattern.'),
    off: L('לא בגובה הזה. חפשו את שני השפלים שבין הכתפיים לראש — הקו עובר דרכם.', 'Not at that height. Look for the two lows between the shoulders and the head — the line runs through them.'),
    answer: [{ range: [NECK - 0.6, NECK + 0.6], tone: 'resistance', label: L('קו הצוואר', 'Neckline'), explanation: L('השפלים שבין הכתפיים לראש.', 'The lows between the shoulders and the head.') }],
    measure: {
      peak: HEAD,
      label: L('יעד משוער', 'Estimated target'),
      explain: L('גובה הראש מעל הקו מוקרן מטה מנקודת השבירה — "התנועה הנמדדת".', "The head's height above the line, projected down from the break — the \"measured move\"."),
      caveat: L('זו הערכת פתיחה, לא הבטחה — תנועות אמיתיות נופלות ממנה או חורגות ממנה לעיתים קרובות.', 'A starting estimate, not a promise — real moves regularly fall short of it or run past it.')
    }
  }
};

export function activityFor(legacyId: string): Activity | null {
  return ACTIVITIES[legacyId] ?? null;
}

/** Whether an answer is right. `sort` is right when every item sits in its own bin. */
export function isRight(a: Activity, answer: unknown): boolean {
  switch (a.kind) {
    case 'sort': { const placed = (answer as { placed: Record<string, string> }).placed; return a.items.every((it) => placed[it.id] === it.bin); }
    case 'chartChoice': return answer === a.correct;
    case 'predict': return answer === a.likely;
    case 'markPoints': return markPointsFault(a, answer as MarkPointsAnswer) === null;
    case 'calculate': return typeof answer === 'number' && Math.abs(answer - a.answer) <= a.tolerance;
    case 'markPoint': return Math.abs((answer as number) - a.target) <= a.tolerance;
    case 'classify': return a.items.every((it) => (answer as ClassifyAnswer)[it.id] === it.answer);
    case 'checklist': return a.items.every((it) => (answer as ClassifyAnswer)[it.id] === it.correct);
    case 'explore': { const s = answer as ExploreAnswer; return s.dataset === a.target.dataset && s.row === a.target.row; }
    case 'orderBook': return a.tasks.every((t) => (answer as OrderBookAnswer).done.includes(t.id));
    case 'markLevel': {
      const p = answer as number, [lo, hi] = a.target;
      return (p >= lo && p <= hi) || Math.min(Math.abs(p - lo), Math.abs(p - hi)) <= a.tolerance;
    }
  }
}

/**
 * The swing points of a sketch, each compared with the previous swing of the
 * same kind: a higher high, a lower low, or a similar one (within `tol`).
 * Ported from the Artifact's trend drill, so the marks say what it said.
 */
export function sketchSwings(points: ReadonlyArray<readonly [number, number]>, tol = 8) {
  const out: Array<{ x: number; y: number; kind: 'high' | 'low'; vs: 'higher' | 'lower' | 'similar' | null }> = [];
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i]!;
    const kind = y < points[i - 1]![1] && y < points[i + 1]![1] ? 'high' : 'low';
    const prev = [...out].reverse().find((p) => p.kind === kind);
    // y grows downward: a smaller y is a higher price.
    const vs = !prev ? null : Math.abs(y - prev.y) < tol ? 'similar' : y < prev.y ? 'higher' : 'lower';
    out.push({ x, y, kind, vs });
  }
  return out;
}

/** What is wrong with a markPoints answer — the first mark that is off, else the comparison — or null. */
export function markPointsFault(a: MarkPointsActivity, ans: MarkPointsAnswer): Localized | null {
  const off = a.points.findIndex((pt, i) => ans.picks[i] == null || Math.abs(ans.picks[i]! - pt.target) > pt.tolerance);
  if (off >= 0) return a.points[off]!.off;
  return ans.choice === a.compare.correct ? null : a.compare.wrong;
}

/** The explanation for a known wrong turn in a calculation, if the answer matches one. */
export function calcMistake(a: CalculateActivity, answer: number) {
  return a.mistakes?.find((m) => Math.abs(answer - m.value) <= m.tolerance) ?? null;
}

/** A measured-move target from a level and a peak. */
export const measuredTarget = (level: number, peak: number) => level - (peak - level);
