// ---------------------------------------------------------------------------
// Technical Analysis, lesson 12 — the project: combining indicators without
// contradicting yourself.
//
// Sources: the approved curriculum (T12 · project · knowledge-base topics
// combining-indicators, breakout-volume-rsi-conflict-scenario, volatility) and
// the Artifact's lesson row for it ("build a full analysis with a stop and a
// target"). The knowledge base sets the method: trend first, then volume, then
// RSI / MACD; tools that conflict mean caution; a heavy-volume breakout with
// RSI above 70 is strong but stretched.
//
// Pulls T1–T11 together and re-teaches none of them: each earlier tool is
// named with the one question it answers. New here: reading them in order,
// treating a conflict as the reading, and deciding in advance where an idea
// is wrong (the "stop", as an analysis point — how much to risk on it is the
// Risk track's) and roughly how far it could go (T10's measured move).
//
// Every price, volume multiple and RSI value in the text is read from the data.
// ---------------------------------------------------------------------------
import type { Localized, QuizQuestion } from '@core/types/kb';
import type { LessonChartSpec } from '@core/charts/lessonCharts';
import * as series from '@core/charts/series.js';
import type { LessonContent } from './types';

const L = (he: string, en: string): Localized => ({ he, en });
const r0 = (x: number) => String(Math.round(x));
const r1 = (x: number) => x.toFixed(1);
const r2 = (x: number) => x.toFixed(2);
/** Isolates a formula inside Hebrew text so it reads left to right. */
const ltr = (x: string) => `⁦${x}⁩`;
const q = (id: string, chart: number, difficulty: 'beginner' | 'intermediate', question: Localized, options: Array<[string, Localized]>, correctKey: string, explanation: Localized): QuizQuestion => ({
  id, lesson: 'T12', category: 'technical', difficulty, chart, question, options: options.map(([key, text]) => ({ key, text })), correctKey, explanation
});

type C = Array<{ h: number; l: number; c: number; v: number }>;
const low = (c: C, from: number, to = c.length) => Math.min(...c.slice(from, to).map((x) => x.l));
const high = (c: C, from: number, to = c.length) => Math.max(...c.slice(from, to).map((x) => x.h));
/** The breakout day's volume against the average of the days before it. */
const volX = (c: C & { breakIdx: number }) => c[c.breakIdx]!.v / (c.slice(0, c.breakIdx).reduce((s, x) => s + x.v, 0) / c.breakIdx);
const last = (c: C) => c[c.length - 1]!.c;

const CEIL = L('תקרה', 'Ceiling');
const ceiling = (r: [number, number]) => ({ range: r, tone: 'resistance', label: CEIL });
const MA = (c: { ma50: Array<number | null> }) => ({ tone: 'sma50', values: c.ma50 });
const BREAK = L('סגירה מעל התקרה', 'Close above the ceiling');
const TOOLS_NOTE = L('הקו הכחול: ממוצע 50 ימים · בחלונית התחתונה: RSI (14).', 'Blue line: 50-day average · lower panel: RSI (14).');

// Steps 1–2: an uptrend testing a ceiling three times.
const TE = series.T12_TEACH;
const teHighs = TE.swings.filter((s) => s.type === 'high'), teLows = TE.swings.filter((s) => s.type === 'low');
const [teP1, teP2, teP3] = teHighs as [typeof teHighs[0], typeof teHighs[0], typeof teHighs[0]];
const rsiAt = (c: { rsi: Array<number | null> }, i: number) => c.rsi[i]!;
const teMa = { from: TE.ma50[teP2.idx]!, to: TE.ma50[TE.length - 1]! };
// Step 3: the plan — where the idea is wrong, and how far it could go.
const PL = series.T12_PLAN;
const plFloor = low(PL, PL.swings[0]!.idx, PL.breakIdx);
const plHeight = PL.resist[1] - plFloor, plTarget = PL.resist[1] + plHeight;
// The Try.
const CA = series.T12_CASE;
const caPeak = CA.swings[2]!, caB = CA.breakIdx;
const caRsi = { peak: rsiAt(CA, caPeak.idx), brk: rsiAt(CA, caB) };
const caTarget = CA.resist[1] + (CA.resist[1] - CA.swings[1]!.price);
const caMa = { from: CA.ma50[caB - 20]!, to: CA.ma50[caB]! };
// Apply and questions.
const AP = series.T12_APPLY, QA = series.T12_Q_AGREE, QP = series.T12_Q_PLAN, QD = series.T12_Q_DIV;
const qaPeak = QA.swings[2]!;
const qdHighs = QD.swings.filter((s) => s.type === 'high'), qdLastLow = QD.swings[3]!;

