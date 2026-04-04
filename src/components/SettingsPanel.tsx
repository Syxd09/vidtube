import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Shield, Eye, Bell, Cpu, Palette, Zap, Globe, Key, Database, Cpu as CpuIcon, User, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function SettingsPanel() {
  const { user, signOut } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'visual' | 'security' | 'uplink' | 'profile'>('visual');
  const [pulseIntensity, setPulseIntensity] = useState(50);
  const [glassStyle, setGlassStyle] = useState('obsidian');

  // API Key State
  const [apiKeys, setApiKeys] = useState({
    tavily: localStorage.getItem('VITE_TAVILY_API_KEY') || '',
    groq: localStorage.getItem('GROQ_API_KEY') || '',
    openrouter: localStorage.getItem('OPENROUTER_API_KEY') || '',
    google: localStorage.getItem('GOOGLE_AI_KEY') || ''
  });

  const saveKeys = () => {
    localStorage.setItem('VITE_TAVILY_API_KEY', apiKeys.tavily);
    localStorage.setItem('GROQ_API_KEY', apiKeys.groq);
    localStorage.setItem('OPENROUTER_API_KEY', apiKeys.openrouter);
    localStorage.setItem('GOOGLE_AI_KEY', apiKeys.google);
    toast.success('Neural Uplink Synchronized');
  };

  return (
    <div className="flex flex-col h-full bg-[#030303]/40 selection:bg-primary/20">
      {/* Settings Navigation */}
      <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between backdrop-blur-3xl">
        <div className="flex items-center gap-6">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Core Settings</h2>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Hardware ID: CTX-99-X-DELTA</p>
          </div>
        </div>

        <div className="flex gap-2 p-1 rounded-2xl bg-white/5 border border-white/5">
          {[
            { id: 'visual', label: 'Visual Interface', icon: Palette },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'uplink', label: 'Neural Uplink', icon: Globe },
            { id: 'profile', label: 'Neural Profile', icon: User }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all ${
                activeSubTab === tab.id ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-white/30 hover:text-white'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-12 custom-scrollbar">
        <div className="max-w-4xl mx-auto h-full">
          <AnimatePresence mode="wait">
            {activeSubTab === 'visual' && (
              <motion.div 
                key="visual"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-12"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Slider Section */}
                  <div className="p-8 rounded-[3rem] bg-white/[0.03] border border-white/5 space-y-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs font-bold text-white/70 uppercase">
                        <span>Neural Pulse Intensity</span>
                        <span className="text-primary">{pulseIntensity}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={pulseIntensity}
                        onChange={(e) => setPulseIntensity(parseInt(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>

                  {/* Architecture Section */}
                  <div className="p-8 rounded-[3rem] bg-white/[0.03] border border-white/5 space-y-6">
                    <span className="text-xs font-bold text-white/70 uppercase">Glass Texture Architecture</span>
                    <div className="grid grid-cols-2 gap-3">
                      {['Obsidian', 'Frosted'].map((style) => (
                        <button
                          key={style}
                          onClick={() => setGlassStyle(style.toLowerCase())}
                          className={`py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                            glassStyle === style.toLowerCase() 
                              ? 'bg-primary/20 border-primary text-primary' 
                              : 'bg-white/5 border-white/10 text-white/20 hover:text-white'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSubTab === 'security' && (
              <motion.div 
                key="security"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="p-10 rounded-[3.5rem] bg-white/[0.02] border border-white/5 space-y-8"
              >
                {[
                  { label: 'Biometric Handshake', icon: Eye, enabled: true },
                  { label: 'Encrypted Data Stream', icon: Zap, enabled: true },
                  { label: 'Hardware Acceleration', icon: CpuIcon, enabled: false },
                  { label: 'System Notifications', icon: Bell, enabled: true },
                ].map((setting) => (
                  <div key={setting.label} className="flex items-center justify-between group p-4 rounded-2xl hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-5">
                      <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <setting.icon className="w-5 h-5 text-white/30 group-hover:text-primary" />
                      </div>
                      <span className="text-sm font-bold text-white/60 tracking-tight">{setting.label}</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-all cursor-pointer ${setting.enabled ? 'bg-primary/40' : 'bg-white/10'}`}>
                      <div className={`w-4 h-4 rounded-full shadow-lg transition-all ${setting.enabled ? 'translate-x-6 bg-primary shadow-primary/40' : 'bg-white/20'}`} />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeSubTab === 'uplink' && (
              <motion.div 
                key="uplink"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-10"
              >
                <div className="p-10 rounded-[3.5rem] bg-white/[0.03] border border-white/5 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                      <Globe className="w-32 h-32 text-primary" />
                   </div>
                   <div className="space-y-8 relative z-10">
                      {[
                        { id: 'tavily', name: 'Tavily Search API', desc: 'Required for real-time web crawling' },
                        { id: 'groq', name: 'Groq Cloud Key', desc: 'Enabling ultra-low latency Llama-3 nodes' },
                        { id: 'openrouter', name: 'OpenRouter Key', desc: 'Unified access to Claude, GPT-4, and Gemini' },
                        { id: 'google', name: 'Google Gemini Pro', desc: 'Primary multimodal reasoning engine' }
                      ].map((field) => (
                        <div key={field.id} className="space-y-3">
                           <div className="flex items-center justify-between px-1">
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">{field.name}</label>
                              <span className="text-[8px] font-mono text-primary/40 italic">{field.desc}</span>
                           </div>
                           <div className="relative group/input">
                              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within/input:text-primary transition-colors" />
                              <input 
                                type="password"
                                value={(apiKeys as any)[field.id]}
                                onChange={(e) => setApiKeys({ ...apiKeys, [field.id]: e.target.value })}
                                placeholder={`Enter valid MISSION_KEY for ${field.id.toUpperCase()}...`}
                                className="w-full h-12 bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 text-xs font-bold text-white placeholder:text-white/10 outline-none focus:border-primary/40 group-hover/input:border-white/10 transition-all font-mono"
                              />
                           </div>
                        </div>
                      ))}
                      <div className="pt-6">
                         <button 
                            onClick={saveKeys}
                            className="w-full h-14 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                         >
                            <Database className="w-4 h-4" />
                            Synchronize Mission Credentials
                         </button>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {activeSubTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-10"
              >
                <div className="p-10 rounded-[3.5rem] bg-white/[0.03] border border-white/5 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                      <User className="w-48 h-48 text-primary" />
                   </div>
                   <div className="relative z-10 space-y-8">
                     <div className="flex items-center gap-6">
                       <div className="w-20 h-20 rounded-3xl bg-primary/20 border border-primary/40 flex items-center justify-center shadow-inner">
                         <User className="w-10 h-10 text-primary" />
                       </div>
                       <div>
                         <h3 className="text-2xl font-black text-white tracking-tight uppercase">{user?.email?.split('@')[0] || 'Unknown Subject'}</h3>
                         <p className="text-xs font-black text-primary uppercase tracking-[0.3em]">Identity Node: {user?.id || 'CTX-99'}</p>
                       </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                         <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Primary Email</span>
                         <p className="text-sm font-bold text-white/80">{user?.email || 'guest@cortexos.ai'}</p>
                       </div>
                       <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                         <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Permission Level</span>
                         <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest">{user?.is_admin ? 'Directorship (Admin)' : 'Intelligence Officer'}</p>
                       </div>
                     </div>

                     <div className="pt-6 border-t border-white/5">
                        <button 
                           onClick={() => {
                             toast.promise(Promise.resolve(signOut()), {
                               loading: 'Terminating Neural Link...',
                               success: 'Session Purged Successfully',
                               error: 'Termination Error'
                             });
                           }}
                           className="w-full h-14 rounded-2xl bg-red-500 text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-red-500/20 hover:bg-red-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                           <LogOut className="w-4 h-4" />
                           Terminate System Session
                        </button>
                     </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
