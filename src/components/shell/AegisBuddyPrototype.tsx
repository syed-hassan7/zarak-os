import { useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  AEGIS_AMBIENT_THOUGHTS,
  type AegisAmbientThought,
} from '../../data/aegisAmbientThoughts';
import {
  AEGIS_CONTEXT_CATEGORY_MAP,
  AEGIS_LINES,
  type AegisLine,
  getAegisPreferredCategories,
} from '../../data/aegisLines';
import type { AppId } from '../../os/types';

interface AegisBuddyPrototypeProps {
  activeApp: AppId | null;
  openApps: AppId[];
  pauseAmbientMotion: boolean;
}

type AmbientMode = 'idle' | 'hover' | 'thinking' | 'sleeping';

const buttonVariants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -4 },
  tap: { scale: 0.97, y: 0 },
};

const PASSIVE_THOUGHT_IDLE_DELAY_MS = 5_000;
const PASSIVE_THOUGHT_VISIBLE_MS = 7_000;
const PASSIVE_THOUGHT_COOLDOWN_MS = 12_000;

function shuffleLines<T>(lines: readonly T[]): T[] {
  const shuffled = [...lines];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function buildCandidatePool(activeApp: AppId | null, lines: readonly AegisLine[]): AegisLine[] {
  const preferredCategories = getAegisPreferredCategories(activeApp);
  const preferredLines = lines.filter((line) =>
    preferredCategories.some((category) => line.categories.includes(category)),
  );

  if (preferredLines.length > 0) return preferredLines;
  return [...lines];
}

function pickNextAegisLine(
  activeApp: AppId | null,
  shownLineIds: Set<string>,
  currentLineId: string | null,
): AegisLine {
  const candidatePool = buildCandidatePool(activeApp, AEGIS_LINES);
  const globallyUnshownLines = AEGIS_LINES.filter((line) => !shownLineIds.has(line.id));
  let availableLines = candidatePool.filter((line) => !shownLineIds.has(line.id));

  if (availableLines.length === 0) {
    availableLines = globallyUnshownLines;
  }

  if (availableLines.length === 0) {
    shownLineIds.clear();
    availableLines = AEGIS_LINES.filter((line) => line.id !== currentLineId);
  }

  const shuffledLines = shuffleLines(availableLines);
  const nextLine =
    shuffledLines.find((line) => line.id !== currentLineId) ??
    shuffledLines[0] ??
    AEGIS_LINES.find((line) => line.id !== currentLineId) ??
    AEGIS_LINES[0];

  shownLineIds.add(nextLine.id);
  return nextLine;
}

function pickNextAmbientThought(
  shownThoughtIds: Set<string>,
  currentThoughtId: string | null,
): AegisAmbientThought {
  let availableThoughts = AEGIS_AMBIENT_THOUGHTS.filter((thought) => !shownThoughtIds.has(thought.id));

  if (availableThoughts.length === 0) {
    shownThoughtIds.clear();
    availableThoughts = AEGIS_AMBIENT_THOUGHTS.filter((thought) => thought.id !== currentThoughtId);
  }

  const shuffledThoughts = shuffleLines(availableThoughts);
  const nextThought =
    shuffledThoughts.find((thought) => thought.id !== currentThoughtId) ??
    shuffledThoughts[0] ??
    AEGIS_AMBIENT_THOUGHTS.find((thought) => thought.id !== currentThoughtId) ??
    AEGIS_AMBIENT_THOUGHTS[0];

  shownThoughtIds.add(nextThought.id);
  return nextThought;
}

export default function AegisBuddyPrototype({
  activeApp,
  openApps,
  pauseAmbientMotion,
}: AegisBuddyPrototypeProps) {
  const shouldReduceMotion = useReducedMotion();
  const [mode, setMode] = useState<AmbientMode>(shouldReduceMotion ? 'sleeping' : 'idle');
  const [currentLine, setCurrentLine] = useState<AegisLine>(() => AEGIS_LINES[0]);
  const [isLineVisible, setIsLineVisible] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [currentThought, setCurrentThought] = useState<AegisAmbientThought | null>(null);
  const hoverRef = useRef(false);
  const focusRef = useRef(false);
  const suppressNextFocusRef = useRef(false);
  const modeRef = useRef<AmbientMode>(mode);
  const lineVisibleRef = useRef(isLineVisible);
  const pauseAmbientMotionRef = useRef(pauseAmbientMotion);
  const currentThoughtRef = useRef<AegisAmbientThought | null>(currentThought);
  const isMountedRef = useRef(true);
  const lastActiveAppRef = useRef<AppId | null>(activeApp);
  const prevOpenAppsRef = useRef<AppId[]>(openApps);
  const hasShownTerminalHintRef = useRef(false);
  const shownLineIdsRef = useRef<Set<string>>(new Set([AEGIS_LINES[0].id]));
  const shownThoughtIdsRef = useRef<Set<string>>(new Set());
  const thinkTimeoutRef = useRef<number | null>(null);
  const lineTimeoutRef = useRef<number | null>(null);
  const blinkTimeoutRef = useRef<number | null>(null);
  const blinkResetTimeoutRef = useRef<number | null>(null);
  const passiveThoughtIdleTimeoutRef = useRef<number | null>(null);
  const passiveThoughtCooldownTimeoutRef = useRef<number | null>(null);
  const passiveThoughtHideTimeoutRef = useRef<number | null>(null);

  const clearTimeoutRef = (timeoutRef: MutableRefObject<number | null>) => {
    if (timeoutRef.current === null) return;
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  };

  const syncAmbientMode = () => {
    if (shouldReduceMotion) {
      setMode('sleeping');
      return;
    }

    if (hoverRef.current || focusRef.current) {
      setMode('hover');
      return;
    }

    setMode('idle');
  };

  const showLineTemporarily = (durationMs = 2200) => {
    setIsLineVisible(true);
    clearTimeoutRef(lineTimeoutRef);
    lineTimeoutRef.current = window.setTimeout(() => {
      if (!hoverRef.current && !focusRef.current) {
        setIsLineVisible(false);
      }
    }, durationMs);
  };

  const clearPassiveThought = () => {
    currentThoughtRef.current = null;
    setCurrentThought(null);
    clearTimeoutRef(passiveThoughtHideTimeoutRef);
  };

  const clearPassiveThoughtTimers = () => {
    clearTimeoutRef(passiveThoughtIdleTimeoutRef);
    clearTimeoutRef(passiveThoughtCooldownTimeoutRef);
    clearTimeoutRef(passiveThoughtHideTimeoutRef);
  };

  const schedulePassiveThoughtLoop = (delayMs = PASSIVE_THOUGHT_IDLE_DELAY_MS) => {
    clearPassiveThoughtTimers();

    if (pauseAmbientMotionRef.current) return;

    passiveThoughtIdleTimeoutRef.current = window.setTimeout(() => {
      if (!isMountedRef.current) return;

      if (
        hoverRef.current ||
        focusRef.current ||
        lineVisibleRef.current ||
        modeRef.current === 'thinking' ||
        pauseAmbientMotionRef.current
      ) {
        schedulePassiveThoughtLoop(PASSIVE_THOUGHT_IDLE_DELAY_MS);
        return;
      }

      const nextThought = pickNextAmbientThought(
        shownThoughtIdsRef.current,
        currentThoughtRef.current?.id ?? null,
      );
      setCurrentThought(nextThought);
      currentThoughtRef.current = nextThought;

      passiveThoughtHideTimeoutRef.current = window.setTimeout(() => {
        if (!isMountedRef.current) return;

        clearPassiveThought();
        passiveThoughtCooldownTimeoutRef.current = window.setTimeout(() => {
          if (!isMountedRef.current) return;
          schedulePassiveThoughtLoop(PASSIVE_THOUGHT_IDLE_DELAY_MS);
        }, PASSIVE_THOUGHT_COOLDOWN_MS);
      }, PASSIVE_THOUGHT_VISIBLE_MS);
    }, delayMs);
  };

  const registerAegisInteraction = () => {
    clearPassiveThought();
    clearPassiveThoughtTimers();
  };

  useEffect(() => {
    if (shouldReduceMotion) {
      clearTimeoutRef(thinkTimeoutRef);
      clearTimeoutRef(blinkTimeoutRef);
      clearTimeoutRef(blinkResetTimeoutRef);
      setMode('sleeping');
      setIsBlinking(false);
      schedulePassiveThoughtLoop();
      return;
    }

    if (pauseAmbientMotion) {
      clearPassiveThought();
    }

    schedulePassiveThoughtLoop();
    syncAmbientMode();
  }, [pauseAmbientMotion, shouldReduceMotion]);

  useEffect(() => {
    if (lastActiveAppRef.current === activeApp) return;
    lastActiveAppRef.current = activeApp;

    if (hoverRef.current || focusRef.current || isLineVisible || mode === 'thinking') return;
    const nextLine = pickNextAegisLine(activeApp, shownLineIdsRef.current, currentLine.id);
    setCurrentLine(nextLine);
  }, [activeApp, currentLine.id, isLineVisible, mode]);

  useEffect(() => {
    const newlyOpenedApp = openApps.find((id) => !prevOpenAppsRef.current.includes(id));
    prevOpenAppsRef.current = openApps;

    if (!newlyOpenedApp || !(newlyOpenedApp in AEGIS_CONTEXT_CATEGORY_MAP)) return;
    if (hoverRef.current || focusRef.current) return;

    registerAegisInteraction();
    const terminalHint = AEGIS_LINES.find((line) => line.id === 'terminal-not-everything-in-help');
    const shouldShowTerminalHint =
      newlyOpenedApp === 'terminal' && !hasShownTerminalHintRef.current && terminalHint;
    const nextLine = shouldShowTerminalHint
      ? terminalHint
      : pickNextAegisLine(newlyOpenedApp, shownLineIdsRef.current, currentLine.id);
    if (shouldShowTerminalHint) {
      hasShownTerminalHintRef.current = true;
      shownLineIdsRef.current.add(nextLine.id);
    }
    setCurrentLine(nextLine);
    showLineTemporarily(2600);

    if (shouldReduceMotion) {
      setMode('sleeping');
      return;
    }

    clearTimeoutRef(thinkTimeoutRef);
    setMode('thinking');
    thinkTimeoutRef.current = window.setTimeout(() => {
      syncAmbientMode();
    }, 1200);
  }, [openApps]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      clearTimeoutRef(thinkTimeoutRef);
      clearTimeoutRef(lineTimeoutRef);
      clearTimeoutRef(blinkTimeoutRef);
      clearTimeoutRef(blinkResetTimeoutRef);
      clearPassiveThoughtTimers();
    };
  }, []);

  useEffect(() => {
    clearTimeoutRef(blinkTimeoutRef);
    clearTimeoutRef(blinkResetTimeoutRef);

    if (shouldReduceMotion || mode === 'sleeping') {
      setIsBlinking(false);
      return;
    }

    blinkTimeoutRef.current = window.setTimeout(() => {
      setIsBlinking(true);
      blinkResetTimeoutRef.current = window.setTimeout(() => {
        setIsBlinking(false);
      }, 130);
    }, 2600 + Math.random() * 3200);

    return () => {
      clearTimeoutRef(blinkTimeoutRef);
      clearTimeoutRef(blinkResetTimeoutRef);
    };
  }, [mode, shouldReduceMotion]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    lineVisibleRef.current = isLineVisible;
  }, [isLineVisible]);

  useEffect(() => {
    pauseAmbientMotionRef.current = pauseAmbientMotion;
  }, [pauseAmbientMotion]);

  useEffect(() => {
    currentThoughtRef.current = currentThought;
  }, [currentThought]);

  const shouldShowLine = isLineVisible || hoverRef.current || focusRef.current;
  const shouldShowPassiveThought = currentThought !== null && !shouldShowLine;
  const isHoveringMode = mode === 'hover';
  const isThinkingMode = mode === 'thinking';
  const isAttentive = isHoveringMode || isThinkingMode;
  const isSpeaking = shouldShowLine && !shouldReduceMotion;
  const isSleepingMode = shouldReduceMotion || mode === 'sleeping';

  const handlePointerEnter = () => {
    registerAegisInteraction();
    hoverRef.current = true;
    setIsLineVisible(true);
    if (!shouldReduceMotion) {
      setMode('hover');
    }
  };

  const handlePointerLeave = () => {
    hoverRef.current = false;
    suppressNextFocusRef.current = false;
    if (!focusRef.current) {
      setIsLineVisible(false);
      schedulePassiveThoughtLoop();
    }
    if (mode !== 'thinking') {
      syncAmbientMode();
    }
  };

  const handlePointerDown = () => {
    suppressNextFocusRef.current = true;
    focusRef.current = false;
  };

  const handleFocus = () => {
    registerAegisInteraction();

    if (suppressNextFocusRef.current) {
      suppressNextFocusRef.current = false;
      if (!shouldReduceMotion) {
        setMode('hover');
      }
      return;
    }

    focusRef.current = true;
    setIsLineVisible(true);
    if (!shouldReduceMotion) {
      setMode('hover');
    }
  };

  const handleBlur = () => {
    suppressNextFocusRef.current = false;
    focusRef.current = false;
    if (!hoverRef.current) {
      setIsLineVisible(false);
      schedulePassiveThoughtLoop();
    }
    if (mode !== 'thinking') {
      syncAmbientMode();
    }
  };

  const handleClick = () => {
    registerAegisInteraction();
    const nextLine = pickNextAegisLine(activeApp, shownLineIdsRef.current, currentLine.id);
    setCurrentLine(nextLine);
    showLineTemporarily(2600);
    schedulePassiveThoughtLoop();

    if (shouldReduceMotion) {
      setMode('sleeping');
      return;
    }

    clearTimeoutRef(thinkTimeoutRef);
    setMode('thinking');
    thinkTimeoutRef.current = window.setTimeout(() => {
      syncAmbientMode();
    }, 1200);
  };

  return (
    <div className="pointer-events-none absolute bottom-[3.85rem] right-[4.5rem] z-40">
      <motion.button
        type="button"
        aria-label="Cycle Aegis-M ambient status"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onMouseEnter={handlePointerEnter}
        onMouseLeave={handlePointerLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        variants={shouldReduceMotion ? undefined : buttonVariants}
        initial="rest"
        whileHover="hover"
        whileFocus="hover"
        whileTap="tap"
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="group pointer-events-auto relative flex h-[4.45rem] w-[4.55rem] items-center justify-center rounded-[26px] outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg"
      >
        <motion.span
          aria-hidden="true"
          animate={
            isSleepingMode
              ? { opacity: 0.26, scale: 0.96 }
              : isAttentive
                ? { opacity: 0.84, scale: 1.14 }
                : isSpeaking
                  ? { opacity: 0.74, scale: 1.1 }
                  : { opacity: 0.46, scale: 1 }
          }
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className={`absolute inset-x-[0.3rem] inset-y-[0.18rem] rounded-[24px] bg-[radial-gradient(circle,rgba(45,212,191,0.34)_0%,rgba(45,212,191,0.16)_36%,rgba(139,92,246,0.12)_58%,rgba(45,212,191,0.02)_76%,transparent_100%)] ${
            !shouldReduceMotion && mode === 'idle' ? 'aegis-prototype-glow' : ''
          }`}
        />
        <motion.span
          aria-hidden="true"
          animate={
            isSleepingMode
              ? { opacity: 0.4, scaleX: 0.86, scaleY: 0.9 }
              : isSpeaking
                ? { opacity: 0.9, scaleX: 1.08, scaleY: 1.04 }
                : { opacity: 0.78, scaleX: 1, scaleY: 1 }
          }
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="absolute bottom-[0.95rem] left-1/2 h-5 w-[4.15rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.2)_0%,rgba(139,92,246,0.12)_28%,rgba(12,18,24,0.32)_48%,rgba(8,12,18,0)_82%)]"
        />
        <motion.span
          aria-hidden="true"
          animate={
            isHoveringMode
              ? { opacity: 0.86, scaleX: 1.12, x: 4 }
              : isThinkingMode
                ? { opacity: 0.76, scaleX: 1.16, x: 6 }
                : isSleepingMode
                  ? { opacity: 0.1, scaleX: 0.7, x: 0 }
                  : { opacity: 0.52, scaleX: 1, x: 0 }
          }
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute left-1/2 top-[1.4rem] h-px w-[2.9rem] -translate-x-[0.2rem] rotate-[18deg] bg-[linear-gradient(90deg,rgba(45,212,191,0),rgba(45,212,191,0.16),rgba(139,92,246,0.2),rgba(45,212,191,0.1),rgba(45,212,191,0))]"
        />
        <motion.span
          aria-hidden="true"
          animate={
            isHoveringMode
              ? { opacity: 0.74, x: 13 }
              : isThinkingMode
                ? { opacity: 0.66, x: 16 }
                : isSleepingMode
                  ? { opacity: 0.12, x: 4 }
                  : { opacity: 0.22, x: 5 }
          }
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="absolute top-[1.55rem] h-[2.55rem] w-[0.48rem] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(220,255,251,0.82),rgba(180,145,255,0.46),rgba(255,255,255,0))] blur-[0.45px]"
        />
        <motion.svg
          aria-hidden="true"
          viewBox="0 0 120 120"
          className="relative z-10 h-[5rem] w-[5rem] overflow-visible"
        >
          <defs>
            <linearGradient id="aegis-shell-fill" x1="60" y1="16" x2="60" y2="98" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(220, 255, 252, 0.98)" />
              <stop offset="18%" stopColor="rgba(164, 243, 234, 0.96)" />
              <stop offset="52%" stopColor="rgba(59, 172, 169, 0.9)" />
              <stop offset="100%" stopColor="rgba(8, 22, 31, 0.96)" />
            </linearGradient>
            <linearGradient id="aegis-panel-fill" x1="60" y1="34" x2="60" y2="83" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(16, 29, 47, 0.96)" />
              <stop offset="100%" stopColor="rgba(7, 12, 18, 0.94)" />
            </linearGradient>
            <linearGradient id="aegis-fin-fill" x1="18" y1="24" x2="102" y2="88" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(171, 250, 242, 0.92)" />
              <stop offset="55%" stopColor="rgba(62, 176, 172, 0.82)" />
              <stop offset="100%" stopColor="rgba(102, 78, 167, 0.74)" />
            </linearGradient>
            <radialGradient id="aegis-core-glow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="rgba(86, 255, 235, 0.95)" />
              <stop offset="55%" stopColor="rgba(61, 206, 195, 0.36)" />
              <stop offset="100%" stopColor="rgba(61, 206, 195, 0)" />
            </radialGradient>
            <radialGradient id="aegis-violet-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(167, 139, 250, 0.58)" />
              <stop offset="100%" stopColor="rgba(167, 139, 250, 0)" />
            </radialGradient>
          </defs>

          <motion.ellipse
            cx="60"
            cy="92"
            rx="20"
            ry="8.5"
            fill="url(#aegis-violet-glow)"
            animate={
              isSleepingMode
                ? { opacity: 0.22, scaleX: 0.82 }
                : isSpeaking
                  ? { opacity: 0.55, scaleX: 1.08 }
                  : { opacity: 0.34, scaleX: 1 }
            }
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
          <motion.g
            animate={
              isAttentive
                ? { y: -1.6, scaleY: 1.02 }
                : isSleepingMode
                  ? { y: 0.8, scaleY: 0.98 }
                  : { y: 0, scaleY: 1 }
            }
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            <motion.path
              d="M31 41 L20 51 L27 67 L40 63 L42 48 Z"
              fill="url(#aegis-fin-fill)"
              stroke="rgba(192,255,248,0.36)"
              strokeWidth="1.2"
              animate={
                isHoveringMode
                  ? { rotate: -5, x: -1.4, y: -0.5 }
                  : isThinkingMode
                    ? { rotate: -7, x: -2, y: -1 }
                    : isSleepingMode
                      ? { rotate: 4, x: 0, y: 1 }
                      : { rotate: 0, x: 0, y: 0 }
              }
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ transformOrigin: '34px 54px' }}
            />
            <motion.path
              d="M89 41 L100 51 L93 67 L80 63 L78 48 Z"
              fill="url(#aegis-fin-fill)"
              stroke="rgba(192,255,248,0.32)"
              strokeWidth="1.2"
              animate={
                isHoveringMode
                  ? { rotate: 5, x: 1.4, y: -0.5 }
                  : isThinkingMode
                    ? { rotate: 7, x: 2, y: -1 }
                    : isSleepingMode
                      ? { rotate: -4, x: 0, y: 1 }
                      : { rotate: 0, x: 0, y: 0 }
              }
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ transformOrigin: '86px 54px' }}
            />
            <motion.path
              d="M60 18 L84 31 L90 67 L72 91 H48 L30 67 L36 31 Z"
              fill="url(#aegis-shell-fill)"
              stroke="rgba(223,255,252,0.56)"
              strokeWidth="1.4"
              animate={
                isSleepingMode
                  ? { scaleY: 0.97, y: 1.2 }
                  : isSpeaking
                    ? { scaleY: 1.015, y: -0.3 }
                    : { scaleY: 1, y: 0 }
              }
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{ transformOrigin: '60px 57px' }}
            />
            <path
              d="M60 27 L76 36 L80 64 L67 82 H53 L40 64 L44 36 Z"
              fill="rgba(255,255,255,0.08)"
              stroke="rgba(224,255,252,0.26)"
              strokeWidth="1"
            />
            <path
              d="M42 46 C48 38, 72 38, 78 46 L74 67 C71 73, 64 76, 60 76 C56 76, 49 73, 46 67 Z"
              fill="url(#aegis-panel-fill)"
              stroke="rgba(185,255,247,0.26)"
              strokeWidth="1"
            />
            <motion.ellipse
              cx="60"
              cy="58"
              rx="18"
              ry="9"
              fill="url(#aegis-core-glow)"
              animate={
                isSleepingMode
                  ? { opacity: 0.18, scaleX: 0.82, scaleY: 0.6 }
                  : isBlinking
                    ? { opacity: 0.38, scaleX: 0.9, scaleY: 0.14 }
                    : isThinkingMode
                      ? { opacity: 0.88, scaleX: 0.96, scaleY: 1.08 }
                      : isSpeaking
                        ? { opacity: 0.84, scaleX: 1.06, scaleY: 1.1 }
                        : isHoveringMode
                          ? { opacity: 0.78, scaleX: 1.04, scaleY: 1.03 }
                          : { opacity: 0.68, scaleX: 1, scaleY: 1 }
              }
              transition={{ duration: isBlinking ? 0.1 : 0.18, ease: 'easeOut' }}
            />
            <motion.path
              d="M46 58 C50 53, 70 53, 74 58 C70 62, 50 62, 46 58 Z"
              fill="rgba(12,20,31,0.8)"
              animate={
                isSleepingMode
                  ? { opacity: 0.56, scaleY: 0.42, y: 3 }
                  : isBlinking
                    ? { opacity: 0.88, scaleY: 0.12, y: 2.4 }
                    : isThinkingMode
                      ? { opacity: 1, scaleY: 1.12, y: 0 }
                      : isSpeaking
                        ? { opacity: 0.94, scaleY: 1.05, y: -0.4 }
                        : { opacity: 1, scaleY: 1, y: 0 }
              }
              transition={{ duration: isBlinking ? 0.1 : 0.18, ease: 'easeOut' }}
              style={{ transformOrigin: '60px 58px' }}
            />
            <motion.path
              d="M49 58 H71"
              stroke="rgba(136,255,242,0.98)"
              strokeWidth="3.3"
              strokeLinecap="round"
              animate={
                isSleepingMode
                  ? { opacity: 0.4, scaleX: 0.72, y: 2.8 }
                  : isBlinking
                    ? { opacity: 0.72, scaleX: 0.8, scaleY: 0.22, y: 2.2 }
                    : isThinkingMode
                      ? { opacity: 1, scaleX: 0.82, y: -0.2 }
                      : isSpeaking
                        ? { opacity: 1, scaleX: 1.06, y: -0.2 }
                        : isHoveringMode
                          ? { opacity: 1, scaleX: 1.02, y: -0.1 }
                          : { opacity: 0.92, scaleX: 1, y: 0 }
              }
              transition={{ duration: isBlinking ? 0.1 : 0.18, ease: 'easeOut' }}
              style={{ transformOrigin: '60px 58px' }}
            />
            <motion.path
              d="M52 74 L60 82 L68 74"
              fill="none"
              stroke="rgba(176,255,244,0.34)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={
                isSpeaking
                  ? { opacity: 0.6, y: 0.4 }
                  : isSleepingMode
                    ? { opacity: 0.18, y: 1.6 }
                    : { opacity: 0.34, y: 0 }
              }
              transition={{ duration: 0.2, ease: 'easeOut' }}
            />
            <path
              d="M49 30 L60 24 L71 30"
              fill="none"
              stroke="rgba(229,255,252,0.22)"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
            <path
              d="M37 63 L47 68"
              stroke="rgba(180,255,246,0.22)"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <path
              d="M83 63 L73 68"
              stroke="rgba(180,255,246,0.22)"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </motion.g>
        </motion.svg>
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={
            shouldShowLine
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 4, scale: 0.98 }
          }
          transition={{ duration: 0.16, ease: 'easeOut' }}
          className="pointer-events-none absolute bottom-[calc(100%+0.9rem)] left-1/2 flex w-[14.8rem] -translate-x-[64%] flex-col rounded-[16px] border border-white/12 bg-os-bg/88 px-3 py-2 text-left shadow-xl shadow-black/25 backdrop-blur-xl"
        >
          <span className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/62">Aegis-M</span>
          <span className="mt-1 text-[11px] leading-4 text-os-text-pri">{currentLine.text}</span>
        </motion.span>
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={
            shouldShowPassiveThought
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 4, scale: 0.98 }
          }
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.16, ease: 'easeOut' }}
          className="pointer-events-none absolute bottom-[calc(100%+0.8rem)] left-1/2 flex w-[15rem] -translate-x-[64%] flex-col rounded-[16px] border border-cyan-300/12 bg-os-bg/84 px-3 py-2 text-left shadow-xl shadow-black/20 backdrop-blur-xl"
        >
          <span className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/54">Aegis-M // passive</span>
          <span className="mt-1 text-[11px] leading-4 text-os-text-pri">{currentThought?.text}</span>
        </motion.span>
      </motion.button>
    </div>
  );
}
