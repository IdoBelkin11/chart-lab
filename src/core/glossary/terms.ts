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
export type GlossaryCategory = 'basics' | 'technical' | 'fundamentals' | 'risk';

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
    he: ['דיברגנץ'],
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
    he: ['רווח למניה'],
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
  }
];

export function glossaryTerm(id: string): GlossaryTerm | undefined {
  return GLOSSARY.find((g) => g.id === id);
}

/** Display order of the categories on the glossary page: what a beginner
 *  needs first, then the two analytical lenses, then the part that keeps
 *  them solvent. */
export const GLOSSARY_CATEGORY_ORDER: GlossaryCategory[] = [
  'basics',
  'technical',
  'fundamentals',
  'risk'
];

export const GLOSSARY_CATEGORY_LABELS: Record<GlossaryCategory, Localized> = {
  basics: { en: 'Market basics', he: 'יסודות השוק' },
  technical: { en: 'Technical analysis', he: 'ניתוח טכני' },
  fundamentals: { en: 'Company fundamentals', he: 'ניתוח פונדמנטלי' },
  risk: { en: 'Risk and money management', he: 'סיכון וניהול כסף' }
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
