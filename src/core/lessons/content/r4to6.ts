// ---------------------------------------------------------------------------
// Risk, module 2 (part one) — managing a trade and yourself: R4 (position
// size), R5 (stop-loss, take-profit and risk/reward), R6 (biases).
//
// Sources: the approved curriculum and the Artifact's page 10 (10.1 the
// position calculator: ₪50,000, 1%, entry 100, stop 95; 10.2 the trade at 104
// with a stop at 101 and a target at 111.50; 10.5 the two-stock scenario).
// Builds on R1 (the maths of a loss) and T12 (a stop is where the idea is
// wrong) without re-teaching them. The portfolio as a whole is R8's.
// Sizes and ratios come from @core/calculators/tools — the same functions the
// Tools pages use — so the lessons and the calculators cannot disagree.
// ---------------------------------------------------------------------------
import type { LessonChartSpec } from '@core/charts/lessonCharts';
import * as series from '@core/charts/series.js';
import type { Diagram, LessonContent } from './types';
import { ACCOUNT, BIAS, GAP_PCT, R4_OVER, R4_Q, R4_STOPS, R4_TRADE, R4_TRY, R5_POOR, R5_Q, R5_TRADE, R6_ANCHOR, R6_FOMO } from '@core/risk/scenarios';
import { positionSize, riskReward, tenTrades } from '@core/calculators/tools';
import { L, ltr, n0, n1, n2, pc, nums, money, rq } from './riskKit';

// ---------- R4 · position size ----------
const size = (account: number, riskPct: number, entry: number, stop: number) => positionSize({ account, riskPct, entry, stop, side: 'long' })!;
const base = size(ACCOUNT, R4_TRADE.riskPct, R4_TRADE.entry, R4_TRADE.stop);
const byStop = R4_STOPS.map((s) => ({ stop: s, r: size(ACCOUNT, R4_TRADE.riskPct, R4_TRADE.entry, s) }));
const streak = (pct: number) => ACCOUNT * (1 - pct / 100) ** 10;
const STREAK_RISKS = [1, 5, 10];
const t4 = size(R4_TRY.account, R4_TRY.riskPct, R4_TRY.entry, R4_TRY.stop);
const t4Wide = size(R4_TRY.account, R4_TRY.riskPct, R4_TRY.entry, R4_TRY.entry - 2 * (R4_TRY.entry - R4_TRY.stop));
const GAP = GAP_PCT, OVER = R4_OVER;
const over = size(OVER.account, OVER.riskPct, OVER.entry, OVER.stop);
const Q1 = R4_Q, q1 = size(Q1.account, Q1.riskPct, Q1.entry, Q1.stop);
const stopsTable: Diagram = { type: 'table', title: L(`אותו סיכון (${R4_TRADE.riskPct}%), סטופים שונים`, `The same risk (${R4_TRADE.riskPct}%), different stops`), columns: [L('סטופ', 'Stop'), L('מניות', 'Shares'), L('שווי הפוזיציה', 'Position value'), L('חלק מהחשבון', 'Share of the account'), L('הפסד אם הסטופ נפגע', 'Loss if the stop is hit')],
  rows: byStop.map(({ stop, r }) => ({ label: L(n2(stop), n2(stop)), cells: [n0(r.shares), money(r.cost), pc(r.portion * 100, 0), money(r.loss)], ...(stop === R4_TRADE.stop ? { mark: [0] } : {}) })) };

