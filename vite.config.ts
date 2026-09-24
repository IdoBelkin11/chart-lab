import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// `__dirname` does not exist in ESM, and this package is "type": "module".
// Vite 5 bundled the config to CJS so it happened to work; Vite 7+ loads it
// as native ESM, where it throws — the aliases below then fail to resolve and
// the app renders a blank page. fileURLToPath works under every loader.
const resolvePath = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // The two-layer split: @core is UI-agnostic and would survive a move to
      // another renderer untouched; @ui is React-only.
      '@core': resolvePath('./src/core'),
      '@ui': resolvePath('./src/ui')
    }
  },
  build: { outDir: 'dist', sourcemap: true },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx']
  }
} as never);
