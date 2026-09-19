import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

/**
 * Catches render errors and shows them.
 *
 * Without this, any throw during render unmounts the whole tree and leaves a
 * blank white page — which says nothing about what broke and sends you to the
 * devtools console to find out. That is exactly what a misresolved import
 * alias produced on a machine with a different Vite version.
 *
 * Errors are shown in full, including the stack. This is a learning tool, not
 * a product where leaking internals matters, and a readable failure is worth
 * far more than a tidy one.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep the console trail too — the boundary shows what broke, the console
    // shows where in the component tree.
    console.error('Chart Lab crashed during render:', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        style={{
          padding: '40px 24px',
          fontFamily: 'system-ui, sans-serif',
          color: '#e9f0f7',
          background: '#0d1218',
          minHeight: '100vh',
          direction: 'ltr',
          textAlign: 'left'
        }}
      >
        <h1 style={{ fontSize: 24, marginBottom: 12 }}>Chart Lab failed to start</h1>
        <p style={{ color: '#c6d2de', marginBottom: 20, maxWidth: '70ch' }}>
          A render error stopped the app. The details below usually name the
          module that failed — a common cause is a dependency version that does
          not match the one in <code>package.json</code>. Try{' '}
          <code>rm -rf node_modules package-lock.json &amp;&amp; npm install</code>.
        </p>
        <pre
          style={{
            padding: 16,
            borderRadius: 8,
            background: '#070b0f',
            border: '1px solid #2b3542',
            overflowX: 'auto',
            fontSize: 13,
            lineHeight: 1.6
          }}
        >
          {error.message}
          {'\n\n'}
          {error.stack}
        </pre>
      </div>
    );
  }
}
