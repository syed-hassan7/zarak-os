import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

const LOAD_STEPS = [
  'ALLOCATING_GPU_MEMORY',
  'COMPILING_SHADERS',
  'LOADING_SCENE_GRAPH',
  'INITIALIZING_MATERIALS',
  'BUILDING_GEOMETRY',
  'CONFIGURING_LIGHTS',
  'RENDERING_ENVIRONMENT',
  'BOOTING_DISPLAY',
];

interface SceneLoaderProps {
  onComplete: () => void;
}

/**
 * A dedicated 3D scene loading overlay that shows initialization progress.
 * Styled consistently with the ZARAK_OS boot aesthetic.
 */
export default function SceneLoader({ onComplete }: SceneLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const duration = 3200; // Total load animation duration in ms

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const pct = Math.min((elapsed / duration) * 100, 100);

      setProgress(pct);
      setCurrentStep(Math.min(Math.floor((pct / 100) * LOAD_STEPS.length), LOAD_STEPS.length - 1));

      if (pct < 100) {
        frame = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 bg-os-bg z-9999 flex flex-col items-center justify-center font-mono select-none"
    >
      {/* Top status bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start">
        <div>
          <div className="text-os-accent text-[11px] tracking-[0.3em] font-bold">ZARAK_OS</div>
          <div className="text-os-text-sec/50 text-[9px] tracking-widest mt-1">ENVIRONMENT_LOADER_V1.0</div>
        </div>
        <div className="text-os-text-sec/40 text-[10px] tracking-widest font-mono">
          GPU_INIT
        </div>
      </div>

      {/* Center content */}
      <div className="w-full max-w-md px-8 space-y-8">
        {/* Main title */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-os-accent text-sm tracking-[0.4em] uppercase font-bold"
          >
            Initializing Environment
          </motion.div>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-os-text-sec/60 text-[10px] tracking-[0.2em] uppercase"
          >
            Loading 3D Workspace
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="space-y-3">
          <div className="w-full h-[3px] bg-os-border/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-os-accent to-os-warn"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear', duration: 0.1 }}
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-os-text-sec/60 text-[10px] tracking-widest uppercase">
              {LOAD_STEPS[currentStep]}
            </span>
            <span className="text-os-accent text-[11px] font-bold tracking-wider">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Step indicators */}
        <div className="grid grid-cols-4 gap-2">
          {LOAD_STEPS.map((step, i) => (
            <div
              key={step}
              className={`h-1 rounded-full transition-all duration-300 ${
                i <= currentStep ? 'bg-os-accent' : 'bg-os-border/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom details */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end">
        <div className="text-[9px] text-os-text-sec/30 tracking-widest uppercase space-y-1">
          <div>RENDERER: WebGL2</div>
          <div>SCENE: PROCEDURAL_DESK</div>
        </div>
        <motion.div
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[9px] text-os-accent/60 tracking-widest uppercase"
        >
          ● SYSTEM_ACTIVE
        </motion.div>
      </div>
    </motion.div>
  );
}
