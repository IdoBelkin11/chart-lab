// ---------------------------------------------------------------------------
// Popover placement math — pure and DOM-free on purpose, so the clamping and
// flip logic can be unit-tested directly with fabricated rectangles instead
// of relying on jsdom's layout, which does not compute real geometry (every
// getBoundingClientRect() in a test environment returns zeros).
// ---------------------------------------------------------------------------

const MARGIN = 10; // px kept clear of the viewport edge
const GAP = 10; // px between the anchor and the popover

export interface Placement {
  top: number;
  left: number;
  /** Which side of the anchor the popover ended up on. */
  side: 'above' | 'below';
  /** Horizontal offset of the arrow from the popover's own left edge, so it
   *  keeps pointing at the anchor even when the popover itself is nudged
   *  over to stay on screen. */
  arrowLeft: number;
}

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Where a popover should sit relative to an anchor element, clamped to stay
 * fully within the viewport and flipped to the opposite side when there is
 * not enough room. `anchor` and `popover` are plain rectangles rather than
 * live DOM nodes so this has nothing to fake to test.
 */
export function computePlacement(anchor: Rect, popover: { width: number; height: number }, viewport: { width: number; height: number }): Placement {
  const idealLeft = anchor.left + anchor.width / 2 - popover.width / 2;
  const left = Math.min(Math.max(idealLeft, MARGIN), viewport.width - popover.width - MARGIN);

  const fitsAbove = anchor.top - popover.height - GAP >= MARGIN;
  const anchorBottom = anchor.top + anchor.height;
  const side: Placement['side'] = fitsAbove || anchorBottom + popover.height + GAP > viewport.height ? 'above' : 'below';
  const top = side === 'above' ? anchor.top - popover.height - GAP : anchorBottom + GAP;

  const anchorCenter = anchor.left + anchor.width / 2;
  const arrowLeft = Math.min(Math.max(anchorCenter - left, 14), popover.width - 14);

  return { top, left, side, arrowLeft };
}
