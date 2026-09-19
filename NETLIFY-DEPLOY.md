# Deploying the market-data proxy on Netlify (no card required)

## Why this file exists

Firebase Cloud Functions v2 and Secret Manager require the Blaze
(pay-as-you-go) plan, which requires a billing card on file — even for usage
that never leaves the free quota. Netlify Functions plus an environment
variable give the same guarantee (the key lives server-side, never reaches
the browser) without needing one.

Firebase Hosting itself needs no card and can stay if you like it; this only
replaces the *function* — see "Keeping Firebase Hosting" below if you want
that split instead of moving everything to Netlify.

## Architecture

    Browser  ──►  Netlify Hosting (static, from `dist/`)
                       │
                       └─► /api/market/**  ──►  netlify/functions/market.js  ──►  Twelve Data
                                                 (holds the secret via env var)

`netlify/functions/market.js` imports `functions/src/normalize.js` — the
same cache/rate-limit/normalize logic the Firebase version uses, so there is
one tested copy of that logic used from either host.

## Setup

    npm i -g netlify-cli
    netlify login
    netlify init          # links this folder to a (new or existing) Netlify site

`netlify init` writes the site link itself — nothing to hand-edit, unlike
`.firebaserc`.

Store the secret (Site settings → Environment variables, or via CLI):

    netlify env:set TWELVE_DATA_API_KEY your_new_rotated_key

## Deploy

    netlify deploy --prod

`netlify.toml` already points the build at `npm run build` / `dist`, and
rewrites `/api/market/*` to the function — the frontend's contract
(`marketApiBase`) doesn't change.

## Local development

    netlify dev

This serves the Vite app and runs `market.js` locally together, reading
`TWELVE_DATA_API_KEY` from a local `.env` file (create one, gitignored —
same rule as `functions/.env`: never commit a real value) or from
`netlify env:set` if you've already linked the site.

## Keeping Firebase Hosting instead of moving everything to Netlify

Firebase Hosting alone (no Functions, no Secret Manager) stays on the free
Spark plan — no card needed. If you'd rather keep hosting there and only
move the proxy function to Netlify:

1. Deploy `netlify/functions/market.js` on Netlify as above, but skip
   `publish`-ing a site from it — you only need the function URL, e.g.
   `https://<your-site>.netlify.app/api/market`.
2. Keep `firebase deploy --only hosting` for the static site.
3. Point the frontend at the Netlify function instead of a same-origin path,
   in the host page:

       window.CHART_LAB_CONFIG = { marketApiBase: 'https://<your-site>.netlify.app/api/market' };

The tradeoff: the browser now calls a different origin for market data, so
Netlify's CORS headers (already set in `market.js`) matter — they're already
open (`Access-Control-Allow-Origin: *`), so this works without extra setup.
