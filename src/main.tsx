import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@ui/app/App';
import '@ui/styles/tokens.css';
import '@ui/styles/base.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root missing from index.html');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
