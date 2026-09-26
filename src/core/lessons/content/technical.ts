// ---------------------------------------------------------------------------
// Technical Analysis, lessons 2–5.
//
// Sources: the approved curriculum (titles, knowledge-base topics, step
// titles), the approved Artifact (T2's anatomy and "which is the hammer",
// T3's four-chart drill, T4's "mark the support", T5's "decide, then see"),
// and the previous build's authored text for T2/T4/T5 — kept in its own
// words where it appears here, and expanded around it.
//
// Rules this file follows (user brief, 2026-09-25):
//   - every step has its own purpose: understand → see → think → try →
//     feedback + apply → takeaway;
//   - observation is kept apart from interpretation, and no pattern or level
//     is taught as a prediction;
//   - every number in the prose is READ from the chart data it describes
//     (see the `r0`/`r1` calls), so a caption can never contradict its chart;
//   - no answer is shown before the learner acts: T5 teaches the breakout,
//     fakes and volume on charts that end before any retest, and the retest is
//     first revealed by the prediction (user decision 2026-09-25).
// ---------------------------------------------------------------------------
import type { Localized, QuizQuestion } from '@core/types/kb';
import type { LessonChartSpec } from '@core/charts/lessonCharts';
import { LESSON_CHARTS } from '@core/charts/lessonCharts';
import * as series from '@core/charts/series.js';
import type { Swing } from '@core/charts/series.js';
import { getQuizQuestions } from '@core/quiz/questions.js';
import { ACTIVITIES } from '../activities';
import type { ChartChoiceActivity, MarkLevelActivity, PredictActivity } from '../activities';
import type { LessonContent } from './types';

const L = (he: string, en: string): Localized => ({ he, en });
const r0 = (x: number) => String(Math.round(x));
const r1 = (x: number) => x.toFixed(1);
const r2 = (x: number) => x.toFixed(2);
const q = (id: string, lesson: string, difficulty: 'beginner' | 'intermediate', chart: number, question: Localized, options: Array<[string, Localized]>, correctKey: string, explanation: Localized): QuizQuestion => ({
  id, lesson, category: 'technical', difficulty, chart, question, options: options.map(([key, text]) => ({ key, text })), correctKey, explanation
});
/** The previous build's questions for a lesson — kept, after the new visual ones. */
const legacyQuestions = (legacyId: string) => (getQuizQuestions({}) as QuizQuestion[]).filter((x) => x.lesson === legacyId);

/** Swing points as chart dots, each named against the previous swing of its kind. */
function swingDots(swings: Swing[]) {
  return swings.map((s, i) => {
    const prev = [...swings.slice(0, i)].reverse().find((p) => p.type === s.type);
    const hi = s.type === 'high';
    const label = !prev ? (hi ? L('שיא', 'High') : L('שפל', 'Low'))
      : s.price > prev.price ? (hi ? L('שיא גבוה יותר', 'Higher high') : L('שפל גבוה יותר', 'Higher low'))
      : (hi ? L('שיא נמוך יותר', 'Lower high') : L('שפל נמוך יותר', 'Lower low'));
    // Highs gold, lows orange — the Artifact's pair (3.2); labels sit outside the candles.
    return { idx: s.idx, price: s.price, tone: hi ? 'gold' : 'ema20', labelDy: hi ? -8 : 20, label };
  });
}
const lows = (c: { swings: Swing[] }) => c.swings.filter((s) => s.type === 'low');
const highs = (c: { swings: Swing[] }) => c.swings.filter((s) => s.type === 'high');
const MARKED = L('הנר המסומן', 'The marked candle');

// ============================================================================
// T2 · Candlesticks: what one candle tells you
// ============================================================================
const T2C = series.T2_CONTEXT;
const hammer = T2C[T2C.hammerIdx]!, confirm = T2C[T2C.confirmIdx]!;
const T2_CHARTS: LessonChartSpec[] = [
  {
    candles: T2C,
    variant: 'price',
    options: {
      showVolume: false,
      highlights: [{ i1: T2C.hammerIdx, tone: 'gold', label: L('פטיש', 'Hammer') }],
      dots: [{ idx: T2C.confirmIdx, price: confirm.h, tone: 'bull', labelAlign: 'left', label: L('סגירה מעל שיא הפטיש', "Close above the hammer's high") }]
    },
    label: L(`גרף נרות בירידה, ואחריו נר עם גוף קטן למעלה וצל תחתון ארוך עד ${r0(hammer.l)}; הנר שאחריו נסגר ב־${r1(confirm.c)}, מעל השיא שלו`,
      `A falling candlestick chart, then a candle with a small body on top and a long lower shadow down to ${r0(hammer.l)}; the next candle closes at ${r1(confirm.c)}, above its high`),
    caption: L('פטיש בסוף ירידה — ונר האישור', 'A hammer after a decline — and the confirming candle'),
    subcaption: L('נתוני הדגמה.', 'Demo data.'),
    tone: 'bull',
    height: 360
  },
  ...LESSON_CHARTS.l4!,
  {
    candles: series.T2_APPLY,
    variant: 'price',
    options: { showVolume: false, highlights: [{ i1: series.T2_APPLY.markIdx, tone: 'gold', label: MARKED }] },
    label: L('גרף נרות בעלייה, ובראשה נר עם גוף קטן למעלה וצל תחתון ארוך', 'A rising candlestick chart with, at its top, a candle with a small body at the top and a long lower shadow'),
    caption: L('גרף חדש', 'A new chart'),
    tone: 'neutral',
    height: 260
  },
  {
    candles: series.T2_Q_STAR,
    variant: 'price',
    options: { showVolume: false, highlights: [{ i1: series.T2_Q_STAR.markIdx, tone: 'gold', label: MARKED }] },
    label: L('גרף נרות בעלייה, ובראשה נר עם גוף קטן למטה וצל עליון ארוך', 'A rising candlestick chart with, at its top, a candle with a small body at the bottom and a long upper shadow'),
    caption: L('הנר המסומן', 'The marked candle'),
    tone: 'neutral',
    height: 300
  },
  {
    candles: series.T2_Q_DOJI,
    variant: 'price',
    options: { showVolume: false, highlights: [{ i1: series.T2_Q_DOJI.markIdx, tone: 'gold', label: MARKED }] },
    label: L('גרף נרות בעלייה, ובראשה נר שהפתיחה והסגירה שלו כמעט זהות, עם צללים לשני הכיוונים', 'A rising candlestick chart with, at its top, a candle whose open and close are almost the same, with shadows both ways'),
    caption: L('הנר המסומן', 'The marked candle'),
    tone: 'neutral',
    height: 300
  },
  {
    candles: series.T2_Q_BEARE,
    variant: 'price',
    options: { showVolume: false, highlights: [{ i1: series.T2_Q_BEARE.markIdx, i2: series.T2_Q_BEARE.markIdx2, tone: 'gold', label: L('הזוג המסומן', 'The marked pair') }] },
    label: L('גרף נרות בעלייה, ובראשה נר ירוק קטן ואחריו נר אדום שגופו מכסה את כל גוף הנר הירוק', 'A rising candlestick chart with, at its top, a small green candle followed by a red one whose body covers the whole green body'),
    caption: L('הזוג המסומן', 'The marked pair'),
    tone: 'neutral',
    height: 300
  }
];
// Chart indexes: 0 context · 1–5 the five patterns · 6 apply · 7–9 questions.

