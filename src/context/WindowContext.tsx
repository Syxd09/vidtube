import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AppId = 'notes' | 'intelligence' | 'search' | 'settings' | 'analytics';

interface WindowState {
  id: AppId;
  isOpen: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number | string; height: number | string };
}

interface WindowContextType {
  windows: Record<AppId, WindowState>;
  openWindow: (id: AppId) => void;
  closeWindow: (id: AppId) => void;
  toggleMaximize: (id: AppId) => void;
  focusWindow: (id: AppId) => void;
  updateWindowPosition: (id: AppId, x: number, y: number) => void;
  updateWindowSize: (id: AppId, width: number | string, height: number | string) => void;
  closeAllWindows: () => void;
  activeId: AppId | null;
}

const initialWindows: Record<AppId, WindowState> = {
  notes: { id: 'notes', isOpen: false, isMaximized: false, zIndex: 10, position: { x: 100, y: 100 }, size: { width: '85%', height: '80%' } },
  intelligence: { id: 'intelligence', isOpen: false, isMaximized: false, zIndex: 10, position: { x: 50, y: 50 }, size: { width: '85%', height: '80%' } },
  search: { id: 'search', isOpen: false, isMaximized: false, zIndex: 10, position: { x: 150, y: 150 }, size: { width: '85%', height: '80%' } },
  settings: { id: 'settings', isOpen: false, isMaximized: false, zIndex: 10, position: { x: 200, y: 200 }, size: { width: 600, height: 400 } },
  analytics: { id: 'analytics', isOpen: false, isMaximized: false, zIndex: 10, position: { x: 250, y: 250 }, size: { width: 800, height: 500 } },
};

const WindowContext = createContext<WindowContextType | undefined>(undefined);

export function WindowProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState(initialWindows);
  const [activeId, setActiveId] = useState<AppId | null>(null);
  const [maxZ, setMaxZ] = useState(10);

  const openWindow = (id: AppId) => {
    const nextZ = maxZ + 1;
    setMaxZ(nextZ);
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: true, zIndex: nextZ }
    }));
    setActiveId(id);
  };

  const closeWindow = (id: AppId) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false }
    }));
    if (activeId === id) setActiveId(null);
  };

  const toggleMaximize = (id: AppId) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isMaximized: !prev[id].isMaximized }
    }));
  };

  const focusWindow = (id: AppId) => {
    const nextZ = maxZ + 1;
    setMaxZ(nextZ);
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], zIndex: nextZ }
    }));
    setActiveId(id);
  };

  const updateWindowPosition = (id: AppId, x: number, y: number) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], position: { x, y } }
    }));
  };

  const updateWindowSize = (id: AppId, width: number | string, height: number | string) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], size: { width, height } }
    }));
  };

  const closeAllWindows = () => {
    setWindows(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        next[key as AppId] = { ...next[key as AppId], isOpen: false };
      });
      return next;
    });
    setActiveId(null);
  };

  return (
    <WindowContext.Provider value={{ 
      windows, 
      openWindow, 
      closeWindow, 
      toggleMaximize, 
      focusWindow,
      updateWindowPosition,
      updateWindowSize,
      closeAllWindows,
      activeId 
    }}>
      {children}
    </WindowContext.Provider>
  );
}

export function useWindows() {
  const context = useContext(WindowContext);
  if (!context) throw new Error('useWindows must be used within a WindowProvider');
  return context;
}
