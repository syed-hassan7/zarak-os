const OVERLAY_ID = 'terminal-override-overlay-el';
const OVERLAY_CLASS = 'terminal-override-overlay';
const DURATION_MS = 1900;

/**
 * Secret easter egg (triggered by the hidden `override` command): a
 * full-screen "access granted" flash + scan-line sweep, themed for the
 * terminal rather than login. Distinct from
 * src/effects/accessGrantedSweep.ts (LoginScreen's one-shot session-start
 * moment, owned elsewhere) — different overlay id/class, own CSS block, so
 * the two never collide. Same lifecycle contract as glitchPulse.ts: no-ops
 * under prefers-reduced-motion, bounded duration, tears down any prior
 * instance before starting a new one.
 */
export function triggerTerminalOverride(): void {
  if (typeof document === 'undefined') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const existing = document.getElementById(OVERLAY_ID);
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.className = OVERLAY_CLASS;

  const label = document.createElement('div');
  label.className = 'terminal-override-label';
  label.textContent = 'access granted';
  overlay.appendChild(label);

  const scanline = document.createElement('div');
  scanline.className = 'terminal-override-scanline';
  overlay.appendChild(scanline);

  document.body.appendChild(overlay);
  window.setTimeout(() => overlay.remove(), DURATION_MS);
}
