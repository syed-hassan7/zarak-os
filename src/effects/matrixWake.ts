const OVERLAY_ID = 'matrix-wake-overlay';
const DURATION_MS = 640;

/**
 * The "waking up" beat that closes out the matrix rain easter egg — a
 * Neo-opening-his-eyes moment instead of the rain just cutting off. Two
 * solid lids (matching the screen's darkness while the rain was running)
 * retract top/bottom like eyes opening, with a teal focus-pulse at the
 * point the cursor was resting, synced with CustomCursor.tsx switching
 * back from its matrix glyph to the default ring via effects/cursorMode.ts.
 *
 * Self-contained lifecycle like every other effect here: bounded timers,
 * re-entrancy guard, no-op under prefers-reduced-motion (caller still
 * resets cursor mode immediately in that case, just without the burst).
 */
export function triggerMatrixWake(originX: number, originY: number): void {
  if (typeof document === 'undefined') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const existing = document.getElementById(OVERLAY_ID);
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.className = 'matrix-wake-overlay';
  overlay.style.setProperty('--wake-x', `${originX}px`);
  overlay.style.setProperty('--wake-y', `${originY}px`);

  const lidTop = document.createElement('div');
  lidTop.className = 'matrix-wake-lid matrix-wake-lid--top';
  const lidBottom = document.createElement('div');
  lidBottom.className = 'matrix-wake-lid matrix-wake-lid--bottom';
  const flash = document.createElement('div');
  flash.className = 'matrix-wake-flash';

  overlay.append(lidTop, lidBottom, flash);
  document.body.appendChild(overlay);

  window.setTimeout(() => overlay.remove(), DURATION_MS);
}
