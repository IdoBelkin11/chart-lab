import type { ReactNode } from 'react';
import { Header } from './Header';
import { CourseRail } from './CourseRail';
import { AiLauncher } from './AiLauncher';
import styles from './AppShell.module.css';

/**
 * The application frame.
 *
 * Three regions, and only one of them scrolls:
 *
 *   ┌──────────┬──────────────────────┐
 *   │          │  Header              │
 *   │  Course  ├──────────────────────┤
 *   │  Rail    │  Workspace (scrolls) │
 *   └──────────┴──────────────────────┘
 *
 * The rail spans the full height with the brand at its top, and the header
 * sits beside it rather than across it — that adjacency is what stops the
 * rail looking sliced off beneath a floating bar.
 *
 * Feature views render inside the workspace, never over the frame. In the
 * previous build they were `position: fixed; inset: 0`, so opening the AI or
 * the quiz painted over the header, brand and rail — which is what made the
 * app feel like a set of separate mini-sites. Here that is structurally
 * impossible: a route simply cannot escape its container.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <CourseRail />
      <div className={styles.main}>
        <Header />
        <main className={styles.workspace} id="workspace">
          {children}
        </main>
      </div>
      {/* Outside .main on purpose: it is fixed to the viewport, so nesting it
          inside a scroll container would only invite a stacking-context bug
          later. */}
      <AiLauncher />
    </div>
  );
}
