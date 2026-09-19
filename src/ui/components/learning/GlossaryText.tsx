import { Fragment, useMemo } from 'react';
import { highlightGlossary } from '@core/glossary/highlight';
import type { GlossarySegment } from '@core/glossary/highlight';
import { useLang } from '@ui/hooks/useLang';
import { Term } from './Term';

/**
 * Renders already-segmented text with its glossary terms made interactive.
 *
 * Callers that have several related blocks (a lesson's intro and its "worth
 * knowing" text; every paragraph of one answer) segment them together with
 * `highlightGlossaryGroup` so a term is marked once across all of them, then
 * hand each block's segments here — the blocks usually live in different
 * containers, so sharing the work cannot mean sharing a wrapper element.
 */
export function GlossarySegments({ segments }: { segments: GlossarySegment[] }) {
  return (
    <>
      {segments.map((seg, i) =>
        seg.termId ? (
          <Term key={i} termId={seg.termId}>
            {seg.text}
          </Term>
        ) : (
          <Fragment key={i}>{seg.text}</Fragment>
        )
      )}
    </>
  );
}

/**
 * Renders one standalone string with its glossary terms made interactive.
 *
 * The prose itself is untouched — this only decorates it at render time, so
 * the authored wording in @core/lessons/prose.ts never changes on disk.
 */
export function GlossaryText({ text }: { text: string }) {
  const { lang } = useLang();
  const segments = useMemo(() => highlightGlossary(text, lang), [text, lang]);
  return <GlossarySegments segments={segments} />;
}
