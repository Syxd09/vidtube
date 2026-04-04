import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, Database, Network, Zap, Shield, Globe } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState({
    cpu: 24,
    neural: 42,
    memory: 1.2,
    network: 856,
    activeNodes: 12
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpu: Math.min(100, Math.max(10, prev.cpu + (Math.random() * 6 - 3))),
        neural: Math.min(100, Math.max(20, prev.neural + (Math.random() * 4 - 2))),
        memory: Math.min(16, Math.max(0.5, prev.memory + (Math.random() * 0.1 - 0.05))),
        network: Math.max(100, prev.network + Math.floor(Math.random() * 100 - 50)),
        activeNodes: Math.max(4, prev.activeNodes + (Math.random() > 0.8 ? 1 : 0) - (Math.random() > 0.8 ? 1 : 0))
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 space-y-8 bg-[#030303]/40 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">System Analytics</h2>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Real-time Neural Telemetry // Node_Alpha</p>
        </div>
        <div className="flex gap-2">
            <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest animate-pulse">
                Live Feed
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Neural Load', value: `${metrics.neural.toFixed(1)}%`, icon: Zap, color: 'text-primary' },
          { label: 'CPU Cluster', value: `${metrics.cpu.toFixed(1)}%`, icon: Cpu, color: 'text-emerald-500' },
          { label: 'System Memory', value: `${metrics.memory.toFixed(1)} GB`, icon: Database, color: 'text-amber-500' },
          { label: 'Network Loop', value: `${metrics.network} Mb/s`, icon: Network, color: 'text-purple-500' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{stat.label}</span>
            </div>
            <p className="text-3xl font-black text-white tracking-tighter tabular-nums">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 rounded-[3rem] bg-white/[0.03] border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
             <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Neural Activity History</h3>
             <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="h-48 flex items-end gap-2">
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${20 + Math.random() * 80}%` }}
                className="flex-1 bg-primary/20 rounded-t-sm relative group/bar"
              >
                <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="p-8 rounded-[3rem] bg-white/[0.03] border border-white/5 space-y-8">
          <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Active Security Nodes</h3>
          <div className="space-y-6">
            {[
              { label: 'Identity Encryption', status: 'Active', icon: Shield, color: 'text-emerald-500' },
              { label: 'Global Proxies', status: '12 Online', icon: Globe, color: 'text-primary' },
              { label: 'Neural Firewall', status: 'Locked', icon: Zap, color: 'text-amber-500' }
            ].map((node) => (
              <div key={node.label} className="flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-white/5">
                  <node.icon className={`w-4 h-4 ${node.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-tight">{node.label}</p>
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">{node.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
