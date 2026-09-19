import { useState } from 'react';
import type { AnnotationOnly } from '@core/lessons/exercises';
import { useLang } from '@ui/hooks/useLang';
import styles from './TryItPanel.module.css';

/**
 * Reveal-only notes for lessons that teach by pointing rather than by asking.
 *
 * Shares TryItPanel's styling deliberately: the two are the same kind of
 * thing from the learner's side — a companion to the chart that explains what
 * they are looking at. Only the guess step differs.
 */
export function NotesPanel({ annotations }: { annotations: AnnotationOnly }) {
  const { lang } = useLang();
  const [revealed, setRevealed] = useState(false);

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>{lang === 'he' ? 'מה לשים לב' : 'What to notice'}</h2>
      <p className={styles.prompt}>
        {lang === 'he'
          ? 'הסתכלו על הגרף קודם. כשתהיו מוכנים, חשפו את ההערות.'
          : 'Look at the chart first. Reveal the notes when you are ready.'}
      </p>

      <button type="button" className={styles.reveal} onClick={() => setRevealed((r) => !r)}>
        {revealed
          ? (lang === 'he' ? 'הסתר הערות' : 'Hide notes')
          : (lang === 'he' ? 'חשוף הערות' : 'Reveal notes')}
      </button>

      {revealed && (
        <ul className={styles.legend}>
          {annotations.notes.map((note, i) => (
            <li key={i} className={styles.legendItem}>
              <span
                className={
                  note.tone === 'support'
                    ? styles.swatchSupport
                    : note.tone === 'resistance'
                      ? styles.swatchResistance
                      : styles.swatchNeutral
                }
                aria-hidden="true"
              />
              <div>
                <strong className={styles.legendHead}>{note.label[lang]}</strong>
                <p className={styles.legendBody}>{note.explanation[lang]}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
