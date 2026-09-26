// ---------------------------------------------------------------------------
// The onboarding recommendation: four answers in, one track out.
//
// The rules are the approved design's (the "המסלול מתגבש" panel and the live
// prototype run exactly this function), so what the learner saw while
// answering is what they get:
//
//   · each chosen interest adds 3 to its track ("options" adds 2 to Risk —
//     derivatives are locked behind it, so Risk is the way there)
//   · the goal adds its own weights
//   · ties keep the order P, R, T, M
//   · experience decides only whether Foundations is required, recommended,
//     or can be skipped with a 5-question test — never which track wins
//   · weekly time turns each track's minutes into weeks
// ---------------------------------------------------------------------------
import type { Localized } from '@core/types/kb';
import type { TrackId } from './data';
import { TRACKS, trackMinutes } from './curriculum';

export type Interest = 'T' | 'P' | 'R' | 'M' | 'D' | 'unsure';
export type Experience = 'none' | 'some' | 'pro';
export type Goal = 'pension' | 'invest' | 'charts' | 'curious';
export type WeeklyMinutes = 15 | 30 | 60;

export interface OnboardingAnswers {
  interests: Interest[];
  experience: Experience | null;
  goal: Goal | null;
  time: WeeklyMinutes | null;
}

type Scored = 'P' | 'R' | 'T' | 'M';
const ORDER: readonly Scored[] = ['P', 'R', 'T', 'M'];

export const INTERESTS: ReadonlyArray<{ id: Interest; title: Localized; sub: Localized }> = [
  { id: 'T', title: { he: 'לקרוא גרפים', en: 'Reading charts' }, sub: { he: 'מגמות, תמיכה והתנגדות, אינדיקטורים', en: 'Trends, support and resistance, indicators' } },
  { id: 'P', title: { he: 'להבין חברות', en: 'Understanding companies' }, sub: { he: 'דוחות, רווחיות, מכפילים, שווי', en: 'Statements, profitability, multiples, value' } },
  { id: 'R', title: { he: 'לבנות תיק לטווח ארוך', en: 'Building a long-term portfolio' }, sub: { he: 'פיזור, סיכון, הפקדה קבועה', en: 'Diversification, risk, regular saving' } },
  { id: 'M', title: { he: 'להבין כלכלה וריבית', en: 'Economics and interest rates' }, sub: { he: 'אינפלציה, אג״ח, מחזורי שוק', en: 'Inflation, bonds, market cycles' } },
  { id: 'D', title: { he: 'אופציות ומינוף', en: 'Options and leverage' }, sub: { he: 'נפתח אחרי מסלול הסיכון', en: 'Opens after the Risk track' } },
  { id: 'unsure', title: { he: 'עוד לא בטוחים', en: 'Not sure yet' }, sub: { he: 'נתחיל מהבסיס ונראה מה מושך', en: "We'll start with the basics and see" } }
];

export const EXPERIENCE: ReadonlyArray<{ id: Experience; title: Localized }> = [
  { id: 'none', title: { he: 'עוד לא השקעתי אף פעם', en: "I've never invested" } },
  { id: 'some', title: { he: 'השקעתי קצת, בלי להבין עד הסוף', en: "I've invested a little, without fully understanding it" } },
  { id: 'pro', title: { he: 'כבר קורא/ת גרפים או דוחות כספיים', en: 'I already read charts or financial statements' } }
];

export const GOALS: Readonly<Record<Goal, { title: Localized; weights: Partial<Record<Scored, number>>; why: Partial<Record<Scored, Localized>> }>> = {
  pension: {
    title: { he: 'להבין מה יש לי בתיק ובפנסיה', en: "Understand what's in my portfolio and pension" },
    weights: { R: 2, P: 1 },
    why: {
      R: { he: 'רוב מה שיש בפנסיה ובקרנות הוא הקצאה ופיזור — בדיוק מה שהמסלול מלמד.', en: 'Most of what sits in a pension or a fund is allocation and diversification — exactly what this track teaches.' },
      P: { he: 'כדי לדעת מה מחזיקים, צריך לדעת לקרוא חברה.', en: 'To know what you hold, you need to be able to read a company.' }
    }
  },
  invest: {
    title: { he: 'להתחיל להשקיע בעצמי, בזהירות', en: 'Start investing myself, carefully' },
    weights: { P: 2, R: 2 },
    why: {
      P: { he: 'להשקיע בעצמכם מתחיל בלהבין מה בדיוק קונים.', en: 'Investing on your own starts with understanding exactly what you are buying.' },
      R: { he: 'בזהירות = לדעת כמה אפשר להפסיד לפני שנכנסים.', en: 'Carefully means knowing how much you could lose before you go in.' }
    }
  },
  charts: {
    title: { he: 'ללמוד לקרוא גרפים ותנועות מחיר', en: 'Learn to read charts and price moves' },
    weights: { T: 3 },
    why: { T: { he: 'זו בדיוק המטרה של המסלול: לקרוא מה הגרף אומר לפני שפועלים.', en: 'That is exactly what this track is for: reading what the chart says before acting on it.' } }
  },
  curious: {
    title: { he: 'סקרנות — בלי תוכנית להשקיע כרגע', en: 'Curiosity — no plan to invest right now' },
    weights: { M: 2, P: 1 },
    why: {
      M: { he: 'המסלול שמסביר את הכותרות: ריבית, אינפלציה ומיתון.', en: 'The track that explains the headlines: rates, inflation and recession.' },
      P: { he: 'הדרך הכי ישירה להבין מה עושות החברות שבחדשות.', en: 'The most direct way to understand what the companies in the news actually do.' }
    }
  }
};

