import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Analytics } from '@vercel/analytics/react';
import BootScreen from './components/BootScreen';
import LoginScreen from './components/LoginScreen';
import Desktop from './components/Desktop';
import DigitalBackground from './components/DigitalBackground';

type OSState = 'BOOT' | 'LOGIN' | 'DESKTOP';

export default function App() {
  const [osState, setOsState] = useState<OSState>('BOOT');

  return (
    <div className="absolute inset-0 overflow-hidden bg-os-bg selection:bg-os-accent selection:text-os-bg">
      <DigitalBackground />
      <div className="noise-overlay" />
      <div className="crt-flicker" />
      <AnimatePresence mode="wait">
        {osState === 'BOOT' && (
          <BootScreen key="boot" onComplete={() => setOsState('LOGIN')} />
        )}
        {osState === 'LOGIN' && (
          <LoginScreen key="login" onLogin={() => setOsState('DESKTOP')} />
        )}
        {osState === 'DESKTOP' && (
          <Desktop key="desktop" />
        )}
      </AnimatePresence>
      <Analytics />
    </div>
  );
}
