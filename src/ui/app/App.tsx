import { AppStateProvider } from './AppState';
import { ErrorBoundary } from './ErrorBoundary';
import { AppShell } from '@ui/shell/AppShell';
import { RouteView } from './RouteView';

/** Composition root: state, then shell, then whatever route is active. */
export function App() {
  return (
    <ErrorBoundary>
      <AppStateProvider>
        <AppShell>
          <RouteView />
        </AppShell>
      </AppStateProvider>
    </ErrorBoundary>
  );
}
