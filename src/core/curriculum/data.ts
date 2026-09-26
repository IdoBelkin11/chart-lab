// ---------------------------------------------------------------------------
// The curriculum: 6 tracks, 47 lessons.
//
// GENERATED from the approved design's curriculum (the Artifact's data), so
// the product and the design cannot disagree about a lesson's id, title,
// level, module, prerequisite or time estimate. Do not hand-edit titles here
// without changing the design source too.
//
//   kind     'project' (title starts with "Project"), 'interactive' (needs a
//            dedicated instrument, `tool`), else 'lesson'
//   minutes  project 30 · interactive 18 · basic 10 · intermediate 14 ·
//            advanced 16 — the estimate every screen shows
//   legacyId the lesson's id in the previous 8-lesson build, if it had one;
//            progress saved under that id migrates to this lesson
//   kbTopics the AI knowledge-base topics this lesson teaches (the tutor and
//            practice resolve against these)
// ---------------------------------------------------------------------------
import type { Localized } from '@core/types/kb';

export type TrackId = 'F' | 'T' | 'P' | 'R' | 'M' | 'D';
export type LessonLevel = 1 | 2 | 3;
export type LessonKind = 'lesson' | 'interactive' | 'project';

export interface CurriculumLesson {
  id: string;
  track: TrackId;
  /** Index of the module (group) inside its track. */
  module: number;
  level: LessonLevel;
  kind: LessonKind;
  title: Localized;
  minutes: number;
  kbTopics: readonly string[];
  /** The instrument an interactive lesson needs (built in the lesson-types phase). */
  tool?: string;
  legacyId?: string;
  /** Seven step titles, one per step of the lesson (idea → … → next). Absent
   *  until the lesson's content is written; never filled with generic labels. */
  steps?: { he: readonly string[]; en: readonly string[] };
}

export interface TrackModule { title: Localized; lessons: readonly string[] }

export interface Track {
  id: TrackId;
  title: Localized;
  abbr: Localized;
  description: Localized;
  /** soft = recommended first; hard = locked until that track is completed. */
  prereq: { soft?: TrackId; hard?: TrackId } | null;
  modules: readonly TrackModule[];
}

