import { lazy } from 'react';
import {
  Cpu,
  FileDown,
  FileText,
  MessageSquare,
  Milestone,
  Radar,
  Terminal as TerminalIcon,
} from 'lucide-react';
import Terminal from '../components/apps/Terminal';
import type { AppDefinition, AppId } from './types';

const About = lazy(() => import('../components/apps/About'));
const ContactInfo = lazy(() => import('../components/apps/ContactInfo'));
const DownloadCV = lazy(() => import('../components/apps/DownloadCV'));
const Experience = lazy(() => import('../components/apps/Experience'));
const Skills = lazy(() => import('../components/apps/Skills'));
const VenderScope = lazy(() => import('../components/apps/VenderScope'));

export const APP_REGISTRY = [
  {
    id: 'experience',
    label: 'experience.app',
    icon: Milestone,
    component: Experience,
    defaultWindowSize: { width: 800, height: 500 },
    minimumWindowSize: { width: 520, height: 360 },
    dockVisible: true,
    searchKeywords: ['career', 'work', 'jobs', 'thrive', 'nexique', 'msc'],
  },
  {
    id: 'skills',
    label: 'skills.app',
    icon: Cpu,
    component: Skills,
    defaultWindowSize: { width: 800, height: 500 },
    minimumWindowSize: { width: 520, height: 360 },
    dockVisible: true,
    searchKeywords: ['skills', 'competency', 'grc', 'security', 'tools'],
  },
  {
    id: 'terminal',
    label: 'terminal.app',
    icon: TerminalIcon,
    component: Terminal,
    defaultWindowSize: { width: 800, height: 500 },
    minimumWindowSize: { width: 520, height: 320 },
    dockVisible: true,
    searchKeywords: ['terminal', 'shell', 'commands', 'cli'],
    defaultOpen: true,
  },
  {
    id: 'venderscope',
    label: 'venderscope.browser',
    icon: Radar,
    component: VenderScope,
    defaultWindowSize: { width: 800, height: 500 },
    minimumWindowSize: { width: 520, height: 360 },
    dockVisible: true,
    searchKeywords: ['venderscope', 'vendor', 'risk', 'project', 'browser'],
  },
  {
    id: 'contact',
    label: 'contact.ssh',
    icon: MessageSquare,
    component: ContactInfo,
    defaultWindowSize: { width: 800, height: 500 },
    minimumWindowSize: { width: 420, height: 320 },
    dockVisible: true,
    searchKeywords: ['contact', 'email', 'message', 'ssh'],
  },
  {
    id: 'download-cv',
    label: 'download-my-cv.app',
    icon: FileDown,
    component: DownloadCV,
    defaultWindowSize: { width: 800, height: 500 },
    minimumWindowSize: { width: 420, height: 320 },
    dockVisible: true,
    searchKeywords: ['cv', 'resume', 'download', 'pdf'],
  },
  {
    id: 'about',
    label: 'about.txt',
    icon: FileText,
    component: About,
    defaultWindowSize: { width: 800, height: 500 },
    minimumWindowSize: { width: 520, height: 360 },
    dockVisible: true,
    searchKeywords: ['about', 'profile', 'operator', 'links'],
  },
] satisfies AppDefinition[];

export const DEFAULT_OPEN_APPS = APP_REGISTRY
  .filter((app) => app.defaultOpen)
  .map((app) => app.id);

export function getAppDefinition(appId: AppId): AppDefinition {
  return APP_REGISTRY.find((app) => app.id === appId)!;
}
