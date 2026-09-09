# Market Data

## Provider contract

Every provider in `src/ai/market/` implements the shape documented in
`provider-interface.js`:

```js
{
  id, isDemo, sourceLabel, hasApiKey(),
  async getQuote(ticker)          // throws on failure, never returns a guess
  async getHistory(ticker, days)  // oldest -> newest bars
  async getFundamentals(ticker)   // best-effort; null is fine, never required
  async searchSymbol(query)       // raw candidates; ranking happens elsewhere
}
```

`getQuote`/`getHistory` **throw** on failure. `src/ai/market/index.js`
(`getMarketData`) is the single place a thrown error becomes the honest
"couldn't fetch" answer — never swallow an error into a fabricated value
inside a provider itself.

## Why Twelve Data, and why not the others

Rejected, in the order they were actually tried, each for a documented
reason — re-verify before reconsidering any of these, don't just re-try one
because it's familiar:

- **Yahoo Finance** (unofficial endpoints) — no `Access-Control-Allow-Origin`
  header, confirmed via a real GitHub issue showing the exact browser CORS
  error; and separately, v7/quote started returning 401 as of 2025 as Yahoo
  hardened against unauthorized access. Both independently disqualifying.
- **Finnhub** — their own public listing states "does not support CORS...
  need backend." A backend is exactly what this project isn't building.
- **IEX Cloud** — discontinued in 2023; the whole product was later shut
  down entirely.
- **marketdata.app** — does support CORS, but the free/self-service tier's
  license explicitly prohibits "public websites or apps that display market
  data to visitors" — precisely this project's use case.
- **Stooq** — was the original primary source specifically because it
  required no key. In April 2026 they began requiring an API key issued
  only via a CAPTCHA-gated form, with documentation suggesting they want to
  vet the requester's use case by email first — not a fit for an anonymous
  public client-side app, and a real example of "free forever" not actually
  being forever. This is *why* the provider abstraction exists at all:
  swapping Stooq out for Twelve Data was a same-day, contained change
  because nothing above the provider layer knew which source it was using.
- **TradingView** — has no public data API, full stop. What look like
  "TradingView APIs" in search results are unauthorized third-party
  scrapers reselling access to TradingView's private internal endpoints —
  unofficial, against TradingView's terms, and in the one case checked in
  detail, a *worse* free tier (500 req/month) than Twelve Data's actual free
  tier. TradingView's own free embeddable widgets remain the right tool for
  visual display (chart, technical analysis, profile, news) — they were
  never rejected as a display tool, only as a data source, because a
  display-only widget structurally cannot hand data back to the page's JS.

## Twelve Data specifics

- Free tier: **800 requests/day, 8/minute — shared across every visitor**,
  not per-visitor, because the key is embedded in a public static file (see
  `twelvedata-provider.js`'s header comment — there's no way to hide a
  secret in a site with no backend; view-source always reveals it).
- Each stock question costs roughly 2–3 requests: quote + history, plus
  fundamentals if requested. That puts site-wide capacity at roughly
  250–400 stock questions/day before the shared quota resets — generous for
  an education site's normal traffic, and DemoProvider is the fallback for
  when it isn't.
- `symbol_search` occasionally returns leveraged/inverse products (e.g. a
  "Leverage Shares 3x Long SanDisk ETP") alongside or instead of the actual
  underlying stock. These are filtered by name pattern
  (`looksLeveraged` in `ticker-map-and-resolution.js`) and — this is the
  important part — **if filtering leaves nothing, resolution returns null
  rather than falling back to the unfiltered list.** A leveraged product is
  a materially different financial instrument, not an imprecise match for
  the same thing; silently substituting one would be misleading.

## Entity resolution pipeline (Hebrew/English company name → ticker)

1. **Static curated list** (`TICKER_MAP` in `ticker-map-and-resolution.js`)
   — ~70 companies with Hebrew phonetic aliases, common misspellings, and
   ticker symbols. Zero network cost, best coverage for companies people
   actually ask about constantly. Checked first.
2. **Candidate extraction**, only if the static list misses:
   - `extractLatinCandidate` — longest Latin-script run in the message,
     excluding a jargon stoplist (P/E, RSI, ETF, ...) so those never get
     mistaken for a company name.
   - `extractHebrewCandidate` — tries specific trigger phrases first
     ("מניית X", "כמה עולה X"), then falls back to stripping a curated list
     of Hebrew filler words (תן/לי/מידע/על/מה/זה/...) and using whatever's
     left. The general fallback exists because hand-listing every possible
     trigger phrase is a losing game — "תן לי מידע על X" has no
     company-specific trigger word in it at all.
   - The filler-stripping fallback checks a *stripped* form only to decide
     whether a word is a prefixed filler ("והמניה" = "and the stock") — it
     never alters the word it actually keeps. An earlier version did strip
     the kept word too, which silently ate the first letter of any company
     name that happens to start with ה/ב/ל/מ/ו/כ/ש — "מובילאיי" (Mobileye)
     became "ובילאיי". Regression-tested.
3. **Transliteration**, only for a Hebrew-only candidate. Hebrew doesn't
   mark vowels, and several letters are genuinely ambiguous in undotted
   phonetic spelling with no way to disambiguate from plain text:
   - `ו` — o, u, or (as the digraph `וו`) the consonant v/w
   - final `י` — i or y ("גאוזי" needs y for "Gauzy")
   - final `ה` — silent, or a (usually silent; "טאבולה" needs the vowel form)
   - `פ`/`ף` — p or f ("פייבר" needs f for "Fiverr")
   - `ב` — b or v
   
   `transliterateHebrewToLatin` builds the **combinatorial** set over
   whichever of these axes are actually present (capped at 8 variants) —
   not one flip at a time. "גאוזי" → Gauzy specifically needs vav=u AND
   final-yod=y *simultaneously*; a version that flipped one ambiguity per
   variant never generated that combination and this shipped as a real bug
   before the fix.
4. **Search + rank** (`searchAndRankSymbol`) — queries the active provider's
   `searchSymbol`, tries each transliteration variant in turn until one
   resolves, filters leveraged products, and prefers an exact ticker match
   (case-insensitive) when the message contains a short token that looks
   like one.

Every stage above has a regression test tied to the real case that exposed
it — see `tests/market/entity-resolution.test.js`.

### Known, accepted limitation

Transliteration is a deterministic best-effort guess, not language
understanding. An unusual or highly ambiguous phonetic spelling can still
miss (a documented example: "נובוקיור" for "NovoCure" doesn't transliterate
close enough for search to find it). The fix for a specific miss is
normally to add the company to the curated static list, not to keep
expanding the ambiguity axes — diminishing returns past the current five,
and each added axis multiplies the variant count.

## Demo Mode

`DemoProvider` needs no network and no key. Deterministic per ticker (seeded
PRNG from a hash of the ticker string) so it's stable and screenshotable
rather than jumping around on every reload. Every value carries
`isDemo: true`, which flows through to the formatted answer text itself —
tested by checking the actual answer string contains the Hebrew label
("הדגמה"), not just an internal flag a future refactor could silently drop.

Switch to it with `setActiveMarketDataProvider(DemoProvider)`; switch back
with `setActiveMarketDataProvider(TwelveDataProvider)`. Both are exported on
`window` explicitly (see `docs/CLAUDE.md` §4 for why that export exists —
it's not automatic for `const` bindings).
