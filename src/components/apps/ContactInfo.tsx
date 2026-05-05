import { ExternalLink, Linkedin, Mail, MapPin, MessageSquare, ShieldCheck } from 'lucide-react';
import { recruiterProfile } from '../../data/recruiterProfile';
import type { AppComponentProps } from '../../os/types';

export default function ContactInfo({ isMobile = false }: AppComponentProps) {
  return (
    <div className={`flex h-full flex-col overflow-y-auto bg-os-bg/65 custom-scrollbar ${isMobile ? 'p-4' : 'p-4 sm:p-7'}`}>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 sm:gap-5">
        <header className={`rounded-3xl border border-white/10 bg-white/[0.045] shadow-xl shadow-black/10 backdrop-blur-xl ${isMobile ? 'p-4' : 'p-5'}`}>
          <div className={`flex gap-4 ${isMobile ? 'flex-col' : 'items-center justify-between'}`}>
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-os-accent/20 bg-os-accent/[0.08] text-os-accent">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-os-text-sec/70">
                  Communication
                </p>
                <h2 className="mt-1 truncate text-2xl font-semibold tracking-tight text-os-text-pri">
                  Initiate Connection
                </h2>
              </div>
            </div>
            <div className={`rounded-full border border-os-accent/15 bg-os-accent/[0.055] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-os-accent/85 ${isMobile ? 'self-start' : 'hidden sm:block'}`}>
              secure channel
            </div>
          </div>
        </header>

        <section className={`grid flex-1 ${isMobile ? 'grid-cols-1 gap-4' : 'gap-5 lg:grid-cols-[1.2fr_0.8fr]'}`}>
          <div className={`rounded-3xl border border-white/10 bg-os-surface/45 shadow-xl shadow-black/10 ${isMobile ? 'p-4' : 'p-6'}`}>
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-os-text-sec/55">Official email</p>
                <a
                  href={`mailto:${recruiterProfile.email}`}
                  className="mt-2 block break-all text-lg font-semibold text-os-text-pri transition-colors hover:text-os-accent"
                >
                  {recruiterProfile.email}
                </a>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] text-os-text-sec">
                <Mail className="h-4 w-4" />
              </div>
            </div>

            <p className="max-w-xl text-sm leading-7 text-os-text-pri/82">
              Thanks for being interested! My official email is{' '}
              <span className="font-mono text-os-accent">{recruiterProfile.email}</span>. Looking forward
              to getting in touch.
            </p>

            <a
              href={`mailto:${recruiterProfile.email}`}
              className="mt-7 inline-flex items-center gap-2 rounded-xl border border-os-accent/20 bg-os-accent px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-os-bg shadow-lg shadow-os-accent/10 transition-[filter,box-shadow] duration-100 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-os-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg motion-reduce:transition-none"
            >
              <Mail size={16} />
              <span>Send Email</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <aside className={`rounded-3xl border border-white/10 bg-white/[0.045] shadow-xl shadow-black/10 ${isMobile ? 'p-4' : 'p-5'}`}>
            <div className="mb-5 flex items-center gap-2 border-b border-white/10 pb-4">
              <ShieldCheck className="h-4 w-4 text-os-accent" />
              <span className="text-sm font-semibold text-os-text-pri">Connection status</span>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-os-text-sec/55">Channel</div>
                <div className="mt-2 text-sm font-semibold text-os-text-pri">Email</div>
              </div>
              <div className="rounded-2xl border border-os-accent/15 bg-os-accent/[0.055] p-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-os-accent/70">Status</div>
                <div className="mt-2 font-mono text-xs text-os-accent">// secure_channel_established //</div>
              </div>
              <a
                href={recruiterProfile.linkedIn.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl border border-white/8 bg-white/[0.035] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-os-text-sec/55">Alternate route</div>
                    <div className="mt-2 text-sm font-semibold text-os-text-pri">LinkedIn</div>
                    <div className="mt-1 text-xs text-os-text-sec">{recruiterProfile.linkedIn.publicProfile}</div>
                  </div>
                  <Linkedin className="h-4 w-4 text-os-text-sec" />
                </div>
              </a>
              <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-os-text-sec/55">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Location</span>
                </div>
                <div className="mt-2 text-sm font-semibold text-os-text-pri">{recruiterProfile.location.about}</div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
