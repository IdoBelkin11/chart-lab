# Testing

## Running

```sh
npm test          # rebuilds, then runs every tests/**/*.test.js
node tests/run-all.js   # same, without the rebuild step
node tests/ai/core-regression.test.js   # run one file directly
```

Every test file is also directly runnable with plain `node` — there's no
test framework to invoke through. `npm test`'s `pretest` hook runs the build
first so tests always exercise current source (see below for why that's
true even without the hook).

## Why no Jest/Mocha/etc.

This is a static site with a build script, not a project with enough test
complexity to justify a framework dependency. `tests/helpers/test-runner.js`
is ~40 lines: `describe(name, async fn)` + `t.check`/`t.equal`. It exists
because **every ad-hoc test written during earlier development hand-rolled
its own async wrapping, and got it wrong at least twice** —
`array.forEach(async (item) => {...})` does not wait for iterations to
finish before code after the `forEach` call runs, which let a broken suite
silently report as passing (0 failures, because nothing had actually
finished checking yet). One correct, shared implementation instead of N
subtly-wrong ones.

## Why tests load source via a vm context, not `require()`

The engine files (`src/ai/**/*.js`) are plain concatenated global-scope
scripts — that's what lets them be spliced directly into `index.html`. They
aren't CommonJS modules and don't export anything. `tests/helpers/load-engine.js`
uses Node's `vm` module to run the *real, current* concatenated source
(via `scripts/build.js`'s own `buildAiScript()` — the exact same function
the real build uses, so there is exactly one definition of "what the source
is" in this project, not a test-side copy that can silently drift) inside
an isolated context, then hands back that context's globals.

One quirk this works around: top-level `const`/`let` do not become
properties of the global object in a plain script — this is true in Node's
`vm` module **and in a real browser** (only `var` and function declarations
do). Invisible in production, because everything lives in one script tag
and later code sees these identifiers via ordinary lexical scope — but a
test trying to read e.g. `sandbox.TICKER_MAP` from *outside* after the
script finishes would get `undefined`. `load-engine.js` promotes top-level
`const`/`let` to `var` **only in this test loader**, never in the real
shipped build, specifically so tests can inspect them.

## Fixtures and mocks

- `tests/ai/fixtures/core-questions.json`, `research-bank.json` — question
  banks as data, not embedded in test-file source, so they're easy to skim
  or extend without touching test logic.
- `tests/ai/fixtures/twelvedata-mock.js` — one shared `createTwelveDataMock()`
  covering all three Twelve Data endpoints, so market-data tests don't each
  hand-roll their own fetch mock (every earlier ad-hoc test did, with
  small inconsistencies between them).

## Adding a test

1. Pick the right directory: `tests/ai/` for matching-pipeline/KB-content
   behavior, `tests/market/` for provider/indicator/entity-resolution
   behavior.
2. `const { loadEngine } = require('../helpers/load-engine.js');`
   `const { describe, finalizeSuites } = require('../helpers/test-runner.js');`
3. Load the engine once per file (pass a fetch mock if the test needs
   network-backed behavior): `const engine = loadEngine(mockFn);`
4. Write one or more `describe(name, async (t) => { t.check(...); })` blocks.
5. End the file with `if(require.main === module) finalizeSuites();` so the
   file is both directly runnable and safely importable elsewhere.
6. Run it directly (`node tests/your-new.test.js`) while iterating, then
   `npm test` for the full suite before considering it done.

## What a regression test in this project is actually for

Every test added so far exists because a **real bug was found and fixed** —
not written speculatively "for coverage." When you fix something a user
actually hit, the fix isn't done until there's a test that would have
caught it. Two examples from this exact phase, for calibration:

- `tests/ai/follow-up-context.test.js`'s "general short contextual
  follow-up" case failed on first run — not because the test was wrong, but
  because it exposed that "המניה שלי מאוד תנודתית" lost its topic (the KB
  only recognized the noun "תנודתיות", not the adjective "תנודתית"). Fixed
  the KB, not the test.
- `tests/market/entity-resolution.test.js`'s leveraged-product case is
  written against the *exact* SanDisk scenario that shipped as a real user-
  visible bug, with the mock data shaped to reproduce it (identical
  `instrument_type` tagging on both the real stock and the leveraged ETP,
  since that's what made the original bug hard to filter by category alone).

If a fix doesn't come with a test that would have failed before the fix,
treat that as unfinished, not as "tests are optional for small changes."
