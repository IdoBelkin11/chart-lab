// ---------------------------------------------------------------------------
// What each track page promises: the skills, the terms, the capstone project
// and the one-line "why". Copied from the approved design (Hebrew), with the
// English written alongside so a track page is never half-translated.
// ---------------------------------------------------------------------------
import type { Localized } from '@core/types/kb';
import type { TrackId } from './data';
// The metadata only: importing the lessons themselves here would load them on every page.
import { isWritten } from '@core/lessons/content/meta';

export interface TrackInfo {
  why: Localized;
  skills: readonly Localized[];
  terms: { he: readonly string[]; en: readonly string[] };
  /** The capstone project, where the track has one. */
  project: Localized | null;
}

const L = (he: string, en: string): Localized => ({ he, en });

export const TRACK_INFO: Readonly<Record<TrackId, TrackInfo>> = {
  F: {
    why: L('המילים שכל מסלול אחר מניח שאתם כבר יודעים.', 'The vocabulary every other track assumes you already have.'),
    skills: [
      L('להסביר מה ההבדל בין מניה, אג״ח, קרן סל ומדד', 'Explain the difference between a stock, a bond, an ETF and an index'),
      L('לקרוא שורת נתונים של מניה: מחיר, שווי שוק, נפח', 'Read a stock quote: price, market cap, volume'),
      L('להבין למה מחיר זז ומה עולה לכם המרווח', 'Understand why a price moves and what the spread costs you'),
      L('לבחור בין פקודת שוק לפקודת לימיט', 'Choose between a market order and a limit order')
    ],
    terms: { he: ['מניה', 'אג״ח', 'קרן סל', 'מדד', 'ברוקר', 'שווי שוק', 'נזילות', 'מרווח', 'פקודת לימיט'], en: ['Stock', 'Bond', 'ETF', 'Index', 'Broker', 'Market cap', 'Liquidity', 'Spread', 'Limit order'] },
    project: null
  },
  T: {
    why: L('קריאת גרף כמיומנות — לא איתותים ולא "סטאפים".', 'Reading a chart as a skill — not signals, not "setups".'),
    skills: [
      L('לזהות מגמה לפי שיאים ושפלים', 'Identify a trend from highs and lows'),
      L('לסמן תמיכה והתנגדות ולזהות פריצה אמיתית', 'Mark support and resistance, and spot a real breakout'),
      L('לקרוא ממוצעים נעים, RSI ו־MACD — ומתי הם סותרים', 'Read moving averages, RSI and MACD — and know when they disagree'),
      L('לתכנן עסקה עם סטופ ויעד על הגרף', 'Plan a trade with a stop and a target on the chart')
    ],
    terms: { he: ['מגמה', 'תמיכה', 'התנגדות', 'פריצה', 'ממוצע נע', 'RSI', 'MACD', 'דייברג׳נס', 'פיבונאצ׳י'], en: ['Trend', 'Support', 'Resistance', 'Breakout', 'Moving average', 'RSI', 'MACD', 'Divergence', 'Fibonacci'] },
    project: L('לנתח גרף מלא מההתחלה: מגמה, רמות, אינדיקטורים — ולכתוב תוכנית עם סטופ ויעד, בלי שהאינדיקטורים יסתרו זה את זה.', 'Analyse a full chart from scratch — trend, levels, indicators — and write a plan with a stop and a target, without the indicators contradicting each other.')
  },
  P: {
    why: L('מה עומד מאחורי המחיר — החברה עצמה.', 'What stands behind the price — the business itself.'),
    skills: [
      L('לקרוא דוח רווח והפסד שורה אחרי שורה', 'Read an income statement line by line'),
      L('להשוות רווחיות בין חברות בגדלים שונים', 'Compare profitability across companies of different sizes'),
      L('להבין מכפילים ומתי כל אחד מטעה', 'Understand multiples, and when each one misleads'),
      L('לבנות הערכת שווי DCF ולבדוק כמה היא רגישה', 'Build a DCF valuation and test how sensitive it is')
    ],
    terms: { he: ['הכנסות', 'רווח תפעולי', 'EPS', 'שולי רווח', 'ROE', 'מכפיל רווח', 'תזרים חופשי', 'DCF'], en: ['Revenue', 'Operating income', 'EPS', 'Margin', 'ROE', 'P/E', 'Free cash flow', 'DCF'] },
    project: L('לבנות מודל DCF לחברה בדויה בארבעה שלבים: הנחות, תחזית, ערך שארית, רגישות.', 'Build a DCF model for a fictional company in four steps: assumptions, forecast, terminal value, sensitivity.')
  },
  R: {
    why: L('לפני כסף אמיתי: כמה אפשר להפסיד, ואיך לא להפסיד הכול בטעות אחת.', 'Before real money: how much you can lose, and how not to lose it all in one mistake.'),
    skills: [
      L('למדוד סיכון בכמה דרכים — לא רק "כמה ירד"', 'Measure risk in more than one way — not just "how far it fell"'),
      L('לחשב גודל פוזיציה מסיכון מוגדר', 'Size a position from a defined risk'),
      L('לבנות תיק מפוזר באמת, לא רק "הרבה מניות"', 'Build a genuinely diversified portfolio, not just "many stocks"'),
      L('לזהות את ההטיות שגורמות למכור ברגע הגרוע', 'Recognise the biases that make people sell at the worst moment')
    ],
    terms: { he: ['סיכון', 'תנודתיות', 'פיזור', 'מתאם', 'גודל פוזיציה', 'סטופ לוס', 'איזון מחדש'], en: ['Risk', 'Volatility', 'Diversification', 'Correlation', 'Position size', 'Stop loss', 'Rebalancing'] },
    project: L('לבנות תיק ראשון, להפיל את השוק בתרחיש, ולהחליט מראש מה עושים — לפני שזה קורה.', 'Build a first portfolio, crash the market in a scenario, and decide in advance what you will do — before it happens.')
  },
  M: {
    why: L('למה כל המניות זזות ביחד כשהבנק המרכזי מדבר.', 'Why every stock moves together when the central bank speaks.'),
    skills: [
      L('להסביר למה ריבית מזיזה את כל השוק', 'Explain why interest rates move the whole market'),
      L('לקרוא אינפלציה, תוצר ואבטלה ולהבין את הקשר', 'Read inflation, GDP and unemployment, and how they connect'),
      L('להבין אג״ח: קופון, תשואה ומחיר', 'Understand bonds: coupon, yield and price'),
      L('לקרוא את עקום התשואות כאיתות', 'Read the yield curve as a signal')
    ],
    terms: { he: ['ריבית', 'אינפלציה', 'תמ״ג', 'מיתון', 'אג״ח', 'תשואה לפדיון', 'עקום תשואות'], en: ['Interest rate', 'Inflation', 'GDP', 'Recession', 'Bond', 'Yield to maturity', 'Yield curve'] },
    project: null
  },
  D: {
    why: L('כלים חדים: לכן נפתחים רק אחרי מסלול הסיכון.', 'Sharp tools — which is why they open only after the Risk track.'),
    skills: [
      L('לקרוא גרף רווח/הפסד של אופציה', 'Read an option’s payoff chart'),
      L('להבין Call ו־Put ולמה ההפסד בקנייה מוגבל', 'Understand calls and puts, and why a buyer’s loss is capped'),
      L('להבין מינוף ומרג׳ין — ואת הסיכון שבהם', 'Understand leverage and margin — and the risk in them'),
      L('להבין מכירה בחסר ושורט סקוויז', 'Understand short selling and short squeezes')
    ],
    terms: { he: ['אופציה', 'מחיר מימוש', 'פרמיה', 'פקיעה', 'מינוף', 'מרג׳ין', 'שורט'], en: ['Option', 'Strike', 'Premium', 'Expiry', 'Leverage', 'Margin', 'Short'] },
    project: null
  }
};

/**
 * Whether a lesson can be opened and learned today: it has content in
 * @core/lessons/content. The rest show as "בקרוב" with an honest preview
 * (decided 2026-09-25).
 */
export function hasContent(lessonId: string): boolean {
  return isWritten(lessonId);
}
