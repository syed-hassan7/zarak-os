import Draggable from 'react-draggable';
import { type PointerEvent, ReactNode, useEffect, useRef, useState } from 'react';
import type { AppId, WindowLayout, WindowRect, WindowSize } from '../os/types';

const SHELL_MARGIN = 12;
const SHELL_BOTTOM = 96;

function getShellTop(): number {
  if (typeof window !== 'undefined' && window.innerWidth >= 1920) return 52;
  return 44;
}

interface WindowProps {
  id: AppId;
  title: string;
  children: ReactNode;
  layout: WindowLayout;
  minSize: WindowSize;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onLayoutChange: (layout: WindowLayout) => void;
  zIndex: number;
  key?: string | number;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
type WorkArea = { minX: number; minY: number; maxX: number; maxY: number };
type DragBounds = { left: number; top: number; right: number; bottom: number };

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

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

function getDragBounds(layout: WindowLayout): DragBounds {
  const workArea = getFreeWorkArea();
  return {
    left: workArea.minX,
    top: workArea.minY,
    right: Math.max(workArea.minX, workArea.maxX - layout.width),
    bottom: Math.max(workArea.minY, workArea.maxY - layout.height),
  };
}

export default function Window(props: WindowProps) {
  const {
    title,
    children,
    layout,
    minSize,
    isActive,
    onFocus,
    onClose,
    onMinimize,
    onLayoutChange,
    zIndex,
  } = props;
  const nodeRef = useRef<HTMLDivElement>(null);
  const animationTimerRef = useRef<number | null>(null);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null);
  const [isFrameAnimating, setIsFrameAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (animationTimerRef.current !== null) {
        window.clearTimeout(animationTimerRef.current);
      }
    };
  }, []);

  const animateFrame = () => {
    setIsFrameAnimating(true);
    if (animationTimerRef.current !== null) {
      window.clearTimeout(animationTimerRef.current);
    }
    animationTimerRef.current = window.setTimeout(() => {
      setIsFrameAnimating(false);
      animationTimerRef.current = null;
    }, 220);
  };

  const updateLayout = (nextLayout: WindowLayout) => {
    const clampedRect = clampRect(nextLayout, minSize);
    onLayoutChange({
      ...nextLayout,
      ...clampedRect,
    });
  };

  const handleMaximizeToggle = () => {
    onFocus();
    animateFrame();

    if (layout.isMaximized) {
      const restoreRect = layout.restoreRect ?? layout;
      updateLayout({
        ...restoreRect,
        isMaximized: false,
      });
      return;
    }

    const maximizedRect = getMaximizedRect(minSize);
    updateLayout({
      ...maximizedRect,
      isMaximized: true,
      restoreRect: {
        x: layout.x,
        y: layout.y,
        width: layout.width,
        height: layout.height,
      },
    });
  };

  const handleResizeStart = (
    direction: ResizeDirection,
    event: PointerEvent<HTMLDivElement>,
  ) => {
    if (layout.isMaximized) return;

    event.preventDefault();
    event.stopPropagation();
    onFocus();

    const startPointer = { x: event.clientX, y: event.clientY };
    const startLayout = layout;
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    setResizeDirection(direction);
    document.body.style.cursor = window.getComputedStyle(event.currentTarget).cursor;
    document.body.style.userSelect = 'none';

    const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
      const dx = moveEvent.clientX - startPointer.x;
      const dy = moveEvent.clientY - startPointer.y;
      const workArea = getFreeWorkArea();
      let nextX = startLayout.x;
      let nextY = startLayout.y;
      let nextWidth = startLayout.width;
      let nextHeight = startLayout.height;

      if (direction.includes('e')) {
        nextWidth = clamp(startLayout.width + dx, minSize.width, workArea.maxX - startLayout.x);
      }

      if (direction.includes('s')) {
        nextHeight = clamp(startLayout.height + dy, minSize.height, workArea.maxY - startLayout.y);
      }

      if (direction.includes('w')) {
        const maxX = startLayout.x + startLayout.width - minSize.width;
        nextX = clamp(startLayout.x + dx, workArea.minX, maxX);
        nextWidth = startLayout.width + (startLayout.x - nextX);
      }

      if (direction.includes('n')) {
        const maxY = startLayout.y + startLayout.height - minSize.height;
        nextY = clamp(startLayout.y + dy, workArea.minY, maxY);
        nextHeight = startLayout.height + (startLayout.y - nextY);
      }

      onLayoutChange({
        x: nextX,
        y: nextY,
        width: nextWidth,
        height: nextHeight,
        isMaximized: false,
      });
    };

    const handlePointerUp = () => {
      setResizeDirection(null);
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: true });
  };

  return (
    <Draggable 
      nodeRef={nodeRef}
      handle=".window-handle" 
      bounds={getDragBounds(layout)}
      onStart={() => {
        onFocus();
        setIsDragging(true);
      }}
      onDrag={(_, data) => {
        if (layout.isMaximized) return;
        onLayoutChange({
          ...layout,
          x: data.x,
          y: data.y,
          isMaximized: false,
        });
      }}
      onStop={(_, data) => {
        setIsDragging(false);
        if (layout.isMaximized) return;
        const nextRect = clampRect({ ...layout, x: data.x, y: data.y }, minSize);
        onLayoutChange({
          ...layout,
          ...nextRect,
          isMaximized: false,
        });
      }}
      disabled={layout.isMaximized}
      position={{ x: layout.x, y: layout.y }}
    >
      <div 
        ref={nodeRef}
        className={`absolute pointer-events-auto group/window flex transform-gpu flex-col overflow-hidden rounded-2xl border will-change-transform ${
          isDragging || resizeDirection
            ? 'transition-none backdrop-blur-xl'
            : isFrameAnimating
            ? 'transition-[width,height,transform,border-color,box-shadow,background-color,opacity] duration-200 ease-out motion-reduce:transition-none'
            : 'transition-[border-color,box-shadow,background-color,opacity] duration-150 motion-reduce:transition-none'
        } ${isDragging || resizeDirection ? '' : 'backdrop-blur-2xl'} ${
          resizeDirection
            ? 'border-white/30 ring-1 ring-white/25 shadow-2xl shadow-black/35'
            : isDragging
              ? 'border-white/24 ring-1 ring-white/15 shadow-lg shadow-black/20'
            : ''
        } ${
          isDragging || resizeDirection
            ? ''
            : isActive
              ? 'border-white/22 bg-os-bg/88 ring-1 ring-white/12 shadow-2xl shadow-black/45'
              : 'border-white/10 bg-os-bg/70 opacity-90 shadow-xl shadow-black/30'
        } ${isDragging ? 'bg-os-bg/84' : ''} ${resizeDirection ? 'bg-os-bg/86' : ''}`}
        style={{
          zIndex,
          width: layout.width,
          height: layout.height,
          minWidth: minSize.width,
          minHeight: minSize.height,
        }}
        onClick={onFocus}
        onMouseDownCapture={onFocus}
      >
        {/* Titlebar */}
        <div className={`h-10 min-[1920px]:h-12 border-b flex items-center px-4 window-handle cursor-move select-none ${
          isActive
            ? 'border-white/12 bg-white/[0.075]'
            : 'border-white/8 bg-white/[0.045]'
        }`}>
          <div className="flex gap-2 w-20">
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              title="Close"
              aria-label="Close window"
              className="w-3 h-3 min-[1920px]:w-3.5 min-[1920px]:h-3.5 rounded-full bg-[#ED6A5E] hover:brightness-110 transition-[filter,box-shadow] duration-100 border border-[#CE5347] shadow-sm shadow-black/20 outline-none focus-visible:ring-2 focus-visible:ring-os-text-pri/70 focus-visible:ring-offset-2 focus-visible:ring-offset-os-chrome motion-reduce:transition-none"
            />
            <button
              onClick={(e) => { e.stopPropagation(); onMinimize(); }}
              title="Minimize"
              aria-label="Minimize window"
              className="w-3 h-3 min-[1920px]:w-3.5 min-[1920px]:h-3.5 rounded-full bg-[#F5BF4F] hover:brightness-110 transition-[filter,box-shadow] duration-100 border border-[#D6A243] shadow-sm shadow-black/20 outline-none focus-visible:ring-2 focus-visible:ring-os-text-pri/70 focus-visible:ring-offset-2 focus-visible:ring-offset-os-chrome motion-reduce:transition-none"
            />
            <button
              onClick={(e) => { e.stopPropagation(); handleMaximizeToggle(); }}
              title="Maximize"
              aria-label="Maximize window"
              className="w-3 h-3 min-[1920px]:w-3.5 min-[1920px]:h-3.5 rounded-full bg-[#62C554] hover:brightness-110 transition-[filter,box-shadow] duration-100 border border-[#58A942] shadow-sm shadow-black/20 outline-none focus-visible:ring-2 focus-visible:ring-os-text-pri/70 focus-visible:ring-offset-2 focus-visible:ring-offset-os-chrome motion-reduce:transition-none"
            />
          </div>
          <div className={`flex-1 text-center text-[11px] min-[1920px]:text-[13px] font-mono tracking-widest uppercase ${
            isActive ? 'text-os-text-pri/80' : 'text-os-text-sec/65'
          }`}>
            {title}
          </div>
          <div className="w-20 flex justify-end">
            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-os-text-pri/80' : 'bg-os-text-sec/30'}`} />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-transparent relative custom-scrollbar">
          {children}
        </div>

        {/* Active Indicator */}
        {!isActive && (
          <div className="absolute inset-0 bg-os-bg/10 pointer-events-none" />
        )}

        {!layout.isMaximized && (
          <>
            <div className="absolute inset-x-3 top-0 h-1.5 cursor-n-resize hover:bg-white/10" onPointerDown={(event) => handleResizeStart('n', event)} />
            <div className="absolute inset-x-3 bottom-0 h-1.5 cursor-s-resize hover:bg-white/10" onPointerDown={(event) => handleResizeStart('s', event)} />
            <div className="absolute inset-y-3 right-0 w-1.5 cursor-e-resize hover:bg-white/10" onPointerDown={(event) => handleResizeStart('e', event)} />
            <div className="absolute inset-y-3 left-0 w-1.5 cursor-w-resize hover:bg-white/10" onPointerDown={(event) => handleResizeStart('w', event)} />
            <div className="absolute right-0 top-0 h-4 w-4 cursor-ne-resize" onPointerDown={(event) => handleResizeStart('ne', event)} />
            <div className="absolute left-0 top-0 h-4 w-4 cursor-nw-resize" onPointerDown={(event) => handleResizeStart('nw', event)} />
            <div className="absolute right-0 bottom-0 h-5 w-5 cursor-se-resize" onPointerDown={(event) => handleResizeStart('se', event)}>
              <div className={`absolute bottom-1.5 right-1.5 h-3 w-3 border-b border-r transition-colors duration-150 motion-reduce:transition-none ${
                resizeDirection
                  ? 'border-white/70'
                  : 'border-os-text-sec/25 group-hover/window:border-white/45'
              }`} />
            </div>
            <div className="absolute left-0 bottom-0 h-4 w-4 cursor-sw-resize" onPointerDown={(event) => handleResizeStart('sw', event)} />
          </>
        )}
      </div>
    </Draggable>
  );
}
