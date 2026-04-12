import Draggable from 'react-draggable';
import { motion } from 'motion/react';
import { ReactNode, useState, useRef } from 'react';

interface WindowProps {
  id: string;
  title: string;
  children: ReactNode;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  zIndex: number;
  offset: number;
  key?: string | number;
}

export default function Window(props: WindowProps) {
  const { id, title, children, isActive, onFocus, onClose, onMinimize, zIndex, offset } = props;
  const [isMaximized, setIsMaximized] = useState(false);
  const nodeRef = useRef(null);

  return (
    <Draggable 
      nodeRef={nodeRef}
      handle=".window-handle" 
      onStart={onFocus}
      disabled={isMaximized}
      defaultPosition={{ x: 100 + offset, y: 50 + offset }}
    >
      <div 
        ref={nodeRef}
        className={`absolute pointer-events-auto flex flex-col border border-os-border/50 bg-os-bg/90 backdrop-blur-xl rounded-lg overflow-hidden ${
          isMaximized ? 'inset-0 transform-none! m-0! w-full! h-[calc(100%-64px)]! transition-all duration-300' : 'w-[800px] h-[500px]'
        } ${isActive ? 'ring-1 ring-os-accent/30 shadow-os-accent/10 shadow-2xl transition-shadow duration-300' : 'shadow-2xl transition-shadow duration-300'}`}
        style={{ zIndex }}
        onClick={onFocus}
      >
        {/* Titlebar */}
        <div className="h-10 bg-os-chrome/80 border-b border-os-border/50 flex items-center px-4 window-handle cursor-move select-none">
          <div className="flex gap-2 w-20">
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="w-3 h-3 rounded-full bg-[#ED6A5E] hover:brightness-110 transition-all border border-[#CE5347]" 
            />
            <button 
              onClick={(e) => { e.stopPropagation(); onMinimize(); }}
              className="w-3 h-3 rounded-full bg-[#F5BF4F] hover:brightness-110 transition-all border border-[#D6A243]" 
            />
            <button 
              onClick={(e) => { e.stopPropagation(); setIsMaximized(!isMaximized); }}
              className="w-3 h-3 rounded-full bg-[#62C554] hover:brightness-110 transition-all border border-[#58A942]" 
            />
          </div>
          <div className="flex-1 text-center text-[11px] text-os-text-sec font-mono tracking-widest uppercase">
            {title}
          </div>
          <div className="w-20 flex justify-end">
            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-os-accent animate-pulse' : 'bg-os-text-sec/30'}`} />
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
      </div>
    </Draggable>
  );
}
