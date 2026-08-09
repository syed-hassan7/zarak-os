import { useState, useEffect } from 'react';
import AegisBuddyPrototype from './shell/AegisBuddyPrototype';
import DesktopBackgroundLayer from './shell/DesktopBackgroundLayer';
import { DesktopAppearanceProvider, useDesktopAppearance } from './shell/DesktopAppearance';
import DesktopSurface from './shell/DesktopSurface';
import FloatingAskZarak from './shell/FloatingAskZarak';
import FloatingDock from './shell/FloatingDock';
import MenuBar from './shell/MenuBar';
import MobileShell from './shell/MobileShell';
import MissionControl from './shell/MissionControl';
import Spotlight from './shell/Spotlight';
import WindowManager from './shell/WindowManager';
import { APP_REGISTRY, getAppDefinition } from '../os/appRegistry';
import { OSProvider, useOS } from '../os/OSProvider';
import type { CommandDefinition } from '../os/commandRegistry';
import type { ExperienceMode } from '../utils/deviceExperience';

const SHOW_AEGIS_PROTOTYPE = true;

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || target.isContentEditable;
}

function hasOsModifier(event: KeyboardEvent): boolean {
  return event.metaKey || event.ctrlKey || event.altKey;
}

export default function Desktop({
  experienceMode = 'desktop',
  ...props
}: {
  key?: string;
  experienceMode?: ExperienceMode;
} = {}) {
  return (
    <OSProvider defaultOpenApps={experienceMode === 'mobile' ? [] : undefined}>
      <DesktopAppearanceProvider>
        <DesktopShell experienceMode={experienceMode} {...props} />
      </DesktopAppearanceProvider>
    </OSProvider>
  );
}

function DesktopShell({
  experienceMode = 'desktop',
}: {
  key?: string;
  experienceMode?: ExperienceMode;
} = {}) {
  const {
    state: { openApps, activeApp, minimizedApps, zOrder, windowLayouts },
    openApp,
    toggleApp,
    focusApp,
    restoreApp,
    closeApp,
    updateWindowLayout,
  } = useOS();
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isMissionControlOpen, setIsMissionControlOpen] = useState(false);
  const { backgroundId } = useDesktopAppearance();
  const isMobileExperience = experienceMode === 'mobile';

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isSpotlightOpen) return;
        if (isMissionControlOpen) {
          event.preventDefault();
          setIsMissionControlOpen(false);
        }
        return;
      }

      const isTyping = isEditableTarget(event.target);
      const modifierPressed = hasOsModifier(event);
      const isCommandK = modifierPressed && event.key.toLowerCase() === 'k';
      const isMissionControlShortcut =
        (modifierPressed && event.key === 'ArrowUp') ||
        event.key === 'F3';

      if (isCommandK) {
        event.preventDefault();
        setIsMissionControlOpen(false);
        setIsSpotlightOpen((isOpen) => !isOpen);
        return;
      }

      if (isTyping) return;

      if (isMissionControlShortcut) {
        event.preventDefault();
        setIsSpotlightOpen(false);
        setIsMissionControlOpen((isOpen) => !isOpen);
        return;
      }

      if (modifierPressed && event.key.toLowerCase() === 'h' && activeApp) {
        event.preventDefault();
        toggleApp(activeApp);
        return;
      }

      if (modifierPressed && event.key.toLowerCase() === 'q' && activeApp) {
        event.preventDefault();
        closeApp(activeApp);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeApp, closeApp, isMissionControlOpen, isSpotlightOpen, toggleApp]);

  const runSpotlightCommand = (command: CommandDefinition) => {
    if (minimizedApps.includes(command.appId)) {
      restoreApp(command.appId);
      return;
    }

    if (openApps.includes(command.appId)) {
      focusApp(command.appId);
      return;
    }

    openApp(command.appId);
  };

  if (isMobileExperience) return <MobileShell backgroundId={backgroundId} />;

  const activeAppLabel = activeApp ? getAppDefinition(activeApp).label : 'desktop';

  return (
    <div className="absolute inset-0 bg-transparent overflow-hidden">
      <DesktopBackgroundLayer backgroundId={backgroundId} />
      <div className="absolute inset-0 scanlines z-10 opacity-35" />

      <MenuBar
        activeAppLabel={activeAppLabel}
        openAppCount={openApps.length}
        onOpenSpotlight={() => {
          setIsMissionControlOpen(false);
          setIsSpotlightOpen(true);
        }}
        onOpenMissionControl={() => {
          setIsSpotlightOpen(false);
          setIsMissionControlOpen(true);
        }}
      />
      <DesktopSurface apps={APP_REGISTRY.filter((a) => a.id !== 'ask-zarak')} onToggleApp={toggleApp} />
      <WindowManager
        openApps={openApps}
        activeApp={activeApp}
        minimizedApps={minimizedApps}
        zOrder={zOrder}
        windowLayouts={windowLayouts}
        onFocusApp={focusApp}
        onCloseApp={closeApp}
        onToggleApp={toggleApp}
        onUpdateWindowLayout={updateWindowLayout}
      />
      <FloatingDock
        apps={APP_REGISTRY}
        openApps={openApps}
        activeApp={activeApp}
        minimizedApps={minimizedApps}
        onToggleApp={toggleApp}
      />
      {SHOW_AEGIS_PROTOTYPE && (
        <AegisBuddyPrototype
          activeApp={activeApp}
          openApps={openApps}
          pauseAmbientMotion={isSpotlightOpen || isMissionControlOpen}
        />
      )}
      <FloatingAskZarak onOpen={() => toggleApp('ask-zarak')} />
      <Spotlight
        isOpen={isSpotlightOpen}
        openApps={openApps}
        minimizedApps={minimizedApps}
        onClose={() => setIsSpotlightOpen(false)}
        onRunCommand={runSpotlightCommand}
      />
      <MissionControl
        isOpen={isMissionControlOpen}
        openApps={openApps}
        activeApp={activeApp}
        minimizedApps={minimizedApps}
        zOrder={zOrder}
        windowLayouts={windowLayouts}
        onClose={() => setIsMissionControlOpen(false)}
        onFocusApp={focusApp}
      />
    </div>
  );
}
