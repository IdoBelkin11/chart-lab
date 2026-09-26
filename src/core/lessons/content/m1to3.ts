// ---------------------------------------------------------------------------
// Macro, module 1 — the economy: M1 (interest rates, the price of money),
// M2 (inflation, GDP and unemployment; the central bank's reaction), M3
// (recessions, fiscal policy and market cycles).
//
// Sources: the approved curriculum (step outline, knowledge-base topics).
// Builds on R3 (compounding) and P9 (a value is future cash, discounted) —
// here the discount rate is the thing that moves. Bonds in depth are M4's.
// Every number comes from @core/macro/scenarios, apart from the rounded,
// labelled facts about 2022.
// ---------------------------------------------------------------------------
import type { Diagram, LessonContent } from './types';
import {
  RATE_LEVELS, SAVINGS, MORTGAGE, M1_BOND, STEADY, GROWTH, M1_SHORT_LONG, bondPrice, monthlyPayment, pv,
  TARGET, BASKET, M2_INFLATION, M2_YEARS, HISTORY_2022, M2_MONTHS, M2_CPI, M2_RATE, M2_START, M2_REAL, M2_HOT, M2_SLOW, realValue,
  M3_GDP, M3_INDEX, recessionOf
} from '@core/macro/scenarios';
import { L, ltr, n0, n1, pc, nums, mq, change, sp } from './macroKit';

// ---------- M1 · interest rates: the price of money ----------
const [LO, MID, HI] = RATE_LEVELS;
const pay = (r: number) => monthlyPayment(MORTGAGE.principal, r, MORTGAGE.years);
const bond = (r: number) => bondPrice(M1_BOND.face, M1_BOND.coupon, M1_BOND.years, r);
const steady = (r: number) => pv(STEADY, r), growth = (r: number) => pv(GROWTH, r);
const f1 = (r: number) => (1 + r / 100).toFixed(2);
const coupon = (M1_BOND.face * M1_BOND.coupon) / 100;
/** Each line's move when the rate goes from the lowest level to the highest, %. */
const moves = { save: change(LO, HI), mortgage: change(pay(LO), pay(HI)), bond: change(bond(LO), bond(HI)), steady: change(steady(LO), steady(HI)), growth: change(growth(LO), growth(HI)) };
const shortP = (r: number) => bondPrice(1000, M1_SHORT_LONG.coupon, M1_SHORT_LONG.short, r);
const longP = (r: number) => bondPrice(1000, M1_SHORT_LONG.coupon, M1_SHORT_LONG.long, r);

const m1Flow: Diagram = { type: 'flow', title: L('איך ריבית מגיעה לכולם', 'How a rate reaches everyone'), stages: [
  { label: L('הבנק המרכזי', 'The central bank'), sub: L('קובע את ריבית המדיניות — המחיר של כסף לטווח קצר', 'Sets the policy rate — the price of short-term money') },
  { label: L('הבנקים', 'The banks'), sub: L('מתמחרים לפיה הלוואות, משכנתאות ופיקדונות', 'Price loans, mortgages and deposits off it') },
  { label: L('משקי בית וחברות', 'Households and companies'), sub: L('לווים, חוסכים, צורכים ומשקיעים — יותר או פחות', 'Borrow, save, spend and invest — more or less') },
  { label: L('מחירי נכסים', 'Asset prices'), sub: L('אג״ח ומניות מתמחרים מחדש את הכסף העתידי', 'Bonds and stocks reprice future money') }
] };
const payTable = (rates: readonly number[]): Diagram => ({ type: 'table', title: L('חוסכים ולווים', 'Savers and borrowers'), columns: [L('ריבית', 'Rate'), L(`ריבית בשנה על ${n0(SAVINGS)} בפיקדון`, `Yearly interest on ${n0(SAVINGS)} on deposit`), L(`החזר חודשי: משכנתא של ${n0(MORTGAGE.principal)}, ${MORTGAGE.years} שנה`, `Monthly payment: a ${n0(MORTGAGE.principal)} mortgage, ${MORTGAGE.years} years`)],
  rows: rates.map((r) => ({ label: L(pc(r, 0), pc(r, 0)), cells: [n0((SAVINGS * r) / 100), n0(pay(r))] })) });
const bondBars: Diagram = { type: 'bars', title: L(`אג״ח קיים: קופון ${M1_BOND.coupon}%, ${M1_BOND.years} שנים, ערך נקוב ${n0(M1_BOND.face)}`, `An existing bond: ${M1_BOND.coupon}% coupon, ${M1_BOND.years} years, ${n0(M1_BOND.face)} face value`),
  bars: RATE_LEVELS.map((r, i) => ({ label: L(`ריבית בשוק ${r}%`, `Market rate ${r}%`), value: bond(r), tone: (['ok', 'info', 'err'] as const)[i]!, shown: L(n1(bond(r)), n1(bond(r))) })),
  caption: L('אותו אג״ח, אותם תשלומים — רק הריבית בשוק משתנה.', 'The same bond, the same payments — only the market rate changes.') };
const valueRow = (id: 'bond' | 'steady' | 'growth', label: ReturnType<typeof L>, value: (r: number) => number, why: ReturnType<typeof L>, formula: (r: number) => string) => ({
  id, label, why,
  values: Object.fromEntries(RATE_LEVELS.map((r) => [String(r), n0(value(r))])),
  formula: Object.fromEntries(RATE_LEVELS.map((r) => [String(r), formula(r)])),
  share: Object.fromEntries(RATE_LEVELS.map((r) => [String(r), (value(r) / value(LO)) * 100]))
});

