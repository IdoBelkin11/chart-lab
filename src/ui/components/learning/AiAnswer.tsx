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

/**
 * The openers that mark a paragraph's kind, in both languages.
 *
 * The opener is also SPLIT OFF from the body and rendered as the block's
 * label, so a block announces what it is before it is read — "Example ·" set
 * in the full text colour, the rest of it quieter. Leaving it inline meant the
 * word "Example" was just the first word of a paragraph, which is the same
 * information doing none of the work.
 */
const OPENERS: Array<{ kind: Exclude<Kind, 'text' | 'list'>; re: RegExp }> = [
  // "Hypothetical" is matched as part of the opener, not stripped from it: the
  // worked examples in kb/examples.js all open that way, and the word is the
  // honesty marker on their numbers — these are illustrations, not quotes from
  // the market. Promoting it into the block's label makes it MORE visible than
  // it was buried in the first line, which is the right direction for it.
  { kind: 'example', re: /^(דוגמה היפותטית(?: של [^:]{1,30})?|דוגמה נוספת|דוגמה|דוגמא|Hypothetical example(?: of [^:]{1,30})?|Hypothetical calculation|Another example|Example)\s*[:·—-]?\s*/i },
  { kind: 'note', re: /^(חשוב לדעת|שים לב|שימו לב|הערה|Important|Caveat|Note)\s*[:·—-]?\s*/i },
  { kind: 'takeaway', re: /^(בשורה התחתונה|המסקנה|לסיכום|Key takeaway|Bottom line|In short)\s*[:·—-]?\s*/i }
];

function classify(p: string): { kind: Kind; lead: string; body: string } {
  const s = p.trim();
  for (const { kind, re } of OPENERS) {
    const m = re.exec(s);
    // Only when something follows it: a paragraph that IS the word "Example"
    // has no body to label.
    if (m && s.length > m[0].length) {
      return { kind, lead: m[1]!, body: s.slice(m[0].length) };
    }
  }
  if (/^[·•\-–]\s/m.test(s)) return { kind: 'list', lead: '', body: s };
  return { kind: 'text', lead: '', body: s };
}

export function AiAnswer({ text }: { text: string }) {
  const { lang } = useLang();

  // Paragraphs are split first, then every resulting block — including each
  // bullet of a list — is segmented in ONE pass, so a term is made
  // interactive once per answer rather than once per paragraph.
  const { blocks, segmentsFor } = useMemo(() => {
    const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    const parsed = paragraphs.map((p) => {
      const { kind, lead, body } = classify(p);
      const items =
        kind === 'list'
          ? body.split('\n').map((l) => l.replace(/^[·•\-–]\s*/, '').trim()).filter(Boolean)
          : [body];
      return { kind, lead, items };
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
            {block.lead && <b className={styles.lead}>{block.lead} · </b>}
            <GlossarySegments segments={segmentsFor(i, 0)} />
          </p>
        );
      })}
    </div>
  );
}
