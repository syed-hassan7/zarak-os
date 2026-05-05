import { motion, useReducedMotion } from 'motion/react';
import { Bot } from 'lucide-react';

interface FloatingAskZarakProps {
  onOpen: () => void;
}

const buttonVariants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.1, y: -5 },
  tap: { scale: 0.94, y: 0 },
};

const ringVariants = {
  rest: { scale: 1, opacity: 0 },
  hover: {
    scale: [1, 1.85],
    opacity: [0.55, 0],
    transition: { duration: 0.52, ease: 'easeOut' as const },
  },
};

export default function FloatingAskZarak({ onOpen }: FloatingAskZarakProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="absolute bottom-5 right-5 z-40">
      <motion.button
        type="button"
        aria-label="Syed-LLM"
        title="Syed-LLM"
        onClick={onOpen}
        variants={shouldReduceMotion ? undefined : buttonVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/[0.08] text-cyan-200 shadow-lg shadow-black/30 backdrop-blur-2xl outline-none ring-1 ring-white/10 hover:border-cyan-300/40 hover:bg-white/[0.13] hover:shadow-xl hover:shadow-cyan-500/15 hover:ring-cyan-300/20 focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg"
      >
        {!shouldReduceMotion && (
          <motion.span
            variants={ringVariants}
            className="absolute inset-0 rounded-full border border-cyan-400/60"
          />
        )}
        <span className="absolute inset-0 rounded-full bg-cyan-400/8 animate-pulse motion-reduce:animate-none" />
        <Bot size={26} strokeWidth={1.5} />
        <span className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-lg border border-white/14 bg-os-bg/95 px-2.5 py-1 text-[11px] text-os-text-pri opacity-0 shadow-lg transition-opacity duration-100 group-hover:opacity-100 motion-reduce:transition-none">
          Syed-LLM
        </span>
      </motion.button>
    </div>
  );
}