export const M1: LessonContent = {
  id: 'M1',
  tutor: { topic: 'interest-rate', label: L('ריבית', 'interest rates') },
  teach: [
    {
      heading: L('ריבית היא מחיר הכסף', 'Interest is the price of money'),
      paragraphs: [
        L('ריבית היא המחיר של שימוש בכסף של מישהו אחר לאורך זמן. מי שלווה משלם אותה; מי שמלווה — או מפקיד בבנק — מקבל אותה. כמו כל מחיר, כשהיא עולה משתמשים בכסף פחות, וכשהיא יורדת — יותר.',
          'Interest is the price of using someone else\'s money over time. Whoever borrows pays it; whoever lends — or deposits at a bank — receives it. Like any price, when it rises people use money less, and when it falls — more.'),
        L('את הריבית הבסיסית במשק קובע הבנק המרכזי: בנק ישראל בישראל, הפדרל ריזרב (הפד) בארה״ב. זו ריבית לטווח קצר, אבל הבנקים מתמחרים לפיה כמעט הכול — הלוואות, משכנתאות בריבית משתנה ופיקדונות. כך החלטה אחת מגיעה לכל משק בית ולכל חברה.',
          'The economy\'s base rate is set by the central bank: the Bank of Israel in Israel, the Federal Reserve (the Fed) in the US. It is a short-term rate, but banks price almost everything off it — loans, variable-rate mortgages and deposits. That is how one decision reaches every household and every company.'),
        L('ומשם — לשוק. ערך של אג״ח או של מניה הוא הכסף שהם יחזירו בעתיד, מתורגם להיום. כמה שווה היום כסף שיגיע בעוד עשר שנים? זה תלוי בריבית: ככל שהיא גבוהה יותר, כסף עתידי שווה היום פחות. לכן כשהבנק המרכזי מדבר, כל השוק מקשיב.',
          'And from there — to the market. The value of a bond or a stock is the money it will return in the future, translated to today. What is money arriving in ten years worth today? That depends on the rate: the higher it is, the less future money is worth today. That is why, when the central bank speaks, the whole market listens.')
      ],
      callouts: [{ kind: 'example', lead: L('כלל אצבע', 'Rule of thumb'), text: L('ריבית גבוהה: כסף היום שווה יותר מכסף מחר. ריבית נמוכה: ההבדל קטן.', 'High rates: money today is worth more than money tomorrow. Low rates: the difference is small.') }],
      work: { kind: 'diagram', diagram: m1Flow }
    },
    {
      heading: L('לווים וחוסכים', 'Borrowers and savers'),
      paragraphs: [
        L(`אותה ריבית, שני צדדים. מי שמחזיק ${n0(SAVINGS)} בפיקדון מקבל ${n0((SAVINGS * LO) / 100)} בשנה בריבית של ${LO}%, ו־${n0((SAVINGS * HI) / 100)} בריבית של ${HI}%. בשבילו, עליית ריבית היא חדשות טובות.`,
          `The same rate, two sides. Someone with ${n0(SAVINGS)} on deposit receives ${n0((SAVINGS * LO) / 100)} a year at ${LO}%, and ${n0((SAVINGS * HI) / 100)} at ${HI}%. For them, a rate rise is good news.`),
        L(`מי שלקח משכנתא של ${n0(MORTGAGE.principal)} ל־${MORTGAGE.years} שנה בריבית משתנה רואה את הצד השני: ההחזר החודשי עולה מ־${n0(pay(LO))} ל־${n0(pay(HI))} — ${pc(moves.mortgage, 0)} יותר, על אותה דירה בדיוק. בריבית קבועה ההחזר לא זז, אבל מי שלווה עכשיו משלם את המחיר החדש.`,
          `Someone with a ${n0(MORTGAGE.principal)} variable-rate mortgage over ${MORTGAGE.years} years sees the other side: the monthly payment rises from ${n0(pay(LO))} to ${n0(pay(HI))} — ${pc(moves.mortgage, 0)} more, for exactly the same flat. At a fixed rate the payment does not move, but whoever borrows now pays the new price.`),
        L('וזה בדיוק המנגנון שהבנק המרכזי מפעיל: ריבית גבוהה גורמת ללוות פחות ולחסוך יותר, ולכן מאטה צריכה והשקעה. ריבית נמוכה עושה את ההפך. בשיעור הבא נראה למה הוא רוצה לפעמים להאט את המשק בכוונה.',
          'And that is exactly the lever the central bank pulls: high rates make people borrow less and save more, and so slow spending and investment. Low rates do the opposite. The next lesson shows why it sometimes wants to slow the economy on purpose.')
      ],
      work: { kind: 'diagram', diagram: payTable(RATE_LEVELS) }
    },
    {
      heading: L('אג״ח קיים: הנדנדה', 'An existing bond: the seesaw'),
      paragraphs: [
        L(`אג״ח היא הלוואה שאתם נותנים: היא משלמת ריבית קבועה (קופון) ומחזירה את הקרן בסוף. האג״ח כאן הונפק כשהריבית בשוק הייתה ${MID}%: הוא משלם ${n0(coupon)} בשנה על ${n0(M1_BOND.face)}, במשך ${M1_BOND.years} שנים.`,
          `A bond is a loan you give: it pays a fixed interest (the coupon) and returns the principal at the end. The bond here was issued when the market rate was ${MID}%: it pays ${n0(coupon)} a year on ${n0(M1_BOND.face)}, for ${M1_BOND.years} years.`),
        L(`עכשיו הריבית בשוק עולה ל־${HI}%. אג״ח חדש משלם ${HI}% — אז אף אחד לא ישלם ${n0(M1_BOND.face)} על הישן, שמשלם רק ${M1_BOND.coupon}%. המחיר שלו יורד עד שהתשואה ממנו משתווה לשוק: ${ltr(n1(bond(HI)))}, ירידה של ${pc(-change(bond(MID), bond(HI)))}. וכשהריבית יורדת ל־${LO}%, הקופון הישן פתאום אטרקטיבי, והמחיר עולה ל־${ltr(n1(bond(LO)))}.`,
          `Now the market rate rises to ${HI}%. A new bond pays ${HI}% — so nobody will pay ${n0(M1_BOND.face)} for the old one, which pays only ${M1_BOND.coupon}%. Its price falls until the return on it matches the market: ${n1(bond(HI))}, a fall of ${pc(-change(bond(MID), bond(HI)))}. And when the rate falls to ${LO}%, the old coupon is suddenly attractive, and the price rises to ${n1(bond(LO))}.`),
        L('זו הנדנדה: ריבית עולה — מחירי אג״ח קיימים יורדים; ריבית יורדת — הם עולים. והיא לא שייכת רק לאג״ח: גם מניה שווה את הרווחים שהחברה תחזיר בעתיד, ואותו חישוב חל עליה. את זה תבדקו עכשיו בעצמכם.',
          'That is the seesaw: rates up — existing bond prices down; rates down — they rise. And it is not only about bonds: a stock is also worth the profits the company will return in the future, and the same calculation applies to it. You will test that yourself now.')
      ],
      work: { kind: 'diagram', diagram: bondBars }
    }
  ],
  charts: [],
  activity: {
    kind: 'explore',
    prompt: L('הזיזו את הריבית', 'Move the rate'),
    task: L(`עברו בין ריבית של ${LO}%, ${MID}% ו־${HI}%, ולחצו על כל שורה כדי לראות איך היא מחושבת. ואז: בריבית של ${HI}%, מצאו את השורה שאיבדה את החלק הגדול ביותר מערכה ביחס ל־${LO}%.`,
      `Switch between rates of ${LO}%, ${MID}% and ${HI}%, and click each line to see how it is worked out. Then: at ${HI}%, find the line that lost the largest share of its value compared with ${LO}%.`),
    title: L('אותה ריבית, חמישה דברים', 'One rate, five things'),
    datasets: RATE_LEVELS.map((r) => ({ key: String(r), label: L(`${r}%`, `${r}%`) })),
    datasetsLabel: L('רמת הריבית', 'Rate level'),
    rows: [
      { id: 'save', label: L(`ריבית בשנה על ${n0(SAVINGS)} בפיקדון`, `Yearly interest on ${n0(SAVINGS)} on deposit`),
        values: Object.fromEntries(RATE_LEVELS.map((r) => [String(r), n0((SAVINGS * r) / 100)])),
        formula: Object.fromEntries(RATE_LEVELS.map((r) => [String(r), `${n0(SAVINGS)} × ${r}% = ${n0((SAVINGS * r) / 100)}`])),
        why: L('החוסכים: כל עלייה בריבית מגדילה את מה שהכסף שלהם מרוויח בפיקדון.', 'Savers: every rise in the rate adds to what their money earns on deposit.') },
      { id: 'mortgage', label: L('החזר חודשי על משכנתא בריבית משתנה', 'Monthly payment on a variable-rate mortgage'),
        values: Object.fromEntries(RATE_LEVELS.map((r) => [String(r), n0(pay(r))])),
        formula: Object.fromEntries(RATE_LEVELS.map((r) => [String(r), `P ${n0(MORTGAGE.principal)} · ${r}% ÷ 12 · ${MORTGAGE.years * 12} → ${n0(pay(r))}`])),
        why: L(`הלווים: ${n0(MORTGAGE.principal)} ל־${MORTGAGE.years} שנה. כשהריבית עולה, אותה הלוואה עולה יותר בכל חודש.`, `Borrowers: ${n0(MORTGAGE.principal)} over ${MORTGAGE.years} years. When the rate rises, the same loan costs more every month.`) },
      valueRow('bond', L(`שווי אג״ח קיים (קופון ${M1_BOND.coupon}%, ${M1_BOND.years} שנים)`, `Value of an existing bond (${M1_BOND.coupon}% coupon, ${M1_BOND.years} years)`), bond,
        L(`${n0(coupon)} בשנה ו־${n0(M1_BOND.face)} בסוף, מתורגמים להיום לפי הריבית בשוק. ריבית גבוהה יותר — כל תשלום שווה פחות היום.`, `${n0(coupon)} a year and ${n0(M1_BOND.face)} at the end, translated to today at the market rate. A higher rate — every payment is worth less today.`),
        (r) => `Σ ${n0(coupon)} ÷ ${f1(r)}^t + ${n0(M1_BOND.face)} ÷ ${f1(r)}^${M1_BOND.years} = ${n1(bond(r))}`),
      valueRow('steady', L('שווי חברה יציבה: 100 בשנה, 10 שנים', 'Value of a steady company: 100 a year for 10 years'), steady,
        L('רווחים שמגיעים כבר מהשנה הקרובה. הם מתורגמים להיום לאורך זמן קצר יחסית, ולכן הריבית פוגעת בהם פחות.', 'Profits that arrive from next year on. They are translated to today over a fairly short time, so the rate hurts them less.'),
        (r) => `Σ 100 ÷ ${f1(r)}^t, t = 1…10 = ${n0(steady(r))}`),
      valueRow('growth', L('שווי חברת צמיחה: 300 בשנה, רק בשנים 11–20', 'Value of a growth company: 300 a year, only in years 11–20'), growth,
        L('רוב הערך רחוק: הרווחים מתחילים רק בעוד עשר שנים. כל תשלום מחולק בריבית פעמים רבות, ולכן כל עלייה בריבית נחתכת בו חזק.', 'Most of the value is far away: the profits only start in ten years. Every payment is divided by the rate many times over, so each rise in the rate cuts it hard.'),
        (r) => `Σ 300 ÷ ${f1(r)}^t, t = 11…20 = ${n0(growth(r))}`)
    ],
    sharesTitle: L(`שווי, באחוזים מהשווי בריבית של ${LO}%`, `Worth, as % of its value at ${LO}%`),
    target: { dataset: String(HI), row: 'growth' },
    right: L(`חברת הצמיחה: מ־${n0(growth(LO))} ל־${n0(growth(HI))}, ${pc(moves.growth)}. האג״ח ירד ${pc(moves.bond)} והחברה היציבה ${pc(moves.steady)}. ככל שהכסף רחוק יותר, הריבית פוגעת בו יותר.`,
      `The growth company: from ${n0(growth(LO))} to ${n0(growth(HI))}, ${pc(moves.growth)}. The bond fell ${pc(moves.bond)} and the steady company ${pc(moves.steady)}. The further away the money, the harder the rate hits it.`),
    off: L(`עוד לא. בחרו בריבית של ${HI}%, והשוו כל שורה לערכה ב־${LO}% — לא בשקלים, אלא באחוזים. הפסים מימין עוזרים.`, `Not yet. Choose the ${HI}% rate, and compare each line with its value at ${LO}% — not in money, in percent. The bars beside the table help.`),
    explain: [
      L(`מי הרוויח ומי הפסיד מהמעבר מ־${LO}% ל־${HI}%: החוסכים הרוויחו — פי ${n0(HI / LO)} ריבית על אותו פיקדון. הלווים בריבית משתנה הפסידו — ${pc(moves.mortgage, 0)} יותר בכל חודש. ומחזיקי הנכסים הקיימים הפסידו, כל אחד לפי כמה רחוק הכסף שלו: האג״ח ${pc(moves.bond)}, החברה היציבה ${pc(moves.steady)}, חברת הצמיחה ${pc(moves.growth)}.`,
        `Who won and who lost from the move from ${LO}% to ${HI}%: savers won — ${n0(HI / LO)} times the interest on the same deposit. Variable-rate borrowers lost — ${pc(moves.mortgage, 0)} more every month. And holders of existing assets lost, each according to how far away its money is: the bond ${pc(moves.bond)}, the steady company ${pc(moves.steady)}, the growth company ${pc(moves.growth)}.`),
      L('זו הסיבה שמניות צמיחה וטכנולוגיה נוטות להיות הרגישות ביותר לריבית, ושכל השוק זז יחד כשהבנק המרכזי מפתיע. המספרים כאן להמחשה, והמציאות מורכבת יותר — אבל הכיוון הוא אותו כיוון.',
        'That is why growth and technology stocks tend to be the most sensitive to rates, and why the whole market moves together when the central bank surprises. The numbers here are illustrative, and reality is more complicated — but the direction is the same.')
    ]
  },
  apply: mq('m1-apply', 'M1', { type: 'table', title: L(`שני אג״ח, קופון ${M1_SHORT_LONG.coupon}% לשניהם`, `Two bonds, both paying ${M1_SHORT_LONG.coupon}%`), columns: [L('אג״ח', 'Bond'), L('שנים לפדיון', 'Years to maturity'), L(`מחיר בריבית ${M1_SHORT_LONG.from}%`, `Price at ${M1_SHORT_LONG.from}%`)], rows: [
    { label: L('א', 'A'), cells: [String(M1_SHORT_LONG.short), n1(shortP(M1_SHORT_LONG.from))] },
    { label: L('ב', 'B'), cells: [String(M1_SHORT_LONG.long), n1(longP(M1_SHORT_LONG.from))] }
  ] }, 'intermediate',
    L(`הריבית בשוק עולה מ־${M1_SHORT_LONG.from}% ל־${M1_SHORT_LONG.to}%. מחיר של איזה אג״ח ירד יותר?`, `The market rate rises from ${M1_SHORT_LONG.from}% to ${M1_SHORT_LONG.to}%. Which bond\'s price falls more?`),
    [['a', L(`ב — ${M1_SHORT_LONG.long} שנים`, `B — ${M1_SHORT_LONG.long} years`)], ['b', L(`א — ${M1_SHORT_LONG.short} שנים`, `A — ${M1_SHORT_LONG.short} years`)], ['c', L('אותו דבר — לשניהם אותו קופון', 'The same — they have the same coupon')], ['d', L('אף אחד — הקופון קבוע', 'Neither — the coupon is fixed')]], 'a',
    L(`א יורד ל־${n1(shortP(M1_SHORT_LONG.to))} (${pc(change(shortP(M1_SHORT_LONG.from), shortP(M1_SHORT_LONG.to)))}); ב יורד ל־${n1(longP(M1_SHORT_LONG.to))} (${pc(change(longP(M1_SHORT_LONG.from), longP(M1_SHORT_LONG.to)))}). הארוך תקוע עם הקופון הנמוך הרבה יותר שנים — אותו רעיון כמו חברת הצמיחה. בשיעור על אג״ח זה יקבל שם: משך (Duration).`,
      `A falls to ${n1(shortP(M1_SHORT_LONG.to))} (${pc(change(shortP(M1_SHORT_LONG.from), shortP(M1_SHORT_LONG.to)))}); B falls to ${n1(longP(M1_SHORT_LONG.to))} (${pc(change(longP(M1_SHORT_LONG.from), longP(M1_SHORT_LONG.to)))}). The long one is stuck with the low coupon for many more years — the same idea as the growth company. The lesson on bonds gives it a name: duration.`)),
  takeaway: {
    bottomLine: L('ריבית היא מחיר הכסף, והבנק המרכזי קובע את הבסיס שלה. כשהיא עולה: חוסכים מרוויחים, לווים משלמים יותר, ואג״ח ומניות קיימים שווים פחות — ויותר מכולם, מה שהכסף שלו רחוק.', 'Interest is the price of money, and the central bank sets its base. When it rises: savers gain, borrowers pay more, and existing bonds and stocks are worth less — most of all, whatever pays its money far in the future.'),
    caveat: L('השוק מגיב לשינוי ביחס למה שציפו לו, לא לשינוי עצמו — העלאה שכולם ציפו לה כבר מגולמת במחיר. על זה בשיעור האחרון במסלול.', 'The market reacts to a change relative to what was expected, not to the change itself — a rise everyone expected is already priced in. That is the track\'s last lesson.')
  },
  questions: [
    mq('m1-seesaw', 'M1', { type: 'table', title: L('אג״ח שכבר מחזיקים', 'A bond you already hold'), columns: [L('נתון', 'Figure'), L('ערך', 'Value')], rows: [
      { label: L('הקופון של האג״ח שלכם', 'Your bond\'s coupon'), cells: [pc(M1_BOND.coupon, 0)] },
      { label: L('ריבית על אג״ח חדש, היום', 'Rate on a new bond, today'), cells: [pc(HI, 0)] }
    ] }, 'beginner', L('מה קורה למחיר של האג״ח שלכם?', 'What happens to your bond\'s price?'),
      [['a', L(`יורד מתחת ל־${n0(M1_BOND.face)}`, `It falls below ${n0(M1_BOND.face)}`)], ['b', L(`עולה מעל ${n0(M1_BOND.face)}`, `It rises above ${n0(M1_BOND.face)}`)], ['c', L(`נשאר ${n0(M1_BOND.face)} — הקופון קבוע`, `It stays at ${n0(M1_BOND.face)} — the coupon is fixed`)], ['d', L('תלוי רק ברווחי החברה', 'It depends only on the issuer\'s profits')]], 'a',
      L(`מי שקונה היום יכול לקבל ${HI}% באג״ח חדש, אז ישלם על שלכם רק מחיר שנותן לו תשואה דומה. ל־${M1_BOND.years} שנים: ${n1(bond(HI))}. הקופון קבוע — המחיר לא.`, `A buyer today can get ${HI}% on a new bond, so will pay for yours only a price that gives a similar return. For ${M1_BOND.years} years: ${n1(bond(HI))}. The coupon is fixed — the price is not.`)),
    mq('m1-mortgage', 'M1', payTable([LO, HI]), 'beginner', L(`בכמה עלה ההחזר החודשי כשהריבית עלתה מ־${LO}% ל־${HI}%?`, `By how much did the monthly payment rise when the rate went from ${LO}% to ${HI}%?`),
      nums([pc(moves.mortgage, 0), pc(HI - LO, 0), pc(change(LO, HI), 0), pc(change(pay(MID), pay(HI)), 0)]), 'a',
      L(`${ltr(`${n0(pay(HI))} ÷ ${n0(pay(LO))} − 1 = ${pc(moves.mortgage, 0)}`)}. הריבית עלתה ב־${HI - LO} נקודות אחוז, אבל ההחזר לא עולה באותו שיעור — הוא תלוי גם בהחזר הקרן.`, `${n0(pay(HI))} ÷ ${n0(pay(LO))} − 1 = ${pc(moves.mortgage, 0)}. The rate rose ${HI - LO} percentage points, but the payment does not rise by the same proportion — it also includes paying back the principal.`)),
    mq('m1-growth', 'M1', { type: 'bars', title: L(`כמה מהשווי נמחק, ריבית ${LO}% ← ${HI}%`, `How much value is lost, rate ${LO}% → ${HI}%`), bars: [
      { label: L('חברה יציבה', 'Steady company'), value: -moves.steady, tone: 'info', shown: L(pc(moves.steady), pc(moves.steady)) },
      { label: L('אג״ח ל־10 שנים', '10-year bond'), value: -moves.bond, tone: 'learn', shown: L(pc(moves.bond), pc(moves.bond)) },
      { label: L('חברת צמיחה', 'Growth company'), value: -moves.growth, tone: 'err', shown: L(pc(moves.growth), pc(moves.growth)) }
    ] }, 'intermediate', L('למה חברת הצמיחה איבדה הכי הרבה?', 'Why did the growth company lose the most?'),
      [['a', L('רוב הרווחים שלה רחוקים בעתיד, והריבית מקטינה כסף רחוק יותר מכסף קרוב', 'Most of its profits are far in the future, and the rate shrinks distant money more than near money')], ['b', L('יש לה יותר חוב', 'It has more debt')], ['c', L('הרווחים שלה יורדים כשהריבית עולה', 'Its profits fall when rates rise')], ['d', L('חברות צמיחה משלמות ריבית גבוהה יותר', 'Growth companies pay a higher interest rate')]], 'a',
      L('בדוגמה הרווחים לא השתנו כלל — רק הריבית שבה מתרגמים אותם להיום. תשלום בעוד 15 שנה מחולק בריבית 15 פעמים, ולכן כל עלייה בה מקטינה אותו הרבה יותר מתשלום בעוד שנה.', 'In the example the profits did not change at all — only the rate at which they are translated to today. A payment in 15 years is divided by the rate 15 times over, so each rise in it shrinks that payment far more than a payment next year.'))
  ]
};

