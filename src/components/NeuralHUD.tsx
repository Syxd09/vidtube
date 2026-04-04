import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Shield, 
  Globe, 
  Cpu, 
  Zap, 
  Radio, 
  Terminal,
  Power,
  RotateCcw
} from 'lucide-react';
import { useWindows } from '@/context/WindowContext';

export default function NeuralHUD() {
  const [pulse, setPulse] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const { closeAllWindows } = useWindows();

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => (p + 1) % 100);
      if (Math.random() > 0.7) {
        const newLog = `NODE_${Math.floor(Math.random() * 999)} // ${['SYNC', 'ENCRYPT', 'SCAN', 'UPLINK'][Math.floor(Math.random() * 4)]} // OK`;
        setLogs(prev => [newLog, ...prev].slice(0, 5));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-8 w-64 h-full py-8 pr-6 pointer-events-auto">
      {/* System Pulse */}
      <div className="space-y-3 pt-6">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Neural Pulse</span>
          <span className="text-[10px] font-black text-primary uppercase">{pulse}%</span>
        </div>
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary shadow-[0_0_10px_#3b82f6]"
            animate={{ width: `${pulse}%` }}
          />
        </div>
      </div>

      {/* Security Status */}
      <div className="p-5 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-wider">Firewall // Active</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
            {[
                { icon: Radio, label: 'Uplink' },
                { icon: Globe, label: 'Proxy' }
            ].map(item => (
                <div key={item.label} className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center gap-1">
                    <item.icon className="w-3 h-3 text-white/20" />
                    <span className="text-[8px] font-black text-white/40 uppercase">{item.label}</span>
                </div>
            ))}
        </div>
      </div>

      {/* Live Log Stream */}
      <div className="flex-1 flex flex-col gap-3 min-h-0">
        <div className="flex items-center gap-2 px-2">
            <Terminal className="w-3 h-3 text-white/20" />
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Tactical Feed</span>
        </div>
        <div className="flex-1 overflow-hidden space-y-2 font-mono">
            {logs.map((log, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[9px] text-white/30 truncate"
                >
                    <span className="text-primary italic">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span> {log}
                </motion.div>
            ))}
        </div>
      </div>

      {/* Resource Clusters */}
      <div className="space-y-4">
         {[
             { label: 'Neural Compute', value: 42, color: 'bg-primary' },
             { label: 'Cluster Load', value: 78, color: 'bg-accent' }
         ].map(stat => (
             <div key={stat.label} className="space-y-2">
                 <div className="flex justify-between text-[8px] font-black text-white/20 uppercase tracking-widest">
                     <span>{stat.label}</span>
                     <span>{stat.value}%</span>
                 </div>
                 <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                         className={`h-full ${stat.color}`}
                         animate={{ width: `${stat.value}%` }}
                         transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
                     />
                 </div>
             </div>
         ))}
      </div>

      {/* Emergency Node: Zero-State Wipe (Relocated to bottom to avoid Chronometer overlap) */}
      <div className="pt-4 border-t border-white/5">
        <button 
          onClick={closeAllWindows}
          className="w-full flex items-center justify-between p-4 rounded-[1.5rem] bg-red-500/10 border border-red-500/20 group hover:bg-red-500/20 hover:border-red-500/40 transition-all shadow-lg shadow-red-500/5"
        >
          <div className="flex flex-col items-start gap-1">
             <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Zero-State Wipe</span>
             <span className="text-[8px] font-black text-red-500/40 uppercase">Neural Reset Protocol</span>
          </div>
          <motion.div 
            whileHover={{ rotate: -180 }}
            className="p-2 rounded-xl bg-red-500/20 text-red-500"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </motion.div>
        </button>
      </div>
    </div>
  );
}
