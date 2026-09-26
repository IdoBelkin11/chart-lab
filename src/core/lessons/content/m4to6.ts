// ---------------------------------------------------------------------------
// Macro, module 2 — bonds and assets: M4 (bonds: coupon, yield and price),
// M5 (the yield curve as a signal), M6 (the dollar, gold and commodities).
//
// Sources: the approved curriculum (step outline for M5; M4 and M6 outlines
// are new, in the same rhythm) and its knowledge-base topics. Builds on M1's
// seesaw (a bond's price against the market rate) and M2's central bank.
// Every number comes from @core/macro/scenarios.
// ---------------------------------------------------------------------------
import type { Diagram, LessonContent } from './types';
import {
  M4_BOND, M4_PRICES, M4_TRY, M4_YIELDS, M4_CURVES, M4_CURRENT, M4_CREDIT, bondFlows, bondPrice, ytm, duration,
  MATURITIES, CURVE_NORMAL, CURVE_INVERTED, CURVES_TRY, M5_SPREAD, M5_RECESSION, M5_APPLY,
  FX_CASE, FX_TRY, FX_Q, inShekels, GOLD_COST
} from '@core/macro/scenarios';
import { L, ltr, n0, n1, n2, pc, nums, mq, change, sp } from './macroKit';

// ---------- M4 · bonds: coupon, yield and price ----------
const B = M4_BOND, cpn = (B.face * B.coupon) / 100;
const flows = bondFlows(B.face, B.coupon, B.years);
const cy = (price: number) => (cpn / price) * 100;
const T = M4_TRY, tCpn = (T.face * T.coupon) / 100;
const tFlows = bondFlows(T.face, T.coupon, T.years);
const tPv = tFlows.map((f, i) => f / (1 + T.yield / 100) ** (i + 1));
const tPrice = bondPrice(T.face, T.coupon, T.years, T.yield);
const S = M4_CURVES;
const sP = (y: number) => bondPrice(1000, S.coupon, S.short, y), lP = (y: number) => bondPrice(1000, S.coupon, S.long, y);
const durS = duration(1000, S.coupon, S.short, S.coupon), durL = duration(1000, S.coupon, S.long, S.coupon);
const YUP = 7;
const priceLines: Diagram = {
  type: 'lines', title: L(`מחיר אג״ח עם קופון ${S.coupon}%, לפי התשואה בשוק`, `Price of a ${S.coupon}% bond, by the market yield`), x: M4_YIELDS.map((y) => `${y}%`), xTitle: L('תשואה בשוק', 'Market yield'), unit: '',
  series: [{ label: L(`${S.short} שנים לפדיון`, `${S.short} years to maturity`), tone: 'info', values: M4_YIELDS.map(sP) }, { label: L(`${S.long} שנים לפדיון`, `${S.long} years to maturity`), tone: 'err', values: M4_YIELDS.map(lP) }],
  ticks: M4_YIELDS.map((_, i) => i), ref: { value: 1000, label: L('ערך נקוב', 'Face value') },
  caption: L('אג״ח להמחשה, ערך נקוב 1,000.', 'Illustrative bonds, 1,000 face value.')
};
const yieldTable = (prices: number[]): Diagram => ({ type: 'table', title: L(`אג״ח: קופון ${B.coupon}% (${n0(cpn)} בשנה), ${B.years} שנים לפדיון`, `A bond: ${B.coupon}% coupon (${n0(cpn)} a year), ${B.years} years to maturity`), columns: [L('מחיר בשוק', 'Market price'), L('תשואה שוטפת', 'Current yield'), L('תשואה לפדיון', 'Yield to maturity')],
  rows: prices.map((p) => ({ label: L(n0(p), n0(p)), cells: [pc(cy(p), 2), pc(ytm(p, B.face, B.coupon, B.years), 2)] })) });

