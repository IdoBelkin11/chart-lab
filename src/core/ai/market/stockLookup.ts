// ---------------------------------------------------------------------------
// Stock lookup: one call that assembles everything a stock view needs.
//
// The UI should not orchestrate three provider calls and reconcile their
// failure modes — that is domain logic, and putting it here keeps the route
// component to presentation. It also means the rule "a fundamentals failure
// must never break a price answer" is enforced in one place rather than
// remembered at each call site.
// ---------------------------------------------------------------------------
import { getMarketData, DemoProvider } from './index.js';
import { resolveTicker, resolveTickerDynamic } from '../entity/tickers.js';
import { normalizeText } from '../engine/text.js';
import type { Candle, Quote } from '@core/types/kb';

export interface StockSnapshot {
  symbol: string;
  displayName: string;
  quote: Quote;
  history: Candle[];
  isDemo: boolean;
  sourceLabel: string;
}

/**
 * `demo-limited` is its own reason on purpose. Demo Mode has no company
 * database — it can generate an illustrative series for a ticker it is handed,
 * but it cannot answer "is there a company called this?", and inventing one is
 * what it must never do. So a name outside the curated list is not missing and
 * the service is not down: the visitor has simply reached the edge of what
 * offline demo data can do, and the honest reply names companies that work
 * instead of sending them off to re-check their spelling.
 */
export type LookupResult =
  | { ok: true; snapshot: StockSnapshot }
  | { ok: false; reason: 'not-found' | 'unavailable' | 'demo-limited' };

/**
 * Looks up a company by name or ticker.
 *
 * Resolution is tried against the curated company list first (which carries
 * Hebrew aliases), then the provider's own search. A quote is required; a
 * history failure degrades to an empty series rather than failing the whole
 * lookup, because a price with no chart is still useful.
 */
export async function lookupStock(query: string, lang: 'he' | 'en'): Promise<LookupResult> {
  const trimmed = query.trim();
  if (!trimmed) return { ok: false, reason: 'not-found' };

  const provider = getMarketData();
  const known = resolveTicker(normalizeText(trimmed)) as
    | { ticker: string; name?: { he: string; en: string } }
    | null
    | undefined;

  let symbol = known?.ticker ?? null;
  let displayName = known?.name?.[lang] ?? trimmed;

  if (!symbol) {
    // Resolution and data-fetch are two steps against the SAME provider, and
    // only the second one had a demo fallback. So a curated name worked
    // offline (it skips this step) while any other name reported "I couldn't
    // find a company by that name" — a message about the visitor's spelling
    // for a problem that was actually the provider's.
    if (provider === DemoProvider) return { ok: false, reason: 'demo-limited' };
    try {
      const dynamic = await resolveTickerDynamic(trimmed) as
        | { ticker: string; name?: { he: string; en: string } }
        | { ambiguous: true; candidates: unknown[] }
        | null;
      // An ambiguous match (several plausible companies, no single best
      // one) has no disambiguation UI on this page to hand it to — the
      // safest thing is "not found" rather than silently guessing one.
      if (!dynamic || 'ambiguous' in dynamic) return { ok: false, reason: 'not-found' };
      symbol = dynamic.ticker;
      displayName = dynamic.name?.[lang] ?? trimmed;
    } catch {
      // The provider could not be reached (ProviderUnavailableError), so it
      // never told us this company doesn't exist. Demo data can't stand in
      // here the way it can for a quote: there is no database to search.
      return { ok: false, reason: 'demo-limited' };
    }
  }

  const snapshotFrom = async (p: typeof provider): Promise<StockSnapshot | null> => {
    const quote = (await p.getQuote(symbol)) as Quote | null;
    if (!quote) return null;

    // History is best-effort on purpose: a price answer should not be lost
    // because the chart series failed to load.
    let history: Candle[] = [];
    try {
      history = (await p.getHistory(symbol!, 120)) as Candle[];
    } catch {
      history = [];
    }

    return {
      symbol: symbol!,
      displayName,
      quote,
      history,
      isDemo: p.isDemo === true || quote.isDemo === true,
      sourceLabel: p.sourceLabel
    };
  };

  try {
    const snapshot = await snapshotFrom(provider);
    if (!snapshot) return { ok: false, reason: 'not-found' };
    return { ok: true, snapshot };
  } catch {
    // The configured provider is unreachable — a backend base URL can be set
    // and still have nothing serving it (local dev, a broken deploy, a proxy
    // returning its own error page). Teaching material is more useful than an
    // error screen, so fall back to demo data.
    //
    // The fallback deliberately carries DemoProvider's own isDemo/sourceLabel
    // rather than the failed provider's, so the provenance badge says "Demo"
    // in the UI. Showing demo numbers that look live would be worse than
    // showing nothing at all, which is the rule this whole path exists for.
    if (provider !== DemoProvider) {
      try {
        const fallback = await snapshotFrom(DemoProvider);
        if (fallback) return { ok: true, snapshot: fallback };
      } catch {
        /* fall through to the unavailable result below */
      }
    }
    return { ok: false, reason: 'unavailable' };
  }
}
