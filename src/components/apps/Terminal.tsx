import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, Circle, Terminal as TerminalIcon } from 'lucide-react';
import { TERMINAL_COMMANDS, TERM_COLORS } from '../../constants';
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
};

function getLineColor(color?: string): string {
  return (TERM_COLORS as Record<string, string>)[color || 'secondary'] || 'text-os-text-pri';
}

export default function Terminal({ isMobile, onOpenApp }: TerminalProps) {
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const hasInitializedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    setCmdHistory((prev) => [cmd, ...prev].slice(0, 50));
    setHistoryIndex(-1);

    if (cmd === 'clear') {
      setHistory([]);
    } else if (Object.prototype.hasOwnProperty.call(TERMINAL_COMMANDS, cmd)) {
      const responses = (TERMINAL_COMMANDS as Record<string, TerminalLine[]>)[cmd];
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
      });
      setHistory([...newHistory, ...responses]);
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
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-white/[0.045] px-4 backdrop-blur-xl">
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
            <ChevronRight size={15} className="shrink-0 text-os-accent" />
            <input
              autoFocus
              type="text"
              value={input}
              maxLength={100}
              spellCheck={false}
              autoCapitalize="none"
              autoComplete="off"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-full flex-1 bg-transparent text-os-text-pri caret-os-accent outline-none placeholder:text-os-text-sec/35"
              aria-label="Terminal command input"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