export const R4: LessonContent = {
  id: 'R4',
  tutor: { topic: 'position-sizing', label: L('גודל פוזיציה', 'position sizing') },
  teach: [
    {
      heading: L('מתחילים מההפסד, לא מהרווח', 'Start from the loss, not the profit'),
      paragraphs: [
        L(`השאלה הראשונה לפני עסקה היא לא "כמה אפשר להרוויח" אלא "כמה מותר להפסיד". כלל נפוץ: לא לסכן יותר מ־1%–2% מהחשבון בעסקה אחת. בחשבון של ${money(ACCOUNT).he}, סיכון של ${R4_TRADE.riskPct}% הוא ${money(base.riskAmount).he}.`,
          `The first question before a trade is not "how much can I make" but "how much am I allowed to lose". A common rule: do not risk more than 1%–2% of the account on one trade. In a ${money(ACCOUNT).en} account, a ${R4_TRADE.riskPct}% risk is ${money(base.riskAmount).en}.`),
        L(`למה כל כך מעט? כי הפסדים מגיעים ברצף. עשר עסקאות מפסידות ברצף — משהו שקורה גם לסוחרים טובים — משאירות מחשבון של ${money(ACCOUNT).he}: ${STREAK_RISKS.map((p) => `${money(streak(p)).he} בסיכון של ${p}%`).join('; ')}.`,
          `Why so little? Because losses come in streaks. Ten losing trades in a row — which happens to good traders too — leave a ${money(ACCOUNT).en} account at: ${STREAK_RISKS.map((p) => `${money(streak(p)).en} at ${p}% risk`).join('; ')}.`),
        L(`ובשיעור הראשון ראיתם שירידה עמוקה דורשת עלייה גדולה עוד יותר כדי לחזור. בסיכון של 1%, רצף רע הוא שריטה; ב־10%, הוא בור שקשה לצאת ממנו.`, `And in the first lesson you saw that a deep fall needs an even bigger rise to get back. At 1% risk a bad streak is a scratch; at 10% it is a hole that is hard to climb out of.`)
      ],
      callouts: [{ kind: 'example', lead: L('הכלל', 'The rule'), text: L('קודם מחליטים כמה מותר להפסיד בעסקה. כל השאר נגזר מזה.', 'First decide how much you may lose on the trade. Everything else follows from that.') }],
      work: { kind: 'diagram', diagram: { type: 'bars', title: L(`אחרי 10 הפסדים ברצף · חשבון של ${money(ACCOUNT).he}`, `After 10 losses in a row · a ${money(ACCOUNT).en} account`), bars: STREAK_RISKS.map((p, i) => ({ label: L(`סיכון ${p}% לעסקה`, `${p}% risk per trade`), value: streak(p), tone: (['ok', 'learn', 'err'] as const)[i]!, shown: money(streak(p)) })) } }
    },
    {
      heading: L('הנוסחה', 'The formula'),
      paragraphs: [
        L('גודל הפוזיציה (Position Size) — כמה מניות לקנות — נגזר משני דברים: כמה כסף מותר להפסיד, וכמה מפסידים על כל מניה אם הסטופ נפגע. מחלקים את הראשון בשני.',
          'Position size — how many shares to buy — comes from two things: how much money you may lose, and how much you lose on each share if the stop is hit. Divide the first by the second.'),
        L(`מניות = (חשבון × סיכון%) ÷ (כניסה − סטופ). בדוגמה של הלוח: ${ltr(`(${n0(ACCOUNT)} × ${R4_TRADE.riskPct}%) ÷ (${n2(R4_TRADE.entry)} − ${n2(R4_TRADE.stop)}) = ${n0(base.riskAmount)} ÷ ${n2(base.perShare)} = ${n0(base.shares)}`)} מניות.`,
          `Shares = (account × risk%) ÷ (entry − stop). In the board's example: (${n0(ACCOUNT)} × ${R4_TRADE.riskPct}%) ÷ (${n2(R4_TRADE.entry)} − ${n2(R4_TRADE.stop)}) = ${n0(base.riskAmount)} ÷ ${n2(base.perShare)} = ${n0(base.shares)} shares.`),
        L(`שימו לב מה לא נמצא בנוסחה: כמה אתם "מאמינים" בעסקה, או כמה כסף יש בחשבון לקנות. הפוזיציה עולה ${money(base.cost).he} — ${pc(base.portion * 100, 0)} מהחשבון — אבל אם הסטופ נפגע, ההפסד הוא ${money(base.loss).he} בדיוק.`,
          `Notice what is not in the formula: how much you "believe" in the trade, or how much cash the account has to buy with. The position costs ${money(base.cost).en} — ${pc(base.portion * 100, 0)} of the account — but if the stop is hit, the loss is exactly ${money(base.loss).en}.`)
      ],
      work: { kind: 'diagram', diagram: { type: 'flow', title: L('מההפסד המותר לכמות', 'From the allowed loss to the size'), stages: [
        { label: L(`${R4_TRADE.riskPct}% מהחשבון`, `${R4_TRADE.riskPct}% of the account`), sub: L(`${money(base.riskAmount).he} מותר להפסיד`, `${money(base.riskAmount).en} may be lost`) },
        { label: L('מרחק לסטופ', 'Distance to the stop'), sub: L(`${n2(R4_TRADE.entry)} − ${n2(R4_TRADE.stop)} = ${n2(base.perShare)} למניה`, `${n2(R4_TRADE.entry)} − ${n2(R4_TRADE.stop)} = ${n2(base.perShare)} a share`) },
        { label: L(`${n0(base.shares)} מניות`, `${n0(base.shares)} shares`), sub: L(`${n0(base.riskAmount)} ÷ ${n2(base.perShare)}`, `${n0(base.riskAmount)} ÷ ${n2(base.perShare)}`) }
      ] } }
    },
    {
      heading: L(`חשבון של ${money(ACCOUNT).he}`, `A ${money(ACCOUNT).en} account`),
      paragraphs: [
        L(`אותו חשבון, אותו סיכון של ${R4_TRADE.riskPct}%, שלושה סטופים. סטופ קרוב (${n2(R4_STOPS[0]!)}) — ${n0(byStop[0]!.r.shares)} מניות; רחוק (${n2(R4_STOPS[2]!)}) — ${n0(byStop[2]!.r.shares)} מניות. בכל שלושת המקרים, אם הסטופ נפגע, ההפסד הוא ${money(base.riskAmount).he}.`,
          `The same account, the same ${R4_TRADE.riskPct}% risk, three stops. A close stop (${n2(R4_STOPS[0]!)}) — ${n0(byStop[0]!.r.shares)} shares; a far one (${n2(R4_STOPS[2]!)}) — ${n0(byStop[2]!.r.shares)} shares. In all three cases, if the stop is hit, the loss is ${money(base.riskAmount).en}.`),
        L(`זה הרעיון המרכזי: הכמות משתנה כדי שהסיכון לא ישתנה. אבל שימו לב לעמודת "חלק מהחשבון": עם הסטופ הקרוב, ${pc(byStop[0]!.r.portion * 100, 0)} מהחשבון יושב במניה אחת.`,
          `That is the central idea: the size changes so the risk does not. But look at the "share of the account" column: with the close stop, ${pc(byStop[0]!.r.portion * 100, 0)} of the account sits in one stock.`),
        L('וסטופ לא מבטיח את המחיר שלו: אם המניה נפתחת בבוקר בפער מתחת לסטופ — כמו פערי הפתיחה שראיתם אחרי דוחות — ההפסד גדול מהמתוכנן. לכן גם כשהנוסחה מרשה, מגבילים כמה מהחשבון נכנס למניה אחת.',
          'And a stop does not guarantee its price: if the stock opens in the morning with a gap below the stop — like the gaps you saw after earnings reports — the loss is bigger than planned. So even when the formula allows it, you cap how much of the account goes into one stock.')
      ],
      work: { kind: 'diagram', diagram: stopsTable }
    }
  ],
  charts: [],
  activity: {
    kind: 'calculate',
    prompt: L('כמה מניות?', 'How many shares?'),
    task: L(`חשבון של ${money(R4_TRY.account).he}, סיכון של ${R4_TRY.riskPct}% לעסקה. כניסה ב־${n2(R4_TRY.entry)}, סטופ ב־${n2(R4_TRY.stop)}. כמה מניות לקנות? (מספר שלם)`, `A ${money(R4_TRY.account).en} account, ${R4_TRY.riskPct}% risk per trade. Entry at ${n2(R4_TRY.entry)}, stop at ${n2(R4_TRY.stop)}. How many shares to buy? (a whole number)`),
    diagram: { type: 'table', title: L('העסקה', 'The trade'), columns: [L('נתון', 'Figure'), L('ערך', 'Value')], rows: [
      { label: L('גודל החשבון', 'Account size'), cells: [money(R4_TRY.account)] },
      { label: L('סיכון לעסקה', 'Risk per trade'), cells: [pc(R4_TRY.riskPct)] },
      { label: L('מחיר כניסה', 'Entry price'), cells: [n2(R4_TRY.entry)] },
      { label: L('מחיר סטופ', 'Stop price'), cells: [n2(R4_TRY.stop)] }
    ], caption: L('מניות = (חשבון × סיכון%) ÷ (כניסה − סטופ)', 'Shares = (account × risk%) ÷ (entry − stop)') },
    answer: t4.shares,
    tolerance: 1,
    field: L('מספר מניות', 'Number of shares'),
    mistakes: [
      { value: t4.riskAmount / R4_TRY.entry, tolerance: 1, why: L('חילקתם במחיר הכניסה. מחלקים במרחק לסטופ — כמה מפסידים על כל מניה אם הסטופ נפגע.', 'You divided by the entry price. Divide by the distance to the stop — how much each share loses if the stop is hit.') },
      { value: t4.riskAmount / R4_TRY.stop, tolerance: 1, why: L('חילקתם במחיר הסטופ. מחלקים בהפרש בין הכניסה לסטופ.', 'You divided by the stop price. Divide by the difference between entry and stop.') },
      { value: (R4_TRY.account * R4_TRY.riskPct * 0.1) / (R4_TRY.entry - R4_TRY.stop), tolerance: 1, why: L(`${R4_TRY.riskPct}% הם ${n0(t4.riskAmount)}, לא ${n0(R4_TRY.account * R4_TRY.riskPct * 0.1)}: חשבון × ${R4_TRY.riskPct / 100}.`, `${R4_TRY.riskPct}% is ${n0(t4.riskAmount)}, not ${n0(R4_TRY.account * R4_TRY.riskPct * 0.1)}: account × ${R4_TRY.riskPct / 100}.`) },
      { value: R4_TRY.account / R4_TRY.entry, tolerance: 1, why: L('זה כמה מניות אפשר לקנות בכל החשבון — לא כמה מותר, בסיכון שנבחר.', 'That is how many shares the whole account can buy — not how many the chosen risk allows.') }
    ],
    steps: [
      L(`מותר להפסיד: ${ltr(`${n0(R4_TRY.account)} × ${R4_TRY.riskPct}% = ${n0(t4.riskAmount)}`)}`, `Allowed loss: ${n0(R4_TRY.account)} × ${R4_TRY.riskPct}% = ${n0(t4.riskAmount)}`),
      L(`מרחק לסטופ: ${ltr(`${n2(R4_TRY.entry)} − ${n2(R4_TRY.stop)} = ${n2(t4.perShare)}`)}`, `Distance to the stop: ${n2(R4_TRY.entry)} − ${n2(R4_TRY.stop)} = ${n2(t4.perShare)}`),
      L(`מניות: ${ltr(`${n0(t4.riskAmount)} ÷ ${n2(t4.perShare)} = ${n0(t4.shares)}`)}`, `Shares: ${n0(t4.riskAmount)} ÷ ${n2(t4.perShare)} = ${n0(t4.shares)}`)
    ],
    right: L(`${n0(t4.shares)} מניות: פוזיציה של ${money(t4.cost).he}, ${pc(t4.portion * 100, 0)} מהחשבון — ואם הסטופ נפגע, הפסד של ${money(t4.loss).he} בדיוק.`, `${n0(t4.shares)} shares: a ${money(t4.cost).en} position, ${pc(t4.portion * 100, 0)} of the account — and if the stop is hit, a loss of exactly ${money(t4.loss).en}.`),
    off: L('עוד לא. שלושה צעדים: כמה מותר להפסיד (חשבון × סיכון%), כמה מפסידה כל מניה (כניסה − סטופ), ואז הראשון חלקי השני.', 'Not yet. Three steps: how much may be lost (account × risk%), how much each share loses (entry − stop), then the first divided by the second.'),
    explain: [
      L(`הכמות משתנה, הסיכון לא: אם הסטופ היה רחוק פי שניים (${n2(R4_TRY.entry - 2 * t4.perShare)}), הייתם קונים ${n0(t4Wide.shares)} מניות — וההפסד בסטופ היה נשאר ${money(t4Wide.loss).he}. זה מה שמאפשר לשים את הסטופ במקום הנכון על הגרף, ולא במקום ש"נוח" לחשבון.`,
        `The size moves, the risk does not: if the stop were twice as far (${n2(R4_TRY.entry - 2 * t4.perShare)}), you would buy ${n0(t4Wide.shares)} shares — and the loss at the stop would stay ${money(t4Wide.loss).en}. That is what lets you put the stop in the right place on the chart, not where it is "convenient" for the account.`),
      L(`ומעל העסקה הבודדת: הקצאה (Asset Allocation) היא ההחלטה איזה חלק מכל התיק הולך לכל סוג נכס, ואיזון מחדש (Rebalancing) מחזיר את החלקים ליעד אחרי שהשוק הזיז אותם. בפרויקט של המסלול תבנו אחד כזה.`,
        `And above the single trade: asset allocation is the decision on what share of the whole portfolio goes to each kind of asset, and rebalancing brings the shares back to target after the market has moved them. In the track's project you will build one.`)
    ]
  },
  apply: rq('r4-apply', 'R4', { type: 'table', title: L('סטופ צמוד מאוד', 'A very tight stop'), columns: [L('נתון', 'Figure'), L('ערך', 'Value')], rows: [
    { label: L('חשבון', 'Account'), cells: [money(OVER.account)] },
    { label: L('סיכון לעסקה', 'Risk per trade'), cells: [pc(OVER.riskPct, 0)] },
    { label: L('כניסה ← סטופ', 'Entry → stop'), cells: [`${n2(OVER.entry)} → ${n2(OVER.stop)}`] },
    { label: L('מה הנוסחה נותנת', 'What the formula gives'), cells: [L(`${n0(over.shares)} מניות · ${money(over.cost).he}`, `${n0(over.shares)} shares · ${money(over.cost).en}`)] }
  ] }, 'intermediate',
    L('הנוסחה אומרת לקנות מניות בשווי כפול מהחשבון. מה הבעיה?', 'The formula says to buy shares worth twice the account. What is the problem?'),
    [
      ['a', L('סטופ צמוד מנפח את הכמות: צריך תקרה על החלק מהחשבון שנכנס לעסקה אחת', 'A tight stop inflates the size: you need a cap on how much of the account goes into one trade')],
      ['b', L('אין בעיה — ההפסד בסטופ עדיין 2%', 'No problem — the loss at the stop is still 2%')],
      ['c', L('צריך להגדיל את הסיכון ל־10%', 'Raise the risk to 10%')],
      ['d', L('הנוסחה שגויה', 'The formula is wrong')]
    ], 'a',
    L(`סטופ במרחק ${n2(OVER.entry - OVER.stop)} בלבד מחייב ${n0(over.shares)} מניות — ${money(over.cost).he}, פי ${n1(over.portion)} מהחשבון. ההפסד בסטופ "רק" ${money(over.loss).he}, אבל פער פתיחה של ${GAP}% היה עולה ${money(over.cost * (GAP / 100)).he}. לכן לצד הנוסחה שמים תקרה לגודל הפוזיציה.`,
      `A stop only ${n2(OVER.entry - OVER.stop)} away demands ${n0(over.shares)} shares — ${money(over.cost).en}, ${n1(over.portion)} times the account. The loss at the stop is "only" ${money(over.loss).en}, but a ${GAP}% opening gap would cost ${money(over.cost * (GAP / 100)).en}. So next to the formula you set a cap on position size.`)),
  takeaway: {
    bottomLine: L('גודל פוזיציה מתחיל מההפסד המותר: מניות = (חשבון × סיכון%) ÷ (כניסה − סטופ). הכמות משתנה עם מרחק הסטופ; ההפסד המתוכנן לא.', 'Position size starts from the allowed loss: shares = (account × risk%) ÷ (entry − stop). The size changes with the stop distance; the planned loss does not.'),
    caveat: L('סטופ לא מבטיח את המחיר — פער פתיחה יכול לעבור אותו. לכן מגבילים גם כמה מהחשבון נכנס לעסקה אחת, ולא מגדילים סיכון כדי "להחזיר" הפסד.', 'A stop does not guarantee its price — an opening gap can jump it. So you also cap how much of the account goes into one trade, and never raise the risk to "win back" a loss.')
  },
  questions: [
    rq('r4-shares', 'R4', { type: 'table', title: L('עסקה', 'A trade'), columns: [L('נתון', 'Figure'), L('ערך', 'Value')], rows: [
      { label: L('חשבון', 'Account'), cells: [money(Q1.account)] }, { label: L('סיכון', 'Risk'), cells: [pc(Q1.riskPct, 0)] },
      { label: L('כניסה', 'Entry'), cells: [n2(Q1.entry)] }, { label: L('סטופ', 'Stop'), cells: [n2(Q1.stop)] }
    ] }, 'beginner', L('כמה מניות לקנות?', 'How many shares to buy?'),
      nums([n0(q1.shares), n0(q1.riskAmount / Q1.entry), n0(Q1.account / Q1.entry), n0(q1.shares * 2)]), 'a',
      L(`${ltr(`(${n0(Q1.account)} × ${Q1.riskPct}%) ÷ (${n2(Q1.entry)} − ${n2(Q1.stop)}) = ${n0(q1.riskAmount)} ÷ ${n2(q1.perShare)} = ${n0(q1.shares)}`)}.`, `(${n0(Q1.account)} × ${Q1.riskPct}%) ÷ (${n2(Q1.entry)} − ${n2(Q1.stop)}) = ${n0(q1.riskAmount)} ÷ ${n2(q1.perShare)} = ${n0(q1.shares)}.`)),
    rq('r4-farther', 'R4', stopsTable, 'beginner', L('הסטופ מתרחק מהכניסה, והסיכון נשאר אותו אחוז. מה קורה?', 'The stop moves farther from the entry, and the risk stays the same percentage. What happens?'),
      [['a', L('קונים פחות מניות — וההפסד בסטופ לא משתנה', 'You buy fewer shares — and the loss at the stop does not change')], ['b', L('קונים יותר מניות', 'You buy more shares')], ['c', L('ההפסד בסטופ גדל', 'The loss at the stop grows')], ['d', L('הכמות לא משתנה', 'The size does not change')]], 'a',
      L(`${byStop.map(({ stop, r }) => `${n2(stop)}: ${n0(r.shares)}`).join(' · ')} — ובכולם הפסד של ${money(base.riskAmount).he}.`, `${byStop.map(({ stop, r }) => `${n2(stop)}: ${n0(r.shares)}`).join(' · ')} — and in all of them a loss of ${money(base.riskAmount).en}.`)),
    rq('r4-streak', 'R4', { type: 'table', title: L('רצף הפסדים', 'A losing streak'), columns: [L('נתון', 'Figure'), L('ערך', 'Value')], rows: [
      { label: L('חשבון', 'Account'), cells: [money(ACCOUNT)] }, { label: L('סיכון לעסקה', 'Risk per trade'), cells: [pc(2, 0)] }, { label: L('הפסדים ברצף', 'Losses in a row'), cells: ['10'] }
    ] }, 'intermediate',
      L(`כמה יישאר בחשבון של ${money(ACCOUNT).he} אחרי 10 הפסדים ברצף, בסיכון של 2% לעסקה?`, `How much is left in a ${money(ACCOUNT).en} account after 10 losses in a row, at 2% risk per trade?`),
      [['a', money(streak(2))], ['b', money(ACCOUNT * 0.8)], ['c', money(streak(1))], ['d', money(ACCOUNT * 0.98)]], 'a',
      L(`כל הפסד הוא 2% ממה שנשאר: ${ltr(`${n0(ACCOUNT)} × 0.98^10 = ${n0(streak(2))}`)} — קצת יותר מ־80%, כי הסכום שמסכנים קטן עם החשבון.`, `Each loss is 2% of what is left: ${n0(ACCOUNT)} × 0.98^10 = ${n0(streak(2))} — a little more than 80%, because the amount at risk shrinks with the account.`))
  ]
};