export const T2: LessonContent = {
  id: 'T2',
  tutor: { topic: 'candlestick-patterns', label: L('נרות יפניים', 'candlesticks') },
  teach: [
    {
      heading: L('מה נר בודד מספר?', 'What does one candle tell you?'),
      paragraphs: [
        L('גרף נרות מצייר כל פרק זמן — יום, שעה או שבוע — כנר אחד. כל נר עונה על ארבע שאלות על אותו פרק זמן: באיזה מחיר המסחר נפתח, באיזה מחיר הוא נסגר, ומה היו המחיר הגבוה והמחיר הנמוך בדרך.',
          'A candlestick chart draws each period — a day, an hour, a week — as one candle. Every candle answers four questions about that period: where trading opened, where it closed, and the highest and lowest prices along the way.'),
        L('החלק העבה הוא הגוף: הוא נמתח בין מחיר הפתיחה למחיר הסגירה. נר ירוק נסגר מעל הפתיחה — המחיר עלה במהלכו; נר אדום נסגר מתחתיה. הקווים הדקים שמעל ומתחת לגוף הם הצללים (יש שקוראים להם פתילים): הם מראים עד לאן המחיר הגיע, גם אם לא נשאר שם. בנר הירוק שבדוגמה המסחר נפתח ב־100, טיפס עד 108, ירד עד 98 ונסגר ב־106.',
          'The thick part is the body: it spans from the open to the close. A green candle closed above its open — price rose during it; a red one closed below its open. The thin lines above and below the body are the shadows (some call them wicks): they show how far price reached, even if it did not stay there. In the green candle here, trading opened at 100, climbed as high as 108, dipped to 98 and closed at 106.'),
        L('אבל אותו נר יכול לספר סיפורים שונים. תבנית נרות משמעותית רק בהקשר — היכן היא נמצאת ביחס למגמה, ומה קורה למחיר מיד אחריה. צל תחתון ארוך אחרי ירידה ממושכת אומר משהו אחר מאותו צל באמצע דשדוש שקט.',
          'Yet the same candle can tell different stories. A candlestick pattern is only meaningful in context — where it sits after a trend, and what happens to price right after. A long lower shadow after a long decline says something different from the same shadow in the middle of a quiet sideways stretch.')
      ],
      work: { kind: 'diagram', diagram: {
        type: 'candles',
        title: L('מבנה של נר', 'Anatomy of a candle'),
        candles: [
          { o: 100, h: 108, l: 98, c: 106, name: L('נר ירוק', 'Green candle'), note: L('נסגר מעל הפתיחה', 'Closed above its open') },
          { o: 106, h: 107, l: 97, c: 100, name: L('נר אדום', 'Red candle'), note: L('נסגר מתחת לפתיחה', 'Closed below its open') }
        ],
        caption: L('הגוף: בין הפתיחה לסגירה. הצללים: עד לאן המחיר הגיע.', 'The body: open to close. The shadows: how far price reached.')
      } }
    },
    {
      heading: L('מה הפטיש הזה באמת אומר?', 'What does this hammer actually say?'),
      paragraphs: [
        L(`הנה נר שכדאי להכיר: הפטיש. יש לו גוף קטן בקרבת הקצה העליון, צל תחתון ארוך — לפחות פי שניים מהגוף — וכמעט בלי צל עליון, והוא מופיע בדרך כלל בסוף ירידה. בגרף, אחרי ירידה מאזור ${r0(T2C[0]!.o)} לאזור ${r0(hammer.o)}, נר אחד צנח עד ${r0(hammer.l)} ובכל זאת נסגר ב־${r1(hammer.c)}, ממש ליד השיא שלו.`,
          `Here is a candle worth knowing: the hammer. It has a small body near the top, a long lower shadow — at least twice the body — and little or no upper shadow, and it usually appears at the end of a decline. On the chart, after a slide from around ${r0(T2C[0]!.o)} to around ${r0(hammer.o)}, one candle dropped as low as ${r0(hammer.l)} and still closed at ${r1(hammer.c)}, right by its high.`),
        L(`כדאי להפריד בין מה שרואים לבין מה שמסיקים. מה שרואים: במהלך הנר המוכרים הורידו את המחיר עד ${r0(hammer.l)}, ועד הסגירה הקונים החזירו את כל הירידה ויותר. מה שאפשר להסיק: ייתכן שלחץ המכירה נחלש — ייתכן. זו פרשנות, לא עובדה.`,
          `Keep what you see apart from what you conclude. What you see: during the candle sellers pushed price down to ${r0(hammer.l)}, and by the close buyers had taken back the whole drop and more. What you might conclude: the selling pressure may be fading — may. That is an interpretation, not a fact.`),
        L(`נר אחד הוא רמז, לא הוכחה. פטיש או בליעה מתארים מה שקרה במהלך מפגש אחד או שניים — זו לא ערובה לגבי מחר. רוב הסוחרים המנוסים מתייחסים לתבנית נר בודדת כמשהו לחכות לאישור עליו בנר הבא או השניים הבאים, לא כמשהו לפעול לפיו בפני עצמו. כאן האישור הגיע בנר שאחריו: הוא נסגר ב־${r1(confirm.c)}, מעל השיא של הפטיש (${r1(hammer.h)}).`,
          `One candle is a hint, not proof. A hammer or an engulfing pattern describes what happened during one or two sessions — it isn't a guarantee about tomorrow. Most experienced traders treat a single candlestick pattern as something to watch for confirmation on the next candle or two, not something to act on by itself. Here the confirmation came on the very next candle: it closed at ${r1(confirm.c)}, above the hammer's high of ${r1(hammer.h)}.`)
      ],
      callouts: [{ kind: 'caveat', lead: L('שימו לב', 'Watch out'), text: L(
        'אישור לא הופך את זה לוודאות — הוא רק מוסיף ראיה. יש פטישים שמגיע אחריהם נר מאשר, והירידה בכל זאת ממשיכה.',
        'Confirmation does not make it a certainty — it only adds evidence. Some hammers are followed by a confirming candle and the decline still carries on.') }],
      work: { kind: 'charts', charts: [0] }
    },
    {
      heading: L('חמש צורות שכדאי לזהות', 'Five shapes worth recognising'),
      paragraphs: [
        L('הפטיש הוא אחת מחמש צורות שחוזרות שוב ושוב. הכוכב הנופל הוא תמונת המראה שלו: גוף קטן למטה וצל עליון ארוך, בסוף עלייה — המחיר טיפס במהלך הנר, והמוכרים הורידו אותו חזרה עד הסגירה. בדוג׳י הפתיחה והסגירה כמעט זהות, כך שכמעט אין גוף: אף צד לא הכריע.',
          'The hammer is one of five shapes that come up again and again. The shooting star is its mirror image: a small body at the bottom and a long upper shadow, after a rise — price climbed during the candle and sellers pushed it back down by the close. In a doji the open and close are almost the same, so there is barely a body: neither side won.'),
        L('"בליעה עולה" היא זוג נרות: נר אדום קטן, ואחריו נר ירוק שגופו מכסה לחלוטין את כל הטווח של הנר הראשון — פתיחה מתחת לסגירה הקודמת וסגירה מעל הפתיחה הקודמת. הפכו את הצבעים והתזמון (אחרי עלייה, לא ירידה) ותקבלו בליעה יורדת.',
          '"Bullish engulfing" is a pair of candles: a small red one, followed by a green one whose body fully covers the first candle\'s entire range — opening below its prior close and closing above its prior open. Flip the colours and the timing (after a rise, not a decline) and you get bearish engulfing.'),
        L('שימו לב מה משותף לכולן: אף אחת מהן לא מוגדרת רק לפי הצורה. פטיש באמצע עלייה הוא כבר לא אותו סימן, ובליעה עולה בלי ירידה לפניה לא "הופכת" שום דבר.',
          'Notice what they share: none of them is defined by shape alone. A hammer in the middle of a rise is no longer the same signal, and a bullish engulfing with no decline before it has nothing to "turn".')
      ],
      notesTitle: L('שאלות למחשבה', 'Questions to think about'),
      notes: [
        { tone: 'neutral', label: L('למה כוכב נופל נחשב אזהרה דווקא בסוף עלייה?', 'Why is a shooting star a warning only after a rise?'),
          explanation: L('כי שם הוא מראה שהקונים דחפו לשיא חדש — והמוכרים מחקו את כל התנועה עד הסגירה. באמצע ירידה, אותו צל עליון רק מתאר עוד ניסיון עלייה שלא הצליח.', 'Because there it shows buyers pushing to a new high — and sellers erasing the whole move by the close. In the middle of a decline, the same upper shadow only describes one more rally attempt that failed.') },
        { tone: 'neutral', label: L('מה ההבדל בין דוג׳י לפטיש?', 'How is a doji different from a hammer?'),
          explanation: L('לדוג׳י כמעט אין גוף, והצללים יכולים להיות לשני הכיוונים — חוסר הכרעה. לפטיש יש גוף קטן למעלה וצל תחתון ארוך — ירידה שנדחתה.', 'A doji has almost no body, and its shadows can go both ways — indecision. A hammer has a small body on top and a long lower shadow — a drop that was rejected.') }
      ],
      work: { kind: 'charts', charts: [1, 2, 3, 4, 5] }
    }
  ],
  charts: T2_CHARTS,
  activity: ACTIVITIES.l4 as ChartChoiceActivity,
  apply: {
    id: 't2-apply', lesson: 'T2', category: 'technical', chart: 6,
    question: L('גרף חדש: הנר המסומן נראה בדיוק כמו פטיש — גוף קטן למעלה וצל תחתון ארוך. האם זה סימן הפטיש שלמדנו?', 'A new chart: the marked candle looks exactly like a hammer — a small body on top and a long lower shadow. Is this the hammer signal you learned?'),
    options: [
      { key: 'a', text: L('כן — הצורה היא העיקר', 'Yes — the shape is what counts') },
      { key: 'b', text: L('לא בדיוק: הוא מופיע אחרי עלייה, כך שאין כאן ירידה ש"נדחתה"', "Not really: it comes after a rise, so there is no decline being rejected") },
      { key: 'c', text: L('זה דוג׳י', "It's a doji") },
      { key: 'd', text: L('זו בליעה עולה', "It's a bullish engulfing") }
    ],
    correctKey: 'b',
    explanation: L('פטיש מוגדר גם לפי המקום: בסוף ירידה. לאותה צורה בראש עלייה יש אפילו שם אחר — "איש תלוי" — ואם בכלל, היא נקראת כאזהרה ולא כסימן להתאוששות. צורה בלי הקשר לא אומרת הרבה.',
      'A hammer is defined by its place too: at the end of a decline. The same shape at the top of a rise even has another name — a "hanging man" — and if anything it reads as a warning, not a sign of recovery. A shape without context says little.')
  },
  takeaway: {
    bottomLine: L('נר מראה ארבעה מחירים — פתיחה, סגירה, גבוה ונמוך — וצורות כמו פטיש, כוכב נופל, דוג׳י ובליעה מספרות מי שלט במהלך פרק הזמן.',
      'A candle shows four prices — open, close, high and low — and shapes like the hammer, shooting star, doji and engulfing tell you who was in control during the period.'),
    caveat: L('נר אחד הוא רמז, לא הוכחה: הצורה נקראת רק בהקשר של המגמה שלפניה, ומחכים לאישור בנר הבא או השניים הבאים.',
      'One candle is a hint, not proof: the shape only reads in the context of the trend before it, and you wait for confirmation on the next candle or two.')
  },
  questions: [
    q('t2-star', 'T2', 'beginner', 7,
      L('מה מספר הצל העליון הארוך של הנר המסומן, שמופיע אחרי עלייה?', 'What does the long upper shadow of the marked candle, after a rise, tell you?'),
      [
        ['a', L('שהמחיר נסגר בשיא של הנר', 'That price closed at the top of the candle')],
        ['b', L('שבמהלך הנר המחיר טיפס גבוה, אבל עד הסגירה המוכרים הורידו אותו חזרה', 'That price climbed high during the candle, but sellers pushed it back down by the close')],
        ['c', L('שהמסחר נעצר באמצע', 'That trading stopped halfway through')],
        ['d', L('שהנר הבא בטוח יהיה אדום', 'That the next candle is sure to be red')]
      ], 'b',
      L('הצל מראה עד לאן המחיר הגיע; הגוף הקטן למטה מראה איפה הוא נגמר. זה כוכב נופל: הקונים דחפו, והמוכרים מחקו. סימן לשים לב אליו — לא הבטחה לגבי הנר הבא.',
        'The shadow shows how far price reached; the small body at the bottom shows where it ended. This is a shooting star: buyers pushed, sellers erased. A sign to notice — not a promise about the next candle.')),
    q('t2-doji', 'T2', 'beginner', 8,
      L('בנר המסומן הפתיחה והסגירה כמעט זהות. מה זה אומר על הנר הזה?', 'In the marked candle the open and close are almost the same. What does that say about it?'),
      [
        ['a', L('שהקונים ניצחו בגדול', 'That buyers won big')],
        ['b', L('שאף צד לא הכריע — זה דוג׳י, סימן לחוסר הכרעה', "That neither side won — it's a doji, a sign of indecision")],
        ['c', L('שהמגמה התהפכה בוודאות', 'That the trend has certainly reversed')],
        ['d', L('שלא היה מסחר באותו יום', 'That there was no trading that day')]
      ], 'b',
      L('גוף כמעט אפסי אומר שאחרי כל התנודות, המחיר נסגר כמעט במקום שבו נפתח. אחרי עלייה זה יכול לרמז שהקונים איבדו תנופה — אבל דוג׳י לבד לא אומר לאן המחיר ימשיך.',
        'An almost empty body says that after all the swings, price closed almost where it opened. After a rise that can hint that buyers lost momentum — but a doji on its own does not say where price goes next.')),
    q('t2-bearish', 'T2', 'intermediate', 9,
      L('איזו תבנית מסומנת כאן, אחרי העלייה?', 'Which pattern is marked here, after the rise?'),
      [
        ['a', L('בליעה עולה', 'Bullish engulfing')],
        ['b', L('בליעה יורדת', 'Bearish engulfing')],
        ['c', L('פטיש', 'Hammer')],
        ['d', L('דוג׳י', 'Doji')]
      ], 'b',
      L('נר ירוק קטן, ואחריו נר אדום שגופו מכסה את כל גוף הנר הירוק: נפתח מעל הסגירה שלו ונסגר מתחת לפתיחה שלו. זו בליעה יורדת — והיא מגיעה אחרי עלייה, ההקשר שבו היא נחשבת אזהרה.',
        'A small green candle, then a red one whose body covers the whole green body: it opens above the green close and closes below the green open. That is bearish engulfing — and it comes after a rise, the context in which it counts as a warning.')),
    ...legacyQuestions('l4')
  ]
};

