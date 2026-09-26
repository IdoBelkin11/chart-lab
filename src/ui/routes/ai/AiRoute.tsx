import { useEffect, useMemo, useRef, useState } from 'react';
import { takePendingTutorAction } from '@core/ai/pendingTutorAction';
import { lessonById } from '@core/lessons/lessons';
import { LESSON_TO_LEGACY, TOTAL_LESSONS, lessonById as curriculumLesson, lessonsOf, trackById } from '@core/curriculum/curriculum';
import { useLang } from '@ui/hooks/useLang';
import { useRoute } from '@ui/hooks/useRoute';
import { useAppState } from '@ui/app/AppState';
import { originRoute } from '@ui/shell/returnTo';
import { Icon } from '@ui/components/icons/Icons';
import { BarChartIcon } from '@ui/components/icons/Icons';
import { useTutorChat } from './tutorChat';
import { Composer, Transcript } from './TutorParts';
import styles from './AiRoute.module.css';

export { __resetChatSessionForTests } from './tutorChat';

const TX = {
  he: {
    region: 'עוזר שוק ההון', newChat: 'שיחה חדשה', today: 'היום', general: 'שאלה כללית', talking: 'על מה מדברים', knows: 'מה המורה יודע',
    done: 'השיעורים שסיימתם', of: 'מתוך', curStep: 'השלב הנוכחי', none: 'עוד לא התחלתם שיעור',
    limits: 'גבולות', limitsBody: 'המורה מסביר ומתרגל. הוא לא ממליץ על קנייה או מכירה, ונתוני מניות שהוא מציג עשויים להגיע באיחור.',
    clear: 'מחיקת היסטוריית השיחות', lessonN: (t: string, n: number) => `${t} · שיעור ${n}`, browse: 'עיין בכל הנושאים', history: 'היסטוריית שיחות',
    back: (name: string) => `חזרה לשיעור: ${name}`, backCourse: 'חזרה לקורס', tutor: 'מורה AI'
  },
  en: {
    region: 'Market tutor', newChat: 'New chat', today: 'Today', general: 'General question', talking: "What we're talking about", knows: 'What the tutor knows',
    done: 'Lessons completed', of: 'of', curStep: 'Current step', none: "You haven't started a lesson yet",
    limits: 'Limits', limitsBody: "The tutor explains and quizzes. It doesn't recommend buying or selling, and stock data it shows may be delayed.",
    clear: 'Delete conversation history', lessonN: (t: string, n: number) => `${t} · Lesson ${n}`, browse: 'Browse every topic', history: 'Conversation history',
    back: (name: string) => `Back to lesson: ${name}`, backCourse: 'Back to the course', tutor: 'AI Tutor'
  }
} as const;

/**
 * The AI tutor, full page (Artifact 14.8): past conversations, the
 * conversation, and what the tutor knows about where you are.
 *
 * A labelled region, not a modal: the shell stays visible and usable beside
 * it. The transcript is an aria-live log. The same conversations appear in
 * the lesson drawer (TutorDrawer) — both read tutorChat's store.
 */
