// ---------------------------------------------------------------------------
// Market-data provider selection.
//
// Preference order, and the reason for it:
//   1. Our own backend proxy — the credential stays server-side.
//   2. The direct vendor provider — LOCAL DEVELOPMENT ONLY, with a key the
//      host page injects. Never present in a public build.
//   3. Demo data — the safe default. A public deployment with no runtime
//      configuration lands here by construction, which is the whole point:
//      a key can no longer be leaked by forgetting to blank a constant.
// ---------------------------------------------------------------------------
import { DemoProvider } from './demoProvider.js';
import { TwelveDataProvider } from './twelveDataProvider.js';
import { BackendProvider } from './backendProvider.js';

export function configured(p) {
  return p && typeof p.hasApiKey === 'function' && p.hasApiKey();
}

export function pickDefaultMarketProvider() {
  if (configured(BackendProvider)) return BackendProvider;
  if (configured(TwelveDataProvider)) return TwelveDataProvider;
  return DemoProvider;
}

let active = pickDefaultMarketProvider();

export function getMarketData() { return active; }
export function setActiveMarketDataProvider(provider) { active = provider; }
export { DemoProvider, TwelveDataProvider, BackendProvider };