// ============================================================================
// T3 · Trend: up, down or sideways
// ============================================================================
const UP = series.T3_UP, PULL = series.T3_PULL, SIDE = series.T3_SIDE, BRK = series.T3_BREAK;
const [pullLow1, pullLow2] = lows(PULL), pullHigh = highs(PULL)[0]!;
const [brkLow1, brkLow2, brkLow3] = lows(BRK);
const T3_CHARTS: LessonChartSpec[] = [
  {
    candles: UP,
    variant: 'price',
    options: { showVolume: false, dots: swingDots(UP.swings) },
    label: L(`גרף במגמה עולה: השפלים עולים מ־${r0(lows(UP)[0]!.price)} ל־${r0(lows(UP)[1]!.price)} ול־${r0(lows(UP)[2]!.price)}, והשיאים מ־${r0(highs(UP)[0]!.price)} ל־${r0(highs(UP)[1]!.price)} ול־${r0(highs(UP)[2]!.price)}`,
      `An uptrend: the lows climb from ${r0(lows(UP)[0]!.price)} to ${r0(lows(UP)[1]!.price)} and ${r0(lows(UP)[2]!.price)}, and the highs from ${r0(highs(UP)[0]!.price)} to ${r0(highs(UP)[1]!.price)} and ${r0(highs(UP)[2]!.price)}`),
    caption: L('שיאים ושפלים גבוהים יותר', 'Higher highs and higher lows'),
    subcaption: L('נתוני הדגמה.', 'Demo data.'),
    tone: 'bull',
    height: 400
  },
  {
    candles: PULL,
    variant: 'price',
    options: {
      showVolume: false,
      dots: swingDots(PULL.swings),
      segments: [{ x1: pullLow1!.idx, y1: pullLow1!.price, x2: PULL.length - 1, y2: pullLow1!.price, tone: 'text', dash: [5, 4], labelAt: 'end', labelAlign: 'right', labelDy: 16, label: L('השפל הקודם', 'The previous low') }]
    },
    label: L(`גרף עולה עם ירידה חדה מ־${r0(pullHigh.price)} ל־${r1(pullLow2!.price)}, שנעצרת מעל השפל הקודם ב־${r0(pullLow1!.price)}, ואחריה שיא חדש`,
      `A rising chart with a sharp drop from ${r0(pullHigh.price)} to ${r1(pullLow2!.price)}, which stops above the previous low at ${r0(pullLow1!.price)}, followed by a new high`),
    caption: L('ירידה חדה — ושפל גבוה יותר', 'A sharp drop — and a higher low'),
    subcaption: L('נתוני הדגמה.', 'Demo data.'),
    tone: 'bull',
    height: 400
  },
  {
    candles: UP,
    variant: 'price',
    options: { showVolume: false },
    label: L('גרף במגמה עולה', 'An uptrend'),
    caption: L('עולה', 'Up'),
    subcaption: L('שיאים ושפלים גבוהים יותר.', 'Higher highs and higher lows.'),
    tone: 'bull',
    height: 300
  },
  {
    candles: series.T3_DOWN,
    variant: 'price',
    options: { showVolume: false },
    label: L('גרף במגמה יורדת: שיאים נמוכים יותר ושפלים נמוכים יותר', 'A downtrend: lower highs and lower lows'),
    caption: L('יורדת', 'Down'),
    subcaption: L('שיאים ושפלים נמוכים יותר.', 'Lower highs and lower lows.'),
    tone: 'bear',
    height: 300
  },
  {
    candles: SIDE,
    variant: 'price',
    options: {
      showVolume: false,
      zones: [
        { range: SIDE.ceiling, tone: 'resistance', label: L('תקרה', 'Ceiling') },
        { range: SIDE.floor, tone: 'support', label: L('רצפה', 'Floor') }
      ]
    },
    label: L(`גרף בדשדוש בין תקרה בסביבות ${r0(SIDE.ceiling[0])}–${r0(SIDE.ceiling[1])} לרצפה בסביבות ${r0(SIDE.floor[0])}–${r0(SIDE.floor[1])}`,
      `A sideways chart between a ceiling around ${r0(SIDE.ceiling[0])}–${r0(SIDE.ceiling[1])} and a floor around ${r0(SIDE.floor[0])}–${r0(SIDE.floor[1])}`),
    caption: L('דשדוש', 'Sideways'),
    subcaption: L('בין תקרה לרצפה.', 'Between a ceiling and a floor.'),
    tone: 'neutral',
    height: 300
  },
  {
    candles: BRK,
    variant: 'price',
    options: {
      showVolume: false,
      segments: [{ x1: brkLow2!.idx, y1: brkLow2!.price, x2: BRK.length - 1, y2: brkLow2!.price, tone: 'text', dash: [5, 4], labelAt: 'end', labelAlign: 'right', labelDy: -6, label: L('השפל הקודם', 'The previous low') }]
    },
    label: L(`גרף שעולה בשיאים ושפלים גבוהים יותר, ואז יורד לשפל ב־${r0(brkLow3!.price)}, מתחת לשפל הקודם ב־${r0(brkLow2!.price)}`,
      `A chart rising in higher highs and lows, then falling to a low at ${r0(brkLow3!.price)}, below the previous low at ${r0(brkLow2!.price)}`),
    caption: L('גרף חדש', 'A new chart'),
    tone: 'neutral',
    height: 260
  },
  { candles: series.T3_Q_DOWN, variant: 'price', options: { showVolume: false }, label: L('גרף מחיר לשאלה', 'Price chart for the question'), caption: L('מה המגמה?', "What's the trend?"), tone: 'neutral', height: 300 },
  { candles: series.T3_Q_SIDE, variant: 'price', options: { showVolume: false }, label: L('גרף מחיר לשאלה', 'Price chart for the question'), caption: L('מה המגמה?', "What's the trend?"), tone: 'neutral', height: 300 },
  { candles: series.T3_Q_UPRED, variant: 'price', options: { showVolume: false }, label: L('גרף מחיר לשאלה, שהנר האחרון בו הוא נר אדום גדול', 'Price chart for the question, whose last candle is a large red one'), caption: L('מה המגמה?', "What's the trend?"), tone: 'neutral', height: 300 }
];
// Chart indexes: 0 highs & lows · 1 the sharp pullback · 2–4 up / down / sideways · 5 apply · 6–8 questions.
const QD = series.T3_Q_DOWN, QS = series.T3_Q_SIDE, QU = series.T3_Q_UPRED;

