// Shared request-hygiene helpers for the edge functions (api/ask.ts, api/notes.ts).

// Invisible / zero-width / bidi / tag characters that have no legitimate use in
// a short portfolio question or guestbook note but can hide text from a human
// re-read or smuggle instructions to an LLM: C0/C1 controls (except \t \n \r),
// soft hyphen, Arabic letter mark, Hangul/Mongolian fillers, zero-width and
// bidi marks, word-joiner/invisible operators, BOM, and the U+E0000 tag block.
const INVISIBLE_CHARS =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u00AD\u061C\u115F\u1160\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u3164\uFEFF\uFFA0\u{E0000}-\u{E007F}]/gu;

export function stripHiddenCharacters(value: string): string {
  return value.replace(INVISIBLE_CHARS, '');
}

/**
 * Prepares untrusted text for placement inside a `---BEGIN/END ...---` fence
 * in an LLM prompt. Strips hidden characters, collapses all whitespace
 * (including newlines) to single spaces, and shortens any run of 3+ dashes so
 * the text can never form a line that looks like a fence marker.
 */
export function neutralizeForFence(value: string): string {
  return stripHiddenCharacters(value)
    .replace(/\s+/g, ' ')
    .replace(/-{3,}/g, '--')
    .trim();
}

/** Exact media-type match: `text/plain;x=application/json` must not pass. */
export function isJsonContentType(header: string | null): boolean {
  return (header ?? '').split(';')[0].trim().toLowerCase() === 'application/json';
}

export class BodyTooLargeError extends Error {}

/**
 * Reads and parses a JSON request body with a hard size cap, checked against
 * `content-length` first (cheap reject) and then against the actual text
 * (covers chunked requests that send no content-length).
 */
export async function readJsonBody(request: Request, maxBytes: number): Promise<unknown> {
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) throw new BodyTooLargeError();
  const text = await request.text();
  if (text.length > maxBytes) throw new BodyTooLargeError();
  return JSON.parse(text);
}