// ---------- R5 · stop-loss, take-profit and risk/reward ----------
const TR = series.R5_TRADE, PL = series.R5_PLAN;
const rr = riskReward(R5_TRADE.entry, R5_TRADE.stop, R5_TRADE.target)!;
const plLow = PL.swings[1]!.price, plHigh = PL.swings[0]!.price, plEntry = PL[PL.length - 1]!.c;
const STOP_ZONE: [number, number] = [plLow - 0.6, plLow - 0.05];
const plStop = (STOP_ZONE[0] + STOP_ZONE[1]) / 2;
const plRr = riskReward(plEntry, plStop, plHigh)!;
const poor = riskReward(R5_POOR.entry, R5_POOR.stop, R5_POOR.target)!;
const qRr = riskReward(R5_Q.entry, R5_Q.stop, R5_Q.target)!;
const RATIOS = [1, 2, 2.5, 3];
const be = (ratio: number) => (1 / (1 + ratio)) * 100;
const line = (y: number, n: number, tone: string, label: { he: string; en: string }) => ({ x1: 0, y1: y, x2: n - 1, y2: y, tone, dash: [5, 4], labelAt: 'end', labelAlign: 'right', label });
const R5_CHARTS: LessonChartSpec[] = [
  { candles: TR, variant: 'price', options: { showVolume: false,
      zones: [{ range: [R5_TRADE.stop, R5_TRADE.entry], tone: 'resistance', label: L(`סיכון · ${n2(rr.risk)}`, `Risk · ${n2(rr.risk)}`) }, { range: [R5_TRADE.entry, R5_TRADE.target], tone: 'support', label: L(`סיכוי · ${n2(rr.reward)}`, `Reward · ${n2(rr.reward)}`) }],
      segments: [line(R5_TRADE.target, TR.length, 'bull', L(`יעד ${n2(R5_TRADE.target)}`, `Target ${n2(R5_TRADE.target)}`)), line(R5_TRADE.stop, TR.length, 'bear', L(`סטופ ${n2(R5_TRADE.stop)}`, `Stop ${n2(R5_TRADE.stop)}`))],
      points: [{ idx: TR.entryIdx, place: 'below', tone: 'gold', label: L(`כניסה ${n2(R5_TRADE.entry)}`, `Entry ${n2(R5_TRADE.entry)}`) }] },
    label: L(`עסקה: כניסה ב־${n2(R5_TRADE.entry)}, סטופ ב־${n2(R5_TRADE.stop)} מתחת לשפל האחרון, יעד ב־${n2(R5_TRADE.target)}`, `A trade: entry at ${n2(R5_TRADE.entry)}, a stop at ${n2(R5_TRADE.stop)} below the last low, a target at ${n2(R5_TRADE.target)}`),
    caption: L('סטופ, כניסה ויעד', 'Stop, entry and target'), tone: 'neutral', height: 440 },
  { candles: PL, variant: 'price', options: { showVolume: false, dots: [
      { idx: PL.swings[0]!.idx, price: plHigh, tone: 'bull', labelAlign: 'center', labelDy: -8, label: L(`שיא ${n2(plHigh)}`, `High ${n2(plHigh)}`) },
      { idx: PL.swings[1]!.idx, price: plLow, tone: 'bear', labelAlign: 'center', labelDy: 20, label: L(`שפל ${n2(plLow)}`, `Low ${n2(plLow)}`) }] },
    label: L(`המחיר עלה ל־${n2(plHigh)}, נסוג לשפל ב־${n2(plLow)}, ועכשיו ב־${n2(plEntry)}`, `Price rose to ${n2(plHigh)}, pulled back to a low at ${n2(plLow)}, and is now at ${n2(plEntry)}`),
    caption: L('כאן שוקלים להיכנס', 'You are considering an entry here'), tone: 'neutral', height: 420 }
];