const T12_CHARTS: LessonChartSpec[] = [
  {
    candles: TE, variant: 'price-rsi', options: { zones: [ceiling(TE.resist)], extraLines: [MA(TE)] },
    label: L(`מגמה עולה מעל ממוצע 50 ימים, שבודקת שלוש פעמים תקרה ב־${r2(TE.resist[0])}–${r2(TE.resist[1])}, ומתחתיה RSI`, `An uptrend above its 50-day average, testing a ceiling at ${r2(TE.resist[0])}–${r2(TE.resist[1])} three times, with RSI beneath it`),
    caption: L('ארבעה כלים, גרף אחד', 'Four tools, one chart'), subcaption: TOOLS_NOTE, tone: 'neutral', height: 460
  },
  {
    candles: TE, variant: 'price-rsi',
    options: { zones: [ceiling(TE.resist)], extraLines: [MA(TE)], links: [
      { i1: teP2.idx, i2: teP3.idx, panel: 'price', at: 'high', tone: 'gold', label: L('שיא גבוה יותר', 'Higher high') },
      { i1: teP2.idx, i2: teP3.idx, panel: 'sub', at: 'high', tone: 'bear', label: L('RSI: נמוך יותר', 'RSI: lower') }
    ] },
    label: L(`אותו גרף: בין שתי הבדיקות האחרונות של התקרה המחיר עלה מ־${r2(teP2.price)} ל־${r2(teP3.price)}, ו־RSI ירד מ־${r0(rsiAt(TE, teP2.idx))} ל־${r0(rsiAt(TE, teP3.idx))}`, `The same chart: between the last two tests of the ceiling price rose from ${r2(teP2.price)} to ${r2(teP3.price)}, and RSI fell from ${r0(rsiAt(TE, teP2.idx))} to ${r0(rsiAt(TE, teP3.idx))}`),
    caption: L('הכלים לא מסכימים', "The tools don't agree"), subcaption: TOOLS_NOTE, tone: 'neutral', height: 460
  },
  {
    candles: PL, variant: 'price',
    options: {
      showVolume: true, zones: [ceiling(PL.resist)], points: [{ idx: PL.breakIdx, tone: 'bull', label: BREAK }],
      segments: [
        { x1: 0, y1: PL.resist[0], x2: PL.length - 1, y2: PL.resist[0], tone: 'bear', dash: [3, 3], labelAt: 'end', labelAlign: 'right', labelDy: 14, label: L(`הרעיון מתבטל מתחת ל־${r2(PL.resist[0])}`, `The idea is cancelled below ${r2(PL.resist[0])}`) },
        { x1: PL.breakIdx - 12, y1: plTarget, x2: PL.length - 1, y2: plTarget, tone: 'gold', dash: [2, 3], labelAt: 'start', labelAlign: 'right', label: L(`יעד משוער ${r2(plTarget)}`, `Estimated target ${r2(plTarget)}`) }
      ],
      extraLines: [{ tone: 'gold', values: PL.map((_, i) => (i >= PL.breakIdx - 12 ? plTarget : null)) }]
    },
    label: L(`פריצה מטווח: סגירה ב־${r2(PL[PL.breakIdx]!.c)} מעל תקרה ב־${r2(PL.resist[0])}–${r2(PL.resist[1])}; נקודת הביטול מתחת לתקרה, ויעד משוער ב־${r2(plTarget)}`, `A range breakout: a close at ${r2(PL[PL.breakIdx]!.c)} above a ceiling at ${r2(PL.resist[0])}–${r2(PL.resist[1])}; the cancel point below the ceiling, and an estimated target at ${r2(plTarget)}`),
    caption: L('איפה טועים, ועד לאן', "Where it's wrong, and how far"), tone: 'neutral', height: 440
  },
  {
    candles: CA, variant: 'price-rsi', options: { zones: [ceiling(CA.resist)], extraLines: [MA(CA)], points: [{ idx: caB, tone: 'gold', label: L('יום הפריצה', 'Breakout day') }] },
    label: L(`מגמה עולה מעל ממוצע 50 ימים, תקרה ב־${r2(CA.resist[0])}–${r2(CA.resist[1])} שנבדקה פעמיים, וסגירה מעליה; מתחת — RSI`, `An uptrend above its 50-day average, a ceiling at ${r2(CA.resist[0])}–${r2(CA.resist[1])} tested twice, and a close above it; beneath — RSI`),
    caption: L('ניתוח שלם', 'A full analysis'), subcaption: TOOLS_NOTE, tone: 'neutral', height: 460
  },
  {
    candles: AP, variant: 'price-rsi', options: { zones: [ceiling(AP.resist)], points: [{ idx: AP.breakIdx, tone: 'gold', label: BREAK }] },
    label: L(`פריצה מעל תקרה ב־${r2(AP.resist[0])}–${r2(AP.resist[1])}, כש־RSI מעל 70`, `A breakout above a ceiling at ${r2(AP.resist[0])}–${r2(AP.resist[1])}, with RSI above 70`),
    caption: L('גרף חדש', 'A new chart'), tone: 'neutral', height: 320
  },
  {
    candles: QA, variant: 'price-rsi', options: { zones: [ceiling(QA.resist)], extraLines: [MA(QA)], points: [{ idx: QA.breakIdx, tone: 'gold', label: BREAK }] },
    label: L('מגמה עולה מעל ממוצע 50 ימים, וסגירה מעל תקרה; מתחת — RSI', 'An uptrend above its 50-day average, and a close above a ceiling; beneath — RSI'),
    caption: L('מגמה, פריצה, מומנטום', 'Trend, breakout, momentum'), subcaption: TOOLS_NOTE, tone: 'neutral', height: 340
  },
  {
    candles: QP, variant: 'price', options: { showVolume: true, zones: [ceiling(QP.resist)], points: [{ idx: QP.breakIdx, tone: 'gold', label: BREAK }] },
    label: L(`פריצה מטווח: סגירה ב־${r2(QP[QP.breakIdx]!.c)} מעל תקרה ב־${r2(QP.resist[0])}–${r2(QP.resist[1])}`, `A range breakout: a close at ${r2(QP[QP.breakIdx]!.c)} above a ceiling at ${r2(QP.resist[0])}–${r2(QP.resist[1])}`),
    caption: L('פריצה מטווח', 'A range breakout'), tone: 'neutral', height: 320
  },
  {
    candles: QD, variant: 'price-rsi', options: { extraLines: [MA(QD)], points: qdHighs.map((s, k) => ({ idx: s.idx, tone: 'gold', label: L(String(k + 1), String(k + 1)) })) },
    label: L('מגמה עולה מעל ממוצע 50 ימים, עם שלוש פסגות מסומנות 1–3; מתחת — RSI', 'An uptrend above its 50-day average, with three peaks marked 1–3; beneath — RSI'),
    caption: L('שלוש פסגות', 'Three peaks'), subcaption: TOOLS_NOTE, tone: 'neutral', height: 340
  }
];
// Chart indexes: 0 four tools · 1 the conflict · 2 the plan · 3 the Try chart · 4 apply · 5–7 questions.

