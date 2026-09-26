// ---------------------------------------------------------------------------
// Macro, module 3 — who moves the market: M7 (institutions, market makers,
// "priced in", inside information and arbitrage).
//
// Sources: the approved curriculum (knowledge-base topics; the outline is new,
// in the same rhythm). Builds on F5 (the order book and the spread) and on
// M1–M6, where every macro move was a surprise to price. Every number comes
// from @core/macro/scenarios or a series.
// ---------------------------------------------------------------------------
import type { LessonChartSpec } from '@core/charts/lessonCharts';
import * as series from '@core/charts/series.js';
import type { Diagram, LessonContent } from './types';
import { M7_BOOK, ARB, ARB_Q } from '@core/macro/scenarios';
import { L, ltr, n0, n2, pc, nums, mq, change } from './macroKit';

const NEWS = series.M7_NEWS, RATE = series.M7_RATE;
const first = (c: typeof NEWS) => c[0]!.c, lastC = (c: typeof NEWS) => c[c.length - 1]!.c;
const top = NEWS.swings[0]!, low = RATE.swings[0]!;
const bestAsk = M7_BOOK.asks[0]![0], bestBid = M7_BOOK.bids[0]![0], spread = bestAsk - bestBid;
const fair = (a: { usd: number; rate: number }) => a.usd * a.rate;

const M7_CHARTS: LessonChartSpec[] = [
  { candles: NEWS, variant: 'price', options: { showVolume: false, dots: [{ idx: top.idx, price: top.price, tone: 'bull', labelAlign: 'center', labelDy: -8, label: L('הדוחות: בדיוק כצפוי', 'The results: exactly as expected') }] },
    label: L(`מניה עולה מ־${n2(first(NEWS))} ל־${n2(top.price)} לקראת דוחות, ויורדת ל־${n2(lastC(NEWS))} אחרי שהם מתפרסמים`, `A stock climbs from ${n2(first(NEWS))} to ${n2(top.price)} ahead of results, and falls to ${n2(lastC(NEWS))} after they come out`), caption: L('לקראת הדוחות, ואחריהם', 'Ahead of the results, and after'), tone: 'neutral', height: 400 },
  { candles: RATE, variant: 'price', options: { showVolume: false, dots: [{ idx: low.idx, price: low.price, tone: 'bear', labelAlign: 'center', labelDy: 20, label: L('ההחלטה: +0.25%, כצפוי', 'The decision: +0.25%, as expected') }] },
    label: L(`מדד יורד מ־${n2(first(RATE))} ל־${n2(low.price)} לקראת החלטת ריבית, ועולה ל־${n2(lastC(RATE))} אחריה`, `An index falls from ${n2(first(RATE))} to ${n2(low.price)} ahead of a rate decision, and rises to ${n2(lastC(RATE))} after it`), caption: L('לקראת החלטת הריבית, ואחריה', 'Ahead of the rate decision, and after'), tone: 'neutral', height: 300 }
];
const arbTable = (a: { usd: number; rate: number; tase: number }, title: ReturnType<typeof L>): Diagram => ({ type: 'table', title, columns: [L('נתון', 'Figure'), L('ערך', 'Value')], rows: [
  { label: L('מחיר בניו יורק, בדולרים', 'Price in New York, in dollars'), cells: [n2(a.usd)] },
  { label: L('שער הדולר בשקלים', 'The dollar in shekels'), cells: [n2(a.rate)] },
  { label: L('מחיר בתל אביב, בשקלים', 'Price in Tel Aviv, in shekels'), cells: [n2(a.tase)] }
] });

