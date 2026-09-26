// ---------------------------------------------------------------------------
// Technical Analysis, lesson 6 — moving averages.
//
// Structure: the approved Artifact (boards 08.1a–c): a 20-day and a 50-day
// average, short vs long, the crossover, "click where it crossed", and why the
// signal lags. Decided with the user 2026-09-26:
//   - the 20/50 event is a "crossover"; "golden cross" is named as its best-known
//     version, the 50-day over the 200-day — the same wording as the tutor's KB;
//   - simple averages throughout, with one paragraph on the exponential kind
//     (the ground T7's MACD stands on);
//   - the previous build's authored text is kept where it teaches: the 20 as
//     "about a month", the 150 and Minervini's trend template, the warm-up of
//     a long average, and averages losing meaning with no trend (the Apply).
//
// Builds on: T1 (percent moves, timeframes), T3 (a trend is its highs and lows
// — an average summarises it, it does not define it), T4/T5 only by reference.
// Leaves to T7: momentum, RSI, MACD.
// ---------------------------------------------------------------------------
import type { Localized, QuizQuestion } from '@core/types/kb';
import type { LessonChartSpec } from '@core/charts/lessonCharts';
import * as series from '@core/charts/series.js';
import { getQuizQuestions } from '@core/quiz/questions.js';
import type { LessonContent } from './types';

const L = (he: string, en: string): Localized => ({ he, en });
const r1 = (x: number) => x.toFixed(1);
const r2 = (x: number) => x.toFixed(2);
const pct = (from: number, to: number) => ((to / from - 1) * 100).toFixed(0);
const q = (id: string, chart: number, difficulty: 'beginner' | 'intermediate', question: Localized, options: Array<[string, Localized]>, correctKey: string, explanation: Localized): QuizQuestion => ({
  id, lesson: 'T6', category: 'technical', difficulty, chart, question, options: options.map(([key, text]) => ({ key, text })), correctKey, explanation
});
type WithAverages = typeof series.T6_TEACH;
const lowIdx = (c: WithAverages, from = 0, to = c.length) => c.reduce((m, x, i) => (i >= from && i < to && x.l < c[m]!.l ? i : m), from);
/** The index where an average bottoms (turns up). */
const turnIdx = (a: Array<number | null>) => a.reduce<number>((m, v, i) => (v != null && (a[m] == null || v < a[m]!) ? i : m), a.findIndex((v) => v != null));
const lines = (c: WithAverages, both = true) => [{ tone: 'gold', values: c.ma20 }, ...(both ? [{ tone: 'sma50', values: c.ma50 }] : [])];
const LEGEND = L('ממוצע 20 (זהוב) · ממוצע 50 (כחול)', '20-day average (gold) · 50-day (blue)');

const T = series.T6_TEACH, TRY = series.T6_TRY, CHOP = series.T6_CHOP;
const tLow = lowIdx(T), tCross = T.crosses[0]!.idx;
const tTurn20 = turnIdx(T.ma20), tTurn50 = turnIdx(T.ma50);
const yLow = lowIdx(TRY), yCross = TRY.crosses[0]!.idx;
const chopFrom = CHOP.crosses[0]!.idx, chopTo = CHOP.crosses[CHOP.crosses.length - 1]!.idx;
const chopCloses = CHOP.slice(49).map((c) => c.c);
const QA = series.T6_Q_ABOVE, QD = series.T6_Q_DOWN, QL = series.T6_Q_LAG;
const qaLast = QA.length - 1, qdCross = QD.crosses[0]!.idx, qlLow = lowIdx(QL), qlCross = QL.crosses[0]!.idx;

