# Resume here

## Redesign implementation — "Learning Glass" (approved 2026-09-25)
Visual source of truth: the design Artifact (claude.ai/artifact/JgNsFp6J3rwS62C4JFL1xG).
Phased plan: 1 foundation → 2 curriculum model + progress migration → 3 core
learning (home, tracks, lesson workspace, practice, completion) → 4 lesson
types → 5 tools (stock lookup = a card in Tools) → 6 AI tutor → 7 mobile →
8 all 47 lessons. Each phase: tests + build + screenshots + axe before the next.

**Phase 1 — foundation: DONE** (322/322 tests, build OK, axe 0 on 13 route/theme/width checks)
- `ui/styles/tokens.css`: Artifact palette (gold learn, info, ok, risk, err,
  adv, ai) for both themes; the old names (--accent, --action*, --success,
  --danger, --advanced, --line*) are compatibility aliases onto the new roles.
- `ui/styles/system.css` (new): the Artifact's primitives 1:1 (glass, well,
  type, buttons, chips, seg, meter/ring/segs/num). Loaded BEFORE components in
  main.tsx so a component module beats a global primitive on the same node.
- Shell: topbar (brand + Tracks/Practice/Tools/Glossary + progress + lang/theme
  switches), rail at inline-end in the Artifact style, glass AI launcher,
  phone TabBar (mounted only at ≤760px via useMedia), interim Tools switcher
  (calculators/stock/compare) until the Tools hub.
- `Icon` component with the Artifact icon set; chart palette = design tokens
  (20-avg stays orange, 150 teal — their captions name the colours).
- Deliberate test updates: Hebrew language button is "עב"; theme is a
  dark/light pair; sections are links; main nav is "ניווט ראשי".
- Open: route content (home/lesson/quiz…) is still the previous layout until
  Phase 3; brand mark ▼▲ is still a placeholder (favicon/logo deploy gate).

**Phase 2 — curriculum model + progress migration: DONE** (357/357 tests, build OK)
- `core/curriculum/data.ts`: GENERATED from the design's curriculum (6 tracks,
  47 lessons: level, module, kind, minutes, kbTopics, prereqs, legacyId, and
  7 content-specific step titles for 29 lessons). Every kbTopic resolves to a
  real KB entry (tested); 'macd' joins T7 when its KB entry is written.
- `core/curriculum/curriculum.ts`: lookups, practice rule (1 q/lesson, min 5,
  pass 80% rounded up), legacy map l0→F1 l1→T4 l2→T5 l3→T6 l4→T2 l5→T9
  l6→T7 l7→T10.
- `core/curriculum/recommend.ts`: the onboarding rules (bilingual), identical
  to the design's live prototype; profiles A/B/C → P/R/T tested.
- `core/progress/learning.ts`: v2 record (`chartlab.learning.v2`) — furthest
  step per lesson, completion, practice attempts/best/passed, onboarding
  answers, last lesson. Reading UNIONS the old record in (never loses a
  completion); writing also keeps `chartlab.lessonProgress` as a projection
  (rollback-safe). Verified in the browser with a real legacy save.
- AppState: `learning` is the single source of truth; the old 8-lesson API is
  derived from it, so unrebuilt screens are unchanged.

**Phase 3 — core learning: DONE**
- 3.1 tracks: DONE. `#/track/X` page (hero, modules, aside). Context-aware rail
  (all tracks on home, lesson list inside a track). The 39 unwritten lessons
  show as "בקרוב" and open an honest preview (`LessonPreview`), never fake content.
- 3.2 home + onboarding: DONE (368/368 tests, build OK, axe 0 on every
  onboarding step × dark/light × he/en × 1440/390, plus home).
  - Home: first visit (F1 + "לא בטוחים מאיפה להתחיל?") vs returning (resume
    hero with the lesson's own step names, next steps, in-progress, all tracks
    with the recommended one spotlighted).
  - `#/onboarding`: full screen with no shell, lazy-loaded (main chunk 349 kB).
    Welcome → 4 questions + the live "המסלול מתגבש" panel → result spotlight →
    roadmap → first lesson. It is phone-specific at ≤760px. Answers are saved
    on reaching the result.
  - The skip test for experienced users currently goes to the Foundations
    track page; point it at F's practice once 3.4 exists.
