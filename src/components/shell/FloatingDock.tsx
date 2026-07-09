import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { AppDefinition, AppId } from '../../os/types';

interface FloatingDockProps {
  apps: readonly AppDefinition[];
  openApps: AppId[];
  activeApp: AppId | null;
  minimizedApps: AppId[];
  onToggleApp: (id: AppId) => void;
}

export default function FloatingDock({
  apps,
  openApps,
  activeApp,
  minimizedApps,
  onToggleApp,
}: FloatingDockProps) {
  const shouldReduceMotion = useReducedMotion();
  const dockApps = apps.filter((app) => app.dockVisible || openApps.includes(app.id));

  return (
    <div className="absolute bottom-5 left-1/2 z-40 -translate-x-1/2">
      <motion.nav
        layout
        aria-label="Application dock"
        className="flex items-end gap-2 rounded-[24px] border border-white/14 bg-white/[0.105] px-3 py-2.5 shadow-2xl shadow-black/35 backdrop-blur-2xl saturate-[180%] ring-1 ring-white/10 liquid-glass-cyan"
        style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(45,212,191,0.08), 0 20px 60px rgba(0,0,0,0.5)' }}
      >
        <AnimatePresence initial={false}>
          {dockApps.map((app) => {
            const isOpen = openApps.includes(app.id);
            const isActive = activeApp === app.id;
            const isMinimized = minimizedApps.includes(app.id);

            return (
              <motion.button
                key={app.id}
                layout
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                type="button"
                title={app.label}
                aria-label={app.label}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onToggleApp(app.id)}
                className={`group relative flex h-12 w-12 min-[1920px]:h-14 min-[1920px]:w-14 transform-gpu items-center justify-center rounded-[18px] min-[1920px]:rounded-[20px] border transition-[transform,background-color,border-color,color] duration-100 ease-out will-change-transform motion-reduce:transition-none ${
                  isActive
                    ? 'border-white/25 bg-white/18 text-os-text-pri shadow-[0_0_20px_rgba(45,212,191,0.15),0_8px_24px_rgba(0,0,0,0.3)]'
                    : 'border-white/10 bg-white/[0.08] text-os-text-sec hover:-translate-y-1 hover:border-white/22 hover:bg-white/14 hover:text-os-text-pri hover:shadow-[0_0_12px_rgba(45,212,191,0.10)] motion-reduce:hover:translate-y-0'
                } outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg`}
              >
                <app.icon size={24} strokeWidth={1.5} className="min-[1920px]:w-7 min-[1920px]:h-7" />
                {isOpen && (
                  <span
                    className={`absolute -bottom-2 rounded-full ${
                      isActive
                        ? 'h-1.5 w-5 bg-os-text-pri/90'
                        : isMinimized
                          ? 'h-1.5 w-1.5 bg-os-text-sec/50'
                          : 'h-1.5 w-1.5 bg-os-text-pri/75'
                    }`}
                  />
                )}
                <span className="pointer-events-none absolute bottom-full mb-2 max-w-40 rounded-lg border border-white/14 bg-os-bg/95 px-2.5 py-1 text-[11px] text-os-text-pri opacity-0 shadow-lg transition-opacity duration-100 group-hover:opacity-100 motion-reduce:transition-none">
                  {app.label}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}
