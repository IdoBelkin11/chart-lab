// ---------------------------------------------------------------------------
// Technical Analysis, lesson 11 — reversal vs continuation patterns.
//
// Sources: the approved curriculum (T11 · level 3 · knowledge-base topics
// reversal-patterns and continuation-patterns) and the Artifact's lesson row
// for it ("sort 6 patterns into reversal or continuation"). The knowledge base
// sets the content: head and shoulders, its inverse, double tops and bottoms
// reverse, confirmed at the neckline; triangles, flags / pennants and
// rectangles continue; wedges depend on context.
//
// Builds on T10 (the patterns themselves, the neckline, the break) and T3
// (what a trend is) without re-teaching them. New here: sorting patterns by
// what they do to the trend before them, the inverse head and shoulders, the
// flag, the triangle and the rectangle — and that the break, not the name,
// settles the direction. Combining tools is T12's.
//
// Every price in the text is read from the data; the Try's sketches stop
// before each pattern's break, so the outcome never gives the answer away.
// ---------------------------------------------------------------------------
import type { Localized, QuizQuestion } from '@core/types/kb';
import type { LessonChartSpec } from '@core/charts/lessonCharts';
import * as series from '@core/charts/series.js';
import type { LessonContent } from './types';

const L = (he: string, en: string): Localized => ({ he, en });
const r2 = (x: number) => x.toFixed(2);
const q = (id: string, chart: number, difficulty: 'beginner' | 'intermediate', question: Localized, options: Array<[string, Localized]>, correctKey: string, explanation: Localized): QuizQuestion => ({
  id, lesson: 'T11', category: 'technical', difficulty, chart, question, options: options.map(([key, text]) => ({ key, text })), correctKey, explanation
});

type C = Array<{ o: number; h: number; l: number; c: number }>;
/** The first candle after `from` that closes beyond a level: below it (`below`) or above it. */
const firstClose = (c: C, from: number, lvl: number, below: boolean) => c.findIndex((x, i) => i > from && (below ? x.c < lvl : x.c > lvl));
const low = (c: C, from: number, to = c.length) => Math.min(...c.slice(from, to).map((x) => x.l));
const high = (c: C, from: number, to = c.length) => Math.max(...c.slice(from, to).map((x) => x.h));
const dot = (idx: number, price: number, name: Localized, tone: string, below = false) => ({ idx, price, tone, labelAlign: 'center', labelDy: below ? 20 : -8, label: L(`${name.he} ${r2(price)}`, `${name.en} ${r2(price)}`) });
const line = (x1: number, y1: number, x2: number, y2: number, label?: Localized) => ({ x1, y1, x2, y2, tone: 'gold', dash: [5, 4], labelAt: 'end', labelAlign: 'right', ...(label ? { label } : {}) });

// Step 1: a rectangle inside a rise.
const RE = series.T11_RECT;
const reTop = Math.max(...RE.swings.filter((s) => s.type === 'high').map((s) => s.price));
const reFloor = Math.min(...RE.swings.filter((s) => s.type === 'low').map((s) => s.price));
const reBreak = firstClose(RE, RE.swings[RE.swings.length - 1]!.idx, reTop, false);
// Step 2: an inverse head and shoulders.
const IH = series.T11_INV_HS;
const [ihLs, ihH1, ihHead, ihH2, ihRs] = IH.swings as [typeof IH.swings[0], typeof IH.swings[0], typeof IH.swings[0], typeof IH.swings[0], typeof IH.swings[0]];
const ihNeck = (ihH1.price + ihH2.price) / 2;
const ihBreak = firstClose(IH, ihRs.idx, ihNeck, false);
// Step 3: a flag and a triangle (the previous build's pattern series).
const FL = series.P_FLAG, TG = series.P_TRIANGLE;
const fl = { start: FL[FL.poleStartIdx]!.l, top: FL[FL.poleTopIdx]!.h, end: FL[FL.flagEndIdx]!.l };
const flBreak = firstClose(FL, FL.flagEndIdx, fl.top, false);
const tgHighs = [TG.touch1Idx, TG.touch2Idx, TG.touch3Idx].map((i) => TG[i]!.h);
const tgLows = [TG.low1Idx, TG.low2Idx].map((i) => TG[i]!.l);
const tgBreak = firstClose(TG, TG.touch3Idx, Math.max(...tgHighs), false);
// Apply: a flag after a rise that breaks down instead.
const AP = series.T11_APPLY;
const apTop = AP.swings[0]!, apLows = AP.swings.filter((s) => s.type === 'low');
const apFloor = Math.min(...apLows.map((s) => s.price));
const apBreak = firstClose(AP, AP.swings[AP.swings.length - 1]!.idx, apFloor, true);
// Questions: a flag and a triangle cut before their break (the outcome stays in the facts), and two equal peaks.
const QF_FULL = series.T11_Q_FLAG, QT_FULL = series.T11_Q_TRI, QC = series.T11_Q_CONTEXT;
const qf = { start: low(QF_FULL, 0, QF_FULL.swings[0]!.idx), top: QF_FULL.swings[0]!.price, low: QF_FULL.swings[3]!.price };
const qfBreak = firstClose(QF_FULL, QF_FULL.swings[3]!.idx, qf.top, false);
const QF = QF_FULL.slice(0, qfBreak - 5);
const qtHighs = QT_FULL.swings.filter((s) => s.type === 'high'), qtLows = QT_FULL.swings.filter((s) => s.type === 'low');
const qtFloor = Math.min(...qtLows.map((s) => s.price));
const qtBreak = firstClose(QT_FULL, QT_FULL.swings[QT_FULL.swings.length - 1]!.idx, qtFloor, true);
const QT = QT_FULL.slice(0, qtBreak - 2);
const [qcP1, qcLow, qcP2] = QC.swings as [typeof QC.swings[0], typeof QC.swings[0], typeof QC.swings[0]];

