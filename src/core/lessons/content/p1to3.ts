// ---------------------------------------------------------------------------
// Fundamentals, module 1 — reading statements: P1 (why look at the business),
// P2 (the income statement), P3 (balance sheet and cash flow).
//
// Sources: the approved curriculum and the Artifact's page 09 (boards 09.1
// income-statement explorer, 09.4 balance sheet, 09.5 profit is not cash).
// Builds on F1 (what a share is) without re-teaching it. Margins as a topic are
// P4's, returns P5's, multiples P6's, debt P7's: they are named here at most.
// Every number is computed from @core/fundamentals/companies.
// ---------------------------------------------------------------------------
import type { Localized } from '@core/types/kb';
import type { Diagram, LessonContent } from './types';
import { A, B, D, A_HISTORY, B_HISTORY, E_CASH, income, totalAssets, totalDebt, netDebt, currentRatio, operatingCash, freeCash } from '@core/fundamentals/companies';
import type { CashFlow, Company } from '@core/fundamentals/companies';
import { L, ltr, n0, n2, pc, cur, MILLIONS, q, nums, LINES, shown, statementTable } from './fundamentalsKit';

// ---------- P1 · why look at the business itself ----------
const H = A_HISTORY, hEps = H.net.map((x) => x / A.statement.shares), hPrice = H.price!;
const idx = (xs: number[]) => xs.map((x) => (x / xs[0]!) * 100);
const epsIdx = idx(hEps), priceIdx = idx(hPrice);
const last = H.years.length - 1;
const growthPct = (a: number, b: number) => ((b / a) - 1) * 100;
const yearsTable = (title: Localized): Diagram => ({
  type: 'table', title,
  columns: [L('שנה', 'Year'), L('רווח למניה', 'EPS'), L('מחיר המניה', 'Share price')],
  rows: H.years.map((y, i) => ({ label: L(String(y), String(y)), cells: [n2(hEps[i]!), n2(hPrice[i]!)] }))
});
const priceDownEpsUp = H.years.findIndex((_, i) => i > 0 && hPrice[i]! < hPrice[i - 1]! && hEps[i]! > hEps[i - 1]!);

