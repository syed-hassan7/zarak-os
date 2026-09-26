import { ArrowLeft, ArrowRight, Clock3, Coffee, ExternalLink, Lock, RotateCw, Video } from 'lucide-react';
import type { AppComponentProps } from '../../os/types';

const COFFEE_CHAT_URL = 'https://calendly.com/zarak-hassan/coffee-chat';

export default function CoffeeChat({ isMobile = false }: AppComponentProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-os-bg/65">
      <div
        className={`shrink-0 border-b border-os-accent/12 bg-white/[0.055] backdrop-blur-xl saturate-[150%] ${
          isMobile ? 'px-3 py-3' : 'flex h-12 items-center gap-3 px-4'
        }`}
      >
        <div className={`${isMobile ? 'flex items-center gap-2' : 'contents'}`}>
          <div className="flex items-center gap-2 text-os-text-sec/70">
            <button
              type="button"
              aria-label="Back"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/8 bg-white/[0.035]"
            >
              <ArrowLeft size={15} />
            </button>
            <button
              type="button"
              aria-label="Forward"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/8 bg-white/[0.035]"
            >
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-os-bg/55 px-3 py-1.5 shadow-inner shadow-black/10">
            <Lock size={12} className="shrink-0 text-os-accent" />
            <span className="truncate text-[11px] text-os-text-pri/82">calendly.com/zarak-hassan/coffee-chat</span>
          </div>

          <RotateCw size={14} className="shrink-0 text-os-text-sec/70" />
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto custom-scrollbar ${isMobile ? 'p-4' : 'p-7'}`}>
        <div className={`mx-auto flex min-h-full max-w-3xl flex-col ${isMobile ? 'justify-start gap-4' : 'justify-center gap-5'}`}>
          {isMobile && (
            <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-os-text-sec/55">
                    External booking link
                  </p>
                  <h2 className="mt-2 text-lg font-semibold tracking-tight text-os-text-pri">
                    coffee-chat.link
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-os-text-sec">
                    Skip the email back-and-forth — grab 30 minutes directly on the calendar.
                  </p>
                </div>
                <a
                  href={COFFEE_CHAT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-os-accent/20 bg-os-accent px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-os-bg shadow-lg shadow-os-accent/10"
                >
                  <span>Book</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </section>
          )}

          <section className="overflow-hidden rounded-3xl border border-white/10 bg-os-surface/45 shadow-2xl shadow-black/20">
            <div className={`border-b border-white/10 bg-white/[0.035] ${isMobile ? 'px-4 py-3.5' : 'px-5 py-4'}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-os-text-sec/55">Direct booking</p>
                  <h2 className="mt-1 truncate text-lg font-semibold tracking-tight text-os-text-pri">
                    coffee chat — 30 min
                  </h2>
                </div>
                <a
                  href={COFFEE_CHAT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-os-accent/20 bg-os-accent px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-os-bg shadow-lg shadow-os-accent/10 transition-[filter,box-shadow] duration-100 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-os-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg motion-reduce:transition-none"
                >
                  <span>Book a slot</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            <a
              href={COFFEE_CHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`group block outline-none focus-visible:ring-2 focus-visible:ring-os-accent/70 focus-visible:ring-inset ${isMobile ? 'p-4' : 'p-6'}`}
            >
              <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] transition-colors group-hover:border-white/18 ${isMobile ? 'p-5' : 'p-7'}`}>
                <div className="absolute inset-x-0 top-0 h-9 border-b border-white/8 bg-white/[0.035]" />
                <div className="relative mb-9 flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ED6A5E]/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#F5BF4F]/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#62C554]/80" />
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-os-accent/20 bg-os-accent/[0.08] text-os-accent">
                    <Coffee className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-os-text-pri/90">Coffee Chat with Zarak Hassan</span>
                      <span className="rounded-full border border-os-accent/15 bg-os-accent/[0.06] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-os-accent/85">
                        Live calendar
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-os-text-sec/70">
                      A short, no-pressure call — GRC, security, tooling, or a role you're hiring for.
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-white/8 bg-white/[0.035] p-3">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-os-text-sec/55">
                          <Clock3 className="h-3.5 w-3.5" />
                          <span>Duration</span>
                        </div>
                        <div className="mt-1.5 text-xs font-semibold text-os-text-pri">30 minutes</div>
                      </div>
                      <div className="rounded-xl border border-white/8 bg-white/[0.035] p-3">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-os-text-sec/55">
                          <Video className="h-3.5 w-3.5" />
                          <span>Format</span>
                        </div>
                        <div className="mt-1.5 text-xs font-semibold text-os-text-pri">Video call · link on confirm</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative mt-7 flex items-center justify-between border-t border-white/8 pt-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-os-text-sec/55">
                    external link detected
                  </span>
                  <span className="text-xs font-semibold text-os-accent transition-colors group-hover:text-os-text-pri">
                    Open Calendly
                  </span>
                </div>
              </div>
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
