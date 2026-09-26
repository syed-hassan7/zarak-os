import { lazy } from 'react';
import {
  Bot,
  Coffee,
  Cpu,
  FileDown,
  FileText,
  Gauge,
  Image,
  Linkedin,
  MessageSquare,
  Radar,
  StickyNote,
  Terminal as TerminalIcon,
} from 'lucide-react';
import Terminal from '../components/apps/Terminal';
import type { AppDefinition, AppId } from './types';

const About = lazy(() => import('../components/apps/About'));
const AskZarak = lazy(() => import('../components/apps/AskZarak'));
const BackgroundStudio = lazy(() => import('../components/apps/BackgroundStudio'));
const CoffeeChat = lazy(() => import('../components/apps/CoffeeChat'));
const ContactInfo = lazy(() => import('../components/apps/ContactInfo'));
const DownloadCV = lazy(() => import('../components/apps/DownloadCV'));
const LinkedInSnapshot = lazy(() => import('../components/apps/LinkedInSnapshot'));
const NotesWall = lazy(() => import('../components/apps/NotesWall'));
const PerformanceSettings = lazy(() => import('../components/apps/PerformanceSettings'));
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
    defaultWindowSize: { width: 1080, height: 720 },
    minimumWindowSize: { width: 620, height: 420 },
    dockVisible: true,
    searchKeywords: ['cv', 'resume', 'document', 'pdf', 'viewer', 'download', 'grc', 'fde', 'gtm', 'ops'],
    defaultOpen: true,
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
    id: 'backdrop',
    label: 'backdrop.sys',
    icon: Image,
    component: BackgroundStudio,
    defaultWindowSize: { width: 860, height: 620 },
    minimumWindowSize: { width: 560, height: 420 },
    dockVisible: true,
    searchKeywords: ['background', 'wallpaper', 'desktop', 'appearance', 'theme', 'backdrop'],
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
    label: 'syed-llm.app',
    icon: Bot,
    component: AskZarak,
    defaultWindowSize: { width: 760, height: 620 },
    minimumWindowSize: { width: 520, height: 420 },
    dockVisible: false,
    searchKeywords: ['ask', 'zarak', 'assistant', 'chat', 'portfolio', 'hire', 'recruiter', 'qa', 'syed', 'llm'],
  },
  {
    id: 'performance',
    label: 'performance.sys',
    icon: Gauge,
    component: PerformanceSettings,
    defaultWindowSize: { width: 760, height: 640 },
    minimumWindowSize: { width: 480, height: 420 },
    dockVisible: true,
    searchKeywords: ['performance', 'settings', 'device', 'tier', 'lite', 'fps', 'gpu', 'speed', 'fast', 'slow', 'intro', 'replay'],
  },
  {
    id: 'notes',
    label: 'notes.app',
    icon: StickyNote,
    component: NotesWall,
    defaultWindowSize: { width: 860, height: 620 },
    minimumWindowSize: { width: 480, height: 420 },
    dockVisible: true,
    searchKeywords: ['notes', 'guestbook', 'wall', 'sticky', 'message', 'pin', 'visitor', 'sign'],
  },
  {
    id: 'coffee-chat',
    label: 'coffee-chat.link',
    icon: Coffee,
    component: CoffeeChat,
    defaultWindowSize: { width: 760, height: 560 },
    minimumWindowSize: { width: 460, height: 400 },
    dockVisible: true,
    searchKeywords: ['coffee', 'chat', 'meeting', 'calendly', 'book', 'schedule', 'call', 'meet'],
  },
] satisfies AppDefinition[];

export const DEFAULT_OPEN_APPS = APP_REGISTRY
  .filter((app) => app.defaultOpen)
  .map((app) => app.id);

export function getAppDefinition(appId: AppId): AppDefinition {
  return APP_REGISTRY.find((app) => app.id === appId)!;
}
