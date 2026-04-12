import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { User, Terminal, Fingerprint } from 'lucide-react';

export default function LoginScreen(props: { onLogin: () => void; key?: string }) {
  const { onLogin } = props;
  const [time, setTime] = useState(new Date());
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Automated typing loop for dummy credential
  useEffect(() => {
    if (isAuthenticating) return;
    
    let timeoutId: number;
    let currentLength = 0;
    let isDeleting = false;

    const loop = () => {
      if (isDeleting) {
        if (currentLength > 0) {
          currentLength--;
          setTyped('•'.repeat(currentLength));
          timeoutId = window.setTimeout(loop, 40);
        } else {
          isDeleting = false;
          timeoutId = window.setTimeout(loop, 800);
        }
      } else {
        if (currentLength < 16) {
          currentLength++;
          setTyped('•'.repeat(currentLength));
          timeoutId = window.setTimeout(loop, 60 + Math.random() * 80);
        } else {
          isDeleting = true;
          timeoutId = window.setTimeout(loop, 2000);
        }
      }
    };
    
    timeoutId = window.setTimeout(loop, 500);
    
    return () => clearTimeout(timeoutId);
  }, [isAuthenticating]);

  const handleLogin = () => {
    setIsAuthenticating(true);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 8 + 2; 
      if (p >= 100) {
        setProgress(100);
        clearInterval(interval);
        setTimeout(onLogin, 400); // Wait for the 100% completion bar to look nice
      } else {
        setProgress(p);
      }
    }, 40);
  };

  const formattedTime = time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 bg-os-bg z-40 flex flex-col font-mono overflow-hidden"
    >
      {/* Background Animated Gradient / Lights specifically for Login to feel separate and premium */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[50%] -left-[10%] w-[120%] h-[150%] bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.15)_0%,rgba(0,0,0,0)_50%)]" 
        />
        <motion.div 
          animate={{ rotate: -360 }} 
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[50%] -right-[10%] w-[120%] h-[150%] bg-[radial-gradient(ellipse_at_center,rgba(192,132,252,0.1)_0%,rgba(0,0,0,0)_50%)]" 
        />
      </div>

      {/* Top Bar Minimalist */}
      <div className="relative z-10 w-full p-6 flex justify-between items-start">
        <div className="flex gap-4 items-center">
          <div className="w-8 h-8 flex items-center justify-center bg-os-surface/50 rounded-md border border-os-border/50 backdrop-blur-md">
            <img src="/logo.svg" alt="ZARAK_OS Logo" className="w-[18px] h-[18px] object-contain opacity-90" />
          </div>
          <div>
            <div className="text-os-text-pri font-bold tracking-widest text-xs">ZARAK_OS</div>
            <div className="text-os-text-sec text-[10px] tracking-widest uppercase">Kernel_V2.6.1</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-os-text-pri text-xl font-light tracking-[0.2em]">{formattedTime}</div>
          <div className="text-os-text-sec text-[10px] tracking-widest">{time.toLocaleDateString([], { dateStyle: 'long' }).toUpperCase()}</div>
        </div>
      </div>

      {/* Center Layout */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-6">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full max-w-[420px]"
        >
          {/* Glass Card */}
          <div className="bg-os-chrome/30 backdrop-blur-2xl border border-os-border/40 rounded-2xl shadow-2xl shadow-os-accent/5 overflow-hidden">
            {/* Header */}
            <div className="p-8 pb-6 flex flex-col items-center text-center border-b border-os-border/30 bg-linear-to-b from-os-surface/40 to-transparent">
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full border border-os-border/50 bg-os-surface/50 flex items-center justify-center relative z-10 backdrop-blur-sm">
                   <User className="w-8 h-8 text-os-text-pri/80" />
                </div>
                <div className="absolute inset-0 rounded-full border border-os-accent/40 scale-110 animate-pulse" />
              </div>
              <h2 className="text-os-text-pri text-lg font-bold tracking-widest uppercase mb-1">Syed Zarak Hassan</h2>
              <p className="text-os-text-sec text-xs tracking-widest">SYSTEM_ADMINISTRATOR // Level 0</p>
            </div>

            {/* Body */}
            <div className="p-8 space-y-6">
              
              {/* Fake PIN/Password Input */}
              <div className="space-y-2">
                <label className="text-[10px] text-os-text-sec tracking-[0.2em] uppercase flex items-center justify-between">
                  <span>Access Credential</span>
                  <Fingerprint className="w-3 h-3 text-os-accent/70" />
                </label>
                <label className="w-full h-12 bg-os-surface/40 border border-os-border/50 rounded-lg flex items-center px-4 gap-2 cursor-default transition-colors">
                  <Terminal className="w-4 h-4 text-os-text-sec shrink-0" />
                  <input 
                    type="password"
                    value={typed}
                    readOnly
                    disabled={isAuthenticating}
                    placeholder="Awaiting override key..."
                    className="flex-1 bg-transparent border-none outline-none text-os-text-pri tracking-[0.3em] font-bold text-lg w-full placeholder:tracking-normal placeholder:font-normal placeholder:text-sm placeholder:text-os-text-sec/30 pointer-events-none select-none"
                  />
                  {typed && !isAuthenticating && (
                     <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-5 bg-os-accent shrink-0" />
                  )}
                </label>
              </div>

              {/* Action Button */}
              <button 
                onClick={handleLogin}
                disabled={isAuthenticating}
                className="w-full relative group overflow-hidden rounded-lg mt-4 h-14 bg-os-surface border border-os-border hover:border-os-accent/50 transition-colors disabled:cursor-not-allowed"
              >
                {/* Default State */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isAuthenticating ? 'opacity-0' : 'opacity-100'}`}>
                  <span className="text-os-text-pri text-xs font-bold tracking-[0.2em] uppercase group-hover:text-os-accent transition-colors">Initiate Handshake</span>
                </div>

                {/* Authenticating State */}
                <div className={`absolute inset-0 flex items-center justify-between px-6 transition-opacity duration-300 ${isAuthenticating ? 'opacity-100' : 'opacity-0'}`}>
                  <span className="text-os-accent text-[11px] tracking-widest font-bold z-10 mix-blend-difference">DECRYPTING...</span>
                  <span className="text-os-text-pri text-[11px] tracking-widest z-10 mix-blend-difference">{Math.round(progress)}%</span>
                  
                  {/* Progress Fill */}
                  <motion.div 
                    className="absolute inset-y-0 left-0 bg-os-accent"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear", duration: 0.1 }}
                  />
                </div>
              </button>

            </div>
          </div>
          
          <div className="mt-6 flex justify-between items-center px-2">
             <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-os-accent animate-pulse" />
                <span className="text-[9px] text-os-text-sec uppercase tracking-widest">Connection Secure</span>
             </div>
             <span className="text-[9px] text-os-text-sec/50 uppercase tracking-widest font-mono">AES-256 GCM</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom Legal / Details */}
      <div className="relative z-10 w-full p-6 text-[10px] text-os-text-sec/40 tracking-widest flex justify-between uppercase">
        <div>Property of Syed Zarak Hassan</div>
        <div>All rights reserved. 2026.</div>
      </div>
    </motion.div>
  );
}
