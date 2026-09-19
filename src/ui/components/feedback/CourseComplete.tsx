import { useEffect, useMemo, useRef } from 'react';
import { useLang } from '@ui/hooks/useLang';
import styles from './CourseComplete.module.css';

/**
 * Course completion.
 *
 * Shown once, on demand, when the learner presses Finish on the last lesson
 * with every chapter already complete. Deliberately a modal rather than a
 * banner: finishing the course is the one moment in the product that earns
 * the reader's whole attention, and a strip at the foot of a page would read
 * as another status line.
 *
 * The confetti is plain absolutely-positioned spans driven by CSS keyframes,
 * not a canvas or a library. Reasons, in order: it costs nothing to ship, it
 * cannot drop frames on a weak device the way a per-frame canvas loop can,
 * and — the part that actually matters — it disappears entirely under
 * `prefers-reduced-motion`, which a canvas animation would have to be taught
 * to respect by hand.
 */
const PIECE_COUNT = 36;
const PIECE_TONES = ['action', 'accent', 'success', 'advanced', 'danger'] as const;

export function CourseComplete({
  lessonCount,
  onClose,
  onRestart
}: {
  lessonCount: number;
  onClose: () => void;
  onRestart: () => void;
}) {
  const { lang } = useLang();
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // Generated once per mount: re-rolling these on every render would restart
  // every piece's animation mid-flight.
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECE_COUNT }, (_, i) => ({
        left: (i * 97) % 100,                       // spread without clustering
        delay: (i % 12) * 0.16,
        duration: 2.6 + ((i * 7) % 20) / 10,
        drift: ((i % 5) - 2) * 26,
        tone: PIECE_TONES[i % PIECE_TONES.length],
        round: i % 3 === 0
      })),
    []
  );

  // Escape closes, and focus moves to the dialog — without this the overlay
  // traps a keyboard user behind content they cannot reach.
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const he = lang === 'he';

  return (
    <div className={styles.scrim} role="presentation" onClick={onClose}>
      <div className={styles.confetti} aria-hidden="true">
        {pieces.map((p, i) => (
          <span
            key={i}
            className={p.round ? styles.pieceRound : styles.piece}
            data-tone={p.tone}
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              // Custom property, so the keyframes can read a per-piece
              // horizontal drift instead of every piece falling straight.
              ['--drift' as string]: `${p.drift}px`
            }}
          />
        ))}
      </div>

      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-complete-title"
        // The scrim closes on click; the dialog must not pass its own clicks
        // up to it, or pressing "Keep exploring" would also dismiss.
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.medal} aria-hidden="true">
          <span className={styles.medalGlyph}>🎉</span>
        </div>

        <p className={styles.kicker}>{he ? 'הקורס הושלם' : 'Course complete'}</p>
        <h2 id="course-complete-title" className={styles.title}>
          {he ? 'סיימת את הלימוד הבסיסי' : 'You finished the fundamentals'}
        </h2>
        <p className={styles.body}>
          {he
            ? `כל ${lessonCount} הפרקים מסומנים כהושלמו. אתם יכולים לקרוא גרף: לזהות תמיכה והתנגדות, פריצה וריטסט, ממוצעים נעים, נרות, פיבונאצ׳י, RSI ותבניות גרף — ולדעת מה כל אחד מהם באמת אומר, ומה הוא לא.`
            : `All ${lessonCount} chapters are marked complete. You can read a chart: spot support and resistance, a breakout and its retest, moving averages, candlesticks, Fibonacci, RSI and chart patterns — and know what each one actually says, and what it does not.`}
        </p>

        <div className={styles.statRow}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{lessonCount}</span>
            <span className={styles.statLabel}>{he ? 'פרקים' : 'chapters'}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>19</span>
            <span className={styles.statLabel}>{he ? 'גרפים' : 'charts'}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>24</span>
            <span className={styles.statLabel}>{he ? 'שאלות תרגול' : 'practice questions'}</span>
          </div>
        </div>

        <p className={styles.next}>
          {he
            ? 'מכאן: המשיכו לשאול את המורה בצ׳אט, תרגלו שוב כל פרק, או קחו את הכלים האלה לגרף אמיתי.'
            : 'From here: keep asking the tutor, practise any chapter again, or take these tools to a real chart.'}
        </p>

        <div className={styles.actions}>
          <button ref={closeRef} type="button" className={styles.primary} onClick={onClose}>
            {he ? 'המשך לחקור' : 'Keep exploring'}
          </button>
          <button type="button" className={styles.ghost} onClick={onRestart}>
            {he ? 'חזרה לתחילת הקורס' : 'Back to the start'}
          </button>
        </div>
      </div>
    </div>
  );
}
