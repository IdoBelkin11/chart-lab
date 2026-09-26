import { useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode, RefObject } from 'react';
import styles from './Glide.module.css';

/**
 * One glass capsule that travels to whichever item is active — the header's
 * sections, its language and theme switches, the course rail — instead of
 * each item painting and un-painting its own background. A single moving
 * object reads as liquid; a set of toggling ones reads as a flicker.
 *
 * What makes it read as liquid rather than as a box sliding: its four edges
 * move separately. The edge facing the destination leaves first and fast; the
 * trailing edge follows later and slower, on a slight spring. On the way the
 * capsule stretches toward where it is going, then gathers itself on arrival —
 * a drop, not a tile. (The previous build's capsule animated position and size
 * at different speeds for the same reason; driving the edges themselves makes
 * the stretch follow the direction of travel, horizontally or vertically.)
 *
 * Geometry is measured, never assumed: labels change width with the language
 * and again when the webfont loads, so a ResizeObserver re-measures. Edges are
 * physical (left/right/top/bottom from offsets), which is correct in RTL too.
 * The first placement does not animate, and reduced motion places it instantly.
 *
 * Items mark themselves `data-active="true"`; the host gets `glideHost` (via
 * the returned `hostClass`) so items sit above the capsule.
 */
type Edges = { l: number; r: number; t: number; b: number };
const LEAD = 240, TRAIL = 470;

export function useGlide<T extends HTMLElement>(deps: ReadonlyArray<unknown>, tone: 'glass' | 'seg' = 'glass'): { ref: RefObject<T>; hostClass: string; pill: ReactNode } {
  const ref = useRef<T>(null);
  const prev = useRef<Edges | null>(null);
  const [state, setState] = useState<{ e: Edges; d: Edges; first: boolean } | null>(null);

  useLayoutEffect(() => {
    const host = ref.current;
    if (!host) return;
    const measure = () => {
      const a = host.querySelector<HTMLElement>('[data-active="true"]');
      if (!a) { setState(null); prev.current = null; return; }
      // Not laid out in the host right now (hidden for a moment, styles still
      // arriving): keep the capsule where it was; the observer measures again
      // once the item has a box.
      if (a.offsetParent !== host) return;
      const e = { l: a.offsetLeft, t: a.offsetTop, r: host.clientWidth - a.offsetLeft - a.offsetWidth, b: host.clientHeight - a.offsetTop - a.offsetHeight };
      const p = prev.current;
      prev.current = e;
      if (p && p.l === e.l && p.r === e.r && p.t === e.t && p.b === e.b) return;
      // The leading edge is the one on the side the capsule is moving toward.
      const d = { l: LEAD, r: LEAD, t: LEAD, b: LEAD };
      if (p) {
        if (e.l > p.l) d.l = TRAIL; else if (e.l < p.l) d.r = TRAIL;
        if (e.t > p.t) d.t = TRAIL; else if (e.t < p.t) d.b = TRAIL;
      }
      setState({ e, d, first: !p });
    };
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(host);
    for (const child of Array.from(host.children)) ro?.observe(child);
    return () => ro?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  let pill: ReactNode = null;
  if (state) {
    const { e, d, first } = state;
    const style: CSSProperties = {
      left: e.l, right: e.r, top: e.t, bottom: e.b,
      transition: first ? 'none' : `left ${d.l}ms var(--ease-glide), right ${d.r}ms var(--ease-glide), top ${d.t}ms var(--ease-glide), bottom ${d.b}ms var(--ease-glide)`
    };
    pill = <span aria-hidden="true" className={`${styles.pill} ${tone === 'seg' ? styles.seg : ''}`} style={style} />;
  }
  return { ref, hostClass: `${styles.host}${tone === 'seg' ? ` ${styles.segHost}` : ''}`, pill };
}
