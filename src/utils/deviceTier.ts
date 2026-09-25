import { useEffect, useState } from 'react';

/**
 * Device performance tier — see docs/DESIGN_SYSTEM.md §9.
 *
 * Computed once per session and mirrored onto `<html data-tier>` so plain
 * CSS can react to it (glass tiers, particle/ambient toggles) without every
 * component re-deriving the same checks.
 *
 * - `full`      desktop, strong GPU/CPU signal → 3D intro, full glass, particles
 * - `balanced`  desktop but weaker signal → skip 3D intro, keep glass, drop ambient extras
 * - `lite`      mobile / low-end / reduced-motion / explicit override → flat surfaces, minimal motion
 */
export type DeviceTier = 'full' | 'balanced' | 'lite';

const STORAGE_KEY = 'zarak_os_tier_override';
const TIER_ATTR = 'tier';

let cachedTier: DeviceTier | null = null;
const listeners = new Set<(tier: DeviceTier) => void>();

function getWindowObject(): Window | null {
  return typeof window === 'undefined' ? null : window;
}

export function getTierOverride(): DeviceTier | null {
  const win = getWindowObject();
  if (!win) return null;
  try {
    const stored = win.localStorage.getItem(STORAGE_KEY);
    if (stored === 'full' || stored === 'balanced' || stored === 'lite') return stored;
  } catch {
    /* localStorage may be unavailable (private browsing) — ignore */
  }
  return null;
}

export function setTierOverride(tier: DeviceTier | null): void {
  const win = getWindowObject();
  if (!win) return;
  try {
    if (tier === null) {
      win.localStorage.removeItem(STORAGE_KEY);
    } else {
      win.localStorage.setItem(STORAGE_KEY, tier);
    }
  } catch {
    /* ignore write failures */
  }
  cachedTier = tier ?? detectTier();
  applyTierAttribute(cachedTier);
  listeners.forEach((listener) => listener(cachedTier!));
}

function isMobileLikeDevice(win: Window): boolean {
  const isSmallViewport = win.matchMedia('(max-width: 767px)').matches;
  const isCoarsePointer = win.matchMedia('(pointer: coarse)').matches;
  const hasNoHover = win.matchMedia('(hover: none)').matches;
  const hasTouchPoints = navigator.maxTouchPoints > 0;
  const hasMobileUserAgent = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop|Mobile/i.test(
    navigator.userAgent,
  );
  return isSmallViewport || isCoarsePointer || hasNoHover || hasTouchPoints || hasMobileUserAgent;
}

/**
 * Cheap synchronous heuristic — no GPU probe, safe to call before first paint.
 * Used as the immediate value; `useDeviceTier()` can refine it asynchronously.
 */
function detectTier(): DeviceTier {
  const override = getTierOverride();
  if (override) return override;

  const win = getWindowObject();
  if (!win) return 'balanced';

  const prefersReducedMotion = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return 'lite';

  if (isMobileLikeDevice(win)) return 'lite';

  let hasWebGL = false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    hasWebGL = Boolean(gl);
    canvas.remove();
  } catch {
    hasWebGL = false;
  }

  if (!hasWebGL) return 'lite';

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;

  if (cores >= 6 && (memory === undefined || memory >= 4)) return 'full';
  if (cores >= 4) return 'balanced';
  return 'lite';
}

/**
 * Optional refinement: render one throwaway triangle and read GPU renderer
 * string when available. Never blocks first paint — callers race this
 * against a short timeout and keep the sync heuristic if it doesn't resolve.
 */
function probeGpuTier(): Promise<'high' | 'low' | 'unknown'> {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null;
      if (!gl) {
        resolve('unknown');
        return;
      }
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = debugInfo
        ? (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string)
        : '';
      canvas.remove();

      const lowSignatures = /swiftshader|llvmpipe|software|microsoft basic render/i;
      if (lowSignatures.test(renderer)) {
        resolve('low');
        return;
      }
      resolve(renderer ? 'high' : 'unknown');
    } catch {
      resolve('unknown');
    }
  });
}

export function applyTierAttribute(tier: DeviceTier): void {
  const win = getWindowObject();
  if (!win) return;
  win.document.documentElement.setAttribute(`data-${TIER_ATTR}`, tier);
}

export function getDeviceTier(): DeviceTier {
  if (cachedTier) return cachedTier;
  cachedTier = detectTier();
  applyTierAttribute(cachedTier);
  return cachedTier;
}

/**
 * Kicks off the async GPU refinement pass. Call once at boot (main.tsx).
 * Resolves within 150ms or falls back silently — never blocks rendering.
 */
export function refineDeviceTierAsync(): void {
  const override = getTierOverride();
  if (override) return; // explicit user choice always wins

  const win = getWindowObject();
  if (!win) return;

  const timeout = new Promise<'unknown'>((resolve) => win.setTimeout(() => resolve('unknown'), 150));

  Promise.race([probeGpuTier(), timeout]).then((signal) => {
    if (signal === 'low' && cachedTier === 'full') {
      cachedTier = 'balanced';
      applyTierAttribute(cachedTier);
      listeners.forEach((listener) => listener(cachedTier!));
    }
  });
}

export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>(() => getDeviceTier());

  useEffect(() => {
    const listener = (nextTier: DeviceTier) => setTier(nextTier);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return tier;
}

export function canRender3DIntro(): boolean {
  return getDeviceTier() === 'full';
}
