// ---------------------------------------------------------------------------
// Technical Analysis, lesson 1 — reading a chart: timeframes and volume.
//
// The track's first lesson sets up the frame every later lesson reads in:
// which way time runs, what one candle stands for, how the timeframe and the
// range change the picture, and what the volume bars count. It stops at the
// edge of T2: a candle is "one period" here — what is INSIDE a candle (open,
// close, high, low, body, shadows) is T2's lesson, and trends (highs and lows)
// are T3's. Volume is introduced as a thing to read; using it to judge a move
// is T5's.
//
// Sources: the approved curriculum (title, KB topics how-to-read-a-chart and
// volume), the Artifact's plan for T1 ("mark the day with unusual volume"), and
// the knowledge-base entries for those topics. Every number is read from the
// chart data it describes.
// ---------------------------------------------------------------------------
import type { Localized, QuizQuestion } from '@core/types/kb';
import type { LessonChartSpec } from '@core/charts/lessonCharts';
import * as series from '@core/charts/series.js';
import type { LessonContent } from './types';

const L = (he: string, en: string): Localized => ({ he, en });
const r1 = (x: number) => x.toFixed(1);
const pct = (a: number, b: number) => Math.abs((b / a - 1) * 100);
const q = (id: string, chart: number, question: Localized, options: Array<[string, Localized]>, correctKey: string, explanation: Localized): QuizQuestion => ({
  id, lesson: 'T1', category: 'technical', difficulty: 'beginner', chart, question, options: options.map(([key, text]) => ({ key, text })), correctKey, explanation
});
/** Candle i's volume as a multiple of the average of all the other candles. */
const volX = (c: Array<{ v: number }>, i: number) => c[i]!.v / (c.filter((_, k) => k !== i).reduce((s, x) => s + x.v, 0) / (c.length - 1));
const MARKED = L('היום המסומן', 'The marked day');
/** A day's volume in words: "N times the average" above it, "about N% of the average" below it. */
const share = (x: number) => (x >= 1.05 ? L(`פי ${r1(x)} מהממוצע`, `${r1(x)}× the average`) : L(`כ־${Math.round(x * 100)}% מהממוצע`, `about ${Math.round(x * 100)}% of the average`));

const D = series.T1_DAILY, Y = series.T1_YEAR_FACTS, Y20 = series.T1_YEAR_LAST20, YW = series.T1_YEAR_WEEKLY;
const V = series.T1_VOL, TRY = series.T1_TRY, AP = series.T1_APPLY;
const QW = series.T1_Q_WEEKLY, QV = series.T1_Q_VOL, QS = series.T1_Q_SCALE;
const dFirst = D[0]!.c, dLast = D[D.length - 1]!.c;
const y20First = Y20[0]!.c, y20Last = Y20[Y20.length - 1]!.c, yFirst = Y.firstClose, yLast = Y.lastClose;
const qsFirst = QS[0]!.c, qsLast = QS[QS.length - 1]!.c, qsLow = Math.min(...QS.map((c) => c.l));
const tryX = volX(TRY, TRY.marks.c);

