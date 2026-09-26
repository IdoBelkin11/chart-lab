// ---------------------------------------------------------------------------
// Market Foundations, lessons 2–5 (F1 is the previous build's l0, see legacy.ts).
//
// Sources: the approved curriculum (titles, knowledge-base topics, step
// titles), the approved Artifact (the order-book simulator for F5), and the
// app's own knowledge-base entries for each topic, so the lessons and the
// tutor never contradict each other. Every figure in an example is computed
// (see tests/core/foundations.test.ts).
//
// Builds on F1 on purpose: F1 introduces stock / bond / ETF / index and, in
// passing, ticker and market cap; F2 deepens ticker and index, F3 uses market
// cap, F4 deepens the ETF. F3 names buy and sell offers informally; F5 gives
// them their names (bid / ask) and adds the spread.
// ---------------------------------------------------------------------------
import type { Localized, QuizQuestion } from '@core/types/kb';
import type { LessonChartSpec } from '@core/charts/lessonCharts';
import * as series from '@core/charts/series.js';
import type { LessonContent } from './types';

const L = (he: string, en: string): Localized => ({ he, en });
const q = (id: string, lesson: string, difficulty: 'beginner' | 'intermediate', question: Localized, options: Array<[string, Localized]>, correctKey: string, explanation: Localized): QuizQuestion => ({
  id, lesson, category: 'basics', difficulty, question, options: options.map(([key, text]) => ({ key, text })), correctKey, explanation
});

// ============================================================================
// F2 · Exchanges, brokers and indices
// ============================================================================
const ORDER_PATH = (caption: Localized) => ({
  type: 'flow' as const,
  title: L('הדרך של פקודת קנייה', 'The path of a buy order'),
  stages: [
    { label: L('אתם', 'You'), sub: L('לוחצים "קנה" באפליקציה', 'press Buy in an app') },
    { label: L('ברוקר', 'Broker'), sub: L('בודק ומעביר את הפקודה', 'checks and routes the order') },
    { label: L('בורסה', 'Exchange'), sub: L('מתאימה קונה למוכר', 'matches a buyer with a seller') },
    { label: L('מוכר', 'Seller'), sub: L('משקיע אחר שמוכר', 'another investor selling') }
  ],
  caption
});

