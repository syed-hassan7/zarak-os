/**
 * Boot intro replay policy — see docs/DESIGN_SYSTEM.md §8.
 *
 * The 3D MacBook fly-in plays once per browser within a TTL window; repeat
 * visitors within that window skip straight to the login screen. A skip
 * affordance is always available regardless of this state (handled by the
 * intro component itself), this module only governs whether it auto-plays.
 */

const STORAGE_KEY = 'zarak_os_intro_seen_at';
const TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

function getWindowObject(): Window | null {
  return typeof window === 'undefined' ? null : window;
}

export function hasSeenIntroRecently(): boolean {
  const win = getWindowObject();
  if (!win) return false;

  try {
    const raw = win.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const seenAt = Number(raw);
    if (!Number.isFinite(seenAt)) return false;
    return Date.now() - seenAt < TTL_MS;
  } catch {
    return false;
  }
}

export function markIntroSeen(): void {
  const win = getWindowObject();
  if (!win) return;
  try {
    win.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* ignore write failures (private browsing, quota) */
  }
}

export function resetIntroSeen(): void {
  const win = getWindowObject();
  if (!win) return;
  try {
    win.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
