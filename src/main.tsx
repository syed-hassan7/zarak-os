import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { canRender3DScene } from './utils/deviceExperience.ts';

const Scene3D = lazy(() => import('./Scene3D.tsx'));

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('[ZARAK_OS] Fatal: Root element #root not found in DOM.');
}

createRoot(rootElement).render(
  <StrictMode>
    {canRender3DScene() ? (
      <Suspense fallback={null}>
        <Scene3D />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
