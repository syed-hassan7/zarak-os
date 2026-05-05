import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  DESKTOP_BACKGROUND_IDS,
  type DesktopBackgroundId,
} from './desktopBackgroundPresets';

const STORAGE_KEY = 'zarak-os.desktop-background';
const MIGRATION_KEY = 'zarak-os.desktop-background.v2-migrated';
const DEFAULT_BACKGROUND_ID: DesktopBackgroundId = 'shell-default';

interface DesktopAppearanceContextValue {
  backgroundId: DesktopBackgroundId;
  setBackgroundId: (backgroundId: DesktopBackgroundId) => void;
}

const DesktopAppearanceContext = createContext<DesktopAppearanceContextValue | null>(null);

function isDesktopBackgroundId(value: string | null): value is DesktopBackgroundId {
  return value !== null && (DESKTOP_BACKGROUND_IDS as readonly string[]).includes(value);
}

function readInitialBackgroundId(): DesktopBackgroundId {
  if (typeof window === 'undefined') return DEFAULT_BACKGROUND_ID;

  const storedValue = window.localStorage.getItem(STORAGE_KEY);
  const hasMigrated = window.localStorage.getItem(MIGRATION_KEY) === 'true';

  if (!hasMigrated && storedValue === 'night-mesh') {
    return DEFAULT_BACKGROUND_ID;
  }

  return isDesktopBackgroundId(storedValue) ? storedValue : DEFAULT_BACKGROUND_ID;
}

export function DesktopAppearanceProvider({ children }: { children: ReactNode }) {
  const [backgroundId, setBackgroundId] = useState<DesktopBackgroundId>(readInitialBackgroundId);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, backgroundId);
    window.localStorage.setItem(MIGRATION_KEY, 'true');
  }, [backgroundId]);

  const value = useMemo(
    () => ({
      backgroundId,
      setBackgroundId,
    }),
    [backgroundId],
  );

  return (
    <DesktopAppearanceContext.Provider value={value}>
      {children}
    </DesktopAppearanceContext.Provider>
  );
}

export function useDesktopAppearance() {
  const context = useContext(DesktopAppearanceContext);
  if (!context) {
    throw new Error('useDesktopAppearance must be used inside DesktopAppearanceProvider.');
  }
  return context;
}
