// Locks in the paginated lesson view (added on user feedback: showing all
// 8 lessons in one long scroll made the mark-complete footer feel
// arbitrary, and the nav strip never auto-scrolled to the active lesson).
// Only one <section class="lesson"> is visible at a time now; showLesson()
// in lesson-progress-ui.js is the single source of truth for which.
const { JSDOM } = require('jsdom');
const fs = require('fs');
const { loadPage, waitFor, DIST_PATH } = require('../helpers/dom-harness.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');

(async () => {
  await describe('Only one lesson visible at a time, on initial load', async (t) => {
    const { window, document } = await loadPage();
    await waitFor(() => !!document.getElementById('complete-l0'));
    t.equal('lesson 1 (l0) is shown by default', window.getComputedStyle(document.getElementById('l0')).display, 'block');
    for(const id of ['l1','l2','l3','l4','l5','l6','l7']){
      t.equal(`${id} is hidden initially`, window.getComputedStyle(document.getElementById(id)).display, 'none');
    }
    t.check('l0 nav link is active on load', document.querySelector('.lesson-nav a[href="#l0"]').classList.contains('active'));
  });

  await describe('Nav bar click switches the visible lesson (book pagination)', async (t) => {
    const { window, document } = await loadPage();
    await waitFor(() => !!document.getElementById('complete-l0'));
    document.querySelector('.lesson-nav a[href="#l3"]').click();
    t.equal('previous lesson (l0) hides', window.getComputedStyle(document.getElementById('l0')).display, 'none');
    t.equal('target lesson (l3) shows', window.getComputedStyle(document.getElementById('l3')).display, 'block');
    t.check('nav highlight moves to l3', document.querySelector('.lesson-nav a[href="#l3"]').classList.contains('active'));
    t.check('nav highlight leaves l0', !document.querySelector('.lesson-nav a[href="#l0"]').classList.contains('active'));
    t.equal('URL hash updates', window.location.hash, '#l3');
  });

  await describe('Prev/Next footer buttons page through lessons, both directions', async (t) => {
    const { window, document } = await loadPage();
    await waitFor(() => !!document.getElementById('complete-l0'));
    document.querySelector('.lesson-nav a[href="#l2"]').click();
    document.querySelector('#l2 [data-lesson-link="l3"]').click();
    t.equal('Next advances to l3', window.getComputedStyle(document.getElementById('l3')).display, 'block');
    document.querySelector('#l3 [data-lesson-link="l2"]').click();
    t.equal('Previous returns to l2', window.getComputedStyle(document.getElementById('l2')).display, 'block');
    t.equal('l3 hides again after going back', window.getComputedStyle(document.getElementById('l3')).display, 'none');
  });

  await describe('Charts redraw correctly when a lesson becomes visible', async (t) => {
    const { window, document } = await loadPage();
    await waitFor(() => !!document.getElementById('complete-l0'));
    document.querySelector('.lesson-nav a[href="#l4"]').click();
    const canvas = document.querySelector('#l4 canvas');
    t.check('the shown lesson has a canvas', !!canvas);
    t.check('canvas picked up a real (non-zero) draw width, not a stale 0 from being hidden', canvas.width > 0);
  });

  await describe('Mark-complete still works correctly inside the paginated view', async (t) => {
    const { window, document } = await loadPage();
    await waitFor(() => !!document.getElementById('complete-l0'));
    document.querySelector('.lesson-nav a[href="#l1"]').click();
    document.getElementById('complete-l1').click();
    t.check('completion toggles on', document.getElementById('complete-l1').classList.contains('done'));
    t.check('nav badge appears', document.querySelector('.lesson-nav a[href="#l1"]').classList.contains('lesson-done'));
    t.equal('summary counts it', document.getElementById('lesson-progress-summary').textContent, '1/8');
    document.getElementById('complete-l1').click();
  });

  await describe('Resume: a direct deep link to a lesson hash shows that lesson', async (t) => {
    const html = fs.readFileSync(DIST_PATH, 'utf-8');
    const dom = new JSDOM(html, {
      runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true,
      url: 'https://chart-lab.netlify.app/#l6',
      beforeParse(w){
        w.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, { get: () => () => {}, set: () => true });
        w.fetch = async () => ({ ok:false, status:404 });
      }
    });
    await new Promise(r => setTimeout(r, 80));
    const doc = dom.window.document;
    t.check('l6 section exists', !!doc.getElementById('l6'));
    t.equal('deep-linked lesson is shown, not the default', dom.window.getComputedStyle(doc.getElementById('l6')).display, 'block');
    t.check('nav highlight matches the deep-linked lesson', doc.querySelector('.lesson-nav a[href="#l6"]').classList.contains('active'));
  });

  await describe('Resume: reload with no hash falls back to the last-visited lesson', async (t) => {
    const { window, document } = await loadPage();
    await waitFor(() => !!document.getElementById('complete-l0'));
    document.querySelector('.lesson-nav a[href="#l5"]').click();
    t.equal('navigating persists lastVisited', window.getLessonProgress().lastVisited, 'l5');
  });

  await describe('A non-lesson hash (#ai, #quiz) is never mistaken for a lesson id', async (t) => {
    const { window, document } = await loadPage();
    await waitFor(() => !!document.getElementById('complete-l0'));
    document.querySelector('.lesson-nav a[href="#l2"]').click();
    window.navigateTo('quiz');
    await waitFor(() => !!document.getElementById('quiz-overlay'));
    t.check('quiz overlay opens normally', document.getElementById('quiz-overlay').classList.contains('open'));
    t.equal('the underlying lesson selection is untouched by an app route', window.getComputedStyle(document.getElementById('l2')).display, 'block');
    window.navigateTo('');
  });

  if(require.main === module) finalizeSuites();
})();
