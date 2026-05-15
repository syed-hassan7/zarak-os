import { motion, useReducedMotion } from 'motion/react';
import type { DesktopBackgroundId } from './desktopBackgroundPresets';

interface DesktopBackgroundLayerProps {
  backgroundId: DesktopBackgroundId;
}

function AnimatedHalo(props: {
  className: string;
  duration: number;
  x: string[];
  y: string[];
  opacity?: number[];
  scale?: number[];
  shouldReduceMotion: boolean;
}) {
  const { className, duration, x, y, opacity = [0.42, 0.58, 0.42], scale = [1, 1.08, 1], shouldReduceMotion } = props;

  return (
    <motion.div
      className={className}
      initial={false}
      animate={
        shouldReduceMotion
          ? undefined
          : {
              x,
              y,
              opacity,
              scale,
            }
      }
      transition={
        shouldReduceMotion
          ? undefined
          : {
              duration,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            }
      }
    />
  );
}

export default function DesktopBackgroundLayer({
  backgroundId,
}: DesktopBackgroundLayerProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {backgroundId === 'shell-default' && (
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,17,23,0.34)_0%,rgba(5,7,10,0)_42%,rgba(5,7,10,0.52)_100%)]" />
      )}

      {backgroundId === 'night-mesh' && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(45,212,191,0.12),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(192,132,252,0.09),transparent_24%),linear-gradient(180deg,rgba(13,17,23,0.92)_0%,rgba(5,7,10,0.86)_52%,rgba(3,5,8,0.96)_100%)]" />
          <AnimatedHalo
            shouldReduceMotion={shouldReduceMotion}
            className="absolute -left-[14%] top-[8%] h-[26rem] w-[26rem] rounded-full bg-cyan-300/10 blur-[120px]"
            duration={18}
            x={['0%', '5%', '0%']}
            y={['0%', '2%', '0%']}
          />
          <AnimatedHalo
            shouldReduceMotion={shouldReduceMotion}
            className="absolute right-[-8%] top-[16%] h-[22rem] w-[22rem] rounded-full bg-violet-400/10 blur-[120px]"
            duration={21}
            x={['0%', '-4%', '0%']}
            y={['0%', '4%', '0%']}
          />
          <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(120deg,transparent_0%,transparent_46%,rgba(125,133,144,0.06)_47%,transparent_49%,transparent_100%)] [background-size:340px_340px]" />
        </>
      )}

    </div>
  );
}
