// ---------------------------------------------------------------------------
// Technical Analysis, lesson 10 — chart patterns.
//
// Sources: the Artifact's outline (a pattern is a story → head and shoulders
// → the neckline → name the pattern → working out a target), its board 08.5
// (find shoulder / head / shoulder, the neckline between the two lows, the
// target 101.6 − (114.7 − 101.6); "patterns fail, so always with a stop"), and
// the previous build's l7 prose (typical, not guaranteed; the measured move;
// the double bottom, confirmed only by the break) and questions.
//
// Builds on T3 (higher and lower highs) and T4 (a level is where orders
// gathered) without re-teaching them. T10 owns the double top / bottom and
// the head and shoulders, the neckline and the measured move; sorting
// patterns into reversal and continuation, the inverse head and shoulders,
// flags and triangles are T11's.
//
// Every price in the text is read from the swings in the data.
// ---------------------------------------------------------------------------
import type { Localized, QuizQuestion } from '@core/types/kb';
import type { LessonChartSpec } from '@core/charts/lessonCharts';
import * as series from '@core/charts/series.js';
import { getQuizQuestions } from '@core/quiz/questions.js';
import { measuredTarget } from '../activities';
import type { LessonContent } from './types';

const L = (he: string, en: string): Localized => ({ he, en });
const r2 = (x: number) => x.toFixed(2);
/** Isolates a formula inside Hebrew text so it reads left to right. */
const ltr = (x: string) => `⁦${x}⁩`;
const q = (id: string, chart: number, difficulty: 'beginner' | 'intermediate', question: Localized, options: Array<[string, Localized]>, correctKey: string, explanation: Localized): QuizQuestion => ({
  id, lesson: 'T10', category: 'technical', difficulty, chart, question, options: options.map(([key, text]) => ({ key, text })), correctKey, explanation
});

type C = Array<{ o: number; h: number; l: number; c: number }>;
/** The first candle after `from` that closes beyond a level: below it (`below`) or above it. */
const firstClose = (c: C, from: number, lvl: number, below: boolean) => c.findIndex((x, i) => i > from && (below ? x.c < lvl : x.c > lvl));
const low = (c: C, from: number, to = c.length) => Math.min(...c.slice(from, to).map((x) => x.l));
const high = (c: C, from: number, to = c.length) => Math.max(...c.slice(from, to).map((x) => x.h));

const NECK = L('קו הצוואר', 'Neckline');
/** A flat neckline from `x1` to the right edge. */
const neckline = (x1: number, n: number, y: number) => ({ x1, y1: y, x2: n - 1, y2: y, tone: 'gold', dash: [5, 4], labelAt: 'end', labelAlign: 'right', label: L(`${NECK.he} ${r2(y)}`, `${NECK.en} ${r2(y)}`) });
const dot = (idx: number, price: number, name: Localized, tone: string, below = false) => ({ idx, price, tone, labelAlign: 'center', labelDy: below ? 20 : -8, label: L(`${name.he} ${r2(price)}`, `${name.en} ${r2(price)}`) });
const CONFIRM = L('סגירה מתחת לקו', 'Close below the line');
const LS = L('כתף', 'Shoulder'), HEAD = L('ראש', 'Head'), RS = L('כתף', 'Shoulder');

// Step 1: a double top and a double bottom (the previous build's pattern series).
const DT = series.P_DBL_TOP, DB = series.P_DBL_BOTTOM, HS = series.P_HS;
const dt = { t1: DT[DT.t1Idx]!.h, t2: DT[DT.t2Idx]!.h, neck: DT[DT.neckIdx]!.l };
const dtBreak = firstClose(DT, DT.t2Idx, dt.neck, true);
const db = { b1: DB[DB.b1Idx]!.l, b2: DB[DB.b2Idx]!.l, neck: DB[DB.neckIdx]!.h };
const dbBreak = firstClose(DB, DB.b2Idx, db.neck, false);
// Steps 2–3: the head and shoulders.
const hs = { ls: HS[HS.shoulder1Idx]!.h, head: HS[HS.headIdx]!.h, rs: HS[HS.shoulder2Idx]!.h, t1: HS[HS.trough1Idx]!.l, t2: HS[HS.trough2Idx]!.l };
const hsNeck = (hs.t1 + hs.t2) / 2;
const hsBreak = firstClose(HS, HS.shoulder2Idx, hsNeck, true);

