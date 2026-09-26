import { TOTAL_LESSONS } from '@core/curriculum/curriculum';
import { useAppState } from '@ui/app/AppState';
import { useLang } from '@ui/hooks/useLang';
import { useTheme } from '@ui/hooks/useTheme';
import { useRoute } from '@ui/hooks/useRoute';
import type { RouteName } from '@ui/hooks/useRoute';
import type { TranslationKey } from '@core/i18n/strings';
import { Icon } from '@ui/components/icons/Icons';
import { useMedia, PHONE } from '@ui/hooks/useMedia';
import { PhoneBar } from './PhoneBar';
import styles from './Header.module.css';

/**
 * The top-level sections, as the approved design names them. A section owns
 * several routes: Tools covers the calculators AND the stock lookup and the
 * comparison (decided 2026-09-25 — the stock page is a card in Tools), so the
 * tab stays lit on all three.
 */
export const SECTIONS: Array<{ key: TranslationKey; route: RouteName; owns: RouteName[] }> = [
  { key: 'navTracks', route: 'home', owns: ['home', 'track', 'lesson', 'complete'] },
  { key: 'navPractice', route: 'quiz', owns: ['quiz', 'practice'] },
  { key: 'navTools', route: 'tools', owns: ['tools', 'stock', 'compare'] },
  { key: 'navGlossary', route: 'glossary', owns: ['glossary'] }
];

/**
 * The global topbar — a glass capsule present on every route, because it is
 * part of the shell rather than of a page.
 *
 * It carries the brand (the one way home), the four sections, and the global
 * controls: progress, language, theme. The AI tutor is NOT a tab here: it has
 * its own launcher, reachable from every screen (see AiLauncher).
 */
export function Header() {
  const { t, lang, setLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { learningCompleted: completedCount } = useAppState();
  const { route, go } = useRoute();
  const total = TOTAL_LESSONS;
  const pct = Math.round((completedCount / total) * 100);
  const phone = useMedia(PHONE);

  // Phone: home keeps this brand bar; every other screen gets its own bar (Artifact 15).
  if (phone && route !== 'home') return <PhoneBar />;

  return (
    <header className={`${styles.topbar} glass`}>
      <nav className={styles.nav} aria-label={t('navMainAria')}>
        <a
          className={styles.brand}
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            go('home');
          }}
          aria-label={t('brandHomeAria')}
        >
          <span className={styles.brandMark} aria-hidden="true">▼▲</span>
          <span className={styles.brandName}>{t('brandName')}</span>
        </a>
        <span className={styles.sep} aria-hidden="true" />
        {SECTIONS.map((s) => {
          const on = s.owns.includes(route);
          return (
            <a
              key={s.key}
              className={on ? `${styles.tab} ${styles.tabOn}` : styles.tab}
              href={`#/${s.route === 'home' ? '' : s.route}`}
              aria-current={on ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault();
                go(s.route);
              }}
            >
              {t(s.key)}
            </a>
          );
        })}
      </nav>

      <div className={styles.ctrls}>
        <span className={styles.progress} title={t('progressChipAria')}>
          <span className="ring" style={{ ['--p' as string]: pct, width: 28, height: 28 }} aria-hidden="true">
            <span style={{ width: 20, height: 20 }} />
          </span>
          <b className="n">{completedCount}/{total}</b>
          <span>{t('progressChipLessons')}</span>
        </span>

        {/* Two languages, two buttons — the one in use is pressed. Each label is
            the language's own short name, marked with its own `lang`. */}
        <div className="seg" role="group" aria-label={t('langGroupAria')}>
          {(['he', 'en'] as const).map((code) => (
            <button
              key={code}
              type="button"
              lang={code}
              aria-pressed={lang === code}
              onClick={() => setLang(code)}
            >
              {code === 'he' ? 'עב' : 'EN'}
            </button>
          ))}
        </div>

        <div className="seg" role="group" aria-label={t('themeGroupAria')}>
          {(['dark', 'light'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={theme === mode}
              aria-label={t(mode === 'dark' ? 'themeDark' : 'themeLight')}
              title={t(mode === 'dark' ? 'themeDark' : 'themeLight')}
              onClick={() => {
                if (theme !== mode) toggleTheme();
              }}
            >
              <Icon name={mode === 'dark' ? 'moon' : 'sun'} size={15} />
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
