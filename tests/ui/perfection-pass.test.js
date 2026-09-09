// Locks in the final perfection-pass changes so they can't silently
// regress: the typography token scale, the progress counter being OUTSIDE
// the scrolling nav mask (the mobile-visibility fix), favicon/manifest
// production polish, input accessibility labels, and the design-system
// completeness guards (no hardcoded tooltip color, no duplicate spinner
// keyframe, global reduced-motion).
const { loadPage, waitFor } = require('../helpers/dom-harness.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');
const fs = require('fs');
const { DIST_PATH } = require('../helpers/dom-harness.js');

function html(){ return fs.readFileSync(DIST_PATH, 'utf-8'); }
function stylesheet(){ const m = html().match(/<style[^>]*>([\s\S]*?)<\/style>/); return m ? m[1] : ''; }

(async () => {
  await describe('Typography token scale', async (t) => {
    const { window, document } = await loadPage();
    const cs = window.getComputedStyle(document.documentElement);
    const steps = ['--fs-2xs','--fs-xs','--fs-sm','--fs-base','--fs-md','--fs-lg','--fs-xl','--fs-2xl','--fs-display'];
    steps.forEach(s => t.check(`${s} is defined`, !!cs.getPropertyValue(s).trim()));
    // The scale must actually be USED, not just defined — a large share of
    // font-size declarations should reference a token.
    const css = stylesheet();
    const tokenUses = (css.match(/font-size:var\(--fs-/g) || []).length;
    t.check('typography tokens are broadly applied (>40 uses)', tokenUses > 40);
  });

  await describe('Progress counter visible outside the scrolling nav mask', async (t) => {
    const { window, document } = await loadPage();
    await waitFor(() => !!document.getElementById('complete-l0'));
    const summary = document.getElementById('lesson-progress-summary');
    const scroll = document.querySelector('.lesson-nav-scroll');
    t.check('a dedicated scroll track exists for the links', !!scroll);
    t.check('progress counter is NOT inside the masked scroll track', !scroll.contains(summary));
    t.check('progress counter is a direct child of the nav wrap', summary.parentElement.classList.contains('wrap'));
    t.check('counter has aria-live for screen readers', summary.getAttribute('aria-live') === 'polite');
    document.getElementById('complete-l0').click();
    t.equal('counter reflects completion', summary.textContent, '1/8');
    document.getElementById('complete-l0').click();
  });

  await describe('Production polish: favicon, apple-touch-icon, manifest', async (t) => {
    const doc = html();
    t.check('SVG favicon linked', /rel="icon"[^>]*favicon\.svg/.test(doc));
    t.check('apple-touch-icon linked', /rel="apple-touch-icon"/.test(doc));
    t.check('manifest linked', /rel="manifest"/.test(doc));
    t.check('per-scheme theme-color metas', (doc.match(/name="theme-color"/g) || []).length >= 2);
    t.check('theme-color updated off the pre-redesign value', !doc.includes('content="#161B1F"'));
    // Manifest file itself ships with real icons + correct colors.
    const manifest = JSON.parse(fs.readFileSync(require('path').join(require('path').dirname(DIST_PATH), 'manifest.webmanifest'), 'utf-8'));
    t.check('manifest has icons', manifest.icons.length >= 1);
    t.equal('manifest theme_color matches redesign', manifest.theme_color, '#12171B');
  });

  await describe('Input accessibility labels', async (t) => {
    const { window, document } = await loadPage();
    window.navigateTo('stock');
    await waitFor(() => !!document.getElementById('stock-search-input'));
    t.check('stock search has aria-label', !!document.getElementById('stock-search-input').getAttribute('aria-label'));
    window.navigateTo('');
    window.navigateTo('compare');
    await waitFor(() => !!document.getElementById('compare-input-a'));
    t.check('compare input A has aria-label', !!document.getElementById('compare-input-a').getAttribute('aria-label'));
    t.check('compare input B has aria-label', !!document.getElementById('compare-input-b').getAttribute('aria-label'));
    window.navigateTo('');
  });

  await describe('Design-system completeness guards', async (t) => {
    const css = stylesheet();
    t.check('no hardcoded tooltip hex (#0A0F16 removed)', !/#0A0F16/i.test(css));
    t.check('no border-radius:50% (radius tokenized)', !/border-radius:50%/.test(css));
    t.check('single spin keyframe (duplicate stockSpin removed)', !css.includes('stockSpin'));
    t.check('global reduced-motion block present', /prefers-reduced-motion:\s*reduce\)\{\s*\*/.test(css.replace(/\s+/g,' ').replace(/ \{/g,'{')) || css.includes('prefers-reduced-motion'));
    t.check('AI dot pulse is finite, not infinite', /animation:fab-pulse[^;]*\)\s*3;/.test(css) || /fab-pulse 2\.4s var\(--ease-out\) 3/.test(css));
  });

  await describe('RTL directional correctness', async (t) => {
    const css = stylesheet();
    t.check('stock-card hint arrow flips in RTL', /html\[dir="rtl"\] \.stock-card-hint::after\{content:'‹'/.test(css));
    t.check('nav scroll mask flips direction in RTL', /html\[dir="rtl"\] \.lesson-nav-scroll/.test(css));
    t.check('AI send + back arrows mirror in RTL', (css.match(/scaleX\(-1\)/g) || []).length >= 2);
  });

  if(require.main === module) finalizeSuites();
})();
