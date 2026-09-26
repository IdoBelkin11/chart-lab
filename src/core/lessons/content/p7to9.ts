// ---------------------------------------------------------------------------
// Fundamentals, module 2 (part two) and the project: P7 (debt and financial
// strength), P8 (earnings season: guidance, dividends, buybacks), P9 (valuing
// a company with a DCF).
//
// Sources: the approved curriculum and the Artifact's page 09 (09.7–09.10:
// the four-step DCF — assumptions, forecast and discounting, terminal value,
// value and sensitivity). Builds on P2–P6 and on F3 (a price moves on
// expectations), without re-teaching them. Interest rates as an economy-wide
// force are the Macro track's; how much to risk is the Risk track's.
// P9 runs the same model as the DCF tool (@core/calculators/tools).
// Every number is computed from @core/fundamentals/companies.
// ---------------------------------------------------------------------------
import type { LessonChartSpec } from '@core/charts/lessonCharts';
import * as series from '@core/charts/series.js';
import type { Diagram, LessonContent } from './types';
import { A, B, D, D_REPORT, A_BUYBACK, B_REFI_RATE, A_DCF, income, market, strength, totalDebt, netDebt, freeCash } from '@core/fundamentals/companies';
import type { Company } from '@core/fundamentals/companies';
import { dcfBreakdown, dcfGrid } from '@core/calculators/tools';
import { L, ltr, n0, n1, n2, pc, MILLIONS, q, nums } from './fundamentalsKit';

// ---------- P7 · debt and financial strength ----------
const iA = income(A.statement), iB = income(B.statement), iD = income(D.statement);
const sA = strength(A), sB = strength(B), sD = strength(D);
const bB = B.balance!;
const bRate = (B.statement.int / totalDebt(bB)) * 100, bRefiInt = (totalDebt(bB) * B_REFI_RATE) / 100, bRefiCov = iB.op / bRefiInt;
const funding = (cos: Company[]): Diagram => ({
  type: 'stacks', title: L(`ממה ממומנת החברה · ${MILLIONS.he}`, `How the company is funded · ${MILLIONS.en}`),
  columns: cos.map((c) => ({ label: c.name, total: n0(totalDebt(c.balance!) + c.balance!.equity), parts: [
    { label: L('חוב', 'Debt'), value: totalDebt(c.balance!), shown: n0(totalDebt(c.balance!)), tone: 'risk' as const },
    { label: L('הון עצמי', 'Equity'), value: c.balance!.equity, shown: n0(c.balance!.equity), tone: 'ok' as const }
  ] }))
});

