#!/usr/bin/env node
// ---------------------------------------------------------------------------
// build.js — assembles dist/index.html from the modular source in src/.
//
// Why this exists: index.html USED TO be hand-edited directly, and before
// that, hand-concatenated by copy-pasting file contents together in the
// right order every single time. Both are error-prone and don't scale.
// This script is that concatenation step, written down once, in git,
// runnable by anyone (`node scripts/build.js`), including Netlify's build
// step if the site is later connected via git instead of drag-and-drop.
//
// Deliberately zero npm dependencies — this stays a plain Node script using
// only `fs`/`path`, per the project rule against introducing unnecessary
// frameworks or build tooling for what is fundamentally a static site.
//
// ORDER MATTERS. See docs/AI_ENGINE.md for why. In short:
//   - KB array must open before any KB content module pushes into it.
//   - Behavioral/Israel/QA-gap/focused/MA modules extend the base KB and
//     must come after the base KB modules, before the engine reads KB.
//   - market/* must load before entity/* (entity calls
//     getActiveMarketDataProvider(), defined in market/index.js).
//   - entity/* and market/* must load before intent/* (stock intent calls
//     resolveTicker/resolveTickerDynamic and getMarketData).
//   - engine/matching-engine.js must load AFTER all of the above — it wires
//     everything together into generateAiReply().
//   - engine/followup-chips.js and ui/chat-ui.js come last; the UI defines
//     the async wrapper that calls generateAiReply().
// ---------------------------------------------------------------------------
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src', 'ai');
const CORE_SRC = path.join(ROOT, 'src', 'core');
const FEATURES_SRC = path.join(ROOT, 'src', 'features');

// Core scripts (storage, router, ...) load first, before the site's own
// script and before the AI script — both depend on them (theme storage,
// the AI overlay's route registration).
const CORE_MODULE_ORDER = [
  'storage.js',
  'dom-safety.js',
  'router.js'
];

// Shared feature-level utilities (pure functions, no DOM) that BOTH the
// site's own UI code and the AI engine need — e.g. calculators/calculations.js
// is used by the dedicated Calculators view AND by the AI's chat-based
// calculator (matching-engine.js's tryCalculators), so it must load before
// both. Paths are relative to src/features/. These are also what
// tests/helpers/load-engine.js loads for pure-logic tests — keep DOM
// manipulation out of this list; put it in FEATURE_UI_MODULE_ORDER instead.
const SHARED_FEATURE_MODULE_ORDER = [
  'calculators/calculations.js',
  'quiz/quiz-questions.js',
  'quiz/quiz-engine.js'
];

// Feature UI modules — real DOM manipulation (like router.js/storage.js
// already do), loaded after the pure-logic modules above so they can call
// into them. Not loaded by the test vm sandbox (tests exercise the pure
// logic directly; DOM behavior is covered by the project's separate jsdom
// end-to-end checks, the same pattern used throughout this project).
const FEATURE_UI_MODULE_ORDER = [
  'quiz/quiz-ui.js',
  'calculators/calculators-ui.js',
  'lessons/lesson-progress-ui.js',
  'stocks/stock-view-ui.js',
  'compare/compare-ui.js'
];

const MODULE_ORDER = [
  'kb/00-kb-array.js',
  'kb/01-basics.js',
  'kb/02-comparisons.js',
  'kb/03-fundamentals.js',
  'kb/04-technical.js',
  'kb/05-risk.js',
  'kb/06-macro.js',
  'kb/07-bonds.js',
  'kb/08-advanced.js',
  'kb/09-scenarios.js',
  'kb/10-meta.js',
  'kb/11-israel.js',
  'kb/12-behavioral.js',
  'kb/13-qa-gaps.js',
  'kb/14-focused.js',
  'kb/15-ma-periods.js',
  'market/indicators.js',
  'market/provider-interface.js',
  'market/twelvedata-provider.js',
  'market/demo-provider.js',
  'market/index.js',
  'context/conversation-context.js',
  'entity/ticker-map-and-resolution.js',
  'intent/stock-intent.js',
  'engine/matching-engine.js',
  'engine/followup-chips.js',
  'ui/chat-ui.js'
];

function readModule(relPath){
  const full = path.join(SRC, relPath);
  if(!fs.existsSync(full)){
    throw new Error(`Build failed: expected module not found: src/ai/${relPath}`);
  }
  return fs.readFileSync(full, 'utf-8');
}