/** A head and shoulders from pinned swings: shoulder, low, head, low, shoulder. */
const parts = (c: typeof series.T10_TRY) => {
  const [a, b, h, d, e] = c.swings;
  const neck = (b!.price + d!.price) / 2;
  return { ls: a!, t1: b!, head: h!, t2: d!, rs: e!, neck, target: measuredTarget(neck, h!.price), brk: firstClose(c, e!.idx, neck, true) };
};
const TR = series.T10_TRY, AP = series.T10_APPLY, QH = series.T10_Q_HS, QB = series.T10_Q_DB, QF = series.T10_Q_FAIL;
const tr = parts(TR), qh = parts(QH), qf = parts(QF);
const ap = { t1: AP.swings[0]!, low: AP.swings[1]!, t2: AP.swings[2]! };
const qb = { b1: QB.swings[0]!, neck: QB.swings[1]!, b2: QB.swings[2]! };
const qbBreak = firstClose(QB, qb.b2.idx, qb.neck.price, false);
const qbTarget = qb.neck.price + (qb.neck.price - qb.b1.price);
const qfLow = QF.swings[5]!;
const hsDots = (x: ReturnType<typeof parts>) => [dot(x.ls.idx, x.ls.price, LS, 'text'), dot(x.head.idx, x.head.price, HEAD, 'bear'), dot(x.rs.idx, x.rs.price, RS, 'text')];