export const P1: LessonContent = {
  id: 'P1',
  tutor: { topic: 'fundamental', label: L('ניתוח פונדמנטלי', 'fundamental analysis') },
  teach: [
    {
      heading: L('מאחורי כל מניה יש עסק', 'Behind every share is a business'),
      paragraphs: [
        L('מניה היא חלק קטן מהבעלות על חברה — ראיתם את זה בתחילת הדרך. מחיר המניה הוא כמה אנשים מוכנים לשלם על החלק הזה היום. ניתוח פונדמנטלי (Fundamental Analysis) שואל שאלה אחרת: כמה העסק עצמו מרוויח, וכמה הוא שווה?',
          'A share is a small slice of owning a company — you saw that at the start. Its price is what people are willing to pay for that slice today. Fundamental analysis asks a different question: how much does the business itself earn, and what is it worth?'),
        L('הדרך מהעסק למחיר עוברת בכמה תחנות: החברה מוכרת, משלמת את ההוצאות שלה, ומה שנשאר הוא רווח. מהרווחים — של היום ושל השנים הבאות — נגזר כמה העסק שווה. והמחיר? הוא מושפע משווי העסק, אבל גם ממצב הרוח של השוק, מחדשות ומפחד.',
          'The path from the business to the price has a few stops: the company sells, pays its costs, and what is left is profit. From its profits — today\'s and the years ahead — comes what the business is worth. And the price? It is driven by that worth, but also by the market\'s mood, by news and by fear.'),
        L('בגרפים של המסלול הטכני קראתם את התנהגות המחיר. כאן קוראים את העסק שמתחת. שתי הקריאות שונות, ואף אחת מהן לא נותנת לבדה תשובה.',
          'In the Technical Analysis track you read how the price behaves. Here you read the business underneath. The two readings are different, and neither gives an answer on its own.')
      ],
      callouts: [{ kind: 'example', lead: L('מה מודדים כאן', 'What is measured here'), text: L('מכירות, הוצאות, רווח, חוב ומזומן — מספרים מהדוחות של החברה, לא מהגרף.', 'Sales, costs, profit, debt and cash — numbers from the company\'s reports, not from the chart.') }],
      work: { kind: 'diagram', diagram: {
        type: 'flow', title: L('מהעסק למחיר', 'From the business to the price'),
        stages: [
          { label: L('מכירות', 'Sales'), sub: L('מה שהחברה מוכרת', 'What the company sells') },
          { label: L('רווח', 'Profit'), sub: L('מה שנשאר אחרי ההוצאות', 'What is left after costs') },
          { label: L('שווי העסק', 'What it is worth'), sub: L('מה הרווחים העתידיים שווים היום', 'What future profits are worth today') },
          { label: L('מחיר המניה', 'Share price'), sub: L('שווי — ועוד מצב הרוח של השוק', 'Worth — plus the market\'s mood') }
        ]
      } }
    },
    {
      heading: L('לאורך זמן, המחיר הולך אחרי הרווח', 'Over time, price follows profit'),
      paragraphs: [
        L(`${A.name.he} היא חברה בדויה שתלווה את המסלול. בין ${H.years[0]} ל־${H.years[last]} הרווח שלה למניה עלה מ־${n2(hEps[0]!)} ל־${n2(hEps[last]!)} — פי ${(hEps[last]! / hEps[0]!).toFixed(1)}. מחיר המניה עלה באותן שנים מ־${n2(hPrice[0]!)} ל־${n2(hPrice[last]!)} — פי ${(hPrice[last]! / hPrice[0]!).toFixed(1)}. על פני חמש שנים, שניהם הלכו לאותו כיוון.`,
          `${A.name.en} is a fictional company that will stay with you through this track. From ${H.years[0]} to ${H.years[last]} its earnings per share rose from ${n2(hEps[0]!)} to ${n2(hEps[last]!)} — ${(hEps[last]! / hEps[0]!).toFixed(1)} times. Its share price rose over the same years from ${n2(hPrice[0]!)} to ${n2(hPrice[last]!)} — ${(hPrice[last]! / hPrice[0]!).toFixed(1)} times. Over five years, both moved the same way.`),
        L(`אבל לא בכל שנה. ב־${H.years[priceDownEpsUp]} הרווח למניה עלה מ־${n2(hEps[priceDownEpsUp - 1]!)} ל־${n2(hEps[priceDownEpsUp]!)}, והמחיר דווקא ירד מ־${n2(hPrice[priceDownEpsUp - 1]!)} ל־${n2(hPrice[priceDownEpsUp]!)}. העסק השתפר; השוק, באותה שנה, לא רצה לשלם עליו.`,
          `But not every year. In ${H.years[priceDownEpsUp]} earnings per share rose from ${n2(hEps[priceDownEpsUp - 1]!)} to ${n2(hEps[priceDownEpsUp]!)}, while the price fell from ${n2(hPrice[priceDownEpsUp - 1]!)} to ${n2(hPrice[priceDownEpsUp]!)}. The business improved; the market, that year, did not want to pay for it.`),
        L('זו התצפית שעליה נשען המסלול הזה: בטווח קצר המחיר זז מסיבות רבות; בטווח ארוך הוא נוטה לחזור לרווחים. נוטה — לא חייב. וכמה משלמים על כל שקל רווח היא שאלה בפני עצמה, שתגיע בשיעור על מכפילים.',
          'That is the observation this track rests on: in the short run the price moves for many reasons; in the long run it tends to come back to earnings. Tends — not must. And how much people pay for each unit of profit is a question of its own, which comes in the lesson on multiples.')
      ],
      work: { kind: 'diagram', diagram: {
        type: 'grouped', title: L(`${A.name.he} · ${H.years[0]} = 100`, `${A.name.en} · ${H.years[0]} = 100`), groups: H.years.map(String),
        series: [
          { label: L('רווח למניה', 'Earnings per share'), tone: 'adv', values: epsIdx, shown: epsIdx.map((x) => x.toFixed(0)) },
          { label: L('מחיר המניה', 'Share price'), tone: 'info', values: priceIdx, shown: priceIdx.map((x) => x.toFixed(0)) }
        ],
        caption: L('שני המספרים מחולקים בערך שלהם בשנה הראשונה, כדי שיהיה אפשר להשוות ביניהם.', 'Both numbers are divided by their first-year value, so they can be compared.')
      } }
    },
    {
      heading: L('מה שומר על הרווחים: חפיר', 'What protects profits: a moat'),
      paragraphs: [
        L('רווח גבוה מושך מתחרים. חפיר (Moat) הוא מה שמקשה עליהם לקחת אותו: מותג שאנשים מוכנים לשלם עליו יותר, לקוחות שקשה להם לעבור, רשת שכל משתמש חדש מחזק, או עלויות נמוכות מכולם.',
          'High profits attract competitors. A moat is what makes it hard for them to take those profits: a brand people will pay more for, customers who find it hard to switch, a network that every new user strengthens, or costs lower than anyone else\'s.'),
        L(`איך רואים חפיר במספרים? לא בהכרזה של החברה, אלא בתוצאות לאורך זמן: רווחיות שנשארת גבוהה גם כשיש תחרות, לקוחות שחוזרים. אצל ${A.name.he}, מכל שקל מכירות נשאר אחרי העלות הישירה ${pc((H.gross[0]! / H.rev[0]!) * 100)} ב־${H.years[0]} ו־${pc((H.gross[last]! / H.rev[last]!) * 100)} ב־${H.years[last]} — סימן שהיא מצליחה לגבות יותר על מה שהיא מוכרת. את השוליים האלה תכירו לעומק בשיעור 4.`,
          `How does a moat show in the numbers? Not in what the company says, but in results over time: profitability that stays high despite competition, customers who come back. At ${A.name.en}, out of every unit of sales, ${pc((H.gross[0]! / H.rev[0]!) * 100)} was left after direct costs in ${H.years[0]} and ${pc((H.gross[last]! / H.rev[last]!) * 100)} in ${H.years[last]} — a sign it manages to charge more for what it sells. You will study these margins in lesson 4.`),
        L(`ועוד הבחנה אחת שתחזור: חברות צמיחה (Growth) הן חברות שהרווחים שלהן צפויים לגדול מהר — ${D.name.he}, למשל, בכ־${D.growth}% בשנה. חברות ערך (Value) הן חברות שנסחרות בזול ביחס למה שהן מרוויחות היום. אף אחת מהקבוצות לא "טובה יותר"; הן שואלות שאלות שונות.`,
          `And one more distinction that will come back: growth companies are those whose profits are expected to grow fast — ${D.name.en}, for example, by about ${D.growth}% a year. Value companies are those that trade cheaply relative to what they earn today. Neither group is "better"; they raise different questions.`)
      ],
      notesTitle: L('שאלה למחשבה', 'Something to think about'),
      notes: [{ tone: 'neutral', label: L('אם העסק מצוין, המניה בהכרח טובה?', 'If the business is excellent, is the stock necessarily good?'),
        explanation: L('לא. עסק מצוין יכול להיות מתומחר ביוקר רב — ואז מי שקונה משלם מראש על שנים של הצלחה. עסק טוב ומחיר טוב הן שתי שאלות נפרדות, והמסלול עונה עליהן אחת אחרי השנייה.', 'No. An excellent business can be priced very high — and then a buyer pays in advance for years of success. A good business and a good price are two separate questions, and this track answers them one after the other.') }],
      work: { kind: 'diagram', diagram: {
        type: 'table', title: L('ארבעה סוגי חפיר', 'Four kinds of moat'),
        columns: [L('חפיר', 'Moat'), L('מה הוא עושה', 'What it does'), L('איפה רואים אותו', 'Where it shows')],
        rows: [
          { label: L('מותג', 'Brand'), cells: [L('לקוחות משלמים יותר על אותו מוצר', 'Customers pay more for the same product'), L('רווחיות גבוהה ויציבה', 'High, steady profitability')] },
          { label: L('עלות מעבר', 'Switching cost'), cells: [L('קשה ויקר לעבור למתחרה', 'Moving to a rival is hard and costly'), L('לקוחות שנשארים שנים', 'Customers who stay for years')] },
          { label: L('אפקט רשת', 'Network effect'), cells: [L('כל משתמש חדש מחזק את המוצר', 'Every new user makes it better'), L('צמיחה שמאיצה', 'Growth that speeds up')] },
          { label: L('יתרון עלות', 'Cost advantage'), cells: [L('מייצר בזול מכולם', 'Produces cheaper than anyone'), L('מחירים נמוכים ועדיין רווח', 'Low prices, still a profit')] }
        ]
      } }
    }
  ],
  charts: [],
  activity: {
    kind: 'sort',
    prompt: L('מיינו 8 עובדות: על העסק, או על המחיר?', 'Sort 8 facts: about the business, or about the price?'),
    bins: [
      { id: 'biz', label: L('על העסק', 'About the business'), tone: 'var(--adv)' },
      { id: 'price', label: L('על מחיר המניה', 'About the share price'), tone: 'var(--info)' }
    ],
    items: [
      { id: 'rev', label: L('המכירות עלו ב־8% השנה', 'Sales rose 8% this year'), bin: 'biz', why: L('מכירות הן מה שהעסק עושה — לא מה שהשוק משלם עליו.', 'Sales are what the business does — not what the market pays for it.') },
      { id: 'renew', label: L('95% מהלקוחות חידשו חוזה', '95% of customers renewed their contracts'), bin: 'biz', why: L('לקוחות שנשארים הם עדות לחפיר — מידע על העסק.', 'Customers who stay are evidence of a moat — information about the business.') },
      { id: 'cost', label: L('עלות הייצור של כל יחידה ירדה', 'The cost of making each unit fell'), bin: 'biz', why: L('עלויות הן חלק מהרווחיות של העסק.', 'Costs are part of the business\'s profitability.') },
      { id: 'op', label: L('הרווח התפעולי עלה חמש שנים ברציפות', 'Operating profit rose five years in a row'), bin: 'biz', why: L('רווח לאורך זמן — הלב של הניתוח הפונדמנטלי.', 'Profit over time — the heart of fundamental analysis.') },
      { id: 'up', label: L('המניה עלתה היום ב־4%', 'The share rose 4% today'), bin: 'price', why: L('תנועה של יום אחד אומרת מה השוק עשה, לא מה העסק עשה.', 'One day\'s move says what the market did, not what the business did.') },
      { id: 'high', label: L('המניה בשיא של שנה', 'The stock is at a one-year high'), bin: 'price', why: L('שיא מחיר הוא עובדה על המניה, לא על הרווחים.', 'A price high is a fact about the stock, not about the profits.') },
      { id: 'buzz', label: L('מדברים על המניה הרבה ברשתות', 'The stock is talked about a lot online'), bin: 'price', why: L('עניין ציבורי מזיז מחיר — הוא לא משנה את העסק.', 'Public attention moves prices — it does not change the business.') },
      { id: 'vol', label: L('מחזור המסחר הוכפל השבוע', 'Trading volume doubled this week'), bin: 'price', why: L('נפח מסחר מתאר את השוק במניה — נושא מהמסלול הטכני.', 'Volume describes the market in the stock — a Technical Analysis topic.') }
    ],
    right: L('ארבע עובדות על העסק (מכירות, לקוחות, עלויות, רווח) וארבע על המניה (מחיר, שיא, עניין, נפח). ניתוח פונדמנטלי עובד עם הקבוצה הראשונה.', 'Four facts about the business (sales, customers, costs, profit) and four about the stock (price, high, attention, volume). Fundamental analysis works with the first group.'),
    explain: [
      L('ההבחנה הזו תחזור בכל שיעור: קודם מבינים מה העסק עושה ומרוויח; רק אחר כך שואלים אם המחיר הגיוני ביחס לזה. עובדה על המחיר היא לא פסולה — היא פשוט עונה על שאלה אחרת.',
        'This distinction comes back in every lesson: first you understand what the business does and earns; only then do you ask whether the price makes sense for that. A fact about the price is not wrong — it simply answers a different question.')
    ]
  },
  apply: q('p1-apply', 'P1', {
    type: 'table', title: L(`${A.name.he} · ${H.years[0]}–${H.years[last]}`, `${A.name.en} · ${H.years[0]}–${H.years[last]}`),
    columns: [L('מה נמדד', 'What was measured'), L(String(H.years[0]), String(H.years[0])), L(String(H.years[last]), String(H.years[last]))],
    rows: [
      { label: L('נשאר מכל שקל מכירות אחרי העלות הישירה', 'Left from each unit of sales after direct costs'), cells: [pc((H.gross[0]! / H.rev[0]!) * 100), pc((H.gross[last]! / H.rev[last]!) * 100)] },
      { label: L('מכירות (מיליונים)', 'Sales (millions)'), cells: [n0(H.rev[0]!), n0(H.rev[last]!)] },
      { label: L('מחיר המניה', 'Share price'), cells: [n2(hPrice[0]!), n2(hPrice[last]!)] }
    ]
  }, 'intermediate',
    L(`איזו עובדה בטבלה היא הרמז הטוב ביותר לחפיר של ${A.name.he}?`, `Which fact in the table is the best hint of a moat at ${A.name.en}?`),
    [
      ['a', L('החלק שנשאר מכל שקל מכירות עלה, גם כשהמכירות גדלו', 'The share left from each unit of sales rose, even as sales grew')],
      ['b', L('מחיר המניה כמעט הוכפל', 'The share price nearly doubled')],
      ['c', L('המכירות גדלו', 'Sales grew')],
      ['d', L('אף אחת — חפיר רואים רק בגרף', 'None — a moat only shows on the chart')]
    ], 'a',
    L(`מכירות יכולות לגדול גם בלי חפיר, ומחיר יכול לעלות מסיבות רבות. אבל להשאיר ${pc((H.gross[last]! / H.rev[last]!) * 100)} מכל שקל במקום ${pc((H.gross[0]! / H.rev[0]!) * 100)}, בזמן שהמכירות גדלו ב־${pc(growthPct(H.rev[0]!, H.rev[last]!), 0)} — זה אומר שהחברה מצליחה לגבות על מה שהיא מוכרת. זה רמז, לא הוכחה.`,
      `Sales can grow without a moat, and a price can rise for many reasons. But keeping ${pc((H.gross[last]! / H.rev[last]!) * 100)} of each unit instead of ${pc((H.gross[0]! / H.rev[0]!) * 100)}, while sales grew by ${pc(growthPct(H.rev[0]!, H.rev[last]!), 0)}, says the company manages to charge for what it sells. It is a hint, not proof.`)),
  takeaway: {
    bottomLine: L('מניה היא חלק בעסק. ניתוח פונדמנטלי קורא את העסק — מכירות, רווחים, חוב, מזומן — ושואל מה הוא שווה. לאורך זמן המחיר נוטה ללכת אחרי הרווחים; חפיר הוא מה ששומר עליהם.', 'A share is part of a business. Fundamental analysis reads the business — sales, profits, debt, cash — and asks what it is worth. Over time the price tends to follow profits; a moat is what protects them.'),
    caveat: L('"נוטה" הוא לא "חייב": בשנה נתונה המחיר יכול ללכת נגד הרווחים. ועסק מצוין הוא לא בהכרח מניה במחיר טוב — אלה שתי שאלות נפרדות.', '"Tends" is not "must": in any given year the price can move against the profits. And an excellent business is not necessarily a stock at a good price — those are two separate questions.')
  },
  questions: [
    q('p1-price-vs-eps', 'P1', yearsTable(L(`${A.name.he} · רווח למניה ומחיר`, `${A.name.en} · EPS and price`)), 'beginner',
      L('באיזו שנה המחיר ירד בזמן שהרווח למניה עלה?', 'In which year did the price fall while earnings per share rose?'),
      nums(H.years.slice(1).map(String)), 'abcd'[priceDownEpsUp - 1]!,
      L(`ב־${H.years[priceDownEpsUp]} הרווח למניה עלה ל־${n2(hEps[priceDownEpsUp]!)} והמחיר ירד ל־${n2(hPrice[priceDownEpsUp]!)}. בכל שאר השנים שניהם עלו. בטווח קצר המחיר זז מסיבות שאינן העסק.`,
        `In ${H.years[priceDownEpsUp]} earnings per share rose to ${n2(hEps[priceDownEpsUp]!)} and the price fell to ${n2(hPrice[priceDownEpsUp]!)}. In every other year both rose. In the short run the price moves for reasons other than the business.`)),
    q('p1-growth', 'P1', {
      type: 'table', title: L('צמיחה צפויה ברווחים', 'Expected earnings growth'),
      columns: [L('חברה', 'Company'), L('צמיחה שנתית צפויה', 'Expected yearly growth')],
      rows: [A, B, D].map((c) => ({ label: c.name, cells: [pc(c.growth!, 0)] }))
    }, 'beginner',
      L('איזו מהחברות מתאימה לתיאור "חברת צמיחה"?', 'Which company fits the description "growth company"?'),
      [['a', A.name], ['b', B.name], ['c', D.name], ['d', L('אף אחת', 'None of them')]], 'c',
      L(`${D.name.he}: רווחים שצפויים לגדול בכ־${D.growth}% בשנה — הרבה מעל ${A.name.he} (${A.growth}%) ו־${B.name.he} (${B.growth}%). זה מתאר את החברה, לא אומר אם המניה שווה את מחירה.`,
        `${D.name.en}: earnings expected to grow about ${D.growth}% a year — well above ${A.name.en} (${A.growth}%) and ${B.name.en} (${B.growth}%). That describes the company; it does not say whether the stock is worth its price.`)),
    q('p1-business-fact', 'P1', {
      type: 'table', title: L(`${B.name.he} · שלוש עובדות`, `${B.name.en} · three facts`),
      columns: [L('עובדה', 'Fact'), L('ערך', 'Value')],
      rows: [
        { label: L('רווח נקי, לפני ארבע שנים ← היום (מיליונים)', 'Net income, four years ago → now (millions)'), cells: [`${n0(B_HISTORY.net[0]!)} → ${n0(B_HISTORY.net[B_HISTORY.net.length - 1]!)}`] },
        { label: L('מחיר המניה', 'Share price'), cells: [n2(B.price!)] },
        { label: L('מספר המניות (מיליונים)', 'Shares (millions)'), cells: [n0(B.statement.shares)] }
      ]
    }, 'intermediate',
      L(`איזו עובדה מספרת משהו על העסק של ${B.name.he}?`, `Which fact tells you something about ${B.name.en}'s business?`),
      [['a', L('הרווח הנקי ירד בארבע שנים', 'Net income fell over four years')], ['b', L('מחיר המניה', 'The share price')], ['c', L('מספר המניות', 'The number of shares')], ['d', L('כולן באותה מידה', 'All of them equally')]], 'a',
      L('רווח שיורד לאורך שנים הוא מידע על העסק. המחיר ומספר המניות אומרים כמה עולה חלק בחברה — לא כמה היא מרוויחה.', 'Profit falling over years is information about the business. The price and the share count say what a slice of the company costs — not how much it earns.'))
  ]
};