const T6_CHARTS: LessonChartSpec[] = [
  {
    candles: T,
    variant: 'price',
    options: { showVolume: false, extraLines: lines(T, false) },
    label: L('גרף נרות עם קו זהוב חלק — הממוצע של 20 הימים האחרונים — שמתחיל רק בנר ה־20', 'A candlestick chart with a smooth gold line — the average of the last 20 days — that starts only at the 20th candle'),
    caption: L('המחיר וממוצע 20 הימים', 'Price and its 20-day average'),
    subcaption: L('נתוני הדגמה. הקו מתחיל רק כשיש 20 ימים לחשב מהם.', 'Demo data. The line starts only once there are 20 days to average.'),
    tone: 'neutral',
    height: 400
  },
  {
    candles: T,
    variant: 'price',
    options: {
      showVolume: false,
      extraLines: lines(T),
      dots: [
        { idx: tTurn20, price: T.ma20[tTurn20]!, tone: 'gold', labelDy: 22, label: L('ה־20 מתחיל לעלות', 'The 20 turns up') },
        { idx: tTurn50, price: T.ma50[tTurn50]!, tone: 'sma50', labelDy: 22, labelAlign: 'left', label: L('ה־50 מתחיל לעלות', 'The 50 turns up') }
      ]
    },
    label: L(`אותו גרף עם שני ממוצעים: הזהוב (20) מתחיל לעלות ${tTurn20 - tLow} ימים אחרי השפל, הכחול (50) — ${tTurn50 - tLow} ימים אחריו`,
      `The same chart with two averages: the gold one (20) turns up ${tTurn20 - tLow} days after the low, the blue one (50) ${tTurn50 - tLow} days after it`),
    caption: LEGEND,
    subcaption: L('הקצר מגיב מהר; הארוך מסנן יותר ומאחר יותר.', 'The short one reacts fast; the long one filters more and turns later.'),
    tone: 'neutral',
    height: 400
  },
  {
    candles: T,
    variant: 'price',
    options: { showVolume: false, extraLines: lines(T), points: [{ idx: tCross, tone: 'bull', align: 'center', place: 'below', label: L('חציית ממוצעים', 'Crossover') }] },
    label: L(`אותו גרף: בנר ה־${tCross + 1} הממוצע הזהוב (20) עובר מעל הכחול (50)`, `The same chart: at candle ${tCross + 1} the gold average (20) moves above the blue one (50)`),
    caption: LEGEND,
    subcaption: L('הקצר עובר מעל הארוך.', 'The short average moves above the long one.'),
    tone: 'bull',
    height: 400
  },
  {
    candles: TRY,
    variant: 'price',
    options: { showVolume: false, extraLines: lines(TRY) },
    label: L('גרף נרות של מניה אחרת עם ממוצע 20 (זהוב) וממוצע 50 (כחול)', 'A candlestick chart of another stock with a 20-day (gold) and a 50-day (blue) average'),
    caption: LEGEND,
    tone: 'neutral',
    height: 420
  },
  {
    candles: CHOP,
    variant: 'price',
    options: { showVolume: false, extraLines: lines(CHOP) },
    label: L('גרף של מניה שנעה הצידה, עם ממוצע 20 וממוצע 50 שנחתכים זה בזה כמה פעמים', 'A chart of a stock moving sideways, with a 20-day and a 50-day average that cut through each other several times'),
    caption: L('גרף חדש', 'A new chart'),
    tone: 'neutral',
    height: 260
  },
  {
    candles: QA,
    variant: 'price',
    options: { showVolume: false, extraLines: lines(QA) },
    label: L('גרף שבסופו המחיר מעל הממוצע הזהוב (20), והזהוב מעל הכחול (50)', 'A chart that ends with price above the gold average (20), and the gold above the blue (50)'),
    caption: LEGEND,
    tone: 'neutral',
    height: 300
  },
  {
    candles: QD,
    variant: 'price',
    options: { showVolume: false, extraLines: lines(QD), highlights: [{ i1: qdCross, tone: 'gold', label: L('הנקודה המסומנת', 'The marked point') }] },
    label: L('גרף עם ממוצע 20 וממוצע 50, ונקודה מסומנת שבה הקווים נפגשים', 'A chart with a 20-day and a 50-day average, and a marked point where the lines meet'),
    caption: LEGEND,
    tone: 'neutral',
    height: 300
  },
  {
    candles: QL,
    variant: 'price',
    options: {
      showVolume: false,
      extraLines: lines(QL),
      dots: [{ idx: qlLow, price: QL[qlLow]!.l, tone: 'text', labelDy: 20, label: L(`השפל · ${r2(QL[qlLow]!.l)}`, `The low · ${r2(QL[qlLow]!.l)}`) }],
      points: [{ idx: qlCross, tone: 'bull', align: 'center', label: L(`החצייה · ${r2(QL[qlCross]!.c)}`, `The crossover · ${r2(QL[qlCross]!.c)}`) }]
    },
    label: L(`גרף עם שפל ב־${r2(QL[qlLow]!.l)} וחציית ממוצעים כלפי מעלה כשהמחיר נסגר ב־${r2(QL[qlCross]!.c)}`, `A chart with a low at ${r2(QL[qlLow]!.l)} and an upward crossover as price closes at ${r2(QL[qlCross]!.c)}`),
    caption: LEGEND,
    tone: 'neutral',
    height: 300
  }
];
// Chart indexes: 0 one average · 1 short vs long · 2 the crossover · 3 the Try chart · 4 apply · 5–7 questions.

