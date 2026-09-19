import { useState } from 'react';
import { evaluateGuess, type Exercise, type GuessVerdict } from '@core/lessons/exercises';
import { useLang } from '@ui/hooks/useLang';
import styles from './TryItPanel.module.css';

interface Props {
  exercise: Exercise;
  /** The learner's most recent chart click, in price units. */
  guess: number | null;
  revealed: boolean;
  onToggleReveal: () => void;
}

/**
 * The practice panel beside a lesson chart.
 *
 * Feedback appears only after a guess, and the answer only when the learner
 * asks for it. That order is the point of the exercise: revealing the
 * annotation up front turns "work it out" into "read the answer".
 */
export function TryItPanel({ exercise, guess, revealed, onToggleReveal }: Props) {
  const { lang } = useLang();
  const verdict: GuessVerdict | null = guess == null ? null : evaluateGuess(exercise, guess);

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>{lang === 'he' ? 'נסו בעצמכם' : 'Try it yourself'}</h2>
      <p className={styles.prompt}>{exercise.prompt[lang]}</p>

      {verdict && (
        <p
          className={verdict === 'close' ? styles.good : styles.off}
          role="status"
          aria-live="polite"
        >
          {verdict === 'close' ? exercise.feedbackClose[lang] : exercise.feedbackOff[lang]}
        </p>
      )}

      <button type="button" className={styles.reveal} onClick={onToggleReveal}>
        {revealed
          ? (lang === 'he' ? 'הסתר הערות' : 'Hide annotations')
          : (lang === 'he' ? 'חשוף הערות' : 'Reveal annotations')}
      </button>

      {revealed && (
        <ul className={styles.legend}>
          {exercise.annotations.map((zone) => (
            <li key={zone.tone} className={styles.legendItem}>
              <span
                className={zone.tone === 'support' ? styles.swatchSupport : styles.swatchResistance}
                aria-hidden="true"
              />
              <div>
                <strong className={styles.legendHead}>{zone.label[lang]}</strong>
                <p className={styles.legendBody}>{zone.explanation[lang]}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