const T10_CHARTS: LessonChartSpec[] = [
  {
    candles: DT, variant: 'price',
    options: { showVolume: false, dots: [dot(DT.t1Idx, dt.t1, L('שיא 1', 'Top 1'), 'bear'), dot(DT.t2Idx, dt.t2, L('שיא 2', 'Top 2'), 'bear')], segments: [neckline(DT.neckIdx, DT.length, dt.neck)], points: [{ idx: dtBreak, place: 'below', tone: 'bear', label: CONFIRM }] },
    label: L(`תקרה כפולה: שני שיאים, ${r2(dt.t1)} ו־${r2(dt.t2)}, קו צוואר ב־${r2(dt.neck)}, ואחריו ירידה`, `A double top: two peaks, ${r2(dt.t1)} and ${r2(dt.t2)}, a neckline at ${r2(dt.neck)}, and a fall after it`),
    caption: L('תקרה כפולה (Double Top)', 'Double top'), tone: 'bear', height: 380
  },
  {
    candles: DB, variant: 'price',
    options: { showVolume: false, dots: [dot(DB.b1Idx, db.b1, L('שפל 1', 'Bottom 1'), 'bull', true), dot(DB.b2Idx, db.b2, L('שפל 2', 'Bottom 2'), 'bull', true)], segments: [neckline(DB.neckIdx, DB.length, db.neck)], points: [{ idx: dbBreak, place: 'below', tone: 'bull', label: L('סגירה מעל הקו', 'Close above the line') }] },
    label: L(`תחתית כפולה: שני שפלים, ${r2(db.b1)} ו־${r2(db.b2)}, קו צוואר ב־${r2(db.neck)}, ואחריו עלייה`, `A double bottom: two lows, ${r2(db.b1)} and ${r2(db.b2)}, a neckline at ${r2(db.neck)}, and a rise after it`),
    caption: L('תחתית כפולה (Double Bottom)', 'Double bottom'), tone: 'bull', height: 380
  },
  {
    candles: HS, variant: 'price',
    options: { showVolume: false, dots: [dot(HS.shoulder1Idx, hs.ls, L('כתף שמאל', 'Left shoulder'), 'text'), dot(HS.headIdx, hs.head, HEAD, 'bear'), dot(HS.shoulder2Idx, hs.rs, L('כתף ימין', 'Right shoulder'), 'text')], segments: [neckline(HS.trough1Idx, HS.length, hsNeck)] },
    label: L(`ראש וכתפיים: כתף ב־${r2(hs.ls)}, ראש ב־${r2(hs.head)}, כתף ב־${r2(hs.rs)}, וקו צוואר ב־${r2(hsNeck)}`, `A head and shoulders: a shoulder at ${r2(hs.ls)}, a head at ${r2(hs.head)}, a shoulder at ${r2(hs.rs)}, and a neckline at ${r2(hsNeck)}`),
    caption: L('ראש וכתפיים (Head & Shoulders)', 'Head and shoulders'), tone: 'bear', height: 440
  },
  {
    candles: HS, variant: 'price',
    options: { showVolume: false, segments: [neckline(HS.trough1Idx, HS.length, hsNeck)], points: [{ idx: hsBreak, place: 'below', tone: 'bear', label: CONFIRM }] },
    label: L(`אותו ראש וכתפיים: הסגירה הראשונה מתחת לקו הצוואר (${r2(hsNeck)}) מסומנת`, `The same head and shoulders: the first close below the neckline (${r2(hsNeck)}) is marked`),
    caption: L('השבירה מאשרת', 'The break confirms'), tone: 'bear', height: 440
  },
  {
    candles: TR, variant: 'price', options: { showVolume: false },
    label: L('מחיר שעולה, עושה שלוש פסגות — האמצעית הגבוהה ביותר — ויורד', 'Price rising, making three peaks — the middle one highest — and falling'),
    caption: L('שלוש פסגות', 'Three peaks'), tone: 'neutral', height: 440
  },
  {
    candles: AP, variant: 'price', options: { showVolume: false, dots: [dot(ap.t1.idx, ap.t1.price, L('שיא', 'Peak'), 'bear'), dot(ap.t2.idx, ap.t2.price, L('שיא', 'Peak'), 'bear')], segments: [neckline(ap.low.idx, AP.length, ap.low.price)] },
    label: L(`שני שיאים, ${r2(ap.t1.price)} ו־${r2(ap.t2.price)}, עם שפל של ${r2(ap.low.price)} ביניהם; המחיר כרגע ב־${r2(AP[AP.length - 1]!.c)}`, `Two peaks, ${r2(ap.t1.price)} and ${r2(ap.t2.price)}, with a low of ${r2(ap.low.price)} between them; price is now at ${r2(AP[AP.length - 1]!.c)}`),
    caption: L('גרף חדש', 'A new chart'), tone: 'neutral', height: 300
  },
  {
    candles: QH, variant: 'price', options: { showVolume: false, points: [qh.ls, qh.head, qh.rs].map((s, k) => ({ idx: s.idx, tone: 'gold', label: L(String(k + 1), String(k + 1)) })) },
    label: L('מחיר עם שלוש פסגות מסומנות 1, 2 ו־3', 'Price with three peaks marked 1, 2 and 3'), caption: L('שלוש פסגות מסומנות', 'Three marked peaks'), tone: 'neutral', height: 320
  },
  {
    candles: QB, variant: 'price', options: { showVolume: false, dots: [dot(qb.b1.idx, qb.b1.price, L('שפל', 'Low'), 'bull', true), dot(qb.b2.idx, qb.b2.price, L('שפל', 'Low'), 'bull', true)], segments: [neckline(qb.neck.idx, QB.length, qb.neck.price)] },
    label: L(`תחתית כפולה: שפלים ב־${r2(qb.b1.price)} וב־${r2(qb.b2.price)}, קו צוואר ב־${r2(qb.neck.price)}`, `A double bottom: lows at ${r2(qb.b1.price)} and ${r2(qb.b2.price)}, a neckline at ${r2(qb.neck.price)}`),
    caption: L('תחתית כפולה', 'A double bottom'), tone: 'neutral', height: 320
  },
  {
    candles: QF, variant: 'price', options: { showVolume: false, dots: hsDots(qf), segments: [neckline(qf.t1.idx, QF.length, qf.neck)] },
    label: L('ראש וכתפיים עם קו צוואר, והמשך הגרף אחריו', 'A head and shoulders with its neckline, and the chart after it'), caption: L('מה קרה אחרי?', 'What happened next?'), tone: 'neutral', height: 320
  }
];
// Chart indexes: 0 double top · 1 double bottom · 2 head and shoulders · 3 its break · 4 the Try chart · 5 apply · 6–8 questions.

