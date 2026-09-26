// ---------------------------------------------------------------------------
// Technical Analysis, lesson 8 — divergence.
//
// Sources: the approved curriculum (T8 owns divergence; "mark the peaks that
// disagree") and the Artifact's boards 08.2b–c — "price made a new high; did
// RSI?", mark the two peaks, compare RSI, bearish divergence with a caveat —
// which were drawn under T7 and moved here (decided 2026-09-26).
//
// Builds on T3 (higher / lower highs and lows; a trend changes when price
// structure breaks) and T7 (what RSI and MACD measure) without re-teaching
// either. Stays clear of any promise: every step keeps "what you see" apart
// from "what it can suggest", step 3 is a divergence that did NOT turn, and
// the Apply asks the learner not to read a divergence as a bottom.
//
// Every price and RSI value in the text is read from the swings in the data.
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
const q = (id: string, chart: number, difficulty: 'beginner' | 'intermediate', question: Localized, options: Array<[string, Localized]>, correctKey: string, explanation: Localized): QuizQuestion => ({
  id, lesson: 'T8', category: 'technical', difficulty, chart, question, options: options.map(([key, text]) => ({ key, text })), correctKey, explanation
});

type Div = typeof series.T8_BEAR;
/** The two swings a divergence compares, with RSI read at the same candles. */
const pair = (c: Div) => {
  const [a, b] = c.swings;
  return { i1: a!.idx, i2: b!.idx, p1: a!.price, p2: b!.price, r1: c.rsi[a!.idx]!, r2: c.rsi[b!.idx]! };
};
/** Lines joining the two swings on price and on RSI — the picture of (dis)agreement. */
const links = (c: Div, at: 'high' | 'low', priceLabel: Localized, rsiLabel: Localized) => {
  const d = pair(c);
  return [
    { i1: d.i1, i2: d.i2, panel: 'price', at, tone: 'gold', label: priceLabel },
    { i1: d.i1, i2: d.i2, panel: 'sub', at, tone: at === 'high' ? 'bear' : 'bull', label: rsiLabel }
  ];
};
const HH = L('שיא גבוה יותר', 'Higher high'), LH_RSI = L('RSI: שיא נמוך יותר', 'RSI: lower high');
const LL = L('שפל נמוך יותר', 'Lower low'), HL_RSI = L('RSI: שפל גבוה יותר', 'RSI: higher low');
const RSI_NOTE = L('RSI (14) בחלונית התחתונה.', 'RSI (14) in the lower panel.');

const BE = series.T8_BEAR, BU = series.T8_BULL, FA = series.T8_FAIL, TR = series.T8_TRY, AP = series.T8_APPLY;
const QB = series.T8_Q_BEAR, QU = series.T8_Q_BULL, QF = series.T8_Q_FAIL;
const be = pair(BE), bu = pair(BU), fa = pair(FA), tr = pair(TR), ap = pair(AP);
const qb = pair(QB), qu = pair(QU), qf = pair(QF);
const faAfterMax = Math.max(...FA.slice(fa.i2 + 1).map((x) => x.h));
const beAfterMin = Math.min(...BE.slice(be.i2 + 1).map((x) => x.l));
const qfAfterMax = Math.max(...QF.slice(qf.i2 + 1).map((x) => x.h));
const numbered = (c: Div, at: 'high' | 'low') => { const d = pair(c); return [d.i1, d.i2].map((idx, k) => ({ idx, at, place: at === 'low' ? 'below' : undefined, tone: 'gold', label: L(String(k + 1), String(k + 1)) })); };

