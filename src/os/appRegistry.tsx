import { lazy } from 'react';
import {
  Bot,
  Cpu,
  FileDown,
  FileText,
  Linkedin,
  MessageSquare,
  Radar,
  Terminal as TerminalIcon,
} from 'lucide-react';
import Terminal from '../components/apps/Terminal';
import type { AppDefinition, AppId } from './types';

const About = lazy(() => import('../components/apps/About'));
const AskZarak = lazy(() => import('../components/apps/AskZarak'));
const ContactInfo = lazy(() => import('../components/apps/ContactInfo'));
const DownloadCV = lazy(() => import('../components/apps/DownloadCV'));
const LinkedInSnapshot = lazy(() => import('../components/apps/LinkedInSnapshot'));
const Skills = lazy(() => import('../components/apps/Skills'));
const VenderScope = lazy(() => import('../components/apps/VenderScope'));

export const APP_REGISTRY = [
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
    id: 'cv',
    label: 'CV.app',
    icon: FileDown,
    component: DownloadCV,
    defaultWindowSize: { width: 980, height: 680 },
    minimumWindowSize: { width: 620, height: 420 },
    dockVisible: true,
    searchKeywords: ['cv', 'resume', 'document', 'pdf', 'viewer', 'download'],
  },
  {
    id: 'linkedin',
    label: 'linkedin-experience.app',
    icon: Linkedin,
    component: LinkedInSnapshot,
    defaultWindowSize: { width: 920, height: 640 },
    minimumWindowSize: { width: 560, height: 420 },
    dockVisible: true,
    searchKeywords: ['linkedin', 'profile', 'snapshot', 'network', 'recruiter', 'experience', 'career', 'work', 'jobs'],
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
  {
    id: 'ask-zarak',
    label: 'ask-zarak.app',
    icon: Bot,
    component: AskZarak,
    defaultWindowSize: { width: 760, height: 620 },
    minimumWindowSize: { width: 520, height: 420 },
    dockVisible: false,
    searchKeywords: ['ask', 'zarak', 'assistant', 'chat', 'portfolio', 'hire', 'recruiter', 'qa'],
  },
] satisfies AppDefinition[];

export const DEFAULT_OPEN_APPS = APP_REGISTRY
  .filter((app) => app.defaultOpen)
  .map((app) => app.id);

export function getAppDefinition(appId: AppId): AppDefinition {
  return APP_REGISTRY.find((app) => app.id === appId)!;
}
