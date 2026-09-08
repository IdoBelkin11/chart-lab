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
function shuffleArray(arr){
  const a = arr.slice();
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// filter: { category?, difficulty? } — same shape getQuizQuestions() takes.
// count: how many questions to include (default: all matching).
function createQuizSession(filter, count){
  const pool = getQuizQuestions(filter);
  const chosen = (count && count < pool.length) ? shuffleArray(pool).slice(0, count) : shuffleArray(pool);
  return {
    questions: chosen,
    currentIndex: 0,
    answers: [], // { questionId, chosenKey, correct }
    finished: false
  };
}

function currentQuestion(session){
  if(session.finished || session.currentIndex >= session.questions.length) return null;
  return session.questions[session.currentIndex];
}

// Returns { correct, correctKey, explanation, session } — session is the
// SAME object, mutated in place (advancing currentIndex), matching how
// conversationContext is already threaded through the AI engine.
function submitAnswer(session, chosenKey){
  const q = currentQuestion(session);
  if(!q) return null;
  const correct = chosenKey === q.correctKey;
  session.answers.push({ questionId: q.id, chosenKey, correct });
  session.currentIndex++;
  if(session.currentIndex >= session.questions.length) session.finished = true;
  return { correct, correctKey: q.correctKey, explanation: q.explanation, session };
}

function getQuizScore(session){
  const total = session.answers.length;
  const correct = session.answers.filter(a => a.correct).length;
  return {
    correct, total,
    percent: total > 0 ? Math.round((correct / total) * 100) : 0,
    isComplete: session.finished
  };
}

function restartQuiz(session){
  return createQuizSession(
    { }, // a restart reshuffles from the full original pool the session was built from
    session.questions.length
  );
}
