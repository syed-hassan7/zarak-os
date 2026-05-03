import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Component, type ReactNode, Suspense, useEffect, useRef } from 'react';
import { getAppDefinition } from '../../os/appRegistry';
import type { AppDefinition, AppId, WindowLayout, WindowRect, WindowSize } from '../../os/types';
import Window from '../Window';
import WindowLoadingFallback from './WindowLoadingFallback';

class AppWindowErrorBoundary extends Component<
  { children: ReactNode; appId: string },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; appId: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error(`[WindowManager] App "${this.props.appId}" crashed:`, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center p-8 text-center">
          <div>
            <p className="text-sm font-semibold text-red-400">App crashed</p>
            <p className="mt-1 text-xs text-slate-500">Close and reopen the window to retry.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const SHELL_MARGIN = 12;
const SHELL_BOTTOM = 96;

function getShellTop(): number {
  if (typeof window !== 'undefined' && window.innerWidth >= 1920) return 52;
  return 44;
}

interface WindowManagerProps {
  openApps: AppId[];
  activeApp: AppId | null;
  minimizedApps: AppId[];
  zOrder: AppId[];
  windowLayouts: Partial<Record<AppId, WindowLayout>>;
  onFocusApp: (id: AppId) => void;
  onCloseApp: (id: AppId) => void;
  onToggleApp: (id: AppId) => void;
  onUpdateWindowLayout: (id: AppId, layout: WindowLayout) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

type WorkArea = { minX: number; minY: number; maxX: number; maxY: number };

function getFreeWorkArea(): WorkArea {
  return {
    minX: SHELL_MARGIN,
    minY: getShellTop(),
    maxX: window.innerWidth - SHELL_MARGIN,
    maxY: window.innerHeight - SHELL_MARGIN,
  };
}

function getSafeWorkArea(): WorkArea {
  return {
    minX: SHELL_MARGIN,
    minY: getShellTop(),
    maxX: window.innerWidth - SHELL_MARGIN,
    maxY: window.innerHeight - SHELL_BOTTOM,
  };
}

function clampRect(
  rect: WindowRect,
  minSize: WindowSize,
  workArea: WorkArea = getFreeWorkArea(),
): WindowRect {
  const maxWidth = Math.max(minSize.width, workArea.maxX - workArea.minX);
  const maxHeight = Math.max(minSize.height, workArea.maxY - workArea.minY);
  const width = clamp(rect.width, minSize.width, maxWidth);
  const height = clamp(rect.height, minSize.height, maxHeight);

  return {
    width,
    height,
    x: clamp(rect.x, workArea.minX, Math.max(workArea.minX, workArea.maxX - width)),
    y: clamp(rect.y, workArea.minY, Math.max(workArea.minY, workArea.maxY - height)),
  };
}

function getMaximizedRect(minSize: WindowSize): WindowRect {
  const workArea = getSafeWorkArea();
  return clampRect(
    {
      x: workArea.minX,
      y: workArea.minY,
      width: workArea.maxX - workArea.minX,
      height: workArea.maxY - workArea.minY,
    },
    minSize,
    workArea,
  );
}

function getViewportScale(): number {
  if (typeof window === 'undefined') return 1;
  if (window.innerWidth >= 2560) return 1.4;
  if (window.innerWidth >= 1920) return 1.2;
  return 1;
}

function createDefaultLayout(app: AppDefinition, index: number): WindowLayout {
  const hasViewport = typeof window !== 'undefined';
  const scale = getViewportScale();
  const scaledSize = {
    width: Math.round(app.defaultWindowSize.width * scale),
    height: Math.round(app.defaultWindowSize.height * scale),
  };
  const availableWidth = hasViewport ? window.innerWidth - 24 : scaledSize.width;
  const availableHeight = hasViewport ? window.innerHeight - 140 : scaledSize.height;
  const width = Math.max(
    app.minimumWindowSize.width,
    Math.min(scaledSize.width, availableWidth),
  );
  const height = Math.max(
    app.minimumWindowSize.height,
    Math.min(scaledSize.height, availableHeight),
  );
  const maxX = hasViewport ? window.innerWidth - width - 12 : 100 + index * 24;
  const maxY = hasViewport ? window.innerHeight - height - 96 : 54 + index * 24;

  const shellTop = getShellTop();
  return {
    x: clamp(100 + index * 24, 12, Math.max(12, maxX)),
    y: clamp(shellTop + 10 + index * 24, shellTop, Math.max(shellTop, maxY)),
    width,
    height,
    isMaximized: false,
  };
}

export default function WindowManager({
  openApps,
  activeApp,
  minimizedApps,
  zOrder,
  windowLayouts,
  onFocusApp,
  onCloseApp,
  onToggleApp,
  onUpdateWindowLayout,
}: WindowManagerProps) {
  const shouldReduceMotion = useReducedMotion();
  const resizeFrameRef = useRef<number | null>(null);
  const openAppsRef = useRef(openApps);
  const windowLayoutsRef = useRef(windowLayouts);

  useEffect(() => {
    openAppsRef.current = openApps;
    windowLayoutsRef.current = windowLayouts;
  }, [openApps, windowLayouts]);

  useEffect(() => {
    const clampOpenWindows = () => {
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
      }

      resizeFrameRef.current = window.requestAnimationFrame(() => {
        openAppsRef.current.forEach((id, index) => {
          const app = getAppDefinition(id);
          const layout = windowLayoutsRef.current[id] ?? createDefaultLayout(app, index);
          const nextRect = layout.isMaximized
            ? getMaximizedRect(app.minimumWindowSize)
            : clampRect(layout, app.minimumWindowSize, getFreeWorkArea());
          const nextRestoreRect = layout.restoreRect
            ? clampRect(layout.restoreRect, app.minimumWindowSize, getFreeWorkArea())
            : undefined;

          if (
            nextRect.x !== layout.x ||
            nextRect.y !== layout.y ||
            nextRect.width !== layout.width ||
            nextRect.height !== layout.height ||
            nextRestoreRect?.x !== layout.restoreRect?.x ||
            nextRestoreRect?.y !== layout.restoreRect?.y ||
            nextRestoreRect?.width !== layout.restoreRect?.width ||
            nextRestoreRect?.height !== layout.restoreRect?.height
          ) {
            onUpdateWindowLayout(id, {
              ...layout,
              ...nextRect,
              restoreRect: nextRestoreRect,
            });
          }
        });

        resizeFrameRef.current = null;
      });
    };

    window.addEventListener('resize', clampOpenWindows);
    return () => {
      window.removeEventListener('resize', clampOpenWindows);
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
      }
    };
  }, [onUpdateWindowLayout]);

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <AnimatePresence>
        {openApps.map((id, index) => {
          const app = getAppDefinition(id);
          const isMinimized = minimizedApps.includes(id);
          const layout = windowLayouts[id] ?? createDefaultLayout(app, index);
          const zOrderIndex = zOrder.indexOf(id);
          if (isMinimized) return null;

          return (
            <motion.div
              key={id}
              initial={shouldReduceMotion ? false : { scale: 0.96, opacity: 0, y: 14 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { scale: 0.96, opacity: 0, y: 14 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.18 }}
              className="absolute inset-0 pointer-events-none"
            >
              <Window
                id={id}
                title={app.label}
                layout={layout}
                minSize={app.minimumWindowSize}
                isActive={activeApp === id}
                onFocus={() => onFocusApp(id)}
                onClose={() => onCloseApp(id)}
                onMinimize={() => onToggleApp(id)}
                onLayoutChange={(nextLayout) => onUpdateWindowLayout(id, nextLayout)}
                zIndex={20 + (zOrderIndex === -1 ? index : zOrderIndex) * 10}
              >
                <AppWindowErrorBoundary appId={id}>
                  <Suspense fallback={<WindowLoadingFallback />}>
                    <app.component onOpenApp={onToggleApp} />
                  </Suspense>
                </AppWindowErrorBoundary>
              </Window>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
