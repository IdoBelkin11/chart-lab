// ---------------------------------------------------------------------------
// Glossary terms.
//
// A small, curated dictionary that powers inline definitions: wherever one
// of these words appears in lesson prose, a beginner can tap it and get a
// one-sentence reminder without leaving the page or losing their place.
//
// This is NEW reference content, not a rewording of the authored lesson
// prose in @core/lessons/prose.ts — that stays untouched. A definition here
// is deliberately shorter and more generic than a lesson's own explanation;
// it is a reminder for someone who met the term elsewhere, not a substitute
// for the lesson that actually teaches it.
//
// Hebrew surface forms are listed explicitly rather than derived, because
// Hebrew prefixes (ה/ב/ל/מ/ש/ו and combinations) attach to a word with no
// space — "support" appears in real prose as תמיכה, התמיכה, בתמיכה, לתמיכה,
// and more. English has no such problem, so its forms are matched with a
// real word boundary instead (see highlight.ts) and need no expansion here.
// ---------------------------------------------------------------------------
import type { Localized } from '@core/types/kb';

/** Which part of the subject a term belongs to. Drives grouping on the
 *  glossary page; has no effect on in-prose highlighting. */
export type GlossaryCategory = 'basics' | 'technical' | 'fundamentals' | 'risk' | 'macro';

