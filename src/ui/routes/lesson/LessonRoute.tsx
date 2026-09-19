import { useCallback, useEffect, useMemo, useState } from 'react';
import { LESSONS, lessonById } from '@core/lessons/lessons';
import { useLang } from '@ui/hooks/useLang';
import { useProgress } from '@ui/hooks/useProgress';
import { useRoute } from '@ui/hooks/useRoute';
import { chartsForLesson } from '@core/charts/lessonCharts';
import { proseFor } from '@core/lessons/prose';
import { annotationsFor, exerciseFor } from '@core/lessons/exercises';
import { TryItPanel } from '@ui/components/learning/TryItPanel';
import { NotesPanel } from '@ui/components/learning/NotesPanel';
import { GlossarySegments } from '@ui/components/learning/GlossaryText';
import { highlightGlossaryGroup } from '@core/glossary/highlight';
import { ChartCard } from '@ui/components/charts';
import { CourseComplete } from '@ui/components/feedback/CourseComplete';
import { hasLessonQuiz } from '@core/quiz/topicScoping';
import { getQuizQuestions } from '@core/quiz/questions.js';
import styles from './LessonRoute.module.css';

/**
 * A lesson.
 *
 * All content is shown at once — there is no gated "Continue" walkthrough.
 * That was tried and removed: it made reading a lesson feel like clicking
 * through a slideshow, and the rail already provides the sense of place.
 * Content is still grouped into visual bands so the chart gets its own
 * workspace, but nothing is hidden behind a click.
 */
