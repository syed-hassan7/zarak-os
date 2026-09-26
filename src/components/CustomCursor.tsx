import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import {
  getCursorFxMode,
  getForcedCursorShape,
  subscribeCursorFxMode,
  subscribeForcedCursorShape,
  type CursorFxMode,
  type CursorShape,
} from '../effects/cursorMode';

const INTERACTIVE_SELECTOR =
  'button, a, [role="button"], [role="link"], summary, select, [data-cursor-interactive]';
const TEXT_SELECTOR = 'input, textarea, [contenteditable="true"], [data-cursor-text]';
const MOVE_SELECTOR = '.window-handle, [data-cursor-move]';
const WAIT_SELECTOR = '[data-cursor-wait], button:disabled[class*="cursor-wait"]';
const NOT_ALLOWED_SELECTOR = 'button:disabled, [aria-disabled="true"], [data-cursor-not-allowed]';
const RESIZE_NS_SELECTOR = '[class*="cursor-n-resize"], [class*="cursor-s-resize"]';
const RESIZE_EW_SELECTOR = '[class*="cursor-e-resize"], [class*="cursor-w-resize"]';
const RESIZE_NESW_SELECTOR = '[class*="cursor-ne-resize"], [class*="cursor-sw-resize"]';
const RESIZE_NWSE_SELECTOR = '[class*="cursor-nw-resize"], [class*="cursor-se-resize"]';
const MATRIX_GLYPHS = 'アイウエオカキクケコサシスセソ0123456789$#%';

type HoverShape = Exclude<CursorShape, 'default'>;

function isCoarsePointerDevice(): boolean {
  return (
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(pointer: coarse)').matches || window.matchMedia?.('(hover: none)').matches)
  );
}

/**
 * Resolves what the NATIVE cursor would have shown for this element, so our
 * replacement can mirror every one of Window.tsx's resize handles, the
 * titlebar drag handle, disabled/wait buttons, and plain interactive/text
 * targets — the whole point being the OS pointer never has a reason to
 * show through, anywhere. Order matters: most specific first.
 */
function resolveHoverShape(target: Element | null): HoverShape | null {
  if (!target) return null;
  if (target.closest(WAIT_SELECTOR)) return 'wait';
  if (target.closest(NOT_ALLOWED_SELECTOR)) return 'not-allowed';
  if (target.closest(RESIZE_NESW_SELECTOR)) return 'resize-nesw';
  if (target.closest(RESIZE_NWSE_SELECTOR)) return 'resize-nwse';
  if (target.closest(RESIZE_NS_SELECTOR)) return 'resize-ns';
  if (target.closest(RESIZE_EW_SELECTOR)) return 'resize-ew';
  if (target.closest(TEXT_SELECTOR)) return 'text';
  if (target.closest(INTERACTIVE_SELECTOR)) return 'interactive';
  if (target.closest(MOVE_SELECTOR)) return 'move';
  return null;
}

/**
 * Replaces the native OS pointer everywhere — including every Window.tsx
 * resize edge, the titlebar drag handle, disabled/wait buttons, and text
 * inputs — with matching custom glyphs, plus a distinct look while the
 * `matrix` terminal easter egg is running/waking (effects/cursorMode.ts +
 * effects/matrixRain.ts). There is no scenario where this component bails
 * out to the native cursor while active: every hover/gesture case below
 * maps to an explicit shape, and index.css backs it with `cursor: none
 * !important` on every descendant so a Tailwind cursor-* utility can never
 * win the cascade and show the OS pointer through.
 *
 * A gesture in progress (drag/resize, driven by Window.tsx) can PIN the
 * shape via setForcedCursorShape so fast pointer movement that briefly
 * slips off a thin handle doesn't flicker the cursor back to default
 * mid-gesture.
 *
 * Skips entirely — leaves the native cursor alone — on touch/coarse
 * pointers and under prefers-reduced-motion, per docs/DESIGN_SYSTEM.md §6/§10.
 */
