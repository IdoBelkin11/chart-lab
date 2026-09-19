# Resume here

## State (verified, not assumed)
- 246 frontend + 13 function tests passing · 0 type errors · build succeeds
- main chunk 343 kB (gzip 113 kB); engine+KB split into an on-demand chunk, now with a static test guarding the split itself
- `npm install && npm run dev` → working app

## Design & content session (this session)
Scope: visual polish pass (colours/depth, inspired by Apple/Codecademy/
Duolingo/Robinhood) + a beginner-facing content feature. A full rewrite of
lesson prose was explicitly NOT done — `prose.ts`'s own header says that
content is authored, not copy to rewrite on a pass like this, and that was
respected.

- **New: inline glossary.** `@core/glossary/{terms,highlight}.ts` — 15
  bilingual terms (support, resistance, breakout, RSI, momentum, stop-loss,
  etc.), matched with a real word boundary in English and pre-expanded
  Hebrew prefix forms (ה/ב/ל/מ/ש/ו…) since Hebrew attaches those with no
  space. `@ui/components/learning/{Term,GlossaryText,GlossaryScope}.tsx`
  render matches as a tap-for-definition popover. Wired into `LessonRoute`
  (intro + "worth knowing") and `AiAnswer`.
  - **Bug found and fixed before shipping:** intro and "worth knowing" each
    independently picked their own "first occurrence" of a word, so a term
    appearing in both produced two identical elements on one screen and
    broke two existing tests. Fixed with `GlossaryScope`, a context that
    shares one dedup set across a whole lesson (or a whole AI answer),
    keyed to remount (and reset) per `lesson.id` / per answer. 12 new tests
    in `tests/core/glossary.test.ts`; the two tests it broke were verified
    still passing afterward, not loosened.
- **Design tokens**: added `--glass-bg/--glass-border` (frosted chrome) and
  `--spotlight` (one soft radial light source behind a hero, used once per
  screen) in both themes. The semantics documented in the tokens file's own
  header (yellow=action, blue=info, green/red=success/danger, purple=
  advanced) were kept, not touched.
- **Home**: spotlight glow behind the masthead; a `freshNote` pill shown
  only on a first visit (`fresh` state, already existed) pointing a total
  beginner at Lesson 0 — new string `freshWelcome`, additive, no existing
  string changed.
- **Header**: sticky + glass background (`backdrop-filter`); note this has
  no visible blur effect yet because it doesn't currently overlap scrolled
  content in the grid layout — harmless, but revisit if the shell layout
  ever changes to let content pass under it.
- **Rail**: hover now nudges the row (`translateX`, mirrored for RTL); the
  current lesson gets a left accent bar (`::before`, `inset-inline-start`
  so it flips correctly in RTL); brand mark gets a soft glow ring on hover.

## Second polish pass (same session)
- **Quiz answers are now cards**, not rows in a flat list — separated,
  rounded, with a hover lift. A flat list reads as content to scan; cards
  read as choices to pick between, which is what the screen asks for.
  Correct/wrong states gained a visible border now that each option has one.
- **Quiz explanations run through the glossary** (scoped per explanation),
  which is where a beginner most needs a term defined.
- **Lesson head** got the same spotlight gesture as the home masthead, so a
  lesson opens the way the overview does.
- **"Worth knowing" is now a tinted blue panel** rather than a rule-only
  aside. On a long lesson it was reading as just another paragraph; it is
  nuance on top of the lesson and should be skimmable as such.
- **Glossary popover on mobile**: was the flagged clipping risk from pass
  one, now fixed. Under 600px it becomes a sheet pinned to the viewport
  bottom (`position: fixed`, left/right/bottom all set) instead of centring
  on the word. Deliberately pinned rather than left to the static position —
  a fixed element with `auto` offsets resolves against where it would have
  been in flow, which for a word mid-paragraph is exactly the unpredictable
  placement the fix is meant to avoid. The CSS block is ordered AFTER the
  arrow rules it disables, since a media query adds no specificity.
- **Reduced-motion guards added for every new hover transform** (quiz
  option + primary, rail item incl. RTL, header theme, home CTA, lesson
  arrows + tutor buttons). `base.css` zeroes transition *duration*, which
  stops the animation but not the displacement — without these, a hover
  still jumps into place for motion-sensitive users.