- 3.3 lesson workspace: DONE (363/363 tests, build OK with a 358 kB main chunk, axe 0 on every
  step of all 8 lessons × dark/light × he/en × 1440/1024/390).
  - `LessonWorkspace` is full screen with no shell: lesson bar (back to track, the 7 named steps
    as a free-navigation loop, AI tutor), a pane, the chart well, and a footer that names each move.
    On phone: a segmented step bar, chart above text, and a glass bottom bar.
  - Content mapping (user decision 2026-09-25) lives in `core/lessons/workspace.ts`. Prose
    is verbatim across steps 1–3 (intro / deeper / extra) with the lesson's own charts (a gallery
    when a step has several). Try/feedback is l1's chart exercise or the lesson's first
    quiz question. Takeaway is 2 short new sentences per lesson, restating its own prose.
    Step 7 = lesson complete (stats, next lesson, practice, undo).
  - Step titles for the 8 lessons were adjusted to their real content in the design source
    (scratchpad `design-src/outline.mjs`) and data.ts was regenerated. The Artifact itself
    has NOT been republished with the new titles.
  - Removed as superseded: LessonRoute, TryItPanel, NotesPanel, ChartCard, cardLayout,
    CourseComplete (the old 8-chapter "finish the course"; track completion is 3.4).
  - Open: T7's lesson TITLE still says "RSI ו־MACD" (curriculum), and MACD is not taught yet.
    The chart toolbar from the design (cursor/line/zoom) is not rendered, because it has no function yet.
- 3.4 practice + completion: DONE (373/373 tests, build OK with a 355 kB main chunk, axe 0 on the
  practice walk-throughs at 1440/390 in dark/light and he/en).
  - Rule (user decision 2026-09-25): practice covers the track's WRITTEN lessons (1 question each,
    topped up to 5 from the same lessons' banks, pass = 80% of the questions asked rounded up,
    unlimited retries, each attempt rotates to other questions). It opens when all written lessons
    are done. A track is only "done" when ALL its lessons are, so the celebration is reachable once
    Phase 8 writes them. Logic: `core/practice/trackPractice.ts`, `learning.practiceOpen`,
    `recordPractice(track, correct, total)`.
  - `#/practice/T`: entry, locked, retry and results pages (in the shell). `#/practice/T/run`: the
    full-screen question view (the lesson frame, progress dots, feedback + a link to the source
    lesson). The attempt lives in `routes/practice/session.ts` (module store, not persisted).
  - `#/complete/T`: celebration dialog (only right after the completing attempt) + track summary.
    `#/complete/T/next`: choose the next track. Practice and completion are lazy-loaded.
  - Linked from: the track page's practice card, the rail's track-practice row, and the lesson
    completion step (once the last written lesson is done).
  - Not built: the practice "progress map" drawer (11.9) and hints (the question bank has none);
    chart/calculation/scenario question types are Phase 4 (the bank is multiple-choice only).
    The Foundations skip test waits for F2–F5 content.
- Phase 3 is complete.

**Phase 4 — lesson types: FIRST SET DONE** (380/380 tests, build OK with a 376 kB main chunk, axe 0
on every activity state × dark/light × he/en × 1440/390)
- Activities are data (`core/lessons/activities.ts`) + one UI module
  (`ui/components/activities/Activities.tsx`: ActivityPane / ActivityWork / ConceptCards), plugged
  into the workspace's Try + feedback steps. Four types, each on the written lesson where the design
  shows it:
  - `sort` F1: 8 assets into stock / bond / ETF / index. Drag, or tap an asset then a type (touch +
    keyboard). A retry keeps the correct placements. F1's work area opens on the 4 concept cards (07.1a).
  - `chartChoice` T2: "which marked candle is the hammer?", on a new series `C_MIX` (doji / hammer /
    engulfing / shooting star, shapes asserted in tests).
  - `predict` T5: the chart is cut at the breakout, the learner guesses, then the continuation is
    revealed. Ungraded: any guess moves on.
  - `markLevel` T4 (the previous click exercise, now on the generic path) and T10 (place the
    neckline → measured-move target, drawn on the chart).
