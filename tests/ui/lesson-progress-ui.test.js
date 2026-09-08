const { loadPage, waitFor } = require('../helpers/dom-harness.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');

(async () => {
  await describe('Lesson progress UI: injection, mark-complete, nav badges', async (t) => {
    const { window, document } = await loadPage();
    t.equal('footer injected into all 8 lessons', document.querySelectorAll('.lesson-progress-footer').length, 8);
    t.equal('prev/next links present', document.querySelectorAll('.lesson-nav-arrow').length, 14);
    t.equal('summary starts at 0/8', document.getElementById('lesson-progress-summary').textContent, '0/8');

    document.getElementById('complete-l0').click();
    t.check('button shows completed state', document.getElementById('complete-l0').classList.contains('done'));
    t.check('nav link gets the done marker', document.querySelector('.lesson-nav a[href="#l0"]').classList.contains('lesson-done'));
    t.equal('summary updates', document.getElementById('lesson-progress-summary').textContent, '1/8');
    t.equal('persisted to storage', window.getLessonProgress().completed.includes('l0'), true);

    document.getElementById('complete-l0').click(); // toggle off
    t.check('un-marking removes the done state', !document.getElementById('complete-l0').classList.contains('done'));
    t.equal('summary decrements', document.getElementById('lesson-progress-summary').textContent, '0/8');
  });

  await describe('Lesson progress UI: existing lesson content untouched', async (t) => {
    const { document } = await loadPage();
    t.equal('8 lesson sections still present', document.querySelectorAll('section.lesson').length, 8);
    t.equal('19 lesson canvases still present', document.querySelectorAll('canvas').length, 19);
    t.check('original lesson content intact', document.querySelector('#l0 .lesson-intro') !== null);
  });

  if(require.main === module) finalizeSuites();
})();
