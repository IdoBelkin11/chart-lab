// ---------------------------------------------------------------------------
// How the previous build's eight lessons fill the 7-step lesson workspace.
//
// Decided 2026-09-25: the authored prose stays word for word and is spread
// over steps 1–3 (intro → deeper → extra), the existing chart exercise (l1)
// or the lesson's own first quiz question is the Try step, and the only new
// text is the short "things to keep" below — each sentence restates what that
// lesson's own prose already says, nothing it does not.
//
// `charts[k]` is the chart indexes (into LESSON_CHARTS[id]) the workspace
// shows on step k+1; more than one renders as a captioned gallery.
// `notesStep` is the step (0-based) whose pane carries the lesson's
// "what to notice" notes, for the lessons that have them.
// ---------------------------------------------------------------------------
import type { Localized, QuizQuestion } from '@core/types/kb';
import { getQuizQuestions } from '@core/quiz/questions.js';

export interface WorkspacePlan {
  charts: [number[], number[], number[]];
  notesStep?: 1 | 2;
  /** Show the F1 concept cards (Artifact 07.1a) in the work area where there is no chart. */
  concepts?: boolean;
  /** "The bottom line" block of the takeaway step. */
  bottomLine: Localized;
  /** "Watch out" block of the takeaway step. */
  caveat: Localized;
}

