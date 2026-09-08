// Persistence: lesson progress and quiz progress, backed by storage.js.
// Uses the shared in-memory localStorage mock in load-engine.js, so these
// actually verify the read/write/merge LOGIC, not just that storage.js
// fails gracefully when localStorage is unavailable (that path already has
// its own coverage via storageAvailable()'s try/catch design).
const { loadEngine } = require('../helpers/load-engine.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');

(async () => {
  await describe('lesson progress', async (t) => {
    const engine = loadEngine();
    const initial = engine.getLessonProgress();
    t.equal('starts empty', initial.completed.length, 0);

    engine.markLessonComplete('l0');
    const after1 = engine.getLessonProgress();
    t.equal('records the completed lesson', after1.completed.includes('l0'), true);
    t.equal('tracks it as last visited', after1.lastVisited, 'l0');

    engine.markLessonComplete('l2');
    const after2 = engine.getLessonProgress();
    t.equal('accumulates completed lessons rather than overwriting', after2.completed.length, 2);
    t.equal('last visited updates to the newest', after2.lastVisited, 'l2');

    engine.markLessonComplete('l0'); // mark the same lesson complete again
    const after3 = engine.getLessonProgress();
    t.equal('marking the same lesson complete twice does not duplicate it', after3.completed.length, 2);
  });

  await describe('quiz progress', async (t) => {
    const engine = loadEngine();
    const initial = engine.getQuizProgress();
    t.equal('starts with no best score', initial.bestScore, null);
    t.equal('starts with zero attempts', initial.attempts, 0);

    engine.recordQuizAttempt({ correct: 3, total: 5, percent: 60 });
    const after1 = engine.getQuizProgress();
    t.equal('records the attempt count', after1.attempts, 1);
    t.equal('records the score as the best so far', after1.bestScore.percent, 60);

    engine.recordQuizAttempt({ correct: 2, total: 5, percent: 40 });
    const after2 = engine.getQuizProgress();
    t.equal('attempt count increments', after2.attempts, 2);
    t.equal('a WORSE attempt does not overwrite the best score', after2.bestScore.percent, 60);

    engine.recordQuizAttempt({ correct: 5, total: 5, percent: 100 });
    const after3 = engine.getQuizProgress();
    t.equal('a BETTER attempt does update the best score', after3.bestScore.percent, 100);
    t.check('lastAttemptAt is recorded', !!after3.lastAttemptAt);
  });

  await describe('progress is isolated per test session (no cross-test leakage)', async (t) => {
    // Each loadEngine() call gets its own fresh vm context/localStorage —
    // verifies tests can't accidentally see another test file's state.
    const engine = loadEngine();
    const fresh = engine.getLessonProgress();
    t.equal('a newly loaded engine has no progress from other test files', fresh.completed.length, 0);
  });

  await describe('lesson progress survives corrupted/malformed stored data', async (t) => {
    // Regression guard: a hand-edited or legacy-schema value used to THROW
    // ("progress.completed.push is not a function") the moment any code
    // tried to use it, rather than falling back to sane defaults.
    const engine = loadEngine();
    engine.localStorage.setItem('chartlab:v1:lessonProgress', JSON.stringify({ completed: 'not-an-array' }));
    t.equal('getLessonProgress falls back to defaults instead of returning the bad shape', engine.getLessonProgress().completed.length, 0);
    let threw = false;
    try{ engine.markLessonComplete('l0'); }catch(e){ threw = true; }
    t.equal('markLessonComplete does not throw on corrupted prior data', threw, false);
    t.equal('recovers to a working, correct state', engine.getLessonProgress().completed[0], 'l0');

    engine.localStorage.setItem('chartlab:v1:lessonProgress', 'not even valid json{{{');
    t.equal('malformed JSON also falls back to defaults, not a throw', engine.getLessonProgress().completed.length, 0);

    engine.localStorage.setItem('chartlab:v1:lessonProgress', JSON.stringify({ completed: [1, 2, 3] }));
    t.equal('an array of the wrong element type is also rejected as invalid shape', engine.getLessonProgress().completed.length, 0);
  });

  await describe('quiz progress survives corrupted/malformed stored data', async (t) => {
    // Regression guard: a malformed bestScore (e.g. a bare number instead
    // of {correct,total,percent}) used to silently corrupt further —
    // attempts could become NaN/null and a correct new score could never
    // overwrite a bestScore comparison against `undefined`.
    const engine = loadEngine();
    engine.localStorage.setItem('chartlab:v1:quizProgress', JSON.stringify({ bestScore: 42, attempts: 'three' }));
    const fallback = engine.getQuizProgress();
    t.equal('getQuizProgress falls back to defaults instead of the bad shape', fallback.attempts, 0);
    t.equal('fallback bestScore is null, not the malformed 42', fallback.bestScore, null);

    const after = engine.recordQuizAttempt({ correct: 1, total: 2, percent: 50 });
    t.equal('attempts is a real number, never NaN', Number.isFinite(after.attempts), true);
    t.equal('attempts counts correctly from the recovered baseline', after.attempts, 1);
    t.equal('bestScore is recorded correctly after recovery', after.bestScore.percent, 50);

    engine.localStorage.setItem('chartlab:v1:quizProgress', 'not even valid json{{{');
    t.equal('malformed JSON also falls back to defaults, not a throw', engine.getQuizProgress().attempts, 0);
  });

  if(require.main === module) finalizeSuites();
})();
