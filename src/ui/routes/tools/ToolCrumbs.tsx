import { useAppState } from '@ui/app/AppState';
import { useRoute } from '@ui/hooks/useRoute';
import { Icon } from '@ui/components/icons/Icons';
import styles from './ToolCrumbs.module.css';

/** "Tools › <this tool>" — every tool page, including stock lookup and compare, sits under the Tools hub. */
export function ToolCrumbs({ here }: { here?: string }) {
  const { lang } = useAppState();
  const { go } = useRoute();
  const tools = lang === 'he' ? 'כלים' : 'Tools';
  return (
    <nav className={styles.crumbs} aria-label={lang === 'he' ? 'פירורי לחם' : 'Breadcrumb'}>
      {here ? <a href="#/tools" onClick={(e) => { e.preventDefault(); go('tools'); }}>{tools}</a> : <span aria-current="page">{tools}</span>}
      {here && <><Icon name={lang === 'he' ? 'chevL' : 'chevR'} size={13} /><span aria-current="page">{here}</span></>}
    </nav>
  );
}
