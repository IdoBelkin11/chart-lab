import { useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import styles from './SlidingPill.module.css';

/**
 * One glass capsule that travels to whichever item is active, instead of each
 * item painting and un-painting its own background.
 *
 * This started life inside the header and is now shared, because the header
 * was the only control in the product that moved this way — every other
 * selection (the calculator tabs, the lesson rail, the language switch) blinked
 * from one filled box to another. A single moving object reads as liquid; a set
 * of toggling ones reads as a flicker, and the difference is the whole
 * impression the material is supposed to make.
 *
 * Two things this must not do, both learned from the header:
 *
 *   1. It never hard-codes geometry. Item widths come from their labels, which
 *      change with language and change AGAIN when the webfont swaps in for the
 *      fallback face — so the rect is measured, and re-measured by a
 *      ResizeObserver on the container.
 *
 *   2. It positions with physical `left`/`top` rather than logical properties.
 *      `offsetLeft` is measured from the container's left edge in both writing
 *      directions, so this stays correct in RTL, and physical axes are what the
 *      compositor can actually animate.
 *
 * The active item is marked with `data-active="true"`; the pill itself is a
 * sibling painted behind the row, so items need `position: relative` and a
 * z-index to keep their labels on top.
 */
export interface PillRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function useSlidingPill<T extends HTMLElement>(
  deps: ReadonlyArray<unknown>
): { ref: RefObject<T>; rect: PillRect | null; placed: boolean } {
  // useRef<T>(null), not useRef<T | null>(null): under React 18's types only
  // the former yields a RefObject the `ref` prop accepts. `.current` is still
  // `T | null` either way, which is what the measurement below reads.
  const ref = useRef<T>(null);
  const [rect, setRect] = useState<PillRect | null>(null);
  // The first placement must not animate, or the capsule flies in from the
  // container's start edge every time the page loads.
  const placed = useRef(false);

  useLayoutEffect(() => {
    const host = ref.current;
    if (!host) return;

    const measure = () => {
      const active = host.querySelector<HTMLElement>('[data-active="true"]');
      setRect(
        active
          ? {
              left: active.offsetLeft,
              top: active.offsetTop,
              width: active.offsetWidth,
              height: active.offsetHeight
            }
          : null
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    // A vertical list reflows when a SIBLING's height changes (a wrapped
    // label, a lesson title going to two lines), which resizes nothing the
    // container itself reports. Observing the children covers that.
    for (const child of Array.from(host.children)) ro.observe(child);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const wasPlaced = placed.current;
  if (rect) placed.current = true;

  return { ref, rect, placed: wasPlaced };
}

/**
 * `tone` picks how the capsule is lit:
 *   · 'glass'  — on a glass surface (header, rail): a white-alpha pane with a
 *                specular top edge, the material catching light.
 *   · 'inset'  — inside a recessed track (the calculator segments): the same
 *                pane, but with the drop shadow a sunken track would cast.
 *   · 'accent' — filled with the accent ramp (the language switch), which marks
 *                a setting rather than a place you are.
 */
export function SlidingPill({
  rect,
  instant,
  tone = 'glass',
  radius
}: {
  rect: PillRect | null;
  instant: boolean;
  tone?: 'glass' | 'inset' | 'accent';
  radius?: string;
}) {
  if (!rect) return null;
  return (
    <span
      aria-hidden="true"
      className={tone === 'glass' ? styles.pill : `${styles.pill} ${styles[tone]}`}
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        ...(radius ? { borderRadius: radius } : null),
        // No transition until the capsule has been placed once.
        ...(instant ? null : { transition: 'none' })
      }}
    />
  );
}
