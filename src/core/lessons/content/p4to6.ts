// ---------------------------------------------------------------------------
// Fundamentals, module 2 (part one) — quality and price: P4 (margins), P5
// (returns on capital), P6 (multiples).
//
// Sources: the approved curriculum and the Artifact's page 09 (09.3 margins
// over five years; 09.2 P/S when there is no profit; 09.6 the PEG comparison).
// Builds on P2 (the four profits) and P3 (the balance sheet, net debt). Debt as
// a risk is P7's; valuation from cash flows is P9's. No multiple or ratio is a
// buy or sell signal: each lesson ends on what the number does not say.
// Every number is computed from @core/fundamentals/companies.
// ---------------------------------------------------------------------------
import type { Localized } from '@core/types/kb';
import type { Diagram, LessonContent } from './types';
import { A, B, C, D, A_HISTORY, B_HISTORY, income, margins, returns, market, netDebt, totalAssets, totalDebt, strength } from '@core/fundamentals/companies';
import { L, ltr, n0, n1, n2, pc, MILLIONS, q, nums, statementTable } from './fundamentalsKit';

// ---------- P4 · margins ----------
const iA = income(A.statement), iB = income(B.statement), iD = income(D.statement);
const mg = (i: { gross: number; op: number; net: number; rev: number }) => ({ gross: (i.gross / i.rev) * 100, op: (i.op / i.rev) * 100, net: (i.net / i.rev) * 100 });
const mA = mg(iA), mB = mg(iB), mD = mg(iD);
const hA = { gross: margins(A_HISTORY, 'gross'), op: margins(A_HISTORY, 'op'), net: margins(A_HISTORY, 'net') };
const hB = { gross: margins(B_HISTORY, 'gross'), op: margins(B_HISTORY, 'op'), net: margins(B_HISTORY, 'net') };
const Y = A_HISTORY.years, last = Y.length - 1;
const grow = (a: number, b: number) => (b / a - 1) * 100;
const threeMargins = (h: typeof hA, title: Localized): Diagram => ({
  type: 'grouped', title, groups: Y.map(String),
  series: [
    { label: L('שולי רווח גולמי', 'Gross margin'), tone: 'adv', values: h.gross, shown: h.gross.map((x) => n1(x)) },
    { label: L('שולי רווח תפעולי', 'Operating margin'), tone: 'learn', values: h.op, shown: h.op.map((x) => n1(x)) },
    { label: L('שולי רווח נקי', 'Net margin'), tone: 'info', values: h.net, shown: h.net.map((x) => n1(x)) }
  ]
});
const opSteps = hA.op.slice(1).map((x, i) => x - hA.op[i]!);
const bestStep = opSteps.indexOf(Math.max(...opSteps));