export const WEEKLY: ReadonlyArray<{ minutes: WeeklyMinutes; title: Localized; sub: Localized }> = [
  { minutes: 15, title: { he: '15 דקות', en: '15 minutes' }, sub: { he: 'שיעור אחד בשבוע', en: 'One lesson a week' } },
  { minutes: 30, title: { he: '30 דקות', en: '30 minutes' }, sub: { he: 'שניים–שלושה שיעורים', en: 'Two or three lessons' } },
  { minutes: 60, title: { he: 'שעה ומעלה', en: 'An hour or more' }, sub: { he: 'מסלול שלם בחודש', en: 'A whole track in a month' } }
];

/** Why a track suits someone, independent of the answers. */
export const TRACK_WHY: Readonly<Record<Scored, Localized>> = {
  P: { he: 'מדוחות כספיים ועד הערכת שווי משלכם — מאיפה מגיע המחיר של חברה.', en: 'From financial statements to your own valuation — where a company’s price comes from.' },
  T: { he: 'לקרוא מה הגרף אומר: מגמה, רמות, מומנטום — ומתי לא לסמוך עליו.', en: 'Reading what the chart says: trend, levels, momentum — and when not to trust it.' },
  R: { he: 'תיק שמחזיק מעמד גם בשנה רעה: גודל פוזיציה, פיזור והטיות.', en: 'A portfolio that holds up in a bad year: position sizing, diversification and biases.' },
  M: { he: 'ריבית, אינפלציה ומחזורים — ואיך הם זזים את כל השוק ביחד.', en: 'Rates, inflation and cycles — and how they move the whole market together.' }
};

export type BaseAdvice = 'required' | 'recommended' | 'optional';

export interface Recommendation {
  /** Score per scorable track (the "path is taking shape" bars). */
  scores: Record<Scored, number>;
  /** Scorable tracks, best first. `order[0]` is the recommendation. */
  order: Scored[];
  top: Scored;
  /** How Foundations fits in, from the experience answer. */
  base: BaseAdvice;
  /** Weeks each track takes at the chosen pace. */
  weeks: Record<TrackId, number>;
  /** They asked for options; derivatives stay locked behind Risk. */
  wantsDerivatives: boolean;
}

export function recommend(a: OnboardingAnswers): Recommendation {
  const scores: Record<Scored, number> = { P: 0, R: 0, T: 0, M: 0 };
  for (const k of a.interests) {
    if (k === 'D') scores.R += 2;
    else if (k !== 'unsure') scores[k] += 3;
  }
  const g = a.goal ? GOALS[a.goal] : null;
  if (g) for (const [k, w] of Object.entries(g.weights) as Array<[Scored, number]>) scores[k] += w;
  const order = [...ORDER].sort((x, y) => scores[y] - scores[x]); // stable → ties keep P, R, T, M
  const pace = a.time ?? 30;
  const weeks = Object.fromEntries(TRACKS.map((t) => [t.id, Math.max(1, Math.ceil(trackMinutes(t.id) / pace))])) as Record<TrackId, number>;
  return {
    scores,
    order,
    top: order[0]!,
    base: a.experience === 'pro' ? 'optional' : a.experience === 'some' ? 'recommended' : 'required',
    weeks,
    wantsDerivatives: a.interests.includes('D')
  };
}

/** The ordered path the roadmap shows: Foundations (unless skippable), the ranked tracks, then Derivatives. */
export function pathFor(a: OnboardingAnswers): TrackId[] {
  const r = recommend(a);
  return [...(r.base === 'optional' ? [] : (['F'] as TrackId[])), ...r.order, 'D'];
}
