// Locks in a font-consistency fix and a legibility pass triggered by user
// screenshots showing several elements rendering in a visibly different
// font, and several interactive controls (page-turn arrows, checkbox
// chips) reading as too dim/small against the dark-blue theme.
//
// Root cause of the font issue: --mono was 'JetBrains Mono', monospace —
// JetBrains Mono has no Hebrew glyphs, so ANY Hebrew text styled with it
// (lesson tags, page counts, chip labels — this is a bilingual site, mono
// labels routinely mix Hebrew words with numbers) fell back to whatever
// generic system monospace font the OS picked, visibly clashing with Rubik
// everywhere else. Separately — and more severe — canvas-drawn chart
// labels referenced 'IBM Plex Mono'/'IBM Plex Sans', fonts that were never
// even loaded on this page, so they'd ALWAYS silently fallen back to a
// system default, for every user, the entire time.
const { loadPage, waitFor, DIST_PATH } = require('../helpers/dom-harness.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');
const fs = require('fs');

function html(){ return fs.readFileSync(DIST_PATH, 'utf-8'); }
function stylesheet(){ const m = html().match(/<style[^>]*>([\s\S]*?)<\/style>/); return m ? m[1] : ''; }

(async () => {
  await describe('Font consistency: --mono has a Hebrew-safe fallback', async (t) => {
    const { window, document } = await loadPage();
    const cs = window.getComputedStyle(document.documentElement);
    const monoStack = cs.getPropertyValue('--mono');
    t.check('JetBrains Mono is still the primary (keeps numbers/tickers looking technical)', monoStack.includes('JetBrains Mono'));
    t.check('Rubik is a fallback BEFORE the generic monospace keyword, so Hebrew text in a mono-styled label matches the rest of the page', /JetBrains Mono[^,]*,\s*["']?Rubik/.test(monoStack));
  });

  await describe('Canvas-drawn chart labels use fonts that are actually loaded', async (t) => {
    const doc = html();
    t.equal('no reference to the never-loaded IBM Plex family remains', (doc.match(/IBM Plex/g) || []).length, 0);
    t.check('canvas mono labels reference JetBrains Mono with a Rubik fallback', doc.includes(`'JetBrains Mono','Rubik',monospace`));
    t.check('canvas sans labels reference the actually-loaded Rubik', /ctx\.font=.600 1[12]\.?5?px 'Rubik',sans-serif/.test(doc));
  });

  await describe('Lesson pager arrows: bigger and brighter, not a muted gray', async (t) => {
    const { window, document } = await loadPage();
    await waitFor(() => !!document.getElementById('complete-l0'));
    const arrow = document.querySelector('#l0 .lesson-pager-arrow.next');
    t.equal('arrow button is enlarged (48px, up from 38px)', window.getComputedStyle(arrow).width, '48px');
    t.equal('arrow uses the bright primary text color, not muted gray', window.getComputedStyle(arrow).color, 'var(--text)');
    const css = stylesheet();
    t.check('hover state fills solid with the accent color for a clear, bold state change', /\.lesson-pager-arrow:hover:not\(:disabled\)\{[^}]*background:var\(--accent\)/.test(css));
  });

  await describe('Chip checkboxes: brighter label text, and a real checked/active visual state', async (t) => {
    const { window, document } = await loadPage();
    await waitFor(() => !!document.getElementById('complete-l0'));
    const unchecked = [...document.querySelectorAll('.chip')].find(c => !c.querySelector('input').checked);
    const checked = [...document.querySelectorAll('.chip')].find(c => c.querySelector('input').checked);
    t.check('an unchecked chip exists to compare against', !!unchecked);
    t.check('a checked chip exists to compare against', !!checked);
    t.equal('unchecked chip label uses the bright primary text color, not muted gray', window.getComputedStyle(unchecked).color, 'var(--text)');
    t.equal('checked chip switches to the accent-on-ink treatment', window.getComputedStyle(checked).color, 'var(--accent-ink)');
  });

  await describe('Stock view: provenance line (as-of date, Demo Mode label) is no longer the dimmest tier', async (t) => {
    const css = stylesheet();
    t.check('stock-view-asof moved off text-faint', !/\.stock-view-asof\{[^}]*color:var\(--text-faint\)/.test(css));
    t.check('stock-metric-note moved off text-faint', !/\.stock-metric-note\{[^}]*color:var\(--text-faint\)/.test(css));
  });

  if(require.main === module) finalizeSuites();
})();
