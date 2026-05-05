export const DESKTOP_BACKGROUND_IDS = [
  'shell-default',
  'night-mesh',
  'aurora-drift',
  'grid-signal',
  'neon-vault',
] as const;

export type DesktopBackgroundId = (typeof DESKTOP_BACKGROUND_IDS)[number];

export interface DesktopBackgroundPreset {
  id: DesktopBackgroundId;
  label: string;
  tagline: string;
  description: string;
}

export const DESKTOP_BACKGROUND_PRESETS: readonly DesktopBackgroundPreset[] = [
  {
    id: 'shell-default',
    label: 'Original Shell',
    tagline: 'Classic monitor blend',
    description: 'The original ZARAK_OS desktop treatment with the transparent shell gradient over the monitor scene.',
  },
  {
    id: 'night-mesh',
    label: 'Night Mesh',
    tagline: 'Dark shell remix',
    description: 'Dark graphite atmosphere with restrained cyan and violet drift.',
  },
  {
    id: 'aurora-drift',
    label: 'Aurora Drift',
    tagline: 'Soft moving light fields',
    description: 'Broader color bloom with slow ribbons that keep the shell calm.',
  },
  {
    id: 'grid-signal',
    label: 'Grid Signal',
    tagline: 'Structured tactical surface',
    description: 'Dot-grid texture with scanning pulses and tighter control-room energy.',
  },
  {
    id: 'neon-vault',
    label: 'Neon Vault',
    tagline: 'Deeper chrome contrast',
    description: 'Shadowed center frame with cooler edge lighting and faint vault beams.',
  },
] as const;
