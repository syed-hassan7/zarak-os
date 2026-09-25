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
    connections: string;
    followers: number;
    openToWork: string;
  };
  aboutSummary: string;
  cvs: {
    id: string;
    label: string;
    fullLabel: string;
    fileName: string;
    fileUrl: string;
    previewUrl: string;
    formatLabel: string;
    fileSizeLabel: string;
    focus: string;
  }[];
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
  duration?: string;
  workMode: string;
  location?: string;
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
  profileImageUrl: '/syed-zarak-hassan-v2.png',
  headline: 'Placement Compliance Analyst @ THRIVE',
  currentRoleSummary: 'Compliance Analyst @ Thrive Learning',
  currentStudySummary: 'MSc Cyber Security, Nottingham Trent University (expected Dec 2026)',
  terminalHeadline: 'compliance analyst @ thrive learning // msc cyber security — ntu 2026',
  shortIntro: 'building tools that make manual compliance friction obsolete',
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
    connections: '500+',
    followers: 1050,
    openToWork: 'recruiters only',
  },
  aboutSummary:
    'Technical builder and GRC professional bridging software engineering and cyber security. At Thrive Learning he ships production tools that automate compliance bottlenecks — including ContraAI, which with a redesigned DPA tracker cut contract and DPA approval time by 70%. He owns third-party risk across 50+ vendors in Vanta, has guided ISO 9001 Stage 1, and previously co-led a design agency as Commercial Lead across 15+ accounts. Targeting GRC Engineer, Analyst, FDE, GTM/CS, and technical operations roles.',
  cvs: [
    {
      id: 'grc',
      label: 'GRC',
      fullLabel: 'GRC & Security',
      fileName: 'Syed_Zarak_Hassan_CV_GRC_2026.pdf',
      fileUrl: '/Syed_Zarak_Hassan_CV_GRC_2026.pdf',
      previewUrl: '/Syed_Zarak_Hassan_CV_GRC_2026.pdf#view=FitH',
      formatLabel: 'PDF / A4',
      fileSizeLabel: '114.0 KB',
      focus: 'GRC Engineer, Analyst, and Information Security roles.',
    },
    {
      id: 'fde',
      label: 'FDE',
      fullLabel: 'Forward Deployed Engineer',
      fileName: 'Syed_Zarak_Hassan_CV_FDE_2026.pdf',
      fileUrl: '/Syed_Zarak_Hassan_CV_FDE_2026.pdf',
      previewUrl: '/Syed_Zarak_Hassan_CV_FDE_2026.pdf#view=FitH',
      formatLabel: 'PDF / A4',
      fileSizeLabel: '116.5 KB',
      focus: 'AI-native internal tools, n8n workflows, and production deployment.',
    },
    {
      id: 'gtm',
      label: 'GTM + CS',
      fullLabel: 'GTM & Customer Success',
      fileName: 'Syed_Zarak_Hassan_CV_GTM_CS_2026.pdf',
      fileUrl: '/Syed_Zarak_Hassan_CV_GTM_CS_2026.pdf',
      previewUrl: '/Syed_Zarak_Hassan_CV_GTM_CS_2026.pdf#view=FitH',
      formatLabel: 'PDF / A4',
      fileSizeLabel: '105.8 KB',
      focus: 'GTM, Customer Success, Customer Engineering, and RevOps roles.',
    },
    {
      id: 'ops',
      label: 'Tech Ops',
      fullLabel: 'Technical Operations',
      fileName: 'Syed_Zarak_Hassan_CV_TechOps_2026.pdf',
      fileUrl: '/Syed_Zarak_Hassan_CV_TechOps_2026.pdf',
      previewUrl: '/Syed_Zarak_Hassan_CV_TechOps_2026.pdf#view=FitH',
      formatLabel: 'PDF / A4',
      fileSizeLabel: '106.8 KB',
      focus: 'Founder-associate operations, systems building, and business speed.',
    },
  ],
};