// ---------- P2 · the income statement ----------
const iA = income(A.statement), iB = income(B.statement), iD = income(D.statement);
const EXPLAIN: Record<string, [Localized, string?]> = {
  rev: [L('כל הכסף שנכנס ממכירות, לפני הוצאה אחת. חברה יכולה להגדיל הכנסות ועדיין להפסיד.', 'All the money that came in from sales, before a single cost. A company can grow revenue and still lose money.'), 'Revenue'],
  cogs: [L('העלות הישירה של מה שנמכר: חומרים, ייצור, אחסון.', 'The direct cost of what was sold: materials, production, storage.'), 'COGS'],
  gross: [L('מה שנשאר מכל מכירה אחרי העלות הישירה.', 'What is left of each sale after its direct cost.'), 'Gross profit'],
  sm: [L('העלות של להשיג לקוחות.', 'The cost of winning customers.'), 'S&M'],
  rd: [L('השקעה במוצרים הבאים — חיתוך שלה משפר רווח רק לטווח קצר.', 'Investment in the next products — cutting it only improves profit in the short run.'), 'R&D'],
  ga: [L('העלות של להפעיל את החברה עצמה.', 'The cost of running the company itself.'), 'G&A'],
  op: [L('הרווח מהעסק עצמו, לפני ריבית ומס — התמונה הנקייה ביותר של "כמה טוב העסק".', 'Profit from the business itself, before interest and tax — the cleanest picture of "how good the business is".'), 'Operating income'],
  int: [L('מה שהחברה משלמת על החוב שלה.', 'What the company pays on its debt.'), 'Interest'],
  pre: [L('הרווח התפעולי פחות הריבית.', 'Operating income minus interest.'), 'Pre-tax income'],
  tax: [L('מס החברות על הרווח.', 'Corporate tax on the profit.'), 'Taxes'],
  net: [L('מה שנשאר לבעלי המניות — המספר שבכותרות.', 'What is left for shareholders — the number in the headlines.'), 'Net income'],
  eps: [L(`רווח נקי ÷ מספר המניות (${A.statement.shares} מיליון).`, `Net income ÷ the number of shares (${A.statement.shares} million).`), 'EPS']
};
const formula = (c: Company, k: string): string | undefined => {
  const i = income(c.statement);
  if (k === 'gross') return `${n0(i.rev)} − ${n0(i.cogs)} = ${n0(i.gross)}`;
  if (k === 'op') return `${n0(i.gross)} − ${n0(i.sm)} − ${n0(i.rd)} − ${n0(i.ga)} = ${n0(i.op)}`;
  if (k === 'pre') return `${n0(i.op)} − ${n0(i.int)} = ${n0(i.pre)}`;
  if (k === 'net') return `${n0(i.pre)} − ${n0(i.tax)} = ${n0(i.net)}`;
  if (k === 'eps') return `${n0(i.net)} ÷ ${i.shares} = ${n2(i.eps)}`;
  return undefined;
};
const SHARE_ROWS = ['rev', 'gross', 'op', 'pre', 'net'];
const COS: Record<string, Company> = { a: A, b: B };
const fallA: Diagram = {
  type: 'waterfall', title: L(`${A.name.he} · מהכנסות לרווח נקי · ${MILLIONS.he}`, `${A.name.en} · revenue to net income · ${MILLIONS.en}`),
  steps: [
    { label: L('הכנסות', 'Revenue'), value: iA.rev, shown: n0(iA.rev), total: true },
    { label: L('עלות המכר', 'Cost of goods sold'), value: -iA.cogs, shown: n0(-iA.cogs) },
    { label: L('רווח גולמי', 'Gross profit'), value: iA.gross, shown: n0(iA.gross), total: true },
    { label: L('הוצאות תפעול', 'Operating costs'), value: -(iA.sm + iA.rd + iA.ga), shown: n0(-(iA.sm + iA.rd + iA.ga)) },
    { label: L('רווח תפעולי', 'Operating income'), value: iA.op, shown: n0(iA.op), total: true },
    { label: L('ריבית ומסים', 'Interest and taxes'), value: -(iA.int + iA.tax), shown: n0(-(iA.int + iA.tax)) },
    { label: L('רווח נקי', 'Net income'), value: iA.net, shown: n0(iA.net), total: true }
  ]
};

