import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ShieldCheck, Wifi } from 'lucide-react';
import { recruiterProfile } from '../data/recruiterProfile';

/**
 * ZARAK_OS login screen — v2.
 *
 * Design rationale (docs/DESIGN_SYSTEM.md §8): the old screen used a fake
 * self-typing password field + fake progress bar, which is the single most
 * overused "hacker UI" trope. This version replaces it with something the
 * OS can actually justify: a live boot log the recruiter can read (real
 * build/session facts, not lorem), and one honest interaction — the guest
 * lane accepts anything you type, because it's read-only by design, not
 * because it's pretending to check a password. That's a GRC-appropriate
 * joke ("we don't gate the guest lane") instead of hollow security theatre.
 *
 * The brand mark (`os-brand-mark` / `os-brand-wordmark`) shares layoutId
 * with MenuBar so the login → desktop transition has a persistent visual
 * anchor instead of a plain crossfade (design system §8/§11).
 */

const BOOT_LINES = [
  { text: 'zarak_os kernel v2.7 — cold boot', tone: 'muted' as const },
  { text: 'mounting /portfolio... ok', tone: 'muted' as const },
  { text: 'loading recruiter-facing surface layer... ok', tone: 'muted' as const },
  { text: 'session scope: guest / read-only', tone: 'accent' as const },
  { text: 'auth policy: guest lane is unrestricted by design', tone: 'secondary' as const },
  { text: 'no credentials required — this is a portfolio, not a vault', tone: 'secondary' as const },
];

