import { AppWindow, ExternalLink, Github, Linkedin, Mail, Terminal } from 'lucide-react';
import { motion } from 'motion/react';
import { recruiterProfile } from '../../data/recruiterProfile';
import type { AppComponentProps } from '../../os/types';

export default function About({ isMobile = false }: AppComponentProps) {
  const links = [
    { label: 'GitHub', value: 'github.com/darkyzowo', url: 'https://github.com/darkyzowo', icon: Github },
    { label: 'LinkedIn', value: recruiterProfile.linkedIn.handle, url: recruiterProfile.linkedIn.url, icon: Linkedin },
    { label: 'Tool', value: 'venderscope.vercel.app', url: 'https://venderscope.vercel.app', icon: AppWindow },
    { label: 'Email', value: recruiterProfile.email, url: `mailto:${recruiterProfile.email}`, icon: Mail },
  ];

  return (
    <div className="relative flex h-full flex-col overflow-y-auto bg-os-bg/70 font-sans custom-scrollbar">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/[0.04] via-transparent to-os-accent/[0.045]" />

      <div
        className={`relative border-b border-os-accent/12 bg-white/[0.055] backdrop-blur-xl saturate-[150%] ${
          isMobile ? 'px-4 py-5' : 'px-5 py-6 sm:px-8 sm:py-7'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.07] shadow-lg shadow-black/15">
            <Terminal className="h-5 w-5 text-os-accent" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-os-text-sec/75">
              Operator profile
            </p>
            <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-os-text-pri">
              {recruiterProfile.name}
            </h1>
          </div>
        </div>
      </div>

      <div
        className={`relative z-10 flex-1 ${
          isMobile ? 'space-y-5 p-4' : 'space-y-6 p-5 sm:space-y-7 sm:p-8'
        }`}
      >
        <section
          className={`rounded-2xl border border-white/10 bg-white/[0.055] shadow-xl shadow-black/10 ${
            isMobile ? 'p-4' : 'p-5'
          }`}
        >
          <div className={`flex gap-4 ${isMobile ? 'flex-col' : 'items-center justify-between'}`}>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-os-text-sec/60">Signal brief</div>
              <p className="mt-2 text-sm leading-6 text-os-text-pri/84">
                {recruiterProfile.shortIntro}. Current focus: {recruiterProfile.currentRoleSummary}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-os-accent/15 bg-os-accent/[0.06] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-os-accent/90">
                {recruiterProfile.linkedIn.openToWork}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-os-text-sec">
                {recruiterProfile.location.about}
              </span>
            </div>
          </div>
        </section>

        <section
          className={`rounded-2xl border border-white/10 bg-white/[0.055] shadow-xl shadow-black/10 ${
            isMobile ? 'p-4' : 'p-5'
          }`}
        >
          <div className={`mb-5 flex gap-4 ${isMobile ? 'flex-col' : 'items-center justify-between'}`}>
            <h2 className="text-sm font-semibold text-os-text-pri">Identity details</h2>
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-os-text-sec">
              Level zero / read only
            </span>
          </div>
          <div className={`grid gap-4 text-sm ${isMobile ? 'grid-cols-1' : 'sm:grid-cols-[140px_1fr]'}`}>
            <span className="text-xs uppercase tracking-[0.18em] text-os-text-sec/70">Location</span>
            <span className="text-os-text-pri">
              {recruiterProfile.location.about}
              <span className="ml-2 rounded-full bg-os-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-os-accent">
                Open to reloc.
              </span>
            </span>

            <span className="text-xs uppercase tracking-[0.18em] text-os-text-sec/70">Current</span>
            <span className="leading-relaxed text-os-text-pri">
              {recruiterProfile.currentRoleSummary}
              <br />
              <span className="text-os-text-sec">{recruiterProfile.currentStudySummary}</span>
            </span>
          </div>
        </section>

        <section
          className={`rounded-2xl border border-white/10 bg-os-surface/45 shadow-xl shadow-black/10 ${
            isMobile ? 'p-4' : 'p-5'
          }`}
        >
          <h2 className="text-sm font-semibold text-os-text-pri">Objective</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-os-text-pri/82">
            I build things that make compliance less painful and risk more visible.{' '}
            <span className="font-semibold text-os-text-pri">VenderScope</span> replaces annual vendor
            audits with 24/7 threat intelligence. My dissertation is investigating whether diagrams
            actually help auditors understand complex systems — spoiler: they do.
          </p>
          <div className="mt-5 rounded-xl border border-os-accent/15 bg-os-accent/[0.055] px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] text-os-accent/90">
            Available for: GRC roles · InfoSec · client-facing security · freelance
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-os-text-pri">Secure links</h2>
          <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'gap-4 sm:grid-cols-2'}`}>
            {links.map((link, idx) => (
              <motion.a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className={`group transform-gpu rounded-2xl border border-white/10 bg-white/[0.055] shadow-lg shadow-black/10 transition-[transform,background-color,border-color] duration-100 ease-out hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.07] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
                  isMobile ? 'p-3.5' : 'p-4'
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-os-text-sec transition-colors group-hover:text-os-text-pri">
                    <link.icon className="h-4 w-4" />
                    <span className="text-xs font-medium">{link.label}</span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-os-text-sec/60 transition-colors group-hover:text-os-accent" />
                </div>
                <div className="text-sm font-semibold text-os-text-pri">{link.value}</div>
              </motion.a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
