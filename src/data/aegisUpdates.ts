export interface AegisUpdateEntry {
  id: string;
  date: string;
  title: string;
  body: string;
}

// Newest first. Every entry here must map to something that actually shipped —
// this is a real changelog feed, not marketing copy. Check git log before
// adding to it.
export const AEGIS_UPDATES: readonly AegisUpdateEntry[] = [
  {
    id: 'update-coffee-chat',
    date: '2026-09-26',
    title: 'coffee-chat.link added',
    body: 'Direct Calendly booking app — skip the email back-and-forth, grab 30 minutes on the calendar.',
  },
  {
    id: 'update-notes-cache-fix',
    date: '2026-09-26',
    title: 'notes.app cache bug fixed',
    body: 'GET /api/notes was serving a stale wall after posting — now reads fresh every time.',
  },
  {
    id: 'update-security-hardening',
    date: '2026-09-25',
    title: 'OWASP + agentic-AI hardening pass',
    body: 'Rate limiting, prompt-injection defenses, a deterministic profanity filter, CSP hardening, and a pdf.js CVE patch.',
  },
  {
    id: 'update-notes-app',
    date: '2026-09-25',
    title: 'notes.app shipped',
    body: 'A public, Gemini-moderated guestbook wall — leave something, it gets moderated, not deleted on a whim.',
  },
  {
    id: 'update-askzarak-grounded',
    date: '2026-09-25',
    title: 'AskZarak grounded in a real backend',
    body: 'Syed-LLM now answers from a live Gemini API with typo-tolerant search, not a static keyword list.',
  },
  {
    id: 'update-v2-design-system',
    date: '2026-09-25',
    title: 'v2 design system overhaul',
    body: 'Tiered glass system, device performance tiers, and boot choreography replaced the old blur-everything approach.',
  },
] as const;
