import {
  certifications,
  experienceTimeline,
  recruiterProfile,
  terminalSkillSections,
} from './data/recruiterProfile';

export const TERMINAL_COMMANDS = {
  whoami: [
    { text: recruiterProfile.name.toLowerCase(), color: "accent" },
    { text: recruiterProfile.terminalHeadline, color: "secondary" },
    { text: recruiterProfile.shortIntro, color: "secondary" },
    { text: `location: ${recruiterProfile.location.terminal} — open to relocation`, color: "secondary" },
    { text: "" },
    { text: "type 'help' for available commands", color: "muted" },
  ],
  help: [
    { text: "available commands:", color: "accent" },
    { text: "" },
    { text: " whoami — identify the operator", color: "secondary" },
    { text: " cat experience.log — full career history", color: "secondary" },
    { text: " cat skills.txt — competency map", color: "secondary" },
    { text: " ls ./projects — list projects", color: "secondary" },
    { text: " open venderscope — launch risk intelligence tool", color: "secondary" },
    { text: " ssh contact@szh.dev — initiate contact sequence", color: "secondary" },
    { text: " open about.txt — operator profile", color: "secondary" },
    { text: " clear — clear terminal", color: "secondary" },
  ],
  "cat experience.log": [
    { text: "reading /var/log/career_events.log...", color: "muted" },
    { text: "" },
    ...experienceTimeline.flatMap((entry) => [
      { text: "───────────────────────────────────────────", color: "border" as const },
      { text: entry.date, color: entry.status === 'ACTIVE' ? "warn" : entry.status === 'IN_PROGRESS' ? "warn" : "muted" as const },
      { text: `${entry.company} — ${entry.role}`, color: "accent" as const },
      ...(entry.terminalSubtitle ? [{ text: entry.terminalSubtitle, color: "secondary" as const }] : []),
      { text: "", color: "secondary" as const },
      ...entry.terminalLines,
      { text: "", color: "secondary" as const },
      { text: ` status: ${entry.status}`, color: entry.status === 'ACTIVE' ? "green" : entry.status === 'IN_PROGRESS' ? "warn" : "muted" as const },
    ]),
    { text: "───────────────────────────────────────────", color: "border" },
  ],
  "cat skills.txt": [
    { text: "reading /etc/operator/skills.txt...", color: "muted" },
    { text: "" },
    ...terminalSkillSections.flatMap((section) =>
      section.lines.map((line, index) => ({
        text: `${index === 0 ? `${section.label} ` : ' '}${line}`,
        color: "secondary" as const,
      })),
    ),
    { text: "" },
    { text: "CERTIFICATIONS", color: "accent" },
    ...certifications
      .slice()
      .reverse()
      .map((certification) => ({ text: ` ${certification.terminalLabel}`, color: "secondary" as const })),
  ],
  "ls ./projects": [
    { text: "listing /home/zarak/projects/...", color: "muted" },
    { text: "" },
    { text: "drwxr-xr-x venderscope/", color: "accent" },
    { text: " continuous vendor risk intelligence platform", color: "secondary" },
    { text: " stack: python · react · hibp · nvd · shodan · companies house", color: "muted" },
    { text: " live at: venderscope.vercel.app", color: "secondary" },
    { text: "" },
    { text: "drwxr-xr-x speedyrentals/", color: "accent" },
    { text: " secure full-stack car rental web application", color: "secondary" },
    { text: " stack: firebase · owasp-aligned · role-based access control", color: "muted" },
    { text: " via: github.com/darkyzowo/SpeedyRentals", color: "secondary" },
    { text: "" },
    { text: "drwxr-xr-x szh_os/", color: "accent" },
    { text: " you are here", color: "muted" },
    { text: "" },
    { text: " type 'open venderscope' to launch the live tool", color: "muted" },
  ],
  "open venderscope": [
    { text: "launching venderscope.browser...", color: "muted" },
    { text: "resolving venderscope.vercel.app...", color: "muted" },
    { text: "connection established.", color: "green" },
    { text: "opening window.", color: "muted" },
    { text: "", action: "OPEN_WINDOW", target: "venderscope.browser" },
  ],
  "ssh contact@szh.dev": [
    { text: "initiating contact sequence...", color: "muted" },
    { text: "establishing secure channel...", color: "green" },
    { text: "opening contact session.", color: "muted" },
    { text: "", action: "OPEN_WINDOW", target: "contact.ssh" },
  ],
  "open about.txt": [
    { text: "opening /home/zarak/about.txt...", color: "muted" },
    { text: "", action: "OPEN_WINDOW", target: "about.txt" },
  ],
  clear: [
    { text: "", action: "CLEAR" },
  ],
};

export const TERM_COLORS = {
  accent: "text-os-accent",
  secondary: "text-os-text-sec",
  muted: "text-os-text-sec/60",
  warn: "text-os-warn",
  green: "text-os-accent", // Using accent for green as per instructions or close enough
  danger: "text-os-danger",
  border: "text-os-border",
};
