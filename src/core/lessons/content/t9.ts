// ---------------------------------------------------------------------------
// Technical Analysis, lesson 9 — Fibonacci retracements.
//
// Sources: the Artifact's outline (a pullback in a trend → the ratios →
// drawing the tool → how far back? → where it stopped), its board 08.4 (a move
// from 90 to 120, a pullback that stops by 61.8%, "it works because many
// people use it"), the practice board that turns T9 into a calculation, and
// the previous build's l5 prose (the levels predict nothing; 50% is not a
// Fibonacci ratio; a partly self-fulfilling prophecy) and questions.
//
// Builds on T3 (a trend moves in waves: rise, pullback, rise) and T4 (a level
// is an area where orders gather) without re-teaching them. Chart patterns
// are T10's. The tool is shown drawn, never as something to drag: drawing
// tools are out of scope for this batch.
//
// Every price in the text is read from the swings in the data (pinned exactly
// in series.js), and every level is computed from them here.
// ---------------------------------------------------------------------------
import type { Localized, QuizQuestion } from '@core/types/kb';
import type { LessonChartSpec } from '@core/charts/lessonCharts';
import * as series from '@core/charts/series.js';
import { getQuizQuestions } from '@core/quiz/questions.js';
import type { LessonContent } from './types';

const L = (he: string, en: string): Localized => ({ he, en });
const r0 = (x: number) => String(Math.round(x));
const r2 = (x: number) => x.toFixed(2);
const r1 = (x: number) => x.toFixed(1);
/** Isolates a formula inside Hebrew text so it reads left to right. */
const ltr = (x: string) => `⁦${x}⁩`;
const q = (id: string, chart: number, difficulty: 'beginner' | 'intermediate', question: Localized, options: Array<[string, Localized]>, correctKey: string, explanation: Localized): QuizQuestion => ({
  id, lesson: 'T9', category: 'technical', difficulty, chart, question, options: options.map(([key, text]) => ({ key, text })), correctKey, explanation
});

type Move = typeof series.T9_MOVE;
const RATIOS = [0.236, 0.382, 0.5, 0.618, 0.786];
const pct = (r: number) => `${+(r * 100).toFixed(1)}%`;
/** The move a tool is drawn over: its start, its end, and where the pullback after it stopped. */
const legs = (c: Move) => {
  const [a, b, p] = c.swings;
  return { i0: a!.idx, i1: b!.idx, i2: p!.idx, from: a!.price, to: b!.price, stop: p!.price, size: Math.abs(b!.price - a!.price), up: a!.type === 'low' };
};
/** A level's price: measured back from the move's end — down from the high in a rise, up from the low in a fall. */
const level = (c: Move, r: number) => { const m = legs(c); return m.to - (m.to - m.from) * r; };
/** How much of the move the pullback gave back, in %. */
const retraced = (c: Move) => { const m = legs(c); return (Math.abs(m.to - m.stop) / m.size) * 100; };
/** The tool as drawn: a line for each level, from the move's end to the right edge, and the move itself. */
const fib = (c: Move) => {
  const m = legs(c);
  return [
    { x1: m.i0, y1: m.from, x2: m.i1, y2: m.to, tone: 'text', dash: [2, 4], width: 1.2 },
    ...RATIOS.map((r) => { const p = level(c, r), t = `${pct(r)} · ${r2(p)}`; return { x1: m.i1, y1: p, x2: c.length - 1, y2: p, tone: 'gold', dash: [5, 4], labelAt: 'end', labelAlign: 'right', label: L(t, t) }; })
  ];
};
const LOW = L('שפל', 'Low'), HIGH = L('שיא', 'High'), STOP = L('התיקון נעצר', 'Pullback stopped');
/** Dots on the swings: the move's start and end, and (optionally) where the pullback stopped. */
const dots = (c: Move, withStop: boolean) => {
  const m = legs(c);
  const dot = (idx: number, price: number, low: boolean, name: Localized, tone: string) => ({ idx, price, tone, labelAlign: 'center', labelDy: low ? 20 : -8, label: L(`${name.he} ${r2(price)}`, `${name.en} ${r2(price)}`) });
  return [
    dot(m.i0, m.from, m.up, m.up ? LOW : HIGH, m.up ? 'bull' : 'bear'),
    dot(m.i1, m.to, !m.up, m.up ? HIGH : LOW, m.up ? 'bear' : 'bull'),
    ...(withStop ? [dot(m.i2, m.stop, m.up, STOP, 'text')] : [])
  ];
};
const after = (c: Move) => c.slice(legs(c).i2 + 1);
const maxAfter = (c: Move) => Math.max(...after(c).map((x) => x.h));
const minAfter = (c: Move) => Math.min(...after(c).map((x) => x.l));