- Lessons without an activity (T6, T7, T9) keep their first quiz question.
- Not built yet (their lessons are unwritten): trend-line drawing, calculation, comparison,
  scenario, guided practice, project; also T6/T7/T9's design interactions (MA try, RSI peaks,
  dragging the Fibonacci tool).

**Phase 5 — tools: DONE** (393/393 tests, build OK, axe 0 on every tool page, desktop + phone)
- `#/tools`: the hub (Artifact 13.1). Cards: position size, risk/reward, compound interest, DCF,
  compare stocks, stock analysis (the 7th card, as decided), profit & loss (the old return + P/L
  calculators), and the glossary. Also search, and "last used" (remembered in this browser only).
  `#/calculators` still resolves here.
- `#/tools/position | rr | compound | dcf | pnl`: the calculators, lazy-loaded. The maths lives in
  `core/calculators/tools.ts` (tested against the design's numbers: 100 shares, 1 : 2.5 with 29%
  break-even, DCF ₪31.90, compounding against the closed form).
  - Results are live: the design's "חישוב" button was left out, because the previous build's
    tests make "no submit step" a product rule.
  - Currency is ₪ in Hebrew and $ in English.
- The stock and compare pages keep their live data and now sit under "כלים ›" breadcrumbs.
  Visually they are still the previous build's layout.
- Removed: the old tabbed CalculatorsRoute, its SlidingPill, and the interim Tools switcher. The old
  recurring-investment calculator is covered by compound interest (initial + monthly deposit).
- Not built: the hub's "simulators from the lessons" row (those lessons are unwritten), and the
  design's demo comparison table with fictional companies (compare stays on real market data).

**Phase 6 — AI tutor: DONE** (397/397 tests, build OK, axe 0 on every tutor state, desktop/1280/phone)
- The engine is unchanged (user decision 2026-09-25: buy/sell questions keep today's technical read
  + disclaimer; no refusal was added). Everything is local — no API keys.
- `routes/ai/tutorChat.ts`: a store of conversations shared by the full page and the drawer (for the
  page load only). "New chat" keeps the previous conversation in the history; "Delete history" clears.
- Lesson drawer (`TutorDrawer`, lazy, 14.2–14.6): the lesson's AI button opens it beside the lesson
  (a third column ≥1280px, an overlay below that, full screen on phone). It shows a context card
  (track · lesson · step) and a greeting naming the step. Suggestions: explain again (the KB entry),
  another example, and "quiz me" (the lesson's own bonus questions, never the Try-step one — practice
  mode). Also a composer, a disclaimer, and "Full screen" → #/ai. Opening it sets the lesson's topic,
  so "explain the chart" resolves to that lesson.
- The feedback step's explain/example buttons open the drawer with that action.
- After the first wrong answer: a one-time offer card (14.1) with "not now". Closing the drawer shows
  a return toast with "reopen" (14.7).
- Full page (14.8): history · conversation · "what the tutor knows" (lessons done, current step,
  limits, delete history). Back still names the lesson it returns to.
