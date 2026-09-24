// ---------------------------------------------------------------------------
// "Try it yourself" exercises.
//
// The learner clicks the chart to guess where a level sits, gets immediate
// feedback, and can then reveal the annotated answer.
//
// Modelled as DATA plus one pure function, rather than as per-lesson
// imperative code. In the previous build each exercise was a bespoke
// `renderL1()`-style function that read checkbox state out of the DOM and
// wrote results back into it, which is why adding an exercise meant writing
// another one of those by hand and why none of it could be tested without a
// browser.
//
// Here `evaluateGuess` is the whole scoring rule, and a new exercise is one
// entry in EXERCISES.
// ---------------------------------------------------------------------------
import type { Localized } from '@core/types/kb';

export interface AnnotationZone {
  /** Price range the zone covers: [low, high]. */
  range: [number, number];
  /** Which semantic colour this carries. */
  tone: 'support' | 'resistance';
  label: Localized;
  /** Shown once the answer is revealed. */
  explanation: Localized;
}

export interface Exercise {
  lessonId: string;
  prompt: Localized;
  /** The zone the learner is asked to find. */
  target: [number, number];
  /**
   * How close counts as right, in price units.
   *
   * Deliberately generous: the teaching point is "this area matters", not
   * pixel accuracy. A tolerance tight enough to be impressive would punish
   * someone who understood the concept perfectly well.
   */
  tolerance: number;
  feedbackClose: Localized;
  feedbackOff: Localized;
  /** Revealed on demand, never shown before the learner has tried. */
  annotations: AnnotationZone[];
}

export const EXERCISES: Record<string, Exercise> = {
  l1: {
    lessonId: 'l1',
    prompt: {
      he: 'לחצו על הגרף במקום שבו לדעתכם נמצא אזור התמיכה.',
      en: 'Click on the chart where you think the support zone is.'
    },
    target: [163, 168],
    tolerance: 10,
    feedbackClose: {
      he: 'קרוב — זה מתיישב עם המקום שבו המחיר באמת קפץ.',
      en: "Close — that lines up with where price actually bounced."
    },
    feedbackOff: {
      he: "לא בדיוק באזור הזה. לחצו על 'חשוף הערות' כדי לראות איפה.",
      en: "Not quite that area. Hit 'Reveal annotations' to see where."
    },
    annotations: [
      {
        range: [163, 168],
        tone: 'support',
        label: { he: 'אזור תמיכה (כ-165$)', en: 'Support zone (~$165)' },
        explanation: {
          he: 'המחיר הגיב מהאזור הזה שלוש פעמים נפרדות, ובכל פעם מצא קונים לפני רגל עלייה חדשה.',
          en: 'Price reacted from this area three separate times, each time finding buyers before a new leg up.'
        }
      },
      {
        range: [192, 196],
        tone: 'resistance',
        label: { he: 'אזור התנגדות (כ-194$)', en: 'Resistance zone (~$194)' },
        explanation: {
          he: 'באזור הזה המוכרים גברו שוב ושוב, והמחיר נעצר לפני שהמשיך למעלה.',
          en: 'Sellers repeatedly took over in this area, stalling price before it could push higher.'
        }
      }
    ]
  }
};

export function exerciseFor(lessonId: string): Exercise | null {
  return EXERCISES[lessonId] ?? null;
}

export type GuessVerdict = 'close' | 'off';

/**
 * Scores a guess against the target zone.
 *
 * Distance is measured to the NEAREST EDGE of the zone, not to its midpoint:
 * a support "zone" is an area, so clicking anywhere inside it is exactly
 * right, and the previous midpoint-based check unfairly penalised a correct
 * click near the zone's edge.
 */
export function evaluateGuess(exercise: Exercise, guessedPrice: number): GuessVerdict {
  const [low, high] = exercise.target;
  if (guessedPrice >= low && guessedPrice <= high) return 'close';
  const distance = guessedPrice < low ? low - guessedPrice : guessedPrice - high;
  return distance <= exercise.tolerance ? 'close' : 'off';
}

/**
 * Annotation-only lessons.
 *
 * Not every chapter asks the learner to guess. l2, l3 and l5 teach by
 * pointing at what already happened on the chart, so they get the reveal
 * step without the guess step — which is exactly how the previous build
 * worked. Inventing a guess prompt and feedback copy for them would be
 * authoring teaching material the product never had.
 */
export interface AnnotationOnly {
  lessonId: string;
  notes: Array<{ tone: 'support' | 'resistance' | 'neutral'; label: Localized; explanation: Localized }>;
}

