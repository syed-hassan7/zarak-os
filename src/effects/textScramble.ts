const SCRAMBLE_CHARS = '!<>-_\\/[]{}=+*^?#01';

/**
 * Returns a version of `original` where characters are progressively
 * replaced with random glyphs based on `progress` (0 = fully scrambled,
 * 1 = fully resolved back to the source text). Whitespace is always
 * preserved so line layout never jumps mid-animation.
 *
 * Pure function, no DOM/timers — callers (Terminal.tsx) own the ticking.
 */
export function scrambleText(original: string, progress: number): string {
  const clamped = Math.min(1, Math.max(0, progress));
  let out = '';
  for (let i = 0; i < original.length; i++) {
    const ch = original[i];
    if (ch === ' ') {
      out += ch;
      continue;
    }
    // Characters resolve roughly left-to-right as progress increases, with
    // per-character jitter so it doesn't read as a mechanical wipe.
    const resolveThreshold = (i / Math.max(1, original.length - 1)) * 0.7 + Math.random() * 0.3;
    out += clamped >= resolveThreshold ? ch : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
  }
  return out;
}
