import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { App } from '@ui/app/App';
import { lookupStock } from '@core/ai/market/stockLookup';

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
    // empty — Twelve Data's search has no idea what to do with Hebrew text.
    const en = await lookupStock('gauzy', 'he');
    const he = await lookupStock('גאוזי', 'he');
    expect(en.ok).toBe(true);
    expect(he.ok).toBe(true);
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

    // Provenance is mandatory: demo data must be labelled as such.
    await waitFor(() => expect(screen.getByText('נתוני הדגמה — לא מחירי שוק אמיתיים')).toBeTruthy(), { timeout: 3000 });
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
    await waitFor(() => expect(screen.getByText('נתוני הדגמה — לא מחירי שוק אמיתיים')).toBeTruthy(), { timeout: 3000 });

    location.hash = '#/';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await waitFor(() => expect(screen.queryByText('נתוני הדגמה — לא מחירי שוק אמיתיים')).toBeNull());
  });

  it('keeps the global shell', async () => {
    await renderStockRoute();
    expect(screen.getAllByRole('banner').length).toBe(1);
    expect(screen.getByRole('link', { name: /Chart Lab|צ׳ארט לאב/ })).toBeTruthy();
  });
});