export const T3: LessonContent = {
  id: 'T3',
  tutor: { topic: 'trend', label: L('מגמה', 'trends') },
  teach: [
    {
      heading: L('מגמה נקראת לפי השיאים והשפלים', 'A trend is read from its highs and lows'),
      paragraphs: [
        L('מחיר כמעט אף פעם לא נע בקו ישר. הוא מתקדם בגלים: עולה, נסוג, ועולה שוב. לכל נקודת מפנה בדרך יש שם — שיא הוא נקודה שהמחיר עלה אליה ומשם ירד, ושפל הוא נקודה שהמחיר ירד אליה ומשם עלה.',
          'Price almost never moves in a straight line. It travels in waves: up, back, and up again. Every turning point on the way has a name — a high is where price rose to and then turned down, and a low is where it fell to and then turned up.'),
        L(`מגמה עולה היא רצף שבו כל שיא גבוה מהשיא הקודם, וכל שפל גבוה מהשפל הקודם. בגרף, השפלים עולים מכ־${r0(lows(UP)[0]!.price)} לכ־${r0(lows(UP)[1]!.price)} ואחר כך לכ־${r0(lows(UP)[2]!.price)}, והשיאים מכ־${r0(highs(UP)[0]!.price)} לכ־${r0(highs(UP)[1]!.price)} ולכ־${r0(highs(UP)[2]!.price)}.`,
          `An uptrend is a sequence in which every high is above the previous high and every low is above the previous low. On the chart the lows climb from about ${r0(lows(UP)[0]!.price)} to about ${r0(lows(UP)[1]!.price)} and then ${r0(lows(UP)[2]!.price)}, and the highs from about ${r0(highs(UP)[0]!.price)} to ${r0(highs(UP)[1]!.price)} and ${r0(highs(UP)[2]!.price)}.`),
        L('מגמה יורדת היא ההפך: שיאים נמוכים יותר ושפלים נמוכים יותר. וכשהשיאים נעצרים שוב ושוב בערך באותו גובה, וגם השפלים — המחיר בדשדוש, בלי מגמה.',
          'A downtrend is the reverse: lower highs and lower lows. And when the highs keep stopping at about the same height, and the lows too, price is moving sideways, with no trend.')
      ],
      work: { kind: 'charts', charts: [0] }
    },
    {
      heading: L('למה דווקא השפלים חשובים?', 'Why do the lows matter so much?'),
      paragraphs: [
        L('שפל גבוה יותר מספר משהו על הקונים: בכל פעם שהמחיר נסוג, קונים נכנסו מוקדם יותר — במחיר גבוה יותר מבפעם הקודמת. שיא גבוה יותר מספר שהם גם היו מוכנים לשלם יותר מקודם. כל עוד שני הדברים קורים, המגמה נמשכת.',
          'A higher low says something about buyers: each time price pulled back, buyers stepped in sooner — at a higher price than the time before. A higher high says they were also willing to pay more than before. As long as both keep happening, the trend continues.'),
        L(`לכן ירידה חדה לבדה לא שוברת מגמה עולה. בגרף המחיר צנח מכ־${r0(pullHigh.price)} לכ־${r1(pullLow2!.price)} — ירידה של יותר מ־10% — ובכל זאת השפל החדש נשאר מעל השפל הקודם (כ־${r0(pullLow1!.price)}). מבנה המגמה נשאר שלם, והמחיר המשיך לשיא חדש.`,
          `That is why a sharp drop on its own does not break an uptrend. On the chart price fell from about ${r0(pullHigh.price)} to about ${r1(pullLow2!.price)} — more than 10% — yet the new low stayed above the previous low (about ${r0(pullLow1!.price)}). The trend structure held, and price went on to a new high.`),
        L('מה כן מערער את המבנה? שפל נמוך מהשפל הקודם. זה עדיין לא אומר שהמגמה התהפכה — אבל זה הסימן הראשון שהקונים כבר לא נכנסים מוקדם כמו קודם.',
          'What does undermine it? A low below the previous low. That still does not mean the trend has reversed — but it is the first sign that buyers are no longer stepping in as early as they were.')
      ],
      callouts: [{ kind: 'example', lead: L('מה רואים ומה מסיקים', 'What you see, what you conclude'), text: L(
        `רואים: שפל בכ־${r1(pullLow2!.price)}, מעל השפל הקודם בכ־${r0(pullLow1!.price)}. מסיקים: הקונים עדיין נכנסים מוקדם — המגמה העולה שלמה, בינתיים. "בינתיים" הוא חלק מהמשפט.`,
        `You see: a low at about ${r1(pullLow2!.price)}, above the previous low at about ${r0(pullLow1!.price)}. You conclude: buyers are still stepping in early — the uptrend is intact, for now. "For now" is part of the sentence.`) }],
      work: { kind: 'charts', charts: [1] }
    },
    {
      heading: L('שלוש תמונות, ומה כל אחת אומרת', 'Three pictures, and what each one says'),
      paragraphs: [
        L(`עולה: שיאים ושפלים גבוהים יותר. יורדת: שיאים ושפלים נמוכים יותר. דשדוש: המחיר נע בין תקרה לרצפה — השיאים נעצרים בערך באותו גובה, וגם השפלים. בדשדוש שבגרף, התקרה בסביבות ${r0(SIDE.ceiling[0])}–${r0(SIDE.ceiling[1])} והרצפה בסביבות ${r0(SIDE.floor[0])}–${r0(SIDE.floor[1])}.`,
          `Up: higher highs and higher lows. Down: lower highs and lower lows. Sideways: price moves between a ceiling and a floor — the highs stop at about the same height, and so do the lows. In the sideways chart the ceiling is around ${r0(SIDE.ceiling[0])}–${r0(SIDE.ceiling[1])} and the floor around ${r0(SIDE.floor[0])}–${r0(SIDE.floor[1])}.`),
        L('מגמה תלויה גם בטווח הזמן שמסתכלים עליו. אותה מניה יכולה להיות במגמה עולה בגרף שבועי ובירידה בגרף יומי — שני התיאורים נכונים, כל אחד בקנה המידה שלו. לכן שווה לומר "מגמה עולה בגרף היומי", ולא רק "מגמה עולה".',
          'A trend also depends on the timeframe you look at. The same stock can be in an uptrend on a weekly chart and falling on a daily one — both descriptions are right, each on its own scale. So it is worth saying "an uptrend on the daily chart", not just "an uptrend".'),
        L('כשמדד שלם נמצא במגמה עולה ארוכה, קוראים לזה שוק שורי; כשהוא יורד לאורך זמן — בדרך כלל ירידה של 20% ויותר מהשיא — שוק דובי. אלה אותם רעיונות של שיאים ושפלים, רק על השוק כולו ולאורך חודשים ושנים.',
          'When a whole index is in a long uptrend, it is called a bull market; when it falls over a long stretch — usually 20% or more from its peak — a bear market. They are the same ideas of highs and lows, applied to the whole market over months and years.')
      ],
      notesTitle: L('שאלות למחשבה', 'Questions to think about'),
      notes: [
        { tone: 'neutral', label: L('האם הנר האחרון מספיק כדי לקבוע מגמה?', 'Is the last candle enough to call a trend?'),
          explanation: L('לא. גם במגמה עולה יש נרות אדומים ונסיגות — הם חלק מהגלים. המגמה נקבעת לפי רצף השיאים והשפלים, לא לפי הנר האחרון.', 'No. An uptrend has red candles and pullbacks too — they are part of the waves. The trend is set by the sequence of highs and lows, not by the last candle.') },
        { tone: 'neutral', label: L('למה גם דשדוש הוא מידע?', 'Why is a sideways market information too?'),
          explanation: L('כי הוא אומר שכרגע אף צד לא שולט. התקרה והרצפה עצמן הופכות לרמות שעוקבים אחריהן — הנושא של השיעור הבא.', 'Because it says neither side is in control right now. The ceiling and floor themselves become levels to watch — the subject of the next lesson.') }
      ],
      work: { kind: 'charts', charts: [2, 3, 4] }
    }
  ],
  charts: T3_CHARTS,
  activity: {
    kind: 'classify',
    prompt: L('מיינו את ארבעת הגרפים', 'Sort the four charts'),
    sub: L('מגמה נקבעת לפי השיאים והשפלים, לא לפי הנר האחרון. אחרי כל תשובה יסומנו על הגרף השיאים והשפלים שקובעים אותה.',
      'A trend is set by the highs and lows, not by the last candle. After each answer, the highs and lows that decide it are marked on the chart.'),
    rules: [
      { tone: 'var(--info)', label: L('עולה: שיאים ושפלים גבוהים יותר', 'Up: higher highs and lows') },
      { tone: 'var(--risk)', label: L('יורדת: שיאים ושפלים נמוכים יותר', 'Down: lower highs and lows') },
      { tone: 'var(--text-muted)', label: L('דשדוש: בין תקרה לרצפה', 'Sideways: between a ceiling and a floor') }
    ],
    options: [
      { key: 'up', label: L('עולה', 'Up') },
      { key: 'down', label: L('יורדת', 'Down') },
      { key: 'side', label: L('דשדוש', 'Sideways') }
    ],
    // The Artifact's four charts (board 3.2), point for point.
    items: [
      { id: 'a', name: L('קו שמטפס בגלים', 'A line climbing in waves'), answer: 'up', points: [[10, 150], [70, 100], [120, 125], [190, 70], [240, 95], [310, 40], [350, 60], [390, 28]],
        why: L('כל שיא גבוה מהקודם, וכל שפל גבוה מהקודם. זו מגמה עולה קלאסית.', 'Every high is above the last, and every low is above the last. A classic uptrend.') },
      { id: 'b', name: L('קו שחוזר שוב ושוב לאותם גבהים', 'A line returning to the same heights'), answer: 'side', band: [54, 126], points: [[10, 110], [60, 56], [115, 124], [170, 52], [225, 128], [280, 58], [335, 122], [390, 84]],
        why: L('השיאים נעצרים כמעט באותו גובה, וכך גם השפלים. המחיר נע בין תקרה לרצפה — דשדוש.', 'The highs stop at almost the same height, and so do the lows. Price moves between a ceiling and a floor — sideways.') },
      { id: 'c', name: L('קו עולה עם ירידה חדה אחת', 'A rising line with one sharp drop'), answer: 'up', points: [[10, 152], [80, 92], [130, 118], [200, 48], [250, 104], [320, 36], [360, 58], [390, 30]],
        why: L('הירידה החדה מבלבלת, אבל השפל שלה עדיין גבוה מהשפל הקודם. כל עוד זה כך, המגמה העולה לא נשברה.', 'The sharp drop is confusing, but its low is still above the previous low. As long as that holds, the uptrend is not broken.') },
      { id: 'd', name: L('קו שיורד בגלים', 'A line falling in waves'), answer: 'down', points: [[10, 30], [70, 90], [120, 66], [190, 116], [240, 96], [310, 146], [350, 126], [390, 160]],
        why: L('שיאים נמוכים יותר ושפלים נמוכים יותר — מגמה יורדת.', 'Lower highs and lower lows — a downtrend.') }
    ],
    right: L('ארבעת הגרפים נקראו לפי המבנה — השיאים והשפלים — ולא לפי הנר האחרון או הירידה החדה ביותר.', 'All four charts were read by their structure — the highs and lows — not by the last candle or the sharpest drop.'),
    explain: [
      L('גרף ג׳ הוא המלכודת: הירידה החדה בו מבלבלת, אבל השפל שלה עדיין גבוה מהשפל הקודם. כך קוראים מגמה — משווים כל שפל לשפל שלפניו, וכל שיא לשיא שלפניו.',
        'Chart C is the trap: its sharp drop is confusing, but its low is still above the low before it. That is how a trend is read — each low against the low before it, each high against the high before it.'),
      L('בדשדוש (גרף ב׳) אין שיאים גבוהים יותר ואין שפלים נמוכים יותר: המחיר חוזר שוב ושוב לאותה תקרה ולאותה רצפה.',
        'In the sideways chart (B) there are no higher highs and no lower lows: price keeps returning to the same ceiling and the same floor.')
    ]
  },
  apply: {
    id: 't3-apply', lesson: 'T3', category: 'technical', chart: 5,
    question: L('בגרף החדש המחיר עלה בשיאים ושפלים גבוהים יותר, ואז הגיעה ירידה. מה השתנה בסוף?', 'In the new chart price rose in higher highs and lows, then came a drop. What changed at the end?'),
    options: [
      { key: 'a', text: L('כלום — ירידות קורות גם במגמה עולה', 'Nothing — drops happen in uptrends too') },
      { key: 'b', text: L('השפל האחרון ירד מתחת לשפל הקודם: מבנה המגמה העולה נשבר — אזהרה, עוד לא הוכחה לירידה', 'The last low fell below the previous low: the uptrend structure broke — a warning, not yet proof of a downtrend') },
      { key: 'c', text: L('המגמה התהפכה בוודאות לירידה', 'The trend has certainly turned down') },
      { key: 'd', text: L('אי אפשר לומר כלום בלי אינדיקטור', 'You cannot say anything without an indicator') }
    ],
    correctKey: 'b',
    explanation: L(`השפל האחרון (כ־${r0(brkLow3!.price)}) נמוך מהשפל הקודם (כ־${r0(brkLow2!.price)}). זה בדיוק מה שירידה חדה לבדה לא עושה: הוא שובר את רצף השפלים הגבוהים. מכאן המחיר יכול להמשיך לרדת, לעבור לדשדוש או לחזור לעלות — אבל "מגמה עולה" כבר לא מתארת את הגרף.`,
      `The last low (about ${r0(brkLow3!.price)}) is below the previous low (about ${r0(brkLow2!.price)}). That is exactly what a sharp drop on its own does not do: it breaks the run of higher lows. From here price can keep falling, go sideways or turn back up — but "uptrend" no longer describes the chart.`)
  },
  takeaway: {
    bottomLine: L('מגמה נקראת לפי רצף השיאים והשפלים: עולה — גבוהים יותר, יורדת — נמוכים יותר, דשדוש — בין תקרה לרצפה.',
      'A trend is read from the sequence of highs and lows: up — higher, down — lower, sideways — between a ceiling and a floor.'),
    caveat: L('שפל נמוך מהקודם שובר את מבנה המגמה העולה, אבל לא מבטיח היפוך. ומגמה תמיד שייכת לטווח זמן מסוים.',
      'A low below the previous one breaks the uptrend structure, but it does not promise a reversal. And a trend always belongs to a particular timeframe.')
  },
  questions: [
    q('t3-down', 'T3', 'beginner', 6,
      L('מה המגמה בגרף?', "What's the trend in this chart?"),
      [
        ['a', L('עולה', 'Up')],
        ['b', L('יורדת — שיאים נמוכים יותר ושפלים נמוכים יותר', 'Down — lower highs and lower lows')],
        ['c', L('דשדוש', 'Sideways')],
        ['d', L('אי אפשר לדעת בלי אינדיקטור', "You can't tell without an indicator")]
      ], 'b',
      L(`כל שיא נמוך מהקודם (כ־${r0(highs(QD)[0]!.price)}, אחר כך כ־${r1(highs(QD)[1]!.price)}, אחר כך כ־${r0(highs(QD)[2]!.price)}) וכל שפל נמוך מהקודם (כ־${r0(lows(QD)[0]!.price)}, כ־${r1(lows(QD)[1]!.price)}, כ־${r0(lows(QD)[2]!.price)}). זו ההגדרה של מגמה יורדת — גם אם יש קפיצות בדרך.`,
        `Every high is below the last (about ${r0(highs(QD)[0]!.price)}, then ${r1(highs(QD)[1]!.price)}, then ${r0(highs(QD)[2]!.price)}) and every low is below the last (about ${r0(lows(QD)[0]!.price)}, ${r1(lows(QD)[1]!.price)}, ${r0(lows(QD)[2]!.price)}). That is the definition of a downtrend — even with bounces along the way.`)),
    q('t3-side', 'T3', 'beginner', 7,
      L('איך הכי נכון לתאר את הגרף הזה?', 'What is the most accurate way to describe this chart?'),
      [
        ['a', L('מגמה עולה', 'An uptrend')],
        ['b', L('מגמה יורדת', 'A downtrend')],
        ['c', L(`דשדוש בין תקרה בסביבות ${r0(Math.min(...highs(QS).map((s) => s.price)))} לרצפה בסביבות ${r0(Math.max(...lows(QS).map((s) => s.price)))}`, `Sideways between a ceiling around ${r0(Math.min(...highs(QS).map((s) => s.price)))} and a floor around ${r0(Math.max(...lows(QS).map((s) => s.price)))}`)],
        ['d', L('שוק דובי', 'A bear market')]
      ], 'c',
      L(`השיאים נעצרים שוב ושוב בסביבות ${r0(Math.min(...highs(QS).map((s) => s.price)))}–${r0(Math.max(...highs(QS).map((s) => s.price)))}, והשפלים בסביבות ${r0(Math.max(...lows(QS).map((s) => s.price)))}. אין שיאים גבוהים יותר ואין שפלים נמוכים יותר — המחיר נע בטווח.`,
        `The highs keep stopping around ${r0(Math.min(...highs(QS).map((s) => s.price)))}–${r0(Math.max(...highs(QS).map((s) => s.price)))}, and the lows around ${r0(Math.max(...lows(QS).map((s) => s.price)))}. No higher highs, no lower lows — price is moving in a range.`)),
    q('t3-lastred', 'T3', 'intermediate', 8,
      L('הנר האחרון הוא נר אדום גדול. מה המגמה בגרף?', 'The last candle is a large red one. What is the trend?'),
      [
        ['a', L('יורדת — הנר האחרון אדום', 'Down — the last candle is red')],
        ['b', L('עדיין עולה: השיאים והשפלים עולים, והנר האחרון לא ירד מתחת לשפל הקודם', 'Still up: the highs and lows are rising, and the last candle did not fall below the previous low')],
        ['c', L('דשדוש', 'Sideways')],
        ['d', L('התהפכה לירידה', 'It has reversed downward')]
      ], 'b',
      L(`השפלים עלו (כ־${r0(lows(QU)[0]!.price)}, אחר כך כ־${r0(lows(QU)[1]!.price)}) וגם השיאים (כ־${r0(highs(QU)[0]!.price)}, אחר כך כ־${r0(highs(QU)[1]!.price)}). הנר האחרון ירד עד כ־${r1(QU[QU.length - 1]!.l)} — עדיין מעל השפל הקודם. נר אחד לא קובע מגמה; אם השפל הבא יירד מתחת ל־${r0(lows(QU)[1]!.price)}, התמונה תשתנה.`,
        `The lows rose (about ${r0(lows(QU)[0]!.price)}, then ${r0(lows(QU)[1]!.price)}) and so did the highs (about ${r0(highs(QU)[0]!.price)}, then ${r0(highs(QU)[1]!.price)}). The last candle fell to about ${r1(QU[QU.length - 1]!.l)} — still above the previous low. One candle does not set a trend; if the next low falls below ${r0(lows(QU)[1]!.price)}, the picture changes.`))
  ]
};