export const P4: LessonContent = {
  id: 'P4',
  tutor: { topic: 'operating-margin', label: L('שולי רווח', 'profit margins') },
  teach: [
    {
      heading: L('כמה נשאר מכל שקל מכירות', 'What is left of each unit of sales'),
      paragraphs: [
        L(`שולי רווח (Margin) הופכים את ארבעת הרווחים מהדוח לאחוזים מההכנסות. אצל ${A.name.he}: שולי רווח גולמי ${pc(mA.gross)}, שולי רווח תפעולי ${pc(mA.op)}, שולי רווח נקי ${pc(mA.net)}. במילים: מכל שקל מכירות נשארות ${Math.round(mA.gross)} אגורות אחרי העלות הישירה, ${Math.round(mA.op)} אחרי הפעלת העסק, ו־${Math.round(mA.net)} לבעלי המניות.`,
          `Margins turn the income statement's four profits into percentages of revenue. At ${A.name.en}: gross margin ${pc(mA.gross)}, operating margin ${pc(mA.op)}, net margin ${pc(mA.net)}. In words: of every dollar of sales, ${Math.round(mA.gross)} cents are left after direct costs, ${Math.round(mA.op)} after running the business, and ${Math.round(mA.net)} for shareholders.`),
        L('למה אחוזים ולא סכומים? כי הם מאפשרים להשוות: חברה גדולה תרוויח יותר מחברה קטנה גם אם היא פחות יעילה. שוליים עונים על שאלה אחרת — כמה טוב העסק ממיר מכירות לרווח.',
          'Why percentages and not amounts? Because they let you compare: a big company will earn more than a small one even if it is less efficient. Margins answer a different question — how well the business turns sales into profit.')
      ],
      work: { kind: 'diagram', diagram: { type: 'bars', title: L(`${A.name.he} · מכל שקל מכירות`, `${A.name.en} · out of every unit of sales`), bars: [
        { label: L('שולי רווח גולמי', 'Gross margin'), value: mA.gross, tone: 'learn', shown: L(pc(mA.gross), pc(mA.gross)) },
        { label: L('שולי רווח תפעולי', 'Operating margin'), value: mA.op, tone: 'info', shown: L(pc(mA.op), pc(mA.op)) },
        { label: L('שולי רווח נקי', 'Net margin'), value: mA.net, tone: 'ok', shown: L(pc(mA.net), pc(mA.net)) }
      ] } }
    },
    {
      heading: L('כל שוליים עונים על שאלה אחרת', 'Each margin answers its own question'),
      paragraphs: [
        L(`שולי הרווח הגולמי מספרים כמה החברה גובה ביחס למה שעולה לה לייצר — כוח תמחור. ${A.name.he}: ${pc(mA.gross)}; ${B.name.he}: ${pc(mB.gross)}. על אותן הכנסות בדיוק, ל־${A.name.he} נשאר הרבה יותר מכל מכירה.`,
          `Gross margin tells how much the company charges relative to what it costs to make — pricing power. ${A.name.en}: ${pc(mA.gross)}; ${B.name.en}: ${pc(mB.gross)}. On exactly the same revenue, ${A.name.en} keeps far more of each sale.`),
        L(`שולי הרווח התפעולי מספרים כמה יעיל העסק כולו: ${pc(mA.op)} מול ${pc(mB.op)} — הפער קטן, כי ${B.name.he} מוציאה פחות על שיווק ופיתוח. ושולי הרווח הנקי מוסיפים את המימון והמס: ${pc(mA.net)} מול ${pc(mB.net)} — כאן החוב של ${B.name.he} שראיתם בשיעור 2 חוזר.`,
          `Operating margin tells how efficient the whole business is: ${pc(mA.op)} against ${pc(mB.op)} — the gap is small, because ${B.name.en} spends less on marketing and development. And net margin adds financing and tax: ${pc(mA.net)} against ${pc(mB.net)} — here the debt you saw at ${B.name.en} in lesson 2 comes back.`),
        L('והכלל החשוב ביותר: משווים שוליים רק בתוך אותו ענף. רשת סופרמרקטים חיה על שוליים דקים, חברת תוכנה על שוליים רחבים — ואף אחת מהן לא "טובה" מהשנייה בגלל זה.',
          'And the most important rule: compare margins only within the same industry. A supermarket chain lives on thin margins, a software company on wide ones — and neither is "better" because of that.')
      ],
      callouts: [{ kind: 'caveat', lead: L('שימו לב', 'Watch out'), text: L('שוליים של חברות מענפים שונים לא ניתנים להשוואה ישירה.', 'Margins of companies in different industries are not directly comparable.') }],
      work: { kind: 'diagram', diagram: { type: 'table', title: L('שולי רווח · השנה', 'Margins · this year'), columns: [L('שוליים', 'Margin'), A.name, B.name], rows: [
        { label: L('גולמי', 'Gross'), cells: [pc(mA.gross), pc(mB.gross)] },
        { label: L('תפעולי', 'Operating'), cells: [pc(mA.op), pc(mB.op)] },
        { label: L('נקי', 'Net'), cells: [pc(mA.net), pc(mB.net)] }
      ] } }
    },
    {
      heading: L('חמש שנים של שוליים', 'Five years of margins'),
      paragraphs: [
        L(`מספר של שנה אחת הוא תמונה; חמש שנים הן סיפור. בין ${Y[0]} ל־${Y[last]} שולי הרווח הגולמי של ${A.name.he} עלו מעט — מ־${pc(hA.gross[0]!)} ל־${pc(hA.gross[last]!)}. אבל השוליים התפעוליים כמעט הוכפלו: מ־${pc(hA.op[0]!)} ל־${pc(hA.op[last]!)}.`,
          `One year's number is a snapshot; five years are a story. From ${Y[0]} to ${Y[last]}, ${A.name.en}'s gross margin rose a little — from ${pc(hA.gross[0]!)} to ${pc(hA.gross[last]!)}. But its operating margin nearly doubled: from ${pc(hA.op[0]!)} to ${pc(hA.op[last]!)}.`),
        L('כשהשוליים התפעוליים עולים מהר יותר מהגולמיים, זה אומר שהוצאות התפעול — שיווק, פיתוח, הנהלה — גדלו לאט יותר מההכנסות. החברה נהיית יעילה יותר ככל שהיא גדלה.',
          'When operating margin rises faster than gross margin, it means operating costs — marketing, development, admin — grew more slowly than revenue. The company gets more efficient as it grows.'),
        L('מה שהמגמה לא אומרת: שהיא תימשך. שוליים שעלו חמש שנים יכולים להתכווץ כשמגיע מתחרה, או כשהחברה מחליטה להשקיע שוב. מגמה היא תצפית על העבר.',
          'What the trend does not say: that it will continue. Margins that rose for five years can shrink when a competitor arrives, or when the company decides to invest again. A trend is an observation about the past.')
      ],
      work: { kind: 'diagram', diagram: threeMargins(hA, L(`${A.name.he} · ${Y[0]}–${Y[last]} · %`, `${A.name.en} · ${Y[0]}–${Y[last]} · %`)) }
    }
  ],
  charts: [],
  activity: {
    kind: 'checklist',
    prompt: L('השוו שוליים', 'Compare margins'),
    task: L(`השוו את ${A.name.he} ו־${B.name.he} בין ${Y[0]} ל־${Y[last]}, שאלה אחרי שאלה. כל תשובה ננעלת ומוסברת.`, `Compare ${A.name.en} and ${B.name.en} between ${Y[0]} and ${Y[last]}, one question at a time. Each answer locks and explains itself.`),
    diagram: { type: 'table', title: L(`שולי רווח · ${Y[0]} ← ${Y[last]}`, `Margins · ${Y[0]} → ${Y[last]}`), columns: [L('שוליים', 'Margin'), L(`${A.name.he} ${Y[0]}`, `${A.name.en} ${Y[0]}`), L(`${A.name.he} ${Y[last]}`, `${A.name.en} ${Y[last]}`), L(`${B.name.he} ${Y[0]}`, `${B.name.en} ${Y[0]}`), L(`${B.name.he} ${Y[last]}`, `${B.name.en} ${Y[last]}`)], rows: [
      { label: L('גולמי', 'Gross'), cells: [pc(hA.gross[0]!), pc(hA.gross[last]!), pc(hB.gross[0]!), pc(hB.gross[last]!)] },
      { label: L('תפעולי', 'Operating'), cells: [pc(hA.op[0]!), pc(hA.op[last]!), pc(hB.op[0]!), pc(hB.op[last]!)] },
      { label: L('נקי', 'Net'), cells: [pc(hA.net[0]!), pc(hA.net[last]!), pc(hB.net[0]!), pc(hB.net[last]!)] }
    ] },
    items: [
      { id: 'gross', question: L(`למי שולי רווח גולמי גבוהים יותר ב־${Y[last]}?`, `Whose gross margin is higher in ${Y[last]}?`),
        options: [{ key: 'a', label: A.name }, { key: 'b', label: B.name }, { key: 'same', label: L('בערך אותו דבר', 'About the same') }], correct: 'a',
        why: L(`${pc(hA.gross[last]!)} מול ${pc(hB.gross[last]!)}: ${A.name.he} גובה הרבה יותר ביחס לעלות הישירה של מה שהיא מוכרת.`, `${pc(hA.gross[last]!)} against ${pc(hB.gross[last]!)}: ${A.name.en} charges far more relative to the direct cost of what it sells.`) },
      { id: 'trend', question: L(`של מי השוליים התפעוליים השתפרו בין ${Y[0]} ל־${Y[last]}?`, `Whose operating margin improved between ${Y[0]} and ${Y[last]}?`),
        options: [{ key: 'a', label: A.name }, { key: 'b', label: B.name }, { key: 'both', label: L('של שתיהן', 'Both') }], correct: 'a',
        why: L(`${A.name.he}: מ־${pc(hA.op[0]!)} ל־${pc(hA.op[last]!)}. ${B.name.he}: מ־${pc(hB.op[0]!)} ל־${pc(hB.op[last]!)} — ירידה קלה.`, `${A.name.en}: from ${pc(hA.op[0]!)} to ${pc(hA.op[last]!)}. ${B.name.en}: from ${pc(hB.op[0]!)} to ${pc(hB.op[last]!)} — a slight fall.`) },
      { id: 'net', question: L(`אצל ${B.name.he} השוליים התפעוליים כמעט לא זזו, אבל הנקיים ירדו מ־${pc(hB.net[0]!)} ל־${pc(hB.net[last]!)}. איפה נעלם ההפרש?`, `At ${B.name.en} the operating margin barely moved, but the net margin fell from ${pc(hB.net[0]!)} to ${pc(hB.net[last]!)}. Where did the difference go?`),
        options: [{ key: 'below', label: L('מתחת לרווח התפעולי — ריבית ומסים', 'Below operating income — interest and taxes') }, { key: 'cogs', label: L('בעלות המכר', 'Into the cost of goods sold') }, { key: 'sales', label: L('המכירות ירדו', 'Sales fell') }], correct: 'below',
        why: L('מה שקורה בין הרווח התפעולי לנקי הוא מימון ומס. כשהתפעולי יציב והנקי יורד, השינוי שם — ואצל חברה עם חוב כבד, בעיקר הריבית.', 'What happens between operating and net income is financing and tax. When operating holds and net falls, the change is there — and at a heavily indebted company, mostly the interest.') },
      { id: 'meaning', question: L(`האם השוליים הגבוהים של ${A.name.he} הופכים את המניה שלה לקנייה טובה יותר?`, `Do ${A.name.en}'s higher margins make its stock the better buy?`),
        options: [{ key: 'no', label: L('לא — שוליים מתארים את העסק, לא אם המחיר הגיוני', 'No — margins describe the business, not whether the price makes sense') }, { key: 'yes', label: L('כן — שוליים גבוהים תמיד שווים קנייה', 'Yes — higher margins always mean buy') }, { key: 'gross', label: L('רק אם גם הגולמיים גבוהים', 'Only if gross margins are high too') }], correct: 'no',
        why: L('עסק טוב יותר ומניה זולה יותר הן שתי שאלות. כמה משלמים על העסק — זה נושא השיעור על מכפילים.', 'A better business and a cheaper stock are two questions. What you pay for the business is the subject of the lesson on multiples.') }
    ],
    right: L(`${A.name.he} גובה יותר (שוליים גולמיים גבוהים) ונהייתה יעילה יותר (שוליים תפעוליים עולים). ${B.name.he} יציבה בתפעול, אבל המימון שלה אוכל את השורה התחתונה.`, `${A.name.en} charges more (higher gross margin) and has become more efficient (rising operating margin). ${B.name.en} is steady in operations, but its financing eats into the bottom line.`),
    explain: [
      L(`מינוף תפעולי (Operating Leverage): בין ${Y[0]} ל־${Y[last]} ההכנסות של ${A.name.he} עלו ב־${pc(grow(A_HISTORY.rev[0]!, A_HISTORY.rev[last]!), 0)} — והרווח התפעולי ב־${pc(grow(A_HISTORY.op[0]!, A_HISTORY.op[last]!), 0)}. כשחלק גדול מההוצאות קבוע, כל שקל מכירות נוסף מוסיף לרווח יותר מקודמו.`,
        `Operating leverage: between ${Y[0]} and ${Y[last]}, ${A.name.en}'s revenue rose ${pc(grow(A_HISTORY.rev[0]!, A_HISTORY.rev[last]!), 0)} — and its operating income ${pc(grow(A_HISTORY.op[0]!, A_HISTORY.op[last]!), 0)}. When much of the cost is fixed, each extra unit of sales adds more to profit than the one before.`),
      L('ואותו מנוף עובד גם הפוך: כשהמכירות יורדות, ההוצאות הקבועות נשארות, והרווח נופל מהר יותר מההכנסות.', 'And the same lever works in reverse: when sales fall, the fixed costs stay, and profit falls faster than revenue.')
    ]
  },
  apply: q('p4-apply', 'P4', { type: 'table', title: L(`${B.name.he} · ${Y[0]} ← ${Y[last]}`, `${B.name.en} · ${Y[0]} → ${Y[last]}`), columns: [L('נתון', 'Figure'), L(String(Y[0]), String(Y[0])), L(String(Y[last]), String(Y[last]))], rows: [
    { label: L('הכנסות (מיליונים)', 'Revenue (millions)'), cells: [n0(B_HISTORY.rev[0]!), n0(B_HISTORY.rev[last]!)] },
    { label: L('שולי רווח תפעולי', 'Operating margin'), cells: [pc(hB.op[0]!), pc(hB.op[last]!)] },
    { label: L('רווח נקי (מיליונים)', 'Net income (millions)'), cells: [n0(B_HISTORY.net[0]!), n0(B_HISTORY.net[last]!)] }
  ] }, 'intermediate',
    L(`ההכנסות של ${B.name.he} עלו ב־${pc(grow(B_HISTORY.rev[0]!, B_HISTORY.rev[last]!), 0)}. העסק משתפר?`, `${B.name.en}'s revenue rose ${pc(grow(B_HISTORY.rev[0]!, B_HISTORY.rev[last]!), 0)}. Is the business improving?`),
    [
      ['a', L('כן — צמיחה בהכנסות היא תמיד שיפור', 'Yes — revenue growth is always an improvement')],
      ['b', L('היא מוכרת יותר, אבל משאירה פחות מכל שקל — והרווח הנקי ירד', 'It sells more, but keeps less of each unit — and net income fell')],
      ['c', L('אי אפשר לדעת בלי מחיר המניה', 'You cannot tell without the share price')],
      ['d', L('כן, כי השוליים התפעוליים עלו', 'Yes, because the operating margin rose')]
    ], 'b',
    L(`ההכנסות עלו מ־${n0(B_HISTORY.rev[0]!)} ל־${n0(B_HISTORY.rev[last]!)}, אבל השוליים התפעוליים ירדו מ־${pc(hB.op[0]!)} ל־${pc(hB.op[last]!)}, והרווח הנקי ירד מ־${n0(B_HISTORY.net[0]!)} ל־${n0(B_HISTORY.net[last]!)}. צמיחה לבדה היא לא שיפור.`,
      `Revenue rose from ${n0(B_HISTORY.rev[0]!)} to ${n0(B_HISTORY.rev[last]!)}, but the operating margin fell from ${pc(hB.op[0]!)} to ${pc(hB.op[last]!)}, and net income fell from ${n0(B_HISTORY.net[0]!)} to ${n0(B_HISTORY.net[last]!)}. Growth alone is not improvement.`)),
  takeaway: {
    bottomLine: L('שולי רווח הם כל רווח כאחוז מההכנסות: גולמי מספר על כוח תמחור, תפעולי על יעילות העסק, נקי על מה שנשאר אחרי מימון ומס. המגמה לאורך שנים מספרת יותר ממספר של שנה אחת.', 'Margins are each profit as a percentage of revenue: gross tells about pricing power, operating about the business\'s efficiency, net about what is left after financing and tax. The trend over years says more than one year\'s number.'),
    caveat: L('משווים שוליים רק בתוך אותו ענף, ומגמה של העבר לא מבטיחה את העתיד. ושוליים גבוהים מתארים עסק טוב — לא מניה זולה.', 'Compare margins only within an industry, and a past trend does not promise the future. And high margins describe a good business — not a cheap stock.')
  },
  questions: [
    q('p4-margin', 'P4', statementTable(L(`${D.name.he} · עד הרווח התפעולי`, `${D.name.en} · down to operating income`), [D], 'rev', 'op'), 'beginner',
      L(`מה שולי הרווח התפעולי של ${D.name.he}?`, `What is ${D.name.en}'s operating margin?`),
      nums([pc(mD.op), pc(mD.gross), pc(mD.net), pc((iD.op / iD.gross) * 100)]), 'a',
      L(`${ltr(`${n0(iD.op)} ÷ ${n0(iD.rev)} = ${pc(mD.op)}`)}. ${pc(mD.gross)} הם השוליים הגולמיים; ${pc((iD.op / iD.gross) * 100)} מחלק ברווח הגולמי במקום בהכנסות.`,
        `${n0(iD.op)} ÷ ${n0(iD.rev)} = ${pc(mD.op)}. ${pc(mD.gross)} is the gross margin; ${pc((iD.op / iD.gross) * 100)} divides by gross profit instead of revenue.`)),
    q('p4-trend', 'P4', threeMargins(hA, L(`${A.name.he} · ${Y[0]}–${Y[last]} · %`, `${A.name.en} · ${Y[0]}–${Y[last]} · %`)), 'intermediate',
      L(`בין אילו שתי שנים עלו השוליים התפעוליים של ${A.name.he} הכי הרבה?`, `Between which two years did ${A.name.en}'s operating margin rise the most?`),
      nums(Y.slice(1).map((y, i) => `${Y[i]}–${y}`)), 'abcd'[bestStep]!,
      L(`מ־${pc(hA.op[bestStep]!)} ל־${pc(hA.op[bestStep + 1]!)}: עלייה של ${n1(opSteps[bestStep]!)} נקודות. אחר כך העלייה האטה — ${n1(opSteps[last - 1]!)} נקודות בשנה האחרונה.`,
        `From ${pc(hA.op[bestStep]!)} to ${pc(hA.op[bestStep + 1]!)}: a rise of ${n1(opSteps[bestStep]!)} points. After that the rise slowed — ${n1(opSteps[last - 1]!)} points in the last year.`)),
    q('p4-gap', 'P4', { type: 'table', title: L('גולמי מול תפעולי', 'Gross against operating'), columns: [L('שוליים', 'Margin'), A.name, D.name], rows: [
      { label: L('גולמי', 'Gross'), cells: [pc(mA.gross), pc(mD.gross)] },
      { label: L('תפעולי', 'Operating'), cells: [pc(mA.op), pc(mD.op)] }
    ] }, 'intermediate',
      L(`ל־${D.name.he} נשאר הרבה יותר אחרי העלות הישירה, אבל הפער בין השוליים הגולמיים לתפעוליים שלה גדול יותר. מה זה אומר?`, `${D.name.en} keeps much more after direct costs, but the gap between its gross and operating margins is bigger. What does that say?`),
      [
        ['a', L('חלק גדול יותר מהמכירות שלה הולך להוצאות תפעול — שיווק ופיתוח', 'A larger share of its sales goes to operating costs — marketing and development')],
        ['b', L('היא מפסידה כסף', 'It is losing money')],
        ['c', L('העלות הישירה שלה גבוהה יותר', 'Its direct costs are higher')],
        ['d', L('המניה שלה יקרה', 'Its stock is expensive')]
      ], 'a',
      L(`${D.name.he}: ${ltr(`${n1(mD.gross)} − ${n1(mD.op)} = ${n1(mD.gross - mD.op)}`)} נקודות הולכות להוצאות תפעול; ${A.name.he}: ${n1(mA.gross - mA.op)}. חברה שצומחת מהר משקיעה הרבה בשיווק ופיתוח — תצפית על ההוצאות, לא שיפוט.`,
        `${D.name.en}: ${n1(mD.gross)} − ${n1(mD.op)} = ${n1(mD.gross - mD.op)} points go to operating costs; ${A.name.en}: ${n1(mA.gross - mA.op)}. A fast-growing company invests heavily in marketing and development — an observation about costs, not a judgement.`))
  ]
};

