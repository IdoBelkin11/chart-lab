# Graph Report - chart-lab  (2026-09-22)

## Corpus Check
- 128 files · ~124,909 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 22 file(s) not represented in the graph (top: .css 20, (none) 1, .toml 1)

## Summary
- 732 nodes · 1602 edges · 38 communities (24 shown, 14 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 44 edges (avg confidence: 0.84)
- Token cost: 89,000 input · 6,743 output

## Community Hubs (Navigation)
- Ticker Resolution & Market Providers
- AI Matching Engine
- Lesson Charts & Exercises UI
- Stock Intent & Market Analysis
- Glossary & Learning UI
- Market Data Backend Functions
- i18n, Progress & App State
- Knowledge Base Content
- Build & Package Config
- Calculators & Quiz Engine
- Chart Series Generation
- AI Tutor Chat Route
- TypeScript Config
- App Shell & Navigation
- Stock Lookup & Compare/Stock Routes
- App Entry & Styles
- Firebase Functions Package
- Route View & Hash Routing
- Twelve Data Provider
- Lesson Topic Resolution
- Session Bug Log (AI Engine)
- Theme & Header
- Error Boundary
- Netlify Functions Package
- Vite Config Troubleshooting
- API Key Rotation
- Firebase Hosting
- Core/UI Architecture Rule
- Series Type Defs
- Vite Env Types
- HTML Root Entry
- ChartCard Layout Fix
- Prose Authoring Rule
- Quiz Advance Bug
- Calculators (README)
- Charts (README)
- Quiz Engine (README)

## God Nodes (most connected - your core abstractions)
1. `useLang()` - 41 edges
2. `generateAiReply()` - 37 edges
3. `normalizeText()` - 36 edges
4. `vitest` - 27 edges
5. `react` - 23 edges
6. `useRoute()` - 19 edges
7. `compilerOptions` - 17 edges
8. `createConversationContext()` - 15 edges
9. `LessonRoute()` - 15 edges
10. `generateAiReply()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `DemoProvider` --semantically_similar_to--> `Firebase Blaze plan requires a billing card`  [INFERRED] [semantically similar]
  DEPLOY.md → NETLIFY-DEPLOY.md
- `Bundle split (lazy-load AI/KB engine)` --conceptually_related_to--> `AI layer / matching engine`  [INFERRED]
  NEXT-SESSION.md → README.md
- `@core/ai/ambientTopic.js module` --conceptually_related_to--> `AI layer / matching engine`  [INFERRED]
  NEXT-SESSION.md → README.md
- `Ticker alias hijacking bug (cost/target)` --conceptually_related_to--> `AI layer / matching engine`  [INFERRED]
  NEXT-SESSION.md → README.md
- `FUZZY_TERMS cross-collision bug` --conceptually_related_to--> `AI layer / matching engine`  [INFERRED]
  NEXT-SESSION.md → README.md

## Import Cycles
- 3-file cycle: `src/core/ai/context/conversationContext.js -> src/core/ai/intent/stockIntent.js -> src/core/ai/entity/tickers.js -> src/core/ai/context/conversationContext.js`
- 4-file cycle: `src/core/ai/context/conversationContext.js -> src/core/ai/engine/matchingEngine.js -> src/core/ai/intent/stockIntent.js -> src/core/ai/entity/tickers.js -> src/core/ai/context/conversationContext.js`
- 5-file cycle: `src/core/ai/context/conversationContext.js -> src/core/ai/intent/stockIntent.js -> src/core/ai/entity/tickers.js -> src/core/ai/market/index.js -> src/core/ai/market/demoProvider.js -> src/core/ai/context/conversationContext.js`
- 5-file cycle: `src/core/ai/context/conversationContext.js -> src/core/ai/intent/stockIntent.js -> src/core/ai/market/analysis.js -> src/core/ai/market/index.js -> src/core/ai/market/demoProvider.js -> src/core/ai/context/conversationContext.js`

## Hyperedges (group relationships)
- **Market data proxy request flow (browser to provider)** — index_chart_lab_config, netlify_functions_market, netlify_deploy_netlify_toml, deploy_cloud_function, functions_src_normalize [INFERRED 0.85]
- **AI engine QA sweep bug fixes (sixth pass)** — next_session_ai_engine_qa_sweep, next_session_ticker_ambiguity_bug, next_session_fuzzy_matching_bug, next_session_matchingengine_ma_periods_crash, tests_core_kbcoverage_test [EXTRACTED 1.00]
- **@core layer pure/state modules** — readme_kb, src_core_lessons_lessons, src_core_lessons_currenttopic, src_core_progress_progress, readme_core_ui_architecture [EXTRACTED 1.00]

## Communities (38 total, 14 thin omitted)

### Community 0 - "Ticker Resolution & Market Providers"
Cohesion: 0.06
Nodes (53): Duplicate risk-reward-ratio KB entry bug, Knowledge base (165 entries, 10 facets), ref_fs, ref_path, vitest, createConversationContext(), AMBIGUOUS_ALIASES, COMPANY_SIGNAL_CUES (+45 more)

### Community 1 - "AI Matching Engine"
Cohesion: 0.06
Nodes (62): expireEntityContextIfStale(), isEntityContextStale(), ANOTHER_EXAMPLE_KW, BROWSE_TOPICS_KW, CHART_QUERY_KW, COMPARISON_KW, composeAnswer(), COMPOUND_HINTS (+54 more)

### Community 2 - "Lesson Charts & Exercises UI"
Cohesion: 0.07
Nodes (41): setPendingTutorAction(), chartsForLesson(), LESSON_CHARTS, LessonChartSpec, ma150, ma20, ANNOTATION_LESSONS, AnnotationOnly (+33 more)

### Community 3 - "Stock Intent & Market Analysis"
Cohesion: 0.08
Nodes (50): containsWholeWord(), ENTITY_COMPARISON_KW, EXPIRE_AFTER_TURNS, GENERIC_ENTITY_PRONOUN_KW, looksLikeEntityComparison(), looksLikeEntityPronounReference(), looksLikeMetricImplicitReference(), METRIC_IMPLICIT_PRONOUN_KW (+42 more)

### Community 4 - "Glossary & Learning UI"
Cohesion: 0.08
Nodes (36): Inline glossary feature, Hebrew glossary substring match bug, GlossaryScope dedup-via-useRef bug, highlightGlossaryGroup (pure function fix), buildMatchers(), escapeRegExp(), GlossarySegment, highlightGlossary() (+28 more)

### Community 5 - "Market Data Backend Functions"
Cohesion: 0.07
Nodes (41): Per-endpoint cache TTLs (quote 60s / history 1h / search 24h), Cloud Function (market data proxy), DemoProvider, Rate limiting (30 req/min per caller), Twelve Data API, { defineSecret }, market(), { onRequest } (+33 more)

### Community 6 - "i18n, Progress & App State"
Cohesion: 0.09
Nodes (33): directionFor(), LANGS, STRINGS, translate(), TranslationKey, TopicResolutionInput, browserStorage, EMPTY_PROGRESS (+25 more)

### Community 7 - "Knowledge Base Content"
Cohesion: 0.07
Nodes (25): entries, entries, entries, KB_BEHAVIORAL, entries, entries, entries, KB_EXAMPLES (+17 more)

### Community 8 - "Build & Package Config"
Cohesion: 0.05
Nodes (38): author, dependencies, react, react-dom, description, devDependencies, jsdom, @testing-library/react (+30 more)

### Community 9 - "Calculators & Quiz Engine"
Cohesion: 0.12
Nodes (27): compoundInterest(), dividendYield(), dollarCostAverage(), peRatio(), percentageReturn(), profitLoss(), createQuizSession(), createQuizSessionFromQuestions() (+19 more)

### Community 10 - "Chart Series Generation"
Cohesion: 0.07
Nodes (23): C_BEARE, C_BULLE, C_DOJI, C_HAMMER, C_STAR, genCandles(), L1, L2 (+15 more)

### Community 11 - "AI Tutor Chat Route"
Cohesion: 0.17
Nodes (16): react, CATEGORY_LABELS, CATEGORY_ORDER, followupChipsFor(), isUsableLabel(), pickLabelTerm(), topicsInCategory(), takePendingTutorAction() (+8 more)

### Community 12 - "TypeScript Config"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, baseUrl, checkJs, isolatedModules, jsx, lib, module (+12 more)

### Community 13 - "App Shell & Navigation"
Cohesion: 0.19
Nodes (14): currentLessonTopicId(), setAmbientLessonTopic(), nextLessonId(), useProgress(), buildHash(), useRoute(), HomeRoute(), src_ui_routes_home_homeroute_module (+6 more)

### Community 14 - "Stock Lookup & Compare/Stock Routes"
Cohesion: 0.15
Nodes (16): LookupResult, lookupStock(), StockSnapshot, Candle, Quote, CompareRoute, StockRoute, CompareRoute() (+8 more)

### Community 15 - "App Entry & Styles"
Cohesion: 0.21
Nodes (6): react-dom, @testing-library/react, root, App(), src_ui_styles_base, src_ui_styles_tokens

### Community 16 - "Firebase Functions Package"
Cohesion: 0.14
Nodes (13): dependencies, firebase-functions, description, engines, node, main, name, private (+5 more)

### Community 17 - "Route View & Hash Routing"
Cohesion: 0.23
Nodes (9): AiRoute, src_ui_app_routeview_module, RouteView(), FEATURE_ROUTES, parseHash(), Route, RouteName, RouteParams (+1 more)

### Community 18 - "Twelve Data Provider"
Cohesion: 0.38
Nodes (10): marketApiBase(), marketRuntimeConfig(), TWELVE_DATA_PATHS, twelveDataConfigured(), twelveDataGetFundamentals(), twelveDataGetHistory(), twelveDataGetQuote(), twelveDataKey() (+2 more)

### Community 19 - "Lesson Topic Resolution"
Cohesion: 0.35
Nodes (7): describe(), resolveCurrentTopic(), isLessonId(), LESSON_IDS, lessonById(), LESSONS, base

### Community 20 - "Session Bug Log (AI Engine)"
Cohesion: 0.39
Nodes (8): AI engine exhaustive QA sweep (1105 questions), @core/ai/ambientTopic.js module, Bundle split (lazy-load AI/KB engine), FUZZY_TERMS cross-collision bug, MA_PERIODS ReferenceError crash, Ticker alias hijacking bug (cost/target), AI layer / matching engine, Circular import bug (engine → intent → engine)

### Community 21 - "Theme & Header"
Cohesion: 0.36
Nodes (6): useAppState(), useTheme(), Header(), src_ui_shell_header_module, ToolKey, TOOLS

### Community 22 - "Error Boundary"
Cohesion: 0.29
Nodes (3): ErrorBoundary, Props, State

### Community 24 - "Vite Config Troubleshooting"
Cohesion: 0.67
Nodes (3): ErrorBoundary component, vite.config.ts fileURLToPath fix, Exact dependency version pinning (Vite 5 vs Vite 8)

## Knowledge Gaps
- **203 isolated node(s):** `name`, `description`, `private`, `main`, `node` (+198 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 267 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `Ticker Resolution & Market Providers` to `Lesson Charts & Exercises UI`, `Glossary & Learning UI`, `i18n, Progress & App State`, `Knowledge Base Content`, `Build & Package Config`, `Calculators & Quiz Engine`, `AI Tutor Chat Route`, `App Entry & Styles`, `Lesson Topic Resolution`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Why does `react` connect `AI Tutor Chat Route` to `Lesson Charts & Exercises UI`, `Glossary & Learning UI`, `i18n, Progress & App State`, `Build & Package Config`, `Calculators & Quiz Engine`, `App Shell & Navigation`, `Stock Lookup & Compare/Stock Routes`, `App Entry & Styles`, `Route View & Hash Routing`, `Error Boundary`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `useLang()` connect `Glossary & Learning UI` to `Lesson Charts & Exercises UI`, `Calculators & Quiz Engine`, `AI Tutor Chat Route`, `App Shell & Navigation`, `Stock Lookup & Compare/Stock Routes`, `Theme & Header`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `name`, `description`, `private` to the rest of the system?**
  _203 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Ticker Resolution & Market Providers` be split into smaller, more focused modules?**
  _Cohesion score 0.05711849957374254 - nodes in this community are weakly interconnected._
- **Should `AI Matching Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.060515873015873016 - nodes in this community are weakly interconnected._
- **Should `Lesson Charts & Exercises UI` be split into smaller, more focused modules?**
  _Cohesion score 0.07393483709273183 - nodes in this community are weakly interconnected._