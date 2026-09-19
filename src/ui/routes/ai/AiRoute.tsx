import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createConversationContext,
  generateAiReply,
  followupChipsFor,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  topicsInCategory
} from '@core/ai/index';
import type { AiReply } from '@core/types/kb';
import { useLang } from '@ui/hooks/useLang';
import { useRoute } from '@ui/hooks/useRoute';
import { originRoute } from '@ui/shell/returnTo';
import { lessonById } from '@core/lessons/lessons';
import { useTypewriter } from '@ui/hooks/useTypewriter';
import { AiAnswer } from '@ui/components/learning/AiAnswer';
import styles from './AiRoute.module.css';

interface Turn {
  role: 'user' | 'assistant';
  text: string;
  /** Follow-up suggestions derived from the answer's related entries. */
  chips?: Array<{ id: string; label: string }>;
  /** True when this reply is the topic browser rather than an answer. */
  browse?: boolean;
  /** Reveal progressively only for the turn that just arrived. */
  fresh?: boolean;
}

/**
 * The AI tutor.
 *
 * A workspace panel, not a modal: the global header, brand and course rail
 * stay visible and usable beside it. The previous build exposed this as
 * `role="dialog" aria-modal="true"`, which told assistive tech that
 * everything outside was unavailable — false then, and plainly false now.
 * It is a labelled region whose transcript is an aria-live log.
 *
 * Two things the engine had always computed and this view discarded are now
 * on screen. Both were dead weight before — cost paid every turn, nothing
 * shown for it:
 *
 *   · `relatedIds` → follow-up chips. An answer now ends by offering the
 *     next question rather than leaving the reader to guess what else the
 *     tutor knows, which is the hardest part of using a matcher: phrasing.
 *   · `browse: true` → the topic browser. Asking for "a list of topics"
 *     returned prose saying to pick a category, and then showed no
 *     categories at all.
 */
export function AiRoute() {
  const { t, lang } = useLang();
  const { go } = useRoute();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);
  const [draft, setDraft] = useState('');
  const [openCategory, setOpenCategory] = useState<{ index: number; cat: string } | null>(null);

  // Conversation memory persists across turns but not across a reset, which
  // is what makes follow-ups like "give me another example" resolve.
  const context = useRef(createConversationContext());
  const lastTopic = useRef<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Keep the newest turn in view. Without this a long answer pushes the
  // question that prompted it off the top and the reader lands mid-reply.
  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, pending]);

  const send = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || pending) return;
      setDraft('');
      setOpenCategory(null);
      // Mark every existing turn stale first: only the incoming answer
      // should animate, or the whole transcript would re-reveal each time.
      setTurns((prev) => [...prev.map((tn) => ({ ...tn, fresh: false })), { role: 'user', text: q }]);
      setPending(true);
      try {
        const reply: AiReply = await generateAiReply(q, lang, lastTopic.current, context.current);
        lastTopic.current = reply.topicId ?? lastTopic.current;

        const chips = (reply.relatedIds ?? [])
          .map((id) => {
            const label = followupChipsFor(id, lang) as string | null;
            return label ? { id, label } : null;
          })
          .filter((c): c is { id: string; label: string } => c !== null);

        setTurns((prev) => [
          ...prev,
          { role: 'assistant', text: reply.text, chips, browse: reply.browse, fresh: true }
        ]);
      } catch {
        setTurns((prev) => [...prev, { role: 'assistant', text: t('aiError'), fresh: true }]);
      } finally {
        setPending(false);
        inputRef.current?.focus();
      }
    },
    [lang, pending, t]
  );

  const reset = useCallback(() => {
    context.current = createConversationContext();
    lastTopic.current = null;
    setOpenCategory(null);
    setTurns([]);
  }, []);

  // Six, so the grid fills two clean rows of three.
  const examples = useMemo(
    () => [t('aiEx1'), t('aiEx2'), t('aiEx3'), t('aiEx4'), t('aiEx5')],
    [t]
  );

  const lastIndex = turns.length - 1;

  // Name the destination when it is a lesson, so Back is a promise about
  // where it goes rather than a bare arrow.
  const backLabel = useMemo(() => {
    const origin = originRoute();
    const lesson = origin?.params.lessonId ? lessonById(origin.params.lessonId) : undefined;
    if (lesson) {
      return lang === 'he' ? `חזרה לשיעור: ${lesson.navLabel.he}` : `Back to lesson: ${lesson.navLabel.en}`;
    }
    return lang === 'he' ? 'חזרה לקורס' : 'Back to the course';
  }, [lang, turns.length]);

  return (
    <section className={styles.panel} aria-label={lang === 'he' ? 'עוזר שוק ההון' : 'Market tutor'}>
      {/* No title strip. The empty state already says what this is, and
          repeating it above the transcript meant the same sentence appeared
          twice on the screen a first-time visitor sees.

          Back floats over the panel instead, mirroring the launcher that
          hides itself on this route — this is the only exit. */}
      <button
        type="button"
        className={styles.back}
        onClick={() => {
          const origin = originRoute();
          if (origin) go(origin.route, origin.params);
          else go('home');
        }}
        aria-label={backLabel}
        title={backLabel}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d={lang === 'he' ? 'M5 12h14M13 5l7 7-7 7' : 'M19 12H5M11 5l-7 7 7 7'}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {turns.length > 0 && (
        <button type="button" className={styles.reset} onClick={reset}>
          <span aria-hidden="true">↺</span> {t('aiRestartLabel')}
        </button>
      )}

      <div className={styles.transcript} ref={transcriptRef} role="log" aria-live="polite" aria-atomic="false">
        {turns.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.mark} aria-hidden="true">✦</div>
            <h2 className={styles.emptyTitle}>{t('aiEmptyTitle')}</h2>
            <p className={styles.emptyLead}>{t('aiEmptyBody')}</p>
            <div className={styles.examples}>
              {examples.map((ex) => (
                <button key={ex} type="button" className={styles.example} onClick={() => void send(ex)}>
                  {ex}
                </button>
              ))}
              {/* The topic browser as a starting point, not only as something
                  you find by guessing the right phrasing. */}
              <button
                type="button"
                className={`${styles.example} ${styles.exampleBrowse}`}
                onClick={() => void send(lang === 'he' ? 'רשימת נושאים' : 'list of topics')}
              >
                <span aria-hidden="true">📊</span>&nbsp;
                {lang === 'he' ? 'עיין בכל הנושאים' : 'Browse every topic'}
              </button>
            </div>
          </div>
        )}

        {turns.map((turn, i) =>
          turn.role === 'user' ? (
            <p key={i} className={styles.user}>{turn.text}</p>
          ) : (
            <AssistantTurn
              key={i}
              turn={turn}
              isLast={i === lastIndex}
              lang={lang}
              openCategory={openCategory?.index === i ? openCategory.cat : null}
              onOpenCategory={(cat) => setOpenCategory(cat ? { index: i, cat } : null)}
              onAsk={(q) => void send(q)}
            />
          )
        )}

        {pending && (
          <p className={styles.thinking} aria-label={lang === 'he' ? 'חושב' : 'Thinking'}>
            <span /><span /><span />
          </p>
        )}
      </div>

      <form
        className={styles.composer}
        onSubmit={(e) => {
          e.preventDefault();
          void send(draft);
        }}
      >
        <input
          ref={inputRef}
          className={styles.input}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('aiPlaceholder')}
          aria-label={t('aiPlaceholder')}
          disabled={pending}
        />
        <button
          type="submit"
          className={styles.send}
          disabled={pending || !draft.trim()}
          aria-label={lang === 'he' ? 'שלח' : 'Send'}
        >
          →
        </button>
      </form>

      <p className={styles.disclaimer}>{t('aiDisclaimer')}</p>
    </section>
  );
}