export const ANNOTATION_LESSONS: Record<string, AnnotationOnly> = {
  l2: {
    lessonId: 'l2',
    notes: [
      { tone: 'resistance', label: { he: 'פריצה', en: 'Breakout' }, explanation: { he: 'המחיר נסגר מעל אזור ה-140$ עם קפיצת נפח — סימן שיותר משתתפים מהרגיל הסכימו שהרמה צריכה להישבר.', en: 'Price closes above the ~$140 zone on a volume spike — a sign that more participants than usual agreed the level should give way.' } },
      { tone: 'support', label: { he: 'בדיקה חוזרת (ריטסט)', en: 'Retest' }, explanation: { he: 'כמה מפגשים לאחר מכן, המחיר יורד חזרה לאזור ה-140$, מוצא קונים, וממשיך את התנועה — התקרה הישנה משמשת כעת כרצפה.', en: 'A few sessions later, price dips back to the ~$140 area, finds buyers, and resumes the move — the old ceiling now acting as a floor.' } }
    ]
  },
  l3: {
    lessonId: 'l3',
    notes: [
      { tone: 'neutral', label: { he: 'ממוצע נע 20 — הדופק לטווח הקצר', en: '20 EMA — the short-term pulse' }, explanation: { he: 'מכסה בערך חודש של מסחר. הוא מהיר מספיק כדי להיצמד למחיר האחרון, ולכן סוחרי סווינג לרוב מחפשים ירידה לכיוון ה-20 — וקפיצה ממנו — כאזור כניסה גס בתוך מגמת עלייה, במקום שבירה מתחתיו. אותה מהירות גם גורמת לו להתנדנד יותר קדימה ואחורה בתקופות תנודתיות וחסרות כיוון.', en: "Covers roughly a month of trading. It's fast enough to hug recent price closely, which is why swing traders often watch for a pullback toward the 20 — and a bounce off it — as a rough entry area within an uptrend, rather than a break below it. That same speed means it also whips back and forth more in choppy, directionless stretches." } },
      // The 150 is the other line actually drawn on this chart, and the
      // lesson's "worth knowing" text already discusses it — leaving it out
      // of the legend meant the teal line on screen was unexplained.
      { tone: 'neutral', label: { he: 'ממוצע נע 150 — שלד המגמה הארוכה', en: '150 SMA — the long-trend backbone' }, explanation: { he: 'מכסה בערך שבעה חודשי מסחר, ולכן הוא מתעלם כמעט לגמרי מרעש יומי ומתאר את כיוון המגמה הרחבה. שימו לב שהוא מתחיל מאוחר יותר על הגרף: אי אפשר לחשב ממוצע של 150 יום לפני שיש 150 יום של נתונים. כל עוד המחיר מחזיק מעליו והוא עצמו עולה, מבנה מגמת העלייה הארוכה שלם — וכששני הממוצעים מתרחקים זה מזה, זה מראה שהתנועה הקצרה מקדימה את המגמה הארוכה, לא שהיא מחליפה אותה.', en: "Covers roughly seven months of trading, so it ignores day-to-day noise almost entirely and describes the direction of the broad trend. Notice it starts later on the chart: you cannot compute a 150-day average before 150 days of data exist. As long as price holds above it and the line itself is rising, the long uptrend structure is intact — and when the two averages spread apart, that shows the short-term move running ahead of the long trend, not replacing it." } }
    ]
  },
  l5: {
    lessonId: 'l5',
    notes: [
      { tone: 'support', label: { he: 'התיקון הזה נעצר בקרבת 61.8%', en: 'This pullback stalled near 61.8%' }, explanation: { he: 'המחיר תיקן כלפי מטה דרך הרמות הרדודות יותר ומצא קונים בקרבת קו ה-61.8%, ואז חידש את מגמת העלייה המקורית. זו תוצאה נפוצה — לא כלל שהשוק חייב לציית לו.', en: "Price retraced down through the shallower levels and found buyers close to the 61.8% line, then resumed the original uptrend. That's a common outcome — not a rule the market has to obey." } },
      { tone: 'neutral', label: { he: 'אל תקראו את זה הפוך', en: "Don't read this backwards" }, explanation: { he: 'פיבונאצ׳י לא גרם לקפיצה, והוא גם לא מנבא את הבאה. זו דרך לתאר איפה קרתה תגובה בדיעבד, ורמה ששווה לעקוב אחריה בפעם הבאה.', en: "Fibonacci didn't cause the bounce, and it doesn't forecast the next one. It's a way to describe where a reaction happened after the fact, and a level worth watching next time." } }
    ]
  }
};

export function annotationsFor(lessonId: string): AnnotationOnly | null {
  return ANNOTATION_LESSONS[lessonId] ?? null;
}
