import type { AssistantAnswer } from './types';

const ENDPOINT = '/api/ask';
// The edge function now makes two sequential upstream Gemini calls per
// request (embed the question, then generate the answer) instead of one —
// see api/ask.ts's EMBED_TIMEOUT_MS + REQUEST_TIMEOUT_MS. This client-side
// budget must exceed their combined worst case (4000 + 9000 = 13000ms) with
// margin, or the client aborts and silently falls back to the local
// keyword-only engine before the server call had a real chance to finish.
const TIMEOUT_MS = 14000;

/**
 * Calls the Gemini-backed /api/ask edge function. Returns null on any
 * failure (network, timeout, missing key, upstream error, malformed
 * response) so callers can fall back to the local `answerQuestion()`
 * engine instantly — the assistant never shows a broken state.
 */
export async function answerQuestionRemote(question: string): Promise<AssistantAnswer | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question }),
      signal: controller.signal,
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data?.status !== 'answered' && data?.status !== 'unknown') return null;
    if (typeof data.title !== 'string' || typeof data.body !== 'string') return null;

    return {
      status: data.status,
      title: data.title,
      body: data.body,
      sources: Array.isArray(data.sources) ? data.sources : [],
      actions: Array.isArray(data.actions) ? data.actions : [],
      matchedEntryIds: Array.isArray(data.matchedEntryIds) ? data.matchedEntryIds : [],
      confidence: data.confidence,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
