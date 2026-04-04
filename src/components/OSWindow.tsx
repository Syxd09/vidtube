import React, { useRef, forwardRef } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';
import { AppId, useWindows } from '@/context/WindowContext';
import { CortexLogo } from './CortexLogo';

interface OSWindowProps {
  id: AppId;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

export const OSWindow = forwardRef<HTMLDivElement, OSWindowProps>(({ id, title, icon: Icon, children }, ref) => {
  const { windows, closeWindow, toggleMaximize, focusWindow, updateWindowPosition, updateWindowSize, activeId } = useWindows();
  const windowState = windows[id];
  const dragControls = useDragControls();

  if (!windowState.isOpen) return null;

  const handleResize = (direction: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const rect = (ref as React.RefObject<HTMLDivElement>).current?.getBoundingClientRect();
    const startWidth = rect?.width || 0;
    const startHeight = rect?.height || 0;
    const startPosX = windowState.position.x;
    const startPosY = windowState.position.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      let newWidth: number = startWidth;
      let newHeight: number = startHeight;
      let newPosX: number = startPosX;
      let newPosY: number = startPosY;

      if (direction.includes('e')) newWidth = Math.max(400, startWidth + (moveEvent.clientX - startX));
      if (direction.includes('w')) {
        const delta = startX - moveEvent.clientX;
        const potentialWidth = startWidth + delta;
        if (potentialWidth > 400) {
          newWidth = potentialWidth;
          newPosX = startPosX - delta;
        }
      }
      if (direction.includes('s')) newHeight = Math.max(300, startHeight + (moveEvent.clientY - startY));
      if (direction.includes('n')) {
        const delta = startY - moveEvent.clientY;
        const potentialHeight = startHeight + delta;
        if (potentialHeight > 300) {
          newHeight = potentialHeight;
          newPosY = startPosY - delta;
        }
      }

      updateWindowSize(id, newWidth, newHeight);
      updateWindowPosition(id, newPosX, newPosY);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const resizeEdges = [
    { dir: 'n', class: 'top-0 left-0 right-0 h-1 cursor-n-resize' },
    { dir: 's', class: 'bottom-0 left-0 right-0 h-1 cursor-s-resize' },
    { dir: 'e', class: 'top-0 bottom-0 right-0 w-1 cursor-e-resize' },
    { dir: 'w', class: 'top-0 bottom-0 left-0 w-1 cursor-w-resize' },
    { dir: 'nw', class: 'top-0 left-0 w-3 h-3 cursor-nw-resize z-50' },
    { dir: 'ne', class: 'top-0 right-0 w-3 h-3 cursor-ne-resize z-50' },
    { dir: 'sw', class: 'bottom-0 left-0 w-3 h-3 cursor-sw-resize z-50' },
    { dir: 'se', class: 'bottom-0 right-0 w-3 h-3 cursor-se-resize z-50' },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        zIndex: windowState.zIndex,
        width: windowState.isMaximized ? '100%' : windowState.size.width,
        height: windowState.isMaximized ? '100%' : windowState.size.height,
        top: windowState.isMaximized ? 0 : windowState.position.y,
        left: windowState.isMaximized ? 0 : windowState.position.x,
      }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      drag={!windowState.isMaximized}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        updateWindowPosition(id, windowState.position.x + info.offset.x, windowState.position.y + info.offset.y);
      }}
      onClick={() => focusWindow(id)}
      className={`fixed rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl backdrop-blur-3xl flex flex-col pointer-events-auto transition-all ${
        activeId === id ? 'ring-1 ring-primary/30 shadow-primary/20' : 'bg-[#030303]/40'
      } ${windowState.isMaximized ? 'rounded-none' : ''}`}
    >
      {/* Title Bar */}
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className="flex items-center justify-between px-6 py-4 bg-white/[0.03] border-b border-white/5 cursor-move select-none group"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border border-white/5 bg-white/5 transition-all duration-500 ${activeId === id ? 'text-primary' : 'text-white/40'}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] leading-none mb-1">
              System // App
            </span>
            <span className="text-xs font-bold text-white tracking-tight">{title}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {activeId === id && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest mr-4 animate-fade-in shadow-[0_0_10px_rgba(59,130,246,0.2)]">
              <CortexLogo size={10} className="text-primary" />
              Intelligence Active
            </div>
          )}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white/5 border border-white/5 mr-2">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleMaximize(id); }}
              className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10 text-white/30 hover:text-white transition-all group/btn"
              title="Toggle Maximize"
            >
              <div className="w-2.5 h-2.5 rounded-full border border-white/20 group-hover/btn:border-white/60 transition-colors" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
              className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-red-500/20 text-white/30 hover:text-red-500 transition-all group/btn"
              title="Terminate Instance"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-[#030303]/20 custom-scrollbar relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%]" />
        {children}
      </div>

      {/* 8-Direction Resizing Handles */}
      {!windowState.isMaximized && resizeEdges.map((edge) => (
        <div
          key={edge.dir}
          onMouseDown={handleResize(edge.dir)}
          className={`absolute ${edge.class} hover:bg-primary/20 transition-colors duration-200`}
        />
      ))}
    </motion.div>
  );
});

OSWindow.displayName = 'OSWindow';
