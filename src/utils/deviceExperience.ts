import { useEffect, useState } from 'react';
import { canRender3DIntro, isMobileLikeDevice } from './deviceTier';

export type ExperienceMode = 'desktop' | 'mobile';

// Every media query isMobileLikeDevice() reads, so plugging in / removing a
// mouse or resizing the window re-evaluates the mode live.
const MOBILE_MEDIA_QUERIES = [
  '(max-width: 767px)',
  '(pointer: coarse)',
  '(hover: none)',
  '(any-pointer: fine)',
  '(any-hover: hover)',
] as const;

function getWindowObject(): Window | null {
  return typeof window === 'undefined' ? null : window;
}

function subscribeToMediaQuery(mediaQuery: MediaQueryList, listener: () => void): () => void {
  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }

  mediaQuery.addListener(listener);
  return () => mediaQuery.removeListener(listener);
}

export function detectExperienceMode(): ExperienceMode {
  const currentWindow = getWindowObject();
  if (!currentWindow) return 'desktop';

  return isMobileLikeDevice(currentWindow) ? 'mobile' : 'desktop';
}

/**
 * Whether the 3D boot sequence is allowed to render at all. Delegates to the
 * device tier system (docs/DESIGN_SYSTEM.md §9) — only the `full` tier gets
 * the 3D intro. Kept as a named export for backwards compatibility with
 * existing call sites.
 */
export function canRender3DScene(): boolean {
  if (detectExperienceMode() === 'mobile') return false;
  return canRender3DIntro();
}

export function useExperienceMode(): ExperienceMode {
  const [mode, setMode] = useState<ExperienceMode>(() => detectExperienceMode());

  useEffect(() => {
    const currentWindow = getWindowObject();
    if (!currentWindow) return;

    const updateMode = () => setMode(detectExperienceMode());
    const cleanups = MOBILE_MEDIA_QUERIES.map((query) =>
      subscribeToMediaQuery(currentWindow.matchMedia(query), updateMode),
    );

    updateMode();
    currentWindow.addEventListener('resize', updateMode);

    return () => {
      currentWindow.removeEventListener('resize', updateMode);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return mode;
}