const T8_CHARTS: LessonChartSpec[] = [
  {
    candles: BE, variant: 'price-rsi', options: { links: links(BE, 'high', HH, LH_RSI) },
    label: L(`שני שיאים במחיר, ${r2(be.p1)} ואחריו ${r2(be.p2)} — גבוה יותר; RSI באותם ימים: ${r0(be.r1)} ואחריו ${r0(be.r2)} — נמוך יותר`,
      `Two price peaks, ${r2(be.p1)} then ${r2(be.p2)} — higher; RSI on the same days: ${r0(be.r1)} then ${r0(be.r2)} — lower`),
    caption: L('המחיר גבוה יותר, RSI נמוך יותר', 'Price higher, RSI lower'), subcaption: RSI_NOTE, tone: 'bear', height: 440
  },
  {
    candles: BU, variant: 'price-rsi', options: { links: links(BU, 'low', LL, HL_RSI) },
    label: L(`שני שפלים במחיר, ${r2(bu.p1)} ואחריו ${r2(bu.p2)} — נמוך יותר; RSI באותם ימים: ${r0(bu.r1)} ואחריו ${r0(bu.r2)} — גבוה יותר`,
      `Two price lows, ${r2(bu.p1)} then ${r2(bu.p2)} — lower; RSI on the same days: ${r0(bu.r1)} then ${r0(bu.r2)} — higher`),
    caption: L('המחיר נמוך יותר, RSI גבוה יותר', 'Price lower, RSI higher'), subcaption: RSI_NOTE, tone: 'bull', height: 440
  },
  {
    candles: FA, variant: 'price-rsi',
    options: { links: links(FA, 'high', HH, LH_RSI), points: [{ idx: FA.length - 1, tone: 'bull', label: L(r2(FA[FA.length - 1]!.c), r2(FA[FA.length - 1]!.c)) }] },
    label: L(`דייברג׳נס שלילי בין ${r2(fa.p1)} ל־${r2(fa.p2)}, ואחריו המחיר ממשיך לעלות עד ${r2(faAfterMax)}`,
      `A bearish divergence between ${r2(fa.p1)} and ${r2(fa.p2)}, after which price keeps rising to ${r2(faAfterMax)}`),
    caption: L('דייברג׳נס — והמחיר ממשיך', 'Divergence — and price carries on'), subcaption: RSI_NOTE, tone: 'bull', height: 440
  },
  {
    candles: TR, variant: 'price-rsi', options: {},
    label: L('מחיר שעולה בגלים, ומתחתיו RSI; הגרף נעצר מעט אחרי הפסגה האחרונה', 'Price rising in waves, with RSI beneath it; the chart stops just after the latest peak'),
    caption: L('המחיר עשה שיא חדש', 'Price made a new high'), subcaption: RSI_NOTE, tone: 'neutral', height: 440
  },
  {
    candles: AP, variant: 'price-rsi', options: { links: links(AP, 'low', LL, HL_RSI) },
    label: L('מחיר בירידה, ומתחתיו RSI: שפל נמוך יותר במחיר ושפל גבוה יותר ב־RSI; הגרף נעצר מעט אחרי השפל השני', 'Price falling, with RSI beneath it: a lower low in price and a higher low in RSI; the chart stops just after the second low'),
    caption: L('גרף חדש', 'A new chart'), tone: 'neutral', height: 280
  },
  { candles: QB, variant: 'price-rsi', options: { points: numbered(QB, 'high') }, label: L('מחיר ומתחתיו RSI, עם שתי פסגות מסומנות 1 ו־2', 'Price with RSI beneath it, with two peaks marked 1 and 2'), caption: L('שתי הפסגות המסומנות', 'The two marked peaks'), tone: 'neutral', height: 320 },
  { candles: QU, variant: 'price-rsi', options: { points: numbered(QU, 'low') }, label: L('מחיר ומתחתיו RSI, עם שני שפלים מסומנים 1 ו־2', 'Price with RSI beneath it, with two lows marked 1 and 2'), caption: L('שני השפלים המסומנים', 'The two marked lows'), tone: 'neutral', height: 320 },
  { candles: QF, variant: 'price-rsi', options: { links: links(QF, 'high', HH, LH_RSI) }, label: L('מחיר ומתחתיו RSI: דייברג׳נס שלילי בין שתי פסגות מחוברות, ואחריו המחיר ממשיך לעלות', 'Price with RSI beneath it: a bearish divergence between two linked peaks, after which price keeps rising'), caption: L('אחרי הדייברג׳נס', 'After the divergence'), tone: 'neutral', height: 320 }
];
// Chart indexes: 0 bearish · 1 bullish · 2 no reversal · 3 the Try chart · 4 apply · 5–7 questions.

