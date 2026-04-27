export type ExperienceStatus = 'ACTIVE' | 'CLOSED' | 'IN_PROGRESS';

export interface RecruiterProfile {
  name: string;
  pronouns: string;
  profileImageUrl: string;
  headline: string;
  currentRoleSummary: string;
  currentStudySummary: string;
  terminalHeadline: string;
  shortIntro: string;
  email: string;
  location: {
    recruiter: string;
    about: string;
    terminal: string;
  };
  linkedIn: {
    url: string;
    publicProfile: string;
    handle: string;
    connections: number;
    followers: number;
    openToWork: string;
  };
  aboutSummary: string;
  cv: {
    fileName: string;
    fileUrl: string;
    previewUrl: string;
    formatLabel: string;
    fileSizeLabel: string;
  };
}

export interface ExperienceTimelineEntry {
  id: string;
  date: string;
  company: string;
  role: string;
  status: ExperienceStatus;
  achievements: string[];
  terminalSubtitle?: string;
  terminalLines: Array<{
    text: string;
    color: 'accent' | 'secondary' | 'muted' | 'warn' | 'green' | 'border';
  }>;
}

export interface LinkedInExperienceEntry {
  title: string;
  company: string;
  employmentType: string;
  dateRange: string;
  workMode: string;
  highlights: string[];
}

export interface EducationEntry {
  school: string;
  schoolShort?: string;
  course: string;
  date: string;
  note?: string;
}

export interface SkillHighlight {
  label: string;
}

export interface SkillsRadarMetric {
  subject: string;
  score: number;
  evidence: string;
}

export interface TerminalSkillSection {
  label: string;
  lines: string[];
}

export interface CertificationEntry {
  title: string;
  issuer: string;
  issued: string;
  terminalLabel: string;
}

export const recruiterProfile: RecruiterProfile = {
  name: 'Syed Zarak Hassan',
  pronouns: 'He/Him',
  profileImageUrl: '/thats-me.jpg',
  headline: 'Placement Compliance Analyst @ THRIVE',
  currentRoleSummary: 'Compliance Analyst @ Thrive Learning',
  currentStudySummary: 'MSc Cybersecurity, Nottingham Trent University (2026)',
  terminalHeadline: 'compliance analyst @ thrive learning // msc cybersecurity — ntu 2026',
  shortIntro: 'building tools that catch what audits miss',
  email: 'syedzrk1000@gmail.com',
  location: {
    recruiter: 'United Kingdom',
    about: 'Nottingham, England',
    terminal: 'nottingham, uk',
  },
  linkedIn: {
    url: 'https://www.linkedin.com/in/zarak-hassan7/',
    publicProfile: 'www.linkedin.com/in/zarak-hassan7',
    handle: 'in/zarak-hassan7',
    connections: 431,
    followers: 431,
    openToWork: 'recruiters only',
  },
  aboutSummary:
    'Compliance and Information Security professional with hands-on experience across ISO 27001, ISO 9001, Cyber Essentials, and vendor risk management. Owned third-party risk across 50+ vendors, supported audit readiness, reduced DPA approval time by 70%, and contributed to deal wins by translating security requirements into clear responses.',
  cv: {
    fileName: 'Syed_Zarak_Hassan_CV_2026.pdf',
    fileUrl: '/Syed_Zarak_Hassan_CV_2026.pdf',
    previewUrl: '/Syed_Zarak_Hassan_CV_2026.pdf#view=FitH',
    formatLabel: 'PDF / A4',
    fileSizeLabel: '116.3 KB',
  },
};

