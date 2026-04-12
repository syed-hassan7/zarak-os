import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Milestone, Cpu, Terminal as TerminalIcon, Radar, MessageSquare, FileDown, FileText } from 'lucide-react';
import Taskbar from './Taskbar';
import Window from './Window';
import Terminal from './apps/Terminal';
import Experience from './apps/Experience';
import Skills from './apps/Skills';
import VenderScope from './apps/VenderScope';
import About from './apps/About';
import ContactInfo from './apps/ContactInfo';
import DownloadCV from './apps/DownloadCV';

import { ComponentType } from 'react';

export type AppID = 'experience' | 'skills' | 'terminal' | 'venderscope' | 'about' | 'contact' | 'download-cv';

interface AppConfig {
  id: AppID;
  name: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  component: ComponentType<{ onOpenApp?: (id: AppID) => void; isMobile?: boolean }>;
  defaultOpen?: boolean;
}

const APPS: AppConfig[] = [
  { id: 'experience', name: 'experience.app', icon: Milestone, component: Experience },
  { id: 'skills', name: 'skills.app', icon: Cpu, component: Skills },
  { id: 'terminal', name: 'terminal.app', icon: TerminalIcon, component: Terminal, defaultOpen: true },
  { id: 'venderscope', name: 'venderscope.browser', icon: Radar, component: VenderScope },
  { id: 'contact', name: 'contact.ssh', icon: MessageSquare, component: ContactInfo },
  { id: 'download-cv', name: 'download-my-cv.app', icon: FileDown, component: DownloadCV },
  { id: 'about', name: 'about.txt', icon: FileText, component: About },
];

export default function Desktop(props: { key?: string } = {}) {
  const [openApps, setOpenApps] = useState<AppID[]>(['terminal']);
  const [activeApp, setActiveApp] = useState<AppID | null>('terminal');
  const [minimizedApps, setMinimizedApps] = useState<AppID[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleApp = (id: AppID) => {
    if (openApps.includes(id)) {
      if (activeApp === id) {
        setMinimizedApps(prev => [...prev, id]);
        setActiveApp(null);
      } else {
        setMinimizedApps(prev => prev.filter(a => a !== id));
        setActiveApp(id);
      }
    } else {
      setOpenApps(prev => [...prev, id]);
      setActiveApp(id);
      setMinimizedApps(prev => prev.filter(a => a !== id));
    }
  };

  const closeApp = (id: AppID) => {
    setOpenApps(prev => prev.filter(a => a !== id));
    setMinimizedApps(prev => prev.filter(a => a !== id));
    if (activeApp === id) setActiveApp(null);
  };

  if (isMobile) {
    return (
      <div className="absolute inset-0 bg-os-bg flex flex-col p-4">
        <div className="text-os-text-sec text-[12px] mb-4 border-b border-os-border pb-2">
          // szh_os — best experienced on desktop. terminal mode active.
        </div>
        <div className="flex-1 overflow-hidden border border-os-border">
          <Terminal isMobile />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-transparent overflow-hidden flex flex-col">
      <div className="absolute inset-0 scanlines z-10" />
      
      {/* Desktop Icons */}
      <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full max-w-7xl mx-auto relative z-0 overflow-y-auto custom-scrollbar">
        {APPS.map((app, index) => (
          <motion.button 
            key={app.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 260, damping: 20 }}
            onDoubleClick={() => toggleApp(app.id)}
            onClick={() => toggleApp(app.id)}
            className="flex flex-col items-center gap-2 group w-full aspect-square justify-center hover-glow rounded-lg border border-transparent transition-all duration-200"
          >
            <div className="text-os-accent group-hover:scale-110 transition-transform duration-200">
              <app.icon size={32} strokeWidth={1.5} />
            </div>
            <span className="text-[10px] text-os-text-sec group-hover:text-os-text-pri transition-colors font-mono tracking-tight text-center px-1 wrap-break-word line-clamp-2">
              {app.name}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Windows */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {openApps.map((id, index) => {
            const app = APPS.find(a => a.id === id)!;
            const isMinimized = minimizedApps.includes(id);
            if (isMinimized) return null;

            return (
              <motion.div
                key={id}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 pointer-events-none"
              >
                <Window 
                  id={id}
                  title={app.name}
                  isActive={activeApp === id}
                  onFocus={() => setActiveApp(id)}
                  onClose={() => closeApp(id)}
                  onMinimize={() => toggleApp(id)}
                  zIndex={activeApp === id ? 50 : 20 + index}
                  offset={index * 24}
                >
                  <app.component 
                    onOpenApp={(targetId: AppID) => toggleApp(targetId)} 
                  />
                </Window>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <Taskbar 
        openApps={openApps} 
        activeApp={activeApp} 
        minimizedApps={minimizedApps}
        onToggleApp={toggleApp}
      />
    </div>
  );
}
