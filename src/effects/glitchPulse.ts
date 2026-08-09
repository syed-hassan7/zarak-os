const GLITCH_CLASS = 'glitch-pulse-overlay';
const GLITCH_DURATION_MS = 700;

export function triggerGlitchPulse(): void {
  if (typeof document === 'undefined') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const overlay = document.createElement('div');
  overlay.className = GLITCH_CLASS;
  document.body.appendChild(overlay);
  window.setTimeout(() => overlay.remove(), GLITCH_DURATION_MS);
}
