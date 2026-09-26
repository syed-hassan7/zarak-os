import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, Circle, Terminal as TerminalIcon } from 'lucide-react';
import { FORTUNE_LINES, TERMINAL_COMMANDS, TERM_COLORS } from '../../constants';
import { triggerGlitchPulse } from '../../effects/glitchPulse';
import { triggerMatrixRain } from '../../effects/matrixRain';
import { triggerRadarScan } from '../../effects/radarScan';
import { triggerTerminalOverride } from '../../effects/terminalOverride';
import { scrambleText } from '../../effects/textScramble';
import { isAppId, type AppId } from '../../os/types';

interface TerminalProps {
  isMobile?: boolean;
  onOpenApp?: (id: AppId) => void;
}

type TerminalLine = {
  text: string;
  color?: string;
  action?: string;
  target?: string;
  /** Marks a line for the SCRAMBLE_REVEAL secret effect — see handleCommand. */
  scramble?: boolean;
};

function getLineColor(color?: string): string {
  return (TERM_COLORS as Record<string, string>)[color || 'secondary'] || 'text-os-text-pri';
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

const SCRAMBLE_TICKS = 9;
const SCRAMBLE_TICK_MS = 90;

export default function Terminal({ isMobile, onOpenApp }: TerminalProps) {
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const hasInitializedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionStartRef = useRef<number>(Date.now());
  const scrambleIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      setHistory(TERMINAL_COMMANDS.whoami);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  // Cleanup any in-flight scramble-reveal animation on unmount so it never
  // keeps ticking against an unmounted component.
  useEffect(() => {
    return () => {
      if (scrambleIntervalRef.current) {
        window.clearInterval(scrambleIntervalRef.current);
        scrambleIntervalRef.current = null;
      }
    };
  }, []);

  const startScrambleReveal = (baseIndex: number, responses: TerminalLine[]) => {
    // Re-entrancy guard: a second scramble trigger interrupts and restarts
    // cleanly rather than stacking two intervals against the same lines.
    if (scrambleIntervalRef.current) {
      window.clearInterval(scrambleIntervalRef.current);
      scrambleIntervalRef.current = null;
    }

    const targets = responses
      .map((res, i) => ({ ...res, i }))
      .filter((res) => res.scramble);
    if (targets.length === 0) return;

    const originals = new Map(targets.map((t) => [t.i, t.text]));
    let tick = 0;

    scrambleIntervalRef.current = window.setInterval(() => {
      tick += 1;
      const progress = tick / SCRAMBLE_TICKS;
      setHistory((prev) => {
        const next = [...prev];
        targets.forEach((t) => {
          const idx = baseIndex + t.i;
          const original = originals.get(t.i);
          if (idx < next.length && original !== undefined) {
            next[idx] = {
              ...next[idx],
              text: progress >= 1 ? original : scrambleText(original, progress),
            };
          }
        });
        return next;
      });
      if (tick >= SCRAMBLE_TICKS && scrambleIntervalRef.current) {
        window.clearInterval(scrambleIntervalRef.current);
        scrambleIntervalRef.current = null;
      }
    }, SCRAMBLE_TICK_MS);
  };

  const handleCommand = (e: FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!cmd) return;

    if (cmd.length > 100) {
      setHistory((prev) => [
        ...prev.slice(-90),
        { text: 'Error: Command exceeds maximum length of 100.', color: 'danger' },
      ]);
      setInput('');
      return;
    }

    const newHistory = [...history.slice(-90), { text: `$ ${cmd}`, color: 'accent' }];
    const priorCmdHistory = cmdHistory;
    setCmdHistory((prev) => [cmd, ...prev].slice(0, 50));
    setHistoryIndex(-1);

    if (cmd === 'clear') {
      setHistory([]);
    } else if (Object.prototype.hasOwnProperty.call(TERMINAL_COMMANDS, cmd)) {
      const rawResponses = (TERMINAL_COMMANDS as Record<string, TerminalLine[]>)[cmd];

      // Some responses need runtime-computed text (random pick, real
      // elapsed time, actual session history) that can't live as a static
      // string in constants.ts — expand those here, just before render.
      const responses: TerminalLine[] = rawResponses.flatMap((res): TerminalLine[] => {
        if (res.action === 'FORTUNE') {
          const line = FORTUNE_LINES[Math.floor(Math.random() * FORTUNE_LINES.length)];
          return [{ text: `> ${line}`, color: 'accent' }];
        }
        if (res.action === 'UPTIME') {
          const seconds = Math.max(0, Math.floor((Date.now() - sessionStartRef.current) / 1000));
          const mins = Math.floor(seconds / 60);
          const secs = seconds % 60;
          return [{ text: `uptime: ${mins}m ${secs}s (this session, since page load)`, color: 'secondary' }];
        }
        if (res.action === 'HISTORY') {
          if (priorCmdHistory.length === 0) {
            return [{ text: 'no prior commands this session.', color: 'muted' }];
          }
          return [
            { text: 'session command log:', color: 'accent' },
            ...priorCmdHistory.map((c, i) => ({ text: ` ${i + 1}  ${c}`, color: 'secondary' as const })),
          ];
        }
        return [res];
      });

      responses.forEach((res) => {
        if (res.action === 'OPEN_WINDOW' && onOpenApp) {
          const targetAppId = res.target?.split('.')[0] ?? '';
          if (isAppId(targetAppId)) {
            onOpenApp(targetAppId);
          }
        }
        if (res.action === 'OPEN_URL' && res.target) {
          window.open(res.target, '_blank', 'noopener,noreferrer');
        }
        if (res.action === 'GLITCH') {
          triggerGlitchPulse();
        }
        if (res.action === 'MATRIX') {
          triggerMatrixRain();
        }
        if (res.action === 'RADAR_SCAN') {
          triggerRadarScan();
        }
        if (res.action === 'OVERRIDE') {
          triggerTerminalOverride();
        }
      });

      const hasScrambleReveal = responses.some((res) => res.action === 'SCRAMBLE_REVEAL');
      const reducedMotion = prefersReducedMotion();
      const baseIndex = newHistory.length;

      const initialResponses =
        hasScrambleReveal && !reducedMotion
          ? responses.map((res) => (res.scramble ? { ...res, text: scrambleText(res.text, 0) } : res))
          : responses;

      setHistory([...newHistory, ...initialResponses]);

      if (hasScrambleReveal && !reducedMotion) {
        startScrambleReveal(baseIndex, responses);
      }
    } else {
      setHistory([
        ...newHistory,
        { text: `command not found: ${cmd}`, color: 'danger' },
        { text: "type 'help' for available commands.", color: 'muted' },
      ]);
    }

    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < cmdHistory.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInput(cmdHistory[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(cmdHistory[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-os-bg/65 font-mono text-[13px]">
      {!isMobile && (
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-os-accent/12 bg-white/[0.055] px-4 backdrop-blur-xl saturate-[150%]">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-os-accent/20 bg-os-accent/[0.08] text-os-accent">
              <TerminalIcon size={15} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-[12px] font-semibold text-os-text-pri">terminal.app</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-os-text-sec/55">/home/zarak</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-os-text-sec/55 sm:flex">
            <Circle size={7} fill="currentColor" className="text-os-accent" />
            <span>session active</span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden p-4">
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-os-bg/78 shadow-inner shadow-black/20">
          {isMobile && (
            <div className="border-b border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-os-text-sec/55">Quick commands</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {['help', 'whoami', 'open about.txt'].map((cmd) => (
                  <button
                    key={cmd}
                    type="button"
                    onClick={() => setInput(cmd)}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-os-text-pri/82"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar"
            aria-live="polite"
          >
            <AnimatePresence initial={false}>
              {history.map((line, i) => (
                <motion.div
                  key={`${i}-${line.text}`}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.08 }}
                  className={`min-h-[1.35rem] whitespace-pre-wrap break-words leading-relaxed ${getLineColor(line.color)}`}
                >
                  {line.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <form
            onSubmit={handleCommand}
            className="flex min-h-12 items-center gap-2 border-t border-white/10 bg-white/[0.035] px-4"
          >
            <ChevronRight size={15} className="shrink-0 text-os-accent drop-shadow-[0_0_4px_rgba(45,212,191,0.7)]" />
            <input
              autoFocus={!isMobile}
              type="text"
              value={input}
              maxLength={100}
              spellCheck={false}
              autoCapitalize="none"
              autoComplete="off"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`h-full flex-1 bg-transparent text-os-text-pri caret-os-accent outline-none placeholder:text-os-text-sec/35 ${isMobile ? 'text-base' : ''}`}
              aria-label="Terminal command input"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
