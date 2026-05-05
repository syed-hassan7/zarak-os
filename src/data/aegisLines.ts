import type { AppId } from '../os/types';

export const AEGIS_LINE_CATEGORIES = [
  'idle',
  'recruiter',
  'security',
  'projects',
  'customer-success',
  'builder',
  'cv',
  'linkedin',
  'terminal',
  'venderscope',
  'contra-ai',
  'playful',
  'looking-for',
] as const;

export type AegisLineCategory = (typeof AEGIS_LINE_CATEGORIES)[number];

export interface AegisLine {
  id: string;
  text: string;
  categories: readonly AegisLineCategory[];
}

export const AEGIS_LINES: readonly AegisLine[] = [
  { id: 'idle-recruiter-detected', text: 'Recruiter mode detected.', categories: ['idle', 'recruiter'] },
  { id: 'idle-source-limited', text: 'Verified answers only.', categories: ['idle', 'security'] },
  { id: 'idle-not-template', text: 'Portfolio OS, not a template.', categories: ['idle', 'builder', 'projects'] },
  { id: 'idle-sourced-version', text: 'Syed-LLM has the sourced version.', categories: ['idle', 'recruiter'] },
  { id: 'idle-gossip', text: 'I only gossip using verified data.', categories: ['idle', 'playful', 'security'] },
  { id: 'idle-builder-hands', text: 'Security brain, builder hands.', categories: ['idle', 'builder', 'security'] },

  { id: 'recruiter-start-cv', text: 'CV first. Curiosity second.', categories: ['recruiter', 'cv'] },
  { id: 'recruiter-ops-story', text: 'This portfolio is the short route to the operating model.', categories: ['recruiter', 'projects'] },
  { id: 'recruiter-proof-not-pitch', text: 'Built to show proof, not just adjectives.', categories: ['recruiter', 'builder'] },
  { id: 'recruiter-contact-ready', text: 'The contact path is already warmed up.', categories: ['recruiter', 'looking-for'] },
  { id: 'recruiter-questions', text: 'Good hiring questions encouraged.', categories: ['recruiter', 'playful'] },

  { id: 'security-vendor-pain', text: 'Built from real vendor audit pain.', categories: ['security', 'venderscope'] },
  { id: 'security-no-hallucinations', text: 'No invented answers. Bad habit.', categories: ['security', 'playful'] },
  { id: 'security-audit-ready', text: 'Audit-ready beats buzzword-ready.', categories: ['security', 'recruiter'] },
  { id: 'security-controls', text: 'Controls, evidence, then opinions.', categories: ['security', 'builder'] },
  { id: 'security-questions', text: 'Security questions are welcome here.', categories: ['security', 'idle'] },

  { id: 'projects-real-friction', text: 'Every project here started with operational friction.', categories: ['projects', 'builder'] },
  { id: 'projects-proof-surface', text: 'Projects are where the claims get tested.', categories: ['projects', 'recruiter'] },
  { id: 'projects-built-close', text: 'Built close to the pain point. On purpose.', categories: ['projects', 'builder'] },
  { id: 'projects-live-systems', text: 'Product instincts, not just project screenshots.', categories: ['projects', 'builder'] },

  { id: 'customer-translate', text: 'Technical depth. Human translation layer included.', categories: ['customer-success', 'recruiter'] },
  { id: 'customer-stakeholder', text: 'Stakeholder-safe language available on request.', categories: ['customer-success', 'playful'] },
  { id: 'customer-clarity', text: 'Clear answers are a feature, not a side effect.', categories: ['customer-success', 'builder'] },
  { id: 'customer-rooms', text: 'Comfortable in both audit rooms and client calls.', categories: ['customer-success', 'security'] },

  { id: 'builder-ship', text: 'Builder mode stays switched on.', categories: ['builder', 'idle'] },
  { id: 'builder-edges', text: 'The details are doing a lot of work here.', categories: ['builder', 'projects'] },
  { id: 'builder-tight-scope', text: 'Small surfaces. Sharp intent.', categories: ['builder', 'playful'] },
  { id: 'builder-operational', text: 'Operational pain tends to become product ideas.', categories: ['builder', 'projects'] },

  { id: 'cv-open-me', text: 'CV.app is the high-signal route.', categories: ['cv', 'recruiter'] },
  { id: 'cv-pdf-with-purpose', text: 'That PDF earns its pixels.', categories: ['cv', 'playful'] },
  { id: 'cv-proof-points', text: 'The CV keeps the proof points close together.', categories: ['cv', 'looking-for'] },
  { id: 'cv-recruiter-speedrun', text: 'Recruiter speedrun available in CV.app.', categories: ['cv', 'recruiter', 'playful'] },

  { id: 'linkedin-snapshot', text: 'LinkedIn is the polished public snapshot.', categories: ['linkedin', 'recruiter'] },
  { id: 'linkedin-career-trail', text: 'Career trail is mapped in the LinkedIn view.', categories: ['linkedin', 'customer-success'] },
  { id: 'linkedin-scan', text: 'That profile window is built for quick scanning.', categories: ['linkedin', 'cv'] },
  { id: 'linkedin-connect', text: 'Professional snapshot, minus the tab clutter.', categories: ['linkedin', 'playful'] },

  { id: 'terminal-instincts', text: 'Command line instincts intact.', categories: ['terminal', 'playful'] },
  { id: 'terminal-default-open', text: 'Terminal stays close for a reason.', categories: ['terminal', 'builder'] },
  { id: 'terminal-plain-text', text: 'Plain text still wins arguments.', categories: ['terminal', 'security'] },
  { id: 'terminal-crisp', text: 'Shell energy. Recruiter-safe presentation.', categories: ['terminal', 'recruiter'] },

  { id: 'venderscope-audit-friction', text: 'VenderScope came from annual audit fatigue.', categories: ['venderscope', 'security', 'projects'] },
  { id: 'venderscope-risk-visible', text: 'Making vendor risk visible was the point.', categories: ['venderscope', 'security'] },
  { id: 'venderscope-live-over-static', text: 'Live risk beats stale spreadsheets.', categories: ['venderscope', 'builder'] },
  { id: 'venderscope-evidence', text: 'VenderScope is builder proof with compliance roots.', categories: ['venderscope', 'recruiter', 'projects'] },

  { id: 'contra-gap', text: 'ContraAI started from a contract-review gap.', categories: ['contra-ai', 'projects'] },
  { id: 'contra-workflow', text: 'ContraAI is workflow pain turned into product.', categories: ['contra-ai', 'builder'] },
  { id: 'contra-high-level', text: 'ContraAI stays high-level until more public detail exists.', categories: ['contra-ai', 'security'] },
  { id: 'contra-real-origin', text: 'Real workflow gaps make better project briefs.', categories: ['contra-ai', 'projects', 'playful'] },

  { id: 'playful-ambient', text: 'Ambient, not intrusive. I know the assignment.', categories: ['playful', 'idle'] },
  { id: 'playful-small-surface', text: 'Small glass monolith. Big opinions.', categories: ['playful', 'builder'] },
  { id: 'playful-scan', text: 'Subtle desktop haunt, premium edition.', categories: ['playful', 'idle'] },
  { id: 'playful-quiet', text: 'Quietly dramatic. Never loud about it.', categories: ['playful', 'recruiter'] },

  { id: 'looking-for-open', text: 'Open to the right conversation.', categories: ['looking-for', 'recruiter'] },
  { id: 'looking-for-relocate', text: 'Open to relocation. Not to vague job specs.', categories: ['looking-for', 'playful'] },
  { id: 'looking-for-signal', text: 'Looking for signal-rich roles, naturally.', categories: ['looking-for', 'security'] },
  { id: 'looking-for-fit', text: 'Good fit usually likes evidence first.', categories: ['looking-for', 'cv'] },
] as const;

export const AEGIS_FALLBACK_CATEGORIES: readonly AegisLineCategory[] = ['idle', 'playful'];

export const AEGIS_CONTEXT_CATEGORY_MAP: Partial<Record<AppId, readonly AegisLineCategory[]>> = {
  cv: ['cv', 'recruiter', 'looking-for'],
  linkedin: ['linkedin', 'recruiter', 'customer-success'],
  terminal: ['terminal', 'playful', 'builder'],
  venderscope: ['venderscope', 'projects', 'security'],
  'ask-zarak': ['recruiter', 'security', 'idle'],
  skills: ['builder', 'security', 'projects'],
  about: ['recruiter', 'idle', 'builder'],
  contact: ['looking-for', 'recruiter', 'customer-success'],
};

export function getAegisPreferredCategories(activeApp: AppId | null): readonly AegisLineCategory[] {
  if (!activeApp) return AEGIS_FALLBACK_CATEGORIES;
  return AEGIS_CONTEXT_CATEGORY_MAP[activeApp] ?? AEGIS_FALLBACK_CATEGORIES;
}
