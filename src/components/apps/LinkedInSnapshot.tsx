import {
  BriefcaseBusiness,
  ExternalLink,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { AppComponentProps } from '../../os/types';
import {
  certifications,
  educationHistory,
  linkedInCurrentRole,
  linkedInExperience,
  linkedInTopSkills,
  recruiterProfile,
} from '../../data/recruiterProfile';

function companyInitials(company: string): string {
  const words = company.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

const COMPANY_BADGE_COLORS: Record<string, string> = {
  Thrive: 'from-[#0a66c2] to-[#2DD4BF]',
  'Nexique Design Labs': 'from-[#C084FC] to-[#0a66c2]',
  'Latoon Music': 'from-[#F5BF4F] to-[#F87171]',
};

function badgeGradient(company: string): string {
  return COMPANY_BADGE_COLORS[company] ?? 'from-os-accent to-[#0a66c2]';
}

export default function LinkedInSnapshot({ isMobile = false }: AppComponentProps) {
  return (
    <div className="relative flex h-full flex-col overflow-y-auto bg-os-bg/70 custom-scrollbar">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-[#0a66c2]/[0.10] via-transparent to-os-accent/[0.06]" />

      <div className={`relative z-10 flex-1 ${isMobile ? 'p-4' : 'p-4 sm:p-7'}`}>
        <div className={`mx-auto flex max-w-6xl flex-col ${isMobile ? 'gap-4' : 'gap-5'}`}>
          <header className="overflow-hidden rounded-3xl border border-os-accent/12 bg-white/[0.055] shadow-xl shadow-black/10 backdrop-blur-xl saturate-[150%]">
            <div className={`relative z-0 overflow-hidden ${isMobile ? 'h-20' : 'h-28'}`}>
              <motion.div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(120deg, rgba(10,102,194,0.72), rgba(0,119,181,0.52), rgba(45,212,191,0.32), rgba(10,102,194,0.72))',
                  backgroundSize: '220% 220%',
                }}
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(255,255,255,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent)]" />
            </div>
            <div className={`relative z-10 ${isMobile ? 'px-4 pb-4' : 'px-6 pb-6'}`}>
              <div className={`${isMobile ? 'gap-4' : 'gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_15.5rem] lg:items-start'} flex flex-col`}>
                <div className={`flex min-w-0 gap-4 ${isMobile ? '-mt-6' : '-mt-8'}`}>
                  <div className={`${isMobile ? 'h-20 w-20 rounded-[1.35rem]' : 'h-24 w-24 rounded-[1.7rem]'} shrink-0 overflow-hidden border border-white/12 bg-os-bg/90 shadow-xl shadow-black/25`}>
                    <img
                      src={recruiterProfile.profileImageUrl}
                      alt={recruiterProfile.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className={`min-w-0 ${isMobile ? 'pt-8' : 'pt-10'}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className={`truncate font-semibold tracking-tight text-os-text-pri ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                        {recruiterProfile.name}
                      </h1>
                      <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-os-text-sec">
                        {recruiterProfile.pronouns}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-os-text-pri">
                      {recruiterProfile.headline}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-os-text-sec">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {recruiterProfile.location.recruiter}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {recruiterProfile.linkedIn.connections} connections
                      </span>
                      <span>{recruiterProfile.linkedIn.followers.toLocaleString('en-US')} followers</span>
                    </div>
                  </div>
                </div>

                <div className={`flex w-full flex-col gap-3 ${isMobile ? 'pt-1' : 'pt-6 lg:w-[15.5rem]'}`}>
                  <span className="flex h-10 w-full items-center justify-center rounded-xl border border-[#0a66c2]/20 bg-[#0a66c2]/[0.12] px-3 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8bc2ff]">
                    Static profile snapshot
                  </span>
                  <a
                    href={recruiterProfile.linkedIn.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#0a66c2]/25 bg-[#0a66c2] px-5 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-lg shadow-[#0a66c2]/25 transition-[filter,box-shadow] duration-100 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8bc2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Connect on LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
          </header>

          <div className={`grid ${isMobile ? 'gap-4' : 'gap-5 xl:grid-cols-[1.18fr_0.82fr]'}`}>
            <div className={isMobile ? 'space-y-4' : 'space-y-5'}>
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-3xl border border-white/10 bg-os-surface/45 shadow-xl shadow-black/10 ${isMobile ? 'p-4' : 'p-6'}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-os-text-sec/55">Headline and status</p>
                    <h2 className="mt-2 text-lg font-semibold text-os-text-pri">Recruiter snapshot</h2>
                  </div>
                  <span className="rounded-full border border-os-accent/15 bg-os-accent/[0.055] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-os-accent/85">
                    Open to work: {recruiterProfile.linkedIn.openToWork}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-os-text-sec/55">Current role</div>
                    <div className="mt-2 text-sm font-semibold text-os-text-pri">{linkedInCurrentRole.title}</div>
                    <div className="mt-1 text-xs text-os-text-sec">{linkedInCurrentRole.company} · {linkedInCurrentRole.employmentType} · {linkedInCurrentRole.dateRange} · {linkedInCurrentRole.workMode}</div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-os-text-sec/55">Review mode</div>
                    <div className="mt-2 text-sm font-semibold text-os-text-pri">Static recruiter snapshot</div>
                    <div className="mt-1 text-xs leading-5 text-os-text-sec">This window merges profile and experience review without requiring LinkedIn login.</div>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 }}
                className={`rounded-3xl border border-white/10 bg-white/[0.055] shadow-xl shadow-black/10 ${isMobile ? 'p-4' : 'p-6'}`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-os-accent" />
                  <h2 className="text-sm font-semibold text-os-text-pri">About</h2>
                </div>
                <p className="mt-4 text-sm leading-7 text-os-text-pri/84">
                  {recruiterProfile.aboutSummary}
                </p>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className={`rounded-3xl border border-white/10 bg-white/[0.055] shadow-xl shadow-black/10 ${isMobile ? 'p-4' : 'p-6'}`}
              >
                <div className="mb-5 flex items-center gap-2">
                  <BriefcaseBusiness className="h-4 w-4 text-os-accent" />
                  <h2 className="text-sm font-semibold text-os-text-pri">Experience highlights</h2>
                </div>

                <div className="space-y-4">
                  {linkedInExperience.map((role, index) => (
                    <div
                      key={`${role.company}-${role.title}`}
                      className={index === 0
                        ? 'rounded-2xl border border-os-accent/15 bg-os-accent/[0.055] p-5'
                        : 'rounded-2xl border border-white/10 bg-white/[0.035] p-5'}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-[11px] font-bold tracking-wide text-white shadow-lg shadow-black/20 ${badgeGradient(role.company)}`}
                            aria-hidden="true"
                          >
                            {companyInitials(role.company)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold text-os-text-pri">{role.title}</h3>
                            <p className="mt-1 text-sm text-os-text-sec">
                              {role.company} · {role.employmentType}
                            </p>
                            <p className="mt-0.5 text-xs text-os-text-sec/75">
                              {role.dateRange}
                              {role.duration ? ` · ${role.duration}` : ''}
                            </p>
                            <p className="mt-0.5 text-xs text-os-text-sec/60">
                              {role.location ? `${role.location} · ` : ''}
                              {role.workMode}
                            </p>
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] ${index === 0 ? 'border-white/10 bg-white/[0.08] text-os-accent' : 'border-white/10 bg-white/[0.04] text-os-text-sec'}`}>
                          {index === 0 ? 'Current' : 'Previous'}
                        </span>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {role.highlights.map((item) => (
                          <div key={item} className="rounded-2xl border border-white/10 bg-os-bg/40 p-4">
                            <p className="text-sm leading-6 text-os-text-pri/84">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            </div>

            <div className={isMobile ? 'space-y-4' : 'space-y-5'}>
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className={`rounded-3xl border border-white/10 bg-os-surface/45 shadow-xl shadow-black/10 ${isMobile ? 'p-4' : 'p-6'}`}
              >
                <div className="mb-4 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-os-accent" />
                  <h2 className="text-sm font-semibold text-os-text-pri">Education</h2>
                </div>
                <div className="space-y-3">
                  {educationHistory.map((entry) => (
                    <div key={`${entry.school}-${entry.course}`} className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                      <div className="text-sm font-semibold text-os-text-pri">{entry.school}</div>
                      <div className="mt-1 text-sm text-os-text-sec">{entry.course}</div>
                      <div className="mt-2 text-xs text-os-text-sec/80">{entry.date}</div>
                      {entry.note ? <div className="mt-1 text-xs text-os-accent">{entry.note}</div> : null}
                    </div>
                  ))}
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className={`rounded-3xl border border-white/10 bg-white/[0.055] shadow-xl shadow-black/10 ${isMobile ? 'p-4' : 'p-6'}`}
              >
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-os-accent" />
                  <h2 className="text-sm font-semibold text-os-text-pri">Skills</h2>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {linkedInTopSkills.map((skill) => (
                    <span
                      key={skill.label}
                      className="rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-xs font-medium text-os-text-pri"
                    >
                      {skill.label}
                    </span>
                  ))}
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`rounded-3xl border border-white/10 bg-white/[0.055] shadow-xl shadow-black/10 ${isMobile ? 'p-4' : 'p-6'}`}
              >
                <div className="mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-os-accent" />
                  <h2 className="text-sm font-semibold text-os-text-pri">Certifications</h2>
                </div>
                <div className="space-y-3">
                  {certifications.map((entry) => (
                    <div key={`${entry.title}-${entry.issuer}`} className="rounded-2xl border border-white/8 bg-white/[0.035] p-4 text-sm leading-6 text-os-text-pri/84">
                      {entry.title}, {entry.issuer}, issued {entry.issued}
                    </div>
                  ))}
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 }}
                className={`rounded-3xl border border-white/10 bg-[#0a66c2]/[0.08] shadow-xl shadow-black/10 ${isMobile ? 'p-4' : 'p-6'}`}
              >
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#8bc2ff]/80">Snapshot note</p>
                <p className="mt-3 text-sm leading-6 text-os-text-pri/82">
                  This window now combines LinkedIn profile context and experience review in one place inside ZARAK_OS.
                </p>
                <p className="mt-3 text-sm leading-6 text-os-text-sec">
                  Use the Connect on LinkedIn action above when you want the live profile. Everything here is the in-app static snapshot.
                </p>
              </motion.section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
