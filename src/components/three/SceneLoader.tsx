import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

const LOAD_STEPS = [
  'Preparing workspace',
  'Focusing display',
  'Starting session',
];

interface SceneLoaderProps {
  onComplete: () => void;
}

export default function SceneLoader({ onComplete }: SceneLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const duration = 1650;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const pct = Math.min((elapsed / duration) * 100, 100);

      setProgress(pct);
      setCurrentStep(Math.min(Math.floor((pct / 100) * LOAD_STEPS.length), LOAD_STEPS.length - 1));

      if (pct < 100) {
        frame = requestAnimationFrame(animate);
        return;
      }

      onComplete();
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="fixed inset-0 z-[9999] flex select-none flex-col items-center justify-center overflow-hidden bg-os-bg font-sans"
    >
      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(45,212,191,0.12),transparent_32%,rgba(255,255,255,0.055)_72%,transparent_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12),transparent_44%),linear-gradient(180deg,rgba(5,7,10,0.1),rgba(5,7,10,0.9))]" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-8 text-center">
        <motion.div
          initial={{ y: 10, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/12 bg-white/[0.07] shadow-2xl shadow-black/25 backdrop-blur-2xl"
        >
          <img src="/logo.svg" alt="ZARAK_OS" className="h-8 w-8 object-contain opacity-90" />
        </motion.div>

        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.08, duration: 0.42 }}
          className="text-sm font-semibold tracking-[0.22em] text-os-text-pri"
        >
          ZARAK_OS
        </motion.div>
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.14, duration: 0.42 }}
          className="mt-2 text-[10px] uppercase tracking-[0.2em] text-os-text-sec/70"
        >
          {LOAD_STEPS[currentStep]}
        </motion.div>

        <div className="mt-8 w-full space-y-3">
          <div className="h-1.5 overflow-hidden rounded-full border border-white/10 bg-white/[0.045] shadow-inner shadow-black/20">
            <motion.div
              className="h-full rounded-full bg-os-accent"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear', duration: 0.1 }}
            />
          </div>
          <div className="flex items-center justify-between font-mono text-[10px] text-os-text-sec/55">
            <span>ENVIRONMENT</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