export function AiRoute() {
  const { t, lang } = useLang();
  const { go } = useRoute();
  const { learning, learningCompleted } = useAppState();
  const tx = TX[lang];
  const chat = useTutorChat(lang, t('aiError'));
  const [draft, setDraft] = useState('');
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Keep the newest turn in view.
  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat.turns, chat.pending]);
  useEffect(() => { if (!chat.pending) inputRef.current?.focus({ preventScroll: true }); }, [chat.pending]);

  // One-shot hand-off from a lesson's "Explain this concept" / "Another example".
  useEffect(() => {
    const p = takePendingTutorAction();
    if (!p) return;
    if (p.action === 'explain') chat.explain(p.topicId, p.questionLabel);
    else if (p.action === 'example') void chat.send(p.questionLabel);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const examples = useMemo(() => [t('aiEx1'), t('aiEx2'), t('aiEx3'), t('aiEx4'), t('aiEx5')], [t]);

  // Back names the lesson it returns to, so it is a promise, not a bare arrow.
  const origin = originRoute();
  const backLabel = useMemo(() => {
    const id = origin?.params.lessonId;
    const legacy = id && LESSON_TO_LEGACY[id] ? lessonById(LESSON_TO_LEGACY[id]!) : undefined;
    const name = legacy ? legacy.navLabel[lang] : id ? curriculumLesson(id)?.title[lang] : undefined;
    return name ? tx.back(name) : tx.backCourse;
  }, [lang, origin?.params.lessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Where the learner is: the lesson they came from, else their last lesson.
  const whereId = origin?.params.lessonId ?? learning.lastLesson;
  const where = whereId ? curriculumLesson(whereId) : undefined;
  const whereLabel = where ? tx.lessonN(trackById(where.track).title[lang], lessonsOf(where.track).indexOf(where) + 1) : null;
  const whereStep = where?.steps ? where.steps[lang][learning.lessons[where.id]?.step ?? 0] : undefined;

  return (
    <div className={styles.page}>
      <aside className={`solid ${styles.history}`} aria-label={tx.history}>
        <button type="button" className="btnAi" onClick={() => chat.newChat()} aria-label={t('aiRestartLabel')}><Icon name="plus" size={15} />{tx.newChat}</button>
        {chat.history.some((c) => c.turns.length) && <span className="label">{tx.today}</span>}
        {chat.history.filter((c) => c.turns.length).slice().reverse().map((c) => (
          <button key={c.id} type="button" className={styles.histItem} aria-current={c.id === chat.conv.id || undefined} onClick={() => chat.select(c.id)}>
            <b>{c.title}</b><span className="meta">{c.meta ? c.meta[lang] : tx.general}</span>
          </button>
        ))}
      </aside>

      <section className={`glass ${styles.chat}`} aria-label={tx.region}>
        <div className={styles.chatHead}>
          <button type="button" className={`btnQuiet sm ${styles.back}`} onClick={() => (origin ? go(origin.route, origin.params) : go('home'))} aria-label={backLabel} title={backLabel}>
            <Icon name={lang === 'he' ? 'chevR' : 'chevL'} size={16} />
          </button>
          <span className="aiMark" aria-hidden="true"><Icon name="spark" size={15} /></span>
          <b className={`h3 ${styles.chatTitle}`}>{chat.conv.title || tx.tutor}</b>
          {chat.conv.meta && <span className={`meta ${styles.pushEnd}`}>{chat.conv.meta[lang]}</span>}
          <button type="button" className={`iconBtn ${styles.phoneNew}`} onClick={() => chat.newChat()} aria-label={tx.newChat}><Icon name="plus" size={19} /></button>
        </div>

        <div className={styles.transcript} ref={transcriptRef} role="log" aria-live="polite" aria-atomic="false">
          {chat.turns.length === 0 && (
            <div className={styles.empty}>
              <span className={`aiMark ${styles.bigMark}`} aria-hidden="true"><Icon name="spark" size={22} /></span>
              <h2 className="h2">{t('aiEmptyTitle')}</h2>
              <p className="txt">{t('aiEmptyBody')}</p>
              <div className={styles.examples}>
                {examples.map((ex) => <button key={ex} type="button" className={styles.example} onClick={() => void chat.send(ex)}>{ex}</button>)}
                {/* The topic browser as a starting point, not only something found by guessing the phrasing. */}
                <button type="button" className={`${styles.example} ${styles.exampleBrowse}`} onClick={() => void chat.send(lang === 'he' ? 'רשימת נושאים' : 'list of topics')}>
                  <BarChartIcon className={styles.exampleIcon} />{tx.browse}
                </button>
              </div>
            </div>
          )}
          <Transcript turns={chat.turns} pending={chat.pending} lang={lang} onAsk={(q) => void chat.send(q)} quizById={chat.quizById}
            onAnswerQuiz={(i, k) => chat.answerQuiz(i, k, (right, q) => `${right ? (lang === 'he' ? 'נכון. ' : 'Correct. ') : (lang === 'he' ? 'לא בדיוק. ' : 'Not quite. ')}${q.explanation[lang]}`)} />
        </div>

        <Composer value={draft} onChange={setDraft} onSend={() => { const q = draft; setDraft(''); void chat.send(q); }} pending={chat.pending} placeholder={t('aiPlaceholder')} lang={lang} inputRef={inputRef} />
        <p className={`meta ${styles.disclaimer}`}>{t('aiDisclaimer')}</p>
      </section>

      <aside className={`solid ${styles.context}`} aria-label={tx.talking}>
        <b className="h3">{tx.talking}</b>
        <div className="ctxCard"><span className={styles.aiIc}><Icon name="book" size={15} /></span><span>{whereLabel ? <>{whereLabel}{whereStep && <> · <b>{whereStep}</b></>}</> : tx.general}</span></div>
        <span className="label">{tx.knows}</span>
        <div className={styles.knowRow}><span className="small">{tx.done}</span><b><span className="n">{learningCompleted}</span> {tx.of} <span className="n">{TOTAL_LESSONS}</span></b></div>
        <div className={styles.knowRow}><span className="small">{tx.curStep}</span><b>{where ? (whereStep ?? where.title[lang]) : tx.none}</b></div>
        <div className="block caveat"><b className="lead2">{tx.limits} · </b>{tx.limitsBody}</div>
        <button type="button" className={`btnQuiet ${styles.pushEndCol}`} onClick={() => chat.clearAll()}><Icon name="x" size={14} />{tx.clear}</button>
      </aside>
    </div>
  );
}