export const WORKSPACE: Readonly<Record<string, WorkspacePlan>> = {
  l0: {
    charts: [[], [], []],
    concepts: true,
    bottomLine: {
      he: 'קרן סל מפזרת את הכסף על הרבה חברות בקנייה אחת, ושווי שוק — מחיר המניה כפול מספר המניות — הוא הדרך להשוות גודל בין חברות.',
      en: "An ETF spreads your money across many companies in one purchase, and market cap — share price times shares outstanding — is how companies' size is compared."
    },
    caveat: {
      he: 'הכלים באתר עובדים כמעט אותו דבר על מניות, קריפטו, מט״ח וסחורות — כי כולם גרף של קונים ומוכרים. אף אחד מהם לא מבטיח לאן המחיר ילך.',
      en: 'The tools on this site work almost the same on stocks, crypto, forex and commodities — all of them are a chart of buyers and sellers. None of them promises where price goes next.'
    }
  },
  l1: {
    charts: [[0], [0], [1]],
    bottomLine: {
      he: 'תמיכה היא אזור שבו לחץ קנייה גבר שוב ושוב על לחץ מכירה — אזור ששווה לעקוב אחריו, לא קו מדויק ולא רצפה קשיחה.',
      en: 'Support is an area where buying pressure repeatedly overwhelmed selling — a zone worth watching, not an exact line and not a hard floor.'
    },
    caveat: {
      he: 'אותה צפיפות של פקודות שמחזיקה רמה היא גם מה שמאיץ את השבירה שלה: כשהמחיר עובר, הסטופים שמאחוריה מופעלים בבת אחת.',
      en: 'The same crowding of orders that holds a level is what speeds up its break: once price gets through, the stops clustered behind it fire at once.'
    }
  },
  l2: {
    charts: [[0], [1, 2], [0]],
    notesStep: 2,
    bottomLine: {
      he: 'פריצה היא סגירה ברורה מעל התנגדות; ריטסט הוא חזרה לאותו אזור, שלעיתים קרובות הופך מהתנגדות לתמיכה.',
      en: 'A breakout is a decisive close above resistance; a retest is the return to that zone, which often turns former resistance into support.'
    },
    caveat: {
      he: 'סגירה שנשארת מתחת לרמה הישנה יותר מנר או שניים היא אזהרה שהפריצה נכשלת — ופריצה בנפח דליל אמינה פחות.',
      en: 'A close that stays under the old level for more than a candle or two warns the breakout may be failing — and a breakout on thin volume is less credible.'
    }
  },
  l3: {
    charts: [[0], [0], [1]],
    notesStep: 1,
    bottomLine: {
      he: 'ממוצע נע הוא מחיר הסגירה הממוצע בחלון קבוע: הקצר (20) עוקב אחרי התנודה הנוכחית, הארוך (150) מתאר את המגמה הרחבה.',
      en: 'A moving average is the average close over a fixed window: the short one (20) tracks the current swing, the long one (150) describes the broad trend.'
    },
    caveat: {
      he: 'בלי מגמה, המחיר חוצה את הממוצע שוב ושוב — וחצייה כזו לא אומרת הרבה.',
      en: 'With no trend, price crosses the average again and again — and those crossings say very little.'
    }
  },
  l4: {
    charts: [[0], [1], [0, 1, 2, 3, 4]],
    bottomLine: {
      he: 'תבנית נרות משמעותית רק בהקשר: איפה היא יושבת ביחס למגמה, ומה המחיר עושה מיד אחריה.',
      en: 'A candlestick pattern only means something in context: where it sits relative to the trend, and what price does right after.'
    },
    caveat: {
      he: 'נר אחד הוא רמז, לא הוכחה — מחכים לאישור בנר הבא או השניים הבאים.',
      en: 'One candle is a hint, not proof — wait for confirmation on the next candle or two.'
    }
  },
  l5: {
    charts: [[0], [0], [1]],
    notesStep: 1,
    bottomLine: {
      he: 'רמות פיבונאצ׳י מסמנות את התיקון כאחוז מהתנועה — 23.6%, 38.2%, 50%, 61.8%, 78.6% — כנקודות ייחוס לעקוב אחריהן.',
      en: 'Fibonacci levels mark a pullback as a percentage of the move — 23.6%, 38.2%, 50%, 61.8%, 78.6% — as reference levels to watch.'
    },
    caveat: {
      he: 'הרמות לא מנבאות כלום; הן "עובדות" בעיקר כי הרבה משתתפים מסתכלים עליהן באותו זמן.',
      en: 'The levels predict nothing; they "work" mostly because many participants are watching the same lines.'
    }
  },
  l6: {
    charts: [[0], [1], [2]],
    bottomLine: {
      he: 'RSI נע בין 0 ל־100: מעל 70 נקרא קניית יתר, מתחת ל־30 מכירת יתר, ו־RSI שנשאר מעל 50 נוטה לתאר מגמת עלייה.',
      en: 'RSI moves between 0 and 100: above 70 is called overbought, below 30 oversold, and an RSI that stays above 50 tends to describe an uptrend.'
    },
    caveat: {
      he: 'קניית יתר היא לא איתות מכירה אוטומטי — RSI מחושב ממחיר שכבר קרה, ובמגמה חזקה 70/30 מתריע מוקדם מדי ותכוף מדי.',
      en: 'Overbought is not an automatic sell signal — RSI is computed from price that already happened, and in a strong trend 70/30 fires too early and too often.'
    }
  },
  l7: {
    charts: [[0], [2], [0, 1, 2, 3, 4]],
    bottomLine: {
      he: 'תבנית גרף היא צורה חוזרת עם תוצאה טיפוסית, לא מובטחת — והיא מאושרת רק כשהמחיר שובר את קו המבנה, כמו קו הצוואר.',
      en: 'A chart pattern is a recurring shape with a typical, not guaranteed, outcome — confirmed only when price breaks its structure line, like the neckline.'
    },
    caveat: {
      he: 'יעד "התנועה הנמדדת" הוא הערכת פתיחה, לא הבטחה — תנועות אמיתיות נופלות ממנו או חורגות ממנו לעיתים קרובות.',
      en: 'A "measured move" target is a starting estimate, not a promise — real moves regularly fall short of it or run past it.'
    }
  }
};

export function workspaceFor(legacyId: string): WorkspacePlan | null {
  return WORKSPACE[legacyId] ?? null;
}

/** The Try step for lessons without a chart exercise: the lesson's own first quiz question. */
export function tryQuestionFor(legacyId: string): QuizQuestion | null {
  return (getQuizQuestions({}) as QuizQuestion[]).find((q) => q.lesson === legacyId) ?? null;
}
