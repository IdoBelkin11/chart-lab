import type { ReactNode } from 'react';
import { useRoute } from '@ui/hooks/useRoute';
import { Header } from './Header';
import { CourseRail } from './CourseRail';
import { AiLauncher } from './AiLauncher';
import { TabBar } from './TabBar';
import { hasContent } from '@core/curriculum/trackInfo';
import styles from './AppShell.module.css';

/**
 * The application frame (Artifact: .shell / .work / .rail).
 *
 *   ┌──────────────────────────┬──────────┐
 *   │  topbar (glass capsule)  │          │
 *   ├──────────────────────────┤   rail   │
 *   │  workspace (scrolls)     │          │
 *   └──────────────────────────┴──────────┘
 *
 * Only the workspace scrolls. The rail sits at the INLINE-END edge — left in
 * Hebrew, right in English — and is second in the DOM, so reading order and
 * tab order follow what the eye sees. Routes render inside the workspace and
 * can never paint over the frame.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { route, params } = useRoute();
  // Onboarding, the lesson workspace and the practice questions are full-screen,
  // with their own bars (Artifact: 04 · Onboarding, 06 · Lesson, 11 · Practice). An unwritten lesson's preview keeps the shell.
  if (route === 'onboarding' || (route === 'lesson' && hasContent(params.lessonId!)) || (route === 'practice' && params.view === 'run')) return <>{children}</>;
  return (
    <div className={styles.shell}>
      <div className={styles.main}>
        <Header />
        <main className={styles.workspace} id="workspace">
          {children}
        </main>
      </div>
      <CourseRail />
      <AiLauncher />
      <TabBar />
    </div>
  );
}
