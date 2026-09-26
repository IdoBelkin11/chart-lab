import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { LESSONS, TRACKS } from '@core/curriculum/curriculum';
import { lessonContent } from '@core/lessons/content';
import { LESSON_META, isWritten } from '@core/lessons/content/meta';
import { practiceItems } from '@core/practice/trackPractice';
import { practiceSize, practicePassFor } from '@core/practice/practiceSize';
import { passFor } from '@core/curriculum/curriculum';

// ---------------------------------------------------------------------------
// The lesson content (~450 kB of source) is its own chunk, loaded with the
// lesson, quiz and practice routes. The shell works from a small metadata
// file instead. These tests keep that split honest: the metadata matches the
// content, and nothing reachable from main.tsx without crossing a dynamic
// import() pulls the content back in (the way the track page once did,
// through the practice builder, just to count questions).
// ---------------------------------------------------------------------------

const ROOT = resolve(__dirname, '../..');
const ALIAS: Record<string, string> = { '@core': resolve(ROOT, 'src/core'), '@ui': resolve(ROOT, 'src/ui') };
const EXTS = ['', '.ts', '.tsx', '.js', '/index.ts', '/index.tsx'];
function resolveImport(from: string, spec: string): string | null {
  let base = spec.startsWith('.') ? resolve(dirname(from), spec) : null;
  for (const [a, p] of Object.entries(ALIAS)) if (spec === a || spec.startsWith(`${a}/`)) base = p + spec.slice(a.length);
  if (!base) return null;
  for (const e of EXTS) if (existsSync(base + e) && /\.(ts|tsx|js)$/.test(base + e)) return base + e;
  return null;
}

describe('lesson content loads on demand', () => {
  it('nothing loaded with the shell imports the lessons themselves', () => {
    const start = resolve(ROOT, 'src/main.tsx'), seen = new Set([start]), queue = [start];
    while (queue.length) {
      const file = queue.shift()!;
      for (const m of readFileSync(file, 'utf-8').matchAll(/^\s*(?:import|export)\s+(?!type\b)[^;]*?from\s+['"]([^'"]+)['"]/gm)) {
        const t = resolveImport(file, m[1]!);
        if (t && !seen.has(t)) { seen.add(t); queue.push(t); }
      }
    }
    const eager = [...seen].map((f) => f.replace(/\\/g, '/'));
    expect(eager.some((f) => f.endsWith('src/ui/app/RouteView.tsx'))).toBe(true); // the walk really ran
    for (const heavy of ['core/lessons/content/index.ts', 'core/charts/series.js', 'core/quiz/questions.js', 'core/practice/trackPractice.ts']) {
      expect(eager.filter((f) => f.endsWith(heavy)), heavy).toEqual([]);
    }
  });

  it('the metadata matches the content, lesson by lesson', () => {
    for (const l of LESSONS) {
      const c = lessonContent(l.id);
      expect(isWritten(l.id), l.id).toBe(!!c);
      if (!c) continue;
      expect(LESSON_META[l.id], l.id).toEqual({ ...(c.legacyId ? { legacyId: c.legacyId } : {}), topic: c.tutor.topic });
    }
  });

  it('the size the track page shows is the size practice asks', () => {
    for (const t of TRACKS) {
      const items = practiceItems(t.id, 1);
      expect(practiceSize(t.id), t.id).toBe(items.length);
      expect(practicePassFor(t.id), t.id).toBe(passFor(items.length));
    }
  });
});

