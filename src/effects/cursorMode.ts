export type CursorFxMode = 'default' | 'matrix' | 'waking';

export type CursorShape =
  | 'default'
  | 'interactive'
  | 'text'
  | 'move'
  | 'resize-ns'
  | 'resize-ew'
  | 'resize-nesw'
  | 'resize-nwse'
  | 'wait'
  | 'not-allowed';

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

let forcedShape: CursorShape | null = null;
const shapeListeners = new Set<(shape: CursorShape | null) => void>();

/**
 * Lets a component that owns an active drag/resize gesture (Window.tsx)
 * PIN the cursor shape for the gesture's duration. Without this, fast
 * pointer movement that briefly slips off a thin 6px resize handle (or
 * outside the window entirely, once dragging) would cause CustomCursor's
 * under-pointer hit-test to flicker back to 'default' mid-gesture even
 * though the OS-level drag is still very much in progress.
 */
export function setForcedCursorShape(shape: CursorShape | null): void {
  if (forcedShape === shape) return;
  forcedShape = shape;
  shapeListeners.forEach((listener) => listener(shape));
}

export function getForcedCursorShape(): CursorShape | null {
  return forcedShape;
}

export function subscribeForcedCursorShape(listener: (shape: CursorShape | null) => void): () => void {
  shapeListeners.add(listener);
  return () => shapeListeners.delete(listener);
}
