// The design system's global layers load FIRST, before any component pulls in
// its CSS module: a module class and a global primitive on the same element
// (`styles.launcher` + `glass`) have equal specificity, so whichever loads
// later wins — and the component's own geometry (position: fixed, its size)
// must be the one that wins.
import '@ui/styles/tokens.css';
import '@ui/styles/base.css';
import '@ui/styles/system.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@ui/app/App';

const root = document.getElementById('root');
if (!root) throw new Error('#root missing from index.html');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
