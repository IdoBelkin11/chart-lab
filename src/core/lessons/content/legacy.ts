// ---------------------------------------------------------------------------
// The previous build's eight lessons, expressed in the content model.
//
// An adapter, not a rewrite: the authored prose, charts, notes, activities
// and questions stay in their own modules exactly as written, and this maps
// them onto the three teaching steps (decided 2026-09-25):
//   1  the lesson's own title          · intro
//   2  "Worth knowing"                 · deeper
//   3  "A couple more terms" (extra) / "What to notice" (notes) / the chart's caption
// ---------------------------------------------------------------------------
import type { Localized, QuizQuestion } from '@core/types/kb';
import { chartsForLesson } from '@core/charts/lessonCharts';
import { getQuizQuestions } from '@core/quiz/questions.js';
import { LEGACY_TO_LESSON } from '@core/curriculum/curriculum';
import { lessonById as legacyLesson } from '../lessons';
import { proseFor } from '../prose';
import { annotationsFor } from '../exercises';
import { workspaceFor } from '../workspace';
import { F1_CONCEPTS, activityFor } from '../activities';
import type { LessonContent, TeachStep, Work } from './types';

const WORTH: Localized = { he: 'כדאי לדעת', en: 'Worth knowing' };
const TERMS: Localized = { he: 'מושגים נוספים', en: 'A couple more terms' };
const NOTICE: Localized = { he: 'מה לשים לב', en: 'What to notice' };

export function legacyContent(legacyId: string): LessonContent | null {
  const lesson = legacyLesson(legacyId);
  const prose = proseFor(legacyId);
  const plan = workspaceFor(legacyId);
  const curriculumId = LEGACY_TO_LESSON[legacyId];
  if (!lesson || !prose || !plan || !curriculumId) return null;
  const charts = chartsForLesson(legacyId);
  const notes = annotationsFor(legacyId)?.notes;
  const work = (k: 0 | 1 | 2): Work => (plan.charts[k].length ? { kind: 'charts', charts: plan.charts[k] } : plan.concepts ? { kind: 'cards' } : { kind: 'none' });
  const withNotes = (k: 1 | 2): Partial<TeachStep> => (plan.notesStep === k && notes ? { notes } : {});
  const third = charts[plan.charts[2][0] ?? -1];
  const activity = activityFor(legacyId);
  return {
    id: curriculumId,
    legacyId,
    tutor: { topic: lesson.kbTopicId, label: lesson.navLabel },
    teach: [
      { heading: lesson.title, paragraphs: [prose.intro], work: work(0) },
      { heading: WORTH, paragraphs: [prose.deeper], work: work(1), ...withNotes(1) },
      {
        heading: prose.extra ? TERMS : plan.notesStep === 2 ? NOTICE : third?.caption ?? TERMS,
        paragraphs: prose.extra ? [prose.extra] : third?.subcaption ? [third.subcaption] : [],
        work: work(2),
        ...withNotes(2)
      }
    ],
    charts,
    ...(plan.concepts ? { cards: [...F1_CONCEPTS] } : {}),
    ...(activity ? { activity } : {}),
    takeaway: { bottomLine: plan.bottomLine, caveat: plan.caveat },
    questions: (getQuizQuestions({}) as QuizQuestion[]).filter((q) => q.lesson === legacyId)
  };
}
