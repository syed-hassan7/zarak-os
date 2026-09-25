import { useEffect, useState } from 'react';
import { Cpu, Gauge, MonitorSmartphone, Sparkles, Zap } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { AppComponentProps } from '../../os/types';
import {
  type DeviceTier,
  getTierOverride,
  setTierOverride,
  useDeviceTier,
} from '../../utils/deviceTier';
import { resetIntroSeen } from '../../utils/introState';

/**
 * performance.sys — the manual device-tier override required by
 * docs/DESIGN_SYSTEM.md §9. Also doubles as a legitimate talking point:
 * it demonstrates the performance-tiering work directly to anyone poking
 * around the OS, rather than burying it in a hidden dev flag.
 */

const TIER_OPTIONS: {
  id: DeviceTier;
  label: string;
  description: string;
  icon: typeof Zap;
}[] = [
  {
    id: 'full',
    label: 'Full',
    description: '3D boot intro, full glass blur, ambient particles. Best on a discrete GPU / recent laptop.',
    icon: Sparkles,
  },
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'Skips the 3D intro, keeps glass blur, drops ambient particle fields and extra motion.',
    icon: Gauge,
  },
  {
    id: 'lite',
    label: 'Lite',
    description: 'Flat surfaces (no backdrop blur), minimal motion, no 3D, no particle canvases. Fastest on any hardware.',
    icon: Zap,
  },
];

export default function PerformanceSettings({ isMobile = false }: AppComponentProps) {
  const currentTier = useDeviceTier();
  const shouldReduceMotion = useReducedMotion();
  const [override, setOverride] = useState<DeviceTier | null>(() => getTierOverride());
  const [introResetAt, setIntroResetAt] = useState<number | null>(null);

  useEffect(() => {
    setOverride(getTierOverride());
  }, [currentTier]);

  const handleSelectTier = (tier: DeviceTier) => {
    setTierOverride(tier);
    setOverride(tier);
  };

  const handleUseAutoDetect = () => {
    setTierOverride(null);
    setOverride(null);
  };

  const handleReplayIntro = () => {
    resetIntroSeen();
    setIntroResetAt(Date.now());
  };

  return (
    <div className="relative flex h-full flex-col overflow-y-auto bg-os-bg/72 custom-scrollbar">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/[0.04] via-transparent to-os-accent/[0.04]" />

      <header className={`relative border-b border-os-accent/12 bg-white/[0.055] backdrop-blur-xl saturate-[150%] ${isMobile ? 'px-4 py-4' : 'px-6 py-5 min-[1920px]:px-8 min-[1920px]:py-6'}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-300/[0.08] shadow-lg shadow-black/15">
              <Cpu className="h-4.5 w-4.5 text-cyan-200" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-os-text-sec/72">System</p>
              <h1 className="mt-1 truncate text-xl font-semibold tracking-tight text-os-text-pri min-[1920px]:text-2xl">Performance</h1>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.055] px-3.5 py-2.5 text-right">
            <div className="text-[10px] uppercase tracking-[0.2em] text-os-text-sec/65">Active tier</div>
            <div className="mt-1 text-sm font-semibold capitalize text-os-text-pri">{currentTier}</div>
          </div>
        </div>
      </header>

      <div className={`relative z-10 flex-1 ${isMobile ? 'space-y-4 p-4' : 'space-y-4 p-6 min-[1920px]:space-y-5 min-[1920px]:p-8'}`}>
        <section className={`rounded-3xl border border-white/10 bg-white/[0.045] shadow-xl shadow-black/10 ${isMobile ? 'p-4' : 'p-5'}`}>
          <div className="flex items-start gap-3">
            <MonitorSmartphone className="mt-0.5 h-4 w-4 shrink-0 text-os-text-sec/70" />
            <div>
              <h2 className="text-sm font-semibold text-os-text-pri">Device tier</h2>
              <p className="mt-2 max-w-2xl text-[13px] leading-6 text-os-text-pri/76 min-[1920px]:text-sm">
                ZARAK_OS scales its visual effects to your hardware automatically — the 3D boot intro,
                glass blur, and ambient particle fields are the first things to go on slower machines.
                Override it manually here if the auto-detect gets it wrong, or if you just want the
                fastest possible experience.
              </p>
            </div>
          </div>

          <div className={`mt-5 grid gap-3 ${isMobile ? 'grid-cols-1' : 'sm:grid-cols-3'}`}>
            {TIER_OPTIONS.map((option, index) => {
              const isActive = override ? override === option.id : currentTier === option.id;
              const isAutoSelected = !override && currentTier === option.id;

              return (
                <motion.button
                  key={option.id}
                  type="button"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { delay: index * 0.05, duration: 0.22 }}
                  onClick={() => handleSelectTier(option.id)}
                  className={`group rounded-2xl border p-4 text-left shadow-lg shadow-black/10 transition-[transform,border-color,background-color] duration-150 ease-out motion-reduce:transition-none ${
                    isActive
                      ? 'border-cyan-300/30 bg-cyan-300/[0.07] ring-1 ring-cyan-300/18'
                      : 'border-white/10 bg-white/[0.045] hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.07] motion-reduce:hover:translate-y-0'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                      isActive ? 'border-cyan-300/35 bg-cyan-300/15 text-cyan-100' : 'border-white/12 bg-white/[0.05] text-os-text-sec'
                    }`}>
                      <option.icon className="h-4 w-4" />
                    </div>
                    {isAutoSelected && (
                      <span className="rounded-full border border-white/12 bg-white/[0.06] px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-os-text-sec">
                        Auto
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-os-text-pri">{option.label}</h3>
                  <p className="mt-2 text-xs leading-5 text-os-text-pri/72">{option.description}</p>
                </motion.button>
              );
            })}
          </div>

          {override && (
            <button
              type="button"
              onClick={handleUseAutoDetect}
              className="mt-4 text-xs font-medium text-os-accent underline decoration-os-accent/30 underline-offset-4 transition-colors hover:text-os-accent/80"
            >
              Clear override — use auto-detect ({currentTier})
            </button>
          )}
        </section>

        <section className={`rounded-3xl border border-white/10 bg-white/[0.045] shadow-xl shadow-black/10 ${isMobile ? 'p-4' : 'p-5'}`}>
          <h2 className="text-sm font-semibold text-os-text-pri">Boot intro</h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-os-text-pri/76 min-[1920px]:text-sm">
            The 3D MacBook fly-in plays once every 14 days per browser, then skips straight to login on
            repeat visits. Reset it below to see it again on your next reload (tier permitting).
          </p>
          <button
            type="button"
            onClick={handleReplayIntro}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-os-text-pri transition-colors hover:bg-white/[0.1]"
          >
            <Sparkles className="h-3.5 w-3.5 text-os-accent" />
            <span>Replay intro on next reload</span>
          </button>
          {introResetAt && (
            <p className="mt-2 text-[11px] text-os-text-sec/70">
              Done — reload the page (or press F5) to see the 3D intro again.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
