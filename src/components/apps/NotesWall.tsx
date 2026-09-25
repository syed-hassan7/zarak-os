import { useEffect, useMemo, useState } from 'react';
import { Loader2, PenLine, StickyNote } from 'lucide-react';
import { fetchNotes, postNote } from '../../notes/api';
import type { GuestNote } from '../../notes/types';
import type { AppComponentProps } from '../../os/types';

const MAX_BODY_LENGTH = 220;
const MAX_NAME_LENGTH = 24;

// A handful of subtle rotation/accent variants so the wall doesn't look like
// a rigid table — still reads as one coherent "corkboard", not a spreadsheet.
const NOTE_STYLES = [
  { rotate: '-rotate-[1.4deg]', accent: 'border-os-accent/20 bg-os-accent/[0.05]' },
  { rotate: 'rotate-[1deg]', accent: 'border-os-warn/20 bg-os-warn/[0.05]' },
  { rotate: 'rotate-[0.2deg]', accent: 'border-white/12 bg-white/[0.05]' },
  { rotate: '-rotate-[0.6deg]', accent: 'border-os-accent/15 bg-white/[0.045]' },
];

function relativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'error'; message: string };

export default function NotesWall({ isMobile = false }: AppComponentProps) {
  const [notes, setNotes] = useState<GuestNote[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [body, setBody] = useState('');
  const [name, setName] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: 'idle' });
  const [justPostedId, setJustPostedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchNotes().then((result) => {
      if (cancelled) return;
      setNotes(result);
      if (result.length === 0) setLoadFailed(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const remaining = MAX_BODY_LENGTH - body.length;
  const canSubmit = body.trim().length > 0 && remaining >= 0 && submitState.kind !== 'sending';

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitState({ kind: 'sending' });
    const result = await postNote(body.trim(), name.trim() || undefined);

    if (result.status === 'posted') {
      setNotes((current) => [result.note, ...(current ?? [])]);
      setJustPostedId(result.note.id);
      setBody('');
      setName('');
      setSubmitState({ kind: 'idle' });
      window.setTimeout(() => setJustPostedId(null), 2000);
      return;
    }

    if (result.status === 'rejected') {
      setSubmitState({ kind: 'error', message: result.reason });
      return;
    }
    if (result.status === 'rate_limited') {
      setSubmitState({ kind: 'error', message: 'One note per visitor per hour — thanks for stopping by!' });
      return;
    }
    setSubmitState({
      kind: 'error',
      message: "Couldn't post that right now — the guestbook is temporarily unavailable. Try again shortly.",
    });
  }

  const styledNotes = useMemo(
    () => (notes ?? []).map((note, index) => ({ note, style: NOTE_STYLES[index % NOTE_STYLES.length] })),
    [notes],
  );

  return (
    <div className={`flex h-full flex-col overflow-y-auto bg-os-bg/65 custom-scrollbar ${isMobile ? 'p-4' : 'p-7'}`}>
      <header className={`mb-4 rounded-3xl border border-os-accent/12 bg-white/[0.055] shadow-xl shadow-black/10 backdrop-blur-xl saturate-[150%] ${isMobile ? 'p-4' : 'p-5'}`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-os-text-sec/70">Leave a mark</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-os-text-pri">notes.app</h2>
            <p className="mt-1.5 max-w-md text-xs leading-relaxed text-os-text-sec/80">
              A public corkboard — pin a note for anyone who visits after you. Every note is screened before it
              appears; no links, keep it kind.
            </p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-os-accent/20 bg-os-accent/[0.08]">
            <StickyNote className="h-5 w-5 text-os-accent" />
          </div>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className={`mb-5 rounded-3xl border border-white/10 bg-os-surface/45 shadow-xl shadow-black/10 ${isMobile ? 'p-4' : 'p-5'}`}
      >
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-[1fr_auto]'}`}>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Say something for the wall..."
            rows={isMobile ? 3 : 2}
            maxLength={MAX_BODY_LENGTH + 40}
            className="min-w-0 resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-os-text-pri placeholder:text-os-text-sec/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-os-accent/60"
          />
          <div className={`flex gap-3 ${isMobile ? 'flex-row' : 'flex-col justify-between'}`}>
            <input
              value={name}
              onChange={(event) => setName(event.target.value.slice(0, MAX_NAME_LENGTH))}
              placeholder="First name (optional)"
              className={`rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-os-text-pri placeholder:text-os-text-sec/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-os-accent/60 ${isMobile ? 'flex-1' : ''}`}
            />
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-os-accent/20 bg-os-accent px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-os-bg shadow-lg shadow-os-accent/10 transition-[filter,box-shadow] duration-100 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-os-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg motion-reduce:transition-none"
            >
              {submitState.kind === 'sending' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PenLine className="h-4 w-4" />
              )}
              <span>Pin it</span>
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-os-text-sec/60">
          <span>{submitState.kind === 'error' ? <span className="text-os-warn">{submitState.message}</span> : 'Screened automatically — no links, be kind.'}</span>
          <span className={remaining < 0 ? 'text-os-danger' : ''}>{remaining}</span>
        </div>
      </form>

      <div className="flex-1">
        {notes === null && (
          <div className="flex h-40 items-center justify-center gap-2 text-sm text-os-text-sec/60">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading the wall…</span>
          </div>
        )}

        {notes !== null && notes.length === 0 && (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-center text-sm text-os-text-sec/60">
            <StickyNote className="h-6 w-6 text-os-text-sec/40" />
            <span>The wall is empty. Be the first to leave a note.</span>
          </div>
        )}

        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
          {styledNotes.map(({ note, style }) => (
            <div
              key={note.id}
              className={`${style.rotate} ${style.accent} rounded-2xl border p-4 shadow-lg shadow-black/10 transition-transform duration-150 hover:rotate-0 ${
                note.id === justPostedId ? 'ring-2 ring-os-accent/60' : ''
              }`}
            >
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-os-text-pri/90">{note.body}</p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-os-text-sec/55">
                <span>{note.name ?? 'Anonymous'}</span>
                <span>{relativeTime(note.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