- Not built (the engine can't do these honestly): explanations drawn on the chart (14.3) and mini
  charts inside answers (14.4).

**Phase 7 — mobile: DONE** (401/401 tests, build OK with a 368 kB main chunk, axe 0 on the phone sweep)
- `shell/PhoneBar`: at ≤760px, every route except home gets the phone bar (15.x). Section roots
  (tools hub, tutor) show a large title. Inner pages show a named back button, a centred title and
  the tutor. Home keeps the brand bar with language and theme; practice and glossary open on
  their own heading. Page breadcrumbs are hidden on phone.
- 15.1 track: a compact hero, no tabs; skills, then modules, practice, project, terms (CSS only).
- 15.3 lesson feedback rises as a bottom sheet over a scrim. 15.4 a full-screen chart button on
  lesson charts (close only — the design's drawing tools aren't built). 15.10 the tutor drawer is
  a bottom sheet with a grab handle and expand; the lesson bar steps aside while it's open.
- 15.6 practice results are centred. 15.8 the tools hub is a list. 15.9 calculators show the result
  first. 15.11 the tutor tab has no Back, and "+" starts a new chat.
- Tested by simulating a phone (tests/ui/phone.test.tsx stubs matchMedia).

**Phase 8 — content, track by track. Foundations F2–F5: WRITTEN, AWAITING USER REVIEW**
(433/433 tests, build OK, axe 0 on every F2–F5 step × dark/light × he/en × 1440/390, no console errors)
- User brief: write track by track and STOP after each batch for review. **Do not start Technical
  Analysis until the user approves Foundations.**
- Shared content model `core/lessons/content/`: `types.ts` (LessonContent: 3 TeachSteps with
  heading / paragraphs / callouts / notes / work = charts | cards | diagram | none, plus charts,
  activity, takeaway, ≥3 questions), `index.ts` (registry `lessonContent(id)`, `isWritten`,
  `allQuestions()`), `legacy.ts` (adapter for the 8 carried-over lessons), `foundations.ts` (F2–F5).
  A new lesson = a new content entry. The workspace, tutor drawer, practice, quiz route, home hero and
  `hasContent` read only this.
- Generic diagrams `ui/components/lessons/Diagrams.tsx` (flow, index weights, order book, bars).
  New activity `orderBook` (engine `core/lessons/orderBook.ts`, ported from the prototype).
  The sort activity now serves any bins (2–4); its wording is generic ("item/group").
- F3/F4 step titles were added in scratchpad `design-src/outline.mjs`, and data.ts was regenerated.
- F practice now has 5 questions (one per lesson), with a pass mark of 4.
- Open: the onboarding skip test can now point at F practice (not done, not in scope). The general
  quiz (#/quiz) still draws only on the old bank. T5's predict chart is shown fully while it is
  being taught (Phase 4, unchanged).

- Foundations was APPROVED 2026-09-25, together with F5's step 3 title change (now "שוק או לימיט").

**Phase 8 — Technical Analysis T2–T5: WRITTEN, AWAITING USER REVIEW** (464/464 tests, build OK, axe 0,
no console errors and no horizontal overflow on every T2–T5 step and state × dark/light × he/en × 1440/390)
- **Do not start T6+ until the user approves T2–T5.**
- Content: `core/lessons/content/technical.ts`. T2, T4 and T5 now come from the content model (the
  legacy adapter still serves T6, T7, T9 and T10). The previous build's authored sentences are kept
  word for word where they appear. Every number in the prose is read from the chart data. Series:
  `T2_*` … `T5_*` in `series.js`; swings and zones are found in the data, never typed in.
- User decisions (2026-09-25):
  - T5 follows the Artifact's order. Its teaching charts end before any retest, and the retest is
    first revealed by the prediction. The prediction chart's caption and label are neutral.
  - Visual questions: `QuizQuestion.chart` (an index into the lesson's charts, resolved by
    `questionChart`). Shown in track practice, on the lesson's "Practice this lesson" page and in
    the tutor's "quiz me". The general quiz is untouched.
  - T3 has only the 4-chart drill (Artifact 3.2). Trend-line drawing is deferred.
  - "Apply" = `LessonContent.apply`: one question on a new chart, inside the feedback step.
- Also new and shared: the `classify` activity (board 3.2), a `candles` anatomy diagram,
  `QuestionChart` / `ApplyCheck`, a `PredictActivity.explain` field, and a lesson pane that is
  focusable (axe: scrolling region). Chart labels are clamped inside the canvas (in `drawChart.js`).
- `#/quiz/T2` (and T4, T5) opens the new visual questions; `#/quiz/l4` (and l1, l2) still opens the old ones.
  The old questions remain in each lesson's practice rotation, after the three visual ones.
- T practice now has 8 questions (pass mark 7).
- Not done, and left out of scope by the brief: T1 (the TA track's first lesson) is still unwritten,
  so T2 does not rely on it. The onboarding skip flow and the general quiz were not changed. After a
  wrong answer the tutor's help-offer card appears over the feedback step (Phase 6 behaviour).

- T2–T5 were APPROVED 2026-09-26.

**Phase 8 — T1 (Reading a chart: timeframes and volume): WRITTEN, AWAITING USER REVIEW**
(475/475 tests, build OK, axe 0, no console errors and no horizontal overflow on every T1 step and state
× dark/light × he/en × 1440/390)
- **Do not start T6+ until the user approves T1.**
- Content: `core/lessons/content/t1.ts` (its own file, so the approved T2–T5 file is untouched).
  Series: `T1_*` in `series.js`; `toPeriods` builds weekly candles from daily ones. Step titles were
  added to `design-src/outline.mjs`, and data.ts was regenerated.
- The boundary is enforced by a test: T1 teaches no candle anatomy (that's T2) and no trend
  structure or breakouts (T3, T5).
- Shared, backward-compatible: `ChartChoiceActivity.showVolume` and `.target` (the target defaults
  to "a hammer", so T2 is unchanged).
- T practice is now 9 questions (pass mark 8).
- Known overlap: T5 step 3 (approved text) repeats the definition of volume that T1 now gives.

- T1 was APPROVED 2026-09-26. TA is approved through T5 (T1 foundations · T2 candles · T3 trends ·
  T4 support/resistance · T5 breakout/retest).

**Phase 8 — T6 (Moving averages): WRITTEN, AWAITING USER REVIEW** (486/486 tests, build OK, axe 0,
no console errors and no horizontal overflow on every T6 step and state × dark/light × he/en ×
1440/390. Re-verified after the change: T1–T5, Foundations, T6/l3 quiz pages, T7/T9/T10 and TA practice.)
- **Do not start T7 until the user approves T6.**
- User decisions (2026-09-26), taken after reporting the Artifact-vs-curriculum conflict:
  - **Structure:** the Artifact's (20/50 chart; titles ממוצע נע / קצר מול ארוך / חציית ממוצעים /
    מתי נחצה? / למה האיתות מאחר). The previous build's l3 text is kept where it teaches: 20 ≈ a month,
    the 150 and Minervini, warm-up, and sideways chop (the Apply).
  - **Naming:** the 20/50 event is a "crossover". "Golden cross" is taught as the 50/200 case, as in the tutor's KB.
  - **Try:** a new shared `markPoint` activity ("when did it happen": click a candle, or a keyboard
    slider that is LTR in both languages, like the chart's time axis). `Chart` gained `onIndexClick`,
    and `drawChart` passes the clicked candle. Reusable for T8.
  - **Kinds of average:** simple averages throughout, plus one EMA paragraph.
- Content: `core/lessons/content/t6.ts`. Series: `T6_*`, with `crossings()` in `series.js` (the text,
  the checks and the tests all use it).
- Tests that used T6/l3 as "a lesson still on the old content" now use T9/l5 (same shape).

- T6 was APPROVED 2026-09-26.

**Phase 8 — T7 (Momentum: RSI and MACD): WRITTEN, AWAITING USER REVIEW** (495/495 tests, build OK,
axe 0, no console errors and no horizontal overflow on every T7 step and state × dark/light × he/en ×
1440/390. Re-verified after the change: T1–T6, Foundations, the T6/T7/l6 quiz pages, TA practice, T9, T10.)
- **Do not start T8 until the user approves T7.**
- User decisions (2026-09-26), taken after reporting that the Artifact contradicts itself (its
  outline and practice board say "work out the RSI"; boards 08.2b–c draw a divergence exercise,
  which is T8's lesson):
  - **Try:** "work out the RSI", via a new shared `calculate` activity: a number answer with a
    tolerance, targeted explanations for known wrong turns (dividing the wrong way round, stopping at
    RS, dividing by the day counts), and the worked solution once right. Reusable for T9.
  - **Divergence** belongs entirely to T8. The old question q-rsi-3 is not among T7's questions, and a
    test enforces that T7 doesn't teach it. Known gap until T8 is written: the old `#/quiz/l6` link
    still asks q-rsi-3.
  - **MACD panel:** a new chart variant, `price-macd` (`drawPriceMACD`). Both panels support
    `subMarks` (marks on the indicator line) and price `points`. `series.withRSI` and
    `series.withMACD` compute the values.
- Step titles are the Artifact's outline: RSI בשורה אחת / קנייה־יתר / MACD / חשבו RSI /
  החישוב, צעד־צעד / 3 דברים לזכור / הבא: דייברג׳נס.
- `genCandles` gained an optional noise parameter; the default is unchanged, so every existing
  series is identical.
- Hebrew formulas are wrapped in LTR isolation marks (U+2066 / U+2069), so bidi can't reorder them.
  Keep doing this for formulas inside Hebrew prose.

- T7 was APPROVED 2026-09-26.

**Phase 8 — T8 (Divergence): approved implicitly on 2026-09-26, when the user asked for T9–T12 in one batch.**
- Source: the Artifact's boards 08.2b–c ("price made a new high; did RSI?" — mark the peaks, compare,
  a caveat), moved here from T7. Step titles are new (the Artifact had none for T8), and the spelling
  follows the curriculum: דייברג׳נס.
- New and shared:
  - `markPoints` activity ("find these moments, then compare them": ordered marks with their own
    tolerances, then one question; the indicator's value is shown next to each mark);
  - `links` chart option (lines between two points on price or on the indicator panel);
  - click support on the RSI and MACD panels;
  - price `points` can anchor at a candle's low;
  - `cutAfterLast` in series: a chart that stops after its last swing and keeps what came next as
    `after` facts.
- **The #/quiz/l6 gap is resolved:** q-rsi-3's `lesson` is now 'T8' in the old question bank, so l6's
  quiz asks 2 questions, both about what T7 teaches. The quiz test allows 2 for l6 and pins q-rsi-3 to T8.
  `allQuestions()` now lists written lessons' questions first, so a lesson's quiz page opens on its own.
  Verified in the running app, walking #/quiz/l0–l7 in he and en: no divergence.
- Not changed, and outside the brief: the general quiz (#/quiz, 8 random questions from the whole old
  bank) can still include q-rsi-3, as it can any topic.

**Phase 8 — TA T9–T12: WRITTEN IN ONE BATCH (2026-09-26), AWAITING USER REVIEW. The whole TA track
(12/12) is now in the content model. Do NOT start Fundamentals until the user says so.**
- Files: `content/t9.ts` … `t12.ts`, registered in `content/index.ts`; series appended to `series.js`
  (with `pinSwings`: a swing set to an exact price, so the prose's numbers are the chart's numbers);
  step titles in the scratchpad `outline.mjs` → `data.ts` (T9/T10 from the Artifact outline; T11/T12
  new, the Artifact had none).
- T9 Fibonacci (legacyId l5): Try = `calculate` on a chart ("what % did the pullback give back?"),
  levels revealed once right; Apply = a pullback through every level. l5's 3 old questions appended.
- T10 chart patterns (legacyId l7): double top/bottom, head and shoulders, neckline, measured move.
  Try = `markPoints` (shoulder, head, shoulder) + "what completes it?"; the neckline and target are
  revealed, and the explanation works the target out. l7's 3 old questions appended.
- T11 reversal vs continuation: inverse H&S, flag, triangle, rectangle; wedges named as context-
  dependent. Try = `classify` of 6 sketches that stop before the break. Question charts are cut
  before their break; the outcome is only in the explanation.
- T12 project: trend → levels → volume → momentum; a conflict is read as caution; a cancel point
  ("stop", as an analysis point — sizing is the Risk track's) and a measured target.
  Try = new `checklist` activity (6 questions on one chart, each locks and explains).
- Shared changes: `calculate` can take `chart` + `reveal` instead of a diagram; `classify` has
  `showSwings`, `ask`, `hint`; new `checklist`; the RSI chart's price panel draws `zones` and
  `extraLines` (and fits them in its scale); the locked practice page hides "new lessons will join"
  once every lesson is written.
- Counts: 17 written lessons; TA practice = 12 questions, pass mark 10; passing it now completes TA.

**Consolidation pass (2026-09-26, after TA was complete; not committed):**
- Lesson content is its own chunk now (`content-*.js`, 414 kB, gzip 121 kB), loaded with the first
  lesson / quiz / practice page (and the home page's "continue" chart, via a dynamic import). The
  shell loads ~329 kB (gzip ~110 kB) instead of ~863 kB; Vite's 500 kB warning is gone.
  - `content/meta.ts`: which lessons are written, their old id, their tutor topic — for trackInfo,
    useRoute and AiLauncher. `core/practice/practiceSize.ts`: the practice size for the track page.
  - LessonWorkspace and QuizRoute are `lazy()` in RouteView, like practice/tools already were.
  - Guards: `tests/ui/contentSplit.test.ts` (no static path from main.tsx to the content; metadata ==
    content; practice size == practice). Tests render lazy routes synchronously through a React.lazy
    shim in `tests/setup.ts` (imports start at definition; a `beforeAll` waits for them).
- The tutor's help offer after a wrong answer is in the lesson pane's flow now (under the verdict),
  not fixed over the work area — it no longer covers the chart or, on phones, the Apply check.

**Phase 8 — Fundamentals P1–P9: WRITTEN IN ONE RUN (2026-09-26), AWAITING USER REVIEW. Not committed.
Do NOT start Macro/Risk/Derivatives until the user says so.**
- Data: `core/fundamentals/companies.ts` — fictional companies A–E (the Artifact's page 09, reconciled:
  A's balance sheet gives the DCF's net debt 500; the "profit ≠ cash" company is E, not B). Every
  number in P1–P9 is computed from it; `tests/ui/fundamentalsTrack.test.tsx` checks the identities
  and every claim the prose makes.
- Content: `content/p1to3.ts`, `p4to6.ts`, `p7to9.ts` (+ `fundamentalsKit.ts`); step titles for P1,
  P5, P7, P8 are new (the Artifact had none), the rest are the Artifact's.
- Shared, generic: four diagram shapes (`table`, `stacks`, `waterfall`, `grouped`) in DiagramView,
  with a `compact` mode; `QuizQuestion.figure` + `QuestionFigure` (quiz, practice, tutor, Apply);
  the `explore` activity (P2's statement explorer, Artifact 09.1); checklist on a diagram;
  `dcfBreakdown` beside `dcfPerShare` (P9 runs the tool's model); P8's price series in series.js.
- Tries: P1 sort · P2 explore · P3/P5/P7/P9 calculate · P4/P6/P8 checklist.
- Practice: 9 questions, pass 8; passing completes the track (tested end to end).
- Build: lesson content is split per track by the bundler (`vite.config.ts` codeSplitting groups),
  so no chunk passes 500 kB; the shell still loads none of it.

**Phase 8 — Risk R1–R8: WRITTEN (2026-09-26), AWAITING USER REVIEW. Not committed.
Do NOT start Macro/Derivatives until the user says so.**
- Data: `core/risk/scenarios.ts` — every figure in R1–R8 (account 50,000, R4/R5 trades, assets and
  profiles, simulated daily returns with seed 1701 for the correlation matrix, the loss limit…);
  R-lesson price series are appended to `charts/series.js` (`closesToCandles`). All illustrative,
  labelled as such; no live data. `tests/ui/riskTrack.test.tsx` checks each claim against the data.
- Content: `content/r1to3.ts`, `r4to6.ts`, `r7to8.ts` (+ `riskKit.ts`). R4/R5 run the Tools'
  own `positionSize` / `riskReward`. New step titles for R1 and R3 (in the scratchpad outline →
  `data.ts`). `MarkLevelActivity.explain` (optional) is the only activity-model change.
- Tries: R1/R3/R4 calculate · R2/R6/R7/R8 checklist · R5 markLevel (place the stop on the chart).
- Practice: 8 questions, pass 7; passing completes R and unlocks D (tested end to end).
- Bundle: `lessons-risk` codeSplitting group (136 kB); `content` chunk back to 90 kB.
- Glossary: 20 terms added so every WRITTEN track delivers the terms its completion screen promises
  ("Now in your glossary"); `tests/core/glossary.test.ts` fails when a track is written without
  them. Divergence's Hebrew form now matches the lessons' spelling (דייברג׳נס), so it highlights.
- Liquid Glass nav: `ui/components/nav/Glide.tsx` — one capsule travels between the active items of
  the header tabs, the lang/theme switches and the course rail; leading edge 240 ms, trailing
  470 ms on a slight spring, so it stretches toward the target and settles. It keeps its place
  while the item is momentarily not laid out (clearing it there lost the capsule for good).
- Phone lesson pane: the flat pane no longer draws the glass edge ring and sheen as a square frame.
  Knock-on: activity rule chips (T3/T11) sit on `--surface` now — on the bare phone pane in light
  theme the wash left their coloured text at 4.45:1. Stacks headers wrap (R8 English overflowed).
- Verified: 630 tests, tsc, build; matrix TA+F+P+R × 1440/390 × dark/light × he/en with axe = 0;
  35 route checks clean; production preview clean on 20 routes incl. R and the glossary.

**Phase 8 — Macro M1–M7: WRITTEN (2026-09-26), AWAITING USER REVIEW. Not committed.
Do NOT start Derivatives until the user says so.**
- Data: `core/macro/scenarios.ts` — every figure, all illustrative except `HISTORY_2022` (rounded,
  well-documented US facts, shown under a "Historical, rounded" badge instead of "Illustration").
  Finance helpers live there too: `pv`, `bondPrice`, `ytm` (bisection), `duration` (measured),
  `monthlyPayment`, `realValue`, `inShekels`. M7's two price series are in `charts/series.js`.
  `tests/ui/macroTrack.test.tsx` checks every claim, the Try flows, the tutor and the practice.
- Content: `content/m1to3.ts`, `m4to6.ts`, `m7.ts` (+ `macroKit.ts`, whose `pc`/`sp` isolate
  negative numbers LTR — a bare "−1.5%" reads "1.5%−" in Hebrew). New step titles for M4, M6, M7.
- Tries: M1 explore (move the rate across 1/3/5%) · M2, M5, M6 checklist · M3, M7 sort · M4 calculate.
- New shared pieces: the `lines` diagram (values over time on a % or plain scale: bands, a
  reference line, named points; HTML labels over a stretched SVG, LTR time axis); `table.badge`;
  `ExploreActivity.datasetsLabel` (the switch's accessible name; P2 keeps "company").
- Practice: 7 questions, pass 6. Macro is open from the start (soft prereq F). Bundle `lessons-macro`.
- Tutor: KB keywords added for "priced in" / "מגולם במחיר" and "עושה שוק" (they missed before).
- Glossary: 10 Macro terms in a new `macro` category (interest rate, inflation, GDP, recession,
  central bank, coupon, YTM, yield curve, market maker, priced in).
- UX fixes: the lesson pane's glass is now a frame with an inner scroller (`.paneScroll`) — the
  glass edge ring/sheen scrolled with the text and drew a strip across it; completion is a real
  toggle on step 7 ("Mark lesson as complete" ⇄ "Mark lesson as incomplete", same button).
- Tests that used Macro as "the unwritten track" now use Derivatives (unlocking it where needed).

## Backlog (user, 2026-09-26: a small shared UX fix, later — not now)
- ~~After a wrong answer, the AI tutor's help-offer card can cover part of the Apply check on phones.~~
  Fixed in the consolidation pass (2026-09-26).
- On T5's prediction, which is ungraded, the offer still appears after a "wrong" guess.

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
