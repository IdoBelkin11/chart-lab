import { useEffect, useRef, useState } from 'react';
import { setAmbientLessonTopic } from '@core/ai/ambientTopic';
import { lessonContent } from '@core/lessons/content';
import { lessonById, lessonsOf, trackById } from '@core/curriculum/curriculum';
import { useLang } from '@ui/hooks/useLang';
import { Icon } from '@ui/components/icons/Icons';
import { useTutorChat } from './tutorChat';
import { Composer, Transcript } from './TutorParts';
import styles from './TutorDrawer.module.css';

export type DrawerAction = 'explain' | 'example' | 'practice' | null;

const TX = {
  he: {
    title: 'מורה AI', sub: 'מסביר, שואל, ומחזיר אתכם לשיעור', practiceSub: 'מצב תרגול · שאלות שלא נספרות בציון', close: 'סגירת המורה', expand: 'הרחבה למסך מלא',
    hello: ['היי. אתם בשלב ', (n: number) => ` של שיעור ${n}. במה לעזור?`] as const, ctx: (t: string, n: number) => `${t} · שיעור ${n}`,
    explainAgain: 'הסבירו שוב במילים אחרות', example: 'תנו דוגמה נוספת', quizMe: 'תבחנו אותי', exampleAsk: (t: string) => `תן לי דוגמה נוספת על ${t}`,
    bonusIntro: (k: number, n: number) => `שאלת בונוס ${k} מתוך ${n} — היא לא נספרת בשיעור.`, bonusDone: 'סיימתם את כל שאלות הבונוס של השיעור הזה. אפשר לחזור לשיעור או לשאול על כל דבר אחר.',
    right: (k: number, n: number) => `בדיוק. **${k} מתוך ${n}** שאלות בונוס נכונות — רוצים עוד אחת, או לחזור לשיעור?`, wrong: 'לא בדיוק.',
    placeholder: 'שאלו על מה שעל המסך…', fullPage: 'למסך מלא', disclaimer: 'המורה יכול לטעות. הוא לא נותן ייעוץ השקעות.', aria: 'מורה AI'
  },
  en: {
    title: 'AI Tutor', sub: 'Explains, quizzes, and sends you back to the lesson', practiceSub: "Practice mode · questions that don't count", close: 'Close the tutor', expand: 'Expand to full screen',
    hello: ["Hi. You're on ", (n: number) => ` in lesson ${n}. How can I help?`] as const, ctx: (t: string, n: number) => `${t} · Lesson ${n}`,
    explainAgain: 'Explain it another way', example: 'Give me another example', quizMe: 'Quiz me', exampleAsk: (t: string) => `Give me another example of ${t}`,
    bonusIntro: (k: number, n: number) => `Bonus question ${k} of ${n} — it doesn't count in the lesson.`, bonusDone: "You've done every bonus question for this lesson. Go back to the lesson, or ask about anything else.",
    right: (k: number, n: number) => `Exactly. **${k} of ${n}** bonus questions right — another one, or back to the lesson?`, wrong: 'Not quite.',
    placeholder: 'Ask about what is on screen…', fullPage: 'Full screen', disclaimer: "The tutor can be wrong. It doesn't give investment advice.", aria: 'AI Tutor'
  }
} as const;

/**
 * The tutor beside the lesson (Artifact 14.2–14.6): the lesson stays in view,
 * the conversation knows which lesson and step it is about, and it can
 * explain again, give another example, or quiz with the lesson's own bonus
 * questions. The conversation is the same one the full page shows.
 */