export const P7: LessonContent = {
  id: 'P7',
  tutor: { topic: 'debt-equity', label: L('חוב ואיתנות פיננסית', 'debt and financial strength') },
  teach: [
    {
      heading: L('חוב הוא לא רע — עד שהוא כבד מדי', 'Debt is not bad — until it is too heavy'),
      paragraphs: [
        L('חברות לוות כדי לבנות מפעלים, לקנות חברות או לממן צמיחה. חוב סביר מאפשר לעשות יותר עם אותו הון — ראיתם בשיעור הקודם איך הוא מגדיל את ה־ROE. אבל לחוב יש צד שני: הריבית משולמת בכל מקרה, גם בשנה רעה.',
          'Companies borrow to build factories, buy companies or fund growth. Reasonable debt lets you do more with the same capital — you saw in the last lesson how it lifts ROE. But debt has another side: the interest is paid no matter what, even in a bad year.'),
        L(`איתנות פיננסית שואלת שתי שאלות. האחת, לטווח קצר: האם יש כסף לשלם את החשבונות של השנה הקרובה — היחס השוטף מהמאזן (${A.name.he}: ${n2(sA.current)}, ${B.name.he}: ${n2(sB.current)}). השנייה, לטווח ארוך: האם העסק יכול לשאת את החוב שלו לאורך זמן. השיעור הזה עוסק בעיקר בשנייה.`,
          `Financial strength asks two questions. One, short term: is there money to pay the coming year's bills — the current ratio from the balance sheet (${A.name.en}: ${n2(sA.current)}, ${B.name.en}: ${n2(sB.current)}). The other, long term: can the business carry its debt over time. This lesson is mainly about the second.`),
        L(`בגרף רואים כמה שונה המימון: ל־${A.name.he} חוב של ${n0(totalDebt(A.balance!))} מול הון של ${n0(A.balance!.equity)}; ל־${B.name.he} חוב של ${n0(totalDebt(bB))} מול הון של ${n0(bB.equity)} בלבד.`,
          `The figure shows how different the funding is: ${A.name.en} has ${n0(totalDebt(A.balance!))} of debt against ${n0(A.balance!.equity)} of equity; ${B.name.en} has ${n0(totalDebt(bB))} of debt against only ${n0(bB.equity)} of equity.`)
      ],
      work: { kind: 'diagram', diagram: funding([A, B]) }
    },
    {
      heading: L('חוב מול הון', 'Debt against equity'),
      paragraphs: [
        L(`היחס בין החוב להון העצמי (Debt/Equity) מודד כמה מהעסק ממומן בהלוואות לעומת כסף של בעלים: ${A.name.he} ${n2(sA.de)}, ${D.name.he} ${n2(sD.de)}, ${B.name.he} ${n2(sB.de)}. על כל שקל של בעלי המניות, ${B.name.he} לוותה יותר משלושה.`,
          `The debt-to-equity ratio measures how much of the business is funded with loans against owners' money: ${A.name.en} ${n2(sA.de)}, ${D.name.en} ${n2(sD.de)}, ${B.name.en} ${n2(sB.de)}. For every unit of shareholders' money, ${B.name.en} has borrowed more than three.`),
        L(`כדאי לבדוק גם את החוב נטו — החוב פחות המזומן. ל־${D.name.he} יש יותר מזומן מחוב (חוב נטו של ${n0(netDebt(D.balance!))}): גם אם תחזיר את כל ההלוואות מחר, יישאר לה כסף.`,
          `It is also worth checking net debt — debt minus cash. ${D.name.en} holds more cash than debt (net debt of ${n0(netDebt(D.balance!))}): even if it repaid every loan tomorrow, it would have money left.`),
        L('כמה חוב זה "הרבה" תלוי בענף. חברת חשמל, עם הכנסות יציבות מאוד, נושאת בנוחות חוב שהיה מסוכן לחברת טכנולוגיה. לכן, כמו בשוליים ובמכפילים, משווים בתוך אותו ענף.',
          'How much debt is "a lot" depends on the industry. A utility, with very stable revenue, comfortably carries debt that would be dangerous for a technology company. So, as with margins and multiples, compare within an industry.')
      ],
      work: { kind: 'diagram', diagram: { type: 'table', title: L(`חוב · ${MILLIONS.he}`, `Debt · ${MILLIONS.en}`), columns: [L('נתון', 'Figure'), A.name, B.name, D.name], rows: [
        { label: L('חוב', 'Debt'), cells: [A, B, D].map((c) => n0(totalDebt(c.balance!))) },
        { label: L('מזומן', 'Cash'), cells: [A, B, D].map((c) => n0(c.balance!.cash)) },
        { label: L('חוב נטו', 'Net debt'), cells: [A, B, D].map((c) => n0(netDebt(c.balance!))) },
        { label: L('הון עצמי', 'Equity'), cells: [A, B, D].map((c) => n0(c.balance!.equity)) },
        { label: L('חוב ÷ הון עצמי', 'Debt ÷ equity'), cells: [sA, sB, sD].map((s) => n2(s.de)), kind: 'total' }
      ] } }
    },
    {
      heading: L('האם הרווח מכסה את הריבית', 'Does the profit cover the interest'),
      paragraphs: [
        L(`יחס כיסוי הריבית (Interest Coverage) שואל כמה פעמים הרווח התפעולי מכסה את הוצאות הריבית: רווח תפעולי ÷ ריבית. אצל ${A.name.he}: ${ltr(`${n0(iA.op)} ÷ ${n0(iA.int)} = ${n1(sA.coverage)}`)}. אצל ${D.name.he}: ${n1(sD.coverage)}.`,
          `The interest coverage ratio asks how many times operating income covers interest costs: operating income ÷ interest. At ${A.name.en}: ${n0(iA.op)} ÷ ${n0(iA.int)} = ${n1(sA.coverage)}. At ${D.name.en}: ${n1(sD.coverage)}.`),
        L('כיסוי גבוה אומר מרווח ביטחון: גם אם הרווח ייפול בחצי, הריבית עדיין משולמת בקלות. כיסוי נמוך אומר שירידה קטנה ברווח יכולה להפוך את החוב לבעיה.',
          'High coverage means a safety margin: even if profit halved, the interest would still be paid easily. Low coverage means a small drop in profit can turn the debt into a problem.'),
        L(`היחס הזה קושר את הדוח למאזן: החוב נמצא במאזן, אבל היכולת לשאת אותו נמדדת ברווח. ועכשיו — ${B.name.he}.`, `This ratio ties the income statement to the balance sheet: the debt sits on the balance sheet, but the ability to carry it is measured in profit. And now — ${B.name.en}.`)
      ],
      work: { kind: 'diagram', diagram: { type: 'table', title: L(`כיסוי ריבית · ${MILLIONS.he}`, `Interest coverage · ${MILLIONS.en}`), columns: [L('נתון', 'Figure'), A.name, D.name], rows: [
        { label: L('רווח תפעולי', 'Operating income'), cells: [n0(iA.op), n0(iD.op)] },
        { label: L('הוצאות ריבית', 'Interest'), cells: [n0(iA.int), n0(iD.int)] },
        { label: L('כיסוי (פעמים)', 'Coverage (times)'), cells: [n1(sA.coverage), n1(sD.coverage)], kind: 'total' }
      ] } }
    }
  ],
  charts: [],
  activity: {
    kind: 'calculate',
    prompt: L('חשבו כיסוי', 'Work out the coverage'),
    task: L(`מה יחס כיסוי הריבית של ${B.name.he}? עגלו לשתי ספרות אחרי הנקודה.`, `What is ${B.name.en}'s interest coverage? Round to two decimal places.`),
    diagram: { type: 'table', title: L(`${B.name.he} · ${MILLIONS.he}`, `${B.name.en} · ${MILLIONS.en}`), columns: [L('שורה', 'Line'), L('סכום', 'Amount')], rows: [
      { label: L('רווח תפעולי', 'Operating income'), cells: [n0(iB.op)] },
      { label: L('הוצאות ריבית', 'Interest'), cells: [n0(iB.int)] },
      { label: L('רווח לפני מס', 'Pre-tax income'), cells: [n0(iB.pre)] },
      { label: L('רווח נקי', 'Net income'), cells: [n0(iB.net)] }
    ] },
    answer: +sB.coverage.toFixed(2),
    tolerance: 0.03,
    field: L('כיסוי ריבית (פעמים)', 'Interest coverage (times)'),
    mistakes: [
      { value: iB.int / iB.op, tolerance: 0.02, why: L('זה יצא הפוך: חילקתם את הריבית ברווח. הכיסוי הוא רווח תפעולי חלקי ריבית.', 'That came out the wrong way round: you divided interest by profit. Coverage is operating income over interest.') },
      { value: iB.net / iB.int, tolerance: 0.02, why: L('לקחתם את הרווח הנקי — שכבר אחרי הריבית. הכיסוי שואל מה היה לפני שהריבית שולמה: הרווח התפעולי.', 'You took net income — already after interest. Coverage asks what there was before the interest was paid: operating income.') },
      { value: iB.pre / iB.int, tolerance: 0.02, why: L('הרווח לפני מס כבר אחרי הריבית. קחו את הרווח התפעולי.', 'Pre-tax income is already after interest. Take operating income.') }
    ],
    steps: [
      L(`רווח תפעולי: ${n0(iB.op)}; ריבית: ${n0(iB.int)}`, `Operating income: ${n0(iB.op)}; interest: ${n0(iB.int)}`),
      L(`${ltr(`${n0(iB.op)} ÷ ${n0(iB.int)} = ${n2(sB.coverage)}`)}`, `${n0(iB.op)} ÷ ${n0(iB.int)} = ${n2(sB.coverage)}`)
    ],
    right: L(`כיסוי של ${n2(sB.coverage)}: הרווח התפעולי של ${B.name.he} מכסה את הריבית שלה פחות מפעמיים וחצי — לעומת ${n1(sA.coverage)} אצל ${A.name.he}.`, `Coverage of ${n2(sB.coverage)}: ${B.name.en}'s operating income covers its interest less than two and a half times — against ${n1(sA.coverage)} at ${A.name.en}.`),
    off: L('עוד לא. הכיסוי הוא הרווח התפעולי חלקי הוצאות הריבית.', 'Not yet. Coverage is operating income divided by interest.'),
    explain: [
      L(`מה המספר אומר: אם הרווח התפעולי של ${B.name.he} ירד בכמחצית, הוא בקושי יכסה את הריבית — ולא יישאר כמעט כלום לבעלי המניות. אצל ${A.name.he} אותה ירידה כמעט לא הייתה מורגשת בשורת הריבית.`,
        `What the number says: if ${B.name.en}'s operating income fell by about half, it would barely cover the interest — and almost nothing would be left for shareholders. At ${A.name.en} the same drop would hardly register on the interest line.`),
      L('מה הוא לא אומר: שהחברה תפשוט רגל, או מתי. חברות עם כיסוי נמוך מחזיקות מעמד שנים — אבל עם פחות מקום לטעויות. זו מדידה של סיכון, לא תחזית.', 'What it does not say: that the company will go bust, or when. Companies with low coverage last for years — but with less room for mistakes. It measures risk; it is not a forecast.')
    ]
  },
  apply: q('p7-apply', 'P7', { type: 'table', title: L(`${B.name.he} · אם החוב ימוחזר · ${MILLIONS.he}`, `${B.name.en} · if the debt is refinanced · ${MILLIONS.en}`), columns: [L('נתון', 'Figure'), L('היום', 'Today'), L(`בריבית ${B_REFI_RATE}%`, `At ${B_REFI_RATE}%`)], rows: [
    { label: L('חוב', 'Debt'), cells: [n0(totalDebt(bB)), n0(totalDebt(bB))] },
    { label: L('ריבית שנתית', 'Yearly interest'), cells: [`${n0(iB.int)} (${pc(bRate)})`, n0(bRefiInt)] },
    { label: L('רווח תפעולי', 'Operating income'), cells: [n0(iB.op), n0(iB.op)] }
  ] }, 'intermediate',
    L(`${B.name.he} צריכה למחזר את החוב שלה, והריבית החדשה תהיה ${B_REFI_RATE}% במקום ${pc(bRate)}. מה קורה למרווח הביטחון שלה?`, `${B.name.en} has to refinance its debt, and the new rate will be ${B_REFI_RATE}% instead of ${pc(bRate)}. What happens to its safety margin?`),
    [
      ['a', L(`הכיסוי יורד מ־${n1(sB.coverage)} לכ־${n1(bRefiCov)} — כמעט אין מקום לירידה ברווח`, `Coverage falls from ${n1(sB.coverage)} to about ${n1(bRefiCov)} — almost no room for a drop in profit`)],
      ['b', L('לא משתנה כלום — הרווח התפעולי נשאר אותו דבר', 'Nothing changes — operating income stays the same')],
      ['c', L('הכיסוי עולה, כי החוב נשאר אותו חוב', 'Coverage rises, because the debt is the same debt')],
      ['d', L('החברה תפשוט רגל בשנה הבאה', 'The company will go bust next year')]
    ], 'a',
    L(`${ltr(`${n0(totalDebt(bB))} × ${B_REFI_RATE}% = ${n0(bRefiInt)}`)} ריבית, ו־${ltr(`${n0(iB.op)} ÷ ${n0(bRefiInt)} = ${n2(bRefiCov)}`)}. העסק עצמו לא השתנה — רק מחיר הכסף. זו הסכנה בחוב גבוה: הוא חושף את החברה לשינויים שהיא לא שולטת בהם. פשיטת רגל היא לא מסקנה; פחות מקום לטעויות — כן.`,
      `${n0(totalDebt(bB))} × ${B_REFI_RATE}% = ${n0(bRefiInt)} of interest, and ${n0(iB.op)} ÷ ${n0(bRefiInt)} = ${n2(bRefiCov)}. The business itself did not change — only the price of money. That is the danger in heavy debt: it exposes the company to changes it does not control. Bankruptcy is not the conclusion; less room for mistakes is.`)),
  takeaway: {
    bottomLine: L('איתנות פיננסית נמדדת בשני צירים: לטווח קצר — היחס השוטף; לטווח ארוך — כמה חוב יש ביחס להון (חוב/הון, חוב נטו), והאם הרווח מכסה את הריבית (כיסוי ריבית).', 'Financial strength is measured on two axes: short term — the current ratio; long term — how much debt there is against equity (debt/equity, net debt), and whether profit covers the interest (interest coverage).'),
    caveat: L('חוב אינו רע מעצמו, וכמה זה "הרבה" תלוי בענף. יחס חלש מודד סיכון — הוא לא מנבא קריסה ולא אומר מתי.', 'Debt is not bad in itself, and how much is "a lot" depends on the industry. A weak ratio measures risk — it does not predict a collapse or say when.')
  },
  questions: [
    q('p7-coverage', 'P7', { type: 'table', title: L(`${D.name.he} · ${MILLIONS.he}`, `${D.name.en} · ${MILLIONS.en}`), columns: [L('שורה', 'Line'), L('סכום', 'Amount')], rows: [
      { label: L('רווח תפעולי', 'Operating income'), cells: [n0(iD.op)] },
      { label: L('הוצאות ריבית', 'Interest'), cells: [n0(iD.int)] },
      { label: L('רווח נקי', 'Net income'), cells: [n0(iD.net)] }
    ] }, 'beginner',
      L(`מה יחס כיסוי הריבית של ${D.name.he}?`, `What is ${D.name.en}'s interest coverage?`),
      nums([n1(sD.coverage), n1(iD.net / iD.int), n2(iD.int / iD.op), n1(iD.op / 100)]), 'a',
      L(`${ltr(`${n0(iD.op)} ÷ ${n0(iD.int)} = ${n1(sD.coverage)}`)}: הריבית כמעט לא מורגשת ברווח שלה. ${n1(iD.net / iD.int)} משתמש ברווח הנקי — שכבר אחרי הריבית.`, `${n0(iD.op)} ÷ ${n0(iD.int)} = ${n1(sD.coverage)}: the interest barely registers against its profit. ${n1(iD.net / iD.int)} uses net income — already after interest.`)),
    q('p7-de', 'P7', funding([B]), 'beginner',
      L(`מה יחס החוב להון העצמי של ${B.name.he}?`, `What is ${B.name.en}'s debt-to-equity ratio?`),
      nums([n2(sB.de), n2(1 / sB.de), n2(totalDebt(bB) / (totalDebt(bB) + bB.equity)), n2(sA.de)]), 'a',
      L(`${ltr(`${n0(totalDebt(bB))} ÷ ${n0(bB.equity)} = ${n2(sB.de)}`)}. יותר משלושה שקלים של חוב על כל שקל של בעלי המניות.`, `${n0(totalDebt(bB))} ÷ ${n0(bB.equity)} = ${n2(sB.de)}. More than three units of debt for every unit of shareholders' money.`)),
    q('p7-which-risk', 'P7', { type: 'table', title: L(`${B.name.he} · שלושה יחסים`, `${B.name.en} · three ratios`), columns: [L('יחס', 'Ratio'), L('ערך', 'Value')], rows: [
      { label: L('יחס שוטף', 'Current ratio'), cells: [n2(sB.current)] },
      { label: L('חוב ÷ הון עצמי', 'Debt ÷ equity'), cells: [n2(sB.de)] },
      { label: L('כיסוי ריבית', 'Interest coverage'), cells: [n2(sB.coverage)] }
    ] }, 'intermediate',
      L(`איזה סיכון בולט יותר אצל ${B.name.he}?`, `Which risk stands out more at ${B.name.en}?`),
      [
        ['a', L('נטל החוב לטווח ארוך — הרבה חוב וכיסוי נמוך', 'The long-term debt burden — a lot of debt and low coverage')],
        ['b', L('החשבונות של השנה הקרובה', 'The coming year\'s bills')],
        ['c', L('אין סיכון — היחס השוטף מעל 1', 'No risk — the current ratio is above 1')],
        ['d', L('שווי השוק שלה', 'Its market cap')]
      ], 'a',
      L(`היחס השוטף (${n2(sB.current)}) אומר שלשנה הקרובה יש כרית. אבל חוב של פי ${n1(sB.de)} מההון וכיסוי של ${n1(sB.coverage)} בלבד — שם הסיכון. שתי השאלות נפרדות, ושתיהן חשובות.`, `The current ratio (${n2(sB.current)}) says there is a cushion for the coming year. But debt at ${n1(sB.de)} times equity and coverage of only ${n1(sB.coverage)} — that is where the risk is. The two questions are separate, and both matter.`))
  ]
};

