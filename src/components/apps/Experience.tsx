import { motion } from 'motion/react';

const EXPERIENCE = [
  {
    date: "[2025-09 → present]",
    company: "THRIVE LEARNING",
    role: "Compliance Analyst",
    status: "ACTIVE",
    achievements: [
      "MDM migration: 250 endpoints, 0 downtime, -40% support tickets",
      "DPA tracker: approval time reduced 70%",
      "ISO 9001 Stage 1 audit: passed — 6 process flows authored",
      "50+ vendor audits managed in Vanta",
      "Delivered RFI response that closed high-value prospect deal"
    ]
  },
  {
    date: "[2021-09 → 2024-08]",
    company: "NEXIQUE DESIGN LABS",
    role: "Lead Project Manager",
    status: "CLOSED",
    achievements: [
      "15+ client projects delivered end-to-end",
      "$8,500+ revenue generated, ~100% client satisfaction",
      "Built onboarding workflows for 5-person team"
    ]
  },
  {
    date: "[2025-01 → 2026-12]",
    company: "MSc CYBER SECURITY",
    role: "Nottingham Trent University",
    status: "IN_PROGRESS",
    achievements: [
      "Dissertation: diagrammatic techniques in audit comprehension",
      "Modules: Network Security, Digital Forensics, Ethical Hacking"
    ]
  }
];

export default function Experience() {
  return (
    <div className="h-full overflow-y-auto bg-os-bg/65 p-7 custom-scrollbar">
      <div className="mx-auto max-w-4xl space-y-7">
        <header className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-os-accent/20 bg-os-accent/[0.08]">
              <span className="text-lg font-semibold text-os-accent">01</span>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-os-text-sec/70">Career history</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-os-text-pri">Experience</h2>
            </div>
          </div>
        </header>

        <div className="space-y-4">
          {EXPERIENCE.map((exp, i) => (
            <motion.div 
              key={i} 
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.07 }}
              className="group rounded-3xl border border-white/10 bg-os-surface/45 p-5 shadow-xl shadow-black/10 transition-colors hover:border-white/18 hover:bg-white/[0.055] motion-reduce:transition-none"
            >
              <div className="flex flex-col gap-5 md:flex-row">
                <div className="shrink-0 md:w-48">
                  <div className="mb-2 font-mono text-[11px] text-os-text-sec/75">{exp.date}</div>
                  <div className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                    exp.status === 'ACTIVE' ? 'bg-os-accent/20 text-os-accent' :
                    exp.status === 'IN_PROGRESS' ? 'bg-os-warn/20 text-os-warn' :
                    'bg-white/10 text-os-text-sec'
                  }`}>
                    {exp.status}
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-os-text-pri">{exp.company}</h3>
                      <p className="mt-1 text-sm text-os-text-sec">{exp.role}</p>
                    </div>
                    <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] text-os-text-sec/45 sm:block">
                      ID: 0X{i}F{i+7}A
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {exp.achievements.map((ach, j) => (
                      <div key={j} className="rounded-2xl border border-white/8 bg-white/[0.035] p-3.5">
                        <div className="flex items-start gap-3">
                          <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-os-accent/80" />
                          <p className="text-xs leading-relaxed text-os-text-pri/78">{ach}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="pt-3 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-os-text-sec/35">End of transmission</p>
        </div>
      </div>
    </div>
  );
}