export const P2: LessonContent = {
  id: 'P2',
  tutor: { topic: 'net-income', label: L('דוח רווח והפסד', 'the income statement') },
  teach: [
    {
      heading: L('דוח שנקרא מלמעלה למטה', 'A report read from top to bottom'),
      paragraphs: [
        L('דוח רווח והפסד (Income Statement) מספר מה קרה לכסף שנכנס לחברה במהלך השנה. הוא מתחיל בהכנסות — כל מה שהחברה מכרה — ויורד שורה אחרי שורה: כל שורה מפחיתה עוד הוצאה מזו שמעליה, עד השורה התחתונה.',
          'The income statement tells what happened to the money that came into the company during the year. It starts with revenue — everything the company sold — and goes down line by line: each line takes one more cost off the line above it, down to the bottom line.'),
        L(`אצל ${A.name.he}: ${n0(iA.rev)} מיליון הכנסות. אחרי עלות המכר נשארו ${n0(iA.gross)}; אחרי הוצאות התפעול — שיווק, פיתוח והנהלה — ${n0(iA.op)}; ואחרי ריבית ומסים — ${n0(iA.net)} מיליון רווח נקי. מכל שקל שנכנס, נשארו לבעלי המניות כ־${Math.round((iA.net / iA.rev) * 100)} אגורות.`,
          `At ${A.name.en}: ${n0(iA.rev)} million of revenue. After the cost of goods sold, ${n0(iA.gross)} was left; after operating costs — marketing, development and admin — ${n0(iA.op)}; and after interest and taxes, ${n0(iA.net)} million of net income. Of every dollar that came in, about ${Math.round((iA.net / iA.rev) * 100)} cents were left for shareholders.`),
        L('זו הסיבה שאומרים "השורה העליונה" על ההכנסות ו"השורה התחתונה" על הרווח הנקי. חברה יכולה להגדיל את העליונה ולראות את התחתונה מתכווצת.',
          'That is why revenue is called "the top line" and net income "the bottom line". A company can grow the top one and watch the bottom one shrink.')
      ],
      work: { kind: 'diagram', diagram: fallA }
    },
    {
      heading: L('"רווח" הוא ארבעה מספרים', '"Profit" is four different numbers'),
      paragraphs: [
        L(`כשמישהו אומר "החברה הרוויחה", כדאי לשאול: איזה רווח? רווח גולמי (${n0(iA.gross)}) — אחרי העלות הישירה. רווח תפעולי (${n0(iA.op)}) — אחרי כל עלויות הפעלת העסק. רווח לפני מס (${n0(iA.pre)}) — אחרי ריבית. רווח נקי (${n0(iA.net)}) — אחרי מס.`,
          `When someone says "the company made a profit", it is worth asking: which one? Gross profit (${n0(iA.gross)}) — after direct costs. Operating income (${n0(iA.op)}) — after every cost of running the business. Pre-tax income (${n0(iA.pre)}) — after interest. Net income (${n0(iA.net)}) — after tax.`),
        L(`הרווח למניה (EPS) מחלק את הרווח הנקי במספר המניות: ${ltr(`${n0(iA.net)} ÷ ${iA.shares} = ${n2(iA.eps)}`)}. זה הרווח שמגיע לכל מניה אחת — והמספר שמכפיל הרווח ישתמש בו בשיעור 6.`,
          `Earnings per share (EPS) divide net income by the number of shares: ${n0(iA.net)} ÷ ${iA.shares} = ${n2(iA.eps)}. That is the profit belonging to each single share — and the number the P/E multiple will use in lesson 6.`),
        L(`ועוד מספר שתראו בכותרות: EBITDA — רווח תפעולי לפני פחת והפחתות. אצל ${A.name.he}: ${ltr(`${n0(iA.op)} + ${n0(A.cash!.da)} = ${n0(iA.op + A.cash!.da)}`)}. הוא מוסיף בחזרה את השחיקה של הציוד, ולכן תמיד גבוה מהרווח התפעולי — שימושי להשוואה, אבל מתעלם מכך שציוד צריך להחליף.`,
          `And one more number you will see in headlines: EBITDA — operating income before depreciation and amortisation. At ${A.name.en}: ${n0(iA.op)} + ${n0(A.cash!.da)} = ${n0(iA.op + A.cash!.da)}. It adds back the wear on equipment, so it is always higher than operating income — useful for comparing, but it ignores that equipment has to be replaced.`)
      ],
      callouts: [{ kind: 'caveat', lead: L('שימו לב', 'Watch out'), text: L('כותרת על "רווח שיא" יכולה לדבר על כל אחד מארבעת הרווחים. תמיד בודקים איזה.', 'A headline about "record profit" can mean any of the four. Always check which.') }],
      work: { kind: 'diagram', diagram: statementTable(L(`${A.name.he} · דוח רווח והפסד`, `${A.name.en} · income statement`), [A], 'rev', 'net', [{ label: L('רווח למניה', 'Earnings per share'), cells: [n2(iA.eps)] }]) }
    },
    {
      heading: L('אותן הכנסות, רווח אחר', 'The same revenue, a different profit'),
      paragraphs: [
        L(`ל־${B.name.he} יש בדיוק אותן הכנסות כמו ל־${A.name.he}: ${n0(iB.rev)} מיליון. אבל הרווח הנקי שלה הוא ${n0(iB.net)} בלבד, לעומת ${n0(iA.net)}. כדי להבין למה, קוראים את שני הדוחות שורה מול שורה.`,
          `${B.name.en} has exactly the same revenue as ${A.name.en}: ${n0(iB.rev)} million. But its net income is only ${n0(iB.net)}, against ${n0(iA.net)}. To see why, you read the two statements line against line.`),
        L(`עד הרווח התפעולי הפער קטן מהצפוי: עלות המכר של ${B.name.he} גבוהה יותר (${n0(iB.cogs)} מול ${n0(iA.cogs)}), אבל היא מוציאה פחות על שיווק ופיתוח. בסוף, רווח תפעולי של ${n0(iB.op)} מול ${n0(iA.op)} — קרובים.`,
          `Down to operating income, the gap is smaller than you might expect: ${B.name.en}'s cost of goods sold is higher (${n0(iB.cogs)} against ${n0(iA.cogs)}), but it spends less on marketing and development. In the end, operating income of ${n0(iB.op)} against ${n0(iA.op)} — close.`),
        L('אז איפה נעלם רוב הפער ברווח הנקי? זו המשימה בשלב הבא — בסייר הדוחות תוכלו לעבור בין החברות וללחוץ על כל שורה.',
          'So where did most of the net-income gap go? That is the task in the next step — in the statement explorer you can switch between the companies and click on any line.')
      ],
      work: { kind: 'diagram', diagram: statementTable(L('עד הרווח התפעולי', 'Down to operating income'), [A, B], 'rev', 'op') }
    }
  ],
  charts: [],
  activity: {
    kind: 'explore',
    prompt: L(`למה ${B.name.he} מרוויחה פחות?`, `Why does ${B.name.en} earn less?`),
    task: L(`לשתי החברות אותן הכנסות בדיוק. לחצו על שורות בדוח, החליפו חברה, ומצאו את השורה שבה נוצר רוב הפער ברווח הנקי של ${B.name.he}. אחר כך "בדיקה".`,
      `Both companies have exactly the same revenue. Click lines of the statement, switch companies, and find the line where most of ${B.name.en}'s net-income gap is created. Then "Check".`),
    title: L(`דוח רווח והפסד · ${MILLIONS.he}`, `Income statement · ${MILLIONS.en}`),
    datasets: [{ key: 'a', label: A.name }, { key: 'b', label: B.name }],
    rows: [
      ...LINES.map(([k, he, en, kind]) => ({
        id: k, label: L(he, en), term: EXPLAIN[k]![1], ...(kind ? { kind } : {}),
        values: { a: shown(A, k), b: shown(B, k) }, why: EXPLAIN[k]![0],
        ...(formula(A, k) ? { formula: { a: formula(A, k)!, b: formula(B, k)! } } : {}),
        ...(SHARE_ROWS.includes(k) ? { share: { a: (income(A.statement)[k] / iA.rev) * 100, b: (income(B.statement)[k] / iB.rev) * 100 } } : {})
      })),
      { id: 'eps', label: L('רווח למניה', 'EPS'), term: EXPLAIN.eps![1], values: { a: n2(iA.eps), b: n2(iB.eps) }, why: EXPLAIN.eps![0], formula: { a: formula(A, 'eps')!, b: formula(B, 'eps')! } }
    ],
    sharesTitle: L('מה נשאר מכל שקל הכנסות', 'What is left of each unit of revenue'),
    target: { dataset: 'b', row: 'int' },
    right: L(`מצאתם. הרווח התפעולי קרוב (${n0(iA.op)} מול ${n0(iB.op)}), אבל ${B.name.he} משלמת ${n0(iB.int)} מיליון ריבית, לעומת ${n0(iA.int)} — וזה מוריד את הרווח הנקי שלה לפחות מחצי (${n0(iB.net)} מול ${n0(iA.net)}).`,
      `Found it. Operating income is close (${n0(iA.op)} against ${n0(iB.op)}), but ${B.name.en} pays ${n0(iB.int)} million of interest, against ${n0(iA.int)} — and that takes its net income below half (${n0(iB.net)} against ${n0(iA.net)}).`),
    off: L(`לא בשורה הזו. בחרו את ${B.name.he}, והשוו אותה ל־${A.name.he} מהרווח התפעולי ומטה: איזו שורה לוקחת הכי הרבה?`, `Not that line. Choose ${B.name.en} and compare it with ${A.name.en} from operating income down: which line takes the most?`),
    explain: [
      L(`זה ההבדל בין רווח תפעולי לרווח נקי. התפעולי מודד את העסק עצמו — ובו ${B.name.he} לא רחוקה מ־${A.name.he}. הנקי מוסיף את הדרך שבה החברה ממומנת: ${B.name.he} ממומנת בחוב, והריבית עליו אוכלת את רוב הרווח.`,
        `That is the difference between operating income and net income. Operating income measures the business itself — and there ${B.name.en} is not far from ${A.name.en}. Net income adds the way the company is financed: ${B.name.en} is financed with debt, and the interest on it eats most of the profit.`),
      L('זו תצפית, לא פסק דין: חוב אינו רע מעצמו. אם הוא גדול מדי ביחס לרווח — זו שאלה של שיעור 7.', 'That is an observation, not a verdict: debt is not bad in itself. Whether it is too big for the profit is a question for lesson 7.')
    ]
  },
  apply: q('p2-apply', 'P2', {
    type: 'table', title: L('רווח נקי ורווח למניה', 'Net income and EPS'),
    columns: [L('נתון', 'Figure'), A.name, D.name],
    rows: [
      { label: L('רווח נקי (מיליונים)', 'Net income (millions)'), cells: [n0(iA.net), n0(iD.net)] },
      { label: L('מספר מניות (מיליונים)', 'Shares (millions)'), cells: [n0(iA.shares), n0(iD.shares)] },
      { label: L('רווח למניה', 'Earnings per share'), cells: [n2(iA.eps), n2(iD.eps)] }
    ]
  }, 'intermediate',
    L(`${D.name.he} מרוויחה פחות מ־${A.name.he} (${n0(iD.net)} מול ${n0(iA.net)}), אבל הרווח שלה למניה כמעט כפול. למה?`, `${D.name.en} earns less than ${A.name.en} (${n0(iD.net)} against ${n0(iA.net)}), yet its earnings per share are almost double. Why?`),
    [
      ['a', L('יש לה פחות מניות — הרווח מתחלק בפחות חלקים', 'It has fewer shares — the profit is split into fewer pieces')],
      ['b', L('היא עסק טוב פי שניים', 'It is twice as good a business')],
      ['c', L('רווח למניה לא קשור לרווח הנקי', 'EPS has nothing to do with net income')],
      ['d', L('היא משלמת פחות מסים', 'It pays less tax')]
    ], 'a',
    L(`${ltr(`${n0(iD.net)} ÷ ${iD.shares} = ${n2(iD.eps)}`)}, לעומת ${ltr(`${n0(iA.net)} ÷ ${iA.shares} = ${n2(iA.eps)}`)}. רווח למניה משווה את אותה חברה לאורך זמן; בין חברות שונות הוא אומר מעט, כי כל אחת חילקה את עצמה למספר אחר של מניות.`,
      `${n0(iD.net)} ÷ ${iD.shares} = ${n2(iD.eps)}, against ${n0(iA.net)} ÷ ${iA.shares} = ${n2(iA.eps)}. EPS compares the same company over time; between different companies it says little, because each one is split into a different number of shares.`)),
  takeaway: {
    bottomLine: L('דוח רווח והפסד יורד מההכנסות לרווח הנקי, הוצאה אחרי הוצאה. יש ארבעה רווחים — גולמי, תפעולי, לפני מס ונקי — והרווח למניה הוא הנקי חלקי מספר המניות.', 'The income statement goes down from revenue to net income, cost after cost. There are four profits — gross, operating, pre-tax and net — and EPS is net income divided by the number of shares.'),
    caveat: L('הרווח התפעולי מודד את העסק; הרווח הנקי מוסיף את המימון והמס. שתי חברות דומות יכולות להגיע לרווח נקי שונה מאוד רק בגלל החוב שלהן.', 'Operating income measures the business; net income adds financing and tax. Two similar companies can end up with very different net income just because of their debt.')
  },
  questions: [
    q('p2-operating', 'P2', statementTable(L(`${B.name.he} · עד הוצאות ההנהלה`, `${B.name.en} · down to admin costs`), [B], 'rev', 'ga'), 'beginner',
      L(`מה הרווח התפעולי של ${B.name.he}?`, `What is ${B.name.en}'s operating income?`),
      nums([n0(iB.op), n0(iB.gross), n0(iB.gross - iB.sm - iB.rd), n0(iB.net)]), 'a',
      L(`${ltr(`${n0(iB.rev)} − ${n0(iB.cogs)} − ${n0(iB.sm)} − ${n0(iB.rd)} − ${n0(iB.ga)} = ${n0(iB.op)}`)}. הרווח הגולמי (${n0(iB.gross)}) נעצר לפני הוצאות התפעול; ${n0(iB.gross - iB.sm - iB.rd)} שוכח את ההנהלה והכלליות.`,
        `${n0(iB.rev)} − ${n0(iB.cogs)} − ${n0(iB.sm)} − ${n0(iB.rd)} − ${n0(iB.ga)} = ${n0(iB.op)}. Gross profit (${n0(iB.gross)}) stops before operating costs; ${n0(iB.gross - iB.sm - iB.rd)} forgets general and admin.`)),
    q('p2-eps', 'P2', statementTable(L(`${B.name.he} · דוח רווח והפסד`, `${B.name.en} · income statement`), [B], 'op', 'net', [{ label: L('מספר מניות (מיליונים)', 'Shares (millions)'), cells: [n0(iB.shares)] }]), 'beginner',
      L(`מה הרווח למניה של ${B.name.he}?`, `What are ${B.name.en}'s earnings per share?`),
      nums([n2(iB.eps), n2(iB.op / iB.shares), n2(iB.net / (iB.shares / 2)), n2(iB.rev / iB.shares)]), 'a',
      L(`רווח נקי חלקי מספר המניות: ${ltr(`${n0(iB.net)} ÷ ${iB.shares} = ${n2(iB.eps)}`)}. ${n2(iB.op / iB.shares)} מחלק את הרווח התפעולי — לפני ריבית ומס.`,
        `Net income divided by the number of shares: ${n0(iB.net)} ÷ ${iB.shares} = ${n2(iB.eps)}. ${n2(iB.op / iB.shares)} divides operating income — before interest and tax.`)),
    q('p2-rnd', 'P2', statementTable(L(`${A.name.he} · עד הרווח התפעולי`, `${A.name.en} · down to operating income`), [A], 'rev', 'op'), 'intermediate',
      L(`${A.name.he} מקצצת 200 מיליון ממחקר ופיתוח, וכל השאר נשאר כמו שהוא. מה קורה לרווח התפעולי?`, `${A.name.en} cuts 200 million from R&D, and everything else stays the same. What happens to operating income?`),
      [
        ['a', L(`עולה ל־${n0(iA.op + 200)} — אבל אולי על חשבון המוצרים של השנים הבאות`, `It rises to ${n0(iA.op + 200)} — but perhaps at the cost of the next years' products`)],
        ['b', L(`נשאר ${n0(iA.op)} — מחקר ופיתוח לא נמצא ברווח התפעולי`, `It stays ${n0(iA.op)} — R&D is not part of operating income`)],
        ['c', L(`עולה ל־${n0(iA.op + 200)}, וזה שיפור אמיתי של העסק`, `It rises to ${n0(iA.op + 200)}, and that is a real improvement in the business`)],
        ['d', L(`יורד ל־${n0(iA.op - 200)}`, `It falls to ${n0(iA.op - 200)}`)]
      ], 'a',
      L(`${ltr(`${n0(iA.op)} + 200 = ${n0(iA.op + 200)}`)} — המספר משתפר השנה. אבל מחקר ופיתוח הוא השקעה במוצרים הבאים: רווח שנוצר מקיצוץ שלו יכול לעלות ביוקר בהמשך. רווח גבוה יותר הוא תצפית; אם זה שיפור, תלוי בסיבה.`,
        `${n0(iA.op)} + 200 = ${n0(iA.op + 200)} — the number improves this year. But R&D is investment in the next products: profit made by cutting it can cost dearly later. A higher profit is an observation; whether it is an improvement depends on why.`))
  ]
};