// ============================================================================
// T4 · Support and resistance
// ============================================================================
const T4T = series.T4_TEACH, ZONE = series.L1_ZONE, FLIP = series.T4_FLIP;
const touchDots = lows(T4T).map((s, i) => ({ idx: s.idx, price: s.price, tone: 'support', labelDy: 20, label: L(`נגיעה ${i + 1}`, `Touch ${i + 1}`) }));
const QA = series.T4_Q_APPROACH, QB = series.T4_Q_BAND, QR = series.T4_Q_RES;
const bandLine = Math.round((QB.band[0] + QB.band[1]) / 2);
const markL1 = ACTIVITIES.l1 as MarkLevelActivity;
const T4_CHARTS: LessonChartSpec[] = [
  {
    candles: T4T,
    variant: 'price',
    options: {
      showVolume: false,
      zones: [
        { range: T4T.support, tone: 'support', label: L('תמיכה', 'Support') },
        { range: T4T.resist, tone: 'resistance', label: L('התנגדות', 'Resistance') }
      ],
      dots: touchDots
    },
    label: L(`גרף תמיכה והתנגדות: המחיר יורד שלוש פעמים לאזור ${r1(T4T.support[0])}–${r1(T4T.support[1])} ועולה ממנו, ופעמיים מטפס לאזור ${r0(T4T.resist[0])}–${r0(T4T.resist[1])} ונסוג`,
      `Support and resistance: price falls to the ${r1(T4T.support[0])}–${r1(T4T.support[1])} area three times and rises from it, and climbs to the ${r0(T4T.resist[0])}–${r0(T4T.resist[1])} area twice and pulls back`),
    caption: L('תמיכה, התנגדות ונגיעות', 'Support, resistance and touches'),
    subcaption: L('נתוני הדגמה.', 'Demo data.'),
    tone: 'neutral',
    height: 400
  },
  LESSON_CHARTS.l1![1]!,
  LESSON_CHARTS.l1![0]!,
  {
    candles: FLIP,
    variant: 'price',
    options: { showVolume: false, zones: [{ range: FLIP.zone, tone: 'support', label: L('האזור שהחזיק פעמיים', 'The area that held twice') }] },
    label: L(`גרף שבו אזור ${r0(FLIP.zone[0])}–${r0(FLIP.zone[1])} עוצר ירידות פעמיים, נשבר כלפי מטה, ואז המחיר עולה אליו בחזרה ונעצר`,
      `A chart where the ${r0(FLIP.zone[0])}–${r0(FLIP.zone[1])} area stops two drops, breaks downward, and then price rallies back to it and stalls`),
    caption: L('גרף חדש', 'A new chart'),
    tone: 'neutral',
    height: 260
  },
  {
    candles: QA,
    variant: 'price',
    options: { showVolume: false, zones: [{ range: QA.zone, tone: 'support', label: L('האזור המסומן', 'The marked area') }] },
    label: L('גרף שבו המחיר עלה פעמיים מהאזור המסומן, ועכשיו יורד לכיוונו', 'A chart where price twice rose from the marked area and is now falling toward it'),
    caption: L('המחיר בדרך לאזור', 'Price heading to the area'),
    tone: 'neutral',
    height: 300
  },
  {
    candles: QB,
    variant: 'price',
    options: { showVolume: false, segments: [{ x1: 0, y1: bandLine, x2: QB.length - 1, y2: bandLine, tone: 'bear', dash: [4, 4], labelAt: 'end', labelAlign: 'right', label: L(`הקו ${bandLine}`, `The ${bandLine} line`) }] },
    label: L(`גרף עם קו מקווקו ב־${bandLine}: המחיר יורד מתחתיו פעמיים ופעם אחת נעצר מעליו, ובכל פעם עולה חזרה`, `A chart with a dashed line at ${bandLine}: price dips below it twice and stops above it once, turning back up every time`),
    caption: L(`קו ב־${bandLine}`, `A line at ${bandLine}`),
    tone: 'neutral',
    height: 300
  },
  { candles: QR, variant: 'price', options: { showVolume: false }, label: L('גרף שבו המחיר מטפס שלוש פעמים לאותו אזור ונסוג', 'A chart where price climbs to the same area three times and pulls back'), caption: L('איפה ההתנגדות?', 'Where is resistance?'), tone: 'neutral', height: 300 }
];
// Chart indexes: 0 touches · 1 area vs line · 2 the Try chart · 3 apply · 4–6 questions.

