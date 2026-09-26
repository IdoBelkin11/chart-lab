// ---------------------------------------------------------------------------
// Technical Analysis, lesson 7 — momentum: RSI and MACD.
//
// Structure: the approved Artifact's outline for T7 (RSI in one line →
// overbought → MACD → work out the RSI → the maths, step by step) and its
// practice board (T7's question is a calculation). Decided with the user
// 2026-09-26: the Try step is "work out the RSI" (a shared "calculate"
// exercise); divergence belongs entirely to T8 — boards 08.2b–c drew it here,
// but the curriculum gives it its own lesson; MACD gets a reusable chart panel.
//
// Kept from the previous build's l6 text: the 0–100 range and 70/30, "neither
// is an automatic trade signal", the 50 line, the lag, and 80/20 in strong
// trends. Not kept here: divergence (T8).
//
// Builds on T6 (moving averages and their crossovers, the exponential kind) —
// MACD is described through them, not re-taught. Every indicator value in the
// prose is read from the chart it describes.
// ---------------------------------------------------------------------------
import type { Localized, QuizQuestion } from '@core/types/kb';
import type { LessonChartSpec } from '@core/charts/lessonCharts';
import * as series from '@core/charts/series.js';
import { getQuizQuestions } from '@core/quiz/questions.js';
import type { LessonContent } from './types';

const L = (he: string, en: string): Localized => ({ he, en });
const r0 = (x: number) => String(Math.round(x));
const r2 = (x: number) => x.toFixed(2);
const pct = (from: number, to: number) => Math.abs((to / from - 1) * 100).toFixed(0);
const q = (id: string, chart: number | undefined, difficulty: 'beginner' | 'intermediate', question: Localized, options: Array<[string, Localized]>, correctKey: string, explanation: Localized): QuizQuestion => ({
  id, lesson: 'T7', category: 'technical', difficulty, ...(chart !== undefined ? { chart } : {}), question, options: options.map(([key, text]) => ({ key, text })), correctKey, explanation
});

/** First index at or after `from` where test(value) holds. */
const firstWhere = (a: Array<number | null>, test: (v: number) => boolean, from = 0) => a.findIndex((v, i) => i >= from && v != null && test(v));
const countWhere = (a: Array<number | null>, test: (v: number) => boolean, from = 0) => a.filter((v, i) => i >= from && v != null && test(v)).length;
const extreme = (a: Array<number | null>, dir: 1 | -1) => a.reduce<number>((m, v, i) => (v != null && (a[m] == null || dir * v > dir * a[m]!) ? i : m), a.findIndex((v) => v != null));

const SW = series.T7_SWING, ST = series.T7_STRONG, MC = series.T7_MACD, AP = series.T7_APPLY;
const QR = series.T7_Q_RSI, QB = series.T7_Q_BELOW, QH = series.T7_Q_HIST;
const swMax = extreme(SW.rsi, 1), swMin = extreme(SW.rsi, -1);
const st70 = firstWhere(ST.rsi, (v) => v > 70), stAfter = ST.length - st70, stAbove = countWhere(ST.rsi, (v) => v > 70, st70);
const mcLow = MC.reduce((m, x, i) => (x.l < MC[m]!.l ? i : m), 0);
const mcZero = MC.macd.line.findIndex((v, i) => i > 0 && v != null && MC.macd.line[i - 1] != null && MC.macd.line[i - 1]! <= 0 && v > 0);
const mcSig = MC.macd.line.findIndex((v, i) => i > 0 && v != null && MC.macd.signal[i] != null && MC.macd.signal[i - 1] != null && MC.macd.line[i - 1]! - MC.macd.signal[i - 1]! <= 0 && v - MC.macd.signal[i]! > 0);
const ap30 = firstWhere(AP.rsi, (v) => v < 30), apAfter = AP.length - ap30, apBelow = countWhere(AP.rsi, (v) => v < 30, ap30);
const qrFrom = QR.length - 30;
/** "on 60 of the next 79 days" — or "on every one of the next 79 days" when that is the truth. */
const onDays = (k: number, n: number) => (k === n ? L(`בכל ${n} הימים שאחר כך`, `on every one of the next ${n} days`) : L(`ב־${k} מתוך ${n} הימים הבאים`, `on ${k} of the next ${n} days`));
const qbLast = QB.length - 1, qhLast = QH.length - 1;