// ---------- P3 · balance sheet and cash flow ----------
const bA = A.balance!, bB = B.balance!;
const balanceStacks = (c: Company, markEquity: boolean): Diagram => {
  const b = c.balance!;
  return {
    type: 'stacks', title: L(`${c.name.he} · מאזן · ${MILLIONS.he}`, `${c.name.en} · balance sheet · ${MILLIONS.en}`),
    columns: [
      { label: L('נכסים', 'Assets'), total: n0(totalAssets(b)), parts: [
        { label: L('מזומן', 'Cash'), value: b.cash, shown: n0(b.cash), tone: 'info' },
        { label: L('לקוחות ומלאי', 'Receivables and inventory'), value: b.receivables, shown: n0(b.receivables), tone: 'info' },
        { label: L('מבנים וציוד', 'Buildings and equipment'), value: b.ppe, shown: n0(b.ppe), tone: 'adv' },
        ...(b.goodwill ? [{ label: L('מוניטין', 'Goodwill'), value: b.goodwill, shown: n0(b.goodwill), tone: 'adv' as const }] : [])
      ] },
      { label: L('התחייבויות והון', 'Liabilities and equity'), total: n0(b.currentLiab + b.longDebt + b.equity), parts: [
        { label: L('התחייבויות שוטפות', 'Current liabilities'), value: b.currentLiab, shown: n0(b.currentLiab), tone: 'err' },
        { label: L('חוב לזמן ארוך', 'Long-term debt'), value: b.longDebt, shown: n0(b.longDebt), tone: 'risk' },
        { label: L('הון עצמי', 'Equity'), value: b.equity, shown: n0(b.equity), tone: 'ok', mark: markEquity }
      ] }
    ]
  };
};
const cashFall = (title: Localized, c: CashFlow): Diagram => ({
  type: 'waterfall', title,
  steps: [
    { label: L('רווח נקי', 'Net income'), value: c.net, shown: n0(c.net), total: true },
    { label: L('פחת (לא יצא כסף)', 'Depreciation (no cash left)'), value: c.da, shown: `+${n0(c.da)}` },
    { label: L('לקוחות ומלאי', 'Receivables and inventory'), value: c.workingCap, shown: n0(c.workingCap) },
    { label: L('תזרים מפעילות', 'Operating cash flow'), value: operatingCash(c), shown: n0(operatingCash(c)), total: true },
    { label: L('השקעה בציוד', 'Investment in equipment'), value: c.capex, shown: n0(c.capex) },
    { label: L('תזרים חופשי', 'Free cash flow'), value: freeCash(c), shown: n0(freeCash(c)), total: true }
  ]
});
const E_NAME = L('חברה ה׳', 'Company E');
const crA = currentRatio(bA), crB = currentRatio(bB);

