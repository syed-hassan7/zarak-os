import { FormEvent, useEffect, useRef, useState } from 'react';
import { Bot, ExternalLink, Send, Sparkles } from 'lucide-react';
import { answerQuestion, STARTER_QUESTIONS } from '../../assistant/answerEngine';
import { ACTION_LABELS, runAssistantAction } from '../../assistant/actions';
import type { AssistantAnswer } from '../../assistant/types';
import { useOS } from '../../os/OSProvider';
import type { AppId } from '../../os/types';
import { isAppId } from '../../os/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  answer?: AssistantAnswer;
}


export default function AskZarak() {
  const { openApp, toggleApp, minimizeApp, state } = useOS();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'intro',
      role: 'assistant',
      content:
        "Ask me about Zarak's background, CV, projects, security/GRC experience, customer-facing work, or how to contact him. I only answer from verified local portfolio data.",
    },
  ]);
  const [streaming, setStreaming] = useState<{ id: string; chars: number } | null>(null);
  const scrollAreaRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastStreamedId = useRef<string | null>(null);

  const hasUserMessages = messages.some((m) => m.role === 'user');

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current !== null) clearInterval(streamIntervalRef.current);
    };
  }, []);

  // Scroll on new messages or streaming progress
  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    try {
      el.scrollTo({ top: el.scrollHeight, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    } catch {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, streaming]);

  // Start typewriter streaming on new assistant answer
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'assistant' || !last.answer || last.answer.status !== 'answered') return;
    if (last.id === lastStreamedId.current) return;

    lastStreamedId.current = last.id;
    if (streamIntervalRef.current !== null) clearInterval(streamIntervalRef.current);

    const body = last.answer.body;
    const id = last.id;
    let chars = 0;

    setStreaming({ id, chars: 0 });

    streamIntervalRef.current = setInterval(() => {
      chars = Math.min(chars + 5, body.length);
      setStreaming({ id, chars });
      if (chars >= body.length) {
        clearInterval(streamIntervalRef.current!);
        streamIntervalRef.current = null;
        setStreaming(null);
      }
    }, 16);
  }, [messages]);

  function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;

    const answer = answerQuestion(trimmed);

    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: 'user', content: trimmed },
      { id: crypto.randomUUID(), role: 'assistant', content: '', answer },
    ]);

    setQuery('');
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    ask(query);
  }

  async function handleAction(action: string) {
    let openedAnotherApp = false;

    await runAssistantAction(action, {
      openApp: (appId) => {
        if (!isAppId(appId)) return;
        const id = appId as AppId;
        if (state.minimizedApps.includes(id)) {
          toggleApp(id);
        } else {
          openApp(id);
        }
        openedAnotherApp = true;
      },
    });

    if (openedAnotherApp) {
      minimizeApp('ask-zarak');
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white/[0.03] text-slate-100">
      <header className="border-b border-white/10 bg-white/[0.045] px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-cyan-200">
              <Bot className="h-4 w-4" />
              syed-llm.app
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Local, source-limited portfolio assistant. No API. No backend. No hallucinated claims.
            </p>
          </div>

        </div>
      </header>

      <main ref={scrollAreaRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-5 custom-scrollbar">
        {hasUserMessages ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {STARTER_QUESTIONS.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => {
                  ask(starter);
                  inputRef.current?.blur();
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-slate-400 transition-[transform,opacity] hover:-translate-y-0.5 hover:border-cyan-300/20 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 motion-reduce:hover:translate-y-0 motion-reduce:transition-none"
              >
                <Sparkles className="h-3 w-3 shrink-0 text-cyan-400/60" />
                {starter}
              </button>
            ))}
          </div>
        ) : (
          <section className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {STARTER_QUESTIONS.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => ask(starter)}
                className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-left text-xs text-slate-300 transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 motion-reduce:hover:translate-y-0 motion-reduce:transition-none"
              >
                <span className="mb-1 flex items-center gap-2 text-cyan-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Suggested
                </span>
                {starter}
              </button>
            ))}
          </section>
        )}

        <section className="space-y-4">
          {messages.map((message, msgIdx) => {
            const isStreamingThis = streaming?.id === message.id;
            const isLast = msgIdx === messages.length - 1;
            const userMsgBefore = messages[msgIdx - 1];
            const displayedBody =
              isStreamingThis && message.answer
                ? message.answer.body.slice(0, streaming!.chars)
                : message.answer?.body ?? '';
            const followUps: string[] =
              isLast && !isStreamingThis && message.answer?.status === 'answered'
                ? (STARTER_QUESTIONS as readonly string[])
                    .filter((q) => q !== userMsgBefore?.content)
                    .slice(0, 2) as string[]
                : [];

            return (
              <article
                key={message.id}
                className={
                  message.role === 'user'
                    ? 'ml-auto max-w-[78%] rounded-2xl bg-cyan-300/12 px-4 py-3 text-sm text-cyan-50'
                    : 'max-w-[88%] rounded-3xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-slate-200 shadow-2xl shadow-black/20'
                }
              >
                {message.role === 'assistant' && message.answer ? (
                  <div className="space-y-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-white">{message.answer.title}</h3>
                        {message.answer.confidence && message.answer.confidence !== 'unknown' && (
                          <span
                            className={`text-[10px] font-mono uppercase tracking-widest ${
                              message.answer.confidence === 'verified'
                                ? 'text-emerald-400/75'
                                : 'text-amber-400/70'
                            }`}
                          >
                            ● {message.answer.confidence}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 whitespace-pre-line leading-6 text-slate-300">
                        {displayedBody}
                        {isStreamingThis && (
                          <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-cyan-400" />
                        )}
                      </p>
                    </div>

                    {!isStreamingThis && message.answer.sources.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {message.answer.sources.map((source) => (
                          <span
                            key={source}
                            className="rounded-full border border-cyan-300/15 bg-cyan-300/8 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-200"
                          >
                            {source}
                          </span>
                        ))}
                      </div>
                    )}

                    {!isStreamingThis && message.answer.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {message.answer.actions.map((action) => (
                          <button
                            key={action}
                            type="button"
                            onClick={() => handleAction(action)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-slate-200 transition-colors hover:bg-white/[0.1] motion-reduce:transition-none"
                          >
                            {ACTION_LABELS[action as keyof typeof ACTION_LABELS] ?? action}
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        ))}
                      </div>
                    )}

                    {followUps.length > 0 && (
                      <div className="mt-1 border-t border-white/8 pt-3">
                        <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                          Try next
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {followUps.map((q) => (
                            <button
                              key={q}
                              type="button"
                              onClick={() => {
                                ask(q);
                                inputRef.current?.blur();
                              }}
                              className="inline-flex items-center gap-1 rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-400 transition-colors hover:border-cyan-300/20 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 motion-reduce:transition-none"
                            >
                              <Sparkles className="h-2.5 w-2.5 text-cyan-400/50" />
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-line leading-6">{message.content}</p>
                )}
              </article>
            );
          })}
        </section>

        <div className="h-4" />
      </main>

      <form onSubmit={onSubmit} className="border-t border-white/10 bg-black/20 p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3">
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ask about Zarak's experience, projects, CV, or contact details..."
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300 text-slate-950 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 motion-reduce:hover:scale-100 motion-reduce:transition-none"
            aria-label="Submit Syed-LLM question"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