// ---------- P8 · earnings season ----------
const R = series.P8_REPORT, r = D_REPORT;
const gap = (R.gapOpen / R.prevClose - 1) * 100;
const beat = { rev: (r.actual.rev / r.expected.rev - 1) * 100, eps: (r.actual.eps / r.expected.eps - 1) * 100 }, yoy = (r.actual.rev / r.yearAgoRev - 1) * 100;
const dA = { yield: (A.dividend! / A.price!) * 100, payout: (A.dividend! / iA.eps) * 100 };
const bbShares = A.statement.shares - A_BUYBACK.sharesBought, bbEps = iA.net / bbShares, bbLift = (bbEps / iA.eps - 1) * 100;
const bPayout = (B.dividend! / iB.eps) * 100, bFcfPs = freeCash(B.cash!) / B.statement.shares;
const P8_CHARTS: LessonChartSpec[] = [{
  candles: R, variant: 'price', options: { showVolume: true, points: [{ idx: R.reportIdx, place: 'below', tone: 'bear', label: L('יום אחרי הדוח', 'The day after the report') }] },
  label: L(`מחיר המניה של ${D.name.he}: עלייה לקראת הדוח, ופתיחה נמוכה ב־${pc(-gap)} ביום שאחריו`, `${D.name.en}'s share price: a rise into the report, and an open ${pc(-gap)} lower the day after`),
  caption: L(`${D.name.he} · סביב הדוח`, `${D.name.en} · around the report`), tone: 'neutral', height: 400
}];