const T1_CHARTS: LessonChartSpec[] = [
  {
    candles: D,
    variant: 'price',
    options: { showVolume: false, highlights: [{ i1: D.markIdx, tone: 'gold', label: L('נר אחד = יום מסחר אחד', 'One candle = one trading day') }] },
    label: L(`גרף של ${D.length} ימי מסחר, נר לכל יום, שבו המחיר עולה מ־${r1(dFirst)} ל־${r1(dLast)}; הציר האנכי מתחיל קרוב ל־${Math.floor(Math.min(...D.map((c) => c.l)))}, לא באפס`,
      `A chart of ${D.length} trading days, one candle per day, in which price rises from ${r1(dFirst)} to ${r1(dLast)}; the vertical axis starts near ${Math.floor(Math.min(...D.map((c) => c.l)))}, not at zero`),
    caption: L('נר לכל יום', 'One candle per day'),
    subcaption: L('נתוני הדגמה. הזמן רץ משמאל לימין; המחיר — על הציר שבצד.', 'Demo data. Time runs left to right; price is on the side axis.'),
    tone: 'neutral',
    height: 380
  },
  {
    candles: Y20,
    variant: 'price',
    options: { showVolume: false },
    label: L(`20 ימי מסחר אחרונים של מניה, נר לכל יום: המחיר יורד מ־${r1(y20First)} ל־${r1(y20Last)}`, `The last 20 trading days of a stock, one candle per day: price falls from ${r1(y20First)} to ${r1(y20Last)}`),
    caption: L('20 הימים האחרונים · נר לכל יום', 'The last 20 days · a candle per day'),
    subcaption: L(`מ־${r1(y20First)} ל־${r1(y20Last)}.`, `From ${r1(y20First)} to ${r1(y20Last)}.`),
    tone: 'bear',
    height: 300
  },
  {
    candles: YW,
    variant: 'price',
    options: { showVolume: false },
    label: L(`שנה שלמה של אותה מניה, נר לכל שבוע: המחיר עולה מ־${r1(yFirst)} ל־${r1(yLast)}, עם נסיגה בסוף`, `A full year of the same stock, one candle per week: price rises from ${r1(yFirst)} to ${r1(yLast)}, with a pullback at the end`),
    caption: L('השנה כולה · נר לכל שבוע', 'The whole year · a candle per week'),
    subcaption: L(`מ־${r1(yFirst)} ל־${r1(yLast)} — אותה מניה בדיוק.`, `From ${r1(yFirst)} to ${r1(yLast)} — exactly the same stock.`),
    tone: 'bull',
    height: 300
  },
  {
    candles: V,
    variant: 'price',
    options: {
      showVolume: true,
      highlights: [
        { i1: V.upIdx, tone: 'gold', label: L('יום עולה', 'An up day') },
        { i1: V.downIdx, tone: 'gold', label: L('יום יורד', 'A down day') }
      ]
    },
    label: L(`גרף נרות עם עמודות נפח מתחתיו: בשני ימים העמודה גבוהה בערך פי שלושה מהממוצע — ביום אחד המחיר עלה, ובשני ירד`,
      `A candlestick chart with volume bars beneath it: on two days the bar is about three times the average — on one day price rose, on the other it fell`),
    caption: L('נפח: עמודה לכל נר', 'Volume: one bar per candle'),
    subcaption: L('שתי עמודות גבוהות — אחת ביום עולה ואחת ביום יורד.', 'Two tall bars — one on an up day, one on a down day.'),
    tone: 'neutral',
    height: 400
  },
  {
    candles: AP,
    variant: 'price',
    options: { showVolume: true, highlights: [{ i1: AP.markIdx, tone: 'gold', label: MARKED }] },
    label: L('גרף נרות עם עמודות נפח, ויום מסומן שבו המחיר ירד ועמודת הנפח היא הגבוהה בגרף', 'A candlestick chart with volume bars, and a marked day on which price fell and the volume bar is the tallest on the chart'),
    caption: L('גרף חדש', 'A new chart'),
    tone: 'neutral',
    height: 260
  },
  {
    candles: QW,
    variant: 'price',
    options: { showVolume: false },
    label: L(`גרף של ${QW.length} נרות, כל נר שבוע אחד`, `A chart of ${QW.length} candles, each one week`),
    caption: L('כל נר = שבוע אחד', 'Each candle = one week'),
    tone: 'neutral',
    height: 300
  },
  {
    candles: QV,
    variant: 'price',
    options: { showVolume: true, highlights: [{ i1: QV.markIdx, tone: 'gold', label: MARKED }] },
    label: L('גרף נרות עם עמודות נפח, ויום מסומן שבו הנר קטן ועמודת הנפח היא הגבוהה בגרף', 'A candlestick chart with volume bars, and a marked day with a small candle and the tallest volume bar on the chart'),
    caption: L('היום המסומן', 'The marked day'),
    tone: 'neutral',
    height: 320
  },
  {
    candles: QS,
    variant: 'price',
    options: { showVolume: false },
    label: L(`גרף מחיר שנראה כמו טיפוס מתחתית הגרף לראשו; הציר האנכי מתחיל קרוב ל־${Math.floor(qsLow)}`, `A price chart that looks like a climb from the bottom of the chart to the top; the vertical axis starts near ${Math.floor(qsLow)}`),
    caption: L('מחיר המניה', 'The share price'),
    tone: 'neutral',
    height: 300
  }
];
// Chart indexes: 0 one candle a day · 1–2 the same stock at two timeframes · 3 volume · 4 apply · 5–7 questions.

