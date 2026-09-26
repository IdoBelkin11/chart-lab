import { useState } from 'react';
import { questionChart } from '@core/lessons/content';
import { QuestionFigure } from '@ui/components/lessons/QuestionChart';
import { CATEGORY_LABELS, CATEGORY_ORDER, followupChipsFor, topicsInCategory } from '@core/ai/index';
import type { QuizQuestion } from '@core/types/kb';
import { useTypewriter } from '@ui/hooks/useTypewriter';
import { AiAnswer } from '@ui/components/learning/AiAnswer';
import { Icon } from '@ui/components/icons/Icons';
import type { Turn } from './tutorChat';
import styles from './Tutor.module.css';

type Lang = 'he' | 'en';
const KEYS = { he: 'אבגד', en: 'ABCD' };

/**
 * A conversation, as the Artifact draws it (14.2–14.8): your questions as gold
 * bubbles, the tutor's answers beside its mark. Shared by the full page and
 * the lesson drawer, so both read the same way.
 */
export function Transcript({ turns, pending, lang, onAsk, onAnswerQuiz, quizById, compact = false }: {
  turns: Turn[]; pending: boolean; lang: Lang; onAsk: (q: string) => void;
  onAnswerQuiz: (turnIndex: number, key: string) => void; quizById: (id: string) => QuizQuestion | undefined; compact?: boolean;
}) {
  // Which category is open, per browse turn — opening one in a later topic
  // browser must not also open it in an earlier one.
  const [open, setOpen] = useState<{ index: number; cat: string } | null>(null);
  const last = turns.length - 1;
  return (
    <>
      {turns.map((turn, i) =>
        turn.role === 'user'
          ? <p key={i} className="bub me">{turn.text}</p>
          : <AssistantTurn key={i} turn={turn} index={i} isLast={i === last} lang={lang} compact={compact}
              openCategory={open?.index === i ? open.cat : null} onOpenCategory={(cat) => setOpen(cat ? { index: i, cat } : null)}
              onAsk={onAsk} onAnswerQuiz={onAnswerQuiz} quizById={quizById} />
      )}
      {pending && (
        <div className={styles.aiRow}>
          <span className={`aiMark ${styles.markSm}`} aria-hidden="true"><Icon name="spark" size={12} /></span>
          <span className="typing" role="status" aria-label={lang === 'he' ? 'המורה כותב' : 'The tutor is writing'}><i /><i /><i /></span>
        </div>
      )}
    </>
  );
}

function AssistantTurn({ turn, index, isLast, lang, compact, openCategory, onOpenCategory, onAsk, onAnswerQuiz, quizById }: {
  turn: Turn; index: number; isLast: boolean; lang: Lang; compact: boolean; openCategory: string | null;
  onOpenCategory: (cat: string | null) => void; onAsk: (q: string) => void;
  onAnswerQuiz: (turnIndex: number, key: string) => void; quizById: (id: string) => QuizQuestion | undefined;
}) {
  // Only the newest turn reveals progressively; a click finishes it at once —
  // a reveal must never stand between a reader and text they asked for.
  const { shown, done, skip } = useTypewriter(turn.text, !!turn.fresh && isLast);
  const q = turn.quiz ? quizById(turn.quiz.qid) : undefined;
  // A lesson's visual question is asked with its chart, in the drawer as on the full page.
  const qSpec = q ? questionChart(q) : undefined;
  return (
    <div className={styles.aiRow}>
      <span className={`aiMark ${styles.markSm}`} aria-hidden="true"><Icon name="spark" size={12} /></span>
      <div className={`bub ai ${styles.aiBub}${compact ? '' : ` ${styles.aiBubWide}`}`}>
        <div onClick={done ? undefined : skip} className={done ? undefined : styles.revealing}>
          <AiAnswer text={shown} />
          {!done && <span className={styles.caret} aria-hidden="true" />}
        </div>

        {done && q && turn.quiz && (
          <div className={styles.quiz} role="radiogroup" aria-label={q.question[lang]}>
            <b className={styles.quizQ}>{q.question[lang]}</b>
            {q && <QuestionFigure q={q} spec={qSpec} lang={lang} height={compact ? 170 : 220} />}
            {q.options.map((o, k) => {
              const chosen = turn.quiz!.chosen;
              const cls = chosen ? (o.key === q.correctKey ? 'right' : o.key === chosen ? 'wrong' : 'dim') : '';
              return (
                <button key={o.key} type="button" role="radio" aria-checked={chosen === o.key} className={`choice ${cls} ${styles.quizOpt}`}
                  disabled={!!chosen} onClick={() => onAnswerQuiz(index, o.key)}>
                  <span className="key" aria-hidden="true">{KEYS[lang][k]}</span><span>{o.text[lang]}</span>
                </button>
              );
            })}
          </div>
        )}

        {done && turn.browse && (
          <div className={styles.browser}>
            <div className={styles.chipRow}>
              {CATEGORY_ORDER.map((cat) => {
                const label = (CATEGORY_LABELS as Record<string, Record<string, string>>)[cat]?.[lang];
                if (!label) return null;
                const isOpen = openCategory === cat;
                return <button key={cat} type="button" className={`sugg${isOpen ? ` ${styles.suggOn}` : ''}`} aria-expanded={isOpen} onClick={() => onOpenCategory(isOpen ? null : cat)}>{label}</button>;
              })}
            </div>
            {openCategory && (
              <div className={styles.topicList}>
                {(topicsInCategory(openCategory) as Array<{ id: string }>).map((entry) => {
                  const label = followupChipsFor(entry.id, lang) as string | null;
                  return label ? <button key={entry.id} type="button" className={styles.topic} onClick={() => onAsk(label)}>{label}</button> : null;
                })}
              </div>
            )}
          </div>
        )}

        {done && !turn.browse && turn.chips && turn.chips.length > 0 && (
          <div className={styles.followups}>
            <span className="label">{lang === 'he' ? 'להמשיך מכאן' : 'Continue from here'}</span>
            <div className={styles.chipRow}>{turn.chips.map((c) => <button key={c.id} type="button" className="sugg" onClick={() => onAsk(c.label)}>{c.label}</button>)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

/** The question box with its send button (Artifact: .input + gradient send). */
export function Composer({ value, onChange, onSend, pending, placeholder, lang, inputRef }: {
  value: string; onChange: (v: string) => void; onSend: () => void; pending: boolean; placeholder: string; lang: Lang; inputRef?: React.Ref<HTMLInputElement>;
}) {
  return (
    <form className={`input ${styles.composer}`} onSubmit={(e) => { e.preventDefault(); onSend(); }}>
      <input ref={inputRef} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} disabled={pending} />
      <button type="submit" className={`iconBtn ${styles.send}`} disabled={pending || !value.trim()} aria-label={lang === 'he' ? 'שלח' : 'Send'}>
        <Icon name="send" size={15} />
      </button>
    </form>
  );
}
