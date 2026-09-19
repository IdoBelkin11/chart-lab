import { useMemo } from 'react';
import { highlightGlossaryGroup } from '@core/glossary/highlight';
import { useLang } from '@ui/hooks/useLang';
import { GlossarySegments } from './GlossaryText';
import styles from './AiAnswer.module.css';

/**
 * Renders an assistant answer with structure.
 *
 * Answers arrive as paragraphs separated by blank lines, and the engine marks
 * certain kinds with recognisable openers ("Example:", "דוגמה:", bullet runs).
 * The UI reads those cues and gives each kind its own treatment, so a long
 * answer reads as teaching rather than a wall of text.
 *
 * Purely presentational — the engine is not asked to emit markup, and text is
 * rendered as text, so there is no injection path.
 */
type Kind = 'text' | 'example' | 'note' | 'takeaway' | 'list';

function classify(p: string): Kind {
  const s = p.trim();
  if (/^(דוגמה|דוגמא|Example|Another example|דוגמה נוספת)\s*:?/i.test(s)) return 'example';
  if (/^(שים לב|חשוב לדעת|הערה|Note|Important|Caveat)\s*:?/i.test(s)) return 'note';
  if (/^(המסקנה|בשורה התחתונה|לסיכום|Key takeaway|Bottom line|In short)\s*:?/i.test(s)) return 'takeaway';
  if (/^[·•\-–]\s/m.test(s)) return 'list';
  return 'text';
}

export function AiAnswer({ text }: { text: string }) {
  const { lang } = useLang();

  // Paragraphs are split first, then every resulting block — including each
  // bullet of a list — is segmented in ONE pass, so a term is made
  // interactive once per answer rather than once per paragraph.
  const { blocks, segmentsFor } = useMemo(() => {
    const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    const parsed = paragraphs.map((p) => {
      const kind = classify(p);
      const items =
        kind === 'list'
          ? p.split('\n').map((l) => l.replace(/^[·•\-–]\s*/, '').trim()).filter(Boolean)
          : [p];
      return { kind, items };
    });
    // Flatten to a single ordered list of strings, segment together, then
    // hand each block back its own slice by running index.
    const flat = parsed.flatMap((b) => b.items);
    const groups = highlightGlossaryGroup(flat, lang);
    let cursor = 0;
    const offsets = parsed.map((b) => {
      const start = cursor;
      cursor += b.items.length;
      return start;
    });
    return {
      blocks: parsed,
      segmentsFor: (blockIndex: number, itemIndex: number) =>
        groups[offsets[blockIndex]! + itemIndex] ?? []
    };
  }, [text, lang]);

  return (
    <div className={styles.answer}>
      {blocks.map((block, i) => {
        if (block.kind === 'list') {
          return (
            <ul key={i} className={styles.list}>
              {block.items.map((_, j) => (
                <li key={j}>
                  <GlossarySegments segments={segmentsFor(i, j)} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className={`${styles.p} ${styles[block.kind]}`}>
            <GlossarySegments segments={segmentsFor(i, 0)} />
          </p>
        );
      })}
    </div>
  );
}