/** The Try step's fourteen days: eight up days totalling 16.8, six down days totalling 11.2. */
export const T7_CALC_CHANGES = [2.4, -1.7, 1.8, 2.2, -2.1, 1.6, -1.6, 2.6, 1.9, -2.3, 2.3, -1.9, 2.0, -1.6];
const gains = T7_CALC_CHANGES.filter((x) => x > 0).reduce((s, x) => s + x, 0);
const losses = -T7_CALC_CHANGES.filter((x) => x < 0).reduce((s, x) => s + x, 0);
const upDays = T7_CALC_CHANGES.filter((x) => x > 0).length, downDays = T7_CALC_CHANGES.length - upDays;
const avgG = gains / 14, avgL = losses / 14, RS = avgG / avgL, RSI = 100 - 100 / (1 + RS);
const f1 = (x: number) => x.toFixed(1);
/** A formula inside Hebrew text, isolated as left-to-right so bidi cannot reorder its parts. */
const ltr = (x: string) => `\u2066${x}\u2069`;

const RSI_LABEL = L('RSI (14) בחלונית התחתונה; הרצועות: מעל 70 ומתחת ל־30', 'RSI (14) in the lower panel; the bands: above 70 and below 30');

const T7_CHARTS: LessonChartSpec[] = [
  {
    candles: SW,
    variant: 'price-rsi',
    options: {
      subMarks: [
        { idx: swMax, tone: 'bull', label: L(`RSI ${r0(SW.rsi[swMax]!)}`, `RSI ${r0(SW.rsi[swMax]!)}`) },
        { idx: swMin, tone: 'bear', place: 'below', label: L(`RSI ${r0(SW.rsi[swMin]!)}`, `RSI ${r0(SW.rsi[swMin]!)}`) }
      ]
    },
    label: L(`מחיר שעולה ואז יורד, ומתחתיו RSI: בזמן העלייה הוא מגיע עד ${r0(SW.rsi[swMax]!)}, ובזמן הירידה יורד עד ${r0(SW.rsi[swMin]!)}`,
      `Price rising then falling, with RSI beneath it: during the rise it reaches ${r0(SW.rsi[swMax]!)}, during the fall it drops to ${r0(SW.rsi[swMin]!)}`),
    caption: L('מחיר ומתחתיו RSI', 'Price, with RSI beneath it'),
    subcaption: RSI_LABEL,
    tone: 'neutral',
    height: 440
  },
  {
    candles: ST,
    variant: 'price-rsi',
    options: {
      subMarks: [{ idx: st70, tone: 'gold', label: L('RSI עובר את 70', 'RSI crosses 70') }],
      points: [{ idx: ST.length - 1, tone: 'bull', label: L(`${r2(ST[ST.length - 1]!.c)}`, `${r2(ST[ST.length - 1]!.c)}`) }]
    },
    label: L(`עלייה חזקה: RSI עובר את 70 כשהמחיר ב־${r2(ST[st70]!.c)}, נשאר מעליו ${onDays(stAbove, stAfter).he}, והמחיר ממשיך עד ${r2(ST[ST.length - 1]!.c)}`,
      `A strong rise: RSI crosses 70 with price at ${r2(ST[st70]!.c)}, stays above it ${onDays(stAbove, stAfter).en}, and price keeps going to ${r2(ST[ST.length - 1]!.c)}`),
    caption: L('"קניית יתר" שנמשכת', '"Overbought" that lasts'),
    subcaption: RSI_LABEL,
    tone: 'bull',
    height: 440
  },
  {
    candles: MC,
    variant: 'price-macd',
    options: {
      points: [{ idx: mcLow, tone: 'text', label: L('השפל', 'The low') }],
      subMarks: [
        { idx: mcSig, tone: 'gold', place: 'below', label: L('MACD חוצה את קו האות', 'MACD crosses its signal') },
        { idx: mcZero, tone: 'bull', label: L('MACD חוצה את האפס', 'MACD crosses zero') }
      ]
    },
    label: L(`מחיר שיורד ומתאושש, ומתחתיו MACD: קו ה־MACD (כחול) חוצה את קו האות (כתום) סמוך לשפל, ואת קו האפס ${mcZero - mcLow} ימים אחריו`,
      `Price falling and recovering, with MACD beneath it: the MACD line (blue) crosses the signal line (orange) near the low, and the zero line ${mcZero - mcLow} days after it`),
    caption: L('מחיר ומתחתיו MACD', 'Price, with MACD beneath it'),
    subcaption: L('כחול: קו ה־MACD · כתום: קו האות · עמודות: ההפרש ביניהם.', 'Blue: the MACD line · orange: the signal line · bars: the gap between them.'),
    tone: 'neutral',
    height: 440
  },
  {
    candles: AP,
    variant: 'price-rsi',
    options: { subMarks: [{ idx: ap30, tone: 'gold', place: 'below', label: L('RSI יורד מתחת ל־30', 'RSI falls below 30') }] },
    label: L('מחיר בירידה, ומתחתיו RSI שיורד מתחת ל־30 ונשאר שם זמן רב', 'Price falling, with RSI beneath it dropping below 30 and staying there a long time'),
    caption: L('גרף חדש', 'A new chart'),
    tone: 'neutral',
    height: 280
  },
  { candles: QR, variant: 'price-rsi', options: {}, label: L('מחיר ומתחתיו RSI, שבחודש האחרון נשאר מעל 50', 'Price with RSI beneath it, staying above 50 over the last month'), caption: RSI_LABEL, tone: 'neutral', height: 320 },
  { candles: QB, variant: 'price-macd', options: {}, label: L('מחיר ומתחתיו MACD, שבסוף הגרף נמצא מתחת לאפס', 'Price with MACD beneath it, below zero at the end of the chart'), caption: L('מחיר ומתחתיו MACD', 'Price, with MACD beneath it'), tone: 'neutral', height: 320 },
  { candles: QH, variant: 'price-macd', options: {}, label: L('מחיר ומתחתיו MACD: בסוף הגרף קו ה־MACD מעל האפס, והעמודות מתחת לאפס', 'Price with MACD beneath it: at the end the MACD line is above zero, and the bars below zero'), caption: L('מחיר ומתחתיו MACD', 'Price, with MACD beneath it'), tone: 'neutral', height: 320 }
];
// Chart indexes: 0 RSI up and down · 1 overbought that lasts · 2 MACD · 3 apply · 4–6 questions.