export function TutorDrawer({ lessonId, step, action, onActionDone, onClose, onFullPage, expanded, onToggleExpand }: {
  lessonId: string; step: number; action: DrawerAction; onActionDone: () => void; onClose: () => void; onFullPage: () => void;
  /** Phone only: the sheet can grow to the full screen (Artifact 15.10). */
  expanded?: boolean; onToggleExpand?: () => void;
}) {
  const { t, lang } = useLang();
  const tx = TX[lang];
  const chat = useTutorChat(lang, t('aiError'));
  const [draft, setDraft] = useState('');
  const logRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const lesson = lessonById(lessonId)!;
  const content = lessonContent(lessonId)!;
  const { topic, label } = content.tutor;
  const n = lessonsOf(lesson.track).indexOf(lesson) + 1;
  const stepName = lesson.steps![lang][step]!;
  const meta = { he: TX.he.ctx(trackById(lesson.track).title.he, n), en: TX.en.ctx(trackById(lesson.track).title.en, n) };
  // Bonus questions: the lesson's own questions, minus the one its Try step already asks.
  const bonus = content.activity ? content.questions : content.questions.slice(1);
  const asked = chat.turns.filter((x) => x.quiz && bonus.some((b) => b.id === x.quiz!.qid)).map((x) => x.quiz!.qid);
  const inPractice = chat.turns.some((x) => x.quiz);

  // Opening on a lesson: that lesson's topic is what "this", "the chart" and
  // follow-ups resolve against. A conversation about another lesson is kept in
  // the history and a fresh one starts here.
  useEffect(() => {
    setAmbientLessonTopic(topic);
    if (chat.conv.meta && chat.conv.meta.he !== meta.he && chat.turns.length) chat.newChat(meta);
    else chat.setMeta(meta);
    chat.setTopic(topic);
    closeRef.current?.focus();
  }, [lessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  const explainAgain = () => chat.explain(topic, tx.explainAgain);
  const example = () => void chat.send(tx.exampleAsk(label[lang]));
  const quizMe = () => {
    const next = bonus.find((q) => !asked.includes(q.id));
    if (next) chat.askQuiz(next.id, tx.bonusIntro(asked.length + 1, bonus.length), tx.quizMe);
  };
  const quizDone = asked.length >= bonus.length;

  // An action chosen before the drawer opened (the lesson's "Explain" buttons, the offer card).
  useEffect(() => {
    if (!action) return;
    if (action === 'explain') explainAgain();
    else if (action === 'example') example();
    else quizMe();
    onActionDone();
  }, [action]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { const el = logRef.current; if (el) el.scrollTop = el.scrollHeight; }, [chat.turns, chat.pending]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const answer = (i: number, key: string) => chat.answerQuiz(i, key, (right, q) => {
    const correct = chat.turns.filter((x, k) => k !== i && x.quiz && x.quiz.chosen && chat.quizById(x.quiz.qid)?.correctKey === x.quiz.chosen).length + (right ? 1 : 0);
    return right ? `${q.explanation[lang]}\n\n${tx.right(correct, bonus.length)}` : `${tx.wrong} ${q.explanation[lang]}`;
  });

  return (
    <aside className={`glass ${styles.drawer}`} aria-label={tx.aria}>
      <div className={styles.head}>
        <span className="aiMark" aria-hidden="true"><Icon name="spark" size={15} /></span>
        <div className={styles.headText}><b className={styles.title}>{tx.title}</b><span className="meta">{inPractice ? tx.practiceSub : tx.sub}</span></div>
        {onToggleExpand && <button type="button" className="iconBtn" aria-expanded={expanded} aria-label={tx.expand} onClick={onToggleExpand}><Icon name="chevD" size={18} className={expanded ? undefined : styles.flip} /></button>}
        <button ref={closeRef} type="button" className="iconBtn" aria-label={tx.close} onClick={onClose}><Icon name="x" size={18} /></button>
      </div>
      <div className="ctxCard"><span className={styles.aiIc}><Icon name="book" size={15} /></span><span className={styles.grow}>{meta[lang]} · <b>{stepName}</b></span></div>

      <div className={styles.log} ref={logRef} role="log" aria-live="polite" aria-atomic="false">
        {chat.turns.length === 0 && (
          <div className={styles.aiRow}><span className={`aiMark ${styles.markSm}`} aria-hidden="true"><Icon name="spark" size={12} /></span>
            <p className="bub ai">{tx.hello[0]}<b>{stepName}</b>{tx.hello[1](n)}</p></div>
        )}
        <Transcript turns={chat.turns} pending={chat.pending} lang={lang} compact onAsk={(q) => void chat.send(q)} onAnswerQuiz={answer} quizById={chat.quizById} />
      </div>

      <div className={styles.suggs}>
        <button type="button" className="sugg" onClick={explainAgain} disabled={chat.pending}>{tx.explainAgain}</button>
        <button type="button" className="sugg" onClick={example} disabled={chat.pending}>{tx.example}</button>
        {bonus.length > 0 && !quizDone && <button type="button" className="sugg" onClick={quizMe} disabled={chat.pending}>{tx.quizMe}</button>}
      </div>
      {quizDone && inPractice && <p className="meta">{tx.bonusDone}</p>}
      <Composer value={draft} onChange={setDraft} onSend={() => { const q = draft; setDraft(''); void chat.send(q); }} pending={chat.pending} placeholder={tx.placeholder} lang={lang} />
      <div className={styles.foot}>
        <span className="meta">{tx.disclaimer}</span>
        <button type="button" className={`btnText ${styles.small}`} onClick={onFullPage}>{tx.fullPage}</button>
      </div>
    </aside>
  );
}
