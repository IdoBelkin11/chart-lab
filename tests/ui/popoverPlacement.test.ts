import { describe, it, expect } from 'vitest';
import { computePlacement } from '@ui/utils/popoverPlacement';

// A generous, ordinary viewport — most cases below vary the anchor or
// popover, not the screen.
const VIEWPORT = { width: 1200, height: 800 };
const POPOVER = { width: 280, height: 80 };

describe('computePlacement', () => {
  it('centres the popover on the anchor when there is room on every side', () => {
    const p = computePlacement({ top: 400, left: 500, width: 60, height: 20 }, POPOVER, VIEWPORT);
    expect(p.left).toBe(500 + 30 - 140); // anchor centre minus half the popover width
    expect(p.side).toBe('above');
  });

  it('clamps to the left edge instead of running off it', () => {
    // This is the exact bug reported from real use: a word near the start
    // of a narrow container, where a centred popover would extend into
    // negative x and be clipped.
    const p = computePlacement({ top: 400, left: 5, width: 40, height: 20 }, POPOVER, VIEWPORT);
    expect(p.left).toBeGreaterThanOrEqual(10);
    expect(p.left + POPOVER.width).toBeLessThanOrEqual(VIEWPORT.width);
  });

  it('clamps to the right edge instead of running off it', () => {
    const p = computePlacement({ top: 400, left: 1180, width: 40, height: 20 }, POPOVER, VIEWPORT);
    expect(p.left + POPOVER.width).toBeLessThanOrEqual(VIEWPORT.width - 10 + 0.001);
    expect(p.left).toBeGreaterThanOrEqual(10);
  });

  it('flips below the anchor when there is no room above it', () => {
    const p = computePlacement({ top: 15, left: 500, width: 40, height: 20 }, POPOVER, VIEWPORT);
    expect(p.side).toBe('below');
    expect(p.top).toBeGreaterThan(15);
  });

  it('stays above when there is also no room below (prefers above)', () => {
    const p = computePlacement(
      { top: 15, left: 500, width: 40, height: 20 },
      POPOVER,
      { width: 1200, height: 40 } // barely taller than the anchor itself
    );
    expect(p.side).toBe('above');
  });

  it('never places the popover outside the viewport, across a spread of anchor positions', () => {
    for (let left = -50; left <= 1250; left += 25) {
      for (let top = -20; top <= 820; top += 40) {
        const p = computePlacement({ top, left, width: 50, height: 20 }, POPOVER, VIEWPORT);
        expect(p.left, `left=${left}`).toBeGreaterThanOrEqual(10 - 0.001);
        expect(p.left + POPOVER.width, `left=${left}`).toBeLessThanOrEqual(VIEWPORT.width - 10 + 0.001);
      }
    }
  });

  it('keeps the arrow pointing at the anchor even when the popover is clamped sideways', () => {
    const p = computePlacement({ top: 400, left: 5, width: 40, height: 20 }, POPOVER, VIEWPORT);
    const arrowAbsoluteX = p.left + p.arrowLeft;
    const anchorCenterX = 5 + 20;
    // The arrow cannot sit exactly on the (clamped) popover's edge, but it
    // should land much closer to the real anchor centre than a naive
    // horizontally-centred arrow (140px in) would.
    expect(Math.abs(arrowAbsoluteX - anchorCenterX)).toBeLessThan(30);
  });

  it('keeps the arrow within the popover body, never past its edges', () => {
    const p = computePlacement({ top: 400, left: 1180, width: 40, height: 20 }, POPOVER, VIEWPORT);
    expect(p.arrowLeft).toBeGreaterThanOrEqual(14);
    expect(p.arrowLeft).toBeLessThanOrEqual(POPOVER.width - 14);
  });
});
