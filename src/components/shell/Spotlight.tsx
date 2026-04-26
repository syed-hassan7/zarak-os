import { Search, Terminal as TerminalIcon } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { COMMAND_REGISTRY, type CommandDefinition } from '../../os/commandRegistry';
import { getAppDefinition } from '../../os/appRegistry';
import type { AppId } from '../../os/types';

interface SpotlightProps {
  isOpen: boolean;
  openApps: AppId[];
  minimizedApps: AppId[];
  onClose: () => void;
  onRunCommand: (command: CommandDefinition) => void;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function commandMatches(command: CommandDefinition, query: string): boolean {
  const target = normalize([
    command.label,
    command.detail,
    command.appId,
    ...command.keywords,
  ].join(' '));
  return target.includes(query);
}

function getCommandState(command: CommandDefinition, openApps: AppId[], minimizedApps: AppId[]) {
  if (minimizedApps.includes(command.appId)) return 'Restore';
  if (openApps.includes(command.appId)) return 'Focus';
  return 'Open';
}

function getGroupedResults(results: CommandDefinition[]) {
  return (['Apps', 'Commands'] as const)
    .map((group) => ({
      group,
      commands: results.filter((command) => command.group === group),
    }))
    .filter((section) => section.commands.length > 0);
}

export default function Spotlight({
  isOpen,
  openApps,
  minimizedApps,
  onClose,
  onRunCommand,
}: SpotlightProps) {
  const shouldReduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const normalizedQuery = normalize(query);
  const results = useMemo(() => {
    if (!normalizedQuery) return COMMAND_REGISTRY.slice(0, 8);
    return COMMAND_REGISTRY
      .filter((command) => commandMatches(command, normalizedQuery))
      .slice(0, 8);
  }, [normalizedQuery]);
  const groupedResults = useMemo(() => getGroupedResults(results), [results]);
  const activeCommand = results[selectedIndex];
  const activeOptionId = activeCommand ? `spotlight-option-${activeCommand.id}` : undefined;

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
      return;
    }

    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(focusTimer);
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [normalizedQuery]);

  const runSelectedCommand = () => {
    const command = results[selectedIndex];
    if (!command) return;
    onRunCommand(command);
    onClose();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((current) => Math.min(current + 1, results.length - 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      runSelectedCommand();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-0 z-[60] flex items-start justify-center bg-os-bg/28 px-4 pt-[12vh] backdrop-blur-sm"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.12 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="spotlight-title"
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-os-bg/86 shadow-2xl shadow-black/55 ring-1 ring-os-accent/15 backdrop-blur-2xl"
            initial={shouldReduceMotion ? false : { y: -10, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { y: -8, scale: 0.98, opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 id="spotlight-title" className="sr-only">Spotlight command search</h2>
            <div className="flex h-14 items-center gap-3 border-b border-white/10 px-4">
              <Search size={18} className="text-os-accent/80" />
              <input
                ref={inputRef}
                role="combobox"
                aria-label="Search apps and commands"
                aria-controls="spotlight-results"
                aria-expanded={isOpen}
                aria-activedescendant={activeOptionId}
                aria-autocomplete="list"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search apps and commands..."
                className="h-full flex-1 bg-transparent text-[15px] text-os-text-pri outline-none placeholder:text-os-text-sec/45"
              />
              <div className="hidden sm:flex items-center gap-1 text-[10px] text-os-text-sec/55">
                <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5">ESC</kbd>
              </div>
            </div>

            <div id="spotlight-results" role="listbox" className="max-h-[360px] overflow-y-auto p-2 custom-scrollbar">
              {results.length > 0 ? (
                <div className="space-y-1">
                  {groupedResults.map((section) => (
                    <div key={section.group} role="group" aria-label={section.group}>
                      <div className="px-3 py-1.5 text-[9px] uppercase tracking-[0.24em] text-os-text-sec/45">
                        {section.group}
                      </div>
                      {section.commands.map((command) => {
                        const index = results.findIndex((result) => result.id === command.id);
                        const appState = getCommandState(command, openApps, minimizedApps);
                        const isAppCommand = command.group === 'Apps';
                        const AppIcon = getAppDefinition(command.appId).icon;
                        const isSelected = selectedIndex === index;

                        return (
                          <button
                            id={`spotlight-option-${command.id}`}
                            role="option"
                            aria-selected={isSelected}
                            key={command.id}
                            type="button"
                            onMouseEnter={() => setSelectedIndex(index)}
                            onClick={() => {
                              onRunCommand(command);
                              onClose();
                            }}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left outline-none transition-colors duration-100 motion-reduce:transition-none ${
                              isSelected
                                ? 'bg-os-accent/12 text-os-text-pri ring-1 ring-os-accent/20'
                                : 'text-os-text-sec hover:bg-white/5 hover:text-os-text-pri'
                            }`}
                          >
                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                              isSelected
                                ? 'border-os-accent/35 bg-os-accent/12 text-os-accent'
                                : 'border-white/10 bg-os-chrome/70 text-os-text-sec'
                            }`}>
                              {isAppCommand ? (
                                <AppIcon size={17} strokeWidth={1.7} />
                              ) : (
                                <TerminalIcon size={17} strokeWidth={1.7} />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[13px] font-medium">{command.label}</div>
                              <div className="truncate text-[11px] text-os-text-sec/70">{command.detail}</div>
                            </div>
                            <div className="text-[10px] uppercase tracking-widest text-os-text-sec/55">
                              {appState} app
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <div role="status" className="flex h-32 items-center justify-center text-[12px] text-os-text-sec/65">
                  No command found.
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