export const P8: LessonContent = {
  id: 'P8',
  tutor: { topic: 'guidance', label: L('עונת הדוחות', 'earnings season') },
  teach: [
    {
      heading: L('מה בודקים כשדוח יוצא', 'What to check when a report comes out'),
      paragraphs: [
        L('ארבע פעמים בשנה חברות ציבוריות מפרסמות דוח רבעוני — וזו "עונת הדוחות". כבר ראיתם שהמחיר זז לפי הפער בין התוצאות לציפיות, לא לפי התוצאות לבדן. לכן הדבר הראשון שבודקים הוא מה ציפו, ומה הגיע.',
          'Four times a year listed companies publish a quarterly report — that is "earnings season". You have seen that the price moves on the gap between results and expectations, not on the results alone. So the first thing to check is what was expected, and what arrived.'),
        L(`${D.name.he} מכרה ברבעון ${n0(r.actual.rev)} מיליון, מול ${n0(r.expected.rev)} שציפו — ${pc(beat.rev)} מעל. הרווח למניה: ${n2(r.actual.eps)} מול ${n2(r.expected.eps)} — ${pc(beat.eps)} מעל. והשוואה לאותו רבעון אשתקד (${n0(r.yearAgoRev)}): צמיחה של ${pc(yoy)}.`,
          `${D.name.en} sold ${n0(r.actual.rev)} million in the quarter, against the ${n0(r.expected.rev)} expected — ${pc(beat.rev)} above. Earnings per share: ${n2(r.actual.eps)} against ${n2(r.expected.eps)} — ${pc(beat.eps)} above. And against the same quarter a year ago (${n0(r.yearAgoRev)}): growth of ${pc(yoy)}.`),
        L('משווים לאותו רבעון בשנה הקודמת ולא לרבעון הקודם, כי לעסקים רבים יש עונות: חנות צעצועים מוכרת יותר בדצמבר, וזה לא אומר שהיא צמחה.', 'You compare with the same quarter last year, not the previous quarter, because many businesses have seasons: a toy shop sells more in December, and that does not mean it grew.')
      ],
      work: { kind: 'diagram', diagram: { type: 'table', title: L(`${D.name.he} · הרבעון`, `${D.name.en} · the quarter`), columns: [L('נתון', 'Figure'), L('ציפיות', 'Expected'), L('בפועל', 'Actual')], rows: [
        { label: L('הכנסות (מיליונים)', 'Revenue (millions)'), cells: [n0(r.expected.rev), n0(r.actual.rev)] },
        { label: L('רווח למניה', 'Earnings per share'), cells: [n2(r.expected.eps), n2(r.actual.eps)] },
        { label: L('הכנסות אשתקד (מיליונים)', 'Revenue a year ago (millions)'), cells: ['—', n0(r.yearAgoRev)] }
      ] } }
    },
    {
      heading: L('התחזית של ההנהלה', 'Management\'s guidance'),
      paragraphs: [
        L(`לצד התוצאות, הנהלות רבות מפרסמות תחזית (Guidance) לשנה או לרבעון הבא. ${D.name.he} צפתה עד עכשיו צמיחה של ${r.guidance.before}% השנה — ובדוח הזה הורידה את התחזית ל־${r.guidance.after}%.`,
          `Alongside the results, many managements publish guidance for the year or the next quarter. Until now ${D.name.en} expected ${r.guidance.before}% growth this year — and in this report it cut the guidance to ${r.guidance.after}%.`),
        L('למה זה חשוב? כי מחיר המניה משקף ציפיות לרווחים של השנים הבאות, לא של הרבעון שעבר. רבעון טוב הוא עבר; תחזית היא ההערכה של ההנהלה — מי שמכירה את העסק הכי טוב — לגבי העתיד.',
          'Why does it matter? Because the share price reflects expectations for profits in the years ahead, not the quarter just gone. A good quarter is the past; guidance is management\'s estimate — the people who know the business best — of the future.'),
        L('גם תחזית היא לא הבטחה: הנהלות לפעמים שמרניות בכוונה, ולפעמים אופטימיות מדי. אבל כשהיא משתנה, הציפיות של כולם משתנות איתה.', 'Guidance is not a promise either: managements are sometimes conservative on purpose, and sometimes too optimistic. But when it changes, everyone\'s expectations change with it.')
      ],
      callouts: [{ kind: 'example', lead: L('תצפית', 'Observation'), text: L('התוצאות: מעל הציפיות. התחזית: ירדה. שני מידעים שמושכים לכיוונים הפוכים.', 'The results: above expectations. The guidance: cut. Two pieces of information pulling opposite ways.') }],
      work: { kind: 'diagram', diagram: { type: 'bars', title: L(`${D.name.he} · תחזית הצמיחה לשנה`, `${D.name.en} · growth guidance for the year`), bars: [
        { label: L('לפני הדוח', 'Before the report'), value: r.guidance.before, tone: 'info', shown: L(pc(r.guidance.before, 0), pc(r.guidance.before, 0)) },
        { label: L('בדוח', 'In the report'), value: r.guidance.after, tone: 'err', shown: L(pc(r.guidance.after, 0), pc(r.guidance.after, 0)) }
      ] } }
    },
    {
      heading: L('מחזירים כסף לבעלים', 'Returning cash to the owners'),
      paragraphs: [
        L(`חברה רווחית יכולה להחזיר חלק מהרווח לבעלי המניות. הדרך הישירה היא דיבידנד: ${A.name.he} משלמת ${n2(A.dividend!)} למניה. תשואת הדיבידנד — הדיבידנד חלקי מחיר המניה — היא ${ltr(`${n2(A.dividend!)} ÷ ${n2(A.price!)} = ${pc(dA.yield, 2)}`)}. ויחס החלוקה (Payout Ratio) — איזה חלק מהרווח חולק — ${ltr(`${n2(A.dividend!)} ÷ ${n2(iA.eps)} = ${pc(dA.payout, 0)}`)}.`,
          `A profitable company can return part of its profit to shareholders. The direct way is a dividend: ${A.name.en} pays ${n2(A.dividend!)} per share. The dividend yield — dividend over share price — is ${n2(A.dividend!)} ÷ ${n2(A.price!)} = ${pc(dA.yield, 2)}. And the payout ratio — the share of profit paid out — is ${n2(A.dividend!)} ÷ ${n2(iA.eps)} = ${pc(dA.payout, 0)}.`),
        L(`הדרך השנייה היא רכישה עצמית (Buyback): החברה קונה את המניות של עצמה. אם ${A.name.he} קונה ${A_BUYBACK.sharesBought} מיליון מניות, אותו רווח של ${n0(iA.net)} מתחלק ב־${bbShares} מיליון מניות במקום ${A.statement.shares}: רווח למניה של ${n2(bbEps)} במקום ${n2(iA.eps)} — עלייה של ${pc(bbLift)} בלי שהעסק השתנה בכלל.`,
          `The second way is a buyback: the company buys its own shares. If ${A.name.en} buys ${A_BUYBACK.sharesBought} million shares, the same ${n0(iA.net)} of profit is split over ${bbShares} million shares instead of ${A.statement.shares}: EPS of ${n2(bbEps)} instead of ${n2(iA.eps)} — a rise of ${pc(bbLift)} without the business changing at all.`),
        L('לכן, כשרואים רווח למניה עולה, שואלים: האם הרווח עלה, או רק מספר המניות ירד? ורכישה עצמית במחיר גבוה מדי יכולה להיות שימוש גרוע בכסף — היא טובה לבעלים רק אם המניה שווה את מה ששילמו עליה.',
          'So when EPS rises, you ask: did the profit rise, or only the share count fall? And a buyback at too high a price can be a poor use of money — it helps owners only if the stock is worth what was paid for it.')
      ],
      work: { kind: 'diagram', diagram: { type: 'table', title: L(`${A.name.he} · החזר לבעלים`, `${A.name.en} · returns to owners`), columns: [L('נתון', 'Figure'), L('ערך', 'Value')], rows: [
        { label: L('דיבידנד למניה', 'Dividend per share'), cells: [n2(A.dividend!)] },
        { label: L('תשואת דיבידנד', 'Dividend yield'), cells: [pc(dA.yield, 2)] },
        { label: L('יחס חלוקה', 'Payout ratio'), cells: [pc(dA.payout, 0)] },
        { label: L(`רווח למניה, לפני ← אחרי רכישה של ${A_BUYBACK.sharesBought} מיליון מניות`, `EPS, before → after buying back ${A_BUYBACK.sharesBought} million shares`), cells: [`${n2(iA.eps)} → ${n2(bbEps)}`] }
      ] } }
    }
  ],
  charts: P8_CHARTS,
  activity: {
    kind: 'checklist',
    prompt: L('קראו את הדוח', 'Read the report'),
    task: L(`המחיר של ${D.name.he} לפני ואחרי הדוח שבשלבים הקודמים. עברו על הדוח כמו שהשוק קרא אותו, שאלה אחרי שאלה.`, `${D.name.en}'s price before and after the report from the earlier steps. Go through the report the way the market read it, one question at a time.`),
    chart: 0,
    items: [
      { id: 'results', question: L(`הכנסות ${n0(r.actual.rev)} מול ${n0(r.expected.rev)} צפויות, רווח למניה ${n2(r.actual.eps)} מול ${n2(r.expected.eps)}. התוצאות היו —`, `Revenue ${n0(r.actual.rev)} against ${n0(r.expected.rev)} expected, EPS ${n2(r.actual.eps)} against ${n2(r.expected.eps)}. The results were —`),
        options: [{ key: 'above', label: L('מעל הציפיות', 'Above expectations') }, { key: 'below', label: L('מתחת לציפיות', 'Below expectations') }, { key: 'same', label: L('בדיוק כצפוי', 'Exactly as expected') }], correct: 'above',
        why: L(`גם ההכנסות (${pc(beat.rev)}) וגם הרווח למניה (${pc(beat.eps)}) מעל הציפיות.`, `Both revenue (${pc(beat.rev)}) and EPS (${pc(beat.eps)}) were above expectations.`) },
      { id: 'guidance', question: L(`תחזית הצמיחה לשנה ירדה מ־${r.guidance.before}% ל־${r.guidance.after}%. מה השתנה?`, `The growth guidance for the year was cut from ${r.guidance.before}% to ${r.guidance.after}%. What changed?`),
        options: [{ key: 'future', label: L('הציפיות לרבעונים הבאים', 'The expectations for the coming quarters') }, { key: 'past', label: L('התוצאות של הרבעון שעבר', 'The results of the quarter just gone') }, { key: 'nothing', label: L('שום דבר — תחזית היא רק מילים', 'Nothing — guidance is just words') }], correct: 'future',
        why: L('התחזית מדברת על העתיד. ההנהלה אומרת שהשנה תהיה חלשה מכפי שחשבה — וכל מי שהעריך את החברה לפי 20% צריך לעדכן.', 'Guidance is about the future. Management is saying the year will be weaker than it thought — and everyone who valued the company on 20% has to update.') },
      { id: 'reaction', question: L(`בבוקר שאחרי הדוח המניה נפתחה נמוך ב־${pc(-gap)}. מה הקריאה הסבירה?`, `The morning after the report the stock opened ${pc(-gap)} lower. What is the reasonable reading?`),
        options: [{ key: 'outlook', label: L('השוק הגיב לתחזית החלשה יותר מאשר לרבעון הטוב', 'The market reacted to the weaker outlook more than to the good quarter') }, { key: 'bad', label: L('הדוח היה רע', 'The report was bad') }, { key: 'irrational', label: L('השוק לא רציונלי', 'The market is irrational') }], correct: 'outlook',
        why: L('הרבעון היה טוב — אבל המחיר משקף את השנים הבאות. כשהצמיחה הצפויה יורדת, גם מה שמוכנים לשלם יורד. זו תגובה לציפיות, לא לתוצאות.', 'The quarter was good — but the price reflects the years ahead. When expected growth falls, so does what people are willing to pay. It is a reaction to expectations, not to results.') },
      { id: 'cheap', question: L(`האם אחרי הנפילה ${D.name.he} "זולה"?`, `After the fall, is ${D.name.en} "cheap"?`),
        options: [{ key: 'unknown', label: L('אי אפשר לדעת מהנפילה — צריך להעריך מחדש לפי הצמיחה החדשה', 'The fall cannot tell you — you have to re-value on the new growth') }, { key: 'yes', label: L('כן — כל נפילה היא הזדמנות', 'Yes — every fall is an opportunity') }, { key: 'no', label: L('לא — מניה שנפלה תמשיך ליפול', 'No — a stock that fell will keep falling') }], correct: 'unknown',
        why: L(`המכפיל של ${D.name.he} (${n1(market(D).pe!)} לפני הדוח) התבסס על צמיחה של ${r.guidance.before}%. עם ${r.guidance.after}%, השאלה אם המחיר הגיוני נפתחת מחדש — וזה מה שכלי הערכת השווי בשיעור הבא עושה.`, `${D.name.en}'s multiple (${n1(market(D).pe!)} before the report) was based on ${r.guidance.before}% growth. At ${r.guidance.after}%, the question of whether the price makes sense opens again — and that is what the valuation tool in the next lesson does.`) }
    ],
    right: L('תוצאות מעל הציפיות, תחזית שירדה, ומחיר שהגיב לתחזית. השוק קורא דוח כסיפור על העתיד.', 'Results above expectations, guidance cut, and a price that reacted to the guidance. The market reads a report as a story about the future.'),
    explain: [
      L(`למה המניה ירדה: לפני הדוח היא נסחרה ב־${n2(R.prevClose)}; בבוקר שאחריו נפתחה ב־${n2(R.gapOpen)} — ${pc(-gap)} פחות. הרבעון עצמו היה טוב מהצפוי; מה שהשתנה הוא מה שמצפים מהשנה.`,
        `Why the stock fell: before the report it traded at ${n2(R.prevClose)}; the morning after it opened at ${n2(R.gapOpen)} — ${pc(-gap)} lower. The quarter itself beat expectations; what changed is what the year is expected to bring.`),
      L('תצפית מול פרשנות: רואים פער מחיר ונפח גבוה (כמו בשיעור על נפח). אם הנפילה מוצדקת — לא יודעים מהגרף. זו שאלה של שווי, ולא של תנועת המחיר.', 'Observation against interpretation: you see a price gap and heavy volume (as in the lesson on volume). Whether the fall is justified — the chart cannot tell. That is a question of value, not of price movement.')
    ]
  },
  apply: q('p8-apply', 'P8', { type: 'table', title: L(`${B.name.he} · דיבידנד`, `${B.name.en} · dividend`), columns: [L('נתון', 'Figure'), L('למניה', 'Per share')], rows: [
    { label: L('דיבידנד', 'Dividend'), cells: [n2(B.dividend!)] },
    { label: L('רווח למניה', 'Earnings per share'), cells: [n2(iB.eps)] },
    { label: L('תזרים חופשי למניה', 'Free cash flow per share'), cells: [n2(bFcfPs)] }
  ] }, 'intermediate',
    L(`${B.name.he} משלמת ${n2(B.dividend!)} דיבידנד למניה. מה אפשר לומר על הדיבידנד הזה?`, `${B.name.en} pays a dividend of ${n2(B.dividend!)} per share. What can be said about that dividend?`),
    [
      ['a', L('היא מחלקת יותר ממה שהיא מרוויחה ומייצרת במזומן — הכסף מגיע ממקום אחר, והדיבידנד עלול להיחתך', 'It pays out more than it earns and generates in cash — the money comes from elsewhere, and the dividend may be cut')],
      ['b', L('דיבידנד גבוה הוא תמיד סימן לחברה חזקה', 'A high dividend is always the sign of a strong company')],
      ['c', L('יחס החלוקה נמוך', 'The payout ratio is low')],
      ['d', L('אין קשר בין דיבידנד לרווח', 'Dividends have nothing to do with profit')]
    ], 'a',
    L(`יחס החלוקה: ${ltr(`${n2(B.dividend!)} ÷ ${n2(iB.eps)} = ${pc(bPayout, 0)}`)} — יותר מכל הרווח. וגם התזרים החופשי למניה (${n2(bFcfPs)}) קטן מהדיבידנד. חברה עם חוב כבד שמחלקת מעבר ליכולתה — זו תצפית שמעוררת שאלות, לא תחזית שהדיבידנד ייחתך מחר.`,
      `Payout ratio: ${n2(B.dividend!)} ÷ ${n2(iB.eps)} = ${pc(bPayout, 0)} — more than all the profit. And free cash flow per share (${n2(bFcfPs)}) is smaller than the dividend too. A heavily indebted company paying out beyond its means — an observation that raises questions, not a forecast that the dividend will be cut tomorrow.`)),
  takeaway: {
    bottomLine: L('בדוח רבעוני בודקים את התוצאות מול הציפיות, את הצמיחה מול אותו רבעון אשתקד, ובעיקר את התחזית — כי המחיר משקף את העתיד. דיבידנד ורכישה עצמית הם שתי דרכים להחזיר כסף לבעלים.', 'In a quarterly report you check results against expectations, growth against the same quarter last year, and above all the guidance — because the price reflects the future. Dividends and buybacks are two ways of returning cash to owners.'),
    caveat: L('רבעון טוב עם תחזית חלשה יכול להפיל מניה. רווח למניה יכול לעלות רק בגלל רכישה עצמית, ודיבידנד גבוה מהרווח לא יכול להימשך לנצח.', 'A good quarter with weak guidance can sink a stock. EPS can rise just because of a buyback, and a dividend above profit cannot last forever.')
  },
  questions: [
    q('p8-yield', 'P8', { type: 'table', title: L(`${A.name.he} · דיבידנד`, `${A.name.en} · dividend`), columns: [L('נתון', 'Figure'), L('ערך', 'Value')], rows: [
      { label: L('דיבידנד למניה', 'Dividend per share'), cells: [n2(A.dividend!)] },
      { label: L('מחיר המניה', 'Share price'), cells: [n2(A.price!)] },
      { label: L('רווח למניה', 'Earnings per share'), cells: [n2(iA.eps)] }
    ] }, 'beginner',
      L(`מה תשואת הדיבידנד של ${A.name.he}?`, `What is ${A.name.en}'s dividend yield?`),
      nums([pc(dA.yield, 2), pc(dA.payout, 0), pc((iA.eps / A.price!) * 100, 2), pc(A.dividend!, 2)]), 'a',
      L(`דיבידנד חלקי מחיר: ${ltr(`${n2(A.dividend!)} ÷ ${n2(A.price!)} = ${pc(dA.yield, 2)}`)}. ${pc(dA.payout, 0)} הוא יחס החלוקה — חלקי הרווח למניה.`, `Dividend over price: ${n2(A.dividend!)} ÷ ${n2(A.price!)} = ${pc(dA.yield, 2)}. ${pc(dA.payout, 0)} is the payout ratio — over EPS.`)),
    q('p8-buyback', 'P8', { type: 'table', title: L(`${A.name.he} · רכישה עצמית`, `${A.name.en} · buyback`), columns: [L('נתון', 'Figure'), L('ערך', 'Value')], rows: [
      { label: L('רווח נקי (מיליונים)', 'Net income (millions)'), cells: [n0(iA.net)] },
      { label: L('מניות לפני (מיליונים)', 'Shares before (millions)'), cells: [n0(A.statement.shares)] },
      { label: L('מניות שנקנו (מיליונים)', 'Shares bought back (millions)'), cells: [n0(A_BUYBACK.sharesBought)] }
    ] }, 'intermediate',
      L('מה הרווח למניה אחרי הרכישה, אם הרווח הנקי לא השתנה?', 'What are earnings per share after the buyback, if net income did not change?'),
      nums([n2(bbEps), n2(iA.eps), n2(iA.net / (A.statement.shares + A_BUYBACK.sharesBought)), n2(iA.eps * 1.1)]), 'a',
      L(`${ltr(`${n0(iA.net)} ÷ ${bbShares} = ${n2(bbEps)}`)}: עלייה של ${pc(bbLift)} — בלי שקל אחד של רווח נוסף.`, `${n0(iA.net)} ÷ ${bbShares} = ${n2(bbEps)}: a rise of ${pc(bbLift)} — without a single extra unit of profit.`)),
    q('p8-beat', 'P8', { type: 'table', title: L(`${D.name.he} · הרבעון`, `${D.name.en} · the quarter`), columns: [L('נתון', 'Figure'), L('ציפיות', 'Expected'), L('בפועל', 'Actual')], rows: [
      { label: L('הכנסות (מיליונים)', 'Revenue (millions)'), cells: [n0(r.expected.rev), n0(r.actual.rev)] },
      { label: L('הכנסות אשתקד (מיליונים)', 'Revenue a year ago (millions)'), cells: ['—', n0(r.yearAgoRev)] }
    ] }, 'intermediate',
      L(`מה הצמיחה של ${D.name.he} בהכנסות לעומת אותו רבעון אשתקד?`, `What was ${D.name.en}'s revenue growth against the same quarter a year ago?`),
      nums([pc(yoy), pc(beat.rev), pc((r.expected.rev / r.yearAgoRev - 1) * 100), pc(r.guidance.after, 0)]), 'a',
      L(`${ltr(`${n0(r.actual.rev)} ÷ ${n0(r.yearAgoRev)} − 1 = ${pc(yoy)}`)}. ${pc(beat.rev)} הוא כמה ההכנסות עברו את הציפיות — שאלה אחרת.`, `${n0(r.actual.rev)} ÷ ${n0(r.yearAgoRev)} − 1 = ${pc(yoy)}. ${pc(beat.rev)} is how far revenue beat expectations — a different question.`))
  ]
};