export const M4: LessonContent = {
  id: 'M4',
  tutor: { topic: 'bond', label: L('אג״ח', 'bonds') },
  teach: [
    {
      heading: L('אג״ח: הלוואה שאפשר למכור', 'A bond: a loan you can sell'),
      paragraphs: [
        L(`אגרת חוב (אג״ח) היא הלוואה שאתם נותנים לממשלה או לחברה. יש לה שלושה נתונים קבועים: הערך הנקוב — הסכום שיוחזר בסוף (כאן ${n0(B.face)}); הקופון — הריבית השנתית על הערך הנקוב (${B.coupon}%, כלומר ${n0(cpn)} בשנה); ומועד הפדיון — מתי ההלוואה נגמרת (בעוד ${B.years} שנים).`,
          `A bond is a loan you give to a government or a company. It has three fixed figures: the face value — the amount repaid at the end (here ${n0(B.face)}); the coupon — the yearly interest on the face value (${B.coupon}%, that is ${n0(cpn)} a year); and the maturity date — when the loan ends (in ${B.years} years).`),
        L(`התשלומים ידועים מראש: ${n0(cpn)} בכל שנה, ובשנה האחרונה גם ${n0(B.face)} — סך הכול ${n0(flows.reduce((s, f) => s + f, 0))}. מה שלא ידוע הוא המחיר: אג״ח נסחרות בבורסה כל יום, ומי שקונה אג״ח קיימת משלם עליה את מחיר השוק, לא את הערך הנקוב.`,
          `The payments are known in advance: ${n0(cpn)} every year, and in the last year ${n0(B.face)} too — ${n0(flows.reduce((s, f) => s + f, 0))} in all. What is not known is the price: bonds trade on the exchange every day, and whoever buys an existing bond pays the market price for it, not the face value.`),
        L('יש אג״ח ממשלתיות — הלוואה למדינה — ויש אג״ח של חברות (קונצרניות). הממשלתיות נחשבות בטוחות יותר, ולכן בדרך כלל משלמות פחות. על ההבדל הזה, ועל מה שהמחיר אומר, בשלבים הבאים.',
          'There are government bonds — a loan to the state — and company (corporate) bonds. Government bonds are considered safer, so they usually pay less. That difference, and what the price tells you, come in the next steps.')
      ],
      work: { kind: 'diagram', diagram: { type: 'bars', title: L('מה האג״ח משלמת, שנה אחר שנה', 'What the bond pays, year by year'), bars: flows.map((f, i) => ({ label: L(`שנה ${i + 1}`, `Year ${i + 1}`), value: f, tone: i === flows.length - 1 ? 'learn' : 'info', shown: L(n0(f), n0(f)) })),
        caption: L(`קופון של ${n0(cpn)} בכל שנה, והקרן חוזרת עם התשלום האחרון.`, `A ${n0(cpn)} coupon every year, and the principal comes back with the last payment.`) } }
    },
    {
      heading: L('קופון ותשואה', 'Coupon and yield'),
      paragraphs: [
        L(`הקופון קבוע: ${n0(cpn)} בשנה, מה שלא יקרה. אבל התשואה שלכם תלויה במחיר שבו קניתם. התשואה השוטפת היא הקופון חלקי המחיר: ב־${n0(M4_PRICES[0]!)} היא ${pc(cy(M4_PRICES[0]!), 2)}; ב־${n0(M4_PRICES[2]!)} — ${pc(cy(M4_PRICES[2]!), 2)}.`,
          `The coupon is fixed: ${n0(cpn)} a year, whatever happens. But your return depends on the price you paid. The current yield is the coupon divided by the price: at ${n0(M4_PRICES[0]!)} it is ${pc(cy(M4_PRICES[0]!), 2)}; at ${n0(M4_PRICES[2]!)} — ${pc(cy(M4_PRICES[2]!), 2)}.`),
        L(`התשואה לפדיון (YTM) משלימה את התמונה: היא התשואה השנתית הכוללת אם קונים במחיר הזה ומחזיקים עד הסוף — כולל ההפרש בין המחיר ששילמתם ל־${n0(B.face)} שיחזרו. מי שקנה ב־${n0(M4_PRICES[0]!)} מרוויח גם ${n0(B.face - M4_PRICES[0]!)} בפדיון, ולכן התשואה לפדיון שלו, ${pc(ytm(M4_PRICES[0]!, B.face, B.coupon, B.years), 2)}, גבוהה מהקופון.`,
          `The yield to maturity (YTM) completes the picture: it is the total yearly return if you buy at this price and hold to the end — including the difference between what you paid and the ${n0(B.face)} you get back. Whoever bought at ${n0(M4_PRICES[0]!)} also gains ${n0(B.face - M4_PRICES[0]!)} at maturity, so their yield to maturity, ${pc(ytm(M4_PRICES[0]!, B.face, B.coupon, B.years), 2)}, is above the coupon.`),
        L('מכאן הכלל: מחיר מתחת לערך הנקוב — תשואה לפדיון מעל הקופון; מחיר מעל הערך הנקוב — מתחתיו. כשמדברים על "התשואה של אג״ח" בחדשות, מתכוונים בדרך כלל לתשואה לפדיון.',
          'Hence the rule: a price below face value — a yield to maturity above the coupon; a price above face value — below it. When the news talks about "a bond\'s yield", it usually means the yield to maturity.')
      ],
      work: { kind: 'diagram', diagram: yieldTable(M4_PRICES) }
    },
    {
      heading: L('מחיר מול ריבית', 'Price against rates'),
      paragraphs: [
        L(`אותה נדנדה מהשיעור על ריבית, עכשיו בגרף: ככל שהתשואה שהשוק דורש עולה, מחיר האג״ח יורד. אג״ח שהתשואה בשוק שווה לקופון שלו (${S.coupon}%) נסחרת בדיוק בערך הנקוב.`,
          `The same seesaw from the lesson on rates, now as a chart: the higher the yield the market asks, the lower the bond's price. A bond whose market yield equals its coupon (${S.coupon}%) trades exactly at face value.`),
        L(`אבל שני הקווים לא זזים באותה מידה. כשהתשואה עולה מ־${S.coupon}% ל־${YUP}%, האג״ח ל־${S.short} שנים יורדת ל־${n1(sP(YUP))} (${pc(change(1000, sP(YUP)))}), וזו ל־${S.long} שנים — ל־${n1(lP(YUP))} (${pc(change(1000, lP(YUP)))}).`,
          `But the two lines do not move by the same amount. When the yield rises from ${S.coupon}% to ${YUP}%, the ${S.short}-year bond falls to ${n1(sP(YUP))} (${pc(change(1000, sP(YUP)))}), and the ${S.long}-year one — to ${n1(lP(YUP))} (${pc(change(1000, lP(YUP)))}).`),
        L('הסיבה: מי שמחזיק את הארוכה תקוע עם הקופון הישן עוד הרבה שנים, ומי שמחזיק את הקצרה יקבל את כספו בקרוב וישקיע אותו מחדש בתשואה החדשה. אג״ח ארוכות רגישות יותר לריבית — לטוב ולרע.',
          'The reason: whoever holds the long one is stuck with the old coupon for many more years, while whoever holds the short one gets their money back soon and reinvests it at the new yield. Long bonds are more sensitive to rates — for better and for worse.')
      ],
      work: { kind: 'diagram', diagram: priceLines }
    }
  ],
  charts: [],
  activity: {
    kind: 'calculate',
    prompt: L('כמה שווה האג״ח?', 'What is the bond worth?'),
    task: L(`אג״ח עם ערך נקוב ${n0(T.face)} וקופון ${T.coupon}% (${n0(tCpn)} בשנה), ${T.years} שנים לפדיון. התשואה בשוק עלתה ל־${T.yield}%. כמה שווה האג״ח היום? עגלו לשתי ספרות אחרי הנקודה.`,
      `A bond with ${n0(T.face)} face value and a ${T.coupon}% coupon (${n0(tCpn)} a year), ${T.years} years to maturity. The market yield has risen to ${T.yield}%. What is the bond worth today? Round to two decimal places.`),
    diagram: { type: 'table', title: L('התשלומים שנותרו', 'The payments left'), columns: [L('שנה', 'Year'), L('תשלום', 'Payment'), L(`מחלקים ב־`, 'Divide by')], rows: tFlows.map((f, i) => ({ label: L(String(i + 1), String(i + 1)), cells: [n0(f), `${(1 + T.yield / 100).toFixed(2)}^${i + 1}`] })) },
    answer: +tPrice.toFixed(2),
    tolerance: 1,
    field: L('מחיר האג״ח', 'The bond\'s price'),
    mistakes: [
      { value: T.face, tolerance: 0.5, why: L(`הקופון קבוע, אבל המחיר לא. כשהשוק דורש ${T.yield}% ואג״ח משלמת ${T.coupon}%, אף אחד לא ישלם עליה ${n0(T.face)}.`, `The coupon is fixed, but the price is not. When the market asks ${T.yield}% and the bond pays ${T.coupon}%, nobody will pay ${n0(T.face)} for it.`) },
      { value: T.face - (T.yield - T.coupon) * T.years * 10, tolerance: 0.9, why: L(`הפחתתם ${T.yield - T.coupon}% כפול ${T.years} שנים. זה קירוב קרוב — אבל כל תשלום צריך לחלק ב־${(1 + T.yield / 100).toFixed(2)} בחזקת השנה שלו.`, `You took off ${T.yield - T.coupon}% times ${T.years} years. That is a close approximation — but each payment must be divided by ${(1 + T.yield / 100).toFixed(2)} to the power of its year.`) },
      { value: T.face + (T.yield - T.coupon) * T.years * 10, tolerance: 3, why: L('הכיוון הפוך: כשהתשואה בשוק גבוהה מהקופון, המחיר יורד מתחת לערך הנקוב, לא עולה מעליו.', 'The wrong direction: when the market yield is above the coupon, the price falls below face value, not above it.') }
    ],
    steps: [
      ...tFlows.map((f, i) => L(`שנה ${i + 1}: ${ltr(`${n0(f)} ÷ ${(1 + T.yield / 100).toFixed(2)}^${i + 1} = ${n2(tPv[i]!)}`)}`, `Year ${i + 1}: ${n0(f)} ÷ ${(1 + T.yield / 100).toFixed(2)}^${i + 1} = ${n2(tPv[i]!)}`)),
      L(`סך הכול: ${ltr(`${tPv.map(n2).join(' + ')} = ${n2(tPrice)}`)}`, `In all: ${tPv.map(n2).join(' + ')} = ${n2(tPrice)}`)
    ],
    right: L(`${n2(tPrice)}: ${pc(change(T.face, tPrice))} מתחת לערך הנקוב. במחיר הזה, מי שקונה ומחזיק עד הסוף מקבל בדיוק ${T.yield}% בשנה — כמו אג״ח חדשה.`, `${n2(tPrice)}: ${pc(change(T.face, tPrice))} below face value. At this price, whoever buys and holds to the end gets exactly ${T.yield}% a year — like a new bond.`),
    off: L(`עוד לא. חלקו כל תשלום ב־${(1 + T.yield / 100).toFixed(2)} בחזקת השנה שלו, וחברו את שלושתם.`, `Not yet. Divide each payment by ${(1 + T.yield / 100).toFixed(2)} to the power of its year, and add all three.`),
    explain: [
      L(`משך (Duration) מודד כמה אג״ח רגישה לריבית: בכמה אחוזים המחיר זז כשהתשואה זזה בנקודת אחוז אחת. לאג״ח ל־${S.short} שנים עם קופון ${S.coupon}% הוא בערך ${n1(durS)}; לזו ל־${S.long} שנים — בערך ${n1(durL)}. עלייה של נקודה בתשואות תוריד את הארוכה בערך ${n0(durL)}%.`,
        `Duration measures how sensitive a bond is to rates: by what percentage its price moves when the yield moves one percentage point. For a ${S.short}-year bond with a ${S.coupon}% coupon it is about ${n1(durS)}; for the ${S.long}-year one — about ${n1(durL)}. A one-point rise in yields takes the long one down about ${n0(durL)}%.`),
      L('והסיכון השני הוא דירוג האשראי: הסיכוי שהלווה לא יחזיר. חברות דירוג מסמנות אותו באותיות — AAA הבטוח ביותר, ומתחת ל־BBB "דירוג ספקולטיבי". ככל שהסיכון גבוה יותר, הלווה חייב להציע תשואה גבוהה יותר. תשואה גבוהה באג״ח היא כמעט תמיד תשלום על סיכון, לא מתנה.',
        'The second risk is the credit rating: the chance the borrower does not pay back. Rating agencies mark it with letters — AAA the safest, and below BBB "speculative grade". The higher the risk, the higher the yield the borrower must offer. A high bond yield is almost always payment for risk, not a gift.')
    ]
  },
  apply: mq('m4-apply', 'M4', { type: 'table', title: L('שתי אג״ח לחמש שנים', 'Two five-year bonds'), columns: [L('מנפיק', 'Issuer'), L('דירוג', 'Rating'), L('תשואה לפדיון', 'Yield to maturity')], rows: [
    { label: L('ממשלה', 'Government'), cells: ['AA+', pc(M4_CREDIT.gov, 1)] },
    { label: L('חברה', 'Company'), cells: ['BB', pc(M4_CREDIT.corp, 1)] }
  ] }, 'intermediate', L(`למה החברה משלמת ${pc(M4_CREDIT.corp - M4_CREDIT.gov, 1)} יותר?`, `Why does the company pay ${pc(M4_CREDIT.corp - M4_CREDIT.gov, 1)} more?`),
    [['a', L('הסיכוי שהיא לא תחזיר את החוב גבוה יותר, והמשקיעים דורשים פיצוי', 'The chance it does not repay is higher, and investors demand compensation')], ['b', L('החברה רווחית יותר מהממשלה', 'The company is more profitable than the government')], ['c', L('אג״ח של חברות תמיד משלמות יותר, בלי קשר לסיכון', 'Company bonds always pay more, whatever the risk')], ['d', L('כי התקופה שלה ארוכה יותר', 'Because its term is longer')]], 'a',
    L(`לשתיהן אותה תקופה, כך שההבדל אינו במשך. דירוג BB הוא מתחת ל־BBB — ספקולטיבי: הסיכוי לחדלות פירעון משמעותי יותר, ומי שמלווה לחברה רוצה ${pc(M4_CREDIT.corp - M4_CREDIT.gov, 1)} בשנה על הסיכון הזה.`,
      `Both have the same term, so the difference is not duration. A BB rating is below BBB — speculative: the chance of default is more meaningful, and whoever lends to the company wants ${pc(M4_CREDIT.corp - M4_CREDIT.gov, 1)} a year for that risk.`)),
  takeaway: {
    bottomLine: L('אג״ח משלמת קופון קבוע ומחזירה ערך נקוב, אבל המחיר שלה זז: כשהתשואה בשוק עולה המחיר יורד, ויותר ככל שהאג״ח ארוכה. תשואה לפדיון היא התשואה הכוללת אם מחזיקים עד הסוף.', 'A bond pays a fixed coupon and returns its face value, but its price moves: when the market yield rises the price falls, and more so the longer the bond. The yield to maturity is the total return if you hold to the end.'),
    caveat: L('מי שמחזיק עד הפדיון מקבל את מה שהובטח, גם אם המחיר ירד בדרך — בתנאי שהלווה עומד בהתחייבות. מי שצריך למכור לפני כן — חשוף למחיר של אותו יום.', 'Whoever holds to maturity gets what was promised, even if the price fell on the way — provided the borrower pays. Whoever has to sell before that is exposed to that day\'s price.')
  },
  questions: [
    mq('m4-cy', 'M4', { type: 'table', title: L('אג״ח בשוק', 'A bond in the market'), columns: [L('נתון', 'Figure'), L('ערך', 'Value')], rows: [
      { label: L('קופון בשנה', 'Coupon a year'), cells: [n0(M4_CURRENT.coupon)] },
      { label: L('ערך נקוב', 'Face value'), cells: [n0(1000)] },
      { label: L('מחיר בשוק', 'Market price'), cells: [n0(M4_CURRENT.price)] }
    ] }, 'beginner', L('מה התשואה השוטפת?', 'What is the current yield?'),
      nums([pc((M4_CURRENT.coupon / M4_CURRENT.price) * 100, 1), pc((M4_CURRENT.coupon / 1000) * 100, 1), pc(M4_CURRENT.price / M4_CURRENT.coupon, 1), pc(((M4_CURRENT.price - 1000) / 1000) * 100, 1)]), 'a',
      L(`${ltr(`${n0(M4_CURRENT.coupon)} ÷ ${n0(M4_CURRENT.price)} = ${pc((M4_CURRENT.coupon / M4_CURRENT.price) * 100, 1)}`)}. ${pc((M4_CURRENT.coupon / 1000) * 100, 1)} הוא הקופון על הערך הנקוב — אבל מי שקונה היום משלם ${n0(M4_CURRENT.price)}.`, `${n0(M4_CURRENT.coupon)} ÷ ${n0(M4_CURRENT.price)} = ${pc((M4_CURRENT.coupon / M4_CURRENT.price) * 100, 1)}. ${pc((M4_CURRENT.coupon / 1000) * 100, 1)} is the coupon on the face value — but a buyer today pays ${n0(M4_CURRENT.price)}.`)),
    mq('m4-long', 'M4', priceLines, 'intermediate', L(`התשואות בשוק עולות מ־${S.coupon}% ל־${YUP}%. איזו אג״ח יורדת יותר?`, `Market yields rise from ${S.coupon}% to ${YUP}%. Which bond falls more?`),
      [['a', L(`זו ל־${S.long} שנים`, `The ${S.long}-year one`)], ['b', L(`זו ל־${S.short} שנים`, `The ${S.short}-year one`)], ['c', L('שתיהן באותה מידה — אותו קופון', 'Both the same — the same coupon')], ['d', L('אף אחת — הן מחזירות ערך נקוב', 'Neither — they both repay face value')]], 'a',
      L(`${S.long} שנים: ${pc(change(1000, lP(YUP)))}; ${S.short} שנים: ${pc(change(1000, sP(YUP)))}. ככל שהאג״ח ארוכה יותר, יותר תשלומים רחוקים מושפעים מהתשואה החדשה.`, `${S.long} years: ${pc(change(1000, lP(YUP)))}; ${S.short} years: ${pc(change(1000, sP(YUP)))}. The longer the bond, the more distant payments the new yield affects.`)),
    mq('m4-ytm', 'M4', { type: 'table', title: L('אג״ח מתחת לערך הנקוב', 'A bond below face value'), columns: [L('נתון', 'Figure'), L('ערך', 'Value')], rows: [
      { label: L('קופון', 'Coupon'), cells: [pc(B.coupon, 0)] }, { label: L('שנים לפדיון', 'Years to maturity'), cells: [String(B.years)] }, { label: L('מחיר בשוק', 'Market price'), cells: [n0(M4_PRICES[0]!)] }, { label: L('ערך נקוב', 'Face value'), cells: [n0(B.face)] }
    ] }, 'intermediate', L('התשואה לפדיון של האג״ח הזו —', 'This bond\'s yield to maturity is —'),
      [['a', L(`גבוהה מ־${B.coupon}%`, `Above ${B.coupon}%`)], ['b', L(`נמוכה מ־${B.coupon}%`, `Below ${B.coupon}%`)], ['c', L(`בדיוק ${B.coupon}%`, `Exactly ${B.coupon}%`)], ['d', L('אי אפשר לדעת בלי הדירוג', 'Impossible to tell without the rating')]], 'a',
      L(`קונים ב־${n0(M4_PRICES[0]!)} ומקבלים ${n0(B.face)} בפדיון — רווח שמתווסף לקופון. התשואה לפדיון: ${pc(ytm(M4_PRICES[0]!, B.face, B.coupon, B.years), 2)}.`, `You buy at ${n0(M4_PRICES[0]!)} and get ${n0(B.face)} at maturity — a gain on top of the coupon. The yield to maturity: ${pc(ytm(M4_PRICES[0]!, B.face, B.coupon, B.years), 2)}.`))
  ]
};