export const T1: LessonContent = {
  id: 'T1',
  tutor: { topic: 'how-to-read-a-chart', label: L('קריאת גרף', 'reading a chart') },
  teach: [
    {
      heading: L('מה בעצם רואים בגרף מחיר?', 'What does a price chart actually show?'),
      paragraphs: [
        L('גרף מחיר מספר סיפור של זמן ומחיר. הציר האופקי הוא זמן, והוא רץ משמאל לימין — גם כשהאתר בעברית: הנר הימני ביותר הוא הרגע האחרון. הציר האנכי הוא מחיר, והמספרים שלו מופיעים בצד הגרף.',
          'A price chart tells a story of time and price. The horizontal axis is time, running left to right: the rightmost candle is the most recent moment. The vertical axis is price, with its numbers along the side of the chart.'),
        L(`כל נר בגרף מסכם פרק זמן אחד. בגרף הזה כל נר הוא יום מסחר אחד, ויש בו ${D.length} נרות — בערך שלושה חודשי מסחר. איך קוראים נר מבפנים הוא הנושא של השיעור הבא; כרגע מספיק לדעת שכל נר כאן הוא יום, וכל עסקה באותו יום "נכנסת" לנר שלו.`,
          `Each candle on the chart sums up one period. On this chart every candle is one trading day, and there are ${D.length} of them — roughly three months of trading. How to read a candle from the inside is the next lesson; for now it is enough that each candle here is a day, and every trade that day "goes into" its candle.`),
        L(`שימו לב למספרים בצד: הציר לא מתחיל באפס. המחיר כאן עלה מ־${r1(dFirst)} ל־${r1(dLast)} — כ־${pct(dFirst, dLast).toFixed(0)}% — אבל על המסך זה נראה כמו טיפוס מתחתית הגרף לראשו. לכן את גודל התנועה קוראים באחוזים, לא לפי הגובה על המסך.`,
          `Look at the numbers on the side: the axis does not start at zero. Price here rose from ${r1(dFirst)} to ${r1(dLast)} — about ${pct(dFirst, dLast).toFixed(0)}% — but on screen it looks like a climb from the bottom of the chart to the top. So you read the size of a move in percent, not by its height on the screen.`)
      ],
      work: { kind: 'charts', charts: [0] }
    },
    {
      heading: L('אותה מניה, שתי תמונות', 'One stock, two pictures'),
      paragraphs: [
        L('טווח הזמן של גרף הוא מה שכל נר מייצג: דקה, שעה, יום או שבוע. ולצידו יש את הטווח המוצג — כמה זמן אחורה הגרף מראה. לפני שמסיקים משהו מגרף, בודקים את שניהם.',
          'A chart\'s timeframe is what each candle stands for: a minute, an hour, a day or a week. Next to it is the range on display — how far back the chart goes. Before concluding anything from a chart, check both.'),
        L(`שני הגרפים מציגים את אותה מניה בדיוק. בגרף של 20 הימים האחרונים, נר לכל יום, המחיר ירד מכ־${r1(y20First)} לכ־${r1(y20Last)} — כ־${pct(y20First, y20Last).toFixed(0)}% פחות. בגרף של השנה כולה, נר לכל שבוע, אותה ירידה היא נסיגה קטנה בסוף עלייה מכ־${r1(yFirst)} לכ־${r1(yLast)} — כ־${pct(yFirst, yLast).toFixed(0)}% יותר.`,
          `Both charts show exactly the same stock. On the last 20 days, a candle per day, price fell from about ${r1(y20First)} to about ${r1(y20Last)} — some ${pct(y20First, y20Last).toFixed(0)}% lower. On the whole year, a candle per week, that same drop is a small pullback at the end of a climb from about ${r1(yFirst)} to about ${r1(yLast)} — some ${pct(yFirst, yLast).toFixed(0)}% higher.`),
        L('אף אחד מהגרפים לא "טועה" — כל אחד עונה על שאלה אחרת. מי שמסתכל על הימים הקרובים יתעניין בגרף היומי, ומי שמחזיק לשנים — בגרף השבועי. מה שחשוב הוא לדעת על איזה גרף אתם מסתכלים, ולא להשוות גרף יומי לשבועי כאילו היו אותו דבר.',
          'Neither chart is "wrong" — each answers a different question. Someone looking at the days ahead will care about the daily chart; someone holding for years, about the weekly one. What matters is knowing which chart you are looking at, and not comparing a daily chart with a weekly one as if they were the same thing.')
      ],
      callouts: [{ kind: 'example', lead: L('איך נבנה נר שבועי', 'How a weekly candle is built'), text: L(
        `נר שבועי מאחד חמישה ימי מסחר לנר אחד: הוא מתחיל איפה שהשבוע התחיל ונגמר איפה שהשבוע נגמר. לכן השנה כאן — ${Y.days} ימי מסחר — היא רק ${YW.length} נרות בגרף השבועי.`,
        `A weekly candle merges five trading days into one: it starts where the week started and ends where the week ended. That is why the year here — ${Y.days} trading days — is only ${YW.length} candles on the weekly chart.`) }],
      work: { kind: 'charts', charts: [1, 2] }
    },
    {
      heading: L('העמודות שמתחת לגרף', 'The bars under the chart'),
      paragraphs: [
        L('מתחת לגרף המחיר יש שורה של עמודות — עמודה אחת לכל נר. זה נפח המסחר: כמה מניות עברו יד באותו פרק זמן. כל עסקה היא קונה ומוכר שהסכימו על מחיר, כמו שראיתם במסלול היסודות, והנפח סופר כמה מניות החליפו בעלים.',
          'Beneath the price chart is a row of bars — one bar per candle. That is trading volume: how many shares changed hands in that period. Every trade is a buyer and a seller agreeing on a price, as you saw in the Foundations track, and volume counts how many shares changed owners.'),
        L(`עמודה גבוהה במיוחד אומרת שהרבה יותר משתתפים מהרגיל היו פעילים באותו יום. בגרף יש שני ימים כאלה: ביום אחד נסחרו פי ${r1(volX(V, V.upIdx))} מהממוצע והמחיר עלה, ובשני פי ${r1(volX(V, V.downIdx))} והמחיר ירד. כלומר, הנפח לא מספר לאן המחיר הלך — רק כמה אנשים השתתפו בתנועה.`,
          `An unusually tall bar means far more participants than usual were active that day. The chart has two such days: on one, ${r1(volX(V, V.upIdx))} times the average traded and price rose; on the other, ${r1(volX(V, V.downIdx))} times and price fell. In other words, volume does not say which way price went — only how many people took part in the move.`),
        L('למה זה חשוב? כי תנועה שהרבה משתתפים עומדים מאחוריה שונה מתנועה שקרתה כמעט בשקט — כמו שראיתם במסלול היסודות, במניה שסוחרים בה מעט גם פקודה קטנה מזיזה את המחיר. בהמשך המסלול תשתמשו בנפח כדי לשפוט תנועות מסוימות; כאן מספיק לדעת לקרוא את העמודות.',
          'Why does it matter? Because a move backed by many participants is different from one that happened almost quietly — as you saw in Foundations, in a thinly traded stock even a small order moves the price. Later in the track you will use volume to judge particular moves; here it is enough to be able to read the bars.')
      ],
      notesTitle: L('שאלות למחשבה', 'Questions to think about'),
      notes: [
        { tone: 'neutral', label: L('האם נר גדול תמיד מגיע עם נפח גדול?', 'Does a big candle always come with big volume?'),
          explanation: L('לא בהכרח. גודל הנר מודד כמה המחיר זז; גובה עמודת הנפח מודד כמה מניות נסחרו. אפשר לראות נר ארוך בנפח רגיל, ונר קטן בנפח עצום.', 'Not necessarily. The size of a candle measures how far price moved; the height of the volume bar measures how many shares traded. You can see a long candle on ordinary volume, and a small one on huge volume.') },
        { tone: 'neutral', label: L('ומה אומרת עמודה נמוכה במיוחד?', 'And what does an unusually short bar say?'),
          explanation: L('שבאותו יום היו מעט משתתפים — יום שקט. גם זה מידע: תנועה ביום כזה נשענת על מעט עסקאות.', 'That few people took part that day — a quiet day. That is information too: a move on such a day rests on few trades.') }
      ],
      work: { kind: 'charts', charts: [3] }
    }
  ],
  charts: T1_CHARTS,
  activity: {
    kind: 'chartChoice',
    prompt: L('באיזה יום נסחרו הרבה יותר מניות מהרגיל?', 'On which day did far more shares change hands than usual?'),
    candles: TRY,
    chartLabel: L('גרף נרות עם עמודות נפח, וארבעה ימים מסומנים באותיות, לבחירה', 'Candlestick chart with volume bars, and four days marked by letter, to choose from'),
    showVolume: true,
    target: L('היום עם הנפח החריג', 'the day with unusual volume'),
    marks: [
      { key: 'a', i1: TRY.marks.a, name: L('נר גדול בנפח רגיל', 'A big candle on ordinary volume'),
        why: L(`זה נר העלייה הגדול בגרף — אבל עמודת הנפח שלו רגילה (${share(volX(TRY, TRY.marks.a)).he}). גודל הנר מודד כמה המחיר זז, לא כמה מניות נסחרו.`, `This is the biggest up candle on the chart — but its volume bar is ordinary (${share(volX(TRY, TRY.marks.a)).en}). A candle's size measures how far price moved, not how many shares traded.`) },
      { key: 'b', i1: TRY.marks.b, name: L('יום שקט', 'A quiet day'),
        why: L(`זה יום שקט במיוחד: הנפח בו ${share(volX(TRY, TRY.marks.b)).he}, והמחיר כמעט לא זז. חריג — אבל בכיוון ההפוך: מעט מניות, לא הרבה.`, `This is an unusually quiet day: its volume is ${share(volX(TRY, TRY.marks.b)).en}, and price barely moved. Unusual — but the other way: few shares, not many.`) },
      { key: 'c', i1: TRY.marks.c, name: L(`נפח פי ${r1(tryX)} מהממוצע`, `Volume ${r1(tryX)}× the average`),
        why: L(`עמודת הנפח של היום הזה גבוהה פי ${r1(tryX)} מהממוצע, אף שהנר עצמו בגודל רגיל.`, `This day's volume bar is ${r1(tryX)} times the average, though the candle itself is ordinary.`) },
      { key: 'd', i1: TRY.marks.d, name: L('יום רגיל', 'An ordinary day'),
        why: L(`יום רגיל בשני המובנים: נר בגודל רגיל ונפח קרוב לממוצע (${share(volX(TRY, TRY.marks.d)).he}).`, `Ordinary both ways: an ordinary candle and volume close to the average (${share(volX(TRY, TRY.marks.d)).en}).`) }
    ],
    correct: 'c',
    right: L(`ביום ג׳ נסחרו פי ${r1(tryX)} מהנפח הממוצע — ובכל זאת הנר עצמו בגודל רגיל. את הנפח קוראים בעמודות שמתחת לגרף, לא לפי גודל הנר.`,
      `On day C, ${r1(tryX)} times the average volume traded — yet the candle itself is ordinary. Volume is read from the bars under the chart, not from the size of the candle.`)
  },
  apply: {
    id: 't1-apply', lesson: 'T1', category: 'technical', chart: 4,
    question: L('גרף חדש: העמודה הגבוהה ביותר נמצאת מתחת ליום שבו המחיר ירד. מה היא מספרת?', 'A new chart: the tallest volume bar sits under a day on which price fell. What does it tell you?'),
    options: [
      { key: 'a', text: L('שהמחיר יעלה מחר — נפח גבוה הוא סימן חיובי', 'That price will rise tomorrow — high volume is a good sign') },
      { key: 'b', text: L('שבאותו יום נסחרו הרבה יותר מניות מהרגיל בזמן שהמחיר ירד: הנפח מודד השתתפות, ואת הכיוון מראה המחיר', 'That far more shares than usual traded that day while price fell: volume measures participation; the price shows the direction') },
      { key: 'c', text: L('שהנפח באותו יום היה נמוך', 'That volume was low that day') },
      { key: 'd', text: L('שהבורסה עצרה את המסחר באותו יום', 'That the exchange halted trading that day') }
    ],
    correctKey: 'b',
    explanation: L(`באותו יום נסחרו פי ${r1(volX(AP, AP.markIdx))} מהממוצע, והמחיר ירד מ־${r1(AP[AP.markIdx - 1]!.c)} ל־${r1(AP[AP.markIdx]!.c)}. נפח גבוה לא אומר "טוב" או "רע" ולא מנבא את מחר — הוא אומר שהרבה אנשים השתתפו בירידה הזו.`,
      `That day ${r1(volX(AP, AP.markIdx))} times the average traded, and price fell from ${r1(AP[AP.markIdx - 1]!.c)} to ${r1(AP[AP.markIdx]!.c)}. High volume does not mean "good" or "bad" and does not forecast tomorrow — it says many people took part in this fall.`)
  },
  takeaway: {
    bottomLine: L('הזמן רץ משמאל לימין, כל נר הוא פרק זמן אחד, והעמודות שמתחת לגרף סופרות כמה מניות עברו יד. לפני שמסיקים משהו — בודקים את טווח הזמן ואת הטווח המוצג.',
      'Time runs left to right, each candle is one period, and the bars under the chart count how many shares changed hands. Before concluding anything, check the timeframe and the range on display.'),
    caveat: L('הציר האנכי לא מתחיל באפס, ולכן תנועות קוראים באחוזים. ונפח גבוה לא אומר לאן המחיר ילך — רק כמה אנשים השתתפו.',
      'The vertical axis does not start at zero, so moves are read in percent. And high volume does not say where price will go — only how many people took part.')
  },
  questions: [
    q('t1-weekly', 5,
      L('כל נר בגרף הזה הוא שבוע אחד. בערך כמה זמן הגרף מכסה?', 'Each candle on this chart is one week. Roughly how much time does the chart cover?'),
      [
        ['a', L(`${QW.length} ימים`, `${QW.length} days`)],
        ['b', L(`כחצי שנה — ${QW.length} שבועות`, `About half a year — ${QW.length} weeks`)],
        ['c', L(`${QW.length} שעות`, `${QW.length} hours`)],
        ['d', L('כשנתיים', 'About two years')]
      ], 'b',
      L(`סופרים נרות ומכפילים בטווח הזמן: ${QW.length} נרות שבועיים הם ${QW.length} שבועות — כחצי שנה. אותה תקופה בנר לכל יום הייתה נראית כ־${QW.length * 5} נרות.`,
        `Count the candles and multiply by the timeframe: ${QW.length} weekly candles are ${QW.length} weeks — about half a year. The same period with a candle per day would be about ${QW.length * 5} candles.`)),
    q('t1-volume', 6,
      L('ביום המסומן עמודת הנפח היא הגבוהה בגרף, והנר עצמו קטן. מה נכון?', 'On the marked day the volume bar is the tallest on the chart, and the candle itself is small. What is true?'),
      [
        ['a', L('באותו יום נסחרו הרבה יותר מניות מהרגיל, אף שהמחיר כמעט לא זז', 'Far more shares than usual traded that day, although price barely moved')],
        ['b', L('זה היום שבו המחיר זז הכי הרבה', 'That is the day price moved the most')],
        ['c', L('נפח גבוה מבטיח שהמחיר יעלה', 'High volume guarantees price will rise')],
        ['d', L('עמודות הנפח מראות את המחיר', 'The volume bars show the price')]
      ], 'a',
      L(`העמודה גבוהה פי ${r1(volX(QV, QV.markIdx))} מהממוצע, אבל המחיר באותו יום זז רק מ־${r1(QV[QV.markIdx]!.o)} ל־${r1(QV[QV.markIdx]!.c)}. נפח וגודל נר הם שני דברים נפרדים: אחד סופר מניות, השני מודד מחיר.`,
        `The bar is ${r1(volX(QV, QV.markIdx))} times the average, but price that day only moved from ${r1(QV[QV.markIdx]!.o)} to ${r1(QV[QV.markIdx]!.c)}. Volume and candle size are two separate things: one counts shares, the other measures price.`)),
    q('t1-scale', 7,
      L('בגרף, המחיר נראה כאילו טיפס מתחתית הגרף לראשו. בכמה הוא עלה בפועל?', 'On this chart, price looks as if it climbed from the bottom of the chart to the top. How much did it actually rise?'),
      [
        ['a', L('כמעט פי שניים', 'It almost doubled')],
        ['b', L(`כ־${r1(pct(qsFirst, qsLast))}%`, `About ${r1(pct(qsFirst, qsLast))}%`)],
        ['c', L('כ־50%', 'About 50%')],
        ['d', L('אי אפשר לדעת מגרף', "You can't tell from a chart")]
      ], 'b',
      L(`המחיר עלה מ־${r1(qsFirst)} ל־${r1(qsLast)} — כ־${r1(pct(qsFirst, qsLast))}%. הציר האנכי מתחיל קרוב ל־${Math.floor(qsLow)} ולא באפס, ולכן גם תנועה קטנה ממלאת את כל הגובה. קוראים את המספרים שבצד, לא את הגובה על המסך.`,
        `Price rose from ${r1(qsFirst)} to ${r1(qsLast)} — about ${r1(pct(qsFirst, qsLast))}%. The vertical axis starts near ${Math.floor(qsLow)}, not at zero, so even a small move fills the whole height. Read the numbers on the side, not the height on the screen.`))
  ]
};