export interface GlossaryTerm {
  id: string;
  cat: GlossaryCategory;
  /** Hebrew surface forms this term should match, common prefixes included. */
  he: string[];
  /** English forms, matched case-insensitively on a word boundary. */
  en: string[];
  def: Localized;
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    id: 'support',
    cat: 'technical',
    he: ['תמיכה', 'התמיכה', 'בתמיכה', 'לתמיכה', 'כתמיכה', 'ותמיכה', 'שהתמיכה'],
    en: ['support'],
    def: {
      en: 'A price area where buying pressure has repeatedly overwhelmed selling in the past — a zone worth watching, not a hard floor.',
      he: 'אזור מחיר שבו לחץ קנייה גבר שוב ושוב על מכירה בעבר — אזור ששווה לעקוב אחריו, לא רצפה קשיחה.'
    }
  },
  {
    id: 'resistance',
    cat: 'technical',
    he: ['התנגדות', 'ההתנגדות', 'בהתנגדות', 'להתנגדות', 'כהתנגדות', 'וההתנגדות'],
    en: ['resistance'],
    def: {
      en: 'A price area where selling pressure has repeatedly overwhelmed buying in the past — the mirror image of support.',
      he: 'אזור מחיר שבו לחץ מכירה גבר שוב ושוב על קנייה בעבר — התמונה ההפוכה של תמיכה.'
    }
  },
  {
    id: 'breakout',
    cat: 'technical',
    he: ['פריצה', 'הפריצה', 'בפריצה', 'לפריצה', 'הפריצה'],
    en: ['breakout'],
    def: {
      en: 'Price closing decisively beyond a support or resistance zone, rather than just poking through it briefly.',
      he: 'המחיר נסגר בבירור מעבר לאזור תמיכה או התנגדות, ולא רק מציץ מעבר אליו לרגע.'
    }
  },
  {
    id: 'retest',
    cat: 'technical',
    he: ['ריטסט', 'הריטסט', 'בדיקה חוזרת'],
    en: ['retest'],
    def: {
      en: 'Price returning to a level it just broke through, often turning old resistance into new support (or the reverse) before continuing.',
      he: 'המחיר חוזר לרמה שהוא בדיוק פרץ, ולעיתים קרובות הופך התנגדות ישנה לתמיכה חדשה (או להפך) לפני שהוא ממשיך.'
    }
  },
  {
    id: 'trend',
    cat: 'technical',
    he: ['מגמת עלייה', 'מגמת ירידה', 'מגמה', 'המגמה', 'במגמה', 'שהמגמה'],
    en: ['uptrend', 'downtrend', 'trend'],
    def: {
      en: 'The general direction price is moving over time — a series of higher highs and higher lows (up), or lower highs and lower lows (down).',
      he: 'הכיוון הכללי שבו המחיר נע לאורך זמן — סדרה של שיאים ושפלים גבוהים יותר (עלייה), או שיאים ושפלים נמוכים יותר (ירידה).'
    }
  },
  {
    id: 'moving-average',
    cat: 'technical',
    he: ['ממוצע נע', 'הממוצע הנע', 'ממוצע', 'הממוצע'],
    en: ['moving average'],
    def: {
      en: 'The average closing price over a fixed number of past sessions, recalculated every day — it smooths out day-to-day noise so the trend is easier to see.',
      he: 'מחיר הסגירה הממוצע לאורך מספר קבוע של מפגשים קודמים, המחושב מחדש בכל יום — הוא מחליק את הרעש היומי כדי שהמגמה תהיה ברורה יותר.'
    }
  },
  {
    id: 'rsi',
    cat: 'technical',
    he: ['RSI'],
    en: ['RSI'],
    def: {
      en: 'Relative Strength Index — a momentum indicator between 0 and 100, based on recent gains versus recent losses. Above 70 is called "overbought", below 30 "oversold".',
      he: 'מדד העוצמה היחסית — אינדיקטור מומנטום שנע בין 0 ל-100, מבוסס על רווחים לעומת הפסדים אחרונים. מעל 70 נקרא "קניית יתר", מתחת ל-30 "מכירת יתר".'
    }
  },
  {
    id: 'momentum',
    cat: 'technical',
    he: ['מומנטום', 'המומנטום'],
    en: ['momentum'],
    def: {
      en: 'How fast and forcefully price is moving, as opposed to price itself — momentum can weaken even while price still looks strong.',
      he: 'באיזו מהירות ובאיזה עוצמה המחיר נע, בניגוד למחיר עצמו — המומנטום יכול להיחלש גם כשהמחיר עדיין נראה חזק.'
    }
  },
  {
    id: 'overbought',
    cat: 'technical',
    he: ['קניית יתר'],
    en: ['overbought'],
    def: {
      en: 'A reading (usually RSI above 70) suggesting price has risen fast — a caution flag, not an automatic sell signal.',
      he: 'קריאה (בדרך כלל RSI מעל 70) שמעידה שהמחיר עלה מהר — דגל אזהרה, לא איתות מכירה אוטומטי.'
    }
  },
  {
    id: 'oversold',
    cat: 'technical',
    he: ['מכירת יתר'],
    en: ['oversold'],
    def: {
      en: 'A reading (usually RSI below 30) suggesting price has fallen fast — a caution flag, not an automatic buy signal.',
      he: 'קריאה (בדרך כלל RSI מתחת ל-30) שמעידה שהמחיר ירד מהר — דגל אזהרה, לא איתות קנייה אוטומטי.'
    }
  },
  {
    id: 'candlestick',
    cat: 'technical',
    he: ['תבנית נרות', 'נרות המחיר', 'הנרות'],
    en: ['candlestick pattern', 'candlestick'],
    def: {
      en: 'A shape formed by one or more candles that traders watch for, because similar shapes have tended to precede similar outcomes.',
      he: 'צורה שנוצרת מנר אחד או יותר שסוחרים שומרים עליה עין, כי צורות דומות נטו להקדים תוצאות דומות.'
    }
  },
  {
    id: 'volume',
    cat: 'technical',
    he: ['נפח מסחר', 'נפח', 'הנפח'],
    en: ['volume'],
    def: {
      en: 'How many shares changed hands in a given period. A move on heavy volume shows real conviction; the same move on light volume is easier to reverse.',
      he: 'כמה מניות עברו יד בפרק זמן נתון. תנועה בנפח כבד מראה שכנוע אמיתי; אותה תנועה בנפח קל קל יותר להפוך.'
    }
  },
  {
    id: 'fibonacci',
    cat: 'technical',
    he: ['פיבונאצ׳י', 'פיבונאצי', 'תיקון פיבונאצ׳י'],
    en: ['fibonacci'],
    def: {
      en: 'A set of percentages (23.6%, 38.2%, 50%, 61.8%, 78.6%) used to mark likely pullback levels after a strong price move.',
      he: 'קבוצת אחוזים (23.6%, 38.2%, 50%, 61.8%, 78.6%) המשמשת לסמן רמות תיקון סבירות אחרי תנועת מחיר חזקה.'
    }
  },
  {
    id: 'head-and-shoulders',
    cat: 'technical',
    he: ['ראש וכתפיים'],
    en: ['head and shoulders'],
    def: {
      en: 'A reversal pattern of three peaks — a shoulder, a taller head, then a second shoulder — where a break below the neckline is the classic trigger.',
      he: 'תבנית היפוך של שלושה שיאים — כתף, ראש גבוה יותר, וכתף שנייה — שבה פריצה מתחת לקו הצוואר היא האיתות הקלאסי.'
    }
  },
  {
    id: 'measured-move',
    cat: 'technical',
    he: ['התנועה הנמדדת', 'תנועה נמדדת'],
    en: ['measured move'],
    def: {
      en: 'A rough price-target technique: take the height of a chart pattern and project that same distance from the breakout point, in the breakout direction. A starting estimate, not a promise.',
      he: 'טכניקה גסה להערכת יעד מחיר: לוקחים את הגובה של תבנית הגרף ומקרינים את אותו מרחק מנקודת הפריצה, בכיוון הפריצה. הערכת פתיחה, לא הבטחה.'
    }
  },
  {
    id: 'stop-loss',
    cat: 'risk',
    he: ['סטופ לוס', 'סטופ-לוס', 'עצירת הפסד'],
    en: ['stop-loss', 'stop loss'],
    def: {
      en: 'A price you decide in advance at which you will exit a losing position, so one bad trade cannot cost more than you planned.',
      he: 'מחיר שקובעים מראש שבו סוגרים פוזיציה מפסידה, כך שעסקה אחת גרועה לא תעלה יותר ממה שתכננתם.'
    }
  },
  {
    id: 'divergence',
    cat: 'technical',
    he: ['דייברג׳נס', 'הדייברג׳נס', 'בדייברג׳נס', 'לדייברג׳נס', 'דיברגנץ'],
    en: ['divergence'],
    def: {
      en: 'When price and an indicator (like RSI) move in opposite directions — often an early warning that a trend is losing strength.',
      he: 'כאשר המחיר ואינדיקטור (כמו RSI) נעים בכיוונים מנוגדים — לרוב אזהרה מוקדמת שהמגמה מאבדת עוצמה.'
    }
  },
  // --- market basics: the vocabulary a complete beginner meets first, and
  // which the lessons assume from l1 onward ---
  {
    id: 'stock',
    cat: 'basics',
    he: ['מניה', 'המניה', 'מניות', 'המניות', 'במניה', 'למניה'],
    en: ['stock', 'share'],
    def: {
      en: 'A small piece of ownership in a company — including a share of its future profits and its future risks.',
      he: 'פיסת בעלות קטנה בחברה — כולל חלק מהרווחים העתידיים שלה ומהסיכונים העתידיים שלה.'
    }
  },
  {
    id: 'exchange',
    cat: 'basics',
    he: ['בורסה', 'הבורסה', 'בבורסה'],
    en: ['exchange'],
    def: {
      en: 'The marketplace where shares are bought and sold (e.g. the NYSE, Nasdaq, or the Tel Aviv Stock Exchange).',
      he: 'הזירה שבה מניות נקנות ונמכרות (למשל NYSE, נאסד״ק, או הבורסה לניירות ערך בתל אביב).'
    }
  },
  {
    id: 'index',
    cat: 'basics',
    he: ['מדד', 'המדד', 'מדדים', 'במדד'],
    en: ['index'],
    def: {
      en: 'A single number tracking a basket of stocks together — the S&P 500 or TA-35, for example — used to describe how a whole market is doing.',
      he: 'מספר יחיד שעוקב אחרי סל מניות יחד — למשל S&P 500 או ת״א-35 — ומשמש לתאר איך שוק שלם מתנהג.'
    }
  },
  {
    id: 'etf',
    cat: 'basics',
    he: ['קרן סל', 'קרנות סל', 'תעודת סל'],
    en: ['ETF'],
    def: {
      en: 'A fund that trades like a single stock but holds many underlying assets at once — often used to track an index cheaply.',
      he: 'קרן שנסחרת כמו מניה בודדת אך מחזיקה הרבה נכסים בו-זמנית — לרוב משמשת למעקב זול אחרי מדד.'
    }
  },
  {
    id: 'dividend',
    cat: 'basics',
    he: ['דיבידנד', 'הדיבידנד', 'דיבידנדים'],
    en: ['dividend'],
    def: {
      en: 'A share of a company\'s profits paid out to shareholders in cash, usually on a regular schedule. Not every company pays one.',
      he: 'חלק מרווחי החברה שמשולם לבעלי המניות במזומן, בדרך כלל במועדים קבועים. לא כל חברה מחלקת דיבידנד.'
    }
  },
  {
    id: 'ticker',
    cat: 'basics',
    he: ['סימול', 'הסימול', 'טיקר'],
    en: ['ticker', 'ticker symbol'],
    def: {
      en: 'The short code that identifies a stock on an exchange — AAPL for Apple, MSFT for Microsoft.',
      he: 'הקוד הקצר שמזהה מניה בבורסה — AAPL עבור אפל, MSFT עבור מיקרוסופט.'
    }
  },
  {
    id: 'market-cap',
    cat: 'basics',
    he: ['שווי שוק', 'השווי שוק'],
    en: ['market cap', 'market capitalization'],
    def: {
      en: 'What the market currently values the whole company at: share price multiplied by the number of shares.',
      he: 'כמה השוק מעריך את כל החברה כרגע: מחיר המניה כפול מספר המניות.'
    }
  },
  {
    id: 'portfolio',
    cat: 'basics',
    he: ['תיק השקעות', 'תיק ההשקעות', 'התיק'],
    en: ['portfolio'],
    def: {
      en: 'Everything you hold, taken together. Most decisions matter less on their own than in terms of what they do to the whole portfolio.',
      he: 'כל מה שאתם מחזיקים, ביחד. רוב ההחלטות חשובות פחות בפני עצמן ויותר לפי מה שהן עושות לתיק כולו.'
    }
  },
  {
    id: 'bull-market',
    cat: 'basics',
    he: ['שוק שורי', 'שוק עולה'],
    en: ['bull market'],
    def: {
      en: 'A prolonged period of generally rising prices — and, usually, of optimism about the future.',
      he: 'תקופה ממושכת של מחירים עולים באופן כללי — ולרוב גם של אופטימיות לגבי העתיד.'
    }
  },
  {
    id: 'bear-market',
    cat: 'basics',
    he: ['שוק דובי', 'שוק יורד'],
    en: ['bear market'],
    def: {
      en: 'A prolonged period of generally falling prices, commonly defined as a drop of 20% or more from a recent high.',
      he: 'תקופה ממושכת של מחירים יורדים, שמוגדרת בדרך כלל כירידה של 20% או יותר משיא אחרון.'
    }
  },
  {
    id: 'volatility',
    cat: 'basics',
    he: ['תנודתיות', 'התנודתיות'],
    en: ['volatility'],
    def: {
      en: 'How sharply and how often a price swings. High volatility means bigger moves in both directions — not just downward risk.',
      he: 'באיזו חדות ובאיזו תדירות המחיר מתנדנד. תנודתיות גבוהה פירושה תנועות גדולות יותר לשני הכיוונים — לא רק סיכון לירידה.'
    }
  },
  {
    id: 'timeframe',
    cat: 'basics',
    he: ['טווח זמן', 'טווחי זמן'],
    en: ['timeframe'],
    def: {
      en: 'The time each candle on a chart covers. The same stock can look like it is crashing on a 5-minute chart and climbing on a weekly one.',
      he: 'פרק הזמן שכל נר בגרף מכסה. אותה מניה יכולה להיראות קורסת בגרף של 5 דקות ומטפסת בגרף שבועי.'
    }
  },
  {
    id: 'liquidity',
    cat: 'basics',
    he: ['נזילות', 'הנזילות'],
    en: ['liquidity'],
    def: {
      en: 'How easily something can be bought or sold without moving its own price much. Thinly traded stocks are harder to exit.',
      he: 'כמה קל לקנות או למכור משהו בלי להזיז את המחיר שלו עצמו. במניות שנסחרות בדלילות קשה יותר לצאת.'
    }
  },

  // --- fundamentals: what the company itself is doing, as opposed to what
  // its chart is doing ---
  {
    id: 'pe-ratio',
    cat: 'fundamentals',
    he: ['מכפיל רווח', 'המכפיל'],
    en: ['P/E', 'P/E ratio'],
    def: {
      en: 'Share price divided by earnings per share — roughly, how much you pay for each unit of profit. Only meaningful compared with similar companies.',
      he: 'מחיר המניה חלקי הרווח למניה — בגסות, כמה משלמים על כל יחידת רווח. משמעותי רק בהשוואה לחברות דומות.'
    }
  },
  {
    id: 'earnings',
    cat: 'fundamentals',
    he: ['רווחים', 'הרווחים', 'דוח רווח', 'דוחות'],
    en: ['earnings'],
    def: {
      en: 'A company\'s profit over a period. Companies report it quarterly, and the report itself often moves the price sharply.',
      he: 'הרווח של חברה בתקופה מסוימת. חברות מדווחות עליו רבעונית, והדוח עצמו לרוב מזיז את המחיר בחדות.'
    }
  },
  {
    id: 'revenue',
    cat: 'fundamentals',
    he: ['הכנסות', 'ההכנסות', 'מחזור'],
    en: ['revenue'],
    def: {
      en: 'Total money coming in before any costs are subtracted. A company can grow revenue and still lose money.',
      he: 'סך הכסף שנכנס לפני שמחסירים עלויות. חברה יכולה להגדיל הכנסות ועדיין להפסיד כסף.'
    }
  },
  {
    id: 'eps',
    cat: 'fundamentals',
    he: ['רווח למניה', 'EPS'],
    en: ['EPS', 'earnings per share'],
    def: {
      en: 'Profit divided by the number of shares — the per-share slice of what the company earned.',
      he: 'הרווח חלקי מספר המניות — הפרוסה של כל מניה מתוך מה שהחברה הרוויחה.'
    }
  },

  // --- risk: the part beginners skip and professionals do not ---
  {
    id: 'diversification',
    cat: 'risk',
    he: ['פיזור', 'הפיזור', 'גיוון'],
    en: ['diversification'],
    def: {
      en: 'Spreading money across different holdings so that one bad outcome cannot sink the whole portfolio.',
      he: 'פריסת הכסף על פני החזקות שונות, כך שתוצאה גרועה אחת לא תטביע את כל התיק.'
    }
  },
  {
    id: 'position-size',
    cat: 'risk',
    he: ['גודל פוזיציה', 'גודל הפוזיציה', 'פוזיציה'],
    en: ['position size'],
    def: {
      en: 'How much of your capital goes into a single idea. Deciding this before entering is what lets you be wrong repeatedly and stay in the game.',
      he: 'כמה מההון נכנס לרעיון בודד. ההחלטה על כך לפני הכניסה היא מה שמאפשר לטעות שוב ושוב ולהישאר במשחק.'
    }
  },
  {
    id: 'risk-reward',
    cat: 'risk',
    he: ['יחס סיכון סיכוי', 'סיכון מול סיכוי'],
    en: ['risk-reward', 'risk/reward'],
    def: {
      en: 'How much you stand to lose if wrong, compared with how much you stand to gain if right — judged before entering, not after.',
      he: 'כמה עלולים להפסיד אם טועים, לעומת כמה אפשר להרוויח אם צודקים — נשקל לפני הכניסה, לא אחריה.'
    }
  },
  {
    id: 'drawdown',
    cat: 'risk',
    he: ['ירידה מהשיא', 'דראודאון'],
    en: ['drawdown'],
    def: {
      en: 'How far a holding or a portfolio has fallen from its peak. The maths is unforgiving: a 50% loss needs a 100% gain just to break even.',
      he: 'כמה החזקה או תיק ירדו מהשיא שלהם. המתמטיקה אכזרית: הפסד של 50% דורש רווח של 100% רק כדי לחזור לאיזון.'
    }
  },
  {
    id: 'bond',
    cat: 'basics',
    he: ['אג״ח', 'אגרות חוב', 'ואג״ח', 'לאג״ח', 'באג״ח', 'האג״ח', 'אגרת חוב'],
    en: ['bond', 'bonds'],
    def: {
      en: 'A loan you give a government or a company in exchange for interest and your money back at a set date. Usually calmer than stocks, with less upside.',
      he: 'הלוואה שנותנים לממשלה או לחברה, תמורת ריבית והחזר הכסף במועד קבוע. לרוב רגועה יותר ממניה, עם פחות פוטנציאל.'
    }
  },
  {
    id: 'broker',
    cat: 'basics',
    he: ['ברוקר', 'הברוקר', 'בברוקר', 'לברוקר', 'וברוקר', 'שברוקר', 'מברוקר'],
    en: ['broker', 'brokers'],
    def: {
      en: 'The licensed firm that passes your orders to the exchange and holds your shares for you.',
      he: 'הגוף המורשה שמעביר את הפקודות שלכם לבורסה ומחזיק עבורכם את המניות.'
    }
  },
  {
    id: 'spread',
    cat: 'basics',
    he: ['מרווח', 'המרווח', 'והמרווח', 'כשהמרווח', 'למרווח'],
    en: ['spread', 'bid-ask spread'],
    def: {
      en: 'The gap between the best price buyers offer (bid) and the best price sellers ask. A cost you pay without seeing it; wide in thinly traded stocks.',
      he: 'הפער בין המחיר הטוב ביותר שקונים מציעים (Bid) לבין המחיר הטוב ביותר שמוכרים מבקשים (Ask). עלות שמשלמים בלי לראות; רחב במניות דלות מסחר.'
    }
  },
  {
    id: 'limit-order',
    cat: 'basics',
    he: ['פקודת לימיט', 'פקודת הלימיט', 'בפקודת לימיט', 'לימיט'],
    en: ['limit order', 'limit orders'],
    def: {
      en: 'An order to buy or sell only at a price you set or better. It controls the price, but it may never be filled.',
      he: 'פקודה לקנות או למכור רק במחיר שקבעתם או טוב ממנו. שולטת במחיר, אבל ייתכן שלא תתבצע.'
    }
  },
  {
    id: 'macd',
    cat: 'technical',
    he: ['MACD'],
    en: ['MACD'],
    def: {
      en: 'The gap between a fast and a slow moving average, with a signal line of its own. It shows momentum building or fading, late by design.',
      he: 'הפער בין ממוצע נע מהיר לאיטי, עם קו סיגנל משלו. מראה מומנטום שמתחזק או נחלש — ובאיחור, מעצם הבנייה.'
    }
  },
  {
    id: 'operating-income',
    cat: 'fundamentals',
    he: ['רווח תפעולי', 'הרווח התפעולי', 'ברווח התפעולי', 'לרווח התפעולי'],
    en: ['operating income'],
    def: {
      en: 'What the business itself earns: revenue minus the costs of making and running it, before interest and tax.',
      he: 'מה שהעסק עצמו מרוויח: הכנסות פחות עלויות הייצור וההפעלה, לפני ריבית ומס.'
    }
  },
  {
    id: 'margin',
    cat: 'fundamentals',
    he: ['שולי רווח', 'שולי הרווח', 'בשולי הרווח', 'שוליים', 'השוליים'],
    en: ['margin', 'margins'],
    def: {
      en: 'Profit as a share of revenue: how much of each unit of sales the company keeps.',
      he: 'רווח כאחוז מההכנסות: כמה מכל שקל מכירות החברה משאירה אצלה.'
    }
  },
  {
    id: 'roe',
    cat: 'fundamentals',
    he: ['ROE'],
    en: ['ROE'],
    def: {
      en: 'Return on equity: net profit divided by shareholders’ equity. How much the owners’ money earns — high is good, unless debt is doing the work.',
      he: 'תשואה על ההון: רווח נקי חלקי ההון העצמי. כמה רווח מייצר הכסף של הבעלים — גבוה זה טוב, אלא אם החוב עושה את העבודה.'
    }
  },
  {
    id: 'free-cash-flow',
    cat: 'fundamentals',
    he: ['תזרים חופשי', 'התזרים החופשי', 'תזרים מזומנים חופשי', 'בתזרים החופשי', 'לתזרים החופשי'],
    en: ['free cash flow'],
    def: {
      en: 'Cash from operations minus the investment needed to keep the business going. The cash that is actually left over.',
      he: 'מזומן מפעילות פחות ההשקעות הנדרשות כדי להמשיך לפעול. המזומן שבאמת נשאר.'
    }
  },
  {
    id: 'dcf',
    cat: 'fundamentals',
    he: ['DCF', 'היוון תזרימים'],
    en: ['DCF', 'discounted cash flow'],
    def: {
      en: 'Valuing a company by the cash it is expected to produce, discounted back to today. Only as good as its assumptions.',
      he: 'הערכת שווי לפי המזומן שהחברה צפויה לייצר, מהוון להיום. טובה בדיוק כמו ההנחות שלה.'
    }
  },
  {
    id: 'margin-of-safety',
    cat: 'fundamentals',
    he: ['מרווח ביטחון', 'מרווח הביטחון', 'ומרווח ביטחון', 'למרווח הביטחון', 'במרווח ביטחון'],
    en: ['margin of safety'],
    def: {
      en: 'The gap between what you estimate a stock is worth and the price you pay — room for your estimate to be wrong.',
      he: 'הפער בין השווי שהערכתם למניה לבין המחיר שמשלמים — מקום לכך שההערכה תטעה.'
    }
  },
  {
    id: 'risk',
    cat: 'risk',
    he: ['סיכון', 'הסיכון', 'בסיכון', 'לסיכון', 'וסיכון', 'שהסיכון'],
    en: ['risk'],
    def: {
      en: 'How much, and how often, an investment can go against you — measured in several ways (volatility, drawdown), not only by how far it fell.',
      he: 'כמה, וכמה פעמים, השקעה יכולה ללכת נגדכם — נמדד בכמה דרכים (תנודתיות, ירידה מהשיא), לא רק בכמה ירדה.'
    }
  },
  {
    id: 'correlation',
    cat: 'risk',
    he: ['מתאם', 'המתאם', 'במתאם', 'ומתאם', 'שהמתאם'],
    en: ['correlation', 'correlations'],
    def: {
      en: 'How closely two assets move together, from +1 (in step) to −1 (opposite). Diversification works through low or negative correlation, not through the number of holdings.',
      he: 'כמה שני נכסים זזים יחד, מ־1+ (באותו כיוון) עד 1− (בכיוון הפוך). פיזור עובד דרך מתאם נמוך או שלילי, לא דרך מספר ההחזקות.'
    }
  },
  {
    id: 'rebalancing',
    cat: 'risk',
    he: ['איזון מחדש', 'האיזון מחדש', 'ואיזון מחדש', 'באיזון מחדש'],
    en: ['rebalancing', 'rebalance'],
    def: {
      en: 'Returning a portfolio to its planned weights after the market moved them — buying what fell and trimming what rose, by rule.',
      he: 'החזרת התיק למשקלים שתוכננו אחרי שהשוק הזיז אותם — לקנות את מה שירד ולקצץ את מה שעלה, לפי כלל.'
    }
  },
  {
    id: 'take-profit',
    cat: 'risk',
    he: ['טייק פרופיט', 'יעד רווח', 'יעד הרווח'],
    en: ['take-profit', 'take profit'],
    def: {
      en: 'A price set in advance at which you close a winning trade. Together with the stop, it fixes the risk/reward before you enter.',
      he: 'מחיר שנקבע מראש שבו סוגרים עסקה מרוויחה. יחד עם הסטופ, הוא קובע את יחס הסיכון-סיכוי לפני הכניסה.'
    }
  },
  {
    id: 'compound-interest',
    cat: 'risk',
    he: ['ריבית דריבית', 'בריבית דריבית', 'הריבית דריבית'],
    en: ['compound interest', 'compounding'],
    def: {
      en: 'Earning returns on past returns, not only on what you put in. Slow at first, then steep — which is why time matters more than timing.',
      he: 'תשואה על תשואות קודמות, לא רק על מה שהפקדתם. איטית בהתחלה, ואז תלולה — ולכן הזמן חשוב יותר מהתזמון.'
    }
  },
  {
    id: 'dca',
    cat: 'risk',
    he: ['הפקדה קבועה', 'בהפקדה קבועה', 'והפקדה קבועה', 'הפקדות קבועות'],
    en: ['dollar-cost averaging'],
    def: {
      en: 'Investing the same amount at regular intervals whatever the price. You buy more units when prices are low, and stop trying to time the market.',
      he: 'השקעת סכום קבוע במרווחי זמן קבועים, בלי קשר למחיר. קונים יותר יחידות כשהמחיר נמוך, ומפסיקים לנסות לתזמן את השוק.'
    }
  },
  {
    id: 'asset-allocation',
    cat: 'risk',
    he: ['הקצאה', 'ההקצאה', 'בהקצאה', 'והקצאה', 'הקצאת נכסים'],
    en: ['asset allocation', 'allocation'],
    def: {
      en: 'How a portfolio is split between asset types — stocks, bonds, gold, cash. It sets most of the portfolio’s risk, more than any single pick.',
      he: 'איך התיק מתחלק בין סוגי נכסים — מניות, אג״ח, זהב, מזומן. היא קובעת את רוב הסיכון של התיק, יותר מכל בחירה בודדת.'
    }
  },
  {
    id: 'disposition-effect',
    cat: 'risk',
    he: ['אפקט הנטייה', 'אפקט הדיספוזיציה'],
    en: ['disposition effect'],
    def: {
      en: 'The habit of selling winners too early and holding losers too long, because realising a loss hurts. One of the costliest investor biases.',
      he: 'הנטייה למכור מרוויחות מוקדם מדי ולהחזיק מפסידות זמן רב מדי, כי מימוש הפסד כואב. אחת ההטיות היקרות ביותר של משקיעים.'
    }
  },
  {
    id: 'bubble',
    cat: 'risk',
    he: ['בועה', 'הבועה', 'בבועה', 'בועות', 'הבועות'],
    en: ['bubble', 'bubbles'],
    def: {
      en: 'Prices rising far beyond what earnings can justify, driven by the expectation that someone will pay even more. It ends with a sharp fall.',
      he: 'מחירים שעולים הרבה מעבר למה שהרווחים מצדיקים, מתוך ציפייה שמישהו ישלם עוד יותר. זה נגמר בנפילה חדה.'
    }
  },
  {
    id: 'interest-rate',
    cat: 'macro',
    he: ['ריבית', 'הריבית', 'בריבית', 'לריבית', 'שהריבית', 'והריבית'],
    en: ['interest rate', 'interest rates'],
    def: {
      en: 'The price of using money over time: what a borrower pays and a saver earns. The central bank sets the base; everything else is priced off it.',
      he: 'המחיר של שימוש בכסף לאורך זמן: מה שלווה משלם וחוסך מקבל. הבנק המרכזי קובע את הבסיס, וכל השאר מתומחר לפיו.'
    }
  },
  {
    id: 'inflation',
    cat: 'macro',
    he: ['אינפלציה', 'האינפלציה', 'באינפלציה', 'לאינפלציה', 'שהאינפלציה', 'והאינפלציה'],
    en: ['inflation'],
    def: {
      en: 'A general rise in prices, measured by the consumer price index. The same money buys less; most central banks aim for about 2% a year.',
      he: 'עלייה כללית במחירים, שנמדדת במדד המחירים לצרכן. אותו כסף קונה פחות; רוב הבנקים המרכזיים מכוונים לכ־2% בשנה.'
    }
  },
  {
    id: 'gdp',
    cat: 'macro',
    he: ['תמ״ג', 'התמ״ג', 'תוצר', 'התוצר', 'בתוצר'],
    en: ['GDP'],
    def: {
      en: 'Gross domestic product: the value of everything an economy produces. How fast it grows is the economy’s growth rate.',
      he: 'התוצר המקומי הגולמי: הערך של כל מה שהמשק מייצר. הקצב שבו הוא גדל הוא קצב הצמיחה.'
    }
  },
  {
    id: 'recession',
    cat: 'macro',
    he: ['מיתון', 'המיתון', 'במיתון', 'למיתון', 'ממיתון', 'שהמיתון'],
    en: ['recession', 'recessions'],
    def: {
      en: 'A significant, broad contraction of the economy. Rule of thumb: two quarters in a row of negative growth; officially dated only in hindsight.',
      he: 'התכווצות משמעותית ורחבה של המשק. כלל אצבע: שני רבעונים רצופים של צמיחה שלילית; התאריך הרשמי נקבע רק בדיעבד.'
    }
  },
  {
    id: 'central-bank',
    cat: 'macro',
    he: ['בנק מרכזי', 'הבנק המרכזי', 'בנקים מרכזיים', 'לבנק המרכזי', 'שהבנק המרכזי', 'והבנק המרכזי'],
    en: ['central bank', 'central banks'],
    def: {
      en: 'The institution that sets a country’s base interest rate (the Bank of Israel, the Fed) to keep prices stable — raising it to cool inflation, cutting it in a slump.',
      he: 'המוסד שקובע את ריבית הבסיס של המדינה (בנק ישראל, הפד) כדי לשמור על יציבות מחירים — מעלה אותה לקירור אינפלציה ומוריד בשפל.'
    }
  },
  {
    id: 'coupon',
    cat: 'macro',
    he: ['קופון', 'הקופון', 'בקופון', 'שהקופון', 'והקופון'],
    en: ['coupon'],
    def: {
      en: 'The fixed yearly interest a bond pays on its face value. The coupon never changes; the bond’s price does.',
      he: 'הריבית השנתית הקבועה שאג״ח משלמת על הערך הנקוב. הקופון לא משתנה — המחיר של האג״ח כן.'
    }
  },
  {
    id: 'ytm',
    cat: 'macro',
    he: ['תשואה לפדיון', 'התשואה לפדיון', 'בתשואה לפדיון'],
    en: ['yield to maturity', 'YTM'],
    def: {
      en: 'A bond’s total yearly return if bought at today’s price and held to the end, including the gap between that price and the face value.',
      he: 'התשואה השנתית הכוללת של אג״ח אם קונים במחיר של היום ומחזיקים עד הסוף, כולל הפער בין המחיר לערך הנקוב.'
    }
  },
  {
    id: 'yield-curve',
    cat: 'macro',
    he: ['עקום תשואות', 'עקום התשואות', 'בעקום התשואות'],
    en: ['yield curve'],
    def: {
      en: 'Government bond yields by time to maturity. It usually slopes up; when short yields rise above long ones it is "inverted", a sign the market expects slower growth.',
      he: 'תשואות אג״ח ממשלתיות לפי זמן לפדיון. בדרך כלל הוא עולה; כשהקצר גבוה מהארוך הוא "הפוך" — סימן שהשוק מצפה להאטה.'
    }
  },
  {
    id: 'market-maker',
    cat: 'macro',
    he: ['עושה שוק', 'עושי שוק', 'עושי השוק', 'עושה השוק'],
    en: ['market maker', 'market makers'],
    def: {
      en: 'A firm that always quotes both a buying and a selling price, earning the spread between them. It gives the market liquidity.',
      he: 'גוף שמציע כל הזמן גם מחיר קנייה וגם מחיר מכירה, ומרוויח מהמרווח ביניהם. הוא מספק לשוק נזילות.'
    }
  },
  {
    id: 'priced-in',
    cat: 'macro',
    he: ['מגולם במחיר', 'מגולמות במחיר', 'גולמה במחיר', 'גולמו במחיר'],
    en: ['priced in'],
    def: {
      en: 'Already reflected in the price, because the market expected it. What moves a price is the surprise — the gap between what happened and what was expected.',
      he: 'כבר משתקף במחיר, כי השוק ציפה לזה. מה שמזיז מחיר הוא ההפתעה — הפער בין מה שקרה לבין מה שציפו לו.'
    }
  }
];

