// ---------------------------------------------------------------------------
// Stock analysis: fetches a quote + history + fundamentals for a ticker and
// derives the technical indicators the AI's facet formatters need (RSI,
// SMA50/200, MACD, 20-day volatility, one-month change).
//
// This is the function stockIntent.js's answerForCompany/answerEntityComparison
// actually need — they were calling market/index.js's getMarketData(), which
// is a different, zero-argument function that just returns the active
// PROVIDER object (see setActiveMarketDataProvider there). That mismatch
// meant `result.ok` was always undefined for every real-stock question,
// including recognized companies like Nvidia, and every answer silently fell
// through to the generic "couldn't fetch, try again" message. This file is
// the missing piece: it takes a ticker, does the fetching itself against
// the active provider, and returns the {ok, data} / {ok:false, reason} shape
// the formatters were already written against.
//
// getQuote/getHistory throw on failure per the MarketDataProvider contract
// (see providerInterface.js) — only this orchestration layer turns that into
// an honest answer. getHistory and getFundamentals are best-effort: a failure
// there degrades the answer (no technicals, no fundamentals) rather than
// losing the whole thing, same principle as stockLookup.ts.
// ---------------------------------------------------------------------------
import { getMarketData as getActiveProvider } from './index.js';
import { rsi, macd, mdSma, volatilityPct, pctChange } from './indicators.js';

const HISTORY_DAYS = 260; // enough for a 200-day SMA plus headroom

export async function getStockAnalysis(ticker) {
  const provider = getActiveProvider();
  if (!provider) return { ok: false, reason: 'no_api_key' };

  let quote;
  try {
    quote = await provider.getQuote(ticker);
  } catch (e) {
    return { ok: false, reason: 'exception' };
  }
  if (!quote) return { ok: false, reason: 'exception' };

  let history = [];
  try {
    history = await provider.getHistory(ticker, HISTORY_DAYS);
  } catch (e) {
    history = [];
  }

  let fundamentals = null;
  try {
    fundamentals = await provider.getFundamentals(ticker);
  } catch (e) {
    fundamentals = null;
  }

  const closes = (history || []).map((bar) => bar.close);
  const monthChangePct = closes.length >= 22
    ? pctChange(closes[closes.length - 22], closes[closes.length - 1])
    : null;

  return {
    ok: true,
    data: {
      price: quote.price,
      change: quote.change,
      changePct: quote.changePct,
      asOf: quote.asOf,
      source: provider.sourceLabel,
      isDemo: provider.isDemo === true || quote.isDemo === true,
      history,
      sma50: mdSma(closes, 50),
      sma200: mdSma(closes, 200),
      rsi14: rsi(closes, 14),
      macd: macd(closes),
      volatility20: volatilityPct(closes, 20),
      monthChangePct,
      fundamentals
    }
  };
}
