import { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import LoginScreen from './components/LoginScreen';
import Desktop from './components/Desktop';
import DigitalBackground from './components/DigitalBackground';
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
      <AnimatePresence mode="wait">
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
    </div>
  );
}
