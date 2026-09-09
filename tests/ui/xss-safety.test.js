// Security regression: user-typed and API-derived strings must never
// become live DOM when rendered into the UI's innerHTML template literals.
// This exists because it was a REAL, confirmed hole (not a hypothetical) —
// found during the Senior Review by typing markup into the Compare search
// box and observing it parse into a live <svg> with an intact onload
// attribute. See docs/CLAUDE.md for the fix (escapeHtml in
// src/core/dom-safety.js).
const { loadPage, waitFor } = require('../helpers/dom-harness.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');

const PAYLOAD = '<svg onload="window.__xss__=true"><b>evil</b></svg>';

(async () => {
  await describe('Compare view: malicious search input cannot become live markup', async (t) => {
    const { window, document } = await loadPage(async () => ({ ok:false, status:404 }));
    window.navigateTo('compare');
    await waitFor(() => !!document.getElementById('compare-input-a'));

    document.getElementById('compare-input-a').value = PAYLOAD;
    document.getElementById('compare-input-b').value = 'AMD';
    document.getElementById('compare-btn').click();
    await waitFor(() => !!document.querySelector('#compare-results .stock-view-empty'));

    const results = document.getElementById('compare-results');
    t.equal('no live <svg> element was created from the payload', results.querySelectorAll('svg').length, 0);
    t.equal('no live <b> element was created from the payload', results.querySelectorAll('b').length, 0);
    t.check('the payload text is visible as inert text, not silently dropped', results.textContent.includes('svg'));
    t.equal('no live svg-with-onload element exists anywhere in the result', results.querySelectorAll('svg[onload]').length, 0);
  });

  await describe('Stock View: malicious search input cannot become live markup', async (t) => {
    const { window, document } = await loadPage(async () => ({ ok:false, status:404 }));
    window.navigateTo('stock');
    await waitFor(() => !!document.getElementById('stock-search-input'));

    document.getElementById('stock-search-input').value = PAYLOAD;
    document.getElementById('stock-search-btn').click();
    await waitFor(() => !!document.querySelector('#stock-search-results .stock-view-empty'));

    const results = document.getElementById('stock-search-results');
    t.equal('no live <svg> element created', results.querySelectorAll('svg').length, 0);
    t.equal('no live <b> element created', results.querySelectorAll('b').length, 0);
  });

  await describe('AI chat: a resolved company with an adversarial API name cannot inject markup', async (t) => {
    // The stock card and stock-detail overlay both render company.name/
    // exchange/ticker — all of which originate from Twelve Data's
    // instrument_name/symbol for a dynamically-resolved company. A
    // compromised or malformed API response is a more realistic vector
    // here than user input, since the user never types the company's
    // "official" name directly.
    const { window, document } = await loadPage(async (url) => {
      if(url.includes('/symbol_search')){
        return { ok:true, json: async () => ({ data: [
          { symbol: PAYLOAD, instrument_name: PAYLOAD, exchange: PAYLOAD, instrument_type:'Common Stock' }
        ]})};
      }
      return { ok:false, status:404 };
    });
    window.navigateTo('ai');
    await waitFor(() => !!document.getElementById('ai-input'));
    document.getElementById('ai-input').value = 'tell me about some totally unrecognized ticker xyz123';
    await window.sendAiMessage();
    await waitFor(() => document.querySelectorAll('#ai-messages .ai-bubble').length >= 2, { timeout: 3000 });

    const messages = document.getElementById('ai-messages');
    t.equal('no live <svg> element anywhere in the chat', messages.querySelectorAll('svg').length, 0);
    t.equal('no live element carries an onload attribute', messages.querySelectorAll('[onload]').length, 0);
    t.check('the adversarial name appears only as inert escaped text', messages.textContent.includes('svg'));
  });

  await describe('escapeHtml unit behavior', async (t) => {
    const { window } = await loadPage();
    t.equal('escapes angle brackets', window.escapeHtml('<b>hi</b>'), '&lt;b&gt;hi&lt;/b&gt;');
    t.equal('escapes quotes', window.escapeHtml(`"'`), '&quot;&#39;');
    t.equal('escapes ampersand', window.escapeHtml('A&B'), 'A&amp;B');
    t.equal('passes through plain text unchanged', window.escapeHtml('Apple Inc'), 'Apple Inc');
    t.equal('handles null safely', window.escapeHtml(null), '');
    t.equal('handles undefined safely', window.escapeHtml(undefined), '');
  });

  if(require.main === module) finalizeSuites();
})();