// ---------- P5 · returns on capital ----------
const rA = returns(A), rB = returns(B), rD = returns(D);
const bA = A.balance!, bB = B.balance!, bD = D.balance!;

export const P5: LessonContent = {
  id: 'P5',
  tutor: { topic: 'roic', label: L('תשואה על ההון', 'return on capital') },
  teach: [
    {
      heading: L('כמה מרוויח כל שקל של הבעלים', 'What each unit of the owners\' money earns'),
      paragraphs: [
        L(`שוליים שואלים כמה נשאר מכל שקל מכירות. תשואה על ההון שואלת שאלה אחרת: כמה רווח מייצר כל שקל שהושקע בעסק. התשואה על ההון העצמי (ROE) מחלקת את הרווח הנקי בהון העצמי — הכסף של בעלי המניות מהמאזן.`,
          'Margins ask how much is left of each unit of sales. Return on capital asks something else: how much profit each unit invested in the business produces. Return on equity (ROE) divides net income by equity — the shareholders\' money from the balance sheet.'),
        L(`אצל ${A.name.he}: ${ltr(`${n0(iA.net)} ÷ ${n0(bA.equity)} = ${pc(rA.roe)}`)}. כלומר, על כל 100 שקל של בעלי המניות, העסק הרוויח השנה כ־${Math.round(rA.roe)} שקלים.`,
          `At ${A.name.en}: ${n0(iA.net)} ÷ ${n0(bA.equity)} = ${pc(rA.roe)}. That is, for every 100 of the shareholders' money, the business earned about ${Math.round(rA.roe)} this year.`),
        L('מספר גבוה מרמז שהעסק יודע להפוך הון לרווח. אבל כמו כל יחס, הוא מושפע ממה שיש במכנה — ובשלב הבא תראו איך.', 'A high number hints that the business knows how to turn capital into profit. But like every ratio, it depends on what is in the denominator — and the next step shows how.')
      ],
      work: { kind: 'diagram', diagram: { type: 'table', title: L(`${A.name.he} · ${MILLIONS.he}`, `${A.name.en} · ${MILLIONS.en}`), columns: [L('נתון', 'Figure'), L('סכום', 'Amount')], rows: [
        { label: L('רווח נקי', 'Net income'), cells: [n0(iA.net)] },
        { label: L('הון עצמי', 'Equity'), cells: [n0(bA.equity)] },
        { label: L('תשואה על ההון העצמי', 'Return on equity'), cells: [pc(rA.roe)], kind: 'total' }
      ] } }
    },
    {
      heading: L('שלוש תשואות, שלוש שאלות', 'Three returns, three questions'),
      paragraphs: [
        L(`התשואה על הנכסים (ROA) מחלקת את הרווח הנקי בכל הנכסים — גם אלה שמומנו בחוב: ${ltr(`${n0(iA.net)} ÷ ${n0(totalAssets(bA))} = ${pc(rA.roa)}`)}. היא שואלת כמה העסק מפיק מכל מה שיש לו.`,
          `Return on assets (ROA) divides net income by all the assets — including those funded with debt: ${n0(iA.net)} ÷ ${n0(totalAssets(bA))} = ${pc(rA.roa)}. It asks how much the business gets out of everything it has.`),
        L(`התשואה על ההון המושקע (ROIC) היא הנקייה מכולן. במונה: הרווח התפעולי אחרי מס — הרווח של העסק, לפני שמחליטים איך לממן אותו (${n0(rA.nopat)}). במכנה: כל ההון שהושקע בעסק — הון עצמי ועוד חוב נטו (${ltr(`${n0(bA.equity)} + ${n0(netDebt(bA))} = ${n0(rA.invested)}`)}). אצל ${A.name.he}: ${pc(rA.roic)}.`,
          `Return on invested capital (ROIC) is the cleanest of the three. On top: operating income after tax — the business's profit before deciding how to finance it (${n0(rA.nopat)}). Underneath: all the capital invested in the business — equity plus net debt (${n0(bA.equity)} + ${n0(netDebt(bA))} = ${n0(rA.invested)}). At ${A.name.en}: ${pc(rA.roic)}.`),
        L('ROIC לא מושפע מהשאלה כמה מההון הגיע מבעלים וכמה מבנק — ולכן הוא הדרך הטובה ביותר להשוות בין שני עסקים שממומנים אחרת.', 'ROIC is not affected by how much of the capital came from owners and how much from a bank — which makes it the best way to compare two businesses financed differently.')
      ],
      work: { kind: 'diagram', diagram: { type: 'table', title: L(`${A.name.he} · שלוש תשואות`, `${A.name.en} · three returns`), columns: [L('תשואה', 'Return'), L('נוסחה', 'Formula'), L('ערך', 'Value')], rows: [
        { label: L('על ההון העצמי (ROE)', 'On equity (ROE)'), cells: [L('רווח נקי ÷ הון עצמי', 'Net income ÷ equity'), pc(rA.roe)] },
        { label: L('על הנכסים (ROA)', 'On assets (ROA)'), cells: [L('רווח נקי ÷ סך הנכסים', 'Net income ÷ total assets'), pc(rA.roa)] },
        { label: L('על ההון המושקע (ROIC)', 'On invested capital (ROIC)'), cells: [L('רווח תפעולי אחרי מס ÷ (הון עצמי + חוב נטו)', 'Operating income after tax ÷ (equity + net debt)'), pc(rA.roic)] }
      ] } }
    },
    {
      heading: L('כשחוב מנפח את ה־ROE', 'When debt inflates ROE'),
      paragraphs: [
        L(`ל־${B.name.he} יש ROE של ${pc(rB.roe)} — כמעט כפול מ־${A.name.he} (${pc(rA.roe)}). נראה שהיא עסק טוב פי שניים. אבל תסתכלו ממה בנוי ההון שלה: הון עצמי של ${n0(bB.equity)} בלבד, וחוב נטו של ${n0(netDebt(bB))}.`,
          `${B.name.en} has an ROE of ${pc(rB.roe)} — almost double ${A.name.en}'s (${pc(rA.roe)}). It looks like a business twice as good. But look at what its capital is made of: only ${n0(bB.equity)} of equity, and ${n0(netDebt(bB))} of net debt.`),
        L(`כשרוב העסק ממומן בחוב, ההון העצמי במכנה קטן — וה־ROE קופץ. ה־ROIC, שסופר את כל ההון, מספר סיפור אחר: ${pc(rB.roic)} ל־${B.name.he}, ${pc(rA.roic)} ל־${A.name.he}. כעסקים, הן מרוויחות על ההון שלהן כמעט אותו דבר.`,
          `When most of the business is funded with debt, the equity in the denominator is small — and ROE jumps. ROIC, which counts all the capital, tells another story: ${pc(rB.roic)} for ${B.name.en}, ${pc(rA.roic)} for ${A.name.en}. As businesses, they earn almost the same on their capital.`),
        L('וחוב לא רק מנפח את התשואה — הוא גם מגדיל את הסיכון. אם הרווח יורד, הריבית נשארת. זה הנושא של שיעור 7.', 'And debt does not only inflate the return — it also raises the risk. If profit falls, the interest stays. That is the subject of lesson 7.')
      ],
      callouts: [{ kind: 'caveat', lead: L('שימו לב', 'Watch out'), text: L('ROE גבוה יכול להגיע מעסק מצוין — או מהון עצמי קטן וחוב גדול. ROIC מבחין ביניהם.', 'A high ROE can come from an excellent business — or from thin equity and heavy debt. ROIC tells them apart.') }],
      work: { kind: 'diagram', diagram: { type: 'stacks', title: L(`ממה בנוי ההון · ${MILLIONS.he}`, `What the capital is made of · ${MILLIONS.en}`), columns: [A, B].map((c) => ({
        label: c.name, total: n0(returns(c).invested), parts: [
          { label: L('חוב נטו', 'Net debt'), value: netDebt(c.balance!), shown: n0(netDebt(c.balance!)), tone: 'risk' as const },
          { label: L('הון עצמי', 'Equity'), value: c.balance!.equity, shown: n0(c.balance!.equity), tone: 'ok' as const }
        ] })) } }
    }
  ],
  charts: [],
  activity: {
    kind: 'calculate',
    prompt: L('חשבו ROE', 'Work out the ROE'),
    task: L(`מה התשואה על ההון העצמי של ${D.name.he}? עגלו לספרה אחת אחרי הנקודה.`, `What is ${D.name.en}'s return on equity? Round to one decimal place.`),
    diagram: { type: 'table', title: L(`${D.name.he} · ${MILLIONS.he}`, `${D.name.en} · ${MILLIONS.en}`), columns: [L('נתון', 'Figure'), L('סכום', 'Amount')], rows: [
      { label: L('רווח תפעולי', 'Operating income'), cells: [n0(iD.op)] },
      { label: L('רווח נקי', 'Net income'), cells: [n0(iD.net)] },
      { label: L('סך הנכסים', 'Total assets'), cells: [n0(totalAssets(bD))] },
      { label: L('הון עצמי', 'Equity'), cells: [n0(bD.equity)] }
    ] },
    answer: +rD.roe.toFixed(1),
    tolerance: 0.3,
    field: L('ROE, באחוזים', 'ROE, %'),
    mistakes: [
      { value: rD.roa, tolerance: 0.3, why: L(`זה ה־ROA: חילקתם בכל הנכסים (${n0(totalAssets(bD))}). ROE מחלק בהון העצמי בלבד.`, `That is the ROA: you divided by all the assets (${n0(totalAssets(bD))}). ROE divides by equity only.`) },
      { value: (iD.op / bD.equity) * 100, tolerance: 0.3, why: L('לקחתם את הרווח התפעולי. ROE משתמש ברווח הנקי — מה שנשאר לבעלי המניות אחרי ריבית ומס.', 'You took operating income. ROE uses net income — what is left for shareholders after interest and tax.') },
      { value: (bD.equity / iD.net) * 100, tolerance: 1, why: L('זה יצא הפוך: חילקתם את ההון ברווח. ROE הוא רווח נקי חלקי הון עצמי.', 'That came out the wrong way round: you divided equity by profit. ROE is net income over equity.') }
    ],
    steps: [
      L(`רווח נקי: ${n0(iD.net)}; הון עצמי: ${n0(bD.equity)}`, `Net income: ${n0(iD.net)}; equity: ${n0(bD.equity)}`),
      L(`${ltr(`${n0(iD.net)} ÷ ${n0(bD.equity)} × 100 = ${pc(rD.roe)}`)}`, `${n0(iD.net)} ÷ ${n0(bD.equity)} × 100 = ${pc(rD.roe)}`)
    ],
    right: L(`ROE של ${pc(rD.roe)}: על כל 100 שקל של בעלי המניות, ${D.name.he} הרוויחה השנה כ־${Math.round(rD.roe)}.`, `An ROE of ${pc(rD.roe)}: for every 100 of the shareholders' money, ${D.name.en} earned about ${Math.round(rD.roe)} this year.`),
    off: L('עוד לא. ROE הוא הרווח הנקי חלקי ההון העצמי, כפול 100.', 'Not yet. ROE is net income divided by equity, times 100.'),
    explain: [
      L(`ועכשיו ה־ROIC של ${D.name.he}: ${pc(rD.roic)} — קרוב מאוד ל־ROE שלה. ל־${D.name.he} יש יותר מזומן מחוב (חוב נטו של ${n0(netDebt(bD))}), ולכן התשואה שלה באה מהעסק עצמו, לא מחוב.`,
        `And now ${D.name.en}'s ROIC: ${pc(rD.roic)} — very close to its ROE. ${D.name.en} holds more cash than debt (net debt of ${n0(netDebt(bD))}), so its return comes from the business itself, not from debt.`),
      L(`השוו ל־${B.name.he}: ROE של ${pc(rB.roe)} אבל ROIC של ${pc(rB.roic)} בלבד. כשה־ROE גבוה בהרבה מה־ROIC, חלק מהתשואה "מושאל". וגם תשואה גבוהה היא תיאור של העבר — לא מחיר מניה.`,
        `Compare ${B.name.en}: an ROE of ${pc(rB.roe)} but an ROIC of only ${pc(rB.roic)}. When ROE is far above ROIC, part of the return is "borrowed". And even a high return describes the past — not a share price.`)
    ]
  },
  apply: q('p5-apply', 'P5', { type: 'table', title: L('שתי תשואות, שתי חברות', 'Two returns, two companies'), columns: [L('נתון', 'Figure'), B.name, D.name], rows: [
    { label: L('תשואה על ההון העצמי (ROE)', 'Return on equity (ROE)'), cells: [pc(rB.roe), pc(rD.roe)] },
    { label: L('תשואה על ההון המושקע (ROIC)', 'Return on invested capital (ROIC)'), cells: [pc(rB.roic), pc(rD.roic)] },
    { label: L('חוב נטו (מיליונים)', 'Net debt (millions)'), cells: [n0(netDebt(bB)), n0(netDebt(bD))] }
  ] }, 'intermediate',
    L('לשתי החברות ROE גבוה. אצל מי הוא נשען על העסק עצמו?', 'Both companies have a high ROE. At which one does it rest on the business itself?'),
    [['a', D.name], ['b', B.name], ['c', L('אצל שתיהן באותה מידה', 'Both equally')], ['d', L('אי אפשר לדעת', 'You cannot tell')]], 'a',
    L(`אצל ${D.name.he} ה־ROIC (${pc(rD.roic)}) קרוב ל־ROE (${pc(rD.roe)}), ואין לה חוב נטו. אצל ${B.name.he} ה־ROE (${pc(rB.roe)}) כפול מה־ROIC (${pc(rB.roic)}) — ההפרש מגיע מחוב של ${n0(netDebt(bB))}.`,
      `At ${D.name.en} ROIC (${pc(rD.roic)}) is close to ROE (${pc(rD.roe)}), and it has no net debt. At ${B.name.en} ROE (${pc(rB.roe)}) is double the ROIC (${pc(rB.roic)}) — the difference comes from ${n0(netDebt(bB))} of debt.`)),
  takeaway: {
    bottomLine: L('ROE מודד רווח על הכסף של הבעלים, ROA על כל הנכסים, ו־ROIC על כל ההון שהושקע בעסק — בלי קשר לאיך הוא מומן. ROIC הוא הדרך הנקייה להשוות בין עסקים.', 'ROE measures profit on the owners\' money, ROA on all the assets, and ROIC on all the capital invested in the business — regardless of how it was financed. ROIC is the clean way to compare businesses.'),
    caveat: L('ROE גבוה יכול להיות תוצאה של חוב, לא של עסק טוב — ולכן בודקים אותו מול ROIC. ותשואה גבוהה מתארת עסק, לא מחיר.', 'A high ROE can be the result of debt, not of a good business — so check it against ROIC. And a high return describes a business, not a price.')
  },
  questions: [
    q('p5-roa', 'P5', { type: 'table', title: L(`${A.name.he} · ${MILLIONS.he}`, `${A.name.en} · ${MILLIONS.en}`), columns: [L('נתון', 'Figure'), L('סכום', 'Amount')], rows: [
      { label: L('רווח תפעולי', 'Operating income'), cells: [n0(iA.op)] },
      { label: L('רווח נקי', 'Net income'), cells: [n0(iA.net)] },
      { label: L('סך הנכסים', 'Total assets'), cells: [n0(totalAssets(bA))] },
      { label: L('הון עצמי', 'Equity'), cells: [n0(bA.equity)] }
    ] }, 'beginner',
      L(`מה התשואה על הנכסים (ROA) של ${A.name.he}?`, `What is ${A.name.en}'s return on assets (ROA)?`),
      nums([pc(rA.roa), pc(rA.roe), pc((iA.op / totalAssets(bA)) * 100), pc(mA.net)]), 'a',
      L(`${ltr(`${n0(iA.net)} ÷ ${n0(totalAssets(bA))} = ${pc(rA.roa)}`)}. ${pc(rA.roe)} הוא ה־ROE — מחולק בהון העצמי בלבד.`, `${n0(iA.net)} ÷ ${n0(totalAssets(bA))} = ${pc(rA.roa)}. ${pc(rA.roe)} is the ROE — divided by equity only.`)),
    q('p5-inflated', 'P5', { type: 'table', title: L('ROE וחוב', 'ROE and debt'), columns: [L('חברה', 'Company'), L('ROE', 'ROE'), L('חוב ÷ הון עצמי', 'Debt ÷ equity')], rows: [A, B, D].map((c) => ({ label: c.name, cells: [pc(returns(c).roe), n1(strength(c).de)] })) }, 'intermediate',
      L('אצל איזו חברה ה־ROE מנופח הכי הרבה על ידי חוב?', 'At which company is ROE most inflated by debt?'),
      [['a', A.name], ['b', B.name], ['c', D.name], ['d', L('אצל אף אחת', 'None of them')]], 'b',
      L(`ל־${B.name.he} חוב של פי ${n1(strength(B).de)} מההון העצמי — והון קטן במכנה מנפח את ה־ROE. ה־ROIC שלה, ${pc(rB.roic)}, מראה את העסק בלי הניפוח.`, `${B.name.en} has debt ${n1(strength(B).de)} times its equity — and thin equity in the denominator inflates ROE. Its ROIC, ${pc(rB.roic)}, shows the business without the inflation.`)),
    q('p5-invested', 'P5', { type: 'table', title: L(`${A.name.he} · ${MILLIONS.he}`, `${A.name.en} · ${MILLIONS.en}`), columns: [L('נתון', 'Figure'), L('סכום', 'Amount')], rows: [
      { label: L('הון עצמי', 'Equity'), cells: [n0(bA.equity)] },
      { label: L('חוב (קצר וארוך)', 'Debt (short and long)'), cells: [n0(totalDebt(bA))] },
      { label: L('מזומן', 'Cash'), cells: [n0(bA.cash)] }
    ] }, 'intermediate',
      L(`כמה הון מושקע יש ב־${A.name.he} (הון עצמי ועוד חוב נטו)?`, `How much invested capital does ${A.name.en} have (equity plus net debt)?`),
      nums([n0(rA.invested), n0(bA.equity + totalDebt(bA)), n0(bA.equity), n0(totalAssets(bA))]), 'a',
      L(`חוב נטו: ${ltr(`${n0(totalDebt(bA))} − ${n0(bA.cash)} = ${n0(netDebt(bA))}`)}; ועוד ההון העצמי: ${ltr(`${n0(bA.equity)} + ${n0(netDebt(bA))} = ${n0(rA.invested)}`)}. ${n0(bA.equity + totalDebt(bA))} שוכח להוריד את המזומן.`,
        `Net debt: ${n0(totalDebt(bA))} − ${n0(bA.cash)} = ${n0(netDebt(bA))}; plus equity: ${n0(bA.equity)} + ${n0(netDebt(bA))} = ${n0(rA.invested)}. ${n0(bA.equity + totalDebt(bA))} forgets to take off the cash.`))
  ]
};