## Third pass (same session) — bundle split + remaining routes

### Bundle split (the item flagged as "root cause identified, not fixed")
Main chunk **675 kB → 324 kB** (gzip **220 kB → 107 kB**). Vite's 500 kB
warning is gone. Engine + KB are now a 338 kB chunk fetched only when one of
three routes is opened.

The non-obvious part, worth keeping: lazy-loading the AI route **alone did
nothing measurable** (675 → 668 kB). The KB has a second eager path into it:

    StockRoute / CompareRoute → market/stockLookup → entity/tickers
                              → context/conversationContext
                              → engine/matchingEngine → kb

So all three routes had to cross the `lazy()` boundary together. Home,
lesson, quiz and calculators stay eager on purpose — they are the reading
path and cost little, and splitting them would add a loading state to every
navigation for a few kB. **If anything eager ever imports `@core/ai` again,
this gain silently reverses** — check `dist/assets` sizes.

Test adaptation: `tests/ui/{ai,stock,compare}.test.tsx` now await the chunk
via a small `renderTutor()` / `renderStockRoute()` / `renderCompareRoute()`
helper. Every assertion is byte-for-byte what it was; only the waiting is
new. Nothing was loosened, no expected count was lowered.

### Routes restyled
- **Stock**: submit button lifts on hover; the demo-data provenance line is
  now a yellow-dot badge instead of grey text. Provenance is the one thing
  on that screen a learner must not skim past — demo numbers that look live
  are worse than no numbers.
- **Compare**: same provenance badge, deliberately identical to the stock
  route's, so "these numbers are not real" has one visual language in both
  places it can appear. Comparison rows highlight on hover, which is what
  makes tracking one metric across two columns easy.
- **Calculators**: the whole field row (label + input) responds to hover and
  focus-within, not just the input — label and value are one thing to the
  reader, so highlighting half of it read as a glitch. The result figure now
  sits in a tinted panel rather than under a plain rule.
- **AI**: the composer bar acknowledges focus as a whole (it is the one
  control the route exists for); send button gets a glow ring; follow-up
  chips lift like every other pill control in the product.
- Reduced-motion guards added for each new transform, as in pass two.

## Remaining
1. **Visual QA in a real browser.** Still the standing caveat across all
   three passes: structure, types and behaviour are verified by test; the
   rendered result is not.
2. **Glossary coverage is intentionally partial** (15 terms) — lessons, AI
   answers and quiz explanations. Not wired into calculators/compare/stock
   copy; extend only with real, checked definitions, not invented ones.
3. **Lesson prose was deliberately not rewritten** in any pass. `prose.ts`
   says the wording is authored teaching content, not copy to rewrite, and
   that was respected throughout. If Ido wants the content itself expanded,
   that is a content project with him, not a styling pass.
4. The remaining 324 kB main chunk is mostly React + the chart/series code.
   Splitting further would mean touching the lesson path; not obviously
   worth it.

## Done
`@core` (UI-agnostic, verified DOM-free) — KB 165 entries + 10 facets, AI
engine with facet resolution / context / example rotation, market providers,
lessons + canonical current-topic resolver, progress with injectable storage,
quiz engine + bank (29, three per lesson) + per-lesson scoping, calculators,
i18n, all 19 chart series (deterministic, seeded) wired to lessons.

`@ui` — AppShell, Header, CourseRail, typed hash routing, and routes:
home · lesson · ai · quiz · calculators · stock · compare. `<Chart>` with DPR
scaling, rAF-throttled resize, theme repaint, accessible labels.
`<ChartCard>` wraps each lesson chart. `<CourseComplete>` celebration.

## Fixed in the last session (all verified by test)
- **All 19 series are now on screen.** `lessonCharts.ts` wired only 7; the
  other 12 existed in `series.js` and were referenced by nothing. A lesson
  now holds an ARRAY of charts, because several lessons' prose promises more
  than one ("in each chart below", "the first example below").
- **Annotations were never passed through.** `drawChart.js` always supported
  zones / points / dots / segments / highlights / extra lines; the lesson data
  never sent them. Lesson 3 in particular passed `ma: [20, 50]`, a key
  `drawChart.js` does not read — so the moving-averages chapter drew no
  moving average at all. It is now EMA-20 + SMA-150, matching its own text.
