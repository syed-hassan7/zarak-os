import { useEffect, useState } from 'react';
import { Activity, PanelsTopLeft, Search, Wifi } from 'lucide-react';

interface MenuBarProps {
  activeAppLabel: string;
  openAppCount: number;
  onOpenSpotlight: () => void;
  onOpenMissionControl: () => void;
}

export default function MenuBar({
  activeAppLabel,
  openAppCount,
  onOpenSpotlight,
  onOpenMissionControl,
}: MenuBarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="absolute top-0 left-0 right-0 z-40 h-9 border-b border-white/10 bg-white/[0.075] shadow-sm shadow-black/20 backdrop-blur-2xl">
      <div className="h-full px-4 flex items-center justify-between text-[11px] font-mono text-os-text-sec">
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
