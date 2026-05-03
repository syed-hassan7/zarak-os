import { motion, useReducedMotion } from 'motion/react';
import type { AppDefinition, AppId } from '../../os/types';

interface DesktopSurfaceProps {
  apps: readonly AppDefinition[];
  onToggleApp: (id: AppId) => void;
}

export default function DesktopSurface({ apps, onToggleApp }: DesktopSurfaceProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="absolute inset-x-0 top-9 min-[1920px]:top-11 bottom-24 z-0 overflow-y-auto custom-scrollbar">
      <div className="p-7 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 w-full max-w-7xl mx-auto">
        {apps.map((app, index) => (
          <motion.button
            key={app.id}
            initial={shouldReduceMotion ? false : { scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { delay: index * 0.035, type: 'spring', stiffness: 260, damping: 22 }
            }
            onDoubleClick={() => onToggleApp(app.id)}
            onClick={() => onToggleApp(app.id)}
            className="group flex aspect-square w-full flex-col items-center justify-center gap-2.5 rounded-2xl border border-transparent outline-none transition-colors duration-100 hover:bg-white/[0.055] focus-visible:border-white/20 focus-visible:ring-2 focus-visible:ring-white/40 motion-reduce:transition-none"
          >
            <div className="flex h-[64px] w-[64px] min-[1920px]:h-20 min-[1920px]:w-20 transform-gpu items-center justify-center rounded-[18px] min-[1920px]:rounded-[22px] border border-white/12 bg-white/[0.09] text-os-text-pri shadow-lg shadow-black/20 transition-transform duration-100 ease-out will-change-transform group-hover:scale-105 group-hover:border-white/20 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
              <app.icon size={32} strokeWidth={1.5} className="min-[1920px]:w-10 min-[1920px]:h-10" />
            </div>
            <span className="wrap-break-word line-clamp-2 rounded-md bg-black/40 px-2 py-0.5 text-center font-mono text-[11px] min-[1920px]:text-[13px] tracking-tight text-os-text-sec transition-colors duration-100 group-hover:text-os-text-pri motion-reduce:transition-none">
              {app.label}
            </span>
          </motion.button>
        ))}
      </div>
    </main>
  );
}
