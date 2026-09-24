import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { App } from '@ui/app/App';
import { lookupStock } from '@core/ai/market/stockLookup';
import { setActiveMarketDataProvider, pickDefaultMarketProvider } from '@core/ai/market/index.js';
import { dynamicTickerCache } from '@core/ai/entity/tickers';

/** A provider whose database is exactly one company — see its use below. */
const StubProvider = {
  id: 'stub',
  isDemo: false,
  sourceLabel: 'Test stub',
  hasApiKey: () => true,
  getQuote: async () => ({ isDemo: false, price: 100, change: 1, changePct: 1, asOf: '2026-01-01', previousClose: 99, week52: { high: 120, low: 80 } }),
  getHistory: async () => [{ date: '2026-01-01', open: 99, high: 101, low: 98, close: 100, volume: 1000 }],
  getFundamentals: async () => ({ valuations_metrics: { trailing_pe: 20 } }),
  searchSymbol: async (q: string) =>
    /gauz/i.test(q) ? [{ symbol: 'GAUZ', instrument_name: 'Gauzy Ltd', exchange: 'NASDAQ', instrument_type: 'Common Stock' }] : []
};

beforeEach(() => {
  // Explicit: without this, a previous render's DOM survives and queries
  // match elements from more than one mounted App.
  cleanup();
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
  location.hash = '#/stock';
});

/**
 * Renders the app and waits for the stock route to arrive.
 *
 * It is loaded on demand (see RouteView — it shares the market/engine/KB
 * graph that the bundle split moved off the initial download), so it is not
 * in the DOM on the first render tick. The assertions below are unchanged;
 * they just wait for the chunk first.
 */
async function renderStockRoute() {
  render(<App />);
  return screen.findByRole('textbox', {}, { timeout: 3000 });
}

describe('stock lookup service', () => {
  it('resolves a known company and returns a usable snapshot', async () => {
    const r = await lookupStock('Apple', 'en');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.snapshot.quote.price).toBeGreaterThan(0);
      expect(r.snapshot.history.length).toBeGreaterThan(0);
    }
  });

  it('reports not-found for an empty query rather than throwing', async () => {
    const r = await lookupStock('   ', 'en');
    expect(r.ok).toBe(false);
  });

  it('flags demo data so it cannot be mistaken for live prices', async () => {
    const r = await lookupStock('Apple', 'en');
    if (r.ok) expect(r.snapshot.isDemo).toBe(true);
  });

  it('resolves an uncurated company by its Hebrew name, not just its English ticker', async () => {
    // Same company searched two ways used to behave completely differently:
    // the English/ticker spelling went through dynamic resolution and
    // found something, while the Hebrew spelling was hurled at the
    // provider's search as a raw, untranslated string and always came back
    // empty — a real provider's search has no idea what to do with Hebrew text.
    //
    // The stub is the point of the test, not scaffolding around it: what is
    // being checked is that BOTH spellings reach the provider as something it
    // can match, so the provider has to be one whose database is known. This
    // used to run against Demo Mode and passed for the wrong reason — that
    // provider synthesized a match for any text at all, so both spellings
    // "resolved" even though the Hebrew one never transliterated.
    setActiveMarketDataProvider(StubProvider);
    for (const k of Object.keys(dynamicTickerCache)) delete dynamicTickerCache[k];
    try {
      const en = await lookupStock('gauzy', 'he');
      const he = await lookupStock('גאוזי', 'he');
      expect(en.ok).toBe(true);
      expect(he.ok).toBe(true);
    } finally {
      setActiveMarketDataProvider(pickDefaultMarketProvider());
      for (const k of Object.keys(dynamicTickerCache)) delete dynamicTickerCache[k];
    }
  });

  it('reports not-found for a name no provider has, rather than inventing one', async () => {
    const r = await lookupStock('zorblax', 'en');
    expect(r.ok).toBe(false);
  });

  it('tells a failed search apart from a company that does not exist', async () => {
    // The bug this pins: a provider whose search THREW was indistinguishable
    // from one that searched and found nothing, so an outage was reported to
    // the visitor as "I couldn't find a company by that name" — sending them
    // off to re-check spelling for a problem that was not theirs. Every layer
    // was collapsing the two: the backend provider caught and returned [],
    // dynamic resolution caught and cached null, and the lookup reported
    // not-found. This asserts the distinction survives end to end.
    const BrokenProvider = {
      ...StubProvider,
      searchSymbol: async () => { throw new Error('backend_not_json'); }
    };
    setActiveMarketDataProvider(BrokenProvider);
    for (const k of Object.keys(dynamicTickerCache)) delete dynamicTickerCache[k];
    try {
      const down = await lookupStock('gauzy', 'en');
      expect(down.ok).toBe(false);
      if (!down.ok) expect(down.reason).toBe('demo-limited');

      // And a curated company still works while search is down, because it
      // never needs the search at all — that asymmetry is why the bug only
      // ever showed up for some queries.
      const curated = await lookupStock('Apple', 'en');
      expect(curated.ok).toBe(true);
    } finally {
      setActiveMarketDataProvider(pickDefaultMarketProvider());
      for (const k of Object.keys(dynamicTickerCache)) delete dynamicTickerCache[k];
    }
  });

  it('does not cache a failed search as proof the company does not exist', async () => {
    // A single failed request used to teach the session that a real company
    // did not exist, and it kept saying so after the provider recovered.
    const flaky = { ...StubProvider, searchSymbol: async () => { throw new Error('down'); } };
    setActiveMarketDataProvider(flaky);
    for (const k of Object.keys(dynamicTickerCache)) delete dynamicTickerCache[k];
    try {
      expect((await lookupStock('gauzy', 'en')).ok).toBe(false);
      setActiveMarketDataProvider(StubProvider); // recovered
      expect((await lookupStock('gauzy', 'en')).ok).toBe(true);
    } finally {
      setActiveMarketDataProvider(pickDefaultMarketProvider());
      for (const k of Object.keys(dynamicTickerCache)) delete dynamicTickerCache[k];
    }
  });
});

