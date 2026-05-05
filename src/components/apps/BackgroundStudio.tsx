import { Check, Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import {
  useDesktopAppearance,
} from '../shell/DesktopAppearance';
import {
  DESKTOP_BACKGROUND_PRESETS,
  type DesktopBackgroundId,
} from '../shell/desktopBackgroundPresets';

function PreviewFrame({ backgroundId }: { backgroundId: DesktopBackgroundId }) {
  if (backgroundId === 'shell-default') {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-[1rem] bg-[linear-gradient(180deg,#091018_0%,#05070A_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,17,23,0.28)_0%,rgba(5,7,10,0)_42%,rgba(5,7,10,0.42)_100%)]" />
        <div className="absolute left-2 top-2 h-8 w-8 rounded-full bg-cyan-300/15 blur-xl" />
        <div className="absolute right-3 top-4 h-6 w-6 rounded-full bg-violet-400/14 blur-lg" />
      </div>
    );
  }

  if (backgroundId === 'night-mesh') {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-[1rem] bg-[linear-gradient(180deg,#0b0f15_0%,#05070A_100%)]">
        <div className="absolute -left-6 top-2 h-16 w-20 rounded-full bg-cyan-300/20 blur-2xl" />
        <div className="absolute right-1 top-4 h-12 w-12 rounded-full bg-violet-400/18 blur-2xl" />
        <div className="absolute inset-x-3 top-3 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      </div>
    );
  }

  if (backgroundId === 'aurora-drift') {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-[1rem] bg-[linear-gradient(180deg,#081019_0%,#05070A_100%)]">
        <div className="absolute -left-3 top-4 h-16 w-24 rounded-full bg-cyan-300/22 blur-2xl" />
        <div className="absolute right-0 top-3 h-16 w-20 rounded-full bg-violet-400/18 blur-2xl" />
        <div className="absolute left-1/3 top-2 h-20 w-8 rounded-full bg-cyan-300/10 blur-xl" />
      </div>
    );
  }

  if (backgroundId === 'grid-signal') {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-[1rem] bg-[linear-gradient(180deg,#07101A_0%,#04070D_100%)]">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(#344155_1px,transparent_1px)] [background-size:12px_12px]" />
        <div className="absolute left-0 top-6 h-8 w-20 bg-cyan-300/18 blur-xl" />
        <div className="absolute inset-x-2 top-5 h-px bg-gradient-to-r from-transparent via-violet-300/40 to-transparent" />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[1rem] bg-[radial-gradient(circle_at_50%_50%,#111925_0%,#05070A_70%)]">
      <div className="absolute left-3 top-2 h-12 w-12 rounded-full bg-cyan-300/16 blur-2xl" />
      <div className="absolute bottom-1 right-2 h-14 w-16 rounded-full bg-violet-400/18 blur-2xl" />
      <div className="absolute inset-y-2 left-4 w-px bg-cyan-300/25" />
      <div className="absolute inset-y-2 right-4 w-px bg-violet-300/22" />
    </div>
  );
}

export default function BackgroundStudio() {
  const { backgroundId, setBackgroundId } = useDesktopAppearance();
  const shouldReduceMotion = useReducedMotion();
  const activePreset = DESKTOP_BACKGROUND_PRESETS.find((preset) => preset.id === backgroundId)!;

  return (
    <div className="relative flex h-full flex-col overflow-y-auto bg-os-bg/72 custom-scrollbar">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/[0.04] via-transparent to-os-accent/[0.04]" />

      <header className="relative border-b border-white/10 bg-white/[0.04] px-6 py-5 backdrop-blur-xl min-[1920px]:px-8 min-[1920px]:py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-300/[0.08] shadow-lg shadow-black/15">
              <ImageIcon className="h-4.5 w-4.5 text-cyan-200" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-os-text-sec/72">Desktop appearance</p>
              <h1 className="mt-1 truncate text-xl font-semibold tracking-tight text-os-text-pri min-[1920px]:text-2xl">Backdrop Studio</h1>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-right">
            <div className="text-[10px] uppercase tracking-[0.2em] text-os-text-sec/65">Active preset</div>
            <div className="mt-1 text-sm font-semibold text-os-text-pri">{activePreset.label}</div>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex-1 space-y-4 p-6 min-[1920px]:space-y-5 min-[1920px]:p-8">
        <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-xl shadow-black/10 min-[1920px]:p-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-os-text-pri">Shell backdrop presets</h2>
            <p className="mt-2 max-w-3xl text-[13px] leading-6 text-os-text-pri/76 min-[1920px]:text-sm">
              Restore the original desktop look or swap in a new shell-only wallpaper. Changes apply instantly here and stay saved in this browser.
            </p>
          </div>

          <div className="rounded-2xl border border-violet-300/12 bg-violet-300/[0.06] px-4 py-3">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-violet-200/85">
              <Sparkles className="h-3.5 w-3.5" />
              Live preview
            </div>
            <div className="mt-2 text-sm font-semibold text-os-text-pri">{activePreset.label}</div>
            <div className="mt-1 text-xs leading-5 text-os-text-sec">
              {activePreset.tagline}. Local-only preference, no scene reloads.
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          {DESKTOP_BACKGROUND_PRESETS.map((preset, index) => {
            const isActive = preset.id === backgroundId;
            const isDefault = preset.id === 'shell-default';

            return (
              <motion.button
                key={preset.id}
                type="button"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={shouldReduceMotion ? { duration: 0 } : { delay: index * 0.05, duration: 0.22 }}
                onClick={() => setBackgroundId(preset.id)}
                className={`group rounded-3xl border p-3.5 text-left shadow-xl shadow-black/10 transition-[transform,border-color,background-color,box-shadow] duration-150 ease-out motion-reduce:transition-none min-[1920px]:p-4 ${
                  isActive
                    ? 'border-cyan-300/30 bg-cyan-300/[0.07] ring-1 ring-cyan-300/18'
                    : 'border-white/10 bg-white/[0.045] hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.07] motion-reduce:hover:translate-y-0'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-os-text-sec/65">{preset.tagline}</div>
                      {isDefault && (
                        <span className="rounded-full border border-white/12 bg-white/[0.06] px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-os-text-sec">
                          Original
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1.5 text-base font-semibold text-os-text-pri min-[1920px]:text-lg">{preset.label}</h3>
                  </div>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                    isActive
                      ? 'border-cyan-300/35 bg-cyan-300/15 text-cyan-100'
                      : 'border-white/12 bg-white/[0.05] text-os-text-sec'
                  }`}>
                    {isActive ? <Check className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                  </div>
                </div>

                <div className="mt-3 h-24 rounded-[1.15rem] border border-white/10 bg-black/20 p-2 min-[1920px]:h-28">
                  <PreviewFrame backgroundId={preset.id} />
                </div>

                <p className="mt-3 text-[13px] leading-5.5 text-os-text-pri/76 min-[1920px]:text-sm min-[1920px]:leading-6">
                  {preset.description}
                </p>
              </motion.button>
            );
          })}
        </section>
      </div>
    </div>
  );
}