- **Tone → colour had no resolver.** Added in `Chart.tsx`: `@core` describes
  annotations semantically (`tone`, `{he,en}` labels), `@ui` turns that into
  colours and current-language text.
- **`support` / `resistance` tones had a fill but no LINE colour**, so they
  fell through to the informational blue — a red resistance box with a blue
  label on it. Pinned by test now, since nothing throws when this breaks.
- **Labels sat on the price action.** Every annotation label draws on a
  backing plate; the retest marker moved below the candles with a leader line.
- **Quiz served the wrong chapter's questions.** Selection went through a
  broad CATEGORY, so "Practice this" in moving-averages opened an RSI
  question. Questions now carry their own `lesson`; there is no category
  fallback, so a scoped quiz cannot contain unseen material.
- **Quiz was a dead end** — added a back-to-lesson exit on every screen.
  Restart also rebuilt from the full bank, silently turning a lesson quiz
  into a general one on the second attempt.
- **Paging kept the old scroll position.** The workspace is the scroll
  container, not the window, which is why scrolling the window did nothing.
- **Lesson 3 never explained its 150 line**, though the line was drawn.

## Fixed in this session
- **The quiz advanced the question on answer, before Next.** `submitAnswer`
  increments `currentIndex` on the SAME session object, in place, so reading
  `currentQuestion(session)` during render returned the NEXT question the
  instant an answer was given — prompt and all four options swapped while the
  learner was still reading the explanation. The view now holds the displayed
  question in state and advances only on Next.
- **The AI tutor had no global entry point.** The route existed and rendered;
  nothing in the header pointed at it. Restored as the first tools entry,
  marked as a feature.
- **Two AI features were computed every turn and thrown away.** `relatedIds`
  now renders follow-up chips, and `browse: true` now renders the topic
  browser — previously it returned prose telling the reader to pick a
  category and then showed no categories. This is also what
  `followupChips.js` was for; it was ported, exported from nothing, and
  imported by nothing.
- **Answers reveal progressively** (`useTypewriter`), because a local matcher
  answers in ~1ms and an instantly-complete block gives the eye no anchor.
  Click to finish; disabled entirely under `prefers-reduced-motion`.
- **Charts lay out as a responsive card grid** rather than one full-width
  card per chart. `min-width: 0` on the card is what actually lets a grid
  column shrink — without it the canvas's intrinsic width wins and the grid
  silently collapses back to one column.
- **Finish moved to its own centred row** below the pager, with a spacer
  keeping the page count centred.

## Also fixed in this session
- **The header AI entry was being clipped.** `.tools` is `overflow-x: auto`
  and the AI button was FIRST in it, so on a narrow-ish window it scrolled
  out at the viewport edge — present in the DOM, invisible in practice. The
  feature entry now sits outside the scrolling group, and a fixed
  `AiLauncher` appears on every route besides the tutor's own, which offers
  Back instead.
- **Cards in a row were ragged.** `align-items: start` sized each card to its
  own content, so a card whose subcaption wrapped to two lines grew taller
  than its neighbours. Now stretch, with a reserved header height so the
  charts start at the same y, and one shared chart height per lesson.
- **Charts were too small.** Grid columns went 340px → 460px (fewer, larger
  columns) and every chart height went up. The chart is the content; the card
  frames it and should not compete for its width.

## Engine fixes (this session)
- **An unknown subject was answered with the previous topic.** "תן לי מידע על
  gauz" is five words and matches nothing, so the short-follow-up fallback
  treated it as a follow-up and served the full previous explanation —
  confident, fluent, and about something the visitor never asked about.
  `introducesUnknownSubject` now gates that fallback: a token long enough to
  be a real word, absent from every KB keyword, and not generic connective
  vocabulary means a NEW unknown question, which falls through to the honest
  "I don't have a good answer" reply. Deliberately narrow so real follow-ups
  are untouched — there is a test for each side.
- **Chip labels could be nonsense.** `pickLabelTerm` fell back to "whatever
  keyword is first" when no short term existed, which wrapped a long scenario
  phrase into "מה זה פריצה נפח גבוה rsi מעל 70?". It now returns null, and
  internal sentinel keywords (containing `__`) are filtered out. All 300
  labels the KB can produce are audited by test; a missing chip is fine, a
  nonsense one is not.

