// ---------------------------------------------------------------------------
// Shared DOM test harness.
//
// Loads the REAL built dist/index.html (not a hand-copied fragment) into
// jsdom, so these tests exercise exactly what gets deployed — the same
// "test the real build, not a parallel copy" principle as
// tests/helpers/load-engine.js. Requires dist/index.html to exist; the
// project's `pretest` script (`node scripts/build.js`) already runs before
// `npm test`, so a fresh build is always in place.
//
// Canvas is stubbed (jsdom has no real canvas backend) — this is about
// verifying the RIGHT data reaches the chart-drawing call and the DOM
// structure around it, not pixel output.
// ---------------------------------------------------------------------------
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const DIST_PATH = path.join(__dirname, '..', '..', 'dist', 'index.html');

// A minimal, deterministic Twelve Data mock reused across UI tests — same
// shape as tests/ai/fixtures/twelvedata-mock.js but inlined here to avoid
// this helper depending on a sibling fixture file's internal shape.
function defaultFetchMock(url){
  if(url.includes('/quote')){
    return Promise.resolve({ ok:true, json: async () => ({
      datetime:'2026-09-07', close:'171.20', previous_close:'169.42',
      change:'1.78', percent_change:'1.05',
      fifty_two_week:{ high:'182.50', low:'142.10' }
    })});
  }
  if(url.includes('/time_series')){
    const values = [];
    const start = new Date('2025-08-01');
    for(let i = 0; i < 260; i++){
      const d = new Date(start); d.setDate(d.getDate()+i);
      const close = 150 + (i/260)*20;
      values.push({
        datetime: d.toISOString().slice(0,10),
        open:(close-0.3).toFixed(2), high:(close+0.5).toFixed(2),
        low:(close-0.6).toFixed(2), close: close.toFixed(2), volume:'41000000'
      });
    }
    return Promise.resolve({ ok:true, json: async () => ({ meta:{}, values: values.reverse() }) });
  }
  if(url.includes('/symbol_search')) return Promise.resolve({ ok:true, json: async () => ({ data: [] }) });
  return Promise.resolve({ ok:false, status:404 });
}

// Returns { window, document, dom } once the page's own scripts have run.
// `fetchMock` defaults to defaultFetchMock; pass one explicitly (e.g. to
// return ok:false) for failure-path tests.
async function loadPage(fetchMock){
  if(!fs.existsSync(DIST_PATH)){
    throw new Error('dist/index.html not found — run `node scripts/build.js` first (npm test does this automatically via pretest).');
  }
  const html = fs.readFileSync(DIST_PATH, 'utf-8');
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true,
    url: 'https://chart-lab.netlify.app/',
    beforeParse(w){
      w.HTMLCanvasElement.prototype.getContext = function(){
        const noop = () => {};
        return new Proxy({}, { get: () => noop, set: () => true });
      };
      w.fetch = fetchMock || defaultFetchMock;
    }
  });
  // Scripts execute synchronously during JSDOM construction for an inline
  // <script> tag, but give the microtask queue one tick to settle any
  // top-level async work (there is none currently, but this keeps the
  // harness robust if that changes) before handing control to the test.
    await new Promise(resolve => {
    if(dom.window.document.readyState === 'loading'){
      dom.window.document.addEventListener('DOMContentLoaded', resolve, { once: true });
    } else {
      resolve();
    }
  });

  await new Promise(r => setTimeout(r, 30));

  return { window: dom.window, document: dom.window.document, dom };
}

// Small polling wait for a condition to become true — used instead of a
// fixed setTimeout guess wherever a test depends on an async chain (a
// fetch mock resolving, a route dispatch) finishing. Fixed timeouts that
// are "usually enough" were the direct cause of flaky-looking failures
// during Phase 4 development; this fixes that class of problem generally
// rather than just picking a bigger fixed number.
async function waitFor(conditionFn, { timeout = 2000, interval = 20 } = {}){
  const start = Date.now();
  while(Date.now() - start < timeout){
    if(conditionFn()) return true;
    await new Promise(r => setTimeout(r, interval));
  }
  return false;
}

module.exports = { loadPage, waitFor, defaultFetchMock, DIST_PATH };
