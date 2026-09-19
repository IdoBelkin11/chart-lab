// Quiz session state machine. Pure — a session is data in, data out.
//
// The legacy build relied on script concatenation, so getQuizQuestions was
// simply a global here. Under ESM that dependency has to be explicit, which
// is the point: the module now declares what it needs instead of hoping the
// bundler ordered files correctly.
import { getQuizQuestions } from './questions.js';

// ---------------------------------------------------------------------------
// Quiz session engine — pure logic, no DOM. A "session" is a plain object;
// every function here takes one in and returns a new state or a result,
// the same shape discipline used by the calculators. The UI layer (not
// built here) owns rendering and calls these functions.
// ---------------------------------------------------------------------------

// Fisher-Yates shuffle — used so repeated quiz attempts don't always show
// questions in the same order. Deterministic given a seed would be nicer
// for tests, but quiz order genuinely should vary between real attempts;
// tests instead check the RESULT of a fixed sequence of answers, not order.
export function shuffleArray(arr){
  const a = arr.slice();
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// filter: { category?, difficulty? } — same shape getQuizQuestions() takes.
// count: how many questions to include (default: all matching).
export function createQuizSession(filter, count){
  const pool = getQuizQuestions(filter);
  const chosen = (count && count < pool.length) ? shuffleArray(pool).slice(0, count) : shuffleArray(pool);
  return {
    questions: chosen,
    currentIndex: 0,
    answers: [], // { questionId, chosenKey, correct }
    finished: false
  };
}

// Builds a session from an explicit question list (used for lesson-scoped
// practice, where selection happens in the UI layer rather than by filter).
export function createQuizSessionFromQuestions(questions, count){
  // Order is NOT shuffled here: the caller has already ranked these by
  // relevance to the lesson, and shuffling would bury the on-topic
  // questions behind general ones.
  const pool = (questions || []).slice();
  const chosen = (count && count < pool.length) ? pool.slice(0, count) : pool;
  return { questions: chosen, currentIndex: 0, answers: [], finished: false };
}

export function currentQuestion(session){
  if(session.finished || session.currentIndex >= session.questions.length) return null;
  return session.questions[session.currentIndex];
}

// Returns { correct, correctKey, explanation, session } — session is the
// SAME object, mutated in place (advancing currentIndex), matching how
// conversationContext is already threaded through the AI engine.
export function submitAnswer(session, chosenKey){
  const q = currentQuestion(session);
  if(!q) return null;
  const correct = chosenKey === q.correctKey;
  session.answers.push({ questionId: q.id, chosenKey, correct });
  session.currentIndex++;
  if(session.currentIndex >= session.questions.length) session.finished = true;
  return { correct, correctKey: q.correctKey, explanation: q.explanation, session };
}

export function getQuizScore(session){
  const total = session.answers.length;
  const correct = session.answers.filter(a => a.correct).length;
  return {
    correct, total,
    percent: total > 0 ? Math.round((correct / total) * 100) : 0,
    isComplete: session.finished
  };
}

export function restartQuiz(session){
  return createQuizSession(
    { }, // a restart reshuffles from the full original pool the session was built from
    session.questions.length
  );
}