export const F2: LessonContent = {
  id: 'F2',
  tutor: { topic: 'exchange', label: L('בורסה, ברוקר ומדד', 'exchanges, brokers and indices') },
  teach: [
    {
      heading: L('איפה בעצם נפגשים קונים ומוכרים?', 'Where do buyers and sellers actually meet?'),
      paragraphs: [
        L('בשיעור הקודם ראינו מה קונים: מניה, אג״ח, קרן סל. עכשיו — איפה. בורסה היא שוק מאורגן ומפוקח שבו הצעות קנייה והצעות מכירה נפגשות לפי כללים קבועים. פעם זה היה אולם מלא סוחרים שצועקים; היום זו מערכת ממוחשבת שמתאימה בין פקודות בשברירי שנייה.',
          "Last lesson was about what you buy: a stock, a bond, an ETF. This one is about where. A stock exchange is an organised, regulated market where buy orders and sell orders meet under fixed rules. It used to be a hall full of shouting traders; today it's a computer system that matches orders in fractions of a second."),
        L('כדי שמניות של חברה ייסחרו בבורסה, החברה צריכה לעמוד בדרישות רישום ולדווח לציבור באופן קבוע — דוחות כספיים, אירועים מהותיים. הכללים האלה הם חלק ממה שמאפשר לכם לקנות מניה של חברה שמעולם לא ביקרתם בה: המידע עליה גלוי לכולם באותה מידה.',
          "For a company's shares to trade on an exchange, it has to meet listing requirements and report to the public on a regular schedule — financial statements, material events. Those rules are part of why you can buy a share in a company you've never set foot in: the information about it is open to everyone equally."),
        L('כל נייר ערך בבורסה מזוהה בקוד קצר: בארה״ב זה סימול באותיות (AAPL לאפל, MSFT למיקרוסופט), ובבורסה בתל אביב — מספר נייר בן כמה ספרות לצד השם. הסימול שייך לבורסה ולא לחברה: אותה חברה יכולה להיסחר בכמה בורסות, ולכן לפעמים כותבים את שתיהן יחד — NASDAQ:AAPL.',
          "Every security on an exchange has a short identifier: in the US it's a letter ticker (AAPL for Apple, MSFT for Microsoft); on the Tel Aviv exchange it's a numeric security number shown next to the name. The ticker belongs to the exchange, not the company — the same company can be listed on more than one exchange, which is why you'll sometimes see both written together: NASDAQ:AAPL.")
      ],
      callouts: [{ kind: 'example', lead: L('כשאתם קונים מניה', 'When you buy a share'), text: L(
        'אתם לא קונים אותה מהחברה. אתם קונים אותה ממשקיע אחר שהחליט למכור — הבורסה רק מחברת ביניכם. החברה עצמה מקבלת כסף רק כשהיא מנפיקה מניות חדשות.',
        "you're not buying it from the company. You're buying it from another investor who decided to sell — the exchange only connects the two of you. The company itself only receives money when it issues new shares.") }],
      work: { kind: 'diagram', diagram: ORDER_PATH(L('הבורסה היא המקום שבו הפקודה שלכם פוגשת פקודה של מישהו אחר.', 'The exchange is where your order meets someone else\'s.')) }
    },
    {
      heading: L('למה אי אפשר לקנות ישירות מהבורסה?', "Why can't you buy straight from the exchange?"),
      paragraphs: [
        L('הבורסה עובדת רק עם חברים מורשים. משקיע פרטי מגיע אליה דרך ברוקר — בית השקעות, בנק או אפליקציית מסחר שיש לה רישיון. הברוקר מקבל את הפקודה שלכם, בודק שיש בחשבון מספיק כסף (או מניות, אם אתם מוכרים), שולח אותה לבורסה, ואחרי שהעסקה מתבצעת — מחזיק עבורכם את המניות בחשבון.',
          'An exchange only deals with licensed members. A private investor reaches it through a broker — an investment house, a bank, or a licensed trading app. The broker takes your order, checks your account has the money (or the shares, if you\'re selling), sends it to the exchange, and once the trade happens, holds the shares for you in your account.'),
        L('ברוקרים לא קובעים את המחיר — המחיר נקבע בבורסה, מול קונים ומוכרים אחרים. מה שכן משתנה בין ברוקרים: העמלות (על כל קנייה ומכירה, ולפעמים גם דמי משמרת רק על החזקת הניירות), אילו בורסות אפשר להגיע אליהן דרכם, והכלים שהם נותנים.',
          "Brokers don't set the price — the price is set on the exchange, against other buyers and sellers. What does differ between brokers: fees (on each buy and sell, and sometimes a custody fee just for holding your securities), which exchanges you can reach through them, and the tools they give you.")
      ],
      callouts: [{ kind: 'caveat', lead: L('שימו לב', 'Watch out'), text: L(
        'עמלה קטנה על כל פעולה נראית זניחה, אבל מי שקונה ומוכר הרבה משלם אותה שוב ושוב. לפני שבוחרים ברוקר בודקים שהוא מפוקח ומה העמלות הכוללות — לא רק את זו שמופיעה בפרסומת.',
        "A small fee per trade looks negligible, but someone who buys and sells often pays it again and again. Before choosing a broker, check that it's regulated and what the total fees are — not just the one in the ad.") }],
      work: { kind: 'diagram', diagram: ORDER_PATH(L('הברוקר הוא החוליה שבין הכסף שלכם לבורסה.', 'The broker is the link between your money and the exchange.')) }
    },
    {
      heading: L('מה בדיוק "עלה" כשאומרים שהשוק עלה?', 'What exactly went up when "the market went up"?'),
      paragraphs: [
        L('כמו שראינו בשיעור הקודם, מדד הוא מספר שמודד קבוצת מניות — לא משהו שקונים. S&P 500 מודד כ־500 מהחברות הגדולות בארה״ב מכל הענפים; נאסד״ק 100 מודד את 100 החברות הגדולות בבורסת נאסד״ק שאינן חברות פיננסיות, ולכן הוא עמוס בחברות טכנולוגיה; ת״א 35 מודד את 35 הגדולות בבורסה בתל אביב.',
          "As the last lesson showed, an index is a number that measures a group of stocks — not something you buy. The S&P 500 measures about 500 of the largest US companies across every sector; the Nasdaq 100 measures the 100 largest non-financial companies listed on the Nasdaq exchange, which is why it's heavy on technology; the TA-35 measures the 35 largest on the Tel Aviv exchange."),
        L('רוב המדדים הגדולים משקללים כל חברה לפי שווי השוק שלה: חברה ששווה פי עשרה מחברה אחרת משפיעה על המדד פי עשרה. לכן יום שבו כמה ענקיות עלו יכול להיראות כמו "יום טוב בשוק" — גם אם רוב המניות במדד דווקא ירדו.',
          'Most major indices weight each company by its market value: a company worth ten times another moves the index ten times as much. That\'s how a day when a few giants rose can look like "a good day for the market" — even if most stocks in the index actually fell.')
      ],
      callouts: [{ kind: 'example', lead: L('בלו צ׳יפ', 'Blue chip'), text: L(
        'כינוי לחברות גדולות, ותיקות ורווחיות לאורך שנים — לרוב המשקולות הכבדות במדדים. "יציבה" לא אומר "חסינה": גם בלו צ׳יפ יכולה לאבד חלק גדול מערכה.',
        "A nickname for large, long-established companies with years of profits — usually the heavyweights in an index. \"Stable\" doesn't mean \"immune\": a blue chip can still lose a large part of its value.") }],
      notes: [
        { tone: 'support', label: L('המשקולת הכבדה', 'The heavyweight'), explanation: L('חברה א׳ היא חצי מהמדד. העלייה שלה ב־3% לבדה מוסיפה למדד 1.5%.', 'Company A is half the index. Its 3% rise alone adds 1.5% to the index.') },
        { tone: 'resistance', label: L('רוב המניות ירדו', 'Most stocks fell'), explanation: L('ב׳, ג׳ וד׳ ירדו, אבל יחד הן רק 45% מהמדד — הירידות שלהן גורעות ממנו רק כ־0.6%.', 'B, C and D fell, but together they are only 45% of the index — their drops take just 0.6% off it.') }
      ],
      work: { kind: 'diagram', diagram: {
        type: 'weights',
        title: L('מדד של 5 חברות, משוקלל לפי שווי', 'A 5-company index, weighted by value'),
        members: [
          { name: L('חברה א׳', 'Company A'), weight: 50, change: 3 },
          { name: L('חברה ב׳', 'Company B'), weight: 20, change: -1 },
          { name: L('חברה ג׳', 'Company C'), weight: 15, change: -2 },
          { name: L('חברה ד׳', 'Company D'), weight: 10, change: -1 },
          { name: L('חברה ה׳', 'Company E'), weight: 5, change: 1 }
        ],
        caption: L('3 מתוך 5 המניות ירדו — והמדד עלה.', '3 of the 5 stocks fell — and the index rose.')
      } }
    }
  ],
  charts: [],
  activity: {
    kind: 'sort',
    prompt: L('מי עושה מה? מיינו כל משפט לתפקיד שלו', 'Who does what? Sort each statement into its role'),
    bins: [
      { id: 'exchange', label: L('בורסה', 'Exchange'), tone: 'var(--info)' },
      { id: 'broker', label: L('ברוקר', 'Broker'), tone: 'var(--adv)' },
      { id: 'index', label: L('מדד', 'Index'), tone: 'var(--risk)' }
    ],
    items: [
      { id: 'match', label: L('מתאים בין פקודת קנייה לפקודת מכירה', 'Matches a buy order with a sell order'), bin: 'exchange', why: L('ההתאמה בין קונה למוכר קורית בבורסה — לא אצל הברוקר ולא במדד.', 'Buyers and sellers are matched on the exchange — not at the broker and not in an index.') },
      { id: 'rules', label: L('מחייב חברות רשומות לדווח לציבור', 'Requires listed companies to report to the public'), bin: 'exchange', why: L('דרישות הרישום והדיווח הן של הבורסה (ושל הרגולטור שמפקח עליה).', 'Listing and reporting requirements come from the exchange (and the regulator that oversees it).') },
      { id: 'route', label: L('מעביר את הפקודה שלכם ומחזיק את המניות בחשבון', 'Routes your order and holds the shares in your account'), bin: 'broker', why: L('זה בדיוק תפקיד הברוקר: המתווך המורשה בינכם לבין הבורסה.', "That's exactly the broker's job: the licensed intermediary between you and the exchange.") },
      { id: 'fee', label: L('גובה עמלה על כל קנייה ומכירה', 'Charges a fee on every buy and sell'), bin: 'broker', why: L('העמלות על פעולות נגבות על ידי הברוקר — ומשתנות מברוקר לברוקר.', 'Trading fees are charged by the broker — and they differ from one broker to the next.') },
      { id: 'measure', label: L('מספר שמסכם כמה זזה קבוצת מניות', 'A number that sums up how a group of stocks moved'), bin: 'index', why: L('מדד לא סוחר ולא מתווך — הוא רק מודד.', "An index doesn't trade or route anything — it only measures.") },
      { id: 'nobuy', label: L('אי אפשר לקנות אותו ישירות — רק קרן שעוקבת אחריו', "You can't buy it directly — only a fund that tracks it"), bin: 'index', why: L('מדד הוא חישוב, לא נייר ערך. קונים קרן סל שמחזיקה את המניות שבו.', "An index is a calculation, not a security. You buy an ETF that holds its stocks.") }
    ],
    right: L('הבורסה מתאימה ומפקחת, הברוקר מחבר אתכם ומחזיק את הניירות, והמדד רק מודד.', 'The exchange matches and supervises, the broker connects you and holds your securities, and the index only measures.'),
    explain: [
      L('ככה נראית הדרך של פקודה: (1) לוחצים "קנה" באפליקציה של הברוקר. (2) הברוקר בודק שיש כסף בחשבון ושולח את הפקודה לבורסה. (3) הבורסה מוצאת מוכר שמוכן למכור במחיר שמתאים לפקודה. (4) המניות עוברות לחשבון שלכם אצל הברוקר, והכסף — למוכר.',
        "Here's the path of an order: (1) you press Buy in your broker's app. (2) The broker checks your account has the money and sends the order to the exchange. (3) The exchange finds a seller willing to sell at a price that fits your order. (4) The shares land in your account at the broker, and the money goes to the seller."),
      L('המדד לא מופיע בדרך הזו בכלל. הוא מחושב מהמחירים שנוצרים בעסקאות — ומספר לכם, בדיעבד, כמה זזה קבוצת המניות.',
        "The index doesn't appear on that path at all. It's calculated from the prices those trades produce — and tells you, after the fact, how the group of stocks moved.")
    ]
  },
  takeaway: {
    bottomLine: L('הבורסה מתאימה בין קונים למוכרים ומפקחת על החברות שנסחרות בה; הברוקר מחבר אתכם אליה ומחזיק את הניירות שלכם; המדד מודד קבוצת מניות — ואי אפשר לקנות אותו ישירות.',
      "The exchange matches buyers with sellers and supervises the companies listed on it; the broker connects you to it and holds your securities; the index measures a group of stocks — and you can't buy it directly."),
    caveat: L('מדד שעלה הוא ממוצע משוקלל: כמה חברות ענק יכולות למשוך אותו למעלה גם כשרוב המניות בו ירדו.',
      'An index that rose is a weighted average: a few giant companies can pull it up even when most of its stocks fell.')
  },
  questions: [
    q('f2-index-weight', 'F2', 'beginner',
      L('מדד שמשוקלל לפי שווי שוק עלה היום 1%. מה אפשר לומר בוודאות?', 'An index weighted by market value rose 1% today. What can you say for certain?'),
      [
        ['a', L('כל המניות במדד עלו היום', 'Every stock in the index rose today')],
        ['b', L('הממוצע המשוקלל של המניות עלה — וחלק מהן אולי ירדו', 'The weighted average of its stocks rose — and some may have fallen')],
        ['c', L('החברות הקטנות במדד עלו יותר מהגדולות', 'The small companies in the index rose more than the large ones')],
        ['d', L('הבורסה קבעה שהשוק יעלה ב־1%', 'The exchange decided the market would rise 1%')]
      ], 'b',
      L('מדד משוקלל הוא ממוצע שבו חברות גדולות שוקלות יותר. עלייה של 1% אומרת שהממוצע המשוקלל עלה — לא שכל מניה עלתה, ולא מה עשו הקטנות. והבורסה לא קובעת מחירים; היא רק מתאימה פקודות.',
        "A weighted index is an average in which large companies count for more. A 1% rise says the weighted average went up — not that every stock did, and nothing about the small ones. And the exchange doesn't set prices; it only matches orders.")),
    q('f2-broker-role', 'F2', 'beginner',
      L('לחצתם "קנה" באפליקציית מסחר. מי בודק שיש לכם מספיק כסף, ומחזיק את המניות בחשבון שלכם אחרי הקנייה?', 'You pressed Buy in a trading app. Who checks you have enough money, and holds the shares in your account afterwards?'),
      [
        ['a', L('הבורסה', 'The exchange')],
        ['b', L('הברוקר', 'The broker')],
        ['c', L('החברה שאת מניותיה קניתם', 'The company whose shares you bought')],
        ['d', L('המדד שהמניה שייכת אליו', 'The index the stock belongs to')]
      ], 'b',
      L('הברוקר הוא המתווך המורשה: מקבל את הפקודה, בודק את החשבון, שולח לבורסה ומחזיק עבורכם את הניירות. הבורסה רק מתאימה בין פקודות, והחברה בכלל לא צד בעסקה — קניתם ממשקיע אחר.',
        "The broker is the licensed intermediary: it takes the order, checks your account, sends it to the exchange and holds your securities. The exchange only matches orders, and the company isn't even a party to the trade — you bought from another investor.")),
    q('f2-ticker', 'F2', 'intermediate',
      L('למה עדיף לחפש מניה לפי הסימול שלה ולא לפי שם החברה?', "Why is it better to look a stock up by its ticker than by the company's name?"),
      [
        ['a', L('הסימול מזהה נייר ערך אחד בבורסה מסוימת, בלי בלבול בין שמות דומים', 'The ticker identifies one security on a given exchange, with no confusion between similar names')],
        ['b', L('הסימול קובע את מחיר המניה', 'The ticker sets the share price')],
        ['c', L('לכל חברה יש סימול אחד בכל העולם, לתמיד', 'Every company has one ticker worldwide, forever')],
        ['d', L('הסימול מראה אם המניה נכללת במדד', 'The ticker shows whether the stock is in an index')]
      ], 'a',
      L('שמות של חברות יכולים להיות דומים ולהשתנות; הסימול הוא מזהה קצר וחד־משמעי בבורסה מסוימת. הוא לא קובע מחיר, והוא גם לא נצחי: אותה חברה יכולה להיסחר בסימולים שונים בבורסות שונות.',
        "Company names can be similar and can change; a ticker is a short, unambiguous identifier on a particular exchange. It doesn't set a price, and it isn't permanent either: the same company can trade under different tickers on different exchanges."))
  ]
};

