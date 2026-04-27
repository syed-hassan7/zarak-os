import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const Scene3D = lazy(() => import('./Scene3D.tsx'));

/**
 * Determines whether the device can handle the 3D scene.
 * Falls back to the flat OS app on mobile, low-spec devices,
 * or browsers without WebGL support.
 */
function canRender3D(): boolean {
  const isSmallViewport = window.matchMedia('(max-width: 767px)').matches;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const hasNoHover = window.matchMedia('(hover: none)').matches;
  const hasTouchPoints = navigator.maxTouchPoints > 0;
  const hasMobileUserAgent = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop|Mobile/i.test(
    navigator.userAgent
  );

  if (isSmallViewport || isCoarsePointer || hasNoHover || hasTouchPoints || hasMobileUserAgent) {
    return false;
  }

  // Check WebGL support
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    // Clean up the test canvas
    canvas.remove();
  } catch {
    return false;
  }

  // Check hardware concurrency (skip 3D on very low-spec machines)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return false;

  return true;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('[ZARAK_OS] Fatal: Root element #root not found in DOM.');
}

createRoot(rootElement).render(
  <StrictMode>
    {canRender3D() ? (
      <Suspense fallback={null}>
        <Scene3D />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