// ---------- M2 · inflation, GDP and unemployment ----------
const [INF_LO, INF_HI] = M2_INFLATION;
const MONTHS = Array.from({ length: M2_MONTHS }, (_, i) => String(i + 1));
const peak = M2_CPI.indexOf(Math.max(...M2_CPI));
const rateTop = M2_RATE.indexOf(Math.max(...M2_RATE));
const realAtPeak = M2_RATE[peak]! - M2_CPI[peak]!;
const month = (i: number) => i + 1;
const m2Lines = (marks: boolean): Diagram => ({
  type: 'lines', title: L('אינפלציה וריבית, חודש אחר חודש', 'Inflation and the policy rate, month by month'), x: MONTHS, xTitle: L('חודש', 'Month'), unit: '%',
  series: [{ label: L('אינפלציה (שיעור שנתי)', 'Inflation (yearly rate)'), tone: 'err', values: M2_CPI }, { label: L('ריבית הבנק המרכזי', 'Central bank rate'), tone: 'info', values: M2_RATE }],
  ticks: [0, 5, 11, 17, 23, 29, 35], ref: { value: TARGET, label: L(`יעד: ${TARGET}%`, `Target: ${TARGET}%`) },
  ...(marks ? { marks: [{ at: peak, series: 0, label: L(`שיא: ${pc(M2_CPI[peak]!)}`, `Peak: ${pc(M2_CPI[peak]!)}`) }, { at: M2_START, series: 1, label: L('העלאה ראשונה', 'First rise') }] } : {}),
  caption: L('כלכלה להמחשה, לא נתונים של מדינה מסוימת.', 'An illustrative economy, not any country\'s data.')
});
const powerBars = (rates: readonly number[]): Diagram => ({ type: 'bars', title: L(`מה קונים ב־${BASKET} אחרי ${M2_YEARS} שנים, בכסף של היום`, `What ${BASKET} buys after ${M2_YEARS} years, in today's money`), bars: [
  { label: L('היום', 'Today'), value: BASKET, tone: 'muted', shown: L(n1(BASKET), n1(BASKET)) },
  ...rates.map((r, i) => ({ label: L(`אינפלציה ${r}% בשנה`, `Inflation ${r}% a year`), value: realValue(BASKET, r, M2_YEARS), tone: (['info', 'err'] as const)[i]!, shown: L(n1(realValue(BASKET, r, M2_YEARS)), n1(realValue(BASKET, r, M2_YEARS))) }))
] });

