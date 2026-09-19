import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

// ---------------------------------------------------------------------------
// Guards the AI/stock/compare bundle split (see RouteView.tsx) from being
// silently undone by an unrelated change.
//
// This happened TWICE in one engagement. First: RouteView itself imported
// StockRoute/CompareRoute eagerly, so lazy-loading only AiRoute did nothing
// measurable — both routes shared a path into the KB through the market
// layer. Second, after that was fixed: AiLauncher (floating on every route,
// never lazy) needed one small function, `setAmbientLessonTopic`, and
// imported it from `@core/ai/index` — a barrel whose own top-level import is
// the entire engine. One `import` line, and the ~300 kB knowledge base was
// back in the main chunk. Main chunk size went 335 kB -> 692 kB; nothing in
// the type checker or the test suite noticed, because nothing was WRONG in
// the sense either of those tools check for — the code was correct, just
// unintentionally eager.
//
// A bundle-size assertion would catch it too, but drifts for reasons that
// have nothing to do with this (a dependency bump, a new feature) and would
// need constant re-baselining. This instead asserts the STRUCTURAL rule
// that actually matters: no file reachable without crossing a lazy()
// boundary may import the heavy engine or its barrel. Static and cheap —
// no build step required to run it.
// ---------------------------------------------------------------------------

const ROOT = resolve(__dirname, '../../src/ui');

// Forbidden import targets, and where crossing into them is fine because
// it only happens inside a dynamic import() (RouteView's lazy() calls).
// Anchored to an actual `import ... from '...'` statement — a comment
// merely NAMING the forbidden path (as this file's own explanation above,
// or AiLauncher's, does) must not trip it.
const HEAVY_IMPORT_PATTERN = /^\s*import\b[^;]*\bfrom\s+['"]@core\/ai\/(index|engine\/matchingEngine\.js|kb\/)/m;

/** Every .ts/.tsx file under src/ui, except the lazy route components
 *  themselves — they are ALLOWED to import the engine, since crossing into
 *  them only happens through RouteView's lazy() boundary. */
function eagerUiFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      eagerUiFiles(full, out);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(name)) continue;
    if (/[/\\]routes[/\\](ai|stock|compare)[/\\]/.test(full)) continue; // the lazy routes themselves
    out.push(full);
  }
  return out;
}

describe('the AI/stock/compare bundle split cannot be silently undone', () => {
  it('no eager UI file imports the heavy engine, the KB, or the @core/ai barrel', () => {
    const offenders: string[] = [];
    for (const file of eagerUiFiles(ROOT)) {
      const content = readFileSync(file, 'utf-8');
      if (HEAVY_IMPORT_PATTERN.test(content)) offenders.push(file.replace(ROOT, 'src/ui'));
    }
    expect(offenders, offenders.join('\n')).toEqual([]);
  });

  it('RouteView only reaches the heavy routes through lazy()', () => {
    const content = readFileSync(join(ROOT, 'app', 'RouteView.tsx'), 'utf-8');
    for (const name of ['AiRoute', 'StockRoute', 'CompareRoute']) {
      const eagerImport = new RegExp(`^import\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from\\s*['"]@ui/routes`, 'm');
      expect(eagerImport.test(content), `${name} imported eagerly`).toBe(false);
      expect(content.includes(`lazy(`), `${name}: no lazy() call found at all`).toBe(true);
    }
  });
});