export const T7: LessonContent = {
  id: 'T7',
  tutor: { topic: 'rsi', label: L('מומנטום: RSI ו־MACD', 'momentum: RSI and MACD') },
  teach: [
    {
      heading: L('מומנטום: כמה חזק המהלך', 'Momentum: how strong is the move'),
      paragraphs: [
        L('מגמה אומרת לאן המחיר הולך; מומנטום אומר באיזה כוח. שתי מניות יכולות לעלות באותו כיוון — אחת בצעדים גדולים ורצופים, השנייה בקושי ועם הרבה נסיגות. מדדי מומנטום נותנים לכוח הזה מספר.',
          'A trend says where price is going; momentum says with how much force. Two stocks can rise in the same direction — one in big, steady strides, the other barely, with plenty of pullbacks. Momentum indicators put a number on that force.'),
        L('RSI נע בין 0 ל־100 בהתאם לגודל הרווחים לעומת ההפסדים האחרונים. החישוב: לוקחים את 14 הימים האחרונים, מחשבים את ממוצע העליות ואת ממוצע הירידות — שניהם מחולקים ב־14, כי יום בלי עלייה נספר כעלייה של אפס — ומחלקים את הראשון בשני. היחס הזה נקרא RS, והנוסחה: ' + ltr('RSI = 100 − 100 ÷ (1 + RS)') + '.',
          'RSI moves between 0 and 100 based on the size of recent gains versus recent losses. The recipe: take the last 14 days, work out the average gain and the average loss — both divided by 14, since a day without a gain counts as a gain of zero — and divide the first by the second. That ratio is called RS, and RSI = 100 − 100 ÷ (1 + RS).'),
        L(`כשהעליות גדולות מהירידות, RS גדול מ־1 ו־RSI מעל 50; כשהירידות גוברות — הוא מתחת ל־50. בגרף, בזמן העלייה RSI הגיע עד כ־${r0(SW.rsi[swMax]!)}, ובזמן הירידה צנח עד כ־${r0(SW.rsi[swMin]!)}.`,
          `When gains outweigh losses, RS is above 1 and RSI above 50; when losses dominate, it is below 50. On the chart RSI reached about ${r0(SW.rsi[swMax]!)} during the rise and sank to about ${r0(SW.rsi[swMin]!)} during the fall.`)
      ],
      callouts: [{ kind: 'example', lead: L('מה רואים ומה מסיקים', 'What you see, what you conclude'), text: L(
        'RSI של 65 הוא תצפית: בשבועיים האחרונים העליות היו גדולות מהירידות. "הקונים חזקים, אז המחיר ימשיך לעלות" — זו כבר פרשנות, ו־RSI לא אומר אותה.',
        'An RSI of 65 is an observation: over the last two weeks gains were bigger than losses. "Buyers are strong, so price will keep rising" is already an interpretation — and RSI does not say it.') }],
      work: { kind: 'charts', charts: [0] }
    },
    {
      heading: L('מעל 70 זה לא "חייב לרדת"', 'Above 70 is not "must fall"'),
      paragraphs: [
        L('מעל 70 נקרא בדרך כלל "קניית יתר", מתחת ל־30 "מכירת יתר" — אך אף אחד מהם אינו איתות מסחר אוטומטי. קניית יתר אומרת רק שבתקופה האחרונה העליות היו גדולות בהרבה מהירידות — המהלך "מתוח". היא לא אומרת שהוא נגמר.',
          'Above 70 is generally called "overbought," below 30 "oversold" — but neither is an automatic trade signal. Overbought only says that recently gains have been much bigger than losses — the move is "stretched". It does not say the move is over.'),
        L(`בגרף, RSI עבר את 70 כשהמחיר היה ${r2(ST[st70]!.c)}. מאז הוא נשאר מעל 70 ${onDays(stAbove, stAfter).he} — והמחיר המשיך לטפס עד ${r2(ST[ST.length - 1]!.c)}, עוד כ־${pct(ST[st70]!.c, ST[ST.length - 1]!.c)}%. מי שהתייחס ל"קניית היתר" הראשונה כסימן למכור, פספס את רוב העלייה.`,
          `On the chart RSI crossed 70 with price at ${r2(ST[st70]!.c)}. It then stayed above 70 ${onDays(stAbove, stAfter).en} — and price kept climbing to ${r2(ST[ST.length - 1]!.c)}, about ${pct(ST[st70]!.c, ST[ST.length - 1]!.c)}% more. Anyone who treated the first "overbought" reading as a reason to sell missed most of the rise.`),
        L('עוד שני דברים ששווה לדעת: ראשית, 50 משמש כקו מפריד לא רשמי — RSI שנמצא באופן עקבי מעל 50 נוטה לתאר מגמת עלייה, ומתחת ל־50 מגמת ירידה. שנית, RSI הוא מדד מפגר, מחושב ממחיר שכבר קרה, כך שעד שהוא מציג איתות, חלק מהתנועה כבר בדרך כלל מאחוריו. חלק מהסוחרים מזיזים את הרמות הקלאסיות 70/30 ל־80/20 בזמן מגמות חזקות, בדיוק כי 70/30 מפעיל איתות מוקדם מדי ותכוף מדי בשוק חד־כיווני.',
          'Two more things worth knowing: first, 50 acts as an informal dividing line — RSI consistently above 50 tends to describe an uptrend, consistently below 50 a downtrend. Second, RSI is a lagging measure, calculated from price that already happened, so by the time it flags something, part of the move is usually already behind it. Some traders shift the classic 70/30 thresholds to 80/20 during strong trends, precisely because 70/30 triggers too early and too often in a one-directional market.')
      ],
      callouts: [{ kind: 'caveat', lead: L('שימו לב', 'Watch out'), text: L(
        '"מתוח" זה לא "חייב לרדת". מניה יכולה להישאר מעל 70 שבועות.',
        '"Stretched" is not "must fall". A stock can stay above 70 for weeks.') }],
      work: { kind: 'charts', charts: [1] }
    },
    {
      heading: L('MACD: המרחק בין שני ממוצעים', 'MACD: the gap between two averages'),
      paragraphs: [
        L('MACD בנוי משני ממוצעים נעים אקספוננציאליים — הסוג המהיר שהוזכר בשיעור הקודם — של 12 ו־26 יום. קו ה־MACD הוא ההפרש ביניהם: הממוצע של 12 פחות הממוצע של 26. כשהוא מעל אפס, הממוצע המהיר מעל האיטי; כשהוא מתחת לאפס — מתחתיו. וככל שהמרחק ביניהם גדל, המהלך האחרון מהיר יותר.',
          'MACD is built from two exponential moving averages — the faster kind mentioned in the last lesson — of 12 and 26 days. The MACD line is the gap between them: the 12-day minus the 26-day. Above zero, the fast average is above the slow one; below zero, beneath it. And the wider the gap, the faster the recent move.'),
        L('בחלונית יש עוד שני דברים. קו האות (Signal) הוא ממוצע של 9 ימים של קו ה־MACD עצמו. העמודות — ההיסטוגרמה — מראות את המרחק בין קו ה־MACD לקו האות: עמודות שגדלות אומרות שהתנופה מתחזקת, עמודות שמתכווצות — שהיא נרגעת. ובניגוד ל־RSI, ל־MACD אין תקרה של 100: הערכים שלו ביחידות של מחיר, ולכן משווים אותם רק לאותה מניה.',
          'The panel shows two more things. The signal line is a 9-day average of the MACD line itself. The bars — the histogram — show the gap between the MACD line and the signal line: growing bars say the push is strengthening, shrinking bars that it is easing. And unlike RSI, MACD has no ceiling of 100: its values are in price units, so you only compare them within the same stock.'),
        L(`בגרף, קו ה־MACD חצה את קו האות סמוך לשפל של המחיר, ואת קו האפס רק ${mcZero - mcLow} ימים אחר כך. חציית האפס היא בעצם הרגע שבו הממוצע של 12 עבר את זה של 26 — ולכן היא מאחרת, בדיוק כמו החציות מהשיעור הקודם. חציית קו האות מגיבה מהר יותר, אבל גם מתהפכת לעיתים קרובות יותר.`,
          `On the chart the MACD line crossed its signal line near the price low, and crossed zero only ${mcZero - mcLow} days later. The zero crossing is really the moment the 12-day average passed the 26-day — which is why it lags, just like the crossovers in the last lesson. The signal-line crossing reacts sooner, but it also flips back more often.`)
      ],
      callouts: [{ kind: 'caveat', lead: L('שימו לב', 'Watch out'), text: L(
        'כמו RSI, גם MACD מחושב ממחיר שכבר היה. חצייה של קו האות מתארת שינוי בתנופה — היא לא הבטחה לכיוון, וכאן היא נפלה ליד השפל, אבל לא תמיד.',
        'Like RSI, MACD is calculated from price that already happened. A signal-line crossing describes a change in push — it is not a promise of direction; here it landed near the low, but not always.') }],
      work: { kind: 'charts', charts: [2] }
    }
  ],
  charts: T7_CHARTS,
  activity: {
    kind: 'calculate',
    prompt: L('חשבו את ה־RSI', 'Work out the RSI'),
    task: L(`ב־14 הימים האחרונים המניה עלתה ב־${upDays} ימים, בסך הכול ${f1(gains)}, וירדה ב־${downDays} ימים, בסך הכול ${f1(losses)}. מה ה־RSI? עגלו למספר שלם.`,
      `Over the last 14 days the stock rose on ${upDays} days, by ${f1(gains)} in total, and fell on ${downDays} days, by ${f1(losses)} in total. What is the RSI? Round to a whole number.`),
    diagram: {
      type: 'bars',
      title: L('14 הימים האחרונים', 'The last 14 days'),
      bars: [
        { label: L(`סך העליות · ${upDays} ימים`, `Total gains · ${upDays} days`), value: gains, tone: 'ok', shown: L(f1(gains), f1(gains)) },
        { label: L(`סך הירידות · ${downDays} ימים`, `Total losses · ${downDays} days`), value: losses, tone: 'err', shown: L(f1(losses), f1(losses)) }
      ],
      caption: L(`${ltr('RSI (14) = 100 − 100 ÷ (1 + RS)')}, כש־RS = ממוצע העליות ÷ ממוצע הירידות.`, 'RSI (14) = 100 − 100 ÷ (1 + RS), where RS = average gain ÷ average loss.')
    },
    answer: Math.round(RSI),
    tolerance: 1,
    field: L('ה־RSI שלכם', 'Your RSI'),
    mistakes: [
      { value: 100 - 100 / (1 + avgL / avgG), tolerance: 1, why: L('זה יצא הפוך: חילקתם את ממוצע הירידות בממוצע העליות. RS הוא עליות חלקי ירידות.', 'That came out the wrong way round: you divided the average loss by the average gain. RS is gains over losses.') },
      { value: RS, tolerance: 0.2, why: L(`זה ה־RS (${f1(RS)}) — עוד צעד אחד: ${ltr('RSI = 100 − 100 ÷ (1 + RS)')}.`, `That is the RS (${f1(RS)}) — one more step: RSI = 100 − 100 ÷ (1 + RS).`) },
      { value: 100 - 100 / (1 + (gains / upDays) / (losses / downDays)), tolerance: 1, why: L(`חילקתם את העליות ב־${upDays} ואת הירידות ב־${downDays}. ב־RSI שני הממוצעים מחולקים ב־14 — יום בלי עלייה נספר כאפס.`, `You divided the gains by ${upDays} and the losses by ${downDays}. In RSI both averages are divided by 14 — a day without a gain counts as zero.`) }
    ],
    steps: [
      L(`ממוצע העליות: ${ltr(`${f1(gains)} ÷ 14 = ${f1(avgG)}`)}`, `Average gain: ${f1(gains)} ÷ 14 = ${f1(avgG)}`),
      L(`ממוצע הירידות: ${ltr(`${f1(losses)} ÷ 14 = ${f1(avgL)}`)}`, `Average loss: ${f1(losses)} ÷ 14 = ${f1(avgL)}`),
      L(ltr(`RS = ${f1(avgG)} ÷ ${f1(avgL)} = ${f1(RS)}`), `RS = ${f1(avgG)} ÷ ${f1(avgL)} = ${f1(RS)}`),
      L(ltr(`RSI = 100 − 100 ÷ (1 + ${f1(RS)}) = 100 − ${r0(100 / (1 + RS))} = ${r0(RSI)}`), `RSI = 100 − 100 ÷ (1 + ${f1(RS)}) = 100 − ${r0(100 / (1 + RS))} = ${r0(RSI)}`)
    ],
    right: L(`RSI של ${r0(RSI)}: העליות היו גדולות מהירידות, בפער מתון.`, `An RSI of ${r0(RSI)}: gains outweighed losses, by a moderate margin.`),
    off: L('עוד לא. בדקו את הסדר: ממוצע עליות וממוצע ירידות (שניהם ÷ 14), אחר כך RS, ורק בסוף הנוסחה של RSI.', 'Not yet. Check the order: the average gain and average loss (both ÷ 14), then RS, and only then the RSI formula.'),
    explain: [
      L(`זה מה שהמספר אומר: בשבועיים האחרונים הקונים היו חזקים יותר מהמוכרים, אבל הרחק מ"קניית יתר". מה שהוא לא אומר: מה יקרה מחר. ${r0(RSI)} היום יכול להפוך ל־45 או ל־75 בתוך שבוע.`,
        `That is what the number says: over the last two weeks buyers were stronger than sellers, but far from "overbought". What it does not say is what happens tomorrow. ${r0(RSI)} today can become 45 or 75 within a week.`)
    ]
  },
  apply: {
    id: 't7-apply', lesson: 'T7', category: 'technical', chart: 3,
    question: L(`בגרף החדש RSI ירד מתחת ל־30 כשהמחיר היה ${r2(AP[ap30]!.c)}, ונשאר מתחת ל־30 ${onDays(apBelow, apAfter).he}, בזמן שהמחיר המשיך לרדת עד ${r2(AP[AP.length - 1]!.c)}. איך לקרוא את זה?`,
      `In the new chart RSI fell below 30 with price at ${r2(AP[ap30]!.c)}, and stayed below 30 ${onDays(apBelow, apAfter).en} while price kept falling to ${r2(AP[AP.length - 1]!.c)}. How do you read that?`),
    options: [
      { key: 'a', text: L('איתות קנייה: "מכירת יתר" חייבת להתהפך', 'A buy signal: "oversold" has to turn around') },
      { key: 'b', text: L('התנופה כלפי מטה חזקה; "מכירת יתר" מתארת את התקופה האחרונה ויכולה להימשך — היא לא סיבה לקנות בפני עצמה', 'Downward momentum is strong; "oversold" describes the recent period and can last — it is not a reason to buy on its own') },
      { key: 'c', text: L('ה־RSI חושב לא נכון', 'The RSI was calculated wrongly') },
      { key: 'd', text: L('המחיר נעצר כש־RSI מגיע ל־30', 'Price stops when RSI reaches 30') }
    ],
    correctKey: 'b',
    explanation: L(`זו תמונת המראה של "קניית היתר" שנמשכה: מאז שעבר את 30, המחיר ירד עוד כ־${pct(AP[ap30]!.c, AP[AP.length - 1]!.c)}%. RSI נמוך אומר שהירידות גברו על העליות — בדיוק מה שקרה. הוא לא אומר מתי זה ייגמר.`,
      `This is the mirror image of the "overbought" that lasted: after RSI crossed 30, price fell about ${pct(AP[ap30]!.c, AP[AP.length - 1]!.c)}% further. A low RSI says losses outweighed gains — which is exactly what happened. It does not say when that will end.`)
  },
  takeaway: {
    bottomLine: L('מומנטום הוא עוצמת התנועה. RSI משווה את העליות לירידות ב־14 הימים האחרונים (0–100), ו־MACD מודד את המרחק בין ממוצע של 12 יום לממוצע של 26 יום, ואת השינוי בו.',
      'Momentum is the strength of a move. RSI compares gains with losses over the last 14 days (0–100), and MACD measures the gap between a 12-day and a 26-day average, and how it changes.'),
    caveat: L('שניהם מתארים מה שכבר קרה: RSI יכול להישאר מעל 70 או מתחת ל־30 שבועות, וחציית קו האות היא לא הבטחה. קוראים אותם יחד עם השיאים והשפלים של המחיר.',
      'Both describe what has already happened: RSI can stay above 70 or below 30 for weeks, and a signal-line crossing is no promise. Read them together with price\'s own highs and lows.')
  },
  questions: [
    q('t7-rsi50', 4, 'beginner',
      L('בחודש האחרון RSI נשאר כל הזמן מעל 50. מה זה מתאר?', 'Over the last month RSI stayed above 50 the whole time. What does that describe?'),
      [
        ['a', L('שבכל חלון של 14 יום, העליות היו גדולות מהירידות — תנופה כלפי מעלה עד עכשיו', 'That in every 14-day window gains outweighed losses — upward momentum so far')],
        ['b', L('שהמניה בקניית יתר ותרד', 'That the stock is overbought and will fall')],
        ['c', L('שהמחיר נמצא בדיוק ב־50', 'That price is exactly 50')],
        ['d', L('שהנפח עלה', 'That volume rose')]
      ], 'a',
      L(`RSI מעל 50 פירושו RS גדול מ־1: ממוצע העליות גבוה מממוצע הירידות. ב־30 הימים האחרונים הוא היה מעל 50 בכל ${countWhere(QR.rsi, (v) => v > 50, qrFrom)} הימים — תיאור עקבי של תנופה כלפי מעלה, בלי הבטחה לגבי ההמשך.`,
        `An RSI above 50 means RS above 1: the average gain exceeds the average loss. Over the last 30 days it was above 50 on all ${countWhere(QR.rsi, (v) => v > 50, qrFrom)} days — a consistent description of upward momentum, with no promise about what comes next.`)),
    q('t7-macdbelow', 5, 'beginner',
      L('בסוף הגרף קו ה־MACD נמצא מתחת לאפס. מה זה אומר?', 'At the end of the chart the MACD line is below zero. What does that mean?'),
      [
        ['a', L('שהמחיר שלילי', 'That the price is negative')],
        ['b', L('שהממוצע של 12 הימים מתחת לממוצע של 26 הימים — המחירים האחרונים חלשים מהממוצע הארוך יותר', 'That the 12-day average is below the 26-day — recent prices are weaker than the longer average')],
        ['c', L('שהמחיר בטוח יעלה', 'That price is sure to rise')],
        ['d', L('שהמסחר נעצר', 'That trading stopped')]
      ], 'b',
      L(`קו ה־MACD הוא הממוצע של 12 פחות הממוצע של 26. בסוף הגרף הוא עומד על ${r2(QB.macd.line[qbLast]!)}: הממוצע המהיר מתחת לאיטי. זה מתאר את השבועות האחרונים — לא את הבאים.`,
        `The MACD line is the 12-day average minus the 26-day. At the end of the chart it stands at ${r2(QB.macd.line[qbLast]!)}: the fast average below the slow one. That describes the last few weeks — not the next ones.`)),
    q('t7-hist', 6, 'intermediate',
      L('בימים האחרונים קו ה־MACD מעל האפס, אבל העמודות של ההיסטוגרמה מתחת לאפס. מה המצב?', 'In the last days the MACD line is above zero, but the histogram bars are below zero. What is going on?'),
      [
        ['a', L('הממוצע של 12 עדיין מעל זה של 26, אבל קו ה־MACD ירד מתחת לקו האות: התנופה כלפי מעלה נחלשה לאחרונה', 'The 12-day average is still above the 26-day, but the MACD line has dropped below its signal line: upward push has eased lately')],
        ['b', L('איתות מכירה ודאי', 'A certain sell signal')],
        ['c', L('המחיר נמצא מתחת לאפס', 'Price is below zero')],
        ['d', L('אין קשר בין הקווים לעמודות', 'The lines and the bars are unrelated')]
      ], 'a',
      L(`בנר האחרון קו ה־MACD ב־${r2(QH.macd.line[qhLast]!)} (מעל אפס) וקו האות ב־${r2(QH.macd.signal[qhLast]!)}, כך שהעמודה — ההפרש ביניהם — שלילית: ${r2(QH.macd.hist[qhLast]!)}. המהלך עדיין עולה בממוצע, אבל פחות בכוח מבימים הקודמים. זו תצפית על התנופה, לא הוראה.`,
        `On the last candle the MACD line is at ${r2(QH.macd.line[qhLast]!)} (above zero) and the signal line at ${r2(QH.macd.signal[qhLast]!)}, so the bar — the gap between them — is negative: ${r2(QH.macd.hist[qhLast]!)}. The move is still up on average, but with less force than in the days before. That is an observation about momentum, not an instruction.`)),
    q('t7-calc', undefined, 'intermediate',
      L('ב־14 הימים האחרונים ממוצע העליות היה 0.8 וממוצע הירידות 1.2. מה ה־RSI?', 'Over the last 14 days the average gain was 0.8 and the average loss 1.2. What is the RSI?'),
      [
        ['a', L('40', '40')],
        ['b', L('60', '60')],
        ['c', L('67', '67')],
        ['d', L('150', '150')]
      ], 'a',
      L(`${ltr('RS = 0.8 ÷ 1.2 ≈ 0.67')}, ולכן ${ltr('RSI = 100 − 100 ÷ 1.67 = 100 − 60 = 40')}. התשובה 60 מתקבלת כשמחלקים הפוך — ירידות חלקי עליות. RSI מתחת ל־50 אומר שהירידות גברו.`,
        'RS = 0.8 ÷ 1.2 ≈ 0.67, so RSI = 100 − 100 ÷ 1.67 = 100 − 60 = 40. The answer 60 comes from dividing the wrong way round — losses over gains. An RSI below 50 says losses outweighed gains.')),
    // The previous build's l6 questions, except divergence — that is T8's lesson now.
    ...(getQuizQuestions({}) as QuizQuestion[]).filter((x) => x.lesson === 'l6' && x.id !== 'q-rsi-3')
  ]
};
