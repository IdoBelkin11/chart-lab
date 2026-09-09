// Locks in the Session 3 learning-experience redesign STRUCTURE (header,
// hero, lesson composition, lesson nav, shared lesson components). Asserts
// structure and the design-system contract (no hardcoded legacy gold ink),
// not pixels — so a later session that accidentally drops one of these
// fails loudly instead of silently regressing.
const { loadPage, waitFor } = require('../helpers/dom-harness.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');

(async () => {
  await describe('Header & hero: premium structure intact', async (t) => {
    const { document } = await loadPage();
    t.check('brand mark chip present', !!document.querySelector('.brand .mark'));
    t.check('theme toggle present', !!document.getElementById('theme-toggle'));
    t.check('language toggle present', !!document.querySelector('.lang-toggle'));
    t.check('hero headline present', !!document.querySelector('.hero h1'));
    t.equal('hero learning-path pills render', document.querySelectorAll('.hero .path span').length, 4);
  });

  await describe('Lesson composition: consistent structure across all 8 lessons', async (t) => {
    const { document } = await loadPage();
    t.equal('eight lesson sections', document.querySelectorAll('section.lesson').length, 8);
    t.equal('each lesson has a tag pill', document.querySelectorAll('.lesson-head .lesson-tag').length, 8);
    t.equal('each lesson has a title', document.querySelectorAll('.lesson-head h2').length, 8);
    t.equal('worth-knowing callouts present', document.querySelectorAll('.deeper-dive').length, 8);
    t.check('every deeper-dive has its label', [...document.querySelectorAll('.deeper-dive')].every(d => !!d.querySelector('.dd-label')));
    t.equal('all lesson charts still present', document.querySelectorAll('canvas').length, 19);
  });

  await describe('Lesson nav: scroll-spy links + progress summary', async (t) => {
    const { window, document } = await loadPage();
    await waitFor(() => !!document.getElementById('complete-l0'));
    t.equal('eight nav links', document.querySelectorAll('.lesson-nav a').length, 8);
    t.check('progress summary element present', !!document.getElementById('lesson-progress-summary'));
    // Completing a lesson updates both the summary and the nav badge.
    document.getElementById('complete-l0').click();
    t.check('nav badge appears on completion', document.querySelector('.lesson-nav a[href="#l0"]').classList.contains('lesson-done'));
    t.equal('summary counts completion', document.getElementById('lesson-progress-summary').textContent, '1/8');
    document.getElementById('complete-l0').click();
  });

  await describe('Design-system contract: no legacy hardcoded gold ink in the shipped page', async (t) => {
    const fs = require('fs');
    const { DIST_PATH } = require('../helpers/dom-harness.js');
    const html = fs.readFileSync(DIST_PATH, 'utf-8');
    // The warm-gold ink (#1a1305) was a leftover from the pre-accent
    // palette; Sessions 2–3 removed it. Guard against it creeping back.
    t.equal('no #1a1305 anywhere in the build', (html.match(/#1a1305/g) || []).length, 0);
  });

  await describe('Shared lesson components: panel, legend, feedback still wired', async (t) => {
    const { window, document } = await loadPage();
    // Lesson 1's reveal flow drives the legend + feedback — exercise it.
    t.check('lesson 1 reveal button present', !!document.getElementById('l1-reveal-btn'));
    t.check('lesson 1 legend container present', !!document.getElementById('l1-legend'));
    window.toggleL1Reveal();
    t.equal('revealing shows the legend', document.getElementById('l1-legend').style.display, 'block');
    t.check('legend items rendered', document.querySelectorAll('#l1-legend .legend-item').length >= 3);
  });

  if(require.main === module) finalizeSuites();
})();