// ============================================================================
// F3 · Why prices move
// ============================================================================
const GD = series.F3_GAPDOWN, BEAT = series.F3_BEAT;
const F3_CHARTS: LessonChartSpec[] = [
  {
    candles: GD,
    variant: 'price',
    options: {
      showVolume: true,
      // Two short lines bracket the gap itself — a full-width zone would also cover the earlier days that DID trade at those prices.
      segments: [
        { x1: GD.gapIdx - 1, y1: GD.gapTop, x2: GD.length - 1, y2: GD.gapTop, tone: 'bear', dash: [5, 4] },
        { x1: GD.gapIdx - 1, y1: GD.gapBottom, x2: GD.length - 1, y2: GD.gapBottom, tone: 'bear', dash: [5, 4], labelAt: 'end', labelAlign: 'right', labelDy: -8,
          label: L('הגאפ — כאן לא נסחרה אף מניה', 'The gap — no shares traded here') }
      ]
    },
    label: L('גרף נרות שעולה בהדרגה, ואחריו פתיחה נמוכה בכ־8% מהסגירה הקודמת שמשאירה פער ריק בגרף', 'A candlestick chart rising steadily, then an open about 8% below the previous close that leaves an empty gap on the chart'),
    caption: L('גאפ כלפי מטה אחרי דוח', 'A gap down after a report'),
    subcaption: L('הפתיחה רחוקה מהסגירה של אתמול — ובטווח שביניהן לא הייתה אף עסקה.', "The open is far from yesterday's close — and nothing traded in between."),
    tone: 'bear',
    height: 400
  },
  {
    candles: BEAT,
    variant: 'price',
    options: {
      showVolume: true,
      points: [{ idx: BEAT.gapIdx, tone: 'bull', align: 'center', place: 'below', label: L('הדוח: הפסד קטן מהצפוי', 'Report: a smaller loss than feared') }]
    },
    label: L('גרף נרות של מניה בירידה, ואחרי דוח פתיחה גבוהה בכ־10% מהסגירה הקודמת', 'A candlestick chart of a falling stock, then after a report an open about 10% above the previous close'),
    caption: L('הלילה של הדוח', 'The night of the report'),
    subcaption: L('נתוני הדגמה.', 'Demo data.'),
    tone: 'bull',
    height: 400
  }
];

