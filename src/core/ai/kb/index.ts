// ---------------------------------------------------------------------------
// Knowledge base composition.
//
// Previously every topic file appended to a shared global `KB` array, which
// meant correctness depended on script concatenation order — a facet had to
// load after its parent, the example bank after everything. That coupling is
// gone: each module exports its own entries and this file composes them, so
// order is explicit and a mistake is a type error rather than a silent
// mis-resolution at runtime.
//
// The example bank is applied last on purpose: it attaches `examples` to
// entries authored elsewhere, and must not overwrite examples an entry
// already declares inline.
// ---------------------------------------------------------------------------
import type { KbEntry } from '@core/types/kb';

import { entries as basics } from './basics.js';
import { entries as comparisons } from './comparisons.js';
import { entries as fundamentals } from './fundamentals.js';
import { entries as technical } from './technical.js';
import { entries as risk } from './risk.js';
import { entries as macro } from './macro.js';
import { entries as bonds } from './bonds.js';
import { entries as advanced } from './advanced.js';
import { entries as scenarios } from './scenarios.js';
import { entries as meta } from './meta.js';
import { entries as israel } from './israel.js';
import { entries as behavioral } from './behavioral.js';
import { entries as qaGaps } from './qa-gaps.js';
import { entries as focused } from './focused.js';
import { entries as maPeriods } from './ma-periods.js';
import { entries as facets } from './facets.js';
import { KB_EXAMPLES } from './examples.js';
import { KB_TEACHING } from './teaching.js';

/** Every knowledge entry, in a stable, explicit order. */
export const KB: KbEntry[] = [
  ...basics,
  ...comparisons,
  ...fundamentals,
  ...technical,
  ...risk,
  ...macro,
  ...bonds,
  ...advanced,
  ...scenarios,
  ...meta,
  ...israel,
  ...behavioral,
  ...qaGaps,
  ...focused,
  ...maPeriods,
  // Facets last among entry sources: they are sub-concepts that must be able
  // to reference a parent that already exists.
  ...facets
] as KbEntry[];

// Attach the shared example bank. An entry that declares its own `examples`
// keeps them — a topic file stays the more specific source of truth.
for (const [id, examples] of Object.entries(KB_EXAMPLES)) {
  const entry = KB.find((e) => e.id === id);
  if (entry && !entry.examples) entry.examples = examples as KbEntry['examples'];
}

// Same rule for the teaching blocks — the caveat and the bottom line.
for (const [id, blocks] of Object.entries(KB_TEACHING)) {
  const entry = KB.find((e) => e.id === id);
  if (!entry) continue;
  if (blocks.caveat && !entry.caveat) entry.caveat = blocks.caveat;
  if (blocks.bottomLine && !entry.bottomLine) entry.bottomLine = blocks.bottomLine;
}

const byId = new Map<string, KbEntry>(KB.map((e) => [e.id, e]));

/** O(1) lookup. The old implementation scanned the array on every call. */
export function kbById(id: string): KbEntry | undefined {
  return byId.get(id);
}

/** Entries belonging to a parent topic (the facet layer). */
export function kbFacetsOf(parentId: string): KbEntry[] {
  return KB.filter((e) => e.parent === parentId);
}
