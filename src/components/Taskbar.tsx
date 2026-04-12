import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Wifi, Clock } from 'lucide-react';
import { AppID } from './Desktop';

interface TaskbarProps {
  openApps: AppID[];
  activeApp: AppID | null;
  minimizedApps: AppID[];
  onToggleApp: (id: AppID) => void;
}

export default function Taskbar({ openApps, activeApp, minimizedApps, onToggleApp }: TaskbarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-auto relative z-30">
      <div className="h-14 bg-os-chrome/80 backdrop-blur-md border-t border-os-border/50 flex items-center px-6 justify-between">
        <div className="flex items-center gap-6">
          <button className="flex items-center justify-center gap-2 bg-os-accent text-os-bg px-4 py-1.5 text-[11px] font-bold tracking-widest hover:brightness-110 transition-all rounded-sm">
            <img src="/logo.svg" alt="ZARAK_OS" className="w-3.5 h-3.5 object-contain opacity-90 brightness-0" />
            ZARAK_SYS
          </button>
          
          <div className="flex gap-3">
            {openApps.map(id => (
              <button 
                key={id}
                onClick={() => onToggleApp(id)}
                className={`px-4 py-1.5 text-[10px] font-bold tracking-wider border rounded-sm transition-all ${
                  activeApp === id 
                    ? 'bg-os-accent/10 text-os-accent border-os-accent shadow-[0_0_10px_rgba(45,212,191,0.2)]' 
                    : 'bg-os-surface/50 text-os-text-sec border-os-border/50 hover:border-os-accent/50 hover:text-os-text-pri'
                }`}
              >
                {id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-os-accent/80">
            <Wifi size={14} />
            <span className="text-[10px] font-bold tracking-widest">SECURE_LINK</span>
          </div>
          <div className="flex items-center gap-2 text-os-text-pri text-[12px] font-mono bg-os-surface/50 px-3 py-1 rounded-sm border border-os-border/30">
            <Clock size={14} className="text-os-accent/50" />
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </div>
        </div>
      </div>

      {/* Bottom Strip */}
      <div className="h-5 bg-os-chrome/90 flex items-center px-6 justify-between text-[9px] font-mono border-t border-os-border/20 tracking-widest">
        <div className="text-os-text-sec/50">ZARAK_OS // KERNEL_V2.6.1</div>
        <motion.div 
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-os-text-sec/70"
        >
          SYSTEM_STATUS: <span className="text-os-accent/80">OPERATIONAL</span>
        </motion.div>
        <div className="text-os-accent/40">
          EP: 250 // AUDIT: 50+ // UP: 99.9%
        </div>
      </div>
    </div>
  );
}
