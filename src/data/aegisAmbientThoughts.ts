export interface AegisAmbientThought {
  id: string;
  text: string;
}

export const AEGIS_AMBIENT_THOUGHTS: readonly AegisAmbientThought[] = [
  { id: 'ambient-viewing-route', text: 'Projects first, or the sourced version?' },
  { id: 'ambient-cv-route', text: 'Need the formal version? CV.app knows the drill.' },
  { id: 'ambient-desktop-load', text: 'This desktop is doing a lot of heavy lifting.' },
  { id: 'ambient-venderscope-look', text: 'VenderScope is worth a look.' },
  { id: 'ambient-signal-check', text: 'Signal-rich portfolios age better.' },
  { id: 'ambient-linkedin-scan', text: 'LinkedIn for the scan. Syed-LLM has the sourced path.' },
  { id: 'ambient-terminal-instinct', text: 'Terminal still feels like home here.' },
  { id: 'ambient-cv-check', text: 'Have you checked the CV yet?' },
  { id: 'ambient-build-proof', text: 'Builder proof tends to travel well.' },
  { id: 'ambient-security-builder', text: 'Security brain. Builder habits.' },
  { id: 'ambient-workflow-gap', text: 'Real workflow gaps make better projects.' },
  { id: 'ambient-evidence-first', text: 'Evidence first. Drama second.' },
  { id: 'ambient-linkedin-window', text: 'The LinkedIn window is optimized for skimming.' },
  { id: 'ambient-recruiter-path', text: 'Recruiter path stays short on purpose.' },
  { id: 'ambient-questions', text: 'Good questions usually find good evidence.' },
  { id: 'ambient-sourced-route', text: 'Need the sourced version? Syed-LLM has it.' },
  { id: 'ambient-audit-friction', text: 'Audit pain has a way of becoming product ideas.' },
  { id: 'ambient-vendor-risk', text: 'Vendor risk looks better when it is visible.' },
  { id: 'ambient-career-trail', text: 'Career trail is mapped if you want the fast pass.' },
  { id: 'ambient-proof-over-polish', text: 'Polish matters. Proof matters more.' },
  { id: 'ambient-rate-limit', text: 'Rate limits keep the free tier free.' },
  { id: 'ambient-changelog-nudge', text: 'There is an update feed. Worth a click.' },
  { id: 'ambient-notes-wall', text: 'The guestbook wall is quietly alive.' },
  { id: 'ambient-csp-hardened', text: 'CSP got hardened recently. Fewer surprises.' },
  { id: 'ambient-coffee-chat', text: 'A direct booking link exists now. No email required.' },
  { id: 'ambient-typo-tolerant', text: 'Syed-LLM forgives typos now. Type freely.' },
  { id: 'ambient-log-style', text: 'Terse by design. Loud is not the brand.' },
] as const;
