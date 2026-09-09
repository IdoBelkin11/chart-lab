// Locks in this round of fixes: the AI FAB "AI" tag rendering in the wrong
// place except on hover (a containing-block bug — .fab-stack forces
// position:static !important on its direct children, so the tag needs its
// own dedicated positioning context), the redesigned lesson pager bar
// (icon prev/next + "Page X of Y" + centered completion control, replacing
// the old bordered full-width footer), and the site footer disclaimer
// actually being centered.
const { loadPage, waitFor, DIST_PATH } = require('../helpers/dom-harness.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');
const fs = require('fs');

function stylesheet(){ const m = fs.readFileSync(DIST_PATH,'utf-8').match(/<style[^>]*>([\s\S]*?)<\/style>/); return m ? m[1] : ''; }

(async () => {
  await describe('AI FAB "AI" tag has a stable containing block (not hover-dependent)', async (t) => {
    const { document } = await loadPage();
    const fab = document.querySelector('.ai-fab');
    const inner = document.querySelector('.ai-fab-inner');
    const tag = document.querySelector('.ai-fab-tag');
    const dot = document.querySelector('.ai-dot');
    t.check('a dedicated inner wrapper exists', !!inner);
    t.check('inner wrapper is a direct child of the button (unaffected by .fab-stack > * !important)', fab.firstElementChild === inner);
    t.check('the tag lives inside that wrapper, not directly in the button', inner.contains(tag) && tag.parentElement === inner);
    t.check('the status dot also lives inside that wrapper', inner.contains(dot) && dot.parentElement === inner);
    const css = stylesheet();
    t.check('the inner wrapper establishes its own relative positioning context', /\.ai-fab-inner\{[^}]*position:relative/.test(css));
  });

  await describe('Lesson pager: icon prev/next + page count, no longer a heavy bordered footer', async (t) => {
    const { window, document } = await loadPage();
    await waitFor(() => !!document.getElementById('complete-l0'));
    t.equal('page count reads "Page 1 of 8" on the first lesson', document.querySelector('#l0 .lesson-pager-count').textContent, 'Page 1 of 8');
    t.check('prev arrow is disabled on the first lesson', document.querySelector('#l0 .lesson-pager-arrow.prev').disabled);
    t.check('next arrow is enabled on the first lesson', !document.querySelector('#l0 .lesson-pager-arrow.next').disabled);

    const css = stylesheet();
    t.check('the pager bar no longer has a border-top (not a distinct footer section)', !/\.lesson-progress-footer\{[^}]*border-top/.test(css));
    t.check('the pager bar is horizontally centered', /\.lesson-progress-footer\{[^}]*justify-content:center/.test(css));
  });

  await describe('Lesson pager: next/prev buttons actually page through lessons in sequence', async (t) => {
    const { window, document } = await loadPage();
    await waitFor(() => !!document.getElementById('complete-l0'));
    const ids = ['l0','l1','l2','l3','l4','l5','l6','l7'];
    for(let i = 0; i < 7; i++){
      document.querySelector(`#${ids[i]} .lesson-pager-arrow.next`).click();
    }
    t.equal('reaches the last lesson after 7 sequential next-clicks', window.getComputedStyle(document.getElementById('l7')).display, 'block');
    t.equal('page count updates to reflect it', document.querySelector('#l7 .lesson-pager-count').textContent, 'Page 8 of 8');
    t.check('next arrow disables on the last lesson', document.querySelector('#l7 .lesson-pager-arrow.next').disabled);
    document.querySelector('#l7 .lesson-pager-arrow.prev').click();
    t.equal('prev arrow steps back correctly', window.getComputedStyle(document.getElementById('l6')).display, 'block');
  });

  await describe('Lesson pager: mark-complete still works, now centered alongside the page count', async (t) => {
    const { window, document } = await loadPage();
    await waitFor(() => !!document.getElementById('complete-l0'));
    document.getElementById('complete-l0').click();
    t.check('completion still toggles', document.getElementById('complete-l0').classList.contains('done'));
    t.check('completion button and page count share one centered group', document.getElementById('complete-l0').closest('.lesson-pager-center').contains(document.querySelector('#l0 .lesson-pager-count')));
    document.getElementById('complete-l0').click();
  });

  await describe('Site footer disclaimer is actually centered', async (t) => {
    const css = stylesheet();
    t.check('footer wrap centers its text', /footer \.wrap\{text-align:center;?\}/.test(css));
    t.check('footer paragraph is width-constrained and self-centered', /footer p\{max-width:70ch; margin:0 auto/.test(css));
  });

  if(require.main === module) finalizeSuites();
})();