export function LessonRoute({ lessonId }: { lessonId: string }) {
  const { t, lang } = useLang();
  const { visitLesson, toggleLessonComplete, stateOf, completedCount } = useProgress();
  const { go } = useRoute();

  // Exercise state is per-lesson and resets when the lesson changes, so a
  // guess never carries over to a different chart.
  const [guess, setGuess] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  useEffect(() => {
    setGuess(null);
    setRevealed(false);
    setCelebrating(false);
  }, [lessonId]);
  const handlePriceClick = useCallback((price: number) => setGuess(price), []);

  const lesson = lessonById(lessonId);

  // Opening a lesson moves it out of "not started" immediately, so the rail
  // reflects reality rather than waiting for an explicit completion.
  useEffect(() => {
    if (lesson) visitLesson(lesson.id);
  }, [lesson, visitLesson]);

  // The intro and the "worth knowing" block are segmented TOGETHER, so a term
  // appearing in both is made interactive once rather than twice.
  //
  // Above the early return below, because it is a hook. Also memoised rather
  // than computed inline: the matcher set is rebuilt on every call, and this
  // component re-renders on every guess, reveal and progress change.
  const prose = lesson ? proseFor(lesson.id) : null;
  const [introSegments = [], deeperSegments = [], extraSegments = []] = useMemo(
    () => highlightGlossaryGroup([prose?.intro[lang] ?? '', prose?.deeper[lang] ?? '', prose?.extra?.[lang] ?? ''], lang),
    [prose, lang]
  );

  if (!lesson) {
    return <div className={styles.page}><p>{t('aiError')}</p></div>;
  }

  const chartSpecs = chartsForLesson(lesson.id);
  const exercise = exerciseFor(lesson.id);
  const notes = annotationsFor(lesson.id);
  const done = stateOf(lesson.id) === 'completed';
  const prev = LESSONS[lesson.index - 1];
  const next = LESSONS[lesson.index + 1];

  // The final chapter ends the course rather than paging on. The Finish
  // control replaces the forward arrow there — an arrow to nowhere was the
  // previous behaviour — and it only unlocks once every chapter is complete,
  // so the celebration marks finishing the COURSE, not reaching its last URL.
  const isLast = !next;
  const allComplete = completedCount >= LESSONS.length;
  const practiceAvailable = hasLessonQuiz(lesson.id, getQuizQuestions({}));

  return (
    <article className={styles.page}>
      <div className={styles.head}>
        <p className={styles.tag}>{lesson.tag[lang]}</p>
        <h1 className={styles.title}>{lesson.title[lang]}</h1>
        <p className={styles.position}>
          {lang === 'he'
            ? `שיעור ${lesson.index + 1} מתוך ${LESSONS.length}`
            : `Lesson ${lesson.index + 1} of ${LESSONS.length}`}
        </p>
        {prose && (
          <p className={styles.intro}>
            <GlossarySegments segments={introSegments} />
          </p>
        )}
      </div>

      {/* Chart workspace. The chart is recessed below the page rather than
          raised on a card — it reads as an instrument, not another box.
          A lesson can have more than one chart (e.g. one per candlestick
          pattern); the exercise/notes panel only ever pairs with the first
          one, since "try it yourself" is written against a single chart. */}
      {chartSpecs.length > 0 && (
        <section className={styles.workspaceBand} aria-label={lang === 'he' ? 'סביבת ניתוח' : 'Analysis workspace'}>
          <div className={styles.bandHead}>
            <p className={styles.bandLabel}>{lang === 'he' ? 'סביבת ניתוח' : 'Analysis workspace'}</p>
            {chartSpecs.length > 1 && (
              <p className={styles.bandCount}>
                {lang === 'he' ? `${chartSpecs.length} דוגמאות` : `${chartSpecs.length} examples`}
              </p>
            )}
          </div>
          <div className={chartSpecs.length > 1 ? styles.cardStack : `${styles.cardStack} ${styles.cardStackSingle}`}>
            {(() => {
              // Which single card (if any) is left alone in the grid's last
              // row, at exactly two columns per row (see .cardStack's own
              // max-width — the grid is capped there specifically so this
              // arithmetic is reliable everywhere, not just on the screen
              // widths this was tested at).
              //
              // Card 0 spanning the full row by itself (because it carries
              // the exercise/notes aside) shifts the parity of everything
              // after it — the naive "is the total count odd" check looked
              // right for l7 (5 plain cards, no aside) but was wrong for l2
              // (3 cards, but card 0's aside makes it 1 spanning row + a
              // clean pair after it, leaving nobody alone).
              const hasAsideOnFirst = Boolean(exercise || notes);
              const packedCount = chartSpecs.length - (hasAsideOnFirst ? 1 : 0);
              const hasLoneTrailingCard = chartSpecs.length > 1 && packedCount % 2 === 1;
              const loneIndex = hasLoneTrailingCard ? chartSpecs.length - 1 : -1;

              return chartSpecs.map((chartSpec, i) => (
                <ChartCard
                  key={i}
                  spec={chartSpec}
                  index={i}
                  count={chartSpecs.length}
                  {...(chartSpec.height ? { height: chartSpec.height } : {})}
                  {...(i === loneIndex ? { spanFull: true } : {})}
                  {...(i === 0 && exercise ? { onPriceClick: handlePriceClick } : {})}
                  {...(i === 0 && revealed && exercise
                    ? {
                        options: {
                          ...chartSpec.options,
                          showAnnotations: true,
                          zones: exercise.annotations.map((z) => ({
                            range: z.range,
                            tone: z.tone,
                            label: z.label
                          }))
                        }
                      }
                    : {})}
                  {...(i === 0 && exercise
                    ? {
                        aside: (
                          <TryItPanel
                            exercise={exercise}
                            guess={guess}
                            revealed={revealed}
                            onToggleReveal={() => setRevealed((r) => !r)}
                          />
                        )
                      }
                    : i === 0 && notes
                      ? { aside: <NotesPanel annotations={notes} /> }
                      : {})}
                />
              ));
            })()}
          </div>
        </section>
      )}

      {/* "Worth knowing" and the quiz-gap "extra" block sit side by side, not
          stacked — two independent notes competing for the same width read
          as one long column to scroll past; side by side, each is visibly
          its own thing. .notesRow collapses to a single stacked column on
          its own (see the CSS) when only one of the two exists, or on a
          narrow viewport — no conditional class needed here for that. */}
      {(prose?.deeper[lang] || prose?.extra?.[lang]) && (
        <div className={styles.notesRow}>
          {/* "Worth knowing" — shown in full. The collapse control this used
              to sit behind was removed: it added a click for no benefit. */}
          {prose?.deeper[lang] && (
            <aside className={styles.deeper}>
              <p className={styles.deeperLabel}>
                {lang === 'he' ? 'כדאי לדעת' : 'Worth knowing'}
              </p>
              <p className={styles.deeperBody}>
                <GlossarySegments segments={deeperSegments} />
              </p>
            </aside>
          )}

          {/* Added after auditing the quiz bank against this lesson's own
              prose: the quiz for this chapter tests something the lesson
              never actually defined (see prose.ts's own header for exactly
              what, per lesson). A distinct label rather than folding it
              into "Worth knowing" — that block adds nuance to something
              already taught; this teaches a term the lesson skipped, which
              is a different kind of addition and reads oddly under a
              "nuance" heading. */}
          {prose?.extra?.[lang] && (
            <aside className={styles.extra}>
              <p className={styles.extraLabel}>
                {lang === 'he' ? 'מושגים נוספים' : 'A couple more terms'}
              </p>
              <p className={styles.extraBody}>
                <GlossarySegments segments={extraSegments} />
              </p>
            </aside>
          )}
        </div>
      )}

      {/* Contextual tutor. Resolves against THIS lesson's KB topic, which is
          why the AI cannot answer about a chapter you already left. */}
      <section className={styles.tutor}>
        <span className={styles.tutorLead}>{lang === 'he' ? 'לא ברור משהו?' : 'Something unclear?'}</span>
        <div className={styles.tutorActions}>
          <button type="button" className={styles.tutorBtn} onClick={() => go('ai')}>
            {lang === 'he' ? 'הסבר לי את הנושא' : 'Explain this concept'}
          </button>
          <button type="button" className={styles.tutorBtn} onClick={() => go('ai')}>
            {lang === 'he' ? 'דוגמה נוספת' : 'Another example'}
          </button>
          {practiceAvailable && (
            <button type="button" className={styles.tutorBtnGhost} onClick={() => go('quiz', { lessonId: lesson.id })}>
              {lang === 'he' ? 'תרגל אותי' : 'Practice this'}
            </button>
          )}
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.pager}>
          <button
            type="button"
            className={styles.arrow}
            disabled={!prev}
            aria-label={lang === 'he' ? 'שיעור קודם' : 'Previous lesson'}
            onClick={() => prev && go('lesson', { lessonId: prev.id })}
          >
            ‹
          </button>
          <span className={styles.pagerCount}>
            {lang === 'he'
              ? `עמוד ${lesson.index + 1} מתוך ${LESSONS.length}`
              : `Page ${lesson.index + 1} of ${LESSONS.length}`}
          </span>
          {!isLast && (
            <button
              type="button"
              className={styles.arrow}
              aria-label={lang === 'he' ? 'שיעור הבא' : 'Next lesson'}
              onClick={() => go('lesson', { lessonId: next.id })}
            >
              ›
            </button>
          )}
          {/* The trailing slot stays occupied (but empty) on the last
              chapter, so removing the arrow does not shift the page count
              off centre. */}
          {isLast && <span className={styles.arrowSpacer} aria-hidden="true" />}
        </div>

        {isLast && (
          <button
            type="button"
            className={allComplete ? styles.finish : styles.finishLocked}
            disabled={!allComplete}
            onClick={() => setCelebrating(true)}
            aria-label={
              allComplete
                ? (lang === 'he' ? 'סיים את הקורס' : 'Finish the course')
                : (lang === 'he'
                    ? `סיים את הקורס — נותרו ${LESSONS.length - completedCount} פרקים להשלמה`
                    : `Finish the course — ${LESSONS.length - completedCount} chapters still to complete`)
            }
          >
            <span className={styles.finishText}>
              {lang === 'he' ? 'סיים את הקורס' : 'Finish the course'}
            </span>
            {!allComplete && (
              <span className={styles.finishHint}>
                {lang === 'he'
                  ? `${completedCount}/${LESSONS.length} פרקים הושלמו`
                  : `${completedCount}/${LESSONS.length} chapters complete`}
              </span>
            )}
          </button>
        )}

        {/* On its own row, below the pager — not wedged inline with it. */}
        <button
          type="button"
          className={done ? `${styles.complete} ${styles.completeDone}` : styles.complete}
          aria-pressed={done}
          onClick={() => toggleLessonComplete(lesson.id)}
        >
          {done
            ? (lang === 'he' ? 'הושלם ✓' : 'Completed ✓')
            : (lang === 'he' ? 'סמן כהושלם' : 'Mark as complete')}
        </button>
      </footer>

      {celebrating && (
        <CourseComplete
          lessonCount={LESSONS.length}
          onClose={() => setCelebrating(false)}
          onRestart={() => {
            setCelebrating(false);
            go('lesson', { lessonId: LESSONS[0]!.id });
          }}
        />
      )}
    </article>
  );
}