export const experienceTimeline: ExperienceTimelineEntry[] = [
  {
    id: 'thrive',
    date: '[2025-09 → present]',
    company: 'THRIVE LEARNING',
    role: 'Compliance Analyst',
    status: 'ACTIVE',
    achievements: [
      'ContraAI + DPA redesign: contract/DPA approval time cut 70%',
      'MDM migration: 250+ endpoints, 0 downtime, -40% support tickets',
      'ISO 9001 Stage 1 audit: passed — 6 process flows authored',
      'Thrive Content Audit Tool adopted as the company standard',
      '50+ vendor audits in Vanta; 75+ Cakewalk ownership records',
      'Shai-Hulud NPM supply-chain threat: custom scan + Iru remediation',
    ],
    terminalSubtitle: ' Fixed-term contract through Sep 2026 · Nottingham, UK',
    terminalLines: [
      { text: ' → MDM migration to Kandji: 250 endpoints, 0 downtime', color: 'secondary' },
      { text: ' result: IT support tickets reduced by 40%', color: 'muted' },
      { text: ' → Redesigned DPA tracking and shipped ContraAI (Next.js, Claude API)', color: 'secondary' },
      { text: ' result: contract/DPA approval time cut by 70%', color: 'muted' },
      { text: ' → Built Thrive Content Audit Tool; now the company standard', color: 'secondary' },
      { text: ' → ISO 9001 Stage 1 audit: passed', color: 'secondary' },
      { text: ' authored 6 end-to-end business process flows', color: 'muted' },
      { text: ' → 50+ vendor audits managed in Vanta', color: 'secondary' },
      { text: ' → Delivered RFI response that closed high-value prospect', color: 'secondary' },
      { text: ' → 75+ application ownership records maintained in Cakewalk', color: 'secondary' },
      { text: ' → Identified Shai-Hulud NPM supply chain threat', color: 'secondary' },
      { text: ' engineered custom scan + remediation script, deployed via Iru', color: 'muted' },
    ],
  },
  {
    id: 'nexique',
    date: '[2021-09 → 2024-08]',
    company: 'NEXIQUE DESIGN LABS',
    role: 'Co-Founder & Commercial Lead',
    status: 'CLOSED',
    achievements: [
      'Owned GTM + delivery for 3 years: $8,500+ across 15+ accounts',
      '98% satisfaction and 7% churn across the full account lifecycle',
      'Built a Notion CRM to replace fragmented spreadsheet tracking',
      'Organic marketing hit 50k+ views with no paid budget',
      'Mentored 5 interns with structured tutorials and automated workflows',
    ],
    terminalSubtitle: ' Pakistan',
    terminalLines: [
      { text: ' → Co-founded the studio and ran it as Commercial Lead', color: 'secondary' },
      { text: ' → Owned GTM + delivery: cold outreach, calling, organic lead gen', color: 'secondary' },
      { text: ' → $8,500+ revenue across 15+ accounts', color: 'secondary' },
      { text: ' → 98% satisfaction, 7% churn over 3 years', color: 'secondary' },
      { text: ' → Built a Notion CRM + project system from scratch', color: 'secondary' },
      { text: ' → Organic video/marketing: 50k+ views, no paid budget', color: 'secondary' },
      { text: ' → Mentored 5 interns with tutorials and automated workflows', color: 'secondary' },
    ],
  },
  {
    id: 'ntu-msc',
    date: '[2025-01 → 2026-12 expected]',
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
  duration: '1 yr internship',
  workMode: 'Remote',
  highlights: [
    'Cut contract and DPA approval time by 70% by redesigning the DPA tracker and shipping ContraAI.',
    'Owned third-party risk across 50+ vendors in Vanta and 75+ application-ownership records in Cakewalk.',
    'Guided ISO 9001 Stage 1 by designing 6 process flows for non-technical teams.',
    'Led a zero-downtime Kandji/Iru MDM migration across 250+ endpoints (−40% IT tickets).',
  ],
};

export const linkedInExperience: LinkedInExperienceEntry[] = [
  linkedInCurrentRole,
  {
    title: 'Co-Founder & Commercial Lead',
    company: 'Nexique Design Labs',
    employmentType: 'Full-time',
    dateRange: 'Sep 2021 - Aug 2024',
    duration: '3 yrs',
    workMode: 'On-site',
    highlights: [
      'Owned the GTM and delivery pipeline for 3 years, securing $8,500+ across 15+ accounts.',
      'Held 98% satisfaction and 7% churn by running the full account lifecycle.',
      'Built a Notion CRM and project system from scratch, replacing spreadsheet tracking.',
      'Mentored 5 interns with structured tutorials so seniors stayed on delivery.',
    ],
  },
  {
    title: "Founder's Associate",
    company: 'Latoon Music',
    employmentType: 'Full-time',
    dateRange: 'Jan 2020 - Feb 2021',
    duration: '1 yr 2 mos',
    workMode: 'On-site',
    location: 'Peshawar, Khyber Pakhtunkhwa, Pakistan',
    highlights: [
      'Supported the leadership team across commercial deals, project planning, procurement, and client communications, helping move opportunities from initial discussion through to delivery.',
      "Owned client and stakeholder communication during onsite events, presenting the organisation's services, answering commercial questions, and helping convert conversations into qualified opportunities as a lead on English comms.",
      'Prepared, reviewed, and refined proposals, project documentation, and client facing materials, improving the clarity and professionalism of submissions across 5 active projects.',
      'Worked directly with project managers to coordinate requirements, timelines, deliverables, and follow ups, helping keep 5 concurrent client projects moving from planning to execution.',
      'Acted as a cross functional operator between senior leadership, project teams, clients, and external partners, resolving information gaps and reducing the time required to move decisions forward by approximately 40%.',
    ],
  },
];

export const educationHistory: EducationEntry[] = [
  {
    school: 'Nottingham Trent University',
    schoolShort: 'Nottingham Trent Uni',
    course: 'MSc Cyber Security',
    date: 'Jan 2025 - Dec 2026 (expected)',
  },
  {
    school: 'Iqra National University',
    course: 'BSc Software Engineering',
    date: 'Feb 2020 - Feb 2024',
    note: 'Distinction',
  },
];

export const linkedInTopSkills: SkillHighlight[] = [
  { label: 'ISO 27001' },
  { label: 'Vendor Risk' },
  { label: 'Automation' },
  { label: 'Next.js' },
  { label: 'Customer Success' },
];

export const skillsRadarMetrics: SkillsRadarMetric[] = [
  { subject: 'GRC Frameworks', score: 95, evidence: 'ISO 27001, ISO 9001, SOC 2, Cyber Essentials' },
  { subject: 'Third-Party Risk', score: 92, evidence: 'Vanta, 50+ audits, DPA tracking, ContraAI' },
  { subject: 'Endpoint Security', score: 88, evidence: 'Kandji/Iru MDM migration, Pulseway' },
  { subject: 'AI Automation', score: 90, evidence: 'ContraAI, n8n, Content Audit Tool, Claude API' },
  { subject: 'Data Privacy', score: 85, evidence: 'GDPR, DPA lifecycle, security questionnaires' },
  { subject: 'SIEM & Network', score: 75, evidence: 'Splunk, Chronicle, Suricata, Wireshark' },
];

export const terminalSkillSections: TerminalSkillSection[] = [
  {
    label: 'FRAMEWORKS',
    lines: ['iso 27001 · iso 9001 · soc 2 · gdpr · cyber essentials', 'working knowledge: hipaa · iso 42001 · eu ai act'],
  },
  {
    label: 'GRC',
    lines: ['vendor risk · dpa tracking · audit readiness · rfi/rfq', 'access control · iru mcp automation · risk registers'],
  },
  {
    label: 'SEC OPS',
    lines: ['endpoint posture · incident response · supply-chain remediation', 'security awareness training · pulseway · kandji/iru'],
  },
  {
    label: 'SIEM',
    lines: ['splunk · chronicle · suricata · wireshark · virustotal', 'bitdefender gravityzone'],
  },
  {
    label: 'BUILD',
    lines: ['typescript · next.js · supabase · claude api · n8n', 'cursor sdk · vercel · rag · huggingface'],
  },
  {
    label: 'GTM / CS',
    lines: ['revops · crm architecture · sales enablement', 'hubspot · salesforce · notion crm · churn/retention'],
  },
  {
    label: 'SOFT',
    lines: ['stakeholder engagement · pre-sales support', 'client onboarding · commercial lead · mentoring'],
  },
];

export const certifications: CertificationEntry[] = [
  {
    title: 'SOC Analyst Learning Path',
    issuer: 'LetsDefend and HackTheBox',
    issued: '2024',
    terminalLabel: 'soc analyst learning path — letsdefend + hackthebox (2024)',
  },
  {
    title: 'Google Professional Cyber Security Certificate',
    issuer: 'Coursera and Google',
    issued: '2024',
    terminalLabel: 'google professional cyber security certificate (2024)',
  },
  {
    title: 'Introduction to Python',
    issuer: 'Sololearn',
    issued: '2023',
    terminalLabel: 'introduction to python — sololearn (2023)',
  },
  {
    title: 'Introduction to SQL',
    issuer: 'Sololearn',
    issued: '2023',
    terminalLabel: 'introduction to sql — sololearn (2023)',
  },
];
