// ---------------------------------------------------------------------------
// Minimal hash-based router.
//
// Scope for this phase, deliberately: real infrastructure that other views
// can register against, wired up for ONE real route (the AI assistant) as
// proof it works — not a full migration of the existing 8 lessons into
// separate routed pages. That's a larger, separate, higher-risk change
// (touches working content) and belongs to its own phase; see CLAUDE.md
// "recommended implementation order". Building the router now, and proving
// it with a low-risk route, is what makes that later migration cheap when
// it happens instead of starting from nothing.
//
// Hash-based (not History API) on purpose: this is a static site with no
// server-side rewrite rules, deployed via drag-and-drop or a static
// Netlify publish directory. A path-based router would 404 on refresh for
// any route but "/" without a `_redirects`/rewrite rule; hash routes never
// hit the server at all, so they need none.
// ---------------------------------------------------------------------------
const routerRegistry = {}; // path -> { onEnter, onLeave }
let routerCurrentPath = null;

function registerRoute(path, handlers){
  routerRegistry[path] = handlers || {};
}

function navigateTo(path){
  // Dispatch immediately — callers (a click handler, this file's own
  // tests, any future code) need the route change to take effect
  // synchronously, not whenever a hashchange event happens to fire. The
  // hash is still updated for shareable/deep-linkable URLs and so the
  // browser's own back/forward buttons work; the hashchange listener
  // below is what handles THOSE (browser-initiated) navigations, and
  // checks routerCurrentPath so it never double-dispatches for a
  // navigation that came from this function.
  if(location.hash.slice(1) !== path) location.hash = path;
  routerDispatch(path);
}

function routerDispatch(path){
  // A no-op if we're already on this exact path — this is what actually
  // prevents double-dispatch, not just the comment in navigateTo() that
  // used to claim it. Setting location.hash schedules an async native
  // 'hashchange' event IN ADDITION TO navigateTo()'s own synchronous
  // dispatch; without this guard, that delayed event calls onEnter a
  // second time for the same route once it fires. For a route like the AI
  // assistant, which just re-shows an already-open overlay, that's
  // harmless — but for a route that rebuilds its content each time it's
  // entered (Stock View, Compare, Quiz), the second onEnter call replaces
  // the DOM mid-flight, silently discarding whatever the user had just
  // done (a search result lands in a now-detached element). Confirmed as
  // a real bug this way, not a hypothetical: typing a search and clicking
  // "Compare" produced a correct answer that was rendered into a node no
  // longer attached to the page a moment later.
  if(routerCurrentPath === path) return;
  if(routerCurrentPath){
    const leaving = routerRegistry[routerCurrentPath];
    if(leaving && typeof leaving.onLeave === 'function') leaving.onLeave();
  }
  routerCurrentPath = path;
  const entering = routerRegistry[path];
  if(entering && typeof entering.onEnter === 'function') entering.onEnter();
}

function routerInit(){
  const handleChange = () => {
    const path = location.hash.slice(1) || '';
    routerDispatch(path);
  };
  window.addEventListener('hashchange', handleChange);
  handleChange(); // handle a route present in the URL on first load (deep link)
}