describe('stock route', () => {
  it('renders a search form', async () => {
    expect(await renderStockRoute()).toBeTruthy();
  });

  it('shows a price, provenance and a labelled chart after searching', async () => {
    const input = await renderStockRoute();
    fireEvent.change(input, { target: { value: 'Apple' } });
    fireEvent.submit(input.closest('form')!);

    // Provenance is mandatory: demo data must be labelled as such. Matched on
    // the phrase rather than the whole sentence — the badge at the head of the
    // card is now short ("נתוני הדגמה") and the provider's full sentence lives
    // in the source metric's tooltip, so pinning the exact old string tested
    // the wording rather than the guarantee.
    await waitFor(() => expect(screen.getByText(/נתוני הדגמה/)).toBeTruthy(), { timeout: 3000 });
    const chart = screen.getByRole('img');
    expect(chart.tagName).toBe('CANVAS');
    expect(chart.getAttribute('aria-label')).toMatch(/גרף מחיר/);
  });

  it('has no nested overlay that could survive navigation', async () => {
    // The legacy build leaked a stock-detail overlay across route changes.
    // This route has a single surface, so there is nothing to leak.
    const input = await renderStockRoute();
    fireEvent.change(input, { target: { value: 'Apple' } });
    fireEvent.submit(input.closest('form')!);
    await waitFor(() => expect(screen.getByText(/נתוני הדגמה/)).toBeTruthy(), { timeout: 3000 });

    location.hash = '#/';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await waitFor(() => expect(screen.queryByText(/נתוני הדגמה/)).toBeNull());
  });

  it('keeps the global shell', async () => {
    await renderStockRoute();
    expect(screen.getAllByRole('banner').length).toBe(1);
    expect(screen.getByRole('link', { name: /Chart Lab|צ׳ארט לאב/ })).toBeTruthy();
  });
});