export const M2: LessonContent = {
  id: 'M2',
  tutor: { topic: 'inflation', label: L('אינפלציה', 'inflation') },
  teach: [
    {
      heading: L('אינפלציה: הכסף קונה פחות', 'Inflation: money buys less'),
      paragraphs: [
        L(`אינפלציה היא עלייה כללית במחירים — לא של מוצר אחד, אלא של סל שלם. מודדים אותה במדד המחירים לצרכן (CPI): בכמה התייקר הסל לעומת שנה קודם. באינפלציה של ${INF_LO}% בשנה, מה שעולה היום ${BASKET} ייקנה בעוד ${M2_YEARS} שנים רק ב־${n1(realValue(BASKET, INF_LO, M2_YEARS))} מהכסף של היום; ב־${INF_HI}% — רק ב־${n1(realValue(BASKET, INF_HI, M2_YEARS))}.`,
          `Inflation is a general rise in prices — not of one product, but of a whole basket. It is measured by the consumer price index (CPI): how much more the basket costs than a year earlier. At ${INF_LO}% inflation a year, what costs ${BASKET} today is worth only ${n1(realValue(BASKET, INF_LO, M2_YEARS))} of today's money in ${M2_YEARS} years; at ${INF_HI}% — only ${n1(realValue(BASKET, INF_HI, M2_YEARS))}.`),
        L(`רוב הבנקים המרכזיים מכוונים לאינפלציה נמוכה ויציבה — בסביבות ${TARGET}% בשנה (בנק ישראל: טווח של 1% עד 3%). מעט אינפלציה נחשב בריא; הרבה אינפלציה שוחקת חסכונות ומשכורות, ומקשה לתכנן.`,
          `Most central banks aim for low, stable inflation — around ${TARGET}% a year (the Bank of Israel: a range of 1% to 3%). A little inflation is considered healthy; a lot erodes savings and wages, and makes planning hard.`),
        L('לצד האינפלציה עוקבים אחרי שני מספרים נוספים. התוצר (תמ״ג) הוא הערך של כל הסחורות והשירותים שהמשק מייצר; הקצב שבו הוא גדל הוא הצמיחה. והאבטלה היא שיעור האנשים שמחפשים עבודה ולא מוצאים. יחד הם עונים על שאלה אחת: עד כמה המשק "חם" — וזה מה שהבנק המרכזי שואל לפני כל החלטה.',
          'Alongside inflation, two more numbers are watched. Gross domestic product (GDP) is the value of all the goods and services the economy produces; the pace at which it grows is growth. And unemployment is the share of people who are looking for work and cannot find it. Together they answer one question: how "hot" the economy runs — and that is what the central bank asks before every decision.')
      ],
      work: { kind: 'diagram', diagram: powerBars(M2_INFLATION) }
    },
    {
      heading: L('הבנק המרכזי מגיב', 'The central bank reacts'),
      paragraphs: [
        L('כשהאינפלציה עולה הרבה מעל היעד, הבנק המרכזי מעלה ריבית. זה המנגנון מהשיעור הקודם: הלוואות מתייקרות, חיסכון משתלם יותר, ולכן אנשים וחברות מוציאים פחות. כשהביקוש נחלש, קשה יותר להעלות מחירים — והאינפלציה יורדת.',
          'When inflation rises well above the target, the central bank raises rates. That is the mechanism from the last lesson: loans cost more, saving pays better, and so people and companies spend less. When demand weakens, raising prices is harder — and inflation falls.'),
        L('למחיר הזה יש צד שני: משק שמאט יכול לפטר עובדים, והאבטלה עולה. לכן בשפל הבנק עושה את ההפך — מוריד ריבית כדי לעודד הלוואות, צריכה והשקעה. חלק מהבנקים המרכזיים מחויבים ליציבות מחירים בלבד; הפד בארה״ב מחויב גם לתעסוקה.',
          'That price has a second side: an economy that slows can lay people off, and unemployment rises. So in a slump the bank does the opposite — it cuts rates to encourage borrowing, spending and investment. Some central banks are bound only to price stability; the Fed in the US is bound to employment too.'),
        L(`ההבדל בין הריבית לאינפלציה נקרא הריבית הריאלית. ריבית של ${pc(M2_REAL.rate, 0)} כשהאינפלציה ${pc(M2_REAL.inflation, 0)} היא בפועל ${pc(M2_REAL.rate - M2_REAL.inflation, 0)}: הכסף בפיקדון מאבד כוח קנייה. כל עוד הריבית הריאלית שלילית, הבנק עדיין לא ממש מאט את המשק.`,
          `The difference between the rate and inflation is the real rate. A ${pc(M2_REAL.rate, 0)} rate when inflation is ${pc(M2_REAL.inflation, 0)} is really ${pc(M2_REAL.rate - M2_REAL.inflation, 0)}: money on deposit loses buying power. As long as the real rate is negative, the bank is not yet really slowing the economy.`)
      ],
      work: { kind: 'diagram', diagram: { type: 'flow', title: L('כשהאינפלציה גבוהה מדי', 'When inflation is too high'), stages: [
        { label: L('אינפלציה מעל היעד', 'Inflation above target'), sub: L('המחירים עולים מהר מדי', 'Prices rise too fast') },
        { label: L('הבנק מעלה ריבית', 'The bank raises rates'), sub: L('כסף מתייקר', 'Money costs more') },
        { label: L('הביקוש נחלש', 'Demand weakens'), sub: L('פחות הלוואות, צריכה והשקעה', 'Less borrowing, spending and investment') },
        { label: L('האינפלציה יורדת', 'Inflation falls'), sub: L('באיחור של חודשים רבים', 'Many months later') }
      ] } }
    },
    {
      heading: L('2022: כשהריבית עלתה מהר', '2022: when rates rose fast'),
      paragraphs: [
        L(`אחרי שנים של ריבית אפסית, האינפלציה בארה״ב טיפסה עד ${pc(HISTORY_2022.cpiPeak)} ב${HISTORY_2022.cpiPeakMonth.he} — הגבוהה מזה ארבעים שנה. הפד העלה ריבית ${HISTORY_2022.hikes} פעמים במהלך השנה, מ־${HISTORY_2022.rateFrom}% ל־${HISTORY_2022.rateTo}%. גם בנק ישראל ובנקים מרכזיים רבים אחרים העלו ריבית באותה שנה.`,
          `After years of near-zero rates, US inflation climbed to ${pc(HISTORY_2022.cpiPeak)} in ${HISTORY_2022.cpiPeakMonth.en} — the highest in forty years. The Fed raised rates ${HISTORY_2022.hikes} times during the year, from ${HISTORY_2022.rateFrom}% to ${HISTORY_2022.rateTo}%. The Bank of Israel and many other central banks raised rates that year too.`),
        L(`והשוק הגיב בדיוק לפי הנדנדה: מדד S&P 500 ירד בשנה כולה בכ־${Math.abs(HISTORY_2022.stocks)}%, ומדד רחב של אג״ח אמריקאיות ירד בכ־${Math.abs(HISTORY_2022.bonds)}%. ירידה משותפת כזו של מניות ואג״ח היא נדירה, והיא הכאיבה במיוחד למי שסמך על האג״ח שיבלמו את נפילת המניות — כי הפעם הסיבה הייתה הריבית עצמה, והיא פגעה בשניהם.`,
          `And the market reacted exactly by the seesaw: the S&P 500 fell about ${Math.abs(HISTORY_2022.stocks)}% over the year, and a broad index of US bonds fell about ${Math.abs(HISTORY_2022.bonds)}%. A joint fall like that in stocks and bonds is rare, and it hurt most those who relied on bonds to cushion falling stocks — because this time the cause was the rate itself, and it hit both.`),
        L('אלה נתונים היסטוריים, מעוגלים — לא תחזית. הם כאן כי הם מראים את כל השרשרת באמת: אינפלציה, תגובת הבנק, ומחירי הנכסים.',
          'These are historical figures, rounded — not a forecast. They are here because they show the whole chain for real: inflation, the bank\'s response, and asset prices.')
      ],
      work: { kind: 'diagram', diagram: { type: 'table', title: L('ארה״ב, 2022', 'The US, 2022'), badge: L('היסטורי, מעוגל', 'Historical, rounded'), columns: [L('נתון', 'Figure'), L('ערך', 'Value')], rows: [
        { label: L('אינפלציה בשיא', 'Inflation at its peak'), cells: [L(`${pc(HISTORY_2022.cpiPeak)} (${HISTORY_2022.cpiPeakMonth.he})`, `${pc(HISTORY_2022.cpiPeak)} (${HISTORY_2022.cpiPeakMonth.en})`)] },
        { label: L('ריבית הפד בתחילת השנה', 'Fed rate at the start of the year'), cells: [`${HISTORY_2022.rateFrom}%`] },
        { label: L('ריבית הפד בסוף השנה', 'Fed rate at the end of the year'), cells: [`${HISTORY_2022.rateTo}%`] },
        { label: L('S&P 500, השנה כולה', 'S&P 500, whole year'), cells: [`≈ ${pc(HISTORY_2022.stocks, 0)}`] },
        { label: L('אג״ח אמריקאיות (מדד רחב), השנה כולה', 'US bonds (broad index), whole year'), cells: [`≈ ${pc(HISTORY_2022.bonds, 0)}`] }
      ] } }
    }
  ],
  charts: [],
  activity: {
    kind: 'checklist',
    prompt: L('קראו את הגרף', 'Read the chart'),
    task: L('בגרף: אינפלציה וריבית של כלכלה להמחשה, לאורך שלוש שנים. ענו לפי הסדר.', 'In the chart: inflation and the policy rate of an illustrative economy over three years. Answer in order.'),
    diagram: m2Lines(false),
    items: [
      { id: 'peak', question: L('באיזה חודש האינפלציה הגיעה לשיא?', 'In which month did inflation peak?'),
        options: [M2_START, peak, rateTop, 29].map((i, k) => ({ key: 'abcd'[k]!, label: L(`חודש ${month(i)}`, `Month ${month(i)}`) })), correct: 'b',
        why: L(`חודש ${month(peak)}: ${pc(M2_CPI[peak]!)}. מכאן האינפלציה רק יורדת.`, `Month ${month(peak)}: ${pc(M2_CPI[peak]!)}. From here inflation only falls.`) },
      { id: 'late', question: L(`כשהבנק העלה ריבית לראשונה, בחודש ${month(M2_START)} — איפה הייתה האינפלציה?`, `When the bank first raised rates, in month ${month(M2_START)} — where was inflation?`),
        options: [{ key: 'above', label: L(`כבר הרבה מעל היעד: ${pc(M2_CPI[M2_START]!)}`, `Already well above target: ${pc(M2_CPI[M2_START]!)}`) }, { key: 'at', label: L('בדיוק ביעד', 'Right at the target') }, { key: 'below', label: L('מתחת ליעד', 'Below the target') }], correct: 'above',
        why: L(`האינפלציה עברה את היעד כבר בחודש ${month(M2_CPI.findIndex((x) => x > TARGET))}, והבנק התחיל רק כשהיא הייתה ${pc(M2_CPI[M2_START]!)}. בנקים מרכזיים מחכים לראות שהעלייה לא זמנית — ולכן מתחילים מאוחר.`, `Inflation passed the target as early as month ${month(M2_CPI.findIndex((x) => x > TARGET))}, and the bank only started when it was ${pc(M2_CPI[M2_START]!)}. Central banks wait to see that a rise is not temporary — and so start late.`) },
      { id: 'after', question: L('אחרי שהאינפלציה הגיעה לשיא, מה עשתה הריבית?', 'After inflation peaked, what did the rate do?'),
        options: [{ key: 'up', label: L(`המשיכה לעלות, עד חודש ${month(rateTop)}`, `Kept rising, until month ${month(rateTop)}`) }, { key: 'cut', label: L('ירדה מיד', 'Was cut at once') }, { key: 'flat', label: L('נשארה בדיוק כמו שהייתה', 'Stayed exactly where it was') }], correct: 'up',
        why: L(`הריבית עלתה עוד ${month(rateTop) - month(peak)} חודשים אחרי השיא. בזמן אמת אף אחד לא ידע שזה השיא — וגם כשרואים ירידה, הבנק רוצה להיות בטוח שהיא נמשכת.`, `The rate kept rising for ${month(rateTop) - month(peak)} months after the peak. At the time nobody knew it was the peak — and even when a fall shows, the bank wants to be sure it lasts.`) },
      { id: 'real', question: L(`מה הייתה הריבית הריאלית (ריבית פחות אינפלציה) בחודש ${month(peak)}?`, `What was the real rate (the rate minus inflation) in month ${month(peak)}?`),
        options: nums([pc(realAtPeak, 2), pc(-realAtPeak, 2), pc(M2_RATE[peak]!, 2), pc(0, 0)]).map(([key, label]) => ({ key, label })), correct: 'a',
        why: L(`${ltr(`${pc(M2_RATE[peak]!, 2)} − ${pc(M2_CPI[peak]!)} = ${pc(realAtPeak, 2)}`)}. גם אחרי חודשים של העלאות, הריבית הריאלית עוד הייתה שלילית: הכסף עדיין היה "זול".`, `${pc(M2_RATE[peak]!, 2)} − ${pc(M2_CPI[peak]!)} = ${pc(realAtPeak, 2)}. Even after months of rises, the real rate was still negative: money was still "cheap".`) }
    ],
    right: L('קראתם את הגרף נכון: הבנק התחיל מאוחר, העלה עוד אחרי השיא, והאינפלציה ירדה רק חודשים אחרי שהריבית התחילה לעלות.', 'You read the chart correctly: the bank started late, kept raising after the peak, and inflation fell only months after the rate began to rise.'),
    explain: [
      L('באיחור, תמיד. הנתונים מתארים את החודש שעבר ומתפרסמים שבועות אחריו, ולעיתים מתוקנים. וכשהבנק כבר פועל, לשינוי בריבית לוקח זמן רב — לעיתים קרובות שנה ויותר — לעבור דרך ההלוואות, הצריכה והמחירים. לכן הבנק מתחיל מאוחר ועוצר מאוחר.',
        'Always late. The data describes last month and comes out weeks later, and is sometimes revised. And once the bank acts, a rate change takes a long time — often a year or more — to work through loans, spending and prices. So the bank starts late and stops late.'),
      L('השוק, לעומת זאת, לא מחכה: הוא מנסה לנחש את ההחלטה הבאה ומתמחר אותה מראש. לכן מניות ואג״ח זזים כבר כשהאינפלציה מפתיעה — לא רק כשהבנק מודיע.',
        'The market, by contrast, does not wait: it tries to guess the next decision and prices it in advance. That is why stocks and bonds move as soon as inflation surprises — not only when the bank announces.')
    ]
  },
  apply: mq('m2-apply', 'M2', { type: 'table', title: L('משק בהאטה', 'An economy slowing down'), columns: [L('נתון', 'Figure'), L('ערך', 'Value')], rows: [
    { label: L('צמיחת התוצר, רבעון קודם', 'GDP growth, previous quarter'), cells: [sp(M2_SLOW.gdp[0]!)] },
    { label: L('צמיחת התוצר, רבעון אחרון', 'GDP growth, latest quarter'), cells: [sp(M2_SLOW.gdp[1]!)] },
    { label: L('אבטלה', 'Unemployment'), cells: [L(`${pc(M2_SLOW.unemploymentFrom, 0)} ← ${pc(M2_SLOW.unemploymentTo, 0)}`, `${pc(M2_SLOW.unemploymentFrom, 0)} → ${pc(M2_SLOW.unemploymentTo, 0)}`)] },
    { label: L('אינפלציה', 'Inflation'), cells: [pc(M2_SLOW.inflation)] }
  ] }, 'intermediate', L('מה סביר שהבנק המרכזי יעשה?', 'What is the central bank most likely to do?'),
    [['a', L('להוריד ריבית', 'Cut rates')], ['b', L('להעלות ריבית', 'Raise rates')], ['c', L('להעלות — האינפלציה עוד מעל 2%', 'Raise — inflation is still above 2%')], ['d', L('שום דבר — אין לו כלים במצב כזה', 'Nothing — it has no tools in a situation like this')]], 'a',
    L(`התוצר מתכווץ שני רבעונים ברציפות, האבטלה קפצה מ־${M2_SLOW.unemploymentFrom}% ל־${M2_SLOW.unemploymentTo}%, והאינפלציה (${pc(M2_SLOW.inflation)}) קרובה ליעד. הסכנה עכשיו היא ההאטה, לא המחירים — ולכן הצעד הסביר הוא הורדת ריבית, כדי לעודד הלוואות והוצאות.`,
      `GDP has shrunk two quarters in a row, unemployment jumped from ${M2_SLOW.unemploymentFrom}% to ${M2_SLOW.unemploymentTo}%, and inflation (${pc(M2_SLOW.inflation)}) is near the target. The danger now is the slowdown, not prices — so the likely step is a rate cut, to encourage borrowing and spending.`)),
  takeaway: {
    bottomLine: L('אינפלציה שוחקת את כוח הקנייה; תמ״ג ואבטלה מראים כמה המשק חם. כשהאינפלציה גבוהה, הבנק המרכזי מעלה ריבית כדי לקרר את הביקוש — ובשפל מוריד אותה. ההשפעה מגיעה באיחור.', 'Inflation erodes buying power; GDP and unemployment show how hot the economy runs. When inflation is high, the central bank raises rates to cool demand — and in a slump it cuts them. The effect arrives late.'),
    caveat: L('הקשר בין המספרים הוא נטייה, לא חוק: אינפלציה יכולה לעלות גם כשהמשק חלש (למשל בגלל מחיר אנרגיה), ואז לבנק אין תשובה קלה.', 'The link between the numbers is a tendency, not a law: inflation can rise even when the economy is weak (for example because of energy prices), and then the bank has no easy answer.')
  },
  questions: [
    mq('m2-power', 'M2', powerBars([INF_LO]), 'beginner', L(`באינפלציה של ${INF_HI}% בשנה, כמה יהיה שווה ${BASKET} בעוד ${M2_YEARS} שנים, בכסף של היום?`, `At ${INF_HI}% inflation a year, what will ${BASKET} be worth in ${M2_YEARS} years, in today's money?`),
      nums([n1(realValue(BASKET, INF_HI, M2_YEARS)), n1(BASKET - INF_HI * M2_YEARS), n1(BASKET - realValue(BASKET, INF_HI, M2_YEARS)), n1(BASKET - INF_HI)]), 'a',
      L(`${ltr(`${BASKET} ÷ ${(1 + INF_HI / 100).toFixed(2)}^${M2_YEARS} = ${n1(realValue(BASKET, INF_HI, M2_YEARS))}`)} — פחות מחצי. האינפלציה מצטברת כמו ריבית דריבית, רק לכיוון ההפוך.`, `${BASKET} ÷ ${(1 + INF_HI / 100).toFixed(2)}^${M2_YEARS} = ${n1(realValue(BASKET, INF_HI, M2_YEARS))} — less than half. Inflation compounds like interest, only in the other direction.`)),
    mq('m2-real', 'M2', { type: 'table', title: L('ריבית ואינפלציה', 'Rate and inflation'), columns: [L('נתון', 'Figure'), L('ערך', 'Value')], rows: [
      { label: L('ריבית הבנק המרכזי', 'Central bank rate'), cells: [pc(M2_REAL.rate, 0)] },
      { label: L('אינפלציה', 'Inflation'), cells: [pc(M2_REAL.inflation, 0)] }
    ] }, 'beginner', L('מה הריבית הריאלית?', 'What is the real rate?'),
      nums([pc(M2_REAL.rate - M2_REAL.inflation, 0), pc(M2_REAL.inflation - M2_REAL.rate, 0), pc(M2_REAL.rate + M2_REAL.inflation, 0), pc(M2_REAL.rate, 0)]), 'a',
      L(`${ltr(`${pc(M2_REAL.rate, 0)} − ${pc(M2_REAL.inflation, 0)} = ${pc(M2_REAL.rate - M2_REAL.inflation, 0)}`)}: המחירים עולים מהר יותר מהריבית, ולכן כסף בפיקדון מאבד כוח קנייה.`, `${pc(M2_REAL.rate, 0)} − ${pc(M2_REAL.inflation, 0)} = ${pc(M2_REAL.rate - M2_REAL.inflation, 0)}: prices rise faster than the rate, so money on deposit loses buying power.`)),
    mq('m2-hot', 'M2', { type: 'table', title: L('משק חם', 'A hot economy'), columns: [L('נתון', 'Figure'), L('ערך', 'Value')], rows: [
      { label: L('אינפלציה', 'Inflation'), cells: [pc(M2_HOT.inflation, 0)] },
      { label: L('יעד האינפלציה', 'Inflation target'), cells: [pc(TARGET, 0)] },
      { label: L('אבטלה', 'Unemployment'), cells: [pc(M2_HOT.unemployment)] }
    ] }, 'intermediate', L('מה סביר שהבנק המרכזי יעשה?', 'What is the central bank most likely to do?'),
      [['a', L('להעלות ריבית', 'Raise rates')], ['b', L('להוריד ריבית כדי לעודד תעסוקה', 'Cut rates to encourage employment')], ['c', L('לחכות שהאינפלציה תרד מעצמה', 'Wait for inflation to fall by itself')], ['d', L('להדפיס כסף', 'Print money')]], 'a',
      L(`אינפלציה של ${pc(M2_HOT.inflation, 0)}, פי ${n0(M2_HOT.inflation / TARGET)} מהיעד, ואבטלה נמוכה — המשק חם, ואין סיבה לחשוש מהאטה. זה בדיוק המצב שבו בנק מרכזי מעלה ריבית.`, `Inflation of ${pc(M2_HOT.inflation, 0)}, ${n0(M2_HOT.inflation / TARGET)} times the target, and low unemployment — the economy is hot, and there is no reason to fear a slowdown. That is exactly when a central bank raises rates.`))
  ]
};

