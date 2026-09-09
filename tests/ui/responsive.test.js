// Locks in the Session 4 responsive + consistency contract. jsdom can't do
// real layout, so these assert the STYLESHEET contains the responsive
// machinery (breakpoints, overflow handling, safe-area insets, mobile
// recomposition) and that every view remains structurally sound — the goal
// is that a later edit stripping the responsive layer fails loudly.
const { loadPage, waitFor } = require('../helpers/dom-harness.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');
const fs = require('fs');
const { DIST_PATH } = require('../helpers/dom-harness.js');

function stylesheet(){
  const html = fs.readFileSync(DIST_PATH, 'utf-8');
  const m = html.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  return m ? m[1] : '';
}

(async () => {
  await describe('Responsive breakpoint coverage', async (t) => {
    const css = stylesheet();
    t.check('large-desktop breakpoint (>=1400px)', /min-width:\s*1400px/.test(css));
    t.check('tablet breakpoint (<=900px)', /max-width:\s*900px/.test(css));
    t.check('lesson two-column collapse (<=840px)', /max-width:\s*840px/.test(css));
    t.check('mobile breakpoint (<=600px)', /max-width:\s*600px/.test(css));
    t.check('very-small-phone breakpoint (<=380px)', /max-width:\s*380px/.test(css));
    t.check('short-viewport breakpoint (max-height)', /max-height:\s*520px/.test(css));
  });

  await describe('Mobile recomposition (not just shrinking)', async (t) => {
    const css = stylesheet();
    t.check('mobile page gutter reduced to 16px', /\.wrap\{padding:0 16px\}/.test(css.replace(/\s+/g,'')) || /padding:0 16px/.test(css));
    t.check('card grids collapse to single column on mobile', /\.candle-grid\{grid-template-columns:1fr/.test(css.replace(/\s+/g,'')));
    t.check('AI example cards go single-column on mobile', /\.ai-examples\{grid-template-columns:1fr/.test(css.replace(/\s+/g,'')));
    t.check('floating stack shrinks + becomes safe-area aware', css.includes('safe-area-inset-bottom'));
  });

  await describe('Overflow & scroll safety', async (t) => {
    const css = stylesheet();
    t.check('overlay content scrolls rather than clipping', /\.app-overlay-content\{[^}]*overflow-y:auto/.test(css.replace(/\s+/g,'')));
    t.check('page prevents horizontal overflow', /overflow-x:hidden/.test(css));
    t.check('overscroll containment on overlay content', css.includes('overscroll-behavior:contain'));
  });

  await describe('Viewport & theme meta', async (t) => {
    const html = fs.readFileSync(DIST_PATH, 'utf-8');
    t.check('viewport-fit=cover for safe areas', html.includes('viewport-fit=cover'));
    t.check('color-scheme meta present', /name="color-scheme"/.test(html));
  });

  await describe('All views still structurally intact after responsive layer', async (t) => {
    const { window, document } = await loadPage();
    t.equal('8 lessons', document.querySelectorAll('section.lesson').length, 8);
    t.equal('19 canvases', document.querySelectorAll('canvas').length, 19);
    t.equal('single fab-stack', document.querySelectorAll('.fab-stack').length, 1);
    let ok = 0;
    for(const [route,id] of [['ai','ai-overlay'],['quiz','quiz-overlay'],['stock','stock-view-overlay'],['compare','compare-overlay'],['calculators','calculators-overlay']]){
      window.navigateTo(route);
      await waitFor(()=>!!document.getElementById(id),{timeout:1500});
      if(document.getElementById(id).classList.contains('open')) ok++;
      window.navigateTo(''); await new Promise(r=>setTimeout(r,15));
    }
    t.equal('all five routed overlays open', ok, 5);
  });

  if(require.main === module) finalizeSuites();
})();