// ---------- M5 · the yield curve as a signal ----------
const i2 = MATURITIES.indexOf('2Y'), i10 = MATURITIES.indexOf('10Y');
const spreadOf = (c: number[]) => c[i10]! - c[i2]!;
const curve = (title: ReturnType<typeof L>, series: Array<{ label: ReturnType<typeof L>; tone: 'ok' | 'err' | 'info' | 'learn' | 'adv' | 'risk' | 'muted'; values: number[] }>, caption?: ReturnType<typeof L>): Diagram => ({
  type: 'grouped', title, groups: MATURITIES, series: series.map((s) => ({ ...s, shown: s.values.map((v) => pc(v, 1)) })), ...(caption ? { caption } : {})
});
const normal = { label: L('עקום רגיל', 'Normal curve'), tone: 'info' as const, values: CURVE_NORMAL };
const inverted = { label: L('עקום הפוך', 'Inverted curve'), tone: 'err' as const, values: CURVE_INVERTED };
const QS = M5_SPREAD.map((_, i) => String(i + 1));
const firstInv = M5_SPREAD.findIndex((x) => x < 0);
const lastInv = M5_SPREAD.length - 1 - [...M5_SPREAD].reverse().findIndex((x) => x < 0);
const spreadLines: Diagram = { type: 'lines', title: L('הפער 10Y − 2Y, רבעון אחר רבעון', 'The 10Y − 2Y spread, quarter by quarter'), x: QS, xTitle: L('רבעון', 'Quarter'), unit: '%',
  series: [{ label: L('10Y − 2Y', '10Y − 2Y'), tone: 'adv', values: M5_SPREAD }], ticks: [0, 9, 19, 29, 39],
  bands: [{ from: M5_RECESSION.from, to: M5_RECESSION.to, label: L('מיתון', 'Recession') }],
  marks: [{ at: firstInv, series: 0, label: L('היפוך', 'Inversion') }],
  caption: L('עשר שנים להמחשה. מתחת לאפס: העקום הפוך.', 'Ten illustrative years. Below zero: the curve is inverted.') };
