// Floating-action stack + redesigned controls. The overlap bug (nav FAB,
// AI FAB, and scroll-to-top independently positioning themselves into the
// same corner) is exactly the kind of thing that silently regresses when
// someone later re-touches positioning CSS — so the structural invariant
// (to-top and the AI launcher live in ONE .fab-stack) is locked down here.
//
// The tools/nav menu used to be a third member of that stack, but its
// upward-opening dropdown collided with the AI launcher right below it,
// and sitting next to it made it read as an AI feature rather than site
// navigation — confirmed as a real point of user confusion. It now lives
// in the header instead, opening downward like an ordinary menu; this
// file locks in that separation too, so it can't drift back into the
// floating stack.
const { loadPage, waitFor } = require('../helpers/dom-harness.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');

(async () => {
  await describe('Floating actions share a single stack (no independent positioning)', async (t) => {
    const { document } = await loadPage();
    const stack = document.querySelector('.fab-stack');
    t.check('a single .fab-stack exists', !!stack);
    for(const id of ['to-top', 'ai-fab']){
      const el = document.getElementById(id);
      t.check(`#${id} is inside the shared stack`, !!el && el.closest('.fab-stack') === stack);
    }
    t.equal('exactly one fab-stack on the page', document.querySelectorAll('.fab-stack').length, 1);
  });

  await describe('Tools menu lives in the header, separate from the AI launcher', async (t) => {
    const { document } = await loadPage();
    const fab = document.getElementById('app-nav-fab');
    const header = document.querySelector('header');
    const stack = document.querySelector('.fab-stack');
    t.check('the menu button exists inside the header', !!fab && header.contains(fab));
    t.check('it is NOT inside the floating-action stack (no more AI-adjacent confusion)', !stack.contains(fab));
    t.check('it has a visible text label, not just an icon (non-technical audience)', document.querySelector('#app-nav-fab span') && document.querySelector('#app-nav-fab span').textContent.length > 0);
  });

  await describe('Nav menu: open/close, aria, item navigation', async (t) => {
    const { window, document } = await loadPage();
    t.equal('starts collapsed (aria-expanded=false)', document.getElementById('app-nav-fab').getAttribute('aria-expanded'), 'false');
    window.toggleAppNavMenu();
    t.check('menu opens', document.getElementById('app-nav-menu').classList.contains('open'));
    t.equal('aria-expanded flips to true', document.getElementById('app-nav-fab').getAttribute('aria-expanded'), 'true');
    t.equal('four destinations', document.querySelectorAll('#app-nav-menu button').length, 4);

    document.querySelector('#app-nav-menu button').click(); // Stock Search
    await waitFor(() => !!document.getElementById('stock-view-overlay'));
    t.check('selecting an item routes to that view', document.getElementById('stock-view-overlay').classList.contains('open'));
    t.check('menu auto-closes after selection', !document.getElementById('app-nav-menu').classList.contains('open'));
    t.equal('aria-expanded resets to false', document.getElementById('app-nav-fab').getAttribute('aria-expanded'), 'false');
  });

  await describe('Compact mark-complete control: toggle, badge, persistence, summary', async (t) => {
    const { window, document } = await loadPage();
    await waitFor(() => !!document.getElementById('complete-l0'));
    const btn = document.getElementById('complete-l0');
    t.check('control exists on the lesson', !!btn);
    t.check('starts not-done', !btn.classList.contains('done'));

    btn.click();
    t.check('toggles to done', btn.classList.contains('done'));
    t.check('adds the nav completion badge', document.querySelector('.lesson-nav a[href="#l0"]').classList.contains('lesson-done'));
    t.equal('summary reflects 1 complete', document.getElementById('lesson-progress-summary').textContent, '1/8');
    t.equal('persists to storage', window.getLessonProgress().completed.includes('l0'), true);

    btn.click();
    t.check('toggles back to not-done', !btn.classList.contains('done'));
    t.equal('summary returns to 0', document.getElementById('lesson-progress-summary').textContent, '0/8');
  });

  if(require.main === module) finalizeSuites();
})();
