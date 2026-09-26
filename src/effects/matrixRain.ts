const OVERLAY_ID = 'matrix-rain-overlay';
const DURATION_MS = 5200;
// Mirrors --color-os-accent / --color-os-bg from src/index.css — canvas 2D
// needs literal color values, these are not new one-off colors.
const ACCENT = '#2DD4BF';
const BG_TRAIL = 'rgba(5, 7, 10, 0.16)';
const GLYPHS = 'アイウエオカキクケコサシスセソ0123456789ABCDEF$%#@&*+-/\\<>[]';

/**
 * Full-viewport matrix-style digital rain, dismissable easter egg triggered
 * by the `matrix` terminal command. Plain 2D canvas + requestAnimationFrame
 * — intentionally NOT three.js, per docs/DESIGN_SYSTEM.md chunking/frameloop
 * rules (this is a cheap self-contained overlay, not a Canvas scene).
 *
 * Auto-stops after ~5s or on any keypress/click/resize. No-ops entirely
 * under prefers-reduced-motion. Safe to call while already running — it
 * tears down the previous instance first instead of stacking loops.
 */
export function triggerMatrixRain(): void {
  if (typeof document === 'undefined') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const existing = document.getElementById(OVERLAY_ID);
  if (existing) existing.remove();

  const canvas = document.createElement('canvas');
  canvas.id = OVERLAY_ID;
  canvas.className = 'effect-canvas-overlay';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;

  const fontSize = 15 * dpr;
  const columns = Math.max(1, Math.floor(canvas.width / fontSize));
  const drops = new Array(columns).fill(0).map(() => Math.floor(Math.random() * -40));

  let rafId = 0;
  let timeoutId = 0;
  let stopped = false;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(rafId);
    window.clearTimeout(timeoutId);
    window.removeEventListener('keydown', stop);
    window.removeEventListener('pointerdown', stop);
    window.removeEventListener('resize', stop);
    canvas.remove();
  };

  const draw = () => {
    if (stopped) return;
    ctx.fillStyle = BG_TRAIL;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
    ctx.fillStyle = ACCENT;
    for (let i = 0; i < drops.length; i++) {
      const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      ctx.fillText(glyph, x, y);
      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
    rafId = requestAnimationFrame(draw);
  };

  rafId = requestAnimationFrame(draw);
  timeoutId = window.setTimeout(stop, DURATION_MS);
  window.addEventListener('keydown', stop, { once: true });
  window.addEventListener('pointerdown', stop, { once: true });
  window.addEventListener('resize', stop, { once: true });
}