export const F3: LessonContent = {
  id: 'F3',
  tutor: { topic: 'why-price-moves', label: L('למה המחיר זז', 'why prices move') },
  teach: [
    {
      heading: L('המחיר הוא העסקה האחרונה', 'The price is the last trade'),
      paragraphs: [
        L('המחיר שמופיע ליד מניה הוא המחיר שבו בוצעה העסקה האחרונה: קונה ומוכר הסכימו עליו. אף אחד לא "קבע" אותו — לא הבורסה ולא החברה. בכל רגע יש בבורסה רשימה של הצעות קנייה (כמה קונים מוכנים לשלם) ורשימה של הצעות מכירה (כמה מוכרים מוכנים לקבל), והמחיר זז לאן שהן נפגשות.',
          "The price shown next to a stock is the price of the last trade — a buyer and a seller agreed on it. Nobody \"set\" it: not the exchange, not the company. At every moment the exchange holds a list of buy offers (what buyers are willing to pay) and a list of sell offers (what sellers are willing to accept), and the price moves to wherever they meet."),
        L('כשהקונים להוטים יותר — מוכנים לשלם את מה שהמוכרים מבקשים ואפילו יותר — העסקאות נסגרות במחירים גבוהים יותר והמחיר עולה. כשהמוכרים להוטים יותר ומוכנים לרדת במחיר כדי למכור, המחיר יורד. המחיר עצמו הוא רק התוצאה; מה שמזיז אותו הוא מי ממהר יותר.',
          'When buyers are more eager — willing to pay what sellers ask, or more — trades close at higher prices and the price rises. When sellers are more eager and willing to cut their price to get out, it falls. The price itself is just the outcome; what moves it is which side is in more of a hurry.'),
        L('מכאן גם שווי השוק שפגשתם בשיעור הראשון: מחיר מניה כפול מספר המניות. אם לחברה מיליארד מניות והמחיר עלה מ־50 ל־52, שווי השוק שלה עלה מ־50 מיליארד ל־52 מיליארד — בלי ששום דבר בתוך החברה השתנה באותה דקה. השווי זז כי המחיר זז.',
          "That's also where the market cap from lesson 1 comes from: share price times the number of shares. If a company has a billion shares and the price goes from 50 to 52, its market cap goes from 50 billion to 52 billion — without anything inside the company changing that minute. The value moved because the price moved.")
      ],
      work: { kind: 'diagram', diagram: {
        type: 'book',
        title: L('הצעות מכירה והצעות קנייה, ברגע אחד', 'Sell offers and buy offers, at one moment'),
        asks: [[50.10, 300], [50.15, 500], [50.25, 800]],
        bids: [[50.00, 400], [49.95, 600], [49.85, 900]],
        highlight: 'best',
        caption: L('העסקה הבאה תיסגר במקום שבו שתי הרשימות נפגשות — בין 50.00 ל־50.10.', 'The next trade will happen where the two lists meet — between 50.00 and 50.10.')
      } }
    },
    {
      heading: L('למה חדשות טובות יכולות להוריד מחיר?', 'Why can good news push a price down?'),
      paragraphs: [
        L('המחיר של היום כבר מגלם את מה שהשוק מצפה שיקרה. לכן חדשות מזיזות מחיר לפי הפער בין מה שקרה לבין מה שציפו — לא לפי השאלה אם הן נשמעות "טובות" או "רעות".',
          "Today's price already reflects what the market expects to happen. So news moves a price by the gap between what happened and what was expected — not by whether it sounds \"good\" or \"bad\"."),
        L('נניח שחברה מדווחת שהרווח שלה צמח ב־20%. נשמע מצוין — אבל אם המשקיעים ציפו ל־30%, חלקם יבינו שהמחיר ששילמו נשען על ציפייה אופטימית מדי, והם ימכרו. המחיר עלול לרדת, למרות שהחברה מרוויחה יותר מבשנה שעברה.',
          'Say a company reports that profit grew 20%. Sounds great — but if investors expected 30%, some will realise the price they paid was built on too rosy a forecast, and they\'ll sell. The price can fall even though the company is earning more than last year.'),
        L('מלבד דוחות, מחירים מגיבים גם לריבית ולמצב הכלכלה, לחדשות על הענף, ולמצב הרוח הכללי בשוק. לפעמים מניה זזה בלי שום חדשה שאפשר להצביע עליה — פשוט כי קונה או מוכר גדול נכנס לשוק.',
          'Besides earnings, prices react to interest rates and the economy, to news about the industry, and to the general mood of the market. Sometimes a stock moves with no news you can point to at all — simply because a large buyer or seller showed up.')
      ],
      callouts: [{ kind: 'caveat', lead: L('שימו לב', 'Watch out'), text: L(
        'אחרי שמחיר זז, תמיד יימצא הסבר. מראש — אף אחד לא יודע בוודאות איך השוק יפרש חדשה.',
        "Once a price has moved, there's always an explanation. Beforehand, nobody knows for sure how the market will read the news.") }],
      work: { kind: 'diagram', diagram: {
        type: 'bars',
        title: L('צפי מול תוצאה', 'Expected vs reported'),
        bars: [
          { label: L('צמיחה שציפו לה', 'Growth expected'), value: 30, tone: 'muted', shown: L('30%', '30%') },
          { label: L('צמיחה שדווחה', 'Growth reported'), value: 20, tone: 'err', shown: L('20%', '20%') }
        ],
        caption: L('תוצאה טובה, מתחת לצפי — והמחיר יכול לרדת.', 'A good result, below expectations — and the price can fall.')
      } }
    },
    {
      heading: L('למה המחיר קפץ עוד לפני שמישהו סחר?', 'Why did the price jump before anyone traded?'),
      paragraphs: [
        L('הבורסה פתוחה רק בשעות מסוימות, אבל חדשות לא מחכות. חברות רבות מפרסמות דוחות אחרי הנעילה. בזמן שהבורסה סגורה המשקיעים מעכלים את החדשה — ולמחרת בבוקר ההצעות הראשונות כבר מגלמות אותה. המחיר נפתח רחוק מהסגירה של אתמול, ובגרף נשאר "חור" שבו לא בוצעה אף עסקה: גאפ.',
          "An exchange is only open for set hours, but news doesn't wait. Many companies publish results after the close. While the market is shut, investors digest the news — and the next morning the first orders already reflect it. The price opens far from yesterday's close, leaving a \"hole\" on the chart where no trade took place: a gap."),
        L('יש גם מסחר לפני הפתיחה ואחרי הנעילה, אבל משתתפים בו מעט. כשמעט קונים ומוכרים פעילים, מספיקה פקודה לא גדולה כדי להזיז את המחיר — זו נזילות נמוכה. מניה שסוחרים בה הרבה, עם פער קטן בין הצעות הקנייה להצעות המכירה, היא נזילה; מניה שמעטים סוחרים בה — לא, ושם התנודות חדות יותר.',
          "There is trading before the open and after the close too, but few people take part. When only a handful of buyers and sellers are active, a modest order is enough to move the price — that's low liquidity. A stock that trades heavily, with a small gap between its buy and sell offers, is liquid; one that few people trade isn't, and it swings harder.")
      ],
      callouts: [
        { kind: 'example', lead: L('בגרף', 'On the chart'), text: L(
          'הדוח יצא אחרי הנעילה: הרווח צמח ב־20% מול צפי של 30%. למחרת המחיר נפתח כ־8% מתחת לסגירה, ובטווח שביניהם לא נסחרה אף מניה.',
          'The report came out after the close: profit up 20% against an expected 30%. The next morning the price opened about 8% below the close, and not a single share traded in between.') },
        { kind: 'caveat', lead: L('שימו לב', 'Watch out'), text: L(
          'יש שאומרים שגאפ תמיד "נסגר". לפעמים המחיר חוזר למלא את החור, ולפעמים לא — זה לא כלל.',
          'Some say a gap always "closes". Sometimes price comes back to fill the hole, and sometimes it doesn\'t — it isn\'t a rule.') }
      ],
      work: { kind: 'charts', charts: [0] }
    }
  ],
  charts: F3_CHARTS,
  activity: {
    kind: 'predict',
    prompt: L('מה הכי סביר בפתיחה למחרת?', 'What is most likely at the next open?'),
    sub: L('חברה מפרסמת דוח אחרי הנעילה: היא עדיין מפסידה כסף, אבל ההפסד קטן בהרבה ממה שהמשקיעים חששו. זה תרגיל על ציפיות, לא על "טוב" או "רע" — בחרו, ואז נחשוף מה קרה בגרף.',
      'A company reports after the close: it is still losing money, but the loss is far smaller than investors feared. This is about expectations, not "good" or "bad" — choose, then we\'ll reveal what the chart did.'),
    chart: 1,
    cut: BEAT.gapIdx,
    choices: [
      { key: 'down', label: L('נפתחת נמוך יותר — החברה עדיין מפסידה', 'It opens lower — the company is still losing money') },
      { key: 'up', label: L('נפתחת גבוה יותר — התוצאה טובה מהצפוי', 'It opens higher — the result beat expectations') },
      { key: 'flat', label: L('נפתחת בדיוק במחיר הסגירה — עוד לא היה מסחר', "It opens exactly at the close — there hasn't been any trading yet") }
    ],
    likely: 'up',
    outcome: L('ההפסד היה פחות גרוע ממה שהמחיר גילם. הקונים היו להוטים יותר מהמוכרים כבר לפני הפתיחה, והמחיר נפתח כ־10% מעל הסגירה — גאפ כלפי מעלה, בלי עסקה אחת בטווח שביניהם.',
      'The loss was less bad than the price had assumed. Buyers were more eager than sellers before the open even began, and the price opened about 10% above the close — a gap up, without a single trade in between.'),
    caveat: L('הפעם זה עבד כך. התגובה לדוח תלויה גם בתחזית של החברה להמשך ובמצב השוק כולו — ואין דרך לדעת אותה מראש.',
      "This time it went that way. The reaction to a report also depends on the company's outlook and the state of the market as a whole — and there's no way to know it in advance.")
  },
  takeaway: {
    bottomLine: L('המחיר הוא העסקה האחרונה שעליה הסכימו קונה ומוכר. הוא זז כשצד אחד להוט יותר — ולרוב בגלל פער בין מה שקרה לבין מה שציפו.',
      'The price is the last trade a buyer and a seller agreed on. It moves when one side is more eager — usually because of a gap between what happened and what was expected.'),
    caveat: L('כשמעט סוחרים פעילים — מחוץ לשעות המסחר או במניה לא נזילה — גם פקודות קטנות מזיזות את המחיר, וגאפים חדים אפשריים.',
      'When few traders are active — outside market hours, or in an illiquid stock — even small orders move the price, and sharp gaps are possible.')
  },
  questions: [
    q('f3-market-cap', 'F3', 'beginner',
      L('לחברה 200 מיליון מניות, והמחיר עלה היום מ־40 ל־44. מה קרה לשווי השוק שלה?', 'A company has 200 million shares, and the price rose today from 40 to 44. What happened to its market cap?'),
      [
        ['a', L('עלה ב־10%: מ־8 מיליארד ל־8.8 מיליארד', 'It rose 10%: from 8 billion to 8.8 billion')],
        ['b', L('לא השתנה — החברה לא הנפיקה מניות חדשות', "It didn't change — the company issued no new shares")],
        ['c', L('עלה ב־4 מיליארד', 'It rose by 4 billion')],
        ['d', L('אי אפשר לדעת בלי הדוחות הכספיים', "You can't tell without the financial statements")]
      ], 'a',
      L('שווי שוק = מחיר × מספר המניות. 200 מיליון × 40 = 8 מיליארד; 200 מיליון × 44 = 8.8 מיליארד — עלייה של 10%, בדיוק כמו המחיר. מספר המניות לא השתנה; השווי זז יחד עם המחיר.',
        "Market cap = price × number of shares. 200 million × 40 = 8 billion; 200 million × 44 = 8.8 billion — a 10% rise, exactly like the price. The number of shares didn't change; the value moved with the price.")),
    q('f3-expectations', 'F3', 'beginner',
      L('חברה דיווחה על עלייה של 25% במכירות. המשקיעים ציפו ל־40%. מה הכי סביר?', 'A company reported a 25% rise in sales. Investors expected 40%. What is most likely?'),
      [
        ['a', L('המחיר יעלה — 25% זו צמיחה יפה', 'The price rises — 25% is healthy growth')],
        ['b', L('המחיר עלול לרדת, כי התוצאה נמוכה מהצפי', 'The price may fall, because the result is below expectations')],
        ['c', L('המחיר לא יזוז, כי זו לא הפתעה', "The price won't move, because this isn't a surprise")],
        ['d', L('הבורסה תעצור את המסחר במניה', 'The exchange will halt trading in the stock')]
      ], 'b',
      L('המחיר כבר גילם ציפייה ל־40%. מה שמזיז אותו הוא הפער בין התוצאה לצפי: תוצאה טובה שמתחת לצפי יכולה להוריד מחיר.',
        'The price already reflected an expected 40%. What moves it is the gap between the result and the expectation: a good result that falls short can push the price down.')),
    q('f3-liquidity', 'F3', 'intermediate',
      L('במניה שכמעט לא סוחרים בה שלחתם פקודה גדולה לקנות "במחיר השוק". מה סביר שיקרה?', 'In a stock that hardly trades, you send a large order to buy "at the market". What is likely to happen?'),
      [
        ['a', L('תקנו הכול במחיר האחרון שהופיע על המסך', "You'll buy it all at the last price on the screen")],
        ['b', L('פקודה של אדם אחד לא משפיעה על המחיר', "One person's order doesn't affect the price")],
        ['c', L('הפקודה תקנה ממוכרים במחירים הולכים ועולים — ותזיז את המחיר למעלה בעצמה', 'The order will buy from sellers at rising prices — and push the price up itself')],
        ['d', L('הבורסה תמצא לכם מוכר במחיר ממוצע', 'The exchange will find you a seller at an average price')]
      ], 'c',
      L('במניה לא נזילה יש מעט הצעות מכירה בכל מחיר. פקודה גדולה מרוקנת את הזולות ועוברת ליקרות יותר — וכך מזיזה את המחיר בעצמה. בשיעור 5 תראו את זה קורה בספר הפקודות.',
        "In an illiquid stock there are few sell offers at each price. A large order uses up the cheap ones and moves on to pricier ones — pushing the price up by itself. In lesson 5 you'll watch this happen in the order book."))
  ]
};

