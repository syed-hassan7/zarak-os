import { FormEvent, useEffect, useRef, useState } from 'react';
import { Bot, Circle, Send } from 'lucide-react';
import { answerQuestion, STARTER_QUESTIONS } from '../../assistant/answerEngine';
import { ACTION_LABELS, runAssistantAction } from '../../assistant/actions';
import { consumePendingQuery, subscribeToPendingQuery } from '../../assistant/pendingQuery';
import type { AssistantAnswer } from '../../assistant/types';
import { useOS } from '../../os/OSProvider';
import type { AppComponentProps, AppId } from '../../os/types';
import { isAppId } from '../../os/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  answer?: AssistantAnswer;
}

const MOBILE_TOPICS = ['Background', 'Projects', 'CV', 'Contact'];

function renderInlineMarkdown(line: string, keyPrefix: string) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, index) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={`${keyPrefix}-${index}`} className="font-semibold text-os-text-pri">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={`${keyPrefix}-${index}`}>{part}</span>
    ),
  );
}

const PROACTIVE_NUDGES: Partial<Record<AppId, string>> = {
  venderscope: "Noticed venderscope.browser is open — want the technical rundown, or just the pitch?",
  cv: "CV.app is open. Ask me anything it doesn't spell out — happy to go deeper.",
  linkedin: 'linkedin-experience.app is open. Want the short version of the career story?',
  terminal: "terminal.app is open too. I answer the same questions, just without the typing.",
  about: "about.txt open? Ask what he's actually looking for right now.",
};

