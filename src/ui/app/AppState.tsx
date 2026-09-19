import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Lang, LessonProgress, LessonState, Theme } from '@core/types/kb';
import { directionFor, translate } from '@core/i18n/strings';
import type { TranslationKey } from '@core/i18n/strings';
import {
  browserStorage,
  lessonState,
  markVisited,
  readProgress,
  toggleCompleted,
  writeProgress
} from '@core/progress/progress';

/**
 * Application state: language, theme, progress.
 *
 * One provider rather than three, because all three are read together on
 * nearly every screen and all three persist the same way. The previous build
 * kept each as a separate global with its own persistence code, which is how
 * an open feature view could end up rendering in the old language after a
 * switch — nothing owned "notify everyone that this changed".
 *
 * In React that problem disappears structurally: state lives in one place and
 * every consumer re-renders. There is no lifecycle hook to remember to call.
 */
interface AppState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;

  theme: Theme;
  toggleTheme: () => void;

  progress: LessonProgress;
  visitLesson: (lessonId: string) => void;
  toggleLessonComplete: (lessonId: string) => void;
  stateOf: (lessonId: string) => LessonState;
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
  const [progress, setProgress] = useState<LessonProgress>(() => readProgress(browserStorage));

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

  useEffect(() => {
    writeProgress(browserStorage, progress);
  }, [progress]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const toggleTheme = useCallback(() => setTheme((c) => (c === 'dark' ? 'light' : 'dark')), []);
  const visitLesson = useCallback((id: string) => setProgress((p) => markVisited(p, id)), []);
  const toggleLessonComplete = useCallback(
    (id: string) => setProgress((p) => toggleCompleted(p, id)),
    []
  );

  const value = useMemo<AppState>(
    () => ({
      lang,
      setLang,
      t: (key) => translate(key, lang),
      theme,
      toggleTheme,
      progress,
      visitLesson,
      toggleLessonComplete,
      stateOf: (id) => lessonState(progress, id),
      completedCount: progress.completed.length
    }),
    [lang, setLang, theme, toggleTheme, progress, visitLesson, toggleLessonComplete]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside <AppStateProvider>');
  return ctx;
}