export const T4: LessonContent = {
  id: 'T4',
  tutor: { topic: 'support-resistance', label: L('תמיכה והתנגדות', 'support and resistance') },
  teach: [
    {
      heading: L('מהי תמיכה, ומהי התנגדות?', 'What support is — and resistance'),
      paragraphs: [
        L('תמיכה היא אזור מחיר שבו לחץ קנייה גבר שוב ושוב על לחץ מכירה בעבר — לא רצפה קשיחה, אלא אזור ששווה לעקוב אחריו. התנגדות היא תמונת המראה: אזור שבו המוכרים גברו שוב ושוב, והמחיר נעצר בדרכו למעלה.',
          'Support is a price area where buying pressure has repeatedly overwhelmed selling pressure in the past — not a hard floor, just a zone worth watching. Resistance is its mirror image: an area where sellers repeatedly won and price stalled on its way up.'),
        L(`איך מוצאים אותן? מחפשים מקום שהמחיר הגיב ממנו יותר מפעם אחת. בגרף, המחיר ירד שלוש פעמים לאזור ${r1(T4T.support[0])}–${r1(T4T.support[1])} ובכל פעם עלה ממנו, ופעמיים טיפס לאזור ${r0(T4T.resist[0])}–${r0(T4T.resist[1])} ונסוג. כל תגובה כזו נקראת נגיעה.`,
          `How do you find them? Look for a place price reacted from more than once. On the chart, price fell to the ${r1(T4T.support[0])}–${r1(T4T.support[1])} area three times and rose from it each time, and twice climbed to the ${r0(T4T.resist[0])}–${r0(T4T.resist[1])} area and pulled back. Each such reaction is called a touch.`),
        L('וחשוב לזכור מה זה אומר ומה לא. זה אומר שבאזור הזה, בעבר, היו מספיק קונים (או מוכרים) כדי לעצור את המחיר. זה לא אומר שהם יחכו שם גם בפעם הבאה.',
          'And remember what that does and does not mean. It means that in this area, in the past, there were enough buyers (or sellers) to stop price. It does not mean they will be waiting there next time.')
      ],
      work: { kind: 'charts', charts: [0] }
    },
    {
      heading: L('למה דווקא שם?', 'Why there, of all places?'),
      paragraphs: [
        L('בכל פעם שרמה מחזיקה, יותר סוחרים שמים לב אליה ומציבים סביבה פקודות — וזה חלק ממה שגורם לה להחזיק שוב בפעם הבאה. יש גם זיכרון: מי שפספס קנייה בפעם הקודמת מחכה להזדמנות שנייה באותו מחיר, ומי שקנה בשיא ונתקע בהפסד שמח למכור כשהמחיר חוזר לנקודת האיזון שלו — וכך נבנית התנגדות.',
          "Every time a level holds, more traders notice it and place orders around it — which is part of what makes it hold again next time. There is memory too: someone who missed the buy last time waits for a second chance at the same price, and someone who bought at the top and got stuck with a loss is glad to sell when price returns to their break-even — which is how resistance forms."),
        L('אבל אותה צפיפות היא גם הסיבה שרמות בסופו של דבר נשברות: ברגע שהמחיר סוף סוף פורץ דרך, כל אותם סטופ-לוס שהצטברו ממש מעבר לרמה מופעלים בבת אחת — מה שלעיתים קרובות בדיוק מזין את עוצמת הפריצה.',
          'But that same crowding is also why levels eventually break: once price finally pushes through, all the stop-losses clustered just beyond it get triggered at once, which is often exactly what fuels the strength of a breakout.'),
        L('ומה קורה לתמיכה שנשברה? לעיתים קרובות היא מחליפה תפקיד והופכת להתנגדות. מי שקנה ברצפה הישנה נמצא עכשיו בהפסד, ורבים מהם ימכרו אם המחיר יחזור לשם — בדיוק כשהמחיר מנסה לעלות בחזרה. זה לא חוק, אבל זה קורה מספיק כדי שכדאי לצפות לזה.',
          'And what happens to support once it breaks? It often switches roles and becomes resistance. People who bought at the old floor are now losing, and many of them will sell if price comes back there — just as price is trying to climb back. It is not a law, but it happens often enough to expect.')
      ],
      callouts: [{ kind: 'caveat', lead: L('שימו לב', 'Watch out'), text: L(
        'יותר נגיעות לא תמיד אומר תמיכה חזקה יותר. כל נגיעה גם "משתמשת" בחלק מהקונים שחיכו שם — ולכן יש רמות שנשברות דווקא אחרי כמה נגיעות.',
        'More touches does not always mean stronger support. Each touch also "uses up" some of the buyers waiting there — which is why some levels break precisely after several touches.') }],
      work: { kind: 'diagram', diagram: {
        type: 'book',
        title: L('למה 50 מחזיק: פקודות שמחכות שם', 'Why 50 holds: orders waiting there'),
        asks: [[50.10, 300], [50.20, 400], [50.30, 300]],
        bids: [[50.00, 2400], [49.90, 500], [49.80, 400]],
        highlight: 'best',
        caption: L('ב־50.00 ממתינות 2,400 מניות לקנייה — כדי לרדת מתחת, המוכרים צריכים לעבור את כולן.', 'At 50.00, 2,400 shares are waiting to be bought — to go lower, sellers have to get through all of them.')
      } }
    },
    {
      heading: L('למה מסמנים אזור ולא קו', 'Why you mark an area, not a line'),
      paragraphs: [
        L('המחיר כמעט אף פעם לא נעצר באותה אגורה בדיוק. פעם הוא מתהפך קצת מעל, פעם יורד קצת מתחת ונסגר בחזרה. לכן מסמנים אזור — רצועה שמכסה את נקודות המפנה — ולא קו אחד.',
          'Price almost never stops at exactly the same cent. Sometimes it turns a little above, sometimes it dips a little below and closes back. So you mark an area — a band covering the turning points — not a single line.'),
        L(`בגרף, מי שמסמן קו מדויק ב־${ZONE.exactLine} רואה שוב ושוב "כישלונות": פעם המחיר עצר מעליו ופעם חצה אותו. מי שמסמן את הרצועה ${ZONE.band[0]}–${ZONE.band[1]} רואה את אותו אזור מחזיק בכל הפעמים — מאותה תנועת מחיר בדיוק.`,
          `On the chart, whoever draws an exact line at ${ZONE.exactLine} sees "failures" again and again: sometimes price stopped above it and sometimes it cut through. Whoever marks the ${ZONE.band[0]}–${ZONE.band[1]} band sees the same area holding every time — from exactly the same price action.`),
        L('איך בונים את הרצועה? מתחילים מהשפלים (או השיאים) שהמחיר הגיב מהם, ומותחים את האזור כך שיכלול את כולם. רצועה צרה מדי תיראה "נשברת" כל הזמן; רחבה מדי כבר לא אומרת כלום.',
          'How do you build the band? Start from the lows (or highs) price reacted from, and stretch the area to include them all. Too narrow a band will look "broken" all the time; too wide and it no longer says anything.')
      ],
      work: { kind: 'charts', charts: [1] }
    }
  ],
  charts: T4_CHARTS,
  activity: { ...markL1, chart: 2 },
  apply: {
    id: 't4-apply', lesson: 'T4', category: 'technical', chart: 3,
    question: L(`בגרף החדש אזור ${r0(FLIP.zone[0])}–${r0(FLIP.zone[1])} עצר ירידה פעמיים, ואז המחיר שבר אותו כלפי מטה. בהמשך המחיר עלה בחזרה לאותו אזור ונעצר שם. איזה תפקיד מילא האזור בפעם הזו?`,
      `In the new chart the ${r0(FLIP.zone[0])}–${r0(FLIP.zone[1])} area stopped a drop twice, then price broke down through it. Later price rallied back to the same area and stalled there. What role did the area play this time?`),
    options: [
      { key: 'a', text: L('תמיכה', 'Support') },
      { key: 'b', text: L('התנגדות — התמיכה הישנה החליפה תפקיד', 'Resistance — the old support switched roles') },
      { key: 'c', text: L('שום תפקיד — רמה שנשברה לא משנה יותר', 'None — a broken level no longer matters') },
      { key: 'd', text: L('הבורסה עצרה שם את המסחר', 'The exchange halted trading there') }
    ],
    correctKey: 'b',
    explanation: L(`אחרי השבירה, מי שקנה באזור ${r0(FLIP.zone[0])}–${r0(FLIP.zone[1])} היה בהפסד. כשהמחיר חזר לשם מלמטה, מספיק מהם מכרו כדי לעצור אותו. זו החלפת תפקיד: תמיכה שנשברה הפכה להתנגדות. נפוץ — לא מובטח.`,
      `After the break, whoever had bought in the ${r0(FLIP.zone[0])}–${r0(FLIP.zone[1])} area was losing. When price came back up to it, enough of them sold to stop it. That is a role switch: broken support became resistance. Common — not guaranteed.`)
  },
  takeaway: {
    bottomLine: L('תמיכה היא אזור שבו לחץ קנייה גבר שוב ושוב על לחץ מכירה, והתנגדות היא ההפך — אזורים ששווה לעקוב אחריהם, לא קווים מדויקים ולא רצפות קשיחות.',
      'Support is an area where buying pressure repeatedly overwhelmed selling, and resistance the reverse — zones worth watching, not exact lines and not hard floors.'),
    caveat: L('אותה צפיפות של פקודות שמחזיקה רמה היא גם מה שמאיץ את השבירה שלה — ורמה שנשברה מחליפה לעיתים קרובות תפקיד.',
      'The same crowding of orders that holds a level is what speeds up its break — and a broken level often switches roles.')
  },
  questions: [
    q('t4-approach', 'T4', 'beginner', 4,
      L('המחיר יורד לכיוון האזור המסומן, שממנו הוא עלה פעמיים בעבר. מה הקריאה הסבירה ביותר?', 'Price is falling toward the marked area, which it rose from twice before. What is the most reasonable reading?'),
      [
        ['a', L('המחיר בטוח יעלה שוב מהאזור', 'Price is sure to bounce from the area again')],
        ['b', L('זה אזור שקונים נכנסו בו בעבר — שווה לעקוב אחרי התגובה שם, בלי להניח מראש שיחזיק', 'Buyers stepped in there before — worth watching how price reacts, without assuming it will hold')],
        ['c', L('האזור לא רלוונטי כי עבר זמן', 'The area is irrelevant because time has passed')],
        ['d', L('המחיר חייב לשבור את האזור בפעם השלישית', 'Price must break the area on the third try')]
      ], 'b',
      L('תמיכה מתארת מה קרה בעבר: פעמיים היו שם מספיק קונים כדי להפוך את הכיוון. זו סיבה לשים לב — לא הבטחה. המחיר יכול לעלות שוב, ויכול גם לשבור את האזור.',
        'Support describes what happened before: twice there were enough buyers there to turn price around. That is a reason to pay attention — not a promise. Price may rise again, and it may break the area.')),
    q('t4-band', 'T4', 'intermediate', 5,
      L(`הקו המקווקו ב־${bandLine}. פעמיים המחיר ירד מתחתיו ועלה חזרה. האם התמיכה "נכשלה"?`, `The dashed line is at ${bandLine}. Twice price dipped below it and came back up. Did support "fail"?`),
      [
        ['a', L('כן — כל ירידה מתחת לקו היא כישלון', 'Yes — every dip below the line is a failure')],
        ['b', L(`לא — נקודות המפנה מתקבצות באזור של כ־${r0(QB.band[0])}–${r1(QB.band[1])}; תמיכה היא אזור, והמחיר נשאר בתוכו`, `No — the turning points cluster in an area of about ${r0(QB.band[0])}–${r1(QB.band[1])}; support is an area, and price stayed inside it`)],
        ['c', L('כן, ולכן צריך להזיז את הקו בכל נגיעה', 'Yes, so the line must be moved at every touch')],
        ['d', L('אי אפשר לדעת', "There's no way to tell")]
      ], 'b',
      L(`שלוש נקודות המפנה נמצאות בין כ־${r0(QB.band[0])} לכ־${r1(QB.band[1])}: שתיים מתחת לקו ואחת מעליו. מי שמסמן קו רואה כישלונות; מי שמסמן אזור רואה את אותו אזור מחזיק שלוש פעמים.`,
        `The three turning points sit between about ${r0(QB.band[0])} and ${r1(QB.band[1])}: two below the line and one above it. Draw a line and you see failures; mark an area and you see the same area holding three times.`)),
    q('t4-resistance', 'T4', 'beginner', 6,
      L('איפה ההתנגדות בגרף?', 'Where is resistance on this chart?'),
      [
        ['a', L(`בסביבות ${r0(Math.min(...highs(QR).map((s) => s.price)))}–${r0(Math.max(...highs(QR).map((s) => s.price)))}`, `Around ${r0(Math.min(...highs(QR).map((s) => s.price)))}–${r0(Math.max(...highs(QR).map((s) => s.price)))}`)],
        ['b', L(`בסביבות ${r0(Math.min(...QR.map((c) => c.l)))} — הנקודה הנמוכה בגרף`, `Around ${r0(Math.min(...QR.map((c) => c.l)))} — the lowest point on the chart`)],
        ['c', L(`בסביבות ${r0(QR[QR.length - 1]!.c)} — המחיר האחרון`, `Around ${r0(QR[QR.length - 1]!.c)} — the latest price`)],
        ['d', L('אין התנגדות כשהמחיר עולה', 'There is no resistance while price is rising')]
      ], 'a',
      L(`התנגדות היא אזור שבו המחיר נעצר בדרכו למעלה. המחיר טיפס שלוש פעמים לאזור ${r0(Math.min(...highs(QR).map((s) => s.price)))}–${r0(Math.max(...highs(QR).map((s) => s.price)))} ונסוג משם בכל פעם. הנקודה הנמוכה והמחיר האחרון לא עצרו אף עלייה.`,
        `Resistance is an area where price stalls on its way up. Price climbed to the ${r0(Math.min(...highs(QR).map((s) => s.price)))}–${r0(Math.max(...highs(QR).map((s) => s.price)))} area three times and pulled back each time. The low point and the latest price stopped no rally.`)),
    ...legacyQuestions('l1')
  ]
};