export const M7: LessonContent = {
  id: 'M7',
  tutor: { topic: 'efficient-markets-priced-in', label: L('"מגולם במחיר"', '"priced in"') },
  teach: [
    {
      heading: L('מי קונה ומי מוכר', 'Who buys and who sells'),
      paragraphs: [
        L('מאחורי כל עסקה בבורסה יש מישהו בצד השני. רוב הכסף בשוק מנוהל בידי גופים מוסדיים: קרנות פנסיה, קופות גמל וחברות ביטוח שמשקיעות את החיסכון של מיליוני אנשים, וקרנות נאמנות וקרנות סל. הם קונים ומוכרים בכמויות גדולות, עם צוותי מחקר ומידע שזמין להם בשנייה שהוא מתפרסם.',
          'Behind every trade on the exchange there is someone on the other side. Most of the money in the market is run by institutions: pension funds, provident funds and insurers that invest the savings of millions of people, and mutual funds and ETFs. They buy and sell in large amounts, with research teams and information available to them the second it is published.'),
        L('לצידם יש קרנות גידור, שמחפשות רווח בכל כיוון; עושי שוק, שמספקים מחיר קנייה ומכירה כל הזמן; אלגוריתמים שמגיבים לחדשות תוך אלפיות שנייה; ומשקיעים פרטיים — אתם.',
          'Beside them are hedge funds, which look for profit in any direction; market makers, who quote a buying and a selling price all the time; algorithms that react to news within milliseconds; and private investors — you.'),
        L('המשמעות הפרקטית: כשאתם קוראים ידיעה כלכלית, אלפי אנשי מקצוע כבר קראו אותה, חישבו מה היא אומרת ופעלו. זה לא אומר שאין לכם מה לעשות בשוק — זה אומר שהיתרון שלכם לא יהיה מהירות.',
          'The practical meaning: when you read a piece of economic news, thousands of professionals have already read it, worked out what it means and acted. That does not mean there is nothing for you to do in the market — it means your edge will not be speed.')
      ],
      work: { kind: 'diagram', diagram: { type: 'table', title: L('מי בשוק', 'Who is in the market'), columns: [L('משתתף', 'Participant'), L('מה הוא עושה', 'What it does'), L('טווח זמן', 'Time horizon')], rows: [
        { label: L('גופים מוסדיים', 'Institutions'), cells: [L('משקיעים חיסכון ארוך טווח של הציבור', 'Invest the public\'s long-term savings'), L('שנים', 'Years')] },
        { label: L('קרנות גידור', 'Hedge funds'), cells: [L('מחפשות רווח בכל כיוון, גם בירידות', 'Seek profit in any direction, falls included'), L('ימים עד שנים', 'Days to years')] },
        { label: L('עושי שוק', 'Market makers'), cells: [L('מציעים קנייה ומכירה כל הזמן, מרוויחים מהמרווח', 'Quote buying and selling all the time, earn the spread'), L('שניות', 'Seconds')] },
        { label: L('משקיעים פרטיים', 'Private investors'), cells: [L('משקיעים את הכסף של עצמם', 'Invest their own money'), L('משתנה', 'It varies')] }
      ] } }
    },
    {
      heading: L('עושי שוק', 'Market makers'),
      paragraphs: [
        L(`עושה שוק מציג כל הזמן שני מחירים: במה הוא מוכן לקנות (Bid) ובמה הוא מוכן למכור (Ask). בספר כאן: קונה ב־${n2(bestBid)}, מוכר ב־${n2(bestAsk)}. ההפרש, ${ltr(n2(spread))}, הוא המרווח — אותו מרווח שפגשתם בספר הפקודות.`,
          `A market maker shows two prices all the time: what it is willing to buy at (the bid) and what it is willing to sell at (the ask). In the book here: it buys at ${n2(bestBid)}, sells at ${n2(bestAsk)}. The difference, ${n2(spread)}, is the spread — the same spread you met in the order book.`),
        L('זה המודל העסקי שלו: לקנות מעט בזול ולמכור מעט ביוקר, אלפי פעמים ביום, בלי להמר על הכיוון. בתמורה הוא מספק לשוק נזילות — תמיד יש מישהו בצד השני, גם כשאין קונה או מוכר "אמיתי" באותו רגע.',
          'That is its business: buy a little cheaper and sell a little dearer, thousands of times a day, without betting on direction. In return it gives the market liquidity — there is always someone on the other side, even when no "real" buyer or seller is there at that moment.'),
        L('כשהאי־ודאות עולה — לפני הודעה חשובה, או בזמן סערה — עושי השוק מרחיבים את המרווח כדי להגן על עצמם. לכן מרווח רחב הוא סימן שהשוק לא בטוח במחיר.',
          'When uncertainty rises — before an important announcement, or in a storm — market makers widen the spread to protect themselves. So a wide spread is a sign that the market is unsure of the price.')
      ],
      work: { kind: 'diagram', diagram: { type: 'book', title: L('הצעות של עושה שוק', 'A market maker\'s quotes'), asks: M7_BOOK.asks, bids: M7_BOOK.bids, highlight: 'spread' } }
    },
    {
      heading: L('"מגולם במחיר"', '"Priced in"'),
      paragraphs: [
        L(`המניה בגרף עלתה מ־${n2(first(NEWS))} ל־${n2(top.price)} — ${pc(change(first(NEWS), top.price))} — בשבועות שלפני הדוחות, כי כולם ציפו לתוצאות מצוינות. הדוחות הגיעו, והתוצאות היו מצוינות — בדיוק כמו שציפו. והמניה ירדה ל־${n2(lastC(NEWS))}.`,
          `The stock in the chart rose from ${n2(first(NEWS))} to ${n2(top.price)} — ${pc(change(first(NEWS), top.price))} — in the weeks before its results, because everyone expected excellent numbers. The results came, and they were excellent — exactly as expected. And the stock fell to ${n2(lastC(NEWS))}.`),
        L('הרעיון: המחיר כבר משקף את מה שהשוק יודע ומצפה לו. חדשות שכולם ציפו להן "מגולמות במחיר" — הן כבר בפנים, ולכן לא מזיזות אותו. מה שמזיז מחיר הוא ההפתעה: ההבדל בין מה שקרה לבין מה שציפו שיקרה.',
          'The idea: the price already reflects what the market knows and expects. News everyone expected is "priced in" — it is already inside, so it does not move the price. What moves a price is the surprise: the difference between what happened and what was expected.'),
        L('אחרי עלייה כזו, חלק מהקונים מממשים רווח ביום ההודעה — "קנו את השמועה, מכרו את החדשה". זה גם מה שמסביר כמה מההפתעות של השיעורים הקודמים: שוק שעולה ביום העלאת ריבית, או מניה שיורדת אחרי דוח טוב.',
          'After a rise like that, some buyers take profits on the day of the news — "buy the rumour, sell the news". It also explains some of the puzzles from earlier lessons: a market that rises on the day rates go up, or a stock that falls after a good report.')
      ],
      work: { kind: 'charts', charts: [0] }
    }
  ],
  charts: M7_CHARTS,
  activity: {
    kind: 'sort',
    prompt: L('צפוי או הפתעה? מיינו 6 הודעות: מה כבר היה במחיר, ומה יזיז אותו.', 'Expected or a surprise? Sort 6 announcements: what was already in the price, and what will move it.'),
    bins: [
      { id: 'priced', label: L('צפוי — כבר במחיר', 'Expected — already in the price'), tone: 'var(--info)' },
      { id: 'surprise', label: L('הפתעה — יזיז את המחיר', 'A surprise — will move the price'), tone: 'var(--risk)' }
    ],
    items: [
      { id: 'r1', bin: 'priced', label: L('ריבית: ציפו ל־+0.25%, הוחלט +0.25%', 'Rates: +0.25% expected, +0.25% decided'), why: L('בדיוק מה שציפו. השוק התמחר את ההחלטה מראש.', 'Exactly what was expected. The market priced the decision in advance.') },
      { id: 'r2', bin: 'surprise', label: L('ריבית: ציפו ל־+0.25%, הוחלט +0.50%', 'Rates: +0.25% expected, +0.50% decided'), why: L('פי שניים מהצפוי: הפתעה "ניצית" — אג״ח ומניות צפויים לרדת.', 'Twice what was expected: a "hawkish" surprise — bonds and stocks are likely to fall.') },
      { id: 'e1', bin: 'priced', label: L('רווח למניה: תחזית 2.00, בפועל 2.01', 'Earnings per share: 2.00 forecast, 2.01 actual'), why: L('סנט מעל התחזית — כמעט זהה. אין כאן מידע חדש.', 'A cent above the forecast — practically the same. There is no new information here.') },
      { id: 'e2', bin: 'surprise', label: L('רווח למניה: תחזית 2.00, בפועל 1.40', 'Earnings per share: 2.00 forecast, 1.40 actual'), why: L(`${pc(change(2, 1.4), 0)} מהתחזית: הפתעה שלילית גדולה.`, `${pc(change(2, 1.4), 0)} against the forecast: a big negative surprise.`) },
      { id: 'i1', bin: 'surprise', label: L('אינפלציה: תחזית 3.0%, בפועל 4.2%', 'Inflation: 3.0% forecast, 4.2% actual'), why: L('אינפלציה גבוהה מהצפוי מעלה את הסיכוי להעלאות ריבית — הפתעה שמזיזה את כל השוק.', 'Higher inflation than expected raises the odds of rate rises — a surprise that moves the whole market.') },
      { id: 'r3', bin: 'priced', label: L('ריבית: ציפו שלא תשתנה, ולא השתנתה', 'Rates: no change expected, and none made'), why: L('שום דבר חדש. גם "בלי שינוי" יכול להיות הפתעה — אבל רק כשציפו לשינוי.', 'Nothing new. "No change" can also be a surprise — but only when a change was expected.') }
    ],
    right: L('מיינתם נכון: לא החדשה עצמה קובעת, אלא הפער בינה לבין הציפייה.', 'Sorted correctly: what counts is not the news itself, but the gap between it and the expectation.'),
    explain: [
      L('מידע פנים. אם ההפתעה היא מה שמזיז מחיר, מי שיודע עליה מראש יכול להרוויח — ולכן זה אסור. מסחר על סמך מידע מהותי שעוד לא פורסם לציבור (מידע פנים) הוא עבירה פלילית, בישראל לפי חוק ניירות ערך ובארה״ב לפי חוקי ה־SEC. לא משנה אם שמעתם אותו מהמנכ״ל או מחבר שלו.',
        'Inside information. If the surprise is what moves a price, whoever knows it in advance can profit — which is why it is forbidden. Trading on material information not yet made public (inside information) is a criminal offence, in Israel under the Securities Law and in the US under SEC rules. It does not matter whether you heard it from the CEO or from a friend of theirs.'),
      L(`ארביטראז׳ הוא הצד החוקי של "מחיר אחד": מניה שנסחרת גם בניו יורק ב־${n2(ARB.usd)} דולר וגם בתל אביב. בשער ${n2(ARB.rate)}, היא אמורה לעלות ${ltr(`${n2(ARB.usd)} × ${n2(ARB.rate)} = ${n2(fair(ARB))}`)} שקל. אם בתל אביב היא ${n2(ARB.tase)}, קונים בניו יורק ומוכרים בתל אביב — ${pc(change(fair(ARB), ARB.tase))} כמעט בלי סיכון. הקנייה והמכירה עצמן סוגרות את הפער, ולכן פערים כאלה קטנים ונעלמים מהר.`,
        `Arbitrage is the legal side of "one price": a stock trading in New York at $${n2(ARB.usd)} and also in Tel Aviv. At a rate of ${n2(ARB.rate)}, it should cost ${n2(ARB.usd)} × ${n2(ARB.rate)} = ${n2(fair(ARB))} shekels. If in Tel Aviv it is ${n2(ARB.tase)}, you buy in New York and sell in Tel Aviv — ${pc(change(fair(ARB), ARB.tase))} almost without risk. The buying and selling themselves close the gap, which is why such gaps are small and disappear fast.`)
    ]
  },
  apply: mq('m7-apply', 'M7', 1, 'intermediate', L('הבנק המרכזי העלה ריבית ב־0.25%, בדיוק כמו שציפו — והמדד עלה אחרי ההחלטה. מה ההסבר הסביר?', 'The central bank raised rates by 0.25%, exactly as expected — and the index rose after the decision. What is the likely explanation?'),
    [['a', L('ההעלאה כבר גולמה במחיר בירידה שלפניה, וההחלטה הסירה אי־ודאות', 'The rise was already priced in by the fall before it, and the decision removed uncertainty')], ['b', L('העלאת ריבית תמיד מעלה מניות', 'A rate rise always lifts stocks')], ['c', L('מישהו קנה על סמך מידע פנים', 'Someone bought on inside information')], ['d', L('המדד לא הגיב להחלטה בכלל', 'The index did not react to the decision at all')]], 'a',
    L(`המדד ירד מ־${n2(first(RATE))} ל־${n2(low.price)} לקראת ההחלטה — שם הוא תמחר את ההעלאה, ואולי גם את הסיכוי לגדולה יותר. כשהגיעה בדיוק ההעלאה הצפויה, הפחד מהפתעה נעלם, והמדד עלה ל־${n2(lastC(RATE))}.`,
      `The index fell from ${n2(first(RATE))} to ${n2(low.price)} ahead of the decision — that is where it priced the rise, and perhaps the chance of a bigger one. When exactly the expected rise came, the fear of a surprise went away, and the index rose to ${n2(lastC(RATE))}.`)),
  takeaway: {
    bottomLine: L('רוב הכסף בשוק מנוהל בידי מוסדיים שמגיבים מהר. עושי שוק מספקים נזילות ומרוויחים מהמרווח. המחיר כבר מגלם את מה שצפוי — מה שמזיז אותו הוא ההפתעה.', 'Most of the money in the market is run by institutions that react fast. Market makers provide liquidity and earn the spread. The price already reflects what is expected — what moves it is the surprise.'),
    caveat: L('"מגולם במחיר" לא אומר שהשוק תמיד צודק — ציפיות יכולות להיות שגויות, ובועות קורות. זה אומר שחדשות שכולם כבר יודעים אינן יתרון.', '"Priced in" does not mean the market is always right — expectations can be wrong, and bubbles happen. It means news everyone already knows is not an edge.')
  },
  questions: [
    mq('m7-spread', 'M7', { type: 'book', title: L('הצעות בספר', 'Quotes in the book'), asks: M7_BOOK.asks, bids: M7_BOOK.bids, highlight: 'best' }, 'beginner', L('מה המרווח?', 'What is the spread?'),
      nums([n2(spread), n2(M7_BOOK.asks[1]![0] - bestAsk), n2(bestBid - M7_BOOK.bids[1]![0]), n2(bestAsk + bestBid)]), 'a',
      L(`${ltr(`${n2(bestAsk)} − ${n2(bestBid)} = ${n2(spread)}`)}: ההפרש בין ההצעה הזולה ביותר למכירה להצעה הגבוהה ביותר לקנייה. זה מה שעושה השוק מרוויח על כל סיבוב.`, `${n2(bestAsk)} − ${n2(bestBid)} = ${n2(spread)}: the gap between the cheapest offer to sell and the highest offer to buy. That is what the market maker earns on each round trip.`)),
    mq('m7-priced', 'M7', 0, 'intermediate', L('הדוחות היו בדיוק כמו התחזיות — והמניה ירדה. מה הסיבה הסבירה?', 'The results were exactly as forecast — and the stock fell. What is the likely reason?'),
      [['a', L('הציפייה לדוחות טובים כבר הייתה במחיר, אחרי העלייה שלפניהם', 'The expectation of good results was already in the price, after the rise before them')], ['b', L('הדוחות היו גרועים בסתר', 'The results were secretly bad')], ['c', L('עושי השוק הורידו את המחיר בכוונה', 'The market makers pushed the price down on purpose')], ['d', L('מניות תמיד יורדות אחרי דוחות', 'Stocks always fall after results')]], 'a',
      L(`המניה עלתה ${pc(change(first(NEWS), top.price))} לקראת הדוחות. כשהם הגיעו בלי הפתעה, לא נשאר מה להוסיף למחיר — וחלק מהקונים מימשו רווח.`, `The stock rose ${pc(change(first(NEWS), top.price))} ahead of the results. When they came with no surprise, there was nothing left to add to the price — and some buyers took profits.`)),
    mq('m7-arb', 'M7', arbTable(ARB_Q, L('מניה דואלית', 'A dual-listed stock')), 'intermediate', L('מה עושה ארביטראז׳ר?', 'What does an arbitrageur do?'),
      [['a', L(`קונה בתל אביב (${n2(ARB_Q.tase)}) ומוכר בניו יורק (שווה ${n2(fair(ARB_Q))})`, `Buys in Tel Aviv (${n2(ARB_Q.tase)}) and sells in New York (worth ${n2(fair(ARB_Q))})`)], ['b', L('קונה בניו יורק ומוכר בתל אביב', 'Buys in New York and sells in Tel Aviv')], ['c', L('לא כלום — המחירים שווים', 'Nothing — the prices are equal')], ['d', L('קונה בשני המקומות', 'Buys in both places')]], 'a',
      L(`${ltr(`${n2(ARB_Q.usd)} × ${n2(ARB_Q.rate)} = ${n2(fair(ARB_Q))}`)} שקל בניו יורק, מול ${n2(ARB_Q.tase)} בתל אביב: תל אביב זולה ב־${pc(-change(fair(ARB_Q), ARB_Q.tase))}. קונים את הזול ומוכרים את היקר — והפער נסגר.`, `${n2(ARB_Q.usd)} × ${n2(ARB_Q.rate)} = ${n2(fair(ARB_Q))} shekels in New York, against ${n2(ARB_Q.tase)} in Tel Aviv: Tel Aviv is ${pc(-change(fair(ARB_Q), ARB_Q.tase))} cheaper. Buy the cheap one, sell the dear one — and the gap closes.`))
  ]
};

export const MACRO_3 = [M7];
