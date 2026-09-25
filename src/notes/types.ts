// Shared shape for a single guestbook note ("notes.app"). Kept intentionally
// tiny: a note is just a short message plus an optional first-name handle.
export interface GuestNote {
  id: string;
  body: string;
  name: string | null;
  createdAt: number;
}

export interface NotesListResponse {
  notes: GuestNote[];
}

export interface PostNoteRequest {
  body: string;
  name?: string;
}

export type PostNoteResponse =
  | { status: 'posted'; note: GuestNote }
  | { status: 'rejected'; reason: string }
  | { status: 'rate_limited' }
  | { status: 'error'; error: string };
