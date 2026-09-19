# Deploying Chart Lab

## Before the first deploy — rotate the API key

A real Twelve Data key was previously hardcoded in the frontend and shipped
inside the public bundle, readable by any visitor via view-source. On the free
plan the quota is shared site-wide (800/day, 8/min TOTAL), so that was both a
credential leak and a trivial denial-of-service vector.

**Treat the old key as compromised. Issue a new one at the provider before
deploying.** Nothing below will help if the leaked key is reused.

## Architecture

    Browser  ──►  Firebase Hosting (static)
                       │
                       └─► /api/market/**  ──►  Cloud Function  ──►  Twelve Data
                                                 (holds the secret)

The browser never sees a provider credential. The function speaks Chart Lab's
own contract (`/quote`, `/history`, `/search`) and normalizes responses, so
swapping providers later is a change to `functions/src/normalize.js` alone,
with no frontend release.

With no runtime configuration the app runs on **DemoProvider** — the safe
default. A public deployment is credential-free by construction, not by
remembering to blank a constant.

## Setup

    npm i -g firebase-tools
    firebase login
    cp .firebaserc.example .firebaserc     # then set your project id

Store the secret server-side (never in `.env`, never in the bundle):

    firebase functions:secrets:set TWELVE_DATA_API_KEY

## Deploy

    npm run build                # tsc --noEmit && vite build → dist/
    firebase deploy

Hosting and functions together. To ship only one:

    firebase deploy --only hosting
    firebase deploy --only functions

## Local development

    npm run dev                  # Vite, Demo Mode — no credentials needed

To exercise the live path locally, put a key in `functions/.env` (gitignored)
and run the emulators:

    firebase emulators:start

Then point the frontend at the emulated API by setting, in the host page:

    window.CHART_LAB_CONFIG = { marketApiBase: 'http://localhost:5001/<project>/us-central1/market' };

## Guard rails already in place

- `functions/test/normalize.test.js` — 13 tests over the caching, rate
  limiting and response normalization, runnable with plain Node.
- Per-endpoint cache TTLs: quotes 60s, history 1h, search 24h. Different
  because they go stale at very different rates.
- Rate limiting: 30 requests per minute per caller, protecting the shared
  upstream quota from one noisy client.
- Upstream errors are never forwarded verbatim — some provider error shapes
  echo the key back.
