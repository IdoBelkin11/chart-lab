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

  return (
    <header className={styles.header}>
      <nav className={styles.tools} aria-label={t('navMenuLabel')}>
        {TOOLS.map((tool) => (
          <button
            key={tool.route}
            type="button"
            className={route === tool.route ? `${styles.tool} ${styles.toolActive}` : styles.tool}
            aria-current={route === tool.route ? 'page' : undefined}
            onClick={() => go(tool.route)}
          >
            {t(tool.key)}
          </button>
        ))}
      </nav>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.theme}
          onClick={toggleTheme}
          aria-label={t('themeToggleLabel')}
          title={t('themeToggleLabel')}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>

        <div className={styles.langGroup} role="group" aria-label="Language">
          {(['he', 'en'] as const).map((code) => (
            <button
              key={code}
              type="button"
              className={lang === code ? `${styles.lang} ${styles.langActive}` : styles.lang}
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
