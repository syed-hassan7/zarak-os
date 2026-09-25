import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { getDeviceTier } from '../../utils/deviceTier';

interface SceneLoaderProps {
  onComplete: () => void;
}

interface BootLine {
  text: string;
  tag?: string;
  tagColor?: 'accent' | 'warn' | 'success' | 'sec';
  delay: number;
}

const TAG_COLOR_CLASS: Record<NonNullable<BootLine['tagColor']>, string> = {
  accent: 'text-os-accent',
  warn: 'text-os-warn',
  success: 'text-os-success',
  sec: 'text-os-text-sec',
};

/**
 * Builds the pre-boot terminal script from real, client-detected hardware
 * facts (design system §8/§9) — this is a genuine readout of the tier
 * decision that already gated whether this component mounts at all, not
 * flavor text. Kept intentionally short: total sequence budget is ~1.9s,
 * matching the previous loader's timing contract so the overall boot
 * doesn't get slower, just more distinctive.
 */
function useBootScript(): BootLine[] {
  return useMemo(() => {
    const tier = getDeviceTier();
    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency ?? 4 : 4;
    let renderer = 'webgl2';
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      if (!gl) renderer = canvas.getContext('webgl') ? 'webgl1' : 'canvas2d';
      canvas.remove();
    } catch {
      renderer = 'unknown';
    }

    let t = 0;
    const step = 150;
    const line = (text: string, tag?: string, tagColor?: BootLine['tagColor']): BootLine => {
      const entry = { text, tag, tagColor, delay: t };
      t += step;
      return entry;
    };

    return [
      line('zarak_os kernel v2.7 — cold boot', 'BOOT', 'accent'),
      line(`cpu_threads   : ${cores}`, 'OK', 'success'),
      line(`render_ctx    : ${renderer}`, 'OK', 'success'),
      line(`perf_tier     : ${tier.toUpperCase()}`, 'OK', 'success'),
      line('mounting display server...', 'SYS', 'sec'),
      line('spawning window compositor...', 'SYS', 'sec'),
      line('handoff to visual shell_', 'READY', 'warn'),
    ];
  }, []);
}

export default function SceneLoader({ onComplete }: SceneLoaderProps) {
  const bootLines = useBootScript();
  const [visibleCount, setVisibleCount] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      // Skip the stagger entirely — show the full readout at once and hand
      // off quickly, per design system §6 (reduced motion degrades to
      // opacity-only / near-zero duration, not just "slower").
      setVisibleCount(bootLines.length);
      const completeTimer = window.setTimeout(onComplete, 260);
      return () => window.clearTimeout(completeTimer);
    }

    const timers = bootLines.map((_, index) =>
      window.setTimeout(() => setVisibleCount(index + 1), bootLines[index].delay),
    );
    const finalDelay = bootLines[bootLines.length - 1]?.delay ?? 0;
    const completeTimer = window.setTimeout(onComplete, finalDelay + 420);
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      window.clearTimeout(completeTimer);
    };
  }, [bootLines, onComplete, shouldReduceMotion]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(6px)' }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[9999] flex select-none flex-col items-center justify-center overflow-hidden bg-os-bg font-mono"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:repeating-linear-gradient(0deg,#fff_0px,#fff_1px,transparent_1px,transparent_3px)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.05),transparent_60%)]" />

      <div className="relative z-10 w-full max-w-md px-8">
        <div className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-os-text-sec/50">
          <span className="h-1.5 w-1.5 rounded-full bg-os-accent shadow-[0_0_8px_rgba(45,212,191,0.7)]" />
          <span>Pre-boot diagnostics</span>
        </div>

        <div className="space-y-1.5 text-[12.5px] leading-6">
          {bootLines.map((entry, index) => (
            <motion.div
              key={entry.text}
              initial={{ opacity: 0, x: -6 }}
              animate={index < visibleCount ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-baseline gap-2.5"
            >
              <span className="text-os-text-sec/40">$</span>
              <span className="flex-1 text-os-text-pri/85">{entry.text}</span>
              {entry.tag && index < visibleCount && (
                <span className={`text-[10px] font-semibold tracking-widest ${TAG_COLOR_CLASS[entry.tagColor ?? 'sec']}`}>
                  [{entry.tag}]
                </span>
              )}
            </motion.div>
          ))}
          {visibleCount >= bootLines.length && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-block h-3.5 w-[7px] translate-y-0.5 bg-os-accent"
              style={{ animation: 'zarak-cursor-blink 0.9s steps(1) infinite' }}
            />
          )}
        </div>
      </div>

      <style>{`
        @keyframes zarak-cursor-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </motion.div>
  );
}
