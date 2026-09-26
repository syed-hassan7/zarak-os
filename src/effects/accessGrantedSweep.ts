const OVERLAY_CLASS = 'access-granted-sweep-overlay';
const OVERLAY_DURATION_MS = 900;

/**
 * Login success sweep — a single deliberate "premium unlock" moment,
 * distinct in feel from effects/glitchPulse.ts (which reads as an error/
 * intrusion event). This one reads as a clean access grant: a scanline
 * sweep + brief accent flash. Fires once on session start, never loops.
 */
export function triggerAccessGrantedSweep(): void {
  if (typeof document === 'undefined') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const overlay = document.createElement('div');
  overlay.className = OVERLAY_CLASS;
  document.body.appendChild(overlay);
  window.setTimeout(() => overlay.remove(), OVERLAY_DURATION_MS);
}
