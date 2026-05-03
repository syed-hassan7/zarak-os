import { useEffect, useRef, useState } from 'react';
import { Activity, Keyboard, PanelsTopLeft, Search, Wifi } from 'lucide-react';

interface MenuBarProps {
  activeAppLabel: string;
  openAppCount: number;
  onOpenSpotlight: () => void;
  onOpenMissionControl: () => void;
}

const QUICK_COMMANDS = [
  { label: 'Spotlight Search', keys: ['⌘', 'K'] },
  { label: 'Mission Control', keys: ['F3'] },
  { label: 'Hide Window', keys: ['⌘', 'H'] },
  { label: 'Close Window', keys: ['⌘', 'Q'] },
] as const;

export default function MenuBar({
  activeAppLabel,
  openAppCount,
  onOpenSpotlight,
  onOpenMissionControl,
}: MenuBarProps) {
  const [time, setTime] = useState(new Date());
  const [isQuickCommandsOpen, setIsQuickCommandsOpen] = useState(false);
  const quickCommandsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isQuickCommandsOpen) return;
    function handleClick(e: MouseEvent) {
      if (quickCommandsRef.current && !quickCommandsRef.current.contains(e.target as Node)) {
        setIsQuickCommandsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isQuickCommandsOpen]);

  return (
    <header className="absolute top-0 left-0 right-0 z-40 h-9 min-[1920px]:h-11 border-b border-white/10 bg-white/[0.075] shadow-sm shadow-black/20 backdrop-blur-2xl">
      <div className="h-full px-4 flex items-center justify-between text-[12px] min-[1920px]:text-[14px] font-mono text-os-text-sec">
        <div className="flex items-center gap-3 min-w-0">
          <button className="flex items-center gap-2 rounded-md px-1.5 py-1 text-os-text-pri font-semibold tracking-widest outline-none transition-colors hover:bg-white/8 hover:text-white focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg motion-reduce:transition-none">
            <img src="/logo.svg" alt="ZARAK_OS" className="w-3.5 h-3.5 object-contain opacity-90" />
            <span>ZARAK_OS</span>
          </button>
          <div className="h-3 w-px bg-white/14" />
          <div className="truncate text-os-text-pri/78">{activeAppLabel}</div>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-os-text-sec/70">
          <div className="flex items-center gap-1.5">
            <Activity size={13} className="text-os-text-sec/80" />
            <span>{openAppCount} PROC</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi size={13} className="text-os-text-sec/80" />
            <span>SECURE_LINK</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 text-os-text-pri/80 tabular-nums">
          <div ref={quickCommandsRef} className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setIsQuickCommandsOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border border-white/18 bg-white/[0.105] px-2.5 py-1 text-[10px] text-os-text-pri/90 shadow-sm shadow-black/15 outline-none transition-colors hover:bg-white/16 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg motion-reduce:transition-none"
            >
              <Keyboard size={12} />
              <span>Quick</span>
            </button>
            {isQuickCommandsOpen && (
              <div className="absolute right-0 top-full mt-2 min-w-[210px] rounded-xl border border-white/14 bg-os-bg/96 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl ring-1 ring-white/8">
                <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-os-text-sec/55">
                  Quick Commands
                </p>
                {QUICK_COMMANDS.map(({ label, keys }) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-1.5">
                    <span className="text-[11px] text-os-text-pri/80">{label}</span>
                    <div className="flex gap-1">
                      {keys.map((k) => (
                        <kbd
                          key={k}
                          className="rounded border border-white/18 bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-mono text-os-text-sec"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenMissionControl}
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/18 bg-white/[0.105] px-2.5 py-1 text-[10px] text-os-text-pri/90 shadow-sm shadow-black/15 outline-none transition-colors hover:bg-white/16 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg motion-reduce:transition-none"
          >
            <PanelsTopLeft size={12} />
            <span>F3</span>
          </button>
          <button
            type="button"
            onClick={onOpenSpotlight}
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/18 bg-white/[0.105] px-2.5 py-1 text-[10px] text-os-text-pri/90 shadow-sm shadow-black/15 outline-none transition-colors hover:bg-white/16 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg motion-reduce:transition-none"
          >
            <Search size={12} />
            <span>CMD K</span>
          </button>
          <span className="hidden md:inline text-os-text-sec/70">
            {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
        </div>
      </div>
    </header>
  );
}
