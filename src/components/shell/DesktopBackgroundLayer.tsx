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

      {backgroundId === 'aurora-drift' && (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,11,16,0.88)_0%,rgba(4,6,10,0.94)_100%)]" />
          <AnimatedHalo
            shouldReduceMotion={shouldReduceMotion}
            className="absolute left-[-8%] top-[10%] h-[24rem] w-[40rem] rounded-full bg-cyan-300/14 blur-[140px]"
            duration={22}
            x={['0%', '8%', '0%']}
            y={['0%', '4%', '0%']}
            opacity={[0.3, 0.48, 0.3]}
          />
          <AnimatedHalo
            shouldReduceMotion={shouldReduceMotion}
            className="absolute right-[-12%] top-[18%] h-[24rem] w-[36rem] rounded-full bg-violet-400/14 blur-[150px]"
            duration={20}
            x={['0%', '-8%', '0%']}
            y={['0%', '-3%', '0%']}
            opacity={[0.26, 0.44, 0.26]}
          />
          <motion.div
            className="absolute inset-y-[-10%] left-[24%] w-[18rem] rounded-full bg-cyan-300/6 blur-[110px]"
            animate={shouldReduceMotion ? undefined : { x: ['-2%', '3%', '-2%'], rotate: ['-6deg', '4deg', '-6deg'] }}
            transition={shouldReduceMotion ? undefined : { duration: 24, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-y-[-6%] right-[22%] w-[15rem] rounded-full bg-violet-300/6 blur-[100px]"
            animate={shouldReduceMotion ? undefined : { x: ['2%', '-4%', '2%'], rotate: ['5deg', '-4deg', '5deg'] }}
            transition={shouldReduceMotion ? undefined : { duration: 19, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {backgroundId === 'grid-signal' && (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,9,14,0.9)_0%,rgba(3,5,8,0.97)_100%)]" />
          <div className="absolute inset-0 dot-grid opacity-20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_58%,rgba(45,212,191,0.08),transparent_24%),radial-gradient(circle_at_72%_20%,rgba(192,132,252,0.06),transparent_22%)]" />
          <motion.div
            className="absolute inset-y-0 left-[-18%] w-[28%] bg-[linear-gradient(90deg,transparent_0%,rgba(45,212,191,0.12)_50%,transparent_100%)] blur-2xl"
            animate={shouldReduceMotion ? undefined : { x: ['0%', '340%', '0%'], opacity: [0.18, 0.34, 0.18] }}
            transition={shouldReduceMotion ? undefined : { duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-x-0 top-[22%] h-px bg-gradient-to-r from-transparent via-violet-300/35 to-transparent"
            animate={shouldReduceMotion ? undefined : { opacity: [0.2, 0.65, 0.2], scaleX: [0.92, 1, 0.92] }}
            transition={shouldReduceMotion ? undefined : { duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {backgroundId === 'neon-vault' && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(17,24,39,0.78),rgba(5,7,10,0.97)_55%),linear-gradient(180deg,rgba(7,10,15,0.94)_0%,rgba(3,5,8,0.99)_100%)]" />
          <div className="absolute inset-y-0 left-[13%] w-px bg-gradient-to-b from-transparent via-cyan-300/20 to-transparent" />
          <div className="absolute inset-y-0 right-[14%] w-px bg-gradient-to-b from-transparent via-violet-300/18 to-transparent" />
          <AnimatedHalo
            shouldReduceMotion={shouldReduceMotion}
            className="absolute left-[10%] top-[18%] h-[18rem] w-[18rem] rounded-full bg-cyan-300/10 blur-[110px]"
            duration={17}
            x={['0%', '5%', '0%']}
            y={['0%', '5%', '0%']}
            opacity={[0.22, 0.42, 0.22]}
          />
          <AnimatedHalo
            shouldReduceMotion={shouldReduceMotion}
            className="absolute right-[8%] bottom-[6%] h-[20rem] w-[20rem] rounded-full bg-violet-400/10 blur-[120px]"
            duration={23}
            x={['0%', '-5%', '0%']}
            y={['0%', '-4%', '0%']}
            opacity={[0.2, 0.4, 0.2]}
          />
          <motion.div
            className="absolute inset-x-[18%] top-[14%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={shouldReduceMotion ? undefined : { opacity: [0.18, 0.34, 0.18] }}
            transition={shouldReduceMotion ? undefined : { duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}
    </div>
  );
}