export const experienceTimeline: ExperienceTimelineEntry[] = [
  {
    id: 'thrive',
    date: '[2025-09 → present]',
    company: 'THRIVE LEARNING',
    role: 'Compliance Analyst',
    status: 'ACTIVE',
    achievements: [
      'MDM migration: 250 endpoints, 0 downtime, -40% support tickets',
      'DPA tracker: approval time reduced 70%',
      'ISO 9001 Stage 1 audit: passed — 6 process flows authored',
      '50+ vendor audits managed in Vanta',
      'Delivered RFI response that closed high-value prospect deal',
    ],
    terminalSubtitle: ' Fixed-term contract · Nottingham, UK',
    terminalLines: [
      { text: ' → MDM migration to Kandji: 250 endpoints, 0 downtime', color: 'secondary' },
      { text: ' result: IT support tickets reduced by 40%', color: 'muted' },
      { text: ' → Built company-wide DPA tracking system', color: 'secondary' },
      { text: ' result: time-to-approval reduced by 70%', color: 'muted' },
      { text: ' → ISO 9001 Stage 1 audit: passed', color: 'secondary' },
      { text: ' authored 6 end-to-end business process flows', color: 'muted' },
      { text: ' → 50+ vendor audits managed in Vanta', color: 'secondary' },
      { text: ' → Delivered RFI response that closed high-value prospect', color: 'secondary' },
      { text: ' → 75+ application ownership records maintained in Cakewalk', color: 'secondary' },
    ],
  },
  {
    id: 'nexique',
    date: '[2021-09 → 2024-08]',
    company: 'NEXIQUE DESIGN LABS',
    role: 'Lead Project Manager',
    status: 'CLOSED',
    achievements: [
      '15+ client projects delivered end-to-end',
      '$8,500+ revenue generated, ~100% client satisfaction',
      'Built onboarding workflows for 5-person team',
    ],
    terminalSubtitle: ' Lahore, Pakistan',
    terminalLines: [
      { text: ' → 15+ client projects delivered end-to-end', color: 'secondary' },
      { text: ' → $8,500+ revenue generated, ~100% client satisfaction', color: 'secondary' },
      { text: ' → Led and mentored a 5-person team', color: 'secondary' },
      { text: ' → Built standardised onboarding workflows from scratch', color: 'secondary' },
    ],
  },
  {
    id: 'ntu-msc',
    date: '[2025-01 → 2026-12]',
    company: 'MSc CYBER SECURITY',
    role: 'Nottingham Trent University',
    status: 'IN_PROGRESS',
    achievements: [
      'Dissertation: diagrammatic techniques in audit comprehension',
      'Modules: Network Security, Digital Forensics, Ethical Hacking',
    ],
    terminalLines: [
      { text: ' → Dissertation: do diagrams improve auditor comprehension?', color: 'secondary' },
      { text: ' (spoiler: yes — measurably)', color: 'muted' },
      { text: ' → Modules: Network Security · Digital Forensics', color: 'secondary' },
      { text: ' Secure Software Development · Ethical Hacking', color: 'secondary' },
    ],
  },
];

export const linkedInCurrentRole: LinkedInExperienceEntry = {
  title: 'Placement Compliance Analyst',
  company: 'Thrive',
  employmentType: 'Full-time',
  dateRange: 'Sep 2025 - Present',
  workMode: 'Remote',
  highlights: [
    'Owned third-party risk across 50+ vendors.',
    'Supported audit readiness across compliance and security workflows.',
    'Reduced DPA approval time by 70%.',
    'Translated security requirements into clear responses that contributed to deal wins.',
  ],
};

export const educationHistory: EducationEntry[] = [
  {
    school: 'Nottingham Trent University',
    schoolShort: 'Nottingham Trent Uni',
    course: 'MSc Cyber Security',
    date: 'Jan 2025 - Jan 2027',
  },
  {
    school: 'Iqra University',
    course: 'BE Computer Software Engineering',
    date: 'Feb 2020 - Feb 2024',
    note: 'Distinction',
  },
];

export const linkedInTopSkills: SkillHighlight[] = [
  { label: 'Security' },
  { label: 'Information Security' },
  { label: 'Cybersecurity' },
  { label: 'ISO 27001' },
  { label: 'Automation' },
];

export const skillsRadarMetrics: SkillsRadarMetric[] = [
  { subject: 'GRC Frameworks', score: 95, evidence: 'ISO 27001, ISO 9001, Cyber Essentials' },
  { subject: 'Third-Party Risk', score: 92, evidence: 'Vanta, 50+ audits, DPA Tracking' },
  { subject: 'Endpoint Security', score: 88, evidence: 'Kandji (MDM migration), Pulseway' },
  { subject: 'Security Ops', score: 80, evidence: 'IAM, IR, Vulnerability Mgmt' },
  { subject: 'Data Privacy', score: 85, evidence: 'GDPR, Stakeholder Management' },
  { subject: 'SIEM & Network', score: 75, evidence: 'Splunk, Chronicle, Suricata, Wireshark' },
];

export const terminalSkillSections: TerminalSkillSection[] = [
  {
    label: 'FRAMEWORKS',
    lines: ['iso 27001 · iso 9001 · cyber essentials · nist · cia triad'],
  },
  {
    label: 'GRC',
    lines: ['risk register · vendor risk · gdpr · dpa tracking', 'access control · auditing · data privacy · bcp'],
  },
  {
    label: 'SEC OPS',
    lines: ['iam · endpoint security · incident response · dlp', 'vulnerability management · security awareness training'],
  },
  {
    label: 'SIEM',
    lines: ['splunk · chronicle · suricata · wireshark · virustotal', 'bitdefender gravityzone · tcpdump'],
  },
  {
    label: 'MDM / IT',
    lines: ['kandji · pulseway · vanta · cakewalk · jira'],
  },
  {
    label: 'DEV',
    lines: ['python · mysql · react · linux (mint + ubuntu) · macos'],
  },
  {
    label: 'SOFT',
    lines: ['project management · stakeholder engagement', 'pre-sales support · client onboarding · strategic planning'],
  },
];

export const certifications: CertificationEntry[] = [
  {
    title: 'SOC Member',
    issuer: 'LetsDefend',
    issued: 'Dec 2024',
    terminalLabel: 'soc analyst learning path — letsdefend + hackthebox (2024)',
  },
  {
    title: 'Security Information and Event Management',
    issuer: 'Google Cybersecurity Specialization',
    issued: 'Nov 2024',
    terminalLabel: 'google professional cybersecurity certificate (2024)',
  },
];