export const T10: LessonContent = {
  id: 'T10',
  legacyId: 'l7',
  tutor: { topic: 'chart-patterns', label: L('תבניות גרף', 'chart patterns') },
  teach: [
    {
      heading: L('שני ניסיונות, אותו אזור', 'Two attempts, the same place'),
      paragraphs: [
        L('תבנית גרף (Chart Pattern) היא צורה שהמחיר מצייר שוב ושוב — ומאחורי כל צורה יש סיפור על קונים ומוכרים. הפשוטה ביותר היא תקרה כפולה (Double Top): המחיר עולה לשיא, נסוג, עולה שוב לגובה דומה — ונעצר שם פעם שנייה.',
          'A chart pattern is a shape price draws again and again — and behind each shape is a story about buyers and sellers. The simplest is the double top: price rises to a high, pulls back, climbs again to a similar height — and stalls there a second time.'),
        L(`בגרף: שיא ראשון ב־${r2(dt.t1)}, שני ב־${r2(dt.t2)} — קרובים, לא זהים. הקונים דחפו פעמיים ולא הצליחו לעבור את אותו אזור. בין שני השיאים המחיר ירד עד ${r2(dt.neck)}: המקום שבו הקונים נכנסו בפעם האחרונה. השפל הזה הוא קו הצוואר (Neckline) — וכשהמחיר נסגר מתחתיו, הסיפור הושלם: המחיר ירד אחר כך עד ${r2(low(DT, dtBreak))}.`,
          `On the chart: a first top at ${r2(dt.t1)}, a second at ${r2(dt.t2)} — close, not identical. Buyers pushed twice and could not get past the same area. Between the two tops price fell to ${r2(dt.neck)}: where buyers last stepped in. That low is the neckline — and once price closed below it, the story was complete: price then fell to ${r2(low(DT, dtBreak))}.`),
        L(`תחתית כפולה (Double Bottom) היא תמונת הראי: שני שפלים בגובה דומה (${r2(db.b1)} ו־${r2(db.b2)}), שיא ביניהם (${r2(db.neck)}) — וקו הצוואר מעליהם. המוכרים דחפו פעמיים ולא שברו את אותה רצפה; הסגירה מעל קו הצוואר השלימה את התבנית, והמחיר עלה עד ${r2(high(DB, dbBreak))}.`,
          `The double bottom is the mirror image: two lows at a similar level (${r2(db.b1)} and ${r2(db.b2)}), a high between them (${r2(db.neck)}) — and the neckline above. Sellers pushed twice and could not break the same floor; the close above the neckline completed the pattern, and price rose to ${r2(high(DB, dbBreak))}.`)
      ],
      callouts: [{ kind: 'caveat', lead: L('שימו לב', 'Watch out'), text: L('שני שיאים לבד הם רק שני שיאים. התבנית מושלמת רק כשהמחיר נסגר מעבר לקו הצוואר.', 'Two tops on their own are just two tops. The pattern completes only when price closes beyond the neckline.') }],
      work: { kind: 'charts', charts: [0, 1] }
    },
    {
      heading: L('שלוש פסגות, האמצעית הגבוהה', 'Three peaks, the middle one highest'),
      paragraphs: [
        L(`ראש וכתפיים (Head & Shoulders) הוא שלוש פסגות: כתף שמאל (${r2(hs.ls)}), ראש גבוה יותר (${r2(hs.head)}), וכתף ימין (${r2(hs.rs)}) — נמוכה מהראש, בערך בגובה הכתף הראשונה.`,
          `A head and shoulders is three peaks: a left shoulder (${r2(hs.ls)}), a higher head (${r2(hs.head)}), and a right shoulder (${r2(hs.rs)}) — lower than the head, roughly the height of the first shoulder.`),
        L('הסיפור, בשפה של מגמה: עד הראש, כל שיא היה גבוה מזה שלפניו — מגמה עולה. כתף ימין היא השיא הראשון שלא מצליח לעבור את הקודם: הקונים ניסו שוב ולא הגיעו. מבנה שעלה מתחיל להיתקע.',
          'The story, in the language of trends: up to the head, each high beat the one before — an uptrend. The right shoulder is the first high that fails to beat the previous one: buyers tried again and fell short. A structure that was rising starts to stall.'),
        L(`את שני השפלים שבין הפסגות (${r2(hs.t1)} ו־${r2(hs.t2)}) מחבר קו — קו הצוואר. כאן שניהם באותו גובה, אז הקו ישר; לעיתים קרובות הוא נוטה מעט. תבניות בגרף אמיתי כמעט אף פעם לא מסודרות כמו בציור: הכתפיים לא זהות, וקו הצוואר הוא אזור, לא קו דק.`,
          `The two lows between the peaks (${r2(hs.t1)} and ${r2(hs.t2)}) are joined by a line — the neckline. Here both sit at the same height, so the line is flat; often it slopes a little. Patterns on a real chart are almost never as tidy as a drawing: the shoulders are not identical, and the neckline is an area, not a thin line.`)
      ],
      callouts: [{ kind: 'example', lead: L('מה רואים', 'What you see'), text: L('שלוש פסגות, האמצעית הגבוהה ביותר, וקו מתחת לשני השפלים שביניהן.', 'Three peaks, the middle one highest, and a line under the two lows between them.') }],
      work: { kind: 'charts', charts: [2] }
    },
    {
      heading: L('רק השבירה משלימה את התבנית', 'Only the break completes the pattern'),
      paragraphs: [
        L(`עד כתף ימין יש רק צורה. מה שהופך אותה לראש וכתפיים — ולא לשלוש פסגות — הוא סגירה מתחת לקו הצוואר. כאן זה קרה ביום ${hsBreak + 1}, בסגירה של ${r2(HS[hsBreak]!.c)}, מתחת ל־${r2(hsNeck)}.`,
          `Up to the right shoulder there is only a shape. What makes it a head and shoulders — rather than three peaks — is a close below the neckline. Here that happened on day ${hsBreak + 1}, with a close at ${r2(HS[hsBreak]!.c)}, below ${r2(hsNeck)}.`),
        L('למה דווקא שם? קו הצוואר מסמן איפה הקונים נכנסו פעמיים. סגירה מתחתיו אומרת שהפעם הם לא הגיעו: השפלים שהחזיקו את המבנה נשברו — שפל נמוך יותר, בשפה של מגמה.',
          'Why exactly there? The neckline marks where buyers stepped in twice. A close below it says that this time they did not: the lows that held the structure together have given way — a lower low, in the language of trends.'),
        L('עד שקו הצוואר נשבר, התבנית עוד יכולה להיכשל: המחיר יכול לקפוץ מהקו ולהמשיך לשיא חדש, והרבה "ראש וכתפיים" שמזהים מראש לא מושלמים לעולם. וגם סגירה מתחת לקו היא אישור, לא הבטחה — גם תבניות שהושלמו נכשלות.',
          'Until the neckline breaks, the pattern can still fail: price can bounce off the line and go on to a new high, and many "heads and shoulders" spotted in advance never complete. And even a close below the line is confirmation, not a promise — completed patterns fail too.')
      ],
      callouts: [{ kind: 'caveat', lead: L('לפני ואחרי', 'Before and after'), text: L('לפני השבירה — אפשרות. אחריה — תוצאה טיפוסית, לא ודאית.', 'Before the break — a possibility. After it — a typical outcome, not a certain one.') }],
      work: { kind: 'charts', charts: [3] }
    }
  ],
  charts: T10_CHARTS,
  activity: {
    kind: 'markPoints',
    prompt: L('זהו את התבנית', 'Name the pattern'),
    task: L('סמנו את כתף שמאל, את הראש ואת כתף ימין — לחצו על הגרף או הזיזו את הסמן — ואז ענו מה ישלים את התבנית.', 'Mark the left shoulder, the head and the right shoulder — click the chart or move the marker — then say what would complete the pattern.'),
    chart: 4,
    at: 'high',
    points: [
      { target: tr.ls.idx, tolerance: 4, label: L('כתף שמאל', 'Left shoulder'), off: L('הסימון הראשון רחוק מכתף שמאל: הפסגה הראשונה, לפני הראש.', 'The first mark is off the left shoulder: the first peak, before the head.') },
      { target: tr.head.idx, tolerance: 4, label: L('הראש', 'The head'), off: L('הסימון השני רחוק מהראש — הפסגה הגבוהה ביותר בגרף.', 'The second mark is off the head — the highest peak on the chart.') },
      { target: tr.rs.idx, tolerance: 4, label: L('כתף ימין', 'Right shoulder'), off: L('הסימון השלישי רחוק מכתף ימין: הפסגה שאחרי הראש, נמוכה ממנו.', 'The third mark is off the right shoulder: the peak after the head, lower than it.') }
    ],
    compare: {
      question: L('מה ישלים את התבנית?', 'What would complete the pattern?'),
      options: [
        { key: 'shoulder', label: L('שכתף ימין תיווצר — שלוש פסגות מספיקות', 'The right shoulder forming — three peaks are enough') },
        { key: 'neck', label: L('סגירה מתחת לקו שמחבר את שני השפלים — קו הצוואר', 'A close below the line joining the two lows — the neckline') },
        { key: 'head', label: L('שהמחיר יחזור לגובה הראש', 'Price getting back to the height of the head') }
      ],
      correct: 'neck',
      wrong: L('שלוש פסגות הן רק צורה. מה שמשלים את התבנית הוא סגירה מתחת לקו הצוואר — הקו שמחבר את שני השפלים שבין הפסגות.', 'Three peaks are only a shape. What completes the pattern is a close below the neckline — the line joining the two lows between the peaks.')
    },
    right: L(`כתף ב־${r2(tr.ls.price)}, ראש ב־${r2(tr.head.price)}, כתף ב־${r2(tr.rs.price)}: ראש וכתפיים. קו הצוואר עובר ב־${r2(tr.neck)}, והמחיר נסגר מתחתיו ביום ${tr.brk + 1} — התבנית הושלמה.`,
      `A shoulder at ${r2(tr.ls.price)}, a head at ${r2(tr.head.price)}, a shoulder at ${r2(tr.rs.price)}: a head and shoulders. The neckline runs at ${r2(tr.neck)}, and price closed below it on day ${tr.brk + 1} — the pattern completed.`),
    reveal: {
      dots: hsDots(tr),
      segments: [neckline(tr.t1.idx, TR.length, tr.neck), { x1: tr.rs.idx, y1: tr.target, x2: TR.length - 1, y2: tr.target, tone: 'gold', dash: [2, 3], labelAt: 'end', labelAlign: 'right', labelDy: 16, label: L(`יעד משוער ${r2(tr.target)}`, `Estimated target ${r2(tr.target)}`) }],
      // A flat line at the target keeps it inside the price scale (segments alone do not stretch it).
      extraLines: [{ tone: 'gold', values: TR.map(() => tr.target) }],
      points: [{ idx: tr.brk, place: 'below', tone: 'bear', label: CONFIRM }]
    },
    explain: [
      L(`היעד המשוער — "התנועה הנמדדת" (Measured Move): גובה הראש מעל קו הצוואר, מוקרן מטה מקו הצוואר. ${ltr(`${r2(tr.head.price)} − ${r2(tr.neck)} = ${r2(tr.head.price - tr.neck)}`)}, ו־${ltr(`${r2(tr.neck)} − ${r2(tr.head.price - tr.neck)} = ${r2(tr.target)}`)}.`,
        `The estimated target — the "measured move": the head's height above the neckline, projected down from the neckline. ${r2(tr.head.price)} − ${r2(tr.neck)} = ${r2(tr.head.price - tr.neck)}, and ${r2(tr.neck)} − ${r2(tr.head.price - tr.neck)} = ${r2(tr.target)}.`),
      L(`ומה קרה: אחרי השבירה המחיר ירד עד ${r2(low(TR, tr.brk))} — רחוק מ־${r2(tr.target)}. היעד הוא הערכת פתיחה, לא הבטחה: תנועות נופלות ממנו לעיתים קרובות, או חורגות ממנו. ודווקא כי תבניות נכשלות, מי שפועל לפיהן מחליט מראש גם איפה הרעיון מתבטל — למשל סגירה חזרה מעל כתף ימין.`,
        `And what happened: after the break price fell to ${r2(low(TR, tr.brk))} — far from ${r2(tr.target)}. The target is a starting estimate, not a promise: moves regularly fall short of it, or run past it. And precisely because patterns fail, anyone acting on one also decides in advance where the idea is cancelled — a close back above the right shoulder, say.`)
    ]
  },
  apply: {
    id: 't10-apply', lesson: 'T10', category: 'technical', chart: 5,
    question: L(`בגרף החדש: שני שיאים, ${r2(ap.t1.price)} ו־${r2(ap.t2.price)}, עם שפל של ${r2(ap.low.price)} ביניהם. המחיר כרגע ב־${r2(AP[AP.length - 1]!.c)}. זו תקרה כפולה?`,
      `In the new chart: two peaks, ${r2(ap.t1.price)} and ${r2(ap.t2.price)}, with a low of ${r2(ap.low.price)} between them. Price is now at ${r2(AP[AP.length - 1]!.c)}. Is this a double top?`),
    options: [
      { key: 'a', text: L('כן — שני שיאים דומים הם תקרה כפולה, והמחיר ירד', 'Yes — two similar peaks are a double top, and price will fall') },
      { key: 'b', text: L(`עוד לא: יש שני שיאים. התבנית מושלמת רק בסגירה מתחת ל־${r2(ap.low.price)}, ועד אז המחיר יכול גם לפרוץ למעלה`, `Not yet: there are two peaks. The pattern completes only on a close below ${r2(ap.low.price)}, and until then price can also break higher`) },
      { key: 'c', text: L('לא — תקרה כפולה צריכה שלוש פסגות', 'No — a double top needs three peaks') },
      { key: 'd', text: L('כן, כי השיא השני גבוה מהראשון', 'Yes, because the second peak is higher than the first') }
    ],
    correctKey: 'b',
    explanation: L(`אחרי השיא השני המחיר לא נסגר מתחת ל־${r2(ap.low.price)} — הנמוך ביותר היה ${r2(low(AP, ap.t2.idx))}. זו תקרה כפולה אפשרית, לא תבנית שהושלמה: היא יכולה להתממש, ויכולה להפוך לעוד עצירה בדרך למעלה.`,
      `After the second peak price never closed below ${r2(ap.low.price)} — the lowest it got was ${r2(low(AP, ap.t2.idx))}. It is a possible double top, not a completed pattern: it may play out, or turn into one more pause on the way up.`)
  },
  takeaway: {
    bottomLine: L('תבנית גרף מספרת סיפור על קונים ומוכרים: תקרה או תחתית כפולה — שני ניסיונות שנכשלו באותו אזור; ראש וכתפיים — שיא שלא מצליח לעבור את הקודם. התבנית מושלמת רק בסגירה מעבר לקו הצוואר, והיעד המשוער הוא גובה התבנית, מוקרן מהקו.',
      'A chart pattern tells a story about buyers and sellers: a double top or bottom — two attempts that failed at the same area; a head and shoulders — a high that fails to beat the one before. The pattern completes only on a close beyond the neckline, and the estimated target is the pattern\'s height, projected from the line.'),
    caveat: L('לכל תבנית יש תוצאה טיפוסית, לא מובטחת: תבניות נכשלות גם אחרי השבירה, והיעד הוא הערכה גסה. לכן מחליטים מראש איפה הרעיון מתבטל.',
      'Every pattern has a typical outcome, not a guaranteed one: patterns fail even after the break, and the target is a rough estimate. So you decide in advance where the idea is cancelled.')
  },
  questions: [
    q('t10-name', 6, 'beginner',
      L('שלוש פסגות מסומנות. איזו צורה זו?', 'Three peaks are marked. What shape is this?'),
      [['a', L('ראש וכתפיים', 'A head and shoulders')], ['b', L('תקרה כפולה', 'A double top')], ['c', L('תחתית כפולה', 'A double bottom')], ['d', L('אין כאן שום צורה', 'There is no shape here')]], 'a',
      L(`פסגה 2 (${r2(qh.head.price)}) היא הגבוהה ביותר, ו־1 (${r2(qh.ls.price)}) ו־3 (${r2(qh.rs.price)}) נמוכות ממנה ודומות זו לזו: ראש וכתפיים. השפלים שביניהן (${r2(qh.t1.price)} ו־${r2(qh.t2.price)}) הם קו הצוואר — והמחיר אכן נסגר מתחתיו, ב־${r2(QH[qh.brk]!.c)}.`,
        `Peak 2 (${r2(qh.head.price)}) is the highest, and 1 (${r2(qh.ls.price)}) and 3 (${r2(qh.rs.price)}) are lower and similar to each other: a head and shoulders. The lows between them (${r2(qh.t1.price)} and ${r2(qh.t2.price)}) form the neckline — and price did close below it, at ${r2(QH[qh.brk]!.c)}.`)),
    q('t10-target', 7, 'intermediate',
      L(`תחתית כפולה: שפלים ב־${r2(qb.b1.price)} וב־${r2(qb.b2.price)}, קו צוואר ב־${r2(qb.neck.price)}. לפי התנועה הנמדדת, מה היעד המשוער אחרי סגירה מעל קו הצוואר?`,
        `A double bottom: lows at ${r2(qb.b1.price)} and ${r2(qb.b2.price)}, a neckline at ${r2(qb.neck.price)}. By the measured move, what is the estimated target after a close above the neckline?`),
      [['a', L(r2(qbTarget), r2(qbTarget))], ['b', L(r2(qb.b1.price - (qb.neck.price - qb.b1.price)), r2(qb.b1.price - (qb.neck.price - qb.b1.price)))], ['c', L(r2(qb.neck.price - qb.b1.price), r2(qb.neck.price - qb.b1.price))], ['d', L(r2(qb.neck.price + 2 * (qb.neck.price - qb.b1.price)), r2(qb.neck.price + 2 * (qb.neck.price - qb.b1.price)))]], 'a',
      L(`גובה התבנית: ${ltr(`${r2(qb.neck.price)} − ${r2(qb.b1.price)} = ${r2(qb.neck.price - qb.b1.price)}`)}, מוקרן מעלה מקו הצוואר: ${ltr(`${r2(qb.neck.price)} + ${r2(qb.neck.price - qb.b1.price)} = ${r2(qbTarget)}`)}. בגרף הזה, אחרי הסגירה מעל הקו (${r2(QB[qbBreak]!.c)}) המחיר הגיע עד ${r2(high(QB, qbBreak))} — קרוב, אבל לא עד היעד. הערכה, לא הבטחה.`,
        `The pattern's height: ${r2(qb.neck.price)} − ${r2(qb.b1.price)} = ${r2(qb.neck.price - qb.b1.price)}, projected up from the neckline: ${r2(qb.neck.price)} + ${r2(qb.neck.price - qb.b1.price)} = ${r2(qbTarget)}. On this chart, after the close above the line (${r2(QB[qbBreak]!.c)}) price reached ${r2(high(QB, qbBreak))} — close, but not all the way. An estimate, not a promise.`)),
    q('t10-failed', 8, 'intermediate',
      L('ראש וכתפיים שנסגר מתחת לקו הצוואר — ואז טיפס מעל הראש. מה זה מלמד?', 'A head and shoulders that closed below its neckline — then climbed above the head. What does that show?'),
      [
        ['a', L('שהתבנית זוהתה לא נכון', 'That the pattern was identified wrongly')],
        ['b', L('שגם תבנית שהושלמה יכולה להיכשל — ולכן מחליטים מראש איפה הרעיון מתבטל', 'That even a completed pattern can fail — which is why you decide in advance where the idea is cancelled')],
        ['c', L('שתבניות תמיד נכשלות', 'That patterns always fail')],
        ['d', L('שקו הצוואר היה צריך לעבור דרך הראש', 'That the neckline should have run through the head')]
      ], 'b',
      L(`המחיר נסגר מתחת לקו הצוואר (${r2(qf.neck)}) ב־${r2(QF[qf.brk]!.c)}, ירד עד ${r2(qfLow.price)} — ואז עלה עד ${r2(high(QF, qfLow.idx))}, מעל הראש (${r2(qf.head.price)}). התבנית זוהתה נכון והושלמה; היא פשוט נכשלה. זו בדיוק הסיבה שתבנית היא תרחיש עם נקודת ביטול, לא תחזית.`,
        `Price closed below the neckline (${r2(qf.neck)}) at ${r2(QF[qf.brk]!.c)}, fell to ${r2(qfLow.price)} — then rose to ${r2(high(QF, qfLow.idx))}, above the head (${r2(qf.head.price)}). The pattern was identified correctly and completed; it simply failed. That is exactly why a pattern is a scenario with a cancel point, not a forecast.`)),
    // The previous build's l7 questions: the double bottom, the measured move, and "typical, not guaranteed".
    ...(getQuizQuestions({}) as QuizQuestion[]).filter((x) => x.lesson === 'l7')
  ]
};
