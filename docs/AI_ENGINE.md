# AI Engine

How `generateAiReply()` decides what to say, and why the pieces are ordered
the way they are. This exists because the ordering is load-bearing and not
obvious from reading the code top-to-bottom — several bugs in this project
were exactly "someone (an earlier version of this same work) moved a check
to a more 'logical' position and broke routing silently."

## The core principle

**Answer the question, not the topic.** A facet request ("what are the
drawbacks of X") returns only that facet. A specific-company question wins
over a same-word generic concept. A comparison wins over either single side.
This principle drove almost every fix in this file's history.

## Pipeline order and why

See `src/ai/engine/matching-engine.js`, function `generateAiReply`, for the
numbered steps (kept in sync with `docs/CLAUDE.md` §3). The two orderings
that are easy to get wrong:

**Ticker resolution before generic KB scoring.** "מה המחיר של מניית Zillow"
contains the word מניה, which the generic "what is a stock" entry matches on
its own. If generic scoring ran first, it would win — a real bug that
existed and was fixed. Ticker resolution (static, then dynamic) must run
before step 9 (normal scoring).

**Dynamic ticker resolution costs a network call, so it's gated.**
`extractLatinCandidate`/`extractHebrewCandidate` only return a candidate for
messages containing an explicit trigger phrase, a proper-noun-shaped Latin
token, or (via the general filler-stripping fallback) content left over
after removing common question words. An ordinary conceptual question like
"מה זה מניה" matches neither, so it never triggers a fetch — verified by a
test that fails loudly (`fetch` mock throws) if this regresses.

**Short contextual follow-ups are the LAST resort**, checked after every
specific mechanism (facets, comparisons, calculators, scenarios) has already
had a chance. If it ran earlier, a genuine new question that happens to be
short would get swallowed into "continuing the previous topic" instead of
answered on its own merits — this exact failure mode was hit and fixed
("what is an ETF for beginners?" being absorbed by the "explain simpler"
handler because a topic was already active).

## Facets

```js
{ id:'fibonacci', ..., facets: { def: {...}, pros: {...}, cons: {...} } }
```

`detectFacet(norm)` matches phrase patterns (drawbacks/disadvantages vs
advantages/benefits) against the normalized message. If a facet is detected
AND the top-scored entry has that facet, only the facet text is returned —
the entry's full `he`/`en` text is the fallback for when no facet is
requested, never a template every answer has to fill out.

**Only 4 entries have facets today**: fibonacci, etf, take-profit,
stop-loss. Extending this to the rest of the KB is the highest-leverage
remaining AI improvement (P1, not started) — every entry without facets
still over-answers when asked for a specific angle.

### Adding a facet to an existing entry

1. Find the entry in whichever `src/ai/kb/*.js` file it lives in.
2. Add a `facets` object alongside its `kw`/`he`/`en` fields, following the
   shape already used by e.g. `stop-loss` in `kb/14-focused.js`.
3. Add a test case to `tests/ai/intent-scoping.test.js` asserting the facet
   answer is short and doesn't re-explain the whole topic.
4. `npm test`.

## Comparisons

Two mechanisms, layered:

1. **Keyword-phrase matching** (the entry's own `kw` list, same as any KB
   entry) — required when the comparison is about a specific ASPECT of two
   things (e.g. `stocks-vs-bonds-safety` — only relevant when safety is
   actually being asked about, not whenever "stock" and "bond" co-occur).
2. **`sides: [idA, idB]`** — for a clean "just A vs B, nothing more specific"
   comparison. `findComparisonBySides()` checks whether BOTH referenced
   entries' own keywords appear anywhere in the message, in either order,
   and promotes the comparison entry if so. This is what makes "X vs Y" and
   "Y vs X" both work without hand-listing every word order as a separate
   keyword phrase — the fix for a real bug where "שוק דובי לשוק שורי" (bear
   first) missed while the bull-first phrasing worked.

Use `sides` when both halves already exist as standalone entries and the
comparison is genuinely unqualified. Use plain keywords when it isn't.

## Entity resolution

See `docs/MARKET_DATA.md` — the Hebrew→ticker pipeline is documented there
since it's really a market-data concern wearing an AI-pipeline hat (it feeds
into `generateAiReply` at steps 6–7, but the interesting logic is about
company identification, not response matching).

## Conversation context: entity memory (Phase 3)