/**
 * One assistant turn: the answer, then whatever it invites next.
 *
 * Only the newest turn animates. Clicking anywhere on a revealing answer
 * finishes it immediately — a reveal must never stand between a reader and
 * text they asked for.
 */
function AssistantTurn({
  turn,
  isLast,
  lang,
  openCategory,
  onOpenCategory,
  onAsk
}: {
  turn: Turn;
  isLast: boolean;
  lang: 'he' | 'en';
  openCategory: string | null;
  onOpenCategory: (cat: string | null) => void;
  onAsk: (q: string) => void;
}) {
  const { shown, done, skip } = useTypewriter(turn.text, !!turn.fresh && isLast);

  return (
    <div className={styles.assistant}>
      <div onClick={done ? undefined : skip} className={done ? undefined : styles.revealing}>
        <AiAnswer text={shown} />
        {!done && <span className={styles.caret} aria-hidden="true" />}
      </div>

      {/* Held back until the answer has finished revealing: offering the next
          question while the current one is still arriving pulls the reader
          away from what they asked for. */}
      {done && turn.browse && (
        <div className={styles.browser}>
          <div className={styles.chipRow}>
            {CATEGORY_ORDER.map((cat) => {
              const label = (CATEGORY_LABELS as Record<string, Record<string, string>>)[cat]?.[lang];
              if (!label) return null;
              const open = openCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  className={open ? `${styles.chip} ${styles.chipOpen}` : styles.chip}
                  aria-expanded={open}
                  onClick={() => onOpenCategory(open ? null : cat)}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {openCategory && (
            <div className={styles.topicList}>
              {(topicsInCategory(openCategory) as Array<{ id: string }>).map((entry) => {
                const label = followupChipsFor(entry.id, lang) as string | null;
                if (!label) return null;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    className={styles.topic}
                    onClick={() => onAsk(label)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {done && !turn.browse && turn.chips && turn.chips.length > 0 && (
        <div className={styles.followups}>
          <span className={styles.followupLabel}>
            {lang === 'he' ? 'להמשיך מכאן' : 'Continue from here'}
          </span>
          <div className={styles.chipRow}>
            {turn.chips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                className={styles.chip}
                onClick={() => onAsk(chip.label)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
