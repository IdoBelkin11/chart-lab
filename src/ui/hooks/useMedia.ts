import { useSyncExternalStore } from 'react';

/**
 * Whether a media query matches, kept live as the viewport changes.
 *
 * For choosing between two navigations (desktop topbar + launcher vs the
 * phone tab bar): mounting only the one that applies keeps a single tutor
 * entry and a single main nav in the accessibility tree, where CSS alone
 * would leave both in the DOM. Without matchMedia (tests, SSR) it reports
 * false — the desktop layout.
 */
export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof matchMedia === 'undefined') return () => {};
      const mql = matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => typeof matchMedia !== 'undefined' && matchMedia(query).matches,
    () => false
  );
}

/** The phone breakpoint, shared by every component that switches on it. */
export const PHONE = '(max-width: 760px)';
