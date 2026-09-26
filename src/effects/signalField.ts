/**
 * Ambient "signal field" — a slow constellation of drifting nodes with
 * proximity-based connecting lines, used as the login screen's single
 * ambient loop (docs/DESIGN_SYSTEM.md §6: one concurrent ambient loop per
 * screen region, must pause on prefers-reduced-motion and on
 * document.visibilityState === 'hidden', never frameloop="always" without
 * a real stop condition).
 *
 * Deliberately plain 2D canvas + requestAnimationFrame, not three.js — this
 * is a full-bleed decorative background behind glass panels, not a scene
 * that needs a 3D camera, so a heavier renderer would just be wasted
 * chunk weight for the login screen's critical path.
 */

const NODE_COUNT = 34;
const LINK_DISTANCE = 150;
const MOUSE_LINK_DISTANCE = 220;
const DRIFT_SPEED = 0.06;

const ACCENT_RGB = '45, 212, 191'; // --color-os-accent
const WARN_RGB = '192, 132, 252'; // --color-os-warn

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  warn: boolean;
  phase: number;
}

export function mountSignalField(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let rafId: number | null = null;
  let running = true;
  const pointer = { x: -9999, y: -9999, active: false };

  const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * DRIFT_SPEED,
    vy: (Math.random() - 0.5) * DRIFT_SPEED,
    warn: Math.random() < 0.28,
    phase: Math.random() * Math.PI * 2,
  }));

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function step(time: number) {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);

    for (const node of nodes) {
      node.x += node.vx * 0.01;
      node.y += node.vy * 0.01;
      if (node.x < -0.05) node.x = 1.05;
      if (node.x > 1.05) node.x = -0.05;
      if (node.y < -0.05) node.y = 1.05;
      if (node.y > 1.05) node.y = -0.05;
    }

    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i];
      const ax = a.x * width;
      const ay = a.y * height;

      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j];
        const bx = b.x * width;
        const by = b.y * height;
        const dx = ax - bx;
        const dy = ay - by;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > LINK_DISTANCE) continue;
        const alpha = (1 - dist / LINK_DISTANCE) * 0.16;
        ctx.strokeStyle = `rgba(${a.warn || b.warn ? WARN_RGB : ACCENT_RGB}, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }

      if (pointer.active) {
        const dx = ax - pointer.x;
        const dy = ay - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_LINK_DISTANCE) {
          const alpha = (1 - dist / MOUSE_LINK_DISTANCE) * 0.32;
          ctx.strokeStyle = `rgba(${ACCENT_RGB}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }

      const pulse = 0.55 + Math.sin(time * 0.0006 + a.phase) * 0.35;
      ctx.fillStyle = `rgba(${a.warn ? WARN_RGB : ACCENT_RGB}, ${0.45 * pulse})`;
      ctx.beginPath();
      ctx.arc(ax, ay, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = requestAnimationFrame(step);
  }

  function start() {
    if (rafId !== null) return;
    running = true;
    rafId = requestAnimationFrame(step);
  }

  function stop() {
    running = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function handlePointerMove(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
  }

  function handlePointerLeave() {
    pointer.active = false;
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      stop();
    } else {
      start();
    }
  }

  resize();
  start();

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  window.addEventListener('pointerleave', handlePointerLeave);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return function cleanup() {
    stop();
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerleave', handlePointerLeave);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
