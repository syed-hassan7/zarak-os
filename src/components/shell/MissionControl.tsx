import { Monitor } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { type KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { getAppDefinition } from '../../os/appRegistry';
import type { AppId, WindowLayout } from '../../os/types';

interface MissionControlProps {
  isOpen: boolean;
  openApps: AppId[];
  activeApp: AppId | null;
  minimizedApps: AppId[];
  zOrder: AppId[];
  windowLayouts: Partial<Record<AppId, WindowLayout>>;
  onClose: () => void;
  onFocusApp: (id: AppId) => void;
}

function getOrderedWindows(openApps: AppId[], minimizedApps: AppId[], zOrder: AppId[]) {
  return openApps
    .filter((id) => !minimizedApps.includes(id))
    .sort((a, b) => {
      const aIndex = zOrder.indexOf(a);
      const bIndex = zOrder.indexOf(b);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
}

export default function MissionControl({
  isOpen,
  openApps,
  activeApp,
  minimizedApps,
  zOrder,
  windowLayouts,
  onClose,
  onFocusApp,
}: MissionControlProps) {
  const shouldReduceMotion = useReducedMotion();
  const windows = useMemo(
    () => getOrderedWindows(openApps, minimizedApps, zOrder),
    [minimizedApps, openApps, zOrder],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const activeIndex = activeApp ? windows.indexOf(activeApp) : -1;
    setSelectedIndex(activeIndex >= 0 ? activeIndex : 0);
  }, [activeApp, isOpen, windows]);

  const focusSelectedWindow = () => {
    const appId = windows[selectedIndex];
    if (!appId) return;
    onFocusApp(appId);
    onClose();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (!windows.length) return;

    if (event.key === 'Enter') {
      event.preventDefault();
      focusSelectedWindow();
      return;
    }

    const columnCount = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
    const nextIndex =
      event.key === 'ArrowRight' ? selectedIndex + 1 :
      event.key === 'ArrowLeft' ? selectedIndex - 1 :
      event.key === 'ArrowDown' ? selectedIndex + columnCount :
      event.key === 'ArrowUp' ? selectedIndex - columnCount :
      selectedIndex;

    if (nextIndex !== selectedIndex) {
      event.preventDefault();
      setSelectedIndex(Math.min(Math.max(nextIndex, 0), windows.length - 1));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mission-control-title"
          tabIndex={-1}
          autoFocus
          onKeyDown={handleKeyDown}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
          className="absolute inset-0 z-50 overflow-hidden bg-os-bg/42 px-6 pt-16 pb-28 backdrop-blur-xl outline-none"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.16 }}
        >
          <div className="mx-auto flex h-full max-w-7xl flex-col">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 id="mission-control-title" className="text-sm font-semibold tracking-wide text-os-text-pri">
                  Mission Control
                </h2>
                <p className="mt-1 text-[11px] text-os-text-sec/70">
                  Open windows on this workstation
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-widest text-os-text-sec/55">
                <span>Esc</span>
                <span className="h-1 w-1 rounded-full bg-os-text-sec/35" />
                <span>Enter</span>
              </div>
            </div>

            {windows.length ? (
              <div className="grid flex-1 auto-rows-fr grid-cols-1 gap-5 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3 custom-scrollbar">
                {windows.map((appId, index) => {
                  const app = getAppDefinition(appId);
                  const layout = windowLayouts[appId];
                  const Icon = app.icon;
                  const isSelected = selectedIndex === index;

                  return (
                    <motion.button
                      key={appId}
                      type="button"
                      aria-label={`Focus ${app.label}`}
                      aria-selected={isSelected}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={() => {
                        onFocusApp(appId);
                        onClose();
                      }}
                      className={`group flex min-h-56 flex-col rounded-3xl border p-3 text-left outline-none backdrop-blur-2xl transition-[border-color,box-shadow,transform,background-color] duration-150 motion-reduce:transition-none ${
                        isSelected
                          ? 'border-white/28 bg-white/12 shadow-2xl shadow-black/40 ring-1 ring-os-accent/30'
                          : 'border-white/12 bg-white/7 shadow-xl shadow-black/25 hover:border-white/22 hover:bg-white/10'
                      }`}
                      initial={shouldReduceMotion ? false : { y: 18, scale: 0.96, opacity: 0 }}
                      animate={{ y: 0, scale: 1, opacity: 1 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.18, delay: shouldReduceMotion ? 0 : index * 0.025 }}
                    >
                      <div className="flex items-center justify-between px-1 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-os-text-pri ring-1 ring-white/10">
                            <Icon size={16} strokeWidth={1.7} />
                          </div>
                          <div>
                            <div className="text-[12px] font-medium text-os-text-pri">{app.label}</div>
                            <div className="text-[10px] text-os-text-sec/65">
                              {layout ? `${Math.round(layout.width)} x ${Math.round(layout.height)}` : 'ready'}
                            </div>
                          </div>
                        </div>
                        {activeApp === appId && (
                          <span className="rounded-full bg-os-accent/14 px-2 py-1 text-[9px] uppercase tracking-widest text-os-accent/85">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="relative flex-1 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.13),rgba(255,255,255,0.035))] shadow-inner">
                        <div className="absolute inset-x-0 top-0 h-8 border-b border-white/10 bg-white/8" />
                        <div className="absolute left-4 top-3 flex gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#ED6A5E]/80" />
                          <span className="h-2.5 w-2.5 rounded-full bg-[#F5BF4F]/80" />
                          <span className="h-2.5 w-2.5 rounded-full bg-[#62C554]/80" />
                        </div>
                        <div className="absolute inset-x-5 top-14 space-y-3">
                          <div className="h-3 w-2/3 rounded-full bg-white/14" />
                          <div className="grid grid-cols-3 gap-2">
                            <div className="h-16 rounded-xl bg-white/10" />
                            <div className="h-16 rounded-xl bg-white/8" />
                            <div className="h-16 rounded-xl bg-white/10" />
                          </div>
                          <div className="h-3 w-4/5 rounded-full bg-white/10" />
                          <div className="h-3 w-1/2 rounded-full bg-white/8" />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-os-bg/50 to-transparent" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-3xl border border-white/10 bg-white/6 text-center shadow-2xl shadow-black/25 backdrop-blur-2xl">
                <div>
                  <Monitor className="mx-auto mb-3 h-8 w-8 text-os-text-sec/60" />
                  <div className="text-sm text-os-text-pri">No open windows</div>
                  <div className="mt-1 text-[11px] text-os-text-sec/65">Open an app from the dock or desktop.</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