const TRY_TONES = { A: 'info', B: 'learn', C: 'err' } as const;

export const M5: LessonContent = {
  id: 'M5',
  tutor: { topic: 'yield-curve', label: L('עקום התשואות', 'the yield curve') },
  teach: [
    {
      heading: L('עקום התשואות', 'The yield curve'),
      paragraphs: [
        L('עקום התשואות מציג את התשואה של אג״ח ממשלתיות — אותו לווה בדיוק — לפי הזמן עד הפדיון: שלושה חודשים, שנתיים, חמש, עשר ושלושים שנה. כיוון שהלווה זהה, ההבדלים בין העמודות מספרים רק על הזמן.',
          'The yield curve shows the yields of government bonds — exactly the same borrower — by the time to maturity: three months, two years, five, ten and thirty years. Since the borrower is the same, the differences between the bars tell only about time.'),
        L(`בדרך כלל העקום עולה: ${pc(CURVE_NORMAL[0]!, 1)} לשלושה חודשים, ${pc(CURVE_NORMAL[i10]!, 1)} לעשר שנים. מי שנועל כסף לתקופה ארוכה רוצה פיצוי על אי־הוודאות — אינפלציה, ריבית, כל מה שיכול לקרות בעשור.`,
          `Usually the curve slopes up: ${pc(CURVE_NORMAL[0]!, 1)} for three months, ${pc(CURVE_NORMAL[i10]!, 1)} for ten years. Whoever locks money up for a long time wants compensation for the uncertainty — inflation, rates, whatever can happen in a decade.`),
        L('את הקצה הקצר מושך בעיקר הבנק המרכזי: הריבית שלו קובעת כמעט ישירות את התשואה לחודשים ספורים. את הקצה הארוך קובע השוק — לפי מה שהוא מצפה לריבית ולאינפלציה בשנים הבאות.',
          'The short end is pulled mainly by the central bank: its rate sets the yield for a few months almost directly. The long end is set by the market — by what it expects of rates and inflation in the years ahead.')
      ],
      work: { kind: 'diagram', diagram: curve(L('תשואה לפי זמן לפדיון', 'Yield by time to maturity'), [normal], L('אג״ח ממשלתיות להמחשה.', 'Illustrative government bonds.')) }
    },
    {
      heading: L('רגיל מול הפוך', 'Normal vs inverted'),
      paragraphs: [
        L(`לפעמים העקום מתהפך: התשואה לטווח קצר גבוהה מזו לטווח ארוך. בעקום ההפוך כאן, שלושה חודשים משלמים ${pc(CURVE_INVERTED[0]!, 1)} ועשר שנים רק ${pc(CURVE_INVERTED[i10]!, 1)}.`,
          `Sometimes the curve flips: the short-term yield is higher than the long-term one. In the inverted curve here, three months pay ${pc(CURVE_INVERTED[0]!, 1)} and ten years only ${pc(CURVE_INVERTED[i10]!, 1)}.`),
        L('איך זה קורה? הבנק המרכזי העלה את הריבית הקצרה גבוה כדי לבלום אינפלציה — ושוק האג״ח מצפה שבגלל זה המשק יאט, ושהריבית תרד בהמשך. לכן הוא מוכן לנעול תשואה ארוכה נמוכה יותר.',
          'How does that happen? The central bank has pushed the short rate high to curb inflation — and the bond market expects that, because of it, the economy will slow and rates will fall later. So it is willing to lock in a lower long yield.'),
        L('עקום הפוך הוא, במילים אחרות, הימור של השוק על האטה. זו הסיבה שעוקבים אחריו כל כך.',
          'An inverted curve is, in other words, the market betting on a slowdown. That is why it is watched so closely.')
      ],
      work: { kind: 'diagram', diagram: curve(L('שני עקומים', 'Two curves'), [normal, inverted]) }
    },
    {
      heading: L('10Y − 2Y', '10Y − 2Y'),
      paragraphs: [
        L(`דרך מקובלת לסכם את העקום במספר אחד: התשואה לעשר שנים פחות התשואה לשנתיים. בעקום הרגיל: ${ltr(`${pc(CURVE_NORMAL[i10]!, 1)} − ${pc(CURVE_NORMAL[i2]!, 1)} = ${pc(spreadOf(CURVE_NORMAL), 1)}`)}. בהפוך: ${ltr(`${pc(CURVE_INVERTED[i10]!, 1)} − ${pc(CURVE_INVERTED[i2]!, 1)} = ${pc(spreadOf(CURVE_INVERTED), 1)}`)}. מתחת לאפס — העקום הפוך.`,
          `A common way to sum up the curve in one number: the ten-year yield minus the two-year. In the normal curve: ${pc(CURVE_NORMAL[i10]!, 1)} − ${pc(CURVE_NORMAL[i2]!, 1)} = ${pc(spreadOf(CURVE_NORMAL), 1)}. In the inverted one: ${pc(CURVE_INVERTED[i10]!, 1)} − ${pc(CURVE_INVERTED[i2]!, 1)} = ${pc(spreadOf(CURVE_INVERTED), 1)}. Below zero — the curve is inverted.`),
        L(`בגרף, הפער יורד לאט, חוצה את האפס ברבעון ${firstInv + 1}, נשאר מתחתיו עד רבעון ${lastInv + 1} — והמיתון מגיע ברבעון ${M5_RECESSION.from + 1}, ${M5_RECESSION.from - firstInv} רבעונים אחרי ההיפוך. שימו לב: כשהמיתון מתחיל, העקום כבר חזר להיות רגיל.`,
          `In the chart, the spread falls slowly, crosses zero in quarter ${firstInv + 1}, stays below it until quarter ${lastInv + 1} — and the recession arrives in quarter ${M5_RECESSION.from + 1}, ${M5_RECESSION.from - firstInv} quarters after the inversion. Notice: by the time the recession starts, the curve is normal again.`),
        L('בארה״ב, היפוך כזה קדם לרוב המיתונים של חמישים השנים האחרונות, לעיתים קרובות בשנה או יותר. אבל הזמן משתנה מאוד מפעם לפעם, והיו גם היפוכים שאחריהם לא הגיע מיתון בקרוב.',
          'In the US, an inversion like this came before most recessions of the last fifty years, often by a year or more. But the lead time varies a lot from one time to the next, and there have also been inversions not soon followed by a recession.')
      ],
      work: { kind: 'diagram', diagram: spreadLines }
    }
  ],
  charts: [],
  activity: {
    kind: 'checklist',
    prompt: L('קראו את העקום', 'Read the curve'),
    task: L('שלושה עקומים, משלושה תאריכים שונים. ענו לפי הסדר.', 'Three curves, from three different dates. Answer in order.'),
    diagram: curve(L('שלושה תאריכים', 'Three dates'), (['A', 'B', 'C'] as const).map((k) => ({ label: L(`תאריך ${({ A: 'א', B: 'ב', C: 'ג' })[k]}`, `Date ${k}`), tone: TRY_TONES[k], values: CURVES_TRY[k] }))),
    items: [
      { id: 'inv', question: L('איזה עקום הפוך?', 'Which curve is inverted?'), options: [{ key: 'A', label: L('תאריך א', 'Date A') }, { key: 'B', label: L('תאריך ב', 'Date B') }, { key: 'C', label: L('תאריך ג', 'Date C') }], correct: 'C',
        why: L(`בתאריך ג, שלושה חודשים משלמים ${pc(CURVES_TRY.C[0]!, 1)} ועשר שנים ${pc(CURVES_TRY.C[i10]!, 1)} — הקצר מעל הארוך.`, `On date C, three months pay ${pc(CURVES_TRY.C[0]!, 1)} and ten years ${pc(CURVES_TRY.C[i10]!, 1)} — short above long.`) },
      { id: 'spread', question: L('מה הפער 10Y − 2Y בתאריך א?', 'What is the 10Y − 2Y spread on date A?'),
        options: nums([pc(spreadOf(CURVES_TRY.A), 1), pc(CURVES_TRY.A[4]! - CURVES_TRY.A[0]!, 1), pc(-spreadOf(CURVES_TRY.A), 1), pc(CURVES_TRY.A[i10]!, 1)]).map(([key, label]) => ({ key, label })), correct: 'a',
        why: L(`${ltr(`${pc(CURVES_TRY.A[i10]!, 1)} − ${pc(CURVES_TRY.A[i2]!, 1)} = ${pc(spreadOf(CURVES_TRY.A), 1)}`)}: עקום רגיל ותלול.`, `${pc(CURVES_TRY.A[i10]!, 1)} − ${pc(CURVES_TRY.A[i2]!, 1)} = ${pc(spreadOf(CURVES_TRY.A), 1)}: a normal, steep curve.`) },
      { id: 'flat', question: L('איך נראה העקום בתאריך ב?', 'What does the curve look like on date B?'),
        options: [{ key: 'flat', label: L(`כמעט שטוח: פער של ${pc(spreadOf(CURVES_TRY.B), 2)}`, `Almost flat: a spread of ${pc(spreadOf(CURVES_TRY.B), 2)}`) }, { key: 'steep', label: L('רגיל ותלול', 'Normal and steep') }, { key: 'inv', label: L('הפוך', 'Inverted') }], correct: 'flat',
        why: L('כל הזמנים משלמים כמעט אותו דבר. עקום שטוח מופיע לעיתים קרובות בדרך מרגיל להפוך — או חזרה.', 'Every maturity pays almost the same. A flat curve often appears on the way from normal to inverted — or back.') },
      { id: 'read', question: L('מה שוק האג״ח "אומר" בתאריך ג?', 'What is the bond market "saying" on date C?'),
        options: [{ key: 'slow', label: L('שהוא מצפה שהריבית תרד בהמשך — כנראה בגלל האטה', 'That it expects rates to fall later — probably because of a slowdown') }, { key: 'boom', label: L('שהוא מצפה לצמיחה חזקה ולריבית עולה', 'That it expects strong growth and rising rates') }, { key: 'safe', label: L('שאג״ח ארוכות מסוכנות יותר מקצרות', 'That long bonds are riskier than short ones') }], correct: 'slow',
        why: L('ריבית קצרה גבוהה היום ותשואה ארוכה נמוכה יותר: השוק מוכן לנעול פחות לטווח ארוך, כי הוא מצפה שהריבית תרד.', 'A high short rate today and a lower long yield: the market is willing to lock in less for the long term, because it expects rates to fall.') }
    ],
    right: L('קראתם את שלושת העקומים: רגיל ותלול, שטוח, והפוך.', 'You read all three curves: normal and steep, flat, and inverted.'),
    explain: [
      L('איתות, לא תחזית. עקום הפוך מספר מה שוק האג״ח מצפה לו — וזה מידע חשוב, כי השוק הזה גדול ומתמחר ריבית ברצינות. אבל הוא לא אומר מתי יגיע מיתון, אם בכלל, וגם לא כמה עמוק.',
        'A signal, not a forecast. An inverted curve tells what the bond market expects — which matters, because that market is large and prices rates seriously. But it does not say when a recession will come, if at all, nor how deep.'),
      L('ומניות לא בהכרח יורדות מיד: בגרף, בין ההיפוך למיתון עברו רבעונים רבים. מי שמכר הכול ביום ההיפוך יכול היה לפספס תקופה ארוכה. העקום הוא עוד נתון לתמונה — לא הוראה.',
        'And stocks do not necessarily fall at once: in the chart, many quarters passed between the inversion and the recession. Whoever sold everything on the day of the inversion could have missed a long stretch. The curve is one more piece of the picture — not an instruction.')
    ]
  },
  apply: mq('m5-apply', 'M5', { type: 'table', title: L('תשואות היום', 'Today\'s yields'), columns: [L('זמן לפדיון', 'Maturity'), L('תשואה', 'Yield')], rows: [
    { label: L('שנתיים', '2 years'), cells: [pc(M5_APPLY.two, 1)] },
    { label: L('10 שנים', '10 years'), cells: [pc(M5_APPLY.ten, 1)] }
  ] }, 'intermediate', L('מה הפער 10Y − 2Y, ומה הוא אומר?', 'What is the 10Y − 2Y spread, and what does it say?'),
    [['a', L(`${pc(M5_APPLY.ten - M5_APPLY.two, 1)}: העקום הפוך`, `${pc(M5_APPLY.ten - M5_APPLY.two, 1)}: the curve is inverted`)], ['b', L(`${pc(M5_APPLY.two - M5_APPLY.ten, 1)}: העקום רגיל`, `${pc(M5_APPLY.two - M5_APPLY.ten, 1)}: the curve is normal`)], ['c', L(`${pc(M5_APPLY.ten + M5_APPLY.two, 1)}: תשואות גבוהות`, `${pc(M5_APPLY.ten + M5_APPLY.two, 1)}: high yields`)], ['d', L('מיתון יתחיל ברבעון הבא', 'A recession will start next quarter')]], 'a',
    L(`${ltr(`${pc(M5_APPLY.ten, 1)} − ${pc(M5_APPLY.two, 1)} = ${pc(M5_APPLY.ten - M5_APPLY.two, 1)}`)}: שלילי, כלומר הפוך. זה איתות שהשוק מצפה להאטה ולהורדות ריבית — לא תאריך למיתון.`, `${pc(M5_APPLY.ten, 1)} − ${pc(M5_APPLY.two, 1)} = ${pc(M5_APPLY.ten - M5_APPLY.two, 1)}: negative, that is, inverted. It signals that the market expects a slowdown and rate cuts — not a date for a recession.`)),
  takeaway: {
    bottomLine: L('עקום התשואות מראה תשואה לפי זמן לפדיון. בדרך כלל הוא עולה; כשהוא מתהפך (10Y − 2Y מתחת לאפס), השוק מצפה שהריבית תרד — ובעבר זה קדם לרוב המיתונים בארה״ב.', 'The yield curve shows yield by time to maturity. It usually slopes up; when it inverts (10Y − 2Y below zero), the market expects rates to fall — and in the past this came before most US recessions.'),
    caveat: L('הזמן בין ההיפוך למיתון משתנה מאוד, והיו היפוכים בלי מיתון קרוב. זה איתות להקשיב לו, לא לוח זמנים.', 'The time between an inversion and a recession varies a lot, and there have been inversions without a recession soon after. It is a signal to listen to, not a timetable.')
  },
  questions: [
    mq('m5-shape', 'M5', curve(L('עקום התשואות, היום', 'The yield curve, today'), [{ label: L('תשואה', 'Yield'), tone: 'info', values: CURVE_NORMAL }]), 'beginner', L('איזה עקום זה?', 'What kind of curve is this?'),
      [['a', L('רגיל — ארוך משלם יותר מקצר', 'Normal — long pays more than short')], ['b', L('הפוך — קצר משלם יותר מארוך', 'Inverted — short pays more than long')], ['c', L('שטוח — כולם משלמים אותו דבר', 'Flat — they all pay the same')], ['d', L('אי אפשר לדעת בלי מחירי מניות', 'You cannot tell without share prices')]], 'a',
      L(`מ־${pc(CURVE_NORMAL[0]!, 1)} לשלושה חודשים עד ${pc(CURVE_NORMAL[4]!, 1)} לשלושים שנה: עולה, כרגיל. הפער 10Y − 2Y: ${pc(spreadOf(CURVE_NORMAL), 1)}.`, `From ${pc(CURVE_NORMAL[0]!, 1)} for three months to ${pc(CURVE_NORMAL[4]!, 1)} for thirty years: rising, as usual. The 10Y − 2Y spread: ${pc(spreadOf(CURVE_NORMAL), 1)}.`)),
    mq('m5-spread', 'M5', curve(L('עקום התשואות', 'The yield curve'), [inverted]), 'intermediate', L('מה הפער 10Y − 2Y?', 'What is the 10Y − 2Y spread?'),
      nums([pc(spreadOf(CURVE_INVERTED), 1), pc(-spreadOf(CURVE_INVERTED), 1), pc(CURVE_INVERTED[4]! - CURVE_INVERTED[0]!, 1), pc(CURVE_INVERTED[i10]!, 1)]), 'a',
      L(`${ltr(`${pc(CURVE_INVERTED[i10]!, 1)} − ${pc(CURVE_INVERTED[i2]!, 1)} = ${pc(spreadOf(CURVE_INVERTED), 1)}`)} — שלילי: העקום הפוך.`, `${pc(CURVE_INVERTED[i10]!, 1)} − ${pc(CURVE_INVERTED[i2]!, 1)} = ${pc(spreadOf(CURVE_INVERTED), 1)} — negative: the curve is inverted.`)),
    mq('m5-why', 'M5', { type: 'flow', title: L('איך עקום מתהפך', 'How a curve inverts'), stages: [
      { label: L('אינפלציה גבוהה', 'High inflation'), sub: L('הבנק המרכזי מעלה ריבית', 'The central bank raises rates') },
      { label: L('הקצה הקצר עולה', 'The short end rises'), sub: L('תשואות לחודשים ולשנתיים מטפסות', 'Yields for months and two years climb') },
      { label: L('?', '?'), sub: L('מה קורה לקצה הארוך', 'What happens at the long end') }
    ] }, 'intermediate', L('למה התשואה הארוכה יכולה להישאר נמוכה מהקצרה?', 'Why can the long yield stay below the short one?'),
      [['a', L('השוק מצפה שהריבית תרד בעתיד, כי המשק יאט', 'The market expects rates to fall later, as the economy slows')], ['b', L('הבנק המרכזי קובע גם את התשואה לעשר שנים', 'The central bank sets the ten-year yield too')], ['c', L('אג״ח ארוכות בטוחות יותר, אז משלמות פחות', 'Long bonds are safer, so they pay less')], ['d', L('כי יש פחות אג״ח ארוכות', 'Because there are fewer long bonds')]], 'a',
      L('את הקצה הקצר מושך הבנק; את הארוך קובעות הציפיות. אם השוק מאמין שהריבית הגבוהה תאט את המשק ותרד בהמשך, הממוצע הצפוי לעשר שנים נמוך מהריבית של היום — והעקום מתהפך.', 'The bank pulls the short end; expectations set the long end. If the market believes high rates will slow the economy and come down later, the expected average over ten years is below today\'s rate — and the curve inverts.'))
  ]
};

