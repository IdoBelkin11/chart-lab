const { loadPage, waitFor } = require('../helpers/dom-harness.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');

(async () => {
  await describe('Calculators UI: compound interest default + tab switching', async (t) => {
    const { window, document } = await loadPage();
    window.navigateTo('calculators');
    await waitFor(() => !!document.querySelector('.calc-result-big'));
    t.check('default compound-interest result rendered', document.querySelector('.calc-result-big').textContent.includes('$'));

    const tabs = [...document.querySelectorAll('.app-overlay-tab')];
    t.equal('4 calculator tabs', tabs.length, 4);
    tabs[1].click(); // DCA
    await waitFor(() => document.getElementById('dca-amount') !== null);
    t.check('DCA tab shows its own inputs', !!document.getElementById('dca-amount'));
  });

  await describe('Calculators UI: % return live-updates on input', async (t) => {
    const { window, document } = await loadPage();
    window.navigateTo('calculators');
    await waitFor(() => !!document.querySelector('.app-overlay-tab'));
    [...document.querySelectorAll('.app-overlay-tab')][2].click(); // % Return
    await waitFor(() => !!document.getElementById('ret-initial'));
    document.getElementById('ret-initial').value = 100;
    document.getElementById('ret-initial').dispatchEvent(new window.Event('input'));
    document.getElementById('ret-final').value = 150;
    document.getElementById('ret-final').dispatchEvent(new window.Event('input'));
    t.equal('computes +50% correctly and live', document.querySelector('.calc-result-big').textContent.trim(), '+50.00%');
  });

  await describe('Calculators UI: invalid input handled without throwing', async (t) => {
    const { window, document } = await loadPage();
    window.navigateTo('calculators');
    await waitFor(() => !!document.querySelector('.app-overlay-tab'));
    [...document.querySelectorAll('.app-overlay-tab')][2].click();
    await waitFor(() => !!document.getElementById('ret-initial'));
    document.getElementById('ret-initial').value = 0;
    document.getElementById('ret-initial').dispatchEvent(new window.Event('input'));
    t.check('zero initial value shows a validation note, not a crash', document.querySelector('.calc-note') !== null);
  });

  if(require.main === module) finalizeSuites();
})();