export const T8: LessonContent = {
  id: 'T8',
  tutor: { topic: 'divergence', label: L('דייברג׳נס', 'divergence') },
  teach: [
    {
      heading: L('המחיר עלה גבוה יותר. גם המומנטום?', 'Price went higher. Did momentum?'),
      paragraphs: [
        L('בשיעור על מגמה השוויתם כל שיא לשיא שלפניו. דייברג׳נס (Divergence) הוא אותה השוואה, פעמיים: פעם במחיר, ופעם באינדיקטור שמתחתיו — באותם שני רגעים.',
          'In the lesson on trends you compared each high with the high before it. Divergence is that same comparison, done twice: once on price, and once on the indicator beneath it — at the same two moments.'),
        L(`בגרף, המחיר עשה שיא ב־${r2(be.p1)} ואחר כך שיא גבוה יותר ב־${r2(be.p2)}. אבל RSI באותם שני ימים עשה את ההפך: ${r0(be.r1)} בשיא הראשון, ורק ${r0(be.r2)} בשני — שיא נמוך יותר. המחיר הגיע גבוה יותר; המומנטום שמאחוריו לא.`,
          `On the chart price peaked at ${r2(be.p1)} and then made a higher peak at ${r2(be.p2)}. But RSI on those same two days did the opposite: ${r0(be.r1)} at the first peak, only ${r0(be.r2)} at the second — a lower high. Price reached higher; the momentum behind it did not.`),
        L('לזה קוראים דייברג׳נס שלילי (Bearish Divergence): שיא גבוה יותר במחיר, ושיא נמוך יותר באינדיקטור. זה נראה בבירור כששמים שני קווים זה מול זה — אחד מחבר את שתי הפסגות במחיר, השני את אותן שתי נקודות ב־RSI — והם נוטים לכיוונים הפוכים.',
          'That is called a bearish divergence: a higher high in price, and a lower high in the indicator. It is plain to see once two lines sit side by side — one joining the two price peaks, the other the same two points on RSI — and they slope opposite ways.')
      ],
      callouts: [{ kind: 'example', lead: L('מה רואים ומה מסיקים', 'What you see, what you conclude'), text: L(
        'רואים: שתי פסגות במחיר, והשנייה גבוהה יותר; באותם ימים שתי קריאות RSI, והשנייה נמוכה יותר. זו תצפית. מה היא יכולה לרמוז — זה השלב הבא.',
        'You see: two price peaks, the second higher; on the same days two RSI readings, the second lower. That is an observation. What it can suggest is the next step.') }],
      work: { kind: 'charts', charts: [0] }
    },
    {
      heading: L('מה זה יכול לרמוז — ומה לא', 'What it can suggest — and what it can\'t'),
      paragraphs: [
        L('RSI נמוך יותר בשיא השני אומר שבשבועיים שלפניו, העליות היו קטנות יותר ביחס לירידות מאשר לפני השיא הראשון. הקונים עוד דוחפים את המחיר למעלה — אבל בפחות כוח. זה יכול לרמוז שהמהלך מתעייף. בגרף הקודם המחיר אכן ירד אחר כך, עד ' + r2(beAfterMin) + '.',
          'A lower RSI at the second peak says that in the two weeks before it, gains were smaller relative to losses than before the first peak. Buyers are still pushing price up — with less force. That can suggest the move is tiring. On the previous chart price did fall afterwards, to ' + r2(beAfterMin) + '.'),
        L(`התמונה ההפוכה היא דייברג׳נס חיובי (Bullish Divergence): המחיר עושה שפל נמוך יותר — בגרף, מ־${r2(bu.p1)} ל־${r2(bu.p2)} — אבל RSI עושה שפל גבוה יותר, מ־${r0(bu.r1)} ל־${r0(bu.r2)}. הירידה נמשכת, בפחות כוח.`,
          `The mirror image is a bullish divergence: price makes a lower low — on the chart, from ${r2(bu.p1)} to ${r2(bu.p2)} — but RSI makes a higher low, from ${r0(bu.r1)} to ${r0(bu.r2)}. The fall carries on, with less force.`),
        L('מה דייברג׳נס לא אומר: שהמחיר יתהפך, מתי, או כמה. מגמה משתנה רק כשהמבנה של המחיר עצמו משתנה — כמו שראיתם בשיעור על מגמה. ואותה השוואה אפשר לעשות גם עם MACD; כששני אינדיקטורים מראים אותו דבר, זה עוד מידע — עדיין לא הוכחה.',
          'What divergence does not say: that price will turn, when, or by how much. A trend changes only when price\'s own structure changes — as you saw in the lesson on trends. The same comparison works with MACD too; when two indicators show the same thing, that is more information — still not proof.')
      ],
      work: { kind: 'charts', charts: [1] }
    },
    {
      heading: L('דייברג׳נס — והמחיר ממשיך לעלות', 'Divergence — and price keeps rising'),
      paragraphs: [
        L(`כאן אותה תמונה בדיוק: שיא ב־${r2(fa.p1)}, שיא גבוה יותר ב־${r2(fa.p2)}, ו־RSI נמוך יותר בשני (${r0(fa.r2)} מול ${r0(fa.r1)}). ובכל זאת המחיר לא התהפך — הוא המשיך לטפס עד ${r2(faAfterMax)}, עוד כ־${pct(fa.p2, faAfterMax)}%.`,
          `Here is exactly the same picture: a peak at ${r2(fa.p1)}, a higher one at ${r2(fa.p2)}, and a lower RSI at the second (${r0(fa.r2)} against ${r0(fa.r1)}). Yet price did not turn — it kept climbing to ${r2(faAfterMax)}, about ${pct(fa.p2, faAfterMax)}% more.`),
        L('למה? כי דייברג׳נס מודד את קצב העלייה, לא את הכיוון שלה. עלייה יכולה להאט ולהמשיך — ובמגמות חזקות, דייברג׳נס שלילי יכול להופיע שוב ושוב בלי שהמחיר מתהפך. מי שיצא בכל דייברג׳נס היה יוצא מוקדם מדי, שוב ושוב.',
          'Why? Because divergence measures the pace of the rise, not its direction. A rise can slow and carry on — and in strong trends a bearish divergence can appear again and again without price turning. Anyone who got out at every divergence would have got out too early, time after time.'),
        L('לכן משתמשים בו כהקשר: סיבה להסתכל מקרוב על המבנה של המחיר, לא סיבה לפעול לבדה. כאן המחיר לא עשה שפל נמוך יותר אחרי הדייברג׳נס — מבנה העלייה נשאר שלם, והעלייה נמשכה.',
          'So it is used as context: a reason to look closely at price\'s structure, not a reason to act on its own. Here price made no lower low after the divergence — the uptrend\'s structure stayed intact, and the rise went on.')
      ],
      callouts: [{ kind: 'caveat', lead: L('שימו לב', 'Watch out'), text: L('דייברג׳נס הוא אזהרה, לא איתות מכירה.', 'Divergence is a warning, not a sell signal.') }],
      notesTitle: L('שאלה למחשבה', 'Something to think about'),
      notes: [
        { tone: 'neutral', label: L('אם דייברג׳נס לא מבטיח היפוך, למה לשים לב אליו בכלל?', 'If divergence promises no reversal, why notice it at all?'),
          explanation: L('כי הוא מוסיף מידע שהמחיר לבדו לא מראה: הקצב. כשהוא מופיע יחד עם שבירה של המבנה — למשל שפל נמוך יותר אחרי שיאים גבוהים יותר — התמונה ברורה יותר מאשר מכל אחד מהם לבד.', 'Because it adds something price alone does not show: the pace. When it comes together with a break in structure — a lower low after higher highs, say — the picture is clearer than from either on its own.') }
      ],
      work: { kind: 'charts', charts: [2] }
    }
  ],
  charts: T8_CHARTS,
  activity: {
    kind: 'markPoints',
    prompt: L('המחיר עשה שיא חדש. גם RSI?', 'Price made a new high. Did RSI?'),
    task: L('סמנו את שתי הפסגות האחרונות בגרף המחיר — לחצו על הגרף או הזיזו את הסמן — ואז השוו מה עשה RSI באותם ימים.', 'Mark the two latest peaks on the price chart — click the chart or move the marker — then compare what RSI did on those days.'),
    chart: 3,
    at: 'high',
    points: [
      { target: tr.i1, tolerance: 3, label: L('הפסגה הראשונה', 'The first peak'), off: L('הסימון הראשון רחוק מהפסגה. חפשו את השיא הגבוה ביותר לפני הנסיגה האחרונה.', 'The first mark is off the peak. Look for the highest point before the last pullback.') },
      { target: tr.i2, tolerance: 3, label: L('הפסגה השנייה', 'The second peak'), off: L('הסימון השני רחוק מהפסגה האחרונה — הנקודה הגבוהה ביותר בחלק הימני של הגרף.', 'The second mark is off the latest peak — the highest point on the right-hand side of the chart.') }
    ],
    compare: {
      question: L('ומה עשה RSI בפסגה השנייה, לעומת הראשונה?', 'And what did RSI do at the second peak, compared with the first?'),
      options: [
        { key: 'higher', label: L('שיא גבוה יותר — המומנטום הסכים עם המחיר', 'A higher high — momentum agreed with price') },
        { key: 'lower', label: L('שיא נמוך יותר — המחיר עלה, המומנטום לא', 'A lower high — price rose, momentum did not') },
        { key: 'same', label: L('בערך אותו גובה', 'About the same height') }
      ],
      correct: 'lower',
      wrong: L('הסתכלו על הערכים של RSI ליד הסימונים שלכם, והשוו: השני נמוך מהראשון בהרבה.', 'Look at the RSI values next to your marks and compare them: the second is well below the first.')
    },
    right: L(`דייברג׳נס שלילי: שיא מחיר גבוה יותר (${r2(tr.p2)} לעומת ${r2(tr.p1)}) עם RSI נמוך יותר (${r0(tr.r2)} לעומת ${r0(tr.r1)}). הקונים דוחפים — אבל בפחות כוח.`,
      `A bearish divergence: a higher price peak (${r2(tr.p2)} against ${r2(tr.p1)}) with a lower RSI (${r0(tr.r2)} against ${r0(tr.r1)}). Buyers are pushing — with less force.`),
    reveal: { links: links(TR, 'high', HH, LH_RSI) },
    explain: [
      L(`זו אזהרה, לא איתות מכירה. בגרף הזה המחיר אכן ירד אחרי הפסגה השנייה, עד ${r2(TR.after.minL)} — אבל בשלב 3 ראיתם דייברג׳נס שאחריו המחיר המשיך לעלות. מה שמכריע אם המגמה השתנתה הוא המבנה של המחיר עצמו.`,
        `It is a warning, not a sell signal. On this chart price did fall after the second peak, to ${r2(TR.after.minL)} — but in step 3 you saw a divergence after which price kept rising. What decides whether the trend has changed is price's own structure.`)
    ]
  },
  apply: {
    id: 't8-apply', lesson: 'T8', category: 'technical', chart: 4,
    question: L(`בגרף החדש המחיר יורד, ועשה שפל נמוך יותר (מ־${r2(ap.p1)} ל־${r2(ap.p2)}), בזמן ש־RSI עשה שפל גבוה יותר (מ־${r0(ap.r1)} ל־${r0(ap.r2)}). מה הקריאה הסבירה ביותר?`,
      `In the new chart price is falling, and made a lower low (from ${r2(ap.p1)} to ${r2(ap.p2)}) while RSI made a higher low (from ${r0(ap.r1)} to ${r0(ap.r2)}). What is the most reasonable reading?`),
    options: [
      { key: 'a', text: L('זו התחתית — הירידה נגמרה', 'This is the bottom — the decline is over') },
      { key: 'b', text: L('לחץ המכירה נחלש, אבל המבנה עדיין יורד. שווה לחכות לראות אם המחיר יעשה שיא גבוה יותר לפני שמסיקים שהמגמה השתנתה', 'Selling pressure has weakened, but the structure is still falling. Wait to see whether price makes a higher high before concluding the trend has changed') },
      { key: 'c', text: L('אין לזה שום משמעות', 'It means nothing at all') },
      { key: 'd', text: L('RSI תמיד צודק יותר מהמחיר', 'RSI is always more right than price') }
    ],
    correctKey: 'b',
    explanation: L(`במקרה הזה, אחרי השפל השני המחיר קפץ עד ${r2(AP.after.maxH)}, ואז ירד לשפל חדש ב־${r2(AP.after.minL)} — הדייברג׳נס לא סימן את התחתית. הוא אמר שהירידה מאבדת כוח; הוא לא אמר שהיא נגמרה.`,
      `In this case, after the second low price bounced to ${r2(AP.after.maxH)}, then fell to a new low at ${r2(AP.after.minL)} — the divergence did not mark the bottom. It said the fall was losing force; it did not say it was over.`)
  },
  takeaway: {
    bottomLine: L('דייברג׳נס הוא אי־הסכמה בין המבנה של המחיר למבנה של האינדיקטור: שיא גבוה יותר במחיר מול שיא נמוך יותר ב־RSI (שלילי), או שפל נמוך יותר במחיר מול שפל גבוה יותר ב־RSI (חיובי).',
      'Divergence is a disagreement between price\'s structure and the indicator\'s: a higher high in price against a lower high in RSI (bearish), or a lower low in price against a higher low in RSI (bullish).'),
    caveat: L('הוא מתאר מהלך שמאבד כוח — לא מבטיח היפוך, לא אומר מתי, ויכול לחזור שוב ושוב במגמה חזקה. המגמה משתנה רק כשהמבנה של המחיר משתנה.',
      'It describes a move losing force — it does not promise a reversal, does not say when, and can repeat again and again in a strong trend. The trend changes only when price\'s structure changes.')
  },
  questions: [
    q('t8-compare-highs', 5, 'beginner',
      L('השוו את שתי הפסגות המסומנות: מה עשה המחיר, ומה עשה RSI?', 'Compare the two marked peaks: what did price do, and what did RSI do?'),
      [
        ['a', L('המחיר עשה שיא גבוה יותר, ו־RSI שיא נמוך יותר — דייברג׳נס שלילי', 'Price made a higher high, and RSI a lower high — a bearish divergence')],
        ['b', L('שניהם עשו שיא גבוה יותר — הם מסכימים', 'Both made a higher high — they agree')],
        ['c', L('המחיר עשה שיא נמוך יותר, ו־RSI שיא גבוה יותר', 'Price made a lower high, and RSI a higher high')],
        ['d', L('אי אפשר להשוות מחיר ל־RSI', "You can't compare price with RSI")]
      ], 'a',
      L(`המחיר: ${r2(qb.p1)} בפסגה 1, ${r2(qb.p2)} בפסגה 2 — גבוה יותר. RSI באותם ימים: ${r0(qb.r1)} ואחריו ${r0(qb.r2)} — נמוך יותר. זה דייברג׳נס שלילי: תצפית על מומנטום שנחלש, לא תחזית.`,
        `Price: ${r2(qb.p1)} at peak 1, ${r2(qb.p2)} at peak 2 — higher. RSI on the same days: ${r0(qb.r1)} then ${r0(qb.r2)} — lower. That is a bearish divergence: an observation of fading momentum, not a forecast.`)),
    q('t8-compare-lows', 6, 'beginner',
      L('השוו את שני השפלים המסומנים. מה רואים?', 'Compare the two marked lows. What do you see?'),
      [
        ['a', L('המחיר עשה שפל נמוך יותר, ו־RSI שפל גבוה יותר — דייברג׳נס חיובי', 'Price made a lower low, and RSI a higher low — a bullish divergence')],
        ['b', L('שניהם עשו שפל נמוך יותר', 'Both made a lower low')],
        ['c', L('המחיר עשה שפל גבוה יותר', 'Price made a higher low')],
        ['d', L('RSI היה נמוך, ולכן חייבים לקנות', 'RSI was low, so you have to buy')]
      ], 'a',
      L(`המחיר: ${r2(qu.p1)} בשפל 1, ${r2(qu.p2)} בשפל 2 — נמוך יותר. RSI: ${r0(qu.r1)} ואחריו ${r0(qu.r2)} — גבוה יותר. הירידה נמשכה, בפחות כוח. זה לא "חייבים לקנות" — זו תצפית שמוסיפה הקשר.`,
        `Price: ${r2(qu.p1)} at low 1, ${r2(qu.p2)} at low 2 — lower. RSI: ${r0(qu.r1)} then ${r0(qu.r2)} — higher. The fall carried on, with less force. That is not "you have to buy" — it is an observation that adds context.`)),
    q('t8-no-reversal', 7, 'intermediate',
      L('בגרף הופיע דייברג׳נס שלילי בין שתי הפסגות המחוברות — ואחריו המחיר המשיך לעלות. האם הדייברג׳נס "טעה"?', 'The chart shows a bearish divergence between the two linked peaks — and after it price kept rising. Was the divergence "wrong"?'),
      [
        ['a', L('כן — דייברג׳נס אמור להפיל את המחיר', 'Yes — a divergence is supposed to bring price down')],
        ['b', L('לא — הוא תיאר מומנטום שנחלש, לא הבטיח היפוך; העלייה המשיכה, בקצב אחר', 'No — it described fading momentum, it never promised a reversal; the rise continued, at a different pace')],
        ['c', L('כן, כי RSI חושב לא נכון', 'Yes, because RSI was calculated wrongly')],
        ['d', L('לא, כי המחיר ירד מיד אחריו', 'No, because price fell right after it')]
      ], 'b',
      L(`אחרי הפסגה השנייה (${r2(qf.p2)}) המחיר עלה עד ${r2(qfAfterMax)}, עוד כ־${pct(qf.p2, qfAfterMax)}%. דייברג׳נס לא "טועה" ולא "צודק" — הוא אומר שהקצב השתנה. את הכיוון קובע המבנה של המחיר.`,
        `After the second peak (${r2(qf.p2)}) price rose to ${r2(qfAfterMax)}, about ${pct(qf.p2, qfAfterMax)}% more. A divergence is neither "wrong" nor "right" — it says the pace changed. Price's structure decides the direction.`)),
    // The previous build's divergence question, taught here now (moved from l6).
    ...(getQuizQuestions({}) as QuizQuestion[]).filter((x) => x.lesson === 'T8')
  ]
};
