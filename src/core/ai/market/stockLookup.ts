// ---------------------------------------------------------------------------
// Stock lookup: one call that assembles everything a stock view needs.
//
// The UI should not orchestrate three provider calls and reconcile their
// failure modes — that is domain logic, and putting it here keeps the route
// component to presentation. It also means the rule "a fundamentals failure
// must never break a price answer" is enforced in one place rather than
// remembered at each call site.
// ---------------------------------------------------------------------------
import { getMarketData } from './index.js';
import { resolveTicker } from '../entity/tickers.js';
import type { Candle, Quote } from '@core/types/kb';

export interface StockSnapshot {
  symbol: string;
  displayName: string;
  quote: Quote;
  history: Candle[];
  isDemo: boolean;
  sourceLabel: string;
}

export type LookupResult =
  | { ok: true; snapshot: StockSnapshot }
  | { ok: false; reason: 'not-found' | 'unavailable' };

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
  const known = resolveTicker(trimmed) as
    | { ticker: string; name?: { he: string; en: string } }
    | null
    | undefined;

  let symbol = known?.ticker ?? null;
  let displayName = known?.name?.[lang] ?? trimmed;

  if (!symbol) {
    try {
      const matches = await provider.searchSymbol(trimmed);
      const first = matches?.[0] as { symbol?: string; instrument_name?: string } | undefined;
      if (!first?.symbol) return { ok: false, reason: 'not-found' };
      symbol = first.symbol;
      displayName = first.instrument_name ?? first.symbol;
    } catch {
      return { ok: false, reason: 'unavailable' };
    }
  }

  try {
    const quote = (await provider.getQuote(symbol)) as Quote | null;
    if (!quote) return { ok: false, reason: 'not-found' };

    // History is best-effort on purpose: a price answer should not be lost
    // because the chart series failed to load.
    let history: Candle[] = [];
    try {
      history = (await provider.getHistory(symbol, 120)) as Candle[];
    } catch {
      history = [];
    }

    return {
      ok: true,
      snapshot: {
        symbol,
        displayName,
        quote,
        history,
        isDemo: provider.isDemo === true || quote.isDemo === true,
        sourceLabel: provider.sourceLabel
      }
    };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}
