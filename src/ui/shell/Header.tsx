import { SlidingPill, useSlidingPill } from '@ui/components/nav/SlidingPill';
import { useLang } from '@ui/hooks/useLang';
import { useTheme } from '@ui/hooks/useTheme';
import { useRoute } from '@ui/hooks/useRoute';
import type { RouteName } from '@ui/hooks/useRoute';
import styles from './Header.module.css';

type ToolKey = 'navStock' | 'navCompare' | 'navCalculators' | 'navQuiz' | 'navGlossary';

/**
 * Tools only. The AI tutor is deliberately NOT here: it has its own fixed
 * launcher (see AiLauncher), which is present on every route and never
 * competes for room in a nav that scrolls horizontally — being first in that
 * scrolling row is exactly how the header entry ended up clipped at the
 * viewport edge.
 */
const TOOLS: Array<{ route: RouteName; key: ToolKey }> = [
  { route: 'stock', key: 'navStock' },
  { route: 'compare', key: 'navCompare' },
  { route: 'calculators', key: 'navCalculators' },
  { route: 'quiz', key: 'navQuiz' },
  // Last in the row: a reference page is something you reach for when stuck,
  // not a step in the course.
  { route: 'glossary', key: 'navGlossary' }
];

/* Inline stroke SVG rather than the ☀ / ☾ characters these replaced: those
   render as colour emoji on several platforms, at a size and weight nothing
   in the CSS can reach. currentColor keeps them in step with the switch. */
function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
         strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.4v2.4M12 19.2v2.4M4.2 12H1.8M22.2 12h-2.4M6.5 6.5 4.8 4.8M19.2 19.2l-1.7-1.7M17.5 6.5l1.7-1.7M4.8 19.2l1.7-1.7" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.5 14.3A8.6 8.6 0 1 1 9.7 3.5a6.9 6.9 0 0 0 10.8 10.8Z" />
    </svg>
  );
}

/**
 * The global header. Present on every route by construction — it is part of
 * the shell, not rendered per page, so it cannot go missing the way it did
 * when feature views were full-screen overlays.
 *
 * It carries only global controls: tools, theme, language. Navigation home
 * belongs to the brand in the rail.
 */
export function Header() {
  const { t, lang, setLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { route, go } = useRoute();

  // The travelling capsule this header introduced now lives in
  // @ui/components/nav/SlidingPill, so the calculator segments, the lesson
  // rail and the language switch move the same way instead of blinking.
  const tools = useSlidingPill<HTMLElement>([route, lang]);
  const langs = useSlidingPill<HTMLDivElement>([lang]);

  return (
    <header className={styles.header}>
      <nav className={styles.tools} aria-label={t('navMenuLabel')} ref={tools.ref}>
        <SlidingPill rect={tools.rect} instant={tools.placed} />
        {TOOLS.map((tool) => (
          <button
            key={tool.route}
            type="button"
            className={route === tool.route ? `${styles.tool} ${styles.toolActive}` : styles.tool}
            data-active={route === tool.route ? 'true' : undefined}
            aria-current={route === tool.route ? 'page' : undefined}
            onClick={() => go(tool.route)}
          >
            {t(tool.key)}
          </button>
        ))}
      </nav>

      <div className={styles.controls}>
        {/* Shaped like a switch, but semantically a button: "switch" announces
            on/off, and light-vs-dark is a choice between two things rather
            than a state being enabled. The aria-label already says what
            pressing it does. */}
        <button
          type="button"
          className={styles.theme}
          data-on={theme === 'light' ? 'true' : undefined}
          onClick={toggleTheme}
          aria-label={t('themeToggleLabel')}
          title={t('themeToggleLabel')}
        >
          <span className={styles.themeThumb} aria-hidden="true">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </span>
        </button>

        {/* The language switch travels too. It is only two items, which is
            exactly where a blink is most noticeable — there is nowhere else for
            the eye to be looking. */}
        <div className={styles.langGroup} role="group" aria-label="Language" ref={langs.ref}>
          <SlidingPill rect={langs.rect} instant={langs.placed} tone="accent" />
          {(['he', 'en'] as const).map((code) => (
            <button
              key={code}
              type="button"
              className={lang === code ? `${styles.lang} ${styles.langActive}` : styles.lang}
              data-active={lang === code ? 'true' : undefined}
              aria-pressed={lang === code}
              onClick={() => setLang(code)}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
