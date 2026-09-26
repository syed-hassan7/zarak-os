const OVERLAY_ID = 'radar-scan-overlay';
const DURATION_MS = 4600;
const BLIP_LIFE_MS = 1600;
const BLIP_INTERVAL_MS = 550;
// Mirrors --color-os-accent / --color-os-warn / --color-os-danger from
// src/index.css — canvas 2D needs literal color values, these are the
// existing tokens' values, not new one-off colors.
const ACCENT = '#2DD4BF';
const WARN = '#C084FC';
const DANGER = '#F87171';

interface Blip {
  x: number;
  y: number;
  color: string;
  bornAt: number;
}

/**
 * Secret easter egg (triggered by the hidden `scan --deep` command): an
 * animated radar sweep with pinging nodes. Plain 2D canvas + rAF, mirrors
 * src/effects/matrixRain.ts's lifecycle contract (bounded duration,
 * dismissable, reduced-motion no-op, self-tears-down on re-trigger).
 */
export function triggerRadarScan(): void {
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

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = Math.min(canvas.width, canvas.height) * 0.38;

  let angle = 0;
  let rafId = 0;
  let timeoutId = 0;
  let blipTimerId = 0;
  let stopped = false;
  const blips: Blip[] = [];

  const stop = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(rafId);
    window.clearTimeout(timeoutId);
    window.clearInterval(blipTimerId);
    window.removeEventListener('keydown', stop);
    window.removeEventListener('pointerdown', stop);
    window.removeEventListener('resize', stop);
    canvas.remove();
  };

  const spawnBlip = () => {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * radius * 0.9;
    const palette = [ACCENT, ACCENT, WARN, DANGER];
    blips.push({
      x: cx + Math.cos(a) * r,
      y: cy + Math.sin(a) * r,
      color: palette[Math.floor(Math.random() * palette.length)],
      bornAt: performance.now(),
    });
    if (blips.length > 6) blips.shift();
  };

  const draw = () => {
    if (stopped) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(45, 212, 191, 0.25)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (radius / 3) * i, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.4)';
    ctx.stroke();

    angle += 0.045;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, angle - 0.5, angle);
    ctx.closePath();
    ctx.fillStyle = 'rgba(45, 212, 191, 0.18)';
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 2;
    ctx.stroke();

    const now = performance.now();
    for (const blip of blips) {
      const age = now - blip.bornAt;
      const t = age / BLIP_LIFE_MS;
      if (t > 1) continue;
      const pulse = Math.sin(t * Math.PI);
      ctx.globalAlpha = 0.8 * (1 - t);
      ctx.beginPath();
      ctx.arc(blip.x, blip.y, 3 + pulse * 8, 0, Math.PI * 2);
      ctx.strokeStyle = blip.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(blip.x, blip.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = blip.color;
      ctx.fill();
    }

    rafId = requestAnimationFrame(draw);
  };

  rafId = requestAnimationFrame(draw);
  blipTimerId = window.setInterval(spawnBlip, BLIP_INTERVAL_MS);
  timeoutId = window.setTimeout(stop, DURATION_MS);
  window.addEventListener('keydown', stop, { once: true });
  window.addEventListener('pointerdown', stop, { once: true });
  window.addEventListener('resize', stop, { once: true });
}