const T11_CHARTS: LessonChartSpec[] = [
  {
    candles: RE, variant: 'price',
    options: { showVolume: false, zones: [{ range: [reFloor, reTop], tone: 'gold', label: L('טווח', 'Range') }], points: [{ idx: reBreak, tone: 'bull', label: L('סגירה מעל התקרה', 'Close above the ceiling') }] },
    label: L(`עלייה, אחריה דשדוש בין ${r2(reFloor)} ל־${r2(reTop)}, ואז סגירה מעל התקרה והמשך עלייה`, `A rise, then a sideways stretch between ${r2(reFloor)} and ${r2(reTop)}, then a close above the ceiling and a further rise`),
    caption: L('עצירה באמצע עלייה', 'A pause in the middle of a rise'), tone: 'bull', height: 420
  },
  {
    candles: IH, variant: 'price',
    options: { showVolume: false, dots: [dot(ihLs.idx, ihLs.price, L('כתף', 'Shoulder'), 'text', true), dot(ihHead.idx, ihHead.price, L('ראש', 'Head'), 'bull', true), dot(ihRs.idx, ihRs.price, L('כתף', 'Shoulder'), 'text', true)], segments: [line(ihH1.idx, ihNeck, IH.length - 1, ihNeck, L(`קו הצוואר ${r2(ihNeck)}`, `Neckline ${r2(ihNeck)}`))], points: [{ idx: ihBreak, tone: 'bull', label: L('סגירה מעל הקו', 'Close above the line') }] },
    label: L(`ראש וכתפיים הפוך בסוף ירידה: שפלים ב־${r2(ihLs.price)}, ${r2(ihHead.price)} ו־${r2(ihRs.price)}, קו צוואר ב־${r2(ihNeck)}`, `An inverse head and shoulders at the end of a fall: lows at ${r2(ihLs.price)}, ${r2(ihHead.price)} and ${r2(ihRs.price)}, a neckline at ${r2(ihNeck)}`),
    caption: L('ראש וכתפיים הפוך', 'Inverse head and shoulders'), tone: 'bull', height: 440
  },
  {
    candles: FL, variant: 'price',
    options: { showVolume: false, segments: [line(FL.poleStartIdx, fl.start, FL.poleTopIdx, fl.top, L('התורן', 'The pole'))], dots: [dot(FL.flagEndIdx, fl.end, L('סוף הדגל', 'End of the flag'), 'text', true)], points: [{ idx: flBreak, tone: 'bull', label: L('מעל ראש התורן', 'Above the pole\'s top') }] },
    label: L(`דגל: עלייה חדה מ־${r2(fl.start)} ל־${r2(fl.top)}, נסיגה מתונה עד ${r2(fl.end)}, ואז המשך עלייה`, `A flag: a sharp rise from ${r2(fl.start)} to ${r2(fl.top)}, a gentle drift down to ${r2(fl.end)}, then a further rise`),
    caption: L('דגל (Flag)', 'Flag'), tone: 'bull', height: 380
  },
  {
    candles: TG, variant: 'price',
    options: { showVolume: false, segments: [line(TG.touch1Idx, tgHighs[0]!, TG.touch3Idx, tgHighs[2]!, L('השיאים', 'The highs')), line(TG.low1Idx, tgLows[0]!, TG.low2Idx, tgLows[1]!, L('שפלים עולים', 'Rising lows'))], points: [{ idx: tgBreak, tone: 'bull', label: L('פריצה', 'Breakout') }] },
    label: L(`משולש: שיאים סביב ${r2(tgHighs[0]!)}–${r2(tgHighs[2]!)} ושפלים עולים, ${r2(tgLows[0]!)} ואחריו ${r2(tgLows[1]!)}, ואז פריצה למעלה`, `A triangle: highs around ${r2(tgHighs[0]!)}–${r2(tgHighs[2]!)} and rising lows, ${r2(tgLows[0]!)} then ${r2(tgLows[1]!)}, then a break upward`),
    caption: L('משולש (Triangle)', 'Triangle'), tone: 'neutral', height: 380
  },
  {
    candles: AP, variant: 'price',
    options: { showVolume: false, segments: [line(apTop.idx, apTop.price, AP.swings[4]!.idx, AP.swings[4]!.price), line(apLows[0]!.idx, apLows[0]!.price, apLows[apLows.length - 1]!.idx, apLows[apLows.length - 1]!.price)] },
    label: L(`עלייה עד ${r2(apTop.price)}, דגל מתחתיה, ואז סגירה מתחת לשפלי הדגל וירידה`, `A rise to ${r2(apTop.price)}, a flag below it, then a close below the flag's lows and a fall`),
    caption: L('גרף חדש', 'A new chart'), tone: 'neutral', height: 300
  },
  { candles: QF, variant: 'price', options: { showVolume: false }, label: L('עלייה חדה, ואחריה נסיגה קצרה ומתונה בערוץ צר; הגרף נעצר לפני היציאה ממנו', 'A sharp rise, then a short, gentle drift in a narrow channel; the chart stops before price leaves it'), caption: L('מה זה?', 'What is this?'), tone: 'neutral', height: 320 },
  {
    candles: QC, variant: 'price', options: { showVolume: false, dots: [dot(qcP1.idx, qcP1.price, L('שיא', 'Peak'), 'bear'), dot(qcP2.idx, qcP2.price, L('שיא', 'Peak'), 'bear')], segments: [line(qcLow.idx, qcLow.price, QC.length - 1, qcLow.price, L(`השפל ביניהם ${r2(qcLow.price)}`, `The low between ${r2(qcLow.price)}`))] },
    label: L('שני שיאים שווים אחרי עלייה, השפל שביניהם מסומן, והמשך הגרף אחריהם', 'Two equal peaks after a rise, the low between them marked, and the chart after them'), caption: L('שני שיאים שווים', 'Two equal peaks'), tone: 'neutral', height: 320
  },
  { candles: QT, variant: 'price', options: { showVolume: false }, label: L('שיאים יורדים שנלחצים אל רצפה שטוחה; הגרף נעצר לפני היציאה מהצורה', 'Falling highs pressing down on a flat floor; the chart stops before price leaves the shape'), caption: L('שיאים יורדים, רצפה שטוחה', 'Falling highs, a flat floor'), tone: 'neutral', height: 320 }
];
// Chart indexes: 0 rectangle · 1 inverse head and shoulders · 2 flag · 3 triangle · 4 apply · 5–7 questions.

