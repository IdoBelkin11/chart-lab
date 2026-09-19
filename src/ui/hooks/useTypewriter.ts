import { useEffect, useRef, useState } from 'react';

/**
 * Reveals text progressively, the way a live tutor's answer appears rather
 * than arriving as a finished block.
 *
 * Why this exists at all: the engine answers in about a millisecond, because
 * it is a local matcher and not a network call. An answer that materialises
 * instantly and fully gives the reader no cue about WHERE it started, so on
 * a long reply the eye has to hunt for the top. Revealing it anchors the
 * start and sets a reading pace.
 *
 * Reveals by CHARACTER COUNT on a timer, not by appending on every frame:
 * the elapsed-time calculation means a slow device drops smoothness, never
 * words, and the text is always a prefix of the real answer — so a reader
 * who stops mid-reveal is never shown something the engine did not say.
 *
 * Honours `prefers-reduced-motion` by showing the whole answer at once, and
 * `skip` does the same on demand — nobody should have to wait for a UI
 * flourish to read something they asked for.
 */
const CHARS_PER_SECOND = 420;

export function useTypewriter(text: string, enabled: boolean) {
  const [shown, setShown] = useState(enabled ? '' : text);
  const frame = useRef<number | null>(null);
  const skipped = useRef(false);

  useEffect(() => {
    skipped.current = false;
    const reduced =
      typeof matchMedia !== 'undefined' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!enabled || reduced || !text) {
      setShown(text);
      return;
    }

    setShown('');
    const started = performance.now();

    const tick = () => {
      if (skipped.current) return;
      const elapsed = (performance.now() - started) / 1000;
      const count = Math.floor(elapsed * CHARS_PER_SECOND);
      if (count >= text.length) {
        setShown(text);
        return;
      }
      setShown(text.slice(0, count));
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);

    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [text, enabled]);

  const skip = () => {
    skipped.current = true;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    setShown(text);
  };

  return { shown, done: shown === text, skip };
}
