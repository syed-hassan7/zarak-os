import { ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';
import { motion } from 'motion/react';

export default function VenderScope() {
  return (
    <div className="h-full flex flex-col">
      {/* Browser Chrome */}
      <div className="h-10 bg-os-chrome border-b border-os-border flex items-center px-4 gap-4">
        <div className="flex gap-2 text-os-text-sec">
          <ArrowLeft size={16} />
          <ArrowRight size={16} />
        </div>
        <div className="flex-1 bg-os-bg border border-os-border h-6 rounded px-3 flex items-center">
          <span className="text-os-accent text-[11px]">venderscope.vercel.app</span>
        </div>
        <RotateCw size={14} className="text-os-text-sec" />
      </div>

      {/* Content */}
      <a 
        href="https://venderscope.vercel.app" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex-1 flex flex-col items-center justify-center group relative overflow-hidden"
      >
        <motion.div 
          className="absolute inset-0 border border-os-accent/0 group-hover:border-os-accent/50 transition-colors"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        <div className="bg-os-surface border border-os-border p-8 text-center space-y-4 group-hover:border-os-accent transition-colors">
          <h2 className="text-os-accent text-[18px] font-bold">
            venderscope — continuous vendor risk intelligence
          </h2>
          <p className="text-os-text-sec text-[14px]">
            click anywhere to launch →
          </p>
        </div>

        <div className="mt-8 text-[10px] text-os-text-sec/50 font-mono">
          // EXTERNAL_LINK_DETECTED // REDIRECT_READY
        </div>
      </a>
    </div>
  );
}