export const T12: LessonContent = {
  id: 'T12',
  tutor: { topic: 'combining-indicators', label: L('שילוב אינדיקטורים', 'combining indicators') },
  teach: [
    {
      heading: L('לכל כלי — שאלה אחרת', 'Each tool answers a different question'),
      paragraphs: [
        L('למדתם במסלול הזה כמה כלים. הטעות הנפוצה היא להשתמש בכולם בבת אחת כאילו כל אחד מוסיף "עוד הצבעה". בפועל, כל כלי עונה על שאלה אחרת — ורק כשיודעים מהי, אפשר לשלב בלי לסתור את עצמכם.',
          'Over this track you have learned several tools. The common mistake is to use them all at once as if each adds "one more vote". In fact each tool answers a different question — and only once you know which can you combine them without contradicting yourself.'),
        L(`מגמה: לאן? כאן שפלים עולים (${teLows.map((s) => r2(s.price)).join(' ואחריו ')}) ומחיר מעל ממוצע 50 ימים שעולה (מ־${r2(teMa.from)} ל־${r2(teMa.to)}). רמות: איפה? תקרה ב־${r2(TE.resist[0])}–${r2(TE.resist[1])}, שנבדקה שלוש פעמים. נפח: בכמה שכנוע? הוא נמדד ביום שבו המחיר פורץ רמה. מומנטום (RSI, MACD): באיזה כוח? RSI בחלונית התחתונה.`,
          `Trend: which way? Here, rising lows (${teLows.map((s) => r2(s.price)).join(' then ')}) and price above a rising 50-day average (from ${r2(teMa.from)} to ${r2(teMa.to)}). Levels: where? A ceiling at ${r2(TE.resist[0])}–${r2(TE.resist[1])}, tested three times. Volume: with how much conviction? It is read on the day price breaks a level. Momentum (RSI, MACD): with how much force? RSI in the lower panel.`),
        L('והסדר חשוב: קודם המגמה — התמונה הגדולה; אחר כך הרמות — איפה המחיר עומד בתוכה; ורק אז נפח ומומנטום, שמתארים את הכוח של המהלך הנוכחי. ושני כלים מאותו סוג — RSI ו־MACD, שניהם מומנטום — שמסכימים הם דעה אחת שנאמרה פעמיים, לא שתי ראיות.',
          'And the order matters: first the trend — the big picture; then the levels — where price stands within it; and only then volume and momentum, which describe the force of the current move. And two tools of the same kind — RSI and MACD, both momentum — agreeing are one opinion said twice, not two pieces of evidence.')
      ],
      callouts: [{ kind: 'example', lead: L('ארבע שאלות', 'Four questions'), text: L('לאן? (מגמה) · איפה? (רמות) · בכמה שכנוע? (נפח) · באיזה כוח? (מומנטום)', 'Which way? (trend) · Where? (levels) · How convinced? (volume) · How much force? (momentum)') }],
      work: { kind: 'charts', charts: [0] }
    },
    {
      heading: L('כשהכלים לא מסכימים', "When the tools don't agree"),
      paragraphs: [
        L(`בין שתי הבדיקות האחרונות של התקרה, המחיר עשה שיא גבוה יותר (${r2(teP2.price)}, ואחריו ${r2(teP3.price)}) — אבל RSI באותם ימים ירד, מ־${r0(rsiAt(TE, teP2.idx))} ל־${r0(rsiAt(TE, teP3.idx))}. המגמה אומרת "למעלה"; המומנטום אומר "בפחות כוח"; והמחיר עומד מתחת לתקרה.`,
          `Between the last two tests of the ceiling, price made a higher high (${r2(teP2.price)}, then ${r2(teP3.price)}) — but RSI on those days fell, from ${r0(rsiAt(TE, teP2.idx))} to ${r0(rsiAt(TE, teP3.idx))}. The trend says "up"; momentum says "with less force"; and price is standing under a ceiling.`),
        L('מה עושים עם סתירה? לא בוחרים את הכלי שאומר את מה שרוצים לשמוע. הסתירה היא הקריאה עצמה: התמונה לא ברורה — ולכן זהירות. מחכים שהמחיר יכריע: סגירה מעל התקרה בנפח גבוה, או שבירה של השפל העולה האחרון.',
          'What do you do with a conflict? Not pick the tool that says what you want to hear. The conflict is the reading itself: the picture is unclear — so, caution. You wait for price to settle it: a close above the ceiling on heavy volume, or a break of the last rising low.'),
        L(`כאן, אחרי הבדיקה השלישית המחיר נסוג עד ${r2(low(TE, teP3.idx))}. אבל זה מקרה אחד — בשיעור על דייברג׳נס ראיתם גם מומנטום שנחלש בזמן שהמחיר ממשיך לעלות. הסתירה לא ניבאה את הירידה; היא אמרה שהתמונה לא נקייה.`,
          `Here, after the third test price slipped back to ${r2(low(TE, teP3.idx))}. But that is one case — in the lesson on divergence you also saw momentum fading while price kept rising. The conflict did not predict the dip; it said the picture was not clean.`)
      ],
      callouts: [{ kind: 'caveat', lead: L('שימו לב', 'Watch out'), text: L('סתירה בין כלים היא לא איתות נסתר לאף כיוון — היא סיבה לזהירות.', 'A conflict between tools is not a hidden signal either way — it is a reason for caution.') }],
      work: { kind: 'charts', charts: [1] }
    },
    {
      heading: L('איפה הקריאה שגויה — ועד לאן היא יכולה להגיע', 'Where the read is wrong — and how far it could go'),
      paragraphs: [
        L(`לפני שפועלים לפי קריאה, מחליטים איפה היא שגויה. כאן הקריאה היא "פריצה מטווח": סגירה ב־${r2(PL[PL.breakIdx]!.c)} מעל תקרה ב־${r2(PL.resist[0])}–${r2(PL.resist[1])}, בנפח של פי ${r1(volX(PL))} מהממוצע. היא שגויה אם המחיר נסגר בחזרה בתוך הטווח — מתחת ל־${r2(PL.resist[0])}. זו נקודת הביטול (לרוב קוראים לה "סטופ"): מחליטים עליה עכשיו, לפני שקרה משהו.`,
          `Before acting on a reading, decide where it is wrong. Here the reading is "a breakout from a range": a close at ${r2(PL[PL.breakIdx]!.c)} above a ceiling at ${r2(PL.resist[0])}–${r2(PL.resist[1])}, on ${r1(volX(PL))} times the average volume. It is wrong if price closes back inside the range — below ${r2(PL.resist[0])}. That is the cancel point (often called the "stop"): decided now, before anything has happened.`),
        L(`והצד השני — הערכה גסה של המרחק, כמו בשיעור על תבניות: גובה הטווח (${ltr(`${r2(PL.resist[1])} − ${r2(plFloor)} = ${r2(plHeight)}`)}) מוקרן מעלה מהתקרה: ${ltr(`${r2(PL.resist[1])} + ${r2(plHeight)} = ${r2(plTarget)}`)}. הגרף נגמר ב־${r2(last(PL))}, לפני שהתשובה ידועה.`,
          `And the other side — a rough estimate of the distance, as in the lesson on patterns: the range's height (${r2(PL.resist[1])} − ${r2(plFloor)} = ${r2(plHeight)}) projected up from the ceiling: ${r2(PL.resist[1])} + ${r2(plHeight)} = ${r2(plTarget)}. The chart ends at ${r2(last(PL))}, before the answer is known.`),
        L('נקודת ביטול ויעד לא הופכים קריאה לנכונה — הם הופכים אותה לתוכנית: יודעים מראש מה יגרום לכם להודות בטעות, ובערך כמה אפשר להרוויח אם צדקתם. כמה כסף לסכן על המרחק הזה — גודל הפוזיציה — הוא נושא של מסלול ניהול הסיכונים.',
          'A cancel point and a target do not make a reading right — they make it a plan: you know in advance what will make you admit you were wrong, and roughly how much there is to gain if you were right. How much money to risk on that distance — position size — is a subject for the risk management track.')
      ],
      work: { kind: 'charts', charts: [2] }
    }
  ],
  charts: T12_CHARTS,
  activity: {
    kind: 'checklist',
    prompt: L('ניתוח שלם', 'A full analysis'),
    task: L('עברו על הגרף כלי אחרי כלי, לפי הסדר. כל תשובה ננעלת ומוסברת; בסוף — הקריאה המשולבת.', 'Go through the chart one tool at a time, in order. Each answer locks and explains itself; at the end — the combined reading.'),
    chart: 3,
    items: [
      { id: 'trend', question: L('מה אומרת המגמה?', 'What does the trend say?'),
        options: [{ key: 'up', label: L('עולה — שפלים עולים, ומחיר מעל ממוצע 50 ימים שעולה', 'Up — rising lows, and price above a rising 50-day average') }, { key: 'down', label: L('יורדת — המחיר נמוך מהשיא הראשון', 'Down — price is below its first peak') }, { key: 'side', label: L('אין מגמה — המחיר נתקע מתחת לתקרה', 'No trend — price is stuck under a ceiling') }],
        correct: 'up', why: L(`שפלים עולים (${r2(CA.swings[1]!.price)}, ואחריו ${r2(CA.swings[3]!.price)}), והממוצע עלה מ־${r2(caMa.from)} ל־${r2(caMa.to)} ב־20 הימים שלפני הפריצה. המגמה עולה.`, `Rising lows (${r2(CA.swings[1]!.price)}, then ${r2(CA.swings[3]!.price)}), and the average rose from ${r2(caMa.from)} to ${r2(caMa.to)} in the 20 days before the breakout. The trend is up.`) },
      { id: 'volume', question: L(`ביום הפריצה הנפח היה פי ${r1(volX(CA))} מהממוצע. מה זה אומר על הסגירה מעל התקרה?`, `On the breakout day volume was ${r1(volX(CA))} times the average. What does that say about the close above the ceiling?`),
        options: [{ key: 'strong', label: L('אישור חזק — המחיר פרץ', 'Strong confirmation — price broke out') }, { key: 'weak', label: L('מעט משתתפים — הפריצה לא מאושרת', 'Few took part — the breakout is unconfirmed') }, { key: 'none', label: L('נפח לא משנה בפריצה', "Volume doesn't matter in a breakout") }],
        correct: 'weak', why: L('פריצה בנפח נמוך מהממוצע אומרת שמעטים השתתפו בה — כמו בשיעור על פריצות: היא יכולה להחזיק, אבל אין לה אישור.', 'A breakout on below-average volume says few took part in it — as in the lesson on breakouts: it can hold, but it has no confirmation.') },
      { id: 'momentum', question: L(`RSI ביום הפריצה: ${r0(caRsi.brk)}. בבדיקה הקודמת של התקרה: ${r0(caRsi.peak)}. מה אומר המומנטום?`, `RSI on the breakout day: ${r0(caRsi.brk)}. At the previous test of the ceiling: ${r0(caRsi.peak)}. What does momentum say?`),
        options: [{ key: 'agree', label: L('חזק יותר — מסכים עם הפריצה', 'Stronger — it agrees with the breakout') }, { key: 'fade', label: L('המחיר גבוה יותר, המומנטום נמוך יותר — דייברג׳נס', 'Price is higher, momentum lower — a divergence') }, { key: 'sell', label: L('RSI מעל 60 — איתות מכירה', 'RSI above 60 — a sell signal') }],
        correct: 'fade', why: L(`המחיר עבר את השיא הקודם (${r2(caPeak.price)}), אבל RSI נמוך יותר (${r0(caRsi.brk)} מול ${r0(caRsi.peak)}): המהלך מגיע גבוה יותר בפחות כוח. תצפית, לא תחזית.`, `Price got past the previous peak (${r2(caPeak.price)}), but RSI is lower (${r0(caRsi.brk)} against ${r0(caRsi.peak)}): the move reaches higher with less force. An observation, not a forecast.`) },
      { id: 'cancel', question: L('מי שפועל לפי הפריצה — איפה הרעיון בבירור שגוי?', 'If you act on the breakout — where is the idea clearly wrong?'),
        options: [{ key: 'ceiling', label: L(`סגירה בחזרה מתחת לתקרה — מתחת ל־${r2(CA.resist[0])}`, `A close back below the ceiling — under ${r2(CA.resist[0])}`) }, { key: 'rsi', label: L('כש־RSI יחצה את 70', 'When RSI crosses 70') }, { key: 'red', label: L('בכל נר אדום', 'On any red candle') }],
        correct: 'ceiling', why: L(`הרעיון הוא "המחיר פרץ". הוא שגוי כשהמחיר נסגר בחזרה בתוך הטווח, מתחת ל־${r2(CA.resist[0])}. סגירה מתחת לשפל העולה האחרון (${r2(CA.swings[3]!.price)}) הייתה הולכת רחוק יותר — שוברת את מבנה המגמה.`, `The idea is "price broke out". It is wrong once price closes back inside the range, below ${r2(CA.resist[0])}. A close below the last rising low (${r2(CA.swings[3]!.price)}) would go further — it would break the trend's structure.`) },
      { id: 'target', question: L(`מתחת לתקרה (${r2(CA.resist[1])}) המחיר ירד עד ${r2(CA.swings[1]!.price)}. לפי התנועה הנמדדת, מה היעד המשוער?`, `Below the ceiling (${r2(CA.resist[1])}) price dipped as low as ${r2(CA.swings[1]!.price)}. By the measured move, what is the estimated target?`),
        options: [{ key: 'target', label: L(r2(caTarget), r2(caTarget)) }, { key: 'low', label: L(r2(CA.swings[1]!.price), r2(CA.swings[1]!.price)) }, { key: 'height', label: L(r2(CA.resist[1] - CA.swings[1]!.price), r2(CA.resist[1] - CA.swings[1]!.price)) }],
        correct: 'target', why: L(`גובה הטווח: ${ltr(`${r2(CA.resist[1])} − ${r2(CA.swings[1]!.price)} = ${r2(CA.resist[1] - CA.swings[1]!.price)}`)}, מוקרן מעלה מהתקרה: ${ltr(`${r2(CA.resist[1])} + ${r2(CA.resist[1] - CA.swings[1]!.price)} = ${r2(caTarget)}`)}. הערכה גסה, לא הבטחה.`, `The range's height: ${r2(CA.resist[1])} − ${r2(CA.swings[1]!.price)} = ${r2(CA.resist[1] - CA.swings[1]!.price)}, projected up from the ceiling: ${r2(CA.resist[1])} + ${r2(CA.resist[1] - CA.swings[1]!.price)} = ${r2(caTarget)}. A rough estimate, not a promise.`) },
      { id: 'overall', question: L('ובסך הכול — מה הקריאה הסבירה?', 'Put together — what is the reasonable reading?'),
        options: [{ key: 'buy', label: L('קנייה חזקה: המגמה עולה והמחיר פרץ', 'A strong buy: the trend is up and price broke out') }, { key: 'caution', label: L('המגמה עולה, אבל הפריצה חלשה והמומנטום דועך — הכלים לא מסכימים: זהירות, ולחכות לאישור', 'The trend is up, but the breakout is thin and momentum is fading — the tools disagree: caution, and wait for confirmation') }, { key: 'sell', label: L('מכירה: הדייברג׳נס אומר שתבוא ירידה', 'A sell: the divergence says a fall is coming') }],
        correct: 'caution', why: L('שני כלים תומכים (מגמה, פריצה) ושניים מסתייגים (נפח, מומנטום). קריאה שמתעלמת מהחצי שלא מתאים לה סותרת את עצמה. הקריאה הכנה: תמונה מעורבת — זהירות, עם נקודת ביטול ידועה מראש.', 'Two tools support (trend, breakout) and two hold back (volume, momentum). A reading that ignores the half that does not suit it contradicts itself. The honest reading: a mixed picture — caution, with a cancel point known in advance.') }
    ],
    right: L(`ניתוח שלם: מגמה עולה, פריצה לא מאושרת, מומנטום שדועך, נקודת ביטול מתחת ל־${r2(CA.resist[0])} ויעד גס סביב ${r2(caTarget)}. הכלים לא מסכימים — וזו התשובה: זהירות.`,
      `A full analysis: an uptrend, an unconfirmed breakout, fading momentum, a cancel point below ${r2(CA.resist[0])} and a rough target around ${r2(caTarget)}. The tools disagree — and that is the answer: caution.`),
    reveal: {
      // The link's own label marks the breakout candle once answered.
      points: [],
      extraLines: [MA(CA), { tone: 'gold', values: CA.map((_, i) => (i >= caPeak.idx ? caTarget : null)) }],
      links: [
        { i1: caPeak.idx, i2: caB, panel: 'price', at: 'high', tone: 'gold', label: L('גבוה יותר', 'Higher') },
        { i1: caPeak.idx, i2: caB, panel: 'sub', at: 'high', tone: 'bear', label: L('RSI: נמוך יותר', 'RSI: lower') }
      ]
    },
    explain: [
      L(`מה קרה אחר כך: המחיר נשאר מעל התקרה בימים שאחרי הפריצה (הנמוך ביותר: ${r2(low(CA, caB + 1))}) והגרף נגמר ב־${r2(last(CA))} — הפריצה לא נכשלה, אבל גם לא רצה: רחוק מ־${r2(caTarget)} (הקו הזהוב).`,
        `What happened next: price stayed above the ceiling in the days after the breakout (the lowest: ${r2(low(CA, caB + 1))}) and the chart ends at ${r2(last(CA))} — the breakout did not fail, but it did not run either: far from ${r2(caTarget)} (the gold line).`),
      L(`הניתוח לא היה צריך לנבא את זה. הוא אמר: המגמה עולה, הפריצה לא מאושרת, המומנטום דועך — תמונה מעורבת; וידעתם מראש איפה תודו בטעות (${r2(CA.resist[0])}) ובערך עד לאן זה יכול להגיע (${r2(caTarget)}). זה מה שאומר "לשלב אינדיקטורים בלי לסתור את עצמכם": כל כלי עונה על השאלה שלו, וסתירה ביניהם נקראת כזהירות — לא מוסתרת.`,
        `The analysis did not need to predict that. It said: the trend is up, the breakout is unconfirmed, momentum is fading — a mixed picture; and you knew in advance where you would admit you were wrong (${r2(CA.resist[0])}) and roughly how far it could go (${r2(caTarget)}). That is what "combining indicators without contradicting yourself" means: each tool answers its own question, and a conflict between them is read as caution — not hidden.`)
    ]
  },
  apply: {
    id: 't12-apply', lesson: 'T12', category: 'technical', chart: 4,
    question: L(`בגרף החדש: סגירה מעל התקרה (${r2(AP[AP.breakIdx]!.c)}) בנפח של פי ${r1(volX(AP))} מהממוצע — ו־RSI כבר ב־${r0(rsiAt(AP, AP.breakIdx))}. הכלים מושכים לשני כיוונים. מה הקריאה הסבירה?`,
      `In the new chart: a close above the ceiling (${r2(AP[AP.breakIdx]!.c)}) on ${r1(volX(AP))} times the average volume — and RSI already at ${r0(rsiAt(AP, AP.breakIdx))}. The tools pull two ways. What is the reasonable reading?`),
    options: [
      { key: 'a', text: L('מכירה: RSI מעל 70 אומר קניית יתר, אז המחיר ירד', 'Sell: RSI above 70 means overbought, so price will fall') },
      { key: 'b', text: L('לקנות מיד, בכל מחיר: הנפח מאשר', 'Buy now, at any price: volume confirms') },
      { key: 'c', text: L('הפריצה מאושרת בנפח, אבל המחיר מתוח — רבים מעדיפים לחכות לנסיגה או להפוגה במקום לרדוף אחריו', 'The breakout is confirmed by volume, but price is stretched — many prefer to wait for a pullback or a pause rather than chase it') },
      { key: 'd', text: L('להתעלם משניהם', 'Ignore both') }
    ],
    correctKey: 'c',
    explanation: L(`הנפח אומר שהפריצה אמיתית; RSI מעל 70 אומר שהמהלך כבר מתוח — לא שהוא נגמר. הפעם לא באה נסיגה: המחיר המשיך עד ${r2(last(AP))}. גם לחכות עולה משהו — ההחלטה היא איזה סיכון מעדיפים, לא מי צודק.`,
      `Volume says the breakout is real; RSI above 70 says the move is already stretched — not that it is over. This time no pullback came: price went on to ${r2(last(AP))}. Waiting has a cost too — the decision is about which risk you prefer, not about who is right.`)
  },
  takeaway: {
    bottomLine: L('ניתוח שלם הולך לפי הסדר: קודם מגמה, אחר כך רמות, ורק אז נפח ומומנטום — כל כלי עונה על שאלה אחרת. לפני שפועלים, מחליטים איפה הרעיון שגוי ומעריכים בגסות עד לאן הוא יכול להגיע.',
      'A full reading goes in order: trend first, then levels, and only then volume and momentum — each tool answers a different question. Before acting, decide where the idea is wrong and roughly estimate how far it could go.'),
    caveat: L('כשהכלים לא מסכימים, אי־ההסכמה היא הקריאה: זהירות, לא איתות נסתר. שני כלים מאותו סוג שמסכימים הם דעה אחת — ושום שילוב לא הופך קריאה להבטחה.',
      'When the tools disagree, the disagreement is the reading: caution, not a hidden signal. Two tools of the same kind agreeing are one opinion — and no combination turns a reading into a guarantee.')
  },
  questions: [
    q('t12-agree', 5, 'intermediate',
      L(`מגמה עולה, סגירה מעל התקרה בנפח של פי ${r1(volX(QA))} מהממוצע, ו־RSI ביום הפריצה (${r0(rsiAt(QA, QA.breakIdx))}) גבוה מאשר בבדיקה הקודמת של התקרה (${r0(rsiAt(QA, qaPeak.idx))}). הכלים מסכימים?`,
        `An uptrend, a close above the ceiling on ${r1(volX(QA))} times the average volume, and RSI on the breakout day (${r0(rsiAt(QA, QA.breakIdx))}) higher than at the previous test of the ceiling (${r0(rsiAt(QA, qaPeak.idx))}). Do the tools agree?`),
      [
        ['a', L('כן — מגמה, נפח ומומנטום מצביעים לאותו כיוון; ועדיין אין הבטחה, ונקודת הביטול עדיין חשובה', 'Yes — trend, volume and momentum point the same way; there is still no guarantee, and the cancel point still matters')],
        ['b', L('לא — RSI מעל 70 סותר את הפריצה', 'No — RSI above 70 contradicts the breakout')],
        ['c', L('לא — בפריצה טובה הנפח אמור להיות נמוך', 'No — in a good breakout volume should be low')],
        ['d', L('כן — ולכן המחיר בטוח יעלה', 'Yes — so price is certain to rise')]
      ], 'a',
      L(`הממוצע עולה (${r2(QA.ma50[QA.breakIdx - 20]!)} ← ${r2(QA.ma50[QA.breakIdx]!)}), הנפח פי ${r1(volX(QA))}, ו־RSI גבוה יותר מבבדיקה הקודמת. קריאה עקבית — ועדיין קריאה: אחרי הפריצה המחיר נשאר מעל התקרה והגרף נגמר ב־${r2(last(QA))}. גם כשהכל מסכים, מחליטים מראש איפה טועים.`,
        `The average is rising (${r2(QA.ma50[QA.breakIdx - 20]!)} → ${r2(QA.ma50[QA.breakIdx]!)}), volume is ${r1(volX(QA))}×, and RSI is higher than at the previous test. A consistent reading — and still a reading: after the breakout price stayed above the ceiling and the chart ends at ${r2(last(QA))}. Even when everything agrees, you decide in advance where you are wrong.`)),
    q('t12-cancel', 6, 'beginner',
      L(`פריצה מטווח: סגירה ב־${r2(QP[QP.breakIdx]!.c)} מעל תקרה ב־${r2(QP.resist[0])}–${r2(QP.resist[1])}. איפה הרעיון הזה בבירור שגוי?`, `A range breakout: a close at ${r2(QP[QP.breakIdx]!.c)} above a ceiling at ${r2(QP.resist[0])}–${r2(QP.resist[1])}. Where is this idea clearly wrong?`),
      [
        ['a', L(`סגירה בחזרה מתחת לתקרה — מתחת ל־${r2(QP.resist[0])}`, `A close back below the ceiling — under ${r2(QP.resist[0])}`)],
        ['b', L(`כל ירידה מתחת ל־${r2(QP[QP.breakIdx]!.c)}, מחיר הפריצה`, `Any dip below ${r2(QP[QP.breakIdx]!.c)}, the breakout price`)],
        ['c', L('כש־RSI יעבור את 70', 'When RSI passes 70')],
        ['d', L('בשום מקום — פריצה בנפח גבוה לא נכשלת', 'Nowhere — a breakout on heavy volume cannot fail')]
      ], 'a',
      L(`הרעיון הוא "המחיר יצא מהטווח". ירידה קטנה מתחת למחיר הפריצה היא רעש רגיל — כאן הנמוך ביותר בימים שאחריה היה ${r2(low(QP, QP.breakIdx + 1))}. הרעיון שגוי רק כשהמחיר נסגר בחזרה בתוך הטווח, מתחת ל־${r2(QP.resist[0])} — וזה לא קרה.`,
        `The idea is "price left the range". A small dip below the breakout price is ordinary noise — here the lowest in the days after was ${r2(low(QP, QP.breakIdx + 1))}. The idea is wrong only when price closes back inside the range, below ${r2(QP.resist[0])} — and that did not happen.`)),
    q('t12-trend-momentum', 7, 'intermediate',
      L(`המחיר עושה שיאים גבוהים יותר (${qdHighs.map((s) => r2(s.price)).join(', ')}) מעל ממוצע 50 ימים שעולה, בזמן ש־RSI באותן פסגות יורד (${qdHighs.map((s) => r0(rsiAt(QD, s.idx))).join(', ')}). מה הקריאה הסבירה?`,
        `Price makes higher highs (${qdHighs.map((s) => r2(s.price)).join(', ')}) above a rising 50-day average, while RSI at those peaks falls (${qdHighs.map((s) => r0(rsiAt(QD, s.idx))).join(', ')}). What is the reasonable reading?`),
      [
        ['a', L(`המגמה שלמה אבל מאבדת כוח — עוקבים אחרי השפל האחרון (${r2(qdLastLow.price)}): שבירה שלו תהיה שינוי מבנה`, `The trend is intact but losing force — watch the last low (${r2(qdLastLow.price)}): breaking it would be a change in structure`)],
        ['b', L('למכור עכשיו: RSI יורד', 'Sell now: RSI is falling')],
        ['c', L('המגמה יורדת', 'The trend is down')],
        ['d', L('מומנטום לא משנה כשהמחיר מעל הממוצע', "Momentum doesn't matter while price is above the average")]
      ], 'a',
      L(`מגמה ומומנטום עונים על שאלות שונות: המגמה (שיאים גבוהים, ממוצע עולה) אומרת "למעלה"; RSI אומר "בפחות כוח". יחד: זהירות, לא היפוך. את ההכרעה ייתן המבנה — כאן, עד סוף הגרף המחיר לא ירד מתחת ל־${r2(qdLastLow.price)} (הנמוך ביותר: ${r2(low(QD, qdHighs[2]!.idx))}), כך שהמגמה נשארה שלמה.`,
        `Trend and momentum answer different questions: the trend (higher highs, a rising average) says "up"; RSI says "with less force". Together: caution, not a reversal. The structure will settle it — here, to the end of the chart price never fell below ${r2(qdLastLow.price)} (the lowest: ${r2(low(QD, qdHighs[2]!.idx))}), so the trend stayed intact.`))
  ]
};