// ---------- P9 · the DCF project ----------
const INPUT = { fcf: freeCash(A.cash!), growthPct: A.growth!, discountPct: A_DCF.discountPct, terminalPct: A_DCF.terminalPct, netDebt: netDebt(A.balance!), shares: A.statement.shares };
const m = dcfBreakdown(INPUT);
const f5 = m.rows[4]!.fcf, tvShare = (m.pvTv / m.ev) * 100;
const grid = dcfGrid(INPUT);
const G = [0, 2, 4], RR = [1, 2, 3];
const cell = (ri: number, gi: number) => grid.values[ri]![gi]!;
const subVals = RR.flatMap((ri) => G.map((gi) => cell(ri, gi)));
const lo = Math.min(...subVals), hi = Math.max(...subVals);
const df = (t: number) => 1 / (1 + A_DCF.discountPct / 100) ** t;
const sensTable: Diagram = {
  type: 'table', title: L('שווי למניה: שיעור היוון × צמיחה', 'Value per share: discount rate × growth'),
  columns: [L('היוון \\ צמיחה', 'Discount \\ growth'), ...G.map((gi) => L(pc(grid.growth[gi]!, 0), pc(grid.growth[gi]!, 0)))],
  rows: RR.map((ri) => ({ label: L(pc(grid.discount[ri]!, 0), pc(grid.discount[ri]!, 0)), cells: G.map((gi) => n2(cell(ri, gi))), ...(ri === 2 ? { mark: [1] } : {}) }))
};
const forecast: Diagram = {
  type: 'table', title: L(`תחזית והיוון · ${MILLIONS.he}`, `Forecast and discounting · ${MILLIONS.en}`),
  columns: [L('שנה', 'Year'), L('תזרים חופשי', 'Free cash flow'), L('מקדם היוון', 'Discount factor'), L('ערך היום', 'Value today')],
  rows: [
    ...m.rows.map((x) => ({ label: L(`שנה ${x.year}`, `Year ${x.year}`), cells: [n1(x.fcf), x.df.toFixed(3), n1(x.pv)] })),
    { label: L('סך הכול, שנים 1–5', 'Total, years 1–5'), cells: ['', '', n0(m.sumPv)], kind: 'total' as const }
  ]
};

