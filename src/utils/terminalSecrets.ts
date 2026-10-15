/**
 * Registry of the terminal's hidden (unlisted) commands.
 *
 * Powers three things in terminal.app:
 *  - the `secrets` command: "found N/M" progress with an in-fiction hint per
 *    locked entry (hints never name the command itself),
 *  - the "[secret unlocked]" line the first time one is run,
 *  - Tab completion: a hidden command only becomes completable once found, so
 *    pressing Tab can't be used to enumerate them.
 *
 * `command` must match what Terminal.tsx normalises user input to (lowercase,
 * single-spaced) and must exist as a key in TERMINAL_COMMANDS (src/constants.ts).
 */
export interface TerminalSecret {
  command: string;
  /** Shown while locked. In-universe, points at where a breadcrumb lives. */
  hint: string;
  /** Shown once found. */
  summary: string;
}

export const TERMINAL_SECRETS: readonly TerminalSecret[] = [
  {
    command: 'sudo hire-zarak',
    hint: "a process in the table is always asleep, waiting on a recruiter. 'sudo -l' says who may wake it.",
    summary: 'the offer-letter command. start date: yesterday.',
  },
  {
    command: 'sudo rm -rf /',
    hint: "'sudo -l' lists one command nobody should ever run. the GRC has opinions about it.",
    summary: 'blocked by change-control policy. triggers a glitch.',
  },
  {
    command: 'cat classified.txt',
    hint: "'sudo -l' lists a file you're allowed to read. read it.",
    summary: 'the redacted file. access denied, attempt logged.',
  },
  {
    command: 'decrypt classified.txt',
    hint: 'the classified file claims a cipher, and hints that a stronger tool might read further.',
    summary: 'the redaction was cosmetic, not cryptographic.',
  },
  {
    command: 'override',
    hint: "a root service is listening and advertises no handshake. 'ps' and 'nmap szh_os' both know its name.",
    summary: 'auth-override.svc. escalates privileges, access granted.',
  },
  {
    command: 'cat .env',
    hint: "every operator's first guess. list the hidden files and see what's waiting.",
    summary: 'permission denied. nothing sensitive client-side.',
  },
  {
    command: 'cat .bash_history',
    hint: "dotfiles remember what operators typed. 'ls -a' shows which one.",
    summary: "the operator's shell history, partly redacted.",
  },
];

/**
 * Alias keys in TERMINAL_COMMANDS that exist only so common typing variants
 * work. Hidden from Tab completion so the suggestion list stays clean.
 */
export const UNADVERTISED_ALIASES: ReadonlySet<string> = new Set([
  'nmap localhost',
  'cat /proc/uptime',
  'ls -al',
]);

const STORAGE_KEY = 'zarak_os_terminal_secrets';
const SECRET_COMMANDS: ReadonlySet<string> = new Set(TERMINAL_SECRETS.map((s) => s.command));

export function isSecretCommand(command: string): boolean {
  return SECRET_COMMANDS.has(command);
}

export function loadFoundSecrets(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((c): c is string => typeof c === 'string' && SECRET_COMMANDS.has(c)));
  } catch {
    // localStorage unavailable (private browsing) or corrupted JSON — start fresh.
    return new Set();
  }
}

export function saveFoundSecrets(found: ReadonlySet<string>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...found]));
  } catch {
    /* ignore write failures — progress just won't persist */
  }
}