// ============================================================================
// F4 · ETFs, indices and diversification from day one
// ============================================================================
const F4_CHARTS: LessonChartSpec[] = [{
  candles: series.F4_BROAD,
  variant: 'price',
  options: { showVolume: false, extraLines: [{ tone: 'ema20', values: series.F4_CONC }] },
  label: L('שני מדדים מדומים שמתחילים ב־100: מדד רחב בנרות ומדד מרוכז בקו כתום שעולה ויורד בערך פי שניים', 'Two made-up indices starting at 100: a broad one as candles and a concentrated one as an orange line that rises and falls roughly twice as far'),
  caption: L('רחב (נרות) מול מרוכז (קו כתום)', 'Broad (candles) vs concentrated (orange line)'),
  subcaption: L('שני מדדים מדומים שמתחילים ב־100 באותו יום. נתוני הדגמה.', 'Two made-up indices starting at 100 on the same day. Demo data.'),
  tone: 'neutral',
  height: 400
}];

export const F4: LessonContent = {
  id: 'F4',
  tutor: { topic: 'etf', label: L('קרן סל ופיזור', 'ETFs and diversification') },
  teach: [
    {
      heading: L('מה קורה כשחברה אחת נופלת?', 'What happens when one company falls?'),
      paragraphs: [
        L('כל מניה חשופה לשני סוגי סיכון. הראשון שייך לחברה עצמה: מוצר שנכשל, תביעה, מנכ״ל שעוזב, דוח מאכזב. השני שייך לשוק כולו: מיתון, עלייה חדה בריבית, משבר עולמי — דברים שמורידים כמעט את כל המניות יחד.',
          'Every stock carries two kinds of risk. The first belongs to the company itself: a product that flops, a lawsuit, a departing CEO, a disappointing report. The second belongs to the whole market: a recession, a sharp rise in interest rates, a global crisis — things that pull almost every stock down together.'),
        L('פיזור — החזקה של הרבה חברות במקום אחת — מרכך את הסוג הראשון. אם שמתם 1,000 ₪ במניה אחת והיא ירדה 40%, נשארו לכם 600 ₪. אם פיזרתם את אותו סכום על 20 חברות, ורק אחת מהן ירדה 40% בזמן שהשאר לא זזו, נשארו לכם 980 ₪.',
          'Diversification — holding many companies instead of one — softens the first kind. Put $1,000 into a single stock that drops 40% and you\'re left with $600. Spread the same amount across 20 companies, and if just one of them drops 40% while the rest stand still, you\'re left with $980.'),
        L('את הסוג השני פיזור לא מבטל. כשכל השוק יורד, גם סל של מאות מניות יורד. פיזור לא הופך השקעה לבטוחה — הוא מוודא שחברה אחת לא תכריע את גורל התיק כולו.',
          "The second kind, diversification doesn't remove. When the whole market falls, a basket of hundreds of stocks falls too. Diversifying doesn't make an investment safe — it makes sure no single company decides the fate of your whole portfolio.")
      ],
      work: { kind: 'diagram', diagram: {
        type: 'bars',
        title: L('1,000 ₪, וחברה אחת שיורדת 40%', '$1,000, and one company that drops 40%'),
        bars: [
          { label: L('הכול במניה אחת', 'All in one stock'), value: 600, tone: 'err', shown: L('600 ₪', '$600') },
          { label: L('מפוזר על 20 מניות', 'Spread over 20 stocks'), value: 980, tone: 'ok', shown: L('980 ₪', '$980') }
        ],
        caption: L('אותה נפילה, השפעה שונה לגמרי על התיק.', 'The same fall, a very different hit to the portfolio.')
      } }
    },
    {
      heading: L('מה יש בתוך קרן סל על מדד?', "What's inside an index ETF?"),
      paragraphs: [
        L('בשיעור הראשון ראינו שקרן סל מחזיקה סל של ניירות ונסחרת כמו מניה. קרן סל על מדד עושה משהו פשוט מאוד: מחזיקה את המניות שבמדד, באותם משקלים. מי שקונה יחידה אחת של קרן על S&P 500 מחזיק, בעקיפין, חתיכה קטנה מכ־500 חברות — בפקודה אחת.',
          'Lesson 1 showed that an ETF holds a basket of securities and trades like a share. An index ETF does something very simple: it holds the stocks in the index, in the same weights. Buy one unit of an S&P 500 ETF and you indirectly own a small slice of about 500 companies — in a single order.'),
        L('יש לזה מחיר: דמי ניהול שנתיים, שמנוכים מהקרן. בקרן שעוקבת אחרי מדד הם לרוב נמוכים — עשיריות האחוז. קרן שמנהל בוחר עבורה מניות גובה בדרך כלל יותר, ורוב הקרנות האלה לא מצליחות לאורך זמן להכות את המדד אחרי שמנכים את דמי הניהול.',
          'It comes at a cost: an annual management fee, taken out of the fund. For a fund that tracks an index it is usually low — tenths of a percent. A fund whose manager picks the stocks typically charges more, and over time most such funds fail to beat the index once their fees are taken out.'),
        L('עוד הבדל מעשי: קרן סל נסחרת בבורסה לאורך כל יום המסחר, במחיר שמשתנה כל הזמן — כמו מניה. קרן נאמנות נקנית ונמכרת פעם ביום, לפי שווי הנכסים שלה בסוף היום.',
          'One more practical difference: an ETF trades on the exchange throughout the trading day, at a price that keeps changing — like a share. A mutual fund is bought and sold once a day, at the value of its holdings at the close.')
      ],
      callouts: [{ kind: 'example', lead: L('דמי ניהול לאורך זמן', 'Fees over time'), text: L(
        '100,000 ₪ שצומחים 6% בשנה במשך 20 שנה: עם דמי ניהול של 0.1% מגיעים לכ־315 אלף ₪, ועם 1% — לכ־265 אלף. אותן מניות, הבדל של כ־50 אלף ₪.',
        '$100,000 growing 6% a year for 20 years: with a 0.1% fee it reaches about $315,000; with a 1% fee, about $265,000. The same stocks, a difference of roughly $50,000.') }],
      work: { kind: 'diagram', diagram: {
        type: 'bars',
        title: L('100,000 ₪ אחרי 20 שנה', '$100,000 after 20 years'),
        bars: [
          { label: L('דמי ניהול 0.1%', '0.1% fee'), value: 314.7, tone: 'ok', shown: L('כ־315 אלף ₪', 'about $315k') },
          { label: L('דמי ניהול 1%', '1% fee'), value: 265.3, tone: 'err', shown: L('כ־265 אלף ₪', 'about $265k') }
        ],
        caption: L('בהנחת צמיחה של 6% בשנה לפני דמי ניהול.', 'Assuming 6% a year before fees.')
      } }
    },
    {
      heading: L('מדד רחב או מדד מרוכז?', 'A broad index or a concentrated one?'),
      paragraphs: [
        L('גם בין מדדים יש הבדל בפיזור. S&P 500 מפוזר על פני כל ענפי הכלכלה האמריקאית — בנקים, בריאות, אנרגיה, טכנולוגיה ועוד. נאסד״ק 100 מרוכז הרבה יותר בחברות טכנולוגיה וצמיחה.',
          'Indices differ in how spread out they are, too. The S&P 500 is spread across every sector of the US economy — banks, healthcare, energy, technology and more. The Nasdaq 100 is far more concentrated in technology and growth companies.'),
        L('הריכוז הזה חותך לשני הכיוונים: בתקופות טובות מדד מרוכז נוטה לעלות חזק יותר, ובירידות — ליפול חזק יותר. חברות צמיחה רגישות במיוחד לריבית, כי חלק גדול מהשווי שלהן נשען על רווחים רחוקים בעתיד.',
          'That concentration cuts both ways: in good times a concentrated index tends to rise harder, and in downturns to fall harder. Growth companies are especially sensitive to interest rates, because much of their value rests on profits far in the future.'),
        L('אין כאן "נכון" אחד. מי שרוצה יציבות ופיזור רחב נוטה למדד הרחב; מי שמוכן לתנודות גדולות יותר תמורת חשיפה לטכנולוגיה — למרוכז; ורבים מחזיקים את שניהם. וזה נכון גם לבחירת מניות בודדות: מניה נבחרת יכולה לעקוף את המדד בגדול — או לפגר אחריו בגדול. המדד מוותר על ההפתעות לשני הכיוונים.',
          "There's no single right answer. Someone who wants stability and broad diversification leans toward the broad index; someone willing to take bigger swings for more technology leans toward the concentrated one; plenty hold both. The same goes for picking individual stocks: a chosen stock can beat the index by a lot — or trail it by a lot. The index gives up surprises in both directions.")
      ],
      notesTitle: L('מה לשים לב בגרף', 'What to notice on the chart'),
      notes: [
        { tone: 'support', label: L('בעליות', 'On the way up'), explanation: L('כשהמדד הרחב מטפס, המרוכז מטפס בערך פי שניים.', 'When the broad index climbs, the concentrated one climbs roughly twice as far.') },
        { tone: 'resistance', label: L('בירידות', 'On the way down'), explanation: L('בנסיגות, המרוכז גם מאבד בערך פי שניים — אותה תכונה, בכיוון ההפוך.', 'In pullbacks, the concentrated one also loses roughly twice as much — the same trait, in reverse.') }
      ],
      work: { kind: 'charts', charts: [0] }
    }
  ],
  charts: F4_CHARTS,
  activity: {
    kind: 'sort',
    prompt: L('ממה פיזור מגן? מיינו כל אירוע', 'What does diversification protect you from? Sort each event'),
    bins: [
      { id: 'company', label: L('פיזור מרכך את זה', 'Diversification softens this'), tone: 'var(--ok)' },
      { id: 'market', label: L('פיזור לא מגן מזה', "Diversification doesn't shield this"), tone: 'var(--risk)' }
    ],
    items: [
      { id: 'lawsuit', label: L('חברה אחת מפסידה בתביעה ענקית', 'One company loses a huge lawsuit'), bin: 'company', why: L('אירוע של חברה אחת: בתיק מפוזר היא רק חלק קטן מהכסף.', "An event at one company: in a diversified portfolio it's only a small part of the money.") },
      { id: 'recession', label: L('מיתון מוריד את רוב המניות בבורסה', 'A recession drags down most stocks'), bin: 'market', why: L('כשכמעט כל המניות יורדות יחד, גם סל רחב יורד.', 'When almost every stock falls together, a broad basket falls too.') },
      { id: 'ceo', label: L('מנכ״ל של חברה עוזב פתאום', "A company's CEO suddenly quits"), bin: 'company', why: L('זה נוגע לחברה אחת. בסל של מאות חברות ההשפעה על התיק קטנה.', 'It affects one company. In a basket of hundreds, the effect on the portfolio is small.') },
      { id: 'rates', label: L('הבנק המרכזי מעלה ריבית בחדות', 'The central bank raises interest rates sharply'), bin: 'market', why: L('העלאת ריבית חדה לוחצת על מחירי רוב המניות בבת אחת — פיזור בין מניות לא מבטל את זה.', "A sharp rate rise weighs on most stock prices at once — spreading across stocks doesn't cancel that.") },
      { id: 'fire', label: L('מפעל של חברה נשרף', "A company's factory burns down"), bin: 'company', why: L('נזק לחברה אחת. בתיק מפוזר הוא מתקזז ברוב המקרים מול שאר החברות.', "Damage to one company. In a diversified portfolio it's diluted by all the others.") },
      { id: 'crisis', label: L('משבר פיננסי עולמי', 'A global financial crisis'), bin: 'market', why: L('משבר עולמי פוגע כמעט בכל השווקים יחד — זה בדיוק הסיכון שפיזור בין מניות לא מסיר.', 'A global crisis hits almost every market together — exactly the risk that spreading across stocks cannot remove.') }
    ],
    right: L('פיזור מחליש את מה שקורה לחברה אחת. מה שפוגע בכל השוק — פוגע גם בסל.', 'Diversification weakens what happens to one company. What hits the whole market hits the basket too.'),
    explain: [
      L('זה ההבדל בין סיכון של חברה לסיכון של שוק. בתיק של 20 מניות, נפילה חדה של אחת מהן היא עניין של אחוזים בודדים; ירידה של כל השוק מורגשת בכל התיק.',
        "That's the difference between company risk and market risk. In a 20-stock portfolio, a sharp fall in one of them is a matter of a few percent; a fall in the whole market is felt across the whole portfolio."),
      L('לכן פיזור לא מבטיח שלא תפסידו — הוא רק מוודא שהכישלון של חברה אחת לא יהיה הכישלון של ההשקעה כולה.',
        "So diversification doesn't guarantee you won't lose — it only makes sure one company's failure isn't the failure of your whole investment.")
    ]
  },
  takeaway: {
    bottomLine: L('קרן סל על מדד רחב מפזרת את הכסף על מאות חברות בפקודה אחת ובדמי ניהול נמוכים — ומרככת את מה שקורה לכל חברה בנפרד.',
      'An ETF on a broad index spreads your money across hundreds of companies in one order, at a low fee — softening what happens to any single company.'),
    caveat: L('פיזור לא מגן מירידה של כל השוק, ומדד מרוכז כמו נאסד״ק 100 תנודתי יותר ממדד רחב כמו S&P 500 — לשני הכיוונים.',
      "Diversification doesn't protect against the whole market falling, and a concentrated index like the Nasdaq 100 swings more than a broad one like the S&P 500 — in both directions.")
  },
  questions: [
    q('f4-fees', 'F4', 'beginner',
      L('שתי קרנות סל עוקבות אחרי אותו מדד בדיוק. אחת גובה 0.1% בשנה, השנייה 0.8%. במה הן יבדלו לאורך 20 שנה?', 'Two ETFs track exactly the same index. One charges 0.1% a year, the other 0.8%. How will they differ over 20 years?'),
      [
        ['a', L('בכלום — הן מחזיקות את אותן מניות', "Not at all — they hold the same stocks")],
        ['b', L('הזולה צפויה להשאיר לכם יותר כסף, כי ההפרש נגרע כל שנה ומצטבר', 'The cheaper one should leave you with more, because the difference is taken every year and compounds')],
        ['c', L('היקרה תניב יותר, כי מי שגובה יותר מנהל טוב יותר', 'The pricier one will return more, because charging more means better management')],
        ['d', L('הזולה מסוכנת יותר', 'The cheaper one is riskier')]
      ], 'b',
      L('אותן מניות, אותה תשואה לפני דמי ניהול. ההבדל היחיד הוא מה שנגרע כל שנה — והוא מצטבר, כי כסף שנגרע לא ממשיך לצמוח. בקרן שעוקבת אחרי מדד, מחיר גבוה יותר לא קונה ניהול טוב יותר.',
        "The same stocks, the same return before fees. The only difference is what's taken each year — and it compounds, because money that's taken out stops growing. In a fund that tracks an index, a higher fee doesn't buy better management.")),
    q('f4-concentration', 'F4', 'beginner',
      L('בחודש שבו מניות הטכנולוגיה צנחו, איזו השקעה ירדה כנראה הכי פחות?', 'In a month when technology stocks plunged, which holding probably fell the least?'),
      [
        ['a', L('מניה של חברת טכנולוגיה אחת', 'Shares of a single tech company')],
        ['b', L('קרן על נאסד״ק 100', 'A Nasdaq 100 fund')],
        ['c', L('קרן על S&P 500', 'An S&P 500 fund')],
        ['d', L('כולן ירדו בדיוק באותה מידה', 'They all fell by exactly the same amount')]
      ], 'c',
      L('S&P 500 מפוזר על כל הענפים, כך שהטכנולוגיה היא רק חלק ממנו. נאסד״ק 100 מרוכז בטכנולוגיה, ומניה בודדת חשופה לגמרי לגורל של חברה אחת.',
        'The S&P 500 is spread across every sector, so technology is only part of it. The Nasdaq 100 is concentrated in technology, and a single stock is fully exposed to one company\'s fate.')),
    q('f4-etf-vs-fund', 'F4', 'intermediate',
      L('מה ההבדל המעשי בין קרן סל לקרן נאמנות?', 'What is the practical difference between an ETF and a mutual fund?'),
      [
        ['a', L('קרן סל נסחרת לאורך כל היום במחיר משתנה; קרן נאמנות נקנית ונמכרת פעם ביום לפי שווי הנכסים', 'An ETF trades all day at a changing price; a mutual fund is bought and sold once a day at the value of its holdings')],
        ['b', L('קרן נאמנות תמיד זולה יותר', 'A mutual fund is always cheaper')],
        ['c', L('קרן סל לא מחזיקה מניות אמיתיות', "An ETF doesn't hold real shares")],
        ['d', L('אין ביניהן שום הבדל', "There's no difference at all")]
      ], 'a',
      L('שתיהן סלים משותפים של ניירות. קרן סל נסחרת בבורסה כמו מניה, במחיר שמשתנה לאורך היום; קרן נאמנות מתומחרת פעם ביום לפי שווי הנכסים בסוף היום. דמי הניהול תלויים בקרן — לא בסוג שלה.',
        "Both are shared baskets of securities. An ETF trades on the exchange like a share, at a price that changes through the day; a mutual fund is priced once a day at the value of its holdings at the close. The fee depends on the fund — not on which kind it is."))
  ]
};

