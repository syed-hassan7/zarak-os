import { type FormEvent, type KeyboardEvent, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TERMINAL_COMMANDS, TERM_COLORS } from '../../constants';
import { isAppId, type AppId } from '../../os/types';

interface TerminalProps {
  isMobile?: boolean;
  onOpenApp?: (id: AppId) => void;
}

export default function Terminal({ isMobile, onOpenApp }: TerminalProps) {
  const [history, setHistory] = useState<{ text: string; color?: string }[]>([]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (history.length === 0) {
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
      setHistory(prev => [...prev.slice(-90), { text: `Error: Command exceeds maximum length of 100.`, color: 'danger' }]);
      setInput('');
      return;
    }

    const newHistory = [...history.slice(-90), { text: `$ ${cmd}`, color: 'accent' }];
    setCmdHistory(prev => [cmd, ...prev].slice(0, 50));
    setHistoryIndex(-1);

    if (cmd === 'clear') {
      setHistory([]);
    } else if (Object.prototype.hasOwnProperty.call(TERMINAL_COMMANDS, cmd)) {
      const responses = (TERMINAL_COMMANDS as Record<string, { text: string; color?: string; action?: string; target?: string }[]>)[cmd];
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
        { text: "type 'help' for available commands.", color: "muted" }
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
    <div className="flex flex-col h-full bg-os-bg/80 backdrop-blur-md p-4 font-mono text-[13px] overflow-hidden border border-os-border/50">
      <div ref={scrollRef} className="flex-1 overflow-y-auto mb-2 space-y-1 custom-scrollbar">
        <AnimatePresence>
          {history.map((line, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.1 }}
              className={(TERM_COLORS as any)[line?.color || 'secondary'] || 'text-os-text-pri'}
            >
              {line?.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <form onSubmit={handleCommand} className="flex items-center gap-2">
        <span className="text-os-accent">$</span>
        <input 
          autoFocus
          type="text"
          value={input}
          maxLength={100}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-os-text-pri"
        />
      </form>
    </div>
  );
}