// ---------- M6 · the dollar, gold and commodities ----------
const fx = (c: { stock: number; dollar: number }) => inShekels(c.stock, c.dollar);
const fxTable = (c: { stock: number; dollar: number }, title: ReturnType<typeof L>): Diagram => ({ type: 'table', title, columns: [L('נתון', 'Figure'), L('שינוי', 'Change')], rows: [
  { label: L('המניה, בדולרים', 'The stock, in dollars'), cells: [sp(c.stock, 0)] },
  { label: L('הדולר מול השקל', 'The dollar against the shekel'), cells: [sp(c.dollar, 0)] }
] });
const goldRows = GOLD_COST.rates.map((r) => ({ r, deposit: (GOLD_COST.amount * r) / 100 }));

export const M6: LessonContent = {
  id: 'M6',
  tutor: { topic: 'dollar-strength', label: L('הדולר, זהב וסחורות', 'the dollar, gold and commodities') },
  teach: [
    {
      heading: L('הדולר: השקעה שנייה בתוך הראשונה', 'The dollar: a second investment inside the first'),
      paragraphs: [
        L(`מי שגר בישראל וקונה מניה אמריקאית מחזיק בעצם שני דברים: את המניה, ואת הדולר. אם המניה עלתה ${sp(FX_CASE.stock, 0)} בדולרים אבל הדולר ירד ${pc(-FX_CASE.dollar, 0)} מול השקל, התשואה בשקלים היא ${ltr(`${(1 + FX_CASE.stock / 100).toFixed(2)} × ${(1 + FX_CASE.dollar / 100).toFixed(2)} − 1 = ${sp(fx(FX_CASE))}`)}.`,
          `Someone living in Israel who buys a US stock really holds two things: the stock, and the dollar. If the stock rose ${sp(FX_CASE.stock, 0)} in dollars but the dollar fell ${pc(-FX_CASE.dollar, 0)} against the shekel, the return in shekels is ${(1 + FX_CASE.stock / 100).toFixed(2)} × ${(1 + FX_CASE.dollar / 100).toFixed(2)} − 1 = ${sp(fx(FX_CASE))}.`),
        L('מה מזיז את הדולר? אחד הגורמים החזקים הוא הריבית: כשהריבית בארה״ב עולה ביחס למדינות אחרות, כסף זורם לשם כדי ליהנות מהתשואה, והדולר נוטה להתחזק. גם בזמני פחד משקיעים נוטים לברוח לדולר, כמטבע המרכזי של העולם.',
          'What moves the dollar? One of the strongest forces is the rate: when US rates rise relative to other countries, money flows there for the yield, and the dollar tends to strengthen. In times of fear, too, investors tend to run to the dollar, as the world\'s central currency.'),
        L('לדולר חזק יש מחיר: הוא מקטין את הרווחים שחברות אמריקאיות מרוויחות בחו״ל כשמתרגמים אותם לדולרים, ומכביד על מדינות וחברות שלוו בדולרים.',
          'A strong dollar has a price: it shrinks the profits US companies earn abroad once translated into dollars, and weighs on countries and companies that borrowed in dollars.')
      ],
      work: { kind: 'diagram', diagram: fxTable(FX_CASE, L('מניה אמריקאית, בעיני משקיע ישראלי', 'A US stock, through an Israeli investor\'s eyes')) }
    },
    {
      heading: L('זהב: נכס שלא משלם כלום', 'Gold: an asset that pays nothing'),
      paragraphs: [
        L('זהב לא משלם ריבית ולא דיבידנד. הערך שלו הוא רק מה שמישהו אחר ישלם עליו. לכן המתחרה העיקרי שלו הוא פיקדון או אג״ח בטוחה — ובמיוחד הריבית הריאלית עליהם, אחרי אינפלציה.',
          'Gold pays no interest and no dividend. Its value is only what someone else will pay for it. So its main competitor is a deposit or a safe bond — and especially the real rate on them, after inflation.'),
        L(`כשהריבית הריאלית ${pc(GOLD_COST.rates[2]!, 0)}, מי שמחזיק ${n0(GOLD_COST.amount)} בזהב מוותר על ${n0(goldRows[2]!.deposit)} בשנה בכוח קנייה שפיקדון היה מרוויח. כשהיא ${pc(GOLD_COST.rates[0]!, 0)}, הפיקדון עצמו מפסיד ${n0(-goldRows[0]!.deposit)} בשנה — והזהב לא מוותר על כלום. לכן זהב נוטה להתחזק כשהריבית הריאלית יורדת, ולהיחלש כשהיא עולה.`,
          `When the real rate is ${pc(GOLD_COST.rates[2]!, 0)}, whoever holds ${n0(GOLD_COST.amount)} in gold gives up ${n0(goldRows[2]!.deposit)} a year of buying power that a deposit would earn. When it is ${pc(GOLD_COST.rates[0]!, 0)}, the deposit itself loses ${n0(-goldRows[0]!.deposit)} a year — and gold gives up nothing. So gold tends to strengthen when the real rate falls, and weaken when it rises.`),
        L('לצד זה, זהב נחשב "מקום מבטחים": בזמני משבר, פחד מאינפלציה או אי־ודאות פוליטית, הביקוש לו עולה. אלה נטיות חזקות — אבל גם לזהב היו ירידות ארוכות.',
          'Beside that, gold is seen as a "safe haven": in times of crisis, fear of inflation or political uncertainty, demand for it rises. These are strong tendencies — but gold, too, has had long declines.')
      ],
      work: { kind: 'diagram', diagram: { type: 'table', title: L(`מה ${n0(GOLD_COST.amount)} היו מרוויחים בפיקדון, בכוח קנייה`, `What ${n0(GOLD_COST.amount)} would earn on deposit, in buying power`), columns: [L('ריבית ריאלית', 'Real rate'), L('בשנה', 'A year'), L('המחיר של להחזיק זהב במקום', 'The cost of holding gold instead')],
        rows: goldRows.map((g) => ({ label: L(pc(g.r, 0), pc(g.r, 0)), cells: [n0(g.deposit), g.deposit > 0 ? n0(g.deposit) : L('אין — הפיקדון מפסיד', 'None — the deposit loses')] })) } }
    },
    {
      heading: L('סחורות: הכלכלה בחומרי גלם', 'Commodities: the economy in raw materials'),
      paragraphs: [
        L('סחורות הן חומרי הגלם של המשק: נפט וגז, מתכות כמו נחושת, ומוצרי חקלאות כמו חיטה. המחיר שלהן נקבע בעיקר מהיצע וביקוש פיזיים — כמה מפיקים, וכמה העולם צריך.',
          'Commodities are the economy\'s raw materials: oil and gas, metals such as copper, and farm goods such as wheat. Their price is set mainly by physical supply and demand — how much is produced, and how much the world needs.'),
        L('לכן הן קשורות לצמיחה העולמית: כשהמשק העולמי מתרחב, בונים ומייצרים יותר, והביקוש לנחושת ולנפט עולה. וזעזוע היצע — מלחמה, החלטה של יצרניות להפחית תפוקה — יכול להקפיץ מחיר בלי שום קשר לביקוש.',
          'So they are tied to global growth: when the world economy expands, more is built and made, and demand for copper and oil rises. And a supply shock — a war, a decision by producers to cut output — can make a price jump regardless of demand.'),
        L('ומשם חזרה לאינפלציה: אנרגיה נמצאת כמעט בכל מוצר ובכל נסיעה. קפיצה בנפט מעלה מחירים בכל המשק, ומציבה את הבנק המרכזי מול דילמה קשה — אינפלציה עולה בזמן שהצמיחה נפגעת.',
          'And from there back to inflation: energy is in almost every product and every journey. A jump in oil lifts prices across the economy, and puts the central bank in a hard spot — inflation rising while growth suffers.')
      ],
      work: { kind: 'diagram', diagram: { type: 'flow', title: L('זעזוע היצע בנפט', 'An oil supply shock'), stages: [
        { label: L('פחות נפט', 'Less oil'), sub: L('מלחמה או קיצוץ תפוקה', 'A war or an output cut') },
        { label: L('הנפט מתייקר', 'Oil gets dearer'), sub: L('דלק, תחבורה, ייצור', 'Fuel, transport, production') },
        { label: L('האינפלציה עולה', 'Inflation rises'), sub: L('והצמיחה נפגעת', 'And growth suffers') },
        { label: L('דילמה לבנק', 'A dilemma for the bank'), sub: L('להילחם במחירים או בהאטה?', 'Fight prices, or the slowdown?') }
      ] } }
    }
  ],
  charts: [],
  activity: {
    kind: 'checklist',
    prompt: L('מה הייתם מצפים?', 'What would you expect?'),
    task: L('ארבעה תרחישים. לכל אחד — מה הנטייה הסבירה? ענו לפי הסדר.', 'Four scenarios. For each — what is the likely tendency? Answer in order.'),
    diagram: { type: 'table', title: L('ארבעה תרחישים', 'Four scenarios'), columns: [L('תרחיש', 'Scenario'), L('מה קרה', 'What happened')], rows: [
      { label: L('1', '1'), cells: [L('הפד מעלה ריבית, ושאר הבנקים המרכזיים לא', 'The Fed raises rates, and the other central banks do not')] },
      { label: L('2', '2'), cells: [L('הריבית הריאלית יורדת בחדות', 'The real rate falls sharply')] },
      { label: L('3', '3'), cells: [L('יצרניות הנפט מקצצות תפוקה', 'Oil producers cut output')] },
      { label: L('4', '4'), cells: [L(`מניה אמריקאית ${sp(FX_TRY.stock, 0)} בדולרים; הדולר ${sp(FX_TRY.dollar, 0)} מול השקל`, `A US stock ${sp(FX_TRY.stock, 0)} in dollars; the dollar ${sp(FX_TRY.dollar, 0)} against the shekel`)] }
    ] },
    items: [
      { id: 'usd', question: L('1 · הדולר נוטה —', '1 · The dollar tends to —'), options: [{ key: 'up', label: L('להתחזק', 'Strengthen') }, { key: 'down', label: L('להיחלש', 'Weaken') }, { key: 'same', label: L('לא לזוז — ריבית לא קשורה למטבע', 'Stay put — rates are unrelated to currency') }], correct: 'up',
        why: L('תשואה גבוהה יותר בדולרים מושכת כסף מבחוץ, ומי שרוצה אותה צריך לקנות דולרים.', 'A higher yield in dollars draws money from abroad, and whoever wants it has to buy dollars.') },
      { id: 'gold', question: L('2 · הזהב נוטה —', '2 · Gold tends to —'), options: [{ key: 'up', label: L('להתחזק', 'Strengthen') }, { key: 'down', label: L('להיחלש', 'Weaken') }, { key: 'same', label: L('לא לזוז — לזהב אין ריבית', 'Stay put — gold has no rate') }], correct: 'up',
        why: L('כשהפיקדון מרוויח פחות בכוח קנייה, המחיר של להחזיק זהב במקומו יורד — והביקוש לזהב נוטה לעלות.', 'When a deposit earns less in buying power, the cost of holding gold instead falls — and demand for gold tends to rise.') },
      { id: 'oil', question: L('3 · מה סביר שיקרה?', '3 · What is likely to happen?'), options: [{ key: 'up', label: L('הנפט מתייקר, והאינפלציה עולה', 'Oil gets dearer, and inflation rises') }, { key: 'down', label: L('הנפט מתייקר, והאינפלציה יורדת', 'Oil gets dearer, and inflation falls') }, { key: 'none', label: L('הנפט מוזל — פחות היצע', 'Oil gets cheaper — less supply') }], correct: 'up',
        why: L('פחות היצע באותו ביקוש — מחיר גבוה יותר. ואנרגיה נכנסת כמעט לכל מחיר במשק.', 'Less supply for the same demand — a higher price. And energy goes into almost every price in the economy.') },
      { id: 'fx', question: L('4 · מה התשואה בשקלים?', '4 · What is the return in shekels?'),
        options: nums([sp(fx(FX_TRY)), sp(FX_TRY.stock + FX_TRY.dollar, 1), sp(FX_TRY.stock, 1), sp(FX_TRY.stock - FX_TRY.dollar, 1)]).map(([key, label]) => ({ key, label })), correct: 'a',
        why: L(`${ltr(`${(1 + FX_TRY.stock / 100).toFixed(2)} × ${(1 + FX_TRY.dollar / 100).toFixed(2)} − 1 = ${sp(fx(FX_TRY))}`)}: המניה עלתה, והמשקיע הישראלי הפסיד. ${sp(FX_TRY.stock + FX_TRY.dollar, 1)} הוא קירוב — שני השינויים מצטברים זה על זה.`, `${(1 + FX_TRY.stock / 100).toFixed(2)} × ${(1 + FX_TRY.dollar / 100).toFixed(2)} − 1 = ${sp(fx(FX_TRY))}: the stock rose, and the Israeli investor lost. ${sp(FX_TRY.stock + FX_TRY.dollar, 1)} is an approximation — the two changes compound.`) }
    ],
    right: L('ארבע תשובות נכונות: ריבית שמושכת כסף, ריבית ריאלית שמזיזה זהב, היצע שמזיז נפט — ומטבע שמשנה את התשואה שלכם.', 'Four right answers: a rate that draws money, a real rate that moves gold, supply that moves oil — and a currency that changes your return.'),
    explain: [
      L('קשרים שנשברים. כל התשובות כאן הן נטיות, לא חוקים. יש תקופות שבהן הדולר והזהב עולים יחד, כי שניהם נחשבים מקום מבטחים; יש תקופות שבהן זהב נחלש למרות פחד. כשכמה כוחות פועלים בבת אחת, החזק מביניהם מנצח — ולא תמיד ברור מראש מי הוא.',
        'Links that break. Every answer here is a tendency, not a law. There are periods when the dollar and gold rise together, because both are seen as safe havens; there are periods when gold weakens despite fear. When several forces act at once, the strongest wins — and it is not always clear in advance which one that is.'),
      L('מה שכן נשאר: לדעת מה אמור להזיז כל נכס. כך, כשמשהו זז "הפוך", אתם יודעים לשאול איזה כוח אחר גבר — במקום להסיק שהעולם השתגע.',
        'What does hold: knowing what should move each asset. Then, when something moves "the wrong way", you know to ask which other force won — rather than conclude the world has gone mad.')
    ]
  },
  apply: mq('m6-apply', 'M6', fxTable(FX_Q, L('מניה אמריקאית, שנה אחרת', 'A US stock, another year')), 'intermediate', L('מה התשואה בשקלים?', 'What is the return in shekels?'),
    nums([sp(fx(FX_Q)), sp(FX_Q.stock, 1), sp(FX_Q.dollar, 1), sp(-fx(FX_Q))]), 'a',
    L(`${ltr(`${(1 + FX_Q.stock / 100).toFixed(2)} × ${(1 + FX_Q.dollar / 100).toFixed(2)} − 1 = ${sp(fx(FX_Q))}`)}. המניה ירדה בדולרים, אבל הדולר התחזק מול השקל — והמשקיע הישראלי הרוויח.`, `${(1 + FX_Q.stock / 100).toFixed(2)} × ${(1 + FX_Q.dollar / 100).toFixed(2)} − 1 = ${sp(fx(FX_Q))}. The stock fell in dollars, but the dollar strengthened against the shekel — and the Israeli investor gained.`)),
  takeaway: {
    bottomLine: L('השקעה במטבע אחר היא גם השקעה במטבע. הדולר נוטה להתחזק כשהריבית בארה״ב עולה יחסית ובזמני פחד; זהב — כשהריבית הריאלית יורדת; סחורות — עם הצמיחה העולמית וזעזועי היצע.', 'Investing in another currency is also investing in that currency. The dollar tends to strengthen when US rates rise relatively and in times of fear; gold — when the real rate falls; commodities — with global growth and supply shocks.'),
    caveat: L('אלה נטיות שנשברות לעיתים קרובות, כשכמה כוחות פועלים יחד. הן עוזרות להבין תנועה — לא לחזות אותה.', 'These are tendencies that often break when several forces act together. They help explain a move — not predict it.')
  },
  questions: [
    mq('m6-fx', 'M6', fxTable(FX_CASE, L('מניה אמריקאית', 'A US stock')), 'beginner', L('מה התשואה בשקלים?', 'What is the return in shekels?'),
      nums([sp(fx(FX_CASE)), sp(FX_CASE.stock - FX_CASE.dollar, 1), sp(FX_CASE.stock, 1), sp(FX_CASE.dollar, 1)]), 'a',
      L(`${ltr(`${(1 + FX_CASE.stock / 100).toFixed(2)} × ${(1 + FX_CASE.dollar / 100).toFixed(2)} − 1 = ${sp(fx(FX_CASE))}`)}. חלק מהרווח במניה נאכל בירידת הדולר.`, `${(1 + FX_CASE.stock / 100).toFixed(2)} × ${(1 + FX_CASE.dollar / 100).toFixed(2)} − 1 = ${sp(fx(FX_CASE))}. Part of the stock's gain was eaten by the dollar's fall.`)),
    mq('m6-gold', 'M6', { type: 'table', title: L('שלוש סביבות ריבית', 'Three rate environments'), columns: [L('סביבה', 'Environment'), L('ריבית ריאלית', 'Real rate')], rows: goldRows.map((g, i) => ({ label: L(['א', 'ב', 'ג'][i]!, ['A', 'B', 'C'][i]!), cells: [pc(g.r, 0)] })) }, 'intermediate',
      L('באיזו סביבה הכי "זול" להחזיק זהב במקום פיקדון?', 'In which environment is it "cheapest" to hold gold instead of a deposit?'),
      [['a', L(`א — ריבית ריאלית ${pc(GOLD_COST.rates[0]!, 0)}`, `A — a real rate of ${pc(GOLD_COST.rates[0]!, 0)}`)], ['b', L(`ב — ${pc(GOLD_COST.rates[1]!, 0)}`, `B — ${pc(GOLD_COST.rates[1]!, 0)}`)], ['c', L(`ג — ${pc(GOLD_COST.rates[2]!, 0)}`, `C — ${pc(GOLD_COST.rates[2]!, 0)}`)], ['d', L('אותו דבר בכולן — זהב לא תלוי בריבית', 'The same in all — gold does not depend on rates')]], 'a',
      L(`כשהריבית הריאלית שלילית, הפיקדון עצמו מאבד כוח קנייה (${n0(goldRows[0]!.deposit)} בשנה על ${n0(GOLD_COST.amount)}), כך שהזהב לא מוותר על כלום. בסביבה ג הוא מוותר על ${n0(goldRows[2]!.deposit)} בשנה.`, `When the real rate is negative, the deposit itself loses buying power (${n0(goldRows[0]!.deposit)} a year on ${n0(GOLD_COST.amount)}), so gold gives up nothing. In environment C it gives up ${n0(goldRows[2]!.deposit)} a year.`)),
    mq('m6-oil', 'M6', { type: 'flow', title: L('זעזוע היצע', 'A supply shock'), stages: [
      { label: L('פחות נפט', 'Less oil'), sub: L('קיצוץ תפוקה', 'An output cut') },
      { label: L('הנפט מתייקר', 'Oil gets dearer'), sub: L('אנרגיה בכל מחיר', 'Energy in every price') },
      { label: L('?', '?'), sub: L('מה עומד מול הבנק המרכזי', 'What the central bank faces') }
    ] }, 'intermediate', L('למה זעזוע בנפט קשה במיוחד לבנק המרכזי?', 'Why is an oil shock especially hard for the central bank?'),
      [['a', L('האינפלציה עולה בזמן שהצמיחה נפגעת — העלאת ריבית תעמיק את ההאטה', 'Inflation rises while growth suffers — raising rates would deepen the slowdown')], ['b', L('הבנק המרכזי קובע את מחיר הנפט', 'The central bank sets the oil price')], ['c', L('אין לו השפעה על אינפלציה של אנרגיה בכלל', 'It has no effect at all on energy inflation')], ['d', L('נפט יקר תמיד מוריד את האינפלציה', 'Dear oil always lowers inflation')]], 'a',
      L('בדרך כלל אינפלציה גבוהה ומשק חם באים יחד, והתשובה ברורה. כאן המחירים עולים דווקא כשהמשק נחלש — וכל כיוון שהבנק יבחר יפגע באחד מהשניים.', 'Usually high inflation and a hot economy come together, and the answer is clear. Here prices rise just as the economy weakens — and whichever way the bank goes, it hurts one of the two.'))
  ]
};

export const MACRO_2 = [M4, M5, M6];
