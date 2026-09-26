// ---------------------------------------------------------------------------
// The lesson content model: everything a written lesson needs, in one shape,
// keyed by curriculum id. The lesson workspace, the tutor, track practice and
// the quiz read ONLY this — a new lesson is a new content file, never new UI.
//
// The 7-step rhythm (step titles live in the curriculum data):
//   1–3  teach   — three TeachSteps: a heading, prose, callouts, optional
//                  notes to reveal, and what the work area shows
//   4    try     — the lesson's activity, or its first question
//   5    answer  — the activity's feedback (or the question's explanation)
//   6    keep    — takeaway: the bottom line and one caveat (+ next lesson)
//   7    next    — completion (built from the curriculum, not from content)
// ---------------------------------------------------------------------------
import type { Localized, QuizQuestion } from '@core/types/kb';
import type { LessonChartSpec } from '@core/charts/lessonCharts';
import type { Activity } from '../activities';

export type CalloutKind = 'example' | 'caveat' | 'takeaway' | 'hint';
export interface Callout { kind: CalloutKind; lead: Localized; text: Localized }

/** A point to reveal after looking at the work area first ("what to notice"). */
export interface Note { tone: 'support' | 'resistance' | 'neutral'; label: Localized; explanation: Localized }

/** A concept card the learner opens (Artifact 07.1a). */
export interface ConceptCard { id: string; tone: string; name: Localized; what: Localized; more: Localized; example: Localized }

/**
 * Explanatory figures that are not price charts, as data — rendered by
 * @ui/components/lessons/Diagrams. Four generic shapes, reusable by any lesson:
 *   flow     a path of numbered stages (e.g. an order's path)
 *   weights  members of an index with weight and change, and the weighted result
 *   book     an order book: sell offers above, buy bids below
 *   bars     labelled bars to compare (expected vs actual, one stock vs a basket…)
 *   candles  single candles drawn large, with open / close / high / low labelled
 *   table    a labelled grid: statement lines, a comparison, a forecast (rows can be
 *            sub-lines or totals; marked cells are highlighted)
 *   stacks   columns built of proportional blocks (a balance sheet's two sides,
 *            market cap + net debt = enterprise value)
 *   waterfall a running total, step by step (profit → cash; revenue → net income)
 *   grouped  bars grouped by period, one bar per series (margins year by year)
 *   lines    values over time, on a % (or plain) scale: inflation against the
 *            policy rate, a spread crossing zero; shaded bands, a reference
 *            line and named points. Not a price chart — no candles, no $ axis.
 * A table can carry a `badge` in place of "Illustration" (history, rounded).
 * Numbers arrive formatted (`shown`), computed by the lesson from its data.
 */
export type Tone = 'ok' | 'err' | 'info' | 'learn' | 'adv' | 'risk' | 'muted';
export type Diagram =
  | { type: 'flow'; title: Localized; stages: Array<{ label: Localized; sub: Localized }>; caption?: Localized }
  | { type: 'weights'; title: Localized; members: Array<{ name: Localized; weight: number; change: number }>; caption?: Localized }
  | { type: 'book'; title: Localized; asks: Array<[number, number]>; bids: Array<[number, number]>; highlight: 'none' | 'best' | 'spread'; caption?: Localized }
  | { type: 'bars'; title: Localized; bars: Array<{ label: Localized; value: number; tone: 'ok' | 'err' | 'info' | 'learn' | 'muted'; shown: Localized }>; caption?: Localized }
  | { type: 'candles'; title: Localized; candles: Array<{ o: number; h: number; l: number; c: number; name: Localized; note: Localized }>; caption?: Localized }
  | { type: 'table'; title: Localized; columns: Localized[]; rows: Array<{ label: Localized; cells: Array<string | Localized>; kind?: 'sub' | 'total'; mark?: number[] }>; caption?: Localized; badge?: Localized }
  | { type: 'stacks'; title: Localized; columns: Array<{ label: Localized; total: string; parts: Array<{ label: Localized; value: number; shown: string; tone: Tone; mark?: boolean }> }>; caption?: Localized }
  | { type: 'waterfall'; title: Localized; steps: Array<{ label: Localized; value: number; shown: string; total?: boolean }>; caption?: Localized }
  | { type: 'grouped'; title: Localized; groups: string[]; series: Array<{ label: Localized; tone: Tone; values: number[]; shown: string[] }>; caption?: Localized }
  | { type: 'lines'; title: Localized; x: string[]; xTitle: Localized; unit: '%' | ''; series: Array<{ label: Localized; tone: Tone; values: number[] }>; ticks: number[]; bands?: Array<{ from: number; to: number; label: Localized }>; ref?: { value: number; label: Localized }; marks?: Array<{ at: number; series: number; label: Localized }>; caption?: Localized };

/** What the work area shows on a teaching step. */
export type Work =
  | { kind: 'charts'; charts: number[] }
  | { kind: 'cards' }
  | { kind: 'diagram'; diagram: Diagram }
  | { kind: 'none' };

export interface TeachStep {
  /** The pane's heading on this step. */
  heading: Localized;
  /** Prose paragraphs; glossary terms in them become interactive. */
  paragraphs: Localized[];
  callouts?: Callout[];
  /** Revealed on request, after looking at the work area. */
  notes?: Note[];
  /** Heading of the notes box (default: "What to notice"). */
  notesTitle?: Localized;
  work: Work;
}

export interface LessonContent {
  /** Curriculum id (F2, T4, …). */
  id: string;
  /** The previous build's id, where the lesson came from it (keeps #/quiz/l3 links working). */
  legacyId?: string;
  /** What the tutor is asked about on this lesson. */
  tutor: { topic: string; label: Localized };
  teach: [TeachStep, TeachStep, TeachStep];
  charts: LessonChartSpec[];
  cards?: ConceptCard[];
  /** The Try step. Without one, the lesson's first question is the Try step. */
  activity?: Activity;
  /**
   * "Apply": after the Try step's verdict, one short check on a NEW chart — the
   * same idea in a case the lesson has not shown. Asked once, explained either way.
   */
  apply?: QuizQuestion;
  takeaway: { bottomLine: Localized; caveat: Localized };
  /**
   * The lesson's own questions (at least three): the Try step when there is
   * no activity, track practice (one per lesson, rotating per attempt), and
   * the tutor's bonus questions (never the one the Try step asks).
   */
  questions: QuizQuestion[];
}
