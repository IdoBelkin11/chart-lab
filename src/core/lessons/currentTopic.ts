// ---------------------------------------------------------------------------
// Canonical current-topic resolution.
//
// The bug this exists to prevent: several features each kept their own idea
// of "the topic the user is on" — the lesson pager had one, the AI tutor
// kept conversation context, the quiz read whatever was set last. When they
// drifted, "Practice this" opened a quiz for a topic the learner had left
// minutes earlier.
//
// Priority, highest first:
//   1. EXPLICIT — the caller names a lesson, because the user just acted on
//      something specific (clicked Practice inside a lesson).
//   2. ACTIVE ROUTE — a lesson is open; that is the topic, full stop.
//   3. LAST VISITED — only when no lesson is open at all, e.g. acting from
//      the dashboard.
//
// This is a PURE FUNCTION over explicit inputs. The previous implementation
// read the active lesson out of the DOM (`document.querySelector('.lesson-active')`),
// which worked but made the rule untestable without a browser and coupled a
// core decision to markup. Routing state is passed in instead.
// ---------------------------------------------------------------------------
import { LESSONS, lessonById, isLessonId } from './lessons';
import type { CurrentTopic, Lang, LessonProgress } from '@core/types/kb';

export interface TopicResolutionInput {
  /** A lesson the caller is explicitly acting on. Wins over everything. */
  explicitLessonId?: string | null;
  /** The lesson currently open, from routing state. */
  activeLessonId?: string | null;
  /** Persisted progress, for the fallback. */
  progress?: Pick<LessonProgress, 'lastVisited'> | null;
  lang: Lang;
}

export function resolveCurrentTopic(input: TopicResolutionInput): CurrentTopic | null {
  const { explicitLessonId, activeLessonId, progress, lang } = input;

  if (isLessonId(explicitLessonId)) {
    return describe(explicitLessonId!, 'explicit', lang);
  }
  if (isLessonId(activeLessonId)) {
    return describe(activeLessonId!, 'active-lesson', lang);
  }
  const last = progress?.lastVisited ?? null;
  if (isLessonId(last)) {
    return describe(last!, 'last-visited', lang);
  }
  return null;
}

function describe(lessonId: string, source: CurrentTopic['source'], lang: Lang): CurrentTopic {
  const lesson = lessonById(lessonId)!;
  return {
    lessonId,
    index: lesson.index,
    source,
    label: lesson.navLabel[lang],
    kbTopicId: lesson.kbTopicId,
    followupTopicId: lesson.followupTopicId
  };
}

/** The next lesson to do: the first not yet completed, else null (course done). */
export function nextLessonId(completed: readonly string[]): string | null {
  return LESSONS.find((l) => !completed.includes(l.id))?.id ?? null;
}