// ---------- M3 · recessions, fiscal policy and market cycles ----------
const QUARTERS = M3_GDP.map((_, i) => String(i + 1));
const rec = recessionOf(M3_GDP);
const idxPeak = M3_INDEX.indexOf(Math.max(...M3_INDEX.slice(0, rec.from)));
const idxLow = M3_INDEX.indexOf(Math.min(...M3_INDEX));
const q = (i: number) => i + 1;
const TICKS = [0, 4, 8, 12, 16, 20, 23];
const recBand = { from: rec.from, to: rec.to, label: L('מיתון', 'Recession') };
const indexLines = (marks: boolean): Diagram => ({
  type: 'lines', title: L('מדד מניות לאורך מחזור', 'A stock index through a cycle'), x: QUARTERS, xTitle: L('רבעון', 'Quarter'), unit: '',
  series: [{ label: L('מדד המניות', 'Stock index'), tone: 'info', values: M3_INDEX }], ticks: TICKS, bands: [recBand],
  ...(marks ? { marks: [{ at: idxPeak, series: 0, label: L(`שיא: ${M3_INDEX[idxPeak]}`, `Peak: ${M3_INDEX[idxPeak]}`) }, { at: idxLow, series: 0, label: L(`שפל: ${M3_INDEX[idxLow]}`, `Low: ${M3_INDEX[idxLow]}`) }] } : {}),
  caption: L('מחזור להמחשה. הרצועה: הרבעונים שבהם התוצר התכווץ.', 'An illustrative cycle. The band: the quarters in which GDP shrank.')
});
const gdpLines: Diagram = { type: 'lines', title: L('צמיחת התוצר, רבעון אחר רבעון', 'GDP growth, quarter by quarter'), x: QUARTERS, xTitle: L('רבעון', 'Quarter'), unit: '%',
  series: [{ label: L('צמיחה (בקצב שנתי)', 'Growth (yearly pace)'), tone: 'adv', values: M3_GDP }], ticks: TICKS, caption: L('משק להמחשה.', 'An illustrative economy.') };