export default function AskZarak({ isMobile = false }: AppComponentProps) {
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
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastStreamedId = useRef<string | null>(null);
  const hasHandledMountRef = useRef(false);

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

  useEffect(() => {
    if (hasHandledMountRef.current) return;
    hasHandledMountRef.current = true;

    const pendingQuery = consumePendingQuery();
    if (pendingQuery) {
      ask(pendingQuery);
      return;
    }

    const nudgeAppId = state.zOrder
      .filter((id) => id !== 'ask-zarak' && !state.minimizedApps.includes(id))
      .reverse()
      .find((id): id is keyof typeof PROACTIVE_NUDGES => id in PROACTIVE_NUDGES);

    if (!nudgeAppId) return;

    setMessages((current) => [
      ...current,
      { id: 'proactive-nudge', role: 'assistant', content: PROACTIVE_NUDGES[nudgeAppId]! },
    ]);
  }, []);

  // Handles a Spotlight query arriving while this window is already mounted
  // (the mount effect above only fires once, on first open).
  useEffect(() => subscribeToPendingQuery(() => {
    const pendingQuery = consumePendingQuery();
    if (pendingQuery) ask(pendingQuery);
  }), []);

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
    <div className="flex h-full min-h-0 flex-col bg-white/[0.03] text-os-text-pri">
      <header className={`border-b border-os-accent/12 bg-white/[0.055] backdrop-blur-xl saturate-[150%] ${isMobile ? 'px-4 py-3.5' : 'px-5 py-4'}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/[0.07] text-os-accent shadow-lg shadow-black/15">
              <Bot className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.24em] text-os-text-sec/75">Portfolio Assistant</p>
              <div className="mt-0.5 text-sm font-semibold tracking-wide text-os-text-pri">syed-llm.app</div>
            </div>
          </div>
          <div className="hidden items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-os-text-sec/70 sm:flex">
            <Circle size={7} fill="currentColor" className="text-os-accent" />
            <span>local // no api</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-os-text-sec/80">
          No API. No backend. No hallucinated claims — answers pull only from verified local portfolio data.
        </p>
      </header>

      <main
        ref={scrollAreaRef}
        className={`min-h-0 flex-1 overflow-y-auto custom-scrollbar font-mono text-[13px] leading-6 ${isMobile ? 'px-4 py-4' : 'px-5 py-5'}`}
      >
        {!hasUserMessages && (
          <section className="mb-5">
            <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-os-text-sec/50">// suggested queries</div>
            <div className="space-y-1">
              {STARTER_QUESTIONS.map((starter, index) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => ask(starter)}
                  className="block w-full rounded-md px-1.5 py-1 text-left text-os-text-sec transition-colors hover:bg-white/[0.04] hover:text-os-text-pri focus:outline-none focus-visible:ring-2 focus-visible:ring-os-accent/60 motion-reduce:transition-none"
                >
                  <span className="mr-2 text-os-accent/70">[{index + 1}]</span>
                  {starter}
                </button>
              ))}
            </div>
          </section>
        )}

        {!hasUserMessages && isMobile && (
          <section className="mb-5 rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="text-[10px] uppercase tracking-[0.2em] text-os-text-sec/50">// verified coverage</div>
            <p className="mt-2 text-os-text-sec">
              source-limited answers from local portfolio data only. fastest paths:
            </p>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-os-accent/85">
              {MOBILE_TOPICS.map((topic) => (
                <span key={topic}>[{topic.toLowerCase()}]</span>
              ))}
            </div>
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

            if (message.role === 'user') {
              return (
                <div key={message.id} className="text-os-accent">
                  <span className="text-os-text-sec/50">zarak-llm://query&gt;</span> {message.content}
                </div>
              );
            }

            if (message.answer) {
              const bodyLines = displayedBody.split('\n');

              return (
                <div key={message.id} className="space-y-1.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold uppercase tracking-wide text-os-text-pri">
                      &gt; {message.answer.title}
                    </span>
                    {message.answer.confidence && message.answer.confidence !== 'unknown' && (
                      <span
                        className={`text-[10px] uppercase tracking-widest ${
                          message.answer.confidence === 'verified' ? 'text-os-accent/85' : 'text-os-warn/80'
                        }`}
                      >
                        [{message.answer.confidence}]
                      </span>
                    )}
                  </div>
                  <div className="border-t border-white/8" />
                  <div className="text-os-text-pri/85">
                    {bodyLines.map((line, lineIdx) => (
                      <div key={lineIdx}>
                        {line ? <>&gt; {renderInlineMarkdown(line, `${message.id}-${lineIdx}`)}</> : ' '}
                        {isStreamingThis && lineIdx === bodyLines.length - 1 && (
                          <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-blink-caret bg-os-accent" />
                        )}
                      </div>
                    ))}
                  </div>

                  {!isStreamingThis && message.answer.sources.length > 0 && (
                    <div className="text-os-text-sec/70">sources: [{message.answer.sources.join(', ')}]</div>
                  )}

                  {!isStreamingThis && message.answer.actions.length > 0 && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                      {message.answer.actions.map((action) => (
                        <button
                          key={action}
                          type="button"
                          onClick={() => handleAction(action)}
                          className="text-os-accent underline-offset-4 hover:text-os-text-pri hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-os-accent/60 motion-reduce:transition-none"
                        >
                          [{ACTION_LABELS[action as keyof typeof ACTION_LABELS] ?? action}]
                        </button>
                      ))}
                    </div>
                  )}

                  {followUps.length > 0 && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-os-text-sec/70">
                      <span>try:</span>
                      {followUps.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => ask(q)}
                          className="text-os-text-sec underline-offset-4 hover:text-os-text-pri hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-os-accent/60 motion-reduce:transition-none"
                        >
                          [{q}]
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={message.id} className="text-os-text-pri/85">
                {message.content.split('\n').map((line, lineIdx) => (
                  <div key={lineIdx}>{line ? <>&gt; {renderInlineMarkdown(line, `${message.id}-${lineIdx}`)}</> : ' '}</div>
                ))}
              </div>
            );
          })}
        </section>

        <div className="h-4" />
      </main>

      <form
        onSubmit={onSubmit}
        className={`border-t border-white/10 bg-white/[0.035] ${
          isMobile ? 'px-4 pb-[calc(var(--safe-area-bottom)+0.8rem)] pt-3' : 'p-4'
        }`}
      >
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 font-mono text-sm">
          <span className="shrink-0 text-os-accent">zarak-llm://query&gt;</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ask a question..."
            className="min-w-0 flex-1 bg-transparent text-os-text-pri placeholder:text-os-text-sec/45 focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 text-os-accent transition-colors hover:text-os-text-pri focus:outline-none focus-visible:ring-2 focus-visible:ring-os-accent/60 motion-reduce:transition-none"
            aria-label="Submit Syed-LLM question"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