export const R5: LessonContent = {
  id: 'R5',
  tutor: { topic: 'risk-reward-ratio', label: L('סטופ, יעד ויחס סיכוי־סיכון', 'stops, targets and risk/reward') },
  teach: [
    {
      heading: L('שתי החלטות לפני הכניסה', 'Two decisions before the entry'),
      paragraphs: [
        L(`לפני שנכנסים לעסקה מחליטים שני מחירים. סטופ לוס (Stop-Loss): המחיר שבו הרעיון שגוי ויוצאים בהפסד מתוכנן. טייק פרופיט (Take-Profit): המחיר שבו מממשים את הרווח. בגרף: כניסה ב־${n2(R5_TRADE.entry)}, סטופ ב־${n2(R5_TRADE.stop)}, יעד ב־${n2(R5_TRADE.target)}.`,
          `Before entering a trade you decide two prices. The stop-loss: the price at which the idea is wrong and you exit at a planned loss. The take-profit: the price at which you take the gain. On the chart: entry at ${n2(R5_TRADE.entry)}, a stop at ${n2(R5_TRADE.stop)}, a target at ${n2(R5_TRADE.target)}.`),
        L(`איפה שמים סטופ? לא במרחק "עגול", אלא במקום שבו הקריאה על הגרף מפסיקה להיות נכונה. כאן המחיר נסוג לשפל ב־${n2(TR.swings[1]!.price)} ומשם עלה; סגירה מתחת לשפל הזה אומרת שהעלייה נשברה — לכן הסטופ מעט מתחתיו.`,
          `Where does a stop go? Not at a "round" distance, but where the reading of the chart stops being true. Here price pulled back to a low at ${n2(TR.swings[1]!.price)} and rose from there; a close below that low says the rise has broken — so the stop sits just under it.`),
        L('את שני המחירים אפשר לתת לברוקר מראש כפקודות — פקודת סטופ ופקודת לימיט ליעד — כך שההחלטה מתקבלת ברוגע, לא באמצע תנועה חדה.', 'Both prices can be given to the broker in advance as orders — a stop order and a limit order for the target — so the decision is taken calmly, not in the middle of a sharp move.')
      ],
      work: { kind: 'charts', charts: [0] }
    },
    {
      heading: L(`יחס 1:${n1(rr.ratio)}`, `A 1:${n1(rr.ratio)} ratio`),
      paragraphs: [
        L(`יחס סיכוי־סיכון (Risk/Reward) משווה כמה אפשר להרוויח לכמה מסכנים. כאן מסכנים ${n2(rr.risk)} למניה (${ltr(`${n2(R5_TRADE.entry)} − ${n2(R5_TRADE.stop)}`)}) כדי להרוויח ${n2(rr.reward)} (${ltr(`${n2(R5_TRADE.target)} − ${n2(R5_TRADE.entry)}`)}): יחס של 1:${n1(rr.ratio)}.`,
          `The risk/reward ratio compares how much can be made with how much is risked. Here you risk ${n2(rr.risk)} a share (${n2(R5_TRADE.entry)} − ${n2(R5_TRADE.stop)}) to make ${n2(rr.reward)} (${n2(R5_TRADE.target)} − ${n2(R5_TRADE.entry)}): a ratio of 1:${n1(rr.ratio)}.`),
        L(`עם גודל הפוזיציה מהשיעור הקודם זה מתחבר: אם העסקה מוגדרת כך שבסטופ מפסידים 1% מהחשבון, ביעד מרוויחים ${pc(rr.ratio)} ממנו.`, `With position size from the last lesson it fits together: if the trade is sized so that the stop loses 1% of the account, the target makes ${pc(rr.ratio)} of it.`),
        L('בגרף הזה המחיר אכן הגיע ליעד — אבל העסקה הייתה נכונה עוד לפני כן, כי היחס נקבע מראש. גם עסקה עם יחס טוב יכולה להיגמר בסטופ.', 'On this chart price did reach the target — but the trade was sound before that, because the ratio was set in advance. A trade with a good ratio can end at the stop too.')
      ],
      work: { kind: 'charts', charts: [0] }
    },
    {
      heading: L('אחוז ההצלחה לאיזון', 'The break-even win rate'),
      paragraphs: [
        L(`כמה פעמים עסקה כזו צריכה להצליח כדי לא להפסיד לאורך זמן? סיכון ÷ (סיכון + סיכוי): ${ltr(`${n2(rr.risk)} ÷ (${n2(rr.risk)} + ${n2(rr.reward)}) = ${pc(rr.breakEven * 100)}`)}. ביחס של 1:${n1(rr.ratio)}, גם אם רק 3 מכל 10 עסקאות מצליחות, יוצאים ברווח.`,
          `How often does a trade like this have to work not to lose over time? Risk ÷ (risk + reward): ${n2(rr.risk)} ÷ (${n2(rr.risk)} + ${n2(rr.reward)}) = ${pc(rr.breakEven * 100)}. At 1:${n1(rr.ratio)}, even if only 3 in 10 trades work, you come out ahead.`),
        L(`בעשר עסקאות כאלה עם 40% הצלחה: ${ltr(`4 × ${n2(rr.reward)} − 6 × ${n2(rr.risk)} = ${n2(tenTrades(rr, 40))}`)} למניה. ביחס של 1:1 צריך יותר מחצי מהעסקאות להצליח רק כדי להתאזן.`,
          `Over ten such trades at a 40% success rate: 4 × ${n2(rr.reward)} − 6 × ${n2(rr.risk)} = ${n2(tenTrades(rr, 40))} a share. At 1:1 more than half the trades must work just to break even.`),
        L('אבל יחס גבוה לא בא בחינם: יעד רחוק מגדיל את היחס — ומקטין את הסיכוי להגיע אליו. היחס לבדו לא אומר שהעסקה טובה; הוא אומר כמה פעמים היא צריכה להצליח.', 'But a high ratio is not free: a far target raises the ratio — and lowers the chance of reaching it. The ratio alone does not say the trade is good; it says how often it has to work.')
      ],
      work: { kind: 'diagram', diagram: { type: 'table', title: L('יחס ואחוז הצלחה לאיזון', 'Ratio and break-even win rate'), columns: [L('יחס', 'Ratio'), L('אחוז הצלחה לאיזון', 'Break-even win rate')], rows: RATIOS.map((x) => ({ label: L(`1:${x}`, `1:${x}`), cells: [pc(be(x))], ...(x === rr.ratio ? { mark: [0] } : {}) })) } }
    }
  ],
  charts: R5_CHARTS,
  activity: {
    kind: 'markLevel',
    prompt: L('תכננו עסקה', 'Plan a trade'),
    task: L(`אתם שוקלים לקנות ב־${n2(plEntry)}. לחצו על הגרף בגובה שבו כדאי לשים את הסטופ — המקום שבו הקריאה שלכם כבר לא נכונה.`, `You are considering buying at ${n2(plEntry)}. Click the chart at the height where the stop belongs — the place where your reading is no longer true.`),
    chart: 1,
    target: STOP_ZONE,
    tolerance: 0.3,
    right: L(`מעט מתחת לשפל של ${n2(plLow)}: אם המחיר נסגר שם, העלייה מהשפל נשברה — והרעיון לא נכון יותר.`, `Just under the ${n2(plLow)} low: if price closes there, the rise from the low has broken — and the idea no longer holds.`),
    off: L(`לא בגובה הזה. חפשו את השפל האחרון (${n2(plLow)}): הסטופ שייך מעט מתחתיו — לא צמוד לכניסה, ולא רחוק ממנו בלי סיבה.`, `Not at that height. Look for the last low (${n2(plLow)}): the stop belongs just under it — not tight to the entry, and not far below it for no reason.`),
    answer: [{ range: STOP_ZONE, tone: 'support', label: L('אזור הסטופ', 'Stop zone'), explanation: L(`מתחת לשפל של ${n2(plLow)}.`, `Below the ${n2(plLow)} low.`) }],
    explain: [
  L(`מתי זה משתלם: עם סטופ ב־${n2(plStop)} ויעד בשיא הקודם (${n2(plHigh)}), מסכנים ${n2(plRr.risk)} כדי להרוויח ${n2(plRr.reward)} — יחס של 1:${n1(plRr.ratio)}. כדי להתאזן צריך להצליח ב־${pc(plRr.breakEven * 100)} מהפעמים.`,
    `When it pays: with a stop at ${n2(plStop)} and a target at the previous high (${n2(plHigh)}), you risk ${n2(plRr.risk)} to make ${n2(plRr.reward)} — a ratio of 1:${n1(plRr.ratio)}. To break even it has to work ${pc(plRr.breakEven * 100)} of the time.`),
  L('זו החלטה, לא חישוב בלבד: היחס כאן לא מפתה. אפשר לחכות לכניסה קרובה יותר לשפל (סיכון קטן יותר), לוותר, או לקבל עסקה שצריכה להצליח כמעט בחצי מהפעמים. הסטופ נשאר במקומו בכל מקרה — מה שמשתנה הוא אם נכנסים, ובכמה מניות.',
    'This is a decision, not only a sum: the ratio here is not tempting. You can wait for an entry nearer the low (less risk), pass, or accept a trade that must work almost half the time. The stop stays where it is either way — what changes is whether you enter, and with how many shares.')
]
  },
  apply: rq('r5-apply', 'R5', { type: 'table', title: L('עסקה אחרת', 'Another trade'), columns: [L('נתון', 'Figure'), L('ערך', 'Value')], rows: [
    { label: L('כניסה', 'Entry'), cells: [n2(R5_POOR.entry)] }, { label: L('סטופ', 'Stop'), cells: [n2(R5_POOR.stop)] }, { label: L('יעד', 'Target'), cells: [n2(R5_POOR.target)] }
  ] }, 'intermediate',
    L('כדאי לקחת את העסקה הזו?', 'Is this trade worth taking?'),
    [
      ['a', L(`רק אם מצפים להצליח ביותר מ־${pc(poor.breakEven * 100)} מהפעמים — דרישה גבוהה; שווה לחפש כניסה או יעד טובים יותר`, `Only if you expect to win more than ${pc(poor.breakEven * 100)} of the time — a high bar; worth looking for a better entry or target`)],
      ['b', L('כן — כל עסקה עם סטופ היא עסקה טובה', 'Yes — any trade with a stop is a good trade')],
      ['c', L('כן — היעד קרוב, אז בטוח יגיעו אליו', 'Yes — the target is close, so it will surely be reached')],
      ['d', L('לא משנה — היחס לא חשוב', 'It does not matter — the ratio is not important')]
    ], 'a',
    L(`מסכנים ${n2(poor.risk)} כדי להרוויח ${n2(poor.reward)}: יחס של 1:${n1(poor.ratio)}. כדי להתאזן צריך להצליח ב־${pc(poor.breakEven * 100)} מהעסקאות. יעד קרוב אולי קל יותר להשגה — אבל המתמטיקה דורשת הרבה.`, `You risk ${n2(poor.risk)} to make ${n2(poor.reward)}: a ratio of 1:${n1(poor.ratio)}. To break even you need to win ${pc(poor.breakEven * 100)} of trades. A close target may be easier to hit — but the maths asks a lot.`)),
  takeaway: {
    bottomLine: L('לפני הכניסה מחליטים איפה הרעיון שגוי (סטופ) ואיפה מממשים (יעד). יחס סיכוי־סיכון קובע כמה פעמים העסקה צריכה להצליח: סיכון ÷ (סיכון + סיכוי).', 'Before the entry you decide where the idea is wrong (stop) and where you take profit (target). The risk/reward ratio sets how often the trade must work: risk ÷ (risk + reward).'),
    caveat: L('יחס גבוה לא הופך עסקה לטובה — יעד רחוק קשה יותר להשגה. וסטופ שמים לפי הגרף, לא לפי כמה נוח להפסיד; את הכמות מתאימים אליו.', 'A high ratio does not make a trade good — a far target is harder to reach. And a stop goes where the chart says, not where a loss feels comfortable; the size is fitted to it.')
  },
  questions: [
    rq('r5-ratio', 'R5', { type: 'table', title: L('עסקה', 'A trade'), columns: [L('נתון', 'Figure'), L('ערך', 'Value')], rows: [{ label: L('כניסה', 'Entry'), cells: [n2(R5_Q.entry)] }, { label: L('סטופ', 'Stop'), cells: [n2(R5_Q.stop)] }, { label: L('יעד', 'Target'), cells: [n2(R5_Q.target)] }] }, 'beginner',
      L('מה יחס הסיכוי־סיכון?', 'What is the risk/reward ratio?'),
      nums([`1:${n1(qRr.ratio)}`, `1:${n1(qRr.ratio - 1)}`, `${n1(qRr.ratio)}:1`, `1:${n1(R5_Q.target / R5_Q.stop)}`]), 'a',
      L(`סיכון ${ltr(`${n2(R5_Q.entry)} − ${n2(R5_Q.stop)} = ${n2(qRr.risk)}`)}, סיכוי ${ltr(`${n2(R5_Q.target)} − ${n2(R5_Q.entry)} = ${n2(qRr.reward)}`)}: יחס של 1:${n1(qRr.ratio)}.`, `Risk ${n2(R5_Q.entry)} − ${n2(R5_Q.stop)} = ${n2(qRr.risk)}, reward ${n2(R5_Q.target)} − ${n2(R5_Q.entry)} = ${n2(qRr.reward)}: a ratio of 1:${n1(qRr.ratio)}.`)),
    rq('r5-breakeven', 'R5', { type: 'table', title: L('יחסים', 'Ratios'), columns: [L('יחס', 'Ratio'), L('סיכון', 'Risk'), L('סיכוי', 'Reward')], rows: [{ label: L('1:2', '1:2'), cells: ['1.00', '2.00'] }] }, 'intermediate',
      L('ביחס של 1:2, באיזה אחוז מהעסקאות צריך להצליח כדי להתאזן?', 'At a 1:2 ratio, what share of trades must work to break even?'),
      nums([pc(be(2)), pc(50, 0), pc(66.7), pc(20, 0)]), 'a',
      L(`${ltr(`1 ÷ (1 + 2) = ${pc(be(2))}`)}: מעל שליש מההצלחות — ברווח; מתחת — בהפסד.`, `1 ÷ (1 + 2) = ${pc(be(2))}: above a third of wins — ahead; below — behind.`)),
    rq('r5-ten', 'R5', { type: 'table', title: L(`העסקה מהשיעור: 1:${n1(rr.ratio)}`, `The lesson's trade: 1:${n1(rr.ratio)}`), columns: [L('נתון', 'Figure'), L('למניה', 'Per share')], rows: [{ label: L('סיכון', 'Risk'), cells: [n2(rr.risk)] }, { label: L('סיכוי', 'Reward'), cells: [n2(rr.reward)] }] }, 'intermediate',
      L('בעשר עסקאות כאלה, 3 מצליחות ו־7 נגמרות בסטופ. מה התוצאה למניה?', 'Out of ten such trades, 3 work and 7 end at the stop. What is the result per share?'),
      nums([n2(tenTrades(rr, 30)), n2(-tenTrades(rr, 30)), n2(3 * rr.reward), n2(-7 * rr.risk)]), 'a',
      L(`${ltr(`3 × ${n2(rr.reward)} − 7 × ${n2(rr.risk)} = ${n2(tenTrades(rr, 30))}`)}: רווח קטן, למרות ש־7 מתוך 10 הפסידו — כי אחוז ההצלחה (30%) מעל נקודת האיזון (${pc(rr.breakEven * 100)}).`, `3 × ${n2(rr.reward)} − 7 × ${n2(rr.risk)} = ${n2(tenTrades(rr, 30))}: a small profit, although 7 of 10 lost — because the win rate (30%) is above break-even (${pc(rr.breakEven * 100)}).`))
  ]
};