export const M3: LessonContent = {
  id: 'M3',
  tutor: { topic: 'recession', label: L('מיתון', 'recessions') },
  teach: [
    {
      heading: L('ארבעה שלבים של מחזור', 'The four phases of a cycle'),
      paragraphs: [
        L('משק לא גדל בקו ישר. הוא עובר מחזורים: התרחבות, שבה התוצר גדל והתעסוקה עולה; שיא, שבו המשק חם, האינפלציה עולה והריבית גבוהה; התכווצות, שבה התוצר יורד והאבטלה עולה; ושפל, שממנו מתחילה ההתאוששות.',
          'An economy does not grow in a straight line. It goes through cycles: expansion, when GDP grows and employment rises; a peak, when the economy runs hot, inflation rises and rates are high; contraction, when GDP falls and unemployment rises; and a trough, from which the recovery starts.'),
        L('מיתון הוא התכווצות משמעותית. כלל אצבע נפוץ: שני רבעונים רצופים של צמיחה שלילית. בפועל, בארה״ב ועדה של מוסד מחקר (NBER) קובעת את תאריכי המיתון לפי תמונה רחבה יותר — תעסוקה, הכנסות, ייצור — ולעיתים חודשים רבים אחרי שהוא התחיל.',
          'A recession is a significant contraction. A common rule of thumb: two quarters in a row of negative growth. In practice, in the US a committee of a research body (the NBER) dates recessions from a broader picture — employment, incomes, production — often many months after one began.'),
        L('לבנק המרכזי יש מנוף אחד — הריבית (מדיניות מוניטרית). לממשלה יש מנוף אחר: המדיניות הפיסקלית — כמה היא מוציאה וכמה מס היא גובה. במיתון ממשלות מגדילות הוצאות או מורידות מסים כדי לתמוך בביקוש, במחיר של גירעון וחוב גבוהים יותר.',
          'The central bank has one lever — the rate (monetary policy). The government has another: fiscal policy — how much it spends and how much tax it collects. In a recession governments raise spending or cut taxes to support demand, at the cost of a larger deficit and more debt.')
      ],
      work: { kind: 'diagram', diagram: { type: 'flow', title: L('המחזור הכלכלי', 'The business cycle'), stages: [
        { label: L('התרחבות', 'Expansion'), sub: L('צמיחה, יותר משרות', 'Growth, more jobs') },
        { label: L('שיא', 'Peak'), sub: L('משק חם, אינפלציה, ריבית גבוהה', 'A hot economy, inflation, high rates') },
        { label: L('התכווצות', 'Contraction'), sub: L('התוצר יורד, האבטלה עולה', 'GDP falls, unemployment rises') },
        { label: L('שפל', 'Trough'), sub: L('ריבית נמוכה, תחילת התאוששות', 'Low rates, the recovery begins') }
      ] } }
    },
    {
      heading: L('מי מוביל מתי', 'Who leads when'),
      paragraphs: [
        L('כל שלב נראה אחרת בנתונים — והטבלה מסכמת את הנטיות. שימו לב לעמודה האחרונה: שוק המניות לא הולך יד ביד עם הכלכלה. הוא הולך לפניה.',
          'Each phase looks different in the data — and the table sums up the tendencies. Look at the last column: the stock market does not walk hand in hand with the economy. It walks ahead of it.'),
        L('הסיבה היא מה שראיתם בריבית: מחיר מניה הוא ציפייה לרווחים עתידיים. כשהמשק עוד חם אבל הריבית גבוהה והצמיחה מאטה, המשקיעים כבר מתמחרים את הרווחים הנמוכים שיבואו. וכשהמיתון עוד נמשך אבל הריבית יורדת, הם כבר מתמחרים את ההתאוששות.',
          'The reason is what you saw with rates: a share price is an expectation of future profits. When the economy is still hot but rates are high and growth slows, investors already price the lower profits to come. And while the recession still lasts but rates are falling, they already price the recovery.'),
        L('אלה נטיות, לא חוקים. אין שני מחזורים זהים באורכם, בעומקם או בסיבה שלהם — אבל הסדר הזה, השוק לפני הנתונים, חוזר שוב ושוב.',
          'These are tendencies, not laws. No two cycles are the same in length, depth or cause — but this order, the market before the data, repeats again and again.')
      ],
      work: { kind: 'diagram', diagram: { type: 'table', title: L('נטיות בכל שלב', 'Tendencies in each phase'), columns: [L('שלב', 'Phase'), L('תוצר ותעסוקה', 'GDP and jobs'), L('אינפלציה וריבית', 'Inflation and rates'), L('שוק המניות נוטה', 'The stock market tends to')], rows: [
        { label: L('התרחבות', 'Expansion'), cells: [L('עולים', 'Rising'), L('נמוכות, מתחילות לעלות', 'Low, starting to rise'), L('לעלות', 'Rise')] },
        { label: L('שיא', 'Peak'), cells: [L('גבוהים, הצמיחה מאטה', 'High, growth slowing'), L('גבוהות', 'High'), L('להיחלש — לפני ההתכווצות', 'Weaken — before the contraction')] },
        { label: L('התכווצות', 'Contraction'), cells: [L('יורדים', 'Falling'), L('יורדות', 'Falling'), L('לרדת, ולמצוא שפל — לפני סוף המיתון', 'Fall, and find a low — before the recession ends')] },
        { label: L('שפל', 'Trough'), cells: [L('בתחתית, מתייצבים', 'At the bottom, steadying'), L('נמוכות', 'Low'), L('לעלות, בזמן שהנתונים עוד רעים', 'Rise, while the data is still bad')] }
      ] } }
    },
    {
      heading: L('מחזור שלם', 'A full cycle'),
      paragraphs: [
        L(`הגרף מראה מדד מניות במשך ${M3_INDEX.length} רבעונים, והרצועה היא המיתון — רבעונים ${q(rec.from)} עד ${q(rec.to)}, שבהם התוצר התכווץ. המדד הגיע לשיא (${M3_INDEX[idxPeak]}) ברבעון ${q(idxPeak)} — ${rec.from - idxPeak} רבעונים לפני שהתוצר התחיל לרדת.`,
          `The chart shows a stock index over ${M3_INDEX.length} quarters, and the band is the recession — quarters ${q(rec.from)} to ${q(rec.to)}, when GDP shrank. The index peaked (${M3_INDEX[idxPeak]}) in quarter ${q(idxPeak)} — ${rec.from - idxPeak} quarters before GDP began to fall.`),
        L(`והשפל? ${M3_INDEX[idxLow]}, ברבעון ${q(idxLow)} — באמצע המיתון, כשהתוצר עוד ירד (${sp(M3_GDP[idxLow]!)}). מי שחיכה ל"נתונים טובים" כדי לקנות, נכנס רק אחרי רבעון ${q(rec.to)} — כשהמדד כבר היה ${M3_INDEX[rec.to + 1]}, ${pc(change(M3_INDEX[idxLow]!, M3_INDEX[rec.to + 1]!), 0)} מעל השפל.`,
          `And the low? ${M3_INDEX[idxLow]}, in quarter ${q(idxLow)} — in the middle of the recession, while GDP was still falling (${sp(M3_GDP[idxLow]!)}). Anyone who waited for "good data" to buy got in only after quarter ${q(rec.to)} — when the index was already ${M3_INDEX[rec.to + 1]}, ${pc(change(M3_INDEX[idxLow]!, M3_INDEX[rec.to + 1]!), 0)} above the low.`),
        L('זה לא אומר שאפשר לתזמן את השוק: בזמן אמת אף אחד לא יודע שזה השפל. זה אומר שחדשות כלכליות רעות הן לא בהכרח סיבה למכור — ייתכן שהשוק כבר תמחר אותן מזמן.',
          'That does not mean you can time the market: at the time, nobody knows it is the low. It means bad economic news is not necessarily a reason to sell — the market may have priced it long ago.')
      ],
      work: { kind: 'diagram', diagram: indexLines(true) }
    }
  ],
  charts: [],
  activity: {
    kind: 'sort',
    prompt: L('איפה אנחנו במחזור? מיינו 8 תמונות מצב לארבעת השלבים.', 'Where are we in the cycle? Sort 8 snapshots into the four phases.'),
    bins: [
      { id: 'exp', label: L('התרחבות', 'Expansion'), tone: 'var(--ok)' },
      { id: 'peak', label: L('שיא', 'Peak'), tone: 'var(--risk)' },
      { id: 'down', label: L('התכווצות', 'Contraction'), tone: 'var(--err)' },
      { id: 'trough', label: L('שפל', 'Trough'), tone: 'var(--info)' }
    ],
    items: [
      { id: 'e1', bin: 'exp', label: L('צמיחה של 3%, האבטלה יורדת, האינפלציה ביעד', 'Growth of 3%, unemployment falling, inflation at target'), why: L('משק שגדל בקצב בריא בלי לחץ מחירים — התרחבות.', 'An economy growing at a healthy pace without price pressure — expansion.') },
      { id: 'e2', bin: 'exp', label: L('חברות מגייסות עובדים, הרווחים עולים, הבנק משאיר את הריבית נמוכה', 'Companies hiring, profits rising, the bank keeps rates low'), why: L('ביקוש שגדל וריבית שעוד לא מרסנת — אמצע ההתרחבות.', 'Growing demand and rates that do not yet hold it back — mid-expansion.') },
      { id: 'p1', bin: 'peak', label: L('האבטלה בשפל של שנים, האינפלציה 5% ועולה, הבנק מעלה ריבית מהר', 'Unemployment at a multi-year low, inflation 5% and rising, the bank raising rates fast'), why: L('משק שחם מדי: לחץ מחירים ובנק שבולם — סימני שיא.', 'An economy running too hot: price pressure and a bank braking — signs of a peak.') },
      { id: 'p2', bin: 'peak', label: L('הצמיחה מאטה מ־3% ל־1%, הריבית בשיא של שנים', 'Growth slowing from 3% to 1%, rates at a multi-year high'), why: L('עוד צמיחה, אבל היא נחלשת תחת ריבית גבוהה — סוף ההתרחבות, סביב השיא.', 'Still growth, but weakening under high rates — the end of the expansion, around the peak.') },
      { id: 'd1', bin: 'down', label: L('התוצר יורד רבעון שני ברציפות, גלי פיטורים', 'GDP falling for a second quarter in a row, waves of layoffs'), why: L('שני רבעונים שליליים ופיטורים — התכווצות, לפי כלל האצבע מיתון.', 'Two negative quarters and layoffs — contraction, a recession by the rule of thumb.') },
      { id: 'd2', bin: 'down', label: L('האבטלה עולה מ־4% ל־6%, הבנק מתחיל להוריד ריבית', 'Unemployment rising from 4% to 6%, the bank starting to cut rates'), why: L('משק שמאבד משרות ובנק שעובר לתמוך בו — אמצע ההתכווצות.', 'An economy losing jobs and a bank switching to support it — mid-contraction.') },
      { id: 't1', bin: 'trough', label: L('התוצר עוד שלילי אבל פחות, הריבית בשפל, שוק המניות כבר מעל השפל שלו', 'GDP still negative but less so, rates at a low, the stock market already off its low'), why: L('הירידה נבלמת והשוק כבר מסתכל קדימה — שפל, רגע לפני ההתאוששות.', 'The fall is slowing and the market already looks ahead — a trough, just before the recovery.') },
      { id: 't2', bin: 'trough', label: L('אבטלה גבוהה שכבר לא עולה, רבעון ראשון של צמיחה אחרי מיתון', 'High unemployment that is no longer rising, the first quarter of growth after a recession'), why: L('התחתית מאחור, אבל הנזק עוד נראה בנתונים — היציאה מהשפל.', 'The bottom is behind, but the damage still shows in the data — the way out of the trough.') }
    ],
    right: L('מיינתם את כל שמונה התמונות. בכל אחת היה צירוף — צמיחה, תעסוקה, אינפלציה וריבית — ולא מספר בודד.', 'You sorted all eight snapshots. Each was a combination — growth, jobs, inflation and rates — not a single number.'),
    explain: [
      L('לא יודעים בזמן אמת. תמונות המצב כאן ברורות, כי הן נכתבו כך. במציאות הנתונים מגיעים באיחור ומתוקנים, סימנים סותרים מופיעים יחד, והשלב נקבע רשמית רק בדיעבד — לפעמים שנה אחרי.',
        'You cannot tell in real time. The snapshots here are clear because they were written that way. In reality the data arrives late and is revised, conflicting signs appear together, and the phase is officially dated only in hindsight — sometimes a year later.'),
      L('לכן המחזור הוא מפה להבנת הסביבה, לא שעון לתזמון. הוא עוזר לשאול את השאלות הנכונות — מה הריבית עושה, מה קורה לתעסוקה — ולא להמר על הרבעון הבא.',
        'So the cycle is a map for understanding the environment, not a clock for timing. It helps you ask the right questions — what rates are doing, what is happening to jobs — not bet on next quarter.')
    ]
  },
  apply: mq('m3-apply', 'M3', gdpLines, 'intermediate', L('לפי כלל האצבע, באילו רבעונים היה מיתון?', 'By the rule of thumb, in which quarters was there a recession?'),
    [['a', L(`${q(rec.from)}–${q(rec.to)}`, `${q(rec.from)}–${q(rec.to)}`)], ['b', L(`${q(idxPeak)}–${q(rec.from)}`, `${q(idxPeak)}–${q(rec.from)}`)], ['c', L(`${q(rec.to + 1)}–${q(rec.to + 4)}`, `${q(rec.to + 1)}–${q(rec.to + 4)}`)], ['d', L('לא היה — הצמיחה חזרה', 'None — growth came back')]], 'a',
    L(`הצמיחה שלילית ברבעונים ${q(rec.from)} עד ${q(rec.to)} — ${rec.to - rec.from + 1} רבעונים ברציפות. ברבעונים ${q(idxPeak)}–${q(rec.from - 1)} הצמיחה רק האטה, אבל נשארה חיובית.`, `Growth is negative in quarters ${q(rec.from)} to ${q(rec.to)} — ${rec.to - rec.from + 1} quarters in a row. In quarters ${q(idxPeak)}–${q(rec.from - 1)} growth only slowed, but stayed positive.`)),
  takeaway: {
    bottomLine: L('משק עובר מחזורים: התרחבות, שיא, התכווצות ושפל. שוק המניות נוטה להקדים את הכלכלה — לרדת לפני המיתון ולעלות לפני שהוא נגמר. הבנק המרכזי מפעיל ריבית; הממשלה — הוצאות ומסים.', 'An economy goes through cycles: expansion, peak, contraction and trough. The stock market tends to run ahead of the economy — falling before a recession and rising before it ends. The central bank uses rates; the government, spending and taxes.'),
    caveat: L('את השלב יודעים בוודאות רק בדיעבד. המחזור מסביר את הסביבה; הוא לא אומר מתי לקנות או למכור.', 'The phase is known for sure only in hindsight. The cycle explains the environment; it does not say when to buy or sell.')
  },
  questions: [
    mq('m3-def', 'M3', { type: 'table', title: L('צמיחת התוצר', 'GDP growth'), columns: [L('רבעון', 'Quarter'), L('צמיחה', 'Growth')], rows: M2_SLOW.gdp.map((g, i) => ({ label: L(i ? 'אחרון' : 'קודם', i ? 'Latest' : 'Previous'), cells: [sp(g)] })) }, 'beginner',
      L('לפי כלל האצבע הנפוץ, האם המשק במיתון?', 'By the common rule of thumb, is the economy in a recession?'),
      [['a', L('כן — שני רבעונים רצופים של צמיחה שלילית', 'Yes — two quarters in a row of negative growth')], ['b', L('לא — הירידה קטנה מ־1%', 'No — the fall is less than 1%')], ['c', L('לא — מיתון מתחיל רק כשהאבטלה מעל 10%', 'No — a recession starts only when unemployment is above 10%')], ['d', L('אי אפשר לדעת בלי מחירי מניות', 'You cannot tell without share prices')]], 'a',
      L('שני רבעונים שליליים ברציפות — זה כלל האצבע, גם כשהירידה קטנה. ההכרזה הרשמית (בארה״ב, NBER) נשענת על תמונה רחבה יותר ומגיעה מאוחר יותר.', 'Two negative quarters in a row — that is the rule of thumb, even when the fall is small. The official call (in the US, the NBER) rests on a broader picture and comes later.')),
    mq('m3-leads', 'M3', indexLines(false), 'intermediate', L('מה קרה קודם: השפל של המדד, או סוף המיתון?', 'What came first: the index\'s low, or the end of the recession?'),
      [['a', L('השפל של המדד', 'The index\'s low')], ['b', L('סוף המיתון', 'The end of the recession')], ['c', L('באותו רבעון בדיוק', 'Exactly the same quarter')], ['d', L('המדד לא ירד במיתון', 'The index did not fall in the recession')]], 'a',
      L(`המדד מצא שפל ברבעון ${q(idxLow)}, והמיתון נגמר רק אחרי רבעון ${q(rec.to)}. השוק מתמחר את ההתאוששות לפני שהיא מופיעה בנתונים.`, `The index found its low in quarter ${q(idxLow)}, and the recession ended only after quarter ${q(rec.to)}. The market prices the recovery before it shows in the data.`)),
    mq('m3-fiscal', 'M3', { type: 'table', title: L('שני מנופים', 'Two levers'), columns: [L('מנוף', 'Lever'), L('מי מפעיל', 'Who pulls it'), L('איך', 'How')], rows: [
      { label: L('א', 'A'), cells: [L('הבנק המרכזי', 'The central bank'), L('ריבית', 'The interest rate')] },
      { label: L('ב', 'B'), cells: [L('הממשלה', 'The government'), L('הוצאות ומסים', 'Spending and taxes')] }
    ] }, 'beginner', L('הממשלה מורידה מסים ומגדילה הוצאות כדי לצאת ממיתון. איזו מדיניות זו?', 'The government cuts taxes and raises spending to get out of a recession. Which policy is this?'),
      [['a', L('מדיניות פיסקלית — מנוף ב', 'Fiscal policy — lever B')], ['b', L('מדיניות מוניטרית — מנוף א', 'Monetary policy — lever A')], ['c', L('שתיהן', 'Both')], ['d', L('אף אחת — זו רק תוכנית תקציב', 'Neither — it is just a budget plan')]], 'a',
      L('מסים והוצאות ממשלה הם מדיניות פיסקלית. ריבית היא מדיניות מוניטרית, של הבנק המרכזי. במיתון עמוק שתיהן פועלות לעיתים יחד — אבל אלה שני מנופים שונים, בידיים שונות.', 'Taxes and government spending are fiscal policy. The rate is monetary policy, the central bank\'s. In a deep recession both are often used together — but they are two different levers, in different hands.'))
  ]
};

export const MACRO_1 = [M1, M2, M3];
