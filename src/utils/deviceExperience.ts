import { useEffect, useState } from 'react';

export type ExperienceMode = 'desktop' | 'mobile';

const MOBILE_MEDIA_QUERIES = [
  '(max-width: 767px)',
  '(pointer: coarse)',
  '(hover: none)',
] as const;

const MOBILE_USER_AGENT_PATTERN =
  /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop|Mobile/i;

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

  const isSmallViewport = currentWindow.matchMedia('(max-width: 767px)').matches;
  const isCoarsePointer = currentWindow.matchMedia('(pointer: coarse)').matches;
  const hasNoHover = currentWindow.matchMedia('(hover: none)').matches;
  const hasTouchPoints = navigator.maxTouchPoints > 0;
  const hasMobileUserAgent = MOBILE_USER_AGENT_PATTERN.test(navigator.userAgent);

  return isSmallViewport || isCoarsePointer || hasNoHover || hasTouchPoints || hasMobileUserAgent
    ? 'mobile'
    : 'desktop';
}

export function canRender3DScene(): boolean {
  if (detectExperienceMode() === 'mobile') return false;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    canvas.remove();
  } catch {
    return false;
  }

  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return false;

  return true;
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
