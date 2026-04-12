import { motion, AnimatePresence } from 'motion/react';

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
    <div className="p-6 h-full overflow-y-auto custom-scrollbar bg-os-bg/30">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4 mb-10 border-b border-os-border/30 pb-6">
          <div className="w-12 h-12 rounded-lg bg-os-accent/10 border border-os-accent/30 flex items-center justify-center">
            <span className="text-os-accent font-bold text-xl">01</span>
          </div>
          <div>
            <h2 className="text-os-text-pri text-lg font-bold tracking-widest uppercase">Career_Logs</h2>
            <p className="text-os-text-sec text-[10px] font-mono uppercase tracking-widest opacity-50">System_Event_History // Compliance_Analyst</p>
          </div>
        </div>
        
        <div className="grid gap-8">
          {EXPERIENCE.map((exp, i) => (
            <motion.div 
              key={i} 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="relative group"
            >
              {/* Technical Grid Background */}
              <div className="absolute -inset-4 bg-os-surface/20 rounded-xl border border-os-border/30 group-hover:border-os-accent/20 transition-colors -z-10" />
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-48 shrink-0">
                  <div className="text-[10px] text-os-accent font-mono mb-1 tracking-tighter">{exp.date}</div>
                  <div className={`text-[9px] inline-block px-2 py-0.5 rounded-sm font-bold tracking-widest uppercase ${
                    exp.status === 'ACTIVE' ? 'bg-os-accent/20 text-os-accent' :
                    exp.status === 'IN_PROGRESS' ? 'bg-os-warn/20 text-os-warn' :
                    'bg-os-text-sec/20 text-os-text-sec'
                  }`}>
                    {exp.status}
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                    <div>
                      <h3 className="text-os-text-pri font-bold text-lg tracking-tight">{exp.company}</h3>
                      <p className="text-os-text-sec text-sm italic">{exp.role}</p>
                    </div>
                    <div className="text-[10px] text-os-text-sec/30 font-mono hidden sm:block">
                      ID: 0X{i}F{i+7}A
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 pt-2">
                    {exp.achievements.map((ach, j) => (
                      <div key={j} className="bg-os-chrome/30 border border-os-border/20 p-3 rounded-md group-hover:bg-os-chrome/50 transition-colors">
                        <div className="flex gap-3 items-start">
                          <div className="w-1 h-1 rounded-full bg-os-accent mt-1.5 shrink-0" />
                          <p className="text-os-text-sec text-[11px] leading-relaxed">{ach}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-os-border/20 text-center">
          <p className="text-[10px] text-os-text-sec/30 font-mono uppercase tracking-[0.3em]">
            // End_Of_Transmission //
          </p>
        </div>
      </div>
    </div>
  );
}
