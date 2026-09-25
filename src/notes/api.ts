import type { GuestNote, PostNoteResponse } from './types';

const ENDPOINT = '/api/notes';
const TIMEOUT_MS = 12000;

function withTimeout() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return { signal: controller.signal, cancel: () => clearTimeout(timeout) };
}

/** Fetches the current guestbook wall. Returns [] on any failure — the wall
 *  should degrade to "empty" rather than break the app if the API is down. */
export async function fetchNotes(): Promise<GuestNote[]> {
  const { signal, cancel } = withTimeout();
  try {
    const res = await fetch(ENDPOINT, { method: 'GET', signal });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.notes) ? data.notes : [];
  } catch {
    return [];
  } finally {
    cancel();
  }
}

/** Submits a new note. Never throws — network/timeout failures come back as
 *  a normal `{status: 'error', ...}` response so the UI can show one message. */
export async function postNote(body: string, name?: string): Promise<PostNoteResponse> {
  const { signal, cancel } = withTimeout();
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ body, name }),
      signal,
    });

    if (res.status === 429 || res.status === 503 || res.status === 504) {
      const data = await res.json().catch(() => null);
      if (data?.status) return data as PostNoteResponse;
    }

    if (!res.ok) {
      return { status: 'error', error: `http_${res.status}` };
    }

    return (await res.json()) as PostNoteResponse;
  } catch (error) {
    const isAbort = error instanceof Error && error.name === 'AbortError';
    return { status: 'error', error: isAbort ? 'timeout' : 'network_error' };
  } finally {
    cancel();
  }
}
