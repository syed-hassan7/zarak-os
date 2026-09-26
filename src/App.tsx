import { useEffect, useState } from 'react';
import { AnimatePresence, LayoutGroup } from 'motion/react';
import LoginScreen from './components/LoginScreen';
import Desktop from './components/Desktop';
import DigitalBackground from './components/DigitalBackground';
import CustomCursor from './components/CustomCursor';
import { useExperienceMode } from './utils/deviceExperience';

type OSState = 'LOGIN' | 'DESKTOP';

export default function App() {
  const [osState, setOsState] = useState<OSState>('LOGIN');
  const [showDesktopBackground, setShowDesktopBackground] = useState(false);
  const experienceMode = useExperienceMode();
  const isMobileExperience = experienceMode === 'mobile';

  useEffect(() => {
    if (osState !== 'DESKTOP') {
      setShowDesktopBackground(false);
      return;
    }

    const timer = window.setTimeout(() => setShowDesktopBackground(true), 700);
    return () => window.clearTimeout(timer);
  }, [osState]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-os-bg selection:bg-os-accent selection:text-os-bg">
      {showDesktopBackground && <DigitalBackground />}
      <div className="noise-overlay" />
      <div className="crt-flicker" />
      <CustomCursor />
      {/*
        Continuity transition (docs/DESIGN_SYSTEM.md §8/§11): default
        (sync) AnimatePresence mode keeps LoginScreen mounted during its own
        exit animation while Desktop mounts underneath, so the shared
        `os-brand-mark`/`os-brand-wordmark` layoutId elements briefly coexist
        and motion/react computes a FLIP animation between their two
        positions — the brand mark visibly glides from the login header into
        the desktop menu bar instead of the whole screen just crossfading.
      */}
      <LayoutGroup>
        <AnimatePresence>
          {osState === 'LOGIN' && (
            <LoginScreen
              key="login"
              isMobileExperience={isMobileExperience}
              onLogin={() => setOsState('DESKTOP')}
            />
          )}
          {osState === 'DESKTOP' && (
            <Desktop key="desktop" experienceMode={experienceMode} />
          )}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
}