## AI page (this session)
- The header AI entry is GONE. The fixed launcher is the only entry point,
  and it hides itself on the tutor route.
- No title strip: it repeated the empty state's own sentence directly above
  it. Back and Restart float over the panel instead.
- **Back returns to the page the tutor was opened from** (`shell/returnTo`),
  naming the lesson when it is one. Going home from a question asked in the
  middle of lesson 2 loses the reader's place. Module state, not context (it
  renders nothing) and not the URL (a shared `#/ai` link must not carry
  someone's history).
- Back is a 46px raised button with a 2.75-weight SVG chevron. A hairline
  glyph on a dark panel is the kind of control people simply do not see.
- The mark is square again: inside a column flex container the default
  `flex-shrink` collapsed its height, so a 74px square rendered as a wide,
  short rectangle. `flex: 0 0 auto` + `aspect-ratio`.
- Six example prompts in an auto-fit grid — two rows of three, collapsing to
  two then one. A stacked column of full-width buttons reads as a menu to
  work through; a grid reads as choices to pick from.
- Header controls are larger throughout (bar 62 → 72px, tools, theme, lang).

## Fourth pass — the glossary was shipping broken

Went in to expand content; found first that the glossary feature shipped in
v7-v9 **did not actually work after the first render**, and fixed that
instead. Worth reading before building anything on top of it.

**The bug.** `GlossaryScope` shared its dedup `Set` through a `useRef`, so
the set survived re-renders. First render: terms marked. Every render after
that: every term already "claimed", so NOTHING was marked. The glossary
silently vanished the moment a lesson re-rendered - which happens on any
guess, reveal or progress change.

**Why no test caught it.** The v7 tests asserted the *core* function in
isolation (correct, and still passing) and asserted at the *page* level only
that prose text was present - which it was, precisely because the marking
had disappeared. A probe of the real DOM showed the l1 intro rendering with
zero child elements. The tests were green because the feature was off.

**The fix.** Deleted `GlossaryScope` and the context entirely. Dedup is now
a pure function, `highlightGlossaryGroup(texts, lang)`, taking all related
blocks at once - dedup state lives and dies inside one call, so the same
input always gives the same output however often React renders.
`LessonRoute` memoises intro + "worth knowing" together; `AiAnswer` segments
every paragraph and bullet of one answer in a single pass; the quiz
explanation uses the standalone `GlossaryText`.

**Now pinned by test, at both levels:**
- `tests/core/glossaryGroup.test.ts` - purity: the same input segmented
  twice gives identical output, and still marks something.
- `tests/ui/glossary.test.tsx` - terms actually render in a lesson; the
  count is unchanged after a re-render; a click opens and closes a real
  definition; no term is marked twice per lesson.

**Three existing assertions were adapted, not loosened.** With the glossary
genuinely rendering, prose is legitimately split across `<button>` elements,
which the default text matcher cannot see. `lessonContent` now matches the
`<p>` whose whole `textContent` equals the prose - asserting the same thing,
more precisely. The `tryIt` notes assertion is scoped to the notes list,
because a note label ("פריצה") is also a glossary term and legitimately
appears in the prose too. 183 -> 190 tests.

**Lesson for the next pass: a feature test that only asserts the underlying
text is still present cannot tell "it works" from "it is switched off".
Assert the marking itself.**


## Fifth pass — glossary expanded + a glossary page

- **Terms: 15 -> 37.** Added the beginner vocabulary the lessons assume but
  never define: stock, exchange, index, ETF, dividend, ticker, market cap,
  portfolio, bull/bear market, volatility, timeframe, liquidity (basics);
  P/E, earnings, revenue, EPS (fundamentals); diversification, position
  size, risk/reward, drawdown (risk). Every term now carries a `cat`.
- **New route `#/glossary`**, last in the header tools row - a reference page
  is something you reach for when stuck, not a step in the course. Grouped by
  category rather than alphabetically, because a stuck beginner usually knows
  which part of the subject confused them, not the word they need. Search
  covers the alphabetical case and **searches definitions too**, so knowing
  only the idea is enough to find its name.
- **One source, two surfaces.** The page renders the same `GLOSSARY` data as
  the in-lesson popovers, so a definition cannot drift between them.
- Route is eager on purpose: pure term data, no market/engine dependency.
  Main chunk 324 -> 335 kB.

**Checked, not assumed:**
- Marking density in real prose after tripling the term count: 3-6 marks per
  100-165 words (~1 per 25 words). Not noisy; no change needed.
- A copy-paste slip put **Arabic characters inside a Hebrew word**
  ("דראודאון"). It typechecks perfectly and silently never matches. Found by
  scanning the file; now pinned by a test that rejects U+0600-U+06FF in any
  Hebrew surface form. Worth keeping for any future Hebrew content.

**Tests: 190 -> 207.** `tests/ui/glossaryRoute.test.tsx` (lists every term,
groups render, filters by term AND by idea, empty state, reachable from the
header) and additions to `tests/core/glossary.test.ts` (every term
categorised, every ordered category used, beginner coverage, no stray
scripts, definitions are real sentences, search behaviour).

## Sixth pass -- AI engine QA (asked to verify it "works perfectly")

Went in expecting spot-checks. Built an exhaustive sweep instead: every
keyword of every one of the 165 KB entries, asked as its own question, in
whichever language it's written in (1105 questions). That surfaced a crash
and 13 real answer-routing bugs that spot-checking would very likely have
missed, since each one only shows up on the exact phrasing it breaks.

**A real crash**, not a routing bug: any moving-average-period question
("what's the 50-day MA?") threw `ReferenceError: MA_PERIODS is not defined`
in `matchingEngine.js` -- imported `maBandDescription` from `ma-periods.js`
but not `MA_PERIODS`, which the same function uses two lines later. One
missing name in one import line.

**Two ticker aliases hijacking ordinary questions.** "cost" (-> Costco) and
"target" (-> Target Corp) are bare dictionary words as well as ticker
aliases, so "dollar cost averaging" and "price target [fibonacci]" were
silently answered with one company's live data instead of the KB topic
actually asked about. Fixed in `tickers.js`: these two aliases now require
an explicit company-question signal nearby (stock/share/ticker/dividend/
p-e/מניה/מחיר/etc.), unless the alias is the entire message.

**11 specificity bugs**, all the same root cause: a specific entry's OWN
authored keyword lost to a generic sibling because the specific entry had no
`priority` -- the exact mechanism `kb/facets.js` already established for
golden-cross/death-cross/etc., just not applied to these. Fixed by adding
`priority:2` (or `6` for a comparison entry needing a bigger margin) to:
index, eps, candlestick-patterns, credit-risk-and-ratings,
implied-volatility-greeks, rsi (had to follow index -- see below), why-
price-moves, how-trading-works, minimum-to-start-investing, investing-
idioms, compound-interest, bond-yield-ytm, bond-price-interest-rate,
bull-vs-bear-market.

**One systemic bug, found by a fix's OWN side effect.** Giving `margin`
priority to beat `leverage` fixed that pair but made `margin` wrongly beat
ITS OWN more specific children (gross-margin/operating-margin/net-margin) --
reverted; "מסחר במינוף" resolving to the closely-related `leverage` entry
is an acceptable outcome, breaking three unrelated, more fragile entries is
not. Giving `correlation` priority to beat a phantom match fixed THAT pair
but flipped an unrelated collision the other way, breaking `pullback`'s own
keyword "correction". Traced to the actual root: `FUZZY_TERMS` is
auto-generated from EVERY single-word keyword in the whole 165-entry KB, so
any two correctly-spelled, unrelated words within edit-distance 2
("correlation"/"correction", "stocks"/"stonks") can manufacture a bonus for
each other. Fixed once, generally, in `fuzzyBonus`: a word already known as
a real KB term is never treated as a possible typo of a DIFFERENT term.
This fixed both collisions at once with no priority hack on either side,
and needed no revisiting after.

**Every fix's regression test was verified sensitive, not just written.**
Each fix was temporarily reverted and its test file re-run to confirm it
actually fails without the fix, then restored -- done for all four fix
classes (the crash, the ticker guard, the fuzzy guard, the coverage sweep
itself). A test that would pass whether or not the bug exists is worse than
no test.

**183 exhaustive-sweep failures were NOT bugs**, and it's worth knowing
which: 8 cases (moving-averages' own "sma"/"ema"/"golden cross"/"death
cross" keywords resolving to those facets instead of itself) are the
CORRECT, already-tested behaviour -- a parent entry listing a child's
keyword so the topic is reachable, where the child is supposed to win. The
permanent test (`kbCoverage.test.ts`) encodes this explicitly as
`FACET_OVERRIDES`, not as a loosened assertion.

**New permanent tests**: `kbCoverage.test.ts` (the full 1105-question sweep,
kept as regression coverage going forward -- not a one-off), `tickerAmbiguity.
test.ts`, `fuzzyMatching.test.ts`. 207 -> 218.

**Known limitation, not fixed**: `FUZZY_TERMS`/`HEB_FUZZY_TERMS` remain
auto-generated from the whole KB with no other guard than the one just
added. Another correctly-spelled word-pair within edit-distance could still
collide the same way; this sweep only found the ones that happened to
surface through the 165 entries' OWN keywords, not through arbitrary
vocabulary. A dedicated pass generating close-pairs across the whole
dictionary would find more, if it's ever worth the time.

## Seventh pass -- the design pass deferred from the sixth

Audited every route and shared component not yet touched this engagement:
CourseComplete, TryItPanel/NotesPanel, AiLauncher, ChartCard, Chart. Most of
them needed NOTHING -- they were already at (or above) the bar the rest of
the site was being brought up to; adding to them would have been decoration
for its own sake, not a fix. Concretely:

- `TryItPanel`'s reveal button and Home's `.method` step rows got the same
  hover-lift already used everywhere else in the product, for consistency.
  Both got a matching reduced-motion guard.
- Confirmed light-mode values already exist and are toned down correctly for
  the tokens added in pass one (`--spotlight`, `--glass-bg/border`) -- these
  were done properly the first time, nothing to fix.
- Confirmed the glossary page's own sticky search bar does not fight the
  shell's sticky header: the header lives in a separate, non-scrolling grid
  row (AppShell), so the two stickies never compete for the same scroll
  container.
- Checked for the leaked-key concern DEPLOY.md already flags: no hardcoded
  Twelve Data key remains anywhere in the current source (`src/`,
  `functions/`) -- the leak was in the OLD single-file build. Rotating the
  key on Twelve Data's own dashboard is still a manual step Ido has to do
  himself before deploying; nothing in-repo can do that part.

**This closes the three-part request from two sessions ago** (glossary
search bar, a design pass across the whole site, AI-engine QA) -- all three
are now done and verified. What is NOT done, listed honestly: recovering
the pre-refactor prose (item below, needs the old file), and real-browser
visual QA (every check in this whole engagement has been structural — types,
tests, build — never eyes on a rendered screen).

## Eighth pass — real bugs from real use, plus a self-inflicted regression

Ido used the deployed build and sent screenshots and a written list of 10
concrete problems. Every one was traced to an actual cause in the source,
not patched by guessing — most had a one-line root cause once found; a
couple were architectural (Hebrew matching, popover positioning).

**Hebrew glossary matched a fragment of an unrelated word.** Plain
substring matching let a short bare term (מדד, תיק) match inside a longer,
unrelated word sharing its Hebrew root (הנמדדת "measured", תיקון "the
correction") — reported as "the dotted underline doesn't reach the end of
the word." Fixed with a real Hebrew word boundary (mirroring English's
`\b`, which doesn't work for Hebrew since JS's `\w` excludes it entirely).
Pinned by test for both reported cases, plus all 109 existing surface forms
re-verified to still self-match. Also added "measured move" as its own
term, since the false match was hiding a real concept worth defining.

**Tooltip clipping, confirmed site-wide, not mobile-only.** The popover was
CSS-centred and absolutely positioned, so any scrolling/overflow ancestor
(a chart card, a narrow panel) or a narrow viewport clipped it. Rewritten
as a portal to `document.body` with real pixel placement computed from the
word's `getBoundingClientRect()`, clamped to the viewport, flipping below
when there's no room above. Placement math extracted to its own pure
module (`ui/utils/popoverPlacement.ts`) with 8 direct unit tests — no DOM
needed, since jsdom's `getBoundingClientRect` returns zeros anyway.

**"New chat" button overlapping the first line of the answer.**
`AiRoute.module.css` had an ENTIRE dead block left from an old design:
duplicate `.reset`, `.empty`, `.examples`, `.example`, `.thinking`, plus
unused `.head`/`.title`/`.sub` — the current rules were later in the file
and won the cascade, but the file still cascaded past the overlap. Deleted
the dead block; separately fixed the transcript's top padding, which was
never sized to clear the floating back/reset buttons above it (they start
at 16px and stand 46px tall; the transcript had only 32px of top padding).

**Duplicate questions in the topic browser.** Two real, separate bugs:
1. `risk-reward-ratio` was a FULL entry authored independently in two KB
   files (`risk.js` and `focused.js`). `kbById` silently resolved to
   whichever loaded last, so lookups looked fine; `topicsInCategory`
   filters the raw array without deduping, so it rendered as two identical
   buttons. Kept the more complete version (had `priority`, more keywords),
   merged both `related` lists, deleted the other. New permanent test:
   `kbCoverage.test.ts`'s "KB entry ids are unique" — this is the one that
   actually catches it; a same-id duplicate is invisible to the per-keyword
   sweep, since `entry.id` matches for both copies.
2. `openCategory` in `AiRoute.tsx` was ONE piece of state shared by every
   browse-widget in the whole conversation. Opening a category in a second
   "list of topics" turn also silently reopened it in an earlier one still
   on screen. Scoped it to `{ index, cat }` so each browse turn owns its
   own state.

**"Explain the chart" never recognized the current lesson.**
`setAmbientLessonTopic` (engine) and `resolveCurrentTopic` (the canonical
"what is the user looking at" resolver) both existed, fully typed, fully
compatible — and were NEVER CALLED from anywhere. Wired them together in
`AiLauncher`, the one place that knows both the current route and the
lesson progress needed for the fallback case.

**This wiring caused a regression, caught before shipping.**
`setAmbientLessonTopic` lived inside `matchingEngine.js`, which eagerly
imports the whole ~300 kB KB at its own top level. `AiLauncher` renders on
EVERY route and is never lazy — importing one small function from that file
pulled the entire engine back into the main chunk. Main chunk: 335 kB ->
692 kB, silently. Fixed by extracting the ambient-topic state into its own
zero-dependency module (`@core/ai/ambientTopic.js`); the engine now imports
FROM it instead of defining it, and `AiLauncher` imports directly from it,
never touching the `@core/ai/index` barrel. Main chunk back to 343 kB.
**New permanent test** (`tests/ui/bundleSplit.test.ts`): a static check that
no eager UI file imports the engine, the KB, or the barrel — this is a
structural rule, not a size number, so it won't need re-baselining for
unrelated reasons and would have caught this on the first attempt, not
after a build. Required adding `@types/node` as a dev dependency (Node's
`fs`/`path`, dev-time only, no production impact).

**Low-contrast "not sure" buttons.** `--line` sits only one shade off
`--surface` (#2b3542 vs #151c24) — reads as "there" in a design tool, reads
as "barely visible" on an actual dark screen. Switched to `--line-strong`
plus a visible fill.

**Spotlight looked like "a square stuck in the middle of the screen."**
The gradient had an explicit `60% 60%` ellipse size, which stops short and
leaves a visible edge inside its own container. Removed the explicit size
(lets it default to farthest-corner, reaching the container smoothly) and
moved the centre above the container's own top edge, so only the widening
lower half — the natural look for light falling from off-screen — is ever
on screen.

**Quiz/lesson content audit — asked to verify lessons teach what their own
quiz tests, "if not, add it."** Cross-referenced every question's `lesson`
field against that lesson's actual prose AND its exercise/annotation notes
(not just prose — l2/l3/l5's annotation notes cover things prose alone
doesn't, e.g. l3's notes already explain why the 150-day line starts later
on the chart). Four real, confirmed gaps found:
- l0 tested ETFs and market cap, defined neither.
- l4 tested what a hammer / bullish-engulfing candle looks like, described
  neither shape.
- l6 tested RSI divergence, never mentioned it.
- l7 tested a double bottom's structure, never described it.

Added a new, clearly-labeled `extra` field to `LessonProse` (distinct from
`intro`/`deeper`, which stay untouched — this is additive, not a rewrite of
the authored text) with real, correct definitions for each gap, styled with
the purple "advanced concept" tokens rather than the blue "worth knowing"
ones, since teaching a skipped term is a different kind of addition than
adding nuance to something already taught. l0 also got the extra basics
Ido asked for directly (ticker, exchange, dividend) beyond just the quiz
gap. l1/l2/l3/l5 were audited too and confirmed already covered — no
content invented where none was needed.

**Every fix in this pass was verified sensitive**, same practice as the
engine QA pass: reverted, confirmed the relevant test actually fails,
restored. Not just "the new test passes."

218 -> 242 tests.

## Ninth pass — two more layout bugs from real use

Screenshots of the deployed site, two concrete complaints.

**"Worth knowing" and "extra" rendered stacked, wanted side by side.**
Straightforward once identified: wrapped both in a shared flex row
(`.notesRow`) with `flex: 1 1 380px` each — side by side above ~780px,
wrapping to stacked below it with no separate media-query rule needed.

**"The top card looks bad — expand it full width or centre it."** Traced to
chart-example galleries with an ODD number of examples: in a 2-column grid,
the last one sits alone in one column with the other left empty. Two
things had to be fixed together, not separately:

1. `auto-fit` alone only makes 3+ columns LESS likely on a wide screen, not
   impossible, so "the last odd card spans the row" needs the grid capped
   at exactly 2 columns to be reliably correct — added `max-width:
   calc(460px * 2 + gap)` to `.cardStack` (excluded from the single-chart
   case, which still wants the full page width).
2. A first attempt at "is the total count odd" was wrong and caught by its
   own test: l2 has 3 example charts, but its FIRST one already spans a
   full row by itself (it carries the annotation-notes aside) — which
   means cards 2 and 3 pair up cleanly, nobody is left alone. The real
   rule has to subtract that leading full-row card before checking parity.
   Fixed by computing which card (if any) is actually left trailing alone,
   given card 0's aside may already consume a row on its own.
3. The lone card spans the row (so it isn't left beside empty space) but
   is centred at a NORMAL card's width, not stretched — stretching a single
   chart across two columns would distort its proportions relative to
   every other example in the lesson. New `ChartCard` prop (`spanFull`)
   and CSS class (`.spanFullCentered`), distinct from the existing
   aside-driven `.spanFull` (which DOES want the extra width, for its
   split chart+panel layout).

Checking every lesson rather than just the reported one (l7) found the
identical shape already present, unreported, in l4 (5 examples) and l6 (3)
— fixed by the same change, confirmed by test rather than assumed.

242 -> 246 tests.

## Remaining
1. **Recover omitted pre-refactor prose.** Ido reports explanations that
   existed in the single-file build and did not survive the port. The old
   file was not available in this session — it is needed to diff against.
2. **Visual QA in a real browser — underlined again by this pass, not just
   restated.** Every one of the eighth pass's 10 bugs was invisible to
   `tsc`/the test suite/`vite build` — all of them only surfaced once Ido
   actually used the deployed site. Structural verification is real
   verification, but it is not a substitute for eyes on a live browser, and
   this session is the concrete proof, not just the caveat.
3. **Deploy.** See DEPLOY.md. Rotate the Twelve Data key first; the old one
   leaked.
4. **l4/l6/l7 still have no interactive exercise or chart-annotation data**
   (unlike l1/l2/l3/l5) — this pass added the missing DEFINITIONS as prose
   (the `extra` field), which closed the quiz gap, but a real annotated
   chart showing an actual hammer candle, an actual double bottom, etc.
   would teach the shape better than words alone. Only worth doing with
   real chart data exhibiting the pattern, checked visually — not invented.
5. `@types/node` was added as a dev dependency this pass (for
   `bundleSplit.test.ts`'s static file-reading). Dev-only, no production
   impact, but worth knowing it's new if a future audit wonders why it's
   there.

## Rules that carry forward
- Charts are recessed (`--well`) — including inside a ChartCard, where the
  card is raised and the chart is set into it.
- Yellow = the one primary action. Blue informs, green succeeds, red warns,
  purple is advanced. This holds on the canvas too, not just in CSS.
- `@core` describes annotations by tone and `{he,en}`; only `@ui` resolves
  colour and language. Never put a colour string or a resolved label in
  `@core`.
- Chart height is a property of the CONTENT — a 20-candle pattern and a
  260-candle trend do not get the same height.
- Rail is permanently open. No toggle, no scrim, no Overview button.
- One `<header>` per document — a route's own head is a `<div>`.
- Never loosen a test to make it pass; re-baseline exact counts upward only
  when content legitimately grew (the bank went 9 → 29 this way).
