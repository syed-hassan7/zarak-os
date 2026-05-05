import { type ElementType, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Clock3,
  ExternalLink,
  Grid2x2,
  Home,
  Sparkles,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { APP_REGISTRY, getAppDefinition } from '../../os/appRegistry';
import type { AppDefinition, AppIconProps, AppId } from '../../os/types';
import { useOS } from '../../os/OSProvider';
import DesktopBackgroundLayer from './DesktopBackgroundLayer';
import type { DesktopBackgroundId } from './desktopBackgroundPresets';

const MOBILE_FEATURED_APP_IDS: AppId[] = ['cv', 'linkedin', 'contact', 'venderscope'];
const MOBILE_LAUNCH_ORDER: AppId[] = [
  'cv',
  'linkedin',
  'contact',
  'venderscope',
  'about',
  'skills',
  'ask-zarak',
  'terminal',
  'backdrop',
];

const MOBILE_APP_COPY: Record<AppId, { eyebrow: string; description: string }> = {
  skills: {
    eyebrow: 'Capability map',
    description: 'Core GRC, security, and tooling strengths in one touch-friendly view.',
  },
  terminal: {
    eyebrow: 'Quick profile',
    description: 'A compact command-line intro for users who prefer the terminal framing.',
  },
  venderscope: {
    eyebrow: 'Flagship project',
    description: 'Open the continuous vendor-risk platform and review the core product story.',
  },
  about: {
    eyebrow: 'Operator brief',
    description: 'A concise profile view with links, objective, and current direction.',
  },
  contact: {
    eyebrow: 'Reach out',
    description: 'Email-first contact flow with the essential connection details surfaced.',
  },
  cv: {
    eyebrow: 'Recruiter essential',
    description: 'Review the CV directly on-device, then open or download the bundled PDF.',
  },
  linkedin: {
    eyebrow: 'Career snapshot',
    description: 'A static LinkedIn-style profile and experience summary without leaving the app.',
  },
  backdrop: {
    eyebrow: 'Shell visuals',
    description: 'Switch the flat-shell backdrop without entering the desktop-only control surfaces.',
  },
  'ask-zarak': {
    eyebrow: 'Interactive assistant',
    description: 'Open Syed-LLM for guided Q&A and recruiter-facing portfolio answers.',
  },
};

interface MobileShellProps {
  backgroundId: DesktopBackgroundId;
}

function formatClock(time: Date): string {
  return time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatDate(time: Date): string {
  return time.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function MobileShell({ backgroundId }: MobileShellProps) {
  const {
    state: { openApps, activeApp, minimizedApps },
    openApp,
    focusApp,
    restoreApp,
    minimizeApp,
    closeApp,
  } = useOS();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const launcherApps = useMemo(() => {
    const rank = new Map(MOBILE_LAUNCH_ORDER.map((id, index) => [id, index]));
    return APP_REGISTRY.slice().sort((left, right) => {
      const leftRank = rank.get(left.id) ?? Number.MAX_SAFE_INTEGER;
      const rightRank = rank.get(right.id) ?? Number.MAX_SAFE_INTEGER;
      return leftRank - rightRank || left.label.localeCompare(right.label);
    });
  }, []);

  const featuredApps = MOBILE_FEATURED_APP_IDS.map(getAppDefinition);
  const activeVisibleApp =
    activeApp && openApps.includes(activeApp) && !minimizedApps.includes(activeApp)
      ? getAppDefinition(activeApp)
      : null;
  const recentApps = launcherApps.filter((app) => openApps.includes(app.id));

  const openOrFocusApp = (appId: AppId) => {
    if (minimizedApps.includes(appId)) {
      restoreApp(appId);
      return;
    }

    if (openApps.includes(appId)) {
      focusApp(appId);
      return;
    }

    openApp(appId);
  };

  const returnHome = () => {
    if (!activeVisibleApp) return;
    minimizeApp(activeVisibleApp.id);
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-transparent">
      <DesktopBackgroundLayer backgroundId={backgroundId} />
      <div className="absolute inset-0 scanlines z-10 opacity-20" />

      <div className="absolute inset-0 z-20 overflow-y-auto custom-scrollbar">
        <div className="mx-auto flex min-h-full w-full max-w-screen-sm flex-col px-4 pb-[calc(var(--safe-area-bottom)+7rem)] pt-[calc(var(--safe-area-top)+1rem)]">
          <header className="rounded-[28px] border border-white/10 bg-white/[0.055] px-4 py-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-os-accent/90">
                  <img src="/logo.svg" alt="ZARAK_OS" className="h-4 w-4 object-contain opacity-90" />
                  <span>ZARAK_OS mobile</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-os-text-pri/84">
                  Recruiter-first touch interface. The desktop shell stays intact; mobile gets a
                  purpose-built launcher.
                </p>
              </div>
              <div className="shrink-0 rounded-2xl border border-white/10 bg-os-bg/45 px-3 py-2 text-right shadow-lg shadow-black/15">
                <div className="text-lg font-semibold leading-none text-os-text-pri">{formatClock(time)}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-os-text-sec/70">
                  {formatDate(time)}
                </div>
              </div>
            </div>
          </header>

          <section className="mt-4 rounded-[32px] border border-white/10 bg-white/[0.05] p-5 shadow-xl shadow-black/15 backdrop-blur-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-os-text-sec/65">
                  Pocket workstation
                </p>
                <h1 className="mt-2 text-[30px] font-semibold leading-[1.05] tracking-tight text-os-text-pri">
                  Start with the highest-value paths.
                </h1>
              </div>
              <div className="rounded-2xl border border-os-accent/20 bg-os-accent/[0.08] p-3 text-os-accent">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {featuredApps.map((app) => (
                <FeaturedAppCard key={app.id} app={app} onOpen={() => openOrFocusApp(app.id)} />
              ))}
            </div>
          </section>

          {recentApps.length > 0 ? (
            <section className="mt-4">
              <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-os-text-sec/65">
                <Clock3 className="h-3.5 w-3.5" />
                <span>Resume recent</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar">
                {recentApps.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => openOrFocusApp(app.id)}
                    className="flex min-w-[152px] shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-left shadow-lg shadow-black/10 backdrop-blur-xl"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/12 bg-os-bg/45 text-os-text-pri">
                      <app.icon size={18} strokeWidth={1.6} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-os-text-pri">{app.label}</div>
                      <div className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-os-text-sec/60">
                        Open
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-5">
            <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-os-text-sec/65">
              <Grid2x2 className="h-3.5 w-3.5" />
              <span>All apps</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {launcherApps.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => openOrFocusApp(app.id)}
                  className="rounded-[26px] border border-white/10 bg-white/[0.05] p-4 text-left shadow-lg shadow-black/10 backdrop-blur-xl"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-os-bg/45 text-os-text-pri">
                    <app.icon size={19} strokeWidth={1.6} />
                  </div>
                  <div className="mt-4 text-[10px] uppercase tracking-[0.2em] text-os-text-sec/60">
                    {MOBILE_APP_COPY[app.id].eyebrow}
                  </div>
                  <div className="mt-2 text-sm font-semibold leading-5 text-os-text-pri">
                    {app.label}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-os-text-sec">
                    {MOBILE_APP_COPY[app.id].description}
                  </p>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-4 pb-[calc(var(--safe-area-bottom)+1rem)]">
        <div className="mx-auto grid max-w-screen-sm grid-cols-3 gap-3 rounded-[28px] border border-white/10 bg-os-bg/82 p-3 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <QuickLaunchButton
            icon={Home}
            label="Home"
            onPress={returnHome}
          />
          <QuickLaunchButton
            icon={getAppDefinition('cv').icon}
            label="CV"
            onPress={() => openOrFocusApp('cv')}
          />
          <QuickLaunchButton
            icon={getAppDefinition('ask-zarak').icon}
            label="Syed-LLM"
            onPress={() => openOrFocusApp('ask-zarak')}
          />
        </div>
      </div>

      <AnimatePresence>
        {activeVisibleApp ? (
          <motion.section
            key={activeVisibleApp.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-40 flex flex-col bg-os-bg/94 backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/[0.04] via-transparent to-os-accent/[0.04]" />

            <header className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 px-4 pb-3 pt-[calc(var(--safe-area-top)+0.9rem)]">
              <button
                type="button"
                onClick={returnHome}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] text-os-text-pri shadow-lg shadow-black/15"
                aria-label="Return to mobile home"
              >
                <ArrowLeft className="h-4.5 w-4.5" />
              </button>

              <div className="min-w-0 text-center">
                <div className="truncate text-sm font-semibold text-os-text-pri">
                  {activeVisibleApp.label}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-os-text-sec/60">
                  {MOBILE_APP_COPY[activeVisibleApp.id].eyebrow}
                </div>
              </div>

              <button
                type="button"
                onClick={() => closeApp(activeVisibleApp.id)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] text-os-text-pri shadow-lg shadow-black/15"
                aria-label={`Close ${activeVisibleApp.label}`}
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </header>

            <div className="relative z-10 min-h-0 flex-1 overflow-hidden pb-[calc(var(--safe-area-bottom)+0.5rem)]">
              <activeVisibleApp.component isMobile onOpenApp={openOrFocusApp} />
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function FeaturedAppCard({
  app,
  onOpen,
}: {
  app: AppDefinition;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="rounded-[26px] border border-white/10 bg-os-bg/42 p-4 text-left shadow-lg shadow-black/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.07] text-os-text-pri">
          <app.icon size={20} strokeWidth={1.6} />
        </div>
        <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-os-text-sec/55" />
      </div>
      <div className="mt-4 text-[10px] uppercase tracking-[0.2em] text-os-accent/75">
        {MOBILE_APP_COPY[app.id].eyebrow}
      </div>
      <div className="mt-2 text-base font-semibold tracking-tight text-os-text-pri">{app.label}</div>
      <p className="mt-2 text-xs leading-5 text-os-text-sec">{MOBILE_APP_COPY[app.id].description}</p>
    </button>
  );
}

function QuickLaunchButton({
  icon: Icon,
  label,
  onPress,
}: {
  icon: ElementType<AppIconProps>;
  label: string;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="pointer-events-auto flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/[0.055] px-2 py-2 text-os-text-pri shadow-lg shadow-black/10"
    >
      <Icon size={18} strokeWidth={1.6} />
      <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-os-text-sec/75">
        {label}
      </span>
    </button>
  );
}
