import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Fingerprint, LockKeyhole, ShieldCheck, UserRound, Wifi } from 'lucide-react';
import { recruiterProfile } from '../data/recruiterProfile';

export default function LoginScreen(props: {
  onLogin: () => void;
  key?: string;
  isMobileExperience?: boolean;
}) {
  const { onLogin, isMobileExperience = false } = props;
  const [time, setTime] = useState(new Date());
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticating) return;

    let timeoutId: number;
    let currentLength = 0;
    let isDeleting = false;

    const loop = () => {
      if (isDeleting) {
        if (currentLength > 0) {
          currentLength -= 1;
          setTyped('•'.repeat(currentLength));
          timeoutId = window.setTimeout(loop, 44);
        } else {
          isDeleting = false;
          timeoutId = window.setTimeout(loop, 900);
        }
        return;
      }

      if (currentLength < 16) {
        currentLength += 1;
        setTyped('•'.repeat(currentLength));
        timeoutId = window.setTimeout(loop, 70 + Math.random() * 70);
      } else {
        isDeleting = true;
        timeoutId = window.setTimeout(loop, 2200);
      }
    };

    timeoutId = window.setTimeout(loop, 450);
    return () => window.clearTimeout(timeoutId);
  }, [isAuthenticating]);

  const handleLogin = () => {
    if (isAuthenticating) return;

    setIsAuthenticating(true);
    let nextProgress = 0;
    const interval = window.setInterval(() => {
      nextProgress += Math.random() * 9 + 4;

      if (nextProgress >= 100) {
        setProgress(100);
        window.clearInterval(interval);
        window.setTimeout(onLogin, 360);
        return;
      }

      setProgress(nextProgress);
    }, 42);
  };

  const formattedTime = time.toLocaleTimeString([], {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedDate = time.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.025, filter: 'blur(12px)' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 z-40 flex flex-col overflow-hidden bg-os-bg font-sans"
    >
      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(45,212,191,0.11),transparent_28%,rgba(192,132,252,0.09)_62%,transparent_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12),transparent_42%),linear-gradient(180deg,rgba(5,7,10,0.14),rgba(5,7,10,0.84))]" />
      <div className="absolute inset-0 backdrop-blur-[1px]" />

      <header
        className={`relative z-10 flex items-start justify-between text-os-text-pri ${
          isMobileExperience
            ? 'px-4 pb-3 pt-[calc(var(--safe-area-top)+0.9rem)]'
            : 'p-5'
        }`}
      >
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-2 shadow-lg shadow-black/10 backdrop-blur-2xl">
          <img src="/logo.svg" alt="ZARAK_OS Logo" className="h-5 w-5 object-contain opacity-90" />
          <div>
            <div className="text-[11px] font-semibold tracking-[0.22em]">ZARAK_OS</div>
            <div className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-os-text-sec/75">
              Kernel_V2.6.1
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-os-text-sec/80 shadow-lg shadow-black/10 backdrop-blur-2xl">
          <Wifi className="h-3.5 w-3.5 text-os-accent" />
          <span>Secure link</span>
        </div>
      </header>

      <main
        className={`relative z-10 flex flex-1 flex-col items-center px-5 ${
          isMobileExperience
            ? 'justify-start pb-[calc(var(--safe-area-bottom)+1.5rem)] pt-7'
            : 'justify-center pb-12 pt-2'
        }`}
      >
        <motion.div
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`${isMobileExperience ? 'mb-5 mt-3 text-center' : 'mb-7 text-center'}`}
        >
          <div
            className={`font-semibold leading-none tracking-normal text-os-text-pri ${
              isMobileExperience ? 'text-[48px]' : 'text-[56px] sm:text-[72px]'
            }`}
          >
            {formattedTime}
          </div>
          <div className={`${isMobileExperience ? 'mt-2 text-[13px]' : 'mt-3 text-sm'} font-medium text-os-text-sec/85`}>
            {formattedDate}
          </div>
        </motion.div>

        <motion.section
          initial={{ y: 18, opacity: 0, scale: 0.985 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.22, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          className={`w-full overflow-hidden border border-white/14 bg-white/[0.09] shadow-2xl shadow-black/35 ring-1 ring-white/10 backdrop-blur-2xl ${
            isMobileExperience ? 'max-w-[420px] rounded-[26px]' : 'max-w-[430px] rounded-[28px]'
          }`}
        >
          <div
            className={`flex flex-col items-center border-b border-white/10 bg-white/[0.04] text-center ${
              isMobileExperience ? 'px-6 pb-5 pt-6' : 'px-7 pb-6 pt-7'
            }`}
          >
            <div className="relative mb-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/14 bg-os-bg/38 text-os-text-pri shadow-xl shadow-black/20">
                <UserRound className="h-8 w-8" strokeWidth={1.5} />
              </div>
              <div className="absolute -bottom-1 -right-1 rounded-xl border border-os-accent/25 bg-os-bg/95 p-1.5 text-os-accent shadow-lg shadow-black/20">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-os-text-pri">{recruiterProfile.name}</h1>
            <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-os-text-sec/75">
              System administrator / Level 0
            </p>
          </div>

          <div className={`${isMobileExperience ? 'space-y-4 px-6 py-5' : 'space-y-5 px-7 py-6'}`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-os-text-sec/70">
                <span>Access credential</span>
                <Fingerprint className="h-3.5 w-3.5 text-os-accent/80" />
              </div>
              <label className="flex h-12 cursor-default items-center gap-3 rounded-2xl border border-white/10 bg-os-bg/42 px-4 shadow-inner shadow-black/15 transition-colors focus-within:border-os-accent/30">
                <LockKeyhole className="h-4 w-4 shrink-0 text-os-text-sec/75" />
                <input
                  type="password"
                  value={typed}
                  readOnly
                  placeholder="Awaiting override key..."
                  className="min-w-0 flex-1 select-none bg-transparent text-base font-semibold tracking-[0.26em] text-os-text-pri outline-none placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-os-text-sec/35"
                />
                {typed && !isAuthenticating && (
                  <motion.div
                    animate={{ opacity: [1, 0.25, 1] }}
                    transition={{ repeat: Infinity, duration: 1.1 }}
                    className="h-4 w-1 rounded-full bg-os-accent"
                  />
                )}
              </label>
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={isAuthenticating}
              className="group relative h-[52px] w-full overflow-hidden rounded-2xl border border-os-accent/20 bg-os-accent text-os-bg shadow-lg shadow-os-accent/10 outline-none transition-[filter,box-shadow] duration-100 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-os-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg disabled:cursor-wait disabled:brightness-100 motion-reduce:transition-none"
            >
              <motion.div
                className="absolute inset-y-0 left-0 bg-white/28"
                initial={{ width: '0%' }}
                animate={{ width: isAuthenticating ? `${progress}%` : '0%' }}
                transition={{ ease: 'linear', duration: 0.1 }}
              />
              <div className="relative flex h-full items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.16em]">
                {isAuthenticating ? (
                  <>
                    <span>Unlocking</span>
                    <span className="font-mono">{Math.round(progress)}%</span>
                  </>
                ) : (
                  <span>Unlock Workstation</span>
                )}
              </div>
            </button>
          </div>
        </motion.section>
      </main>

      <footer
        className={`relative z-10 flex items-center justify-between gap-4 uppercase tracking-[0.16em] text-os-text-sec/55 ${
          isMobileExperience
            ? 'px-4 pb-[calc(var(--safe-area-bottom)+0.8rem)] text-[9px]'
            : 'px-5 pb-5 text-[10px]'
        }`}
      >
        <span>Property of {recruiterProfile.name}</span>
        <span className="font-mono">AES-256 GCM</span>
      </footer>
    </motion.div>
  );
}
