import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { canRender3DScene } from './utils/deviceExperience.ts';
import { getDeviceTier, refineDeviceTierAsync } from './utils/deviceTier.ts';
import { hasSeenIntroRecently } from './utils/introState.ts';

const Scene3D = lazy(() => import('./Scene3D.tsx'));

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('[ZARAK_OS] Fatal: Root element #root not found in DOM.');
}

// Compute the sync device tier immediately (sets data-tier on <html> so CSS
// can react before first paint), then refine it asynchronously with a cheap
// GPU probe — see docs/DESIGN_SYSTEM.md §9 and src/utils/deviceTier.ts.
getDeviceTier();
refineDeviceTierAsync();

const shouldShowIntro = canRender3DScene() && !hasSeenIntroRecently();

createRoot(rootElement).render(
  <StrictMode>
    {shouldShowIntro ? (
      <Suspense fallback={null}>
        <Scene3D />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