const MV = series.T9_MOVE, DN = series.T9_DOWN, TR = series.T9_TRY, AP = series.T9_APPLY;
const QL = series.T9_Q_LEVEL, QP = series.T9_Q_PRICE, QD = series.T9_Q_DOWN;
const mv = legs(MV), dn = legs(DN), tr = legs(TR), ap = legs(AP), ql = legs(QL), qp = legs(QP), qd = legs(QD);
const trPct = retraced(TR);

const T9_CHARTS: LessonChartSpec[] = [
  {
    candles: MV, variant: 'price', options: { showVolume: false, dots: dots(MV, true) },
    label: L(`עלייה מ־${r2(mv.from)} ל־${r2(mv.to)}, תיקון שנעצר ב־${r2(mv.stop)}, ואחריו המשך עלייה`, `A rise from ${r2(mv.from)} to ${r2(mv.to)}, a pullback that stopped at ${r2(mv.stop)}, then a further rise`),
    caption: L('התנועה, והתיקון שאחריה', 'The move, and the pullback after it'), tone: 'neutral', height: 420
  },
  {
    candles: MV, variant: 'price', options: { showVolume: false, dots: dots(MV, false), segments: fib(MV) },
    label: L(`אותה עלייה, עם רמות פיבונאצ׳י בין ${r2(mv.from)} ל־${r2(mv.to)}`, `The same rise, with Fibonacci levels between ${r2(mv.from)} and ${r2(mv.to)}`),
    caption: L(`הרמות בין ${r2(mv.from)} ל־${r2(mv.to)}`, `The levels between ${r2(mv.from)} and ${r2(mv.to)}`), subcaption: L('כל קו: השיא, פחות אחוז מגודל התנועה.', 'Each line: the high, minus a percentage of the move.'), tone: 'advanced', height: 440
  },
  {
    candles: DN, variant: 'price', options: { showVolume: false, dots: dots(DN, true), segments: fib(DN) },
    label: L(`ירידה מ־${r2(dn.from)} ל־${r2(dn.to)}, עם רמות פיבונאצ׳י שנמדדות למעלה מהשפל, ועלייה שנעצרה ב־${r2(dn.stop)}`, `A fall from ${r2(dn.from)} to ${r2(dn.to)}, with Fibonacci levels measured up from the low, and a rally that stopped at ${r2(dn.stop)}`),
    caption: L('בירידה: מהשיא אל השפל', 'In a fall: from the high to the low'), tone: 'bear', height: 440
  },
  {
    candles: TR, variant: 'price', options: { showVolume: false, dots: dots(TR, true) },
    label: L(`עלייה מ־${r2(tr.from)} ל־${r2(tr.to)}, ותיקון שנעצר ב־${r2(tr.stop)}`, `A rise from ${r2(tr.from)} to ${r2(tr.to)}, and a pullback that stopped at ${r2(tr.stop)}`),
    caption: L('כמה מהתנועה החזיר התיקון?', 'How much of the move did the pullback give back?'), tone: 'neutral', height: 420
  },
  {
    candles: AP, variant: 'price', options: { showVolume: false, dots: dots(AP, false), segments: fib(AP) },
    label: L(`עלייה מ־${r2(ap.from)} ל־${r2(ap.to)} עם רמות פיבונאצ׳י, ותיקון שחוצה את כולן`, `A rise from ${r2(ap.from)} to ${r2(ap.to)} with Fibonacci levels, and a pullback that cuts through all of them`),
    caption: L('גרף חדש', 'A new chart'), tone: 'neutral', height: 300
  },
  {
    candles: QL, variant: 'price', options: { showVolume: false, dots: dots(QL, false), segments: fib(QL) },
    label: L(`רמות פיבונאצ׳י מ־${r2(ql.from)} עד ${r2(ql.to)}, והתיקון שאחרי השיא`, `Fibonacci levels from ${r2(ql.from)} to ${r2(ql.to)}, and the pullback after the high`),
    caption: L('הרמות מסומנות', 'The levels, drawn'), tone: 'neutral', height: 320
  },
  {
    candles: QP, variant: 'price', options: { showVolume: false, dots: dots(QP, false) },
    label: L(`עלייה מ־${r2(qp.from)} ל־${r2(qp.to)}, בלי רמות`, `A rise from ${r2(qp.from)} to ${r2(qp.to)}, with no levels drawn`),
    caption: L('התנועה', 'The move'), tone: 'neutral', height: 320
  },
  {
    candles: QD, variant: 'price', options: { showVolume: false, dots: dots(QD, true) },
    label: L(`ירידה מ־${r2(qd.from)} ל־${r2(qd.to)}, ועלייה שנעצרה ב־${r2(qd.stop)}`, `A fall from ${r2(qd.from)} to ${r2(qd.to)}, and a rally that stopped at ${r2(qd.stop)}`),
    caption: L('ירידה, ותיקון כלפי מעלה', 'A fall, and a pullback upward'), tone: 'neutral', height: 320
  }
];
// Chart indexes: 0 the move · 1 the levels · 2 in a fall · 3 the Try chart · 4 apply · 5–7 questions.

