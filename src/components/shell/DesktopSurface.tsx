import { motion, useReducedMotion } from 'motion/react';
import type { AppDefinition, AppId } from '../../os/types';

interface DesktopSurfaceProps {
  apps: readonly AppDefinition[];
  onToggleApp: (id: AppId) => void;
}

export default function DesktopSurface({ apps, onToggleApp }: DesktopSurfaceProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="absolute inset-x-0 top-9 bottom-24 z-0 overflow-y-auto custom-scrollbar">
      <div className="p-7 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full max-w-7xl mx-auto">
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
            className="group flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl border border-transparent outline-none transition-colors duration-100 hover:bg-white/[0.055] focus-visible:border-white/20 focus-visible:ring-2 focus-visible:ring-white/40 motion-reduce:transition-none"
          >
            <div className="flex h-[52px] w-[52px] transform-gpu items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.085] text-os-text-pri shadow-lg shadow-black/15 transition-transform duration-100 ease-out will-change-transform group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
              <app.icon size={28} strokeWidth={1.5} />
            </div>
            <span className="wrap-break-word line-clamp-2 rounded-md bg-os-bg/30 px-1.5 py-0.5 text-center font-mono text-[10px] tracking-tight text-os-text-sec/85 transition-colors duration-100 group-hover:text-os-text-pri motion-reduce:transition-none">
              {app.label}
            </span>
          </motion.button>
        ))}
      </div>
    </main>
  );
}
