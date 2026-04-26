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
  const dockApps = apps.filter((app) => app.dockVisible);

  return (
    <div className="absolute bottom-5 left-1/2 z-40 -translate-x-1/2">
      <nav
        aria-label="Application dock"
        className="flex items-end gap-2 rounded-[24px] border border-white/14 bg-white/[0.105] px-3 py-2.5 shadow-2xl shadow-black/35 backdrop-blur-2xl ring-1 ring-white/10"
      >
        {dockApps.map((app) => {
          const isOpen = openApps.includes(app.id);
          const isActive = activeApp === app.id;
          const isMinimized = minimizedApps.includes(app.id);

          return (
            <button
              key={app.id}
              type="button"
              title={app.label}
              aria-label={app.label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onToggleApp(app.id)}
              className={`group relative flex h-12 w-12 items-center justify-center rounded-[18px] border transition-all duration-200 motion-reduce:transition-none ${
                isActive
                  ? 'border-white/25 bg-white/18 text-os-text-pri shadow-xl shadow-black/25'
                  : 'border-white/10 bg-white/[0.08] text-os-text-sec hover:-translate-y-1 hover:border-white/22 hover:bg-white/14 hover:text-os-text-pri motion-reduce:hover:translate-y-0'
              } outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg`}
            >
              <app.icon size={22} strokeWidth={1.6} />
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
              <span className="pointer-events-none absolute bottom-full mb-2 max-w-40 rounded-lg border border-white/10 bg-os-bg/88 px-2 py-1 text-[10px] text-os-text-pri opacity-0 shadow-xl backdrop-blur-xl transition-opacity duration-150 group-hover:opacity-100 motion-reduce:transition-none">
                {app.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