// ============================================================================
// T5 · Breakout and retest
// ============================================================================
const BK = series.T5_BREAK, POKE = series.T5_POKE, THIN = series.T5_THIN, AP = series.T5_APPLY;
const avgVol = (c: Array<{ v: number }>, n: number) => c.slice(0, n).reduce((s, x) => s + x.v, 0) / n;
const volX = (c: typeof BK) => c[c.breakIdx]!.v / avgVol(c, c.breakIdx);
const rangeLow = Math.min(...BK.slice(0, BK.breakIdx).map((c) => c.l));
const apAfter = AP.slice(AP.breakIdx);
const apRetest = lows(AP)[0]!, apPeakBefore = Math.max(...AP.slice(AP.breakIdx, apRetest.idx).map((c) => c.h));
const QP = series.T5_Q_POKE, QT = series.T5_Q_THIN, QH = series.T5_Q_HOLD;
const qhAfterLow = Math.min(...QH.slice(QH.breakIdx + 5).map((c) => c.l));
const predictL2 = ACTIVITIES.l2 as PredictActivity;
const L2 = series.L2;
const T5_CHARTS: LessonChartSpec[] = [
  {
    candles: BK,
    variant: 'price',
    options: {
      showVolume: false,
      zones: [{ range: BK.resist, tone: 'resistance', label: L('התנגדות', 'Resistance') }],
      points: [{ idx: BK.breakIdx, tone: 'bull', align: 'center', place: 'below', label: L('סגירה מעל האזור', 'A close above the area') }]
    },
    label: L(`גרף שנע בין ${r0(rangeLow)} ל־${r1(BK.resist[1])}, ואז נר אחד נסגר ב־${r0(BK[BK.breakIdx]!.c)}, מעל אזור ההתנגדות; הגרף נגמר כמה נרות אחר כך`,
      `A chart ranging between ${r0(rangeLow)} and ${r1(BK.resist[1])}, until one candle closes at ${r0(BK[BK.breakIdx]!.c)}, above the resistance area; the chart ends a few candles later`),
    caption: L('רגע הפריצה', 'The moment of the breakout'),
    subcaption: L('נתוני הדגמה. הגרף נעצר כאן בכוונה — מה שקורה אחר כך מחכה לשלב 4.', 'Demo data. The chart stops here on purpose — what comes next waits for step 4.'),
    tone: 'bull',
    height: 380
  },
  {
    candles: POKE,
    variant: 'price',
    options: {
      showVolume: false,
      zones: [{ range: POKE.resist, tone: 'resistance', label: L('התנגדות', 'Resistance') }],
      points: [{ idx: POKE.breakIdx, tone: 'bear', align: 'center', place: 'below', label: L('חדר מעל — ונסגר מתחת', 'Poked above — closed below') }]
    },
    label: L(`גרף שבו נר אחד מגיע ל־${r1(POKE[POKE.breakIdx]!.h)}, מעל אזור ההתנגדות, אבל נסגר ב־${r1(POKE[POKE.breakIdx]!.c)}, מתחתיו; אחריו המחיר יורד`,
      `A chart where one candle reaches ${r1(POKE[POKE.breakIdx]!.h)}, above the resistance area, but closes at ${r1(POKE[POKE.breakIdx]!.c)}, below it; after it price falls`),
    caption: L('נגיעה, לא פריצה', 'A poke, not a breakout'),
    subcaption: L('צל עליון ארוך מעל הרמה, סגירה מתחתיה.', 'A long upper shadow above the level, a close below it.'),
    tone: 'bear',
    height: 300
  },
  {
    candles: series.L2_FALSE,
    variant: 'price',
    options: { showVolume: false, zones: [{ range: series.L2_FALSE.resistZone, tone: 'resistance', label: L('רמת ההתנגדות', 'The resistance level') }] },
    label: L('גרף שבו המחיר נסגר מעל אזור ההתנגדות לכמה נרות, ואז חוזר מתחתיו ונשאר שם', 'A chart where price closes above the resistance area for a few candles, then falls back below it and stays there'),
    caption: L('פריצה שנכשלה', 'A failed breakout'),
    subcaption: L('נסגר מעל הרמה — ואז חזר מתחתיה ונשאר שם.', 'Closed above the level — then fell back below it and stayed.'),
    tone: 'bear',
    height: 300
  },
  {
    candles: BK,
    variant: 'price',
    options: {
      showVolume: true,
      zones: [{ range: BK.resist, tone: 'resistance', label: L('התנגדות', 'Resistance') }],
      highlights: [{ i1: BK.breakIdx, tone: 'gold', label: L('נר הפריצה', 'Breakout candle') }]
    },
    label: L(`אותה פריצה, עם עמודות נפח: עמודת הנפח של נר הפריצה גבוהה פי ${r1(volX(BK))} מהממוצע שלפניו`, `The same breakout, with volume bars: the breakout candle's volume bar is ${r1(volX(BK))} times the average before it`),
    caption: L('פריצה בנפח חריג', 'A breakout on heavy volume'),
    subcaption: L(`עמודת הנפח של נר הפריצה: פי ${r1(volX(BK))} מהממוצע שלפניו.`, `The breakout candle's volume bar: ${r1(volX(BK))}× the average before it.`),
    tone: 'bull',
    height: 300
  },
  {
    candles: THIN,
    variant: 'price',
    options: {
      showVolume: true,
      zones: [{ range: THIN.resist, tone: 'resistance', label: L('התנגדות', 'Resistance') }],
      highlights: [{ i1: THIN.breakIdx, tone: 'gold', label: L('נר הפריצה', 'Breakout candle') }]
    },
    label: L(`פריצה אחרת, סגירה מעל ההתנגדות — אבל עמודת הנפח של נר הפריצה היא רק כ־${r2(volX(THIN))} מהממוצע`, `Another breakout, a close above resistance — but the breakout candle's volume is only about ${r2(volX(THIN))} of the average`),
    caption: L('פריצה בנפח דליל', 'A breakout on thin volume'),
    subcaption: L(`אותה סגירה מעל הרמה — בנפח של כ־${r2(volX(THIN))} מהממוצע בלבד.`, `The same close above the level — on only about ${r2(volX(THIN))} of average volume.`),
    tone: 'neutral',
    height: 300
  },
  {
    // The prediction's chart. Its caption and description say nothing about what
    // follows the breakout: that is the question (the previous build's caption
    // "Breakout, then retest" gave it away — user decision 2026-09-25).
    ...LESSON_CHARTS.l2![0]!,
    label: L(`גרף נרות: המחיר נע מתחת לאזור ${L2.resistZone[0]}–${L2.resistZone[1]}, ואז נסגר מעליו בנפח גבוה. ההמשך נחשף אחרי הבחירה.`,
      `Candlestick chart: price moves under the ${L2.resistZone[0]}–${L2.resistZone[1]} area, then closes above it on heavy volume. What follows is revealed after you choose.`),
    caption: L('מה קורה אחרי הפריצה?', 'What happens after the breakout?'),
    subcaption: L('נתוני הדגמה.', 'Demo data.')
  },
  {
    candles: AP,
    variant: 'price',
    options: { showVolume: false, zones: [{ range: AP.resist, tone: 'resistance', label: L('ההתנגדות הישנה', 'The old resistance') }] },
    label: L(`גרף שפורץ מעל אזור ${r1(AP.resist[0])}–${r1(AP.resist[1])}, עולה, חוזר לאזור בנר שיורד עד ${r1(apRetest.price)} ונסגר מעליו, וממשיך לעלות`,
      `A chart that breaks above the ${r1(AP.resist[0])}–${r1(AP.resist[1])} area, rises, returns to it with a candle dipping to ${r1(apRetest.price)} that closes above it, and climbs on`),
    caption: L('גרף חדש', 'A new chart'),
    tone: 'neutral',
    height: 260
  },
  {
    candles: QP,
    variant: 'price',
    options: { showVolume: false, zones: [{ range: QP.resist, tone: 'resistance', label: L('התנגדות', 'Resistance') }], points: [{ idx: QP.breakIdx, tone: 'gold', align: 'center', place: 'below', label: MARKED }] },
    label: L('גרף עם אזור התנגדות ונר מסומן שעולה מעליו', 'A chart with a resistance area and a marked candle that rises above it'),
    caption: L('הנר המסומן', 'The marked candle'),
    tone: 'neutral',
    height: 300
  },
  {
    candles: QT,
    variant: 'price',
    options: { showVolume: true, zones: [{ range: QT.resist, tone: 'resistance', label: L('התנגדות', 'Resistance') }] },
    label: L('גרף עם אזור התנגדות, נר שנסגר מעליו, ועמודות נפח מתחת', 'A chart with a resistance area, a candle that closes above it, and volume bars below'),
    caption: L('פריצה', 'A breakout'),
    tone: 'neutral',
    height: 300
  },
  {
    candles: QH,
    variant: 'price',
    options: { showVolume: false, zones: [{ range: QH.resist, tone: 'resistance', label: L('ההתנגדות הישנה', 'The old resistance') }] },
    label: L('גרף שפרץ מעל אזור התנגדות, עלה, וחזר לאזור בלי להיסגר מתחתיו', 'A chart that broke above a resistance area, rose, and came back to it without closing below'),
    caption: L('אחרי הפריצה', 'After the breakout'),
    tone: 'neutral',
    height: 300
  }
];
// Chart indexes: 0 the break · 1–2 poke / failure · 3–4 volume · 5 the prediction · 6 apply · 7–9 questions.

