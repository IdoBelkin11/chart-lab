import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { extractHebrewCandidate, resolveTickerDynamic, dynamicTickerCache } from '@core/ai/entity/tickers';
import { generateAiReply, createConversationContext } from '@core/ai/index';
import { setActiveMarketDataProvider, pickDefaultMarketProvider } from '@core/ai/market/index.js';

describe('Hebrew candidate extraction: comparison connectors', () => {
  it('strips a leading comparison connector, keeping just the company name', () => {
    expect(extractHebrewCandidate('מול גאוזי')).toBe('גאוזי');
    expect(extractHebrewCandidate('לעומת גאוזי')).toBe('גאוזי');
  });

  it('strips a compare instruction verb together with its connector', () => {
    expect(extractHebrewCandidate('תשווה מול גאוזי')).toBe('גאוזי');
    expect(extractHebrewCandidate('השווה לעומת גאוזי')).toBe('גאוזי');
  });
});

// ---------------------------------------------------------------------------
// Dynamic resolution is the path that answers about a company the curated
// ticker list has never heard of. It can only work against a provider that
// actually has a company database, so that is what it is tested against.
//
// It used to be tested through Demo Mode, which "worked" only because
// DemoProvider synthesized a match for any text at all — so the test passed
// for a company that does not exist, and passed just as happily for "what does
// P/E mean?". Demo Mode now answers "not found" for anything outside the
// curated list, which is what a real provider does for a name that is not a
// company, so the test needs a stub with a real (if tiny) database instead.
// That is a better test of the feature anyway: it pins the transliteration and
// ranking behaviour to a known input rather than to whatever a generator
// happened to mint.
// ---------------------------------------------------------------------------
const GAUZI = {
  symbol: 'GAUZ',
  instrument_name: 'Gauzy Ltd',
  exchange: 'NASDAQ',
  instrument_type: 'Common Stock'
};

const StubProvider = {
  id: 'stub',
  isDemo: false,
  sourceLabel: 'Test stub',
  hasApiKey: () => true,
  getQuote: async () => ({ isDemo: false, price: 100, change: 1, changePct: 1, asOf: '2026-01-01', previousClose: 99, week52: { high: 120, low: 80 } }),
  getHistory: async () => [],
  getFundamentals: async () => ({ valuations_metrics: { trailing_pe: 20 } }),
  // A database of exactly one company: anything else is honestly not found.
  searchSymbol: async (q: string) =>
    /gauz/i.test(q) ? [GAUZI] : []
};

describe('Dynamic ticker resolution for an uncurated company', () => {
  beforeEach(() => {
    setActiveMarketDataProvider(StubProvider);
    // The resolution cache is keyed by candidate text and is module-level, so
    // a verdict reached under a different provider would otherwise leak in.
    for (const k of Object.keys(dynamicTickerCache)) delete dynamicTickerCache[k];
  });
  afterEach(() => {
    setActiveMarketDataProvider(pickDefaultMarketProvider());
    for (const k of Object.keys(dynamicTickerCache)) delete dynamicTickerCache[k];
  });

  it('resolves a company mentioned only as "against X" once the connector is stripped', async () => {
    const resolved = await resolveTickerDynamic('מול גאוזי');
    expect(resolved).not.toBeNull();
    expect(resolved && 'ambiguous' in resolved).toBeFalsy();
    expect(resolved && 'ticker' in resolved && resolved.ticker).toBe('GAUZ');
  });

  it('a comparison follow-up naming a second, uncurated company resolves via the AI chat, not the off-topic fallback', async () => {
    const ctx = createConversationContext();
    await generateAiReply('what is the price of Nvidia?', 'en', null, ctx);
    const r = await generateAiReply('מול גאוזי', 'he', null, ctx);
    expect(r.topicId).toBe('stock-data');
  });

  it('a name the provider does not have is reported as not found, never invented', async () => {
    // The counterpart to the two tests above, and the reason they had to be
    // rewritten: resolution must fail for a name with no company behind it.
    expect(await resolveTickerDynamic('tell me about zorblax')).toBeNull();
  });
});
