import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CortexLogo } from "@/components/CortexLogo";
import { 
  Target, 
  Zap, 
  Globe, 
  Settings, 
  BarChart3, 
  LayoutGrid
} from 'lucide-react';
import { useWindows, AppId } from '@/context/WindowContext';
import { OSWindow } from '@/components/OSWindow';
import MissionControl from '@/components/MissionControl';
import IntelligenceApp from '@/components/IntelligenceApp';
import DeepSearch from '@/components/DeepSearch';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import SettingsPanel from '@/components/SettingsPanel';
import Scene3D from '@/components/Scene3D';
import NeuralHUD from '@/components/NeuralHUD';
import AmbientBackground from '@/components/AmbientBackground';
import NeuralCore from '@/components/NeuralCore';
import { useAuth } from '@/lib/AuthContext';

export default function Desktop() {
  const { windows, openWindow, activeId } = useWindows();
  const { user } = useAuth();
  const [systemLoad, setSystemLoad] = useState(24);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemLoad(prev => Math.min(100, Math.max(10, prev + (Math.random() * 4 - 2))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const apps: { id: AppId; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'intelligence', label: 'Intelligence', icon: Zap, color: 'bg-blue-500' },
    { id: 'notes', label: 'Mission Ctrl', icon: Target, color: 'bg-emerald-500' },
    { id: 'search', label: 'Neural Search', icon: Globe, color: 'bg-amber-500' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'bg-purple-500' },
    { id: 'settings', label: 'System Config', icon: Settings, color: 'bg-slate-600' },
  ];

  const renderAppContent = (id: AppId) => {
    switch (id) {
      case 'intelligence': return <IntelligenceApp />;
      case 'notes': return <MissionControl />;
      case 'search': return <DeepSearch />;
      case 'analytics': return <AnalyticsDashboard />;
      case 'settings': return <SettingsPanel />;
      default: return null;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030303] selection:bg-primary/30 font-sans">
      {/* Tactical Overlays */}
      <div className="tactical-scanline" />
      
      {/* 1. Starfield / Data Particles */}
      <AmbientBackground />

      {/* 2. 3D Reality Warp */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Scene3D />
      </div>

      {/* 3. Neural Core Hub (Center) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <NeuralCore />
      </div>

      {/* 4. Cyber Grid Layer */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

      {/* 5. Thermal Noise Filter (CSS-based) */}
      <div className="absolute inset-0 z-1 pointer-events-none opacity-20 mix-blend-overlay">
        <div className="absolute inset-0 bg-noise-overlay animate-noise" />
      </div>

      {/* 6. Volumetric Gradients */}
      <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-br from-primary/10 via-transparent to-accent/10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-pastel-blue/10 blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      {/* Floating Data Nodes */}
      <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden">
        {[
          { color: 'bg-primary', delay: 0, top: '25%', left: '35%' },
          { color: 'bg-emerald-500', delay: 2, top: '65%', left: '60%' },
          { color: 'bg-amber-500', delay: 4, top: '40%', left: '70%' },
        ].map((node, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ duration: 5, delay: node.delay, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute w-32 h-32 rounded-full ${node.color}/5 blur-3xl`}
            style={{ top: node.top, left: node.left }}
          />
        ))}
      </div>
      {/* 7. Desktop UI Framework */}
      <div className="absolute inset-0 z-10 flex p-10 pointer-events-none">
        {/* Left: App Grid & Branding */}
        <div className="flex flex-col gap-10 pointer-events-auto">
          {/* System Branding Node */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-start gap-1 mb-6 group cursor-default"
          >
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <CortexLogo size={24} className="text-primary" />
               </div>
               <div className="flex flex-col">
                  <span className="text-xl font-black text-white italic tracking-tighter glitch-text-hover leading-tight">CortexOS</span>
                  <span className="text-[7px] font-black text-primary uppercase tracking-[0.4em] opacity-60">Neural // Intelligence</span>
               </div>
            </div>
            <div className="ml-[52px] h-[1px] w-32 bg-gradient-to-r from-primary/40 to-transparent" />
          </motion.div>

          {apps.map((app) => (
            <motion.button
              key={app.id}
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openWindow(app.id)}
              className="flex flex-col items-center gap-3 group relative"
            >
              <div className="w-16 h-16 rounded-[1.8rem] bg-white/[0.03] border border-white/10 backdrop-blur-2xl flex items-center justify-center shadow-2xl group-hover:bg-primary/10 group-hover:border-primary/50 transition-all duration-500">
                  <app.icon className="w-7 h-7 text-white/40 group-hover:text-white transition-colors" />
                  <div className="absolute inset-0 rounded-[1.8rem] bg-primary/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
              </div>
              <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] group-hover:text-white transition-colors">
                {app.label}
              </span>
            </motion.button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Right: Neural HUD */}
        <NeuralHUD />
      </div>

      {/* 8. Active Workspace (Windows) */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {Object.entries(windows)
            .filter(([_, state]) => state.isOpen)
            .map(([id, state]) => (
              <OSWindow 
                key={id} 
                id={id as AppId} 
                title={apps.find(a => a.id === id)?.label || id} 
                icon={apps.find(a => a.id === id)?.icon || LayoutGrid}
              >
                {renderAppContent(id as AppId)}
              </OSWindow>
            ))}
        </AnimatePresence>
      </div>

      {/* 9. System Status & Control (Bottom) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="flex items-center gap-2 px-5 py-3 rounded-[2.5rem] bg-black/40 border border-white/10 backdrop-blur-3xl shadow-2xl pointer-events-auto ring-1 ring-white/5"
        >
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => openWindow(app.id)}
              className={`relative p-3.5 rounded-2xl transition-all duration-500 group ${
                activeId === app.id ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'text-white/30 hover:bg-white/5 hover:text-white'
              }`}
            >
              <app.icon className={`w-5 h-5 ${activeId === app.id ? 'animate-pulse' : ''}`} />
              {activeId === app.id && (
                <motion.div 
                    layoutId="dock-indicator"
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-0.5 rounded-full bg-primary shadow-[0_0_10px_#3b82f6]" 
                />
              )}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black border border-white/10 text-[9px] font-black text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {app.label}
              </div>
            </button>
          ))}
          <div className="w-px h-8 bg-white/10 mx-3" />
          <button className="p-3.5 rounded-2xl text-white/20 hover:bg-white/5 hover:text-white transition-all">
            <LayoutGrid className="w-5 h-5" />
          </button>
        </motion.div>
      </div>

      {/* 10. Chronometer Node (Top Right) */}
      <div className="absolute top-10 right-10 z-10 flex flex-col items-end pointer-events-auto">
          <div className="text-4xl font-black text-white tracking-tighter tabular-nums drop-shadow-2xl">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-1 drop-shadow-md">
              {new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
      </div>

      {/* 11. Neural Load Overlay (Bottom Right) */}
      <div className="absolute bottom-10 right-12 z-10 hidden xl:flex flex-col items-end gap-2 pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.5em]">Neural Efficiency</span>
          <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              className="h-full bg-primary shadow-[0_0_10px_#3b82f6]"
              animate={{ width: `${systemLoad}%` }}
            />
          </div>
        </div>
        <div className="text-[10px] font-mono text-white/40 tracking-widest uppercase">
          Core // Status // Online
        </div>
      </div>
    </div>
  );
}
