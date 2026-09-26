import { useLang } from '@ui/hooks/useLang';
import { useRoute } from '@ui/hooks/useRoute';
import { Icon } from '@ui/components/icons/Icons';
import { useMedia, PHONE } from '@ui/hooks/useMedia';
import type { IconName } from '@ui/components/icons/Icons';
import type { TranslationKey } from '@core/i18n/strings';
import { SECTIONS } from './Header';
import { useOpenTutor } from './AiLauncher';
import styles from './TabBar.module.css';

const ICONS: Record<string, IconName> = { navTracks: 'list', navPractice: 'target', navTools: 'grid' };

/**
 * The phone's bottom navigation (Artifact: .tabbar / .tabItem): Tracks,
 * Practice, Tools and the AI tutor. On a phone the topbar keeps only the
 * brand and the global controls, and the tutor launcher gives way to the
 * tutor tab. Mounted only at phone width.
 */
export function TabBar() {
  const { t } = useLang();
  const { route, go } = useRoute();
  const openTutor = useOpenTutor();
  const phone = useMedia(PHONE);
  if (!phone) return null;
  const tabs = SECTIONS.filter((s) => s.key in ICONS);

  const item = (key: TranslationKey, icon: IconName, on: boolean, onClick: () => void) => (
    <button key={key} type="button" className={on ? `${styles.item} ${styles.on}` : styles.item} aria-current={on ? 'page' : undefined} onClick={onClick}>
      <Icon name={icon} size={20} />
      <span>{t(key)}</span>
    </button>
  );

  return (
    <nav className={`${styles.bar} glass`} aria-label={t('navMainAria')}>
      {tabs.map((s) => item(s.key, ICONS[s.key]!, s.owns.includes(route), () => go(s.route)))}
      {item('navAi', 'spark', route === 'ai', openTutor)}
    </nav>
  );
}
