export const DESKTOP_BACKGROUND_IDS = [
  'shell-default',
  'night-mesh',
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
] as const;