// ============================================================================
// F5 · Your first order (the order book, from the approved prototype)
// ============================================================================
const BOOK = { asks: [[100.10, 300], [100.15, 500], [100.25, 800], [100.40, 1000]] as Array<[number, number]>, bids: [[100.00, 400], [99.95, 600], [99.85, 900], [99.70, 1200]] as Array<[number, number]> };

export const F5: LessonContent = {
  id: 'F5',
  tutor: { topic: 'order-types', label: L('סוגי פקודות', 'order types') },
  teach: [
    {
      heading: L('למה יש שני מחירים ולא אחד?', 'Why are there two prices, not one?'),
      paragraphs: [
        L('בשיעור 3 ראיתם שבכל רגע יש בבורסה הצעות קנייה והצעות מכירה. לשתיהן יש שמות: הצעת הקנייה הגבוהה ביותר נקראת Bid, והצעת המכירה הנמוכה ביותר נקראת Ask. יחד עם הכמויות שממתינות בכל מחיר, זה ספר הפקודות.',
          "In lesson 3 you saw that the exchange always holds buy offers and sell offers. Both have names: the highest buy offer is the bid, and the lowest sell offer is the ask. Together with the quantities waiting at each price, that's the order book."),
        L('המחיר שמופיע ליד המניה הוא העסקה האחרונה — אבל כשרוצים לקנות עכשיו, משלמים את ה־Ask: מה שהמוכר הזול ביותר מבקש. וכשרוצים למכור עכשיו, מקבלים את ה־Bid: מה שהקונה הנדיב ביותר מציע.',
          'The price shown next to a stock is the last trade — but if you want to buy right now, you pay the ask: what the cheapest seller wants. And if you want to sell right now, you get the bid: what the most generous buyer is offering.')
      ],
      callouts: [{ kind: 'example', lead: L('איך קוראים את הספר', 'How to read it'), text: L(
        'למעלה — הצעות מכירה, כשהזולה קרובה לאמצע. למטה — הצעות קנייה, מהגבוהה ביותר ומטה. ליד כל מחיר: כמה מניות מחכות בו.',
        'Top — sell offers, the cheapest nearest the middle. Bottom — buy offers, highest first. Next to each price: how many shares are waiting there.') }],
      work: { kind: 'diagram', diagram: { type: 'book', title: L('ספר הפקודות', 'The order book'), ...BOOK, highlight: 'best', caption: L('Ask הזול: 100.10 · Bid הגבוה: 100.00', 'Best ask 100.10 · best bid 100.00') } }
    },
    {
      heading: L('המרווח: העלות שלא רואים', "The spread: the cost you don't see"),
      paragraphs: [
        L('הפער בין ה־Ask ל־Bid נקרא מרווח (Spread). בספר שלנו הוא 0.10: קונים ב־100.10 ומוכרים ב־100.00. מי שקונה 100 מניות ומיד מוכר אותן בחזרה מפסיד 10 ₪ עוד לפני עמלות — בלי שהמחיר זז בכלל.',
          'The gap between the ask and the bid is the spread. In our book it is 0.10: you buy at 100.10 and sell at 100.00. Buy 100 shares and sell them straight back, and you have lost $10 before any fees — without the price moving at all.'),
        L('במניות נזילות, שסוחרים בהן הרבה, המרווח זעיר. במניות שמעט סוחרים בהן הוא יכול להיות רחב, וזו עלות אמיתית שנגבית בכל כניסה ויציאה. זה עוד פן של הנזילות שפגשתם בשיעור 3.',
          "In liquid, heavily traded stocks the spread is tiny. In stocks few people trade it can be wide, and that's a real cost you pay every time you get in and out. It's another side of the liquidity you met in lesson 3.")
      ],
      work: { kind: 'diagram', diagram: { type: 'book', title: L('ספר הפקודות', 'The order book'), ...BOOK, highlight: 'spread', caption: L('מרווח: 100.10 − 100.00 = 0.10', 'Spread: 100.10 − 100.00 = 0.10') } }
    },
    {
      heading: L('פקודת שוק או פקודת לימיט?', 'A market order or a limit order?'),
      paragraphs: [
        L('פקודת שוק אומרת: "קנו עכשיו, במחיר הטוב ביותר שיש". היא מבטיחה ביצוע — לא מחיר. היא קונה מההיצע הזול ביותר; אם אין בו מספיק מניות, היא ממשיכה להיצע הבא, היקר יותר, והמחיר הממוצע שלכם עולה.',
          'A market order says: "buy now, at the best price available". It guarantees a fill — not a price. It buys from the cheapest offer; if that isn\'t enough shares, it moves on to the next, pricier offer, and your average price goes up.'),
        L('פקודת לימיט אומרת: "קנו רק במחיר הזה, או זול ממנו". היא מבטיחה מחיר — לא ביצוע. אם אין מוכר במחיר הזה, הפקודה נכנסת לספר כהצעת קנייה ומחכה. אולי תבוצע מאוחר יותר, ואולי בכלל לא.',
          'A limit order says: "buy only at this price, or cheaper". It guarantees a price — not a fill. If no seller is at that price, the order joins the book as a buy offer and waits. It may fill later, or not at all.'),
        L('יש עוד סוגי פקודות — למשל סטופ לוס, שמוכרת אוטומטית אם המחיר יורד לרמה שקבעתם. עליהן תלמדו במסלול הסיכון, כשנדבר על ניהול עסקה.',
          "There are other order types — a stop-loss, for instance, which sells automatically if the price falls to a level you set. You'll learn those in the Risk track, when we get to managing a trade.")
      ],
      callouts: [{ kind: 'example', lead: L('למשל', 'For example'), text: L(
        'פקודת שוק ל־500 מניות בספר הזה: 300 נקנות ב־100.10, ועוד 200 ב־100.15. המחיר הממוצע: 100.12.',
        'A market order for 500 shares in this book: 300 fill at 100.10, and another 200 at 100.15. The average price: 100.12.') }],
      work: { kind: 'diagram', diagram: { type: 'book', title: L('ספר הפקודות', 'The order book'), ...BOOK, highlight: 'none', caption: L('פקודת שוק ל־500 מניות: כל 300 המניות ב־100.10, ועוד 200 ב־100.15.', 'A market order for 500 shares: all 300 shares at 100.10, then 200 more at 100.15.') } }
    }
  ],
  charts: [],
  activity: {
    kind: 'orderBook',
    prompt: L('שלחו פקודות לספר — ושימו לב מה בוצע', 'Send orders to the book — and watch what fills'),
    book: { asks: BOOK.asks.map((a) => [a[0], a[1]] as [number, number]), bids: BOOK.bids.map((b) => [b[0], b[1]] as [number, number, boolean?]) },
    tasks: [
      { id: 'market', text: L('קנו בפקודת שוק — באיזה מחיר קיבלתם?', 'Buy with a market order — what price did you get?') },
      { id: 'limitRest', text: L('שלחו פקודת לימיט מתחת להיצע הזול ביותר', 'Send a limit order below the cheapest offer') },
      { id: 'sweep', text: L('קנו בפקודת שוק יותר ממה שיש בשכבה הזולה', 'Buy more with a market order than the cheapest layer holds') }
    ],
    currency: L('₪', '$'),
    explain: [
      L('פקודת שוק קונה מיד, מהמוכרים הזולים ביותר — ובכמות גדולה, גם מהיקרים יותר. פקודת לימיט שומרת על המחיר, אבל יכולה לחכות בספר בלי להתבצע.',
        "A market order buys at once, from the cheapest sellers — and in a large quantity, from pricier ones too. A limit order protects the price, but it can sit in the book without filling."),
      L('הבחירה ביניהן היא בחירה בין ודאות של ביצוע לוודאות של מחיר — והמרווח הוא העלות שמשלמים על ה"עכשיו".',
        'Choosing between them is choosing between certainty of a fill and certainty of a price — and the spread is what you pay for "now".')
    ]
  },
  takeaway: {
    bottomLine: L('קונים ב־Ask ומוכרים ב־Bid, והמרווח ביניהם הוא עלות בכל כניסה ויציאה. פקודת שוק מבטיחה ביצוע; פקודת לימיט מבטיחה מחיר.',
      'You buy at the ask and sell at the bid, and the spread between them is a cost every time you get in and out. A market order guarantees a fill; a limit order guarantees a price.'),
    caveat: L('פקודת שוק גדולה במניה דלילה יכולה לטפס על כמה שכבות בספר ולשלם הרבה מעל המחיר שראיתם על המסך.',
      'A large market order in a thinly traded stock can climb several layers of the book and pay well above the price you saw on screen.')
  },
  questions: [
    q('f5-bid-ask', 'F5', 'beginner',
      L('ה־Bid הגבוה הוא 49.90 וה־Ask הזול הוא 50.00, ובשכבה של 50.00 ממתינות 300 מניות. שלחתם פקודת שוק לקנות 100 מניות. באיזה מחיר תקנו?', 'The best bid is 49.90 and the best ask is 50.00, with 300 shares waiting at 50.00. You send a market order to buy 100 shares. What price do you pay?'),
      [
        ['a', L('49.90', '49.90')],
        ['b', L('50.00', '50.00')],
        ['c', L('49.95 — באמצע', '49.95 — the midpoint')],
        ['d', L('במחיר העסקה האחרונה, מה שלא יהיה', 'The last traded price, whatever it is')]
      ], 'b',
      L('פקודת קנייה בשוק קונה מהמוכר הזול ביותר — ב־Ask, 50.00, ויש שם מספיק מניות. 49.90 הוא מה שקונה אחר מציע, והאמצע הוא לא מחיר שמישהו מוכן למכור בו.',
        'A market buy order buys from the cheapest seller — at the ask, 50.00, where there are enough shares. 49.90 is what another buyer offers, and the midpoint is not a price anyone is selling at.')),
    q('f5-limit', 'F5', 'beginner',
      L('ההיצע הזול ביותר הוא 50.00. שלחתם פקודת לימיט לקנות ב־49.50. מה יקרה?', 'The cheapest offer is 50.00. You send a limit order to buy at 49.50. What happens?'),
      [
        ['a', L('תקנו מיד ב־50.00', "You'll buy at once at 50.00")],
        ['b', L('תקנו מיד ב־49.50', "You'll buy at once at 49.50")],
        ['c', L('הפקודה תחכה בספר עד שמוכר יסכים למכור ב־49.50 או פחות — ואולי זה לא יקרה', 'The order waits in the book until a seller agrees to 49.50 or less — which may never happen')],
        ['d', L('הפקודה תבוטל מיד', 'The order is cancelled at once')]
      ], 'c',
      L('לימיט הוא תקרה: לא תשלמו יותר מ־49.50. אין כרגע מוכר במחיר הזה, אז הפקודה נכנסת לספר כהצעת קנייה ומחכה. המחיר מובטח — הביצוע לא.',
        "A limit is a ceiling: you won't pay more than 49.50. No seller is there right now, so the order joins the book as a bid and waits. The price is guaranteed — the fill is not.")),
    q('f5-spread', 'F5', 'intermediate',
      L('במניה עם מרווח רחב — מה המשמעות בפועל לקונה שמתכנן למכור בקרוב?', 'In a stock with a wide spread, what does that mean in practice for a buyer who plans to sell soon?'),
      [
        ['a', L('שום דבר — המרווח משפיע רק על הבורסה', 'Nothing — the spread only affects the exchange')],
        ['b', L('הקנייה מתחילה בהפסד: קונים ב־Ask הגבוה, ומיד אפשר למכור רק ב־Bid הנמוך', 'The trade starts at a loss: you buy at the higher ask, and can only sell right away at the lower bid')],
        ['c', L('הקונה מקבל הנחה על המחיר', 'The buyer gets a discount on the price')],
        ['d', L('המרווח מתקזז בעמלות', 'The spread is cancelled out by fees')]
      ], 'b',
      L('המרווח הוא עלות: מי שנכנס קונה ב־Ask ומי שיוצא מיד מוכר ב־Bid. כשהמרווח רחב, המחיר צריך לעלות לפחות בגובה המרווח רק כדי לחזור לאפס — עוד לפני עמלות.',
        'The spread is a cost: you buy at the ask and, getting straight out, sell at the bid. When it is wide, the price has to rise by at least the spread just to get back to even — before any fees.'))
  ]
};

export const FOUNDATIONS: readonly LessonContent[] = [F2, F3, F4, F5];