export const T9: LessonContent = {
  id: 'T9',
  legacyId: 'l5',
  tutor: { topic: 'fibonacci', label: L('פיבונאצ׳י', 'Fibonacci') },
  teach: [
    {
      heading: L('מגמה נעה בגלים', 'A trend moves in waves'),
      paragraphs: [
        L(`בשיעור על מגמה ראיתם שמגמה עולה מטפסת במדרגות: עלייה, נסיגה, ושוב עלייה. כאן המחיר עלה מ־${r2(mv.from)} ל־${r2(mv.to)}, נסוג עד ${r2(mv.stop)}, ואז חזר לטפס — עד ${r2(maxAfter(MV))}.`,
          `In the lesson on trends you saw that an uptrend climbs in steps: a rise, a pullback, and a rise again. Here price rose from ${r2(mv.from)} to ${r2(mv.to)}, pulled back to ${r2(mv.stop)}, and then climbed again — to ${r2(maxAfter(MV))}.`),
        L(`השאלה שסוחרים שואלים על נסיגה כזו: כמה עמוק היא הגיעה? בנקודות, ${ltr(`${r2(mv.to)} − ${r2(mv.stop)} = ${r2(mv.to - mv.stop)}`)}. אבל מספר נקודות לבדו אומר מעט — ${r2(mv.to - mv.stop)} זה הרבה אחרי תנועה של ${r0(mv.size)} נקודות, ומעט אחרי תנועה של 200. לכן מודדים באחוזים מהתנועה: ${ltr(`${r2(mv.to - mv.stop)} ÷ ${r2(mv.size)} ≈ ${r0(retraced(MV))}%`)}.`,
          `The question traders ask about a pullback like this: how deep did it go? In points, ${r2(mv.to)} − ${r2(mv.stop)} = ${r2(mv.to - mv.stop)}. But points alone say little — ${r2(mv.to - mv.stop)} is a lot after a ${r0(mv.size)}-point move, and little after a 200-point one. So it is measured as a share of the move: ${r2(mv.to - mv.stop)} ÷ ${r2(mv.size)} ≈ ${r0(retraced(MV))}%.`),
        L('לזה קוראים תיקון (Retracement): החלק מהתנועה הקודמת שהמחיר החזיר. תיקון של כשליש ותיקון של כשני שלישים מתארים נסיגות שונות מאוד — ו"כלי הפיבונאצ׳י" רק מסמן נקודות קבועות על הסקאלה הזו.',
          'That is called a retracement: the share of the previous move that price gave back. A retracement of about a third and one of about two thirds describe very different pullbacks — and the Fibonacci tool simply puts fixed marks on that scale.')
      ],
      callouts: [{ kind: 'example', lead: L('מה מודדים', 'What you measure'), text: L(
        'שלושה מספרים — איפה התנועה התחילה, איפה היא נגמרה, ואיפה התיקון נעצר — ואחוז אחד שמתאר את הנסיגה.',
        'Three numbers — where the move started, where it ended, and where the pullback stopped — and one percentage that describes the pullback.') }],
      work: { kind: 'charts', charts: [0] }
    },
    {
      heading: L('חמישה יחסים, וקו לכל אחד', 'Five ratios, and a line for each'),
      paragraphs: [
        L(`כלי תיקוני פיבונאצ׳י (Fibonacci Retracement) מותח קווים אופקיים באחוזים קבועים מהתנועה: 23.6%, 38.2%, 50%, 61.8% ו־78.6%. מחיר כל קו = השיא פחות גודל התנועה כפול האחוז. בתנועה מ־${r0(mv.from)} ל־${r0(mv.to)}, קו ה־38.2% נמצא ב־${ltr(`${r0(mv.to)} − ${r0(mv.size)} × 0.382 = ${r2(level(MV, 0.382))}`)}, וקו ה־61.8% ב־${r2(level(MV, 0.618))}.`,
          `The Fibonacci retracement tool draws horizontal lines at fixed percentages of the move: 23.6%, 38.2%, 50%, 61.8% and 78.6%. Each line's price = the high minus the size of the move times the percentage. For the move from ${r0(mv.from)} to ${r0(mv.to)}, the 38.2% line sits at ${r0(mv.to)} − ${r0(mv.size)} × 0.382 = ${r2(level(MV, 0.382))}, and the 61.8% line at ${r2(level(MV, 0.618))}.`),
        L('מאיפה המספרים? מסדרת פיבונאצ׳י (1, 1, 2, 3, 5, 8, 13, 21, 34…), שבה כל מספר הוא סכום השניים שלפניו. מחלקים מספר בזה שאחריו ומתקרבים ל־0.618; בזה שבא שניים אחריו — ל־0.382; שלושה אחריו — ל־0.236. ו־50%? הוא בכלל לא יחס פיבונאצ׳י: הוא נוסף כי שווקים מחזירים לא פעם כמחצית מתנועה — תצפית ותיקה יותר, מתורת דאו.',
          'Where do the numbers come from? From the Fibonacci sequence (1, 1, 2, 3, 5, 8, 13, 21, 34…), where each number is the sum of the two before it. Divide a number by the next one and you approach 0.618; by the one two places on, 0.382; three places on, 0.236. And 50%? It is not a Fibonacci ratio at all: it was added because markets often give back about half of a move — an older observation, from Dow Theory.'),
        L(`בגרף, התיקון נעצר ב־${r2(mv.stop)} — ${r2(mv.stop - level(MV, 0.618))} מעל קו ה־61.8% (${r2(level(MV, 0.618))}). האם היחס "גרם" למחיר לעצור? לא — אין במספרים שום קסם. כל כך הרבה סוחרים, אלגוריתמים וקרנות מותחים את אותם קווים, שפקודות מצטברות לידם — ולכן הם לפעמים מחזיקים. זו במידה מסוימת נבואה שמגשימה את עצמה, והיא עובדת רק כל עוד מספיק אנשים מסתכלים.`,
          `On the chart the pullback stopped at ${r2(mv.stop)} — ${r2(mv.stop - level(MV, 0.618))} above the 61.8% line (${r2(level(MV, 0.618))}). Did the ratio "make" price stop? No — there is nothing magic in the numbers. So many traders, algorithms and funds draw the same lines that orders gather near them — which is why they sometimes hold. It is partly a self-fulfilling prophecy, and it works only as long as enough people are watching.`)
      ],
      callouts: [{ kind: 'caveat', lead: L('שימו לב', 'Watch out'), text: L('הרמות מסמנות איפה הרבה אנשים מסתכלים — לא איפה המחיר חייב לעצור.', 'The levels mark where many people are watching — not where price has to stop.') }],
      work: { kind: 'charts', charts: [1] }
    },
    {
      heading: L('מאיפה לאן מותחים', 'Where to draw it from, and to'),
      paragraphs: [
        L('הכלי נמתח תמיד על תנועה אחת שהסתיימה — מההתחלה שלה עד הסוף שלה. בעלייה: מהשפל אל השיא, והרמות נמדדות מהשיא כלפי מטה. בירידה: מהשיא אל השפל, והרמות נמדדות מהשפל כלפי מעלה.',
          'The tool is always drawn over one completed move — from its start to its end. In a rise: from the swing low to the swing high, with the levels measured down from the high. In a fall: from the swing high to the swing low, with the levels measured up from the low.'),
        L(`כאן הירידה הייתה מ־${r2(dn.from)} ל־${r2(dn.to)}. קו ה־38.2% נמצא ב־${ltr(`${r0(dn.to)} + ${r0(dn.size)} × 0.382 = ${r2(level(DN, 0.382))}`)} — והעלייה נעצרה ב־${r2(dn.stop)}, ואז הירידה חזרה, עד ${r2(minAfter(DN))}.`,
          `Here the fall ran from ${r2(dn.from)} to ${r2(dn.to)}. The 38.2% line is at ${r0(dn.to)} + ${r0(dn.size)} × 0.382 = ${r2(level(DN, 0.382))} — and the rally stopped at ${r2(dn.stop)}, then the fall resumed, down to ${r2(minAfter(DN))}.`),
        L('שתי טעויות נפוצות: לבחור נקודות שאינן הקצוות של התנועה (שפל באמצע העלייה, למשל) — וכל הרמות זזות איתן; ולמתוח את הכלי לפני שהתנועה נגמרה, כשעוד לא ברור איפה השיא שלה. אנשים שונים בוחרים נקודות קצת שונות — עוד סיבה לקרוא כל קו כאזור, לא כמחיר מדויק.',
          'Two common mistakes: picking points that are not the ends of the move (a low halfway up the rise, say) — every level moves with them; and drawing the tool before the move has ended, when it is not yet clear where its high is. Different people pick slightly different points — one more reason to read each line as an area, not an exact price.')
      ],
      notesTitle: L('שאלה למחשבה', 'Something to think about'),
      notes: [
        { tone: 'neutral', label: L('מהצל או מגוף הנר?', 'From the wick or from the body?'),
          explanation: L('רוב האנשים מותחים מהקצה של הצל — השפל והשיא האמיתיים של התנועה. יש שמותחים ממחירי הסגירה. ההבדל מזיז את הרמות מעט, ולכן גם כאן: אזור, לא קו דק.', 'Most people draw from the tip of the wick — the move\'s true low and high. Some draw from the closing prices. The difference shifts the levels a little, so here too: an area, not a thin line.') }
      ],
      work: { kind: 'charts', charts: [2] }
    }
  ],
  charts: T9_CHARTS,
  activity: {
    kind: 'calculate',
    prompt: L('עד איפה חזר התיקון?', 'How far back did it go?'),
    task: L(`התנועה עלתה מ־${r2(tr.from)} ל־${r2(tr.to)}, והתיקון שאחריה נעצר ב־${r2(tr.stop)}. כמה אחוזים מהתנועה החזיר התיקון? עגלו לספרה אחת אחרי הנקודה.`,
      `The move rose from ${r2(tr.from)} to ${r2(tr.to)}, and the pullback after it stopped at ${r2(tr.stop)}. What percentage of the move did the pullback give back? Round to one decimal place.`),
    chart: 3,
    answer: +r1(trPct),
    tolerance: 0.6,
    field: L('אחוז התיקון', 'Retracement, %'),
    mistakes: [
      { value: 100 - trPct, tolerance: 0.6, why: L(`זה יצא הפוך: מדדתם מהשפל (${ltr(`${r2(tr.stop)} − ${r2(tr.from)}`)}) — כמה מהתנועה נשאר. התיקון נמדד מהשיא: כמה המחיר החזיר.`, `That came out the other way round: you measured from the low (${r2(tr.stop)} − ${r2(tr.from)}) — how much of the move is left. The retracement is measured from the high: how much price gave back.`) },
      { value: tr.to - tr.stop, tolerance: 0.05, why: L(`${r2(tr.to - tr.stop)} הן הנקודות שהמחיר החזיר. עוד צעד: לחלק בגודל התנועה (${r2(tr.size)}) ולהכפיל ב־100.`, `${r2(tr.to - tr.stop)} is the points price gave back. One more step: divide by the size of the move (${r2(tr.size)}) and multiply by 100.`) },
      { value: ((tr.to - tr.stop) / tr.to) * 100, tolerance: 0.5, why: L(`חילקתם במחיר השיא. התיקון הוא חלק מהתנועה — מחלקים בגודל שלה, ${ltr(`${r2(tr.to)} − ${r2(tr.from)} = ${r2(tr.size)}`)}.`, `You divided by the price at the high. A retracement is a share of the move — divide by its size, ${r2(tr.to)} − ${r2(tr.from)} = ${r2(tr.size)}.`) }
    ],
    steps: [
      L(`גודל התנועה: ${ltr(`${r2(tr.to)} − ${r2(tr.from)} = ${r2(tr.size)}`)}`, `Size of the move: ${r2(tr.to)} − ${r2(tr.from)} = ${r2(tr.size)}`),
      L(`כמה המחיר החזיר: ${ltr(`${r2(tr.to)} − ${r2(tr.stop)} = ${r2(tr.to - tr.stop)}`)}`, `How much price gave back: ${r2(tr.to)} − ${r2(tr.stop)} = ${r2(tr.to - tr.stop)}`),
      L(`באחוזים מהתנועה: ${ltr(`${r2(tr.to - tr.stop)} ÷ ${r2(tr.size)} × 100 = ${r1(trPct)}%`)}`, `As a share of the move: ${r2(tr.to - tr.stop)} ÷ ${r2(tr.size)} × 100 = ${r1(trPct)}%`)
    ],
    right: L(`${r1(trPct)}%: התיקון החזיר קצת יותר משליש מהתנועה, ונעצר כמעט בדיוק ליד קו ה־38.2% (${r2(level(TR, 0.382))}).`,
      `${r1(trPct)}%: the pullback gave back a little over a third of the move, and stopped almost exactly by the 38.2% line (${r2(level(TR, 0.382))}).`),
    off: L('עוד לא. שלושה צעדים: גודל התנועה (שיא פחות שפל), כמה המחיר החזיר (שיא פחות נקודת העצירה), ואז החלק השני בראשון, כפול 100.', 'Not yet. Three steps: the size of the move (high minus low), how much price gave back (high minus where it stopped), then the second divided by the first, times 100.'),
    reveal: { segments: fib(TR) },
    explain: [
      L(`על הגרף עכשיו כל הרמות: ${RATIOS.slice(0, 4).map((r) => `${pct(r)} ב־${r2(level(TR, r))}`).join(', ')}. התיקון נעצר ב־${r2(tr.stop)}, ליד קו ה־38.2% — תיקון רדוד. אחריו המחיר עלה עד ${r2(maxAfter(TR))}.`,
        `All the levels are on the chart now: ${RATIOS.slice(0, 4).map((r) => `${pct(r)} at ${r2(level(TR, r))}`).join(', ')}. The pullback stopped at ${r2(tr.stop)}, by the 38.2% line — a shallow pullback. After it, price rose to ${r2(maxAfter(TR))}.`),
      L('אבל "נעצר ב־38.2%" הוא תיאור בדיעבד. בזמן אמת אף אחד לא ידע אם התיקון ייעצר ב־38.2%, ב־50%, ב־61.8% — או באף אחד מהם. הקו סימן איפה רבים מסתכלים; הקונים שהגיעו לשם הם שעצרו את הירידה.',
        'But "stopped at 38.2%" is a description after the fact. At the time, nobody knew whether the pullback would stop at 38.2%, 50%, 61.8% — or at none of them. The line marked where many were watching; the buyers who showed up there are what stopped the fall.')
    ]
  },
  apply: {
    id: 't9-apply', lesson: 'T9', category: 'technical', chart: 4,
    question: L(`בגרף החדש הכלי נמתח מ־${r2(ap.from)} ל־${r2(ap.to)}. התיקון חצה את כל הרמות וירד עד ${r2(ap.stop)} — מתחת לשפל שממנו נמדדו. מה זה אומר?`,
      `In the new chart the tool is drawn from ${r2(ap.from)} to ${r2(ap.to)}. The pullback cut through every level and fell to ${r2(ap.stop)} — below the low they were measured from. What does that tell you?`),
    options: [
      { key: 'a', text: L('הכלי נמתח לא נכון — פיבונאצ׳י תמיד עוצר את המחיר', 'The tool was drawn wrongly — Fibonacci always stops price') },
      { key: 'b', text: L('הרמות הן נקודות ייחוס, לא רצפות: אף אחת לא החזיקה, והמחיר החזיר את כל העלייה ועשה שפל נמוך יותר', 'The levels are reference points, not floors: none held, and price gave back the whole rise and made a lower low') },
      { key: 'c', text: L('כדאי לקנות ב־78.6%, כי שם זה תמיד מתהפך', 'Buy at 78.6%, because that is where it always turns') },
      { key: 'd', text: L('פיבונאצ׳י עובד רק במניות שמחירן מעל 100', 'Fibonacci only works on stocks priced above 100') }
    ],
    correctKey: 'b',
    explanation: L(`המחיר עבר את 38.2% (${r2(level(AP, 0.382))}), את 50% (${r2(level(AP, 0.5))}), את 61.8% (${r2(level(AP, 0.618))}) ואת 78.6% (${r2(level(AP, 0.786))}), וירד עד ${r2(ap.stop)}. הכלי נמתח נכון — פשוט אף רמה לא החזיקה. וכשתיקון יורד מתחת לנקודה שממנה העלייה התחילה, זו כבר לא נסיגה בתוך מגמה עולה: זה שפל נמוך יותר.`,
      `Price went through 38.2% (${r2(level(AP, 0.382))}), 50% (${r2(level(AP, 0.5))}), 61.8% (${r2(level(AP, 0.618))}) and 78.6% (${r2(level(AP, 0.786))}), down to ${r2(ap.stop)}. The tool was drawn correctly — no level simply held. And once a pullback falls below the point the rise started from, it is no longer a pullback in an uptrend: it is a lower low.`)
  },
  takeaway: {
    bottomLine: L('תיקון פיבונאצ׳י מודד נסיגה כחלק מהתנועה שלפניה — 23.6%, 38.2%, 50%, 61.8%, 78.6% — והכלי נמתח מתחילת התנועה עד סופה: בעלייה מהשפל לשיא, בירידה מהשיא לשפל.',
      'A Fibonacci retracement measures a pullback as a share of the move before it — 23.6%, 38.2%, 50%, 61.8%, 78.6% — and the tool is drawn from the move\'s start to its end: in a rise from the low to the high, in a fall from the high to the low.'),
    caveat: L('הרמות הן נקודות ייחוס שהרבה אנשים מסתכלים עליהן, לא רצפות: תיקון יכול לעצור בכל מקום, או לחצות את כולן. איזו רמה "עבדה" יודעים רק בדיעבד.',
      'The levels are reference points many people watch, not floors: a pullback can stop anywhere, or go through all of them. Which level "worked" is only known afterwards.')
  },
  questions: [
    q('t9-which-level', 5, 'beginner',
      L(`הרמות נמתחו מהשפל (${r2(ql.from)}) אל השיא (${r2(ql.to)}). ליד איזו רמה נעצר התיקון?`, `The levels are drawn from the low (${r2(ql.from)}) to the high (${r2(ql.to)}). Near which level did the pullback stop?`),
      [['a', L('23.6%', '23.6%')], ['b', L('38.2%', '38.2%')], ['c', L('50%', '50%')], ['d', L('61.8%', '61.8%')]], 'c',
      L(`התיקון נעצר ב־${r2(ql.stop)}: ${ltr(`(${r2(ql.to)} − ${r2(ql.stop)}) ÷ ${r2(ql.size)} = ${r0(retraced(QL))}%`)}. ודווקא 50% היא הרמה היחידה בכלי שאינה יחס פיבונאצ׳י.`,
        `The pullback stopped at ${r2(ql.stop)}: (${r2(ql.to)} − ${r2(ql.stop)}) ÷ ${r2(ql.size)} = ${r0(retraced(QL))}%. And 50% happens to be the one level on the tool that is not a Fibonacci ratio.`)),
    q('t9-level-price', 6, 'intermediate',
      L(`התנועה עלתה מ־${r2(qp.from)} ל־${r2(qp.to)}. באיזה מחיר נמצאת רמת ה־61.8%?`, `The move rose from ${r2(qp.from)} to ${r2(qp.to)}. At what price is the 61.8% level?`),
      [['a', L(r2(level(QP, 0.618)), r2(level(QP, 0.618)))], ['b', L(r2(qp.from + qp.size * 0.618), r2(qp.from + qp.size * 0.618))], ['c', L(r2(level(QP, 0.5)), r2(level(QP, 0.5)))], ['d', L(r2(qp.size * 0.618), r2(qp.size * 0.618))]], 'a',
      L(`בעלייה הרמות נמדדות מהשיא כלפי מטה: ${ltr(`${r2(qp.to)} − ${r2(qp.size)} × 0.618 = ${r2(level(QP, 0.618))}`)}. ${r2(qp.from + qp.size * 0.618)} הוא אותו חישוב מהשפל כלפי מעלה — וזו בדיוק רמת ה־38.2%. ובגרף הזה התיקון נעצר בכלל ב־${r2(qp.stop)}, בין 38.2% ל־50% — לא על אף קו.`,
        `In a rise the levels are measured down from the high: ${r2(qp.to)} − ${r2(qp.size)} × 0.618 = ${r2(level(QP, 0.618))}. ${r2(qp.from + qp.size * 0.618)} is the same sum counted up from the low — which is exactly the 38.2% level. And on this chart the pullback actually stopped at ${r2(qp.stop)}, between 38.2% and 50% — on no line at all.`)),
    q('t9-downtrend', 7, 'intermediate',
      L(`בירידה מ־${r2(qd.from)} ל־${r2(qd.to)}, העלייה שאחריה נעצרה ב־${r2(qd.stop)}. כמה מהירידה היא החזירה?`, `In this fall from ${r2(qd.from)} to ${r2(qd.to)}, the rally after it stopped at ${r2(qd.stop)}. How much of the fall did it retrace?`),
      [['a', L('כ־38.2%', 'About 38.2%')], ['b', L('כ־61.8%', 'About 61.8%')], ['c', L('כ־50%', 'About 50%')], ['d', L('כ־23.6%', 'About 23.6%')]], 'a',
      L(`בירידה התיקון נמדד מהשפל כלפי מעלה: ${ltr(`(${r2(qd.stop)} − ${r2(qd.to)}) ÷ ${r2(qd.size)} = ${r0(retraced(QD))}%`)}. מי שמודד מהשיא מקבל ${r0(100 - retraced(QD))}% — כמה מהירידה עוד לא הוחזר. אחרי העצירה המחיר חזר לרדת, עד ${r2(minAfter(QD))}.`,
        `In a fall the retracement is measured up from the low: (${r2(qd.stop)} − ${r2(qd.to)}) ÷ ${r2(qd.size)} = ${r0(retraced(QD))}%. Measuring from the high gives ${r0(100 - retraced(QD))}% — how much of the fall has not been won back. After the rally stopped, price fell again, to ${r2(minAfter(QD))}.`)),
    // The previous build's l5 questions: what the levels mark, 50%, and why they sometimes "work".
    ...(getQuizQuestions({}) as QuizQuestion[]).filter((x) => x.lesson === 'l5')
  ]
};
