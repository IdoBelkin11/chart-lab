// Locks in this round of user-reported fixes: the AI chat "start over"
// button, the topic-browse panel updating in place instead of stacking,
// the overlay scrollbar sitting at the true edge (not centered mid-screen
// on wide viewports), and the enlarged, labeled AI launcher.
const { loadPage, waitFor, DIST_PATH } = require('../helpers/dom-harness.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');
const fs = require('fs');

function stylesheet(){ const m = fs.readFileSync(DIST_PATH,'utf-8').match(/<style[^>]*>([\s\S]*?)<\/style>/); return m ? m[1] : ''; }

(async () => {
  await describe('AI chat: restart button returns to the home/example screen', async (t) => {
    const { window, document } = await loadPage();
    window.navigateTo('ai');
    await waitFor(() => !!document.getElementById('ai-input'));
    document.getElementById('ai-input').value = 'מה זה RSI';
    await window.sendAiMessage();
    t.check('a real conversation exists before reset', document.querySelectorAll('#ai-messages .ai-bubble').length > 0);
    t.check('restart control exists in the header', !!document.querySelector('.ai-restart'));
    document.querySelector('.ai-restart').click();
    t.equal('messages are cleared', document.querySelectorAll('#ai-messages .ai-bubble').length, 0);
    t.check('the example-questions home screen is visible again', document.getElementById('ai-empty').style.display !== 'none');
    t.check('example chips are re-rendered', document.querySelectorAll('.ai-example-btn').length > 0);
  });

  await describe('AI chat: browsing topics updates one panel in place, never stacks', async (t) => {
    const { window, document } = await loadPage();
    window.navigateTo('ai');
    await waitFor(() => !!document.getElementById('ai-input'));
    const browseBtn = [...document.querySelectorAll('.ai-example-btn')].find(b => b.textContent.includes('📚'));
    t.check('a browse-all-topics entry point exists', !!browseBtn);
    browseBtn.click();
    t.equal('exactly one browse panel exists', document.querySelectorAll('#ai-browse-panel').length, 1);
    const categoryChip = document.querySelector('#ai-browse-panel .ai-example-btn');
    categoryChip.click();
    t.equal('still exactly one panel after drilling into a category (replaced, not stacked)', document.querySelectorAll('#ai-browse-panel').length, 1);
    t.equal('the panel is still the only row in the message log', document.querySelectorAll('#ai-messages > *').length, 1);
    const chips = document.querySelectorAll('#ai-browse-panel .ai-example-btn');
    t.check('a back-to-categories chip is offered', chips[0].textContent.includes('←'));
    chips[0].click();
    t.check('back button returns to the category list', document.querySelectorAll('#ai-browse-panel .ai-example-btn').length > 1);
  });

  await describe('AI chat: sending a real message ends an in-progress browse session', async (t) => {
    const { window, document } = await loadPage();
    window.navigateTo('ai');
    await waitFor(() => !!document.getElementById('ai-input'));
    [...document.querySelectorAll('.ai-example-btn')].find(b => b.textContent.includes('📚')).click();
    document.getElementById('ai-input').value = 'תגיד לי על אפל';
    await window.sendAiMessage();
    t.equal('the browse panel is gone once a real question is asked', document.querySelectorAll('#ai-browse-panel').length, 0);
  });

  await describe('Overlay scrollbar sits at the true edge, not centered on wide screens', async (t) => {
    const css = stylesheet();
    // The scrolling element itself must NOT be width-constrained/centered —
    // only its inner content should be. This is the actual bug: centering
    // the scrolling container centers its native scrollbar too.
    t.check('the scrolling container has no centering max-width at desktop', !/\.app-overlay-content\{padding:0 32px 24px; max-width/.test(css));
    t.check('the widget pane centers itself independently instead', /\.app-overlay-pane\{max-width:1100px; margin:0 auto;\}/.test(css));
    t.check('a thin custom scrollbar is applied (not the bulky default)', css.includes('app-overlay-content::-webkit-scrollbar{width:6px;}'));
  });

  await describe('AI launcher: enlarged and labeled for discoverability', async (t) => {
    const { window, document } = await loadPage();
    const cs = window.getComputedStyle(document.documentElement);
    t.equal('AI FAB size increased from the previous 58px', cs.getPropertyValue('--fab-ai-size').trim(), '68px');
    t.check('a persistent "AI" nameplate is present on the button', !!document.querySelector('.ai-fab-tag'));
    t.equal('the nameplate reads AI', document.querySelector('.ai-fab-tag').textContent, 'AI');
  });

  if(require.main === module) finalizeSuites();
})();