export function glossaryTerm(id: string): GlossaryTerm | undefined {
  return GLOSSARY.find((g) => g.id === id);
}

/** Display order of the categories on the glossary page: what a beginner
 *  needs first, then the two analytical lenses, then the part that keeps
 *  them solvent, then the economy around it all — the curriculum's order. */
export const GLOSSARY_CATEGORY_ORDER: GlossaryCategory[] = [
  'basics',
  'technical',
  'fundamentals',
  'risk',
  'macro'
];

export const GLOSSARY_CATEGORY_LABELS: Record<GlossaryCategory, Localized> = {
  basics: { en: 'Market basics', he: 'יסודות השוק' },
  technical: { en: 'Technical analysis', he: 'ניתוח טכני' },
  fundamentals: { en: 'Company fundamentals', he: 'ניתוח פונדמנטלי' },
  risk: { en: 'Risk and money management', he: 'סיכון וניהול כסף' },
  macro: { en: 'Macro and the market', he: 'מאקרו והשוק' }
};

/** The term's primary display name in one language — the first surface form,
 *  which is authored as the canonical one. */
export function glossaryLabel(term: GlossaryTerm, lang: 'he' | 'en'): string {
  return (lang === 'he' ? term.he[0] : term.en[0]) ?? term.id;
}

/**
 * Case-insensitive search across both languages' surface forms AND both
 * definitions — searching the definition matters, because a beginner often
 * knows the idea ("when everyone is selling") but not its name.
 */
export function searchGlossary(query: string, lang: 'he' | 'en'): GlossaryTerm[] {
  const q = query.trim().toLowerCase();
  if (!q) return GLOSSARY;
  return GLOSSARY.filter((t) => {
    const forms = [...t.he, ...t.en].map((f) => f.toLowerCase());
    if (forms.some((f) => f.includes(q))) return true;
    return t.def[lang].toLowerCase().includes(q);
  });
}
