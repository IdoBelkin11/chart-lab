import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Lang, LessonProgress, LessonState, Theme } from '@core/types/kb';
import { directionFor, translate } from '@core/i18n/strings';
import type { TranslationKey } from '@core/i18n/strings';
import { browserStorage } from '@core/progress/progress';
import {
  readLearning, writeLearning, toLegacy, lessonStatus, totalCompleted,
  openLesson, reachStep, completeLesson, uncompleteLesson, recordPractice, saveOnboarding
} from '@core/progress/learning';
import type { LearningProgress } from '@core/progress/learning';
import { LEGACY_TO_LESSON } from '@core/curriculum/curriculum';
import type { TrackId } from '@core/curriculum/data';
import type { OnboardingAnswers } from '@core/curriculum/recommend';

/**
 * Application state: language, theme, progress.
 *
 * One provider rather than three, because all three are read together on
 * nearly every screen and all three persist the same way. State lives in one
 * place and every consumer re-renders — there is no "notify everyone that
 * this changed" to forget.
 *
 * PROGRESS has one source of truth: the 47-lesson record (@core/progress/
 * learning). The previous build's 8-lesson view (ids l0…l7) is DERIVED from
 * it, so the screens not yet rebuilt keep working exactly as before while the
 * new ones read the full curriculum.
 */
interface AppState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;

  theme: Theme;
  toggleTheme: () => void;

  learning: LearningProgress;
  learningCompleted: number;
  openLesson: (lessonId: string) => void;
  reachStep: (lessonId: string, step: number) => void;
  completeLesson: (lessonId: string) => void;
  recordPractice: (track: TrackId, correct: number, total: number) => void;
  saveOnboarding: (answers: OnboardingAnswers) => void;

  /** The previous build's view (l0…l7), derived from `learning`. */
  progress: LessonProgress;
  visitLesson: (legacyId: string) => void;
  /** A curriculum id, or an l0…l7 id from the previous build. */
  toggleLessonComplete: (lessonOrLegacyId: string) => void;
  stateOf: (legacyId: string) => LessonState;
  completedCount: number;
}

const AppStateContext = createContext<AppState | null>(null);

const LANG_KEY = 'chartlab.lang';
const THEME_KEY = 'chartlab.theme';

function readStored(key: string): string | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
  } catch {
    return null;
  }
}

function initialLang(): Lang {
  const stored = readStored(LANG_KEY);
  if (stored === 'he' || stored === 'en') return stored;
  // Hebrew-first product: default to Hebrew unless the browser says otherwise.
  if (typeof navigator !== 'undefined' && /^en/i.test(navigator.language ?? '')) return 'en';
  return 'he';
}

function initialTheme(): Theme {
  const stored = readStored(THEME_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  // An explicit earlier choice wins over the OS preference; only fall back to
  // the system setting when the user has never chosen.
  if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  // Reads the v2 record and folds in the previous build's record (a union —
  // completions only accumulate), so nobody's completed lessons are lost.
  const [learning, setLearning] = useState<LearningProgress>(() => readLearning(browserStorage));

  // Language drives both the lang attribute and the document direction — the
  // only place RTL is decided.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = directionFor(lang);
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* storage unavailable — the choice still applies for this session */
    }
  }, [lang]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* as above */
    }
  }, [theme]);

  // Writes v2 AND the previous build's key (as a projection), so a rollback
  // still sees every lesson completed here.
  useEffect(() => {
    writeLearning(browserStorage, learning);
  }, [learning]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const toggleTheme = useCallback(() => setTheme((c) => (c === 'dark' ? 'light' : 'dark')), []);

  const open = useCallback((id: string) => setLearning((p) => openLesson(p, id)), []);
  const step = useCallback((id: string, s: number) => setLearning((p) => reachStep(p, id, s)), []);
  const complete = useCallback((id: string) => setLearning((p) => completeLesson(p, id)), []);
  const practice = useCallback((tr: TrackId, correct: number, total: number) => setLearning((p) => recordPractice(p, tr, correct, total)), []);
  const onboard = useCallback((a: OnboardingAnswers) => setLearning((p) => saveOnboarding(p, a)), []);

  // The previous build's actions, translated onto the curriculum lesson that
  // now carries each old lesson's content.
  const visitLesson = useCallback((legacyId: string) => {
    const id = LEGACY_TO_LESSON[legacyId];
    if (id) setLearning((p) => openLesson(p, id));
  }, []);
  const toggleLessonComplete = useCallback((lessonOrLegacyId: string) => {
    const id = LEGACY_TO_LESSON[lessonOrLegacyId] ?? lessonOrLegacyId;
    setLearning((p) => (p.lessons[id]?.completed ? uncompleteLesson(p, id) : completeLesson(p, id)));
  }, []);

  const progress = useMemo(() => toLegacy(learning), [learning]);

  const value = useMemo<AppState>(
    () => ({
      lang,
      setLang,
      t: (key) => translate(key, lang),
      theme,
      toggleTheme,
      learning,
      learningCompleted: totalCompleted(learning),
      openLesson: open,
      reachStep: step,
      completeLesson: complete,
      recordPractice: practice,
      saveOnboarding: onboard,
      progress,
      visitLesson,
      toggleLessonComplete,
      stateOf: (legacyId) => {
        const id = LEGACY_TO_LESSON[legacyId];
        const st = id ? lessonStatus(learning, id) : 'not-started';
        return st === 'completed' ? 'completed' : st === 'in-progress' ? 'learning' : 'not-started';
      },
      completedCount: progress.completed.length
    }),
    [lang, setLang, theme, toggleTheme, learning, open, step, complete, practice, onboard, progress, visitLesson, toggleLessonComplete]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside <AppStateProvider>');
  return ctx;
}
