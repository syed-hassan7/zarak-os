import { APP_REGISTRY } from './appRegistry';
import type { AppId } from './types';

export interface CommandDefinition {
  id: string;
  label: string;
  detail: string;
  appId: AppId;
  keywords: string[];
  group: 'Apps' | 'Commands';
}

const TERMINAL_COMMAND_DEFINITIONS = [
  {
    id: 'terminal-command-help',
    label: 'help',
    detail: 'Show available terminal commands',
    appId: 'terminal',
    keywords: ['terminal', 'commands', 'manual', 'help'],
    group: 'Commands',
  },
  {
    id: 'terminal-command-whoami',
    label: 'whoami',
    detail: 'Identify the operator profile',
    appId: 'terminal',
    keywords: ['terminal', 'operator', 'profile', 'identity'],
    group: 'Commands',
  },
  {
    id: 'terminal-command-experience',
    label: 'cat experience.log',
    detail: 'Open career history in terminal',
    appId: 'terminal',
    keywords: ['terminal', 'career', 'experience', 'work'],
    group: 'Commands',
  },
  {
    id: 'terminal-command-skills',
    label: 'cat skills.txt',
    detail: 'Open competency map in terminal',
    appId: 'terminal',
    keywords: ['terminal', 'skills', 'competency', 'security'],
    group: 'Commands',
  },
  {
    id: 'terminal-command-projects',
    label: 'ls ./projects',
    detail: 'List projects in terminal',
    appId: 'terminal',
    keywords: ['terminal', 'projects', 'venderscope', 'speedyrentals'],
    group: 'Commands',
  },
] satisfies CommandDefinition[];

export const COMMAND_REGISTRY: CommandDefinition[] = [
  ...APP_REGISTRY.map((app) => ({
    id: `open-${app.id}`,
    label: app.label,
    detail: 'Open or focus application',
    appId: app.id,
    keywords: [app.id, app.label, ...app.searchKeywords],
    group: 'Apps' as const,
  })),
  ...TERMINAL_COMMAND_DEFINITIONS,
];
