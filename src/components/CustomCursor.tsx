import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { getCursorFxMode, subscribeCursorFxMode, type CursorFxMode } from '../effects/cursorMode';

const INTERACTIVE_SELECTOR =
  'button, a, [role="button"], [role="link"], .window-handle, [data-cursor-interactive]';
const TEXT_SELECTOR = 'input, textarea, [contenteditable="true"], [data-cursor-text]';
const NATIVE_CURSOR_SELECTOR =
  '[class*="cursor-n-resize"], [class*="cursor-s-resize"], [class*="cursor-e-resize"], [class*="cursor-w-resize"], [class*="cursor-ne-resize"], [class*="cursor-nw-resize"], [class*="cursor-se-resize"], [class*="cursor-sw-resize"], [class*="cursor-move"]';
const MATRIX_GLYPHS = 'アイウエオカキクケコサシスセソ0123456789$#%';

function isCoarsePointerDevice(): boolean {
  return (
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(pointer: coarse)').matches || window.matchMedia?.('(hover: none)').matches)
  );
}

/**
 * Replaces the native OS pointer with a small teal ring + dot that reacts
 * to what's underneath it (interactive vs text vs plain surface), and
 * hands off to a distinct look while the `matrix` terminal easter egg is
 * running / waking up (see effects/cursorMode.ts + effects/matrixRain.ts).
 *
 * Skips entirely — leaves the native cursor alone — on touch/coarse
 * pointers and under prefers-reduced-motion, per docs/DESIGN_SYSTEM.md §6/§10.
 * Two-layer follow: the dot tracks the raw pointer 1:1, the ring trails it
 * with a light spring, so it reads as alive without feeling laggy.
 */
export default function CustomCursor() {
  const shouldReduceMotion = useReducedMotion();
  const [supported, setSupported] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isText, setIsText] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [overNativeCursor, setOverNativeCursor] = useState(false);
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

      const target = event.target as Element | null;
      setIsInteractive(Boolean(target?.closest?.(INTERACTIVE_SELECTOR)));
      setIsText(Boolean(target?.closest?.(TEXT_SELECTOR)));
      setOverNativeCursor(Boolean(target?.closest?.(NATIVE_CURSOR_SELECTOR)));
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

  if (overNativeCursor && !isMatrix && !isWaking) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[400]">
      <motion.div
        className={`absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full ${
          isMatrix
            ? 'border border-os-accent bg-transparent'
            : isText
              ? 'border border-os-accent/70 bg-transparent'
              : 'border border-os-accent/60 bg-os-accent/[0.06]'
        }`}
        style={{ x: ringX, y: ringY }}
        animate={{
          width: isMatrix ? 34 : isText ? 3 : isInteractive ? 40 : 22,
          height: isMatrix ? 34 : isText ? 20 : isInteractive ? 40 : 22,
          borderRadius: isText ? 2 : 999,
          scale: isWaking ? 2.2 : isPressed ? 0.85 : 1,
          opacity: isWaking ? 0 : 1,
          rotate: isMatrix ? 45 : 0,
        }}
        transition={{ duration: isWaking ? 0.55 : 0.16, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className={`absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full ${
          isMatrix ? 'bg-os-accent shadow-[0_0_10px_2px_rgba(45,212,191,0.7)]' : 'bg-os-accent'
        }`}
        style={{ x: dotX, y: dotY }}
        animate={{
          width: isText ? 0 : isMatrix ? 4 : 4,
          height: isText ? 0 : isMatrix ? 4 : 4,
          opacity: isWaking ? 0 : isText ? 0 : 1,
        }}
        transition={{ duration: 0.12 }}
      />
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
