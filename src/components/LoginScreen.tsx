import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Fingerprint, LockKeyhole, ShieldCheck, Wifi } from 'lucide-react';
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(45,212,191,0.18),transparent_26%),radial-gradient(circle_at_82%_12%,rgba(148,163,184,0.10),transparent_24%),linear-gradient(135deg,#08130f_0%,#05070a_46%,#0a0810_100%)]" />
      <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute left-[-18%] top-[16%] h-[42rem] w-[42rem] rounded-full border border-cyan-300/10 bg-cyan-300/[0.035] blur-3xl" />
      <div className="absolute bottom-[-26%] right-[-10%] h-[34rem] w-[34rem] rounded-full border border-white/10 bg-white/[0.025] blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,10,0.08)_0%,rgba(5,7,10,0.34)_54%,rgba(5,7,10,0.82)_100%)]" />

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

      <main className={`relative z-10 flex flex-1 flex-col px-5 ${isMobileExperience ? 'overflow-y-auto overscroll-contain pb-[calc(var(--safe-area-bottom)+1.25rem)] pt-3' : 'pb-10 pt-0'}`}>
        <motion.div
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`${isMobileExperience ? 'mb-4 mt-1 text-center' : 'mb-5 text-center'}`}
        >
          <div
            className={`font-semibold leading-none tracking-normal text-os-text-pri ${
              isMobileExperience ? 'text-[46px]' : 'text-[52px] sm:text-[64px]'
            }`}
          >
            {formattedTime}
          </div>
          <div className={`${isMobileExperience ? 'mt-2 text-[13px]' : 'mt-2 text-xs'} font-medium text-os-text-sec/85`}>
            {formattedDate}
          </div>
        </motion.div>

        <div className={`mx-auto grid w-full gap-5 ${isMobileExperience ? 'max-w-[430px]' : 'max-w-[980px] items-stretch lg:grid-cols-[minmax(0,1fr)_22rem]'}`}>
          <motion.section
            initial={{ y: 22, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
            className={`relative overflow-hidden border border-white/14 bg-white/[0.075] shadow-2xl shadow-black/35 ring-1 ring-white/10 backdrop-blur-2xl ${isMobileExperience ? 'rounded-[28px]' : 'min-h-[20rem] rounded-[30px]'}`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(45,212,191,0.16),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_56%,rgba(45,212,191,0.045))]" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            <div className={`relative z-10 grid h-full gap-5 ${isMobileExperience ? 'p-4' : 'p-5 md:grid-cols-[12rem_1fr]'}`}>
              <div className="flex flex-col gap-3">
                <div className={`relative overflow-hidden border border-white/14 bg-os-bg/50 shadow-2xl shadow-black/30 ${isMobileExperience ? 'mx-auto aspect-square w-24 rounded-[1.7rem]' : 'aspect-[4/5] rounded-[1.8rem]'}`}>
                  <img
                    src="/syed-zarak-hassan.png"
                    alt={recruiterProfile.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_48%,rgba(5,7,10,0.58)_100%)]" />
                  <div className={`absolute border border-os-accent/25 bg-os-bg/84 font-semibold uppercase tracking-[0.16em] text-os-accent backdrop-blur-xl ${isMobileExperience ? 'bottom-2 left-2 rounded-xl px-2.5 py-1 text-[8px]' : 'bottom-3 left-3 rounded-2xl px-3 py-1.5 text-[10px]'}`}>
                    Verified
                  </div>
                </div>

                <div className={`${isMobileExperience ? 'hidden' : ''}`}>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-3.5 py-3">
                    <div className="text-[9px] uppercase tracking-[0.16em] text-os-text-sec/65">Target lanes</div>
                    <div className="mt-1 whitespace-nowrap text-xs font-semibold leading-4 text-os-text-pri">
                      Security + Automation
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${isMobileExperience ? 'text-center' : 'flex flex-col justify-between py-1'}`}>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-os-accent/18 bg-os-accent/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-os-accent">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Portfolio OS
                  </div>
                  <h1 className={`mt-4 font-semibold leading-none tracking-[-0.045em] text-os-text-pri ${isMobileExperience ? 'text-[28px]' : 'whitespace-nowrap text-[clamp(2.15rem,3vw,3.15rem)]'}`}>
                    {recruiterProfile.name}
                  </h1>
                  <p className={`mt-4 max-w-xl text-os-text-pri/82 ${isMobileExperience ? 'text-xs leading-5' : 'text-sm leading-6'}`}>
                    Compliance and information security professional with hands-on GRC across ISO 27001, ISO 9001, Cyber Essentials, vendor risk, endpoint operations, customer assurance, and stakeholder guidance.
                  </p>
                </div>

                <div className={`mt-5 grid grid-cols-3 gap-2 ${isMobileExperience ? 'hidden' : ''}`}>
                  <IdentitySignal label="Lane" value="Security" />
                  <IdentitySignal label="Service" value="Tech Support" />
                  <IdentitySignal label="Proof" value="GRC Ready" />
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ y: 22, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`w-full overflow-hidden border border-white/14 bg-white/[0.085] shadow-2xl shadow-black/35 ring-1 ring-white/10 backdrop-blur-2xl ${isMobileExperience ? 'rounded-[26px]' : 'min-h-[20rem] rounded-[26px]'}`}
          >
            <div className={`${isMobileExperience ? 'space-y-4 px-5 py-5' : 'flex h-full flex-col justify-between gap-5 px-5 py-5'}`}>
              <div>
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-os-text-sec/70">
                  <span>Guest access</span>
                  <Fingerprint className="h-3.5 w-3.5 text-os-accent/80" />
                </div>
                <p className="mt-3 max-w-[18.25rem] text-sm leading-6 text-os-text-pri/78">
                  Portfolio session with CV, projects, and Syed-LLM. Direct contact paths are in scope.
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex h-12 cursor-default items-center gap-3 rounded-2xl border border-white/10 bg-os-bg/42 px-4 shadow-inner shadow-black/15 transition-colors focus-within:border-os-accent/30">
                  <LockKeyhole className="h-4 w-4 shrink-0 text-os-text-sec/75" />
                  <input
                    type="password"
                    value={typed}
                    readOnly
                    placeholder="Guest key provisioned"
                    className="min-w-0 flex-1 select-none bg-transparent text-base font-semibold tracking-[0.26em] text-os-text-pri outline-none placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-os-text-sec/40"
                  />
                  {typed && !isAuthenticating && (
                    <motion.div
                      animate={{ opacity: [1, 0.25, 1] }}
                      transition={{ repeat: Infinity, duration: 1.1 }}
                      className="h-4 w-1 rounded-full bg-os-accent"
                    />
                  )}
                </label>

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
                        <span>Opening session</span>
                        <span className="font-mono">{Math.round(progress)}%</span>
                      </>
                    ) : (
                      <span>Enter ZARAK_OS</span>
                    )}
                  </div>
                </button>
              </div>

              <div className={`${isMobileExperience ? 'hidden' : 'grid grid-cols-3 gap-4 border-t border-white/10 pt-4 text-center'}`}>
                <AccessStat label="Mode" value="Guest" />
                <AccessStat label="Scope" value="Read-only" />
                <AccessStat label="Route" value="Recruiter" />
              </div>
            </div>
          </motion.section>
        </div>
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

function IdentitySignal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-os-bg/30 px-3 py-2 shadow-lg shadow-black/10">
      <div className="text-[8px] font-semibold uppercase tracking-[0.18em] text-os-text-sec/54">
        {label}
      </div>
      <div className="mt-1 truncate text-[11px] font-semibold text-os-text-pri/88">{value}</div>
    </div>
  );
}

function AccessStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[8px] font-semibold uppercase tracking-[0.18em] text-os-text-sec/50">
        {label}
      </div>
      <div className="mt-1 truncate text-[11px] font-semibold text-os-text-pri/82">{value}</div>
    </div>
  );
}