export const T5: LessonContent = {
  id: 'T5',
  tutor: { topic: 'breakout-retest', label: L('פריצה וריטסט', 'breakouts and retests') },
  teach: [
    {
      heading: L('מה בדיוק "נפרץ" בפריצה?', 'What exactly breaks in a breakout?'),
      paragraphs: [
        L('פריצה היא כאשר המחיר נסגר בבירור מעל אזור התנגדות. בשיעור הקודם ראיתם שהתנגדות היא אזור שבו המוכרים עצרו את המחיר שוב ושוב; פריצה היא הרגע שבו הקונים סוף סוף גוברים עליהם — המחיר לא רק מגיע לאזור, הוא נסגר מעליו.',
          'A breakout is price closing decisively above a resistance zone. In the last lesson you saw that resistance is an area where sellers stopped price again and again; a breakout is the moment buyers finally overpower them — price does not just reach the area, it closes above it.'),
        L(`בגרף, המחיר נע במשך שבועות בין כ־${r0(rangeLow)} לאזור ${r1(BK.resist[0])}–${r1(BK.resist[1])}, ונעצר באזור הזה פעמיים. ואז נר אחד נפתח ב־${r1(BK[BK.breakIdx]!.o)} ונסגר ב־${r1(BK[BK.breakIdx]!.c)} — בבירור מעל האזור.`,
          `On the chart, price spent weeks between about ${r0(rangeLow)} and the ${r1(BK.resist[0])}–${r1(BK.resist[1])} area, stalling at that area twice. Then one candle opened at ${r1(BK[BK.breakIdx]!.o)} and closed at ${r1(BK[BK.breakIdx]!.c)} — clearly above it.`),
        L('אותו רעיון עובד גם כלפי מטה: סגירה ברורה מתחת לאזור תמיכה נקראת שבירה (או פריצה כלפי מטה). בשני המקרים מה שקובע הוא לא שהמחיר נגע ברמה — אלא איפה הוא נסגר.',
          'The same idea works downward: a clear close below a support zone is called a breakdown. Either way, what counts is not that price touched the level — it is where price closed.')
      ],
      work: { kind: 'charts', charts: [0] }
    },
    {
      heading: L('איך נראית פריצה שלא החזיקה?', "What does a breakout that didn't hold look like?"),
      paragraphs: [
        L(`לא כל חדירה מעל הרמה היא פריצה. בגרף הראשון, נר אחד טיפס עד ${r1(POKE[POKE.breakIdx]!.h)} — הרבה מעל אזור ההתנגדות — אבל נסגר ב־${r1(POKE[POKE.breakIdx]!.c)}, מתחת לאזור. מה שנשאר הוא צל עליון ארוך: הקונים ניסו, המוכרים החזירו. זו לא פריצה, והמחיר אכן ירד אחר כך.`,
          `Not every push above the level is a breakout. In the first chart one candle climbed to ${r1(POKE[POKE.breakIdx]!.h)} — well above the resistance area — but closed at ${r1(POKE[POKE.breakIdx]!.c)}, below it. What is left is a long upper shadow: buyers tried, sellers pushed back. That is not a breakout, and price did fall afterwards.`),
        L(`ויש גם פריצה שנסגרת מעל הרמה — ובכל זאת נכשלת. בגרף השני המחיר נסגר מעל אזור ${series.L2_FALSE.resistZone[0]}–${series.L2_FALSE.resistZone[1]} לכמה נרות, ואז ירד חזרה מתחתיו ונשאר שם. זו פריצה כושלת (יש שקוראים לה "מלכודת").`,
          `And there are breakouts that close above the level and still fail. In the second chart price closed above the ${series.L2_FALSE.resistZone[0]}–${series.L2_FALSE.resistZone[1]} area for a few candles, then fell back below it and stayed there. That is a failed breakout (some call it a "trap").`),
        L('אין דרך לדעת מראש איזו פריצה תחזיק. מה שכן אפשר: לחכות לסגירה ולא להגיב לנגיעה, ולבדוק כמה משתתפים עמדו מאחורי התנועה — הנושא של השלב הבא.',
          'There is no way to know in advance which breakout will hold. What you can do: wait for the close rather than react to a touch, and check how many participants were behind the move — the subject of the next step.')
      ],
      callouts: [{ kind: 'example', lead: L('מה רואים ומה מסיקים', 'What you see, what you conclude'), text: L(
        `רואים: שיא ב־${r1(POKE[POKE.breakIdx]!.h)}, סגירה ב־${r1(POKE[POKE.breakIdx]!.c)}. מסיקים: הקונים לא הצליחו להחזיק את המחיר מעל הרמה — עד הסגירה. "עד הסגירה" הוא כל ההבדל.`,
        `You see: a high at ${r1(POKE[POKE.breakIdx]!.h)}, a close at ${r1(POKE[POKE.breakIdx]!.c)}. You conclude: buyers could not hold price above the level — by the close. "By the close" is the whole difference.`) }],
      work: { kind: 'charts', charts: [1, 2] }
    },
    {
      heading: L('כמה אנשים הסכימו?', 'How many people agreed?'),
      paragraphs: [
        L('נפח מסחר הוא פשוט כמה מניות עברו יד באותו פרק זמן — הוא מצויר כעמודות מתחת לגרף המחיר, עמודה אחת לכל נר. הנפח לא אומר לאן המחיר הולך; הוא אומר כמה משתתפים היו מעורבים בתנועה.',
          'Trading volume is simply how many shares changed hands during that period — drawn as the bars beneath the price chart, one bar per candle. Volume says nothing about which way price is headed; it says how many participants were involved in the move.'),
        L(`בגלל זה בדיוק אותה פריצה נקראת אמינה יותר כשהיא מגיעה בנפח חריג וחלשה יותר כשהיא מגיעה בנפח דליל: במקרה הראשון הרבה אנשים הסכימו שהרמה צריכה להישבר, ובשני כמעט אף אחד. בגרף הראשון נר הפריצה נסחר בנפח של פי ${r1(volX(BK))} מהממוצע של הנרות שלפניו; בשני — רק כ־${r2(volX(THIN))} מהממוצע.`,
          `That is why the very same breakout reads as more credible on unusually heavy volume and weaker on thin volume: in the first case a lot of people agreed the level should give way, and in the second almost nobody did. In the first chart the breakout candle traded ${r1(volX(BK))} times the average volume of the candles before it; in the second, only about ${r2(volX(THIN))} of it.`),
        L('וגם כאן — ראיה, לא ערובה. פריצות בנפח גבוה נכשלות לפעמים, ופריצות שקטות מחזיקות לפעמים. הנפח משנה את מידת הביטחון שלכם, לא את התשובה.',
          'Here too — evidence, not a guarantee. High-volume breakouts sometimes fail, and quiet ones sometimes hold. Volume changes how confident you can be, not the answer itself.')
      ],
      work: { kind: 'charts', charts: [3, 4] }
    }
  ],
  charts: T5_CHARTS,
  activity: {
    ...predictL2,
    chart: 5,
    explain: [
      L('ריטסט (בדיקה חוזרת) הוא כאשר המחיר חוזר לאותו אזור לאחר הפריצה — ולעיתים קרובות הופך התנגדות ישנה לתמיכה חדשה — לפני שהוא ממשיך. זו אותה החלפת תפקיד שראיתם בשיעור הקודם, רק מהכיוון השני.',
        'A retest is when price returns to that same zone after the breakout — often turning former resistance into new support — before continuing. It is the same role switch you saw in the last lesson, from the other direction.'),
      L('לא כל ירידה אחרי פריצה היא ריטסט — לפעמים זה היפוך מלא. ההבחנה שסוחרים מחפשים: ריטסט אמיתי בדרך כלל נעצר בקרבת ההתנגדות הישנה ולא נשאר יותר מנר אחד או שניים מתחתיה. סגירה שנשארת מתחת לרמה הישנה לזמן ארוך יותר היא אזהרה שהפריצה עלולה להיכשל.',
        "Not every dip after a breakout is a retest — sometimes it's a full reversal. The distinction traders look for: a genuine retest usually pauses close to the old resistance and doesn't spend more than a candle or two trading back below it. A close that stays under the old level for longer than that is a warning the breakout may be failing.")
    ]
  },
  apply: {
    id: 't5-apply', lesson: 'T5', category: 'technical', chart: 6,
    question: L(`בגרף החדש המחיר פרץ מעל אזור ${r1(AP.resist[0])}–${r1(AP.resist[1])}, עלה עד כ־${r1(apPeakBefore)}, וחזר. נר אחד ירד עד ${r1(apRetest.price)} ונסגר ב־${r1(AP[apRetest.idx]!.c)}, וכל הסגירות נשארו מעל האזור. איך לקרוא את זה?`,
      `In the new chart price broke above the ${r1(AP.resist[0])}–${r1(AP.resist[1])} area, climbed to about ${r1(apPeakBefore)}, and came back. One candle dipped to ${r1(apRetest.price)} and closed at ${r1(AP[apRetest.idx]!.c)}, and every close stayed above the area. How do you read it?`),
    options: [
      { key: 'a', text: L('פריצה כושלת — המחיר נגע מתחת לרמה', 'A failed breakout — price touched below the level') },
      { key: 'b', text: L('ריטסט שמחזיק: המחיר חזר לרמה הישנה, לא נשאר מתחתיה, והיא משמשת כעת כתמיכה', 'A retest that holds: price came back to the old level, did not stay below it, and it now acts as support') },
      { key: 'c', text: L('אין קשר בין הירידה לרמה', 'The dip has nothing to do with the level') },
      { key: 'd', text: L('פריצה חדשה כלפי מטה', 'A new breakdown') }
    ],
    correctKey: 'b',
    explanation: L(`צל שנוגע מתחת לרמה לנר אחד הוא לא "להישאר מתחתיה". הסגירות נשארו מעל אזור ${r1(AP.resist[0])}–${r1(AP.resist[1])} — התקרה הישנה עבדה כרצפה, והמחיר המשיך עד מעל ${r0(Math.max(...apAfter.map((c) => c.c)) - 0.5)}. אם הסגירות היו נשארות מתחת לאזור לכמה נרות, זו הייתה האזהרה.`,
      `A shadow dipping below the level for one candle is not "staying below it". The closes stayed above the ${r1(AP.resist[0])}–${r1(AP.resist[1])} area — the old ceiling worked as a floor, and price went on above ${r0(Math.max(...apAfter.map((c) => c.c)) - 0.5)}. Had the closes stayed under the area for several candles, that would have been the warning.`)
  },
  takeaway: {
    bottomLine: L('פריצה היא סגירה ברורה מעל התנגדות, ונפח חריג מחזק אותה; ריטסט הוא חזרה לאותו אזור, שלעיתים קרובות הופך מהתנגדות לתמיכה.',
      'A breakout is a decisive close above resistance, and heavy volume strengthens it; a retest is the return to that zone, which often turns former resistance into support.'),
    caveat: L('סגירה שנשארת מתחת לרמה הישנה יותר מנר או שניים היא אזהרה שהפריצה נכשלת — ופריצה בנפח דליל אמינה פחות.',
      'A close that stays under the old level for more than a candle or two warns the breakout may be failing — and a breakout on thin volume is less credible.')
  },
  questions: [
    q('t5-poke', 'T5', 'beginner', 7,
      L('בנר המסומן המחיר עלה מעל אזור ההתנגדות. האם זו פריצה?', 'In the marked candle price went above the resistance area. Is it a breakout?'),
      [
        ['a', L('כן — המחיר עבר את הרמה', 'Yes — price went past the level')],
        ['b', L('לא — הוא עלה מעל הרמה במהלך הנר אבל נסגר מתחתיה; פריצה נמדדת בסגירה', 'No — it went above the level during the candle but closed below it; a breakout is measured by the close')],
        ['c', L('כן, כי הנר גדול', 'Yes, because the candle is big')],
        ['d', L('אי אפשר לדעת עד שהמחיר יגיע ליעד', "You can't tell until price reaches a target")]
      ], 'b',
      L(`השיא הגיע ל־${r1(QP[QP.breakIdx]!.h)}, אבל הסגירה — ${r1(QP[QP.breakIdx]!.c)} — מתחת לאזור. מה שנשאר הוא צל עליון: ניסיון שנדחה. והמחיר אכן ירד אחר כך.`,
        `The high reached ${r1(QP[QP.breakIdx]!.h)}, but the close — ${r1(QP[QP.breakIdx]!.c)} — is below the area. What is left is an upper shadow: a rejected attempt. And price did fall afterwards.`)),
    q('t5-thin', 'T5', 'intermediate', 8,
      L('המחיר נסגר מעל ההתנגדות. מה חלש בפריצה הזו?', 'Price closed above resistance. What is weak about this breakout?'),
      [
        ['a', L('שום דבר — סגירה מעל היא כל מה שצריך', 'Nothing — a close above is all it takes')],
        ['b', L(`הנפח: נר הפריצה נסחר בכ־${r1(volX(QT))} מהנפח הממוצע, כך שמעט משתתפים עמדו מאחוריה`, `The volume: the breakout candle traded about ${r1(volX(QT))} of average volume, so few participants were behind it`)],
        ['c', L('היא הגיעה מהר מדי', 'It came too fast')],
        ['d', L('הנר ירוק', 'The candle is green')]
      ], 'b',
      L('הסגירה מעל הרמה היא התנאי הראשון, והוא מתקיים. אבל עמודת הנפח מתחת לנר הפריצה נמוכה מהעמודות שלפניה — מעט אנשים הסכימו שהרמה צריכה להישבר. זה לא אומר שהפריצה תיכשל; זה אומר שיש פחות ראיות שהיא תחזיק.',
        'The close above the level is the first condition, and it is met. But the volume bar under the breakout candle is lower than the bars before it — few people agreed the level should give way. That does not mean it will fail; it means there is less evidence it will hold.')),
    q('t5-hold', 'T5', 'intermediate', 9,
      L('אחרי פריצה, המחיר חזר לאזור ההתנגדות הישנה ולא נסגר מתחתיו. מה הרמה הישנה עושה עכשיו?', 'After a breakout, price came back to the old resistance area without closing below it. What is the old level doing now?'),
      [
        ['a', L('משמשת כתמיכה — התקרה הישנה הפכה לרצפה, לפחות בינתיים', 'Acting as support — the old ceiling became a floor, at least for now')],
        ['b', L('שום דבר — רמה שנפרצה נעלמת', 'Nothing — a broken level disappears')],
        ['c', L('היא מוכיחה שהמחיר יעלה', 'It proves price will rise')],
        ['d', L('היא הופכת להתנגדות חזקה יותר', 'It becomes stronger resistance')]
      ], 'a',
      L(`זה ריטסט שמחזיק עד עכשיו: השפלים ירדו עד כ־${r1(qhAfterLow)}, לתוך אזור ${r1(QH.resist[0])}–${r1(QH.resist[1])}, והסגירות נשארו מעליו. אם בנרות הבאים המחיר ייסגר מתחת לאזור ויישאר שם, זו תהיה האזהרה שהפריצה נכשלת.`,
        `This is a retest holding so far: the lows dipped to about ${r1(qhAfterLow)}, into the ${r1(QH.resist[0])}–${r1(QH.resist[1])} area, and the closes stayed above it. If the next candles close under the area and stay there, that will be the warning the breakout is failing.`)),
    ...legacyQuestions('l2')
  ]
};

export const TECHNICAL: readonly LessonContent[] = [T2, T3, T4, T5];
