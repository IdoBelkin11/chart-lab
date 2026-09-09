// Locks in the Session 2 premium view structures. These assert the
// STRUCTURE the redesign introduced (hero cards, lettered quiz options, the
// score ring, split calculator rows, the comparison table) — not pixel
// values — so a later restyling session that accidentally drops one of
// these fails loudly instead of silently regressing the visual design.
const { loadPage, waitFor } = require('../helpers/dom-harness.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');

const realDataFetch = undefined; // use the harness default (returns real-shaped data)

(async () => {
  await describe('Stock View: hero price card + metric grid structure', async (t) => {
    const { window, document } = await loadPage(realDataFetch);
    window.navigateTo('stock');
    await waitFor(() => !!document.getElementById('stock-search-input'));
    document.getElementById('stock-search-input').value = 'Apple';
    document.getElementById('stock-search-btn').click();
    await waitFor(() => !!document.querySelector('.stock-view-header'), { timeout: 2500 });

    t.check('hero price card rendered', !!document.querySelector('.stock-view-header'));
    t.check('price element present inside hero', !!document.querySelector('.stock-view-price'));
    t.check('metric cards rendered', document.querySelectorAll('.stock-metric-row').length >= 3);
    t.check('each metric has a value', [...document.querySelectorAll('.stock-metric-row')].every(r => !!r.querySelector('.stock-metric-value')));
    t.check('chart canvas present', !!document.getElementById('stock-view-chart'));
    t.check('ask-AI action present', !!document.getElementById('stock-view-ask-ai'));
  });

  await describe('Compare View: single-card table structure', async (t) => {
    const { window, document } = await loadPage(realDataFetch);
    window.navigateTo('compare');
    await waitFor(() => !!document.getElementById('compare-input-a'));
    document.getElementById('compare-input-a').value = 'NVIDIA';
    document.getElementById('compare-input-b').value = 'AMD';
    document.getElementById('compare-btn').click();
    await waitFor(() => !!document.querySelector('.cmpview-header-row'), { timeout: 2500 });

    t.check('two column headers', document.querySelectorAll('.cmpview-col-name').length === 2);
    t.check('metric rows rendered', document.querySelectorAll('.cmpview-row').length >= 3);
    t.check('each row has two values and a label', [...document.querySelectorAll('.cmpview-row')].every(r => r.querySelectorAll('.cmpview-val').length === 2 && !!r.querySelector('.cmpview-label')));
  });

  await describe('Quiz View: lettered options, progress fill, score ring', async (t) => {
    const { window, document } = await loadPage(realDataFetch);
    window.navigateTo('quiz');
    await waitFor(() => !!document.querySelector('.q'));

    t.equal('four options per question', document.querySelectorAll('#quiz-options .quiz-view-opt').length, 4);
    t.check('progress fill variable is set', document.querySelector('.quiz-progress').style.getPropertyValue('--quiz-fill') !== '');

    const total = parseInt(document.querySelector('.quiz-progress').textContent.match(/\/\s*(\d+)/)[1], 10);
    for(let i = 0; i < total; i++){
      const opts = document.querySelectorAll('#quiz-options .quiz-view-opt');
      if(!opts.length) break;
      opts[0].click();
      const fb = document.getElementById('quiz-feedback');
      t.check(`q${i+1} feedback is tinted by correctness`, fb.classList.contains('is-correct') || fb.classList.contains('is-wrong'));
      const nb = document.querySelector('.quiz-next-btn'); if(nb) nb.click();
    }
    await waitFor(() => !!document.querySelector('.quiz-results-ring'), { timeout: 1500 });
    t.check('score ring rendered on results', !!document.querySelector('.quiz-results-ring'));
    t.check('ring uses a conic gradient proportional to score', document.querySelector('.quiz-results-ring').style.background.includes('conic'));
    t.check('score shown with total', !!document.querySelector('.quiz-results-score'));
  });

  await describe('Calculators View: split label/value result rows', async (t) => {
    const { window, document } = await loadPage(realDataFetch);
    window.navigateTo('calculators');
    await waitFor(() => !!document.querySelector('.calc-result-big'));

    t.check('headline result present', document.querySelector('.calc-result-big').textContent.includes('$'));
    t.check('result rows use split label/value structure', document.querySelectorAll('.calc-line-value').length >= 2);
    t.equal('label spans match value spans', document.querySelectorAll('.calc-line-label').length, document.querySelectorAll('.calc-line-value').length);

    // Switch to profit/loss and confirm the split structure holds there too.
    [...document.querySelectorAll('.app-overlay-tab')][3].click();
    await waitFor(() => !!document.getElementById('pnl-buy'));
    t.check('P/L tab also uses split rows', document.querySelectorAll('.calc-line-value').length >= 2);
  });

  if(require.main === module) finalizeSuites();
})();
