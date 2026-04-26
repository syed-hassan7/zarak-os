import type { ComponentType } from 'react';

export const APP_IDS = [
  'experience',
  'skills',
  'terminal',
  'venderscope',
  'about',
  'contact',
  'download-cv',
] as const;

export type AppId = (typeof APP_IDS)[number];

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowRect extends WindowSize {
  x: number;
  y: number;
}

export interface WindowLayout extends WindowRect {
  isMaximized: boolean;
  restoreRect?: WindowRect;
}

export interface AppComponentProps {
  onOpenApp?: (id: AppId) => void;
  isMobile?: boolean;
}

export interface AppIconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export interface AppDefinition {
  id: AppId;
  label: string;
  icon: ComponentType<AppIconProps>;
  component: ComponentType<AppComponentProps>;
  defaultWindowSize: WindowSize;
  minimumWindowSize: WindowSize;
  dockVisible: boolean;
  searchKeywords: string[];
  defaultOpen?: boolean;
}

export interface OSState {
  openApps: AppId[];
  activeApp: AppId | null;
  minimizedApps: AppId[];
  zOrder: AppId[];
  windowLayouts: Partial<Record<AppId, WindowLayout>>;
}

export type OSAction =
  | { type: 'TOGGLE_APP'; appId: AppId }
  | { type: 'OPEN_APP'; appId: AppId }
  | { type: 'FOCUS_APP'; appId: AppId }
  | { type: 'RESTORE_APP'; appId: AppId }
  | { type: 'MINIMIZE_APP'; appId: AppId }
  | { type: 'CLOSE_APP'; appId: AppId }
  | { type: 'UPDATE_WINDOW_LAYOUT'; appId: AppId; layout: WindowLayout };

export function isAppId(value: string): value is AppId {
  return (APP_IDS as readonly string[]).includes(value);
}
