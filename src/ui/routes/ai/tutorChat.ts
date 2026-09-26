// ---------------------------------------------------------------------------
// The tutor's conversations, shared by the full page (#/ai) and the lesson
// drawer.
//
// Module-level, not component state: a conversation must survive leaving the
// AI page, closing the drawer, and moving between the two. It lives for the
// page load — nothing is persisted — and only "New chat" / "Delete history"
// clear it. This module imports the engine, so it may only be reached through
// a lazy() boundary (tests/ui/bundleSplit.test.ts enforces that).
// ---------------------------------------------------------------------------
import { useCallback, useState, useSyncExternalStore } from 'react';
import { createConversationContext, generateAiReply, followupChipsFor, kbById } from '@core/ai/index';
import type { AiReply, Localized, QuizQuestion } from '@core/types/kb';
import { allQuestions } from '@core/lessons/content';

type Lang = 'he' | 'en';
export interface Chip { id: string; label: string }
export interface Turn {
  role: 'user' | 'assistant';
  text: string;
  /** Follow-up suggestions derived from the answer's related entries. */
  chips?: Chip[];
  /** True when this reply is the topic browser rather than an answer. */
  browse?: boolean;
  /** Reveal progressively only for the turn that just arrived. */
  fresh?: boolean;
  /** A bonus practice question asked in the conversation, and the answer given. */
  quiz?: { qid: string; chosen: string | null };
}
export interface Conversation {
  id: number;
  /** The first question, as the conversation's name in the history. */
  title: string;
  /** Where it was started, e.g. "Technical analysis · Lesson 4". */
  meta: Localized | null;
  startedAt: number;
  turns: Turn[];
  context: ReturnType<typeof createConversationContext>;
  lastTopic: string | null;
}

let nextId = 1;
const blank = (meta: Localized | null = null): Conversation => ({
  id: nextId++, title: '', meta, startedAt: Date.now(), turns: [], context: createConversationContext(), lastTopic: null
});
let conversations: Conversation[] = [blank()];
let currentId = conversations[0]!.id;
let version = 0;
const listeners = new Set<() => void>();
const emit = () => { version++; listeners.forEach((l) => l()); };
const current = () => conversations.find((c) => c.id === currentId)!;
function update(fn: (c: Conversation) => void) { fn(current()); emit(); }

/** Test-only: the module stays loaded across test cases, unlike a real page load. */
export function __resetChatSessionForTests() {
  conversations = [blank()];
  currentId = conversations[0]!.id;
  emit();
}

const quizById = (id: string) => allQuestions().find((q) => q.id === id);
function chipsFor(ids: readonly string[], lang: Lang): Chip[] {
  return ids.map((id) => { const label = followupChipsFor(id, lang) as string | null; return label ? { id, label } : null; })
    .filter((c): c is Chip => c !== null);
}
const stale = (turns: Turn[]) => turns.map((t) => ({ ...t, fresh: false }));

export function useTutorChat(lang: Lang, errorText: string) {
  useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => version);
  const [pending, setPending] = useState(false);
  const conv = current();

  const send = useCallback(async (question: string) => {
    const q = question.trim();
    if (!q || pending) return;
    update((c) => { c.turns = [...stale(c.turns), { role: 'user', text: q }]; if (!c.title) c.title = q; });
    setPending(true);
    try {
      const c = current();
      const reply: AiReply = await generateAiReply(q, lang, c.lastTopic, c.context);
      const chips = chipsFor(reply.relatedIds ?? [], lang);
      // A live-data stock answer has no KB relatedIds, so offer the facets not
      // just shown, named by ticker (resolveTicker matches it directly).
      if (reply.topicId === 'stock-data' && reply.entityContext) {
        const { ticker, facet } = reply.entityContext;
        const he = lang === 'he';
        if (facet !== 'technical') chips.push({ id: `stock-technical-${ticker}`, label: he ? `ניתוח טכני של ${ticker}` : `Technical analysis of ${ticker}` });
        if (facet !== 'fundamental') chips.push({ id: `stock-fundamental-${ticker}`, label: he ? `ניתוח פונדמנטלי של ${ticker}` : `Fundamental analysis of ${ticker}` });
      }
      update((cc) => { cc.lastTopic = reply.topicId ?? cc.lastTopic; cc.turns = [...cc.turns, { role: 'assistant', text: reply.text, chips, browse: reply.browse, fresh: true }]; });
    } catch {
      update((cc) => { cc.turns = [...cc.turns, { role: 'assistant', text: errorText, fresh: true }]; });
    } finally {
      setPending(false);
    }
  }, [lang, pending, errorText]);

  /** "Explain this concept": the topic's own entry, straight from the knowledge base. */
  const explain = useCallback((topicId: string, label: string) => {
    const entry = kbById(topicId);
    if (!entry) return;
    update((c) => {
      c.lastTopic = topicId;
      if (!c.title) c.title = label;
      c.turns = [...stale(c.turns), { role: 'user', text: label }, { role: 'assistant', text: entry[lang], chips: chipsFor((entry.related ?? []).slice(0, 2), lang), fresh: true }];
    });
  }, [lang]);

  /** Ask one bonus question in the conversation (the lesson's own quiz bank). */
  const askQuiz = useCallback((qid: string, intro: string, label: string) => {
    update((c) => {
      if (!c.title) c.title = label;
      c.turns = [...stale(c.turns), { role: 'user', text: label }, { role: 'assistant', text: intro, quiz: { qid, chosen: null }, fresh: true }];
    });
  }, []);
  const answerQuiz = useCallback((turnIndex: number, key: string, reply: (right: boolean, q: QuizQuestion) => string) => {
    update((c) => {
      const t = c.turns[turnIndex];
      const q = t?.quiz ? quizById(t.quiz.qid) : undefined;
      if (!t?.quiz || t.quiz.chosen || !q) return;
      const turns = stale(c.turns);
      turns[turnIndex] = { ...t, fresh: false, quiz: { ...t.quiz, chosen: key } };
      const opt = q.options.find((o) => o.key === key)!;
      c.turns = [...turns, { role: 'user', text: opt.text[lang] }, { role: 'assistant', text: reply(key === q.correctKey, q), fresh: true }];
    });
  }, [lang]);

  /** Start a new conversation; the previous one stays in the history if it has anything in it. */
  const newChat = useCallback((meta: Localized | null = null) => {
    conversations = conversations.filter((c) => c.turns.length > 0);
    const c = blank(meta);
    conversations.push(c);
    currentId = c.id;
    emit();
  }, []);
  /** Make sure the conversation carries where it was started (the drawer does this on open). */
  const setMeta = useCallback((meta: Localized) => { if (!current().meta) update((c) => { c.meta = meta; }); }, []);
  /** Point the conversation at a topic without saying anything (the lesson a drawer opens on). */
  const setTopic = useCallback((topicId: string) => { update((c) => { c.lastTopic = topicId; }); }, []);
  const select = useCallback((id: number) => { if (conversations.some((c) => c.id === id)) { currentId = id; emit(); } }, []);
  const clearAll = useCallback(() => { conversations = [blank()]; currentId = conversations[0]!.id; emit(); }, []);

  return {
    conv, turns: conv.turns, pending, send, explain, askQuiz, answerQuiz, newChat, setMeta, setTopic, select, clearAll,
    history: conversations.filter((c) => c.turns.length > 0 || c.id === currentId),
    quizById
  };
}