const REV = L('היפוך', 'Reversal'), CONT = L('המשך', 'Continuation');

export const T11: LessonContent = {
  id: 'T11',
  tutor: { topic: 'reversal-patterns', label: L('תבניות היפוך והמשך', 'reversal and continuation patterns') },
  teach: [
    {
      heading: L('מה התבנית עושה למגמה', 'What the pattern does to the trend'),
      paragraphs: [
        L('בשיעור הקודם כל תבנית סיפרה סיפור. כאן ממיינים את הסיפורים לפי מה שהם עושים למגמה שלפניהם: תבנית היפוך (Reversal) מסמנת את המקום שבו מגמה נגמרת ומתהפכת; תבנית המשך (Continuation) היא עצירה באמצע מגמה, ואחריה המגמה ממשיכה.',
          'In the last lesson each pattern told a story. This lesson sorts the stories by what they do to the trend before them: a reversal pattern marks where a trend ends and turns; a continuation pattern is a pause in the middle of a trend, after which the trend carries on.'),
        L(`בגרף: עלייה, ואחריה תקופה שבה המחיר דשדש בין תקרה בערך ב־${r2(reTop)} לרצפה בערך ב־${r2(reFloor)} — מלבן (Rectangle). ביום ${reBreak + 1} המחיר נסגר מעל התקרה (${r2(RE[reBreak]!.c)}), והעלייה המשיכה עד ${r2(high(RE, reBreak))}. התבנית הייתה הפסקה, לא סוף.`,
          `On the chart: a rise, then a stretch where price moved sideways between a ceiling at about ${r2(reTop)} and a floor at about ${r2(reFloor)} — a rectangle. On day ${reBreak + 1} price closed above the ceiling (${r2(RE[reBreak]!.c)}), and the rise carried on to ${r2(high(RE, reBreak))}. The pattern was a pause, not an end.`),
        L('הצורה לבדה לא מכריעה. אותו דשדוש יכול היה להישבר למטה — ואז הוא היה הפסגה של העלייה. מה שמכריע הוא לאיזה כיוון המחיר יוצא מהתבנית: הסגירה מעבר לגבול שלה, בדיוק כמו קו הצוואר בשיעור הקודם.',
          'The shape alone does not decide. The same sideways stretch could have broken downward — and then it would have been the top of the rise. What decides is which way price leaves the pattern: the close beyond its boundary, just like the neckline in the last lesson.')
      ],
      callouts: [{ kind: 'example', lead: L('בשורה אחת', 'In one line'), text: L('היפוך: המגמה שלפני התבנית נגמרת. המשך: המגמה שלפניה חוזרת.', 'Reversal: the trend before the pattern ends. Continuation: the trend before it resumes.') }],
      work: { kind: 'charts', charts: [0] }
    },
    {
      heading: L('תבניות שמסיימות מגמה', 'Patterns that end a trend'),
      paragraphs: [
        L('את תבניות ההיפוך המרכזיות כבר פגשתם: תקרה כפולה וראש וכתפיים נוצרות אחרי עלייה, ואחרי אישור — מסיימות אותה; תחתית כפולה נוצרת אחרי ירידה. המשותף להן: הניסיון האחרון של המגמה נכשל — שיא שלא עובר את הקודם, או שפל שלא שובר את הקודם.',
          'You have met the main reversal patterns already: the double top and the head and shoulders form after a rise and, once confirmed, end it; the double bottom forms after a fall. What they share: the trend\'s last attempt fails — a high that does not beat the previous one, or a low that does not break the previous one.'),
        L(`ראש וכתפיים הפוך (Inverse Head & Shoulders) הוא ראש וכתפיים במהופך, בסוף ירידה: שפל (${r2(ihLs.price)}), שפל נמוך יותר — הראש (${r2(ihHead.price)}), ושפל גבוה יותר — כתף ימין (${r2(ihRs.price)}). קו הצוואר מחבר את שני השיאים שביניהם (${r2(ihNeck)}). הסגירה מעליו (${r2(IH[ihBreak]!.c)}, ביום ${ihBreak + 1}) השלימה את התבנית, והמחיר עלה עד ${r2(high(IH, ihBreak))}.`,
          `The inverse head and shoulders is the head and shoulders upside down, at the end of a fall: a low (${r2(ihLs.price)}), a lower low — the head (${r2(ihHead.price)}), and a higher low — the right shoulder (${r2(ihRs.price)}). The neckline joins the two highs between them (${r2(ihNeck)}). The close above it (${r2(IH[ihBreak]!.c)}, on day ${ihBreak + 1}) completed the pattern, and price rose to ${r2(high(IH, ihBreak))}.`),
        L('תבנית היפוך צריכה מגמה להפוך: שני שיאים אחרי עלייה ארוכה הם אזהרה; אותם שני שיאים באמצע דשדוש אומרים מעט מאוד.',
          'A reversal pattern needs a trend to reverse: two peaks after a long rise are a warning; the same two peaks in the middle of a sideways range say very little.')
      ],
      work: { kind: 'charts', charts: [1] }
    },
    {
      heading: L('תבניות של עצירה לנשימה', 'Patterns that pause for breath'),
      paragraphs: [
        L(`תבנית המשך היא עצירה לנשימה. הדגל (Flag): תנועה חדה — התורן — ואחריה נסיגה קצרה ומתונה נגדה, בערוץ צר. כאן התורן עלה מ־${r2(fl.start)} ל־${r2(fl.top)}, הדגל נסוג עד ${r2(fl.end)}, וביום ${flBreak + 1} המחיר נסגר מעל ראש התורן והמשיך עד ${r2(high(FL, flBreak))}.`,
          `A continuation pattern is a pause for breath. The flag: a sharp move — the pole — then a short, gentle drift against it, in a narrow channel. Here the pole ran from ${r2(fl.start)} to ${r2(fl.top)}, the flag drifted down to ${r2(fl.end)}, and on day ${flBreak + 1} price closed above the pole's top and went on to ${r2(high(FL, flBreak))}.`),
        L(`המשולש (Triangle): הטווח מצטמצם, והשיאים והשפלים מתקרבים זה לזה. כאן השיאים נשארו סביב ${r2(tgHighs[0]!)}–${r2(tgHighs[2]!)}, בזמן שהשפלים עלו (${r2(tgLows[0]!)}, ואחריו ${r2(tgLows[1]!)}): הקונים נכנסים כל פעם גבוה יותר. גם המלבן מהשלב הראשון הוא תבנית המשך — תקרה ורצפה שטוחות.`,
          `The triangle: the range narrows, with highs and lows closing in on each other. Here the highs stayed around ${r2(tgHighs[0]!)}–${r2(tgHighs[2]!)} while the lows rose (${r2(tgLows[0]!)}, then ${r2(tgLows[1]!)}): buyers stepping in higher each time. The rectangle from the first step is a continuation pattern too — a flat ceiling and floor.`),
        L('המשך הוא התוצאה הטיפוסית, לא הכלל: דגל יכול להישבר לכיוון ההפוך, ומשולש יכול לפרוץ נגד המגמה. ויש צורות — טריז (Wedge), למשל — שיכולות ללכת לשני הכיוונים; שם ההקשר והשבירה מכריעים.',
          'Continuation is the typical outcome, not the rule: a flag can break the other way, and a triangle can break against the trend. And some shapes — the wedge, for example — can go either way; there, the context and the break decide.')
      ],
      work: { kind: 'charts', charts: [2, 3] }
    }
  ],
  charts: T11_CHARTS,
  activity: {
    kind: 'classify',
    prompt: L('מיינו 6 תבניות: היפוך או המשך?', 'Sort 6 patterns: reversal or continuation?'),
    sub: L('כל סקיצה מראה את המגמה שלפני התבנית, ונעצרת לפני השבירה. החליטו מה הצורה מסמנת בדרך כלל.',
      'Each sketch shows the trend before the pattern, and stops before the break. Decide what the shape usually signals.'),
    rules: [
      { tone: 'var(--risk)', label: L('היפוך: הניסיון האחרון של המגמה נכשל', "Reversal: the trend's last attempt fails") },
      { tone: 'var(--info)', label: L('המשך: עצירה קצרה, ואז אותה מגמה', 'Continuation: a short pause, then the same trend') }
    ],
    options: [{ key: 'rev', label: REV }, { key: 'cont', label: CONT }],
    showSwings: false,
    ask: L('היפוך או המשך?', 'Reversal or continuation?'),
    hint: L('שווה להסתכל שוב על הסקיצות שסומנו באדום: האם המגמה שלפני הצורה נכשלת בה — או רק נחה?', 'Look again at the sketches marked red: does the trend before the shape fail in it — or just rest?'),
    items: [
      { id: 'hs', name: L('עלייה, ואחריה שלוש פסגות — האמצעית הגבוהה', 'A rise, then three peaks — the middle one highest'), answer: 'rev', points: [[0, 170], [50, 130], [70, 142], [120, 70], [150, 100], [200, 28], [250, 102], [295, 70], [340, 96]],
        why: L('ראש וכתפיים אחרי עלייה: כתף ימין לא עוברת את הראש — היפוך, אם קו הצוואר נשבר.', 'A head and shoulders after a rise: the right shoulder fails to beat the head — a reversal, if the neckline breaks.') },
      { id: 'db', name: L('ירידה, ואחריה שני שפלים בגובה דומה', 'A fall, then two lows at a similar level'), answer: 'rev', points: [[0, 15], [50, 50], [70, 40], [130, 150], [180, 95], [235, 148], [290, 100], [330, 108]],
        why: L('תחתית כפולה אחרי ירידה: השפל השני לא שובר את הראשון — היפוך, אם המחיר נסגר מעל השיא שביניהם.', 'A double bottom after a fall: the second low fails to break the first — a reversal, if price closes above the high between them.') },
      { id: 'flag', name: L('עלייה חדה, ואחריה נסיגה מתונה בערוץ צר', 'A sharp rise, then a gentle drift in a narrow channel'), answer: 'cont', points: [[0, 170], [40, 158], [130, 35], [160, 62], [180, 48], [210, 74], [230, 60], [260, 86], [280, 72]],
        why: L('דגל: התורן ואחריו נסיגה קצרה נגדו — עצירה לנשימה בתוך העלייה. המשך, בדרך כלל.', 'A flag: the pole, then a short drift against it — a pause for breath inside the rise. Usually a continuation.') },
      { id: 'rect', name: L('עלייה, ואחריה דשדוש בין תקרה לרצפה', 'A rise, then a sideways range between a ceiling and a floor'), answer: 'cont', band: [60, 100], points: [[0, 170], [60, 120], [80, 130], [130, 60], [165, 100], [200, 60], [235, 100], [270, 60], [305, 100], [330, 82]],
        why: L('מלבן באמצע עלייה: המחיר נח בין תקרה לרצפה. המשך, בדרך כלל — הכיוון נקבע ביציאה מהטווח.', 'A rectangle in the middle of a rise: price rests between a ceiling and a floor. Usually a continuation — the direction is set by the exit from the range.') },
      { id: 'ihs', name: L('ירידה, ואחריה שלושה שפלים — האמצעי הנמוך', 'A fall, then three lows — the middle one lowest'), answer: 'rev', points: [[0, 12], [50, 50], [70, 40], [120, 112], [150, 80], [200, 158], [250, 80], [295, 112], [340, 86]],
        why: L('ראש וכתפיים הפוך אחרי ירידה: כתף ימין לא יורדת עד הראש — היפוך, אם קו הצוואר נפרץ למעלה.', 'An inverse head and shoulders after a fall: the right shoulder does not fall as far as the head — a reversal, if the neckline breaks upward.') },
      { id: 'tri', name: L('ירידה, ואחריה שיאים יורדים מול רצפה שטוחה', 'A fall, then falling highs against a flat floor'), answer: 'cont', points: [[0, 15], [50, 55], [70, 45], [120, 130], [150, 78], [185, 130], [210, 94], [245, 130], [265, 106], [295, 130], [310, 120]],
        why: L('משולש יורד באמצע ירידה: המוכרים לוחצים כל פעם נמוך יותר על אותה רצפה. המשך, בדרך כלל — אם הרצפה נשברת.', 'A descending triangle in the middle of a fall: sellers pressing lower each time on the same floor. Usually a continuation — if the floor breaks.') }
    ],
    right: L('שלוש תבניות מסיימות את המגמה שלפניהן — ראש וכתפיים, תחתית כפולה, ראש וכתפיים הפוך — ושלוש הן עצירה בתוכה: דגל, מלבן ומשולש.', 'Three patterns end the trend before them — head and shoulders, double bottom, inverse head and shoulders — and three are a pause inside it: flag, rectangle and triangle.'),
    explain: [
      L('המיון עוקב אחרי התפקיד הטיפוסי של כל תבנית: תקרות ותחתיות כפולות וראש וכתפיים בסוף מגמה; דגלים, מלבנים ומשולשים באמצעה.',
        'The sort follows each pattern\'s typical role: double tops and bottoms and heads and shoulders at the end of a trend; flags, rectangles and triangles in the middle of one.'),
      L('אבל מיינתם סקיצות שנעצרות לפני השבירה. בגרף אמיתי השבירה מכריעה: "המשך" שנשבר נגד המגמה הפך להיפוך, ו"תקרה כפולה" שלא שברה את קו הצוואר הייתה רק עצירה. השם נותן השערה; השבירה מאשרת אותה.',
        'But you sorted sketches that stop before the break. On a real chart the break decides: a "continuation" that breaks against the trend has become a reversal, and a "double top" that never breaks its neckline was only a pause. The name gives a hypothesis; the break confirms it.')
    ]
  },
  apply: {
    id: 't11-apply', lesson: 'T11', category: 'technical', chart: 4,
    question: L(`בגרף החדש: עלייה עד ${r2(apTop.price)}, ואחריה דגל. ביום ${apBreak + 1} המחיר נסגר מתחת לשפלי הדגל (${r2(AP[apBreak]!.c)}) וירד עד ${r2(low(AP, apBreak))}. מה קרה כאן?`,
      `In the new chart: a rise to ${r2(apTop.price)}, then a flag. On day ${apBreak + 1} price closed below the flag's lows (${r2(AP[apBreak]!.c)}) and fell to ${r2(low(AP, apBreak))}. What happened here?`),
    options: [
      { key: 'a', text: L('כלום — דגל תמיד ממשיך, אז זו הזדמנות לקנות', 'Nothing — a flag always continues, so this is a chance to buy') },
      { key: 'b', text: L('הדגל נשבר נגד המגמה: המשך הוא התוצאה הטיפוסית, לא הבטחה — והשבירה הכריעה, למטה', 'The flag broke against the trend: continuation is the typical outcome, not a promise — and the break decided, downward') },
      { key: 'c', text: L('זה לא היה דגל, כי דגלים נוצרים רק בירידות', 'It was never a flag, because flags only form in falls') },
      { key: 'd', text: L('התבנית לא משנה, כי לא היה נפח', "The pattern doesn't matter, because there was no volume") }
    ],
    correctKey: 'b',
    explanation: L(`הצורה הייתה דגל: תורן עד ${r2(apTop.price)} ונסיגה מתונה בערוץ צר, עם שפלים עד ${r2(apFloor)}. אבל המחיר יצא ממנו למטה — סגירה ב־${r2(AP[apBreak]!.c)}, וירידה עד ${r2(low(AP, apBreak))}. תבנית המשך שנשברת נגד המגמה כבר לא עצירה בתוכה.`,
      `The shape was a flag: a pole up to ${r2(apTop.price)} and a gentle drift in a narrow channel, with lows down to ${r2(apFloor)}. But price left it downward — a close at ${r2(AP[apBreak]!.c)}, and a fall to ${r2(low(AP, apBreak))}. A continuation pattern that breaks against the trend is no longer a pause inside it.`)
  },
  takeaway: {
    bottomLine: L('תבנית היפוך מסמנת סוף של מגמה (תקרה או תחתית כפולה, ראש וכתפיים, ראש וכתפיים הפוך); תבנית המשך היא עצירה בתוכה (דגל, משולש, מלבן). את התפקיד קובעים לפי המגמה שלפני התבנית.',
      'A reversal pattern marks the end of a trend (double top or bottom, head and shoulders, inverse head and shoulders); a continuation pattern is a pause inside one (flag, triangle, rectangle). The role is read from the trend before the pattern.'),
    caveat: L('השם נותן השערה, לא תשובה: הכיוון נקבע רק כשהמחיר נסגר מעבר לגבול התבנית, ותבניות המשך נשברות לפעמים נגד המגמה.',
      'The name gives a hypothesis, not an answer: the direction is settled only when price closes beyond the pattern\'s boundary, and continuation patterns sometimes break against the trend.')
  },
  questions: [
    q('t11-flag', 5, 'beginner',
      L('עלייה חדה, ואחריה נסיגה קצרה ומתונה בערוץ צר. איזו תבנית זו, ומה התוצאה הטיפוסית שלה?', 'A sharp rise, then a short, gentle drift in a narrow channel. What pattern is this, and what is its typical outcome?'),
      [
        ['a', L('דגל — תבנית המשך: בדרך כלל העלייה חוזרת', 'A flag — a continuation pattern: usually the rise resumes')],
        ['b', L('ראש וכתפיים — תבנית היפוך', 'A head and shoulders — a reversal pattern')],
        ['c', L('תחתית כפולה — תבנית היפוך', 'A double bottom — a reversal pattern')],
        ['d', L('דגל — תבנית היפוך: העלייה נגמרה', 'A flag — a reversal pattern: the rise is over')]
      ], 'a',
      L(`התורן עלה מ־${r2(qf.start)} ל־${r2(qf.top)}, והדגל נסוג עד ${r2(qf.low)}. מה שקרה אחרי שהגרף נעצר: ביום ${qfBreak + 1} המחיר נסגר מעל ${r2(qf.top)} (${r2(QF_FULL[qfBreak]!.c)}) ועלה עד ${r2(high(QF_FULL, qfBreak))} — הפעם התוצאה הטיפוסית התממשה.`,
        `The pole rose from ${r2(qf.start)} to ${r2(qf.top)}, and the flag drifted down to ${r2(qf.low)}. What happened after the chart stops: on day ${qfBreak + 1} price closed above ${r2(qf.top)} (${r2(QF_FULL[qfBreak]!.c)}) and rose to ${r2(high(QF_FULL, qfBreak))} — this time the typical outcome played out.`)),
    q('t11-context', 6, 'intermediate',
      L(`שני שיאים שווים אחרי עלייה (${r2(qcP1.price)} ו־${r2(qcP2.price)}) נראו כמו תקרה כפולה. המחיר לא נסגר אף פעם מתחת לשפל שביניהם (${r2(qcLow.price)}), והמשיך עד ${r2(high(QC, qcP2.idx))}. איך לקרוא את זה?`,
        `Two equal peaks after a rise (${r2(qcP1.price)} and ${r2(qcP2.price)}) looked like a double top. Price never closed below the low between them (${r2(qcLow.price)}), and went on to ${r2(high(QC, qcP2.idx))}. How should it be read?`),
      [
        ['a', L('היפוך — העלייה נגמרה בשיא השני', 'A reversal — the rise ended at the second peak')],
        ['b', L('זו אף פעם לא הייתה תקרה כפולה: בלי סגירה מתחת לקו הצוואר זו הייתה עצירה, והעלייה המשיכה', 'It never became a double top: without a close below the neckline it was a pause, and the rise carried on')],
        ['c', L('תקרה כפולה תמיד מובילה לירידה, אז הגרף טועה', 'A double top always leads to a fall, so the chart is wrong')],
        ['d', L('ראש וכתפיים', 'A head and shoulders')]
      ], 'b',
      L(`תקרה כפולה מושלמת רק בסגירה מתחת לשפל שבין השיאים. כאן זה לא קרה — אחרי השיא השני המחיר לא נסגר מתחת ל־${r2(qcLow.price)} אף פעם, והעלייה חזרה. אותה צורה, תפקיד הפוך: ההקשר והשבירה מכריעים, לא השם.`,
        `A double top completes only on a close below the low between the peaks. That never happened here — after the second peak price never closed below ${r2(qcLow.price)}, and the rise resumed. The same shape, the opposite role: the context and the break decide, not the name.`)),
    q('t11-triangle', 7, 'intermediate',
      L(`שיאים יורדים שנלחצים אל רצפה שטוחה בערך ב־${r2(qtFloor)}. מה זה, ומה יכריע לאן הוא ייצא?`, `Falling highs pressing down on a flat floor at about ${r2(qtFloor)}. What is it, and what will settle which way it goes?`),
      [
        ['a', L('משולש יורד; הכיוון נקבע בשבירה — סגירה מתחת לרצפה, או מעל השיאים היורדים', 'A descending triangle; the direction is set by the break — a close below the floor, or above the falling highs')],
        ['b', L('דגל, שתמיד עולה', 'A flag, which always rises')],
        ['c', L('תחתית כפולה, שחייבת לעלות', 'A double bottom, which has to rise')],
        ['d', L('משולש, שהכיוון שלו ידוע מראש', 'A triangle, whose direction is known in advance')]
      ], 'a',
      L(`שיאים ב־${qtHighs.map((s) => r2(s.price)).join(', ')} מול שפלים ב־${qtLows.map((s) => r2(s.price)).join(' ו־')}: המוכרים לוחצים כל פעם נמוך יותר על אותה רצפה. משולש יורד נשבר לא פעם למטה — אבל רק השבירה מכריעה. אחרי שהגרף נעצר, המחיר נסגר מתחת לרצפה (${r2(QT_FULL[qtBreak]!.c)}) וירד עד ${r2(low(QT_FULL, qtBreak))}; ומכיוון שהמשולש בא אחרי עלייה, הוא סיים אותה.`,
        `Highs at ${qtHighs.map((s) => r2(s.price)).join(', ')} against lows at ${qtLows.map((s) => r2(s.price)).join(' and ')}: sellers pressing lower each time on the same floor. A descending triangle often breaks down — but only the break settles it. After the chart stops, price closed below the floor (${r2(QT_FULL[qtBreak]!.c)}) and fell to ${r2(low(QT_FULL, qtBreak))}; and since the triangle came after a rise, it ended that rise.`))
  ]
};
