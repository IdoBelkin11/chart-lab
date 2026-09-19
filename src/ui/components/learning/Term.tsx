import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { glossaryTerm } from '@core/glossary/terms';
import { useLang } from '@ui/hooks/useLang';
import { computePlacement, type Placement } from '@ui/utils/popoverPlacement';
import styles from './Term.module.css';

/**
 * One glossary word inside a sentence. A dotted underline marks it as
 * interactive; a tap (or hover, on a device that has one) opens a short
 * definition without leaving the page — the whole point being that a
 * beginner never has to break their reading flow to go look a word up.
 *
 * Deliberately a `<button>`, not a native `title` tooltip: `title` is
 * inaccessible on touch and invisible until an arbitrary hover delay, and
 * neither of those work for the audience this is built for.
 */
export function Term({ termId, children }: { termId: string; children: string }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();
  const term = glossaryTerm(termId);

  // Measured after the popover has actually rendered (its real size depends
  // on the definition text and the viewport's font metrics), then
  // positioned — never guessed up front.
  useLayoutEffect(() => {
    if (!open || !buttonRef.current || !popoverRef.current) return;
    const anchor = buttonRef.current.getBoundingClientRect();
    const size = popoverRef.current.getBoundingClientRect();
    setPlacement(
      computePlacement(anchor, { width: size.width, height: size.height }, {
        width: window.innerWidth,
        height: window.innerHeight
      })
    );
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onKey);
    // Scroll anywhere invalidates the computed position rather than tracking
    // it live — a defined moment to close beats a popover that lags a
    // fast scroll by a frame and visibly detaches from its word.
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  // Content mentions a word the dictionary doesn't have an entry for (should
  // not happen, but a broken lookup should render as plain text, not crash).
  if (!term) return <>{children}</>;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.term}
        aria-expanded={open}
        aria-describedby={open ? popoverId : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        {children}
      </button>
      {open &&
        createPortal(
          <div
            ref={popoverRef}
            role="tooltip"
            id={popoverId}
            className={styles.popover}
            data-side={placement?.side ?? 'above'}
            // Invisible until placed, so the (unavoidable) first-frame
            // measurement render never flashes at the wrong spot.
            style={
              placement
                ? { top: placement.top, left: placement.left, ['--arrow-left' as string]: `${placement.arrowLeft}px` }
                : { top: 0, left: 0, visibility: 'hidden' }
            }
          >
            {term.def[lang]}
          </div>,
          document.body
        )}
    </>
  );
}