export const TRACKS: readonly Track[] = [
  {
    id: "F",
    title: { he: "יסודות השוק", en: "Market Foundations" },
    abbr: { he: "יס", en: "FD" },
    description: { he: "מה בכלל קונים, מי משתתף במסחר, ומה קורה כשלוחצים \"קנה\".", en: "What you actually buy, who takes part, and what happens when you press Buy." },
    prereq: null,
    modules: [
      { title: { he: "יסודות", en: "Basics" }, lessons: ["F1", "F2", "F3", "F4", "F5"] },
    ]
  },
  {
    id: "T",
    title: { he: "ניתוח טכני", en: "Technical Analysis" },
    abbr: { he: "טכ", en: "TA" },
    description: { he: "קריאת גרף: מגמה, תמיכה והתנגדות, ממוצעים, מומנטום ותבניות.", en: "Reading charts: trend, support and resistance, averages, momentum and patterns." },
    prereq: {soft: "F"},
    modules: [
      { title: { he: "קריאת הגרף", en: "Reading the chart" }, lessons: ["T1", "T2", "T3"] },
      { title: { he: "הכלים המרכזיים", en: "Core tools" }, lessons: ["T4", "T5", "T6", "T7"] },
      { title: { he: "קריאה מתקדמת", en: "Advanced reading" }, lessons: ["T8", "T9", "T10", "T11"] },
      { title: { he: "פרויקט", en: "Project" }, lessons: ["T12"] },
    ]
  },
  {
    id: "P",
    title: { he: "ניתוח פונדמנטלי", en: "Fundamental Analysis" },
    abbr: { he: "פו", en: "FA" },
    description: { he: "מדוחות כספיים לשווי: רווחיות, מכפילים, חוב, ומודל הערכת שווי משלכם.", en: "From financial statements to value: profitability, multiples, debt and your own valuation." },
    prereq: {soft: "F"},
    modules: [
      { title: { he: "לקרוא דוחות", en: "Reading statements" }, lessons: ["P1", "P2", "P3"] },
      { title: { he: "איכות ומחיר", en: "Quality and price" }, lessons: ["P4", "P5", "P6", "P7", "P8"] },
      { title: { he: "פרויקט", en: "Project" }, lessons: ["P9"] },
    ]
  },
  {
    id: "R",
    title: { he: "סיכון, תיק והתנהגות", en: "Risk, Portfolio & Behavior" },
    abbr: { he: "סי", en: "RP" },
    description: { he: "כמה לשים במה, איך לא לאבד הכול בטעות אחת, ולמה המוח עובד נגדכם ברגע הלא נכון.", en: "How much to put where, how not to lose it all on one mistake, and why your brain works against you." },
    prereq: {soft: "F"},
    modules: [
      { title: { he: "להבין סיכון", en: "Understanding risk" }, lessons: ["R1", "R2", "R3"] },
      { title: { he: "לנהל תיק", en: "Managing a portfolio" }, lessons: ["R4", "R5", "R6", "R7"] },
      { title: { he: "פרויקט", en: "Project" }, lessons: ["R8"] },
    ]
  },
  {
    id: "M",
    title: { he: "מאקרו וזירת השוק", en: "Macro & the Market" },
    abbr: { he: "מא", en: "MA" },
    description: { he: "ריבית, אינפלציה, אג״ח ומחזורי שוק — למה הכול זז ביחד כשהבנק המרכזי מדבר.", en: "Rates, inflation, bonds and cycles — why everything moves together when the central bank speaks." },
    prereq: {soft: "F"},
    modules: [
      { title: { he: "הכלכלה", en: "The economy" }, lessons: ["M1", "M2", "M3"] },
      { title: { he: "אג״ח ונכסים", en: "Bonds and assets" }, lessons: ["M4", "M5", "M6"] },
      { title: { he: "מי מזיז את השוק", en: "Who moves the market" }, lessons: ["M7"] },
    ]
  },
  {
    id: "D",
    title: { he: "נגזרים ומינוף", en: "Derivatives & Leverage" },
    abbr: { he: "נג", en: "DL" },
    description: { he: "אופציות, חוזים עתידיים, מינוף ושורט — כלים חדים, ולכן נפתחים רק אחרי מסלול הסיכון.", en: "Options, futures, leverage and shorting — sharp tools, so they open only after the risk track." },
    prereq: {hard: "R"},
    modules: [
      { title: { he: "אופציות", en: "Options" }, lessons: ["D1", "D2", "D3", "D4"] },
      { title: { he: "מינוף ושורט", en: "Leverage and shorting" }, lessons: ["D5", "D6"] },
    ]
  },
];

