import { useAppState } from '@ui/app/AppState';

export function useProgress() {
  const { progress, visitLesson, toggleLessonComplete, stateOf, completedCount } = useAppState();
  return { progress, visitLesson, toggleLessonComplete, stateOf, completedCount };
}
