import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

const BOOT_LINES = [
  { text: "[ OK ] Initializing system architecture...", type: "success" },
  { text: "[ OK ] Loaded compliance.service", type: "success" },
  { text: "[ OK ] Mounted /home/zarak/projects/", type: "success" },
  { text: "[ OK ] Initialised vendor_risk.daemon", type: "success" },
  { text: "[ !! ] 3 vendor reviews pending", type: "warn" },
  { text: "[ OK ] ISO 27001 controls verified", type: "success" },
  { text: "[ OK ] Secured perimeter gateway", type: "success" },
  { text: "[ OK ] Synchronizing encrypted storage clusters", type: "success" },
  { text: "[ OK ] Policy enforcement engine active", type: "success" },
  { text: "[ OK ] Audit logs rotation established", type: "success" },
  { text: "[ OK ] Memory management unit operational", type: "success" },
  { text: "[ OK ] Subsystem handshake complete", type: "success" },
];

export default function BootScreen(props: { onComplete: () => void; key?: string }) {
  const { onComplete } = props;
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [currentLineText, setCurrentLineText] = useState("");
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (visibleLines < BOOT_LINES.length) {
      const line = BOOT_LINES[visibleLines];
      let charIndex = 0;
      const interval = setInterval(() => {
        setCurrentLineText(line.text.substring(0, charIndex + 1));
        charIndex++;
        if (charIndex === line.text.length) {
          clearInterval(interval);
          setTimeout(() => {
            setVisibleLines(prev => prev + 1);
            setCurrentLineText("");
          }, 120);
        }
      }, 18);
      return () => clearInterval(interval);
    } else {
      const timer = setTimeout(() => setIsFinished(true), 800);
      return () => clearTimeout(timer);
    }
  }, [visibleLines]);

  useEffect(() => {
    if (isFinished) {
      const timer = setTimeout(onComplete, 400);
      return () => clearTimeout(timer);
    }
  }, [isFinished, onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={{ opacity: isFinished ? 0 : 1 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 bg-os-bg z-50 flex flex-col p-6 text-[13px] leading-relaxed font-mono"
    >
      <div className="flex justify-between mb-12 border-b border-os-border/30 pb-4">
        <span className="text-os-accent tracking-widest">ZARAK_OS // KERNEL_V2.6.1</span>
        <span className="text-os-text-sec/50">BUILD_ID: 0X8F2A-2026</span>
      </div>

      <div className="flex-1 overflow-hidden space-y-1">
        <AnimatePresence>
          {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
            <motion.div 
              key={i} 
              initial={{ x: -5, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={line.type === 'warn' ? 'text-os-warn' : 'text-os-text-sec'}
            >
              {line.text}
            </motion.div>
          ))}
        </AnimatePresence>
        {visibleLines < BOOT_LINES.length && (
          <div className={BOOT_LINES[visibleLines].type === 'warn' ? 'text-os-warn' : 'text-os-text-sec'}>
            {currentLineText}
            <span className="w-1.5 h-3.5 bg-os-accent inline-block ml-1 animate-pulse" />
          </div>
        )}
        {visibleLines === BOOT_LINES.length && (
          <div className="text-os-text-pri mt-4">
            <span className="text-os-accent">root@zarak_os:</span> login: <span className="w-2 h-4 bg-os-accent inline-block ml-1 cursor-blink" />
          </div>
        )}
      </div>

      <div className="flex justify-between text-[10px] text-os-text-sec/40 mt-auto pt-4 border-t border-os-border/20 tracking-widest">
        <span>LOAD: 100%</span>
        <span>CRC: VERIFIED</span>
        <span>ENCRYPT: AES-256</span>
      </div>
    </motion.div>
  );
}