`lastTopicId` (a KB-entry-id string) and entity memory
(`conversationContext.activeEntity`/`previousEntity`/`activeMetric`, in
`src/ai/context/conversation-context.js`) are two independent axes, not one
mechanism doing double duty. A conversation can be "about" a KB concept and
"about" a company at the same time, and they can diverge — asking a generic
"what is P/E" question while NVIDIA is still the active entity must answer
the *concept*, not NVIDIA's actual P/E. `tests/ai/conversation-context.test.js`
("An ordinary educational question is unaffected by active entity context")
guards exactly this.

**Why entity memory couldn't just reuse `lastTopicId`:** stock answers set
`topicId: 'stock-data'` — a fixed, generic string, the same for every
company. There's nowhere in a bare string to remember *which* company. The
whole point of a separate context object is that it can hold structured
state a string can't.

**Resolution order for a message with no company name in it:**
1. Does it look like a comparison (`looksLikeEntityComparison`) AND are
   there two distinct entities in context? → compare them.
2. Else, does it look like a pronoun/implicit reference
   (`looksLikeEntityPronounReference`) AND is there an active entity? →
   answer about that entity, using `activeMetric` if the reference doesn't
   name a metric itself (metric-implicit case).
3. Else, this isn't an entity-context message at all — fall through to
   normal KB scoring.

This order matters: a comparison phrase and a generic pronoun reference
don't overlap in the current keyword lists, but if a future addition made
them ambiguous, comparison should win since it has the strictly narrower
precondition (needs two entities, not one).

**What `answerForCompany` does with context, concretely:** every time it
successfully answers about a company, it calls `recordActiveEntity` (shift
`previousEntity` ← `activeEntity` only if the company actually changed) and
`recordActiveMetric` (remember which facet was just answered — reset to
null whenever the entity itself changes, since "is that high" shouldn't
carry over a metric from a *different* company). This happens whether the
company was named directly in the message or resolved via a pronoun — so a
chain of pronoun references keeps working turn after turn, not just once.

## Low-confidence entity resolution

`searchAndRankSymbol` used to always return *something* — `pool[0]` if
nothing else disambiguated. That's a guess dressed up as an answer.

Now: after the leverage/derivative filter and the exact-ticker-hit check
(naming the ticker directly is itself disambiguating, so it bypasses the
rest of this), if 2+ *distinct tickers* both look like strong Common Stock
matches on a major exchange, the function returns
`{ ambiguous: true, candidates }` instead of picking one.
`resolveTickerDynamic` propagates this (and stops trying further
transliteration variants — a real signal beats a guess at more variants).
`tryStockDataAnswerDynamic` turns it into a clarification question via
`answerAmbiguousCompany`, which also produces `clarificationCandidates` —
each one's `query` names the exact ticker, so the UI can offer tap-to-answer
buttons that are *guaranteed* to resolve (verified via DOM test — tapping a
candidate never loops back into the same ambiguity).

## Entity-aware follow-up chips

Before Phase 3, a stock-data answer's `relatedIds` was always `[]` — there's
no KB entry backing a live company answer, so the existing
`chipLabelFor(id)` mechanism (which derives a label from a KB entry's own
keywords) had nothing to work from. Stock answers showed zero follow-up
chips.

`entityFollowupChips()` in `chat-ui.js` builds suggestions instead from the
answer's own `entityContext: { ticker, facet }` (never suggest the facet
just answered) and `conversationContext.previousEntity` for a comparison
suggestion. The comparison chip only appears when a real second company is
actually in context — there is no hardcoded "compare to AMD" example
anywhere; if you've never mentioned a second company, you won't see a
comparison suggestion at all.

## Known limitations (not bugs — inherent to the approach)

- Entity memory is exactly two slots (`activeEntity`/`previousEntity`).
  "Compare NVIDIA, AMD, and Intel" isn't handled — extending to N entities
  needs its own design (comparison formatting for 3+ isn't just a loop).
- Neither `activeEntity`/`previousEntity`/`activeMetric` nor `lastTopicId`
  persist across a page reload — they live in memory only.
- This is keyword/pattern matching, not an LLM. A sufficiently novel
  phrasing of an existing concept can still miss. The fuzzy-matching layer
  (Hebrew and English typo tolerance) narrows this but doesn't eliminate it.
- `lastTopicId` is a single slot — the engine has no deeper conversation
  memory than "what was the last thing we resolved." A conversation that
  jumps between two topics and circles back loses the earlier one.
- Facet detection is phrase-pattern based, not semantic — an unusual way of
  asking for "drawbacks" that doesn't match `FACET_PATTERNS` gets the full
  entry instead of the narrow answer.