export const T6: LessonContent = {
  id: 'T6',
  tutor: { topic: 'moving-averages', label: L('ממוצעים נעים', 'moving averages') },
  teach: [
    {
      heading: L('ממוצע נע מחליק את הרעש', 'A moving average smooths out the noise'),
      paragraphs: [
        L('ממוצע נע הוא מחיר הסגירה הממוצע לאורך מספר קבוע של מפגשים קודמים, המחושב מחדש בכל יום. ממוצע של 20 יום מחבר את 20 הסגירות האחרונות ומחלק ב־20; מחר הסגירה החדשה נכנסת לחישוב והוותיקה ביותר יוצאת — ולכן הוא "נע".',
          'A moving average is the average closing price over a fixed number of past sessions, recalculated every day. A 20-day average adds up the last 20 closes and divides by 20; tomorrow the new close joins the calculation and the oldest one drops out — which is why it "moves".'),
        L('כל נקודה על הקו היא ממוצע של 20 הימים שלפניה, ולכן הקו זז לאט יותר מהמחיר: יום חריג אחד משנה אותו רק בחלק העשרים. זה בדיוק מה שהוא טוב בו — הוא מראה כיוון, לא רעש. שימו לב גם שהקו מתחיל רק בנר ה־20: אי אפשר לחשב ממוצע של 20 יום לפני שיש 20 ימים. לכל ממוצע יש "תקופת חימום" באורך שלו — לממוצע של 150 יום, 150 ימים.',
          'Every point on the line is the average of the 20 days before it, so the line moves more slowly than price: one unusual day changes it by only a twentieth. That is exactly what it is good for — it shows direction, not noise. Notice too that the line starts only at the 20th candle: you cannot average 20 days before there are 20 days. Every average has a "warm-up" as long as itself — 150 days for a 150-day average.'),
        L('יש גם ממוצע נע אקספוננציאלי (EMA), שנותן לימים האחרונים משקל גדול יותר מלימים ותיקים, ולכן מגיב מהר יותר מממוצע פשוט באותו אורך. בשיעור הזה נשתמש בממוצע הפשוט; בשיעור הבא, על מומנטום, תפגשו כלי שבנוי מממוצעים אקספוננציאליים.',
          'There is also an exponential moving average (EMA), which gives recent days more weight than older ones, so it reacts faster than a simple average of the same length. This lesson uses the simple kind; in the next lesson, on momentum, you will meet a tool built from exponential averages.')
      ],
      callouts: [{ kind: 'example', lead: L('ממוצע של 5 ימים, צעד אחד', 'A 5-day average, one step'), text: L(
        'סגירות של 10, 11, 12, 13 ו־14 — סכום 60, ממוצע 12. למחרת המניה נסגרת ב־15: ה־10 יוצא, ה־15 נכנס, הסכום 65 והממוצע עולה ל־13.',
        'Closes of 10, 11, 12, 13 and 14 — a sum of 60, an average of 12. The next day the stock closes at 15: the 10 drops out, the 15 comes in, the sum is 65 and the average rises to 13.') }],
      work: { kind: 'charts', charts: [0] }
    },
    {
      heading: L('ממוצע קצר וממוצע ארוך', 'A short average and a long one'),
      paragraphs: [
        L('ממוצעים קצרים מגיבים מהר יותר; ממוצעים ארוכים מתארים את התמונה הרחבה יותר. ממוצע של 20 יום מכסה בערך חודש של מסחר — קצר מספיק כדי לעקוב אחרי התנודה הנוכחית, ולכן סוחרים לטווח קצר מסתכלים על ירידות לכיוונו במקום על שבירה מתחתיו. ממוצע של 50 יום מכסה בערך שני חודשים וחצי.',
          'Short averages react faster; long ones describe the broader picture. A 20-day average covers roughly a month of trading — short enough to track the current swing, which is why short-term traders watch for pullbacks toward it rather than breaks below it. A 50-day average covers about two and a half months.'),
        L(`בגרף, המחיר הגיע לשפל, והממוצע של 20 התחיל לעלות ${tTurn20 - tLow} ימים אחר כך. הממוצע של 50 התחיל לעלות רק ${tTurn50 - tLow} ימים אחרי השפל. הקצר עוקב מקרוב; הארוך מסנן יותר רעש — ומשלם על זה באיחור.`,
          `On the chart price made its low, and the 20-day average turned up ${tTurn20 - tLow} days later. The 50-day turned up only ${tTurn50 - tLow} days after the low. The short one follows closely; the long one filters out more noise — and pays for it by turning later.`),
        L('בקצה הארוך יש ממוצעים של 150 ו־200 יום. הממוצע ל־150 יום פחות מדובר בפומבי, אבל הוא אבן יסוד במערכות סינון מגמה מקצועיות — ה"תבנית המגמה" (Trend Template) המפורסמת של מארק מינרוויני דורשת שהמחיר יחזיק מעל ממוצע 150 עולה לפני שמניה בכלל נחשבת מועמדת למגמת עלייה ארוכת טווח — בדיוק כי הוא מגיב מהר יותר מהממוצע ל־200, ותופס עוצמת מגמה אמיתית מוקדם יותר בלי להיות רועש כמו הממוצעים הקצרים יותר.',
          'At the long end are the 150- and 200-day averages. The 150-day average gets talked about far less, but it\'s a cornerstone of professional trend-screening systems: Mark Minervini\'s well-known "Trend Template" requires price to hold above a rising 150-day average before a stock even qualifies as a long-term uptrend candidate — precisely because it reacts faster than the 200-day, catching real trend strength earlier without being as noisy as the shorter averages.')
      ],
      callouts: [{ kind: 'example', lead: L('מה רואים ומה מסיקים', 'What you see, what you conclude'), text: L(
        'רואים: המחיר מעל שני הממוצעים, והקצר מעל הארוך. מסיקים: המחירים האחרונים גבוהים מהממוצע של התקופה הארוכה יותר — תיאור של מה שהיה. את המגמה עצמה עדיין קוראים לפי השיאים והשפלים; הממוצע מסכם אותה, הוא לא מגדיר אותה.',
        'You see: price above both averages, and the short one above the long one. You conclude: recent prices are above the longer period\'s average — a description of what has been. The trend itself is still read from the highs and lows; the average summarises it, it does not define it.') }],
      work: { kind: 'charts', charts: [1] }
    },
    {
      heading: L('כשהקצר עובר את הארוך', 'When the short one crosses the long one'),
      paragraphs: [
        L('חציית ממוצעים היא הרגע שבו הממוצע הקצר עובר את הארוך. כשהקצר עולה מעל הארוך, המחיר הממוצע של התקופה הקרובה הפך גבוה מהמחיר הממוצע של התקופה הרחבה — סימן שהכיוון האחרון השתנה. חצייה כלפי מטה היא תמונת המראה.',
          'A crossover is the moment the short average passes the long one. When the short one rises above the long one, the average price of the recent period has become higher than the average of the broader period — a sign the recent direction has changed. A crossover downward is the mirror image.'),
        L(`בגרף, הממוצע של 20 עבר מעל הממוצע של 50 בנר ה־${tCross + 1}: ה־20 עמד על ${r2(T.ma20[tCross]!)} וה־50 על ${r2(T.ma50[tCross]!)}, והמחיר נסגר ב־${r2(T[tCross]!.c)}.`,
          `On the chart the 20-day average moved above the 50-day at candle ${tCross + 1}: the 20 stood at ${r2(T.ma20[tCross]!)} and the 50 at ${r2(T.ma50[tCross]!)}, and price closed at ${r2(T[tCross]!.c)}.`),
        L('לגרסה המפורסמת ביותר יש שם משלה: כשממוצע 50 יום חוצה מעל ממוצע 200 יום קוראים לזה "צלב זהב" (Golden Cross), והחצייה ההפוכה נקראת "צלב מוות" (Death Cross). זה אותו רעיון בדיוק, על טווח זמן ארוך בהרבה.',
          'The best-known version has its own name: when the 50-day average crosses above the 200-day, it is called a "golden cross", and the opposite crossing a "death cross". It is exactly the same idea, on a much longer timeframe.')
      ],
      callouts: [{ kind: 'caveat', lead: L('שימו לב', 'Watch out'), text: L(
        'חצייה היא תיאור, לא הבטחה: היא אומרת שהמחירים האחרונים עלו מעל הממוצע הארוך — לא שהעלייה תימשך.',
        'A crossover is a description, not a promise: it says recent prices have risen above the long average — not that the rise will continue.') }],
      notesTitle: L('שאלה למחשבה', 'Something to think about'),
      notes: [
        { tone: 'neutral', label: L('למה החצייה הגיעה רק כשהמחיר כבר רחוק מהשפל?', 'Why did the crossover come only once price was already well off the low?'),
          explanation: L('כי שני הקווים בנויים ממחירים שכבר היו: כדי שהממוצע של 50 יסתובב, צריך שהרבה ימים חדשים יחליפו את הישנים. על המחיר של העיכוב הזה — בשלב 5.', 'Because both lines are built from prices that already happened: for the 50-day average to turn, many new days have to replace old ones. More on the cost of that delay in step 5.') }
      ],
      work: { kind: 'charts', charts: [2] }
    }
  ],
  charts: T6_CHARTS,
  activity: {
    kind: 'markPoint',
    prompt: L('איפה הממוצע הקצר חצה את הארוך?', 'Where did the short average cross the long one?'),
    task: L('לחצו על הגרף בנקודה שבה הממוצע של 20 (הזהוב) עלה מעל הממוצע של 50 (הכחול).', 'Click the chart where the 20-day average (gold) rose above the 50-day average (blue).'),
    chart: 3,
    target: yCross,
    tolerance: 3,
    right: L('נכון — כאן הממוצע הקצר עבר מעל הארוך.', 'Correct — this is where the short average moved above the long one.'),
    off: L('לא בדיוק. חפשו את המקום שבו הקו הזהוב עובר מתחת לכחול אל מעליו.', 'Not quite. Look for the place where the gold line passes from under the blue one to above it.'),
    reveal: { label: L('החצייה', 'The crossover'), span: { from: yLow, label: L('העיכוב', 'The delay') } },
    explain: [
      L('בנקודה הזו המחירים של החודש האחרון עלו מעל הממוצע הארוך. זה סימן שהכיוון השתנה — לא הבטחה שהעלייה תימשך.',
        'At this point the last month\'s prices rose above the long average. It is a sign the direction has changed — not a promise the rise will continue.'),
      L(`וממוצעים מאחרים: השפל היה ב־${r2(TRY[yLow]!.l)}, והחצייה הגיעה ${yCross - yLow} ימים אחר כך, כשהמחיר כבר נסגר ב־${r2(TRY[yCross]!.c)} — כ־${pct(TRY[yLow]!.l, TRY[yCross]!.c)}% מעל השפל. זה המחיר של סינון רעש: ככל שהממוצעים ארוכים יותר, האיתות יציב יותר ומאוחר יותר.`,
        `And averages lag: the low was at ${r2(TRY[yLow]!.l)}, and the crossover came ${yCross - yLow} days later, with price already closing at ${r2(TRY[yCross]!.c)} — about ${pct(TRY[yLow]!.l, TRY[yCross]!.c)}% above the low. That is the price of filtering noise: the longer the averages, the steadier the signal and the later it comes.`)
    ]
  },
  apply: {
    id: 't6-apply', lesson: 'T6', category: 'technical', chart: 4,
    question: L(`בגרף החדש המחיר נע הצידה, בערך בין ${Math.floor(Math.min(...chopCloses))} ל־${Math.ceil(Math.max(...chopCloses))}, והממוצעים חצו זה את זה ${CHOP.crosses.length} פעמים בתוך ${chopTo - chopFrom} ימים. מה זה אומר?`,
      `In the new chart price moves sideways, roughly between ${Math.floor(Math.min(...chopCloses))} and ${Math.ceil(Math.max(...chopCloses))}, and the averages crossed each other ${CHOP.crosses.length} times within ${chopTo - chopFrom} days. What does that tell you?`),
    options: [
      { key: 'a', text: L(`${CHOP.crosses.length} איתותים — ${CHOP.crosses.length} הזדמנויות`, `${CHOP.crosses.length} signals — ${CHOP.crosses.length} opportunities`) },
      { key: 'b', text: L('כשאין כיוון, החציות תכופות ורובן לא אומרות הרבה — הן תוצאה של הדשדוש, לא התחלה של תנועה', 'With no direction, crossovers come often and most say little — they are a product of the sideways market, not the start of a move') },
      { key: 'c', text: L('הממוצעים חושבו לא נכון', 'The averages were calculated wrongly') },
      { key: 'd', text: L('רק החצייה האחרונה נחשבת', 'Only the last crossover counts') }
    ],
    correctKey: 'b',
    explanation: L('בלי מגמה, המחיר חוצה את הממוצע שוב ושוב — וכל חצייה נראית בדיוק כמו זו שעובדת במגמה. ההבדל הוא לא בחצייה, אלא בשאלה אם יש כיוון מלכתחילה — ואת זה קוראים בשיאים ובשפלים, כמו בשיעור על מגמה.',
      'With no trend, price crosses the average again and again — and each crossover looks exactly like the one that works in a trend. The difference is not in the crossover but in whether there is a direction at all — and that you read from the highs and lows, as in the lesson on trends.')
  },
  takeaway: {
    bottomLine: L('ממוצע נע הוא ממוצע הסגירות בחלון קבוע: הקצר עוקב מקרוב, הארוך מסנן רעש — וחצייה של הקצר מעל הארוך מתארת שהכיוון האחרון השתנה.',
      'A moving average is the average close over a fixed window: the short one follows closely, the long one filters noise — and the short crossing above the long describes a change in the recent direction.'),
    caveat: L('ממוצעים בנויים ממחירים שכבר היו, ולכן כל חצייה מאחרת — ובשוק בלי כיוון החציות חוזרות שוב ושוב בלי לומר הרבה.',
      'Averages are built from prices that already happened, so every crossover lags — and in a market with no direction, crossovers repeat without saying much.')
  },
  questions: [
    q('t6-order', 5, 'beginner',
      L('בסוף הגרף המחיר מעל שני הממוצעים, והממוצע של 20 מעל זה של 50. מה הסידור הזה מתאר?', 'At the end of the chart price is above both averages, and the 20-day is above the 50-day. What does that arrangement describe?'),
      [
        ['a', L('שהמחיר בטוח ימשיך לעלות', 'That price is sure to keep rising')],
        ['b', L('שהמחירים האחרונים גבוהים מהממוצע של החודש, והחודש גבוה מהממוצע של התקופה הארוכה — תיאור של עלייה עד עכשיו', 'That recent prices are above the month\'s average, and the month above the longer period\'s — a description of a rise so far')],
        ['c', L('שהמניה זולה', 'That the stock is cheap')],
        ['d', L('שהממוצעים עומדים לחצות', 'That the averages are about to cross')]
      ], 'b',
      L(`בנר האחרון המחיר נסגר ב־${r2(QA[qaLast]!.c)}, הממוצע של 20 עמד על ${r2(QA.ma20[qaLast]!)} והממוצע של 50 על ${r2(QA.ma50[qaLast]!)}. הסדר הזה מתאר מה שקרה — עלייה — ולא מבטיח מה שיקרה.`,
        `On the last candle price closed at ${r2(QA[qaLast]!.c)}, the 20-day average stood at ${r2(QA.ma20[qaLast]!)} and the 50-day at ${r2(QA.ma50[qaLast]!)}. That order describes what happened — a rise — and does not promise what comes next.`)),
    q('t6-downcross', 6, 'beginner',
      L('מה קרה בנקודה המסומנת?', 'What happened at the marked point?'),
      [
        ['a', L('הממוצע של 20 ירד מתחת לממוצע של 50: המחירים האחרונים ירדו מתחת לממוצע הארוך יותר', 'The 20-day average fell below the 50-day: recent prices dropped below the longer average')],
        ['b', L('צלב זהב', 'A golden cross')],
        ['c', L('המחיר הגיע לשפל של הגרף', 'Price reached the chart\'s low')],
        ['d', L('הממוצע של 50 חצה מעל ה־20 כי המחיר עלה', 'The 50-day crossed above the 20 because price rose')]
      ], 'a',
      L(`זו חציית ממוצעים כלפי מטה: לפני הנקודה ה־20 היה מעל ה־50, ומנר ${qdCross + 1} הוא מתחתיו. "צלב זהב" הוא הכיוון ההפוך ובזוג 50 ו־200; הגרסה כלפי מטה של הזוג הזה נקראת "צלב מוות".`,
        `This is a downward crossover: before the point the 20 was above the 50, and from candle ${qdCross + 1} it is below it. A "golden cross" is the opposite direction, on the 50/200 pair; the downward version of that pair is called a "death cross".`)),
    q('t6-lag', 7, 'intermediate',
      L(`השפל היה ב־${r2(QL[qlLow]!.l)}, והחצייה כלפי מעלה הגיעה כשהמחיר נסגר ב־${r2(QL[qlCross]!.c)}. כמה מהעלייה מהשפל כבר קרתה עד החצייה?`, `The low was at ${r2(QL[qlLow]!.l)}, and the upward crossover came with price closing at ${r2(QL[qlCross]!.c)}. How much of the rise from the low had already happened by the crossover?`),
      [
        ['a', L(`כ־${pct(QL[qlLow]!.l, QL[qlCross]!.c)}%`, `About ${pct(QL[qlLow]!.l, QL[qlCross]!.c)}%`)],
        ['b', L('0% — החצייה מסמנת את השפל', '0% — the crossover marks the low')],
        ['c', L('כ־50%', 'About 50%')],
        ['d', L('אי אפשר לדעת', "There's no way to know")]
      ], 'a',
      L(`${r2(QL[qlCross]!.c)} ÷ ${r2(QL[qlLow]!.l)} − 1 ≈ ${pct(QL[qlLow]!.l, QL[qlCross]!.c)}%, ו־${qlCross - qlLow} ימים עברו בדרך. החצייה לא מסמנת את השפל — היא מגיעה אחריו, כי הממוצעים בנויים ממחירים שכבר היו.`,
        `${r2(QL[qlCross]!.c)} ÷ ${r2(QL[qlLow]!.l)} − 1 ≈ ${pct(QL[qlLow]!.l, QL[qlCross]!.c)}%, with ${qlCross - qlLow} days passing on the way. The crossover does not mark the low — it comes after it, because averages are built from prices that already happened.`)),
    ...(getQuizQuestions({}) as QuizQuestion[]).filter((x) => x.lesson === 'l3')
  ]
};