function readCoreModule(relPath){
  const full = path.join(CORE_SRC, relPath);
  if(!fs.existsSync(full)){
    throw new Error(`Build failed: expected core module not found: src/core/${relPath}`);
  }
  return fs.readFileSync(full, 'utf-8');
}

function readSharedFeatureModule(relPath){
  const full = path.join(FEATURES_SRC, relPath);
  if(!fs.existsSync(full)){
    throw new Error(`Build failed: expected shared feature module not found: src/features/${relPath}`);
  }
  return fs.readFileSync(full, 'utf-8');
}

function buildAiScript(){
  const parts = MODULE_ORDER.map(readModule);
  return parts.join('\n');
}

function buildCoreScript(){
  const core = CORE_MODULE_ORDER.map(readCoreModule);
  const shared = SHARED_FEATURE_MODULE_ORDER.map(readSharedFeatureModule);
  // Shared feature utilities load right after core infra, before anything
  // (site UI or AI) that might depend on them.
  return core.concat(shared).join('\n');
}

function buildFeatureUiScript(){
  // Separate from buildCoreScript() deliberately: these files touch real
  // DOM, and tests/helpers/load-engine.js only loads buildCoreScript() +
  // buildAiScript() into its DOM-less vm sandbox — keeping UI modules out
  // of that list is what lets the sandbox stay simple (no fake
  // createElement/appendChild needed) while still testing the pure logic
  // these UI files call into.
  return FEATURE_UI_MODULE_ORDER.map(readSharedFeatureModule).join('\n');
}

function buildSite(){
  const templatePath = path.join(ROOT, 'site-template.html');
  const template = fs.readFileSync(templatePath, 'utf-8');
  const aiMarker = '__AI_SCRIPT_INJECTION_POINT__';
  const coreMarker = '__CORE_SCRIPTS_INJECTION_POINT__';
  if(!template.includes(aiMarker)){
    throw new Error('Build failed: site-template.html is missing the injection marker: ' + aiMarker);
  }
  if(!template.includes(coreMarker)){
    throw new Error('Build failed: site-template.html is missing the injection marker: ' + coreMarker);
  }
  // Using a FUNCTION as the replacement (not a string) is deliberate and
  // load-bearing: String.replace() treats sequences like $&, $`, $', $$ in
  // a STRING replacement as special patterns, even for a plain-string
  // search pattern. This codebase's own JS legitimately contains the
  // literal substring $' (e.g. `'$'+price.toFixed(2)` for formatting a
  // dollar amount) — with a string replacement, that $' is silently
  // interpreted as "insert everything after the match," corrupting
  // everything from that point on. A function replacement's return value
  // is inserted literally, with no special-pattern interpretation at all.
  let output = template.replace(coreMarker, () => buildCoreScript() + '\n' + buildFeatureUiScript());
  output = output.replace(aiMarker, () => buildAiScript());

  const distDir = path.join(ROOT, 'dist');
  if(!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
  const outPath = path.join(distDir, 'index.html');
  fs.writeFileSync(outPath, output, 'utf-8');

  // Static assets (manifest, future favicon/icons) are copied as-is —
  // dist/ is fully regenerated output, nothing should be hand-placed there.
  const staticDir = path.join(ROOT, 'static');
  let staticCount = 0;
  if(fs.existsSync(staticDir)){
    for(const file of fs.readdirSync(staticDir)){
      fs.copyFileSync(path.join(staticDir, file), path.join(distDir, file));
      staticCount++;
    }
  }

  console.log(`Built ${outPath} (${(output.length/1024).toFixed(1)} KB) from ${MODULE_ORDER.length} AI modules + ${CORE_MODULE_ORDER.length} core modules + ${SHARED_FEATURE_MODULE_ORDER.length} shared feature module(s) + ${staticCount} static asset(s).`);
  return outPath;
}

if(require.main === module){
  try{
    buildSite();
  }catch(e){
    console.error(e.message);
    process.exit(1);
  }
}

module.exports = { buildAiScript, buildCoreScript, buildFeatureUiScript, buildSite, MODULE_ORDER, CORE_MODULE_ORDER, SHARED_FEATURE_MODULE_ORDER, FEATURE_UI_MODULE_ORDER };