export const P9: LessonContent = {
  id: 'P9',
  tutor: { topic: 'dcf', label: L('מודל DCF', 'the DCF model') },
  teach: [
    {
      heading: L('שווי הוא המזומן העתידי, היום', 'Value is future cash, today'),
      paragraphs: [
        L(`מודל DCF (היוון תזרימי מזומנים) עונה על השאלה שהמסלול הזה שאל מההתחלה: כמה העסק שווה? התשובה שלו: כל המזומן שהעסק ייצר בעתיד — מובא ליום הזה. בשביל ${A.name.he} נתחיל מהתזרים החופשי שלה בשנה האחרונה: ${n0(INPUT.fcf)} מיליון (ראיתם אותו בשיעור 3).`,
          `A DCF model (discounted cash flow) answers the question this track has asked from the start: what is the business worth? Its answer: all the cash the business will produce in the future — brought to today. For ${A.name.en} you start from its free cash flow last year: ${n0(INPUT.fcf)} million (you saw it in lesson 3).`),
        L(`למה "מובא ליום הזה"? כי 100 שקל בעוד חמש שנים שווים היום פחות מ־100: אפשר היה להשקיע אותם בינתיים, והעתיד לא ודאי. בשיעור היוון (Discount Rate) של ${A_DCF.discountPct}% בשנה, 100 שקל בעוד חמש שנים שווים היום ${ltr(`100 × ${df(5).toFixed(3)} = ${n1(100 * df(5))}`)}.`,
          `Why "brought to today"? Because 100 in five years is worth less than 100 today: it could have been invested meanwhile, and the future is uncertain. At a discount rate of ${A_DCF.discountPct}% a year, 100 in five years is worth 100 × ${df(5).toFixed(3)} = ${n1(100 * df(5))} today.`),
        L('שיעור ההיוון הוא התשואה שהייתם דורשים כדי לשאת את הסיכון של ההשקעה. ככל שהוא גבוה יותר, העתיד שווה פחות היום.', 'The discount rate is the return you would demand for carrying the investment\'s risk. The higher it is, the less the future is worth today.')
      ],
      work: { kind: 'diagram', diagram: { type: 'bars', title: L(`100 היום מול 100 בעוד שנים, בהיוון של ${A_DCF.discountPct}%`, `100 today against 100 in future years, at ${A_DCF.discountPct}%`), bars: [0, 1, 3, 5].map((t) => ({
        label: t ? L(`בעוד ${t} ${t === 1 ? 'שנה' : 'שנים'}`, `In ${t} year${t === 1 ? '' : 's'}`) : L('היום', 'Today'), value: 100 * df(t), tone: t ? 'learn' as const : 'ok' as const, shown: L(n1(100 * df(t)), n1(100 * df(t)))
      })) } }
    },
    {
      heading: L('כל מודל הוא הנחות', 'Every model is assumptions'),
      paragraphs: [
        L(`מודל שווי לא מגלה את העתיד — הוא מחשב את מה שמניחים עליו. לכן כותבים את ההנחות במפורש, ומנמקים כל אחת. שלוש הנחות מניעות את המודל של ${A.name.he}:`, `A valuation model does not reveal the future — it computes what you assume about it. So you write the assumptions down explicitly and justify each. Three assumptions drive ${A.name.en}'s model:`),
        L(`צמיחה של ${INPUT.growthPct}% בשנה בחמש השנים הקרובות — הצמיחה הצפויה של ${A.name.he} מהשיעורים הקודמים. שיעור היוון של ${INPUT.discountPct}%. וצמיחה לטווח ארוך של ${INPUT.terminalPct}% — לא יותר מקצב הצמיחה של הכלכלה, כי שום חברה לא גדלה מהר ממנה לנצח.`,
          `Growth of ${INPUT.growthPct}% a year for the next five years — ${A.name.en}'s expected growth from the earlier lessons. A discount rate of ${INPUT.discountPct}%. And long-term growth of ${INPUT.terminalPct}% — no more than the economy's growth rate, because no company outgrows it forever.`),
        L(`ועוד שלושה מספרים קבועים מהדוחות: תזרים חופשי ${n0(INPUT.fcf)}, חוב נטו ${n0(INPUT.netDebt)} (מהמאזן), ו־${INPUT.shares} מיליון מניות.`, `And three fixed numbers from the reports: free cash flow ${n0(INPUT.fcf)}, net debt ${n0(INPUT.netDebt)} (from the balance sheet), and ${INPUT.shares} million shares.`)
      ],
      callouts: [{ kind: 'caveat', lead: L('שימו לב', 'Watch out'), text: L('הנחות קטנות, הבדלים גדולים: שינוי של אחוז אחד בהיוון מזיז את השווי במידה ניכרת.', 'Small assumptions, big differences: one percentage point on the discount rate moves the value noticeably.') }],
      work: { kind: 'diagram', diagram: { type: 'table', title: L(`${A.name.he} · ההנחות`, `${A.name.en} · the assumptions`), columns: [L('הנחה', 'Assumption'), L('ערך', 'Value'), L('למה', 'Why')], rows: [
        { label: L('צמיחה, שנים 1–5', 'Growth, years 1–5'), cells: [pc(INPUT.growthPct, 1), L('הצמיחה הצפויה של החברה', 'The company\'s expected growth')] },
        { label: L('שיעור היוון', 'Discount rate'), cells: [pc(INPUT.discountPct, 1), L('התשואה שהייתם דורשים על הסיכון', 'The return you would demand for the risk')] },
        { label: L('צמיחה לטווח ארוך', 'Long-term growth'), cells: [pc(INPUT.terminalPct, 1), L('לא יותר מצמיחת הכלכלה', 'No more than the economy grows')] },
        { label: L('תזרים חופשי אחרון', 'Last free cash flow'), cells: [n0(INPUT.fcf), L('מדוח התזרים', 'From the cash flow statement')] },
        { label: L('חוב נטו', 'Net debt'), cells: [n0(INPUT.netDebt), L('מהמאזן', 'From the balance sheet')] }
      ] } }
    },
    {
      heading: L('מביאים את העתיד להיום', 'Bringing the future to today'),
      paragraphs: [
        L(`שלב התחזית: מגדילים את התזרים ב־${INPUT.growthPct}% כל שנה — ${n1(m.rows[0]!.fcf)} בשנה 1, ${n1(f5)} בשנה 5. אחר כך מכפילים כל שנה במקדם ההיוון שלה: ${ltr(`1 ÷ 1.10ᵗ`)}. בשנה 5 המקדם הוא ${m.rows[4]!.df.toFixed(3)} — כל שקל אז שווה ${Math.round(m.rows[4]!.df * 100)} אגורות היום.`,
          `The forecast step: grow the cash flow by ${INPUT.growthPct}% each year — ${n1(m.rows[0]!.fcf)} in year 1, ${n1(f5)} in year 5. Then multiply each year by its discount factor: 1 ÷ 1.10ᵗ. In year 5 the factor is ${m.rows[4]!.df.toFixed(3)} — each unit then is worth ${Math.round(m.rows[4]!.df * 100)} cents today.`),
        L(`סך הערך של חמש השנים, היום: ${n0(m.sumPv)} מיליון. שימו לב שהתזרים גדל כל שנה, אבל הערך שלו היום כמעט לא — ההיוון מבטל את רוב הצמיחה.`, `The total value of the five years, today: ${n0(m.sumPv)} million. Notice that the cash flow grows each year, but its value today barely does — discounting cancels most of the growth.`),
        L('אבל החברה לא נסגרת בשנה 5. את כל השנים שאחריה מסכם מספר אחד — ערך השארית — ואותו תחשבו בשלב הבא.', 'But the company does not close in year 5. All the years after it are summed up by one number — the terminal value — and you will work it out in the next step.')
      ],
      work: { kind: 'diagram', diagram: forecast }
    }
  ],
  charts: [],
  activity: {
    kind: 'calculate',
    prompt: L('ערך שארית', 'The terminal value'),
    task: L(`ערך השארית מסכם את כל השנים שאחרי שנה 5: תזרים שנה 5 × (1 + צמיחה ארוכת טווח) ÷ (שיעור היוון − צמיחה ארוכת טווח). מה הוא, במיליונים? עגלו למספר שלם.`,
      `The terminal value sums up every year after year 5: year-5 cash flow × (1 + long-term growth) ÷ (discount rate − long-term growth). What is it, in millions? Round to a whole number.`),
    diagram: { type: 'table', title: L(`ערך שארית · ${A.name.he}`, `Terminal value · ${A.name.en}`), columns: [L('נתון', 'Figure'), L('ערך', 'Value')], rows: [
      { label: L('תזרים חופשי, שנה 5', 'Free cash flow, year 5'), cells: [n1(f5)] },
      { label: L('צמיחה לטווח ארוך', 'Long-term growth'), cells: [pc(INPUT.terminalPct, 1)] },
      { label: L('שיעור היוון', 'Discount rate'), cells: [pc(INPUT.discountPct, 1)] }
    ], caption: L('ערך שארית = תזרים שנה 5 × (1 + g) ÷ (r − g)', 'Terminal value = year-5 cash flow × (1 + g) ÷ (r − g)') },
    answer: Math.round(m.tv),
    tolerance: Math.round(m.tv * 0.01),
    field: L('ערך שארית (מיליונים)', 'Terminal value (millions)'),
    mistakes: [
      { value: f5 / ((INPUT.discountPct - INPUT.terminalPct) / 100), tolerance: 30, why: L('שכחתם את (1 + g): ערך השארית מתחיל מהתזרים של שנה 6 — תזרים שנה 5, גדל בעוד שנה.', 'You forgot the (1 + g): the terminal value starts from year 6\'s cash flow — year 5\'s, grown one more year.') },
      { value: (f5 * (1 + INPUT.terminalPct / 100)) / ((INPUT.discountPct + INPUT.terminalPct) / 100), tolerance: 30, why: L('חיברתם במכנה במקום לחסר: r − g, לא r + g. הצמיחה מקטינה את "ההנחה" שהזמן לוקח.', 'You added in the denominator instead of subtracting: r − g, not r + g. Growth offsets part of what time takes away.') },
      { value: m.pvTv, tolerance: 30, why: L('זה כבר ערך השארית מהוון להיום. השאלה היא על הערך בשנה 5 — לפני ההיוון.', 'That is the terminal value already discounted to today. The question asks for its value in year 5 — before discounting.') }
    ],
    steps: [
      L(`תזרים שנה 6: ${ltr(`${n1(f5)} × 1.025 = ${n1(f5 * (1 + INPUT.terminalPct / 100))}`)}`, `Year-6 cash flow: ${n1(f5)} × 1.025 = ${n1(f5 * (1 + INPUT.terminalPct / 100))}`),
      L(`ההפרש במכנה: ${ltr('0.10 − 0.025 = 0.075')}`, 'The denominator: 0.10 − 0.025 = 0.075'),
      L(`ערך שארית: ${ltr(`${n1(f5 * (1 + INPUT.terminalPct / 100))} ÷ 0.075 = ${n0(m.tv)}`)}`, `Terminal value: ${n1(f5 * (1 + INPUT.terminalPct / 100))} ÷ 0.075 = ${n0(m.tv)}`)
    ],
    right: L(`${n0(m.tv)} מיליון — הערך, בשנה 5, של כל השנים שאחריה. מהוון להיום: ${ltr(`${n0(m.tv)} × ${m.rows[4]!.df.toFixed(3)} = ${n0(m.pvTv)}`)}.`, `${n0(m.tv)} million — the value, in year 5, of every year after it. Discounted to today: ${n0(m.tv)} × ${m.rows[4]!.df.toFixed(3)} = ${n0(m.pvTv)}.`),
    off: L('עוד לא. שלושה צעדים: תזרים שנה 5 כפול 1.025, ההפרש 0.10 פחות 0.025, ואז הראשון חלקי השני.', 'Not yet. Three steps: year-5 cash flow times 1.025, the difference 0.10 minus 0.025, then the first divided by the second.'),
    explain: [
      L(`מחברים הכל: ${ltr(`${n0(m.sumPv)} + ${n0(m.pvTv)} = ${n0(m.ev)}`)} — שווי העסק. פחות חוב נטו של ${n0(INPUT.netDebt)}: ${n0(m.equity)} לבעלי המניות, ובחלוקה ל־${INPUT.shares} מיליון מניות — ${n2(m.perShare)} למניה.`,
        `Put it together: ${n0(m.sumPv)} + ${n0(m.pvTv)} = ${n0(m.ev)} — the value of the business. Less net debt of ${n0(INPUT.netDebt)}: ${n0(m.equity)} for shareholders, and split over ${INPUT.shares} million shares — ${n2(m.perShare)} per share.`),
      L(`שימו לב: ערך השארית לבדו הוא ${pc(tvShare, 0)} מהשווי. ההנחה הרחוקה ביותר — מה יקרה אחרי שנה 5 — היא המשפיעה ביותר. ובטבלת הרגישות: בין ${n2(lo)} ל־${n2(hi)} למניה, לפי שינוי קטן בהנחות. לכן מציגים שווי כטווח, לא כמספר אחד. בכלי ה־DCF שבלשונית הכלים אפשר לשנות כל הנחה בעצמכם.`,
        `Notice: the terminal value alone is ${pc(tvShare, 0)} of the value. The most distant assumption — what happens after year 5 — is the most influential. And in the sensitivity table: between ${n2(lo)} and ${n2(hi)} per share, on small changes in the assumptions. That is why value is shown as a range, not one number. In the DCF tool under Tools you can change every assumption yourself.`)
    ]
  },
  apply: q('p9-apply', 'P9', sensTable, 'intermediate',
    L(`מניית ${A.name.he} נסחרת ב־${n2(A.price!)}. טבלת הרגישות נותנת בין ${n2(lo)} ל־${n2(hi)}. מה הקריאה הסבירה?`, `${A.name.en}'s stock trades at ${n2(A.price!)}. The sensitivity table gives between ${n2(lo)} and ${n2(hi)}. What is the reasonable reading?`),
    [
      ['a', L('המחיר מניח צמיחה חזקה בהרבה, או סיכון נמוך בהרבה, מההנחות שלכם — שווה לבדוק מה הוא "יודע" שהמודל לא', 'The price assumes much stronger growth, or much lower risk, than your assumptions — worth checking what it "knows" that the model does not')],
      ['b', L('למכור מיד — המניה יקרה פי שניים', 'Sell at once — the stock is twice too expensive')],
      ['c', L('המודל שגוי, כי השוק תמיד צודק', 'The model is wrong, because the market is always right')],
      ['d', L('לקנות — השווי קרוב למחיר', 'Buy — the value is close to the price')]
    ], 'a',
    L(`גם הפינה האופטימית בטבלה (${n2(hi)}) רחוקה מ־${n2(A.price!)}. זה אומר שהמחיר מגלם ציפיות גבוהות — אולי צמיחה ארוכה ומהירה יותר ממה שהנחתם. זו לא הוראת מכירה: זו שאלה — מה צריך להאמין כדי שהמחיר יהיה הגיוני, והאם זה סביר.`,
      `Even the optimistic corner of the table (${n2(hi)}) is far from ${n2(A.price!)}. That says the price embeds high expectations — perhaps longer, faster growth than you assumed. It is not an instruction to sell: it is a question — what would you have to believe for the price to make sense, and is that reasonable.`)),
  takeaway: {
    bottomLine: L('מודל DCF אומר שעסק שווה את כל המזומן שהוא ייצר, מובא להיום: תחזית לחמש שנים, ערך שארית לכל מה שאחריהן, מחוברים ומהוונים, פחות החוב — ומחולקים במספר המניות.', 'A DCF model says a business is worth all the cash it will produce, brought to today: a five-year forecast, a terminal value for everything after, added up and discounted, less the debt — and divided by the number of shares.'),
    caveat: L('המודל לא יודע את העתיד; הוא יודע רק את ההנחות שלכם. רוב השווי מגיע מההנחה הרחוקה ביותר, ושינוי קטן מזיז אותו הרבה — לכן חושבים בטווח, ומשאירים מרווח ביטחון.', 'The model does not know the future; it only knows your assumptions. Most of the value comes from the most distant assumption, and a small change moves it a lot — so think in ranges, and keep a margin of safety.')
  },
  questions: [
    q('p9-factor', 'P9', { type: 'table', title: L(`מקדמי היוון בשיעור ${A_DCF.discountPct}%`, `Discount factors at ${A_DCF.discountPct}%`), columns: [L('שנה', 'Year'), L('מקדם', 'Factor')], rows: [1, 2, 4].map((t) => ({ label: L(`שנה ${t}`, `Year ${t}`), cells: [df(t).toFixed(3)] })) }, 'beginner',
      L('מה מקדם ההיוון של שנה 3?', 'What is the discount factor for year 3?'),
      nums([df(3).toFixed(3), (1 - 0.3).toFixed(3), (1.1 ** 3).toFixed(3), df(1).toFixed(3)]), 'a',
      L(`${ltr(`1 ÷ 1.10³ = ${df(3).toFixed(3)}`)} — בין השנה השנייה (${df(2).toFixed(3)}) לרביעית (${df(4).toFixed(3)}). ${(1.1 ** 3).toFixed(3)} הוא כמה כסף יגדל, לא כמה הוא שווה היום.`, `1 ÷ 1.10³ = ${df(3).toFixed(3)} — between year 2 (${df(2).toFixed(3)}) and year 4 (${df(4).toFixed(3)}). ${(1.1 ** 3).toFixed(3)} is how much money grows, not what it is worth today.`)),
    q('p9-tv-share', 'P9', { type: 'table', title: L(`${A.name.he} · ממה בנוי השווי · ${MILLIONS.he}`, `${A.name.en} · what the value is made of · ${MILLIONS.en}`), columns: [L('חלק', 'Part'), L('ערך היום', 'Value today')], rows: [
      { label: L('שנים 1–5', 'Years 1–5'), cells: [n0(m.sumPv)] },
      { label: L('ערך שארית, מהוון', 'Terminal value, discounted'), cells: [n0(m.pvTv)] }
    ] }, 'intermediate',
      L('איזה חלק מהשווי מגיע מהשנים שאחרי שנה 5?', 'What share of the value comes from the years after year 5?'),
      nums([pc(tvShare, 0), pc(100 - tvShare, 0), pc(50, 0), pc((m.pvTv / m.tv) * 100, 0)]), 'a',
      L(`${ltr(`${n0(m.pvTv)} ÷ (${n0(m.sumPv)} + ${n0(m.pvTv)}) = ${pc(tvShare, 0)}`)}. רוב השווי נשען על מה שיקרה אחרי חמש שנים — ההנחה הכי לא ודאית במודל.`, `${n0(m.pvTv)} ÷ (${n0(m.sumPv)} + ${n0(m.pvTv)}) = ${pc(tvShare, 0)}. Most of the value rests on what happens after five years — the least certain assumption in the model.`)),
    q('p9-sensitivity', 'P9', sensTable, 'intermediate',
      L(`אם שיעור ההיוון הוא ${pc(grid.discount[3]!, 0)} במקום ${pc(grid.discount[2]!, 0)} (בצמיחה של ${pc(grid.growth[2]!, 0)}), מה השווי למניה?`, `If the discount rate is ${pc(grid.discount[3]!, 0)} instead of ${pc(grid.discount[2]!, 0)} (at ${pc(grid.growth[2]!, 0)} growth), what is the value per share?`),
      nums([n2(cell(3, 2)), n2(cell(2, 2)), n2(cell(1, 2)), n2(cell(3, 4))]), 'a',
      L(`${n2(cell(3, 2))} במקום ${n2(cell(2, 2))} — ירידה של ${pc((1 - cell(3, 2) / cell(2, 2)) * 100, 0)} מנקודת אחוז אחת בהנחה. זו הסיבה שמודל הוא טווח.`, `${n2(cell(3, 2))} instead of ${n2(cell(2, 2))} — a fall of ${pc((1 - cell(3, 2) / cell(2, 2)) * 100, 0)} from one percentage point in one assumption. That is why a model is a range.`))
  ]
};

export const FUNDAMENTALS_3 = [P7, P8, P9];