export const P3: LessonContent = {
  id: 'P3',
  tutor: { topic: 'free-cash-flow', label: L('מאזן ותזרים מזומנים', 'the balance sheet and cash flow') },
  teach: [
    {
      heading: L('מה יש לחברה, ומי מימן אותו', 'What the company has, and who paid for it'),
      paragraphs: [
        L('דוח רווח והפסד מספר מה קרה במהלך שנה. המאזן (Balance Sheet) הוא תמונה של רגע אחד: מה יש לחברה, ומה היא חייבת. בצד אחד הנכסים — מזומן, כסף שלקוחות עוד חייבים, מלאי, מבנים וציוד. בצד השני — מי מימן את כל זה.',
          'The income statement tells what happened during a year. The balance sheet is a picture of one moment: what the company has, and what it owes. On one side, the assets — cash, money customers still owe, inventory, buildings and equipment. On the other — who paid for all of it.'),
        L(`אצל ${A.name.he}: נכסים של ${n0(totalAssets(bA))} מיליון. מתוכם ${n0(bA.cash)} מזומן ו־${n0(bA.receivables)} לקוחות ומלאי — נכסים שהופכים לכסף בתוך שנה, ולכן נקראים שוטפים. היתר, ${n0(bA.ppe + bA.goodwill)}, הם מבנים, ציוד ומוניטין (הפרמיה ששילמה על חברות שקנתה).`,
          `At ${A.name.en}: ${n0(totalAssets(bA))} million of assets. Of those, ${n0(bA.cash)} is cash and ${n0(bA.receivables)} is receivables and inventory — assets that turn into cash within a year, so they are called current. The rest, ${n0(bA.ppe + bA.goodwill)}, is buildings, equipment and goodwill (the premium it paid for companies it bought).`),
        L(`בצד השני: ${n0(bA.currentLiab)} התחייבויות שוטפות — חשבונות וחוב שצריך לשלם בתוך שנה; ${n0(bA.longDebt)} חוב לזמן ארוך; והשאר, ${n0(bA.equity)}, הוא ההון העצמי — מה ששייך לבעלי המניות.`,
          `On the other side: ${n0(bA.currentLiab)} of current liabilities — bills and debt due within a year; ${n0(bA.longDebt)} of long-term debt; and the rest, ${n0(bA.equity)}, is equity — what belongs to the shareholders.`)
      ],
      work: { kind: 'diagram', diagram: balanceStacks(A, false) }
    },
    {
      heading: L('שני צדדים שתמיד שווים', 'Two sides that are always equal'),
      paragraphs: [
        L(`המאזן נקרא כך כי הוא תמיד מאוזן: נכסים = התחייבויות + הון עצמי. ${ltr(`${n0(totalAssets(bA))} = ${n0(bA.currentLiab)} + ${n0(bA.longDebt)} + ${n0(bA.equity)}`)}. כל שקל שיש לחברה הגיע ממישהו — מלווים, או בעלים.`,
          `The balance sheet is called that because it always balances: assets = liabilities + equity. ${n0(totalAssets(bA))} = ${n0(bA.currentLiab)} + ${n0(bA.longDebt)} + ${n0(bA.equity)}. Every unit the company has came from someone — lenders, or owners.`),
        L('לכן ההון העצמי הוא מה שנשאר אחרי שמורידים מהנכסים את כל מה שחייבים: אם החברה הייתה מוכרת את הכל לפי הערך בספרים ומשלמת את כל החובות — זה מה שהיה נשאר לבעלים.',
          'So equity is what is left once everything owed is taken off the assets: if the company sold everything at its book value and paid all its debts — that is what would be left for the owners.'),
        L(`ומספר אחד שיחזור בהמשך: חוב נטו — כל החוב פחות המזומן. ל־${A.name.he} חוב של ${n0(totalDebt(bA))} (${n0(bA.shortDebt)} מתוכו בתוך ההתחייבויות השוטפות) ומזומן של ${n0(bA.cash)}: ${ltr(`${n0(totalDebt(bA))} − ${n0(bA.cash)} = ${n0(netDebt(bA))}`)}.`,
          `And one number that will come back later: net debt — all the debt minus the cash. ${A.name.en} has ${n0(totalDebt(bA))} of debt (${n0(bA.shortDebt)} of it inside current liabilities) and ${n0(bA.cash)} of cash: ${n0(totalDebt(bA))} − ${n0(bA.cash)} = ${n0(netDebt(bA))}.`)
      ],
      callouts: [{ kind: 'example', lead: L('הנוסחה', 'The formula'), text: L('נכסים = התחייבויות + הון עצמי. תמיד.', 'Assets = liabilities + equity. Always.') }],
      work: { kind: 'diagram', diagram: balanceStacks(A, true) }
    },
    {
      heading: L('רווחית — ובכל זאת שורפת מזומן', 'Profitable — and still burning cash'),
      paragraphs: [
        L(`רווח הוא חשבונאות; מזומן הוא מה שמשלם משכורות. ${E_NAME.he} הרוויחה ${n0(E_CASH.net)} מיליון השנה. אבל לקוחות עוד לא שילמו לה ${n0(-E_CASH.workingCap)} מהמכירות, והיא השקיעה ${n0(-E_CASH.capex)} בציוד חדש.`,
          `Profit is accounting; cash is what pays salaries. ${E_NAME.en} earned ${n0(E_CASH.net)} million this year. But customers have not yet paid it ${n0(-E_CASH.workingCap)} of its sales, and it invested ${n0(-E_CASH.capex)} in new equipment.`),
        L(`דוח תזרים המזומנים מתחיל מהרווח ומתקן אותו: מוסיף את הפחת (${n0(E_CASH.da)} — הוצאה בדוח, אבל כסף לא יצא), מוריד את מה שלקוחות עוד חייבים, ומגיע לתזרים מפעילות: ${n0(operatingCash(E_CASH))}. אחרי ההשקעה בציוד נשאר התזרים החופשי (Free Cash Flow): ${n0(freeCash(E_CASH))} — יצא יותר ממה שנכנס.`,
          `The cash flow statement starts from profit and corrects it: it adds back depreciation (${n0(E_CASH.da)} — a cost in the report, but no cash left), takes off what customers still owe, and arrives at operating cash flow: ${n0(operatingCash(E_CASH))}. After investing in equipment, what is left is free cash flow: ${n0(freeCash(E_CASH))} — more went out than came in.`),
        L('זה לא בהכרח רע: חברה שגדלה מהר משקיעה לפני שהיא גובה. אבל חברה שרווחית בדוח ושורפת מזומן שנה אחרי שנה צריכה לממן את עצמה מחוב או ממניות חדשות — ולכן מסתכלים על שני הדוחות.',
          'That is not necessarily bad: a fast-growing company invests before it collects. But a company that is profitable on paper and burns cash year after year has to fund itself with debt or new shares — which is why you look at both reports.')
      ],
      callouts: [{ kind: 'caveat', lead: L('שימו לב', 'Watch out'), text: L('חברה יכולה להיות רווחית ולהגיע לקשיים — כי חשבונות משלמים במזומן.', 'A company can be profitable and still get into trouble — because bills are paid in cash.') }],
      work: { kind: 'diagram', diagram: cashFall(L(`${E_NAME.he} · מרווח לתזרים · ${MILLIONS.he}`, `${E_NAME.en} · from profit to cash · ${MILLIONS.en}`), E_CASH) }
    }
  ],
  charts: [],
  activity: {
    kind: 'calculate',
    prompt: L('קראו את המאזן', 'Read the balance sheet'),
    task: L(`היחס השוטף (Current Ratio) משווה את הנכסים השוטפים של ${A.name.he} להתחייבויות השוטפות שלה: נכסים שוטפים ÷ התחייבויות שוטפות. מה הוא? עגלו לשתי ספרות אחרי הנקודה.`,
      `The current ratio compares ${A.name.en}'s current assets with its current liabilities: current assets ÷ current liabilities. What is it? Round to two decimal places.`),
    diagram: {
      type: 'table', title: L(`${A.name.he} · שוטף · ${MILLIONS.he}`, `${A.name.en} · current items · ${MILLIONS.en}`),
      columns: [L('שורה במאזן', 'Balance-sheet line'), L('סכום', 'Amount')],
      rows: [
        { label: L('מזומן', 'Cash'), cells: [n0(bA.cash)] },
        { label: L('לקוחות ומלאי', 'Receivables and inventory'), cells: [n0(bA.receivables)] },
        { label: L('מבנים, ציוד ומוניטין', 'Buildings, equipment and goodwill'), cells: [n0(bA.ppe + bA.goodwill)] },
        { label: L('התחייבויות שוטפות', 'Current liabilities'), cells: [n0(bA.currentLiab)] },
        { label: L('חוב לזמן ארוך', 'Long-term debt'), cells: [n0(bA.longDebt)] }
      ],
      caption: L('נכסים שוטפים: מה שהופך לכסף בתוך שנה. התחייבויות שוטפות: מה שצריך לשלם בתוך שנה.', 'Current assets: what turns into cash within a year. Current liabilities: what has to be paid within a year.')
    },
    answer: +crA.toFixed(2),
    tolerance: 0.02,
    field: L('היחס השוטף', 'Current ratio'),
    mistakes: [
      { value: 1 / crA, tolerance: 0.01, why: L('זה יצא הפוך: חילקתם את ההתחייבויות בנכסים. היחס השוטף הוא נכסים שוטפים חלקי התחייבויות שוטפות.', 'That came out the wrong way round: you divided liabilities by assets. The current ratio is current assets over current liabilities.') },
      { value: bA.cash / bA.currentLiab, tolerance: 0.01, why: L('לקחתם רק את המזומן. גם לקוחות ומלאי הם נכסים שוטפים — הם הופכים לכסף בתוך שנה.', 'You took only the cash. Receivables and inventory are current assets too — they turn into cash within a year.') },
      { value: totalAssets(bA) / bA.currentLiab, tolerance: 0.05, why: L('לקחתם את כל הנכסים. מבנים, ציוד ומוניטין לא הופכים לכסף בתוך שנה — הם לא שוטפים.', 'You took all the assets. Buildings, equipment and goodwill do not turn into cash within a year — they are not current.') }
    ],
    steps: [
      L(`נכסים שוטפים: ${ltr(`${n0(bA.cash)} + ${n0(bA.receivables)} = ${n0(bA.cash + bA.receivables)}`)}`, `Current assets: ${n0(bA.cash)} + ${n0(bA.receivables)} = ${n0(bA.cash + bA.receivables)}`),
      L(`התחייבויות שוטפות: ${n0(bA.currentLiab)}`, `Current liabilities: ${n0(bA.currentLiab)}`),
      L(`היחס השוטף: ${ltr(`${n0(bA.cash + bA.receivables)} ÷ ${n0(bA.currentLiab)} = ${crA.toFixed(2)}`)}`, `Current ratio: ${n0(bA.cash + bA.receivables)} ÷ ${n0(bA.currentLiab)} = ${crA.toFixed(2)}`)
    ],
    right: L(`יחס שוטף של ${crA.toFixed(2)}: הנכסים שהופכים לכסף בתוך שנה מכסים את החשבונות של השנה ${crA.toFixed(2)} פעמים.`, `A current ratio of ${crA.toFixed(2)}: the assets that turn into cash within a year cover the year's bills ${crA.toFixed(2)} times.`),
    off: L('עוד לא. שני צעדים: חברו את הנכסים השוטפים (מזומן, לקוחות ומלאי), וחלקו בהתחייבויות השוטפות.', 'Not yet. Two steps: add up the current assets (cash, receivables and inventory), and divide by current liabilities.'),
    explain: [
      L(`יחס מעל 1 אומר שיש יותר נכסים שוטפים מחשבונות שוטפים — כרית ביטחון לשנה הקרובה. מתחת ל־1 החברה עלולה להזדקק לכסף מבחוץ כדי לשלם בזמן. אבל היחס הוא נקודת מוצא: מלאי שלא נמכר לא משלם חשבונות, ולכן בודקים גם ממה בנויים הנכסים.`,
        `A ratio above 1 means more current assets than current bills — a cushion for the coming year. Below 1, the company may need outside money to pay on time. But the ratio is a starting point: inventory that does not sell pays no bills, so you also check what the assets are made of.`)
    ]
  },
  apply: q('p3-apply', 'P3', cashFall(L(`${A.name.he} · מרווח לתזרים · ${MILLIONS.he}`, `${A.name.en} · from profit to cash · ${MILLIONS.en}`), A.cash!), 'intermediate',
    L(`${A.name.he} הרוויחה ${n0(A.cash!.net)}, אבל התזרים החופשי שלה ${n0(freeCash(A.cash!))}. מה מסביר את רוב הפער?`, `${A.name.en} earned ${n0(A.cash!.net)}, but its free cash flow was ${n0(freeCash(A.cash!))}. What explains most of the gap?`),
    [
      ['a', L(`היא השקיעה ${n0(-A.cash!.capex)} בציוד — יותר מ־${n0(A.cash!.da)} של פחת שהוחזרו`, `It invested ${n0(-A.cash!.capex)} in equipment — more than the ${n0(A.cash!.da)} of depreciation added back`)],
      ['b', L('היא הפסידה כסף השנה', 'It lost money this year')],
      ['c', L('המס נגבה פעמיים', 'Tax was charged twice')],
      ['d', L('מחיר המניה ירד', 'Its share price fell')]
    ], 'a',
    L(`${ltr(`${n0(A.cash!.net)} + ${n0(A.cash!.da)} − ${n0(-A.cash!.workingCap)} = ${n0(operatingCash(A.cash!))}`)} מפעילות, ואחרי ${n0(-A.cash!.capex)} של השקעה בציוד — ${n0(freeCash(A.cash!))}. זה המספר שמודל השווי בשיעור 9 ישתמש בו.`,
      `${n0(A.cash!.net)} + ${n0(A.cash!.da)} − ${n0(-A.cash!.workingCap)} = ${n0(operatingCash(A.cash!))} from operations, and after ${n0(-A.cash!.capex)} of investment in equipment — ${n0(freeCash(A.cash!))}. That is the number the valuation model in lesson 9 will use.`)),
  takeaway: {
    bottomLine: L('המאזן מראה מה יש לחברה ומי מימן אותו — נכסים = התחייבויות + הון עצמי. דוח התזרים מראה כמה מזומן באמת נכנס; התזרים החופשי הוא מה שנשאר אחרי ההשקעה בעסק.', 'The balance sheet shows what the company has and who paid for it — assets = liabilities + equity. The cash flow statement shows how much cash really came in; free cash flow is what is left after investing in the business.'),
    caveat: L('רווח זה לא מזומן: חברה רווחית יכולה לשרוף כסף. והיחס השוטף הוא כרית, לא הבטחה — תלוי ממה בנויים הנכסים.', 'Profit is not cash: a profitable company can burn money. And the current ratio is a cushion, not a promise — it depends on what the assets are made of.')
  },
  questions: [
    q('p3-equity', 'P3', {
      type: 'table', title: L(`${B.name.he} · מאזן · ${MILLIONS.he}`, `${B.name.en} · balance sheet · ${MILLIONS.en}`),
      columns: [L('שורה', 'Line'), L('סכום', 'Amount')],
      rows: [
        { label: L('סך הנכסים', 'Total assets'), cells: [n0(totalAssets(bB))] },
        { label: L('התחייבויות שוטפות', 'Current liabilities'), cells: [n0(bB.currentLiab)] },
        { label: L('חוב לזמן ארוך', 'Long-term debt'), cells: [n0(bB.longDebt)] }
      ]
    }, 'beginner',
      L(`מה ההון העצמי של ${B.name.he}?`, `What is ${B.name.en}'s equity?`),
      nums([n0(bB.equity), n0(totalAssets(bB) - bB.currentLiab), n0(totalAssets(bB)), n0(bB.currentLiab + bB.longDebt)]), 'a',
      L(`נכסים פחות כל ההתחייבויות: ${ltr(`${n0(totalAssets(bB))} − ${n0(bB.currentLiab)} − ${n0(bB.longDebt)} = ${n0(bB.equity)}`)}. רוב הנכסים של ${B.name.he} ממומנים בחוב — נחזור לזה בשיעור 7.`,
        `Assets minus all the liabilities: ${n0(totalAssets(bB))} − ${n0(bB.currentLiab)} − ${n0(bB.longDebt)} = ${n0(bB.equity)}. Most of ${B.name.en}'s assets are funded with debt — lesson 7 comes back to that.`)),
    q('p3-fcf', 'P3', {
      type: 'table', title: L(`${D.name.he} · תזרים · ${MILLIONS.he}`, `${D.name.en} · cash flow · ${MILLIONS.en}`),
      columns: [L('שורה', 'Line'), L('סכום', 'Amount')],
      rows: [
        { label: L('רווח נקי', 'Net income'), cells: [n0(D.cash!.net)] },
        { label: L('פחת', 'Depreciation'), cells: [`+${n0(D.cash!.da)}`] },
        { label: L('לקוחות ומלאי', 'Receivables and inventory'), cells: [n0(D.cash!.workingCap)] },
        { label: L('השקעה בציוד', 'Investment in equipment'), cells: [n0(D.cash!.capex)] }
      ]
    }, 'intermediate',
      L(`מה התזרים החופשי של ${D.name.he}?`, `What is ${D.name.en}'s free cash flow?`),
      nums([n0(freeCash(D.cash!)), n0(operatingCash(D.cash!)), n0(D.cash!.net), n0(operatingCash(D.cash!) - D.cash!.capex)]), 'a',
      L(`${ltr(`${n0(D.cash!.net)} + ${n0(D.cash!.da)} − ${n0(-D.cash!.workingCap)} − ${n0(-D.cash!.capex)} = ${n0(freeCash(D.cash!))}`)}. ${n0(operatingCash(D.cash!))} הוא התזרים מפעילות — לפני ההשקעה בציוד.`,
        `${n0(D.cash!.net)} + ${n0(D.cash!.da)} − ${n0(-D.cash!.workingCap)} − ${n0(-D.cash!.capex)} = ${n0(freeCash(D.cash!))}. ${n0(operatingCash(D.cash!))} is operating cash flow — before the investment in equipment.`)),
    q('p3-current', 'P3', {
      type: 'table', title: L(`${B.name.he} · שוטף · ${MILLIONS.he}`, `${B.name.en} · current items · ${MILLIONS.en}`),
      columns: [L('שורה', 'Line'), L('סכום', 'Amount')],
      rows: [
        { label: L('מזומן', 'Cash'), cells: [n0(bB.cash)] },
        { label: L('לקוחות ומלאי', 'Receivables and inventory'), cells: [n0(bB.receivables)] },
        { label: L('התחייבויות שוטפות', 'Current liabilities'), cells: [n0(bB.currentLiab)] }
      ]
    }, 'beginner',
      L(`מה היחס השוטף של ${B.name.he}?`, `What is ${B.name.en}'s current ratio?`),
      nums([crB.toFixed(2), (1 / crB).toFixed(2), (bB.cash / bB.currentLiab).toFixed(2), (totalAssets(bB) / bB.currentLiab).toFixed(2)]), 'a',
      L(`${ltr(`(${n0(bB.cash)} + ${n0(bB.receivables)}) ÷ ${n0(bB.currentLiab)} = ${crB.toFixed(2)}`)} — קצת פחות מ־${A.name.he} (${crA.toFixed(2)}). לשנה הקרובה יש לה כרית; הבעיה שלה, כפי שתראו, היא החוב לזמן ארוך.`,
        `(${n0(bB.cash)} + ${n0(bB.receivables)}) ÷ ${n0(bB.currentLiab)} = ${crB.toFixed(2)} — a little below ${A.name.en} (${crA.toFixed(2)}). For the coming year it has a cushion; its problem, as you will see, is the long-term debt.`))
  ]
};

export const FUNDAMENTALS_1 = [P1, P2, P3];