export default function CustomCursor() {
  const shouldReduceMotion = useReducedMotion();
  const [supported, setSupported] = useState(false);
  const [hoverShape, setHoverShape] = useState<HoverShape | null>(null);
  const [forcedShape, setForcedShapeState] = useState<CursorShape | null>(() => getForcedCursorShape());
  const [isPressed, setIsPressed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [fxMode, setFxMode] = useState<CursorFxMode>(getCursorFxMode());
  const [glyph, setGlyph] = useState(MATRIX_GLYPHS[0]);

  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { stiffness: 420, damping: 32, mass: 0.4 });
  const ringY = useSpring(dotY, { stiffness: 420, damping: 32, mass: 0.4 });

  const glyphIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (shouldReduceMotion || isCoarsePointerDevice()) {
      setSupported(false);
      return;
    }
    setSupported(true);
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (!supported) return undefined;

    document.documentElement.classList.add('custom-cursor-active');

    const handleMove = (event: PointerEvent) => {
      dotX.set(event.clientX);
      dotY.set(event.clientY);
      setVisible(true);
      setHoverShape(resolveHoverShape(event.target as Element | null));
    };
    const handleDown = () => setIsPressed(true);
    const handleUp = () => setIsPressed(false);
    const handleLeave = () => setVisible(false);
    const handleEnter = () => setVisible(true);

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('pointerdown', handleDown, { passive: true });
    window.addEventListener('pointerup', handleUp, { passive: true });
    document.addEventListener('mouseleave', handleLeave);
    document.addEventListener('mouseenter', handleEnter);

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointerup', handleUp);
      document.removeEventListener('mouseleave', handleLeave);
      document.removeEventListener('mouseenter', handleEnter);
    };
  }, [supported, dotX, dotY]);

  useEffect(() => subscribeCursorFxMode(setFxMode), []);
  useEffect(() => subscribeForcedCursorShape(setForcedShapeState), []);

  // Cycles the small glyph tag shown next to the reticle while in matrix
  // mode — a cheap interval, not a rAF loop, and always torn down.
  useEffect(() => {
    if (fxMode !== 'matrix') {
      if (glyphIntervalRef.current) {
        window.clearInterval(glyphIntervalRef.current);
        glyphIntervalRef.current = null;
      }
      return undefined;
    }
    glyphIntervalRef.current = window.setInterval(() => {
      setGlyph(MATRIX_GLYPHS[Math.floor(Math.random() * MATRIX_GLYPHS.length)]);
    }, 90);
    return () => {
      if (glyphIntervalRef.current) {
        window.clearInterval(glyphIntervalRef.current);
        glyphIntervalRef.current = null;
      }
    };
  }, [fxMode]);

  if (!supported || !visible) return null;

  const isMatrix = fxMode === 'matrix';
  const isWaking = fxMode === 'waking';
  const shape: CursorShape = isMatrix || isWaking ? 'default' : forcedShape ?? hoverShape ?? 'default';

  const isText = shape === 'text';
  const isInteractive = shape === 'interactive';
  const isMove = shape === 'move';
  const isResizeNS = shape === 'resize-ns';
  const isResizeEW = shape === 'resize-ew';
  const isResizeNESW = shape === 'resize-nesw';
  const isResizeNWSE = shape === 'resize-nwse';
  const isResize = isResizeNS || isResizeEW || isResizeNESW || isResizeNWSE;
  const isWait = shape === 'wait';
  const isNotAllowed = shape === 'not-allowed';

  const resizeRotationDeg = isResizeNS ? 0 : isResizeEW ? 90 : isResizeNESW ? 45 : isResizeNWSE ? 135 : 0;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[400]">
      <motion.div
        className={`absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full ${
          isMatrix
            ? 'border border-os-accent bg-transparent'
            : isNotAllowed
              ? 'border border-os-danger/70 bg-os-danger/[0.06]'
              : isText
                ? 'border border-os-accent/70 bg-transparent'
                : 'border border-os-accent/60 bg-os-accent/[0.06]'
        }`}
        style={{ x: ringX, y: ringY }}
        animate={{
          width: isMatrix ? 34 : isText ? 3 : isInteractive ? 40 : isResize ? 4 : isMove ? 30 : isWait ? 26 : 22,
          height: isMatrix ? 34 : isText ? 20 : isInteractive ? 40 : isResize ? 26 : isMove ? 30 : isWait ? 26 : 22,
          borderRadius: isText || isResize ? 2 : 999,
          rotate: isMatrix ? 45 : isResize ? resizeRotationDeg : 0,
          scale: isWaking ? 2.2 : isPressed ? 0.85 : 1,
          opacity: isWaking ? 0 : 1,
        }}
        transition={{ duration: isWaking ? 0.55 : 0.16, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className={`absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full ${
          isMatrix
            ? 'bg-os-accent shadow-[0_0_10px_2px_rgba(45,212,191,0.7)]'
            : isNotAllowed
              ? 'bg-os-danger'
              : 'bg-os-accent'
        }`}
        style={{ x: dotX, y: dotY }}
        animate={{
          width: isText || isResize ? 0 : 4,
          height: isText || isResize ? 0 : 4,
          opacity: isWaking ? 0 : isText || isResize ? 0 : 1,
        }}
        transition={{ duration: 0.12 }}
      />
      {isMove && (
        <motion.div
          className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
          style={{ x: dotX, y: dotY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          transition={{ duration: 0.12 }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 0.5 L11.5 3.5 H9.8 V7.2 H13.5 V5.5 L16.5 8 L13.5 10.5 V8.8 H9.8 V12.5 H11.5 L9 15.5 L6.5 12.5 H8.2 V8.8 H4.5 V10.5 L1.5 8 L4.5 5.5 V7.2 H8.2 V3.5 H6.5 Z"
              fill="var(--color-os-accent)"
              opacity="0.9"
            />
          </svg>
        </motion.div>
      )}
      {isResize && (
        <motion.div
          className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
          style={{ x: dotX, y: dotY, rotate: resizeRotationDeg }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.12 }}
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <path
              d="M4 7 L0 7 M0 7 L3 4 M0 7 L3 10 M14 7 L18 7 M18 7 L15 4 M18 7 L15 10"
              stroke="var(--color-os-accent)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      )}
      {isWait && (
        <motion.div
          className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-os-accent/25 border-t-os-accent"
          style={{ x: dotX, y: dotY, width: 16, height: 16 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {isNotAllowed && (
        <motion.div
          className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
          style={{ x: dotX, y: dotY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.12 }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7.2" stroke="var(--color-os-danger)" strokeWidth="1.6" />
            <path d="M4.5 4.5 L13.5 13.5" stroke="var(--color-os-danger)" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </motion.div>
      )}
      {isMatrix && (
        <motion.span
          className="absolute left-0 top-0 -translate-x-1/2 -translate-y-[2.6rem] font-mono text-[13px] text-os-accent drop-shadow-[0_0_6px_rgba(45,212,191,0.8)]"
          style={{ x: dotX, y: dotY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          exit={{ opacity: 0 }}
        >
          {glyph}
        </motion.span>
      )}
    </div>
  );
}
