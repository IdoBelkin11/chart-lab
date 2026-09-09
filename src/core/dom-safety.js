// ---------------------------------------------------------------------------
// escapeHtml — the one place dynamic strings get made safe for innerHTML.
//
// Several feature views (Stock View, Compare, Quiz, Calculators) build
// their markup with innerHTML template literals for simplicity and
// readability, then interpolate values that are NOT always static: a
// user's search text, an API-supplied company name (Twelve Data's
// `instrument_name`), or an assembled list of user-typed queries. None of
// that is trusted input — a search box is exactly where an attacker (or a
// prefilled/shared link) would put markup, and it was confirmed to become
// live DOM with intact event-handler attributes before this fix existed.
//
// This does NOT replace innerHTML with textContent/DOM-building everywhere
// — the brief is explicit about preserving the existing UI and behavior,
// and a full rewrite of five view files' rendering approach is a much
// larger, riskier change than the actual problem calls for. Escaping every
// dynamic value at the point it's interpolated closes the hole with the
// UI, structure, and behavior completely unchanged.
//
// Static, hand-written template text (labels, CSS classes, the literal
// HTML structure itself) is never passed through this — only values that
// originate from the user or an external API.
// ---------------------------------------------------------------------------
function escapeHtml(value){
  if(value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
