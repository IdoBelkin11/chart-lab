// ---------------------------------------------------------------------------
// MarketDataProvider — the contract every data source implements.
//
// This file has no runtime logic; it exists so the shape below is written
// down ONCE instead of re-derived by reading twelvedata-provider.js. Every
// provider object must expose exactly this shape:
//
//   {
//     id: string,                 // 'twelvedata' | 'demo' | ...
//     isDemo: boolean,            // UI/AI must surface this — never hide it
//     sourceLabel: string,        // shown to the user for provenance
//     async getQuote(ticker)      -> { price, change, changePct, asOf,
//                                      previousClose, week52 } | throws
//     async getHistory(ticker, days) -> [{date,open,high,low,close,volume}]
//                                       oldest -> newest | throws
//     async getFundamentals(ticker)  -> object | null (best-effort, never
//                                       required for a price/technical answer)
//     async searchSymbol(query)      -> [{symbol,name,exchange,
//                                          instrument_type}] | []
//   }
//
// Why this exists (from the audit): before this refactor, the AI called
// Twelve Data's fetch functions directly by name throughout the codebase.
// Swapping providers, or adding Demo Mode, meant touching every call site.
// Now `getMarketData()` in index.js depends only on this shape — adding a
// new provider means writing one file that satisfies it, nothing else
// changes.
//
// `getQuote`/`getHistory` are expected to THROW on failure (network error,
// bad symbol, quota exceeded) rather than return a sentinel — the
// orchestration layer in index.js is the single place that turns a thrown
// error into the honest "couldn't fetch" answer. Never swallow an error
// into a fabricated zero/null value inside a provider.
// ---------------------------------------------------------------------------
