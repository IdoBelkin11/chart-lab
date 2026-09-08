// ---------------------------------------------------------------------------
// Loads the AI engine straight from src/ai/ — via the SAME module list the
// real build uses (scripts/build.js) — into an isolated vm context, and
// hands back its globals for assertions.
//
// Why a vm context instead of require(): the engine files are plain
// concatenated global-scope scripts (that's what lets them be spliced
// directly into index.html), not CommonJS modules. A vm context gives each
// test file a clean, isolated global scope without needing to touch that.
//
// Why via build.js's module list instead of a hand-copied list here: a test
// suite that maintains its own separate idea of "the module order" can
// silently drift from the real build and give false confidence. There is
// exactly one definition of build order in this project, in scripts/build.js.
// ---------------------------------------------------------------------------
const vm = require('vm');
const { buildAiScript, buildCoreScript } = require('../../scripts/build.js');

function loadEngine(fetchMock){
  // Core + shared-feature scripts (storage, router, calculators/*) load
  // first, exactly matching the real build's concatenation order — this is
  // what makes calculations.js (needed by tryCalculators) and any future
  // shared utility available to tests without a second, parallel loader.
  // Safe to include here even though storage.js/router.js reference
  // localStorage/window/document: those are only referenced INSIDE function
  // bodies, never executed at top-level parse time, so defining them in a
  // DOM-less vm context doesn't throw — only *calling* one of those
  // specific functions without a DOM would.
  const coreScript = buildCoreScript();
  const script = buildAiScript();
  // Cut off at the UI wiring (`const aiHistory`) — that part touches
  // `document`/DOM APIs the pure-logic tests don't need and don't provide.
  const cutoff = script.indexOf('const aiHistory');
  const logicOnly = cutoff === -1 ? script : script.slice(0, cutoff);

  // Top-level `const`/`let` in a plain script do not become properties of
  // the global object — in a real browser OR in Node's vm module — only
  // `var` and function declarations do. That's invisible in production
  // (everything lives in one script tag, so later code sees these
  // identifiers via ordinary lexical scope), but it means a test file
  // trying to read e.g. `sandbox.TICKER_MAP` from OUTSIDE after the script
  // finishes gets `undefined`. Promoting top-level const/let to var ONLY in
  // this test loader (never in the real shipped build) makes every
  // top-level export inspectable without changing runtime behavior.
  const promoted = logicOnly.replace(/^(const|let)(\s+[A-Za-z_$])/gm, 'var$2');
  const promotedCore = coreScript.replace(/^(const|let)(\s+[A-Za-z_$])/gm, 'var$2');

  const sandbox = {
    console,
    fetch: fetchMock || (async () => { throw new Error('fetch called without a mock in this test'); }),
    // Minimal stub: the engine checks which lesson section is currently
    // active (for "explain this chart" style questions) via
    // document.querySelector — pure-logic tests have no real page, so this
    // always reports "no active lesson", which is a legitimate, testable
    // state (not a workaround for a bug).
    document: { querySelector: () => null },
    // A real (if minimal) in-memory localStorage — without this, every
    // storage.js-backed function (theme, lesson/quiz progress) silently
    // no-ops in tests (storageAvailable() catches the ReferenceError and
    // returns false), which means persistence LOGIC could never actually
    // be exercised, only its "storage unavailable" fallback path.
    localStorage: (function(){
      let store = {};
      return {
        getItem: k => (k in store ? store[k] : null),
        setItem: (k,v) => { store[k] = String(v); },
        removeItem: k => { delete store[k]; },
        key: i => Object.keys(store)[i] || null,
        get length(){ return Object.keys(store).length; },
        clear: () => { store = {}; }
      };
    })(),
    Promise, Math, Date, JSON, Array, Object, Map, Set, RegExp, Error,
    encodeURIComponent, decodeURIComponent, parseFloat, parseInt, isNaN,
    URL
  };
  vm.createContext(sandbox);
  vm.runInContext(promotedCore, sandbox, { filename: 'core-under-test.js' });
  vm.runInContext(promoted, sandbox, { filename: 'ai-engine-under-test.js' });
  return sandbox;
}

module.exports = { loadEngine };
