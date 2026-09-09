const { loadPage, waitFor } = require('../helpers/dom-harness.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');

(async () => {
  await describe('Quiz UI: full flow, scoring, persistence, restart', async (t) => {
    const { window, document } = await loadPage();
    window.navigateTo('quiz');
    await waitFor(() => !!document.getElementById('quiz-overlay'));
    t.check('overlay opens', document.getElementById('quiz-overlay').classList.contains('open'));
    t.check('first question rendered', !!document.querySelector('.q'));
    t.equal('4 options rendered', document.querySelectorAll('#quiz-options .quiz-view-opt').length, 4);

    const totalMatch = document.querySelector('.quiz-progress').textContent.match(/\/\s*(\d+)/);
    const total = totalMatch ? parseInt(totalMatch[1], 10) : 8;
    for(let i = 0; i < total; i++){
      const opts = document.querySelectorAll('#quiz-options .quiz-view-opt');
      if(!opts.length) break;
      opts[0].click();
      const nextBtn = document.querySelector('.quiz-next-btn');
      if(nextBtn) nextBtn.click();
    }
    t.check('results screen shown after answering all questions', !!document.querySelector('.quiz-results-score'));

    const progress = window.getQuizProgress();
    t.equal('attempt recorded in persistence', progress.attempts, 1);
    t.check('bestScore recorded', !!progress.bestScore);

    document.querySelector('.quiz-next-btn').click(); // "try again"
    t.check('restart returns to question 1', document.querySelector('.quiz-progress').textContent.startsWith('1'));

    window.navigateTo('');
    t.check('overlay closes', !document.getElementById('quiz-overlay').classList.contains('open'));
  });

  await describe('Quiz UI: correct vs incorrect feedback is visually distinct', async (t) => {
    const { window, document } = await loadPage();
    window.navigateTo('quiz');
    await waitFor(() => !!document.querySelector('.q'));
    const firstOpt = document.querySelector('#quiz-options .quiz-view-opt');
    firstOpt.click();
    t.check('clicked option gets marked right or wrong (visually distinct feedback)', firstOpt.classList.contains('right') || firstOpt.classList.contains('wrong'));
    t.check('feedback explanation shown', document.getElementById('quiz-feedback').classList.contains('show'));
    t.check('options become disabled after answering', firstOpt.disabled === true);
  });

  if(require.main === module) finalizeSuites();
})();
