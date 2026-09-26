import { lessonById, trackById } from '@core/curriculum/curriculum';
import type { TrackId } from '@core/curriculum/curriculum';
import { useLang } from '@ui/hooks/useLang';
import { useRoute } from '@ui/hooks/useRoute';
import type { RouteName, RouteParams } from '@ui/hooks/useRoute';
import { Icon } from '@ui/components/icons/Icons';
import { useOpenTutor } from './AiLauncher';
import styles from './PhoneBar.module.css';

const TX = {
  he: { tracks: 'מסלולים', tools: 'כלים', practice: 'תרגול', glossary: 'מילון', tutor: 'מורה AI', trackPractice: 'תרגול מסכם', nextTrack: 'המסלול הבא', summary: 'סיכום', back: (x: string) => `חזרה אל ${x}`,
    toolNames: { position: 'גודל פוזיציה', rr: 'יחס סיכוי-סיכון', compound: 'ריבית דריבית', dcf: 'מודל DCF', pnl: 'רווח והפסד' }, stock: 'ניתוח מניה', compare: 'השוואת מניות' },
  en: { tracks: 'Tracks', tools: 'Tools', practice: 'Practice', glossary: 'Glossary', tutor: 'AI Tutor', trackPractice: 'Track practice', nextTrack: 'Next track', summary: 'Summary', back: (x: string) => `Back to ${x}`,
    toolNames: { position: 'Position size', rr: 'Risk / reward', compound: 'Compound interest', dcf: 'DCF model', pnl: 'Profit & loss' }, stock: 'Stock analysis', compare: 'Compare stocks' }
} as const;

/**
 * The phone's top bar (Artifact 15): a section root shows its name large; an
 * inner page shows the way back (named), its own title, and the tutor. Home
 * keeps the brand bar with language and theme (see Header).
 */
export function PhoneBar() {
  const { lang } = useLang();
  const { route, params, go } = useRoute();
  const openTutor = useOpenTutor();
  const tx = TX[lang];

  // Section roots with a board of their own (15.8 tools, 15.11 tutor) get the large title;
  // practice and glossary open on their own page heading, so they need no bar.
  if (route === 'quiz' || route === 'glossary') return null;
  const rootTitle = route === 'ai' ? tx.tutor : route === 'tools' && !params.view ? tx.tools : null;
  if (rootTitle) return <header className={`${styles.bar} ${styles.root}`}><h1 className={`h2 ${styles.rootTitle}`}>{rootTitle}</h1></header>;

  const trackTitle = (id?: TrackId) => (id ? trackById(id).title[lang] : tx.tracks);
  let back: { label: string; to: RouteName; params?: RouteParams };
  let title = '';
  if (route === 'track') back = { label: tx.tracks, to: 'home' };
  else if (route === 'lesson') { const l = params.lessonId ? lessonById(params.lessonId) : undefined; back = { label: trackTitle(l?.track), to: l ? 'track' : 'home', params: l ? { trackId: l.track } : {} }; }
  else if (route === 'practice') { back = { label: trackTitle(params.trackId), to: 'track', params: { trackId: params.trackId! } }; title = tx.trackPractice; }
  else if (route === 'complete') { back = { label: trackTitle(params.trackId), to: 'track', params: { trackId: params.trackId! } }; title = params.view === 'next' ? tx.nextTrack : tx.summary; }
  else if (route === 'tools') { back = { label: tx.tools, to: 'tools' }; title = tx.toolNames[params.view as keyof typeof tx.toolNames] ?? ''; }
  else if (route === 'stock' || route === 'compare') { back = { label: tx.tools, to: 'tools' }; title = route === 'stock' ? tx.stock : tx.compare; }
  else back = { label: tx.tracks, to: 'home' };

  return (
    <header className={styles.bar}>
      <button type="button" className={styles.back} onClick={() => go(back.to, back.params ?? {})} aria-label={tx.back(back.label)}>
        <Icon name={lang === 'he' ? 'chevR' : 'chevL'} size={18} /><span className={styles.backLabel}>{back.label}</span>
      </button>
      <b className={styles.title}>{title}</b>
      <button type="button" className={`iconBtn ${styles.ai}`} onClick={openTutor} aria-label={tx.tutor}><Icon name="spark" size={16} /></button>
    </header>
  );
}
