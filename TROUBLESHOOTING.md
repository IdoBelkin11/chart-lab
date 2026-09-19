# If you get a blank page

## First: use the exact dependency versions

    rm -rf node_modules package-lock.json
    npm install

`package.json` now pins every version exactly (no `^`). A caret previously let
a fresh install pull **Vite 8** against a codebase developed and tested on
**Vite 5** — and Vite 7+ loads `vite.config.ts` as native ESM, where the
`__dirname` it used does not exist. The `@core` / `@ui` aliases then failed to
resolve, every import broke, and the app rendered nothing.

Both halves are fixed: the config uses `fileURLToPath(import.meta.url)`, which
works under every loader, and the versions are pinned.

## You should no longer see a *blank* page

An `ErrorBoundary` now catches render errors and prints the message and stack
on screen. If something breaks you will see what broke rather than white.

## Check the versions actually installed

    npx vite --version     # expect 5.4.21
    node --version         # expect 18.18 or newer

## Still stuck

Open devtools (F12) → Console and send the first red error. The first one is
the real failure; everything after it is usually fallout.