// ---------- P6 · multiples ----------
const kA = market(A), kB = market(B), kC = market(C), kD = market(D);
const iC = income(C.statement);

export const P6: LessonContent = {
  id: 'P6',
  tutor: { topic: 'pe', label: L('מכפילים', 'valuation multiples') },
  teach: [
    {
      heading: L('כמה משלמים על מה', 'What you pay for what'),
      paragraphs: [
        L(`מכפיל (Multiple) מחלק את מה שמשלמים על חברה במשהו שהיא מייצרת — רווח, מכירות, הון. הוא לא אומר כמה החברה שווה; הוא אומר כמה השוק משלם היום על כל שקל של אותו דבר.`,
          'A multiple divides what you pay for a company by something it produces — profit, sales, equity. It does not say what the company is worth; it says how much the market pays today for each unit of that thing.'),
        L(`מה "משלמים"? שווי השוק (Market Cap) — מחיר המניה כפול מספר המניות: ל־${A.name.he} ${ltr(`${n2(A.price!)} × ${A.statement.shares} = ${n0(kA.mcap)}`)} מיליון. אבל מי שקונה את כל העסק מקבל גם את החוב שלו. שווי הפירמה (Enterprise Value) מוסיף את החוב נטו: ל־${A.name.he} ${n0(kA.ev!)}, ל־${B.name.he} ${ltr(`${n0(kB.mcap)} + ${n0(netDebt(B.balance!))} = ${n0(kB.ev!)}`)}.`,
          `What do you "pay"? Market cap — the share price times the number of shares: for ${A.name.en}, ${n2(A.price!)} × ${A.statement.shares} = ${n0(kA.mcap)} million. But whoever buys the whole business also gets its debt. Enterprise value adds the net debt: ${n0(kA.ev!)} for ${A.name.en}, ${n0(kB.mcap)} + ${n0(netDebt(B.balance!))} = ${n0(kB.ev!)} for ${B.name.en}.`),
        L(`שימו לב ל־${B.name.he}: שווי השוק שלה קטן, אבל החוב כמעט מכפיל את מה שעולה לקנות את העסק כולו.`, `Notice ${B.name.en}: its market cap is small, but the debt nearly doubles what it costs to buy the whole business.`)
      ],
      work: { kind: 'diagram', diagram: { type: 'stacks', title: L(`שווי הפירמה = שווי שוק + חוב נטו · ${MILLIONS.he}`, `Enterprise value = market cap + net debt · ${MILLIONS.en}`), columns: [A, B].map((c) => ({
        label: c.name, total: n0(market(c).ev!), parts: [
          { label: L('חוב נטו', 'Net debt'), value: netDebt(c.balance!), shown: n0(netDebt(c.balance!)), tone: 'risk' as const },
          { label: L('שווי שוק', 'Market cap'), value: market(c).mcap, shown: n0(market(c).mcap), tone: 'info' as const }
        ] })) } }
    },
    {
      heading: L('ארבעה מכפילים', 'Four multiples'),
      paragraphs: [
        L(`מכפיל הרווח (P/E) — שווי השוק חלקי הרווח הנקי: ${A.name.he} ${n1(kA.pe!)}, ${B.name.he} ${n1(kB.pe!)}. על כל שקל רווח של ${A.name.he} משלמים ${n1(kA.pe!)} שקלים. מכפיל המכירות (P/S) — שווי השוק חלקי ההכנסות: ${n2(kA.ps)} מול ${n2(kB.ps)}.`,
          `The price-to-earnings multiple (P/E) — market cap over net income: ${A.name.en} ${n1(kA.pe!)}, ${B.name.en} ${n1(kB.pe!)}. For each unit of ${A.name.en}'s profit, you pay ${n1(kA.pe!)}. The price-to-sales multiple (P/S) — market cap over revenue: ${n2(kA.ps)} against ${n2(kB.ps)}.`),
        L(`מכפיל ההון (P/B) — שווי השוק חלקי ההון העצמי מהמאזן: ${n2(kA.pb!)} מול ${n2(kB.pb!)}. ו־EV/EBITDA — שווי הפירמה חלקי הרווח התפעולי לפני פחת: ${n1(kA.evEbitda!)} מול ${n1(kB.evEbitda!)}. כי הוא משתמש בשווי הפירמה, הוא משווה הוגן יותר בין חברות עם חוב שונה.`,
          `The price-to-book multiple (P/B) — market cap over the balance sheet's equity: ${n2(kA.pb!)} against ${n2(kB.pb!)}. And EV/EBITDA — enterprise value over operating income before depreciation: ${n1(kA.evEbitda!)} against ${n1(kB.evEbitda!)}. Because it uses enterprise value, it compares companies with different debt more fairly.`),
        L(`לפי P/E, P/S ו־EV/EBITDA ${B.name.he} "זולה" יותר; לפי P/B דווקא ${A.name.he} — כי ההון העצמי של ${B.name.he} קטן, ורוב העסק שלה ממומן בחוב. המילה "זולה" במירכאות, כי מכפיל נמוך עונה על שאלה אחת — כמה משלמים — ולא על השאלה מה מקבלים.`, `By P/E, P/S and EV/EBITDA ${B.name.en} is "cheaper"; by P/B it is ${A.name.en} — because ${B.name.en}'s equity is thin, and most of its business is funded with debt. "Cheaper" is in quotes, because a low multiple answers one question — what you pay — and not what you get.`)
      ],
      work: { kind: 'diagram', diagram: { type: 'table', title: L('מכפילים', 'Multiples'), columns: [L('מכפיל', 'Multiple'), A.name, B.name], rows: [
        { label: L('מחיר מניה', 'Share price'), cells: [n2(A.price!), n2(B.price!)] },
        { label: L('רווח למניה', 'EPS'), cells: [n2(iA.eps), n2(iB.eps)] },
        { label: L('P/E', 'P/E'), cells: [n1(kA.pe!), n1(kB.pe!)] },
        { label: L('P/S', 'P/S'), cells: [n2(kA.ps), n2(kB.ps)] },
        { label: L('P/B', 'P/B'), cells: [n2(kA.pb!), n2(kB.pb!)] },
        { label: L('EV/EBITDA', 'EV/EBITDA'), cells: [n1(kA.evEbitda!), n1(kB.evEbitda!)] }
      ] } }
    },
    {
      heading: L('מה עושים כשאין רווח', 'What to do when there is no profit'),
      paragraphs: [
        L(`ל־${C.name.he} יש הפסד: ${n0(iC.net)} מיליון. מכפיל רווח לא עובד — מחלקים במספר שלילי. לכן משתמשים במכפיל מכירות: ${ltr(`${n0(kC.mcap)} ÷ ${n0(iC.rev)} = ${n2(kC.ps)}`)}.`,
          `${C.name.en} is losing money: ${n0(iC.net)} million. The P/E multiple does not work — you would divide by a negative number. So you use the sales multiple: ${n0(kC.mcap)} ÷ ${n0(iC.rev)} = ${n2(kC.ps)}.`),
        L(`משקיעים משלמים ${n2(kC.ps)} על כל שקל מכירות של ${C.name.he} — פי ${n1(kC.ps / kB.ps)} ממה שהם משלמים על המכירות של ${B.name.he}. הם לא משלמים על הרווח של היום, כי אין כזה; הם מהמרים על רווחים עתידיים.`,
          `Investors pay ${n2(kC.ps)} for each unit of ${C.name.en}'s sales — ${n1(kC.ps / kB.ps)} times what they pay for ${B.name.en}'s sales. They are not paying for today's profit, because there is none; they are betting on future profits.`),
        L('P/S מאפשר להשוות, אבל לא אומר אם ההימור הגיוני: מכירות שלא יהפכו לרווח אף פעם לא שוות הרבה, גם אם הן גדלות.', 'P/S makes comparison possible, but does not say whether the bet makes sense: sales that never turn into profit are not worth much, even if they grow.')
      ],
      callouts: [{ kind: 'caveat', lead: L('שימו לב', 'Watch out'), text: L('P/S נמוך לא אומר "זול" אם החברה לא תגיע לרווח לעולם. הוא רק מאפשר השוואה.', 'A low P/S does not mean "cheap" if the company never reaches a profit. It only makes comparison possible.') }],
      work: { kind: 'diagram', diagram: { type: 'table', title: L(`שלוש חברות · ${MILLIONS.he}`, `Three companies · ${MILLIONS.en}`), columns: [L('נתון', 'Figure'), A.name, B.name, C.name], rows: [
        { label: L('שווי שוק', 'Market cap'), cells: [n0(kA.mcap), n0(kB.mcap), n0(kC.mcap)] },
        { label: L('הכנסות', 'Revenue'), cells: [n0(iA.rev), n0(iB.rev), n0(iC.rev)] },
        { label: L('רווח נקי', 'Net income'), cells: [n0(iA.net), n0(iB.net), n0(iC.net)] },
        { label: L('P/E', 'P/E'), cells: [n1(kA.pe!), n1(kB.pe!), '—'] },
        { label: L('P/S', 'P/S'), cells: [n2(kA.ps), n2(kB.ps), n2(kC.ps)], mark: [2] }
      ] } }
    }
  ],
  charts: [],
  activity: {
    kind: 'checklist',
    prompt: L('הזולה ביחס לצמיחה', 'Cheapest for its growth'),
    task: L('איזו מניה הכי זולה ביחס לצמיחה שלה? לא לפי P/E לבד — לפי מה שמקבלים תמורתו. ענו לפי הסדר.', 'Which stock is cheapest relative to its growth? Not by P/E alone — by what you get for it. Answer in order.'),
    diagram: { type: 'table', title: L('השוואה', 'Comparison'), columns: [L('חברה', 'Company'), L('P/E', 'P/E'), L('צמיחה צפויה ברווח', 'Expected profit growth'), L('שולי רווח תפעולי', 'Operating margin'), L('חוב ÷ הון עצמי', 'Debt ÷ equity')], rows: [A, B, D].map((c) => ({ label: c.name, cells: [n1(market(c).pe!), pc(c.growth!, 0), pc(mg(income(c.statement)).op), n1(strength(c).de)] })) },
    items: [
      { id: 'pe', question: L('למי מכפיל הרווח הנמוך ביותר?', 'Who has the lowest P/E?'), options: [{ key: 'a', label: A.name }, { key: 'b', label: B.name }, { key: 'd', label: D.name }], correct: 'b',
        why: L(`${B.name.he}: ${n1(kB.pe!)}, לעומת ${n1(kA.pe!)} ו־${n1(kD.pe!)}. לפי P/E בלבד, היא הזולה.`, `${B.name.en}: ${n1(kB.pe!)}, against ${n1(kA.pe!)} and ${n1(kD.pe!)}. By P/E alone, it is the cheapest.`) },
      { id: 'bpeg', question: L(`המכפיל של ${B.name.he} חלקי הצמיחה שלה (PEG) שווה ל־`, `${B.name.en}'s P/E divided by its growth (PEG) equals`), options: [{ key: 'x', label: L(n1(kB.peg!), n1(kB.peg!)) }, { key: 'y', label: L(n1(1 / kB.peg!), n1(1 / kB.peg!)) }, { key: 'z', label: L(n1(kB.pe! * B.growth!), n1(kB.pe! * B.growth!)) }], correct: 'x',
        why: L(`${ltr(`${n1(kB.pe!)} ÷ ${B.growth} = ${n1(kB.peg!)}`)}. מכפיל של ${n1(kB.pe!)} על צמיחה של ${B.growth}% בלבד — הכי יקר מהשלוש ביחס לצמיחה.`, `${n1(kB.pe!)} ÷ ${B.growth} = ${n1(kB.peg!)}. A multiple of ${n1(kB.pe!)} on only ${B.growth}% growth — the most expensive of the three relative to growth.`) },
      { id: 'peg', question: L('ומי הזולה ביותר ביחס לצמיחה שלה?', 'And who is cheapest relative to its growth?'), options: [{ key: 'a', label: A.name }, { key: 'b', label: B.name }, { key: 'd', label: D.name }], correct: 'd',
        why: L(`${D.name.he}: ${ltr(`${n1(kD.pe!)} ÷ ${D.growth} = ${n1(kD.peg!)}`)}; ${A.name.he}: ${n1(kA.peg!)}; ${B.name.he}: ${n1(kB.peg!)}. היקרה לפי P/E היא הזולה ביחס לצמיחה.`, `${D.name.en}: ${n1(kD.pe!)} ÷ ${D.growth} = ${n1(kD.peg!)}; ${A.name.en}: ${n1(kA.peg!)}; ${B.name.en}: ${n1(kB.peg!)}. The most expensive by P/E is the cheapest relative to growth.`) },
      { id: 'signal', question: L(`האם ה־PEG הנמוך הופך את ${D.name.he} לקנייה?`, `Does the low PEG make ${D.name.en} a buy?`), options: [{ key: 'no', label: L('לא — הוא נשען על תחזית צמיחה שאולי לא תתממש; זו שאלה לבדוק', 'No — it rests on a growth forecast that may not come true; it is a question to investigate') }, { key: 'yes', label: L('כן — PEG נמוך הוא איתות קנייה', 'Yes — a low PEG is a buy signal') }, { key: 'pe', label: L('לא, כי ה־P/E שלה הכי גבוה', 'No, because its P/E is the highest') }], correct: 'no',
        why: L(`הצמיחה של ${D.growth}% היא הערכה. אם היא לא תתממש, ה־P/E של ${n1(kD.pe!)} כבר לא נראה זול. מכפיל הוא נקודת פתיחה לשאלות, לא תשובה.`, `The ${D.growth}% growth is an estimate. If it does not happen, a P/E of ${n1(kD.pe!)} no longer looks cheap. A multiple is a starting point for questions, not an answer.`) }
    ],
    right: L(`${B.name.he} הכי זולה לפי P/E ו־${D.name.he} הכי זולה ביחס לצמיחה. מכפיל נמוך זה לא "זול" — צריך לקרוא אותו מול מה שמקבלים.`, `${B.name.en} is cheapest by P/E and ${D.name.en} cheapest for its growth. A low multiple is not "cheap" — it has to be read against what you get.`),
    explain: [
      L(`מכפיל מול צמיחה: ה־PEG מחלק את ה־P/E בקצב הצמיחה הצפוי. ${D.name.he} יקרה לפי P/E (${n1(kD.pe!)}), אבל הרווח שלה צפוי לגדול פי ${n1(D.growth! / A.growth!)} מהר יותר מזה של ${A.name.he}. ביחס לצמיחה, היא הזולה מהשלוש.`,
        `Price against growth: PEG divides the P/E by the expected growth rate. ${D.name.en} is expensive by P/E (${n1(kD.pe!)}), but its profit is expected to grow ${n1(D.growth! / A.growth!)} times faster than ${A.name.en}'s. Relative to growth, it is the cheapest of the three.`),
      L('וכל התשובות האלה תלויות במספר אחד שאף אחד לא יודע בוודאות — הצמיחה העתידית. זה מה שהמודל בשיעור 9 יכריח אתכם לכתוב במפורש.', 'And all these answers depend on one number nobody knows for sure — future growth. That is what the model in lesson 9 will make you write down explicitly.')
    ]
  },
  apply: q('p6-apply', 'P6', { type: 'table', title: L(`${B.name.he} · מאחורי המכפיל`, `${B.name.en} · behind the multiple`), columns: [L('נתון', 'Figure'), L('ערך', 'Value')], rows: [
    { label: L('P/E', 'P/E'), cells: [n1(kB.pe!)] },
    { label: L('EV/EBITDA', 'EV/EBITDA'), cells: [n1(kB.evEbitda!)] },
    { label: L(`רווח נקי, ${B_HISTORY.years[0]} ← ${B_HISTORY.years[B_HISTORY.years.length - 1]} (מיליונים)`, `Net income, ${B_HISTORY.years[0]} → ${B_HISTORY.years[B_HISTORY.years.length - 1]} (millions)`), cells: [`${n0(B_HISTORY.net[0]!)} → ${n0(B_HISTORY.net[B_HISTORY.net.length - 1]!)}`] },
    { label: L('חוב ÷ הון עצמי', 'Debt ÷ equity'), cells: [n1(strength(B).de)] }
  ] }, 'intermediate',
    L(`${B.name.he} היא הזולה מבין החברות לפי P/E ולפי EV/EBITDA. מה המלכודת?`, `${B.name.en} is the cheapest of the companies by P/E and by EV/EBITDA. What is the catch?`),
    [
      ['a', L('הרווח שלה מתכווץ והחוב כבד — "זול" יכול להיות זול מסיבה', 'Its profit is shrinking and its debt is heavy — "cheap" can be cheap for a reason')],
      ['b', L('אין מלכודת — מכפיל נמוך הוא תמיד הזדמנות', 'There is no catch — a low multiple is always an opportunity')],
      ['c', L('P/E לא עובד כשיש רווח', 'P/E does not work when there is profit')],
      ['d', L('EV/EBITDA גבוה מדי', 'Its EV/EBITDA is too high')]
    ], 'a',
    L(`הרווח הנקי ירד מ־${n0(B_HISTORY.net[0]!)} ל־${n0(B_HISTORY.net[B_HISTORY.net.length - 1]!)}, והחוב הוא פי ${n1(strength(B).de)} מההון. מכפיל נמוך על רווח שהולך וקטן יכול להפסיק להיות נמוך מהר מאוד. למלכודת הזו קוראים מלכודת ערך (Value Trap).`,
      `Net income fell from ${n0(B_HISTORY.net[0]!)} to ${n0(B_HISTORY.net[B_HISTORY.net.length - 1]!)}, and debt is ${n1(strength(B).de)} times equity. A low multiple on a shrinking profit can stop being low very fast. That trap is called a value trap.`)),
  takeaway: {
    bottomLine: L('מכפיל הוא מחיר חלקי משהו שהעסק מייצר: P/E על רווח, P/S על מכירות, P/B על הון, EV/EBITDA על הרווח התפעולי כולל החוב. PEG מוסיף את הצמיחה.', 'A multiple is a price divided by something the business produces: P/E on profit, P/S on sales, P/B on equity, EV/EBITDA on operating profit including the debt. PEG adds growth.'),
    caveat: L('מכפיל נמוך אומר כמה משלמים, לא מה מקבלים — הוא יכול להיות נמוך כי הרווח מתכווץ. משווים מכפילים בתוך אותו ענף, ואף מכפיל אינו איתות קנייה.', 'A low multiple says what you pay, not what you get — it can be low because the profit is shrinking. Compare multiples within an industry, and no multiple is a buy signal.')
  },
  questions: [
    q('p6-pe', 'P6', { type: 'table', title: L(`${D.name.he} · ${MILLIONS.he}`, `${D.name.en} · ${MILLIONS.en}`), columns: [L('נתון', 'Figure'), L('סכום', 'Amount')], rows: [
      { label: L('שווי שוק', 'Market cap'), cells: [n0(kD.mcap)] },
      { label: L('הכנסות', 'Revenue'), cells: [n0(iD.rev)] },
      { label: L('רווח נקי', 'Net income'), cells: [n0(iD.net)] },
      { label: L('הון עצמי', 'Equity'), cells: [n0(D.balance!.equity)] }
    ] }, 'beginner',
      L(`מה מכפיל הרווח (P/E) של ${D.name.he}?`, `What is ${D.name.en}'s P/E?`),
      nums([n1(kD.pe!), n1(kD.ps), n1(kD.pb!), n1(kD.pe! / 10)]), 'a',
      L(`${ltr(`${n0(kD.mcap)} ÷ ${n0(iD.net)} = ${n1(kD.pe!)}`)}. ${n1(kD.ps)} הוא ה־P/S (חלקי ההכנסות) ו־${n1(kD.pb!)} ה־P/B (חלקי ההון).`, `${n0(kD.mcap)} ÷ ${n0(iD.net)} = ${n1(kD.pe!)}. ${n1(kD.ps)} is the P/S (over revenue) and ${n1(kD.pb!)} the P/B (over equity).`)),
    q('p6-ev', 'P6', { type: 'table', title: L(`שווי שוק וחוב · ${MILLIONS.he}`, `Market cap and debt · ${MILLIONS.en}`), columns: [L('נתון', 'Figure'), A.name, B.name], rows: [
      { label: L('שווי שוק', 'Market cap'), cells: [n0(kA.mcap), n0(kB.mcap)] },
      { label: L('חוב נטו', 'Net debt'), cells: [n0(netDebt(A.balance!)), n0(netDebt(B.balance!))] }
    ] }, 'intermediate',
      L('אצל מי שווי הפירמה גדול בהרבה משווי השוק — ולמה?', 'At which company is enterprise value much larger than market cap — and why?'),
      [['a', L(`${B.name.he} — בגלל החוב שלה`, `${B.name.en} — because of its debt`)], ['b', L(`${A.name.he} — בגלל שווי השוק שלה`, `${A.name.en} — because of its market cap`)], ['c', L('אצל שתיהן באותה מידה', 'Both equally')], ['d', L('שווי פירמה תמיד שווה לשווי שוק', 'Enterprise value always equals market cap')]], 'a',
      L(`${B.name.he}: ${ltr(`${n0(kB.mcap)} + ${n0(netDebt(B.balance!))} = ${n0(kB.ev!)}`)} — כמעט פי ${n1(kB.ev! / kB.mcap)}. ${A.name.he}: ${n0(kA.ev!)}, כמעט כמו שווי השוק. מי שקונה עסק, קונה גם את החוב שלו.`, `${B.name.en}: ${n0(kB.mcap)} + ${n0(netDebt(B.balance!))} = ${n0(kB.ev!)} — almost ${n1(kB.ev! / kB.mcap)} times. ${A.name.en}: ${n0(kA.ev!)}, almost the same as its market cap. Whoever buys a business also buys its debt.`)),
    q('p6-loss', 'P6', { type: 'table', title: L(`${C.name.he} · ${MILLIONS.he}`, `${C.name.en} · ${MILLIONS.en}`), columns: [L('נתון', 'Figure'), L('סכום', 'Amount')], rows: [
      { label: L('שווי שוק', 'Market cap'), cells: [n0(kC.mcap)] },
      { label: L('הכנסות', 'Revenue'), cells: [n0(iC.rev)] },
      { label: L('רווח נקי', 'Net income'), cells: [n0(iC.net)] }
    ] }, 'beginner',
      L(`${C.name.he} מפסידה. באיזה מכפיל אפשר להשוות אותה לאחרות?`, `${C.name.en} is losing money. Which multiple can compare it with the others?`),
      [['a', L(`P/S של ${n1(kC.ps)}`, `A P/S of ${n1(kC.ps)}`)], ['b', L(`P/E של ${n1(kC.mcap / iC.net)}`, `A P/E of ${n1(kC.mcap / iC.net)}`)], ['c', L(`P/E של ${n1(-kC.mcap / iC.net)}`, `A P/E of ${n1(-kC.mcap / iC.net)}`)], ['d', L('אף מכפיל', 'No multiple at all')]], 'a',
      L(`${ltr(`${n0(kC.mcap)} ÷ ${n0(iC.rev)} = ${n1(kC.ps)}`)}. מכפיל רווח על הפסד יוצא שלילי ולא אומר דבר. P/S מאפשר השוואה — לא אומר אם ההימור על רווחים עתידיים מוצדק.`, `${n0(kC.mcap)} ÷ ${n0(iC.rev)} = ${n1(kC.ps)}. A P/E on a loss comes out negative and says nothing. P/S makes comparison possible — it does not say whether the bet on future profits is justified.`))
  ]
};

export const FUNDAMENTALS_2 = [P4, P5, P6];
