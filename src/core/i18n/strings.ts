// ---------------------------------------------------------------------------
// Interface strings.
//
// Extracted verbatim from the authored content of the previous build — this
// is a move, not a rewrite. Every key holds both languages side by side, so a
// string can never exist in one language only; that is enforced by the
// `Record<TranslationKey, Localized>` type rather than by discipline.
//
// Lesson TITLES and nav labels are NOT here: they live in
// @core/lessons/lessons.ts, which is the single source of truth for lesson
// identity. Duplicating them here is what previously let the AI tutor and
// the quiz disagree about which topic the learner was on.
// ---------------------------------------------------------------------------
import type { Lang, Localized } from '@core/types/kb';

export const STRINGS = {
  "aiBackLabel": {
    "en": "Back to site",
    "he": "חזרה לאתר"
  },
  "aiDisclaimer": {
    "en": "Educational information only, not investment advice — the assistant can be wrong.",
    "he": "מידע חינוכי בלבד, לא ייעוץ השקעות — העוזר עלול לטעות."
  },
  "aiEmptyBody": {
    "en": "Stocks, indices, ETFs, bonds, financial terms, or anything confusing on this site — including the charts and lessons themselves.",
    "he": "מניות, מדדים, קרנות סל, אג״ח, מושגים פיננסיים, או כל דבר שלא ברור באתר — כולל הגרפים והשיעורים עצמם."
  },
  "aiEmptyTitle": {
    "en": "Ask me anything about the markets",
    "he": "שאלו אותי כל דבר על השווקים"
  },
  "aiError": {
    "en": "Sorry, something went wrong connecting to the assistant. Please try again.",
    "he": "מצטערים, הייתה בעיה בחיבור לעוזר. נסו שוב."
  },
  "aiEx1": {
    "en": "What is P/E?",
    "he": "מה זה P/E?"
  },
  "aiEx2": {
    "en": "How do you analyze a stock?",
    "he": "איך מנתחים מניה?"
  },
  "aiEx3": {
    "en": "What's the difference between the S&P 500 and Nasdaq?",
    "he": "מה ההבדל בין S&P 500 לנאסד״ק?"
  },
  "aiEx4": {
    "en": "Explain this chart to me",
    "he": "תסביר לי את הגרף הזה"
  },
  "aiEx5": {
    "en": "What is a stop-loss?",
    "he": "מה זה סטופ לוס?"
  },
  "aiFabLabel": {
    "en": "AI assistant",
    "he": "עוזר AI"
  },
  "aiPlaceholder": {
    "en": "Ask a question...",
    "he": "שאלו שאלה..."
  },
  "aiRateLimited": {
    "en": "You're sending messages a bit fast — please wait a moment and try again.",
    "he": "אתם שולחים הודעות מהר מדי — המתינו רגע ונסו שוב."
  },
  "aiRestartLabel": {
    "en": "Start a new conversation",
    "he": "התחל שיחה חדשה"
  },
  "aiRestartText": {
    "en": "New chat",
    "he": "שיחה חדשה"
  },
  "aiSendLabel": {
    "en": "Send",
    "he": "שלח"
  },
  "aiSubtitle": {
    "en": "Ask about anything on this site or in the markets",
    "he": "שאלו כל דבר על האתר או על השווקים"
  },
  "aiTitle": {
    "en": "Market Assistant",
    "he": "עוזר שוק ההון"
  },
  "bearEB": {
    "en": "The mirror image: an up candle is swallowed by a down candle right after. The same idea, working against the trend instead of with it.",
    "he": "התמונה ההפוכה: נר עולה נבלע על ידי נר יורד מיד אחריו. אותו רעיון, פועל נגד המגמה במקום איתה."
  },
  "bearEH": {
    "en": "Bearish engulfing",
    "he": "בליעה דובית (Bearish Engulfing)"
  },
  "brandName": {
    "en": "Chart Lab",
    "he": "צ׳ארט לאב"
  },
  "bullEB": {
    "en": "A down candle is immediately followed by an up candle whose body fully covers it — buyers didn't just show up, they overpowered the entire previous session's range in one move.",
    "he": "נר יורד ואחריו מיד נר עולה שהגוף שלו מכסה אותו לחלוטין — הקונים לא רק הופיעו, הם התגברו על כל הטווח של המפגש הקודם במהלך אחד."
  },
  "bullEH": {
    "en": "Bullish engulfing",
    "he": "בליעה שורית (Bullish Engulfing)"
  },
  "c1B": {
    "en": "A share of stock is a small piece of ownership in a company. When you buy one share, you literally own a tiny fraction of that business — its future profits, and its future risks. Companies list their shares on an exchange (like the NYSE or Nasdaq) so ownership can be bought and sold freely, and that constant buying and selling is what creates a moving price.",
    "he": "מניה היא פיסת בעלות קטנה בחברה. כשקונים מניה אחת, בעצם מחזיקים בשבריר זעיר מהעסק עצמו — מהרווחים העתידיים שלו, וגם מהסיכונים העתידיים שלו. חברות רושמות את המניות שלהן בבורסה (כמו NYSE או Nasdaq) כדי שהבעלות תוכל להימכר ולהיקנות בחופשיות, וזה בדיוק מה שיוצר מחיר שנע כל הזמן."
  },
  "c1H": {
    "en": "What is a stock?",
    "he": "מה זו מניה?"
  },
  "c2B": {
    "en": "At every moment, a stock's price is simply the last price a buyer and a seller agreed on. It rises when more people want to buy than are willing to sell at that price, and falls when the opposite is true. News and earnings matter only because they change how buyers and sellers feel about the future — that feeling is what moves the price, not the news itself.",
    "he": "בכל רגע נתון, מחיר המניה הוא פשוט המחיר האחרון שקונה ומוכר הסכימו עליו. הוא עולה כשיותר אנשים רוצים לקנות מאשר מוכנים למכור באותו מחיר, ויורד כשההפך נכון. חדשות ודוחות רווח חשובים רק כי הם משנים איך קונים ומוכרים מרגישים לגבי העתיד — התחושה היא מה שמזיז את המחיר, לא החדשה עצמה."
  },
  "c2H": {
    "en": "What actually moves the price?",
    "he": "מה באמת מזיז את המחיר?"
  },
  "c3B": {
    "en": "Fundamental analysis asks \"is this a good company, priced fairly?\" — it studies financial statements and industry conditions to judge long-term value. Technical analysis asks a different question: \"what is the price actually doing, and what has it tended to do next?\" This whole site teaches the second one, but plenty of successful investors use both together.",
    "he": "ניתוח פונדמנטלי שואל: \"האם זו חברה טובה, והאם היא מתומחרת בהגינות?\" — הוא בוחן דוחות כספיים ותנאי ענף כדי לשפוט ערך ארוך טווח. ניתוח טכני שואל שאלה שונה: \"מה המחיר בפועל עושה, ומה הוא נטה לעשות אחר כך?\" כל האתר הזה מלמד את השנייה, אבל הרבה משקיעים מצליחים משתמשים בשתיהן יחד."
  },
  "c3H": {
    "en": "Technical vs. fundamental analysis",
    "he": "ניתוח טכני מול ניתוח פונדמנטלי"
  },
  "c4B": {
    "en": "A price chart is a timeline of trades, and each candlestick summarizes one time period: where price opened, how high and low it went, and where it closed. Green usually means it closed higher than it opened; red means lower. That's most of what you need before Lesson 04 goes deep on what specific candle shapes tend to mean.",
    "he": "גרף מחיר הוא ציר זמן של עסקאות, וכל נר מסכם פרק זמן אחד: איפה המחיר נפתח, כמה גבוה וכמה נמוך הוא הגיע, ואיפה הוא נסגר. ירוק בדרך כלל אומר שהוא נסגר גבוה יותר משנפתח; אדום אומר נמוך יותר. זה רוב מה שצריך לדעת לפני ששיעור 04 צולל לעומק לגבי מה שצורות נר ספציפיות נוטות לרמז."
  },
  "c4H": {
    "en": "Reading a chart, in short",
    "he": "קריאת גרף, בקצרה"
  },
  "c5B": {
    "en": "The same stock can look like it's crashing on a 5-minute chart and calmly climbing on a weekly chart — both are \"true\" at once, they're just answering different questions. Shorter timeframes suit short-term trading; longer ones suit longer-term decisions. Always know which timeframe you're looking at before drawing a conclusion from it.",
    "he": "אותה מניה בדיוק יכולה להיראות כמו שהיא קורסת בגרף של 5 דקות ומטפסת ברוגע בגרף שבועי — שניהם \"נכונים\" באותו הזמן, הם פשוט עונים על שאלות שונות. טווחי זמן קצרים מתאימים למסחר לטווח קצר; ארוכים יותר מתאימים להחלטות ארוכות טווח. תמיד דעו על איזה טווח זמן אתם בכלל מסתכלים לפני שאתם מסיקים מסקנה ממנו."
  },
  "c5H": {
    "en": "Timeframes change the story",
    "he": "טווחי זמן משנים את הסיפור"
  },
  "c6B": {
    "en": "Volume is simply how many shares changed hands in a given period. A price move on heavy volume means a lot of participants agreed with it — real conviction. The same move on light volume is easier to dismiss, and easier to reverse. You'll see this idea come up constantly in the lessons ahead.",
    "he": "נפח הוא פשוט כמה מניות עברו יד בפרק זמן נתון. תנועת מחיר בנפח כבד אומרת שהרבה משתתפים הסכימו איתה — שכנוע אמיתי. אותה תנועה בנפח קל קל יותר לפטור, וקל יותר להפוך. תראו את הרעיון הזה עולה כל הזמן בשיעורים הבאים."
  },
  "c6H": {
    "en": "Volume: the market's heartbeat",
    "he": "נפח: הדופק של השוק"
  },
  "compareFalseH": {
    "en": "False breakout — failed",
    "he": "פריצה כוזבת — נכשלה"
  },
  "compareNote": {
    "en": "Not every breakout continues. On the right, price pokes above resistance for a day or two on weak volume, then falls back inside the range — a reminder that breakouts describe a probability, not a certainty.",
    "he": "לא כל פריצה ממשיכה. מימין, המחיר מציץ מעל ההתנגדות ליום או יומיים בנפח חלש, ואז נופל בחזרה לתוך הטווח — תזכורת לכך שפריצות מתארות הסתברות, לא ודאות."
  },
  "compareRealH": {
    "en": "Real breakout — held",
    "he": "פריצה אמיתית — החזיקה"
  },
  "dbB": {
    "en": "Price falls to a low, bounces, falls back to roughly the same low, then breaks above the peak between the two lows (the \"neckline\"). Two failed attempts to go lower is read as sellers running out of conviction.",
    "he": "המחיר יורד לשפל, מתאושש, יורד בחזרה לאותו שפל בערך, ואז פורץ מעל השיא שבין שני השפלים (\"קו הצוואר\"). שני ניסיונות כושלים לרדת נמוך יותר נקראים כאובדן דחף מצד המוכרים."
  },
  "dbH": {
    "en": "Double Bottom",
    "he": "תחתית כפולה (Double Bottom)"
  },
  "dd0": {
    "en": "Everything on this site is taught using stocks, but technical analysis isn't just for stocks. The same tools — support, resistance, trends, candlesticks, RSI — are used almost identically on crypto, forex, commodities, and indices, because they all come down to the same thing: a chart of buyers and sellers agreeing on a price over time.",
    "he": "כל מה שבאתר הזה מלמד באמצעות מניות, אבל ניתוח טכני הוא לא רק למניות. אותם הכלים — תמיכה, התנגדות, מגמות, נרות, RSI — משמשים כמעט באופן זהה בקריפטו, מט\"ח, סחורות ומדדים, כי כולם בסופו של דבר אותו דבר: גרף של קונים ומוכרים שמסכימים על מחיר לאורך זמן."
  },
  "dd1": {
    "en": "Every time a level holds, more traders notice it and place orders around it — which is part of what makes it hold again next time. But that same crowding is also why levels eventually break: once price finally pushes through, all the stop-losses clustered just beyond it get triggered at once, which is often exactly what fuels the strength of a breakout.",
    "he": "בכל פעם שרמה מחזיקה, יותר סוחרים שמים לב אליה ומציבים סביבה פקודות — וזה חלק ממה שגורם לה להחזיק שוב בפעם הבאה. אבל אותה צפיפות היא גם הסיבה שרמות בסופו של דבר נשברות: ברגע שהמחיר סוף סוף פורץ דרך, כל אותם סטופ-לוס שהצטברו ממש מעבר לרמה מופעלים בבת אחת — מה שלעיתים קרובות בדיוק מזין את עוצמת הפריצה."
  },
  "dd2": {
    "en": "Not every dip after a breakout is a retest — sometimes it's a full reversal. The distinction traders look for: a genuine retest usually pauses close to the old resistance and doesn't spend more than a candle or two trading back below it. A close that stays under the old level for longer than that is a warning the breakout may be failing.",
    "he": "לא כל ירידה אחרי פריצה היא ריטסט — לפעמים זה היפוך מלא. ההבחנה שסוחרים מחפשים: ריטסט אמיתי בדרך כלל נעצר בקרבת ההתנגדות הישנה ולא נשאר יותר מנר אחד או שניים מתחתיה. סגירה שנשארת מתחת לרמה הישנה לזמן ארוך יותר היא אזהרה שהפריצה עלולה להיכשל."
  },
  "dd3": {
    "en": "Why 20 and 150 specifically? The 20-day average covers roughly a month of trading — short enough to track the current swing, which is why short-term traders watch for pullbacks toward it rather than breaks below it. The 150-day average gets talked about far less, but it's a cornerstone of professional trend-screening systems: Mark Minervini's well-known \"Trend Template\" requires price to hold above a rising 150-day average before a stock even qualifies as a long-term uptrend candidate — precisely because it reacts faster than the 200-day, catching real trend strength earlier without being as noisy as the shorter averages.",
    "he": "למה דווקא 20 ו-150? הממוצע ל-20 יום מכסה בערך חודש של מסחר — קצר מספיק כדי לעקוב אחרי התנודה הנוכחית, ולכן סוחרים לטווח קצר מחפשים ירידות לכיוונו במקום שבירה מתחתיו. הממוצע ל-150 יום פחות מדובר בפומבי, אבל הוא אבן יסוד במערכות סינון מגמה מקצועיות — ה\"תבנית המגמה\" (Trend Template) המפורסמת של מארק מינרוויני דורשת שהמחיר יחזיק מעל ממוצע 150 עולה לפני שמניה בכלל נחשבת מועמדת למגמת עלייה ארוכת טווח — בדיוק כי הוא מגיב מהר יותר מהממוצע ל-200, ותופס עוצמת מגמה אמיתית מוקדם יותר בלי להיות רועש כמו הממוצעים הקצרים יותר."
  },
  "dd4": {
    "en": "One candle is a hint, not proof. A hammer or an engulfing pattern describes what happened during one or two sessions — it isn't a guarantee about tomorrow. Most experienced traders treat a single candlestick pattern as something to watch for confirmation on the next candle or two, not something to act on by itself.",
    "he": "נר אחד הוא רמז, לא הוכחה. פטיש או בליעה מתארים מה שקרה במהלך מפגש אחד או שניים — זו לא ערובה לגבי מחר. רוב הסוחרים המנוסים מתייחסים לתבנית נר בודדת כמשהו לחכות לאישור עליו בנר הבא או השניים הבאים, לא כמשהו לפעול לפיו בפני עצמו."
  },
  "dd5": {
    "en": "Why do these specific percentages matter? Honestly, not because of anything mystical about the numbers. So many traders, algorithms, and institutions plot the exact same retracement lines that they end up placing similar buy and sell orders near the same prices — creating real supply and demand right where everyone is already looking. It's partly a self-fulfilling prophecy. One curiosity: 50% isn't actually a Fibonacci ratio at all — it was added because markets often retrace around half of a move, an older observation from Dow Theory that stuck around.",
    "he": "למה דווקא האחוזים האלה חשובים? בכנות, לא בגלל שום דבר מיסטי במספרים עצמם. כל כך הרבה סוחרים, אלגוריתמים ומוסדות מציירים בדיוק את אותם קווי תיקון שהם בסוף מציבים פקודות קנייה ומכירה דומות בקרבת אותם מחירים — מה שיוצר היצע וביקוש אמיתיים בדיוק במקום שכולם כבר מסתכלים עליו. זו במידה מסוימת נבואה שמגשימה את עצמה. עובדה מעניינת: 50% הוא בכלל לא יחס פיבונאצ׳י אמיתי — הוא נוסף כי שווקים לרוב מתקנים בערך חצי מתנועה, תצפית ישנה יותר מתורת דאו שנשארה."
  },
  "dd6": {
    "en": "Two more things worth knowing: first, 50 acts as an informal dividing line — RSI consistently above 50 tends to describe an uptrend, consistently below 50 a downtrend. Second, RSI is a lagging measure, calculated from price that already happened, so by the time it flags something, part of the move is usually already behind it. Some traders shift the classic 70/30 thresholds to 80/20 during strong trends, precisely because 70/30 triggers too early and too often in a one-directional market.",
    "he": "עוד שני דברים ששווה לדעת: ראשית, 50 משמש כקו מפריד לא רשמי — RSI שנמצא באופן עקבי מעל 50 נוטה לתאר מגמת עלייה, ומתחת ל-50 מגמת ירידה. שנית, RSI הוא מדד מפגר, מחושב ממחיר שכבר קרה, כך שעד שהוא מציג איתות, חלק מהתנועה כבר בדרך כלל מאחוריו. חלק מהסוחרים מזיזים את הרמות הקלאסיות 70/30 ל-80/20 בזמן מגמות חזקות, בדיוק כי 70/30 מפעיל איתות מוקדם מדי ותכוף מדי בשוק חד-כיווני."
  },
  "dd7": {
    "en": "How traders estimate a price target — a common (rough) technique is the \"measured move\": take the height of the pattern itself, for example the distance from the head down to the neckline in a head & shoulders, and project that same distance from the breakout point in the direction of the breakout. It's a starting estimate, not a promise — real moves regularly fall short of it or run well past it.",
    "he": "איך סוחרים מעריכים יעד מחיר — טכניקה נפוצה (וגסה) היא \"התנועה הנמדדת\": לוקחים את הגובה של התבנית עצמה, למשל המרחק מהראש למטה עד קו הצוואר בראש וכתפיים, ומקרינים את אותו מרחק מנקודת הפריצה בכיוון הפריצה. זו הערכת פתיחה, לא הבטחה — תנועות אמיתיות לעיתים קרובות נופלות מתחת ליעד או חורגות ממנו בהרבה."
  },
  "ddLabel": {
    "en": "WORTH KNOWING",
    "he": "כדאי לדעת"
  },
  "divHigherHigh": {
    "en": "Higher High",
    "he": "שיא גבוה יותר"
  },
  "divLowerHigh": {
    "en": "Lower High",
    "he": "שיא נמוך יותר"
  },
  "dojiB": {
    "en": "Open and close are almost identical, so the body nearly disappears. On its own it just means indecision; appearing after a strong move up, it can flag that the move is running out of buyers.",
    "he": "פתיחה וסגירה כמעט זהות, כך שהגוף כמעט נעלם. בפני עצמו זה רק מסמן חוסר החלטיות; כאשר הוא מופיע לאחר עלייה חזקה, הוא יכול לרמז שהתנועה נגמרת מקונים."
  },
  "dojiH": {
    "en": "Doji",
    "he": "דוג׳י (Doji)"
  },
  "downtrendLabel": {
    "en": "Downtrend",
    "he": "מגמת ירידה"
  },
  "dtB": {
    "en": "The mirror image of a double bottom — two attempts to push to a similar high, followed by a break below the trough between them. Two failed pushes higher is read as buyers running out of conviction.",
    "he": "התמונה ההפוכה של תחתית כפולה — שני ניסיונות להגיע לשיא דומה, ואז פריצה מתחת לשפל שביניהם. שני ניסיונות כושלים לעלות גבוה יותר נקראים כאובדן דחף מצד הקונים."
  },
  "dtH": {
    "en": "Double Top",
    "he": "שיא כפול (Double Top)"
  },
  "flagB": {
    "en": "A sharp rally (the \"pole\") followed by a tight, slightly downward-drifting pause (the \"flag\") as the market catches its breath — then a breakout that resumes the original trend.",
    "he": "עלייה חדה (\"המוט\") ואחריה הפוגה צרה, נוטה מעט כלפי מטה (\"הדגל\"), כאשר השוק לוקח נשימה — ואז פריצה שמחדשת את המגמה המקורית."
  },
  "flagChannelLabel": {
    "en": "Flag",
    "he": "הדגל"
  },
  "flagH": {
    "en": "Bull Flag",
    "he": "דגל שורי (Bull Flag)"
  },
  "footerNote": {
    "en": "Historical examples are for educational illustration only and do not imply future performance. This is not investment advice.",
    "he": "הדוגמאות ההיסטוריות מיועדות להמחשה חינוכית בלבד ואינן מרמזות על ביצועים עתידיים. אין לראות בכך ייעוץ השקעות."
  },
  "hammerB": {
    "en": "Small body near the top of the range, a long lower wick, appearing after a downtrend. It shows sellers pushed price down during the session, but buyers dragged it back up before the close — often a sign the selling is losing strength.",
    "he": "גוף קטן בקרבת חלק המחיר העליון, פתיל תחתון ארוך, המופיע לאחר מגמת ירידה. הוא מראה שהמוכרים דחפו את המחיר למטה במהלך המפגש, אך הקונים החזירו אותו למעלה לפני הסגירה — לעיתים קרובות סימן שהלחץ המוכר נחלש."
  },
  "hammerH": {
    "en": "Hammer",
    "he": "פטיש (Hammer)"
  },
  "headLabel": {
    "en": "Head",
    "he": "ראש"
  },
  "glossaryEmpty": {
    "en": "No term matches that. Try a shorter word, or browse the list.",
    "he": "אין מונח שמתאים לזה. נסו מילה קצרה יותר, או עיינו ברשימה."
  },
  "glossaryIntro": {
    "en": "Every term the lessons use, defined in one line. Search by the word or by the idea behind it.",
    "he": "כל מונח שהשיעורים משתמשים בו, מוגדר בשורה אחת. אפשר לחפש לפי המילה או לפי הרעיון שמאחוריה."
  },
  "glossarySearch": {
    "en": "Search a term or an idea...",
    "he": "חפשו מונח או רעיון..."
  },
  "glossaryTitle": {
    "en": "Glossary",
    "he": "מילון מונחים"
  },
  "navGlossary": {
    "en": "Glossary",
    "he": "מילון"
  },
  "freshWelcome": {
    "en": "New here? Perfect — Lesson 1 assumes nothing, start there.",
    "he": "חדשים בעולם הזה? מצוין — שיעור 1 לא מניח שום ידע מוקדם, שווה להתחיל משם."
  },
  "heroBody": {
    "en": "Every concept here is shown on real price behavior first, explained second. Try to spot the pattern yourself before we reveal it.",
    "he": "כל רעיון כאן מוצג קודם על התנהגות מחיר אמיתית, ומוסבר אחר כך. נסו לזהות את התבנית בעצמכם לפני שנחשוף את התשובה."
  },
  "heroTitle": {
    "en": "Learn to read the chart, not just the theory",
    "he": "ללמוד לקרוא את הגרף, לא רק את התיאוריה"
  },
  "hideBtn": {
    "en": "Hide annotations",
    "he": "הסתר הערות"
  },
  "hsB": {
    "en": "Three peaks — a shoulder, a taller head, then a second shoulder close in height to the first. A break below the \"neckline\" connecting the two troughs is the classic trigger traders watch for.",
    "he": "שלושה שיאים — כתף, ראש גבוה יותר, ואז כתף שנייה בגובה דומה לראשונה. פריצה מתחת ל\"קו הצוואר\" המחבר בין שני השפלים היא האיתות הקלאסי שסוחרים מחפשים."
  },
  "hsH": {
    "en": "Head & Shoulders",
    "he": "ראש וכתפיים (Head & Shoulders)"
  },
  "illustrationTag": {
    "en": "Simplified illustration",
    "he": "המחשה פשוטה"
  },
  "l0intro": {
    "en": "Every lesson after this one assumes you already know what a stock is, what actually moves its price, and why we're even looking at charts in the first place. This page covers that groundwork in plain language, once, so the rest of the site can focus on charts.",
    "he": "כל שיעור אחרי הדף הזה מניח שאתם כבר יודעים מה זו מניה, מה באמת מזיז את המחיר שלה, ולמה בכלל מסתכלים על גרפים מלכתחילה. הדף הזה מכסה את הבסיס הזה בשפה פשוטה, פעם אחת, כדי שכל שאר האתר יוכל להתמקד בגרפים."
  },
  "l0meta": {
    "en": "General concepts — the foundation everything else builds on",
    "he": "מושגים כלליים — הבסיס שעליו נשען כל השאר"
  },
  "l0tag": {
    "en": "START HERE — MARKET BASICS",
    "he": "התחילו כאן — יסודות השוק"
  },
  "l0title": {
    "en": "Before the charts: how markets actually work",
    "he": "לפני הגרפים: איך השוק באמת עובד"
  },
  "l1guessGood": {
    "en": "Close — that lines up with where price actually bounced.",
    "he": "קרוב — זה מתיישב עם המקום שבו המחיר באמת קפץ."
  },
  "l1guessOff": {
    "en": "Not quite in that area. Click 'Reveal annotations' to see where it held.",
    "he": "לא בדיוק באזור הזה. לחצו על 'חשוף הערות' כדי לראות איפה זה החזיק."
  },
  "l1intro": {
    "en": "Support is a price area where buying pressure has repeatedly overwhelmed selling pressure in the past — not a hard floor, just a zone worth watching. Look at the chart below before reading the panel on the right.",
    "he": "תמיכה היא אזור מחיר שבו לחץ קנייה גבר שוב ושוב על לחץ מכירה בעבר — לא רצפה קשיחה, אלא אזור ששווה לעקוב אחריו. הסתכלו על הגרף למטה לפני קריאת הפאנל מימין."
  },
  "l1meta": {
    "en": "Historical pattern — AAPL, Jan–Jun 2024 (daily)",
    "he": "תבנית היסטורית — AAPL, ינואר–יוני 2024 (יומי)"
  },
  "l1prompt": {
    "en": "Click on the chart where you think the support zone is.",
    "he": "לחצו על הגרף במקום שבו לדעתכם נמצא אזור התמיכה."
  },
  "l1tag": {
    "en": "LESSON 01 — SUPPORT & RESISTANCE",
    "he": "שיעור 01 — תמיכה והתנגדות"
  },
  "l1title": {
    "en": "Where does price keep bouncing?",
    "he": "איפה המחיר ממשיך להיתקל?"
  },
  "l2intro": {
    "en": "A breakout is price closing decisively above a resistance zone. A retest is when price returns to that same zone afterward — often turning former resistance into new support — before continuing. Watch how volume behaves at the breakout candle.",
    "he": "פריצה היא כאשר המחיר נסגר בבירור מעל אזור התנגדות. ריטסט (בדיקה חוזרת) הוא כאשר המחיר חוזר לאותו אזור לאחר מכן — ולעיתים קרובות הופך התנגדות ישנה לתמיכה חדשה — לפני שהוא ממשיך. שימו לב איך הנפח מתנהג בנר הפריצה."
  },
  "l2meta": {
    "en": "Historical pattern — NVDA, 2023 (daily)",
    "he": "תבנית היסטורית — NVDA, 2023 (יומי)"
  },
  "l2tag": {
    "en": "LESSON 02 — BREAKOUT & RETEST",
    "he": "שיעור 02 — פריצה ובדיקה חוזרת"
  },
  "l2title": {
    "en": "Resistance breaks. Then price comes back to check it.",
    "he": "ההתנגדות נפרצת. ואז המחיר חוזר לבדוק אותה."
  },
  "l3intro": {
    "en": "A moving average is the average closing price over a fixed number of past sessions, recalculated every day. Shorter averages react faster; longer averages describe the broader trend. Toggle them on and off to see what each one is actually showing.",
    "he": "ממוצע נע הוא מחיר הסגירה הממוצע לאורך מספר קבוע של מפגשים קודמים, המחושב מחדש בכל יום. ממוצעים קצרים מגיבים מהר יותר; ממוצעים ארוכים מתארים את המגמה הרחבה יותר. הפעילו וכבו אותם כדי לראות מה כל אחד מהם באמת מראה."
  },
  "l3meta": {
    "en": "Historical pattern — MSFT, 2023 (daily)",
    "he": "תבנית היסטורית — MSFT, 2023 (יומי)"
  },
  "l3tag": {
    "en": "LESSON 03 — MOVING AVERAGES",
    "he": "שיעור 03 — ממוצעים נעים"
  },
  "l3title": {
    "en": "Smoothing out the noise to see the trend",
    "he": "החלקת הרעש כדי לראות את המגמה"
  },
  "l4intro": {
    "en": "A candlestick pattern is only meaningful in context — where it sits after a trend, and what happens to price right after. The dotted box marks the candle to focus on in each chart below.",
    "he": "תבנית נרות משמעותית רק בהקשר — היכן היא נמצאת ביחס למגמה, ומה קורה למחיר מיד אחריה. התיבה המנוקדת מסמנת את הנר שעליו להתמקד בכל גרף למטה."
  },
  "l4meta": {
    "en": "Simplified illustrations — built to isolate each shape clearly",
    "he": "המחשות פשוטות — נבנו כדי לבודד כל צורה בבירור"
  },
  "l4tag": {
    "en": "LESSON 04 — CANDLESTICK PATTERNS",
    "he": "שיעור 04 — תבניות נרות"
  },
  "l4title": {
    "en": "What a single candle is telling you",
    "he": "מה נר בודד מספר לך"
  },
  "l5intro": {
    "en": "After a strong move, price often pulls back before continuing. Fibonacci retracement marks the pullback as a percentage of that move — 23.6%, 38.2%, 50%, 61.8%, 78.6% — so traders have reference levels to watch. These levels don't predict anything by themselves; they just mark where many participants happen to be watching.",
    "he": "אחרי תנועה חזקה, המחיר לרוב מתקן לפני שהוא ממשיך. תיקון פיבונאצ׳י מסמן את התיקון כאחוז מאותה תנועה — 23.6%, 38.2%, 50%, 61.8%, 78.6% — כך שלסוחרים יש רמות ייחוס לעקוב אחריהן. הרמות האלה לא מנבאות שום דבר בעצמן; הן רק מסמנות איפה הרבה משתתפים בשוק צופים."
  },
  "l5meta": {
    "en": "Historical pattern — TSLA, 2023 (daily)",
    "he": "תבנית היסטורית — TSLA, 2023 (יומי)"
  },
  "l5tag": {
    "en": "LESSON 05 — FIBONACCI RETRACEMENT",
    "he": "שיעור 05 — רמות פיבונאצ׳י (Fibonacci Retracement)"
  },
  "l5title": {
    "en": "How far back does a pullback usually go?",
    "he": "עד כמה בדרך כלל חוזר תיקון מחיר?"
  },
  "l6intro": {
    "en": "RSI moves between 0 and 100 based on the size of recent gains versus recent losses. Above 70 is generally called \"overbought,\" below 30 \"oversold\" — but neither is an automatic trade signal, as the first example below shows clearly.",
    "he": "RSI נע בין 0 ל-100 בהתאם לגודל הרווחים לעומת ההפסדים האחרונים. מעל 70 נקרא בדרך כלל \"קניית יתר\", מתחת ל-30 \"מכירת יתר\" — אך אף אחד מהם אינו איתות מסחר אוטומטי, כפי שהדוגמה הראשונה למטה מראה בבירור."
  },
  "l6meta": {
    "en": "Historical patterns, 2023 (daily)",
    "he": "תבניות היסטוריות, 2023 (יומי)"
  },
  "l6tag": {
    "en": "LESSON 06 — RSI (RELATIVE STRENGTH INDEX)",
    "he": "שיעור 06 — RSI (מדד העוצמה היחסית)"
  },
  "l6title": {
    "en": "Measuring momentum, not just price",
    "he": "מדידת מומנטום, לא רק מחיר"
  },
  "l7intro": {
    "en": "These are recurring shapes in price action, each with a typical (not guaranteed) outcome once it completes. The dashed lines mark the structure that defines each pattern.",
    "he": "אלו צורות חוזרות בתנועת המחיר, לכל אחת תוצאה טיפוסית (לא מובטחת) לאחר שהיא מושלמת. הקווים המקווקווים מסמנים את המבנה שמגדיר כל תבנית."
  },
  "l7meta": {
    "en": "Simplified illustrations — built to isolate each shape clearly",
    "he": "המחשות פשוטות — נבנו כדי לבודד כל צורה בבירור"
  },
  "l7tag": {
    "en": "LESSON 07 — CHART PATTERNS",
    "he": "שיעור 07 — תבניות גרף"
  },
  "l7title": {
    "en": "Shapes that tend to repeat",
    "he": "צורות שנוטות לחזור על עצמן"
  },
  "labelBearE": {
    "en": "Engulfing",
    "he": "בליעה"
  },
  "labelBullE": {
    "en": "Engulfing",
    "he": "בליעה"
  },
  "labelDoji": {
    "en": "Doji",
    "he": "דוג׳י"
  },
  "labelHammer": {
    "en": "Hammer",
    "he": "פטיש"
  },
  "labelStar": {
    "en": "Shooting Star",
    "he": "כוכב נופל"
  },
  "lblHH": {
    "en": "Higher High",
    "he": "שיא גבוה יותר"
  },
  "lblHL": {
    "en": "Higher Low",
    "he": "שפל גבוה יותר"
  },
  "lblLH": {
    "en": "Lower High",
    "he": "שיא נמוך יותר"
  },
  "lblLL": {
    "en": "Lower Low",
    "he": "שפל נמוך יותר"
  },
  "legendBreakB": {
    "en": "Price closes above the ~$140 zone on a volume spike — a sign that more participants than usual agreed the level should give way.",
    "he": "המחיר נסגר מעל אזור ה-140$ עם קפיצת נפח — סימן שיותר משתתפים מהרגיל הסכימו שהרמה צריכה להישבר."
  },
  "legendBreakH": {
    "en": "Breakout",
    "he": "פריצה"
  },
  "legendEma20B": {
    "en": "Covers roughly a month of trading. It's fast enough to hug recent price closely, which is why swing traders often watch for a pullback toward the 20 — and a bounce off it — as a rough entry area within an uptrend, rather than a break below it. That same speed means it also whips back and forth more in choppy, directionless stretches.",
    "he": "מכסה בערך חודש של מסחר. הוא מהיר מספיק כדי להיצמד למחיר האחרון, ולכן סוחרי סווינג לרוב מחפשים ירידה לכיוון ה-20 — וקפיצה ממנו — כאזור כניסה גס בתוך מגמת עלייה, במקום שבירה מתחתיו. אותה מהירות גם גורמת לו להתנדנד יותר קדימה ואחורה בתקופות תנודתיות וחסרות כיוון."
  },
  "legendEma20H": {
    "en": "20 EMA — the short-term pulse",
    "he": "ממוצע נע 20 — הדופק לטווח הקצר"
  },
  "legendFibB": {
    "en": "Price retraced down through the shallower levels and found buyers close to the 61.8% line, then resumed the original uptrend. That's a common outcome — not a rule the market has to obey.",
    "he": "המחיר תיקן כלפי מטה דרך הרמות הרדודות יותר ומצא קונים בקרבת קו ה-61.8%, ואז חידש את מגמת העלייה המקורית. זו תוצאה נפוצה — לא כלל שהשוק חייב לציית לו."
  },
  "legendFibH": {
    "en": "This pullback stalled near 61.8%",
    "he": "התיקון הזה נעצר בקרבת 61.8%"
  },
  "legendFibWhyB": {
    "en": "Fibonacci didn't cause the bounce, and it doesn't forecast the next one. It's a way to describe where a reaction happened after the fact, and a level worth watching next time.",
    "he": "פיבונאצ׳י לא גרם לקפיצה, והוא גם לא מנבא את הבאה. זו דרך לתאר איפה קרתה תגובה בדיעבד, ורמה ששווה לעקוב אחריה בפעם הבאה."
  },
  "legendFibWhyH": {
    "en": "Don't read this backwards",
    "he": "אל תקראו את זה הפוך"
  },
  "legendResistB": {
    "en": "Sellers stepped in here in March and again in June — the same price area rejecting price twice is what defines it as resistance.",
    "he": "מוכרים נכנסו כאן במרץ ושוב ביוני — אותו אזור מחיר שדוחה מחיר פעמיים הוא מה שהופך אותו להתנגדות."
  },
  "legendResistH": {
    "en": "Resistance zone (~$194)",
    "he": "אזור התנגדות (כ-194$)"
  },
  "legendRetestB": {
    "en": "A few sessions later, price dips back to the ~$140 area, finds buyers, and resumes the move — the old ceiling now acting as a floor.",
    "he": "כמה מפגשים לאחר מכן, המחיר יורד חזרה לאזור ה-140$, מוצא קונים, וממשיך את התנועה — התקרה הישנה משמשת כעת כרצפה."
  },
  "legendRetestH": {
    "en": "Retest",
    "he": "בדיקה חוזרת (ריטסט)"
  },
  "legendSma150B": {
    "en": "Less talked about on retail charts, but it's a cornerstone of professional trend-screening systems — Mark Minervini's well-known \"Trend Template\" requires price to hold above a rising 150-day average before a stock even qualifies as a healthy long-term uptrend. Sitting between the 50 and the 200, it tends to confirm real staying power in a trend earlier than the slower 200 does.",
    "he": "פחות מדובר עליו בגרפים פרטיים, אבל הוא אבן יסוד במערכות סינון מגמה מקצועיות — ה\"תבנית המגמה\" (Trend Template) המפורסמת של מארק מינרוויני דורשת שהמחיר יחזיק מעל ממוצע 150 עולה לפני שמניה בכלל נחשבת מועמדת בריאה למגמת עלייה ארוכת טווח. בהיותו יושב בין ה-50 ל-200, הוא נוטה לאשר אחיזה אמיתית במגמה מוקדם יותר מהממוצע האיטי יותר של 200."
  },
  "legendSma150H": {
    "en": "150 SMA — the line institutions watch",
    "he": "ממוצע נע 150 — הקו שהמוסדות עוקבים אחריו"
  },
  "legendSma50B": {
    "en": "Smoother than the 20. It confirms whether the medium-term trend actually agrees with the short-term one — trend-following traders generally want to see price holding above a rising 50 before trusting a rally.",
    "he": "חלק יותר מה-20. הוא מאשר האם המגמה הבינונית באמת מסכימה עם הקצרה — סוחרי מגמה בדרך כלל רוצים לראות את המחיר מחזיק מעל ממוצע 50 עולה לפני שהם סומכים על עלייה."
  },
  "legendSma50H": {
    "en": "50 SMA — the medium trend",
    "he": "ממוצע נע 50 — המגמה הבינונית"
  },
  "legendSupportB": {
    "en": "Price reacted from this area three separate times in April and May, each time finding buyers before a new leg up.",
    "he": "המחיר הגיב מהאזור הזה שלוש פעמים נפרדות באפריל ובמאי, ובכל פעם מצא קונים לפני עלייה חדשה."
  },
  "legendSupportH": {
    "en": "Support zone (~$165)",
    "he": "אזור תמיכה (כ-165$)"
  },
  "legendSwingB": {
    "en": "The move being measured. Every retracement level below is calculated as a percentage of this exact range.",
    "he": "התנועה הנמדדת. כל רמת תיקון למטה מחושבת כאחוז מהטווח המדויק הזה."
  },
  "legendSwingH": {
    "en": "Swing low → swing high",
    "he": "שפל תנועה ← שיא תנועה"
  },
  "legendWhyB": {
    "en": "Support held three times here, but nothing forces it to hold a fourth. It's a probability zone built from history, not a rule.",
    "he": "התמיכה החזיקה כאן שלוש פעמים, אבל שום דבר לא מחייב אותה להחזיק בפעם הרביעית. זהו אזור הסתברותי שנבנה מהיסטוריה, לא חוק."
  },
  "legendWhyH": {
    "en": "Why it's not a guarantee",
    "he": "למה זו לא ערובה"
  },
  "methodTitle": {
    "en": "How this course works",
    "he": "איך הקורס עובד"
  },
  "nav0": {
    "en": "Basics",
    "he": "יסודות"
  },
  "nav1": {
    "en": "Support / Resistance",
    "he": "תמיכה / התנגדות"
  },
  "nav2": {
    "en": "Breakout & Retest",
    "he": "פריצה וריטסט"
  },
  "nav3": {
    "en": "Moving Averages",
    "he": "ממוצעים נעים"
  },
  "nav4": {
    "en": "Candlesticks",
    "he": "נרות יפניים"
  },
  "nav5": {
    "en": "Fibonacci",
    "he": "פיבונאצ׳י"
  },
  "nav6": {
    "en": "RSI",
    "he": "RSI"
  },
  "nav7": {
    "en": "Chart Patterns",
    "he": "תבניות גרף"
  },
  "navAi": {
    "en": "AI Tutor",
    "he": "מורה AI"
  },
  "navCalculators": {
    "en": "Calculators",
    "he": "מחשבונים"
  },
  "navCompare": {
    "en": "Compare",
    "he": "השוואה"
  },
  "navHome": {
    "en": "Overview",
    "he": "סקירה"
  },
  "navMenuLabel": {
    "en": "Tools",
    "he": "כלים"
  },
  "navQuiz": {
    "en": "Quiz",
    "he": "בוחן"
  },
  "navStock": {
    "en": "Stock Search",
    "he": "חיפוש מניה"
  },
  "necklineLabel": {
    "en": "Neckline",
    "he": "קו הצוואר"
  },
  "pathStep1": {
    "en": "See it on a real chart",
    "he": "לראות על גרף אמיתי"
  },
  "pathStep2": {
    "en": "Try to identify it",
    "he": "לנסות לזהות"
  },
  "pathStep3": {
    "en": "Reveal the answer",
    "he": "לחשוף את התשובה"
  },
  "pathStep4": {
    "en": "Understand why",
    "he": "להבין למה"
  },
  "pointBreakout": {
    "en": "Breakout",
    "he": "פריצה"
  },
  "pointRetest": {
    "en": "Retest",
    "he": "ריטסט"
  },
  "poleLabel": {
    "en": "Pole",
    "he": "המוט"
  },
  "quiz2A": {
    "en": "Hammer",
    "he": "פטיש"
  },
  "quiz2B": {
    "en": "Doji",
    "he": "דוג׳י"
  },
  "quiz2C": {
    "en": "Bullish engulfing",
    "he": "בליעה שורית"
  },
  "quiz2D": {
    "en": "Bearish engulfing",
    "he": "בליעה דובית"
  },
  "quiz2E": {
    "en": "Shooting Star",
    "he": "כוכב נופל"
  },
  "quiz2Explain": {
    "en": "Correct answer: Hammer. The long lower wick after a decline shows buyers rejected the lower prices within that same session.",
    "he": "תשובה נכונה: פטיש. הפתיל התחתון הארוך לאחר ירידה מראה שהקונים דחו את המחירים הנמוכים יותר במהלך אותו מפגש עצמו."
  },
  "quiz2Q": {
    "en": "Which pattern has a small body near the top of its range and a long lower wick, after a downtrend?",
    "he": "לאיזו תבנית יש גוף קטן בקרבת חלק המחיר העליון ופתיל תחתון ארוך, לאחר מגמת ירידה?"
  },
  "quiz3A": {
    "en": "Nothing — RSI and price always move together",
    "he": "שום דבר — RSI ומחיר תמיד זזים יחד"
  },
  "quiz3B": {
    "en": "Momentum behind the move may be fading, even though price is still rising",
    "he": "המומנטום מאחורי התנועה עשוי להיחלש, גם אם המחיר עדיין עולה"
  },
  "quiz3C": {
    "en": "It guarantees an immediate reversal",
    "he": "זה מבטיח היפוך מיידי"
  },
  "quiz3Explain": {
    "en": "Correct answer: B. Divergence is a warning sign that momentum is weakening, not a precise timing signal — price can keep rising for a while before it matters.",
    "he": "תשובה נכונה: B. דיברגנץ הוא סימן אזהרה לכך שהמומנטום נחלש, לא איתות תזמון מדויק — המחיר יכול להמשיך לעלות זמן מה לפני שזה משנה."
  },
  "quiz3Q": {
    "en": "In the divergence chart above, price made a higher high. What does a lower high on RSI at the same time typically suggest?",
    "he": "בגרף הדיברגנץ למעלה, המחיר יצר שיא גבוה יותר. מה בדרך כלל מרמז שיא נמוך יותר ב-RSI באותו זמן?"
  },
  "quizA": {
    "en": "It always falls immediately",
    "he": "הוא תמיד נופל מיד"
  },
  "quizB": {
    "en": "It may react, but can eventually break through",
    "he": "הוא עשוי להגיב, אך יכול בסופו של דבר לפרוץ דרך"
  },
  "quizC": {
    "en": "Nothing happens, ever",
    "he": "שום דבר לא קורה, אף פעם"
  },
  "quizExplain": {
    "en": "Correct answer: B. Resistance marks an area of potential selling pressure, not an impenetrable ceiling — as this exact chart shows.",
    "he": "תשובה נכונה: B. התנגדות מסמנת אזור של לחץ מכירה פוטנציאלי, לא תקרה בלתי חדירה — כפי שהגרף הזה עצמו מראה."
  },
  "quizQ": {
    "en": "What typically happens right when price first reaches a resistance zone?",
    "he": "מה בדרך כלל קורה ברגע שהמחיר מגיע לראשונה לאזור התנגדות?"
  },
  "railCourseKicker": {
    "en": "COURSE",
    "he": "מסלול"
  },
  "railCourseName": {
    "en": "Reading the Market",
    "he": "לקרוא את השוק"
  },
  "revealBtn": {
    "en": "Reveal annotations",
    "he": "חשוף הערות"
  },
  "risingLowsLabel": {
    "en": "Rising lows",
    "he": "שפלים עולים"
  },
  "riskBody": {
    "en": "Every lesson on this site describes what price has tended to do — never what it will do. The single habit that protects traders more than any pattern or indicator is risking only a small, fixed slice of their capital on any one idea — many professionals cap it around 1% of their account per trade — because the math of losses is brutal: a 20% loss needs a 25% gain just to break even, and a 50% loss needs a 100% gain. A position size and a stop-loss decided before you enter are what let you be wrong repeatedly and still stay in the game long enough to be right.",
    "he": "כל שיעור באתר הזה מתאר מה שהמחיר נטה לעשות — לעולם לא מה שהוא יעשה. ההרגל היחיד שמגן על סוחרים יותר מכל תבנית או אינדיקטור הוא לסכן רק פרוסה קטנה וקבועה מההון בכל רעיון בודד — הרבה אנשי מקצוע מגבילים את זה לסביבות 1% מהחשבון לעסקה — כי המתמטיקה של הפסדים אכזרית: הפסד של 20% דורש רווח של 25% רק כדי לחזור לאיזון, והפסד של 50% דורש רווח של 100%. גודל פוזיציה וסטופ-לוס שמוחלטים לפני הכניסה הם מה שמאפשר לכם לטעות שוב ושוב ועדיין להישאר במשחק מספיק זמן כדי לצדוק."
  },
  "riskLabel": {
    "en": "BEFORE YOU GO FURTHER",
    "he": "לפני שממשיכים הלאה"
  },
  "rsiDivNote": {
    "en": "Price pushed to a higher high on the right — but RSI made a lower high at the same time. Momentum was quietly weakening even as price still looked strong. Price rolled over shortly after.",
    "he": "המחיר עלה לשיא גבוה יותר מימין — אך ה-RSI יצר שיא נמוך יותר באותו זמן. המומנטום נחלש בשקט גם כשהמחיר עדיין נראה חזק. המחיר התהפך זמן קצר אחר כך."
  },
  "rsiDivTitle": {
    "en": "Bearish divergence",
    "he": "דיברגנץ שלילי (דובי)"
  },
  "rsiOBNote": {
    "en": "RSI pushed above 70 early in this rally and stayed there for months while price nearly doubled. Selling the moment RSI crossed 70 here would have meant missing most of the move.",
    "he": "ה-RSI עלה מעל 70 מוקדם בעלייה הזו ונשאר שם במשך חודשים בזמן שהמחיר כמעט הכפיל את עצמו. מכירה ברגע שה-RSI חצה 70 כאן הייתה גורמת להחמיץ את רוב התנועה."
  },
  "rsiOBTitle": {
    "en": "Overbought ≠ automatic sell",
    "he": "קניית יתר ≠ מכירה אוטומטית"
  },
  "rsiOSNote": {
    "en": "A sustained decline pushed RSI down near single digits. Shortly after, buyers stepped back in and price turned higher — the kind of setup \"oversold\" is meant to describe.",
    "he": "ירידה ממושכת דחפה את ה-RSI לספרה בודדת. זמן קצר אחר כך קונים חזרו לשוק והמחיר פנה כלפי מעלה — בדיוק סוג התרחיש שהמושג \"מכירת יתר\" נועד לתאר."
  },
  "rsiOSTitle": {
    "en": "Oversold bounce",
    "he": "התאוששות ממכירת יתר"
  },
  "shoulderLabel": {
    "en": "Shoulder",
    "he": "כתף"
  },
  "starB": {
    "en": "The mirror image of a hammer: small body near the bottom of the range, a long upper wick, appearing after an uptrend. Buyers pushed price up during the session, but sellers dragged it back down before the close — often a sign the buying is losing strength.",
    "he": "התמונה ההפוכה של פטיש: גוף קטן בקרבת חלק המחיר התחתון, פתיל עליון ארוך, המופיע לאחר מגמת עלייה. הקונים דחפו את המחיר למעלה במהלך המפגש, אך המוכרים החזירו אותו למטה לפני הסגירה — לעיתים קרובות סימן שהלחץ הקונה נחלש."
  },
  "starH": {
    "en": "Shooting Star",
    "he": "כוכב נופל (Shooting Star)"
  },
  "swingHighLabel": {
    "en": "Swing High",
    "he": "שיא תנועה"
  },
  "swingLowLabel": {
    "en": "Swing Low",
    "he": "שפל תנועה"
  },
  "toggleAnnotations": {
    "en": "Show annotations",
    "he": "הצג הערות"
  },
  "toggleEma20": {
    "en": "20 EMA",
    "he": "ממוצע נע 20 (EMA)"
  },
  "toggleSma150": {
    "en": "150 SMA",
    "he": "ממוצע נע 150 (SMA)"
  },
  "toggleSma50": {
    "en": "50 SMA",
    "he": "ממוצע נע 50 (SMA)"
  },
  "toggleVolume": {
    "en": "Volume",
    "he": "נפח מסחר"
  },
  "trendB": {
    "en": "An uptrend is a series of higher highs and higher lows — each rally goes a bit further than the last, and each pullback stops a bit higher than the one before. A downtrend is the mirror image: lower highs and lower lows. Almost everything else on this site — support, resistance, breakouts, moving averages — is really just a more detailed way of describing this one idea.",
    "he": "מגמת עלייה היא סדרה של שיאים גבוהים יותר ושפלים גבוהים יותר — כל עלייה מגיעה קצת יותר רחוק מהקודמת, וכל ירידה נעצרת קצת יותר גבוה מהקודמת. מגמת ירידה היא התמונה ההפוכה: שיאים נמוכים יותר ושפלים נמוכים יותר. כמעט כל מה שבשאר האתר — תמיכה, התנגדות, פריצות, ממוצעים נעים — הוא בעצם רק דרך מפורטת יותר לתאר את הרעיון האחד הזה."
  },
  "trendH": {
    "en": "Trend: probably the single most useful concept in TA",
    "he": "מגמה: כנראה המושג השימושי ביותר בניתוח טכני"
  },
  "triB": {
    "en": "A flat resistance line gets tested repeatedly while the lows keep rising underneath it — buyers getting more eager while sellers hold the same line — until the range finally breaks, usually upward.",
    "he": "קו התנגדות שטוח נבדק שוב ושוב בזמן שהשפלים ממשיכים לעלות מתחתיו — הקונים נעשים להוטים יותר בעוד המוכרים מחזיקים באותו קו — עד שהטווח סוף סוף נפרץ, בדרך כלל כלפי מעלה."
  },
  "triH": {
    "en": "Ascending Triangle",
    "he": "משולש עולה (Ascending Triangle)"
  },
  "tryTitle": {
    "en": "Try it yourself",
    "he": "נסו בעצמכם"
  },
  "uptrendLabel": {
    "en": "Uptrend",
    "he": "מגמת עלייה"
  },
  "zoneResistLabel": {
    "en": "Resistance",
    "he": "התנגדות"
  },
  "zoneSupportLabel": {
    "en": "Support",
    "he": "תמיכה"
  },
  "railAria": {
    "en": "Course roadmap",
    "he": "מסלול הקורס"
  },
  "lessonsAria": {
    "en": "Lessons",
    "he": "שיעורים"
  },
  "brandHomeAria": {
    "en": "Chart Lab — back to the course overview",
    "he": "צ׳ארט לאב — חזרה לסקירת הקורס"
  },
  "courseKicker": {
    "en": "COURSE",
    "he": "מסלול"
  },
  "themeToggleLabel": {
    "en": "Toggle light/dark theme",
    "he": "מעבר בין מצב בהיר לכהה"
  },
  "courseName": {
    "en": "Reading the Market",
    "he": "לקרוא את השוק"
  },
  "navTracks": {
    "en": "Tracks",
    "he": "מסלולים"
  },
  "navPractice": {
    "en": "Practice",
    "he": "תרגול"
  },
  "navTools": {
    "en": "Tools",
    "he": "כלים"
  },
  "navMainAria": {
    "en": "Main navigation",
    "he": "ניווט ראשי"
  },
  "toolsNavAria": {
    "en": "Tools",
    "he": "כלים"
  },
  "langGroupAria": {
    "en": "Language",
    "he": "שפה"
  },
  "themeGroupAria": {
    "en": "Theme",
    "he": "ערכת צבעים"
  },
  "themeDark": {
    "en": "Dark mode",
    "he": "מצב כהה"
  },
  "themeLight": {
    "en": "Light mode",
    "he": "מצב בהיר"
  },
  "progressChipLessons": {
    "en": "lessons",
    "he": "שיעורים"
  },
  "progressChipAria": {
    "en": "Lessons completed",
    "he": "שיעורים שהושלמו"
  }
} as const;

export type TranslationKey = keyof typeof STRINGS;

/** Looks up a string. Falls back to the key itself so a miss is visible in
 *  the UI during development rather than rendering as an empty gap. */
export function translate(key: TranslationKey, lang: Lang): string {
  const entry = STRINGS[key] as Localized | undefined;
  return entry ? entry[lang] : (key as string);
}

export const LANGS: readonly Lang[] = ['he', 'en'];

/** Hebrew is right-to-left; English is not. The only direction rule. */
export function directionFor(lang: Lang): 'rtl' | 'ltr' {
  return lang === 'he' ? 'rtl' : 'ltr';
}