export default function LoginScreen(props: {
  onLogin: () => void;
  key?: string;
  isMobileExperience?: boolean;
}) {
  const { onLogin, isMobileExperience = false } = props;
  const shouldReduceMotion = useReducedMotion();
  const [time, setTime] = useState(new Date());
  const [bootedLineCount, setBootedLineCount] = useState(0);
  const [guestInput, setGuestInput] = useState('');
  const [isEntering, setIsEntering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) {
      setBootedLineCount(BOOT_LINES.length);
      return;
    }
    if (bootedLineCount >= BOOT_LINES.length) return;
    const timeoutId = window.setTimeout(() => {
      setBootedLineCount((count) => count + 1);
    }, 220 + bootedLineCount * 90);
    return () => window.clearTimeout(timeoutId);
  }, [bootedLineCount, shouldReduceMotion]);

  const bootComplete = bootedLineCount >= BOOT_LINES.length;

  useEffect(() => {
    if (bootComplete && !isMobileExperience) {
      inputRef.current?.focus();
    }
  }, [bootComplete, isMobileExperience]);

  const handleEnter = () => {
    if (isEntering) return;
    setIsEntering(true);
    window.setTimeout(onLogin, shouldReduceMotion ? 80 : 420);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleEnter();
    }
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

  const placeholderCopy = useMemo(
    () => (guestInput.length > 0 ? undefined : 'type anything — guest lane accepts all input'),
    [guestInput.length],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 z-40 flex flex-col overflow-hidden bg-os-bg font-sans"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(45,212,191,0.16),transparent_26%),radial-gradient(circle_at_82%_12%,rgba(148,163,184,0.09),transparent_24%),linear-gradient(135deg,#08130f_0%,#05070a_46%,#0a0810_100%)]" />
      <div className="ambient-decorative absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,10,0.08)_0%,rgba(5,7,10,0.34)_54%,rgba(5,7,10,0.82)_100%)]" />

      <header
        className={`relative z-10 flex items-start justify-between text-os-text-pri ${
          isMobileExperience ? 'px-4 pb-3 pt-[calc(var(--safe-area-top)+0.9rem)]' : 'p-5'
        }`}
      >
        <div className="glass-1 flex items-center gap-3 rounded-2xl border border-white/10 px-3 py-2 shadow-lg shadow-black/10">
          <motion.img layoutId="os-brand-mark" src="/logo.svg" alt="ZARAK_OS logo" className="h-5 w-5 object-contain opacity-90" />
          <div>
            <motion.div layoutId="os-brand-wordmark" className="text-[11px] font-semibold tracking-[0.22em]">
              ZARAK_OS
            </motion.div>
            <div className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-os-text-sec/75">Kernel_V2.7</div>
          </div>
        </div>

        <div className="glass-1 flex items-center gap-3 rounded-2xl border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-os-text-sec/80 shadow-lg shadow-black/10">
          <Wifi className="h-3.5 w-3.5 text-os-accent" />
          <span>Guest link</span>
        </div>
      </header>

      <main
        className={`relative z-10 flex flex-1 flex-col px-5 ${
          isMobileExperience ? 'overflow-y-auto overscroll-contain pb-[calc(var(--safe-area-bottom)+1.25rem)] pt-3' : 'pb-10 pt-0'
        }`}
      >
        <motion.div
          initial={shouldReduceMotion ? false : { y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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

        <div
          className={`mx-auto grid w-full gap-5 ${
            isMobileExperience ? 'max-w-[430px]' : 'max-w-[980px] items-stretch lg:grid-cols-[minmax(0,1fr)_23rem]'
          }`}
        >
          {/* ── Boot log panel — replaces the old identity/photo card ── */}
          <motion.section
            initial={shouldReduceMotion ? false : { y: 22, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.16, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`glass-3 relative overflow-hidden shadow-2xl shadow-black/35 ring-1 ring-white/10 ${
              isMobileExperience ? 'rounded-[28px]' : 'min-h-[20rem] rounded-[30px]'
            }`}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            <div className={`relative z-10 flex h-full flex-col ${isMobileExperience ? 'p-4' : 'p-6'}`}>
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-os-text-sec/65">
                <span>Boot sequence</span>
                <span className="font-mono text-os-accent/75">stdout</span>
              </div>

              <div className="mt-4 min-h-[13.25rem] flex-1 space-y-1.5 font-mono text-[12.5px] leading-6">
                {BOOT_LINES.slice(0, bootedLineCount).map((line, index) => (
                  <motion.div
                    key={line.text}
                    initial={shouldReduceMotion ? false : { opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22 }}
                    className={
                      line.tone === 'accent'
                        ? 'text-os-accent'
                        : line.tone === 'secondary'
                          ? 'text-os-text-pri/78'
                          : 'text-os-text-sec/70'
                    }
                  >
                    <span className="text-os-text-sec/40">[{String(index + 1).padStart(2, '0')}]</span>{' '}
                    {line.text}
                  </motion.div>
                ))}
                {bootComplete && (
                  <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pt-2 text-os-text-pri/90"
                  >
                    <span className="text-os-text-sec/40">$</span> ready.
                  </motion.div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                  <div className="text-[8px] uppercase tracking-[0.18em] text-os-text-sec/54">Operator</div>
                  <div className="mt-1 truncate text-[11px] font-semibold text-os-text-pri/88">
                    {recruiterProfile.name}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                  <div className="text-[8px] uppercase tracking-[0.18em] text-os-text-sec/54">Lanes</div>
                  <div className="mt-1 truncate text-[11px] font-semibold text-os-text-pri/88">GRC · FDE · GTM</div>
                </div>
                <div className="rounded-xl border border-os-accent/18 bg-os-accent/[0.06] px-3 py-2">
                  <div className="text-[8px] uppercase tracking-[0.18em] text-os-accent/70">Proof</div>
                  <div className="mt-1 truncate text-[11px] font-semibold text-os-accent">4 CV lanes</div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* ── Guest lane panel — the signature interaction ── */}
          <motion.section
            initial={shouldReduceMotion ? false : { y: 22, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.24, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`glass-2 w-full overflow-hidden shadow-2xl shadow-black/35 ring-1 ring-white/10 ${
              isMobileExperience ? 'rounded-[26px]' : 'min-h-[20rem] rounded-[26px]'
            }`}
          >
            <div className={`${isMobileExperience ? 'space-y-4 px-5 py-5' : 'flex h-full flex-col justify-between gap-5 px-5 py-5'}`}>
              <div>
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-os-text-sec/70">
                  <span>Guest access</span>
                  <ShieldCheck className="h-3.5 w-3.5 text-os-accent/80" />
                </div>
                <p className="mt-3 max-w-[19rem] text-sm leading-6 text-os-text-pri/78">
                  This lane is read-only by design, so it doesn't gate on a password. Type anything below —
                  the guest key is accepted unconditionally.
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-os-bg/42 px-4 shadow-inner shadow-black/15 transition-colors focus-within:border-os-accent/35">
                  <ArrowRight className="h-4 w-4 shrink-0 text-os-text-sec/75" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={guestInput}
                    onChange={(event) => setGuestInput(event.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder={placeholderCopy}
                    disabled={isEntering}
                    autoComplete="off"
                    spellCheck={false}
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-os-text-pri outline-none placeholder:text-[13px] placeholder:font-normal placeholder:text-os-text-sec/45"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleEnter}
                  disabled={isEntering}
                  className="group relative h-[52px] w-full overflow-hidden rounded-2xl border border-os-accent/20 bg-os-accent text-os-bg shadow-lg shadow-os-accent/10 outline-none transition-[filter,box-shadow] duration-100 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-os-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg disabled:cursor-wait disabled:brightness-100 motion-reduce:transition-none"
                >
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-white/25"
                    initial={{ width: '0%' }}
                    animate={{ width: isEntering ? '100%' : '0%' }}
                    transition={{ ease: [0.22, 1, 0.36, 1], duration: shouldReduceMotion ? 0.08 : 0.42 }}
                  />
                  <div className="relative flex h-full items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.16em]">
                    {isEntering ? <span>Opening session</span> : <span>Enter ZARAK_OS</span>}
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
          isMobileExperience ? 'px-4 pb-[calc(var(--safe-area-bottom)+0.8rem)] text-[9px]' : 'px-5 pb-5 text-[10px]'
        }`}
      >
        <span>Property of {recruiterProfile.name}</span>
        <span className="font-mono">read-only // no auth required</span>
      </footer>
    </motion.div>
  );
}

function AccessStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[8px] font-semibold uppercase tracking-[0.18em] text-os-text-sec/50">{label}</div>
      <div className="mt-1 truncate text-[11px] font-semibold text-os-text-pri/82">{value}</div>
    </div>
  );
}
