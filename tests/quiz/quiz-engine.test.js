// Quiz engine — pure session/scoring logic, tested independently of any UI.
const { loadEngine } = require('../helpers/load-engine.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');

(async () => {
  const engine = loadEngine();

  await describe('question bank sanity', async (t) => {
    const all = engine.getQuizQuestions({});
    t.check('has a real bank of questions, not a placeholder handful', all.length >= 10);
    t.check('every question has exactly 4 options', all.every(q => q.options.length === 4));
    t.check('every question\'s correctKey matches one of its own options', all.every(q => q.options.some(o => o.key === q.correctKey)));
    t.check('every question has an explanation in both languages', all.every(q => q.explanation.he && q.explanation.en));
    const categories = engine.getQuizCategories();
    t.check('spans more than one category (testing understanding broadly, not one topic)', categories.length >= 3);
  });

  await describe('session creation', async (t) => {
    const session = engine.createQuizSession({}, 5);
    t.equal('respects the requested count', session.questions.length, 5);
    t.equal('starts at question 0', session.currentIndex, 0);
    t.equal('starts unfinished', session.finished, false);
    t.equal('starts with no answers recorded', session.answers.length, 0);

    const filtered = engine.createQuizSession({ category: 'technical' }, 100);
    t.check('category filter only returns matching questions', filtered.questions.every(q => q.category === 'technical'));
  });

  await describe('answering — correct and incorrect', async (t) => {
    const session = engine.createQuizSession({}, 3);
    const q0 = engine.currentQuestion(session);
    const result = engine.submitAnswer(session, q0.correctKey);
    t.equal('correctly reports a right answer', result.correct, true);
    t.equal('advances to the next question', session.currentIndex, 1);
    t.equal('records the answer', session.answers.length, 1);

    const wrongKey = q0.options.find(o => o.key !== q0.correctKey).key;
    // wrongKey was for q0 (already answered) — grab the actual current question now
    const q1 = engine.currentQuestion(session);
    const wrongForQ1 = q1.options.find(o => o.key !== q1.correctKey).key;
    const result2 = engine.submitAnswer(session, wrongForQ1);
    t.equal('correctly reports a wrong answer', result2.correct, false);
    t.equal('still reveals the correct key on a wrong answer', result2.correctKey, q1.correctKey);
  });

  await describe('finishing a quiz and scoring', async (t) => {
    const session = engine.createQuizSession({}, 2);
    const q0 = engine.currentQuestion(session);
    engine.submitAnswer(session, q0.correctKey);
    t.equal('not finished after 1 of 2', session.finished, false);
    const q1 = engine.currentQuestion(session);
    engine.submitAnswer(session, q1.correctKey);
    t.equal('finished after answering all questions', session.finished, true);
    t.equal('no current question once finished', engine.currentQuestion(session), null);

    const score = engine.getQuizScore(session);
    t.equal('perfect score when every answer was correct', score.correct, 2);
    t.equal('percent is 100 for a perfect score', score.percent, 100);
    t.equal('isComplete matches session.finished', score.isComplete, true);
  });

  await describe('a mixed-result score is computed correctly', async (t) => {
    const session = engine.createQuizSession({}, 4);
    for(let i = 0; i < 4; i++){
      const q = engine.currentQuestion(session);
      // answer the first two correctly, the last two incorrectly
      const key = i < 2 ? q.correctKey : q.options.find(o => o.key !== q.correctKey).key;
      engine.submitAnswer(session, key);
    }
    const score = engine.getQuizScore(session);
    t.equal('2 correct out of 4', score.correct, 2);
    t.equal('50 percent', score.percent, 50);
  });

  await describe('restart produces a fresh, independent session', async (t) => {
    const session = engine.createQuizSession({}, 3);
    engine.submitAnswer(session, engine.currentQuestion(session).correctKey);
    const restarted = engine.restartQuiz(session);
    t.equal('restarted session has no answers', restarted.answers.length, 0);
    t.equal('restarted session is not finished', restarted.finished, false);
    t.equal('restarted session has the same question count', restarted.questions.length, 3);
    t.equal('original session is untouched by the restart', session.answers.length, 1);
  });

  if(require.main === module) finalizeSuites();
})();
