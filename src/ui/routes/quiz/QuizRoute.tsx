import { useCallback, useState } from 'react';
import {
  createQuizSession, createQuizSessionFromQuestions, currentQuestion,
  submitAnswer, getQuizScore
} from '@core/quiz/engine.js';
import { getQuizQuestions } from '@core/quiz/questions.js';
import { questionsForLesson } from '@core/quiz/topicScoping';
import { lessonById } from '@core/lessons/lessons';
import { useLang } from '@ui/hooks/useLang';
import { useRoute } from '@ui/hooks/useRoute';
import { GlossaryText } from '@ui/components/learning/GlossaryText';
import styles from './QuizRoute.module.css';

interface Feedback { correct: boolean; correctKey: string; explanation: { he: string; en: string } }

/**
 * Practice.
 *
 * When opened from inside a lesson the question set is exactly that lesson's
 * own questions — the lesson id travels in the route, and selection is by
 * the question's own `lesson` field. Opened from the header it is a general
 * quiz over the whole bank.
 *
 * Every screen here offers a way back to the chapter it came from. Without
 * it the quiz was a dead end: the only exits were "try again" and the course
 * home, so a learner who wanted to re-read the lesson they had just been
 * tested on had to navigate the rail from scratch.
 */
export function QuizRoute({ lessonId }: { lessonId?: string }) {
  const { lang } = useLang();
  const { go } = useRoute();

  const lesson = lessonId ? lessonById(lessonId) : undefined;

  const build = useCallback(() => {
    const scoped = lessonId ? questionsForLesson(lessonId, getQuizQuestions({})) : null;
    return scoped && scoped.length
      ? createQuizSessionFromQuestions(scoped, scoped.length)
      : createQuizSession({}, 8);
  }, [lessonId]);

  const [session, setSession] = useState(build);
  const [chosen, setChosen] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  type Q = { question: Record<string, string>; options: Array<{ key: string; text: Record<string, string> }> };

  // The question on screen is held in state rather than read from the
  // session on every render. This is not a preference — it is required for
  // correctness, because `submitAnswer` advances `currentIndex` on the SAME
  // session object, in place. Reading `currentQuestion(session)` during
  // render therefore returned the NEXT question the instant an answer was
  // given: the prompt and all four options swapped out from under the
  // learner while they were still reading the explanation for the one they
  // had just answered, before pressing Next.
  //
  // Holding it here means the view advances only when the learner says so.
  const [shown, setShown] = useState<Q | null>(() => currentQuestion(session) as never as Q | null);
  const [position, setPosition] = useState(1);

  const score = getQuizScore(session);
  const total = session.questions.length;

  const answer = useCallback(
    (key: string) => {
      if (feedback) return;                 // one answer per question
      setChosen(key);
      setFeedback(submitAnswer(session, key) as Feedback);
    },
    [feedback, session]
  );

  const next = useCallback(() => {
    setChosen(null);
    setFeedback(null);
    // NOW pull the question the engine already advanced to.
    setShown(currentQuestion(session) as never as Q | null);
    setPosition((p) => Math.min(p + 1, total));
    setSession({ ...session });
  }, [session, total]);

  // A restart rebuilds from the SAME scope the session was opened with.
  // The engine's own restartQuiz reshuffles the full bank, which silently
  // turned a lesson quiz into a general one on the second attempt.
  const again = useCallback(() => {
    setChosen(null);
    setFeedback(null);
    const fresh = build();
    setSession(fresh);
    setShown(currentQuestion(fresh) as never as Q | null);
    setPosition(1);
  }, [build]);

  const backToLesson = lesson ? (
    <button
      type="button"
      className={styles.ghost}
      onClick={() => go('lesson', { lessonId: lesson.id })}
    >
      {lang === 'he' ? `← חזרה לשיעור: ${lesson.navLabel.he}` : `← Back to lesson: ${lesson.navLabel.en}`}
    </button>
  ) : null;

  // --- results ---
  if (!shown) {
    const pct = score.percent;
    const perfect = score.total > 0 && score.correct === score.total;
    return (
      <div className={styles.page}>
        <div className={styles.results}>
          <p className={styles.resultsKicker}>
            {perfect
              ? (lang === 'he' ? 'ללא טעויות' : 'Flawless')
              : (lang === 'he' ? 'סיימת' : 'Finished')}
          </p>
          <p className={styles.resultsScore}>
            {score.correct}<span>/{score.total}</span>
          </p>
          <div className={styles.resultsTrack}>
            <span style={{ width: `${pct}%` }} data-good={pct >= 70} />
          </div>
          <p className={styles.resultsNote}>
            {pct >= 70
              ? (lang === 'he' ? 'שליטה טובה בחומר.' : 'Solid grasp of the material.')
              : (lang === 'he' ? 'שווה לחזור על הפרק ולנסות שוב.' : 'Worth revisiting the lesson and trying again.')}
          </p>
          <div className={styles.resultsActions}>
            <button type="button" className={styles.primary} onClick={again}>
              {lang === 'he' ? 'נסה שוב' : 'Try again'}
            </button>
            {backToLesson}
            <button type="button" className={styles.ghost} onClick={() => go('home')}>
              {lang === 'he' ? 'חזרה לקורס' : 'Back to the course'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div className={styles.progressRow}>
          <div className={styles.track}>
            <span style={{ width: `${(position / total) * 100}%` }} />
          </div>
          <span className={styles.position}>{position}/{total}</span>
        </div>
        {lesson && (
          <p className={styles.scope}>
            {lang === 'he' ? `תרגול: ${lesson.navLabel.he}` : `Practice: ${lesson.navLabel.en}`}
          </p>
        )}
      </div>

      <h1 className={styles.question}>{shown.question[lang]}</h1>

      <ul className={styles.options} aria-label={lang === 'he' ? 'תשובות' : 'Answers'}>
        {shown.options.map((opt) => {
          const isChosen = chosen === opt.key;
          const isCorrect = feedback && opt.key === feedback.correctKey;
          const isWrong = feedback && isChosen && !feedback.correct;
          return (
            <li key={opt.key}>
              <button
                type="button"
                className={[
                  styles.option,
                  isCorrect ? styles.correct : '',
                  isWrong ? styles.wrong : ''
                ].join(' ')}
                onClick={() => answer(opt.key)}
                disabled={!!feedback}
                aria-pressed={isChosen}
              >
                <span className={styles.key} aria-hidden="true">{opt.key.toUpperCase()}</span>
                <span className={styles.optionText}>{opt.text[lang]}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {feedback && (
        <div className={feedback.correct ? styles.feedbackGood : styles.feedbackBad} role="status">
          <p className={styles.verdict}>
            {feedback.correct
              ? (lang === 'he' ? 'נכון' : 'Correct')
              : (lang === 'he' ? 'לא נכון' : 'Not quite')}
          </p>
          <p className={styles.explanation}>
            <GlossaryText text={feedback.explanation[lang]} />
          </p>
          <button type="button" className={styles.primary} onClick={next}>
            {position >= total
              ? (lang === 'he' ? 'לתוצאות' : 'See results')
              : (lang === 'he' ? 'הבא' : 'Next')}
          </button>
        </div>
      )}

      {/* Always available, not only at the end: a learner who realises
          mid-quiz that they need to re-read should not have to finish first. */}
      {backToLesson && <div className={styles.exitRow}>{backToLesson}</div>}
    </div>
  );
}
