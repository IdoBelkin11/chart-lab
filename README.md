# Chart Lab — React migration (in progress)

Two-layer architecture, deliberately:

```
src/
  core/          UI-agnostic. No React, no DOM, no CSS.
    ai/kb/       165 knowledge entries + 10 facets, composed explicitly
    lessons/     lesson identity + canonical current-topic resolution
    progress/    pure state transitions + injectable storage adapter
    quiz/        session engine + question bank (9)
    calculators/ pure financial maths
    types/       shared domain contracts
  ui/            React only
    shell/       AppShell, Header, CourseRail
    routes/      one folder per route
    components/  primitives · learning · charts · feedback
    hooks/       useLang, useTheme, useRoute, useProgress
```

`@core` is the boundary. If this ever moves to React Native, everything under
it moves unchanged and only `@ui` is rewritten — that is the whole reason the
split exists.

## Status — the app RUNS

    npm install && npm run dev

You get the real shell: permanent course rail with all 8 lessons and live
progress, global header (tools / theme / language), working hash routing,
home overview and lesson pages. Progress, language and theme persist.

**144 tests passing. Production build succeeds. Zero type errors.**

Live routes: home, lessons, **AI tutor** (`#/ai`), **quiz** (`#/quiz`),
**calculators** (`#/calculators`).

### Design decisions carried over
- Rail is **always open** — no toggle, no drawer, no scrim. The roadmap is
  context, not a menu. (This also deletes a whole bug class: the old scrim
  shipped with the HTML `hidden` attribute, which beats any CSS display rule,
  so it could never appear while still holding pointer-events — an invisible
  click-blocker.)
- **No "Overview" button.** The brand at the top of the rail is the single
  way home, from every route.
- **Semantic accents.** Yellow = the one primary action; blue = informational;
  green = success; red = risk; purple = advanced. Colour carries meaning.
- Charts are **recessed below** the page (`--well`), not raised on cards.

## Ported and tested (42 core tests):
- KB → ESM. Each topic file exports its own entries; `kb/index.ts` composes
  them. This removes the old load-order coupling where a facet had to be
  concatenated after its parent.
- `lessons.ts` — one source of truth for lesson identity. The legacy build
  scattered this across an i18n blob and two lookup tables, which is how the
  AI tutor and the quiz could disagree about the current topic.
- `currentTopic.ts` — now a pure function. The old one read the active lesson
  out of the DOM, coupling a core decision to markup.
- `progress.ts` — pure transitions, injectable storage (swappable for
  AsyncStorage or Firestore without touching the rules).
- Quiz engine + bank, calculators — verified numerically identical.

Ported since: i18n (209 keys), app state, hooks, routing, shell, home,
lesson pages.

### AI layer — ported and working
The whole engine moved: knowledge base, facet resolution, conversation
context, example rotation, entity/ticker resolution, market providers. Two
real problems surfaced during the port, both hidden by the old script
concatenation:

- **A circular import** (engine → intent → engine). `normalizeText` and the
  fuzzy helpers were extracted into a leaf module to break it.
- **Implicit globals.** Every file assumed the others' symbols existed.
  Dependencies are now declared, so a missing one is a build error rather
  than a runtime surprise.

The engine no longer touches the DOM at all — it used to read the active
lesson with `document.querySelector`. `@core` is now verifiably DOM-free,
which is what would let it move to another renderer unchanged.

### Calculators
Tabs are described by data — fields plus a compute function — so adding one
is an entry in a list, not a new component. Results recompute as you type:
these are exploratory tools, and a submit button between changing a digit and
seeing its effect gets in the way of the understanding people came for.

### Charts
All 19 seeded series are wired to lessons. A lesson holds an ARRAY of charts,
because several lessons' own prose promises more than one example — the
earlier one-chart-per-lesson mapping silently dropped 12 of the 19.

Annotations are described in `@core` semantically — a `tone` and a
`{he, en}` label — and resolved to colours and current-language text in
`@ui/components/charts/Chart.tsx`. That seam is the reason a colour string
never appears in `@core`, and its absence is why the annotation data that
lesson files already carried was drawing nothing at all.

Each chart renders in a `<ChartCard>`: the card is raised, the chart stays
recessed inside it. Height is set per chart, because the right height is a
property of the content — a 20-candle pattern illustration and a 260-candle
trend should not be the same size.

### Quiz
Scoped to the lesson the learner is on, by the question's own `lesson` field.
The previous build mapped each lesson to a broad CATEGORY, so all seven
technical lessons drew from the same three questions and "Practice this" in
the moving-averages chapter opened an RSI question. There is no category
fallback now: a scoped quiz contains that lesson's questions or nothing, so
practice can never serve material from a chapter the learner has not reached.

## Commands
    npm run dev      # vite
    npm run build    # tsc --noEmit && vite build
    npm test         # vitest