export const LESSONS: readonly CurriculumLesson[] = [
  { id: "F1", track: "F", module: 0, level: 1, kind: "lesson", title: { he: "שוק ההון: מה בעצם קונים", en: "The market: what you are actually buying" }, minutes: 10, kbTopics: ["capital-market","stock","bond","etf","index"], legacyId: "l0",
    steps: { he: ["לפני הגרפים","לא רק מניות","ארבעה מושגים","קרן סל או מניה?","פיזור בקנייה אחת","3 דברים לזכור","הבא: מי במשחק"], en: ["Before the charts","Not just stocks","Four terms","ETF or stock?","Spread in one buy","3 things to keep","Next: who plays"] } },
  { id: "F2", track: "F", module: 0, level: 1, kind: "lesson", title: { he: "בורסה, ברוקר ומדד: מי משתתף במשחק", en: "Exchanges, brokers and indices" }, minutes: 10, kbTopics: ["exchange","broker","index","ticker-symbol","blue-chip"],
    steps: { he: ["בורסה","ברוקר","מדד","מי עושה מה?","הדרך של פקודה","3 דברים לזכור","הבא: למה המחיר זז"], en: ["The exchange","The broker","The index","Who does what?","An order's path","3 things to keep","Next: why prices move"] } },
  { id: "F3", track: "F", module: 0, level: 1, kind: "lesson", title: { he: "למה המחיר זז", en: "Why prices move" }, minutes: 10, kbTopics: ["why-price-moves","market-cap","liquidity","gap","premarket-afterhours"],
    steps: { he: ["מי קובע את המחיר","ציפיות, לא רק חדשות","קפיצה בפתיחה","מה יקרה בפתיחה?","ביקוש מול היצע","3 דברים לזכור","הבא: קרן סל ופיזור"], en: ["Who sets the price","Expectations, not just news","The opening jump","What happens at the open?","Buyers vs sellers","3 things to keep","Next: ETFs and diversification"] } },
  { id: "F4", track: "F", module: 0, level: 1, kind: "lesson", title: { he: "קרן סל, מדד ופיזור מהיום הראשון", en: "ETFs, indices and diversification from day one" }, minutes: 10, kbTopics: ["etf","mutual-fund-vs-etf","index-investing-vs-stockpicking","sp500-vs-nasdaq100"],
    steps: { he: ["מה פיזור עושה","קרן סל מבפנים","רחב מול מרוכז","נגד מה הפיזור מגן?","למה הפיזור ריכך","3 דברים לזכור","הבא: הפקודה הראשונה"], en: ["What spreading does","Inside an ETF","Broad vs concentrated","What does it protect against?","Why spreading softened it","3 things to keep","Next: your first order"] } },
  { id: "F5", track: "F", module: 0, level: 1, kind: "interactive", title: { he: "הפקודה הראשונה: מה קורה כשלוחצים \"קנה\"", en: "Your first order: what happens when you press Buy" }, minutes: 18, kbTopics: ["order-types","bid-ask-spread","how-trading-works"], tool: "order",
    steps: { he: ["מחיר קנייה ומכירה","המרווח","שוק או לימיט","פקודה בפועל","מה בוצע ולמה","3 דברים לזכור","הבא: תרגול המסלול"], en: ["Bid and ask","The spread","Market or limit","Place an order","What filled, and why","3 things to keep","Next: track practice"] } },
  { id: "T1", track: "T", module: 0, level: 1, kind: "lesson", title: { he: "איך קוראים גרף: טווחי זמן ונפח מסחר", en: "Reading a chart: timeframes and volume" }, minutes: 10, kbTopics: ["how-to-read-a-chart","volume"],
    steps: { he: ["מה יש בגרף","טווח זמן","עמודות הנפח","מצאו את היום החריג","מה הנפח סיפר","3 דברים לזכור","הבא: נר בודד"], en: ["What's on a chart","Timeframe","The volume bars","Find the unusual day","What the volume said","3 things to keep","Next: one candle"] } },
  { id: "T2", track: "T", module: 0, level: 1, kind: "lesson", title: { he: "נרות יפניים: מה נר בודד מספר", en: "Candlesticks: what one candle tells you" }, minutes: 10, kbTopics: ["candlestick","candlestick-patterns"], legacyId: "l4",
    steps: { he: ["נר בהקשר","רמז, לא הוכחה","חמש תבניות","זהו את הפטיש","מה הנר סיפר","3 דברים לזכור","הבא: מגמה"], en: ["A candle in context","A hint, not proof","Five patterns","Spot the hammer","What it said","3 things to keep","Next: trend"] } },
  { id: "T3", track: "T", module: 0, level: 1, kind: "interactive", title: { he: "מגמה: עולה, יורדת או דשדוש", en: "Trend: up, down or sideways" }, minutes: 18, kbTopics: ["trend","bull-market","bear-market"], tool: "trend",
    steps: { he: ["שיאים ושפלים","למה זה מגמה","עולה, יורדת, דשדוש","זהו את המגמה","לפי השפלים","3 דברים לזכור","הבא: תמיכה"], en: ["Highs and lows","Why it's a trend","Up, down, sideways","Spot the trend","Read the lows","3 things to keep","Next: support"] } },
  { id: "T4", track: "T", module: 1, level: 2, kind: "lesson", title: { he: "תמיכה והתנגדות", en: "Support and resistance" }, minutes: 14, kbTopics: ["support-resistance"], legacyId: "l1",
    steps: { he: ["מהי תמיכה","למה המחיר נעצר","מסמנים אזור","מצאו את התמיכה","בודקים את הסימון","3 דברים לזכור","הבא: פריצה"], en: ["What support is","Why price stops","Marking a zone","Find the support","Checking the mark","3 things to keep","Next: breakouts"] } },
  { id: "T5", track: "T", module: 1, level: 2, kind: "lesson", title: { he: "פריצה ובדיקה חוזרת", en: "Breakout and retest" }, minutes: 14, kbTopics: ["breakout-retest","pullback"], legacyId: "l2",
    steps: { he: ["מהי פריצה","אמיתית או מדומה","נפח מאשר","מהו ריטסט?","מה הריטסט בודק","3 דברים לזכור","הבא: ממוצעים"], en: ["What a breakout is","Real or fake","Volume confirms","What's a retest?","What the retest checks","3 things to keep","Next: averages"] } },
  { id: "T6", track: "T", module: 1, level: 2, kind: "lesson", title: { he: "ממוצעים נעים", en: "Moving averages" }, minutes: 14, kbTopics: ["moving-averages"], legacyId: "l3",
    steps: { he: ["ממוצע נע","קצר מול ארוך","חציית ממוצעים","מתי נחצה?","למה האיתות מאחר","3 דברים לזכור","הבא: מומנטום"], en: ["Moving average","Short vs long","The crossover","When did it cross?","Why the signal lags","3 things to keep","Next: momentum"] } },
  { id: "T7", track: "T", module: 1, level: 2, kind: "lesson", title: { he: "מומנטום: RSI ו־MACD", en: "Momentum: RSI and MACD" }, minutes: 14, kbTopics: ["rsi","momentum"], legacyId: "l6",
    steps: { he: ["RSI בשורה אחת","קנייה־יתר","MACD","חשבו RSI","החישוב, צעד־צעד","3 דברים לזכור","הבא: דייברג׳נס"], en: ["RSI in one line","Overbought","MACD","Work out the RSI","The maths, step by step","3 things to keep","Next: divergence"] } },
  { id: "T8", track: "T", module: 2, level: 2, kind: "lesson", title: { he: "דייברג׳נס: כשמחיר ומומנטום לא מסכימים", en: "Divergence: when price and momentum disagree" }, minutes: 14, kbTopics: ["divergence"],
    steps: { he: ["שני שיאים, שתי קריאות","מה זה יכול לרמוז","כשהמחיר לא מתהפך","מצאו את הפסגות","מה ה־RSI אמר","3 דברים לזכור","הבא: פיבונאצ׳י"], en: ["Two peaks, two readings","What it can suggest","When price doesn't turn","Find the peaks","What RSI said","3 things to keep","Next: Fibonacci"] } },
  { id: "T9", track: "T", module: 2, level: 2, kind: "lesson", title: { he: "פיבונאצ׳י: עד כמה חוזר תיקון", en: "Fibonacci: how far a pullback goes" }, minutes: 14, kbTopics: ["fibonacci"], legacyId: "l5",
    steps: { he: ["תיקון בתוך מגמה","היחסים","מותחים את הכלי","עד איפה חזר?","איפה התיקון נעצר","3 דברים לזכור","הבא: תבניות"], en: ["A pullback in a trend","The ratios","Drawing the tool","How far back?","Where it stopped","3 things to keep","Next: patterns"] } },
  { id: "T10", track: "T", module: 2, level: 2, kind: "lesson", title: { he: "תבניות גרף", en: "Chart patterns" }, minutes: 14, kbTopics: ["chart-patterns"], legacyId: "l7",
    steps: { he: ["תבנית היא סיפור","ראש וכתפיים","קו הצוואר","זהו את התבנית","מחשבים יעד","3 דברים לזכור","הבא: היפוך או המשך"], en: ["A pattern is a story","Head and shoulders","The neckline","Name the pattern","Working out a target","3 things to keep","Next: reversal or not"] } },
  { id: "T11", track: "T", module: 2, level: 3, kind: "lesson", title: { he: "תבניות היפוך מול תבניות המשך", en: "Reversal vs continuation patterns" }, minutes: 16, kbTopics: ["reversal-patterns","continuation-patterns"],
    steps: { he: ["היפוך או המשך","תבניות היפוך","תבניות המשך","מיינו 6 תבניות","ההקשר מכריע","3 דברים לזכור","הבא: הפרויקט"], en: ["Reversal or continuation","Reversal patterns","Continuation patterns","Sort 6 patterns","Context decides","3 things to keep","Next: the project"] } },
  { id: "T12", track: "T", module: 3, level: 3, kind: "project", title: { he: "פרויקט: לשלב אינדיקטורים בלי לסתור את עצמכם", en: "Project: combining indicators without contradicting yourself" }, minutes: 30, kbTopics: ["combining-indicators","breakout-volume-rsi-conflict-scenario","volatility"],
    steps: { he: ["כל כלי, שאלה אחרת","כשהכלים לא מסכימים","איפה הקריאה שגויה","ניתוח שלם","מה החלטתם ולמה","3 דברים לזכור","הבא: תרגול המסלול"], en: ["Each tool, one question","When the tools disagree","Where the read is wrong","A full analysis","What you decided, and why","3 things to keep","Next: track practice"] } },
  { id: "P1", track: "P", module: 0, level: 1, kind: "lesson", title: { he: "למה מסתכלים על החברה עצמה", en: "Why look at the business itself" }, minutes: 10, kbTopics: ["fundamental","how-to-evaluate-a-company","moat","value-vs-growth-investing"],
    steps: { he: ["המניה והעסק","מה בונה שווי","חפיר","עסק או מחיר?","מה מיינתם","3 דברים לזכור","הבא: דוח רווח והפסד"], en: ["The stock and the business","What builds value","A moat","Business or price?","What you sorted","3 things to keep","Next: the income statement"] } },
  { id: "P2", track: "P", module: 0, level: 1, kind: "interactive", title: { he: "דוח רווח והפסד: מהכנסות לרווח נקי", en: "The income statement: from revenue to net income" }, minutes: 18, kbTopics: ["revenue","gross-profit","operating-income","net-income","eps","ebitda"], tool: "statement",
    steps: { he: ["מהכנסות לרווח","ארבעה סוגי רווח","דוח שורה־שורה","איפה הפער?","תפעולי מול נקי","3 דברים לזכור","הבא: מאזן"], en: ["Revenue to profit","Four kinds of profit","Line by line","Find the gap","Operating vs net","3 things to keep","Next: balance sheet"] } },
  { id: "P3", track: "P", module: 0, level: 2, kind: "lesson", title: { he: "מאזן ותזרים מזומנים", en: "Balance sheet and cash flow" }, minutes: 14, kbTopics: ["balance-sheet","operating-cash-flow","free-cash-flow","cash-flow-vs-accounting-profit","capex-vs-opex"],
    steps: { he: ["מה יש, מה חייבים","שני צדדים שווים","רווח ≠ מזומן","קראו את המאזן","היחס השוטף","3 דברים לזכור","הבא: שולי רווח"], en: ["Owns vs owes","Two equal sides","Profit ≠ cash","Read the balance sheet","The current ratio","3 things to keep","Next: margins"] } },
  { id: "P4", track: "P", module: 1, level: 2, kind: "lesson", title: { he: "שולי רווח: לא כל שקל הכנסה שווה", en: "Margins: not every dollar of revenue is equal" }, minutes: 14, kbTopics: ["gross-margin","operating-margin","net-margin"],
    steps: { he: ["מכל שקל הכנסה","גולמי ותפעולי","חמש שנים","השוו שוליים","מינוף תפעולי","3 דברים לזכור","הבא: תשואה על ההון"], en: ["Out of every dollar","Gross and operating","Five years","Compare margins","Operating leverage","3 things to keep","Next: return on capital"] } },
  { id: "P5", track: "P", module: 1, level: 2, kind: "lesson", title: { he: "תשואה על ההון: ROE, ROA, ROIC", en: "Return on capital: ROE, ROA, ROIC" }, minutes: 14, kbTopics: ["roe","roa","roic"],
    steps: { he: ["כמה ההון מרוויח","שלוש תשואות","כשחוב מנפח","חשבו ROE","ROE מול ROIC","3 דברים לזכור","הבא: מכפילים"], en: ["What capital earns","Three returns","When debt inflates","Work out the ROE","ROE vs ROIC","3 things to keep","Next: multiples"] } },
  { id: "P6", track: "P", module: 1, level: 2, kind: "lesson", title: { he: "מכפילים: P/E, PEG, P/S, P/B, EV/EBITDA", en: "Multiples: P/E, PEG, P/S, P/B, EV/EBITDA" }, minutes: 14, kbTopics: ["pe","peg","ps-ratio","pb-ratio","ev-ebitda","market-cap-vs-enterprise-value"],
    steps: { he: ["מה מכפיל מודד","P/E ו־P/S","כשאין רווח","הזולה ביחס לצמיחה","מכפיל מול צמיחה","3 דברים לזכור","הבא: חוב"], en: ["What a multiple measures","P/E and P/S","When there's no profit","Cheapest for its growth","Price vs growth","3 things to keep","Next: debt"] } },
  { id: "P7", track: "P", module: 1, level: 2, kind: "lesson", title: { he: "חוב ואיתנות פיננסית", en: "Debt and financial strength" }, minutes: 14, kbTopics: ["debt-equity","current-ratio","interest-coverage"],
    steps: { he: ["כמה חוב זה הרבה","חוב להון","כיסוי ריבית","חשבו כיסוי","מה המספר אומר","3 דברים לזכור","הבא: עונת דוחות"], en: ["How much debt is a lot","Debt to equity","Interest coverage","Work out the coverage","What the number says","3 things to keep","Next: earnings season"] } },
  { id: "P8", track: "P", module: 1, level: 2, kind: "lesson", title: { he: "עונת דוחות: תחזיות, דיבידנדים ורכישה עצמית", en: "Earnings season: guidance, dividends and buybacks" }, minutes: 14, kbTopics: ["earnings-season","guidance","growth-metrics","payout-ratio","dividend-yield","stock-buybacks"],
    steps: { he: ["מה בודקים בדוח","תחזית ההנהלה","מחזירים כסף לבעלים","קראו את הדוח","למה המניה ירדה","3 דברים לזכור","הבא: פרויקט DCF"], en: ["What to check in a report","Management guidance","Returning cash to owners","Read the report","Why the stock fell","3 things to keep","Next: the DCF project"] } },
  { id: "P9", track: "P", module: 2, level: 3, kind: "project", title: { he: "פרויקט: הערכת שווי במודל DCF", en: "Project: valuing a company with a DCF" }, minutes: 30, kbTopics: ["valuation","intrinsic-value","dcf","discount-rate","terminal-value"], tool: "dcf",
    steps: { he: ["מה זה DCF","הנחות","תחזית והיוון","ערך שארית","שווי ורגישות","מה המודל לא יודע","הבא: סיכום המסלול"], en: ["What a DCF is","Assumptions","Forecast and discount","Terminal value","Value and sensitivity","What it can't know","Next: track wrap-up"] } },
  { id: "R1", track: "R", module: 0, level: 1, kind: "lesson", title: { he: "מה זה בעצם סיכון", en: "What risk actually is" }, minutes: 10, kbTopics: ["risk","volatility","beta","drawdown"] },
  { id: "R2", track: "R", module: 0, level: 1, kind: "lesson", title: { he: "פיזור ומתאם", en: "Diversification and correlation" }, minutes: 10, kbTopics: ["diversification","correlation","stocks-vs-bonds-safety"],
    steps: { he: ["עשר מניות, הימור אחד","מתאם","מניות מול אג״ח","קראו את המטריצה","פיזור אמיתי","3 דברים לזכור","הבא: ריבית דריבית"], en: ["Ten stocks, one bet","Correlation","Stocks vs bonds","Read the matrix","Real diversification","3 things to keep","Next: compounding"] } },
  { id: "R3", track: "R", module: 0, level: 1, kind: "lesson", title: { he: "זמן, ריבית דריבית והפקדה קבועה", en: "Time, compounding and regular investing" }, minutes: 10, kbTopics: ["compound-interest","time-horizon","dollar-cost-averaging","lump-sum","market-timing"] },
  { id: "R4", track: "R", module: 1, level: 2, kind: "lesson", title: { he: "גודל פוזיציה, הקצאה ואיזון מחדש", en: "Position size, allocation and rebalancing" }, minutes: 14, kbTopics: ["position-sizing","asset-allocation","rebalancing"],
    steps: { he: ["מתחילים מההפסד","הנוסחה","חשבון של ₪50,000","כמה מניות?","הכמות משתנה","3 דברים לזכור","הבא: סטופ ויעד"], en: ["Start from the loss","The formula","A ₪50,000 account","How many shares?","Size moves, risk doesn't","3 things to keep","Next: stops and targets"] } },
  { id: "R5", track: "R", module: 1, level: 2, kind: "lesson", title: { he: "סטופ לוס, טייק פרופיט ויחס סיכוי-סיכון", en: "Stop-loss, take-profit and risk/reward" }, minutes: 14, kbTopics: ["stop-loss","take-profit","risk-reward-ratio"],
    steps: { he: ["סטופ ויעד","יחס 1:2.5","נקודת האיזון","תכננו עסקה","מתי זה משתלם","3 דברים לזכור","הבא: הטיות"], en: ["Stop and target","A 1:2.5 ratio","Break-even rate","Plan a trade","When it pays","3 things to keep","Next: biases"] } },
  { id: "R6", track: "R", module: 1, level: 2, kind: "lesson", title: { he: "הטיות: למה המוח עובד נגדכם", en: "Biases: why your brain works against you" }, minutes: 14, kbTopics: ["behavioral-biases","when-to-sell","why-am-i-losing-money"],
    steps: { he: ["המוח מול התיק","אפקט הנטייה","שתי מניות","איזו למכור?","השאלה הנכונה","3 דברים לזכור","הבא: ירידות ובועות"], en: ["Your brain vs your portfolio","The disposition effect","Two stocks","Which to sell?","The right question","3 things to keep","Next: crashes and bubbles"] } },
  { id: "R7", track: "R", module: 1, level: 2, kind: "lesson", title: { he: "ירידות חדות, בועות והונאות", en: "Crashes, bubbles and scams" }, minutes: 14, kbTopics: ["market-bubbles-crashes","what-to-do-in-a-market-drop","investment-scams"],
    steps: { he: ["ירידה של 30%","איך נראית בועה","סימני הונאה","מה עושים עכשיו?","מה כל בחירה עולה","3 דברים לזכור","הבא: פרויקט התיק"], en: ["A 30% drop","What a bubble looks like","Signs of fraud","What now?","What each choice costs","3 things to keep","Next: portfolio project"] } },
  { id: "R8", track: "R", module: 2, level: 2, kind: "project", title: { he: "פרויקט: בונים תיק ראשון", en: "Project: building a first portfolio" }, minutes: 30, kbTopics: ["portfolio","asset-allocation"], tool: "portfolio",
    steps: { he: ["פרופיל סיכון","הקצאה","שנה טובה","שנה רעה","מה הייתם עושים","כללים מראש","הבא: סיכום המסלול"], en: ["Risk profile","Allocation","A good year","A bad year","What would you do","Rules in advance","Next: track wrap-up"] } },
  { id: "M1", track: "M", module: 0, level: 1, kind: "interactive", title: { he: "ריבית: מחיר הכסף", en: "Interest rates: the price of money" }, minutes: 18, kbTopics: ["interest-rate","monetary-policy","rate-growth-stocks-link"], tool: "rates",
    steps: { he: ["ריבית = מחיר הכסף","לווים וחוסכים","אג״ח קיים","הזיזו את הריבית","מי הרוויח, מי הפסיד","3 דברים לזכור","הבא: אינפלציה"], en: ["Rates: the price of money","Borrowers and savers","Existing bonds","Move the rate","Who won, who lost","3 things to keep","Next: inflation"] } },
  { id: "M2", track: "M", module: 0, level: 1, kind: "lesson", title: { he: "אינפלציה, תוצר ואבטלה", en: "Inflation, GDP and unemployment" }, minutes: 10, kbTopics: ["inflation","gdp","unemployment"],
    steps: { he: ["אינפלציה","הבנק מגיב","2022 כדוגמה","קראו את הגרף","באיחור, תמיד","3 דברים לזכור","הבא: מחזורים"], en: ["Inflation","The central bank reacts","2022 as a case","Read the chart","Always late","3 things to keep","Next: cycles"] } },
  { id: "M3", track: "M", module: 0, level: 2, kind: "lesson", title: { he: "מיתון, מדיניות פיסקלית ומחזורי שוק", en: "Recessions, fiscal policy and market cycles" }, minutes: 14, kbTopics: ["recession","fiscal-policy","bull-vs-bear-market"],
    steps: { he: ["ארבעה שלבים","מי מוביל מתי","מחזור שלם","איפה אנחנו?","לא יודעים בזמן אמת","3 דברים לזכור","הבא: אג״ח"], en: ["Four phases","Who leads when","A full cycle","Where are we?","You can't tell live","3 things to keep","Next: bonds"] } },
  { id: "M4", track: "M", module: 1, level: 2, kind: "lesson", title: { he: "אג״ח: קופון, תשואה ומחיר", en: "Bonds: coupon, yield and price" }, minutes: 14, kbTopics: ["bond","coupon","bond-yield-ytm","bond-price-interest-rate","duration","credit-risk-and-ratings","corporate-vs-government-bonds"] },
  { id: "M5", track: "M", module: 1, level: 3, kind: "lesson", title: { he: "עקום התשואות כאיתות", en: "The yield curve as a signal" }, minutes: 16, kbTopics: ["yield-curve"],
    steps: { he: ["עקום התשואות","רגיל מול הפוך","10Y − 2Y","קראו את העקום","איתות, לא תחזית","3 דברים לזכור","הבא: דולר וזהב"], en: ["The yield curve","Normal vs inverted","10Y − 2Y","Read the curve","A signal, not a forecast","3 things to keep","Next: dollar and gold"] } },
  { id: "M6", track: "M", module: 1, level: 2, kind: "lesson", title: { he: "דולר, זהב וסחורות", en: "The dollar, gold and commodities" }, minutes: 14, kbTopics: ["dollar-strength","gold","commodities"] },
  { id: "M7", track: "M", module: 2, level: 3, kind: "lesson", title: { he: "מוסדיים, עושי שוק ו\"מגולם במחיר\"", en: "Institutions, market makers and \"priced in\"" }, minutes: 16, kbTopics: ["institutional-investors","market-makers","efficient-markets-priced-in","insider-trading","arbitrage"] },
  { id: "D1", track: "D", module: 0, level: 3, kind: "interactive", title: { he: "אופציית Call: זכות, לא חובה", en: "The call option: a right, not an obligation" }, minutes: 18, kbTopics: ["options-basics"], tool: "payoff",
    steps: { he: ["זכות, לא חובה","פרמיה ומימוש","גרף הרווח","הזיזו את המחיר","נקודת האיזון","3 דברים לזכור","הבא: Put"], en: ["A right, not a duty","Premium and strike","The payoff chart","Move the price","The break-even","3 things to keep","Next: puts"] } },
  { id: "D2", track: "D", module: 0, level: 3, kind: "lesson", title: { he: "אופציית Put והגנה על תיק", en: "The put option and portfolio protection" }, minutes: 16, kbTopics: ["options-basics","hedging"],
    steps: { he: ["Put: זכות למכור","מניה + Put","רצפה ב־₪4","בנו ביטוח","מחיר הביטוח","3 דברים לזכור","הבא: אסטרטגיות"], en: ["A put: the right to sell","Stock + put","A ₪4 floor","Build the hedge","What insurance costs","3 things to keep","Next: strategies"] } },
  { id: "D3", track: "D", module: 0, level: 3, kind: "lesson", title: { he: "אסטרטגיות משולבות", en: "Combined strategies" }, minutes: 16, kbTopics: ["options-strategies"] },
  { id: "D4", track: "D", module: 0, level: 3, kind: "lesson", title: { he: "תנודתיות משתמעת והיוונים", en: "Implied volatility and the Greeks" }, minutes: 16, kbTopics: ["implied-volatility-greeks"] },
  { id: "D5", track: "D", module: 1, level: 3, kind: "lesson", title: { he: "חוזים עתידיים, מינוף ומרג׳ין", en: "Futures, leverage and margin" }, minutes: 16, kbTopics: ["futures","leverage","margin"],
    steps: { he: ["מינוף","מרג׳ין","פי 10 לשני הכיוונים","כמה הפסדתם?","חשבון המינוף","3 דברים לזכור","הבא: שורט"], en: ["Leverage","Margin","10× both ways","How much did you lose?","The leverage maths","3 things to keep","Next: short selling"] } },
  { id: "D6", track: "D", module: 1, level: 3, kind: "lesson", title: { he: "מכירה בחסר ושורט סקוויז", en: "Short selling and short squeezes" }, minutes: 16, kbTopics: ["short-selling","short-squeeze","options-flow"] },
];
