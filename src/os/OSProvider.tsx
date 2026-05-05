import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import { DEFAULT_OPEN_APPS } from './appRegistry';
import { createInitialOSState, osReducer } from './reducer';
import type { AppId, OSState, WindowLayout } from './types';

interface OSContextValue {
  state: OSState;
  openApp: (appId: AppId) => void;
  toggleApp: (appId: AppId) => void;
  focusApp: (appId: AppId) => void;
  restoreApp: (appId: AppId) => void;
  minimizeApp: (appId: AppId) => void;
  closeApp: (appId: AppId) => void;
  updateWindowLayout: (appId: AppId, layout: WindowLayout) => void;
}

const OSContext = createContext<OSContextValue | null>(null);

export function OSProvider({
  children,
  defaultOpenApps = DEFAULT_OPEN_APPS,
}: {
  children: ReactNode;
  defaultOpenApps?: AppId[];
}) {
  const [state, dispatch] = useReducer(
    osReducer,
    defaultOpenApps,
    createInitialOSState,
  );

  const openApp = useCallback((appId: AppId) => {
    dispatch({ type: 'OPEN_APP', appId });
  }, []);

  const toggleApp = useCallback((appId: AppId) => {
    dispatch({ type: 'TOGGLE_APP', appId });
  }, []);

  const focusApp = useCallback((appId: AppId) => {
    dispatch({ type: 'FOCUS_APP', appId });
  }, []);

  const restoreApp = useCallback((appId: AppId) => {
    dispatch({ type: 'RESTORE_APP', appId });
  }, []);

  const minimizeApp = useCallback((appId: AppId) => {
    dispatch({ type: 'MINIMIZE_APP', appId });
  }, []);

  const closeApp = useCallback((appId: AppId) => {
    dispatch({ type: 'CLOSE_APP', appId });
  }, []);

  const updateWindowLayout = useCallback((appId: AppId, layout: WindowLayout) => {
    dispatch({ type: 'UPDATE_WINDOW_LAYOUT', appId, layout });
  }, []);

  const value = useMemo(
    () => ({
      state,
      openApp,
      toggleApp,
      focusApp,
      restoreApp,
      minimizeApp,
      closeApp,
      updateWindowLayout,
    }),
    [closeApp, focusApp, minimizeApp, openApp, restoreApp, state, toggleApp, updateWindowLayout],
  );

  return <OSContext.Provider value={value}>{children}</OSContext.Provider>;
}

export function useOS() {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error('useOS must be used inside OSProvider.');
  }
  return context;
}
