export type CursorFxMode = 'default' | 'matrix' | 'waking';

let current: CursorFxMode = 'default';
const listeners = new Set<(mode: CursorFxMode) => void>();

/**
 * Tiny pub-sub so effects that hijack the screen (matrixRain.ts) can also
 * tell CustomCursor.tsx to switch into a matching visual state, without the
 * two modules needing to know about each other's internals — matrixRain
 * just announces a mode, CustomCursor renders whatever that mode means.
 */
export function setCursorFxMode(mode: CursorFxMode): void {
  if (current === mode) return;
  current = mode;
  listeners.forEach((listener) => listener(mode));
}

export function getCursorFxMode(): CursorFxMode {
  return current;
}

export function subscribeCursorFxMode(listener: (mode: CursorFxMode) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