// ---------- R6 · biases ----------
const biasTable: Diagram = { type: 'table', title: L('שתי מניות, החלטה אחת', 'Two stocks, one decision'), columns: [L('נתון', 'Figure'), BIAS.a.name, BIAS.b.name], rows: [
  { label: L('שווי היום', 'Worth today'), cells: [money(BIAS.a.value), money(BIAS.b.value)] },
  { label: L('שינוי מאז הקנייה', 'Change since buying'), cells: [pc(BIAS.a.change, 0), pc(BIAS.b.change, 0)] },
  { label: L('מה ידוע היום', 'What is known today'), cells: [BIAS.a.news, BIAS.b.news] }
] };

export const R6: LessonContent = {
  id: 'R6',
  tutor: { topic: 'behavioral-biases', label: L('הטיות התנהגותיות', 'behavioural biases') },
  teach: [
    {
      heading: L('המוח מול התיק', 'Your brain against your portfolio'),
      paragraphs: [
        L('כל מה שלמדתם עד עכשיו — גודל פוזיציה, סטופ, פיזור — נכתב ברוגע. אבל החלטות בשוק מתקבלות תחת לחץ, והמוח האנושי עובד אז בקיצורי דרך צפויים. לקיצורי הדרך האלה קוראים הטיות (Biases).',
          'Everything you have learned so far — position size, stops, diversification — was written calmly. But market decisions are made under pressure, and the human brain then works in predictable shortcuts. Those shortcuts are called biases.'),
        L('החזקה שבהן היא שנאת הפסד (Loss Aversion): מחקרים מראים שהפסד כואב בערך כפליים מאשר רווח באותו גודל. היא מסבירה הרבה: למה קשה למכור בהפסד, למה מזיזים סטופ "רק הפעם", ולמה אחרי הפסד רוצים "להחזיר" אותו מהר.',
          'The strongest is loss aversion: research suggests a loss hurts roughly twice as much as a gain of the same size. It explains a lot: why selling at a loss is hard, why a stop gets moved "just this once", and why after a loss you want to "win it back" fast.'),
        L('הדרך להתגונן היא לא "להיות רציונליים יותר" ברגע האמת — אלא להחליט מראש, ולשאול בכל החלטה שאלה אחת שמנטרלת את ההטיה.', 'The defence is not to "be more rational" in the moment — it is to decide in advance, and to ask, at each decision, one question that neutralises the bias.')
      ],
      work: { kind: 'diagram', diagram: { type: 'table', title: L('חמש הטיות, וחמש שאלות', 'Five biases, and five questions'), columns: [L('הטיה', 'Bias'), L('איך היא נשמעת', 'What it sounds like'), L('השאלה שמנטרלת אותה', 'The question that neutralises it')], rows: [
        { label: L('שנאת הפסד', 'Loss aversion'), cells: [L('"אני לא מוכר בהפסד"', '"I don\'t sell at a loss"'), L('מה הייתי עושה אם לא הייתי מחזיק בה?', 'What would I do if I did not own it?')] },
        { label: L('עוגן', 'Anchoring'), cells: [L('"אמכור כשתחזור למחיר שקניתי"', '"I\'ll sell when it gets back to my price"'), L('למה המחיר שלי חשוב לשוק?', 'Why would my price matter to the market?')] },
        { label: L('אישוש', 'Confirmation'), cells: [L('"כל הכתבות אומרות שהיא תעלה"', '"Every article says it will rise"'), L('מה הטיעון הכי חזק נגד?', 'What is the strongest case against?')] },
        { label: L('עדר (FOMO)', 'Herding (FOMO)'), cells: [L('"כולם קונים, אני מפספס"', '"Everyone is buying, I\'m missing out"'), L('האם זה בתוכנית — ובגודל שבתוכנית?', 'Is it in the plan — at the size in the plan?')] },
        { label: L('ביטחון־יתר', 'Overconfidence'), cells: [L('"הפעם אני בטוח, אשים יותר"', '"This time I\'m sure, I\'ll put more in"'), L('מה אם אני טועה — כמה זה עולה?', 'What if I\'m wrong — what does it cost?')] }
      ] } }
    },
    {
      heading: L('אפקט הנטייה', 'The disposition effect'),
      paragraphs: [
        L('אחת ההטיות הנחקרות ביותר אצל משקיעים: אפקט הנטייה (Disposition Effect) — הנטייה למכור מהר מניות שעלו ("לממש רווח") ולהחזיק זמן רב מניות שירדו ("עד שיחזרו").',
          'One of the most studied biases among investors: the disposition effect — the tendency to sell stocks that rose quickly ("take the profit") and to hold stocks that fell for a long time ("until they come back").'),
        L('למה זה מזיק? כי ההחלטה מתקבלת לפי מחיר הקנייה — מספר שחשוב רק לכם. לשוק לא אכפת במה קניתם. מי שמוכר את המנצחות ומחזיק את המפסידות, בונה בהדרגה תיק של מפסידות.',
          'Why is it harmful? Because the decision is made by the purchase price — a number that matters only to you. The market does not care what you paid. Someone who sells the winners and keeps the losers gradually builds a portfolio of losers.'),
        L('זה גם הקשר לסטופ מהשיעור הקודם: סטופ שהוחלט מראש הוא בדיוק הכלי נגד "אחכה שתחזור".', 'That is also the link to the stop from the last lesson: a stop decided in advance is exactly the tool against "I\'ll wait for it to come back".')
      ],
      callouts: [{ kind: 'caveat', lead: L('שימו לב', 'Watch out'), text: L('מחיר הקנייה שלכם לא משפיע על מה שהמניה תעשה מחר.', 'Your purchase price has no effect on what the stock does tomorrow.') }],
      work: { kind: 'diagram', diagram: { type: 'flow', title: L('איך נבנה תיק של מפסידות', 'How a portfolio of losers is built'), stages: [
        { label: L('מניה עולה', 'A stock rises'), sub: L('"כדאי לממש"', '"Better take the profit"') },
        { label: L('מוכרים אותה', 'It is sold'), sub: L('גם אם הסיבה לקנות עוד קיימת', 'Even if the reason to own it still holds') },
        { label: L('מניה יורדת', 'A stock falls'), sub: L('"אחכה שתחזור"', '"I\'ll wait for it to come back"') },
        { label: L('מחזיקים אותה', 'It is kept'), sub: L('גם אם הסיבה לקנות נעלמה', 'Even if the reason to own it is gone') }
      ] } }
    },
    {
      heading: L('שתי מניות', 'Two stocks'),
      paragraphs: [
        L(`אתם צריכים ${money(BIAS.need).he} לשיפוץ, ויש לכם שתי מניות — צריך למכור אחת. ${BIAS.a.name.he} שווה ${money(BIAS.a.value).he}, ${pc(BIAS.a.change, 0)} מאז הקנייה. ${BIAS.b.name.he} שווה ${money(BIAS.b.value).he}, ${pc(BIAS.b.change, 0)}.`,
          `You need ${money(BIAS.need).en} for a renovation, and you own two stocks — one has to go. ${BIAS.a.name.en} is worth ${money(BIAS.a.value).en}, ${pc(BIAS.a.change, 0)} since you bought it. ${BIAS.b.name.en} is worth ${money(BIAS.b.value).en}, ${pc(BIAS.b.change, 0)}.`),
        L('לפני שעונים, קראו גם את השורה התחתונה בטבלה — מה ידוע היום על כל חברה. זה המידע שבאמת נוגע לעתיד.', 'Before answering, read the bottom row of the table too — what is known today about each company. That is the information that actually concerns the future.'),
        L('שימו לב למה שאתם מרגישים כשאתם מסתכלים על שתי השורות העליונות: אחת נראית כמו הצלחה שאפשר "לסגור", והשנייה כמו טעות שעוד אפשר "לתקן" אם רק מחכים. התחושה הזו אמיתית — והיא בדיוק מה שהשלב הבא בודק.', 'Notice what you feel looking at the top two rows: one looks like a success you can "lock in", the other like a mistake you can still "fix" if you just wait. That feeling is real — and it is exactly what the next step tests.')
      ],
      work: { kind: 'diagram', diagram: biasTable }
    }
  ],
  charts: [],
  activity: {
    kind: 'checklist',
    prompt: L('איזו למכור?', 'Which to sell?'),
    task: L('ענו לפי הסדר. כל תשובה ננעלת ומוסברת.', 'Answer in order. Each answer locks and explains itself.'),
    diagram: biasTable,
    items: [
      { id: 'pull', question: L(`רוב האנשים ימכרו את ${BIAS.a.name.he}. איך קוראים למשיכה הזו?`, `Most people would sell ${BIAS.a.name.en}. What is that pull called?`), options: [{ key: 'disp', label: L('אפקט הנטייה — לממש רווח ולהחזיק הפסד', 'The disposition effect — take the gain, keep the loss') }, { key: 'div', label: L('פיזור', 'Diversification') }, { key: 'rr', label: L('יחס סיכוי־סיכון', 'Risk/reward') }], correct: 'disp',
        why: L('מכירה ברווח מרגישה כמו הצלחה; מכירה בהפסד — כמו להודות בטעות. זו בדיוק ההטיה מהשלב הקודם.', 'Selling at a gain feels like success; selling at a loss — like admitting a mistake. That is exactly the bias from the previous step.') },
      { id: 'price', question: L('האם המחיר שבו קניתם משפיע על מה שכל מניה תעשה מעכשיו?', 'Does the price you paid affect what each stock does from now on?'), options: [{ key: 'no', label: L('לא — רק מה שקורה בחברות ובשוק', 'No — only what happens at the companies and in the market') }, { key: 'yes', label: L('כן — מניה נוטה לחזור למחיר הקנייה', 'Yes — a stock tends to return to the purchase price') }, { key: 'loser', label: L('רק במניה המפסידה', 'Only in the losing stock') }], correct: 'no',
        why: L('מחיר הקנייה חשוב לחשבון שלכם, לא לשוק. המחשבה "אחכה שתחזור למחיר שלי" היא עוגן.', 'The purchase price matters to your account, not to the market. "I\'ll wait for it to get back to my price" is anchoring.') },
      { id: 'sell', question: L('אז איזו למכור?', 'So which to sell?'), options: [{ key: 'a', label: L(`את ${BIAS.a.name.he} — היא ברווח`, `${BIAS.a.name.en} — it is at a gain`) }, { key: 'b', label: L(`את ${BIAS.b.name.he} — הסיבה להחזיק אותה נחלשה`, `${BIAS.b.name.en} — the reason to hold it has weakened`) }, { key: 'half', label: L('חצי מכל אחת, כדי לא לטעות', 'Half of each, so as not to be wrong') }], correct: 'b',
        why: L(`לפי מה שידוע היום: ${BIAS.a.name.he} — ${BIAS.a.news.he} ${BIAS.b.name.he} — ${BIAS.b.news.he} אם הייתם בוחרים היום מאפס, מה הייתם משאירים?`, `By what is known today: ${BIAS.a.name.en} — ${BIAS.a.news.en} ${BIAS.b.name.en} — ${BIAS.b.news.en} If you were choosing from scratch today, which would you keep?`) }
    ],
    right: L('זיהיתם את המשיכה, ניתקתם את ההחלטה ממחיר הקנייה, והחלטתם לפי העתיד. זה כל התרגיל.', 'You spotted the pull, cut the decision loose from the purchase price, and decided by the future. That is the whole exercise.'),
    explain: [
      L(`השאלה הנכונה: "אם היו נותנים לי היום ${money(BIAS.a.value + BIAS.b.value).he} במזומן — איזו מהשתיים הייתי קונה?" זה בדיוק מה שהתיק שלכם שווה (${money(BIAS.a.value).he} + ${money(BIAS.b.value).he}), והשאלה מוחקת את מחיר הקנייה מההחלטה.`,
        `The right question: "If I were given ${money(BIAS.a.value + BIAS.b.value).en} in cash today — which of the two would I buy?" That is exactly what your holdings are worth (${money(BIAS.a.value).en} + ${money(BIAS.b.value).en}), and the question erases the purchase price from the decision.`),
      L('זה לא אומר שכל מניה מפסידה צריך למכור — לפעמים הסיבה לקנות עדיין קיימת, והירידה זמנית. זה אומר שההחלטה נשענת על מה שידוע היום, לא על מה ששילמתם.', 'That does not mean every losing stock should be sold — sometimes the reason to own it still holds and the fall is temporary. It means the decision rests on what is known today, not on what you paid.')
    ]
  },
  apply: rq('r6-apply', 'R6', { type: 'table', title: L('מניה שכולם מדברים עליה', 'A stock everyone is talking about'), columns: [L('נתון', 'Figure'), L('ערך', 'Value')], rows: [
    { label: L('עלייה בחודש האחרון', 'Rise over the last month'), cells: [pc(R6_FOMO.rise, 0)] },
    { label: L('מה אומרים סביבכם', 'What people around you say'), cells: [L('"כולם קנו, אתה מפספס"', '"Everyone bought, you\'re missing out"')] },
    { label: L('התוכנית שלכם: חלק מקסימלי למניה אחת', 'Your plan: the most in one stock'), cells: [pc(R6_FOMO.maxShare, 0)] }
  ] }, 'intermediate',
    L('מה התגובה שמתאימה לתוכנית?', 'What response fits the plan?'),
    [
      ['a', L('אם היא עומדת בכללים שלכם — בגודל שבתוכנית, עם סטופ. אם לא — לוותר, גם אם היא תמשיך לעלות', 'If it meets your rules — at the size in the plan, with a stop. If not — pass, even if it keeps rising')],
      ['b', L('לקנות בגדול לפני שיהיה מאוחר', 'Buy big before it is too late')],
      ['c', L('לחכות שתכפיל את עצמה ואז לקנות', 'Wait for it to double, then buy')],
      ['d', L('למכור מניות אחרות כדי לקנות אותה', 'Sell other stocks to buy it')]
    ], 'a',
    L('"כולם קונים" היא הטיית העדר (FOMO). היא לא אומרת אם המניה טובה — רק שהיא פופולרית. התוכנית קיימת בדיוק לרגעים כאלה: גודל, סטופ, והחלק המקסימלי מהתיק. גם החמצה היא תוצאה סבירה של תוכנית טובה.', '"Everyone is buying" is herding (FOMO). It does not say whether the stock is good — only that it is popular. The plan exists for exactly such moments: size, stop, and the maximum share of the portfolio. Missing out is also a reasonable outcome of a good plan.')),
  takeaway: {
    bottomLine: L('הטיות הן קיצורי דרך צפויים של המוח: שנאת הפסד, עוגן, אישוש, עדר, ביטחון־יתר. אפקט הנטייה גורם למכור מנצחות ולהחזיק מפסידות. ההגנה: להחליט מראש, ולשאול "מה הייתי עושה היום מאפס?"', 'Biases are the brain\'s predictable shortcuts: loss aversion, anchoring, confirmation, herding, overconfidence. The disposition effect makes you sell winners and keep losers. The defence: decide in advance, and ask "what would I do today from scratch?"'),
    caveat: L('לדעת על הטיה לא מבטל אותה — היא פועלת גם על מי שמכיר אותה. לכן כללים כתובים מראש עובדים טוב יותר מכוונות טובות ברגע האמת.', 'Knowing about a bias does not switch it off — it works on people who know it too. So rules written in advance work better than good intentions in the moment.')
  },
  questions: [
    rq('r6-anchor', 'R6', { type: 'table', title: L('משפט של משקיע', 'An investor\'s words'), columns: [L('מה נאמר', 'What was said'), L('מצב', 'Situation')], rows: [{ label: L(`"אמכור רק כשהיא תחזור ל־${R6_ANCHOR.paid}, המחיר שבו קניתי"`, `"I'll only sell when it's back to ${R6_ANCHOR.paid}, the price I paid"`), cells: [L(`המניה ב־${R6_ANCHOR.now}`, `The stock is at ${R6_ANCHOR.now}`)] }] }, 'beginner',
      L('איזו הטיה זו?', 'Which bias is this?'), [['a', L('עוגן', 'Anchoring')], ['b', L('פיזור', 'Diversification')], ['c', L('עדר', 'Herding')], ['d', L('ביטחון־יתר', 'Overconfidence')]], 'a',
      L(`המחיר שבו קניתם הפך ל"עוגן" — אבל לשוק אין שום קשר אליו. השאלה הנכונה: האם הייתי קונה אותה היום ב־${R6_ANCHOR.now}?`, `The price you paid has become an "anchor" — but the market has no link to it. The right question: would I buy it today at ${R6_ANCHOR.now}?`)),
    rq('r6-confirm', 'R6', { type: 'table', title: L('איך משקיעה מתעדכנת', 'How an investor keeps up'), columns: [L('מקור', 'Source'), L('מה היא עושה איתו', 'What they do with it')], rows: [
      { label: L('כתבות חיוביות על המניה', 'Positive articles about the stock'), cells: [L('קוראת ושומרת', 'Reads and saves them')] },
      { label: L('דוח של אנליסט שמזהיר', 'An analyst report with a warning'), cells: [L('מדלגת', 'Skips it')] }
    ] }, 'beginner', L('איזו הטיה פועלת כאן?', 'Which bias is at work here?'), [['a', L('אישוש — מחפשים רק מה שמסכים איתנו', 'Confirmation — seeking only what agrees with us')], ['b', L('אפקט הנטייה', 'The disposition effect')], ['c', L('שנאת הפסד', 'Loss aversion')], ['d', L('אין הטיה', 'No bias')]], 'a',
      L('הטיית האישוש: קוראים את מה שמחזק את הדעה ומדלגים על מה שסותר אותה. השאלה שמנטרלת: מה הטיעון הכי חזק נגד?', 'Confirmation bias: reading what supports the view and skipping what contradicts it. The neutralising question: what is the strongest case against?')),
    rq('r6-disposition', 'R6', biasTable, 'intermediate', L('מה מתאר את אפקט הנטייה?', 'What describes the disposition effect?'),
      [['a', L('למכור מהר את מה שעלה ולהחזיק את מה שירד', 'Selling what rose quickly and holding what fell')], ['b', L('לקנות מה שכולם קונים', 'Buying what everyone buys')], ['c', L('לפזר בין הרבה מניות', 'Spreading across many stocks')], ['d', L('לשים סטופ מראש', 'Setting a stop in advance')]], 'a',
      L(`בתרחיש: המשיכה היא למכור את ${BIAS.a.name.he} (${pc(BIAS.a.change, 0)}) ולהחזיק את ${BIAS.b.name.he} (${pc(BIAS.b.change, 0)}) — לפי מחיר הקנייה, לא לפי מה שידוע היום.`, `In the scenario: the pull is to sell ${BIAS.a.name.en} (${pc(BIAS.a.change, 0)}) and keep ${BIAS.b.name.en} (${pc(BIAS.b.change, 0)}) — by the purchase price, not by what is known today.`))
  ]
};

export const RISK_2 = [R4, R5, R6];
